import type React from 'react';
import type {LayoutPreset, Theme} from './themes';

const isNewsroom = (theme: Theme) => theme.signature === 'newsroom';

const isDarkTheme = (theme: Theme) =>
  ['tool', 'terminal', 'glass-tool', 'experimental', 'botanical'].includes(theme.styleFamily) ||
  theme.background.startsWith('#0') ||
  theme.background.startsWith('#1');

const fontBody = (theme: Theme) => theme.fontBody ?? theme.fontFamily;

const fontMono = (theme: Theme) => theme.fontMono ?? 'Consolas, "Cascadia Mono", monospace';

const isFlatFamily = (theme: Theme) =>
  ['brutalist', 'poster', 'swiss', 'minimal', 'terminal', 'editorial', 'retro'].includes(theme.styleFamily);

const isDenseFamily = (theme: Theme) => ['terminal', 'data-ink', 'swiss'].includes(theme.styleFamily);

const isRawWebRecipe = (theme: Theme) => theme.recipe === 'are-na';

const isQuietMinimalRecipe = (theme: Theme) => ['apple-hig', 'muji-kenya-hara'].includes(theme.recipe);

const isPlayfulHumanistRecipe = (theme: Theme) =>
  ['headspace-meditation', 'mailchimp-freddie', 'notion-pre-ai'].includes(theme.recipe);

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
    const stripeColor = isNewsroom(activeTheme)
      ? activeTheme.faint ?? activeTheme.line
      : activeTheme.line;

    return {
      ...common,
      backgroundImage: `repeating-linear-gradient(135deg, ${stripeColor} 0 1px, transparent 1px 28px)`,
      opacity: isNewsroom(activeTheme) ? 0.055 : 0.1,
    };
  }

  if (activeTheme.styleFamily === 'terminal') {
    return {
      ...common,
      backgroundImage: [
        `linear-gradient(${activeTheme.line} 1px, transparent 1px)`,
        `linear-gradient(90deg, ${activeTheme.line} 1px, transparent 1px)`,
        `repeating-linear-gradient(0deg, transparent 0 23px, ${activeTheme.accentSoft ?? activeTheme.line} 23px 24px)`,
      ].join(', '),
      backgroundSize: '54px 54px, 54px 54px, 100% 24px',
      opacity: 0.48,
    };
  }

  if (activeTheme.styleFamily === 'swiss') {
    return {
      ...common,
      backgroundImage: `linear-gradient(90deg, transparent 0 24%, ${activeTheme.line} 24% calc(24% + 2px), transparent calc(24% + 2px) 100%)`,
      opacity: 0.08,
    };
  }

  if (activeTheme.styleFamily === 'retro') {
    return {
      ...common,
      backgroundImage: [
        `radial-gradient(circle at 16% 72%, ${activeTheme.accent} 0 150px, transparent 152px)`,
        `linear-gradient(120deg, transparent 0 62%, ${activeTheme.accent2} 62% 78%, transparent 78%)`,
      ].join(', '),
      opacity: 0.2,
    };
  }

  return {...common, opacity: 0};
};

// Soft modern shadow that most themes should use. Hard offset shadows like
// `14px 14px 0 rgba(...)` feel dated on dense editorial layouts; themes can
// still override via their own `shadow` string when they want a flat-color
// drop (e.g. bauhaus-bold, kraft-paper, bold-signal).
const softShadow = (color: string) =>
  `0 24px 60px -16px ${color}, 0 2px 6px ${color.replace(/[\d.]+\)$/, '0.04)')}`;

