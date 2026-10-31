// Enforces: INV-135, INV-136 — product.md §3 "Reinforce, Don't Punish" (as amended
// 2026-10-30, Trevor):
//   "Holding a key down is ONE press. The keyboard's auto-repeat is ignored for
//    every typed token: a held wrong key is one nudge and one logged mistake,
//    never one per repeat (a single hold was logging +8 to +13), and a held right
//    key on a doubled letter (`jj`) advances once, never twice."
//   "The letter the player sees is the letter being judged. A key pressed in the
//    short beat between one pattern finishing and the next one appearing first
//    draws the next pattern, then is judged against it — a fast typist is never
//    judged against a word that is not on screen, and a finished letter is never
//    re-highlighted. A key pressed after the level's last pattern, while the win is
//    being shown, is simply ignored."
// and the SACRED contract it must not disturb (CLAUDE.md §Wrong Keypress Behavior,
// INV-1..INV-4): a wrong key still nudges, the letter STAYS and WAITS, the mistake
// is logged quietly, the correct key then advances with no double penalty.
//
// "Held" is a real held key: Playwright's keyboard.down() on a key that is already
// down emits a keydown with repeat=true — exactly what the OS auto-repeat does.
// Observables: the prompt the child reads (#prompt-sequence classes), the running
// mistake count (the PROMINENT mistake display), and console errors.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startGame, toLevel, readPrompt, readHUD, press, isLevelCompleteVisible, waitForComplete } from '../helpers/game-driver.mjs';

const T = 180_000;
const SETTLE = 500;

// A valid game key that is never the expected token at Level 1 (keys: f, j).
const WRONG = 'z';

async function waitForActive(page, timeoutMs = 4000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const p = await readPrompt(page);
    if (p.activeToken != null) return p;
    if (Date.now() > deadline) return p;
    await page.waitForTimeout(60);
  }
}

async function hold(page, key, repeats, gapMs = 15) {
  await page.keyboard.down(key);                         // the real first keydown
  for (let i = 1; i < repeats; i++) {                    // auto-repeat: repeat=true
    await page.waitForTimeout(gapMs);
    await page.keyboard.down(key);
  }
  await page.keyboard.up(key);
}

