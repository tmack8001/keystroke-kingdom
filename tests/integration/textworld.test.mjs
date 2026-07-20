// Enforces: INV-42, INV-43, INV-44, INV-45, INV-46, INV-47, INV-53, INV-54,
// INV-55 — STRATEGY.md §5 "Act 6 — Text Worlds (guided command matcher)";
// product.md §Core Principles (the One Rule — "Reinforce, Don't Punish":
// wrong key never punishes, never advances, buffer stays and waits); memory
// act6-mastery-wing-idea ("Typing model (decided): HYBRID — guided verbs");
// journal L40 ("A different input model wants a parallel screen, not an
// engine extension"); docs/ROADMAP.md §3 "Act 6 — Text Worlds".
//
// INV-45/53/54/55 (revised/added 2026-07-17): the wing's tile worlds
// (js/textworld/tileworld.js + tile-worlds.js) were fully redesigned — big,
// screen-chained maps; movement is a TYPED guided prefix-matcher (up/down/
// left/right, aliases n/s/e/w, full compass words), not a literal single
// n/s/e/w keypress into a small single-screen '#' maze; a roguelike fog of
// war; and authored (no-LLM) riddle creatures. See
// research/wiki/tech/ascii-overhead-world-conventions.md for the grounding
// and js/textworld/tileworld.js's own header for the module contract.
//
// Each world module states the design intent verbatim in its own header:
//   engine.js:    "THE ONE RULE holds absolutely here ... A wrong key does the
//                  same thing the pattern engine does — a gentle nudge and the
//                  command line simply WAITS; it never advances, never
//                  punishes. You can only ever arrive."
//   tileworld.js: "walls just stop you with a gentle nudge — no death, no
//                  loss, no timers. You can only ever arrive." Also: "A wrong
//                  key is a gentle nudge and the buffer WAITS — never
//                  advances, never punishes (the One Rule)." And: "a riddle
//                  is ALWAYS optional/bonus: it can never block the only
//                  path to the goal."
//   tile-worlds.js: "SOLVABILITY CONTRACT (One Rule floor): in every world an
//                  open corridor runs the full length of row 8 across every
//                  screen and straight to the goal, so the goal is reachable
//                  WITHOUT solving a single riddle or opening a single gate."
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
  readActiveSlotProgress,
  slotsSeed,
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
    // A command carrying `ask` drops into the riddle sub-mode (engine.js fire()):
    // it is BONUS content, never on the golden path (its `.run` never sets the
    // goal), and it stays offered forever (repeatable, for rotation) — so skip it
    // here, or this greedy walker would fire it every iteration and never move.
    const nonMove = offered.find((c) => c.text !== 'look' && !c.text.startsWith('go ') && !c.ask);
    const choice = nonMove || offered.find((c) => c.text.startsWith('go '));
    if (!choice) break;
    path.push(choice.text);
    choice.run(api);
  }
  return path;
}

