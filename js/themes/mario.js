// Level 9: Super Mario Bros (Nintendo, 1985)
// An NES overworld composed AROUND the fixed UI: the ground + brick strip runs
// along the bottom (below the keyboard guide) with Mario running on it in full
// view; question blocks + a pipe live in the left stage margin; hills, a
// flagpole and a castle silhouette live in the right stage margin; clouds and a
// parallax hill ridge drift across the top band above the prompt. The sky is
// ambient fill and continues behind the panels so the scene reads continuous.
//
// LAYOUT CONTRACT (see task): the UI owns the center; the theme owns the frame.
// Reserved (never place focal art here): prompt ~0.40-0.60W x 0.19-0.43H;
// keyboard guide ~0.22-0.78W x 0.49-0.81H; HUD corners top-left / top-right.
// Stage regions used: left margin 0-0.22W, right margin 0.78-1.0W, top band
// 0-0.19H, bottom strip 0.81-1.0H. Everything is positioned in canvas
// fractions of W/H, never DOM space.

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
let blockBump = 0;      // "?" block bump animation timer (left-margin block)
let W = 0, H = 0;
let GROUND_Y = 0;       // top of the green ground strip (in the bottom stage strip)

// ─── Victory sequence (the real 1985 flagpole clear) ────────────────────────────
// A scripted timeline that takes exclusive control of Mario: he runs right across
// the scene, leaps onto the flagpole, grabs it and slides down as the flag comes
// down with him, then hops off at the base into a small victory pose while
// fireworks pop over the horizon (the 1985 castle-fireworks nod).
const VICTORY_MS = 3800;
// Phase boundaries in ms from victory start. The GRAB window is deliberately
// wide (400ms) so it is never skipped whole between two frames when the tab is
// throttled (e.g. under the video recorder) — a narrow grab window was the
// original bug: at low framerate Mario teleported to the base and the leap-onto
// -the-pole beat was never rendered. Every position below is derived purely from
// victoryElapsed (wall clock), so a sparse frame lands at a coherent moment.
const V_RUN_END = 1400;    // running toward the pole
const V_GRAB_END = 1800;   // leap onto the pole + cling near the top (400ms)
const V_SLIDE_END = 3100;  // sliding down the pole
// (V_SLIDE_END..VICTORY_MS = hop off + victory pose)
let victoryStart = 0;      // performance.now() at victory() call
let victoryElapsed = 0;    // ms since victory start (clamped)
let fireworks = [];        // bounded pool, spawned during the pose phase
const MAX_FIREWORKS = 6;
const FIREWORK_PARTICLES = 14;

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function buildLayout() {
  W = canvas.width; H = canvas.height;
  // Ground sits in the bottom strip (below the keyboard guide at ~0.81H) so
  // Mario running on it is fully visible, not behind the panel.
  GROUND_Y = Math.floor(H * 0.845);

  // Clouds drift across the top band (above the prompt at 0.19H), kept out of
  // the reserved prompt column horizontally so nothing needed hides behind it.
  clouds = [
    { x: W * 0.06, y: H * 0.05, w: 80, h: 30 },
    { x: W * 0.30, y: H * 0.10, w: 110, h: 38 },
    { x: W * 0.68, y: H * 0.06, w: 70, h: 25 },
    { x: W * 0.90, y: H * 0.11, w: 90, h: 32 },
  ];
}

// ─── Pixel sprites ────────────────────────────────────────────────────────────

const PX = 4;

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
  // Ambient fill — a vertical gradient continues behind the panels so the
  // whole picture reads as one continuous sky.
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  grad.addColorStop(0, '#5c94fc');
  grad.addColorStop(1, '#8bb8ff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, GROUND_Y);
}

