// Level 8: Tetris (Pajitnov / Nintendo, 1984)
//
// DESIGN (Trevor, 2026-07-12): the win is a CONJUNCTION and the winning MOMENT
// is always a line clear.
//
//   WIN = (completed letter sequences >= MIN_SEQUENCES)
//         AND (rows cleared >= MIN_ROWS)
//         AND the current placement just CLEARED a row.
//
// House philosophy: "the winning moment is the first game-objective beat after
// the minimums are met." So the level ends on a satisfying row-completion, never
// on a bare piece-lock. Each completed word places one piece; typing steadily
// clears rows as spectacle; when both minimums hold, placement biases toward
// completing the next row and THAT clear is the win. Guaranteed reachable within
// Level 8's pattern pool with margin (journal L4: guaranteed beats probabilistic).
//
// GRAVITY (Trevor playtest, 2026-07-12): the piece is no longer a frozen glyph
// that only teleports on a keystroke. It RELEASES from the top and FALLS
// CONTINUOUSLY, drifting one column at a time toward its intended placement —
// like a real Tetris player tapping left/right. Typing is the only input the
// theme sees (themes never read raw keys): a correct keystroke nudges the fall,
// and completing a letter SEQUENCE fast-drops the piece to its placement and
// counts toward the win exactly as before. A slow typist's piece just lands
// organically where gravity takes it — no punishment. The ENGAGEMENT GATE
// (journal L20) means a NEW piece releases only if a keystroke happened in the
// last ~10s; an unattended tab lets the in-flight piece finish, then the board
// holds calmly and never stacks/wipes/fills on its own.

import { getWinRatio } from '../settings.js';

let canvas, ctx;
let animId = null, active = false, victoryMode = false;
let frame = 0;

// ── Win gate: BOTH a sequence minimum AND a rows-cleared minimum ─────────────
let sequencesPlaced = 0;
let linesCleared = 0;          // rows cleared (both spectacle AND half the gate)
const BASE_MIN_SEQUENCES = 8;  // primary, binding constraint at plausible play (1x)
// EXPERIENCE win-ratio scales the SEQUENCE target (more words to type) but NOT
// MIN_ROWS — rows are spectacle pacing, not the difficulty knob. Resolved fresh
// at start() so a mid-session settings change takes effect next play. The engine
// refills its pattern pool infinitely, so any scaled target stays reachable.
let MIN_SEQUENCES = BASE_MIN_SEQUENCES;
const MIN_ROWS = 4;            // raised above the old 3 — clears come fast now
let hasWon = false;            // latched on the winning clear; won stays won
let survivalMode = false;      // Adventure wipes on overflow; Survival fills

// Grid: 10 cols × 16 rows.
const COLS = 10, ROWS = 16;
let grid = [];        // 2D array of color strings or null
let piece = null;     // the currently-falling piece (visual, y is a float in cells)
let nextPiece = null; // the piece that will actually spawn next (shown in NEXT)
let clearFlash = [];  // rows currently flashing for clear animation
let clearTimer = 0;
let dropFlash = 0;
let score = 0;
let bits = [];         // small square debris particles from line clears
let bgBlocks = [];     // precomputed dim background skyline blocks (dithered)
let wipeFlash = 0;     // frames of ambient glow while an overflow wipe settles
let W = 0, H = 0;
let CELL = 0, GRID_X = 0, GRID_Y = 0;

// ── Gravity / lifecycle timing ───────────────────────────────────────────────
// Time is tracked in ms via performance.now() so pace is frame-rate independent.
// Rest pace: one cell every ~0.65s — era-authentic, readable for a young player.
const FALL_MS_PER_CELL = 650;       // gravity: seconds-per-cell at rest
const DRIFT_MS_PER_STEP = 130;      // lateral: one column step this often
const NUDGE_FALL_MS = 90;           // a correct keystroke shaves this off the fall clock
const RELEASE_DELAY_MS = 700;       // gap after a lock before the next piece releases
const ENGAGEMENT_MS = 10000;        // no new piece unless a key came in this window
let lastKeyMs = 0;                   // when the last keystroke arrived
let fallAccMs = 0;                   // accumulated ms toward the next gravity cell-step
let driftAccMs = 0;                  // accumulated ms toward the next lateral step
let releaseAtMs = 0;                 // earliest time the next piece may release (0 = ready)
let lastTickMs = 0;                  // previous render timestamp (for delta)

