// Act 2 → Act 3 transition: The Basement Opens
// Triggered after Level 10 (Zelda) completion. ~25 seconds, skippable.

import * as Audio from './audio.js';

let canvas, ctx;
let animId = null;
let active = false;
let startTime = 0;
let onDone = null;
let audioCtx = null;
let bassNodes = [];
let fmNodes = [];
let milestoneJinglePlayed = false;

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
  MILESTONE: { s: 0,     e: 5000  },  // 0 — TOP ROW UNLOCKED + key cascade
  SEAM:      { s: 5000,  e: 11000 },  // 1 — crack appears, light bleeds
  DROP:      { s: 11000, e: 18000 },  // 2 — trapdoor opens, FM blooms
  TITLECARD: { s: 18000, e: Infinity },// 3 — ACT 3 / THE BASEMENT
};
const PHASE_ORDER = ['MILESTONE','SEAM','DROP','TITLECARD'];

// Top row keys for the cascade
const TOP_ROW = ['Q','W','E','R','T','Y','U','I','O','P'];

// ─── Audio ───────────────────────────────────────────────────────────────────

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playMilestoneJingle() {
  // Ascending fanfare: C E G C (octave up) — more celebratory than boot beeps
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    const c = getAudioCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, c.currentTime + i * 0.13);
    gain.gain.setValueAtTime(0.07, c.currentTime + i * 0.13);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.13 + 0.22);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime + i * 0.13);
    osc.stop(c.currentTime + i * 0.13 + 0.25);
  });
}

function startSubBass() {
  if (bassNodes.length) return;
  const c = getAudioCtx();
  // Low sub-bass hum: barely perceptible
  [55, 82].forEach(freq => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(0.0001, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.018, c.currentTime + 4);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    bassNodes.push({ osc, gain });
  });
}

function startGenesisFM() {
  if (fmNodes.length) return;
  const c = getAudioCtx();

  // Approximate Genesis FM: detuned triangle waves + slow LFO wobble
  const baseFreqs = [110, 165.5, 220, 330.2];
  baseFreqs.forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();

    osc.type = i % 2 === 0 ? 'triangle' : 'sawtooth';
    osc.frequency.setValueAtTime(freq + (i * 0.7), c.currentTime);

    // LFO: slow wobble (1.1–1.8 Hz) on amplitude
    lfo.frequency.setValueAtTime(1.1 + i * 0.18, c.currentTime);
    lfoGain.gain.setValueAtTime(0.003, c.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    const targetVol = 0.012 - i * 0.002;
    gain.gain.setValueAtTime(0.0001, c.currentTime);
    gain.gain.linearRampToValueAtTime(targetVol, c.currentTime + 2.5);

    osc.connect(gain);
    gain.connect(c.destination);
    lfo.start();
    osc.start();
    fmNodes.push({ osc, gain, lfo });
  });
}

function stopAllAudio() {
  const c = getAudioCtx();
  [...bassNodes, ...fmNodes].forEach(({ osc, gain, lfo }) => {
    gain.gain.linearRampToValueAtTime(0.0001, c.currentTime + 1.2);
    osc.stop(c.currentTime + 1.3);
    if (lfo) lfo.stop(c.currentTime + 1.3);
  });
  bassNodes = [];
  fmNodes = [];
}

// ─── Phase helpers ────────────────────────────────────────────────────────────

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

// ─── Drawing ──────────────────────────────────────────────────────────────────

