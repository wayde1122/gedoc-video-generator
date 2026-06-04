import coursePayload from '../course.json';
import {parseRenderCourse} from './course-validation';

export const videoCourse = parseRenderCourse(coursePayload);
