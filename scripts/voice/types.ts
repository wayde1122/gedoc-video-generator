export type VoiceProviderId = 'openai-audio' | 'dashscope-http' | 'xiaomi-mimo' | 'windows-speech';

export type VoiceProviderKeyword =
  | 'none'
  | 'openai'
  | 'openai-audio'
  | 'dashscope'
  | 'dashscope-http'
  | 'xiaomi'
  | 'xiaomi-mimo'
  | 'windows'
  | 'windows-speech';

export type VoiceRequest = {
  text: string;
  slideIndex: number;
  outputName: string;
  courseContext?: string;
};

export type VoiceProviderContext = {
  env: NodeJS.ProcessEnv;
  tempDir: string;
};

export interface VoiceProvider {
  id: VoiceProviderId;
  label: string;
  isAvailable(): Promise<boolean>;
  synthesize(request: VoiceRequest): Promise<Buffer>;
}

export type VoiceProviderSelection =
  | {
      mode: 'none';
      provider: null;
    }
  | {
      mode: 'provider';
      provider: VoiceProvider;
    };