// ── Victory celebration (Game Boy Tetris 1989 rocket launch) ─────────────────
const VICTORY_MS = 3500;             // total celebration duration
const VICTORY_CLEAR_MS = 900;        // bottom-up board flash-clear window
let victoryStartMs = 0;              // performance.now() when victory() fired
let rocket = null;                   // { x, y } in canvas px — the lifting rocket
let exhaust = [];                    // bounded exhaust-trail particle pool

// Only the two tetrominoes that tile a 10-wide row with no holes — the I (four
// across) and the O (a 2×2 square): 4+4+2 = 10. Restricting to these keeps the
// well fillable to clean, complete rows without rotation, which reads as
// minimalist Tetris (the level spec's own "less is more" palette cleanser).
const SHAPE_I = [[1, 1, 1, 1]];   // width 4
const SHAPE_O = [[1, 1], [1, 1]]; // width 2

// Rotating colour bag so consecutive pieces stay visually distinct, cycling the
// full classic Tetris palette even though only two shapes are used.
const COLORS = ['#00ffff', '#ffff00', '#cc00ff', '#ff8800', '#0044ff', '#00ff44', '#ff2222'];
let colorCycle = 0;

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

// Read the play style once, read-only, tolerating any garbage (security rule 4).
// Themes don't import settings; this is the one datum Tetris needs to know.
function readSurvival() {
  try {
    const s = JSON.parse(localStorage.getItem('kk-settings'));
    return !!(s && s.playStyle === 'survival');
  } catch (e) {
    return false;
  }
}

function computeLayout() {
  W = canvas.width; H = canvas.height;
  CELL = Math.min(Math.floor(H * 0.80 / ROWS), Math.floor(W * 0.34 / COLS));
  CELL = Math.max(CELL, 16);
  GRID_X = Math.floor((W - COLS * CELL) / 2);
  GRID_Y = Math.floor((H - ROWS * CELL) / 2);
  buildSkyline();
}

// A faint dithered skyline silhouette in the margins — deliberately minimal
// (this level is the "palette cleanser"), built once, never per-frame.
function buildSkyline() {
  bgBlocks = [];
  let x = 0;
  while (x < W) {
    const w = 20 + Math.floor(Math.random() * 30);
    const h = 20 + Math.floor(Math.random() * 90);
    bgBlocks.push({ x, w, h });
    x += w + 4;
  }
}

function initGrid() {
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

// ── Piece selection & placement ──────────────────────────────────────────────

// Column heights: how tall the settled stack is in each column.
function columnHeights() {
  const heights = new Array(COLS).fill(0);
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      if (grid[r][c]) { heights[c] = ROWS - r; break; }
    }
  }
  return heights;
}

// The optimal landing column for a shape: the leftmost gap in the lowest
// incomplete row. Filling the fill-line left-to-right completes each row before
// starting the next.
function optimalTargetX(shape) {
  const heights = columnHeights();
  const minH = Math.min(...heights);
  let x = 0;
  while (x < COLS && heights[x] > minH) x++;
  if (x >= COLS) x = 0;
  return Math.min(x, COLS - shape[0].length);
}

// Choose the next piece's SHAPE from the current fill-line: a 4-wide run of
// lowest columns wants an I; anything narrower wants an O. This is what makes
// rows actually complete.
function pickNextShape() {
  const heights = columnHeights();
  const minH = Math.min(...heights);
  let x = 0;
  while (x < COLS && heights[x] > minH) x++;
  if (x >= COLS) x = 0;
  let run = 0;
  while (x + run < COLS && heights[x + run] === minH) run++;
  return (run >= 4 && x + 4 <= COLS) ? SHAPE_I : SHAPE_O;
}

// Build a piece: its shape is chosen to keep rows completing; it spawns centred
// at the top and drifts toward a target column resolved at build time (and
// re-resolved as the stack changes). colorIdx cycles the palette. `y` is a
// float measured in cells (0 = top row) so gravity can interpolate smoothly and
// always land grid-aligned.
function makePiece() {
  const shape = pickNextShape();
  const startX = Math.min(COLS - shape[0].length, Math.max(0, Math.floor(COLS / 2) - 1));
  const colorIdx = colorCycle % COLORS.length;
  colorCycle++;
  return { shape, colorIdx, x: startX, y: 0, targetX: chooseTargetX(shape) };
}

// The AUTHORITATIVE placement column a released piece drifts toward AND locks
// at. It is always the leftmost gap of the lowest incomplete row (a clean
// left-to-right fill), so the stack is guaranteed gap-free — a piece can never
// land leaving a hole underneath it. The visual drift/gravity are flavor; the
// lock always snaps to this column (see lockPiece), which is what makes rows
// actually complete and clear instead of scattering into a holey stack. (The
// former "occasional random alternate landing" is gone: because gravity could
// rest a piece mid-drift at a column that was NOT its chosen landing, that
// randomness was the source of the holes/scatter the fidelity audit caught.)
function chooseTargetX(shape) {
  const landings = fillRowLandings(shape);
  if (landings.length) return landings[0];
  return optimalTargetX(shape);
}

