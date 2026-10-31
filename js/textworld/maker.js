// ─── A World of Your Own Creation (Act 6, the maker) ───────────────────────
//
// The keystone of the wing: the child TYPES a world into being. You type a word
// at the prompt bar and the thing appears in the scene above it; when the world
// is full enough you type `wake` and the whole thing comes ALIVE. It's the game's
// deepest thesis handed to the child as a toy — and the direct echo of MegaZeux
// (research/wiki/tech/megazeux.md), the tool a generation typed worlds into being.
//
// THE ONE RULE (product.md): you can never fail, there are no timers, and whatever
// you make is wonderful. A wrong key just waits (gentle nudge). The word palette
// (hints) can be TOGGLED (Tab) and also FADES on its own as you find your feet —
// until it's just you and the keyboard.
//
// SECURITY (.claude/rules/security.md 1-3,6): the palette is a FIXED allowlist, so
// a key is only accepted if the buffer stays a prefix of an authored word — there
// is NO free-text/untrusted-input surface here (that's the IM-friend's problem,
// later). Everything is drawn as canvas text/shapes; never a DOM sink.
//
//   start({onComplete}), stop(), handleKey(e), isActive()

import * as Audio from '../audio.js';
import { enterLabel } from '../key-label.js';

let canvas, ctx, animId;
let active = false;
let onComplete = null;

const PAL = { sky1: '#0b1830', sky2: '#243a5e', ground: '#183a22', groundEdge: '#2f6b3a', fg: '#eaf3ff', dim: '#5f7fb0', hint: '#7f9bcb', prompt: '#7fd0ff', accent: '#ffd23f' };

// Each word → a thing: its zone band, how many you may place, the tier it unlocks
// at, and a draw(x,y,size,t,phase,alive) that renders it (glyphs + little shapes).
const VOCAB = {
  sun:      { zone: 'sky',    cap: 1,  tier: 0, draw: drawSun },
  star:     { zone: 'sky',    cap: 16, tier: 0, draw: drawStar },
  cloud:    { zone: 'sky',    cap: 4,  tier: 0, draw: drawCloud },
  bird:     { zone: 'sky',    cap: 6,  tier: 0, draw: drawBird },
  tree:     { zone: 'ground', cap: 9,  tier: 0, draw: drawTree },
  house:    { zone: 'ground', cap: 2,  tier: 0, draw: drawHouse },
  flower:   { zone: 'ground', cap: 12, tier: 0, draw: drawFlower },
  moon:     { zone: 'sky',    cap: 1,  tier: 1, draw: drawMoon },
  mountain: { zone: 'back',   cap: 2,  tier: 1, draw: drawMountain },
  river:    { zone: 'water',  cap: 1,  tier: 1, draw: drawRiver },
  hill:     { zone: 'back',   cap: 3,  tier: 1, draw: drawHill },
  fox:      { zone: 'ground', cap: 2,  tier: 1, draw: drawFox },
};
const ZONE_Z = { back: 0, water: 1, sky: 2, ground: 3 };   // paint order

let things = [];      // { word, x, y, phase, vx, spawnT }
let counts = {};      // word -> placed count
let typed = '';
let tier = 0;         // unlocked vocabulary tier
let placed = 0;       // total things placed
let mastery = 0;      // for the hint fade
let hintsOn = true;   // Tab toggle
let hintBoostT = 0;
let lastActMs = 0;
let nudgeT = 0;
let message = '';
let alive = false;
let aliveT = 0;

// This world's stable id + display title — the SINGLE source of truth for each,
// referenced by hub.js (its WORLDS entry), this module's own chrome, and the tests
// (HUB_ORDER), so neither can drift between callers (the tile worlds do the same via
// their data object's `id`/`title`).
export const id = 'maker';
export const title = 'YOUR OWN WORLD';

export function isActive() { return active; }
export function hasWon() { return alive; }   // for the hub: credit the wake on any exit

