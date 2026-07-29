// Enforces: the single-source kid-safety blocklist contract (journal L41 — a contract
// implemented twice in two languages must be PINNED by a test asserting identical
// output) + the additive/floor-preserving safety invariant (security.md rule 7 + the
// game's house law that a setting can only ever make things SAFER, never less safe:
// Survival is opt-in, difficulty is additive, the server safety prompt is unremovable).
//
// Design sources:
//   - js/word-blocklist.js header: BASE_WORDS is the immovable floor; parent words are
//     additive-only and untrusted (allowlisted).
//   - main.go chatWordBlocklist header: the SERVER mirror of BASE_WORDS, kept identical.
//   - security.md rule 7 (LLM/free-text content is untrusted; sanitize at the boundary).

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  BASE_WORDS, isBlockedWord, hasBlockedWord, setUserBlockedWords, userBlockedWordCount,
} from '../../js/word-blocklist.js';

// The ONE canonical file both languages read: main.go embeds+unmarshals it into
// chatWordBlocklist, and js/word-blocklist.js imports it as BASE_WORDS. Reading it here
// verifies the client import wired the same file, unmangled.
function fileWords() {
  const raw = JSON.parse(readFileSync(new URL('../../js/word-blocklist.json', import.meta.url), 'utf8'));
  return raw.words.map((w) => String(w).toLowerCase().trim()).filter(Boolean);
}

describe('single source — BASE_WORDS IS js/word-blocklist.json (one file, both langs)', () => {
  test('client BASE_WORDS equals the canonical JSON file exactly', () => {
    assert.deepEqual([...BASE_WORDS], fileWords());
    assert.ok(BASE_WORDS.length >= 25, 'blocklist floor is suspiciously small');
  });

  test("'hell' is in the canonical file (Trevor's fix) — and thus on both sides", () => {
    assert.ok(fileWords().includes('hell'), 'hell missing from js/word-blocklist.json');
    assert.ok(new Set(BASE_WORDS).has('hell'));
    // (The Go side loads the SAME file — asserted by TestChatWordBlocklistLoaded.)
  });
});

describe('BASE_WORDS is the immovable floor', () => {
  test('a built-in word is always blocked, with no user words set', () => {
    setUserBlockedWords([]);
    assert.ok(isBlockedWord('gun'));
    assert.ok(isBlockedWord('hell'));
    assert.ok(!isBlockedWord('hello')); // exact-word only — never over-blocks
    assert.ok(hasBlockedWord('the gun is loud'));
    assert.ok(!hasBlockedWord('the sun is warm'));
  });

  test('a user list can NEVER remove a floor word (additive only)', () => {
    // Even if a caller tries to "replace" the list with something innocuous, the floor
    // still blocks. There is no API that removes a BASE word — by construction.
    setUserBlockedWords(['pumpkin']);
    assert.ok(isBlockedWord('gun'), 'floor word was somehow removed');
    assert.ok(isBlockedWord('pumpkin'), 'user word not added');
    setUserBlockedWords([]); // reset
  });
});

describe('parent-added words are additive, sanitized, and bounded (rule 7)', () => {
  test('a clean parent word is added on top of the floor', () => {
    setUserBlockedWords(['broccoli']);
    assert.ok(isBlockedWord('broccoli'));
    assert.ok(hasBlockedWord('i hate broccoli so much'));
    assert.ok(isBlockedWord('gun')); // floor still enforced
    setUserBlockedWords([]);
  });

  test('entries are lowercased and stripped to letters only', () => {
    setUserBlockedWords(['BrOccoli!!', 'spam42']);
    assert.ok(isBlockedWord('broccoli'));
    assert.ok(isBlockedWord('spam')); // trailing digits stripped
    setUserBlockedWords([]);
  });

  test('too-short / too-long / non-string entries are dropped', () => {
    setUserBlockedWords(['a', 'x'.repeat(50), 42, null, {}, 'okayword']);
    assert.ok(!isBlockedWord('a'));
    assert.ok(!isBlockedWord('x'.repeat(50)));
    assert.ok(isBlockedWord('okayword'));
    setUserBlockedWords([]);
  });

  test('the list is de-duped and count-capped', () => {
    const many = Array.from({ length: 100 }, (_, i) => `blockword${'abcdefghij'[i % 10]}`);
    setUserBlockedWords([...many, 'blockworda', 'blockworda']);
    assert.ok(userBlockedWordCount() <= 40, `count not capped: ${userBlockedWordCount()}`);
    setUserBlockedWords([]);
  });

  test('a floor word passed by a parent is not double-counted', () => {
    setUserBlockedWords(['gun', 'brandnewword']);
    assert.equal(userBlockedWordCount(), 1, 'floor word should not enter the user set');
    setUserBlockedWords([]);
  });

  test('garbage / non-array input yields an empty additive layer (never throws)', () => {
    setUserBlockedWords(null);
    assert.equal(userBlockedWordCount(), 0);
    setUserBlockedWords('not an array');
    assert.equal(userBlockedWordCount(), 0);
  });
});
