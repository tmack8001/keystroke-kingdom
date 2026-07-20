// ─── Tile world — a big ASCII overhead world engine (Act 6) ─────────────────
//
// The "see it in letters" engine: a large overhead world drawn in ASCII tiles,
// the MegaZeux / roguelike look (research/wiki/tech/ascii-overhead-world-
// conventions.md — the arcade-historian's cited grounding). World-agnostic — it
// consumes DATA (see tile-worlds.js), exactly as the prose engine.js consumes
// greendragon.js. Read two sibling modules (engine.js, maker.js) before editing:
// this copies engine.js's GUIDED PREFIX-MATCHER *pattern* (it does not import it —
// L40, each screen self-contained).
//
// THREE things make this a WORLD, not a maze (all grounded in the research page):
//   1. MOVEMENT IS TYPING. You never press a raw arrow — you TYPE a direction
//      (up/down/left/right, aliases n/s/e/w + north/south/east/west) through the
//      same guided prefix-matcher the rest of the wing uses. A wrong key is a
//      gentle nudge and the buffer WAITS — never advances, never punishes (the
//      One Rule). Colossal Cave / Zork / MUD precedent (research Q4): typing the
//      direction WAS the interaction. Movement is spelling practice.
//   2. FOG OF WAR. Roguelike lit/dark line-of-sight: unexplored tiles are hidden,
//      seen walls are remembered (dim), the area you can see is lit. A big map
//      becomes a place to DISCOVER, not a grid to cross (research Q2 — "the single
//      highest-value addition").
//   3. RIDDLE CREATURES. Authored NPCs (NO LLM, NO free-text generation — fixed
//      data) pose a gentle, always-solvable riddle; you step adjacent, read it, and
//      TYPE an answer (canvas-rendered only, length-capped, matched forgivingly).
//      Correct → a warm reaction + the way opens. Wrong → "hmm, try again" and,
//      after a couple tries, a hint (then the answer itself — never permanently
//      stuck). A riddle is ALWAYS optional/bonus: it can never block the only path
//      to the goal (research Q5 — the kid-safe Oracle/Doors-of-Durin shape).
//
// THE ONE RULE (product.md): walls stop you with a gentle nudge — no death, no
// loss, no timers, no wrong-answer penalty. You can only ever arrive.
//
// SECURITY (.claude/rules/security.md 1-3,6-8): movement is a FIXED direction
// allowlist (prefix-guarded — no free text can enter). The riddle answer is the
// one small free-text surface: it is allowlisted to letters at the boundary,
// length-capped, compared locally, NEVER stored and NEVER a DOM sink — it is drawn
// only with canvas fillText and thrown away. No PII, no network, no eval.
//
//   start(world, {onComplete}), stop(), handleKey(e), isActive(), hasWon()
//   world = { id, title, wallChar?, palette, glyphs, screens:[...], npcs:[...],
//             intro, wallLine, crossLine?, reveal:{kind,message,colors} }
//   screen = { map:[rows], exits:{ north?|south?|east?|west?: <screenIndex> } }
//   map markers: '@' start · '*' goal · '1'..'9' an NPC slot · 'G' a gate ·
//                everything else is looked up in world.glyphs (unknown → wall).

import * as Audio from '../audio.js';
import { buildPool, answerMatches, ANSWER_CAP, HINT_AT_TRY, REVEAL_AT_TRY } from './riddles.js';

// ─── Movement vocabulary (the guided prefix-matcher's allowlist) ────────────
// Full words are prefix-matched and auto-fire on an exact, unambiguous match; the
// single letters n/s/e/w fire instantly (the fast compass alias) and then quietly
// swallow the tail of the word they begin, so typing the full word 'north' still
// resolves to north exactly once. All four hands stay on the keyboard — this IS a
// typing rep (research Q4).
const WORDS = ['up', 'down', 'left', 'right', 'north', 'south', 'east', 'west'];
const DIRVEC = {
  up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1],
  north: [-1, 0], south: [1, 0], west: [0, -1], east: [0, 1],
};
const LETTER_DIR = { n: 'north', s: 'south', e: 'east', w: 'west' };
const HINT_WORDS = ['up', 'down', 'left', 'right'];   // the four shown as hints

const FOG_RADIUS = 5;      // roguelike torch reach (tiles)
// ANSWER_CAP / HINT_AT_TRY / REVEAL_AT_TRY now live in riddles.js — shared with
// the prose engine so both wings escalate hints (and cap the answer) identically.

let canvas, ctx, animId;
let active = false;
let onComplete = null;

let world = null;
let PAL = null;
let wallChar = '#';

