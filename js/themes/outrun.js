// Level 21: Out Run (Sega, 1986) — the definitive "Super Scaler" pseudo-3D road racer.
// A rushing coastal road at sunset: alternating light/dark asphalt bands sweep toward
// the camera, palms and roadside signs scale up and blow past, gentle S-curves drift
// the horizon, and the red convertible weaves with the road. The world is always
// driving (attract-mode ambience, allowed unattended); only stage PROGRESS is
// keystroke-gated. Coast, never crash. Era: brighter 16-color per act5.md.

import { getWinRatio } from '../settings.js';

let canvas, ctx;
let animId = null, active = false, victoryMode = false;
let frame = 0, W = 0, H = 0;

// ─── Driving state ──────────────────────────────────────────────────────────
let roadZ = 0;            // accumulated forward travel — drives the whole scroll
let speed = 0;            // current forward speed (world units/frame)
const BASE_SPEED = 0.9;   // ambient cruising speed (road always rushes at this)
const BOOST_SPEED = 2.4;  // surge speed right after a correct keystroke
let speedTimer = 0;       // frames remaining of keystroke boost
let coastTimer = 0;       // frames easing down after a miss (never a crash)

let curve = 0;            // current road curvature (drifts the horizon center)
let curvePhase = 0;       // slow oscillator for gentle S-curves
let steer = 0;            // car's lateral lean, follows the curve
let carBobPhase = 0;

// Speed-surge cosmetics
let speedLines = 0;       // frames of wind speed-lines remaining
let exhaust = [];         // bounded exhaust-puff pool
const MAX_EXHAUST = 24;
let checkpointFlash = 0;  // frames of a "checkpoint passed" banner glow
let rival = null;         // an overtaking car on a sequence-complete beat

// Victory
let victoryFlash = 0;
let victoryBannerT = 0;
let sunPop = 0;

// ─── Win gate (separate from any display counter) ──────────────────────────
const BASE_SEQUENCES = 6;   // sequences (words) to reach the finish
let winSequences = 6;       // scaled by EXPERIENCE ratio, resolved in start()
let sequencesCompleted = 0; // cumulative — monotonic, only moves toward the win

// Roadside object pool (looping strip of palms & signs at fixed Z spacing)
const ROADSIDE_COUNT = 14;
let roadside = [];

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
function roadBottomY() { return Math.floor(H * 0.86); }

function initRoadside() {
  roadside = [];
  for (let i = 0; i < ROADSIDE_COUNT; i++) {
    roadside.push({
      z: i * (ROAD_SEG * 2),          // even spacing down the road
      side: i % 2 === 0 ? -1 : 1,     // left / right of the road
      kind: i % 3 === 0 ? 'sign' : 'palm',
    });
  }
}

const ROAD_SEG = 1.0; // world length of one light/dark band pair

// ─── Perspective projection ─────────────────────────────────────────────────
// A point at road-depth `d` (0 = at the camera, 1 = at the horizon) projects to a
// screen Y between roadBottom and horizon, and the road half-width shrinks toward
// the horizon. `lateral` is the horizon curve offset applied stronger near the top.
function project(d) {
  const HY = horizonY();
  const GY = roadBottomY();
  // Perspective: near the camera (d~0) things are spread out; compress toward horizon.
  const persp = d;                       // 0..1 already perspective-friendly for bands via depthAt()
  const y = GY - persp * (GY - HY);
  const halfW = (W * 0.46) * (1 - persp) + (W * 0.006) * persp;
  // Curve pushes the road center sideways, more strongly toward the horizon.
  const cx = W / 2 + curve * (persp * persp) * (W * 0.5);
  const scale = (1 - persp);             // 1 near, ~0 at horizon
  return { y, halfW, cx, scale };
}

