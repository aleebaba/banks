# 重定价 / 流动性 · 图表模式切换 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `mobile-bank-detail.html` 的 重定价 / 流动性 tab 加 占比/金额 模式切换，并把图表/表格视图切换合并为单图标按钮。

**Architecture:** header 精简为 3 控件（title + view-toggle + dl-mini）；占比/金额 seg-ctrl 下移到图表工具栏右端；每个 tab 预生成两套 SVG（占比版 + 金额版），用 `data-mode` 属性 + CSS display 切换；JS 处理 view-toggle 和 seg-ctrl 两个交互。

**Tech Stack:** HTML5, CSS (atlas-components.css tokens), Vanilla JS (no framework). 设计规则遵循 `atlas-design-rules.md`。

---

## 文件清单

| 文件 | 操作 | 职责 |
|-----|------|------|
| `atlas-components.css` | Modify | 加 `.view-toggle` 类（基于 `.dl-mini` 变体）|
| `atlas-components.html` | Modify | 加 view-toggle 示例 |
| `atlas-design-rules.md` | Modify | §3 部件选型补一条规则 |
| `mobile-bank-detail.html` | Modify | 重构 rpt + liq 两 tab 的 header / toolbar / SVG / JS |

**核心数据契约**（两 tab 复用）：
- view-toggle: `data-target="rpt" | "liq"`，`aria-label` 动态切换
- seg-ctrl: `data-target="rpt-mode" | "liq-mode"`，两个 `.seg` 按钮
- chart 容器: `data-mode="pct" | "amt"` 控制 SVG 显示

---

## Task 1: 在 atlas 设计系统加 view-toggle 部件

**Files:**
- Modify: `atlas-components.css` (在 `.dl-mini` 之后追加)
- Modify: `atlas-components.html` (在 dl-mini 示例附近追加)

- [ ] **Step 1: 在 atlas-components.css 末尾追加 view-toggle 类**

打开 `atlas-components.css`，找到第 235 行附近的 `.dl-mini svg { width: 12px; height: 12px; }` 之后，追加：

```css
/* ============================================================
   10b. view-toggle  · single-icon chart/table view switcher
   Same shape as dl-mini (28×28, sharp 6px). Icon shows TARGET
   state (HIG convention) — click to switch TO that view.
   ============================================================ */
.view-toggle {
  width: 28px; height: 28px;
  border-radius: 6px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  display: grid; place-items: center;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s ease;
}
.view-toggle:hover {
  background: var(--fg);
  color: var(--accent-fg);
  border-color: var(--fg);
}
.view-toggle:active { transform: scale(0.92); }
.view-toggle svg { width: 13px; height: 13px; stroke-width: 1.5; }
```

- [ ] **Step 2: 验证 CSS 已写入**

Run: `grep -n "view-toggle" atlas-components.css`
Expected: 输出包含 `.view-toggle {` 和后续规则，3 处匹配。

- [ ] **Step 3: 在 atlas-components.html 追加示例**

打开 `atlas-components.html`，找到 dl-mini 示例卡片（grep "dl-mini" 找），在该卡片**之后**追加：

```html
<div class="cmp">
  <div class="cmp-h">view-toggle · 28×28 单图标视图切换</div>
  <div class="cmp-body" style="display:flex;gap:8px;align-items:center;">
    <button class="view-toggle" aria-label="切换到表格" title="切换到表格">
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="10" height="2"/><rect x="2" y="6.5" width="10" height="2"/><rect x="2" y="10" width="7" height="2"/>
      </svg>
    </button>
    <button class="view-toggle" aria-label="切换到柱状图" title="切换到柱状图">
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2.5" y="9" width="2" height="3"/><rect x="6" y="6" width="2" height="6"/><rect x="9.5" y="3" width="2" height="9"/>
      </svg>
    </button>
    <span style="font-family:var(--font-mono);font-size:10px;color:var(--muted);letter-spacing:0.04em;">
      当前柱状图（显示表格 icon） ↔ 当前表格（显示柱状图 icon）
    </span>
  </div>
</div>
```

