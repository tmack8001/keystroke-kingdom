// Level 10: The Legend of Zelda (Nintendo, 1986)
// A top-down dungeon room composed AROUND the fixed UI: the stone-block WALLS
// frame the entire screen edge, with locked doors at the left, right and top
// wall centers; torches burn in the four corners; Link and collectible
// hearts/rupees/keys live in the left/right stage margins; a gold Triforce
// shimmers in the gap band between the prompt and the keyboard guide. The floor
// is ambient fill and continues behind the panels so the room reads continuous.
//
// LAYOUT CONTRACT (see task): the UI owns the center; the theme owns the frame.
// Reserved: prompt ~0.40-0.60W x 0.19-0.43H; keyboard guide ~0.22-0.78W x
// 0.49-0.81H; HUD corners. Stage regions used: full wall border, four corners,
// left/right margins, and the gap band (~0.43-0.49H). Everything is positioned
// in canvas fractions of W/H, never DOM space. The top door is safe at top
// band center because the prompt only begins at 0.19H.

let canvas, ctx;
let animId = null, active = false, victoryMode = false;
let frame = 0;

let progress = 0;
const STEPS_TO_WIN = 30;
const ROOMS_TO_CLEAR = 3;   // three locked doors unlock across the level

let score = 0;
let stepFlash = 0;
let triforceGlow = 0;
let W = 0, H = 0;

let sparkles = [];     // rupee/heart flash on keystroke (in a margin)
let doorPulse = 0;     // gold flash when a door unlocks

let victoryFrame = 0;  // bounded 0..VICTORY_FRAMES counter driving the finale
const VICTORY_FRAMES = 210;   // ~3.5s at 60fps — matches VICTORY_MS below
const VICTORY_MS = 3500;      // returned to the engine (clamped 1200–6000)

const WALL = 26;       // wall thickness (px)

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

// ─── Pixel sprites ────────────────────────────────────────────────────────────

const PX = 5;

const LINK_DOWN = [
  [0,1,1,1,0],
  [0,1,0,1,0],
  [1,1,1,1,1],
  [1,0,1,0,1],
  [0,1,0,1,0],
];
const LINK_SWORD = [
  [0,0,0,0,1],
  [0,0,0,1,0],
  [0,1,1,0,0],
  [1,1,0,0,0],
  [0,1,0,0,0],
];

const HEART = [
  [0,1,0,1,0],
  [1,1,1,1,1],
  [1,1,1,1,1],
  [0,1,1,1,0],
  [0,0,1,0,0],
];
const RUPEE = [
  [0,0,1,0,0],
  [0,1,1,1,0],
  [1,1,1,1,1],
  [0,1,1,1,0],
  [0,0,1,0,0],
];

function drawPx(shape, x, y, size, col, flipH = false) {
  ctx.fillStyle = col;
  const w = shape[0].length;
  shape.forEach((row, r) => row.forEach((c, cc) => {
    if (c) ctx.fillRect(x + (flipH ? w - 1 - cc : cc) * size, y + r * size, size, size);
  }));
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function drawFloor() {
  // Ambient fill — the dungeon floor covers the whole canvas (continues behind
  // the panels). Brightened well above the old near-black so the room reads.
  ctx.fillStyle = '#1c3a12';
  ctx.fillRect(0, 0, W, H);

  // Checkerboard stone-tile texture across the whole floor.
  const tile = 48;
  for (let ty = 0; ty * tile < H; ty++) {
    for (let tx = 0; tx * tile < W; tx++) {
      const alt = (tx + ty) % 2 === 0;
      ctx.fillStyle = alt ? '#22461a' : '#1a3410';
      ctx.fillRect(tx * tile, ty * tile, tile - 2, tile - 2);
      // occasional cracked-stone accent
      if ((tx * 7 + ty * 13) % 11 === 0) {
        ctx.strokeStyle = '#2e5622';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx * tile + 6, ty * tile + 6);
        ctx.lineTo(tx * tile + tile - 10, ty * tile + tile - 10);
        ctx.stroke();
      }
    }
  }
}

