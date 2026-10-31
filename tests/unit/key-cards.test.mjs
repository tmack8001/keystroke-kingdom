// Keyboard cards — the FOURTH bank ("the key has a name").
//
// Enforces: INV-153 (attachment is derived), INV-154 (a separate fourth bank),
// INV-163 (research gate), INV-165 (copy fits), INV-161 (data half: the literacy text
// carries no code meaning), INV-29 (the word lives in the allowlisted module).
//
// Design sources, never the module's own constants:
//   - docs/specs/semicolon-teaching-beat.md §5.1 (record + attachment rule), §10;
//   - product.md §"The Key Names" (the name at Level 13, the programming meaning at the
//     Level 20 terminal); levels/act3.md Level 13; levels/act4.md Level 20;
//   - research/wiki/tech/semicolon.md §2 (first PRINTED, February 1496 — never 1494, never
//     "invented"), §4 (code: "many", "instruction"), §5 (writing JOINS, code ENDS).
// Expected values come from js/levels.js `newKeys` and from the spec's table.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import '../helpers/stubs.mjs';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const kc = await import('../../js/key-cards.js');
const hc = await import('../../js/history-cards.js');
const { LEVELS } = await import('../../js/levels.js');
const { KEY_CARDS } = kc;

describe('INV-153 — a keyboard card attaches at max(level the key arrives, level its name is spellable)', () => {
  test('the bank holds the semicolon record', () => {
    assert.ok(KEY_CARDS.length >= 1);
    assert.ok(KEY_CARDS.some((c) => c.id === 'key-semicolon'));
  });

  for (const rec of KEY_CARDS) {
    test(`${rec.id}: the literal level equals the level derived from the real curriculum`, () => {
      const derived = kc.deriveCardLevel(rec, LEVELS);
      assert.ok(derived != null, 'the key and its name must both be reachable in the curriculum');
      assert.equal(rec.level, derived, 'the record drifted from js/levels.js newKeys');
      assert.equal(rec.level, Math.max(kc.keyLevelOf(rec.keys, LEVELS), kc.nameLevelOf(rec.word, LEVELS)));
    });

    test(`${rec.id}: codeLevel is the card level or the terminal, whichever is later`, () => {
      const term = kc.terminalLevel(LEVELS);
      // act4.md: Level 20 is the terminal (1 and 0).
      assert.deepEqual([...LEVELS[term].newKeys].sort(), ['0', '1']);
      assert.equal(rec.codeLevel, Math.max(rec.level, term));
      assert.equal(rec.codeLevel, kc.deriveCodeLevel(rec, LEVELS));
    });

    test(`${rec.id}: the word is spellable with the keys unlocked by its level`, () => {
      const unlocked = new Set();
      for (let n = 1; n <= rec.level; n++) for (const k of LEVELS[n].newKeys || []) unlocked.add(k);
      for (const ch of rec.word) assert.ok(unlocked.has(ch), `'${ch}' is not unlocked by level ${rec.level}`);
      // ...and NOT one level earlier: the card lands at the FIRST level that can spell it.
      const before = new Set();
      for (let n = 1; n < rec.level; n++) for (const k of LEVELS[n].newKeys || []) before.add(k);
      assert.ok([...rec.word].some((ch) => !before.has(ch)), 'the word was already spellable a level earlier');
    });
  }

  test('key-semicolon: level 13 and codeLevel 20, as the design table states', () => {
    const r = kc.keyCardById('key-semicolon');
    assert.equal(r.level, 13);
    assert.equal(r.codeLevel, 20);
    assert.equal(r.year, '1496');
  });

  test('the eighth key arrives at Level 4 and its name only at Level 13 (act1.md L4, act3.md L13)', () => {
    assert.equal(kc.keyLevelOf([';'], LEVELS), 4);
    assert.equal(kc.nameLevelOf('semicolon', LEVELS), 13);
  });

  test('a synthetic curriculum moves the card: attachment is computed, not copied', () => {
    const fake = { 1: { newKeys: ['s', 'e', 'm', 'i', 'c', 'o', 'l', 'n'] }, 2: { newKeys: [';'] },
      3: { newKeys: ['1', '0'] } };
    const rec = { keys: [';'], word: 'semicolon' };
    assert.equal(kc.deriveCardLevel(rec, fake), 2);
    assert.equal(kc.deriveCodeLevel(rec, fake), 3);
  });

  test('keyCardForLevel: the collected id is the latch (and storage garbage reads as nothing collected)', () => {
    assert.equal(kc.keyCardForLevel(13, [])?.id, 'key-semicolon');
    assert.equal(kc.keyCardForLevel(13, ['key-semicolon']), null, 'collected -> no beat on replay');
    assert.equal(kc.keyCardForLevel(12, []), null, 'no beat before its level');
    assert.equal(kc.keyCardForLevel(14, []), null, 'no beat after its level');
    for (const bad of ['nope', null, undefined, { a: 1 }, [null, 7, {}]]) {
      assert.equal(kc.keyCardForLevel(13, bad)?.id, 'key-semicolon', `garbage ${JSON.stringify(bad)}`);
    }
  });
});

