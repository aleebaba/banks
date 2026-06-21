// tools/extract-primary.js
// For each PROMOTABLE class, check if the PRIMARY rule `.cls { ... }` is
// consistent across all pages that use it. This determines promote-vs-keep.
//
// Output per class:
//   ✓  consistent:    single body across all using pages — PROMOTE
//   ⚠ inconsistent:   multiple bodies — KEEP PAGE-LOCAL (or unify manually)
//   ○  child-only:    only used inside other selectors — KEEP PAGE-LOCAL
//   ❌ missing:       no definition anywhere — KEEP (might rely on parent)

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const PAGES = [
  'mobile/home.html', 'mobile/banks/list.html', 'mobile/banks/detail.html',
  'mobile/regulators/list.html', 'mobile/regulators/detail.html',
  'mobile/reports/list.html', 'mobile/reports/detail.html',
  'mobile/compare.html', 'mobile/my.html', 'mobile/subscription.html',
  'desktop/index.html', 'desktop/about.html',
];

function extractStyleBlocks(html) {
  const blocks = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/g;
  let m;
  while ((m = re.exec(html)) !== null) blocks.push(m[1]);
  return blocks.join('\n');
}

function parseDefs(css) {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const defs = new Map();
  const reRule = /([^\{\}]+?)\{([^{}]*)\}/g;
  let m;
  while ((m = reRule.exec(noComments)) !== null) {
    const selector = m[1].trim();
    const body = m[2].trim();
    if (!body) continue;
    const clsMatches = [...selector.matchAll(/\.(-?[a-zA-Z_][a-zA-Z0-9_-]*)/g)];
    for (const cm of clsMatches) {
      const cls = cm[1];
      if (!defs.has(cls)) defs.set(cls, []);
      defs.get(cls).push({ selector, body });
    }
  }
  return defs;
}

const args = process.argv.slice(2);
const audit = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'audit-current.json'), 'utf8'));
const promotableClasses = args.length > 0 ? args : audit.promotable.map(p => p.cls);

const pageDefs = new Map();
for (const page of PAGES) {
  const html = fs.readFileSync(path.join(PROJECT_DIR, page), 'utf8');
  pageDefs.set(page, parseDefs(extractStyleBlocks(html)));
}

function isPrimary(selector, cls) {
  // Selector must be exactly `.cls` or `.cls:state` (pseudo-class).
  // Reject: `.cls .child` (descendant), `.cls::before` (pseudo-element),
  // `.cls.sibling` (compound), `.cls > .x` (combinator).
  const re = new RegExp(`^\\.${cls}(:[a-z-]+)?$`);
  return re.test(selector.trim());
}

const promote = [];
const keepLocal = [];
const noDef = [];

for (const cls of promotableClasses) {
  const primaryByPage = new Map(); // page -> body
  const childCount = new Map();    // page -> count of child rules
  for (const [page, defs] of pageDefs) {
    const list = defs.get(cls) || [];
    let primaryBody = null;
    let children = 0;
    for (const d of list) {
      if (isPrimary(d.selector, cls)) primaryBody = d.body.replace(/\s+/g, ' ').trim();
      else children++;
    }
    if (primaryBody) primaryByPage.set(page, primaryBody);
    if (children > 0) childCount.set(page, children);
  }
  if (primaryByPage.size === 0) {
    noDef.push({ cls, childCount: [...childCount.values()].reduce((a, b) => a + b, 0) });
    continue;
  }
  const uniqueBodies = new Set(primaryByPage.values());
  if (uniqueBodies.size === 1) {
    promote.push({ cls, pages: primaryByPage.size, body: [...uniqueBodies][0] });
  } else {
    keepLocal.push({ cls, variants: uniqueBodies.size, pages: primaryByPage.size });
  }
}

console.log(`=== PROMOTE (${promote.length}) — primary rule is consistent ===`);
for (const p of promote) console.log(`  ✓ ${p.cls} (${p.pages}p)  ${p.body.slice(0, 100)}`);

console.log(`\n=== KEEP PAGE-LOCAL (${keepLocal.length}) — primary rule differs across pages ===`);
for (const p of keepLocal) console.log(`  ⚠ ${p.cls}: ${p.variants} variants x ${p.pages} pages`);

console.log(`\n=== NO PRIMARY DEF (${noDef.length}) — child-scoped only ===`);
for (const p of noDef) console.log(`  ○ ${p.cls}: ${p.childCount} child rules total`);

console.log(`\n=== Summary: ${promotableClasses.length} = ${promote.length} promote + ${keepLocal.length} keep-local + ${noDef.length} no-def ===`);
