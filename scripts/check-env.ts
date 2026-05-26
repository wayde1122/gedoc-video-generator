import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {envPath, hasProjectEnv, loadProjectEnv, requireEnv, validatePositiveNumberEnv} from './lib/env';
import {defaultVideoOutputPath, docsDir, outDir, resolveFromCwd, rootDir} from './lib/paths';

const execFileAsync = promisify(execFile);
loadProjectEnv();

type CheckLevel = 'ok' | 'warn' | 'error';

type CheckResult = {
  level: CheckLevel;
  message: string;
};

const results: CheckResult[] = [];

const ok = (message: string) => results.push({level: 'ok', message});
const warn = (message: string) => results.push({level: 'warn', message});
const error = (message: string) => results.push({level: 'error', message});

const commandCandidates = (command: string) => {
  if (process.platform !== 'win32' || /\.(bat|cmd|exe)$/i.test(command)) {
    return [command];
  }

  return [command, `${command}.cmd`, `${command}.CMD`, `${command}.exe`];
};

const commandExists = async (command: string, args: string[]) => {
  for (const candidate of commandCandidates(command)) {
    try {
      await execFileAsync(candidate, args, {windowsHide: true, timeout: 10000});
      return true;
    } catch {
      // Try the next platform-specific command candidate.
    }
  }

  return false;
};

const hasSupportedDocument = async () => {
  try {
    const entries = await fs.readdir(docsDir, {withFileTypes: true});
    return entries.some((entry) => entry.isFile() && ['.pdf', '.pptx'].includes(path.extname(entry.name).toLowerCase()));
  } catch {
    return false;
  }
};

