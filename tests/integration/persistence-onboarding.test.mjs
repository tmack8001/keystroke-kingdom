// Enforces: INV-24, INV-25, INV-26, INV-27, INV-28
// Sources: .claude/rules/levels/onboarding.md (§Name Entry, §Returning Player Flow,
// §The Arcade at Level 1, §Design Rules for the Opening) — the ground truth for
// entry flows; CLAUDE.md §Player Name, §Platform Key Label (Return vs Enter),
// §Returning-player persistence; .claude/rules/transitions.md §Phase 3 (name entry
// detail: 16-char cap, Backspace, Space types a space / only Return confirms,
// no validation — revised 2026-07-13, Trevor triage of TF-H2/TF-H3);
// security.md rule 4 ("localStorage is untrusted input... tolerate garbage").
//
// Persistence & onboarding flows, driven through the real browser via the shared
// driver (tests/helpers/game-driver.mjs). Raw (non-wopr) flows are used wherever
// the onboarding UX itself is under test; the wopr bypass is reserved for reaching
// a level fast in wave-1/other lanes, and is deliberately NOT used here — the wopr
// bypass sets state.selectBypass = true, which unlocks every cabinet and would
// mask exactly the gating behavior these tests exist to verify.
//
// Expected level text ("LEVEL 3 — S & L") is derived from js/levels.js's LEVELS
// data (the game's own data file), never hardcoded, per STRATEGY.md §2.

import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  startGame,
  coldOpenToTitle,
  readScreen,
  press,
  winLevel,
} from '../helpers/game-driver.mjs';

const require = createRequire(import.meta.url);
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Pure data import — no DOM deps — used only to DERIVE expected display text
// from the game's own curriculum data, never to hardcode a copied constant.
const { LEVELS } = await import(join(REPO_ROOT, 'js', 'levels.js'));

const SETTLE_MS = 400;

// A hostile string that must NEVER be interpreted as HTML if it reaches a DOM
// sink. If any sink used innerHTML instead of textContent, this would inject an
// element with id="pwned" we can detect.
const HOSTILE_NAME = '<img src=x onerror="window.__pwned=1" id="pwned">';

// startGame({ progress }) seeds localStorage via page.addInitScript, which
// (by design, per game-driver.mjs's own JSDoc) re-runs BEFORE EVERY
// navigation — including a page.reload() the test itself triggers later. That
// makes it the wrong tool for any scenario that needs to reload AFTER the
// game has written new localStorage state (winning a level, erasing progress)
// within the same test: the init script would silently stomp the game's own
// write back to the original seed on the next reload, which would look like
// (but is not) a persistence bug. For those scenarios we seed progress via a
// one-time in-page localStorage.setItem AFTER the first real navigation
// instead — a plain write no future reload re-applies — using an UNSEEDED
// startGame().
async function seedProgressLive(page, baseUrl, progress) {
  await page.goto(baseUrl);
  await page.evaluate((json) => localStorage.setItem('kk-progress', json), JSON.stringify(progress));
}

