import {renderCourseSchema, type RenderCourse} from './course-schema';

export const formatCourseIssues = (issues: Array<{path: PropertyKey[]; message: string}>) =>
  issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.map(String).join('.') : 'course';
      return `- ${path}: ${issue.message}`;
    })
    .join('\n');

export const parseRenderCourse = (payload: unknown, label = 'course.json'): RenderCourse => {
  const parsed = renderCourseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(`${label} is invalid:\n${formatCourseIssues(parsed.error.issues)}`);
  }
  return parsed.data;
};
