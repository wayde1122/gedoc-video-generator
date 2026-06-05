export const layoutPresets = ['clean-card', 'editorial-split', 'terminal-code'] as const;

export type LayoutPreset = (typeof layoutPresets)[number];

export const GARDEN_THEME_IDS = [
  'midnight-press',
  'warm-keynote',
  'newsroom',
  'bauhaus-bold',
  'paper-press',
  'blueprint',
  'bold-signal',
  'chalk-garden',
  'creative-voltage',
  'dark-botanical',
  'dune',
  'electric-studio',
  'forest-ink',
  'indigo-porcelain',
  'kraft-paper',
  'monochrome-print',
  'neon-cyber',
  'pastel-dream',
  'split-canvas',
  'sunset-zine',
  'swiss-ikb',
  'terminal-green',
  'vintage-editorial',
] as const;

export type ThemeId = (typeof GARDEN_THEME_IDS)[number];

export type ThemePattern =
  | 'none'
  | 'blueprint'
  | 'botanical'
  | 'dots'
  | 'grid'
  | 'paper'
  | 'stripes'
  | 'terminal'
  | 'zine';

export const themeBackgroundTextures = ['none', 'paper', 'grain', 'scanline', 'grid', 'dots'] as const;
export const themeBackgroundGeometries = ['none', 'blocks', 'rings', 'waves', 'blueprint', 'zine'] as const;
export const themeBackgroundMotions = ['none', 'subtle', 'cinematic', 'energetic'] as const;

export type ThemeBackgroundTexture = (typeof themeBackgroundTextures)[number];
export type ThemeBackgroundGeometry = (typeof themeBackgroundGeometries)[number];
export type ThemeBackgroundMotion = (typeof themeBackgroundMotions)[number];

export type ThemeBackgroundGlow = {
  intensity: number;
  scale: number;
  speed: number;
};

export type ThemeBackground = {
  base?: string;
  vignette?: string;
  texture?: ThemeBackgroundTexture;
  glow?: Partial<ThemeBackgroundGlow>;
  geometry?: ThemeBackgroundGeometry;
  motion?: ThemeBackgroundMotion;
};

export type ResolvedThemeBackground = {
  base: string;
  vignette: string;
  texture: ThemeBackgroundTexture;
  glow: ThemeBackgroundGlow;
  geometry: ThemeBackgroundGeometry;
  motion: ThemeBackgroundMotion;
};

type ThemeCore = {
  label: string;
  nameZh: string;
  descriptionZh: string;
  bestFor: string;
  background: string;
  panel: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  line: string;
  progress: string;
  codeBg: string;
  codeText: string;
  fontFamily: string;
  borderWidth: number;
  radius: number;
  shadow: string;
  stagePadding: number;
  pattern: ThemePattern;
  vignette: string;
  headingTransform: 'none' | 'uppercase';
  layoutPreset: LayoutPreset;
};

export type Theme = ThemeCore & {
  id: ThemeId;
  backgroundLayers: ResolvedThemeBackground;
};

type ThemeRegistryEntry = ThemeCore & {
  backgroundLayers?: ThemeBackground;
};

export const DEFAULT_THEME_ID: ThemeId = 'warm-keynote';

const sans = '"Microsoft YaHei", "PingFang SC", Arial, sans-serif';
const serif = '"Noto Serif SC", "Songti SC", "SimSun", serif';
const mono = 'Consolas, "Cascadia Mono", monospace';

const defaultGlow: ThemeBackgroundGlow = {
  intensity: 0.22,
  scale: 1,
  speed: 0.12,
};

const defaultTextureForPattern = (pattern: ThemePattern): ThemeBackgroundTexture => {
  if (pattern === 'blueprint' || pattern === 'grid') {
    return 'grid';
  }

  if (pattern === 'paper' || pattern === 'zine') {
    return 'paper';
  }

  if (pattern === 'terminal') {
    return 'scanline';
  }

  if (pattern === 'dots' || pattern === 'botanical') {
    return 'dots';
  }

  if (pattern === 'stripes') {
    return 'grain';
  }

  return 'none';
};

