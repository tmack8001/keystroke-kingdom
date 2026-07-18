// Level 7: Dragon's Lair (Cinematronics, 1983)
// Dirk advances through torch-lit dungeon chambers toward Daphne.

let canvas, ctx;
let animId = null, active = false, victoryMode = false;
let frame = 0;

let progress = 0;
const STEPS_TO_WIN = 28;
const ROOMS_TO_CLEAR = 4;

let torches = [];
let score = 0;
let stepFlash = 0;
let swordSwing = 0;   // frames remaining in the sword-swing arc
let motes = [];        // ambient dust particles drifting in torchlight
let W = 0, H = 0;

// ─── Victory celebration (Dragon's Lair laserdisc "you win" cutscene beat) ──────
// Dirk plants at the far doorway, raises his sword in triumph, the room floods
// with golden torchlight, and jewel-tone sparkles wash up out of the light.
const VICTORY_MS = 3600;          // total celebration duration (engine clamps 1200–6000)
const VICTORY_SWELL_MS = 700;     // sword-raise + light-swell ramp-in window
let victoryStartMs = 0;           // performance.now() when victory() fired
let sparkles = [];                // bounded jewel-tone spark pool

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function buildTorches() {
  torches = [
    { x: Math.floor(W * 0.18), y: Math.floor(H * 0.42), phase: 0 },
    { x: Math.floor(W * 0.18), y: Math.floor(H * 0.62), phase: 1.2 },
    { x: Math.floor(W * 0.82), y: Math.floor(H * 0.42), phase: 0.6 },
    { x: Math.floor(W * 0.82), y: Math.floor(H * 0.62), phase: 1.8 },
  ];
}

// Ambient dust motes drifting through the torchlight — a cheap parallax/depth
// cue that sells the room as a lit volume rather than a flat backdrop.
function buildMotes() {
  motes = [];
  for (let i = 0; i < 22; i++) {
    motes.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vy: -0.15 - Math.random() * 0.25,
      drift: Math.random() * Math.PI * 2,
      size: Math.random() < 0.5 ? 1 : 2,
    });
  }
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function drawBackground() {
  // Stone walls — dark purple-brown
  ctx.fillStyle = '#080006';
  ctx.fillRect(0, 0, W, H);
}

