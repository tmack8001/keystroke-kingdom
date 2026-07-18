// Level 6: Donkey Kong (Nintendo, 1981)
// The 1981 construction-site cabinet playing live. A GIANT brown ape squats at the top
// of a four-girder tower, sways, pounds the steel, and hurls barrels down the sloped
// girders. Jumpman (Mario) climbs the tower as the player types — and visibly HOPS over
// the rolling barrels that come at him (the core 1981 mechanic). Pink-dressed Pauline is
// caged at the summit beside DK, calling "HELP!". Reaching her clears the stage: DK
// pounds in defeat and a heart blooms — the real screen-clear reunion.
//
// Era facts (research/wiki/games/donkey-kong.md): red-capped Mario, big brown ape, pink
// captive Pauline, four girder stages, barrels roll the sloped girders. Menace is aimed
// at Mario the sprite (era-correct) — never at the player; the game never punishes a
// typing mistake, and no DKC-era jungle vines belong on this 1981 cabinet.

let canvas, ctx;
let animId = null, active = false, victoryMode = false;
let frame = 0;

// Climb progress advances toward STEPS_TO_WIN as the player types; won at STEPS_TO_WIN.
let progress = 0;
const STEPS_TO_WIN = 32;

// Engagement gate (journal L20): unattended tab = ambient DK + rolling barrels only.
// Mario's climb progress advances ONLY inside keystroke() — never from the sim loop —
// so with no input he simply holds while the scene stays alive around him.

let barrels = [];            // { x, y, vx, vy, floor, rollPhase } — bounded pool
let barrelTimer = 0;
let marioJump = 0;           // Mario hop timer (frames); a real arc that clears barrels
let sparks = [];             // keystroke feedback particles (bounded)
let score = 0;
let shake = 0;               // brief screen-shake when DK pounds (comic, small)

// DK behaviour: sway → wind up → hurl → pound (chest/girder), looping.
let dkState = 'sway';
let dkStateTimer = 0;
let dkPound = 0;             // pound toggle within 'pound'

// Pauline "HELP!" bubble
let helpTimer = 0, helpShow = 0;

// Victory celebration
const VICTORY_MS = 3600;
let victoryFrame = 0;
let confetti = [];
let bonusScore = 0;
const BONUS_TARGET = 5000;

// Layout
let W = 0, H = 0;
let floors = [];             // { y, xa, xb, tilt }
let ladders = [];            // { x, y1, y2 }
let dkPos = {};
let cagePos = {};            // Pauline's pen at the summit
let path = [];               // Mario climb waypoints
let skyBands = [];

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

// ─── Pixel sprites ────────────────────────────────────────────────────────────

let MARIO_PX = 5;     // Jumpman scale (recomputed per layout)
let DK_PX = 9;        // DK is GIGANTIC relative to Mario — the top of the tower
const PX = 5;         // baseline scale for Pauline / heart / cage-relative art
const JUMP_FRAMES = 20; // duration of Mario's barrel-clearing hop

const MARIO_RUN_A = [
  [0,0,1,1,1,0,0],
  [0,1,1,1,1,1,0],
  [0,1,2,2,2,1,0],   // 2 = skin/face tone
  [1,1,2,2,2,1,1],
  [0,0,3,3,3,0,0],   // 3 = overall blue
  [0,3,3,0,3,3,0],
  [0,1,1,0,1,1,0],
];
const MARIO_RUN_B = [
  [0,0,1,1,1,0,0],
  [0,1,1,1,1,1,0],
  [0,1,2,2,2,1,0],
  [1,1,2,2,2,1,1],
  [0,0,3,3,3,0,0],
  [0,3,3,0,3,3,0],
  [1,1,0,0,0,1,1],
];
const MARIO_JUMP = [
  [0,0,1,1,1,0,0],
  [0,1,1,1,1,1,0],
  [0,1,2,2,2,1,0],
  [1,1,2,2,2,1,1],
  [1,0,3,3,3,0,1],   // arms out — the jump pose
  [0,0,3,3,3,0,0],
  [0,1,1,0,1,1,0],
];
const MARIO_CLIMB = [
  [0,1,1,1,1,1,0],
  [0,1,2,2,2,1,0],
  [1,0,3,3,3,0,1],
  [0,0,3,3,3,0,0],
  [1,0,3,3,3,0,1],
  [0,1,1,0,1,1,0],
  [0,0,1,0,1,0,0],
];
// Palette indices → colors for Mario (red cap/shirt, skin, blue overalls).
const MARIO_COLS = { 1: '#e82020', 2: '#f0b088', 3: '#3050d0' };

