# 银图 Atlas · 开发交接说明

> 给接手开发实现的 Claude Code
> 2026-06-19 · 项目根目录所有 `*.html` 即可开工

---

## 1. 一句话定位（**写任何文案前先读**）

**从 ALM 视角重新审视全球银行的多维度数据分析平台。**

- 不是金融数据搬运工，是**用 ALM 实务方法论重新拆银行报表**的研究工具
- 目标读者：所有用 ALM 视角研究银行的人（卖方分析师 / 买方信用 / 评级 / 监管 / 自媒体 / 学者）——**不是只给 ALM 实务从业者**
- ALM 视角是**方法论，不是身份**

## 2. 禁用清单（这些之前试过都被砍）

- ❌ "为研究员、自媒体、监管岗**而生**" → persona-listing，已废弃
- ❌ 直接点名 Wind / Bloomberg / 巨潮 等竞品
- ❌ "专注银行 / 垂直银行 / 唯一" 这类泛词
- ❌ "看 / 展示 / 提供" 这类中性动词，hero / H1 用「审视 / 洞察 / 剖析 / 拆解」
- ❌ 把 38 写成死数 —— 文案永远留"全部 X 项 →"扩展入口，**维度是开放上限**

**Hero 锁定版**：`从 ALM 视角重新审视全球银行的多维度数据分析平台。`

## 3. 设计系统（Trading Terminal）

> 整个产品（PC + 移动 + 营销页）**只用一个设计系统**。不要发明新主题。

### Tokens（直接 paste 到 `:root`）

```css
:root {
  --bg: #070b12;
  --surface: #101826;
  --surface-2: #162238;
  --surface-warm: #1a2740;
  --fg: #f8fafc;
  --fg-2: #cbd5e1;
  --muted: #8492a6;
  --soft: #475569;
  --border: #263246;
  --border-soft: #1c2638;
  --border-strong: #344056;
  --accent: #38bdf8;        /* cyan，唯一强调色 */
  --accent-soft: #0c2a3d;
  --accent-on: #03111a;     /* accent 按钮上的文字 */
  --success: #22c55e;       /* 仅状态用 */
  --success-soft: #082d1a;
  --danger: #ef4444;        /* 仅状态用 */
  --danger-soft: #3a0d0d;
  --warning: #f59e0b;
  --warning-soft: #2d1f08;
  --meta: #38bdf8;
  --up: #ef4444;            /* A-share 红涨 */
  --up-soft: #2a0a0a;
  --down: #22c55e;          /* A-share 绿跌 */
  --down-soft: #082d1a;
  --radius-sm: 4px;
  --radius-md: 4px;
  --radius-lg: 4px;
  --radius-pill: 9999px;
  --font-display: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', 'Helvetica Neue', Inter, system-ui, sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC', 'Helvetica Neue', Inter, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'IBM Plex Mono', 'Roboto Mono', ui-monospace, Menlo, 'SF Mono', monospace;
}
```

### 关键规则

- **A-share 红涨绿跌**：`var(--up)` 红、`var(--down)` 绿。`--success/--danger` 只用于状态，不是方向
- **所有圆角 ≤ 4px**（terminal 风格），pill 9999px 只给 chip / 标签
- **所有数字**用 `class="num"` 包起来 → `font-family: var(--font-mono); font-variant-numeric: tabular-nums;`
- 移动端字号 13-14px 主文，9-11px 给 mono 标签，36-44px 给大数字
- NIM 等多指标 header 头用 `.kv` 2 列网格（k/v/d 堆叠，标签不粗体大写，值粗体）
- 营销页（`about.html` / `index.html`）可在 trading terminal 基础上覆盖：`--container-max 1240px`、`--section-y 120px`、`--display-1 72px`，**但不要发明新色板**

## 4. 文件清单与状态

| 文件 | 用途 | 状态 |
|---|---|---|
| `mobile-home.html` | 移动端 App 首页 | 已完成（**缺"银行"模块，见 §7**） |
| `mobile-bank-detail.html` | 单家银行 6 tab 深度 | 已完成 |
| `mobile-banks.html` | 银行目录 | 已完成 |
| `mobile-regulators.html` | 监管机构目录 | 已完成 |
| `mobile-regulator-detail.html` | 单家监管详情 | 已完成 |
| `mobile-reports.html` | 报告列表 | 已完成 |
| `mobile-report-detail.html` | 报告详情 | 已完成 |
| `mobile-compare.html` | 同业对标 workbench | 已完成 |
| `mobile-subscription.html` | 订阅方案 | 已完成 |
| `mobile-my.html` | 工作台 | 已完成 |
| `index.html` | PC 端首页 | **待迁到 Trading Terminal**（见 §7） |
| `about.html` | PC 端关于页（营销） | 已完成 |

