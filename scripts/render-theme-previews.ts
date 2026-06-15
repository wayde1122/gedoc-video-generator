import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {GARDEN_THEME_IDS, type ThemeId, themes} from '../src/themes';
import {rootDir} from './lib/paths';

const execFileAsync = promisify(execFile);

const remotionBin = path.join(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'remotion.CMD' : 'remotion');
const coursePath = path.join(rootDir, 'course.json');
const previewDir = path.join(rootDir, 'out', 'theme-previews');
const referenceDir = path.join(previewDir, 'references');

const frame = 112;

const demoCourseForTheme = (theme: ThemeId) => ({
  title: 'Garden 主题视觉验收',
  subtitle: '同一份课程内容，验证主题是否只是在换色',
  theme,
  durationSeconds: 30,
  fps: 30,
  slides: [
    {
      kind: 'title',
      start: 0,
      end: 7,
      heading: '主题不是一张卡片',
      body: '每套主题都应该有自己的版式、质感和品牌记忆点。',
      caption: '这一页用于观察背景、标题、强调色和整体画面气质。',
    },
    {
      kind: 'bullets',
      start: 7,
      end: 14,
      heading: '我们检查四个信号',
      bullets: ['配色是否贴近 recipe', '背景是否有专属语言', '排版是否明显不同', '文字是否稳定可读'],
      caption: '同一份内容切换主题时，应该像换了一套视觉系统，而不是换了色板。',
    },
    {
      kind: 'concept',
      start: 14,
      end: 22,
      heading: '从 garden recipes 反推',
      body: '主题 token 负责颜色、质感、字体和边界，Remotion 原语负责把它们变成可识别的画面结构。',
      caption: '这一页用于观察正文、注释、面板和背景装饰是否互相抢戏。',
    },
    {
      kind: 'summary',
      start: 22,
      end: 30,
      heading: '验收标准',
      bullets: ['第一眼可区分', '和参考图同一气质', '不遮挡正文', '可继续批量扩展'],
      caption: '这批截图会和 garden reference 放在同一页对照，方便继续逐个优化。',
    },
  ],
});

const runRemotionStill = async (theme: ThemeId) => {
  const outputPath = path.join(previewDir, `${theme}.png`);
  const args = [
    'still',
    'src/index.tsx',
    'DocVideoGenerator',
    outputPath,
    `--frame=${frame}`,
    '--overwrite',
  ];

  const command = process.platform === 'win32' ? 'cmd.exe' : remotionBin;
  const commandArgs = process.platform === 'win32' ? ['/d', '/s', '/c', remotionBin, ...args] : args;

  await execFileAsync(command, commandArgs, {
    cwd: rootDir,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 10,
  });
};

