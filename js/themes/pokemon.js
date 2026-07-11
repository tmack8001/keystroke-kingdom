// Level 15: Pokémon Red/Blue (Game Freak / Nintendo, 1996)

let canvas, ctx;
let frame = 0, animId = null, active = false, victoryMode = false;
let hitsDealt = 0;
let enemyFlashTimer = 0;
let enemyFlyOffX = 0, enemyFlyOffY = 0, enemyFlyTimer = -1;
let textLines = [];
let textTimer = 0;
let messageQueue = [];
let currentMsg = '';
let displayedHpPct = 1;   // animated/interpolated HP fraction, chases the real value
let screenFlash = 0;      // frames of dramatic white battle-flash on hit
let shakeTimer = 0;       // frames of camera shake on hit
let impactStars = [];     // small burst of impact stars at contact point on hit

const HITS_TO_WIN = 25;

// Cycling battle messages on each hit (pairs, cycling through)
const HIT_MESSAGES = [
  ['You used TACKLE!', "It's super effective!"],
  ['You used TACKLE!', 'PIKACHU used GROWL!'],
  ['You used TACKLE!', "It doesn't affect you..."],
  ['You used SCRATCH!', "It's super effective!"],
];
let hitMsgIdx = 0;

// GB-style palette
const COL_BG_LIGHT = '#f0e8c8';
const COL_BG_MID   = '#b0a878';
const COL_BORDER   = '#281800';
const COL_HP_GREEN = '#00b800';
const COL_HP_YEL   = '#b8b800';
const COL_HP_RED   = '#b80000';
const COL_TEXT     = '#281800';

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function resize() {
  const c = getCanvas();
  c.width = window.innerWidth; c.height = window.innerHeight;
}

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function drawPx(shape, x, y, size, col) {
  ctx.fillStyle = col;
  shape.forEach((row, r) => row.forEach((c, cc) => {
    if (c) ctx.fillRect(x + cc * size, y + r * size, size, size);
  }));
}

function drawRect(x, y, w, h, fill, stroke, strokeW = 3) {
  if (stroke) {
    ctx.fillStyle = stroke;
    ctx.fillRect(x - strokeW, y - strokeW, w + strokeW * 2, h + strokeW * 2);
  }
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

// ─── Pikachu sprite 10x9 pixels ───────────────────────────────────────────────
const PIKACHU = [
  [0,0,1,1,0,0,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,0],
  [1,1,2,1,1,1,1,2,1,1],
  [1,1,1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,0,0],
  [0,0,0,3,1,1,3,0,0,0],
  [0,0,3,3,0,0,3,3,0,0],
  [0,3,3,0,0,0,0,3,3,0],
  // lightning tail below
];
// tail separate
const TAIL = [
  [0,0,0,0,3,3],
  [0,0,0,3,3,0],
  [0,0,3,3,0,0],
  [0,3,3,0,0,0],
];
// Colors: 1=yellow, 2=black(eye), 3=orange(cheeks/tail)
const PIK_COLS = { 1: '#f8d020', 2: '#101010', 3: '#e04000' };

function drawPikachu(x, y, px, flashWhite, alpha = 1) {
  ctx.globalAlpha = alpha;
  const colFn = (v) => flashWhite ? '#ffffff' : (PIK_COLS[v] || COL_BG_LIGHT);
  PIKACHU.forEach((row, r) => row.forEach((c, cc) => {
    if (c) {
      ctx.fillStyle = colFn(c);
      ctx.fillRect(x + cc * px, y + r * px, px, px);
    }
  }));
  // tail positioned to the right, offset down
  const tailX = x + 10 * px + px;
  const tailY = y + 4 * px;
  TAIL.forEach((row, r) => row.forEach((c, cc) => {
    if (c) {
      ctx.fillStyle = flashWhite ? '#ffffff' : PIK_COLS[c];
      ctx.fillRect(tailX + cc * px, tailY + r * px, px, px);
    }
  }));
  ctx.globalAlpha = 1;
}

// Player's Pokémon — simple dark silhouette blob (from behind)
const PLAYER_MON = [
  [0,0,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,0,0],
  [0,1,0,0,0,0,1,0],
  [1,1,0,0,0,0,1,1],
];

function drawBackground() {
  const W = canvas.width, H = canvas.height;
  // Top 70%: battle field gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H * 0.72);
  grad.addColorStop(0, '#e8e0c0');
  grad.addColorStop(1, '#c8b880');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H * 0.72);

  // Ground lines — upper platform (enemy side, top-right)
  const enemyPlatY = Math.floor(H * 0.28);
  ctx.fillStyle = COL_BG_MID;
  ctx.fillRect(Math.floor(W * 0.52), enemyPlatY, Math.floor(W * 0.42), 8);
  ctx.fillStyle = COL_BORDER;
  ctx.fillRect(Math.floor(W * 0.52), enemyPlatY - 2, Math.floor(W * 0.42), 3);

  // Ground lines — lower platform (player side, bottom-left)
  const playerPlatY = Math.floor(H * 0.56);
  ctx.fillStyle = COL_BG_MID;
  ctx.fillRect(Math.floor(W * 0.05), playerPlatY, Math.floor(W * 0.42), 8);
  ctx.fillStyle = COL_BORDER;
  ctx.fillRect(Math.floor(W * 0.05), playerPlatY - 2, Math.floor(W * 0.42), 3);
}

