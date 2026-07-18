// Enforces: INV-48, INV-49, INV-50, INV-51, INV-52 — STRATEGY.md §5 "Act 6 — Text
// Worlds: the IM-friend (world 5 of 5)"; docs/handoffs/im-friend-build.md §3/§6;
// product.md §Core Principles (the One Rule — "Reinforce, Don't Punish"); .claude/
// rules/security.md rules 3, 4, 6-8 + the 2026-07-14 PII-floor exception; module
// header comments in js/textworld/imfriend.js, js/textworld/personas.js, js/chat.js.
//
// Sibling to tests/integration/textworld.test.mjs (INV-42..47) — same driver, same
// conventions (real browser, real key events, observable state only), covering the
// 5th Text World the earlier file predates. Self-contained: every test owns its own
// `startGame()`/`stop()` (mirrors that file's INV-44 persistence tests) so per-test
// `/api/chat` network stubs (Playwright `page.route`) and localStorage seeds never
// leak between tests.
//
// WHY INTEGRATION, NOT UNIT (STRATEGY.md §3's "Why the engine is tested at L2"
// rationale): imfriend.js's `start()` requires a real `#invaders-canvas` + 2D
// context + `requestAnimationFrame` + `window.AudioContext` the instant it runs —
// there is no seam a stubs.mjs stub can cover — and it is driven through the REAL
// router (main.js's `case 'textworld'`) via the hub coordinator, never a game
// internal.
//
// WHY THE OBSERVABLES ARE PERSISTED STATE, NOT CANVAS TEXT: the chat log, the
// make-a-friend fields, and the picker are rendered ONLY via canvas fillText —
// STRATEGY.md §2 prohibits canvas pixel/geometry assertions. The legitimate
// player-observable surfaces here are (a) which `.screen` is visible (readScreen()
// — null while the wing owns the canvas), (b) the persisted `kk-friends` transcript
// (the friend's actual MEMORY — the promise im-friend-build.md §3 describes), and
// (c) the persisted `kk-progress.textWorlds.imfriend` completion record (INV-44's
// mechanism, generalized here). All three are the ACTUAL promises the game keeps to
// a returning player — not implementation internals — so a pure refactor of
// imfriend.js's rendering or internal state shape leaves these tests green.
//
// DETERMINISM: `/api/chat` is stubbed per-test via Playwright's page-level network
// interception (`page.route`) — never a live Ollama. This is standard network-layer
// test infrastructure (not a game-code change): the page still calls its own real
// `fetch()`; only the response is substituted. Three canned shapes are used,
// matching the two documented failure classes in im-friend-build.md §3 plus the
// success path: `stubChatSuccess` (200, a real reply — the "online" path),
// `stubChatEmptyReply` (200, `{reply:''}` — the server's own documented "model-
// unavailable" signal, chat.js: "the server answers model failure with 200
// {reply:""}, never a 500"), and `stubChatUnreachable` (an aborted request — a
// genuine transport failure). The unreachable stub deliberately triggers Chromium's
// own "Failed to load resource: net::ERR_FAILED" resource-load log for our own
// self-inflicted abort (verified empirically: a plain 404 or an aborted fetch both
// log this line even though the page's own JS never calls console.error) — filtered
// via `withoutExpectedChatAbortNoise` exactly as kk-playwright.js's own
// `isExpectedWordgenProbe404` filters its analogous expected-404 noise; every OTHER
// assertion in this file requires zero (unfiltered) console errors.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { startGame, toTextWorldDoor, readScreen, typeSequence } from '../helpers/game-driver.mjs';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Pure data/logic imports — no DOM, no canvas, no network (personas.js's own header:
// "so it is safe to import anywhere and easy to unit test") — used to DERIVE
// expectations rather than hand-copy them (STRATEGY.md §2).
const {
  CURATED,
  MAKE_STEPS,
  TEMPERAMENT_CHOICES,
  validateName,
  validateLoves,
} = await import(join(REPO_ROOT, 'js', 'textworld', 'personas.js'));

const PIXEL = CURATED.find((c) => c.id === 'pixel');
const SPROUT = CURATED.find((c) => c.id === 'sprout');
assert.ok(PIXEL && SPROUT, 'fixture sanity: personas.js still ships both curated friends (PIXEL, SPROUT)');

const T = 90_000;

// ─── Fixture sanity ──────────────────────────────────────────────────────────

