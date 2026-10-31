// Mystery Cabinet reveal cinematic — triggered after Level 5 (Joust) completion.
// Runs on the shared #invaders-canvas. ~50 seconds, skippable to title card.

import * as Audio from './audio.js';
import * as Slots from './slots.js';

let canvas, ctx;
let animId = null;
let active = false;
let startTime = 0;
let onDone = null;       // called when user presses Space on title card
let audioCtx = null;
let crtHumNode = null;
let chordNodes = [];
let skipped = false;
// Replay-only skipping (transitions.md: "Skippable after first completion").
// main.js passes { skippable } from progress read BEFORE the level was recorded.
let skippable = false;

// DOM elements we defensively hide for the duration of the cinematic so no
// title-screen markup (logo, INSERT COIN, prompts) can ever bleed through on
// top of the canvas. We record which were already hidden so stop() restores
// the exact prior state and never un-hides something the caller meant to keep
// hidden. main.js also hides all .screen elements before start() — this is a
// belt-and-suspenders guarantee that holds regardless of the caller.
let hiddenByUs = [];

function hideAllScreens() {
  hiddenByUs = [];
  document.querySelectorAll('.screen').forEach(s => {
    if (!s.classList.contains('hidden')) {
      s.classList.add('hidden');
      hiddenByUs.push(s);
    }
  });
}

function restoreHiddenScreens() {
  hiddenByUs.forEach(s => s.classList.remove('hidden'));
  hiddenByUs = [];
}

// Phase boundaries (ms from sequence start)
const P = {
  SILENCE:  { s: 0,     e: 3000  },  // 0 — black, held breath
  PULL:     { s: 3000,  e: 9000  },  // 1 — amber pulse, caution tape falls
  CURTAIN:  { s: 9000,  e: 13000 },  // 2 — curtain drops, boot beeps
  TERMINAL: { s: 13000, e: 25000 },  // 3 — HELLO. YOU FOUND ME. COME IN.
  DOOR:     { s: 25000, e: 33000 },  // 4 — door opens, chord
  TITLECARD:{ s: 33000, e: Infinity },// 5 — waits for Space
};

const PHASE_ORDER = ['SILENCE','PULL','CURTAIN','TERMINAL','DOOR','TITLECARD'];

// ─── Audio ───────────────────────────────────────────────────────────────────

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, dur, type = 'square', vol = 0.06, delay = 0) {
  const c = getAudioCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + delay);
  gain.gain.setValueAtTime(vol, c.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime + delay);
  osc.stop(c.currentTime + delay + dur);
}

function startCRTHum() {
  if (crtHumNode) return;
  const c = getAudioCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(72, c.currentTime);
  gain.gain.setValueAtTime(0.0001, c.currentTime);
  gain.gain.linearRampToValueAtTime(0.025, c.currentTime + 5);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  crtHumNode = { osc, gain };
}

function stopCRTHum() {
  if (!crtHumNode) return;
  const c = getAudioCtx();
  crtHumNode.gain.gain.linearRampToValueAtTime(0.0001, c.currentTime + 1.5);
  crtHumNode.osc.stop(c.currentTime + 1.6);
  crtHumNode = null;
}

function playBootBeeps() {
  // C E G — ascending, clean PC speaker tones
  playTone(523, 0.12, 'square', 0.08, 0.0);
  playTone(659, 0.12, 'square', 0.08, 0.22);
  playTone(784, 0.18, 'square', 0.08, 0.44);
}

function playKeyclick() {
  playTone(440, 0.05, 'square', 0.028);
}

function startChord() {
  const c = getAudioCtx();
  const freqs = [261, 329, 392, 523]; // C4 E4 G4 C5
  chordNodes = freqs.map((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(0.0001, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.018 - i * 0.003, c.currentTime + 1.5);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    return { osc, gain };
  });
}

function stopChord() {
  const c = getAudioCtx();
  chordNodes.forEach(({ osc, gain }) => {
    gain.gain.linearRampToValueAtTime(0.0001, c.currentTime + 2.5);
    osc.stop(c.currentTime + 2.6);
  });
  chordNodes = [];
}

// Phase 5 hinge-and-slide: a low, heavy, WARM slide under the chord — the
// cabinet swinging aside like a bookcase. Two soft low oscillators gliding
// down in pitch; nothing percussive, nothing scary (spec: "not triumphant,
// not a fanfare — just arrival").
function playHingeSlide() {
  const c = getAudioCtx();
  // Main slide: triangle gliding 74 → 52 Hz
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(74, c.currentTime + 0.5);
  osc.frequency.linearRampToValueAtTime(52, c.currentTime + 4.3);
  gain.gain.setValueAtTime(0.0001, c.currentTime + 0.5);
  gain.gain.linearRampToValueAtTime(0.032, c.currentTime + 1.6);
  gain.gain.setValueAtTime(0.032, c.currentTime + 3.4);
  gain.gain.linearRampToValueAtTime(0.0001, c.currentTime + 4.6);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime + 0.5);
  osc.stop(c.currentTime + 4.7);
  // Sub rumble underneath: sine 40 → 34 Hz, quieter
  const sub = c.createOscillator();
  const subGain = c.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(40, c.currentTime + 0.5);
  sub.frequency.linearRampToValueAtTime(34, c.currentTime + 4.3);
  subGain.gain.setValueAtTime(0.0001, c.currentTime + 0.5);
  subGain.gain.linearRampToValueAtTime(0.02, c.currentTime + 1.8);
  subGain.gain.linearRampToValueAtTime(0.0001, c.currentTime + 4.6);
  sub.connect(subGain);
  subGain.connect(c.destination);
  sub.start(c.currentTime + 0.5);
  sub.stop(c.currentTime + 4.7);
}

// ─── Phase detection ─────────────────────────────────────────────────────────

