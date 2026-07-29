// Enforces: INV-62 — product.md §5 (Graphic quality / "typing unlocks the world")
// + §Word Length (EXPERIENCE "ages with the player"), transitions.md (L25 finale
// "You built this"), js/finale-quote.js's own header comment. Verbatim text ground
// truth: research/wiki/culture/hacker-manifesto.md "Verbatim excerpts".
//
// The Level 25 finale is a GUARANTEED capstone whose length escalates by the
// EXPERIENCE tier (getWinRatio). This suite renders finale-quote.js's promises
// executable at the pure-data layer: FOUR distinct cumulative tiers (WIZARD is its
// own ordered set — the manifesto's near-entire closing passage, one sentence
// intentionally omitted); every token of every line at every tier is typeable with
// exactly Level 25's unlocked-key closure (derived from the game's own curriculum
// data, never hand-copied — same construction as INV-20/INV-56), INCLUDING the
// straight-ASCII apostrophe tokens in the WIZARD lines; ellipses are three ASCII
// periods; the omitted "atomic bombs" sentence never appears; and joining a tier's
// lines reproduces the canonical verbatim excerpt (no wording drift). The win-gate
// guarantee itself is INV-63 (engine, L2).

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../../js/levels.js';
import {
  FINALE_EXCERPT_1, FINALE_EXCERPT_2, FINALE_EXCERPT_3, FINALE_EXCERPT_4,
  FINALE_EXCERPT_2W, FINALE_EXCERPT_5, FINALE_EXCERPT_6, FINALE_EXCERPT_7,
  FINALE_LINES_1, FINALE_LINES_2, FINALE_LINES_3, FINALE_LINES_4,
  FINALE_LINES_2W, FINALE_LINES_5, FINALE_LINES_6, FINALE_LINES_7,
  finaleLinesForRatio, lineToTokens, finaleLineMatches,
} from '../../js/finale-quote.js';

// The WIZARD (winRatio 3.5) tier composes its OWN ordered set: sentence 1, the
// FULL belonging line (2W, not truncated 2), then the closing passage 3–7. One
// sentence ("atomic bombs / wage wars / murder") is intentionally omitted.
const WIZARD_EXPECTED = [
  ...FINALE_LINES_1, ...FINALE_LINES_2W, ...FINALE_LINES_3, ...FINALE_LINES_4,
  ...FINALE_LINES_5, ...FINALE_LINES_6, ...FINALE_LINES_7,
];

// Every line group + its canonical excerpt (for the join-fidelity test).
const GROUP_EXCERPTS = [
  [FINALE_LINES_1, FINALE_EXCERPT_1],
  [FINALE_LINES_2, FINALE_EXCERPT_2],
  [FINALE_LINES_2W, FINALE_EXCERPT_2W],
  [FINALE_LINES_3, FINALE_EXCERPT_3],
  [FINALE_LINES_4, FINALE_EXCERPT_4],
  [FINALE_LINES_5, FINALE_EXCERPT_5],
  [FINALE_LINES_6, FINALE_EXCERPT_6],
  [FINALE_LINES_7, FINALE_EXCERPT_7],
];
const ALL_LINE_GROUPS = GROUP_EXCERPTS.map(([g]) => g);
const ALL_EXCERPTS = GROUP_EXCERPTS.map(([, e]) => e);
const ALL_LINES = ALL_LINE_GROUPS.flat();

// ── Level 25 unlocked-key closure, built from LEVELS itself (STRATEGY §2:
//    expected values derive from the game's own data, never hand-copied). A
//    capital letter needs both its base key AND Shift's unlock level; a space
//    needs Space's unlock level; the apostrophe needs the Level-23 key. ──
function buildClosure() {
  const seen = new Set();
  const levelNumbers = Object.keys(LEVELS).map(Number).sort((a, b) => a - b);
  const byLevel = {};
  for (const lvl of levelNumbers) {
    for (const k of LEVELS[lvl].newKeys || []) seen.add(k);
    byLevel[lvl] = new Set(seen);
  }
  return byLevel;
}
const closureByLevel = buildClosure();
const L25 = closureByLevel[25];
const SHIFT_UNLOCKED_AT_25 = L25.has('Shift');