describe('IM-friend fixture sanity (guards every other test against silent drift)', () => {
  test('hub.js WORLDS lists the imfriend as its 5th entry (id ImFriend.id)', async () => {
    const hubSrc = await (await import('node:fs/promises')).readFile(
      join(REPO_ROOT, 'js', 'textworld', 'hub.js'), 'utf8',
    );
    // Every world's id is a `<Module>.id` reference (single source of truth — no
    // literal to drift from), so we scrape the reference TEXT and guard the full
    // ordered list. This fails loudly if a world is added, removed, or reordered.
    const ids = [...hubSrc.matchAll(/id:\s*(?:'([^']+)'|(\w+\.id))/g)].map((m) => m[1] || m[2]);
    assert.deepEqual(
      ids,
      ['GreenDragon.id', 'GlimmerDeep.id', 'Whisperwood.id', 'Maker.id', 'ImFriend.id'],
      'hub.js world set/order changed — update this fixture and HUB_IMFRIEND_INDEX below to match',
    );
  });

  test('the make-a-friend schema is still NAME -> KIND -> LOVES -> TEMPERAMENT (personas.js MAKE_STEPS)', () => {
    assert.deepEqual(MAKE_STEPS.map((s) => s.key), ['name', 'kind', 'loves', 'temperament']);
    assert.equal(MAKE_STEPS[0].type, 'text');
    assert.equal(MAKE_STEPS[1].type, 'choice');
    assert.equal(MAKE_STEPS[2].type, 'text');
    assert.equal(MAKE_STEPS[3].type, 'choice');
  });
});

const HUB_IMFRIEND_INDEX = 4;

// ─── Navigation helpers (local to this file, mirroring textworld.test.mjs) ──────

async function enterHubWorld(page, i) {
  await page.keyboard.press('Space'); // door -> hub menu
  await page.waitForTimeout(400);
  for (let n = 0; n < i; n++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(120);
  }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
}

async function enterImfriend(page, baseUrl) {
  await toTextWorldDoor(page, baseUrl);
  await enterHubWorld(page, HUB_IMFRIEND_INDEX);
}

// Re-navigate all the way to the imfriend world AFTER a plain `page.reload()` —
// deliberately NOT via toTextWorldDoor/toSelect, whose own goToSelect helper calls
// `localStorage.clear()` (correct for a "fresh title screen" nav, but it would wipe
// the very kk-friends state a resume-across-reload test is trying to prove
// survives). Mirrors goToSelect's post-reload steps exactly, minus the clear.
async function reenterImfriendAfterReload(page) {
  await page.waitForTimeout(600);
  await page.click('body');
  await page.keyboard.press('Enter'); // reveal name entry (still title-screen)
  await page.waitForTimeout(350);
  await page.keyboard.press('Enter'); // confirm name -> ready-screen
  await page.waitForTimeout(450);
  await page.keyboard.type('wopr'); // -> select-screen
  await page.waitForTimeout(500);
  for (let i = 0; i < 5; i++) { // walk down to the Act 6 door
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(150);
  }
  await enterHubWorld(page, HUB_IMFRIEND_INDEX);
}

// From a fresh imfriend picker (cursor=0), open a curated friend by its CURATED
// array index (0=PIXEL, 1=SPROUT).
async function openCuratedFriend(page, curatedIndex) {
  for (let i = 0; i < curatedIndex; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(60);
  }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
}

// From a fresh imfriend picker (cursor=0), open the "MAKE A NEW FRIEND" item.
// `madeCount` = how many player-made friends already exist (they sort before the
// "make" entry, after the CURATED.length curated ones) — derived from CURATED's own
// length, never hardcoded.
async function openMakeFlow(page, madeCount = 0) {
  const makeIndex = CURATED.length + madeCount;
  for (let i = 0; i < makeIndex; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(60);
  }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
}

// Drive the 4-step make-a-friend flow starting from its first (name) step.
// `nameRaw`/`lovesRaw` are typed as literal keystrokes through the REAL live
// allowlist filter (imfriend.js handleMake) — pass raw untrusted text including
// disallowed characters to exercise it; the filter, not this helper, decides what
// survives.
async function makeFriendFlow(page, { nameRaw = '', kindIndex = 0, lovesRaw = '', temperamentIndex = 0 } = {}) {
  if (nameRaw) await typeSequence(page, nameRaw);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  for (let i = 0; i < kindIndex; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(60); }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  if (lovesRaw) await typeSequence(page, lovesRaw);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  for (let i = 0; i < temperamentIndex; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(60); }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300); // finishMake() -> openFriend() -> chat view
}