// Re-derive a piece's SHAPE and target column against the CURRENT grid at the
// moment it becomes active. `pickNextShape()` was run when the piece was minted
// (1–2 pieces early, for the NEXT preview), so by release the fill line has
// usually moved on — a stale I-piece dropped into a 2-wide gap can't land clean
// and would build a tower/hole (the fidelity-audit scatter). Re-picking here
// guarantees the falling piece's shape MATCHES the gap it's about to fill, so
// rows complete and clear instead of stacking sideways. The NEXT preview is
// flavor, not a contract — a shape swap on release is acceptable and rare.
function refreshPieceForGrid(p) {
  p.shape = pickNextShape();
  p.x = Math.min(COLS - p.shape[0].length, Math.max(0, Math.floor(COLS / 2) - 1));
  p.targetX = chooseTargetX(p.shape);
  return p;
}

function fits(s, px, py) {
  for (let r = 0; r < s.length; r++)
    for (let c = 0; c < s[r].length; c++)
      if (s[r][c]) {
        const gx = px + c, gy = py + r;
        if (gx < 0 || gx >= COLS || gy >= ROWS) return false;
        if (gy >= 0 && grid[gy][gx]) return false;
      }
  return true;
}

// How far down a shape at column x can rest (integer row).
function dropRowAt(shape, x) {
  let y = 0;
  while (fits(shape, x, y + 1)) y++;
  return y;
}

// Columns where the shape comes to rest sitting exactly ON the lowest incomplete
// row (its bottom cells land in that row, no hole left underneath). These are
// the only "organic" landings we allow — an imperfect drop varies the ORDER a
// row fills, never leaving a blocking gap that a rotation-less I/O can't fill.
function fillRowLandings(shape) {
  const fillRow = lowestIncompleteRow();
  if (fillRow < 0) return [];
  const w = shape[0].length;
  const out = [];
  for (let x = 0; x <= COLS - w; x++) {
    const dropY = dropRowAt(shape, x);
    if (dropY + shape.length - 1 === fillRow) out.push(x);
  }
  return out;
}

// Lock a piece's cells into the grid, handle line clears, overflow maintenance,
// and hand off to the next piece with a release delay. Returns rows cleared (0+).
//
// The lock is AUTHORITATIVE and gap-free: whatever column the piece visually
// drifted to, it snaps to a clean fill-line landing before writing its cells,
// so the stack can never accumulate a hole. `requestedX` is a preference (the
// piece's target); it is honored only if it is itself a valid gap-free landing,
// otherwise the leftmost fill-line column is used. `eager` additionally biases
// toward a column that COMPLETES the lowest incomplete row, so the winning
// clear arrives promptly once both minimums are met — without ever fabricating
// cells in a row the piece doesn't physically occupy (the old eager path filled
// a whole row directly, which is exactly what left holes and un-clearable
// rows behind).
function lockPiece(requestedX, eager) {
  if (!piece) piece = nextPiece || makePiece();

  const targetX = resolveLandingX(piece.shape, requestedX, eager);
  const col = COLORS[piece.colorIdx];
  const dropY = dropRowAt(piece.shape, targetX);

  for (let r = 0; r < piece.shape.length; r++)
    for (let c = 0; c < piece.shape[r].length; c++)
      if (piece.shape[r][c]) {
        const gy = dropY + r, gx = targetX + c;
        if (gy >= 0 && gy < ROWS) grid[gy][gx] = col;
      }

  // Complete rows?
  const complete = [];
  for (let r = 0; r < ROWS; r++) {
    if (grid[r].every(cell => cell !== null)) complete.push(r);
  }
  const clearedNow = complete.length;
  if (clearedNow > 0) {
    clearFlash = complete;
    clearTimer = 18;
    linesCleared += clearedNow;
    score += clearedNow * 100;
  } else {
    score += 10;
  }

  // Overflow maintenance: Adventure wipes some inaccessible upper rows before
  // the well tops out (framed as ambient maintenance, never failure). Survival
  // keeps the authentic stack pressure and never wipes.
  if (!survivalMode) maybeWipe();

  // Retire the current piece; promote NEXT to on-deck and pick a new NEXT, but
  // do NOT release yet — the render loop releases after RELEASE_DELAY_MS and
  // only if the engagement gate is satisfied (journal L20).
  piece = null;
  onDeck = nextPiece || makePiece();
  nextPiece = makePiece();
  releaseAtMs = performance.now() + RELEASE_DELAY_MS;
  return clearedNow;
}