function drawDungeonRoom() {
  const t = Math.min(progress / STEPS_TO_WIN, 1);
  const wallL = Math.floor(W * 0.2);
  const wallR = Math.floor(W * 0.8);
  const wallTop = Math.floor(H * 0.15);
  const wallBot = Math.floor(H * 0.85);

  // Floor
  ctx.fillStyle = '#1a0a10';
  ctx.fillRect(wallL, wallBot - 8, wallR - wallL, H - wallBot + 8);

  // Floor tiles
  ctx.fillStyle = '#200c16';
  const tileW = Math.floor((wallR - wallL) / 8);
  for (let tx = wallL; tx < wallR; tx += tileW) {
    ctx.fillRect(tx, wallBot - 8, 1, H - wallBot + 8);
  }

  // Ceiling
  ctx.fillStyle = '#100008';
  ctx.fillRect(wallL, 0, wallR - wallL, wallTop + 8);

  // Side walls — brick texture
  drawBrickWall(0, 0, wallL, H, '#1a0510');
  drawBrickWall(wallR, 0, W - wallR, H, '#1a0510');

  // Stone corridor walls (lighter border)
  ctx.fillStyle = '#2a1020';
  ctx.fillRect(wallL - 6, wallTop, 6, wallBot - wallTop);
  ctx.fillRect(wallR, wallTop, 6, wallBot - wallTop);
  ctx.fillStyle = '#1a0818';
  ctx.fillRect(wallL - 6, wallTop, 6, 2);
  ctx.fillRect(wallR, wallTop, 6, 2);

  // Archways / doorways — one ahead, one behind
  const archW = Math.floor(W * 0.14);
  const archH = Math.floor(H * 0.4);
  const archTop = wallTop + Math.floor((wallBot - wallTop - archH) / 2);

  // Back doorway (where player came from)
  drawArch(wallL - archW, archTop, archW, archH, '#0a0005', '#cc66ff', 0.4);

  // Forward doorway (where player is going) — a glimpse of the next chamber's
  // torchlight glows deeper inside as progress builds (parallax depth cue).
  const nextRoomAlpha = t;
  drawArch(wallR, archTop, archW, archH, '#0a0005', '#cc66ff', nextRoomAlpha);
  if (nextRoomAlpha > 0.15) {
    const glowX = wallR + archW * 0.6;
    const glowY = archTop + archH * 0.5;
    const pulse = Math.sin(frame * 0.06) * 0.15 + 0.55;
    ctx.fillStyle = `rgba(255,150,40,${nextRoomAlpha * pulse * 0.5})`;
    ctx.beginPath();
    ctx.arc(glowX, glowY, 10 + nextRoomAlpha * 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Room number / depth indicator
  const roomNum = Math.min(Math.floor(t * ROOMS_TO_CLEAR) + 1, ROOMS_TO_CLEAR);
  ctx.fillStyle = 'rgba(204, 102, 255, 0.4)';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`ROOM ${roomNum}/${ROOMS_TO_CLEAR}`, W - 12, 22);
  ctx.textAlign = 'left';
}

function drawBrickWall(x, y, w, h, base) {
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  const bH = 18, bW = 32;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  for (let row = 0; row * bH < h; row++) {
    const offset = (row % 2) * (bW / 2);
    for (let col = -1; col * bW + offset < w + bW; col++) {
      const bx = x + col * bW + offset;
      const by = y + row * bH;
      ctx.fillRect(bx, by, bW - 2, 1);       // horizontal mortar
      ctx.fillRect(bx + bW - 2, by, 2, bH);  // vertical mortar
    }
  }
}

function drawArch(x, y, w, h, bgCol, glowCol, glowAlpha) {
  ctx.fillStyle = bgCol;
  ctx.fillRect(x, y, w, h);

  // Arch outline
  ctx.strokeStyle = `rgba(${glowCol === '#cc66ff' ? '204,102,255' : '255,255,255'},${glowAlpha})`;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);

  if (glowAlpha > 0.1) {
    ctx.fillStyle = `rgba(180,60,240,${glowAlpha * 0.08})`;
    ctx.fillRect(x, y, w, h);
  }
}

