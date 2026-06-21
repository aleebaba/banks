# Migration Checklist: Inline tokens/components → `<link>` consumption

For each Atlas HTML page migrating from inline `:root` tokens + inline component CSS to `<link href="atlas-tokens.css">` + `<link href="atlas-components.css">` consumption.

## When to use

Step C of the 4-step plan (see memory: `project_atlas_full_site_component_re_extraction.md`). After Step B has produced the canonical `atlas-tokens.css` and `atlas-components.css` for the 12 pages.

## Pre-migration

- [ ] Confirm page is "stable" — no in-flight edits (check `git status`, ask user)
- [ ] Run `node atlas-tools/class-audit.js` — record baseline numbers
- [ ] Take "before" screenshot at viewport 414×896 (iPhone 12 width)
  - Save to `assets/YYYY-MM-DD-<page-name>-before.png`
- [ ] Note current `:root` block size (line range in file) for verification

## Migration steps (per page)

1. **Open the page in editor** (e.g., `mobile-banks.html`)

2. **Locate the `<style>...</style>` block** (always near the top of `<head>`)

3. **ADD** these 2 lines BEFORE the `<style>` block:
   ```html
   <link rel="stylesheet" href="atlas-tokens.css" />
   <link rel="stylesheet" href="atlas-components.css" />
   ```

4. **DELETE** the `:root { ... }` block inside `<style>` (the token definitions, e.g., `--bg:`, `--surface:`, `--up:`)
   - Keep all other CSS in `<style>` (page-local layout, page-specific components)

5. **DELETE** any token/utility classes now provided by `atlas-components.css`
   - Examples to remove from page `<style>`: `.num`, `.data-card`, `.kv`, `.strip`, `.yoy`, `.delta-tag`, `.toggle-row`, `.tg-btn`, `.period-bar`, `.period-tabs`, `.pt-btn`, `.seg-ctrl`, `.dl-mini`, `.view-toggle`, `.ic-btn`, `.evo-section`, `.evo-head`, `.evo-title`, `.legend`, `.lg-item`, `.lg-swatch`, `.tbl`, `.tabs`, `.tab`, `.tab-panel`, `.ai-card`, `.ai-verdict`, `.chart`, `.bar-svg`, `.chart-axis`, `.chart-legend`, `.legend-dot`, `.legend-line`
   - Use `node atlas-tools/class-audit.js` to see which classes this page uses that are now in `atlas-components.css`

6. **Save** the file

## Post-migration verification

- [ ] Open page in browser at `file:///<path>/<page>.html` (no server needed for static HTML)
- [ ] Compare to "before" screenshot — should be **pixel-identical**
- [ ] Check both dark and light themes if supported (toggle via localStorage `[data-theme="light"]` on `:root`)
- [ ] If any visual difference: STOP, do not commit. Diagnose (see "Common issues" below)
- [ ] Take "after" screenshot to `assets/YYYY-MM-DD-<page-name>-after.png`
- [ ] Re-run `node atlas-tools/class-audit.js` — the per-page "missing" count for this page should drop
- [ ] Git commit with message:
  ```
  refactor(<page>): migrate to atlas-tokens.css + atlas-components.css <link>

  - Add <link> for shared tokens + components
  - Remove inline :root block (N tokens)
  - Remove M duplicated component classes now in components.css
  - Visual: 0 diff (before/after screenshots identical)
  ```

## Common issues

### 视觉变化 / 颜色字体边框不一致

You have a **token drift** between the page and `atlas-tokens.css`. Compare the deleted `:root` block to the canonical file:

| Page says | atlas-tokens.css says | Action |
|-----------|----------------------|--------|
| `--accent-on: #03111a` | `--accent-fg: #03111a` | Update page to use canonical name `--accent-fg` |
| `--warn: #f59e0b` | `--warning: #f59e0b` | Update page to use canonical name `--warning` |
| `--surface-warm: #1a2438` | `--surface-warm: #1a2740` | Update page to use canonical value (canonical wins) |
| Token missing from canonical | Token missing from page | Add to `atlas-tokens.css` (page is source of truth) |

### 组件样式没生效 (e.g., `.data-card` looks unstyled)

- Check `<link>` is BEFORE the page's `<style>` (CSS cascade order matters)
- Check page `<style>` doesn't redefine the class — `grep "\.data-card {" <page>.html` should return 0 matches
- Hard refresh browser: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)

### 部分 token 没生效

- Token name typo — verify spelling matches `atlas-tokens.css`
- Token not defined in canonical — add it (page is the source of truth here)
- Cascade issue — page defines `--my-token: ...` but doesn't USE it; replace any hardcoded value with `var(--my-token)`

## Batch execution

For 11 pages (after bank-detail trial):

```
Batch 1: mobile-banks.html, mobile-compare.html, mobile-home.html
Batch 2: mobile-reports.html, mobile-report-detail.html, mobile-regulator-detail.html
Batch 3: mobile-regulators.html, mobile-my.html, mobile-subscription.html
```

Each batch = 1 git commit. Between batches, run `node atlas-tools/class-audit.js` to verify numbers improved.

## Final verification (after all 12 pages migrated)

```bash
# Should return 0 matches (no inline :root blocks left in any page)
grep -l ":root {" mobile-*.html index.html about.html

# Should return 12 matches (every page now has both <link> tags)
grep -l 'href="atlas-tokens.css"' mobile-*.html index.html about.html | wc -l
grep -l 'href="atlas-components.css"' mobile-*.html index.html about.html | wc -l

# Re-run class-audit.js — components.css coverage should be high
node atlas-tools/class-audit.js
```

Pass criteria:
- [ ] `grep ":root {"` returns 0 files
- [ ] `grep 'href="atlas-...css"'` returns 12 files each
- [ ] class-audit.js shows components.css has ≥ 90% coverage (used in active pages)
- [ ] DEAD section is small (≤ 5 classes — accept some buffer for future use)
- [ ] All visual diffs = 0
