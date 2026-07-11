// Level 8: Tetris (Pajitnov / Nintendo, 1984)
// Falling tetrominoes drop keystroke by keystroke. Clear 3 lines to win.

let canvas, ctx;
let animId = null, active = false, victoryMode = false;
let frame = 0;

let linesCleared = 0;
const LINES_TO_WIN = 3;

// Grid: 10 cols × 18 rows
const COLS = 10, ROWS = 18;
let grid = [];        // 2D array of color strings or null
let piece = null;     // { shape, x, y, colorIdx }
let nextPiece = null;
let clearFlash = [];  // rows currently flashing for clear animation
let clearTimer = 0;
let dropFlash = 0;
let score = 0;
let W = 0, H = 0;
let CELL = 0, GRID_X = 0, GRID_Y = 0;

const SHAPES = [
  [[1,1,1,1]],                          // I
  [[1,1],[1,1]],                        // O
  [[0,1,0],[1,1,1]],                    // T
  [[1,0],[1,0],[1,1]],                  // L
  [[0,1],[0,1],[1,1]],                  // J
  [[1,1,0],[0,1,1]],                    // S
  [[0,1,1],[1,1,0]],                    // Z
];

const COLORS = ['#00ffff','#ffff00','#cc00ff','#ff8800','#0044ff','#00ff44','#ff2222'];

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function computeLayout() {
  W = canvas.width; H = canvas.height;
  CELL = Math.min(Math.floor(H * 0.78 / ROWS), Math.floor(W * 0.34 / COLS));
  CELL = Math.max(CELL, 18);
  GRID_X = Math.floor((W - COLS * CELL) / 2);
  GRID_Y = Math.floor((H - ROWS * CELL) / 2);
}

function initGrid() {
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function randomPiece() {
  const idx = Math.floor(Math.random() * SHAPES.length);
  return { shape: SHAPES[idx], colorIdx: idx, x: Math.floor(COLS / 2) - 1, y: 0 };
}

function rotateShape(shape) {
  const rows = shape.length, cols = shape[0].length;
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => shape[rows - 1 - r][c])
  );
}

function fits(s, px, py) {
  for (let r = 0; r < s.length; r++)
    for (let c = 0; c < s[r].length; c++)
      if (s[r][c]) {
        const gx = px + c, gy = py + r;
        if (gx < 0 || gx >= COLS || gy >= ROWS) return false;
        if (gy >= 0 && grid[gy][gx]) return false;
      }
  return true;
}

function lockPiece() {
  if (!piece) return;
  const col = COLORS[piece.colorIdx];
  for (let r = 0; r < piece.shape.length; r++)
    for (let c = 0; c < piece.shape[r].length; c++)
      if (piece.shape[r][c]) {
        const gy = piece.y + r, gx = piece.x + c;
        if (gy >= 0) grid[gy][gx] = col;
      }

  // Check for complete rows
  const complete = [];
  for (let r = 0; r < ROWS; r++) {
    if (grid[r].every(cell => cell !== null)) complete.push(r);
  }

  if (complete.length > 0) {
    clearFlash = complete;
    clearTimer = 18;
    linesCleared += complete.length;
    score += complete.length * 100;
  } else {
    score += 10;
  }

  piece = nextPiece || randomPiece();
  nextPiece = randomPiece();
}

function clearLines(rows) {
  rows.sort((a, b) => b - a);
  rows.forEach(r => {
    grid.splice(r, 1);
    grid.unshift(Array(COLS).fill(null));
  });
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function drawBackground() {
  ctx.fillStyle = '#000818';
  ctx.fillRect(0, 0, W, H);
}

function drawGrid() {
  // Border
  ctx.strokeStyle = '#003355';
  ctx.lineWidth = 2;
  ctx.strokeRect(GRID_X - 2, GRID_Y - 2, COLS * CELL + 4, ROWS * CELL + 4);

  // Grid lines
  ctx.strokeStyle = 'rgba(0, 80, 120, 0.3)';
  ctx.lineWidth = 1;
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(GRID_X, GRID_Y + r * CELL);
    ctx.lineTo(GRID_X + COLS * CELL, GRID_Y + r * CELL);
    ctx.stroke();
  }
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(GRID_X + c * CELL, GRID_Y);
    ctx.lineTo(GRID_X + c * CELL, GRID_Y + ROWS * CELL);
    ctx.stroke();
  }

  // Locked cells
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!grid[r][c]) continue;
      const isFlashing = clearFlash.includes(r) && clearTimer > 0;
      const col = isFlashing ? (clearTimer % 4 < 2 ? '#fff' : '#ffff00') : grid[r][c];
      drawCell(GRID_X + c * CELL, GRID_Y + r * CELL, CELL, col);
    }
  }
}

