import fs from 'node:fs/promises';
import path from 'node:path';
import {readBooleanEnv} from './lib/env';
import {assertInsideRoot, documentPagesDir, outDir, publicDir, publicVoiceDir, publicVoicePath} from './lib/paths';

const targets = [
  publicVoiceDir,
  publicVoicePath,
  documentPagesDir,
  path.join(outDir, 'voice'),
  path.join(outDir, 'document-work'),
  path.join(outDir, 'course.generated.json'),
  path.join(outDir, 'course.raw-model-output.txt'),
  path.join(outDir, 'course.raw-model-output.repair.txt'),
  path.join(outDir, 'narration.txt'),
];

if (readBooleanEnv('KEEP_ARTIFACTS')) {
  console.log('KEEP_ARTIFACTS is enabled. Skipping cleanup.');
  process.exit(0);
}

for (const target of targets) {
  assertInsideRoot(target);
  await fs.rm(target, {recursive: true, force: true});
}

const entries = await fs.readdir(outDir, {withFileTypes: true}).catch(() => []);
for (const entry of entries) {
  if (!entry.isFile() || !/^narration-slide-\d+\.txt$/i.test(entry.name)) {
    continue;
  }
  const target = path.join(outDir, entry.name);
  assertInsideRoot(target);
  await fs.rm(target, {force: true});
}

await fs.mkdir(outDir, {recursive: true});
await fs.mkdir(publicDir, {recursive: true});

console.log('Cleaned generated intermediate artifacts. Rendered MP4 files were kept.');
