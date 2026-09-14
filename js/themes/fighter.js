// Level 4 — Galaga (Namco, 1981)
//
// A faithful Galaga scene: deep-space black, a starfield with three depth
// layers, rainbow bug formations in grid choreography, dive-bomb arcs, and the
// iconic twin-fighter capture-beam as an ambient background flourish.
//
// This file was formerly a Street Fighter II brawler (SFII now lives at Level
// 12 in streetfighter.js). Rewritten to match the curriculum's Level 4
// assignment. Faithful recreation, no key-glyph puns.
//
// Scar tissue honored:
//  - L16: all geometry is positioned in CANVAS space (fractions of W/H), never
//    DOM space.
//  - L17: the formation is anchored HIGH (top ~14–42% of the canvas) so it
//    never collides with the centered letter prompt at W*0.5, H*0.5.
//  - F1: no sentinel animation-frame values reach arc/geometry math. Every
//    dive and beam uses a clamped 0..1 progress; victory sets no giant frames.
//  - 60fps: bounded arrays (stars, dives, blasts, bugs) — no per-frame
//    allocation in the hot draw path beyond the small bounded pools.

let canvas, ctx;
let animId = null;
let active = false;
let victoryMode = false;

// --- starfield (three depth layers) ---
const STAR_COUNT = 90;
let stars = [];

// --- formation ---
let bugs = [];
let formationPhase = 0;      // slow left/right sway, radians
const FORM_COLS = 8;
const FORM_ROWS = 5;

// Rainbow bug palette — red / blue / yellow / green / white, era-faithful.
const BUG_COLORS = ['#ff3333', '#3366ff', '#ffee33', '#33dd55', '#ffffff', '#ff66cc'];

// --- dive bombers (spawned on keystroke) ---
const MAX_DIVES = 10;
let dives = [];

// --- hit blasts (bounded pool) ---
const MAX_BLASTS = 24;
let blasts = [];

// --- the twin-fighter capture-beam flourish ---
// Ambient only: a lone fighter drifts along the bottom; occasionally the boss
// bug fires a tractor beam and captures/releases it. Pure spectacle.
let fighter = { x: 0, driftDir: 1 };
let beam = { active: false, t: 0, bx: 0, by: 0 }; // t is 0..1 clamped
let beamCooldown = 0;

// Bug sprite (8x8), classic Galaga "bee/boss" silhouette. Drawn at px scale.
const BUG_SHAPE = [
  [0,0,1,0,0,1,0,0],
  [0,1,1,1,1,1,1,0],
  [1,1,0,1,1,0,1,1],
  [1,1,1,1,1,1,1,1],
  [1,0,1,1,1,1,0,1],
  [0,1,0,1,1,0,1,0],
  [1,0,1,0,0,1,0,1],
  [0,1,0,0,0,0,1,0],
];

const FIGHTER_SHAPE = [
  [0,0,0,1,1,0,0,0],
  [0,0,0,1,1,0,0,0],
  [0,0,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1],
  [1,1,0,1,1,0,1,1],
  [1,0,0,1,1,0,0,1],
];

function getCanvas() {
  if (!canvas) {
    canvas = document.getElementById('invaders-canvas');
    ctx = canvas.getContext('2d');
  }
  return canvas;
}

function clamp(v, lo, hi) {
  return v < lo ? lo : (v > hi ? hi : v);
}

function spawnStars() {
  stars = [];
  const W = canvas.width, H = canvas.height;
  for (let i = 0; i < STAR_COUNT; i++) {
    // depth 0 = far/slow/dim, 2 = near/fast/bright
    const depth = i % 3;
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      depth,
      // twinkle phase
      tw: Math.random() * Math.PI * 2,
      color: Math.random() < 0.12
        ? BUG_COLORS[Math.floor(Math.random() * BUG_COLORS.length)]
        : '#ffffff'
    });
  }
}

