import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import type {z} from 'zod';
import {
  type Course,
  courseSchema,
  defaultCourseFields,
  maxDurationSeconds,
  maxSlideCount,
  minDurationSeconds,
  minSlideCount,
} from '../src/course-schema';
import {DEFAULT_THEME_ID, themes} from '../src/themes';
import {loadProjectEnv} from './lib/env';
import {coursePath, outDir, rootDir} from './lib/paths';
import OpenAI from 'openai';

loadProjectEnv();

const generatedCoursePath = path.join(outDir, 'course.generated.json');
const rawCoursePath = path.join(outDir, 'course.raw-model-output.txt');
const outputTag = 'course_video_json';

export const normalizeTiming = (course: Course): Course => {
  const durationSeconds = Math.min(maxDurationSeconds, Math.max(minDurationSeconds, Math.round(course.durationSeconds)));
  const slideCount = course.slides.length;
  const segment = durationSeconds / slideCount;

  return {
    ...course,
    durationSeconds,
    fps: 30,
    slides: course.slides.map((slide, index) => ({
      ...slide,
      start: Math.round(index * segment),
      end: index === slideCount - 1 ? durationSeconds : Math.round((index + 1) * segment),
    })),
  };
};

export const extractJson = (content: string) => {
  const trimmed = content.trim();
  const xml = trimmed.match(new RegExp(`<${outputTag}>\\s*([\\s\\S]*?)\\s*</${outputTag}>`, 'i'));
  if (xml?.[1]) {
    return xml[1].trim();
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
};

const formatThemeOptions = () =>
  themes
    .map(
      (theme) =>
        `- ${theme.id}: ${theme.nameZh} / ${theme.label}; ${theme.descriptionZh}; 适合：${theme.bestFor}`,
    )
    .join('\n');

export const buildSystemPrompt = () => {
  return `
<role>
你是课程视频 JSON 生成器，负责把用户文案转换成 Remotion 模板可用的数据。
</role>

<output_contract>
必须只输出一个 XML 块，不要输出 Markdown、解释、寒暄或额外文本。
XML 根标签必须是 <${outputTag}>。
<${outputTag}> 标签内部必须是合法 JSON 对象，不能有注释、尾随逗号或 XML 转义。
</output_contract>

<json_schema>
{
  "title": "string, 1-40 chars",
  "subtitle": "string, 1-40 chars",
  "theme": "string, exactly one supported theme id",
  "durationSeconds": "integer, 30-300",
  "fps": 30,
  "slides": [
    {
      "kind": "title | bullets | concept | exercise | summary",
      "start": "number, seconds",
      "end": "number, seconds",
      "heading": "string, 1-40 chars",
      "body": "optional string, max 110 chars",
      "bullets": "required for bullets/exercise/summary, 2-4 strings, each max 36 chars",
      "code": "optional string, max 160 chars",
      "caption": "string, 8-120 chars, Chinese narration"
    }
  ]
}
</json_schema>

<hard_rules>
1. slides 必须是 ${minSlideCount}-${maxSlideCount} 页。短视频通常 4-6 页；1-3 分钟通常 7-14 页；3-5 分钟通常 15-24 页。
2. fps 必须等于 30。
3. durationSeconds 必须是 ${minDurationSeconds}-${maxDurationSeconds} 的整数，最高 5 分钟。
4. 第一页 kind 必须是 "title"。
5. 最后一页 kind 必须是 "summary"。
6. start/end 必须递增，第一段 start 为 0，最后一段 end 等于 durationSeconds。
7. title 页可以有 body，不要有 bullets。
8. bullets、exercise、summary 页必须有 bullets。
9. concept 页必须有 body 或 code；如果用户提到代码示例，优先放 code。
10. caption 是配音旁白，不是屏幕字幕堆砌，中文自然讲课风格，每页 1-2 句。
11. 所有屏幕文字必须短，适合 1920x1080 课程画面显示。
12. 不要生成图片 URL、视频 URL、CSS、HTML 或 Markdown。
13. theme 必须从下列合法 theme id 里选择一个，结合题材、受众和语气做选择；不确定时使用 "${DEFAULT_THEME_ID}"。
14. 如果 user_brief 明确写了时长，例如“60 秒”“3 分钟”“5 分钟”，durationSeconds 必须尽量贴近该时长，但不能超过 ${maxDurationSeconds} 秒。
15. 如果 user_brief 没有写时长，根据内容复杂度选择 60-120 秒；复杂教程可以扩展到 180-300 秒。
</hard_rules>

<theme_options>
${formatThemeOptions()}
</theme_options>

<output_example>
<${outputTag}>
{
  "title": "1天快速学会 Python",
  "subtitle": "零基础入门 Demo",
  "theme": "${DEFAULT_THEME_ID}",
  "durationSeconds": 42,
  "fps": 30,
  "slides": [
    {
      "kind": "title",
      "start": 0,
      "end": 10,
      "heading": "1天快速学会 Python",
      "body": "从变量和 print 开始",
      "caption": "今天我们用一个短视频，快速看懂 Python 入门课会学什么。"
    },
    {
      "kind": "concept",
      "start": 10,
      "end": 20,
      "heading": "变量是什么",
      "body": "变量就是给数据起名字",
      "caption": "变量可以理解成一个带名字的盒子，用来保存后面要使用的数据。"
    },
    {
      "kind": "bullets",
      "start": 20,
      "end": 32,
      "heading": "先练三件事",
      "bullets": ["定义变量", "打印结果", "修改数值"],
      "caption": "入门阶段先练三件事，定义变量、打印结果，再尝试修改变量的值。"
    },
    {
      "kind": "summary",
      "start": 32,
      "end": 42,
      "heading": "下一步",
      "bullets": ["掌握变量", "练习 print", "学习条件判断"],
      "caption": "这节课先建立入门框架，下一步继续学习条件判断和循环。"
    }
  ]
}
</${outputTag}>
</output_example>
`.trim();
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const unwrapPayload = (payload: unknown): unknown => {
  if (!isRecord(payload)) {
    return payload;
  }

  for (const key of ['course', 'video', 'data', 'result', 'json']) {
    if (isRecord(payload[key])) {
      return payload[key];
    }
  }

  return payload;
};

export const coerceCoursePayload = (payload: unknown): unknown => {
  const unwrapped = unwrapPayload(payload);
  if (!isRecord(unwrapped)) {
    return unwrapped;
  }

  const slides = Array.isArray(unwrapped.slides)
    ? unwrapped.slides
    : Array.isArray(unwrapped.scenes)
      ? unwrapped.scenes
      : Array.isArray(unwrapped.pages)
        ? unwrapped.pages
        : undefined;
  const hasTheme = Object.prototype.hasOwnProperty.call(unwrapped, 'theme');

  return {
    ...unwrapped,
    title:
      typeof unwrapped.title === 'string'
        ? unwrapped.title
        : isRecord(slides?.[0]) && typeof slides[0].heading === 'string'
          ? slides[0].heading
          : '课程视频 Demo',
    subtitle: typeof unwrapped.subtitle === 'string' ? unwrapped.subtitle : 'AI 生成课程样片',
    theme: hasTheme ? unwrapped.theme : defaultCourseFields.theme,
    durationSeconds:
      typeof unwrapped.durationSeconds === 'number' ? unwrapped.durationSeconds : defaultCourseFields.durationSeconds,
    fps: defaultCourseFields.fps,
    slides,
  };
};

const formatZodError = (error: z.ZodError): string => {
  return error.issues
    .map((issue) => {
      const pathLabel = issue.path.length > 0 ? issue.path.join('.') : '<root>';
      return `- ${pathLabel}: ${issue.message}`;
    })
    .join('\n');
};

const parseCoursePayload = (payload: unknown): Course => {
  const result = courseSchema.safeParse(coerceCoursePayload(payload));
  if (result.success) {
    return normalizeTiming(result.data);
  }

  throw new Error(`Generated course JSON failed schema validation:\n${formatZodError(result.error)}`);
};

const requestCourseJson = async (openai: OpenAI, textModel: string, brief: string, repairContext?: string) => {
  const messages = [
    {
      role: 'system',
      content: buildSystemPrompt(),
    },
    {
      role: 'user',
      content: repairContext
        ? `<user_brief>\n${brief}\n</user_brief>\n\n<repair_request>\n上一次输出不符合 schema。请根据以下错误只重新输出完整 JSON XML，不要解释。\n${repairContext}\n</repair_request>`
        : `<user_brief>\n${brief}\n</user_brief>`,
    },
  ];

  const completionResponse = await openai.chat.completions.create({
    model: textModel,
    messages,
  } as never);
  const completion = (
    typeof completionResponse === 'string' ? JSON.parse(completionResponse) : completionResponse
  ) as {choices?: Array<{message?: {content?: string | null}}>} & Record<string, unknown>;

  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`The text model did not return any content. Raw response: ${JSON.stringify(completion).slice(0, 1000)}`);
  }

  return content;
};