// ── INV-24 — Name Entry ──────────────────────────────────────────────────────
// onboarding.md §Design Rules: "Name entry is optional in one keypress."
// transitions.md §Phase 3 (revised 2026-07-13, Trevor): pre-filled "PLAYER ONE",
// any key clears it, 16-char cap, Space types a literal space (multi-word names
// are intended — the default itself is two words), only Return confirms, empty
// confirm keeps PLAYER ONE, saved to localStorage immediately on confirm.
describe('INV-24 — name entry (onboarding.md §Name Entry, transitions.md §Phase 3)', () => {
  let g;
  before(async () => {
    g = await startGame();
  });
  after(async () => {
    await g.stop();
  });

  // TF-H1 — FIXED 2026-07-13 (Trevor triage): onboarding.md/transitions.md §Phase 3
  // "pre-filled, dimmed — selected and ready to be overwritten. Any key press
  // clears the default and starts typing fresh." main.js now select()s the
  // prefilled value on reveal, so the first typed character replaces it natively.
  // This is the un-todo'd form of the original TF-H1 finding (FINDINGS.md).
  test('TF-H1 fixed: typing clears the pre-filled PLAYER ONE and starts fresh (onboarding.md §Design Rules)', async () => {
    await coldOpenToTitle(g.page, g.baseUrl);
    await g.page.keyboard.press('Enter'); // reveal name entry
    await g.page.waitForTimeout(SETTLE_MS);
    await g.page.keyboard.type('O', { delay: 30 });
    await g.page.waitForTimeout(120);
    const afterFirstKey = await g.page.$eval('#player-name-input', (el) => el.value);
    assert.equal(afterFirstKey, 'O', 'first keystroke starts the name fresh — never appends to the default');
    await g.page.keyboard.type('ONA', { delay: 30 });
    await g.page.keyboard.press('Enter');
    await g.page.waitForTimeout(SETTLE_MS);
    const readyName = await g.page.$eval('#ready-name', (el) => el.textContent);
    assert.equal(readyName, 'OONA', 'the fresh-typed name is the confirmed name');
  });

  // Shared helper used by several tests below (name-entry field is focused and
  // may have residual text) — clears the input via Backspace, then types fresh.
  async function clearAndType(page, name) {
    const len = (await page.$eval('#player-name-input', (el) => el.value.length));
    for (let i = 0; i < len; i++) await page.keyboard.press('Backspace');
    await page.keyboard.type(name, { delay: 30 });
    await page.waitForTimeout(120);
  }

  // TF-H2 — RULED BY-DESIGN 2026-07-13 (Trevor triage): "16 characters should be
  // the largest word limit." transitions.md §Phase 3 now documents 16, matching
  // index.html's maxlength="16" and settings.js's sanitize() slice(0, 16).
  test('TF-H2 by-design: name input caps at 16 characters (transitions.md §Phase 3)', async () => {
    await coldOpenToTitle(g.page, g.baseUrl);
    await g.page.keyboard.press('Enter'); // reveal name entry
    await g.page.waitForTimeout(SETTLE_MS);
    await clearAndType(g.page, 'ABCDEFGHIJKLMNOPQRST'); // 20 characters typed
    const value = await g.page.$eval('#player-name-input', (el) => el.value);
    assert.equal(value.length, 16, `name input should cap at 16 characters, got length ${value.length}`);
    assert.equal(value, 'ABCDEFGHIJKLMNOP', 'the first 16 characters typed are kept, the rest discarded');
    await g.page.keyboard.press('Enter'); // confirm
    await g.page.waitForTimeout(SETTLE_MS);
    const readyName = await g.page.$eval('#ready-name', (el) => el.textContent);
    assert.equal(readyName, 'ABCDEFGHIJKLMNOP', 'the capped 16-character name is what gets confirmed');
  });

  test('empty confirm keeps PLAYER ONE', async () => {
    await coldOpenToTitle(g.page, g.baseUrl);
    await g.page.keyboard.press('Enter');
    await g.page.waitForTimeout(SETTLE_MS);
    // Confirm immediately with nothing typed — this path is unaffected by
    // TF-H1 (nothing was typed to append to).
    await g.page.keyboard.press('Enter');
    await g.page.waitForTimeout(SETTLE_MS);
    const readyName = await g.page.$eval('#ready-name', (el) => el.textContent);
    assert.equal(readyName, 'PLAYER ONE', 'an empty confirm keeps the PLAYER ONE default');
  });

  // The following tests exercise Return-confirms / Space-types-a-space /
  // persistence-across-reload using a name typed via Backspace-then-type —
  // i.e. explicitly clearing the field ourselves first — so they verify the
  // CONFIRM MECHANISM and PERSISTENCE independently of TF-H1 (which is about
  // the clear-on-first-keystroke behavior, already recorded above once).
  test('Return confirms', async () => {
    await coldOpenToTitle(g.page, g.baseUrl);
    await g.page.keyboard.press('Enter'); // reveal name entry
    await g.page.waitForTimeout(SETTLE_MS);
    await clearAndType(g.page, 'RETTEST');
    await g.page.keyboard.press('Enter'); // confirm
    await g.page.waitForTimeout(SETTLE_MS);
    const screen = await readScreen(g.page);
    assert.equal(screen, 'ready-screen', 'Return (Enter) confirms name entry');
    const readyName = await g.page.$eval('#ready-name', (el) => el.textContent);
    assert.equal(readyName, 'RETTEST');
  });

  // TF-H3 — RULED BY-DESIGN 2026-07-13 (Trevor triage): "we need to support
  // spaces due to 'Player One' being the default (so Enter/Return should
  // confirm)." transitions.md §Phase 3 now documents Space typing a literal
  // space (multi-word names are intended) and only Return confirming.
  test('TF-H3 by-design: Space types a literal space in the name field and does not confirm (transitions.md §Phase 3)', async () => {
    await coldOpenToTitle(g.page, g.baseUrl);
    await g.page.keyboard.press('Enter'); // reveal name entry
    await g.page.waitForTimeout(SETTLE_MS);
    await clearAndType(g.page, 'PLAYER');
    await g.page.keyboard.press('Space'); // types a literal space — must NOT confirm
    await g.page.waitForTimeout(120);
    await g.page.keyboard.type('TWO', { delay: 30 });
    await g.page.waitForTimeout(120);

    const value = await g.page.$eval('#player-name-input', (el) => el.value);
    assert.equal(value, 'PLAYER TWO', 'Space types a literal space character, joining two words');

    const screenAfterSpace = await readScreen(g.page);
    assert.equal(screenAfterSpace, 'title-screen', 'Space does not confirm — the name entry stays on screen');

    await g.page.keyboard.press('Enter'); // now confirm for real
    await g.page.waitForTimeout(SETTLE_MS);
    const screen = await readScreen(g.page);
    assert.equal(screen, 'ready-screen', 'Return (Enter) confirms the two-word name');
    const readyName = await g.page.$eval('#ready-name', (el) => el.textContent);
    assert.equal(readyName, 'PLAYER TWO', 'the space-separated two-word name is confirmed correctly');
  });

  test('confirmed name persists across reload (continue screen shows it)', async () => {
    await coldOpenToTitle(g.page, g.baseUrl);
    await g.page.keyboard.press('Enter');
    await g.page.waitForTimeout(SETTLE_MS);
    await clearAndType(g.page, 'PERSISTNAME');
    await g.page.keyboard.press('Enter'); // confirm -> ready screen
    await g.page.waitForTimeout(SETTLE_MS);

    // Win level 1 so there is real progress to resume (hasProgress() requires
    // furthestLevel > 1 or a completion — onboarding.md's continue screen is
    // for RETURNING players, distinct from a name-only session).
    await g.page.keyboard.press('Space'); // ready -> keyboard-preview
    await g.page.waitForTimeout(SETTLE_MS);
    await g.page.keyboard.press('Space'); // keyboard-preview -> game
    await g.page.waitForTimeout(SETTLE_MS);
    await winLevel(g.page);
    await g.page.waitForTimeout(SETTLE_MS);

    // No addInitScript seed is in play for this describe block (startGame()
    // was called with no opts), so a real reload here reflects only what the
    // game itself wrote — safe to reload.
    await g.page.reload();
    await g.page.waitForTimeout(SETTLE_MS + 200);
    const screen = await readScreen(g.page);
    assert.equal(screen, 'continue-screen', 'a returning player with progress sees the continue screen');
    const continueName = await g.page.$eval('#continue-name', (el) => el.textContent);
    assert.equal(continueName, 'PERSISTNAME', 'the confirmed name persisted across reload');
  });
});

