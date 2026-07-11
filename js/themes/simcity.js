// SimCity 2000 — Maxis, 1993 — Level 16
// Early-3D isometric city: extruded flat-shaded polygon buildings on a
// perspective street grid receding to a horizon vanishing point.
// PS1/N64-era look: flat polygon faces (top/left/right), dithered gradients,
// simple depth sorting — no soft shadows, no photoreal lighting.

let canvas, ctx, animId;
let active = false;
let buildings = [];
let particles = [];
let sparkles = [];
let buildingsPlaced = 0;
let camPulse = 0; // subtle camera bob for "3D" feel
const WIN_BUILDINGS = 25;

// Isometric projection constants
const ISO_ANGLE = 0.5; // vertical squash for iso tiles
const TILE_W = 46;
const TILE_H = TILE_W * ISO_ANGLE;

// ─── Building palette — each entry gives 3 flat-shaded faces (top/left/right) ──

const BUILDING_PALETTES = [
  ['#7fa8e0', '#3f5f9e', '#2c4576'], // blue glass tower
  ['#8fd6c8', '#4a9d8c', '#2f6e60'], // teal tech tower
  ['#e0a878', '#a86b3f', '#7a4a28'], // amber brick
  ['#c898e0', '#8a4fae', '#5f3378'], // violet corp
  ['#e0d878', '#a89c3f', '#7a7028'], // gold civic
  ['#9fb8c8', '#5f7a8e', '#3f5262'], // steel
];

function isoProject(gx, gy, W, H) {
  // gx, gy in grid units from center; vanishing toward horizon
  const originX = W / 2;
  const originY = H * 0.34;
  return {
    x: originX + (gx - gy) * TILE_W,
    y: originY + (gx + gy) * TILE_H,
  };
}

function randomBuilding(gridSize) {
  const gx = (Math.random() - 0.5) * gridSize;
  const gy = (Math.random() - 0.5) * gridSize;
  const footprint = 0.85 + Math.random() * 0.5;
  const height = 26 + Math.random() * 130;
  const pal = BUILDING_PALETTES[Math.floor(Math.random() * BUILDING_PALETTES.length)];
  const wCols = 2 + Math.floor(Math.random() * 2);
  const wRows = Math.max(1, Math.floor(height / 14));
  const windows = [];
  for (let r = 0; r < wRows; r++) {
    for (let c = 0; c < wCols; c++) windows.push(Math.random() > 0.35);
  }
  return { gx, gy, footprint, height, pal, windows, wCols, wRows, growth: 0, targetHeight: height, flash: 0 };
}

// ─── Init ───────────────────────────────────────────────────────────────────

function init() {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  buildings = [];
  particles = [];
  sparkles = [];
  buildingsPlaced = 0;
  camPulse = 0;

  for (let i = 0; i < 7; i++) {
    const b = randomBuilding(9);
    b.growth = 1; // pre-existing buildings start fully grown
    buildings.push(b);
  }
}

// ─── Particles (construction dust) ─────────────────────────────────────────

function spawnBuildParticles(screenX, screenY) {
  for (let i = 0; i < 7; i++) {
    particles.push({
      x: screenX + (Math.random() - 0.5) * 20,
      y: screenY,
      vx: (Math.random() - 0.5) * 1.6,
      vy: -0.6 - Math.random() * 1.8,
      life: 1,
      col: i % 2 === 0 ? '#dce8ff' : '#88aaff',
    });
  }
}

// ─── Drawing: perspective sky + horizon ────────────────────────────────────

function drawSky(W, H) {
  const grad = ctx.createLinearGradient(0, 0, 0, H * 0.4);
  grad.addColorStop(0, '#050b16');
  grad.addColorStop(0.55, '#0a1830');
  grad.addColorStop(1, '#123058');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H * 0.4);

  // Dithered horizon band (era-authentic banding instead of smooth glow)
  const bandY = H * 0.34;
  for (let i = 0; i < 5; i++) {
    ctx.globalAlpha = 0.05 - i * 0.008;
    ctx.fillStyle = '#4a8cff';
    ctx.fillRect(0, bandY - i * 3, W, 2);
  }
  ctx.globalAlpha = 1;
}

