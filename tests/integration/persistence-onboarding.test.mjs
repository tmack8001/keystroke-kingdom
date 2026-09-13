// Enforces: INV-24, INV-25, INV-26, INV-27, INV-28
// Sources: .claude/rules/levels/onboarding.md (§Name Entry, §Returning Player Flow,
// §The Arcade at Level 1, §Design Rules for the Opening) — the ground truth for
// entry flows; CLAUDE.md §Player Name, §Platform Key Label (Return vs Enter),
// §Returning-player persistence; .claude/rules/transitions.md §Phase 3 (name entry
// detail: 16-char cap, Backspace, Space types a space / only Return confirms,
// no validation — revised 2026-07-13, Trevor triage of TF-H2/TF-H3);
// security.md rule 4 ("localStorage is untrusted input... tolerate garbage");
// js/slots.js's own header comment (the 2026-07-19 save-system rebuild).
//
// Persistence & onboarding flows, driven through the real browser via the shared
// driver (tests/helpers/game-driver.mjs). Raw (non-wopr) flows are used wherever
// the onboarding UX itself is under test; the wopr bypass is reserved for reaching
// a level fast in wave-1/other lanes, and is deliberately NOT used here — the wopr
// bypass sets state.selectBypass = true, which unlocks every cabinet and would
// mask exactly the gating behavior these tests exist to verify.
//
// REVISED 2026-07-19 for the history-card + save-system rebuild: the single
// "continue screen" ('continue-screen', `#continue-name`/`#continue-level`/
// `#continue-erase`) is RETIRED. The returning-player front door is now the slot
// picker ("CHOOSE YOUR GAME", screen id 'slots', `#slots-list` rows read via the
// driver's `readSlotsList()`) — ANY saved game (one or many) sends a returning
// player there, never straight back into gameplay; resuming is always an explicit
// choice. Progress/cards persist in `kk-slots` (js/slots.js), scoped to whichever
// game is ACTIVE; `kk-progress` is now read ONLY once, during one-time legacy
// migration (`Slots.ensureMigrated`) — it is no longer the game's live persistence
// key, so seeding it only matters for migration-boundary tests (INV-27's hostile
// seeds below exploit exactly that boundary). Erase moves from continue-screen's
// R→Y/N to the slot picker's X→Y/N ("ERASE THIS GAME?").
//
// Expected level text is derived from the game's own rendered format ('LV n', from
// js/ui/screens.js renderSlotsScreen) or js/levels.js's LEVELS data, never
// hardcoded, per STRATEGY.md §2.

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
  slotsSeed,
  readSlotsList,
} from '../helpers/game-driver.mjs';

const require = createRequire(import.meta.url);
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const SETTLE_MS = 400;

// A hostile string that must NEVER be interpreted as HTML if it reaches a DOM
// sink. If any sink used innerHTML instead of textContent, this would inject an
// element with id="pwned" we can detect.
const HOSTILE_NAME = '<img src=x onerror="window.__pwned=1" id="pwned">';

// startGame({ localStorage }) seeds localStorage via page.addInitScript, which
// (by design, per game-driver.mjs's own JSDoc) re-runs BEFORE EVERY
// navigation — including a page.reload() the test itself triggers later. That
// makes it the wrong tool for any scenario that needs to reload AFTER the
// game has written new localStorage state (winning a level, erasing progress)
// within the same test: the init script would silently stomp the game's own
// write back to the original seed on the next reload, which would look like
// (but is not) a persistence bug. For those scenarios we seed `kk-slots` via a
// one-time in-page localStorage.setItem AFTER the first real navigation
// instead — a plain write no future reload re-applies — using an UNSEEDED
// startGame(). (Renamed from the old kk-progress-era seedProgressLive; the
// persisted key itself moved to kk-slots, see the file header above.)
async function seedSlotsLive(page, baseUrl, slotsValue) {
  await page.goto(baseUrl);
  await page.evaluate((json) => localStorage.setItem('kk-slots', json), JSON.stringify(slotsValue));
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

  test('confirmed name persists across reload (the slot picker shows it)', async () => {
    await coldOpenToTitle(g.page, g.baseUrl);
    await g.page.keyboard.press('Enter');
    await g.page.waitForTimeout(SETTLE_MS);
    await clearAndType(g.page, 'PERSISTNAME');
    await g.page.keyboard.press('Enter'); // confirm -> ready screen (also creates + activates the first saved game)
    await g.page.waitForTimeout(SETTLE_MS);

    // Win level 1 so there is real progress to resume with.
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
    assert.equal(screen, 'slots-screen', 'a returning player with ANY saved game sees the "CHOOSE YOUR GAME" picker, never straight back into play');
    const rows = await readSlotsList(g.page);
    assert.equal(rows.length, 1, 'exactly the one game created during name entry is listed');
    assert.equal(rows[0].name, 'PERSISTNAME', 'the confirmed name persisted across reload');
  });
});

