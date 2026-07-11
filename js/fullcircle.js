// Act 4 → Act 5 transition: Full Circle
// Triggered after Level 20 (Terminal / binary → HELLO) completion. ~35 seconds, skippable.
// Ends on a standard title card (ACT 5 / FULL CIRCLE) — Act 5 now opens with three
// Corner Cabinets levels (Out Run, Q*bert, Missile Command) before Shift/Space, so
// this transition does NOT morph directly into name-typing.

import * as Audio from './audio.js';

let canvas, ctx;
let animId = null;
let active = false;
let startTime = 0;
let onDone = null;
let audioCtx = null;
let washNodes = [];

// Phase boundaries (ms)
const P = {
  TERMINAL: { s: 0,     e: 8000  },  // 0 — terminal holds HELLO, types two lines
  RETURN:   { s: 8000,  e: 18000 },  // 1 — reverse montage through the four acts
  ARCADE:   { s: 18000, e: 27000 },  // 2 — the arcade, fully lit
  TITLECARD:{ s: 27000, e: Infinity },// 3 — ACT 5 / FULL CIRCLE
};
const PHASE_ORDER = ['TERMINAL', 'RETURN', 'ARCADE', 'TITLECARD'];

// ─── Audio ───────────────────────────────────────────────────────────────────

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, dur, type = 'square', vol = 0.03, delay = 0) {
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

function playKeyclick() {
  playTone(440, 0.05, 'square', 0.025);
}

// Short 2-3 note motif per environment, quiet, distinct register.
function playMotif(freqs, type = 'square', vol = 0.025) {
  freqs.forEach((freq, i) => playTone(freq, 0.22, type, vol, i * 0.11));
}

function startArcadeWash() {
  if (washNodes.length) return;
  const c = getAudioCtx();
  // Layered soft chiptune wash — 4 quiet detuned square oscillators
  const freqs = [130.8, 164.8, 196.0, 261.6]; // C3 E3 G3 C4 — warm major chord
  washNodes = freqs.map((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq + (i % 2 === 0 ? -1.5 : 1.5), c.currentTime);
    gain.gain.setValueAtTime(0.0001, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.012 - i * 0.002, c.currentTime + 1.5);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    return { osc, gain };
  });
}