// Map an evenly-Z-spaced world position to a perspective depth 0..1 so that bands
// bunch up realistically toward the horizon (classic super-scaler foreshortening).
function depthAt(worldFrac) {
  // worldFrac 0 (near) .. 1 (far). Non-linear so near bands are tall, far bands thin.
  return 1 - 1 / (1 + worldFrac * 6);
}

// ─── Sky ────────────────────────────────────────────────────────────────────
function drawSky() {
  const HY = horizonY();
  const sky = ctx.createLinearGradient(0, 0, 0, HY);
  sky.addColorStop(0, '#2b1055');
  sky.addColorStop(0.32, '#7a2f6e');
  sky.addColorStop(0.60, '#ff5aa0');
  sky.addColorStop(0.82, '#ff9a4a');
  sky.addColorStop(1, '#ffd166');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, HY);

  // Low sun — sits above where the road converges, shimmering.
  const sunR = Math.max(30, W * 0.058) * (1 + sunPop * 0.15);
  const sunX = W * 0.5 + curve * W * 0.14;
  const sunY = HY * 0.74;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, HY);
  ctx.clip();

  const glow = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 2.4);
  glow.addColorStop(0, 'rgba(255,255,200,0.55)');
  glow.addColorStop(1, 'rgba(255,255,200,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(sunX - sunR * 2.4, sunY - sunR * 2.4, sunR * 4.8, sunR * 4.8);

  ctx.fillStyle = victoryFlash > 0 ? '#ffffff' : '#fff2b0';
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();

  // Animated sun-bar stripes (retro sunset). Bars scroll slowly for shimmer.
  ctx.fillStyle = 'rgba(120,30,80,0.6)';
  const barShift = (frame * 0.4) % (sunR * 0.4);
  for (let i = 0; i < 5; i++) {
    const by = sunY - sunR * 0.5 + i * (sunR * 0.4) + barShift * 0.0;
    const bh = sunR * (0.06 + 0.04 * i / 5);
    ctx.fillRect(sunX - sunR, by + Math.sin(frame * 0.03 + i) * 1.5, sunR * 2, bh);
  }
  ctx.restore();

  // Distant water shimmer band under the horizon.
  ctx.fillStyle = 'rgba(40,20,60,0.5)';
  ctx.fillRect(0, HY - 3, W, 6);
}