const defaultGeometryForPattern = (pattern: ThemePattern): ThemeBackgroundGeometry => {
  if (pattern === 'blueprint') {
    return 'blueprint';
  }

  if (pattern === 'zine') {
    return 'zine';
  }

  if (pattern === 'terminal') {
    return 'rings';
  }

  return 'none';
};

export const resolveThemeBackground = (theme: ThemeCore & {backgroundLayers?: ThemeBackground}): ResolvedThemeBackground => {
  const layers = theme.backgroundLayers ?? {};

  return {
    base: layers.base ?? theme.background,
    vignette: layers.vignette ?? theme.vignette,
    texture: layers.texture ?? defaultTextureForPattern(theme.pattern),
    glow: {
      ...defaultGlow,
      ...(layers.glow ?? {}),
    },
    geometry: layers.geometry ?? defaultGeometryForPattern(theme.pattern),
    motion: layers.motion ?? 'subtle',
  };
};

const gardenThemeRegistry = {
  'midnight-press': {
    label: 'Midnight Press',
    nameZh: '暗色印刷',
    descriptionZh: '暖色暗底，电影感、终端气质、开发者审美',
    bestFor: '深度技术解读、开发者观点、电影感课程',
    background: '#0f1117',
    panel: '#181b24',
    text: '#f0eadf',
    muted: '#a8a09a',
    accent: '#e0b35a',
    accent2: '#7aa6ff',
    line: '#303542',
    progress: '#e0b35a',
    codeBg: '#080a0f',
    codeText: '#f4e9cf',
    fontFamily: serif,
    borderWidth: 2,
    radius: 2,
    shadow: '18px 18px 0 rgba(0,0,0,0.25)',
    stagePadding: 92,
    pattern: 'paper',
    vignette: 'radial-gradient(circle at 20% 0%, rgba(224,179,90,0.16), transparent 32%)',
    headingTransform: 'none',
    layoutPreset: 'editorial-split',
    backgroundLayers: {
      texture: 'grain',
      geometry: 'zine',
      motion: 'cinematic',
      glow: {intensity: 0.26, scale: 1.06, speed: 0.09},
    },
  },
  'warm-keynote': {
    label: 'Warm Keynote',
    nameZh: '暖色 Keynote',
    descriptionZh: '温暖、清晰、适合稳定讲解',
    bestFor: 'SaaS keynote、B 端产品发布、团队对外汇报',
    background: '#f5eadc',
    panel: '#fff8ec',
    text: '#2a2118',
    muted: '#7d6b5b',
    accent: '#cc5f3f',
    accent2: '#2d7a68',
    line: '#dfcdb9',
    progress: '#cc5f3f',
    codeBg: '#2c211b',
    codeText: '#ffe9d7',
    fontFamily: sans,
    borderWidth: 1,
    radius: 12,
    shadow: '0 22px 70px rgba(94, 64, 38, 0.16)',
    stagePadding: 116,
    pattern: 'none',
    vignette: 'radial-gradient(circle at 84% 22%, rgba(204,95,63,0.18), transparent 34%)',
    headingTransform: 'none',
    layoutPreset: 'clean-card',
    backgroundLayers: {
      texture: 'paper',
      geometry: 'blocks',
      motion: 'subtle',
      glow: {intensity: 0.34, scale: 1.04, speed: 0.1},
    },
  },
  newsroom: {
    label: 'Newsroom',
    nameZh: '报社',
    descriptionZh: '干净报刊结构，信息密度高，强调事实感',
    bestFor: '深度评测、时事评论、纪录片 / 报道',
    background: '#f1f2f4',
    panel: '#ffffff',
    text: '#111318',
    muted: '#5c6470',
    accent: '#c60021',
    accent2: '#1d4d8f',
    line: '#d5d9df',
    progress: '#c60021',
    codeBg: '#121722',
    codeText: '#eef4ff',
    fontFamily: serif,
    borderWidth: 2,
    radius: 0,
    shadow: '14px 14px 0 rgba(17,19,24,0.10)',
    stagePadding: 92,
    pattern: 'stripes',
    vignette: 'linear-gradient(90deg, rgba(198,0,33,0.08), transparent 38%)',
    headingTransform: 'none',
    layoutPreset: 'editorial-split',
    backgroundLayers: {
      texture: 'grain',
      geometry: 'blocks',
      motion: 'subtle',
      glow: {intensity: 0.18, scale: 0.96, speed: 0.06},
    },
  },
  'bauhaus-bold': {
    label: 'Bauhaus Bold',
    nameZh: '包豪斯',
    descriptionZh: '几何、强对比、红黄蓝视觉秩序',
    bestFor: '产品发布、观点宣言、设计演讲',
    background: '#f3efe0',
    panel: '#fffaf0',
    text: '#16130f',
    muted: '#5f5a51',
    accent: '#e3312d',
    accent2: '#1063b5',
    line: '#1b1b1b',
    progress: '#f0b400',
    codeBg: '#151515',
    codeText: '#f5efe4',
    fontFamily: sans,
    borderWidth: 3,
    radius: 0,
    shadow: '20px 20px 0 #f0b400',
    stagePadding: 92,
    pattern: 'dots',
    vignette: 'radial-gradient(circle at 88% 18%, rgba(16,99,181,0.18), transparent 30%)',
    headingTransform: 'uppercase',
    layoutPreset: 'editorial-split',
    backgroundLayers: {
      texture: 'dots',
      geometry: 'blocks',
      motion: 'energetic',
      glow: {intensity: 0.36, scale: 1.08, speed: 0.2},
    },
  },
  'paper-press': {
    label: 'Paper Press',
    nameZh: '亮色印刷',
    descriptionZh: '纸张质感、温和、杂志排版',
    bestFor: '杂志型内容、温和教程、大众科技解读',
    background: '#f3ead8',
    panel: '#fff8e8',
    text: '#241f18',
    muted: '#746957',
    accent: '#9d3f2f',
    accent2: '#2f6157',
    line: '#d6c7ad',
    progress: '#9d3f2f',
    codeBg: '#2a241d',
    codeText: '#f8ead0',
    fontFamily: serif,
    borderWidth: 1,
    radius: 6,
    shadow: '0 18px 54px rgba(66, 48, 28, 0.14)',
    stagePadding: 116,
    pattern: 'paper',
    vignette: 'radial-gradient(circle at 78% 30%, rgba(157,63,47,0.13), transparent 34%)',
    headingTransform: 'none',
    layoutPreset: 'clean-card',
    backgroundLayers: {
      texture: 'paper',
      geometry: 'zine',
      motion: 'subtle',
      glow: {intensity: 0.2, scale: 0.92, speed: 0.07},
    },
  },
  blueprint: {
    label: 'Blueprint',
    nameZh: '蓝图',
    descriptionZh: '工程蓝图感，网格与线框突出结构',
    bestFor: '架构图、系统讲解、工程化内容',
    background: '#08264a',
    panel: '#0d3563',
    text: '#e9f5ff',
    muted: '#9fc2e3',
    accent: '#76d7ff',
    accent2: '#ffffff',
    line: '#2b5d8f',
    progress: '#76d7ff',
    codeBg: '#06182d',
    codeText: '#d5efff',
    fontFamily: sans,
    borderWidth: 1,
    radius: 6,
    shadow: '0 0 0 1px rgba(118,215,255,0.25), 0 28px 90px rgba(0,0,0,0.28)',
    stagePadding: 96,
    pattern: 'blueprint',
    vignette: 'radial-gradient(circle at 18% 12%, rgba(118,215,255,0.20), transparent 30%)',
    headingTransform: 'none',
    layoutPreset: 'terminal-code',
    backgroundLayers: {
      texture: 'grid',
      geometry: 'blueprint',
      motion: 'subtle',
      glow: {intensity: 0.3, scale: 0.98, speed: 0.08},
    },
  },
  'bold-signal': {
    label: 'Bold Signal',
    nameZh: '焦点信号',
    descriptionZh: '黑底强信号色，高冲击、短促有力',
    bestFor: '高冲击产品 pitch、观点表达、发布会',
    background: '#141414',
    panel: '#202020',
    text: '#fff8eb',
    muted: '#b7b0a4',
    accent: '#ff3b30',
    accent2: '#ffd23f',
    line: '#383838',
    progress: '#ff3b30',
    codeBg: '#050505',
    codeText: '#fff8eb',
    fontFamily: sans,
    borderWidth: 2,
    radius: 0,
    shadow: '16px 16px 0 rgba(255,210,63,0.18)',
    stagePadding: 92,
    pattern: 'stripes',
    vignette: 'linear-gradient(135deg, rgba(255,59,48,0.18), transparent 40%)',
    headingTransform: 'uppercase',
    layoutPreset: 'editorial-split',
    backgroundLayers: {
      texture: 'grain',
      geometry: 'blocks',
      motion: 'cinematic',
      glow: {intensity: 0.38, scale: 1.04, speed: 0.16},
    },
  },
  'chalk-garden': {
    label: 'Chalk Garden',
    nameZh: '粉笔花园',
    descriptionZh: '黑板粉笔质感，亲切、有课堂感',
    bestFor: '课堂讲解、教育内容、轻松教程',
    background: '#163326',
    panel: '#224633',
    text: '#f4f0dc',
    muted: '#b7c5aa',
    accent: '#d9e36b',
    accent2: '#8bd3a5',
    line: '#40664f',
    progress: '#d9e36b',
    codeBg: '#0e2118',
    codeText: '#f4f0dc',
    fontFamily: sans,
    borderWidth: 1,
    radius: 10,
    shadow: '0 20px 70px rgba(0,0,0,0.18)',
    stagePadding: 116,
    pattern: 'botanical',
    vignette: 'radial-gradient(circle at 78% 16%, rgba(217,227,107,0.16), transparent 34%)',
    headingTransform: 'none',
    layoutPreset: 'clean-card',
    backgroundLayers: {
      texture: 'dots',
      geometry: 'waves',
      motion: 'subtle',
      glow: {intensity: 0.24, scale: 0.98, speed: 0.08},
    },
  },
  'creative-voltage': {
    label: 'Creative Voltage',
    nameZh: '电压创意',
    descriptionZh: '高饱和创意感，适合强视觉表达',
    bestFor: '创意展示、设计内容、强视觉短视频',
    background: '#160b2d',
    panel: '#241442',
    text: '#fff5ff',
    muted: '#c5acd9',
    accent: '#ff4fd8',
    accent2: '#48f7c2',
    line: '#4a2b73',
    progress: '#ff4fd8',
    codeBg: '#0b0618',
    codeText: '#ffe9ff',
    fontFamily: sans,
    borderWidth: 2,
    radius: 8,
    shadow: '18px 18px 0 rgba(72,247,194,0.16)',
    stagePadding: 92,
    pattern: 'dots',
    vignette: 'radial-gradient(circle at 85% 18%, rgba(255,79,216,0.24), transparent 32%)',
    headingTransform: 'none',
    layoutPreset: 'editorial-split',
    backgroundLayers: {
      texture: 'dots',
      geometry: 'waves',
      motion: 'energetic',
      glow: {intensity: 0.46, scale: 1.16, speed: 0.24},
    },
  },
  'dark-botanical': {
    label: 'Dark Botanical',
    nameZh: '暗夜植物',
    descriptionZh: '深绿植物感，安静高级',
    bestFor: '高级感品牌、生活方式、审美型内容',
    background: '#071710',
    panel: '#10271b',
    text: '#e9f5df',
    muted: '#95aa91',
    accent: '#85d06f',
    accent2: '#d9b46b',
    line: '#294633',
    progress: '#85d06f',
    codeBg: '#041009',
    codeText: '#e9f5df',
    fontFamily: serif,
    borderWidth: 1,
    radius: 12,
    shadow: '0 24px 82px rgba(0,0,0,0.24)',
    stagePadding: 116,
    pattern: 'botanical',
    vignette: 'radial-gradient(circle at 82% 20%, rgba(133,208,111,0.18), transparent 34%)',
    headingTransform: 'none',
    layoutPreset: 'clean-card',
    backgroundLayers: {
      texture: 'dots',
      geometry: 'waves',
      motion: 'subtle',
      glow: {intensity: 0.28, scale: 1.02, speed: 0.09},
    },
  },
  dune: {
    label: 'Dune',
    nameZh: '沙丘',
    descriptionZh: '低饱和沙色，克制、稳重、留白充足',
    bestFor: '克制、高级、低饱和产品或观点视频',
    background: '#e9d4b5',
    panel: '#f6e5c9',
    text: '#2c2318',
    muted: '#806f58',
    accent: '#b65f2a',
    accent2: '#315f64',
    line: '#cdb48e',
    progress: '#b65f2a',
    codeBg: '#2e2419',
    codeText: '#f9dfba',
    fontFamily: sans,
    borderWidth: 1,
    radius: 10,
    shadow: '0 24px 70px rgba(89, 61, 32, 0.14)',
    stagePadding: 116,
    pattern: 'paper',
    vignette: 'linear-gradient(135deg, rgba(182,95,42,0.14), transparent 44%)',
    headingTransform: 'none',
    layoutPreset: 'clean-card',
    backgroundLayers: {
      texture: 'paper',
      geometry: 'waves',
      motion: 'subtle',
      glow: {intensity: 0.22, scale: 1.08, speed: 0.06},
    },
  },
  'electric-studio': {
    label: 'Electric Studio',
    nameZh: '电光企业',
    descriptionZh: '深色企业科技，带电光强调色',
    bestFor: '企业级产品、SaaS、工具讲解',
    background: '#11131d',
    panel: '#1b1f2e',
    text: '#f4f6ff',
    muted: '#a1abc0',
    accent: '#6eff7f',
    accent2: '#5a8cff',
    line: '#343a50',
    progress: '#6eff7f',
    codeBg: '#070910',
    codeText: '#e8fff0',
    fontFamily: sans,
    borderWidth: 1,
    radius: 8,
    shadow: '0 0 0 1px rgba(110,255,127,0.16), 0 28px 90px rgba(0,0,0,0.26)',
    stagePadding: 96,
    pattern: 'grid',
    vignette: 'radial-gradient(circle at 18% 12%, rgba(110,255,127,0.16), transparent 30%)',
    headingTransform: 'none',
    layoutPreset: 'terminal-code',
    backgroundLayers: {
      texture: 'grid',
      geometry: 'rings',
      motion: 'cinematic',
      glow: {intensity: 0.34, scale: 1.04, speed: 0.16},
    },
  },
  'forest-ink': {
    label: 'Forest Ink',
    nameZh: '森林墨',
    descriptionZh: '浅底绿墨，适合长内容和知识感',
    bestFor: '长文解读、知识内容、沉稳课程',
    background: '#eff2e7',
    panel: '#fbfff4',
    text: '#18231b',
    muted: '#65705e',
    accent: '#2f7c55',
    accent2: '#8c6735',
    line: '#cfd8c5',
    progress: '#2f7c55',
    codeBg: '#152019',
    codeText: '#ecf6e7',
    fontFamily: serif,
    borderWidth: 1,
    radius: 10,
    shadow: '0 20px 66px rgba(42, 73, 48, 0.13)',
    stagePadding: 116,
    pattern: 'botanical',
    vignette: 'radial-gradient(circle at 80% 24%, rgba(47,124,85,0.12), transparent 34%)',
    headingTransform: 'none',
    layoutPreset: 'clean-card',
    backgroundLayers: {
      texture: 'paper',
      geometry: 'waves',
      motion: 'subtle',
      glow: {intensity: 0.18, scale: 0.94, speed: 0.06},
    },
  },
  'indigo-porcelain': {
    label: 'Indigo Porcelain',
    nameZh: '靛蓝瓷',
    descriptionZh: '清亮靛蓝，兼具科技和人文气质',
    bestFor: '高级科技、人文科技、品牌叙事',
    background: '#eef2fb',
    panel: '#ffffff',
    text: '#111a36',
    muted: '#66728c',
    accent: '#2e52c9',
    accent2: '#b9405c',
    line: '#d7ddec',
    progress: '#2e52c9',
    codeBg: '#11182c',
    codeText: '#edf2ff',
    fontFamily: sans,
    borderWidth: 1,
    radius: 10,
    shadow: '0 22px 70px rgba(39, 57, 112, 0.14)',
    stagePadding: 116,
    pattern: 'dots',
    vignette: 'radial-gradient(circle at 84% 18%, rgba(46,82,201,0.14), transparent 32%)',
    headingTransform: 'none',
    layoutPreset: 'clean-card',
    backgroundLayers: {
      texture: 'dots',
      geometry: 'rings',
      motion: 'subtle',
      glow: {intensity: 0.24, scale: 1, speed: 0.08},
    },
  },
  'kraft-paper': {
    label: 'Kraft Paper',
    nameZh: '牛皮纸',
    descriptionZh: '手作纸张感，复古、粗粝、像笔记',
    bestFor: '手作感、复古工具、笔记型内容',
    background: '#d7bd8f',
    panel: '#eed8aa',
    text: '#2b2115',
    muted: '#6e5b3e',
    accent: '#8d3d2f',
    accent2: '#2e6b59',
    line: '#b99d6f',
    progress: '#8d3d2f',
    codeBg: '#2b2014',
    codeText: '#f4dfb4',
    fontFamily: serif,
    borderWidth: 2,
    radius: 2,
    shadow: '18px 18px 0 rgba(43,33,21,0.16)',
    stagePadding: 92,
    pattern: 'paper',
    vignette: 'radial-gradient(circle at 82% 24%, rgba(141,61,47,0.16), transparent 34%)',
    headingTransform: 'none',
    layoutPreset: 'editorial-split',
    backgroundLayers: {
      texture: 'paper',
      geometry: 'zine',
      motion: 'subtle',
      glow: {intensity: 0.24, scale: 0.96, speed: 0.07},
    },
  },
  'monochrome-print': {
    label: 'Monochrome Print',
    nameZh: '黑白印刷',
    descriptionZh: '黑白高对比，严肃、分析、杂志感',
    bestFor: '高对比杂志、严肃观点、分析型内容',
    background: '#f4f4f1',
    panel: '#ffffff',
    text: '#121212',
    muted: '#626262',
    accent: '#000000',
    accent2: '#8a8a8a',
    line: '#d0d0cc',
    progress: '#121212',
    codeBg: '#111111',
    codeText: '#eeeeee',
    fontFamily: serif,
    borderWidth: 2,
    radius: 0,
    shadow: '16px 16px 0 rgba(0,0,0,0.10)',
    stagePadding: 92,
    pattern: 'stripes',
    vignette: 'linear-gradient(90deg, rgba(0,0,0,0.06), transparent 40%)',
    headingTransform: 'none',
    layoutPreset: 'editorial-split',
    backgroundLayers: {
      texture: 'grain',
      geometry: 'blocks',
      motion: 'none',
      glow: {intensity: 0.08, scale: 0.88, speed: 0},
    },
  },
  'neon-cyber': {
    label: 'Neon Cyber',
    nameZh: '霓虹赛博',
    descriptionZh: '霓虹、未来、强技术情绪',
    bestFor: 'AI、未来感产品、赛博/技术内容',
    background: '#050816',
    panel: '#11182b',
    text: '#e8fbff',
    muted: '#8fb0bd',
    accent: '#00e5ff',
    accent2: '#ff2bd6',
    line: '#223354',
    progress: '#ff2bd6',
    codeBg: '#02040d',
    codeText: '#ccfbff',
    fontFamily: mono,
    borderWidth: 1,
    radius: 8,
    shadow: '0 0 0 1px rgba(0,229,255,0.22), 0 0 46px rgba(255,43,214,0.20)',
    stagePadding: 96,
    pattern: 'terminal',
    vignette: 'radial-gradient(circle at 82% 18%, rgba(255,43,214,0.24), transparent 32%)',
    headingTransform: 'none',
    layoutPreset: 'terminal-code',
    backgroundLayers: {
      texture: 'scanline',
      geometry: 'rings',
      motion: 'cinematic',
      glow: {intensity: 0.42, scale: 1.08, speed: 0.18},
    },
  },
  'pastel-dream': {
    label: 'Pastel Dream',
    nameZh: '柔光梦',
    descriptionZh: '轻柔粉彩，亲和、明亮、低压力',
    bestFor: '柔和教程、生活方式、轻量工具介绍',
    background: '#f5edf7',
    panel: '#fff9fd',
    text: '#272033',
    muted: '#756d83',
    accent: '#d35fae',
    accent2: '#63a9c9',
    line: '#e2d5e8',
    progress: '#d35fae',
    codeBg: '#2a2230',
    codeText: '#fff0fb',
    fontFamily: sans,
    borderWidth: 1,
    radius: 14,
    shadow: '0 22px 70px rgba(106, 73, 121, 0.13)',
    stagePadding: 116,
    pattern: 'dots',
    vignette: 'radial-gradient(circle at 82% 18%, rgba(211,95,174,0.16), transparent 34%)',
    headingTransform: 'none',
    layoutPreset: 'clean-card',
    backgroundLayers: {
      texture: 'dots',
      geometry: 'blocks',
      motion: 'subtle',
      glow: {intensity: 0.3, scale: 1.1, speed: 0.09},
    },
  },
  'split-canvas': {
    label: 'Split Canvas',
    nameZh: '双拼画布',
    descriptionZh: '分割构图，适合对比、演示、创意拆解',
    bestFor: '设计演示、对比讲解、创意型视频',
    background: '#f0efe9',
    panel: '#fffdf5',
    text: '#191919',
    muted: '#66635b',
    accent: '#246bfe',
    accent2: '#ffb000',
    line: '#d8d3c7',
    progress: '#246bfe',
    codeBg: '#111827',
    codeText: '#edf3ff',
    fontFamily: sans,
    borderWidth: 2,
    radius: 4,
    shadow: '18px 18px 0 rgba(36,107,254,0.13)',
    stagePadding: 92,
    pattern: 'none',
    vignette: 'linear-gradient(90deg, transparent 0 58%, rgba(36,107,254,0.12) 58% 100%)',
    headingTransform: 'none',
    layoutPreset: 'editorial-split',
    backgroundLayers: {
      texture: 'grain',
      geometry: 'blocks',
      motion: 'cinematic',
      glow: {intensity: 0.28, scale: 1.02, speed: 0.13},
    },
  },
  'sunset-zine': {
    label: 'Sunset Zine',
    nameZh: '日落 Zine',
    descriptionZh: '年轻、杂志、日落色，适合轻快表达',
    bestFor: '独立杂志、年轻化表达、潮流内容',
    background: '#ffe2c7',
    panel: '#fff1df',
    text: '#2b1b1b',
    muted: '#7f6158',
    accent: '#ff5c39',
    accent2: '#6f4bd8',
    line: '#e6b99f',
    progress: '#ff5c39',
    codeBg: '#2d1717',
    codeText: '#ffe8d7',
    fontFamily: sans,
    borderWidth: 2,
    radius: 4,
    shadow: '18px 18px 0 rgba(111,75,216,0.15)',
    stagePadding: 92,
    pattern: 'zine',
    vignette: 'radial-gradient(circle at 82% 20%, rgba(255,92,57,0.20), transparent 34%)',
    headingTransform: 'none',
    layoutPreset: 'editorial-split',
    backgroundLayers: {
      texture: 'paper',
      geometry: 'zine',
      motion: 'energetic',
      glow: {intensity: 0.36, scale: 1.08, speed: 0.18},
    },
  },
  'swiss-ikb': {
    label: 'Swiss IKB',
    nameZh: '瑞士克莱因蓝',
    descriptionZh: '瑞士网格、极简、克莱因蓝强调',
    bestFor: '极简产品展示、品牌发布、专业汇报',
    background: '#f5f7fb',
    panel: '#ffffff',
    text: '#111827',
    muted: '#596273',
    accent: '#0047ff',
    accent2: '#ff3b30',
    line: '#d9dee9',
    progress: '#0047ff',
    codeBg: '#101828',
    codeText: '#eef4ff',
    fontFamily: sans,
    borderWidth: 1,
    radius: 6,
    shadow: '0 22px 70px rgba(17,24,39,0.12)',
    stagePadding: 116,
    pattern: 'grid',
    vignette: 'linear-gradient(90deg, rgba(0,71,255,0.10), transparent 38%)',
    headingTransform: 'none',
    layoutPreset: 'clean-card',
    backgroundLayers: {
      texture: 'grid',
      geometry: 'blocks',
      motion: 'subtle',
      glow: {intensity: 0.22, scale: 0.98, speed: 0.07},
    },
  },
  'terminal-green': {
    label: 'Terminal Green',
    nameZh: '终端绿',
    descriptionZh: '终端、命令行、黑底绿字',
    bestFor: '黑客感、终端、CLI、开发者教程',
    background: '#020805',
    panel: '#07150d',
    text: '#d6ffe1',
    muted: '#79a987',
    accent: '#39ff88',
    accent2: '#f3ff6b',
    line: '#1d3b28',
    progress: '#39ff88',
    codeBg: '#000000',
    codeText: '#c9ffd7',
    fontFamily: mono,
    borderWidth: 1,
    radius: 4,
    shadow: '0 0 0 1px rgba(57,255,136,0.18), 0 0 54px rgba(57,255,136,0.12)',
    stagePadding: 96,
    pattern: 'terminal',
    vignette: 'radial-gradient(circle at 18% 10%, rgba(57,255,136,0.16), transparent 30%)',
    headingTransform: 'none',
    layoutPreset: 'terminal-code',
    backgroundLayers: {
      texture: 'scanline',
      geometry: 'rings',
      motion: 'cinematic',
      glow: {intensity: 0.34, scale: 1.02, speed: 0.14},
    },
  },
  'vintage-editorial': {
    label: 'Vintage Editorial',
    nameZh: '复古编辑',
    descriptionZh: '复古杂志感，温暖纸张与编辑口吻',
    bestFor: '复古杂志、观点口播、品牌故事',
    background: '#eee3cf',
    panel: '#fbf0da',
    text: '#211a12',
    muted: '#756651',
    accent: '#9a3324',
    accent2: '#345f73',
    line: '#d2bea0',
    progress: '#9a3324',
    codeBg: '#281e16',
    codeText: '#f7e8c8',
    fontFamily: serif,
    borderWidth: 2,
    radius: 2,
    shadow: '18px 18px 0 rgba(33,26,18,0.14)',
    stagePadding: 92,
    pattern: 'paper',
    vignette: 'radial-gradient(circle at 82% 18%, rgba(154,51,36,0.14), transparent 34%)',
    headingTransform: 'none',
    layoutPreset: 'editorial-split',
    backgroundLayers: {
      texture: 'paper',
      geometry: 'zine',
      motion: 'subtle',
      glow: {intensity: 0.2, scale: 0.94, speed: 0.06},
    },
  },
} satisfies Record<ThemeId, ThemeRegistryEntry>;

