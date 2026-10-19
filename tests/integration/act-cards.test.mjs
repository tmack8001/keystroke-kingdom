// Enforces: INV-102 — STRATEGY.md §5 "AN ACT CARD CAN NEVER HANG A SESSION"
//           INV-101 — the act layer is gated at Level 15
//           INV-100 — the card counter is scoped to the card's own BANK
//
// Design sources (the test asserts what THESE say, never what the code does):
//   - product.md §"The One Rule": "the game should only ever stop a player's
//       flow with joy, never with punishment." A session that cannot end is the
//       purest violation of it.
//   - product.md §"History Cards": a level won't end until its moment word has
//       appeared — guaranteed content is earned, never missable. An act card
//       carries the same guarantee, and therefore the same hazard.
//   - docs/specs/act-exclusive-cards.md §5.2 (closure), §5.5 (four per act),
//       and the Free-Play surface: after Level 15 the curriculum cabinets still
//       hand out their own restricted key sets, so Free Play is the ONLY place
//       an Act 1 cabinet and a complete keyboard exist at the same time.
//
// WHY THIS FILE EXISTS. The act-card layer shipped 2026-09-14 with an EMPTY
// bank, which made every one of its hazards unobservable: an empty bank arms no
// gate, so nothing could hang and nothing could double-inject. The first four
// cards were authored 2026-09-15 and the layer went live. Writing content is
// therefore the moment this needs a test, not a moment later — journal F23
// (Level 8 shipped unwinnable because nothing had ever tried to win it) is
// exactly this shape, and an act card that cannot be typed would reproduce it.
//
// Doctrine: the prompt stream is read from the rendered DOM as the player sees
// it, and driven by real key events. No engine internals.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  startGame,
  toSelect,
  readPrompt,
  press,
  isLevelCompleteVisible,
} from '../helpers/game-driver.mjs';
import { ACT_CARDS, ACT_CARD_UNLOCK_LEVEL, cardsForAct, actWordIsTypeable } from '../../js/history-cards.js';

const PLAYER = 'OONA';

// A save that has EARNED the layer: past the Level 15 gate, holding no cards, so
// every act card is still uncollected and the picker has a full pool to draw on.
function seed() {
  return {
    'kk-slots': JSON.stringify({
      v: 1,
      active: 0,
      slots: [{
        name: PLAYER, furthestLevel: 25, completed: {}, nameMoment: null,
        textWorlds: {}, cards: [], cardRotation: {}, storyRotation: {},
      }],
    }),
    'kk-settings': JSON.stringify({ playerName: PLAYER }),
  };
}

// Free Play on whichever cabinet the select screen opens on — which is Act 1's,
// and Act 1 is the act whose cards exist. `F` from the select screen is the
// documented entry (product.md §"Free Play").
// ⚠️ TWO THINGS THIS GOT WRONG BEFORE, both of which reported "unwinnable" about
// a session that had never begun (journal F28 — check the instrument first):
//   1. `F` TOGGLES Free Play mode on the select screen; it does not start
//      anything (js/main.js case 'select').
//   2. Picking a cabinet does not go straight to the game. It goes to the
//      title screen's NAME-CONFIRM step, then the ready screen, then the
//      keyboard preview. That is the real player's route and it is four more
//      keypresses — the same tail `scripts/kk-playwright.js`
//      `goFromSelectIntoGame()` drives for every other browser lane.
async function toFreePlay(page, baseUrl) {
  await toSelect(page, baseUrl);
  await page.waitForTimeout(250);
  await page.keyboard.press('f');          // toggle FREE PLAY on
  await page.waitForTimeout(250);
  await page.keyboard.press('Enter');      // pick the focused (Act 1) cabinet -> name entry
  await page.waitForTimeout(350);
  await page.keyboard.press('Enter');      // confirm the name -> ready screen
  await page.waitForTimeout(350);
  await page.keyboard.press('Space');      // ready -> keyboard preview
  await page.waitForTimeout(350);
  await page.keyboard.press('Space');      // keyboard preview -> the game
  await page.waitForTimeout(900);
}

// Play to completion, recording each DISTINCT pattern in the order the player
// met it. The order is the evidence: it shows both that the act word ARRIVED and
// how many times it did.
async function playAndRecord(page, cap = 600) {
  const order = [];
  let guard = 0;
  while (guard++ < cap) {
    if (await isLevelCompleteVisible(page)) break;
    const { tokens, activeIndex } = await readPrompt(page);
    if (activeIndex < 0 || tokens.length === 0) { await page.waitForTimeout(120); continue; }
    const word = tokens.join('');
    if (order[order.length - 1] !== word) order.push(word);
    for (let i = activeIndex; i < tokens.length; i++) {
      // ⚠️ STOP THE INSTANT THE SESSION IS WON. Free Play patterns are SENTENCES, so
      // the remaining tokens of the winning pattern include SPACES — and Space on the
      // complete overlay is "back to the arcade". Typing blindly to the end of the
      // pattern therefore dismissed the very overlay this test exists to inspect, and
      // the run then reported the session as never completing. (It compounded with a
      // stale read: `#history-card` is a CHILD of `#complete-overlay` and keeps its own
      // visibility class, so the card still read as present after the overlay was gone —
      // which is why "the card revealed" and "the session never completed" were both
      // reported at once, a contradiction that could only be the instrument.)
      if (await isLevelCompleteVisible(page)) return order;
      await press(page, tokens[i]);
      await page.waitForTimeout(35);
    }
    await page.waitForTimeout(140);
  }
  for (let i = 0; i < 60; i++) {
    if (await isLevelCompleteVisible(page)) break;
    await page.waitForTimeout(120);
  }
  return order;
}