function spawnFormation() {
  bugs = [];
  const W = canvas.width, H = canvas.height;
  const px = Math.max(2, Math.round(Math.min(W, H) / 260)); // sprite pixel size
  const bugW = 8 * px;
  const bugH = 8 * px;
  const gapX = bugW * 0.6;
  const gapY = bugH * 0.2;
  const totalW = FORM_COLS * bugW + (FORM_COLS - 1) * gapX;
  const startX = (W - totalW) / 2;
  // L17 / the Theme Layout Contract: the formation lives in the TOP BAND
  // (0-0.19H), fully clear of the prompt panel.
  //
  // The previous pass got this half-right and said so honestly: it tightened
  // gapY and startY, then concluded "the bottom two rows still graze the
  // panel's top edge — a 5-row-tall formation cannot fit entirely above 0.19H
  // WITHOUT SHRINKING SPRITES game-wide." That last clause was the answer, and
  // it was not taken: the sprite scale is per-theme (this `px`), not game-wide.
  //
  // A theme audit photographed what "graze" actually looked like on 2026-09-13:
  // the magenta prompt letter was rendering INSIDE the formation, on top of a
  // magenta bug, and "TYPE THE LETTER" ran straight through the yellow rank.
  // On Level 4 — where A unlocks and the first readable words appear. The child
  // could not find the letter they were being asked to type.
  //
  // So the sprite shrank (px divisor 220 -> 260) and the formation moved to the
  // very top. Five ranks now measure ~139px and span 0.015H-0.189H at 1280x800:
  // entirely above the reserved edge, with all five ranks kept — faithful AND
  // out of the way, which the earlier pass believed was impossible.
  const startY = H * 0.015;

  for (let row = 0; row < FORM_ROWS; row++) {
    for (let col = 0; col < FORM_COLS; col++) {
      // Rows colored by rank (classic Galaga: boss row on top, bees below),
      // here mapped to the rainbow palette so each row is a distinct color.
      const color = BUG_COLORS[row % BUG_COLORS.length];
      bugs.push({
        col, row,
        homeX: startX + col * (bugW + gapX),
        homeY: startY + row * (bugH + gapY),
        px,
        color,
        alive: true,
        flash: 0,
        // per-bug wing-flap phase for subtle animation
        flap: Math.random() * Math.PI * 2,
      });
    }
  }
}

function formationOffsetX() {
  // gentle sway; amplitude scales with canvas width but stays modest
  return Math.sin(formationPhase) * (canvas.width * 0.03);
}

function bugCenter(b) {
  const swayX = formationOffsetX();
  const size = 8 * b.px;
  return { x: b.homeX + swayX + size / 2, y: b.homeY + size / 2, size };
}

function addBlast(x, y, color) {
  if (blasts.length >= MAX_BLASTS) blasts.shift();
  blasts.push({ x, y, color, frame: 0, max: 18 });
}

// --- hooks -----------------------------------------------------------------

export function keystroke() {
  if (!active || victoryMode) return;

  // A random living bug peels off and dive-bombs in a graceful arc, then
  // returns to its slot. This is the Galaga signature move.
  const alive = [];
  for (let i = 0; i < bugs.length; i++) if (bugs[i].alive) alive.push(bugs[i]);
  if (alive.length === 0) return;

  if (dives.length < MAX_DIVES) {
    const b = alive[Math.floor(Math.random() * alive.length)];
    const c = bugCenter(b);
    const W = canvas.width, H = canvas.height;
    // dive toward lower-left or lower-right edge (never dead-center — L17),
    // arcing down and back up.
    const toLeft = c.x > W * 0.5;
    dives.push({
      bug: b,
      t: 0,                         // 0..1 clamped progress
      speed: 0.012 + Math.random() * 0.01,
      startX: c.x,
      startY: c.y,
      // control + end points anchored toward an edge and the lower screen
      ctrlX: toLeft ? W * (0.15 + Math.random() * 0.1) : W * (0.75 + Math.random() * 0.1),
      ctrlY: H * (0.62 + Math.random() * 0.1),
      endX: toLeft ? W * (0.08 + Math.random() * 0.08) : W * (0.84 + Math.random() * 0.08),
      endY: H * (0.30 + Math.random() * 0.08),
    });
  }
}

