// Level 24: High Score Entry (Present day) — the player types their own name
// CRT gold-on-black arcade high-score table, rendered with modern-era polish:
// volumetric dust motes drifting through the light shaft, a reflective floor
// sheen beneath the table, per-keystroke golden particle bursts, and a bigger
// eased flourish for uppercase (shifted) characters. Every keystroke lands
// with a satisfying, softly-animated payoff.

let canvas, ctx, animId;
let active = false, victoryMode = false;
let entryChars = [];   // characters typed into the live entry row
let flashTimer = 0;    // extra flash when an uppercase (shift) char lands
let flashPeak = 6;     // remembers the starting intensity for easing
let slideT = 0;        // victory: entry row slides into #1 slot
let sparkle = 0;
let frame = 0;

let particles = [];    // per-keystroke golden bursts {x,y,vx,vy,life,maxLife,size,hue}
let motes = [];        // ambient dust motes drifting in the light shaft
let entryPulse = 0;    // eased "just landed a char" scale pulse on the entry row

const WIN_CHARS = 24;
const ENTRY_MAX = 12;
const MAX_PARTICLES = 150;

// Static, pre-filled high score rows (top of the board, above the live entry)
const BOARD = [
  { name: 'ACE', score: 98200 },
  { name: 'ZED', score: 87650 },
  { name: 'MAX', score: 76300 },
  { name: 'JAX', score: 65100 },
  { name: 'REX', score: 54800 },
];

// ─── Easing ─────────────────────────────────────────────────────────────────
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function init() {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  entryChars = [];
  flashTimer = 0;
  flashPeak = 6;
  slideT = 0;
  sparkle = 0;
  frame = 0;
  entryPulse = 0;
  victoryMode = false;
  particles = [];
  motes = buildMotes();
}

function buildMotes() {
  // Precomputed once — drift positions derived deterministically per-frame from seed
  const list = [];
  for (let i = 0; i < 46; i++) {
    list.push({
      seed: Math.random() * 1000,
      speed: 0.08 + Math.random() * 0.22,
      driftAmp: 6 + Math.random() * 18,
      size: 0.6 + Math.random() * 1.6,
      baseX: Math.random(),
      phase: Math.random() * Math.PI * 2,
    });
  }
  return list;
}

// ─── Particles ──────────────────────────────────────────────────────────────

