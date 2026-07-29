// Enforces: INV-69 — the parent-facing BLOCKED WORDS editor (additive-only,
// floor-immutable, sanitize-at-boundary, textContent-only, Escape-safe). The
// model/live-filter half (INV-68) is covered by the unit tests; THIS file drives
// the real editor UI in a real browser through real key/mouse events and asserts
// only player-observable DOM + persisted localStorage.
//
// Design sources (the test asserts what THESE say, never what the code does):
//   - product.md §"Toggleable Settings" / §One Rule: a parent control is a toggle
//     that can only make play SAFER; the default (empty list) changes nothing;
//     Escape always exits cleanly (never trapped).
//   - security.md rule 1 (user-typed text → textContent, never innerHTML),
//     rule 4 (localStorage untrusted → sanitized on read), rule 7 (free text
//     allowlisted at the boundary: [a-z], length 2–20, dedup, cap 40).
//   - js/word-blocklist.js: BASE_WORDS is an immovable FLOOR; a parent may only
//     ADD an additive layer, never remove a floor word.
//
// Doctrine (STRATEGY.md §2, §rule 6): reach state via the keyboard, assert
// observable state (visible screen, rendered chips, the settings row summary,
// kk-settings). The floor word used is DERIVED from js/word-blocklist.json (the
// single source of truth), never hardcoded from engine constants.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  startGame,
  coldOpenToTitle,
  readScreen,
} from '../helpers/game-driver.mjs';
import blockData from '../../js/word-blocklist.json' with { type: 'json' };

const HARD_TIMEOUT = 120000;
const SETTLE = 180;

// A real floor word, derived from the canonical list (prefer the mild 'gun').
const FLOOR_WORD = blockData.words.includes('gun') ? 'gun' : blockData.words[0];

// A hostile string that must NEVER be interpreted as HTML if it reached a DOM
// sink. If any chip/list render used innerHTML instead of textContent, the
// element with id="pwned" would appear (and window.__pwned would be set).
const HOSTILE = '<img src=x onerror="window.__pwned=1" id="pwned">';

// ── observable-state readers (DOM/localStorage only) ─────────────────────────

async function readSettingsRows(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('#settings-rows .settings-row')].map((r) => ({
      label: r.querySelector('.settings-row-label')?.textContent || '',
      value: r.querySelector('.settings-row-value')?.textContent || '',
      selected: r.classList.contains('selected'),
    })),
  );
}

async function readChips(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('#blockword-list .blockword-chip .blockword-chip-text')].map(
      (e) => e.textContent,
    ),
  );
}

async function readStatus(page) {
  return page.evaluate(() => document.getElementById('blockword-status')?.textContent || '');
}

async function readStoredBlocked(page) {
  return page.evaluate(() => {
    try {
      return (JSON.parse(localStorage.getItem('kk-settings')) || {}).blockedWords || [];
    } catch {
      return null;
    }
  });
}

// Navigate the settings row cursor to the row with the given label.
async function selectSettingsRow(page, label) {
  for (let i = 0; i < 40; i++) {
    const rows = await readSettingsRows(page);
    const sel = rows.find((r) => r.selected);
    if (sel && sel.label === label) return;
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(70);
  }
  throw new Error(`settings row not found: ${label}`);
}

// From the title/attract screen: Tab → Settings, cursor to BLOCKED WORDS, Enter
// → open the editor. Leaves the input focused for typing.
async function openEditor(page) {
  await page.keyboard.press('Tab');
  await page.waitForTimeout(SETTLE);
  assert.equal(await readScreen(page), 'settings-screen', 'Tab opened Settings');
  await selectSettingsRow(page, 'BLOCKED WORDS');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(SETTLE);
  assert.equal(await readScreen(page), 'blockwords-screen', 'Enter opened the editor');
  await page.click('#blockword-input'); // guarantee the add box is focused
}

// Type a word into the (focused) add box and confirm with Enter.
async function addWord(page, text) {
  await page.click('#blockword-input');
  await page.fill('#blockword-input', ''); // start from empty
  await page.keyboard.type(text, { delay: 25 });
  await page.waitForTimeout(80);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(SETTLE);
}

