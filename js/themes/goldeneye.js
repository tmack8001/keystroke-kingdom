// GoldenEye 007 — Rare, 1997 — Level 17
// Dark facility corridor with crosshair overlay. Shots fired on keystroke.

let canvas, ctx, animId;
let active = false;
let shots = 0;
let flashes = [];
let crosshairX, crosshairY;
let scanLineY = 0;
const WIN_SHOTS = 25;

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  shots = 0;
  flashes = [];
  crosshairX = canvas.width  * 0.5;
  crosshairY = canvas.height * 0.48;
  scanLineY  = 0;
}

// ─── Drawing ──────────────────────────────────────────────────────────────────

function drawCorridor(W, H) {
  // Background: dark facility wall
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, W, H);

  // Corridor perspective walls
  const vp = { x: W / 2, y: H * 0.42 };
  const sides = [0.08, 0.14, 0.2];

  sides.forEach((d, i) => {
    const alpha = 0.3 - i * 0.08;
    ctx.strokeStyle = `rgba(80, 80, 70, ${alpha})`;
    ctx.lineWidth = 1;

    // Top-left to vp
    ctx.beginPath();
    ctx.moveTo(W * d, 0);
    ctx.lineTo(vp.x, vp.y);
    ctx.stroke();

    // Bottom-left to vp
    ctx.beginPath();
    ctx.moveTo(W * d, H);
    ctx.lineTo(vp.x, vp.y);
    ctx.stroke();

    // Top-right to vp
    ctx.beginPath();
    ctx.moveTo(W * (1 - d), 0);
    ctx.lineTo(vp.x, vp.y);
    ctx.stroke();

    // Bottom-right to vp
    ctx.beginPath();
    ctx.moveTo(W * (1 - d), H);
    ctx.lineTo(vp.x, vp.y);
    ctx.stroke();
  });

  // Ceiling and floor bands
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, W, H * 0.12);
  ctx.fillRect(0, H * 0.88, W, H * 0.12);

  // Wall panels — horizontal lines suggesting tiled surfaces
  ctx.strokeStyle = '#1a1a18';
  ctx.lineWidth = 1;
  for (let y = H * 0.12; y < H * 0.88; y += H * 0.09) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Ceiling lights
  const lightSpacing = W * 0.25;
  for (let lx = lightSpacing / 2; lx < W; lx += lightSpacing) {
    const grad = ctx.createRadialGradient(lx, H * 0.1, 0, lx, H * 0.1, H * 0.3);
    grad.addColorStop(0, 'rgba(200, 180, 100, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H * 0.5);

    ctx.fillStyle = '#c8a840';
    ctx.fillRect(Math.round(lx - 8), Math.round(H * 0.1) - 2, 16, 4);
  }

  // Enemy silhouette (guard) — only when shots < WIN_SHOTS
  if (shots < WIN_SHOTS) {
    const ex = W * 0.5;
    const ey = H * 0.46;
    const scale = 0.55 - (shots / WIN_SHOTS) * 0.2; // gets smaller as health drops

    const bodyH = H * 0.22 * scale;
    const bodyW = W * 0.04 * scale;
    const headR = bodyW * 0.8;

    // Body
    ctx.fillStyle = '#1a1a14';
    ctx.fillRect(Math.round(ex - bodyW / 2), Math.round(ey - bodyH), Math.round(bodyW), Math.round(bodyH));

    // Head
    ctx.beginPath();
    ctx.arc(Math.round(ex), Math.round(ey - bodyH - headR * 0.6), Math.round(headR), 0, Math.PI * 2);
    ctx.fillStyle = '#181812';
    ctx.fill();
  }
}

