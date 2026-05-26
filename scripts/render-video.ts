import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {defaultVideoOutputPath, resolveFromCwd, rootDir} from './lib/paths';
import {loadProjectEnv, readBooleanEnv} from './lib/env';

const execFileAsync = promisify(execFile);
loadProjectEnv();

const outputPath = process.env.VIDEO_OUTPUT ? resolveFromCwd(process.env.VIDEO_OUTPUT) : defaultVideoOutputPath;
const remotionBin = path.join(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'remotion.CMD' : 'remotion');
const cleanupScript = path.join(rootDir, 'scripts', 'cleanup-artifacts.ts');

console.log(`Rendering video to ${outputPath}`);
await fs.mkdir(path.dirname(outputPath), {recursive: true});

const args = [
  'render',
  'src/index.tsx',
  'DocVideoGenerator',
  outputPath,
  '--overwrite',
  '--codec=h264',
  '--audio-codec=aac',
  '--crf=20',
];

const command = process.platform === 'win32' ? 'cmd.exe' : remotionBin;
const commandArgs = process.platform === 'win32' ? ['/d', '/s', '/c', remotionBin, ...args] : args;

await execFileAsync(command, commandArgs, {
  cwd: rootDir,
  windowsHide: true,
  maxBuffer: 1024 * 1024 * 10,
});

console.log(`Rendered video to ${outputPath}`);

if (!readBooleanEnv('CLEAN_AFTER_RENDER', true)) {
  console.log('CLEAN_AFTER_RENDER is disabled. Keeping generated artifacts.');
} else {
  const tsxBin = path.join(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.CMD' : 'tsx');
  const cleanupCommand = process.platform === 'win32' ? 'cmd.exe' : tsxBin;
  const cleanupArgs = process.platform === 'win32' ? ['/d', '/s', '/c', tsxBin, cleanupScript] : [cleanupScript];
  await execFileAsync(cleanupCommand, cleanupArgs, {
    cwd: rootDir,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 10,
  });
}
