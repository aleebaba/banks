# Atlas — 银行多维度数据分析平台

> 从 ALM 视角重新审视全球银行的多维度数据分析平台。

## 项目简介

Atlas 是一个面向银行 / 证券研究员、自媒体、金融从业者的多维度数据分析平台原型，
以 ALM（资产负债管理）视角切入，对全球银行的总量、结构、价格、风险（错配 + 信用）四个维度进行分析。

## 状态

`v0.1.0` — 初始结构（移动端 + 桌面端 showcase）

## 目录结构

```
banks/
├── mobile/                     # 移动端页面（10 个）
│   ├── home.html               # 首页
│   ├── compare.html            # 对比页
│   ├── my.html                 # 我的
│   ├── subscription.html       # 订阅
│   ├── banks/                  # 银行模块
│   │   ├── list.html           # 银行列表
│   │   └── detail.html         # 银行详情
│   ├── regulators/             # 监管机构模块
│   │   ├── list.html
│   │   └── detail.html
│   └── reports/                # 研报模块
│       ├── list.html
│       └── detail.html
├── desktop/                    # 桌面端 / 营销页（4 个）
│   ├── index.html              # showcase hub
│   ├── about.html              # 关于
│   ├── components.html         # 组件展示
│   └── prototype-index.html    # 原型索引
├── assets/
│   ├── css/
│   │   ├── tokens.css          # 设计 token（变量）
│   │   └── components.css      # 组件样式
│   ├── images/
│   └── fonts/
├── tools/                      # 内部工具
│   ├── class-audit.js          # class 复用率审计
│   └── migration-checklist.md  # CSS 抽取迁移清单
├── docs/
│   └── superpowers/            # 设计 spec / 实施 plan
│       ├── plans/
│       ├── specs/
│       └── reviews/
├── screenshots/                # 设计稿截图（gitignored）
├── .gitignore
├── README.md
└── CHANGELOG.md
```

## 本地查看

直接浏览器打开 `desktop/index.html`（showcase hub），
或任一 `mobile/*.html`。

所有样式以 inline `<style>` 形式嵌入页面，无需 build、无需 server。
仅 `desktop/components.html` 使用 `<link>` 引用 `assets/css/` 下的样式。

## 设计系统

- **设计风格**：Trading Terminal 风格（Bloomberg 式深色终端）
- **强调色**：cyan
- **数字字体**：monospace
- **圆角**：无
- **颜色约定**：A 股惯例 —— `--up` 红 / `--down` 绿（status 用 `--success` / `--danger`）

详见 `assets/css/tokens.css`。

## 路线图

详见 `CHANGELOG.md`。

- **下一步**：CSS 抽取迁移（16 个 inline `:root` → `<link>`），统一引用 `assets/css/tokens.css`
- **未来**：JS 抽取（toggles.js）、HTML 模板化（Handlebars / 静态生成）
- **生产目标**：迁移到 WeChat 小程序（wxss / WXML / page.js）

## 开发约定

- 所有页面 commit 前需通过浏览器自测（点 4 个 tab + back 按钮 + 一个详情跳转）
- 类名复用以 `class-audit.js` 审计，禁止 page-local 重复定义已在 `components.css` 收录的样式
- 截图设计稿放 `screenshots/`（gitignored），不要 commit

## 许可

未确定。