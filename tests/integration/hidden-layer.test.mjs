// Enforces: INV-72, INV-73, INV-75 — STRATEGY.md §5 "Adaptive pacing, the hidden
//   layer, and Level 24's name"
//
// Design sources (the test asserts what THESE say, never what the code does):
//   - easter-eggs.md §"Design Rules (non-negotiable)":
//       1. "Never interrupt flow. Eggs only answer when summoned by name.
//           Nothing pops up unprompted during play."
//       5. "Eggs are for finding, not telling. The game never advertises them."
//   - easter-eggs.md §Proposed #2 (`sudo` → "PERMISSION GRANTED. YOU ALWAYS HAD
//       IT."), #9 (`allyourbase` → "ALL YOUR KEYS ARE BELONG TO YOU."),
//       #8 (the one-time post-Level-20 eighth-key confession),
//       #4 (the rubber duck: "Level 22+ hint text once says: STUCK? TELL THE DUCK.")
//   - CLAUDE.md §"the eighth key": never called by its programmer name in-game.
//   - onboarding.md §"Design Rules for the Opening": the very first prompt's
//       finger guide is "the only unprompted hint in the whole game."
//   - CLAUDE.md §"Wrong Keypress Behavior": the letter stays and waits.
//
// Doctrine: every assertion is on player-observable DOM, driven by real key
// events. No engine internals, no timing assertions.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  startGame,
  toTitle,
  toLevel,
  readPrompt,
  press,
  winLevel,
  isLevelCompleteVisible,
} from '../helpers/game-driver.mjs';

const woprLine = (page) => page.evaluate(() => document.getElementById('wopr-text').textContent);
const visibleScreen = (page) => page.evaluate(() =>
  [...document.querySelectorAll('.screen')].filter((s) => !s.classList.contains('hidden')).map((s) => s.id).join(','));
const confessionText = (page) => page.evaluate(() => {
  const el = document.getElementById('eighth-key-confession');
  return el ? el.textContent : null;
});
const hintText = (page) => page.evaluate(() => document.getElementById('finger-hint').textContent);

// One saved game, parked at the level under test, with nothing completed yet.
function seedSlot(furthestLevel) {
  return {
    'kk-slots': JSON.stringify({
      v: 1,
      active: 0,
      slots: [{
        name: 'OONA', furthestLevel, completed: {}, nameMoment: null,
        textWorlds: {}, cards: [], cardRotation: {}, storyRotation: {},
      }],
    }),
    'kk-settings': JSON.stringify({ playerName: 'OONA' }),
  };
}

describe('INV-72 — title-screen magic words answer only when summoned', () => {
  let g;
  before(async () => { g = await startGame(); });
  after(async () => { await g.stop(); });

  test('the attract screen advertises nothing — the WOPR line is empty until a word is typed', async () => {
    await toTitle(g.page, g.baseUrl);
    assert.equal(
      (await woprLine(g.page)).trim(), '',
      'easter-eggs.md rule 5: "the game never advertises them" — nothing may appear unbidden',
    );
  });

  test('`sudo` answers with the xkcd-149 blessing, softened into the game\'s own promise', async () => {
    await toTitle(g.page, g.baseUrl);
    await g.page.keyboard.type('sudo', { delay: 40 });
    await g.page.waitForTimeout(300);
    assert.equal(await woprLine(g.page), 'PERMISSION GRANTED. YOU ALWAYS HAD IT.');
    assert.equal(
      await visibleScreen(g.page), 'title-screen',
      'easter-eggs.md rule 1: an egg answers, it never takes the player anywhere',
    );
  });

  test('`allyourbase` answers with the Zero Wing line inverted into the game\'s promise', async () => {
    await toTitle(g.page, g.baseUrl);
    await g.page.keyboard.type('allyourbase', { delay: 40 });
    await g.page.waitForTimeout(300);
    assert.equal(await woprLine(g.page), 'ALL YOUR KEYS ARE BELONG TO YOU.');
    assert.equal(await visibleScreen(g.page), 'title-screen');
  });

  test('the WarGames bypass still works alongside the new words', async () => {
    await toTitle(g.page, g.baseUrl);
    await g.page.keyboard.type('wopr', { delay: 40 });
    await g.page.waitForTimeout(600);
    assert.equal(
      await visibleScreen(g.page), 'select-screen',
      'adding egg phrases must never shadow the SECRET_PHRASES bypass',
    );
  });

  test('no console errors from the egg probes', () => {
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });
});