export function start(opts = {}) {
  onComplete = typeof opts.onComplete === 'function' ? opts.onComplete : null;
  canvas = document.getElementById('invaders-canvas');
  ctx = canvas.getContext('2d');
  sizeCanvas();
  things = [];
  counts = {};
  typed = '';
  tier = 0;
  placed = 0;
  mastery = 0;
  hintsOn = true;
  hintBoostT = 0;
  lastActMs = performance.now();
  nudgeT = 0;
  alive = false;
  aliveT = 0;
  message = 'This world is empty. Fill it — type a thing.';
  active = true;
  animId = requestAnimationFrame(render);
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  onComplete = null;
}

// The words currently on offer: every unlocked word not yet at its cap, plus
// `wake` once there's something to wake. This set is also the input allowlist.
function offered() {
  const words = Object.keys(VOCAB).filter((w) => VOCAB[w].tier <= tier && (counts[w] || 0) < VOCAB[w].cap);
  if (placed >= 3 && !alive) words.push('wake');
  return words;
}

export function handleKey(e) {
  if (!active) return;
  lastActMs = performance.now();

  // Space/Enter leave the alive world. (Escape is handled one layer up by the
  // hub, which records the win via hasWon() before returning — TF-T1.)
  if (alive) { if (['Enter', ' '].includes(e.key)) finish(); return; }

  if (e.key === 'Tab') { hintsOn = !hintsOn; return; }
  if (e.key === 'Backspace') { if (typed) { typed = typed.slice(0, -1); Audio.correct(); } return; }
  if (e.key === 'Enter') { const x = offered().find((w) => w === typed); if (x) fire(x); return; }
  if (e.key.length !== 1) return;

  const ch = e.key.toLowerCase();
  const next = typed + ch;
  if (!offered().some((w) => w.startsWith(next))) {
    Audio.wrong(); nudgeT = 12; hintBoostT = 150;   // gentle nudge; bring hints back
    return;
  }
  typed = next;
  Audio.correct();
  const exact = offered().find((w) => w === typed);
  const ambiguous = offered().some((w) => w !== typed && w.startsWith(typed));
  if (exact && !ambiguous) fire(exact);
}

function fire(word) {
  typed = '';
  mastery++;
  if (word === 'wake') { wake(); return; }
  place(word);
}

function place(word) {
  const spec = VOCAB[word];
  counts[word] = (counts[word] || 0) + 1;
  placed++;
  things.push({ word, ...spawnPos(spec.zone, word), phase: Math.random() * Math.PI * 2, vx: (Math.random() < 0.5 ? -1 : 1) * (0.00018 + Math.random() * 0.0002), spawnT: 0 });
  Audio.coin();
  message = '';
  // Progressive unlock: once the basics are down, more words appear.
  if (tier === 0 && placed >= 5) { tier = 1; message = 'New words appear:  moon · mountain · river · hill · fox'; hintBoostT = 220; }
}

function spawnPos(zone, word) {
  if (word === 'sun') return { x: 0.82, y: 0.12 };
  if (word === 'moon') return { x: 0.18, y: 0.12 };
  if (zone === 'water') return { x: 0.5, y: 0.70 };
  const band = { sky: [0.10, 0.36], back: [0.44, 0.54], ground: [0.56, 0.84] }[zone] || [0.5, 0.6];
  return { x: 0.10 + Math.random() * 0.80, y: band[0] + Math.random() * (band[1] - band[0]) };
}

function wake() {
  alive = true;
  aliveT = 0;
  message = 'You made a world — and now it is ALIVE. Every bit of it came from a word you typed. That is the oldest magic there is.';
  Audio.levelComplete();
}

function finish() { if (onComplete) { const cb = onComplete; onComplete = null; cb(); } }

// ─── Rendering ──────────────────────────────────────────────────────────────

function sizeCanvas() {
  if (!canvas) return;
  if (canvas.width !== window.innerWidth) canvas.width = window.innerWidth;
  if (canvas.height !== window.innerHeight) canvas.height = window.innerHeight;
}

function render() {
  if (!active) return;
  sizeCanvas();
  const W = canvas.width, H = canvas.height;
  const t = performance.now() * 0.001;

  ctx.fillStyle = '#04060c';       // clear the FULL canvas first (the scene only
  ctx.fillRect(0, 0, W, H);        // paints its band — otherwise stale pixels bleed)
  drawSkyAndGround(W, H);
  drawThings(W, H, t);
  drawChrome(W, H);
  drawScanlines(W, H);

  if (nudgeT > 0) nudgeT--;
  if (hintBoostT > 0) hintBoostT--;
  if (alive) { aliveT++; }   // no auto-return — the child savours it, then presses a key

  animId = requestAnimationFrame(render);
}

