// Enforces: INV-42, INV-43, INV-44, INV-45, INV-46, INV-47 — STRATEGY.md §5
// "Act 6 — Text Worlds (guided command matcher)"; product.md §Core Principles
// (the One Rule — "Reinforce, Don't Punish": wrong key never punishes, never
// advances, buffer stays and waits); memory act6-mastery-wing-idea ("Typing
// model (decided): HYBRID — guided verbs"); journal L40 ("A different input
// model wants a parallel screen, not an engine extension"); docs/ROADMAP.md §3
// "Act 6 — Text Worlds".
//
// Each world module states the design intent verbatim in its own header:
//   engine.js:    "THE ONE RULE holds absolutely here ... A wrong key does the
//                  same thing the pattern engine does — a gentle nudge and the
//                  command line simply WAITS; it never advances, never
//                  punishes. You can only ever arrive."
//   tileworld.js: "walls just stop you with a gentle nudge — no death, no
//                  loss, no timers. You can only ever arrive."
//   maker.js:     "you can never fail, there are no timers, and whatever you
//                  make is wonderful. A wrong key just waits (gentle nudge)."
//
// WHY INTEGRATION, NOT UNIT (per .claude/rules/testing.md / STRATEGY.md §3's
// "Why the engine is tested at L2" rationale, extended to this wing): every
// engine here (engine.js, tileworld.js, maker.js) requires
// `document.getElementById('invaders-canvas')` + a real 2D context,
// `requestAnimationFrame`, and `window.AudioContext` (via js/audio.js) the
// instant `start()` runs — there is no seam a stubs.mjs localStorage/fetch
// stub can cover, and main.js (the door/persistence caller) is DOM-wired at
// import time. Driven here through the REAL router (main.js's `case
// 'textworld'` in the keydown switch), the real door sub-state, and real key
// events — never a game internal.
//
// WHY THE OBSERVABLE IS PERSISTENCE + SCREEN ID, NOT CANVAS TEXT: each
// engine's live state (typed buffer, room/position, offered set) is rendered
// ONLY via canvas fillText — STRATEGY.md §2 explicitly prohibits "pixel/
// geometry assertions on canvas art". The legitimate player-observable
// surfaces here are (a) which `.screen` is visible (readScreen() — null while
// a text world/hub owns the canvas exclusively, 'select-screen' back at the
// door on exit) and (b) the persisted outcome in `kk-progress.textWorlds`
// (INV-44) — the actual promise the game keeps to a returning player. Both
// are used as the oracle for "did a wrong key ever sneak a command/word
// through" and "did the when-gate/allowlist actually gate": if a matcher were
// broken (accepting a non-prefix key, auto-firing an ambiguous/ungated
// entry), the world would complete via an illegitimate path, or a gated/
// non-allowlisted entry would still be typeable — either would flip these
// externally-observable outcomes. This keeps the tests refactor-safe: a pure
// internal rewrite of any matcher's data structures changes nothing observed.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  startGame,
  toTextWorldDoor,
  readScreen,
  press,
  typeSequence,
} from '../helpers/game-driver.mjs';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Pure data imports — the worlds' own authored commands/maps/vocab, never a
// copied/guessed constant (STRATEGY.md §2: "expected values derive from the
// design docs or from the game's own data files"). No DOM deps, so these
// imports are safe at module load time even though each is consumed by a
// DOM-coupled engine.
const { GreenDragon } = await import(join(REPO_ROOT, 'js', 'textworld', 'greendragon.js'));
const { GlimmerDeep, Whisperwood } = await import(join(REPO_ROOT, 'js', 'textworld', 'tile-worlds.js'));
// maker.js and imfriend.js are engine modules (not data objects), but each exports
// its own `id` — the single source of truth for that world's id — with no top-level
// DOM/browser access, so importing them here for that const is safe (same as the
// data-object imports above). Every HUB_ORDER entry is a `<world>.id` reference, so
// the fixture can never drift from hub.js's literals (there are none to drift from).
const { id: MAKER_ID } = await import(join(REPO_ROOT, 'js', 'textworld', 'maker.js'));
const { id: IMFRIEND_ID } = await import(join(REPO_ROOT, 'js', 'textworld', 'imfriend.js'));

// hub.js's own WORLDS array order (js/textworld/hub.js) — read here as a
// design-doc-cited FIXTURE assumption, verified by a sanity test below rather
// than trusted blind, so a reorder in hub.js fails loudly instead of silently
// misdirecting ArrowDown navigation in every other test.
const HUB_ORDER = [GreenDragon.id, GlimmerDeep.id, Whisperwood.id, MAKER_ID, IMFRIEND_ID];

// ─── Fixture-derived solutions (never hand-copied from having read the file) ─

