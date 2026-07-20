// Enforces: INV-8, INV-10, INV-11, INV-13, INV-22, INV-37 (+ INV-12 L2 face)
//   — STRATEGY.md §5 "No punishment by default" / "History cards" / "Free Play"
//
// Design sources (the test asserts what THESE say, never what the code does):
//   - CLAUDE.md §"The One Rule That Overrides Everything":
//       "The game should only ever stop a player's flow with joy, never with
//        punishment. No timers running out. No lives lost."
//   - CLAUDE.md §"Wrong Keypress Behavior": letter stays and waits; mistake
//        logged quietly; no double penalty.
//   - product.md §"Core Design Principles" 1 & 3, §"Toggleable Settings":
//        ADVENTURE is the default ("no timers, no lives — just you and the keys");
//        SURVIVAL is opt-in ("time pressure only — wrong keys NEVER cost anything").
//   - product.md §"History Cards": "a level won't end until its moment word has
//        appeared" (cards are guaranteed, never missable).
//   - product.md §"Free Play": "Speed is displayed, never enforced" — no failure state.
//   - theme-authoring.md §"The EXPERIENCE win-ratio": a higher tier is MORE play,
//        never a penalty; the scaled gate stays reachable at every tier.
//
// Doctrine: assert player-OBSERVABLE state (visible HUD lines, overlays, prompt
// position) through real key events — never engine internals. Timing is polled/
// settled, never asserted in milliseconds (the engine re-renders ~300ms between
// patterns; survival clocks are seconds-scale).

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  startGame,
  toLevel,
  toSelect,
  readPrompt,
  readHUD,
  readScreen,
  press,
  winLevel,
  isGameOverVisible,
  isLevelCompleteVisible,
  waitForComplete,
} from '../helpers/game-driver.mjs';
import { cardsForLevel, pickGuaranteedCard, wordToTokens } from '../../js/history-cards.js';

// A key that is a VALID game key but never the expected token at the given
// active token — so the engine registers a miss (not an ignored keystroke).
// Level 1 teaches j/f; 'z' is a valid, always-wrong key there.
function wrongKeyFor(activeToken) {
  return activeToken === 'z' ? 'q' : 'z';
}

// Poll until a DOM predicate is true or a deadline passes. Never asserts a
// millisecond count — just gives the engine time to settle.
async function pollUntil(page, predicate, { timeoutMs = 6000, stepMs = 100 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) return true;
    await page.waitForTimeout(stepMs);
  }
  return false;
}

// Read whether the survival timer track is present AND visible (not .hidden).
async function survivalTimerVisible(page) {
  return page.evaluate(() => {
    const el = document.getElementById('survival-timer-track');
    return !!el && !el.classList.contains('hidden');
  });
}

// Read whether the quarters HUD line is present AND visible (not .hidden).
async function quartersLineVisible(page) {
  return page.evaluate(() => {
    const el = document.getElementById('hud-quarters-line');
    return !!el && !el.classList.contains('hidden');
  });
}

const HARD_TIMEOUT = 120000;

