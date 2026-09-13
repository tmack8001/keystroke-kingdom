#!/usr/bin/env node
// Keystroke Kingdom — STATIC-HOST validation gate
//
// The game ships to THREE environments:
//   1. the Go binary            (`./keystroke-kingdom`)      — serves from /
//   2. docker-compose           (the same binary + Ollama)   — serves from /
//   3. a plain static host      (GitHub Pages project page)  — serves from
//      /keystroke-kingdom/, with NO /api/* endpoints at all.
//
// This script is the repeatable gate for #3. It answers one question: "if a
// browser loads index.html from <base>, does every file the page needs come
// back 200?" That covers the two failure modes a static host uniquely has:
//   (a) an ABSOLUTE asset path (`/favicon.ico`) — correct at the site root,
//       404 under a project-page sub-path;
//   (b) a NEW js module that was added to the import graph but never made it
//       into the published tree.
// The missing /api/* endpoints are BY DESIGN here — js/wordgen.js, js/chat.js
// and js/keyboard-story-gen.js all feature-detect and fall back to their static
// pools (.claude/rules/security.md rule 6). A 404 from /api/wordgen/health is
// therefore reported as INFO, never as a failure.
//
// Usage:
//   node scripts/static-host-check.mjs                      # live Pages site
//   node scripts/static-host-check.mjs --url=http://127.0.0.1:8801/keystroke-kingdom/
//   node scripts/static-host-check.mjs --url=http://127.0.0.1:8801/   # root-served
//
// Zero dependencies, no browser, no child processes (security.md rules 13-15
// are vacuously satisfied — if that ever changes, use execFileSync with ARRAY
// args and never shell:true).

const DEFAULT_URL = 'https://tmack8001.github.io/keystroke-kingdom/';

const args = process.argv.slice(2);
const urlArg = args.find((a) => a.startsWith('--url='));
const verbose = args.includes('--verbose');
let base = (urlArg ? urlArg.slice('--url='.length) : DEFAULT_URL).trim();
if (!base.endsWith('/')) base += '/';

let BASE;
try {
  BASE = new URL(base);
} catch (_) {
  console.error(`FAIL  --url is not a valid URL: ${base}`);
  process.exit(2);
}

const failures = [];
const infos = [];
let checked = 0;

// ── tiny fetch helper ────────────────────────────────────────────────────
// HEAD first (cheap); some static hosts answer HEAD oddly, so a non-200 HEAD
// is re-tried as a GET before it is called a failure.
async function probe(url) {
  let res;
  try {
    res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (!res.ok) res = await fetch(url, { method: 'GET', redirect: 'follow' });
  } catch (err) {
    return { ok: false, status: 0, error: String(err && err.message ? err.message : err), type: '' };
  }
  return { ok: res.ok, status: res.status, type: res.headers.get('content-type') || '', error: '' };
}

async function getText(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) return { ok: false, status: res.status, text: '', type: '' };
  return { ok: true, status: res.status, text: await res.text(), type: res.headers.get('content-type') || '' };
}

// A reference is LOCAL (our problem) unless it names another origin.
function isLocalRef(ref) {
  if (!ref) return false;
  const r = ref.trim();
  if (!r) return false;
  if (r.startsWith('#') || r.startsWith('data:') || r.startsWith('mailto:') || r.startsWith('javascript:')) return false;
  if (r.startsWith('//')) return false;              // protocol-relative → external
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(r)) return false; // has a scheme → external
  return true;
}

function record(label, url, res, expectTypeRe) {
  checked++;
  if (!res.ok) {
    failures.push(`${label}  ${url}  → ${res.status || 'NETWORK'} ${res.error}`.trimEnd());
    return false;
  }
  if (expectTypeRe && res.type && !expectTypeRe.test(res.type)) {
    failures.push(`${label}  ${url}  → 200 but Content-Type "${res.type}" is not executable as a module`);
    return false;
  }
  if (verbose) console.log(`  ok  ${res.status}  ${url}`);
  return true;
}

// ── 1. index.html ────────────────────────────────────────────────────────
const indexUrl = new URL('index.html', BASE).href;
console.log(`STATIC HOST CHECK  →  ${BASE.href}`);
console.log('');
console.log('[1/4] index.html');

const indexRes = await getText(indexUrl);
if (!indexRes.ok) {
  console.error(`FAIL  index.html unreachable: ${indexUrl} → ${indexRes.status}`);
  process.exit(1);
}
checked++;
console.log(`  ok  200  ${indexUrl}`);
const html = indexRes.text;

// Also confirm the directory URL itself serves the game (Pages' implicit index).
const dirRes = await probe(BASE.href);
record('  DIRECTORY INDEX', BASE.href, dirRes);