function drawScanLine(W, H) {
  // Vertical scan line sweep — N64 era CRT feel
  scanLineY = (scanLineY + 1.5) % H;
  const grad = ctx.createLinearGradient(0, scanLineY - 8, 0, scanLineY + 8);
  grad.addColorStop(0, 'rgba(200, 168, 64, 0)');
  grad.addColorStop(0.5, 'rgba(200, 168, 64, 0.08)');
  grad.addColorStop(1, 'rgba(200, 168, 64, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, scanLineY - 8, W, 16);
}

function drawCrosshair(W, H) {
  // Drift the crosshair slightly
  const t = performance.now() / 1000;
  crosshairX = W * 0.5 + Math.sin(t * 0.7) * W * 0.05;
  crosshairY = H * 0.48 + Math.cos(t * 0.5) * H * 0.04;

  const r = Math.min(W, H) * 0.06;
  const gap = r * 0.25;
  const lineLen = r * 0.55;

  ctx.strokeStyle = '#c8a840';
  ctx.shadowColor = '#c8a840';
  ctx.shadowBlur = 6;
  ctx.lineWidth = 1.5;

  // Circle
  ctx.beginPath();
  ctx.arc(crosshairX, crosshairY, r, 0, Math.PI * 2);
  ctx.stroke();

  // Cross hairs
  const cx = crosshairX, cy = crosshairY;
  ctx.beginPath();
  ctx.moveTo(cx - r - lineLen, cy); ctx.lineTo(cx - r - gap, cy);
  ctx.moveTo(cx + r + gap, cy);     ctx.lineTo(cx + r + lineLen, cy);
  ctx.moveTo(cx, cy - r - lineLen); ctx.lineTo(cx, cy - r - gap);
  ctx.moveTo(cx, cy + r + gap);     ctx.lineTo(cx, cy + r + lineLen);
  ctx.stroke();

  ctx.shadowBlur = 0;
}

function drawFlashes() {
  for (let i = flashes.length - 1; i >= 0; i--) {
    const f = flashes[i];
    f.life -= 0.08;
    if (f.life <= 0) { flashes.splice(i, 1); continue; }

    ctx.globalAlpha = f.life;
    const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * (2 - f.life));
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, '#ffffaa');
    grad.addColorStop(1, 'rgba(200, 168, 64, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r * (2 - f.life), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawHUD(W, H) {
  const pct = shots / WIN_SHOTS;
  const barW = Math.round(W * 0.18);
  const barH = 8;
  const bx = Math.round(W * 0.02);
  const by = 14;

  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#c8a840';
  ctx.shadowColor = '#c8a840';
  ctx.shadowBlur = 4;
  ctx.fillText(`SHOTS ${shots}/${WIN_SHOTS}`, bx, by);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#181410';
  ctx.fillRect(bx, by + 5, barW, barH);
  ctx.fillStyle = '#c8a840';
  ctx.fillRect(bx, by + 5, Math.round(barW * pct), barH);
  ctx.strokeStyle = '#5a4a10';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx + 0.5, by + 5.5, barW - 1, barH - 1);
}

function render() {
  if (!active) return;
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  drawCorridor(W, H);
  drawScanLine(W, H);
  drawFlashes();
  drawCrosshair(W, H);
  drawHUD(W, H);

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
  shots++;
  flashes.push({
    x: crosshairX + (Math.random() - 0.5) * 20,
    y: crosshairY + (Math.random() - 0.5) * 20,
    r: Math.min(canvas.width, canvas.height) * 0.04,
    life: 1,
  });
}

export function miss() {
  // Near-miss flash — off center
  if (!active) return;
  const W = canvas.width, H = canvas.height;
  flashes.push({
    x: W * 0.5 + (Math.random() - 0.5) * W * 0.2,
    y: H * 0.6 + (Math.random() - 0.5) * H * 0.1,
    r: Math.min(W, H) * 0.02,
    life: 0.5,
  });
}

export function patternComplete() {
  return shots >= WIN_SHOTS;
}

export function victory() {
  // Big flash
  if (!active) return;
  const W = canvas.width, H = canvas.height;
  for (let i = 0; i < 5; i++) {
    flashes.push({
      x: W * 0.5 + (Math.random() - 0.5) * W * 0.3,
      y: H * 0.4 + (Math.random() - 0.5) * H * 0.2,
      r: Math.min(W, H) * 0.08,
      life: 1,
    });
  }
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