let screens = [];   // [{ grid:[[ch]], ROWS, COLS, exits }]
let cur = 0;        // current screen index
let you = { r: 0, c: 0 };
let goal = null;    // { screen, r, c } | null
let npcs = [];      // resolved: { slot, screen, r, c, char, color, name, riddle, answers[], hint, gate?, reward?, solved }
let gatesOpen = null;   // Set of opened gate chars

let seen = [];      // per-screen Set of 'r,c' (remembered tiles)
let visible = null; // current screen Set of 'r,c' (lit right now)

let mode = 'move';  // 'move' | 'riddle'
let buf = '';       // movement command buffer
let swallow = '';   // tail of a compass word to quietly absorb after a letter alias
let activeNpc = null;
let activeRiddle = null;   // the pooled riddle the active NPC is currently posing
let dismissedNpc = null;   // an NPC whose riddle you stepped back from — don't re-pop
                           // until you actually walk out of its adjacency and return
let answer = '';
let tries = 0;

let message = '';
let won = false;
let winT = 0;
let motes = [];

let mastery = 0;    // successful moves — drives the hint fade
let hintBoostT = 0; // frames of forced-full hints (nudge / arrival / new screen)
let lastActMs = 0;
let nudgeT = 0;

export function isActive() { return active; }
export function hasWon() { return won; }   // for the hub: credit the win on any exit

export function start(w, opts = {}) {
  world = w;
  PAL = w.palette;
  wallChar = w.wallChar || '#';
  onComplete = typeof opts.onComplete === 'function' ? opts.onComplete : null;
  canvas = document.getElementById('invaders-canvas');
  ctx = canvas.getContext('2d');
  sizeCanvas();

  buildScreens();
  gatesOpen = new Set();
  seen = screens.map(() => new Set());
  visible = new Set();

  mode = 'move';
  buf = '';
  swallow = '';
  activeNpc = null;
  activeRiddle = null;
  dismissedNpc = null;
  answer = '';
  tries = 0;
  won = false;
  winT = 0;
  motes = [];
  mastery = 0;
  hintBoostT = 240;
  lastActMs = performance.now();
  nudgeT = 0;
  message = w.intro || 'Type a direction to move: up, down, left, right.';

  computeFog();
  active = true;
  animId = requestAnimationFrame(render);
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  world = null;
  onComplete = null;
  screens = [];
  npcs = [];
  seen = [];
  visible = null;
  gatesOpen = null;
}

// Parse each screen's map into a grid, pad ragged rows to a rectangle with the
// wall char (tolerant authoring), and pull out the markers (@ * digits) into
// engine state so the map source stays readable and coordinates never drift.
function buildScreens() {
  screens = [];
  npcs = [];
  goal = null;
  cur = 0;
  const defs = Array.isArray(world.npcs) ? world.npcs : [];
  (world.screens || []).forEach((s, si) => {
    const rowsIn = Array.isArray(s.map) ? s.map : [];
    const maxLen = rowsIn.reduce((m, r) => Math.max(m, r.length), 1);
    const grid = rowsIn.map((r) => (r + wallChar.repeat(Math.max(0, maxLen - r.length))).split(''));
    const ROWS = grid.length, COLS = maxLen;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const ch = grid[r][c];
        if (ch === '@') { you = { r, c }; cur = si; grid[r][c] = '.'; }
        else if (ch === '*') { goal = { screen: si, r, c }; grid[r][c] = '.'; }
        else if (ch >= '1' && ch <= '9') {
          const def = defs.find((n) => n.slot === Number(ch));
          // pool: the flat riddle stays index 0 (so a creature's own `.answers`
          // still opens it), and `more:[…]` rotates in behind it — `_ri` advances
          // on every open so a creature you revisit greets you with a new puzzle.
          if (def) npcs.push({ ...def, screen: si, r, c, solved: false, pool: buildPool(def), _ri: 0 });
          grid[r][c] = '.';   // the creature is drawn on top; floor lies beneath
        }
      }
    }
    screens.push({ grid, ROWS, COLS, exits: s.exits || {} });
  });
  if (!screens.length) screens.push({ grid: [['.']], ROWS: 1, COLS: 1, exits: {} });
}

// ─── Tile queries ───────────────────────────────────────────────────────────

function glyphSpec(ch) {
  const g = world.glyphs && world.glyphs[ch];
  if (g) return g;
  if (ch === '.') return { ch: '·', color: PAL.floor || '#243', walkable: true, opaque: false, alpha: 0.5 };
  // Unknown → treat as solid wall so nothing crashes and nothing is walk-through.
  return { ch: wallChar, color: PAL.wall || '#456', walkable: false, opaque: true };
}

