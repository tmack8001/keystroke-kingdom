// Level 15: Pokémon Red/Blue (Game Freak / Nintendo, 1996)
//
// Classic Game Boy battle screen mapped to the UI stage. The centre belongs to
// the typing UI, so the battle is composed into the frame around it:
//   • enemy Pokémon + its HP box  → TOP-LEFT (top band + left margin, clear of
//     the LEVEL badge and the top-right HUD stats)
//   • player's Pokémon (back view) + its HP box → RIGHT margin, lower half
//   • battle textbox → bottom strip, BELOW the keyboard guide, full width
//   • tall grass → the remaining left/right margin
// Everything is positioned in canvas fractions of W/H so it holds at any size.

let canvas, ctx;
let frame = 0, animId = null, active = false, victoryMode = false;
let hitsDealt = 0;
let enemyFlashTimer = 0;
let enemyFlyTimer = -1;
let textLines = [];
let textTimer = 0;
let messageQueue = [];
let displayedHpPct = 1;   // enemy HP fraction, animates toward the real value
let playerHpPct = 1;      // player HP, drifts slowly (never reaches 0 — no punishment)
let screenFlash = 0;      // frames of dramatic battle-flash on hit
let shakeTimer = 0;       // frames of camera shake on hit
let impactStars = [];     // small burst of impact stars at contact point on hit
let grassSway = 0;

const HITS_TO_WIN = 25;

// Cycling battle messages on each hit (pairs, cycling through)
const HIT_MESSAGES = [
  ['You used TACKLE!', "It's super effective!"],
  ['You used TACKLE!', 'PIKACHU used GROWL!'],
  ['You used QUICK ATTACK!', 'A critical hit!'],
  ['You used SCRATCH!', "It's super effective!"],
];
let hitMsgIdx = 0;

// GB-style palette (4-shade dot-matrix feel + warm reds/yellows)
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

// ─── Sprites ──────────────────────────────────────────────────────────────────

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

// Classic double-border box (GB battle UI): outer black frame, inner light fill,
// thin inner outline — the recognisable Pokémon text/HP window.
function drawGbBox(x, y, w, h) {
  ctx.fillStyle = COL_BORDER;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = COL_BG_LIGHT;
  ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
  ctx.strokeStyle = COL_BORDER;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
}

// Front-facing Pikachu (10x9) + tail (drawn to the LEFT so it stays in margin).
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
];
const PIK_COLS = { 1: '#f8d020', 2: '#101010', 3: '#e04000' };

function drawPikachu(x, y, px, flashWhite, alpha = 1) {
  ctx.globalAlpha = alpha;
  const colFn = (v) => flashWhite ? '#ffffff' : (PIK_COLS[v] || COL_BG_LIGHT);
  PIKACHU.forEach((row, r) => row.forEach((c, cc) => {
    if (c) { ctx.fillStyle = colFn(c); ctx.fillRect(x + cc * px, y + r * px, px, px); }
  }));
  // Lightning-bolt tail, angled up to the RIGHT but kept short so it stays inside
  // the left margin / top band (never crosses into the reserved centre).
  ctx.fillStyle = flashWhite ? '#ffffff' : PIK_COLS[3];
  const tx = x + 10 * px, ty = y + 5 * px;
  const bolt = [[0,0],[1,0],[1,-1],[2,-1],[2,-2],[1,-2],[1,-1]];
  bolt.forEach(([dx, dy]) => ctx.fillRect(tx + dx * px, ty + dy * px, px, px));
  ctx.globalAlpha = 1;
}

// Player's Pokémon seen from BEHIND — rounded back silhouette, GB green shades.
const PLAYER_MON = [
  [0,0,0,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1,1,0],
  [0,1,1,0,0,0,0,1,1,0],
  [1,1,0,0,0,0,0,0,1,1],
];

// ─── Background ─────────────────────────────────────────────────────────────

function drawBackground() {
  const W = canvas.width, H = canvas.height;
  // Battle field wash — GB dot-matrix cream, up to the textbox strip.
  const grad = ctx.createLinearGradient(0, 0, 0, H * 0.81);
  grad.addColorStop(0, '#e8e0c0');
  grad.addColorStop(1, '#cabf88');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H * 0.81);

  // Enemy platform — an oval in the TOP-LEFT stage, under the enemy Pokémon.
  drawPlatform(W * 0.09, H * 0.30, W * 0.16, H * 0.032);
  // Player platform — an oval in the RIGHT margin lower half, under player mon.
  drawPlatform(W * 0.89, H * 0.68, W * 0.15, H * 0.034);
}

function drawPlatform(cx, cy, rx, ry) {
  ctx.fillStyle = COL_BG_MID;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = COL_BORDER; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
}

