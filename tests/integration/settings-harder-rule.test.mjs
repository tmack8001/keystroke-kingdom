// Enforces: INV-134 — product.md §"Choosing a harder rule asks once" (Trevor,
// 2026-10-30):
//   "SURVIVAL is opt-in, and it used to be one accidental keypress away: Tab → → →
//    Esc on the title saved it instantly, and kk-settings is machine-wide, so it
//    reached every family member's game. Moving PLAY STYLE to SURVIVAL now asks:
//    YOU CHOSE 1979 RULES — KEEP IT?  Y / N
//    - Only Y keeps it. N, Escape, Tab, an arrow, or any other key keeps the easier value…
//    - An unconfirmed harder value is never saved, not even if the tab is closed
//      while the question is on screen. It lives only on screen until Y.
//    - Easier changes stay instant — moving back to ADVENTURE never asks."
// plus CLAUDE.md §One Rule / product.md §1 ("Survival Mode is opt-in only — never
// the default") — the whole point is that no accident can opt a child in.
//
// Interaction: real keys on the real Settings screen (Tab from the attract title).
// Observables: the question's visibility and wording, the PLAY STYLE row the player
// reads, and the persisted `kk-settings` (the machine-wide promise).

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startGame, toTitle, readScreen } from '../helpers/game-driver.mjs';

const SETTLE = 350;
const T = 90_000;

async function openSettings(g) {
  await toTitle(g.page, g.baseUrl);
  await g.page.keyboard.press('Tab');
  await g.page.waitForTimeout(SETTLE);
  assert.equal(await readScreen(g.page), 'settings-screen');
}
const savedStyle = (page) => page.evaluate(() => {
  try { return (JSON.parse(localStorage.getItem('kk-settings') || '{}') || {}).playStyle ?? null; } catch (e) { return 'garbage'; }
});
const questionShown = (page) => page.evaluate(() => {
  const el = document.getElementById('settings-harder-confirm');
  return !!el && !el.classList.contains('hidden');
});
const questionText = (page) => page.evaluate(() => (document.getElementById('settings-harder-confirm') || {}).textContent || '');
const selectedRow = (page) => page.evaluate(() => {
  const el = document.querySelector('#settings-rows .settings-row.selected');
  return el ? el.textContent.replace(/\s+/g, ' ').trim().toUpperCase() : '';
});
const tap = async (page, key) => { await page.keyboard.press(key); await page.waitForTimeout(SETTLE); };

describe('INV-134 — moving PLAY STYLE to SURVIVAL asks first; nothing is saved until Y', () => {
  let g;
  before(async () => { g = await startGame(); });
  after(async () => { await g.stop(); });

  test('the PLAY STYLE row is first and starts on ADVENTURE (the default, nothing saved)', { timeout: T }, async () => {
    await openSettings(g);
    const row = await selectedRow(g.page);
    assert.match(row, /PLAY STYLE/);
    assert.match(row, /ADVENTURE/);
    assert.notEqual(await savedStyle(g.page), 'survival');
    assert.equal(await questionShown(g.page), false);
  });

  test('moving right to SURVIVAL asks "KEEP IT?" with Y / N — the harder value is shown but NOT saved', { timeout: T }, async () => {
    await tap(g.page, 'ArrowRight');
    assert.equal(await questionShown(g.page), true, 'the question is on screen');
    const text = (await questionText(g.page)).toUpperCase();
    assert.match(text, /KEEP IT/);
    assert.match(text, /Y/); assert.match(text, /N/);
    assert.match(await selectedRow(g.page), /SURVIVAL/, 'the player sees what they are being asked to keep');
    assert.notEqual(await savedStyle(g.page), 'survival', 'kk-settings does NOT hold SURVIVAL while the question is up');
  });

  test('N keeps ADVENTURE: the question goes, the row says ADVENTURE, nothing saved as SURVIVAL', { timeout: T }, async () => {
    await tap(g.page, 'n');
    assert.equal(await questionShown(g.page), false);
    assert.match(await selectedRow(g.page), /ADVENTURE/);
    assert.notEqual(await savedStyle(g.page), 'survival');
  });

  for (const [label, key] of [['Escape', 'Escape'], ['Tab', 'Tab'], ['an arrow (down)', 'ArrowDown'], ['an unrelated key (x)', 'x'], ['Space', ' '], ['Enter', 'Enter']]) {
    test(`${label} while the question is up also keeps the EASIER value — never saved`, { timeout: T }, async () => {
      await openSettings(g);
      await tap(g.page, 'ArrowRight');
      assert.equal(await questionShown(g.page), true);
      await tap(g.page, key);
      assert.equal(await questionShown(g.page), false, 'the question is consumed');
      assert.notEqual(await savedStyle(g.page), 'survival', `${label} must never opt a child in`);
    });
  }

  test('"not even if the tab is closed while the question is on screen": a reload mid-question finds ADVENTURE', { timeout: T }, async () => {
    await openSettings(g);
    await tap(g.page, 'ArrowRight');
    assert.equal(await questionShown(g.page), true);
    await g.page.reload();
    await g.page.waitForTimeout(SETTLE + 300);
    assert.notEqual(await savedStyle(g.page), 'survival');
    await g.page.click('body');
    await g.page.keyboard.press('Tab');
    await g.page.waitForTimeout(SETTLE);
    assert.equal(await readScreen(g.page), 'settings-screen');
    assert.match(await selectedRow(g.page), /ADVENTURE/, 'settings reopen on ADVENTURE');
  });

  test('Y (or y) keeps it: SURVIVAL is saved, the question goes; and it survives a reload', { timeout: T }, async () => {
    for (const yes of ['y', 'Y']) {
      await openSettings(g);
      await tap(g.page, 'ArrowRight');
      assert.equal(await questionShown(g.page), true);
      await tap(g.page, yes);
      assert.equal(await questionShown(g.page), false);
      assert.equal(await savedStyle(g.page), 'survival', `${yes} confirms`);
      assert.match(await selectedRow(g.page), /SURVIVAL/);
      await g.page.reload();
      await g.page.waitForTimeout(SETTLE + 300);
      assert.equal(await savedStyle(g.page), 'survival', 'persisted');
    }
  });

  test('moving back to ADVENTURE never asks — it is instant and saved', { timeout: T }, async () => {
    // continue from the saved-SURVIVAL state the previous case left behind
    await g.page.click('body');
    await g.page.keyboard.press('Tab');
    await g.page.waitForTimeout(SETTLE);
    assert.equal(await readScreen(g.page), 'settings-screen');
    assert.match(await selectedRow(g.page), /SURVIVAL/);
    await tap(g.page, 'ArrowLeft');
    assert.equal(await questionShown(g.page), false, 'an easier move is not questioned');
    assert.match(await selectedRow(g.page), /ADVENTURE/);
    assert.equal(await savedStyle(g.page), 'adventure');
  });

  test('other levers stay instant: EXPERIENCE up one rung asks nothing', { timeout: T }, async () => {
    for (let i = 0; i < 20 && !/EXPERIENCE/.test(await selectedRow(g.page)); i++) await tap(g.page, 'ArrowDown');
    assert.match(await selectedRow(g.page), /EXPERIENCE/, 'found the EXPERIENCE row');
    await tap(g.page, 'ArrowRight');
    assert.equal(await questionShown(g.page), false, 'a harder EXPERIENCE tier is MORE play, chosen on purpose — no question');
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });
});
