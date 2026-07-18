// Level 23: Missile Command (Atari, 1980)
// DEFENSIVE ONLY. Dark sky, city skyline + green ground. Cities can NEVER be hit —
// incoming trails are always intercepted (keystroke) or fizzle harmlessly high in the
// sky on their own. A miss is just a dud spark at the battery, never a loss.
//
// LAYOUT CONTRACT — "the UI owns the center; the theme owns the frame."
// The fixed DOM UI owns the center (prompt panel ~0.40-0.60W x 0.19-0.43H,
// keyboard guide ~0.22-0.78W x 0.49-0.81H). So everything the player must SEE is
// composed in the STAGE regions:
//   • City skyline runs across the FULL-WIDTH bottom strip (below the keyboard,
//     y ~0.85-0.95H) plus larger clusters in the lower-left and lower-right margins.
//   • Launcher batteries sit in the bottom CORNERS (clear of the keyboard).
//   • Incoming trails descend ONLY through the top band and the OUTER margins
//     (x < 0.22W or x > 0.78W) — never the center column where they'd vanish behind
//     panels. Interceptor bursts fire from a corner battery to the trail tip in the
//     margin. Un-intercepted trails fizzle harmlessly high in the sky.
// The sky gradient + stars fill the whole canvas (ambient fill behind panels is fine).
// All positions are fractions of W/H, never DOM px.

let canvas, ctx;
let animId = null, active = false, victoryMode = false;
let frame = 0, W = 0, H = 0;

let incoming = [];      // { x0, y0, targetX, targetY, progress, speed, alive, side }
let counters = [];      // { x0, y0, targetX, targetY, progress, target, resolved }
let rings = [];         // { x, y, r, age, maxAge, color }
let duds = [];          // { x, y, age }
let saved = 0;
const WIN_SAVED = 28;
let spawnTimer = 0;

// ─── Victory: bonus-city fireworks ─────────────────────────────────────────────
// After the sky quiets, shells rise FROM behind the city skyline, UP into the sky,
// then bloom into soft spark clusters — the game's real "cities are safe" bonus beat.
// Fireworks always travel UP and bloom soft; nothing ever descends toward the cities.
let shells = [];        // { x, y, vy, targetY, color } — rising, pre-bloom
let sparks = [];        // { x, y, vx, vy, age, maxAge, color } — post-bloom
let flashes = [];       // { x, y, age, maxAge, color } — detonation pop discs
let victoryStart = 0;   // frame the victory began
let launchTimer = 0;
let shellCount = 0;     // rotates the shell color so every color always appears
let finaleFired = false;
const VICTORY_MS = 3500;
const SHELL_CAP = 12;
const SPARK_CAP = 900;
const FLASH_CAP = 12;
// ONE saturated color per shell — red / green / warm gold / cyan rotation.
// Every spark gets a white-hot core drawn over its colored halo.
const FW_COLORS = ['255,70,70', '90,255,140', '255,200,60', '80,220,255'];

let cities = [];        // { x, y, w, cluster } — cluster: 'strip'|'left'|'right'

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  W = canvas.width; H = canvas.height;
  layoutCities();
}

// Ground line sits low, in the bottom strip beneath the keyboard guide (0.81H).
function groundY() { return Math.floor(H * 0.90); }

// Two corner launcher batteries, safely outside the keyboard's 0.22-0.78W span.
function batteries() {
  return [
    { x: W * 0.06, y: groundY() - 6 },
    { x: W * 0.94, y: groundY() - 6 },
  ];
}

function layoutCities() {
  cities = [];
  const GY = groundY();
  // Full-width skyline across the bottom strip (visible below the keyboard).
  const stripCount = 9;
  for (let i = 0; i < stripCount; i++) {
    const t = (i + 0.5) / stripCount;
    cities.push({ x: W * t, y: GY, w: Math.max(20, W * 0.035), cluster: 'strip' });
  }
  // Bigger clusters in the lower-left and lower-right margins.
  cities.push({ x: W * 0.10, y: GY, w: Math.max(34, W * 0.06), cluster: 'left' });
  cities.push({ x: W * 0.90, y: GY, w: Math.max(34, W * 0.06), cluster: 'right' });
}