// The canonical winning path through GreenDragon, derived by WALKING THE WORLD
// DATA ITSELF with a fake api (tracking flags/inventory exactly like engine.js's
// real api, so `when(api)` predicates evaluate the same way live play would).
// A change to the world's own room graph or command set updates this test's
// expectation automatically instead of silently drifting from it. In each
// room: try every currently-offered, non-"look", non-movement command first
// (so items/flags get set), then move.
function deriveProseSolution(world) {
  const fakeFlags = new Set();
  const fakeInv = new Set();
  const box = { room: world.start };
  const api = {
    say() {}, describe() {},
    take: (i) => fakeInv.add(i), drop: (i) => fakeInv.delete(i), has: (i) => fakeInv.has(i),
    setFlag: (n) => fakeFlags.add(n), clearFlag: (n) => fakeFlags.delete(n), flag: (n) => fakeFlags.has(n),
    visited: () => true,
    go: (id) => { box.room = id; },
  };
  const path = [];
  let guard = 0;
  while (!world.goal(api) && guard++ < 50) {
    const room = world.rooms[box.room];
    const offered = room.commands.filter((c) => !c.when || c.when(api));
    const nonMove = offered.find((c) => c.text !== 'look' && !c.text.startsWith('go '));
    const choice = nonMove || offered.find((c) => c.text.startsWith('go '));
    if (!choice) break;
    path.push(choice.text);
    choice.run(api);
  }
  return path;
}

// BFS over a tile world's own map string array (never a hand-copied route),
// so a future map edit updates the test's expectation automatically instead
// of silently drifting from the design doc's own claim (tile-worlds.js
// header: "the left column and the bottom passage are always open, so 'south
// then east' always reaches the far *").
function deriveTileSolution(world) {
  const rows = world.map;
  const ROWS = rows.length, COLS = rows[0].length;
  let at = null, goal = null;
  rows.forEach((row, r) => {
    [...row].forEach((ch, c) => {
      if (ch === '@') at = { r, c };
      if (ch === '*') goal = { r, c };
    });
  });
  assert.ok(at && goal, `${world.title}: map contains both @ and *`);
  const isFloor = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS && rows[r][c] !== '#';
  const DIRS = [['n', -1, 0], ['s', 1, 0], ['e', 0, 1], ['w', 0, -1]];
  const key = (r, c) => `${r},${c}`;
  const seen = new Set([key(at.r, at.c)]);
  const prev = new Map();
  const queue = [at];
  while (queue.length) {
    const cur = queue.shift();
    if (cur.r === goal.r && cur.c === goal.c) break;
    for (const [dir, dr, dc] of DIRS) {
      const nr = cur.r + dr, nc = cur.c + dc;
      if (!isFloor(nr, nc) || seen.has(key(nr, nc))) continue;
      seen.add(key(nr, nc));
      prev.set(key(nr, nc), { from: cur, dir });
      queue.push({ r: nr, c: nc });
    }
  }
  assert.ok(seen.has(key(goal.r, goal.c)), `${world.title}: goal reachable from start (BFS over the actual map)`);
  const path = [];
  let cursor = key(goal.r, goal.c);
  while (cursor !== key(at.r, at.c)) {
    const step = prev.get(cursor);
    path.unshift(step.dir);
    cursor = key(step.from.r, step.from.c);
  }
  return path;
}

const PROSE_SOLUTION = deriveProseSolution(GreenDragon);
const CAVE_SOLUTION = deriveTileSolution(GlimmerDeep);
const FOREST_SOLUTION = deriveTileSolution(Whisperwood);

async function typeCommand(page, cmd) {
  await typeSequence(page, cmd);
  await page.waitForTimeout(150);
}

async function readKkProgress(page) {
  const raw = await page.evaluate(() => localStorage.getItem('kk-progress'));
  try { return raw ? JSON.parse(raw) : null; } catch (_) { return null; }
}

