// Level 7: Dragon's Lair (Cinematronics, 1983)
// Dirk advances through torch-lit dungeon chambers toward Daphne.

let canvas, ctx;
let animId = null, active = false, victoryMode = false;
let frame = 0;

let progress = 0;
const STEPS_TO_WIN = 28;
const ROOMS_TO_CLEAR = 4;

let torches = [];
let score = 0;
let stepFlash = 0;
let swordSwing = 0;   // frames remaining in the sword-swing arc
let motes = [];        // ambient dust particles drifting in torchlight
let W = 0, H = 0;

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function buildTorches() {
  torches = [
    { x: Math.floor(W * 0.18), y: Math.floor(H * 0.42), phase: 0 },
    { x: Math.floor(W * 0.18), y: Math.floor(H * 0.62), phase: 1.2 },
    { x: Math.floor(W * 0.82), y: Math.floor(H * 0.42), phase: 0.6 },
    { x: Math.floor(W * 0.82), y: Math.floor(H * 0.62), phase: 1.8 },
  ];
}

// Ambient dust motes drifting through the torchlight — a cheap parallax/depth
// cue that sells the room as a lit volume rather than a flat backdrop.
function buildMotes() {
  motes = [];
  for (let i = 0; i < 22; i++) {
    motes.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vy: -0.15 - Math.random() * 0.25,
      drift: Math.random() * Math.PI * 2,
      size: Math.random() < 0.5 ? 1 : 2,
    });
  }
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function drawBackground() {
  // Stone walls — dark purple-brown
  ctx.fillStyle = '#080006';
  ctx.fillRect(0, 0, W, H);
}

function drawDungeonRoom() {
  const t = Math.min(progress / STEPS_TO_WIN, 1);
  const wallL = Math.floor(W * 0.2);
  const wallR = Math.floor(W * 0.8);
  const wallTop = Math.floor(H * 0.15);
  const wallBot = Math.floor(H * 0.85);

  // Floor
  ctx.fillStyle = '#1a0a10';
  ctx.fillRect(wallL, wallBot - 8, wallR - wallL, H - wallBot + 8);

  // Floor tiles
  ctx.fillStyle = '#200c16';
  const tileW = Math.floor((wallR - wallL) / 8);
  for (let tx = wallL; tx < wallR; tx += tileW) {
    ctx.fillRect(tx, wallBot - 8, 1, H - wallBot + 8);
  }

  // Ceiling
  ctx.fillStyle = '#100008';
  ctx.fillRect(wallL, 0, wallR - wallL, wallTop + 8);

  // Side walls — brick texture
  drawBrickWall(0, 0, wallL, H, '#1a0510');
  drawBrickWall(wallR, 0, W - wallR, H, '#1a0510');

  // Stone corridor walls (lighter border)
  ctx.fillStyle = '#2a1020';
  ctx.fillRect(wallL - 6, wallTop, 6, wallBot - wallTop);
  ctx.fillRect(wallR, wallTop, 6, wallBot - wallTop);
  ctx.fillStyle = '#1a0818';
  ctx.fillRect(wallL - 6, wallTop, 6, 2);
  ctx.fillRect(wallR, wallTop, 6, 2);

  // Archways / doorways — one ahead, one behind
  const archW = Math.floor(W * 0.14);
  const archH = Math.floor(H * 0.4);
  const archTop = wallTop + Math.floor((wallBot - wallTop - archH) / 2);

  // Back doorway (where player came from)
  drawArch(wallL - archW, archTop, archW, archH, '#0a0005', '#cc66ff', 0.4);

  // Forward doorway (where player is going) — a glimpse of the next chamber's
  // torchlight glows deeper inside as progress builds (parallax depth cue).
  const nextRoomAlpha = t;
  drawArch(wallR, archTop, archW, archH, '#0a0005', '#cc66ff', nextRoomAlpha);
  if (nextRoomAlpha > 0.15) {
    const glowX = wallR + archW * 0.6;
    const glowY = archTop + archH * 0.5;
    const pulse = Math.sin(frame * 0.06) * 0.15 + 0.55;
    ctx.fillStyle = `rgba(255,150,40,${nextRoomAlpha * pulse * 0.5})`;
    ctx.beginPath();
    ctx.arc(glowX, glowY, 10 + nextRoomAlpha * 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Room number / depth indicator
  const roomNum = Math.min(Math.floor(t * ROOMS_TO_CLEAR) + 1, ROOMS_TO_CLEAR);
  ctx.fillStyle = 'rgba(204, 102, 255, 0.4)';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`ROOM ${roomNum}/${ROOMS_TO_CLEAR}`, W - 12, 22);
  ctx.textAlign = 'left';
}

function drawBrickWall(x, y, w, h, base) {
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  const bH = 18, bW = 32;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  for (let row = 0; row * bH < h; row++) {
    const offset = (row % 2) * (bW / 2);
    for (let col = -1; col * bW + offset < w + bW; col++) {
      const bx = x + col * bW + offset;
      const by = y + row * bH;
      ctx.fillRect(bx, by, bW - 2, 1);       // horizontal mortar
      ctx.fillRect(bx + bW - 2, by, 2, bH);  // vertical mortar
    }
  }
}

function drawArch(x, y, w, h, bgCol, glowCol, glowAlpha) {
  ctx.fillStyle = bgCol;
  ctx.fillRect(x, y, w, h);

  // Arch outline
  ctx.strokeStyle = `rgba(${glowCol === '#cc66ff' ? '204,102,255' : '255,255,255'},${glowAlpha})`;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);

  if (glowAlpha > 0.1) {
    ctx.fillStyle = `rgba(180,60,240,${glowAlpha * 0.08})`;
    ctx.fillRect(x, y, w, h);
  }
}

