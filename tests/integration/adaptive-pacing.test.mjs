// Enforces: INV-70, INV-71 — STRATEGY.md §5 "Adaptive pacing, the hidden layer,
//   and Level 24's name"
//
// Design sources (the test asserts what THESE say, never what the code does):
//   - tech.md §"Adaptive Pacing":
//       "Track average time between correct keypresses. Use rolling average to
//        set prompt display speed. Player slows down → game slows down with
//        them. Player speeds up → game can optionally increase pace.
//        No hard timer — pace is always derived from the player."
//   - product.md §"Core Design Principles" 1 ("Adaptive, Not Competitive"):
//        "The game adapts to the player's pace — if they're slow, the game slows
//         with them. … No lives lost. No timers running out. No forced failure
//         states."
//   - CLAUDE.md §"The One Rule That Overrides Everything" + §"Wrong Keypress
//        Behavior": the letter stays and waits; no double penalty.
//
// Doctrine: the derived pace is read from the engine's declared OBSERVABLE
// surface (`data-pace` on #game-screen) — never a private field, never a
// millisecond-exact timing assertion. The assertions are all directional
// ("stayed at baseline", "got gentler", "did not move"), never exact durations.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  startGame,
  toLevel,
  readPrompt,
  press,
} from '../helpers/game-driver.mjs';

// The engine's observable pace surface. 1.00 is the baseline (no adaptation);
// a larger number means the game has made itself GENTLER for this player.
async function readPace(page) {
  const raw = await page.evaluate(() => {
    const el = document.getElementById('game-screen');
    return el ? el.dataset.pace : null;
  });
  return raw == null ? null : Number(raw);
}

// Poll until the prompt has an active token again (it is briefly null during the
// engine's between-pattern re-render — never a hang, never a timing assertion).
async function waitForPrompt(page, timeoutMs = 4000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const p = await readPrompt(page);
    if (p.activeToken != null) return p;
    if (Date.now() > deadline) return p;
    await page.waitForTimeout(100);
  }
}

// Type `count` correct keystrokes with `gapMs` between them, always pressing the
// token the prompt is actually waiting on. Returns the number pressed.
async function typeAtCadence(page, count, gapMs) {
  let pressed = 0;
  let guard = 0;
  while (pressed < count && guard++ < count * 6) {
    const { activeToken } = await readPrompt(page);
    if (activeToken == null) {
      await page.waitForTimeout(120); // between-pattern re-render
      continue;
    }
    await press(page, activeToken);
    pressed++;
    await page.waitForTimeout(gapMs);
  }
  return pressed;
}

describe('INV-70/71 — adaptive pacing is derived from the player and only ever gentler', () => {
  let g;
  before(async () => { g = await startGame(); });
  after(async () => { await g.stop(); });

  test('INV-70: a level starts at the baseline pace — adaptation is a no-op until the player has typed', async () => {
    await toLevel(g.page, g.baseUrl, 1);
    assert.equal(
      await readPace(g.page), 1,
      'a fresh level must start at the hand-tuned baseline: pacing adapts to THIS session, never inherits a stale rhythm',
    );
  });

  test('INV-70: a player typing at or above the baseline cadence changes nothing (pace never drops below 1)', async () => {
    await toLevel(g.page, g.baseUrl, 1);
    const pressed = await typeAtCadence(g.page, 14, 40);
    assert.ok(pressed >= 10, `expected to land at least 10 correct keys, got ${pressed}`);
    assert.equal(
      await readPace(g.page), 1,
      'tech.md lets the game speed up only OPTIONALLY; we decline — a fast player must get behavior identical to the historical engine, never a game that chases them',
    );
  });

  test('INV-70: a slow player makes the game GENTLER (pace rises), and it stays bounded', async () => {
    await toLevel(g.page, g.baseUrl, 1);
    assert.equal(await readPace(g.page), 1);
    const pressed = await typeAtCadence(g.page, 10, 1100);
    assert.ok(pressed >= 8, `expected to land at least 8 correct keys, got ${pressed}`);
    const pace = await readPace(g.page);
    assert.ok(
      pace > 1,
      `product.md §1: "if they're slow, the game slows with them" — expected the derived pace to rise above baseline, got ${pace}`,
    );
    assert.ok(
      pace <= 2,
      `the adaptation is a feel, never a stall — expected the pace to stay bounded, got ${pace}`,
    );
  });

  test('INV-70: pacing never gates anything — the prompt still waits, and a slow player still advances normally', async () => {
    // Continue from the slow-typing state above (pace > 1): the game must still
    // behave exactly like the base engine — the letter waits, and pressing the
    // right key advances. No prompt is ever withdrawn on a clock.
    const before = await waitForPrompt(g.page);
    assert.ok(before.activeToken != null, 'a prompt must be waiting');
    await g.page.waitForTimeout(3000); // walk away — nothing may happen
    const stillThere = await readPrompt(g.page);
    assert.equal(
      stillThere.activeToken, before.activeToken,
      'CLAUDE.md One Rule: no timer runs out — the same letter must still be waiting after a long idle',
    );
    await press(g.page, stillThere.activeToken);
    await g.page.waitForTimeout(900);
    const after = await readPrompt(g.page);
    assert.ok(
      after.activeIndex !== stillThere.activeIndex || after.tokens.join('') !== stillThere.tokens.join(''),
      'the correct key must advance normally no matter what the derived pace is',
    );
  });

  test('INV-71: a wrong key and a slow self-correction do not move the pace in either direction', async () => {
    await toLevel(g.page, g.baseUrl, 1);
    // Establish a steady, fast baseline first so any movement would be visible.
    await typeAtCadence(g.page, 10, 40);
    const paceBefore = await readPace(g.page);

    const { activeToken } = await waitForPrompt(g.page);
    assert.ok(activeToken != null, 'a prompt must be waiting for the miss probe');
    const wrong = activeToken === 'j' ? 'f' : 'j';
    await press(g.page, wrong);
    await g.page.waitForTimeout(1800); // a SLOW self-correction

    const waiting = await readPrompt(g.page);
    assert.equal(
      waiting.activeToken, activeToken,
      'CLAUDE.md §Wrong Keypress Behavior: the letter stays on screen and waits — the engine never advances',
    );
    assert.ok(waiting.activeToken != null);
    await press(g.page, waiting.activeToken);
    await g.page.waitForTimeout(400);

    assert.equal(
      await readPace(g.page), paceBefore,
      'the wrong-keypress contract sits entirely outside pacing: a miss must never be a pacing penalty, and a slow correction must never make the game "speed up to catch up"',
    );
  });

  test('no console errors across the pacing runs', () => {
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });
});