function getPhase(ms) {
  for (let i = PHASE_ORDER.length - 1; i >= 0; i--) {
    const key = PHASE_ORDER[i];
    if (ms >= P[key].s) return i;
  }
  return 0;
}

function phaseT(phaseIdx, ms) {
  const key = PHASE_ORDER[phaseIdx];
  const p = P[key];
  if (p.e === Infinity) return (ms - p.s) / 1000;
  return Math.min(1, (ms - p.s) / (p.e - p.s));
}

// ─── Cabinet geometry (computed relative to W/H each frame) ──────────────────
//
// SINGLE SOURCE OF TRUTH for the mystery cabinet's rect (body + screen),
// scale-parameterized for the Phase 4 dolly-in (revised spec 2026-07-12,
// transitions.md "The Approach" / "The Secret Door"). Every phase calls this
// exclusively via drawCabinetBase() — never recompute cw/ch/sx/sy
// independently, or the phases will drift apart (same lesson as the
// KEY_LAYOUT keyboard-geometry unification in js/ui/hud.js).
//
// scale = 1 is the "corner of the room" size (phases 1-3: pull, curtain).
// Phase 4 dollies scale from 1 to DOLLY.MAX_SCALE (the cabinet dominating
// the frame); phase 5 composes the hinge-aside at MAX_SCALE. All accessories
// (curtain, tape, glow, coin door, marquee, feet) derive from this rect, so
// they track every dolly position automatically.
function cabinetRect(W, H, scale = 1) {
  const cw = Math.round(W * DOLLY.BASE_FRAC * scale);
  const ch = Math.round(cw * 1.55);
  const cx = Math.round(W * 0.5 - cw / 2);
  const cy = Math.round(H * 0.5 - ch * 0.45);
  const sx = cx + Math.round(cw * 0.12);         // screen x
  const sw = cw - Math.round(cw * 0.24);          // screen width
  const sy = cy + Math.round(ch * 0.12);          // screen y
  const sh = Math.round(ch * 0.38);               // screen height
  return { cx, cy, cw, ch, sx, sy, sw, sh };
}

// ─── The dolly (Phase 4 "The Approach") ──────────────────────────────────────
//
// BASE_FRAC 0.17W is the corner-of-the-room cabinet width; MAX_SCALE 2.5 puts
// it at ~0.42W — taller than the frame (it dominates), while the screen rect
// stays fully in frame (screen top = H/2 - ch*0.33 stays > 0 up to ~0.61W).
const DOLLY = {
  BASE_FRAC: 0.17,
  MAX_SCALE: 2.5,
};

function clamp01(u) { return Math.min(1, Math.max(0, u)); }
function smoothstep(u) { u = clamp01(u); return u * u * (3 - 2 * u); }

// Scale curve over the approach: smoothstep ease-in-out over the phase —
// a steady walk that settles, not a zoom. u = normalized phase time (0..1).
function dollyScale(u) {
  return 1 + (DOLLY.MAX_SCALE - 1) * smoothstep(u);
}

// The scale at which the terminal text reaches FULL crispness. Derived from
// the terminal timeline (the moment the last character of the last line —
// "COME IN." — lands), so the spec beat "full crispness lands exactly as
// COME IN. completes" survives any future copy/timing change automatically.
let crispScaleCache = null;
function crispScale() {
  if (crispScaleCache === null) {
    let lastMs = 0;
    TERMINAL_LINES.forEach(line => {
      const end = line.delay + Math.max(0, line.text.length - 1) * 130;
      if (end > lastMs) lastMs = end;
    });
    const phaseLen = P.TERMINAL.e - P.TERMINAL.s;
    crispScaleCache = dollyScale(clamp01(lastMs / phaseLen));
  }
  return crispScaleCache;
}

