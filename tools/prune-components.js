// tools/prune-components.js
// Prune components.css to true site-wide coverage:
//   - Remove standalone rules for page-local classes (they're used in only 1 page)
//   - Remove DEAD classes (.css, .delta-neutral) — already absent or in noise
//   - KEEP all sub-rules (they style SHARED descendants)
//
// Also report what was removed so we can sanity-check.

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const audit = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'audit-current.json'), 'utf8'));
const pageLocalInComp = new Set(audit.pageLocal.filter(p => p.inComp).map(p => p.cls));
const dead = new Set(audit.dead.map(p => p.cls));

const css = fs.readFileSync(path.join(PROJECT_DIR, 'assets/css/components.css'), 'utf8');

// Parse CSS into rules, preserving order and any whitespace/comments.
// A rule is: <selector> { <body with possibly nested braces> }
// We track brace depth from the FIRST '{'.
function parseRules(text) {
  const rules = [];
  let i = 0;
  while (i < text.length) {
    const start = i;
    let depth = 0;
    let bodyStart = -1;
    let inStr = null;
    for (; i < text.length; i++) {
      const c = text[i];
      if (inStr) {
        if (c === inStr && text[i - 1] !== '\\') inStr = null;
        continue;
      }
      if (c === '"' || c === "'") { inStr = c; continue; }
      if (c === '{') { depth++; if (depth === 1 && bodyStart === -1) bodyStart = i; continue; }
      if (c === '}') { depth--; if (depth === 0) { i++; break; } }
    }
    rules.push(text.slice(start, i));
  }
  return rules;
}

// Strip /* ... */ comments but keep newlines for line tracking
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

const cleanCss = stripComments(css);
const blocks = parseRules(cleanCss);

