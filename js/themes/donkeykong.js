// Level 6: Donkey Kong (Nintendo, 1981)
// Mario climbs four girder floors to reach Pauline while barrels roll down.

let canvas, ctx;
let animId = null, active = false, victoryMode = false;
let frame = 0;

let progress = 0;
const STEPS_TO_WIN = 32;

let barrels = [], barrelTimer = 0;
let dkArmFrame = 0, dkArmTimer = 0;
let dkBeatFrame = 0, dkBeatTimer = 0;  // chest-beat idle animation
let jumpFlash = 0;   // brief glow when keystroke fires
let sparks = [];     // keystroke particle burst
let score = 0;

// Layout (computed on start/resize)
let W = 0, H = 0;
let floors = [];     // { y, xa, xb, tiltSign }
let ladders = [];    // { x, y1, y2 }
let dkPos = {};
let paulinePos = {};
let path = [];       // waypoints Mario walks through
let skyBands = [];   // precomputed dithered sky gradient bands
let girderCity = []; // precomputed distant background girder silhouettes (parallax)

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function buildLayout() {
  W = canvas.width; H = canvas.height;

  // Four floors ascending from bottom — alternate tilt direction
  const fH = Math.floor(H * 0.15);
  const gap = Math.floor((H * 0.82 - fH * 4) / 3);
  floors = [];
  for (let i = 0; i < 4; i++) {
    const y = Math.floor(H * 0.85) - i * (fH + gap);
    const tilt = (i % 2 === 0 ? 1 : -1) * Math.floor(H * 0.022);
    // xa = left edge, xb = right edge (with tilt applied vertically)
    floors.push({ y, xa: Math.floor(W * 0.05), xb: Math.floor(W * 0.95), tilt });
  }

  // Ladders between floors (alternating sides)
  ladders = [
    { x: Math.floor(W * 0.72), y1: floors[1].y, y2: floors[0].y },
    { x: Math.floor(W * 0.28), y1: floors[2].y, y2: floors[1].y },
    { x: Math.floor(W * 0.72), y1: floors[3].y, y2: floors[2].y },
  ];

  // DK sits above top floor on left side
  dkPos = { x: Math.floor(W * 0.08), y: floors[3].y - Math.floor(H * 0.09) };
  paulinePos = { x: Math.floor(W * 0.22), y: floors[3].y - Math.floor(H * 0.07) };

  // Path waypoints Mario visits in order (progress 0..STEPS_TO_WIN maps along this path)
  path = [
    { x: floors[0].xa + 18, y: floors[0].y - 16 },            // start bottom-left
    { x: ladders[0].x - 8,  y: floors[0].y - 16 },            // walk to ladder 0
    { x: ladders[0].x - 8,  y: floors[1].y - 16 },            // climb ladder 0
    { x: ladders[1].x + 8,  y: floors[1].y - 16 },            // walk across floor 1
    { x: ladders[1].x + 8,  y: floors[2].y - 16 },            // climb ladder 1
    { x: ladders[2].x - 8,  y: floors[2].y - 16 },            // walk across floor 2
    { x: ladders[2].x - 8,  y: floors[3].y - 16 },            // climb ladder 2
    { x: paulinePos.x - 4,  y: floors[3].y - 16 },            // reach Pauline
  ];

  buildSkyBands();
  buildGirderCity();
}

// NES-era banding: discrete horizontal color steps instead of a smooth canvas
// gradient (era authenticity — no gradients in Act 2). Precomputed once.
function buildSkyBands() {
  skyBands = [];
  const bandCount = 6;
  const stops = ['#0a0500', '#160800', '#220c00', '#2e1200', '#3a1800', '#160800'];
  for (let i = 0; i < bandCount; i++) {
    skyBands.push({ y: Math.floor((H * 0.0) + (i / bandCount) * H * 0.86), col: stops[i] });
  }
}

// Distant silhouette of girder floors behind the main structure — cheap parallax
// depth cue (precomputed, static; only drawn, never recomputed per frame).
function buildGirderCity() {
  girderCity = [];
  for (let i = 0; i < 3; i++) {
    girderCity.push({
      y: Math.floor(H * 0.2) + i * Math.floor(H * 0.16),
      xa: Math.floor(W * 0.02),
      xb: Math.floor(W * 0.98),
    });
  }
}

