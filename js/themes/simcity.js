// SimCity 2000 — Maxis, 1993 — Level 16
// City skyline that grows as the player types. Budget counter, city grid below.

let canvas, ctx, animId;
let active = false;
let buildings = [];
let particles = [];
let buildingsPlaced = 0;
const WIN_BUILDINGS = 25;

// ─── Building types ───────────────────────────────────────────────────────────

const BUILDING_COLORS = [
  ['#4466aa', '#334488', '#223366'],
  ['#556677', '#445566', '#334455'],
  ['#3a5a7a', '#2a4a6a', '#1a3a5a'],
  ['#446688', '#335577', '#224466'],
  ['#5a4a6a', '#4a3a5a', '#3a2a4a'],
];

function randomBuilding(W, H) {
  const floorH = H * 0.22;
  const w = 28 + Math.random() * 32;
  const h = 40 + Math.random() * 100;
  const x = Math.random() * (W - w);
  const cols = BUILDING_COLORS[Math.floor(Math.random() * BUILDING_COLORS.length)];
  const hasAntenna = Math.random() > 0.55;
  const windows = [];
  const wCols = Math.max(1, Math.floor(w / 10) - 1);
  const wRows = Math.max(1, Math.floor(h / 12) - 1);
  for (let wy = 0; wy < wRows; wy++) {
    for (let wx = 0; wx < wCols; wx++) {
      windows.push({ wx, wy, lit: Math.random() > 0.3 });
    }
  }
  return { x, w, h, floorY: H - floorH, cols, hasAntenna, windows, age: 0, lit: false };
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  buildings = [];
  particles = [];
  buildingsPlaced = 0;

  // Start with 6 background buildings
  for (let i = 0; i < 6; i++) {
    const b = randomBuilding(canvas.width, canvas.height);
    b.h = 30 + Math.random() * 50;
    buildings.push(b);
  }
}

// ─── Particles ───────────────────────────────────────────────────────────────

function spawnBuildParticles(b) {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: b.x + b.w / 2 + (Math.random() - 0.5) * b.w,
      y: b.floorY - b.h,
      vx: (Math.random() - 0.5) * 2.5,
      vy: -1 - Math.random() * 2.5,
      life: 1,
      col: BUILDING_COLORS[0][0],
    });
  }
}

// ─── Drawing ──────────────────────────────────────────────────────────────────

function drawSky(W, H) {
  const grad = ctx.createLinearGradient(0, 0, 0, H * 0.78);
  grad.addColorStop(0, '#030810');
  grad.addColorStop(0.5, '#061428');
  grad.addColorStop(1, '#0a1c38');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H * 0.78);
}

function drawGrid(W, H) {
  const floorH = H * 0.22;
  const floorY = H - floorH;

  // Ground
  const groundGrad = ctx.createLinearGradient(0, floorY, 0, H);
  groundGrad.addColorStop(0, '#0a1428');
  groundGrad.addColorStop(1, '#060c18');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, floorY, W, floorH);

  // Grid lines
  ctx.strokeStyle = 'rgba(68, 136, 204, 0.18)';
  ctx.lineWidth = 1;
  const cellW = Math.round(W * 0.05);
  const cellH = Math.round(floorH * 0.35);

  for (let x = 0; x <= W; x += cellW) {
    ctx.beginPath(); ctx.moveTo(x, floorY); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = floorY; y <= H; y += cellH) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Road lines (horizontal bright ones)
  ctx.strokeStyle = 'rgba(68, 136, 204, 0.35)';
  ctx.lineWidth = 1.5;
  for (let y = floorY + cellH; y < H; y += cellH) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

function drawBuilding(b) {
  const topY = b.floorY - b.h;

  // Main building body
  ctx.fillStyle = b.cols[0];
  ctx.fillRect(Math.round(b.x), Math.round(topY), Math.round(b.w), Math.round(b.h));

  // Left face (slightly darker)
  ctx.fillStyle = b.cols[1];
  ctx.fillRect(Math.round(b.x), Math.round(topY), 4, Math.round(b.h));

  // Top face
  ctx.fillStyle = b.cols[2];
  ctx.fillRect(Math.round(b.x), Math.round(topY), Math.round(b.w), 3);

  // Windows
  const wW = 4, wH = 5;
  const wColCount = Math.max(1, Math.floor(b.w / 10) - 1);
  const wColSpacing = (b.w - wW) / (wColCount + 1);
  const wRowSpacing = 11;
  const wRows = Math.floor((b.h - 8) / wRowSpacing);

  for (let row = 0; row < wRows; row++) {
    for (let col = 0; col < wColCount; col++) {
      const wx = Math.round(b.x + wColSpacing * (col + 1));
      const wy = Math.round(topY + 6 + row * wRowSpacing);
      const winIdx = row * wColCount + col;
      const isLit = b.windows[winIdx % b.windows.length]?.lit;
      ctx.fillStyle = isLit ? '#88aaff' : '#1a2a3a';
      if (isLit) {
        ctx.shadowColor = '#4466ff';
        ctx.shadowBlur = 3;
      }
      ctx.fillRect(wx, wy, wW, wH);
      ctx.shadowBlur = 0;
    }
  }

  // Antenna
  if (b.hasAntenna) {
    ctx.strokeStyle = '#556688';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.round(b.x + b.w / 2), Math.round(topY));
    ctx.lineTo(Math.round(b.x + b.w / 2), Math.round(topY - 12));
    ctx.stroke();
    // Blinking light
    const blinkOn = Math.floor(performance.now() / 700) % 2 === 0;
    ctx.fillStyle = blinkOn ? '#ff4444' : '#441111';
    ctx.fillRect(Math.round(b.x + b.w / 2) - 2, Math.round(topY - 14), 4, 4);
  }
}

function drawHUD(W) {
  const pct = buildingsPlaced / WIN_BUILDINGS;
  const barW = Math.round(W * 0.18);
  const barH = 8;
  const bx = Math.round(W * 0.02);
  const by = 14;

  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#4488cc';
  ctx.shadowColor = '#4488cc';
  ctx.shadowBlur = 4;
  ctx.fillText(`ZONES ${buildingsPlaced}/${WIN_BUILDINGS}`, bx, by);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#0a1428';
  ctx.fillRect(bx, by + 5, barW, barH);
  ctx.fillStyle = '#4488cc';
  ctx.fillRect(bx, by + 5, Math.round(barW * pct), barH);
  ctx.strokeStyle = '#224466';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx + 0.5, by + 5.5, barW - 1, barH - 1);
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08;
    p.life -= 0.035;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.col;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), 3, 3);
    ctx.globalAlpha = 1;
  }
}

function render() {
  if (!active) return;
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  drawSky(W, H);
  drawGrid(W, H);

  buildings.forEach(b => drawBuilding(b));
  updateParticles();
  drawHUD(W);

  animId = requestAnimationFrame(render);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function start() {
  init();
  active = true;
  animId = requestAnimationFrame(render);
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function keystroke() {
  if (!active) return;
  const b = randomBuilding(canvas.width, canvas.height);
  buildings.push(b);
  spawnBuildParticles(b);
  buildingsPlaced++;
}

export function miss() {
  // Flash the most recent building
  if (buildings.length > 0) {
    const last = buildings[buildings.length - 1];
    last.lit = true;
    setTimeout(() => { last.lit = false; }, 150);
  }
}

export function patternComplete() {
  return buildingsPlaced >= WIN_BUILDINGS;
}

export function victory() {
  // Flash all windows
  buildings.forEach(b => b.windows.forEach(w => { w.lit = true; }));
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
