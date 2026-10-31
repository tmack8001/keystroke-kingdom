// Act 3 → Act 4 transition: The Command Center
// Triggered after Level 15 (Pokémon) completion. ~35 seconds, skippable.

import * as Audio from './audio.js';

let canvas, ctx;
let animId = null;
let active = false;
let startTime = 0;
let onDone = null;
// Replay-only skipping (transitions.md: "Skippable after first completion").
let skippable = false;
let audioCtx = null;
let chordNodes = [];
let riserNodes = [];
let jinglePlayed = false;

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

// Phase boundaries (ms)
const P = {
  MILESTONE: { s: 0,     e: 8000  },  // rolling letter key wave + FULL KEYBOARD UNLOCKED
  TEXT:      { s: 8000,  e: 14000 },  // "YOU KNOW EVERY WORD. NOW LET'S COUNT."
  STAIRCASE: { s: 14000, e: 24000 },  // staircase rises through ceiling
  TITLECARD: { s: 24000, e: Infinity },// ACT 4 / THE COMMAND CENTER
};
const PHASE_ORDER = ['MILESTONE', 'TEXT', 'STAIRCASE', 'TITLECARD'];

// All 26 letters for the rolling wave
const ALL_LETTERS = 'ASDFGHJKLQWERTYUIOPZXCVBNM'.split('');
// Ordered left→right across keyboard rows for the wave effect
const WAVE_ORDER = [
  'Q','W','E','R','T','Y','U','I','O','P',
  'A','S','D','F','G','H','J','K','L',
  'Z','X','C','V','B','N','M',
];

// ─── Audio ───────────────────────────────────────────────────────────────────

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playMilestoneJingle() {
  // All 7 notes of C major scale played together → resolving chord
  const freqs = [261.6, 293.7, 329.6, 349.2, 392, 440, 493.9];
  freqs.forEach((freq, i) => {
    const c = getAudioCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, c.currentTime + i * 0.04);
    gain.gain.setValueAtTime(0.025, c.currentTime + i * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.04 + 1.8);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime + i * 0.04);
    osc.stop(c.currentTime + i * 0.04 + 2.0);
    chordNodes.push({ osc, gain });
  });
}

function startServerRiser() {
  if (riserNodes.length) return;
  const c = getAudioCtx();
  // Clean electric server hum — steady sine tones rising in pitch
  [120, 180, 240].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, c.currentTime);
    osc.frequency.linearRampToValueAtTime(freq * 1.5, c.currentTime + 12);
    gain.gain.setValueAtTime(0.0001, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.012 - i * 0.003, c.currentTime + 3);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    riserNodes.push({ osc, gain });
  });
}

function stopAllAudio() {
  const c = getAudioCtx();
  [...chordNodes, ...riserNodes].forEach(({ osc, gain }) => {
    gain.gain.linearRampToValueAtTime(0.0001, c.currentTime + 1.0);
    osc.stop(c.currentTime + 1.1);
  });
  chordNodes = [];
  riserNodes = [];
}

// ─── Phase helpers ────────────────────────────────────────────────────────────

function getPhase(ms) {
  for (let i = PHASE_ORDER.length - 1; i >= 0; i--) {
    if (ms >= P[PHASE_ORDER[i]].s) return i;
  }
  return 0;
}

function phaseT(phaseIdx, ms) {
  const key = PHASE_ORDER[phaseIdx];
  const p = P[key];
  if (p.e === Infinity) return (ms - p.s) / 1000;
  return Math.min(1, (ms - p.s) / (p.e - p.s));
}

