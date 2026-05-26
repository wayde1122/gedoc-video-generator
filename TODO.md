# Garden 原版主题移植与自定义主题删除方案

## Summary

- 删除自定义主题 `business-clean`、`tech-demo`、`editorial-talk`，仅保留 23 套 garden 主题。
- Remotion 继续直接渲染 MP4，不引入 garden 的网页录屏 runtime。
- LLM 自动选择主题；生成阶段严格校验主题，渲染阶段默认兜底为 `warm-keynote`，可通过 `STRICT_THEME=1` 改为直接报错。

## Key Changes

- 主题注册表改为 23 套 garden-only：`midnight-press`、`warm-keynote`、`newsroom`、`bauhaus-bold`、`paper-press`、`blueprint`、`bold-signal`、`chalk-garden`、`creative-voltage`、`dark-botanical`、`dune`、`electric-studio`、`forest-ink`、`indigo-porcelain`、`kraft-paper`、`monochrome-print`、`neon-cyber`、`pastel-dream`、`split-canvas`、`sunset-zine`、`swiss-ikb`、`terminal-green`、`vintage-editorial`。
- `GARDEN_THEME_IDS` 使用 `as const` 定义为单一真相源；`ThemeId`、`z.enum(GARDEN_THEME_IDS)`、README 主题表都从它派生或校验。
- 主题 token 至少覆盖 garden 的核心字段：颜色、字体、边框、圆角、阴影、stage padding、装饰 pattern/vignette、标题/强调样式。
- README 最终只保留 23 套 garden 主题，中英对照使用上游 `theme.json` 的 `nameZh/descriptionZh/bestFor`。
- 删除旧三套主题名在 prompt、README、默认值和测试里的所有引用。

## Theme Validation Behavior

- `generate-course.ts`：
  - prompt 明确列出 23 个合法 theme id，并附中文名、描述和适用场景。
  - `courseSchema.theme` 使用严格枚举；非法 theme 直接 parse 失败，不写入 `course.json`。
  - 缺失 theme 时，`coerceCoursePayload` 补 `DEFAULT_THEME_ID = warm-keynote`。
- `CourseVideo` 渲染：
  - 缺失或非法 theme 默认 `console.warn` 并回退到 `warm-keynote`，避免渲染中断。
  - 如果 `STRICT_THEME=1` 或 `STRICT_THEME=true`，非法 theme 直接 throw，提示用户选择 23 个合法主题之一。
- 不做旧名映射：`business-clean`、`tech-demo`、`editorial-talk` 不会映射到新主题。

## Implementation Changes

- 重写 `src/themes.ts`：删除自定义三套，扩展 `Theme` 类型，移植 23 套 garden token。
- 更新 `CourseVideo`：使用扩展 token 渲染课程模式；至少对背景、字体族、边框厚度、圆角、阴影、装饰纹理/vignette 做主题化。
- 更新 `generate-course.ts`：schema 严格枚举合法主题；prompt 要求 LLM 根据题材、受众、语气选择一个合法 theme id。
- 更新 README：主题示例改为 `warm-keynote`，主题列表改为 23 套 garden-only，中英对照和适用场景同步。
- 保持 DashScope/Sambert 配音、分段音频、渲染输出和清理策略不变。

## Test Plan

- `pnpm exec tsc --noEmit` 必须通过。
- 校验主题数量严格为 23，且不包含 `business-clean`、`tech-demo`、`editorial-talk`。
- 校验 `z.enum(GARDEN_THEME_IDS)` 接受 23 个合法 id，拒绝非法 id。
- 校验缺失 theme 的生成 payload 会补 `warm-keynote`。
- 校验渲染阶段非法 theme：默认 warning + `warm-keynote`；`STRICT_THEME=1` 时 throw。
- 校验 prompt 和 README 中不再出现旧三套主题。
- 渲染抽检：`warm-keynote`、`midnight-press`、`newsroom`、`bauhaus-bold`、`terminal-green`、`neon-cyber`。多主题抽检时设置 `KEEP_ARTIFACTS=1` 或使用无音频单帧渲染，避免清理音频影响后续测试。

## Assumptions

- “效果一致”目标是尽量移植 garden 的主题 token 和视觉气质，不复制网页 runtime。
- 不考虑旧主题兼容；旧 `course.json` 可删除或重新生成。
- 默认兜底固定为 `warm-keynote`。
