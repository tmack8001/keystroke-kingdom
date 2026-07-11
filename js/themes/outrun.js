// Level 21: Out Run (Sega, 1986)
// Pseudo-3D coastal road at sunset — gradient sky, low sun, palm silhouettes,
// converging road with dashed centerline, red car low-center. Coast, never crash.

let canvas, ctx;
let animId = null, active = false, victoryMode = false;
let frame = 0, W = 0, H = 0;

let distance = 0;
let speed = 2.0;          // current forward speed (affects dash/palm scroll rate)
const BASE_SPEED = 2.0;
const BOOST_SPEED = 7.5;
let speedTimer = 0;       // frames remaining of boost from a keystroke
let coastTimer = 0;       // frames easing back down after a miss (never a crash)
let dashOffset = 0;
let palmOffset = 0;
let carBob = 0;
let carWobble = 0;        // gentle side lean, purely cosmetic
let flashTimer = 0;       // sun flash on victory

const WIN_DISTANCE = 30;  // keystrokes to reach the goal

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  W = canvas.width; H = canvas.height;
}

function horizonY() { return Math.floor(H * 0.42); }
function roadBottomY() { return Math.floor(H * 0.84); }

// ─── Draw helpers ──────────────────────────────────────────────────────────────

function drawSky() {
  const HY = horizonY();
  const sky = ctx.createLinearGradient(0, 0, 0, HY);
  sky.addColorStop(0, '#2b1055');
  sky.addColorStop(0.35, '#7a2f6e');
  sky.addColorStop(0.62, '#ff5aa0');
  sky.addColorStop(0.82, '#ff9a4a');
  sky.addColorStop(1, '#ffd166');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, HY);

  // Low sun
  const sunR = Math.max(28, W * 0.055);
  const sunX = W * 0.5;
  const sunY = HY * 0.78;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, HY);
  ctx.clip();
  const glow = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 2.2);
  glow.addColorStop(0, 'rgba(255,255,200,0.55)');
  glow.addColorStop(1, 'rgba(255,255,200,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(sunX - sunR * 2.2, sunY - sunR * 2.2, sunR * 4.4, sunR * 4.4);

  ctx.fillStyle = flashTimer > 0 ? '#ffffff' : '#fff2b0';
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
  // Sunset stripe bands across the sun (retro sun-bar look)
  ctx.fillStyle = 'rgba(255,90,160,0.5)';
  for (let i = 0; i < 4; i++) {
    const by = sunY - sunR * 0.6 + i * (sunR * 0.4);
    ctx.fillRect(sunX - sunR, by, sunR * 2, sunR * 0.12);
  }
  ctx.restore();

  // Distant water/ocean band silhouette
  ctx.fillStyle = 'rgba(40,20,60,0.55)';
  ctx.fillRect(0, HY * 0.9, W, HY * 0.1);
}

function drawPalms(GY) {
  const HY = horizonY();
  const n = 6;
  for (let i = 0; i < n; i++) {
    // Palms scroll toward viewer, alternating sides, looping
    const t = ((i / n) + palmOffset) % 1;
    const scale = 0.15 + t * t * 1.4;
    const side = i % 2 === 0 ? -1 : 1;
    const px = W / 2 + side * (W * 0.42 + t * W * 0.5);
    const py = HY + t * (GY - HY) * 0.55;
    if (px < -80 || px > W + 80) continue;

    const trunkH = 34 * scale;
    const trunkW = Math.max(2, 5 * scale);
    ctx.fillStyle = '#1a0f2e';
    ctx.fillRect(px - trunkW / 2, py - trunkH, trunkW, trunkH);
    // Fronds
    ctx.save();
    ctx.translate(px, py - trunkH);
    for (let f = 0; f < 5; f++) {
      const ang = (-0.9 + f * 0.45) + Math.sin(frame * 0.01 + i) * 0.03;
      ctx.save();
      ctx.rotate(ang);
      ctx.fillStyle = '#1a0f2e';
      ctx.fillRect(0, -3 * scale, 22 * scale, 6 * scale);
      ctx.restore();
    }
    ctx.restore();
  }
}

