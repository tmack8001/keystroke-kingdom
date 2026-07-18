// Level 12: Street Fighter II (Capcom, 1991) — Ryu's temple stage
//
// Signature mechanic (research/wiki/games/street-fighter-ii.md +
// arcade-cabinets-by-era.md): "One-on-one fighting. Drain opponent's health bar
// or have more health when time expires." So the scene must FIGHT continuously:
//   - both fighters hold breathing/bouncing idle stances (iconic idle bob)
//   - each correct keystroke = the player attacks (punch/kick), the opponent
//     hit-flashes + recoils, and the opponent health bar visibly ticks down
//   - the opponent swings back ambiently but harmlessly — the player blocks/sways
//     (block spark). The player health bar NEVER depletes (the One Rule).
//   - every few hits = a bigger special-move flourish (a stylized hadouken-style
//     projectile flash — era-authentic energy).
// Round progress mirrors level progress; the bout arcs toward the player's win.
// L20: opponent's ambient swings are cosmetic and fine unattended, but health-bar
// depletion and round advancement only move on real keystrokes.

import { getWinRatio } from '../settings.js';

let canvas, ctx;
let frame = 0, animId = null, active = false;
let hitsLanded = 0;
let HITS_TO_WIN = 20;

// short-lived action timers (frames) — clamped, never sentinel (F1)
let opponentFlashTimer = 0;   // opponent hit-flash + recoil
let playerAttackTimer = 0;    // player punch/kick pose hold
let playerBlockTimer = 0;     // player block/sway (answers opponent swing)
let playerMissTimer = 0;      // gentle wobble on a miss — never punishing
let opponentSwingTimer = 0;   // opponent's harmless ambient swing wind-up
let opponentSwingCooldown = 90;
let attackIsKick = false;     // alternate punch / kick per hit
let lastKeystrokeFrame = -999;

// bounded pools
const MAX_SPARKS = 120;
let sparks = [];
let projectiles = [];         // special-move energy balls (bounded, tiny)

let crowd = [];

// victory (celebration owns the window — theme-authoring "Victory must celebrate")
let victoryMode = false;
let victoryStartMs = 0;
const VICTORY_MS = 3200;
let opponentFallTimer = -1, playerRaisedTimer = -1;

const PX = 8; // pixel scale — large SNES-scale fighters (levels.md: "enormous detailed character sprites")