// ─── Road ─────────────────────────────────────────────────────────────────
// Draw the road as a stack of horizontal bands from horizon downward. Each band's
// light/dark colour is chosen by (worldFrac + roadZ) so the pattern visibly RUSHES
// toward the camera as roadZ grows. Grass bands scroll in lockstep.
function drawRoad() {
  const HY = horizonY();
  const GY = roadBottomY();
  const BANDS = 44;

  let prev = null;
  for (let i = 0; i <= BANDS; i++) {
    // i=0 far (horizon), i=BANDS near (bottom). Convert to a world fraction that
    // scrolls with roadZ so bands march toward the viewer.
    const farToNear = i / BANDS;                    // 0 far .. 1 near
    const worldFrac = 1 - farToNear;                // 1 far .. 0 near
    const d = depthAt(worldFrac);                   // perspective depth 0(near)..~1(far)
    const persp = 1 - d;                            // 1 near .. 0 far, for our project()
    const proj = project(persp);
    const cur = { y: proj.y, cx: proj.cx, halfW: proj.halfW };

    // Scroll phase: which asphalt band are we on? roadZ marches this toward us.
    const bandPhase = Math.floor((worldFrac * 10 + roadZ) % 2 + 2) % 2;

    if (prev) {
      // Grass (fills sides). Alternating green shades scroll too.
      const grassDark = bandPhase === 0;
      ctx.fillStyle = grassDark ? '#1f7a3c' : '#2f9a50';
      ctx.fillRect(0, cur.y, W, prev.y - cur.y + 1);

      // Road trapezoid slice between prev (nearer) and cur (farther).
      ctx.fillStyle = bandPhase === 0 ? '#3a2440' : '#48304f';
      ctx.beginPath();
      ctx.moveTo(cur.cx - cur.halfW, cur.y);
      ctx.lineTo(cur.cx + cur.halfW, cur.y);
      ctx.lineTo(prev.cx + prev.halfW, prev.y);
      ctx.lineTo(prev.cx - prev.halfW, prev.y);
      ctx.closePath();
      ctx.fill();

      // Rumble strips (red/white) on both edges.
      const rumbleOn = bandPhase === 0;
      const rw = Math.max(2, cur.halfW * 0.10);
      const rwP = Math.max(2, prev.halfW * 0.10);
      ctx.fillStyle = rumbleOn ? '#ff3b3b' : '#f4f4f4';
      // left
      ctx.beginPath();
      ctx.moveTo(cur.cx - cur.halfW, cur.y);
      ctx.lineTo(cur.cx - cur.halfW + rw, cur.y);
      ctx.lineTo(prev.cx - prev.halfW + rwP, prev.y);
      ctx.lineTo(prev.cx - prev.halfW, prev.y);
      ctx.closePath();
      ctx.fill();
      // right
      ctx.beginPath();
      ctx.moveTo(cur.cx + cur.halfW, cur.y);
      ctx.lineTo(cur.cx + cur.halfW - rw, cur.y);
      ctx.lineTo(prev.cx + prev.halfW - rwP, prev.y);
      ctx.lineTo(prev.cx + prev.halfW, prev.y);
      ctx.closePath();
      ctx.fill();

      // Centerline dashes — only on the "on" band, so they visibly flow toward us.
      if (rumbleOn && cur.halfW > W * 0.02) {
        const dw = Math.max(1, cur.halfW * 0.03);
        const dwP = Math.max(2, prev.halfW * 0.03);
        ctx.fillStyle = '#ffe89a';
        ctx.beginPath();
        ctx.moveTo(cur.cx - dw, cur.y);
        ctx.lineTo(cur.cx + dw, cur.y);
        ctx.lineTo(prev.cx + dwP, prev.y);
        ctx.lineTo(prev.cx - dwP, prev.y);
        ctx.closePath();
        ctx.fill();
      }
    }
    prev = cur;
  }
}

// ─── Roadside palms & signs ─────────────────────────────────────────────────
function drawRoadside() {
  const GY = roadBottomY();
  // Sort far-to-near so nearer objects overdraw.
  const sorted = roadside.slice().sort((a, b) => localZ(b) - localZ(a));
  for (const o of sorted) {
    const lz = localZ(o);                 // 0 near .. large far
    if (lz < 0.02) continue;
    const worldFrac = Math.min(1, lz / (ROADSIDE_COUNT * ROAD_SEG * 2));
    const d = depthAt(worldFrac);
    const persp = 1 - d;
    if (persp < 0.02) continue;           // too far to see
    const proj = project(persp);
    const scale = Math.max(0.02, persp);
    const px = proj.cx + o.side * (proj.halfW + W * 0.05 * (1 + persp * 4));
    const py = proj.y;
    if (px < -120 || px > W + 120) continue;

    if (o.kind === 'palm') drawPalm(px, py, scale);
    else drawSign(px, py, scale, o.side);
  }
}

function localZ(o) {
  // Distance of this object ahead of the camera, wrapping as we drive past.
  const span = ROADSIDE_COUNT * ROAD_SEG * 2;
  return ((o.z - roadZ) % span + span) % span;
}

function drawPalm(px, py, scale) {
  const trunkH = 90 * scale;
  const trunkW = Math.max(2, 8 * scale);
  ctx.fillStyle = '#1a0f2e';
  ctx.fillRect(px - trunkW / 2, py - trunkH, trunkW, trunkH);
  ctx.save();
  ctx.translate(px, py - trunkH);
  const sway = Math.sin(frame * 0.02 + px * 0.01) * 0.06;
  for (let f = 0; f < 6; f++) {
    const ang = (-1.1 + f * 0.42) + sway;
    ctx.save();
    ctx.rotate(ang);
    ctx.fillStyle = '#160b26';
    ctx.fillRect(0, -3 * scale, 46 * scale, 7 * scale);
    ctx.restore();
  }
  ctx.restore();
}

