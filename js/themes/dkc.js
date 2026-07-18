// Level 14: Donkey Kong Country (Rare/Nintendo, 1994)
//
// The richest-looking Act 3 scene — a lush pre-rendered-style jungle at golden
// sunset. Signature liveness (per the theme-authoring "Mechanics fidelity" rule,
// grounded in generic-platformer play since the DKC wiki page documents only the
// SGI pre-rendered-3D pipeline, not the gameplay loop):
//   * DK RUNS through the world — a weighty knuckle-lope that actually translates
//     him across the jungle floor (idle breathing when momentarily stopped).
//   * Correct keystrokes drive forward BOUNDS/JUMPS and sweep up BANANAS
//     (visible collectibles arcing into DK — the counter that already existed
//     now has visible pickups behind it).
//   * Sequence completion fires the BARREL CANNON — DK is blasted in a big arc
//     between jungle vignettes, the DKC signature travel beat.
//   * The jungle itself lives: multi-layer parallax drift, foliage sway,
//     fireflies drifting in the sunset light. Ambient motion is always-on and
//     L20-safe (it never advances win state); banana/progress accrual is
//     strictly keystroke-gated.

import { getWinRatio } from '../settings.js';

let canvas, ctx;
let frame = 0, animId = null, active = false, victoryMode = false;

// ── Win gating ──
let bananasCollected = 0;
let BANANAS_TO_WIN = 22;               // resolved against getWinRatio() in start()
const BASE_BANANAS = 22;

// ── World scroll (parallax) ──
let scrollX = 0;

// ── DK state ──
// DK lopes along the jungle floor in the bottom stage strip. He translates in
// canvas space (a real run), bounds forward+up on keystrokes, and gets blasted
// in a cannon arc on sequence complete.
let dkX = 0;                           // canvas-space x of DK's centre
let dkVX = 0;                          // horizontal run velocity
let dkPhase = 0;                       // run-cycle phase (drives limb + bob)
let dkBob = 0;                         // vertical bob from the lope
let dkJumpY = 0, dkJumpVy = 0, dkJumpActive = false;
let dkBreath = 0;                      // idle breathing accumulator
let cannonFlight = null;               // {t, dur, x0,y0,x1,y1, spin} when blasted
let lastKeyMs = 0;

// ── Bananas (bounded pool) ──
let bananas = [];                      // floating collectibles to sweep up
let bananaBursts = [];                 // collect sparkle particles
const MAX_BANANAS = 14;
const MAX_BURSTS = 60;

// ── Fireflies (bounded ambient pool) ──
let fireflies = [];
const FIREFLY_COUNT = 22;

// ── Stars ──
let stars = [];

// ── Victory ──
const VICTORY_MS = 3600;
let confetti = [];
const MAX_CONFETTI = 90;

// DK sprite — 13x12 pixel grid — large, with highlight/shadow indices to fake
// the pre-rendered-3D look DKC pioneered.
// (1=base fur, 2=shadow fur, 3=highlight fur, 4=tan face/chest, 5=face shadow,
//  6=white eye, 7=pupil)
const PX = 8;
const DK_W = 13 * PX, DK_H = 12 * PX;

// Two lope frames — arms/legs swap clearly so the run reads at a glance.
const DK_RUN = [
  [
    [0,0,3,1,1,1,1,1,1,1,2,0,0],
    [0,3,1,4,4,4,4,4,4,4,1,2,0],
    [0,1,4,6,6,4,4,6,6,4,1,2,0],
    [0,1,4,6,7,4,4,6,7,4,1,2,0],
    [0,1,4,4,4,4,4,4,4,4,1,2,0],
    [0,0,1,5,4,4,4,4,5,1,0,0,0],
    [2,1,1,1,1,1,1,1,1,1,1,3,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,3,1,1,1,1,3,1,1,0,0],
    [0,0,4,4,0,0,0,0,4,4,0,0,0],
    [0,4,4,4,0,0,0,4,4,4,0,0,0],
    [4,4,4,0,0,0,0,0,0,0,4,4,4],
  ],
  [
    [0,0,3,1,1,1,1,1,1,1,2,0,0],
    [0,3,1,4,4,4,4,4,4,4,1,2,0],
    [0,1,4,6,6,4,4,6,6,4,1,2,0],
    [0,1,4,6,7,4,4,6,7,4,1,2,0],
    [0,1,4,4,4,4,4,4,4,4,1,2,0],
    [0,0,1,5,4,4,4,4,5,1,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,2,3],
    [0,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,1,1,3,1,1,1,1,3,1,1,0],
    [0,0,0,0,4,4,0,0,4,4,0,0,0],
    [0,0,0,4,4,4,0,4,4,4,0,0,0],
    [4,4,4,0,0,0,0,0,0,0,4,4,4],
  ],
];

