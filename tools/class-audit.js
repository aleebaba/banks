// atlas-tools/class-audit.js
// Audit CSS class reuse across Atlas HTML mockup pages.
//
// Usage:
//   node atlas-tools/class-audit.js
//   node atlas-tools/class-audit.js --json > audit.json
//
// Output (text mode):
//   A. SHARED       — used in >=2 pages AND in atlas-components.css (the gold set)
//   B. PROMOTABLE   — used in >=2 pages but NOT in atlas-components.css (gap to fill)
//   C. PAGE-LOCAL   — used in only 1 page (keep as-is OR consider promoting)
//   D. DEAD         — defined in atlas-components.css but unused by any page
//   E. PER-PAGE GAP — for each page, classes USED but not in components.css
//   F. SUMMARY      — totals
//
// Trigger: Run this BEFORE Step B of the extraction plan (see memory:
// project_atlas_full_site_component_re_extraction.md).

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const PAGES = [
  'mobile-bank-detail.html',
  'mobile-banks.html',
  'mobile-home.html',
  'mobile-my.html',
  'mobile-subscription.html',
  'mobile-regulators.html',
  'mobile-regulator-detail.html',
  'mobile-reports.html',
  'mobile-report-detail.html',
  'mobile-compare.html',
  'index.html',
  'about.html',
];
const COMPONENTS_CSS = 'atlas-components.css';
const TOKENS_CSS = 'atlas-tokens.css';

// ---------- extractors ----------

function extractClassesFromHTML(html) {
  // Two sources: (1) class="..." attributes in HTML, (2) .classname { in <style> blocks
  const used = new Set();
  const reAttr = /class="([^"]+)"/g;
  let m;
  while ((m = reAttr.exec(html)) !== null) {
    m[1].split(/\s+/).forEach(c => { if (c) used.add(c); });
  }
  // Strip <style>...</style> blocks then extract .classname patterns
  const noStyle = html.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');
  const reDef = /\.(-?[a-zA-Z_][a-zA-Z0-9_-]*)/g;
  while ((m = reDef.exec(noStyle)) !== null) {
    used.add(m[1]);
  }
  return used;
}

function extractDefinedClassesFromCSS(cssText) {
  const defined = new Set();
  const re = /\.(-?[a-zA-Z_][a-zA-Z0-9_-]*)/g;
  let m;
  while ((m = re.exec(cssText)) !== null) {
    defined.add(m[1]);
  }
  return defined;
}

// ---------- main ----------

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');

function log(...args) { if (!jsonMode) console.log(...args); }
function err(...args) { console.error(...args); }

const componentsPath = path.join(PROJECT_DIR, COMPONENTS_CSS);
const tokensPath = path.join(PROJECT_DIR, TOKENS_CSS);

if (!fs.existsSync(componentsPath)) {
  err(`❌ ${COMPONENTS_CSS} not found at ${componentsPath}`);
  process.exit(1);
}
if (!fs.existsSync(tokensPath)) {
  err(`❌ ${TOKENS_CSS} not found at ${tokensPath}`);
  process.exit(1);
}

const componentsCSS = fs.readFileSync(componentsPath, 'utf8');
const definedInComponents = extractDefinedClassesFromCSS(componentsCSS);
const definedInTokens = extractDefinedClassesFromCSS(fs.readFileSync(tokensPath, 'utf8'));

log(`📋 ${COMPONENTS_CSS}: ${definedInComponents.size} classes`);
log(`📋 ${TOKENS_CSS}: ${definedInTokens.size} classes\n`);

// Tally per-class usage
const classToPages = new Map(); // class -> Set<page>
const pageToClasses = new Map(); // page -> Set<class>

for (const page of PAGES) {
  const pagePath = path.join(PROJECT_DIR, page);
  if (!fs.existsSync(pagePath)) {
    err(`⚠️  ${page} not found, skipping`);
    continue;
  }
  const html = fs.readFileSync(pagePath, 'utf8');
  const classes = extractClassesFromHTML(html);
  pageToClasses.set(page, classes);
  for (const cls of classes) {
    if (!classToPages.has(cls)) classToPages.set(cls, new Set());
    classToPages.get(cls).add(page);
  }
}

// Classify
const shared = [];       // >=2 pages AND in components
const promotable = [];   // >=2 pages NOT in components (gap)
const pageLocal = [];    // 1 page only
const dead = [];         // in components but unused by any page