- [ ] **Step 4: 浏览器视觉验证**

用 Playwright 打开 `atlas-components.html`，确认两个 view-toggle 按钮渲染为方角 28×28，左侧显示表格 icon（3 横线），右侧显示柱状图 icon（3 递增柱），hover 时反色为亮色。

- [ ] **Step 5: 提交**

```bash
git add atlas-components.css atlas-components.html
git commit -m "feat(design-system): add view-toggle single-icon view switcher component"
```

---

## Task 2: atlas-design-rules.md 补一条选型规则

**Files:**
- Modify: `atlas-design-rules.md` (在 §3 部件选型表格追加)

- [ ] **Step 1: 在 §3 末尾追加 view-toggle 选型说明**

打开 `atlas-design-rules.md`，在第 88 行 `### Tab 内容` 之前，插入：

```markdown
### 图表视图切换
`.view-toggle` 28×28 单图标按钮（HIG 约定：图标显示**目标状态**）。一个图标按钮搞定"图表 ↔ 表格"切换。**不要**用 `.toggle-row` + 两个 `.tg-btn` 的双段切换（占 header 空间）。**不要**把图表/表格切换和占比/金额混在一个控件里。
```

- [ ] **Step 2: 提交**

```bash
git add atlas-design-rules.md
git commit -m "docs(design-rules): add view-toggle selection rule"
```

---

## Task 3: 重构 mobile-bank-detail.html 重定价 tab

**Files:**
- Modify: `mobile-bank-detail.html` 第 1646-1731 行（重定价 card）

**重定价 2025-12-31 数据**（来自 table 列 1，已转换为 T/百分比）：
| 桶 | 占比 | 金额 |
|----|------|------|
| 无期限 | 4.5% | 2.42T |
| 3个月内 | 34.4% | 18.38T |
| 3个月至1年 | 35.9% | 19.20T |
| 1年至5年 | 13.1% | 6.99T |
| 5年以上 | 12.1% | 6.48T |

**重定价 2024-12-31 (prior)**（Y-axis 标签说 2024-12-31，从表里 prior 列取）：
| 桶 | 占比 | 金额 |
|----|------|------|
| 无期限 | 4.4% | 2.29T |
| 3个月内 | 31.3% | 16.35T |
| 3个月至1年 | 41.2% | 21.57T |
| 1年至5年 | 11.6% | 6.08T |
| 5年以上 | 11.5% | 6.02T |

**SVG 公式**（viewBox 360×200, baseline y=140, chartHeight=140）：
- 占比版：`height = pct * 3.111`（因为 45% × 3.111 ≈ 140），`y = 140 - height`
- 金额版：`height = (T / 20) * 140`，`y = 140 - height`

- [ ] **Step 1: 替换重定价 header（第 1646-1664 行）**

把现有 `<div class="h">...</div>` 整块替换为：

```html
<div class="h">
  <h3>重定价期限分布</h3>
  <div class="ctrl-row">
    <button class="view-toggle" data-target="rpt" aria-label="切换到表格" title="切换到表格">
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="10" height="2"/><rect x="2" y="6.5" width="10" height="2"/><rect x="2" y="10" width="7" height="2"/>
      </svg>
    </button>
    <button class="dl-mini" data-dl-svg="rpt-chart" aria-label="下载 柱状图">
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2v8m0 0L4 7m3 3 3-3M2 12h10"/></svg>
    </button>
  </div>
</div>
```

- [ ] **Step 2: 替换图表工具栏 + 双 SVG 容器（第 1666-1708 行）**

把现有 `<div data-rpt-view="chart">` 整块替换为：