// Assert a single finale-line token is typeable with the Level 25 closure.
function assertTokenTypeable(token, ctx) {
  assert.equal(typeof token, 'string');
  assert.equal(token.length >= 1, true, `${ctx}: empty token`);
  if (token === ' ') {
    assert.ok(L25.has(' '), `${ctx}: Space is unlocked at Level 25`);
    return;
  }
  if (token >= 'A' && token <= 'Z') {
    // A capital requires BOTH its base key and Shift (exact-case engine rule).
    assert.ok(SHIFT_UNLOCKED_AT_25, `${ctx}: Shift is unlocked at Level 25`);
    assert.ok(L25.has(token.toLowerCase()),
      `${ctx}: base key "${token.toLowerCase()}" for capital "${token}" is in the L25 closure`);
    return;
  }
  assert.ok(L25.has(token),
    `${ctx}: token "${token}" is in the Level 25 unlocked-key closure`);
}

describe('finale-quote.js — module shape', () => {
  test('exports every tier line array, excerpt string, and pure helper', () => {
    for (const arr of ALL_LINE_GROUPS) {
      assert.ok(Array.isArray(arr) && arr.length > 0);
      assert.ok(arr.every(l => typeof l === 'string' && l.length > 0));
    }
    for (const e of ALL_EXCERPTS) assert.equal(typeof e, 'string');
    assert.equal(typeof finaleLinesForRatio, 'function');
    assert.equal(typeof lineToTokens, 'function');
    assert.equal(typeof finaleLineMatches, 'function');
  });
});