// The scene fills the top ~72%; the prompt bar + hints sit below it.
const SCENE_TOP = 0.06, SCENE_BOT = 0.72;
function sy(f, H) { return (SCENE_TOP + (SCENE_BOT - SCENE_TOP) * f) * H; }

function drawSkyAndGround(W, H) {
  const top = SCENE_TOP * H, bot = SCENE_BOT * H;
  const g = ctx.createLinearGradient(0, top, 0, bot);
  g.addColorStop(0, alive ? '#0a1226' : PAL.sky1);
  g.addColorStop(0.62, PAL.sky2);
  g.addColorStop(0.66, PAL.ground);
  g.addColorStop(1, '#0c1f13');
  ctx.fillStyle = g;
  ctx.fillRect(0, top, W, bot - top);
  // horizon line
  ctx.strokeStyle = PAL.groundEdge;
  ctx.globalAlpha = 0.5; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, sy(0.63, H)); ctx.lineTo(W, sy(0.63, H)); ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawThings(W, H, t) {
  const sorted = [...things].sort((a, b) => (ZONE_Z[VOCAB[a.word].zone] - ZONE_Z[VOCAB[b.word].zone]) || (a.y - b.y));
  const cell = Math.max(16, Math.floor(W * 0.02));
  for (const th of sorted) {
    if (th.spawnT < 1) th.spawnT = Math.min(1, th.spawnT + 0.12);  // pop-in
    // drift the flyers/drifters once alive
    if (alive && (th.word === 'bird' || th.word === 'cloud')) {
      th.x += th.vx * (th.word === 'bird' ? 3 : 1);
      if (th.x > 0.98) th.x = 0.02; if (th.x < 0.02) th.x = 0.98;
    }
    const x = th.x * W, y = sy(th.y, H);
    const s = cell * (0.4 + 0.6 * th.spawnT);
    ctx.save();
    VOCAB[th.word].draw(x, y, s, t, th.phase, alive);
    ctx.restore();
  }
}

