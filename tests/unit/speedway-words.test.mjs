// Enforces: INV-87 (the Act 7 content floor) and the AUTHORING half of
// INV-80/INV-82 (no placement, finish order, ranking or defeat string exists
// anywhere in the act) — STRATEGY.md §5 "Act 7 — THE SPEEDWAY".
//
// Design sources (the test asserts what THESE say, never what words.js says):
//   - docs/specs/act7-speed-racing.md §5.7 "Word content", which names this lint
//     itself: *"Authoring lint (static test): no word in any Act 7 pool matches
//     js/word-blocklist.json's BASE_WORDS (exact) or the never-word list
//     (substring)"*, and gives the never-word list verbatim — crash, wreck,
//     collision, burnout, spin out, DNF, dead/die/kill — *"absolutely excluded
//     from every Act 7 pool and every line of Act 7 prose"*.
//   - spec §5.4/§5.5/§7: *"No placement, no position number, no lap-count
//     comparison, no 'P7/12', no finish order, anywhere in the act, in any
//     string, ever"*; the ghost is *"never RIVAL, never OPPONENT, never a name"*.
//   - spec §7 + security.md rule 6: Act 7 *"makes zero fetches"*.
//   - product.md §Word Length: *"winnability is never traded for it"* — a length
//     setting is a best-effort suggestion, never a wall.
//   - CLAUDE.md §Levels: Act 7 sits behind a door that only opens once the whole
//     keyboard is taught, so every pool word must be typeable with Level 25's
//     cumulative key closure (built here from js/levels.js, the game's own data).
//
// The never-word and blocklist expectations are transcribed from the SPEC, not
// imported from js/speedway/words.js's own `NEVER_WORDS` — a test that imported
// the list it is checking against would agree with any future edit to it.
//
// WHY THIS SITS IN tests/unit/: it is authoring-lint shaped (an L0 file scan),
// but tests/static/ belongs to another lane. Placement is bookkeeping; the
// assertions are the spec's.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';
import { installLocalStorageStub } from '../helpers/stubs.mjs';

installLocalStorageStub();   // words.js → settings.js reads storage at first use

const { LEVELS } = await import('../../js/levels.js');
const { BASE_WORDS } = await import('../../js/word-blocklist.js');

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SPEEDWAY_DIR = join(REPO_ROOT, 'js', 'speedway');

// The spec's never-word list, §5.7, verbatim (both spellings of the spin one —
// the spec writes "spin out", a pool word would carry it as "spinout").
const NEVER_WORDS = ['crash', 'wreck', 'collision', 'burnout', 'spin out', 'spinout', 'dnf', 'dead', 'die', 'kill'];

// Placement / finish-order / defeat vocabulary. Matched case-SENSITIVELY in
// UPPERCASE because every player-facing string in this game is drawn in the
// uppercase pixel font — which keeps ordinary lowercase identifiers (`position`,
// a sorted array) out of the lint entirely, so it fires on player-facing text
// and never on implementation shape.
const FORBIDDEN_DISPLAY = [
  'DNF', 'POSITION', 'PLACEMENT', 'LAST PLACE', 'RANKING', 'RANKED', 'LEADERBOARD',
  'FINISH ORDER', 'YOU LOSE', 'YOU LOST', 'LOSER', 'DEFEAT', 'ELIMINATED',
  'DISQUALIFIED', 'RETIRED', 'GAME OVER', 'RIVAL', 'OPPONENT',
];
// "P7/12", "3RD PLACE", "1ST OF 12", "OUT OF 12" — the shapes a placement takes.
const PLACEMENT_SHAPES = [
  /\bP\d{1,2}\s*\/\s*\d{1,2}\b/,
  /\b\d{1,2}\s*(?:ST|ND|RD|TH)\s+(?:PLACE|OF)\b/,
  /\bOUT OF \d{1,2}\b/,
];
// security.md rule 6 — Act 7 talks to nothing, not even /api/*.
const NETWORK_SINKS = [
  /\bfetch\s*\(/, /\bXMLHttpRequest\b/, /\bWebSocket\b/, /\bEventSource\b/,
  /navigator\.sendBeacon/, /https?:\/\//,
];
const DOM_SINKS = [/\.innerHTML\s*=/, /insertAdjacentHTML/, /\.outerHTML\s*=/, /document\.write/, /\beval\s*\(/, /new Function\s*\(/];

// Level 25's cumulative unlocked-key closure, from the game's own curriculum.
const L25_CLOSURE = (() => {
  const seen = new Set();
  for (const lvl of Object.keys(LEVELS).map(Number).sort((a, b) => a - b)) {
    for (const k of LEVELS[lvl].newKeys || []) seen.add(k);
  }
  return seen;
})();

async function listSpeedwayFiles(dir = SPEEDWAY_DIR) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return null; }
  const out = [];
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await listSpeedwayFiles(p) || []));
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}

