// Enforces: INV-1..7 — CLAUDE.md §Wrong Keypress Behavior, §Engine input
// contract; product.md §"Reinforce, Don't Punish"; STRATEGY.md §5.
//
// This is the heart of the suite: the sacred wrong-keypress contract rendered
// executable. Every assertion is made ONLY through player-observable state
// (readPrompt / readHUD / readScreen) — never a game internal — so a pure
// refactor that preserves the child-visible behavior keeps these green
// (STRATEGY.md §2, the prime directive).
//
// The documented promises under test (verbatim intent):
//   1. Wrong key → letter STAYS on screen and WAITS; prompt does not advance. (sacred)
//   2. Wrong key → mistake logged QUIETLY; no alarming display by default.
//   3. Correct key after wrong → advances normally, NO double penalty.
//   4. Wrong keypress NEVER skips ahead — position monotonic in correct presses only.
//   5. Pure modifier keydowns (Shift/Ctrl/Alt/Meta alone) are ignored — never a mistake.
//   6. Case sensitivity applies ONLY when the expected token is uppercase A–Z.
//   7. Token vocabulary honored: lowercase chars/digits/symbols, uppercase A–Z as
//      Shift+letter exact-case, `' '`, `'Backspace'`.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  startGame,
  toLevel,
  readPrompt,
  readHUD,
  readScreen,
  press,
  pressChord,
} from '../helpers/game-driver.mjs';

// Hard per-test timeout so a hang FAILS rather than spins (a stuck level is a
// One Rule violation, and a spinning test hides it).
const T = 90_000;

// Navigation robustness: the shared driver's toLevel can land on the
// keyboard-preview screen ("KNOW YOUR KEYS") rather than the game screen for
// some levels — the flow's two Space presses aren't always enough past it.
// We reach the actual game surface through the same real key the player uses
// (Space), never a driver internal, so this stays a player-observable path.
// (The driver's own two-Space count is Lane A's file; this is a per-test guard,
// not a game defect — flagged to the orchestrator as an infra note.)
async function ensureGameScreen(page, { timeoutMs = 6000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const s = await readScreen(page);
    if (s === 'game-screen') return true;
    if (s === 'ready-screen' || s === 'keyboard-preview-screen') {
      await page.keyboard.press('Space');
    }
    await page.waitForTimeout(300);
  }
  return (await readScreen(page)) === 'game-screen';
}

