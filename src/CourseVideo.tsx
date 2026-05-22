import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import course from '../course.json';

type Slide = {
  kind: string;
  start: number;
  end: number;
  heading: string;
  caption?: string;
  body?: string;
  bullets?: string[];
  code?: string;
  backgroundImage?: string;
  sourcePage?: number;
};

const videoCourse = course as {
  title: string;
  subtitle?: string;
  mode?: string;
  slides: Slide[];
};

const palette = {
  ink: '#172033',
  muted: '#5d6b82',
  paper: '#f7f3ea',
  panel: '#ffffff',
  blue: '#2868c7',
  green: '#2a8b69',
  amber: '#c98b1c',
  line: '#d9dde7',
};

const secondsToFrame = (seconds: number, fps: number) => Math.round(seconds * fps);

const getActiveSlide = (frame: number, fps: number): Slide => {
  return (
    videoCourse.slides.find(
      (slide) => frame >= secondsToFrame(slide.start, fps) && frame < secondsToFrame(slide.end, fps),
    ) ?? videoCourse.slides[videoCourse.slides.length - 1]
  );
};

const isDocumentSlide = (slide: Slide) => slide.kind === 'document' && Boolean(slide.backgroundImage);

const CodeBlock = ({code}: {code: string}) => {
  const lines = code.split('\n');

  return (
    <div style={styles.codeBlock}>
      {lines.map((line, index) => (
        <div key={line} style={styles.codeLine}>
          <span style={styles.lineNumber}>{index + 1}</span>
          <span>{line}</span>
        </div>
      ))}
    </div>
  );
};

const BulletList = ({bullets}: {bullets: string[]}) => {
  const frame = useCurrentFrame();
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
            key={bullet}
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

const SlideView = ({slide}: {slide: Slide}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const slideFrame = frame - secondsToFrame(slide.start, fps);
  const entrance = spring({frame: slideFrame, fps, config: {damping: 18, stiffness: 120}});
  const y = interpolate(entrance, [0, 1], [42, 0]);

  return (
    <div style={{...styles.slide, transform: `translateY(${y}px)`, opacity: entrance}}>
      <div style={styles.kicker}>DOC VIDEO GENERATOR</div>
      <h1 style={slide.kind === 'title' ? styles.title : styles.heading}>{slide.heading}</h1>
      {'body' in slide && slide.body ? <p style={styles.body}>{slide.body}</p> : null}
      {'bullets' in slide && slide.bullets ? <BulletList bullets={slide.bullets} /> : null}
      {'code' in slide && slide.code ? <CodeBlock code={slide.code} /> : null}
    </div>
  );
};

const DocumentSlideView = ({slide}: {slide: Slide}) => {
  if (!slide.backgroundImage) {
    return null;
  }

  return (
    <AbsoluteFill style={styles.documentRoot}>
      <Img src={staticFile(slide.backgroundImage)} style={styles.documentPage} />
    </AbsoluteFill>
  );
};

export const CourseVideo = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const activeSlide = getActiveSlide(frame, fps);
  const progress = frame / Math.max(1, durationInFrames - 1);
  const isDocumentMode = videoCourse.mode === 'document' || isDocumentSlide(activeSlide);

  return (
    <AbsoluteFill style={isDocumentMode ? styles.documentShell : styles.root}>
      {!isDocumentMode ? <Audio src={staticFile('voice.wav')} /> : null}
      {isDocumentMode ? (
        <DocumentSlideView key={activeSlide.start} slide={activeSlide} />
      ) : (
        <>
          <div style={styles.backgroundAccent} />
          <div style={styles.topBar}>
            <div style={styles.logoMark}>Py</div>
            <div style={styles.courseName}>{videoCourse.title}</div>
            <div style={styles.demoBadge}>AI 配音演示</div>
          </div>
          <SlideView key={activeSlide.start} slide={activeSlide} />
          {activeSlide.caption ? <div style={styles.caption}>{activeSlide.caption}</div> : null}
        </>
      )}
      <div style={styles.progressTrack}>
        <div style={{...styles.progressFill, width: `${progress * 100}%`}} />
      </div>
    </AbsoluteFill>
  );
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    background: palette.paper,
    color: palette.ink,
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    overflow: 'hidden',
  },
  documentShell: {
    background: '#111827',
    color: '#ffffff',
    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    overflow: 'hidden',
  },
  documentRoot: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  documentPage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  backgroundAccent: {
    position: 'absolute',
    right: -180,
    top: 130,
    width: 650,
    height: 650,
    borderRadius: 26,
    background: '#e7eef8',
    transform: 'rotate(13deg)',
  },
  topBar: {
    position: 'absolute',
    top: 54,
    left: 78,
    right: 78,
    height: 76,
    display: 'flex',
    alignItems: 'center',
    gap: 22,
    zIndex: 2,
  },
  logoMark: {
    width: 66,
    height: 66,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: palette.blue,
    color: '#fff',
    fontSize: 28,
    fontWeight: 800,
  },
  courseName: {
    fontSize: 30,
    fontWeight: 700,
  },
  demoBadge: {
    marginLeft: 'auto',
    border: `2px solid ${palette.line}`,
    borderRadius: 8,
    padding: '12px 18px',
    color: palette.muted,
    fontSize: 24,
    background: 'rgba(255,255,255,0.72)',
  },
  slide: {
    position: 'absolute',
    left: 116,
    top: 190,
    width: 1160,
    minHeight: 610,
    padding: '62px 68px',
    borderRadius: 8,
    background: palette.panel,
    boxShadow: '0 22px 70px rgba(42, 54, 75, 0.14)',
    border: `1px solid ${palette.line}`,
    zIndex: 1,
  },
  kicker: {
    color: palette.green,
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 26,
  },
  title: {
    margin: 0,
    maxWidth: 980,
    fontSize: 86,
    lineHeight: 1.08,
    letterSpacing: 0,
  },
  heading: {
    margin: 0,
    maxWidth: 980,
    fontSize: 64,
    lineHeight: 1.12,
    letterSpacing: 0,
  },
  body: {
    marginTop: 32,
    marginBottom: 0,
    maxWidth: 950,
    color: palette.muted,
    fontSize: 38,
    lineHeight: 1.45,
  },
  bullets: {
    marginTop: 38,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  bullet: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    color: palette.ink,
    fontSize: 38,
    lineHeight: 1.25,
  },
  bulletDot: {
    width: 18,
    height: 18,
    borderRadius: 4,
    background: palette.amber,
    flex: '0 0 auto',
  },
  codeBlock: {
    marginTop: 38,
    width: 790,
    borderRadius: 8,
    background: '#151b27',
    color: '#eaf0fa',
    padding: '30px 34px',
    fontFamily: 'Consolas, "Cascadia Mono", monospace',
    fontSize: 35,
    lineHeight: 1.65,
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
  },
  codeLine: {
    display: 'flex',
    gap: 26,
    whiteSpace: 'pre',
  },
  lineNumber: {
    color: '#7f8aa3',
    width: 34,
    textAlign: 'right',
  },
  caption: {
    position: 'absolute',
    left: 116,
    right: 116,
    bottom: 82,
    minHeight: 74,
    borderRadius: 8,
    background: '#172033',
    color: '#ffffff',
    padding: '22px 32px',
    fontSize: 30,
    lineHeight: 1.35,
    zIndex: 3,
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 14,
    background: '#d6dce8',
  },
  progressFill: {
    height: '100%',
    background: palette.green,
  },
};
