import {synthesizeDashScopeHttpTts} from '../../dashscope-http-tts';
import {
  getGenericApiKey,
  getGenericBaseUrl,
  getGenericModel,
  getGenericTimeoutMs,
  getGenericVoice,
  getNumberEnv,
  getVoiceSpeed,
} from '../config';
import type {VoiceProvider, VoiceProviderContext, VoiceRequest} from '../types';

export const createDashScopeHttpProvider = ({env}: VoiceProviderContext): VoiceProvider => {
  const apiKey = getGenericApiKey(env);
  const baseUrl = getGenericBaseUrl(env) ?? 'https://api.dashscope.com/v1';
  const model = getGenericModel(env) ?? 'cosyvoice-v3-flash';
  const voice = getGenericVoice(env) ?? 'longxiaochun_v3';
  const sampleRate = 24000;
  const speed = getVoiceSpeed(env);
  const timeoutMs = getNumberEnv(getGenericTimeoutMs(env), 120000);

  return {
    id: 'dashscope-http',
    label: 'DashScope HTTP TTS',
    async isAvailable() {
      return Boolean(apiKey);
    },
    async synthesize({text}: VoiceRequest) {
      if (!apiKey) {
        throw new Error('MODE_API_KEY is missing.');
      }

      console.log(`Trying DashScope HTTP TTS model ${model} with voice ${voice} at ${speed}x speed...`);
      return synthesizeDashScopeHttpTts({
        apiKey,
        text,
        model,
        voice,
        baseUrl,
        format: 'wav',
        sampleRate,
        speechRate: speed,
        timeoutMs,
      });
    },
  };
};
