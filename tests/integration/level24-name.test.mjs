// Enforces: INV-74 — STRATEGY.md §5 "Adaptive pacing, the hidden layer, and
//   Level 24's name"
//
// Design sources (the test asserts what THESE say, never what the code does):
//   - levels/act5.md §"Level 24 — Shift (Capitals)":
//       "Game: High Score Entry — this is the 'type your own name in all caps'
//        level. The player types their name: OONA. It appears as a high score
//        entry. Personal, irreplaceable."
//       "You already know every letter. Now make them BIG."
//   - product.md §"History Cards": a level won't end until its moment word has
//        appeared — guaranteed content is earned, never missable. Level 24's
//        name carries the same guarantee.
//   - product.md §"The Name Moment": the pre-Shift lowercase personalization is
//        a separate beat; Level 24's ALL-CAPS ceremony is its own thing.
//   - docs/ROADMAP.md §3 "Level 24 pattern crowding".
//
// Doctrine: the prompt stream is read from the rendered DOM as the player sees
// it, and driven by real key events. No engine internals.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  startGame,
  toLevel,
  readPrompt,
  press,
  isLevelCompleteVisible,
} from '../helpers/game-driver.mjs';
import { cardsForLevel } from '../../js/history-cards.js';
import { LEVELS } from '../../js/levels.js';

// Level 24's own warm-up drills, straight from the curriculum data (never a
// constant copied out of engine code — testing.md rule 4).
const INTRO_24 = new Set(LEVELS[24].intro.map((p) => p.join('')));

const PLAYER = 'OONA';

function seed(winRatio) {
  return {
    'kk-slots': JSON.stringify({
      v: 1,
      active: 0,
      slots: [{
        name: PLAYER, furthestLevel: 25, completed: {}, nameMoment: null,
        textWorlds: {}, cards: [], cardRotation: {}, storyRotation: {},
      }],
    }),
    'kk-settings': JSON.stringify({ playerName: PLAYER, winRatio }),
  };
}

// Play level 24 to completion, recording each DISTINCT pattern in the order the
// player met it (the rendered prompt, de-duplicated across re-reads).
async function playAndRecord(page) {
  const order = [];
  let guard = 0;
  while (guard++ < 400) {
    if (await isLevelCompleteVisible(page)) break;
    const { tokens, activeIndex } = await readPrompt(page);
    if (activeIndex < 0 || tokens.length === 0) { await page.waitForTimeout(120); continue; }
    const word = tokens.join('');
    if (order[order.length - 1] !== word) order.push(word);
    for (let i = activeIndex; i < tokens.length; i++) {
      await press(page, tokens[i]);
      await page.waitForTimeout(45);
    }
    await page.waitForTimeout(160);
  }
  // Let the victory animation land on the complete overlay.
  for (let i = 0; i < 60; i++) {
    if (await isLevelCompleteVisible(page)) break;
    await page.waitForTimeout(120);
  }
  return order;
}

describe('INV-74 — Level 24 guarantees the player\'s own name and never stacks its guaranteed injections', () => {
  let g;
  let order;
  before(async () => {
    g = await startGame({ localStorage: seed(1) });
    await toLevel(g.page, g.baseUrl, 24);
    await g.page.waitForTimeout(600);
    order = await playAndRecord(g.page);
  });
  after(async () => { await g.stop(); });

  test('the level completes', async () => {
    assert.ok(await isLevelCompleteVisible(g.page), `level 24 must be winnable; patterns met: ${order.join(' | ')}`);
  });

  test('the player types their own name, in capitals, before the level can end', () => {
    assert.ok(
      order.includes('Oona'),
      `act5.md: Level 24 IS "the player types their own name" — it must be guaranteed content, not an arithmetic accident. Patterns met: ${order.join(' | ')}`,
    );
  });

  test('the name is the first thing after the warm-up drills — the marquee moment, not a mid-list filler', () => {
    let lead = 0;
    while (lead < order.length && INTRO_24.has(order[lead])) lead++;
    assert.equal(
      order.indexOf('Oona'), lead,
      `the guaranteed name must be the FIRST pattern after the intro drills — act5.md's marquee moment, not something met mid-list. Met: ${order.join(' | ')}`,
    );
  });

  test('the guaranteed card word is never adjacent to the guaranteed name', () => {
    const cardWords = cardsForLevel(24).map((c) => c.word);
    const cardIdx = order.findIndex((p) => cardWords.includes(p));
    const nameIdx = order.indexOf('Oona');
    assert.ok(cardIdx >= 0, `the level's guaranteed history-card word must appear; met: ${order.join(' | ')}`);
    assert.ok(
      Math.abs(cardIdx - nameIdx) > 1,
      `ROADMAP §3 (crowding): the two guaranteed injections must not sit back to back — the level's own words belong between them. Met: ${order.join(' | ')}`,
    );
  });

  test('at least one of the level\'s own capitalized words is played between them', () => {
    const cardWords = cardsForLevel(24).map((c) => c.word);
    const cardIdx = order.findIndex((p) => cardWords.includes(p));
    const nameIdx = order.indexOf('Oona');
    const [lo, hi] = cardIdx < nameIdx ? [cardIdx, nameIdx] : [nameIdx, cardIdx];
    const between = order.slice(lo + 1, hi).filter((p) => p !== 'Oona' && !cardWords.includes(p));
    assert.ok(
      between.length >= 1,
      `expected the level's own content between the guaranteed injections; met: ${order.join(' | ')}`,
    );
  });

  test('no lowercase copy of the name appears on the capitals level', () => {
    assert.ok(
      !order.includes('oona'),
      `act5.md: Level 24 is "now make them BIG" — the pre-Shift lowercase name visitor belongs to earlier levels. Met: ${order.join(' | ')}`,
    );
  });

  test('no console errors', () => {
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });
});

describe('INV-74 — the guarantee holds at a higher EXPERIENCE tier too', () => {
  let g;
  let order;
  before(async () => {
    g = await startGame({ localStorage: seed(2.25) }); // HOTSHOT — more play, never a penalty
    await toLevel(g.page, g.baseUrl, 24);
    await g.page.waitForTimeout(600);
    order = await playAndRecord(g.page);
  });
  after(async () => { await g.stop(); });

  test('the level still completes and the name is still guaranteed', async () => {
    assert.ok(await isLevelCompleteVisible(g.page), `level 24 must stay winnable at every tier; met: ${order.join(' | ')}`);
    assert.ok(order.includes('Oona'), `the name guarantee is tier-independent; met: ${order.join(' | ')}`);
  });

  test('no console errors', () => {
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });
});
