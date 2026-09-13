// Enforces: INV-1..INV-5 (re-proven inside Act 7 — the headline), INV-76,
// INV-77, INV-78, INV-79, INV-80, INV-81, INV-82, INV-83, INV-84 (behavioral
// face), INV-86, INV-88 — STRATEGY.md §5 "Act 7 — THE SPEEDWAY".
//
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  WHY THIS FILE CITES INV-1..INV-5 AND NOT ONLY ACT 7's OWN NUMBERS        ║
// ╚══════════════════════════════════════════════════════════════════════════╝
// Act 7 does NOT route through js/main.js's pattern engine, so it does NOT
// inherit the sacred wrong-keypress contract for free — it is re-implemented in
// js/speedway/track.js. docs/specs/act7-speed-racing.md §5.3 names the trap out
// loud ("this is a trap, name it loudly") and §8's first risk row calls two
// implementations of one contract *"the single thing most worth reviewing"*. So
// the contract is asserted here against its ORIGINAL sources, clause by clause:
//
//   INV-1  CLAUDE.md §Wrong Keypress Behavior 2 — "Letter **stays on screen and
//          waits** — do NOT advance"
//   INV-2  …3 — "Log mistake quietly to that letter's counter"
//   INV-3  …4 — "Player hits correct key → advance normally, no double penalty"
//   INV-4  product.md §3 — "The game **never skips ahead** after a wrong keypress"
//   INV-5  CLAUDE.md §Engine input contract — "Pure modifier keydowns are
//          ignored entirely — never a mistake"
//
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  THE OBSERVABLE SURFACES (and why they are not implementation coupling)   ║
// ╚══════════════════════════════════════════════════════════════════════════╝
// The wing draws on the shared canvas, so there is no `#prompt-sequence` to read
// (the same situation as Act 6, and the same resolution — see
// tests/integration/textworld.test.mjs's header). Three player-observable
// surfaces are used, all of them things the player actually experiences:
//
//   (a) THE DRAWN TEXT. A recorder wraps `CanvasRenderingContext2D.fillText`/
//       `strokeText` and keeps the STRINGS the game asked the canvas to draw —
//       literally the text on screen. This is emphatically NOT a pixel or
//       geometry assertion (STRATEGY.md §2's prohibition, restated in spec §5.6
//       where an automated colour-histogram check was REJECTED for exactly that
//       reason): no coordinate, size, colour or pixel is ever read, so a pure
//       refactor that keeps the same words on screen keeps these green.
//       js/speedway/track.js draws the active word one CHARACTER at a time, so
//       the recorder reconstructs the player's current word — which is how this
//       suite types a REAL, clean lap and can then assert exact arithmetic.
//   (b) THE PERSISTED RECORD. `kk-slots[i].speedway` — the actual promise the
//       wing keeps to a returning player (spec §5.5). Read as raw localStorage,
//       never through a game internal.
//   (c) THE VISIBLE SCREEN + console errors, via the shared driver.
//
// Interaction is always REAL key events through the REAL player path: the select
// screen's back wall → the SPEEDWAY door → Space → the hub → a track. Nothing
// here calls a game function directly, and no private state is ever read.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { startGame, toSelect, readScreen } from '../helpers/game-driver.mjs';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const WING_BUILT = existsSync(join(REPO_ROOT, 'js', 'speedway', 'hub.js'));
const T = 240_000;

// A key that is ALWAYS wrong, whatever the prompt is: every Act 7 pool word is
// letters-only (asserted as DATA in tests/unit/speedway-words.test.mjs), so a
// digit can never be the expected character.
const ALWAYS_WRONG = '7';

// Strings that must never appear on any Act 7 surface (spec §5.4/§5.7 + INV-80/82/83).
const FORBIDDEN_ON_SCREEN = [
  'DNF', 'POSITION', 'PLACEMENT', 'LAST PLACE', 'RANK', 'LEADERBOARD', 'FINISH ORDER',
  'YOU LOSE', 'LOSER', 'DEFEAT', 'ELIMINATED', 'DISQUALIFIED', 'RETIRED', 'GAME OVER',
  'RIVAL', 'OPPONENT', 'SLOWER', 'CRASH', 'WRECK', 'DEAD',
];