// Blur is a FUNCTION OF APPARENT DISTANCE (the dolly scale), never a separate
// timer — a paused frame anywhere in the approach reads as a coherent
// distance (spec visual note). 1 = far / full phosphor smear, 0 = arrived /
// crisp. Because dollyScale(u) is monotonic, blur hits 0 exactly when the
// dolly passes crispScale() — the frame "COME IN." completes — and stays 0.
function blurForScale(scale) {
  const cs = crispScale();
  return clamp01((cs - scale) / (cs - 1));
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────

function fillPixelRect(x, y, w, h) {
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawCabinetBase(W, H, glowAlpha = 0, scale = 1) {
  const g = cabinetRect(W, H, scale);

  // Ambient glow behind cabinet
  if (glowAlpha > 0) {
    const rad = ctx.createRadialGradient(
      W / 2, g.cy + g.ch * 0.5, 0,
      W / 2, g.cy + g.ch * 0.5, g.cw * 1.8
    );
    rad.addColorStop(0, `rgba(180, 100, 20, ${glowAlpha})`);
    rad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, W, H);
  }

  // Cabinet body
  ctx.fillStyle = '#0e0808';
  fillPixelRect(g.cx + 4, g.cy, g.cw - 8, g.ch);

  // Side trim
  ctx.fillStyle = '#1a1010';
  fillPixelRect(g.cx, g.cy + 8, 4, g.ch - 8);
  fillPixelRect(g.cx + g.cw - 4, g.cy + 8, 4, g.ch - 8);

  // Top marquee strip (dark — mystery cabinet has no title visible)
  ctx.fillStyle = '#1a0808';
  fillPixelRect(g.cx + 4, g.cy, g.cw - 8, Math.round(g.ch * 0.1));

  // Coin slot + buttons
  ctx.fillStyle = '#222';
  fillPixelRect(g.cx + 8, g.cy + Math.round(g.ch * 0.6), g.cw - 16, Math.round(g.ch * 0.09));
  ctx.fillStyle = '#555';
  fillPixelRect(g.cx + 12, g.cy + Math.round(g.ch * 0.62), 4, 4);
  ctx.fillStyle = '#880000';
  fillPixelRect(g.cx + 10, g.cy + Math.round(g.ch * 0.59), 6, 3);

  // Base / feet
  ctx.fillStyle = '#0a0606';
  fillPixelRect(g.cx + 6, g.cy + g.ch - 10, g.cw - 12, 10);
  ctx.fillStyle = '#111';
  fillPixelRect(g.cx + 10, g.cy + g.ch - 12, 8, 4);
  fillPixelRect(g.cx + g.cw - 18, g.cy + g.ch - 12, 8, 4);

  return g;
}

// ─── Phase 1: Silence ────────────────────────────────────────────────────────

function drawPhase1(t, W, H) {
  // Fade in from black to a very dim view of the dark cabinet
  const alpha = Math.min(1, t * 2);
  ctx.globalAlpha = alpha * 0.3;
  drawCabinetBase(W, H, 0);
  ctx.globalAlpha = 1;
}

// ─── Phase 2: The Pull ────────────────────────────────────────────────────────

// Caution tape: array of segments. Each has a y position (relative 0-1 in screen),
// a fall start time (fraction of phase), fall speed
const TAPE_SEGMENTS = [0.15, 0.38, 0.62, 0.85].map((fy, i) => ({
  fy,
  fallStart: 0.25 + i * 0.12,
  fallSpeed: 0.8 + i * 0.15,
  fallen: false,
}));

function drawCautionTape(g, t) {
  TAPE_SEGMENTS.forEach(seg => {
    const elapsed = Math.max(0, t - seg.fallStart);
    const fall = elapsed * seg.fallSpeed;  // how far it has fallen (in screen-heights)

    if (fall > 1.5) return; // fully off screen

    const tapeY = g.sy + seg.fy * g.sh + fall * g.sh * 2.5;
    const tapeH = Math.round(g.sh * 0.06);

    // Yellow/black diagonal stripe pattern
    ctx.save();
    ctx.beginPath();
    ctx.rect(g.sx, g.sy, g.sw, g.sh);
    ctx.clip();

    const stripeW = Math.round(g.sw / 6);
    for (let s = 0; s < 8; s++) {
      ctx.fillStyle = s % 2 === 0 ? '#ffdd00' : '#1a1a00';
      fillPixelRect(g.sx + s * stripeW, tapeY, stripeW, tapeH);
    }
    ctx.restore();
  });
}

function drawVelvetCurtain(g, dropFraction = 0) {
  // dropFraction: 0 = fully covering screen, 1 = fully fallen
  if (dropFraction >= 1) return;

  const curtainH = Math.round(g.sh * (1 - dropFraction));
  const cols = 8;
  const colW = Math.round(g.sw / cols);

  for (let c = 0; c < cols; c++) {
    const colDropExtra = dropFraction * (c % 2 === 0 ? 0.05 : -0.03); // slight stagger
    const adjustedH = Math.max(0, curtainH - Math.round(g.sh * Math.abs(colDropExtra)));
    const shade = c % 3 === 0 ? '#3d0028' : (c % 3 === 1 ? '#5a0038' : '#480030');
    ctx.fillStyle = shade;
    fillPixelRect(g.sx + c * colW, g.sy, colW - 1, adjustedH);

    // Fold highlights
    if (c % 2 === 0 && adjustedH > 2) {
      ctx.fillStyle = '#7a0050';
      fillPixelRect(g.sx + c * colW, g.sy, 2, adjustedH);
    }
  }
}

function drawPhase2(t, W, H) {
  // Pulsing amber glow: 0.5 Hz breathe
  const breathe = Math.sin(t * Math.PI * 2 * 0.5) * 0.5 + 0.5;
  const glowAlpha = t * 0.3 + breathe * 0.12;

  const g = drawCabinetBase(W, H, glowAlpha);

  // Screen area background (behind curtain)
  ctx.fillStyle = '#0a0505';
  fillPixelRect(g.sx, g.sy, g.sw, g.sh);

  // Velvet curtain (fully on until end of phase)
  drawVelvetCurtain(g, 0);

  // Caution tape falling
  drawCautionTape(g, t);

  // Accent glow lines on cabinet sides
  ctx.globalAlpha = glowAlpha * 0.6;
  ctx.fillStyle = '#cc7722';
  fillPixelRect(g.cx, g.cy + 8, 2, g.ch - 8);
  fillPixelRect(g.cx + g.cw - 2, g.cy + 8, 2, g.ch - 8);
  ctx.globalAlpha = 1;
}

// ─── Phase 3: Curtain Drops ───────────────────────────────────────────────────

let bootBeepsPlayed = false;

function drawPhase3(t, W, H) {
  if (!bootBeepsPlayed) {
    setTimeout(playBootBeeps, 400);
    bootBeepsPlayed = true;
  }

  // Curtain fall accelerates with ease-in
  const curtainDrop = Math.min(1, t * t * 1.8);

  const g = drawCabinetBase(W, H, 0.2);

  // Screen flickers on as curtain clears lower portion
  if (curtainDrop > 0.5) {
    const screenReveal = (curtainDrop - 0.5) * 2;
    const flickerOn = Math.sin(t * 50) > 0.3;
    ctx.fillStyle = flickerOn ? '#001800' : '#000';
    fillPixelRect(g.sx, g.sy, g.sw, g.sh);

    // Green phosphor glow on revealed portion
    if (screenReveal > 0.1 && flickerOn) {
      ctx.globalAlpha = screenReveal * 0.4;
      ctx.fillStyle = '#00ff44';
      fillPixelRect(g.sx, g.sy, g.sw, 2);
      ctx.globalAlpha = 1;
    }
  } else {
    ctx.fillStyle = '#0a0505';
    fillPixelRect(g.sx, g.sy, g.sw, g.sh);
  }

  drawVelvetCurtain(g, curtainDrop);
}

// ─── Phase 4: The Approach (dolly-in + resolving terminal) ───────────────────

const TERMINAL_LINES = [
  { text: 'HELLO.', delay: 500 },
  { text: '',        delay: 2800 },  // blank line pause
  { text: 'YOU FOUND ME.', delay: 5000 },
  { text: '',        delay: 7400 },
  { text: 'COME IN.', delay: 9500 },
];

// Terminal font size in "cabinet space" — the size at dolly scale 1. The
// rendered size is TERMINAL_FONT_BASE * scale: the text is physically ON the
// cabinet's screen, so it rides the dolly with the geometry. Because both
// text width and screen width scale linearly with the dolly, the containment
// ratio is scale-INVARIANT — the original overflow bug is impossible at
// every dolly position by construction. Sized so the longest line
// ("YOU FOUND ME.", 13 chars × 1em advance in Press Start 2P) fits the
// padded screen at scale 1 with margin (avail ≈ 140px vs 130px at 1280w).
const TERMINAL_FONT_BASE = 10;

// Defensive containment check: given the screen rect and the lines this
// frame renders, verify every line fits inside the screen at the requested
// size with the standard padding. If a future copy change ever makes a line
// too long (or integer rounding pinches a tiny dolly scale), scale ALL
// terminal text down together (uniform, not per-line, so the terminal
// doesn't look mismatched) rather than silently clipping or overflowing
// onto the cabinet body.
function fitTerminalFontSize(g, lines, targetSize) {
  const padX = Math.round(g.sw * 0.08);
  const maxTextW = g.sw - padX * 2;
  ctx.font = `${targetSize}px "Press Start 2P", monospace`;
  let widest = 0;
  lines.forEach(line => {
    if (!line) return;
    const w = ctx.measureText(line).width;
    if (w > widest) widest = w;
  });
  if (widest <= maxTextW || widest === 0) return targetSize;
  // Scale down uniformly, floor at 5px.
  return Math.max(5, targetSize * (maxTextW / widest));
}

// Shared terminal-lines renderer — the single place both the approach phase
// (4, live typing with distance blur) and the secret-door phase (5, stable
// crisp state) draw the green CRT text. All positions are relative to the
// SCREEN rect (g.sx/g.sy/g.sw/g.sh), never the cabinet body or the raw
// canvas, so the text always tracks the screen at every dolly scale. Sets
// textAlign/textBaseline explicitly (canvas state leaks between draw
// calls/screens — L28).
//
// blur (0..1) renders the out-of-focus CRT phosphor smear: a fixed, bounded
// set of dithered offset re-draws at low alpha plus a widened shadowBlur
// bloom — era-appropriate "unfocused tube", not a gaussian filter. Cost is
// capped at 7 fillText calls per line regardless of blur amount.
function drawTerminalLines(g, lines, cursor, blur = 0, scale = 1) {
  const fontSize = fitTerminalFontSize(g, lines, TERMINAL_FONT_BASE * scale);
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.fillStyle = '#00ff44';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.shadowColor = '#00ff44';

  const lineH = fontSize + Math.round(fontSize * 0.6);
  const padX = Math.round(g.sw * 0.08);
  const padY = Math.round(g.sh * 0.1);
  const x = g.sx + padX;
  const y = g.sy + padY;

  // Hard containment guarantee: nothing (text, smear passes, bloom, cursor)
  // can render outside the tube. The fit math above is the primary defense;
  // this clip means even the blur passes' glow physically cannot leave the
  // screen rect — phosphor can't escape the glass.
  ctx.save();
  ctx.beginPath();
  ctx.rect(g.sx, g.sy, g.sw, g.sh);
  ctx.clip();

  if (blur > 0.01) {
    // Out-of-focus smear: dithered double-draw offsets, spread ∝ blur.
    const spread = blur * fontSize * 0.55;
    const OFFSETS = [
      [-1, 0], [1, 0], [0, -0.6], [0, 0.6], [-0.7, 0.45], [0.7, -0.45],
    ];
    ctx.globalAlpha = 0.07 + 0.06 * (1 - blur);
    ctx.shadowBlur = 6 + blur * 18;
    OFFSETS.forEach(([ox, oy]) => {
      lines.forEach((line, li) => {
        if (!line) return;
        ctx.fillText(line, x + ox * spread, y + li * lineH + oy * spread);
      });
    });
  }

  // Center pass — fades up to full strength as the blur resolves.
  ctx.globalAlpha = 0.30 + 0.70 * (1 - blur);
  ctx.shadowBlur = 4 + blur * 14;
  lines.forEach((line, li) => {
    ctx.fillText(line, x, y + li * lineH);
  });

  if (cursor && cursor.show) {
    const lastLine = lines[lines.length - 1] || '';
    const lastWidth = ctx.measureText(lastLine).width;
    const cursorY = y + (lines.length - 1) * lineH;
    ctx.fillStyle = '#00ff44';
    fillPixelRect(x + lastWidth + 2, cursorY, Math.round(fontSize * 0.55), fontSize);
  }

  ctx.restore(); // drops the clip and restores globalAlpha/shadow state
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
  return { fontSize, lineH, x, y };
}

// Precompute: per-character timing
let termEvents = null;
function buildTermEvents() {
  if (termEvents) return;
  termEvents = [];
  let ms = 0;
  TERMINAL_LINES.forEach(line => {
    ms = line.delay;
    for (let i = 0; i < line.text.length; i++) {
      termEvents.push({ ms: ms + i * 130, char: line.text[i], lineBreak: i === 0 });
    }
    if (line.text.length === 0 && termEvents.length > 0) {
      termEvents.push({ ms: line.delay, char: null, lineBreak: true });
    }
  });
}

let termClicksPlayed = new Set();

// Phase 4 — "The Approach" (revised 2026-07-12): a slow dolly-in. The
// cabinet grows from its corner-of-the-room size until it dominates the
// frame; the terminal's green glow starts as an out-of-focus phosphor smear
// and resolves to crisp TUI text in lockstep with the dolly (blur is a
// function of scale — see blurForScale). Full crispness lands exactly as
// "COME IN." completes.
function drawPhase4(elapsed, W, H) {
  buildTermEvents();

  const phaseLen = P.TERMINAL.e - P.TERMINAL.s;
  const scale = dollyScale(elapsed / phaseLen);
  const blur = blurForScale(scale);

  const g = drawCabinetBase(W, H, 0.15, scale);

  // Screen background
  ctx.fillStyle = '#001200';
  fillPixelRect(g.sx, g.sy, g.sw, g.sh);

  // Inner screen glow — stronger while unfocused (the smear IS the glow),
  // settling as we arrive. Function of blur, hence of distance.
  ctx.globalAlpha = 0.08 + blur * 0.07;
  ctx.fillStyle = '#00ff44';
  fillPixelRect(g.sx, g.sy, g.sw, g.sh);
  ctx.globalAlpha = 1;

  termEvents.forEach((ev, i) => {
    if (ev.ms <= elapsed) {
      if (!termClicksPlayed.has(i) && ev.char !== null) {
        playKeyclick();
        termClicksPlayed.add(i);
      }
    }
  });

  // Replay all events up to now to reconstruct screen state
  let lines = [''];
  termEvents.forEach(ev => {
    if (ev.ms > elapsed) return;
    if (ev.char === null) {
      lines.push('');
    } else {
      lines[lines.length - 1] += ev.char;
    }
  });

  const showCursor = Math.floor(elapsed / 500) % 2 === 0;
  drawTerminalLines(g, lines, { show: showCursor }, blur, scale);
}

// ─── Phase 5: The Secret Door ────────────────────────────────────────────────
// (revised 2026-07-12, Trevor critique): the CABINET ITSELF hinges aside like a
// bookcase secret passage, revealing a HIDDEN ROOM full of machines exactly
// where it stood. The old separate back-wall door is gone — the Mystery
// Cabinet wasn't just a computer, it was the door.
//
// THE SWING IS A REAL DOOR, NOT A TILT. A door hinges about a fixed VERTICAL
// edge and stays perfectly vertical the whole time; what changes is its
// apparent WIDTH as it turns away from the viewer's plane. We render that as
// pure horizontal foreshortening about the hinge line — never a screen-plane
// rotation. The hinge is the cabinet's LEFT edge (x = cx); the free right edge
// swings toward the viewer. Every point (X,Y) maps to
//   X' = cx + (X - cx) * cos(openAngle),   Y' = Y
// i.e. a horizontal scale by cos(openAngle) about the vertical line x = cx.
// A vertical line (constant X) maps to a vertical line (constant X') — so ALL
// verticals stay exactly vertical at every open angle, by construction. The
// terminal, painted on the cabinet's face, foreshortens with the body because
// it rides the same single transform. drawCabinetBase / cabinetRect stay the
// single source of geometry — foreshortening is just one more transform layered
// over the drawn rect, plus a receding-face shade and a lit free-edge catch.

let chordStarted = false;

// ── The hidden room behind the cabinet ──
// A dim room with real DEPTH: 3 depth ranks of machine silhouettes receding
// and scaling down, each with its own small glowing screen (blues + a couple
// ambers, a couple subtly flickering), keyboard ledges, a cartridge-shelf side
// wall, and a floor line that spills light toward the viewer. Fixed data +
// bounded draw cost (≤ MACHINES.length rects of work). Screen positions/tints
// are static so the room reads the same every run; only the flicker animates.
// rank: 0 = nearest (largest), 2 = farthest (smallest). fx/fy are fractions of
// the doorway opening (dx,dy,dw,dh); amber flags the warm screens; flick flags
// the ones that pulse.
const ROOM_MACHINES = [
  // Back rank (rank 2) — far wall, small, mostly cool blue
  { rank: 2, fx: 0.30, fy: 0.30, fw: 0.11, amber: false, flick: false, tint: '#2a5088' },
  { rank: 2, fx: 0.46, fy: 0.29, fw: 0.11, amber: true,  flick: true,  tint: '#b07820' },
  { rank: 2, fx: 0.62, fy: 0.30, fw: 0.11, amber: false, flick: false, tint: '#3560a0' },
  // Middle rank (rank 1)
  { rank: 1, fx: 0.16, fy: 0.42, fw: 0.17, amber: false, flick: true,  tint: '#3a6cc0' },
  { rank: 1, fx: 0.62, fy: 0.43, fw: 0.17, amber: false, flick: false, tint: '#2f5fb0' },
  // Front rank (rank 0) — nearest the doorway, largest, one warm amber CRT
  { rank: 0, fx: 0.06, fy: 0.56, fw: 0.24, amber: true,  flick: false, tint: '#c88a28' },
  { rank: 0, fx: 0.70, fy: 0.57, fw: 0.24, amber: false, flick: true,  tint: '#4d84e0' },
];

// Draw the hidden room INTO the doorway opening (dx,dy,dw,dh). `reveal` 0..1
// blooms the room in; `t` (phase seconds) drives the subtle screen flicker.
// Everything is clipped to the opening so nothing spills onto the cabinet/wall.
function drawHiddenRoom(dx, dy, dw, dh, reveal, t) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();

  // Deep room backdrop: dark, cooling from a faint warm top to near-black
  // floor — gives the room air behind the machines.
  const back = ctx.createLinearGradient(0, dy, 0, dy + dh);
  back.addColorStop(0, '#141018');
  back.addColorStop(0.55, '#0c0a12');
  back.addColorStop(1, '#060509');
  ctx.fillStyle = back;
  fillPixelRect(dx, dy, dw, dh);

  // Perspective floor: a lighter wedge widening toward the viewer (bottom),
  // with a bright floor line where wall meets floor and light spilling down.
  const floorY = dy + Math.round(dh * 0.72);
  ctx.globalAlpha = reveal;
  // far (back) wall base — the horizon line, brightest catch of spill
  const floorGrad = ctx.createLinearGradient(0, floorY, 0, dy + dh);
  floorGrad.addColorStop(0, 'rgba(120, 96, 60, 0.55)');
  floorGrad.addColorStop(1, 'rgba(30, 26, 20, 0.15)');
  ctx.fillStyle = floorGrad;
  fillPixelRect(dx, floorY, dw, dy + dh - floorY);
  // horizon light line
  ctx.fillStyle = `rgba(210, 180, 120, ${0.5 * reveal})`;
  fillPixelRect(dx, floorY, dw, Math.max(1, Math.round(dh * 0.006)));
  ctx.globalAlpha = 1;

  // Left side wall: a cartridge-shelf strip (receding lines + colored spines).
  ctx.globalAlpha = reveal * 0.9;
  const wallW = Math.round(dw * 0.10);
  ctx.fillStyle = '#181420';
  fillPixelRect(dx, dy, wallW, floorY - dy);
  const spineColors = ['#b03018', '#2a8030', '#c0a018', '#3050b0', '#a02890'];
  for (let s = 0; s < 4; s++) {
    const shelfY = dy + Math.round(dh * (0.16 + s * 0.13));
    ctx.fillStyle = '#0d0b12';
    fillPixelRect(dx + 1, shelfY, wallW - 2, Math.max(1, Math.round(dh * 0.008)));
    // a few cartridge spines on the shelf
    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = spineColors[(s + k) % spineColors.length];
      fillPixelRect(
        dx + 2 + k * Math.round((wallW - 4) / 4),
        shelfY - Math.round(dh * 0.03),
        Math.max(1, Math.round((wallW - 4) / 4) - 1),
        Math.round(dh * 0.03)
      );
    }
  }
  ctx.globalAlpha = 1;

  // Machines, drawn far rank first so nearer ones occlude.
  const ranks = [2, 1, 0];
  ranks.forEach(r => {
    ROOM_MACHINES.filter(m => m.rank === r).forEach((m, idx) => {
      const mrev = clamp01((reveal - 0.15 - r * 0.12) / 0.5);
      if (mrev <= 0) return;
      ctx.globalAlpha = mrev;

      const mw = Math.round(dw * m.fw);
      const mh = Math.round(mw * 1.35);           // machine taller than wide
      const mx = dx + Math.round(dw * m.fx);
      const my = dy + Math.round(dh * m.fy);

      // Machine body silhouette — darker with depth
      const bodyShade = ['#1c1824', '#151220', '#100e18'][r];
      ctx.fillStyle = bodyShade;
      fillPixelRect(mx, my, mw, mh);

      // Screen: small, glowing, its own tint. A couple flicker subtly.
      const flick = m.flick ? (0.72 + 0.28 * (0.5 + 0.5 * Math.sin(t * 7 + idx * 2 + r))) : 1;
      const sw = Math.round(mw * 0.66);
      const sh = Math.round(mh * 0.42);
      const ssx = mx + Math.round((mw - sw) / 2);
      const ssy = my + Math.round(mh * 0.12);
      // screen glow halo
      ctx.save();
      ctx.shadowColor = m.tint;
      ctx.shadowBlur = Math.round(mw * 0.5) * flick;
      ctx.fillStyle = m.tint;
      ctx.globalAlpha = mrev * flick;
      fillPixelRect(ssx, ssy, sw, sh);
      ctx.restore();
      // brighter inner core
      ctx.globalAlpha = mrev * flick;
      ctx.fillStyle = m.amber ? '#ffd070' : '#a8d0ff';
      fillPixelRect(ssx + Math.round(sw * 0.12), ssy + Math.round(sh * 0.14),
        Math.round(sw * 0.76), Math.round(sh * 0.5));

      // Keyboard ledge catching light, below the screen
      ctx.globalAlpha = mrev;
      ctx.fillStyle = '#2a2634';
      fillPixelRect(mx - Math.round(mw * 0.06), my + Math.round(mh * 0.62),
        Math.round(mw * 1.12), Math.round(mh * 0.09));
      ctx.fillStyle = 'rgba(200,190,170,0.35)';
      fillPixelRect(mx - Math.round(mw * 0.06), my + Math.round(mh * 0.62),
        Math.round(mw * 1.12), Math.max(1, Math.round(mh * 0.02)));
      ctx.globalAlpha = 1;
    });
  });

  ctx.globalAlpha = 1;
  ctx.restore();
}