function drawWalls() {
  // Stone-block wall border framing the entire screen edge.
  const stone = '#3a5a26';
  const mortar = '#223c16';
  const lit = '#4c7030';

  const strips = [
    { x: 0, y: 0, w: W, h: WALL, horiz: true },              // top
    { x: 0, y: H - WALL, w: W, h: WALL, horiz: true },       // bottom
    { x: 0, y: 0, w: WALL, h: H, horiz: false },             // left
    { x: W - WALL, y: 0, w: WALL, h: H, horiz: false },      // right
  ];
  strips.forEach(s => {
    ctx.fillStyle = stone;
    ctx.fillRect(s.x, s.y, s.w, s.h);
    // brick mortar lines
    ctx.fillStyle = mortar;
    if (s.horiz) {
      for (let bx = s.x; bx < s.x + s.w; bx += 34) ctx.fillRect(bx, s.y, 2, s.h);
      ctx.fillRect(s.x, s.y + s.h / 2 - 1, s.w, 2);
    } else {
      for (let by = s.y; by < s.y + s.h; by += 28) ctx.fillRect(s.x, by, s.w, 2);
      ctx.fillRect(s.x + s.w / 2 - 1, s.y, 2, s.h);
    }
    // inner-edge highlight
    ctx.fillStyle = lit;
    if (s.horiz) ctx.fillRect(s.x, s.y === 0 ? s.h - 3 : s.y, s.w, 3);
    else ctx.fillRect(s.x === 0 ? s.w - 3 : s.x, s.y, 3, s.h);
  });
}

function drawDoors() {
  // Three locked doors: left wall center, right wall center, top wall center.
  // Each unlocks as the player progresses (one door per ROOMS_TO_CLEAR chunk).
  const t = Math.min(progress / STEPS_TO_WIN, 1);
  const unlocked = Math.floor(t * ROOMS_TO_CLEAR);   // 0..3

  const doorLong = 90;   // door span along the wall
  const doors = [
    { side: 'left',  cx: 0,       cy: H * 0.5 },
    { side: 'right', cx: W - WALL, cy: H * 0.5 },
    { side: 'top',   cx: W * 0.5, cy: 0 },
  ];

  doors.forEach((d, i) => {
    const isOpen = i < unlocked;
    if (d.side === 'top') {
      const x = d.cx - doorLong / 2;
      drawDoorPanel(x, 0, doorLong, WALL, isOpen, true);
    } else {
      const y = d.cy - doorLong / 2;
      const x = d.side === 'left' ? 0 : W - WALL;
      drawDoorPanel(x, y, WALL, doorLong, isOpen, false);
    }
  });
}

function drawDoorPanel(x, y, w, h, isOpen, horiz) {
  if (isOpen) {
    // Open doorway — dark passage with a warm gold rim (just unlocked glow).
    ctx.fillStyle = '#0a1406';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = `rgba(232,208,64,${0.35 + doorPulse * 0.4})`;
    ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    ctx.fillStyle = '#0a1406';
    ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
  } else {
    // Locked door — carved stone with a bright brass lock.
    ctx.fillStyle = '#5a4a24';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#3e3218';
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    // Lock keyhole, centered
    const lx = x + w / 2, ly = y + h / 2;
    ctx.fillStyle = '#e8d040';
    ctx.fillRect(lx - 5, ly - 6, 10, 12);
    ctx.fillStyle = '#8a6a10';
    ctx.fillRect(lx - 2, ly - 2, 4, 6);
  }
}

