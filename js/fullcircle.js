// Act 4 → Act 5 transition: Full Circle
// Triggered after Level 20 (Terminal / binary → HELLO) completion. ~45 seconds, skippable.
//
// Spec: .claude/rules/transitions.md → "Act 4 → 5 Transition — Full Circle".
// Phase 0 THE TERMINAL HOLDS  — binary→HELLO held, "YOU BUILT THIS. NOW GO BACK." typed.
// Phase 1 THE RETURN          — fast reverse MONTAGE through every environment, each
//                               vignette rendered at its own act's graphic quality
//                               (Command Center → Basement → Computer Wing → arcade door).
// Phase 2 THE ARCADE, FULLY LIT — the original room at full capacity: all five Act-1
//                               cabinets ON, warm layered glow washing floor + wall,
//                               the open Mystery door + trapdoor seam, the three Corner
//                               Cabinets flickering dimly. "No text. Just the room, breathing."
// Phase 3 THE OPENING SCREEN  — the game's opening "READY [NAME]!" callback (NOT a title
//                               card — spec: "There is no separate title card, no Space to
//                               continue"). Matches the ready-screen layout: READY, the
//                               pre-filled name, and "TYPE YOUR NAME" where "PRESS SPACE TO
//                               BEGIN" used to be. Level 21 begins right there — Space still
//                               hands off to the Level-21 ready screen via confirm()/onDone.
//
// The player name is rendered with canvas fillText ONLY (never DOM), sourced from the
// sanitized settings model (getSettings().playerName — validated + length-capped).

import * as Audio from './audio.js';
import { getSettings } from './settings.js';

let canvas, ctx;
let animId = null;
let active = false;
let startTime = 0;
let onDone = null;
let audioCtx = null;
let washNodes = [];
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

// Phase boundaries (ms). Total ~45s per spec.
const P = {
  TERMINAL: { s: 0,     e: 12000 },  // 0 — terminal holds HELLO, types two lines (~8-12s)
  RETURN:   { s: 12000, e: 24000 },  // 1 — reverse montage through the four acts (~12s)
  ARCADE:   { s: 24000, e: 34000 },  // 2 — the arcade, fully lit (~10s)
  OPENING:  { s: 34000, e: Infinity },// 3 — the opening "READY [NAME]!" screen callback
};
const PHASE_ORDER = ['TERMINAL', 'RETURN', 'ARCADE', 'OPENING'];

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

// CRT scanline overlay — a stack of faint dark horizontal lines the whole game
// wears. Cheap, bounded (steps every 3px), used to make the arcade phases feel
// like real CRTs (spec's "scanlines. The hum of CRTs.").
function drawScanlines(W, H, alpha = 0.16) {
  ctx.save();
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
  for (let y = 0; y < H; y += 3) {
    ctx.fillRect(0, y, W, 1);
  }
  ctx.restore();
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
  const lineH0 = fontSize + Math.round(fontSize * 0.7);
  // Vertically center the whole terminal block. It has: binary row, decoded
  // row, a gap, then up to 3 typed lines. Anchor the block so its middle sits
  // at ~0.48H (the panels aren't present in this phase, so true-ish center).
  const blockRows = 2 /*binary+decoded*/ + 1.6 /*gap*/ + 2 /*two typed lines*/;
  const blockH = blockRows * lineH0;
  const y1 = Math.round(H * 0.47 - blockH / 2);
  const y2 = y1 + Math.round(lineH0 * 1.15);

  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  // Center the whole terminal block: anchor its left edge so the widest row
  // (the binary string) is horizontally centered. All rows share this left
  // edge, preserving the authentic left-aligned terminal look inside a block
  // that reads as centered on screen (fixes the old off-to-the-left anchor).
  const binStr = '01001000 01000101 01001100 01001100 01001111';
  const binWidth = ctx.measureText(binStr).width;
  const marginX = Math.round((W - binWidth) / 2);

  // Binary row — the Level 20 end state, held
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

  const lineH = lineH0;
  const typedY = y2 + Math.round(lineH * 1.6);
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
  drawScanlines(W, H, 0.12);
  ctx.textBaseline = 'alphabetic';
}

// ─── Phase 1: The Return — reverse montage ────────────────────────────────────

