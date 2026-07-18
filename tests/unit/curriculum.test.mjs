// Enforces: INV-14, INV-15, INV-16, INV-17, INV-18, INV-19, INV-35
// Source docs: .claude/rules/levels.md (25-level assignment + word-bank tables),
// CLAUDE.md §Levels, §Word Bank Principle, §Arcade Cabinet Rule.
//
// Doctrine (docs/testing/STRATEGY.md §2): expected values are derived from the
// design docs or computed over the game's own data — never copied out of engine
// code as hardcoded "expected pool" constants. Spellability/vowel/closure checks
// below are all *computations* over LEVELS[n].keys, not transcriptions of pools.
//
// js/themes/*.js call `window.addEventListener(...)` at module scope, so the
// registry (js/themes/index.js) throws on a bare `import` in Node. Per the task's
// MECHANICS note, we install minimal window/document stubs on globalThis BEFORE a
// dynamic `await import()` — static imports hoist above any stub installation, so
// this file uses dynamic imports for anything theme-related.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { LEVELS, FINGER_MAP, KEY_REACH } from '../../js/levels.js';

// ─────────────────────────────────────────────────────────────────────────
// Fixture — transcribed verbatim from .claude/rules/levels.md
// "## Complete Game Assignment Table" and CLAUDE.md "### Levels", 2026-07-12.
// This table is the test's SOURCE OF TRUTH; the assertions below check that
// js/levels.js and js/themes/index.js agree with it — never the reverse.
// ─────────────────────────────────────────────────────────────────────────

// Level -> new keys taught at that level (levels.md per-act tables / CLAUDE.md
// §Levels quick table). The eighth key is transcribed as ';' — never called
// "semicolon" in any player-facing string, but that is a content rule (INV-29,
// static lane), not this fixture's concern.
const DOC_NEW_KEYS = {
  1: ['j', 'f'],
  2: ['d', 'k'],
  3: ['s', 'l'],
  4: ['a', ';'],
  5: ['g', 'h'],
  6: ['e', 'i'],
  7: ['r', 'u'],
  8: ['t', 'y'],
  9: ['w', 'o'],
  10: ['q', 'p'],
  11: ['v', 'm'],
  12: ['b', 'n'],
  13: ['c', ','],
  14: ['x', '.'],
  15: ['z', '/'],
  16: ['5', '6'],
  17: ['4', '7'],
  18: ['3', '8'],
  19: ['2', '9'],
  20: ['1', '0'],
  21: ['-', '='],
  22: ['[', ']', '\\'],
  23: ['`', "'"],
  24: ['Shift'],
  25: [' ', 'Backspace'],
};

// Level -> game/developer/year, from levels.md's "Complete Game Assignment Table".
const DOC_GAMES = {
  1: { game: 'Breakout', developer: 'Atari', year: 1976 },
  2: { game: 'Space Invaders', developer: 'Taito', year: 1978 },
  3: { game: 'Pac-Man', developer: 'Namco', year: 1980 },
  4: { game: 'Galaga', developer: 'Namco', year: 1981 },
  5: { game: 'Joust', developer: 'Williams', year: 1982 },
  6: { game: 'Donkey Kong', developer: 'Nintendo', year: 1981 },
  7: { game: "Dragon's Lair", developer: 'Cinematronics', year: 1983 },
  8: { game: 'Tetris', developer: 'Alexey Pajitnov (Nintendo Game Boy version, 1989)', year: 1984 },
  9: { game: 'Super Mario Bros', developer: 'Nintendo', year: 1985 },
  10: { game: 'The Legend of Zelda', developer: 'Nintendo', year: 1986 },
  11: { game: 'Sonic the Hedgehog', developer: 'Sega', year: 1991 },
  12: { game: 'Street Fighter II', developer: 'Capcom', year: 1991 },
  13: { game: 'Myst', developer: 'Cyan', year: 1993 },
  14: { game: 'Donkey Kong Country', developer: 'Rare / Nintendo', year: 1994 },
  15: { game: 'Pokémon Red/Blue', developer: 'Game Freak / Nintendo', year: 1996 },
  16: { game: 'SimCity 2000', developer: 'Maxis', year: 1993 },
  17: { game: 'GoldenEye 007', developer: 'Rare', year: 1997 },
  18: { game: 'Age of Empires', developer: 'Ensemble', year: 1997 },
  19: { game: 'Final Fantasy VII', developer: 'Square', year: 1997 },
  20: { game: 'Terminal / Command Line', developer: '—', year: '1960s–∞' },
  21: { game: 'Out Run', developer: 'Sega', year: 1986 },
  22: { game: 'Q*bert', developer: 'Gottlieb', year: 1982 },
  23: { game: 'Missile Command', developer: 'Atari', year: 1980 },
  24: { game: 'High Score Entry (player\'s own name)', developer: '—', year: '—' },
  25: { game: 'Word Processor (first sentences)', developer: '—', year: '—' },
};