async function sendChatMessage(page, text) {
  await typeSequence(page, text);
  await page.keyboard.press('Enter');
}

// Escape out of the active imfriend world to the hub menu, then re-enter it
// (cursor is unchanged by returnToMenu(), so it's still on the imfriend entry) —
// landing back on imfriend's own FRESH picker view with `friends` reloaded from
// kk-friends. Used to prove resume/reload-style behavior within one page session.
async function exitToHubThenReenterImfriend(page) {
  await page.keyboard.press('Escape'); // world -> hub menu
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter'); // hub menu -> back into imfriend (fresh picker)
  await page.waitForTimeout(500);
}

// ─── Persisted-state readers ─────────────────────────────────────────────────

async function readKkProgress(page) {
  const raw = await page.evaluate(() => localStorage.getItem('kk-progress'));
  try { return raw ? JSON.parse(raw) : null; } catch (_) { return null; }
}

async function readKkFriends(page) {
  const raw = await page.evaluate(() => localStorage.getItem('kk-friends'));
  try { return raw ? JSON.parse(raw) : {}; } catch (_) { return null; }
}

async function waitForImfriendCompletion(page, { timeoutMs = 15000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let progress = await readKkProgress(page);
  while (progress?.textWorlds?.imfriend?.completed !== true && Date.now() < deadline) {
    await page.waitForTimeout(200);
    progress = await readKkProgress(page);
  }
  return progress;
}

async function waitForTranscriptLength(page, friendId, minLen, { timeoutMs = 15000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let friends = await readKkFriends(page);
  while ((friends?.[friendId]?.transcript?.length ?? 0) < minLen && Date.now() < deadline) {
    await page.waitForTimeout(200);
    friends = await readKkFriends(page);
  }
  return friends;
}

async function waitForReturn(page, expected = 'select-screen', { timeoutMs = 20000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let screen = await readScreen(page);
  while (screen !== expected && Date.now() < deadline) {
    await page.waitForTimeout(250);
    screen = await readScreen(page);
  }
  return screen;
}

// ─── /api/chat network stubs (page-level, never touching game code) ────────────

async function stubChatSuccess(page, reply) {
  await page.route('**/api/chat', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ reply: typeof reply === 'function' ? reply() : reply }),
  }));
}

async function stubChatEmptyReply(page) {
  await page.route('**/api/chat', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ reply: '' }),
  }));
}

async function stubChatUnreachable(page) {
  await page.route('**/api/chat', (route) => route.abort('failed'));
}

// A plain aborted /api/chat request logs Chromium's own resource-load failure line
// even though no game code calls console.error — verified empirically (the exact
// analog of kk-playwright.js's isExpectedWordgenProbe404, applied to our own
// deliberate stub instead of a real network condition).
const EXPECTED_CHAT_ABORT_NOISE = 'Failed to load resource: net::ERR_FAILED';
function withoutExpectedChatAbortNoise(errors) {
  return errors.filter((e) => !e.includes(EXPECTED_CHAT_ABORT_NOISE));
}

// mirrors imfriend.js handleMake's own live keystroke filter regex (quoted in its
// comment: "only letters + spaces enter a persona field") — used to derive what a
// raw typed string SHOULD reduce to before it ever reaches personas.js's own
// validators, so expectations are computed from the design's actual logic, never
// hand-typed.
function liveAllowlistFilter(raw) {
  return [...raw].filter((ch) => /[a-zA-Z ]/.test(ch)).join('');
}

function findFriendByName(friends, name) {
  return friends && Object.values(friends).find((f) => f.persona && f.persona.name === name);
}

// ─── INV-48 — chat send/receive loop ────────────────────────────────────────

