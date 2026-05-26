import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import course from '../course.json';
import type {RenderCourse, Slide} from './course-schema';
import {resolveTheme, type LayoutPreset, type Theme} from './themes';

const videoCourse = course as RenderCourse;

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

const secondsToFrame = (seconds: number, fps: number) => Math.round(seconds * fps);

const getActiveSlide = (frame: number, fps: number): Slide => {
  return (
    videoCourse.slides.find(
      (slide) => frame >= secondsToFrame(slide.start, fps) && frame < secondsToFrame(slide.end, fps),
    ) ?? videoCourse.slides[videoCourse.slides.length - 1]
  );
};

const isDocumentSlide = (slide: Slide) => slide.kind === 'document' && Boolean(slide.backgroundImage);

const normalizeStaticPath = (filePath: string) => filePath.replaceAll('\\', '/').replace(/^public\//, '');

const getAudioSrc = (slide: Slide) => ('audioSrc' in slide ? slide.audioSrc : undefined);

const getBackgroundImage = (slide: Slide) => ('backgroundImage' in slide ? slide.backgroundImage : undefined);

const getBody = (slide: Slide) => ('body' in slide ? slide.body : undefined);

const getBullets = (slide: Slide) => ('bullets' in slide ? slide.bullets : undefined);

const getCode = (slide: Slide) => ('code' in slide ? slide.code : undefined);

const getPatternStyles = (activeTheme: Theme): React.CSSProperties => {
  const common: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
  };

  if (activeTheme.pattern === 'blueprint') {
    return {
      ...common,
      backgroundImage: `linear-gradient(${activeTheme.line} 1px, transparent 1px), linear-gradient(90deg, ${activeTheme.line} 1px, transparent 1px)`,
      backgroundSize: '72px 72px',
      opacity: 0.3,
    };
  }

  if (activeTheme.pattern === 'terminal' || activeTheme.pattern === 'grid') {
    return {
      ...common,
      backgroundImage: `linear-gradient(${activeTheme.line} 1px, transparent 1px), linear-gradient(90deg, ${activeTheme.line} 1px, transparent 1px)`,
      backgroundSize: activeTheme.pattern === 'terminal' ? '48px 48px' : '64px 64px',
      opacity: activeTheme.pattern === 'terminal' ? 0.18 : 0.16,
    };
  }

  if (activeTheme.pattern === 'dots') {
    return {
      ...common,
      backgroundImage: `radial-gradient(${activeTheme.line} 1.5px, transparent 1.5px)`,
      backgroundSize: '34px 34px',
      opacity: 0.28,
    };
  }

  if (activeTheme.pattern === 'paper' || activeTheme.pattern === 'zine') {
    return {
      ...common,
      backgroundImage: `linear-gradient(90deg, ${activeTheme.line} 1px, transparent 1px), linear-gradient(${activeTheme.line} 1px, transparent 1px)`,
      backgroundSize: activeTheme.pattern === 'zine' ? '42px 42px' : '96px 96px',
      opacity: activeTheme.pattern === 'zine' ? 0.18 : 0.12,
    };
  }

  if (activeTheme.pattern === 'botanical') {
    return {
      ...common,
      backgroundImage: `radial-gradient(circle at 20% 30%, ${activeTheme.line} 0 2px, transparent 3px), radial-gradient(circle at 80% 70%, ${activeTheme.accent} 0 2px, transparent 3px)`,
      backgroundSize: '86px 86px, 120px 120px',
      opacity: 0.16,
    };
  }

  if (activeTheme.pattern === 'stripes') {
    return {
      ...common,
      backgroundImage: `repeating-linear-gradient(135deg, ${activeTheme.line} 0 2px, transparent 2px 24px)`,
      opacity: 0.1,
    };
  }

  return {...common, opacity: 0};
};

