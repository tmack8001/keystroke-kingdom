// Level 23: Missile Command (Atari, 1980)
// DEFENSIVE ONLY. Dark sky, city skyline + green ground. Cities can NEVER be hit —
// incoming trails are always intercepted (keystroke) or fizzle harmlessly high in the
// sky on their own. A miss is just a dud spark at the battery, never a loss.

let canvas, ctx;
let animId = null, active = false, victoryMode = false;
let frame = 0, W = 0, H = 0;

let incoming = [];      // { x, y, targetX, targetY, progress, speed, alive }
let counters = [];      // { x, y, targetX, targetY, progress }
let rings = [];         // { x, y, r, age, maxAge, color }
let duds = [];          // { x, y, age }
let saved = 0;
const WIN_SAVED = 28;
let spawnTimer = 0;
let fireworkTimer = 0;

const CITY_COUNT = 6;
let cities = [];

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

function groundY() { return Math.floor(H * 0.82); }
function batteryPos() { return { x: W / 2, y: groundY() - 6 }; }

function layoutCities() {
  cities = [];
  const margin = W * 0.08;
  const usable = W - margin * 2;
  for (let i = 0; i < CITY_COUNT; i++) {
    // Leave a gap in the middle for the battery
    const t = i / (CITY_COUNT - 1);
    let x = margin + t * usable;
    if (Math.abs(x - W / 2) < W * 0.06) {
      x += (x < W / 2 ? -1 : 1) * W * 0.06;
    }
    cities.push({ x, w: Math.max(24, W * 0.045) });
  }
}

// ─── Spawning ─────────────────────────────────────────────────────────────────

