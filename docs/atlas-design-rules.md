# Atlas 移动端 · 设计规则 brief

> 一页 brief，给 Claude Code / 任何前端 agent 看。  
> 完整 token：`atlas-tokens.css`  
> 完整部件：`atlas-components.css` + `atlas-components.html`（可视化目录）

---

## 0. 必须先做的事

```html
<link rel="stylesheet" href="atlas-tokens.css" />
<link rel="stylesheet" href="atlas-components.css" />
```

只改文件内容、结构和样式，不要重写 `:root` token，不要新增 `--xxx` 变量（除非加到 `atlas-tokens.css` 一起）。

---

## 1. 硬约束（违反任何一条都算失败）

| # | 约束 | 反例 |
|---|------|------|
| 1 | **全局圆角 ≤ 4px**，禁用 `border-radius: 8/12/16`、禁用 Tailwind `rounded-*` ≥ md | 卡片 16px、按钮全圆、胶囊 |
| 2 | **A-share 红涨绿跌**：`--up = red`、`--down = green`，与国际惯例相反 | NIM `-48bp` 用绿色 |
| 3 | **不显示股票代码 / ticker / 交易所代码**（601398.SH 等） | 头部加 ticker 行 |
| 4 | **数字一律 mono**：`font-family: var(--font-mono)` + `font-variant-numeric: tabular-nums` | 数字用等线体 |
| 5 | **背景 `#070b12` / 卡片 `#101826`**，分层靠 1px 边框 + `--surface-2` 而非色差 | 卡片用深蓝填充 |
| 6 | **主色 cyan `--accent: #38bdf8`**，禁止引入其他色相作为强调 | 紫/绿/橙强调 |
| 7 | **禁用**：Tailwind、圆角组件库、浅色默认、消费级阴影、glassmorphism、emoji 图标 |  |
| 8 | **占比/结构图只用柱状图**（4 类并排、或堆叠时间序列），不用 donut | donut + 引导线 + 标签胶囊 |
| 9 | **history 结构图配色限定 4 色**：`--cat-1 / --cat-2 / --cat-3 / --cat-4` | 红/橙/黄/绿条 |
| 10 | **数据维度开放，不预设上限**（已扩展 38 项）。Tab / 字段集合预留扩展位 | "完整 6 tab" 这类封闭说法 |
| 11 | **主题切换只改 token，不改组件**——浅色版由 `:root[data-theme="light"]` 覆盖，组件用 `var()` 自动跟；禁止为浅色另写一套 CSS/HTML | 浅色页用浅色硬编码色、浅色页加 `bg-white` 之类 |

---

## 2. 颜色使用边界

| 用途 | 用 token | 不要用 |
|------|---------|--------|
| 价格上涨 / YoY 上升 / NIM 下降（坏）/ 占比上升 | `--up` (red) | green |
| 价格下跌 / NIM 上升（好）/ 占比下降 | `--down` (green) | red |
| 系统状态：成功 | `--success` (green) | `--up` |
| 系统状态：失败/危险 | `--danger` (red) | `--down` |
| 数据点强调、tab 激活、链接、按钮 | `--accent` (cyan) | 其他 |
| 数据分类（前 4 类） | `--cat-1 / -2 / -3 / -4` | 自定义色 |
| 同期对比（次要序列） | `--cat-prior` | gray |

> 关键区分：**方向性数据红涨绿跌** vs **系统状态国际惯例**。  
> 黄金法则：用户看到 `+3.2%` 时应是红色；用户看到"接口异常"时也是红色。

---

## 3. 部件选型

### 数据卡
用 `.data-card`，padding 16/18px，内含 `.h` 头（h3 + ctrl-row）+ body。

### 多指标头部
用 `.kv` 2 列网格：每格 k（uppercase mono 标签）/ v（粗体数值）/ d（delta 红涨绿跌）。**不要**用 4 张圆角小卡片。

### 总规模行
用 `.strip` + `.yoy` 组合（顶部头条数字）。

### 占比/结构
- 当前快照 → 4 类并排柱状图（双期），上方 `.period-bar`
- 表格视图 → `.tbl-6`（6 列：项名/2025-12-31/2024-12-31/变动/占比/占比变动）
- 结构变动 → `.evo-section`：标题 + `.period-tabs`（1Y/3Y/5Y/MAX，5Y 默认）+ 100% 堆叠柱状图 + `.legend` 图例

