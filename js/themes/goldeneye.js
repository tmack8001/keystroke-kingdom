// GoldenEye 007 — Rare, 1997 — Level 17
// First-person facility corridor built from true perspective-projected wall
// polygons (flat-shaded panels converging to a vanishing point). Each keystroke
// advances the camera one segment down the hall — simple N64-era 3D dolly motion.

let canvas, ctx, animId;
let active = false;
let shots = 0;
let flashes = [];
let crosshairX, crosshairY;
let scanLineY = 0;
let camZ = 0;       // camera depth position — advances with keystrokes
let camBob = 0;
let dollyKick = 0;  // brief forward-lurch animation on keystroke
const WIN_SHOTS = 25;
const SEGMENT_SPACING = 1; // one "room segment" per keystroke, purely visual

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  shots = 0;
  flashes = [];
  crosshairX = canvas.width  * 0.5;
  crosshairY = canvas.height * 0.48;
  scanLineY  = 0;
  camZ = 0;
  camBob = 0;
  dollyKick = 0;
}

// ─── Perspective projection helpers ────────────────────────────────────────
// A point in "hall space" (lateral u in [-1,1], vertical v in [-1,1], depth d>0)
// projects to screen space using a simple pinhole camera — the textbook
// early-3D technique, distinct from Act 3's flat parallax layers.

function project(u, v, d, W, H, vp) {
  const scale = 1 / (d + 0.001);
  return {
    x: vp.x + u * W * 0.5 * scale,
    y: vp.y + v * H * 0.5 * scale,
    scale,
  };
}