function spawnIncoming() {
  const startX = Math.random() * W;
  const target = cities.length ? cities[Math.floor(Math.random() * cities.length)] : { x: W / 2 };
  incoming.push({
    x: startX, y: -10,
    targetX: target.x + (Math.random() - 0.5) * 10,
    targetY: groundY() - 4,
    progress: 0,
    speed: 0.0035 + Math.random() * 0.0015,
    alive: true,
  });
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, groundY());
  g.addColorStop(0, '#050014');
  g.addColorStop(1, '#0a0028');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, groundY());

  // Stars
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 60; i++) {
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

function drawCities() {
  const GY = groundY();
  cities.forEach((c, i) => {
    const pulse = 0.85 + Math.sin(frame * 0.05 + i) * 0.05;
    ctx.fillStyle = `rgba(60,220,255,${pulse})`;
    // Simple skyline block cluster per city
    const baseW = c.w;
    const blocks = [
      { dx: -baseW * 0.4, w: baseW * 0.3, h: 16 },
      { dx: -baseW * 0.05, w: baseW * 0.35, h: 24 },
      { dx: baseW * 0.32, w: baseW * 0.28, h: 12 },
    ];
    blocks.forEach(b => {
      ctx.fillRect(c.x + b.dx, GY - b.h, b.w, b.h);
    });
    // Little glowing windows
    ctx.fillStyle = 'rgba(255,230,140,0.8)';
    ctx.fillRect(c.x - baseW * 0.02, GY - 18, 2, 2);
    ctx.fillRect(c.x + baseW * 0.12, GY - 10, 2, 2);
  });
}

function drawBattery() {
  const b = batteryPos();
  ctx.fillStyle = '#3cdcff';
  // Bunker shape (trapezoid)
  ctx.beginPath();
  ctx.moveTo(b.x - 22, groundY());
  ctx.lineTo(b.x - 10, b.y - 14);
  ctx.lineTo(b.x + 10, b.y - 14);
  ctx.lineTo(b.x + 22, groundY());
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#0a0028';
  ctx.fillRect(b.x - 4, b.y - 22, 8, 8);

  // Muzzle flash right after a keystroke fire
  if (fireworkTimer > 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(b.x, b.y - 20, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawIncoming() {
  const GY = groundY();
  incoming.forEach(m => {
    if (!m.alive) return;
    const x = m.x + (m.targetX - m.x) * m.progress;
    const y = -10 + (m.targetY - (-10)) * m.progress;
    // Trail
    ctx.strokeStyle = 'rgba(255,90,90,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(m.x, -10);
    ctx.lineTo(x, y);
    ctx.stroke();
    // Head
    ctx.fillStyle = '#ff5a5a';
    ctx.shadowColor = '#ff5a5a';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function drawCounters() {
  counters.forEach(c => {
    const x = c.x + (c.targetX - c.x) * c.progress;
    const y = c.y + (c.targetY - c.y) * c.progress;
    ctx.strokeStyle = 'rgba(140,255,180,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
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

function drawFireworks() {
  // Victory: sky fills with celebratory rings — fireworks, not war.
  if (frame % 14 === 0) {
    rings.push({
      x: Math.random() * W,
      y: Math.random() * groundY() * 0.7,
      r: 6,
      age: 0,
      maxAge: 40,
      color: `hsla(${Math.random() * 360},90%,65%,ALPHA)`,
    });
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

function nearestIncoming() {
  let best = null, bestY = -Infinity;
  incoming.forEach(m => {
    if (!m.alive) return;
    const y = -10 + (m.targetY - (-10)) * m.progress;
    if (y > bestY) { bestY = y; best = m; }
  });
  return best;
}

function update() {
  if (!victoryMode) {
    spawnTimer--;
    if (spawnTimer <= 0 && incoming.filter(m => m.alive).length < 4) {
      spawnIncoming();
      spawnTimer = 40 + Math.floor(Math.random() * 30);
    }

    incoming.forEach(m => {
      if (!m.alive) return;
      m.progress += m.speed;
      if (m.progress >= 1) {
        // Never allowed to reach a city — fizzles harmlessly high in the sky instead.
        m.alive = false;
        const x = m.x + (m.targetX - m.x) * 0.55;
        const y = -10 + (m.targetY - (-10)) * 0.55;
        rings.push({ x, y, r: 5, age: 0, maxAge: 22, color: 'rgba(255,200,120,ALPHA)' });
      }
    });
    incoming = incoming.filter(m => m.alive || true).filter(m => m.progress < 1.02);
  } else {
    drawFireworks();
  }

  counters.forEach(c => { c.progress = Math.min(1, c.progress + 0.08); });
  counters.forEach(c => {
    if (c.progress >= 1 && !c.resolved) {
      c.resolved = true;
      rings.push({ x: c.targetX, y: c.targetY, r: 6, age: 0, maxAge: 26, color: 'rgba(140,255,180,ALPHA)' });
      const target = incoming.find(m => m === c.target);
      if (target) target.alive = false;
    }
  });
  counters = counters.filter(c => !c.resolved || c.progress < 1.15);

  rings.forEach(r => r.age++);
  rings = rings.filter(r => r.age < r.maxAge);

  duds.forEach(d => d.age++);
  duds = duds.filter(d => d.age < 16);

  if (fireworkTimer > 0) fireworkTimer--;
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
  drawBattery();
  drawHUD();
  update();

  animId = requestAnimationFrame(render);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function start() {
  getCanvas(); resize();
  active = true; victoryMode = false; frame = 0;
  incoming = []; counters = []; rings = []; duds = [];
  saved = 0; spawnTimer = 20; fireworkTimer = 0;
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  incoming = []; counters = []; rings = []; duds = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  const target = nearestIncoming();
  const b = batteryPos();
  fireworkTimer = 6;
  if (!target) {
    // No incoming right now — fire a friendly test shot straight up, still counts as a save.
    counters.push({
      x: b.x, y: b.y - 20,
      targetX: b.x, targetY: groundY() * 0.35,
      progress: 0, target: null, resolved: false,
    });
  } else {
    const tx = target.x + (target.targetX - target.x) * target.progress;
    const ty = -10 + (target.targetY - (-10)) * target.progress;
    counters.push({
      x: b.x, y: b.y - 20,
      targetX: tx, targetY: ty,
      progress: 0, target, resolved: false,
    });
  }
  saved = Math.min(WIN_SAVED, saved + 1);
}

export function miss() {
  // A dud spark at the battery — never a city hit, never a loss.
  if (!active || victoryMode) return;
  const b = batteryPos();
  duds.push({ x: b.x, y: b.y - 16, age: 0 });
}

export function patternComplete() {
  return saved >= WIN_SAVED;
}

export function victory() {
  victoryMode = true;
  incoming = [];
}

window.addEventListener('resize', () => { if (active) resize(); });