export const themes = GARDEN_THEME_IDS.map((id) => {
  const theme = gardenThemeRegistry[id];

  return {
    id,
    ...theme,
    backgroundLayers: resolveThemeBackground(theme),
  };
}) satisfies readonly Theme[];

export const THEME_IDS = GARDEN_THEME_IDS;

const themeById = new Map<ThemeId, Theme>(themes.map((theme) => [theme.id, theme]));

export const isThemeId = (value: unknown): value is ThemeId => {
  return typeof value === 'string' && GARDEN_THEME_IDS.includes(value as ThemeId);
};

export const isStrictThemeEnabled = (value = process.env.STRICT_THEME): boolean => {
  return value === '1' || value?.toLowerCase() === 'true';
};

export const formatThemeList = () => GARDEN_THEME_IDS.join(', ');

export const getThemeFallbackMessage = (themeId: unknown): string => {
  if (typeof themeId === 'string' && themeId.length > 0) {
    return `Invalid theme "${themeId}"; falling back to "${DEFAULT_THEME_ID}". Valid themes: ${formatThemeList()}.`;
  }

  return `Missing theme; falling back to "${DEFAULT_THEME_ID}". Valid themes: ${formatThemeList()}.`;
};

export const resolveTheme = (
  themeId: unknown,
  options: {strict?: boolean; warn?: boolean} = {},
): Theme => {
  if (isThemeId(themeId)) {
    return themeById.get(themeId) as Theme;
  }

  const message = getThemeFallbackMessage(themeId);
  if (options.strict ?? isStrictThemeEnabled()) {
    throw new Error(message);
  }

  if (options.warn ?? true) {
    console.warn(message);
  }

  return themeById.get(DEFAULT_THEME_ID) as Theme;
};