// Called after each completed pattern. Returns true when the "game" is won.
// A dive-bomber gets zapped on each pattern (spectacle), and the level is
// clearable once the formation is thinned out. Safe to call repeatedly.
export function patternComplete() {
  if (!active) return false;

  const alive = [];
  for (let i = 0; i < bugs.length; i++) if (bugs[i].alive) alive.push(bugs[i]);

  // Zap a couple of bugs per completed pattern as a reward flourish. Two per
  // pattern keeps the formation clearing at roughly the pace of the level's
  // own intro drills, so the theme is never the thing that gates level
  // completion — the engine already requires minPatterns + the history card.
  const zaps = Math.min(2, alive.length);
  for (let z = 0; z < zaps; z++) {
    const idx = Math.floor(Math.random() * alive.length);
    const target = alive[idx];
    target.alive = false;
    alive.splice(idx, 1);
    const c = bugCenter(target);
    addBlast(c.x, c.y, target.color);
  }

  // Won once the formation is essentially cleared. This becomes true and
  // stays true (bugs only ever die), so repeated calls are safe.
  let remaining = 0;
  for (let i = 0; i < bugs.length; i++) if (bugs[i].alive) remaining++;
  return remaining === 0;
}

export function miss() {
  // No punishment. A gentle sympathetic twinkle: brighten a couple of stars.
  if (!active || stars.length === 0) return;
  for (let i = 0; i < 3; i++) {
    const s = stars[Math.floor(Math.random() * stars.length)];
    s.tw = 0; // reset twinkle to its bright peak
  }
}

export function victory() {
  victoryMode = true;
  dives = [];
  beam.active = false;

  // Celebratory: light up remaining bugs into blasts, one warm burst each.
  // No sentinel frames — every blast uses a bounded 0..max frame counter.
  for (let i = 0; i < bugs.length; i++) {
    const b = bugs[i];
    if (!b.alive) continue;
    b.alive = false;
    const c = bugCenter(b);
    addBlast(c.x, c.y, b.color);
  }
  // A ring of extra sparks high on screen (well above the prompt).
  const W = canvas.width, H = canvas.height;
  const ringN = Math.min(MAX_BLASTS, 12);
  for (let i = 0; i < ringN; i++) {
    const a = (i / ringN) * Math.PI * 2;
    addBlast(
      W * 0.5 + Math.cos(a) * W * 0.18,
      H * 0.22 + Math.sin(a) * H * 0.08,
      BUG_COLORS[i % BUG_COLORS.length]
    );
  }
}

// --- update ----------------------------------------------------------------

function update() {
  const W = canvas.width, H = canvas.height;

  // starfield scroll (downward, depth-scaled)
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const spd = 0.3 + s.depth * 0.6;
    s.y += spd;
    if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
    s.tw += 0.05 + s.depth * 0.03;
  }

  // formation sway
  formationPhase += 0.012;

  // wing flap
  for (let i = 0; i < bugs.length; i++) {
    if (bugs[i].alive) bugs[i].flap += 0.15;
    if (bugs[i].flash > 0) bugs[i].flash--;
  }

  // dives — advance clamped progress; remove when complete or bug dead
  for (let i = dives.length - 1; i >= 0; i--) {
    const d = dives[i];
    d.t = clamp(d.t + d.speed, 0, 1);
    if (d.t >= 1 || !d.bug.alive) dives.splice(i, 1);
  }

  // blasts
  for (let i = blasts.length - 1; i >= 0; i--) {
    blasts[i].frame++;
    if (blasts[i].frame >= blasts[i].max) blasts.splice(i, 1);
  }

  if (victoryMode) return;

  // lone fighter drift along the bottom (ambient)
  fighter.x += fighter.driftDir * 0.8;
  if (fighter.x > W * 0.78) fighter.driftDir = -1;
  else if (fighter.x < W * 0.22) fighter.driftDir = 1;

  // capture-beam flourish, on a slow cooldown
  if (beam.active) {
    beam.t = clamp(beam.t + 0.006, 0, 1);
    if (beam.t >= 1) {
      beam.active = false;
      beamCooldown = 360 + Math.floor(Math.random() * 360); // ~6-12s at 60fps
    }
  } else {
    if (beamCooldown > 0) {
      beamCooldown--;
    } else {
      // fire from a living top-row (boss) bug if one exists
      let boss = null;
      for (let i = 0; i < bugs.length; i++) {
        if (bugs[i].alive && bugs[i].row === 0) { boss = bugs[i]; break; }
      }
      if (boss) {
        const c = bugCenter(boss);
        beam.active = true;
        beam.t = 0;
        beam.bx = c.x;
        beam.by = c.y + c.size * 0.5;
      } else {
        beamCooldown = 300;
      }
    }
  }
}

