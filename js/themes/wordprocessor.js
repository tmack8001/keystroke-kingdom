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

import { finaleLinesForRatio } from '../finale-quote.js';
import { getWinRatio } from '../settings.js';

let canvas, ctx, animId;
let active = false, victoryMode = false;
let text = '';
// Level 25 finale (js/finale-quote.js): when the guaranteed manifesto block
// begins, main.js calls beginFinale(). It starts the manifesto as its OWN clean
// paragraph on a fresh line (so it never crams against the warm-up text) and
// clamps the visible document to the TOP BAND above the prompt panel, so the
// passage scrolls cleanly there and old text never wraps behind the prompt
// (Trevor 2026-07-27; layout contract in .claude/rules/visual-validation.md).
let finaleActive = false;
let progressCount = 0;   // counts keystrokes toward the win gate (Backspace too)
let flashTimer = 0;
let pageGlow = 0;
let frame = 0;

// Finale sub-line boundaries (Task 3 — display-only word separation). The manifesto
// arrives as ≤17-char PROMPT sub-lines typed with NO trailing space (finale-quote.js
// keeps them apostrophe/space-exact for the player-typed prompt + its join test), so
// adjacent sub-lines would concatenate in the decorative document ("outsmartingyou").
// The theme reconstructs the sub-line lengths for the active EXPERIENCE tier and
// inserts ONE space in the ACCUMULATED document text at each sub-line boundary — the
// prompt the player types and the win-gate are untouched (theme-authoring: themes
// respond to hooks, never gate input). winRatio is captured in start() so it matches
// the value main.js used to build the finale block (no mid-level desync).
let finaleWinRatio = 1;
let finaleSubLens = [];  // char length of each finale sub-line, in type order
let finaleSubIdx = 0;    // which sub-line we're currently accumulating
let finaleCharsInSub = 0;// chars typed into the current sub-line

// "hello world" easter egg (Task 4 — easter-eggs.md #6). The guaranteed L25 history
// card word 'hello world' gets typed in real play; when the accumulated document
// first contains it, print a one-time gentle homage. A latch → fires at most once;
// canvas fillText of a FIXED literal only (security.md rule 1 — never a DOM sink).
let helloEggFired = false;
let helloEggTimer = 0;   // frames the homage stays on screen (fades in/out)
const HELLO_EGG_FRAMES = 320; // ~5s at 60fps, then gone — never gates flow

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
  finaleActive = false;
  finaleWinRatio = 1;
  finaleSubLens = [];
  finaleSubIdx = 0;
  finaleCharsInSub = 0;
  helloEggFired = false;
  helloEggTimer = 0;
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

// Word-wrap, honoring explicit '\n' as HARD line breaks (so beginFinale can start
// the manifesto on its own fresh line/paragraph). Each newline-delimited segment
// is wrapped independently; an empty segment (from '\n\n') yields a blank line,
// giving a clean paragraph gap.
function wrapText(str, maxCharsPerLine) {
  const out = [];
  str.split('\n').forEach((segment) => {
    if (segment === '') { out.push(''); return; }
    const words = segment.split(' ');
    let cur = '';
    words.forEach((w) => {
      const candidate = cur.length ? cur + ' ' + w : w;
      if (candidate.length > maxCharsPerLine && cur.length) {
        out.push(cur);
        cur = w;
      } else {
        cur = candidate;
      }
    });
    out.push(cur);
  });
  return out;
}

let lastCursorPos = null; // {x, y, fontSize}

