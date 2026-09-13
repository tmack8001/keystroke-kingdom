// Age of Empires — Ensemble Studios, 1997 — Level 18
// Isometric 3D terrain with elevation-shaded tiles, a polygon-faced castle,
// and tiny villager units that walk the grid. Resource sparkles on keystroke.
// Early-3D look: flat-shaded diamond tiles with per-tile height/shade, extruded
// castle walls with distinct top/left/right faces — same iso-3D grammar as
// simcity.js but re-themed for terrain instead of skyline.

// The Act 4 white rabbit is shared by all five Command Center themes and lives in
// terminal.js (the act's hidden-history host) — see easter-eggs.md.
import { resetWhiteRabbit, maybeWhiteRabbit, drawWhiteRabbit } from './terminal.js';

let canvas, ctx, animId;
let active = false;
let troops = [];
let tiles = [];
let resources = { wood: 0, gold: 0, food: 0, stone: 0 };
let totalGathered = 0;
let particles = [];
let sparkles = [];
const WIN_RESOURCES = 25;
const RESOURCE_TYPES = ['wood', 'gold', 'food', 'stone'];
const RESOURCE_COLORS = { wood: '#8b5e2a', gold: '#c8a840', food: '#44aa44', stone: '#888888' };
// Additive-friendly RGB triples (L35: dark iso scene swallows alpha washes, so
// celebration layers composite with 'lighter' and use saturated per-channel colors).
const RESOURCE_RGB = { wood: '210,150,70', gold: '255,215,90', food: '110,230,110', stone: '210,210,220' };

// ─── Victory (wonder-built / age-advance celebration) ─────────────────────────
const VICTORY_MS = 3500;
let victoryMode = false;
let victoryFrame = 0;   // frames elapsed since victory() fired (clamped in draw math)
let vFountains = [];    // resource-colored jets erupting UP from the town center
let vShimmer = [];      // gilded ring sprites sweeping outward over buildings

const GRID_W = 15;
const GRID_H = 10;
const TILE_W = 64;
const TILE_H = 32;

function isoProject(gx, gy, elev, W, H) {
  const originX = W * 0.5;
  const originY = H * 0.06;
  return {
    x: originX + (gx - gy) * (TILE_W / 2),
    y: originY + (gx + gy) * (TILE_H / 2) - elev,
  };
}

function buildTerrain() {
  tiles = [];
  for (let gy = 0; gy < GRID_H; gy++) {
    for (let gx = 0; gx < GRID_W; gx++) {
      // Gentle rolling elevation via layered sine noise — cheap, deterministic,
      // reads as "terrain" without needing a real heightmap.
      const elev = Math.round(
        (Math.sin(gx * 0.6) * Math.cos(gy * 0.8) * 6 + Math.sin((gx + gy) * 0.4) * 4) + 4
      );
      tiles.push({ gx, gy, elev });
    }
  }
}

function drawTile(t, W, H) {
  const p = isoProject(t.gx, t.gy, t.elev, W, H);
  const hw = TILE_W / 2, hh = TILE_H / 2;

  const top    = { x: p.x,      y: p.y - hh };
  const right  = { x: p.x + hw, y: p.y };
  const bottom = { x: p.x,      y: p.y + hh };
  const left   = { x: p.x - hw, y: p.y };

  // Flat-shaded top face — brightness keyed to elevation (higher = brighter),
  // the classic AoE isometric terrain-shading trick, done with flat fills only.
  const shade = 0.55 + Math.min(1, t.elev / 12) * 0.35;
  const g = Math.round(70 * shade), r = Math.round(46 * shade), b = Math.round(20 * shade);
  ctx.fillStyle = `rgb(${r + 30},${g + 30},${b})`;
  ctx.beginPath();
  ctx.moveTo(top.x, top.y); ctx.lineTo(right.x, right.y);
  ctx.lineTo(bottom.x, bottom.y); ctx.lineTo(left.x, left.y);
  ctx.closePath();
  ctx.fill();

  // Extruded side face down to ground level — gives the tile a sense of height/depth
  if (t.elev > 2) {
    const groundBottom = { x: bottom.x, y: bottom.y + t.elev };
    const groundLeft = { x: left.x, y: left.y + t.elev };
    ctx.fillStyle = `rgb(${Math.round((r + 30) * 0.55)},${Math.round((g + 30) * 0.55)},${Math.round(b * 0.55)})`;
    ctx.beginPath();
    ctx.moveTo(left.x, left.y); ctx.lineTo(bottom.x, bottom.y);
    ctx.lineTo(groundBottom.x, groundBottom.y); ctx.lineTo(groundLeft.x, groundLeft.y);
    ctx.closePath();
    ctx.fill();
  }

  // Thin seam so tiles read as discrete polygon faces, not a blurred blob
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(top.x, top.y); ctx.lineTo(right.x, right.y);
  ctx.lineTo(bottom.x, bottom.y); ctx.lineTo(left.x, left.y);
  ctx.closePath();
  ctx.stroke();
}

