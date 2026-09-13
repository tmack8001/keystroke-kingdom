// SimCity 2000 — Maxis, 1993 — Level 16
// Early-3D isometric city. The city is composed AROUND the fixed DOM UI, which
// permanently owns the screen center. The stage regions are:
//   • top band  (0 – 0.19H)        → sky + dithered horizon + light grid
//   • left margin (0 – 0.22W)      → residential blocks, growing upward
//   • right margin (0.78 – 1.0W)   → commercial towers
//   • bottom strip (0.81 – 1.0H)   → downtown skyline in front of the keyboard
// The city visibly GROWS as patterns complete (new buildings rise on the grid).
// Look: extruded flat-shaded polygon buildings (top/left/right faces), dithered
// gradient bands, painter's-algorithm depth sort — the SimCity 2000 iso look.

// The Act 4 white rabbit is shared by all five Command Center themes and lives in
// terminal.js (the act's hidden-history host) — see easter-eggs.md.
import { resetWhiteRabbit, maybeWhiteRabbit, drawWhiteRabbit } from './terminal.js';

let canvas, ctx, animId;
let active = false;
let districts = {};   // { residential:[], commercial:[], downtown:[] }
let particles = [];
let sparkles = [];
let buildingsPlaced = 0;
let camPulse = 0;     // subtle camera bob for a "live" iso camera
const WIN_BUILDINGS = 25;

// ─── Victory fireworks-show state (the milestone celebration) ────────────────
// SC2000 marked population/growth milestones with a celebratory fireworks show
// over the city. victory() starts a timed show: shells launch from downtown,
// bloom above the isometric skyline, and their light visibly washes warm over
// the building faces so the whole scene brightens — not just the sky.
const VICTORY_MS = 3500;
let victoryStart = 0;         // performance.now() when the show began; 0 = idle
let shells = [];              // { x, y, vy, targetY, color } — rising, pre-bloom
let sparks = [];              // { x, y, vx, vy, age, maxAge, color } — post-bloom
let flashes = [];             // { x, y, age, maxAge, color } — detonation pop discs
let nextShellAt = 0;          // ms (show-relative) for the next launch
let shellCount = 0;           // rotates the shell color so every color always shows
let finaleFired = false;
const MAX_SHELLS = 12;
const MAX_SPARKS = 900;       // total live burst sparks cap
const MAX_FLASHES = 12;
// ONE saturated color per shell — warm gold / red / cyan / green / violet rotation,
// all suiting the SC2000 civic palette. Each spark gets a white-hot core over its
// colored halo. RGB-triple strings so alpha can be interpolated into rgba().
const FIREWORK_COLORS = [
  '255,214,110', // warm gold
  '255,80,80',   // red
  '90,220,255',  // cyan
  '110,255,150', // civic green
  '200,130,255', // violet
];

// Isometric tile geometry
const ISO_ANGLE = 0.5;   // vertical squash for iso tiles
const TILE_W = 34;
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

// Residential is lower + warmer; commercial/downtown taller + glassier.
const DISTRICTS = {
  // anchorX / anchorY are the screen-space origin (canvas fractions) of each
  // district's isometric grid. Buildings sit on integer (col,row) tiles from
  // that anchor, so the whole district is edge-anchored into a stage region
  // and never drifts into the reserved center.
  residential: { anchorX: 0.085, anchorY: 0.62, cols: 3, rows: 5, minH: 24, maxH: 78,  palettes: [2, 4, 5] },
  commercial:  { anchorX: 0.905, anchorY: 0.60, cols: 3, rows: 5, minH: 40, maxH: 150, palettes: [0, 1, 3] },
  // Downtown is a FRONT-ELEVATION skyline row along the bottom strip (not an iso
  // diamond) — a flat baseline of extruded towers whose bases sit low and whose
  // tops stay within the bottom strip's clear corners, reading as a city
  // skyline peeking below the keyboard's lower edge.
  downtown:    { skyline: true, cols: 16, baseY: 0.995, minH: 22, maxH: 74, palettes: [0, 1, 3, 5], edgeFirst: true },
};