function drawSign(px, py, scale, side) {
  const postH = 44 * scale;
  const postW = Math.max(2, 5 * scale);
  const boardW = 34 * scale, boardH = 20 * scale;
  ctx.fillStyle = '#2a1836';
  ctx.fillRect(px - postW / 2, py - postH, postW, postH);
  // Bright billboard face (era: brighter 16-color) facing the road.
  const bx = side < 0 ? px - boardW : px;
  ctx.fillStyle = '#ff6fae';
  ctx.fillRect(bx, py - postH - boardH, boardW, boardH);
  ctx.fillStyle = '#ffe89a';
  ctx.fillRect(bx + 3 * scale, py - postH - boardH + 3 * scale,
    boardW - 6 * scale, Math.max(2, 4 * scale));
}

// ─── The car ─────────────────────────────────────────────────────────────
// 13x7 blocky red convertible. Weaves with the curve, bobs with speed.
const CAR_BODY = [
  [0,0,0,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,2,2,1,1,1,2,2,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,3,0,1,1,1,1,1,1,1,0,3,0],
  [0,3,0,0,0,0,0,0,0,0,0,3,0],
];

function drawCar() {
  const GY = roadBottomY();
  const scale = Math.max(6, W * 0.012);
  const cols = CAR_BODY[0].length, rows = CAR_BODY.length;
  const cw = cols * scale, ch = rows * scale;
  const boost = speed > BASE_SPEED + 0.3;
  const bob = Math.sin(carBobPhase) * (boost ? 2.2 : 0.9);
  // Car sits low-center but leans/steers with the curve (weaves) + speed jitter.
  const lean = steer * W * 0.05;
  const cx = W / 2 - cw / 2 + lean;
  const cy = GY - ch + 6 + bob;

  // Exhaust puffs behind the car.
  for (const p of exhaust) {
    ctx.globalAlpha = Math.max(0, p.life / 24) * 0.6;
    ctx.fillStyle = p.c;
    ctx.fillRect(p.x, p.y, p.s, p.s);
  }
  ctx.globalAlpha = 1;

  // Soft shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(cx + cw / 2, GY + 3, cw * 0.5, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Speed-line wind streaks flanking the car during a surge.
  if (speedLines > 0) {
    ctx.strokeStyle = 'rgba(255,240,180,0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const sy = cy + (i / 6) * ch + ((frame * 8 + i * 40) % 60);
      const len = 30 + (i % 3) * 18;
      ctx.beginPath();
      ctx.moveTo(cx - 24, sy); ctx.lineTo(cx - 24 - len, sy); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + cw + 24, sy); ctx.lineTo(cx + cw + 24 + len, sy); ctx.stroke();
    }
  }

  CAR_BODY.forEach((row, r) => row.forEach((v, c) => {
    if (!v) return;
    ctx.fillStyle = v === 1 ? '#e3241f' : v === 2 ? '#ffe89a' : '#161616';
    ctx.fillRect(Math.round(cx + c * scale + lean * 0.0), Math.round(cy + r * scale), scale, scale);
  }));

  // Brake/tail glow when boosting.
  if (boost) {
    ctx.fillStyle = 'rgba(255,120,80,0.4)';
    ctx.fillRect(cx + scale, cy - scale * 2, cw - scale * 2, scale * 1.6);
  }
}

