# Contributing to Atlas

感谢你的关注。本项目目前是单人 prototype 阶段，贡献流程简化但仍要遵守。

## 开发环境

| 工具 | 版本 | 用途 |
|---|---|---|
| Node.js | >= 18 | `tools/class-audit.js` |
| Python | >= 3.10 | `tools/verify_links.py` + http server |
| 浏览器 | 现代浏览器（Chrome / Edge / Safari / Firefox 最新 2 版） | 自测 |

## 本地起步

```bash
# 1. 克隆
git clone <repo-url> banks
cd banks

# 2. 启动本地服务（任选其一）
npm run serve          # python -m http.server 8000
# 或
python -m http.server 8000

# 3. 浏览器打开
# http://localhost:8000/desktop/index.html   # showcase hub
# http://localhost:8000/mobile/home.html     # mobile 首页
```

## 文件结构

详见 [README.md](./README.md) 和 [ARCHITECTURE.md](./ARCHITECTURE.md)。

简要：
- `mobile/` — 移动端页面（10 个）
- `desktop/` — 桌面端 / 营销页（4 个）
- `assets/css/` — 设计 token + 组件样式
- `tools/` — 内部工具（class-audit / verify-links）
- `docs/superpowers/` — 设计 spec / 实施 plan

## 修改规范

### 添加新页面

1. 决定页面属于哪个平台（mobile / desktop）
2. 如果是多页 feature（如 banks、regulators），在该 feature 子目录下创建
3. 顶部 nav 和底部 tab 的链接同步更新所有相关页面
4. 跑 `npm run verify` 确认链接无 404

### 修改设计 token

1. 改 `assets/css/tokens.css`
2. **重要**：所有页面都 inline 复制了 `:root`，改了 tokens.css 后还需要更新 16 个页面的 inline 块（详见 `tools/migration-checklist.md`）
3. 当前 inline 策略是 Phase 1 的临时方案，长期目标是迁移到 `<link>` 引用

### 添加新组件 class

1. 先在 `assets/css/components.css` 定义
2. 然后在新页面使用
3. 跑 `npm run audit` 确认 class 复用率，避免 page-local 重复定义

### 修改 JS

所有 JS 当前 inline 在各页面底部（theme toggle / view toggle / mode toggle）。
新交互仍 inline；待抽出 `assets/js/toggles.js` 时再统一重构。

## Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 风格：

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型：
- `feat` — 新功能
- `fix` — bug 修复
- `refactor` — 重构（无新功能 / 修复）
- `style` — 格式（无代码变更）
- `docs` — 仅文档
- `chore` — 构建 / 工具 / 依赖

Scope 建议：`mobile` / `desktop` / `tokens` / `components` / `tools` / `docs`

示例：
```
feat(mobile/banks): add bank detail page
fix(mobile): 修复首页 "我的" tab 跳转无反应 bug
refactor: 目录重构 + 链接重写
docs: add ARCHITECTURE.md
chore: add CI workflow
```

## 提交前自测

每次 commit 前：

```bash
npm run verify    # 0 broken links
npm run audit     # class 复用率审计
```

Playwright 手工：
1. 打开涉及修改的页面
2. 点底部 4 个 tab，验证跳转
3. 测试 back 按钮
4. 至少点一个详情链接

## CI

PR 触发 `.github/workflows/ci.yml`，自动跑：
- `npm run verify` — 链接检查
- `npm run audit` — class 审计
- Python 3.10 + Node 18 环境

失败则合并被阻断。

## 提 PR

1. 从 `main` 切分支：`git checkout -b feat/<name>` 或 `fix/<name>`
2. commit 用上面规范
3. push 后开 PR，描述：
   - 改了什么
   - 为什么改
   - 如何自测
   - 关联 issue（如有）

## 风格

- 缩进：2 空格（HTML / CSS / JS / JSON / YAML），4 空格（Python）
- 引号：双引号（HTML 属性 / JSON），单引号（Python 字符串）
- 行宽：HTML 120，CSS / JS 100
- 文件名：kebab-case（`mobile-home.html`、`class-audit.js`）
- 详见 `.editorconfig` + `.prettierrc`

## 反馈

直接 commit 留言 / 提 issue 都行，正式流程上线前不设强制 review。