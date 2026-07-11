// Level 13: Myst (Cyan Worlds, 1993)
// A quiet island. A stone pedestal. A glowing book. Read its pages.

let canvas, ctx;
let animId = null, active = false, victoryMode = false;
let frame = 0, W = 0, H = 0;

let pagesRead = 0;
let bookPulse = 0;       // frames of golden pulse after keystroke
let bookMiss = 0;        // frames of red flash after miss
let gearSpeed = 1;       // multiplier — spikes briefly on keystroke
let gearAngle = 0;
let victoryAlpha = 0;    // golden fill overlay for victory
let wisps = [];          // slow drifting mist bands
let islands = [];        // far parallax island silhouettes, multiple depths
let ripples = [];        // water ripple rings (ambient + keystroke-triggered)
let rippleTimer = 0;

const PAGES_TO_WIN = 22;

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  W = canvas.width; H = canvas.height;
  initWisps();
  initIslands();
}

function initWisps() {
  wisps = [];
  for (let i = 0; i < 5; i++) {
    wisps.push({
      x: Math.random() * W,
      y: H * (0.15 + Math.random() * 0.60),
      w: W * (0.25 + Math.random() * 0.45),
      speed: 0.18 + Math.random() * 0.22,
      alpha: 0.03 + Math.random() * 0.05,
    });
  }
}

// Two depth layers of island/rock silhouettes along the horizon — parallax at different speeds
function initIslands() {
  islands = [];
  for (let layer = 0; layer < 2; layer++) {
    const count = 4;
    for (let i = 0; i < count; i++) {
      islands.push({
        layer,
        bx: (i / count) * W * 1.4 + Math.random() * 100,
        w: 90 + Math.random() * 140,
        h: 24 + Math.random() * (layer === 0 ? 30 : 50),
      });
    }
  }
}

// ─── Layout helpers ────────────────────────────────────────────────────────────

function pedestalX() { return W / 2; }
function pedestalY() { return H * 0.76; }   // pedestal top — below 70% (safe zone)
function bookCX()    { return W / 2; }
function bookCY()    { return H * 0.68; }    // book center — just into lower play area

function gearCX()    { return W * 0.18; }
function gearCY()    { return H * 0.78; }

function panelX()    { return W * 0.80; }
function panelY()    { return H * 0.72; }

// ─── Draw helpers ──────────────────────────────────────────────────────────────

function drawBackground() {
  // Sky — moody dusk gradient, richer multi-stop (top half)
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.50);
  sky.addColorStop(0, '#080810');
  sky.addColorStop(0.5, '#161c2e');
  sky.addColorStop(0.85, '#2a2e46');
  sky.addColorStop(1, '#3a3450');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.50);

  // A faint moon — soft glow, warm library-adjacent light source
  const moonX = W * 0.78, moonY = H * 0.14, moonR = 26;
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonR * 3);
  moonGlow.addColorStop(0, 'rgba(230,220,180,0.25)');
  moonGlow.addColorStop(1, 'rgba(230,220,180,0)');
  ctx.fillStyle = moonGlow;
  ctx.fillRect(moonX - moonR * 3, moonY - moonR * 3, moonR * 6, moonR * 6);
  ctx.fillStyle = '#e8e0c0';
  ctx.beginPath(); ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(160,150,120,0.4)';
  ctx.beginPath(); ctx.arc(moonX - 8, moonY - 4, 7, 0, Math.PI * 2); ctx.fill();

  // Stars — tiny dots, static, twinkling gently
  for (let i = 0; i < 50; i++) {
    const sx = ((i * 137.5) % 1) * W;
    const sy = ((i * 97.3) % 1) * H * 0.42;
    const tw = 0.35 + 0.35 * Math.sin(frame * 0.02 + i * 1.7);
    ctx.fillStyle = `rgba(210,220,240,${tw})`;
    ctx.fillRect(sx, sy, 1, 1);
  }

  // Layer 1 (far islands, slowest drift): dim, hazy silhouettes near horizon
  ctx.fillStyle = 'rgba(50,60,90,0.55)';
  islands.filter(is => is.layer === 0).forEach(is => {
    const x = ((is.bx - frame * 0.02) % (W * 1.4)) - W * 0.2;
    drawIslandShape(x, H * 0.46, is.w, is.h);
  });

  // Layer 2 (near islands, slightly faster drift): darker, closer, more defined
  ctx.fillStyle = 'rgba(20,26,42,0.85)';
  islands.filter(is => is.layer === 1).forEach(is => {
    const x = ((is.bx - frame * 0.05) % (W * 1.4)) - W * 0.2;
    drawIslandShape(x, H * 0.48, is.w, is.h);
  });

  // Water — dark slate with subtle color banding for depth (bottom half)
  const water = ctx.createLinearGradient(0, H * 0.50, 0, H);
  water.addColorStop(0, '#161c30');
  water.addColorStop(0.15, '#111830');
  water.addColorStop(0.5, '#0c1224');
  water.addColorStop(1, '#070a14');
  ctx.fillStyle = water;
  ctx.fillRect(0, H * 0.50, W, H * 0.50);

  // Moon reflection shimmer on water
  const reflGrad = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.7);
  reflGrad.addColorStop(0, 'rgba(220,210,170,0.12)');
  reflGrad.addColorStop(1, 'rgba(220,210,170,0)');
  ctx.fillStyle = reflGrad;
  ctx.fillRect(moonX - 40, H * 0.5, 80, H * 0.2);

  drawRipples();

  // Horizon mist band
  const mistGrad = ctx.createLinearGradient(0, H * 0.44, 0, H * 0.54);
  mistGrad.addColorStop(0, 'rgba(120,130,160,0)');
  mistGrad.addColorStop(0.5, 'rgba(120,130,160,0.10)');
  mistGrad.addColorStop(1, 'rgba(120,130,160,0)');
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, H * 0.44, W, H * 0.10);
}