describe('INV-62 — FOUR distinct cumulative tiers, one per EXPERIENCE level', () => {
  // The four EXPERIENCE tiers → their exact expected line arrays. 1/1.5/2.25 are
  // pure cumulative; WIZARD is its own ordered set (full belonging line + closing).
  const EXPECTED = {
    1:    [...FINALE_LINES_1],
    1.5:  [...FINALE_LINES_1, ...FINALE_LINES_2],
    2.25: [...FINALE_LINES_1, ...FINALE_LINES_2, ...FINALE_LINES_3],
    3.5:  WIZARD_EXPECTED,
  };

  for (const [ratio, expected] of Object.entries(EXPECTED)) {
    test(`winRatio ${ratio} returns exactly its expected line set`, () => {
      const lines = finaleLinesForRatio(Number(ratio));
      assert.equal(lines.length, expected.length, `winRatio ${ratio} line count`);
      lines.forEach((toks, i) => assert.deepEqual(toks, lineToTokens(expected[i]),
        `winRatio ${ratio} line ${i}`));
    });
  }

  test('all FOUR EXPERIENCE tiers return DISTINCT, strictly-increasing line counts', () => {
    const counts = [1, 1.5, 2.25, 3.5].map(r => finaleLinesForRatio(r).length);
    for (let i = 1; i < counts.length; i++) {
      assert.ok(counts[i] > counts[i - 1],
        `tier ${i} count (${counts[i]}) must exceed tier ${i - 1} (${counts[i - 1]})`);
    }
    assert.equal(new Set(counts).size, 4, 'four distinct lengths');
    // WIZARD types the near-whole closing passage — decisively the longest.
    assert.ok(counts[3] >= 30, `WIZARD is a long passage (got ${counts[3]} lines)`);
  });

  test('1 ⊂ 1.5 ⊂ 2.25 are exact prefixes; WIZARD starts with sentence 1 but uses the FULL belonging line', () => {
    const t1 = finaleLinesForRatio(1);
    const t15 = finaleLinesForRatio(1.5);
    const t225 = finaleLinesForRatio(2.25);
    const t35 = finaleLinesForRatio(3.5);
    // Lower tiers are exact prefixes of each other.
    t1.forEach((toks, i) => assert.deepEqual(t15[i], toks, `1.5 preserves 1 line ${i}`));
    t15.forEach((toks, i) => assert.deepEqual(t225[i], toks, `2.25 preserves 1.5 line ${i}`));
    // WIZARD begins with sentence 1 exactly...
    t1.forEach((toks, i) => assert.deepEqual(t35[i], toks, `WIZARD preserves sentence 1 line ${i}`));
    assert.ok(t35.length > t225.length, 'WIZARD is longer than HOTSHOT');
    // ...but it uses the FULL belonging line (2W), NOT the truncated tier-2 final
    // "bias..." line — so it is NOT an exact array-prefix extension of 2.25.
    const truncatedTail = lineToTokens(FINALE_LINES_2[FINALE_LINES_2.length - 1]); // "bias..."
    const wizardHasTruncatedTail = t35.some(l => finaleLineMatches(l, truncatedTail));
    assert.equal(wizardHasTruncatedTail, false,
      'WIZARD must NOT contain the truncated "bias..." line — it uses the full belonging line');
    // And it DOES contain the full belonging line's distinctive tail.
    const fullTail = lineToTokens('call us');
    assert.ok(t35.some(l => finaleLineMatches(l, fullTail)),
      'WIZARD contains the full belonging line ("...and you call us criminals.")');
  });

  test('the delicate "criminal / curiosity" content is age-gated to HOTSHOT (2.25) and above', () => {
    // Absent at winRatio 1 and 1.5; present at 2.25 and 3.5.
    const t3Only = FINALE_LINES_3.map(lineToTokens);
    const present = (lines, target) => lines.some(l => finaleLineMatches(l, target));
    for (const r of [1, 1.5]) {
      const lines = finaleLinesForRatio(r);
      for (const target of t3Only) {
        assert.equal(present(lines, target), false,
          `Tier-3 line must be absent at winRatio ${r}: ${target.join('')}`);
      }
    }
    for (const r of [2.25, 3.5]) {
      const lines = finaleLinesForRatio(r);
      for (const target of t3Only) {
        assert.equal(present(lines, target), true,
          `Tier-3 line must be present at winRatio ${r}: ${target.join('')}`);
      }
    }
  });

  test('the WIZARD-only closing passage (sentences 4–7) appears ONLY at winRatio 3.5', () => {
    // "My crime is that" is DELIBERATELY shared across sentences 3/4/5 (the
    // manifesto repeats the phrase verbatim); the engine's per-index matched flags
    // handle duplicates. So prove age-gating on the WIZARD sub-lines UNIQUE to the
    // top tier (not present in any 1/1.5/2.25 line group).
    const lowerLines = new Set([...FINALE_LINES_1, ...FINALE_LINES_2, ...FINALE_LINES_3]);
    const wizardUnique = [...FINALE_LINES_2W, ...FINALE_LINES_4, ...FINALE_LINES_5,
      ...FINALE_LINES_6, ...FINALE_LINES_7].filter(l => !lowerLines.has(l)).map(lineToTokens);
    assert.ok(wizardUnique.length >= 20, 'WIZARD adds many distinctive lines');
    const present = (lines, target) => lines.some(l => finaleLineMatches(l, target));
    for (const r of [1, 1.5, 2.25]) {
      const lines = finaleLinesForRatio(r);
      for (const target of wizardUnique) {
        assert.equal(present(lines, target), false,
          `WIZARD-unique line must be absent below WIZARD at winRatio ${r}: ${target.join('')}`);
      }
    }
    const wizard = finaleLinesForRatio(3.5);
    for (const target of wizardUnique) {
      assert.equal(present(wizard, target), true,
        `WIZARD-unique line must be present at WIZARD (3.5): ${target.join('')}`);
    }
  });

  test('a garbage winRatio degrades to the default sentence-1-only set', () => {
    for (const bad of [undefined, null, NaN, 'x', 0, -1]) {
      const lines = finaleLinesForRatio(bad);
      assert.equal(lines.length, FINALE_LINES_1.length, `garbage ${String(bad)} → sentence 1`);
    }
  });
});

