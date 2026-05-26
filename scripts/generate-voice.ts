import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import OpenAI from 'openai';
import type {RenderCourse, Slide} from '../src/course-schema';
import {synthesizeDashScopeHttpTts} from './dashscope-http-tts';
import {loadProjectEnv, readBooleanEnv, readNumberEnv} from './lib/env';
import {coursePath, outDir, publicDir, publicVoiceDir, rootDir} from './lib/paths';

const execFileAsync = promisify(execFile);
loadProjectEnv();

const outVoiceDir = path.join(outDir, 'voice');
const narrationPath = path.join(outDir, 'narration.txt');

const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL;
const audioModel = process.env.OPENAI_AUDIO_MODEL;
const audioVoice = process.env.OPENAI_AUDIO_VOICE ?? 'alloy';
const voiceProvider = process.env.VOICE_PROVIDER ?? 'auto';
const forceRegenerate = process.argv.includes('--force') || readBooleanEnv('VOICE_FORCE');
const requireAudioModel = voiceProvider === 'openai-audio' && readBooleanEnv('VOICE_REQUIRE_AUDIO_MODEL');
const audioModelRetries = readNumberEnv('VOICE_AUDIO_MODEL_RETRIES', 3);
const requestTimeoutMs = readNumberEnv('OPENAI_REQUEST_TIMEOUT_MS', 20000);
const dashScopeModel = process.env.DASHSCOPE_TTS_MODEL ?? 'cosyvoice-v3-flash';
const dashScopeVoice = process.env.DASHSCOPE_TTS_VOICE ?? 'longxiaochun_v3';
const dashScopeSampleRate = readNumberEnv('DASHSCOPE_TTS_SAMPLE_RATE', 24000);
const dashScopeTimeoutMs = readNumberEnv('DASHSCOPE_TTS_TIMEOUT_MS', 120000);
const slideAudioGapSeconds = readNumberEnv('VOICE_SLIDE_GAP_SECONDS', 0.35);

type TtsAttempt = {
  model: string;
  voice: string;
  instructions?: string;
};

const ttsFallbacks: TtsAttempt[] = process.env.OPENAI_TTS_FALLBACK_MODEL
  ? [
      {
        model: process.env.OPENAI_TTS_FALLBACK_MODEL,
        voice: process.env.OPENAI_TTS_FALLBACK_VOICE ?? 'nova',
        instructions: '请使用自然、清晰、稍慢的普通话讲课风格，面向零基础成人，语气稳定亲切，不要夸张。',
      },
    ]
  : [];

const readCourse = async (): Promise<RenderCourse> => {
  const payload = JSON.parse(await fs.readFile(coursePath, 'utf8')) as RenderCourse;
  if (!Array.isArray(payload.slides)) {
    throw new Error('course.json must include a slides array.');
  }
  return payload;
};

const writeCourseIfChanged = async (course: RenderCourse, changed: boolean) => {
  if (!changed) {
    return;
  }

  await fs.writeFile(coursePath, `${JSON.stringify(course, null, 2)}\n`, 'utf8');
  console.log('course.json updated with segmented audioSrc values.');
};

const desiredAudioSrc = (index: number) => `voice/slide-${String(index + 1).padStart(3, '0')}.wav`;

const getAudioSrc = (slide: Slide) => ('audioSrc' in slide ? slide.audioSrc : undefined);
const setAudioSrc = (slide: Slide, audioSrc: string) => {
  if (slide.kind !== 'document') {
    slide.audioSrc = audioSrc;
  }
};

const writeVoice = async (audioBuffer: Buffer, publicPath: string, outPath: string) => {
  await fs.writeFile(publicPath, audioBuffer);
  await fs.writeFile(outPath, audioBuffer);
};

const readWavDurationSeconds = async (filePath: string): Promise<number> => {
  const buffer = await fs.readFile(filePath);
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error(`Unsupported audio format, expected WAV: ${filePath}`);
  }

  let offset = 12;
  let byteRate: number | null = null;
  let dataSize: number | null = null;

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString('ascii', offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const chunkDataOffset = offset + 8;

    if (chunkId === 'fmt ') {
      byteRate = buffer.readUInt32LE(chunkDataOffset + 8);
    } else if (chunkId === 'data') {
      dataSize = Math.min(chunkSize, buffer.length - chunkDataOffset);
      break;
    }

    offset = chunkDataOffset + chunkSize + (chunkSize % 2);
  }

  if (!byteRate || !dataSize) {
    throw new Error(`Could not read WAV duration: ${filePath}`);
  }

  return dataSize / byteRate;
};

