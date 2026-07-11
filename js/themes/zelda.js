// Level 10: The Legend of Zelda (Nintendo, 1986)
// Link explores top-down dungeon rooms to reach the Triforce.

let canvas, ctx;
let animId = null, active = false, victoryMode = false;
let frame = 0;

let progress = 0;
const STEPS_TO_WIN = 30;
const ROOMS_TO_CLEAR = 3;

let score = 0;
let stepFlash = 0;
let triforceGlow = 0;
let W = 0, H = 0;

// Enemies that wander each room
let enemies = [];
let sparkles = [];   // small flash when keystroke fires

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function spawnEnemies(roomIdx) {
  enemies = [];
  const count = roomIdx + 1;
  for (let i = 0; i < count; i++) {
    enemies.push({
      x: W * (0.35 + i * 0.12 + Math.random() * 0.08),
      y: H * (0.35 + Math.random() * 0.25),
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      frame: i % 2,
      timer: 20 + i * 10,
      alive: true,
    });
  }
}

// ─── Pixel sprites ────────────────────────────────────────────────────────────

const PX = 3;

const LINK_DOWN = [
  [0,1,1,1,0],
  [0,1,0,1,0],
  [1,1,1,1,1],
  [1,0,1,0,1],
  [0,1,0,1,0],
];
const LINK_UP = [
  [0,1,1,1,0],
  [0,1,0,1,0],
  [1,1,1,1,1],
  [1,0,1,0,1],
  [1,1,0,1,1],
];
const LINK_SWORD = [
  [0,0,0,0,1],
  [0,0,0,1,0],
  [0,1,1,0,0],
  [1,1,0,0,0],
  [0,1,0,0,0],
];
const ENEMY_A = [
  [0,1,1,0],
  [1,0,0,1],
  [0,1,1,0],
  [0,1,1,0],
];
const ENEMY_B = [
  [1,0,0,1],
  [0,1,1,0],
  [1,0,0,1],
  [0,1,1,0],
];