// The piece waiting to release (already chosen, shown implicitly via NEXT chain).
let onDeck = null;

// The bottom-most row that still has at least one empty cell (the row currently
// being built). Returns -1 only if the board is completely full.
function lowestIncompleteRow() {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (grid[r].some(cell => cell === null)) return r;
  }
  return -1;
}

// The leftmost landing column for a piece dropping into the lowest incomplete
// row (its left-most empty cell), clamped on-board; null if that row is full.
function columnToCompleteRow(shape) {
  const fillRow = lowestIncompleteRow();
  if (fillRow < 0) return null;
  let x = 0;
  while (x < COLS && grid[fillRow][x] !== null) x++;
  if (x >= COLS) return null;
  return Math.min(x, COLS - shape[0].length);
}

// Resolve the column a piece will actually LOCK at — always a clean, gap-free
// landing that continues the left-to-right fill, so the stack can never grow a
// hole. `preferredX` (the piece's drifted target) is honored only when it is
// itself a valid fill-line landing. `eager` prefers the column that COMPLETES
// the lowest incomplete row (columnToCompleteRow) so the winning clear lands
// promptly. Every branch clamps on-board; the final fallback (optimalTargetX)
// is always a legal placement, so the return value is never out of range.
function resolveLandingX(shape, preferredX, eager) {
  const landings = fillRowLandings(shape);
  if (eager) {
    const completeX = columnToCompleteRow(shape);
    if (completeX != null) return completeX;
  }
  if (typeof preferredX === 'number' && landings.includes(preferredX)) return preferredX;
  if (landings.length) return landings[0];
  const completeX = columnToCompleteRow(shape);
  if (completeX != null) return completeX;
  return optimalTargetX(shape);
}

// Ambient overflow wipe (Adventure only): when the stack reaches the top band,
// drop the top-most settled rows away and let everything above fall, keeping
// the well playable. Not a penalty — nothing is lost that mattered.
function maybeWipe() {
  const maxH = Math.max(...columnHeights());
  if (maxH < ROWS - 2) return;
  const occupiedTop = ROWS - maxH;
  const removeFrom = occupiedTop;
  const removeCount = Math.min(3, ROWS - removeFrom);
  for (let i = 0; i < removeCount; i++) {
    grid.splice(removeFrom, 1);
    grid.unshift(Array(COLS).fill(null));
  }
  wipeFlash = 20;
}

function clearLines(rows) {
  rows.sort((a, b) => b - a);
  rows.forEach(r => {
    grid.splice(r, 1);
    grid.unshift(Array(COLS).fill(null));
  });
}

// ── Gravity & lateral drift (the render-loop simulation) ─────────────────────

// Release the on-deck piece from the top if the engagement gate allows and the
// release delay has elapsed. If no keystroke has come in ENGAGEMENT_MS, the
// board simply holds — nothing releases, stacks, or moves on its own (L20).
function maybeRelease(nowMs) {
  if (piece || victoryMode || clearTimer > 0) return;
  if (nowMs < releaseAtMs) return;
  if (nowMs - lastKeyMs > ENGAGEMENT_MS) return; // unattended: hold calmly
  piece = onDeck || makePiece();
  onDeck = null;
  piece.y = 0;
  refreshPieceForGrid(piece); // shape+target fresh against the live grid
  fallAccMs = 0;
  driftAccMs = 0;
}