const syncSlideTimingToAudio = async (course: RenderCourse): Promise<boolean> => {
  let cursor = 0;
  let changed = false;

  for (const [index, slide] of course.slides.entries()) {
    const previousStart = slide.start;
    const previousEnd = slide.end;
    const audioSrc = getAudioSrc(slide);

    if (!audioSrc) {
      throw new Error(`Slide ${index + 1} is missing audioSrc after voice generation.`);
    }

    const publicVoicePath = path.join(publicDir, audioSrc);
    if (!(await exists(publicVoicePath))) {
      throw new Error(`Slide ${index + 1} audio file is missing: ${publicVoicePath}`);
    }

    if (course.fps !== 30) {
      course.fps = 30;
      changed = true;
    }

    const audioDurationSeconds = await readWavDurationSeconds(publicVoicePath);
    const audioDurationFrames = Math.ceil(Math.max(1, audioDurationSeconds) * course.fps);
    const gapFrames = Math.ceil(slideAudioGapSeconds * course.fps);
    const durationFrames = audioDurationFrames + gapFrames;

    slide.start = Number((cursor / course.fps).toFixed(3));
    cursor += durationFrames;
    slide.end = Number((cursor / course.fps).toFixed(3));

    if (previousStart !== slide.start || previousEnd !== slide.end) {
      changed = true;
      console.log(
        `Synced slide ${index + 1} timing to audio: ${slide.start.toFixed(2)}s-${slide.end.toFixed(
          2,
        )}s (${audioDurationSeconds.toFixed(2)}s narration)`,
      );
    }
  }

  const nextDurationSeconds = Math.ceil(cursor / course.fps);
  if (course.durationSeconds !== nextDurationSeconds) {
    course.durationSeconds = nextDurationSeconds;
    changed = true;
    console.log(`Synced course duration to ${nextDurationSeconds}s.`);
  }

  return changed;
};