function npcAt(si, r, c) {
  return npcs.find((n) => n.screen === si && n.r === r && n.c === c) || null;
}

function walkable(si, r, c) {
  const s = screens[si];
  if (!s || r < 0 || r >= s.ROWS || c < 0 || c >= s.COLS) return false;
  if (npcAt(si, r, c)) return false;               // creatures hold their tile
  const ch = s.grid[r][c];
  if (world.gates && world.gates.includes(ch)) return gatesOpen.has(ch);  // a closed gate blocks
  return glyphSpec(ch).walkable !== false;
}

function opaque(si, r, c) {
  const s = screens[si];
  if (!s || r < 0 || r >= s.ROWS || c < 0 || c >= s.COLS) return true;
  const ch = s.grid[r][c];
  if (world.gates && world.gates.includes(ch)) return !gatesOpen.has(ch);  // closed gate blocks sight
  return glyphSpec(ch).opaque === true;
}

// ─── Fog of war (roguelike lit/dark line-of-sight) ──────────────────────────

function computeFog() {
  visible = new Set();
  const s = screens[cur];
  const seenSet = seen[cur];
  const R = FOG_RADIUS;
  for (let dr = -R; dr <= R; dr++) {
    for (let dc = -R; dc <= R; dc++) {
      const r = you.r + dr, c = you.c + dc;
      if (r < 0 || r >= s.ROWS || c < 0 || c >= s.COLS) continue;
      if (dr * dr + dc * dc > R * R + R) continue;    // rough circle
      if (hasSight(you.r, you.c, r, c)) {
        const key = r + ',' + c;
        visible.add(key);
        seenSet.add(key);
      }
    }
  }
}

// Bresenham sight line: clear if no OPAQUE tile lies strictly between the two
// endpoints (the target itself may be an opaque wall — you can see the wall face).
function hasSight(r0, c0, r1, c1) {
  let dr = Math.abs(r1 - r0), dc = Math.abs(c1 - c0);
  let sr = r0 < r1 ? 1 : -1, sc = c0 < c1 ? 1 : -1;
  let err = dc - dr;
  let r = r0, c = c0;
  while (true) {
    if (r === r1 && c === c1) return true;
    if (!(r === r0 && c === c0) && opaque(cur, r, c)) return false;
    const e2 = 2 * err;
    if (e2 > -dr) { err -= dr; c += sc; }
    if (e2 < dc) { err += dc; r += sr; }
  }
}

// ─── Input ──────────────────────────────────────────────────────────────────

export function handleKey(e) {
  if (!active) return;
  if (won) { if (e.key === 'Enter' || e.key === ' ') finish(); return; }
  lastActMs = performance.now();
  if (mode === 'riddle') handleRiddleKey(e);
  else handleMoveKey(e);
}

function handleMoveKey(e) {
  const k = e.key;
  if (k === 'Backspace') { if (buf) { buf = buf.slice(0, -1); Audio.correct(); } return; }
  if (k === 'Enter') {
    if (buf && WORDS.includes(buf)) { const d = buf; buf = ''; swallow = ''; attemptMove(d); }
    return;
  }
  if (k.length !== 1) return;
  const ch = k.toLowerCase();
  if (ch === ' ') return;                  // Space is never a nudge here — just ignored
  if (!(ch >= 'a' && ch <= 'z')) return;   // ignore non-letters gently (no punish)

  // Tail-swallow: after a single-letter alias fired, quietly eat the rest of the
  // compass word the child may still be typing ('n' fired north → eat 'o','r','t','h').
  if (swallow && ch === swallow[0]) { swallow = swallow.slice(1); return; }
  swallow = '';

  // Single-letter compass alias fires instantly from an empty buffer.
  if (buf === '' && LETTER_DIR[ch]) {
    const d = LETTER_DIR[ch];
    swallow = d.slice(1);
    attemptMove(d);
    return;
  }

  const next = buf + ch;
  if (WORDS.some((t) => t.startsWith(next))) {
    buf = next;
    const exact = WORDS.includes(buf);
    const ambiguous = WORDS.some((t) => t !== buf && t.startsWith(buf));
    if (exact && !ambiguous) { const d = buf; buf = ''; attemptMove(d); }
    else { Audio.correct(); }   // an accepted, on-track keystroke feels responsive
    return;
  }

  // A key that breaks the prefix → gentle nudge; the buffer WAITS (One Rule).
  Audio.wrong();
  nudgeT = 12;
  hintBoostT = 200;
}