function drawRoad() {
  const HY = horizonY();
  const GY = roadBottomY();
  const cx = W / 2;
  const roadTopW = Math.max(2, W * 0.012);
  const roadBotW = W * 0.92;

  // Grass either side (two-tone bands, alternating for a subtle sense of motion)
  const bandOn = Math.floor(frame * 0.05) % 2 === 0;
  ctx.fillStyle = bandOn ? '#2f8f4e' : '#278041';
  ctx.beginPath();
  ctx.moveTo(0, HY);
  ctx.lineTo(cx - roadTopW / 2, HY);
  ctx.lineTo(cx - roadBotW / 2, GY);
  ctx.lineTo(0, GY);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(W, HY);
  ctx.lineTo(cx + roadTopW / 2, HY);
  ctx.lineTo(cx + roadBotW / 2, GY);
  ctx.lineTo(W, GY);
  ctx.closePath();
  ctx.fill();

  drawPalms(GY);

  // Road surface (dark asphalt trapezoid)
  ctx.fillStyle = '#332038';
  ctx.beginPath();
  ctx.moveTo(cx - roadTopW / 2, HY);
  ctx.lineTo(cx + roadTopW / 2, HY);
  ctx.lineTo(cx + roadBotW / 2, GY);
  ctx.lineTo(cx - roadBotW / 2, GY);
  ctx.closePath();
  ctx.fill();

  // Road edge stripes (red/white rumble strip, widening toward viewer)
  const stripeCount = 10;
  for (let i = 0; i < stripeCount; i++) {
    const t0 = (i / stripeCount + dashOffset) % 1;
    const t1 = ((i + 0.5) / stripeCount + dashOffset) % 1;
    if (t1 < t0) continue;
    const y0 = HY + t0 * (GY - HY);
    const y1 = HY + t1 * (GY - HY);
    const wTop0 = roadTopW + t0 * (roadBotW - roadTopW);
    const wTop1 = roadTopW + t1 * (roadBotW - roadTopW);
    const edgeW0 = Math.max(1, wTop0 * 0.02);
    const edgeW1 = Math.max(2, wTop1 * 0.02);
    const col = Math.floor((t0 + frame * 0.02) * 6) % 2 === 0 ? '#ff3b3b' : '#f4f4f4';
    ctx.fillStyle = col;
    // Left edge
    ctx.beginPath();
    ctx.moveTo(cx - wTop0 / 2, y0);
    ctx.lineTo(cx - wTop0 / 2 + edgeW0, y0);
    ctx.lineTo(cx - wTop1 / 2 + edgeW1, y1);
    ctx.lineTo(cx - wTop1 / 2, y1);
    ctx.closePath();
    ctx.fill();
    // Right edge
    ctx.beginPath();
    ctx.moveTo(cx + wTop0 / 2, y0);
    ctx.lineTo(cx + wTop0 / 2 - edgeW0, y0);
    ctx.lineTo(cx + wTop1 / 2 - edgeW1, y1);
    ctx.lineTo(cx + wTop1 / 2, y1);
    ctx.closePath();
    ctx.fill();
  }

  // Dashed centerline, converging + scrolling toward viewer
  ctx.fillStyle = '#ffe89a';
  const dashCount = 8;
  for (let i = 0; i < dashCount; i++) {
    const t0 = (i / dashCount + dashOffset) % 1;
    const t1 = t0 + 0.045;
    if (t1 > 1) continue;
    const y0 = HY + t0 * (GY - HY);
    const y1 = HY + t1 * (GY - HY);
    const w0 = Math.max(1, (roadTopW + t0 * (roadBotW - roadTopW)) * 0.02);
    const w1 = Math.max(2, (roadTopW + t1 * (roadBotW - roadTopW)) * 0.02);
    ctx.beginPath();
    ctx.moveTo(cx - w0 / 2, y0);
    ctx.lineTo(cx + w0 / 2, y0);
    ctx.lineTo(cx + w1 / 2, y1);
    ctx.lineTo(cx - w1 / 2, y1);
    ctx.closePath();
    ctx.fill();
  }
}

// Car sprite: 11x6 blocky, red convertible, drawn low-center
const CAR_BODY = [
  [0,0,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,0],
  [1,1,2,2,1,1,2,2,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1],
  [0,1,0,0,0,0,0,0,0,1,0],
  [0,3,0,0,0,0,0,0,0,3,0],
];

