// Level 11: Sonic the Hedgehog (Sega Genesis, 1991)
// Green Hill Zone — parallax hills, rings to collect, Sonic runs left to right.

let canvas, ctx;
let animId = null, active = false, victoryMode = false;
let frame = 0, W = 0, H = 0;

let ringsCollected = 0;
let rings = [];
let sonicX = 0, sonicVX = 2.2;
let sonicBoost = 0;    // frames of speed boost remaining
let sonicStumble = 0;  // frames of stumble animation remaining
let glows = [];        // brief ring-collect flashes
let hillOffset = 0;    // parallax scroll offset

const RINGS_TO_WIN = 20;
const PX = 4;  // pixel scale for Sonic sprite (5×7 grid → 20×28 px)
const SW = 5 * PX, SH = 7 * PX;

// Sonic sprite — 5×7, facing right
const SONIC_RUN_A = [
  [0,0,1,1,0],
  [0,1,1,1,1],
  [1,1,0,1,0],
  [0,1,1,1,0],
  [0,0,1,0,0],
  [0,1,1,0,0],
  [1,0,0,0,0],
];
const SONIC_RUN_B = [
  [0,0,1,1,0],
  [0,1,1,1,1],
  [1,1,0,1,0],
  [0,1,1,1,0],
  [0,1,0,0,0],
  [0,0,1,1,0],
  [0,0,0,0,1],
];
const SONIC_STUMBLE = [
  [0,0,1,1,0],
  [0,1,1,1,1],
  [1,1,0,1,0],
  [0,1,1,1,0],
  [0,0,1,1,0],
  [0,1,0,0,0],
  [0,0,0,0,0],
];

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  W = canvas.width; H = canvas.height;
  if (sonicX <= 0) sonicX = W * 0.08;
}

// Ground strip sits at 70% height (within the 65–80% safe zone from the brief)
function groundY() { return Math.floor(H * 0.70); }

function spawnRing() {
  rings.push({
    x: W * 0.12 + Math.random() * W * 0.80,
    y: H * (0.10 + Math.random() * 0.48),  // 10%–58% of canvas height
    rot: Math.random() * Math.PI * 2,
    collected: false,
    glowAge: -1,
  });
}

function initRings() {
  rings = [];
  for (let i = 0; i < 8; i++) spawnRing();
}

// ─── Draw helpers ──────────────────────────────────────────────────────────────

function drawPx(shape, x, y, size, col) {
  ctx.fillStyle = col;
  shape.forEach((row, r) => row.forEach((c, cc) => {
    if (c) ctx.fillRect(Math.round(x + cc * size), Math.round(y + r * size), size, size);
  }));
}

function drawBackground() {
  const GY = groundY();

  // Sky — cobalt blue gradient
  const sky = ctx.createLinearGradient(0, 0, 0, GY * 0.6);
  sky.addColorStop(0, '#1a5fc8');
  sky.addColorStop(1, '#4a90d9');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GY * 0.6);

  // Upper hill band (35%–55%) — checkerboard rolling hills
  const hillTop = H * 0.35, hillBot = H * 0.55;
  ctx.fillStyle = '#4ab84a';
  ctx.fillRect(0, hillTop, W, hillBot - hillTop);

  // Checkerboard pattern on hills — scrolls with parallax
  const tileW = 32, tileH = 20;
  ctx.fillStyle = '#3da03d';
  const offX = (hillOffset * 0.5) % (tileW * 2);
  for (let tx = -tileW * 2 + Math.floor(offX); tx < W + tileW; tx += tileW * 2) {
    for (let ty = Math.floor(hillTop); ty < hillBot; ty += tileH * 2) {
      ctx.fillRect(tx, ty, tileW, tileH);
      ctx.fillRect(tx + tileW, ty + tileH, tileW, tileH);
    }
  }

  // Far hill silhouettes (slow parallax)
  ctx.fillStyle = '#38a038';
  const hOff = (hillOffset * 0.25) % (W * 2);
  for (let i = -1; i < 4; i++) {
    const hx = i * W * 0.6 - hOff % (W * 0.6);
    // Smooth bump via stacked rects approximation
    const hw = 160, hh = 40;
    for (let s = 0; s < hh; s++) {
      const half = hw * Math.sqrt(Math.max(0, 1 - (s / hh) ** 2));
      ctx.fillRect(hx + hw / 2 - half, hillTop - hh + s, half * 2, 1);
    }
  }

  // Near-ground band (55%–65%) — dark green
  ctx.fillStyle = '#267526';
  ctx.fillRect(0, H * 0.55, W, H * 0.10);

  // Ground strip (65%–80%) — solid brown
  const ground = ctx.createLinearGradient(0, GY, 0, H * 0.82);
  ground.addColorStop(0, '#8b5e3c');
  ground.addColorStop(0.15, '#7a4f2e');
  ground.addColorStop(1, '#5c3a20');
  ctx.fillStyle = ground;
  ctx.fillRect(0, GY, W, H * 0.82 - GY);

  // Ground top edge highlight
  ctx.fillStyle = '#c8903c';
  ctx.fillRect(0, GY, W, 3);
}