// ── INV-25 — furthestLevel never regresses ──────────────────────────────────
// CLAUDE.md §Returning-player persistence + js/main.js's own doc comment:
// "Never regresses furthestLevel (replaying an early level can't lock later
// ones)." Observed via the slot picker's own rendered "LV n" line (js/ui/
// screens.js renderSlotsScreen, `slot-level`), fed directly from
// getProgress().furthestLevel.
describe('INV-25 — furthestLevel never regresses (onboarding.md §Returning Player Flow)', () => {
  let g;
  before(async () => {
    // Unseeded startGame() — no addInitScript re-seeding — so we can reload
    // freely afterward and see only what the game itself has written (see the
    // seedSlotsLive() note above). A game is seeded live directly into
    // kk-slots, active, with levels 1-2 already completed (furthestLevel 3),
    // so the picker resumes at level 3 without needing to win two levels
    // through raw onboarding first.
    g = await startGame();
    await seedSlotsLive(g.page, g.baseUrl, slotsSeed({ furthestLevel: 3, completed: { 1: true, 2: true } }));
  });
  after(async () => {
    await g.stop();
  });

  test('seeded progress opens directly on the slot picker showing LV 3', async () => {
    await g.page.reload(); // pick up the live-seeded localStorage from `before`
    await g.page.waitForTimeout(SETTLE_MS + 200);
    const screen = await readScreen(g.page);
    assert.equal(screen, 'slots-screen');
    const rows = await readSlotsList(g.page);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].level, 'LV 3', `the picker should show LV 3, got "${rows[0].level}"`);
  });

  test('winning level 3 advances furthestLevel to 4, then replaying (re-winning) it does not regress it', async () => {
    // Resume into level 3 (Space -> ready -> Space -> keyboard-preview -> Space -> game).
    // No init-script seed is in play (unseeded startGame() + a one-time live
    // localStorage write in `before`), so localStorage persists across this
    // navigation exactly as a real browser would carry it.
    await g.page.goto(g.baseUrl);
    await g.page.waitForTimeout(SETTLE_MS + 200);
    await press(g.page, ' '); // slots -> resume the (only, already-selected) game -> ready
    await g.page.waitForTimeout(SETTLE_MS);
    await press(g.page, ' '); // ready -> keyboard-preview
    await g.page.waitForTimeout(SETTLE_MS);
    await press(g.page, ' '); // keyboard-preview -> game
    await g.page.waitForTimeout(SETTLE_MS);
    await winLevel(g.page);
    await g.page.waitForTimeout(SETTLE_MS);

    // Reload: furthestLevel should now be 4. A reload always returns to the
    // picker (the front door), never straight back into gameplay.
    await g.page.reload();
    await g.page.waitForTimeout(SETTLE_MS + 200);
    let rows = await readSlotsList(g.page);
    assert.equal(rows[0].level, 'LV 4', `after winning level 3, the picker should show LV 4, got "${rows[0].level}"`);

    // There is no documented UI path for a returning (non-WOPR) player to jump
    // back to an EARLIER level than furthestLevel — the picker always resumes
    // at furthestLevel. We approximate "replay an earlier level" the way the
    // game itself allows it: winning the CURRENT (already-furthest) level
    // again is idempotent and must not move furthestLevel backward either.
    await g.page.goto(g.baseUrl);
    await g.page.waitForTimeout(SETTLE_MS + 200);
    await press(g.page, ' '); // slots -> resume (level 4 now)
    await g.page.waitForTimeout(SETTLE_MS);
    await press(g.page, ' ');
    await g.page.waitForTimeout(SETTLE_MS);
    await press(g.page, ' ');
    await g.page.waitForTimeout(SETTLE_MS);
    await winLevel(g.page);
    await g.page.waitForTimeout(SETTLE_MS);

    await g.page.reload();
    await g.page.waitForTimeout(SETTLE_MS + 200);
    rows = await readSlotsList(g.page);
    assert.ok(
      rows[0].level === 'LV 5' || rows[0].level === 'LV 4',
      `furthestLevel must never regress below its prior value (4); got "${rows[0].level}"`,
    );
    // Explicitly assert it did NOT fall back to an earlier level like LEVEL 1/2/3.
    for (const n of [1, 2, 3]) {
      assert.notEqual(rows[0].level, 'LV ' + n, `furthestLevel regressed to LEVEL ${n} — INV-25 violation`);
    }
  });

  test('a fresh session seeded with a HIGH furthestLevel and lower completed levels still resumes at the HIGH level (direct persistence-layer check)', async () => {
    // Directly exercises the documented guarantee at the persistence layer:
    // recordLevelComplete only ever raises furthestLevel, never lowers it — by
    // seeding completed levels that are BELOW furthestLevel and confirming the
    // picker still honors the higher furthestLevel, never falling back to a
    // completed-but-earlier level.
    const g2 = await startGame();
    try {
      await seedSlotsLive(g2.page, g2.baseUrl, slotsSeed({
        furthestLevel: 10,
        completed: { 1: true, 2: true, 3: true },
      }));
      await g2.page.reload();
      await g2.page.waitForTimeout(SETTLE_MS + 200);
      const rows = await readSlotsList(g2.page);
      assert.equal(rows.length, 1);
      assert.equal(
        rows[0].level, 'LV 10',
        `the picker must show the furthest level (10), not an earlier completed one; got "${rows[0].level}"`,
      );
    } finally {
      await g2.stop();
    }
  });
});