// Extract string/template literals so the lint reads authored TEXT rather than
// code shape. Comments are stripped first: design prose legitimately NAMES the
// forbidden things ("no DNF", "never RIVAL").
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}
function stringLiterals(src) {
  const out = [];
  const re = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
  let m;
  while ((m = re.exec(src)) !== null) out.push(m[1] ?? m[2] ?? m[3] ?? '');
  return out;
}
// A module's OWN deny-list entry is an exact lowercase never-word literal
// ('crash'), never player-facing prose — player text is drawn uppercase. Listing
// a word in order to forbid it is the opposite of shipping it.
const isDenyListEntry = (lit) => NEVER_WORDS.includes(lit);

async function tryImport(p) { try { return await import(p); } catch { return null; } }

const FILES = await listSpeedwayFiles();
const wordsMod = await tryImport(join(SPEEDWAY_DIR, 'words.js'));
const POOL_WORDS = wordsMod && typeof wordsMod.allWords === 'function'
  ? wordsMod.allWords() : null;

function pendWords(t) {
  if (POOL_WORDS) return false;
  t.todo(wordsMod
    ? 'pending Act 7 build: js/speedway/words.js exports no allWords() to lint'
    : 'pending Act 7 build: js/speedway/words.js is not built yet (sibling lane)');
  return true;
}
function pendFiles(t) {
  if (FILES && FILES.length) return false;
  t.todo('pending Act 7 build: js/speedway/ holds no modules yet (sibling lane)');
  return true;
}

describe('INV-87 — every Act 7 word is kid-safe (spec §5.7 authoring lint)', () => {
  test('no pool word is a BASE_WORDS floor word (exact) or carries a never-word (substring)', (t) => {
    if (pendWords(t)) return;
    assert.ok(POOL_WORDS.length > 0, 'the curated bank is not empty');
    const floor = new Set(BASE_WORDS.map((w) => String(w).toLowerCase()));
    for (const word of POOL_WORDS) {
      const w = String(word).toLowerCase();
      assert.ok(!floor.has(w), `Act 7 pool word "${word}" is a BASE_WORDS floor word (js/word-blocklist.json)`);
      const letters = w.replace(/[^a-z]/g, '');
      for (const never of NEVER_WORDS) {
        const needle = never.replace(' ', '');
        assert.ok(!letters.includes(needle),
          `Act 7 pool word "${word}" contains never-word "${never}" — spec §5.7: `
          + '"a racing act that never crashes is the same choice as Missile Command\'s cities that can never be hit"');
      }
    }
  });

  test('every pool word is typeable with the keys the curriculum has taught by Level 25', (t) => {
    if (pendWords(t)) return;
    for (const word of POOL_WORDS) {
      for (const ch of String(word)) {
        const base = /^[A-Z]$/.test(ch) ? ch.toLowerCase() : ch;
        assert.ok(L25_CLOSURE.has(base),
          `Act 7 pool word "${word}" needs key "${ch}", which the 25-level curriculum never teaches`);
      }
    }
  });
});

