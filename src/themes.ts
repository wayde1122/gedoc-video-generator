export const layoutPresets = ['clean-card', 'editorial-split', 'terminal-code'] as const;

export type LayoutPreset = (typeof layoutPresets)[number];

export const recipeAnchors = [
  'active-theory',
  'aesop',
  'apple-hig',
  'are-na',
  'balenciaga-post-2017',
  'bloomberg-businessweek-turley',
  'bloomberg-terminal',
  'dieter-rams-braun',
  'field-io',
  'headspace-meditation',
  'linear',
  'mailchimp-freddie',
  'mid-century-modern',
  'monocle-magazine',
  'muji-kenya-hara',
  'notion-pre-ai',
  'nyt-the-daily',
  'pentagram',
  'raycast',
  'stripe-press',
  'tufte-dataink',
  'vercel-mesh',
  'vignelli-swiss-helvetica',
  'y2k-retrofuturism',
] as const;

export const themeStyleFamilies = [
  'botanical',
  'brutalist',
  'data-ink',
  'editorial',
  'experimental',
  'glass-tool',
  'humanist',
  'minimal',
  'poster',
  'retro',
  'swiss',
  'terminal',
  'tool',
  'warm-print',
] as const;

export type RecipeAnchor = (typeof recipeAnchors)[number];
export type ThemeStyleFamily = (typeof themeStyleFamilies)[number];

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
export const themeBackgroundGeometries = ['none', 'blocks', 'rings', 'waves', 'blueprint', 'zine', 'editorial-rules'] as const;
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
  recipe: RecipeAnchor;
  styleFamily: ThemeStyleFamily;
  shell?: string;
  background: string;
  panel: string;
  surface2?: string;
  surface3?: string;
  text: string;
  text2?: string;
  muted: string;
  faint?: string;
  accent: string;
  accent2: string;
  accentSoft?: string;
  accentGlow?: string;
  line: string;
  progress: string;
  codeBg: string;
  codeText: string;
  fontFamily: string;
  fontBody?: string;
  fontMono?: string;
  borderWidth: number;
  ruleWidth?: number;
  ruleStyle?: 'solid' | 'dashed' | 'dotted';
  radius: number;
  shadow: string;
  cardShadow?: string;
  stagePadding: number;
  stagePaddingX?: number;
  stagePaddingY?: number;
  signature?: 'newsroom';
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

