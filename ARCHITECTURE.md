# Architecture

Atlas 的前端架构说明。覆盖目录组织、设计系统、链接模式、状态管理策略。

## 设计原则

1. **静态优先**：纯 HTML + CSS + 少量 inline JS，无 build step，无 npm runtime deps
2. **Platform-first**：移动端是产品，桌面端是 showcase / 营销
3. **Feature 子目录化**：有 list + detail 的 feature 用子目录（如 `banks/`），单页放平
4. **设计 token 集中**：所有设计变量在 `assets/css/tokens.css`
5. **链接相对路径**：所有跨页跳转用相对路径（`./` / `../`），不依赖部署 URL

## 目录分层

```
banks/
├── mobile/                ← 产品（10 页）
│   ├── home.html          ← 顶层页面（无 list/detail 关系）放平
│   ├── compare.html
│   ├── my.html
│   ├── subscription.html
│   ├── banks/             ← feature 子目录（list + detail 关系）
│   │   ├── list.html
│   │   └── detail.html
│   ├── regulators/
│   │   ├── list.html
│   │   └── detail.html
│   └── reports/
│       ├── list.html
│       └── detail.html
├── desktop/               ← showcase / 营销（4 页）
│   ├── index.html         ← hub：链接到所有 mobile 页
│   ├── about.html
│   ├── components.html    ← 唯一 link 外部 CSS 的页面
│   └── prototype-index.html
├── assets/
│   ├── css/
│   │   ├── tokens.css     ← 设计 token（CSS 变量）
│   │   └── components.css ← 组件样式
│   ├── images/            ← 空（gitkeep）
│   └── fonts/             ← 空（gitkeep）
├── tools/
│   ├── class-audit.js     ← class 复用率审计
│   ├── verify_links.py    ← 链接检查
│   ├── migration-checklist.md
│   └── README.md
├── docs/
│   └── superpowers/
│       ├── plans/         ← 实施计划
│       ├── specs/         ← 设计 spec
│       └── reviews/       ← 代码评审
├── screenshots/           ← 设计稿（gitignored）
├── .github/workflows/     ← CI
├── README.md
├── ARCHITECTURE.md        ← 本文件
├── CONTRIBUTING.md
├── CHANGELOG.md
├── LICENSE
├── package.json           ← npm scripts（无 runtime deps）
├── .editorconfig
├── .gitattributes
└── .prettierrc
```

## 设计系统

详见 `assets/css/tokens.css`。核心 token：

| 类别 | Token 示例 | 说明 |
|---|---|---|
| 颜色 — 状态 | `--success` / `--danger` | 非方向性状态 |
| 颜色 — 方向 | `--up` / `--down` | A 股惯例：up 红 down 绿 |
| 字体 | `--font-mono` / `--font-sans` | monospace 用于数字 |
| 间距 | `--space-1` ~ `--space-12` | 4px 步进 |
| 边框 | `--border` / `--radius` | 默认无圆角 |

## 链接模式

- **所有跨页 href 用相对路径**：从 `mobile/banks/list.html` 到 `mobile/banks/detail.html` 是 `detail.html`，到 `mobile/home.html` 是 `../home.html`
- **跨平台链接**：`desktop/index.html` 到 `mobile/home.html` 是 `../mobile/home.html`
- **CSS link**：从 `desktop/components.html` 到 `assets/css/tokens.css` 是 `../assets/css/tokens.css`
- **JS / 图片**：当前无外部 JS 或图片引用（所有 SVG inline）
- **`href="#"` 保留**：用于 JS 处理的内部 tab 切换，不视为 broken link

## 状态管理

无框架。当前策略：

| 状态 | 存储 | 位置 |
|---|---|---|
| 主题（dark/light） | `localStorage.theme` | 全局 |
| 当前 tab（mtab） | DOM class `.active` | 页面内 |
| View toggle（chart/list） | DOM class | 页面内 |
| Mode toggle（占比/金额） | DOM class | 页面内 |

主题切换器只在 Settings 页面提供（详见项目记忆 "Global theme switcher, not per-page"）。

## 已知架构债（待偿还）

### 1. CSS 抽取（16 个 inline `:root`）

**现状**：16/17 页面把 `:root` token 块 inline 重复贴了，只有 `desktop/components.html` 用 `<link>` 引用。

**目标**：所有页面 `<link href="assets/css/tokens.css">` + `assets/css/components.css`，移除 inline 重复。

**锁定**：等 Phase 1 开发结束后启动。详见 `tools/migration-checklist.md`。

### 2. JS 抽取（inline toggles）

**现状**：theme / view / mode toggle 的 JS 内联在各页面底部。

**目标**：抽到 `assets/js/toggles.js`，所有页面 `<script src="assets/js/toggles.js" defer>`。

**优先级**：低（功能正常，仅维护性差）。

### 3. 模板化

**现状**：底部 4 tab nav 块在 10 个 mobile 页面里重复。

**目标**：HTML 模板化（Handlebars / 静态生成 / 小程序化）。

**生产目标**：迁移到 WeChat 小程序，详见项目记忆。

## 部署

**当前**：本地 `python -m http.server` 或直接打开 HTML。

**未来**：GitHub Pages（路径需调整 base href）。

## 后续路径

1. CSS 抽取迁移（已锁定）
2. JS 抽取（按需）
3. HTML 模板化（小程序化前奏）
4. 小程序迁移（生产目标）