const getPresetStyles = (activeTheme: Theme): Record<string, React.CSSProperties> => {
  const preset: LayoutPreset = activeTheme.layoutPreset;
  const stagePadding = activeTheme.stagePadding;
  const panelBorder = `${activeTheme.borderWidth}px solid ${activeTheme.line}`;

  if (preset === 'editorial-split') {
    return {
      backgroundAccent: {
        position: 'absolute',
        right: 0,
        top: 0,
        width: 600,
        height: '100%',
        background: activeTheme.accent,
        opacity: 0.16,
      },
      slide: {
        position: 'absolute',
        left: stagePadding,
        top: 176,
        width: 1010,
        minHeight: 650,
        padding: '58px 64px',
        borderRadius: activeTheme.radius,
        background: activeTheme.panel,
        boxShadow: activeTheme.shadow,
        border: panelBorder,
        zIndex: 1,
      },
      title: {fontSize: 86, lineHeight: 1.02},
      heading: {fontSize: 66, lineHeight: 1.08},
      caption: {
        left: stagePadding,
        right: stagePadding,
        bottom: 72,
        background: activeTheme.text,
        color: activeTheme.panel,
      },
    };
  }

  if (preset === 'terminal-code') {
    return {
      backgroundAccent: {
        position: 'absolute',
        inset: 0,
        backgroundImage: `linear-gradient(${activeTheme.line} 1px, transparent 1px), linear-gradient(90deg, ${activeTheme.line} 1px, transparent 1px)`,
        backgroundSize: '64px 64px',
        opacity: 0.22,
      },
      slide: {
        position: 'absolute',
        left: stagePadding,
        top: 158,
        width: 1260,
        minHeight: 660,
        padding: '52px 58px',
        borderRadius: activeTheme.radius,
        background: activeTheme.panel,
        boxShadow: activeTheme.shadow,
        border: panelBorder,
        zIndex: 1,
      },
      title: {fontSize: 78, lineHeight: 1.08},
      heading: {fontSize: 58, lineHeight: 1.12},
      caption: {
        left: stagePadding,
        right: stagePadding,
        bottom: 66,
        background: activeTheme.codeBg,
        color: activeTheme.codeText,
      },
    };
  }

  return {
    backgroundAccent: {
      position: 'absolute',
      right: -180,
      top: 130,
      width: 650,
      height: 650,
      borderRadius: 26,
      background: activeTheme.accent,
      opacity: 0.12,
      transform: 'rotate(13deg)',
    },
    slide: {
      position: 'absolute',
      left: stagePadding,
      top: 190,
      width: 1160,
      minHeight: 610,
      padding: '62px 68px',
      borderRadius: activeTheme.radius,
      background: activeTheme.panel,
      boxShadow: activeTheme.shadow,
      border: panelBorder,
      zIndex: 1,
    },
    title: {fontSize: 86, lineHeight: 1.08},
    heading: {fontSize: 64, lineHeight: 1.12},
    caption: {
      left: stagePadding,
      right: stagePadding,
      bottom: 82,
      background: activeTheme.text,
      color: activeTheme.panel,
    },
  };
};

const presetStyles = getPresetStyles(theme);
const patternStyles = getPatternStyles(theme);

const CodeBlock = ({code}: {code: string}) => {
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

const SlideView = ({slide}: {slide: Slide}) => {
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
      {bullets ? <BulletList bullets={bullets} /> : null}
      {code ? <CodeBlock code={code} /> : null}
    </div>
  );
};

const DocumentSlideView = ({slide}: {slide: Slide}) => {
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

const SegmentedAudio = ({slides, fps}: {slides: Slide[]; fps: number}) => {
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

export const CourseVideo = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const activeSlide = getActiveSlide(frame, fps);
  const progress = frame / Math.max(1, durationInFrames - 1);
  const isDocumentMode = ('mode' in videoCourse && videoCourse.mode === 'document') || isDocumentSlide(activeSlide);

  return (
    <AbsoluteFill style={isDocumentMode ? styles.documentShell : styles.root}>
      {!isDocumentMode && hasSegmentedAudio ? <SegmentedAudio slides={videoCourse.slides} fps={fps} /> : null}
      {!isDocumentMode && !hasSegmentedAudio ? <Audio src={staticFile('voice.wav')} /> : null}
      {isDocumentMode ? (
        <DocumentSlideView key={activeSlide.start} slide={activeSlide} />
      ) : (
        <>
          <div style={styles.backgroundPattern} />
          <div style={styles.backgroundAccent} />
          <div style={styles.topBar}>
            <div style={styles.courseName}>{videoCourse.title}</div>
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
    background: `${theme.vignette}, ${theme.background}`,
    color: theme.text,
    fontFamily: theme.fontFamily,
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
  backgroundPattern: patternStyles,
  backgroundAccent: presetStyles.backgroundAccent,
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
  courseName: {
    fontSize: 30,
    fontWeight: 700,
    maxWidth: 1050,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  slide: presetStyles.slide,
  kicker: {
    color: theme.accent2,
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 26,
  },
  title: {
    margin: 0,
    maxWidth: 980,
    fontSize: (presetStyles.title as {fontSize: number}).fontSize,
    lineHeight: (presetStyles.title as {lineHeight: number}).lineHeight,
    letterSpacing: 0,
  },
  heading: {
    margin: 0,
    maxWidth: 980,
    fontSize: (presetStyles.heading as {fontSize: number}).fontSize,
    lineHeight: (presetStyles.heading as {lineHeight: number}).lineHeight,
    letterSpacing: 0,
  },
  body: {
    marginTop: 32,
    marginBottom: 0,
    maxWidth: 950,
    color: theme.muted,
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
    color: theme.text,
    fontSize: 38,
    lineHeight: 1.25,
  },
  bulletDot: {
    width: 18,
    height: 18,
    borderRadius: 4,
    background: theme.accent,
    flex: '0 0 auto',
  },
  codeBlock: {
    marginTop: 38,
    width: 790,
    borderRadius: 8,
    background: theme.codeBg,
    color: theme.codeText,
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
    color: theme.muted,
    width: 34,
    textAlign: 'right',
  },
  caption: {
    position: 'absolute',
    left: (presetStyles.caption as {left: number}).left,
    right: (presetStyles.caption as {right: number}).right,
    bottom: (presetStyles.caption as {bottom: number}).bottom,
    minHeight: 74,
    borderRadius: theme.radius,
    background: (presetStyles.caption as {background: string}).background,
    color: (presetStyles.caption as {color: string}).color,
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
    background: theme.line,
  },
  progressFill: {
    height: '100%',
    background: theme.progress,
  },
};
