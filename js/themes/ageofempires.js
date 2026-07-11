// Age of Empires — Ensemble Studios, 1997 — Level 18
// Medieval landscape with castle, troops marching, resource gathering.

let canvas, ctx, animId;
let active = false;
let troops = [];
let resources = { wood: 0, gold: 0, food: 0, stone: 0 };
let totalGathered = 0;
let particles = [];
const WIN_RESOURCES = 25;
const RESOURCE_TYPES = ['wood', 'gold', 'food', 'stone'];
const RESOURCE_COLORS = { wood: '#8b5e2a', gold: '#c8a840', food: '#44aa44', stone: '#888888' };

// Tiny troop pixel art (3x5)
const TROOP_SPRITE = [
  [0,1,0],
  [1,1,1],
  [0,1,0],
  [1,0,1],
  [1,0,1],
];

function init() {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  troops = [];
  particles = [];
  resources = { wood: 0, gold: 0, food: 0, stone: 0 };
  totalGathered = 0;

  // Spawn 3 initial troops
  for (let i = 0; i < 3; i++) spawnTroop(canvas.width, canvas.height);
}

function spawnTroop(W, H) {
  troops.push({
    x: Math.random() * W * 0.6 + W * 0.1,
    y: H * 0.68 + Math.random() * H * 0.06,
    vx: (Math.random() - 0.5) * 0.6,
    vy: 0,
    facing: Math.random() > 0.5 ? 1 : -1,
    frame: Math.floor(Math.random() * 4),
    frameTimer: 0,
    scale: 3 + Math.random() * 2,
  });
}

function drawLandscape(W, H) {
  // Sky gradient — parchment dawn
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.6);
  skyGrad.addColorStop(0, '#100804');
  skyGrad.addColorStop(0.6, '#1e1008');
  skyGrad.addColorStop(1, '#2a1a0a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H * 0.6);

  // Hills silhouette — distant
  ctx.fillStyle = '#1a1008';
  ctx.beginPath();
  ctx.moveTo(0, H * 0.55);
  ctx.bezierCurveTo(W * 0.15, H * 0.38, W * 0.28, H * 0.42, W * 0.4, H * 0.45);
  ctx.bezierCurveTo(W * 0.52, H * 0.48, W * 0.6, H * 0.38, W * 0.72, H * 0.42);
  ctx.bezierCurveTo(W * 0.84, H * 0.46, W * 0.9, H * 0.4, W, H * 0.5);
  ctx.lineTo(W, H * 0.6);
  ctx.lineTo(0, H * 0.6);
  ctx.closePath();
  ctx.fill();

  // Ground
  const groundGrad = ctx.createLinearGradient(0, H * 0.6, 0, H);
  groundGrad.addColorStop(0, '#2a1a0a');
  groundGrad.addColorStop(0.3, '#3a2010');
  groundGrad.addColorStop(1, '#200e06');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, H * 0.6, W, H * 0.4);

  // Ground texture — grass/dirt lines
  ctx.strokeStyle = 'rgba(80, 50, 20, 0.3)';
  ctx.lineWidth = 1;
  for (let y = H * 0.62; y < H; y += H * 0.04) {
    ctx.beginPath();
    ctx.moveTo(0, y + Math.sin(y) * 2);
    ctx.lineTo(W, y + Math.cos(y) * 2);
    ctx.stroke();
  }
}

function drawCastle(W, H) {
  const cx = W * 0.76;
  const baseY = H * 0.6;

  const tw = 18; // tower width
  const th = H * 0.22; // tower height
  const mw = 28; // main wall width
  const mh = H * 0.16;

  // Main wall
  ctx.fillStyle = '#3a3028';
  ctx.fillRect(Math.round(cx - mw/2), Math.round(baseY - mh), mw, mh);

  // Main tower (left)
  ctx.fillStyle = '#302820';
  ctx.fillRect(Math.round(cx - mw/2 - tw + 4), Math.round(baseY - th), tw, th);

  // Main tower (right)
  ctx.fillRect(Math.round(cx + mw/2 - 4), Math.round(baseY - th), tw, th);

  // Battlements — left tower
  for (let bx = 0; bx < 3; bx++) {
    ctx.fillRect(Math.round(cx - mw/2 - tw + 4 + bx*6), Math.round(baseY - th - 5), 4, 5);
  }
  // Battlements — right tower
  for (let bx = 0; bx < 3; bx++) {
    ctx.fillRect(Math.round(cx + mw/2 - 4 + bx*6), Math.round(baseY - th - 5), 4, 5);
  }
  // Battlements — main wall
  for (let bx = 0; bx < 4; bx++) {
    ctx.fillRect(Math.round(cx - mw/2 + bx*7), Math.round(baseY - mh - 5), 4, 5);
  }

  // Gate
  ctx.fillStyle = '#0a0806';
  const gw = 10, gh = 14;
  ctx.fillRect(Math.round(cx - gw/2), Math.round(baseY - gh), gw, gh);

  // Arrow slit windows
  ctx.fillStyle = '#0a0806';
  ctx.fillRect(Math.round(cx - mw/2 - tw/2), Math.round(baseY - th + 6), 3, 6);
  ctx.fillRect(Math.round(cx + mw/2 - tw/2 + 10), Math.round(baseY - th + 6), 3, 6);

  // Banner
  const t = performance.now() / 1000;
  const flagX = Math.round(cx - mw/2 - tw/2 + 2);
  const flagY = Math.round(baseY - th - 5);
  ctx.strokeStyle = '#8b5e2a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(flagX, flagY - 12);
  ctx.lineTo(flagX, flagY);
  ctx.stroke();
  ctx.fillStyle = '#c8840a';
  ctx.beginPath();
  ctx.moveTo(flagX + 1, flagY - 12);
  ctx.lineTo(flagX + 8 + Math.sin(t * 2) * 2, flagY - 8 + Math.sin(t * 2) * 1);
  ctx.lineTo(flagX + 1, flagY - 4);
  ctx.closePath();
  ctx.fill();
}

