// Level 22: Q*bert (Gottlieb, 1982)
// Isometric pyramid of cubes on dark violet. Cube tops flip color per keystroke.
// Orange Q*bert blob hops cube-to-cube. Misses are a harmless bouncing purple ball.
//
// LAYOUT CONTRACT — "the UI owns the center; the theme owns the frame."
// The fixed DOM UI permanently occupies the center (prompt panel ~0.40-0.60W x
// 0.19-0.43H, keyboard guide ~0.22-0.78W x 0.49-0.81H). So the whole scene is
// composed in the STAGE regions instead: the pyramid lives in the LEFT margin +
// lower-left (full height, x 0..~0.34W), Q*bert hops across it, and the comic
// Coily ball bounces in the RIGHT margin (x ~0.80-0.98W). Nothing the player
// needs to SEE sits behind a panel; the violet sky + starfield fill continues
// behind the panels so the scene reads as one continuous picture.
// Everything is positioned in canvas space as fractions of W/H (never DOM px).

import { getWinRatio } from '../settings.js';

let canvas, ctx;
let animId = null, active = false, victoryMode = false;
let frame = 0, W = 0, H = 0;

const PYRAMID_ROWS = 7;       // 7 rows → 28 cubes total
let cubes = [];                // { row, col, flipped, flipAnim }
let flippedCount = 0;
const WIN_CUBES_TARGET = 28;   // all cubes in a 7-row pyramid — geometry-fixed

// EXPERIENCE win-ratio for Q*bert. The pyramid is geometry-fixed at 28 cubes, so
// we do NOT scale the cube gate (that IS the cube mechanic). Instead the ratio
// scales an ADDITIONAL, sequence-based expectation: above 1x, the level also
// requires the player to complete more full words. At 1x this floor is 0, so the
// win is byte-identical to before (fire exactly when all 28 cubes are flipped).
// The pyramid keeps recoloring on every keystroke past 28 (harmless spectacle)
// while the remaining sequences are typed. sequencesPlaced counts completed
// words (patternComplete calls); the engine refills its pool infinitely so any
// scaled floor stays reachable.
const BASE_EXTRA_SEQUENCES = 5;   // words required BEYOND the pyramid, per whole ratio-step above 1x
let minSequences = 0;             // resolved at start() from the ratio
let sequencesPlaced = 0;

let qbertRow = 0, qbertCol = 0;      // current logical position
let qbertX = 0, qbertY = 0;          // rendered (eased) position
let qbertTargetX = 0, qbertTargetY = 0;
let hopPhase = 0;             // 0..1 during a hop, else 0 (resting)
let hopFromX = 0, hopFromY = 0;
let hopBounceHeight = 0;

let disc = null;               // purple ball bounce for miss()
let coily = null;              // comic enemy bouncing harmlessly in the RIGHT margin
let bubble = null;             // { text, life } floating '@!#?@!' speech moment
let rainbowPhase = 0;          // victory pyramid color cycle

// ─── Victory: the round-clear flip-wave ──────────────────────────────────────
// Q*bert's real arcade win: every cube reaches its target color and the pyramid
// clears. We stage that as a wave sweeping UP the pyramid (bottom row → apex),
// each cube flipping to target color with its flash as the wave passes, then the
// whole flipped pyramid holds and PULSES with a celebratory rainbow cycle while
// Q*bert does happy hops on the top cube. Frame-driven but clamped (F1).
const VICTORY_MS = 3500;              // returned to the engine
const VICTORY_WAVE_MS = 1400;         // duration of the upward sweep
let victoryFrame = 0;                 // frames elapsed since victory() (clamped)
let victoryWaveRow = -1;              // highest pyramid row the wave has reached
let victoryHop = 0;                   // Q*bert celebratory hop phase (0..1 looping)

// Family-friendly classic Q*bert gibberish (kept harmless).
const BUBBLE_WORDS = ['@!#?@!', '#?@!', '@!?#', '!@#?'];

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  W = canvas.width; H = canvas.height;
  layoutCubes();
}

