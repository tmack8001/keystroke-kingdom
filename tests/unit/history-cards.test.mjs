// Enforces: INV-20, INV-21, INV-23 — product.md §History Cards,
// research/computing-history-moments.md (card ground truth),
// CLAUDE.md §Levels (key unlock table).
//
// History Cards: "each carded level has exactly one 'moment word' — typeable
// with only that level's unlocked keys." This suite renders that promise
// executable by building the cumulative unlocked-key closure straight from
// js/levels.js LEVELS (never hardcoded) and checking every card word against
// it, plus the 17-card guarantee and localStorage persistence/tolerance.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { installLocalStorageStub, resetStubs } from '../helpers/stubs.mjs';
import { LEVELS } from '../../js/levels.js';

// Shift unlocks at Level 24 (levels.js LEVELS[24].newKeys includes 'Shift');
// Space unlocks at Level 25. Both confirmed against
// research/computing-history-moments.md's card-ground-truth table.
const SHIFT_LEVEL = 24;
const SPACE_LEVEL = 25;

// Build the cumulative unlocked-key closure per level directly from the
// game's own curriculum data — never a hand-copied list (STRATEGY.md §2:
// "expected values derive from design docs or the game's own data files").
function buildKeyClosure() {
  const closureByLevel = {};
  const seen = new Set();
  const levelNumbers = Object.keys(LEVELS).map(Number).sort((a, b) => a - b);
  for (const lvl of levelNumbers) {
    for (const k of LEVELS[lvl].newKeys || []) seen.add(k);
    closureByLevel[lvl] = new Set(seen);
  }
  return closureByLevel;
}

describe('history-cards.js — module shape', () => {
  test('exports HISTORY_CARDS, TOTAL_CARDS, wordToTokens, patternMatchesCard, collectCard, collectedCount', async () => {
    const mod = await import('../../js/history-cards.js');
    assert.equal(typeof mod.HISTORY_CARDS, 'object');
    assert.equal(typeof mod.TOTAL_CARDS, 'number');
    assert.equal(typeof mod.wordToTokens, 'function');
    assert.equal(typeof mod.patternMatchesCard, 'function');
    assert.equal(typeof mod.collectCard, 'function');
    assert.equal(typeof mod.collectedCount, 'function');
  });
});

describe('INV-21 — 17 cards, TOTAL_CARDS consistent, card levels are real levels', () => {
  test('there are exactly 17 history cards (product.md §History Cards: "Seventeen computing-history moments")', async () => {
    const { HISTORY_CARDS } = await import('../../js/history-cards.js');
    assert.equal(Object.keys(HISTORY_CARDS).length, 17);
  });

  test('TOTAL_CARDS equals the size of the HISTORY_CARDS object (never a copied constant)', async () => {
    const { HISTORY_CARDS, TOTAL_CARDS } = await import('../../js/history-cards.js');
    assert.equal(TOTAL_CARDS, Object.keys(HISTORY_CARDS).length);
  });

  test('every card key is a real, existing level number (1-25)', async () => {
    const { HISTORY_CARDS } = await import('../../js/history-cards.js');
    for (const levelKey of Object.keys(HISTORY_CARDS)) {
      const lvl = Number(levelKey);
      assert.ok(Number.isInteger(lvl) && lvl >= 1 && lvl <= 25,
        `card level ${levelKey} must be an integer in [1,25]`);
      assert.ok(LEVELS[lvl], `card level ${levelKey} must exist in LEVELS`);
    }
  });

  test('every card has a non-empty moment word/title/fact', async () => {
    const { HISTORY_CARDS } = await import('../../js/history-cards.js');
    for (const [levelKey, card] of Object.entries(HISTORY_CARDS)) {
      assert.ok(typeof card.word === 'string' && card.word.length > 0,
        `level ${levelKey} card word must be non-empty`);
      assert.ok(typeof card.title === 'string' && card.title.length > 0,
        `level ${levelKey} card title must be non-empty`);
      assert.ok(typeof card.fact === 'string' && card.fact.length > 0,
        `level ${levelKey} card fact must be non-empty`);
    }
  });
});