function attemptMove(dir) {
  buf = '';
  const v = DIRVEC[dir];
  const s = screens[cur];
  const tr = you.r + v[0], tc = you.c + v[1];

  // Off an edge → take that edge's exit if the screen has one, else a wall nudge.
  if (tr < 0 || tr >= s.ROWS || tc < 0 || tc >= s.COLS) {
    const edge = v[0] < 0 ? 'north' : v[0] > 0 ? 'south' : v[1] < 0 ? 'west' : 'east';
    const target = s.exits[edge];
    if (target != null && screens[target]) { crossTo(edge, target); return; }
    nudgeWall();
    return;
  }
  if (!walkable(cur, tr, tc)) { nudgeWall(); return; }

  you = { r: tr, c: tc };
  mastery++;
  Audio.correct();
  message = '';
  computeFog();
  checkArrival();
}

function nudgeWall() {
  Audio.wrong();
  nudgeT = 12;
  hintBoostT = 160;
  message = world.wallLine || 'You feel along for another way.';
}

// MegaZeux-style edge exit: leave off one edge, arrive at the matching edge of the
// linked screen, keeping the perpendicular coordinate (nearest walkable to it).
function crossTo(edge, target) {
  const keepRow = you.r, keepCol = you.c;
  cur = target;
  const s = screens[cur];
  let entry;
  if (edge === 'north') entry = nearestWalkableOnRow(s.ROWS - 1, keepCol);
  else if (edge === 'south') entry = nearestWalkableOnRow(0, keepCol);
  else if (edge === 'west') entry = nearestWalkableOnCol(s.COLS - 1, keepRow);
  else entry = nearestWalkableOnCol(0, keepRow);
  you = entry || anyWalkable(cur) || { r: 0, c: 0 };
  mastery++;
  Audio.correct();
  hintBoostT = 160;
  message = world.crossLine || '';
  computeFog();
  checkArrival();
}

function nearestWalkableOnRow(r, nearCol) {
  const s = screens[cur];
  for (let d = 0; d < s.COLS; d++) {
    for (const c of [nearCol - d, nearCol + d]) {
      if (c >= 0 && c < s.COLS && walkable(cur, r, c)) return { r, c };
    }
  }
  return null;
}
function nearestWalkableOnCol(c, nearRow) {
  const s = screens[cur];
  for (let d = 0; d < s.ROWS; d++) {
    for (const r of [nearRow - d, nearRow + d]) {
      if (r >= 0 && r < s.ROWS && walkable(cur, r, c)) return { r, c };
    }
  }
  return null;
}
function anyWalkable(si) {
  const s = screens[si];
  for (let r = 0; r < s.ROWS; r++) for (let c = 0; c < s.COLS; c++) if (walkable(si, r, c)) return { r, c };
  return null;
}

function checkArrival() {
  if (goal && goal.screen === cur && you.r === goal.r && you.c === goal.c) { triggerReveal(); return; }
  // A riddle you stepped back from only re-pops once you've truly left its side.
  if (dismissedNpc && !(dismissedNpc.screen === cur
    && Math.max(Math.abs(dismissedNpc.r - you.r), Math.abs(dismissedNpc.c - you.c)) === 1)) {
    dismissedNpc = null;
  }
  const npc = npcs.find((n) => n.screen === cur && !n.solved && n !== dismissedNpc
    && Math.max(Math.abs(n.r - you.r), Math.abs(n.c - you.c)) === 1);
  if (npc) openRiddle(npc);
}

// ─── Riddle creatures ─────────────────────────────────────────────────────────

function openRiddle(npc) {
  mode = 'riddle';
  activeNpc = npc;
  const pool = npc.pool && npc.pool.length ? npc.pool : buildPool(npc);
  activeRiddle = pool[npc._ri % pool.length];
  npc._ri++;                     // next visit rotates to the next puzzle
  answer = '';
  tries = 0;
  message = activeRiddle.riddle || '';
  Audio.coin();
}

// The riddle answer is the one free-text surface. It is allowlisted to letters at
// entry, length-capped, compared locally, never stored, never a DOM sink.
function handleRiddleKey(e) {
  const k = e.key;
  if (k === ' ') { closeRiddle(); return; }               // Space steps back out (never stuck)
  if (k === 'Backspace') { if (answer) { answer = answer.slice(0, -1); Audio.correct(); } return; }
  if (k === 'Enter') { submitAnswer(); return; }
  if (k.length !== 1) return;
  const ch = k.toLowerCase();
  if (ch >= 'a' && ch <= 'z' && answer.length < ANSWER_CAP) { answer += ch; Audio.correct(); }
  else { Audio.wrong(); nudgeT = 12; }
}

