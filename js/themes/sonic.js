// Level 11: Sonic the Hedgehog (Sega Genesis, 1991)
// Green Hill Zone. The wiki's sourced core fact: Sonic "made speed itself the core
// design pillar" (Naka's curved-movement algorithm — fast but readable), with momentum
// built purely from terrain/slopes. So SPEED reads constantly: Sonic runs a curved hill
// path, multi-layer parallax streams past, a blur trail follows him. Typing kicks his
// speed up; a completed sequence fires a ROLLING SPIN ATTACK — he curls into a ball
// WHILE ALREADY MOVING and rolls down the slope with a momentum surge (era-correct for
// the 1991 original: the standstill Spin Dash charge did not arrive until Sonic 2, 1992
// — see research/wiki/games/sonic-the-hedgehog.md Gameplay). Victory: he screeches to a
// stop and strikes his signature finger-wag pose while the ring tally flourishes
// (~3.5s). No 9999 sentinel — a clamped timeline.

let canvas, ctx;
let animId = null, active = false;
let frame = 0, W = 0, H = 0;

// Run state
let ringsCollected = 0;
let rings = [];
let sonicX = 0;
const BASE_SPEED = 3.4;            // constant world velocity (px/frame of parallax)
let worldSpeed = BASE_SPEED;       // current velocity — decays back toward BASE_SPEED
let sonicBoost = 0;                // frames of keystroke speed-kick remaining (clamped)
let spinRoll = 0;                  // frames of rolling Spin Attack ball form remaining (clamped)
let rollSurge = 0;                 // extra momentum from a slope-roll (clamped, decays)
let sonicStumble = 0;              // frames of stumble animation remaining
let glows = [];                    // brief ring-collect flashes (bounded)
let sparkles = [];                 // ring-collect sparkle bursts (bounded)
let speedStreaks = [];             // motion-line streaks (bounded)
let clouds = [];                   // far-layer parallax clouds
let hillOffset = 0;                // master parallax scroll accumulator (always-on)

// Victory state
let victoryMode = false;
let victoryFrame = 0;
const VICTORY_MS = 3500;
const VICTORY_FRAMES = Math.round((VICTORY_MS / 1000) * 60); // ~210 frames @60fps
let tallyShown = 0;                // rings counted up on the victory board

const RINGS_TO_WIN = 20;
const PX = 7;  // pixel scale for Sonic sprite (11×13 grid → 77×91 px)
const SW = 11 * PX, SH = 13 * PX;

// Bounded pool caps
const MAX_STREAKS = 40, MAX_SPARKLES = 60, MAX_GLOWS = 12;

