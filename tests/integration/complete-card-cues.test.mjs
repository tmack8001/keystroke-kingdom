// Enforces: INV-146 — STRATEGY.md §5 "The 2026-10-30 sign-off wave"; product.md §Level
// Completion ("full celebration… the big moment") + the card's own contract: the cue on a
// LEVEL COMPLETE card must name the destination its key actually reaches.
//
// Clauses:
//   - Level 4's card said PRESS SPACE FOR THE MYSTERY, but Space goes to LEVEL 5 (the
//     Mystery cinematic follows Level 5, levels/act1.md; transitions.md "Trigger: the final
//     word of Level 5") -> the cue must say NEXT LEVEL, and Space must go to Level 5.
//   - Level 25 is the last level (act5.md): Space ends it by returning to the attract TITLE,
//     so the cue must say so, and Space really goes there.
//   - Escape on a complete card is UNCHANGED (roadmap 2026-10-30 left it as an open question
//     for Trevor, so this test pins today's behaviour as a decision, not an accident): it
//     leaves the card for READY on the SAME level, and the win is already saved
//     (recordLevelComplete runs when the card appears) so nothing is lost.
//
// Real route: seed a save, resume, play the level to its win at machine speed, look at the
// card, press the key.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { startGame, readScreen, slotsSeed, winLevel, readActiveSlotProgress } from '../helpers/game-driver.mjs';

const T = 400_000;
const SETTLE = 450;
const tap = async (page, key, ms = SETTLE) => { await page.keyboard.press(key); await page.waitForTimeout(ms); };
const text = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent : null; }, sel);

async function playToCard(level) {
  const g = await startGame({ localStorage: { 'kk-slots': slotsSeed({ name: 'OONA', furthestLevel: level }) } });
  await g.page.goto(g.baseUrl);
  await g.page.waitForTimeout(SETTLE + 300);
  await g.page.click('body');
  assert.equal(await readScreen(g.page), 'slots-screen');
  await tap(g.page, ' ');                           // resume
  assert.equal(await readScreen(g.page), 'ready-screen');
  assert.match(await text(g.page, '#ready-screen'), new RegExp(`LEVEL\\s+${level}\\b`), 'resumed on the level under test');
  await tap(g.page, ' ');                           // KNOW YOUR KEYS
  await tap(g.page, ' ', 900);                      // the game
  assert.equal(await readScreen(g.page), 'game-screen');
  await winLevel(g.page, { maxPresses: 8000 });
  await g.page.waitForTimeout(400);
  return g;
}

describe('INV-146 — Level 4 card: Space is NEXT LEVEL', () => {
  test('the cue says next level (not the Mystery) and Space goes to Level 5', { timeout: T }, async () => {
    const g = await playToCard(4);
    try {
      const cue = (await text(g.page, '#complete-prompt')).toUpperCase();
      assert.ok(cue.includes('SPACE'), `the cue names the key: ${cue}`);
      assert.ok(cue.includes('NEXT LEVEL'), `Space goes to the next level, so the cue says so: ${cue}`);
      assert.ok(!/SPACE FOR THE MYSTERY/.test(cue), `Space does not go to the Mystery from Level 4: ${cue}`);
      await tap(g.page, ' ', 700);
      assert.equal(await readScreen(g.page), 'ready-screen', 'Space reaches a READY screen (no cinematic after Level 4)');
      assert.match(await text(g.page, '#ready-screen'), /LEVEL\s+5\b/);
    } finally { await g.stop(); }
  });

  test('Escape leaves the card for READY on the SAME level, with the win already saved', { timeout: T }, async () => {
    const g = await playToCard(4);
    try {
      await tap(g.page, 'Escape', 700);
      assert.equal(await readScreen(g.page), 'ready-screen');
      assert.match(await text(g.page, '#ready-screen'), /LEVEL\s+4\b/, 'Escape goes to READY for the level just won, not the next');
      const progress = await readActiveSlotProgress(g.page);
      assert.ok(!!progress.completed['4'], 'Level 4 is recorded as cleared before Escape');
      assert.ok(progress.furthestLevel >= 5, `the next level is already unlocked, got furthest ${progress.furthestLevel}`);
    } finally { await g.stop(); }
  });
});

describe('INV-146 — Level 25 card: Space goes to the title screen', () => {
  test('the cue says the title screen, and Space really goes there', { timeout: T }, async () => {
    const g = await playToCard(25);
    try {
      const cue = (await text(g.page, '#complete-prompt')).toUpperCase();
      assert.ok(cue.includes('SPACE') && cue.includes('TITLE'), `the last card says Space goes to the title screen: ${cue}`);
      await tap(g.page, ' ', 900);
      assert.equal(await readScreen(g.page), 'title-screen', 'Space on the last card lands on the attract title');
    } finally { await g.stop(); }
  });
});