// Four environment "flashes", each ~2.2s within the RETURN phase's 10s span.
const MONTAGE_ROOMS = ['COMMAND_CENTER', 'BASEMENT', 'COMPUTER_WING', 'ARCADE_DOOR'];
const ROOM_SPAN = 1 / MONTAGE_ROOMS.length;

let montagePlayed = new Set();

// A small caption naming each memory as it flashes past — a beat of legibility
// so a still frame reads unambiguously. Bottom-strip stage region, dim.
function drawFlashCaption(text, color, W, H) {
  const size = Math.max(7, Math.floor(W * 0.009));
  ctx.font = `${size}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.fillText(text, W / 2, Math.round(H * 0.93));
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
}

// ── Command Center (Act 4, late-90s) — server room, blue-white monitors ──────
function drawCommandCenterFlash(a, W, H) {
  ctx.fillStyle = '#040810';
  fillR(0, 0, W, H);

  // Cool blue-white ambient wash
  const grad = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, W * 0.55);
  grad.addColorStop(0, `rgba(90, 140, 230, ${0.22 * a})`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  fillR(0, 0, W, H);

  const now = performance.now() / 1000;

  // A back wall of glowing monitors (top band), blue-white screens with green text lines
  const monCols = 6, monRows = 2;
  const monW = Math.round(W * 0.1), monH = Math.round(H * 0.11);
  const monGapX = Math.round(W * 0.028), monGapY = Math.round(H * 0.03);
  const monTotalW = monCols * monW + (monCols - 1) * monGapX;
  const monX0 = Math.round((W - monTotalW) / 2);
  const monY0 = Math.round(H * 0.12);
  for (let r = 0; r < monRows; r++) {
    for (let c = 0; c < monCols; c++) {
      const mx = monX0 + c * (monW + monGapX);
      const my = monY0 + r * (monH + monGapY);
      ctx.fillStyle = `rgba(20, 40, 70, ${a})`;
      fillR(mx, my, monW, monH);
      ctx.save();
      ctx.shadowColor = `rgba(120, 180, 255, ${a})`;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = `rgba(150, 200, 255, ${a * 0.9})`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(mx + 0.5, my + 0.5, monW - 1, monH - 1);
      ctx.restore();
      // Scrolling green terminal lines
      ctx.fillStyle = `rgba(60, 230, 120, ${a * 0.8})`;
      for (let ln = 0; ln < 4; ln++) {
        const scroll = (now * 8 + c * 3 + r * 5 + ln * 2) % 5;
        const lw = monW * (0.3 + 0.5 * ((ln + c) % 3) / 2);
        fillR(mx + monW * 0.12, my + monH * (0.15 + ln * 0.2) + scroll * 0.4, lw, monH * 0.06);
      }
    }
  }

  // Server racks along the floor (bottom band) with blinking LEDs
  const rackCount = 7;
  const rackW = Math.round(W * 0.07), rackH = Math.round(H * 0.3);
  const rackGap = Math.round(W * 0.025);
  const rackTotal = rackCount * rackW + (rackCount - 1) * rackGap;
  const rackX0 = Math.round((W - rackTotal) / 2);
  const rackY = Math.round(H * 0.58);
  for (let i = 0; i < rackCount; i++) {
    const rx = rackX0 + i * (rackW + rackGap);
    ctx.fillStyle = `rgba(18, 26, 40, ${a})`;
    fillR(rx, rackY, rackW, rackH);
    ctx.strokeStyle = `rgba(90, 130, 190, ${a * 0.6})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(rx + 0.5, rackY + 0.5, rackW - 1, rackH - 1);
    // Rack units + blinking LEDs
    for (let u = 0; u < 6; u++) {
      const uy = rackY + rackH * (0.08 + u * 0.14);
      ctx.fillStyle = `rgba(30, 45, 65, ${a})`;
      fillR(rx + rackW * 0.12, uy, rackW * 0.76, rackH * 0.09);
      const on = Math.floor(now * 3 + i * 5 + u * 7) % 2 === 0;
      ctx.fillStyle = on ? `rgba(60, 255, 120, ${a})` : `rgba(20, 90, 50, ${a})`;
      fillR(rx + rackW * 0.16, uy + rackH * 0.02, rackW * 0.08, rackH * 0.05);
      ctx.fillStyle = `rgba(120, 180, 255, ${a * 0.7})`;
      fillR(rx + rackW * 0.3, uy + rackH * 0.02, rackW * 0.05, rackH * 0.05);
    }
  }

  drawScanlines(W, H, 0.14 * a);
  drawFlashCaption('THE COMMAND CENTER', `rgba(150, 200, 255, ${a})`, W, H);
}