function submitAnswer() {
  if (answerMatches(activeRiddle, answer)) { solveNpc(activeNpc); return; }
  tries++;
  answer = '';
  Audio.wrong();
  nudgeT = 12;
  // message stays the riddle; the hint/answer is drawn from `tries` (see riddle panel)
}

function solveNpc(npc) {
  npc.solved = true;
  if (npc.gate && world.gates && world.gates.includes(npc.gate)) {
    gatesOpen.add(npc.gate);
    computeFog();
  }
  mode = 'move';
  activeNpc = null;
  answer = '';
  message = (activeRiddle && activeRiddle.reward)
    || 'The creature beams at you. "Yes! You have it. Go on — the way is open."';
  activeRiddle = null;
  Audio.levelComplete();
}

function closeRiddle() {
  dismissedNpc = activeNpc;
  mode = 'move';
  activeNpc = null;
  activeRiddle = null;
  answer = '';
  message = 'You step back. (Come say hello again any time — they always have a new riddle.)';
  Audio.correct();
}

// ─── The goal reveal ──────────────────────────────────────────────────────────

function triggerReveal() {
  won = true;
  winT = 0;
  const rev = world.reveal || {};
  message = rev.message || '';
  const colors = rev.colors && rev.colors.length ? rev.colors : ['#ffffff'];
  motes = [];
  const N = 150;   // scaled up for the bigger world (L35 — dark scenes swallow small effects)
  for (let i = 0; i < N; i++) {
    motes.push({
      x: 0.05 + Math.random() * 0.90,
      y: 0.10 + Math.random() * 0.64,
      vx: (Math.random() - 0.5) * 0.0006,
      phase: Math.random() * Math.PI * 2,
      color: colors[i % colors.length],
      size: 3 + Math.floor(Math.random() * 4),
    });
  }
  Audio.levelComplete();
}

function finish() { if (onComplete) { const cb = onComplete; onComplete = null; cb(); } }

// ─── Rendering ────────────────────────────────────────────────────────────────

function sizeCanvas() {
  if (!canvas) return;
  if (canvas.width !== window.innerWidth) canvas.width = window.innerWidth;
  if (canvas.height !== window.innerHeight) canvas.height = window.innerHeight;
}

function render() {
  if (!active) return;
  sizeCanvas();
  const W = canvas.width, H = canvas.height;

  ctx.fillStyle = PAL.bg;
  ctx.fillRect(0, 0, W, H);

  if (won) drawReveal(W, H);
  else drawWorld(W, H);
  drawChrome(W, H);
  drawScanlines(W, H);

  if (nudgeT > 0) nudgeT--;
  if (hintBoostT > 0) hintBoostT--;
  if (won) { winT++; if (winT === 330) finish(); }   // ~5.5s to savour, then walk out
  animId = requestAnimationFrame(render);
}

// A scrolling viewport (MegaZeux-style) centered on the player, so tiles stay big
// and readable no matter how large the screen's map is; fog hides the unexplored.
function viewport(W, H) {
  const s = screens[cur];
  const areaW = W * 0.94, areaH = H * 0.58;
  const maxCols = Math.min(s.COLS, 44), maxRows = Math.min(s.ROWS, 22);
  const cell = Math.max(14, Math.floor(Math.min(areaW / maxCols, areaH / maxRows)));
  const visCols = Math.min(s.COLS, Math.max(1, Math.floor(areaW / cell)));
  const visRows = Math.min(s.ROWS, Math.max(1, Math.floor(areaH / cell)));
  let camC = clamp(you.c - Math.floor(visCols / 2), 0, Math.max(0, s.COLS - visCols));
  let camR = clamp(you.r - Math.floor(visRows / 2), 0, Math.max(0, s.ROWS - visRows));
  const gw = visCols * cell, gh = visRows * cell;
  const ox = Math.round((W - gw) / 2);
  const oy = Math.round(H * 0.13);
  return { cell, visCols, visRows, camC, camR, ox, oy, s };
}