function drawGroundPlane(W, H) {
  const horizonY = H * 0.34;

  // Ground base — flat shaded polygon, darker than sky
  const groundGrad = ctx.createLinearGradient(0, horizonY, 0, H);
  groundGrad.addColorStop(0, '#0c1830');
  groundGrad.addColorStop(1, '#040810');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, horizonY, W, H - horizonY);

  // Perspective street grid converging to a vanishing point on the horizon —
  // the core "early 3D" cue: true converging perspective lines, not a flat CSS grid.
  const vpX = W / 2;
  const vpY = horizonY;
  ctx.strokeStyle = 'rgba(90, 150, 220, 0.22)';
  ctx.lineWidth = 1;

  // Radial streets converging on vp
  const spread = 11;
  for (let i = -spread; i <= spread; i++) {
    const baseX = W / 2 + i * (W / (spread * 1.6));
    ctx.beginPath();
    ctx.moveTo(baseX, H);
    ctx.lineTo(vpX, vpY);
    ctx.stroke();
  }

  // Cross streets — horizontal bands that compress toward the horizon
  // (spacing shrinks with 1/distance to fake depth). Fixed iteration count —
  // a while-loop on an asymptotic value can run for thousands of iterations
  // per frame (or hang) due to floating point never quite crossing the bound.
  ctx.strokeStyle = 'rgba(90, 150, 220, 0.3)';
  const crossLineCount = 24;
  for (let depth = 1; depth <= crossLineCount; depth++) {
    const y = H - (H - horizonY) * (1 - 1 / (1 + depth * 0.35));
    if (y <= horizonY + 4) break;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

// ─── Drawing: extruded flat-shaded building (isometric "3D" block) ────────

function drawBuilding(b, W, H) {
  const growH = b.height * easeOutCubic(b.growth);
  if (growH < 1) return;

  const base = isoProject(b.gx, b.gy, W, H);
  const halfW = TILE_W * b.footprint * 0.5;
  const halfH = TILE_H * b.footprint * 0.5;

  // Base diamond footprint corners
  const bTop    = { x: base.x,          y: base.y - halfH };
  const bRight  = { x: base.x + halfW,  y: base.y };
  const bBottom = { x: base.x,          y: base.y + halfH };
  const bLeft   = { x: base.x - halfW,  y: base.y };

  // Top of extrusion (roof) corners
  const tTop    = { x: bTop.x,    y: bTop.y - growH };
  const tRight  = { x: bRight.x,  y: bRight.y - growH };
  const tBottom = { x: bBottom.x, y: bBottom.y - growH };
  const tLeft   = { x: bLeft.x,   y: bLeft.y - growH };

  const [topCol, leftCol, rightCol] = b.pal;

  // Left face (bLeft -> bBottom -> tBottom -> tLeft) — flat shaded, darkest
  ctx.fillStyle = leftCol;
  ctx.beginPath();
  ctx.moveTo(bLeft.x, bLeft.y);
  ctx.lineTo(bBottom.x, bBottom.y);
  ctx.lineTo(tBottom.x, tBottom.y);
  ctx.lineTo(tLeft.x, tLeft.y);
  ctx.closePath();
  ctx.fill();

  // Right face (bBottom -> bRight -> tRight -> tBottom) — flat shaded, mid
  ctx.fillStyle = rightCol;
  ctx.beginPath();
  ctx.moveTo(bBottom.x, bBottom.y);
  ctx.lineTo(bRight.x, bRight.y);
  ctx.lineTo(tRight.x, tRight.y);
  ctx.lineTo(tBottom.x, tBottom.y);
  ctx.closePath();
  ctx.fill();

  // Dithered shading strip on right face to fake a gradient without alpha blending
  // (PS1-era games banded gradients on flat polys instead of smooth shading)
  ditherStrip(tBottom, bBottom, tRight, bRight, rightCol, topCol);

  // Roof (top face) — brightest flat shade
  ctx.fillStyle = topCol;
  ctx.beginPath();
  ctx.moveTo(tTop.x, tTop.y);
  ctx.lineTo(tRight.x, tRight.y);
  ctx.lineTo(tBottom.x, tBottom.y);
  ctx.lineTo(tLeft.x, tLeft.y);
  ctx.closePath();
  ctx.fill();

  // Windows on the right (lit) face — grow in with the building
  drawWindows(b, tBottom, bRight, tRight, growH);

  // Rooftop light / antenna for taller buildings
  if (b.height > 90 && b.growth > 0.9) {
    const blinkOn = Math.floor(performance.now() / 700) % 2 === 0;
    ctx.fillStyle = blinkOn ? '#ff5555' : '#551515';
    ctx.fillRect(Math.round(tTop.x - 1), Math.round(tTop.y - 6), 2, 6);
  }

  // Completion flash
  if (b.flash > 0) {
    ctx.globalAlpha = b.flash * 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(tTop.x, tTop.y); ctx.lineTo(tRight.x, tRight.y);
    ctx.lineTo(tBottom.x, tBottom.y); ctx.lineTo(tLeft.x, tLeft.y);
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    b.flash -= 0.06;
  }
}

// Cheap dithered gradient: alternating pixel-scale bands between two flat colors,
// the authentic way pre-3Dfx PS1/N64 titles approximated shading gradients.
function ditherStrip(p1, p2, p3, p4, colA, colB) {
  const steps = 4;
  for (let s = 0; s < steps; s++) {
    if (s % 2 !== 0) continue;
    const t0 = s / steps, t1 = (s + 1) / steps;
    ctx.fillStyle = colB;
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.moveTo(lerp(p1.x, p3.x, t0), lerp(p1.y, p3.y, t0));
    ctx.lineTo(lerp(p1.x, p3.x, t1), lerp(p1.y, p3.y, t1));
    ctx.lineTo(lerp(p2.x, p4.x, t1), lerp(p2.y, p4.y, t1));
    ctx.lineTo(lerp(p2.x, p4.x, t0), lerp(p2.y, p4.y, t0));
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawWindows(b, tBottom, bRight, tRight, growH) {
  const rowsVisible = Math.floor(b.wRows * easeOutCubic(b.growth));
  const rowH = growH / b.wRows;
  for (let r = 0; r < rowsVisible; r++) {
    for (let c = 0; c < b.wCols; c++) {
      const idx = r * b.wCols + c;
      if (!b.windows[idx % b.windows.length]) continue;
      const t0 = (c + 0.5) / (b.wCols + 1);
      const bx = lerp(tBottom.x, bRight.x, t0);
      const by = lerp(tBottom.y, bRight.y, t0) - rowH * (r + 0.5);
      ctx.fillStyle = '#ffe89a';
      ctx.shadowColor = '#ffcc55';
      ctx.shadowBlur = 2;
      ctx.fillRect(Math.round(bx - 1.5), Math.round(by - 2), 3, 4);
      ctx.shadowBlur = 0;
    }
  }
}

function lerp(a, b, t) { return a + (b - a) * t; }
function easeOutCubic(t) { t = Math.min(1, Math.max(0, t)); return 1 - Math.pow(1 - t, 3); }

function drawSparkles() {
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    s.life -= 0.03;
    if (s.life <= 0) { sparkles.splice(i, 1); continue; }
    ctx.globalAlpha = s.life;
    ctx.fillStyle = '#bcd8ff';
    ctx.fillRect(Math.round(s.x), Math.round(s.y - (1 - s.life) * 14), 2, 2);
    ctx.globalAlpha = 1;
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
    p.vy += 0.06;
    p.life -= 0.03;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.col;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), 3, 3);
    ctx.globalAlpha = 1;
  }
}