function drawCornerTorches() {
  // Four corner torches with animated flames — just inside the wall corners.
  const inset = WALL + 18;
  const spots = [
    { x: inset, y: inset, phase: 0 },
    { x: W - inset, y: inset, phase: 1.4 },
    { x: inset, y: H - inset, phase: 2.6 },
    { x: W - inset, y: H - inset, phase: 3.8 },
  ];
  spots.forEach(t => {
    const flicker = Math.sin(frame * 0.15 + t.phase) * 0.3 + Math.sin(frame * 0.37 + t.phase) * 0.15;
    // Light pool on floor
    const r = 70 + flicker * 12;
    const grad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, r);
    grad.addColorStop(0, `rgba(255,160,50,${0.28 + flicker * 0.5})`);
    grad.addColorStop(1, 'rgba(255,110,20,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(t.x - r, t.y - r, r * 2, r * 2);
    // Sconce + flame
    const flameH = 16 + flicker * 6;
    ctx.fillStyle = '#3a2408';
    ctx.fillRect(t.x - 4, t.y - 2, 8, 10);
    ctx.fillStyle = 'rgba(255,140,0,0.95)';
    ctx.fillRect(t.x - 4, t.y - 2 - flameH, 8, flameH);
    ctx.fillStyle = 'rgba(255,225,70,0.95)';
    ctx.fillRect(t.x - 2, t.y - 2 - flameH * 0.6, 4, flameH * 0.6);
  });
}

function drawLink() {
  // Link stands guard in the LEFT stage margin, with a gentle idle bob and a
  // sword-swing flash on keystroke.
  const lx = W * 0.10;
  const ly = H * 0.42 + Math.sin(frame * 0.08) * 4;

  if (stepFlash > 0) {
    ctx.shadowColor = '#e8d040'; ctx.shadowBlur = 16;
    drawPx(LINK_SWORD, Math.round(lx) + 6 * PX, Math.round(ly) - PX, PX, '#eee');
  }
  drawPx(LINK_DOWN, Math.round(lx) - 2 * PX, Math.round(ly), PX, '#00cc55');
  // Hair/face cap
  ctx.fillStyle = '#e8c850';
  ctx.fillRect(Math.round(lx) - 2 * PX, Math.round(ly), 5 * PX, PX);
  ctx.shadowBlur = 0;
}

function drawCollectibles() {
  // Collectible hearts + rupees in the RIGHT stage margin — a small trove that
  // fills in as the player types (visual reward, never a counter of failure).
  const t = Math.min(progress / STEPS_TO_WIN, 1);
  const collected = Math.floor(t * 6);
  const baseX = W * 0.90;

  // Rupees (green/blue gems) in a vertical column
  const items = [
    { spr: RUPEE, col: '#40dd80', y: 0.30 },
    { spr: RUPEE, col: '#4090ff', y: 0.40 },
    { spr: HEART, col: '#e83030', y: 0.52 },
    { spr: RUPEE, col: '#40dd80', y: 0.62 },
    { spr: HEART, col: '#e83030', y: 0.72 },
    { spr: RUPEE, col: '#e8d040', y: 0.82 },
  ];
  items.forEach((it, i) => {
    const bob = Math.sin(frame * 0.06 + i) * 3;
    const alpha = i < collected ? 1 : 0.25;
    ctx.globalAlpha = alpha;
    if (i < collected) { ctx.shadowColor = it.col; ctx.shadowBlur = 8; }
    drawPx(it.spr, baseX, H * it.y + bob, PX, it.col);
    ctx.shadowBlur = 0;
  });
  ctx.globalAlpha = 1;
}

function drawTriforce(cx, cy, size, glowScale = 1) {
  const glow = Math.sin(frame * 0.05) * 0.3 + 0.7;
  ctx.fillStyle = `rgba(232,208,64,${glow * glowScale})`;
  const h = size * 0.866;
  ctx.beginPath();
  ctx.moveTo(cx - size * 1.05, cy + h * 0.5);
  ctx.lineTo(cx - size * 0.05, cy - h * 0.5);
  ctx.lineTo(cx - size * 2.05, cy - h * 0.5);
  ctx.closePath();
  ctx.moveTo(cx + size * 0.05, cy + h * 0.5);
  ctx.lineTo(cx + size * 2.05, cy - h * 0.5);
  ctx.lineTo(cx - size * 0.95, cy - h * 0.5);
  ctx.closePath();
  ctx.moveTo(cx, cy - h * 0.5);
  ctx.lineTo(cx + size, cy + h * 0.5);
  ctx.lineTo(cx - size, cy + h * 0.5);
  ctx.closePath();
  ctx.fill();
}