// ── INV-8 — Adventure (default) never punishes ──────────────────────────────
describe('INV-8 — Adventure (default): no lives, no timer, no punishment', () => {
  let g;
  before(async () => { g = await startGame(); await toLevel(g.page, g.baseUrl, 1); });
  after(async () => { await g.stop(); });

  test('the default game shows no countdown timer and no quarters line', { timeout: HARD_TIMEOUT }, async () => {
    // product.md §Toggleable Settings: Play Style default is ADVENTURE — "no
    // timers, no lives — just you and the keys". Nothing was seeded, so this is
    // the honest default boot.
    assert.equal(
      await survivalTimerVisible(g.page), false,
      'Adventure default shows NO survival countdown timer',
    );
    assert.equal(
      await quartersLineVisible(g.page), false,
      'Adventure default shows NO quarters (lives) HUD line',
    );
    const hud = await readHUD(g.page);
    assert.equal(hud.quarters, null, 'no quarters value is readable in Adventure');
  });

  test('thirty wrong keys never trigger game over, never cost a quarter, letter stays and waits', { timeout: HARD_TIMEOUT }, async () => {
    // CLAUDE.md §One Rule: "No lives lost. No timers running out." The letter
    // stays on screen and waits (sacred wrong-keypress behavior).
    const start = await readPrompt(g.page);
    assert.ok(start.activeToken != null, 'a prompt token is active before the barrage');

    for (let i = 0; i < 30; i++) {
      const cur = await readPrompt(g.page);
      const token = cur.activeToken ?? start.activeToken;
      await press(g.page, wrongKeyFor(token));
      await g.page.waitForTimeout(20);
    }

    // Never punished: no game-over overlay ever appeared.
    assert.equal(
      await isGameOverVisible(g.page), false,
      'thirty wrong keys never produce a GAME OVER in Adventure',
    );
    // No quarters/timer materialized as a side effect of wrong keys.
    assert.equal(await quartersLineVisible(g.page), false, 'no quarters line appeared');
    assert.equal(await survivalTimerVisible(g.page), false, 'no survival timer appeared');

    // The letter stayed and waits — active index/token unchanged, prompt still live.
    const afterBarrage = await readPrompt(g.page);
    assert.equal(
      afterBarrage.activeIndex, start.activeIndex,
      'the letter stayed put — wrong keys never advanced the prompt',
    );
    assert.equal(
      afterBarrage.activeToken, start.activeToken,
      'the same letter is still waiting after 30 wrong keys',
    );
    // Still on the game screen — nothing kicked the player out.
    assert.equal(await readScreen(g.page), 'game-screen', 'still playing — never punished off the screen');

    assert.deepEqual(g.consoleErrors, [], `console errors:\n${g.consoleErrors.join('\n')}`);
  });
});

// ── INV-10 — Survival: wrong keys cost NOTHING (time pressure only) ──────────
describe('INV-10 — Survival: wrong keys never cost a quarter or the clock', () => {
  let g;
  before(async () => {
    // Seed Survival ON through settings.js's own persisted shape (DEFAULTS keys):
    // playStyle 'survival', 3 quarters, novice (the most generous clock — its
    // 1.6× multiplier gives a wide window to fire wrong keys before any timeout).
    g = await startGame({
      settings: { playStyle: 'survival', lives: 3, difficulty: 'novice' },
    });
    await toLevel(g.page, g.baseUrl, 1);
  });
  after(async () => { await g.stop(); });

  test('Survival shows the quarters line and the countdown timer', { timeout: HARD_TIMEOUT }, async () => {
    // product.md §Toggleable Settings: SURVIVAL = "quarters on the line — 1979
    // rules." The opt-in mode is the ONLY place these appear.
    assert.equal(await quartersLineVisible(g.page), true, 'Survival shows the quarters HUD line');
    assert.equal(await survivalTimerVisible(g.page), true, 'Survival shows the countdown timer');
    const hud = await readHUD(g.page);
    assert.equal(hud.quarters, 3, 'three quarters are shown at the start of a novice Survival run');
  });

  test('wrong keys pressed immediately cost no quarters — "wrong keys NEVER cost anything"', { timeout: HARD_TIMEOUT }, async () => {
    // CLAUDE.md §Settings + product.md §Toggleable Settings: even in Survival,
    // wrong keys cost NOTHING — time pressure only. We fire the wrong keys
    // IMMEDIATELY, well inside the first pattern's generous novice timer window,
    // so a lost quarter (if it happened) would be attributable to the keys, not
    // a timeout.
    const before = await readHUD(g.page);
    assert.equal(before.quarters, 3, 'baseline three quarters before any wrong key');
    const start = await readPrompt(g.page);

    for (let i = 0; i < 20; i++) {
      const cur = await readPrompt(g.page);
      const token = cur.activeToken ?? start.activeToken;
      await press(g.page, wrongKeyFor(token));
      await g.page.waitForTimeout(15);
    }

    const after = await readHUD(g.page);
    assert.equal(
      after.quarters, 3,
      'quarters unchanged by wrong keys — wrong keys cost nothing even in Survival',
    );
    assert.equal(
      await isGameOverVisible(g.page), false,
      'no game over — wrong keys alone never end a Survival run',
    );
    // The letter still waits (the sacred contract holds identically in Survival).
    const afterPrompt = await readPrompt(g.page);
    assert.equal(afterPrompt.activeToken, start.activeToken, 'the letter still waits in Survival too');

    assert.deepEqual(g.consoleErrors, [], `console errors:\n${g.consoleErrors.join('\n')}`);
  });
});

