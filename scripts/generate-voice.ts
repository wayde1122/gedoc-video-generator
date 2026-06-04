import fs from 'node:fs/promises';
import path from 'node:path';
import {formatCourseIssues} from '../src/course-validation';
import {renderCourseSchema} from '../src/course-schema';
import type {RenderCourse, Slide} from '../src/course-schema';
import {loadProjectEnv, readBooleanEnv, readNumberEnv} from './lib/env';
import {coursePath, outDir, publicDir, publicVoiceDir} from './lib/paths';
import {selectVoiceProvider} from './voice/provider-registry';

loadProjectEnv();

const outVoiceDir = path.join(outDir, 'voice');
const narrationPath = path.join(outDir, 'narration.txt');

const forceRegenerate = process.argv.includes('--force') || readBooleanEnv('VOICE_FORCE');
const slideAudioGapSeconds = readNumberEnv('VOICE_SLIDE_GAP_SECONDS', 0.35);

const readCourse = async (): Promise<RenderCourse> => {
  const payload = JSON.parse(await fs.readFile(coursePath, 'utf8'));
  const parsed = renderCourseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(`Refusing to generate voice for invalid course.json:\n${formatCourseIssues(parsed.error.issues)}`);
  }
  return parsed.data;
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
  const lastSlide = course.slides[course.slides.length - 1];
  if (lastSlide && lastSlide.end !== nextDurationSeconds) {
    lastSlide.end = nextDurationSeconds;
    changed = true;
  }

  if (course.durationSeconds !== nextDurationSeconds) {
    course.durationSeconds = nextDurationSeconds;
    changed = true;
    console.log(`Synced course duration to ${nextDurationSeconds}s.`);
  }

  return changed;
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

const providerSelection = await selectVoiceProvider(undefined, {env: process.env, tempDir: outDir});
if (providerSelection.mode === 'none') {
  console.log('PROVIDER=none. Skipping segmented audio generation.');
  process.exit(0);
}

const voiceProvider = providerSelection.provider;
console.log(`Using voice provider: ${voiceProvider.label}`);

const narrations = course.slides.map((slide) => slide.caption ?? '').join('\n\n');
const courseContext = [
  course.title,
  'subtitle' in course ? course.subtitle : '',
  course.slides.map((slide) => slide.heading).join(' / '),
  narrations,
]
  .filter(Boolean)
  .join('\n');
await fs.writeFile(narrationPath, narrations, 'utf8');

let courseChanged = false;

for (const [index, slide] of course.slides.entries()) {
  const caption = slide.caption?.trim();
  if (!caption) {
    throw new Error(`Slide ${index + 1} has no caption, so it cannot be synced to narration audio.`);
  }

  const audioSrc = desiredAudioSrc(index);
  const publicVoicePath = path.join(publicDir, audioSrc);
  const outVoicePath = path.join(outDir, audioSrc);
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

  console.log(`Generating voice segment ${index + 1}/${course.slides.length}: ${audioSrc}`);
  const audio = await voiceProvider.synthesize({
    text: narration,
    slideIndex: index,
    outputName: `narration-slide-${String(index + 1).padStart(3, '0')}`,
    courseContext,
  });
  await writeVoice(audio, publicVoicePath, outVoicePath);
}

courseChanged = (await syncSlideTimingToAudio(course)) || courseChanged;
await writeCourseIfChanged(course, courseChanged);
console.log(`Segmented voiceover ready in ${publicVoiceDir}`);