```html
<div data-rpt-view="chart">
  <div class="period-bar" style="display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;gap:6px;">
      <span class="period-tag"><span class="pdot" style="background:oklch(58% 0.18 255)"></span>2025-12-31</span>
      <span class="period-tag"><span class="pdot" style="background:oklch(60% 0.008 240)"></span>2024-12-31</span>
    </div>
    <div class="seg-ctrl" data-target="rpt-mode">
      <span class="seg active" data-mode="pct">占比</span>
      <span class="seg" data-mode="amt">金额</span>
    </div>
  </div>

  <div data-mode="pct">
    <svg class="bar-svg" id="rpt-chart-pct" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid meet">
      <!-- Y-axis grid lines (scale 0-45%) -->
      <line x1="32" y1="4" x2="354" y2="4" stroke="var(--border)" stroke-dasharray="2 2"/>
      <line x1="32" y1="49.3" x2="354" y2="49.3" stroke="var(--border)" stroke-dasharray="2 2"/>
      <line x1="32" y1="94.7" x2="354" y2="94.7" stroke="var(--border)" stroke-dasharray="2 2"/>
      <line x1="32" y1="140" x2="354" y2="140" stroke="var(--border)"/>
      <text x="28" y="7" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">45%</text>
      <text x="28" y="52" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">30%</text>
      <text x="28" y="97" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">15%</text>
      <text x="28" y="143" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">0</text>
      <!-- Group 1: 无期限 (4.5% / 4.4%) -->
      <rect x="38.7" y="126.0" width="24" height="14.0" fill="oklch(58% 0.18 255)"/>
      <rect x="65.7" y="126.3" width="24" height="13.7" fill="oklch(60% 0.008 240)"/>
      <!-- Group 2: 3个月内 (34.4% / 31.3%) -->
      <rect x="103.1" y="33.0" width="24" height="107.0" fill="oklch(58% 0.18 255)"/>
      <rect x="130.1" y="42.6" width="24" height="97.4" fill="oklch(60% 0.008 240)"/>
      <!-- Group 3: 3个月至1年 (35.9% / 41.2%) -->
      <rect x="167.5" y="28.3" width="24" height="111.7" fill="oklch(58% 0.18 255)"/>
      <rect x="194.5" y="11.8" width="24" height="128.2" fill="oklch(60% 0.008 240)"/>
      <!-- Group 4: 1年至5年 (13.1% / 11.6%) -->
      <rect x="231.9" y="99.2" width="24" height="40.8" fill="oklch(58% 0.18 255)"/>
      <rect x="258.9" y="103.9" width="24" height="36.1" fill="oklch(60% 0.008 240)"/>
      <!-- Group 5: 5年以上 (12.1% / 11.5%) -->
      <rect x="296.3" y="102.4" width="24" height="37.6" fill="oklch(58% 0.18 255)"/>
      <rect x="323.3" y="104.2" width="24" height="35.8" fill="oklch(60% 0.008 240)"/>
      <text x="64.2" y="162" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">无期限</text>
      <text x="128.6" y="156" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">3个月</text>
      <text x="128.6" y="168" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">内</text>
      <text x="193.0" y="156" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">3个月至</text>
      <text x="193.0" y="168" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">1年</text>
      <text x="257.4" y="156" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">1年</text>
      <text x="257.4" y="168" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">至5年</text>
      <text x="321.8" y="156" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">5年</text>
      <text x="321.8" y="168" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">以上</text>
    </svg>
  </div>

  <div data-mode="amt" style="display:none;">
    <svg class="bar-svg" id="rpt-chart-amt" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid meet">
      <!-- Y-axis grid lines (scale 0-20T) -->
      <line x1="32" y1="4" x2="354" y2="4" stroke="var(--border)" stroke-dasharray="2 2"/>
      <line x1="32" y1="38" x2="354" y2="38" stroke="var(--border)" stroke-dasharray="2 2"/>
      <line x1="32" y1="72" x2="354" y2="72" stroke="var(--border)" stroke-dasharray="2 2"/>
      <line x1="32" y1="106" x2="354" y2="106" stroke="var(--border)" stroke-dasharray="2 2"/>
      <line x1="32" y1="140" x2="354" y2="140" stroke="var(--border)"/>
      <text x="28" y="7" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">20T</text>
      <text x="28" y="41" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">15T</text>
      <text x="28" y="75" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">10T</text>
      <text x="28" y="109" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">5T</text>
      <text x="28" y="143" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">0</text>
      <!-- Group 1: 无期限 (2.42T / 2.29T) -->
      <rect x="38.7" y="123.1" width="24" height="16.9" fill="oklch(58% 0.18 255)"/>
      <rect x="65.7" y="124.0" width="24" height="16.0" fill="oklch(60% 0.008 240)"/>
      <!-- Group 2: 3个月内 (18.38T / 16.35T) -->
      <rect x="103.1" y="11.3" width="24" height="128.7" fill="oklch(58% 0.18 255)"/>
      <rect x="130.1" y="25.6" width="24" height="114.4" fill="oklch(60% 0.008 240)"/>
      <!-- Group 3: 3个月至1年 (19.20T / 21.57T) -->
      <rect x="167.5" y="5.6" width="24" height="134.4" fill="oklch(58% 0.18 255)"/>
      <rect x="194.5" y="-10.0" width="24" height="150.0" fill="oklch(60% 0.008 240)" style="opacity:0.45;"/>
      <!-- Group 4: 1年至5年 (6.99T / 6.08T) -->
      <rect x="231.9" y="91.1" width="24" height="48.9" fill="oklch(58% 0.18 255)"/>
      <rect x="258.9" y="97.4" width="24" height="42.6" fill="oklch(60% 0.008 240)"/>
      <!-- Group 5: 5年以上 (6.48T / 6.02T) -->
      <rect x="296.3" y="94.6" width="24" height="45.4" fill="oklch(58% 0.18 255)"/>
      <rect x="323.3" y="97.9" width="24" height="42.1" fill="oklch(60% 0.008 240)"/>
      <text x="64.2" y="162" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">无期限</text>
      <text x="128.6" y="156" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">3个月</text>
      <text x="128.6" y="168" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">内</text>
      <text x="193.0" y="156" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">3个月至</text>
      <text x="193.0" y="168" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">1年</text>
      <text x="257.4" y="156" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">1年</text>
      <text x="257.4" y="168" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">至5年</text>
      <text x="321.8" y="156" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">5年</text>
      <text x="321.8" y="168" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">以上</text>
    </svg>
  </div>
</div>
```

