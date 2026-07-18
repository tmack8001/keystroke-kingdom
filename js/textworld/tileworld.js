// ─── Tile world — a generic ASCII overhead engine (Act 6) ──────────────────
//
// The "see it in letters" engine: an overhead world drawn in ASCII tiles, the
// MegaZeux / public-telnet-NetHack look (research/wiki/tech/megazeux.md,
// roguelike.md). World-agnostic — it consumes DATA (see tile-worlds.js), exactly
// as the prose engine.js consumes greendragon.js. You are `@`, you move with the
// direction keys, a fellow explorer `k` keeps you company, and reaching the far
// `*` triggers that world's "surprisingly amazing" reveal.
//
// THE ONE RULE (product.md): walls just stop you with a gentle nudge — no death,
// no loss, no timers. You can only ever arrive.
//
//   start(world, {onComplete}), stop(), handleKey(e), isActive()
//   world = { id, title, palette, map:[rows], intro, companionLine, wallLine,
//             reveal:{ kind:'crystals'|'fireflies', message, colors:[...] } }
//   map cells: '#' wall · '.' floor · '@' start · 'k' companion · '*' goal

import * as Audio from '../audio.js';

let canvas, ctx, animId;
let active = false;
let onComplete = null;

let world = null;
let PAL = null;
let ROWS = 0, COLS = 0;
let grid = [];
let you = { r: 0, c: 0 };
let friend = { r: 0, c: 0 };
let glint = { r: 0, c: 0 };
let hasFriend = false, hasGlint = false;
let metFriend = false;
let message = '';
let won = false;
let winT = 0;
let motes = [];   // reveal particles (crystals: fixed; fireflies: drifting)

export function isActive() { return active; }
export function hasWon() { return won; }   // for the hub: credit the win on any exit

export function start(w, opts = {}) {
  world = w;
  PAL = w.palette;
  onComplete = typeof opts.onComplete === 'function' ? opts.onComplete : null;
  canvas = document.getElementById('invaders-canvas');
  ctx = canvas.getContext('2d');
  sizeCanvas();

  const map = w.map;
  ROWS = map.length;
  COLS = map[0].length;
  grid = map.map((row) => row.split(''));
  hasFriend = hasGlint = false;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const ch = grid[r][c];
    if (ch === '@') { you = { r, c }; grid[r][c] = '.'; }
    else if (ch === 'k') { friend = { r, c }; grid[r][c] = '.'; hasFriend = true; }
    else if (ch === '*') { glint = { r, c }; grid[r][c] = '.'; hasGlint = true; }
  }
  metFriend = false;
  won = false;
  winT = 0;
  motes = [];
  message = w.intro || 'Move with the direction keys.';

  active = true;
  animId = requestAnimationFrame(render);
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  world = null;
  onComplete = null;
}

export function handleKey(e) {
  if (!active) return;
  if (won) { if (['Enter', ' '].includes(e.key)) finish(); return; }

  const dir = { n: [-1, 0], s: [1, 0], e: [0, 1], w: [0, -1] }[String(e.key).toLowerCase()];
  if (!dir) return;
  const tr = you.r + dir[0], tc = you.c + dir[1];

  if (tr < 0 || tr >= ROWS || tc < 0 || tc >= COLS || grid[tr][tc] === '#') {
    Audio.wrong();                       // wall/edge → the One-Rule nudge; you don't move
    message = world.wallLine || 'You can go another way.';
    return;
  }

  you = { r: tr, c: tc };
  Audio.correct();

  if (hasFriend && tr === friend.r && tc === friend.c && !metFriend) {
    metFriend = true;
    message = world.companionLine || '';
  } else if (hasGlint && tr === glint.r && tc === glint.c) {
    triggerReveal();
  } else {
    message = '';
  }
}

function triggerReveal() {
  won = true;
  winT = 0;
  const rev = world.reveal || {};
  message = rev.message || '';
  const colors = rev.colors && rev.colors.length ? rev.colors : ['#ffffff'];
  motes = [];
  const N = 80;
  for (let i = 0; i < N; i++) {
    motes.push({
      x: 0.06 + Math.random() * 0.88,
      y: 0.14 + Math.random() * 0.60,
      vx: (Math.random() - 0.5) * 0.0006,
      phase: Math.random() * Math.PI * 2,
      color: colors[i % colors.length],
      size: 2 + Math.floor(Math.random() * 3),
    });
  }
  Audio.levelComplete();
}

function finish() {
  if (onComplete) { const cb = onComplete; onComplete = null; cb(); }
}

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

  ctx.fillStyle = PAL.bg;
  ctx.fillRect(0, 0, W, H);

  if (won) drawReveal(W, H);
  else drawGrid(W, H);
  drawChrome(W, H);
  drawScanlines(W, H);

  if (won) { winT++; if (winT === 300) finish(); }   // ~5s to savour, then walk out
  animId = requestAnimationFrame(render);
}