// ─── The dial-up handshake chirp — first entry to the Computer Wing only ─────
//
// easter-eggs.md Proposed #5: "Entering the Computer Wing for the first time, a
// half-second of modem chirp under the door-opening sound. (BBS era.)" The sound
// itself lives in js/audio.js (modemChirp), so it respects the global sound toggle
// like every other sound in the game — this file only decides WHEN.
//
// FIRST TIME ONLY, with no new storage. The latch is derived from progress the
// game already keeps: `completed['6']` is set the first time the player finishes
// Level 6, the first cabinet INSIDE the Computer Wing. So the chirp plays while a
// player has not yet cleared anything in the wing, and never again once they have.
// (main.js records Level 5 as complete BEFORE this cinematic starts, so neither
// furthestLevel nor completed['5'] can distinguish a first run from a replay —
// completed['6'] can.) Nothing is written; no field is added to js/slots.js.
//
// Reads defensively (security.md rule 4 — localStorage is untrusted input): any
// throw or malformed shape falls through to "not first time", which is the quiet
// outcome. A missing save slot (the WOPR dev bypass) reads as first time.
function isFirstEntryToComputerWing() {
  try {
    const p = Slots.getProgress();
    const done = p && p.completed;
    if (!done || typeof done !== 'object') return true;
    return !(done['6'] || done[6]);
  } catch (_) {
    return false;
  }
}

