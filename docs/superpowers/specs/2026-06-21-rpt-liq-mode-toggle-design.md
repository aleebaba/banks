# 重定价 / 流动性 · 图表模式切换 — 设计 spec

| 项 | 值 |
|----|----|
| 日期 | 2026-06-21 |
| 作者 | Claude (brainstorming) |
| 状态 | 待用户审核 |
| 范围 | `mobile-bank-detail.html` 的 重定价 / 流动性 tab |
| 不影响 | 表格视图 / 其他 tab（NIM / 资负 / 资本 / 资产质量）|

---

## 1. 背景与目标

**现状**：重定价 / 流动性两个 tab 的柱状图只能展示**期限结构百分比**（Y 轴 0-45% / 0-40%）。金融专业用户（ALM 实践者、券商研究员）经常需要看**绝对金额**（如 18.38 万亿）来对比规模差异、写报告引用。

**目标**：在不增加 header 拥挤度、不改表格视图、不动数据结构的前提下，让用户能在两 tab 的柱状图上自由切换 占比 / 金额 两种度量模式，同时把图表/表格视图切换控件做紧凑。

---

## 2. 设计决策（已与用户确认）

### 2.1 Header 布局 · 4 控件 → 3 控件

**之前**（方案 A，问题：顶部太挤）：
```
[重定价期限分布]    [占比|金额]  [柱状图|表格] [⬇]
```

**之后**（新方案）：
```
[重定价期限分布]                         [⊞] [⬇]
```

- 去掉 `柱状图|表格` 双段 toggle，合并为**单图标按钮**
- `占比|金额` 下移到图表工具栏行（图表元信息归类在一起）

### 2.2 图表工具栏布局

工具栏位于 header 之下、SVG 之上，结构：

```
[● 2025-12-31] [● 2024-12-31]              [占比|金额]
```

- 左：period-bar（标识期间，不变）
- 右：占比/金额 seg-ctrl（图表元信息新成员）
- 两者都是图表相关元数据，并排合理

### 2.3 视图切换图标按钮

| 属性 | 值 |
|-----|---|
| 尺寸 | 28×28（同 dl-mini） |
| 形状 | 方角 6px radius（Trading Terminal 风格） |
| 位置 | header 右侧，dl-mini 左侧 |
| 图标约定 | **HIG — 显示目标状态图标**（点击后会切到什么） |
| 当前柱状图视图 → | 显示表格 icon |
| 当前表格视图 → | 显示柱状图 icon |
| 默认态 | 当前是柱状图 → 表格 icon |
| 状态样式 | hover 时 bg → fg、text → accent-fg（与 dl-mini 一致） |
| Tooltip | `title="切换到表格"` / `title="切换到柱状图"` |
| 键盘可达 | `aria-label` 同 tooltip |

### 2.4 占比 / 金额 段位控件

| 属性 | 值 |
|-----|---|
| 组件 | 复用现有 `.seg-ctrl` + `.seg`（同 LCR/NSFR 工具栏） |
| 位置 | 图表工具栏行右端 |
| 默认 | `占比`（保留当前行为，不破坏已有截图） |
| 激活态 | bg → surface，text → accent（同现有 seg-ctrl） |

---

## 3. 金额模式视觉

### 3.1 Y 轴范围

| Tab | 占比模式 Y 轴 | 金额模式 Y 轴 |
|-----|--------------|--------------|
| 重定价 | 0-45%（15% 一档） | 0-20T（5T 一档）|
| 流动性 | 0-40%（10% 一档） | 0-25T（5T 一档）|

**单位**：`T` = 万亿（人民币元）。  
**上限依据**：2025-12-31 重定价合计 53.48 万亿、流动性合计同；单桶最大 ~13T（5 年以上），20T / 25T 上限给 ~1.5x 余量，柱形仍能撑满 80% 视觉空间。

### 3.2 柱形几何

- X 坐标、宽、组间距、颜色、字体：**完全不变**
- 只重算 `height` 和 `y`：
  - `height = value / maxValue × chartHeight`
  - `y = baselineY - height`
- period-bar 颜色不变（cat-1 vs cat-prior）

### 3.3 Y 轴标签格式

| 模式 | 标签 |
|-----|------|
| 占比 | `0%`, `15%`, `30%`, `45%`（流动性 `10%`, `20%`, `30%`, `40%`）|
| 金额 | `0`, `5T`, `10T`, `15T`, `20T`（流动性加 `25T`）|

字体：mono, 9px, muted（保持当前 Y 轴标签样式不变，只换数字字符串）。

### 3.4 period-bar · 完全不动

它标识**期间**（2025-12-31 vs 2024-12-31），与数据形式无关。

---

## 4. 交互

### 4.1 切换行为表

| 操作 | 行为 |
|-----|------|
| 点击 header 视图图标 | 硬切换 图表 ↔ 表格 视图，图标同步切换（HIG）|
| 点击 seg `占比` | 重算 SVG 柱形 height/y，Y 轴标签换为 % 字符串 |
| 点击 seg `金额` | 重算 SVG 柱形 height/y，Y 轴标签换为 T 字符串 |
| 表格视图 + 切 seg 模式 | **表格完全不受影响**（已有金额列 + 占比列）|

