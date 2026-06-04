import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {envPath, hasProjectEnv, loadProjectEnv, requireEnv, validatePositiveNumberEnv} from './lib/env';
import {defaultVideoOutputPath, docsDir, outDir, resolveFromCwd, rootDir} from './lib/paths';
import {
  getGenericApiKey,
  getGenericBaseUrl,
  getGenericModel,
  getGenericSpeed,
  getGenericTimeoutMs,
  getGenericVoice,
  getVoiceSpeed,
} from './voice/config';
import {normalizeVoiceProviderKeyword} from './voice/provider-registry';

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
  validatePositiveNumberEnv('VOICE_SLIDE_GAP_SECONDS', 0.35),
  validatePositiveNumberEnv('VOICE_SPEED', 1.15),
  validatePositiveNumberEnv('MODEL_TTS_TIMEOUT_MS', 120000),
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

let voiceProvider: ReturnType<typeof normalizeVoiceProviderKeyword> = 'none';
try {
  voiceProvider = normalizeVoiceProviderKeyword(process.env.PROVIDER ?? process.env.VOICE_PROVIDER);
  ok(`PROVIDER=${voiceProvider}.`);
} catch (providerError) {
  error(providerError instanceof Error ? providerError.message : String(providerError));
}

if (voiceProvider === 'openai' || voiceProvider === 'openai-audio') {
  if (getGenericModel(process.env)) {
    ok(`OpenAI audio model is set to ${getGenericModel(process.env)}.`);
  } else {
    error('MODEL is missing but PROVIDER selects OpenAI audio synthesis.');
  }

  if (getGenericApiKey(process.env)) {
    ok('MODE_API_KEY is available for OpenAI audio synthesis.');
  } else {
    error('MODE_API_KEY is missing but PROVIDER selects OpenAI audio synthesis.');
  }

  if (getGenericBaseUrl(process.env)) {
    ok(`OpenAI audio base URL is set to ${getGenericBaseUrl(process.env)}.`);
  } else {
    warn('BASE_URL is missing. Defaulting to https://api.openai.com/v1.');
  }
}

if (voiceProvider !== 'none') {
  ok(`VOICE_SPEED=${getVoiceSpeed(process.env)}${getGenericSpeed(process.env) ? '' : ' (default)'}.`);
}

if (voiceProvider === 'dashscope' || voiceProvider === 'dashscope-http') {
  if (getGenericApiKey(process.env)) {
    ok('MODE_API_KEY is set.');
  } else {
    error('MODE_API_KEY is missing but PROVIDER selects DashScope HTTP TTS.');
  }

  if (getGenericBaseUrl(process.env)) {
    ok(`DashScope base URL is set to ${getGenericBaseUrl(process.env)}.`);
  } else {
    warn('BASE_URL is missing. Defaulting to https://api.dashscope.com/v1.');
  }

  if (getGenericModel(process.env)) {
    ok(`DashScope TTS model is set to ${getGenericModel(process.env)}.`);
  } else {
    warn('MODEL is missing. Defaulting to cosyvoice-v3-flash.');
  }

  if (getGenericVoice(process.env)) {
    ok(`DashScope TTS voice is set to ${getGenericVoice(process.env)}.`);
  } else {
    warn('MODEL_VOICE is missing. Defaulting to longxiaochun_v3.');
  }

  ok('DashScope HTTP TTS uses Node fetch. No Python SDK is required.');
}

if (voiceProvider === 'xiaomi' || voiceProvider === 'xiaomi-mimo') {
  if (getGenericApiKey(process.env)) {
    ok('MODE_API_KEY is set.');
  } else {
    error('MODE_API_KEY is missing but PROVIDER selects Xiaomi MiMo TTS.');
  }

  if (getGenericBaseUrl(process.env)) {
    ok(`Xiaomi MiMo base URL is set to ${getGenericBaseUrl(process.env)}.`);
  } else {
    warn('BASE_URL is missing. Defaulting to https://api.xiaomimimo.com/v1.');
  }

  if (getGenericModel(process.env)) {
    ok(`Xiaomi MiMo TTS model is set to ${getGenericModel(process.env)}.`);
  } else {
    warn('MODEL is missing. Defaulting to mimo-v2.5-tts.');
  }

  if (getGenericVoice(process.env)) {
    ok(`Xiaomi MiMo TTS voice is set to ${getGenericVoice(process.env)}.`);
  } else {
    warn('MODEL_VOICE is missing. Defaulting to mimo_default.');
  }

  if (getGenericTimeoutMs(process.env)) {
    ok(`Xiaomi MiMo timeout is set to ${getGenericTimeoutMs(process.env)}ms.`);
  }
}

if (voiceProvider === 'windows' || voiceProvider === 'windows-speech') {
  if (process.platform === 'win32') {
    ok('Windows speech synthesis can run on this platform.');
  } else {
    error('PROVIDER selects Windows speech, but this platform is not Windows.');
  }
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
