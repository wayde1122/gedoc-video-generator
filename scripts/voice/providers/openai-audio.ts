import OpenAI from 'openai';
import {
  getGenericApiKey,
  getGenericBaseUrl,
  getGenericModel,
  getGenericTimeoutMs,
  getGenericVoice,
  getNumberEnv,
  describeVoiceSpeed,
  getVoiceSpeed,
} from '../config';
import type {VoiceProvider, VoiceProviderContext, VoiceRequest} from '../types';

type TtsAttempt = {
  model: string;
  voice: string;
  instructions?: string;
};

const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const createOpenAiAudioProvider = ({env}: VoiceProviderContext): VoiceProvider => {
  const apiKey = getGenericApiKey(env);
  const baseURL = getGenericBaseUrl(env) ?? 'https://api.openai.com/v1';
  const audioModel = getGenericModel(env);
  const audioVoice = getGenericVoice(env) ?? 'alloy';
  const speed = getVoiceSpeed(env);
  const speedDescription = describeVoiceSpeed(speed);
  const requestTimeoutMs = getNumberEnv(getGenericTimeoutMs(env), 120000);
  const audioModelRetries = 3;
  const fallbackAttempts: TtsAttempt[] = [];

  const openai = apiKey ? new OpenAI({apiKey, baseURL, timeout: requestTimeoutMs, maxRetries: 0}) : null;

  return {
    id: 'openai-audio',
    label: 'OpenAI-compatible audio',
    async isAvailable() {
      return Boolean(openai && (audioModel || fallbackAttempts.length > 0));
    },
    async synthesize({text}: VoiceRequest) {
      if (!openai) {
        throw new Error('MODE_API_KEY is missing.');
      }

      let lastError: unknown = null;

      if (audioModel) {
        for (let attempt = 1; attempt <= Math.max(1, audioModelRetries); attempt += 1) {
          try {
            console.log(
              `Trying OpenAI audio model ${audioModel} with voice ${audioVoice} at ${speed}x speed (${attempt}/${audioModelRetries})...`,
            );
            const completion = await openai.chat.completions.create({
              model: audioModel,
              modalities: ['text', 'audio'],
              audio: {
                voice: audioVoice,
                format: 'wav',
              },
              messages: [
                {
                  role: 'system',
                  content:
                    `你是中文课程旁白。请用${speedDescription}的普通话朗读用户提供的课程脚本，目标语速约为正常语速的 ${speed} 倍。不要添加、改写或解释内容。`,
                },
                {
                  role: 'user',
                  content: text,
                },
              ],
            } as never);

            const audioData = (completion.choices[0]?.message as {audio?: {data?: string}} | undefined)?.audio?.data;
            if (!audioData) {
              throw new Error('The audio model response did not include audio.data.');
            }

            return Buffer.from(audioData, 'base64');
          } catch (error) {
            lastError = error;
            const message = error instanceof Error ? error.message : String(error);
            console.warn(`OpenAI audio model attempt failed for ${audioModel}: ${message}`);
            if (attempt < audioModelRetries) {
              await wait(1500 * attempt);
            }
          }
        }
      }

      for (const attempt of fallbackAttempts) {
        try {
          console.log(`Trying OpenAI speech fallback ${attempt.model} with voice ${attempt.voice}...`);
          const response = await openai.audio.speech.create({
            model: attempt.model,
            voice: attempt.voice,
            input: text,
            ...(attempt.instructions ? {instructions: attempt.instructions} : {}),
            speed,
            response_format: 'wav',
          });
          return Buffer.from(await response.arrayBuffer());
        } catch (error) {
          lastError = error;
          const message = error instanceof Error ? error.message : String(error);
          console.warn(`OpenAI speech fallback failed for ${attempt.model}: ${message}`);
        }
      }

      throw new Error(
        `OpenAI audio generation failed${
          lastError instanceof Error ? `: ${lastError.message}` : lastError ? `: ${String(lastError)}` : '.'
        }`,
      );
    },
  };
};