const getPresetStyles = (activeTheme: Theme): Record<string, React.CSSProperties> => {
  const preset: LayoutPreset = activeTheme.layoutPreset;
  const stagePadding = activeTheme.stagePaddingX ?? activeTheme.stagePadding;
  const stagePaddingY = activeTheme.stagePaddingY ?? activeTheme.stagePadding;
  const ruleWidth = activeTheme.ruleWidth ?? activeTheme.borderWidth;
  const ruleStyle = activeTheme.ruleStyle ?? 'solid';
  const panelBorder = activeTheme.borderWidth > 0 ? `${activeTheme.borderWidth}px ${ruleStyle} ${activeTheme.line}` : 'none';
  const themeShadow = activeTheme.cardShadow ?? activeTheme.shadow;
  const flat = isFlatFamily(activeTheme);
  const dense = isDenseFamily(activeTheme);
  const cardShadow = flat || themeShadow === 'none' || themeShadow.startsWith('0 0 0') || themeShadow.includes('rgba(0,0,0,0.25)')
    ? themeShadow
    : softShadow('rgba(15, 18, 28, 0.18)');

  if (isNewsroom(activeTheme)) {
    return {
      backgroundAccent: {
        position: 'absolute',
        left: stagePadding,
        right: stagePadding,
        top: 166,
        height: 4,
        background: activeTheme.accent,
        boxShadow: `0 11px 0 ${activeTheme.line}`,
        opacity: 0.92,
      },
      slide: {
        position: 'absolute',
        left: stagePadding,
        top: 198,
        right: stagePadding,
        minHeight: 650,
        padding: 0,
        borderRadius: 0,
        background: 'transparent',
        boxShadow: 'none',
        border: 'none',
        zIndex: 1,
      },
      title: {fontSize: 122, lineHeight: 0.92},
      heading: {fontSize: 76, lineHeight: 0.98},
      caption: {
        left: stagePadding,
        right: stagePadding,
        bottom: 74,
        background: activeTheme.text,
        color: activeTheme.panel,
      },
    };
  }

  if (isPlayfulHumanistRecipe(activeTheme)) {
    const mailchimp = activeTheme.recipe === 'mailchimp-freddie';
    const headspace = activeTheme.recipe === 'headspace-meditation';

    return {
      backgroundAccent: {
        position: 'absolute',
        right: mailchimp ? 180 : headspace ? 250 : 210,
        top: mailchimp ? 196 : 170,
        width: mailchimp ? 520 : headspace ? 360 : 420,
        height: mailchimp ? 330 : headspace ? 360 : 420,
        borderRadius: headspace ? 999 : mailchimp ? 26 : 12,
        background: mailchimp
          ? activeTheme.accent
          : headspace
            ? activeTheme.surface2 ?? activeTheme.accent
            : activeTheme.surface2 ?? activeTheme.panel,
        opacity: mailchimp ? 0.16 : headspace ? 0.58 : 0.5,
        transform: mailchimp ? 'rotate(-8deg)' : headspace ? 'none' : 'rotate(4deg)',
      },
      slide: {
        position: 'absolute',
        left: 116,
        top: mailchimp ? 186 : 206,
        width: mailchimp ? 1030 : 980,
        minHeight: 560,
        padding: mailchimp ? '34px 0' : '28px 36px',
        borderRadius: 0,
        background: 'transparent',
        boxShadow: 'none',
        border: 'none',
        zIndex: 1,
      },
      title: {fontSize: mailchimp ? 118 : 96, lineHeight: mailchimp ? 0.9 : 1.04},
      heading: {fontSize: mailchimp ? 82 : 66, lineHeight: 1.04},
      caption: {
        left: 116,
        right: 116,
        bottom: 86,
        background: activeTheme.background,
        color: activeTheme.text,
      },
    };
  }

  if (preset === 'editorial-split') {
    if (isRawWebRecipe(activeTheme)) {
      return {
        backgroundAccent: {
          position: 'absolute',
          left: 78,
          top: 142,
          width: 230,
          bottom: 0,
          background: activeTheme.surface2 ?? activeTheme.panel,
          borderRight: `1px solid ${activeTheme.line}`,
          opacity: 1,
        },
        slide: {
          position: 'absolute',
          left: 118,
          top: 174,
          width: 1080,
          minHeight: 620,
          padding: '38px 42px',
          borderRadius: 0,
          background: activeTheme.panel,
          boxShadow: 'none',
          border: `1px solid ${activeTheme.line}`,
          zIndex: 1,
        },
        title: {fontSize: 112, lineHeight: 0.96},
        heading: {fontSize: 78, lineHeight: 1.02},
        caption: {
          left: 92,
          right: 92,
          bottom: 84,
          background: activeTheme.panel,
          color: activeTheme.text,
        },
      };
    }

    const posterLike = ['poster', 'brutalist', 'swiss', 'retro'].includes(activeTheme.styleFamily);
    const panelWidth = posterLike ? 1120 : 1020;
    const panelTop = posterLike ? 170 : 196;
    const panelPadding = posterLike ? '54px 58px 66px' : '64px 72px 72px';

    return {
      backgroundAccent: {
        // Thin vertical column rule on the right side, reading as a
        // newspaper-style column divider instead of the old 600px colored
        // block that fought with the slide card.
        position: 'absolute',
        right: posterLike ? 0 : 104,
        top: posterLike ? 0 : 196,
        bottom: posterLike ? 0 : 220,
        width: posterLike ? 420 : 1,
        background: posterLike
          ? `linear-gradient(180deg, ${activeTheme.accent}, ${activeTheme.accent2})`
          : activeTheme.accent,
        opacity: posterLike ? 0.95 : 0.55,
      },
      slide: {
        position: 'absolute',
        left: stagePadding,
        top: panelTop,
        width: panelWidth,
        minHeight: 660,
        padding: panelPadding,
        borderRadius: activeTheme.radius,
        background: activeTheme.panel,
        boxShadow: cardShadow,
        border: panelBorder,
        zIndex: 1,
      },
      title: {fontSize: posterLike ? 124 : 104, lineHeight: posterLike ? 0.92 : 1.0},
      heading: {fontSize: posterLike ? 86 : 72, lineHeight: posterLike ? 0.96 : 1.06},
      caption: {
        left: stagePadding,
        right: stagePadding,
        bottom: 84,
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
        backgroundImage: dense
          ? [
              `linear-gradient(${activeTheme.line} 1px, transparent 1px)`,
              `linear-gradient(90deg, ${activeTheme.line} 1px, transparent 1px)`,
              `linear-gradient(90deg, ${activeTheme.panel} 0 31%, transparent 31% 33%, ${activeTheme.surface2 ?? activeTheme.panel} 33% 65%, transparent 65% 67%, ${activeTheme.panel} 67% 100%)`,
            ].join(', ')
          : `linear-gradient(${activeTheme.line} 1px, transparent 1px), linear-gradient(90deg, ${activeTheme.line} 1px, transparent 1px)`,
        backgroundSize: dense ? '64px 64px, 64px 64px, auto' : '64px 64px',
        opacity: dense ? 0.34 : 0.18,
      },
      slide: {
        position: 'absolute',
        left: stagePadding,
        top: dense ? 130 : 168,
        width: activeTheme.styleFamily === 'terminal' ? 1040 : dense ? 1440 : 1260,
        minHeight: dense ? 780 : 680,
        padding: activeTheme.styleFamily === 'terminal' ? '42px 46px' : dense ? '42px 46px' : '56px 64px',
        borderRadius: activeTheme.radius,
        background: activeTheme.panel,
        boxShadow: cardShadow,
        border: panelBorder,
        zIndex: 1,
      },
      title: {fontSize: activeTheme.styleFamily === 'terminal' ? 58 : dense ? 64 : 84, lineHeight: dense ? 1.0 : 1.06},
      heading: {fontSize: activeTheme.styleFamily === 'terminal' ? 44 : dense ? 48 : 62, lineHeight: dense ? 1.08 : 1.1},
      caption: {
        left: stagePadding,
        right: stagePadding,
        bottom: 72,
        background: activeTheme.codeBg,
        color: activeTheme.codeText,
      },
    };
  }

  if (isQuietMinimalRecipe(activeTheme)) {
    const apple = activeTheme.recipe === 'apple-hig';

    return {
      backgroundAccent: {
        position: 'absolute',
        right: apple ? 210 : 180,
        top: apple ? 188 : 178,
        width: apple ? 360 : 110,
        height: apple ? 360 : 110,
        borderRadius: apple ? 38 : 0,
        background: apple
          ? `linear-gradient(145deg, ${activeTheme.surface2 ?? activeTheme.panel}, ${activeTheme.surface3 ?? activeTheme.background})`
          : activeTheme.accent,
        opacity: apple ? 0.7 : 0.9,
        transform: apple ? 'rotate(-8deg)' : 'none',
      },
      slide: {
        position: 'absolute',
        left: apple ? 156 : 186,
        top: apple ? 212 : 234,
        width: apple ? 1120 : 980,
        minHeight: apple ? 560 : 500,
        padding: apple ? '46px 54px' : '0',
        borderRadius: apple ? activeTheme.radius : 0,
        background: apple ? activeTheme.panel : 'transparent',
        boxShadow: apple ? activeTheme.shadow : 'none',
        border: apple ? `1px solid ${activeTheme.line}` : 'none',
        zIndex: 1,
      },
      title: {fontSize: apple ? 108 : 96, lineHeight: apple ? 0.98 : 1.14},
      heading: {fontSize: apple ? 72 : 64, lineHeight: 1.12},
      caption: {
        left: 156,
        right: 156,
        bottom: 96,
        background: activeTheme.background,
        color: activeTheme.text,
      },
    };
  }

  return {
    backgroundAccent: {
      position: 'absolute',
      right: activeTheme.styleFamily === 'humanist' ? -80 : -180,
      top: activeTheme.styleFamily === 'humanist' ? 90 : 130,
      width: activeTheme.styleFamily === 'humanist' ? 520 : 650,
      height: activeTheme.styleFamily === 'humanist' ? 520 : 650,
      borderRadius: activeTheme.styleFamily === 'humanist' ? 999 : 26,
      background: activeTheme.styleFamily === 'humanist'
        ? activeTheme.accentSoft ?? activeTheme.accent
        : activeTheme.accent,
      opacity: activeTheme.styleFamily === 'humanist' ? 0.55 : 0.1,
      transform: activeTheme.styleFamily === 'humanist' ? 'none' : 'rotate(13deg)',
    },
    slide: {
      position: 'absolute',
      left: activeTheme.styleFamily === 'humanist' || activeTheme.styleFamily === 'warm-print' ? 116 : stagePadding,
      top: activeTheme.styleFamily === 'humanist' || activeTheme.styleFamily === 'warm-print' ? 184 : 196,
      width: activeTheme.styleFamily === 'humanist' || activeTheme.styleFamily === 'warm-print' ? 980 : 1160,
      minHeight: activeTheme.styleFamily === 'humanist' || activeTheme.styleFamily === 'warm-print' ? 590 : 640,
      padding: activeTheme.styleFamily === 'humanist' || activeTheme.styleFamily === 'warm-print' ? '58px 66px' : '64px 72px',
      borderRadius: activeTheme.radius,
      background: activeTheme.panel,
      boxShadow: activeTheme.styleFamily === 'humanist' || activeTheme.styleFamily === 'warm-print' ? 'none' : cardShadow,
      border: activeTheme.styleFamily === 'humanist' || activeTheme.styleFamily === 'warm-print' ? 'none' : panelBorder,
      zIndex: 1,
    },
    title: {fontSize: activeTheme.styleFamily === 'humanist' || activeTheme.styleFamily === 'warm-print' ? 92 : 96, lineHeight: 1.04},
    heading: {fontSize: activeTheme.styleFamily === 'humanist' || activeTheme.styleFamily === 'warm-print' ? 64 : 68, lineHeight: 1.08},
    caption: {
      left: stagePadding,
      right: stagePadding,
      bottom: 84,
      background: activeTheme.text,
      color: activeTheme.panel,
    },
  };
};