// The engine re-renders ~300ms between patterns and ~150ms within one; a
// transient null activeToken during that window is expected. Poll for a stable,
// non-null prompt read before asserting — assert eventual state, never ms.
async function settledPrompt(page, { timeoutMs = 3000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let last = await readPrompt(page);
  while (Date.now() < deadline) {
    if (last.activeToken != null) return last;
    await page.waitForTimeout(80);
    last = await readPrompt(page);
  }
  return last; // may still be null — the caller asserts on that if it matters
}

// Advance (pressing each active token correctly) until the prompt is at the
// START (activeIndex 0) of a pattern with at least `minLen` tokens — so that a
// subsequent correct press's advance is UNAMBIGUOUSLY observable as the active
// index climbing 0→1 within the same rendered sequence. This sidesteps the
// single-token-pattern ambiguity where `["j"]` → `["j"]` looks identical.
// Returns the settled multi-token start prompt, or null if none reached.
async function advanceToMultiTokenStart(page, minLen = 2, maxSteps = 40) {
  for (let i = 0; i < maxSteps; i++) {
    const p = await settledPrompt(page);
    if (p.activeToken == null) return null;
    if (p.activeIndex === 0 && p.tokens.length >= minLen) return p;
    await press(page, p.activeToken);
    await page.waitForTimeout(200);
  }
  return null;
}

// A game-legal key that is NOT the expected token. Prefer one from the level's
// own key set (a real miss the engine registers), fall back to an outside key.
function wrongInSet(activeToken, levelKeys) {
  const candidate = levelKeys.find(
    (k) => k !== activeToken && /^[a-z0-9;,./\-=[\]\\'`]$/.test(k),
  );
  return candidate ?? (activeToken === 'z' ? 'q' : 'z');
}
function wrongOutsideSet(activeToken) {
  // 'q' is not in the home-row levels' key sets; 'z' as a fallback.
  return activeToken === 'q' ? 'z' : 'q';
}

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 1 — Level 1 (lowercase 'j'/'f'): the sacred wrong-key behavior.
// Enforces: INV-1, INV-2, INV-4 — CLAUDE.md §Wrong Keypress Behavior (1–4),
// product.md §"Reinforce, Don't Punish".
// ─────────────────────────────────────────────────────────────────────────────
describe('the sacred wrong-keypress contract (level 1, lowercase keys)', () => {
  const LEVEL1_KEYS = ['f', 'j']; // derived from levels.js LEVELS[1].keys
  let g;
  before(async () => {
    g = await startGame();
    await toLevel(g.page, g.baseUrl, 1);
    await ensureGameScreen(g.page);
  });
  after(async () => {
    if (g) await g.stop();
  });

  test('INV-1: a wrong key from the level\'s own key set — "letter stays on screen and waits"', { timeout: T }, async () => {
    const start = await settledPrompt(g.page);
    assert.ok(start.activeToken != null, 'level 1 renders an active prompt token');

    const wrong = wrongInSet(start.activeToken, LEVEL1_KEYS);
    assert.notEqual(wrong, start.activeToken, 'chose a genuinely wrong in-set key');

    await press(g.page, wrong);
    await g.page.waitForTimeout(150);

    const after = await readPrompt(g.page);
    assert.equal(after.activeIndex, start.activeIndex, 'active index unchanged — no advance');
    assert.equal(after.activeToken, start.activeToken, 'the letter stays and waits');
    assert.deepEqual(after.tokens, start.tokens, 'the whole prompt sequence is unchanged');
  });

  test('INV-1: a wrong key from OUTSIDE the level\'s key set also leaves the letter waiting', { timeout: T }, async () => {
    const start = await settledPrompt(g.page);
    const wrong = wrongOutsideSet(start.activeToken);

    await press(g.page, wrong);
    await g.page.waitForTimeout(150);

    const after = await readPrompt(g.page);
    assert.equal(after.activeIndex, start.activeIndex, 'active index unchanged for out-of-set wrong key');
    assert.equal(after.activeToken, start.activeToken, 'the letter still stays and waits');
  });

  test('INV-4: repeated wrong presses NEVER skip ahead — position is monotonic in correct presses only', { timeout: T }, async () => {
    const start = await settledPrompt(g.page);
    const wrongIn = wrongInSet(start.activeToken, LEVEL1_KEYS);
    const wrongOut = wrongOutsideSet(start.activeToken);

    // Hammer wrong keys (alternating in-set / out-of-set) many times.
    for (let i = 0; i < 8; i++) {
      await press(g.page, i % 2 === 0 ? wrongIn : wrongOut);
      await g.page.waitForTimeout(50);
    }

    const after = await readPrompt(g.page);
    assert.equal(after.activeIndex, start.activeIndex, 'after 8 wrong presses the position never advanced');
    assert.equal(after.activeToken, start.activeToken, 'the same letter still waits after a barrage of misses');
  });

  test('INV-2: wrong key logs the mistake QUIETLY — the running-mistake line is HIDDEN at the default "Small" tier, no alarming screen change', { timeout: T }, async () => {
    // product.md §Toggleable Settings: "Mistakes Shown" default is Small.
    // settings.js DEFAULTS.mistakeDisplay === 'small'. hud.js: at 'small' the
    // dedicated running-mistake-count line (#hud-mistakes) stays hidden — only
    // the always-present accuracy line shows. Observable meaning of "Small":
    // no looming mistake counter. (INV-2 "no alarming display by default".)
    const screenBefore = await readScreen(g.page);
    const hudBefore = await readHUD(g.page);
    assert.equal(hudBefore.mistakes, null, 'the running-mistake line is hidden at the default tier (Small)');

    const start = await settledPrompt(g.page);
    await press(g.page, wrongInSet(start.activeToken, LEVEL1_KEYS));
    await g.page.waitForTimeout(150);

    const screenAfter = await readScreen(g.page);
    const hudAfter = await readHUD(g.page);
    assert.equal(screenAfter, screenBefore, 'a wrong key does NOT change the visible screen (no alarming overlay)');
    assert.equal(screenAfter, 'game-screen', 'still on the game screen after a miss');
    assert.equal(hudAfter.mistakes, null, 'the running-mistake count remains hidden after a miss (quiet logging)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 2 — "no double penalty": correct-after-wrong advances, one mistake per
// incident, streak rebuilds.
// Enforces: INV-3 — CLAUDE.md §Wrong Keypress Behavior (4: "no double penalty"),
// product.md §"Reinforce, Don't Punish".
// ─────────────────────────────────────────────────────────────────────────────
describe('correct key after a wrong key — "advance normally, no double penalty"', () => {
  const LEVEL1_KEYS = ['f', 'j'];
  let g;
  before(async () => {
    g = await startGame();
    await toLevel(g.page, g.baseUrl, 1);
    await ensureGameScreen(g.page);
  });
  after(async () => {
    if (g) await g.stop();
  });

  test('INV-3: a wrong key then the correct key advances exactly one position', { timeout: T }, async () => {
    // Stand on the START of a multi-token pattern so "advance by exactly one" is
    // observable unambiguously as the active index climbing 0→1 within the same
    // rendered sequence (single-token patterns can't distinguish advance from a
    // re-render of an identical pattern).
    const start = await advanceToMultiTokenStart(g.page, 2);
    assert.ok(start, 'reached the start of a multi-token pattern');
    const startTokensKey = start.tokens.join(' ');
    assert.equal(start.activeIndex, 0, 'standing at index 0 of the pattern');

    // Wrong first — the letter must stay.
    await press(g.page, wrongInSet(start.activeToken, LEVEL1_KEYS));
    await g.page.waitForTimeout(120);
    const waited = await readPrompt(g.page);
    assert.equal(waited.activeIndex, 0, 'letter waited at index 0 after the wrong key');
    assert.equal(waited.activeToken, start.activeToken, 'the same letter waits');

    // Now the correct key — the game must move on by EXACTLY one step: index 0→1
    // within the SAME sequence. Not 0→2 (that would be a double skip).
    await press(g.page, start.activeToken);
    await g.page.waitForTimeout(300);

    const after = await settledPrompt(g.page);
    assert.equal(after.tokens.join(' '), startTokensKey, 'still within the same rendered pattern');
    assert.equal(
      after.activeIndex,
      1,
      'correct-after-wrong advanced exactly ONE position (0→1) — never a double skip',
    );
  });

  test('INV-3: streak is 0 during an unresolved incident, then a clean correct run rebuilds it — one incident, one reset', { timeout: T }, async () => {
    // The doc's model: a wrong key resets the streak (state.streak = 0);
    // correcting yourself is rewarded, not double-penalized. Observable claim:
    // after a miss the streak reads 0; a subsequent clean run of correct keys
    // rebuilds the streak by exactly the number of correct presses — the miss
    // cost the streak once, never twice.
    let cur = await settledPrompt(g.page);

    // Force a miss on the current letter, then read the HUD: streak must be 0.
    await press(g.page, wrongInSet(cur.activeToken, LEVEL1_KEYS));
    await g.page.waitForTimeout(120);
    const hudAfterMiss = await readHUD(g.page);
    assert.equal(hudAfterMiss.streak, 0, 'a wrong key resets the streak to 0 (documented model)');

    // Now type several correct keys in a row and confirm the streak climbs by
    // exactly one per correct press (no lingering penalty from the earlier miss).
    let prevStreak = 0;
    for (let i = 0; i < 4; i++) {
      cur = await settledPrompt(g.page);
      if (cur.activeToken == null) break;
      await press(g.page, cur.activeToken);
      await g.page.waitForTimeout(220);
      const hud = await readHUD(g.page);
      assert.equal(
        hud.streak,
        prevStreak + 1,
        `streak climbed by exactly 1 on correct press #${i + 1} — no double penalty from the earlier miss`,
      );
      prevStreak = hud.streak;
    }
    assert.equal(prevStreak, 4, 'a clean 4-key run rebuilt the streak to 4 — the miss was counted once, not twice');
  });

  test('INV-2/INV-3: a self-corrected letter counts as exactly ONE mistake for that letter (per-letter, quiet)', { timeout: T }, async () => {
    // Wrong then right on the SAME letter must log a single mistake for that
    // letter — "no double penalty" and per-letter mistake accounting. The
    // running count is hidden by default (Small), so we observe it by switching
    // to the documented 'prominent' tier (Mistakes Shown → Prominent), which is
    // the tier whose observable meaning IS the running counter (hud.js). We only
    // toggle a SETTING to make the already-recorded count visible; the behavior
    // under test — how many mistakes a self-correction logs — is unchanged by it.
    // Fresh game at the 'prominent' tier so the count starts clean at 0.
    const g2 = await startGame({ settings: { mistakeDisplay: 'prominent' } });
    try {
      await toLevel(g2.page, g2.baseUrl, 1);
      await ensureGameScreen(g2.page);
      const before = await readHUD(g2.page);
      assert.equal(before.mistakes, 0, 'prominent tier shows a running mistake count, starting at 0');

      const cur = await settledPrompt(g2.page);
      // One wrong, then the correct key (self-correction).
      await press(g2.page, wrongInSet(cur.activeToken, LEVEL1_KEYS));
      await g2.page.waitForTimeout(120);
      await press(g2.page, cur.activeToken);
      await g2.page.waitForTimeout(400);

      const after = await readHUD(g2.page);
      assert.equal(after.mistakes, 1, 'a wrong-then-right on the same letter logged exactly ONE mistake — no double penalty');
      assert.deepEqual(g2.consoleErrors, [], `no console errors:\n${g2.consoleErrors.join('\n')}`);
    } finally {
      await g2.stop();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 3 — Pure modifier keydowns are ignored entirely; never a mistake.
// Enforces: INV-5 — CLAUDE.md §Engine input contract ("Pure modifier keydowns
// are ignored entirely — never a mistake").
// ─────────────────────────────────────────────────────────────────────────────
describe('pure modifier keydowns are ignored entirely — never a mistake', () => {
  let g;
  before(async () => {
    // Prominent tier so a would-be mistake would show up in the running count.
    g = await startGame({ settings: { mistakeDisplay: 'prominent' } });
    await toLevel(g.page, g.baseUrl, 1);
    await ensureGameScreen(g.page);
  });
  after(async () => {
    if (g) await g.stop();
  });

  test('INV-5: bare Shift/Control/Alt/Meta down+up change neither the prompt nor the mistake count', { timeout: T }, async () => {
    const start = await settledPrompt(g.page);
    const mistakesBefore = (await readHUD(g.page)).mistakes;
    assert.equal(mistakesBefore, 0, 'clean start: zero mistakes at the prominent tier');

    for (const mod of ['Shift', 'Control', 'Alt', 'Meta']) {
      await g.page.keyboard.down(mod);
      await g.page.waitForTimeout(40);
      await g.page.keyboard.up(mod);
      await g.page.waitForTimeout(40);

      const p = await readPrompt(g.page);
      assert.equal(p.activeToken, start.activeToken, `bare ${mod} did not advance the prompt`);
      assert.equal(p.activeIndex, start.activeIndex, `bare ${mod} left the active index put`);
      const hud = await readHUD(g.page);
      assert.equal(hud.mistakes, 0, `bare ${mod} never counted as a mistake`);
    }

    assert.deepEqual(g.consoleErrors, [], `no console errors:\n${g.consoleErrors.join('\n')}`);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 4 — Case sensitivity at a LOWERCASE level (level 1): Shift-held letter
// still matches, because the expected token is lowercase.
// Enforces: INV-6 — CLAUDE.md §Engine input contract ("Case-sensitivity applies
// ONLY when the expected token is uppercase").
// ─────────────────────────────────────────────────────────────────────────────
describe('case rule at a lowercase level — Shift held does NOT make a match wrong', () => {
  let g;
  before(async () => {
    g = await startGame({ settings: { mistakeDisplay: 'prominent' } });
    await toLevel(g.page, g.baseUrl, 1);
    await ensureGameScreen(g.page);
  });
  after(async () => {
    if (g) await g.stop();
  });

  test('INV-6: at level 1 (lowercase expectation) typing the letter WITH Shift held still advances — case only matters for uppercase tokens', { timeout: T }, async () => {
    // Multi-token start so the advance (0→1) is observable unambiguously.
    const start = await advanceToMultiTokenStart(g.page, 2);
    assert.ok(start, 'reached the start of a multi-token pattern');
    assert.ok(/^[a-z]$/.test(start.activeToken), 'level 1 expects a lowercase letter');
    const startTokensKey = start.tokens.join(' ');
    const mistakesBefore = (await readHUD(g.page)).mistakes;

    // Press Shift + the expected letter (uppercase chord). Documented contract:
    // lowercase expectation compares case-insensitively, so this MATCHES.
    await pressChord(g.page, ['Shift'], start.activeToken.toUpperCase());
    await g.page.waitForTimeout(300);

    const after = await settledPrompt(g.page);
    assert.equal(after.tokens.join(' '), startTokensKey, 'still within the same rendered pattern');
    assert.equal(
      after.activeIndex,
      1,
      'Shift+letter at a lowercase level advanced 0→1 — treated as correct, not a miss',
    );

    const mistakesAfter = (await readHUD(g.page)).mistakes;
    assert.equal(mistakesAfter, mistakesBefore, 'Shift+letter at a lowercase level logged NO mistake');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 5 — The Shift level (24): uppercase tokens require exact-case; wrong
// case does not advance.
// Enforces: INV-6, INV-7 — CLAUDE.md §Engine input contract (uppercase A–Z =
// Shift+letter exact-case matched), act5.md §Level 24 (Shift / capitals).
// ─────────────────────────────────────────────────────────────────────────────
describe('the Shift level (24) — uppercase tokens are exact-case', () => {
  let g;
  before(async () => {
    // Seed progress to the Shift level per the task; the wopr bypass reaches it
    // regardless, but seeding documents intent. mistakeDisplay prominent so a
    // wrong-case press would surface as a counted mistake.
    g = await startGame({
      settings: { mistakeDisplay: 'prominent' },
      progress: { furthestLevel: 24 },
    });
    await toLevel(g.page, g.baseUrl, 24);
    await ensureGameScreen(g.page);
  });
  after(async () => {
    if (g) await g.stop();
  });

  test('INV-7: the Shift level presents an UPPERCASE A–Z prompt token', { timeout: T }, async () => {
    const start = await settledPrompt(g.page);
    assert.ok(start.activeToken != null, 'level 24 renders an active token');
    assert.ok(/^[A-Z]$/.test(start.activeToken), 'the active token is an uppercase letter (Shift chord expected)');
  });

  test('INV-6: wrong CASE (letter without Shift) does NOT advance the uppercase prompt — the letter waits', { timeout: T }, async () => {
    const start = await settledPrompt(g.page);
    assert.ok(/^[A-Z]$/.test(start.activeToken), 'expected token is uppercase');

    // Press the letter WITHOUT Shift (lowercase e.key) — must NOT match.
    await g.page.keyboard.press(start.activeToken.toLowerCase());
    await g.page.waitForTimeout(200);

    const after = await readPrompt(g.page);
    assert.equal(after.activeToken, start.activeToken, 'lowercase press against an uppercase token did NOT advance — case matters here');
    assert.equal(after.activeIndex, start.activeIndex, 'the uppercase letter stays and waits');
  });

  test('INV-6/INV-7: correct case (Shift+letter chord) advances the uppercase prompt', { timeout: T }, async () => {
    // Stand at the start of a multi-token pattern whose FIRST token is uppercase,
    // so the Shift-chord match's advance is observable unambiguously as 0→1
    // within the same rendered sequence (single-token uppercase patterns can't
    // distinguish advance from a re-render of an identical one-letter pattern).
    let start = null;
    for (let i = 0; i < 40; i++) {
      const p = await settledPrompt(g.page);
      if (p.activeToken == null) break;
      if (p.activeIndex === 0 && p.tokens.length >= 2 && /^[A-Z]$/.test(p.activeToken)) {
        start = p;
        break;
      }
      await press(g.page, p.activeToken); // correct-press each token to advance
      await g.page.waitForTimeout(200);
    }
    assert.ok(start, 'reached the start of a multi-token pattern whose first token is uppercase');
    const startTokensKey = start.tokens.join(' ');

    await press(g.page, start.activeToken); // press() maps A–Z to a Shift chord
    await g.page.waitForTimeout(300);

    const after = await settledPrompt(g.page);
    assert.equal(after.tokens.join(' '), startTokensKey, 'still within the same rendered pattern');
    assert.equal(
      after.activeIndex,
      1,
      'Shift+letter (exact case) advanced the uppercase prompt exactly 0→1',
    );
    assert.deepEqual(g.consoleErrors, [], `no console errors:\n${g.consoleErrors.join('\n')}`);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 6 — Level 25 vocabulary: `' '` (Space) and `'Backspace'` are real tokens
// exercised via real Space/Backspace key presses.
// Enforces: INV-7 — CLAUDE.md §Engine input contract (`' '`, `'Backspace'`
// tokens), act5.md §Level 25 (Space & Backspace).
// ─────────────────────────────────────────────────────────────────────────────
describe('level 25 vocabulary — Space and Backspace are real, pressable tokens', () => {
  let g;
  before(async () => {
    g = await startGame({ progress: { furthestLevel: 25 } });
    await toLevel(g.page, g.baseUrl, 25);
    await ensureGameScreen(g.page);
  });
  after(async () => {
    if (g) await g.stop();
  });

  // Advance through patterns (pressing each active token correctly) until the
  // active prompt token equals `target`, or we run out of tries. Returns the
  // settled prompt whose activeToken === target, else null.
  async function advanceUntilToken(page, target, maxSteps = 60) {
    for (let i = 0; i < maxSteps; i++) {
      const p = await settledPrompt(page);
      if (p.activeToken == null) return null;
      if (p.activeToken === target) return p;
      await press(page, p.activeToken);
      await page.waitForTimeout(180);
    }
    return null;
  }

  test('INV-7: a `\' \'` (Space) token appears and a real Space press advances it', { timeout: T }, async () => {
    // Level 25's intro includes a pattern with a space token (e.g. j f _ j f).
    const atSpace = await advanceUntilToken(g.page, ' ');
    assert.ok(atSpace, 'reached a prompt whose active token is a space');
    const startTokensKey = atSpace.tokens.join(' ');

    await press(g.page, ' '); // real Space key
    await g.page.waitForTimeout(400);

    const after = await settledPrompt(g.page);
    const advanced =
      (after.tokens.join(' ') === startTokensKey && after.activeIndex === atSpace.activeIndex + 1) ||
      (after.tokens.join(' ') !== startTokensKey && after.activeIndex === 0);
    assert.ok(advanced, 'a real Space press satisfied the space token and advanced');
  });

  test('INV-7: a `\'Backspace\'` token appears and a real Backspace press advances it', { timeout: T }, async () => {
    const atBksp = await advanceUntilToken(g.page, 'Backspace');
    assert.ok(atBksp, 'reached a prompt whose active token is Backspace');
    const startTokensKey = atBksp.tokens.join(' ');

    await press(g.page, 'Backspace'); // real Backspace key
    await g.page.waitForTimeout(400);

    const after = await settledPrompt(g.page);
    const advanced =
      (after.tokens.join(' ') === startTokensKey && after.activeIndex === atBksp.activeIndex + 1) ||
      (after.tokens.join(' ') !== startTokensKey && after.activeIndex === 0);
    assert.ok(advanced, 'a real Backspace press satisfied the Backspace token and advanced');
    assert.deepEqual(g.consoleErrors, [], `no console errors:\n${g.consoleErrors.join('\n')}`);
  });
});