// Poll for readScreen() to reach `expected` (used for the Escape chain, which
// genuinely reaches 'select-screen'). Assert eventual state, never a
// millisecond duration (STRATEGY.md §2). The deadline is deliberately
// generous: under a loaded machine (many chromium instances in the same
// `make test` run — the documented class of flake in
// docs/testing/FINDINGS.md "Driver follow-ups") a tight poll window reads as
// a false failure, not a real regression.
async function waitForReturn(page, expected = 'select-screen', { timeoutMs = 20000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let screen = await readScreen(page);
  while (screen !== expected && Date.now() < deadline) {
    await page.waitForTimeout(250);
    screen = await readScreen(page);
  }
  return screen;
}

// IMPORTANT (hub.js `enterWorld`): winning a world does NOT return the player
// directly to the arcade — it calls `onWorldComplete(id)` (the persistence
// hook) and then `returnToMenu()`, handing the player straight back to the
// hub's chooser so they can pick another world without a forced trip through
// the arcade (product.md "never interrupt flow" — the same posture as Free
// Play returning to cabinet-hopping, not the title screen). readScreen()
// cannot distinguish "still in a world" from "back at the hub menu" — both
// render exclusively on the shared canvas, no standard `.screen` — so the
// truthful, non-canvas-reading oracle for "did the world actually complete"
// is the persisted outcome itself (INV-44's own promise to a returning
// player), polled rather than asserted after a fixed sleep.
async function waitForWorldWin(page, worldId, { timeoutMs = 20000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let progress = await readKkProgress(page);
  while (progress?.textWorlds?.[worldId]?.completed !== true && Date.now() < deadline) {
    await page.waitForTimeout(250);
    progress = await readKkProgress(page);
  }
  return progress;
}

// Enter the hub menu (door → Space) and select world index `i` by ArrowDown
// navigation from cursor 0, then Enter. Mirrors real player input — no
// internal cursor is read or set directly.
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

const T = 90_000;

// ── Fixture sanity — hub order + non-empty derived solutions ────────────────
describe('Act 6 fixture sanity (guards every other test against silent drift)', () => {
  test('hub.js WORLDS order matches this file\'s HUB_ORDER assumption', async () => {
    const hubSrc = await (await import('node:fs/promises')).readFile(
      join(REPO_ROOT, 'js', 'textworld', 'hub.js'), 'utf8',
    );
    // Extract each world entry's `id:` (string literal or `<Import>.id` member
    // expression) in source order, matched structurally rather than assuming
    // exact formatting. Every hub entry now references its world's own `.id`
    // (single source of truth — no literals), so resolve each reference back to
    // the imported world's actual id before comparing to HUB_ORDER.
    const RESOLVE = {
      'GreenDragon.id': GreenDragon.id,
      'GlimmerDeep.id': GlimmerDeep.id,
      'Whisperwood.id': Whisperwood.id,
      'Maker.id': MAKER_ID,
      'ImFriend.id': IMFRIEND_ID,
    };
    const ids = [...hubSrc.matchAll(/id:\s*(?:'([^']+)'|(\w+\.id))/g)]
      .map((m) => m[1] || m[2]);
    assert.deepEqual(
      ids.map((raw) => RESOLVE[raw] ?? raw),
      HUB_ORDER,
      'hub.js world order changed — update HUB_ORDER (and this file\'s navigation) to match',
    );
  });

  test('derived solutions are non-empty for every world (sanity on the fixtures themselves)', () => {
    assert.ok(PROSE_SOLUTION.length > 0, 'GreenDragon has a winning command path');
    assert.ok(CAVE_SOLUTION.length > 0, 'THE GLIMMER DEEP has a winning move path');
    assert.ok(FOREST_SOLUTION.length > 0, 'THE WHISPERWOOD has a winning move path');
  });

  test('both tile worlds are solvable via "south then east" (tile-worlds.js header claim)', () => {
    for (const [name, sol] of [['GlimmerDeep', CAVE_SOLUTION], ['Whisperwood', FOREST_SOLUTION]]) {
      const firstNonS = sol.find((d) => d !== 's');
      assert.ok(
        sol[0] === 's' && (firstNonS === undefined || firstNonS === 'e'),
        `${name}: BFS solution ${JSON.stringify(sol)} should read as south-then-east (design doc claim)`,
      );
    }
  });
});

// ── INV-42 — the prose guided command matcher IS the One Rule ───────────────
describe('INV-42 — prose guided command matcher (engine.js header: "does the same thing the pattern engine does")', () => {
  let g;
  before(async () => { g = await startGame(); });
  after(async () => { await g.stop(); });

  test('solving THE GREEN DRAGON with only the offered commands completes it, records it, and hands the player back to the hub menu (still reachable to the arcade from there)', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 0); // THE GREEN DRAGON
    assert.equal(await readScreen(g.page), null, 'while a text world is active, no standard .screen is visible');

    for (const cmd of PROSE_SOLUTION) await typeCommand(g.page, cmd);

    // The win flourish holds before onComplete fires (engine.js: winT===150
    // frames, a beat, never a modal) — poll the PERSISTED outcome rather than
    // assert a millisecond duration (STRATEGY.md §2 prohibits timing-exact
    // asserts) or a screen id (winning a world returns to the hub MENU, not
    // the arcade — hub.js `enterWorld`'s callback calls `returnToMenu()`, not
    // `onExit` — see waitForWorldWin's comment).
    const progress = await waitForWorldWin(g.page, 'greendragon');
    assert.equal(
      progress?.textWorlds?.greendragon?.completed,
      true,
      'reaching the goal records the text-world completion (the guided path actually works end to end)',
    );
    assert.equal(await readScreen(g.page), null, 'after winning, the player is back at the hub menu, not a standard .screen');

    // The hub menu is genuinely reachable onward to the arcade from here —
    // proving the win did not strand the player in some other dead state.
    await g.page.keyboard.press('Escape');
    const screen = await waitForReturn(g.page);
    assert.equal(screen, 'select-screen', 'from the post-win hub menu, Escape reaches the arcade door');
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
  });
});

describe('INV-42 — a wrong key never advances the buffer, never fires a command, never punishes', () => {
  let g;
  before(async () => { g = await startGame(); });
  after(async () => { await g.stop(); });

  test('a run of ONLY keys that match no offered command\'s prefix never completes the world and never crashes it', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 0); // greendragon

    // None of the starting room's offered commands ("look", "take lamp",
    // "go north") begin with these characters — derived from the room's own
    // command list, not guessed, so this stays correct if the world's opening
    // commands ever change.
    const offeredPrefixes = new Set(
      GreenDragon.rooms[GreenDragon.start].commands.map((c) => c.text[0]),
    );
    const wrongChar = 'qwertyuiopasdfghjklzxcvbnm'
      .split('')
      .find((c) => !offeredPrefixes.has(c));
    assert.ok(wrongChar, 'a character outside every offered prefix exists to probe with');

    for (let i = 0; i < 15; i++) {
      await press(g.page, wrongChar);
      await g.page.waitForTimeout(30);
    }

    // Still inside the text world (never advanced to any screen, let alone
    // "won" its way back to the arcade) — the wrong-key run did nothing.
    assert.equal(
      await readScreen(g.page),
      null,
      'a run of only-rejected keys leaves the player still inside the text world',
    );
    assert.equal(
      (await readKkProgress(g.page))?.textWorlds?.greendragon?.completed,
      undefined,
      'no completion is ever recorded from a run of only-rejected keys',
    );
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);

    // The world is still alive and correctly solvable afterward — proving the
    // rejected run did not corrupt engine state (no partial/garbage buffer left
    // behind that would block a legitimate command from firing).
    for (const cmd of PROSE_SOLUTION) await typeCommand(g.page, cmd);
    const progress = await waitForWorldWin(g.page, 'greendragon');
    assert.equal(progress?.textWorlds?.greendragon?.completed, true, 'the world remains fully solvable after an earlier run of wrong keys');
  });

  test('a wrong continuation mid-buffer is rejected but the valid prefix survives (self-correction is never required)', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 0);

    // "look" is offered in the start room. Type its first two chars (a valid
    // prefix), then a character that continues neither "look" nor any other
    // offered command, then finish "look" correctly WITHOUT backspacing —
    // proving the wrong key's rejection did not touch the buffer at all.
    await typeSequence(g.page, 'lo');
    await g.page.waitForTimeout(100);
    await press(g.page, 'z'); // 'loz...' is not a prefix of any offered command
    await g.page.waitForTimeout(100);
    await typeSequence(g.page, 'ok'); // completes "look" -> fires (a no-op command)
    await g.page.waitForTimeout(200);

    assert.equal(
      await readScreen(g.page),
      null,
      'the world is still running (an un-corrupted buffer let "look" fire normally)',
    );
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
  });

  test('Backspace self-corrects: a wrong path can be abandoned and retyped with the correct command still reachable', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 0);

    // Type "go " (a valid, shared prefix of "go north"), then backspace it all
    // away, then solve the world normally — proves Backspace is available and
    // harmless (product.md Level 25 framing, echoed in engine.js: "Backspace is
    // how every writer works").
    await typeSequence(g.page, 'go ');
    await g.page.waitForTimeout(100);
    for (let i = 0; i < 3; i++) { await press(g.page, 'Backspace'); await g.page.waitForTimeout(60); }

    for (const cmd of PROSE_SOLUTION) await typeCommand(g.page, cmd);
    const progress = await waitForWorldWin(g.page, 'greendragon');
    assert.equal(progress?.textWorlds?.greendragon?.completed, true, 'after backspacing away a partial command, the world is still fully solvable');
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
  });
});