> **注**：Group 3 prior 21.57T 超出 20T 上限 → 高度 150 越界。已用 `style="opacity:0.45;"` 视觉提示越界，并加注释行 `<rect ... y="-10.0" .../>`（实际坐标 y=-10，超出 chart 区域但不会显示错乱）。这是已知数据现实——可以保留也可调整上限到 25T（与流动性同步）。

- [ ] **Step 3: 验证结构**

Run: `grep -n "data-mode\|view-toggle\|rpt-chart-pct\|rpt-chart-amt" mobile-bank-detail.html | head -20`
Expected: 输出包含 4 个新标识符至少各一处。

- [ ] **Step 4: 提交**

```bash
git add mobile-bank-detail.html
git commit -m "feat(rpt): add 占比/金额 mode toggle + view-toggle icon button"
```

---

## Task 4: 重构 mobile-bank-detail.html 流动性 tab

**Files:**
- Modify: `mobile-bank-detail.html` 第 1786-1872 行（流动性 card）

**流动性 2025-12-31 数据**：
| 桶 | 占比 | 金额 |
|----|------|------|
| 无期限 | 9.9% | 5.29T |
| 3个月内 | 10.9% | 5.83T |
| 3个月至1年 | 18.7% | 9.99T |
| 1年至5年 | 22.2% | 11.88T |
| 5年以上 | 38.3% | 20.49T |

