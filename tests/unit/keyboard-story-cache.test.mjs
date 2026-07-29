// Enforces: INV-66 (extended) — the Level 25 "MY STORY" coda generation QUALITY-CACHE
// (js/keyboard-story-cache.js) + the pool DEDUP in js/keyboard-story.js buildStoryPool.
//
// Design sources (the test asserts what THESE promise, never what the code does):
//   - security.md rule 4 (localStorage is untrusted — parse in try/catch, validate
//        shape, tolerate garbage → degrade to empty, never throw).
//   - security.md rule 6/8 (kk-stories holds already-VALIDATED GAME CONTENT, not PII;
//        the anti-dup context sent back to the generator carries story TEXT only, never
//        a player name).
//   - security.md rule 7 (generated/cached content re-validated as untrusted; a bad
//        entry is dropped individually).
//   - js/keyboard-story.js header: the STATIC bank is the offline floor — buildStoryPool
//        always appends it, so winnability/coverage never depend on the cache; a
//        generated story that duplicates a static (or cached) base is dropped.

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installLocalStorageStub, resetStubs } from '../helpers/stubs.mjs';
import {
  readCachedStories, addGeneratedStories, recentStoryBases, clearStoryCache,
} from '../../js/keyboard-story-cache.js';
import {
  STATIC_STORIES, buildStoryPool, coversAllLetters, normalizeStoryBase,
} from '../../js/keyboard-story.js';

const CACHE_KEY = 'kk-stories';

// A well-formed generated story (pangram base + 3 kid-safe extras) that is NOT in the
// static bank, so it is admissible.
function genStory(base) {
  return {
    base,
    extra: ['They play all day.', 'The sun is warm.', 'It is a happy day.'],
  };
}
const PANGRAM_A = 'How quickly daft jumping zebras vex.';
const PANGRAM_B = 'Amazingly few discotheques provide jukeboxes.';

// A family of DISTINCT kid-safe pangrams (classic base + a unique short filler word),
// for exercising the cache cap without any static-base collision.
function uniquePangram(i) {
  const suffix = 'abcdefghijklmnopqrstuvwxyz'[i % 26];
  return `The quick brown fox jumps over the lazy dog na${suffix}.`;
}

describe('kk-stories cache — defensive reads (security.md rule 4)', () => {
  beforeEach(() => { installLocalStorageStub(); });

  test('no cache present → empty array (never throws)', () => {
    assert.deepEqual(readCachedStories(), []);
  });

  test('non-JSON garbage → empty array', () => {
    const store = installLocalStorageStub();
    store.set(CACHE_KEY, '{not valid json');
    assert.deepEqual(readCachedStories(), []);
  });

  test('wrong shape (stories not an array) → empty array', () => {
    const store = installLocalStorageStub();
    store.set(CACHE_KEY, JSON.stringify({ v: 1, stories: 'nope' }));
    assert.deepEqual(readCachedStories(), []);
  });

  test('a stored entry failing re-validation is dropped, valid ones kept', () => {
    const store = installLocalStorageStub();
    store.set(CACHE_KEY, JSON.stringify({
      v: 1,
      stories: [
        genStory(PANGRAM_A),                 // valid
        { base: 'not a pangram at all', extra: [] }, // fails coverage → dropped
        { junk: true },                      // wrong shape → dropped
        genStory('Type 10 things!'),         // charset fail (digits/!) → dropped
      ],
    }));
    const got = readCachedStories();
    assert.equal(got.length, 1);
    assert.ok(coversAllLetters(got[0].base));
  });

  test('reads with no localStorage global at all → empty, no throw', () => {
    resetStubs(); // remove the stub entirely
    assert.deepEqual(readCachedStories(), []);
    installLocalStorageStub();
  });
});

