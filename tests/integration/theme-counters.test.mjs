// Enforces: INV-152 — STRATEGY.md §5 "The 2026-10-30 sign-off wave".
//
// Design source: journal F30 / theme-authoring.md §Layout ("counters under the HUD badge or
// falling off the canvas") and the persona playtest of 2026-10-30, where Level 13 read
// "PAGES 111 / 22": the theme's win-gate accumulator keeps climbing after the book is full
// (the ENGINE's own minimum-patterns gate usually ends the level later), and the DISPLAY must
// be clamped — "a counter never exceeds its own total" (js/themes/myst.js comment). Q*bert's
// CUBES/WORDS and Out Run's STAGE counters carry the same clamp. A child who can read
// "111 / 22" is told the game is broken.
//
// What is asserted is the behavioural invariant ONLY — n <= total in every "WORD n / m"
// counter the theme draws across a whole winning play. Where the counters sit on the canvas
// (the 2026-10-30 relocation out from under the HUD badge) is geometry and is NOT asserted
// here (testing.md rule 4); that, the L22 speech bubble and the F-Zero legend are covered by
// persona playtest only.
//
// OBSERVABLE: the words the theme draws (draw-recorder.mjs — strings, never positions).

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startGame, toLevel, readPrompt, press, isLevelCompleteVisible } from '../helpers/game-driver.mjs';
import { installDrawRecorder } from '../helpers/draw-recorder.mjs';

const T = 400_000;
const COUNTER = /^(PAGES|STAGE|CUBES|WORDS)\s+(\d+)\s*\/\s*(\d+)\s*$/;

const drain = (page) => page.evaluate(() => { const d = window.__kkDraw || []; window.__kkDraw = []; return d; });

async function playCollecting(page) {
  const seen = []; // { label, n, total }
  const take = (strings) => {
    for (const s of strings) { const m = COUNTER.exec(s); if (m) seen.push({ label: m[1], n: Number(m[2]), total: Number(m[3]) }); }
  };
  let presses = 0;
  while (presses < 6000 && !(await isLevelCompleteVisible(page))) {
    const { activeToken } = await readPrompt(page);
    if (activeToken == null) { await page.waitForTimeout(80); take(await drain(page)); continue; }
    await press(page, activeToken);
    presses++;
    await page.waitForTimeout(40);
    if (presses % 4 === 0) take(await drain(page));
  }
  for (let i = 0; i < 60 && !(await isLevelCompleteVisible(page)); i++) { await page.waitForTimeout(100); take(await drain(page)); }
  take(await drain(page));
  return seen;
}

const THEMES = [
  { level: 13, name: 'Myst', labels: ['PAGES'] },
  { level: 21, name: 'Out Run', labels: ['STAGE'] },
  { level: 22, name: 'Q*bert', labels: ['CUBES'] },
];

for (const { level, name, labels } of THEMES) {
  describe(`INV-152 — Level ${level} (${name}): a counter never exceeds its own total`, () => {
    let g; let seen;
    before(async () => {
      g = await startGame();
      await installDrawRecorder(g.page);
      await toLevel(g.page, g.baseUrl, level);
      await g.page.waitForTimeout(500);
      seen = await playCollecting(g.page);
    });
    after(async () => { await g.stop(); });

    test('the level completes and its counter is on screen', { timeout: T }, async () => {
      assert.ok(await isLevelCompleteVisible(g.page), 'the level is winnable');
      for (const l of labels) assert.ok(seen.some((s) => s.label === l), `a "${l} n / m" counter was drawn during play`);
    });

    test('n <= total in every counter drawn, through the whole play', { timeout: T }, () => {
      const bad = seen.filter((s) => s.n > s.total);
      assert.deepEqual(bad.slice(0, 5), [], `a counter read past its own total (e.g. "PAGES 111 / 22"): ${JSON.stringify(bad.slice(0, 5))}`);
      assert.ok(seen.every((s) => s.total > 0), 'every counter has a real total');
    });

    test('no console errors', () => {
      assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
    });
  });
}
