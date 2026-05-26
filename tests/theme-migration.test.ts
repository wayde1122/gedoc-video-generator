import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  buildSystemPrompt,
  coerceCoursePayload,
} from '../scripts/generate-course';
import {courseSchema} from '../src/course-schema';
import {
  DEFAULT_THEME_ID,
  GARDEN_THEME_IDS,
  isThemeId,
  resolveTheme,
  themes,
} from '../src/themes';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const expectedGardenThemeIds = [
  'midnight-press',
  'warm-keynote',
  'newsroom',
  'bauhaus-bold',
  'paper-press',
  'blueprint',
  'bold-signal',
  'chalk-garden',
  'creative-voltage',
  'dark-botanical',
  'dune',
  'electric-studio',
  'forest-ink',
  'indigo-porcelain',
  'kraft-paper',
  'monochrome-print',
  'neon-cyber',
  'pastel-dream',
  'split-canvas',
  'sunset-zine',
  'swiss-ikb',
  'terminal-green',
  'vintage-editorial',
] as const;

const removedThemeIds = [
  ['business', 'clean'].join('-'),
  ['tech', 'demo'].join('-'),
  ['editorial', 'talk'].join('-'),
];

const baseSlides = [
  {
    kind: 'title',
    start: 0,
    end: 8,
    heading: '开场',
    body: '快速建立上下文',
    caption: '这节课先建立问题背景，然后进入核心步骤。',
  },
  {
    kind: 'bullets',
    start: 8,
    end: 16,
    heading: '关键点',
    bullets: ['理解目标', '拆解路径'],
    caption: '这里用两个关键点把学习路径先拆清楚。',
  },
  {
    kind: 'concept',
    start: 16,
    end: 24,
    heading: '核心概念',
    body: '把复杂任务拆成可验证的小步骤',
    caption: '核心概念是先缩小问题，再逐步验证结果。',
  },
  {
    kind: 'summary',
    start: 24,
    end: 32,
    heading: '总结',
    bullets: ['先定目标', '再做验证'],
    caption: '最后总结一下，先定目标，再用小步骤验证。',
  },
] as const;

const makeCourse = (overrides: Record<string, unknown> = {}) => ({
  title: '主题测试',
  subtitle: '枚举与默认值',
  theme: DEFAULT_THEME_ID,
  durationSeconds: 32,
  fps: 30,
  slides: baseSlides,
  ...overrides,
});

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

const readProjectFile = (filePath: string) => fs.readFileSync(path.join(rootDir, filePath), 'utf8');

check('theme registry exposes exactly 23 garden theme ids', () => {
  assert.deepEqual(GARDEN_THEME_IDS, expectedGardenThemeIds);
  assert.deepEqual(
    themes.map((theme) => theme.id),
    expectedGardenThemeIds,
  );
  assert.equal(DEFAULT_THEME_ID, 'warm-keynote');
});

check('removed custom theme ids are absent from runtime theme APIs', () => {
  for (const themeId of removedThemeIds) {
    assert.equal(isThemeId(themeId), false, `${themeId} should not be accepted`);
    assert.equal(themes.some((theme) => theme.id === themeId), false, `${themeId} should not be registered`);
    assert.equal(GARDEN_THEME_IDS.includes(themeId as never), false, `${themeId} should not be listed`);
  }
});

check('course schema accepts every garden id and rejects an unknown id', () => {
  for (const themeId of GARDEN_THEME_IDS) {
    const parsed = courseSchema.parse(makeCourse({theme: themeId}));
    assert.equal(parsed.theme, themeId);
  }

  assert.equal(courseSchema.safeParse(makeCourse({theme: 'not-a-real-theme'})).success, false);
});

check('course schema supports requested durations up to five minutes', () => {
  assert.equal(courseSchema.parse(makeCourse({durationSeconds: 300})).durationSeconds, 300);
  assert.equal(courseSchema.safeParse(makeCourse({durationSeconds: 301})).success, false);
});

check('course schema enforces title opener and summary ending', () => {
  assert.equal(
    courseSchema.safeParse(
      makeCourse({
        slides: [
          {...baseSlides[1], start: 0, end: 8},
          baseSlides[1],
          baseSlides[2],
          baseSlides[3],
        ],
      }),
    ).success,
    false,
  );

  assert.equal(
    courseSchema.safeParse(
      makeCourse({
        slides: [
          baseSlides[0],
          baseSlides[1],
          baseSlides[2],
          {...baseSlides[1], start: 24, end: 32},
        ],
      }),
    ).success,
    false,
  );
});

check('missing generated theme is defaulted before strict schema validation', () => {
  const {theme: _theme, ...payload} = makeCourse();

  const parsed = courseSchema.parse(coerceCoursePayload(payload));
  assert.equal(parsed.theme, DEFAULT_THEME_ID);
});

check('render theme resolution warns by default and throws in strict mode', () => {
  const originalWarn = console.warn;
  const originalStrictTheme = process.env.STRICT_THEME;
  const warnings: string[] = [];

  try {
    delete process.env.STRICT_THEME;
    console.warn = (message?: unknown) => {
      warnings.push(String(message));
    };

    assert.equal(resolveTheme(undefined, {strict: false}).id, DEFAULT_THEME_ID);
    assert.ok(
      warnings.some((message) => message.includes(DEFAULT_THEME_ID) && /missing/i.test(message)),
      'missing theme fallback should warn with fallback id',
    );

    assert.throws(() => resolveTheme('not-a-real-theme', {strict: true}), /not-a-real-theme|Valid themes/i);

    process.env.STRICT_THEME = 'true';
    assert.throws(() => resolveTheme('not-a-real-theme'), /not-a-real-theme|Valid themes/i);
  } finally {
    console.warn = originalWarn;
    if (originalStrictTheme === undefined) {
      delete process.env.STRICT_THEME;
    } else {
      process.env.STRICT_THEME = originalStrictTheme;
    }
  }
});

check('prompt lists every legal theme and excludes removed ids', () => {
  const prompt = buildSystemPrompt();

  for (const themeId of GARDEN_THEME_IDS) {
    assert.ok(prompt.includes(themeId), `${themeId} should be present in prompt`);
  }

  for (const themeId of removedThemeIds) {
    assert.equal(prompt.includes(themeId), false, `${themeId} should not be present in prompt`);
  }

  assert.match(prompt, /30-300/, 'prompt should document the five-minute duration range');
  assert.match(prompt, /5 分钟/, 'prompt should mention the five-minute maximum');
  assert.match(prompt, /user_brief.*60 秒.*3 分钟.*5 分钟/s, 'prompt should tell the model to follow requested duration');
});

check('README lists garden-only themes and excludes removed ids', () => {
  const readme = readProjectFile('README.md');

  for (const themeId of GARDEN_THEME_IDS) {
    assert.ok(readme.includes(themeId), `${themeId} should be present in README`);
  }

  for (const themeId of removedThemeIds) {
    assert.equal(readme.includes(themeId), false, `${themeId} should not be present in README`);
  }
});

if (failures.length > 0) {
  console.error('\nTheme migration validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log('\nTheme migration validation passed.');
}