function getMarioPos() {
  const t = Math.min(progress / STEPS_TO_WIN, 1);
  const segs = path.length - 1;
  const segIdx = Math.min(Math.floor(t * segs), segs - 1);
  const segT = (t * segs) - segIdx;
  const a = path[segIdx], b = path[segIdx + 1];
  return {
    x: a.x + (b.x - a.x) * segT,
    y: a.y + (b.y - a.y) * segT,
    onLadder: (Math.abs(b.x - a.x) < 4), // vertical segment
    facingRight: b.x >= a.x,
  };
}

// ─── Pixel sprites ────────────────────────────────────────────────────────────

const PX = 3;

const MARIO_RUN_A = [
  [0,1,1,1,0],
  [1,1,0,1,1],
  [0,1,1,1,0],
  [0,1,0,1,0],
  [1,0,0,0,1],
];
const MARIO_RUN_B = [
  [0,1,1,1,0],
  [1,1,0,1,1],
  [0,1,1,1,0],
  [1,1,0,1,1],
  [0,1,0,1,0],
];
const MARIO_CLIMB = [
  [0,1,1,1,0],
  [1,1,0,0,1],
  [0,1,1,1,0],
  [1,0,1,0,1],
  [0,0,1,0,0],
];

const DK_SPRITE = [
  [0,1,1,1,1,1,1,0],
  [1,1,0,1,1,0,1,1],
  [1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,0],
  [0,0,1,0,0,1,0,0],
  [0,1,1,0,0,1,1,0],
];
const DK_THROW = [
  [0,1,1,1,1,1,1,0],
  [1,1,0,1,1,0,1,1],
  [1,1,1,1,1,1,1,1],
  [0,1,1,1,1,0,1,1],  // arm raised
  [0,0,1,0,0,1,0,0],
  [0,1,1,0,0,1,1,0],
];

const PAULINE_SPRITE = [
  [0,1,1,0],
  [1,0,1,0],
  [0,1,1,0],
  [0,1,0,0],
  [1,1,1,0],
];

function drawPx(shape, x, y, size, col, flipH = false) {
  ctx.fillStyle = col;
  const w = shape[0].length;
  shape.forEach((row, r) => row.forEach((c, cc) => {
    if (c) ctx.fillRect(x + (flipH ? w - 1 - cc : cc) * size, y + r * size, size, size);
  }));
}

// ─── Draw functions ───────────────────────────────────────────────────────────

function drawBackground() {
  // Dithered banding (era-authentic stand-in for a gradient)
  skyBands.forEach((b, i) => {
    const next = skyBands[i + 1];
    const bandH = (next ? next.y : H * 0.86) - b.y;
    ctx.fillStyle = b.col;
    ctx.fillRect(0, b.y, W, bandH);
  });
  ctx.fillStyle = '#0a0500';
  ctx.fillRect(0, Math.floor(H * 0.86), W, H - Math.floor(H * 0.86));

  // Distant girder city — faint background floors for parallax depth
  ctx.strokeStyle = 'rgba(160, 70, 20, 0.18)';
  ctx.lineWidth = 3;
  girderCity.forEach(g => {
    ctx.beginPath();
    ctx.moveTo(g.xa, g.y);
    ctx.lineTo(g.xb, g.y);
    ctx.stroke();
  });

  // A few dim background window lights (dithered pixels, not glow)
  ctx.fillStyle = 'rgba(255, 180, 60, 0.12)';
  for (let i = 0; i < 10; i++) {
    const wx = (i * 97 + 40) % W;
    const wy = Math.floor(H * 0.08) + (i % 3) * Math.floor(H * 0.05);
    ctx.fillRect(wx, wy, 4, 4);
  }
}

function drawFloor(f, idx) {
  const tilt = f.tilt;
  // Girder with slight tilt (left side higher/lower)
  ctx.fillStyle = '#3a1a00';
  ctx.beginPath();
  ctx.moveTo(f.xa, f.y + tilt);
  ctx.lineTo(f.xb, f.y - tilt);
  ctx.lineTo(f.xb, f.y - tilt + 10);
  ctx.lineTo(f.xa, f.y + tilt + 10);
  ctx.closePath();
  ctx.fill();

  // Steel highlight
  ctx.fillStyle = '#c07030';
  ctx.beginPath();
  ctx.moveTo(f.xa, f.y + tilt);
  ctx.lineTo(f.xb, f.y - tilt);
  ctx.lineTo(f.xb, f.y - tilt + 3);
  ctx.lineTo(f.xa, f.y + tilt + 3);
  ctx.closePath();
  ctx.fill();

  // Rivets
  ctx.fillStyle = '#80400a';
  for (let rx = f.xa + 18; rx < f.xb - 10; rx += 28) {
    const ry = f.y + tilt - (rx - f.xa) / (f.xb - f.xa) * tilt * 2 + 4;
    ctx.fillRect(rx, ry, 4, 4);
  }
}

