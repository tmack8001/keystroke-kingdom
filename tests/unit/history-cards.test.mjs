// Enforces: INV-20, INV-21, INV-22 (module-shape only — the full guarantee is L2),
// INV-56, INV-57, INV-58 — product.md §History Cards,
// research/computing-history-moments.md (card ground truth), CLAUDE.md §Levels
// (key unlock table), js/history-cards.js's own header comment (the flat/pool
// model rebuilt 2026-07-19).
//
// History Cards (rebuilt 2026-07-19): HISTORY_CARDS is now a FLAT LIST, each card
// carrying a stable `id` and a `level` (= the EARLIEST level where its word becomes
// typeable). A level may hold a POOL of several cards; SECRET cards (`level: null,
// secret: true`) are never pooled at any level, found only via magic words. This
// suite renders the flat-list promises executable: every non-secret card's word is
// typeable with only its level's unlocked keys (INV-20), the card bank's own
// bookkeeping is internally consistent (INV-21), every card is attached to the
// EXACT earliest level its word becomes spellable — never later (INV-56), secret
// cards never leak into a level's pool (INV-57), and pickGuaranteedCard's rotation
// contract holds (INV-58). Card COLLECTION persistence (INV-23) moved to slots.js —
// see tests/unit/slots.test.mjs.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../../js/levels.js';

// Shift unlocks at Level 24 (levels.js LEVELS[24].newKeys includes 'Shift');
// Space unlocks at Level 25. Both confirmed against LEVELS itself below.
const SHIFT_LEVEL = Number(Object.keys(LEVELS).find((n) => LEVELS[n].newKeys.includes('Shift')));
const SPACE_LEVEL = Number(Object.keys(LEVELS).find((n) => LEVELS[n].newKeys.includes(' ')));

// Build the cumulative unlocked-key closure per level directly from the game's own
// curriculum data — never a hand-copied list (STRATEGY.md §2: "expected values
// derive from design docs or the game's own data files").
function buildKeyClosure() {
  const closureByLevel = {};
  const seen = new Set();
  const levelNumbers = Object.keys(LEVELS).map(Number).sort((a, b) => a - b);
  for (const lvl of levelNumbers) {
    for (const k of LEVELS[lvl].newKeys || []) seen.add(k);
    closureByLevel[lvl] = new Set(seen);
  }
  return { closureByLevel, levelNumbers };
}
const { closureByLevel, levelNumbers } = buildKeyClosure();

// The first level whose cumulative closure contains a given lowercase/base key
// (digit/symbol/letter). Infinity if no level ever unlocks it (should never happen
// for a real card word against the full curriculum).
function firstLevelWithKey(key) {
  for (const lvl of levelNumbers) {
    if (closureByLevel[lvl].has(key)) return lvl;
  }
  return Infinity;
}

// The EARLIEST level at which `word` becomes fully typeable, honoring the same
// special-casing INV-20 already established: an uppercase letter needs both its
// base key AND Shift's own unlock level; a space needs Space's unlock level.
// This is the ground truth INV-56 ("earliest-typeable attachment") checks every
// non-secret card's `level` field against.
function earliestTypeableLevel(word) {
  let level = 1;
  for (const ch of word) {
    if (ch === ' ') {
      level = Math.max(level, SPACE_LEVEL);
      continue;
    }
    if (ch >= 'A' && ch <= 'Z') {
      level = Math.max(level, SHIFT_LEVEL, firstLevelWithKey(ch.toLowerCase()));
      continue;
    }
    level = Math.max(level, firstLevelWithKey(ch));
  }
  return level;
}

describe('history-cards.js — module shape (flat-list model)', () => {
  test('exports HISTORY_CARDS as an array, TOTAL_CARDS, and the documented pure helpers', async () => {
    const mod = await import('../../js/history-cards.js');
    assert.ok(Array.isArray(mod.HISTORY_CARDS), 'HISTORY_CARDS is a flat array, not a level-keyed object');
    assert.equal(typeof mod.TOTAL_CARDS, 'number');
    assert.equal(typeof mod.wordToTokens, 'function');
    assert.equal(typeof mod.patternMatchesCard, 'function');
    assert.equal(typeof mod.allCards, 'function');
    assert.equal(typeof mod.cardsForLevel, 'function');
    assert.equal(typeof mod.cardById, 'function');
    assert.equal(typeof mod.legacyLevelToCardId, 'function');
    assert.equal(typeof mod.pickGuaranteedCard, 'function');
    // collectCard/collectedCount moved to slots.js — this module owns data only.
    assert.equal(mod.collectCard, undefined, 'collectCard moved to slots.js (collectCardId)');
    assert.equal(mod.collectedCount, undefined, 'collectedCount moved to slots.js');
  });

  test('allCards() returns the identity of HISTORY_CARDS', async () => {
    const { HISTORY_CARDS, allCards } = await import('../../js/history-cards.js');
    assert.deepEqual(allCards(), HISTORY_CARDS);
  });
});