// ── INV-43 — when-gated commands are only matchable while their predicate holds ──
describe('INV-43 — when-gated commands (greendragon.js "take lamp" when: !w.has(\'lamp\')")', () => {
  let g;
  before(async () => { g = await startGame(); });
  after(async () => { await g.stop(); });

  test('once its when-gate is satisfied, a command is no longer offered — even its opening key is rejected', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 0);

    // Confirm the fixture actually has a when-gated command in the start room
    // (guards against this test silently passing if the world data changes).
    const startRoomCmds = GreenDragon.rooms[GreenDragon.start].commands;
    const gated = startRoomCmds.find((c) => typeof c.when === 'function' && c.text === 'take lamp');
    assert.ok(gated, 'greendragon.js still authors a when-gated "take lamp" in the starting room');

    await typeCommand(g.page, 'take lamp'); // satisfies the gate (w.has('lamp') becomes true)

    // Now no command in the room begins with 't' (only "take lamp" did, and
    // it's derived structurally, not assumed) — so 't' alone must be rejected.
    const stillOfferedStartsWithT = startRoomCmds.some(
      (c) => c.text !== 'take lamp' && c.text.startsWith('t'),
    );
    assert.equal(stillOfferedStartsWithT, false, 'fixture sanity: no OTHER start-room command begins with "t"');

    await press(g.page, 't');
    await g.page.waitForTimeout(150);
    assert.equal(
      await readScreen(g.page),
      null,
      'the text world is unaffected by the rejected "t" — no command fired, nothing crashed',
    );

    // And the world is still fully solvable via the remaining path (which no
    // longer needs "take lamp" — it is already satisfied).
    const restOfSolution = deriveProseSolution(GreenDragon).filter((_, i) => i > 0);
    for (const cmd of restOfSolution) await typeCommand(g.page, cmd);
    const progress = await waitForWorldWin(g.page, 'greendragon');
    assert.equal(progress?.textWorlds?.greendragon?.completed, true, 'the world completes normally once the already-satisfied gate is skipped');
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
  });
});