describe('INV-87 — a length setting can never empty a track (product.md §Word Length: "winnability is never traded for it")', () => {
  test('EVERY (MIN, MAX) the settings UI allows still leaves every track a word to draw', async (t) => {
    if (!wordsMod || typeof wordsMod.poolForTrack !== 'function') {
      t.todo('pending Act 7 build: js/speedway/words.js exports no poolForTrack(track) yet');
      return;
    }
    const { saveSettings, MIN_WORD_LEN_VALUES, MAX_WORD_LEN_VALUES } = await import('../../js/settings.js');
    // Track descriptors span the two lookup axes words.js documents (an explicit
    // per-track pool by id, and the render-tier band) plus a totally unknown
    // track — the fallback path a brand-new Phase-4 station takes on day one.
    const TRACKS = [
      { id: 'monaco-gp', tier: 'ttl' },      // the shortest words in the act
      { id: 'modern-f1', tier: 'modern' },   // the longest
      { id: 'not-built-yet', tier: 'mode7' },
      { id: 'no-tier-either' },
    ];
    for (const min of MIN_WORD_LEN_VALUES) {
      for (const max of MAX_WORD_LEN_VALUES) {
        saveSettings({ minWordLen: min, maxWordLen: max });
        for (const track of TRACKS) {
          const pool = wordsMod.poolForTrack(track);
          assert.ok(Array.isArray(pool) && pool.length > 0,
            `track ${track.id} has NO drawable word at MIN=${min}/MAX=${max} — a settings combination `
            + 'made a track unfinishable, which the One Rule forbids');
        }
      }
    }
    saveSettings({ minWordLen: 0, maxWordLen: 0 }); // back to ANY/ANY
  });
});

describe('INV-80/INV-82 — no placement, finish order, ranking or defeat string exists anywhere in Act 7 (spec §5.4/§5.5/§7)', () => {
  test('no authored string in js/speedway/** names a placement, a rival, or a defeat', async (t) => {
    if (pendFiles(t)) return;
    for (const file of FILES) {
      const src = stripComments(await readFile(file, 'utf8'));
      const where = relative(REPO_ROOT, file);
      for (const lit of stringLiterals(src)) {
        if (isDenyListEntry(lit)) continue;
        for (const bad of FORBIDDEN_DISPLAY) {
          assert.ok(!lit.includes(bad),
            `${where}: the string ${JSON.stringify(lit)} contains "${bad}" — spec §5.4: `
            + '"No placement, no position number... anywhere in the act, in any string, ever"');
        }
        for (const shape of PLACEMENT_SHAPES) {
          assert.ok(!shape.test(lit), `${where}: the string ${JSON.stringify(lit)} reads as a placement`);
        }
        for (const never of NEVER_WORDS) {
          assert.ok(!new RegExp(`\\b${never.replace(' ', '\\s+')}\\b`, 'i').test(lit),
            `${where}: the string ${JSON.stringify(lit)} contains never-word "${never}" `
            + '(spec §5.7: "every line of Act 7 prose")');
        }
      }
    }
  });
});

describe('INV-87 — Act 7 talks to nothing, and adds no DOM sink (security.md rules 1 & 6; spec §7 "not even optionally")', () => {
  test('no js/speedway/** module reaches for the network', async (t) => {
    if (pendFiles(t)) return;
    for (const file of FILES) {
      const src = stripComments(await readFile(file, 'utf8'));
      for (const sink of NETWORK_SINKS) {
        assert.ok(!sink.test(src),
          `${relative(REPO_ROOT, file)} matches ${sink} — Act 7 makes zero network calls: `
          + '"no leaderboard, no sync, no sharing, no /api/*, not even optionally" (spec §7)');
      }
    }
  });

  test('no js/speedway/** module creates a DOM sink or dynamic code (spec §6: "Act 7 draws entirely on canvas")', async (t) => {
    if (pendFiles(t)) return;
    for (const file of FILES) {
      const src = stripComments(await readFile(file, 'utf8'));
      for (const sink of DOM_SINKS) {
        assert.ok(!sink.test(src),
          `${relative(REPO_ROOT, file)} matches ${sink} — Act 7 introduces no DOM sink and no dynamic code`);
      }
    }
  });
});
