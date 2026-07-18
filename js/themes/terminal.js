// Terminal / Command Line — 1960s–∞ — Level 20
// Classic green CRT terminal. Each keystroke types a character. Binary revealed as HELLO.
// This level deliberately stays a minimal CRT — the terminal IS the drama, no scenery —
// but is perfected with era-authentic CRT physics: barrel-curved edges (screens of this
// era were never perfectly flat), phosphor bloom on bright text, and an occasional
// horizontal refresh-line flicker, the way real analog monitors misbehaved.

let canvas, ctx, animId;
let active = false;
let lines = [];
let chars = 0;
let scanY = 0;
let flickerT = 0;
let refreshGlitch = 0; // brief random horizontal glitch line
let bgLayer = null;    // offscreen canvas for the precomputed vignette + curvature mask
let bgLayerW = 0, bgLayerH = 0;
const WIN_CHARS = 25;

// Pre-set terminal lines for atmosphere
const BOOT_LINES = [
  '> SYSTEM READY',
  '> TYPE TO CONTINUE...',
];

const POOL_FRAGMENTS = [
  '> RUN PROGRAM',
  '> LOAD 0x1000',
  '> BIT: 0101',
  '> LOG: OK',
  '> INPUT: _',
  '> 01001000',
  '> 00101010',
  '> HELLO _',
  '> CODE: 10',
  '> STATUS: OK',
  '> ERR: NONE',
  '> ROOT OK',
  '> BYTES: 10',
  '> BIT 1 0',
  '> RUN 10',
  // Hacker-history whispers — see .claude/rules/easter-eggs.md
  '> XYZZY',
  '> 2600 HZ',
  '> ELIZA: HI',
  '> MOTH: 1947',
  '> 42',
];

function init() {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  chars  = 0;
  scanY  = 0;
  flickerT = 0;
  refreshGlitch = 0;

  lines = [...BOOT_LINES];
  buildBarrelMask(canvas.width, canvas.height);
}

// ─── Drawing ──────────────────────────────────────────────────────────────────

// Precompute the barrel/curvature vignette once (and on resize) rather than
// per-frame — a real CRT's glass bows outward, darkening and softening the
// corners more than the center. We approximate that with a radial darkening
// mask that's noticeably stronger at the corners than a plain circular vignette.
function buildBarrelMask(W, H) {
  bgLayer = document.createElement('canvas');
  bgLayer.width = W;
  bgLayer.height = H;
  bgLayerW = W;
  bgLayerH = H;
  const bctx = bgLayer.getContext('2d');

  bctx.fillStyle = 'rgba(0,0,0,0)';
  bctx.fillRect(0, 0, W, H);

  const cx = W / 2, cy = H / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  // Corner darkening — sampled at coarse resolution and upscaled via fillRect
  // blocks (cheap, avoids a full per-pixel pass every frame).
  const step = 16;
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      const dx = (x + step / 2 - cx) / cx;
      const dy = (y + step / 2 - cy) / cy;
      // Barrel falloff: distance in "squared" elliptical space pushes corners
      // darker faster than a simple radial gradient would.
      const d = Math.pow(Math.min(1, Math.sqrt(dx * dx + dy * dy)), 2.2);
      const alpha = d * 0.62;
      if (alpha > 0.01) {
        bctx.fillStyle = `rgba(0,0,0,${alpha})`;
        bctx.fillRect(x, y, step, step);
      }
    }
  }

  // Subtle green-black edge tint to sell the phosphor-glass curvature
  const edgeGrad = bctx.createRadialGradient(cx, cy, maxDist * 0.55, cx, cy, maxDist);
  edgeGrad.addColorStop(0, 'rgba(0,20,0,0)');
  edgeGrad.addColorStop(1, 'rgba(0,25,5,0.35)');
  bctx.fillStyle = edgeGrad;
  bctx.fillRect(0, 0, W, H);
}

