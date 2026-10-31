// Level 13: Myst (Cyan Worlds, 1993)
//
// This is the "reading and pausing" level (it teaches the comma). The scene is
// slow and contemplative — sparse, long animations, no busy-ness. Composed into
// the UI stage so the centre stays with the typing prompt:
//   • Myst Island silhouette rising in the LEFT margin — the library tower, the
//     giant shore gear, dark pines (recognisable Myst landmarks)
//   • the linking book LARGE and open in the RIGHT margin, its right page a
//     softly flickering "linking panel" that shows an age
//   • moon + drifting mist bands in the TOP band
//   • dark water with a moon reflection + slow ripples in the BOTTOM strip
// Palette: misty island grays, slate blues, aged copper, book-leather browns.

let canvas, ctx;
let animId = null, active = false, victoryMode = false;
let frame = 0, W = 0, H = 0;

let pagesRead = 0;
let bookPulse = 0;       // frames of golden pulse after keystroke
let bookMiss = 0;        // frames of soft red flash after miss (gentle, never harsh)
let gearSpeed = 1;       // multiplier — spikes briefly on keystroke
let gearAngle = 0;
let victoryAlpha = 0;    // golden fill overlay for victory
let victoryFrame = 0;    // clamped frame counter for the victory celebration
let riffles = [];        // bounded pool of turning pages during the celebration
let wisps = [];          // slow drifting mist bands (top band)
let ripples = [];        // water ripple rings in the bottom strip
let rippleTimer = 0;
let panelFlicker = 0;    // linking-panel flicker phase

const PAGES_TO_WIN = 22;
// Victory celebration length (frames @ ~60fps). Kept well under the engine's
// 6000ms clamp so the LEVEL COMPLETE card lands as the last page settles.
const VICTORY_FRAMES = 216;                 // ~3.6s
const VICTORY_MS = Math.round(VICTORY_FRAMES / 60 * 1000);

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  W = canvas.width; H = canvas.height;
  initWisps();
}

// Drifting mist bands, kept high (top band) so they read behind the moon.
function initWisps() {
  wisps = [];
  for (let i = 0; i < 5; i++) {
    wisps.push({
      x: Math.random() * W,
      y: H * (0.04 + Math.random() * 0.26),
      w: W * (0.25 + Math.random() * 0.45),
      speed: 0.12 + Math.random() * 0.16,
      alpha: 0.04 + Math.random() * 0.05,
    });
  }
}

// ─── Stage anchors (canvas fractions) ────────────────────────────────────────
// Island focal art lives in the LEFT margin; the book in the RIGHT margin.
function islandBaseX() { return W * 0.11; }   // centre of the island landmass
function bookCX()      { return W * 0.895; }  // centre of the open book
function bookCY()      { return H * 0.50; }

// ─── Background ──────────────────────────────────────────────────────────────