const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const synthesizeWithOpenAI = async (openai: OpenAI, narration: string): Promise<Buffer | null> => {
  let lastError: unknown = null;

  if (!audioModel) {
    console.warn('OPENAI_AUDIO_MODEL is not set. Skipping OpenAI audio model synthesis.');
    return null;
  }

  for (let attempt = 1; attempt <= Math.max(1, audioModelRetries); attempt += 1) {
    try {
      console.log(`Trying primary audio model ${audioModel} with voice ${audioVoice} (${attempt}/${audioModelRetries})...`);
      const completion = await openai.chat.completions.create({
        model: audioModel,
        modalities: ['text', 'audio'],
        audio: {
          voice: audioVoice,
          format: 'wav',
        },
        messages: [
          {
            role: 'system',
            content:
              '你是中文课程旁白。请用自然、清晰、稍慢的普通话朗读用户提供的课程脚本。不要添加、改写或解释内容。',
          },
          {
            role: 'user',
            content: narration,
          },
        ],
      } as never);

      const audioData = (completion.choices[0]?.message as {audio?: {data?: string}} | undefined)?.audio?.data;
      if (!audioData) {
        throw new Error('The audio model response did not include audio.data.');
      }

      console.log(`Primary audio model ${audioModel} returned wav audio.`);
      return Buffer.from(audioData, 'base64');
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Audio model attempt failed for ${audioModel}: ${message}`);
      if (attempt < audioModelRetries) {
        await wait(1500 * attempt);
      }
    }
  }

  if (requireAudioModel) {
    throw new Error(
      `VOICE_REQUIRE_AUDIO_MODEL is enabled, so refusing to fall back after ${audioModel} failed: ${
        lastError instanceof Error ? lastError.message : String(lastError)
      }`,
    );
  }

  for (const attempt of ttsFallbacks) {
    try {
      const response = await openai.audio.speech.create({
        model: attempt.model,
        voice: attempt.voice,
        input: narration,
        ...(attempt.instructions ? {instructions: attempt.instructions} : {}),
        response_format: 'wav',
      });
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Speech fallback failed for ${attempt.model}: ${message}`);
    }
  }

  console.warn(`Online voice generation failed. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
  return null;
};

const synthesizeWithWindows = async (textPath: string, outputPath: string) => {
  const psScript = `
    Add-Type -AssemblyName System.Speech
    $text = Get-Content -Raw -Encoding UTF8 '${textPath.replaceAll("'", "''")}'
    $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
    $voice = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -eq 'zh-CN' } | Select-Object -First 1
    if ($null -eq $voice) { throw 'No zh-CN Windows speech voice is installed.' }
    $synth.SelectVoice($voice.VoiceInfo.Name)
    $synth.Rate = -1
    $synth.Volume = 100
    $synth.SetOutputToWaveFile('${outputPath.replaceAll("'", "''")}')
    $synth.Speak($text)
    $synth.Dispose()
  `;

  await execFileAsync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', psScript], {
    windowsHide: true,
  });
};

const synthesizeWithDashScopeHttpTts = async (textPath: string, publicPath: string, outPath: string) => {
  const dashScopeApiKey = process.env.DASHSCOPE_API_KEY;
  if (!dashScopeApiKey) {
    throw new Error('DASHSCOPE_API_KEY is missing.');
  }

  console.log(`Trying DashScope HTTP TTS model ${dashScopeModel} with voice ${dashScopeVoice}...`);
  const audio = await synthesizeDashScopeHttpTts({
    apiKey: dashScopeApiKey,
    text: await fs.readFile(textPath, 'utf8'),
    model: dashScopeModel,
    voice: dashScopeVoice,
    format: 'wav',
    sampleRate: dashScopeSampleRate,
    timeoutMs: dashScopeTimeoutMs,
  });
  await writeVoice(audio, publicPath, outPath);
};

const exists = async (filePath: string) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const course = await readCourse();

if ('mode' in course && course.mode === 'document') {
  console.log('Document mode does not need voiceover. Skipping segmented audio generation.');
  process.exit(0);
}

await fs.mkdir(publicDir, {recursive: true});
await fs.mkdir(publicVoiceDir, {recursive: true});
await fs.mkdir(outDir, {recursive: true});
await fs.mkdir(outVoiceDir, {recursive: true});

const narrations = course.slides.map((slide) => slide.caption ?? '').join('\n\n');
await fs.writeFile(narrationPath, narrations, 'utf8');

const openai = apiKey ? new OpenAI({apiKey, baseURL, timeout: requestTimeoutMs, maxRetries: 0}) : null;
if (!openai) {
  console.warn('OPENAI_API_KEY is missing. Skipping online voice generation and using Windows zh-CN fallback.');
}

let courseChanged = false;

for (const [index, slide] of course.slides.entries()) {
  const caption = slide.caption?.trim();
  if (!caption) {
    throw new Error(`Slide ${index + 1} has no caption, so it cannot be synced to narration audio.`);
  }

  const audioSrc = desiredAudioSrc(index);
  const publicVoicePath = path.join(publicDir, audioSrc);
  const outVoicePath = path.join(outDir, audioSrc);
  const segmentNarrationPath = path.join(outDir, `narration-slide-${String(index + 1).padStart(3, '0')}.txt`);
  const narration = caption;

  if (getAudioSrc(slide) !== audioSrc) {
    setAudioSrc(slide, audioSrc);
    courseChanged = true;
  }

  if (!forceRegenerate && (await exists(publicVoicePath))) {
    console.log(`Skipping existing voice segment: ${audioSrc}`);
    if (!(await exists(outVoicePath))) {
      await fs.copyFile(publicVoicePath, outVoicePath);
    }
    continue;
  }

  await fs.writeFile(segmentNarrationPath, narration, 'utf8');
  console.log(`Generating voice segment ${index + 1}/${course.slides.length}: ${audioSrc}`);

  if (voiceProvider === 'dashscope-http') {
    await synthesizeWithDashScopeHttpTts(segmentNarrationPath, publicVoicePath, outVoicePath);
    continue;
  }

  if (voiceProvider === 'openai-audio' || voiceProvider === 'auto') {
    const onlineAudio = openai ? await synthesizeWithOpenAI(openai, narration) : null;
    if (onlineAudio) {
      await writeVoice(onlineAudio, publicVoicePath, outVoicePath);
      continue;
    }
  }

  if (voiceProvider === 'auto') {
    try {
      await synthesizeWithDashScopeHttpTts(segmentNarrationPath, publicVoicePath, outVoicePath);
      continue;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`DashScope HTTP TTS fallback failed: ${message}`);
    }
  } else if (voiceProvider !== 'openai-audio') {
    throw new Error(`Unsupported VOICE_PROVIDER: ${voiceProvider}`);
  }

  console.warn(`Falling back to Windows zh-CN speech synthesis for slide ${index + 1}.`);
  await synthesizeWithWindows(segmentNarrationPath, publicVoicePath);
  await fs.copyFile(publicVoicePath, outVoicePath);
}

courseChanged = (await syncSlideTimingToAudio(course)) || courseChanged;
await writeCourseIfChanged(course, courseChanged);
console.log(`Segmented voiceover ready in ${publicVoiceDir}`);