describe('INV-69 — the BLOCKED WORDS parent editor', () => {
  let g;
  before(async () => {
    // Boot a returning player with a KNOWN clean (empty) blocked list, straight
    // to the attract title so Tab reaches Settings.
    g = await startGame({ settings: { playerName: 'PARENT', blockedWords: [] } });
    await coldOpenToTitle(g.page, g.baseUrl);
  });
  after(async () => { await g.stop(); });

  test('reachable from Settings; default editor is empty and changes nothing', {
    timeout: HARD_TIMEOUT,
  }, async () => {
    await openEditor(g.page);
    assert.deepEqual(await readChips(g.page), [], 'no parent words by default');
    assert.deepEqual(await readStoredBlocked(g.page), [], 'kk-settings blockedWords empty');
  });

  test('typing a word + Enter adds a chip, persists, and updates the count', {
    timeout: HARD_TIMEOUT,
  }, async () => {
    await addWord(g.page, 'broccoli');
    assert.deepEqual(await readChips(g.page), ['broccoli'], 'chip rendered');
    assert.deepEqual(await readStoredBlocked(g.page), ['broccoli'], 'persisted to kk-settings');
  });

  test('sanitize at the boundary: mixed-case/symbols normalize to [a-z] lowercase', {
    timeout: HARD_TIMEOUT,
  }, async () => {
    await addWord(g.page, 'Spin4ch!');           // → 'spinch' (digits/symbols stripped)
    const chips = await readChips(g.page);
    assert.ok(chips.includes('spinch'), `normalized to lowercase [a-z]: ${chips}`);
    assert.ok(!chips.some((c) => /[^a-z]/.test(c)), 'no chip contains a non-[a-z] char');
  });

  test('sanitize: a too-short entry is rejected (never added)', {
    timeout: HARD_TIMEOUT,
  }, async () => {
    const before = await readChips(g.page);
    await addWord(g.page, 'a'); // len 1 after sanitize → rejected
    const after = await readChips(g.page);
    assert.deepEqual(after, before, 'a 1-letter entry adds nothing');
    assert.match(await readStatus(g.page), /2-20|LETTERS/i, 'told the parent why');
  });

  test('the built-in FLOOR is never shown and has no add/remove path', {
    timeout: HARD_TIMEOUT,
  }, async () => {
    const before = await readChips(g.page);
    await addWord(g.page, FLOOR_WORD);
    const after = await readChips(g.page);
    assert.deepEqual(after, before, 'a floor word adds NO removable chip');
    assert.ok(!after.includes(FLOOR_WORD), 'floor word is not a parent chip');
    assert.match(await readStatus(g.page), /ALREADY BLOCKED/i, 'reported as already blocked');
    // And it never entered the persisted parent list either.
    const stored = await readStoredBlocked(g.page);
    assert.ok(!stored.includes(FLOOR_WORD), 'floor word not persisted into the parent layer');
  });

  test('duplicates are deduped (adding the same word twice is a no-op)', {
    timeout: HARD_TIMEOUT,
  }, async () => {
    const before = await readChips(g.page);
    await addWord(g.page, 'broccoli'); // already present
    const after = await readChips(g.page);
    assert.equal(
      after.filter((c) => c === 'broccoli').length,
      1,
      'broccoli appears exactly once',
    );
    assert.deepEqual(after, before, 'no chip added on a duplicate');
  });

  test('Backspace on the empty box removes the highlighted parent word', {
    timeout: HARD_TIMEOUT,
  }, async () => {
    const before = await readChips(g.page);
    assert.ok(before.length > 0, 'precondition: at least one chip to remove');
    await g.page.click('#blockword-input');
    await g.page.fill('#blockword-input', ''); // ensure empty
    await g.page.keyboard.press('Backspace');
    await g.page.waitForTimeout(SETTLE);
    const after = await readChips(g.page);
    assert.equal(after.length, before.length - 1, 'exactly one parent word removed');
    // The removal only ever touches the parent layer — the list shrank by one.
    const stored = await readStoredBlocked(g.page);
    assert.equal(stored.length, after.length, 'persisted list matches the rendered chips');
  });

  test('clicking a chip removes that parent word', {
    timeout: HARD_TIMEOUT,
  }, async () => {
    // Make sure there is a specific chip to click.
    if (!(await readChips(g.page)).includes('broccoli')) await addWord(g.page, 'broccoli');
    const before = await readChips(g.page);
    // Click the broccoli chip.
    await g.page.evaluate(() => {
      const chip = [...document.querySelectorAll('#blockword-list .blockword-chip')].find(
        (c) => c.querySelector('.blockword-chip-text')?.textContent === 'broccoli',
      );
      chip?.click();
    });
    await g.page.waitForTimeout(SETTLE);
    const after = await readChips(g.page);
    assert.ok(!after.includes('broccoli'), 'clicked chip removed');
    assert.equal(after.length, before.length - 1, 'exactly one removed');
  });

  test('a hostile typed string never reaches a DOM sink (textContent only)', {
    timeout: HARD_TIMEOUT,
  }, async () => {
    await addWord(g.page, HOSTILE);
    // Whatever survived sanitize is [a-z] only; no injected element/global.
    const pwned = await g.page.evaluate(() => ({
      global: window.__pwned || null,
      el: !!document.getElementById('pwned'),
    }));
    assert.equal(pwned.global, null, 'no onerror executed');
    assert.equal(pwned.el, false, 'no injected #pwned element');
    const chips = await readChips(g.page);
    assert.ok(!chips.some((c) => /[<>"=]/.test(c)), 'no markup characters in any chip');
  });

  test('Escape exits cleanly to Settings, and the row summary shows the live count', {
    timeout: HARD_TIMEOUT,
  }, async () => {
    const chips = await readChips(g.page);
    await g.page.keyboard.press('Escape');
    await g.page.waitForTimeout(SETTLE);
    assert.equal(await readScreen(g.page), 'settings-screen', 'Escape returned to Settings');
    const rows = await readSettingsRows(g.page);
    const row = rows.find((r) => r.label === 'BLOCKED WORDS');
    assert.ok(row, 'the BLOCKED WORDS row is present');
    const expected = chips.length === 0 ? 'NONE' : `${chips.length} WORD${chips.length === 1 ? '' : 'S'}`;
    assert.equal(row.value, expected, 'summary reflects the parent-added count, not the words');
    assert.ok(!row.value.includes('broccoli'), 'the row never leaks a word');
  });

  test('no console errors across the whole editor flow', {
    timeout: HARD_TIMEOUT,
  }, async () => {
    assert.deepEqual(g.consoleErrors, [], `console errors: ${g.consoleErrors.join('\n')}`);
  });
});