function drawPhase5(t, W, H) {
  if (!chordStarted) {
    startChord();
    stopCRTHum();
    playHingeSlide();
    // The modem chirp is offset ~0.45s so it plays UNDERNEATH the door, not in
    // front of it: the hinge slide begins at +0.5s and the chord ramps to full at
    // +1.5s, so the chirp (~0.55s long, mixed at roughly a third of the slide's
    // level) is a texture inside that swell and is gone before the chord peaks.
    // Purely decorative — it can never gate or delay the sequence.
    if (isFirstEntryToComputerWing()) Audio.modemChirp(0.45);
    chordStarted = true;
  }

  // The dolly finished at MAX_SCALE; the whole phase composes at that scale.
  // gHome is where the cabinet STOOD — the doorway lives exactly there.
  const gHome = cabinetRect(W, H, DOLLY.MAX_SCALE);

  // Door-open ease: a slow heavy start that settles WELL before the phase
  // ends, so the fully-revealed room gets a held beat (spec: the door opens,
  // then we linger on the passage). Reaches full-open at t≈0.70.
  const ease = smoothstep((t - 0.05) / 0.65);

  // Soft ambient glow around the scene.
  const amb = ctx.createRadialGradient(
    W / 2, gHome.cy + gHome.ch * 0.5, 0,
    W / 2, gHome.cy + gHome.ch * 0.5, gHome.cw * 1.4
  );
  amb.addColorStop(0, 'rgba(180, 120, 40, 0.08)');
  amb.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = amb;
  ctx.fillRect(0, 0, W, H);

  // ── The doorway, exactly where the cabinet stood ──
  // The opening is the full footprint the cabinet occupied — as the cabinet
  // foreshortens toward its hinge, it uncovers this doorway rightward. Drawn
  // FIRST so the ajar cabinet occludes the still-covered part (the reveal is
  // the cabinet actually turning, not a fade).
  const dx = gHome.cx;
  const dw = gHome.cw;
  const dh = gHome.ch;
  const dy = gHome.cy;

  // Frame (stone/wall) around the opening
  ctx.fillStyle = '#151515';
  fillPixelRect(dx - 6, dy - 6, dw + 12, dh + 8);

  // The hidden room, blooming in as the door opens.
  drawHiddenRoom(dx, dy, dw, dh, ease, t);

  // Warm-to-cool light spilling out of the opening onto the arcade floor.
  if (ease > 0.02) {
    ctx.globalAlpha = ease * 0.22;
    const spill = ctx.createRadialGradient(
      dx + dw * 0.6, dy + dh, 0,
      dx + dw * 0.6, dy + dh, gHome.cw * 1.3
    );
    spill.addColorStop(0, '#ffcc66');
    spill.addColorStop(0.5, 'rgba(180,150,90,0.5)');
    spill.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = spill;
    ctx.fillRect(0, dy + dh, W, H - (dy + dh));
    ctx.globalAlpha = 1;
  }

  // Doorway frame edge (pixel border)
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 2;
  ctx.strokeRect(dx - 3, dy - 3, dw + 6, dh + 6);

  // ── The cabinet, hinging aside like a door ──
  // Pure horizontal foreshortening about the LEFT edge (the hinge). The free
  // right edge swings toward the viewer; drawn width compresses by cos(angle).
  // NO screen-plane rotation — a horizontal scale about x = cx keeps every
  // vertical vertical. openAngle grows to ~72° so the door is well ajar and
  // most of the room is revealed, while the ajar face (with its lit terminal)
  // stays readable at frame left.
  const openAngle = ease * (74 * Math.PI / 180);
  const cos = Math.cos(openAngle);
  const hinge = gHome.cx;                 // hinge line (left edge)

  ctx.save();
  // Horizontal scale by `cos` about the vertical hinge line x = hinge.
  ctx.translate(hinge, 0);
  ctx.scale(cos, 1);
  ctx.translate(-hinge, 0);

  drawCabinetBase(W, H, 0, DOLLY.MAX_SCALE);

  // Terminal stays lit and crisp on the ajar face (blur 0 — already arrived).
  ctx.fillStyle = '#001200';
  fillPixelRect(gHome.sx, gHome.sy, gHome.sw, gHome.sh);
  const finalLines = ['HELLO.', '', 'YOU FOUND ME.', '', 'COME IN.'];
  drawTerminalLines(gHome, finalLines, { show: false }, 0, DOLLY.MAX_SCALE);

  ctx.restore();

  // ── Face shading, drawn in SCREEN space over the foreshortened cabinet ──
  // The receding face darkens toward the free (right) edge; a bright catch
  // rides the very free edge — reading the turn as light, not geometry.
  // Compute the current on-screen span of the cabinet body.
  const bodyLeft = hinge;
  const bodyRight = hinge + gHome.cw * cos;
  if (ease > 0.02 && bodyRight - bodyLeft > 2) {
    // Receding-face shade: transparent at hinge, darkening toward free edge.
    const shade = ctx.createLinearGradient(bodyLeft, 0, bodyRight, 0);
    shade.addColorStop(0, 'rgba(0,0,0,0)');
    shade.addColorStop(1, `rgba(0,0,0,${0.35 * ease})`);
    ctx.fillStyle = shade;
    fillPixelRect(bodyLeft, gHome.cy, bodyRight - bodyLeft, gHome.ch);

    // Free-edge brightness catch — a thin lit strip on the leading edge.
    ctx.globalAlpha = ease;
    ctx.fillStyle = 'rgba(255, 226, 170, 0.5)';
    fillPixelRect(bodyRight - 3, gHome.cy + 6, 3, gHome.ch - 12);
    ctx.globalAlpha = 1;
  }
}