const hexToRgb = (hex: string): {r: number; g: number; b: number} | null => {
  const normalized = hex.trim().replace('#', '');
  if (!/^[\da-f]{6}$/i.test(normalized)) {
    return null;
  }

  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const alpha = (color: string, opacity: number) => {
  if (/^rgba?\(/i.test(color.trim())) {
    return color;
  }

  const rgb = hexToRgb(color);
  if (!rgb) {
    return color;
  }

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};

const resolveThemeTokens = (theme: ThemeRegistryEntry): ThemeRegistryEntry => ({
  ...theme,
  shell: theme.shell ?? theme.background,
  surface2: theme.surface2 ?? theme.panel,
  surface3: theme.surface3 ?? theme.background,
  text2: theme.text2 ?? theme.muted,
  faint: theme.faint ?? theme.line,
  accentSoft: theme.accentSoft ?? alpha(theme.accent, 0.12),
  accentGlow: theme.accentGlow ?? alpha(theme.accent, 0.22),
  fontBody: theme.fontBody ?? theme.fontFamily,
  fontMono: theme.fontMono ?? mono,
  ruleWidth: theme.ruleWidth ?? theme.borderWidth,
  ruleStyle: theme.ruleStyle ?? 'solid',
  cardShadow: theme.cardShadow ?? theme.shadow,
  stagePaddingX: theme.stagePaddingX ?? theme.stagePadding,
  stagePaddingY: theme.stagePaddingY ?? theme.stagePadding,
});

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
    recipe: 'linear',
    styleFamily: 'tool',
    shell: '#08090a',
    background: '#08090a',
    panel: '#16171c',
    surface2: '#1e1f25',
    surface3: '#26272e',
    text: '#f7f8f8',
    text2: '#9ca3af',
    muted: '#9ca3af',
    faint: '#6b7280',
    accent: '#5e6ad2',
    accent2: '#a78bfa',
    accentSoft: 'rgba(94, 106, 210, 0.12)',
    accentGlow: 'rgba(94, 106, 210, 0.08)',
    line: 'rgba(255,255,255,0.06)',
    progress: '#5e6ad2',
    codeBg: '#1e1f25',
    codeText: '#a78bfa',
    fontFamily: '"Inter Tight", "Geist", "Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    borderWidth: 1,
    radius: 12,
    shadow: '0 1px 2px rgba(0,0,0,0.30)',
    stagePadding: 104,
    pattern: 'grid',
    vignette: 'radial-gradient(circle at 50% -8%, rgba(94,106,210,0.12), transparent 34%)',
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
    recipe: 'aesop',
    styleFamily: 'humanist',
    background: '#e8e4d9',
    panel: '#f0ede4',
    text: '#1b1b1b',
    muted: '#7a8470',
    accent: '#7a4623',
    accent2: '#7a8470',
    line: '#d2cbbb',
    progress: '#7a4623',
    codeBg: '#2a2118',
    codeText: '#f2efe5',
    fontFamily: '"GT Sectra", "Noto Serif SC", "Songti SC", serif',
    borderWidth: 1,
    radius: 0,
    shadow: '0 32px 90px rgba(65, 50, 32, 0.12)',
    stagePadding: 128,
    pattern: 'paper',
    vignette: 'radial-gradient(circle at 84% 22%, rgba(122,70,35,0.10), transparent 34%)',
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
    descriptionZh: '报纸奶油底 + 墨黑衬线 + 报头红，像一篇纪录片式深度特稿',
    bestFor: '深度评测、时事评论、纪录片 / 报道',
    recipe: 'nyt-the-daily',
    styleFamily: 'editorial',
    shell: '#ffffff',
    background: '#ffffff',
    panel: '#ffffff',
    surface2: '#f7f7f7',
    surface3: '#f1f1f1',
    text: '#121212',
    text2: '#333333',
    muted: '#666666',
    faint: '#9a9a9a',
    accent: '#d0021b',
    accent2: '#121212',
    accentSoft: 'rgba(208, 2, 27, 0.08)',
    accentGlow: 'rgba(208, 2, 27, 0.16)',
    line: '#e2e2e2',
    progress: '#d0021b',
    codeBg: '#f7f7f7',
    codeText: '#121212',
    fontFamily: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", "SimSun", serif',
    fontBody: '"Noto Serif SC", "Source Serif 4", "Source Serif Pro", "Times New Roman", serif',
    fontMono: '"JetBrains Mono", "SF Mono", Consolas, monospace',
    borderWidth: 1,
    ruleWidth: 1,
    ruleStyle: 'solid',
    radius: 0,
    shadow: '0 22px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
    cardShadow: '0 1px 0 #e2e2e2',
    stagePadding: 100,
    stagePaddingX: 100,
    stagePaddingY: 72,
    signature: 'newsroom',
    pattern: 'stripes',
    vignette: 'radial-gradient(circle at 50% 38%, transparent 0%, rgba(18, 18, 18, 0.035) 100%)',
    headingTransform: 'none',
    layoutPreset: 'editorial-split',
    backgroundLayers: {
      texture: 'grain',
      geometry: 'editorial-rules',
      motion: 'subtle',
      glow: {intensity: 0.035, scale: 0.84, speed: 0.02},
    },
  },
  'bauhaus-bold': {
    label: 'Bauhaus Bold',
    nameZh: '包豪斯',
    descriptionZh: '几何、强对比、红黄蓝视觉秩序',
    bestFor: '产品发布、观点宣言、设计演讲',
    recipe: 'vignelli-swiss-helvetica',
    styleFamily: 'swiss',
    background: '#ffffff',
    panel: '#ffffff',
    surface2: '#f5f5f5',
    surface3: '#ffffff',
    text: '#000000',
    text2: '#111111',
    muted: '#8a8a8a',
    faint: '#d7d7d7',
    accent: '#e2231a',
    accent2: '#e2231a',
    accentSoft: 'rgba(226, 35, 26, 0.08)',
    accentGlow: 'rgba(226, 35, 26, 0.12)',
    line: '#000000',
    progress: '#e2231a',
    codeBg: '#000000',
    codeText: '#ffffff',
    fontFamily: '"Helvetica Now", "Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    borderWidth: 2,
    radius: 0,
    shadow: '20px 20px 0 #e2231a',
    stagePadding: 92,
    pattern: 'grid',
    vignette: 'linear-gradient(90deg, rgba(226,35,26,0.14), transparent 34%)',
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
    recipe: 'stripe-press',
    styleFamily: 'warm-print',
    background: '#f1ecde',
    panel: '#fbf4e4',
    text: '#1a1a18',
    muted: '#736d5a',
    accent: '#1b4b5a',
    accent2: '#a04a2a',
    line: '#c8bea4',
    progress: '#1b4b5a',
    codeBg: '#281e16',
    codeText: '#f7e8c8',
    fontFamily: '"GT Sectra", "Noto Serif SC", "Songti SC", serif',
    borderWidth: 1,
    radius: 0,
    shadow: '0 28px 80px rgba(92, 78, 49, 0.14)',
    stagePadding: 116,
    pattern: 'paper',
    vignette: 'radial-gradient(circle at 78% 30%, rgba(160,74,42,0.13), transparent 34%)',
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
    recipe: 'dieter-rams-braun',
    styleFamily: 'minimal',
    background: '#e4e1dc',
    panel: '#f5f4f0',
    text: '#191919',
    muted: '#5c5c5c',
    accent: '#e96a26',
    accent2: '#f5c518',
    line: '#b9b6ad',
    progress: '#e96a26',
    codeBg: '#191919',
    codeText: '#f5f4f0',
    fontFamily: '"Söhne", "Helvetica Now", "Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    borderWidth: 1,
    radius: 0,
    shadow: '0 0 0 1px rgba(25,25,25,0.10), 0 24px 70px rgba(25,25,25,0.10)',
    stagePadding: 112,
    pattern: 'grid',
    vignette: 'radial-gradient(circle at 18% 12%, rgba(233,106,38,0.10), transparent 30%)',
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
    recipe: 'bloomberg-businessweek-turley',
    styleFamily: 'brutalist',
    background: '#ffffff',
    panel: '#ff3d00',
    surface2: '#ffe800',
    surface3: '#ffffff',
    text: '#000000',
    text2: '#000000',
    muted: '#343434',
    faint: '#000000',
    accent: '#ff3d00',
    accent2: '#ffe800',
    accentSoft: 'rgba(255,61,0,0.18)',
    accentGlow: 'rgba(255,232,0,0.24)',
    line: '#000000',
    progress: '#001aff',
    codeBg: '#000000',
    codeText: '#ffe800',
    fontFamily: '"Druk", "Helvetica Now", "Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    borderWidth: 2,
    radius: 0,
    shadow: '18px 18px 0 #001aff',
    stagePadding: 92,
    pattern: 'none',
    vignette: 'linear-gradient(135deg, rgba(255,232,0,0.28), transparent 42%)',
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
    recipe: 'headspace-meditation',
    styleFamily: 'humanist',
    background: '#ffe2c5',
    panel: '#ffedd5',
    surface2: '#f4a573',
    surface3: '#fff5e8',
    text: '#1b3a47',
    text2: '#2f5360',
    muted: '#5c6b7a',
    faint: '#c98965',
    accent: '#f5867b',
    accent2: '#9db67a',
    accentSoft: 'rgba(244, 165, 115, 0.28)',
    accentGlow: 'rgba(244, 165, 115, 0.22)',
    line: 'rgba(27, 58, 71, 0.16)',
    progress: '#f5867b',
    codeBg: '#1b3a47',
    codeText: '#ffedd5',
    fontFamily: sans,
    borderWidth: 1,
    radius: 24,
    shadow: '0 8px 24px rgba(244, 165, 115, 0.20)',
    stagePadding: 116,
    pattern: 'dots',
    vignette: 'radial-gradient(circle at 78% 16%, rgba(244,165,115,0.28), transparent 34%)',
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
    recipe: 'field-io',
    styleFamily: 'experimental',
    background: '#0b0b0f',
    panel: '#111118',
    surface2: '#000000',
    surface3: '#171724',
    text: '#ffffff',
    text2: '#e7eaff',
    muted: '#a0a4b0',
    faint: '#565d72',
    accent: '#0ce0e5',
    accent2: '#5b2eff',
    accentSoft: 'rgba(12, 224, 229, 0.14)',
    accentGlow: 'rgba(91, 46, 255, 0.30)',
    line: 'rgba(255,255,255,0.10)',
    progress: '#0ce0e5',
    codeBg: '#000000',
    codeText: '#ffffff',
    fontFamily: sans,
    borderWidth: 2,
    radius: 0,
    shadow: '18px 18px 0 rgba(91,46,255,0.18)',
    stagePadding: 92,
    pattern: 'dots',
    vignette: 'radial-gradient(circle at 85% 18%, rgba(12,224,229,0.22), transparent 32%)',
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
    recipe: 'active-theory',
    styleFamily: 'botanical',
    background: '#030706',
    panel: '#07110d',
    surface2: '#0d1d16',
    surface3: '#111814',
    text: '#f4f8ef',
    text2: '#d6dfd0',
    muted: '#8b998d',
    faint: '#34443a',
    accent: '#a6ff7a',
    accent2: '#d9b46b',
    accentSoft: 'rgba(166, 255, 122, 0.12)',
    accentGlow: 'rgba(166, 255, 122, 0.26)',
    line: 'rgba(244,248,239,0.10)',
    progress: '#a6ff7a',
    codeBg: '#030706',
    codeText: '#f4f8ef',
    fontFamily: serif,
    borderWidth: 1,
    radius: 12,
    shadow: '0 24px 82px rgba(0,0,0,0.24)',
    stagePadding: 116,
    pattern: 'botanical',
    vignette: 'radial-gradient(circle at 82% 20%, rgba(166,255,122,0.18), transparent 34%)',
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
    recipe: 'muji-kenya-hara',
    styleFamily: 'minimal',
    background: '#f4f2ec',
    panel: '#fbfaf6',
    surface2: '#f4f2ec',
    surface3: '#ece8df',
    text: '#2a2a28',
    text2: '#4e4d49',
    muted: '#7c7b76',
    faint: '#aaa69b',
    accent: '#c8161d',
    accent2: '#2a2a28',
    accentSoft: 'rgba(200, 22, 29, 0.07)',
    accentGlow: 'rgba(200, 22, 29, 0.10)',
    line: '#d9d6cd',
    progress: '#c8161d',
    codeBg: '#2a2a28',
    codeText: '#f4f2ec',
    fontFamily: sans,
    borderWidth: 1,
    radius: 0,
    shadow: 'none',
    stagePadding: 132,
    pattern: 'paper',
    vignette: 'linear-gradient(135deg, rgba(200,22,29,0.045), transparent 44%)',
    headingTransform: 'none',
    layoutPreset: 'clean-card',
    backgroundLayers: {
      texture: 'paper',
      geometry: 'waves',
      motion: 'subtle',
      glow: {intensity: 0.08, scale: 0.92, speed: 0.04},
    },
  },
  'electric-studio': {
    label: 'Electric Studio',
    nameZh: '电光企业',
    descriptionZh: '深色企业科技，带电光强调色',
    bestFor: '企业级产品、SaaS、工具讲解',
    recipe: 'vercel-mesh',
    styleFamily: 'tool',
    background: '#000000',
    panel: '#0a0a0a',
    surface2: '#111111',
    surface3: '#161616',
    text: '#ededed',
    text2: '#b8b8b8',
    muted: '#888888',
    faint: '#4a4a4a',
    accent: '#ffffff',
    accent2: '#0070f3',
    accentSoft: 'rgba(255,255,255,0.08)',
    accentGlow: 'rgba(0,112,243,0.18)',
    line: 'rgba(255,255,255,0.08)',
    progress: '#ffffff',
    codeBg: '#000000',
    codeText: '#ededed',
    fontFamily: sans,
    borderWidth: 1,
    radius: 8,
    shadow: '0 0 0 1px rgba(255,255,255,0.08)',
    stagePadding: 96,
    pattern: 'grid',
    vignette: 'radial-gradient(circle at 18% 12%, rgba(0,112,243,0.18), transparent 30%), radial-gradient(circle at 76% 22%, rgba(255,0,128,0.12), transparent 28%), radial-gradient(circle at 54% 84%, rgba(245,166,35,0.10), transparent 30%)',
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
    recipe: 'tufte-dataink',
    styleFamily: 'data-ink',
    background: '#fbfaf6',
    panel: '#fbfaf6',
    surface2: '#f2efe7',
    surface3: '#ebe6d9',
    text: '#1b1b1a',
    text2: '#3f3a36',
    muted: '#5c5550',
    faint: '#9d968a',
    accent: '#a6300e',
    accent2: '#3e4a5c',
    accentSoft: 'rgba(166, 48, 14, 0.08)',
    accentGlow: 'rgba(62, 74, 92, 0.10)',
    line: '#d8d2c2',
    progress: '#a6300e',
    codeBg: '#1b1b1a',
    codeText: '#fbfaf6',
    fontFamily: serif,
    borderWidth: 1,
    radius: 0,
    shadow: 'none',
    stagePadding: 116,
    pattern: 'paper',
    vignette: 'radial-gradient(circle at 80% 24%, rgba(166,48,14,0.06), transparent 34%)',
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
    recipe: 'apple-hig',
    styleFamily: 'minimal',
    background: '#ffffff',
    panel: '#f5f5f7',
    surface2: '#ffffff',
    surface3: '#f5f5f7',
    text: '#1d1d1f',
    text2: '#3a3a3c',
    muted: '#86868b',
    faint: '#c7c7cc',
    accent: '#0071e3',
    accent2: '#1d1d1f',
    accentSoft: 'rgba(0, 113, 227, 0.08)',
    accentGlow: 'rgba(0, 113, 227, 0.10)',
    line: '#e5e5ea',
    progress: '#0071e3',
    codeBg: '#1d1d1f',
    codeText: '#f5f5f7',
    fontFamily: sans,
    borderWidth: 1,
    radius: 18,
    shadow: '0 1px 2px rgba(0,0,0,0.04)',
    stagePadding: 132,
    pattern: 'none',
    vignette: 'radial-gradient(circle at 82% 18%, rgba(0,113,227,0.055), transparent 30%)',
    headingTransform: 'none',
    layoutPreset: 'clean-card',
    backgroundLayers: {
      texture: 'none',
      geometry: 'none',
      motion: 'subtle',
      glow: {intensity: 0.24, scale: 1, speed: 0.08},
    },
  },
  'kraft-paper': {
    label: 'Kraft Paper',
    nameZh: '牛皮纸',
    descriptionZh: '手作纸张感，复古、粗粝、像笔记',
    bestFor: '手作感、复古工具、笔记型内容',
    recipe: 'are-na',
    styleFamily: 'brutalist',
    background: '#ffffff',
    panel: '#ffffff',
    surface2: '#f4f1e8',
    surface3: '#ffffff',
    text: '#000000',
    text2: '#222222',
    muted: '#555555',
    faint: '#999999',
    accent: '#0000ee',
    accent2: '#551a8b',
    accentSoft: 'rgba(0, 0, 238, 0.06)',
    accentGlow: 'rgba(0, 0, 238, 0.08)',
    line: '#cccccc',
    progress: '#0000ee',
    codeBg: '#f4f1e8',
    codeText: '#000000',
    fontFamily: 'Arial, "Microsoft YaHei", "PingFang SC", sans-serif',
    borderWidth: 1,
    radius: 0,
    shadow: 'none',
    stagePadding: 92,
    pattern: 'none',
    vignette: 'none',
    headingTransform: 'none',
    layoutPreset: 'editorial-split',
    backgroundLayers: {
      texture: 'none',
      geometry: 'none',
      motion: 'none',
      glow: {intensity: 0, scale: 0.96, speed: 0},
    },
  },
  'monochrome-print': {
    label: 'Monochrome Print',
    nameZh: '黑白印刷',
    descriptionZh: '黑白高对比，严肃、分析、杂志感',
    bestFor: '高对比杂志、严肃观点、分析型内容',
    recipe: 'pentagram',
    styleFamily: 'poster',
    background: '#ffffff',
    panel: '#ffffff',
    surface2: '#f4f1e7',
    surface3: '#ffffff',
    text: '#000000',
    text2: '#1a1a1a',
    muted: '#555555',
    faint: '#999999',
    accent: '#000000',
    accent2: '#1e3fff',
    accentSoft: 'rgba(0,0,0,0.06)',
    accentGlow: 'rgba(30,63,255,0.08)',
    line: '#000000',
    progress: '#000000',
    codeBg: '#000000',
    codeText: '#ffffff',
    fontFamily: '"Helvetica Now", "Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    borderWidth: 2,
    radius: 0,
    shadow: 'none',
    stagePadding: 92,
    pattern: 'stripes',
    vignette: 'linear-gradient(90deg, rgba(0,0,0,0.04), transparent 40%)',
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
    recipe: 'raycast',
    styleFamily: 'glass-tool',
    background: '#0f0f11',
    panel: 'rgba(255,255,255,0.06)',
    surface2: 'rgba(255,255,255,0.08)',
    surface3: 'rgba(255,255,255,0.12)',
    text: '#ffffff',
    text2: '#e8eaed',
    muted: '#b0b3b8',
    faint: 'rgba(255,255,255,0.18)',
    accent: '#ff6363',
    accent2: '#8b5cf6',
    accentSoft: 'rgba(255,99,99,0.14)',
    accentGlow: 'rgba(255,99,99,0.28)',
    line: 'rgba(255,255,255,0.10)',
    progress: '#ff6363',
    codeBg: 'rgba(0,0,0,0.38)',
    codeText: '#ffffff',
    fontFamily: mono,
    borderWidth: 1,
    radius: 8,
    shadow: '0 28px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.12)',
    stagePadding: 96,
    pattern: 'terminal',
    vignette: 'radial-gradient(circle at 76% 18%, rgba(255,99,99,0.34), transparent 30%), radial-gradient(circle at 28% 78%, rgba(139,92,246,0.30), transparent 34%), radial-gradient(circle at 50% 44%, rgba(34,211,238,0.16), transparent 36%)',
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
    recipe: 'notion-pre-ai',
    styleFamily: 'humanist',
    background: '#ffffff',
    panel: '#f7f6f3',
    surface2: '#e4f4f1',
    surface3: '#ffedd5',
    text: '#37352f',
    text2: '#4f4b45',
    muted: '#787774',
    faint: '#b8b6b0',
    accent: '#37352f',
    accent2: '#e4f4f1',
    accentSoft: '#f7f6f3',
    accentGlow: 'rgba(228, 244, 241, 0.42)',
    line: '#e9e9e7',
    progress: '#37352f',
    codeBg: '#f7f6f3',
    codeText: '#37352f',
    fontFamily: sans,
    borderWidth: 1,
    radius: 8,
    shadow: '0 1px 2px rgba(0,0,0,0.05)',
    stagePadding: 116,
    pattern: 'dots',
    vignette: 'radial-gradient(circle at 82% 18%, rgba(228,244,241,0.44), transparent 34%)',
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
    recipe: 'monocle-magazine',
    styleFamily: 'editorial',
    background: '#f2efe7',
    panel: '#fffdf6',
    surface2: '#ebe5d7',
    surface3: '#f2efe7',
    text: '#1a1a1a',
    text2: '#3d3a34',
    muted: '#6f695e',
    faint: '#a49b88',
    accent: '#c7322e',
    accent2: '#5e6347',
    accentSoft: 'rgba(199,50,46,0.08)',
    accentGlow: 'rgba(94,99,71,0.12)',
    line: '#c8c2b0',
    progress: '#c7322e',
    codeBg: '#1a1a1a',
    codeText: '#f2efe7',
    fontFamily: serif,
    borderWidth: 2,
    radius: 0,
    shadow: 'none',
    stagePadding: 92,
    pattern: 'none',
    vignette: 'linear-gradient(90deg, transparent 0 58%, rgba(199,50,46,0.08) 58% 100%)',
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
    recipe: 'mailchimp-freddie',
    styleFamily: 'humanist',
    background: '#ffe01b',
    panel: '#fbefe3',
    surface2: '#ffffff',
    surface3: '#ffe01b',
    text: '#241c15',
    text2: '#3b3128',
    muted: '#88837c',
    faint: '#b8a864',
    accent: '#ff4d74',
    accent2: '#241c15',
    accentSoft: 'rgba(255,77,116,0.10)',
    accentGlow: 'rgba(255,224,27,0.34)',
    line: '#241c15',
    progress: '#ff4d74',
    codeBg: '#241c15',
    codeText: '#ffe01b',
    fontFamily: sans,
    borderWidth: 2,
    radius: 16,
    shadow: '10px 10px 0 #241c15',
    stagePadding: 92,
    pattern: 'zine',
    vignette: 'radial-gradient(circle at 82% 20%, rgba(255,77,116,0.16), transparent 34%)',
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
    recipe: 'vignelli-swiss-helvetica',
    styleFamily: 'swiss',
    background: '#ffffff',
    panel: '#ffffff',
    surface2: '#f5f5f5',
    surface3: '#ffffff',
    text: '#000000',
    text2: '#222222',
    muted: '#8a8a8a',
    faint: '#d9d9d9',
    accent: '#0033a0',
    accent2: '#0033a0',
    accentSoft: 'rgba(0,51,160,0.08)',
    accentGlow: 'rgba(0,51,160,0.12)',
    line: '#000000',
    progress: '#0033a0',
    codeBg: '#000000',
    codeText: '#ffffff',
    fontFamily: sans,
    borderWidth: 1,
    radius: 0,
    shadow: 'none',
    stagePadding: 116,
    pattern: 'grid',
    vignette: 'linear-gradient(90deg, rgba(0,51,160,0.08), transparent 38%)',
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
    recipe: 'bloomberg-terminal',
    styleFamily: 'terminal',
    background: '#0a0e1a',
    panel: '#11172a',
    surface2: '#1a2138',
    surface3: '#11172a',
    text: '#e8ecf4',
    text2: '#e8ecf4',
    muted: '#5e6680',
    faint: '#2a3050',
    accent: '#ffa02f',
    accent2: '#00b96b',
    accentSoft: 'rgba(255,160,47,0.16)',
    accentGlow: 'rgba(255,160,47,0.18)',
    line: '#2a3050',
    progress: '#ffa02f',
    codeBg: '#050814',
    codeText: '#ffa02f',
    fontFamily: '"JetBrains Mono", "IBM Plex Mono", Consolas, monospace',
    borderWidth: 1,
    radius: 0,
    shadow: 'none',
    stagePadding: 72,
    pattern: 'terminal',
    vignette: 'radial-gradient(circle at 18% 10%, rgba(255,160,47,0.10), transparent 30%)',
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
    recipe: 'mid-century-modern',
    styleFamily: 'retro',
    background: '#ebe3d2',
    panel: '#f5ead4',
    surface2: '#d9a441',
    surface3: '#3d6e70',
    text: '#1a1a18',
    text2: '#433d35',
    muted: '#756651',
    faint: '#a9987b',
    accent: '#d9a441',
    accent2: '#9a3324',
    accentSoft: 'rgba(217,164,65,0.16)',
    accentGlow: 'rgba(154,51,36,0.14)',
    line: '#1a1a18',
    progress: '#9a3324',
    codeBg: '#2d2417',
    codeText: '#f5ead4',
    fontFamily: '"Avenir", "Futura", "Microsoft YaHei", "PingFang SC", Arial, sans-serif',
    borderWidth: 2,
    radius: 0,
    shadow: 'none',
    stagePadding: 92,
    pattern: 'paper',
    vignette: 'radial-gradient(circle at 82% 18%, rgba(217,164,65,0.18), transparent 34%)',
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
  const theme = resolveThemeTokens(gardenThemeRegistry[id]);

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
