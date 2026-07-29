// Enforces: the parent-added blocked-words settings field is persisted, sanitized, and
// INSTALLED into the live safety filter — additive to the built-in floor, never able to
// weaken it (security.md rule 7 + the house law that a setting only makes play SAFER).
//
// Design sources: js/settings.js (blockedWords model + sanitizeBlockedWords + seeding on
// load/save) and js/word-blocklist.js (the safety authority the setting feeds).

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installLocalStorageStub, resetStubs } from '../helpers/stubs.mjs';
import { loadSettings, saveSettings, getUserBlockedWords, getRows } from '../../js/settings.js';
import { isBlockedWord, setUserBlockedWords } from '../../js/word-blocklist.js';

describe('settings.blockedWords — additive, sanitized, floor-preserving', () => {
  beforeEach(() => { installLocalStorageStub(); setUserBlockedWords([]); });

  test('default settings add nothing (an untouched preferences screen changes nothing)', () => {
    const s = loadSettings();
    assert.deepEqual(s.blockedWords, []);
    assert.ok(isBlockedWord('gun'));       // floor still on
    assert.ok(!isBlockedWord('broccoli')); // nothing extra
  });

  test('saving a parent word installs it into the live filter immediately', () => {
    saveSettings({ blockedWords: ['broccoli', 'BrOccoli'] }); // dup + case
    assert.deepEqual(getUserBlockedWords(), ['broccoli']);    // sanitized + deduped
    assert.ok(isBlockedWord('broccoli'));                     // installed live
    assert.ok(isBlockedWord('gun'));                          // floor preserved
  });

  test('a parent CANNOT drop a floor word through settings', () => {
    // There is no field that removes floor words; even a hostile payload only ADDS.
    saveSettings({ blockedWords: ['anything'] });
    assert.ok(isBlockedWord('hell'), 'floor word removed via settings');
    assert.ok(isBlockedWord('gun'));
  });

  test('garbage in blockedWords degrades to an empty additive layer (never throws)', () => {
    const s = saveSettings({ blockedWords: 'not-an-array' });
    assert.deepEqual(s.blockedWords, []);
    assert.equal(getUserBlockedWords().length, 0);
  });

  test('reloading from storage re-installs the parent words', () => {
    saveSettings({ blockedWords: ['spinach'] });
    setUserBlockedWords([]);          // simulate a fresh boot with the filter cleared
    assert.ok(!isBlockedWord('spinach'));
    loadSettings();                    // boot path re-seeds from kk-settings
    assert.ok(isBlockedWord('spinach'));
  });
});

// Enforces: INV-69 — the settings ROW that surfaces the editor (the UI-model half;
// the editor's own DOM behavior is covered in tests/integration/settings-blocked-words.test.mjs).
describe('settings row — BLOCKED WORDS editor entry point', () => {
  beforeEach(() => { installLocalStorageStub(); setUserBlockedWords([]); });

  test('there is a dedicated action row that opens the blocked-words editor', () => {
    const row = getRows().find((r) => r.key === 'blockedWords');
    assert.ok(row, 'BLOCKED WORDS row exists');
    assert.equal(row.action, true, 'it is an action row (not a value-cycle row)');
    assert.equal(row.editor, 'blockwords', 'it is tagged to open the blockwords editor');
    assert.equal(row.label, 'BLOCKED WORDS');
  });

  test("the row's summary shows the COUNT, never the words themselves", () => {
    const row = getRows().find((r) => r.key === 'blockedWords');
    assert.equal(typeof row.summary, 'function');
    assert.equal(row.summary({ blockedWords: [] }), 'NONE');
    assert.equal(row.summary({ blockedWords: ['broccoli'] }), '1 WORD');
    assert.equal(row.summary({ blockedWords: ['broccoli', 'spinach'] }), '2 WORDS');
    // A malformed value never throws — degrades to NONE.
    assert.equal(row.summary({}), 'NONE');
    assert.equal(row.summary({ blockedWords: 'nope' }), 'NONE');
    // The summary string must not leak the actual word text into the settings screen.
    assert.ok(!row.summary({ blockedWords: ['broccoli'] }).includes('broccoli'));
  });
});

test('cleanup', () => { setUserBlockedWords([]); resetStubs(); });
