// Level 25: Word Processor (Present day) — the finale. First full sentences.
// A clean paper page on a desk, rendered with modern-era polish: a soft
// realistic page shadow, a warm desk-lamp lighting gradient, tiny ink
// particles that settle as each character lands, and a satisfying puff of
// eraser dust on Backspace ("Backspace isn't failure — every writer uses
// it"). The whole scene stays calm and quiet — this is the level where a
// child writes their first sentences, and nothing should startle them.

let canvas, ctx, animId;
let active = false, victoryMode = false;
let text = '';
let progressCount = 0;   // counts keystrokes toward the win gate (Backspace counts too)
let flashTimer = 0;
let pageGlow = 0;
let frame = 0;

let inkParticles = [];   // tiny settling ink motes spawned per character {x,y,vx,vy,life,maxLife}
let eraserPuffs = [];    // dust puffs spawned on Backspace {x,y,particles:[...]}
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

// ─── Drawing ──────────────────────────────────────────────────────────────────

function drawDesk(W, H) {
  // Modern bright desk backdrop — soft gradient, present-day finale
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#2a2f3a');
  g.addColorStop(1, '#12151b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Warm desk lamp lighting gradient from top — soft radial pool of light,
  // slightly off-center like a real lamp, with a gentle warm-white core.
  const lampX = W * 0.46, lampY = H * -0.05;
  const lamp = ctx.createRadialGradient(lampX, lampY, 0, lampX, lampY, H * 0.85);
  lamp.addColorStop(0, 'rgba(255, 244, 214, 0.16)');
  lamp.addColorStop(0.35, 'rgba(255, 230, 180, 0.08)');
  lamp.addColorStop(1, 'rgba(255, 230, 180, 0)');
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

  // Soft realistic page shadow — layered for a believable falloff rather
  // than a single hard drop shadow.
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.22)';
  ctx.shadowBlur = 46;
  ctx.shadowOffsetY = 22;
  ctx.fillStyle = pageGlow > 0 ? '#fffdf5' : '#f7f5ee';
  ctx.fillRect(px, py, pw, ph);
  ctx.restore();

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = pageGlow > 0 ? '#fffdf5' : '#f7f5ee';
  ctx.fillRect(px, py, pw, ph);
  ctx.restore();

  // Faint warm lamp-light falloff across the page itself
  const sheen = ctx.createLinearGradient(px, py, px, py + ph);
  sheen.addColorStop(0, 'rgba(255, 240, 200, 0.10)');
  sheen.addColorStop(0.5, 'rgba(255, 240, 200, 0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(px, py, pw, ph);

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

let lastCursorPos = null; // {x, y, fontSize} — used to anchor ink/eraser particle spawns

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

  // Blinking cursor at end of last line, with a small eased "just typed" pulse
  const lastLine = visible[visible.length - 1] || '';
  const cursorX = px + marginX + ctx.measureText(lastLine).width + 2;
  const cursorY = startY + (visible.length - 1) * lineH;
  lastCursorPos = { x: cursorX, y: cursorY, fontSize };

  const blinkOn = Math.floor(performance.now() / 500) % 2 === 0;
  if (blinkOn) {
    const pulse = 1 + 0.35 * (1 - easeOutQuad(cursorEase));
    const cw = Math.round(fontSize * 0.55) * pulse;
    const ch = fontSize * pulse;
    ctx.fillStyle = flashTimer > 0 ? '#2255cc' : '#444';
    ctx.fillRect(cursorX, cursorY - (ch - fontSize) / 2, cw, ch);
  }

  ctx.textBaseline = 'alphabetic';
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
    ctx.fillStyle = `rgba(35, 35, 35, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Eraser dust puffs (Backspace) ──────────────────────────────────────────

function spawnEraserPuff(x, y) {
  const parts = [];
  const n = 14;
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2;
    const speed = 0.4 + Math.random() * 1.1;
    parts.push({
      x: 0, y: 0,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed - 0.3,
      size: 0.8 + Math.random() * 1.6,
    });
  }
  eraserPuffs.push({ x, y, life: 0, maxLife: 28, particles: parts });
  // Cap total puff particle count across all active puffs
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
    ctx.fillStyle = `rgba(200, 190, 170, ${(alpha * 0.6).toFixed(3)})`;
    for (const p of puff.particles) {
      ctx.beginPath();
      ctx.arc(puff.x + p.x, puff.y + p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
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
  cursorEase = 0; // restart the eased "just typed" cursor pulse

  const anchor = lastCursorPos;

  if (key === 'Backspace') {
    text = text.slice(0, -1);
    flashTimer = 8;
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