function drawCloud(cl) {
  ctx.fillStyle = '#fff';
  ctx.fillRect(cl.x, cl.y + cl.h * 0.4, cl.w, cl.h * 0.6);
  ctx.fillRect(cl.x + cl.w * 0.2, cl.y + cl.h * 0.15, cl.w * 0.4, cl.h * 0.4);
  ctx.fillRect(cl.x + cl.w * 0.1, cl.y + cl.h * 0.25, cl.w * 0.22, cl.h * 0.25);
  ctx.fillRect(cl.x + cl.w * 0.55, cl.y + cl.h * 0.2, cl.w * 0.25, cl.h * 0.3);
}

function drawClouds() {
  // Slow parallax drift across the top band. Wrap horizontally so the band
  // always feels populated.
  const drift = (frame * 0.25);
  clouds.forEach(cl0 => {
    let x = (cl0.x - drift) % (W + cl0.w + 200);
    if (x < -cl0.w - 100) x += (W + cl0.w + 200);
    drawCloud({ x, y: cl0.y, w: cl0.w, h: cl0.h });
  });
}

function drawTopRidge() {
  // A distant hill ridge scrolling slowly across the top band — parallax depth
  // that lives above the prompt (0.19H) and never enters the reserved column.
  const ridgeY = H * 0.16;
  const drift = (frame * 0.4) % 120;
  ctx.fillStyle = 'rgba(0,150,0,0.35)';
  ctx.beginPath();
  ctx.moveTo(-120, ridgeY + 40);
  for (let x = -120; x < W + 120; x += 120) {
    ctx.arc(x - drift + 60, ridgeY + 40, 60, Math.PI, 0);
  }
  ctx.lineTo(W + 120, ridgeY + 60);
  ctx.lineTo(-120, ridgeY + 60);
  ctx.closePath();
  ctx.fill();
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
  // Goomba patrols the bottom strip in full view, walking back and forth in the
  // center-bottom (below the keyboard guide, so nothing is buried).
  const range = W * 0.18;
  const cx = W * 0.5;
  const gx = cx + Math.sin(frame * 0.012) * range;
  const walkFrame = Math.floor(frame / 10) % 2;
  const sprite = walkFrame === 0 ? GOOMBA_A : GOOMBA_B;
  const size = 4;
  ctx.fillStyle = '#a0522d';
  sprite.forEach((row, r) => row.forEach((c, cc) => {
    if (c) ctx.fillRect(gx + cc * size, GROUND_Y - 20 + r * size, size, size);
  }));
}

function drawGround() {
  // Green top row + brown brick underground, full width along the bottom strip.
  ctx.fillStyle = '#00a800';
  ctx.fillRect(0, GROUND_Y, W, 16);
  ctx.fillStyle = '#00cc00';
  ctx.fillRect(0, GROUND_Y, W, 6);

  ctx.fillStyle = '#a04820';
  ctx.fillRect(0, GROUND_Y + 16, W, H - GROUND_Y - 16);
  ctx.fillStyle = '#884010';
  const brickW = 30, brickH = 15;
  for (let row = 0; row * brickH < H - GROUND_Y - 16; row++) {
    for (let col = 0; col * brickW < W + brickW; col++) {
      const offset = (row % 2) * (brickW / 2);
      ctx.fillRect(col * brickW - offset, GROUND_Y + 16 + row * brickH, brickW - 2, brickH - 2);
    }
  }
}

function drawLeftMargin() {
  // A pipe + a floating "?" block cluster anchored in the left stage margin
  // (0-0.22W), rising from the ground so it's clearly visible beside the UI.
  const pipeX = W * 0.09;
  const pipeH = Math.floor(H * 0.13);
  ctx.fillStyle = '#00aa00';
  ctx.fillRect(pipeX - 22, GROUND_Y - pipeH, 44, pipeH);
  ctx.fillStyle = '#008800';
  ctx.fillRect(pipeX - 22, GROUND_Y - pipeH, 8, pipeH);
  ctx.fillStyle = '#00dd00';
  ctx.fillRect(pipeX - 28, GROUND_Y - pipeH - 12, 56, 16);
  ctx.fillStyle = '#00bb00';
  ctx.fillRect(pipeX - 28, GROUND_Y - pipeH - 12, 10, 16);

  // Floating "?" block above the pipe — this is the one that bumps on keystroke.
  const bump = blockBump > 0 ? -Math.sin((blockBump / 10) * Math.PI) * 8 : 0;
  const bx = W * 0.15;
  const by = GROUND_Y - Math.floor(H * 0.30) + bump;
  drawQBlock(bx, by);
}