function spawnBurst(x, y, big) {
  const n = big ? 26 : 12;
  for (let i = 0; i < n; i++) {
    if (particles.length >= MAX_PARTICLES) particles.shift();
    const ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
    const speed = (big ? 1.6 : 1.0) + Math.random() * (big ? 2.6 : 1.6);
    particles.push({
      x, y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed - (big ? 0.8 : 0.3),
      life: 0,
      maxLife: (big ? 46 : 30) + Math.random() * 14,
      size: (big ? 2.2 : 1.4) + Math.random() * (big ? 2.2 : 1.4),
      gold: Math.random() > 0.25,
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life++;
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.045; // gentle gravity
    p.vx *= 0.985;
    if (p.life >= p.maxLife) particles.splice(i, 1);
  }
}

function drawParticles() {
  for (const p of particles) {
    const t = p.life / p.maxLife;
    const alpha = 1 - easeOutCubic(t);
    const size = p.size * (1 - t * 0.4);
    ctx.fillStyle = p.gold
      ? `rgba(255, 210, 80, ${alpha})`
      : `rgba(255, 245, 200, ${alpha})`;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 6 * alpha;
    ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
  }
  ctx.shadowBlur = 0;
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

// A soft volumetric light shaft falling from top-center, like a single
// spotlight over the high-score table — gives the modern act its "dynamic
// lighting" signature without any anachronistic 3D.
function drawLightShaft(W, H) {
  ctx.save();
  const topW = W * 0.18, botW = W * 0.62;
  const cx = W / 2;
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(255, 220, 140, 0.14)');
  grad.addColorStop(0.55, 'rgba(255, 200, 100, 0.05)');
  grad.addColorStop(1, 'rgba(255, 200, 100, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx - topW / 2, 0);
  ctx.lineTo(cx + topW / 2, 0);
  ctx.lineTo(cx + botW / 2, H);
  ctx.lineTo(cx - botW / 2, H);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMotes(W, H) {
  const t = performance.now() / 1000;
  ctx.save();
  for (const m of motes) {
    const fall = ((t * m.speed + m.seed) % 1);
    const y = fall * H;
    const x = m.baseX * W * 0.7 + W * 0.15 + Math.sin(t * 0.6 + m.phase) * m.driftAmp;
    const distFromCenter = Math.abs(x - W / 2) / (W / 2);
    const inShaft = Math.max(0, 1 - distFromCenter * 1.4);
    if (inShaft <= 0.02) continue;
    const alpha = inShaft * (0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.3 + m.phase)));
    ctx.fillStyle = `rgba(255, 235, 190, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(x, y, m.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Reflective floor sheen beneath the table — a soft mirrored gradient hinting
// at a glossy surface, modern-era polish over the flat CRT-era board.
function drawFloorSheen(W, H) {
  const floorY = H * 0.86;
  const sheen = ctx.createLinearGradient(0, floorY, 0, H);
  sheen.addColorStop(0, 'rgba(255, 200, 90, 0.10)');
  sheen.addColorStop(0.4, 'rgba(255, 180, 60, 0.035)');
  sheen.addColorStop(1, 'rgba(255, 180, 60, 0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, floorY, W, H - floorY);

  // Faint horizontal reflection streaks (evoke a polished floor without 3D)
  ctx.save();
  ctx.globalAlpha = 0.06 + 0.02 * Math.sin(frame * 0.02);
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const y = floorY + 8 + i * 10;
    ctx.beginPath();
    ctx.moveTo(W * 0.32, y);
    ctx.lineTo(W * 0.68, y);
    ctx.stroke();
  }
  ctx.restore();
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
  ctx.shadowBlur = 14 + Math.sin(frame * 0.05) * 3; // gentle living glow pulse
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

  // Entry text with blinking cursor, eased scale pulse when a char just landed
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  const text = entryChars.join('');
  const blinkOn = Math.floor(performance.now() / 500) % 2 === 0;
  const shown = text + (blinkOn ? '_' : ' ');

  const glow = flashTimer > 0 ? 14 + flashPeak * 1.4 : 10;
  const pulseScale = 1 + 0.14 * easeOutBack(entryPulse);

  ctx.save();
  ctx.translate(W / 2, y);
  ctx.scale(pulseScale, pulseScale);
  ctx.fillStyle = '#ffe066';
  ctx.shadowColor = '#ffe066';
  ctx.shadowBlur = glow;
  ctx.fillText(shown || '_', 0, 0);
  ctx.shadowBlur = 0;
  ctx.restore();

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
  drawLightShaft(W, H);
  drawMotes(W, H);
  drawFloorSheen(W, H);
  drawTitle(W, H);
  drawBoard(W, H);
  drawEntryRow(W, H);
  updateParticles();
  drawParticles();
  if (sparkle > 0) { drawSparkles(W, H); sparkle--; }
  drawProgress(W, H);
  drawCRTLines(W, H);

  if (flashTimer > 0) flashTimer--;
  if (entryPulse < 1) entryPulse = Math.min(1, entryPulse + 0.09);
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
  entryPulse = 0; // restart the eased landing pulse

  const W = canvas ? canvas.width : 0;
  const H = canvas ? canvas.height : 0;
  // The typing UI's DOM scrim panel covers the lower-center of the screen
  // (see .claude/rules/visual-validation.md), so the burst must land on
  // canvas real-estate that's actually visible: the ENTRY progress counter
  // top-left, and the HIGH SCORES title area above the panel.
  const barX = Math.round(W * 0.02) + Math.round(W * 0.2) * 0.5;
  const barY = 14 + 9;
  const titleX = W / 2, titleY = Math.round(H * 0.16);

  // Uppercase (shifted) letters get a bigger flourish — the shift moment
  if (key && /[A-Z]/.test(key)) {
    flashTimer = 14;
    flashPeak = 14;
    spawnBurst(barX, barY, true);
    spawnBurst(titleX, titleY, true);
  } else {
    flashTimer = 6;
    flashPeak = 6;
    spawnBurst(barX, barY, false);
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
  const W = canvas ? canvas.width : 0;
  const H = canvas ? canvas.height : 0;
  spawnBurst(W / 2, Math.round(H * 0.3), true);
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
