// tools/extract-defs.js
// For each PROMOTABLE class from class-audit, find its CSS definition(s) in
// each page's <style> block and dump canonical definitions + conflict report.
//
// Usage: node tools/extract-defs.js [className ...]
//   no args: process all PROMOTABLE classes from audit
//   with args: only process named classes

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const PAGES = [
  'mobile/home.html',
  'mobile/banks/list.html',
  'mobile/banks/detail.html',
  'mobile/regulators/list.html',
  'mobile/regulators/detail.html',
  'mobile/reports/list.html',
  'mobile/reports/detail.html',
  'mobile/compare.html',
  'mobile/my.html',
  'mobile/subscription.html',
  'desktop/index.html',
  'desktop/about.html',
];

function extractStyleBlocks(html) {
  const blocks = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    blocks.push(m[1]);
  }
  return blocks.join('\n');
}

// Parse all `.classname { ... }` definitions, handling nested braces.
// Key insight: a rule like `.hero .eyebrow { ... }` belongs to BOTH `.hero`
// (as a child context) AND `.eyebrow` (as the primary class). We want both,
// but conflict detection must compare selectors+body, not just body.
function parseDefs(css) {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const defs = new Map(); // className -> array of {selector, body}
  const reRule = /([^\{\}]+?)\{([^{}]*)\}/g;
  let m;
  while ((m = reRule.exec(noComments)) !== null) {
    const selector = m[1].trim();
    const body = m[2].trim();
    if (!body) continue;
    // Extract ALL class names from selector (e.g. ".hero .eyebrow" -> both)
    const clsMatches = [...selector.matchAll(/\.(-?[a-zA-Z_][a-zA-Z0-9_-]*)/g)];
    if (clsMatches.length === 0) continue;
    for (const cm of clsMatches) {
      const cls = cm[1];
      if (!defs.has(cls)) defs.set(cls, []);
      defs.get(cls).push({ selector, body });
    }
  }
  return defs;
}

function bodyEquals(a, b) {
  // Normalize whitespace for compare
  const norm = s => s.replace(/\s+/g, ' ').trim();
  return norm(a) === norm(b);
}

// Main
const args = process.argv.slice(2);
const audit = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'audit-current.json'), 'utf8'));
const promotableClasses = args.length > 0
  ? args
  : audit.promotable.map(p => p.cls);

const pageDefs = new Map(); // page -> Map<class, [{selector, body}]>
for (const page of PAGES) {
  const html = fs.readFileSync(path.join(PROJECT_DIR, page), 'utf8');
  const styleContent = extractStyleBlocks(html);
  pageDefs.set(page, parseDefs(styleContent));
}

// For conflict detection, only consider rules where this class is the PRIMARY
// selector (first class in the rule). Rules like `.foo .bar { ... }` are
// scoped to `.foo`; `.bar`'s canonical definition is elsewhere.
function isPrimary(selector, cls) {
  // First class in selector
  const m = selector.match(/^\s*\.(-?[a-zA-Z_][a-zA-Z0-9_-]*)/);
  return m && m[1] === cls;
}

let conflicts = 0;
let missing = 0;
for (const cls of promotableClasses) {
  const primaryDefs = []; // {page, selector, body}
  const childDefs = [];   // {page, selector, body} — class is nested under another
  for (const [page, defs] of pageDefs) {
    const list = defs.get(cls) || [];
    for (const d of list) {
      const entry = { page, ...d };
      if (isPrimary(d.selector, cls)) primaryDefs.push(entry);
      else childDefs.push(entry);
    }
  }
  if (primaryDefs.length === 0 && childDefs.length === 0) {
    console.log(`❌ ${cls}: NO DEFINITION FOUND IN ANY PAGE`);
    missing++;
    continue;
  }
  const pages = [...new Set([...primaryDefs, ...childDefs].map(d => d.page))].sort();

  if (primaryDefs.length === 0) {
    console.log(`○ ${cls}: only child-scoped (${childDefs.length} rules across ${pages.length} pages) — selector: ${childDefs[0].selector}`);
    continue;
  }

  // Group primary defs by (selector, body)
  const sigs = new Map();
  for (const d of primaryDefs) {
    const sig = `${d.selector}|||${d.body.replace(/\s+/g, ' ').trim()}`;
    if (!sigs.has(sig)) sigs.set(sig, []);
    sigs.get(sig).push(d.page);
  }
  const uniqueSigs = sigs.size;
  const conflict = uniqueSigs > 1;
  if (conflict) conflicts++;
  if (conflict) {
    console.log(`⚠️  ${cls}: CONFLICT (${uniqueSigs} distinct rules across ${pages.length} pages)`);
    for (const [sig, pgs] of sigs) {
      const [sel, body] = sig.split('|||');
      console.log(`    [${pgs.join(', ')}]`);
      console.log(`      ${sel} { ${body} }`);
    }
  } else {
    const [sig, pgs] = [...sigs.entries()][0];
    const [sel, body] = sig.split('|||');
    console.log(`✓ ${cls}: 1 rule x ${primaryDefs.length} pages — ${pgs[0]}`);
    if (process.env.VERBOSE) {
      console.log(`    ${sel} { ${body} }`);
    }
  }
}
console.log(`\n=== Total: ${promotableClasses.length} classes, ${conflicts} conflicts, ${missing} missing ===`);