async function readRevealedCard(page) {
  return page.evaluate(() => {
    // The OVERLAY must be up, not merely the card element: #history-card lives inside
    // #complete-overlay and keeps its own `hidden` state, so reading the card alone
    // happily returns last screen's card after the overlay has been dismissed.
    const overlay = document.getElementById('complete-overlay');
    if (!overlay || overlay.classList.contains('hidden')) return null;
    const el = document.getElementById('history-card');
    if (!el || el.classList.contains('hidden')) return null;
    const txt = (id) => (document.getElementById(id) || {}).textContent || '';
    return {
      word: txt('history-card-word'),
      title: txt('history-card-title'),
      count: txt('history-card-count'),
    };
  });
}

describe('INV-102 — an act card can never hang a session', () => {
  // The data-level half needs no browser, and it is the half that would catch a
  // bad card before anyone ever played it.
  test('every authored act word is typeable with the keys the gate guarantees', () => {
    ACT_CARDS.forEach((c) => {
      assert.ok(actWordIsTypeable(c.word),
        `"${c.word}" (${c.id}) uses a key the player does not hold at Level ${ACT_CARD_UNLOCK_LEVEL}. ` +
        'An act card ARMS A WIN GATE, so an untypeable word means a session that can never end.');
    });
  });

  test('every act card declares an act that exists, and carries what the reveal draws', () => {
    ACT_CARDS.forEach((c) => {
      assert.ok(Number.isInteger(c.act) && c.act >= 1 && c.act <= 5, `${c.id}: act must be 1-5`);
      ['id', 'word', 'title', 'year', 'fact'].forEach((f) => {
        assert.ok(typeof c[f] === 'string' && c[f].length > 0, `${c.id}: missing ${f}`);
      });
    });
    const ids = ACT_CARDS.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length, 'act card ids must be unique');
  });
});

describe('INV-102/INV-100 — a Free Play session with a live act card completes, and pays exactly one card', () => {
  const ACT1 = cardsForAct(1);
  let g;
  let order;
  let card;

  before(async () => {
    g = await startGame({ localStorage: seed() });
    await toFreePlay(g.page, g.baseUrl);
    order = await playAndRecord(g.page);
    card = await readRevealedCard(g.page);
  });
  after(async () => { await g.stop(); });

  test('the session completes — the act gate is satisfiable in real play', async function () {
    if (!ACT1.length) return; // no Act 1 content yet: the layer is inert by construction
    assert.ok(await isLevelCompleteVisible(g.page),
      `a Free Play session on an Act 1 cabinet must be winnable; patterns met: ${order.join(' | ')}`);
  });

  test('the act word arrived EXACTLY ONCE — it is guaranteed, not duplicated', function () {
    if (!ACT1.length || !card) return;
    const word = card.word.toLowerCase();
    const hits = order.filter((w) => w.toLowerCase() === word).length;
    assert.ok(hits >= 1,
      `the guaranteed act word "${word}" never appeared; patterns met: ${order.join(' | ')}`);
    // ⚠️ Regression guard for a real defect (fixed 2026-09-15): the act branch
    // splices its own pattern AND the generic card-injection block acted on the
    // same `state.currentCard`, so the word was spliced twice and the player
    // typed it twice in one session. Latent while the bank was empty.
    assert.equal(hits, 1,
      `the act word "${word}" was served ${hits} times — a guaranteed injection must be spliced ` +
      `once, not once per code path; patterns met: ${order.join(' | ')}`);
  });

  test('the reveal shows an ACT card counted against the ACT bank, not the arcade one', function () {
    if (!ACT1.length) return;
    assert.ok(card, 'Free Play must reveal the act card it guaranteed');
    assert.ok(ACT1.some((c) => c.word.toLowerCase() === card.word.toLowerCase()),
      `revealed "${card.word}", which is not one of Act 1's cards`);
    // INV-100, one bank later: an act card counted against the arcade bank would
    // read its total (61) instead of the act bank's own.
    const m = /CARD\s+(\d+)\s+OF\s+(\d+)/i.exec(card.count || '');
    assert.ok(m, `the count line must read "CARD n OF m", got: ${JSON.stringify(card.count)}`);
    assert.equal(Number(m[2]), ACT_CARDS.length,
      `the denominator must be the ACT bank (${ACT_CARDS.length}), not another bank's total`);
  });
});