function drawGapTriforce() {
  // A gold Triforce shimmer sits in the gap band between the prompt and the
  // keyboard guide (~0.46H), full-width-centered — always visible, growing
  // brighter as the level nears completion.
  const t = Math.min(progress / STEPS_TO_WIN, 1);
  const cx = W / 2, cy = H * 0.46;
  triforceGlow = 0.4 + t * 0.6;
  ctx.shadowColor = '#e8d040';
  ctx.shadowBlur = 16 + t * 20;
  drawTriforce(cx, cy, 16 + t * 6, triforceGlow);
  ctx.shadowBlur = 0;
}

function drawSparkles() {
  sparkles = sparkles.filter(s => s.life > 0);
  sparkles.forEach(s => {
    s.x += s.vx; s.y += s.vy; s.vy += 0.15; s.life--;
    ctx.globalAlpha = Math.max(s.life / 16, 0);
    ctx.fillStyle = s.col;
    ctx.fillRect(s.x - 3, s.y - 3, 6, 6);
  });
  ctx.globalAlpha = 1;
}

function drawScore() {
  ctx.fillStyle = '#e8d040';
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
  ctx.textAlign = 'left';
  // Below the top-left level badge, clear of the reserved HUD corner.
  ctx.fillText('-LINK-', 24, H * 0.12);
  ctx.fillText(String(score).padStart(6, '0'), 24, H * 0.12 + 16);
  ctx.shadowBlur = 0;
}

