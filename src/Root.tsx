import {Composition} from 'remotion';
import course from '../course.json';
import {CourseVideo} from './CourseVideo';

export const RemotionRoot = () => {
  return (
    <Composition
      id="DocVideoGenerator"
      component={CourseVideo}
      durationInFrames={course.durationSeconds * course.fps}
      fps={course.fps}
      width={1920}
      height={1080}
    />
  );
};
