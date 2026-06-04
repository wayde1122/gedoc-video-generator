import {Composition} from 'remotion';
import {videoCourse} from './course-data';
import {CourseVideo} from './CourseVideo';

export const RemotionRoot = () => {
  return (
    <Composition
      id="DocVideoGenerator"
      component={CourseVideo}
      durationInFrames={Math.ceil(videoCourse.durationSeconds * videoCourse.fps)}
      fps={videoCourse.fps}
      width={1920}
      height={1080}
    />
  );
};