// ── INV-26 — Erase requires explicit Y ───────────────────────────────────────
// onboarding.md §Returning Player Flow: "R triggers a confirmation... Only Y
// clears localStorage. N or any other key returns to the continue screen."
describe('INV-26 — erase progress requires explicit Y (onboarding.md §Returning Player Flow, adapted to the slot picker\'s X→Y/N "ERASE THIS GAME?" confirm)', () => {
  let g;
  before(async () => {
    // Unseeded startGame() (no addInitScript) so reloads within a test reflect
    // only what the game itself has written — required for the X->Y erase
    // test, which must observe a REAL localStorage removal surviving reload.
    g = await startGame();
  });
  after(async () => {
    await g.stop();
  });
  // Re-seed an identical fresh game before EVERY test in this block, so each
  // test starts from the same known state regardless of what a prior test in
  // the block did to localStorage (erase, etc).
  beforeEach(async () => {
    await seedSlotsLive(g.page, g.baseUrl, slotsSeed({ furthestLevel: 3, completed: { 1: true, 2: true } }));
    await g.page.reload();
    await g.page.waitForTimeout(SETTLE_MS + 200);
  });

  test('X shows the ERASE THIS GAME confirm', async () => {
    await press(g.page, 'x');
    await g.page.waitForTimeout(SETTLE_MS);
    const eraseVisible = await g.page.$eval('#slots-erase', (el) => !el.classList.contains('hidden'));
    assert.ok(eraseVisible, 'X reveals the erase confirmation panel');
    const hintHidden = await g.page.$eval('#slots-hint', (el) => el.classList.contains('hidden'));
    assert.ok(hintHidden, 'the normal action hint hides while confirming erase');
  });

  test('N preserves the game — the picker still lists it', async () => {
    await press(g.page, 'x');
    await g.page.waitForTimeout(SETTLE_MS);
    await press(g.page, 'n');
    await g.page.waitForTimeout(SETTLE_MS);

    const screen = await readScreen(g.page);
    assert.equal(screen, 'slots-screen', 'N returns to the picker, not erased/title');
    const eraseHidden = await g.page.$eval('#slots-erase', (el) => el.classList.contains('hidden'));
    assert.ok(eraseHidden, 'the erase confirm panel hides again after N');
    let rows = await readSlotsList(g.page);
    assert.equal(rows.length, 1, 'the game is still listed after N');

    // Reload to prove localStorage itself was untouched.
    await g.page.reload();
    await g.page.waitForTimeout(SETTLE_MS + 200);
    const screenAfterReload = await readScreen(g.page);
    assert.equal(screenAfterReload, 'slots-screen', 'progress survives after N + reload');
    rows = await readSlotsList(g.page);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].level, 'LV 3', 'progress (level 3) intact after N');
  });

  test('a random OTHER key (not Y) also preserves progress — never trap or erase on ambiguity', async () => {
    await press(g.page, 'x');
    await g.page.waitForTimeout(SETTLE_MS);
    await press(g.page, 'q'); // an arbitrary key that is neither Y nor N
    await g.page.waitForTimeout(SETTLE_MS);

    const screen = await readScreen(g.page);
    assert.equal(screen, 'slots-screen', 'a stray key returns to the picker safely');
    let rows = await readSlotsList(g.page);
    assert.equal(rows.length, 1, 'a stray key does not erase the game');

    await g.page.reload();
    await g.page.waitForTimeout(SETTLE_MS + 200);
    rows = await readSlotsList(g.page);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].level, 'LV 3', 'progress intact after a non-Y/N key');
  });

  test('X then Y actually erases the game — fresh title/name flow once no saved games remain', async () => {
    await press(g.page, 'x');
    await g.page.waitForTimeout(SETTLE_MS);
    await press(g.page, 'y');
    await g.page.waitForTimeout(SETTLE_MS);

    // The picker re-renders in place immediately after an erase (it does not
    // itself navigate away) — the erased game is simply gone from the list.
    const rowsRightAfter = await readSlotsList(g.page);
    assert.equal(rowsRightAfter.length, 0, 'the erased game is gone from the list right away');

    // Confirm the erase is REAL at the persistence layer (not just an
    // in-memory state flip): the raw kk-slots value has an empty slots array.
    const raw = await g.page.evaluate(() => localStorage.getItem('kk-slots'));
    const parsed = JSON.parse(raw);
    assert.deepEqual(parsed.slots, [], 'kk-slots.slots is empty after X then Y erases the only game');

    // With no saved games left, a reload boots the untouched cold-open title
    // flow (anySlotExists() is false), never the picker.
    await g.page.reload();
    await g.page.waitForTimeout(SETTLE_MS + 200);
    const screenAfterReload = await readScreen(g.page);
    assert.equal(
      screenAfterReload,
      'title-screen',
      'after erasing the only saved game + reload, the game boots fresh (no picker) — progress was truly cleared',
    );
  });
});