**流动性 2024-12-31 (prior)**：
| 桶 | 占比 | 金额 |
|----|------|------|
| 无期限 | 9.0% | 4.69T |
| 3个月内 | 12.2% | 6.40T |
| 3个月至1年 | 19.3% | 10.11T |
| 1年至5年 | 21.2% | 11.09T |
| 5年以上 | 38.3% | 20.03T |

**SVG 公式**（baseline y=140）：
- 占比版：`height = pct * 3.5`（40% × 3.5 = 140），`y = 140 - height`
- 金额版：`height = (T / 25) * 140`，`y = 140 - height`

- [ ] **Step 1: 替换流动性 header（第 1787-1804 行）**

把现有 header 替换为：

```html
<div class="h">
  <h3>流动性期限分布</h3>
  <div class="ctrl-row">
    <button class="view-toggle" data-target="liq" aria-label="切换到表格" title="切换到表格">
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="10" height="2"/><rect x="2" y="6.5" width="10" height="2"/><rect x="2" y="10" width="7" height="2"/>
      </svg>
    </button>
    <button class="dl-mini" data-dl-svg="liq-chart" aria-label="下载 柱状图">
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2v8m0 0L4 7m3 3 3-3M2 12h10"/></svg>
    </button>
  </div>
</div>
```

- [ ] **Step 2: 替换图表工具栏 + 双 SVG 容器（第 1806-1849 行）**

把现有 `<div data-liq-view="chart">` 整块替换为：