describe('INV-48 — chat send/receive loop (im-friend-build.md §3 "Transcript = the friend\'s MEMORY, persisted")', () => {
  test('sending a message appends the child\'s line, then a successful reply appends the friend\'s line, in order, in the persisted transcript', { timeout: T }, async () => {
    const g = await startGame();
    try {
      const CANNED_REPLY = 'Beep! I love that word!';
      await stubChatSuccess(g.page, CANNED_REPLY);

      await enterImfriend(g.page, g.baseUrl);
      assert.equal(await readScreen(g.page), null, 'while imfriend is active, no standard .screen is visible');
      await openCuratedFriend(g.page, 0); // PIXEL

      // An empty submit (Enter with nothing typed) must be a no-op — the transcript
      // stays at just PIXEL's own opening greeting.
      await g.page.keyboard.press('Enter');
      await g.page.waitForTimeout(200);
      let friends = await readKkFriends(g.page);
      assert.equal(friends?.pixel?.transcript?.length, 1, 'submitting an empty message does not append anything');

      await sendChatMessage(g.page, 'hi pixel');
      friends = await waitForTranscriptLength(g.page, 'pixel', 3);
      const transcript = friends.pixel.transcript;
      assert.equal(transcript.length, 3, 'greeting + the child\'s line + the friend\'s reply');
      assert.deepEqual(transcript[0], { role: 'friend', text: PIXEL.greeting }, 'PIXEL\'s own authored greeting opens the transcript');
      assert.deepEqual(transcript[1], { role: 'you', text: 'hi pixel' }, 'the child\'s sent line is recorded verbatim');
      assert.deepEqual(transcript[2], { role: 'friend', text: CANNED_REPLY }, 'the model\'s reply is appended right after');

      assert.equal(await readScreen(g.page), null, 'still inside the wing (canvas-only) throughout the exchange');
      assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });
});

// ─── INV-49 — persona free-text allowlisting ────────────────────────────────

describe('INV-49 — persona free-text allowlisting (imfriend.js handleMake: "Live allowlist: only letters + spaces")', () => {
  test('digits typed into NAME/LOVES are rejected at the keystroke (gentle nudge, buffer unchanged); only letters+spaces survive into the persisted friend', { timeout: T }, async () => {
    const g = await startGame();
    try {
      await enterImfriend(g.page, g.baseUrl);
      await openMakeFlow(g.page, 0);

      const nameRaw = 'S1u2e3';   // digits interleaved with letters
      const lovesRaw = 'c4a9ke';  // digits interleaved with letters
      await makeFriendFlow(g.page, { nameRaw, kindIndex: 0, lovesRaw, temperamentIndex: 0 });

      const expectedName = validateName(liveAllowlistFilter(nameRaw));
      const expectedLoves = validateLoves(liveAllowlistFilter(lovesRaw));
      assert.equal(expectedName, 'Sue', 'fixture sanity: the derived expectation is the letters-only reduction');
      assert.equal(expectedLoves, 'cake', 'fixture sanity: the derived expectation is the letters-only reduction');

      const friends = await readKkFriends(g.page);
      const made = findFriendByName(friends, expectedName);
      assert.ok(made, `a friend named "${expectedName}" was persisted (digits never reached the stored name)`);
      assert.equal(made.persona.spec.loves, expectedLoves, 'the LOVES field also only ever contains what survived the live letter/space allowlist');
      assert.equal(made.persona.spec.temperament, TEMPERAMENT_CHOICES[0].id, 'the choice-step temperament is exactly the fixed id selected (no free text there at all)');
      assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });

  test('a NAME field where every keystroke is rejected (all digits) still commits gracefully via the documented fallback, never crashing', { timeout: T }, async () => {
    const g = await startGame();
    try {
      await enterImfriend(g.page, g.baseUrl);
      await openMakeFlow(g.page, 0);

      const nameRaw = '13579'; // no letters or spaces anywhere — buffer stays '' the whole step
      await makeFriendFlow(g.page, { nameRaw, kindIndex: 0, lovesRaw: '', temperamentIndex: 0 });

      const expectedName = validateName(liveAllowlistFilter(nameRaw)); // validateName('') -> its own documented fallback
      assert.equal(expectedName, 'Buddy', 'fixture sanity: validateName\'s own fallback for nothing-survived is "Buddy"');

      const friends = await readKkFriends(g.page);
      const made = findFriendByName(friends, 'Buddy');
      assert.ok(made, 'an all-rejected name still finishes the flow and persists under the documented fallback name, never throwing');
      assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });
});

// ─── INV-50 — graceful offline fallback ─────────────────────────────────────

describe('INV-50 — graceful offline fallback (im-friend-build.md §3 "the friend gently naps ... never broken")', () => {
  test('/api/chat unreachable (a transport failure) -> the friend naps with one of ITS OWN authored nap lines, never an error state', { timeout: T }, async () => {
    const g = await startGame();
    try {
      await stubChatUnreachable(g.page);
      await enterImfriend(g.page, g.baseUrl);
      await openCuratedFriend(g.page, 0); // PIXEL
      await sendChatMessage(g.page, 'are you there');

      const friends = await waitForTranscriptLength(g.page, 'pixel', 3);
      const last = friends.pixel.transcript.at(-1);
      assert.equal(last.role, 'friend');
      assert.ok(PIXEL.nap.includes(last.text), `PIXEL's nap line is one of its own authored set, got: ${JSON.stringify(last.text)}`);

      const realErrors = withoutExpectedChatAbortNoise(g.consoleErrors);
      assert.deepEqual(realErrors, [], `expected zero UNEXPECTED console errors (our own deliberate abort is filtered), saw:\n${realErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });

  test('/api/chat responds 200 with an empty reply (the server\'s own "model unavailable" signal) -> the friend naps just the same, with zero console noise', { timeout: T }, async () => {
    const g = await startGame();
    try {
      await stubChatEmptyReply(g.page);
      await enterImfriend(g.page, g.baseUrl);
      await openCuratedFriend(g.page, 1); // SPROUT
      await sendChatMessage(g.page, 'hello sprout');

      const friends = await waitForTranscriptLength(g.page, 'sprout', 3);
      const last = friends.sprout.transcript.at(-1);
      assert.equal(last.role, 'friend');
      assert.ok(SPROUT.nap.includes(last.text), `SPROUT's nap line is one of its own authored set, got: ${JSON.stringify(last.text)}`);

      assert.deepEqual(g.consoleErrors, [], `expected zero console errors (a clean 200 empty reply produces no network-level noise), saw:\n${g.consoleErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });
});

// ─── INV-51 — memory persistence + resume + garbage tolerance + forget ──────

describe('INV-51 — memory persistence, resume, garbage tolerance, and "forget this friend"', () => {
  test('a completion persists across a page reload, and RESUMES (a message sent after reload coexists with everything sent before it)', { timeout: T }, async () => {
    const g = await startGame();
    try {
      let n = 0;
      await stubChatSuccess(g.page, () => `PIXEL-REPLY-${n++}`);

      await enterImfriend(g.page, g.baseUrl);
      await openCuratedFriend(g.page, 0); // PIXEL
      await sendChatMessage(g.page, 'before reload');
      await waitForTranscriptLength(g.page, 'pixel', 3);

      await g.page.reload(); // a plain reload — NEVER clears localStorage
      await reenterImfriendAfterReload(g.page); // navigate back WITHOUT wiping kk-friends
      await openCuratedFriend(g.page, 0); // PIXEL again — same persisted friend
      await sendChatMessage(g.page, 'after reload');
      const friends = await waitForTranscriptLength(g.page, 'pixel', 5);

      const transcript = friends.pixel.transcript;
      assert.equal(transcript.length, 5, 'the pre-reload exchange was NOT dropped when the post-reload one was saved');
      assert.deepEqual(transcript[0], { role: 'friend', text: PIXEL.greeting });
      assert.deepEqual(transcript[1], { role: 'you', text: 'before reload' });
      assert.deepEqual(transcript[2], { role: 'friend', text: 'PIXEL-REPLY-0' });
      assert.deepEqual(transcript[3], { role: 'you', text: 'after reload' });
      assert.deepEqual(transcript[4], { role: 'friend', text: 'PIXEL-REPLY-1' });
      assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });

  test('completely corrupt kk-friends JSON is tolerated on boot — no throw, no console error, the wing is still fully enterable', { timeout: T }, async () => {
    const g = await startGame({ localStorage: { 'kk-friends': '{not-valid-json::::' } });
    try {
      await enterImfriend(g.page, g.baseUrl);
      assert.equal(await readScreen(g.page), null, 'imfriend boots normally despite corrupt kk-friends');
      const friends = await readKkFriends(g.page);
      assert.deepEqual(friends, null, 'sanity: the seeded value really was unparseable JSON (readKkFriends itself could not parse it either)');
      assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });

  test('a structurally malformed kk-friends (wrong per-friend shape) degrades to {} and does not block making a fresh friend', { timeout: T }, async () => {
    const g = await startGame({
      localStorage: { 'kk-friends': JSON.stringify({ garbage1: { persona: 'not-an-object' }, garbage2: 42, garbage3: null }) },
    });
    try {
      await enterImfriend(g.page, g.baseUrl);
      await openMakeFlow(g.page, 0); // the garbage entries are never "made friends" — still index CURATED.length
      await makeFriendFlow(g.page, { nameRaw: 'Robin', kindIndex: 0, lovesRaw: '', temperamentIndex: 0 });

      const friends = await readKkFriends(g.page);
      assert.equal(typeof friends, 'object', 'kk-friends degrades to a usable object, never stays garbage');
      assert.ok(!('garbage1' in friends) && !('garbage2' in friends) && !('garbage3' in friends), 'malformed entries are skipped, never carried forward');
      assert.ok(findFriendByName(friends, 'Robin'), 'a fresh friend can still be made and persisted after tolerating the garbage');
      assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });

  test('"forget this friend" (X -> Y) erases only the targeted friend, leaving every other made friend intact', { timeout: T }, async () => {
    const g = await startGame();
    try {
      await enterImfriend(g.page, g.baseUrl);
      await openMakeFlow(g.page, 0);
      await makeFriendFlow(g.page, { nameRaw: 'Aiden', kindIndex: 0, lovesRaw: '', temperamentIndex: 0 });

      await exitToHubThenReenterImfriend(g.page);
      await openMakeFlow(g.page, 1); // one made friend (Aiden) now precedes "make"
      await makeFriendFlow(g.page, { nameRaw: 'Bella', kindIndex: 1, lovesRaw: '', temperamentIndex: 1 });

      await exitToHubThenReenterImfriend(g.page);
      // Picker now: [PIXEL, SPROUT, Aiden, Bella, MAKE] — Aiden sits right after the
      // two curated entries (created first, sorted by createdAt).
      for (let i = 0; i < CURATED.length; i++) { await g.page.keyboard.press('ArrowDown'); await g.page.waitForTimeout(60); }
      await g.page.keyboard.press('x'); // forget-confirm overlay for Aiden
      await g.page.waitForTimeout(150);
      await g.page.keyboard.press('Y');
      await g.page.waitForTimeout(200);

      const friends = await readKkFriends(g.page);
      assert.equal(Object.keys(friends).length, 1, 'exactly one made friend remains (curated friends were never opened, so never persisted)');
      const remaining = Object.values(friends)[0];
      assert.equal(remaining.persona.name, 'Bella', 'the REMAINING friend is Bella — Aiden, and only Aiden, was forgotten');
      assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });

  test('the forget-confirm cancels on anything other than Y — nothing is ever erased by accident', { timeout: T }, async () => {
    const g = await startGame();
    try {
      await enterImfriend(g.page, g.baseUrl);
      await openMakeFlow(g.page, 0);
      await makeFriendFlow(g.page, { nameRaw: 'Casey', kindIndex: 0, lovesRaw: '', temperamentIndex: 0 });

      await exitToHubThenReenterImfriend(g.page);
      for (let i = 0; i < CURATED.length; i++) { await g.page.keyboard.press('ArrowDown'); await g.page.waitForTimeout(60); }
      await g.page.keyboard.press('x');
      await g.page.waitForTimeout(150);
      await g.page.keyboard.press('n'); // cancel, not confirm
      await g.page.waitForTimeout(200);

      const friends = await readKkFriends(g.page);
      assert.ok(findFriendByName(friends, 'Casey'), 'Casey survives an "n" (cancel) on the forget-confirm overlay');
      assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });
});

// ─── INV-52 — anti-trap (extends INV-46) + engagement crediting ────────────

describe('INV-52 — anti-trap from every imfriend view, and hasWon()-driven completion crediting on any exit', () => {
  test('Escape from the PICKER view lands on the hub menu (still a live menu), a second Escape reaches the arcade — no engagement, no completion recorded', { timeout: T }, async () => {
    const g = await startGame();
    try {
      await enterImfriend(g.page, g.baseUrl);
      assert.equal(await readScreen(g.page), null, 'inside the picker, no standard .screen is visible');

      await g.page.keyboard.press('Escape');
      await g.page.waitForTimeout(300);
      assert.equal(await readScreen(g.page), null, 'Escape from the picker lands on the hub menu (still inside the wing, one step from the arcade)');

      // Prove the hub menu is LIVE (re-enterable), then leave all the way out.
      await g.page.keyboard.press('Enter'); // cursor still on imfriend -> back into its (fresh) picker
      await g.page.waitForTimeout(400);
      assert.equal(await readScreen(g.page), null, 'the hub menu accepted Enter and re-entered imfriend');
      await g.page.keyboard.press('Escape');
      await g.page.waitForTimeout(300);
      await g.page.keyboard.press('Escape');
      const screen = await waitForReturn(g.page);
      assert.equal(screen, 'select-screen', 'Escape from the (re-verified live) hub menu reaches the arcade select screen');

      const progress = await readKkProgress(g.page);
      assert.equal(progress?.textWorlds?.imfriend?.completed, undefined, 'visiting the picker without ever engaging records no completion');
      assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });

  test('Escape from the CHAT view (before sending anything) lands on the hub menu, then the arcade — no completion recorded', { timeout: T }, async () => {
    const g = await startGame();
    try {
      await enterImfriend(g.page, g.baseUrl);
      await openCuratedFriend(g.page, 0); // PIXEL, opened but never messaged
      assert.equal(await readScreen(g.page), null, 'inside the chat view, no standard .screen is visible');

      await g.page.keyboard.press('Escape');
      await g.page.waitForTimeout(300);
      assert.equal(await readScreen(g.page), null, 'Escape from the chat view lands on the hub menu, not the arcade directly');
      await g.page.keyboard.press('Escape');
      const screen = await waitForReturn(g.page);
      assert.equal(screen, 'select-screen', 'a second Escape reaches the arcade');

      const progress = await readKkProgress(g.page);
      assert.equal(progress?.textWorlds?.imfriend?.completed, undefined, 'opening a friend without ever sending a message is not "engagement"');
      assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });

  test('Escape from the MAKE view (mid-creation, before finishing) lands on the hub menu, then the arcade — no completion recorded', { timeout: T }, async () => {
    const g = await startGame();
    try {
      await enterImfriend(g.page, g.baseUrl);
      await openMakeFlow(g.page, 0);
      await typeSequence(g.page, 'Sam'); // partial progress — never presses Enter to commit even step 1
      assert.equal(await readScreen(g.page), null, 'inside the make flow, no standard .screen is visible');

      await g.page.keyboard.press('Escape');
      await g.page.waitForTimeout(300);
      assert.equal(await readScreen(g.page), null, 'Escape mid-creation lands on the hub menu');
      await g.page.keyboard.press('Escape');
      const screen = await waitForReturn(g.page);
      assert.equal(screen, 'select-screen', 'a second Escape reaches the arcade');

      const progress = await readKkProgress(g.page);
      assert.equal(progress?.textWorlds?.imfriend?.completed, undefined, 'an abandoned, unfinished make-a-friend flow is not "engagement"');
      const friends = await readKkFriends(g.page);
      assert.deepEqual(friends, {}, 'nothing was persisted from the abandoned draft either');
      assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });

  test('sending a chat message, then leaving via Escape, DOES record the completion (engagement counts on any exit route)', { timeout: T }, async () => {
    const g = await startGame();
    try {
      await stubChatSuccess(g.page, 'Boop! Nice to see you!');
      await enterImfriend(g.page, g.baseUrl);
      await openCuratedFriend(g.page, 0); // PIXEL
      await sendChatMessage(g.page, 'hi');
      await waitForTranscriptLength(g.page, 'pixel', 3);

      await g.page.keyboard.press('Escape'); // straight out via Escape, not Space/Enter
      const progress = await waitForImfriendCompletion(g.page);
      assert.equal(progress?.textWorlds?.imfriend?.completed, true, 'sending at least one message counts as engagement, credited even on Escape');
      assert.equal(await readScreen(g.page), null, 'after the credited Escape, the player is at the hub menu (one step from the arcade), not stuck');
      assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });

  test('completing the make-a-friend flow (with zero chat messages sent) ALSO records the completion on exit', { timeout: T }, async () => {
    const g = await startGame();
    try {
      await enterImfriend(g.page, g.baseUrl);
      await openMakeFlow(g.page, 0);
      await makeFriendFlow(g.page, { nameRaw: 'Wren', kindIndex: 0, lovesRaw: '', temperamentIndex: 0 });
      // Now sitting in Wren's chat view, having never sent a message.

      await g.page.keyboard.press('Escape');
      const progress = await waitForImfriendCompletion(g.page);
      assert.equal(progress?.textWorlds?.imfriend?.completed, true, 'making a friend is itself engagement, independent of chatting');
      assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });
});