// The dungeon "puzzle solved" fanfare: every door swings open in a gold
// cascade, Link raises the earned Triforce overhead (the iconic 1986 item-get
// pose), the gap Triforce blooms and rises to screen center, and a sparkle
// wash blooms outward. All motion is driven by the bounded victoryFrame
// counter (0..VICTORY_FRAMES) so every frame differs and nothing runs away.
function drawVictory() {
  const p = Math.min(victoryFrame / VICTORY_FRAMES, 1);   // 0..1 eased below

  // Every door is unlocked and glowing (override the progress-gated draw).
  const doorLong = 90;
  const doors = [
    { side: 'left',  x: 0,        y: H * 0.5 - doorLong / 2 },
    { side: 'right', x: W - WALL, y: H * 0.5 - doorLong / 2 },
    { side: 'top',   x: W * 0.5 - doorLong / 2, y: 0 },
  ];
  doors.forEach(d => {
    if (d.side === 'top') drawDoorPanel(d.x, 0, doorLong, WALL, true, true);
    else drawDoorPanel(d.x, d.y, WALL, doorLong, true, false);
  });

  // Link raises the earned Triforce overhead — item-get pose, left margin.
  const lx = W * 0.10;
  const raise = Math.min(p * 3, 1);                       // arms up in first third
  const ly = H * 0.42 - raise * 22;
  // little celebratory hop after the raise completes
  const hop = p > 0.4 ? -Math.abs(Math.sin((p - 0.4) * 10)) * 8 : 0;
  const linkY = ly + hop;
  drawPx(LINK_DOWN, Math.round(lx) - 2 * PX, Math.round(linkY), PX, '#00cc55');
  ctx.fillStyle = '#e8c850';
  ctx.fillRect(Math.round(lx) - 2 * PX, Math.round(linkY), 5 * PX, PX);
  // held-overhead item (small Triforce) floating just above his head
  const itemGlow = 0.6 + Math.sin(frame * 0.3) * 0.4;
  ctx.shadowColor = '#e8d040'; ctx.shadowBlur = 12 + raise * 12;
  drawTriforce(lx + 0.5 * PX, linkY - PX * 3.2, 8 * raise + 4, itemGlow);
  ctx.shadowBlur = 0;

  // The gap Triforce blooms and rises to screen center as the finale peaks.
  const ease = p * p * (3 - 2 * p);                       // smoothstep
  const cy = H * 0.46 - ease * (H * 0.46 - H * 0.30);     // rises to ~0.30H
  const size = 20 + ease * 44;                            // 20..64
  const bloom = 24 + ease * 46 + Math.sin(frame * 0.25) * 6;
  ctx.shadowColor = '#e8d040';
  ctx.shadowBlur = Math.max(bloom, 0);
  drawTriforce(W / 2, cy, size, 1);
  ctx.shadowBlur = 0;

  // Golden radial wash behind the risen Triforce.
  const washR = ease * Math.hypot(W, H) * 0.42;
  if (washR > 1) {
    const g = ctx.createRadialGradient(W / 2, cy, 0, W / 2, cy, washR);
    g.addColorStop(0, `rgba(232,208,64,${0.20 * (1 - p * 0.4)})`);
    g.addColorStop(0.6, 'rgba(232,208,64,0.06)');
    g.addColorStop(1, 'rgba(232,208,64,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
}

function render() {
  if (!active) return;
  frame++;
  ctx.clearRect(0, 0, W, H);

  drawFloor();
  drawCornerTorches();
  drawWalls();

  if (victoryMode) {
    if (victoryFrame < VICTORY_FRAMES) victoryFrame++;
    drawVictory();
    drawCollectibles();   // full trove, all lit (progress is complete)
    drawSparkles();
    drawScore();
  } else {
    drawDoors();
    drawGapTriforce();
    drawLink();
    drawCollectibles();
    drawSparkles();
    drawScore();
  }

  if (stepFlash > 0) stepFlash--;
  if (doorPulse > 0) doorPulse -= 0.04;
  animId = requestAnimationFrame(render);
}

// ─── API ──────────────────────────────────────────────────────────────────────

export function start() {
  getCanvas();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  W = canvas.width; H = canvas.height;
  active = true; victoryMode = false; frame = 0;
  progress = 0; score = 0; stepFlash = 0; triforceGlow = 0;
  sparkles = []; doorPulse = 0; victoryFrame = 0;
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  sparkles = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  const prevUnlocked = Math.floor((progress / STEPS_TO_WIN) * ROOMS_TO_CLEAR);
  progress++;
  score += 50;
  stepFlash = 8;

  // A door just unlocked → gold pulse.
  const nowUnlocked = Math.floor((progress / STEPS_TO_WIN) * ROOMS_TO_CLEAR);
  if (nowUnlocked > prevUnlocked) doorPulse = 1;

  // Rupee/heart burst in the right margin (where collectibles live).
  const bx = W * 0.90 + PX * 2, by = H * 0.55;
  for (let i = 0; i < 5; i++) {
    sparkles.push({
      x: bx, y: by,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3 - 1.5,
      life: 16,
      col: Math.random() < 0.5 ? '#e8d040' : '#40dd80',
    });
  }
}

export function miss() {}

export function patternComplete() {
  return progress >= STEPS_TO_WIN;
}

export function victory() {
  victoryMode = true;
  victoryFrame = 0;
  doorPulse = 1;              // all doors flash gold as they swing open
  sparkles = [];

  // A bounded gold/green sparkle bloom rising from the gap-band Triforce —
  // the dungeon's "puzzle solved" shimmer. Fixed cap, no per-frame alloc.
  const cx = W / 2, cy = H * 0.46;
  const N = 40;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const spd = 2 + Math.random() * 2.5;
    sparkles.push({
      x: cx, y: cy,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd - 2,   // drift upward
      life: 40 + Math.floor(Math.random() * 30),
      col: Math.random() < 0.6 ? '#e8d040' : '#40dd80',
    });
  }
  return VICTORY_MS;
}

window.addEventListener('resize', () => {
  if (active) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    W = canvas.width; H = canvas.height;
  }
});