function drawText(W, H, px, py, pw, ph) {
  // During the finale, a slightly smaller font lets ~2 lines fit in the thin top
  // band above the prompt panel (see the region clamp below).
  const fontSize = finaleActive
    ? Math.max(11, Math.floor(pw * 0.014))
    : Math.max(13, Math.floor(pw * 0.020));
  const lineH = Math.round(fontSize * 1.7);
  const marginX = Math.round(pw * 0.05);
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textAlign = 'left';        // explicit — canvas 2D state leaks between draws (journal L28)
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#242a33';

  // Wrap width is MEASURED, never assumed. This used to divide by `fontSize * 0.62`,
  // which overestimated the line length by ~61%: Press Start 2P is monospace with an
  // advance of exactly 1.0x fontSize (measured, not guessed — ctx.measureText on a
  // 20-char run returns 16px/char at 16px and 23px/char at 23px). The bad constant was
  // invisible at the default EXPERIENCE tier because the coda's visible text never needs
  // to wrap there, but at 1.5x and above the document ran past the paper's right edge,
  // slid under the reserved top-right HUD stats region and spilled off-canvas — a
  // violation of the theme layout contract in .claude/rules/visual-validation.md.
  // measureText covers the webfont AND the 'monospace' fallback (which is NOT 1.0), so
  // this stays correct if Press Start 2P hasn't loaded yet on the first frames.
  const advance = ctx.measureText('M').width || fontSize;
  const maxCharsPerLine = Math.max(20, Math.floor((pw - marginX * 2) / advance));

  const lines = wrapText(text, maxCharsPerLine);

  // The text region (all canvas-space fractions — never DOM measurement, L16):
  //  • normal play → the page body below the ruler, down to just above the
  //    keyboard guide (unchanged look, top-anchored);
  //  • finale → clamp to the TOP BAND above the prompt panel (~0.17H) and
  //    BOTTOM-anchor, so the manifesto scrolls cleanly there and old text never
  //    wraps behind the prompt (Trevor 2026-07-27).
  let regionTop, regionBottom;
  if (finaleActive) {
    regionTop = Math.round(py + ph * 0.14);
    regionBottom = Math.round(H * 0.155);
  } else {
    regionTop = Math.round(py + ph * 0.22);
    regionBottom = (py + ph) - lineH;
  }
  const maxLines = Math.max(1, Math.floor((regionBottom - regionTop) / lineH));
  const visible = lines.slice(-maxLines);
  // Bottom-anchor during the finale (newest line hugs just above the prompt);
  // top-anchor otherwise. Clamped so a single wrapped line still lands coherently.
  const baseY = finaleActive
    ? regionBottom - visible.length * lineH
    : regionTop;
  visible.forEach((line, i) => {
    ctx.fillText(line, px + marginX, baseY + i * lineH);
  });

  // Blinking cursor at end of last line with a small eased "just typed" pulse.
  const lastLine = visible[visible.length - 1] || '';
  const cursorX = px + marginX + ctx.measureText(lastLine).width + 2;
  const cursorY = baseY + (visible.length - 1) * lineH;
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

// The "hello world" homage — a fixed literal (never a user string), drawn warm and
// gold in the desk's bottom strip (below the keyboard guide, clear of the progress
// badge), fading in and out. Parent-winking, kid-safe, and it never blocks anything.
const HELLO_EGG_LINE = "EVERY PROGRAMMER'S FIRST WORDS. WELCOME TO THE CLUB.";
function drawHelloEgg(W, H) {
  const t = 1 - helloEggTimer / HELLO_EGG_FRAMES; // 0 → 1 over its life
  // Gentle fade in over the first ~12%, hold, fade out over the last ~30%.
  let alpha;
  if (t < 0.12) alpha = t / 0.12;
  else if (t > 0.70) alpha = Math.max(0, (1 - t) / 0.30);
  else alpha = 1;
  alpha = Math.min(1, alpha) * 0.92;

  const fs = Math.max(9, Math.floor(W * 0.0092)); // small, fits ~52 chars well inside W
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${fs}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ffd766';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#ffe9a6';
  const gy = Math.round(H * 0.885); // bottom strip, below the keyboard guide (~0.82H)
  // A tiny star flourish either side, era-arcade and warm — not alarming.
  ctx.fillText('★  ' + HELLO_EGG_LINE + '  ★', W * 0.5, gy);
  ctx.restore();
  // reset shared 2D text state (canvas state leaks between screens — journal L28)
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowBlur = 0;
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
  if (helloEggTimer > 0) { drawHelloEgg(W, H); helloEggTimer--; }

  if (flashTimer > 0) flashTimer--;
  if (pageGlow > 0) pageGlow--;
  if (cursorEase < 1) cursorEase = Math.min(1, cursorEase + 0.08);

  animId = requestAnimationFrame(render);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function start() {
  init();
  // Resolve the EXPERIENCE win-ratio ONCE at level start (theme-authoring.md), so the
  // finale sub-line lengths we reconstruct in beginFinale() match the block main.js
  // built at the same level-load moment — no mid-session desync of the boundary spaces.
  finaleWinRatio = getWinRatio();
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
  } else if ((key === ' ') || (key && key.length === 1)) {
    // Task 3 (display only): during the finale, sub-lines are typed with no trailing
    // space, so before the FIRST char of a new sub-line we insert one space in the
    // document — the manifesto then reads as natural prose ("outsmarting you", never
    // "outsmartingyou"). Only the decorative document text changes; the prompt the
    // player types and the win-gate (progressCount, above) are untouched.
    if (finaleActive
        && finaleSubIdx < finaleSubLens.length
        && finaleCharsInSub >= finaleSubLens[finaleSubIdx]) {
      text += ' ';
      finaleSubIdx++;
      finaleCharsInSub = 0;
    }
    if (key === ' ') {
      text += ' ';
      flashTimer = 4;
    } else {
      text += key;
      flashTimer = 6;
      if (anchor) spawnInk(anchor.x, anchor.y, anchor.fontSize);
    }
    if (finaleActive) finaleCharsInSub++;

    // Task 4 — "hello world" easter egg (easter-eggs.md #6): the guaranteed L25
    // history card word 'hello world' (lowercase, real space) lands contiguously in
    // the document. First time the accumulated text contains it, print the one-time
    // homage. Latched → fires at most once per play; a canvas draw only, so it never
    // gates flow, never touches the win-gate, and is independent of the card's own
    // gold-glint and the manifesto finale.
    if (!helloEggFired && text.toLowerCase().includes('hello world')) {
      helloEggFired = true;
      helloEggTimer = HELLO_EGG_FRAMES;
    }
  }
}

export function miss() {}

// Called by main.js (Level 25 only) the moment the "MY STORY" coda begins — the
// first coda line becomes the active prompt. A theme-side RENDER signal only (never
// engine gating — themes respond to hooks, theme-authoring.md): start the coda as
// its OWN clean paragraph on a fresh line, and switch drawText to the top-band clamp
// so the passage no longer wraps behind the prompt. Idempotent; a no-op if already
// active or after victory.
//
// `subLens` is the ordered per-line count of NON-Backspace tokens for every coda
// line (main.js computes it from the assembled coda: story sub-lines, typo beats,
// AND the manifesto capstone — a dynamic, rotating, tier-scaled sequence, so the
// theme can no longer reconstruct it from finale-quote.js alone). It drives the
// display-only boundary space between sub-lines in keystroke(). Backspace tokens are
// excluded because a Backspace never adds a character to the document, and
// finaleCharsInSub (the counter these lengths gate) only counts forward keystrokes.
export function beginFinale(subLens) {
  if (!active || victoryMode || finaleActive) return;
  finaleActive = true;
  if (Array.isArray(subLens) && subLens.length) {
    finaleSubLens = subLens.map(n => (Number.isFinite(n) ? n : 0));
  } else {
    // Legacy/defensive fallback (main.js always passes subLens now): derive the
    // manifesto-only lengths for the active tier. Any bad value → empty list → no
    // boundary spaces, never a crash.
    try {
      finaleSubLens = finaleLinesForRatio(finaleWinRatio).map(l => (Array.isArray(l) ? l.length : 0));
    } catch (_) {
      finaleSubLens = [];
    }
  }
  finaleSubIdx = 0;
  finaleCharsInSub = 0;
  // Break to a fresh paragraph so the manifesto never crams against the warm-up
  // text (the newline is a document-render choice — NOT an Enter keystroke, which
  // is the universal confirm key). A blank line gives a clean paragraph gap.
  if (text.length && !text.endsWith('\n')) text += '\n\n';
}

export function patternComplete() {
  return progressCount >= WIN_KEYSTROKES;
}

export function victory() {
  victoryMode = true;
  // Restore the normal centered page render for the big "THE END." beat (the
  // top-band finale clamp is for the scrolling manifesto, not the celebration).
  finaleActive = false;
  text = 'THE END.';
  pageGlow = 60;
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