function init() {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  troops = [];
  particles = [];
  sparkles = [];
  resources = { wood: 0, gold: 0, food: 0, stone: 0 };
  totalGathered = 0;
  buildTerrain();

  for (let i = 0; i < 3; i++) spawnTroop();
}

function tileElevAt(gx, gy) {
  const t = tiles.find(t => Math.round(t.gx) === Math.round(gx) && Math.round(t.gy) === Math.round(gy));
  return t ? t.elev : 4;
}

function spawnTroop() {
  const gx = 2 + Math.random() * (GRID_W - 6);
  const gy = 2 + Math.random() * (GRID_H - 4);
  troops.push({
    gx, gy,
    dir: Math.random() > 0.5 ? 1 : -1,
    speed: 0.008 + Math.random() * 0.008,
    frame: 0,
    frameTimer: Math.random() * 100,
    bob: Math.random() * Math.PI * 2,
  });
}

function drawSkyBackdrop(W, H) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.32);
  skyGrad.addColorStop(0, '#120a04');
  skyGrad.addColorStop(1, '#241608');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H * 0.32);

  ctx.fillStyle = '#0a0602';
  ctx.fillRect(0, H * 0.3, W, H * 0.72);
}

// Screen position of the town center (the castle) — the origin of the wonder bloom.
function townCenter(W, H) {
  const gx = GRID_W - 2.6, gy = 1.2;
  return isoProject(gx, gy, tileElevAt(gx, gy), W, H);
}

function drawCastle(W, H) {
  // Castle positioned on the far grid corner, built from the same iso face
  // grammar as the terrain tiles/simcity buildings — top/left/right flat polys.
  const p = townCenter(W, H);

  const wallH = 70, towerH = 110, hw = 34, hh = 17;

  function extrudedDiamond(cx, cy, w, h, height, palette) {
    const halfW = w / 2, halfH = h / 2;
    const bTop = { x: cx, y: cy - halfH }, bRight = { x: cx + halfW, y: cy };
    const bBottom = { x: cx, y: cy + halfH }, bLeft = { x: cx - halfW, y: cy };
    const tTop = { x: bTop.x, y: bTop.y - height }, tRight = { x: bRight.x, y: bRight.y - height };
    const tBottom = { x: bBottom.x, y: bBottom.y - height }, tLeft = { x: bLeft.x, y: bLeft.y - height };

    ctx.fillStyle = palette[1];
    ctx.beginPath();
    ctx.moveTo(bLeft.x, bLeft.y); ctx.lineTo(bBottom.x, bBottom.y);
    ctx.lineTo(tBottom.x, tBottom.y); ctx.lineTo(tLeft.x, tLeft.y);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = palette[2];
    ctx.beginPath();
    ctx.moveTo(bBottom.x, bBottom.y); ctx.lineTo(bRight.x, bRight.y);
    ctx.lineTo(tRight.x, tRight.y); ctx.lineTo(tBottom.x, tBottom.y);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = palette[0];
    ctx.beginPath();
    ctx.moveTo(tTop.x, tTop.y); ctx.lineTo(tRight.x, tRight.y);
    ctx.lineTo(tBottom.x, tBottom.y); ctx.lineTo(tLeft.x, tLeft.y);
    ctx.closePath(); ctx.fill();

    // Battlements on the roof
    for (let i = 0; i < 4; i++) {
      const t0 = (i + 0.5) / 4;
      const bx = tTop.x + (tRight.x - tTop.x) * t0 * 0.5 + (tLeft.x - tTop.x) * t0 * 0.5;
      ctx.fillStyle = palette[0];
      ctx.fillRect(Math.round(lerp2(tLeft.x, tRight.x, t0) - 2), Math.round(lerp2(tLeft.y, tRight.y, t0) - 5), 4, 5);
    }
    return tTop;
  }
  function lerp2(a, b, t) { return a + (b - a) * t; }

  const stonePal = ['#8a8478', '#5a564c', '#403c34'];
  extrudedDiamond(p.x - 20, p.y - 5, hw, hh, towerH, stonePal);
  extrudedDiamond(p.x + 26, p.y + 8, hw, hh, towerH * 0.85, stonePal);
  const mainTop = extrudedDiamond(p.x + 4, p.y + 2, hw * 1.4, hh * 1.4, wallH, stonePal);

  // Banner on the main tower, gently animated
  const t = performance.now() / 1000;
  ctx.strokeStyle = '#8b5e2a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(mainTop.x, mainTop.y);
  ctx.lineTo(mainTop.x, mainTop.y - 16);
  ctx.stroke();
  ctx.fillStyle = '#c8840a';
  ctx.beginPath();
  ctx.moveTo(mainTop.x + 1, mainTop.y - 16);
  ctx.lineTo(mainTop.x + 10 + Math.sin(t * 2) * 2, mainTop.y - 11 + Math.sin(t * 2 + 1) * 1.5);
  ctx.lineTo(mainTop.x + 1, mainTop.y - 6);
  ctx.closePath();
  ctx.fill();
}