// ─── Phase 6: Title Card ──────────────────────────────────────────────────────

function drawPhase6(elapsedSec, W, H) {
  // Fade in over 1.5s
  const alpha = Math.min(1, elapsedSec / 1.5);

  ctx.globalAlpha = alpha;

  // "ACT 2" — large
  const actFontSize = Math.max(16, Math.floor(W * 0.022));
  ctx.font = `${actFontSize}px "Press Start 2P", monospace`;
  ctx.fillStyle = '#ffb000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ffb000';
  ctx.shadowBlur = 20 + Math.sin(elapsedSec * 2) * 5;
  ctx.fillText('ACT 2', W / 2, H * 0.38);

  // "THE COMPUTER WING" — medium, below
  const nameFontSize = Math.max(9, Math.floor(W * 0.012));
  ctx.font = `${nameFontSize}px "Press Start 2P", monospace`;
  ctx.fillStyle = '#e0e0e0';
  ctx.shadowColor = '#e0e0e0';
  ctx.shadowBlur = 8;
  ctx.fillText('THE COMPUTER WING', W / 2, H * 0.48);

  ctx.shadowBlur = 0;

  // "PRESS SPACE TO CONTINUE" — small, blinking
  const blinkOn = Math.floor(elapsedSec * 1.4) % 2 === 0;
  if (blinkOn && elapsedSec > 1.0) {
    const promptFontSize = Math.max(6, Math.floor(W * 0.007));
    ctx.font = `${promptFontSize}px "Press Start 2P", monospace`;
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 6;
    ctx.fillText('PRESS SPACE TO CONTINUE', W / 2, H * 0.65);
    ctx.shadowBlur = 0;
  }

  ctx.globalAlpha = 1;
}