function drawScreen(W, H) {
  if (bgLayerW !== W || bgLayerH !== H) buildBarrelMask(W, H);

  // Deep black background
  ctx.fillStyle = '#000400';
  ctx.fillRect(0, 0, W, H);

  // Subtle phosphor vignette (soft glow toward center, kept from the original feel)
  const vign = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, Math.max(W, H) * 0.75);
  vign.addColorStop(0, 'rgba(0,0,0,0)');
  vign.addColorStop(1, 'rgba(0,20,0,0.5)');
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, W, H);
}

// Composited last (on top of text) so the curvature darkening reads as glass
// in front of the phosphor, not behind it — precomputed mask, single drawImage.
function drawBarrelCurvature() {
  if (!bgLayer) return;
  ctx.drawImage(bgLayer, 0, 0);
}

function drawScanLine(W, H) {
  // Horizontal scan sweep
  scanY = (scanY + 0.8) % H;
  const sGrad = ctx.createLinearGradient(0, scanY - 10, 0, scanY + 10);
  sGrad.addColorStop(0, 'rgba(57, 255, 20, 0)');
  sGrad.addColorStop(0.5, 'rgba(57, 255, 20, 0.07)');
  sGrad.addColorStop(1, 'rgba(57, 255, 20, 0)');
  ctx.fillStyle = sGrad;
  ctx.fillRect(0, scanY - 10, W, 20);
}

function drawCRTLines(W, H) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  for (let y = 0; y < H; y += 3) {
    ctx.fillRect(0, y, W, 1);
  }
}

// Occasional single-frame horizontal refresh glitch — the way an old analog
// monitor's sync would hiccup for an instant. Rare and brief; never obscures text.
function updateRefreshGlitch(W, H) {
  flickerT++;
  if (refreshGlitch > 0) {
    ctx.globalAlpha = refreshGlitch;
    ctx.fillStyle = 'rgba(140, 255, 120, 0.5)';
    ctx.fillRect(0, glitchY, W, 2);
    ctx.globalAlpha = 1;
    refreshGlitch -= 0.25;
  } else if (flickerT % 240 === 0 && Math.random() < 0.6) {
    refreshGlitch = 1;
    glitchY = Math.random() * H;
  }
}
let glitchY = 0;