function drawWorld(W, H) {
  const vp = viewport(W, H);
  const { cell, visCols, visRows, camC, camR, ox, oy, s } = vp;
  const twinkle = 0.5 + 0.5 * Math.sin(performance.now() * 0.004);

  ctx.font = `${Math.round(cell * 0.82)}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const seenSet = seen[cur];
  for (let vr = 0; vr < visRows; vr++) {
    for (let vc = 0; vc < visCols; vc++) {
      const r = camR + vr, c = camC + vc;
      if (r < 0 || r >= s.ROWS || c < 0 || c >= s.COLS) continue;
      const key = r + ',' + c;
      const lit = visible.has(key);
      const known = seenSet.has(key);
      if (!lit && !known) continue;   // undiscovered — stays dark (fog of war)

      let ch = s.grid[r][c];
      let spec = glyphSpec(ch);
      // A gate that has been opened reads as floor.
      if (world.gates && world.gates.includes(ch) && gatesOpen.has(ch)) spec = glyphSpec('.');
      const cx = ox + vc * cell + cell / 2;
      const cy = oy + vr * cell + cell / 2;

      const baseAlpha = spec.alpha != null ? spec.alpha : 1;
      ctx.globalAlpha = lit ? baseAlpha : baseAlpha * 0.30;   // remembered tiles are dim
      ctx.fillStyle = spec.color;
      ctx.shadowColor = spec.color;
      ctx.shadowBlur = lit ? (spec.glow || 0) : 0;
      ctx.fillText(spec.ch || ch, cx, cy);
    }
  }

  // The goal glint, if it is on this screen and currently lit.
  if (goal && goal.screen === cur) {
    const key = goal.r + ',' + goal.c;
    if (visible.has(key) && inView(goal.r, goal.c, vp)) {
      const cx = ox + (goal.c - camC) * cell + cell / 2;
      const cy = oy + (goal.r - camR) * cell + cell / 2;
      ctx.globalAlpha = 0.4 + 0.6 * twinkle;
      ctx.fillStyle = PAL.glint;
      ctx.shadowColor = PAL.glint;
      ctx.shadowBlur = 14;
      ctx.fillText('*', cx, cy);
    }
  }

  // Creatures, when their tile is lit — the discovery of a face in the dark.
  for (const n of npcs) {
    if (n.screen !== cur) continue;
    const key = n.r + ',' + n.c;
    if (!visible.has(key) || !inView(n.r, n.c, vp)) continue;
    const cx = ox + (n.c - camC) * cell + cell / 2;
    const cy = oy + (n.r - camR) * cell + cell / 2;
    ctx.globalAlpha = 1;
    ctx.fillStyle = n.solved ? PAL.glint : (n.color || PAL.friend || '#7fffbf');
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 8;
    ctx.fillText(n.char || 'k', cx, cy);
    if (n.solved) {   // a tiny happy spark over a friend you've helped
      ctx.font = `${Math.round(cell * 0.4)}px "Press Start 2P", monospace`;
      ctx.fillStyle = PAL.glint;
      ctx.fillText('*', cx + cell * 0.34, cy - cell * 0.34);
      ctx.font = `${Math.round(cell * 0.82)}px "Press Start 2P", monospace`;
    }
  }

  // You — always at the lit center of your own little world.
  ctx.globalAlpha = 1;
  ctx.fillStyle = PAL.you;
  ctx.shadowColor = PAL.you;
  ctx.shadowBlur = 12;
  const px = ox + (you.c - camC) * cell + cell / 2;
  const py = oy + (you.r - camR) * cell + cell / 2;
  ctx.fillText('@', px, py);

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.textBaseline = 'alphabetic';
}

function inView(r, c, vp) {
  return r >= vp.camR && r < vp.camR + vp.visRows && c >= vp.camC && c < vp.camC + vp.visCols;
}
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

// The surprisingly-amazing reveal — scaled up for the bigger world, drawn with a
// 'lighter' composite so light actually blooms over the dark base (L35).
function drawReveal(W, H) {
  const grow = Math.min(1, winT / 55);
  const kind = (world.reveal && world.reveal.kind) || 'crystals';
  const t = performance.now() * 0.002;

  const bloom = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, Math.max(W, H) * 0.75);
  bloom.addColorStop(0, kind === 'fireflies' ? 'rgba(110,150,80,0.28)' : 'rgba(70,110,170,0.30)');
  bloom.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const s of motes) {
    if (kind === 'fireflies') {
      s.y -= 0.0007;
      s.x += Math.sin(t + s.phase) * 0.0005 + s.vx;
      if (s.y < 0.08) { s.y = 0.74; s.x = 0.05 + Math.random() * 0.90; }
      if (s.x < 0.03) s.x = 0.03; if (s.x > 0.97) s.x = 0.97;
    }
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(t + s.phase));
    const sz = s.size * grow * 1.6;   // ~3-4x first instinct (L35)
    const x = s.x * W, y = s.y * H;
    ctx.globalAlpha = tw * grow;
    ctx.fillStyle = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = (kind === 'fireflies' ? 16 : 12) * grow;
    if (kind === 'fireflies') {
      ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
    } else {
      ctx.fillRect(x - sz, y - 1.5, sz * 2, 3);       // a little crystal diamond
      ctx.fillRect(x - 1.5, y - sz, 3, sz * 2);
    }
  }
  ctx.restore();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // you, small, at the mouth of it, looking in
  ctx.font = `${Math.max(16, Math.floor(W * 0.022))}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = PAL.you;
  ctx.shadowColor = PAL.you;
  ctx.shadowBlur = 14;
  ctx.fillText('@', W / 2, H * 0.76);
  ctx.shadowBlur = 0;
  ctx.textBaseline = 'alphabetic';
}