// ── INV-11 — Survival game-over is warm and offers replay/exit ───────────────
describe('INV-11 — Survival game over is warm and never dead-ends', () => {
  let g;
  before(async () => {
    // One quarter, EXPERT clock (0.85×, the shortest window) so a single letting-
    // the-timer-expire produces game over quickly. Even here wrong keys cost
    // nothing — we simply STOP pressing and let time pressure do its (only) job.
    g = await startGame({
      settings: { playStyle: 'survival', lives: 1, difficulty: 'expert' },
    });
    await toLevel(g.page, g.baseUrl, 1);
  });
  after(async () => { await g.stop(); });

  test('letting the clock run out with one quarter reaches a warm GAME OVER offering replay and exit', { timeout: HARD_TIMEOUT }, async () => {
    // CLAUDE.md §Settings: "game over is warm." product.md: no punishment beyond
    // the opt-in time pressure. We assert (a) game over is reachable ONLY via the
    // timer (never a wrong key), and (b) the overlay offers the documented
    // two-tier replay/exit copy — never a dead end.
    assert.equal(await quartersLineVisible(g.page), true, 'this is a Survival run');

    // Stop pressing entirely; wait out the single-quarter clock.
    const gotGameOver = await pollUntil(g.page, () => isGameOverVisible(g.page), { timeoutMs: 30000, stepMs: 150 });
    assert.ok(gotGameOver, 'the survival timer eventually expires into GAME OVER when unattended');

    // Warm copy + a genuine two-tier way out (read from the live overlay DOM —
    // the shape index.html documents: replay via Space, exit to the arcade via
    // Esc). Assert the SHAPE, not exact styling.
    const overlay = await g.page.evaluate(() => {
      const el = document.getElementById('gameover-overlay');
      if (!el) return null;
      const txt = el.textContent.replace(/\s+/g, ' ').trim().toUpperCase();
      return {
        text: txt,
        hasReplay: /REPLAY/.test(txt),
        hasArcade: /ARCADE/.test(txt),
        mentionsSpace: /SPACE/.test(txt),
      };
    });
    assert.ok(overlay, 'the game-over overlay is present in the DOM');
    assert.ok(overlay.hasReplay, `overlay offers a REPLAY option (warm second chance): "${overlay.text}"`);
    assert.ok(overlay.hasArcade, `overlay offers an exit to THE ARCADE: "${overlay.text}"`);
    assert.ok(overlay.mentionsSpace, 'overlay documents the SPACE replay key');
    // Warmth, not scolding: no punishing "YOU LOSE / TRY HARDER / FAILED" language.
    assert.ok(
      !/\b(FAIL|FAILED|LOSER|YOU LOSE|GIT GUD|TRY HARDER)\b/.test(overlay.text),
      `game-over copy is warm, never scolding: "${overlay.text}"`,
    );

    // Pressing the documented replay key restarts play rather than dead-ending.
    await press(g.page, ' ');
    const backInPlay = await pollUntil(
      g.page,
      async () => (await readScreen(g.page)) === 'game-screen' && !(await isGameOverVisible(g.page)),
      { timeoutMs: 6000, stepMs: 120 },
    );
    assert.ok(backInPlay, 'SPACE from GAME OVER restarts a fresh run — never a dead end');
    // Fresh run restored the quarter (a warm replay, not a continuation of loss).
    const hud = await readHUD(g.page);
    assert.equal(hud.quarters, 1, 'replay starts with a full fresh quarter — the arcade remembers, warmly');

    assert.deepEqual(g.consoleErrors, [], `console errors:\n${g.consoleErrors.join('\n')}`);
  });
});