function drawQBlock(bx, by) {
  const s = 34;
  ctx.fillStyle = '#e8a020';
  ctx.fillRect(bx - s / 2, by - s / 2, s, s);
  ctx.fillStyle = '#c88018';
  ctx.fillRect(bx - s / 2, by - s / 2, s, 5);
  ctx.fillRect(bx - s / 2, by - s / 2, 5, s);
  // corner rivets
  ctx.fillStyle = '#ffcc40';
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
    ctx.fillRect(bx + dx * (s / 2 - 6) - 2, by + dy * (s / 2 - 6) - 2, 4, 4);
  });
  ctx.fillStyle = '#fff';
  ctx.font = '16px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', bx, by + 1);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// Flagpole geometry — one source of truth, shared by scenery + the victory run.
function flagpoleX() { return W * 0.965; }
function flagpoleH() { return Math.floor(H * 0.34); }
function flagpoleTopY() { return GROUND_Y - flagpoleH(); }

function drawRightMargin() {
  // Green hills + flagpole + castle in the right stage margin (0.78-1.0W).
  const hx = W * 0.87;
  // Big rounded hill
  ctx.fillStyle = '#00a800';
  ctx.beginPath();
  ctx.arc(hx, GROUND_Y, 95, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#00cc00';
  ctx.beginPath();
  ctx.arc(hx - 25, GROUND_Y - 45, 34, Math.PI, 0);
  ctx.fill();

  // Flagpole — the goal, right edge of frame (stands during normal play too)
  const fpx = flagpoleX();
  const poleH = flagpoleH();
  const topY = flagpoleTopY();
  ctx.fillStyle = '#bbb';
  ctx.fillRect(fpx - 3, topY, 5, poleH);
  ctx.fillStyle = '#888';
  ctx.beginPath();
  ctx.arc(fpx, topY, 7, 0, Math.PI * 2);
  ctx.fill();

  // Flag height. During play it climbs with progress. During the victory clear
  // it rides DOWN pinned just ABOVE Mario's grip (the real 1985 cue): the flag
  // sits a fixed gap over the top of his sprite so the two never fuse — the
  // original bug had the flag and Mario stacked at the same Y, so Mario's small
  // sprite was swallowed by the flag and read as absent.
  let flagY;
  if (victoryMode && victoryElapsed >= V_GRAB_END) {
    // Clinging/sliding: flag hovers just above Mario's hands.
    flagY = victoryClingTopY() - 12;
  } else if (victoryMode) {
    flagY = topY + 10; // held at the top through the run + leap
  } else {
    const flagT = 1 - Math.min(progress / STEPS_TO_WIN, 1);
    flagY = topY + 10 + (poleH - 40) * flagT;
  }
  ctx.fillStyle = '#00bb00';
  ctx.beginPath();
  ctx.moveTo(fpx - 2, flagY);
  ctx.lineTo(fpx - 34, flagY + 11);
  ctx.lineTo(fpx - 2, flagY + 22);
  ctx.closePath();
  ctx.fill();
}

// The scaled cling geometry, one source of truth shared by the flag and Mario so
// they always track together (with a fixed gap). Returns the Y of the TOP of
// Mario's sprite while he clings to / slides down the pole. During the GRAB
// window he holds near the top; through SLIDE he descends to his standing height
// at the base. All wall-clock (victoryElapsed) derived + clamped — F1 safe.
function victoryClingTopY() {
  const groundTop = (GROUND_Y - 4) - MARIO_H; // sprite top when standing at base
  const holdTop = flagpoleTopY() + 24;        // clinging near the pole's top
  let s = (victoryElapsed - V_GRAB_END) / (V_SLIDE_END - V_GRAB_END);
  s = Math.max(0, Math.min(1, s));            // 0 at grab, 1 at base
  return holdTop + (groundTop - holdTop) * s;
}

function drawCoinSparkles() {
  coinSparkles = coinSparkles.filter(s => s.life > 0);
  coinSparkles.forEach(s => {
    s.y += s.vy;
    s.vy += 0.18;
    s.life--;
    s.spin += 0.5;
    ctx.globalAlpha = Math.max(s.life / 26, 0);
    const wide = Math.abs(Math.sin(s.spin)) * 8 + 2;
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(s.x - wide / 2, s.y - 10, wide, 20);
    ctx.fillStyle = '#a88018';
    ctx.fillRect(s.x - wide / 2, s.y - 10, wide, 3);
  });
  ctx.globalAlpha = 1;
}

const MARIO_H = 5 * PX; // sprite is 5 rows tall

function drawMario() {
  if (victoryMode) { drawVictoryMario(); return; }

  // Mario runs/idles on the ground in the bottom strip, positioned left of
  // center-bottom so he's in clear view under the prompt gap, not behind panels.
  const mx = Math.floor(W * 0.34);
  const my = GROUND_Y - 20 - marioJump;

  const walkFrame = Math.floor(frame / 6) % 2;
  let sprite;
  if (marioJump > 0) sprite = MARIO_JUMP;
  else sprite = walkFrame === 0 ? MARIO_RUN_A : MARIO_RUN_B;

  if (jumpFlash > 0) { ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 14; }
  drawPxSprite(sprite, mx - 10, my, PX, '#e82020', '#4444ff');
  ctx.shadowBlur = 0;
}

// The scripted flagpole clear. Every position is derived from victoryElapsed so
// a frame landing anywhere in the sequence reads as a coherent moment — no
// per-frame state drift, no reliance on a steady framerate (the recorder/tab
// throttling that broke the original). Mario clings on the LEFT of the pole with
// clear sky behind him so his sprite always reads, never fused with the flag.
function drawVictoryMario() {
  const startX = Math.floor(W * 0.34);
  const fpx = flagpoleX();
  const clingX = fpx - 22;         // Mario clings on the left face of the pole
  const groundFeet = GROUND_Y - 4; // feet resting on the green strip
  const e = victoryElapsed;

  let spriteTopX, spriteTopY, sprite, flip = false;

  if (e < V_RUN_END) {
    // Phase 1 — run rightward toward the pole (full run cycle on the ground).
    const t = Math.max(0, Math.min(1, e / V_RUN_END));
    const x = startX + (clingX - startX) * t;
    spriteTopX = x - 10;
    spriteTopY = groundFeet - MARIO_H;
    const walkFrame = Math.floor(frame / 4) % 2;
    sprite = walkFrame === 0 ? MARIO_RUN_A : MARIO_RUN_B;
  } else if (e < V_SLIDE_END) {
    // Phases 2+3 — leap onto the pole near the top (GRAB) then slide down it,
    // riding the flag down. Both use the shared cling geometry so Mario and the
    // flag descend together with a fixed gap; at the top of the GRAB window he
    // snaps to the pole's top (victoryClingTopY clamps s to 0 before V_SLIDE).
    spriteTopX = clingX - 10;
    spriteTopY = victoryClingTopY();
    sprite = MARIO_JUMP;
  } else {
    // Phase 4 — hop off at the base into a victory pose, facing back toward the
    // arcade (flipped), standing proud on the ground beside the pole.
    spriteTopX = clingX - 34;
    spriteTopY = groundFeet - MARIO_H;
    sprite = MARIO_STAND;
    flip = true;
  }

  drawPxSprite(sprite, spriteTopX, spriteTopY, PX, '#e82020', '#4444ff', flip);
}

// ─── Fireworks (victory pose — the 1985 castle-fireworks nod) ───────────────────

const FIREWORK_COLORS = ['#ffd700', '#ff5050', '#50c0ff', '#50ff70', '#ffffff'];

function spawnFirework() {
  if (fireworks.length >= MAX_FIREWORKS) return;
  // Pop over the horizon in the top band (above the prompt, 0-0.19H), spread
  // across the width but biased away from the reserved prompt column.
  const cx = W * (0.05 + Math.random() * 0.9);
  const cy = H * (0.05 + Math.random() * 0.11);
  const col = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
  const parts = [];
  for (let i = 0; i < FIREWORK_PARTICLES; i++) {
    const a = (i / FIREWORK_PARTICLES) * Math.PI * 2;
    const sp = 1.6 + Math.random() * 1.4;
    parts.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp });
  }
  fireworks.push({ parts, col, life: 40, max: 40 });
}

