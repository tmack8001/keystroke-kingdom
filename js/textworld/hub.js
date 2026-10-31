// ─── Text Worlds hub (Act 6 — the door's chooser) ──────────────────────────
//
// The back-wall door opens on MORE THAN ONE world, so it lands here first: a small
// canvas-drawn chooser. Pick a world and the hub hands the shared canvas + input to
// that world's engine (all engines share the start/stop/handleKey shape). Finishing
// or Escaping a world returns to this menu; Escaping the menu returns to the arcade.
//
// This is the wing's coordinator — new worlds (the LLM IM-friend, etc.) just get a
// WORLDS entry. main.js only ever talks to the hub.

import * as Prose from './engine.js';
import * as Tile from './tileworld.js';
import * as Maker from './maker.js';
import * as ImFriend from './imfriend.js';
import { GreenDragon } from './greendragon.js';
import { GlimmerDeep, Whisperwood } from './tile-worlds.js';
import { enterLabel } from '../key-label.js';

let canvas, ctx, animId;
let active = false;
let mode = 'menu';         // 'menu' | 'world'
let activeWorld = null;    // the engine module currently playing
let onExit = null;         // → back to the arcade door
let onWorldComplete = null; // (id) → persistence hook
let currentId = null;       // id of the world currently playing (for win-credit)
let cursor = 0;

// hint: the colour for lines a child reads (subtitle, world tags, the key footer) —
// 5.6:1 on bg. dim (3.6:1) was below a comfortable reading contrast.
const PAL = { fg: '#4fe08a', dim: '#1f7a45', hint: '#2f9e5c', bg: '#00140a', accent: '#ffd23f' };

const WORLDS = [
  { id: GreenDragon.id, name: GreenDragon.title, tag: 'a prose adventure — read, then type',
    run: (cb) => { activeWorld = Prose; Prose.start(GreenDragon, { onComplete: cb }); } },
  { id: GlimmerDeep.id, name: GlimmerDeep.title, tag: 'explore the deep — find what waits below',
    run: (cb) => { activeWorld = Tile; Tile.start(GlimmerDeep, { onComplete: cb }); } },
  { id: Whisperwood.id, name: Whisperwood.title, tag: 'wander the old wood — find its secret',
    run: (cb) => { activeWorld = Tile; Tile.start(Whisperwood, { onComplete: cb }); } },
  { id: Maker.id, name: Maker.title, tag: 'type a world into being — then wake it up',
    run: (cb) => { activeWorld = Maker; Maker.start({ onComplete: cb }); } },
  { id: ImFriend.id, name: ImFriend.title, tag: 'chat with a friend — say hi, make one your own',
    run: (cb) => { activeWorld = ImFriend; ImFriend.start({ onComplete: cb }); } },
];

export function isActive() { return active; }

export function start(opts = {}) {
  onExit = typeof opts.onExit === 'function' ? opts.onExit : null;
  onWorldComplete = typeof opts.onComplete === 'function' ? opts.onComplete : null;
  canvas = document.getElementById('invaders-canvas');
  ctx = canvas.getContext('2d');
  sizeCanvas();
  mode = 'menu';
  activeWorld = null;
  currentId = null;
  cursor = 0;
  active = true;
  animId = requestAnimationFrame(renderMenu);
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (activeWorld) { activeWorld.stop(); activeWorld = null; }
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  onExit = null;
  onWorldComplete = null;
  currentId = null;
}

export function handleKey(e) {
  if (!active) return;
  if (mode === 'world') {
    if (e.key === 'Escape') { returnToMenu(); return; }   // step back out to the chooser
    if (activeWorld) activeWorld.handleKey(e);
    return;
  }
  // Menu.
  if (e.key === 'ArrowUp') cursor = (cursor - 1 + WORLDS.length) % WORLDS.length;
  else if (e.key === 'ArrowDown') cursor = (cursor + 1) % WORLDS.length;
  else if (e.key === 'Enter' || e.key === ' ') enterWorld(cursor);
  else if (e.key === 'Escape') { if (onExit) onExit(); }
}

function enterWorld(i) {
  if (animId) { cancelAnimationFrame(animId); animId = null; } // hand the canvas to the world
  mode = 'world';
  currentId = WORLDS[i].id;
  WORLDS[i].run(() => returnToMenu());   // completion is credited in returnToMenu (any exit)
}

function returnToMenu() {
  // Credit the world if it was WON — however the player leaves it: Space/Enter
  // finish, the auto-return, OR Escape. This is why Escape no longer silently
  // drops the achievement (TF-T1); winning always counts.
  if (activeWorld && typeof activeWorld.hasWon === 'function' && activeWorld.hasWon()
      && currentId && onWorldComplete) {
    onWorldComplete(currentId);
  }
  if (activeWorld) { activeWorld.stop(); activeWorld = null; }
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
  if (!active || mode !== 'menu') return;
  sizeCanvas();
  const W = canvas.width, H = canvas.height;

  ctx.fillStyle = PAL.bg;
  ctx.fillRect(0, 0, W, H);
  const vign = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, Math.max(W, H) * 0.75);
  vign.addColorStop(0, 'rgba(0,0,0,0)');
  vign.addColorStop(1, 'rgba(0,15,0,0.55)');
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, W, H);

  const title = Math.max(16, Math.floor(W * 0.03));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${title}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.fg;
  ctx.shadowColor = PAL.fg;
  ctx.shadowBlur = 12;
  ctx.fillText('THE TEXT WORLDS', W / 2, Math.round(H * 0.18));
  ctx.shadowBlur = 0;

  const sub = Math.max(9, Math.floor(W * 0.011));
  ctx.font = `${sub}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.hint;
  ctx.fillText('the door opens on more than one', W / 2, Math.round(H * 0.26));

  const item = Math.max(12, Math.floor(W * 0.016));
  const tag = Math.max(9, Math.floor(W * 0.010));
  WORLDS.forEach((w, i) => {
    const y = Math.round(H * 0.34) + i * Math.round(H * 0.115);   // room for up to ~5 worlds
    const sel = i === cursor;
    ctx.font = `${item}px "Press Start 2P", monospace`;
    ctx.fillStyle = sel ? PAL.accent : PAL.fg;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = sel ? 10 : 4;
    ctx.globalAlpha = sel ? 1 : 0.7;
    ctx.fillText((sel ? '▸  ' : '   ') + w.name, W / 2, y);
    ctx.shadowBlur = 0;
    ctx.font = `${tag}px "Press Start 2P", monospace`;
    ctx.fillStyle = PAL.hint;
    ctx.globalAlpha = sel ? 1 : 0.9;   // unselected tag still 4.7:1
    ctx.fillText(w.tag, W / 2, y + Math.round(item * 1.4));
  });
  ctx.globalAlpha = 1;

  ctx.font = `${sub}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.hint;
  ctx.fillText(`↑ ↓ CHOOSE    ·    SPACE / ${enterLabel()}    ·    ESC: BACK TO THE ARCADE`, W / 2, Math.round(H * 0.88));

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

  animId = requestAnimationFrame(renderMenu);
}