// ─── Chrome: title, message, the movement hint / riddle panel ────────────────

function drawChrome(W, H) {
  const fs = Math.max(11, Math.floor(W * 0.013));
  ctx.font = `${fs}px "Press Start 2P", monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Title, top-left.
  ctx.fillStyle = won ? PAL.glint : (PAL.title || PAL.you);
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 6;
  ctx.fillText(world.title || '', Math.round(W * 0.06), Math.round(H * 0.05));
  ctx.shadowBlur = 0;

  if (won) { drawWinChrome(W, H, fs); return; }
  if (mode === 'riddle') { drawRiddlePanel(W, H, fs); return; }
  drawMoveChrome(W, H, fs);
  ctx.textBaseline = 'alphabetic';
}

function drawWinChrome(W, H, fs) {
  if (message) {
    const small = Math.max(9, Math.floor(fs * 0.82));
    ctx.font = `${small}px "Press Start 2P", monospace`;
    ctx.fillStyle = PAL.accent;
    ctx.globalAlpha = 0.95;
    wrap(message, W - Math.round(W * 0.12), small).forEach((line, i) => {
      ctx.fillText(line, Math.round(W * 0.06), Math.round(H * 0.80) + i * Math.round(small * 1.7));
    });
    ctx.globalAlpha = 1;
  }
  const small = Math.max(9, Math.floor(fs * 0.72));
  ctx.font = `${small}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.dim || '#567';
  ctx.globalAlpha = 0.8;
  ctx.fillText('SPACE / ENTER: back to the arcade', Math.round(W * 0.06), Math.round(H * 0.94));
  ctx.globalAlpha = 1;
  ctx.textBaseline = 'alphabetic';
}

function drawMoveChrome(W, H, fs) {
  // The current message (intro / a wall nudge / a warm reaction line).
  if (message) {
    const small = Math.max(9, Math.floor(fs * 0.82));
    ctx.font = `${small}px "Press Start 2P", monospace`;
    ctx.fillStyle = nudgeT > 0 ? '#d98a3f' : (PAL.accent || PAL.you);
    ctx.globalAlpha = 0.95;
    wrap(message, W - Math.round(W * 0.12), small).forEach((line, i) => {
      ctx.fillText(line, Math.round(W * 0.06), Math.round(H * 0.76) + i * Math.round(small * 1.7));
    });
    ctx.globalAlpha = 1;
  }

  // The typed movement buffer + a blinking cursor.
  const marginX = Math.round(W * 0.06);
  const promptY = Math.round(H * 0.86);
  ctx.font = `${fs}px "Press Start 2P", monospace`;
  const promptStr = '> ' + buf;
  ctx.fillStyle = nudgeT > 0 ? '#d98a3f' : (PAL.you || '#ffd23f');
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 8;
  ctx.fillText(promptStr, marginX, promptY);
  const cursorX = marginX + ctx.measureText(promptStr).width + 2;
  if (Math.floor(performance.now() / 500) % 2 === 0) ctx.fillRect(cursorX, promptY, Math.round(fs * 0.6), fs);
  ctx.shadowBlur = 0;

  // The direction hints, fading with mastery (always back on a nudge / new screen).
  const mode2 = hintMode();
  if (mode2 !== 'hidden') {
    const dim = mode2 === 'dim';
    const small = Math.max(9, Math.floor(fs * 0.72));
    ctx.font = `${small}px "Press Start 2P", monospace`;
    const hy = Math.round(H * 0.93);
    let x = marginX;
    ctx.globalAlpha = dim ? 0.3 : 0.75;
    ctx.fillStyle = PAL.dim || '#567';
    const label = dim ? '· ' : 'move:  ';
    ctx.fillText(label, x, hy); x += ctx.measureText(label).width;
    HINT_WORDS.forEach((wd, idx) => {
      if (idx > 0) {
        ctx.globalAlpha = dim ? 0.22 : 0.5;
        ctx.fillStyle = PAL.dim || '#567';
        const sep = '  ·  ';
        ctx.fillText(sep, x, hy); x += ctx.measureText(sep).width;
      }
      const matches = !dim && buf.length && wd.startsWith(buf);
      ctx.globalAlpha = dim ? 0.3 : (matches ? 1 : 0.7);
      ctx.fillStyle = matches ? (PAL.you || '#ffd23f') : (PAL.dim || '#567');
      ctx.fillText(wd, x, hy); x += ctx.measureText(wd).width;
    });
    ctx.globalAlpha = 1;
  }
  ctx.textBaseline = 'alphabetic';
}