// ─── Pyramid geometry ──────────────────────────────────────────────────────────
// Anchored to the LEFT-margin / lower-left stage, NOT screen center. The pyramid
// apex sits high-left; rows descend toward the bottom-left. This keeps the whole
// focal structure clear of the prompt panel and keyboard guide.

function cubeSize() {
  // Sized to the left stage width so all 7 rows fit within ~0..0.34W.
  return Math.max(20, Math.min(40, W * 0.030));
}

// Isometric position for (row, col) — row 0 is the top single cube.
function cubeScreenPos(row, col) {
  const s = cubeSize();
  const halfW = s * 1.0;
  const halfH = s * 0.55;
  const apexX = W * 0.145;      // apex column, in the left margin
  const topY = H * 0.135;       // apex near the top band, above the HUD-free left edge
  const offsetFromCenter = col - row / 2;
  const x = apexX + offsetFromCenter * halfW;
  const y = topY + row * halfH * 1.15;
  return { x, y };
}

function layoutCubes() {
  cubes = [];
  for (let row = 0; row < PYRAMID_ROWS; row++) {
    for (let col = 0; col <= row; col++) {
      cubes.push({ row, col, flipped: false, flipAnim: 0 });
    }
  }
  flippedCount = 0;
  const start = cubeScreenPos(0, 0);
  qbertRow = 0; qbertCol = 0;
  qbertX = qbertTargetX = start.x;
  qbertY = qbertTargetY = start.y;
  hopPhase = 0;
}

function findCube(row, col) {
  return cubes.find(c => c.row === row && c.col === col);
}

// Pick the next cube to hop to — prefer an unflipped neighbor, wrapping within pyramid bounds.
function neighborsOf(row, col) {
  const candidates = [
    { row: row + 1, col: col },       // down-left
    { row: row + 1, col: col + 1 },   // down-right
    { row: row - 1, col: col - 1 },   // up-left
    { row: row - 1, col: col },       // up-right
  ];
  return candidates.filter(n => n.row >= 0 && n.row < PYRAMID_ROWS && n.col >= 0 && n.col <= n.row);
}