// ── INV-44 — persistence: tolerant read, durable write, never on abandonment ──
describe('INV-44 — text-world persistence (main.js getProgress()/recordTextWorldComplete; security.md rule 4 "localStorage is untrusted input")', () => {
  test('a garbage (non-object) textWorlds field in kk-progress is tolerated and a fresh completion still records cleanly', { timeout: T }, async () => {
    const g = await startGame({
      progress: { furthestLevel: 1, completed: {}, textWorlds: 'not-an-object' },
    });
    try {
      await toTextWorldDoor(g.page, g.baseUrl);
      await enterHubWorld(g.page, 0);

      for (const cmd of PROSE_SOLUTION) await typeCommand(g.page, cmd);
      const progress = await waitForWorldWin(g.page, 'greendragon');
      assert.equal(progress?.textWorlds?.greendragon?.completed, true, 'garbage textWorlds does not block reaching or completing the world');
      assert.equal(typeof progress.textWorlds, 'object', 'textWorlds degrades to an object, never stays garbage');
      assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });

  test('completely corrupt kk-progress JSON is tolerated on boot (no throw, no console error, defaults apply)', { timeout: T }, async () => {
    const g = await startGame({ localStorage: { 'kk-progress': '{not-valid-json::::' } });
    try {
      await g.page.goto(g.baseUrl);
      await g.page.waitForTimeout(600);
      assert.notEqual(await readScreen(g.page), null, 'the game still boots to a real screen despite corrupt kk-progress');
      assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });

  test('leaving the world unsolved (Escape) records no completion', { timeout: T }, async () => {
    const g = await startGame();
    try {
      await toTextWorldDoor(g.page, g.baseUrl);
      await enterHubWorld(g.page, 0);

      // Make some partial, legitimate progress, then leave before the goal.
      await typeCommand(g.page, PROSE_SOLUTION[0]);
      await g.page.keyboard.press('Escape'); // world -> hub menu
      await g.page.waitForTimeout(300);
      await g.page.keyboard.press('Escape'); // menu -> arcade

      const screenAfterEscape = await waitForReturn(g.page);
      assert.equal(screenAfterEscape, 'select-screen', 'the double-Escape chain returns to the arcade door');
      const progress = await readKkProgress(g.page);
      assert.equal(
        progress?.textWorlds?.greendragon?.completed,
        undefined,
        'an abandoned (incomplete) attempt never records a completion',
      );
      assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });

  test('a completion persists across a reload (the progress promise a returning player relies on)', { timeout: T }, async () => {
    const g = await startGame();
    try {
      await toTextWorldDoor(g.page, g.baseUrl);
      await enterHubWorld(g.page, 0);
      for (const cmd of PROSE_SOLUTION) await typeCommand(g.page, cmd);
      await waitForWorldWin(g.page, 'greendragon');

      await g.page.reload();
      await g.page.waitForTimeout(600);
      const progress = await readKkProgress(g.page);
      assert.equal(
        progress?.textWorlds?.greendragon?.completed,
        true,
        'the completion survives a reload',
      );
      assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
    } finally {
      await g.stop();
    }
  });
});

// ── INV-45 — the tile worlds' own One-Rule movement contract ────────────────
describe('INV-45 — tile worlds (tileworld.js header: "walls just stop you with a gentle nudge")', () => {
  let g;
  before(async () => { g = await startGame(); });
  after(async () => { await g.stop(); });

  test('a move into a wall/edge does not change position; a legal move does; reaching the goal wins and records THE GLIMMER DEEP\'s own id', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 1); // THE GLIMMER DEEP (hub index 1)
    assert.equal(await readScreen(g.page), null, 'while a tile world is active, no standard .screen is visible');

    // The '@' spawn in tile-worlds.js sits on row 1, directly under the top
    // wall (row 0 is solid '#' across every column in both fixtures) — 'n'
    // from spawn is therefore always into a wall regardless of any future
    // interior map edit, making it a safe universal "walk into a wall" probe.
    assert.equal(GlimmerDeep.map[0], '#'.repeat(GlimmerDeep.map[0].length), 'fixture sanity: row 0 is a solid wall');
    for (let i = 0; i < 5; i++) {
      await press(g.page, 'n');
      await g.page.waitForTimeout(40);
    }
    assert.equal(await readScreen(g.page), null, 'repeatedly walking into the top wall neither wins nor crashes nor leaves the world');
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);

    // Now walk the BFS-derived legal path all the way to the goal.
    for (const dir of CAVE_SOLUTION) {
      await press(g.page, dir);
      await g.page.waitForTimeout(40);
    }

    // The tile engine's own win state (won=true) accepts Space/Enter to leave
    // immediately rather than only the ~300-frame auto-return, so drive it
    // rather than idle-waiting out the full hold (STRATEGY.md §2: assert
    // ordering/eventual state, exercise the documented skip path). Reaching
    // the goal hands control back to the hub's `onComplete(id)` callback
    // (main.js `recordTextWorldComplete`) and then the hub MENU — not
    // directly to the arcade (hub.js `enterWorld`) — so the oracle is the
    // persisted outcome, exactly as for the prose world above.
    await g.page.waitForTimeout(300);
    await g.page.keyboard.press('Space');
    const progress = await waitForWorldWin(g.page, GlimmerDeep.id);
    assert.equal(progress?.textWorlds?.[GlimmerDeep.id]?.completed, true, "THE GLIMMER DEEP records its own world id, independent of greendragon");
    assert.equal(await readScreen(g.page), null, 'after winning, the player is back at the hub menu, not a standard .screen');
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
  });

  test('THE WHISPERWOOD is independently solvable and records its own id (two tile worlds, not one)', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 2); // THE WHISPERWOOD (hub index 2)
    assert.equal(await readScreen(g.page), null, 'while a tile world is active, no standard .screen is visible');

    for (const dir of FOREST_SOLUTION) {
      await press(g.page, dir);
      await g.page.waitForTimeout(40);
    }
    await g.page.waitForTimeout(300);
    await g.page.keyboard.press('Enter'); // the tile engine also accepts Enter to leave the win state
    const progress = await waitForWorldWin(g.page, Whisperwood.id);
    assert.equal(progress?.textWorlds?.[Whisperwood.id]?.completed, true, 'THE WHISPERWOOD records its own world id');
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
  });
});

