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

// ─── THE VICTORY CELEBRATION — "the first program runs" ─────────────────────
//
// This level had NO celebration. `victory()` pushed two lines into the scrolling
// log and returned undefined, so the engine fell back to its legacy fixed 4000ms
// hold — which `.claude/rules/theme-authoring.md` names exactly: a victory()
// without a real animation is "4 seconds of dead air — a product violation".
// On THIS level that is the worst place in the game for it: `levels/act4.md` calls
// the binary→HELLO beat *"the whole game has been building here… Letters are
// numbers. Numbers are electricity. Typing is computation."*
//
// So the celebration IS that sentence, performed: the log wipes, the machine
// types its own binary back one byte at a time, and each byte then RESOLVES into
// the letter it encodes. Nothing is imported from a later era — a terminal's only
// spectacle is text, a cursor and phosphor bloom, which is the honest 1960s–∞
// vocabulary for this cabinet and needs no sprite to be a real animation.
const VICTORY_MS = 5200;
const HELLO_BYTES = ['01001000', '01000101', '01001100', '01001100', '01001111'];
const HELLO_CHARS = ['H', 'E', 'L', 'L', 'O'];
let victoryStartMs = -1;    // performance.now() at victory(); -1 = not celebrating

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
  // Measured 2026-09-13: the note below is right about baselines and the fix was
  // real, but it moved the text from y~7-14 to y~14-21 — straight underneath the
  // HUD badge, which visual-validation.md RESERVES at ~0.02-0.11W x 0.02-0.07H
  // (y 16-56 at 800px tall). The glyphs were not clipped by the canvas at all;
  // they were occluded by a DOM panel. Moved clear of the badge, into the top
  // band's free span between the two HUD corners.
  const bx = Math.round(W * 0.13);
  const by = 12;

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
  ctx.fillRect(bx, by + 11, barW, 8);
  ctx.fillStyle = '#39ff14';
  ctx.shadowColor = '#39ff14';
  ctx.shadowBlur = 3;
  ctx.fillRect(bx, by + 11, Math.round(barW * pct), 8);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#1a7a0a';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx + 0.5, by + 11.5, barW - 1, 7);
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


// The celebration, staged. Every beat is a function of CLAMPED ELAPSED MILLISECONDS
// (journal L36), never of a frame counter: the earlier version counted rAF frames,
// so at 60fps every beat had landed by ~2s and the last ~2.8s of the window were a
// single static frame (a 2026-10-29 persona playtest caught it: "HELLO just
// brightens"). A throttled frame anywhere in the run still lands coherently.
//
//      0-1000   the machine types the binary back, one byte at a time
//   1000-2000   each byte RESOLVES into its letter, with a phosphor flash
//   2000-2500   the prompt comes back and types RUN
//   2500-end    the program RUNS: HELLO pours down the whole screen, line after
//               line, the way a terminal answers a program that says hello —
//               the machine saying it back, over and over, delighted
//
// Nothing here asserts history — no language, no listing, no year. A terminal's
// whole vocabulary is text, a cursor and phosphor, and that is all this uses.
const RUN_AT = 2000;
const FLOOD_AT = 2500;
const FLOOD_LINE_MS = 60;