## 5. 移动端首页结构（mobile-home.html）

```
状态栏 (9:41 + 信号/wifi/电池)
  └─ greeting nav: "下午好 · 陈研究员" + 通知/账户图标按钮
  └─ search: "搜索银行、监管机构、报告" + ⌘K
  └─ stats strip: 1,240+ 家银行 / 38 数据专题 / 320+ 指标项
  └─ what's new: 本周新增 (数据/工具/报告 三类目)
  └─ [数据 / Data]      ← 8 维宫格 (资负结构/资负价格/流动性/重定价/资产质量/资本专题/利润专题/监管专题)
  └─ [工具 / Tools]     ← 同业对标 + 归因分析(即将)
  └─ [报告 / Reports]   ← 编辑精选 + 最新/最热/付费最多 3 tab
底部 tab bar: 首页 / 银行 / 报告 / 我的 (4 tab, .tab.active = --accent)
```

iPhone frame: 393×852，外框 `border-radius: 50px`，padding 12，状态栏 54px 高。

## 6. 全站跳转表

| 当前位置 | 链接目标 |
|---|---|
| 底部 tab 1 首页 | `mobile-home.html` |
| 底部 tab 2 银行 | `mobile-banks.html` |
| 底部 tab 3 报告 | `mobile-reports.html` |
| 底部 tab 4 我的 | `mobile-my.html` |
| 同业对标 tool-item | `mobile-compare.html` |
| 报告 list item | `mobile-report-detail.html` |
| PC 首页 → 关于页 | `about.html` |
| 关于页 → 移动端订阅 | `mobile-subscription.html` |
| PC 首页 → 移动端单家银行 | `mobile-bank-detail.html`（10 张 mock 卡之一） |

## 7. 待办（接手前已知 pending）

### 高优

- **mobile-home.html 缺 `银行 / Banks` 模块**（与 数据/工具/报告 并列）
  - 位置：数据宫格之后、工具之前（或首屏数据条之后立即插入）
  - 内容：自选银行 4 张卡（银行名 + NIM + CET1 + sparkline）+ 本周热门 3 条
  - 设计：与数据宫格同节奏（深色卡 + cyan accent）
  - 跳转：卡 → `mobile-bank-detail.html`

### 中优

- **`index.html` 整体迁移到 Trading Terminal**
  - 当前是 light modern-minimal + rounded-14px，与产品其它页风格割裂
  - 迁移时同时把 hero 改用锁定版（"从 ALM 视角重新审视..."），10 张 mobile mock 卡保留
  - 保留 4-列 grid，结构 OK，只是 design tokens 换掉

### 低优

- 多主题支持：5 套（默认 / Bloomberg / FactSet / Wind-style + 1 套 light 备选）
  - 通过覆盖 `:root` token 实现，不要改 component class

## 8. 商务/业务常量

- 银行数：**1,240+ 上市行**
- 监管辖区：**11**（中国 NFRA / 香港 HKMA / 美联储 / ECB / BoE / BoJ / MAS + 4 BCBS 等）
- 数据维度：**38+ 项**（开放上限，文案留 "全部 X 项 →"）
- 指标项：**320+**
- 报告：**86 篇**（**12 专题领域**）
- 订阅三档：
  - 免费版 ¥0 永久
  - 专业版 ¥1,999 / 年 · 1 席位
  - 机构版 ¥3,999 / 席位 / 年 · 5 席起
  - 团队阶梯：10 席 9.5 折 / 20 席 9 折 / 30 席 8.5 折 / 50+ 议价
  - 报告 micro-payment：¥58 / ¥68 / ¥198
- 联系：hi@atlas.example / 微信 atlas-yinrong / 沪ICP备 2026-XXXX 号

## 9. 域术语（自由使用，无需解释）

NIM / CET1 / LCR / NSFR / G-SIB / D-SIB / TLAC / NII 敏感性 / FTP / 期限重定价 / 流动性转换 / 借短贷长 / 错配风险 / 收付息率 / 资本充足 / RWA / 准备金率 / 不良率 / 拨备覆盖率 / 杠杆率 / 风险加权

## 10. 不要碰

- 任何 `*.png` 截图（含 `about-v1.png` / `verify-*.png` / `liq-*.png` / `cap-*.png` / `nim-*.png`）—— 喂给 Claude API 会触发服务端敏感审核 500
- 已废弃文案：persona-listing hero（"为 XX 岗而生"）、点名竞品
