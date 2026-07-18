// Level 25: Word Processor (Present day) — the finale. First full sentences.
//
// LAYOUT CONTRACT ("the UI owns the center; the theme owns the frame"):
// The fixed DOM UI owns the center — the prompt panel (~0.40-0.60W x
// 0.18-0.44H) and the keyboard guide (~0.22-0.78W x 0.50-0.82H). Rather than
// hide a small page behind those panels (the old bug — an invisible document),
// the page is now a WIDE sheet of paper that fills the TOP BAND and both
// MARGINS, as if the keyboard is resting ON the desk in front of a large
// document. The player's typed words accumulate as real text lines across the
// TOP BAND (full width, above the prompt panel) where they're always visible,
// with a blinking cursor at the end. The desk surface shows in the bottom
// strip. Backspace lifts the last character off the page with a soft eraser
// shimmer — "making it right", warm and calm, never corrective.

let canvas, ctx, animId;
let active = false, victoryMode = false;
let text = '';
let progressCount = 0;   // counts keystrokes toward the win gate (Backspace too)
let flashTimer = 0;
let pageGlow = 0;
let frame = 0;

let inkParticles = [];   // tiny settling ink motes per character
let eraserPuffs = [];    // dust puffs on Backspace
let cursorEase = 1;      // 0..1 eased "just typed" pulse on the cursor

const WIN_KEYSTROKES = 30;
const MAX_INK = 90;
const MAX_PUFF_PARTICLES = 60;

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }

function init() {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  text = '';
  progressCount = 0;
  flashTimer = 0;
  pageGlow = 0;
  frame = 0;
  victoryMode = false;
  inkParticles = [];
  eraserPuffs = [];
  cursorEase = 1;
}

// ─── The desk ───────────────────────────────────────────────────────────────

function drawDesk(W, H) {
  // Warm modern wooden desk surface — a soft vertical gradient.
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#3a2c20');
  g.addColorStop(0.6, '#2a2018');
  g.addColorStop(1, '#1c150f');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Soft desk-lamp pool from the top, slightly off-center like a real lamp.
  const lampX = W * 0.44, lampY = H * -0.08;
  const lamp = ctx.createRadialGradient(lampX, lampY, 0, lampX, lampY, H * 0.95);
  lamp.addColorStop(0, 'rgba(255, 246, 220, 0.20)');
  lamp.addColorStop(0.4, 'rgba(255, 232, 190, 0.09)');
  lamp.addColorStop(1, 'rgba(255, 232, 190, 0)');
  ctx.fillStyle = lamp;
  ctx.fillRect(0, 0, W, H);
}

// The page is a WIDE sheet: it fills the top band and both margins, ending
// just above the keyboard guide so the guide reads as sitting on the desk in
// front of the document.
function pageBounds(W, H) {
  const px = W * 0.04;
  const py = H * 0.015;
  const pw = W * 0.92;
  const ph = H * 0.485; // ends ~0.50H, just above the keyboard guide (0.503H)
  return { px, py, pw, ph };
}

function drawPage(W, H) {
  const { px, py, pw, ph } = pageBounds(W, H);

  // Realistic layered page shadow on the desk.
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.32)';
  ctx.shadowBlur = 42;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = pageGlow > 0 ? '#fffdf6' : '#f6f3ea';
  ctx.fillRect(px, py, pw, ph);
  ctx.restore();

  // Gentle paper texture — faint warm fibers/speckle, deterministic per frame.
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  // Warm top-down sheen (lamp light falling across the sheet)
  const sheen = ctx.createLinearGradient(px, py, px, py + ph);
  sheen.addColorStop(0, 'rgba(255, 244, 214, 0.35)');
  sheen.addColorStop(0.5, 'rgba(255, 244, 214, 0.05)');
  sheen.addColorStop(1, 'rgba(230, 224, 208, 0.12)');
  ctx.fillStyle = sheen;
  ctx.fillRect(px, py, pw, ph);
  // Sparse speckle texture
  ctx.fillStyle = 'rgba(120, 110, 90, 0.05)';
  for (let i = 0; i < 90; i++) {
    const sx = px + ((i * 73) % pw);
    const sy = py + ((i * 149) % ph);
    ctx.fillRect(sx, sy, 1, 1);
  }
  ctx.restore();

  // Title bar / ruler across the very top of the page.
  drawRuler(px, py, pw, ph);

  // Faint ruled writing lines below the ruler.
  ctx.strokeStyle = 'rgba(40,50,80,0.07)';
  ctx.lineWidth = 1;
  const lineH = Math.max(20, Math.floor(ph * 0.11));
  const firstLine = py + ph * 0.30;
  for (let ly = firstLine; ly < py + ph - lineH * 0.3; ly += lineH) {
    ctx.beginPath();
    ctx.moveTo(px + pw * 0.03, ly);
    ctx.lineTo(px + pw * 0.97, ly);
    ctx.stroke();
  }

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

  return { px, py, pw, ph };
}