function drawGrid(W, H) {
  const cell = Math.max(10, Math.floor(Math.min((W * 0.8) / COLS, (H * 0.62) / ROWS)));
  const gw = cell * COLS, gh = cell * ROWS;
  const ox = Math.round((W - gw) / 2), oy = Math.round((H - gh) / 2);
  const twinkle = 0.5 + 0.5 * Math.sin(performance.now() * 0.004);

  ctx.font = `${Math.round(cell * 0.9)}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';       // set explicitly — canvas state leaks (L28)
  ctx.textBaseline = 'middle';

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cx = ox + c * cell + cell / 2;
      const cy = oy + r * cell + cell / 2;
      let ch = grid[r][c], color = PAL.floor, glow = 0, alpha = 1;
      if (ch === '#') { ch = world.wallChar || '#'; color = PAL.wall; }
      else { ch = '·'; color = PAL.floor; alpha = 0.35; }
      if (hasGlint && r === glint.r && c === glint.c) { ch = '*'; color = PAL.glint; glow = 10; alpha = 0.4 + 0.6 * twinkle; }
      if (hasFriend && r === friend.r && c === friend.c) { ch = 'k'; color = PAL.friend; glow = 6; alpha = 1; }
      if (r === you.r && c === you.c) { ch = '@'; color = PAL.you; glow = 12; alpha = 1; }
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = glow;
      ctx.fillText(ch, cx, cy);
    }
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.textBaseline = 'alphabetic';
}

// The surprisingly-amazing reveal. 'crystals' = a fixed field of twinkling gems
// (a night sky underground); 'fireflies' = drifting glowing motes rising through
// a moonlit glade. Both bounded, glyph-free (little glowing shapes, not font chars).
function drawReveal(W, H) {
  const grow = Math.min(1, winT / 50);
  const kind = (world.reveal && world.reveal.kind) || 'crystals';
  const t = performance.now() * 0.002;

  const bloom = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, Math.max(W, H) * 0.7);
  bloom.addColorStop(0, kind === 'fireflies' ? 'rgba(90,120,70,0.22)' : 'rgba(60,90,140,0.25)');
  bloom.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, W, H);

  for (const s of motes) {
    if (kind === 'fireflies') {                 // drift upward + wander, respawn low
      s.y -= 0.0007;
      s.x += Math.sin(t + s.phase) * 0.0005 + s.vx;
      if (s.y < 0.10) { s.y = 0.72; s.x = 0.06 + Math.random() * 0.88; }
      if (s.x < 0.04) s.x = 0.04; if (s.x > 0.96) s.x = 0.96;
    }
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(t + s.phase));
    const sz = s.size * grow;
    const x = s.x * W, y = s.y * H;
    ctx.globalAlpha = tw * grow;
    ctx.fillStyle = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = (kind === 'fireflies' ? 10 : 8) * grow;
    if (kind === 'fireflies') {
      ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);        // a soft glowing dot
    } else {
      ctx.fillRect(x - sz, y - 1, sz * 2, 2);              // a little crystal diamond
      ctx.fillRect(x - 1, y - sz, 2, sz * 2);
    }
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // you, small, at the mouth of it, looking in
  ctx.font = `${Math.max(14, Math.floor(W * 0.02))}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = PAL.you;
  ctx.shadowColor = PAL.you;
  ctx.shadowBlur = 12;
  ctx.fillText('@', W / 2, H * 0.74);
  ctx.shadowBlur = 0;
  ctx.textBaseline = 'alphabetic';
}

function drawChrome(W, H) {
  const fs = Math.max(11, Math.floor(W * 0.013));
  ctx.font = `${fs}px "Press Start 2P", monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.fillStyle = won ? PAL.glint : PAL.friend;
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 6;
  ctx.fillText(world.title || '', Math.round(W * 0.07), Math.round(H * 0.06));
  ctx.shadowBlur = 0;

  if (message) {
    const small = Math.max(9, Math.floor(fs * 0.8));
    ctx.font = `${small}px "Press Start 2P", monospace`;
    ctx.fillStyle = won ? PAL.accent : PAL.friend;
    ctx.globalAlpha = 0.92;
    wrap(message, W - Math.round(W * 0.14), small).forEach((line, i) => {
      ctx.fillText(line, Math.round(W * 0.07), Math.round(H * 0.82) + i * Math.round(small * 1.7));
    });
    ctx.globalAlpha = 1;
  }

  const small = Math.max(9, Math.floor(fs * 0.72));
  ctx.font = `${small}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.wall;
  ctx.globalAlpha = 0.75;
  ctx.fillText(won ? 'SPACE / ENTER: back to the arcade' : 'move:   N   S   E   W', Math.round(W * 0.07), Math.round(H * 0.94));
  ctx.globalAlpha = 1;
  ctx.textBaseline = 'alphabetic';
}

function wrap(str, maxWidth, sz) {
  ctx.font = `${sz}px "Press Start 2P", monospace`;
  const out = []; let cur = '';
  for (const w of String(str).split(' ')) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width <= maxWidth || !cur) cur = t;
    else { out.push(cur); cur = w; }
  }
  if (cur) out.push(cur);
  return out.length ? out : [''];
}

function drawScanlines(W, H) {
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
}
