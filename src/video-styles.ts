import type React from 'react';
import type {LayoutPreset, Theme} from './themes';

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

export const createVideoStyles = (theme: Theme): Record<string, React.CSSProperties> => {
  const presetStyles = getPresetStyles(theme);
  const patternStyles = getPatternStyles(theme);

  return {
    root: {
      background: `${theme.backgroundLayers.vignette}, ${theme.backgroundLayers.base}`,
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
      color: theme.text,
      padding: '0 32px',
      fontSize: 30,
      lineHeight: 1.35,
      textShadow: `0 2px 10px ${theme.panel}, 0 0 3px ${theme.panel}`,
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
};
