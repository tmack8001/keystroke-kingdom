// Level 9: Super Mario Bros (Nintendo, 1985)
// Mario runs across a side-scrolling NES world toward a flagpole.

let canvas, ctx;
let animId = null, active = false, victoryMode = false;
let frame = 0;

let progress = 0;
const STEPS_TO_WIN = 30;

let score = 0;
let jumpFlash = 0;
let marioJump = 0;      // jump height above ground (px, decays)
let marioJumpVy = 0;    // jump vertical velocity
let clouds = [];
let coinSparkles = [];  // keystroke coin-spin particles
let blockBump = 0;      // "?" block bump animation timer
let W = 0, H = 0;
let GROUND_Y = 0;

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function buildLayout() {
  W = canvas.width; H = canvas.height;
  GROUND_Y = Math.floor(H * 0.78);

  clouds = [
    { x: W * 0.15, y: H * 0.18, w: 80, h: 30 },
    { x: W * 0.45, y: H * 0.12, w: 110, h: 38 },
    { x: W * 0.72, y: H * 0.22, w: 70, h: 25 },
    { x: W * 0.88, y: H * 0.14, w: 90, h: 32 },
  ];
}

// ─── Pixel sprites ────────────────────────────────────────────────────────────

const PX = 3;

const MARIO_STAND = [
  [0,1,1,1,0],
  [1,1,0,1,1],
  [0,1,1,1,0],
  [0,1,0,1,0],
  [1,0,0,0,1],
];
const MARIO_RUN_A = [
  [0,1,1,1,0],
  [1,1,0,1,1],
  [0,1,1,1,0],
  [1,1,0,0,0],
  [0,0,0,1,1],
];
const MARIO_RUN_B = [
  [0,1,1,1,0],
  [1,1,0,1,1],
  [0,1,1,1,0],
  [0,0,0,1,1],
  [1,1,0,0,0],
];
const MARIO_JUMP = [
  [0,1,1,1,0],
  [1,1,0,1,1],
  [1,1,1,1,0],
  [0,1,1,0,0],
  [0,0,0,1,1],
];