describe('INV-154 — keyboard cards are a SEPARATE fourth bank', () => {
  const others = [...hc.HISTORY_CARDS, ...hc.WING_CARDS, ...hc.ACT_CARDS];

  test('TOTAL_CARDS is still the arcade bank alone', () => {
    assert.equal(hc.TOTAL_CARDS, hc.HISTORY_CARDS.length);
    assert.notEqual(hc.TOTAL_CARDS, hc.HISTORY_CARDS.length + KEY_CARDS.length);
  });

  test('no keyboard id appears in another bank, and none is double-listed', () => {
    const ids = new Set(others.map((c) => c.id));
    for (const c of KEY_CARDS) assert.ok(!ids.has(c.id), `${c.id} is also in another bank`);
    assert.equal(new Set(KEY_CARDS.map((c) => c.id)).size, KEY_CARDS.length);
  });

  test('allCards() (the arcade gallery source) never lists a keyboard card', () => {
    const arcade = new Set(hc.allCards().map((c) => c.id));
    for (const c of KEY_CARDS) assert.ok(!arcade.has(c.id));
  });

  test('bankOf says keyboard', () => {
    for (const c of KEY_CARDS) assert.equal(hc.bankOf(c.id), 'keyboard');
  });

  test('bankProgress("keyboard") counts keyboard cards only; "arcade" ignores them', () => {
    const all = KEY_CARDS.map((c) => c.id);
    assert.deepEqual(hc.bankProgress('keyboard', all), { found: all.length, total: KEY_CARDS.length });
    assert.deepEqual(hc.bankProgress('keyboard', hc.HISTORY_CARDS.map((c) => c.id)),
      { found: 0, total: KEY_CARDS.length }, 'arcade ids must not inflate the keyboard numerator');
    assert.equal(hc.bankProgress('arcade', all).found, 0, 'a keyboard id must not inflate the arcade numerator');
    assert.equal(hc.bankProgress('arcade', all).total, hc.TOTAL_CARDS);
  });
});

describe('INV-165 — the caption copy fits and is Press Start 2P-safe', () => {
  for (const rec of KEY_CARDS) {
    test(`${rec.id}: exactly two uppercase lines, each <= 34 characters`, () => {
      assert.equal(rec.literacy.length, 2);
      for (const line of rec.literacy) {
        assert.ok(line.length <= 34, `"${line}" is ${line.length} chars`);
        assert.equal(line, line.toUpperCase());
        assert.match(line, /^[A-Z0-9 .,'!?:;-]+$/, `"${line}" leaves the pixel font's safe charset`);
      }
    });
  }
});

describe('INV-163 — every sentence is sourced (research/wiki/tech/semicolon.md) and no claim exceeds it', () => {
  const textOf = (r) => [r.title, r.year, ...r.literacy, r.literacyFact, r.fact, r.code, r.codeFact].join('\n');

  for (const rec of KEY_CARDS) {
    test(`${rec.id}: its source page exists under research/ and holds no placeholder`, () => {
      assert.match(rec.source, /^research\//);
      assert.ok(existsSync(join(REPO, rec.source)), `${rec.source} is missing`);
      assert.ok(!/⟦/.test(textOf(rec)), 'a ⟦placeholder⟧ shipped');
    });

    test(`${rec.id}: never "1494", never "invent" (first PRINTED, February 1496)`, () => {
      assert.ok(!/1494|invent/i.test(textOf(rec)), 'an unattested date or priority claim crept in');
      assert.match(rec.literacyFact, /first printed/i);
      assert.match(rec.literacyFact, /1496/);
    });

    test(`${rec.id}: the code sentences say "many" and "instruction", never every / all / line`, () => {
      for (const s of [rec.code, rec.codeFact]) {
        assert.ok(!/\bevery\b|\ball\b|\bline\b/i.test(s), `overclaim in: ${s}`);
        assert.match(s, /many/i);
        assert.match(s, /instruction/i);
      }
    });

    test(`${rec.id}: writing JOINS — the literacy text never calls the mark a sentence-ender`, () => {
      const lit = [...rec.literacy, rec.literacyFact].join(' ');
      assert.ok(!/\bends? (a|the|an)? ?sentence/i.test(lit));
      assert.match(lit, /join/i);
    });

    test(`${rec.id}: (INV-161 data half) the Level 13 text carries no code meaning`, () => {
      const lit = [...rec.literacy, rec.literacyFact, rec.fact].join(' ');
      assert.ok(!/CODER|PROGRAMM|INSTRUCTION|\bcode\b/i.test(lit));
      assert.equal(rec.fact, rec.literacyFact, 'the generic `fact` alias must show the literacy lesson');
    });

    test(`${rec.id}: the L20 couplet line 2 never names the key (INV-29) and ends with the glyph`, () => {
      assert.ok(!/semicolon/i.test(rec.code));
      assert.ok(rec.code.endsWith(rec.glyph));
    });
  }
});