function drawCorridor(W, H) {
  const vp = { x: W / 2, y: H * 0.42 + Math.sin(camBob) * 3 };

  // Background wash
  ctx.fillStyle = '#060605';
  ctx.fillRect(0, 0, W, H);

  // Distance fog toward vanishing point (early-3D titles faked depth cueing
  // with a flat fog color rather than real atmospheric scattering)
  const fog = ctx.createRadialGradient(vp.x, vp.y, 0, vp.x, vp.y, Math.max(W, H) * 0.5);
  fog.addColorStop(0, 'rgba(60, 56, 40, 0.5)');
  fog.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = fog;
  ctx.fillRect(0, 0, W, H);

  // Repeating wall segments receding into the distance — each is a flat-shaded
  // trapezoid polygon (left wall, right wall, floor, ceiling), the panel look
  // of an N64 corridor built from a handful of textured quads.
  const segCount = 7;
  const segDepthStep = 1;
  const camOffset = camZ % segDepthStep;

  for (let s = segCount; s >= 0; s--) {
    const dNear = 0.35 + s * segDepthStep - camOffset;
    const dFar  = dNear + segDepthStep;
    if (dNear <= 0.05) continue;

    drawSegment(W, H, vp, dNear, dFar, s);
  }

  // Ceiling light pools — radial glow at each segment plane
  for (let s = 0; s <= segCount; s++) {
    const d = 0.6 + s * segDepthStep - camOffset;
    if (d <= 0.1) continue;
    const top = project(0, -1, d, W, H, vp);
    const r = Math.max(4, 60 * top.scale);
    const grad = ctx.createRadialGradient(top.x, top.y + r * 0.4, 0, top.x, top.y + r * 0.4, r);
    grad.addColorStop(0, `rgba(210, 190, 110, ${0.22 * Math.min(1, top.scale * 1.4)})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(top.x - r, top.y - r * 0.2, r * 2, r * 1.4);

    ctx.fillStyle = '#d8c070';
    const lw = Math.max(1, 18 * top.scale);
    ctx.fillRect(Math.round(top.x - lw / 2), Math.round(top.y - 1), Math.round(lw), 2);
  }

  // Enemy silhouette — positioned in true depth space, scales with perspective
  if (shots < WIN_SHOTS) {
    const enemyD = 1.6 - (shots / WIN_SHOTS) * 1.1;
    if (enemyD > 0.15) {
      const feet = project(0, 0.35, enemyD, W, H, vp);
      const head = project(0, -0.15, enemyD, W, H, vp);
      const bodyW = 34 * feet.scale;
      const bodyH = feet.y - head.y;
      const headR = bodyW * 0.42;

      ctx.fillStyle = '#141410';
      ctx.fillRect(Math.round(feet.x - bodyW / 2), Math.round(head.y), Math.round(bodyW), Math.round(bodyH));
      ctx.beginPath();
      ctx.arc(Math.round(feet.x), Math.round(head.y - headR * 0.6), Math.round(headR), 0, Math.PI * 2);
      ctx.fillStyle = '#121210';
      ctx.fill();
    }
  }
}

function drawSegment(W, H, vp, dNear, dFar, index) {
  const alpha = Math.min(1, 0.5 / dNear);
  const shade = index % 2 === 0 ? 1 : 0.82; // alternating flat-shaded bands down the hall

  // Left wall quad (u: -1..-1, v: -1..1) at dNear -> dFar
  const wallTint = `rgba(${Math.round(70 * shade)}, ${Math.round(66 * shade)}, ${Math.round(56 * shade)}, ${alpha})`;
  drawQuad(W, H, vp,
    [-1, -1, dNear], [-1, 1, dNear], [-1, 1, dFar], [-1, -1, dFar],
    wallTint);

  // Right wall
  drawQuad(W, H, vp,
    [1, -1, dNear], [1, 1, dNear], [1, 1, dFar], [1, -1, dFar],
    wallTint);

  // Floor
  const floorTint = `rgba(${Math.round(30 * shade)}, ${Math.round(28 * shade)}, ${Math.round(24 * shade)}, ${alpha})`;
  drawQuad(W, H, vp,
    [-1, 1, dNear], [1, 1, dNear], [1, 1, dFar], [-1, 1, dFar],
    floorTint);

  // Ceiling
  const ceilTint = `rgba(${Math.round(22 * shade)}, ${Math.round(20 * shade)}, ${Math.round(18 * shade)}, ${alpha})`;
  drawQuad(W, H, vp,
    [-1, -1, dNear], [1, -1, dNear], [1, -1, dFar], [-1, -1, dFar],
    ceilTint);

  // Panel seam line at the near edge — reinforces the "segmented corridor" read
  const a = project(-1, -1, dNear, W, H, vp);
  const b = project(-1, 1, dNear, W, H, vp);
  const c = project(1, 1, dNear, W, H, vp);
  const d = project(1, -1, dNear, W, H, vp);
  ctx.strokeStyle = `rgba(90, 84, 60, ${alpha * 0.5})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y);
  ctx.stroke();
}

function drawQuad(W, H, vp, p1, p2, p3, p4, fillStyle) {
  const a = project(p1[0], p1[1], p1[2], W, H, vp);
  const b = project(p2[0], p2[1], p2[2], W, H, vp);
  const c = project(p3[0], p3[1], p3[2], W, H, vp);
  const d = project(p4[0], p4[1], p4[2], W, H, vp);
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y);
  ctx.closePath();
  ctx.fill();
}

function drawScanLine(W, H) {
  scanLineY = (scanLineY + 1.5) % H;
  const grad = ctx.createLinearGradient(0, scanLineY - 8, 0, scanLineY + 8);
  grad.addColorStop(0, 'rgba(200, 168, 64, 0)');
  grad.addColorStop(0.5, 'rgba(200, 168, 64, 0.08)');
  grad.addColorStop(1, 'rgba(200, 168, 64, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, scanLineY - 8, W, 16);
}

function drawCrosshair(W, H) {
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

  ctx.beginPath();
  ctx.arc(crosshairX, crosshairY, r, 0, Math.PI * 2);
  ctx.stroke();

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

  camBob += 0.02;
  if (dollyKick > 0) dollyKick -= 0.05;
  camZ += 0.0015 + Math.max(0, dollyKick) * 0.03; // slow ambient drift + kick from keystrokes

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
  dollyKick = 1; // camera lurches forward down the corridor — 3D motion cue
  flashes.push({
    x: crosshairX + (Math.random() - 0.5) * 20,
    y: crosshairY + (Math.random() - 0.5) * 20,
    r: Math.min(canvas.width, canvas.height) * 0.04,
    life: 1,
  });
}

export function miss() {
  // Near-miss flash — off center, gentle, no penalty imagery
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