// ─── Sprites — 10 cols x 14 rows. 1=gi/body, 2=skin, 3=headband/belt, 4=hair, 5=highlight ──
const FIGHTER_STAND = [
  [0,0,0,4,4,4,0,0,0,0],
  [0,0,2,2,2,2,2,0,0,0],
  [0,0,2,2,2,2,2,0,0,0],
  [0,0,0,2,2,2,0,0,0,0],
  [0,1,1,1,1,1,1,1,0,0],
  [1,1,1,1,1,1,1,1,1,0],
  [1,1,5,1,1,1,5,1,1,0],
  [0,1,1,1,1,1,1,1,0,0],
  [0,0,2,1,1,1,2,0,0,0],
  [0,0,3,1,1,1,3,0,0,0],
  [0,0,1,1,0,1,1,0,0,0],
  [0,1,1,0,0,0,1,1,0,0],
  [0,2,1,0,0,0,1,2,0,0],
  [0,2,2,0,0,0,2,2,0,0],
];
// Guard/idle-crouch stance — knees bent a touch, fists up (the fighting bob's low frame)
const FIGHTER_GUARD = [
  [0,0,0,4,4,4,0,0,0,0],
  [0,0,2,2,2,2,2,0,0,0],
  [0,0,2,2,2,2,2,0,0,0],
  [0,0,0,2,2,2,0,0,0,0],
  [0,2,1,1,1,1,1,2,0,0],
  [2,2,1,1,1,1,1,2,2,0],
  [0,1,5,1,1,1,5,1,0,0],
  [0,1,1,1,1,1,1,1,0,0],
  [0,0,2,1,1,1,2,0,0,0],
  [0,0,3,1,1,1,3,0,0,0],
  [0,1,1,1,0,1,1,1,0,0],
  [1,1,0,0,0,0,0,1,1,0],
  [2,1,0,0,0,0,0,1,2,0],
  [2,2,0,0,0,0,0,2,2,0],
];
const FIGHTER_PUNCH = [
  [0,0,0,4,4,4,0,0,0,0],
  [0,0,2,2,2,2,2,0,0,0],
  [0,0,2,2,2,2,2,0,0,0],
  [0,0,0,2,2,2,0,0,0,0],
  [0,1,1,1,1,1,1,1,0,0],
  [2,2,2,2,1,1,1,1,1,0],
  [1,1,1,1,5,1,5,1,1,0],
  [0,1,1,1,1,1,1,1,0,0],
  [0,0,2,1,1,1,2,0,0,0],
  [0,0,3,1,1,1,3,0,0,0],
  [0,0,1,1,0,1,1,0,0,0],
  [0,1,1,0,0,0,1,1,0,0],
  [0,2,1,0,0,0,1,2,0,0],
  [0,2,2,0,0,0,2,2,0,0],
];
// High kick — leg extends forward (toward opponent, i.e. sprite's right)
const FIGHTER_KICK = [
  [0,0,0,4,4,4,0,0,0,0],
  [0,0,2,2,2,2,2,0,0,0],
  [0,0,2,2,2,2,2,0,0,0],
  [0,0,0,2,2,2,0,0,0,0],
  [0,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,0],
  [0,1,5,1,1,1,5,1,1,0],
  [0,1,1,1,1,1,1,1,0,0],
  [0,0,2,1,1,1,2,0,0,0],
  [0,0,3,1,1,1,1,1,1,1],
  [0,1,1,1,2,2,2,2,2,2],
  [0,1,1,0,0,0,0,0,0,0],
  [0,2,1,0,0,0,0,0,0,0],
  [0,2,2,0,0,0,0,0,0,0],
];
// Special-move fireball throw — both hands thrust forward (hadouken pose)
const FIGHTER_SPECIAL = [
  [0,0,0,4,4,4,0,0,0,0],
  [0,0,2,2,2,2,2,0,0,0],
  [0,0,2,2,2,2,2,0,0,0],
  [0,0,0,2,2,2,0,0,0,0],
  [0,1,1,1,1,1,1,1,0,0],
  [1,1,1,1,1,1,2,2,2,2],
  [1,1,5,1,1,1,2,2,2,2],
  [0,1,1,1,1,1,1,1,0,0],
  [0,0,2,1,1,1,2,0,0,0],
  [0,0,3,1,1,1,3,0,0,0],
  [0,0,1,1,0,1,1,0,0,0],
  [0,1,1,0,0,0,1,1,0,0],
  [0,2,1,0,0,0,1,2,0,0],
  [0,2,2,0,0,0,2,2,0,0],
];
const FIGHTER_FALL = [
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,4,4,4,0,0,0],
  [0,0,0,2,2,2,2,2,0,0],
  [0,0,0,0,2,2,2,0,0,0],
  [0,0,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,5,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,0,0],
  [0,2,1,1,0,1,1,2,0,0],
  [0,0,3,3,0,3,3,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
];
const FIGHTER_RAISE = [
  [0,2,0,4,4,4,0,2,0,0],
  [0,0,2,2,2,2,2,0,0,0],
  [2,0,2,2,2,2,2,0,2,0],
  [0,0,0,2,2,2,0,0,0,0],
  [1,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,0,0],
  [0,1,5,1,1,1,5,1,0,0],
  [0,1,1,1,1,1,1,1,0,0],
  [0,0,2,1,1,1,2,0,0,0],
  [0,0,3,1,1,1,3,0,0,0],
  [0,0,1,1,0,1,1,0,0,0],
  [0,1,1,0,0,0,1,1,0,0],
  [0,2,1,0,0,0,1,2,0,0],
  [0,2,2,0,0,0,2,2,0,0],
];
const P1_COLS = { 1: '#2255d8', 2: '#e8b088', 3: '#d81818', 4: '#3a2010', 5: '#6fa0ff' };
const P2_COLS = { 1: '#d83030', 2: '#e0a878', 3: '#e8c000', 4: '#1a1a1a', 5: '#ff8080' };

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function resize() {
  const c = getCanvas();
  c.width = window.innerWidth; c.height = window.innerHeight;
  crowd = [];
  const n = Math.floor(c.width / 18);
  for (let i = 0; i < n; i++) {
    crowd.push({
      x: i * 18 + Math.random() * 8,
      h: 10 + Math.random() * 14,
      w: 8 + Math.random() * 6,
      wave: Math.random() * Math.PI * 2,
      col: ['#cc2200','#ee8800','#2255cc','#884488'][Math.floor(Math.random()*4)],
    });
  }
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function drawPx(shape, x, y, size, colOrMap, flip = false) {
  const isMap = typeof colOrMap === 'object';
  const cols = shape[0].length;
  shape.forEach((row, r) => row.forEach((c, cc) => {
    if (!c) return;
    ctx.fillStyle = isMap ? (colOrMap[c] || '#000') : colOrMap;
    ctx.fillRect(x + (flip ? cols - 1 - cc : cc) * size, y + r * size, size, size);
  }));
}

function drawBackground() {
  const W = canvas.width, H = canvas.height;
  const groundY = Math.floor(H * 0.88);

  const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY * 0.55);
  skyGrad.addColorStop(0, '#0a1f80');
  skyGrad.addColorStop(0.5, '#2755b8');
  skyGrad.addColorStop(1, '#5c8de8');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, groundY * 0.55);

  ctx.fillStyle = 'rgba(60,90,160,0.5)';
  const mts = [ [0.05,60,110], [0.20,90,150], [0.40,70,90], [0.60,100,140], [0.80,75,100], [0.95,55,80] ];
  mts.forEach(([fx, w, h]) => {
    const mx = fx * W;
    ctx.beginPath();
    ctx.moveTo(mx - w / 2, groundY * 0.55);
    ctx.lineTo(mx, groundY * 0.55 - h);
    ctx.lineTo(mx + w / 2, groundY * 0.55);
    ctx.closePath();
    ctx.fill();
  });

  const wallGrad = ctx.createLinearGradient(0, groundY * 0.55, 0, groundY);
  wallGrad.addColorStop(0, '#a02a15');
  wallGrad.addColorStop(0.5, '#7c1c0c');
  wallGrad.addColorStop(1, '#4c0e04');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, groundY * 0.55, W, groundY - groundY * 0.55);

  ctx.fillStyle = '#550e00';
  const brickH = 12, brickW = 40;
  const wallTop = Math.floor(groundY * 0.55);
  const wallBot = groundY;
  for (let row = 0; wallTop + row * brickH < wallBot; row++) {
    const offset = (row % 2) * (brickW / 2);
    for (let col = -1; col * brickW < W + brickW; col++) {
      const bx = col * brickW + offset;
      const by = wallTop + row * brickH;
      ctx.fillRect(bx, by, brickW - 2, 1);
      ctx.fillRect(bx, by, 1, brickH - 2);
    }
  }

  const archW = Math.floor(W * 0.12);
  const archH = Math.floor((groundY - wallTop) * 0.7);
  const archY = wallTop + Math.floor((groundY - wallTop) * 0.15);
  ctx.fillStyle = '#330800';
  ctx.fillRect(Math.floor(W * 0.03), archY, archW, archH);
  ctx.beginPath();
  ctx.arc(Math.floor(W * 0.03) + archW / 2, archY, archW / 2, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(Math.floor(W * 0.85), archY, archW, archH);
  ctx.beginPath();
  ctx.arc(Math.floor(W * 0.85) + archW / 2, archY, archW / 2, Math.PI, 0);
  ctx.fill();

  [W * 0.12, W * 0.76].forEach((bx, i) => {
    const sway = Math.sin(frame * 0.03 + i * 2) * 4;
    const by = wallTop + 6, bw = 22, bh = 60;
    const bannerGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
    bannerGrad.addColorStop(0, '#c81818');
    bannerGrad.addColorStop(1, '#7c0808');
    ctx.fillStyle = bannerGrad;
    ctx.beginPath();
    ctx.moveTo(bx - bw / 2 + sway * 0.3, by);
    ctx.lineTo(bx + bw / 2 + sway * 0.3, by);
    ctx.lineTo(bx + bw / 2 + sway, by + bh);
    ctx.lineTo(bx + sway, by + bh - 8);
    ctx.lineTo(bx - bw / 2 + sway, by + bh);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e8c000';
    ctx.fillRect(bx - bw / 2 + sway * 0.3, by, bw, 4);
  });

  const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
  groundGrad.addColorStop(0, '#e0b878');
  groundGrad.addColorStop(0.3, '#c8a060');
  groundGrad.addColorStop(1, '#8c703c');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundY, W, H - groundY);
  ctx.fillStyle = '#f0d0a0';
  ctx.fillRect(0, groundY, W, 4);
  ctx.fillStyle = 'rgba(100,70,30,0.35)';
  const tileW = 50;
  for (let tx = 0; tx < W + tileW; tx += tileW) {
    ctx.fillRect(tx, groundY + 4, 2, H - groundY - 4);
  }

  const crowdY = Math.floor(H * 0.87);
  crowd.forEach(p => {
    p.wave += 0.04;
    const bob = Math.sin(p.wave) * 2;
    const armsUp = Math.sin(p.wave * 0.5) > 0.85;
    ctx.fillStyle = p.col;
    ctx.fillRect(p.x, crowdY - p.h + bob, p.w, p.h);
    if (armsUp) {
      ctx.fillRect(p.x - 3, crowdY - p.h + bob - 6, 3, 8);
      ctx.fillRect(p.x + p.w, crowdY - p.h + bob - 6, 3, 8);
    }
    ctx.fillStyle = '#f0c080';
    ctx.fillRect(p.x + p.w * 0.2, crowdY - p.h - 6 + bob, p.w * 0.6, 7);
  });
}

