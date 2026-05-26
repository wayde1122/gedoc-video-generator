import {z} from 'zod';
import {DEFAULT_THEME_ID, GARDEN_THEME_IDS} from './themes';

export const minDurationSeconds = 30;
export const maxDurationSeconds = 300;
export const minSlideCount = 4;
export const maxSlideCount = 24;

export const generatedSlideKinds = ['title', 'bullets', 'concept', 'exercise', 'summary'] as const;
export const documentSlideKind = 'document' as const;

export const generatedSlideSchema = z
  .object({
    kind: z.enum(generatedSlideKinds),
    start: z.number().min(0),
    end: z.number().min(1),
    heading: z.string().min(1).max(40),
    body: z.string().max(110).optional(),
    bullets: z.array(z.string().min(1).max(36)).min(2).max(4).optional(),
    code: z.string().max(160).optional(),
    caption: z.string().min(8).max(120),
    audioSrc: z.string().optional(),
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

export const documentSlideSchema = z.object({
  kind: z.literal(documentSlideKind),
  start: z.number().min(0),
  end: z.number().min(1),
  heading: z.string().min(1),
  caption: z.string(),
  backgroundImage: z.string().min(1),
  sourcePage: z.number().int().positive(),
});

export const courseSchema = z
  .object({
    title: z.string().min(1).max(40),
    subtitle: z.string().min(1).max(40),
    theme: z.enum(GARDEN_THEME_IDS),
    durationSeconds: z.number().int().min(minDurationSeconds).max(maxDurationSeconds),
    fps: z.literal(30),
    slides: z.array(generatedSlideSchema).min(minSlideCount).max(maxSlideCount),
  })
  .superRefine((course, ctx) => {
    if (course.slides[0]?.kind !== 'title') {
      ctx.addIssue({
        code: 'custom',
        path: ['slides', 0, 'kind'],
        message: 'The first slide must have kind "title".',
      });
    }

    const lastSlide = course.slides[course.slides.length - 1];
    if (lastSlide?.kind !== 'summary') {
      ctx.addIssue({
        code: 'custom',
        path: ['slides', course.slides.length - 1, 'kind'],
        message: 'The last slide must have kind "summary".',
      });
    }
  });

export const documentCourseSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  mode: z.literal('document'),
  durationSeconds: z.number().positive(),
  fps: z.literal(30),
  slides: z.array(documentSlideSchema).min(1),
});

export const renderCourseSchema = z.union([courseSchema, documentCourseSchema]);

export type GeneratedSlide = z.infer<typeof generatedSlideSchema>;
export type DocumentSlide = z.infer<typeof documentSlideSchema>;
export type Slide = GeneratedSlide | DocumentSlide;
export type Course = z.infer<typeof courseSchema>;
export type DocumentCourse = z.infer<typeof documentCourseSchema>;
export type RenderCourse = z.infer<typeof renderCourseSchema>;
export type CourseSlideKind = Slide['kind'];

export const defaultCourseFields = {
  theme: DEFAULT_THEME_ID,
  durationSeconds: 58,
  fps: 30,
} as const;