describe('INV-21 — TOTAL_CARDS consistent, card levels valid, ids unique', () => {
  test('TOTAL_CARDS equals HISTORY_CARDS.length (never a hardcoded count — the bank keeps growing)', async () => {
    const { HISTORY_CARDS, TOTAL_CARDS } = await import('../../js/history-cards.js');
    assert.equal(TOTAL_CARDS, HISTORY_CARDS.length);
    // Sanity: the bank is non-trivially sized (guards against an accidental empty
    // array passing this suite vacuously) without pinning an exact count.
    assert.ok(TOTAL_CARDS >= 18, `expected the card bank to have grown past its 18-card baseline, got ${TOTAL_CARDS}`);
  });

  test('every non-secret card\'s level is a real, existing level number (1-25)', async () => {
    const { HISTORY_CARDS } = await import('../../js/history-cards.js');
    for (const card of HISTORY_CARDS) {
      if (card.secret) continue;
      assert.ok(Number.isInteger(card.level) && card.level >= 1 && card.level <= 25,
        `card "${card.id}" level ${card.level} must be an integer in [1,25]`);
      assert.ok(LEVELS[card.level], `card "${card.id}" level ${card.level} must exist in LEVELS`);
    }
  });

  test('secret cards carry level: null and secret: true', async () => {
    const { HISTORY_CARDS } = await import('../../js/history-cards.js');
    const secrets = HISTORY_CARDS.filter((c) => c.secret);
    assert.ok(secrets.length >= 1, 'at least one secret card exists (the WarGames card)');
    for (const c of secrets) {
      assert.equal(c.level, null, `secret card "${c.id}" must have level: null`);
    }
  });

  test('every card id is unique across the whole list (secrets included)', async () => {
    const { HISTORY_CARDS } = await import('../../js/history-cards.js');
    const ids = HISTORY_CARDS.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length, 'every card id must be unique');
  });

  test('every card has a non-empty id/word/title/fact', async () => {
    const { HISTORY_CARDS } = await import('../../js/history-cards.js');
    for (const card of HISTORY_CARDS) {
      assert.ok(typeof card.id === 'string' && card.id.length > 0, `card must have a non-empty id: ${JSON.stringify(card)}`);
      assert.ok(typeof card.word === 'string' && card.word.length > 0, `card "${card.id}" word must be non-empty`);
      assert.ok(typeof card.title === 'string' && card.title.length > 0, `card "${card.id}" title must be non-empty`);
      assert.ok(typeof card.fact === 'string' && card.fact.length > 0, `card "${card.id}" fact must be non-empty`);
    }
  });
});

describe('INV-20 — every non-secret card word is typeable with exactly its level\'s unlocked keys', () => {
  test('every non-secret card\'s wordToTokens(word) is a subset of the cumulative key closure at its level', async () => {
    const { HISTORY_CARDS, wordToTokens } = await import('../../js/history-cards.js');

    for (const card of HISTORY_CARDS) {
      if (card.secret) continue;
      const lvl = card.level;
      const closure = closureByLevel[lvl];
      const tokens = wordToTokens(card.word);

      for (const token of tokens) {
        if (token === ' ') {
          assert.ok(lvl >= SPACE_LEVEL,
            `card "${card.id}" at level ${lvl} ("${card.word}") uses a space token, ` +
            `but space only unlocks for intentional typing at Level ${SPACE_LEVEL}`);
          continue;
        }
        if (token >= 'A' && token <= 'Z') {
          // Uppercase = Shift+letter (CLAUDE.md §Engine input contract). Shift
          // itself unlocks at Level 24 — a capital is only legitimately typeable
          // at or after that level, AND its base letter must already be unlocked.
          assert.ok(lvl >= SHIFT_LEVEL,
            `card "${card.id}" at level ${lvl} ("${card.word}") uses uppercase "${token}" ` +
            `(Shift+letter), but Shift only unlocks at Level ${SHIFT_LEVEL}`);
          const lowerToken = token.toLowerCase();
          assert.ok(closure.has(lowerToken),
            `card "${card.id}" at level ${lvl} ("${card.word}") uses "${token}", but base ` +
            `key "${lowerToken}" is not in the cumulative closure at level ${lvl}: ` +
            `[${[...closure].join(', ')}]`);
          continue;
        }
        assert.ok(closure.has(token),
          `card "${card.id}" at level ${lvl} ("${card.word}") uses token "${token}", which ` +
          `is not in the cumulative unlocked-key closure at level ${lvl}: ` +
          `[${[...closure].join(', ')}]`);
      }
    }
  });

  test('only cards at/after Level 24 use capitals; only cards at/after Level 25 use a space', async () => {
    const { HISTORY_CARDS } = await import('../../js/history-cards.js');
    for (const card of HISTORY_CARDS) {
      if (card.secret) continue;
      if (/[A-Z]/.test(card.word)) {
        assert.ok(card.level >= SHIFT_LEVEL,
          `card "${card.id}" word "${card.word}" at level ${card.level} contains a capital ` +
          `letter before Shift unlocks at ${SHIFT_LEVEL}`);
      }
      if (card.word.includes(' ')) {
        assert.ok(card.level >= SPACE_LEVEL,
          `card "${card.id}" word "${card.word}" at level ${card.level} contains a space ` +
          `before Space unlocks at ${SPACE_LEVEL}`);
      }
    }
  });
});