function drawBackground() {
  // Sky — moody dusk gradient (full width, ambient; may sit behind panels)
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  sky.addColorStop(0, '#080810');
  sky.addColorStop(0.5, '#161c2e');
  sky.addColorStop(0.85, '#2a2e46');
  sky.addColorStop(1, '#3a3450');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.55);

  // Moon — in the TOP band, offset right of centre but clear of the HUD stats.
  const moonX = W * 0.66, moonY = H * 0.10, moonR = 30;
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonR * 3.2);
  moonGlow.addColorStop(0, 'rgba(230,220,180,0.28)');
  moonGlow.addColorStop(1, 'rgba(230,220,180,0)');
  ctx.fillStyle = moonGlow;
  ctx.fillRect(moonX - moonR * 3.2, moonY - moonR * 3.2, moonR * 6.4, moonR * 6.4);
  ctx.fillStyle = '#e8e0c0';
  ctx.beginPath(); ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(160,150,120,0.35)';
  ctx.beginPath(); ctx.arc(moonX - 9, moonY - 5, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(moonX + 7, moonY + 6, 5, 0, Math.PI * 2); ctx.fill();

  // Stars — tiny, static, twinkling gently (upper sky only)
  for (let i = 0; i < 60; i++) {
    const sx = ((i * 137.5) % 1) * W;
    const sy = ((i * 97.3) % 1) * H * 0.40;
    const tw = 0.30 + 0.35 * Math.sin(frame * 0.02 + i * 1.7);
    ctx.fillStyle = `rgba(210,220,240,${tw})`;
    ctx.fillRect(sx, sy, 1, 1);
  }

  // Distant hazy ridgeline along the horizon (ambient, full width)
  ctx.fillStyle = 'rgba(40,50,78,0.5)';
  ctx.beginPath();
  ctx.moveTo(0, H * 0.50);
  for (let x = 0; x <= W; x += W / 12) {
    ctx.lineTo(x, H * 0.50 - 14 - 10 * Math.sin(x * 0.004 + 1.3));
  }
  ctx.lineTo(W, H * 0.55); ctx.lineTo(0, H * 0.55); ctx.closePath(); ctx.fill();

  // Water — dark slate, subtle banding (bottom half, ambient)
  const water = ctx.createLinearGradient(0, H * 0.55, 0, H);
  water.addColorStop(0, '#141a2e');
  water.addColorStop(0.15, '#111830');
  water.addColorStop(0.5, '#0c1224');
  water.addColorStop(1, '#070a14');
  ctx.fillStyle = water;
  ctx.fillRect(0, H * 0.55, W, H * 0.45);

  // Moon reflection — a long shimmer column down onto the water
  const reflGrad = ctx.createLinearGradient(0, H * 0.55, 0, H);
  reflGrad.addColorStop(0, 'rgba(220,210,170,0.14)');
  reflGrad.addColorStop(1, 'rgba(220,210,170,0)');
  ctx.fillStyle = reflGrad;
  const refW = 46 + Math.sin(frame * 0.03) * 6;
  ctx.fillRect(moonX - refW / 2, H * 0.55, refW, H * 0.45);

  // Horizon mist band
  const mistGrad = ctx.createLinearGradient(0, H * 0.48, 0, H * 0.58);
  mistGrad.addColorStop(0, 'rgba(120,130,160,0)');
  mistGrad.addColorStop(0.5, 'rgba(120,130,160,0.12)');
  mistGrad.addColorStop(1, 'rgba(120,130,160,0)');
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, H * 0.48, W, H * 0.10);
}

// ─── Myst Island (LEFT margin) ───────────────────────────────────────────────
// A landmass rising from the water carrying the two Myst landmarks: the great
// shore gear and the library rotunda/tower, framed by dark pines.
function drawIsland() {
  const cx = islandBaseX();
  const shore = H * 0.585;      // waterline where the island meets the sea

  // Landmass silhouette (rises in the left margin, ambient behind nothing)
  ctx.fillStyle = '#161d2c';
  ctx.beginPath();
  ctx.moveTo(-W * 0.05, shore);
  ctx.lineTo(-W * 0.05, shore - 30);
  ctx.lineTo(cx - 120, shore - 46);
  ctx.lineTo(cx - 40, shore - 70);
  ctx.lineTo(cx + 40, shore - 58);
  ctx.lineTo(cx + 120, shore - 40);
  ctx.lineTo(cx + 150, shore);
  ctx.closePath();
  ctx.fill();

  // Dark pines dotted along the ridge
  ctx.fillStyle = '#0f1622';
  const pine = (x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x, y - s * 2.4);
    ctx.lineTo(x - s, y);
    ctx.lineTo(x + s, y);
    ctx.closePath(); ctx.fill();
    ctx.fillRect(x - 1, y, 2, s * 0.4);
  };
  pine(cx - 90, shore - 44, 9);
  pine(cx - 66, shore - 50, 11);
  pine(cx + 96, shore - 40, 8);
  pine(cx + 70, shore - 46, 10);

  // The great shore gear — the Myst dock gear, half-embedded, slowly turning.
  drawShoreGear(cx - 78, shore - 30, 30);

  // The library tower / rotunda — rises above the ridge, warm-lit window.
  drawLibraryTower(cx + 34, shore - 58);
}

