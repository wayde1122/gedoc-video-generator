import {
  describeVoiceSpeed,
  getGenericApiKey,
  getGenericBaseUrl,
  getGenericModel,
  getGenericTimeoutMs,
  getGenericVoice,
  getNumberEnv,
  getVoiceSpeed,
} from '../config';
import type {VoiceProvider, VoiceProviderContext, VoiceRequest} from '../types';

type XiaomiMimoResponse = {
  choices?: Array<{
    message?: {
      audio?: {
        data?: string;
      };
    };
  }>;
  error?: {
    message?: string;
    code?: string;
  };
};

const automaticVoiceValue = 'auto';

const includesAny = (text: string, keywords: string[]) => keywords.some((keyword) => text.includes(keyword));

export const selectXiaomiMimoVoiceForCourse = (courseContext: string) => {
  const normalized = courseContext.toLowerCase();

  if (includesAny(normalized, ['english', '英语', '英文', '单词', '口语', 'listening', 'speaking'])) {
    return 'Chloe';
  }

  if (includesAny(normalized, ['儿童', '小朋友', '童话', '绘本', '亲子', '儿歌', '启蒙'])) {
    return '茉莉';
  }

  if (includesAny(normalized, ['古诗', '语文', '文学', '历史', '人文', '诗', '赏析', '文化'])) {
    return '冰糖';
  }

  if (includesAny(normalized, ['技术', '编程', '代码', 'api', 'ai', 'agent', '架构', '工程', '开发', '模型'])) {
    return '白桦';
  }

  if (includesAny(normalized, ['商业', '增长', '管理', '产品', '汇报', '战略', '营销', '销售', '职场'])) {
    return '苏打';
  }

  return 'mimo_default';
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

export const createXiaomiMimoProvider = ({env}: VoiceProviderContext): VoiceProvider => {
  const apiKey = getGenericApiKey(env);
  const baseUrl = (getGenericBaseUrl(env) ?? 'https://api.xiaomimimo.com/v1').replace(/\/$/, '');
  const model = getGenericModel(env) ?? 'mimo-v2.5-tts';
  const configuredVoice = getGenericVoice(env) ?? 'mimo_default';
  const speed = getVoiceSpeed(env);
  const stylePrompt = `${describeVoiceSpeed(speed)}的中文课程旁白，目标语速约为正常语速的 ${speed} 倍，语气稳定亲切，不要添加、改写或解释文本。`;
  const timeoutMs = getNumberEnv(getGenericTimeoutMs(env), 120000);
  let resolvedAutoVoice: string | null = null;

  return {
    id: 'xiaomi-mimo',
    label: 'Xiaomi MiMo TTS',
    async isAvailable() {
      return Boolean(apiKey);
    },
    async synthesize({text, courseContext}: VoiceRequest) {
      if (!apiKey) {
        throw new Error('MODE_API_KEY is missing.');
      }

      const voice =
        configuredVoice.toLowerCase() === automaticVoiceValue
          ? (resolvedAutoVoice ??= selectXiaomiMimoVoiceForCourse(courseContext ?? text))
          : configuredVoice;

      console.log(`Trying Xiaomi MiMo TTS model ${model} with voice ${voice} at ${speed}x speed...`);
      const response = await fetchWithTimeout(
        `${baseUrl}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'user',
                content: stylePrompt,
              },
              {
                role: 'assistant',
                content: text,
              },
            ],
            audio: {
              format: 'wav',
              voice,
            },
          }),
        },
        timeoutMs,
      );

      if (!response.ok) {
        throw new Error(`Xiaomi MiMo TTS failed: ${response.status} ${response.statusText} ${await readErrorBody(response)}`.trim());
      }

      const payload = (await response.json()) as XiaomiMimoResponse;
      if (payload.error) {
        throw new Error(`Xiaomi MiMo TTS failed: ${payload.error.code ?? ''} ${payload.error.message ?? ''}`.trim());
      }

      const audioData = payload.choices?.[0]?.message?.audio?.data;
      if (!audioData) {
        throw new Error('Xiaomi MiMo TTS returned no message.audio.data.');
      }

      const audio = Buffer.from(audioData, 'base64');
      if (audio.length === 0) {
        throw new Error('Xiaomi MiMo TTS returned empty audio data.');
      }

      return audio;
    },
  };
};