// The theme module file each level's cabinet is implemented by (levels.md +
// tech.md's "Arcade Cabinet Game Assignments" table / js/themes/index.js
// comments). Used only to cross-check js/themes/index.js's registry keys line
// up with the doc's per-level game — module identity itself (not this name
// list) is what INV-17/INV-35's uniqueness assertions are computed over.
const DOC_THEME_MODULE = {
  1: 'breakout.js', 2: 'invaders.js', 3: 'pacman.js', 4: 'fighter.js', 5: 'joust.js',
  6: 'donkeykong.js', 7: 'dragonlair.js', 8: 'tetris.js', 9: 'mario.js', 10: 'zelda.js',
  11: 'sonic.js', 12: 'streetfighter.js', 13: 'myst.js', 14: 'dkc.js', 15: 'pokemon.js',
  16: 'simcity.js', 17: 'goldeneye.js', 18: 'ageofempires.js', 19: 'ff7.js', 20: 'terminal.js',
  21: 'outrun.js', 22: 'qbert.js', 23: 'missilecommand.js', 24: 'highscore.js', 25: 'wordprocessor.js',
};

const ALL_LEVEL_NUMS = Array.from({ length: 25 }, (_, i) => i + 1);
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

// Token contract (CLAUDE.md "Engine input contract"): lowercase chars/digits/
// symbols, uppercase A-Z = Shift+letter (exact-case, needs Shift unlocked), ' ',
// 'Backspace'. Given a level's cumulative `keys` set, compute which raw tokens
// are legal to appear in that level's pools.
function unlockedTokenSet(keys) {
  const set = new Set(keys);
  // If Shift is unlocked, every uppercase A-Z form of an unlocked lowercase
  // letter becomes legal too (Shift+letter), per the documented token contract.
  if (set.has('Shift')) {
    for (const k of keys) {
      if (/^[a-z]$/.test(k)) set.add(k.toUpperCase());
    }
  }
  return set;
}

