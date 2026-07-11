// Level 25: Word Processor (Present day) — the finale. First full sentences.
// A clean paper page on a desk. Keystrokes append characters; Backspace REMOVES
// the last character (mirroring the real key — "Backspace isn't failure").

let canvas, ctx, animId;
let active = false, victoryMode = false;
let text = '';
let progressCount = 0;   // counts keystrokes toward the win gate (Backspace counts too)
let flashTimer = 0;
let pageGlow = 0;
let frame = 0;

const WIN_KEYSTROKES = 30;

function init() {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  text = '';
  progressCount = 0;
  flashTimer = 0;
  pageGlow = 0;
  frame = 0;
  victoryMode = false;
}

// ─── Drawing ──────────────────────────────────────────────────────────────────

function drawDesk(W, H) {
  // Modern bright desk backdrop — soft gradient, present-day finale
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#2a2f3a');
  g.addColorStop(1, '#12151b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Soft desk lamp glow from top
  const lamp = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, H * 0.7);
  lamp.addColorStop(0, 'rgba(255,255,240,0.10)');
  lamp.addColorStop(1, 'rgba(255,255,240,0)');
  ctx.fillStyle = lamp;
  ctx.fillRect(0, 0, W, H);
}

function pageBounds(W, H) {
  const pw = Math.min(W * 0.62, 620);
  const ph = Math.min(H * 0.72, 760);
  const px = (W - pw) / 2;
  const py = (H - ph) / 2;
  return { px, py, pw, ph };
}

function drawPage(W, H) {
  const { px, py, pw, ph } = pageBounds(W, H);

  // Drop shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = pageGlow > 0 ? '#fffdf5' : '#f7f5ee';
  ctx.fillRect(px, py, pw, ph);
  ctx.restore();

  if (pageGlow > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.5, pageGlow / 60);
    ctx.shadowColor = '#ffe066';
    ctx.shadowBlur = 40;
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 3;
    ctx.strokeRect(px + 1.5, py + 1.5, pw - 3, ph - 3);
    ctx.restore();
  }

  // Thin ruled lines suggesting a document
  ctx.strokeStyle = 'rgba(30,30,40,0.06)';
  ctx.lineWidth = 1;
  const lineH = Math.max(18, Math.floor(ph * 0.045));
  for (let ly = py + lineH * 2; ly < py + ph - lineH; ly += lineH) {
    ctx.beginPath();
    ctx.moveTo(px + pw * 0.08, ly);
    ctx.lineTo(px + pw * 0.92, ly);
    ctx.stroke();
  }

  return { px, py, pw, ph };
}

function wrapText(str, maxCharsPerLine) {
  const words = str.split(' ');
  const lines = [];
  let cur = '';
  words.forEach((w, i) => {
    const candidate = cur.length ? cur + ' ' + w : w;
    if (candidate.length > maxCharsPerLine && cur.length) {
      lines.push(cur);
      cur = w;
    } else {
      cur = candidate;
    }
  });
  lines.push(cur);
  return lines;
}

function drawText(W, H, px, py, pw, ph) {
  const fontSize = Math.max(12, Math.floor(pw * 0.032));
  const lineH = Math.round(fontSize * 1.9);
  const marginX = Math.round(pw * 0.1);
  const startY = Math.round(py + ph * 0.14);
  const maxCharsPerLine = Math.max(10, Math.floor((pw - marginX * 2) / (fontSize * 0.62)));

  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#232323';

  const lines = wrapText(text, maxCharsPerLine);
  const visible = lines.slice(-6);
  visible.forEach((line, i) => {
    ctx.fillText(line, px + marginX, startY + i * lineH);
  });

  // Blinking cursor at end of last line
  const lastLine = visible[visible.length - 1] || '';
  const cursorX = px + marginX + ctx.measureText(lastLine).width + 2;
  const cursorY = startY + (visible.length - 1) * lineH;
  const blinkOn = Math.floor(performance.now() / 500) % 2 === 0;
  if (blinkOn) {
    ctx.fillStyle = flashTimer > 0 ? '#2255cc' : '#444';
    ctx.fillRect(cursorX, cursorY, Math.round(fontSize * 0.55), fontSize);
  }

  ctx.textBaseline = 'alphabetic';
}

function drawProgress(W, H) {
  const pct = Math.min(1, progressCount / WIN_KEYSTROKES);
  const barW = Math.round(W * 0.2);
  const bx = Math.round(W * 0.02);
  const by = 14;

  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#8fd0ff';
  ctx.shadowColor = '#8fd0ff';
  ctx.shadowBlur = 4;
  ctx.fillText(`WORDS ${progressCount}/${WIN_KEYSTROKES}`, bx, by);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#101820';
  ctx.fillRect(bx, by + 5, barW, 8);
  ctx.fillStyle = '#8fd0ff';
  ctx.shadowColor = '#8fd0ff';
  ctx.shadowBlur = 3;
  ctx.fillRect(bx, by + 5, Math.round(barW * pct), 8);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#2a4a5a';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx + 0.5, by + 5.5, barW - 1, 7);
}

function render() {
  if (!active) return;
  frame++;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  drawDesk(W, H);
  const { px, py, pw, ph } = drawPage(W, H);
  drawText(W, H, px, py, pw, ph);
  drawProgress(W, H);

  if (flashTimer > 0) flashTimer--;
  if (pageGlow > 0) pageGlow--;

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
  progressCount++; // effort counts — Backspace advances progress too

  if (key === 'Backspace') {
    text = text.slice(0, -1);
    flashTimer = 8;
  } else if (key === ' ') {
    text += ' ';
    flashTimer = 4;
  } else if (key && key.length === 1) {
    text += key;
    flashTimer = 6;
  }
}

export function miss() {}

export function patternComplete() {
  return progressCount >= WIN_KEYSTROKES;
}

export function victory() {
  victoryMode = true;
  text = 'THE END.';
  pageGlow = 60;
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
