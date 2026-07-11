// Mystery Cabinet reveal cinematic — triggered after Level 5 (Joust) completion.
// Runs on the shared #invaders-canvas. ~50 seconds, skippable to title card.

import * as Audio from './audio.js';

let canvas, ctx;
let animId = null;
let active = false;
let startTime = 0;
let onDone = null;       // called when user presses Space on title card
let audioCtx = null;
let crtHumNode = null;
let chordNodes = [];
let skipped = false;

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

function cabinet(W, H) {
  const cw = Math.round(W * 0.14);
  const ch = Math.round(cw * 1.55);
  const cx = Math.round(W * 0.5 - cw / 2);
  const cy = Math.round(H * 0.5 - ch * 0.45);
  const sx = cx + Math.round(cw * 0.12);         // screen x
  const sw = cw - Math.round(cw * 0.24);          // screen width
  const sy = cy + Math.round(ch * 0.12);          // screen y
  const sh = Math.round(ch * 0.38);               // screen height
  return { cx, cy, cw, ch, sx, sy, sw, sh };
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────

function fillPixelRect(x, y, w, h) {
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawCabinetBase(W, H, glowAlpha = 0) {
  const g = cabinet(W, H);

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

// ─── Phase 4: Terminal ────────────────────────────────────────────────────────

const TERMINAL_LINES = [
  { text: 'HELLO.', delay: 500 },
  { text: '',        delay: 2800 },  // blank line pause
  { text: 'YOU FOUND ME.', delay: 5000 },
  { text: '',        delay: 7400 },
  { text: 'COME IN.', delay: 9500 },
];

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

function drawPhase4(elapsed, W, H) {
  buildTermEvents();

  const g = drawCabinetBase(W, H, 0.15);

  // Screen background
  ctx.fillStyle = '#001200';
  fillPixelRect(g.sx, g.sy, g.sw, g.sh);

  // Inner screen glow
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#00ff44';
  fillPixelRect(g.sx, g.sy, g.sw, g.sh);
  ctx.globalAlpha = 1;

  // Determine what to draw
  const fontSize = Math.max(5, Math.floor(g.sw * 0.09));
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.fillStyle = '#00ff44';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.shadowColor = '#00ff44';
  ctx.shadowBlur = 4;

  const lineH = fontSize + Math.round(fontSize * 0.6);
  const padX = Math.round(g.sw * 0.08);
  const padY = Math.round(g.sh * 0.1);

  let x = g.sx + padX;
  let y = g.sy + padY;
  let lineChars = '';

  let lastEventIdx = -1;
  termEvents.forEach((ev, i) => {
    if (ev.ms <= elapsed) {
      lastEventIdx = i;
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

  lines.forEach((line, li) => {
    ctx.fillText(line, x, y + li * lineH);
  });

  // Blinking cursor
  const showCursor = Math.floor(elapsed / 500) % 2 === 0;
  if (showCursor) {
    const lastLine = lines[lines.length - 1];
    const lastWidth = ctx.measureText(lastLine).width;
    const cursorY = y + (lines.length - 1) * lineH;
    ctx.fillStyle = '#00ff44';
    fillPixelRect(x + lastWidth + 2, cursorY, Math.round(fontSize * 0.55), fontSize);
  }

  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
}

// ─── Phase 5: Door ───────────────────────────────────────────────────────────

let chordStarted = false;

function drawPhase5(t, W, H) {
  if (!chordStarted) {
    startChord();
    stopCRTHum();
    chordStarted = true;
  }

  const g = drawCabinetBase(W, H, 0.1);

  // Draw terminal in stable state (all text visible)
  ctx.fillStyle = '#001200';
  fillPixelRect(g.sx, g.sy, g.sw, g.sh);

  const fontSize = Math.max(5, Math.floor(g.sw * 0.09));
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.fillStyle = '#00ff44';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.shadowColor = '#00ff44';
  ctx.shadowBlur = 4;
  const lineH = fontSize + Math.round(fontSize * 0.6);
  const padX = Math.round(g.sw * 0.08);
  const padY = Math.round(g.sh * 0.1);
  const finalLines = ['HELLO.', '', 'YOU FOUND ME.', '', 'COME IN.'];
  finalLines.forEach((line, li) => {
    ctx.fillText(line, g.sx + padX, g.sy + padY + li * lineH);
  });
  ctx.shadowBlur = 0;

  // Door: appears in the wall to the right of the cabinet
  const doorEase = t < 0.3 ? 0 : Math.min(1, ((t - 0.3) / 0.7) ** 0.5);
  const doorW = Math.round(g.cw * 0.7);
  const doorH = Math.round(g.ch * 0.65);
  const doorX = g.cx + g.cw + Math.round(W * 0.05);
  const doorY = g.cy + Math.round(g.ch * 0.2);

  // Door frame (stone/wall)
  ctx.fillStyle = '#151515';
  fillPixelRect(doorX - 3, doorY - 3, doorW + 6, doorH + 3);
  ctx.fillStyle = '#0f0f0f';
  fillPixelRect(doorX, doorY, doorW, doorH);

  // Light flooding through — NES-palette warmth visible
  if (doorEase > 0) {
    const openW = Math.round(doorW * doorEase);

    // Warm amber/blue light from Computer Wing beyond
    const lightGrad = ctx.createLinearGradient(doorX, 0, doorX + openW, 0);
    lightGrad.addColorStop(0, `rgba(255, 200, 100, ${doorEase * 0.9})`);
    lightGrad.addColorStop(0.3, `rgba(200, 160, 80, ${doorEase * 0.7})`);
    lightGrad.addColorStop(0.7, `rgba(80, 140, 200, ${doorEase * 0.5})`);
    lightGrad.addColorStop(1, `rgba(20, 80, 160, ${doorEase * 0.3})`);
    ctx.fillStyle = lightGrad;
    fillPixelRect(doorX, doorY, openW, doorH);

    // Glimpse of computer equipment beyond — pixel art silhouettes
    if (doorEase > 0.4) {
      ctx.globalAlpha = (doorEase - 0.4) / 0.6;
      // Monitor shape
      ctx.fillStyle = '#2244aa';
      fillPixelRect(doorX + 4, doorY + Math.round(doorH * 0.2), Math.round(doorW * 0.3), Math.round(doorH * 0.35));
      ctx.fillStyle = '#4488ff';
      fillPixelRect(doorX + 6, doorY + Math.round(doorH * 0.22), Math.round(doorW * 0.26), Math.round(doorH * 0.28));
      // Keyboard silhouette
      ctx.fillStyle = '#1a1a2a';
      fillPixelRect(doorX + 4, doorY + Math.round(doorH * 0.6), Math.round(doorW * 0.35), Math.round(doorH * 0.08));
      // Cartridge shelf
      ctx.fillStyle = '#cc2200';
      fillPixelRect(doorX + 6, doorY + Math.round(doorH * 0.15), 4, Math.round(doorH * 0.06));
      ctx.fillStyle = '#00aa22';
      fillPixelRect(doorX + 12, doorY + Math.round(doorH * 0.15), 4, Math.round(doorH * 0.06));
      ctx.fillStyle = '#ccaa00';
      fillPixelRect(doorX + 18, doorY + Math.round(doorH * 0.15), 4, Math.round(doorH * 0.06));
      ctx.globalAlpha = 1;
    }

    // Light spill into arcade floor
    ctx.globalAlpha = doorEase * 0.15;
    const spill = ctx.createRadialGradient(
      doorX + openW / 2, doorY + doorH, 0,
      doorX + openW / 2, doorY + doorH, g.cw * 1.5
    );
    spill.addColorStop(0, '#ffcc66');
    spill.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = spill;
    ctx.fillRect(0, doorY + doorH, W, H - (doorY + doorH));
    ctx.globalAlpha = 1;
  }

  // Door frame edge (pixel border)
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.strokeRect(doorX - 1, doorY - 1, doorW + 2, doorH + 2);
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
    if (phase === 3) bootBeepsPlayed = false; // reset so it plays once
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

export function start(callback) {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  onDone     = callback;
  active     = true;
  skipped    = false;
  lastPhase  = -1;
  termEvents = null;
  termClicksPlayed = new Set();
  bootBeepsPlayed  = false;
  chordStarted     = false;

  startTime = performance.now();
  animId    = requestAnimationFrame(render);
}

// Skip to title card (Space/Escape before sequence ends)
export function skip() {
  if (!active || getPhase(performance.now() - startTime) >= 5) return;
  stopCRTHum();
  if (!chordStarted) { startChord(); chordStarted = true; }
  startTime = performance.now() - P.TITLECARD.s;
}

// Called when user confirms on title card
export function confirm() {
  if (!active) return;
  const ms = performance.now() - startTime;
  if (getPhase(ms) < 5) {
    skip();
    return; // first press skips to title card
  }
  // Second press (or press while on title card): done
  stop();
  if (onDone) onDone();
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  stopCRTHum();
  stopChord();
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