const hasPptxDocument = async () => {
  try {
    const entries = await fs.readdir(docsDir, {withFileTypes: true});
    return entries.some((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.pptx');
  } catch {
    return false;
  }
};

const checkWritableDirectory = async (directory: string) => {
  await fs.mkdir(directory, {recursive: true});
  const probePath = path.join(directory, `.env-check-${process.pid}.tmp`);
  await fs.writeFile(probePath, 'ok', 'utf8');
  await fs.rm(probePath, {force: true});
};

if (hasProjectEnv()) {
  ok(`Loaded environment from ${envPath}`);
} else {
  warn('No .env file found. Copy .env.example to .env before generating courses or online voiceover.');
}

const nodeOk = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10) >= 20;
if (nodeOk) {
  ok(`Node.js ${process.versions.node} is supported.`);
} else {
  error(`Node.js ${process.versions.node} detected. Use Node.js 20 or newer.`);
}

const runningUnderPnpm = process.env.npm_config_user_agent?.includes('pnpm') ?? false;
if (runningUnderPnpm || (await commandExists('pnpm', ['--version']))) {
  ok('pnpm is available.');
} else {
  warn('pnpm was not found on PATH. Install pnpm before running project scripts.');
}

for (const validation of [
  validatePositiveNumberEnv('OPENAI_REQUEST_TIMEOUT_MS', 20000),
  validatePositiveNumberEnv('DOCUMENT_PAGE_SECONDS', 6),
  validatePositiveNumberEnv('VOICE_AUDIO_MODEL_RETRIES', 3),
  validatePositiveNumberEnv('VOICE_SLIDE_GAP_SECONDS', 0.35),
  validatePositiveNumberEnv('DASHSCOPE_TTS_SAMPLE_RATE', 24000),
  validatePositiveNumberEnv('DASHSCOPE_TTS_TIMEOUT_MS', 120000),
]) {
  if (validation) {
    error(validation);
  }
}

if (requireEnv('OPENAI_API_KEY')) {
  ok('OPENAI_API_KEY is set.');
} else {
  warn('OPENAI_API_KEY is missing. pnpm run course cannot call an OpenAI-compatible text model.');
}

if (requireEnv('OPENAI_TEXT_MODEL')) {
  ok(`OPENAI_TEXT_MODEL is set to ${process.env.OPENAI_TEXT_MODEL}.`);
} else {
  warn('OPENAI_TEXT_MODEL is missing. Set it to a model supported by your OpenAI-compatible endpoint.');
}

if (process.env.OPENAI_BASE_URL) {
  ok(`OPENAI_BASE_URL is set to ${process.env.OPENAI_BASE_URL}.`);
} else {
  warn('OPENAI_BASE_URL is empty. The OpenAI SDK will use its default endpoint.');
}

const voiceProvider = process.env.VOICE_PROVIDER ?? 'auto';
if (['auto', 'openai-audio', 'dashscope-http'].includes(voiceProvider)) {
  ok(`VOICE_PROVIDER=${voiceProvider}.`);
} else {
  error(`Unsupported VOICE_PROVIDER=${voiceProvider}. Use auto, openai-audio, or dashscope-http.`);
}

if (voiceProvider === 'openai-audio' || voiceProvider === 'auto') {
  if (requireEnv('OPENAI_AUDIO_MODEL')) {
    ok(`OPENAI_AUDIO_MODEL is set to ${process.env.OPENAI_AUDIO_MODEL}.`);
  } else {
    warn('OPENAI_AUDIO_MODEL is missing. OpenAI audio synthesis will be skipped.');
  }
}

if (voiceProvider === 'dashscope-http' || voiceProvider === 'auto') {
  if (requireEnv('DASHSCOPE_API_KEY')) {
    ok('DASHSCOPE_API_KEY is set.');
  } else {
    warn('DASHSCOPE_API_KEY is missing. DashScope HTTP TTS will be skipped or fail if selected.');
  }

  if (requireEnv('DASHSCOPE_TTS_MODEL')) {
    ok(`DASHSCOPE_TTS_MODEL is set to ${process.env.DASHSCOPE_TTS_MODEL}.`);
  } else {
    warn('DASHSCOPE_TTS_MODEL is missing. Defaulting to cosyvoice-v3-flash.');
  }

  if (requireEnv('DASHSCOPE_TTS_VOICE')) {
    ok(`DASHSCOPE_TTS_VOICE is set to ${process.env.DASHSCOPE_TTS_VOICE}.`);
  } else {
    warn('DASHSCOPE_TTS_VOICE is missing. Defaulting to longxiaochun_v3.');
  }

  ok('DashScope HTTP TTS uses Node fetch. No Python SDK is required.');
}

if (await hasSupportedDocument()) {
  ok(`Found at least one supported document in ${docsDir}.`);
} else {
  warn(`No PDF/PPTX found in ${docsDir}. Add one before running pnpm run doc:prepare.`);
}

if (await hasPptxDocument()) {
  const libreOfficeCandidates = [process.env.LIBREOFFICE_PATH, 'soffice', 'libreoffice'].filter(Boolean) as string[];
  const hasLibreOffice = await libreOfficeCandidates.reduce<Promise<boolean>>(async (previous, candidate) => {
    if (await previous) {
      return true;
    }
    return commandExists(candidate, ['--version']);
  }, Promise.resolve(false));

  if (hasLibreOffice) {
    ok('LibreOffice is available for PPTX conversion.');
  } else {
    warn('PPTX input found but LibreOffice was not detected. Install LibreOffice or convert PPTX to PDF manually.');
  }
}

const outputPath = process.env.VIDEO_OUTPUT ? resolveFromCwd(process.env.VIDEO_OUTPUT) : defaultVideoOutputPath;
try {
  await checkWritableDirectory(path.dirname(outputPath));
  ok(`Video output directory is writable: ${path.dirname(outputPath)}`);
} catch (writeError) {
  error(`Video output directory is not writable: ${writeError instanceof Error ? writeError.message : String(writeError)}`);
}

try {
  await checkWritableDirectory(outDir);
  ok(`Artifact directory is writable: ${outDir}`);
} catch (writeError) {
  error(`Artifact directory is not writable: ${writeError instanceof Error ? writeError.message : String(writeError)}`);
}

for (const result of results) {
  const prefix = result.level === 'ok' ? 'OK' : result.level === 'warn' ? 'WARN' : 'ERROR';
  console.log(`[${prefix}] ${result.message}`);
}

const errorCount = results.filter((result) => result.level === 'error').length;
const warningCount = results.filter((result) => result.level === 'warn').length;

console.log(`\nEnvironment check finished with ${errorCount} error(s) and ${warningCount} warning(s).`);

if (errorCount > 0) {
  process.exitCode = 1;
}