function fillR(x, y, w, h) {
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

// ─── Phase 0: Milestone ───────────────────────────────────────────────────────

function drawPhase0(t, W, H) {
  if (!milestoneJinglePlayed && t > 0.05) {
    playMilestoneJingle();
    milestoneJinglePlayed = true;
  }

  // Background — dark NES blue-grey (Computer Wing palette)
  ctx.fillStyle = '#050a14';
  ctx.fillRect(0, 0, W, H);

  // "TOP ROW UNLOCKED" — appears fully on entry, fades slightly on exit.
  // Fade begins at 0.92 so the fully-lit row gets a genuine full-brightness
  // hold (spec: "lights up completely... holds for a beat"). The alpha is
  // scoped to the banner text ONLY — the key row must never inherit the fade
  // (the milestone reference set caught the whole frame dimming, 2026-07-12).
  const textAlpha = t < 0.92 ? 1 : 1 - (t - 0.92) / 0.08;
  const fontSize = Math.max(10, Math.floor(W * 0.016));
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = textAlpha;
  ctx.fillStyle = '#5c94fc';
  ctx.shadowColor = '#5c94fc';
  ctx.shadowBlur = 16 + Math.sin(t * Math.PI * 4) * 4;
  ctx.fillText('TOP ROW UNLOCKED', W / 2, H * 0.35);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // Top row key cascade — Q W E R T Y U I O P
  const keySize = Math.max(18, Math.floor(W * 0.038));
  const keyGap  = Math.round(keySize * 0.22);
  const rowW    = TOP_ROW.length * (keySize + keyGap) - keyGap;
  const rowX    = Math.round((W - rowW) / 2);
  const rowY    = Math.round(H * 0.52);

  // Cascade: key i lights at 0.10 + i*0.055 — last key (P) fully lit by
  // t = 0.595 + 0.06 ramp = 0.655, leaving a real full-brightness hold from
  // ~0.66 to the phase end (fade only touches the banner text, never the keys).
  TOP_ROW.forEach((label, i) => {
    const lightAt = 0.10 + i * 0.055;
    const lit = t >= lightAt;
    const keyT = lit ? Math.min(1, (t - lightAt) / 0.06) : 0;

    const kx = rowX + i * (keySize + keyGap);
    const ky = rowY;

    const bgCol  = lit ? `rgba(92,148,252,${0.15 + keyT * 0.1})` : '#0a0f18';
    const borCol = lit ? '#5c94fc' : '#1a2a40';
    const glow   = lit ? (8 + Math.sin(t * 4 + i * 0.5) * 3) * keyT : 0;

    ctx.fillStyle = bgCol;
    ctx.shadowColor = '#5c94fc';
    ctx.shadowBlur  = glow;
    fillR(kx, ky, keySize, keySize);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = borCol;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(kx + 0.5, ky + 0.5, keySize - 1, keySize - 1);

    const labelSize = Math.max(5, Math.floor(keySize * 0.32));
    ctx.font = `${labelSize}px "Press Start 2P", monospace`;
    ctx.fillStyle = lit ? '#5c94fc' : '#1a2a40';
    ctx.shadowColor = '#5c94fc';
    ctx.shadowBlur  = glow * 0.5;
    ctx.fillText(label, kx + keySize / 2, ky + keySize / 2);
    ctx.shadowBlur = 0;
  });

  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

// ─── Phase 1: The Seam ────────────────────────────────────────────────────────

function drawComputerWingRoom(W, H) {
  // Wall — NES blue-grey
  ctx.fillStyle = '#080e1c';
  ctx.fillRect(0, 0, W, H * 0.55);

  // Wall accent: horizontal cable trunking near ceiling
  ctx.fillStyle = '#0f1830';
  fillR(0, H * 0.08, W, H * 0.025);

  // Wall equipment silhouettes — monitors and blinking LEDs
  const monW = Math.round(W * 0.09);
  const monH = Math.round(H * 0.14);
  const positions = [0.06, 0.22, 0.52, 0.70, 0.86];
  positions.forEach((fx, i) => {
    const mx = Math.round(W * fx);
    const my = Math.round(H * 0.13);
    ctx.fillStyle = '#0c1828';
    fillR(mx, my, monW, monH);
    // Screen glow — NES blue
    ctx.fillStyle = '#162040';
    fillR(mx + 3, my + 3, monW - 6, monH - 8);
    ctx.fillStyle = '#1c3060';
    fillR(mx + 5, my + 5, monW - 10, monH - 14);
    // Blinking LED
    const blinkOn = Math.floor(Date.now() / 600 + i * 37) % 2 === 0;
    ctx.fillStyle = blinkOn ? '#00ff44' : '#004422';
    fillR(mx + 3, my + monH - 4, 3, 3);
  });

  // Floor — NES tile grid
  ctx.fillStyle = '#060c18';
  ctx.fillRect(0, H * 0.55, W, H * 0.45);

  // Tile grid
  const tileSize = Math.round(W * 0.05);
  ctx.strokeStyle = '#0c1428';
  ctx.lineWidth = 1;
  for (let tx = 0; tx < W; tx += tileSize) {
    ctx.beginPath(); ctx.moveTo(tx, H * 0.55); ctx.lineTo(tx, H); ctx.stroke();
  }
  for (let ty = H * 0.55; ty < H; ty += tileSize * 0.6) {
    ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(W, ty); ctx.stroke();
  }

  // Wall/floor seam
  ctx.fillStyle = '#0a1020';
  fillR(0, H * 0.54, W, H * 0.02);
}

// Trapdoor geometry: a rectangle in the floor
function trapdoor(W, H) {
  const tw = Math.round(W * 0.28);
  const th = Math.round(H * 0.22);
  const tx = Math.round((W - tw) / 2);
  const ty = Math.round(H * 0.63);
  return { tx, ty, tw, th };
}

function drawPhase1(t, W, H) {
  // Start sub-bass at beginning of seam phase
  if (t < 0.05) startSubBass();

  drawComputerWingRoom(W, H);

  const { tx, ty, tw, th } = trapdoor(W, H);

  // Seam appears: thin line first, then widens
  const seamWidth = Math.round(th * t * 0.35); // up to 35% of door height open
  const easeT = t * t; // ease in

  // Trapdoor outline
  ctx.strokeStyle = '#0e1830';
  ctx.lineWidth = 2;
  ctx.strokeRect(tx, ty, tw, th);

  if (t > 0.15) {
    const lightIntensity = (t - 0.15) / 0.85;
    const seamH = Math.round(th * easeT * 0.3);

    if (seamH > 0) {
      // Light bleeding up through the crack
      const lightGrad = ctx.createLinearGradient(0, ty + th / 2 - seamH, 0, ty + th / 2 + seamH);
      lightGrad.addColorStop(0, `rgba(0,0,0,0)`);
      lightGrad.addColorStop(0.3, `rgba(255,80,160,${lightIntensity * 0.6})`);
      lightGrad.addColorStop(0.5, `rgba(255,140,60,${lightIntensity * 0.9})`);
      lightGrad.addColorStop(0.7, `rgba(255,80,160,${lightIntensity * 0.6})`);
      lightGrad.addColorStop(1, `rgba(0,0,0,0)`);

      ctx.fillStyle = lightGrad;
      fillR(tx + 1, ty + Math.round(th / 2) - seamH, tw - 2, seamH * 2);

      // Upward light spill on wall
      if (lightIntensity > 0.3) {
        const wallSpill = ctx.createRadialGradient(
          W / 2, H * 0.55, 0,
          W / 2, H * 0.55, W * 0.4
        );
        wallSpill.addColorStop(0, `rgba(255, 80, 140, ${(lightIntensity - 0.3) * 0.15})`);
        wallSpill.addColorStop(0.5, `rgba(255, 120, 40, ${(lightIntensity - 0.3) * 0.08})`);
        wallSpill.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = wallSpill;
        ctx.fillRect(0, 0, W, H * 0.55);
      }
    }
  }
}

// ─── Phase 2: The Drop ────────────────────────────────────────────────────────

function drawPhase2(t, W, H) {
  if (t < 0.05) startGenesisFM();

  // Ease the trapdoor opening: slow start, fast middle
  const openAngle = Math.min(1, t < 0.2 ? t * t * 5 : 0.2 + (t - 0.2) * 1.0);

  drawComputerWingRoom(W, H);

  const { tx, ty, tw, th } = trapdoor(W, H);

  // Light flooding up from below — intensity grows with opening
  const lightBrightness = openAngle;

  // Underground glow (Act 3 palette: hot pink, orange, neon yellow)
  const basement = ctx.createLinearGradient(0, ty + th, 0, ty);
  basement.addColorStop(0.0, `rgba(255, 40, 120, ${lightBrightness * 0.95})`);
  basement.addColorStop(0.25,`rgba(255, 100, 20, ${lightBrightness * 0.85})`);
  basement.addColorStop(0.5, `rgba(255, 200, 0, ${lightBrightness * 0.7})`);
  basement.addColorStop(0.75,`rgba(120, 60, 200, ${lightBrightness * 0.5})`);
  basement.addColorStop(1.0, `rgba(0,0,0,0)`);
  ctx.fillStyle = basement;
  fillR(tx, ty - Math.round(th * 0.4 * openAngle), tw, th + Math.round(th * 0.4 * openAngle));

  // The open rectangle — fully reveals as angle increases
  const openH = Math.round(th * openAngle);
  if (openH > 0) {
    // Rich basement scene visible through gap (Act 3 quality)
    const bgGrad = ctx.createLinearGradient(0, ty + th - openH, 0, ty + th);
    bgGrad.addColorStop(0, '#ff2878');
    bgGrad.addColorStop(0.3, '#ff6400');
    bgGrad.addColorStop(0.6, '#7820c8');
    bgGrad.addColorStop(1, '#ff2878');
    ctx.fillStyle = bgGrad;
    fillR(tx + 1, ty + th - openH, tw - 2, openH);

    // Silhouetted shapes from the Basement — neon signs, cables
    if (openAngle > 0.4) {
      const alpha = (openAngle - 0.4) / 0.6;
      ctx.globalAlpha = alpha;
      // Neon sign silhouettes
      ctx.fillStyle = '#ff00aa';
      ctx.shadowColor = '#ff00aa';
      ctx.shadowBlur = 8;
      fillR(tx + Math.round(tw * 0.1), ty + th - Math.round(openH * 0.5), Math.round(tw * 0.15), 3);
      ctx.fillStyle = '#00ffaa';
      ctx.shadowColor = '#00ffaa';
      fillR(tx + Math.round(tw * 0.5), ty + th - Math.round(openH * 0.7), Math.round(tw * 0.1), 3);
      ctx.fillStyle = '#ff8800';
      ctx.shadowColor = '#ff8800';
      fillR(tx + Math.round(tw * 0.7), ty + th - Math.round(openH * 0.35), Math.round(tw * 0.12), 3);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // Trapdoor lip/hinge at top — stays fixed
    ctx.fillStyle = '#0e1830';
    fillR(tx, ty, tw, Math.round(th - openH));
    ctx.strokeStyle = '#1a2840';
    ctx.lineWidth = 2;
    ctx.strokeRect(tx + 0.5, ty + 0.5, tw - 1, th - openH);

    // Hinge detail
    ctx.fillStyle = '#304050';
    fillR(tx + Math.round(tw * 0.15), ty + Math.round(th - openH) - 3, 8, 5);
    fillR(tx + Math.round(tw * 0.75), ty + Math.round(th - openH) - 3, 8, 5);
  }

  // Colored upward light projection on walls (Act 3 colors washing up)
  const wallIntensity = openAngle * 0.3;
  if (wallIntensity > 0.02) {
    const spill = ctx.createRadialGradient(W / 2, H * 0.55, 0, W / 2, H * 0.3, W * 0.6);
    spill.addColorStop(0, `rgba(255, 40, 120, ${wallIntensity})`);
    spill.addColorStop(0.4, `rgba(255, 100, 20, ${wallIntensity * 0.6})`);
    spill.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = spill;
    ctx.fillRect(0, 0, W, H * 0.55);
  }
}

// ─── Phase 3: Title Card ──────────────────────────────────────────────────────

function drawPhase3(elapsedSec, W, H) {
  // Fade in over 1.2s
  const alpha = Math.min(1, elapsedSec / 1.2);

  ctx.globalAlpha = alpha;

  // "ACT 3" — large, in 16-bit neon (Act 3 palette breakthrough moment)
  const actFontSize = Math.max(16, Math.floor(W * 0.022));
  ctx.font = `${actFontSize}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff2878';
  ctx.shadowColor = '#ff2878';
  ctx.shadowBlur = 20 + Math.sin(elapsedSec * 2.2) * 6;
  ctx.fillText('ACT 3', W / 2, H * 0.38);

  // "THE BASEMENT"
  const nameFontSize = Math.max(9, Math.floor(W * 0.012));
  ctx.font = `${nameFontSize}px "Press Start 2P", monospace`;
  ctx.fillStyle = '#ff8800';
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 12;
  ctx.fillText('THE BASEMENT', W / 2, H * 0.48);

  ctx.shadowBlur = 0;

  // "PRESS SPACE TO CONTINUE" — blinking
  const blinkOn = Math.floor(elapsedSec * 1.4) % 2 === 0;
  if (blinkOn && elapsedSec > 1.0) {
    const promptSize = Math.max(6, Math.floor(W * 0.007));
    ctx.font = `${promptSize}px "Press Start 2P", monospace`;
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

  canvas.width = canvas.width; // clear
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

export function start(callback) {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  onDone = callback;
  active = true;
  lastPhase = -1;
  milestoneJinglePlayed = false;
  bassNodes = [];
  fmNodes   = [];

  // Defensively hide any visible title/game DOM so it can never bleed through
  // on top of the cinematic canvas. Restored in stop().
  hideAllScreens();

  startTime = performance.now();
  animId    = requestAnimationFrame(render);
}

export function confirm() {
  if (!active) return;
  const ms = performance.now() - startTime;
  if (getPhase(ms) < 3) {
    // First press: skip to title card
    stopAllAudio();
    startTime = performance.now() - P.TITLECARD.s;
    return;
  }
  // On title card: done
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
