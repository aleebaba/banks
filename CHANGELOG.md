# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-21

### Added
- 新仓库 `banks/` 初始化
- `.gitignore`（排除 Python runtime、Playwright debug、editor sidecars、screenshots）
- `README.md`（项目说明 + 目录结构 + 本地查看指南）
- `CHANGELOG.md`（本文件）
- `assets/images/` `assets/fonts/` `docs/superpowers/reviews/` `screenshots/` 空目录占位（`.gitkeep`）

### Changed
- **目录重构**：项目从 flat 平铺（110+ 文件）改为 platform-based 分层
  - `mobile/` 下：10 个移动端页面
  - `desktop/` 下：4 个 showcase / 营销页
  - `assets/css/` 下：tokens.css + components.css
  - `tools/` 下：class-audit.js + migration-checklist.md
  - `docs/superpowers/` 下：原有 spec / plan 文档
- **HTML 重命名**（去掉冗余前缀 + feature 子目录化）：
  - `mobile-home.html` → `mobile/home.html`
  - `mobile-banks.html` → `mobile/banks/list.html`
  - `mobile-bank-detail.html` → `mobile/banks/detail.html`
  - `mobile-regulators.html` → `mobile/regulators/list.html`
  - `mobile-regulator-detail.html` → `mobile/regulators/detail.html`
  - `mobile-reports.html` → `mobile/reports/list.html`
  - `mobile-report-detail.html` → `mobile/reports/detail.html`
  - `mobile-my.html` → `mobile/my.html`
  - `mobile-compare.html` → `mobile/compare.html`
  - `mobile-subscription.html` → `mobile/subscription.html`
  - `index.html` → `desktop/index.html`
  - `about.html` → `desktop/about.html`
  - `atlas-components.html` → `desktop/components.html`
  - `atlas-prototype-index.html` → `desktop/prototype-index.html`
- **CSS 重命名**：
  - `atlas-tokens.css` → `assets/css/tokens.css`
  - `atlas-components.css` → `assets/css/components.css`
- **tools 重命名**：
  - `atlas-tools/class-audit.js` → `tools/class-audit.js`
  - `atlas-tools/migration-checklist.md` → `tools/migration-checklist.md`
- **链接重写**：所有 `href="*.html"` / `<link href="*.css">` 按新位置重算相对路径

### Not Migrated（不迁入新仓库）
- `mobile-bank-detail.bak.html`（dead，0 引用）
- `response.html`（dead，0 引用）
- `atlas-about-page.html`（`about.html` 镜像，无独立价值）
- `Python/`（vendored CPython 3.14 运行时）
- `.playwright-mcp/`（debug 输出）
- 100+ `.png` 设计稿截图（gitignored，不进新仓库）
- 12 个 `*.artifact.json` 编辑器 sidecar（gitignored）

### Pending（后续任务，已锁定）
- **CSS 抽取迁移**：16 个 inline `:root` → `<link href="assets/css/tokens.css">`
  - 当前 13 个 mobile + 2 个 desktop (about + atlas-prototype-index) + mobile-bank-detail 等仍 inline
  - 仅 `desktop/components.html` 已 link
  - 详见 `tools/migration-checklist.md`
- **JS 抽取**：toggles / view-toggle / mode-toggle 等交互逻辑当前 inline 在各页面，待抽出 `assets/js/`