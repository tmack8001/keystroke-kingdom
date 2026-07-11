// Level 24: High Score Entry (Present day) — the player types their own name
// CRT gold-on-black arcade high-score table. Each keystroke types a glowing
// character into the entry row. Uppercase (shifted) letters get an extra flash.

let canvas, ctx, animId;
let active = false, victoryMode = false;
let entryChars = [];   // characters typed into the live entry row
let flashTimer = 0;    // extra flash when an uppercase (shift) char lands
let slideT = 0;        // victory: entry row slides into #1 slot
let sparkle = 0;
let frame = 0;

const WIN_CHARS = 24;
const ENTRY_MAX = 12;

// Static, pre-filled high score rows (top of the board, above the live entry)
const BOARD = [
  { name: 'ACE', score: 98200 },
  { name: 'ZED', score: 87650 },
  { name: 'MAX', score: 76300 },
  { name: 'JAX', score: 65100 },
  { name: 'REX', score: 54800 },
];

function init() {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  entryChars = [];
  flashTimer = 0;
  slideT = 0;
  sparkle = 0;
  frame = 0;
  victoryMode = false;
}

// ─── Drawing ──────────────────────────────────────────────────────────────────

function drawBackground(W, H) {
  ctx.fillStyle = '#050300';
  ctx.fillRect(0, 0, W, H);
  // Subtle amber vignette
  const vign = ctx.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, Math.max(W, H) * 0.7);
  vign.addColorStop(0, 'rgba(0,0,0,0)');
  vign.addColorStop(1, 'rgba(40,20,0,0.55)');
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, W, H);
}

function drawCRTLines(W, H) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
}

function drawTitle(W, H) {
  const fontSize = Math.max(14, Math.floor(W * 0.024));
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700';
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 14;
  ctx.fillText('HIGH SCORES', W / 2, Math.round(H * 0.16));
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
}

function drawBoard(W, H) {
  const fontSize = Math.max(11, Math.floor(W * 0.016));
  const lineH = Math.round(fontSize * 2.1);
  const startY = Math.round(H * 0.28);
  const leftX = Math.round(W * 0.28);
  const rightX = Math.round(W * 0.72);

  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textBaseline = 'top';

  const rows = victoryMode && slideT >= 1
    ? [{ name: entryName(), score: 99999, live: true }, ...BOARD.slice(0, 4)]
    : BOARD;

  rows.forEach((row, i) => {
    const y = startY + i * lineH;
    const isLive = row.live;
    ctx.textAlign = 'left';
    ctx.fillStyle = isLive ? '#fff2a8' : '#e8c040';
    ctx.shadowColor = isLive ? '#fff2a8' : '#e8c040';
    ctx.shadowBlur = isLive ? 12 : 3;
    ctx.fillText(`${i + 1}.`, leftX - fontSize * 2.2, y);
    ctx.fillText(row.name, leftX, y);
    ctx.textAlign = 'right';
    ctx.fillText(String(row.score).padStart(5, '0'), rightX, y);
    ctx.shadowBlur = 0;
  });
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function entryName() {
  const s = entryChars.join('') || '_';
  return s.slice(0, ENTRY_MAX);
}

function drawEntryRow(W, H) {
  if (victoryMode) return; // once sliding into the board, the row above handles it
  const fontSize = Math.max(13, Math.floor(W * 0.02));
  const y = Math.round(H * 0.72);

  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';

  // Label
  ctx.fillStyle = '#886600';
  ctx.font = `${Math.max(8, Math.floor(fontSize * 0.6))}px "Press Start 2P", monospace`;
  ctx.fillText('ENTER YOUR NAME', W / 2, y - fontSize * 1.6);

  // Entry text with blinking cursor
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  const text = entryChars.join('');
  const blinkOn = Math.floor(performance.now() / 500) % 2 === 0;
  const shown = text + (blinkOn ? '_' : ' ');

  const glow = flashTimer > 0 ? 22 : 10;
  ctx.fillStyle = '#ffe066';
  ctx.shadowColor = '#ffe066';
  ctx.shadowBlur = glow;
  ctx.fillText(shown || '_', W / 2, y);
  ctx.shadowBlur = 0;

  ctx.textAlign = 'left';
}

function drawProgress(W, H) {
  const pct = Math.min(1, entryChars.length / WIN_CHARS);
  const barW = Math.round(W * 0.2);
  const bx = Math.round(W * 0.02);
  const by = 14;

  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#ffd700';
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 4;
  ctx.fillText(`ENTRY ${entryChars.length}/${WIN_CHARS}`, bx, by);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#2a1a00';
  ctx.fillRect(bx, by + 5, barW, 8);
  ctx.fillStyle = '#ffd700';
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 3;
  ctx.fillRect(bx, by + 5, Math.round(barW * pct), 8);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#7a5a00';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx + 0.5, by + 5.5, barW - 1, 7);
}

function drawSparkles(W, H) {
  if (sparkle <= 0) return;
  const n = 30;
  for (let i = 0; i < n; i++) {
    const seed = (frame * 3 + i * 97) % 997;
    const sx = (seed * 53) % W;
    const sy = (seed * 91) % H;
    const tw = (Math.sin(frame * 0.2 + i) + 1) / 2;
    ctx.fillStyle = `rgba(255, 230, 120, ${0.3 + tw * 0.6})`;
    ctx.fillRect(sx, sy, 2, 2);
  }
}

function render() {
  if (!active) return;
  frame++;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  drawBackground(W, H);
  drawTitle(W, H);
  drawBoard(W, H);
  drawEntryRow(W, H);
  if (sparkle > 0) { drawSparkles(W, H); sparkle--; }
  drawProgress(W, H);
  drawCRTLines(W, H);

  if (flashTimer > 0) flashTimer--;
  if (victoryMode && slideT < 1) slideT += 0.05;

  animId = requestAnimationFrame(render);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function start() {
  init();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  active = true;
  animId = requestAnimationFrame(render);
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function keystroke(key) {
  if (!active || victoryMode) return;
  if (entryChars.length < ENTRY_MAX && key && key.length === 1) {
    entryChars.push(key);
  }
  // Uppercase (shifted) letters get an extra flash — the shift moment
  if (key && /[A-Z]/.test(key)) {
    flashTimer = 14;
  } else {
    flashTimer = 6;
  }
}

export function miss() {}

export function patternComplete() {
  return entryChars.length >= WIN_CHARS;
}

export function victory() {
  victoryMode = true;
  slideT = 0;
  sparkle = 90;
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