describe('INV-20 — every card word is typeable with exactly its level\'s unlocked keys', () => {
  test('every card\'s wordToTokens(word) is a subset of the cumulative key closure at its level', async () => {
    const { HISTORY_CARDS, wordToTokens } = await import('../../js/history-cards.js');
    const closureByLevel = buildKeyClosure();

    for (const [levelKey, card] of Object.entries(HISTORY_CARDS)) {
      const lvl = Number(levelKey);
      const closure = closureByLevel[lvl];
      const tokens = wordToTokens(card.word);

      for (const token of tokens) {
        if (token === ' ') {
          // Space is not a "key" in newKeys (it's engine infrastructure until
          // Level 25 makes it intentional) — the design doc explicitly ties
          // space-containing cards to Level 25 ("hello world").
          assert.ok(lvl >= SPACE_LEVEL,
            `card at level ${lvl} ("${card.word}") uses a space token, ` +
            `but space only unlocks for intentional typing at Level ${SPACE_LEVEL}`);
          continue;
        }
        if (token >= 'A' && token <= 'Z') {
          // Uppercase = Shift+letter (CLAUDE.md §Engine input contract).
          // Shift itself unlocks at Level 24 — a capital letter is only
          // legitimately typeable at or after that level.
          assert.ok(lvl >= SHIFT_LEVEL,
            `card at level ${lvl} ("${card.word}") uses uppercase "${token}" ` +
            `(Shift+letter), but Shift only unlocks at Level ${SHIFT_LEVEL}`);
          const lowerToken = token.toLowerCase();
          assert.ok(closure.has(lowerToken),
            `card at level ${lvl} ("${card.word}") uses "${token}", but base ` +
            `key "${lowerToken}" is not in the cumulative closure at level ${lvl}: ` +
            `[${[...closure].join(', ')}]`);
          continue;
        }
        assert.ok(closure.has(token),
          `card at level ${lvl} ("${card.word}") uses token "${token}", which ` +
          `is not in the cumulative unlocked-key closure at level ${lvl}: ` +
          `[${[...closure].join(', ')}]`);
      }
    }
  });

  test('the Level 24 card ("Eniac") is the only card using capitals, matching Shift\'s unlock level', async () => {
    const { HISTORY_CARDS } = await import('../../js/history-cards.js');
    for (const [levelKey, card] of Object.entries(HISTORY_CARDS)) {
      const lvl = Number(levelKey);
      const hasUpper = /[A-Z]/.test(card.word);
      if (hasUpper) {
        assert.ok(lvl >= SHIFT_LEVEL,
          `card word "${card.word}" at level ${lvl} contains a capital letter ` +
          `before Shift unlocks at ${SHIFT_LEVEL}`);
      }
    }
  });

  test('the Level 25 card ("hello world") is the only card using a space, matching Space\'s unlock level', async () => {
    const { HISTORY_CARDS } = await import('../../js/history-cards.js');
    for (const [levelKey, card] of Object.entries(HISTORY_CARDS)) {
      const lvl = Number(levelKey);
      if (card.word.includes(' ')) {
        assert.ok(lvl >= SPACE_LEVEL,
          `card word "${card.word}" at level ${lvl} contains a space before ` +
          `Space unlocks at ${SPACE_LEVEL}`);
      }
    }
  });
});

describe('wordToTokens — behavioral contract', () => {
  test('splits a word into one token per character', async () => {
    const { wordToTokens } = await import('../../js/history-cards.js');
    assert.deepEqual(wordToTokens('ada'), ['a', 'd', 'a']);
    assert.deepEqual(wordToTokens('hello world'), ['h', 'e', 'l', 'l', 'o', ' ', 'w', 'o', 'r', 'l', 'd']);
  });

  test('preserves case (uppercase letters remain uppercase tokens)', async () => {
    const { wordToTokens } = await import('../../js/history-cards.js');
    assert.deepEqual(wordToTokens('Eniac'), ['E', 'n', 'i', 'a', 'c']);
  });
});