// Advance gravity and lateral drift by the elapsed time. The piece falls one
// grid cell at a time (y is a float; it interpolates smoothly toward the next
// integer cell and always locks grid-aligned). Laterally it steps one column
// toward targetX, like a player tapping — and drift (130ms/step) far outpaces
// gravity (650ms/cell), so the piece is virtually always already aligned on its
// target column by the time it rests. When it can fall no further it LOCKS on
// its target column (lockPiece snaps to a gap-free fill-line landing, so the
// stack never grows a hole) — no punishment, no lost progress.
function stepGravity(nowMs, dtMs) {
  if (!piece || victoryMode || clearTimer > 0) return;

  // Lateral drift toward the target column, one step at a time.
  driftAccMs += dtMs;
  while (driftAccMs >= DRIFT_MS_PER_STEP && piece.x !== piece.targetX) {
    driftAccMs -= DRIFT_MS_PER_STEP;
    const dir = piece.targetX > piece.x ? 1 : -1;
    const restY = Math.floor(piece.y);
    if (fits(piece.shape, piece.x + dir, restY)) piece.x += dir;
    else break; // blocked at this depth; drift resumes as it falls past
  }

  // Gravity: accumulate toward one-cell descents. The descent test uses the
  // piece's CURRENT column so the fall reads honestly; drift keeps closing the
  // gap to targetX on the way down.
  fallAccMs += dtMs;
  while (fallAccMs >= FALL_MS_PER_CELL) {
    fallAccMs -= FALL_MS_PER_CELL;
    const nextRow = Math.floor(piece.y) + 1;
    if (fits(piece.shape, piece.x, nextRow)) {
      piece.y = nextRow;
    } else {
      // Can't descend at the current column. If the piece hasn't finished
      // drifting to its target and the target column can still accept it
      // lower, snap to the target column and keep falling (a brief early
      // rest against a taller neighbor never becomes a permanent hole).
      if (piece.x !== piece.targetX && fits(piece.shape, piece.targetX, nextRow)) {
        piece.x = piece.targetX;
        piece.y = nextRow;
        continue;
      }
      // Rest reached — lock on the target column (snapped gap-free by lockPiece).
      piece.y = Math.floor(piece.y);
      lockPiece(piece.targetX, false);
      return;
    }
  }
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function drawBackground() {
  ctx.fillStyle = '#000818';
  ctx.fillRect(0, 0, W, H);

  // Dithered skyline — a checkerboard stipple stands in for a gradient
  // (NES-era rule: banding/dithering, never a smooth canvas gradient).
  ctx.fillStyle = '#001028';
  bgBlocks.forEach(b => {
    for (let by = H - b.h; by < H; by += 2) {
      for (let bx = b.x; bx < b.x + b.w; bx += 2) {
        if (((bx + by) / 2) % 2 === 0) ctx.fillRect(bx, by, 2, 2);
      }
    }
  });
}

function drawGrid() {
  // Border — glows briefly during an overflow wipe (ambient, warm, not alarming)
  ctx.strokeStyle = wipeFlash > 0 ? 'rgba(120,200,255,0.9)' : '#003355';
  ctx.lineWidth = 2;
  ctx.strokeRect(GRID_X - 2, GRID_Y - 2, COLS * CELL + 4, ROWS * CELL + 4);

  // Grid lines
  ctx.strokeStyle = 'rgba(0, 80, 120, 0.3)';
  ctx.lineWidth = 1;
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(GRID_X, GRID_Y + r * CELL);
    ctx.lineTo(GRID_X + COLS * CELL, GRID_Y + r * CELL);
    ctx.stroke();
  }
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(GRID_X + c * CELL, GRID_Y);
    ctx.lineTo(GRID_X + c * CELL, GRID_Y + ROWS * CELL);
    ctx.stroke();
  }

  // Locked cells
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!grid[r][c]) continue;
      const isFlashing = clearFlash.includes(r) && clearTimer > 0;
      const col = isFlashing ? (clearTimer % 4 < 2 ? '#fff' : '#ffff00') : grid[r][c];
      drawCell(GRID_X + c * CELL, GRID_Y + r * CELL, CELL, col);
    }
  }
}

function drawCell(x, y, size, col) {
  ctx.fillStyle = col;
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(x + 1, y + 1, size - 2, 3);
  ctx.fillRect(x + 1, y + 1, 3, size - 2);
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x + size - 3, y + 2, 2, size - 3);
  ctx.fillRect(x + 2, y + size - 3, size - 3, 2);
}

// Ghost piece: a dim outline showing where the current piece will land. Uses the
// piece's integer resting row (y is a float mid-fall).
function ghostDropRow(p) {
  let gy = Math.floor(p.y);
  while (fits(p.shape, p.x, gy + 1)) gy++;
  return gy;
}

function drawGhost(p, offsetX, offsetY) {
  if (!p) return;
  const gy = ghostDropRow(p);
  if (gy <= Math.floor(p.y)) return;
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  for (let r = 0; r < p.shape.length; r++)
    for (let c = 0; c < p.shape[r].length; c++)
      if (p.shape[r][c] && gy + r >= 0)
        ctx.strokeRect(offsetX + (p.x + c) * CELL + 2, offsetY + (gy + r) * CELL + 2, CELL - 4, CELL - 4);
}