describe('INV-56 — earliest-typeable attachment: every non-secret card sits at the EXACT earliest level its word can be typed', () => {
  test('card.level === earliestTypeableLevel(card.word) for every non-secret card', async () => {
    const { HISTORY_CARDS } = await import('../../js/history-cards.js');
    for (const card of HISTORY_CARDS) {
      if (card.secret) continue;
      const earliest = earliestTypeableLevel(card.word);
      assert.equal(card.level, earliest,
        `card "${card.id}" ("${card.word}") is attached to level ${card.level}, but its word ` +
        `first becomes fully typeable at level ${earliest} — a card must sit at the EARLIEST ` +
        `level its word becomes spellable, never later (history-cards.js header).`);
    }
  });
});

describe('INV-57 — secret cards never appear in any level\'s pool', () => {
  test('cardsForLevel(level) never returns a secret card, for every level 1-25', async () => {
    const { cardsForLevel } = await import('../../js/history-cards.js');
    for (let lvl = 1; lvl <= 25; lvl++) {
      const pool = cardsForLevel(lvl);
      for (const card of pool) {
        assert.equal(card.secret, undefined, `level ${lvl}'s pool must never contain a secret card (found "${card.id}")`);
        assert.notEqual(card.level, null, `level ${lvl}'s pool must never contain a level:null card (found "${card.id}")`);
      }
    }
  });

});

describe('cardsForLevel / cardById — behavioral contract', () => {
  test('cardsForLevel returns only cards whose level field matches exactly', async () => {
    const { HISTORY_CARDS, cardsForLevel } = await import('../../js/history-cards.js');
    for (const lvl of [1, 2, 3, 4, 5]) {
      const pool = cardsForLevel(lvl);
      const expected = HISTORY_CARDS.filter((c) => c.level === lvl);
      assert.deepEqual(pool, expected, `cardsForLevel(${lvl}) must equal the filtered list`);
    }
  });

  test('cardById finds an existing card by id, and returns null for an unknown id', async () => {
    const { HISTORY_CARDS, cardById } = await import('../../js/history-cards.js');
    const known = HISTORY_CARDS[0];
    assert.deepEqual(cardById(known.id), known);
    assert.equal(cardById('this-id-does-not-exist'), null);
  });
});

describe('legacyLevelToCardId — migration helper', () => {
  test('maps a legacy level (one of the original 17) to that card\'s stable id', async () => {
    const { HISTORY_CARDS, legacyLevelToCardId } = await import('../../js/history-cards.js');
    const tagged = HISTORY_CARDS.filter((c) => c.legacyLevel != null);
    assert.ok(tagged.length > 0, 'at least one card must carry a legacyLevel tag (the original 17)');
    for (const card of tagged) {
      assert.equal(legacyLevelToCardId(card.legacyLevel), card.id);
    }
  });

  test('returns null for a level with no legacy card (e.g. a level from the 2026-07-19 expansion, or a level that never had one)', async () => {
    const { HISTORY_CARDS, legacyLevelToCardId } = await import('../../js/history-cards.js');
    const legacyLevels = new Set(HISTORY_CARDS.map((c) => c.legacyLevel).filter((l) => l != null));
    const untagged = [1, 2, 3].find((lvl) => !legacyLevels.has(lvl));
    assert.ok(untagged !== undefined, 'fixture sanity: at least one of levels 1-3 was never a legacy card level');
    assert.equal(legacyLevelToCardId(untagged), null);
  });
});