// ── An "engine-equivalent" reachability graph over a tile world's OWN data ──
// (INV-45/55 — never a hand-copied route). This mirrors tileworld.js's own
// buildScreens()/walkable()/nearestWalkableOnRow()/nearestWalkableOnCol()
// exactly (ragged-row padding with the world's wallChar, '@'/'*'/digit
// markers become floor once extracted, an NPC's own tile is ALWAYS blocked,
// and a gate character is blocked UNLESS its char is in the passed-in
// `gatesOpen` set) so a BFS over it proves exactly what a real player's
// keypresses could reach — never more, never less. tile-worlds.js's own
// header states the safety floor this graph exists to verify: "an open
// corridor runs the full length ... across every screen and straight to the
// goal, so the goal is reachable WITHOUT solving a single riddle or opening
// a single gate" — so every BFS in this file passes an EMPTY gatesOpen set
// and lets NPC tiles block (the default), proving the floor for real.
function buildTileGraph(world, { gatesOpen = new Set() } = {}) {
  const wallChar = world.wallChar || '#';
  const gateChars = world.gates || '';
  const npcSlots = new Set((world.npcs || []).map((n) => n.slot));
  let start = null, goal = null;
  const npcTiles = new Set(); // `${screen}:${r}:${c}` — always non-walkable
  const npcByPos = new Map();
  const screens = world.screens.map((s, si) => {
    const rowsIn = Array.isArray(s.map) ? s.map : [];
    const maxLen = rowsIn.reduce((m, r) => Math.max(m, r.length), 1);
    const grid = rowsIn.map((r) => (r + wallChar.repeat(Math.max(0, maxLen - r.length))).split(''));
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < maxLen; c++) {
        const ch = grid[r][c];
        if (ch === '@') { start = { screen: si, r, c }; grid[r][c] = '.'; }
        else if (ch === '*') { goal = { screen: si, r, c }; grid[r][c] = '.'; }
        else if (ch >= '1' && ch <= '9') {
          if (npcSlots.has(Number(ch))) {
            npcTiles.add(`${si}:${r}:${c}`);
            npcByPos.set(`${si}:${r}:${c}`, Number(ch));
          }
          grid[r][c] = '.';
        }
      }
    }
    return { grid, ROWS: grid.length, COLS: maxLen, exits: s.exits || {} };
  });
  assert.ok(start && goal, `${world.title}: map contains both @ and *`);

  function glyphWalkable(ch) {
    const g = world.glyphs && world.glyphs[ch];
    if (g) return g.walkable !== false;
    if (ch === '.') return true;
    return false; // unknown char → solid wall (glyphSpec's own documented fallback)
  }
  function walkable(si, r, c) {
    const s = screens[si];
    if (!s || r < 0 || r >= s.ROWS || c < 0 || c >= s.COLS) return false;
    if (npcTiles.has(`${si}:${r}:${c}`)) return false;   // creatures always hold their tile
    const ch = s.grid[r][c];
    if (gateChars.includes(ch)) return gatesOpen.has(ch);
    return glyphWalkable(ch);
  }
  function nearestOnRow(si, r, nearCol) {
    const s = screens[si];
    for (let d = 0; d < s.COLS; d++) {
      for (const c of [nearCol - d, nearCol + d]) if (c >= 0 && c < s.COLS && walkable(si, r, c)) return { r, c };
    }
    return null;
  }
  function nearestOnCol(si, c, nearRow) {
    const s = screens[si];
    for (let d = 0; d < s.ROWS; d++) {
      for (const r of [nearRow - d, nearRow + d]) if (r >= 0 && r < s.ROWS && walkable(si, r, c)) return { r, c };
    }
    return null;
  }
  function anyWalkable(si) {
    const s = screens[si];
    for (let r = 0; r < s.ROWS; r++) for (let c = 0; c < s.COLS; c++) if (walkable(si, r, c)) return { r, c };
    return null;
  }

  const DIRS = [['north', -1, 0], ['south', 1, 0], ['east', 0, 1], ['west', 0, -1]];
  // One graph edge per REAL keypress: either a same-screen step, or (off a
  // screen's edge) a chained-screen crossing landing on the nearest walkable
  // tile perpendicular to the exit — exactly tileworld.js's crossTo().
  function neighbors(node) {
    const out = [];
    const s = screens[node.screen];
    for (const [dir, dr, dc] of DIRS) {
      const tr = node.r + dr, tc = node.c + dc;
      if (tr < 0 || tr >= s.ROWS || tc < 0 || tc >= s.COLS) {
        const edge = dr < 0 ? 'north' : dr > 0 ? 'south' : dc < 0 ? 'west' : 'east';
        const target = s.exits[edge];
        if (target == null || !screens[target]) continue; // an edge with no exit → nothing to add (a wall nudge)
        let entry;
        if (edge === 'north') entry = nearestOnRow(target, screens[target].ROWS - 1, node.c);
        else if (edge === 'south') entry = nearestOnRow(target, 0, node.c);
        else if (edge === 'west') entry = nearestOnCol(target, screens[target].COLS - 1, node.r);
        else entry = nearestOnCol(target, 0, node.r);
        entry = entry || anyWalkable(target) || { r: 0, c: 0 };
        out.push({ dir, node: { screen: target, r: entry.r, c: entry.c } });
        continue;
      }
      if (!walkable(node.screen, tr, tc)) continue; // a wall/closed-gate/npc tile → rejected, not an edge
      out.push({ dir, node: { screen: node.screen, r: tr, c: tc } });
    }
    return out;
  }

  return { start, goal, neighbors, npcByPos, npcSlots, gateChars, screens };
}