const htmlEscape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const writeComparePage = async () => {
  const themeById = new Map(themes.map((theme) => [theme.id, theme]));
  const sections = GARDEN_THEME_IDS.map((themeId) => {
    const theme = themeById.get(themeId);
    const recipe = theme?.recipe ?? 'unknown';
    const label = `${themeId} -> ${recipe}`;
    const reference = `references/${themeId}--${recipe}.webp`;

    return `    <section>
      <h2>${htmlEscape(label)}</h2>
      <figure>
        <img src="${themeId}.png" alt="${htmlEscape(themeId)} local preview" />
        <figcaption>Local Remotion preview</figcaption>
      </figure>
      <figure>
        <img src="${reference}" alt="${htmlEscape(themeId)} garden reference" />
        <figcaption>garden-skills reference</figcaption>
      </figure>
    </section>`;
  }).join('\n');

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Theme Preview Compare</title>
  <style>
    body { margin: 0; background: #101010; color: #f5f5f5; font-family: Arial, "Microsoft YaHei", sans-serif; }
    header { position: sticky; top: 0; z-index: 2; padding: 16px 24px; background: rgba(16, 16, 16, 0.94); border-bottom: 1px solid #333; }
    h1 { margin: 0; font-size: 20px; }
    p { margin: 6px 0 0; color: #aaa; font-size: 13px; }
    main { display: grid; gap: 28px; padding: 24px; }
    section { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding-bottom: 28px; border-bottom: 1px solid #333; }
    h2 { grid-column: 1 / -1; margin: 0; font-size: 16px; font-weight: 700; }
    figure { margin: 0; background: #181818; border: 1px solid #333; }
    img { display: block; width: 100%; height: auto; }
    figcaption { padding: 8px 10px; color: #bbb; font-size: 13px; border-top: 1px solid #333; }
  </style>
</head>
<body>
  <header>
    <h1>Theme Preview Compare</h1>
    <p>Left: current project render. Right: garden-skills reference image.</p>
  </header>
  <main>
${sections}
  </main>
</body>
</html>
`;

  await fs.writeFile(path.join(previewDir, 'compare.html'), html, 'utf8');
};

const writeContactSheetPage = async () => {
  const themeById = new Map(themes.map((theme) => [theme.id, theme]));
  const cards = GARDEN_THEME_IDS.map((themeId) => {
    const theme = themeById.get(themeId);
    const recipe = theme?.recipe ?? 'unknown';

    return `    <article>
      <h2>${htmlEscape(themeId)} <span>${htmlEscape(recipe)}</span></h2>
      <div class="pair">
        <figure>
          <img src="${themeId}.png" alt="${htmlEscape(themeId)} local preview" />
          <figcaption>Local</figcaption>
        </figure>
        <figure>
          <img src="references/${themeId}--${recipe}.webp" alt="${htmlEscape(themeId)} garden reference" />
          <figcaption>Garden</figcaption>
        </figure>
      </div>
    </article>`;
  }).join('\n');

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Theme Contact Sheet</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #0d0d0d; color: #f3f3f3; font-family: Arial, "Microsoft YaHei", sans-serif; }
    header { padding: 24px 28px 10px; }
    h1 { margin: 0; font-size: 24px; }
    p { margin: 7px 0 0; color: #aaa; font-size: 13px; }
    main { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; padding: 18px 24px 28px; }
    article { border: 1px solid #303030; background: #161616; padding: 10px; break-inside: avoid; }
    h2 { display: flex; justify-content: space-between; gap: 12px; margin: 0 0 8px; font-size: 13px; }
    h2 span { color: #9d9d9d; font-weight: 400; }
    .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    figure { margin: 0; position: relative; overflow: hidden; border: 1px solid #282828; background: #0b0b0b; aspect-ratio: 16 / 9; }
    img { display: block; width: 100%; height: 100%; object-fit: cover; }
    figcaption { position: absolute; left: 0; top: 0; padding: 3px 6px; background: rgba(0,0,0,0.72); color: #fff; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; }
  </style>
</head>
<body>
  <header>
    <h1>Theme Contact Sheet</h1>
    <p>Current project preview beside the garden-skills reference for every built-in theme.</p>
  </header>
  <main>
${cards}
  </main>
</body>
</html>
`;

  await fs.writeFile(path.join(previewDir, 'contact-sheet.html'), html, 'utf8');
};

const main = async () => {
  await fs.mkdir(previewDir, {recursive: true});
  await fs.mkdir(referenceDir, {recursive: true});

  const originalCourse = await fs.readFile(coursePath, 'utf8');

  try {
    for (const themeId of GARDEN_THEME_IDS) {
      await fs.writeFile(coursePath, `${JSON.stringify(demoCourseForTheme(themeId), null, 2)}\n`, 'utf8');
      console.log(`Rendering ${themeId}...`);
      await runRemotionStill(themeId);
    }
  } finally {
    await fs.writeFile(coursePath, originalCourse, 'utf8');
  }

  await writeComparePage();
  await writeContactSheetPage();
  console.log(`Wrote ${path.join(previewDir, 'compare.html')}`);
};

await main();