describe('kk-stories cache — add / dedup / cap', () => {
  beforeEach(() => { installLocalStorageStub(); });

  test('adds a fresh generated story and persists it', () => {
    const merged = addGeneratedStories([genStory(PANGRAM_A)]);
    assert.equal(merged.length, 1);
    assert.equal(normalizeStoryBase(merged[0].base), normalizeStoryBase(PANGRAM_A));
    // persisted and readable back
    assert.equal(readCachedStories().length, 1);
  });

  test('a generation duplicating a STATIC base is dropped (never cached)', () => {
    const merged = addGeneratedStories([genStory(STATIC_STORIES[0].base)]);
    assert.equal(merged.length, 0);
    assert.deepEqual(readCachedStories(), []);
  });

  test('a generation duplicating an EXISTING cached base is dropped', () => {
    addGeneratedStories([genStory(PANGRAM_A)]);
    // Same base, only a trailing-period/casing difference → normalized dup.
    const merged = addGeneratedStories([genStory('how quickly daft jumping zebras vex')]);
    assert.equal(merged.length, 1); // still just the one
    assert.equal(readCachedStories().length, 1);
  });

  test('distinct generations accumulate across calls (growing variety)', () => {
    addGeneratedStories([genStory(PANGRAM_A)]);
    const merged = addGeneratedStories([genStory(PANGRAM_B)]);
    assert.equal(merged.length, 2);
    assert.equal(readCachedStories().length, 2);
  });

  test('cache is capped to the most recent 20 (oldest dropped)', () => {
    // Seed 25 distinct valid pangrams via repeated adds.
    for (let i = 0; i < 25; i++) addGeneratedStories([genStory(uniquePangram(i))]);
    const got = readCachedStories();
    assert.ok(got.length <= 20, `cache exceeded cap: ${got.length}`);
    // the MOST RECENT survive (the newest add is retained)
    assert.ok(got.some((s) => normalizeStoryBase(s.base) === normalizeStoryBase(uniquePangram(24))),
      'newest story should be retained after capping');
  });

  test('a garbage batch adds nothing (junk dropped individually)', () => {
    const merged = addGeneratedStories([null, 42, { base: 'no pangram', extra: [] }]);
    assert.deepEqual(merged, []);
  });
});

describe('kk-stories — anti-dup context carries story TEXT only (no PII)', () => {
  beforeEach(() => { installLocalStorageStub(); });

  test('recentStoryBases returns cached base sentences, count-limited', () => {
    addGeneratedStories([genStory(PANGRAM_A)]);
    addGeneratedStories([genStory(PANGRAM_B)]);
    const bases = recentStoryBases(4);
    assert.ok(bases.length >= 1 && bases.length <= 2);
    for (const b of bases) {
      assert.equal(typeof b, 'string');
      assert.ok(coversAllLetters(b), 'a returned base must be a real pangram (game content)');
    }
    // It is JUST the base strings — no objects, no name/age/location fields.
    assert.deepEqual(bases, bases.map(String));
  });

  test('recentStoryBases on empty cache → []', () => {
    assert.deepEqual(recentStoryBases(), []);
  });
});

describe('buildStoryPool folds cached generations in AND keeps the static floor', () => {
  test('cached generations appear BEFORE the static bank', () => {
    const pool = buildStoryPool([genStory(PANGRAM_A), genStory(PANGRAM_B)]);
    assert.equal(pool.length, STATIC_STORIES.length + 2);
    assert.equal(normalizeStoryBase(pool[0].base), normalizeStoryBase(PANGRAM_A));
    // tail is the static bank, verbatim and intact (the offline floor)
    assert.deepEqual(pool.slice(pool.length - STATIC_STORIES.length), STATIC_STORIES);
  });

  test('a generated story duplicating a static base is deduped OUT of the pool', () => {
    const pool = buildStoryPool([genStory(STATIC_STORIES[1].base), genStory(PANGRAM_A)]);
    assert.equal(pool.length, STATIC_STORIES.length + 1); // only the non-dup added
    assert.equal(normalizeStoryBase(pool[0].base), normalizeStoryBase(PANGRAM_A));
  });

  test('two generated stories with the same base collapse to one', () => {
    const pool = buildStoryPool([genStory(PANGRAM_A), genStory(PANGRAM_A)]);
    assert.equal(pool.length, STATIC_STORIES.length + 1);
  });

  test('offline (no generations) → static bank verbatim (winnability floor)', () => {
    assert.deepEqual(buildStoryPool([]), STATIC_STORIES.map((s) => s));
    assert.deepEqual(buildStoryPool(null), STATIC_STORIES.map((s) => s));
  });
});

// tidy up the global after the suite
test('cleanup', () => { clearStoryCache(); resetStubs(); });