// Tall grass tufts filling leftover margin (left margin lower + right margin).
function drawGrass() {
  const W = canvas.width, H = canvas.height;
  const sway = Math.sin(grassSway) * 2;
  ctx.fillStyle = '#3a5a28';
  const tuft = (bx, by, s) => {
    for (let i = -2; i <= 2; i++) {
      const h = s * (2.4 + (i % 2 ? 0.5 : 0));
      const lean = sway * (0.4 + Math.abs(i) * 0.3);
      ctx.beginPath();
      ctx.moveTo(bx + i * s, by);
      ctx.lineTo(bx + i * s + lean, by - h);
      ctx.lineTo(bx + i * s + s * 0.6, by);
      ctx.closePath(); ctx.fill();
    }
  };
  // left margin, below enemy platform
  for (let gx = 0.02; gx < 0.2; gx += 0.055) tuft(W * gx, H * 0.46, 7);
  // right margin, below player platform
  for (let gx = 0.80; gx < 1.0; gx += 0.055) tuft(W * gx, H * 0.80, 7);
}

// ─── HP boxes ─────────────────────────────────────────────────────────────────

function hpBarColor(pct) {
  return pct > 0.5 ? COL_HP_GREEN : pct > 0.25 ? COL_HP_YEL : COL_HP_RED;
}

// Enemy HP box — TOP-LEFT, starting clear of the LEVEL badge (badge ≈ 0.11W).
function drawEnemyHPBar() {
  const W = canvas.width, H = canvas.height;
  const boxX = Math.floor(W * 0.125);
  const boxY = Math.floor(H * 0.04);
  const boxW = Math.floor(W * 0.26);
  const boxH = 52;

  drawGbBox(boxX, boxY, boxW, boxH);

  ctx.fillStyle = COL_TEXT;
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('PIKACHU', boxX + 12, boxY + 20);
  ctx.textAlign = 'right';
  ctx.fillText('Lv25', boxX + boxW - 12, boxY + 20);

  ctx.textAlign = 'left';
  ctx.fillText('HP', boxX + 12, boxY + 40);

  const barX = boxX + 40, barY = boxY + 32, barW = boxW - 54, barH = 8;
  const targetPct = Math.max(0, 1 - hitsDealt / HITS_TO_WIN);
  if (displayedHpPct > targetPct) displayedHpPct = Math.max(targetPct, displayedHpPct - 0.02);

  ctx.fillStyle = COL_BORDER; ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
  ctx.fillStyle = '#383818'; ctx.fillRect(barX, barY, barW, barH);
  if (displayedHpPct > 0) {
    ctx.fillStyle = hpBarColor(displayedHpPct);
    ctx.fillRect(barX, barY, Math.ceil(barW * displayedHpPct), barH);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(barX, barY, Math.ceil(barW * displayedHpPct), 2);
  }
  if (displayedHpPct > targetPct + 0.001) {
    ctx.fillStyle = frame % 6 < 3 ? '#ffffff' : '#000000';
    ctx.fillRect(barX + Math.ceil(barW * targetPct), barY, Math.max(1, Math.ceil(barW * (displayedHpPct - targetPct))), barH);
  }
}

// Player HP box — RIGHT margin, just above the player Pokémon.
function drawPlayerHPBar() {
  const W = canvas.width, H = canvas.height;
  const boxW = Math.floor(W * 0.185);
  const boxH = 52;
  const boxX = Math.floor(W - boxW - W * 0.015);
  const boxY = Math.floor(H * 0.50);

  drawGbBox(boxX, boxY, boxW, boxH);

  ctx.fillStyle = COL_TEXT;
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('YOU', boxX + 12, boxY + 20);
  ctx.textAlign = 'right';
  ctx.fillText('Lv30', boxX + boxW - 12, boxY + 20);

  ctx.textAlign = 'left';
  ctx.fillText('HP', boxX + 12, boxY + 40);

  const barX = boxX + 40, barY = boxY + 32, barW = boxW - 54, barH = 8;
  // Player HP drifts down slightly with the fight but floors at 60% — the fight
  // is never lost (no punishment): it's flavour, not a fail state.
  const targetPct = Math.max(0.6, 1 - (hitsDealt / HITS_TO_WIN) * 0.4);
  if (playerHpPct > targetPct) playerHpPct = Math.max(targetPct, playerHpPct - 0.008);

  ctx.fillStyle = COL_BORDER; ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
  ctx.fillStyle = '#383818'; ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = hpBarColor(playerHpPct);
  ctx.fillRect(barX, barY, Math.ceil(barW * playerHpPct), barH);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(barX, barY, Math.ceil(barW * playerHpPct), 2);
}

// ─── Pokémon ────────────────────────────────────────────────────────────────

function drawEnemyPokemon() {
  const W = canvas.width, H = canvas.height;
  const px = Math.max(3, Math.floor(Math.min(W, H) / 46));
  const baseX = Math.floor(W * 0.11) - (10 * px) / 2;
  const baseY = Math.floor(H * 0.15);

  if (enemyFlyTimer > 0) {
    const t = 1 - enemyFlyTimer / 40;
    // fly off up-and-LEFT, out through the left margin (away from the centre)
    const flyX = baseX - t * W * 0.25;
    const flyY = baseY - Math.sin(t * Math.PI) * H * 0.15;
    drawPikachu(flyX, flyY, px, false, Math.max(0, 1 - t * 1.2));
    enemyFlyTimer--;
  } else if (enemyFlyTimer !== 0) {
    const flash = enemyFlashTimer > 0 && (frame % 4 < 2);
    // small recoil bob to the left on hit
    const recoil = enemyFlashTimer > 0 ? -Math.sin(frame) * 3 : 0;
    drawPikachu(baseX + recoil, baseY, px, flash);
    if (enemyFlashTimer > 0) enemyFlashTimer--;
  }
}