function pickNextHop() {
  const neighbors = neighborsOf(qbertRow, qbertCol);
  const unflipped = neighbors.filter(n => !findCube(n.row, n.col).flipped);
  const pool = unflipped.length ? unflipped : neighbors;
  if (!pool.length) return { row: qbertRow, col: qbertCol };
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function drawBackground() {
  ctx.fillStyle = '#231030';
  ctx.fillRect(0, 0, W, H);
  // Subtle starfield dots for arcade depth — spread across the whole sky (ambient
  // fill is allowed behind panels; it makes the scene feel continuous).
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for (let i = 0; i < 70; i++) {
    const x = (i * 197.3) % W;
    const y = (i * 113.7 + frame * 0.02) % H;
    ctx.fillRect(x, y, 1, 1);
  }
}

const FLIPPED_COLORS = { top: '#ffb400', left: '#cc8400', right: '#8f5c00' };
const UNFLIPPED_COLORS = { top: '#33e0e0', left: '#1fa3a3', right: '#136a6a' };

function cubeColors(cube) {
  if (victoryMode) {
    // The wave sweeps from the bottom row (PYRAMID_ROWS-1) UP to the apex (row 0).
    // A cube whose row the wave has reached is target-flipped and joins the rainbow
    // pulse; a cube the wave hasn't reached yet keeps its gameplay color, so a
    // paused frame reads as a coherent, in-progress sweep.
    const reached = cube.row >= victoryWaveRow;
    if (reached) {
      const hue = (rainbowPhase + (cube.row * 40 + cube.col * 25)) % 360;
      return {
        top: `hsl(${hue},80%,65%)`,
        left: `hsl(${hue},70%,45%)`,
        right: `hsl(${hue},60%,32%)`,
      };
    }
    return cube.flipped ? FLIPPED_COLORS : UNFLIPPED_COLORS;
  }
  if (cube.flipped) return FLIPPED_COLORS;
  return UNFLIPPED_COLORS;
}

function drawCube(cube) {
  const s = cubeSize();
  const halfW = s * 1.0;
  const halfH = s * 0.55;
  const pos = cubeScreenPos(cube.row, cube.col);
  const depth = s * 1.05;
  const { top, left, right } = cubeColors(cube);

  // Slight pop animation on flip
  const anim = cube.flipAnim;
  const lift = anim > 0 ? Math.sin(anim * Math.PI) * 6 : 0;
  const y = pos.y - lift;

  // Top diamond
  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.moveTo(pos.x, y - halfH);
  ctx.lineTo(pos.x + halfW, y);
  ctx.lineTo(pos.x, y + halfH);
  ctx.lineTo(pos.x - halfW, y);
  ctx.closePath();
  ctx.fill();

  // Left face
  ctx.fillStyle = left;
  ctx.beginPath();
  ctx.moveTo(pos.x - halfW, y);
  ctx.lineTo(pos.x, y + halfH);
  ctx.lineTo(pos.x, y + halfH + depth);
  ctx.lineTo(pos.x - halfW, y + depth);
  ctx.closePath();
  ctx.fill();

  // Right face
  ctx.fillStyle = right;
  ctx.beginPath();
  ctx.moveTo(pos.x + halfW, y);
  ctx.lineTo(pos.x, y + halfH);
  ctx.lineTo(pos.x, y + halfH + depth);
  ctx.lineTo(pos.x + halfW, y + depth);
  ctx.closePath();
  ctx.fill();

  if (cube.flipAnim > 0) cube.flipAnim = Math.max(0, cube.flipAnim - 0.06);
}

function drawPyramid() {
  // Draw back rows first (painter's algorithm — row order works for this shape)
  cubes.forEach(drawCube);
}

// Q*bert blob sprite — simple round orange body with tube-nose and two feet
function drawQbert() {
  const s = cubeSize();
  ctx.save();
  const x = qbertX, y = qbertY - s * 0.9 - (hopBounceHeight);
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(qbertX, qbertY - 2, s * 0.42, s * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = '#ff8c1a';
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.42, s * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose tube
  ctx.fillStyle = '#ff8c1a';
  ctx.fillRect(x - s * 0.08, y - s * 0.55, s * 0.16, s * 0.28);
  ctx.fillStyle = '#e05a00';
  ctx.beginPath();
  ctx.arc(x, y - s * 0.58, s * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - s * 0.14, y - s * 0.1, s * 0.11, 0, Math.PI * 2);
  ctx.arc(x + s * 0.14, y - s * 0.1, s * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#161616';
  ctx.beginPath();
  ctx.arc(x - s * 0.12, y - s * 0.08, s * 0.05, 0, Math.PI * 2);
  ctx.arc(x + s * 0.16, y - s * 0.08, s * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Feet
  ctx.fillStyle = '#c85500';
  ctx.fillRect(x - s * 0.28, y + s * 0.32, s * 0.16, s * 0.14);
  ctx.fillRect(x + s * 0.12, y + s * 0.32, s * 0.16, s * 0.14);

  ctx.restore();

  // Speech bubble floats at Q*bert's upper-RIGHT and drifts up. It used to be
  // centred over him, which on the apex cube put the box into the HUD badge's
  // reserved corner; anchored to his right it can never extend left of him, and
  // the clamp keeps it on-canvas and left of the prompt panel (x < 0.40W).
  if (bubble && bubble.life > 0) {
    const alpha = Math.min(1, bubble.life / 20);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `${Math.round(s * 0.55)}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // little rounded speech box
    const tw = ctx.measureText(bubble.text).width;
    const bx = Math.min(x + s * 0.5 + tw / 2 + 6, W * 0.39 - tw / 2 - 6);
    // The box's TOP edge (by - 0.5s) never rises above a 0.015H margin. It used
    // to clamp to 4px, and the opener bubble — which drifts up for its whole
    // 60-frame life in the victory — sat on that floor with its glyphs, which
    // stood taller than the box, sliced off by y=0 (persona playtest,
    // 2026-10-30). The text is now centred IN the box (textBaseline 'middle'),
    // so the glyphs can never poke out past the box either (journal L34).
    const by = Math.max(H * 0.015 + s * 0.5, y - s * 0.9 - (30 - bubble.life) * 0.6);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillRect(bx - tw / 2 - 6, by - s * 0.5, tw + 12, s * 0.7);
    ctx.fillStyle = '#231030';
    // little tail
    ctx.beginPath();
    ctx.moveTo(bx - 4, by + s * 0.2);
    ctx.lineTo(bx + 4, by + s * 0.2);
    ctx.lineTo(bx, by + s * 0.45);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fill();
    ctx.fillStyle = '#c81e6e';
    ctx.fillText(bubble.text, bx, by - s * 0.15);   // the box's vertical centre
    ctx.restore();
  }
}

function drawDisc() {
  if (!disc) return;
  ctx.fillStyle = '#b060ff';
  ctx.shadowColor = '#b060ff';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(disc.x, disc.y, disc.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// Coily — the comic purple spring-ball enemy, bouncing endlessly in the RIGHT
// margin. It NEVER crosses toward the pyramid, so it can't threaten Q*bert. Pure
// arcade set-dressing that fills the right stage.
function drawCoily() {
  if (!coily) return;
  const s = cubeSize();
  const cx = coily.x, cy = coily.y;
  // stacked coil segments (spring look): 3 shrinking purple balls
  const segs = [
    { r: s * 0.42, dy: 0, c: '#8b2fd6' },
    { r: s * 0.32, dy: -s * 0.55, c: '#a24ff0' },
    { r: s * 0.24, dy: -s * 0.98, c: '#b060ff' },
  ];
  segs.forEach(seg => {
    ctx.fillStyle = seg.c;
    ctx.beginPath();
    ctx.arc(cx, cy + seg.dy, seg.r, 0, Math.PI * 2);
    ctx.fill();
  });
  // head eyes (top segment)
  const hy = cy - s * 0.98;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - s * 0.08, hy - s * 0.02, s * 0.07, 0, Math.PI * 2);
  ctx.arc(cx + s * 0.08, hy - s * 0.02, s * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#161616';
  ctx.beginPath();
  ctx.arc(cx - s * 0.07, hy - s * 0.02, s * 0.03, 0, Math.PI * 2);
  ctx.arc(cx + s * 0.09, hy - s * 0.02, s * 0.03, 0, Math.PI * 2);
  ctx.fill();
}

// The pyramid's lowest drawn pixel (bottom row's faces + flip-pop lift headroom).
function pyramidBottomY() {
  const s = cubeSize();
  return cubeScreenPos(PYRAMID_ROWS - 1, 0).y + s * 0.55 + s * 1.05;
}

// The CUBES / WORDS counters sit as a little scoreboard UNDER THE PYRAMID, in the
// left stage. They used to be drawn at fixed pixels (14,22)/(14,40) — i.e. INSIDE
// the HUD badge's reserved corner (~0.02–0.11W × 0.02–0.07H), so at WIZARD the two
// lines and "LEVEL 22" printed on top of each other (journal F30's "counters under
// the HUD badge" class). Placed in canvas fractions from the pyramid's own geometry
// (L16), left of the keyboard guide (x < 0.217W) and above its top edge.
function drawHUD() {
  const fontPx = Math.max(9, Math.min(12, Math.round(W * 0.0078)));
  const x = W * 0.025;
  const y0 = Math.min(pyramidBottomY() + fontPx * 1.6, H * 0.74);
  ctx.save();
  ctx.fillStyle = '#33e0e0';
  ctx.font = `${fontPx}px "Press Start 2P", monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.shadowColor = '#ff8c1a';
  ctx.shadowBlur = 5;
  ctx.fillText(`CUBES ${Math.min(flippedCount, WIN_CUBES_TARGET)}/${WIN_CUBES_TARGET}`, x, y0);
  // Above 1x EXPERIENCE an extra-words floor applies — show it so progress reads.
  if (minSequences > 0) {
    ctx.fillText(`WORDS ${Math.min(sequencesPlaced, minSequences)}/${minSequences}`, x, y0 + fontPx * 1.8);
  }
  ctx.restore();
}

// ─── Update ───────────────────────────────────────────────────────────────────

function updateCoily() {
  const s = cubeSize();
  if (!coily) {
    coily = {
      x: W * 0.89,
      baseY: H * 0.72,
      y: H * 0.72,
      vy: 0,
      phase: Math.random() * Math.PI * 2,
    };
  }
  // Gentle perpetual hop within the right margin (never leaves x ~0.80..0.98W).
  coily.phase += 0.05;
  const hop = Math.abs(Math.sin(coily.phase)) * s * 1.6;
  coily.y = coily.baseY - hop;
  // Drift slowly up/down the right stage so it isn't static, staying clear of HUD.
  coily.x = W * (0.86 + Math.sin(coily.phase * 0.23) * 0.06);
  coily.baseY = H * (0.66 + Math.sin(coily.phase * 0.17) * 0.14);
}

function updateHop() {
  if (hopPhase > 0) {
    hopPhase = Math.min(1, hopPhase + 0.09);
    const ease = hopPhase < 0.5 ? 2 * hopPhase * hopPhase : 1 - Math.pow(-2 * hopPhase + 2, 2) / 2;
    qbertX = hopFromX + (qbertTargetX - hopFromX) * ease;
    qbertY = hopFromY + (qbertTargetY - hopFromY) * ease;
    hopBounceHeight = Math.sin(hopPhase * Math.PI) * cubeSize() * 0.6;
    if (hopPhase >= 1) {
      hopPhase = 0;
      qbertX = qbertTargetX; qbertY = qbertTargetY;
      hopBounceHeight = 0;
    }
  }

  if (disc) {
    disc.vy += 0.5;
    disc.x += disc.vx;
    disc.y += disc.vy;
    disc.life--;
    if (disc.life <= 0 || disc.y > H + 20) disc = null;
  }

  if (bubble && bubble.life > 0) bubble.life--;
}

// ─── Render loop ─────────────────────────────────────────────────────────────

// Advance the victory sweep. Frame-driven at ~60fps, but everything is derived
// from a CLAMPED elapsed value so a long-running window never produces sentinel
// geometry (F1). The wave marches one pyramid row at a time up to the apex.
function updateVictory() {
  victoryFrame = Math.min(victoryFrame + 1, 100000);   // clamp — no runaway
  rainbowPhase = (rainbowPhase + 2.4) % 360;
  const elapsedMs = victoryFrame * (1000 / 60);
  // Wave progress 0..1 across VICTORY_WAVE_MS, then held at the apex.
  const waveT = Math.min(1, elapsedMs / VICTORY_WAVE_MS);
  // Bottom row is PYRAMID_ROWS-1; sweep up toward row 0. At waveT=0 only the
  // bottom row is reached; at waveT=1 every row (down to the apex) is reached.
  const rowsSpan = PYRAMID_ROWS;                        // rows to cross (incl. apex)
  const newWaveRow = Math.max(0, (PYRAMID_ROWS - 1) - Math.floor(waveT * rowsSpan));
  if (newWaveRow < victoryWaveRow || victoryWaveRow < 0) {
    // The wave just reached one (or more) new rows — flash each newly-reached cube.
    const from = victoryWaveRow < 0 ? PYRAMID_ROWS - 1 : victoryWaveRow - 1;
    for (const cube of cubes) {
      if (cube.row <= from && cube.row >= newWaveRow) cube.flipAnim = 1;
    }
    victoryWaveRow = newWaveRow;
  }
  // Q*bert celebrates on the apex cube once the wave has fully arrived there.
  const apex = cubeScreenPos(0, 0);
  qbertTargetX = qbertX = apex.x;
  qbertTargetY = qbertY = apex.y;
  hopPhase = 0;
  if (victoryWaveRow <= 0) {
    victoryHop = (victoryHop + 0.10) % 1;
    hopBounceHeight = Math.sin(victoryHop * Math.PI) * cubeSize() * 0.7;
  } else {
    hopBounceHeight = 0;
  }
}

function render() {
  if (!active) return;
  frame++;
  ctx.clearRect(0, 0, W, H);

  if (victoryMode) updateVictory();

  drawBackground();
  drawPyramid();
  drawDisc();
  drawCoily();
  drawQbert();
  drawHUD();
  updateCoily();
  if (!victoryMode) {
    updateHop();
  } else if (bubble && bubble.life > 0) {
    // In victory the opener bubble still ages out; hop/disc physics are frozen
    // (updateVictory owns Q*bert's position and no new misses fire post-win).
    bubble.life--;
  }

  animId = requestAnimationFrame(render);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function start() {
  getCanvas(); resize();
  active = true; victoryMode = false; frame = 0;
  disc = null; coily = null; bubble = null; rainbowPhase = 0;
  victoryFrame = 0; victoryWaveRow = -1; victoryHop = 0;
  // At 1x the extra-sequence floor is 0 → win is byte-identical (pyramid only).
  minSequences = Math.round(BASE_EXTRA_SEQUENCES * (getWinRatio() - 1));
  sequencesPlaced = 0;
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  disc = null; coily = null; bubble = null;
}

export function keystroke() {
  if (!active || victoryMode) return;
  const next = pickNextHop();
  const cube = findCube(next.row, next.col);
  if (cube && !cube.flipped) {
    cube.flipped = true;
    cube.flipAnim = 1;
    flippedCount++;
  }
  const from = cubeScreenPos(qbertRow, qbertCol);
  const to = cubeScreenPos(next.row, next.col);
  hopFromX = from.x; hopFromY = from.y;
  qbertTargetX = to.x; qbertTargetY = to.y;
  qbertRow = next.row; qbertCol = next.col;
  hopPhase = 0.001;
  // Occasional harmless comic outburst.
  if (Math.random() < 0.22) {
    bubble = { text: BUBBLE_WORDS[Math.floor(Math.random() * BUBBLE_WORDS.length)], life: 32 };
  }
}

export function miss() {
  // Harmless bouncing purple ball — Q*bert never falls off the pyramid.
  if (!active || victoryMode) return;
  disc = {
    x: qbertX + (Math.random() - 0.5) * 20,
    y: qbertY - cubeSize(),
    vx: (Math.random() - 0.5) * 3,
    vy: -4,
    r: Math.max(4, cubeSize() * 0.18),
    life: 40,
  };
}

export function patternComplete() {
  // One call per completed word. Win = whole pyramid flipped AND (above 1x) the
  // scaled extra-sequence floor met. At 1x minSequences is 0, so this reduces to
  // the original pure-cube gate. Progress only ever moves toward completion, and
  // once true it stays true (both counters are monotonic within a run).
  sequencesPlaced++;
  return flippedCount >= WIN_CUBES_TARGET && sequencesPlaced >= minSequences;
}

export function victory() {
  // Q*bert's round-clear: the whole pyramid flips to target color in a wave up
  // from the bottom, then holds fully-flipped and pulses rainbow while Q*bert
  // hops happily on the apex. The classic @!#?@! bubble is a joyful opener beat.
  victoryMode = true;
  victoryFrame = 0;
  victoryWaveRow = -1;      // set on the first updateVictory tick
  victoryHop = 0;
  rainbowPhase = 0;
  hopPhase = 0;
  disc = null;
  bubble = { text: '@!#?@!', life: 60 };
  return VICTORY_MS;
}

window.addEventListener('resize', () => { if (active) resize(); });