for (const [cls, pages] of classToPages) {
  const count = pages.size;
  const inComp = definedInComponents.has(cls);
  const entry = { cls, count, pages: [...pages].sort(), inComp };
  if (count >= 2 && inComp) shared.push(entry);
  else if (count >= 2 && !inComp) promotable.push(entry);
  else pageLocal.push(entry);
}

// Dead classes: in components.css but in NO page
for (const cls of definedInComponents) {
  if (!classToPages.has(cls)) {
    dead.push({ cls, count: 0, pages: [], inComp: true });
  }
}

// Sort
const byCount = (a, b) => b.count - a.count || a.cls.localeCompare(b.cls);
shared.sort(byCount);
promotable.sort(byCount);
pageLocal.sort((a, b) => a.pages[0].localeCompare(b.pages[0]) || a.cls.localeCompare(b.cls));
dead.sort((a, b) => a.cls.localeCompare(b.cls));

if (jsonMode) {
  const out = {
    shared, promotable, pageLocal, dead,
    summary: {
      totalUnique: classToPages.size,
      shared: shared.length,
      promotable: promotable.length,
      pageLocal: pageLocal.length,
      dead: dead.length,
      definedInComponents: definedInComponents.size,
      definedInTokens: definedInTokens.size,
    }
  };
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}

const line = (s = '') => log(s);
const hr = () => line('─'.repeat(72));
const pct = (num, denom) => denom === 0 ? '0%' : Math.round(num / denom * 100) + '%';

line('A. SHARED (used in >=2 pages AND in atlas-components.css)');
hr();
log(`   ${shared.length} classes — the gold set, do not change\n`);
for (const { cls, count, pages } of shared) {
  log(`   ${count}x  .${cls.padEnd(28)} ${pages.join(', ')}`);
}

line('\nB. PROMOTABLE (used in >=2 pages but NOT in atlas-components.css)');
hr();
log(`   ${promotable.length} classes — candidates to ADD to components.css\n`);
for (const { cls, count, pages } of promotable.slice(0, 50)) {
  log(`   ${count}x  .${cls.padEnd(28)} ${pages.join(', ')}`);
}
if (promotable.length > 50) log(`   ... (${promotable.length - 50} more)`);

line('\nC. PAGE-LOCAL (used in only 1 page)');
hr();
log(`   ${pageLocal.length} classes — keep page-local, do NOT promote (per §2.9)\n`);
const byPage = new Map();
for (const { cls, pages } of pageLocal) {
  if (!byPage.has(pages[0])) byPage.set(pages[0], []);
  byPage.get(pages[0]).push(cls);
}
for (const [page, classes] of [...byPage.entries()].sort()) {
  log(`   ${page} (${classes.length}):`);
  for (const c of classes) log(`     .${c}`);
  log('');
}

line('D. DEAD IN atlas-components.css (defined but UNUSED by any page)');
hr();
log(`   ${dead.length} classes — candidates to DELETE (bloat)\n`);
for (const { cls } of dead) log(`   .${cls}`);

line('\nE. PER-PAGE GAP (classes used by page but NOT in atlas-components.css)');
hr();
for (const page of PAGES) {
  const classes = pageToClasses.get(page);
  if (!classes) continue;
  const missing = [...classes].filter(c => !definedInComponents.has(c)).sort();
  if (missing.length === 0) {
    log(`   ${page.padEnd(36)} 0 missing ✅`);
  } else {
    log(`   ${page.padEnd(36)} ${missing.length} missing`);
  }
}

line('\nF. SUMMARY');
hr();
log(`   Total unique classes across ${PAGES.length} pages: ${classToPages.size}`);
log(`   ${COMPONENTS_CSS} defines:                           ${definedInComponents.size} classes`);
log(`     ├─ SHARED (in use, >=2 pages):                    ${shared.length} (${pct(shared.length, definedInComponents.size)})`);
log(`     └─ DEAD (in components, not used):                ${dead.length} (${pct(dead.length, definedInComponents.size)})`);
log(`   ${COMPONENTS_CSS} GAP (used in >=2 pages, missing):  ${promotable.length}`);
log(`   Page-local (1 page only):                           ${pageLocal.length}`);
log(`\n   After Step C (12 pages link to components.css):`);
log(`     - Shared + Promotable = ${shared.length + promotable.length} classes (target size of components.css)`);
log(`     - Page-local classes stay in page <style> blocks`);
