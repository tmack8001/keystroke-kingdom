// Enforces: INV-137 — product.md §"Survival is challenging, never cruel — two
// floors" (Trevor, 2026-10-30):
//   "The 15-streak mercy quarter works at 1 quarter too. With several quarters it
//    hands back one you lost; with ONE quarter there is nothing to hand back, so
//    the mercy could never fire. At 1 quarter, the first 15-streak of the run earns
//    one spare quarter (shown as a second coin) — a one-time reprieve. Once spent,
//    a 1-quarter run is back to its chosen rule."
//   "No prompt is ever given less than 10 seconds. The per-pattern clock scales with
//    length, which left a one-letter prompt ~5.4s at EXPERT — a child glancing away
//    briefly lost a quarter on the SHORTEST prompt."
// and the laws above them: CLAUDE.md §One Rule / product.md §1 ("even in Survival,
// wrong keys cost nothing — time pressure only"), INV-10/INV-11.
//
// Observables: the survival countdown bar the player watches (its drain rate IS the
// time allowed — sampled over 2.5 s so the test need not wait the full allowance),
// the quarters on the HUD, and the GAME OVER overlay.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  startGame, toLevel, readPrompt, readHUD, press, isGameOverVisible, readScreen,
} from '../helpers/game-driver.mjs';

const T = 240_000;

// The floor from the design doc: "No prompt is ever given less than 10 seconds."
// A small tolerance covers sampling noise; the doc's old figure was ~5.4 s, so a
// 9.5 s bar still separates broken from fixed by a wide margin.
const DOC_FLOOR_MS = 10_000;
const SAMPLING_TOLERANCE_MS = 500;

async function sampleAllowanceMs(page) {
  // Drain-rate method: the bar falls linearly from 100% to 0 over the allowance.
  return page.evaluate(() => new Promise((resolve) => {
    const bar = document.getElementById('survival-timer-bar');
    const pct = () => parseFloat(bar.style.width);
    const t1 = performance.now(); const p1 = pct();
    setTimeout(() => {
      const t2 = performance.now(); const p2 = pct();
      resolve({ p1, p2, ms: (p1 - p2) > 0 ? ((t2 - t1) / (p1 - p2)) * 100 : Infinity });
    }, 2500);
  }));
}

describe('INV-137 — no prompt is ever given less than 10 seconds', () => {
  for (const difficulty of ['novice', 'arcade', 'expert']) {
    test(`a one-letter prompt at ${difficulty.toUpperCase()} is allowed at least the documented floor`, { timeout: T }, async () => {
      const g = await startGame({ settings: { playStyle: 'survival', lives: 3, difficulty } });
      try {
        await toLevel(g.page, g.baseUrl, 1);
        const p = await readPrompt(g.page);
        assert.equal(p.tokens.length, 1, 'Level 1 opens on a one-letter prompt — the shortest one there is');
        const { ms, p1, p2 } = await sampleAllowanceMs(g.page);
        assert.ok(p1 > p2, `the clock is running (${p1}% -> ${p2}%)`);
        assert.ok(ms >= DOC_FLOOR_MS - SAMPLING_TOLERANCE_MS,
          `${difficulty}: a one-letter prompt is allowed ~${Math.round(ms)}ms; the design floor is ${DOC_FLOOR_MS}ms`);
        assert.equal((await readHUD(g.page)).quarters, 3, 'and nothing was lost');
        assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
      } finally { await g.stop(); }
    });
  }

  test('the clock still exists: an unattended Survival run does reach a warm GAME OVER (the floor is not "no clock")', { timeout: T }, async () => {
    const g = await startGame({ settings: { playStyle: 'survival', lives: 1, difficulty: 'expert' } });
    try {
      await toLevel(g.page, g.baseUrl, 1);
      const deadline = Date.now() + 60_000;
      while (Date.now() < deadline && !(await isGameOverVisible(g.page))) await g.page.waitForTimeout(250);
      assert.equal(await isGameOverVisible(g.page), true);
    } finally { await g.stop(); }
  });
});

