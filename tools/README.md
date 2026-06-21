# Tools

项目内部工具集。

## `class-audit.js`

跨页面 class 复用率审计。

**用途**：分析 14 个 HTML 页面（10 mobile + 4 desktop）使用的 class 名称，
判断每个 class 是「全站共享」「可提升」「页面本地」「死代码」「缺失」。

**用法**：
```bash
node tools/class-audit.js
node tools/class-audit.js --json   # 输出 JSON 给脚本消费
```

**输出分类**：
- **A.SHARED** — 全站多个页面使用，且已在 `assets/css/components.css` 定义
- **B.PROMOTABLE** — 多页使用但未收录到 components.css（应提升）
- **C.PAGE-LOCAL** — 单页使用（合理 page-local）
- **D.DEAD** — 在 CSS 定义但无任何页面使用
- **E.PER-PAGE GAP** — 某页面使用但未在 components.css 中收录的 classes
- **F.SUMMARY** — 总览统计

## `migration-checklist.md`

CSS 抽取迁移清单（待办）。

**目标**：16 个 inline `:root` → `<link href="assets/css/tokens.css">`，
统一设计 token 入口。

**状态**：已锁定，**未开始**（等 Phase 1 开发结束后启动）。

详见文件本体。