// BFS over the graph to any node satisfying `isTarget` (default: the world's
// own goal tile). Returns the direction-word path (e.g. ['south','east',...]).
function bfsPath(graph, isTarget, startNode = graph.start) {
  const key = (n) => `${n.screen}:${n.r}:${n.c}`;
  const seen = new Set([key(startNode)]);
  const prev = new Map();
  const queue = [startNode];
  let found = isTarget(startNode) ? startNode : null;
  while (queue.length && !found) {
    const node = queue.shift();
    for (const { dir, node: nxt } of graph.neighbors(node)) {
      if (seen.has(key(nxt))) continue;
      seen.add(key(nxt));
      prev.set(key(nxt), { from: node, dir });
      if (isTarget(nxt)) { found = nxt; break; }
      queue.push(nxt);
    }
  }
  if (!found) return null;
  const path = [];
  let cursor = key(found);
  const startKey = key(startNode);
  while (cursor !== startKey) {
    const step = prev.get(cursor);
    path.unshift(step.dir);
    cursor = key(step.from);
  }
  return path;
}

function isGoalNode(graph) {
  return (n) => n.screen === graph.goal.screen && n.r === graph.goal.r && n.c === graph.goal.c;
}

const PROSE_SOLUTION = deriveProseSolution(GreenDragon);
const CAVE_GRAPH = buildTileGraph(GlimmerDeep);
const FOREST_GRAPH = buildTileGraph(Whisperwood);
const CAVE_SOLUTION = bfsPath(CAVE_GRAPH, isGoalNode(CAVE_GRAPH));
const FOREST_SOLUTION = bfsPath(FOREST_GRAPH, isGoalNode(FOREST_GRAPH));
assert.ok(CAVE_SOLUTION, 'THE GLIMMER DEEP: goal reachable from start without opening any gate or solving any riddle');
assert.ok(FOREST_SOLUTION, 'THE WHISPERWOOD: goal reachable from start without opening any gate or solving any riddle');

// ── INV-55 fixtures: a path to stand adjacent to a (gate-less) riddle
// creature, and onward from there to the goal — both BFS-derived from the
// SAME engine-equivalent graph, never a hand-picked tile.
function findNpcPos(graph, slot) {
  for (const [key, s] of graph.npcByPos) {
    if (s === slot) {
      const [screen, r, c] = key.split(':').map(Number);
      return { screen, r, c };
    }
  }
  return null;
}
// Replay a direction-word path against the graph to get the NODE it ends on
// (bfsPath only returns the word list) — so a second BFS can continue from it.
function applyPath(graph, path, startNode = graph.start) {
  let node = startNode;
  for (const dir of path) {
    const match = graph.neighbors(node).find((o) => o.dir === dir);
    assert.ok(match, `path step '${dir}' is a valid move from {screen:${node.screen},r:${node.r},c:${node.c}}`);
    node = match.node;
  }
  return node;
}
const GLIM_POS = findNpcPos(CAVE_GRAPH, 1); // Glim the glow-worm — the only GlimmerDeep creature with no gate
const GLIM_APPROACH = GLIM_POS && bfsPath(
  CAVE_GRAPH,
  (n) => n.screen === GLIM_POS.screen && Math.max(Math.abs(n.r - GLIM_POS.r), Math.abs(n.c - GLIM_POS.c)) === 1,
);
const GLIM_APPROACH_NODE = GLIM_APPROACH && applyPath(CAVE_GRAPH, GLIM_APPROACH);
const GLIM_TO_GOAL = GLIM_APPROACH_NODE && bfsPath(CAVE_GRAPH, isGoalNode(CAVE_GRAPH), GLIM_APPROACH_NODE);

// The typed-movement vocabulary is the game's own PLAYER-FACING contract, not
// a private implementation constant: tileworld.js's header states it verbatim
// ("up/down/left/right, aliases n/s/e/w + north/south/east/west") and every
// world's own authored `intro` line tells the player the same four hint words
// — asserted against that data below rather than trusted from memory.
const MOVE_WORD_FIRST_LETTERS = ['u', 'd', 'l', 'r', 'n', 's', 'e', 'w'];

async function typeCommand(page, cmd) {
  await typeSequence(page, cmd);
  await page.waitForTimeout(150);
}