// Depth-sort so nearer (larger gx+gy) buildings draw over farther ones —
// simple painter's algorithm, the standard early-3D depth trick.
function depthSorted() {
  return [...buildings].sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy));
}

function render() {
  if (!active) return;
  const W = canvas.width;
  const H = canvas.height;

  camPulse += 0.006;
  ctx.save();
  // Very subtle camera bob — reads as a "live" 3D camera, not a static poster
  ctx.translate(0, Math.sin(camPulse) * 1.2);

  ctx.clearRect(-2, -4, W + 4, H + 8);
  drawSky(W, H);
  drawGroundPlane(W, H);

  depthSorted().forEach(b => drawBuilding(b, W, H));

  // Growth animation tick
  buildings.forEach(b => { if (b.growth < 1) b.growth += 0.06; });

  updateParticles();
  drawSparkles();
  ctx.restore();

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
  const b = randomBuilding(9);
  b.growth = 0;
  buildings.push(b);
  buildingsPlaced++;

  const base = isoProject(b.gx, b.gy, canvas.width, canvas.height);
  spawnBuildParticles(base.x, base.y);
  for (let i = 0; i < 3; i++) {
    sparkles.push({ x: base.x + (Math.random() - 0.5) * 20, y: base.y, life: 1 });
  }
}

export function miss() {
  // Flash the most recently placed building instead of punishing — gentle nudge only
  if (buildings.length > 0) {
    const last = buildings[buildings.length - 1];
    last.flash = 0.4;
  }
}

export function patternComplete() {
  return buildingsPlaced >= WIN_BUILDINGS;
}

export function victory() {
  buildings.forEach(b => { b.flash = 1; });
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
