import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {videoCourse} from './course-data';
import {VideoBackground} from './VideoBackground';
import {DocumentSlideView, SegmentedAudio, SlideView} from './VideoSlideViews';
import {createVideoStyles} from './video-styles';
import {getActiveSlide, isDocumentSlide} from './video-utils';
import {resolveTheme} from './themes';

const theme = resolveTheme('theme' in videoCourse ? videoCourse.theme : undefined);
const hasSegmentedAudio =
  !('mode' in videoCourse && videoCourse.mode === 'document') &&
  videoCourse.slides.some((slide) => 'audioSrc' in slide && Boolean(slide.audioSrc));

if (hasSegmentedAudio) {
  const missingAudio = videoCourse.slides
    .filter((slide) => slide.kind !== 'document' && !('audioSrc' in slide && slide.audioSrc))
    .map((slide, index) => `${index + 1}:${slide.heading}`);
  if (missingAudio.length > 0) {
    console.warn(`Segmented audio is enabled, but these slides are silent: ${missingAudio.join(', ')}`);
  }
}

const styles = createVideoStyles(theme);

export const CourseVideo = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const activeSlide = getActiveSlide(videoCourse.slides, frame, fps);
  const progress = frame / Math.max(1, durationInFrames - 1);
  const isDocumentMode = ('mode' in videoCourse && videoCourse.mode === 'document') || isDocumentSlide(activeSlide);

  return (
    <AbsoluteFill style={isDocumentMode ? styles.documentShell : styles.root}>
      {!isDocumentMode && hasSegmentedAudio ? <SegmentedAudio slides={videoCourse.slides} fps={fps} /> : null}
      {isDocumentMode ? (
        <DocumentSlideView key={activeSlide.start} slide={activeSlide} styles={styles} />
      ) : (
        <>
          <VideoBackground
            theme={theme}
            frame={frame}
            fps={fps}
            patternStyle={styles.backgroundPattern}
            accentStyle={styles.backgroundAccent}
          />
          <div style={styles.topBar}>
            <div style={styles.courseName}>{videoCourse.title}</div>
          </div>
          <SlideView key={activeSlide.start} slide={activeSlide} theme={theme} styles={styles} />
          {activeSlide.caption ? <div style={styles.caption}>{activeSlide.caption}</div> : null}
        </>
      )}
      <div style={styles.progressTrack}>
        <div style={{...styles.progressFill, width: `${progress * 100}%`}} />
      </div>
    </AbsoluteFill>
  );
};