// ── INV-13 — once won, stays won (no regression on further keypresses) ───────
describe('INV-13 — a won level never regresses to mid-level', () => {
  let g;
  before(async () => { g = await startGame(); await toLevel(g.page, g.baseUrl, 1); });
  after(async () => { await g.stop(); });

  test('after LEVEL COMPLETE, further keypresses never return to an un-won game screen', { timeout: HARD_TIMEOUT }, async () => {
    // theme-authoring.md §win-gate: "once patternComplete() reports won, it must
    // stay won on repeated calls ... progress must only ever move toward
    // completion." Observably: once the complete overlay is up, no key sends the
    // player back into an un-won, mid-level game screen.
    await winLevel(g.page);
    assert.ok(await isLevelCompleteVisible(g.page), 'LEVEL COMPLETE overlay is up after winning');
    const screenAtWin = await readScreen(g.page);

    // Fire a spread of keys, including game letters and the wrong keys that would
    // "un-win" a naive implementation. None may regress to a live mid-level game.
    for (const k of ['j', 'f', 'z', 'q', 'd', 'k', 'a']) {
      await press(g.page, k);
      await g.page.waitForTimeout(40);
      // At no point are we back on a live game screen showing an active mid-level
      // prompt with the completion overlay dismissed.
      const backMidLevel =
        (await readScreen(g.page)) === 'game-screen' && !(await isLevelCompleteVisible(g.page))
          ? await g.page.evaluate(() => {
              const ov = document.getElementById('complete-overlay');
              const seq = document.getElementById('prompt-sequence');
              const active = seq && seq.querySelector('.prompt-letter.active');
              // regression = overlay hidden AND a live active prompt letter
              return !!active && !!ov && ov.classList.contains('hidden');
            })
          : false;
      assert.equal(backMidLevel, false, `key "${k}" did not regress a won level back to mid-play`);
    }
    // The screen either stayed on the completion surface or advanced forward
    // (never backward to the level we just beat) — never re-shows the same
    // un-won game screen we left.
    const finalScreen = await readScreen(g.page);
    assert.notEqual(
      finalScreen === 'game-screen' && !(await isLevelCompleteVisible(g.page)) ? 'regressed' : finalScreen,
      'regressed',
      `won level did not fall back into un-won play (screen=${screenAtWin}→${finalScreen})`,
    );

    assert.deepEqual(g.consoleErrors, [], `console errors:\n${g.consoleErrors.join('\n')}`);
  });
});