// ── INV-47 — YOUR OWN WORLD (maker.js): fixed-allowlist guided matcher ──────
describe('INV-47 — YOUR OWN WORLD (maker.js header: "A wrong key just waits", "no free-text/untrusted-input surface")', () => {
  let g;
  before(async () => { g = await startGame(); });
  after(async () => { await g.stop(); });

  test('a wrong key (outside every offered word\'s prefix) is rejected and never places a thing', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 3); // YOUR OWN WORLD (hub index 3)
    assert.equal(await readScreen(g.page), null, 'while the maker is active, no standard .screen is visible');

    // 'q' is not the start of any tier-0 VOCAB word (sun, star, cloud, bird,
    // tree, house, flower) — probe several offered-tier-0 first letters via
    // the module's own export shape is not available (VOCAB is private), so
    // this uses the documented tier-0 word list from maker.js's own header/
    // design comment set; a q-led word is not among any of them.
    for (let i = 0; i < 10; i++) {
      await press(g.page, 'q');
      await g.page.waitForTimeout(30);
    }
    assert.equal(await readScreen(g.page), null, 'a run of rejected keys leaves the player still inside the maker, uncrashed');
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);

    // Prove it's still fully usable afterward: typing a real offered word
    // ("tree") places a thing without any prior corruption.
    await typeCommand(g.page, 'tree');
    assert.equal(await readScreen(g.page), null, 'typing a real offered word after a wrong-key run still works (state was not corrupted)');
  });

  test('typing offered words places things; typing "wake" (offered once 3+ are placed) brings the world alive; Space records the completion and returns to the hub menu', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 3);

    // Place three things from the always-available tier-0 palette.
    await typeCommand(g.page, 'tree');
    await typeCommand(g.page, 'star');
    await typeCommand(g.page, 'cloud');

    // "wake" only becomes typeable once placed>=3 (maker.js `offered()`) — a
    // premature "wake" before 3 placements must be REJECTED exactly like any
    // other non-offered word, proving the allowlist is state-dependent, not a
    // static whitelist checked only at start().
    // (We don't test the pre-3 rejection with a fresh session here to avoid
    // asserting on maker.js's internal threshold value directly — instead we
    // prove the POST-3 "wake" path works, which is the documented contract.)
    await typeCommand(g.page, 'wake');
    await g.page.waitForTimeout(200);

    // Alive: Space is one of the module's documented "leave" keys (drawChrome's
    // own on-screen text: "SPACE / ENTER: back to the arcade") — module comment:
    // "no auto-return — the child savours it, then presses a key". Leaving from
    // a win records the completion and hands the player to the hub MENU
    // (hub.js `enterWorld`), not directly to the arcade — the truthful oracle
    // is the persisted outcome, exactly as for the prose/tile worlds above.
    await g.page.keyboard.press('Space');
    const progress = await waitForWorldWin(g.page, 'maker');
    assert.equal(progress?.textWorlds?.maker?.completed, true, 'waking the world and leaving via the documented SPACE key records the completion');
    assert.equal(await readScreen(g.page), null, 'after leaving the ALIVE maker state, the player is back at the hub menu, not a standard .screen');
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
  });

  // TF-T1 (FIXED 2026-07-14): the hub now credits a WON world on ANY exit —
  // Space/Enter, the auto-return, or Escape — via hub.js returnToMenu()'s
  // hasWon() check (each world engine exports hasWon()). So leaving the ALIVE
  // maker via Escape (a child's natural "go back") no longer silently drops the
  // completion. Previously the hub intercepted Escape before maker.js's finish()
  // ran, losing the record; the anti-trap always held, only the achievement
  // vanished. This test proves the Escape path now records, matching Space.
  test('TF-T1 fixed: leaving the ALIVE maker via Escape ALSO records the wake completion (a win counts on any exit)', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 3);

    await typeCommand(g.page, 'tree');
    await typeCommand(g.page, 'star');
    await typeCommand(g.page, 'cloud');
    await typeCommand(g.page, 'wake');
    await g.page.waitForTimeout(200);

    // Leave via Escape instead of Space — the win must STILL be credited.
    await g.page.keyboard.press('Escape');
    const progress = await waitForWorldWin(g.page, 'maker');
    assert.equal(progress?.textWorlds?.maker?.completed, true, 'waking the world then leaving via Escape still records the completion (TF-T1 fix)');
    assert.equal(await readScreen(g.page), null, 'after Escaping the ALIVE maker, the player is back at the hub menu (not stuck, not the arcade yet)');
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
  });

  test('Backspace self-corrects a partially-typed word without placing anything', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 3);

    await typeSequence(g.page, 'tr'); // valid prefix of "tree"
    await g.page.waitForTimeout(100);
    for (let i = 0; i < 2; i++) { await press(g.page, 'Backspace'); await g.page.waitForTimeout(60); }
    // Retype fully — proves the buffer was actually cleared, not left dangling.
    await typeCommand(g.page, 'tree');
    assert.equal(await readScreen(g.page), null, 'the maker is still running normally after a backspace-and-retype');
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
  });
});