// Airborne / jump pose — arms up, legs tucked
const DK_JUMP = [
  [4,4,0,3,1,1,1,1,1,2,0,4,4],
  [0,4,4,1,4,4,4,4,4,1,4,4,0],
  [0,0,1,4,6,6,6,6,4,1,0,0,0],
  [0,0,1,4,6,7,7,6,4,1,0,0,0],
  [0,0,1,4,4,4,4,4,4,1,0,0,0],
  [0,0,0,1,5,4,4,5,1,0,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,3,1,1,1,1,3,1,1,0,0],
  [0,0,1,4,4,0,0,4,4,1,0,0,0],
  [0,0,4,4,0,0,0,0,4,4,0,0,0],
  [0,0,4,4,0,0,0,0,4,4,0,0,0],
];

// Victory: arms-up cheer pose
const DK_ARMS_UP = [
  [4,4,0,3,1,1,1,1,1,2,0,4,4],
  [0,4,4,1,4,4,4,4,4,1,4,4,0],
  [0,0,1,4,6,6,6,6,4,1,0,0,0],
  [0,0,1,4,6,7,7,6,4,1,0,0,0],
  [0,0,1,4,4,4,4,4,4,1,0,0,0],
  [0,0,0,1,5,4,4,5,1,0,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,3,1,1,1,1,3,1,1,0,0],
  [0,0,4,4,0,0,0,0,4,4,0,0,0],
  [0,4,4,4,0,0,0,0,4,4,4,0,0],
  [4,4,4,0,0,0,0,0,0,4,4,4,0],
];