function drawRiddlePanel(W, H, fs) {
  const npc = activeNpc;
  const r = activeRiddle || {};
  if (!npc) return;
  const panelY = Math.round(H * 0.66);
  const panelH = Math.round(H * 0.34);
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = 'rgba(6,10,16,0.92)';
  ctx.fillRect(0, panelY, W, panelH);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = npc.color || PAL.friend || '#7fffbf';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, panelY); ctx.lineTo(W, panelY); ctx.stroke();

  const marginX = Math.round(W * 0.06);
  let y = panelY + Math.round(H * 0.03);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Creature name.
  ctx.font = `${fs}px "Press Start 2P", monospace`;
  ctx.fillStyle = npc.color || PAL.friend || '#7fffbf';
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 6;
  ctx.fillText((npc.char ? npc.char + '  ' : '') + (npc.name || 'a creature') + ' asks:', marginX, y);
  ctx.shadowBlur = 0;
  y += Math.round(fs * 1.9);

  // Riddle text.
  const small = Math.max(10, Math.floor(fs * 0.85));
  ctx.font = `${small}px "Press Start 2P", monospace`;
  ctx.fillStyle = '#e7eef7';
  wrap(r.riddle || '', W - marginX * 2, small).forEach((line) => {
    ctx.fillText(line, marginX, y); y += Math.round(small * 1.6);
  });

  // Hint (after a couple tries) then the answer itself (after a few) — never stuck.
  if (tries >= HINT_AT_TRY && r.hint) {
    y += Math.round(small * 0.4);
    ctx.fillStyle = PAL.accent || '#ffd23f';
    ctx.globalAlpha = 0.9;
    let hint = 'hint: ' + r.hint;
    if (tries >= REVEAL_AT_TRY && r.answers && r.answers.length) {
      hint += '  (try: ' + r.answers[0] + ')';
    }
    wrap(hint, W - marginX * 2, small).forEach((line) => {
      ctx.fillText(line, marginX, y); y += Math.round(small * 1.6);
    });
    ctx.globalAlpha = 1;
  }

  // The answer line + blinking cursor.
  const ansY = panelY + panelH - Math.round(H * 0.10);
  ctx.font = `${fs}px "Press Start 2P", monospace`;
  ctx.fillStyle = nudgeT > 0 ? '#d98a3f' : (PAL.you || '#ffd23f');
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 8;
  const ans = '> ' + answer;
  ctx.fillText(ans, marginX, ansY);
  const cx = marginX + ctx.measureText(ans).width + 2;
  if (Math.floor(performance.now() / 500) % 2 === 0) ctx.fillRect(cx, ansY, Math.round(fs * 0.6), fs);
  ctx.shadowBlur = 0;

  const foot = Math.max(9, Math.floor(fs * 0.72));
  ctx.font = `${foot}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.dim || '#567';
  ctx.globalAlpha = 0.8;
  ctx.fillText('type a word, then ENTER   ·   SPACE: step back and keep exploring', marginX, ansY + Math.round(fs * 1.5));
  ctx.globalAlpha = 1;
  ctx.textBaseline = 'alphabetic';
}

function hintMode() {
  if (hintBoostT > 0) return 'full';
  if (performance.now() - lastActMs > 6000) return 'full';
  if (mastery < 3) return 'full';
  if (mastery < 8) return 'dim';
  return 'hidden';
}

function wrap(str, maxWidth, sz) {
  ctx.font = `${sz}px "Press Start 2P", monospace`;
  const out = []; let cur2 = '';
  for (const w of String(str).split(' ')) {
    const t = cur2 ? cur2 + ' ' + w : w;
    if (ctx.measureText(t).width <= maxWidth || !cur2) cur2 = t;
    else { out.push(cur2); cur2 = w; }
  }
  if (cur2) out.push(cur2);
  return out.length ? out : [''];
}

function drawScanlines(W, H) {
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
}
