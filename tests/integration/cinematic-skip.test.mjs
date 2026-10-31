// Enforces: INV-145 — .claude/rules/transitions.md §"Skipping — one rule for all four
// act cinematics" (Trevor, 2026-10-30).
//
// The clause (quoted, not paraphrased):
//   | First viewing (this saved game has never cleared the gating level) |
//       Before the title card: No key skips. Every key is ignored.   On the title card: Space only.
//   | Replay (the gating level was already cleared) |
//       Before the title card: Space or Escape jumps to the title card. Every other key is ignored.
//       On the title card: Space only.
//   "Full Circle has no title card: its last phase is the opening-screen callback that says
//    TYPE YOUR NAME, so there Space or any typed character hands off to Level 21 (after its
//    1s fade-in), and Escape/Tab/arrows/modifiers do nothing."
//   "A held key's auto-repeat is never a decision."
//   "First viewing is derived from progress that already exists — the gating level's
//    `completed` flag read before it is recorded."  (Replay of Level 5 -> skippable Mystery.)
//
// Why it matters: until 2026-10-30 ANY key skipped, so a first-timer's stray key at ~8s jumped
// to the ACT 2 card and the child never saw "HELLO. YOU FOUND ME." or the secret door.
//
// How it is observed (no engine internals): the cinematics draw only on the canvas, so the
// observable is the one thing a player sees change — whether the cinematic is still on screen
// (no `.screen` visible) or has handed off to the next level's READY screen. "Did a key skip
// to the title card?" is answered behaviourally: a SECOND Space that follows would end the
// cinematic if and only if the first had already put it on the title card. The cinematics are
// 25-50 s long, so a test-only page clock (performance.now + requestAnimationFrame timestamps
// moved forward together) stands in for waiting; it is injected by the test, not the game.
//
// Every cinematic is reached the real way: seed the save, resume, play the gating level to its
// win at machine speed, press Space on the LEVEL COMPLETE card.

import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  startGame, readScreen, slotsSeed, winLevel,
} from '../helpers/game-driver.mjs';

const T = 300_000;
const SETTLE = 450;
const CINEMATICS = [
  { level: 5,  module: 'mystery',       next: 6 },
  { level: 10, module: 'basement',      next: 11 },
  { level: 15, module: 'commandcenter', next: 16 },
  { level: 20, module: 'fullcircle',    next: 21 },
];

let current = null;
afterEach(async () => { if (current) { await current.stop(); current = null; } });

// Move the page's animation clock forward (performance.now AND rAF timestamps together, so the
// cinematic's render loop and its key handling agree about what time it is).
async function installClock(page) {
  await page.addInitScript(() => {
    window.__skew = 0;
    const now = performance.now.bind(performance);
    performance.now = () => now() + window.__skew;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => raf((t) => cb(t + window.__skew));
  });
}
const fastForward = (page, ms) => page.evaluate((n) => { window.__skew += n; }, ms);
const FAR = 150_000; // comfortably past the last phase of every cinematic

async function tap(page, key, ms = 200) { await page.keyboard.press(key); await page.waitForTimeout(ms); }

// Seed a save, resume it, play the gating level to its win, then press Space on the card.
// `replay` seeds the gating level as already cleared.
async function intoCinematic(level, replay) {
  const g = await startGame({
    localStorage: {
      'kk-slots': slotsSeed({
        name: 'OONA', furthestLevel: level, completed: replay ? { [String(level)]: true } : {},
      }),
    },
  });
  current = g;
  await installClock(g.page);
  await g.page.goto(g.baseUrl);
  await g.page.waitForTimeout(SETTLE + 300);
  await g.page.click('body');
  await tap(g.page, ' ', SETTLE);        // attract title -> the saved game's READY (or picker)
  if ((await readScreen(g.page)) === 'slots-screen') await tap(g.page, ' ', SETTLE);
  assert.equal(await readScreen(g.page), 'ready-screen', 'resumed to READY');
  await tap(g.page, ' ', SETTLE);        // -> KNOW YOUR KEYS
  await tap(g.page, ' ', 900);           // -> the game
  assert.equal(await readScreen(g.page), 'game-screen', `Level ${level} is on screen`);
  await winLevel(g.page);
  await tap(g.page, ' ', 700);           // LEVEL COMPLETE card -> the cinematic
  assert.equal(await readScreen(g.page), null, `the Level ${level} cinematic owns the screen`);
  return g;
}

const stillCinematic = async (page, why) =>
  assert.equal(await readScreen(page), null, `still in the cinematic: ${why}`);
const handedOff = async (page, next, why) => {
  await page.waitForTimeout(250);
  assert.equal(await readScreen(page), 'ready-screen', `handed off to Level ${next}'s READY: ${why}`);
};

