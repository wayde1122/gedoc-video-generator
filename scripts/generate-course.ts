import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import {z} from 'zod';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({path: path.join(rootDir, '.env'), override: true});

const briefPath = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.join(rootDir, 'input', 'brief.txt');
const coursePath = path.join(rootDir, 'course.json');
const outDir = path.join(rootDir, 'out');
const generatedCoursePath = path.join(outDir, 'course.generated.json');
const rawCoursePath = path.join(outDir, 'course.raw-model-output.txt');
const outputTag = 'course_video_json';

const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL;
const textModel = process.env.OPENAI_TEXT_MODEL ?? 'gpt-5.4';

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is missing. Put it in .env before running.');
}

const slideSchema = z
  .object({
    kind: z.enum(['title', 'bullets', 'concept', 'exercise', 'summary']),
    start: z.number().min(0),
    end: z.number().min(1),
    heading: z.string().min(1).max(40),
    body: z.string().max(110).optional(),
    bullets: z.array(z.string().min(1).max(36)).min(2).max(4).optional(),
    code: z.string().max(160).optional(),
    caption: z.string().min(8).max(120),
  })
  .superRefine((slide, ctx) => {
    if (['bullets', 'exercise', 'summary'].includes(slide.kind) && !slide.bullets) {
      ctx.addIssue({
        code: 'custom',
        path: ['bullets'],
        message: `${slide.kind} slides must include bullets.`,
      });
    }

    if (slide.kind === 'concept' && !slide.body && !slide.code) {
      ctx.addIssue({
        code: 'custom',
        path: ['body'],
        message: 'concept slides must include body or code.',
      });
    }
  });

const courseSchema = z.object({
  title: z.string().min(1).max(40),
  subtitle: z.string().min(1).max(40),
  durationSeconds: z.number().int().min(30).max(60),
  fps: z.literal(30),
  slides: z.array(slideSchema).min(4).max(6),
});

type Course = z.infer<typeof courseSchema>;

const normalizeTiming = (course: Course): Course => {
  const durationSeconds = Math.min(60, Math.max(30, Math.round(course.durationSeconds)));
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

const extractJson = (content: string) => {
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

const buildSystemPrompt = () => {
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
  "durationSeconds": "integer, 30-60",
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
1. slides 必须是 4-6 页。
2. fps 必须等于 30。
3. durationSeconds 必须是 30-60 的整数。
4. 第一页 kind 必须是 "title"。
5. 最后一页 kind 必须是 "summary"。
6. start/end 必须递增，第一段 start 为 0，最后一段 end 等于 durationSeconds。
7. title 页可以有 body，不要有 bullets。
8. bullets、exercise、summary 页必须有 bullets。
9. concept 页必须有 body 或 code；如果用户提到代码示例，优先放 code。
10. caption 是配音旁白，不是屏幕字幕堆砌，中文自然讲课风格，每页 1-2 句。
11. 所有屏幕文字必须短，适合 1920x1080 课程画面显示。
12. 不要生成图片 URL、视频 URL、CSS、HTML 或 Markdown。
</hard_rules>

<output_example>
<${outputTag}>
{
  "title": "1天快速学会 Python",
  "subtitle": "零基础入门 Demo",
  "durationSeconds": 42,
  "fps": 30,
  "slides": [
    {
      "kind": "title",
      "start": 0,
      "end": 8,
      "heading": "1天快速学会 Python",
      "body": "从变量和 print 开始",
      "caption": "今天我们用一个短视频，快速看懂 Python 入门课会学什么。"
    },
    {
      "kind": "summary",
      "start": 8,
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

const coerceCoursePayload = (payload: unknown): unknown => {
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

  return {
    ...unwrapped,
    title:
      typeof unwrapped.title === 'string'
        ? unwrapped.title
        : isRecord(slides?.[0]) && typeof slides[0].heading === 'string'
          ? slides[0].heading
          : '课程视频 Demo',
    subtitle: typeof unwrapped.subtitle === 'string' ? unwrapped.subtitle : 'AI 生成课程样片',
    durationSeconds: typeof unwrapped.durationSeconds === 'number' ? unwrapped.durationSeconds : 58,
    fps: 30,
    slides,
  };
};

const brief = await fs.readFile(briefPath, 'utf8');
const openai = new OpenAI({apiKey, baseURL});

console.log(`Generating course.json from ${briefPath} with ${textModel}...`);

const completion = await openai.chat.completions.create({
  model: textModel,
  messages: [
    {
      role: 'system',
      content: buildSystemPrompt(),
    },
    {
      role: 'user',
      content: `<user_brief>\n${brief}\n</user_brief>`,
    },
  ],
} as never);

const content = completion.choices[0]?.message?.content;
if (!content) {
  throw new Error('The text model did not return any content.');
}

await fs.mkdir(outDir, {recursive: true});
await fs.writeFile(rawCoursePath, content, 'utf8');

let parsed: unknown;
try {
  parsed = JSON.parse(extractJson(content));
} catch (error) {
  throw new Error(`The text model returned invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
}

const course = normalizeTiming(courseSchema.parse(coerceCoursePayload(parsed)));

const serialized = `${JSON.stringify(course, null, 2)}\n`;
await fs.writeFile(generatedCoursePath, serialized, 'utf8');
await fs.writeFile(coursePath, serialized, 'utf8');

console.log(`course.json updated from ${briefPath}`);