// DK — big brown ape body. Two poses: squat idle (arms down) and hurl (arms overhead).
const DK_IDLE = [
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,1,0,1,1,1,1,0,1,1,1],
  [1,1,1,1,4,4,4,4,1,1,1,1],   // 4 = light muzzle
  [1,1,1,1,4,4,4,4,1,1,1,1],
  [0,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,1,0,0,0,0,0,0,1,1,1],   // shoulders/arms out
  [1,1,0,1,1,1,1,1,1,0,1,1],   // chest
  [0,1,1,1,4,1,1,4,1,1,1,0],
  [0,0,1,1,0,0,0,0,1,1,0,0],
  [0,1,1,0,0,0,0,0,0,1,1,0],   // legs
];
const DK_HURL = [
  [1,1,1,0,0,0,0,0,0,1,1,1],   // arms raised overhead
  [1,1,0,0,1,1,1,1,0,0,1,1],
  [0,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,1,0,1,1,1,1,0,1,1,1],
  [1,1,1,1,4,4,4,4,1,1,1,1],
  [1,1,1,1,4,4,4,4,1,1,1,1],
  [0,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,0,1,1,1,1,1,1,0,1,1],
  [0,1,1,1,4,1,1,4,1,1,1,0],
  [0,0,1,1,0,0,0,0,1,1,0,0],
  [0,1,1,0,0,0,0,0,0,1,1,0],
];
const DK_COLS = { 1: '#8B4513', 4: '#c98a55' };

const PAULINE_SPRITE = [
  [0,0,1,1,1,0,0],
  [0,1,1,1,1,1,0],
  [0,1,2,2,2,1,0],   // face
  [0,0,5,5,5,0,0],   // pink dress
  [0,5,5,5,5,5,0],
  [0,5,5,5,5,5,0],
  [0,1,0,0,0,1,0],   // legs
];
const PAULINE_COLS = { 1: '#f0b088', 2: '#f0b088', 5: '#ff66aa' };

const HEART_SPRITE = [
  [0,1,1,0,1,1,0],
  [1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1],
  [0,1,1,1,1,1,0],
  [0,0,1,1,1,0,0],
  [0,0,0,1,0,0,0],
];

// Palette-aware pixel blitter. `cols` maps nonzero indices to colors; a bare truthy
// value with no map uses `defaultCol`.
function drawPx(shape, x, y, size, defaultCol, cols, flipH = false) {
  const w = shape[0].length;
  shape.forEach((row, r) => row.forEach((c, cc) => {
    if (!c) return;
    ctx.fillStyle = cols && cols[c] ? cols[c] : defaultCol;
    ctx.fillRect(x + (flipH ? w - 1 - cc : cc) * size, y + r * size, size, size);
  }));
}

// ─── Layout ─────────────────────────────────────────────────────────────────
// The tower commands the LEFT stage margin + top band. DK + Pauline's cage own the top
// band above the reserved center; girders span wide so barrels have a long visible roll.
//
// Mario-visibility follow-up (2026-07-13): the DOM keyboard-guide panel occupies roughly
// 0.22-0.78W x 0.49-0.81H (visual-validation.md Theme Layout Contract). Floors 1 and 2
// (y fractions ~0.70 and ~0.50) fall INSIDE that y-band, so any ladder or walk segment on
// those floors that sits at x 0.22-0.78 is hidden for its whole duration. Floors 0 (~0.90)
// and 3 (~0.30) are outside the guide's y-band entirely, so full-width travel there is
// always visible. Fix: keep every ladder (climbing is slow) at x < 0.20W — left of the
// guide — on floors 1 and 2; the only crossings into the center happen as brief horizontal
// walks on floor 0 or floor 3, where the guide can't hide them.