export const main = async () => {
  const briefPath = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : path.join(rootDir, 'input', 'brief.txt');
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL;
  const textModel = process.env.OPENAI_TEXT_MODEL;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing. Copy .env.example to .env and set it before running.');
  }

  if (!textModel) {
    throw new Error('OPENAI_TEXT_MODEL is missing. Set it to a model supported by your OpenAI-compatible endpoint.');
  }

  const brief = await fs.readFile(briefPath, 'utf8');
  const openai = new OpenAI({apiKey, baseURL});

  console.log(`Generating course.json from ${briefPath} with ${textModel}...`);

  await fs.mkdir(outDir, {recursive: true});

  let content = await requestCourseJson(openai, textModel, brief);
  let parsed: unknown;
  let course: Course;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    await fs.writeFile(
      attempt === 1 ? rawCoursePath : path.join(outDir, 'course.raw-model-output.repair.txt'),
      content,
      'utf8',
    );

    try {
      parsed = JSON.parse(extractJson(content));
      course = parseCoursePayload(parsed);
      const serialized = `${JSON.stringify(course, null, 2)}\n`;
      await fs.writeFile(generatedCoursePath, serialized, 'utf8');
      await fs.writeFile(coursePath, serialized, 'utf8');
      console.log(`course.json updated from ${briefPath}`);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (attempt >= 2) {
        throw new Error(`The text model returned invalid course JSON after repair attempt: ${message}`);
      }

      console.warn(`Generated course JSON failed validation. Asking model to repair once...\n${message}`);
      content = await requestCourseJson(openai, textModel, brief, message);
    }
  }
};

const isMainModule = () => {
  const entry = process.argv[1];
  return Boolean(entry && path.resolve(entry) === fileURLToPath(import.meta.url));
};

if (isMainModule()) {
  await main();
}