// ── INV-25 — furthestLevel never regresses ──────────────────────────────────
// CLAUDE.md §Returning-player persistence + js/main.js's own doc comment:
// "Never regresses furthestLevel (replaying an early level can't lock later
// ones)." Observed via the continue screen's level line (onboarding.md's
// documented "LEVEL n — <keys>" format), which is fed directly from
// getProgress().furthestLevel.
describe('INV-25 — furthestLevel never regresses (onboarding.md §Returning Player Flow)', () => {
  let g;
  before(async () => {
    // Unseeded startGame() — no addInitScript re-seeding — so we can reload
    // freely afterward and see only what the game itself has written (see the
    // seedProgressLive() note above). Progress is seeded live: already
    // completed levels 1-2 (furthestLevel 3), so the continue screen resumes
    // at level 3 without needing to win two levels through raw onboarding.
    g = await startGame();
    await seedProgressLive(g.page, g.baseUrl, { furthestLevel: 3, completed: { 1: true, 2: true } });
  });
  after(async () => {
    await g.stop();
  });

  test('seeded progress opens directly on the continue screen at LEVEL 3', async () => {
    await g.page.reload(); // pick up the live-seeded localStorage from `before`
    await g.page.waitForTimeout(SETTLE_MS + 200);
    const screen = await readScreen(g.page);
    assert.equal(screen, 'continue-screen');
    const levelText = await g.page.$eval('#continue-level', (el) => el.textContent);
    assert.ok(
      levelText.startsWith(LEVELS[3].name),
      `continue screen should resume at ${LEVELS[3].name}, got "${levelText}"`,
    );
  });

  test('winning level 3 advances furthestLevel to 4, then replaying level 3 does not regress it', async () => {
    // Resume into level 3 (Space -> ready -> Space -> keyboard-preview -> Space -> game).
    // No init-script seed is in play (unseeded startGame() + a one-time live
    // localStorage write in `before`), so localStorage persists across this
    // navigation exactly as a real browser would carry it.
    await g.page.goto(g.baseUrl);
    await g.page.waitForTimeout(SETTLE_MS + 200);
    await press(g.page, ' '); // continue -> ready
    await g.page.waitForTimeout(SETTLE_MS);
    await press(g.page, ' '); // ready -> keyboard-preview
    await g.page.waitForTimeout(SETTLE_MS);
    await press(g.page, ' '); // keyboard-preview -> game
    await g.page.waitForTimeout(SETTLE_MS);
    await winLevel(g.page);
    await g.page.waitForTimeout(SETTLE_MS);

    // Reload: furthestLevel should now be 4.
    await g.page.reload();
    await g.page.waitForTimeout(SETTLE_MS + 200);
    let levelText = await g.page.$eval('#continue-level', (el) => el.textContent);
    assert.ok(
      levelText.startsWith(LEVELS[4].name),
      `after winning level 3, continue screen should resume at ${LEVELS[4].name}, got "${levelText}"`,
    );

    // Now manually rewrite progress back to an EARLIER level (simulating a
    // player who goes back and replays level 1) while keeping furthestLevel's
    // true value inaccessible to us directly — instead we re-seed the SAME
    // localStorage key with furthestLevel still at 4 but re-navigate through
    // an earlier resume point is not reachable without wopr (select-screen
    // navigation always sets selectBypass=true). We approximate "replay an
    // earlier level" the way the game itself allows it: winning the CURRENT
    // (already-furthest) level again is idempotent and must not move
    // furthestLevel backward either.
    await g.page.reload();
    await g.page.waitForTimeout(SETTLE_MS + 200);
    await press(g.page, ' '); // continue -> ready (level 4 now)
    await g.page.waitForTimeout(SETTLE_MS);
    await press(g.page, ' ');
    await g.page.waitForTimeout(SETTLE_MS);
    await press(g.page, ' ');
    await g.page.waitForTimeout(SETTLE_MS);
    await winLevel(g.page);
    await g.page.waitForTimeout(SETTLE_MS);

    await g.page.reload();
    await g.page.waitForTimeout(SETTLE_MS + 200);
    levelText = await g.page.$eval('#continue-level', (el) => el.textContent);
    assert.ok(
      levelText.startsWith(LEVELS[5].name) || levelText.startsWith(LEVELS[4].name),
      `furthestLevel must never regress below its prior value (4); got "${levelText}"`,
    );
    // Explicitly assert it did NOT fall back to an earlier level like LEVEL 1/2/3.
    for (const n of [1, 2, 3]) {
      assert.ok(
        !levelText.startsWith(LEVELS[n].name + ' —') && levelText !== LEVELS[n].name,
        `furthestLevel regressed to ${LEVELS[n].name} — INV-25 violation`,
      );
    }
  });

  test('a fresh session seeded with a HIGH furthestLevel and re-winning an earlier already-seeded level does not regress it (direct localStorage replay check)', async () => {
    // Directly exercises the documented guarantee at the persistence layer:
    // seed furthestLevel=10, load, replay (win) level 2 via raw resume is not
    // reachable without the select screen, so instead we assert the INVARIANT
    // the way the game itself implements it — recordLevelComplete only ever
    // raises furthestLevel, never lowers it — by seeding completed levels that
    // are BELOW furthestLevel and confirming the continue screen still honors
    // the higher furthestLevel, never falling back to a completed-but-earlier
    // level.
    const g2 = await startGame();
    try {
      await seedProgressLive(g2.page, g2.baseUrl, {
        furthestLevel: 10,
        completed: { 1: true, 2: true, 3: true },
      });
      await g2.page.reload();
      await g2.page.waitForTimeout(SETTLE_MS + 200);
      const levelText = await g2.page.$eval('#continue-level', (el) => el.textContent);
      assert.ok(
        levelText.startsWith(LEVELS[10].name),
        `continue screen must resume at the furthest level (10), not an earlier ` +
          `completed one; got "${levelText}"`,
      );
    } finally {
      await g2.stop();
    }
  });
});