function isoProject(d, col, row, W, H) {
  const originX = d.anchorX * W;
  const originY = d.anchorY * H;
  // colOff/rowOff let a district center its grid on its anchor instead of
  // growing only rightward — used by downtown to straddle the bottom strip.
  const c = col - (d.colOff || 0);
  const r = row - (d.rowOff || 0);
  return {
    x: originX + (c - r) * TILE_W,
    y: originY + (c + r) * TILE_H,
  };
}

// Screen-space base of a skyline (front-elevation) building: evenly spaced
// columns across the full width, all sitting on the same low baseline.
function skylineBase(d, col, W, H) {
  const margin = W * 0.02;
  const usable = W - margin * 2;
  const x = margin + (col + 0.5) * (usable / d.cols);
  return { x, y: d.baseY * H };
}

// Pick the next empty tile in a district, spiraling outward from the anchor so
// the district visibly densifies as buildings are added.
function nextTile(dKey) {
  const d = DISTRICTS[dKey];
  const taken = new Set(districts[dKey].map(b => b.col + ',' + b.row));

  // Build a candidate list of empty tiles, then order it.
  const cand = [];
  const rows = d.rows || 1; // skyline districts are a single row
  for (let col = 0; col < d.cols; col++) {
    for (let row = 0; row < rows; row++) {
      if (!taken.has(col + ',' + row)) cand.push({ col, row });
    }
  }
  if (cand.length === 0) return null;

  if (d.edgeFirst) {
    // Fill the tiles farthest from the district center column FIRST, so the
    // buildings that land in the clear corners appear before the ones that
    // would hide behind the keyboard.
    const centerCol = (d.colOff != null) ? d.colOff : (d.cols - 1) / 2;
    cand.sort((a, b) => Math.abs(b.col - centerCol) - Math.abs(a.col - centerCol));
    return cand[0];
  }

  // Default: near tiles first (ring = col + row ascending).
  cand.sort((a, b) => (a.col + a.row) - (b.col + b.row));
  return cand[0];
}

function makeBuilding(dKey, tile) {
  const d = DISTRICTS[dKey];
  const height = d.minH + Math.random() * (d.maxH - d.minH);
  const palIdx = d.palettes[Math.floor(Math.random() * d.palettes.length)];
  const pal = BUILDING_PALETTES[palIdx];
  const footprint = 0.9 + Math.random() * 0.25;
  const wCols = 2 + Math.floor(Math.random() * 2);
  const wRows = Math.max(1, Math.floor(height / 14));
  const windows = [];
  for (let r = 0; r < wRows; r++) {
    for (let c = 0; c < wCols; c++) windows.push(Math.random() > 0.35);
  }
  return {
    dKey, col: tile.col, row: tile.row,
    height, footprint, pal, windows, wCols, wRows,
    growth: 0, flash: 0,
  };
}

// Add one building to whichever district is least full (round-robin-ish) so the
// city grows evenly across the left, right and bottom stage regions.
function growCity(instant) {
  const order = ['downtown', 'residential', 'commercial'];
  // Prefer the district with the fewest buildings, so growth spreads.
  order.sort((a, b) => districts[a].length - districts[b].length);
  for (const dKey of order) {
    const tile = nextTile(dKey);
    if (tile) {
      const b = makeBuilding(dKey, tile);
      b.growth = instant ? 1 : 0;
      districts[dKey].push(b);
      return b;
    }
  }
  return null;
}

// ─── Init ───────────────────────────────────────────────────────────────────
function init() {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  districts = { residential: [], commercial: [], downtown: [] };
  particles = [];
  sparkles = [];
  buildingsPlaced = 0;
  camPulse = 0;
  victoryStart = 0;
  shells = [];
  sparks = [];
  flashes = [];
  nextShellAt = 0;
  shellCount = 0;
  finaleFired = false;

  // Seed the city with an established skyline so the scene reads as a city at
  // idle — fully grown buildings across all three districts.
  for (let i = 0; i < 12; i++) growCity(true);
}

