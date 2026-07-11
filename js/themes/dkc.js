// Level 14: Donkey Kong Country (Rare/Nintendo, 1994)

let canvas, ctx;
let frame = 0, animId = null, active = false, victoryMode = false;
let barrelsLaunched = 0;
let barrels = [];
let scrollX = 0;
let cannonWobble = 0;
let dkFrame = 0, dkTimer = 0;
let dkCelebrating = false, dkJumpVy = 0, dkJumpY = 0, dkJumpActive = false;
let stars = [];

const BARRELS_TO_WIN = 22;

// DK sprite — 8x7 pixel grid at PX scale
const PX = 5;
const DK_W = 8 * PX, DK_H = 7 * PX;

// Frame 0: left arm forward  |  Frame 1: right arm forward
const DK_RUN = [
  [
    [0,1,1,1,1,1,1,0],
    [0,1,0,1,1,0,1,0],
    [0,1,1,1,1,1,1,0],
    [1,0,1,1,1,1,0,1],
    [0,0,1,1,1,1,0,0],
    [0,1,0,0,0,0,1,0],
    [1,0,0,0,0,0,0,1],
  ],
  [
    [0,1,1,1,1,1,1,0],
    [0,1,0,1,1,0,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,0,1,1,0,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,1,0,0,1,0,0],
    [0,1,0,0,0,0,1,0],
  ],
];

// Victory: arms-up pose
const DK_ARMS_UP = [
  [1,0,1,1,1,1,0,1],
  [0,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,0,0],
  [0,0,1,1,1,1,0,0],
  [0,0,1,1,1,1,0,0],
  [0,1,0,0,0,0,1,0],
  [1,0,0,0,0,0,0,1],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

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
}

// ─── Draw helpers ──────────────────────────────────────────────────────────────

function drawPx(shape, x, y, size, col) {
  ctx.fillStyle = col;
  shape.forEach((row, r) => row.forEach((c, cc) => {
    if (c) ctx.fillRect(x + cc * size, y + r * size, size, size);
  }));
}

// ─── Background layers ─────────────────────────────────────────────────────────