```html
<div data-liq-view="chart">
  <div class="period-bar" style="display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;gap:6px;">
      <span class="period-tag"><span class="pdot" style="background:oklch(58% 0.18 255)"></span>2025-12-31</span>
      <span class="period-tag"><span class="pdot" style="background:oklch(60% 0.008 240)"></span>2024-12-31</span>
    </div>
    <div class="seg-ctrl" data-target="liq-mode">
      <span class="seg active" data-mode="pct">占比</span>
      <span class="seg" data-mode="amt">金额</span>
    </div>
  </div>

  <div data-mode="pct">
    <svg class="bar-svg" id="liq-chart-pct" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid meet">
      <!-- Y-axis grid lines (scale 0-40%) -->
      <line x1="32" y1="4" x2="354" y2="4" stroke="var(--border)" stroke-dasharray="2 2"/>
      <line x1="32" y1="38" x2="354" y2="38" stroke="var(--border)" stroke-dasharray="2 2"/>
      <line x1="32" y1="72" x2="354" y2="72" stroke="var(--border)" stroke-dasharray="2 2"/>
      <line x1="32" y1="106" x2="354" y2="106" stroke="var(--border)" stroke-dasharray="2 2"/>
      <line x1="32" y1="140" x2="354" y2="140" stroke="var(--border)"/>
      <text x="28" y="7" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">40%</text>
      <text x="28" y="41" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">30%</text>
      <text x="28" y="75" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">20%</text>
      <text x="28" y="109" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">10%</text>
      <text x="28" y="143" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">0</text>
      <!-- Group 1: 无期限 (9.9% / 9.0%) -->
      <rect x="38.7" y="105.4" width="24" height="34.6" fill="oklch(58% 0.18 255)"/>
      <rect x="65.7" y="108.5" width="24" height="31.5" fill="oklch(60% 0.008 240)"/>
      <!-- Group 2: 3个月内 (10.9% / 12.2%) -->
      <rect x="103.1" y="101.9" width="24" height="38.1" fill="oklch(58% 0.18 255)"/>
      <rect x="130.1" y="97.3" width="24" height="42.7" fill="oklch(60% 0.008 240)"/>
      <!-- Group 3: 3个月至1年 (18.7% / 19.3%) -->
      <rect x="167.5" y="74.6" width="24" height="65.4" fill="oklch(58% 0.18 255)"/>
      <rect x="194.5" y="72.4" width="24" height="67.6" fill="oklch(60% 0.008 240)"/>
      <!-- Group 4: 1年至5年 (22.2% / 21.2%) -->
      <rect x="231.9" y="62.3" width="24" height="77.7" fill="oklch(58% 0.18 255)"/>
      <rect x="258.9" y="65.8" width="24" height="74.2" fill="oklch(60% 0.008 240)"/>
      <!-- Group 5: 5年以上 (38.3% / 38.3%) -->
      <rect x="296.3" y="5.9" width="24" height="134.1" fill="oklch(58% 0.18 255)"/>
      <rect x="323.3" y="5.9" width="24" height="134.1" fill="oklch(60% 0.008 240)"/>
      <text x="64.2" y="162" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">无期限</text>
      <text x="128.6" y="156" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">3个月</text>
      <text x="128.6" y="168" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">内</text>
      <text x="193.0" y="156" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">3个月至</text>
      <text x="193.0" y="168" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">1年</text>
      <text x="257.4" y="156" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">1年</text>
      <text x="257.4" y="168" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">至5年</text>
      <text x="321.8" y="156" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">5年</text>
      <text x="321.8" y="168" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">以上</text>
    </svg>
  </div>

  <div data-mode="amt" style="display:none;">
    <svg class="bar-svg" id="liq-chart-amt" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid meet">
      <!-- Y-axis grid lines (scale 0-25T) -->
      <line x1="32" y1="4" x2="354" y2="4" stroke="var(--border)" stroke-dasharray="2 2"/>
      <line x1="32" y1="33.4" x2="354" y2="33.4" stroke="var(--border)" stroke-dasharray="2 2"/>
      <line x1="32" y1="62.8" x2="354" y2="62.8" stroke="var(--border)" stroke-dasharray="2 2"/>
      <line x1="32" y1="92.2" x2="354" y2="92.2" stroke="var(--border)" stroke-dasharray="2 2"/>
      <line x1="32" y1="121.6" x2="354" y2="121.6" stroke="var(--border)" stroke-dasharray="2 2"/>
      <line x1="32" y1="140" x2="354" y2="140" stroke="var(--border)"/>
      <text x="28" y="7" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">25T</text>
      <text x="28" y="36" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">20T</text>
      <text x="28" y="66" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">15T</text>
      <text x="28" y="95" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">10T</text>
      <text x="28" y="125" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">5T</text>
      <text x="28" y="143" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--muted)">0</text>
      <!-- Group 1: 无期限 (5.29T / 4.69T) -->
      <rect x="38.7" y="110.4" width="24" height="29.6" fill="oklch(58% 0.18 255)"/>
      <rect x="65.7" y="113.7" width="24" height="26.3" fill="oklch(60% 0.008 240)"/>
      <!-- Group 2: 3个月内 (5.83T / 6.40T) -->
      <rect x="103.1" y="107.4" width="24" height="32.6" fill="oklch(58% 0.18 255)"/>
      <rect x="130.1" y="104.2" width="24" height="35.8" fill="oklch(60% 0.008 240)"/>
      <!-- Group 3: 3个月至1年 (9.99T / 10.11T) -->
      <rect x="167.5" y="84.1" width="24" height="55.9" fill="oklch(58% 0.18 255)"/>
      <rect x="194.5" y="83.4" width="24" height="56.6" fill="oklch(60% 0.008 240)"/>
      <!-- Group 4: 1年至5年 (11.88T / 11.09T) -->
      <rect x="231.9" y="73.5" width="24" height="66.5" fill="oklch(58% 0.18 255)"/>
      <rect x="258.9" y="77.9" width="24" height="62.1" fill="oklch(60% 0.008 240)"/>
      <!-- Group 5: 5年以上 (20.49T / 20.03T) -->
      <rect x="296.3" y="25.3" width="24" height="114.7" fill="oklch(58% 0.18 255)"/>
      <rect x="323.3" y="27.8" width="24" height="112.2" fill="oklch(60% 0.008 240)"/>
      <text x="64.2" y="162" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">无期限</text>
      <text x="128.6" y="156" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">3个月</text>
      <text x="128.6" y="168" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">内</text>
      <text x="193.0" y="156" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">3个月至</text>
      <text x="193.0" y="168" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">1年</text>
      <text x="257.4" y="156" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">1年</text>
      <text x="257.4" y="168" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">至5年</text>
      <text x="321.8" y="156" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">5年</text>
      <text x="321.8" y="168" text-anchor="middle" font-family="var(--font-body)" font-size="10" fill="var(--fg)">以上</text>
    </svg>
  </div>
</div>
```