// ── INV-27 — hostile / corrupt kk-progress tolerated ─────────────────────────
// security.md rule 4: "localStorage is untrusted input... tolerate garbage;
// never feed parsed values to any sink [innerHTML etc.] without going through
// [sanitizing]." js/slots.js's `ensureMigrated`/`normalizeSlot` are now the
// documented model (kk-progress itself is read only once, at the legacy-
// migration boundary — see the file header note above); some of these hostile
// values are "real enough" progress to trigger a migration into a new saved
// game (landing on the slot picker), others are not (landing on the untouched
// title screen) — both are legitimate, crash-free outcomes, so the assertion
// below accepts either real screen rather than asserting which.
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
          screen === 'title-screen' || screen === 'slots-screen',
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
    // furthestLevel: 3 is "real enough" legacy progress to trigger migration
    // into a new saved game named from the hostile settings.playerName — so
    // this boots straight to the slot picker, exercising the SAME sink
    // (js/ui/screens.js renderSlotsScreen's `slot-name` span) a real returning
    // player's name always renders through.
    const g = await startGame({
      progress: { furthestLevel: 3, completed: { 1: true } },
      settings: { playerName: HOSTILE_NAME },
    });
    try {
      await g.page.goto(g.baseUrl);
      await g.page.waitForTimeout(SETTLE_MS + 200);

      // The hostile "name" is 44 chars — slots.js's normalizeSlot slices
      // names to 16 chars, so the literal string that reaches the DOM is
      // truncated, not the full payload. Either way it must land as literal
      // TEXT (textContent), never parsed as an <img> element.
      const pwned = await g.page.evaluate(() => window.__pwned);
      assert.equal(pwned, undefined, 'the onerror handler in the hostile name never executed');

      const injectedEl = await g.page.$('#pwned');
      assert.equal(injectedEl, null, 'no element with the injected id was created in the DOM');

      assert.equal(await readScreen(g.page), 'slots-screen', 'fixture sanity: the hostile-but-real progress migrated into a listed game');
      const slotsListHtml = await g.page.$eval('#slots-list', (el) => el.innerHTML);
      assert.ok(
        !slotsListHtml.includes('<img'),
        `#slots-list must render the hostile string as literal text, not markup; got: ${slotsListHtml}`,
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

  test('a hostile name surviving erase+a fresh name entry is still literal text', async () => {
    // Round-trip through the real UI: seed a hostile name in settings (kept
    // across erase, per CLAUDE.md — erase clears progress, not identity),
    // erase the migrated game via X->Y, and confirm the name still renders
    // safely once we're back on the resulting title/name-entry flow.
    const g = await startGame({
      progress: { furthestLevel: 2, completed: { 1: true } },
      settings: { playerName: HOSTILE_NAME },
    });
    try {
      await g.page.goto(g.baseUrl);
      await g.page.waitForTimeout(SETTLE_MS + 200);
      assert.equal(await readScreen(g.page), 'slots-screen', 'fixture sanity: the hostile-but-real progress migrated into a listed game');
      await press(g.page, 'x');
      await g.page.waitForTimeout(SETTLE_MS);
      await press(g.page, 'y');
      await g.page.waitForTimeout(SETTLE_MS);

      const pwned = await g.page.evaluate(() => window.__pwned);
      assert.equal(pwned, undefined, 'no script executed erasing a game with a hostile stored name');
      assert.deepEqual(g.consoleErrors, [], 'zero console errors through the erase flow with a hostile name');

      // With no saved games left, a reload boots the cold-open title/name
      // flow, whose name field is pre-filled from kk-settings (identity
      // survives an erase) — still just a literal <input> VALUE, never markup.
      await g.page.reload();
      await g.page.waitForTimeout(SETTLE_MS + 200);
      assert.equal(await readScreen(g.page), 'title-screen');
      await g.page.keyboard.press('Enter'); // reveal name entry
      await g.page.waitForTimeout(SETTLE_MS);
      // #player-name-input is a real <input>; its `.value` is always plain text
      // by construction (an attribute/property value, never parsed as markup)
      // regardless of content — the meaningful assertion is that nothing
      // executed and the field is genuinely pre-filled from the surviving
      // (truncated) hostile settings name, not that the substring is absent.
      const inputValue = await g.page.$eval('#player-name-input', (el) => el.value);
      assert.ok(inputValue.length > 0, 'the name field is pre-filled from kk-settings after the erase');
      const pwnedAfter = await g.page.evaluate(() => window.__pwned);
      assert.equal(pwnedAfter, undefined, 'no script executed on the fresh name-entry screen either');
      assert.deepEqual(g.consoleErrors, [], 'zero console errors through the full erase + fresh name-entry flow');
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

    // Resolve Playwright through the shared helper, never a hard-coded path: this line
    // used to pin an npx cache dir whose bundled browser revision was no longer installed,
    // which cancelled this whole suite at launch() with an error naming a path, not a cause.
    const { chromium } = require('../../scripts/kk-playwright').playwright;
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