function buildLayout() {
  W = canvas.width; H = canvas.height;
  MARIO_PX = Math.max(4, Math.round(H / 150));
  DK_PX = Math.max(7, Math.round(H / 78));

  const bottomY = Math.floor(H * 0.90);
  const topY = Math.floor(H * 0.30);
  floors = [];
  // Explicit alternating tilt per floor (not i%2-derived) — chosen so a rolling barrel's
  // travel direction on each floor points AT that floor's down-ladder, not away from it
  // (barrel-jump follow-up, 2026-07-13; see updateBarrels()/spawnBarrel() notes below).
  const TILT_SIGN = [-1, 1, -1, 1];
  for (let i = 0; i < 4; i++) {
    const y = Math.round(bottomY - (i / 3) * (bottomY - topY));
    const tilt = TILT_SIGN[i] * Math.floor(H * 0.022);
    floors.push({ y, xa: Math.floor(W * 0.05), xb: Math.floor(W * 0.95), tilt });
  }

  // All three ladders sit left of the keyboard-guide's safe-zone (x < 0.20W) so the
  // slow climbing segments — floors 1 and 2 sit inside the guide's y-band — are never
  // hidden behind the panel. x-positions also form a deliberate zigzag (0.19 -> 0.08 ->
  // 0.19) matched to each floor's tilt direction above, so barrels reliably reach every
  // floor instead of rolling away from their down-ladder (barrel-jump follow-up).
  ladders = [
    { x: Math.floor(W * 0.19), y1: floors[1].y, y2: floors[0].y },
    { x: Math.floor(W * 0.08), y1: floors[2].y, y2: floors[1].y },
    { x: Math.floor(W * 0.19), y1: floors[3].y, y2: floors[2].y },
  ];

  // DK squats on the top girder, dominating the top-left band.
  const dkH = DK_IDLE.length * DK_PX;
  dkPos = { x: Math.floor(W * 0.10), y: floors[3].y - dkH };

  // Pauline's cage: a girder pen up-right of DK at the summit (floor 3 — above the
  // guide's y-band, so the approach walk there is safely visible even this far right).
  cagePos = {
    x: Math.floor(W * 0.30),
    y: floors[3].y - Math.floor(H * 0.22),
    w: Math.floor(W * 0.06),
    h: Math.floor(H * 0.14),
  };

  // Mario climb path: ladders (floors 1-2) stay left of the guide throughout; the only
  // center-crossing walks are on floor 0 (below the guide) and floor 3 (above it), and
  // each is a short hop rather than a long traversal — brief enough to never bury him.
  const mH = MARIO_RUN_A.length * MARIO_PX;
  path = [
    { x: floors[0].xa + Math.floor(W * 0.02), y: floors[0].y - mH },  // start, floor 0
    { x: ladders[0].x + 10,                    y: floors[0].y - mH },  // brief walk to ladder 0 (floor 0, safe)
    { x: ladders[0].x + 10,                    y: floors[1].y - mH },  // climb ladder 0 (left margin)
    { x: ladders[1].x - 10,                    y: floors[1].y - mH },  // short walk, floor 1, left margin only
    { x: ladders[1].x - 10,                    y: floors[2].y - mH },  // climb ladder 1 (left margin)
    { x: ladders[2].x + 10,                    y: floors[2].y - mH },  // short walk, floor 2, left margin only
    { x: ladders[2].x + 10,                    y: floors[3].y - mH },  // climb ladder 2 (left margin)
    { x: cagePos.x - Math.floor(W * 0.02),     y: floors[3].y - mH },  // brief walk to cage, floor 0-analog (above guide, safe)
  ];

  buildSkyBands();
}