// ─── Main render loop ─────────────────────────────────────────────────────────

let lastPhase = -1;

function render(now) {
  if (!active) return;

  canvas.width  = canvas.width;  // clear
  const W = canvas.width;
  const H = canvas.height;

  const ms   = now - startTime;
  const phase = getPhase(ms);
  const t     = phaseT(phase, ms);

  // Phase transition side effects
  if (phase !== lastPhase) {
    if (phase === 1) startCRTHum();
    if (phase === 2) bootBeepsPlayed = false; // reset so it plays once
    if (phase === 3 && crtHumNode) {
      // The Approach: the hum of the screen grows slightly louder as we
      // close the distance (spec audio note). One scheduled ramp across the
      // 12s dolly — no per-frame audio writes.
      const c = getAudioCtx();
      crtHumNode.gain.gain.linearRampToValueAtTime(
        0.05, c.currentTime + (P.TERMINAL.e - P.TERMINAL.s) / 1000
      );
    }
    lastPhase = phase;
  }

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  switch (phase) {
    case 0: drawPhase1(t, W, H); break;
    case 1: drawPhase2(t, W, H); break;
    case 2: drawPhase3(t, W, H); break;
    case 3: drawPhase4(ms - P.TERMINAL.s, W, H); break;
    case 4: drawPhase5(t, W, H); break;
    case 5: drawPhase6(ms - P.TITLECARD.s, W, H); break;
  }

  animId = requestAnimationFrame(render);
}