function drawShoreGear(gx, gy, r) {
  ctx.save();
  ctx.translate(gx, gy);
  ctx.rotate(gearAngle);
  // rim
  ctx.fillStyle = '#4a3a18';
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  // teeth
  const teeth = 12;
  for (let t = 0; t < teeth; t++) {
    const a = (t / teeth) * Math.PI * 2;
    ctx.save();
    ctx.translate(Math.cos(a) * r, Math.sin(a) * r);
    ctx.rotate(a);
    ctx.fillRect(-3.5, 0, 7, r * 0.32);
    ctx.restore();
  }
  // hub cut-out
  ctx.fillStyle = '#12192a';
  ctx.beginPath(); ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2); ctx.fill();
  // copper spokes
  ctx.strokeStyle = '#8a6a30'; ctx.lineWidth = 3;
  for (let s = 0; s < 4; s++) {
    const a = (s / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4);
    ctx.lineTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85);
    ctx.stroke();
  }
  ctx.fillStyle = '#8a6a30';
  ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawLibraryTower(tx, ty) {
  // stone shaft
  ctx.fillStyle = '#2a3040';
  ctx.fillRect(tx - 18, ty - 62, 36, 62);
  // masonry banding
  ctx.fillStyle = '#20263440';
  for (let y = ty - 56; y < ty; y += 12) ctx.fillRect(tx - 18, y, 36, 2);
  // domed rotunda cap
  ctx.fillStyle = '#343c4e';
  ctx.beginPath(); ctx.arc(tx, ty - 62, 20, Math.PI, 0); ctx.fill();
  // copper trim on the dome
  ctx.strokeStyle = '#7a5a2a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(tx, ty - 62, 20, Math.PI, 0); ctx.stroke();
  // finial
  ctx.fillStyle = '#7a5a2a';
  ctx.fillRect(tx - 1.5, ty - 92, 3, 10);
  // warm-lit window — the one light on the island (steady, contemplative)
  const glow = 0.55 + 0.12 * Math.sin(frame * 0.03);
  ctx.fillStyle = `rgba(230,180,90,${glow})`;
  ctx.shadowColor = '#e0b45a'; ctx.shadowBlur = 12;
  ctx.fillRect(tx - 6, ty - 44, 12, 16);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(60,40,15,0.7)';
  ctx.fillRect(tx - 1, ty - 44, 2, 16);
  ctx.fillRect(tx - 6, ty - 37, 12, 2);
}