function drawPxSprite(shape, x, y, size, headCol, bodyCol, flipH = false) {
  const w = shape[0].length;
  // Row 0-1 = head (cap), row 2+ = body
  shape.forEach((row, r) => row.forEach((c, cc) => {
    if (!c) return;
    ctx.fillStyle = r < 2 ? headCol : bodyCol;
    ctx.fillRect(x + (flipH ? w - 1 - cc : cc) * size, y + r * size, size, size);
  }));
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function drawSky() {
  ctx.fillStyle = '#5c94fc';
  ctx.fillRect(0, 0, W, GROUND_Y);
}

function drawClouds() {
  // Slowest parallax layer — clouds drift far less than the scrolling world
  const t = progress / STEPS_TO_WIN;
  const scrollX = -t * W * 0.15;
  clouds.forEach(cl0 => {
    const cl = { x: cl0.x + scrollX, y: cl0.y, w: cl0.w, h: cl0.h };
    // Simple NES-style cloud (white blocky shape)
    ctx.fillStyle = '#fff';
    ctx.fillRect(cl.x, cl.y + cl.h * 0.4, cl.w, cl.h * 0.6);
    ctx.fillRect(cl.x + cl.w * 0.2, cl.y + cl.h * 0.15, cl.w * 0.4, cl.h * 0.4);
    ctx.fillRect(cl.x + cl.w * 0.1, cl.y + cl.h * 0.25, cl.w * 0.22, cl.h * 0.25);
    ctx.fillRect(cl.x + cl.w * 0.55, cl.y + cl.h * 0.2, cl.w * 0.25, cl.h * 0.3);
  });
}

const GOOMBA_A = [
  [0,1,1,1,0],
  [1,1,1,1,1],
  [1,0,1,0,1],
  [1,1,1,1,1],
  [0,1,0,1,0],
];
const GOOMBA_B = [
  [0,1,1,1,0],
  [1,1,1,1,1],
  [1,0,1,0,1],
  [1,1,1,1,1],
  [1,0,0,0,1],
];

function drawGoomba() {
  const t = progress / STEPS_TO_WIN;
  const scrollX = -t * W * 0.6;
  const gx = W * 0.42 + scrollX;
  if (gx < -20 || gx > W + 20) return;
  const walkFrame = Math.floor(frame / 10) % 2;
  const sprite = walkFrame === 0 ? GOOMBA_A : GOOMBA_B;
  const size = 3;
  ctx.fillStyle = '#a0522d';
  sprite.forEach((row, r) => row.forEach((c, cc) => {
    if (c) ctx.fillRect(gx + cc * size, GROUND_Y - 15 + r * size, size, size);
  }));
}

function drawHills() {
  // Green hill silhouettes — mid-speed parallax layer, slower than the
  // foreground pipes/blocks/ground so distant hills feel farther away.
  const t = progress / STEPS_TO_WIN;
  const scrollX = -t * W * 0.35;

  ctx.fillStyle = '#00a800';
  // Hill 1
  const hx1 = W * 0.15 + scrollX;
  ctx.beginPath();
  ctx.arc(hx1, GROUND_Y, 80, Math.PI, 0);
  ctx.fill();
  // Hill 2
  const hx2 = W * 0.55 + scrollX;
  ctx.beginPath();
  ctx.arc(hx2, GROUND_Y, 110, Math.PI, 0);
  ctx.fill();
  // Hill highlight
  ctx.fillStyle = '#00cc00';
  ctx.beginPath();
  ctx.arc(hx1 - 15, GROUND_Y - 40, 30, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(hx2 - 20, GROUND_Y - 55, 40, Math.PI, 0);
  ctx.fill();
}

function drawGround() {
  // Green top row
  ctx.fillStyle = '#00a800';
  ctx.fillRect(0, GROUND_Y, W, 16);
  ctx.fillStyle = '#00cc00';
  ctx.fillRect(0, GROUND_Y, W, 6);

  // Brown underground
  ctx.fillStyle = '#a04820';
  ctx.fillRect(0, GROUND_Y + 16, W, H - GROUND_Y - 16);
  // Underground bricks
  ctx.fillStyle = '#884010';
  const brickW = 28, brickH = 14;
  for (let row = 0; row * brickH < H - GROUND_Y - 16; row++) {
    for (let col = 0; col * brickW < W + brickW; col++) {
      const offset = (row % 2) * (brickW / 2);
      ctx.fillRect(col * brickW - offset, GROUND_Y + 16 + row * brickH, brickW - 2, brickH - 2);
    }
  }
}

function drawPipes() {
  const t = progress / STEPS_TO_WIN;
  const scrollX = -t * W * 0.6;
  const pipePositions = [W * 0.35, W * 0.65, W * 0.9];

  pipePositions.forEach(px => {
    const x = px + scrollX;
    if (x < -50 || x > W + 50) return;
    const pipeH = 60;
    ctx.fillStyle = '#00aa00';
    ctx.fillRect(x - 18, GROUND_Y - pipeH, 36, pipeH);
    ctx.fillStyle = '#008800';
    ctx.fillRect(x - 18, GROUND_Y - pipeH, 6, pipeH);
    // Pipe top
    ctx.fillStyle = '#00dd00';
    ctx.fillRect(x - 22, GROUND_Y - pipeH - 10, 44, 14);
    ctx.fillStyle = '#00bb00';
    ctx.fillRect(x - 22, GROUND_Y - pipeH - 10, 8, 14);
  });
}

function drawBlocks() {
  const t = progress / STEPS_TO_WIN;
  const scrollX = -t * W * 0.6;
  const blockPositions = [
    { x: W * 0.28, y: GROUND_Y - 80 },
    { x: W * 0.5,  y: GROUND_Y - 80 },
    { x: W * 0.52, y: GROUND_Y - 80 },
    { x: W * 0.54, y: GROUND_Y - 80 },
  ];

  blockPositions.forEach((b, i) => {
    const bx = b.x + scrollX;
    if (bx < -40 || bx > W + 40) return;
    // First block bumps briefly on each keystroke — a small "?" block hit
    const bump = (i === 0 && blockBump > 0) ? -Math.sin((blockBump / 10) * Math.PI) * 6 : 0;
    const by = b.y + bump;
    ctx.fillStyle = '#c8a020';
    ctx.fillRect(bx - 14, by - 14, 28, 28);
    ctx.fillStyle = '#a88018';
    ctx.fillRect(bx - 14, by - 14, 28, 4);
    ctx.fillRect(bx - 14, by - 14, 4, 28);
    ctx.fillStyle = '#ffcc40';
    ctx.fillRect(bx - 12, by - 12, 4, 4);
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('?', bx - 6, by + 4);
  });
}

function drawCoinSparkles() {
  coinSparkles = coinSparkles.filter(s => s.life > 0);
  coinSparkles.forEach(s => {
    s.y += s.vy;
    s.vy -= 0.15;
    s.life--;
    s.spin += 0.5;
    ctx.globalAlpha = Math.max(s.life / 20, 0);
    // Coin spin: alternate a wide oval and a thin sliver to fake rotation
    const wide = Math.abs(Math.sin(s.spin)) * 6 + 1;
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(s.x - wide / 2, s.y - 8, wide, 16);
    ctx.fillStyle = '#a88018';
    ctx.fillRect(s.x - wide / 2, s.y - 8, wide, 2);
  });
  ctx.globalAlpha = 1;
}

function drawFlagpole() {
  const t = progress / STEPS_TO_WIN;
  const scrollX = -t * W * 0.6;
  const fpx = W * 1.05 + scrollX;  // appears near the end

  if (fpx > W + 10) return;

  const poleH = 160;
  ctx.fillStyle = '#888';
  ctx.fillRect(fpx - 2, GROUND_Y - poleH, 4, poleH);
  ctx.fillStyle = '#aaa';
  ctx.fillRect(fpx - 1, GROUND_Y - poleH, 2, poleH);

  // Ball on top
  ctx.fillStyle = '#888';
  ctx.beginPath();
  ctx.arc(fpx, GROUND_Y - poleH, 6, 0, Math.PI * 2);
  ctx.fill();

  // Flag
  const flagY = GROUND_Y - poleH + 6;
  ctx.fillStyle = '#00bb00';
  ctx.fillRect(fpx + 2, flagY, 28, 18);
  ctx.fillStyle = '#009900';
  ctx.fillRect(fpx + 2, flagY, 28, 5);

  // Castle silhouette
  const cx = fpx + 60;
  if (cx < W + 80) {
    ctx.fillStyle = '#aaa';
    ctx.fillRect(cx, GROUND_Y - 90, 70, 90);
    // Battlements
    for (let b = 0; b < 4; b++) {
      ctx.fillStyle = b % 2 === 0 ? '#aaa' : '#888';
      ctx.fillRect(cx + b * 18, GROUND_Y - 110, 14, 22);
    }
    // Door
    ctx.fillStyle = '#333';
    ctx.fillRect(cx + 22, GROUND_Y - 40, 26, 40);
    ctx.beginPath();
    ctx.arc(cx + 35, GROUND_Y - 40, 13, Math.PI, 0);
    ctx.fill();
  }
}

function drawMario() {
  const t = progress / STEPS_TO_WIN;
  // Mario stays at about 1/3 from left, world scrolls around him
  const mx = Math.floor(W * 0.28);
  const groundOffset = marioJump;
  const my = GROUND_Y - 16 - groundOffset;

  const walkFrame = Math.floor(frame / 6) % 2;
  let sprite;
  if (marioJump > 0) {
    sprite = MARIO_JUMP;
  } else if (t > 0 && t < 1) {
    sprite = walkFrame === 0 ? MARIO_RUN_A : MARIO_RUN_B;
  } else {
    sprite = MARIO_STAND;
  }

  if (jumpFlash > 0) { ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 14; }
  drawPxSprite(sprite, mx - 8, my - 15, PX, '#e82020', '#4444ff');
  ctx.shadowBlur = 0;
}

function drawScore() {
  ctx.fillStyle = '#fff';
  ctx.font = '10px "Press Start 2P", monospace';
  // Text shadow keeps the white HUD readable against the bright sky,
  // positioned below the DOM level-badge / HUD scrim panels (a11y)
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 4;
  ctx.textAlign = 'left';
  ctx.fillText('MARIO', 12, 76);
  ctx.fillText(String(score).padStart(6, '0'), 12, 92);
  ctx.textAlign = 'right';
  ctx.fillText(`${Math.floor(progress / STEPS_TO_WIN * 100)}%`, W - 12, 116);
  ctx.textAlign = 'left';
  ctx.shadowBlur = 0;
}

function render() {
  if (!active) return;
  frame++;
  ctx.clearRect(0, 0, W, H);

  drawSky();
  drawClouds();
  drawHills();
  drawGoomba();
  drawBlocks();
  drawPipes();
  drawGround();
  drawFlagpole();
  drawMario();
  drawCoinSparkles();
  drawScore();

  // Mario jump physics
  if (marioJump > 0 || marioJumpVy > 0) {
    marioJump += marioJumpVy;
    marioJumpVy -= 0.5;
    if (marioJump <= 0) { marioJump = 0; marioJumpVy = 0; }
  }

  if (jumpFlash > 0) jumpFlash--;
  if (blockBump > 0) blockBump--;
  animId = requestAnimationFrame(render);
}

// ─── API ──────────────────────────────────────────────────────────────────────

export function start() {
  getCanvas();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  active = true; victoryMode = false; frame = 0;
  progress = 0; score = 0; jumpFlash = 0; marioJump = 0; marioJumpVy = 0;
  coinSparkles = []; blockBump = 0;
  buildLayout();
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  coinSparkles = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  progress++;
  score += 100;
  // Mario jumps on every other keystroke
  if (Math.floor(frame / 1) % 3 === 0 || marioJump === 0) {
    marioJumpVy = 7;
    marioJump = Math.max(marioJump, 1);
  }
  jumpFlash = 8;
  blockBump = 10;
  const mx = Math.floor(W * 0.28);
  coinSparkles.push({ x: mx, y: GROUND_Y - 60, vy: -3, life: 20, spin: 0 });
}

export function miss() {}

export function patternComplete() {
  return progress >= STEPS_TO_WIN;
}

export function victory() {
  victoryMode = true;
  marioJumpVy = 10;
}

window.addEventListener('resize', () => {
  if (active) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    buildLayout();
  }
});
