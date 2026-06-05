# Doc Video Generator

`doc-video-generator` 是一个基于 Remotion 的本地视频生成项目，支持两种主要模式：

1. **PDF/PPTX 转视频**：把文档每一页转成图片，直接作为视频画面。
2. **文案生成课程视频**：把课程文案交给大语言模型生成 `course.json`，可选分段配音，再渲染成视频。课程模式支持 23 套 garden-only 本地 Remotion 主题，并按 slide 生成分段配音。

未设置 `VIDEO_OUTPUT` 时，`pnpm run render` 会按 `course.json` 的 `title` 生成输出文件，例如：

```text
out\国内热点新闻速览.mp4
```

也可以用环境变量覆盖输出位置（支持相对路径或绝对路径）：

```powershell
$env:VIDEO_OUTPUT="out\demo.mp4"
pnpm run render
```

## 安装依赖

在项目根目录第一次使用先运行：

```powershell
pnpm install
```

复制环境变量模板，并按你的模型服务商填写 `.env`：

```powershell
Copy-Item .env.example .env
pnpm run env:check
```

macOS/Linux 可使用：

```bash
cp .env.example .env
pnpm run env:check
```

## PDF/PPTX 转视频

这是最稳定的课件转视频方式：不重新排版，不解析成动画模板，而是把文档页面原样转成图片。

把一个 `.pdf` 或 `.pptx` 文件放到：

```text
input\docs\
```

然后运行：

```powershell
pnpm run doc:demo
```

流程：

```text
PDF/PPTX
  ↓
每页转成 PNG 图片
  ↓
生成文档版 course.json
  ↓
Remotion 渲染 MP4
```

规则：

- 每页默认停留 6 秒；可通过 `DOCUMENT_PAGE_SECONDS` 调整。
- 渲染输出默认使用文档文件名，例如 `input\docs\季度汇报.pdf` → `out\季度汇报.mp4`。
- 页面会完整显示，不裁切。
- `input\docs\` 里有多个文件时，只处理按文件名排序后的第一个 PDF/PPTX。
- PDF 可以直接处理。
- PPTX 需要 LibreOffice，把 PPTX 先转换成 PDF。
- 暂不支持旧版 `.ppt`，请先另存为 `.pptx` 或 `.pdf`。

只准备页面图片和 `course.json`，不渲染视频：

```powershell
pnpm run doc:prepare
```

如果 PPTX 报错找不到 LibreOffice：

```text
PPTX conversion requires LibreOffice
```

解决方式：

1. 安装 LibreOffice，并确保命令行可以访问 `soffice`。
2. 或者手动把 PPTX 导出为 PDF，再把 PDF 放到 `input\docs\`。

## 文案生成课程视频

编辑课程文案：

```text
input\brief.txt
```

### 一键命令

| 目标 | 命令 |
|---|---|
| 无旁白预览（默认） | `pnpm run demo` |
| 带分段旁白 | `pnpm run demo:voice` |
| 只重渲染当前 `course.json` | `pnpm run demo:current` |
| 只补配音并重渲染 | `pnpm run demo:current:voice` |

`demo:voice` 会在生成课程后强制重建分段音频（`voice -- --force`）；`demo:current:voice` 会复用已有分段音频，仅缺失时生成。

### 分步命令

```text
input\brief.txt
  ↓
pnpm run course          # OpenAI-compatible 文本模型生成 course.json（含可选 theme，30 秒到 5 分钟）
  ↓
pnpm run voice           # 可选；PROVIDER≠none 时按 slide 生成分段配音
  ↓
pnpm run render          # Remotion 渲染 MP4
```

只生成 `course.json`，不渲染：

```powershell
pnpm run course
```

只用当前 `course.json` 重新渲染，不重新调用大语言模型：

```powershell
pnpm run demo:current
```

如需生成带旁白的视频，先在 `.env` 中把 `PROVIDER` 设为 `openai`、`dashscope`、`xiaomi` 或 `windows`（不支持 `auto`），再运行：

```powershell
pnpm run demo:voice
```

如果想控制视频长度，直接在 `input\brief.txt` 里写明目标时长，例如：

```text
请生成一个 3 分钟左右的中文课程视频，主题是“什么是 Agent Loop”。
```

生成脚本会要求 LLM 尽量遵守 brief 里的时长，但最长不超过 5 分钟。

## 环境变量

先从模板创建 `.env`：

```powershell
Copy-Item .env.example .env
```

macOS/Linux：

```bash
cp .env.example .env
```

`.env.example` 使用中性占位符，不绑定任何私有 endpoint 或固定模型名。编辑 `.env` 时按你的服务商填写：

```env
# 文案生成必填
OPENAI_API_KEY=your_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_TEXT_MODEL=your_text_model