describe('INV-135 — holding a key down is ONE press', () => {
  let g;
  before(async () => {
    g = await startGame({ settings: { mistakeDisplay: 'prominent' } });
    await toLevel(g.page, g.baseUrl, 1);
  });
  after(async () => { await g.stop(); });

  test('a held WRONG key logs exactly ONE mistake (never +8…+13) and the letter still waits', { timeout: T }, async () => {
    const start = await waitForActive(g.page);
    assert.ok(start.activeToken != null);
    assert.equal((await readHUD(g.page)).mistakes, 0, 'clean start');

    await hold(g.page, WRONG, 12);
    await g.page.waitForTimeout(SETTLE);

    assert.equal((await readHUD(g.page)).mistakes, 1, 'one hold = one nudge = one logged mistake');
    const after = await readPrompt(g.page);
    assert.equal(after.activeToken, start.activeToken, 'the letter stays on screen and waits (INV-1)');
    assert.equal(after.activeIndex, start.activeIndex, 'nothing advanced (INV-4)');
  });

  test('two SEPARATE presses of the wrong key are still two mistakes — only auto-repeat is ignored', { timeout: T }, async () => {
    const before = (await readHUD(g.page)).mistakes;
    await press(g.page, WRONG); await g.page.waitForTimeout(80);
    await press(g.page, WRONG); await g.page.waitForTimeout(SETTLE);
    assert.equal((await readHUD(g.page)).mistakes, before + 2);
  });

  test('the correct key after a held wrong key advances normally with no double penalty (INV-3)', { timeout: T }, async () => {
    const { activeToken, activeIndex } = await readPrompt(g.page);
    const mistakes = (await readHUD(g.page)).mistakes;
    await press(g.page, activeToken);
    // Read at once, inside the paced beat: the letter just typed is shown completed.
    const completed = await g.page.evaluate(() => document.querySelectorAll('#prompt-sequence .prompt-letter.completed').length);
    assert.equal(completed, activeIndex + 1, 'the right key advanced the prompt by one letter');
    await g.page.waitForTimeout(SETTLE + 200);
    assert.equal((await readHUD(g.page)).mistakes, mistakes, 'no extra penalty for correcting');
  });

  test('a held RIGHT key on a doubled letter (jj) advances ONCE, never twice', { timeout: T }, async () => {
    // Level 1's drills include `jj` / `ff`. Type correct patterns until one with a
    // doubled first letter is on screen (bounded), then HOLD its right key.
    let found = null;
    for (let i = 0; i < 20 && !found; i++) {
      const p = await waitForActive(g.page);
      if (p.activeIndex === 0 && p.tokens.length >= 2 && p.tokens[0] === p.tokens[1]) { found = p; break; }
      for (let k = p.activeIndex; k < p.tokens.length; k++) { await press(g.page, p.tokens[k]); await g.page.waitForTimeout(40); }
      await g.page.waitForTimeout(SETTLE);
    }
    assert.ok(found, 'a doubled-letter pattern came up at Level 1');
    const mistakesBefore = (await readHUD(g.page)).mistakes;

    await hold(g.page, found.tokens[0], 10);
    await g.page.waitForTimeout(250);   // inside the pattern, before any re-render

    const now = await readPrompt(g.page);
    assert.deepEqual(now.tokens, found.tokens, 'still the same pattern — the hold did not finish it');
    assert.equal(now.activeIndex, 1, 'the hold advanced exactly one letter');
    assert.equal((await readHUD(g.page)).mistakes, mistakesBefore, 'and logged nothing');

    // The second letter, pressed afresh, completes it — doubled letters stay typeable.
    await press(g.page, found.tokens[1]);
    await g.page.waitForTimeout(SETTLE + 200);
    const after = await readPrompt(g.page);
    assert.notDeepEqual([after.tokens.join(''), after.activeIndex], [found.tokens.join(''), 1], 'a fresh press completes the pattern');
  });

  test('a held key never produces console errors', () => {
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });
});