// Draw the falling piece at its float y (sub-cell interpolation makes gravity
// read as smooth continuous motion, not integer hops).
function drawPiece(p, offsetX, offsetY) {
  if (!p) return;
  const col = COLORS[p.colorIdx];
  if (dropFlash > 0) { ctx.shadowColor = col; ctx.shadowBlur = 12; }
  const pxY = offsetY + p.y * CELL;
  for (let r = 0; r < p.shape.length; r++)
    for (let c = 0; c < p.shape[r].length; c++)
      if (p.shape[r][c] && p.y + r >= -0.999)
        drawCell(offsetX + (p.x + c) * CELL, pxY + r * CELL, CELL, col);
  ctx.shadowBlur = 0;
}

function drawNextPiece() {
  if (!nextPiece) return;
  const nx = GRID_X + COLS * CELL + 24;
  const ny = GRID_Y + 24;
  ctx.fillStyle = '#003355';
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('NEXT', nx, ny);
  const previewCell = Math.floor(CELL * 0.8);
  nextPiece.shape.forEach((row, r) =>
    row.forEach((c, cc) => {
      if (c) drawCell(nx + cc * previewCell, ny + 10 + r * previewCell, previewCell, COLORS[nextPiece.colorIdx]);
    })
  );
}

function drawHUD() {
  const nx = GRID_X + COLS * CELL + 24;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#00ffff';
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.fillText(String(score).padStart(6, '0'), nx, GRID_Y + 110);
  ctx.fillStyle = '#004466';
  ctx.fillText('WORDS', nx, GRID_Y + 132);
  ctx.fillStyle = '#00ffff';
  ctx.fillText(`${Math.min(sequencesPlaced, MIN_SEQUENCES)}/${MIN_SEQUENCES}`, nx, GRID_Y + 150);
  ctx.fillStyle = '#004466';
  ctx.fillText('LINES', nx, GRID_Y + 172);
  ctx.fillStyle = '#00ff88';
  ctx.fillText(`${Math.min(linesCleared, MIN_ROWS)}/${MIN_ROWS}`, nx, GRID_Y + 190);
}

function render(nowMs) {
  if (!active) return;
  frame++;
  const now = typeof nowMs === 'number' ? nowMs : performance.now();
  let dt = lastTickMs ? now - lastTickMs : 16;
  lastTickMs = now;
  if (dt > 100) dt = 100; // clamp long stalls (tab backgrounded) — no giant jumps

  if (victoryMode) {
    stepVictory(now, dt);
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    drawVictory(now);
    updateBits();
    drawBits();
    animId = requestAnimationFrame(render);
    return;
  }

  // Simulation: only while not mid clear-animation and not in victory.
  if (clearTimer === 0) {
    stepGravity(now, dt);
    maybeRelease(now);
  }

  ctx.clearRect(0, 0, W, H);

  drawBackground();
  drawGrid();
  drawGhost(piece, GRID_X, GRID_Y);
  drawPiece(piece, GRID_X, GRID_Y);
  drawNextPiece();
  drawBits();
  drawHUD();

  if (dropFlash > 0) dropFlash--;
  if (wipeFlash > 0) wipeFlash--;

  if (clearTimer > 0) {
    clearTimer--;
    if (clearTimer === 0) {
      spawnClearBits(clearFlash);
      clearLines(clearFlash);
      clearFlash = [];
    }
  }

  updateBits();
  animId = requestAnimationFrame(render);
}

// Small square debris that bursts outward from cleared rows.
function spawnClearBits(rows) {
  rows.forEach(r => {
    for (let c = 0; c < COLS; c++) {
      if (!grid[r][c]) continue;
      bits.push({
        x: GRID_X + c * CELL + CELL / 2,
        y: GRID_Y + r * CELL + CELL / 2,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3 - 1,
        col: grid[r][c],
        life: 24,
      });
    }
  });
  if (bits.length > 120) bits = bits.slice(bits.length - 120);
}

function updateBits() {
  bits = bits.filter(b => b.life > 0);
  bits.forEach(b => {
    b.vy += 0.2;
    b.x += b.vx;
    b.y += b.vy;
    b.life--;
  });
}

function drawBits() {
  bits.forEach(b => {
    ctx.globalAlpha = Math.max(b.life / 24, 0);
    ctx.fillStyle = b.col;
    ctx.fillRect(b.x - 3, b.y - 3, 6, 6);
  });
  ctx.globalAlpha = 1;
}

// ── Victory: bottom-up flash-clear, then the rocket launch ───────────────────
// Game Boy Tetris (1989) win beat, era-faithful and never alarming. Phase 1
// (~0.9s): the whole board flashes and clears from the bottom up, row by row.
// Phase 2 (remaining ~2.6s): a small pixel rocket lifts off from the well floor
// with a simple exhaust trail. All math is clamped (elapsed >= 0, progress in
// [0,1]) — victory animations are exactly where the F1 sentinel-frame crash
// lived, so no unclamped frame value ever reaches geometry.