// --- draw ------------------------------------------------------------------

function drawStars() {
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const tw = 0.5 + 0.5 * Math.sin(s.tw);
    const base = 0.25 + s.depth * 0.28;
    ctx.globalAlpha = clamp(base * (0.5 + tw * 0.5), 0, 1);
    ctx.fillStyle = s.color;
    const sz = 1 + s.depth;
    ctx.fillRect(s.x, s.y, sz, sz);
  }
  ctx.globalAlpha = 1;
}

function drawSprite(shape, cx, cy, px, color, flapLift) {
  const rows = shape.length;
  const cols = shape[0].length;
  const ox = cx - (cols * px) / 2;
  const oy = cy - (rows * px) / 2;
  ctx.fillStyle = color;
  for (let r = 0; r < rows; r++) {
    // subtle wing flap: outer columns lift by flapLift px on top rows
    for (let c = 0; c < cols; c++) {
      if (!shape[r][c]) continue;
      let yoff = 0;
      if (flapLift && (c === 0 || c === cols - 1) && r < 3) yoff = -flapLift;
      ctx.fillRect(ox + c * px, oy + r * px + yoff, px, px);
    }
  }
}

function drawBugs() {
  const swayX = formationOffsetX();
  for (let i = 0; i < bugs.length; i++) {
    const b = bugs[i];
    if (!b.alive) continue;
    // skip drawing at home if currently diving — the dive path draws it
    const size = 8 * b.px;
    const cx = b.homeX + swayX + size / 2;
    const cy = b.homeY + size / 2;
    const flap = Math.abs(Math.sin(b.flap)) * b.px;
    const color = b.flash > 0 ? '#ffffff' : b.color;
    drawSprite(BUG_SHAPE, cx, cy, b.px, color, flap);
  }
}

function drawDives() {
  for (let i = 0; i < dives.length; i++) {
    const d = dives[i];
    if (!d.bug.alive) continue;
    // quadratic Bézier out (0..0.5) then mirror back to a home slot (0.5..1),
    // all driven by clamped t — no sentinel values reach this math.
    const t = clamp(d.t, 0, 1);
    let px, py;
    if (t < 0.5) {
      const u = t / 0.5;             // 0..1 down-arc
      const mu = 1 - u;
      px = mu * mu * d.startX + 2 * mu * u * d.ctrlX + u * u * d.endX;
      py = mu * mu * d.startY + 2 * mu * u * d.ctrlY + u * u * d.endY;
    } else {
      const u = (t - 0.5) / 0.5;     // 0..1 return-arc back to home
      const mu = 1 - u;
      const home = bugCenter(d.bug);
      px = mu * mu * d.endX + 2 * mu * u * d.ctrlX + u * u * home.x;
      py = mu * mu * d.endY + 2 * mu * u * d.ctrlY + u * u * home.y;
    }
    const flap = Math.abs(Math.sin(t * 20)) * d.bug.px;
    drawSprite(BUG_SHAPE, px, py, d.bug.px, d.bug.color, flap);
  }
}