// Tiny 3-frame walk cycle, drawn as flat-shaded pixel blocks positioned in iso space
const TROOP_FRAMES = [
  [[0,1,0],[1,1,1],[0,1,0],[1,0,0],[0,0,1]],
  [[0,1,0],[1,1,1],[0,1,0],[0,1,0],[0,1,0]],
  [[0,1,0],[1,1,1],[0,1,0],[0,0,1],[1,0,0]],
];

function drawTroop(t, W, H) {
  const elev = tileElevAt(t.gx, t.gy);
  const p = isoProject(t.gx, t.gy, elev, W, H);
  const bobY = Math.sin(t.bob) * 1;
  const scale = 3;
  const frame = TROOP_FRAMES[t.frame % TROOP_FRAMES.length];
  const facing = t.dir;

  ctx.fillStyle = '#3a2a14';
  frame.forEach((row, ry) => {
    row.forEach((cell, rx) => {
      if (!cell) return;
      const dx = facing === 1 ? rx : (2 - rx);
      ctx.fillRect(
        Math.round(p.x - scale * 1.5 + dx * scale),
        Math.round(p.y - scale * 5 + ry * scale + bobY),
        scale, scale
      );
    });
  });

  // Spear glint
  ctx.strokeStyle = '#c8b888';
  ctx.lineWidth = 1;
  const spearX = p.x + (facing === 1 ? scale * 2.4 : -scale * 2.4);
  ctx.beginPath();
  ctx.moveTo(spearX, p.y - scale * 5 + bobY);
  ctx.lineTo(spearX, p.y - scale * 9 + bobY);
  ctx.stroke();

  // Soft contact shadow — flat ellipse, not a soft-shadow blur (era rule)
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 1, scale * 1.6, scale * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawResources(W, H) {
  const ry = H * 0.92;
  const cols = ['wood', 'gold', 'food', 'stone'];

  cols.forEach((res, i) => {
    const label = res[0].toUpperCase() + ':' + resources[res];
    const col = RESOURCE_COLORS[res];

    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 4;
    ctx.fillText(label, Math.round(W * (0.04 + i * 0.24)), ry);
    ctx.shadowBlur = 0;
  });

  const pct = totalGathered / WIN_RESOURCES;
  const barW = Math.round(W * 0.18);
  const bx = Math.round(W * 0.02);
  const by = 14;

  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#c8840a';
  ctx.shadowColor = '#c8840a';
  ctx.shadowBlur = 4;
  ctx.fillText(`EMPIRE ${totalGathered}/${WIN_RESOURCES}`, bx, by);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#201408';
  ctx.fillRect(bx, by + 5, barW, 8);
  ctx.fillStyle = '#c8840a';
  ctx.fillRect(bx, by + 5, Math.round(barW * pct), 8);
  ctx.strokeStyle = '#5a3800';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx + 0.5, by + 5.5, barW - 1, 7);
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.life -= 0.04;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.col;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), 3, 3);
    ctx.globalAlpha = 1;
  }
}

function updateSparkles() {
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    s.life -= 0.025;
    if (s.life <= 0) { sparkles.splice(i, 1); continue; }
    ctx.globalAlpha = s.life;
    ctx.fillStyle = '#fff2c0';
    ctx.fillRect(Math.round(s.x), Math.round(s.y - (1 - s.life) * 20), 2, 2);
    ctx.globalAlpha = 1;
  }
}