**无动画**：与其他 segment 切换保持一致的硬切换感，符合 Trading Terminal 风格。

### 4.2 默认状态

页面加载时：重定价 / 流动性 tab 默认 `占比` + `柱状图`。保留当前所有截图与文档。

---

## 5. 实现策略（已规避 JS 坐标重算风险）

### 5.1 SVG 切换方案 · 预生成两套

**方案**：不靠 JS 重算每根柱子的 x/y/height，而是**预生成两套 SVG**（占比版 + 金额版），用 CSS `display` 切换显示。

```
#rpt-chart-pct  →  默认显示（占比）
#rpt-chart-amt  →  display: none（金额）

切到金额模式 → #rpt-chart-pct: none, #rpt-chart-amt: block
```

**为什么**：当前 SVG 是手写 rect 坐标，JS 重算容易出 NaN / 浮点误差；预生成两套 + display 切换最稳，CC 也好抄。

**与 §4 切换行为一致**：用户感知是"柱形高度变化"，实际是"两套 SVG 硬切换 display"。`data-mode` 属性挂在 chart 容器（`data-rpt-view="chart"`）上，CSS 用 attribute selector 选中对应 SVG。

### 5.2 复制与改动清单

对每个 tab（rpt / liq）：
1. 复制 `#rpt-chart` SVG，改 id 为 `#rpt-chart-amt`
2. 重算所有 rect 的 y / height 按金额口径（用 max=20T / 25T 反算）
3. 重写 5 个 Y 轴 text 标签为 T 单位
4. 把 seg-ctrl 加进 `.period-bar` 同行的右端
5. chart 容器（`data-rpt-view="chart"`）内同时放 `#rpt-chart-pct` 和 `#rpt-chart-amt`
6. JS：seg-ctrl click → 切换 chart 容器的 data-mode（pct/amt），CSS 控制 SVG display

---

## 6. 影响范围

| 文件 | 改动 |
|-----|------|
| `mobile-bank-detail.html` | 重构 重定价 + 流动性 两 tab 的 header / toolbar / SVG |
| `atlas-components.css` | 补一个 `.view-toggle` 类（可选，复用 dl-mini 样式） |
| `atlas-components.html` | 增加 view-toggle 示例（可选）|
| `atlas-design-rules.md` | §3 部件选型补一条 "图表视图切换用 view-toggle 单图标按钮" |

**不动的部分**：表格视图、period-bar、AI 解读卡片、流动性指标（LCR/NSFR/流动性比例）、NIM / 资产质量 / 资本 / 资负 tab。

---

## 7. 验证清单（实现后自检）

### 7.1 布局
- [ ] 重定价 / 流动性 header 都是 3 控件（title + view-toggle + dl-mini）
- [ ] view-toggle 在 dl-mini 左边
- [ ] 占比 / 金额 seg-ctrl 在图表工具栏右端
- [ ] period-bar 在 seg-ctrl 左边、不重叠

### 7.2 图标按钮
- [ ] 默认（柱状图视图）显示表格 icon
- [ ] 切到表格后图标变成柱状图 icon
- [ ] hover 反色（bg → fg, text → accent-fg）
- [ ] `title` 和 `aria-label` 文案正确

### 7.3 金额模式
- [ ] 切到金额后 Y 轴显示 `5T / 10T / 15T / 20T`（流动性含 `25T`）
- [ ] 切回占比后 Y 轴显示 `15% / 30% / 45%`（流动性 `10% / 20% / 30% / 40%`）
- [ ] 柱形 x 位置、宽、组间距不变
- [ ] 颜色（cat-1 / cat-prior）不变

### 7.4 表格与默认
- [ ] 表格视图完全不变（金额 + 占比 + pp 三列都在）
- [ ] 页面加载默认是 占比 + 柱状图
- [ ] 切模式时无动画（硬切）

### 7.5 设计系统一致性
- [ ] view-toggle 圆角 6px、方角风格（不是 32×32 圆形）
- [ ] seg-ctrl 用现有 `.seg-ctrl` 不自造
- [ ] period-bar 用现有 `.period-bar` 不自造
- [ ] 切换时无 transition / animation（保持 Trading Terminal 硬切换）

---

## 8. 风险与备注

| 风险 | 缓解 |
|-----|------|
| 现有 SVG 是手写 rect，JS 重算坐标易出 NaN | 预生成两套 SVG，display 切换 |
| 360px 移动端工具栏行可能挤压 | period-bar 8-9 字符 + seg-ctrl 2 段共 7 字符 + gap ≈ 200px，360px 容器够 |
| view-toggle 是否需要单独类名 | 复用 dl-mini 即可，hover 行为一致；但如想 hover 时显示 tooltip 背景色，可加 `.view-toggle` 变体 |

**备注**：本次 spec **不影响** NIM / 资负 / 资本 / 资产质量 tab 的 chart header。那些 tab 没有"金额模式"诉求，不在本次改造范围。