describe('INV-58 — pickGuaranteedCard: exactly one guaranteed card per play, rotation contract', () => {
  test('returns null for a level with no card pool', async () => {
    const { pickGuaranteedCard } = await import('../../js/history-cards.js');
    // Levels 1-3 have no vowel and (per product.md) no cards live there either —
    // confirm at least one such bare level exists and returns null.
    assert.equal(pickGuaranteedCard(1, [], 0), null);
  });

  test('returns exactly one card object (never an array/pool) for a level with a pool', async () => {
    const { HISTORY_CARDS, cardsForLevel, pickGuaranteedCard } = await import('../../js/history-cards.js');
    const carded = [...new Set(HISTORY_CARDS.filter((c) => !c.secret).map((c) => c.level))];
    assert.ok(carded.length > 0, 'fixture sanity: at least one level has a card');
    for (const lvl of carded) {
      const picked = pickGuaranteedCard(lvl, [], 0);
      assert.ok(picked && typeof picked === 'object' && !Array.isArray(picked),
        `pickGuaranteedCard(${lvl}, ...) must return exactly one card object, got ${JSON.stringify(picked)}`);
      assert.ok(cardsForLevel(lvl).some((c) => c.id === picked.id), 'the picked card must belong to that level\'s pool');
    }
  });

  test('prefers a card not yet collected in this slot', async () => {
    const { cardsForLevel, pickGuaranteedCard } = await import('../../js/history-cards.js');
    const pooled = cardsForLevel(4); // Level 4 (ada-lovelace) is guaranteed to exist
    if (pooled.length < 2) return; // needs a real multi-card pool to be meaningful
    const allButLast = pooled.slice(0, -1).map((c) => c.id);
    const picked = pickGuaranteedCard(4, allButLast, 0);
    assert.equal(picked.id, pooled[pooled.length - 1].id, 'the one uncollected card in the pool is preferred');
  });

  test('once every card in the pool is collected, rotation cycles through the full pool deterministically', async () => {
    const { cardsForLevel, pickGuaranteedCard } = await import('../../js/history-cards.js');
    const pooled = cardsForLevel(4);
    const allIds = pooled.map((c) => c.id);
    const seen = new Set();
    for (let rot = 0; rot < pooled.length; rot++) {
      const picked = pickGuaranteedCard(4, allIds, rot);
      assert.ok(picked, 'a fully-collected pool must still yield a card (never null while a pool exists)');
      seen.add(picked.id);
    }
    // Deterministic + reproducible: calling again with the same rotation returns the same card.
    const again = pickGuaranteedCard(4, allIds, 0);
    assert.equal(again.id, pickGuaranteedCard(4, allIds, 0).id);
    if (pooled.length > 1) {
      assert.ok(seen.size > 1, 'rotation should surface more than one distinct card across a full cycle when the pool has >1 card');
    }
  });

  test('is a pure function — no Math.random, no localStorage/DOM dependency (deterministic given the same inputs)', async () => {
    const { pickGuaranteedCard, cardsForLevel } = await import('../../js/history-cards.js');
    const lvl = cardsForLevel(4).length ? 4 : [...new Set((await import('../../js/history-cards.js')).HISTORY_CARDS.map((c) => c.level))][0];
    const a = pickGuaranteedCard(lvl, [], 0);
    const b = pickGuaranteedCard(lvl, [], 0);
    assert.deepEqual(a, b, 'identical inputs must produce identical output — no hidden randomness or state');
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
    const { cardById, patternMatchesCard, wordToTokens } = await import('../../js/history-cards.js');
    const card = cardById('ada-lovelace');
    assert.ok(card, 'fixture sanity: the ada-lovelace card exists');
    assert.equal(patternMatchesCard(wordToTokens(card.word), card), true);
  });

  test('does not match an unrelated pattern of the same length', async () => {
    const { cardById, patternMatchesCard } = await import('../../js/history-cards.js');
    const card = cardById('ada-lovelace'); // 'ada'
    assert.equal(patternMatchesCard(['s', 'a', 'd'], card), false);
  });

  test('does not match a pattern of a different length', async () => {
    const { cardById, patternMatchesCard } = await import('../../js/history-cards.js');
    const card = cardById('ada-lovelace'); // 'ada'
    assert.equal(patternMatchesCard(['a', 'd', 'a', 's'], card), false);
    assert.equal(patternMatchesCard(['a'], card), false);
    assert.equal(patternMatchesCard([], card), false);
  });

  test('does not match when card is falsy/absent (a level with no card)', async () => {
    const { patternMatchesCard } = await import('../../js/history-cards.js');
    assert.equal(patternMatchesCard(['a', 'd', 'a'], null), false);
    assert.equal(patternMatchesCard(['a', 'd', 'a'], undefined), false);
  });

  test('is case-sensitive for capitalized card words (the Eniac card)', async () => {
    const { cardById, patternMatchesCard, wordToTokens } = await import('../../js/history-cards.js');
    const card = cardById('eniac');
    assert.ok(card, 'fixture sanity: the eniac card exists');
    assert.equal(patternMatchesCard(wordToTokens('Eniac'), card), true);
    assert.equal(patternMatchesCard(wordToTokens('eniac'), card), false);
  });
});