function drawBackground() {
  const W = canvas.width, H = canvas.height;

  // Sky gradient — dark blue-purple
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  sky.addColorStop(0, '#0d0828');
  sky.addColorStop(0.6, '#1a1245');
  sky.addColorStop(1, '#2a1f5a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.55);

  // Stars (layer 1 — essentially static)
  ctx.fillStyle = '#e8e0ff';
  stars.forEach(s => {
    const twinkle = 0.5 + 0.5 * Math.sin(frame * 0.04 + s.x);
    ctx.globalAlpha = twinkle * 0.8;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Moon — upper right area
  const moonX = W * 0.82, moonY = H * 0.08;
  ctx.fillStyle = '#e8dfa0';
  ctx.beginPath(); ctx.arc(moonX, moonY, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ccc080';
  ctx.beginPath(); ctx.arc(moonX - 4, moonY - 3, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(moonX + 8, moonY + 5, 3, 0, Math.PI * 2); ctx.fill();

  // Layer 1 (far): distant mountain silhouettes — 5% scroll
  const mx = (scrollX * 0.05) % W;
  ctx.fillStyle = '#1e1040';
  for (let rep = -1; rep <= 1; rep++) {
    const ox = rep * W - mx;
    const mts = [
      { bx: 0,         w: 160, h: 90  },
      { bx: 140,       w: 200, h: 120 },
      { bx: 320,       w: 140, h: 75  },
      { bx: 430,       w: 220, h: 105 },
      { bx: 620,       w: 180, h: 90  },
      { bx: 780,       w: 160, h: 130 },
      { bx: 900,       w: 200, h: 85  },
    ];
    mts.forEach(m => {
      const bx = ox + (m.bx / 1100) * W;
      const bw = (m.w / 1100) * W;
      const top = H * 0.32 - (m.h / 130) * H * 0.18;
      ctx.beginPath();
      ctx.moveTo(bx, H * 0.38);
      ctx.lineTo(bx + bw * 0.5, top);
      ctx.lineTo(bx + bw, H * 0.38);
      ctx.fill();
    });
  }

  // Layer 2 (mid): jungle canopy — 15% scroll, dark green rounded tree tops
  const cx = (scrollX * 0.15) % W;
  ctx.fillStyle = '#0f3d1a';
  for (let rep = -1; rep <= 1; rep++) {
    const ox = rep * W - cx;
    const trees = [
      { bx: 0,   tw: 90,  th: 55 },
      { bx: 70,  tw: 80,  th: 70 },
      { bx: 130, tw: 100, th: 50 },
      { bx: 220, tw: 85,  th: 65 },
      { bx: 295, tw: 90,  th: 55 },
      { bx: 370, tw: 110, th: 72 },
      { bx: 460, tw: 80,  th: 48 },
      { bx: 525, tw: 95,  th: 60 },
      { bx: 610, tw: 85,  th: 68 },
      { bx: 685, tw: 100, th: 55 },
      { bx: 775, tw: 90,  th: 62 },
      { bx: 855, tw: 80,  th: 52 },
      { bx: 920, tw: 95,  th: 70 },
      { bx: 1000,tw: 110, th: 58 },
    ];
    const canopyY = H * 0.52;
    trees.forEach(t => {
      const tx = ox + (t.bx / 1100) * W;
      const tw = (t.tw / 1100) * W;
      const th = (t.th / 130) * H * 0.12;
      ctx.beginPath();
      ctx.arc(tx + tw * 0.5, canopyY - th * 0.3, tw * 0.55, Math.PI, 0);
      ctx.lineTo(tx + tw, canopyY);
      ctx.lineTo(tx, canopyY);
      ctx.closePath();
      ctx.fill();
    });
    ctx.fillRect(ox, canopyY, W, H - canopyY);
  }

  // Mid canopy highlight strip
  ctx.fillStyle = '#14521f';
  const canopyY2 = H * 0.52;
  ctx.fillRect(0, canopyY2 - 4, W, 8);

  // Ground — rich jungle earth with golden strip at very bottom
  const groundY = H * 0.85;
  const ground = ctx.createLinearGradient(0, groundY, 0, H);
  ground.addColorStop(0, '#1a4d0a');
  ground.addColorStop(0.3, '#143d08');
  ground.addColorStop(1, '#0a2504');
  ctx.fillStyle = ground;
  ctx.fillRect(0, groundY, W, H - groundY);

  // Golden ground strip at very bottom
  ctx.fillStyle = '#c8820a';
  ctx.fillRect(0, H - 16, W, 8);
  ctx.fillStyle = '#e8a020';
  ctx.fillRect(0, H - 16, W, 3);
}

// Layer 3 (near): vines and leaves — 40% scroll, left 20% and right 20%
function drawForeground() {
  const W = canvas.width, H = canvas.height;
  const vx = (scrollX * 0.40) % 120;

  // Left side vines
  ctx.fillStyle = '#228b22';
  for (let i = 0; i < 5; i++) {
    const lx = ((i * 40 - vx + 120) % 120) - 10;
    if (lx > W * 0.22) continue;
    const sway = Math.sin(frame * 0.03 + i) * 5;
    for (let y = 0; y < H * 0.80; y += 14) {
      ctx.fillRect(lx + sway, y, 5, 10);
    }
    // Leaf cluster
    ctx.fillStyle = '#2ea82e';
    ctx.beginPath();
    ctx.ellipse(lx + sway + 14, H * 0.15 + i * 50, 16, 9, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(lx + sway - 8, H * 0.25 + i * 50, 12, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#228b22';
  }

  // Right side vines
  ctx.fillStyle = '#228b22';
  for (let i = 0; i < 5; i++) {
    const rx = W - ((i * 40 - vx + 120) % 120) + 5;
    if (rx < W * 0.78) continue;
    const sway = Math.sin(frame * 0.03 + i + 2) * 5;
    for (let y = 0; y < H * 0.80; y += 14) {
      ctx.fillRect(rx + sway, y, 5, 10);
    }
    ctx.fillStyle = '#2ea82e';
    ctx.beginPath();
    ctx.ellipse(rx + sway - 14, H * 0.15 + i * 50, 16, 9, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(rx + sway + 8, H * 0.25 + i * 50, 12, 7, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#228b22';
  }

  // Foreground leaf patches at the very edges
  ctx.fillStyle = 'rgba(20, 100, 20, 0.6)';
  ctx.fillRect(0, 0, W * 0.04, H);
  ctx.fillRect(W * 0.96, 0, W * 0.04, H);
}

// ─── DK character ─────────────────────────────────────────────────────────────

function drawDK() {
  const W = canvas.width, H = canvas.height;
  const groundY = H * 0.85;
  const dkX = W * 0.06;
  const baseY = groundY - DK_H - 4;
  let dkY = baseY;

  if (dkJumpActive) dkY = baseY + dkJumpY;

  const sprite = victoryMode ? DK_ARMS_UP : DK_RUN[dkFrame];

  // Barrel-roll flash on recent keystroke
  ctx.shadowColor = '#ff8c00';
  ctx.shadowBlur = 8;
  drawPx(sprite, dkX, dkY, PX, '#7b3d00');   // dark brown body
  // Face / tan highlight
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#c0803a';
  ctx.fillRect(dkX + 2 * PX, dkY + PX, 4 * PX, 2 * PX);
  // Eyes
  ctx.fillStyle = '#fff8dc';
  ctx.fillRect(dkX + 2 * PX, dkY + PX, PX, PX);
  ctx.fillRect(dkX + 5 * PX, dkY + PX, PX, PX);
  ctx.fillStyle = '#1a0800';
  ctx.fillRect(dkX + 2 * PX + 1, dkY + PX + 1, PX - 2, PX - 2);
  ctx.fillRect(dkX + 5 * PX + 1, dkY + PX + 1, PX - 2, PX - 2);
}

// ─── Barrel cannon ────────────────────────────────────────────────────────────

function drawCannon() {
  const W = canvas.width, H = canvas.height;
  const groundY = H * 0.85;
  const cx = W * 0.88;
  const cy = groundY - 52;
  const wobbleX = cannonWobble > 0 ? Math.sin(cannonWobble * 1.2) * 4 : 0;

  ctx.save();
  ctx.translate(cx + wobbleX, 0);

  // Cannon base (dark wood barrel shape)
  ctx.fillStyle = '#3d1f00';
  ctx.fillRect(-14, cy, 28, 52);
  ctx.fillStyle = '#5a2e00';
  ctx.fillRect(-14, cy, 28, 4);
  ctx.fillRect(-14, cy + 16, 28, 4);
  ctx.fillRect(-14, cy + 32, 28, 4);

  // Cannon barrel mouth (angled up-left)
  ctx.fillStyle = '#2a1400';
  ctx.save();
  ctx.translate(0, cy + 10);
  ctx.rotate(-Math.PI * 0.35);
  ctx.fillRect(-8, -32, 16, 36);
  ctx.fillStyle = '#1a0a00';
  ctx.fillRect(-8, -32, 16, 6);
  ctx.restore();

  // Star/DKC branding dot
  ctx.fillStyle = '#f0c000';
  ctx.beginPath(); ctx.arc(0, cy + 26, 5, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

// ─── Barrels ──────────────────────────────────────────────────────────────────

function spawnBarrel() {
  const W = canvas.width, H = canvas.height;
  const groundY = H * 0.85;
  const cx = W * 0.88;
  const cy = groundY - 52;
  barrels.push({
    x: cx - 18,
    y: cy - 8,
    vx: -(3.5 + Math.random() * 1.5),
    vy: -(4 + Math.random() * 2),
    age: 0,
  });
}

function updateBarrels() {
  for (let i = barrels.length - 1; i >= 0; i--) {
    const b = barrels[i];
    b.vy += 0.18;          // gravity
    b.x += b.vx;
    b.y += b.vy;
    b.age++;
    if (b.x < -30 || b.y > canvas.height + 20) barrels.splice(i, 1);
  }
}

function drawBarrels() {
  barrels.forEach(b => {
    const spin = (b.age * 0.12) % (Math.PI * 2);
    ctx.save();
    ctx.translate(b.x + 10, b.y + 10);
    ctx.rotate(spin);
    // Oval barrel
    ctx.fillStyle = '#5a2e00';
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(-11, -2, 22, 4);
    ctx.fillStyle = '#c8820a';
    ctx.fillRect(-11, -2, 22, 1);
    ctx.fillRect(-11, 1, 22, 1);
    // DK star
    ctx.fillStyle = '#f0c000';
    ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}

// ─── HUD ──────────────────────────────────────────────────────────────────────

function drawHUD() {
  const W = canvas.width;
  // Barrel count — top right corner
  ctx.fillStyle = '#f0c000';
  ctx.font = '11px "Press Start 2P",monospace';
  ctx.textAlign = 'right';
  ctx.shadowColor = '#c8820a';
  ctx.shadowBlur = 6;
  ctx.fillText(`${barrelsLaunched}/${BARRELS_TO_WIN}`, W - 16, 28);
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
}

// ─── Update ───────────────────────────────────────────────────────────────────

function update() {
  scrollX += 1.2;   // continuous parallax scroll

  // DK run animation
  if (!victoryMode) {
    if (++dkTimer >= 10) { dkTimer = 0; dkFrame ^= 1; }
  }

  if (cannonWobble > 0) cannonWobble--;

  // DK jump on victory
  if (dkJumpActive) {
    dkJumpVy += 0.5;
    dkJumpY += dkJumpVy;
    if (dkJumpY >= 0) { dkJumpY = 0; dkJumpVy = 0; dkJumpActive = false; }
  }

  updateBarrels();
  frame++;
}

// ─── Render ───────────────────────────────────────────────────────────────────

function render() {
  if (!active) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawBarrels();
  drawCannon();
  drawDK();
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
  barrelsLaunched = 0; barrels = [];
  dkFrame = 0; dkTimer = 0; cannonWobble = 0;
  dkCelebrating = false; dkJumpActive = false; dkJumpY = 0; dkJumpVy = 0;
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  barrels = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  spawnBarrel();
  barrelsLaunched++;
  // Cannon wobble
  cannonWobble = 14;
  // DK barrel-roll: quick jump
  if (!dkJumpActive) { dkJumpVy = -6; dkJumpY = 0; dkJumpActive = true; }
}

export function miss() {
  if (!active || victoryMode) return;
  cannonWobble = 20;
}

export function patternComplete() {
  return barrelsLaunched >= BARRELS_TO_WIN;
}

export function victory() {
  victoryMode = true;
  // DK jumps into arms-up celebration pose
  dkJumpVy = -9; dkJumpY = 0; dkJumpActive = true;
}

window.addEventListener('resize', () => { if (active) resize(); });