function stepVictory(nowMs, dtMs) {
  const elapsed = Math.max(0, nowMs - victoryStartMs);

  // Phase 1: erase the board from the bottom up as a light cascade.
  if (elapsed < VICTORY_CLEAR_MS) {
    const prog = Math.min(1, elapsed / VICTORY_CLEAR_MS); // 0..1
    const rowsGone = Math.floor(prog * ROWS);
    for (let i = 0; i < rowsGone; i++) {
      const r = ROWS - 1 - i;
      if (r >= 0 && r < ROWS) grid[r] = Array(COLS).fill(null);
    }
    return;
  }

  // Transition into flight: spawn the rocket once, at the well's bottom-centre.
  if (!rocket) {
    rocket = { x: GRID_X + COLS * CELL / 2, y: GRID_Y + ROWS * CELL - CELL };
    exhaust = [];
  }

  // Phase 2: the rocket accelerates upward; emit a bounded exhaust trail.
  const flight = Math.max(0, elapsed - VICTORY_CLEAR_MS);
  const flightProg = Math.min(1, flight / (VICTORY_MS - VICTORY_CLEAR_MS)); // 0..1
  // Ease-in: slow ignition, then lift. Speed rises with progress.
  const speed = (0.6 + 4.4 * flightProg) * CELL * (dtMs / 100);
  rocket.y -= speed;

  // Emit exhaust puffs from just below the rocket (bounded pool).
  if (exhaust.length < 90) {
    for (let i = 0; i < 2; i++) {
      exhaust.push({
        x: rocket.x + (Math.random() - 0.5) * CELL * 0.5,
        y: rocket.y + CELL * 0.9,
        vx: (Math.random() - 0.5) * 1.2,
        vy: 1.5 + Math.random() * 2,
        life: 22 + Math.floor(Math.random() * 10),
        max: 32,
      });
    }
  }
  exhaust = exhaust.filter(p => p.life > 0);
  exhaust.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.life--; });
}

function drawVictory(nowMs) {
  const elapsed = Math.max(0, nowMs - victoryStartMs);

  // During the clear cascade, keep drawing the (shrinking) stack with a flash.
  if (elapsed < VICTORY_CLEAR_MS) {
    ctx.strokeStyle = '#003355';
    ctx.lineWidth = 2;
    ctx.strokeRect(GRID_X - 2, GRID_Y - 2, COLS * CELL + 4, ROWS * CELL + 4);
    const flash = Math.floor(elapsed / 60) % 2 === 0;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (!grid[r][c]) continue;
        drawCell(GRID_X + c * CELL, GRID_Y + r * CELL, CELL, flash ? '#ffffff' : grid[r][c]);
      }
    return;
  }

  // Well outline persists as a launch pad frame.
  ctx.strokeStyle = '#003355';
  ctx.lineWidth = 2;
  ctx.strokeRect(GRID_X - 2, GRID_Y - 2, COLS * CELL + 4, ROWS * CELL + 4);

  // Exhaust trail (behind the rocket).
  exhaust.forEach(p => {
    const a = Math.max(0, p.life / p.max);
    ctx.globalAlpha = a;
    // Warm plume: white core fading to orange.
    ctx.fillStyle = a > 0.6 ? '#fff4c0' : '#ff9020';
    const s = 4 + (1 - a) * 4;
    ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
  });
  ctx.globalAlpha = 1;

  if (rocket) drawRocket(rocket.x, rocket.y);
}

// A small blocky pixel rocket (era-faithful — no anti-aliasing, chunky cells).
function drawRocket(cx, cy) {
  const u = Math.max(3, Math.floor(CELL / 4)); // pixel unit
  // Body (white), nose (red), fins (cyan) — classic GB-cheerful palette.
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(cx - u, cy - u * 2, u * 2, u * 4);          // body
  ctx.fillStyle = '#ff3030';
  ctx.fillRect(cx - u, cy - u * 3, u * 2, u);               // nose cap
  ctx.fillRect(cx - u * 0.5, cy - u * 4, u, u);             // tip
  ctx.fillStyle = '#00d0ff';
  ctx.fillRect(cx - u * 2, cy + u, u, u * 2);               // left fin
  ctx.fillRect(cx + u, cy + u, u, u * 2);                   // right fin
  // Window
  ctx.fillStyle = '#0044ff';
  ctx.fillRect(cx - u * 0.5, cy - u, u, u);
}

// ─── API ──────────────────────────────────────────────────────────────────────