# 配音可选；PROVIDER 必须明确指定，不支持 auto
PROVIDER=none
MODE_API_KEY=your_tts_key_here
MODEL=your_tts_model
MODEL_VOICE=your_voice
MODEL_TTS_TIMEOUT_MS=120000
BASE_URL=https://api.openai.com/v1
VOICE_SPEED=1.15
VOICE_SLIDE_GAP_SECONDS=0.35

# 可选输出设置
DOCUMENT_PAGE_SECONDS=6
VIDEO_OUTPUT=
CLEAN_AFTER_RENDER=true
KEEP_ARTIFACTS=false
STRICT_THEME=false
```

说明：

- 本项目使用 `openai` SDK。`OPENAI_BASE_URL` 可以留空使用 SDK 默认端点，也可以填 OpenAI 官方 `https://api.openai.com/v1`，或填其他 OpenAI-compatible 服务商提供的 `/v1` endpoint。
- `OPENAI_TEXT_MODEL` 用于把文案生成 `course.json`，必须与 `OPENAI_BASE_URL` 对应服务商实际支持的模型名一致。
- `PROVIDER` 可选 `none`、`openai`、`dashscope`、`xiaomi` 或 `windows`；不支持 `auto`，必须明确选择供应商。也可用旧名 `VOICE_PROVIDER`，以及 `openai-audio`、`dashscope-http`、`xiaomi-mimo`、`windows-speech` 等同义写法。
- `MODE_API_KEY`、`MODEL`、`MODEL_VOICE`、`MODEL_TTS_TIMEOUT_MS`、`BASE_URL`、`VOICE_SPEED` 是语音生成的统一配置。
- `openai` 常用 `BASE_URL=https://api.openai.com/v1`，`MODEL` 填音频模型，`MODEL_VOICE` 填音色名。
- `dashscope` 常用 `BASE_URL=https://api.dashscope.com/v1`，`MODEL=cosyvoice-v3-flash`，`MODEL_VOICE=longxiaochun_v3`。
- `xiaomi` 常用 `BASE_URL=https://api.xiaomimimo.com/v1`，`MODEL=mimo-v2.5-tts`，`MODEL_VOICE=mimo_default`；也可以设置 `MODEL_VOICE=auto`，按课程主题内容选择一个全局音色。
- `windows` 仅在 Windows 上使用本地 zh-CN 系统语音。
- `VOICE_SPEED` 控制旁白语速，默认 `1.15`，数值越大越快。调完后运行 `pnpm run voice -- --force` 重新生成已存在的分段音频。
- `VIDEO_OUTPUT` 可选，用于覆盖 `pnpm run render` 的 MP4 输出路径；未设置时默认按 `course.json` 的标题生成，例如 `out\AI日报.mp4`。
- `CLEAN_AFTER_RENDER=true` 会在渲染后清理分段音频、raw 模型输出和临时文本等中间产物，只保留最终 MP4 与当前 `course.json`。如果需要调试中间产物，可设置 `KEEP_ARTIFACTS=true`。
- 修改配置后可运行 `pnpm run env:check` 查看缺失项、外部依赖和输出目录状态。

## 主题

课程模式支持在 `course.json` 顶层设置：

```json
{
  "theme": "warm-keynote"
}
```

未设置或主题名无效时，渲染阶段会 `console.warn` 并回退到 `warm-keynote`。
如果设置 `STRICT_THEME=1` 或 `STRICT_THEME=true`，非法或缺失主题会直接中断渲染。
课程视觉只支持通过 `theme` 选择下列主题；不支持额外的 `visual` 字段。

内置 23 套 garden-only 主题：