function drawHealthBars() {
  const W = canvas.width;
  const barW = Math.floor(W * 0.28);
  const barH = 14;
  const barY = Math.floor(canvas.height * 0.04);
  const margin = Math.floor(W * 0.07);

  // Round label — "FIGHT!" during the bout, "ROUND WON!" once the opponent is out
  ctx.fillStyle = '#ffdd00';
  ctx.font = '13px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = '#ff4400';
  ctx.shadowBlur = 8;
  ctx.fillText(hitsLanded >= HITS_TO_WIN ? 'ROUND WON!' : 'FIGHT!', W / 2, barY + barH - 2);
  ctx.shadowBlur = 0;

  // Player bar (left) — ALWAYS full (the One Rule: the player is never damaged)
  ctx.fillStyle = '#333';
  ctx.fillRect(margin, barY, barW, barH);
  ctx.fillStyle = '#00cc44';
  ctx.fillRect(margin, barY, barW, barH);
  ctx.fillStyle = '#00ff66';
  ctx.fillRect(margin, barY, barW, 4);

  // Opponent bar (right) — depletes with hits landed
  const pct = Math.max(0, 1 - hitsLanded / HITS_TO_WIN);
  const rightX = W - margin - barW;
  ctx.fillStyle = '#333';
  ctx.fillRect(rightX, barY, barW, barH);
  if (pct > 0) {
    // recent-hit flash makes the depletion pop for a beat
    const hitGlow = opponentFlashTimer > 0;
    ctx.fillStyle = hitGlow ? '#ffffff' : (pct > 0.4 ? '#00cc44' : pct > 0.2 ? '#ccaa00' : '#cc2200');
    ctx.fillRect(rightX, barY, Math.floor(barW * pct), barH);
    ctx.fillStyle = '#00ff66';
    ctx.fillRect(rightX, barY, Math.floor(barW * pct), 4);
  }

  ctx.fillStyle = '#ffffff';
  [margin, rightX].forEach(bx => {
    ctx.fillRect(bx - 2, barY - 2, barW + 4, 2);
    ctx.fillRect(bx - 2, barY + barH, barW + 4, 2);
    ctx.fillRect(bx - 2, barY - 2, 2, barH + 4);
    ctx.fillRect(bx + barW, barY - 2, 2, barH + 4);
  });
}