describe('INV-136 — the letter the player sees is the letter being judged', () => {
  let g;
  before(async () => {
    g = await startGame({ settings: { mistakeDisplay: 'prominent' } });
    await toLevel(g.page, g.baseUrl, 1);
  });
  after(async () => { await g.stop(); });

  const completedAndActive = (page) => page.evaluate(() =>
    document.querySelectorAll('#prompt-sequence .prompt-letter.completed.active').length);

  test('a fast typist never sees a finished letter re-highlighted: no letter is both completed and active', { timeout: T }, async () => {
    // Find a pattern of 2+ letters and type it faster than the re-light beat.
    let p = null;
    for (let i = 0; i < 20; i++) {
      p = await waitForActive(g.page);
      if (p.activeIndex === 0 && p.tokens.length >= 2) break;
      await press(g.page, p.activeToken); await g.page.waitForTimeout(SETTLE);
    }
    assert.ok(p && p.tokens.length >= 2 && p.activeIndex === 0, 'a multi-letter pattern is on screen');

    // Sample the prompt every ~10ms in-page while the typing happens.
    await g.page.evaluate(() => {
      window.__bad = 0; window.__frames = 0;
      window.__sampler = setInterval(() => {
        window.__frames += 1;
        window.__bad += document.querySelectorAll('#prompt-sequence .prompt-letter.completed.active').length;
      }, 10);
    });
    for (const t of p.tokens) await press(g.page, t);          // no waits: faster than the beat
    await g.page.waitForTimeout(1000);
    const { bad, frames } = await g.page.evaluate(() => { clearInterval(window.__sampler); return { bad: window.__bad, frames: window.__frames }; });
    assert.ok(frames > 50, `the sampler ran (${frames} samples)`);
    assert.equal(bad, 0, 'at no instant was a completed letter also highlighted as the one to type');
    assert.equal(await completedAndActive(g.page), 0);
  });

  test('a key pressed in the beat between patterns is judged against the pattern that is NOW on screen', { timeout: T }, async () => {
    // Finish the pattern, then hit a wrong key INSIDE the gap, before the next
    // pattern has been drawn by its own timer.
    let p = await waitForActive(g.page);
    while (p.tokens.length - p.activeIndex > 1) { await press(g.page, p.activeToken); await g.page.waitForTimeout(60); p = await waitForActive(g.page); }
    const mistakesBefore = (await readHUD(g.page)).mistakes;
    const oldPattern = p.tokens.join('');

    await press(g.page, p.activeToken);        // completes the pattern -> the paced beat begins
    await press(g.page, WRONG);                // immediately: inside the beat
    const right = await g.page.evaluate(() => ({
      completed: document.querySelectorAll('#prompt-sequence .prompt-letter.completed').length,
      active: [...document.querySelectorAll('#prompt-sequence .prompt-letter')].findIndex((e) => e.classList.contains('active')),
      count: document.querySelectorAll('#prompt-sequence .prompt-letter').length,
    }));
    assert.equal(right.completed, 0, 'the screen already shows the NEXT pattern fresh — nothing in it is "completed"');
    assert.equal(right.active, 0, 'with its first letter waiting');
    assert.ok(right.count >= 1);

    await g.page.waitForTimeout(SETTLE);
    assert.equal((await readHUD(g.page)).mistakes, mistakesBefore + 1, 'the stray key was judged (and logged quietly) against the drawn pattern');
    const now = await readPrompt(g.page);
    assert.equal(now.activeIndex, 0, 'the sacred contract holds: the new pattern\'s first letter stays and waits');
    assert.ok(now.activeToken != null);
    void oldPattern;
  });

  test('…and the right key for that new pattern then advances normally (no double penalty)', { timeout: T }, async () => {
    const p = await waitForActive(g.page);
    const m = (await readHUD(g.page)).mistakes;
    await press(g.page, p.activeToken);
    await g.page.waitForTimeout(SETTLE);
    assert.equal((await readHUD(g.page)).mistakes, m);
  });

  test('no console errors from any of the above', () => {
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });
});

describe('INV-136 — a key pressed while the win is being shown is simply ignored', () => {
  let g;
  before(async () => {
    g = await startGame({ settings: { mistakeDisplay: 'prominent' } });
    await toLevel(g.page, g.baseUrl, 1);
  });
  after(async () => { await g.stop(); });

  test('stray keys after the last pattern are not mistakes and break nothing; the level still completes', { timeout: 240_000 }, async () => {
    let probed = false;
    for (let i = 0; i < 2500 && !probed; i++) {
      if (await isLevelCompleteVisible(g.page)) break;
      const p = await readPrompt(g.page);
      if (p.activeToken == null) {
        // Either the ~300ms beat between patterns, or the win itself. A beat ends by
        // drawing a fresh pattern; the win never does. Give it longer than a beat.
        await g.page.waitForTimeout(650);
        if ((await readPrompt(g.page)).activeToken == null && !(await isLevelCompleteVisible(g.page))) {
          for (const k of [WRONG, 'q', 'x', 'z']) { await press(g.page, k); await g.page.waitForTimeout(40); }
          probed = true;
        }
        continue;
      }
      await press(g.page, p.activeToken);
      await g.page.waitForTimeout(60);
    }
    assert.ok(probed, 'reached the win window and fired stray keys into it');
    await g.page.waitForTimeout(150);
    // The HUD panel is tucked away while the win is shown, so read the counter's own
    // text (the number the HUD would print) rather than the visible-HUD reader.
    const during = await g.page.evaluate(() => (document.getElementById('hud-mistakes') || {}).textContent);
    assert.equal(during, '0', 'keys during the win were not judged at all');
    assert.ok(await waitForComplete(g.page, 15000), 'the level still completes');
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });
});
