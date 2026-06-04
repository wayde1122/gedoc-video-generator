import {createDashScopeHttpProvider} from './providers/dashscope-http';
import {createOpenAiAudioProvider} from './providers/openai-audio';
import {createWindowsSpeechProvider} from './providers/windows-speech';
import {createXiaomiMimoProvider} from './providers/xiaomi-mimo';
import {getProviderValue} from './config';
import type {VoiceProvider, VoiceProviderContext, VoiceProviderKeyword, VoiceProviderSelection} from './types';

export const supportedVoiceProviderKeywords: VoiceProviderKeyword[] = [
  'none',
  'openai',
  'openai-audio',
  'dashscope',
  'dashscope-http',
  'xiaomi',
  'xiaomi-mimo',
  'windows',
  'windows-speech',
];

export const normalizeVoiceProviderKeyword = (value: string | undefined): VoiceProviderKeyword => {
  const normalized = (value ?? 'none').trim().toLowerCase();

  if (normalized === 'auto') {
    throw new Error('PROVIDER=auto is not supported. Use an explicit provider: openai, dashscope, xiaomi, windows, or none.');
  }

  if ((supportedVoiceProviderKeywords as string[]).includes(normalized)) {
    return normalized as VoiceProviderKeyword;
  }

  throw new Error(
    `Unsupported PROVIDER=${value}. Use one of: ${supportedVoiceProviderKeywords.join(', ')}. PROVIDER=auto is intentionally disabled.`,
  );
};

export const createVoiceProviderByKeyword = (keyword: VoiceProviderKeyword, context: VoiceProviderContext): VoiceProvider | null => {
  switch (keyword) {
    case 'none':
      return null;
    case 'openai':
    case 'openai-audio':
      return createOpenAiAudioProvider(context);
    case 'dashscope':
    case 'dashscope-http':
      return createDashScopeHttpProvider(context);
    case 'xiaomi':
    case 'xiaomi-mimo':
      return createXiaomiMimoProvider(context);
    case 'windows':
    case 'windows-speech':
      return createWindowsSpeechProvider(context);
    default: {
      const exhaustive: never = keyword;
      throw new Error(`Unsupported PROVIDER=${exhaustive}`);
    }
  }
};

export const selectVoiceProvider = async (
  value: string | undefined,
  context: VoiceProviderContext,
): Promise<VoiceProviderSelection> => {
  const keyword = normalizeVoiceProviderKeyword(value ?? getProviderValue(context.env));
  const provider = createVoiceProviderByKeyword(keyword, context);

  if (!provider) {
    return {mode: 'none', provider: null};
  }

  if (!(await provider.isAvailable())) {
    throw new Error(`${provider.label} is not available. Check the required environment variables for PROVIDER=${keyword}.`);
  }

  return {mode: 'provider', provider};
};