function drawIslandShape(x, baseY, w, h) {
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.lineTo(x + w * 0.15, baseY - h * 0.5);
  ctx.lineTo(x + w * 0.4, baseY - h);
  ctx.lineTo(x + w * 0.65, baseY - h * 0.6);
  ctx.lineTo(x + w * 0.85, baseY - h * 0.75);
  ctx.lineTo(x + w, baseY);
  ctx.closePath();
  ctx.fill();
}

function drawRipples() {
  ripples = ripples.filter(r => r.age < r.life);
  ripples.forEach(r => {
    r.age++;
    const t = r.age / r.life;
    ctx.strokeStyle = `rgba(200,210,230,${(1 - t) * 0.25})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, r.r * t, r.r * t * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function spawnRipple(x, y, big = false) {
  ripples.push({ x, y, r: big ? 60 : 30, age: 0, life: big ? 50 : 34 });
}

function drawWisps() {
  wisps.forEach(w => {
    w.x += w.speed;
    if (w.x > W + w.w / 2) w.x = -w.w / 2;

    const wy = w.y + Math.sin(frame * 0.005 + w.x * 0.003) * 6;
    const g = ctx.createLinearGradient(w.x - w.w / 2, 0, w.x + w.w / 2, 0);
    g.addColorStop(0,   'rgba(140,160,200,0)');
    g.addColorStop(0.3, `rgba(140,160,200,${w.alpha})`);
    g.addColorStop(0.7, `rgba(140,160,200,${w.alpha})`);
    g.addColorStop(1,   'rgba(140,160,200,0)');
    ctx.fillStyle = g;
    ctx.fillRect(w.x - w.w / 2, wy - 8, w.w, 16);
  });
}

function drawPedestal() {
  const px = pedestalX(), py = pedestalY();
  const pw = 80, ph = 44;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(px - pw / 2 + 6, py + ph - 4, pw, 8);

  // Pedestal body — tapered
  ctx.fillStyle = '#3a3a48';
  ctx.fillRect(px - pw / 2, py, pw, ph);

  // Top cap
  ctx.fillStyle = '#50505e';
  ctx.fillRect(px - pw / 2 - 6, py - 6, pw + 12, 10);

  // Stone texture lines
  ctx.fillStyle = '#2e2e3a';
  for (let i = 8; i < ph; i += 12) ctx.fillRect(px - pw / 2 + 4, py + i, pw - 8, 2);

  // Copper trim
  ctx.fillStyle = '#7a5a2a';
  ctx.fillRect(px - pw / 2 - 6, py - 6, pw + 12, 3);
  ctx.fillRect(px - pw / 2, py + ph - 6, pw, 3);
}

function drawBook() {
  const bx = bookCX(), by = bookCY();
  const bw = 52, bh = 40;

  // Base glow brightness driven by pages read
  const baseBrightness = 0.10 + (pagesRead / PAGES_TO_WIN) * 0.55;

  let glowColor = `rgba(200,140,30,${baseBrightness})`;
  let coverColor = '#4a3010';
  if (bookPulse > 0) {
    const t = bookPulse / 18;
    glowColor = `rgba(255,200,60,${baseBrightness + t * 0.6})`;
    coverColor = '#6a4418';
  }
  if (bookMiss > 0) {
    const t = bookMiss / 14;
    glowColor = `rgba(200,40,20,${0.4 + t * 0.4})`;
    coverColor = '#5a1010';
  }

  // Glow halo
  ctx.shadowColor = bookMiss > 0 ? '#cc2222' : '#d49020';
  ctx.shadowBlur = 22 + (bookPulse > 0 ? 18 : 0);

  // Book cover
  ctx.fillStyle = coverColor;
  ctx.fillRect(Math.round(bx - bw / 2), Math.round(by - bh / 2), bw, bh);
  ctx.shadowBlur = 0;

  // Spine
  ctx.fillStyle = '#3a2008';
  ctx.fillRect(Math.round(bx - bw / 2), Math.round(by - bh / 2), 6, bh);

  // Glow overlay on cover
  ctx.fillStyle = glowColor;
  ctx.fillRect(Math.round(bx - bw / 2), Math.round(by - bh / 2), bw, bh);

  // Page-read tab markers on spine (right side of book)
  const maxTabs = Math.min(pagesRead, PAGES_TO_WIN);
  const tabH = Math.min(3, (bh - 6) / PAGES_TO_WIN);
  for (let i = 0; i < maxTabs; i++) {
    const ty = by - bh / 2 + 3 + i * (bh - 6) / PAGES_TO_WIN;
    const brightness = 0.5 + (i / PAGES_TO_WIN) * 0.5;
    ctx.fillStyle = `rgba(255,200,60,${brightness})`;
    ctx.fillRect(Math.round(bx + bw / 2 - 5), Math.round(ty), 5, Math.max(1, tabH));
  }

  // Open book pages when victory starts
  if (victoryAlpha > 0) {
    const pageSpread = victoryAlpha * bw * 0.8;
    ctx.fillStyle = `rgba(255,220,100,${victoryAlpha * 0.8})`;
    // Left page fan
    ctx.save();
    ctx.translate(bx - bw / 2, by);
    ctx.rotate(-victoryAlpha * 0.6);
    ctx.fillRect(0, -bh / 2, pageSpread, bh);
    ctx.restore();
    // Right page fan
    ctx.save();
    ctx.translate(bx + bw / 2, by);
    ctx.rotate(victoryAlpha * 0.6);
    ctx.fillRect(-pageSpread, -bh / 2, pageSpread, bh);
    ctx.restore();
  }
}

function drawGears() {
  const gx = gearCX(), gy = gearCY();

  function drawGear(cx, cy, r, teeth, angle, col) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.fillStyle = col;
    // Hub
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    // Rim
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    // Cut out center
    ctx.fillStyle = '#0d1220';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
    // Teeth as small rectangles around rim
    ctx.fillStyle = col;
    for (let t = 0; t < teeth; t++) {
      const a = (t / teeth) * Math.PI * 2;
      const tx = Math.cos(a) * r, ty2 = Math.sin(a) * r;
      ctx.save();
      ctx.translate(tx, ty2);
      ctx.rotate(a);
      ctx.fillRect(-3, 0, 6, r * 0.32);
      ctx.restore();
    }
    ctx.restore();
  }

  const r1 = 28, r2 = 18;
  const meshOffset = (r1 / r2) * gearAngle; // counter-rotate for mesh illusion
  drawGear(gx, gy, r1, 10, gearAngle, '#5a4820');
  drawGear(gx + r1 + r2 - 4, gy, r2, 7, -meshOffset + Math.PI / 7, '#4a3a18');

  // Axle bolts
  ctx.fillStyle = '#8a6a30';
  ctx.beginPath(); ctx.arc(gx, gy, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(gx + r1 + r2 - 4, gy, 4, 0, Math.PI * 2); ctx.fill();
}

function drawPanel() {
  const px = panelX(), py = panelY();
  const pw = 50, ph = 70;

  // Panel body
  ctx.fillStyle = '#2a2830';
  ctx.fillRect(px, py, pw, ph);
  // Border
  ctx.fillStyle = '#3a3840';
  ctx.fillRect(px, py, pw, 3);
  ctx.fillRect(px, py + ph - 3, pw, 3);
  ctx.fillRect(px, py, 3, ph);
  ctx.fillRect(px + pw - 3, py, 3, ph);

  // Copper screw corners
  ctx.fillStyle = '#8a6a30';
  ctx.fillRect(px + 3, py + 3, 5, 5);
  ctx.fillRect(px + pw - 8, py + 3, 5, 5);
  ctx.fillRect(px + 3, py + ph - 8, 5, 5);
  ctx.fillRect(px + pw - 8, py + ph - 8, 5, 5);

  // Lever arm
  const leverY = py + ph * 0.45;
  ctx.fillStyle = '#6a5828';
  ctx.fillRect(px + pw * 0.35, leverY - 16, 8, 26);

  // Indicator light — slow blink
  const litPhase = Math.floor(frame / 48) % 2;
  ctx.fillStyle = litPhase ? '#40c840' : '#204820';
  ctx.shadowColor = litPhase ? '#40ff40' : 'transparent';
  ctx.shadowBlur = litPhase ? 8 : 0;
  ctx.fillRect(px + pw * 0.6, py + 12, 10, 10);
  ctx.shadowBlur = 0;
}

function drawVictoryOverlay() {
  if (victoryAlpha <= 0) return;
  ctx.fillStyle = `rgba(255,200,60,${victoryAlpha * 0.35})`;
  ctx.fillRect(0, 0, W, H);
}

function drawHUD() {
  ctx.fillStyle = '#8a7050';
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`PAGES  ${pagesRead} / ${PAGES_TO_WIN}`, 14, 22);
  ctx.textAlign = 'left';
}

// ─── Render loop ──────────────────────────────────────────────────────────────

function render() {
  if (!active) return;
  frame++;
  ctx.clearRect(0, 0, W, H);

  drawBackground();
  drawWisps();
  drawPedestal();
  drawGears();
  drawPanel();
  drawBook();
  drawVictoryOverlay();
  drawHUD();

  // Ambient ripple — occasional, keeps the water alive even without input
  rippleTimer--;
  if (rippleTimer <= 0) {
    spawnRipple(W * (0.15 + Math.random() * 0.7), H * (0.62 + Math.random() * 0.3));
    rippleTimer = 90 + Math.random() * 90;
  }

  // Decay timers
  if (bookPulse > 0) bookPulse--;
  if (bookMiss > 0)  bookMiss--;

  // Gear slows back to idle after keystroke boost
  gearSpeed = Math.max(1, gearSpeed - 0.04);
  gearAngle += 0.008 * gearSpeed;

  // Victory glow fills screen
  if (victoryMode && victoryAlpha < 1) victoryAlpha = Math.min(1, victoryAlpha + 0.012);

  animId = requestAnimationFrame(render);
}

// ─── API ──────────────────────────────────────────────────────────────────────

export function start() {
  getCanvas(); resize();
  active = true; victoryMode = false; frame = 0;
  pagesRead = 0; bookPulse = 0; bookMiss = 0;
  gearSpeed = 1; gearAngle = 0; victoryAlpha = 0;
  ripples = []; rippleTimer = 60;
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  wisps = []; ripples = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  pagesRead++;
  bookPulse = 18;
  gearSpeed = 5;   // spin up briefly
  spawnRipple(pedestalX(), H * 0.82, true);
}

export function miss() {
  if (!active || victoryMode) return;
  bookMiss = 14;
}

export function patternComplete() {
  return pagesRead >= PAGES_TO_WIN;
}

export function victory() {
  victoryMode = true;
  bookPulse = 9999;   // hold the glow
}

window.addEventListener('resize', () => { if (active) resize(); });