// Word-processor title bar + ruler across the top of the sheet.
function drawRuler(px, py, pw, ph) {
  const barH = Math.max(16, ph * 0.10);
  // Title bar background
  const bar = ctx.createLinearGradient(px, py, px, py + barH);
  bar.addColorStop(0, '#e9e6dc');
  bar.addColorStop(1, '#d8d4c6');
  ctx.fillStyle = bar;
  ctx.fillRect(px, py, pw, barH);

  // Document title, centered on the page's own width. Left-aligned at the
  // page's left margin would sit inside the reserved HUD badge zone
  // (~0.02-0.11W x 0.02-0.07H — see Theme Layout Contract in
  // .claude/rules/visual-validation.md); centering keeps it clear regardless
  // of viewport size since the page itself starts at px=W*0.04.
  const fs = Math.max(8, Math.floor(barH * 0.42));
  ctx.font = `${fs}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#6a6458';
  ctx.fillText('MY STORY', px + pw * 0.5, py + barH * 0.5);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Ruler tick marks just below the title bar
  const ry = py + barH + 3;
  ctx.strokeStyle = 'rgba(90,84,72,0.5)';
  ctx.lineWidth = 1;
  const tickStep = pw / 40;
  for (let i = 0; i <= 40; i++) {
    const x = px + i * tickStep;
    const tall = i % 5 === 0;
    ctx.beginPath();
    ctx.moveTo(x, ry);
    ctx.lineTo(x, ry + (tall ? 6 : 3));
    ctx.stroke();
  }
}

function wrapText(str, maxCharsPerLine) {
  const words = str.split(' ');
  const lines = [];
  let cur = '';
  words.forEach((w) => {
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

let lastCursorPos = null; // {x, y, fontSize}

function drawText(W, H, px, py, pw, ph) {
  const fontSize = Math.max(13, Math.floor(pw * 0.020));
  const lineH = Math.round(fontSize * 1.7);
  const marginX = Math.round(pw * 0.05);
  // Start just below the ruler so the first lines sit in the fully-visible top
  // band above the prompt panel; later lines carry down the page.
  const startY = Math.round(py + ph * 0.22);
  const maxCharsPerLine = Math.max(20, Math.floor((pw - marginX * 2) / (fontSize * 0.62)));

  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#242a33';

  const lines = wrapText(text, maxCharsPerLine);
  // Only as many lines as fit above the keyboard within the page body.
  const bodyH = (py + ph) - startY - lineH;
  const maxLines = Math.max(1, Math.floor(bodyH / lineH));
  const visible = lines.slice(-maxLines);
  visible.forEach((line, i) => {
    ctx.fillText(line, px + marginX, startY + i * lineH);
  });

  // Blinking cursor at end of last line with a small eased "just typed" pulse.
  const lastLine = visible[visible.length - 1] || '';
  const cursorX = px + marginX + ctx.measureText(lastLine).width + 2;
  const cursorY = startY + (visible.length - 1) * lineH;
  lastCursorPos = { x: cursorX, y: cursorY, fontSize };

  const blinkOn = Math.floor(performance.now() / 500) % 2 === 0;
  if (blinkOn || cursorEase < 1) {
    const pulse = 1 + 0.35 * (1 - easeOutQuad(cursorEase));
    const cw = Math.max(2, Math.round(fontSize * 0.12));
    const ch = fontSize * pulse;
    ctx.fillStyle = flashTimer > 0 ? '#2f6fe0' : '#3a4658';
    ctx.fillRect(cursorX, cursorY - (ch - fontSize) / 2, cw, ch);
  }

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
}

// ─── Ink particles (settle after a character lands) ────────────────────────

function spawnInk(x, y, fontSize) {
  const n = 5;
  for (let i = 0; i < n; i++) {
    if (inkParticles.length >= MAX_INK) inkParticles.shift();
    const ang = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 0.6;
    inkParticles.push({
      x: x + (Math.random() - 0.5) * fontSize * 0.3,
      y: y + fontSize * 0.5,
      vx: Math.cos(ang) * speed * 0.3,
      vy: Math.sin(ang) * speed * 0.2 + 0.15,
      life: 0,
      maxLife: 22 + Math.random() * 14,
      size: 0.6 + Math.random() * 1.1,
    });
  }
}

function updateInk() {
  for (let i = inkParticles.length - 1; i >= 0; i--) {
    const p = inkParticles[i];
    p.life++;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.94;
    p.vy *= 0.94;
    if (p.life >= p.maxLife) inkParticles.splice(i, 1);
  }
}

function drawInk() {
  for (const p of inkParticles) {
    const t = p.life / p.maxLife;
    const alpha = (1 - easeOutCubic(t)) * 0.5;
    ctx.fillStyle = `rgba(36, 42, 51, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Eraser dust puffs (Backspace) — "making it right" ──────────────────────

function spawnEraserPuff(x, y) {
  const parts = [];
  const n = 14;
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2;
    const speed = 0.4 + Math.random() * 1.1;
    parts.push({
      x: 0, y: 0,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed - 0.4,
      size: 0.8 + Math.random() * 1.6,
    });
  }
  eraserPuffs.push({ x, y, life: 0, maxLife: 30, particles: parts });
  let total = eraserPuffs.reduce((s, p) => s + p.particles.length, 0);
  while (total > MAX_PUFF_PARTICLES && eraserPuffs.length > 1) {
    total -= eraserPuffs[0].particles.length;
    eraserPuffs.shift();
  }
}

function updateEraserPuffs() {
  for (let i = eraserPuffs.length - 1; i >= 0; i--) {
    const puff = eraserPuffs[i];
    puff.life++;
    for (const p of puff.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03;
      p.vx *= 0.96;
    }
    if (puff.life >= puff.maxLife) eraserPuffs.splice(i, 1);
  }
}

function drawEraserPuffs() {
  for (const puff of eraserPuffs) {
    const t = puff.life / puff.maxLife;
    const alpha = 1 - easeOutCubic(t);
    // Warm eraser dust + a soft shimmer ring — gentle, celebratory of the fix.
    ctx.fillStyle = `rgba(210, 200, 178, ${(alpha * 0.65).toFixed(3)})`;
    for (const p of puff.particles) {
      ctx.beginPath();
      ctx.arc(puff.x + p.x, puff.y + p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    // Soft shimmer ring expanding out
    ctx.save();
    ctx.globalAlpha = alpha * 0.4;
    ctx.strokeStyle = 'rgba(255, 240, 200, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(puff.x, puff.y, 4 + t * 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawProgress(W, H) {
  const pct = Math.min(1, progressCount / WIN_KEYSTROKES);
  const barW = Math.round(W * 0.14);
  const bx = Math.round(W * 0.02);
  const by = Math.round(H * 0.94);

  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#8fd0ff';
  ctx.shadowColor = '#8fd0ff';
  ctx.shadowBlur = 4;
  ctx.fillText(`WORDS ${Math.min(progressCount, WIN_KEYSTROKES)}/${WIN_KEYSTROKES}`, bx, by);
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
  updateInk();
  drawInk();
  updateEraserPuffs();
  drawEraserPuffs();
  drawProgress(W, H);

  if (flashTimer > 0) flashTimer--;
  if (pageGlow > 0) pageGlow--;
  if (cursorEase < 1) cursorEase = Math.min(1, cursorEase + 0.08);

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
  cursorEase = 0;  // restart the eased "just typed" cursor pulse

  const anchor = lastCursorPos;

  if (key === 'Backspace') {
    text = text.slice(0, -1);
    flashTimer = 8;
    // Eraser shimmer lifts off where the character was — warm, "making it right".
    if (anchor) spawnEraserPuff(anchor.x, anchor.y + anchor.fontSize * 0.5);
  } else if (key === ' ') {
    text += ' ';
    flashTimer = 4;
  } else if (key && key.length === 1) {
    text += key;
    flashTimer = 6;
    if (anchor) spawnInk(anchor.x, anchor.y, anchor.fontSize);
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