### 视图切换
`.toggle-row` + `.tg-btn`（柱状图 / 表格）。激活态 fg 反色。

### 图表视图切换
`.view-toggle` 28×28 单图标按钮（HIG 约定：图标显示**目标状态**）。一个图标按钮搞定"图表 ↔ 表格"切换。**不要**用 `.toggle-row` + 两个 `.tg-btn` 的双段切换（占 header 空间）。**不要**把图表/表格切换和占比/金额混在一个控件里。

### 区间选择
- 图表工具栏 → `.seg-ctrl` + `.seg`（1Y/3Y/5Y/MAX）
- 进化区块 → `.period-tabs` + `.pt-btn`（更紧凑）

### 下载按钮
卡片右上 → `.dl-mini` 28×28。

### 状态色块
- 状态徽章 → `.delta-tag`（good/bad/flat）
- YoY 数字 → `.yoy`（up/down）
- 表格内变动 → `.delta-good` / `.delta-bad` 直接作用于 td

### Tab 内容
- 页面级 tab → `.tab-panel[data-panel="..."]` + `.active`
- 底部导航 → `.tabs` + `.tab`

---

## 4. 密度规则

| 元素 | 数值 |
|------|------|
| 卡片 padding | 16/18px |
| 卡片间距 | 8-12px |
| 单卡片高度 | ≤ 240px |
| 卡片圆角 | 4px |
| 头部高度 | 56-64px |
| 段位切换 pill padding | 3-9px |
| 按钮最小高度 | 28px |

**禁止**：卡片间距 ≥ 24px、padding ≥ 24px、圆角 ≥ 8px、阴影 / glow。

---

## 5. 数据呈现

| 数据 | 频率 | 来源 |
|------|------|------|
| 资负存量 | 半年频（6/12 月报） | 银行 6/12 月披露 |
| NIM / 收付息率 | 半年频 | 同上 |
| 重定价缺口 | 季度（必要时） | 季报 |
| 流动性指标 | 季度 | 季报 |
| 资本充足率 | 季度 | 季报 |
| 资产质量 | 半年频 | 半年报 |

**结构变动图**用半年频：5Y = 10 个点，3Y = 6 个点，1Y = 2 个点，MAX = 16 个点（自 2018H1）。

---

## 6. 金融术语自由使用

**不要解释**：NIM、CAR、CET1、LCR、NSFR、G-SIB、RWA、NPL、PCR、bp、pp、pp 变动、息差、错配、缺口、重定价。

目标用户：①银行 ②券商研究员 ③自媒体 ④金融从业个人（均付费订阅）。

---

## 7. 验证清单（写完一页自检）

- [ ] 所有 card 圆角 ≤ 4px
- [ ] NIM `-48bp` 这类坏变化是 **红色**（不是绿色）
- [ ] 头部无 601398.SH / ticker
- [ ] 所有数字 mono 字体 + tabular-nums
- [ ] 占比/结构只用柱状图（无 donut）
- [ ] history 结构图用 `--cat-1/2/3/4` 4 色
- [ ] 主色 `--accent` cyan，无紫/绿/橙强调
- [ ] 控制台无报错
- [ ] 不预设数据维度上限（保留扩展位）

---

## 8. 文件清单

```
atlas-tokens.css      ← 必引（token + reset + 焦点环）
atlas-components.css  ← 必引（18 个部件）
atlas-components.html ← 可视化目录（CC 写新页前先看一眼）
atlas-design-rules.md ← 本文件
mobile-bank-detail.html ← 完整范例（CC 参考的整体结构和密度）
```

---

## 9. 给 CC 的最短指令模板

```text
改 [文件名].html 时：
1. head 里 <link rel="stylesheet" href="atlas-tokens.css"> + atlas-components.css
2. 严格按 atlas-design-rules.md 的硬约束和部件选型
3. 写完跑 atlas-design-rules.md §7 的 9 项验证清单
4. 控制在 ≤1000 行（超了就拆 css/ 或 js/）
```
