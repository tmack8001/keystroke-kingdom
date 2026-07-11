#!/usr/bin/env node
// wiki-search.mjs — zero-dependency search / index / lint for the research wiki.
// Schema: research/WIKI.md. Usage:
//   node scripts/wiki-search.mjs "query terms"     ranked BM25 results with snippets
//   node scripts/wiki-search.mjs --index           regenerate research/index.md
//   node scripts/wiki-search.mjs --lint            orphans, broken links, uncited pages
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'research');
const SKIP = new Set(['index.md', 'log.md', 'WIKI.md']);

// ── Corpus loading ───────────────────────────────────────────────────────────
function mdFiles(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...mdFiles(p));
    else if (e.name.endsWith('.md') && !SKIP.has(e.name)) out.push(p);
  }
  return out;
}

function parseFrontmatter(src) {
  const fm = {};
  const m = src.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { fm, body: src };
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      fm[kv[1]] = v.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
    } else {
      fm[kv[1]] = v.replace(/^["']|["']$/g, '');
    }
  }
  return { fm, body: src.slice(m[0].length) };
}

function loadCorpus() {
  return mdFiles(ROOT).map(path => {
    const src = readFileSync(path, 'utf8');
    const { fm, body } = parseFrontmatter(src);
    const name = basename(path, '.md');
    // Handles [[page]], [[page|label]], [[page#sec]], and the escaped-pipe
    // form [[page\|label]] required inside markdown tables (valid Obsidian).
    const links = [...body.matchAll(/\[\[([^\]|#]+?)(?:\\?[|#][^\]]*)?\]\]/g)]
      .map(x => x[1].replace(/\\$/, '').trim());
    // First non-heading paragraph = the trusted summary
    const para = body.split(/\n\s*\n/).map(s => s.trim())
      .find(s => s && !s.startsWith('#') && !s.startsWith('|') && !s.startsWith('*Compiled') && !s.startsWith('---'));
    return { path, name, fm, body, links, summary: (para || '').replace(/\s+/g, ' ').slice(0, 220) };
  });
}

// ── BM25 ─────────────────────────────────────────────────────────────────────
const tokenize = (s) => (s.toLowerCase().match(/[a-z0-9][a-z0-9'*-]*/g) || []);

function search(corpus, query, topN = 8) {
  const q = tokenize(query);
  const docs = corpus.map(d => {
    const boosted = [
      d.name.replace(/-/g, ' ').repeat(4),
      String(d.fm.title || '').repeat(4),
      (Array.isArray(d.fm.tags) ? d.fm.tags.join(' ') : String(d.fm.tags || '')).repeat(3),
      d.links.join(' ').repeat(2),
      d.body,
    ].join(' ');
    return { ...d, tokens: tokenize(boosted) };
  });
  const N = docs.length;
  const avgLen = docs.reduce((a, d) => a + d.tokens.length, 0) / N;
  const df = new Map();
  for (const d of docs) for (const t of new Set(d.tokens)) df.set(t, (df.get(t) || 0) + 1);
  const k1 = 1.4, b = 0.75;
  const scored = docs.map(d => {
    const tf = new Map();
    for (const t of d.tokens) tf.set(t, (tf.get(t) || 0) + 1);
    let score = 0;
    for (const term of q) {
      const f = tf.get(term) || 0;
      if (!f) continue;
      const idf = Math.log(1 + (N - df.get(term) + 0.5) / (df.get(term) + 0.5));
      score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * d.tokens.length / avgLen));
    }
    return { d, score };
  }).filter(x => x.score > 0).sort((a, b2) => b2.score - a.score).slice(0, topN);

  if (!scored.length) { console.log('No matches. Try broader terms, or read research/index.md.'); return; }
  for (const { d, score } of scored) {
    // Snippet: line with most query terms
    let best = '', bestHits = 0;
    for (const line of d.body.split('\n')) {
      const lt = line.toLowerCase();
      const hits = q.filter(t => lt.includes(t)).length;
      if (hits > bestHits && line.trim().length > 20) { bestHits = hits; best = line.trim(); }
    }
    const rel = d.path.slice(ROOT.length - 'research'.length);
    console.log(`\n■ ${d.fm.title || d.name}  (${rel})  score=${score.toFixed(2)}`);
    if (d.summary) console.log(`  ${d.summary}`);
    if (best && best !== d.summary.slice(0, best.length)) console.log(`  › ${best.slice(0, 200)}`);
  }
  console.log('');
}

// ── index.md generation ──────────────────────────────────────────────────────
const FOLDER_ORDER = ['people', 'games', 'tech', 'culture', 'moments', 'pedagogy'];
const FOLDER_BLURB = {
  people:   'The humans behind the machines',
  games:    'Video games — arcade cabinets, consoles, text adventures',
  tech:     'Machines, formats, and era-hardware concepts',
  culture:  'Hacker and gaming folklore',
  moments:  'Dated events in computing history',
  pedagogy: 'Typing tutors and teaching concepts',
};

function generateIndex(corpus) {
  const hubs = corpus.filter(d => dirname(d.path) === ROOT);
  const wiki = corpus.filter(d => dirname(d.path) !== ROOT)
    .sort((a, b2) => a.name.localeCompare(b2.name));
  const byFolder = {};
  for (const d of wiki) (byFolder[basename(dirname(d.path))] ??= []).push(d);

  let out = `# Research Wiki Index\n\n*Generated by \`node scripts/wiki-search.mjs --index\` — do not edit by hand.\nAgents: read this file first, then drill into pages. Schema: [[WIKI]].*\n\n## Hub documents (Maps of Content)\n\n`;
  for (const d of hubs) out += `- [[${d.name}]] — ${d.summary}\n`;
  const folders = [...FOLDER_ORDER.filter(f => byFolder[f]),
    ...Object.keys(byFolder).filter(f => !FOLDER_ORDER.includes(f)).sort()];
  for (const folder of folders) {
    const docs = byFolder[folder];
    out += `\n## wiki/${folder}/ — ${FOLDER_BLURB[folder] || ''} (${docs.length})\n\n`;
    for (const d of docs) {
      const meta = [d.fm.type, d.fm.level ? `L${d.fm.level}` : null, d.fm.sources ? `${d.fm.sources} refs` : null,
        d.fm.verified ? `verified ${d.fm.verified}` : null].filter(Boolean).join(', ');
      out += `- [[${d.name}]]${meta ? ` *(${meta})*` : ''} — ${d.summary}\n`;
    }
  }
  writeFileSync(join(ROOT, 'index.md'), out);
  console.log(`index.md regenerated: ${hubs.length} hubs, ${wiki.length} wiki pages across ${folders.length} folders.`);
}

// ── lint ─────────────────────────────────────────────────────────────────────
function lint(corpus) {
  const names = new Set(corpus.map(d => d.name).concat(['WIKI', 'index', 'log']));
  const incoming = new Map();
  const problems = [];
  for (const d of corpus) for (const l of d.links) {
    incoming.set(l, (incoming.get(l) || 0) + 1);
    if (!names.has(l)) problems.push(`BROKEN LINK  ${d.name} → [[${l}]]`);
  }
  for (const d of corpus) {
    const isWiki = dirname(d.path) !== ROOT;
    if (!isWiki) continue;
    if (!incoming.get(d.name) && !d.links.length) problems.push(`ORPHAN       ${d.name} (no links in or out)`);
    if (!d.fm.type) problems.push(`NO TYPE      ${d.name} (frontmatter missing 'type')`);
    if (!/## References/i.test(d.body)) problems.push(`UNCITED      ${d.name} (no References section)`);
    if (!d.fm.verified) problems.push(`UNVERIFIED   ${d.name} (frontmatter missing 'verified')`);
  }
  if (!problems.length) console.log(`Lint clean: ${corpus.length} pages, no orphans, no broken links, all cited.`);
  else { for (const p of problems.sort()) console.log(p); process.exitCode = 1; }
}

// ── main ─────────────────────────────────────────────────────────────────────
const arg = process.argv.slice(2).join(' ').trim();
const corpus = loadCorpus();
if (arg === '--index') generateIndex(corpus);
else if (arg === '--lint') lint(corpus);
else if (arg) search(corpus, arg);
else console.log('usage: wiki-search.mjs "query" | --index | --lint');