// ── Basement (Act 3, early-90s) — neon trapdoor room, pink/orange ────────────
function drawBasementFlash(a, W, H) {
  ctx.fillStyle = '#0a0410';
  fillR(0, 0, W, H);

  const now = performance.now() / 1000;

  // Saturated neon ambient wash (pink → orange)
  const wash = ctx.createRadialGradient(W / 2, H * 0.5, 0, W / 2, H * 0.5, W * 0.6);
  wash.addColorStop(0, `rgba(255, 60, 150, ${0.22 * a})`);
  wash.addColorStop(0.6, `rgba(255, 130, 40, ${0.12 * a})`);
  wash.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = wash;
  fillR(0, 0, W, H);

  // Perspective floor grid glowing pink from a horizon
  const horizonY = H * 0.5;
  ctx.strokeStyle = `rgba(255, 40, 130, ${a * 0.8})`;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = `rgba(255, 40, 130, ${a})`;
  ctx.shadowBlur = 8;
  // Horizontal receding lines
  for (let i = 1; i <= 7; i++) {
    const p = i / 7;
    const y = horizonY + (H - horizonY) * (p * p);
    ctx.globalAlpha = a * (0.3 + 0.7 * p);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  // Vanishing-point verticals
  for (let i = -6; i <= 6; i++) {
    ctx.globalAlpha = a * 0.5;
    ctx.beginPath();
    ctx.moveTo(W / 2 + i * W * 0.02, horizonY);
    ctx.lineTo(W / 2 + i * W * 0.13, H);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // Neon sign strips on the back wall (orange), flickering
  const signY = H * 0.16;
  const flick = 0.7 + 0.3 * Math.sin(now * 9);
  ctx.save();
  ctx.shadowColor = `rgba(255, 140, 30, ${a})`;
  ctx.shadowBlur = 14;
  ctx.fillStyle = `rgba(255, 150, 40, ${a * flick})`;
  fillR(W * 0.18, signY, W * 0.24, H * 0.02);
  fillR(W * 0.58, signY + H * 0.04, W * 0.2, H * 0.02);
  ctx.fillStyle = `rgba(255, 60, 150, ${a})`;
  ctx.shadowColor = `rgba(255, 60, 150, ${a})`;
  fillR(W * 0.4, signY - H * 0.03, W * 0.06, H * 0.08);
  ctx.restore();

  // Open trapdoor seam — light spilling up (this room WAS reached by a trapdoor)
  ctx.save();
  const tg = ctx.createLinearGradient(0, horizonY - H * 0.08, 0, horizonY);
  tg.addColorStop(0, 'rgba(0,0,0,0)');
  tg.addColorStop(1, `rgba(255, 90, 160, ${0.25 * a})`);
  ctx.fillStyle = tg;
  fillR(W * 0.32, horizonY - H * 0.08, W * 0.36, H * 0.08);
  ctx.restore();

  drawScanlines(W, H, 0.12 * a);
  drawFlashCaption('THE BASEMENT', `rgba(255, 90, 170, ${a})`, W, H);
}

// ── Computer Wing (Act 2, NES-era) — a wall of era screens, warm ─────────────
function drawComputerWingFlash(a, W, H) {
  ctx.fillStyle = '#0e0a04';
  fillR(0, 0, W, H);

  const now = performance.now() / 1000;

  // Warm NES ambient
  const wash = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, W * 0.6);
  wash.addColorStop(0, `rgba(220, 160, 80, ${0.16 * a})`);
  wash.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = wash;
  fillR(0, 0, W, H);

  // A wall of small CRTs/consoles running different NES-palette scenes
  const cols = 4, rows = 2;
  const scW = Math.round(W * 0.16), scH = Math.round(H * 0.24);
  const gx = Math.round(W * 0.04), gy = Math.round(H * 0.05);
  const totalW = cols * scW + (cols - 1) * gx;
  const x0 = Math.round((W - totalW) / 2);
  const y0 = Math.round(H * 0.16);

  // NES-ish palette per screen
  const palettes = [
    ['#3050a0', '#88b0ff', '#a02020'], // sky/blue+brick — Mario-ish
    ['#103818', '#40a040', '#e8c040'], // green field + gold — Zelda-ish
    ['#101018', '#40e0e0', '#e04040'], // dark + cyan/red — DK-ish
    ['#201040', '#a040e0', '#ffd000'], // purple + gold — adventure
  ];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sx = x0 + c * (scW + gx);
      const sy = y0 + r * (scH + gy);
      const pal = palettes[(r * cols + c) % palettes.length];
      // Console/TV body
      ctx.fillStyle = `rgba(40, 30, 20, ${a})`;
      fillR(sx - scW * 0.06, sy - scH * 0.06, scW * 1.12, scH * 1.18);
      // Screen bg
      ctx.fillStyle = hexA(pal[0], a);
      fillR(sx, sy, scW, scH);
      // Glow bezel
      ctx.save();
      ctx.shadowColor = hexA(pal[1], a);
      ctx.shadowBlur = 8;
      ctx.strokeStyle = hexA(pal[1], a * 0.9);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sx + 0.5, sy + 0.5, scW - 1, scH - 1);
      ctx.restore();
      // A scrolling ground band + a bouncing sprite (reads as "a game running")
      ctx.fillStyle = hexA(pal[1], a);
      fillR(sx, sy + scH * 0.72, scW, scH * 0.1);
      const bob = Math.abs(Math.sin(now * 2 + c + r)) * scH * 0.18;
      ctx.fillStyle = hexA(pal[2], a);
      fillR(sx + scW * (0.2 + 0.5 * ((now * 0.15 + c) % 1)), sy + scH * 0.54 - bob, scW * 0.1, scH * 0.14);
    }
  }

  drawScanlines(W, H, 0.13 * a);
  drawFlashCaption('THE COMPUTER WING', `rgba(255, 200, 130, ${a})`, W, H);
}