const DK_COLS = {
  1: '#6b3a10', 2: '#4a2608', 3: '#8f5420',
  4: '#d9a462', 5: '#a8763c', 6: '#fff8e8', 7: '#1a0e04',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

// Where DK's feet rest, in canvas fractions (bottom stage strip, per layout contract)
function groundLine() { return canvas.height * 0.885; }
function cannonX() { return canvas.width * 0.90; }
function cannonMouthY() { return groundLine() - 46; }

function resize() {
  const c = getCanvas();
  c.width = window.innerWidth; c.height = window.innerHeight;

  stars = [];
  for (let i = 0; i < 40; i++) {
    stars.push({
      x: Math.random() * c.width,
      y: Math.random() * c.height * 0.28,
      r: Math.random() * 1.2 + 0.4,
    });
  }

  fireflies = [];
  for (let i = 0; i < FIREFLY_COUNT; i++) {
    fireflies.push({
      x: Math.random() * c.width,
      y: c.height * (0.30 + Math.random() * 0.55),
      spd: 0.2 + Math.random() * 0.5,
      ph: Math.random() * Math.PI * 2,
      amp: 6 + Math.random() * 14,
      blink: Math.random() * Math.PI * 2,
    });
  }

  // Clamp DK into the run corridor after a resize
  if (dkX <= 0) dkX = c.width * 0.10;
  dkX = Math.max(runMinX(), Math.min(runMaxX(), dkX));
}

// DK's run corridor lives along the bottom, staying clear of the reserved center
function runMinX() { return canvas.width * 0.055; }
function runMaxX() { return canvas.width * 0.30; }

// ─── Draw: pixel sprite ───────────────────────────────────────────────────────

function drawPx(shape, x, y, size, colOrMap) {
  const isMap = typeof colOrMap === 'object';
  for (let r = 0; r < shape.length; r++) {
    const row = shape[r];
    for (let cc = 0; cc < row.length; cc++) {
      const c = row[cc];
      if (!c) continue;
      ctx.fillStyle = isMap ? (colOrMap[c] || '#000') : colOrMap;
      ctx.fillRect(x + cc * size, y + r * size, size, size);
    }
  }
}

// ─── Background layers ─────────────────────────────────────────────────────────

function drawBackground() {
  const W = canvas.width, H = canvas.height;

  // Sky gradient — deep golden sunset melting into dusk purple
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  sky.addColorStop(0, '#150c38');
  sky.addColorStop(0.35, '#3a1f5e');
  sky.addColorStop(0.65, '#a84e3a');
  sky.addColorStop(0.85, '#e8923a');
  sky.addColorStop(1, '#ffce6a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.55);

  // Stars — twinkle, fade near horizon
  for (const s of stars) {
    const twinkle = 0.5 + 0.5 * Math.sin(frame * 0.04 + s.x);
    const fadeOut = Math.max(0, 1 - s.y / (H * 0.22));
    ctx.globalAlpha = twinkle * 0.8 * fadeOut;
    ctx.fillStyle = '#e8e0ff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Sun — low on the horizon, glowing disc with soft halo
  const sunX = W * 0.5, sunY = H * 0.40;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, H * 0.35);
  sunGlow.addColorStop(0, 'rgba(255,220,140,0.55)');
  sunGlow.addColorStop(0.4, 'rgba(255,180,90,0.22)');
  sunGlow.addColorStop(1, 'rgba(255,180,90,0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(sunX - H * 0.35, sunY - H * 0.35, H * 0.7, H * 0.7);
  ctx.fillStyle = '#fff2c8';
  ctx.beginPath(); ctx.arc(sunX, sunY, 30, 0, Math.PI * 2); ctx.fill();

  // God-rays — animated brightness shimmer
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const ang = -Math.PI / 2 + (i - 3) * 0.22;
    const shimmer = 0.10 + 0.06 * Math.sin(frame * 0.02 + i * 1.3);
    ctx.strokeStyle = `rgba(255,220,150,${shimmer})`;
    ctx.lineWidth = 26 - Math.abs(i - 3) * 2;
    ctx.beginPath();
    ctx.moveTo(sunX, sunY);
    ctx.lineTo(sunX + Math.cos(ang) * H * 0.9, sunY + Math.sin(ang) * H * 0.9);
    ctx.stroke();
  }
  ctx.restore();

  // Distant moon rising opposite the sun
  const moonX = W * 0.86, moonY = H * 0.07;
  ctx.fillStyle = 'rgba(232,223,160,0.7)';
  ctx.beginPath(); ctx.arc(moonX, moonY, 15, 0, Math.PI * 2); ctx.fill();

  // Layer 1 (far): distant mountain silhouettes — 5% scroll
  const mx = (scrollX * 0.05) % W;
  ctx.fillStyle = '#1e1040';
  for (let rep = -1; rep <= 1; rep++) {
    const ox = rep * W - mx;
    const mts = [
      { bx: 0,   w: 160, h: 90  }, { bx: 140, w: 200, h: 120 },
      { bx: 320, w: 140, h: 75  }, { bx: 430, w: 220, h: 105 },
      { bx: 620, w: 180, h: 90  }, { bx: 780, w: 160, h: 130 },
      { bx: 900, w: 200, h: 85  },
    ];
    for (const m of mts) {
      const bx = ox + (m.bx / 1100) * W;
      const bw = (m.w / 1100) * W;
      const top = H * 0.32 - (m.h / 130) * H * 0.18;
      ctx.beginPath();
      ctx.moveTo(bx, H * 0.38);
      ctx.lineTo(bx + bw * 0.5, top);
      ctx.lineTo(bx + bw, H * 0.38);
      ctx.fill();
    }
  }

  // Layer 2 (mid): jungle canopy — 15% scroll, sways
  const cx = (scrollX * 0.15) % W;
  const sway = Math.sin(frame * 0.02) * (W * 0.004);
  ctx.fillStyle = '#12280f';
  const trees = [
    { bx: 0,   tw: 90,  th: 55 }, { bx: 70,  tw: 80,  th: 70 },
    { bx: 130, tw: 100, th: 50 }, { bx: 220, tw: 85,  th: 65 },
    { bx: 295, tw: 90,  th: 55 }, { bx: 370, tw: 110, th: 72 },
    { bx: 460, tw: 80,  th: 48 }, { bx: 525, tw: 95,  th: 60 },
    { bx: 610, tw: 85,  th: 68 }, { bx: 685, tw: 100, th: 55 },
    { bx: 775, tw: 90,  th: 62 }, { bx: 855, tw: 80,  th: 52 },
    { bx: 920, tw: 95,  th: 70 }, { bx: 1000,tw: 110, th: 58 },
  ];
  const canopyY = H * 0.52;
  for (let rep = -1; rep <= 1; rep++) {
    const ox = rep * W - cx;
    for (const t of trees) {
      const tx = ox + (t.bx / 1100) * W + sway;
      const tw = (t.tw / 1100) * W;
      const th = (t.th / 130) * H * 0.12;
      ctx.beginPath();
      ctx.arc(tx + tw * 0.5, canopyY - th * 0.3, tw * 0.55, Math.PI, 0);
      ctx.lineTo(tx + tw, canopyY);
      ctx.lineTo(tx, canopyY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillRect(ox, canopyY, W, H - canopyY);
  }

  // Canopy rim light — sunset glow along the treeline
  ctx.fillStyle = 'rgba(255,190,90,0.4)';
  ctx.fillRect(0, canopyY - 4, W, 6);
  ctx.fillStyle = '#1a3312';
  ctx.fillRect(0, canopyY + 2, W, 4);

  // Ground — rich jungle earth
  const groundY = H * 0.85;
  const ground = ctx.createLinearGradient(0, groundY, 0, H);
  ground.addColorStop(0, '#1a4d0a');
  ground.addColorStop(0.3, '#143d08');
  ground.addColorStop(1, '#0a2504');
  ctx.fillStyle = ground;
  ctx.fillRect(0, groundY, W, H - groundY);

  // Scrolling ground texture — knuckle-lit tufts drifting past DK's feet
  ctx.fillStyle = 'rgba(46,168,46,0.35)';
  const tuftX = (scrollX * 0.9) % 90;
  for (let x = -tuftX - 90; x < W + 90; x += 90) {
    const gy = groundLine() + 4;
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + 8, gy - 12);
    ctx.lineTo(x + 16, gy);
    ctx.fill();
  }

  // Golden ground strip at very bottom
  ctx.fillStyle = '#c8820a';
  ctx.fillRect(0, H - 16, W, 8);
  ctx.fillStyle = '#e8a020';
  ctx.fillRect(0, H - 16, W, 3);
}

// ─── Fireflies (ambient) ───────────────────────────────────────────────────────

function drawFireflies() {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const f of fireflies) {
    const blink = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame * 0.06 + f.blink));
    const fx = f.x;
    const fy = f.y + Math.sin(frame * 0.03 + f.ph) * f.amp;
    ctx.globalAlpha = blink * 0.85;
    ctx.fillStyle = '#fff0a0';
    ctx.beginPath();
    ctx.arc(fx, fy, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = blink * 0.3;
    ctx.beginPath();
    ctx.arc(fx, fy, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

// ─── Foreground vines ──────────────────────────────────────────────────────────

function drawForeground() {
  const W = canvas.width, H = canvas.height;
  const vx = (scrollX * 0.40) % 120;

  ctx.fillStyle = '#228b22';
  for (let i = 0; i < 5; i++) {
    const lx = ((i * 40 - vx + 120) % 120) - 10;
    if (lx > W * 0.20) continue;
    const sway = Math.sin(frame * 0.03 + i) * 5;
    for (let y = 0; y < H * 0.80; y += 14) ctx.fillRect(lx + sway, y, 5, 10);
    ctx.fillStyle = '#2ea82e';
    ctx.beginPath();
    ctx.ellipse(lx + sway + 14, H * 0.15 + i * 50, 16, 9, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(lx + sway - 8, H * 0.25 + i * 50, 12, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#228b22';
  }

  ctx.fillStyle = '#228b22';
  for (let i = 0; i < 5; i++) {
    const rx = W - ((i * 40 - vx + 120) % 120) + 5;
    if (rx < W * 0.80) continue;
    const sway = Math.sin(frame * 0.03 + i + 2) * 5;
    for (let y = 0; y < H * 0.80; y += 14) ctx.fillRect(rx + sway, y, 5, 10);
    ctx.fillStyle = '#2ea82e';
    ctx.beginPath();
    ctx.ellipse(rx + sway - 14, H * 0.15 + i * 50, 16, 9, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(rx + sway + 8, H * 0.25 + i * 50, 12, 7, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#228b22';
  }

  ctx.fillStyle = 'rgba(20, 100, 20, 0.6)';
  ctx.fillRect(0, 0, W * 0.035, H);
  ctx.fillRect(W * 0.965, 0, W * 0.035, H);
}

// ─── DK character ─────────────────────────────────────────────────────────────

function currentDKSprite() {
  if (victoryMode) return DK_ARMS_UP;
  if (cannonFlight || dkJumpActive) return DK_JUMP;
  return DK_RUN[dkPhase < Math.PI ? 0 : 1];
}

function dkDrawPos() {
  const groundY = groundLine();
  let cxPos, cyFeet;
  if (cannonFlight) {
    const p = Math.min(1, cannonFlight.t / cannonFlight.dur);
    cxPos = cannonFlight.x0 + (cannonFlight.x1 - cannonFlight.x0) * p;
    // Parabolic arc: peak in the middle
    const arc = Math.sin(p * Math.PI);
    cyFeet = cannonFlight.y0 + (cannonFlight.y1 - cannonFlight.y0) * p - arc * (canvas.height * 0.34);
  } else {
    cxPos = dkX;
    cyFeet = groundY - dkBob - (dkJumpActive ? dkJumpY : 0);
  }
  return { x: cxPos - DK_W / 2, y: cyFeet - DK_H };
}

function drawDK() {
  const { x, y } = dkDrawPos();
  const groundY = groundLine();
  const sprite = currentDKSprite();

  // Ground contact shadow — scales with height off the ground (weight)
  const feetY = y + DK_H;
  const airGap = Math.max(0, groundY - feetY);
  const shadowScale = Math.max(0.3, 1 - airGap / (canvas.height * 0.34));
  ctx.fillStyle = `rgba(0,0,0,${0.32 * shadowScale})`;
  ctx.beginPath();
  ctx.ellipse(x + DK_W / 2, groundY + 3, DK_W * 0.44 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Warm rim glow (the pre-rendered sheen)
  ctx.shadowColor = 'rgba(255,180,80,0.9)';
  ctx.shadowBlur = (Date.now() - lastKeyMs < 260) ? 14 : 7;

  drawPx(sprite, x, y, PX, DK_COLS);
  ctx.shadowBlur = 0;
}

// ─── Barrel cannon ────────────────────────────────────────────────────────────

let cannonRecoil = 0;

function drawCannon() {
  const groundY = groundLine();
  const cx = cannonX();
  const cy = groundY - 52;
  const recoil = cannonRecoil > 0 ? Math.sin(cannonRecoil * 0.9) * 5 : 0;

  ctx.save();
  ctx.translate(cx, recoil);

  // Cannon body (dark wood barrel)
  ctx.fillStyle = '#3d1f00';
  ctx.fillRect(-16, cy, 32, 52);
  ctx.fillStyle = '#5a2e00';
  ctx.fillRect(-16, cy, 32, 4);
  ctx.fillRect(-16, cy + 16, 32, 4);
  ctx.fillRect(-16, cy + 32, 32, 4);
  // Stave highlight
  ctx.fillStyle = 'rgba(255,200,120,0.25)';
  ctx.fillRect(-13, cy, 4, 52);

  // Cannon mouth — angled up-left (toward DK's run corridor)
  ctx.save();
  ctx.translate(0, cy + 8);
  ctx.rotate(-Math.PI * 0.38);
  ctx.fillStyle = '#2a1400';
  ctx.fillRect(-9, -34, 18, 38);
  ctx.fillStyle = '#1a0a00';
  ctx.fillRect(-9, -34, 18, 6);
  ctx.fillStyle = 'rgba(255,200,120,0.2)';
  ctx.fillRect(-9, -34, 4, 38);
  ctx.restore();

  // DKC branding dot
  ctx.fillStyle = '#f0c000';
  ctx.beginPath(); ctx.arc(0, cy + 26, 5, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

// ─── Bananas (collectibles) ────────────────────────────────────────────────────

// Spawn a banana somewhere ahead in the run corridor / gap band, arcing toward
// where DK will be — it will be swept up (collected) shortly after.
function spawnBanana(toDK) {
  if (bananas.length >= MAX_BANANAS) return;
  const W = canvas.width, H = canvas.height;
  // Origin: up in the gap band or side stage, so pickups read as coming from the world
  const ox = W * (0.14 + Math.random() * 0.14);
  const oy = H * (0.42 + Math.random() * 0.10);
  bananas.push({
    x: ox, y: oy,
    vx: 0, vy: 0,
    homing: toDK,
    age: 0,
    wob: Math.random() * Math.PI * 2,
  });
}

function collectBanana(b) {
  bananasCollected = Math.min(BANANAS_TO_WIN, bananasCollected + 1);
  // Sparkle burst at the pickup point
  for (let i = 0; i < 8 && bananaBursts.length < MAX_BURSTS; i++) {
    const a = (i / 8) * Math.PI * 2;
    bananaBursts.push({
      x: b.x, y: b.y,
      dx: Math.cos(a) * (1.5 + Math.random() * 1.8),
      dy: Math.sin(a) * (1.5 + Math.random() * 1.8),
      life: 22 + Math.random() * 10,
      max: 32,
    });
  }
}

function updateBananas() {
  const dk = dkDrawPos();
  const dkCx = dk.x + DK_W / 2, dkCy = dk.y + DK_H * 0.45;
  for (let i = bananas.length - 1; i >= 0; i--) {
    const b = bananas[i];
    b.age++;
    b.wob += 0.15;
    if (b.homing) {
      // Home toward DK, accelerating — a visible sweep-up
      const dx = dkCx - b.x, dy = dkCy - b.y;
      const d = Math.hypot(dx, dy) || 1;
      const pull = 0.55;
      b.vx += (dx / d) * pull;
      b.vy += (dy / d) * pull;
      b.vx *= 0.90; b.vy *= 0.90;
      b.x += b.vx; b.y += b.vy;
      if (d < 26 || b.age > 90) { collectBanana(b); bananas.splice(i, 1); }
    } else {
      // Idle bob in the world until collected
      b.y += Math.sin(b.wob) * 0.4;
      if (b.age > 260) bananas.splice(i, 1);
    }
  }

  for (let i = bananaBursts.length - 1; i >= 0; i--) {
    const p = bananaBursts[i];
    p.x += p.dx; p.y += p.dy; p.dy += 0.08; p.life--;
    if (p.life <= 0) bananaBursts.splice(i, 1);
  }
}

function drawBanana(x, y, wob, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(wob) * 0.3 - 0.4);
  ctx.scale(scale, scale);
  // Banana crescent
  ctx.fillStyle = '#ffd21e';
  ctx.beginPath();
  ctx.moveTo(-7, 3);
  ctx.quadraticCurveTo(0, -11, 8, -3);
  ctx.quadraticCurveTo(3, 2, -3, 6);
  ctx.quadraticCurveTo(-6, 6, -7, 3);
  ctx.fill();
  ctx.fillStyle = '#e8a800';
  ctx.beginPath();
  ctx.moveTo(-6, 3);
  ctx.quadraticCurveTo(0, -7, 6, -2);
  ctx.quadraticCurveTo(2, 2, -3, 5);
  ctx.fill();
  // Tip
  ctx.fillStyle = '#5a4000';
  ctx.fillRect(6, -5, 3, 3);
  ctx.restore();
}

function drawBananas() {
  for (const b of bananas) {
    // Glow so pickups pop
    ctx.shadowColor = 'rgba(255,220,60,0.9)';
    ctx.shadowBlur = b.homing ? 12 : 6;
    drawBanana(b.x, b.y, b.wob, 1.15);
  }
  ctx.shadowBlur = 0;

  for (const p of bananaBursts) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = '#fff2a0';
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  }
  ctx.globalAlpha = 1;
}

// ─── Confetti (victory) ─────────────────────────────────────────────────────────

function drawConfetti() {
  const cols = ['#ffd21e', '#ff6b3d', '#3dd6ff', '#8fff5a', '#ff5aa8'];
  for (const p of confetti) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = cols[p.c % cols.length];
    ctx.fillRect(-3, -3, 6, 6);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ─── HUD ──────────────────────────────────────────────────────────────────────

function drawHUD() {
  const W = canvas.width;
  ctx.save();
  ctx.fillStyle = '#f0c000';
  ctx.font = '11px "Press Start 2P",monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = '#c8820a';
  ctx.shadowBlur = 6;
  // Little banana icon + count
  drawBanana(W - 92, 24, frame * 0.05, 1.0);
  ctx.shadowColor = '#c8820a';
  ctx.shadowBlur = 6;
  ctx.fillStyle = '#f0c000';
  ctx.fillText(`${bananasCollected}/${BANANAS_TO_WIN}`, W - 16, 28);
  ctx.restore();
}

// ─── Update ───────────────────────────────────────────────────────────────────

function update() {
  scrollX += 1.2;   // always-on parallax
  frame++;

  if (cannonRecoil > 0) cannonRecoil--;

  // ── Cannon flight (sequence-complete travel beat) ──
  if (cannonFlight) {
    cannonFlight.t++;
    if (cannonFlight.t >= cannonFlight.dur) {
      // Land back in the run corridor and resume loping
      dkX = runMinX() + (runMaxX() - runMinX()) * 0.15;
      dkVX = 0.9;
      cannonFlight = null;
    }
  }

  if (victoryMode) {
    // DK bob idles in cheer; confetti falls
    dkBob = Math.sin(frame * 0.18) * 5;
    for (let i = confetti.length - 1; i >= 0; i--) {
      const p = confetti[i];
      p.x += p.dx; p.y += p.dy; p.dy += 0.10; p.rot += p.vr; p.life--;
      if (p.life <= 0) confetti.splice(i, 1);
    }
    updateBananas();
    return;
  }

  // ── DK locomotion ──
  if (!cannonFlight) {
    const idle = (Date.now() - lastKeyMs) > 900;

    if (dkJumpActive) {
      dkJumpVy += 0.62;
      dkJumpY -= dkJumpVy;
      // dkJumpY is height above ground (positive = up); start jump gives negative vy
      if (dkJumpY <= 0) { dkJumpY = 0; dkJumpVy = 0; dkJumpActive = false; }
    }

    // Horizontal run — decays toward an idle amble when no recent keys
    dkX += dkVX;
    dkVX *= 0.94;
    if (idle) {
      // Gentle constant amble so he never freezes (breathing + slow lope)
      dkVX = Math.max(dkVX, 0.35);
      dkBreath += 0.08;
    }
    // Wrap DK back to the corridor start when he reaches the end (endless run)
    if (dkX > runMaxX()) { dkX = runMinX(); }
    if (dkX < runMinX()) dkX = runMinX();

    // Run-cycle phase driven by speed → limbs + vertical bob
    const speed = Math.abs(dkVX);
    dkPhase = (dkPhase + 0.18 + speed * 0.12) % (Math.PI * 2);
    // Bob: bigger when running, tiny breathing when idle
    const runBob = Math.abs(Math.sin(dkPhase)) * (2 + speed * 1.6);
    const breatheBob = Math.sin(dkBreath) * 1.2;
    dkBob = idle && speed < 0.5 ? breatheBob : runBob;
  }

  updateBananas();
}

// ─── Render ───────────────────────────────────────────────────────────────────

function render() {
  if (!active) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawFireflies();
  drawBananas();
  drawCannon();
  drawDK();
  if (victoryMode) drawConfetti();
  drawForeground();
  drawHUD();
  update();
  animId = requestAnimationFrame(render);
}

// ─── API ──────────────────────────────────────────────────────────────────────

export function start() {
  getCanvas(); resize();
  active = true; victoryMode = false;
  frame = 0; scrollX = 0;

  BANANAS_TO_WIN = Math.max(1, Math.ceil(BASE_BANANAS * getWinRatio()));
  bananasCollected = 0;

  dkX = canvas.width * 0.10;
  dkVX = 0.6; dkPhase = 0; dkBob = 0; dkBreath = 0;
  dkJumpActive = false; dkJumpY = 0; dkJumpVy = 0;
  cannonFlight = null; cannonRecoil = 0;
  lastKeyMs = Date.now();

  bananas = []; bananaBursts = []; confetti = [];

  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  bananas = []; bananaBursts = []; confetti = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  lastKeyMs = Date.now();

  // A correct key = a forward BOUND: DK leaps up and surges forward, and a
  // banana is swept up into him (visible pickup drives the counter).
  if (!cannonFlight) {
    dkVX = 4.2;
    if (!dkJumpActive) { dkJumpActive = true; dkJumpVy = -8.5; dkJumpY = 0.01; }
  }
  spawnBanana(true);
}

export function miss() {
  if (!active || victoryMode) return;
  // Gentle, never punishing — a tiny hop + a friendly banana appears in the world
  if (!cannonFlight && !dkJumpActive) { dkJumpActive = true; dkJumpVy = -4; dkJumpY = 0.01; }
  spawnBanana(false);
}

// Sequence complete → fire the barrel cannon (the DKC travel beat).
export function patternComplete() {
  if (!active) return false;

  if (!victoryMode && bananasCollected < BANANAS_TO_WIN && !cannonFlight) {
    // Big flourish: blast DK from the cannon in an arc across the jungle.
    const groundY = groundLine();
    cannonRecoil = 16;
    cannonFlight = {
      t: 0, dur: 46,
      x0: cannonX() - 10, y0: cannonMouthY(),
      x1: runMinX() + (runMaxX() - runMinX()) * 0.15, y1: groundY,
    };
    dkJumpActive = false; dkJumpY = 0; dkJumpVy = 0;
    // A shower of bananas swept up on the blast
    for (let i = 0; i < 4; i++) spawnBanana(true);
  }

  return bananasCollected >= BANANAS_TO_WIN;
}

export function victory() {
  victoryMode = true;
  cannonFlight = null;
  dkJumpActive = false; dkJumpY = 0; dkJumpVy = 0;
  // Plant DK center-ish-left in the stage, arms up, and rain banana confetti
  dkX = canvas.width * 0.14;
  dkBob = 0;
  confetti = [];
  const W = canvas.width;
  for (let i = 0; i < MAX_CONFETTI; i++) {
    confetti.push({
      x: W * (0.05 + Math.random() * 0.9),
      y: -Math.random() * canvas.height * 0.4,
      dx: (Math.random() - 0.5) * 2,
      dy: 1.5 + Math.random() * 2.5,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      c: i,
      life: 120 + Math.random() * 90,
      max: 210,
    });
  }
  return VICTORY_MS;
}

window.addEventListener('resize', () => { if (active) resize(); });