describe('INV-73 — the eighth-key confession is a once-ever reveal that never names the key', () => {
  let g;
  before(async () => { g = await startGame({ localStorage: seedSlot(20) }); });
  after(async () => { await g.stop(); });

  test('the first Level 20 completion in a saved game carries the confession; a replay never repeats it', async () => {
    await toLevel(g.page, g.baseUrl, 20);
    await winLevel(g.page, { maxPresses: 1500 });
    assert.ok(await isLevelCompleteVisible(g.page), 'level 20 must complete');

    const first = await confessionText(g.page);
    assert.ok(first, 'easter-eggs.md #8: the first-ever Level 20 completion reveals the confession');
    assert.match(first, /THE EIGHTH KEY HAS A NAME/);
    assert.match(
      first, /;\s*$/,
      'the joke is that the line ENDS with the character — that is what makes it a confession',
    );
    assert.doesNotMatch(
      first, /semi/i,
      'CLAUDE.md: the eighth key is never called by its programmer name in-game (INV-29)',
    );

    // R replays this same level in this same saved game.
    await g.page.keyboard.press('r');
    await g.page.waitForTimeout(1200);
    await winLevel(g.page, { maxPresses: 1500 });
    assert.ok(await isLevelCompleteVisible(g.page), 'the replay must also complete');
    assert.equal(
      await confessionText(g.page), null,
      'a once-ever reveal must not re-fire on replay — the latch is that saved game\'s own Level 20 record',
    );
  });

  test('no console errors across the Level 20 runs', () => {
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });
});

describe('INV-75 — the rubber duck rides alongside a hint, never instead of one', () => {
  let g;
  before(async () => { g = await startGame({ localStorage: seedSlot(25) }); });
  after(async () => { await g.stop(); });

  test('below Level 22 the duck never appears, and the normal hint is unchanged', async () => {
    await toLevel(g.page, g.baseUrl, 21);
    const { activeToken } = await readPrompt(g.page);
    await press(g.page, activeToken === 'q' ? 'w' : 'q');
    await g.page.waitForTimeout(400);
    const hint = await hintText(g.page);
    assert.ok(hint.trim().length > 0, 'a wrong keypress still earns the normal finger hint');
    assert.doesNotMatch(hint, /DUCK/, 'the duck belongs to Level 22 and up');
  });

  test('at Level 22 the duck appears ONCE, beneath a real hint, and never unprompted', async () => {
    await toLevel(g.page, g.baseUrl, 22);
    assert.equal(
      (await hintText(g.page)).trim(), '',
      'onboarding.md: hints only ever follow a wrong keypress — the duck must not add a second unprompted-hint exception',
    );

    const before = await readPrompt(g.page);
    await press(g.page, before.activeToken === 'q' ? 'w' : 'q');
    await g.page.waitForTimeout(400);

    const withDuck = await hintText(g.page);
    assert.match(withDuck, /STUCK\? TELL THE DUCK\./, 'easter-eggs.md #4');
    assert.ok(
      withDuck.replace('STUCK? TELL THE DUCK.', '').trim().length > 0,
      'the duck is APPENDED to the finger hint — the help must never be replaced by the wink',
    );

    // The sacred wrong-keypress contract is untouched by the egg.
    const waiting = await readPrompt(g.page);
    assert.equal(
      waiting.activeToken, before.activeToken,
      'CLAUDE.md: the letter stays on screen and waits — an easter egg changes nothing about that',
    );

    // Correct it, then miss again: the duck is once-ever.
    await press(g.page, waiting.activeToken);
    await g.page.waitForTimeout(500);
    const next = await readPrompt(g.page);
    if (next.activeToken != null) {
      await press(g.page, next.activeToken === 'q' ? 'w' : 'q');
      await g.page.waitForTimeout(400);
      const again = await hintText(g.page);
      assert.ok(again.trim().length > 0, 'later wrong keys still earn the normal hint');
      assert.doesNotMatch(again, /DUCK/, 'the duck is a single quiet moment, not a recurring line');
    }
  });

  test('no console errors from the duck runs', () => {
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });
});
