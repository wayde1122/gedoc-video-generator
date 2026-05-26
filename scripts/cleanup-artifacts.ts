import fs from 'node:fs/promises';
import path from 'node:path';
import {readBooleanEnv} from './lib/env';
import {assertInsideRoot, documentPagesDir, outDir, publicDir, publicVoiceDir, publicVoicePath} from './lib/paths';

const targets = [publicVoiceDir, publicVoicePath, documentPagesDir, path.join(outDir, 'voice')];

if (readBooleanEnv('KEEP_ARTIFACTS')) {
  console.log('KEEP_ARTIFACTS is enabled. Skipping cleanup.');
  process.exit(0);
}

for (const target of targets) {
  assertInsideRoot(target);
  await fs.rm(target, {recursive: true, force: true});
}

await fs.mkdir(outDir, {recursive: true});
await fs.mkdir(publicDir, {recursive: true});

console.log('Cleaned generated intermediate artifacts.');