// ─── Spawning ─────────────────────────────────────────────────────────────────
// Trails live only in the outer margins / top band. Each spawns at the top edge
// within a margin and heads down toward a fizzle point high in that same margin —
// never toward a city, never through the center column.

function marginStartX(side) {
  // side: -1 = left margin, +1 = right margin. Keep x clear of the 0.22-0.78 UI band.
  return side < 0
    ? W * (0.02 + Math.random() * 0.16)   // 0.02..0.18
    : W * (0.82 + Math.random() * 0.16);  // 0.82..0.98
}

function spawnIncoming() {
  const side = Math.random() < 0.5 ? -1 : 1;
  const x0 = marginStartX(side);
  // Aim to a point that stays in the margin and high in the sky (above the keyboard).
  const targetX = x0 + (Math.random() - 0.5) * W * 0.06;
  const targetY = H * (0.30 + Math.random() * 0.14);   // 0.30..0.44H — still high sky
  incoming.push({
    x0, y0: -10,
    targetX, targetY,
    progress: 0,
    speed: 0.0045 + Math.random() * 0.002,
    alive: true,
    side,
  });
}

// Live head position of a trail at its current progress.
function headOf(m) {
  return {
    x: m.x0 + (m.targetX - m.x0) * m.progress,
    y: m.y0 + (m.targetY - m.y0) * m.progress,
  };
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, groundY());
  g.addColorStop(0, '#050014');
  g.addColorStop(1, '#0a0028');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, groundY());

  // Stars across the whole sky (ambient fill; fine behind panels).
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 80; i++) {
    const x = (i * 137.3) % W;
    const y = (i * 71.9) % groundY();
    ctx.fillRect(x, y, 1, 1);
  }
}

function drawGround() {
  const GY = groundY();
  ctx.fillStyle = '#0d3a12';
  ctx.fillRect(0, GY, W, H - GY);
  ctx.fillStyle = '#12a02a';
  ctx.fillRect(0, GY, W, 3);
}

function drawCityCluster(c) {
  const GY = c.y;
  const pulse = 0.85 + Math.sin(frame * 0.05 + c.x) * 0.06;
  ctx.fillStyle = `rgba(60,220,255,${pulse})`;
  const baseW = c.w;
  // Denser skyline for the big margin clusters, simpler for the strip.
  const big = c.cluster !== 'strip';
  const blocks = big
    ? [
        { dx: -baseW * 0.5, w: baseW * 0.22, h: 20 },
        { dx: -baseW * 0.24, w: baseW * 0.26, h: 34 },
        { dx: baseW * 0.06, w: baseW * 0.22, h: 26 },
        { dx: baseW * 0.32, w: baseW * 0.24, h: 40 },
      ]
    : [
        { dx: -baseW * 0.4, w: baseW * 0.3, h: 14 },
        { dx: -baseW * 0.05, w: baseW * 0.35, h: 22 },
        { dx: baseW * 0.32, w: baseW * 0.28, h: 12 },
      ];
  // In victory, windows warm up brighter — the city celebrating being saved.
  const winA = victoryMode ? (0.85 + Math.sin(frame * 0.18 + c.x) * 0.15) : 0.8;
  blocks.forEach(b => {
    ctx.fillRect(c.x + b.dx, GY - b.h, b.w, b.h);
    // glowing windows
    ctx.fillStyle = `rgba(255,230,140,${winA})`;
    ctx.fillRect(c.x + b.dx + b.w * 0.3, GY - b.h * 0.6, 2, 2);
    ctx.fillRect(c.x + b.dx + b.w * 0.6, GY - b.h * 0.3, 2, 2);
    if (victoryMode) {
      // Extra lit windows during the celebration.
      ctx.fillRect(c.x + b.dx + b.w * 0.15, GY - b.h * 0.4, 2, 2);
      ctx.fillRect(c.x + b.dx + b.w * 0.7, GY - b.h * 0.7, 2, 2);
    }
    ctx.fillStyle = `rgba(60,220,255,${pulse})`;
  });
}