function drawTerminalLines(W, H) {
  const fontSize = Math.max(10, Math.floor(W * 0.013));
  const lineH    = Math.round(fontSize * 1.8);
  const marginX  = Math.round(W * 0.06);
  const startY   = Math.round(H * 0.12);
  const maxLines = Math.floor((H * 0.78) / lineH);

  // Show only the last maxLines lines
  const visibleLines = lines.slice(-maxLines);

  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textBaseline = 'top';
  // Left column status text must draw left-aligned FROM marginX — the
  // canvas is shared across screens, and the immediately-prior screen
  // (keyboard-preview.js) leaves ctx.textAlign = 'center'. Without resetting
  // it here, these lines render centered ON marginX instead of starting
  // there, clipping their left half off the viewport (see visual-validation
  // fix: Level 20 terminal left-clip). Always set it explicitly rather than
  // depending on other modules' cleanup.
  ctx.textAlign = 'left';

  visibleLines.forEach((line, i) => {
    const y = startY + i * lineH;
    const isLast = i === visibleLines.length - 1;

    // Dim older lines
    const age = visibleLines.length - 1 - i;
    const alpha = Math.max(0.25, 1 - age * 0.1);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    // Phosphor bloom on the active (brightest) line: a wide soft under-glow
    // pass plus a tight sharp pass on top — real phosphor bleeds light into
    // the glass around bright characters, it doesn't just get a bigger blur.
    if (isLast) {
      ctx.shadowBlur = 16;
      ctx.globalAlpha = alpha * 0.5;
      ctx.fillText(line, marginX, y);
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = 6;
      ctx.fillText(line, marginX, y);
    } else {
      ctx.shadowBlur = 3;
      ctx.fillText(line, marginX, y);
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  });

  // Cursor on last line
  const cursorY = startY + visibleLines.length * lineH;
  const blinkOn = Math.floor(performance.now() / 530) % 2 === 0;
  if (blinkOn) {
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 10;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(marginX, cursorY, Math.round(fontSize * 0.6), fontSize);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 6;
    ctx.fillRect(marginX, cursorY, Math.round(fontSize * 0.6), fontSize);
    ctx.shadowBlur = 0;
  }

  ctx.textBaseline = 'alphabetic';
}

function drawProgress(W, H) {
  const pct = chars / WIN_CHARS;
  const barW = Math.round(W * 0.18);
  const bx = Math.round(W * 0.02);
  const by = 14;

  ctx.font = '7px "Press Start 2P", monospace';
  ctx.textAlign = 'left';   // defensive — see drawTerminalLines note above
  ctx.textBaseline = 'top'; // was default 'alphabetic': by=14 is then the
                             // BASELINE, so ascenders draw above y=14 and
                             // clip against the canvas top edge. 'top' makes
                             // by the glyph top instead, keeping it on-canvas.
  ctx.fillStyle = '#39ff14';
  ctx.shadowColor = '#39ff14';
  ctx.shadowBlur = 4;
  ctx.fillText(`PROGRAM ${chars}/${WIN_CHARS}`, bx, by);
  ctx.shadowBlur = 0;
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = '#001400';
  ctx.fillRect(bx, by + 5, barW, 8);
  ctx.fillStyle = '#39ff14';
  ctx.shadowColor = '#39ff14';
  ctx.shadowBlur = 3;
  ctx.fillRect(bx, by + 5, Math.round(barW * pct), 8);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#1a7a0a';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx + 0.5, by + 5.5, barW - 1, 7);
}

// Special binary → HELLO reveal when reaching WIN_CHARS
function drawBinaryReveal(W, H) {
  const fontSize = Math.max(8, Math.floor(W * 0.011));
  const marginX  = Math.round(W * 0.06);
  const y1 = Math.round(H * 0.72);
  const y2 = Math.round(H * 0.83);

  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textBaseline = 'top';

  // Binary row
  const binStr = '01001000 01000101 01001100 01001100 01001111';
  ctx.fillStyle = '#1a7a0a';
  ctx.shadowColor = '#1a7a0a';
  ctx.shadowBlur = 2;
  ctx.fillText(binStr, marginX, y1);

  // Decoded row
  ctx.fillStyle = '#39ff14';
  ctx.shadowColor = '#39ff14';
  ctx.shadowBlur = 12;
  const decoded = 'H        E        L        L        O';
  ctx.fillText(decoded, marginX, y2);
  ctx.shadowBlur = 0;
  ctx.textBaseline = 'alphabetic';
}

function render() {
  if (!active) return;
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  drawScreen(W, H);
  drawScanLine(W, H);
  drawCRTLines(W, H);
  drawTerminalLines(W, H);
  if (chars >= WIN_CHARS) drawBinaryReveal(W, H);
  drawProgress(W, H);
  updateRefreshGlitch(W, H);
  drawBarrelCurvature();

  animId = requestAnimationFrame(render);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function start() {
  init();
  active = true;
  animId = requestAnimationFrame(render);
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function keystroke(key) {
  if (!active) return;
  chars++;

  // Add a terminal line from the pool occasionally
  if (chars % 3 === 0) {
    const fragment = POOL_FRAGMENTS[chars % POOL_FRAGMENTS.length];
    lines.push(fragment);
  } else {
    // Add character echo
    const last = lines[lines.length - 1] || '';
    if (last.startsWith('>') && !last.endsWith('...')) {
      lines[lines.length - 1] = last + (key || '');
    } else {
      lines.push('> ' + (key || '.'));
    }
  }
}

export function miss() {}

export function patternComplete() {
  return chars >= WIN_CHARS;
}

export function victory() {
  // Add the binary reveal lines
  lines.push('> 01001000 01000101 01001100 01001100 01001111');
  lines.push('> H E L L O');
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