// ─── The linking book (RIGHT margin) ─────────────────────────────────────────
// A large open leather book on a small copper stand. The right page is a
// "linking panel" — a softly flickering window into an age. Brightens as pages
// are read; the whole point of Myst.
function drawBook() {
  const bx = bookCX(), by = bookCY();
  // vProg: 0→1 across the whole celebration. The book opens WIDER (the two
  // covers swing further apart) and the age panel clarifies — Myst's real
  // "a page is found / you link in" transition, in its calm register.
  const vProg = victoryMode ? Math.min(1, victoryFrame / VICTORY_FRAMES) : 0;
  const openEase = vProg < 0.5 ? 2 * vProg * vProg : 1 - Math.pow(-2 * vProg + 2, 2) / 2;
  const halfW = W * 0.085 * (1 + openEase * 0.45);   // book swings open on win
  const bh = H * 0.20;
  const top = by - bh / 2;

  const progress = pagesRead / PAGES_TO_WIN;
  // Warm light swells during victory on top of the earned baseline.
  const swell = victoryMode ? (0.30 + 0.20 * Math.sin(victoryFrame * 0.12)) * openEase : 0;
  const baseBrightness = Math.min(1, 0.18 + progress * 0.5 + swell);

  // Stand / lectern beneath the book
  ctx.fillStyle = '#2a2732';
  ctx.fillRect(bx - 10, by + bh / 2, 20, H * 0.10);
  ctx.fillStyle = '#7a5a2a';
  ctx.fillRect(bx - 26, by + bh / 2 + H * 0.10, 52, 6);

  // Ambient book glow
  let haloColor = `rgba(200,150,50,${baseBrightness})`;
  let extra = 0;
  if (bookPulse > 0) { const t = bookPulse / 18; haloColor = `rgba(255,205,80,${baseBrightness + t * 0.5})`; extra = 16; }
  if (bookMiss > 0)  { const t = bookMiss / 14;  haloColor = `rgba(190,90,60,${0.35 + t * 0.3})`; }
  ctx.save();
  ctx.shadowColor = bookMiss > 0 ? '#b4553c' : '#d49a30';
  ctx.shadowBlur = 24 + extra;

  // Leather covers (two panels angled open) + spine wedge in the middle
  ctx.fillStyle = '#3a2410';
  // left cover
  ctx.beginPath();
  ctx.moveTo(bx - 4, top + 6);
  ctx.lineTo(bx - halfW, top);
  ctx.lineTo(bx - halfW, top + bh);
  ctx.lineTo(bx - 4, top + bh - 6);
  ctx.closePath(); ctx.fill();
  // right cover
  ctx.beginPath();
  ctx.moveTo(bx + 4, top + 6);
  ctx.lineTo(bx + halfW, top);
  ctx.lineTo(bx + halfW, top + bh);
  ctx.lineTo(bx + 4, top + bh - 6);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  // Pages (lighter parchment inset on each cover)
  const inset = 8;
  ctx.fillStyle = '#c9ba94';
  ctx.beginPath();
  ctx.moveTo(bx - 6, top + 10);
  ctx.lineTo(bx - halfW + inset, top + inset);
  ctx.lineTo(bx - halfW + inset, top + bh - inset);
  ctx.lineTo(bx - 6, top + bh - 10);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d8cba6';
  ctx.beginPath();
  ctx.moveTo(bx + 6, top + 10);
  ctx.lineTo(bx + halfW - inset, top + inset);
  ctx.lineTo(bx + halfW - inset, top + bh - inset);
  ctx.lineTo(bx + 6, top + bh - 10);
  ctx.closePath(); ctx.fill();

  // Text ruling on the LEFT page (the age description) — faint ink lines
  ctx.strokeStyle = 'rgba(60,45,25,0.45)'; ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const ly = top + 22 + i * (bh - 40) / 6;
    ctx.beginPath();
    ctx.moveTo(bx - halfW + inset + 6, ly);
    ctx.lineTo(bx - 12, ly + 2);
    ctx.stroke();
  }

  // The linking PANEL on the RIGHT page — a small animated window into an age.
  const pnlX = bx + 12, pnlY = top + 18;
  const pnlW = halfW - inset - 16, pnlH = bh - 36;
  // panel frame
  ctx.fillStyle = '#1a2434';
  ctx.fillRect(pnlX, pnlY, pnlW, pnlH);
  // linking imagery — a tiny moving age (sky over water, a far tower) that
  // grows clearer/brighter with progress; softly flickering.
  // During victory the panel steadies and clears — the age resolves into view.
  const flick = victoryMode
    ? Math.min(1, 0.80 + 0.20 * openEase + 0.06 * Math.sin(panelFlicker))
    : 0.72 + 0.28 * Math.sin(panelFlicker) * Math.sin(panelFlicker * 0.37);
  const clarity = Math.min(1, 0.35 + progress * 0.65 + openEase * 0.4);
  ctx.save();
  ctx.beginPath(); ctx.rect(pnlX, pnlY, pnlW, pnlH); ctx.clip();
  const pg = ctx.createLinearGradient(pnlX, pnlY, pnlX, pnlY + pnlH);
  pg.addColorStop(0, `rgba(${90 + progress * 60},${130 + progress * 60},${180},${flick * clarity})`);
  pg.addColorStop(0.6, `rgba(40,70,110,${flick * clarity})`);
  pg.addColorStop(1, `rgba(20,35,60,${flick})`);
  ctx.fillStyle = pg;
  ctx.fillRect(pnlX, pnlY, pnlW, pnlH);
  // a far tower silhouette inside the age
  ctx.fillStyle = `rgba(15,25,40,${clarity})`;
  ctx.fillRect(pnlX + pnlW * 0.55, pnlY + pnlH * 0.35, 6, pnlH * 0.35);
  ctx.beginPath();
  ctx.arc(pnlX + pnlW * 0.55 + 3, pnlY + pnlH * 0.35, 5, Math.PI, 0); ctx.fill();
  // shimmer line across the age's water
  ctx.strokeStyle = `rgba(200,210,230,${flick * 0.4})`;
  ctx.beginPath();
  ctx.moveTo(pnlX, pnlY + pnlH * 0.72 + Math.sin(panelFlicker) * 2);
  ctx.lineTo(pnlX + pnlW, pnlY + pnlH * 0.72 - Math.sin(panelFlicker) * 2);
  ctx.stroke();
  ctx.restore();
  // panel copper frame
  ctx.strokeStyle = '#7a5a2a'; ctx.lineWidth = 2;
  ctx.strokeRect(pnlX, pnlY, pnlW, pnlH);

  // Progress: illuminated tabs down the spine (pages read)
  const maxTabs = Math.min(pagesRead, PAGES_TO_WIN);
  for (let i = 0; i < maxTabs; i++) {
    const ty2 = top + 8 + i * (bh - 16) / PAGES_TO_WIN;
    const b = 0.5 + (i / PAGES_TO_WIN) * 0.5;
    ctx.fillStyle = `rgba(255,205,90,${b})`;
    ctx.fillRect(bx - 2, ty2, 4, Math.max(1, (bh - 16) / PAGES_TO_WIN - 1));
  }

  // Halo wash to sell the glow (drawn last, additive-ish, small)
  ctx.fillStyle = haloColor;
  ctx.globalAlpha = 0.25;
  ctx.beginPath(); ctx.ellipse(bx, by, halfW * 1.1, bh * 0.7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

// ─── Riffling pages (victory only) ───────────────────────────────────────────
// Parchment leaves lift off the open book and turn/settle — Myst's "a page is
// found" cue. A small bounded pool, spawned only during the celebration.
function drawRiffles() {
  const bx = bookCX(), by = bookCY();
  riffles = riffles.filter(p => p.age < p.life);
  riffles.forEach(p => {
    p.age++;
    const t = p.age / p.life;                 // 0→1 lifetime, clamped by filter
    // The leaf turns from the right page across the spine, rising slightly.
    const turn = Math.sin(t * Math.PI * 0.5); // 0→1 ease as it sweeps over
    const pw = (W * 0.075) * (1 - turn);       // foreshorten as it turns edge-on
    const px = bx + (W * 0.05) * (1 - turn);   // sweep from right toward spine
    const py = by - (H * 0.20) / 2 - t * H * 0.05; // drift up a little
    const ph = H * 0.18 * (0.9 + 0.1 * Math.cos(t * Math.PI));
    const a = (1 - t) * 0.85;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = '#e8ddba';
    ctx.beginPath();
    ctx.moveTo(px, py + 4);
    ctx.lineTo(px + pw, py);
    ctx.lineTo(px + pw, py + ph);
    ctx.lineTo(px, py + ph - 4);
    ctx.closePath(); ctx.fill();
    // a faint fold shadow down the turning leaf
    ctx.strokeStyle = 'rgba(120,100,60,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + pw * 0.5, py + 2);
    ctx.lineTo(px + pw * 0.5, py + ph - 2);
    ctx.stroke();
    ctx.restore();
  });
}

function spawnRiffle() {
  if (riffles.length >= 10) return;   // bounded pool
  riffles.push({ age: 0, life: 34 + Math.floor(Math.random() * 10) });
}

// ─── Water ripples (bottom strip) ────────────────────────────────────────────

function drawRipples() {
  ripples = ripples.filter(r => r.age < r.life);
  ripples.forEach(r => {
    r.age++;
    const t = r.age / r.life;
    ctx.strokeStyle = `rgba(200,210,230,${(1 - t) * 0.22})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, r.r * t, r.r * t * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function spawnRipple(x, y, big = false) {
  ripples.push({ x, y, r: big ? 60 : 34, age: 0, life: big ? 60 : 40 });
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

function drawVictoryOverlay() {
  if (victoryAlpha <= 0) return;
  // A soft warm bloom centred on the open book — the light of the age spilling
  // out — rather than a flat gold wash. Copper-warm, contemplative.
  const bx = bookCX(), by = bookCY();
  const R = Math.max(W, H) * 0.9;
  const g = ctx.createRadialGradient(bx, by, 0, bx, by, R);
  g.addColorStop(0, `rgba(240,205,120,${victoryAlpha * 0.34})`);
  g.addColorStop(0.35, `rgba(200,160,90,${victoryAlpha * 0.16})`);
  g.addColorStop(1, 'rgba(140,150,180,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// The page counter. Two persona-playtest findings (2026-10-30):
//  • it read "PAGES 111 / 22". pagesRead counts every correct key (it is the
//    theme's win-gate accumulator and keeps climbing because the ENGINE's own
//    minimum-patterns gate usually ends the level well after the book is full).
//    The DISPLAY is clamped to the book's size — a counter never exceeds its own
//    total — and the gate is untouched, so winnability is byte-identical.
//  • it sat at (14,22), under the HUD's LEVEL badge (journal F30). It now lives
//    in the top band, just right of the badge and clear of the prompt panel.
function drawHUD() {
  ctx.fillStyle = '#a88a60';
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const shown = Math.min(pagesRead, PAGES_TO_WIN);
  ctx.fillText(`PAGES  ${shown} / ${PAGES_TO_WIN}`, Math.round(W * 0.125), Math.round(H * 0.045));
  ctx.textBaseline = 'alphabetic';
}

// ─── Render loop ──────────────────────────────────────────────────────────────

function render() {
  if (!active) return;
  frame++;
  ctx.clearRect(0, 0, W, H);

  drawBackground();
  drawWisps();
  drawRipples();
  drawIsland();
  drawBook();
  if (victoryMode) drawRiffles();
  drawVictoryOverlay();
  drawHUD();

  // Ambient ripple — sparse, slow, keeps the water alive without any busy-ness.
  rippleTimer--;
  if (rippleTimer <= 0) {
    spawnRipple(W * (0.1 + Math.random() * 0.8), H * (0.82 + Math.random() * 0.14));
    rippleTimer = 140 + Math.random() * 120;
  }

  if (bookPulse > 0) bookPulse--;
  if (bookMiss > 0)  bookMiss--;

  gearSpeed = Math.max(1, gearSpeed - 0.03);
  gearAngle += 0.004 * gearSpeed;   // slow, contemplative
  panelFlicker += 0.05;

  // Victory: advance the clamped celebration clock, riffle pages as the book
  // opens, and let the moon-glow overlay bloom in gently.
  if (victoryMode) {
    if (victoryFrame < VICTORY_FRAMES) victoryFrame++;
    // Riffle a page roughly every 9 frames during the first ~two-thirds, so
    // the book "reads itself" then settles before the card lands.
    if (victoryFrame < VICTORY_FRAMES * 0.7 && victoryFrame % 9 === 0) spawnRiffle();
    // gentle gear spin-up carries the sense of the age mechanism engaging
    gearSpeed = Math.max(gearSpeed, 2.2);
    if (victoryAlpha < 1) victoryAlpha = Math.min(1, victoryAlpha + 0.018);
  }

  animId = requestAnimationFrame(render);
}

// ─── API ──────────────────────────────────────────────────────────────────────

export function start() {
  getCanvas(); resize();
  active = true; victoryMode = false; frame = 0;
  pagesRead = 0; bookPulse = 0; bookMiss = 0;
  gearSpeed = 1; gearAngle = 0; victoryAlpha = 0;
  victoryFrame = 0; riffles = [];
  ripples = []; rippleTimer = 80; panelFlicker = 0;
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  wisps = []; ripples = []; riffles = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  pagesRead++;
  bookPulse = 18;
  gearSpeed = 4;   // spin up briefly, then settle
  spawnRipple(islandBaseX(), H * 0.86, true);
}

export function miss() {
  if (!active || victoryMode) return;
  bookMiss = 14;
}

export function patternComplete() {
  return pagesRead >= PAGES_TO_WIN;
}

export function victory() {
  // The linking book opens: pages riffle and turn, the age panel clears and
  // brightens, a warm light swells — Myst's quiet "a page is found / you link
  // in" moment. Calm, luminous, never loud. Returns the celebration length so
  // the engine lands the LEVEL COMPLETE card as the last page settles.
  victoryMode = true;
  victoryFrame = 0;
  riffles = [];
  bookPulse = 0;
  return VICTORY_MS;
}

window.addEventListener('resize', () => { if (active) resize(); });