for (const { level, module, next } of CINEMATICS) {
  const fullCircle = module === 'fullcircle';

  describe(`INV-145 — Level ${level} cinematic (${module}): the first viewing cannot be skipped`, () => {
    test('stray keys incl. Space and Escape are ignored; only Space on the title card continues', { timeout: T }, async () => {
      const { page } = await intoCinematic(level, false);

      for (const k of [' ', 'Escape', 'a', 'Enter', 'ArrowRight', 'Tab', 'Shift']) {
        await tap(page, k, 150);
        await stillCinematic(page, `${JSON.stringify(k)} on a first viewing`);
      }
      // If any of those had jumped to the title card, this Space would now END the cinematic.
      await tap(page, ' ', 300);
      await stillCinematic(page, 'a follow-up Space proves nothing above skipped');

      await fastForward(page, FAR);          // the whole cinematic has played out
      await page.waitForTimeout(1300);       // (Full Circle: past its 1 s fade-in)
      for (const k of ['Escape', 'Tab', 'ArrowDown', 'ArrowRight', 'Shift', 'Enter']) {
        await tap(page, k, 150);
        await stillCinematic(page, `${k} on the ${fullCircle ? 'TYPE YOUR NAME screen' : 'title card'}`);
      }
      if (!fullCircle) {
        await tap(page, 'a', 150);
        await stillCinematic(page, 'a letter on the title card (it says PRESS SPACE)');
      }
      await tap(page, ' ', 300);
      await handedOff(page, next, 'Space on the final card');
    });
  });

  describe(`INV-145 — Level ${level} cinematic (${module}): a replay skips on Space or Escape only`, () => {
    test('Space skips (other keys never do); a held Space never counts; then ' + (fullCircle ? 'a typed character' : 'Space') + ' continues', { timeout: T }, async () => {
      const { page } = await intoCinematic(level, true);

      // Every key that is not Space/Escape is ignored. If any of them had jumped ahead, the
      // Space below would be a SECOND press and would end the cinematic outright.
      for (const k of ['a', 'Enter', 'ArrowRight', 'Tab', 'Shift']) {
        await tap(page, k, 150);
        await stillCinematic(page, `${k} on a replay`);
      }
      await page.keyboard.down(' ');            // the skip
      await page.waitForTimeout(150);
      await stillCinematic(page, 'Space on a replay jumps to the title card, it does not finish');
      for (let i = 0; i < 4; i++) { await page.keyboard.down(' '); await page.waitForTimeout(60); } // auto-repeat
      await page.keyboard.up(' ');
      await page.waitForTimeout(150);
      await stillCinematic(page, "a held key's auto-repeat is never a decision");

      if (fullCircle) {
        await tap(page, ' ', 100);
        await stillCinematic(page, 'a key landing inside the opening screen\'s 1 s fade-in cannot skip it unseen');
        await page.waitForTimeout(1300);
        for (const k of ['Escape', 'Tab', 'ArrowDown', 'ArrowRight', 'Shift']) {
          await tap(page, k, 150);
          await stillCinematic(page, `${k} is not typing`);
        }
        await tap(page, 'a', 300);
      } else {
        for (const k of ['Escape', 'a', 'Tab']) {
          await tap(page, k, 150);
          await stillCinematic(page, `${k} on the title card (it says PRESS SPACE TO CONTINUE)`);
        }
        await tap(page, ' ', 300);
      }
      await handedOff(page, next, 'the final key');
    });

    test('Escape skips too; then ' + (fullCircle ? 'Space' : 'Space') + ' continues', { timeout: T }, async () => {
      const { page } = await intoCinematic(level, true);
      await page.keyboard.down('Escape');
      await page.waitForTimeout(150);
      for (let i = 0; i < 3; i++) { await page.keyboard.down('Escape'); await page.waitForTimeout(60); }
      await page.keyboard.up('Escape');
      await page.waitForTimeout(150);
      await stillCinematic(page, 'Escape skipped (it did not end the cinematic) and its repeats did nothing');
      if (fullCircle) await page.waitForTimeout(1300);
      // Had Escape NOT skipped, this Space would only be the skip and the cinematic would remain.
      await tap(page, ' ', 300);
      await handedOff(page, next, 'Space after an Escape skip');
    });
  });
}

describe('INV-145 — a cinematic started without the flag defaults to unskippable', () => {
  for (const { module } of CINEMATICS) {
    test(`${module}: start(cb) with no options ignores Space and Escape before the end card`, { timeout: T }, async () => {
      const g = await startGame();
      current = g;
      await installClock(g.page);
      await g.page.goto(g.baseUrl);
      await g.page.waitForTimeout(SETTLE + 300);
      const done = await g.page.evaluate(async (m) => {
        const mod = await import(new URL(`js/${m}.js`, location.href).href);
        window.__done = false;
        mod.start(() => { window.__done = true; });          // the caller "forgot" the flag
        mod.confirm(' '); mod.confirm('Escape'); mod.confirm(' ');
        return window.__done;
      }, module);
      assert.equal(done, false, 'Space/Escape cannot end or skip a cinematic that was not told it is a replay');
      await fastForward(g.page, FAR);
      await g.page.waitForTimeout(1300);
      const after = await g.page.evaluate(async (m) => {
        const mod = await import(new URL(`js/${m}.js`, location.href).href);
        mod.confirm('Escape');
        const afterEsc = window.__done;
        mod.confirm(' ');
        return { afterEsc, afterSpace: window.__done };
      }, module);
      assert.equal(after.afterEsc, false, 'Escape never finishes the end card');
      assert.equal(after.afterSpace, true, 'Space finishes it');
    });
  }
});
