// Level 22: Q*bert (Gottlieb, 1982)
// Isometric pyramid of cubes on dark violet. Cube tops flip color per keystroke.
// Orange Q*bert blob hops cube-to-cube. Misses are a harmless bouncing purple ball.

let canvas, ctx;
let animId = null, active = false, victoryMode = false;
let frame = 0, W = 0, H = 0;

const PYRAMID_ROWS = 7;       // 7 rows → 28 cubes total
let cubes = [];                // { row, col, flipped, flipAnim }
let flippedCount = 0;
const WIN_CUBES_TARGET = 28;   // all cubes in a 7-row pyramid

let qbertRow = 0, qbertCol = 0;      // current logical position
let qbertX = 0, qbertY = 0;          // rendered (eased) position
let qbertTargetX = 0, qbertTargetY = 0;
let hopPhase = 0;             // 0..1 during a hop, else 0 (resting)
let hopFromX = 0, hopFromY = 0;
let hopBounceHeight = 0;

let disc = null;               // purple ball bounce for miss()
let rainbowPhase = 0;          // victory pyramid color cycle

const CUBE_W = 0, CUBE_H = 0;  // computed per-resize (kept for clarity, not used as consts)

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

function cubeSize() {
  return Math.max(18, Math.min(34, W * 0.032));
}

// Isometric position for (row, col) — row 0 is the top single cube.
function cubeScreenPos(row, col) {
  const s = cubeSize();
  const halfW = s * 1.0;
  const halfH = s * 0.55;
  const topY = H * 0.18;
  const originX = W / 2;
  // col ranges 0..row within each row; center each row
  const offsetFromCenter = col - row / 2;
  const x = originX + offsetFromCenter * halfW;
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
  // Subtle starfield dots for arcade depth
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for (let i = 0; i < 40; i++) {
    const x = (i * 97.3) % W;
    const y = (i * 53.7 + frame * 0.02) % (H * 0.4);
    ctx.fillRect(x, y, 1, 1);
  }
}

function cubeColors(cube) {
  if (victoryMode) {
    const hue = (rainbowPhase + (cube.row * 40 + cube.col * 25)) % 360;
    return {
      top: `hsl(${hue},80%,65%)`,
      left: `hsl(${hue},70%,45%)`,
      right: `hsl(${hue},60%,32%)`,
    };
  }
  if (cube.flipped) {
    return { top: '#ffb400', left: '#cc8400', right: '#8f5c00' };
  }
  return { top: '#33e0e0', left: '#1fa3a3', right: '#136a6a' };
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

function drawHUD() {
  ctx.fillStyle = '#33e0e0';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.shadowColor = '#ff8c1a';
  ctx.shadowBlur = 5;
  ctx.fillText(`CUBES ${flippedCount}/${WIN_CUBES_TARGET}`, 14, 22);
  ctx.shadowBlur = 0;
}

// ─── Update ───────────────────────────────────────────────────────────────────

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
}

// ─── Render loop ─────────────────────────────────────────────────────────────

function render() {
  if (!active) return;
  frame++;
  if (victoryMode) rainbowPhase = (rainbowPhase + 2.4) % 360;
  ctx.clearRect(0, 0, W, H);

  drawBackground();
  drawPyramid();
  drawDisc();
  drawQbert();
  drawHUD();
  updateHop();

  animId = requestAnimationFrame(render);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function start() {
  getCanvas(); resize();
  active = true; victoryMode = false; frame = 0;
  disc = null; rainbowPhase = 0;
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  disc = null;
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
  return flippedCount >= WIN_CUBES_TARGET;
}

export function victory() {
  victoryMode = true;
}

window.addEventListener('resize', () => { if (active) resize(); });