function drawPx(shape, x, y, size, col, flipH = false) {
  ctx.fillStyle = col;
  const w = shape[0].length;
  shape.forEach((row, r) => row.forEach((c, cc) => {
    if (c) ctx.fillRect(x + (flipH ? w - 1 - cc : cc) * size, y + r * size, size, size);
  }));
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function drawBackground() {
  ctx.fillStyle = '#020804';
  ctx.fillRect(0, 0, W, H);
}

function drawDungeon() {
  const t = Math.min(progress / STEPS_TO_WIN, 1);
  const roomIdx = Math.min(Math.floor(t * ROOMS_TO_CLEAR), ROOMS_TO_CLEAR - 1);

  const roomW = Math.floor(W * 0.6);
  const roomH = Math.floor(H * 0.55);
  const roomX = Math.floor((W - roomW) / 2);
  const roomY = Math.floor((H - roomH) / 2);
  const tileSize = Math.floor(Math.min(roomW / 12, roomH / 10));

  // Draw floor tiles
  for (let tr = 0; tr < Math.floor(roomH / tileSize); tr++) {
    for (let tc = 0; tc < Math.floor(roomW / tileSize); tc++) {
      const shade = (tr + tc) % 2 === 0 ? '#0e1e0a' : '#0a1806';
      ctx.fillStyle = shade;
      ctx.fillRect(roomX + tc * tileSize, roomY + tr * tileSize, tileSize - 1, tileSize - 1);
    }
  }

  // Walls
  ctx.fillStyle = '#1a2a10';
  ctx.fillRect(roomX - 16, roomY - 16, roomW + 32, 16);      // top
  ctx.fillRect(roomX - 16, roomY + roomH, roomW + 32, 16);   // bottom
  ctx.fillRect(roomX - 16, roomY - 16, 16, roomH + 32);      // left
  ctx.fillRect(roomX + roomW, roomY - 16, 16, roomH + 32);   // right

  // Wall bricks
  ctx.fillStyle = '#0c1a08';
  for (let bx = roomX - 16; bx < roomX + roomW + 16; bx += 20) {
    ctx.fillRect(bx, roomY - 16, 1, 16);
    ctx.fillRect(bx, roomY + roomH, 1, 16);
  }
  for (let by = roomY - 16; by < roomY + roomH + 16; by += 14) {
    ctx.fillRect(roomX - 16, by, 16, 1);
    ctx.fillRect(roomX + roomW, by, 16, 1);
  }

  // Door ahead (next room) — south wall
  const doorW = Math.floor(roomW * 0.2);
  const doorX = roomX + Math.floor((roomW - doorW) / 2);
  const isLastRoom = roomIdx >= ROOMS_TO_CLEAR - 1;
  const doorProgress = (t * ROOMS_TO_CLEAR) - roomIdx;
  const doorOpen = doorProgress > 0.85 || isLastRoom;

  if (isLastRoom) {
    // Triforce door — glowing gold
    ctx.fillStyle = doorOpen ? '#3a2800' : '#1a1200';
    ctx.fillRect(doorX, roomY + roomH, doorW, 16);
    ctx.fillStyle = `rgba(232,208,64,${0.3 + triforceGlow * 0.5})`;
    ctx.fillRect(doorX, roomY + roomH, doorW, 16);
    // Triforce symbol on door
    drawTriforceSymbol(doorX + doorW / 2, roomY + roomH + 8, 8);
  } else {
    // Locked door (dark until close to opening)
    const doorColor = doorOpen ? '#4a3000' : '#0a0a06';
    ctx.fillStyle = doorColor;
    ctx.fillRect(doorX, roomY + roomH, doorW, 16);
    if (!doorOpen) {
      // Lock
      ctx.fillStyle = '#888';
      ctx.fillRect(doorX + doorW / 2 - 3, roomY + roomH + 4, 6, 6);
      ctx.fillStyle = '#666';
      ctx.beginPath();
      ctx.arc(doorX + doorW / 2, roomY + roomH + 4, 4, Math.PI, 0);
      ctx.stroke();
    }
  }

  // Door behind (north) — always open after first room
  const northDoorColor = roomIdx > 0 ? '#3a2800' : '#0a0806';
  ctx.fillStyle = northDoorColor;
  ctx.fillRect(doorX, roomY - 16, doorW, 16);

  // Room counter
  ctx.fillStyle = '#e8d040';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`ROOM ${roomIdx + 1} / ${ROOMS_TO_CLEAR}`, W / 2, roomY - 24);
  ctx.textAlign = 'left';
}

function drawTriforceSymbol(cx, cy, size) {
  const glow = Math.sin(frame * 0.05) * 0.3 + 0.7;
  ctx.fillStyle = `rgba(232,208,64,${glow})`;
  // Three triangles
  const h = size * 0.866;
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(cx - size * 1.05, cy + h * 0.5);
  ctx.lineTo(cx - size * 0.05, cy - h * 0.5);
  ctx.lineTo(cx - size * 2.05, cy - h * 0.5);
  ctx.closePath();
  // Bottom-right
  ctx.moveTo(cx + size * 0.05, cy + h * 0.5);
  ctx.lineTo(cx + size * 2.05, cy - h * 0.5);
  ctx.lineTo(cx - size * 0.95, cy - h * 0.5);
  ctx.closePath();
  // Top
  ctx.moveTo(cx, cy - h * 0.5);
  ctx.lineTo(cx + size, cy + h * 0.5);
  ctx.lineTo(cx - size, cy + h * 0.5);
  ctx.closePath();
  ctx.fill();
}

function drawEnemies() {
  const t = Math.min(progress / STEPS_TO_WIN, 1);
  if (t >= 1) return;  // cleared when at top

  enemies.forEach(e => {
    if (!e.alive) return;
    if (--e.timer <= 0) { e.timer = 20; e.frame ^= 1; }
    e.x += e.vx;
    e.y += e.vy;

    const roomX = (W - Math.floor(W * 0.6)) / 2;
    const roomY = (H - Math.floor(H * 0.55)) / 2;
    const roomW = Math.floor(W * 0.6);
    const roomH = Math.floor(H * 0.55);

    if (e.x < roomX + 10 || e.x > roomX + roomW - 20) e.vx *= -1;
    if (e.y < roomY + 10 || e.y > roomY + roomH - 20) e.vy *= -1;

    ctx.shadowColor = '#cc4400'; ctx.shadowBlur = 8;
    drawPx(e.frame === 0 ? ENEMY_A : ENEMY_B, Math.round(e.x), Math.round(e.y), PX, '#cc4400');
    ctx.shadowBlur = 0;
  });
}