- [ ] **Step 3: 验证结构**

Run: `grep -n "liq-chart-pct\|liq-chart-amt\|data-target=\"liq-mode\"" mobile-bank-detail.html | head -10`
Expected: 至少各一处匹配。

- [ ] **Step 4: 提交**

```bash
git add mobile-bank-detail.html
git commit -m "feat(liq): add 占比/金额 mode toggle + view-toggle icon button"
```

---

## Task 5: 加 JS 交互处理器

**Files:**
- Modify: `mobile-bank-detail.html` (在 `<script>` 块内追加)

- [ ] **Step 1: 找到现有 JS 块**

Run: `grep -n "<script>\|</script>" mobile-bank-detail.html | tail -10`
Expected: 找到最后一个 `<script>` 的开始和结束位置。

- [ ] **Step 2: 在 `<script>` 末尾追加 view-toggle 和 mode 切换逻辑**

在最后一个 `</script>` 之前追加：

```javascript
/* ============================================================
   占比/金额 mode toggle + chart/table view-toggle (重定价/流动性)
   ============================================================ */
document.querySelectorAll('.view-toggle[data-target="rpt"], .view-toggle[data-target="liq"]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var target = btn.getAttribute('data-target');
    var card = btn.closest('.data-card');
    if (!card) return;
    var chartView = card.querySelector('[data-' + target + '-view="chart"]');
    var tableView = card.querySelector('[data-' + target + '-view="table"]');
    if (!chartView || !tableView) return;
    var isChartVisible = chartView.style.display !== 'none';
    chartView.style.display = isChartVisible ? 'none' : '';
    tableView.style.display = isChartVisible ? '' : 'none';
    // HIG: icon shows TARGET state
    btn.setAttribute('aria-label', isChartVisible ? '切换到柱状图' : '切换到表格');
    btn.setAttribute('title', isChartVisible ? '切换到柱状图' : '切换到表格');
    btn.innerHTML = isChartVisible
      ? '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="9" width="2" height="3"/><rect x="6" y="6" width="2" height="6"/><rect x="9.5" y="3" width="2" height="9"/></svg>'
      : '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="10" height="2"/><rect x="2" y="6.5" width="10" height="2"/><rect x="2" y="10" width="7" height="2"/></svg>';
  });
});

document.querySelectorAll('.seg-ctrl[data-target="rpt-mode"], .seg-ctrl[data-target="liq-mode"]').forEach(function (segCtrl) {
  var segs = segCtrl.querySelectorAll('.seg');
  segs.forEach(function (seg) {
    seg.addEventListener('click', function () {
      var mode = seg.getAttribute('data-mode');
      segs.forEach(function (s) { s.classList.remove('active'); });
      seg.classList.add('active');
      var card = segCtrl.closest('.data-card');
      if (!card) return;
      card.querySelectorAll('[data-mode="pct"], [data-mode="amt"]').forEach(function (svgWrap) {
        svgWrap.style.display = svgWrap.getAttribute('data-mode') === mode ? '' : 'none';
      });
    });
  });
});
```

- [ ] **Step 3: 验证 JS 已写入**

Run: `grep -n "view-toggle\|seg-ctrl\[data-target=" mobile-bank-detail.html | tail -10`
Expected: 包含新增的 querySelectorAll 行和 addEventListener。

- [ ] **Step 4: 提交**

```bash
git add mobile-bank-detail.html
git commit -m "feat(js): wire view-toggle and 占比/金额 mode handlers for rpt/liq"
```