function stopAllAudio() {
  const c = getAudioCtx();
  washNodes.forEach(({ osc, gain }) => {
    gain.gain.linearRampToValueAtTime(0.0001, c.currentTime + 1.0);
    osc.stop(c.currentTime + 1.1);
  });
  washNodes = [];
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

// ─── Phase 0: Terminal holds ───────────────────────────────────────────────────

const TERMINAL_LINES = [
  { text: 'YOU BUILT THIS.', delay: 2600 },
  { text: '',                delay: 4800 }, // blank line pause
  { text: 'NOW GO BACK.',    delay: 5600 },
];

let termEvents = null;
function buildTermEvents() {
  if (termEvents) return;
  termEvents = [];
  TERMINAL_LINES.forEach(line => {
    const ms = line.delay;
    for (let i = 0; i < line.text.length; i++) {
      termEvents.push({ ms: ms + i * 110, char: line.text[i] });
    }
    if (line.text.length === 0) {
      termEvents.push({ ms: line.delay, char: null });
    }
  });
}

let termClicksPlayed = new Set();

function drawPhase0(elapsedMs, W, H) {
  buildTermEvents();

  // Black CRT background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  const fontSize = Math.max(9, Math.floor(W * 0.013));
  const marginX  = Math.round(W * 0.08);
  const y1 = Math.round(H * 0.34);
  const y2 = Math.round(H * 0.44);

  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  // Binary row — the Level 20 end state, held
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

  // Typed lines below, character by character with keyclick
  let lastEventIdx = -1;
  termEvents.forEach((ev, i) => {
    if (ev.ms <= elapsedMs) {
      lastEventIdx = i;
      if (!termClicksPlayed.has(i) && ev.char !== null) {
        playKeyclick();
        termClicksPlayed.add(i);
      }
    }
  });

  let lines = [''];
  termEvents.forEach(ev => {
    if (ev.ms > elapsedMs) return;
    if (ev.char === null) {
      lines.push('');
    } else {
      lines[lines.length - 1] += ev.char;
    }
  });

  const lineH = fontSize + Math.round(fontSize * 0.7);
  const typedY = Math.round(H * 0.58);
  ctx.fillStyle = '#39ff14';
  ctx.shadowColor = '#39ff14';
  ctx.shadowBlur = 6;
  lines.forEach((line, li) => {
    ctx.fillText(line, marginX, typedY + li * lineH);
  });

  // Blinking cursor after last char
  const showCursor = Math.floor(elapsedMs / 500) % 2 === 0;
  if (showCursor) {
    const lastLine = lines[lines.length - 1];
    const lastWidth = ctx.measureText(lastLine).width;
    const cursorY = typedY + (lines.length - 1) * lineH;
    ctx.fillStyle = '#39ff14';
    fillR(marginX + lastWidth + 2, cursorY, Math.round(fontSize * 0.55), fontSize);
  }

  ctx.shadowBlur = 0;
  ctx.textBaseline = 'alphabetic';
}

// ─── Phase 1: The Return — reverse montage ────────────────────────────────────

// Four environment "flashes", each ~2.2s within the RETURN phase's 10s span.
const MONTAGE_ROOMS = ['COMMAND_CENTER', 'BASEMENT', 'COMPUTER_WING', 'ARCADE_DOOR'];
const ROOM_SPAN = 1 / MONTAGE_ROOMS.length;

let montagePlayed = new Set();

function drawCommandCenterFlash(a, W, H) {
  ctx.fillStyle = '#04080a';
  fillR(0, 0, W, H);
  // Server racks with blinking green LEDs, blue-white glow
  const rackW = Math.round(W * 0.09);
  const rackH = Math.round(H * 0.42);
  const rackY = Math.round(H * 0.3);
  const count = 5;
  const totalW = count * (rackW * 1.3);
  const startX = Math.round((W - totalW) / 2);

  const grad = ctx.createRadialGradient(W / 2, H * 0.5, 0, W / 2, H * 0.5, W * 0.5);
  grad.addColorStop(0, `rgba(120, 160, 255, ${0.18 * a})`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  fillR(0, 0, W, H);

  for (let i = 0; i < count; i++) {
    const rx = startX + i * rackW * 1.3;
    ctx.fillStyle = `rgba(15, 25, 45, ${a})`;
    fillR(rx, rackY, rackW, rackH);
    ctx.strokeStyle = `rgba(120, 160, 220, ${a * 0.6})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(rx + 0.5, rackY + 0.5, rackW - 1, rackH - 1);
    const blinkOn = Math.floor(performance.now() / 450 + i * 13) % 2 === 0;
    ctx.fillStyle = blinkOn ? `rgba(0,255,90,${a})` : `rgba(0,90,40,${a})`;
    fillR(rx + rackW * 0.2, rackY + rackH * 0.12, rackW * 0.16, rackW * 0.16);
    ctx.fillStyle = `rgba(150,190,255,${a * 0.8})`;
    fillR(rx + rackW * 0.2, rackY + rackH * 0.32, rackW * 0.6, rackH * 0.02);
    fillR(rx + rackW * 0.2, rackY + rackH * 0.42, rackW * 0.6, rackH * 0.02);
  }
}

function drawBasementFlash(a, W, H) {
  ctx.fillStyle = '#04080a';
  fillR(0, 0, W, H);
  // Dark floor grid + neon pink floor-edge glow
  const floorY = H * 0.55;
  ctx.fillStyle = `rgba(6, 10, 14, ${a})`;
  fillR(0, floorY, W, H - floorY);

  ctx.strokeStyle = `rgba(20, 30, 40, ${a})`;
  ctx.lineWidth = 1;
  const tile = Math.round(W * 0.06);
  for (let x = 0; x < W; x += tile) {
    ctx.beginPath(); ctx.moveTo(x, floorY); ctx.lineTo(x, H); ctx.stroke();
  }

  ctx.strokeStyle = `rgba(255, 32, 96, ${a})`;
  ctx.lineWidth = 2;
  ctx.shadowColor = `rgba(255, 32, 96, ${a})`;
  ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.moveTo(0, floorY); ctx.lineTo(W, floorY); ctx.stroke();
  ctx.shadowBlur = 0;

  const grad = ctx.createLinearGradient(0, floorY - H * 0.1, 0, floorY);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, `rgba(255, 32, 96, ${0.15 * a})`);
  ctx.fillStyle = grad;
  fillR(0, floorY - H * 0.1, W, H * 0.1);
}

function drawComputerWingFlash(a, W, H) {
  ctx.fillStyle = '#100c06';
  fillR(0, 0, W, H);
  // Warm NES-era room with a doorway of amber light
  const doorW = Math.round(W * 0.22);
  const doorH = Math.round(H * 0.55);
  const doorX = Math.round((W - doorW) / 2);
  const doorY = Math.round(H * 0.3);

  const grad = ctx.createRadialGradient(
    doorX + doorW / 2, doorY + doorH / 2, 0,
    doorX + doorW / 2, doorY + doorH / 2, doorW * 1.4
  );
  grad.addColorStop(0, `rgba(255, 190, 100, ${0.55 * a})`);
  grad.addColorStop(0.5, `rgba(220, 140, 60, ${0.25 * a})`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  fillR(doorX - doorW, doorY - doorH * 0.3, doorW * 3, doorH * 1.6);

  ctx.fillStyle = `rgba(255, 210, 140, ${0.85 * a})`;
  fillR(doorX, doorY, doorW, doorH);

  ctx.strokeStyle = `rgba(80, 50, 20, ${a})`;
  ctx.lineWidth = 3;
  ctx.strokeRect(doorX - 2, doorY - 2, doorW + 4, doorH + 4);
}

function drawArcadeDoorFlash(a, W, H) {
  ctx.fillStyle = '#050505';
  fillR(0, 0, W, H);
  // Arcade back wall with the open Mystery door
  const doorW = Math.round(W * 0.16);
  const doorH = Math.round(H * 0.5);
  const doorX = Math.round(W * 0.58);
  const doorY = Math.round(H * 0.32);

  // Silhouette wall texture
  ctx.fillStyle = `rgba(20, 16, 24, ${a})`;
  fillR(0, H * 0.28, W, H * 0.6);

  const grad = ctx.createRadialGradient(
    doorX + doorW / 2, doorY + doorH / 2, 0,
    doorX + doorW / 2, doorY + doorH / 2, doorW * 1.6
  );
  grad.addColorStop(0, `rgba(255, 170, 60, ${0.5 * a})`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  fillR(doorX - doorW, doorY - doorH * 0.2, doorW * 3, doorH * 1.4);

  ctx.fillStyle = `rgba(255, 200, 120, ${0.8 * a})`;
  fillR(doorX, doorY, doorW, doorH);

  // A hint of a cabinet silhouette beside the door
  const cabW = Math.round(W * 0.06);
  const cabH = Math.round(H * 0.28);
  ctx.fillStyle = `rgba(10, 8, 12, ${a})`;
  fillR(doorX - cabW * 1.6, doorY + doorH - cabH, cabW, cabH);
}

function drawPhase1(t, W, H) {
  ctx.fillStyle = '#000';
  fillR(0, 0, W, H);

  const roomIdx = Math.min(MONTAGE_ROOMS.length - 1, Math.floor(t / ROOM_SPAN));
  const roomT = (t - roomIdx * ROOM_SPAN) / ROOM_SPAN; // 0..1 within this room's slice

  // Fade in (first 25%) / hold / fade out (last 25%)
  let a;
  if (roomT < 0.25) a = roomT / 0.25;
  else if (roomT > 0.75) a = (1 - roomT) / 0.25;
  else a = 1;
  a = Math.max(0, Math.min(1, a));

  if (!montagePlayed.has(roomIdx) && roomT > 0.03) {
    montagePlayed.add(roomIdx);
    // Short 2-3 note motif per environment, quiet, different pitch register
    const motifs = [
      [220.0, 174.6, 130.8],   // Command Center — low, cool
      [246.9, 293.7, 220.0],   // Basement — mid, neon
      [349.2, 440.0],          // Computer Wing — warm, NES-ish
      [523.3, 659.3, 783.9],   // Arcade door — bright, high
    ];
    playMotif(motifs[roomIdx] || [330], 'square', 0.02);
  }

  ctx.globalAlpha = a;
  switch (MONTAGE_ROOMS[roomIdx]) {
    case 'COMMAND_CENTER': drawCommandCenterFlash(1, W, H); break;
    case 'BASEMENT': drawBasementFlash(1, W, H); break;
    case 'COMPUTER_WING': drawComputerWingFlash(1, W, H); break;
    case 'ARCADE_DOOR': drawArcadeDoorFlash(1, W, H); break;
  }
  ctx.globalAlpha = 1;
}

// ─── Phase 2: The Arcade, Fully Lit ────────────────────────────────────────────

const CABINETS = ['BREAKOUT', 'INVADERS', 'PACMAN', 'GALAGA', 'JOUST'];

function drawCabinetScreen(kind, sx, sy, sw, sh, tSec) {
  // Tiny pixel-art impression inside the cabinet screen — a few pixels each.
  switch (kind) {
    case 'BREAKOUT': {
      ctx.fillStyle = '#e8e8e8';
      const paddleW = sw * 0.3;
      const paddleX = sx + sw * 0.5 - paddleW / 2 + Math.sin(tSec * 1.6) * sw * 0.18;
      fillR(paddleX, sy + sh * 0.82, paddleW, sh * 0.06);
      const ballX = sx + sw * 0.5 + Math.sin(tSec * 2.1) * sw * 0.3;
      const ballY = sy + sh * 0.4 + Math.abs(Math.sin(tSec * 1.3)) * sh * 0.25;
      fillR(ballX, ballY, sw * 0.05, sw * 0.05);
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 4; c++) {
          fillR(sx + sw * 0.1 + c * sw * 0.2, sy + sh * 0.15 + r * sh * 0.08, sw * 0.16, sh * 0.05);
        }
      }
      break;
    }
    case 'INVADERS': {
      ctx.fillStyle = '#39ff14';
      const marchX = (Math.sin(tSec * 1.2) * sw * 0.12);
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 4; c++) {
          fillR(sx + sw * 0.14 + c * sw * 0.2 + marchX, sy + sh * 0.2 + r * sh * 0.16, sw * 0.1, sh * 0.08);
        }
      }
      break;
    }
    case 'PACMAN': {
      ctx.fillStyle = '#ffd400';
      const pmX = sx + sw * (0.15 + (Math.sin(tSec * 0.9) * 0.5 + 0.5) * 0.6);
      fillR(pmX, sy + sh * 0.45, sw * 0.12, sw * 0.12);
      ctx.fillStyle = '#cfd8ff';
      for (let i = 0; i < 4; i++) {
        const dx = sx + sw * 0.15 + i * sw * 0.16;
        if (dx > pmX + sw * 0.1) fillR(dx, sy + sh * 0.49, sw * 0.03, sw * 0.03);
      }
      break;
    }
    case 'GALAGA': {
      const sparkle = Math.abs(Math.sin(tSec * 3)) ;
      ctx.fillStyle = `rgba(255,255,255,${0.4 + sparkle * 0.6})`;
      for (let i = 0; i < 5; i++) {
        const sxp = sx + ((i * 37 + tSec * 12) % sw);
        const syp = sy + ((i * 53) % sh);
        fillR(sxp, syp, 1.5, 1.5);
      }
      ctx.fillStyle = '#ff4444';
      fillR(sx + sw * 0.4, sy + sh * 0.3, sw * 0.08, sh * 0.06);
      fillR(sx + sw * 0.55, sy + sh * 0.3, sw * 0.08, sh * 0.06);
      break;
    }
    case 'JOUST': {
      ctx.fillStyle = '#ff7a1a';
      const flick = Math.abs(Math.sin(tSec * 4)) * sh * 0.04;
      fillR(sx + sw * 0.1, sy + sh * 0.8 - flick, sw * 0.8, sh * 0.15 + flick);
      ctx.fillStyle = '#d2b48c';
      const bob = Math.sin(tSec * 2.4) * sh * 0.03;
      fillR(sx + sw * 0.4, sy + sh * 0.4 + bob, sw * 0.12, sh * 0.14);
      break;
    }
  }
}

function drawPhase2(t, W, H) {
  if (t < 0.05) startArcadeWash();

  ctx.fillStyle = '#050505';
  fillR(0, 0, W, H);

  const nowSec = performance.now() / 1000;
  const fadeIn = Math.min(1, t / 0.15);

  // Warm layered glow filling the room
  const grad = ctx.createRadialGradient(W / 2, H * 0.55, 0, W / 2, H * 0.55, W * 0.7);
  grad.addColorStop(0, `rgba(255, 180, 90, ${0.12 * fadeIn})`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  fillR(0, 0, W, H);

  // Five cabinets in a row
  const cabW = Math.round(W * 0.1);
  const cabH = Math.round(H * 0.34);
  const gap = Math.round(W * 0.03);
  const totalW = CABINETS.length * cabW + (CABINETS.length - 1) * gap;
  const startX = Math.round((W - totalW) / 2);
  const cabY = Math.round(H * 0.42);

  const cabColors = ['#ffffff', '#39ff14', '#ffd400', '#ff5a5a', '#ff9a3c'];

  CABINETS.forEach((kind, i) => {
    const cx = startX + i * (cabW + gap);
    const glowColor = cabColors[i];

    ctx.save();
    ctx.globalAlpha = fadeIn;

    // Cabinet body silhouette
    ctx.fillStyle = '#171018';
    fillR(cx, cabY, cabW, cabH);
    ctx.strokeStyle = '#2a2030';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx + 0.5, cabY + 0.5, cabW - 1, cabH - 1);

    // Screen bezel + glowing screen
    const sx = cx + cabW * 0.12;
    const sy = cabY + cabH * 0.12;
    const sw = cabW * 0.76;
    const sh = cabH * 0.42;

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#050505';
    fillR(sx, sy, sw, sh);
    ctx.shadowBlur = 0;

    drawCabinetScreen(kind, sx, sy, sw, sh, nowSec + i);

    // Marquee glow strip
    ctx.fillStyle = glowColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8;
    fillR(cx + cabW * 0.08, cabY - cabH * 0.05, cabW * 0.84, cabH * 0.04);
    ctx.shadowBlur = 0;

    ctx.restore();
  });

  // Far corner: three small dark cabinets, faint amber pulse — Corner Cabinets teaser
  const pulse = 0.15 + Math.abs(Math.sin(nowSec * 1.1)) * 0.12;
  const teaserW = Math.round(W * 0.045);
  const teaserH = Math.round(H * 0.15);
  const teaserY = Math.round(H * 0.66);
  const teaserStartX = Math.round(W * 0.06);

  for (let i = 0; i < 3; i++) {
    const tx = teaserStartX + i * (teaserW * 1.4);
    ctx.globalAlpha = fadeIn;
    ctx.fillStyle = '#0a0608';
    fillR(tx, teaserY, teaserW, teaserH);
    ctx.strokeStyle = `rgba(255, 150, 60, ${pulse})`;
    ctx.shadowColor = `rgba(255, 150, 60, ${pulse})`;
    ctx.shadowBlur = 6;
    ctx.lineWidth = 1;
    ctx.strokeRect(tx + 0.5, teaserY + 0.5, teaserW - 1, teaserH - 1);
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;
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
  ctx.fillStyle = '#ff5aa0';
  ctx.shadowColor = '#ff5aa0';
  ctx.shadowBlur = 20 + Math.sin(elapsedSec * 2.0) * 5;
  ctx.fillText('ACT 5', W / 2, H * 0.36);

  const nameSize = Math.max(9, Math.floor(W * 0.011));
  ctx.font = `${nameSize}px "Press Start 2P", monospace`;
  ctx.fillStyle = '#c8c8e8';
  ctx.shadowColor = '#c8c8e8';
  ctx.shadowBlur = 10;
  ctx.fillText('FULL CIRCLE', W / 2, H * 0.47);

  ctx.shadowBlur = 0;

  const dimSize = Math.max(6, Math.floor(W * 0.0075));
  ctx.font = `${dimSize}px "Press Start 2P", monospace`;
  ctx.fillStyle = '#5a5a72';
  ctx.fillText('THREE CABINETS STILL FLICKER IN THE CORNER', W / 2, H * 0.58);

  const blinkOn = Math.floor(elapsedSec * 1.4) % 2 === 0;
  if (blinkOn && elapsedSec > 1.0) {
    const pSize = Math.max(6, Math.floor(W * 0.007));
    ctx.font = `${pSize}px "Press Start 2P", monospace`;
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 6;
    ctx.fillText('PRESS SPACE TO CONTINUE', W / 2, H * 0.7);
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
    case 0: drawPhase0(ms - P.TERMINAL.s, W, H); break;
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

  onDone   = callback;
  active   = true;
  lastPhase = -1;
  termClicksPlayed = new Set();
  montagePlayed = new Set();
  washNodes = [];

  startTime = performance.now();
  animId    = requestAnimationFrame(render);
}

export function confirm() {
  if (!active) return;
  const ms = performance.now() - startTime;
  if (getPhase(ms) < 3) {
    stopAllAudio();
    startTime = performance.now() - P.TITLECARD.s;
    return;
  }
  stop();
  if (onDone) onDone();
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  stopAllAudio();
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
