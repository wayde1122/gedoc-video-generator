import type {VoiceProviderKeyword} from './types';

const firstEnv = (env: NodeJS.ProcessEnv, names: string[]) => {
  for (const name of names) {
    const value = env[name];
    if (value !== undefined && value.trim() !== '') {
      return value;
    }
  }
  return undefined;
};

export const getProviderValue = (env: NodeJS.ProcessEnv) =>
  firstEnv(env, ['PROVIDER', 'VOICE_PROVIDER', 'provider']) as VoiceProviderKeyword | undefined;

export const getGenericApiKey = (env: NodeJS.ProcessEnv) =>
  firstEnv(env, ['MODE_API_KEY', 'MODEL_API_KEY', 'API_KEY', 'mode_api_key', 'model_api_key', 'api_key']);

export const getGenericBaseUrl = (env: NodeJS.ProcessEnv) => firstEnv(env, ['BASE_URL', 'base_url']);

export const getGenericModel = (env: NodeJS.ProcessEnv) =>
  firstEnv(env, ['MODEL', 'TTS_MODEL', 'MODEL_NAME', 'model', 'tts_model', 'model_name']);

export const getGenericVoice = (env: NodeJS.ProcessEnv) => firstEnv(env, ['MODEL_VOICE', 'VOICE', 'model_voice', 'voice']);

export const getGenericSpeed = (env: NodeJS.ProcessEnv) => firstEnv(env, ['VOICE_SPEED', 'MODEL_SPEED', 'voice_speed', 'model_speed']);

export const getGenericTimeoutMs = (env: NodeJS.ProcessEnv) =>
  firstEnv(env, ['MODEL_TTS_TIMEOUT_MS', 'TTS_TIMEOUT_MS', 'model_TTS_TIMEOUT_MS', 'tts_timeout_ms']);

export const getNumberEnv = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const getVoiceSpeed = (env: NodeJS.ProcessEnv, fallback = 1.15) =>
  clampNumber(getNumberEnv(getGenericSpeed(env), fallback), 0.5, 2);

export const describeVoiceSpeed = (speed: number) => {
  if (speed >= 1.25) {
    return '偏快但清晰';
  }

  if (speed > 1) {
    return '稍快且清晰';
  }

  if (speed < 1) {
    return '稍慢、清晰';
  }

  return '自然、清晰';
};