function drawRings() {
  rings.forEach(r => {
    if (r.collected) return;
    r.rot += 0.06;
    const rx = r.x, ry = r.y;
    const radius = 10;
    // Outer gold ring
    ctx.strokeStyle = '#d4a800';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(rx, ry, radius, radius * Math.abs(Math.cos(r.rot)) + 2, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Inner highlight
    const hx = rx - radius * 0.35;
    ctx.fillStyle = 'rgba(255,220,60,0.7)';
    ctx.fillRect(hx, ry - 3, 4, 5);
  });

  // Glow flashes on collect
  glows = glows.filter(g => g.age < 14);
  glows.forEach(g => {
    g.age++;
    const a = 1 - g.age / 14;
    const r2 = 8 + g.age * 2.2;
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ffe040';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(g.x, g.y, r2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
}

function drawSonic() {
  const GY = groundY();
  const sy = GY - SH;

  let sprite;
  if (sonicStumble > 0) {
    sprite = SONIC_STUMBLE;
  } else {
    // Alternate run frames — faster when boosted
    const period = sonicBoost > 0 ? 4 : 8;
    sprite = Math.floor(frame / period) % 2 === 0 ? SONIC_RUN_A : SONIC_RUN_B;
  }

  // Speed blur trail when boosted
  if (sonicBoost > 0) {
    for (let t = 1; t <= 3; t++) {
      ctx.globalAlpha = 0.18 * (4 - t) / 3;
      ctx.fillStyle = '#1a88e0';
      drawPx(sprite, sonicX - t * 10, sy, PX, '#1a88e0');
    }
    ctx.globalAlpha = 1;
  }

  ctx.shadowColor = '#1a66cc'; ctx.shadowBlur = sonicBoost > 0 ? 16 : 6;
  drawPx(sprite, sonicX, sy, PX, '#1a66cc');
  // White highlight on head
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(Math.round(sonicX + PX * 2), Math.round(sy), PX, PX);

  // Shoe accents
  ctx.fillStyle = '#cc2222';
  ctx.fillRect(Math.round(sonicX), Math.round(sy + 6 * PX), PX, PX);
  ctx.fillRect(Math.round(sonicX + 4 * PX), Math.round(sy + 6 * PX), PX, PX);
}

function drawHUD() {
  ctx.fillStyle = '#ffe040';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`RINGS  ${ringsCollected} / ${RINGS_TO_WIN}`, 14, 22);
}

// ─── Update ───────────────────────────────────────────────────────────────────

function updateSonic() {
  const speed = sonicBoost > 0 ? sonicVX * 2.8 : sonicVX;
  sonicX += speed;
  hillOffset += speed;
  if (sonicX > W + SW) sonicX = -SW;
  if (sonicBoost > 0) sonicBoost--;
  if (sonicStumble > 0) sonicStumble--;
}

function nearestRing() {
  const sy = groundY() - SH / 2, scx = sonicX + SW / 2;
  let best = null, bestD = Infinity;
  rings.forEach(r => {
    if (r.collected) return;
    const d = Math.hypot(r.x - scx, r.y - sy);
    if (d < bestD) { bestD = d; best = r; }
  });
  return best;
}

// ─── Render loop ─────────────────────────────────────────────────────────────

function render() {
  if (!active) return;
  frame++;
  ctx.clearRect(0, 0, W, H);

  drawBackground();
  drawRings();
  drawSonic();
  drawHUD();
  updateSonic();

  if (victoryMode) {
    // Sonic runs off the right edge with extended boost trail
    if (sonicX > W + SW * 4) { active = false; return; }
  }

  animId = requestAnimationFrame(render);
}

// ─── API ──────────────────────────────────────────────────────────────────────

export function start() {
  getCanvas(); resize();
  active = true; victoryMode = false; frame = 0;
  ringsCollected = 0; sonicBoost = 0; sonicStumble = 0;
  sonicX = W * 0.08; sonicVX = 2.2;
  glows = []; hillOffset = 0;
  initRings();
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  rings = []; glows = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  const r = nearestRing();
  if (!r) return;
  r.collected = true;
  ringsCollected++;
  glows.push({ x: r.x, y: r.y, age: 0 });
  sonicBoost = 30;
  // Replenish — keep ~8 rings on screen
  const visible = rings.filter(rr => !rr.collected).length;
  if (visible < 8 && ringsCollected < RINGS_TO_WIN) spawnRing();
}

export function miss() {
  if (!active || victoryMode) return;
  sonicStumble = 22;
}

export function patternComplete() {
  return ringsCollected >= RINGS_TO_WIN;
}

export function victory() {
  victoryMode = true;
  sonicBoost = 9999;  // permanent max speed for exit run
}

window.addEventListener('resize', () => { if (active) resize(); });