// ── 2. every local asset reference in index.html ─────────────────────────
console.log('[2/4] index.html asset references');
const refs = new Set();
const absoluteRefs = [];
const attrRe = /\b(?:href|src|content|data|poster)\s*=\s*"([^"]*)"|\b(?:href|src|content|data|poster)\s*=\s*'([^']*)'/g;
let m;
while ((m = attrRe.exec(html)) !== null) {
  const ref = m[1] !== undefined ? m[1] : m[2];
  if (!isLocalRef(ref)) continue;
  // `content=` carries plenty of non-URL metadata (viewport, theme-color…).
  // Only treat it as an asset if it looks like a path with a file extension.
  if (!/\.[a-z0-9]{2,5}(\?|#|$)/i.test(ref)) continue;
  if (ref.startsWith('/')) absoluteRefs.push(ref);
  refs.add(ref.split('#')[0]);
}
for (const ref of [...refs].sort()) {
  const url = new URL(ref, indexUrl).href;
  record('  ASSET 404', url, await probe(url));
}
if (absoluteRefs.length) {
  failures.push(
    `  ABSOLUTE PATH in index.html (breaks any non-root host): ${absoluteRefs.join(', ')}`,
  );
}
console.log(`  ${refs.size} local asset reference(s) checked`);

// ── 3. the ES-module import graph ────────────────────────────────────────
// No dynamic import() exists in js/ (verified 2026-09-11) — a static regex
// crawl from the page's module entry points reaches every file the browser
// will ever request.
console.log('[3/4] ES module import graph');
const entryPoints = new Set(['js/main.js']);
const scriptRe = /<script\b[^>]*type\s*=\s*["']module["'][^>]*>/gi;
let sm;
while ((sm = scriptRe.exec(html)) !== null) {
  const src = /\bsrc\s*=\s*["']([^"']+)["']/.exec(sm[0]);
  if (src && isLocalRef(src[1])) entryPoints.add(src[1]);
}

const seen = new Set();
const queue = [...entryPoints].map((e) => new URL(e, indexUrl).href);
let moduleCount = 0;
// `import x from 'y'` / `export … from 'y'` / bare `import 'y'` — plus the
// `with { type: 'json' }` attribute form used by js/word-blocklist.js.
const specRe = /(?:^|[\s;}])(?:import|export)\s[^'"();]*?from\s*["']([^"']+)["']|(?:^|[\s;}])import\s*["']([^"']+)["']/g;

while (queue.length) {
  const url = queue.shift();
  if (seen.has(url)) continue;
  seen.add(url);
  const isJson = /\.json(\?|#|$)/.test(url);
  const res = await getText(url);
  moduleCount++;
  if (!res.ok) {
    checked++;
    failures.push(`  MODULE 404  ${url}  → ${res.status}`);
    continue;
  }
  const typeRe = isJson ? /json/i : /javascript|ecmascript/i;
  record('  MODULE', url, { ok: true, status: res.status, type: res.type, error: '' }, typeRe);
  if (isJson) continue;
  let im;
  specRe.lastIndex = 0;
  while ((im = specRe.exec(res.text)) !== null) {
    const spec = im[1] !== undefined ? im[1] : im[2];
    if (!isLocalRef(spec)) continue;
    if (spec.startsWith('/')) {
      failures.push(`  ABSOLUTE import specifier in ${url}: '${spec}' (breaks any non-root host)`);
      continue;
    }
    queue.push(new URL(spec, url).href);
  }
}
console.log(`  ${moduleCount} module file(s) reachable`);

// ── 4. the /api/* endpoints are EXPECTED to be absent ────────────────────
console.log('[4/4] /api/* absence (by design on a static host)');
for (const apiPath of ['api/wordgen/health', 'api/chat', 'api/keyboard-story']) {
  const url = new URL(apiPath, BASE).href;
  const res = await probe(url);
  if (res.ok) {
    infos.push(`  INFO  ${url} → ${res.status} (a backend IS present here; static fallback untested)`);
  } else {
    infos.push(`  INFO  ${url} → ${res.status || 'unreachable'} — EXPECTED, client falls back to static pools`);
  }
}
// Regression probe, NOT the client's path. The three clients (js/wordgen.js,
// js/chat.js, js/keyboard-story-gen.js) use RELATIVE endpoint constants
// ('api/wordgen/health', …), so their requests stay INSIDE the project-page
// prefix — verified 2026-09-11. They used to be root-absolute, which escaped the
// prefix to the DOMAIN root: harmless in isolation (it 404s either way), but on a
// shared user.github.io that is a path this game does not own, so a sibling
// project serving /api/* would have been talked to by mistake. We still probe the
// domain root purely to report what lives there, so that if someone ever
// re-introduces an absolute path this line makes the difference visible.
const rootProbe = new URL('/api/wordgen/health', BASE).href;
if (rootProbe !== new URL('api/wordgen/health', BASE).href) {
  const res = await probe(rootProbe);
  infos.push(`  INFO  ${rootProbe} → ${res.status || 'unreachable'} — domain root, OUTSIDE our prefix. The clients use relative paths and never request this; probed only so a regression to absolute paths is visible here.`);
}
for (const line of infos) console.log(line);

// ── summary ──────────────────────────────────────────────────────────────
console.log('');
if (failures.length) {
  console.log(`FAIL  ${failures.length} problem(s) across ${checked} checked resource(s):`);
  for (const f of failures) console.log(f);
  console.log('');
  console.log('A 404 here means the published site is broken for every player.');
  process.exit(1);
}
console.log(`PASS  ${checked} resource(s) all 200 (${moduleCount} ES modules, ${refs.size} index.html assets).`);
console.log('      No /api/* backend — the designed static-pool fallback path.');
process.exit(0);
