// ─── Act 7 · THE SPEEDWAY — the wing's hub ──────────────────────────────────
//
// The second back-wall door opens on MORE THAN ONE track, so it lands here first: a
// small canvas-drawn chooser, structurally a sibling of js/textworld/hub.js. Pick a
// track and the hub hands the shared canvas + input to the shared race engine
// (js/speedway/track.js). Finishing or Escaping a track returns to this menu;
// Escaping the menu returns to the arcade.
//
// main.js only ever talks to this module: start / stop / handleKey / isActive.
//
// ── The anti-trap chain (INV-86) ───────────────────────────────────────────
// Escape ALWAYS makes progress toward the arcade, from every state in the act:
//   start line / mid-lap / pit board  →  Escape  →  this menu
//   this menu                         →  Escape  →  the arcade door
// There is no state from which Escape fails, and no state that can be entered without
// a way out. A child is never trapped, and nothing here is on a clock.
//
// ── Where the track list comes from ────────────────────────────────────────
// The era-specific renderers live in js/speedway/tracks/* and js/speedway/render/*
// (a sibling lane's files). This hub deliberately does NOT hard-import them: the
// registry is INJECTED, either at start (`start(canvas, { onExit, tracks })`) or
// ahead of time (`setTracks(list)`). That keeps the wing bootable — and this file
// verifiable — whether or not any renderer has landed, and it means adding a track is
// a data row in the registry rather than an edit here.
//
// If nothing is registered, a single plain TEST OVAL is offered so the door never
// opens on an empty room. Its record is stored under its own track id like any other,
// so a placeholder lap can never pollute a real track's ghost.
//
// A track module (the sibling lane's contract):
//   { id, title, year, tier, variant, eraRank, lapChars, drawScene(ctx, W, H, s) }

import * as Track from './track.js';
import { formatLapTime } from './track.js';
import { readRecord } from './ghost.js';

let canvas = null;
let ctx = null;
let animId = null;
let active = false;
let mode = 'menu';            // 'menu' | 'track'
let onExit = null;            // → back to the arcade door
let onTrackComplete = null;   // (id) → persistence hook, same shape as Act 6's
let currentId = null;
let cursor = 0;
let tracks = [];

const PAL = {
  bg: '#050810',
  fg: '#ffe9b8',
  dim: '#6d7b95',
  accent: '#ffd23f',
  ghost: '#8fd6ff',
};

// The floor: one plain track, always available, so the door is never empty. It
// declares no renderer, so track.js draws its own era-neutral placeholder road.
const PLACEHOLDER = Object.freeze([{
  id: 'test-oval',
  title: 'TEST OVAL',
  year: '',
  tier: 'ttl',
  variant: 'placeholder',
  eraRank: 0,
  lapChars: 60,
}]);

// A track row is usable when it has an id and a title. Anything else is dropped
// rather than crashing the chooser — a half-built renderer costs its own row, never
// the wing.
function normalizeTracks(list) {
  if (!Array.isArray(list)) return null;
  const out = list.filter((t) => t && typeof t.id === 'string' && t.id
    && typeof t.title === 'string' && t.title);
  return out.length ? out : null;
}

// Register the era track modules. Call before start(), or pass them to start().
export function setTracks(list) {
  const ok = normalizeTracks(list);
  if (ok) tracks = ok;
}

// Open the hub ON a specific track. The select screen now shows Act 7's tracks as
// individual arcade cabinets, so picking F-ZERO on the wall and then landing on
// MONACO GP would be a small lie — the cabinet you walked up to should be the one
// the hub is offering. main.js calls this feature-detected, so an unknown id or an
// empty registry is a silent no-op rather than a trap (the One Rule: a wing that
// can't honour a request still opens, it just opens where it was going to anyway).
export function focusTrack(id) {
  if (!id || !Array.isArray(tracks)) return;
  const i = tracks.findIndex((t) => t && t.id === id);
  if (i >= 0) cursor = i;
}

export function isActive() { return active; }

export function start(cvs, opts = {}) {
  // Tolerant of both shapes: start(canvas, opts) and start(opts).
  let options = opts;
  let element = cvs;
  if (cvs && typeof cvs === 'object' && !(typeof cvs.getContext === 'function')) {
    options = cvs;
    element = null;
  }
  onExit = typeof options.onExit === 'function' ? options.onExit : null;
  onTrackComplete = typeof options.onComplete === 'function' ? options.onComplete : null;
  const injected = normalizeTracks(options.tracks);
  if (injected) tracks = injected;
  if (!tracks.length) tracks = PLACEHOLDER.slice();

  canvas = element || document.getElementById('invaders-canvas');
  ctx = canvas ? canvas.getContext('2d') : null;
  sizeCanvas();
  mode = 'menu';
  currentId = null;
  cursor = Math.min(cursor, tracks.length - 1);
  if (cursor < 0) cursor = 0;
  active = true;
  if (animId) cancelAnimationFrame(animId);
  animId = requestAnimationFrame(renderMenu);
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (Track.isActive()) Track.stopTrack();
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  onExit = null;
  onTrackComplete = null;
  currentId = null;
}