// ─── Rival overtaking car (sequence-complete beat) ───────────────────────────
function drawRival() {
  if (!rival) return;
  const GY = roadBottomY();
  const HY = horizonY();
  // Rival recedes ahead: t 0 (near, big) -> 1 (far, tiny) as we "pass" it.
  const t = rival.t;
  const persp = 1 - t;
  const proj = project(persp);
  const s = Math.max(3, (W * 0.012) * (0.4 + persp * 1.3));
  const cw = 11 * s, ch = 6 * s;
  const cx = proj.cx + rival.side * proj.halfW * 0.45 - cw / 2;
  const cy = proj.y - ch;
  ctx.fillStyle = rival.color;
  ctx.fillRect(cx, cy, cw, ch);
  ctx.fillStyle = '#161616';
  ctx.fillRect(cx + s, cy + ch, cw - 2 * s, s * 0.8);
}

// ─── HUD ─────────────────────────────────────────────────────────────────
function drawHUD() {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.fillStyle = '#ffe89a';
  ctx.shadowColor = '#ff5aa0';
  ctx.shadowBlur = 6;
  const stage = Math.min(sequencesCompleted, winSequences);
  ctx.fillText(`STAGE ${stage}/${winSequences}`, 14, 22);

  // Checkpoint flash banner (top band, out of the reserved center).
  if (checkpointFlash > 0) {
    ctx.textAlign = 'center';
    ctx.font = '14px "Press Start 2P", monospace';
    const a = Math.min(1, checkpointFlash / 40);
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.shadowColor = '#ffd166';
    ctx.shadowBlur = 14;
    ctx.fillText('CHECKPOINT', W / 2, H * 0.14);
  }
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
}

function drawVictoryBanner() {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const y = H * 0.16;
  ctx.font = '20px "Press Start 2P", monospace';
  const pulse = 0.6 + 0.4 * Math.sin(victoryBannerT * 0.2);
  ctx.fillStyle = `rgba(255,255,255,${pulse})`;
  ctx.shadowColor = '#ff5aa0';
  ctx.shadowBlur = 20;
  ctx.fillText('YOU MADE IT!', W / 2, y);
  ctx.font = '11px "Press Start 2P", monospace';
  ctx.fillStyle = '#ffe89a';
  ctx.fillText('FINISH LINE', W / 2, y + 30);
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Checkered finish banner sweeping across the top band.
  const rows = 2, cw = Math.max(14, W / 30);
  const cols = Math.ceil(W / cw);
  const shift = Math.floor(victoryBannerT * 0.5);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const on = (r + c + shift) % 2 === 0;
      ctx.fillStyle = on ? '#ffffff' : '#161616';
      ctx.fillRect(c * cw, H * 0.02 + r * cw * 0.5, cw, cw * 0.5);
    }
  }
}

// ─── Update ─────────────────────────────────────────────────────────────
function updateMotion() {
  // Speed: surge on keystroke, gentle coast on miss, else cruise.
  if (speedTimer > 0) {
    speedTimer--;
    speed += (BOOST_SPEED - speed) * 0.25;
  } else if (coastTimer > 0) {
    coastTimer--;
    speed += (BASE_SPEED * 0.55 - speed) * 0.06;
  } else {
    speed += (BASE_SPEED - speed) * 0.05;
  }
  if (victoryMode) speed += (BOOST_SPEED * 1.15 - speed) * 0.12;
  speed = Math.max(0.3, Math.min(speed, BOOST_SPEED * 1.3));

  roadZ += speed * 0.12;                 // the whole world marches forward
  if (roadZ > 1e6) roadZ = roadZ % (ROADSIDE_COUNT * ROAD_SEG * 2); // F1 clamp

  // Gentle S-curves. curvePhase advances with distance so bends feel driven.
  curvePhase += 0.006 + speed * 0.002;
  curve = Math.sin(curvePhase) * 0.55 + Math.sin(curvePhase * 0.37) * 0.25;
  curve = Math.max(-0.9, Math.min(0.9, curve));

  // Car weaves to follow the curve (reads as steering).
  steer += (curve - steer) * 0.08;
  carBobPhase += 0.22 + speed * 0.03;
  if (carBobPhase > 1e5) carBobPhase %= (Math.PI * 2);

  // Exhaust pool (bounded).
  for (let i = exhaust.length - 1; i >= 0; i--) {
    exhaust[i].x -= 1 + Math.random();
    exhaust[i].y += 0.5;
    exhaust[i].life--;
    if (exhaust[i].life <= 0) exhaust.splice(i, 1);
  }

  if (speedLines > 0) speedLines--;
  if (checkpointFlash > 0) checkpointFlash--;
  if (sunPop > 0) sunPop -= 0.05;
  if (victoryFlash > 0) victoryFlash--;
  if (victoryMode) victoryBannerT++;

  // Rival recedes as we overtake it, then despawns.
  if (rival) {
    rival.t += 0.02;
    if (rival.t >= 1) rival = null;
  }
}

