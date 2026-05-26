import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const coursePath = path.join(rootDir, 'course.json');
export const inputDir = path.join(rootDir, 'input');
export const docsDir = path.join(inputDir, 'docs');
export const outDir = path.join(rootDir, 'out');
export const publicDir = path.join(rootDir, 'public');
export const publicVoiceDir = path.join(publicDir, 'voice');
export const publicVoicePath = path.join(publicDir, 'voice.wav');
export const documentPagesDir = path.join(publicDir, 'document-pages');
export const defaultVideoOutputPath = path.join(outDir, 'doc-video-generator.mp4');

export const assertInsideRoot = (target: string) => {
  const resolvedTarget = path.resolve(target);
  const relative = path.relative(rootDir, resolvedTarget);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to access outside project directory: ${target}`);
  }
};

export const resolveFromCwd = (value: string) => path.resolve(process.cwd(), value);

export const ensureInsideRoot = async (target: string) => {
  assertInsideRoot(target);
  await fs.mkdir(path.dirname(target), {recursive: true});
};
