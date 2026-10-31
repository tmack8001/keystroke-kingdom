// Enforces: INV-151 (with INV-52 standing) — STRATEGY.md §5.
//
// Design sources:
//   - INV-52 (Act 6, im-friend-build.md §3): "from EVERY imfriend view (picker, make, chat)
//     Escape is owned by the hub, exactly as for every other world — no imfriend sub-view
//     can intercept or swallow it." So Escape ALWAYS goes to the Text Worlds chooser.
//   - js/textworld/imfriend.js "TRUE wording (INV-52): Escape goes to the Text Worlds
//     chooser, not the friends list." The chat and make-a-friend footers used to say
//     "ESC — back to your friends", a promise the key did not keep. A footer that names where
//     a key goes must name where it goes (the same shape as INV-146 for the complete card).
//
// OBSERVABLE: the wing draws only on the canvas, so the observable is the words it draws
// (tests/helpers/draw-recorder.mjs; strings only) plus where Escape actually lands (the
// chooser's own heading, drawn by the hub).

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startGame, toTextWorldDoor, readScreen } from '../helpers/game-driver.mjs';
import { installDrawRecorder, captureDrawn, drawnIncludes } from '../helpers/draw-recorder.mjs';
import { CURATED } from '../../js/textworld/personas.js';

const T = 90_000;
const HUB_IMFRIEND_INDEX = 4;               // the hub lists the IM-friend 5th (see textworld-imfriend.test.mjs fixture check)
const CHOOSER_HEADING = 'THE TEXT WORLDS';
const ESC_LINE = /ESC\b[^a-z]*back to /i;   // the footer clause that names Escape's destination

async function enterImfriendPicker(page, baseUrl) {
  await toTextWorldDoor(page, baseUrl);
  await page.keyboard.press('Space');       // door -> chooser
  await page.waitForTimeout(400);
  for (let n = 0; n < HUB_IMFRIEND_INDEX; n++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(100); }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
}
const footerLines = (drawn) => [...new Set(drawn)].filter((s) => ESC_LINE.test(s));

describe('INV-151 — IM-friend footers say where Escape really goes', () => {
  let g;
  before(async () => { g = await startGame(); await installDrawRecorder(g.page); });
  after(async () => { await g.stop(); });

  test('the CHAT footer says back to the Text Worlds (never "your friends"), and Escape does go to the chooser', { timeout: T }, async () => {
    await enterImfriendPicker(g.page, g.baseUrl);
    await g.page.keyboard.press('Enter');                       // open the first curated friend
    await g.page.waitForTimeout(400);
    const lines = footerLines(await captureDrawn(g.page, 3));
    assert.ok(lines.length > 0, 'the chat view draws an Escape footer');
    for (const l of lines) {
      assert.match(l, /back to the Text Worlds/i, `the chat footer names the real destination: ${l}`);
      assert.ok(!/your friends/i.test(l), `Escape does not go back to the friends list: ${l}`);
    }
    await g.page.keyboard.press('Escape');
    await g.page.waitForTimeout(400);
    assert.equal(await readScreen(g.page), null, 'still on the wing canvas (the chooser)');
    assert.ok(drawnIncludes(await captureDrawn(g.page, 3), CHOOSER_HEADING), 'Escape from the chat landed on the Text Worlds chooser');
  });

  test('the MAKE-A-FRIEND footer says back to the Text Worlds, and Escape does go to the chooser', { timeout: T }, async () => {
    await g.page.keyboard.press('Enter');                       // chooser -> the IM-friend (cursor is still on it)
    await g.page.waitForTimeout(500);
    for (let i = 0; i < CURATED.length; i++) { await g.page.keyboard.press('ArrowDown'); await g.page.waitForTimeout(80); }
    await g.page.keyboard.press('Enter');                       // "MAKE A NEW FRIEND"
    await g.page.waitForTimeout(400);
    const lines = footerLines(await captureDrawn(g.page, 3));
    assert.ok(lines.length > 0, 'the make-a-friend view draws an Escape footer');
    for (const l of lines) {
      assert.match(l, /back to the Text Worlds/i, `the make footer names the real destination: ${l}`);
      assert.ok(!/your friends/i.test(l), `Escape does not go back to the friends list: ${l}`);
    }
    await g.page.keyboard.press('Escape');
    await g.page.waitForTimeout(400);
    assert.ok(drawnIncludes(await captureDrawn(g.page, 3), CHOOSER_HEADING), 'Escape from the make view landed on the Text Worlds chooser');
  });

  test('no console errors', () => {
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });
});