function drawTorches() {
  torches.forEach(t => {
    t.phase += 0.08;
    const flicker = Math.sin(t.phase) * 0.3 + Math.sin(t.phase * 2.3) * 0.15;
    const h = 18 + flicker * 8;

    // Sconce bracket
    ctx.fillStyle = '#4a2008';
    ctx.fillRect(t.x - 3, t.y, 6, 10);
    ctx.fillRect(t.x - 4, t.y + 8, 8, 3);

    // Flame layers
    const pulse = (flicker + 0.5);
    ctx.fillStyle = `rgba(255,140,0,0.9)`;
    ctx.fillRect(t.x - 4, t.y - h, 8, h);

    ctx.fillStyle = `rgba(255,220,0,0.85)`;
    ctx.fillRect(t.x - 2, t.y - h * 0.7, 4, h * 0.7);

    ctx.fillStyle = `rgba(255,255,200,0.7)`;
    ctx.fillRect(t.x - 1, t.y - h * 0.4, 2, h * 0.4);

    // Glow halo
    const grad = ctx.createRadialGradient(t.x, t.y - h * 0.4, 0, t.x, t.y - h * 0.4, 40);
    grad.addColorStop(0, `rgba(255,140,0,${0.18 + pulse * 0.08})`);
    grad.addColorStop(1, 'rgba(255,80,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(t.x - 40, t.y - h - 20, 80, 80);
  });
}

function drawDirk() {
  const t = Math.min(progress / STEPS_TO_WIN, 1);
  const wallL = Math.floor(W * 0.2);
  const wallR = Math.floor(W * 0.8);
  const floorY = Math.floor(H * 0.85) - 8;

  // Dirk moves from left side to right side of corridor as progress advances
  const dx = wallL + 20 + (wallR - wallL - 60) * t;
  const dy = floorY;

  // Walking animation
  const walkFrame = Math.floor(frame / 8) % 4;

  if (stepFlash > 0) {
    ctx.shadowColor = '#cc66ff'; ctx.shadowBlur = 16;
  }

  // Body (yellow/gold armor)
  ctx.fillStyle = '#ddaa00';
  ctx.fillRect(dx - 6, dy - 30, 12, 18);

  // Head
  ctx.fillStyle = '#ddaa00';
  ctx.fillRect(dx - 5, dy - 44, 10, 12);
  ctx.fillStyle = '#888';
  ctx.fillRect(dx - 5, dy - 44, 10, 5); // helmet

  // Sword — swings through an arc on keystroke, otherwise rests at idle bob
  const swordLen = 18;
  if (swordSwing > 0) {
    const swingT = 1 - swordSwing / 10; // 0..1 across the swing
    const ang = -0.9 + swingT * 1.8;    // sweeps from raised to forward
    ctx.save();
    ctx.translate(dx + 6, dy - 26);
    ctx.rotate(ang);
    ctx.fillStyle = '#eee';
    ctx.shadowColor = '#cc66ff'; ctx.shadowBlur = 10;
    ctx.fillRect(0, -1, swordLen, 3);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#aa8800';
    ctx.fillRect(-3, -2, 5, 5);
    ctx.restore();
  } else {
    ctx.fillStyle = '#ccc';
    ctx.fillRect(dx + 6, dy - 28 + (walkFrame % 2 === 0 ? 0 : 1), 3, swordLen);
    ctx.fillStyle = '#aa8800';
    ctx.fillRect(dx + 4, dy - 28, 7, 3); // guard
  }

  // Legs
  ctx.fillStyle = '#885500';
  if (walkFrame < 2) {
    ctx.fillRect(dx - 5, dy - 12, 5, 12);
    ctx.fillRect(dx + 1, dy - 12 + 4, 5, 8);
  } else {
    ctx.fillRect(dx - 5, dy - 12 + 4, 5, 8);
    ctx.fillRect(dx + 1, dy - 12, 5, 12);
  }

  ctx.shadowBlur = 0;
}

function drawScore() {
  ctx.fillStyle = '#cc66ff';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(String(score).padStart(6, '0'), 12, 22);
}

function drawMotes() {
  ctx.fillStyle = 'rgba(255, 200, 140, 0.35)';
  motes.forEach(m => {
    m.y += m.vy;
    m.drift += 0.02;
    const dx = Math.sin(m.drift) * 0.3;
    m.x += dx;
    if (m.y < 0) { m.y = H; m.x = Math.random() * W; }
    ctx.fillRect(m.x, m.y, m.size, m.size);
  });
}

// ─── Victory ────────────────────────────────────────────────────────────────
// Elapsed-time driven (like tetris.js) so the celebration lands the same wall-clock
// duration regardless of frame rate. All math is clamped — victory animations are
// exactly where the F1 sentinel-frame crash lived, so nothing unbounded reaches
// geometry (progress in [0,1], radii/positions from clamped fractions of W/H).

const JEWEL_HUES = ['255,215,0', '204,102,255', '80,220,160', '255,120,60', '120,180,255'];

// ── The hero shot ─────────────────────────────────────────────────────────────
// Laserdisc cutscenes were full-frame character animation, so the victory beat
// scales the sprites UP, cinema-style — a bigger sprite is MORE era-faithful
// here. Dirk and Daphne stand together at ~5x gameplay scale; Dirk's sword
// sweeps from forward-low to raised-high across the swell with a glint star at
// the tip. The engine fades the prompt/keyboard UI for the victory window, so
// the hero shot may own the frame's center.

// Dirk, hero pose. (bx, by) = feet center in canvas space; s = pixel scale.
function drawDirkHero(bx, by, s, swell) {
  const bob = Math.sin(frame * 0.1) * s * 0.4;
  const y = by + bob;

  ctx.shadowColor = '#ffcc44';
  ctx.shadowBlur = 10 + swell * 24;

  // Legs — planted wide, victorious stance.
  ctx.fillStyle = '#885500';
  ctx.fillRect(bx - 5 * s, y - 12 * s, 4 * s, 12 * s);
  ctx.fillRect(bx + 1 * s, y - 12 * s, 4 * s, 12 * s);
  // Boots
  ctx.fillStyle = '#5a3300';
  ctx.fillRect(bx - 6 * s, y - 2 * s, 6 * s, 2 * s);
  ctx.fillRect(bx + 1 * s, y - 2 * s, 6 * s, 2 * s);

  // Body (gold armor tunic)
  ctx.fillStyle = '#eebb11';
  ctx.fillRect(bx - 6 * s, y - 30 * s, 12 * s, 18 * s);
  // Chest highlight — armor catching the golden flood
  ctx.fillStyle = `rgba(255,240,180,${0.35 + swell * 0.4})`;
  ctx.fillRect(bx - 4 * s, y - 28 * s, 4 * s, 12 * s);

  // Left arm on hip
  ctx.fillStyle = '#eebb11';
  ctx.fillRect(bx - 9 * s, y - 28 * s, 3 * s, 12 * s);

  // Head
  ctx.fillStyle = '#f5c983'; // face
  ctx.fillRect(bx - 5 * s, y - 42 * s, 10 * s, 10 * s);
  ctx.fillStyle = '#c9a24d'; // blond mop (Dirk's signature hair)
  ctx.fillRect(bx - 6 * s, y - 45 * s, 12 * s, 5 * s);
  ctx.fillStyle = '#332211'; // eyes
  ctx.fillRect(bx - 3 * s, y - 39 * s, 1.5 * s, 1.5 * s);
  ctx.fillRect(bx + 1.5 * s, y - 39 * s, 1.5 * s, 1.5 * s);
  // Big grin
  ctx.fillStyle = '#aa3322';
  ctx.fillRect(bx - 2.5 * s, y - 35 * s, 5 * s, 1.5 * s);

  // Sword arm: sweeps from forward-low to raised-high across the swell (clamped).
  const raise = Math.min(1, Math.max(0, swell));
  const ang = 0.9 - raise * 1.9;                   // +0.9 (low) → -1.0 (high)
  const shoulderX = bx + 6 * s, shoulderY = y - 28 * s;
  ctx.save();
  ctx.translate(shoulderX, shoulderY);
  ctx.rotate(ang);
  // Arm
  ctx.fillStyle = '#eebb11';
  ctx.fillRect(0, -1.5 * s, 10 * s, 3 * s);
  // Guard
  ctx.fillStyle = '#aa8800';
  ctx.fillRect(9 * s, -3 * s, 2.5 * s, 6 * s);
  // Blade — bright, glow peaks as the raise lands
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#fff6cc';
  ctx.shadowBlur = 12 + raise * 26;
  ctx.fillRect(11 * s, -1.2 * s, 22 * s, 2.4 * s);
  ctx.shadowBlur = 0;
  ctx.restore();

  // Glint star at the blade tip once raised — the cinematic "ting".
  if (raise > 0.75) {
    const g = Math.min(1, (raise - 0.75) / 0.25);
    const tipR = 33 * s;
    const tipX = shoulderX + Math.cos(ang) * tipR;
    const tipY = shoulderY + Math.sin(ang) * tipR;
    const tw = 0.7 + Math.sin(frame * 0.25) * 0.3;  // twinkle
    const len = Math.max(1, (4 + 7 * g * tw) * s);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(255,255,230,${0.9 * g})`;
    ctx.lineWidth = Math.max(1, s * 0.6);
    ctx.beginPath();
    ctx.moveTo(tipX - len, tipY); ctx.lineTo(tipX + len, tipY);
    ctx.moveTo(tipX, tipY - len); ctx.lineTo(tipX, tipY + len);
    ctx.stroke();
    ctx.restore();
  }

  ctx.shadowBlur = 0;
}

// Daphne — the rescue IS the reward beat. Simple era sprite: long blonde hair,
// pink gown, one arm waving. (bx, by) = feet center; s = pixel scale.
function drawDaphne(bx, by, s, swell) {
  const bob = Math.sin(frame * 0.1 + 1.3) * s * 0.4; // offset phase from Dirk
  const y = by + bob;

  ctx.shadowColor = '#ff88cc';
  ctx.shadowBlur = 8 + swell * 18;

  // Gown — pink, flaring gently to the floor
  ctx.fillStyle = '#ee5599';
  ctx.fillRect(bx - 7 * s, y - 14 * s, 14 * s, 14 * s);
  ctx.fillRect(bx - 5 * s, y - 26 * s, 10 * s, 12 * s);
  // Gown highlight
  ctx.fillStyle = `rgba(255,200,230,${0.3 + swell * 0.35})`;
  ctx.fillRect(bx - 3 * s, y - 24 * s, 3 * s, 20 * s);

  // Right arm down
  ctx.fillStyle = '#f5c983';
  ctx.fillRect(bx + 5 * s, y - 26 * s, 2.5 * s, 8 * s);
  // Left arm raised, waving
  const waveAng = Math.sin(frame * 0.08) * 0.15;
  ctx.save();
  ctx.translate(bx - 5 * s, y - 25 * s);
  ctx.rotate(-1.9 + waveAng);
  ctx.fillRect(0, -1.2 * s, 9 * s, 2.4 * s);
  ctx.restore();

  // Head
  ctx.fillStyle = '#f5c983';
  ctx.fillRect(bx - 4.5 * s, y - 38 * s, 9 * s, 10 * s);
  // Long blonde hair — Daphne's signature look
  ctx.fillStyle = '#ffdd55';
  ctx.fillRect(bx - 6 * s, y - 41 * s, 12 * s, 5 * s);      // crown
  ctx.fillRect(bx - 7 * s, y - 38 * s, 2.5 * s, 16 * s);    // left fall
  ctx.fillRect(bx + 4.5 * s, y - 38 * s, 2.5 * s, 16 * s);  // right fall
  // Eyes + smile
  ctx.fillStyle = '#332211';
  ctx.fillRect(bx - 2.5 * s, y - 35 * s, 1.5 * s, 1.5 * s);
  ctx.fillRect(bx + 1 * s, y - 35 * s, 1.5 * s, 1.5 * s);
  ctx.fillStyle = '#aa3322';
  ctx.fillRect(bx - 2 * s, y - 31.5 * s, 4 * s, 1.2 * s);

  ctx.shadowBlur = 0;
}

function stepVictory(nowMs) {
  const elapsed = Math.max(0, nowMs - victoryStartMs);
  const swell = Math.min(1, elapsed / VICTORY_SWELL_MS); // 0..1 ramp-in

  // Emit jewel-tone sparkles — dense burst at the swell peak (bounded pool).
  if (sparkles.length < 70) {
    const n = swell > 0.9 ? 3 : swell > 0.3 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      sparkles.push({
        x: W * (0.12 + Math.random() * 0.76),
        y: H * (0.45 + Math.random() * 0.4),
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.8 - Math.random() * 1.6,
        life: 40 + Math.floor(Math.random() * 30),
        max: 70,
        hue: JEWEL_HUES[Math.floor(Math.random() * JEWEL_HUES.length)],
        size: 3 + Math.floor(Math.random() * 2),   // 3-4px — reads at a glance
      });
    }
  }
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    s.x += s.vx; s.y += s.vy; s.vy += 0.008; s.life--;
    if (s.life <= 0) sparkles.splice(i, 1);
  }
}

function drawSparkles() {
  // Additive so every spark glows against the lit chamber; each spark gets a
  // colored halo plus a bright white core.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  sparkles.forEach(s => {
    const a = Math.max(0, Math.min(1, s.life / s.max));
    ctx.fillStyle = `rgba(${s.hue},${a})`;
    ctx.fillRect(s.x - 1, s.y - 1, s.size + 2, s.size + 2); // halo
    ctx.fillStyle = `rgba(255,255,240,${a * 0.9})`;
    ctx.fillRect(s.x, s.y, Math.max(1, s.size - 1), Math.max(1, s.size - 1)); // core
  });
  ctx.restore();
}

function drawVictory(nowMs) {
  const elapsed = Math.max(0, nowMs - victoryStartMs);
  const swell = Math.min(1, elapsed / VICTORY_SWELL_MS); // 0..1
  const breathe = Math.sin(frame * 0.08) * 0.05;

  // ── Golden flood ── The scene's base coat is nearly black, so an alpha wash
  // multiplies to nothing; composite ADDITIVELY instead so the whole chamber
  // visibly lights up — before/after frames must differ in overall brightness.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // 1. Flat warm lift across the entire frame
  ctx.fillStyle = `rgba(90,50,20,${(0.55 + breathe) * swell})`;
  ctx.fillRect(0, 0, W, H);
  // 2. Radial golden bloom centered on the hero pair
  const cx = W * 0.5, cy = H * 0.52;
  const R = Math.max(1, W * (0.30 + swell * 0.35));
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
  grad.addColorStop(0, `rgba(255,180,70,${(0.40 + breathe) * swell})`);
  grad.addColorStop(0.55, `rgba(200,110,30,${0.22 * swell})`);
  grad.addColorStop(1, 'rgba(120,60,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  drawSparkles();

  // ── The hero shot ── Dirk + Daphne, large, staged center-frame on the
  // chamber floor (the engine fades the gameplay UI for the victory window).
  const s = Math.max(2, H * 0.006);       // ~4.8 at 800px tall — ~5x gameplay scale
  const feetY = H * 0.78;
  drawDirkHero(W * 0.42, feetY, s, swell);
  drawDaphne(W * 0.58, feetY, s, swell);

  // "RESCUED!" banner — big, jewel-gold, glowing, in the top band.
  if (swell > 0.5) {
    const bannerA = Math.min(1, (swell - 0.5) / 0.5);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '28px "Press Start 2P", monospace';
    ctx.shadowColor = '#ffcc44';
    ctx.shadowBlur = 24;
    ctx.fillStyle = `rgba(255,232,150,${bannerA})`;
    ctx.fillText('RESCUED!', W * 0.5, H * 0.11);
    ctx.restore();
  }
}

function render() {
  if (!active) return;
  frame++;
  const now = performance.now();
  ctx.clearRect(0, 0, W, H);

  drawBackground();
  drawDungeonRoom();
  drawMotes();
  drawTorches();

  if (victoryMode) {
    stepVictory(now);
    drawVictory(now);
  } else {
    drawDirk();
  }
  drawScore();

  if (stepFlash > 0) stepFlash--;
  if (swordSwing > 0) swordSwing--;
  animId = requestAnimationFrame(render);
}

// ─── API ──────────────────────────────────────────────────────────────────────

export function start() {
  getCanvas();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  W = canvas.width; H = canvas.height;
  active = true; victoryMode = false; frame = 0; progress = 0; score = 0;
  swordSwing = 0;
  victoryStartMs = 0; sparkles = [];
  buildTorches();
  buildMotes();
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function keystroke() {
  if (!active || victoryMode) return;
  progress++;
  score += 75;
  stepFlash = 6;
  swordSwing = 10;
}

export function miss() {}

export function patternComplete() {
  return progress >= STEPS_TO_WIN;
}

export function victory() {
  victoryMode = true;
  victoryStartMs = performance.now();
  sparkles = [];
  return VICTORY_MS;
}

window.addEventListener('resize', () => {
  if (active) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    W = canvas.width; H = canvas.height;
    buildTorches();
    buildMotes();
  }
});