// ─── Victory celebration ──────────────────────────────────────────────────────
// The wonder is complete / the empire advances an age: a golden radiance blooms
// from the town center OVER the visible map (additive per L35 — the wash visibly
// brightens the tiles and buildings), a gilded shimmer ring sweeps outward, and
// resource-colored fountains erupt UPWARD from the map's buildings — never into
// the void below. An era-authentic "WONDER COMPLETE" banner + horn flourish sits
// in the top band.

function spawnFountain(W, H) {
  if (vFountains.length >= 100) return;
  const type = RESOURCE_TYPES[Math.floor(Math.random() * RESOURCE_TYPES.length)];
  const c = townCenter(W, H);
  // Origin spread across the visible map: from the town center out to the map's
  // middle, so fountains erupt from buildings/terrain across the map rather than
  // clustering at the far corner (and never into the void below).
  const ox = c.x * 0.45 + W * 0.42 * 0.55;
  const oy = (c.y + H * 0.30) * 0.5;
  vFountains.push({
    x: ox + (Math.random() - 0.5) * W * 0.40,
    y: oy + (Math.random() - 0.5) * H * 0.14,  // on the map surface
    vx: (Math.random() - 0.5) * 3.2,
    vy: -5.5 - Math.random() * 4.5,            // strong UP impulse
    life: 1,
    rgb: RESOURCE_RGB[type],
  });
}

function spawnShimmer(W, H) {
  const c = townCenter(W, H);
  vShimmer.push({ x: c.x, y: c.y - 20, r: 6, life: 1 });
}

function drawVictory(W, H) {
  // Frame-driven, but clamp so no sentinel value reaches geometry (F1).
  const vf = Math.min(victoryFrame, 100000);
  const secs = vf / 60;

  const c = townCenter(W, H);
  // Bloom center: pulled toward the visible map's middle so the wash lands on the
  // terrain/buildings the player is looking at, not just the far corner.
  const bx = (c.x + W * 0.5) * 0.5;
  const by = (c.y + H * 0.30) * 0.5;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // 1) Golden radiance — a big additive disc that visibly brightens the map.
  const grow = Math.min(1, secs / 0.6);
  const radius = Math.max(1, W * (0.20 + 0.35 * grow));  // clamp >0 (F1)
  const pulse = 0.72 + Math.sin(vf * 0.10) * 0.14;
  const rg = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
  rg.addColorStop(0, `rgba(255,240,180,${0.55 * pulse})`);
  rg.addColorStop(0.35, `rgba(255,210,110,${0.34 * pulse})`);
  rg.addColorStop(0.7, `rgba(220,160,60,${0.16 * pulse})`);
  rg.addColorStop(1, 'rgba(200,140,50,0)');
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.arc(bx, by, radius, 0, Math.PI * 2);
  ctx.fill();

  // 2) Gilded shimmer rings sweeping outward from the town center over the buildings.
  vShimmer.forEach(s => {
    const a = Math.max(0, s.life);
    ctx.strokeStyle = `rgba(255,230,140,${a * 0.8})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y, Math.max(1, s.r), Math.max(1, s.r * 0.5), 0, 0, Math.PI * 2);
    ctx.stroke();
  });

  // 3) Resource-colored fountains — colored halo with a white-hot core.
  vFountains.forEach(f => {
    const a = Math.max(0, f.life);
    ctx.fillStyle = `rgba(${f.rgb},${a * 0.9})`;
    ctx.fillRect(Math.round(f.x - 2), Math.round(f.y - 2), 5, 5);
    ctx.fillStyle = `rgba(255,255,240,${a * 0.9})`;
    ctx.fillRect(Math.round(f.x - 1), Math.round(f.y - 1), 2, 2);
  });

  ctx.restore();

  // 4) "WONDER COMPLETE" banner + horn-blast flourish in the top band.
  const bannerA = Math.min(1, secs / 0.4);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const bannerY = H * 0.10;
  // Horn-blast rays behind the text.
  ctx.globalCompositeOperation = 'lighter';
  const rays = 12;
  const rayLen = W * 0.16 * (0.6 + 0.4 * Math.min(1, secs / 0.5));
  for (let i = 0; i < rays; i++) {
    const ang = (i / rays) * Math.PI * 2 + vf * 0.02;
    ctx.strokeStyle = `rgba(255,215,110,${bannerA * (0.10 + 0.06 * (0.5 + 0.5 * Math.sin(vf * 0.15 + i)))})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W * 0.5, bannerY);
    ctx.lineTo(W * 0.5 + Math.cos(ang) * rayLen, bannerY + Math.sin(ang) * rayLen * 0.45);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '14px "Press Start 2P", monospace';
  ctx.fillStyle = `rgba(255,236,170,${bannerA})`;
  ctx.shadowColor = 'rgba(255,180,70,0.95)';
  ctx.shadowBlur = 14;
  ctx.fillText('WONDER COMPLETE', W * 0.5, bannerY);
  ctx.shadowBlur = 0;
  ctx.restore();
}

function updateVictory(W, H) {
  victoryFrame++;
  // Emit fountains steadily through the window so the map never goes quiet.
  const secs = victoryFrame / 60;
  if (secs < 3.0) {
    for (let i = 0; i < 3; i++) spawnFountain(W, H);
  }
  if (victoryFrame % 10 === 0 && secs < 2.6) spawnShimmer(W, H);

  for (let i = vFountains.length - 1; i >= 0; i--) {
    const f = vFountains[i];
    f.x += f.vx;
    f.y += f.vy;
    f.vy += 0.16;          // gravity — jets rise then arc back over the map
    f.life -= 0.018;
    if (f.life <= 0) vFountains.splice(i, 1);
  }
  for (let i = vShimmer.length - 1; i >= 0; i--) {
    const s = vShimmer[i];
    s.r += 5;
    s.life -= 0.03;
    if (s.life <= 0) vShimmer.splice(i, 1);
  }
}

function render() {
  if (!active) return;
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  drawSkyBackdrop(W, H);

  // Painter's-algorithm depth sort: tiles by (gx+gy), castle drawn after terrain,
  // troops interleaved by depth so they visually sit on the correct tile.
  const sortedTiles = [...tiles].sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy));
  sortedTiles.forEach(t => drawTile(t, W, H));

  drawCastle(W, H);

  troops.forEach(t => {
    if (!victoryMode) {
      t.gx += t.speed * t.dir;
      t.bob += 0.06;
      t.frameTimer += 1;
      if (t.frameTimer > 12) { t.frameTimer = 0; t.frame = (t.frame + 1) % TROOP_FRAMES.length; }
      if (t.gx < 1 || t.gx > GRID_W - 2) t.dir *= -1;
    }
    drawTroop(t, W, H);
  });

  if (victoryMode) {
    updateVictory(W, H);
    drawVictory(W, H);
  } else {
    updateParticles();
    updateSparkles();
    drawResources(W, H);
  }

  drawWhiteRabbit(ctx, W, H);

  animId = requestAnimationFrame(render);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function start() {
  init();
  resetWhiteRabbit();
  active = true;
  victoryMode = false;
  victoryFrame = 0;
  vFountains = [];
  vShimmer = [];
  animId = requestAnimationFrame(render);
}