const kept = [];
const removed = [];
for (const block of blocks) {
  const m = block.match(/^([\s\S]*?)\{/);
  if (!m) {
    kept.push(block);
    continue;
  }
  const selector = m[1].trim();
  if (!selector) {
    kept.push(block);
    continue;
  }
  const cm = selector.match(/^\s*\.(-?[a-zA-Z_][a-zA-Z0-9_-]*)/);
  if (!cm) {
    kept.push(block);
    continue;
  }
  const primary = cm[1];
  // Standalone means: just .cls or .cls:pseudo-class (no descendant, no compound, no pseudo-element)
  const isStandalone = /^\.(-?[a-zA-Z_][a-zA-Z0-9_-]*)(:[a-z-]+)?$/.test(selector);
  if ((pageLocalInComp.has(primary) || dead.has(primary)) && isStandalone) {
    removed.push({ selector, primary });
  } else {
    kept.push(block);
  }
}

if (process.argv.includes('--dry-run')) {
  console.log(`Kept: ${kept.length} rules`);
  console.log(`Removed: ${removed.length} rules`);
  for (const r of removed) console.log(`  - ${r.selector}`);
  console.log('\nKept selectors:');
  for (const b of kept) {
    const m = b.match(/^([\s\S]*?)\{/);
    if (m) console.log(`  ${m[1].trim()}`);
  }
  process.exit(0);
}

// Output: keep these rules verbatim, with section comments preserved.
// Then append the 22 new PROMOTE primary rules organized by section.

const header = `/* ============================================================
   components.css — Atlas shared component library
   Bloomberg / Trading Terminal density. Sharp edges, mono numerics,
   1px borders, A-share red-up / green-down.

   Depends on tokens.css. Do not redefine :root tokens.
   Site-wide only — page-specific styling stays in page <style>.
   ============================================================ */
`;

// Split kept rules into "from current" and "new PROMOTE" sections.
// Each kept block preserves its original text (selector + body).
const fromCurrent = kept.join('\n');

const additions = `
/* ============================================================
   NEW SECTIONS — classes added to make components.css truly site-wide.
   Primary rules only; sub-rules (e.g. .meta .dot) stay page-local
   because they style child selectors that are page-specific.

   19. status-bar  · mobile status row at top of page
   ============================================================ */
.screen {
  width: 100%; height: 100%;
  background: var(--bg);
  border-radius: 38px;
  overflow: hidden;
  position: relative;
  display: flex; flex-direction: column;
}
.status-right { display: flex; align-items: center; gap: 6px; }
.icon { width: 16px; height: 16px; display: inline-block; }
.icon-battery {
  background: currentColor;
  -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 16'><rect x='0.5' y='0.5' width='20' height='15' rx='3' stroke='black' stroke-width='1' fill='none'/><rect x='22' y='5' width='2' height='6' rx='1' fill='black'/><rect x='2' y='2' width='17' height='12' rx='2' fill='black'/></svg>") no-repeat center / contain;
}
.icon-signal {
  background: currentColor;
  -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect x='2' y='11' width='2.5' height='4' rx='0.5' fill='black'/><rect x='6' y='8' width='2.5' height='7' rx='0.5' fill='black'/><rect x='10' y='5' width='2.5' height='10' rx='0.5' fill='black'/><rect x='14' y='2' width='2.5' height='13' rx='0.5' fill='black'/></svg>") no-repeat center / contain;
}
.icon-wifi {
  background: currentColor;
  -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path d='M8 11.5l1.5 1.5a2 2 0 0 1-3 0zM3 7a7 7 0 0 1 10 0l-1.4 1.4a5 5 0 0 0-7.2 0zM1 5a10 10 0 0 1 14 0l-1.4 1.4a8 8 0 0 0-11.2 0z' fill='black'/></svg>") no-repeat center / contain;
}

/* ============================================================
   20. page-top  · mobile page header bar
   ============================================================ */
.top { padding: 4px 20px 8px; display: flex; align-items: center; justify-content: space-between; }
.top-actions { display: flex; gap: 8px; }
.head { padding: 4px 20px 16px; }
.chips {
  display: flex; gap: 6px;
  padding: 0 20px 14px;
  overflow-x: auto;
  scrollbar-width: none;
}
.chips::-webkit-scrollbar { display: none; }
.mtabs { display: none; }
.mtab {
  flex-shrink: 0;
  padding: 10px 0; margin-right: 18px;
  font-size: 13px; font-weight: 500;
  color: var(--muted);
  letter-spacing: -0.005em;
  position: relative;
}
.mtab.active { color: var(--accent); }
.mtab.active::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 18px;
  height: 2px; background: var(--accent);
}

/* ============================================================
   21. layout utility  · flex helpers
   ============================================================ */
.mid { flex: 1; min-width: 0; }
.right { text-align: right; flex-shrink: 0; }

/* ============================================================
   22. badges & tokens  · small pill / tag / token square
   ============================================================ */
.tk {
  width: 38px; height: 38px;
  display: grid; place-items: center;
  font-size: 18px; font-weight: 600;
  flex-shrink: 0; letter-spacing: 0;
}
.pill {
  font-family: var(--font-mono);
  font-size: 10px; letter-spacing: 0.05em;
  padding: 3px 7px; border-radius: 4px;
  border: 1px solid var(--border-strong);
  color: var(--muted);
}

/* ============================================================
   23. alert  · inline status row (subscription / my)
   ============================================================ */
.alert {
  background: var(--surface);
  padding: 11px 14px;
  display: flex; align-items: center; gap: 11px;
}

/* ============================================================
   24. desktop brand + hero feature card
   ============================================================ */
.brand { display: flex; align-items: center; gap: 12px; }
.feat {
  background: var(--fg); color: var(--accent-fg);
  border-radius: 14px;
  padding: 18px 18px 18px;
  position: relative; overflow: hidden;
}
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }

/* ============================================================
   25. report cards (mobile + desktop)
   ============================================================ */
.reports {
  margin: 0 20px 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 14px 16px 16px;
}
.rpt {
  background: var(--surface);
  padding: 14px;
  display: flex; gap: 12px;
}
.stat {
  display: flex; flex-direction: column;
  align-items: flex-end;
  min-width: 28px;
}
`;

const output = header + '\n' + fromCurrent + '\n' + additions;

fs.writeFileSync(path.join(PROJECT_DIR, 'assets/css/components.css'), output);
console.log(`Wrote new components.css: ${output.length} bytes, ${kept.length} kept rules + 22 added`);
