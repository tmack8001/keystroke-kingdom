// Enforces: INV-170 — product.md §Core Principle 1 ("No lives lost. No timers running
//   out. No forced failure states. Survival Mode is opt-in only") + the One Rule
//   (CLAUDE.md: "The game should only ever stop a player's flow with joy, never with
//   punishment") + product.md §History Cards ("A card is always guaranteed — a level
//   won't end until a moment word has appeared") + §The Name Moment + act5.md §Level 24
//   (the player's own name is the level's whole point).
//
// The question: in SURVIVAL, a clock expiry replaces the CURRENT prompt with a fresh
// random one. If the current prompt was a GUARANTEED word (history-card moment word,
// Name Moment, Level 24 name), is that guarantee still honoured afterwards? Intended
// behaviour: the guaranteed word comes BACK (or was never discarded) and the level
// remains WINNABLE — a clock expiry costs a quarter (time pressure only) and nothing
// else; it must never silently delete a promised moment and so strand the level.
//
// TF-V1 (RESOLVED 2026-10-31, Trevor's ruling): the guaranteed word is re-queued as the next pattern and
// the clock keeps running — a lost quarter and a returning word (docs/specs/semicolon-teaching-beat.md §5.7).
//
// Driven as the player: real key events, the rendered prompt, the LEVEL COMPLETE card.
// The only liberty is a page clock skew (addInitScript wraps Date.now) so the expiry
// does not need a real 10+ second wait — the same technique as cinematic-skip.test.mjs.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  startGame, toLevel, readPrompt, readHUD, press, isLevelCompleteVisible, isGameOverVisible,
} from '../helpers/game-driver.mjs';
import { cardsForLevel } from '../../js/history-cards.js';

const T = 300_000;
// A normal win of these levels takes well under 150 presses; a level that is still not
// won after this many is not slow, it is stranded.
const MAX_PRESSES = 250;

function slotSeed(name, furthestLevel, cards = []) {
  return {
    'kk-slots': JSON.stringify({
      v: 1, active: 0,
      slots: [{ name, furthestLevel, completed: {}, nameMoment: null, textWorlds: {},
                cards, cardRotation: {}, storyRotation: {} }],
    }),
  };
}

/**
 * Play `level` in Survival. The moment the rendered prompt is exactly one of
 * `targets` (token strings joined) and nothing has been typed yet, let the clock
 * expire ('once', or 'every' = on each of its first FOUR appearances (< the 5 quarters) — a finite purse
 * means unbounded expiries is a legitimate game over, not a stranded level). Then keep typing correct keys until LEVEL COMPLETE or the cap.
 */
async function playThroughExpiryOn(level, targets, { name, settings = {}, cards = [], expire = 'once' } = {}) {
  const g = await startGame({
    settings: { playStyle: 'survival', lives: 5, difficulty: 'expert', playerName: name, ...settings },
    localStorage: slotSeed(name, 25, cards),
  });
  await g.page.addInitScript(() => {
    const real = Date.now.bind(Date);
    window.__skew = 0;
    Date.now = () => real() + window.__skew;
  });
  const obs = { expiredOn: null, quartersBefore: null, quartersAfter: null,
                promptAfterExpiry: null, reappeared: 0, expiries: 0, won: false, gameOver: false, presses: 0, errors: g.consoleErrors };
  try {
    await toLevel(g.page, g.baseUrl, level);
    while (obs.presses < MAX_PRESSES) {
      if (await isLevelCompleteVisible(g.page)) { obs.won = true; break; }
      if (await isGameOverVisible(g.page)) { obs.gameOver = true; break; }   // never spin on a finished run
      const { tokens, activeIndex, activeToken } = await readPrompt(g.page);
      if (activeToken == null) { await g.page.waitForTimeout(80); continue; }
      const word = tokens.join('');
      if (expire !== 'never' && (expire === 'every' ? obs.expiries < 4 : obs.expiredOn == null)
          && activeIndex === 0 && targets.includes(word.toLowerCase())) {
        obs.expiries++;
        obs.expiredOn = word;
        obs.quartersBefore = (await readHUD(g.page)).quarters;
        await g.page.evaluate(() => { window.__skew += 600_000; });
        await g.page.waitForFunction(() => true);
        // wait for the expiry to be processed (a quarter spent)
        for (let i = 0; i < 60; i++) {
          await g.page.waitForTimeout(50);
          if ((await readHUD(g.page)).quarters < obs.quartersBefore) break;
        }
        obs.quartersAfter = (await readHUD(g.page)).quarters;
        obs.promptAfterExpiry = (await readPrompt(g.page)).tokens.join('');
        obs.reappeared = 0;
        continue;
      }
      if (obs.expiredOn != null && activeIndex === 0 && targets.includes(word.toLowerCase())) obs.reappeared++;
      await press(g.page, activeToken);
      obs.presses++;
      await g.page.waitForTimeout(40);
    }
    if (!obs.won) obs.won = await (async () => {
      const end = Date.now() + 8000;
      while (Date.now() < end) { if (await isLevelCompleteVisible(g.page)) return true; await g.page.waitForTimeout(100); }
      return false;
    })();
    return obs;
  } finally { await g.stop(); }
}