describe('patternMatchesCard — behavioral cases', () => {
  test('matches when the pattern\'s tokens equal the card\'s own word tokens', async () => {
    const { HISTORY_CARDS, patternMatchesCard, wordToTokens } = await import('../../js/history-cards.js');
    const card = HISTORY_CARDS[4]; // 'ada'
    assert.equal(patternMatchesCard(wordToTokens(card.word), card), true);
  });

  test('does not match an unrelated pattern of the same length', async () => {
    const { HISTORY_CARDS, patternMatchesCard } = await import('../../js/history-cards.js');
    const card = HISTORY_CARDS[4]; // 'ada'
    assert.equal(patternMatchesCard(['s', 'a', 'd'], card), false);
  });

  test('does not match a pattern of a different length', async () => {
    const { HISTORY_CARDS, patternMatchesCard } = await import('../../js/history-cards.js');
    const card = HISTORY_CARDS[4]; // 'ada'
    assert.equal(patternMatchesCard(['a', 'd', 'a', 's'], card), false);
    assert.equal(patternMatchesCard(['a'], card), false);
    assert.equal(patternMatchesCard([], card), false);
  });

  test('does not match when card is falsy/absent (a level with no card)', async () => {
    const { patternMatchesCard } = await import('../../js/history-cards.js');
    assert.equal(patternMatchesCard(['a', 'd', 'a'], null), false);
    assert.equal(patternMatchesCard(['a', 'd', 'a'], undefined), false);
  });

  test('is case-sensitive for capitalized card words (Level 24 "Eniac")', async () => {
    const { HISTORY_CARDS, patternMatchesCard, wordToTokens } = await import('../../js/history-cards.js');
    const card = HISTORY_CARDS[24]; // 'Eniac'
    assert.equal(patternMatchesCard(wordToTokens('Eniac'), card), true);
    assert.equal(patternMatchesCard(wordToTokens('eniac'), card), false);
  });
});

describe('INV-23 — card collection persists across sessions and tolerates garbage localStorage', () => {
  test('collectCard persists a level as collected, and collectedCount reflects it after a fresh import', async (t) => {
    installLocalStorageStub();
    t.after(resetStubs);

    const mod = await import('../../js/history-cards.js?collect1');
    assert.equal(mod.collectedCount(), 0);

    const firstTime = mod.collectCard(4);
    assert.equal(firstTime, true, 'first collection of a level returns true (drives the NEW! tag)');
    assert.equal(mod.collectedCount(), 1);

    const secondTime = mod.collectCard(4);
    assert.equal(secondTime, false, 'collecting the same level again is idempotent, not a new find');
    assert.equal(mod.collectedCount(), 1, 'idempotent collection does not double-count');
  });

  test('collectedCount accumulates across multiple distinct collected levels', async (t) => {
    installLocalStorageStub();
    t.after(resetStubs);

    const mod = await import('../../js/history-cards.js?collect2');
    mod.collectCard(4);
    mod.collectCard(5);
    mod.collectCard(8);
    assert.equal(mod.collectedCount(), 3);
  });

  test('corrupt localStorage JSON is tolerated silently — collectedCount returns a sane value, no throw', async (t) => {
    const store = installLocalStorageStub({ 'kk-cards': '{not valid json' });
    t.after(resetStubs);

    const mod = await import('../../js/history-cards.js?corrupt1');
    assert.doesNotThrow(() => mod.collectedCount());
    assert.equal(mod.collectedCount(), 0, 'corrupt JSON degrades to an empty collection, not a crash');

    // Collecting after corruption must still work going forward.
    assert.doesNotThrow(() => mod.collectCard(9));
    assert.equal(mod.collectedCount(), 1);
  });

  test('a non-array JSON value in storage (e.g. an object or number) is tolerated silently', async (t) => {
    installLocalStorageStub({ 'kk-cards': '{"not":"an array"}' });
    t.after(resetStubs);
    const mod = await import('../../js/history-cards.js?corrupt2');
    assert.doesNotThrow(() => mod.collectedCount());
    assert.equal(mod.collectedCount(), 0);

    installLocalStorageStub({ 'kk-cards': '42' });
    const mod2 = await import('../../js/history-cards.js?corrupt3');
    assert.doesNotThrow(() => mod2.collectedCount());
    assert.equal(mod2.collectedCount(), 0);
  });

  test('localStorage that throws (private-mode style) degrades gracefully — no throw from collectCard or collectedCount', async (t) => {
    globalThis.localStorage = {
      getItem() { throw new Error('SecurityError: storage disabled'); },
      setItem() { throw new Error('SecurityError: storage disabled'); },
      removeItem() { throw new Error('SecurityError: storage disabled'); },
      clear() { throw new Error('SecurityError: storage disabled'); },
      key() { throw new Error('SecurityError: storage disabled'); },
      get length() { throw new Error('SecurityError: storage disabled'); },
    };
    t.after(resetStubs);

    const mod = await import('../../js/history-cards.js?throwing1');
    assert.doesNotThrow(() => mod.collectedCount());
    assert.equal(mod.collectedCount(), 0);
    assert.doesNotThrow(() => mod.collectCard(4));
  });
});