function drawCities() {
  cities.forEach(drawCityCluster);
  if (victoryMode) {
    // Additive warm wash over the whole skyline — the saved city glowing under
    // the fireworks. Gentle pulse, clearly warmer than the idle cool-blue city.
    const GY = groundY();
    const a = 0.22 + Math.sin(frame * 0.1) * 0.08;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, GY - 56, 0, GY + 6);
    g.addColorStop(0, 'rgba(255,150,50,0)');
    g.addColorStop(0.7, `rgba(255,150,50,${Math.max(0, a)})`);
    g.addColorStop(1, `rgba(255,190,90,${Math.max(0, a * 1.3)})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, GY - 56, W, 62);
    ctx.restore();
  }
}

function drawBatteries() {
  batteries().forEach(b => {
    ctx.fillStyle = '#3cdcff';
    // Bunker mound (trapezoid) sitting on the ground.
    ctx.beginPath();
    ctx.moveTo(b.x - 26, groundY());
    ctx.lineTo(b.x - 12, b.y - 16);
    ctx.lineTo(b.x + 12, b.y - 16);
    ctx.lineTo(b.x + 26, groundY());
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0a0028';
    ctx.fillRect(b.x - 4, b.y - 24, 8, 10);
    // Stacked ammo dots on the mound.
    ctx.fillStyle = '#9af0ff';
    ctx.fillRect(b.x - 8, b.y - 6, 3, 3);
    ctx.fillRect(b.x - 2, b.y - 6, 3, 3);
    ctx.fillRect(b.x + 4, b.y - 6, 3, 3);
  });
}

// Nearest corner battery to a given x (interceptors launch from whichever is closer).
function batteryFor(x) {
  const bs = batteries();
  return (x < W / 2) ? bs[0] : bs[1];
}

function drawIncoming() {
  incoming.forEach(m => {
    if (!m.alive) return;
    const h = headOf(m);
    // Trail from spawn point to head.
    ctx.strokeStyle = 'rgba(255,90,90,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(m.x0, m.y0);
    ctx.lineTo(h.x, h.y);
    ctx.stroke();
    // Head
    ctx.fillStyle = '#ff5a5a';
    ctx.shadowColor = '#ff5a5a';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(h.x, h.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function drawCounters() {
  counters.forEach(c => {
    const x = c.x0 + (c.targetX - c.x0) * c.progress;
    const y = c.y0 + (c.targetY - c.y0) * c.progress;
    ctx.strokeStyle = 'rgba(140,255,180,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c.x0, c.y0);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = '#c8ffd8';
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawRings() {
  rings.forEach(r => {
    const t = r.age / r.maxAge;
    ctx.strokeStyle = r.color.replace('ALPHA', String(1 - t));
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.r * (0.3 + t * 1.4), 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawDuds() {
  duds.forEach(d => {
    const t = d.age / 16;
    ctx.strokeStyle = `rgba(255,220,120,${1 - t})`;
    ctx.lineWidth = 2;
    const s = 5 + t * 4;
    ctx.beginPath();
    ctx.moveTo(d.x - s, d.y); ctx.lineTo(d.x + s, d.y);
    ctx.moveTo(d.x, d.y - s); ctx.lineTo(d.x, d.y + s);
    ctx.stroke();
  });
}

function drawHUD() {
  ctx.fillStyle = '#3cdcff';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.shadowColor = '#3cdcff';
  ctx.shadowBlur = 5;
  ctx.fillText(`SAVED ${saved}/${WIN_SAVED}`, 14, 22);
  ctx.shadowBlur = 0;
}

// Launch a shell from just behind the city skyline (ground level), rising up into
// the sky. It blooms when it reaches its target altitude. Spread across the full
// width so fireworks arc over the whole saved city, not just the margins.
function launchShell(fast) {
  if (shells.length >= SHELL_CAP) return;
  const x = W * (0.06 + Math.random() * 0.88);
  const targetY = H * (0.08 + Math.random() * 0.30);   // 0.08..0.38H — high sky
  shells.push({
    x,
    y: groundY() - 4,
    vy: -((fast ? 11 : 8.5) + Math.random() * 3),
    targetY,
    color: FW_COLORS[shellCount++ % FW_COLORS.length],  // rotate so every color shows
  });
}

// A shell reaching altitude detonates: a bright flash disc + a dense radial bloom.
// Burst radius ~3-4x the first pass: faster sparks, slower damping, longer life.
function bloom(x, y, color) {
  if (flashes.length < FLASH_CAP) {
    flashes.push({ x, y, age: 0, maxAge: 12, color });
  }
  const n = 64 + Math.floor(Math.random() * 20);
  for (let i = 0; i < n; i++) {
    if (sparks.length >= SPARK_CAP) break;
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.25;
    const spd = 3 + Math.random() * 5.5;
    sparks.push({
      x, y,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      age: 0,
      maxAge: 42 + Math.floor(Math.random() * 20),
      color,
    });
  }
}

function updateFireworks() {
  const elapsed = Math.max(0, frame - victoryStart);
  launchTimer--;
  // Staggered cadence + a floor of 2 airborne shells so the sky is never empty.
  if (launchTimer <= 0 || shells.length < 2) {
    launchShell(false);
    launchTimer = 6 + Math.floor(Math.random() * 7);
  }
  // Finale cluster: three near-simultaneous fast bursts late in the window.
  if (!finaleFired && elapsed >= 140) {
    finaleFired = true;
    launchShell(true); launchShell(true); launchShell(true);
  }
  // Rising shells — travel UP only; bloom at target altitude.
  shells.forEach(s => { s.y += s.vy; });
  shells.forEach(s => {
    if (s.y <= s.targetY) bloom(s.x, s.y, s.color);
  });
  shells = shells.filter(s => s.y > s.targetY);
  // Sparks drift out and gently down (gravity), fading.
  sparks.forEach(sp => {
    sp.x += sp.vx;
    sp.y += sp.vy;
    sp.vy += 0.05;      // gentle gravity — sparks fall soft, never a targeted trail
    sp.vx *= 0.97;
    sp.age++;
  });
  sparks = sparks.filter(sp => sp.age < sp.maxAge);
  flashes.forEach(f => f.age++);
  flashes = flashes.filter(f => f.age < f.maxAge);
}

function drawFireworks() {
  ctx.save();
  // Additive blending: overlapping sparks and flashes genuinely GLOW against
  // the black sky instead of layering as flat dots.
  ctx.globalCompositeOperation = 'lighter';

  // Rising shell trails — a bright streak trailing behind each climbing shell.
  shells.forEach(s => {
    ctx.strokeStyle = `rgba(${s.color},0.9)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x, Math.min(groundY(), s.y - s.vy * 2.5));  // trail points DOWN behind it
    ctx.stroke();
    // White-hot shell head.
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
  });

  // Detonation flash — a brief bright disc that sells the pop.
  flashes.forEach(f => {
    const t = f.age / f.maxAge;
    const r = 14 + t * 34;
    const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
    g.addColorStop(0, `rgba(255,255,255,${0.9 * (1 - t)})`);
    g.addColorStop(0.4, `rgba(${f.color},${0.7 * (1 - t)})`);
    g.addColorStop(1, `rgba(${f.color},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Bloomed sparks — colored halo with a white-hot core.
  sparks.forEach(sp => {
    const t = sp.age / sp.maxAge;
    const alpha = Math.max(0, 1 - t);
    const halo = t < 0.4 ? 5 : 4;
    ctx.fillStyle = `rgba(${sp.color},${alpha * 0.85})`;
    ctx.fillRect(sp.x - halo / 2, sp.y - halo / 2, halo, halo);
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
    ctx.fillRect(sp.x - 1, sp.y - 1, 2, 2);
  });

  ctx.restore();
}

// Warm "THE CITIES ARE SAFE" line in the top band — this level's identity is protection.
function drawSafeText() {
  const t = (frame - victoryStart) / 24;
  const alpha = Math.min(1, t) * (0.75 + Math.sin(frame * 0.12) * 0.25);
  ctx.save();
  ctx.font = '14px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = `rgba(255,230,140,${Math.max(0, alpha)})`;
  ctx.shadowColor = 'rgba(255,180,80,0.9)';
  ctx.shadowBlur = 12;
  ctx.fillText('THE CITIES ARE SAFE', W * 0.5, H * 0.10);
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ─── Update ───────────────────────────────────────────────────────────────────

// Lowest (closest-to-fizzle) live incoming trail — the one to intercept next.
function nearestIncoming() {
  let best = null, bestY = -Infinity;
  incoming.forEach(m => {
    if (!m.alive) return;
    const y = headOf(m).y;
    if (y > bestY) { bestY = y; best = m; }
  });
  return best;
}

function update() {
  if (!victoryMode) {
    spawnTimer--;
    if (spawnTimer <= 0 && incoming.filter(m => m.alive).length < 5) {
      spawnIncoming();
      spawnTimer = 34 + Math.floor(Math.random() * 26);
    }

    incoming.forEach(m => {
      if (!m.alive) return;
      m.progress += m.speed;
      if (m.progress >= 1) {
        // Never reaches anything — fizzles harmlessly high in the sky with a soft sparkle.
        m.alive = false;
        const h = headOf(m);
        rings.push({ x: h.x, y: h.y, r: 5, age: 0, maxAge: 24, color: 'rgba(255,200,120,ALPHA)' });
      }
    });
    incoming = incoming.filter(m => m.alive);
  } else {
    updateFireworks();
  }

  counters.forEach(c => { c.progress = Math.min(1, c.progress + 0.08); });
  counters.forEach(c => {
    if (c.progress >= 1 && !c.resolved) {
      c.resolved = true;
      // Satisfying expanding interceptor burst at the trail tip (in the margin).
      rings.push({ x: c.targetX, y: c.targetY, r: 7, age: 0, maxAge: 28, color: 'rgba(140,255,180,ALPHA)' });
      if (c.target && c.target.alive) c.target.alive = false;
    }
  });
  counters = counters.filter(c => !c.resolved || c.progress < 1.15);

  rings.forEach(r => r.age++);
  rings = rings.filter(r => r.age < r.maxAge);

  duds.forEach(d => d.age++);
  duds = duds.filter(d => d.age < 16);

  frame++;
}

// ─── Render loop ─────────────────────────────────────────────────────────────

function render() {
  if (!active) return;
  ctx.clearRect(0, 0, W, H);

  drawSky();
  drawGround();
  drawCities();
  drawIncoming();
  drawCounters();
  drawRings();
  drawDuds();
  drawBatteries();
  if (victoryMode) {
    drawFireworks();
    drawSafeText();
  } else {
    drawHUD();
  }
  update();

  animId = requestAnimationFrame(render);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function start() {
  getCanvas(); resize();
  active = true; victoryMode = false; frame = 0;
  incoming = []; counters = []; rings = []; duds = [];
  shells = []; sparks = []; flashes = [];
  shellCount = 0; finaleFired = false;
  saved = 0; spawnTimer = 20;
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  incoming = []; counters = []; rings = []; duds = [];
  shells = []; sparks = []; flashes = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  const target = nearestIncoming();
  if (!target) {
    // No incoming right now — fire a friendly test shot up into a margin. Still a save.
    const side = Math.random() < 0.5 ? -1 : 1;
    const b = batteryFor(side < 0 ? 0 : W);
    counters.push({
      x0: b.x, y0: b.y - 20,
      targetX: side < 0 ? W * 0.10 : W * 0.90,
      targetY: H * 0.32,
      progress: 0, target: null, resolved: false,
    });
  } else {
    const h = headOf(target);
    const b = batteryFor(h.x);
    counters.push({
      x0: b.x, y0: b.y - 20,
      targetX: h.x, targetY: h.y,
      progress: 0, target, resolved: false,
    });
  }
  saved = Math.min(WIN_SAVED, saved + 1);
}

export function miss() {
  // A dud spark at a battery — never a city hit, never a loss.
  if (!active || victoryMode) return;
  const b = batteries()[Math.random() < 0.5 ? 0 : 1];
  duds.push({ x: b.x, y: b.y - 16, age: 0 });
}

export function patternComplete() {
  return saved >= WIN_SAVED;
}

export function victory() {
  // The sky quiets — clear the last in-flight missiles — then bonus-city fireworks
  // bloom over the still-standing skyline. Returns its duration; the engine lands
  // the LEVEL COMPLETE card as the celebration plays out.
  victoryMode = true;
  victoryStart = frame;
  launchTimer = 0;
  shellCount = 0; finaleFired = false;
  incoming = []; counters = []; duds = [];
  shells = []; sparks = []; flashes = [];
  return VICTORY_MS;
}

window.addEventListener('resize', () => { if (active) resize(); });