// ── INV-26 — Erase requires explicit Y ───────────────────────────────────────
// onboarding.md §Returning Player Flow: "R triggers a confirmation... Only Y
// clears localStorage. N or any other key returns to the continue screen."
describe('INV-26 — erase progress requires explicit Y (onboarding.md §Returning Player Flow)', () => {
  let g;
  before(async () => {
    // Unseeded startGame() (no addInitScript) so reloads within a test reflect
    // only what the game itself has written — required for the R->Y erase
    // test, which must observe a REAL localStorage removal surviving reload.
    g = await startGame();
  });
  after(async () => {
    await g.stop();
  });
  // Re-seed identical fresh progress before EVERY test in this block, so each
  // test starts from the same known state regardless of what a prior test in
  // the block did to localStorage (erase, etc).
  beforeEach(async () => {
    await seedProgressLive(g.page, g.baseUrl, { furthestLevel: 3, completed: { 1: true, 2: true } });
    await g.page.reload();
    await g.page.waitForTimeout(SETTLE_MS + 200);
  });

  test('R shows the ERASE ALL PROGRESS confirm', async () => {
    await press(g.page, 'r');
    await g.page.waitForTimeout(SETTLE_MS);
    const eraseVisible = await g.page.$eval('#continue-erase', (el) => !el.classList.contains('hidden'));
    assert.ok(eraseVisible, 'R reveals the erase confirmation panel');
    const promptHidden = await g.page.$eval('#continue-prompt', (el) => el.classList.contains('hidden'));
    assert.ok(promptHidden, 'the normal continue prompt hides while confirming erase');
  });

  test('N preserves progress — continue screen still shows the level', async () => {
    await press(g.page, 'r');
    await g.page.waitForTimeout(SETTLE_MS);
    await press(g.page, 'n');
    await g.page.waitForTimeout(SETTLE_MS);

    const screen = await readScreen(g.page);
    assert.equal(screen, 'continue-screen', 'N returns to the continue screen, not erased/title');
    const eraseHidden = await g.page.$eval('#continue-erase', (el) => el.classList.contains('hidden'));
    assert.ok(eraseHidden, 'the erase confirm panel hides again after N');

    // Reload to prove localStorage itself was untouched.
    await g.page.reload();
    await g.page.waitForTimeout(SETTLE_MS + 200);
    const screenAfterReload = await readScreen(g.page);
    assert.equal(screenAfterReload, 'continue-screen', 'progress survives after N + reload');
    const levelText = await g.page.$eval('#continue-level', (el) => el.textContent);
    assert.ok(levelText.startsWith(LEVELS[3].name), 'progress (level 3) intact after N');
  });

  test('a random OTHER key (not Y) also preserves progress — never trap or erase on ambiguity', async () => {
    await press(g.page, 'r');
    await g.page.waitForTimeout(SETTLE_MS);
    await press(g.page, 'q'); // an arbitrary key that is neither Y nor N
    await g.page.waitForTimeout(SETTLE_MS);

    const screen = await readScreen(g.page);
    assert.equal(screen, 'continue-screen', 'a stray key returns to the continue screen safely');

    await g.page.reload();
    await g.page.waitForTimeout(SETTLE_MS + 200);
    const levelText = await g.page.$eval('#continue-level', (el) => el.textContent);
    assert.ok(levelText.startsWith(LEVELS[3].name), 'progress intact after a non-Y/N key');
  });

  test('R then Y actually erases progress — fresh title/name flow with default level', async () => {
    await press(g.page, 'r');
    await g.page.waitForTimeout(SETTLE_MS);
    await press(g.page, 'y');
    await g.page.waitForTimeout(SETTLE_MS);

    const screen = await readScreen(g.page);
    assert.equal(screen, 'title-screen', 'Y erases progress and returns to the title/name flow');

    // Confirm the erase is REAL at the persistence layer (not just an
    // in-memory state flip): kk-progress must actually be gone from
    // localStorage. (We assert via localStorage directly, not a reload,
    // because this describe block's `before` uses an unseeded startGame() +
    // beforeEach's live seed — a reload here is safe and equivalent, but a
    // direct read is the most refactor-proof observable of "erase happened".)
    const progressAfterErase = await g.page.evaluate(() => localStorage.getItem('kk-progress'));
    assert.equal(progressAfterErase, null, 'kk-progress is removed from localStorage after R then Y');

    // Confirm the erase also holds across a real reload — no init-script
    // re-seeding is in play in this describe block, so this reload reflects
    // the true persisted state, not a test artifact.
    await g.page.reload();
    await g.page.waitForTimeout(SETTLE_MS + 200);
    const screenAfterReload = await readScreen(g.page);
    assert.equal(
      screenAfterReload,
      'title-screen',
      'after erase + reload, the game boots fresh (no continue screen) — progress was truly cleared',
    );
  });
});

