// Level 12: Street Fighter II (Capcom, 1991) — Ryu's stage

let canvas, ctx;
let frame = 0, animId = null, active = false, victoryMode = false;
let hitsLanded = 0;
let opponentFlashTimer = 0, playerPunchTimer = 0, playerMissTimer = 0;
let sparks = [];
let opponentFallTimer = -1, playerRaisedTimer = -1;
let crowd = [];

const HITS_TO_WIN = 20;
const PX = 5; // pixel scale for sprites

// Fighter sprites 6x8 (cols x rows)
const FIGHTER_STAND = [
  [0,1,1,0,0,0],
  [0,1,1,0,0,0],
  [0,0,1,0,0,0],
  [1,1,1,1,0,0],
  [0,0,1,0,0,0],
  [0,1,0,1,0,0],
  [0,1,0,1,0,0],
  [0,1,0,1,0,0],
];
const FIGHTER_PUNCH = [
  [0,1,1,0,0,0],
  [0,0,1,0,0,0],
  [1,1,1,1,1,1],
  [1,1,1,1,0,0],
  [0,0,1,0,0,0],
  [0,1,0,1,0,0],
  [0,1,0,1,0,0],
  [0,1,0,1,0,0],
];
const FIGHTER_FALL = [
  [0,0,0,1,1,0],
  [0,0,1,1,0,0],
  [0,1,1,1,0,0],
  [0,0,0,0,1,1],
  [0,0,0,1,1,0],
  [1,1,1,0,0,0],
  [0,0,0,0,0,0],
  [0,0,0,0,0,0],
];
const FIGHTER_RAISE = [
  [0,1,1,0,0,0],
  [0,1,0,1,0,0],
  [0,0,1,0,0,0],
  [1,1,1,1,0,0],
  [0,0,1,0,0,0],
  [0,1,0,1,0,0],
  [0,1,0,1,0,0],
  [0,1,0,1,0,0],
];

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function resize() {
  const c = getCanvas();
  c.width = window.innerWidth; c.height = window.innerHeight;
  // seed crowd silhouettes along the bottom edge
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

function drawPx(shape, x, y, size, col, flip = false) {
  ctx.fillStyle = col;
  const cols = shape[0].length;
  shape.forEach((row, r) => row.forEach((c, cc) => {
    if (c) ctx.fillRect(x + (flip ? cols - 1 - cc : cc) * size, y + r * size, size, size);
  }));
}

function drawBackground() {
  const W = canvas.width, H = canvas.height;
  const groundY = Math.floor(H * 0.88);

  // Sky — blue gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY * 0.55);
  skyGrad.addColorStop(0, '#1133aa');
  skyGrad.addColorStop(1, '#4477dd');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, groundY * 0.55);

  // Temple wall — red brick lower half
  const wallGrad = ctx.createLinearGradient(0, groundY * 0.55, 0, groundY);
  wallGrad.addColorStop(0, '#882211');
  wallGrad.addColorStop(1, '#661100');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, groundY * 0.55, W, groundY - groundY * 0.55);

  // Brick rows on temple wall
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

  // Temple arches — left 20% and right 20%
  const archW = Math.floor(W * 0.12);
  const archH = Math.floor((groundY - wallTop) * 0.7);
  const archY = wallTop + Math.floor((groundY - wallTop) * 0.15);
  ctx.fillStyle = '#330800';
  // left arch
  ctx.fillRect(Math.floor(W * 0.03), archY, archW, archH);
  ctx.beginPath();
  ctx.arc(Math.floor(W * 0.03) + archW / 2, archY, archW / 2, Math.PI, 0);
  ctx.fill();
  // right arch
  ctx.fillRect(Math.floor(W * 0.85), archY, archW, archH);
  ctx.beginPath();
  ctx.arc(Math.floor(W * 0.85) + archW / 2, archY, archW / 2, Math.PI, 0);
  ctx.fill();

  // Ground
  ctx.fillStyle = '#c8a060';
  ctx.fillRect(0, groundY, W, H - groundY);
  ctx.fillStyle = '#a07840';
  ctx.fillRect(0, groundY, W, 4);

  // Crowd at bottom edge (below 85%)
  const crowdY = Math.floor(H * 0.87);
  crowd.forEach(p => {
    p.wave += 0.04;
    const bob = Math.sin(p.wave) * 2;
    // body
    ctx.fillStyle = p.col;
    ctx.fillRect(p.x, crowdY - p.h + bob, p.w, p.h);
    // head
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

  // "FIGHT!" center label
  ctx.fillStyle = '#ffdd00';
  ctx.font = '13px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#ff4400';
  ctx.shadowBlur = 8;
  ctx.fillText('FIGHT!', W / 2, barY + barH - 2);
  ctx.shadowBlur = 0;

  // Player bar (left) — always full
  ctx.fillStyle = '#333';
  ctx.fillRect(margin, barY, barW, barH);
  ctx.fillStyle = '#00cc44';
  ctx.fillRect(margin, barY, barW, barH);
  ctx.fillStyle = '#00ff66';
  ctx.fillRect(margin, barY, barW, 4);

  // Opponent bar (right) — depletes with hits
  const pct = Math.max(0, 1 - hitsLanded / HITS_TO_WIN);
  const rightX = W - margin - barW;
  ctx.fillStyle = '#333';
  ctx.fillRect(rightX, barY, barW, barH);
  if (pct > 0) {
    ctx.fillStyle = pct > 0.4 ? '#00cc44' : pct > 0.2 ? '#ccaa00' : '#cc2200';
    ctx.fillRect(rightX, barY, Math.floor(barW * pct), barH);
    ctx.fillStyle = '#00ff66';
    ctx.fillRect(rightX, barY, Math.floor(barW * pct), 4);
  }

  // Bar borders
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
  const spriteH = 8 * PX, spriteW = 6 * PX;

  // Player (left side — inside left 20%)
  const playerX = Math.floor(W * 0.08);
  const playerY = groundY - spriteH;
  const playerMiss = playerMissTimer > 0;
  const playerPunch = playerPunchTimer > 0;
  const playerRaise = playerRaisedTimer > 0;
  const playerSprite = playerRaise ? FIGHTER_RAISE : playerPunch ? FIGHTER_PUNCH : FIGHTER_STAND;
  const playerCol = playerMiss ? '#ff4444' : '#4488ff';
  if (playerMiss) {
    ctx.globalAlpha = 0.6 + Math.sin(frame * 0.8) * 0.4;
  }
  drawPx(playerSprite, playerX, playerY, PX, playerCol);
  ctx.globalAlpha = 1;

  // Opponent (right side — inside right 20%), mirrored
  const oppX = Math.floor(W * 0.86);
  const oppY = groundY - spriteH;
  const oppFall = opponentFallTimer > 0;
  const oppSprite = oppFall ? FIGHTER_FALL : FIGHTER_STAND;
  const oppFlash = opponentFlashTimer > 0;
  const oppCol = oppFlash ? '#ffffff' : '#cc2244';
  if (oppFlash) {
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 12;
  }
  drawPx(oppSprite, oppX, oppY + (oppFall ? spriteH * 0.3 : 0), PX, oppCol, true);
  ctx.shadowBlur = 0;
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

function spawnSparks(x, y) {
  const cols = ['#ffff00', '#ff8800', '#ffffff', '#ff4400'];
  for (let i = 0; i < 14; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 1.5 + Math.random() * 3;
    sparks.push({
      x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      size: 4 + Math.random() * 6,
      col: cols[Math.floor(Math.random() * cols.length)],
      age: 0, life: 16 + Math.random() * 10 | 0,
    });
  }
}

function drawVictoryText() {
  if (!victoryMode) return;
  const W = canvas.width, H = canvas.height;
  ctx.save();
  const alpha = Math.min(1, (frame - victoryMode) / 30);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ffdd00';
  ctx.font = '32px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 20;
  ctx.fillText('K.O.!', W / 2, H * 0.42);
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ─── Loop ─────────────────────────────────────────────────────────────────────

function render() {
  if (!active) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawHealthBars();
  drawSparks();
  drawFighters();
  drawVictoryText();

  if (opponentFlashTimer > 0) opponentFlashTimer--;
  if (playerPunchTimer > 0) playerPunchTimer--;
  if (playerMissTimer > 0) playerMissTimer--;
  if (opponentFallTimer > 0) opponentFallTimer--;
  if (playerRaisedTimer > 0) playerRaisedTimer--;
  frame++;
  animId = requestAnimationFrame(render);
}

// ─── API ──────────────────────────────────────────────────────────────────────

export function start() {
  getCanvas(); resize();
  active = true; victoryMode = false;
  hitsLanded = 0; frame = 0;
  opponentFlashTimer = 0; playerPunchTimer = 0; playerMissTimer = 0;
  opponentFallTimer = -1; playerRaisedTimer = -1;
  sparks = [];
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  sparks = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  hitsLanded++;
  opponentFlashTimer = 10;
  playerPunchTimer = 14;

  // Spark at midpoint between fighters
  const W = canvas.width, H = canvas.height;
  const groundY = H * 0.88;
  const sparkX = W * 0.5 + (Math.random() - 0.5) * W * 0.06;
  const sparkY = groundY - 6 * PX * 0.6;
  spawnSparks(sparkX, sparkY);
}

export function miss() {
  if (!active || victoryMode) return;
  playerMissTimer = 18;
}

export function patternComplete() {
  return hitsLanded >= HITS_TO_WIN;
}

export function victory() {
  victoryMode = frame;
  opponentFallTimer = 999;
  playerRaisedTimer = 999;
}

window.addEventListener('resize', () => { if (active) resize(); });