function drawVictory(W, H, e) {
  const cx = W / 2;
  const fontBin = Math.max(8, Math.floor(W * 0.011));
  const fontBig = Math.max(22, Math.floor(W * 0.040));
  const fontFlood = Math.max(9, Math.floor(W * 0.012));

  // ── the program's output, pouring in behind everything ──
  if (e >= FLOOD_AT) {
    const n = Math.floor((e - FLOOD_AT) / FLOOD_LINE_MS) + 1;
    const lineH = Math.round(fontFlood * 1.9);
    const bottom = H * 0.95;
    const rows = Math.ceil(H / lineH) + 1;
    ctx.font = `${fontFlood}px "Press Start 2P", monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const unit = 'HELLO   ';
    const unitW = ctx.measureText(unit).width || fontFlood * 8;
    for (let k = Math.max(0, n - rows); k < n; k++) {
      const age = n - 1 - k;
      const y = bottom - age * lineH;
      if (y < -lineH) continue;
      const fresh = age === 0;
      ctx.globalAlpha = Math.max(0.22, 1 - age * 0.05);
      ctx.fillStyle = fresh ? '#d8ffc8' : '#39ff14';
      ctx.shadowColor = '#39ff14';
      ctx.shadowBlur = fresh ? 14 : 3;
      // Each line starts a little further along, so the flood ripples diagonally.
      const shift = -((k * 3) % 8) * (unitW / 8);
      for (let x = W * 0.02 + shift; x < W; x += unitW) ctx.fillText('HELLO', x, y);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    // A plate behind the big word so the flood never swallows it.
    const pw = W * 0.46, ph = H * 0.36;
    ctx.fillStyle = 'rgba(0,6,0,0.88)';
    ctx.fillRect(cx - pw / 2, H * 0.29, pw, ph);
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - pw / 2, H * 0.29, pw, ph);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // ── the binary, typing itself in ──
  const bytesF = Math.min(HELLO_BYTES.length, e / 200);
  const bytesShown = Math.floor(bytesF);
  const partial = Math.min(8, Math.floor((bytesF - bytesShown) * 9));
  let binLine = HELLO_BYTES.slice(0, bytesShown).join(' ');
  if (bytesShown < HELLO_BYTES.length) binLine += (binLine ? ' ' : '') + HELLO_BYTES[bytesShown].slice(0, partial);
  ctx.font = `${fontBin}px "Press Start 2P", monospace`;
  ctx.fillStyle = '#2fbf12';
  ctx.shadowColor = '#39ff14';
  ctx.shadowBlur = 3;
  ctx.fillText(binLine, cx, H * 0.36);
  if (e < 1000 && Math.floor(e / 160) % 2 === 0) {
    const w = ctx.measureText(binLine).width;
    ctx.fillRect(cx + w / 2 + 4, H * 0.36 - fontBin * 0.5, fontBin * 0.6, fontBin);
  }
  ctx.shadowBlur = 0;

  // ── each byte resolving into its letter ──
  // Spaced across the span the binary occupies, so each letter lands UNDER the
  // eight bits that encode it — the encoding made legible.
  ctx.save();
  ctx.font = `${fontBin}px "Press Start 2P", monospace`;
  const binW = ctx.measureText(HELLO_BYTES.join(' ')).width;
  ctx.restore();
  const step = binW / HELLO_CHARS.length;
  const x0 = cx - binW / 2 + step / 2;
  const breathe = e > FLOOD_AT ? 1 + 0.06 * Math.sin((e - FLOOD_AT) / 140) : 1;
  ctx.font = `${fontBig}px "Press Start 2P", monospace`;
  for (let i = 0; i < HELLO_CHARS.length; i += 1) {
    const born = 1000 + i * 190;
    if (e < born) continue;
    const age = e - born;
    const pop = age < 260 ? 1 + (1 - age / 260) * 0.6 : breathe;
    const lx = x0 + i * step, ly = H * 0.47;
    // The arrival flash — additive, so it actually reads as LIGHT on black (L35).
    if (age < 420) {
      const k = 1 - age / 420;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, fontBig * (1.2 + (1 - k) * 1.6));
      g.addColorStop(0, `rgba(220,255,200,${0.85 * k})`);
      g.addColorStop(0.4, `rgba(57,255,20,${0.45 * k})`);
      g.addColorStop(1, 'rgba(57,255,20,0)');
      ctx.fillStyle = g;
      ctx.fillRect(lx - fontBig * 3, ly - fontBig * 3, fontBig * 6, fontBig * 6);
      ctx.restore();
    }
    ctx.save();
    ctx.translate(lx, ly);
    ctx.scale(pop, pop);
    ctx.fillStyle = age < 200 ? '#eaffdf' : '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = age < 400 ? 30 : 14;
    ctx.fillText(HELLO_CHARS[i], 0, 0);
    ctx.restore();
  }
  ctx.shadowBlur = 0;

  // ── RUN ──
  if (e >= RUN_AT) {
    const typed = 'RUN'.slice(0, Math.min(3, Math.floor((e - RUN_AT) / 110) + 1));
    ctx.font = `${fontBin}px "Press Start 2P", monospace`;
    ctx.fillStyle = '#39ff14';
    ctx.textAlign = 'center';
    ctx.fillText('> ' + typed + (e < FLOOD_AT && Math.floor(e / 160) % 2 ? '_' : ''), cx, H * 0.565);
  }

  // ── the line that names what just happened ──
  if (e > FLOOD_AT + 300) {
    const fade = Math.min(1, (e - FLOOD_AT - 300) / 400);
    ctx.font = `${Math.max(9, Math.floor(W * 0.012))}px "Press Start 2P", monospace`;
    ctx.fillStyle = `rgba(200,255,180,${fade.toFixed(3)})`;
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 8;
    ctx.fillText('YOUR FIRST PROGRAM', cx, H * 0.625);
    ctx.shadowBlur = 0;
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// ─── The white rabbit — Act 4 easter egg ─────────────────────────────────────
// ".claude/rules/easter-eggs.md": "In Act 4 (late-90s Command Center), a small
// white pixel rabbit very rarely hops across the bottom of the screen between
// patterns. Follows nothing. Explains nothing." (The Matrix, 1999 — era-correct
// for the Command Center, and the film's own white rabbit appears on a screen.)
//
// It lives HERE and is imported by the other four Command Center themes
// (simcity / goldeneye / ageofempires / ff7) so the act shares ONE rabbit rather
// than five copies — it belongs to the ROOM, not to any single cabinet. Only one
// theme is ever active at a time, so a single module-level state is correct.
//
// Design law it must obey:
//   • Never interrupts flow — no text, no sound, no reward, no counter, nothing
//     clickable, nothing collectible. It hops across and is gone.
//   • Never competes with the letter being read — it is spawned only at a
//     PATTERN BOUNDARY (from patternComplete(), the one moment the engine gives a
//     theme between words) and it stays in the bottom strip — its box spans
//     ~0.89H (hop apex) to 0.95H, entirely below the keyboard guide (measured
//     bottom edge 0.823H) and nowhere near the prompt panel (0.19–0.43H).
//   • Very rare — a 1-in-150 roll per pattern boundary, at most ONCE per level
//     play, and never on the winning boundary (it must not crash the celebration).
//   • Frame-driven math is clamped (journal F1): position derives from clamped
//     elapsed time, so a throttled frame lands coherently instead of off in space.
const RABBIT_MS = 2800;          // full crossing duration
const RABBIT_CHANCE = 1 / 150;   // per pattern boundary
const RABBIT_MIN_BOUNDARIES = 2; // never in the first moments of a level
const RABBIT_HOPS = 9;

let rabbit = null;          // { startMs, dir } while crossing, else null
let rabbitSeen = false;     // once-per-play latch
let rabbitBoundaries = 0;

// Two-frame pixel bunny, facing RIGHT (mirrored for a right-to-left crossing).
// '#' = white pixel. Frame A = mid-leap (ears swept back, legs tucked),
// frame B = landed (ears up, legs down).
const RABBIT_LEAP = [
  '......#.#....',
  '.......#.#...',
  '........###..',
  '........####.',
  '..####..##.##',
  '.############',
  '.############',
  '############.',
  '##.......##..',
];
const RABBIT_LAND = [
  '.........#.#.',
  '.........#.#.',
  '.........#.#.',
  '........####.',
  '..####..##.##',
  '.############',
  '.############',
  '.###########.',
  '.##....###...',
];

// Called by every Act 4 theme from start() — a fresh play gets a fresh chance.
export function resetWhiteRabbit() {
  rabbit = null;
  rabbitSeen = false;
  rabbitBoundaries = 0;
}

// Called by every Act 4 theme from patternComplete(), passing that theme's win
// state. Purely cosmetic: it never touches, gates, or delays the win.
export function maybeWhiteRabbit(won) {
  rabbitBoundaries++;
  if (won || rabbitSeen || rabbit) return;
  if (rabbitBoundaries < RABBIT_MIN_BOUNDARIES) return;
  if (Math.random() >= RABBIT_CHANCE) return;
  rabbit = { startMs: performance.now(), dir: Math.random() < 0.5 ? 1 : -1 };
  rabbitSeen = true;
}

// Drawn late in each theme's render loop. Takes the drawing context explicitly
// (never reaches for another module's canvas state) and leaves no ctx state
// behind — canvas 2D state leaks between screens (journal L28).
export function drawWhiteRabbit(c, W, H) {
  if (!rabbit || !c) return;
  const t = (performance.now() - rabbit.startMs) / RABBIT_MS;
  if (t >= 1) { rabbit = null; return; }
  const p = Math.min(1, Math.max(0, t));   // clamp EVERY frame-driven value (F1)

  const unit = Math.max(2, Math.round(H * 0.004));
  const spriteW = RABBIT_LEAP[0].length * unit;
  // Travel fully off-canvas on both ends so it never pops into existence.
  const travel = W + spriteW * 2.5;
  const startX = rabbit.dir > 0 ? -spriteW * 1.25 : W + spriteW * 0.25;
  const x = startX + rabbit.dir * travel * p;

  const groundY = H * 0.95;   // feet line — bottom strip, below every UI panel
  const hopPhase = p * RABBIT_HOPS;
  const hop = Math.abs(Math.sin(hopPhase * Math.PI));
  const y = groundY - hop * H * 0.026;
  const frame = hop > 0.22 ? RABBIT_LEAP : RABBIT_LAND;

  c.save();
  // A soft dark backing pass first so a white bunny still reads over a bright
  // scene (the SimCity skyline) as well as over a dark one.
  drawRabbitFrame(c, frame, x + 1, y + 1, unit, rabbit.dir, 'rgba(0,0,0,0.45)');
  drawRabbitFrame(c, frame, x, y, unit, rabbit.dir, '#f4f7ff');
  c.restore();
}

function drawRabbitFrame(c, frame, x, y, unit, dir, color) {
  const cols = frame[0].length;
  const rows = frame.length;
  const top = y - rows * unit;
  c.fillStyle = color;
  for (let r = 0; r < rows; r++) {
    const line = frame[r];
    for (let col = 0; col < cols; col++) {
      if (line[col] !== '#') continue;
      const cx = dir > 0 ? col : (cols - 1 - col);
      c.fillRect(Math.round(x + cx * unit), Math.round(top + r * unit), unit, unit);
    }
  }
}

// ─── The Y2K clock — Act 4 easter egg ────────────────────────────────────────
// ".claude/rules/easter-eggs.md": "One monitor in the Command Center background
// always reads 12/31/99 11:59 PM. Never explained. (For the parents who
// remember.)" This terminal IS that monitor — it is the only screen rendered in
// the Command Center, and this act's hidden-history layer (the POOL_FRAGMENTS
// whispers above) already lives here.
//
// It is set dressing, not an event: a fixed code literal, drawn every frame,
// frozen — it never ticks, never animates, is never referenced by anything, and
// nothing in the game ever mentions it. It sits in the bottom-right stage corner
// (right margin 0.78–1.0W × bottom strip 0.81–1.0H), dim enough to read as a
// status corner rather than a prompt, bright enough for a parent to actually
// read. Fixed literal string only — never a DOM sink (security.md rule 1).
const Y2K_CLOCK = '12/31/99 11:59 PM';

function drawY2KClock(W, H) {
  const fontSize = Math.max(8, Math.round(W * 0.0085));
  ctx.save();
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textAlign = 'right';     // explicit — canvas state leaks between screens (L28)
  ctx.textBaseline = 'alphabetic';
  ctx.globalAlpha = 0.72;
  ctx.fillStyle = '#39ff14';
  ctx.shadowColor = '#39ff14';
  ctx.shadowBlur = 5;
  ctx.fillText(Y2K_CLOCK, Math.round(W * 0.962), Math.round(H * 0.888));
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();
}

function render() {
  if (!active) return;
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  drawScreen(W, H);
  drawScanLine(W, H);
  drawCRTLines(W, H);
  if (victoryStartMs >= 0) {
    // The celebration owns the screen. The progress counter and the idle-only
    // eggs are deliberately NOT drawn: the rabbit must never arrive on the
    // winning beat (easter-eggs.md), and a progress bar reading 25/25 next to
    // the payoff is clutter at the one moment the screen should be quiet.
    const e = Math.min(VICTORY_MS, Math.max(0, performance.now() - victoryStartMs));
    drawVictory(W, H, e);
    drawBarrelCurvature();
    animId = requestAnimationFrame(render);
    return;
  }

  drawTerminalLines(W, H);
  if (chars >= WIN_CHARS) drawBinaryReveal(W, H);
  drawProgress(W, H);
  drawY2KClock(W, H);
  // Drawn under the barrel glass so both eggs sit behind the CRT's curvature
  // like everything else on this screen.
  drawWhiteRabbit(ctx, W, H);
  updateRefreshGlitch(W, H);
  drawBarrelCurvature();

  animId = requestAnimationFrame(render);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function start() {
  init();
  resetWhiteRabbit();
  victoryStartMs = -1;
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
  const won = chars >= WIN_CHARS;
  maybeWhiteRabbit(won);   // cosmetic only — never gates or delays the win
  return won;
}

export function victory() {
  // The log is cleared, not appended to: the machine stops echoing the player and
  // starts speaking for itself. That hand-over is the whole point of the beat.
  lines = [];
  victoryStartMs = performance.now();
  return VICTORY_MS;
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