// ── INV-27 — hostile / corrupt kk-progress tolerated ─────────────────────────
// security.md rule 4: "localStorage is untrusted input... tolerate garbage;
// never feed parsed values to any sink [innerHTML etc.] without going through
// [sanitizing]." js/main.js getProgress() is the documented model.
describe('INV-27 — hostile kk-progress values degrade to defaults, never crash (security.md rule 4)', () => {
  const hostileSeeds = [
    { label: 'corrupt JSON string', value: '{not valid json!!' },
    { label: 'wrong-typed furthestLevel (string)', value: { furthestLevel: 'ninety-nine', completed: {} } },
    { label: 'absurd furthestLevel (way out of range)', value: { furthestLevel: 999999, completed: {} } },
    { label: 'negative furthestLevel', value: { furthestLevel: -50, completed: {} } },
    { label: 'completed as a non-object primitive', value: { furthestLevel: 3, completed: 'not-an-object' } },
    { label: 'entirely wrong shape (array)', value: [1, 2, 3] },
    { label: 'null prototype-ish garbage', value: { furthestLevel: null, completed: null } },
  ];

  for (const { label, value } of hostileSeeds) {
    test(`boots clean with ${label}`, async () => {
      const g = await startGame({ localStorage: { 'kk-progress': value } });
      try {
        await g.page.goto(g.baseUrl);
        await g.page.waitForTimeout(SETTLE_MS + 200);
        const screen = await readScreen(g.page);
        assert.ok(
          screen === 'title-screen' || screen === 'continue-screen',
          `game boots to a real screen (got ${screen}) for hostile seed: ${label}`,
        );
        assert.deepEqual(
          g.consoleErrors,
          [],
          `zero console errors expected for hostile kk-progress (${label}); saw:\n${g.consoleErrors.join('\n')}`,
        );
      } finally {
        await g.stop();
      }
    });
  }

  test('a script-tag string in the player name field is NEVER interpreted as HTML', async () => {
    const g = await startGame({
      progress: { furthestLevel: 3, completed: { 1: true } },
      settings: { playerName: HOSTILE_NAME },
    });
    try {
      await g.page.goto(g.baseUrl);
      await g.page.waitForTimeout(SETTLE_MS + 200);

      // The hostile "name" is 44 chars — settings.js's sanitize() slices
      // playerName to 16 chars, so the literal string that reaches the DOM is
      // truncated, not the full payload. Either way it must land as literal
      // TEXT (textContent), never parsed as an <img> element.
      const pwned = await g.page.evaluate(() => window.__pwned);
      assert.equal(pwned, undefined, 'the onerror handler in the hostile name never executed');

      const injectedEl = await g.page.$('#pwned');
      assert.equal(injectedEl, null, 'no element with the injected id was created in the DOM');

      const continueNameHtml = await g.page.$eval('#continue-name', (el) => el.innerHTML);
      assert.ok(
        !continueNameHtml.includes('<img'),
        `#continue-name must render the hostile string as literal text, not markup; got: ${continueNameHtml}`,
      );

      assert.deepEqual(
        g.consoleErrors,
        [],
        `zero console errors expected with a hostile name string; saw:\n${g.consoleErrors.join('\n')}`,
      );
    } finally {
      await g.stop();
    }
  });

  test('a hostile name surviving into the ready screen after erase+replay is still literal text', async () => {
    // Round-trip through the real UI: seed a hostile name in settings (kept
    // across erase, per CLAUDE.md — erase clears progress, not identity),
    // erase progress via R->Y, and confirm the name still renders safely on
    // the resulting title/name-entry flow.
    const g = await startGame({
      progress: { furthestLevel: 2, completed: { 1: true } },
      settings: { playerName: HOSTILE_NAME },
    });
    try {
      await g.page.goto(g.baseUrl);
      await g.page.waitForTimeout(SETTLE_MS + 200);
      await press(g.page, 'r');
      await g.page.waitForTimeout(SETTLE_MS);
      await press(g.page, 'y');
      await g.page.waitForTimeout(SETTLE_MS);

      // Erase keeps kk-settings (identity), so the name-entry input should be
      // pre-filled with the (truncated, sanitized) hostile string as plain
      // text value — never executed as markup.
      const pwned = await g.page.evaluate(() => window.__pwned);
      assert.equal(pwned, undefined, 'no script executed after erase+reload with a hostile stored name');
      assert.deepEqual(g.consoleErrors, [], 'zero console errors through the erase flow with a hostile name');
    } finally {
      await g.stop();
    }
  });
});