// ─── Particles (construction dust) ─────────────────────────────────────────
function spawnBuildParticles(screenX, screenY) {
  for (let i = 0; i < 6; i++) {
    particles.push({
      x: screenX + (Math.random() - 0.5) * 18,
      y: screenY,
      vx: (Math.random() - 0.5) * 1.4,
      vy: -0.6 - Math.random() * 1.6,
      life: 1,
      col: i % 2 === 0 ? '#dce8ff' : '#88aaff',
    });
  }
}

// ─── Sky + horizon (top band, may continue behind panels as ambient) ────────
function drawSky(W, H) {
  const grad = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  grad.addColorStop(0, '#050b16');
  grad.addColorStop(0.55, '#0a1830');
  grad.addColorStop(1, '#0e2445');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Dithered horizon band sitting in the TOP stage band (~0.15H), a light SC2K
  // "region view" grid line on the horizon rather than a smooth glow.
  const bandY = H * 0.15;
  for (let i = 0; i < 5; i++) {
    ctx.globalAlpha = 0.06 - i * 0.01;
    ctx.fillStyle = '#4a8cff';
    ctx.fillRect(0, bandY - i * 3, W, 2);
  }
  ctx.globalAlpha = 1;

  // Faint iso ground grid across the top band — the "map" horizon SimCity is
  // known for. Confined to 0–0.19H so it never crowds the prompt.
  ctx.strokeStyle = 'rgba(70, 120, 190, 0.14)';
  ctx.lineWidth = 1;
  const topBand = H * 0.19;
  const step = 46;
  for (let gx = -6; gx <= 6; gx++) {
    ctx.beginPath();
    ctx.moveTo(W / 2 + gx * step, 0);
    ctx.lineTo(W / 2 + gx * step + topBand, topBand);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W / 2 + gx * step, 0);
    ctx.lineTo(W / 2 + gx * step - topBand, topBand);
    ctx.stroke();
  }
}