function drawEnemyHPBar() {
  const W = canvas.width, H = canvas.height;
  const boxX = Math.floor(W * 0.52);
  const boxY = Math.floor(H * 0.05);
  const boxW = Math.floor(W * 0.36);
  const boxH = 44;

  drawRect(boxX, boxY, boxW, boxH, COL_BG_LIGHT, COL_BORDER, 3);

  ctx.fillStyle = COL_TEXT;
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('PIKACHU', boxX + 8, boxY + 16);

  // Lv badge
  ctx.fillStyle = COL_TEXT;
  ctx.fillText('Lv25', boxX + boxW - 44, boxY + 16);

  // HP label
  ctx.fillStyle = COL_TEXT;
  ctx.fillText('HP', boxX + 8, boxY + 34);

  // HP bar — displayedHpPct animates/drains smoothly toward the real value for drama
  const barX = boxX + 28, barY = boxY + 26, barW = boxW - 40, barH = 7;
  const targetPct = Math.max(0, 1 - hitsDealt / HITS_TO_WIN);
  if (displayedHpPct > targetPct) {
    displayedHpPct = Math.max(targetPct, displayedHpPct - 0.02);
  }
  ctx.fillStyle = COL_BORDER;
  ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
  ctx.fillStyle = '#383818';
  ctx.fillRect(barX, barY, barW, barH);
  if (displayedHpPct > 0) {
    const barCol = displayedHpPct > 0.5 ? COL_HP_GREEN : displayedHpPct > 0.25 ? COL_HP_YEL : COL_HP_RED;
    ctx.fillStyle = barCol;
    ctx.fillRect(barX, barY, Math.ceil(barW * displayedHpPct), barH);
    // Bright top-edge highlight on the fill — the one flourish the GB screen didn't have room for
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(barX, barY, Math.ceil(barW * displayedHpPct), 2);
  }
  // Draining segment flashes white briefly right at the edge of the drop
  if (displayedHpPct > targetPct + 0.001) {
    ctx.fillStyle = frame % 6 < 3 ? '#ffffff' : '#000000';
    ctx.fillRect(barX + Math.ceil(barW * targetPct), barY, Math.max(1, Math.ceil(barW * (displayedHpPct - targetPct))), barH);
  }
}

function drawImpactStars() {
  impactStars = impactStars.filter(s => s.age < s.life);
  impactStars.forEach(s => {
    s.age++;
    const t = s.age / s.life;
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = s.col;
    const d = 3 + t * 10;
    ctx.fillRect(s.x + s.vx * s.age - d / 2, s.y + s.vy * s.age - d / 2, d, d);
  });
  ctx.globalAlpha = 1;
}

function spawnImpactStars(x, y) {
  const cols = [COL_TEXT, '#f8d020', COL_BG_LIGHT];
  for (let i = 0; i < 10; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 1.5 + Math.random() * 3;
    impactStars.push({
      x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      col: cols[i % cols.length], age: 0, life: 14 + Math.random() * 8 | 0,
    });
  }
}