function pend(t) {
  if (WING_BUILT) return false;
  t.todo('pending Act 7 build: js/speedway/hub.js is not built yet (sibling lane) — '
    + 'the wing cannot be entered, so the in-track contracts cannot be exercised');
  return true;
}

// ─── The drawn-text recorder (surface (a)) ─────────────────────────────────

async function installDrawRecorder(page) {
  await page.addInitScript(() => {
    const C = window.CanvasRenderingContext2D;
    if (!C || C.prototype.__kkDrawPatched) return;
    window.__kkDraw = [];
    const wrap = (name) => {
      const orig = C.prototype[name];
      if (typeof orig !== 'function') return;
      C.prototype[name] = function (text, ...rest) {
        try { if (window.__kkDraw.length < 20000) window.__kkDraw.push(String(text)); } catch (e) { /* never break a frame */ }
        return orig.call(this, text, ...rest);
      };
    };
    wrap('fillText');
    wrap('strokeText');
    C.prototype.__kkDrawPatched = true;
  });
}

async function captureDrawn(page, frames = 3) {
  await page.evaluate(() => { window.__kkDraw = []; });
  await page.evaluate((n) => new Promise((resolve) => {
    let i = 0;
    const step = () => { i += 1; if (i >= n) resolve(); else requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), frames);
  return page.evaluate(() => (window.__kkDraw || []).slice());
}

const drawnIncludes = (drawn, needle) => drawn.some((s) => s.toUpperCase().includes(needle));

// Reconstruct the prompt word from the per-character draws: the longest
// contiguous run of single-character glyphs on a frame IS the word on screen.
function wordFromDrawn(drawn) {
  let best = [];
  let run = [];
  for (const s of drawn) {
    if (/^[A-Z'-]$/.test(s)) run.push(s);
    else { if (run.length > best.length) best = run; run = []; }
  }
  if (run.length > best.length) best = run;
  return best.length >= 2 ? best.join('').toLowerCase() : null;
}

async function currentWord(page) { return wordFromDrawn(await captureDrawn(page)); }

function assertNothingForbidden(drawn, where) {
  for (const s of drawn) {
    const up = s.toUpperCase();
    for (const bad of FORBIDDEN_ON_SCREEN) {
      assert.ok(!up.includes(bad),
        `${where}: the game drew ${JSON.stringify(s)}, which contains "${bad}" — spec §5.4: `
        + '"No placement, no position number... anywhere in the act, in any string, ever"');
    }
  }
}

// ─── Navigation (the real player path) ─────────────────────────────────────

async function toSpeedwayDoor(page, baseUrl) {
  await toSelect(page, baseUrl);
  // ↓ past the last act lands on the first back-wall door; each further ↓ walks
  // along the back wall (js/ui/cabinet-art.js navigateAct, which stops at the
  // last door). Confirm which door is focused from the DOM the door view itself
  // renders — never from a state variable.
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(70);
  }
  return page.evaluate(() => {
    const el = document.querySelector('.select-door.selected');
    return el ? el.dataset.door : null;
  });
}

async function enterHub(page) {
  await page.keyboard.press('Space');
  const deadline = Date.now() + 25000;
  for (;;) {
    const drawn = await captureDrawn(page, 2);
    if (drawnIncludes(drawn, 'THE SPEEDWAY') && drawnIncludes(drawn, 'CHOOSE')) return true;
    if (Date.now() > deadline) return false;
    await page.waitForTimeout(200);
  }
}

async function onHubMenu(page) {
  return drawnIncludes(await captureDrawn(page, 2), 'BACK TO THE ARCADE');
}

async function toStartLine(page) {
  await page.keyboard.press('Space');
  const deadline = Date.now() + 20000;
  for (;;) {
    const drawn = await captureDrawn(page, 2);
    if (drawnIncludes(drawn, 'SPACE TO GO')) return drawn;
    if (Date.now() > deadline) throw new Error('never reached a start line');
    await page.waitForTimeout(150);
  }
}

async function startRacing(page) {
  await page.keyboard.press('Space');
  await page.waitForTimeout(250);
}

async function atFinish(page) { return drawnIncludes(await captureDrawn(page, 2), 'LAP COMPLETE'); }

// Full entry: arcade → door → hub → start line → racing.
async function enterFirstLap(page, baseUrl) {
  const door = await toSpeedwayDoor(page, baseUrl);
  assert.equal(door, 'speedway', 'the back wall carries the SPEEDWAY door');
  assert.ok(await enterHub(page), 'the SPEEDWAY hub came up');
  await toStartLine(page);
  await startRacing(page);
}

// Pit board → hub menu → the next lap's start line → racing.
// CHANGED 2026-09-13, design-first per .claude/rules/testing.md rule 1.
//
// This used to wait a fixed 1000 ms and press Space ONCE, which assumed the
// flag → hub path was a single keypress. It was, while `finish` auto-settled after
// FINISH_FANFARE_MS = 700. The celebration is now a real per-track window
// (Monaco 2800 ms, F-Zero 3200 ms — docs/features/speedway.md, changed there first),
// it does NOT auto-settle, and leaving a track takes TWO presses: finish → pit → hub.
// The old fixed wait landed its single press inside `finish`, so the next press hit
// the hub menu and the lap never started — three tests failing with "never reached a
// start line" for a reason that had nothing to do with what they were testing.
//
// Poll for the phase instead of timing it. The two footers are deliberately
// distinguishable for exactly this purpose, and that contract is documented.
async function nextLap(page) {
  await pressThrough(page, 'SPACE — THE PIT BOARD');   // celebration → pit board
  await pressThrough(page, 'SPACE — BACK TO THE PITS'); // pit board → hub menu
  await toStartLine(page);
  await startRacing(page);
}

// Press Space until the named footer is gone, rather than guessing how long a phase
// lasts. Tolerates the footer never appearing (a phase may already have advanced).
async function pressThrough(page, footer, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const showing = await captureDrawn(page, 2)
      .then((d) => drawnIncludes(d, footer))
      .catch(() => false);
    if (!showing) return;
    await page.keyboard.press('Space');
    await page.waitForTimeout(150);
  }
}

// ─── The persisted record (surface (b)) ────────────────────────────────────

// Summed across track ids so no assertion depends on WHICH track the hub
// happened to offer first (a placeholder today, a real era track tomorrow).
async function readSpeedwayTotals(page) {
  return page.evaluate(() => {
    let st = null;
    try { st = JSON.parse(localStorage.getItem('kk-slots')); } catch (e) { return null; }
    if (!st || !Array.isArray(st.slots)) return null;
    const slot = st.slots[st.active === null ? 0 : st.active];
    const map = (slot && slot.speedway) || {};
    const totals = {
      laps: 0, chars: 0, cleanBest: 0, tracks: Object.keys(map).length,
      acc: null, keys: null, hasLast: false, hasBest: false,
    };
    for (const id of Object.keys(map)) {
      const r = map[id] || {};
      totals.laps += r.laps || 0;
      totals.chars += r.chars || 0;
      totals.cleanBest = Math.max(totals.cleanBest, r.cleanBest || 0);
      if (r.last) { totals.hasLast = true; totals.acc = r.last.acc; totals.keys = r.last.keys; }
      if (r.best) totals.hasBest = true;
    }
    return totals;
  });
}

// ─── Driving a lap like a player ───────────────────────────────────────────

async function typeWord(page, word) {
  for (const ch of word) await page.keyboard.press(ch === '-' ? 'Minus' : ch);
}

/**
 * Drive the current lap to the finish by reading the word on screen and typing
 * it — a clean run, exactly as an accurate player produces. `hooks.beforeWord`
 * runs before each word (used to inject wrong keys / modifiers). Returns the
 * number of CORRECT keystrokes pressed which — the run being otherwise clean —
 * is the lap's true character length.
 */
async function driveLap(page, hooks = {}) {
  let correct = 0;
  for (let i = 0; i < 500; i++) {
    if (await atFinish(page)) return correct;
    const word = await currentWord(page);
    if (!word) {
      if (await atFinish(page)) return correct;
      throw new Error('no prompt word on screen and the lap has not finished');
    }
    if (hooks.beforeWord) await hooks.beforeWord(i, word);
    await typeWord(page, word);
    correct += word.length;
  }
  throw new Error('lap did not finish within 500 words');
}

// ════════════════════════════════════════════════════════════════════════════
//  The door — reachable, and never a dead end (INV-86)
// ════════════════════════════════════════════════════════════════════════════

describe('INV-86 — the back wall opens on THE SPEEDWAY, and no state in the wing traps the player (spec §5.0/§5.1; mirrors Act 6\'s INV-46)', () => {
  test('walking down past the last act reaches the SPEEDWAY door', { timeout: T }, async () => {
    const g = await startGame();
    try {
      await installDrawRecorder(g.page);
      assert.equal(await toSpeedwayDoor(g.page, g.baseUrl), 'speedway',
        'the back wall carries a door for the racing wing');
      assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
    } finally { await g.stop(); }
  });

  test('Escape alone always walks back out to the arcade, whatever the wing is showing', { timeout: T }, async () => {
    const g = await startGame();
    try {
      await installDrawRecorder(g.page);
      await toSpeedwayDoor(g.page, g.baseUrl);
      await g.page.keyboard.press('Space');
      await g.page.waitForTimeout(1500);
      // Whatever came up (the hub, the loading card, or a warm "still being
      // built" card), Escape must reach the arcade: wing → hub → arcade.
      for (let i = 0; i < 3; i++) {
        if (await readScreen(g.page) === 'select-screen') break;
        await g.page.keyboard.press('Escape');
        await g.page.waitForTimeout(700);
      }
      assert.equal(await readScreen(g.page), 'select-screen',
        'Escape from the wing reaches the arcade select screen — the player is never trapped');
      assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
    } finally { await g.stop(); }
  });

  test('Escape from the start line, from mid-lap, and from the pit board each lands back on the hub menu', { timeout: T }, async (t) => {
    if (pend(t)) return;
    const g = await startGame();
    try {
      await installDrawRecorder(g.page);
      await toSpeedwayDoor(g.page, g.baseUrl);
      assert.ok(await enterHub(g.page), 'the hub came up');

      // From the START LINE.
      await toStartLine(g.page);
      await g.page.keyboard.press('Escape');
      await g.page.waitForTimeout(400);
      assert.ok(await onHubMenu(g.page), 'Escape from the start line returns to the hub menu');

      // From MID-LAP.
      await toStartLine(g.page);
      await startRacing(g.page);
      const word = await currentWord(g.page);
      assert.ok(word, 'a word is on screen once the lap is running');
      await g.page.keyboard.press(word[0]);
      await g.page.keyboard.press('Escape');
      await g.page.waitForTimeout(400);
      assert.ok(await onHubMenu(g.page), 'Escape mid-lap returns to the hub menu');

      // From the PIT BOARD (a finished lap).
      await toStartLine(g.page);
      await startRacing(g.page);
      await driveLap(g.page);
      await g.page.waitForTimeout(1000);
      await g.page.keyboard.press('Escape');
      await g.page.waitForTimeout(400);
      assert.ok(await onHubMenu(g.page), 'Escape from the pit board returns to the hub menu');

      // And from the menu, out to the arcade.
      await g.page.keyboard.press('Escape');
      await g.page.waitForTimeout(700);
      assert.equal(await readScreen(g.page), 'select-screen', 'Escape from the hub menu reaches the arcade');
      assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
    } finally { await g.stop(); }
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  THE HEADLINE — the sacred contract, re-proven inside Act 7
// ════════════════════════════════════════════════════════════════════════════

describe('INV-1/INV-4 (via INV-77) — "the letter stays on screen and waits", and the game NEVER skips ahead', () => {
  test('a burst of wrong keys on a word\'s last letter leaves that SAME word on screen — the prompt does not advance', { timeout: T }, async (t) => {
    if (pend(t)) return;
    const g = await startGame();
    try {
      await installDrawRecorder(g.page);
      await enterFirstLap(g.page, g.baseUrl);

      const word = await currentWord(g.page);
      assert.ok(word && word.length >= 2, `a readable word is on screen (got ${word})`);

      // Type everything but the last character, so the ONLY thing that can
      // advance the prompt past this word is that last correct key.
      await typeWord(g.page, word.slice(0, -1));
      assert.equal(await currentWord(g.page), word, 'still the same word while it is being typed');

      // Now hammer it with keys that are always wrong.
      for (let i = 0; i < 40; i++) await g.page.keyboard.press(ALWAYS_WRONG);
      assert.equal(await currentWord(g.page), word,
        '40 wrong keys on the final letter: the word STAYED and WAITED — it never advanced '
        + '(CLAUDE.md §Wrong Keypress Behavior 2; product.md §3 "never skips ahead")');
      assert.equal(await atFinish(g.page), false, 'and no wrong key moved the lap toward its finish');

      // The correct key then advances normally — no double penalty, no lockout.
      await g.page.keyboard.press(word[word.length - 1]);
      await g.page.waitForTimeout(120);
      const next = await currentWord(g.page);
      assert.notEqual(next, word,
        'the correct key after a run of wrong ones advances normally (CLAUDE.md §Wrong Keypress Behavior 4)');
      assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
    } finally { await g.stop(); }
  });

  test('a lap of NOTHING BUT wrong keys never finishes, never records, and is still finishable afterwards', { timeout: T }, async (t) => {
    if (pend(t)) return;
    const g = await startGame();
    try {
      await installDrawRecorder(g.page);
      await enterFirstLap(g.page, g.baseUrl);

      // Far more presses than any lap is characters long. If a wrong key
      // advanced ANYTHING, this would blow through the finish line many times.
      for (let i = 0; i < 400; i++) await g.page.keyboard.press(ALWAYS_WRONG);

      assert.equal(await atFinish(g.page), false, '400 wrong keys did not reach the finish line');
      const mid = await readSpeedwayTotals(g.page);
      assert.equal(mid.laps, 0, 'no lap was recorded');
      assert.equal(mid.chars, 0, 'the odometer did not move one character');

      // Nothing was taken: the lap is exactly where it was and still finishable.
      const correct = await driveLap(g.page);
      assert.ok(correct > 0, 'the lap completed normally after the storm of wrong keys');
      const after = await readSpeedwayTotals(g.page);
      assert.equal(after.laps, 1, 'the lap counted, once');
      assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
    } finally { await g.stop(); }
  });
});

describe('INV-3/INV-2 (via INV-77) — "no double penalty", and the mistake is logged QUIETLY', () => {
  test('60 wrong keys on ONE letter cost exactly ONE attempt, not sixty', { timeout: T }, async (t) => {
    if (pend(t)) return;
    const g = await startGame();
    try {
      await installDrawRecorder(g.page);
      await enterFirstLap(g.page, g.baseUrl);

      const HAMMER = 60;
      let racedDrawn = [];
      const correct = await driveLap(g.page, {
        beforeWord: async (i) => {
          if (i === 0) for (let k = 0; k < HAMMER; k++) await g.page.keyboard.press(ALWAYS_WRONG);
          if (i === 1) racedDrawn = await captureDrawn(g.page, 2);
        },
      });

      const totals = await readSpeedwayTotals(g.page);
      assert.equal(totals.chars, correct,
        'the lap demanded exactly the correct keystrokes it is long — wrong keys added no work');

      // The whole lap was clean except ONE letter hammered HAMMER times. With
      // the no-double-penalty rule that is exactly ONE charged attempt, so the
      // arithmetic is exact and derived entirely from what was observed.
      const expected = Math.round((correct / (correct + 1)) * 100);
      const ifDoublePenalised = Math.round((correct / (correct + HAMMER)) * 100);
      assert.equal(totals.acc, expected,
        `accuracy should be ${expected}% (one mistake charged once). It is ${totals.acc}%. `
        + `If each of the ${HAMMER} wrong presses had been charged it would read about ${ifDoublePenalised}% `
        + '(CLAUDE.md §Wrong Keypress Behavior 4: "no double penalty")');

      // INV-2 — logged QUIETLY: nothing alarming is on screen during the race.
      for (const s of racedDrawn) {
        assert.ok(!/MISS|WRONG|MISTAKE|ERROR|PENALTY|FAIL/i.test(s),
          `the race drew ${JSON.stringify(s)} — mistakes are "logged quietly... never displayed alarmingly"`);
      }
      assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
    } finally { await g.stop(); }
  });
});

describe('INV-5 (via INV-77) — pure modifier keydowns are ignored ENTIRELY and are never a mistake', () => {
  test('a clean lap driven with Shift/Control/Alt/Meta pressed throughout still records 100% accuracy', { timeout: T }, async (t) => {
    if (pend(t)) return;
    const g = await startGame();
    try {
      await installDrawRecorder(g.page);
      await enterFirstLap(g.page, g.baseUrl);

      const MODS = ['Shift', 'Control', 'Alt', 'Meta'];
      let modPresses = 0;
      const correct = await driveLap(g.page, {
        beforeWord: async () => {
          for (const m of MODS) { await g.page.keyboard.press(m); modPresses++; }
        },
      });

      assert.ok(modPresses >= 20, `enough modifier presses to matter (${modPresses})`);
      const totals = await readSpeedwayTotals(g.page);
      assert.equal(totals.acc, 100,
        `${modPresses} pure modifier keydowns were pressed during an otherwise perfect lap, and accuracy `
        + `reads ${totals.acc}% — a modifier must never be counted as a mistake `
        + '(CLAUDE.md §Engine input contract)');
      assert.equal(totals.chars, correct, 'and a modifier never advanced anything either');
      assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
    } finally { await g.stop(); }
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  Nothing is ever taken · no clock · the floor
// ════════════════════════════════════════════════════════════════════════════

describe('INV-78 — the advance floor is invariant: a lap always demands exactly the keystrokes it is long', () => {
  test('a clean lap and an error-heavy lap each cost exactly their own character count, and the odometer only adds', { timeout: T }, async (t) => {
    if (pend(t)) return;
    const g = await startGame();
    try {
      await installDrawRecorder(g.page);
      await enterFirstLap(g.page, g.baseUrl);

      const cleanCorrect = await driveLap(g.page);
      const afterClean = await readSpeedwayTotals(g.page);
      assert.equal(afterClean.chars, cleanCorrect, 'lap 1: odometer == correct keystrokes typed');
      assert.equal(afterClean.laps, 1);

      await nextLap(g.page);
      const dirtyCorrect = await driveLap(g.page, {
        beforeWord: async () => { for (let k = 0; k < 5; k++) await g.page.keyboard.press(ALWAYS_WRONG); },
      });
      const afterDirty = await readSpeedwayTotals(g.page);
      assert.equal(afterDirty.chars, cleanCorrect + dirtyCorrect,
        'lap 2 added exactly its own character count — an inaccurate lap is not a longer road '
        + '(spec §5.2(a): "every keystroke is worth the same road it was always worth")');
      assert.equal(afterDirty.laps, 2, 'both laps counted');
      assert.ok(afterDirty.cleanBest >= 1, 'the clean-run best exists');
      assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
    } finally { await g.stop(); }
  });
});

describe('INV-76 — no clock can end a run: distance is produced by typing, never consumed by time', () => {
  test('a lap left idle for a long stretch is exactly where it was, and still finishes', { timeout: T }, async (t) => {
    if (pend(t)) return;
    const g = await startGame();
    try {
      await installDrawRecorder(g.page);
      await enterFirstLap(g.page, g.baseUrl);

      const word = await currentWord(g.page);
      await typeWord(g.page, word.slice(0, -1));

      // Idle well past any plausible grace window. Nothing may end, shorten,
      // fail or interrupt the lap (product.md §1: "No timers running out").
      await g.page.waitForTimeout(9000);

      assert.equal(await currentWord(g.page), word, 'after a long idle the same word is still waiting');
      assert.equal(await atFinish(g.page), false, 'no clock ended the lap');
      const mid = await readSpeedwayTotals(g.page);
      assert.equal(mid.laps, 0, 'and nothing was recorded as finished');

      await g.page.keyboard.press(word[word.length - 1]);
      const rest = await driveLap(g.page);
      assert.ok(rest >= 0);
      assert.equal((await readSpeedwayTotals(g.page)).laps, 1, 'the very slow lap completed like any other');
      assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
    } finally { await g.stop(); }
  });
});

describe('INV-79/INV-77 — a wrong key costs NOTHING: charge, progress and every counter are untouched', () => {
  test('an error-heavy lap never drops a counter, and the pit board never shows a minus sign', { timeout: T }, async (t) => {
    if (pend(t)) return;
    const g = await startGame();
    try {
      await installDrawRecorder(g.page);
      await enterFirstLap(g.page, g.baseUrl);

      // Lap 1 — clean, to set a pace and seed the counters.
      await driveLap(g.page);
      const one = await readSpeedwayTotals(g.page);

      // Lap 2 — deliberately awful: a burst of wrong keys before every word,
      // typed slowly. It must still finish, and nothing may go DOWN.
      await nextLap(g.page);
      await driveLap(g.page, {
        beforeWord: async (i) => {
          for (let k = 0; k < 12; k++) await g.page.keyboard.press(ALWAYS_WRONG);
          if (i === 0) await g.page.waitForTimeout(1200);   // and slowly, too
        },
      });
      const two = await readSpeedwayTotals(g.page);

      assert.ok(two.laps > one.laps, 'LAPS only ever goes up');
      assert.ok(two.chars > one.chars, 'the ODOMETER only ever goes up');
      assert.ok(two.cleanBest >= one.cleanBest, 'the CLEAN-RUN best can never fall');

      // The pit board's own text: no minus sign, no negative delta, no verdict.
      const board = await captureDrawn(g.page, 3);
      assert.ok(drawnIncludes(board, 'LAP COMPLETE'), 'the pit board is on screen');
      assertNothingForbidden(board, 'the pit board');
      for (const s of board) {
        assert.ok(!s.includes('-') && !s.includes('−'),
          `the pit board drew ${JSON.stringify(s)} — "No negative number and no minus sign is ever displayed" (spec §5.5.1)`);
      }
      assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
    } finally { await g.stop(); }
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  The ghost is yourself · the field is atmosphere · no placement anywhere
// ════════════════════════════════════════════════════════════════════════════

describe('INV-80/INV-81/INV-82 — you race yourself, never an opponent, and there is no placement anywhere', () => {
  test('the first lap sets the pace with no ghost; the second races a ghost labelled as YOUR OWN last run', { timeout: T }, async (t) => {
    if (pend(t)) return;
    const g = await startGame();
    try {
      await installDrawRecorder(g.page);
      await enterFirstLap(g.page, g.baseUrl);

      // Lap 1 — there is no stored record, so there is no ghost (INV-81).
      const firstFrames = await captureDrawn(g.page, 3);
      assert.ok(drawnIncludes(firstFrames, 'FIRST LAP'),
        'the first lap is framed as setting the pace (spec §5.5: "FIRST LAP — YOU SET THE PACE")');
      assertNothingForbidden(firstFrames, 'the first lap');
      await driveLap(g.page);
      const afterFirst = await readSpeedwayTotals(g.page);
      assert.ok(afterFirst.hasLast, 'completing the first lap CREATES the record to race next time');

      // Lap 2 — now a ghost exists, and it is labelled as the player themself.
      await nextLap(g.page);
      const secondFrames = await captureDrawn(g.page, 3);
      const ghostLabel = secondFrames.find((s) => /GHOST/i.test(s));
      assert.ok(ghostLabel, 'the second lap shows a ghost label');
      assert.ok(/YOU/i.test(ghostLabel) && /LAST/i.test(ghostLabel),
        `the ghost is labelled as the player's own previous run, not a competitor (got ${JSON.stringify(ghostLabel)})`);
      assertNothingForbidden(secondFrames, 'the second lap');
      assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
    } finally { await g.stop(); }
  });

  test('across a whole session — hub, start line, race and pit board — no placement, ranking or defeat string is ever drawn', { timeout: T }, async (t) => {
    if (pend(t)) return;
    const g = await startGame();
    try {
      await installDrawRecorder(g.page);
      await toSpeedwayDoor(g.page, g.baseUrl);
      assert.ok(await enterHub(g.page), 'the hub came up');
      assertNothingForbidden(await captureDrawn(g.page, 3), 'the hub menu');

      await toStartLine(g.page);
      assertNothingForbidden(await captureDrawn(g.page, 3), 'the start line');

      await startRacing(g.page);
      const seen = [];
      await driveLap(g.page, {
        beforeWord: async (i) => {
          if (i % 3 === 0) seen.push(...await captureDrawn(g.page, 1));
          await g.page.keyboard.press(ALWAYS_WRONG);   // the field must not "win" either
        },
      });
      assertNothingForbidden(seen, 'the race itself');
      assertNothingForbidden(await captureDrawn(g.page, 3), 'the pit board');
      assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
    } finally { await g.stop(); }
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  Untrusted storage · EXPERIENCE scales the road
// ════════════════════════════════════════════════════════════════════════════

describe('INV-84 — a corrupt ghost is simply "no ghost": the track still plays (security.md rule 4)', () => {
  for (const [label, speedway] of Object.entries({
    'a hostile string where the ghost map belongs': '<script>alert(1)</script>',
    'a ghost with a garbage split table': { 'test-oval': { v: 1, last: { ms: 1000, splits: 'nope' }, laps: 3, chars: 999 } },
    'a record from an unknown future schema': { 'test-oval': { v: 77, last: null, laps: 1 } },
    'numbers where objects belong': { 'test-oval': 42 },
  })) {
    test(`${label} → the track still plays to a finish, with zero console errors`, { timeout: T }, async (t) => {
      if (pend(t)) return;
      const g = await startGame({
        localStorage: {
          'kk-slots': JSON.stringify({
            v: 1, active: 0,
            slots: [{ name: 'OONA', furthestLevel: 25, completed: {}, cards: [], speedway }],
          }),
        },
      });
      try {
        await installDrawRecorder(g.page);
        await enterFirstLap(g.page, g.baseUrl);
        const correct = await driveLap(g.page);
        assert.ok(correct > 0, 'the lap ran and finished despite the corrupt store');
        assert.ok(await atFinish(g.page), 'the pit board came up');
        assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
      } finally { await g.stop(); }
    });
  }
});

describe('INV-88 — EXPERIENCE scales the ROAD, never the demand (theme-authoring.md: "always MORE play, never a penalty")', () => {
  test('a WIZARD-tier lap is longer than a default-tier lap, and is still finishable at any typing rate', { timeout: T }, async (t) => {
    if (pend(t)) return;

    async function lapLengthAtTier(winRatio) {
      const g = await startGame({ settings: winRatio === 1 ? {} : { winRatio } });
      try {
        await installDrawRecorder(g.page);
        await enterFirstLap(g.page, g.baseUrl);
        const correct = await driveLap(g.page);
        const totals = await readSpeedwayTotals(g.page);
        assert.equal(totals.laps, 1, `the lap completed at winRatio ${winRatio} — the One Rule floor holds at every tier`);
        assert.equal(totals.chars, correct, 'and it demanded exactly its own length, no more');
        assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
        return correct;
      } finally { await g.stop(); }
    }

    const base = await lapLengthAtTier(1);
    const wizard = await lapLengthAtTier(3.5);
    assert.ok(wizard > base,
      `a higher EXPERIENCE tier is a LONGER ROAD (default ${base} characters vs WIZARD ${wizard})`);
  });
});