function drawTroop(t) {
  const px = 3;
  const facing = t.facing;
  const scale = Math.round(t.scale);
  const sprite = TROOP_SPRITE;

  ctx.fillStyle = '#3a2a14';
  sprite.forEach((row, ry) => {
    row.forEach((cell, rx) => {
      if (!cell) return;
      const dx = facing === 1 ? rx : (2 - rx);
      ctx.fillRect(
        Math.round(t.x + dx * px * scale / px),
        Math.round(t.y + ry * scale - sprite.length * scale),
        scale, scale
      );
    });
  });

  // Spear
  ctx.strokeStyle = '#5a4a28';
  ctx.lineWidth = 1;
  const spearX = t.x + (facing === 1 ? scale * 3 : -scale * 1);
  ctx.beginPath();
  ctx.moveTo(spearX, t.y - sprite.length * scale);
  ctx.lineTo(spearX, t.y - sprite.length * scale - scale * 5);
  ctx.stroke();
}

function drawResources(W, H) {
  let rx = W * 0.02;
  const ry = H * 0.92;
  const cols = ['wood', 'gold', 'food', 'stone'];

  cols.forEach((res, i) => {
    const label = res[0].toUpperCase() + ':' + resources[res];
    const col = RESOURCE_COLORS[res];

    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 4;
    ctx.fillText(label, Math.round(W * (0.04 + i * 0.24)), ry);
    ctx.shadowBlur = 0;
  });

  // Total progress bar
  const pct = totalGathered / WIN_RESOURCES;
  const barW = Math.round(W * 0.18);
  const bx = Math.round(W * 0.02);
  const by = 14;

  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#c8840a';
  ctx.shadowColor = '#c8840a';
  ctx.shadowBlur = 4;
  ctx.fillText(`EMPIRE ${totalGathered}/${WIN_RESOURCES}`, bx, by);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#201408';
  ctx.fillRect(bx, by + 5, barW, 8);
  ctx.fillStyle = '#c8840a';
  ctx.fillRect(bx, by + 5, Math.round(barW * pct), 8);
  ctx.strokeStyle = '#5a3800';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx + 0.5, by + 5.5, barW - 1, 7);
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.life -= 0.04;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.col;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), 3, 3);
    ctx.globalAlpha = 1;
  }
}

function render() {
  if (!active) return;
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  drawLandscape(W, H);
  drawCastle(W, H);

  // Update and draw troops
  troops.forEach(t => {
    t.x += t.vx * t.facing;
    if (t.x < W * 0.05 || t.x > W * 0.7) t.facing *= -1;
    drawTroop(t);
  });

  updateParticles();
  drawResources(W, H);

  animId = requestAnimationFrame(render);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function start() {
  init();
  active = true;
  animId = requestAnimationFrame(render);
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function keystroke() {
  if (!active) return;
  totalGathered++;
  const type = RESOURCE_TYPES[totalGathered % RESOURCE_TYPES.length];
  resources[type]++;

  // Spawn a resource particle
  const W = canvas.width, H = canvas.height;
  const col = RESOURCE_COLORS[type];
  for (let i = 0; i < 5; i++) {
    particles.push({
      x: W * 0.15 + Math.random() * W * 0.55,
      y: H * 0.65 + Math.random() * H * 0.1,
      vx: (Math.random() - 0.5) * 2,
      vy: -1 - Math.random() * 2,
      life: 1,
      col,
    });
  }

  // Spawn a new troop every 5 resources
  if (totalGathered % 5 === 0) spawnTroop(W, H);
}

export function miss() {}

export function patternComplete() {
  return totalGathered >= WIN_RESOURCES;
}

export function victory() {
  // Spawn lots of particles
  if (!active) return;
  const W = canvas.width, H = canvas.height;
  RESOURCE_TYPES.forEach(type => {
    const col = RESOURCE_COLORS[type];
    for (let i = 0; i < 10; i++) {
      particles.push({
        x: W * (0.1 + Math.random() * 0.6),
        y: H * 0.65,
        vx: (Math.random() - 0.5) * 4,
        vy: -2 - Math.random() * 4,
        life: 1,
        col,
      });
    }
  });
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