function drawCar() {
  const GY = roadBottomY();
  const scale = Math.max(6, W * 0.011);
  const cw = 11 * scale, ch = 6 * scale;
  const bob = Math.sin(frame * 0.25) * (speed > BASE_SPEED + 1 ? 1.5 : 0.6);
  const cx = W / 2 - cw / 2 + carWobble;
  const cy = GY - ch + 4 + bob;

  // Soft shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(cx + cw / 2, GY + 2, cw * 0.48, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  CAR_BODY.forEach((row, r) => row.forEach((v, c) => {
    if (!v) return;
    ctx.fillStyle = v === 1 ? '#e3241f' : v === 2 ? '#ffe89a' : '#161616';
    ctx.fillRect(Math.round(cx + c * scale), Math.round(cy + r * scale), scale, scale);
  }));

  // Headlight glow trail when boosting
  if (speed > BASE_SPEED + 1.5) {
    ctx.fillStyle = 'rgba(255,220,140,0.35)';
    ctx.fillRect(cx + scale, cy - scale * 3, cw - scale * 2, scale * 2.5);
  }
}

function drawHUD() {
  ctx.fillStyle = '#ffe89a';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.shadowColor = '#ff5aa0';
  ctx.shadowBlur = 6;
  ctx.fillText(`DISTANCE ${Math.min(distance, WIN_DISTANCE)}/${WIN_DISTANCE}`, 14, 22);
  ctx.shadowBlur = 0;
}

function drawVictoryBanner() {
  const y = H * 0.3;
  const rows = 3, cols = 16;
  const cw = Math.min(24, W / cols);
  const totalW = cw * cols;
  const startX = W / 2 - totalW / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const on = (r + c) % 2 === 0;
      ctx.fillStyle = on ? '#ffffff' : '#161616';
      ctx.fillRect(startX + c * cw, y + r * cw * 0.6, cw, cw * 0.6);
    }
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

function updateMotion() {
  if (speedTimer > 0) {
    speedTimer--;
    speed += (BOOST_SPEED - speed) * 0.25;
  } else if (coastTimer > 0) {
    coastTimer--;
    speed += (BASE_SPEED * 0.6 - speed) * 0.06;
  } else {
    speed += (BASE_SPEED - speed) * 0.05;
  }
  speed = Math.max(0.8, speed);

  dashOffset = (dashOffset + speed * 0.012) % 1;
  palmOffset = (palmOffset + speed * 0.006) % 1;
  carWobble *= 0.9;
}

// ─── Render loop ─────────────────────────────────────────────────────────────

function render() {
  if (!active) return;
  frame++;
  ctx.clearRect(0, 0, W, H);

  drawSky();
  drawRoad();
  drawCar();
  drawHUD();
  if (victoryMode) drawVictoryBanner();
  updateMotion();

  if (flashTimer > 0) {
    flashTimer--;
    ctx.fillStyle = `rgba(255,255,255,${flashTimer / 30 * 0.4})`;
    ctx.fillRect(0, 0, W, H);
  }

  animId = requestAnimationFrame(render);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function start() {
  getCanvas(); resize();
  active = true; victoryMode = false; frame = 0;
  distance = 0; speed = BASE_SPEED; speedTimer = 0; coastTimer = 0;
  dashOffset = 0; palmOffset = 0; carBob = 0; carWobble = 0; flashTimer = 0;
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function keystroke() {
  if (!active || victoryMode) return;
  distance = Math.min(WIN_DISTANCE, distance + 1);
  speedTimer = 14;
  coastTimer = 0;
  carWobble = (Math.random() - 0.5) * 3;
}

export function miss() {
  // Never a crash or spin — just an easy coast, speed gently eases off.
  if (!active || victoryMode) return;
  speedTimer = 0;
  coastTimer = 40;
}

export function patternComplete() {
  return distance >= WIN_DISTANCE;
}

export function victory() {
  victoryMode = true;
  speedTimer = 9999;
  flashTimer = 30;
}

window.addEventListener('resize', () => { if (active) resize(); });