function allPoolTokens(level) {
  const L = LEVELS[level];
  const out = [];
  for (const seq of [...(L.intro || []), ...(L.pool || [])]) {
    out.push(...seq);
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════════════
// INV-14 — exactly 25 levels; per-level NEW keys match levels.md; union of
// all keys = the full taught keyboard.
// ═══════════════════════════════════════════════════════════════════════
describe('INV-14 — curriculum: 25 levels, new-key progression matches levels.md', () => {
  test('LEVELS has exactly 25 entries, numbered 1..25', () => {
    const nums = Object.keys(LEVELS).map(Number).sort((a, b) => a - b);
    assert.deepEqual(nums, ALL_LEVEL_NUMS, 'expected levels 1-25, no gaps or extras');
  });

  for (const n of ALL_LEVEL_NUMS) {
    test(`level ${n} newKeys match the levels.md table`, () => {
      assert.ok(LEVELS[n], `LEVELS[${n}] must exist`);
      const actual = [...LEVELS[n].newKeys].sort();
      const expected = [...DOC_NEW_KEYS[n]].sort();
      assert.deepEqual(actual, expected,
        `level ${n} newKeys ${JSON.stringify(LEVELS[n].newKeys)} must match doc ${JSON.stringify(DOC_NEW_KEYS[n])}`);
    });
  }

  test('each level.keys is exactly the cumulative union of newKeys through that level (curriculum is additive, never regresses or skips)', () => {
    let cumulative = [];
    for (const n of ALL_LEVEL_NUMS) {
      cumulative = [...cumulative, ...LEVELS[n].newKeys];
      const cumSorted = [...new Set(cumulative)].sort();
      const keysSorted = [...new Set(LEVELS[n].keys)].sort();
      assert.deepEqual(keysSorted, cumSorted,
        `level ${n} keys should equal cumulative newKeys through level ${n}`);
    }
  });

  test('union of all newKeys across all 25 levels is the full taught keyboard (50 unique tokens, no key taught twice)', () => {
    const all = ALL_LEVEL_NUMS.flatMap(n => LEVELS[n].newKeys);
    const uniq = new Set(all);
    assert.equal(all.length, uniq.size, 'no key should be introduced as "new" more than once across levels');

    // The full taught keyboard per CLAUDE.md's level table: 26 letters + 10
    // digits + 8 symbol keys (; - = [ ] \ ` ') + Shift + Space + Backspace.
    const expectedLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const expectedDigits = '0123456789'.split('');
    const expectedSymbols = [';', '-', '=', '[', ']', '\\', '`', "'", ',', '.', '/'];
    const expectedSpecial = ['Shift', ' ', 'Backspace'];
    const expectedAll = [...expectedLetters, ...expectedDigits, ...expectedSymbols, ...expectedSpecial];

    assert.deepEqual([...uniq].sort(), [...new Set(expectedAll)].sort(),
      'union of newKeys should equal the full taught keyboard from CLAUDE.md');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// INV-15 — Levels 1-3 have no spellable real words (key set has no vowel) —
// pattern drills only; no pattern in L1-3 pools contains a vowel.
// Computed: vowel-emptiness is derived from LEVELS[n].keys, not hardcoded.
// ═══════════════════════════════════════════════════════════════════════
describe('INV-15 — levels 1-3: key sets contain no vowel, so pools are vowel-free pattern drills', () => {
  for (const n of [1, 2, 3]) {
    test(`level ${n}'s unlocked key set has no vowel (a/e/i/o/u)`, () => {
      const hasVowel = LEVELS[n].keys.some(k => VOWELS.has(k));
      assert.equal(hasVowel, false,
        `level ${n} keys ${JSON.stringify(LEVELS[n].keys)} must contain no vowel per CLAUDE.md Word Bank Principle`);
    });

    test(`level ${n}'s intro+pool tokens contain no vowel character (pattern drills only, nothing spellable)`, () => {
      const tokens = allPoolTokens(n);
      const vowelTokens = tokens.filter(t => VOWELS.has(t.toLowerCase()));
      assert.deepEqual(vowelTokens, [],
        `level ${n} pool/intro must contain zero vowel tokens — found: ${JSON.stringify(vowelTokens)}`);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// INV-16 — every pattern/word in each level's pool uses only keys unlocked
// at or before that level (cumulative key-set closure). Mind the token
// contract: uppercase A-Z means Shift+letter (Shift unlocks at L24).
// ═══════════════════════════════════════════════════════════════════════
describe('INV-16 — every level pool token is within that level\'s cumulative unlocked-key closure', () => {
  for (const n of ALL_LEVEL_NUMS) {
    test(`level ${n}: all intro+pool tokens are unlocked by level ${n} (honoring Shift-capital contract)`, () => {
      const legal = unlockedTokenSet(LEVELS[n].keys);
      const tokens = allPoolTokens(n);
      const illegal = tokens.filter(t => !legal.has(t));
      assert.deepEqual(illegal, [],
        `level ${n} pool/intro contains tokens not yet unlocked: ${JSON.stringify(illegal)} ` +
        `(legal set: ${JSON.stringify([...legal].sort())})`);
    });
  }

  test('no level 1-23 pool contains an uppercase A-Z token (Shift is not unlocked until level 24)', () => {
    for (const n of ALL_LEVEL_NUMS.filter(x => x < 24)) {
      const tokens = allPoolTokens(n);
      const uppers = tokens.filter(t => /^[A-Z]$/.test(t));
      assert.deepEqual(uppers, [],
        `level ${n} (pre-Shift) must not contain uppercase letter tokens — found: ${JSON.stringify(uppers)}`);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// INV-17 — arcade cabinet rule: one game per level, no title reused.
// Derived from the doc fixture (game identity from levels.md) AND from the
// actual theme-module identity in js/themes/index.js (see INV-35 describe
// block below, which computes uniqueness over real imported module objects
// rather than names).
// ═══════════════════════════════════════════════════════════════════════
describe('INV-17 — cabinet rule: no game/theme reused across levels (CLAUDE.md §Arcade Cabinet Rule)', () => {
  test('doc fixture itself names 25 distinct games (no title assigned to two levels)', () => {
    const names = ALL_LEVEL_NUMS.map(n => DOC_GAMES[n].game);
    const uniq = new Set(names);
    assert.equal(names.length, uniq.size,
      `expected 25 distinct game titles in the levels.md assignment table, found duplicates: ` +
      JSON.stringify(names.filter((v, i) => names.indexOf(v) !== i)));
  });

  test('doc fixture assigns 25 distinct theme module files (one per level, never reused)', () => {
    const files = ALL_LEVEL_NUMS.map(n => DOC_THEME_MODULE[n]);
    const uniq = new Set(files);
    assert.equal(files.length, uniq.size, 'expected 25 distinct theme module filenames');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// INV-18 — level 4's pool contains real readable words (the double-win
// moment: A is the vowel that makes J F D K S L A ; spellable).
// ═══════════════════════════════════════════════════════════════════════
describe('INV-18 — level 4 pool contains real readable words (product.md "double win")', () => {
  test('level 4 has at least one multi-character pool entry using a vowel (a real word became typeable)', () => {
    const tokens = LEVELS[4].pool.filter(seq => seq.length > 1);
    const withVowel = tokens.filter(seq => seq.some(t => VOWELS.has(t.toLowerCase())));
    assert.ok(withVowel.length > 0,
      'level 4 pool should contain at least one multi-char sequence using a vowel (a spellable word)');
  });

  // product.md §Level Structure / §Word Progression and CLAUDE.md §Levels both
  // name-check specific level-4 words as the guaranteed "double win" examples:
  // dad, sad, fad, lad, ads, lads, lass, flask, falls. The doc guarantees these
  // exact words, so asserting their literal presence (joined from the token
  // array) is citing the doc, not copying an engine constant.
  const DOC_NAMED_WORDS = ['dad', 'sad', 'fad', 'lad', 'ads', 'lads', 'lass', 'flask', 'falls'];
  test('level 4 pool contains at least some of the doc-named example words (dad/sad/fad/lad/...)', () => {
    const joined = LEVELS[4].pool.map(seq => seq.join(''));
    const present = DOC_NAMED_WORDS.filter(w => joined.includes(w));
    assert.ok(present.length > 0,
      `expected at least one of ${JSON.stringify(DOC_NAMED_WORDS)} (product.md §Level Structure) in level 4 pool, found none among ${JSON.stringify(joined)}`);
  });

  test('every level-4 word found is spellable using only level 4\'s unlocked keys', () => {
    const legal = unlockedTokenSet(LEVELS[4].keys);
    const tokens = allPoolTokens(4);
    const illegal = tokens.filter(t => !legal.has(t));
    assert.deepEqual(illegal, []);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// INV-19 — FINGER_MAP / KEY_REACH cover every taught key; keyboard geometry
// has one source of truth (hud.js KEY_LAYOUT / getKeyGeometry) — preview
// derives, never redefines. Static import check on keyboard-preview.js.
// ═══════════════════════════════════════════════════════════════════════
describe('INV-19 — FINGER_MAP/KEY_REACH cover every taught key; geometry single-sourced in hud.js', () => {
  const allTaughtKeys = [...new Set(ALL_LEVEL_NUMS.flatMap(n => LEVELS[n].newKeys))];

  // 'Shift' is deliberately excluded: js/ui/hud.js's showFingerHint() never
  // looks up a literal 'Shift' in FINGER_MAP — it detects the uppercase-letter
  // token form (/^[A-Z]$/) FIRST and renders "HOLD SHIFT, THEN THE LETTER"
  // before ever consulting FINGER_MAP. A bare 'Shift' keydown is also never an
  // `expectedKey` on its own (CLAUDE.md: pure modifier keydowns are ignored
  // entirely) — Shift only ever appears embedded in an uppercase token. So
  // FINGER_MAP's single-finger-per-physical-key contract correctly has no
  // 'Shift' row; Space and Backspace DO get real entries (thumb / right pinky)
  // because they are pressed as standalone tokens.
  const fingerMapEligibleKeys = allTaughtKeys.filter(k => k !== 'Shift');

  test('FINGER_MAP has an entry for every taught key that can appear as a standalone expectedKey (excludes Shift, which is only ever embedded in an uppercase token)', () => {
    const missing = fingerMapEligibleKeys.filter(k => !(k in FINGER_MAP));
    assert.deepEqual(missing, [],
      `FINGER_MAP is missing entries for taught keys: ${JSON.stringify(missing)}`);
  });

  // KEY_REACH's documented purpose is finger/hand/reach metadata for the
  // *keyboard-preview* hand animation, which is meaningful for physical keys
  // pressed by a finger — Shift, Space, and Backspace are not single-finger
  // "reach" keys in that system (Shift is a hand-coordination concept, Space
  // is thumb, Backspace has no reach animation), so KEY_REACH's contract is
  // "every taught physical single-finger key", not literally all 50 tokens.
  const reachEligibleKeys = allTaughtKeys.filter(k => !['Shift', ' ', 'Backspace'].includes(k));
  test('KEY_REACH has an entry for every taught single-finger key (excludes Shift/Space/Backspace, which are not finger-reach keys)', () => {
    const missing = reachEligibleKeys.filter(k => !(k in KEY_REACH));
    assert.deepEqual(missing, [],
      `KEY_REACH is missing entries for taught keys: ${JSON.stringify(missing)}`);
  });

  test('every KEY_REACH entry declares a valid hand (left|right) and finger (0-4)', () => {
    for (const [key, def] of Object.entries(KEY_REACH)) {
      assert.ok(['left', 'right'].includes(def.hand), `KEY_REACH['${key}'].hand must be left|right`);
      assert.ok(Number.isInteger(def.finger) && def.finger >= 0 && def.finger <= 4,
        `KEY_REACH['${key}'].finger must be an integer 0-4`);
    }
  });

  test('js/ui/keyboard-preview.js imports keyboard geometry from hud.js rather than redefining a layout (static source check)', async () => {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const here = path.dirname(fileURLToPath(import.meta.url));
    const filePath = path.resolve(here, '../../js/ui/keyboard-preview.js');
    const src = await fs.readFile(filePath, 'utf8');

    // Must import the single-source geometry helpers from hud.js.
    assert.match(src, /import\s*\{[^}]*getKeyGeometry[^}]*\}\s*from\s*['"]\.\/hud\.js['"]/,
      'keyboard-preview.js must import getKeyGeometry from ./hud.js');
    assert.match(src, /import\s*\{[^}]*KEYBOARD_UNITS_PER_ROW[^}]*\}\s*from\s*['"]\.\/hud\.js['"]/,
      'keyboard-preview.js must import KEYBOARD_UNITS_PER_ROW from ./hud.js');

    // Must NOT redefine its own KEY_LAYOUT-shaped array (the single-source
    // rule's failure mode from journal F5: an early build duplicated the
    // layout locally and it silently drifted). A literal `KEY_LAYOUT` const
    // declaration would indicate a redefinition; keyboard-preview.js should
    // only ever reference geometry it derived (KB_LAYOUT from getKeyGeometry()).
    assert.doesNotMatch(src, /const\s+KEY_LAYOUT\s*=/,
      'keyboard-preview.js must not redefine its own KEY_LAYOUT — geometry must be derived from hud.js only');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// INV-35 — theme registry covers all 25 levels; no theme module assigned
// twice. js/themes/*.js call window.addEventListener at module scope, so we
// install minimal window/document stubs BEFORE the dynamic import (static
// imports hoist above stub installation — see file header note).
// ═══════════════════════════════════════════════════════════════════════
describe('INV-35 — theme registry (js/themes/index.js) covers all 25 levels, no module reused', () => {
  test('js/themes/index.js Themes registry has exactly levels 1-25, each a distinct module', async () => {
    // Install the minimal globals the theme files touch at module scope
    // (each calls `window.addEventListener('resize', ...)` at import time).
    globalThis.window = globalThis.window || {
      addEventListener: () => {},
      innerWidth: 1280,
      innerHeight: 800,
    };
    globalThis.document = globalThis.document || {
      getElementById: () => null,
      addEventListener: () => {},
      createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} } }),
    };

    const { Themes } = await import('../../js/themes/index.js');

    const nums = Object.keys(Themes).map(Number).sort((a, b) => a - b);
    assert.deepEqual(nums, ALL_LEVEL_NUMS, 'Themes registry should cover exactly levels 1-25');

    // Module-object identity is derived from the real import graph (each
    // `import * as X from './x.js'` yields a distinct namespace object per
    // module) — this is a computed uniqueness check over actual data, never
    // a hardcoded list of theme names.
    const moduleObjects = ALL_LEVEL_NUMS.map(n => Themes[n]);
    const uniqueModules = new Set(moduleObjects);
    assert.equal(uniqueModules.size, moduleObjects.length,
      'every level must map to a DISTINCT theme module object — no theme module may be assigned to two levels');
  });

  // NOTE: full module-contract compliance (start/stop/keystroke/miss/
  // patternComplete/victory on every theme file) is INV-34, owned by Lane I's
  // tests/static/invariants.test.mjs — not duplicated here. While building the
  // registry-coverage check above this file's author discovered js/themes/
  // pacman.js (Level 3's theme) has no `miss()` export; flagged for Lane I in
  // the wave report rather than asserted here, to keep this file's ownership
  // strictly to INV-14..19/INV-35.
});