function spawnExhaust() {
  const GY = roadBottomY();
  const s = Math.max(6, W * 0.012);
  for (let i = 0; i < 3; i++) {
    if (exhaust.length >= MAX_EXHAUST) break;
    exhaust.push({
      x: W / 2 + (Math.random() - 0.5) * 40 + steer * W * 0.05,
      y: GY - s + Math.random() * 6,
      s: 4 + Math.random() * 4,
      life: 18 + Math.random() * 6,
      c: Math.random() < 0.5 ? 'rgba(200,200,210,1)' : 'rgba(255,200,140,1)',
    });
  }
}

// ─── Render ─────────────────────────────────────────────────────────────
function render() {
  if (!active) return;
  frame++;
  ctx.clearRect(0, 0, W, H);

  drawSky();
  drawRoad();
  drawRoadside();
  drawRival();
  drawCar();
  drawHUD();
  if (victoryMode) drawVictoryBanner();
  updateMotion();

  if (victoryFlash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${victoryFlash / 30 * 0.4})`;
    ctx.fillRect(0, 0, W, H);
  }

  animId = requestAnimationFrame(render);
}

// ─── Public API ────────────────────────────────────────────────────────────
export function start() {
  getCanvas(); resize();
  active = true; victoryMode = false; frame = 0;
  roadZ = 0; speed = BASE_SPEED; speedTimer = 0; coastTimer = 0;
  curve = 0; curvePhase = 0; steer = 0; carBobPhase = 0;
  speedLines = 0; exhaust = []; checkpointFlash = 0; rival = null;
  victoryFlash = 0; victoryBannerT = 0; sunPop = 0;
  sequencesCompleted = 0;
  winSequences = Math.max(1, Math.round(BASE_SEQUENCES * getWinRatio()));
  initRoadside();
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function keystroke() {
  if (!active || victoryMode) return;
  speedTimer = 16;
  coastTimer = 0;
  speedLines = 12;
  spawnExhaust();
}

export function miss() {
  // Never a crash or spin — just an easy coast; speed gently eases off.
  if (!active || victoryMode) return;
  speedTimer = 0;
  coastTimer = 44;
}

export function patternComplete() {
  // One call per completed word/sequence. Cumulative gate (monotonic; once the
  // count reaches winSequences it stays won). A completed sequence is an
  // overtaking beat: rival car ahead + a checkpoint flash — pure celebration.
  if (active && !victoryMode) {
    sequencesCompleted++;
    checkpointFlash = 50;
    sunPop = 1;
    speedTimer = 24;
    rival = {
      t: 0.05,
      side: (sequencesCompleted % 2 === 0) ? -1 : 1,
      color: ['#3bc7ff', '#ffd166', '#8affc1', '#ff8ad0'][sequencesCompleted % 4],
    };
  }
  return sequencesCompleted >= winSequences;
}

export function victory() {
  victoryMode = true;
  victoryFlash = 30;
  victoryBannerT = 0;
  sunPop = 1;
  speedTimer = 9999;   // held; clamped in updateMotion via speed cap (no geometry uses it)
  rival = null;
  return 4200;         // ms — finish-line celebration hold (clamped 1200–6000 by engine)
}

window.addEventListener('resize', () => { if (active) resize(); });