| Theme ID | English | 中文名 | 气质 / 适合场景 |
|---|---|---|---|
| `midnight-press` | Midnight Press | 暗色印刷 | 深度技术解读、开发者观点、电影感课程 |
| `warm-keynote` | Warm Keynote | 暖色 Keynote | SaaS keynote、B 端产品发布、团队对外汇报 |
| `newsroom` | Newsroom | 报社 | 深度评测、时事评论、纪录片 / 报道 |
| `bauhaus-bold` | Bauhaus Bold | 包豪斯 | 产品发布、观点宣言、设计演讲 |
| `paper-press` | Paper Press | 亮色印刷 | 杂志型内容、温和教程、大众科技解读 |
| `blueprint` | Blueprint | 蓝图 | 架构图、系统讲解、工程化内容 |
| `bold-signal` | Bold Signal | 焦点信号 | 高冲击产品 pitch、观点表达、发布会 |
| `chalk-garden` | Chalk Garden | 粉笔花园 | 课堂讲解、教育内容、轻松教程 |
| `creative-voltage` | Creative Voltage | 电压创意 | 创意展示、设计内容、强视觉短视频 |
| `dark-botanical` | Dark Botanical | 暗夜植物 | 高级感品牌、生活方式、审美型内容 |
| `dune` | Dune | 沙丘 | 克制、高级、低饱和产品或观点视频 |
| `electric-studio` | Electric Studio | 电光企业 | 企业级产品、SaaS、工具讲解 |
| `forest-ink` | Forest Ink | 森林墨 | 长文解读、知识内容、沉稳课程 |
| `indigo-porcelain` | Indigo Porcelain | 靛蓝瓷 | 高级科技、人文科技、品牌叙事 |
| `kraft-paper` | Kraft Paper | 牛皮纸 | 手作感、复古工具、笔记型内容 |
| `monochrome-print` | Monochrome Print | 黑白印刷 | 高对比杂志、严肃观点、分析型内容 |
| `neon-cyber` | Neon Cyber | 霓虹赛博 | AI、未来感产品、赛博/技术内容 |
| `pastel-dream` | Pastel Dream | 柔光梦 | 柔和教程、生活方式、轻量工具介绍 |
| `split-canvas` | Split Canvas | 双拼画布 | 设计演示、对比讲解、创意型视频 |
| `sunset-zine` | Sunset Zine | 日落 Zine | 独立杂志、年轻化表达、潮流内容 |
| `swiss-ikb` | Swiss IKB | 瑞士克莱因蓝 | 极简产品展示、品牌发布、专业汇报 |
| `terminal-green` | Terminal Green | 终端绿 | 黑客感、终端、CLI、开发者教程 |
| `vintage-editorial` | Vintage Editorial | 复古编辑 | 复古杂志、观点口播、品牌故事 |

这些主题只保留 garden 的主题命名和视觉气质，token 和 Remotion 实现是本项目独立实现，
没有引入网页录屏 runtime。

主题使用 3 种布局预设：

- `clean-card`：清爽课程卡片，适合大部分教学和产品说明。
- `editorial-split`：更强的杂志/keynote 感，适合口播和观点型内容。
- `terminal-code`：偏技术和代码演示，适合 API、开发工具和 AI 工作流。

## 分段配音

`pnpm run voice` 会按 slide 生成：

```text
public\voice\slide-001.wav
public\voice\slide-002.wav
...
```

并把对应路径写回 `course.json` 的每个 slide：

```json
{
  "audioSrc": "voice/slide-001.wav"
}
```

规则：

- `PROVIDER=none` 时，`pnpm run voice` 会跳过生成；文档模式也会自动跳过。
- `pnpm run voice` 会在每段语音生成或复用后读取真实 WAV 时长，并重写每个 slide 的 `start/end`。
- 下一页会从“当前页语音真实结束时间 + `VOICE_SLIDE_GAP_SECONDS` 留白”之后开始，避免旁白还没结束就翻页。
- `VOICE_SLIDE_GAP_SECONDS` 默认 `0.35` 秒，可在 `.env` 中调整。
- 每个课程 slide 都必须有 `caption` 并生成对应 `audioSrc`；缺失时 `pnpm run voice` 会直接报错。
- 如果所有 slide 都没有 `audioSrc`，渲染会生成无旁白视频，便于新克隆仓库直接预览示例课程。
- 已存在的分段音频会跳过，不重复生成，但仍会读取音频时长并同步 `course.json`。

## 常用命令

```powershell
pnpm run env:check          # 检查 .env、模型配置、外部依赖和输出目录
pnpm run doc:demo           # PDF/PPTX 转视频
pnpm run doc:prepare        # 只把文档转图片并生成 course.json
pnpm run course             # 从 input\brief.txt 生成 course.json
pnpm run demo               # course + render（无旁白）
pnpm run demo:voice         # course + voice --force + render（带旁白）
pnpm run demo:current       # 用当前 course.json 重新渲染（无旁白）
pnpm run demo:current:voice # voice + render（复用或补全分段配音）
pnpm run render             # 只渲染当前 course.json
pnpm run voice              # 按 slide 生成分段配音（PROVIDER=none 时跳过）
pnpm run clean              # 手动清理中间产物（渲染成功时也会自动清理）
pnpm run typecheck          # TypeScript 类型检查
pnpm run check              # 类型检查 + 主题与配音 provider 测试
pnpm run studio             # 打开 Remotion Studio
```

## 目录说明

```text
input\brief.txt              # 文案生成课程视频的输入
input\docs\                  # PDF/PPTX 转视频的输入目录
public\document-pages\       # 文档页转出来的图片
public\voice\                # 分段配音（slide-001.wav 等）
course.json                  # 当前要渲染的视频时间轴
out\                         # 渲染输出与中间产物（默认保留 *.mp4 与 course.json）
out\course.generated.json    # 最近一次 course 生成的规范化结果
out\course.raw-model-output.txt
scripts\                     # 文案生成、语音生成、文档准备脚本
scripts\voice\               # 配音 provider 注册与实现
src\                         # Remotion 视频组件与主题
tests\                       # 主题迁移与 voice provider 测试
```