export function start() {
  getCanvas();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  active = true; victoryMode = false; frame = 0;
  MIN_SEQUENCES = Math.ceil(BASE_MIN_SEQUENCES * getWinRatio());
  sequencesPlaced = 0; hasWon = false; linesCleared = 0; score = 0;
  clearFlash = []; clearTimer = 0; dropFlash = 0; wipeFlash = 0; bits = [];
  colorCycle = 0;
  victoryStartMs = 0; rocket = null; exhaust = [];
  survivalMode = readSurvival();
  computeLayout();
  initGrid();
  // Lifecycle clocks. Seed lastKeyMs to "now" so the very first piece releases
  // immediately when the level opens (the player is present and about to type).
  const now = performance.now();
  lastKeyMs = now; lastTickMs = 0;
  fallAccMs = 0; driftAccMs = 0; releaseAtMs = 0;
  piece = makePiece();          // first piece is already falling on entry
  onDeck = null;
  nextPiece = makePiece();
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  bits = [];
  piece = null; onDeck = null;
}

// Each correct keystroke keeps the engagement gate open and gives the falling
// piece a small visible nudge — a reward within 1–2s (journal L18). It shaves a
// little off the gravity clock (the piece dips) and, if the piece is still
// off-column, advances one lateral step toward its target. Never a full lock —
// locking is authoritative on the completed sequence (patternComplete), so the
// win gate never depends on how many keys a piece happened to take.
export function keystroke() {
  if (!active || victoryMode) return;
  lastKeyMs = performance.now();
  dropFlash = 6;
  if (clearTimer > 0 || !piece) return;

  // Nudge the fall clock so the piece visibly dips toward the floor.
  fallAccMs = Math.min(fallAccMs + NUDGE_FALL_MS, FALL_MS_PER_CELL);
  // And nudge one lateral step toward the target if still off-column.
  if (piece.x !== piece.targetX) {
    const dir = piece.targetX > piece.x ? 1 : -1;
    if (fits(piece.shape, piece.x + dir, Math.floor(piece.y))) {
      piece.x += dir;
      driftAccMs = 0;
    }
  }
}

// A wrong key still counts as engagement (a key was pressed) so the gate stays
// open. Never a penalty — no lost progress, no scary imagery, no board change.
export function miss() {
  lastKeyMs = performance.now();
}

// The engine calls this exactly once per completed letter sequence — our unit
// of progress. Completing a sequence FAST-DROPS the current piece: it slams to
// its placement immediately and locks, and that placement advances the win gate.
// The win is the CONJUNCTION: enough sequences AND enough rows cleared, firing
// EXACTLY on the clear that first satisfies both minimums. Won stays won.
export function patternComplete() {
  if (victoryMode || hasWon) return true;   // won stays won on repeated calls

  lastKeyMs = performance.now();
  sequencesPlaced++;

  // Ensure there IS a piece to slam — if we're mid release-gap (the previous
  // piece just locked), release the on-deck piece now so this sequence has a
  // piece to place. Progress must always move forward.
  if (!piece) {
    piece = onDeck || makePiece();
    onDeck = null;
    piece.y = 0;
    refreshPieceForGrid(piece); // shape+target fresh against the live grid
  }

  // Once the sequence minimum is met and we're within one row of the row
  // minimum, bias placement to COMPLETE the next row so the winning clear
  // arrives promptly. Before that, fast-drop to the piece's own gap-free target.
  // Either way lockPiece resolves the final column authoritatively (always a
  // clean fill-line landing), so a fast-drop can never scatter or leave a hole.
  const eager = sequencesPlaced >= MIN_SEQUENCES && linesCleared >= MIN_ROWS - 1;

  const clearedNow = lockPiece(piece.targetX, eager);
  dropFlash = 6;

  // Win the moment a clear lands with both minimums satisfied.
  if (sequencesPlaced >= MIN_SEQUENCES && linesCleared >= MIN_ROWS && clearedNow > 0) {
    hasWon = true;
  }
  return hasWon;
}

// The engine calls this at level complete and holds the victory screen for a few
// seconds. We fill that window with the Game Boy Tetris rocket launch: a bottom-
// up board flash-clear into a pixel rocket lift-off with an exhaust trail. We
// return the animation duration in ms (forward-compatible: the engine currently
// ignores the return value; a follow-up will consume it to time the hold).
export function victory() {
  victoryMode = true;
  victoryStartMs = performance.now();
  rocket = null;
  exhaust = [];
  piece = null; onDeck = null;
  return VICTORY_MS;
}

window.addEventListener('resize', () => {
  if (active) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    computeLayout();
  }
});