function drawLadder(l) {
  ctx.fillStyle = '#885500';
  ctx.fillRect(l.x - 5, l.y1, 4, l.y2 - l.y1);
  ctx.fillRect(l.x + 2, l.y1, 4, l.y2 - l.y1);
  // Rungs
  ctx.fillStyle = '#cc8830';
  for (let ry = l.y1 + 8; ry < l.y2; ry += 12) {
    ctx.fillRect(l.x - 5, ry, 10, 3);
  }
}

function drawDK() {
  const sp = (dkArmFrame > 0) ? DK_THROW : DK_SPRITE;
  // Idle chest-beat: brief vertical squash/stretch bounce between throws
  const beatBounce = dkBeatFrame > 0 ? -2 : 0;
  drawPx(sp, dkPos.x, dkPos.y + beatBounce, PX - 1, '#8B4513');
  // Eyes
  ctx.fillStyle = '#fff';
  ctx.fillRect(dkPos.x + 6, dkPos.y + 4 + beatBounce, 4, 3);
  ctx.fillRect(dkPos.x + 14, dkPos.y + 4 + beatBounce, 4, 3);
  ctx.fillStyle = '#000';
  ctx.fillRect(dkPos.x + 7, dkPos.y + 5 + beatBounce, 2, 2);
  ctx.fillRect(dkPos.x + 15, dkPos.y + 5 + beatBounce, 2, 2);
}

function drawPauline() {
  if (progress >= STEPS_TO_WIN - 2) {
    // Wave when Mario arrives
    drawPx(PAULINE_SPRITE, paulinePos.x, paulinePos.y, PX - 1, '#ff66aa');
  } else {
    drawPx(PAULINE_SPRITE, paulinePos.x, paulinePos.y, PX - 1, '#cc4488');
  }
}

function drawMario() {
  const mp = getMarioPos();
  const walkCycle = Math.floor(frame / 6) % 2;
  let sprite, col;

  if (mp.onLadder) {
    sprite = MARIO_CLIMB;
    col = '#e82020';
  } else {
    sprite = walkCycle === 0 ? MARIO_RUN_A : MARIO_RUN_B;
    col = '#e82020';
  }

  if (jumpFlash > 0) {
    ctx.shadowColor = '#fff'; ctx.shadowBlur = 12;
  }
  drawPx(sprite, Math.round(mp.x), Math.round(mp.y), PX - 1, col, !mp.facingRight);
  ctx.shadowBlur = 0;
}

// Barrel roll cycle — 4 rotation frames give the barrel a rolling motion
// instead of a static box (multi-frame animation, precomputed per barrel).
function drawBarrels() {
  barrels.forEach(b => {
    const rollFrame = Math.floor(b.rollPhase || 0) % 4;
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(b.x - 5, b.y - 5, 10, 10);
    ctx.fillStyle = '#D2691E';
    ctx.fillRect(b.x - 4, b.y - 4, 8, 8);
    // Rolling stave bands rotate position each frame to sell motion
    ctx.fillStyle = '#8B4513';
    if (rollFrame === 0 || rollFrame === 2) {
      ctx.fillRect(b.x - 2, b.y - 5, 4, 2);
      ctx.fillRect(b.x - 2, b.y + 3, 4, 2);
    } else {
      ctx.fillRect(b.x - 5, b.y - 2, 2, 4);
      ctx.fillRect(b.x + 3, b.y - 2, 2, 4);
    }
    // Highlight dot that spins around the barrel face
    const ang = (b.rollPhase || 0) * (Math.PI / 2);
    ctx.fillStyle = '#f0a050';
    ctx.fillRect(b.x + Math.cos(ang) * 2 - 1, b.y + Math.sin(ang) * 2 - 1, 2, 2);
  });
}