// Dramatic battle-flash — the "spike" moment levels.md calls for against the humble overworld tone
function drawScreenFlash() {
  if (screenFlash <= 0) return;
  const t = screenFlash / 8;
  ctx.fillStyle = `rgba(255,255,255,${t * 0.55})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawEnemyPokemon() {
  const W = canvas.width, H = canvas.height;
  const px = Math.floor(Math.min(W, H) / 38);
  const pikW = (10 + 6 + 1) * px; // approx with tail
  const pikH = 9 * px;
  const baseX = Math.floor(W * 0.62) - pikW / 2;
  const baseY = Math.floor(H * 0.17);

  if (enemyFlyTimer > 0) {
    // fly off — arc upward and off screen
    const t = 1 - enemyFlyTimer / 40;
    const flyX = baseX + enemyFlyOffX * t * W * 0.4;
    const flyY = baseY + enemyFlyOffY - Math.sin(t * Math.PI) * H * 0.2;
    const alpha = Math.max(0, 1 - t * 1.2);
    drawPikachu(flyX, flyY, px, false, alpha);
    enemyFlyTimer--;
  } else if (enemyFlyTimer === 0) {
    // done flying — don't draw
  } else {
    const flash = enemyFlashTimer > 0 && (frame % 4 < 2);
    drawPikachu(baseX, baseY, px, flash);
    if (enemyFlashTimer > 0) enemyFlashTimer--;
  }
}

function drawPlayerPokemon() {
  const W = canvas.width, H = canvas.height;
  const px = Math.floor(Math.min(W, H) / 30);
  const monX = Math.floor(W * 0.13);
  const monY = Math.floor(H * 0.40);
  drawPx(PLAYER_MON, monX, monY, px, '#202820');
}

function drawTextBox() {
  const W = canvas.width, H = canvas.height;
  const boxH = Math.floor(H * 0.18);
  const boxY = Math.floor(H * 0.80);
  const boxX = Math.floor(W * 0.02);
  const boxW = W - Math.floor(W * 0.04);

  drawRect(boxX, boxY, boxW, boxH, COL_BG_LIGHT, COL_BORDER, 4);

  ctx.fillStyle = COL_TEXT;
  ctx.font = '11px "Press Start 2P", monospace';
  ctx.textAlign = 'left';

  textLines.forEach((line, i) => {
    ctx.fillText(line, boxX + 14, boxY + 22 + i * 22);
  });
}

function setTextLines(lines) {
  textLines = lines.slice(0, 3);
}

function queueMessage(lines) {
  messageQueue.push(lines);
}

function flushNextMessage() {
  if (messageQueue.length > 0) {
    setTextLines(messageQueue.shift());
  }
}

// ─── Loop ─────────────────────────────────────────────────────────────────────

function render() {
  if (!active) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Camera shake — brief, punchy, on hit only (the dramatic spike)
  ctx.save();
  if (shakeTimer > 0) {
    const mag = shakeTimer > 4 ? 5 : 2;
    ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    shakeTimer--;
  }

  drawBackground();
  drawEnemyHPBar();
  drawEnemyPokemon();
  drawPlayerPokemon();
  drawImpactStars();
  drawTextBox();
  ctx.restore();

  drawScreenFlash();
  if (screenFlash > 0) screenFlash--;

  // Auto-advance message queue every ~80 frames
  if (textTimer > 0) {
    textTimer--;
  } else if (messageQueue.length > 0) {
    flushNextMessage();
    textTimer = 80;
  }

  frame++;
  animId = requestAnimationFrame(render);
}

// ─── API ──────────────────────────────────────────────────────────────────────

export function start() {
  getCanvas(); resize();
  active = true; victoryMode = false;
  hitsDealt = 0; frame = 0;
  enemyFlashTimer = 0; enemyFlyTimer = -1;
  enemyFlyOffX = 0; enemyFlyOffY = 0;
  hitMsgIdx = 0;
  messageQueue = [];
  displayedHpPct = 1; screenFlash = 0; shakeTimer = 0; impactStars = [];
  setTextLines(['Wild PIKACHU appeared!']);
  textTimer = 80;
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  messageQueue = []; impactStars = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  hitsDealt++;
  enemyFlashTimer = 12;
  screenFlash = 8;
  shakeTimer = 8;
  const W = canvas.width, H = canvas.height;
  spawnImpactStars(W * 0.62, H * 0.22);
  const msgs = HIT_MESSAGES[hitMsgIdx % HIT_MESSAGES.length];
  hitMsgIdx++;
  queueMessage([msgs[0]]);
  queueMessage([msgs[1]]);
}

export function miss() {
  if (!active || victoryMode) return;
  queueMessage(['But it missed!']);
}

export function patternComplete() {
  return hitsDealt >= HITS_TO_WIN;
}

export function victory() {
  if (victoryMode) return;
  victoryMode = true;
  // Fly off upward-right
  enemyFlyOffX = 1;
  enemyFlyOffY = 0;
  enemyFlyTimer = 40;
  queueMessage(['PIKACHU fainted!']);
  queueMessage(['You won 80 EXP. Points!']);
  textTimer = 0;
}

window.addEventListener('resize', () => { if (active) resize(); });