function drawLink() {
  const t = Math.min(progress / STEPS_TO_WIN, 1);
  const roomX = (W - Math.floor(W * 0.6)) / 2;
  const roomY = (H - Math.floor(H * 0.55)) / 2;
  const roomW = Math.floor(W * 0.6);
  const roomH = Math.floor(H * 0.55);

  // Link walks from top of room to bottom, room by room
  const roomT = (t * ROOMS_TO_CLEAR) % 1;
  const lx = roomX + roomW * 0.45;
  const ly = roomY + roomH * 0.15 + roomH * 0.65 * roomT;

  const walkFrame = Math.floor(frame / 10) % 2;
  const sprite = walkFrame === 0 ? LINK_DOWN : LINK_UP;

  if (stepFlash > 0) {
    ctx.shadowColor = '#e8d040'; ctx.shadowBlur = 18;
    // Draw sword extended
    drawPx(LINK_SWORD, Math.round(lx) + 8, Math.round(ly) - 4, PX, '#ddd');
  }
  ctx.fillStyle = '#00aa44';
  drawPx(sprite, Math.round(lx) - 7, Math.round(ly) - 16, PX, '#00aa44');
  // Hair/face
  ctx.fillStyle = '#ddbb44';
  ctx.fillRect(Math.round(lx) - 4, Math.round(ly) - 16, 10, 5);
  ctx.shadowBlur = 0;
}

function drawSparkles() {
  sparkles = sparkles.filter(s => s.life > 0);
  sparkles.forEach(s => {
    s.x += s.vx; s.y += s.vy; s.life--;
    ctx.globalAlpha = s.life / 10;
    ctx.fillStyle = '#e8d040';
    ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
  });
  ctx.globalAlpha = 1;
}

function drawTriforce() {
  if (progress < STEPS_TO_WIN) return;
  const cx = W / 2, cy = H / 2;
  triforceGlow = Math.min(triforceGlow + 0.05, 1);
  ctx.shadowColor = '#e8d040';
  ctx.shadowBlur = 30 * triforceGlow;
  drawTriforceSymbol(cx, cy - 20, 28 * (0.5 + triforceGlow * 0.5));
  ctx.shadowBlur = 0;
}

function drawScore() {
  ctx.fillStyle = '#e8d040';
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(String(score).padStart(6, '0'), W - 12, 22);
  ctx.textAlign = 'left';
}

function render() {
  if (!active) return;
  frame++;
  ctx.clearRect(0, 0, W, H);

  drawBackground();
  drawDungeon();
  drawEnemies();
  drawLink();
  drawSparkles();
  drawTriforce();
  drawScore();

  if (stepFlash > 0) stepFlash--;
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
  sparkles = [];
  spawnEnemies(0);
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  enemies = []; sparkles = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  progress++;
  score += 50;
  stepFlash = 8;

  // Spawn sparkle at Link's position
  const roomX = (W - Math.floor(W * 0.6)) / 2;
  const roomY = (H - Math.floor(H * 0.55)) / 2;
  const roomH = Math.floor(H * 0.55);
  const lx = roomX + Math.floor(W * 0.6) * 0.45;
  const t = Math.min(progress / STEPS_TO_WIN, 1);
  const roomT = (t * ROOMS_TO_CLEAR) % 1;
  const ly = roomY + roomH * 0.15 + roomH * 0.65 * roomT;

  for (let i = 0; i < 5; i++) {
    sparkles.push({
      x: lx + (Math.random() - 0.5) * 20,
      y: ly + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3 - 1,
      life: 10,
    });
  }

  // Respawn enemies on new room
  const roomIdx = Math.min(Math.floor(t * ROOMS_TO_CLEAR), ROOMS_TO_CLEAR - 1);
  const prevRoomIdx = Math.min(Math.floor(((progress - 1) / STEPS_TO_WIN) * ROOMS_TO_CLEAR), ROOMS_TO_CLEAR - 1);
  if (roomIdx !== prevRoomIdx) spawnEnemies(roomIdx);
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
  }
});