function drawCell(x, y, size, col) {
  ctx.fillStyle = col;
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(x + 1, y + 1, size - 2, 3);
  ctx.fillRect(x + 1, y + 1, 3, size - 2);
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x + size - 3, y + 2, 2, size - 3);
  ctx.fillRect(x + 2, y + size - 3, size - 3, 2);
}

function drawPiece(p, offsetX, offsetY) {
  if (!p) return;
  const col = COLORS[p.colorIdx];
  if (dropFlash > 0) { ctx.shadowColor = col; ctx.shadowBlur = 12; }
  for (let r = 0; r < p.shape.length; r++)
    for (let c = 0; c < p.shape[r].length; c++)
      if (p.shape[r][c] && p.y + r >= 0)
        drawCell(offsetX + (p.x + c) * CELL, offsetY + (p.y + r) * CELL, CELL, col);
  ctx.shadowBlur = 0;
}

function drawNextPiece() {
  if (!nextPiece) return;
  const nx = GRID_X + COLS * CELL + 24;
  const ny = GRID_Y + 24;
  ctx.fillStyle = '#003355';
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('NEXT', nx, ny);
  const previewCell = Math.floor(CELL * 0.8);
  nextPiece.shape.forEach((row, r) =>
    row.forEach((c, cc) => {
      if (c) drawCell(nx + cc * previewCell, ny + 10 + r * previewCell, previewCell, COLORS[nextPiece.colorIdx]);
    })
  );
}

function drawHUD() {
  const nx = GRID_X + COLS * CELL + 24;
  ctx.fillStyle = '#00ffff';
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(String(score).padStart(6, '0'), nx, GRID_Y + 100);
  ctx.fillStyle = '#004466';
  ctx.fillText('LINES', nx, GRID_Y + 120);
  ctx.fillStyle = '#00ffff';
  ctx.fillText(`${linesCleared}/${LINES_TO_WIN}`, nx, GRID_Y + 138);
}

function render() {
  if (!active) return;
  frame++;
  ctx.clearRect(0, 0, W, H);

  drawBackground();
  drawGrid();
  drawPiece(piece, GRID_X, GRID_Y);
  drawNextPiece();
  drawHUD();

  if (dropFlash > 0) dropFlash--;

  if (clearTimer > 0) {
    clearTimer--;
    if (clearTimer === 0) {
      clearLines(clearFlash);
      clearFlash = [];
      piece = nextPiece || randomPiece();
      nextPiece = randomPiece();
    }
  }

  animId = requestAnimationFrame(render);
}

// ─── API ──────────────────────────────────────────────────────────────────────

export function start() {
  getCanvas();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  active = true; victoryMode = false; frame = 0;
  linesCleared = 0; score = 0; clearFlash = []; clearTimer = 0; dropFlash = 0;
  computeLayout();
  initGrid();
  piece = randomPiece();
  nextPiece = randomPiece();
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function keystroke() {
  if (!active || victoryMode || clearTimer > 0 || !piece) return;
  dropFlash = 6;

  // Drop piece one row
  if (fits(piece.shape, piece.x, piece.y + 1)) {
    piece.y++;
  } else {
    lockPiece();
  }
}

export function miss() {}

export function patternComplete() {
  return linesCleared >= LINES_TO_WIN;
}

export function victory() {
  victoryMode = true;
}

window.addEventListener('resize', () => {
  if (active) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    computeLayout();
  }
});