function drawScore() {
  ctx.fillStyle = '#e82020';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(String(score).padStart(6, '0'), W - 12, 20);
  ctx.textAlign = 'left';

  // Progress bars (floors climbed indicator)
  for (let i = 0; i < 4; i++) {
    const done = i < Math.floor(progress / STEPS_TO_WIN * 4);
    ctx.fillStyle = done ? '#e82020' : '#2a0800';
    ctx.shadowColor = done ? '#e82020' : 'transparent';
    ctx.shadowBlur = done ? 6 : 0;
    ctx.fillRect(12 + i * 14, 14, 9, 9);
  }
  ctx.shadowBlur = 0;
}

function updateBarrels() {
  if (++barrelTimer > 90) {
    barrelTimer = 0;
    if (barrels.length < 5) {
      barrels.push({
        x: dkPos.x + 20, y: dkPos.y + 10,
        vx: 1.4, vy: 0,
        floor: 3,
        rollPhase: 0,
      });
    }
  }

  const floorThickness = 10;
  barrels = barrels.filter(b => {
    b.vy += 0.18;
    b.x += b.vx;
    b.y += b.vy;
    b.rollPhase = (b.rollPhase || 0) + Math.abs(b.vx) * 0.35;

    // Check floor landing
    for (let fi = b.floor; fi >= 0; fi--) {
      const f = floors[fi];
      const tilt = f.tilt;
      const ty = f.y + tilt - (b.x - f.xa) / (f.xb - f.xa) * tilt * 2;
      if (b.y >= ty && b.y < ty + floorThickness + 12 && b.x >= f.xa && b.x <= f.xb) {
        b.y = ty;
        b.vy = 0;
        b.floor = fi;
        // Roll based on floor tilt direction
        b.vx = f.tilt > 0 ? 1.4 : -1.4;
        break;
      }
    }

    // Fall off edge
    const f = floors[b.floor];
    if (b.floor >= 0 && (b.x < f.xa || b.x > f.xb)) {
      b.floor--;
      b.vy = 1;
    }

    // Remove if fallen off bottom
    return b.y < H + 20;
  });

  if (--dkArmTimer <= 0) { dkArmFrame ^= 1; dkArmTimer = 45; }
  if (--dkBeatTimer <= 0) { dkBeatFrame ^= 1; dkBeatTimer = dkBeatFrame ? 6 : 70; }
}

// Keystroke feedback particles — small steel-rivet sparks that burst from
// Mario's position and fall with gravity. Capped well under the 150 budget.
function spawnSparks(x, y) {
  for (let i = 0; i < 6; i++) {
    sparks.push({
      x, y,
      vx: (Math.random() - 0.5) * 3,
      vy: -Math.random() * 2.5 - 0.5,
      life: 16,
    });
  }
}

function updateSparks() {
  sparks = sparks.filter(s => s.life > 0);
  sparks.forEach(s => {
    s.vy += 0.15;
    s.x += s.vx;
    s.y += s.vy;
    s.life--;
  });
}

function drawSparks() {
  sparks.forEach(s => {
    ctx.globalAlpha = Math.max(s.life / 16, 0);
    ctx.fillStyle = '#ffcc60';
    ctx.fillRect(s.x - 1, s.y - 1, 3, 3);
  });
  ctx.globalAlpha = 1;
}

function render() {
  if (!active) return;
  frame++;
  ctx.clearRect(0, 0, W, H);

  drawBackground();
  floors.forEach((f, i) => drawFloor(f, i));
  ladders.forEach(drawLadder);
  drawDK();
  drawPauline();
  drawBarrels();
  drawMario();
  drawSparks();
  drawScore();

  if (jumpFlash > 0) jumpFlash--;
  updateBarrels();
  updateSparks();

  animId = requestAnimationFrame(render);
}

// ─── API ──────────────────────────────────────────────────────────────────────

export function start() {
  getCanvas();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  W = canvas.width; H = canvas.height;
  active = true; victoryMode = false; frame = 0; progress = 0;
  barrels = []; barrelTimer = 0; score = 0; sparks = [];
  dkArmFrame = 0; dkArmTimer = 45; dkBeatFrame = 0; dkBeatTimer = 70;
  buildLayout();
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  barrels = []; sparks = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  progress++;
  score += 100;
  jumpFlash = 8;
  const mp = getMarioPos();
  spawnSparks(mp.x + 8, mp.y + 8);
}

export function miss() {}

export function patternComplete() {
  return progress >= STEPS_TO_WIN;
}

export function victory() {
  victoryMode = true;
}

window.addEventListener('resize', () => {
  if (active) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    buildLayout();
  }
});