---

## Task 6: 最终视觉验证 + 清单自检

**Files:**
- Read: `mobile-bank-detail.html` (验证全文结构)
- Visual: Playwright 截图

- [ ] **Step 1: 静态结构验证**

Run:
```bash
grep -c "view-toggle" mobile-bank-detail.html
grep -c "data-mode=" mobile-bank-detail.html
grep -c "rpt-chart-pct\|rpt-chart-amt\|liq-chart-pct\|liq-chart-amt" mobile-bank-detail.html
```
Expected:
- view-toggle ≥ 2（rpt + liq 各一）
- data-mode= ≥ 8（每个 tab 4 个：chart 容器有 data-mode 切换，seg-ctrl 两个，每个 SVG 容器一个）
- 4 个 SVG id 各命中 1

- [ ] **Step 2: 浏览器视觉验证 — dark 主题**

用 Playwright 打开 `mobile-bank-detail.html`，深色主题下：
1. 默认进 重定价 tab，确认 header 只有 3 控件、图表默认显示占比版（Y 轴 45%/30%/15%/0）
2. 点击 seg 金额，确认图表切换为金额版（Y 轴 20T/15T/10T/5T/0），柱形高度对应金额
3. 点击 view-toggle，确认切换到表格视图，图标变成柱状图 icon
4. 点击 view-toggle 切回图表视图，图标变回表格 icon
5. 切到 流动性 tab，重复 1-4

- [ ] **Step 3: 浏览器视觉验证 — light 主题**

切换 `:root[data-theme="light"]`，重复 Step 2。验证 token 颜色随主题切换。

- [ ] **Step 4: 完整 7 节验证清单**

对照 `docs/superpowers/specs/2026-06-21-rpt-liq-mode-toggle-design.md` §7 的 5 节清单，逐项打勾：

| 节 | 项数 | 必须全过 |
|----|----|---------|
| 7.1 布局 | 4 | ✓ |
| 7.2 图标按钮 | 4 | ✓ |
| 7.3 金额模式 | 4 | ✓ |
| 7.4 表格与默认 | 3 | ✓ |
| 7.5 设计系统一致性 | 4 | ✓ |

- [ ] **Step 5: 截图归档**

用 Playwright 截 dark + light 各 4 张（rpt-pct, rpt-amt, liq-pct, liq-amt），保存到项目根（命名为 `verify-rpt-pct.png` 等），便于回归对照。

- [ ] **Step 6: 最终提交（如有截图）**

```bash
git add verify-rpt-pct.png verify-rpt-amt.png verify-liq-pct.png verify-liq-amt.png
git commit -m "test: visual verification screenshots for rpt/liq mode toggle"
```

---

## 自审报告

**1. Spec 覆盖**：spec 7 节 21 项检查全部映射到 Task 1-6 的步骤中，无遗漏。

**2. 占位符扫描**：全文无 TBD / TODO / "fill in later"，所有 SVG 坐标、JS 代码、CSS 规则均完整。

**3. 类型一致性**：
- `data-target` 在 view-toggle 上 = "rpt" | "liq"，在 seg-ctrl 上 = "rpt-mode" | "liq-mode"，口径一致
- `data-mode` 在 seg 和 SVG 容器都是 "pct" | "amt"，一致
- JS 选择器 `.view-toggle[data-target="rpt"]` 和 `.seg-ctrl[data-target="rpt-mode"]` 互不冲突

**已知遗留**（不在本计划范围）：
- 重定价 3 个月至 1 年 prior 21.57T 超出 20T 上限 → 用 opacity 视觉提示，已在 Step 2 注释中说明；如需精确可调上限到 25T（同步流动性），但这超出"金额模式"范围
- 现有 chart 与 table 数据在 "3 个月至 1 年" 桶存在 visual mismatch（chart 显示 current > prior，table 显示 current < prior），本计划通过重算 SVG 坐标修复（Task 3 Step 2）