export const createVideoStyles = (theme: Theme): Record<string, React.CSSProperties> => {
  const presetStyles = getPresetStyles(theme);
  const patternStyles = getPatternStyles(theme);
  const newsroom = isNewsroom(theme);
  const dark = isDarkTheme(theme);
  const flat = isFlatFamily(theme);
  const dense = isDenseFamily(theme);
  const poster = ['poster', 'brutalist', 'swiss', 'retro'].includes(theme.styleFamily);
  const literary = ['humanist', 'warm-print', 'editorial', 'data-ink'].includes(theme.styleFamily);
  const ruleWidth = theme.ruleWidth ?? theme.borderWidth;
  const ruleStyle = theme.ruleStyle ?? 'solid';
  const bodyFont = fontBody(theme);
  const monoFont = fontMono(theme);

  return {
    root: {
      background: newsroom
        ? `${theme.backgroundLayers.vignette}, ${theme.shell ?? theme.background}`
        : `${theme.backgroundLayers.vignette}, ${theme.backgroundLayers.base}`,
      color: theme.text,
      fontFamily: bodyFont,
      overflow: 'hidden',
    },
    newsroomStageFrame: {
      position: 'absolute',
      left: 58,
      right: 58,
      top: 38,
      bottom: 38,
      background: newsroom
        ? [
            `radial-gradient(${theme.accentSoft ?? 'rgba(201, 48, 44, 0.10)'} 0.45px, transparent 0.9px)`,
            `radial-gradient(rgba(20, 17, 11, 0.045) 0.55px, transparent 1px)`,
            `radial-gradient(rgba(167, 157, 134, 0.12) 0.55px, transparent 1px)`,
            `linear-gradient(180deg, ${theme.background}, ${theme.surface2 ?? theme.panel})`,
          ].join(', ')
        : 'transparent',
      backgroundSize: newsroom ? '23px 23px, 31px 31px, 47px 47px, auto' : undefined,
      boxShadow: newsroom ? theme.shadow : undefined,
      border: newsroom ? `1px solid ${theme.faint ?? theme.line}` : undefined,
      zIndex: 0,
      pointerEvents: 'none',
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
    themeFrameA: {
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 0,
      ...(newsroom || isRawWebRecipe(theme)
        ? {display: 'none'}
        : dense
        ? {
            left: 46,
            right: 46,
            top: 98,
            bottom: 108,
            border: `${ruleWidth}px ${ruleStyle} ${theme.line}`,
            backgroundImage: [
              `linear-gradient(90deg, transparent 0 28%, ${theme.line} 28% calc(28% + 1px), transparent calc(28% + 1px) 62%, ${theme.line} 62% calc(62% + 1px), transparent calc(62% + 1px))`,
              `linear-gradient(0deg, transparent 0 18%, ${theme.line} 18% calc(18% + 1px), transparent calc(18% + 1px) 56%, ${theme.line} 56% calc(56% + 1px), transparent calc(56% + 1px))`,
            ].join(', '),
            opacity: 0.78,
          }
        : literary
          ? {
              left: 96,
              right: 96,
              top: 142,
              bottom: 138,
              borderTop: `${ruleWidth}px ${ruleStyle} ${theme.line}`,
              borderBottom: `${ruleWidth}px ${ruleStyle} ${theme.line}`,
              backgroundImage: `linear-gradient(90deg, transparent 0 34%, ${theme.line} 34% calc(34% + 1px), transparent calc(34% + 1px))`,
              opacity: 0.38,
            }
          : poster
            ? {
                left: 0,
                top: 0,
                bottom: 0,
                width: theme.styleFamily === 'retro' ? 520 : 260,
                background: theme.accent,
                opacity: theme.styleFamily === 'retro' ? 0.16 : 0.12,
              }
            : {
                right: 92,
                top: 154,
                bottom: 176,
                width: 1,
                background: theme.line,
                opacity: 0.36,
            }),
    },
    themeFrameB: {
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 0,
      ...(newsroom || isRawWebRecipe(theme)
        ? {display: 'none'}
        : dense
        ? {
            left: 46,
            right: 46,
            top: 98,
            height: 32,
            background: theme.surface2 ?? theme.panel,
            borderBottom: `${ruleWidth}px ${ruleStyle} ${theme.line}`,
            opacity: 0.82,
          }
        : literary
          ? {
              right: 120,
              top: 186,
              width: 320,
              height: 520,
              border: `${ruleWidth}px ${ruleStyle} ${theme.line}`,
              background: theme.surface2 ?? theme.panel,
              opacity: theme.styleFamily === 'humanist' ? 0.22 : 0.32,
              transform: theme.styleFamily === 'warm-print' ? 'rotate(3deg)' : 'none',
            }
          : poster
            ? {
                right: 0,
                top: 0,
                bottom: 0,
                width: theme.styleFamily === 'retro' ? 390 : 420,
                background: theme.accent2,
                opacity: theme.styleFamily === 'swiss' ? 0.95 : 0.82,
              }
            : {
                right: -80,
                top: 90,
                width: 520,
                height: 520,
                borderRadius: theme.styleFamily === 'glass-tool' ? 28 : 999,
                background: theme.accentGlow ?? theme.accent,
                opacity: 0.26,
            }),
    },
    themeFrameC: {
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 0,
      ...(dense && !isRawWebRecipe(theme)
        ? {
            left: theme.styleFamily === 'terminal' ? 1138 : 682,
            right: 46,
            top: 130,
            bottom: 108,
            opacity: 0.72,
            backgroundImage: [
              `linear-gradient(0deg, ${theme.line} 0 1px, transparent 1px 36px)`,
              `linear-gradient(90deg, transparent 0 18%, ${theme.line} 18% calc(18% + 1px), transparent calc(18% + 1px) 44%, ${theme.line} 44% calc(44% + 1px), transparent calc(44% + 1px) 70%, ${theme.line} 70% calc(70% + 1px), transparent calc(70% + 1px))`,
              `repeating-linear-gradient(0deg, transparent 0 35px, ${theme.accentSoft ?? theme.line} 35px 36px)`,
            ].join(', '),
            backgroundSize: '100% 36px, auto, auto',
          }
        : {display: 'none'}),
    },
    backgroundPattern: patternStyles,
    backgroundAccent: presetStyles.backgroundAccent,
    newsroomScene: presetStyles.slide,
    newsroomMasthead: {
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      marginBottom: 18,
      fontFamily: monoFont,
      fontSize: 20,
      letterSpacing: 2.2,
      textTransform: 'uppercase',
      color: theme.accent,
      fontWeight: 700,
    },
    newsroomMastheadName: {
      flex: '0 0 auto',
    },
    newsroomRule: {
      height: 2,
      flex: 1,
      background: theme.accent,
      opacity: 0.82,
    },
    newsroomMastheadIssue: {
      flex: '0 0 auto',
      color: theme.muted,
    },
    newsroomHeroLayout: {
      display: 'grid',
      gridTemplateColumns: '1fr 410px',
      gap: 54,
      alignItems: 'start',
      paddingTop: 18,
    },
    newsroomHeroTitle: {
      margin: 0,
      fontFamily: theme.fontFamily,
      fontSize: 138,
      lineHeight: 0.9,
      fontWeight: 900,
      letterSpacing: -1.2,
      color: theme.text,
      maxWidth: 1110,
    },
    newsroomStandfirst: {
      marginTop: 30,
      maxWidth: 980,
      color: theme.text2 ?? theme.muted,
      fontFamily: bodyFont,
      fontSize: 36,
      lineHeight: 1.5,
    },
    newsroomBrief: {
      borderTop: `4px solid ${theme.accent}`,
      borderBottom: `${ruleWidth}px ${ruleStyle} ${theme.line}`,
      padding: '22px 0 26px',
      color: theme.text,
      fontFamily: bodyFont,
    },
    newsroomLabel: {
      fontFamily: monoFont,
      fontSize: 16,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: theme.muted,
      marginBottom: 16,
    },
    newsroomBriefText: {
      margin: 0,
      fontSize: 29,
      lineHeight: 1.42,
      color: theme.text,
    },
    newsroomTwoColumn: {
      display: 'grid',
      gridTemplateColumns: '520px 1fr',
      gap: 48,
      alignItems: 'start',
    },
    newsroomSectionTitle: {
      margin: 0,
      fontFamily: theme.fontFamily,
      fontSize: 86,
      lineHeight: 0.98,
      fontWeight: 900,
      letterSpacing: -0.6,
      color: theme.text,
    },
    newsroomLead: {
      marginTop: 26,
      fontFamily: bodyFont,
      fontSize: 30,
      lineHeight: 1.55,
      color: theme.text2 ?? theme.muted,
    },
    newsroomList: {
      borderTop: `${ruleWidth}px ${ruleStyle} ${theme.line}`,
      borderBottom: `${ruleWidth}px ${ruleStyle} ${theme.line}`,
    },
    newsroomListItem: {
      display: 'grid',
      gridTemplateColumns: '78px 1fr',
      gap: 22,
      alignItems: 'baseline',
      padding: '26px 0',
      borderBottom: `${ruleWidth}px ${ruleStyle} ${theme.line}`,
      color: theme.text,
    },
    newsroomListIndex: {
      fontFamily: monoFont,
      fontSize: 24,
      color: theme.accent,
      fontWeight: 800,
      fontVariantNumeric: 'tabular-nums',
    },
    newsroomListText: {
      fontFamily: theme.fontFamily,
      fontSize: 42,
      lineHeight: 1.18,
      fontWeight: 760,
    },
    newsroomQuoteLayout: {
      display: 'grid',
      gridTemplateColumns: '1fr 380px',
      gap: 58,
      alignItems: 'start',
    },
    newsroomPullQuote: {
      margin: 0,
      paddingLeft: 38,
      borderLeft: `8px solid ${theme.accent}`,
      fontFamily: theme.fontFamily,
      fontSize: 76,
      lineHeight: 1.05,
      fontWeight: 850,
      color: theme.text,
    },
    newsroomArticleColumns: {
      marginTop: 32,
      columns: 2,
      columnGap: 44,
      columnRule: `${ruleWidth}px ${ruleStyle} ${theme.line}`,
      fontFamily: bodyFont,
      fontSize: 29,
      lineHeight: 1.58,
      color: theme.text2 ?? theme.muted,
    },
    newsroomSummaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 28,
      marginTop: 34,
    },
    newsroomSummaryCard: {
      borderTop: `5px solid ${theme.accent}`,
      borderBottom: `${ruleWidth}px ${ruleStyle} ${theme.line}`,
      padding: '22px 0 28px',
      minHeight: 220,
    },
    newsroomSummaryNum: {
      fontFamily: monoFont,
      fontSize: 24,
      color: theme.accent,
      fontWeight: 800,
      marginBottom: 26,
    },
    newsroomSummaryText: {
      fontFamily: theme.fontFamily,
      fontSize: 40,
      lineHeight: 1.15,
      color: theme.text,
      fontWeight: 820,
    },
    newsroomCaptionInline: {
      marginTop: 30,
      paddingTop: 18,
      borderTop: `${ruleWidth}px ${ruleStyle} ${theme.line}`,
      fontFamily: bodyFont,
      fontSize: 25,
      lineHeight: 1.45,
      color: theme.muted,
    },
    topBar: {
      position: 'absolute',
      top: newsroom ? 46 : dense ? 34 : 54,
      left: newsroom ? theme.stagePaddingX ?? theme.stagePadding : dense ? 46 : 78,
      right: newsroom ? theme.stagePaddingX ?? theme.stagePadding : dense ? 46 : 78,
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 22,
      paddingBottom: newsroom ? 20 : dense ? 10 : 18,
      borderBottom: `${ruleWidth}px ${ruleStyle} ${theme.line}`,
      zIndex: 2,
    },
    courseName: {
      fontSize: newsroom ? 44 : dense ? 18 : poster ? 32 : 26,
      fontWeight: newsroom ? 900 : poster ? 900 : 700,
      maxWidth: newsroom ? 1320 : 1100,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontFamily: theme.fontFamily,
      letterSpacing: newsroom ? 0 : poster ? 0 : dense ? 1.2 : 0.6,
      textTransform: theme.headingTransform,
    },
    courseMeta: {
      fontSize: 20,
      fontWeight: 600,
      color: theme.muted,
      textTransform: 'uppercase',
      letterSpacing: 1.6,
      flex: '0 0 auto',
    },
    slide: presetStyles.slide,
    kicker: {
      display: 'flex',
      alignItems: 'center',
      gap: dense ? 12 : 18,
      color: theme.accent,
      fontSize: dense ? 16 : poster ? 24 : 22,
      fontWeight: poster ? 900 : 700,
      marginBottom: dense ? 22 : poster ? 22 : 32,
      letterSpacing: dense ? 1 : poster ? 0 : 1.6,
      textTransform: 'uppercase',
      fontFamily: dense ? monoFont : newsroom ? monoFont : theme.fontFamily,
    },
    kickerRule: {
      flex: '0 0 56px',
      height: 2,
      background: theme.accent,
      opacity: 0.75,
    },
    title: {
      margin: 0,
      maxWidth: newsroom ? 1050 : poster ? 1120 : dense ? 1260 : 980,
      fontSize: (presetStyles.title as {fontSize: number}).fontSize,
      lineHeight: (presetStyles.title as {lineHeight: number}).lineHeight,
      letterSpacing: newsroom ? -1 : poster ? -1.4 : 0,
      fontWeight: newsroom ? 900 : poster ? 900 : undefined,
    },
    heading: {
      margin: 0,
      maxWidth: newsroom ? 1020 : poster ? 1080 : dense ? 1200 : 980,
      fontSize: (presetStyles.heading as {fontSize: number}).fontSize,
      lineHeight: (presetStyles.heading as {lineHeight: number}).lineHeight,
      letterSpacing: newsroom ? -0.4 : poster ? -0.8 : 0,
      fontWeight: newsroom ? 850 : poster ? 900 : undefined,
    },
    body: {
      marginTop: newsroom ? 26 : dense ? 20 : 32,
      marginBottom: 0,
      maxWidth: newsroom ? 820 : dense ? 1180 : literary ? 820 : 950,
      color: theme.text2 ?? theme.muted,
      fontSize: newsroom ? 31 : dense ? 24 : literary ? 31 : 34,
      lineHeight: newsroom ? 1.55 : dense ? 1.42 : literary ? 1.62 : 1.5,
      fontFamily: bodyFont,
    },
    bullets: {
      marginTop: 40,
      display: 'flex',
      flexDirection: 'column',
      gap: newsroom || dense || flat ? 0 : 22,
      borderTop: newsroom || dense || flat ? `${ruleWidth}px ${ruleStyle} ${theme.line}` : undefined,
      borderBottom: newsroom || dense || flat ? `${ruleWidth}px ${ruleStyle} ${theme.line}` : undefined,
    },
    bullet: {
      display: 'flex',
      alignItems: 'center',
      gap: dense ? 16 : 24,
      color: theme.text,
      fontSize: newsroom ? 35 : dense ? 25 : poster ? 40 : 38,
      lineHeight: newsroom ? 1.2 : dense ? 1.18 : 1.25,
      padding: newsroom ? '19px 0' : dense ? '13px 0' : flat ? '18px 0' : undefined,
      borderBottom: newsroom || dense || flat ? `${ruleWidth}px ${ruleStyle} ${theme.line}` : undefined,
      fontFamily: dense ? monoFont : theme.fontFamily,
    },
    bulletIndex: {
      color: theme.accent,
      fontSize: newsroom ? 24 : dense ? 17 : 30,
      fontWeight: poster ? 900 : 700,
      width: dense ? 46 : 52,
      fontVariantNumeric: 'tabular-nums',
      fontFamily: monoFont,
      flex: '0 0 auto',
      letterSpacing: 0.5,
    },
    bulletRule: {
      width: 32,
      height: 2,
      background: theme.accent,
      opacity: 0.55,
      flex: '0 0 auto',
    },
    codeBlock: {
      marginTop: dense ? 30 : 38,
      width: dense ? 1160 : 790,
      borderRadius: flat ? 0 : 8,
      background: theme.codeBg,
      color: theme.codeText,
      padding: dense ? '22px 24px' : '30px 34px',
      fontFamily: monoFont,
      fontSize: dense ? 24 : 35,
      lineHeight: dense ? 1.5 : 1.65,
      boxShadow: `inset 0 0 0 1px ${theme.line}`,
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
    captionWrap: {
      position: 'absolute',
      left: (presetStyles.caption as {left: number}).left,
      right: (presetStyles.caption as {right: number}).right,
      bottom: (presetStyles.caption as {bottom: number}).bottom,
      display: 'flex',
      alignItems: 'center',
      gap: dense ? 16 : 24,
      minHeight: dense ? 46 : 64,
      padding: dense ? '10px 0 0' : '14px 0 0',
      borderTop: `${ruleWidth}px ${ruleStyle} ${theme.line}`,
      zIndex: 3,
    },
    captionLabel: {
      color: theme.accent,
      fontSize: dense ? 15 : 20,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 1.8,
      flex: '0 0 auto',
      paddingBottom: 2,
      fontFamily: monoFont,
    },
    captionRule: {
      width: 28,
      height: 2,
      background: theme.accent,
      opacity: 0.6,
      flex: '0 0 auto',
      marginBottom: 2,
    },
    captionText: {
      color: theme.text,
      fontSize: newsroom ? 26 : dense ? 19 : 28,
      lineHeight: dense ? 1.35 : 1.45,
      fontStyle: newsroom ? 'normal' : 'italic',
      fontFamily: literary ? bodyFont : theme.fontFamily,
      textShadow: dark ? 'none' : `0 0 12px ${theme.background}, 0 0 3px ${theme.background}`,
      flex: 1,
    },
    progressTrack: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: newsroom ? 8 : dense ? 6 : 10,
      background: theme.line,
      opacity: newsroom ? 0.78 : 0.55,
    },
    progressFill: {
      height: '100%',
      background: theme.progress,
    },
  };
};