function drawTorches() {
  torches.forEach(t => {
    t.phase += 0.08;
    const flicker = Math.sin(t.phase) * 0.3 + Math.sin(t.phase * 2.3) * 0.15;
    const h = 18 + flicker * 8;

    // Sconce bracket
    ctx.fillStyle = '#4a2008';
    ctx.fillRect(t.x - 3, t.y, 6, 10);
    ctx.fillRect(t.x - 4, t.y + 8, 8, 3);

    // Flame layers
    const pulse = (flicker + 0.5);
    ctx.fillStyle = `rgba(255,140,0,0.9)`;
    ctx.fillRect(t.x - 4, t.y - h, 8, h);

    ctx.fillStyle = `rgba(255,220,0,0.85)`;
    ctx.fillRect(t.x - 2, t.y - h * 0.7, 4, h * 0.7);

    ctx.fillStyle = `rgba(255,255,200,0.7)`;
    ctx.fillRect(t.x - 1, t.y - h * 0.4, 2, h * 0.4);

    // Glow halo
    const grad = ctx.createRadialGradient(t.x, t.y - h * 0.4, 0, t.x, t.y - h * 0.4, 40);
    grad.addColorStop(0, `rgba(255,140,0,${0.18 + pulse * 0.08})`);
    grad.addColorStop(1, 'rgba(255,80,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(t.x - 40, t.y - h - 20, 80, 80);
  });
}

function drawDirk() {
  const t = Math.min(progress / STEPS_TO_WIN, 1);
  const wallL = Math.floor(W * 0.2);
  const wallR = Math.floor(W * 0.8);
  const floorY = Math.floor(H * 0.85) - 8;

  // Dirk moves from left side to right side of corridor as progress advances
  const dx = wallL + 20 + (wallR - wallL - 60) * t;
  const dy = floorY;

  // Walking animation
  const walkFrame = Math.floor(frame / 8) % 4;

  if (stepFlash > 0) {
    ctx.shadowColor = '#cc66ff'; ctx.shadowBlur = 16;
  }

  // Body (yellow/gold armor)
  ctx.fillStyle = '#ddaa00';
  ctx.fillRect(dx - 6, dy - 30, 12, 18);

  // Head
  ctx.fillStyle = '#ddaa00';
  ctx.fillRect(dx - 5, dy - 44, 10, 12);
  ctx.fillStyle = '#888';
  ctx.fillRect(dx - 5, dy - 44, 10, 5); // helmet

  // Sword — swings through an arc on keystroke, otherwise rests at idle bob
  const swordLen = 18;
  if (swordSwing > 0) {
    const swingT = 1 - swordSwing / 10; // 0..1 across the swing
    const ang = -0.9 + swingT * 1.8;    // sweeps from raised to forward
    ctx.save();
    ctx.translate(dx + 6, dy - 26);
    ctx.rotate(ang);
    ctx.fillStyle = '#eee';
    ctx.shadowColor = '#cc66ff'; ctx.shadowBlur = 10;
    ctx.fillRect(0, -1, swordLen, 3);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#aa8800';
    ctx.fillRect(-3, -2, 5, 5);
    ctx.restore();
  } else {
    ctx.fillStyle = '#ccc';
    ctx.fillRect(dx + 6, dy - 28 + (walkFrame % 2 === 0 ? 0 : 1), 3, swordLen);
    ctx.fillStyle = '#aa8800';
    ctx.fillRect(dx + 4, dy - 28, 7, 3); // guard
  }

  // Legs
  ctx.fillStyle = '#885500';
  if (walkFrame < 2) {
    ctx.fillRect(dx - 5, dy - 12, 5, 12);
    ctx.fillRect(dx + 1, dy - 12 + 4, 5, 8);
  } else {
    ctx.fillRect(dx - 5, dy - 12 + 4, 5, 8);
    ctx.fillRect(dx + 1, dy - 12, 5, 12);
  }

  ctx.shadowBlur = 0;
}

function drawScore() {
  ctx.fillStyle = '#cc66ff';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(String(score).padStart(6, '0'), 12, 22);
}

function drawMotes() {
  ctx.fillStyle = 'rgba(255, 200, 140, 0.35)';
  motes.forEach(m => {
    m.y += m.vy;
    m.drift += 0.02;
    const dx = Math.sin(m.drift) * 0.3;
    m.x += dx;
    if (m.y < 0) { m.y = H; m.x = Math.random() * W; }
    ctx.fillRect(m.x, m.y, m.size, m.size);
  });
}

function render() {
  if (!active) return;
  frame++;
  ctx.clearRect(0, 0, W, H);

  drawBackground();
  drawDungeonRoom();
  drawMotes();
  drawTorches();
  drawDirk();
  drawScore();

  if (stepFlash > 0) stepFlash--;
  if (swordSwing > 0) swordSwing--;
  animId = requestAnimationFrame(render);
}

// ─── API ──────────────────────────────────────────────────────────────────────

export function start() {
  getCanvas();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  W = canvas.width; H = canvas.height;
  active = true; victoryMode = false; frame = 0; progress = 0; score = 0;
  swordSwing = 0;
  buildTorches();
  buildMotes();
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function keystroke() {
  if (!active || victoryMode) return;
  progress++;
  score += 75;
  stepFlash = 6;
  swordSwing = 10;
}

export function miss() {}

export function patternComplete() {
  return progress >= STEPS_TO_WIN;
}

export function victory() {
  victoryMode = true;
}

window.addEventListener('resize', () => {
  if (active) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    W = canvas.width; H = canvas.height;
    buildTorches();
    buildMotes();
  }
});
