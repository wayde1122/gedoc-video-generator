import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {formatCourseIssues} from '../src/course-validation';
import {renderCourseSchema} from '../src/course-schema';
import {coursePath, outDir, resolveFromCwd, rootDir, sanitizeFileName} from './lib/paths';
import {loadProjectEnv, readBooleanEnv} from './lib/env';

const execFileAsync = promisify(execFile);
loadProjectEnv();

const remotionBin = path.join(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'remotion.CMD' : 'remotion');
const cleanupScript = path.join(rootDir, 'scripts', 'cleanup-artifacts.ts');
const maxOutputNameLength = 28;

const coursePayload = JSON.parse(await fs.readFile(coursePath, 'utf8'));
const parsedCourse = renderCourseSchema.safeParse(coursePayload);
if (!parsedCourse.success) {
  throw new Error(`Refusing to render invalid course.json:\n${formatCourseIssues(parsedCourse.error.issues)}`);
}

const course = parsedCourse.data;
const defaultOutputName = sanitizeFileName(course.title).slice(0, maxOutputNameLength) || 'video';
const outputPath = process.env.VIDEO_OUTPUT ? resolveFromCwd(process.env.VIDEO_OUTPUT) : path.join(outDir, `${defaultOutputName}.mp4`);

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
