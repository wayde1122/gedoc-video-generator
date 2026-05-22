# Doc Video Generator

`doc-video-generator` 是一个基于 Remotion 的本地视频生成项目，支持两种主要模式：

1. **PDF/PPTX 转视频**：把文档每一页转成图片，直接作为视频画面。
2. **文案生成课程视频**：把一段课程文案交给大语言模型生成 `course.json`，再配音并渲染成视频。

最终视频默认输出到：

```text
C:\Users\Administrator\Desktop\testmp4\doc-video-generator.mp4
```

项目目录：

```text
C:\Users\Administrator\Desktop\testmp4\doc-video-generator
```

## 安装依赖

第一次使用先运行：

```powershell
cd "C:\Users\Administrator\Desktop\testmp4\doc-video-generator"
pnpm install
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

- 每页默认停留 6 秒。
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

然后运行：

```powershell
pnpm run demo
```

流程：

```text
input\brief.txt
  ↓
gpt-5.4 生成 course.json
  ↓
生成语音
  ↓
Remotion 渲染 MP4
```

只用当前 `course.json` 重新渲染，不重新调用大语言模型：

```powershell
pnpm run demo:current
```

## 环境变量

编辑 `.env`：

```env
OPENAI_API_KEY=your_key_here
OPENAI_BASE_URL=https://next.zhima.world/v1
OPENAI_TEXT_MODEL=gpt-5.4
OPENAI_AUDIO_MODEL=gpt-4o-audio-preview
OPENAI_AUDIO_VOICE=alloy
OPENAI_TTS_FALLBACK_MODEL=tts-1
OPENAI_TTS_FALLBACK_VOICE=nova
```

说明：

- `OPENAI_TEXT_MODEL` 用于把文案生成 `course.json`。
- `OPENAI_AUDIO_MODEL` 用于在线语音生成。
- 如果在线语音接口不可用，会尝试 TTS 兜底。
- 如果仍然失败，会使用 Windows 本地中文语音兜底。

## 常用命令

```powershell
pnpm run doc:demo      # PDF/PPTX 转视频
pnpm run doc:prepare   # 只把文档转图片并生成 course.json
pnpm run demo          # 文案生成课程视频
pnpm run demo:current  # 用当前 course.json 重新渲染
pnpm run render        # 只渲染当前 course.json
pnpm run studio        # 打开 Remotion Studio
```

## 目录说明

```text
input\brief.txt        # 文案生成课程视频的输入
input\docs\            # PDF/PPTX 转视频的输入目录
public\document-pages\ # 文档页转出来的图片
public\voice.wav       # 自动生成或兜底生成的配音
course.json            # 当前要渲染的视频时间轴
scripts\               # 文案生成、语音生成、文档准备脚本
src\                   # Remotion 视频组件
```