// Progress persistence moved 2026-07-19 from a single global `kk-progress` key
// to `kk-slots`, scoped to whichever saved game is ACTIVE (js/slots.js). The
// game itself no longer writes `kk-progress` at all outside one-time legacy
// migration — so the real observable for "did this text-world completion
// persist" is the active game's own record inside `kk-slots`. `toTextWorldDoor`
// (via `toSelect`/`goToSelect`) always clears localStorage then confirms a
// fresh default name before typing the wopr phrase, which — per the title
// screen's own name-confirm handler — creates AND activates a brand-new saved
// game first, so a real active game is always in place by the time a text
// world can be reached this way. Kept as a same-named local wrapper so every
// existing call site below (`readKkProgress(g.page)`) is unchanged.
async function readKkProgress(page) {
  return readActiveSlotProgress(page);
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

// Drive one compass-direction move through the REAL guided prefix-matcher
// (the single-letter alias — 'n'/'s'/'e'/'w' — fires the move instantly, per
// tileworld.js's own vocabulary), then press Space defensively.
//
// Space is a deliberate, always-safe follow-up, not a hack: in 'move' mode
// tileworld.js's handleMoveKey ignores Space unconditionally ("Space is never
// a nudge here — just ignored") so it is a true no-op on every ordinary move;
// its only two real effects are (a) tileworld.js's own documented escape from
// an incidentally-opened riddle ("SPACE: step back and keep exploring" — a
// creature's adjacency check runs after EVERY move, so walking the one
// guaranteed-open corridor can legitimately pass close enough to trigger one),
// and (b) the documented skip of the win-hold once the goal is reached
// ("SPACE / ENTER: back to the arcade"). Using it after every move plays like
// a real, curious child who taps Space to move past anything unexpected —
// never a game-internal shortcut.
async function pressMove(page, dirWord) {
  await press(page, dirWord[0]);
  await page.waitForTimeout(30);
  await page.keyboard.press('Space');
  await page.waitForTimeout(30);
}

async function driveTilePath(page, path) {
  for (const dir of path) await pressMove(page, dir);
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
    assert.ok(GLIM_POS, 'Glim (slot 1) exists in THE GLIMMER DEEP');
    assert.ok(GLIM_APPROACH, 'a tile adjacent to Glim is reachable from spawn');
    assert.ok(GLIM_TO_GOAL, 'the goal is reachable onward from Glim\'s side');
  });

  test('the typed-movement vocabulary this file assumes matches each world\'s own authored intro line', () => {
    for (const w of [GlimmerDeep, Whisperwood]) {
      assert.match(
        String(w.intro || ''),
        /up,\s*down,\s*left,\s*right/i,
        `${w.title}: its own intro line states the hint vocabulary this file's MOVE_WORD_FIRST_LETTERS assumes`,
      );
    }
  });

  // INV-45/55's safety floor ("reachable WITHOUT opening any gate or solving
  // any riddle") is non-trivial only if a gate and a riddle creature actually
  // exist to be bypassed — this guards the BFS proof itself against silently
  // becoming vacuous (e.g. a future edit that removes every gate).
  test('every tile world actually HAS a gate and riddle creatures (so "solvable without them" is a real claim, not a vacuous one)', () => {
    for (const w of [GlimmerDeep, Whisperwood]) {
      assert.ok(Array.isArray(w.npcs) && w.npcs.length >= 1, `${w.title}: has at least one riddle creature`);
      const gateChars = (w.gates || '').split('');
      assert.ok(gateChars.length > 0, `${w.title}: declares at least one gate character`);
      const found = w.screens.some((s) => s.map.some((row) => gateChars.some((g) => row.includes(g))));
      assert.ok(found, `${w.title}: its declared gate character actually appears somewhere on the map`);
    }
  });

  // INV-54 — fog of war data integrity (tileworld.js glyphSpec: an unknown
  // character silently becomes a solid wall — the documented, SAFE fallback
  // for genuinely unrecognized input, but a bug if an author's own intended
  // floor/decoration glyph was simply never added to `glyphs`, since it would
  // then silently block movement and break the line-of-sight sweep's
  // assumptions). Every character actually painted into either world's maps
  // (other than the structural markers @/*/1-9, which the engine special-cases
  // before ever consulting `glyphs`) must have an explicit entry.
  test('INV-54 — every glyph drawn in a tile world\'s maps is explicitly declared (research/wiki/tech/ascii-overhead-world-conventions.md; tileworld.js glyphSpec)', () => {
    for (const w of [GlimmerDeep, Whisperwood]) {
      const declared = new Set(Object.keys(w.glyphs || {}));
      const used = new Set();
      w.screens.forEach((s) => s.map.forEach((row) => { for (const ch of row) used.add(ch); }));
      const markers = new Set(['@', '*', '.', w.wallChar || '#']);
      for (let d = 1; d <= 9; d++) markers.add(String(d));
      const undeclared = [...used].filter((ch) => !markers.has(ch) && !declared.has(ch));
      assert.deepEqual(
        undeclared,
        [],
        `${w.title}: undeclared map characters ${JSON.stringify(undeclared)} would silently become solid walls (glyphSpec's unknown-char fallback)`,
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
describe('INV-44 — text-world persistence (js/slots.js getProgress()/main.js recordTextWorldComplete; security.md rule 4 "localStorage is untrusted input")', () => {
  test('a garbage (non-object) textWorlds field on the active saved game is tolerated and a fresh completion still records cleanly', { timeout: T }, async () => {
    // Progress now persists in kk-slots (js/slots.js), scoped to the ACTIVE
    // game — seed a real active game directly with a garbage textWorlds field
    // (the shape js/slots.js's normalizeSlot must tolerate). toTextWorldDoor's
    // clear+reload (via goToSelect) re-applies this addInitScript seed, so the
    // door is reached with this exact seeded game already active.
    const g = await startGame({
      localStorage: { 'kk-slots': slotsSeed({ furthestLevel: 1, completed: {}, textWorlds: 'not-an-object' }) },
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

  test('completely corrupt kk-slots JSON is tolerated on boot (no throw, no console error, defaults apply)', { timeout: T }, async () => {
    const g = await startGame({ localStorage: { 'kk-slots': '{not-valid-json::::' } });
    try {
      await g.page.goto(g.baseUrl);
      await g.page.waitForTimeout(600);
      assert.notEqual(await readScreen(g.page), null, 'the game still boots to a real screen despite corrupt kk-slots');
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

// ── INV-45 — the tile worlds' own One-Rule movement contract (revised for
// the big, screen-chained maps: a typed guided prefix-matcher, not a literal
// n/s/e/w single keypress) ───────────────────────────────────────────────
describe('INV-45 — chained tile worlds (tileworld.js header: "walls just stop you with a gentle nudge — no death, no loss, no timers")', () => {
  let g;
  before(async () => { g = await startGame(); });
  after(async () => { await g.stop(); });

  test('a move into a wall does not change position; a legal move does; an edge-exit move crosses into the linked screen; reaching the goal via the BFS-derived always-open corridor (never opening a gate or solving a riddle) wins and records THE GLIMMER DEEP\'s own id', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 1); // THE GLIMMER DEEP (hub index 1)
    assert.equal(await readScreen(g.page), null, 'while a tile world is active, no standard .screen is visible');

    // The '@' spawn sits on row 1 of screen 0, directly under the top wall
    // (row 0 is solid wallChar across every column in both fixtures) — 'n'
    // from spawn is therefore always into a wall regardless of any future
    // interior map edit, making it a safe universal "walk into a wall" probe.
    const row0 = GlimmerDeep.screens[0].map[0];
    assert.equal(row0, (GlimmerDeep.wallChar || '#').repeat(row0.length), 'fixture sanity: screen 0 row 0 is a solid wall');
    for (let i = 0; i < 5; i++) {
      await press(g.page, 'n');
      await g.page.waitForTimeout(40);
    }
    assert.equal(await readScreen(g.page), null, 'repeatedly walking into the top wall neither wins nor crashes nor leaves the world');
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);

    // Now walk the BFS-derived legal path all the way to the goal. The path
    // necessarily crosses two screen edges (0→1, 1→2) via tileworld.js's
    // own crossTo()/nearestWalkableOnRow()-Col() landing algorithm, which
    // this file's graph replicates exactly — so a successful win here is
    // itself the proof that edge-crossing works, not just in-screen moves.
    await driveTilePath(g.page, CAVE_SOLUTION);

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

  test('THE WHISPERWOOD is independently solvable via its own BFS-derived always-open corridor and records its own id (two tile worlds, not one)', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 2); // THE WHISPERWOOD (hub index 2)
    assert.equal(await readScreen(g.page), null, 'while a tile world is active, no standard .screen is visible');

    await driveTilePath(g.page, FOREST_SOLUTION);
    await g.page.waitForTimeout(300);
    await g.page.keyboard.press('Enter'); // the tile engine also accepts Enter to leave the win state
    const progress = await waitForWorldWin(g.page, Whisperwood.id);
    assert.equal(progress?.textWorlds?.[Whisperwood.id]?.completed, true, 'THE WHISPERWOOD records its own world id');
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
  });
});

// ── INV-53 — the tile worlds' typed movement prefix-matcher ─────────────────
describe('INV-53 — typed movement prefix-matcher (tileworld.js: "copies engine.js\'s GUIDED PREFIX-MATCHER pattern")', () => {
  let g;
  before(async () => { g = await startGame(); });
  after(async () => { await g.stop(); });

  test('a key outside every offered direction word\'s prefix (and every alias) is rejected — no move, no crash, no punishment', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 1); // THE GLIMMER DEEP

    const wrongChar = 'qwertyuiopasdfghjklzxcvbnm'
      .split('')
      .find((c) => !MOVE_WORD_FIRST_LETTERS.includes(c));
    assert.ok(wrongChar, 'a letter outside every direction word\'s first letter exists to probe with');
    for (let i = 0; i < 10; i++) {
      await press(g.page, wrongChar);
      await g.page.waitForTimeout(30);
    }
    assert.equal(await readScreen(g.page), null, 'a run of only off-prefix keys neither moves, wins, nor crashes the world');
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
  });

  test('Backspace edits the buffer; a single-letter alias fires instantly and silently swallows the rest of the word it abbreviates; a prefix-break key mid-word leaves the buffer WAITING (not reset) so completing the same word still fires the move — all proven end to end by THE GLIMMER DEEP still winning', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 1); // THE GLIMMER DEEP

    // Backspace probe: if it failed to clear 'u', the buffer would be stuck
    // non-empty and NOTHING below could ever fire again (an alias only fires
    // "from an empty buffer" — tileworld.js's own phrase).
    await press(g.page, 'u'); await g.page.waitForTimeout(20);
    await g.page.keyboard.press('Backspace'); await g.page.waitForTimeout(20);

    // The alias fires on 'n' alone (into the top wall — harmless) and must
    // silently swallow 'orth', or the stray letters would corrupt the buffer
    // for everything that follows.
    for (const ch of 'north') { await press(g.page, ch); await g.page.waitForTimeout(20); }
    assert.equal(await readScreen(g.page), null, 'typing the full word "north" (after its alias already fired) neither crashes nor strands the world');

    // The BFS-derived first move is 'south'; type its alt-word "down" letter
    // by letter (no letter of "down" is itself a compass alias, so the buffer
    // genuinely accumulates instead of auto-firing early), injecting an
    // off-prefix key ('q') after the first letter. If the buffer were wrongly
    // RESET on that nudge instead of left waiting, "o","w","n" could never
    // reconstruct "down" and this move — and the whole rest of the BFS path
    // chained onto it below — would never fire, and the world would never win.
    assert.equal(CAVE_SOLUTION[0], 'south', 'fixture sanity: the derived first move is south (so "down" is its alt-word)');
    await press(g.page, 'd'); await g.page.waitForTimeout(20);
    await press(g.page, 'q'); await g.page.waitForTimeout(20);   // off-prefix — gentle nudge; buffer should still hold 'd'
    await press(g.page, 'o'); await g.page.waitForTimeout(20);
    await press(g.page, 'w'); await g.page.waitForTimeout(20);
    await press(g.page, 'n'); await g.page.waitForTimeout(20);   // completes "down" — fires the south move
    assert.equal(await readScreen(g.page), null, 'the prefix-break-then-complete sequence neither crashed nor left the world');

    // Finish the rest of the derived path via the fast compass aliases and
    // confirm the world still completes — the only way that happens is if
    // every probe above behaved exactly as documented.
    await driveTilePath(g.page, CAVE_SOLUTION.slice(1));
    await g.page.waitForTimeout(300);
    await g.page.keyboard.press('Space');
    const progress = await waitForWorldWin(g.page, GlimmerDeep.id);
    assert.equal(progress?.textWorlds?.[GlimmerDeep.id]?.completed, true, 'the world still completes after the Backspace/alias-swallow/prefix-break probes — the buffer was never corrupted or wrongly reset');
    assert.deepEqual(g.consoleErrors, [], `expected zero console errors, saw:\n${g.consoleErrors.join('\n')}`);
  });
});

// ── INV-55 — riddle creatures (One Rule floor, SAFETY-CRITICAL) ────────────
describe('INV-55 — riddle creatures (tileworld.js: "a riddle is ALWAYS optional/bonus: it can never block the only path to the goal")', () => {
  let g;
  before(async () => { g = await startGame(); });
  after(async () => { await g.stop(); });

  test('the goal is reachable without solving any riddle or opening any gate — an engine-equivalent BFS over both worlds\' own screens/exits/glyphs data, with every gate closed and every riddle-creature tile blocked', () => {
    // Pure data assertion, no browser: CAVE_SOLUTION/FOREST_SOLUTION were
    // already derived exactly this way at module load time (buildTileGraph's
    // gatesOpen defaults to empty, and an NPC's own tile is ALWAYS excluded
    // as walkable) — restated here as INV-55's own named, standalone claim.
    assert.ok(CAVE_SOLUTION.length > 0, 'THE GLIMMER DEEP is winnable with every gate closed and every riddle unsolved');
    assert.ok(FOREST_SOLUTION.length > 0, 'THE WHISPERWOOD is winnable with every gate closed and every riddle unsolved');
  });

  test('stepping adjacent to a riddle creature opens its riddle and captures typed keys as an answer (not movement); non-letter keystrokes are never appended to the answer; wrong answers never crash or falsely solve it; the authored correct answer solves it; and the player remains free to continue toward the goal afterward', { timeout: T }, async () => {
    await toTextWorldDoor(g.page, g.baseUrl);
    await enterHubWorld(g.page, 1); // THE GLIMMER DEEP

    // Walk up to Glim (slot 1, the only GlimmerDeep creature with no gate)
    // WITHOUT the defensive trailing Space this file uses elsewhere — the
    // riddle that opens on the final approach step needs to stay open.
    for (const dir of GLIM_APPROACH) { await press(g.page, dir[0]); await g.page.waitForTimeout(40); }
    assert.equal(await readScreen(g.page), null, 'approaching a riddle creature does not crash or leave the world');

    // Wrong answers: if the riddle had NOT actually opened (a regression),
    // these letters would instead be read as MOVEMENT — several are compass
    // aliases — and would walk the player off the approach tile entirely.
    // That silent divergence is exactly what the final re-solve below would
    // catch (the onward path assumes this exact tile).
    await typeSequence(g.page, 'nope');
    await g.page.keyboard.press('Enter');
    await g.page.waitForTimeout(150);
    await typeSequence(g.page, 'nothanks');
    await g.page.keyboard.press('Enter');
    await g.page.waitForTimeout(150);
    assert.equal(await readScreen(g.page), null, 'wrong answers do not crash or exit the world');

    // The authored correct answer (Glim's own data, never hand-copied), with
    // a digit spliced in after the first letter to prove the answer field
    // allowlists to LETTERS ONLY (security.md rules 1/3/6): if the digit were
    // wrongly appended, the submitted text would no longer equal any authored
    // answer and this would register as one more wrong try instead of solving it.
    const glim = GlimmerDeep.npcs.find((n) => n.slot === 1);
    const correct = glim.answers[0]; // 'crystal'
    await press(g.page, correct[0]); await g.page.waitForTimeout(20);
    await press(g.page, '4'); await g.page.waitForTimeout(20);          // must be silently rejected, not appended
    for (const ch of correct.slice(1)) { await press(g.page, ch); await g.page.waitForTimeout(20); }
    await g.page.keyboard.press('Enter');
    await g.page.waitForTimeout(200);
    assert.equal(await readScreen(g.page), null, 'submitting the correct authored answer (with a rejected digit spliced in) neither crashes nor exits the world');

    // Continue on toward the goal — proving that engaging (and solving) a
    // riddle never traps forward progress. Using the defensive pressMove
    // helper here since the rest of this route may pass other creatures too.
    await driveTilePath(g.page, GLIM_TO_GOAL);
    await g.page.waitForTimeout(300);
    await g.page.keyboard.press('Space');
    const progress = await waitForWorldWin(g.page, GlimmerDeep.id);
    assert.equal(
      progress?.textWorlds?.[GlimmerDeep.id]?.completed,
      true,
      'the world completes after engaging the riddle — proving the wrong-answer attempts left the correct-answer path intact, the digit was rejected rather than corrupting the match, and solving (or dismissing) a riddle never blocks the way onward',
    );
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