function drawFireworks() {
  for (let i = fireworks.length - 1; i >= 0; i--) {
    const fw = fireworks[i];
    fw.life--;
    if (fw.life <= 0) { fireworks.splice(i, 1); continue; }
    const alpha = Math.max(0, fw.life / fw.max);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fw.col;
    fw.parts.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gentle gravity
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    });
  }
  ctx.globalAlpha = 1;
}

function drawScore() {
  ctx.fillStyle = '#fff';
  ctx.font = '10px "Press Start 2P", monospace';
  // Text shadow keeps the white HUD readable against the sky; kept clear of the
  // DOM HUD corners (this sits below the top-left level badge).
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 4;
  ctx.textAlign = 'left';
  ctx.fillText('MARIO', 24, H * 0.11);
  ctx.fillText(String(score).padStart(6, '0'), 24, H * 0.11 + 18);
  ctx.shadowBlur = 0;
}

function render() {
  if (!active) return;
  frame++;

  if (victoryMode) {
    // Clamp elapsed to the sequence length (F1: no sentinel values reach geometry).
    victoryElapsed = Math.min(performance.now() - victoryStart, VICTORY_MS);
    // Fireworks begin at the pose phase and keep popping through the hold.
    if (victoryElapsed >= V_SLIDE_END && frame % 14 === 0) spawnFirework();
  }

  ctx.clearRect(0, 0, W, H);

  drawSky();
  drawTopRidge();
  drawClouds();
  if (victoryMode) drawFireworks();
  drawGround();
  drawLeftMargin();
  drawRightMargin();
  drawGoomba();
  drawMario();
  drawCoinSparkles();
  drawScore();

  // Mario jump physics (ordinary per-keystroke hop — suspended during victory,
  // when the scripted timeline owns Mario's position).
  if (!victoryMode && (marioJump > 0 || marioJumpVy > 0)) {
    marioJump += marioJumpVy;
    marioJumpVy -= 0.6;
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
  victoryStart = 0; victoryElapsed = 0; fireworks = [];
  buildLayout();
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  coinSparkles = [];
  fireworks = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  progress++;
  score += 100;
  // Mario hops on each keystroke.
  marioJumpVy = 9;
  marioJump = Math.max(marioJump, 1);
  jumpFlash = 8;
  blockBump = 10;
  // Coin pops up out of the bumping "?" block in the left margin.
  const bx = W * 0.15;
  const by = GROUND_Y - Math.floor(H * 0.30);
  coinSparkles.push({ x: bx, y: by - 20, vy: -5, life: 26, spin: 0 });
}

export function miss() {}

export function patternComplete() {
  return progress >= STEPS_TO_WIN;
}

export function victory() {
  // The win state takes exclusive control of the timeline: Mario runs to the
  // flagpole, grabs it, slides down with the flag, then hops off into a victory
  // pose while fireworks pop over the horizon. Position is derived entirely from
  // victoryElapsed (set each frame in render), so the sequence is deterministic.
  victoryMode = true;
  victoryStart = performance.now();
  victoryElapsed = 0;
  fireworks = [];
  // Cancel any in-flight ordinary hop so it doesn't fight the scripted run.
  marioJump = 0; marioJumpVy = 0; jumpFlash = 0;
  score += 5000; // real SMB flagpole bonus (top-of-pole reach)
  return VICTORY_MS;
}

window.addEventListener('resize', () => {
  if (active) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    buildLayout();
  }
});
