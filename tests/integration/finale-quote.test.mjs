// Enforces: INV-63 (+ end-to-end INV-62/64/65) — the Level 25 "MY STORY" coda is a
// GUARANTEED, never-missable POST-TARGET finale that ESCALATES by EXPERIENCE tier,
// makes the player type EVERY letter A–Z, and never traps the player (the One Rule
// winnability floor).
//
// Design sources (the test asserts what THESE say, never what the code does):
//   - product.md §5 (full-keyboard mastery) + §Word Length: L25 is the "true entire
//        keyboard unlocked" level; the coda is the last typed moment and covers A–Z,
//        and EXPERIENCE ("ages with the player") gates how much a player earns.
//   - CLAUDE.md §"The One Rule": a level that won't end is a One Rule violation —
//        winnability is never traded away; the coda gate must always CLEAR.
//   - js/keyboard-story.js + js/finale-quote.js + js/main.js §startCoda /
//        handleGameKey codaPending gate: L25 plays its normal pool to the traditional
//        target, then rolls into the coda (story + typo beat + manifesto capstone),
//        served as the deterministic tail; the level cannot complete until the WHOLE
//        coda is typed, and the manifesto excerpt is the coda's FINAL line(s).
//
// Doctrine (STRATEGY.md §2): drive the REAL game through real key events and read
// only player-OBSERVABLE state (the visible prompt sequence, the LEVEL COMPLETE
// overlay). Expected manifesto lines come from finale-quote.js (the design source).

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  startGame,
  toLevel,
  readPrompt,
  press,
  isLevelCompleteVisible,
} from '../helpers/game-driver.mjs';
import { finaleLinesForRatio } from '../../js/finale-quote.js';

const HARD_TIMEOUT = 180000;
const LEVEL = 25;

// Canonical comparable key for a token array (same convention as word-length.test).
const keyOf = (tokens) => tokens.join(' ');

// The manifesto capstone lines for a given EXPERIENCE ratio — straight from the
// module the engine also uses (no hand-copied text here).
const manifestoKeysForRatio = (r) => finaleLinesForRatio(r).map(keyOf);

// Drive Level 25 to completion at machine speed, recording every DISTINCT prompt
// line shown along the way (as canonical keys) AND the set of a–z letters typed
// (the walk-the-keyboard proof). Hard-capped so a hang FAILS rather than spins
// forever — a hung level is itself a One Rule violation.
async function winCollectingPrompts(page, { maxPresses = 6000 } = {}) {
  const seen = new Set();
  const order = [];
  const letters = new Set();
  let presses = 0;
  while (presses < maxPresses) {
    if (await isLevelCompleteVisible(page)) return { seen, order, letters, presses };
    const { tokens, activeToken } = await readPrompt(page);
    if (activeToken == null) {
      const deadline = Date.now() + 2000;
      let recovered = null;
      while (Date.now() < deadline) {
        await page.waitForTimeout(80);
        if (await isLevelCompleteVisible(page)) return { seen, order, letters, presses };
        const r = await readPrompt(page);
        if (r.activeToken != null) { recovered = r; break; }
      }
      if (!recovered) {
        const dl = Date.now() + 8000;
        while (Date.now() < dl) {
          if (await isLevelCompleteVisible(page)) return { seen, order, letters, presses };
          await page.waitForTimeout(100);
        }
        throw new Error(`winCollectingPrompts: no token and no LEVEL COMPLETE after ${presses} presses`);
      }
      continue;
    }
    if (tokens.length) {
      const k = keyOf(tokens);
      if (!seen.has(k)) { seen.add(k); order.push(k); }
    }
    const low = typeof activeToken === 'string' ? activeToken.toLowerCase() : '';
    if (low.length === 1 && low >= 'a' && low <= 'z') letters.add(low);
    await press(page, activeToken);
    presses++;
    await page.waitForTimeout(50);
  }
  throw new Error(`winCollectingPrompts: exceeded ${maxPresses}-press cap without LEVEL COMPLETE`);
}

// One parameterized scenario per tier boundary: the level must (a) stay WINNABLE
// (the coda gate clears — One Rule floor), (b) surface EVERY tier-appropriate
// MANIFESTO CAPSTONE line before completing (guaranteed, never missable), and (c)
// have made the player type EVERY letter A–Z (the walk-the-keyboard guarantee).
function runTierScenario(label, winRatio) {
  describe(`INV-63 — Level 25 coda at ${label} (winRatio ${winRatio})`, () => {
    let g;
    let result;
    before(async () => {
      // Seed the EXPERIENCE tier before boot so getWinRatio() reads it when the
      // coda is assembled. Everything else stays default (Adventure — no timers/
      // lives; the One Rule holds). No Ollama on the test server → the coda uses the
      // built-in STATIC story bank (the offline shipping default).
      g = await startGame({ settings: { winRatio } });
      await toLevel(g.page, g.baseUrl, LEVEL);
      result = await winCollectingPrompts(g.page, { maxPresses: 6000 });
    });
    after(async () => { await g.stop(); });

    test('the level is winnable — the coda gate CLEARS (One Rule floor)', { timeout: HARD_TIMEOUT }, async () => {
      assert.ok(await isLevelCompleteVisible(g.page),
        'LEVEL COMPLETE appeared — Level 25 stayed winnable with the coda gate active');
      assert.ok(result.presses > 0, 'the level took real presses to win');
    });

    test('every manifesto capstone line was surfaced before completion (guaranteed)', { timeout: HARD_TIMEOUT }, async () => {
      const expected = manifestoKeysForRatio(winRatio);
      for (const k of expected) {
        assert.ok(result.seen.has(k),
          `manifesto capstone line "${k.replace(/ /g, '')}" must appear at ${label} ` +
          `(coda tail + win-gate). Seen lines:\n${[...result.seen].join('\n')}`);
      }
    });

    test('the player typed EVERY letter A–Z (walk-the-keyboard guarantee)', { timeout: HARD_TIMEOUT }, async () => {
      const missing = [];
      for (let c = 97; c <= 122; c++) {
        const ch = String.fromCharCode(c);
        if (!result.letters.has(ch)) missing.push(ch);
      }
      assert.deepEqual(missing, [],
        `Level 25 must make the player type every letter; missing: ${missing.join('') || '(none)'}`);
    });

    test('no console errors while playing the coda', { timeout: HARD_TIMEOUT }, async () => {
      assert.deepEqual(g.consoleErrors, [], `console errors:\n${g.consoleErrors.join('\n')}`);
    });
  });
}

// winRatio 1 (default, FIRST QUARTER) → shortest coda, tier-1 capstone.
runTierScenario('FIRST QUARTER', 1);
// winRatio 3.5 (WIZARD) → longest coda, the full manifesto capstone (age-gated top rung).
runTierScenario('WIZARD', 3.5);

// End-to-end escalation: WIZARD must surface strictly MORE manifesto capstone lines
// than the default tier (the "ages with the player" lever, at the pure-data layer).
describe('INV-62/63 — the manifesto capstone escalates with EXPERIENCE', () => {
  test('WIZARD surfaces a strict superset of the FIRST QUARTER capstone lines', () => {
    const t1 = new Set(manifestoKeysForRatio(1));
    const wiz = new Set(manifestoKeysForRatio(3.5));
    for (const k of t1) assert.ok(wiz.has(k), `WIZARD preserves the default line "${k}"`);
    assert.ok(wiz.size > t1.size, 'WIZARD adds manifesto lines beyond the default tier');
  });
});