// ── The arcade door (Act 1) — warm doorway spilling light into the arcade ────
function drawArcadeDoorFlash(a, W, H) {
  ctx.fillStyle = '#050406';
  fillR(0, 0, W, H);

  // Dark arcade back wall
  ctx.fillStyle = `rgba(22, 16, 26, ${a})`;
  fillR(0, H * 0.22, W, H * 0.66);
  // Floor
  ctx.fillStyle = `rgba(12, 9, 14, ${a})`;
  fillR(0, H * 0.72, W, H * 0.28);

  // The open Mystery door, centered, warm amber light pouring out
  const doorW = Math.round(W * 0.18);
  const doorH = Math.round(H * 0.52);
  const doorX = Math.round((W - doorW) / 2);
  const doorY = Math.round(H * 0.24);

  // Light spill fan onto the floor
  const spill = ctx.createRadialGradient(
    doorX + doorW / 2, doorY + doorH, 0,
    doorX + doorW / 2, doorY + doorH, doorW * 3
  );
  spill.addColorStop(0, `rgba(255, 180, 80, ${0.4 * a})`);
  spill.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = spill;
  fillR(0, doorY + doorH * 0.4, W, H - (doorY + doorH * 0.4));

  // Bright door interior
  const dg = ctx.createLinearGradient(doorX, doorY, doorX, doorY + doorH);
  dg.addColorStop(0, `rgba(255, 235, 190, ${a})`);
  dg.addColorStop(1, `rgba(255, 190, 110, ${a})`);
  ctx.fillStyle = dg;
  fillR(doorX, doorY, doorW, doorH);
  // Door frame
  ctx.strokeStyle = `rgba(70, 45, 20, ${a})`;
  ctx.lineWidth = 4;
  ctx.strokeRect(doorX - 2, doorY - 2, doorW + 4, doorH + 4);

  // Cabinet silhouettes flanking the door
  const cabW = Math.round(W * 0.07), cabH = Math.round(H * 0.34);
  ctx.fillStyle = `rgba(8, 6, 10, ${a})`;
  fillR(doorX - cabW * 1.9, doorY + doorH - cabH, cabW, cabH);
  fillR(doorX + doorW + cabW * 0.9, doorY + doorH - cabH, cabW, cabH);
  // faint marquee glints on them
  ctx.fillStyle = `rgba(120, 180, 255, ${a * 0.5})`;
  fillR(doorX - cabW * 1.9, doorY + doorH - cabH, cabW, cabH * 0.05);
  ctx.fillStyle = `rgba(255, 120, 120, ${a * 0.5})`;
  fillR(doorX + doorW + cabW * 0.9, doorY + doorH - cabH, cabW, cabH * 0.05);

  drawScanlines(W, H, 0.14 * a);
  drawFlashCaption('THE ARCADE', `rgba(255, 200, 120, ${a})`, W, H);
}