function drawPlayerPokemon() {
  const W = canvas.width, H = canvas.height;
  const px = Math.max(4, Math.floor(Math.min(W, H) / 34));
  const monX = Math.floor(W * 0.895) - (10 * px) / 2;
  const monY = Math.floor(H * 0.61);
  // back silhouette, two green shades for a touch of form
  drawPx(PLAYER_MON, monX, monY, px, '#2c4a24');
  ctx.globalAlpha = 0.5;
  drawPx(PLAYER_MON.slice(0, 4), monX, monY, px, '#3e6432');
  ctx.globalAlpha = 1;
}

// ─── Effects ──────────────────────────────────────────────────────────────────

function drawImpactStars() {
  impactStars = impactStars.filter(s => s.age < s.life);
  impactStars.forEach(s => {
    s.age++;
    const t = s.age / s.life;
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = s.col;
    const d = 3 + t * 9;
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

// Battle-flash — the "spike" moment, but kept OUT of the reserved centre so it
// never washes out the letter prompt: a vignette flash from the enemy corner.
function drawScreenFlash() {
  if (screenFlash <= 0) return;
  const W = canvas.width, H = canvas.height;
  const t = screenFlash / 8;
  const g = ctx.createRadialGradient(W * 0.11, H * 0.20, 0, W * 0.11, H * 0.20, Math.max(W, H) * 0.7);
  g.addColorStop(0, `rgba(255,255,255,${t * 0.5})`);
  g.addColorStop(0.35, `rgba(255,255,255,${t * 0.18})`);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// ─── Textbox ──────────────────────────────────────────────────────────────────

// Battle textbox — bottom strip, BELOW the keyboard guide (keyboard ends ≈0.81H).
function drawTextBox() {
  const W = canvas.width, H = canvas.height;
  const boxY = Math.floor(H * 0.83);
  const boxH = H - boxY - Math.floor(H * 0.02);
  const boxX = Math.floor(W * 0.02);
  const boxW = W - Math.floor(W * 0.04);

  drawGbBox(boxX, boxY, boxW, boxH);

  ctx.fillStyle = COL_TEXT;
  ctx.font = '11px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  const lh = Math.min(22, (boxH - 24) / 2);
  textLines.forEach((line, i) => {
    ctx.fillText(line, boxX + 18, boxY + 26 + i * lh);
  });
  // Blinking advance arrow (classic ▼)
  if (frame % 40 < 22) {
    ctx.fillStyle = COL_TEXT;
    const ax = boxX + boxW - 24, ay = boxY + boxH - 20;
    ctx.beginPath();
    ctx.moveTo(ax, ay); ctx.lineTo(ax + 12, ay); ctx.lineTo(ax + 6, ay + 7);
    ctx.closePath(); ctx.fill();
  }
}

function setTextLines(lines) { textLines = lines.slice(0, 2); }
function queueMessage(lines) { messageQueue.push(lines); }
function flushNextMessage() { if (messageQueue.length) setTextLines(messageQueue.shift()); }

// ─── Loop ─────────────────────────────────────────────────────────────────────

function render() {
  if (!active) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  if (shakeTimer > 0) {
    const mag = shakeTimer > 4 ? 5 : 2;
    ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    shakeTimer--;
  }

  drawBackground();
  drawGrass();
  drawEnemyHPBar();
  drawEnemyPokemon();
  drawPlayerHPBar();
  drawPlayerPokemon();
  drawImpactStars();
  drawTextBox();
  ctx.restore();

  drawScreenFlash();
  if (screenFlash > 0) screenFlash--;

  grassSway += 0.03;

  if (textTimer > 0) textTimer--;
  else if (messageQueue.length > 0) { flushNextMessage(); textTimer = 80; }

  frame++;
  animId = requestAnimationFrame(render);
}

// ─── API ──────────────────────────────────────────────────────────────────────

export function start() {
  getCanvas(); resize();
  active = true; victoryMode = false;
  hitsDealt = 0; frame = 0;
  enemyFlashTimer = 0; enemyFlyTimer = -1;
  hitMsgIdx = 0;
  messageQueue = [];
  displayedHpPct = 1; playerHpPct = 1;
  screenFlash = 0; shakeTimer = 0; impactStars = []; grassSway = 0;
  setTextLines(['Wild PIKACHU appeared!']);
  textTimer = 100;
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
  spawnImpactStars(W * 0.11, H * 0.20);
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
  enemyFlyTimer = 40;
  queueMessage(['PIKACHU fainted!']);
  queueMessage(['You won 80 EXP. Points!']);
  textTimer = 0;
}

window.addEventListener('resize', () => { if (active) resize(); });