export function handleKey(e) {
  if (!active) return false;

  if (mode === 'track') {
    // Escape steps back out to the chooser, from ANY phase of a race (INV-86).
    if (e.key === 'Escape') { returnToMenu(); return true; }
    return Track.handleKey(e);
  }

  if (e.key === 'ArrowUp') { cursor = (cursor - 1 + tracks.length) % tracks.length; return true; }
  if (e.key === 'ArrowDown') { cursor = (cursor + 1) % tracks.length; return true; }
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enterTrack(cursor); return true; }
  if (e.key === 'Escape') { if (onExit) onExit(); return true; }
  return false;
}

function enterTrack(i) {
  const t = tracks[i];
  if (!t) return;
  if (animId) { cancelAnimationFrame(animId); animId = null; }  // hand the canvas over
  mode = 'track';
  currentId = t.id;
  Track.startTrack(canvas, t, { onFinish: returnToMenu });
}

function returnToMenu() {
  // Credit a finished lap however the player leaves it — Space off the pit board OR
  // Escape. The same lesson Act 6 learned (TF-T1): leaving must never silently drop
  // something the player actually did.
  if (currentId && onTrackComplete && Track.hasWon()) onTrackComplete(currentId);
  if (Track.isActive()) Track.stopTrack();
  currentId = null;
  mode = 'menu';
  sizeCanvas();
  if (active && !animId) animId = requestAnimationFrame(renderMenu);
}

// ─── Menu rendering ─────────────────────────────────────────────────────────

function sizeCanvas() {
  if (!canvas) return;
  if (canvas.width !== window.innerWidth) canvas.width = window.innerWidth;
  if (canvas.height !== window.innerHeight) canvas.height = window.innerHeight;
}

function renderMenu() {
  if (!active || mode !== 'menu' || !ctx || !canvas) return;
  sizeCanvas();
  const W = canvas.width;
  const H = canvas.height;

  // Explicit state — canvas 2D state leaks between screens (journal L28).
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = PAL.bg;
  ctx.fillRect(0, 0, W, H);
  const vign = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, Math.max(W, H) * 0.75);
  vign.addColorStop(0, 'rgba(0,0,0,0)');
  vign.addColorStop(1, 'rgba(0,0,12,0.6)');
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, W, H);

  const title = Math.max(16, Math.floor(W * 0.03));
  ctx.font = `${title}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.accent;
  ctx.shadowColor = PAL.accent;
  ctx.shadowBlur = 12;
  ctx.fillText('THE SPEEDWAY', W / 2, Math.round(H * 0.15));
  ctx.shadowBlur = 0;

  const sub = Math.max(9, Math.floor(W * 0.011));
  ctx.font = `${sub}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.dim;
  ctx.fillText('every lap you drive, you drive with yourself', W / 2, Math.round(H * 0.225));

  const item = Math.max(12, Math.floor(W * 0.015));
  const tag = Math.max(8, Math.floor(W * 0.0095));
  const rows = Math.max(1, tracks.length);
  const step = Math.min(Math.round(H * 0.105), Math.round((H * 0.52) / rows));
  const top = Math.round(H * 0.31);

  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    const y = top + i * step;
    const sel = i === cursor;
    ctx.font = `${item}px "Press Start 2P", monospace`;
    ctx.fillStyle = sel ? PAL.accent : PAL.fg;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = sel ? 10 : 3;
    ctx.globalAlpha = sel ? 1 : 0.72;
    const label = String(t.title).toUpperCase() + (t.year ? `   ${t.year}` : '');
    ctx.fillText((sel ? '▸  ' : '   ') + label, W / 2, y);
    ctx.shadowBlur = 0;

    // The keepsake line. Facts only, and it is IMPOSSIBLE for it to show a minus:
    // laps only rise, and the best time is formatted by the same clamped formatter
    // the pit board uses (INV-83).
    ctx.font = `${tag}px "Press Start 2P", monospace`;
    ctx.fillStyle = PAL.dim;
    ctx.globalAlpha = sel ? 0.95 : 0.55;
    ctx.fillText(summaryLine(t), W / 2, y + Math.round(item * 1.5));
  }
  ctx.globalAlpha = 1;

  ctx.font = `${sub}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.dim;
  ctx.fillText('↑ ↓ CHOOSE    ·    SPACE TO DRIVE    ·    ESC: BACK TO THE ARCADE',
    W / 2, Math.round(H * 0.9));

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

  animId = requestAnimationFrame(renderMenu);
}

// Never a placement, never a comparison, never a verdict — just what you have done
// on this track, and only when you have done it.
function summaryLine(t) {
  const rec = readRecord(t.id);
  if (!rec.laps) return 'never driven — your first lap sets the pace';
  const laps = `${rec.laps} LAP${rec.laps === 1 ? '' : 'S'}`;
  const best = rec.best ? `   BEST ${formatLapTime(rec.best.ms)}` : '';
  return laps + best;
}