// ── INV-22 — history-card moment word is guaranteed before a level can end ────
describe('INV-22 — a level does not end before its moment word appears', () => {
  let g;
  // Level 4 is the first carded level ('ada' — Ada Lovelace). We win it with a
  // custom loop that records every pattern the engine renders, then assert the
  // documented moment word appeared among them before completion.
  const CARD_LEVEL = 4;
  before(async () => { g = await startGame(); await toLevel(g.page, g.baseUrl, CARD_LEVEL); });
  after(async () => { await g.stop(); });

  test("the level's guaranteed card word (from HISTORY_CARDS, via pickGuaranteedCard) is typed before LEVEL COMPLETE", { timeout: HARD_TIMEOUT }, async () => {
    // product.md §History Cards: "a level won't end until its moment word has
    // appeared." Derive the expected word from the game's own data file — never
    // hardcode it (STRATEGY.md §2). js/history-cards.js's flat/pool model
    // (rebuilt 2026-07-19) may hold several cards per level; the engine injects
    // exactly ONE guaranteed word per play via pickGuaranteedCard (INV-58),
    // preferring an uncollected card and rotating by the active game's own
    // per-level counter. toLevel's wopr bypass confirms a fresh default-name
    // game first, so this session's collectedIds()/rotation are empty/zero —
    // the exact (level, [], 0) inputs pickGuaranteedCard resolves deterministically.
    const pool = cardsForLevel(CARD_LEVEL);
    assert.ok(pool.length > 0, `level ${CARD_LEVEL} has at least one history card in the game's own data`);
    const card = pickGuaranteedCard(CARD_LEVEL, [], 0);
    assert.ok(card, `pickGuaranteedCard resolves a real card for level ${CARD_LEVEL}`);
    const momentTokens = wordToTokens(card.word); // e.g. ['a','d','a']
    const momentKey = momentTokens.join(' ');

    // Custom win loop that captures the full stream of rendered patterns.
    const seenPatterns = new Set();
    let sawMoment = false;
    let presses = 0;
    const MAX = 3000;
    while (presses < MAX) {
      if (await isLevelCompleteVisible(g.page)) break;
      const { tokens, activeToken } = await readPrompt(g.page);
      if (tokens.length) {
        const key = tokens.join(' ');
        seenPatterns.add(key);
        if (key === momentKey) sawMoment = true;
      }
      if (activeToken == null) {
        // between-pattern re-render or victory hold — poll briefly.
        const advanced = await pollUntil(
          g.page,
          async () => (await readPrompt(g.page)).activeToken != null || isLevelCompleteVisible(g.page),
          { timeoutMs: 2500, stepMs: 80 },
        );
        if (!advanced) break;
        continue;
      }
      await press(g.page, activeToken);
      presses++;
      await g.page.waitForTimeout(50);
    }

    // The level DID complete (guaranteed-reachable) and the moment word appeared
    // in the stream at or before completion.
    const completed = await waitForComplete(g.page, 8000);
    assert.ok(completed, 'the carded level reaches LEVEL COMPLETE (win-gate is reachable)');
    assert.ok(
      sawMoment,
      `the moment word "${card.word}" appeared among the rendered patterns before the level ended`,
    );

    assert.deepEqual(g.consoleErrors, [], `console errors:\n${g.consoleErrors.join('\n')}`);
  });
});

// ── INV-37 — Free Play displays WPM, never enforces; no failure state ────────
describe('INV-37 — Free Play: speed shown, never enforced, no failure state', () => {
  let g;
  before(async () => { g = await startGame(); });
  after(async () => { await g.stop(); });

  // Enter Free Play the way the player does: on the select screen, press F to
  // toggle Free Play on, then start the highlighted (level 1) cabinet through
  // the normal title→name→ready→preview→game flow.
  async function enterFreePlayLevel1(page) {
    await toSelect(page, g.baseUrl);
    await page.keyboard.press('f'); // toggle Free Play ON (main.js select handler)
    await page.waitForTimeout(300);
    // Start the selected (default position 1) cabinet.
    await page.keyboard.press('Enter'); // select -> title/name entry
    await page.waitForTimeout(350);
    await page.keyboard.press('Enter'); // confirm name -> ready
    await page.waitForTimeout(350);
    await page.keyboard.press('Space'); // ready -> keyboard preview
    await page.waitForTimeout(350);
    await page.keyboard.press('Space'); // preview -> game
    await page.waitForTimeout(600);
  }

  test('Free Play shows a WPM line, and free-typed wrong keys never fail; completion returns to the arcade', { timeout: HARD_TIMEOUT }, async () => {
    // product.md §Free Play: "live WPM shown ... Speed is displayed, never
    // enforced." No timers, no failure states.
    await enterFreePlayLevel1(g.page);
    assert.equal(await readScreen(g.page), 'game-screen', 'Free Play boots into the game screen');

    // The WPM HUD line is visible (Adventure hides it; Free Play reveals it).
    const wpmVisible = await g.page.evaluate(() => {
      const el = document.getElementById('hud-wpm-line');
      return !!el && !el.classList.contains('hidden');
    });
    assert.ok(wpmVisible, 'Free Play makes the SPEED (WPM) HUD line visible');

    // No survival apparatus exists in Free Play (Adventure defaults hold).
    assert.equal(await survivalTimerVisible(g.page), false, 'no survival timer in Free Play');
    assert.equal(await quartersLineVisible(g.page), false, 'no quarters line in Free Play');

    // Type wrong keys freely — no failure state can arise.
    const start = await readPrompt(g.page);
    assert.ok(start.activeToken != null, 'Free Play renders a live prompt');
    for (let i = 0; i < 20; i++) {
      const cur = await readPrompt(g.page);
      const token = cur.activeToken ?? start.activeToken;
      // Pick a valid key that isn't the expected token.
      await press(g.page, token === 'z' ? 'q' : 'z');
      await g.page.waitForTimeout(15);
    }
    assert.equal(await isGameOverVisible(g.page), false, 'Free Play has no game-over / failure state');
    assert.equal(await readScreen(g.page), 'game-screen', 'still in Free Play after a wrong-key barrage');

    // Complete the Free Play session; it returns to the arcade (select screen),
    // and no game-over overlay was ever shown across the whole run.
    await winLevel(g.page, { maxPresses: 4000 });
    assert.ok(await isLevelCompleteVisible(g.page), 'Free Play reaches its completion overlay');
    assert.equal(await isGameOverVisible(g.page), false, 'no game over ever appeared in Free Play');

    // Press Space at completion → returns to the arcade (select screen).
    await press(g.page, ' ');
    const backToArcade = await pollUntil(
      g.page,
      async () => (await readScreen(g.page)) === 'select-screen',
      { timeoutMs: 6000, stepMs: 120 },
    );
    assert.ok(backToArcade, 'Free Play completion returns to the arcade for cabinet-hopping');

    assert.deepEqual(g.consoleErrors, [], `console errors:\n${g.consoleErrors.join('\n')}`);
  });
});