// ─── Public API ──────────────────────────────────────────────────────────────

// opts.skippable — false on the FIRST viewing (the default, so a caller that
// forgets can never let a stray key cut the reveal short), true on replays.
export function start(callback, opts = {}) {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  onDone     = callback;
  active     = true;
  skippable  = !!(opts && opts.skippable);
  skipped    = false;
  lastPhase  = -1;
  termEvents = null;
  termClicksPlayed = new Set();
  bootBeepsPlayed  = false;
  chordStarted     = false;

  // Defensively hide any visible title/game DOM so it can never bleed through
  // on top of the cinematic canvas. Restored in stop().
  hideAllScreens();

  startTime = performance.now();
  animId    = requestAnimationFrame(render);
}

// Skip to title card. Only ever reached on a REPLAY via Space/Escape (confirm()).
export function skip() {
  if (!active || getPhase(performance.now() - startTime) >= 5) return;
  stopCRTHum();
  if (!chordStarted) { startChord(); chordStarted = true; }
  startTime = performance.now() - P.TITLECARD.s;
}

// Every key during the cinematic arrives here (main.js 'mystery' case).
//   • Before the title card — the FIRST viewing ignores every key: a stray key
//     at ~8s used to jump straight to ACT 2, so the child never saw "HELLO. YOU
//     FOUND ME.", the secret door or the Computer Wing. On a REPLAY only Space
//     or Escape skip to the title card (transitions.md, "Skippable after first
//     completion (Space or Escape)").
//   • On the title card — only Space continues, because Space is what it says.
export function confirm(key) {
  if (!active) return;
  const ms = performance.now() - startTime;
  if (getPhase(ms) < 5) {
    if (skippable && (key === ' ' || key === 'Escape')) skip();
    return;
  }
  if (key !== ' ') return;
  stop();
  if (onDone) onDone();
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  stopCRTHum();
  stopChord();
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Restore whatever screen visibility we changed. When stop() is followed by
  // the completion callback (confirm -> onDone -> showScreen), showScreen
  // re-hides all screens synchronously in the same task, so the correct
  // next-screen state is what actually paints — no title flash.
  restoreHiddenScreens();
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