function fillR(x, y, w, h) {
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

// ─── Phase 0: Milestone — rolling letter key wave ─────────────────────────────

function drawPhase0(t, W, H) {
  if (!jinglePlayed && t > 0.05) {
    playMilestoneJingle();
    jinglePlayed = true;
  }

  // Basement floor background (Act 3 palette)
  ctx.fillStyle = '#04080a';
  ctx.fillRect(0, 0, W, H);

  // FULL KEYBOARD UNLOCKED text — holds then fades. Fade begins at 0.90 so
  // the completed 26-key wave (done by ~0.68 after the retime below) holds at
  // full brightness WITH the banner — previously the fade started at 0.70,
  // before the wave even finished, so the canonical all-lit+banner frame
  // never existed (caught by the milestones reference set, 2026-07-12).
  const textAlpha = t < 0.9 ? 1 : 1 - (t - 0.9) / 0.1;
  const fontSize = Math.max(9, Math.floor(W * 0.014));
  ctx.globalAlpha = textAlpha;
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffcc00';
  ctx.shadowColor = '#ffcc00';
  ctx.shadowBlur = 18 + Math.sin(t * Math.PI * 5) * 4;
  ctx.fillText('FULL KEYBOARD UNLOCKED', W / 2, H * 0.28);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // Rolling key wave — all 26 keys light up left→right
  // WAVE_ORDER spans left→right; each key ignites at t = i/26 * 0.8
  const keySize = Math.max(16, Math.floor(W * 0.028));
  const keyGap  = Math.round(keySize * 0.18);

  // Draw 3 rows mirroring keyboard layout
  const rows = [
    WAVE_ORDER.slice(0, 10),   // Q-P top row
    WAVE_ORDER.slice(10, 19),  // A-L home row
    WAVE_ORDER.slice(19),      // Z-M bottom row
  ];

  rows.forEach((row, ri) => {
    const rowW = row.length * (keySize + keyGap) - keyGap;
    const rowX = Math.round((W - rowW) / 2);
    const rowY = Math.round(H * 0.42 + ri * (keySize + Math.round(keyGap * 1.4)));

    row.forEach((label, li) => {
      // Find this key's global index in WAVE_ORDER
      const globalIdx = (ri === 0 ? 0 : ri === 1 ? 10 : 19) + li;
      // Wave spans 0.05–0.60 (+0.08 ramp): last key fully lit by ~0.68,
      // leaving a real full-brightness hold before the 0.90 banner fade.
      const lightAt = 0.05 + (globalIdx / WAVE_ORDER.length) * 0.55;
      const lit = t >= lightAt;
      const keyT = lit ? Math.min(1, (t - lightAt) / 0.08) : 0;

      const kx = rowX + li * (keySize + keyGap);
      const accent = '#ffcc00';
      const glow = lit ? (10 + Math.sin(t * 4 + globalIdx * 0.3) * 3) * keyT : 0;

      ctx.fillStyle = lit ? `rgba(255,200,0,${0.12 + keyT * 0.1})` : '#0a0e0e';
      ctx.shadowColor = accent;
      ctx.shadowBlur = glow;
      fillR(kx, rowY, keySize, keySize);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = lit ? accent : '#1a2a20';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(kx + 0.5, rowY + 0.5, keySize - 1, keySize - 1);

      const lSize = Math.max(5, Math.floor(keySize * 0.3));
      ctx.font = `${lSize}px "Press Start 2P", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = lit ? accent : '#1a2a20';
      ctx.shadowColor = accent;
      ctx.shadowBlur = glow * 0.5;
      ctx.fillText(label, kx + keySize / 2, rowY + keySize / 2);
      ctx.shadowBlur = 0;
    });
  });

  ctx.textAlign = 'left';
}

// ─── Phase 1: Text Card ───────────────────────────────────────────────────────

function drawPhase1(t, W, H) {
  ctx.fillStyle = '#04080a';
  ctx.fillRect(0, 0, W, H);

  const alpha = Math.min(1, t * 3);
  ctx.globalAlpha = alpha;

  const line1Size = Math.max(9, Math.floor(W * 0.012));
  ctx.font = `${line1Size}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffcc00';
  ctx.shadowColor = '#ffcc00';
  ctx.shadowBlur = 12;
  ctx.fillText('YOU KNOW EVERY WORD.', W / 2, H * 0.42);

  ctx.fillStyle = '#e0e0e0';
  ctx.shadowColor = '#e0e0e0';
  ctx.shadowBlur = 8;
  ctx.fillText("NOW LET'S COUNT.", W / 2, H * 0.55);

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

// ─── Phase 2: Staircase ───────────────────────────────────────────────────────

function drawBasementFloor(W, H) {
  // Basement room — neon-lit floor
  ctx.fillStyle = '#04080a';
  ctx.fillRect(0, 0, W, H);

  // Floor surface
  ctx.fillStyle = '#060c10';
  fillR(0, H * 0.55, W, H * 0.45);

  // Floor grid
  ctx.strokeStyle = '#0a1820';
  ctx.lineWidth = 1;
  const tile = Math.round(W * 0.05);
  for (let x = 0; x < W; x += tile) {
    ctx.beginPath(); ctx.moveTo(x, H * 0.55); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = H * 0.55; y < H; y += tile * 0.6) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Neon edge on floor
  ctx.strokeStyle = '#ff2060';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#ff2060';
  ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.moveTo(0, H * 0.55); ctx.lineTo(W, H * 0.55); ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawPhase2(t, W, H) {
  if (t < 0.05) startServerRiser();

  drawBasementFloor(W, H);

  // Staircase: rises from floor center upward through ceiling
  // t=0: staircase bottom just at floor level
  // t=1: staircase extends through ceiling, top visible
  const stepCount = 12;
  const stepW     = Math.round(W * 0.24);
  const stepH     = Math.round(H * 0.045);
  const stepDepth = Math.round(stepW * 0.08);
  const centerX   = Math.round((W - stepW) / 2);

  // Rise amount: at t=0 the top step is at the floor, at t=1 it's halfway up the wall
  const totalH    = stepCount * stepH;
  const floorY    = H * 0.55;
  const riseY     = floorY - totalH * t * 1.6;

  for (let i = stepCount - 1; i >= 0; i--) {
    const stepY = Math.round(riseY + i * stepH);
    if (stepY > H || stepY + stepH < 0) continue;

    const stepAlpha = Math.max(0, Math.min(1, (floorY - stepY) / (H * 0.5)));

    // Light spill from above — Act 4 palette (cool blue-white server glow)
    const lightProgress = 1 - i / stepCount;
    const stepBg = `rgba(${20 + lightProgress * 80}, ${30 + lightProgress * 80}, ${50 + lightProgress * 120}, ${stepAlpha})`;
    const stepBorder = `rgba(${60 + lightProgress * 140}, ${80 + lightProgress * 140}, ${180 + lightProgress * 60}, ${stepAlpha * 0.8})`;

    ctx.globalAlpha = stepAlpha;

    // Step face
    ctx.fillStyle = stepBg;
    fillR(centerX, stepY, stepW, stepH - 1);

    // Step riser (vertical front face)
    ctx.fillStyle = `rgba(${10 + lightProgress * 40}, ${15 + lightProgress * 50}, ${30 + lightProgress * 80}, ${stepAlpha})`;
    fillR(centerX, stepY + stepH - stepDepth, stepW, stepDepth);

    // Step edge highlight
    ctx.strokeStyle = stepBorder;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = `rgba(100, 140, 255, ${stepAlpha * lightProgress})`;
    ctx.shadowBlur = 4 * lightProgress;
    ctx.strokeRect(centerX + 0.5, stepY + 0.5, stepW - 1, stepH - stepDepth - 1);
    ctx.shadowBlur = 0;
  }

  ctx.globalAlpha = 1;

  // Light portal at top of staircase — Act 4 quality glimpse
  if (t > 0.5) {
    const portalAlpha = (t - 0.5) / 0.5;
    const portalY = Math.round(riseY - H * 0.08);
    const portalW = Math.round(stepW * 1.2);
    const portalH = Math.round(H * 0.12);
    const portalX = Math.round((W - portalW) / 2);

    if (portalY < H * 0.3) {
      // Blue-white server room light
      const grad = ctx.createRadialGradient(
        W / 2, portalY + portalH / 2, 0,
        W / 2, portalY + portalH / 2, portalW * 0.8
      );
      grad.addColorStop(0, `rgba(180, 220, 255, ${portalAlpha * 0.9})`);
      grad.addColorStop(0.4, `rgba(80, 120, 255, ${portalAlpha * 0.5})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.globalAlpha = portalAlpha;
      fillR(portalX - portalW * 0.5, portalY, portalW * 2, portalH * 2);

      // Server rack silhouettes in the portal
      ctx.fillStyle = `rgba(10, 20, 40, ${portalAlpha * 0.8})`;
      const rackW = Math.round(portalW * 0.12);
      const rackH = Math.round(portalH * 1.2);
      for (let rx = 0; rx < 4; rx++) {
        const rrx = portalX + Math.round(portalW * (0.1 + rx * 0.22));
        fillR(rrx, portalY - rackH * 0.6, rackW, rackH);
        // Blinking LED
        const blinkOn = Math.floor(performance.now() / 500 + rx * 17) % 2 === 0;
        ctx.fillStyle = blinkOn
          ? `rgba(0, 255, 80, ${portalAlpha})`
          : `rgba(0, 100, 40, ${portalAlpha})`;
        fillR(rrx + 3, portalY - rackH * 0.6 + 4, 3, 3);
        ctx.fillStyle = `rgba(10, 20, 40, ${portalAlpha * 0.8})`;
      }

      ctx.globalAlpha = 1;
    }
  }
}

// ─── Phase 3: Title Card ──────────────────────────────────────────────────────

function drawPhase3(elapsedSec, W, H) {
  ctx.fillStyle = '#04080a';
  ctx.fillRect(0, 0, W, H);

  const alpha = Math.min(1, elapsedSec / 1.2);
  ctx.globalAlpha = alpha;

  const actSize = Math.max(16, Math.floor(W * 0.022));
  ctx.font = `${actSize}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#4488cc';
  ctx.shadowColor = '#4488cc';
  ctx.shadowBlur = 20 + Math.sin(elapsedSec * 2.0) * 5;
  ctx.fillText('ACT 4', W / 2, H * 0.38);

  const nameSize = Math.max(9, Math.floor(W * 0.011));
  ctx.font = `${nameSize}px "Press Start 2P", monospace`;
  ctx.fillStyle = '#c8c8e8';
  ctx.shadowColor = '#c8c8e8';
  ctx.shadowBlur = 10;
  ctx.fillText('THE COMMAND CENTER', W / 2, H * 0.49);

  ctx.shadowBlur = 0;

  const blinkOn = Math.floor(elapsedSec * 1.4) % 2 === 0;
  if (blinkOn && elapsedSec > 1.0) {
    const pSize = Math.max(6, Math.floor(W * 0.007));
    ctx.font = `${pSize}px "Press Start 2P", monospace`;
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 6;
    ctx.fillText('PRESS SPACE TO CONTINUE', W / 2, H * 0.65);
    ctx.shadowBlur = 0;
  }

  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

// ─── Main render loop ─────────────────────────────────────────────────────────

let lastPhase = -1;

function render(now) {
  if (!active) return;

  canvas.width = canvas.width;
  const W = canvas.width;
  const H = canvas.height;

  const ms    = now - startTime;
  const phase = getPhase(ms);
  const t     = phaseT(phase, ms);

  if (phase !== lastPhase) lastPhase = phase;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  switch (phase) {
    case 0: drawPhase0(t, W, H); break;
    case 1: drawPhase1(t, W, H); break;
    case 2: drawPhase2(t, W, H); break;
    case 3: drawPhase3(ms - P.TITLECARD.s, W, H); break;
  }

  animId = requestAnimationFrame(render);
}

// ─── Public API ──────────────────────────────────────────────────────────────

// opts.skippable — false on the FIRST viewing (the default), true on replays.
export function start(callback, opts = {}) {
  skippable = !!(opts && opts.skippable);
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  onDone   = callback;
  active   = true;
  lastPhase = -1;
  jinglePlayed = false;
  chordNodes = [];
  riserNodes = [];

  // Defensively hide any visible title/game DOM so it can never bleed through
  // on top of the cinematic canvas. Restored in stop().
  hideAllScreens();

  startTime = performance.now();
  animId    = requestAnimationFrame(render);
}

// Every key during the cinematic arrives here. Before the title card: the FIRST
// viewing ignores every key; a REPLAY skips to the title card on Space or Escape
// only. On the title card: only Space continues — it is what the card says.
// (Same rule as js/mystery.js — transitions.md "Skippable after first completion".)
export function confirm(key) {
  if (!active) return;
  const ms = performance.now() - startTime;
  if (getPhase(ms) < 3) {
    if (skippable && (key === ' ' || key === 'Escape')) {
      stopAllAudio();
      startTime = performance.now() - P.TITLECARD.s;
    }
    return;
  }
  if (key !== ' ') return;
  stop();
  if (onDone) onDone();
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  stopAllAudio();
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