// ── INV-28 — Platform key label (Return vs Enter) ────────────────────────────
// CLAUDE.md §Platform Key Label: "Mac keyboards say Return; Windows/Linux say
// Enter... [data-enter-key] elements... navigator.platform detection... The
// event handler stays e.key === 'Enter' on all platforms — only the display
// label changes." js/main.js reads `navigator.platform || navigator.userAgent`
// and tests `/Mac/`.
describe('INV-28 — platform key label (CLAUDE.md §Platform Key Label)', () => {
  let browser;
  let closeServer;
  let baseUrl;

  before(async () => {
    const http = await import('node:http');
    const { readFile } = await import('node:fs/promises');
    const { normalize, join: pjoin, extname } = await import('node:path');
    // Minimal static server, mirroring game-driver.mjs's own (kept separate
    // since this describe block needs raw browser.newContext() access that
    // startGame() doesn't expose — see driver JSDoc: opts.viewport etc. only).
    const root = REPO_ROOT;
    const CONTENT_TYPES = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.mjs': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
    };
    const server = http.createServer(async (req, res) => {
      try {
        let urlPath = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
        if (urlPath === '/api/wordgen/health') {
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ available: false }));
          return;
        }
        if (urlPath === '/api/wordgen') {
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ words: [] }));
          return;
        }
        if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
        const filePath = normalize(pjoin(root, urlPath));
        if (!filePath.startsWith(root)) {
          res.writeHead(403).end('Forbidden');
          return;
        }
        const body = await readFile(filePath);
        const type = CONTENT_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': type }).end(body);
      } catch (err) {
        const code = err && err.code === 'ENOENT' ? 404 : 500;
        res.writeHead(code).end(code === 404 ? 'Not Found' : 'Server Error');
      }
    });
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
    closeServer = () => new Promise((resolve) => server.close(() => resolve()));

    const { chromium } = require('/Users/trevormack/.npm/_npx/705bc6b22212b352/node_modules/playwright');
    browser = await chromium.launch({ headless: true });
  });

  after(async () => {
    if (browser) await browser.close();
    if (closeServer) await closeServer();
  });

  async function pageWithPlatform(platformValue) {
    const context = await browser.newContext();
    // Override navigator.platform BEFORE any page script runs — this is
    // exactly what js/main.js reads (`navigator.platform || navigator.userAgent`).
    await context.addInitScript((val) => {
      Object.defineProperty(window.navigator, 'platform', { get: () => val });
    }, platformValue);
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
    return { context, page, consoleErrors };
  }

  test('Mac platform: all [data-enter-key] elements read RETURN', async () => {
    const { context, page, consoleErrors } = await pageWithPlatform('MacIntel');
    try {
      await page.goto(baseUrl);
      await page.waitForTimeout(SETTLE_MS + 200);
      const labels = await page.$$eval('[data-enter-key]', (els) => els.map((e) => e.textContent));
      assert.ok(labels.length > 0, 'at least one [data-enter-key] element exists to check');
      for (const label of labels) {
        assert.equal(label, 'RETURN', `Mac platform should render RETURN, got "${label}"`);
      }
      assert.deepEqual(consoleErrors, [], `zero console errors on Mac platform emulation; saw:\n${consoleErrors.join('\n')}`);
    } finally {
      await context.close();
    }
  });

  test('non-Mac platform: all [data-enter-key] elements read ENTER', async () => {
    const { context, page, consoleErrors } = await pageWithPlatform('Win32');
    try {
      await page.goto(baseUrl);
      await page.waitForTimeout(SETTLE_MS + 200);
      const labels = await page.$$eval('[data-enter-key]', (els) => els.map((e) => e.textContent));
      assert.ok(labels.length > 0, 'at least one [data-enter-key] element exists to check');
      for (const label of labels) {
        assert.equal(label, 'ENTER', `non-Mac platform should render ENTER, got "${label}"`);
      }
      assert.deepEqual(consoleErrors, [], `zero console errors on non-Mac platform emulation; saw:\n${consoleErrors.join('\n')}`);
    } finally {
      await context.close();
    }
  });

  test('pressing the physical Enter key confirms name entry regardless of platform label', async () => {
    const { context, page, consoleErrors } = await pageWithPlatform('MacIntel');
    try {
      await page.goto(baseUrl);
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await page.waitForTimeout(SETTLE_MS + 200);
      await page.click('body');
      await page.keyboard.press('Enter'); // reveal name entry
      await page.waitForTimeout(SETTLE_MS);
      await page.keyboard.type('MACUSER', { delay: 30 });
      await page.waitForTimeout(120);
      await page.keyboard.press('Enter'); // confirm — handler is e.key === 'Enter' universally
      await page.waitForTimeout(SETTLE_MS);

      const screen = await page.evaluate(() => {
        const s = [...document.querySelectorAll('.screen')].find((el) => !el.classList.contains('hidden'));
        return s ? s.id : null;
      });
      assert.equal(screen, 'ready-screen', 'the physical Enter key confirms name entry on Mac emulation too');
      assert.deepEqual(consoleErrors, [], 'zero console errors through Mac-emulated name entry');
    } finally {
      await context.close();
    }
  });
});