// ── INV-12 (L2 face) — WIZARD (3.5×) is more play, still reachable ───────────
describe('INV-12 (L2) — EXPERIENCE tiers scale play up, never make a level unreachable', () => {
  // Two independent boots: a baseline 1× win and a WIZARD 3.5× win of the SAME
  // level. The doctrine (STRATEGY.md §2) forbids exact-count assertions, so we
  // assert only the QUALITATIVE relationship the design promises: WIZARD is
  // MORE play (strictly more presses), and the level still COMPLETES at 3.5×.
  test('a 1x level completes, and the same level at WIZARD (3.5x) also completes with strictly more play', { timeout: HARD_TIMEOUT }, async () => {
    // Baseline: default win-ratio (1x = FIRST QUARTER).
    const base = await startGame({ settings: { winRatio: 1 } });
    let basePresses;
    try {
      await toLevel(base.page, base.baseUrl, 1);
      ({ presses: basePresses } = await winLevel(base.page, { maxPresses: 4000 }));
      assert.ok(await isLevelCompleteVisible(base.page), '1x level completes (reachable at the default tier)');
      assert.deepEqual(base.consoleErrors, [], `1x console errors:\n${base.consoleErrors.join('\n')}`);
    } finally {
      await base.stop();
    }

    // WIZARD: 3.5x — "GO THE DISTANCE." More play, never a penalty, never a wall.
    const wiz = await startGame({ settings: { winRatio: 3.5 } });
    let wizPresses;
    try {
      await toLevel(wiz.page, wiz.baseUrl, 1);
      ({ presses: wizPresses } = await winLevel(wiz.page, { maxPresses: 8000 }));
      assert.ok(
        await isLevelCompleteVisible(wiz.page),
        'WIZARD (3.5x) level still completes — a higher tier is MORE play, never unreachable',
      );
      assert.deepEqual(wiz.consoleErrors, [], `3.5x console errors:\n${wiz.consoleErrors.join('\n')}`);
    } finally {
      await wiz.stop();
    }

    // Qualitative: WIZARD required strictly more presses than 1x (more play).
    assert.ok(
      wizPresses > basePresses,
      `WIZARD required more play than 1x (1x=${basePresses} presses, 3.5x=${wizPresses} presses)`,
    );
  });
});
