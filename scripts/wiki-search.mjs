#!/usr/bin/env node
// wiki-search.mjs — zero-dependency search / index / lint for the research wiki.
// Schema: research/WIKI.md. Usage:
//   node scripts/wiki-search.mjs "query terms"     ranked BM25 results with snippets
//   node scripts/wiki-search.mjs --index           regenerate research/index.md
//   node scripts/wiki-search.mjs --lint            orphans, broken links, uncited pages
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = join(PROJ, 'research');
const JDIR = join(PROJ, 'docs', 'journal');
const FDIR = join(PROJ, 'docs', 'features');
// Skipped: generated views (learnings/observations/failures are rebuilt by --index),
// schema docs, the dashboard (Dataview source), and the wiki's own index/log.
const SKIP = new Set(['index.md', 'log.md', 'WIKI.md', 'JOURNAL.md', 'dashboard.md',
  'learnings.md', 'observations.md', 'failures.md', 'README.md']);
const IMPORTANCE_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

// ── Corpus loading ───────────────────────────────────────────────────────────
function mdFiles(dir) {
  const out = [];
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...mdFiles(p));
    else if (e.name.endsWith('.md') && !SKIP.has(e.name)) out.push(p);
  }
  return out;
}

// Kind: wiki (atomic graph pages, full schema enforced) | hub (research/ root
// narratives) | journal (docs/journal append-only logs) | feature (docs/features/
// code-llmwiki pages, owned by the content-librarian) | doc (planning docs).
function kindOf(path) {
  if (path.includes(join('research', 'wiki'))) return 'wiki';
  if (dirname(path) === ROOT) return 'hub';
  if (path.includes(join('journal', 'entries'))) return 'journal-entry';
  if (path.includes(join('docs', 'journal'))) return 'journal';
  if (path.includes(join('docs', 'features'))) return 'feature';
  return 'doc';
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
  const paths = [
    ...mdFiles(ROOT),
    ...mdFiles(join(PROJ, 'docs', 'journal')),
    ...mdFiles(FDIR),
    join(PROJ, 'docs', 'ROADMAP.md'),
  ].filter(p => { try { return statSync(p).isFile(); } catch { return false; } });
  return paths.map(path => {
    const src = readFileSync(path, 'utf8');
    const { fm, body } = parseFrontmatter(src);
    const name = basename(path, '.md');
    // Handles [[page]], [[page|label]], [[page#sec]], and the escaped-pipe
    // form [[page\|label]] required inside markdown tables (valid Obsidian).
    // Inline code spans and fenced blocks are stripped first — `[[page]]`
    // inside backticks is documentation about links, not a link.
    const linkable = body.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ');
    const links = [...linkable.matchAll(/\[\[([^\]|#]+?)(?:\\?[|#][^\]]*)?\]\]/g)]
      .map(x => x[1].replace(/\\$/, '').trim());
    // First non-heading paragraph = the trusted summary
    const para = body.split(/\n\s*\n/).map(s => s.trim())
      .find(s => s && !s.startsWith('#') && !s.startsWith('|') && !s.startsWith('*Compiled') && !s.startsWith('---'));
    return { path, name, fm, body, links, kind: kindOf(path),
      summary: (para || '').replace(/\s+/g, ' ').slice(0, 220) };
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
  const hubs = corpus.filter(d => d.kind === 'hub');
  const journal = corpus.filter(d => d.kind === 'journal' || d.kind === 'doc');
  const wiki = corpus.filter(d => d.kind === 'wiki')
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
  const features = corpus.filter(d => d.kind === 'feature').sort((a, b2) => a.name.localeCompare(b2.name));
  if (features.length) {
    out += `\n## docs/features/ — the source graph (code-llmwiki, maintained by the content-librarian agent) (${features.length})\n\n`;
    for (const d of features) {
      const codeFiles = Array.isArray(d.fm.code) ? d.fm.code.join(', ') : (d.fm.code || '');
      out += `- [[${d.name}]]${codeFiles ? ` *(${codeFiles})*` : ''} — ${d.summary}\n`;
    }
  }
  const entries = corpus.filter(d => d.kind === 'journal-entry');
  out += `\n## Journal & planning (project memory)\n\n`;
  out += `- [[JOURNAL]] — journal schema · [[dashboard]] — live Dataview status board\n`;
  if (entries.length) {
    const open = entries.filter(e => e.fm.status === 'open');
    out += `- ${entries.length} journal entries (${open.length} OPEN) — views: [[learnings]] · [[observations]] · [[failures]]\n`;
    for (const e of open.sort((a, b2) => (IMPORTANCE_ORDER[a.fm.importance] ?? 9) - (IMPORTANCE_ORDER[b2.fm.importance] ?? 9)))
      out += `  - OPEN [${e.fm.importance}] [[${e.name}|${e.fm.id}: ${e.fm.title}]]\n`;
  }
  for (const d of journal) out += `- [[${d.name}]] — ${d.summary}\n`;
  writeFileSync(join(ROOT, 'index.md'), out);
  if (entries.length) writeJournalViews(entries);
  console.log(`index.md regenerated: ${hubs.length} hubs, ${wiki.length} wiki pages across ${folders.length} folders, ${features.length} feature pages, ${entries.length} journal entries.`);
}

// ── Generated per-kind journal views ─────────────────────────────────────────
function writeJournalViews(entries) {
  const KINDS = { learning: 'learnings', observation: 'observations', failure: 'failures' };
  for (const [kind, fname] of Object.entries(KINDS)) {
    const rows = entries.filter(e => e.fm.kind === kind)
      .sort((a, b2) => {
        const so = (a.fm.status === 'open' ? 0 : 1) - (b2.fm.status === 'open' ? 0 : 1);
        if (so) return so;
        const io = (IMPORTANCE_ORDER[a.fm.importance] ?? 9) - (IMPORTANCE_ORDER[b2.fm.importance] ?? 9);
        if (io) return io;
        return String(a.fm.id).localeCompare(String(b2.fm.id), undefined, { numeric: true });
      });
    let v = `# ${fname[0].toUpperCase() + fname.slice(1)} — generated view\n\n` +
      `*GENERATED by \`node scripts/wiki-search.mjs --index\` — do not edit. ` +
      `Source of truth: [[JOURNAL]] schema + \`entries/\`. Sorted: open first, then importance.*\n\n` +
      `| ID | Title | Status | Importance | Category | Found | Addressed |\n|---|---|---|---|---|---|---|\n`;
    for (const e of rows) {
      v += `| [[${e.name}\\|${e.fm.id}]] | ${e.fm.title || ''} | ${e.fm.status || ''} | ${e.fm.importance || ''} | ${e.fm.category || ''} | ${e.fm.found || ''} | ${e.fm['addressed-date'] || e.fm['addressed_date'] || ''} |\n`;
    }
    writeFileSync(join(JDIR, `${fname}.md`), v);
  }
}

// ── Journal status board (agent-facing) ──────────────────────────────────────
function journalReport(corpus) {
  const entries = corpus.filter(d => d.kind === 'journal-entry');
  if (!entries.length) { console.log('No journal entries found under docs/journal/entries/.'); return; }
  const maxId = {};
  for (const e of entries) {
    const m = String(e.fm.id || '').match(/^([LOF])(\d+)$/);
    if (m) maxId[m[1]] = Math.max(maxId[m[1]] || 0, Number(m[2]));
  }
  console.log(`NEXT IDs: L${(maxId.L || 0) + 1}, O${(maxId.O || 0) + 1}, F${(maxId.F || 0) + 1}\n`);
  const open = entries.filter(e => e.fm.status === 'open')
    .sort((a, b2) => (IMPORTANCE_ORDER[a.fm.importance] ?? 9) - (IMPORTANCE_ORDER[b2.fm.importance] ?? 9));
  console.log(`OPEN (${open.length}):`);
  for (const e of open) console.log(`  [${e.fm.importance}] ${e.fm.id} ${e.fm.title}  (${e.fm.category}, found ${e.fm.found})`);
  const byStatus = {}, byCat = {};
  for (const e of entries) {
    byStatus[e.fm.status] = (byStatus[e.fm.status] || 0) + 1;
    byCat[e.fm.category] = (byCat[e.fm.category] || 0) + 1;
  }
  console.log(`\nBY STATUS: ${Object.entries(byStatus).map(([k, v]) => `${k}=${v}`).join('  ')}`);
  console.log(`BY CATEGORY: ${Object.entries(byCat).sort((a, b2) => b2[1] - a[1]).map(([k, v]) => `${k}=${v}`).join('  ')}`);
  const recent = entries.filter(e => e.fm['addressed-date'])
    .sort((a, b2) => String(b2.fm['addressed-date']).localeCompare(String(a.fm['addressed-date']))).slice(0, 5);
  if (recent.length) {
    console.log(`\nRECENTLY ADDRESSED:`);
    for (const e of recent) console.log(`  ${e.fm['addressed-date']} ${e.fm.id} ${e.fm.title}`);
  }
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
  const STATUSES = new Set(['open', 'addressed', 'adopted', 'monitoring', 'superseded']);
  for (const d of corpus) {
    if (d.kind === 'journal-entry') {
      for (const req of ['id', 'kind', 'title', 'found', 'status', 'importance', 'category']) {
        if (!d.fm[req]) problems.push(`JOURNAL META ${d.name} (missing '${req}')`);
      }
      if (d.fm.status && !STATUSES.has(d.fm.status)) problems.push(`JOURNAL META ${d.name} (bad status '${d.fm.status}')`);
      if (d.fm.status === 'addressed' && !d.fm['addressed-by']) problems.push(`JOURNAL META ${d.name} (addressed but no 'addressed-by')`);
      continue;
    }
    if (d.kind === 'feature') {
      // Schema per .claude/agents/content-librarian.md — distinct from the wiki
      // schema below (no 'type', no References section expected here).
      for (const req of ['feature', 'code', 'verified']) {
        if (!d.fm[req]) problems.push(`FEATURE META ${d.name} (missing '${req}')`);
      }
      if (d.fm.feature && d.fm.feature !== d.name) problems.push(`FEATURE META ${d.name} (frontmatter 'feature: ${d.fm.feature}' does not match filename)`);
      continue;
    }
    if (d.kind !== 'wiki') continue; // full schema enforced only on graph pages
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
else if (arg === '--journal') journalReport(corpus);
else if (arg) search(corpus, arg);
else console.log('usage: wiki-search.mjs "query" | --index | --lint | --journal');