export function stop() {
  active = false;
  victoryMode = false;
  vFountains = [];
  vShimmer = [];
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function keystroke() {
  if (!active) return;
  totalGathered++;
  const type = RESOURCE_TYPES[totalGathered % RESOURCE_TYPES.length];
  resources[type]++;

  const W = canvas.width, H = canvas.height;
  const col = RESOURCE_COLORS[type];
  for (let i = 0; i < 5; i++) {
    particles.push({
      x: W * 0.15 + Math.random() * W * 0.55,
      y: H * 0.55 + Math.random() * H * 0.15,
      vx: (Math.random() - 0.5) * 2,
      vy: -1 - Math.random() * 2,
      life: 1,
      col,
    });
  }
  for (let i = 0; i < 3; i++) {
    sparkles.push({ x: W * 0.2 + Math.random() * W * 0.5, y: H * 0.5 + Math.random() * H * 0.15, life: 1 });
  }

  if (totalGathered % 5 === 0) spawnTroop();
}

export function miss() {}

export function patternComplete() {
  const won = totalGathered >= WIN_RESOURCES;
  maybeWhiteRabbit(won);   // cosmetic only — never gates or delays the win
  return won;
}

export function victory() {
  if (!active) return VICTORY_MS;
  const W = canvas.width, H = canvas.height;
  // Enter the wonder-built celebration: golden radiance over the map, gilded
  // shimmer sweep, resource fountains erupting up from the buildings, and the
  // "WONDER COMPLETE" banner. Returns its duration; the engine lands the LEVEL
  // COMPLETE card as the celebration plays out.
  victoryMode = true;
  victoryFrame = 0;
  vFountains = [];
  vShimmer = [];
  // Seed an immediate first burst so the map lights on frame one.
  for (let i = 0; i < 24; i++) spawnFountain(W, H);
  spawnShimmer(W, H);
  return VICTORY_MS;
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
