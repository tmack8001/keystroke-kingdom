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
let speedStreaks = []; // background motion-line streaks during boost
let clouds = [];       // far-layer parallax clouds

const RINGS_TO_WIN = 20;
const PX = 7;  // pixel scale for Sonic sprite (11×13 grid → 77×91 px) — large, detailed 16-bit hero sprite
const SW = 11 * PX, SH = 13 * PX;

// Sonic sprite — 11×13, facing right. Values: 1=blue body, 2=peach face/muzzle, 3=red shoe, 4=white eye/sock, 5=tan buckle
const SONIC_RUN_A = [
  [0,0,0,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0],
  [0,1,1,0,1,1,1,0,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,0],
  [1,1,2,2,2,2,2,1,1,1,1],
  [1,1,2,4,2,2,4,2,1,1,0],
  [0,1,2,2,2,2,2,2,1,0,0],
  [0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,5,5,1,1,0,0,0],
  [0,1,1,1,1,1,1,1,1,0,0],
  [0,0,3,3,3,0,3,3,3,0,0],
  [0,3,3,4,3,0,3,4,3,3,0],
  [0,0,0,0,0,0,0,0,0,0,0],
];
const SONIC_RUN_B = [
  [0,0,0,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0],
  [0,1,1,0,1,1,1,0,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,0],
  [1,1,2,2,2,2,2,1,1,1,1],
  [1,1,2,4,2,2,4,2,1,1,0],
  [0,1,2,2,2,2,2,2,1,0,0],
  [0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,5,5,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0],
  [0,3,3,3,0,3,3,3,0,0,0],
  [3,3,4,3,0,3,4,3,3,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
];
const SONIC_STUMBLE = [
  [0,0,0,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0],
  [0,1,1,0,1,1,1,0,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,0],
  [1,1,2,2,2,2,2,1,1,1,1],
  [1,1,2,4,2,2,4,2,1,1,0],
  [0,1,2,2,2,2,2,2,1,0,0],
  [0,0,1,1,1,1,1,1,0,0,0],
  [0,1,1,1,5,5,1,1,1,0,0],
  [1,1,1,1,1,1,1,1,1,1,0],
  [0,0,3,3,3,3,3,3,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
];
const SONIC_COLS = { 1: '#1a5fd0', 2: '#f4c088', 3: '#d81818', 4: '#ffffff', 5: '#e8c000' };

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  W = canvas.width; H = canvas.height;
  if (sonicX <= 0) sonicX = W * 0.08;
  initClouds();
}

function initClouds() {
  clouds = [];
  for (let i = 0; i < 6; i++) {
    clouds.push({
      x: Math.random() * W,
      y: H * (0.04 + Math.random() * 0.18),
      w: 60 + Math.random() * 70,
    });
  }
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

function drawPx(shape, x, y, size, colOrMap) {
  const isMap = typeof colOrMap === 'object';
  shape.forEach((row, r) => row.forEach((c, cc) => {
    if (!c) return;
    ctx.fillStyle = isMap ? (colOrMap[c] || '#000') : colOrMap;
    ctx.fillRect(Math.round(x + cc * size), Math.round(y + r * size), size, size);
  }));
}

function drawClouds() {
  clouds.forEach(cl => {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.ellipse(cl.x, cl.y, cl.w * 0.5, cl.w * 0.22, 0, 0, Math.PI * 2);
    ctx.ellipse(cl.x - cl.w * 0.28, cl.y + cl.w * 0.06, cl.w * 0.3, cl.w * 0.16, 0, 0, Math.PI * 2);
    ctx.ellipse(cl.x + cl.w * 0.3, cl.y + cl.w * 0.04, cl.w * 0.26, cl.w * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawLoop() {
  // Distant loop-de-loop silhouette — iconic Green Hill Zone landmark, far background layer
  const lx = W * 0.78 - (hillOffset * 0.12) % (W * 1.4);
  const ly = H * 0.42, r = H * 0.16;
  ctx.strokeStyle = 'rgba(20,90,30,0.55)';
  ctx.lineWidth = Math.max(6, r * 0.22);
  ctx.beginPath();
  ctx.arc(lx, ly, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawBackground() {
  const GY = groundY();

  // Sky — cobalt blue gradient, multi-stop for depth
  const sky = ctx.createLinearGradient(0, 0, 0, GY * 0.6);
  sky.addColorStop(0, '#0d3fa0');
  sky.addColorStop(0.5, '#2e78d8');
  sky.addColorStop(1, '#6cb0ee');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GY * 0.6);

  // Layer 1 (far, slowest): clouds + loop silhouette
  drawClouds();
  drawLoop();

  // Layer 2 (far hills, slow parallax): smooth rolling silhouette with gradient shading
  const hillTop = H * 0.32;
  ctx.fillStyle = '#2f8a3a';
  const hOff = (hillOffset * 0.22) % (W * 0.6);
  for (let i = -1; i < 4; i++) {
    const hx = i * W * 0.6 - hOff;
    const hw = 200, hh = 55;
    ctx.beginPath();
    ctx.moveTo(hx, hillTop + hh);
    for (let s = 0; s <= hw; s += 4) {
      const yOff = Math.sin((s / hw) * Math.PI) * hh;
      ctx.lineTo(hx + s, hillTop + hh - yOff);
    }
    ctx.lineTo(hx + hw, hillTop + hh);
    ctx.closePath();
    ctx.fill();
  }

  // Layer 3 (mid hills, checkerboard, medium parallax) — the classic Green Hill band
  const midTop = H * 0.38, midBot = H * 0.55;
  const midGrad = ctx.createLinearGradient(0, midTop, 0, midBot);
  midGrad.addColorStop(0, '#5cd85c');
  midGrad.addColorStop(1, '#2fa03a');
  ctx.fillStyle = midGrad;
  ctx.fillRect(0, midTop, W, midBot - midTop);

  const tileW = 40, tileH = 24;
  ctx.fillStyle = 'rgba(30,120,40,0.55)';
  const offX = (hillOffset * 0.55) % (tileW * 2);
  for (let tx = -tileW * 2 + Math.floor(offX); tx < W + tileW; tx += tileW * 2) {
    for (let ty = Math.floor(midTop); ty < midBot; ty += tileH * 2) {
      ctx.fillRect(tx, ty, tileW, tileH);
      ctx.fillRect(tx + tileW, ty + tileH, tileW, tileH);
    }
  }
  // Bright top rim on mid band
  ctx.fillStyle = 'rgba(140,255,140,0.5)';
  ctx.fillRect(0, midTop, W, 3);

  // Near-ground band (55%–65%) — dark green, gradient
  const nearGrad = ctx.createLinearGradient(0, H * 0.55, 0, H * 0.65);
  nearGrad.addColorStop(0, '#1f6b26');
  nearGrad.addColorStop(1, '#164d1c');
  ctx.fillStyle = nearGrad;
  ctx.fillRect(0, H * 0.55, W, H * 0.10);

  // Ground strip (65%–80%) — solid brown, richer gradient with striping
  const ground = ctx.createLinearGradient(0, GY, 0, H * 0.82);
  ground.addColorStop(0, '#a8703f');
  ground.addColorStop(0.15, '#8b5e3c');
  ground.addColorStop(0.5, '#6a4526');
  ground.addColorStop(1, '#48300f');
  ctx.fillStyle = ground;
  ctx.fillRect(0, GY, W, H * 0.82 - GY);

  // Ground top edge highlight — layered
  ctx.fillStyle = '#f0c060';
  ctx.fillRect(0, GY, W, 4);
  ctx.fillStyle = '#c8903c';
  ctx.fillRect(0, GY + 4, W, 2);

  // Diagonal speed-striping on ground, subtle motion cue
  const stripeOff = (hillOffset * 1.5) % 60;
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 6;
  for (let sx = -stripeOff; sx < W + 60; sx += 60) {
    ctx.beginPath();
    ctx.moveTo(sx, GY + 6);
    ctx.lineTo(sx - 20, H * 0.82);
    ctx.stroke();
  }
}

function drawSpeedStreaks() {
  speedStreaks = speedStreaks.filter(s => s.age < s.life);
  speedStreaks.forEach(s => {
    s.age++;
    const t = s.age / s.life;
    ctx.strokeStyle = `rgba(255,255,255,${(1 - t) * 0.5})`;
    ctx.lineWidth = s.w;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.len * (1 + t), s.y);
    ctx.stroke();
  });
}

function spawnSpeedStreaks() {
  const GY = groundY();
  for (let i = 0; i < 3; i++) {
    speedStreaks.push({
      x: W * (0.15 + Math.random() * 0.7),
      y: H * 0.15 + Math.random() * (GY - H * 0.15),
      len: 60 + Math.random() * 80,
      w: 2 + Math.random() * 2,
      age: 0, life: 10 + Math.random() * 8 | 0,
    });
  }
}

function drawRings() {
  rings.forEach(r => {
    if (r.collected) return;
    r.rot += 0.06;
    const rx = r.x, ry = r.y;
    const radius = 14;
    const squash = Math.abs(Math.cos(r.rot));

    // Drop shadow on ground plane below ring (subtle depth cue)
    // Radial gradient fill for a metallic gold look instead of flat stroke
    const grad = ctx.createRadialGradient(rx - radius * 0.3, ry - radius * 0.3, 2, rx, ry, radius);
    grad.addColorStop(0, '#fff3b0');
    grad.addColorStop(0.5, '#ffcc20');
    grad.addColorStop(1, '#a87400');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(rx, ry, radius, radius * squash + 3, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Inner highlight sparkle
    const hx = rx - radius * 0.35;
    ctx.fillStyle = 'rgba(255,250,220,0.85)';
    ctx.fillRect(hx, ry - 4, 5, 6);
  });

  // Glow flashes on collect
  glows = glows.filter(g => g.age < 16);
  glows.forEach(g => {
    g.age++;
    const a = 1 - g.age / 16;
    const r2 = 10 + g.age * 2.8;
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ffe040';
    ctx.lineWidth = 3;
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
    const period = sonicBoost > 0 ? 3 : 7;
    sprite = Math.floor(frame / period) % 2 === 0 ? SONIC_RUN_A : SONIC_RUN_B;
  }

  // Speed blur trail when boosted — larger, more frames, richer color falloff
  if (sonicBoost > 0) {
    for (let t = 1; t <= 4; t++) {
      ctx.globalAlpha = 0.22 * (5 - t) / 4;
      drawPx(sprite, sonicX - t * 14, sy, PX, '#2a7ae0');
    }
    ctx.globalAlpha = 1;
  }

  // Ground contact shadow — soft ellipse
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(sonicX + SW / 2, GY + 3, SW * 0.42, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = '#1a66cc'; ctx.shadowBlur = sonicBoost > 0 ? 22 : 8;
  drawPx(sprite, sonicX, sy, PX, SONIC_COLS);
  ctx.shadowBlur = 0;
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
  drawSpeedStreaks();
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
  glows = []; hillOffset = 0; speedStreaks = [];
  initRings();
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  rings = []; glows = []; speedStreaks = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  const r = nearestRing();
  if (!r) return;
  r.collected = true;
  ringsCollected++;
  glows.push({ x: r.x, y: r.y, age: 0 });
  sonicBoost = 30;
  spawnSpeedStreaks();
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