// Ground shelves under each district so buildings are visibly ROOTED, not
// floating — an iso ground plane drawn beneath each district's grid.
function drawGroundShelf(dKey, W, H) {
  const d = DISTRICTS[dKey];
  const c0 = isoProject(d, -0.6, -0.6, W, H);
  const c1 = isoProject(d, d.cols - 0.4, -0.6, W, H);
  const c2 = isoProject(d, d.cols - 0.4, d.rows - 0.4, W, H);
  const c3 = isoProject(d, -0.6, d.rows - 0.4, W, H);
  ctx.fillStyle = 'rgba(20, 40, 66, 0.85)';
  ctx.beginPath();
  ctx.moveTo(c0.x, c0.y); ctx.lineTo(c1.x, c1.y);
  ctx.lineTo(c2.x, c2.y); ctx.lineTo(c3.x, c3.y);
  ctx.closePath();
  ctx.fill();

  // Grid lines on the shelf — street cells of the iso city
  ctx.strokeStyle = 'rgba(90, 150, 220, 0.18)';
  ctx.lineWidth = 1;
  for (let col = 0; col <= d.cols; col++) {
    const a = isoProject(d, col - 0.6, -0.6, W, H);
    const b = isoProject(d, col - 0.6, d.rows - 0.4, W, H);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  for (let row = 0; row <= d.rows; row++) {
    const a = isoProject(d, -0.6, row - 0.6, W, H);
    const b = isoProject(d, d.cols - 0.4, row - 0.6, W, H);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
}

// ─── Extruded flat-shaded building ─────────────────────────────────────────
function drawBuilding(b, W, H) {
  const d = DISTRICTS[b.dKey];
  const growH = b.height * easeOutCubic(b.growth);
  if (growH < 1) return;

  const base = isoProject(d, b.col, b.row, W, H);
  const halfW = TILE_W * b.footprint * 0.5;
  const halfH = TILE_H * b.footprint * 0.5;

  const bTop    = { x: base.x,          y: base.y - halfH };
  const bRight  = { x: base.x + halfW,  y: base.y };
  const bBottom = { x: base.x,          y: base.y + halfH };
  const bLeft   = { x: base.x - halfW,  y: base.y };

  const tTop    = { x: bTop.x,    y: bTop.y - growH };
  const tRight  = { x: bRight.x,  y: bRight.y - growH };
  const tBottom = { x: bBottom.x, y: bBottom.y - growH };
  const tLeft   = { x: bLeft.x,   y: bLeft.y - growH };

  const [topCol, leftCol, rightCol] = b.pal;

  // Left face — darkest
  ctx.fillStyle = leftCol;
  ctx.beginPath();
  ctx.moveTo(bLeft.x, bLeft.y); ctx.lineTo(bBottom.x, bBottom.y);
  ctx.lineTo(tBottom.x, tBottom.y); ctx.lineTo(tLeft.x, tLeft.y);
  ctx.closePath(); ctx.fill();

  // Right face — mid
  ctx.fillStyle = rightCol;
  ctx.beginPath();
  ctx.moveTo(bBottom.x, bBottom.y); ctx.lineTo(bRight.x, bRight.y);
  ctx.lineTo(tRight.x, tRight.y); ctx.lineTo(tBottom.x, tBottom.y);
  ctx.closePath(); ctx.fill();

  // Dithered gradient band on the right face (PS1/SC2K-era faked shading)
  ditherStrip(tBottom, bBottom, tRight, bRight, rightCol, topCol);

  // Roof — brightest
  ctx.fillStyle = topCol;
  ctx.beginPath();
  ctx.moveTo(tTop.x, tTop.y); ctx.lineTo(tRight.x, tRight.y);
  ctx.lineTo(tBottom.x, tBottom.y); ctx.lineTo(tLeft.x, tLeft.y);
  ctx.closePath(); ctx.fill();

  drawWindows(b, tBottom, bRight, tRight, growH);

  // Rooftop blinking light for tall towers
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
  const barW = Math.round(W * 0.14);
  const barH = 8;
  const bx = Math.round(W * 0.04);
  const by = Math.round(canvas.height * 0.83); // bottom-left stage strip, clear of HUD badge + skyline

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

// ─── Victory fireworks show ──────────────────────────────────────────────────
// Shell/burst system modeled on Missile Command's accepted v2 recipe: shells rise
// from downtown, bloom into dense radial spark clusters (64-84 sparks, speed 3-8.5,
// 0.97 damping, 42-62 frame life → bursts read from across the room), each spark a
// colored halo + white-hot core, a detonation flash disc, and the whole layer drawn
// under globalCompositeOperation:'lighter' so it GLOWS against the dark city sky
// instead of vanishing into it (journal L35).

// Launch a shell from downtown, rising up to bloom in the sky band ABOVE the
// skyline (never buried behind panels). One saturated color per shell, rotated so
// every color always appears.
function launchShell(W, H, fast) {
  if (shells.length >= MAX_SHELLS) return;
  const x = W * (0.14 + Math.random() * 0.72);
  const targetY = H * (0.05 + Math.random() * 0.30);   // 0.05..0.35H — high sky
  shells.push({
    x,
    y: H * 0.86,
    vy: -((fast ? 12 : 9) + Math.random() * 3),
    targetY,
    color: FIREWORK_COLORS[shellCount++ % FIREWORK_COLORS.length],
  });
}

// A shell reaching altitude detonates: a bright flash disc + a dense radial bloom
// ~3-4x the old sparse ring — fast sparks, slow damping, long life.
function bloom(x, y, color) {
  if (flashes.length < MAX_FLASHES) {
    flashes.push({ x, y, age: 0, maxAge: 12, color });
  }
  const n = 64 + Math.floor(Math.random() * 20);   // 64..84 sparks
  for (let i = 0; i < n; i++) {
    if (sparks.length >= MAX_SPARKS) break;
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.25;
    const spd = 3 + Math.random() * 5.5;            // 3..8.5
    sparks.push({
      x, y,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      age: 0,
      maxAge: 42 + Math.floor(Math.random() * 20),  // 42..62 frames
      color,
    });
  }
}

function updateFireworks(W, H, showT) {
  // Staggered cadence + a floor of 2 airborne shells so the sky is never empty.
  if ((showT >= nextShellAt || shells.length < 2) && showT < VICTORY_MS - 400) {
    launchShell(W, H, false);
    nextShellAt = showT + 130 + Math.random() * 160;
  }
  // Finale cluster: three near-simultaneous fast bursts late in the window.
  if (!finaleFired && showT >= VICTORY_MS - 900) {
    finaleFired = true;
    launchShell(W, H, true); launchShell(W, H, true); launchShell(W, H, true);
  }

  // Rising shells — travel UP only; bloom at target altitude.
  for (let i = shells.length - 1; i >= 0; i--) {
    const s = shells[i];
    s.y += s.vy;
    if (s.y <= s.targetY) {
      bloom(s.x, s.y, s.color);
      shells.splice(i, 1);
    }
  }
  // Sparks drift out and gently down (gravity), damping, fading.
  for (let i = sparks.length - 1; i >= 0; i--) {
    const sp = sparks[i];
    sp.x += sp.vx;
    sp.y += sp.vy;
    sp.vy += 0.05;   // gentle gravity
    sp.vx *= 0.97;   // damping
    sp.age++;
    if (sp.age >= sp.maxAge) sparks.splice(i, 1);
  }
  for (let i = flashes.length - 1; i >= 0; i--) {
    flashes[i].age++;
    if (flashes[i].age >= flashes[i].maxAge) flashes.splice(i, 1);
  }
}

// Draw the whole firework layer under additive blending so overlapping sparks and
// flashes genuinely GLOW against the dark city sky (L35).
function drawFireworks() {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // Rising shell trails — a bright streak trailing behind each climbing shell,
  // topped by a white-hot head.
  shells.forEach(s => {
    ctx.strokeStyle = `rgba(${s.color},0.9)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x, s.y - s.vy * 2.5);   // trail points DOWN behind the rising shell
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
  });

  // Detonation flash — a brief bright disc that sells the pop.
  flashes.forEach(f => {
    const t = f.age / f.maxAge;
    const r = 14 + t * 34;
    const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, Math.max(1, r));
    g.addColorStop(0, `rgba(255,255,255,${0.9 * (1 - t)})`);
    g.addColorStop(0.4, `rgba(${f.color},${0.7 * (1 - t)})`);
    g.addColorStop(1, `rgba(${f.color},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(f.x, f.y, Math.max(1, r), 0, Math.PI * 2);
    ctx.fill();
  });

  // Bloomed sparks — colored halo (4-5px) with a white-hot 2px core.
  sparks.forEach(sp => {
    const t = sp.age / sp.maxAge;
    const alpha = Math.max(0, 1 - t);
    const halo = t < 0.4 ? 5 : 4;
    ctx.fillStyle = `rgba(${sp.color},${alpha * 0.85})`;
    ctx.fillRect(sp.x - halo / 2, sp.y - halo / 2, halo, halo);
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
    ctx.fillRect(sp.x - 1, sp.y - 1, 2, 2);
  });

  ctx.restore();
}

// A warm additive wash over the whole scene whose intensity tracks the sum of
// active bursts — this is what makes the celebration TRANSFORM the city (the
// building faces visibly brighten), not just decorate the sky.
function drawCelebrationWash(W, H) {
  // Glow tracks recent detonations: each flash and each fresh spark throws light.
  let glow = 0;
  for (const f of flashes) glow += Math.max(0, 1 - f.age / f.maxAge) * 0.9;
  for (const sp of sparks) glow += Math.max(0, 1 - sp.age / sp.maxAge) * 0.012;
  glow = Math.min(0.6, glow);
  if (glow <= 0.002) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // Radial bloom centered on the sky where the shells burst.
  const g = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, H * 0.8);
  g.addColorStop(0, `rgba(255, 214, 150, ${glow})`);
  g.addColorStop(1, `rgba(120, 90, 200, ${glow * 0.3})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Flat warm lift across the whole frame so the building faces (left/right
  // margins, bottom skyline) visibly brighten — the celebration transforms the
  // CITY, not just the sky.
  ctx.fillStyle = `rgba(255, 220, 170, ${glow * 0.38})`;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// "POPULATION MILESTONE!" newspaper stinger in the top band — matches the
// theme's existing pixel-HUD language (Press Start 2P, blue civic glow).
function drawMilestoneStinger(W, H, showT) {
  // Slide/settle in the first 500ms, hold, hold to the end.
  const inT = Math.min(1, showT / 450);
  const alpha = easeOutCubic(inT);
  const cx = W / 2;
  const cy = H * 0.115;
  const bw = Math.min(W * 0.5, 460);
  const bh = 40;

  ctx.globalAlpha = alpha;
  // Newspaper card
  ctx.fillStyle = '#f2ecd8';
  ctx.fillRect(Math.round(cx - bw / 2), Math.round(cy - bh / 2), Math.round(bw), bh);
  ctx.strokeStyle = '#2a3a5a';
  ctx.lineWidth = 2;
  ctx.strokeRect(Math.round(cx - bw / 2) + 1, Math.round(cy - bh / 2) + 1, Math.round(bw) - 2, bh - 2);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.fillStyle = '#1a2a4a';
  ctx.fillText('POPULATION MILESTONE!', cx, cy - 6);
  ctx.font = '6px "Press Start 2P", monospace';
  ctx.fillStyle = '#556';
  ctx.fillText('THE CITY CELEBRATES  ★★★', cx, cy + 10);
  ctx.globalAlpha = 1;
}

// Front-elevation skyline building: an extruded box (front face + thin right
// side + flat roof) rooted on the shared baseline, with lit windows.
function drawSkylineBuilding(b, W, H) {
  const d = DISTRICTS[b.dKey];
  const growH = b.height * easeOutCubic(b.growth);
  if (growH < 1) return;

  const base = skylineBase(d, b.col, W, H);
  const bw = Math.max(16, (W * 0.96 / d.cols) * 0.62 * b.footprint);
  const depth = bw * 0.22; // little iso side sliver for a hint of 3D
  const left = base.x - bw / 2;
  const topY = base.y - growH;
  const [topCol, leftCol, rightCol] = b.pal;

  // Front face
  ctx.fillStyle = leftCol;
  ctx.fillRect(Math.round(left), Math.round(topY), Math.round(bw), Math.round(growH));

  // Right side sliver (extrusion depth)
  ctx.fillStyle = rightCol;
  ctx.beginPath();
  ctx.moveTo(left + bw, topY);
  ctx.lineTo(left + bw + depth, topY - depth * 0.5);
  ctx.lineTo(left + bw + depth, topY + growH - depth * 0.5);
  ctx.lineTo(left + bw, topY + growH);
  ctx.closePath();
  ctx.fill();

  // Roof
  ctx.fillStyle = topCol;
  ctx.beginPath();
  ctx.moveTo(left, topY);
  ctx.lineTo(left + depth, topY - depth * 0.5);
  ctx.lineTo(left + bw + depth, topY - depth * 0.5);
  ctx.lineTo(left + bw, topY);
  ctx.closePath();
  ctx.fill();

  // Windows grid on the front face — grow in with the building
  const rowsVisible = Math.floor(b.wRows * easeOutCubic(b.growth));
  const cellH = growH / Math.max(1, b.wRows);
  const cellW = bw / (b.wCols + 1);
  for (let r = 0; r < rowsVisible; r++) {
    for (let c = 0; c < b.wCols; c++) {
      if (!b.windows[(r * b.wCols + c) % b.windows.length]) continue;
      const wx = left + (c + 1) * cellW - 2;
      const wy = topY + r * cellH + cellH * 0.3;
      ctx.fillStyle = '#ffe89a';
      ctx.shadowColor = '#ffcc55';
      ctx.shadowBlur = 2;
      ctx.fillRect(Math.round(wx), Math.round(wy), 3, 4);
      ctx.shadowBlur = 0;
    }
  }

  // Rooftop blinking light for tall towers
  if (b.height > 55 && b.growth > 0.9) {
    const blinkOn = Math.floor(performance.now() / 700) % 2 === 0;
    ctx.fillStyle = blinkOn ? '#ff5555' : '#551515';
    ctx.fillRect(Math.round(base.x - 1), Math.round(topY - 6), 2, 6);
  }

  // Completion flash
  if (b.flash > 0) {
    ctx.globalAlpha = b.flash * 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.round(left), Math.round(topY), Math.round(bw), Math.round(growH));
    ctx.globalAlpha = 1;
    b.flash -= 0.06;
  }
}

// Painter's algorithm within a district: nearer tiles (larger col+row) last.
function drawDistrict(dKey, W, H) {
  const d = DISTRICTS[dKey];
  if (d.skyline) {
    // Thin ground line so the skyline reads as rooted, not floating.
    ctx.strokeStyle = 'rgba(90, 150, 220, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, d.baseY * H + 1);
    ctx.lineTo(W, d.baseY * H + 1);
    ctx.stroke();
    // Draw left-to-right; overlap order doesn't matter much on a flat baseline.
    [...districts[dKey]].sort((a, b) => a.col - b.col)
      .forEach(b => drawSkylineBuilding(b, W, H));
    return;
  }
  drawGroundShelf(dKey, W, H);
  const sorted = [...districts[dKey]].sort((a, b) => (a.col + a.row) - (b.col + b.row));
  sorted.forEach(b => drawBuilding(b, W, H));
}

function render() {
  if (!active) return;
  const W = canvas.width;
  const H = canvas.height;

  camPulse += 0.006;
  ctx.save();
  ctx.translate(0, Math.sin(camPulse) * 1.0);

  ctx.clearRect(-2, -4, W + 4, H + 8);
  drawSky(W, H);

  // Draw districts back-to-front: commercial (right/back) & residential
  // (left) first, then downtown across the bottom strip in front.
  drawDistrict('commercial', W, H);
  drawDistrict('residential', W, H);
  drawDistrict('downtown', W, H);

  // Growth animation tick
  Object.values(districts).forEach(list =>
    list.forEach(b => { if (b.growth < 1) b.growth += 0.06; }));

  updateParticles();
  drawSparkles();

  // Victory fireworks show. The wash lands over the drawn city (brightening
  // building faces), then the additive shell/spark layer draws on top of it.
  if (victoryStart > 0) {
    const showT = performance.now() - victoryStart;
    updateFireworks(W, H, showT);
    drawCelebrationWash(W, H);
    drawFireworks();
  }

  ctx.restore();

  if (victoryStart > 0) {
    const showT = performance.now() - victoryStart;
    drawMilestoneStinger(W, H, showT);
  }

  // The white rabbit hops across the bottom strip in screen space — outside the
  // camera bob's translate, so it never inherits the city's wobble.
  drawWhiteRabbit(ctx, W, H);

  drawHUD(W);

  animId = requestAnimationFrame(render);
}

// ─── Public API ──────────────────────────────────────────────────────────────
export function start() {
  init();
  resetWhiteRabbit();
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
  const b = growCity(false);
  buildingsPlaced++;
  if (b) {
    const d = DISTRICTS[b.dKey];
    const base = d.skyline
      ? skylineBase(d, b.col, canvas.width, canvas.height)
      : isoProject(d, b.col, b.row, canvas.width, canvas.height);
    spawnBuildParticles(base.x, base.y);
    for (let i = 0; i < 3; i++) {
      sparkles.push({ x: base.x + (Math.random() - 0.5) * 18, y: base.y, life: 1 });
    }
  }
}

export function miss() {
  // Flash the most recently placed building — gentle nudge only, never punishing.
  let last = null;
  for (const list of Object.values(districts)) {
    if (list.length) last = list[list.length - 1];
  }
  if (last) last.flash = 0.4;
}

export function patternComplete() {
  const won = buildingsPlaced >= WIN_BUILDINGS;
  maybeWhiteRabbit(won);   // cosmetic only — never gates or delays the win
  return won;
}

export function victory() {
  // Start the milestone fireworks show: shells launch from downtown and bloom
  // over the skyline, their light washing warm over the whole city. Driven by
  // render() off victoryStart; returns the show duration so the LEVEL COMPLETE
  // card lands as the finale does.
  victoryStart = performance.now();
  shells = [];
  sparks = [];
  flashes = [];
  nextShellAt = 0;
  shellCount = 0;
  finaleFired = false;
  // A first pair of shells right away so the celebration reads instantly.
  const W = canvas ? canvas.width : 1280;
  const H = canvas ? canvas.height : 800;
  launchShell(W, H, false);
  launchShell(W, H, false);
  return VICTORY_MS;
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