// Small helper: apply an alpha to a #rrggbb hex → rgba() string.
function hexA(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function drawPhase1(t, W, H) {
  ctx.fillStyle = '#000';
  fillR(0, 0, W, H);

  const roomIdx = Math.min(MONTAGE_ROOMS.length - 1, Math.floor(t / ROOM_SPAN));
  const roomT = (t - roomIdx * ROOM_SPAN) / ROOM_SPAN; // 0..1 within this room's slice

  // Fade in (first 20%) / hold / fade out (last 20%). Longer hold so a still
  // frame lands on a fully-rendered, legible vignette.
  let a;
  if (roomT < 0.2) a = roomT / 0.2;
  else if (roomT > 0.8) a = (1 - roomT) / 0.2;
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

  switch (MONTAGE_ROOMS[roomIdx]) {
    case 'COMMAND_CENTER': drawCommandCenterFlash(a, W, H); break;
    case 'BASEMENT': drawBasementFlash(a, W, H); break;
    case 'COMPUTER_WING': drawComputerWingFlash(a, W, H); break;
    case 'ARCADE_DOOR': drawArcadeDoorFlash(a, W, H); break;
  }
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

  const nowSec = performance.now() / 1000;
  const fadeIn = Math.min(1, t / 0.15);

  // ── The room: back wall + floor with perspective ─────────────────────────
  const wallBottom = Math.round(H * 0.78);  // where the back wall meets the floor
  // Dark back wall
  ctx.fillStyle = '#0c0810';
  fillR(0, 0, W, wallBottom);
  // Floor, slightly warmer, receding
  const floorGrad = ctx.createLinearGradient(0, wallBottom, 0, H);
  floorGrad.addColorStop(0, '#140f10');
  floorGrad.addColorStop(1, '#070506');
  ctx.fillStyle = floorGrad;
  fillR(0, wallBottom, W, H - wallBottom);
  // Floor perspective lines toward a vanishing point (arcade linoleum read)
  ctx.strokeStyle = `rgba(120, 90, 60, ${0.1 * fadeIn})`;
  ctx.lineWidth = 1;
  const vpX = W / 2;
  for (let i = -8; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(vpX + i * W * 0.028, wallBottom);
    ctx.lineTo(vpX + i * W * 0.16, H);
    ctx.stroke();
  }
  // Wall/floor seam highlight
  ctx.strokeStyle = `rgba(60, 45, 35, ${0.5 * fadeIn})`;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, wallBottom); ctx.lineTo(W, wallBottom); ctx.stroke();

  // ── Warm overall room glow (many CRTs alive) ─────────────────────────────
  const grad = ctx.createRadialGradient(W / 2, H * 0.5, 0, W / 2, H * 0.5, W * 0.75);
  grad.addColorStop(0, `rgba(255, 175, 85, ${0.14 * fadeIn})`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  fillR(0, 0, W, H);

  // ── The open Mystery door in the back wall (spec visual note) ────────────
  // A doorway, not a cabinet: taller than the cabinets, reaching to the floor,
  // recessed in a darker wall alcove, warm amber light pouring out onto the floor.
  const doorW = Math.round(W * 0.08), doorH = Math.round(H * 0.5);
  const doorX = Math.round(W * 0.91), doorY = Math.round(wallBottom - doorH);
  // Darker alcove framing so it reads as a hole in the wall
  ctx.fillStyle = `rgba(4, 3, 6, ${fadeIn})`;
  fillR(doorX - doorW * 0.35, doorY - doorH * 0.06, doorW * 1.7, doorH * 1.06);
  // Light spill fan onto the floor
  const doorSpill = ctx.createRadialGradient(
    doorX + doorW / 2, doorY + doorH, 0,
    doorX + doorW / 2, doorY + doorH, doorW * 4
  );
  doorSpill.addColorStop(0, `rgba(255, 190, 100, ${0.34 * fadeIn})`);
  doorSpill.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = doorSpill;
  fillR(doorX - doorW * 3, doorY + doorH * 0.3, doorW * 6, H - (doorY + doorH * 0.3));
  // Bright open doorway interior (gradient so it glows from within)
  const dg = ctx.createLinearGradient(doorX, doorY, doorX, doorY + doorH);
  dg.addColorStop(0, `rgba(255, 235, 190, ${0.9 * fadeIn})`);
  dg.addColorStop(1, `rgba(255, 195, 115, ${0.9 * fadeIn})`);
  ctx.fillStyle = dg;
  fillR(doorX, doorY, doorW, doorH);
  ctx.strokeStyle = `rgba(70, 45, 20, ${fadeIn})`;
  ctx.lineWidth = 3;
  ctx.strokeRect(doorX - 1.5, doorY - 1.5, doorW + 3, doorH + 3);

  // ── The trapdoor seam in the floor (spec visual note) ────────────────────
  const trapY = Math.round(H * 0.9);
  const trapX = Math.round(W * 0.16), trapW = Math.round(W * 0.14);
  const trapGlow = ctx.createLinearGradient(0, trapY - H * 0.03, 0, trapY + H * 0.02);
  trapGlow.addColorStop(0, 'rgba(0,0,0,0)');
  trapGlow.addColorStop(0.5, `rgba(255, 80, 150, ${0.28 * fadeIn})`);
  trapGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = trapGlow;
  fillR(trapX - trapW * 0.3, trapY - H * 0.03, trapW * 1.6, H * 0.05);
  ctx.strokeStyle = `rgba(255, 90, 160, ${0.6 * fadeIn})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(trapX, trapY); ctx.lineTo(trapX + trapW, trapY); ctx.stroke();

  // ── The five Act-1 cabinets in a row, ON, casting glow pools ─────────────
  // Row must clear the Corner Cabinets group on the left (ends ~0.18W) and the
  // Mystery-door alcove on the right (starts ~0.88W) — a centered row at the
  // old 0.11W cabinet width collided with the corner group, painting the first
  // cabinet's body over the third corner cabinet (the "black box" artifact).
  const cabW = Math.round(W * 0.105);
  const cabH = Math.round(H * 0.4);
  const gap = Math.round(W * 0.03);
  const totalW = CABINETS.length * cabW + (CABINETS.length - 1) * gap;
  const startX = Math.round(Math.max((W - totalW) / 2, W * 0.2));
  const cabY = Math.round(wallBottom - cabH);  // cabinets stand ON the floor seam

  const cabColors = ['#ffffff', '#39ff14', '#ffd400', '#ff5a5a', '#ff9a3c'];

  // Pass 1: glow pools washing onto floor + wall behind each cabinet
  CABINETS.forEach((kind, i) => {
    const cx = startX + i * (cabW + gap);
    const gc = cabColors[i];
    const cxc = cx + cabW / 2;
    // floor pool
    const pool = ctx.createRadialGradient(cxc, cabY + cabH, 0, cxc, cabY + cabH, cabW * 1.5);
    pool.addColorStop(0, hexA(gc, 0.16 * fadeIn));
    pool.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = pool;
    fillR(cx - cabW, cabY + cabH * 0.5, cabW * 3, H - (cabY + cabH * 0.5));
    // wall wash behind
    const wall = ctx.createRadialGradient(cxc, cabY + cabH * 0.3, 0, cxc, cabY + cabH * 0.3, cabW * 1.3);
    wall.addColorStop(0, hexA(gc, 0.1 * fadeIn));
    wall.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = wall;
    fillR(cx - cabW, 0, cabW * 3, cabY + cabH * 0.6);
  });

  // Pass 2: the cabinets themselves
  CABINETS.forEach((kind, i) => {
    const cx = startX + i * (cabW + gap);
    const glowColor = cabColors[i];

    ctx.save();
    ctx.globalAlpha = fadeIn;

    // Cabinet body silhouette with a slightly tapered top
    ctx.fillStyle = '#191220';
    fillR(cx, cabY + cabH * 0.08, cabW, cabH * 0.92);
    ctx.fillStyle = '#1f1728';
    fillR(cx + cabW * 0.06, cabY, cabW * 0.88, cabH * 0.1);
    ctx.strokeStyle = '#332840';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx + 0.5, cabY + cabH * 0.08 + 0.5, cabW - 1, cabH * 0.92 - 1);
    // sloped control panel hint
    ctx.fillStyle = '#0e0a14';
    fillR(cx, cabY + cabH * 0.62, cabW, cabH * 0.05);

    // Screen bezel + glowing screen (bigger)
    const sx = cx + cabW * 0.1;
    const sy = cabY + cabH * 0.16;
    const sw = cabW * 0.8;
    const sh = cabH * 0.4;

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#050505';
    fillR(sx, sy, sw, sh);
    ctx.shadowBlur = 0;

    drawCabinetScreen(kind, sx, sy, sw, sh, nowSec + i);

    // Marquee glow strip on top
    ctx.fillStyle = glowColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;
    fillR(cx + cabW * 0.08, cabY - cabH * 0.02, cabW * 0.84, cabH * 0.045);
    ctx.shadowBlur = 0;

    ctx.restore();
  });

  // ── The three Act-5 Corner Cabinets, dim and flickering (Out Run, Q*bert,
  //    Missile Command) — the machines Act 5 will rediscover. Tucked against
  //    the left wall, still on the floor, each in its own game's palette. ────
  drawCornerCabinets(nowSec, fadeIn, wallBottom, W, H);

  ctx.globalAlpha = 1;
  drawScanlines(W, H, 0.14 * fadeIn);
}

// Palette + a tiny screen motif for each of the three Corner Cabinets.
const CORNER_CABS = [
  { glow: [255, 90, 160],  screen: '#2a0d1a' },   // Out Run       — sunset pink
  { glow: [255, 150, 40],  screen: '#241205' },   // Q*bert        — orange/violet
  { glow: [90, 210, 120],  screen: '#08210f' },   // Missile Cmd   — green ground
];

function drawCornerCabinets(nowSec, fadeIn, wallBottom, W, H) {
  // Group must end left of the main cabinet row (which starts at >= 0.2W):
  // 0.02 + 3*0.042 + 2*0.0147 ≈ 0.175W.
  const cabW  = Math.round(W * 0.042);
  const cabH  = Math.round(H * 0.24);
  const gap   = Math.round(cabW * 0.35);
  const baseY = Math.round(wallBottom + H * 0.04); // feet just onto the floor, in front
  const startX = Math.round(W * 0.02);

  for (let i = 0; i < 3; i++) {
    const cx = startX + i * (cabW + gap);
    const cy = baseY - cabH;
    const spec = CORNER_CABS[i];

    // Flicker: a dim baseline with occasional brighter jumps, offset per
    // cabinet so they never pulse in unison. Bounded 0..1.
    const wobble = Math.sin(nowSec * (2.1 + i * 0.6) + i * 2.0);
    const jitter = Math.sin(nowSec * (11 + i * 3)) > 0.86 ? 0.4 : 0;
    const flick = Math.max(0.08, Math.min(1, 0.22 + wobble * 0.12 + jitter));
    const [gr, gg, gb] = spec.glow;
    const glow = (al) => `rgba(${gr}, ${gg}, ${gb}, ${al * fadeIn})`;

    ctx.globalAlpha = fadeIn;

    // Cabinet body (dark silhouette) with a slightly tapered top — the
    // classic upright-cabinet read.
    ctx.fillStyle = '#0b0709';
    fillR(cx, cy + cabH * 0.1, cabW, cabH * 0.9);
    // Sloped control-panel front hint (a darker notch near the base)
    ctx.fillStyle = '#060406';
    fillR(cx, cy + cabH * 0.62, cabW, cabH * 0.06);
    // Tapered top cap
    ctx.fillStyle = '#0e0a0c';
    fillR(cx + cabW * 0.06, cy, cabW * 0.88, cabH * 0.12);

    // Faint body edge lit by its own marquee
    ctx.strokeStyle = glow(flick * 0.5);
    ctx.lineWidth = 1;
    ctx.strokeRect(cx + 0.5, cy + cabH * 0.1 + 0.5, cabW - 1, cabH * 0.9 - 1);

    // The screen — dim, in-palette, with a tiny flickering scanline glow
    const scX = cx + cabW * 0.16;
    const scY = cy + cabH * 0.2;
    const scW = cabW * 0.68;
    const scH = cabH * 0.32;
    ctx.fillStyle = spec.screen;
    fillR(scX, scY, scW, scH);
    ctx.save();
    ctx.shadowColor = glow(flick);
    ctx.shadowBlur = 8;
    ctx.strokeStyle = glow(flick * 0.7);
    ctx.lineWidth = 1;
    ctx.strokeRect(scX + 0.5, scY + 0.5, scW - 1, scH - 1);
    // one bright flickering scanline sweeping the dim screen
    const lineY = scY + scH * (0.2 + 0.6 * (0.5 + 0.5 * Math.sin(nowSec * 3 + i)));
    ctx.fillStyle = glow(flick * 0.6);
    fillR(scX + scW * 0.12, lineY, scW * 0.76, Math.max(1, scH * 0.06));
    ctx.restore();

    // Marquee strip on top, flickering in the cabinet's color
    ctx.save();
    ctx.shadowColor = glow(flick);
    ctx.shadowBlur = 7;
    ctx.fillStyle = glow(flick * 0.85);
    fillR(cx + cabW * 0.1, cy + cabH * 0.02, cabW * 0.8, cabH * 0.05);
    ctx.restore();
  }
}

// ─── Phase 3: The Opening Screen callback (spec Phase 4) ───────────────────────
//
// NOT a title card. This is the game's opening "READY PLAYER ONE" screen coming
// back around — same layout/colors/scanlines as the real ready screen (css: READY
// muted-amber, name in glowing amber, prompt in green), but the name is pre-filled
// and the prompt reads "TYPE YOUR NAME" instead of "PRESS SPACE TO BEGIN". Level 21
// (Shift / type-your-name) begins right here; Space hands off to its ready screen.

// Sanitized display name for canvas rendering only. Source is the settings model
// (already validated + length-capped to 16); we additionally strip anything that
// isn't a safe printable glyph and uppercase it to match the arcade READY styling.
// Never touches the DOM — pure canvas fillText downstream.
function getDisplayName() {
  let name = 'PLAYER ONE';
  try {
    const raw = getSettings().playerName;
    if (typeof raw === 'string') {
      const cleaned = raw.replace(/[^A-Za-z0-9 '\-]/g, '').trim().slice(0, 16);
      if (cleaned) name = cleaned;
    }
  } catch (e) { /* fall back to PLAYER ONE */ }
  return name.toUpperCase();
}

function drawPhase3(elapsedSec, W, H) {
  // Match the opening title/ready screen: near-black CRT background.
  ctx.fillStyle = '#050403';
  ctx.fillRect(0, 0, W, H);

  const alpha = Math.min(1, elapsedSec / 1.0);
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // "READY" — small, muted amber (matches .ready-player)
  const readySize = Math.max(9, Math.floor(W * 0.0125));
  ctx.font = `${readySize}px "Press Start 2P", monospace`;
  ctx.fillStyle = '#b8860b';
  ctx.shadowBlur = 0;
  ctx.fillText('READY', W / 2, H * 0.38);

  // "[NAME]!" — large, glowing amber (matches .ready-name), gentle pulse
  const name = getDisplayName();
  const nameSize = Math.max(20, Math.floor(W * 0.032));
  ctx.font = `${nameSize}px "Press Start 2P", monospace`;
  ctx.fillStyle = '#ffb000';
  const pulse = 18 + Math.sin(elapsedSec * 2.5) * 8;
  ctx.shadowColor = '#ffb000';
  ctx.shadowBlur = pulse;
  ctx.fillText(name + '!', W / 2, H * 0.5);
  ctx.shadowBlur = 0;

  // Where "PRESS SPACE TO BEGIN" used to be: "TYPE YOUR NAME" — Level 21 begins.
  const promptSize = Math.max(7, Math.floor(W * 0.009));
  ctx.font = `${promptSize}px "Press Start 2P", monospace`;
  const blinkOn = Math.floor(elapsedSec * 1.2) % 2 === 0;
  if (blinkOn && elapsedSec > 0.6) {
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 6;
    ctx.fillText('TYPE YOUR NAME', W / 2, H * 0.66);
    ctx.shadowBlur = 0;
  }

  ctx.globalAlpha = 1;
  drawScanlines(W, H, 0.14);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
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
    case 3: drawPhase3((ms - P.OPENING.s) / 1000, W, H); break;
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
    // Not yet on the opening-screen callback — skip straight to it.
    stopAllAudio();
    startTime = performance.now() - P.OPENING.s;
    return;
  }
  // On the opening screen: Space begins Level 21 — hand off to its ready screen.
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
  // Level-21 ready screen is what actually paints — no title flash.
  restoreHiddenScreens();
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
