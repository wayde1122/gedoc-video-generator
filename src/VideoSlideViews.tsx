import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Slide} from './course-schema';
import type {Theme} from './themes';
import {
  getAudioSrc,
  getBackgroundImage,
  getBody,
  getBullets,
  getCode,
  normalizeStaticPath,
  secondsToFrame,
} from './video-utils';

type Styles = Record<string, React.CSSProperties>;

export const CodeBlock = ({code, styles}: {code: string; styles: Styles}) => {
  const lines = code.split('\n');

  return (
    <div style={styles.codeBlock}>
      {lines.map((line, index) => (
        <div key={`${index}-${line}`} style={styles.codeLine}>
          <span style={styles.lineNumber}>{index + 1}</span>
          <span>{line}</span>
        </div>
      ))}
    </div>
  );
};

export const BulletList = ({bullets, frame, styles}: {bullets: string[]; frame: number; styles: Styles}) => {
  const {fps} = useVideoConfig();

  return (
    <div style={styles.bullets}>
      {bullets.map((bullet, index) => {
        const opacity = interpolate(frame, [index * fps * 0.35, index * fps * 0.35 + 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const translateY = interpolate(opacity, [0, 1], [18, 0]);

        return (
          <div
            key={`${index}-${bullet}`}
            style={{
              ...styles.bullet,
              opacity,
              transform: `translateY(${translateY}px)`,
            }}
          >
            <span style={styles.bulletDot} />
            <span>{bullet}</span>
          </div>
        );
      })}
    </div>
  );
};

export const SlideView = ({slide, theme, styles}: {slide: Slide; theme: Theme; styles: Styles}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const slideFrame = frame - secondsToFrame(slide.start, fps);
  const entrance = spring({frame: slideFrame, fps, config: {damping: 18, stiffness: 120}});
  const y = interpolate(entrance, [0, 1], [42, 0]);

  const body = getBody(slide);
  const bullets = getBullets(slide);
  const code = getCode(slide);

  return (
    <div style={{...styles.slide, transform: `translateY(${y}px)`, opacity: entrance}}>
      <div style={styles.kicker}>{theme.label.toUpperCase()}</div>
      <h1
        style={{
          ...(slide.kind === 'title' ? styles.title : styles.heading),
          textTransform: theme.headingTransform,
        }}
      >
        {slide.heading}
      </h1>
      {body ? <p style={styles.body}>{body}</p> : null}
      {bullets ? <BulletList bullets={bullets} frame={slideFrame} styles={styles} /> : null}
      {code ? <CodeBlock code={code} styles={styles} /> : null}
    </div>
  );
};

export const DocumentSlideView = ({slide, styles}: {slide: Slide; styles: Styles}) => {
  const backgroundImage = getBackgroundImage(slide);
  if (!backgroundImage) {
    return null;
  }

  return (
    <AbsoluteFill style={styles.documentRoot}>
      <Img src={staticFile(backgroundImage)} style={styles.documentPage} />
    </AbsoluteFill>
  );
};

export const SegmentedAudio = ({slides, fps}: {slides: Slide[]; fps: number}) => {
  return (
    <>
      {slides
        .filter((slide) => getAudioSrc(slide))
        .map((slide, index) => {
          const audioSrc = getAudioSrc(slide) as string;
          const from = secondsToFrame(slide.start, fps);
          const durationInFrames = Math.max(1, secondsToFrame(slide.end - slide.start, fps));
          return (
            <Sequence key={`${audioSrc}-${index}`} from={from} durationInFrames={durationInFrames}>
              <Audio src={staticFile(normalizeStaticPath(audioSrc))} />
            </Sequence>
          );
        })}
    </>
  );
};