function drawBlasts() {
  for (let i = 0; i < blasts.length; i++) {
    const bl = blasts[i];
    const p = clamp(bl.frame / bl.max, 0, 1);
    const alpha = 1 - p;
    ctx.globalAlpha = alpha;
    const spread = p * 22;
    const n = 8;
    const sz = 2 + (1 - p) * 4;
    for (let j = 0; j < n; j++) {
      const a = (j / n) * Math.PI * 2;
      const x = bl.x + Math.cos(a) * spread;
      const y = bl.y + Math.sin(a) * spread;
      ctx.fillStyle = j % 2 === 0 ? bl.color : '#ffffff';
      ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
    }
  }
  ctx.globalAlpha = 1;
}

function drawFighter() {
  const H = canvas.height;
  const px = Math.max(2, Math.round(Math.min(canvas.width, H) / 240));
  const fy = H * 0.86;
  drawSprite(FIGHTER_SHAPE, fighter.x, fy, px, '#66ddff', 0);
}

function drawBeam() {
  if (!beam.active) return;
  const H = canvas.height;
  // The beam used to run all the way to the fighter at 0.86H, which meant it
  // crossed the KEYBOARD GUIDE's reserved band (0.49-0.81H) every time it fired
  // — a translucent blue stripe over the key boxes a child is reading. It now
  // reaches down only as far as the gap band above the guide and fades out
  // there, which still reads as a beam reaching for the ship without ever
  // touching the UI. (Theme Layout Contract; found by the 2026-09-13 audit.)
  const fy = H * 0.46;
  const t = clamp(beam.t, 0, 1);
  // beam brightens in (0..0.3), holds, fades out (0.7..1)
  let intensity;
  if (t < 0.3) intensity = t / 0.3;
  else if (t > 0.7) intensity = (1 - t) / 0.3;
  else intensity = 1;
  intensity = clamp(intensity, 0, 1);

  // trapezoid tractor beam from boss bug down toward the fighter
  const topW = beam.by ? 14 : 14;
  const botW = 60;
  const topY = beam.by;
  const botY = fy;
  const grad = ctx.createLinearGradient(0, topY, 0, botY);
  grad.addColorStop(0, `rgba(120,180,255,${0.55 * intensity})`);
  grad.addColorStop(1, `rgba(120,180,255,0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(beam.bx - topW / 2, topY);
  ctx.lineTo(beam.bx + topW / 2, topY);
  ctx.lineTo(beam.bx + botW / 2, botY);
  ctx.lineTo(beam.bx - botW / 2, botY);
  ctx.closePath();
  ctx.fill();

  // scan rings drifting up the beam
  ctx.globalAlpha = intensity * 0.6;
  ctx.strokeStyle = '#aaccff';
  ctx.lineWidth = 1;
  for (let k = 0; k < 3; k++) {
    const rp = ((t * 3 + k / 3) % 1);
    const y = botY + (topY - botY) * rp;
    const w = botW + (topW - botW) * rp;
    ctx.beginPath();
    ctx.ellipse(beam.bx, y, w / 2, 3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function draw() {
  ctx.fillStyle = '#000008';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStars();
  if (!victoryMode) {
    drawBeam();
    drawFighter();
  }
  drawBugs();
  drawDives();
  drawBlasts();
}

function render() {
  if (!active) return;
  update();
  draw();
  animId = requestAnimationFrame(render);
}

function resize() {
  const c = getCanvas();
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  fighter.x = c.width * 0.5;
  fighter.driftDir = 1;
  spawnStars();
  spawnFormation();
  beam.active = false;
  beamCooldown = 180;
}

export function start() {
  getCanvas();
  active = true;
  victoryMode = false;
  dives = [];
  blasts = [];
  formationPhase = 0;
  resize();
  render();
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  dives = [];
  blasts = [];
  bugs = [];
}

window.addEventListener('resize', () => {
  if (active && !victoryMode) resize();
});