// ─── Sonic sprites (11×13, facing right) ────────────────────────────────────────
// 1=blue body, 2=peach muzzle, 3=red shoe, 4=white eye/sock, 5=tan buckle
const SONIC_RUN_A = [
  [0,0,0,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0],
  [0,1,1,0,1,1,1,0,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,0],
  [1,1,2,2,2,2,2,1,1,1,1],
  [1,1,2,4,2,2,4,2,1,1,0],
  [0,1,2,2,2,2,2,2,1,0,0],
  [0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,5,5,1,1,0,0,0],
  [0,1,1,1,1,1,1,1,1,0,0],
  [0,0,3,3,3,0,3,3,3,0,0],
  [0,3,3,4,3,0,3,4,3,3,0],
  [0,0,0,0,0,0,0,0,0,0,0],
];
const SONIC_RUN_B = [
  [0,0,0,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0],
  [0,1,1,0,1,1,1,0,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,0],
  [1,1,2,2,2,2,2,1,1,1,1],
  [1,1,2,4,2,2,4,2,1,1,0],
  [0,1,2,2,2,2,2,2,1,0,0],
  [0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,5,5,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0],
  [0,3,3,3,0,3,3,3,0,0,0],
  [3,3,4,3,0,3,4,3,3,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
];
const SONIC_STUMBLE = [
  [0,0,0,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0],
  [0,1,1,0,1,1,1,0,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,0],
  [1,1,2,2,2,2,2,1,1,1,1],
  [1,1,2,4,2,2,4,2,1,1,0],
  [0,1,2,2,2,2,2,2,1,0,0],
  [0,0,1,1,1,1,1,1,0,0,0],
  [0,1,1,1,5,5,1,1,1,0,0],
  [1,1,1,1,1,1,1,1,1,1,0],
  [0,0,3,3,3,3,3,3,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
];
// Victory pose — Sonic stopped, one arm raised, finger-wag (his signature "you're too slow")
// 4=white glove, others as above.
const SONIC_POSE = [
  [0,0,0,1,1,1,1,1,0,0,4],
  [0,0,1,1,1,1,1,1,1,0,4],
  [0,1,1,0,1,1,1,0,1,1,4],
  [0,1,1,1,1,1,1,1,1,4,4],
  [1,1,2,2,2,2,2,1,4,4,0],
  [1,1,2,4,2,2,4,2,1,1,0],
  [0,1,2,2,2,2,2,2,1,0,0],
  [0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,5,5,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,0,0,0],
  [0,0,3,3,0,0,3,3,0,0,0],
  [0,3,3,4,0,0,3,4,3,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
];
const SONIC_COLS = { 1: '#1a5fd0', 2: '#f4c088', 3: '#d81818', 4: '#ffffff', 5: '#e8c000' };

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  W = canvas.width; H = canvas.height;
  initClouds();
}

function initClouds() {
  clouds = [];
  for (let i = 0; i < 6; i++) {
    clouds.push({
      x: Math.random() * W,
      y: H * (0.04 + Math.random() * 0.18),
      w: 60 + Math.random() * 70,
    });
  }
}

// Ground strip sits at 70% height (bottom strip stage region — clear of prompt/keys)
function groundY() { return Math.floor(H * 0.70); }

// Sonic's curved hill path: he holds a fixed screen anchor horizontally (~14%) while
// the world streams past, but his Y rides a gentle rolling sine so his footing follows
// the terrain's curve — the "momentum feel" made visible without leaving the stage.
function sonicScreenX() { return W * 0.14; }
function terrainRoll(px) {
  // Signature rolling terrain: a slow long swell so the ground never reads flat.
  return Math.sin((px / (W * 0.55)) + hillOffset * 0.004) * (H * 0.018);
}

function spawnRing() {
  rings.push({
    x: W * 0.30 + Math.random() * W * 0.68,
    y: H * (0.10 + Math.random() * 0.48),  // 10%–58% of canvas height
    rot: Math.random() * Math.PI * 2,
    collected: false,
  });
}

function initRings() {
  rings = [];
  for (let i = 0; i < 8; i++) spawnRing();
}

// ─── Draw helpers ──────────────────────────────────────────────────────────────

function drawPx(shape, x, y, size, colOrMap) {
  const isMap = typeof colOrMap === 'object';
  shape.forEach((row, r) => row.forEach((c, cc) => {
    if (!c) return;
    ctx.fillStyle = isMap ? (colOrMap[c] || '#000') : colOrMap;
    ctx.fillRect(Math.round(x + cc * size), Math.round(y + r * size), size, size);
  }));
}

function drawClouds() {
  // Slow layer — drifts with the world so even the sky conveys velocity.
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  clouds.forEach(cl => {
    const cx = ((cl.x - hillOffset * 0.10) % (W + cl.w) + (W + cl.w)) % (W + cl.w) - cl.w * 0.5;
    ctx.beginPath();
    ctx.ellipse(cx, cl.y, cl.w * 0.5, cl.w * 0.22, 0, 0, Math.PI * 2);
    ctx.ellipse(cx - cl.w * 0.28, cl.y + cl.w * 0.06, cl.w * 0.3, cl.w * 0.16, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + cl.w * 0.3, cl.y + cl.w * 0.04, cl.w * 0.26, cl.w * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawLoop() {
  // Distant loop-de-loop silhouette — iconic Green Hill Zone landmark, far layer.
  const period = W * 1.4;
  const lx = W * 0.82 - ((hillOffset * 0.12) % period + period) % period;
  const ly = H * 0.42, r = H * 0.16;
  ctx.strokeStyle = 'rgba(20,90,30,0.55)';
  ctx.lineWidth = Math.max(6, r * 0.22);
  ctx.beginPath();
  ctx.arc(lx, ly, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawBackground() {
  const GY = groundY();

  // Sky — cobalt blue gradient, multi-stop for depth
  const sky = ctx.createLinearGradient(0, 0, 0, GY * 0.6);
  sky.addColorStop(0, '#0d3fa0');
  sky.addColorStop(0.5, '#2e78d8');
  sky.addColorStop(1, '#6cb0ee');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GY * 0.6);

  // Layer 1 (far, slowest): clouds + loop silhouette
  drawClouds();
  drawLoop();

  // Layer 2 (far hills, slow parallax): smooth rolling silhouette
  const hillTop = H * 0.32;
  ctx.fillStyle = '#2f8a3a';
  const period2 = W * 0.6;
  const hOff = ((hillOffset * 0.22) % period2 + period2) % period2;
  for (let i = -1; i < 4; i++) {
    const hx = i * period2 - hOff;
    const hw = 200, hh = 55;
    ctx.beginPath();
    ctx.moveTo(hx, hillTop + hh);
    for (let s = 0; s <= hw; s += 4) {
      const yOff = Math.sin((s / hw) * Math.PI) * hh;
      ctx.lineTo(hx + s, hillTop + hh - yOff);
    }
    ctx.lineTo(hx + hw, hillTop + hh);
    ctx.closePath();
    ctx.fill();
  }

  // Layer 3 (mid hills, checkerboard, medium parallax) — classic Green Hill band
  const midTop = H * 0.38, midBot = H * 0.55;
  const midGrad = ctx.createLinearGradient(0, midTop, 0, midBot);
  midGrad.addColorStop(0, '#5cd85c');
  midGrad.addColorStop(1, '#2fa03a');
  ctx.fillStyle = midGrad;
  ctx.fillRect(0, midTop, W, midBot - midTop);

  const tileW = 40, tileH = 24;
  ctx.fillStyle = 'rgba(30,120,40,0.55)';
  const offX = ((hillOffset * 0.55) % (tileW * 2) + tileW * 2) % (tileW * 2);
  for (let tx = -tileW * 2 + Math.floor(offX); tx < W + tileW; tx += tileW * 2) {
    for (let ty = Math.floor(midTop); ty < midBot; ty += tileH * 2) {
      ctx.fillRect(tx, ty, tileW, tileH);
      ctx.fillRect(tx + tileW, ty + tileH, tileW, tileH);
    }
  }
  ctx.fillStyle = 'rgba(140,255,140,0.5)';
  ctx.fillRect(0, midTop, W, 3);

  // Near-ground band (55%–65%)
  const nearGrad = ctx.createLinearGradient(0, H * 0.55, 0, H * 0.65);
  nearGrad.addColorStop(0, '#1f6b26');
  nearGrad.addColorStop(1, '#164d1c');
  ctx.fillStyle = nearGrad;
  ctx.fillRect(0, H * 0.55, W, H * 0.10);

  // Ground strip (70%–82%) — solid brown, rich gradient
  const ground = ctx.createLinearGradient(0, GY, 0, H * 0.82);
  ground.addColorStop(0, '#a8703f');
  ground.addColorStop(0.15, '#8b5e3c');
  ground.addColorStop(0.5, '#6a4526');
  ground.addColorStop(1, '#48300f');
  ctx.fillStyle = ground;
  ctx.fillRect(0, GY, W, H * 0.82 - GY);

  // Ground top edge highlight
  ctx.fillStyle = '#f0c060';
  ctx.fillRect(0, GY, W, 4);
  ctx.fillStyle = '#c8903c';
  ctx.fillRect(0, GY + 4, W, 2);

  // Fast checkerboard band on the ground top — the strongest velocity cue in the frame.
  const cbW = 34, cbH = 10;
  const cbOff = ((hillOffset * 1.0) % (cbW * 2) + cbW * 2) % (cbW * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  for (let cx = -cbW * 2 + Math.floor(cbOff); cx < W + cbW; cx += cbW * 2) {
    ctx.fillRect(cx, GY + 6, cbW, cbH);
    ctx.fillRect(cx + cbW, GY + 6 + cbH, cbW, cbH);
  }

  // Diagonal speed-striping on lower ground
  const period3 = 60;
  const stripeOff = ((hillOffset * 1.5) % period3 + period3) % period3;
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 6;
  for (let sx = -stripeOff; sx < W + 60; sx += 60) {
    ctx.beginPath();
    ctx.moveTo(sx, GY + 6);
    ctx.lineTo(sx - 20, H * 0.82);
    ctx.stroke();
  }
}

function drawSpeedStreaks() {
  speedStreaks = speedStreaks.filter(s => s.age < s.life);
  speedStreaks.forEach(s => {
    s.age++;
    const t = s.age / s.life;
    ctx.strokeStyle = `rgba(255,255,255,${(1 - t) * 0.5})`;
    ctx.lineWidth = s.w;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.len * (1 + t), s.y);
    ctx.stroke();
    s.x -= worldSpeed * 2.4; // streaks fly leftward with the world
  });
}

function spawnSpeedStreaks(count) {
  const GY = groundY();
  for (let i = 0; i < count && speedStreaks.length < MAX_STREAKS; i++) {
    speedStreaks.push({
      x: W * (0.20 + Math.random() * 0.7),
      y: H * 0.15 + Math.random() * (GY - H * 0.15),
      len: 60 + Math.random() * 80,
      w: 2 + Math.random() * 2,
      age: 0, life: 10 + (Math.random() * 8 | 0),
    });
  }
}

function spawnSparkles(x, y) {
  for (let i = 0; i < 8 && sparkles.length < MAX_SPARKLES; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 1.5 + Math.random() * 3;
    sparkles.push({
      x, y,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1,
      age: 0, life: 14 + (Math.random() * 8 | 0),
    });
  }
}

function drawSparkles() {
  sparkles = sparkles.filter(s => s.age < s.life);
  sparkles.forEach(s => {
    s.age++;
    s.x += s.vx; s.y += s.vy; s.vy += 0.12;
    const a = 1 - s.age / s.life;
    ctx.globalAlpha = a;
    ctx.fillStyle = '#fff6c0';
    const sz = 4 * a + 1;
    ctx.fillRect(s.x - sz / 2, s.y - sz / 2, sz, sz);
  });
  ctx.globalAlpha = 1;
}

function drawRings() {
  rings.forEach(r => {
    if (r.collected) return;
    r.rot += 0.06;
    r.x -= worldSpeed;                 // rings stream toward Sonic with the world
    if (r.x < -30) { r.x = W + 30 + Math.random() * W * 0.3; } // wrap off-screen right
    const rx = r.x, ry = r.y;
    const radius = 14;
    const squash = Math.abs(Math.cos(r.rot));

    const grad = ctx.createRadialGradient(rx - radius * 0.3, ry - radius * 0.3, 2, rx, ry, radius);
    grad.addColorStop(0, '#fff3b0');
    grad.addColorStop(0.5, '#ffcc20');
    grad.addColorStop(1, '#a87400');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(rx, ry, radius, radius * squash + 3, 0, 0, Math.PI * 2);
    ctx.stroke();
    const hx = rx - radius * 0.35;
    ctx.fillStyle = 'rgba(255,250,220,0.85)';
    ctx.fillRect(hx, ry - 4, 5, 6);
  });

  // Glow flashes on collect (bounded, clamped radius — no F1 sentinel)
  glows = glows.filter(g => g.age < 16);
  glows.forEach(g => {
    g.age++;
    const a = 1 - g.age / 16;
    const r2 = 10 + g.age * 2.8;
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ffe040';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(g.x, g.y, r2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
}

// Rolling Spin Attack ball form — a blue disc with a light spin arc (1991-correct:
// Sonic curls up while already moving, not a standstill charge).
function drawSpinBall(cx, cy, radius) {
  ctx.save();
  ctx.fillStyle = '#1a5fd0';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  // spin arc streaks
  ctx.strokeStyle = 'rgba(120,180,255,0.7)';
  ctx.lineWidth = 3;
  const a0 = frame * 0.6;
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.72, a0 + k * 2.1, a0 + k * 2.1 + 1.0);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSonic() {
  const GY = groundY();
  const anchorX = sonicScreenX();
  const baseY = GY - SH + terrainRoll(anchorX);

  const boosting = sonicBoost > 0;
  const rolling = spinRoll > 0;

  // Speed blur trail — always present at speed, richer when boosting.
  const trailN = boosting ? 5 : 3;
  const period = boosting ? 3 : 6;
  const sprite = sonicStumble > 0
    ? SONIC_STUMBLE
    : (Math.floor(frame / period) % 2 === 0 ? SONIC_RUN_A : SONIC_RUN_B);

  if (rolling) {
    // Rolling Spin Attack: ball form dipped downslope + a hard blur streak. The
    // downhill dip reads as momentum carrying him down the slope, not a rev-up.
    const rollDip = SH * 0.18;
    const cx = anchorX + SW / 2, cy = baseY + SH / 2 + rollDip;
    for (let t = 1; t <= 5; t++) {
      ctx.globalAlpha = 0.30 * (6 - t) / 5;
      drawSpinBall(cx - t * 18, cy, SW * 0.42);
    }
    ctx.globalAlpha = 1;
    // ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, GY + 3 + terrainRoll(anchorX), SW * 0.42, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#1a66cc'; ctx.shadowBlur = 24;
    drawSpinBall(cx, cy, SW * 0.42);
    ctx.shadowBlur = 0;
    return;
  }

  // Running blur trail
  for (let t = 1; t <= trailN; t++) {
    ctx.globalAlpha = 0.20 * (trailN + 1 - t) / trailN;
    drawPx(sprite, anchorX - t * 13, baseY, PX, '#2a7ae0');
  }
  ctx.globalAlpha = 1;

  // Ground contact shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(anchorX + SW / 2, GY + 3 + terrainRoll(anchorX), SW * 0.42, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = '#1a66cc'; ctx.shadowBlur = boosting ? 22 : 8;
  drawPx(sprite, anchorX, baseY, PX, SONIC_COLS);
  ctx.shadowBlur = 0;
}

function drawHUD() {
  ctx.fillStyle = '#ffe040';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`RINGS  ${ringsCollected} / ${RINGS_TO_WIN}`, 14, 22);
}

// ─── Victory beat ───────────────────────────────────────────────────────────────
// Phase A (0–0.9s): screech to a stop — worldSpeed decays hard, skid dust.
// Phase B (0.9–3.5s): striking the pose + ring tally counts up in a flourish board.
function renderVictory() {
  const GY = groundY();
  const t = victoryFrame / VICTORY_FRAMES;

  // Decay world to a full stop over the first ~0.9s (readable screech).
  const stopT = Math.min(1, victoryFrame / (VICTORY_FRAMES * 0.26));
  worldSpeed = BASE_SPEED * (1 - stopT) * (1 - stopT);
  hillOffset += worldSpeed;

  ctx.clearRect(0, 0, W, H);
  drawBackground();
  drawSparkles();
  drawRings();

  const anchorX = sonicScreenX();
  const baseY = GY - SH + terrainRoll(anchorX);

  if (stopT < 1) {
    // Skidding — stumble-lean + dust puffs kicking left.
    if (victoryFrame % 3 === 0) {
      for (let i = 0; i < 3 && sparkles.length < MAX_SPARKLES; i++) {
        sparkles.push({
          x: anchorX + SW * 0.2, y: GY - 4,
          vx: -2 - Math.random() * 3, vy: -Math.random() * 2,
          age: 0, life: 16,
        });
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(anchorX + SW / 2, GY + 3, SW * 0.42, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#1a66cc'; ctx.shadowBlur = 14;
    drawPx(SONIC_STUMBLE, anchorX, baseY, PX, SONIC_COLS);
    ctx.shadowBlur = 0;
  } else {
    // Stopped — striking the signature finger-wag pose, with a gentle idle bob.
    const bob = Math.sin(victoryFrame * 0.18) * 3;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(anchorX + SW / 2, GY + 3, SW * 0.42, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#1a66cc'; ctx.shadowBlur = 12;
    drawPx(SONIC_POSE, anchorX, baseY + bob, PX, SONIC_COLS);
    ctx.shadowBlur = 0;

    // Celebratory sparkles rising around him
    if (victoryFrame % 6 === 0) spawnSparkles(anchorX + SW / 2, baseY + SH * 0.3);

    // Ring-tally flourish board in the top band (stage region, clear of prompt).
    const boardT = Math.min(1, (victoryFrame - VICTORY_FRAMES * 0.26) / (VICTORY_FRAMES * 0.45));
    tallyShown = Math.round(RINGS_TO_WIN * boardT);
    const bx = W * 0.5, by = H * 0.11;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffe040';
    ctx.shadowColor = '#a87400'; ctx.shadowBlur = 6;
    ctx.fillText(`RINGS  ${tallyShown}`, bx, by);
    ctx.shadowBlur = 0;
    // Spinning ring beside the count
    const rr = 12, sq = Math.abs(Math.cos(frame * 0.12));
    ctx.strokeStyle = '#ffcc20'; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(bx + 96, by, rr, rr * sq + 3, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  victoryFrame++;
  // Hold on the final pose frame past the window end; engine controls teardown timing.
}

// ─── Update ───────────────────────────────────────────────────────────────────

function updateWorld() {
  // World velocity always decays toward the constant base. Keystrokes kick it up; a
  // spin-attack roll adds a momentum surge on top (terrain-driven, not a charge).
  const target = (sonicBoost > 0 ? BASE_SPEED * 2.6 : BASE_SPEED) + rollSurge;
  worldSpeed += (target - worldSpeed) * 0.12;
  hillOffset += worldSpeed;

  // Clamped countdowns / decays — never a sentinel.
  if (sonicBoost > 0) sonicBoost--;
  if (spinRoll > 0) spinRoll--;
  if (sonicStumble > 0) sonicStumble--;
  if (rollSurge > 0) rollSurge = Math.max(0, rollSurge - 0.12);
}

function nearestRing() {
  const sy = groundY() - SH / 2, scx = sonicScreenX() + SW / 2;
  let best = null, bestD = Infinity;
  rings.forEach(r => {
    if (r.collected) return;
    const d = Math.hypot(r.x - scx, r.y - sy);
    if (d < bestD) { bestD = d; best = r; }
  });
  return best;
}

// ─── Render loop ─────────────────────────────────────────────────────────────

function render() {
  if (!active) return;
  frame++;

  if (victoryMode) {
    renderVictory();
    animId = requestAnimationFrame(render);
    return;
  }

  ctx.clearRect(0, 0, W, H);
  drawBackground();
  drawSpeedStreaks();
  drawSparkles();
  drawRings();
  drawSonic();
  drawHUD();
  updateWorld();

  animId = requestAnimationFrame(render);
}

// ─── API ──────────────────────────────────────────────────────────────────────

export function start() {
  getCanvas(); resize();
  active = true; victoryMode = false; victoryFrame = 0; frame = 0;
  ringsCollected = 0; sonicBoost = 0; spinRoll = 0; sonicStumble = 0; tallyShown = 0;
  sonicX = W * 0.14; worldSpeed = BASE_SPEED; hillOffset = 0;
  glows = []; speedStreaks = []; sparkles = [];
  initRings();
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  rings = []; glows = []; speedStreaks = []; sparkles = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  const r = nearestRing();
  if (r) {
    r.collected = true;
    ringsCollected++;
    glows.push({ x: r.x, y: r.y, age: 0 });
    if (glows.length > MAX_GLOWS) glows.shift();
    spawnSparkles(r.x, r.y);        // collection sparkles at speed
  }
  // Every correct key visibly kicks his speed up.
  sonicBoost = Math.min(sonicBoost + 24, 60);
  spawnSpeedStreaks(4);
  // Replenish — keep ~8 rings on screen
  const visible = rings.filter(rr => !rr.collected).length;
  if (visible < 8 && ringsCollected < RINGS_TO_WIN) spawnRing();
}

export function miss() {
  if (!active || victoryMode) return;
  sonicStumble = 22;
}

// A completed sequence = a rolling Spin Attack burst (1991-correct; the
export function patternComplete() {
  if (!victoryMode) {
    spinRoll = 40;
    sonicBoost = 60;
    spawnSpeedStreaks(10);
  }
  return ringsCollected >= RINGS_TO_WIN;
}

// Victory: screech to a stop, strike the pose, tally the rings. Returns duration (ms).
export function victory() {
  victoryMode = true;
  victoryFrame = 0;
  spinRoll = 0; sonicBoost = 0; sonicStumble = 8; // brief skid on entry
  sparkles = [];
  return VICTORY_MS;
}

window.addEventListener('resize', () => { if (active) resize(); });
