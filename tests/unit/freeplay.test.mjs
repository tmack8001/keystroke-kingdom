// Enforces: INV-36 — product.md §Free Play, CLAUDE.md §Engine input contract.
//
// Free Play: "play ANY cabinet with the full keyboard, typing real sentences
// ... Speed is displayed, never enforced." This suite renders the "full
// keyboard" promise executable: every SENTENCES entry and every THEMED[level]
// entry must tokenize into characters that are all legal Free Play tokens
// (declared by FREEPLAY_KEYS, plus the engine's documented uppercase-is-Shift
// rule), and buildFreePlayPatterns(level) must produce well-formed, non-empty
// token streams for every one of the 25 levels.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  FREEPLAY_KEYS,
  SENTENCES,
  THEMED,
  buildFreePlayPatterns,
} from '../../js/freeplay.js';

// Build the legal Free Play token set from FREEPLAY_KEYS itself (never
// hardcoded) plus the engine's documented case rule (CLAUDE.md §Engine input
// contract): "uppercase A-Z (= Shift+letter, exact-case matched)" — Free
// Play's FREEPLAY_KEYS declares 'Shift' as an available token, so any
// uppercase letter is legal precisely because Shift is present.
function buildLegalTokenSet() {
  const legal = new Set(FREEPLAY_KEYS);
  if (legal.has('Shift')) {
    for (let c = 65; c <= 90; c++) legal.add(String.fromCharCode(c)); // A-Z
  }
  return legal;
}

function tokenizeSentence(sentence) {
  return sentence.split('');
}

describe('freeplay.js — module shape', () => {
  test('exports FREEPLAY_KEYS, SENTENCES, THEMED, buildFreePlayPatterns', () => {
    assert.ok(Array.isArray(FREEPLAY_KEYS));
    assert.ok(Array.isArray(SENTENCES));
    assert.equal(typeof THEMED, 'object');
    assert.equal(typeof buildFreePlayPatterns, 'function');
  });

  test('FREEPLAY_KEYS declares Shift, space, and Backspace (the full taught keyboard)', () => {
    assert.ok(FREEPLAY_KEYS.includes('Shift'));
    assert.ok(FREEPLAY_KEYS.includes(' '));
    assert.ok(FREEPLAY_KEYS.includes('Backspace'));
  });
});

describe('INV-36 — every Free Play sentence is typeable with FREEPLAY_KEYS', () => {
  test('every shared SENTENCES entry tokenizes to characters within the legal token set', () => {
    const legal = buildLegalTokenSet();
    for (const sentence of SENTENCES) {
      const tokens = tokenizeSentence(sentence);
      for (const token of tokens) {
        assert.ok(legal.has(token),
          `SENTENCES entry "${sentence}" contains token "${token}" which is ` +
          `not a legal Free Play token (FREEPLAY_KEYS-derived set)`);
      }
    }
  });

  test('every THEMED[level] entry, for every level 1-25, tokenizes within the legal token set', () => {
    const legal = buildLegalTokenSet();
    for (let level = 1; level <= 25; level++) {
      const pool = THEMED[level];
      assert.ok(Array.isArray(pool) && pool.length > 0,
        `THEMED[${level}] must be a non-empty array (product.md: "4-6 cabinet-flavored phrases per level")`);
      for (const phrase of pool) {
        const tokens = tokenizeSentence(phrase);
        for (const token of tokens) {
          assert.ok(legal.has(token),
            `THEMED[${level}] phrase "${phrase}" contains token "${token}" which ` +
            `is not a legal Free Play token`);
        }
      }
    }
  });

  test('SENTENCES pool is non-empty (the shared early-reader bank exists)', () => {
    assert.ok(SENTENCES.length > 0);
  });
});

describe('INV-36 — buildFreePlayPatterns(level) returns well-formed token streams for all 25 levels', () => {
  test('returns a non-empty array of non-empty token arrays for every level 1-25', () => {
    for (let level = 1; level <= 25; level++) {
      const patterns = buildFreePlayPatterns(level);
      assert.ok(Array.isArray(patterns), `level ${level} must return an array`);
      assert.ok(patterns.length > 0, `level ${level} must return at least one pattern`);
      for (const pattern of patterns) {
        assert.ok(Array.isArray(pattern), `level ${level} pattern must be a token array`);
        assert.ok(pattern.length > 0, `level ${level} must not contain an empty pattern`);
      }
    }
  });

  test('every token in buildFreePlayPatterns(level) output is a legal Free Play token, for all 25 levels', () => {
    const legal = buildLegalTokenSet();
    for (let level = 1; level <= 25; level++) {
      const patterns = buildFreePlayPatterns(level);
      for (const pattern of patterns) {
        for (const token of pattern) {
          assert.ok(legal.has(token),
            `buildFreePlayPatterns(${level}) produced illegal token "${token}"`);
        }
      }
    }
  });

  test('output includes the level\'s own themed phrases plus the shared sentence bank', () => {
    // Behavioral, not implementation: the total pattern count for a level
    // with a themed pool should equal that pool's size plus the shared bank
    // size (product.md: themed phrases "first," then the shared pool).
    for (let level = 1; level <= 25; level++) {
      const patterns = buildFreePlayPatterns(level);
      const themedCount = (THEMED[level] || []).length;
      assert.equal(patterns.length, themedCount + SENTENCES.length,
        `level ${level} pattern count should be themed(${themedCount}) + shared(${SENTENCES.length})`);
    }
  });

  test('a level with no THEMED entry still returns the shared sentence bank only (graceful fallback)', () => {
    // Level 0 / 26 don't exist in THEMED — buildFreePlayPatterns must not
    // throw and must fall back to the shared bank alone (documented as
    // "cabinet-flavored + shared early-reader pools" — shared pool is not
    // level-gated).
    assert.doesNotThrow(() => buildFreePlayPatterns(999));
    const patterns = buildFreePlayPatterns(999);
    assert.equal(patterns.length, SENTENCES.length);
  });
});