// ── INV-46 — ANTI-TRAP: the player can ALWAYS leave, world → hub → arcade ───
// The exact invariant a stalled run once mis-flagged (per the task brief): prove
// the escape hatch, not just the happy path. hub.js is the coordinator — Escape
// from an active world returns to its own menu (still playable, not frozen);
// Escape from the menu reaches the arcade. Tested from EVERY world kind (prose,
// tile, maker) so no engine can silently swallow Escape.
describe('INV-46 — anti-trap: Escape always makes progress toward the arcade (hub.js coordinator contract)', () => {
  let g;
  before(async () => { g = await startGame(); });
  after(async () => { await g.stop(); });

  test('Escape from THE GREEN DRAGON (prose) world returns to a LIVE, re-enterable hub menu — not a frozen screen', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 0); // THE GREEN DRAGON
    assert.equal(await readScreen(g.page), null, 'inside the prose world, no standard .screen is visible');

    // Make partial, legitimate progress so a badly-wired Escape that silently
    // no-ops would be caught by a stale win later, then leave.
    await typeCommand(g.page, PROSE_SOLUTION[0]);
    await g.page.keyboard.press('Escape');
    await g.page.waitForTimeout(300);

    // Still not the arcade (Escape from a WORLD lands on the hub MENU, one step
    // short of the arcade) — and still no standard .screen, because the hub
    // menu also renders on the shared canvas.
    assert.equal(await readScreen(g.page), null, 'Escape from a world lands on the hub menu, still inside the wing (one step from the arcade, not zero)');
    assert.deepEqual(g.consoleErrors, [], `Escape from the world produced console errors:\n${g.consoleErrors.join('\n')}`);

    // Prove the menu is LIVE, not a frozen leftover frame: it accepts
    // navigation and can re-enter a world (the whole reason it exists — you're
    // not stuck outside every world either).
    await g.page.keyboard.press('ArrowDown');
    await g.page.waitForTimeout(150);
    await g.page.keyboard.press('Enter');
    await g.page.waitForTimeout(500);
    assert.equal(await readScreen(g.page), null, 'the hub menu accepted navigation + Enter and re-entered a world');
    // Leave again, this time all the way out, proving the SECOND Escape (from
    // the now-live menu) reaches the arcade.
    await g.page.keyboard.press('Escape');
    await g.page.waitForTimeout(300);
    await g.page.keyboard.press('Escape');
    const screen = await waitForReturn(g.page);
    assert.equal(screen, 'select-screen', 'Escape from the (re-verified live) hub menu reaches the arcade select screen');
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors across the full escape chain, saw:\n${g.consoleErrors.join('\n')}`);
  });

  test('Escape from a TILE world (THE GLIMMER DEEP) returns to the hub menu, and Escape from the menu reaches the arcade', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 1); // THE GLIMMER DEEP
    assert.equal(await readScreen(g.page), null, 'inside the tile world, no standard .screen is visible');

    // A few legal moves (partial progress), then escape.
    await press(g.page, 's');
    await g.page.waitForTimeout(60);
    await press(g.page, 's');
    await g.page.waitForTimeout(60);
    await g.page.keyboard.press('Escape');
    await g.page.waitForTimeout(300);
    assert.equal(await readScreen(g.page), null, 'Escape from the tile world lands on the hub menu (still inside the wing)');
    assert.deepEqual(g.consoleErrors, [], `Escape from the tile world produced console errors:\n${g.consoleErrors.join('\n')}`);

    // From the menu, Escape reaches the arcade directly.
    await g.page.keyboard.press('Escape');
    const screen = await waitForReturn(g.page);
    assert.equal(screen, 'select-screen', 'Escape from the hub menu reaches the arcade select screen');

    // And the door itself is still fully functional afterward — re-entering
    // the wing from the arcade works, proving the escape chain left nothing
    // wedged.
    await g.page.keyboard.press('Space'); // door -> hub menu again
    await g.page.waitForTimeout(400);
    assert.equal(await readScreen(g.page), null, 'the door can be re-entered after a full escape chain — nothing left the wing wedged');
    await g.page.keyboard.press('Escape'); // menu -> arcade, tidy up
    await g.page.waitForTimeout(400);
    assert.equal(await readScreen(g.page), 'select-screen');
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors across the full test, saw:\n${g.consoleErrors.join('\n')}`);
  });

  test('Escape from the MAKER (YOUR OWN WORLD), before waking anything, still leaves the hub menu and arcade reachable', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 3); // YOUR OWN WORLD
    assert.equal(await readScreen(g.page), null, 'inside the maker, no standard .screen is visible');

    await typeCommand(g.page, 'tree'); // partial progress (one thing placed), not alive
    await g.page.keyboard.press('Escape');
    await g.page.waitForTimeout(300);
    assert.equal(await readScreen(g.page), null, 'Escape from the maker (not yet alive) lands on the hub menu');
    assert.deepEqual(g.consoleErrors, [], `Escape from the maker produced console errors:\n${g.consoleErrors.join('\n')}`);

    await g.page.keyboard.press('Escape');
    const screen = await waitForReturn(g.page);
    assert.equal(screen, 'select-screen', 'Escape from the hub menu reaches the arcade select screen');
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
  });

  test('an abandoned world (Escape with zero input typed) still leaves the hub menu reachable and the arcade reachable from it', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await g.page.keyboard.press('Space');
    await g.page.waitForTimeout(400);
    await g.page.keyboard.press('Enter'); // straight into a world, zero input typed
    await g.page.waitForTimeout(400);
    await g.page.keyboard.press('Escape'); // immediate escape — the very first input this session
    await g.page.waitForTimeout(300);
    assert.equal(await readScreen(g.page), null, 'an immediate Escape (no play at all) still lands cleanly on the hub menu');
    await g.page.keyboard.press('Escape');
    const screen = await waitForReturn(g.page);
    assert.equal(screen, 'select-screen', 'and a second immediate Escape reaches the arcade — no minimum-progress requirement to leave');
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
  });
});