describe('INV-137 — at ONE quarter the first 15-streak of a run earns one spare quarter', () => {
  let g;
  before(async () => {
    // WIZARD (3.5x EXPERIENCE) only makes the level LONGER (INV-12: more play, never a penalty), so
    // the ~45 keystrokes this scenario types can never accidentally win the level mid-test.
    g = await startGame({ settings: { playStyle: 'survival', lives: 1, difficulty: 'novice', winRatio: 3.5 } });
    await toLevel(g.page, g.baseUrl, 1);
  });
  after(async () => { await g.stop(); });

  // Type correct keys until the purse changes (or the cap). Returns how many correct keys it took.
  async function typeUntilQuarters(target, cap = 60) {
    let correct = 0;
    for (let i = 0; i < cap; i++) {
      let p = await readPrompt(g.page);
      for (let w = 0; w < 30 && p.activeToken == null; w++) { await g.page.waitForTimeout(60); p = await readPrompt(g.page); }
      if (p.activeToken == null) break;
      await press(g.page, p.activeToken);
      correct++;
      await g.page.waitForTimeout(45);
      if ((await readHUD(g.page)).quarters === target) return correct;
    }
    return null;
  }
  async function waitForQuarters(target, ms = 40_000) {
    const deadline = Date.now() + ms;
    while (Date.now() < deadline) {
      if ((await readHUD(g.page)).quarters === target) return true;
      await g.page.waitForTimeout(250);
    }
    return false;
  }

  test('a run starts with one quarter', async () => {
    assert.equal((await readHUD(g.page)).quarters, 1);
  });

  test('the 15th correct key in a row hands over a spare — a SECOND coin appears, and not before', { timeout: T }, async () => {
    const n = await typeUntilQuarters(2);
    assert.equal(n, 15, 'the spare arrives on the 15-streak, exactly');
    assert.equal((await readHUD(g.page)).quarters, 2, 'two coins are shown');
    assert.equal(await isGameOverVisible(g.page), false);
  });

  test('wrong keys during the streak cost nothing (the spare is earned by skill, never taxed by mistakes)', { timeout: T }, async () => {
    const before = (await readHUD(g.page)).quarters;
    for (let i = 0; i < 5; i++) { await press(g.page, 'z'); await g.page.waitForTimeout(30); }
    assert.equal((await readHUD(g.page)).quarters, before);
  });

  test('once spent, the run is back to the rule the player chose: another 15-streak earns NOTHING', { timeout: T }, async () => {
    assert.ok(await waitForQuarters(1), 'letting a prompt time out spends the spare (2 -> 1) without ending the run');
    assert.equal(await isGameOverVisible(g.page), false, 'a run with a spare does not end on its first timeout');
    const n = await typeUntilQuarters(2, 16);   // one key past the 15th — enough to fire if it were going to
    assert.equal(n, null, 'a second 15-streak in the same run does not mint another spare');
    assert.equal((await readHUD(g.page)).quarters, 1);
  });

  test('after TRY AGAIN the next run earns its own spare, again on the 15-streak', { timeout: T }, async () => {
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline && !(await isGameOverVisible(g.page))) await g.page.waitForTimeout(250);
    assert.equal(await isGameOverVisible(g.page), true, 'unattended, the last quarter eventually runs out');
    await press(g.page, ' ');                                   // TRY AGAIN
    for (let i = 0; i < 40 && (await readScreen(g.page)) !== 'game-screen'; i++) await g.page.waitForTimeout(150);
    assert.equal((await readHUD(g.page)).quarters, 1, 'a fresh run, one quarter');
    const n = await typeUntilQuarters(2);
    assert.equal(n, 15);
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });
});

describe('INV-137 — with SEVERAL quarters the mercy is unchanged: it hands one back, up to the starting count', () => {
  test('3 quarters: a 15-streak never mints a 4th', { timeout: T }, async () => {
    const g = await startGame({ settings: { playStyle: 'survival', lives: 3, difficulty: 'novice' } });
    try {
      await toLevel(g.page, g.baseUrl, 1);
      for (let i = 0; i < 20; i++) {
        let p = await readPrompt(g.page);
        for (let w = 0; w < 30 && p.activeToken == null; w++) { await g.page.waitForTimeout(60); p = await readPrompt(g.page); }
        await press(g.page, p.activeToken);
        await g.page.waitForTimeout(45);
      }
      assert.equal((await readHUD(g.page)).quarters, 3, 'a full purse stays a full purse');
    } finally { await g.stop(); }
  });
});