// ─── Sprites (compact ASCII/shape motifs) ───────────────────────────────────
function glyph(ch, x, y, size, color, glow) {
  ctx.font = `${Math.round(size)}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = glow || 0;
  ctx.fillText(ch, x, y);
  ctx.shadowBlur = 0;
}
function drawSun(x, y, s, t) { const p = 1 + 0.08 * Math.sin(t * 2); glyph('O', x, y, s * 1.4 * p, '#ffd23f', 18); }
function drawMoon(x, y, s, t) { glyph(')', x, y, s * 1.3, '#dfe8ff', 12); }
function drawStar(x, y, s, t, ph) { const a = 0.5 + 0.5 * Math.abs(Math.sin(t * 2 + ph)); ctx.globalAlpha = a; glyph('*', x, y, s, '#ffffff', 8); ctx.globalAlpha = 1; }
function drawCloud(x, y, s) { ctx.fillStyle = '#cdd8ee'; ctx.globalAlpha = 0.9; ctx.shadowColor = '#cdd8ee'; ctx.shadowBlur = 6;
  roundBlob(x, y, s * 1.6, s * 0.7); ctx.shadowBlur = 0; ctx.globalAlpha = 1; }
function drawBird(x, y, s) { glyph('v', x, y, s * 0.8, '#20304a', 0); }
function drawTree(x, y, s) { // pine: triangle + trunk
  ctx.fillStyle = '#3f8f4f'; ctx.shadowColor = '#3f8f4f'; ctx.shadowBlur = 4;
  tri(x, y - s, x - s * 0.7, y + s * 0.4, x + s * 0.7, y + s * 0.4);
  tri(x, y - s * 0.5, x - s * 0.85, y + s * 0.8, x + s * 0.85, y + s * 0.8);
  ctx.shadowBlur = 0; ctx.fillStyle = '#6b4a2a'; ctx.fillRect(x - s * 0.12, y + s * 0.7, s * 0.24, s * 0.5); }
function drawHouse(x, y, s, t) {
  ctx.fillStyle = '#c58a4a'; ctx.fillRect(x - s * 0.7, y - s * 0.1, s * 1.4, s * 1.0);
  ctx.fillStyle = '#8a3a2a'; tri(x - s * 0.85, y - s * 0.1, x + s * 0.85, y - s * 0.1, x, y - s * 0.9);
  ctx.fillStyle = '#3a2a1a'; ctx.fillRect(x - s * 0.2, y + s * 0.35, s * 0.4, s * 0.55);       // door
  ctx.fillStyle = alive ? '#ffe08f' : '#5a4020'; ctx.fillRect(x + s * 0.28, y + s * 0.1, s * 0.28, s * 0.28); // window
  if (alive) { const puff = (t * 40) % 60; ctx.globalAlpha = 0.5 - puff / 140; ctx.fillStyle = '#cccccc';   // smoke
    roundBlob(x + s * 0.4, y - s * 1.1 - puff, s * 0.28, s * 0.28); ctx.globalAlpha = 1; } }
function drawFlower(x, y, s, t, ph) { const sway = alive ? Math.sin(t * 2 + ph) * s * 0.15 : 0;
  ctx.strokeStyle = '#3f8f4f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + s * 0.5); ctx.lineTo(x + sway, y - s * 0.2); ctx.stroke();
  glyph('*', x + sway, y - s * 0.3, s * 0.8, ['#ff7fb0', '#ffd23f', '#c9a3ff', '#7fd0ff'][Math.floor(ph * 4) % 4], 5); }
function drawMountain(x, y, s) { ctx.fillStyle = '#5a6b7f'; ctx.shadowColor = '#5a6b7f'; ctx.shadowBlur = 2;
  tri(x, y - s * 1.6, x - s * 1.6, y + s * 0.6, x + s * 1.6, y + s * 0.6); ctx.shadowBlur = 0;
  ctx.fillStyle = '#e8eef7'; tri(x, y - s * 1.6, x - s * 0.5, y - s * 0.7, x + s * 0.5, y - s * 0.7); }
function drawHill(x, y, s) { ctx.fillStyle = '#2f6b3a'; ctx.beginPath(); ctx.ellipse(x, y + s, s * 2.2, s * 1.1, 0, Math.PI, 0); ctx.fill(); }
function drawRiver(x, y, s, t) { const W = canvas.width; ctx.strokeStyle = '#4fa3d9'; ctx.lineWidth = Math.max(3, s * 0.4);
  ctx.shadowColor = '#4fa3d9'; ctx.shadowBlur = alive ? 8 : 3; ctx.globalAlpha = 0.9; ctx.beginPath();
  for (let px = 0; px <= W; px += 8) { const yy = y + Math.sin(px * 0.03 + (alive ? t * 2 : 0)) * s * 0.25; if (px === 0) ctx.moveTo(px, yy); else ctx.lineTo(px, yy); }
  ctx.stroke(); ctx.shadowBlur = 0; ctx.globalAlpha = 1; }
function drawFox(x, y, s, t, ph) { const hop = alive ? Math.abs(Math.sin(t * 3 + ph)) * s * 0.2 : 0; glyph('f', x, y - hop, s, '#e8813a', 4); }

function tri(x1, y1, x2, y2, x3, y3) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill(); }
function roundBlob(cx, cy, rx, ry) { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }

// ─── Prompt bar + hints + chrome ────────────────────────────────────────────
function hintMode() {
  if (!hintsOn) return 'off';
  if (hintBoostT > 0) return 'full';
  if (performance.now() - lastActMs > 6000) return 'full';
  if (mastery < 3) return 'full';
  if (mastery < 7) return 'dim';
  return 'hidden';
}

function drawChrome(W, H) {
  const fs = Math.max(11, Math.floor(W * 0.013));
  ctx.font = `${fs}px "Press Start 2P", monospace`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';

  // title
  ctx.fillStyle = PAL.accent; ctx.shadowColor = PAL.accent; ctx.shadowBlur = 6;
  ctx.fillText(title, Math.round(W * 0.07), Math.round(H * 0.03));
  ctx.shadowBlur = 0;

  // status / come-alive message
  if (message) {
    const sm = Math.max(9, Math.floor(fs * 0.8));
    ctx.font = `${sm}px "Press Start 2P", monospace`;
    ctx.fillStyle = alive ? PAL.accent : PAL.hint; ctx.globalAlpha = 1;
    wrap(message, W - W * 0.14, sm).forEach((l, i) => ctx.fillText(l, Math.round(W * 0.07), Math.round(H * 0.75) + i * Math.round(sm * 1.7)));
    ctx.globalAlpha = 1;
  }

  if (alive) {
    ctx.font = `${Math.max(9, Math.floor(fs * 0.72))}px "Press Start 2P", monospace`;
    ctx.fillStyle = PAL.hint; ctx.globalAlpha = 1;   // how to leave — readable (>=4.5:1)
    // The wording must be TRUE: Space/Return hands you back to the Text Worlds
    // chooser (hub.js returnToMenu), not to the arcade — that is one more Escape.
    ctx.fillText(`SPACE / ${enterLabel()}: back to the Text Worlds`, Math.round(W * 0.07), Math.round(H * 0.93));
    ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic'; return;
  }

  // prompt bar
  const py = Math.round(H * 0.85);
  ctx.font = `${fs}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.hint; ctx.fillText('type a thing:', Math.round(W * 0.07), py - Math.round(fs * 1.6));
  const promptStr = '> ' + typed;
  ctx.fillStyle = nudgeT > 0 ? '#d98a3f' : PAL.prompt; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8;
  ctx.fillText(promptStr, Math.round(W * 0.07), py);
  const cx = Math.round(W * 0.07) + ctx.measureText(promptStr).width + 2;
  if (Math.floor(performance.now() / 500) % 2 === 0) ctx.fillRect(cx, py, Math.round(fs * 0.6), fs);
  ctx.shadowBlur = 0;

  // hints (toggleable + fading)
  const mode = hintMode();
  const words = offered();
  const hy = Math.round(H * 0.93);
  const sm = Math.max(9, Math.floor(fs * 0.72));
  ctx.font = `${sm}px "Press Start 2P", monospace`;
  if (mode !== 'off' && mode !== 'hidden' && words.length) {
    const dim = mode === 'dim';
    let x = Math.round(W * 0.07);
    // 'full' mode is what the child reads to know what to type: hint colour, full
    // opacity (7.2:1). 'dim' is the deliberate faded-with-mastery reminder.
    ctx.globalAlpha = dim ? 0.3 : 1; ctx.fillStyle = dim ? PAL.dim : PAL.hint;
    const lab = dim ? '· ' : 'you can add:  ';
    ctx.fillText(lab, x, hy); x += ctx.measureText(lab).width;
    for (let i = 0; i < words.length; i++) {
      if (i > 0) { ctx.globalAlpha = dim ? 0.22 : 0.4; ctx.fillStyle = PAL.dim; ctx.fillText(' · ', x, hy); x += ctx.measureText(' · ').width; }
      const m = !dim && typed && words[i].startsWith(typed);
      ctx.globalAlpha = dim ? 0.3 : 1; ctx.fillStyle = m ? PAL.prompt : (dim ? PAL.dim : PAL.hint);
      ctx.fillText(words[i], x, hy); x += ctx.measureText(words[i]).width;
    }
    ctx.globalAlpha = 1;
  }
  // the toggle affordance, on the prompt line's right (clear of the word list)
  ctx.globalAlpha = 0.9; ctx.fillStyle = PAL.hint;   // a real control — readable (6.0:1)
  ctx.textAlign = 'right';
  ctx.fillText(hintsOn ? 'TAB: hide words' : 'TAB: show words', Math.round(W * 0.93), py);
  ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  ctx.textBaseline = 'alphabetic';
}

function wrap(str, maxWidth, sz) {
  ctx.font = `${sz}px "Press Start 2P", monospace`;
  const out = []; let cur = '';
  for (const w of String(str).split(' ')) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width <= maxWidth || !cur) cur = t; else { out.push(cur); cur = w; } }
  if (cur) out.push(cur); return out.length ? out : [''];
}
function drawScanlines(W, H) { ctx.fillStyle = 'rgba(0,0,0,0.10)'; for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1); }
