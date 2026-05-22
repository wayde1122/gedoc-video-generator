import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import course from '../course.json' assert {type: 'json'};

const execFileAsync = promisify(execFile);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({path: path.join(rootDir, '.env'), override: true});

const publicDir = path.join(rootDir, 'public');
const outDir = path.join(rootDir, 'out');
const publicVoicePath = path.join(publicDir, 'voice.wav');
const outVoicePath = path.join(outDir, 'voice.wav');
const narrationPath = path.join(outDir, 'narration.txt');

const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL;
const audioModel = process.env.OPENAI_AUDIO_MODEL ?? 'gpt-4o-audio-preview';
const audioVoice = process.env.OPENAI_AUDIO_VOICE ?? 'alloy';

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is missing. Put it in .env or set it in PowerShell before running.');
}

const narration = course.slides
  .map((slide, index) => `第 ${index + 1} 段。${slide.caption}`)
  .join('\n\n');

const openai = new OpenAI({apiKey, baseURL});

type TtsAttempt = {
  model: string;
  voice: string;
  instructions?: string;
};

const ttsFallbacks: TtsAttempt[] = [
  {
    model: process.env.OPENAI_TTS_FALLBACK_MODEL ?? 'tts-1',
    voice: process.env.OPENAI_TTS_FALLBACK_VOICE ?? 'nova',
    instructions: '请使用自然、清晰、稍慢的普通话讲课风格，面向零基础成人，语气稳定亲切，不要夸张。',
  },
];

await fs.mkdir(publicDir, {recursive: true});
await fs.mkdir(outDir, {recursive: true});
await fs.writeFile(narrationPath, narration, 'utf8');

const writeVoice = async (audioBuffer: Buffer) => {
  await fs.writeFile(publicVoicePath, audioBuffer);
  await fs.writeFile(outVoicePath, audioBuffer);
};

let lastError: unknown = null;

console.log(`Generating voiceover with audio model ${audioModel} and voice ${audioVoice}...`);

try {
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

  await writeVoice(Buffer.from(audioData, 'base64'));
  console.log(`Audio-model voiceover written to ${publicVoicePath}`);
  process.exit(0);
} catch (error) {
  lastError = error;
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`Audio model attempt failed for ${audioModel}: ${message}`);
}

for (const attempt of ttsFallbacks) {
  try {
    console.log(`Trying speech fallback model ${attempt.model} with voice ${attempt.voice}...`);
    const response = await openai.audio.speech.create({
      model: attempt.model,
      voice: attempt.voice,
      input: narration,
      ...(attempt.instructions ? {instructions: attempt.instructions} : {}),
      response_format: 'wav',
    });
    await writeVoice(Buffer.from(await response.arrayBuffer()));
    console.log(`Speech fallback voiceover written to ${publicVoicePath}`);
    process.exit(0);
  } catch (error) {
    lastError = error;
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Speech fallback failed for ${attempt.model}: ${message}`);
  }
}

console.warn(`Online voice generation failed. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
console.warn('Falling back to Windows zh-CN speech synthesis.');

const psScript = `
  Add-Type -AssemblyName System.Speech
  $text = Get-Content -Raw -Encoding UTF8 '${narrationPath.replaceAll("'", "''")}'
  $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $voice = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -eq 'zh-CN' } | Select-Object -First 1
  if ($null -eq $voice) { throw 'No zh-CN Windows speech voice is installed.' }
  $synth.SelectVoice($voice.VoiceInfo.Name)
  $synth.Rate = -1
  $synth.Volume = 100
  $synth.SetOutputToWaveFile('${publicVoicePath.replaceAll("'", "''")}')
  $synth.Speak($text)
  $synth.Dispose()
`;

await execFileAsync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', psScript], {
  windowsHide: true,
});
await fs.copyFile(publicVoicePath, outVoicePath);

console.log(`Windows voiceover written to ${publicVoicePath}`);
