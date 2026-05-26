import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadProjectEnv, readNumberEnv} from './lib/env';

export type DashScopeHttpTtsOptions = {
  apiKey: string;
  text: string;
  model: string;
  voice: string;
  format?: 'wav' | 'mp3' | 'pcm';
  sampleRate?: number;
  timeoutMs?: number;
};

type DashScopeHttpResponse = {
  output?: {
    audio?: {
      url?: string;
    };
  };
  code?: string;
  message?: string;
  request_id?: string;
};

const endpoint = 'https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer';

const parseArgs = (argv: string[]) => {
  const values = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) {
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      throw new Error(`Missing value for ${arg}`);
    }

    values.set(arg.slice(2), next);
    index += 1;
  }

  return values;
};

const fetchWithTimeout = async (url: string, init: RequestInit, timeoutMs: number) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {...init, signal: controller.signal});
  } finally {
    clearTimeout(timeout);
  }
};

const readErrorBody = async (response: Response) => {
  try {
    return await response.text();
  } catch {
    return '';
  }
};

export const synthesizeDashScopeHttpTts = async ({
  apiKey,
  text,
  model,
  voice,
  format = 'wav',
  sampleRate = 24000,
  timeoutMs = 120000,
}: DashScopeHttpTtsOptions): Promise<Buffer> => {
  const trimmedText = text.trim();
  if (!apiKey) {
    throw new Error('DASHSCOPE_API_KEY is missing.');
  }

  if (!trimmedText) {
    throw new Error('DashScope TTS text is empty.');
  }

  if (!model) {
    throw new Error('DASHSCOPE_TTS_MODEL is missing.');
  }

  if (!voice) {
    throw new Error('DASHSCOPE_TTS_VOICE is missing.');
  }

  const response = await fetchWithTimeout(
    endpoint,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: {
          text: trimmedText,
          voice,
          format,
          sample_rate: sampleRate,
        },
      }),
    },
    timeoutMs,
  );

  if (!response.ok) {
    throw new Error(`DashScope HTTP TTS failed: ${response.status} ${response.statusText} ${await readErrorBody(response)}`.trim());
  }

  const payload = (await response.json()) as DashScopeHttpResponse;
  if (payload.code) {
    throw new Error(`DashScope HTTP TTS failed: ${payload.code} ${payload.message ?? ''}`.trim());
  }

  const audioUrl = payload.output?.audio?.url;
  if (!audioUrl) {
    throw new Error(`DashScope HTTP TTS returned no audio URL. request_id=${payload.request_id ?? 'unknown'}`);
  }

  const audioResponse = await fetchWithTimeout(audioUrl, {method: 'GET'}, timeoutMs);
  if (!audioResponse.ok) {
    throw new Error(
      `Failed to download DashScope TTS audio: ${audioResponse.status} ${audioResponse.statusText} ${await readErrorBody(
        audioResponse,
      )}`.trim(),
    );
  }

  const audio = Buffer.from(await audioResponse.arrayBuffer());
  if (audio.length === 0) {
    throw new Error('DashScope HTTP TTS returned empty audio data.');
  }

  return audio;
};

const isMainModule = () => {
  const entry = process.argv[1];
  return Boolean(entry && path.resolve(entry) === fileURLToPath(import.meta.url));
};

if (isMainModule()) {
  loadProjectEnv();
  const args = parseArgs(process.argv.slice(2));
  const textFile = args.get('text-file');
  const output = args.get('output');
  const model = args.get('model') ?? process.env.DASHSCOPE_TTS_MODEL ?? 'cosyvoice-v3-flash';
  const voice = args.get('voice') ?? process.env.DASHSCOPE_TTS_VOICE ?? 'longxiaochun_v3';
  const format = (args.get('format') ?? 'wav') as DashScopeHttpTtsOptions['format'];
  const sampleRate = Number(args.get('sample-rate') ?? process.env.DASHSCOPE_TTS_SAMPLE_RATE ?? 24000);
  const timeoutMs = readNumberEnv('DASHSCOPE_TTS_TIMEOUT_MS', 120000);

  if (!textFile) {
    throw new Error('--text-file is required.');
  }

  if (!output) {
    throw new Error('--output is required.');
  }

  const audio = await synthesizeDashScopeHttpTts({
    apiKey: process.env.DASHSCOPE_API_KEY ?? '',
    text: await fs.readFile(textFile, 'utf8'),
    model,
    voice,
    format,
    sampleRate,
    timeoutMs,
  });

  await fs.mkdir(path.dirname(output), {recursive: true});
  await fs.writeFile(output, audio);
  console.log(`DashScope HTTP TTS wrote ${output} (${audio.length} bytes)`);
}