describe('INV-62 — every finale token is typeable at Level 25 (incl. apostrophe)', () => {
  test('every token of every line at every tier is in the L25 unlocked-key closure', () => {
    for (const r of [1, 1.5, 2.25, 3.5]) {
      finaleLinesForRatio(r).forEach((toks, li) => {
        toks.forEach((tok, ti) => assertTokenTypeable(tok, `winRatio ${r} line ${li} token ${ti}`));
      });
    }
  });

  test('the WIZARD apostrophe token is a straight ASCII "\'" and is unlocked at L25', () => {
    // The apostrophe is the Level-23 key — it must be in the L25 closure.
    assert.ok(L25.has("'"), "the straight apostrophe key is unlocked by Level 25");
    // WIZARD (and ONLY WIZARD) contains apostrophe tokens; each is exactly 0x27.
    const wizardTokens = finaleLinesForRatio(3.5).flat();
    const apos = wizardTokens.filter(t => t === "'");
    assert.ok(apos.length >= 2, "WIZARD contains the can't / we're apostrophes");
    for (const a of apos) assert.equal(a.charCodeAt(0), 0x27, 'apostrophe is straight ASCII 0x27');
  });

  test('finaleLinesForRatio returns single-character tokens (engine contract)', () => {
    for (const r of [1, 1.5, 2.25, 3.5]) {
      for (const toks of finaleLinesForRatio(r)) {
        for (const tok of toks) {
          assert.equal(tok.length, 1, `token "${tok}" is a single character`);
        }
      }
    }
  });
});

describe('INV-62 — verbatim fidelity (no wording drift, no smart quotes, omission honored)', () => {
  test('ellipses are exactly three ASCII periods; no Unicode ellipsis anywhere', () => {
    for (const line of ALL_LINES) {
      assert.equal(line.includes('…'), false, `no Unicode … in "${line}"`);
      const runs = line.match(/\.+/g) || [];
      for (const run of runs) {
        assert.ok(run.length === 1 || run.length === 3,
          `period run "${run}" in "${line}" is 1 (period) or 3 (ellipsis)`);
      }
    }
  });

  test('no CURLY apostrophes anywhere; straight apostrophes ONLY in the WIZARD lines', () => {
    const everything = [...ALL_EXCERPTS, ...ALL_LINES].join('\n');
    assert.equal(/[‘’]/.test(everything), false, 'no curly apostrophes anywhere');
    // Tiers 1/1.5/2.25 (sentences 1–3 + truncated belonging) carry NO apostrophes.
    const lowerText = [...FINALE_LINES_1, ...FINALE_LINES_2, ...FINALE_LINES_3].join('\n');
    assert.equal(lowerText.includes("'"), false, 'no apostrophes below WIZARD');
    // WIZARD's closing lines DO carry straight apostrophes (can't, we're).
    const wizardText = [...FINALE_LINES_7].join('\n');
    assert.ok(wizardText.includes("'"), 'WIZARD closing line carries the straight apostrophes');
  });

  test('joining each line group with single spaces reproduces its canonical excerpt', () => {
    for (const [group, excerpt] of GROUP_EXCERPTS) {
      assert.equal(group.join(' '), excerpt);
    }
  });

  test('the omitted "atomic bombs / wage wars / murder" sentence never appears at any tier', () => {
    const forbidden = ['atomic', 'bomb', 'wage', 'war', 'murder', 'cheat'];
    for (const r of [1, 1.5, 2.25, 3.5]) {
      const text = finaleLinesForRatio(r).map(toks => toks.join('')).join(' ').toLowerCase();
      for (const w of forbidden) {
        assert.equal(text.includes(w), false,
          `omitted-sentence word "${w}" must never appear (winRatio ${r})`);
      }
    }
  });

  test('capitals are only sentence/word openers (T W Y I M) — never mid-word SHOUTING', () => {
    const caps = new Set();
    for (const line of ALL_LINES) {
      for (const ch of line) if (ch >= 'A' && ch <= 'Z') caps.add(ch);
    }
    assert.deepEqual([...caps].sort(), ['I', 'M', 'T', 'W', 'Y']);
  });
});

describe('finaleLineMatches — value equality', () => {
  test('matches identical token arrays and rejects any mismatch', () => {
    const line = lineToTokens('the baud.');
    assert.equal(finaleLineMatches(['t','h','e',' ','b','a','u','d','.'], line), true);
    assert.equal(finaleLineMatches(['t','h','e',' ','b','a','u','d'], line), false); // shorter
    assert.equal(finaleLineMatches(['t','h','e',' ','b','a','u','d','!'], line), false); // last differs
    assert.equal(finaleLineMatches('the baud.'.split(''), 'the baud.'), true); // raw string arg
    assert.equal(finaleLineMatches('nope', line), false);
    // An apostrophe line round-trips too.
    assert.equal(finaleLineMatches("but you can't".split(''), "but you can't"), true);
  });
});