function drawFighters() {
  const W = canvas.width, H = canvas.height;
  const groundY = Math.floor(H * 0.88);
  const spriteH = 14 * PX, spriteW = 10 * PX;

  // ── Idle bob: both fighters breathe/bounce continuously (iconic idle animation)
  // Two-frame stance switch + a gentle vertical bob, out of phase between fighters.
  const bobP = Math.round(Math.sin(frame * 0.12) * 3);
  const bobO = Math.round(Math.sin(frame * 0.12 + Math.PI) * 3);
  const stanceP = Math.floor(frame / 18) % 2 === 0 ? FIGHTER_STAND : FIGHTER_GUARD;
  const stanceO = Math.floor(frame / 21) % 2 === 0 ? FIGHTER_GUARD : FIGHTER_STAND;

  // ── PLAYER (left side) ──────────────────────────────────────────────────────
  const playerBaseX = Math.floor(W * 0.05);
  const playerY = groundY - spriteH;

  const playerAttack = playerAttackTimer > 0;
  const playerBlock = playerBlockTimer > 0;
  const playerRaise = playerRaisedTimer > 0;
  const playerMiss = playerMissTimer > 0;

  // lunge forward while attacking (toward opponent = +x)
  let playerX = playerBaseX;
  let pBob = bobP;
  if (playerAttack) { playerX += Math.round(spriteW * 0.18 * (playerAttackTimer / 14)); pBob = 0; }
  else if (playerBlock) { playerX -= Math.round(spriteW * 0.10); pBob = 0; } // sway back from opponent swing

  let playerSprite;
  if (playerRaise) playerSprite = FIGHTER_RAISE;
  else if (playerAttack) playerSprite = attackIsKick ? FIGHTER_KICK : (playerAttackTimer > 8 ? FIGHTER_SPECIAL : FIGHTER_PUNCH);
  else if (playerBlock) playerSprite = FIGHTER_GUARD;
  else playerSprite = stanceP;

  // ── OPPONENT (right side, mirrored) ─────────────────────────────────────────
  const oppBaseX = Math.floor(W * 0.93) - spriteW;
  const oppFall = opponentFallTimer > 0;
  const oppFlash = opponentFlashTimer > 0;
  const oppSwing = opponentSwingTimer > 0;

  let oppX = oppBaseX;
  let oBob = bobO;
  if (oppFlash && !oppFall) { oppX += Math.round(spriteW * 0.12); oBob = 0; } // recoil away from player
  else if (oppSwing) { oppX -= Math.round(spriteW * 0.14); oBob = 0; }        // lunge toward player (harmless)

  let oppSprite;
  if (oppFall) oppSprite = FIGHTER_FALL;
  else if (oppSwing) oppSprite = FIGHTER_PUNCH;
  else oppSprite = stanceO;

  // Ground contact shadows (drawn first, under the fighters)
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(playerBaseX + spriteW / 2, groundY + 3, spriteW * 0.4, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(oppBaseX + spriteW / 2, groundY + 3, spriteW * 0.4, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw player
  if (playerMiss) ctx.globalAlpha = 0.6 + Math.sin(frame * 0.8) * 0.4;
  drawPx(playerSprite, playerX, playerY + pBob, PX, P1_COLS);
  ctx.globalAlpha = 1;

  // Draw opponent
  const oppY = playerY + (oppFall ? spriteH * 0.3 : 0) + oBob;
  if (oppFlash) {
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 18;
    drawPx(oppSprite, oppX, oppY, PX, '#ffffff', true); // whited-out silhouette on the hit beat
    ctx.shadowBlur = 0;
  } else {
    drawPx(oppSprite, oppX, oppY, PX, P2_COLS, true);
  }
}

function drawProjectiles() {
  const W = canvas.width;
  projectiles = projectiles.filter(p => p.x < W * 0.95 && p.life > 0);
  projectiles.forEach(p => {
    p.x += p.vx;
    p.life--;
    const r = p.r + Math.sin(frame * 0.5) * 2;
    // energy ball — cyan/white hadouken-style glow
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, '#8fe8ff');
    grad.addColorStop(1, 'rgba(40,140,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    // trailing sparkle
    ctx.fillStyle = 'rgba(180,240,255,0.5)';
    ctx.fillRect(p.x - r * 1.6, p.y - 2, r * 0.9, 4);
  });
}

function drawSparks() {
  sparks = sparks.filter(s => s.age < s.life);
  sparks.forEach(s => {
    const t = s.age / s.life;
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = s.col;
    const sz = s.size * (1 - t * 0.5);
    ctx.fillRect(s.x + s.vx * s.age - sz / 2, s.y + s.vy * s.age - sz / 2, sz, sz);
    s.age++;
  });
  ctx.globalAlpha = 1;
}

function spawnSparks(x, y, palette) {
  const cols = palette || ['#ffff00', '#ff8800', '#ffffff', '#ff4400'];
  const room = MAX_SPARKS - sparks.length;
  const n = Math.min(20, Math.max(0, room));
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 2 + Math.random() * 4;
    sparks.push({
      x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      size: 5 + Math.random() * 8,
      col: cols[Math.floor(Math.random() * cols.length)],
      age: 0, life: 16 + Math.random() * 10 | 0,
    });
  }
}

function drawVictoryText() {
  if (!victoryMode) return;
  const W = canvas.width, H = canvas.height;
  const prog = Math.min(1, (performance.now() - victoryStartMs) / 400);
  ctx.save();
  ctx.globalAlpha = prog;
  // slam-in scale for the K.O. — arcade win-screen energy
  const scale = 1 + (1 - prog) * 1.5;
  ctx.fillStyle = '#ffdd00';
  ctx.font = `${Math.round(40 * scale)}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 24;
  ctx.fillText('K.O.!', W / 2, H * 0.40);
  ctx.shadowBlur = 0;
  ctx.font = '14px "Press Start 2P", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = Math.min(1, Math.max(0, (performance.now() - victoryStartMs - 500) / 400));
  ctx.fillText('YOU WIN!', W / 2, H * 0.40 + 46);
  ctx.restore();
}

// ─── Loop ─────────────────────────────────────────────────────────────────────

function tickOpponentAmbient() {
  // Opponent throws a harmless swing on a cooldown — but ONLY when the player is
  // actively fighting (recent keystroke), per L20 engagement gating. When it
  // lands its wind-up, the player blocks and a block-spark pops. No player damage.
  if (victoryMode) return;
  if (opponentSwingCooldown > 0) { opponentSwingCooldown--; return; }
  const recentlyEngaged = playerAttackTimer > 0 || (frame - lastKeystrokeFrame) < 240;
  if (!recentlyEngaged) return;
  opponentSwingTimer = 16;
  opponentSwingCooldown = 120 + Math.floor(Math.random() * 90);
}

function render() {
  if (!active) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawHealthBars();
  drawProjectiles();
  drawFighters();
  drawSparks();
  drawVictoryText();

  tickOpponentAmbient();

  // The opponent's swing "connects" with the player mid-animation → player blocks
  if (opponentSwingTimer === 8 && !victoryMode) {
    playerBlockTimer = 12;
    const W = canvas.width, H = canvas.height;
    const groundY = H * 0.88;
    // block spark just in front of the player (defensive flash — never damage)
    spawnSparks(W * 0.20, groundY - 14 * PX * 0.5, ['#88ccff', '#ffffff', '#4499ff']);
  }

  if (opponentFlashTimer > 0) opponentFlashTimer--;
  if (playerAttackTimer > 0) playerAttackTimer--;
  if (playerBlockTimer > 0) playerBlockTimer--;
  if (playerMissTimer > 0) playerMissTimer--;
  if (opponentSwingTimer > 0) opponentSwingTimer--;
  if (opponentFallTimer > 0) opponentFallTimer--;
  if (playerRaisedTimer > 0) playerRaisedTimer--;
  frame++;
  animId = requestAnimationFrame(render);
}

// ─── API ──────────────────────────────────────────────────────────────────────

export function start() {
  getCanvas(); resize();
  active = true; victoryMode = false;
  HITS_TO_WIN = Math.max(8, Math.ceil(20 * getWinRatio()));
  hitsLanded = 0; frame = 0;
  opponentFlashTimer = 0; playerAttackTimer = 0; playerBlockTimer = 0; playerMissTimer = 0;
  opponentSwingTimer = 0; opponentSwingCooldown = 90;
  opponentFallTimer = -1; playerRaisedTimer = -1;
  lastKeystrokeFrame = -999;
  attackIsKick = false;
  sparks = []; projectiles = [];
  victoryStartMs = 0;
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  sparks = []; projectiles = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  if (hitsLanded < HITS_TO_WIN) hitsLanded++;
  lastKeystrokeFrame = frame;

  // The player attacks; opponent hit-flashes + recoils; health bar ticks down.
  attackIsKick = !attackIsKick;      // alternate punch / kick
  playerAttackTimer = 14;
  opponentFlashTimer = 12;

  const W = canvas.width, H = canvas.height;
  const groundY = H * 0.88;
  const spriteW = 10 * PX;
  const impactX = W * 0.93 - spriteW * 0.7;         // at the opponent's body
  const impactY = groundY - 14 * PX * 0.55;
  spawnSparks(impactX, impactY);

  // Every 4th hit = a bigger SPECIAL MOVE flourish: a fireball flies at the opponent.
  if (hitsLanded % 4 === 0 && hitsLanded < HITS_TO_WIN) {
    playerAttackTimer = 16;                          // holds long enough to show SPECIAL pose
    if (projectiles.length < 4) {
      projectiles.push({
        x: W * 0.05 + spriteW,
        y: groundY - 14 * PX * 0.55,
        vx: W * 0.020, r: 16, life: 90,
      });
    }
  }
}

export function miss() {
  if (!active || victoryMode) return;
  playerMissTimer = 18; // gentle wobble only — mistakes cost nothing (One Rule)
}

export function patternComplete() {
  return hitsLanded >= HITS_TO_WIN;
}

export function victory() {
  victoryMode = true;
  victoryStartMs = performance.now();
  hitsLanded = HITS_TO_WIN;      // opponent bar fully empty
  opponentFallTimer = 300;       // finite hold, never a raw sentinel (F1)
  playerRaisedTimer = 300;
  opponentSwingTimer = 0;
  playerAttackTimer = 0;
  // celebration: victory sparks bursting up around the winning fighter
  const W = canvas.width, H = canvas.height;
  const groundY = H * 0.88;
  spawnSparks(W * 0.10, groundY - 14 * PX * 0.6, ['#ffdd00', '#ffffff', '#ff8800']);
  return VICTORY_MS;
}

window.addEventListener('resize', () => { if (active) resize(); });
