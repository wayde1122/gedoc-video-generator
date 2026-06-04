import assert from 'node:assert/strict';
import {getGenericApiKey, getGenericBaseUrl, getGenericTimeoutMs, getGenericVoice, getProviderValue} from '../scripts/voice/config';
import {selectXiaomiMimoVoiceForCourse} from '../scripts/voice/providers/xiaomi-mimo';
import {
  createVoiceProviderByKeyword,
  normalizeVoiceProviderKeyword,
  supportedVoiceProviderKeywords,
} from '../scripts/voice/provider-registry';

const failures: string[] = [];

const check = (name: string, assertion: () => void) => {
  try {
    assertion();
    console.log(`PASS ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push(`${name}: ${message}`);
    console.error(`FAIL ${name}`);
    console.error(`  ${message}`);
  }
};

const context = {
  env: {},
  tempDir: '.',
};

check('provider registry accepts explicit provider keywords', () => {
  assert.equal(normalizeVoiceProviderKeyword(undefined), 'none');
  assert.equal(normalizeVoiceProviderKeyword('none'), 'none');
  assert.equal(normalizeVoiceProviderKeyword('openai'), 'openai');
  assert.equal(normalizeVoiceProviderKeyword('openai-audio'), 'openai-audio');
  assert.equal(normalizeVoiceProviderKeyword('dashscope'), 'dashscope');
  assert.equal(normalizeVoiceProviderKeyword('dashscope-http'), 'dashscope-http');
  assert.equal(normalizeVoiceProviderKeyword('xiaomi'), 'xiaomi');
  assert.equal(normalizeVoiceProviderKeyword('xiaomi-mimo'), 'xiaomi-mimo');
  assert.equal(normalizeVoiceProviderKeyword('windows'), 'windows');
  assert.equal(normalizeVoiceProviderKeyword('windows-speech'), 'windows-speech');
});

check('provider registry rejects auto and unknown keywords', () => {
  assert.throws(() => normalizeVoiceProviderKeyword('auto'), /auto is not supported/i);
  assert.throws(() => normalizeVoiceProviderKeyword('not-real'), /Unsupported PROVIDER/i);
});

check('generic uppercase voice config is read before legacy aliases', () => {
  const env = {
    PROVIDER: 'xiaomi',
    VOICE_PROVIDER: 'openai',
    MODE_API_KEY: 'generic-key',
    BASE_URL: 'https://api.xiaomimimo.com/v1',
    MODEL_VOICE: 'mimo_default',
    MODEL_TTS_TIMEOUT_MS: '120000',
  };

  assert.equal(getProviderValue(env), 'xiaomi');
  assert.equal(getGenericApiKey(env), 'generic-key');
  assert.equal(getGenericBaseUrl(env), 'https://api.xiaomimimo.com/v1');
  assert.equal(getGenericVoice(env), 'mimo_default');
  assert.equal(getGenericTimeoutMs(env), '120000');
});

check('provider registry maps aliases to provider ids', () => {
  assert.equal(createVoiceProviderByKeyword('none', context), null);
  assert.equal(createVoiceProviderByKeyword('openai', context)?.id, 'openai-audio');
  assert.equal(createVoiceProviderByKeyword('openai-audio', context)?.id, 'openai-audio');
  assert.equal(createVoiceProviderByKeyword('dashscope', context)?.id, 'dashscope-http');
  assert.equal(createVoiceProviderByKeyword('dashscope-http', context)?.id, 'dashscope-http');
  assert.equal(createVoiceProviderByKeyword('xiaomi', context)?.id, 'xiaomi-mimo');
  assert.equal(createVoiceProviderByKeyword('xiaomi-mimo', context)?.id, 'xiaomi-mimo');
  assert.equal(createVoiceProviderByKeyword('windows', context)?.id, 'windows-speech');
  assert.equal(createVoiceProviderByKeyword('windows-speech', context)?.id, 'windows-speech');
});

check('provider registry documents every accepted keyword', () => {
  assert.deepEqual(supportedVoiceProviderKeywords, [
    'none',
    'openai',
    'openai-audio',
    'dashscope',
    'dashscope-http',
    'xiaomi',
    'xiaomi-mimo',
    'windows',
    'windows-speech',
  ]);
});

check('xiaomi mimo auto voice is selected from the course topic', () => {
  assert.equal(selectXiaomiMimoVoiceForCourse('李白《望庐山瀑布》赏析\n语文课堂导入微课'), '冰糖');
  assert.equal(selectXiaomiMimoVoiceForCourse('Agent Loop 技术架构与 API 工作流'), '白桦');
  assert.equal(selectXiaomiMimoVoiceForCourse('英语口语听力训练'), 'Chloe');
  assert.equal(selectXiaomiMimoVoiceForCourse('增长战略和产品营销汇报'), '苏打');
});

if (failures.length > 0) {
  console.error('\nVoice provider registry validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log('\nVoice provider registry validation passed.');
}