function buildSkyBands() {
  skyBands = [];
  const stops = ['#050a18', '#06101f', '#081426', '#0a182c', '#0c1a30', '#081426'];
  for (let i = 0; i < stops.length; i++) {
    skyBands.push({ y: Math.floor((i / stops.length) * H * 0.90), col: stops[i] });
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
    floor: segIdx <= 1 ? 0 : segIdx <= 3 ? 1 : segIdx <= 5 ? 2 : 3,
    onLadder: (Math.abs(b.x - a.x) < 6),
    facingRight: b.x >= a.x,
  };
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function drawBackground() {
  skyBands.forEach((b, i) => {
    const next = skyBands[i + 1];
    const bandH = (next ? next.y : H * 0.90) - b.y;
    ctx.fillStyle = b.col;
    ctx.fillRect(0, b.y, W, bandH);
  });
  ctx.fillStyle = '#04070f';
  ctx.fillRect(0, Math.floor(H * 0.90), W, H - Math.floor(H * 0.90));

  ctx.fillStyle = 'rgba(255, 180, 60, 0.10)';
  for (let i = 0; i < 10; i++) {
    const wx = (i * 97 + 40) % W;
    const wy = Math.floor(H * 0.04) + (i % 3) * Math.floor(H * 0.03);
    ctx.fillRect(wx, wy, 5, 5);
  }
}

function drawFloor(f) {
  const t = f.tilt;
  const th = Math.max(14, Math.floor(H * 0.02));
  ctx.fillStyle = '#7a2a0a';
  ctx.beginPath();
  ctx.moveTo(f.xa, f.y + t);
  ctx.lineTo(f.xb, f.y - t);
  ctx.lineTo(f.xb, f.y - t + th);
  ctx.lineTo(f.xa, f.y + t + th);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#e0863a';
  ctx.beginPath();
  ctx.moveTo(f.xa, f.y + t);
  ctx.lineTo(f.xb, f.y - t);
  ctx.lineTo(f.xb, f.y - t + 4);
  ctx.lineTo(f.xa, f.y + t + 4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#a04010';
  for (let rx = f.xa + 20; rx < f.xb - 12; rx += 34) {
    const ry = f.y + t - (rx - f.xa) / (f.xb - f.xa) * t * 2 + th - 5;
    ctx.fillRect(rx, ry, 5, 5);
  }
}

function drawLadder(l) {
  const rw = Math.max(6, Math.floor(W * 0.006));
  ctx.fillStyle = '#b8ccdd';
  ctx.fillRect(l.x - rw - 2, l.y1, rw, l.y2 - l.y1);
  ctx.fillRect(l.x + 2, l.y1, rw, l.y2 - l.y1);
  ctx.fillStyle = '#e8f0f8';
  for (let ry = l.y1 + 10; ry < l.y2; ry += 16) {
    ctx.fillRect(l.x - rw - 2, ry, rw * 2 + 4, 4);
  }
}

function drawDK() {
  const sway = Math.round(Math.sin(frame * 0.05) * DK_PX * 0.4);
  const pounding = (dkState === 'pound' && dkPound === 1);
  const squash = pounding ? DK_PX : 0;
  const raised = (dkState === 'windup' || dkState === 'hurl');
  const sp = raised ? DK_HURL : DK_IDLE;

  const bx = dkPos.x + sway;
  const by = dkPos.y + squash;
  drawPx(sp, bx, by, DK_PX, '#8B4513', DK_COLS);

  // Eyes on the muzzle band.
  const eyeY = by + DK_PX * (raised ? 4 : 3) + 2;
  ctx.fillStyle = '#fff';
  ctx.fillRect(bx + DK_PX * 4 + 2, eyeY, DK_PX, DK_PX);
  ctx.fillRect(bx + DK_PX * 7 - 2, eyeY, DK_PX, DK_PX);
  ctx.fillStyle = '#000';
  ctx.fillRect(bx + DK_PX * 4 + 3, eyeY + 2, 3, 3);
  ctx.fillRect(bx + DK_PX * 7 - 1, eyeY + 2, 3, 3);

  // Barrel hoisted overhead during the hurl.
  if (raised) {
    const held = bx + DK_PX * 6;
    const topY = by - DK_PX * 2;
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(held - DK_PX, topY, DK_PX * 2, DK_PX * 1.6);
    ctx.fillStyle = '#D2691E';
    ctx.fillRect(held - DK_PX + 2, topY + 2, DK_PX * 2 - 4, DK_PX * 1.6 - 4);
  }
}

function drawCage() {
  const c = cagePos;
  // Barred pen (girder cage) — the jailed-princess presentation.
  ctx.strokeStyle = '#c07030';
  ctx.lineWidth = 4;
  ctx.strokeRect(c.x, c.y, c.w, c.h);
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let bx = c.x + 10; bx < c.x + c.w; bx += 12) {
    ctx.moveTo(bx, c.y); ctx.lineTo(bx, c.y + c.h);
  }
  ctx.stroke();

  // Pauline inside, near the summit floor.
  const near = progress >= STEPS_TO_WIN - 3 || victoryMode;
  const cols = near ? PAULINE_COLS : { 1: '#c08080', 2: '#c08080', 5: '#e04888' };
  drawPx(PAULINE_SPRITE, c.x + Math.floor(c.w * 0.28), c.y + c.h - PAULINE_SPRITE.length * PX - 2, PX, '#ff66aa', cols);

  // "HELP!" bubble while captive.
  if (helpShow > 0 && !victoryMode) {
    const bx = c.x + c.w + 8;
    const by = c.y + 2;
    ctx.fillStyle = '#fff';
    ctx.fillRect(bx, by, 72, 26);
    ctx.fillRect(bx - 8, by + 8, 10, 8); // tail toward the cage
    ctx.fillStyle = '#c01818';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('HELP!', bx + 8, by + 7);
  }
}

function drawMario() {
  const mp = getMarioPos();
  const walkCycle = Math.floor(frame / 6) % 2;
  let sprite;
  if (marioJump > 0) sprite = MARIO_JUMP;
  else if (mp.onLadder) sprite = MARIO_CLIMB;
  else sprite = walkCycle === 0 ? MARIO_RUN_A : MARIO_RUN_B;

  // Jump arc: a real parabola tall enough to clear a barrel.
  const jumpH = marioJump > 0 ? Math.sin((1 - marioJump / JUMP_FRAMES) * Math.PI) * MARIO_PX * 6 : 0;
  drawPx(sprite, Math.round(mp.x), Math.round(mp.y - jumpH), MARIO_PX, '#e82020', MARIO_COLS, !mp.facingRight);
}

function drawBarrels() {
  barrels.forEach(b => {
    const rollFrame = Math.floor(b.rollPhase || 0) % 4;
    const r = b.r;
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(b.x - r, b.y - r, r * 2, r * 2);
    ctx.fillStyle = '#D2691E';
    ctx.fillRect(b.x - r + 2, b.y - r + 2, r * 2 - 4, r * 2 - 4);
    ctx.fillStyle = '#8B4513';
    if (rollFrame === 0 || rollFrame === 2) {
      ctx.fillRect(b.x - r * 0.5, b.y - r, r, 3);
      ctx.fillRect(b.x - r * 0.5, b.y + r - 3, r, 3);
    } else {
      ctx.fillRect(b.x - r, b.y - r * 0.5, 3, r);
      ctx.fillRect(b.x + r - 3, b.y - r * 0.5, 3, r);
    }
    const ang = (b.rollPhase || 0) * (Math.PI / 2);
    ctx.fillStyle = '#f0a050';
    ctx.fillRect(b.x + Math.cos(ang) * r * 0.5 - 2, b.y + Math.sin(ang) * r * 0.5 - 2, 4, 4);
  });
}

function drawScore() {
  ctx.fillStyle = '#e82020';
  ctx.font = '12px "Press Start 2P", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(String(score).padStart(6, '0'), W - 12, 24);

  const climbed = Math.floor(progress / STEPS_TO_WIN * 4);
  for (let i = 0; i < 4; i++) {
    const done = i < climbed;
    ctx.fillStyle = done ? '#e82020' : '#2a0800';
    ctx.shadowColor = done ? '#e82020' : 'transparent';
    ctx.shadowBlur = done ? 6 : 0;
    ctx.fillRect(14 + i * 16, 16, 11, 11);
  }
  ctx.shadowBlur = 0;
}

// ─── Simulation ────────────────────────────────────────────────────────────────

// Cadence tightened (barrel-jump follow-up, 2026-07-13) so a barrel spawns roughly every
// ~1.4s instead of ~2s — combined with the wider barrelThreateningMario() detection window
// below, this makes Mario visibly hop a barrel every few seconds of steady typing instead
// of only occasionally, without changing the input contract or the sim's engagement gate.
function updateDK() {
  dkStateTimer--;
  switch (dkState) {
    case 'sway':
      if (dkStateTimer <= 0) { dkState = 'windup'; dkStateTimer = 16; }
      break;
    case 'windup':
      if (dkStateTimer <= 0) { dkState = 'hurl'; dkStateTimer = 8; spawnBarrel(); }
      break;
    case 'hurl':
      if (dkStateTimer <= 0) { dkState = 'pound'; dkStateTimer = 28; dkPound = 0; }
      break;
    case 'pound':
      if (dkStateTimer % 10 === 0) { dkPound ^= 1; if (dkPound) shake = 6; }
      if (dkStateTimer <= 0) { dkState = 'sway'; dkStateTimer = 32; }
      break;
  }
}

function spawnBarrel() {
  if (barrels.length >= 6) return;
  const r = Math.max(8, Math.round(H * 0.016));
  barrels.push({
    x: dkPos.x + DK_PX * 6, y: floors[3].y - r, vx: 2.2, vy: 0, floor: 3, rollPhase: 0, r,
  });
}

function updateBarrels() {
  const th = Math.max(14, Math.floor(H * 0.02));
  barrels = barrels.filter(b => {
    b.vy += 0.2;
    b.x += b.vx;
    b.y += b.vy;
    b.rollPhase = (b.rollPhase || 0) + Math.abs(b.vx) * 0.32;

    for (let fi = Math.max(b.floor, 0); fi >= 0; fi--) {
      const f = floors[fi];
      const ty = f.y + f.tilt - (b.x - f.xa) / (f.xb - f.xa) * f.tilt * 2;
      if (b.y >= ty - b.r && b.y < ty + th + 14 && b.x >= f.xa && b.x <= f.xb) {
        b.y = ty - b.r;
        b.vy = 0;
        b.floor = fi;
        b.vx = f.tilt > 0 ? 2.2 : -2.2;
        break;
      }
    }

    const cf = (b.floor >= 0 && b.floor < floors.length) ? floors[b.floor] : null;

    // A ladder's y1 is its UPPER anchor (the floor a barrel descends FROM); match against
    // that, not y2 (the lower landing), or a barrel on the top floor never finds its ladder
    // (barrel-jump follow-up, 2026-07-13 — this previously stranded barrels on floor 3).
    if (cf) {
      for (const l of ladders) {
        if (Math.abs(l.y1 - cf.y) < 8 && Math.abs(b.x - l.x) < 12 && b.vy < 1) {
          b.vy = 2.4;
          b.floor--;
          // Re-derive vx from the NEW floor's tilt — carrying over the old floor's vx sign
          // left barrels rolling away from the next ladder down instead of toward it.
          const nf = floors[b.floor];
          if (nf) b.vx = nf.tilt > 0 ? 2.2 : -2.2;
          break;
        }
      }
    }
    if (cf && (b.x < cf.xa || b.x > cf.xb)) { b.floor--; b.vy = Math.max(b.vy, 1); }

    return b.y < H + 30;
  });

  if (++barrelTimer > 90) { barrelTimer = 0; spawnBarrel(); }
}

// Is there a barrel bearing down on Mario's current girder near him? (drives the jump)
// Windows widened slightly (barrel-jump follow-up, 2026-07-13) — Mario's floor-0/2 walk
// segments are now brief, so the detection window needed to be generous enough to still
// catch an oncoming barrel during that short a crossing.
function barrelThreateningMario() {
  const mp = getMarioPos();
  if (mp.onLadder) return false;
  return barrels.some(b =>
    b.floor === mp.floor &&
    Math.abs(b.y - mp.y) < H * 0.13 &&
    Math.abs(b.x - (mp.x + MARIO_PX * 3)) < W * 0.12
  );
}

function updatePauline() {
  if (--helpTimer <= 0) { helpShow = 100; helpTimer = 280 + Math.floor(Math.random() * 160); }
  if (helpShow > 0) helpShow--;
}

function spawnSparks(x, y) {
  for (let i = 0; i < 6; i++) {
    if (sparks.length >= 60) break;
    sparks.push({ x, y, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 2.5 - 0.5, life: 16 });
  }
}
function updateSparks() {
  sparks = sparks.filter(s => s.life > 0);
  sparks.forEach(s => { s.vy += 0.15; s.x += s.vx; s.y += s.vy; s.life--; });
}
function drawSparks() {
  sparks.forEach(s => {
    ctx.globalAlpha = Math.max(s.life / 16, 0);
    ctx.fillStyle = '#ffcc60';
    ctx.fillRect(s.x - 1, s.y - 1, 4, 4);
  });
  ctx.globalAlpha = 1;
}

// ─── Victory ────────────────────────────────────────────────────────────────

const CONFETTI_COLS = ['#e82020', '#f0a050', '#ffcc60', '#ff66aa', '#c07030'];

function pushConfetti(seedTop) {
  if (confetti.length >= 60) return;
  confetti.push({
    x: W * (0.05 + Math.random() * 0.9),
    y: seedTop ? -Math.random() * H * 0.3 : -8,
    vx: (Math.random() - 0.5) * 1.2,
    vy: Math.random() * 1.5 + 0.6,
    col: CONFETTI_COLS[confetti.length % CONFETTI_COLS.length],
    size: 4 + Math.floor(Math.random() * 3),
    spin: Math.random() * Math.PI,
  });
}

function updateVictory() {
  if (victoryFrame < 100000) victoryFrame++;
  if (bonusScore < BONUS_TARGET) bonusScore = Math.min(BONUS_TARGET, bonusScore + 140);
  if (victoryFrame % 8 === 0) pushConfetti(false);
  confetti = confetti.filter(c => c.y < H + 12);
  confetti.forEach(c => { c.x += c.vx; c.y += c.vy; c.spin += 0.2; });
  if (victoryFrame % 10 === 0) dkPound ^= 1;
  dkState = 'pound';
}

function drawConfetti() {
  confetti.forEach(c => {
    const flat = Math.floor(c.spin / Math.PI) % 2 === 0;
    ctx.fillStyle = c.col;
    if (flat) ctx.fillRect(c.x - c.size / 2, c.y - 2, c.size, 3);
    else ctx.fillRect(c.x - 2, c.y - c.size / 2, 3, c.size);
  });
}

function drawVictoryHeart() {
  const cx = cagePos.x + cagePos.w * 0.4;
  const cy = cagePos.y - Math.floor(H * 0.04);
  const beat = 1 + 0.18 * Math.sin(victoryFrame * 0.22);
  const px = Math.max(3, Math.round(PX * 1.6 * beat));
  const wpx = HEART_SPRITE[0].length * px;
  ctx.shadowColor = '#ff3366';
  ctx.shadowBlur = 12;
  drawPx(HEART_SPRITE, Math.round(cx - wpx / 2), Math.round(cy), px, '#ff3366', null);
  ctx.shadowBlur = 0;
}

function drawVictoryBanner() {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = '14px "Press Start 2P", monospace';
  ctx.fillStyle = '#ffcc60';
  ctx.shadowColor = '#e82020';
  ctx.shadowBlur = 8;
  ctx.fillText('BONUS ' + String(bonusScore).padStart(5, '0'), W / 2, Math.floor(H * 0.03));
  ctx.shadowBlur = 0;
}

// ─── Main loop ────────────────────────────────────────────────────────────────

function drawScene(victory) {
  // Small comic screen-shake when DK pounds.
  const sx = shake > 0 ? Math.round((Math.random() - 0.5) * shake) : 0;
  const sy = shake > 0 ? Math.round((Math.random() - 0.5) * shake) : 0;
  ctx.save();
  ctx.translate(sx, sy);

  drawBackground();
  floors.forEach(drawFloor);
  ladders.forEach(drawLadder);
  if (victory) drawConfetti();
  drawDK();
  drawCage();
  if (!victory) drawBarrels();
  drawMario();
  if (!victory) drawSparks();
  if (victory) drawVictoryHeart();

  ctx.restore();

  drawScore();
  if (victory) drawVictoryBanner();
}

function render() {
  if (!active) return;
  frame++;
  ctx.clearRect(0, 0, W, H);

  if (victoryMode) {
    drawScene(true);
    updateVictory();
    if (shake > 0) shake--;
    animId = requestAnimationFrame(render);
    return;
  }

  drawScene(false);

  if (marioJump > 0) marioJump--;
  if (shake > 0) shake--;
  updateDK();
  updateBarrels();
  updatePauline();
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
  barrels = []; barrelTimer = 0; score = 0; sparks = []; shake = 0;
  dkState = 'sway'; dkStateTimer = 32; dkPound = 0;
  helpTimer = 90; helpShow = 0;
  marioJump = 0;
  victoryFrame = 0; confetti = []; bonusScore = 0;
  buildLayout();
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  barrels = []; sparks = []; confetti = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  progress = Math.min(STEPS_TO_WIN, progress + 1);
  score += 100;
  // If a barrel is bearing down on Mario, the keystroke becomes a jump that clears it;
  // otherwise it's a normal climb step. Either way Mario advances (never punished).
  if (barrelThreateningMario()) marioJump = JUMP_FRAMES;
  const mp = getMarioPos();
  spawnSparks(mp.x + MARIO_PX * 3, mp.y + MARIO_PX * 3);
}

export function miss() {}

export function patternComplete() {
  return progress >= STEPS_TO_WIN;
}

export function victory() {
  victoryMode = true;
  progress = STEPS_TO_WIN;
  barrels = [];
  sparks = [];
  victoryFrame = 0;
  bonusScore = 0;
  confetti = [];
  for (let i = 0; i < 40; i++) pushConfetti(true);
  dkState = 'pound'; dkPound = 1;
  return VICTORY_MS;
}

window.addEventListener('resize', () => {
  if (active) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    buildLayout();
  }
});