function report(label, o) {
  console.log(`[INV-170 probe] ${label}: ${JSON.stringify({ ...o, errors: o.errors.length })}`);
}

describe('INV-170 — a Survival clock expiry never strands a guaranteed word or the level', () => {
  // Level 4 hides two cards. 'asdf' is ALSO one of the level's warm-up drills, so a card
  // whose word is a drill is not an injection at all; mark it collected so the game
  // picks the other ('ada'), which exists in the stream only as the guaranteed splice.
  const adaCard = cardsForLevel(4).find((c) => c.word === 'ada');
  const asdfCard = cardsForLevel(4).find((c) => c.word === 'asdf');

  test('controls: with NO clock expiry the same card and Name Moment scenarios are won', { timeout: T }, async () => {
    const a = await playThroughExpiryOn(4, [adaCard.word], { name: 'PLAYER ONE', cards: [asdfCard.id], expire: 'never' });
    assert.equal(a.won, true, 'card scenario wins when the clock never expires (harness sanity)');
    const b = await playThroughExpiryOn(4, ['sala'], { name: 'sala', settings: { playerName: 'sala' }, expire: 'never' });
    assert.equal(b.won, true, 'Name Moment scenario wins when the clock never expires (harness sanity)');
  });

  test('history-card moment word: expiring on it still lets the level be WON (card guaranteed, never missable)', { timeout: T }, async () => {
    const o = await playThroughExpiryOn(4, [adaCard.word], { name: 'PLAYER ONE', cards: [asdfCard.id] });
    report('card@L4', o);
    assert.ok(o.expiredOn, 'scenario reached: the card word became the current prompt');
    assert.ok(o.quartersAfter < o.quartersBefore, 'the clock really expired (a quarter was spent)');
    assert.equal(o.won, true, 'the level must still be winnable after the expiry; the card word must come back');
  });

  test('Name Moment word: expiring on it still lets the level be WON', { timeout: T }, async () => {
    const o = await playThroughExpiryOn(4, ['sala'], { name: 'sala', settings: { playerName: 'sala' } });
    report('name@L4', o);
    assert.ok(o.expiredOn, 'scenario reached: the name became the current prompt');
    assert.ok(o.quartersAfter < o.quartersBefore, 'the clock really expired');
    assert.equal(o.won, true, 'the level must still be winnable after the expiry; the name must come back');
  });

  test("Level 24's own name: one expiry on it is survivable (the pool copy of the name serves it again)", { timeout: T }, async () => {
    const o = await playThroughExpiryOn(24, ['oona'], { name: 'OONA', settings: { playerName: 'OONA' } });
    report('l24-once@L24', o);
    assert.ok(o.expiredOn, 'scenario reached: the name became the current prompt');
    assert.ok(o.quartersAfter < o.quartersBefore, 'the clock really expired');
    assert.equal(o.won, true);
  });

  test("Level 24's own name: expiring on it FOUR times in a row (4 of 5 quarters) still lets the level be WON", { timeout: T }, async () => {
    const o = await playThroughExpiryOn(24, ['oona'], { name: 'OONA', settings: { playerName: 'OONA' }, expire: 'every' });
    report('l24-every@L24', o);
    assert.equal(o.expiries, 4, 'the name was lost four times and came back each time');
    assert.equal(o.won, true, 'the level must stay winnable, and the name must keep coming back until it is typed');
  });

  test('with the LAST quarter gone, an expiry on a guaranteed word ends in the ordinary game over (resumable) - the word is not what strands the player', { timeout: T }, async () => {
    const o = await playThroughExpiryOn(4, [adaCard.word], {
      name: 'PLAYER ONE', cards: [asdfCard.id], settings: { lives: 1 }, expire: 'every',   // keep expiring until the purse is empty
    });
    report('lastquarter@L4', o);
    assert.ok(o.expiredOn, 'scenario reached');
    assert.equal(o.gameOver, true, 'no quarters left -> the normal, warm game over (product.md Survival)');
    assert.equal(o.errors.length, 0);
  });
});
