// Final Fantasy VII — Square, 1997 — Level 19
// Classic ATB battle screen. Cloud vs Sephiroth. HP bar drains on hits.

let canvas, ctx, animId;
let active = false;
let hits = 0;
let enemyHP = 999;
let maxEnemyHP = 999;
let atbFill = 0;
let flashes = [];
let damageNumbers = [];
let makoOrbs = [];
const WIN_HITS = 25;

function init() {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  hits = 0;
  enemyHP = 999;
  atbFill = 0;
  flashes = [];
  damageNumbers = [];
  makoOrbs = [];

  // Spawn some ambient Mako orbs
  for (let i = 0; i < 8; i++) spawnMakoOrb();
}

function spawnMakoOrb() {
  const W = canvas.width, H = canvas.height;
  makoOrbs.push({
    x: Math.random() * W,
    y: H * 0.2 + Math.random() * H * 0.6,
    r: 3 + Math.random() * 5,
    vx: (Math.random() - 0.5) * 0.4,
    vy: -0.2 - Math.random() * 0.4,
    alpha: 0.2 + Math.random() * 0.3,
  });
}

function drawBackground(W, H) {
  // Classic FF7 battle background — reactor interior
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#000a08');
  bgGrad.addColorStop(0.4, '#001a14');
  bgGrad.addColorStop(0.8, '#002018');
  bgGrad.addColorStop(1, '#000a08');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Reactor pipes — vertical lines
  ctx.strokeStyle = '#003020';
  ctx.lineWidth = 2;
  for (let x = W * 0.1; x < W * 0.9; x += W * 0.14) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H * 0.7);
    ctx.stroke();
  }

  // Mako glow from floor
  const floorGlow = ctx.createRadialGradient(W / 2, H * 0.85, 0, W / 2, H * 0.85, W * 0.5);
  floorGlow.addColorStop(0, 'rgba(0, 232, 168, 0.12)');
  floorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = floorGlow;
  ctx.fillRect(0, H * 0.5, W, H * 0.5);

  // Floor platform
  ctx.fillStyle = '#001810';
  ctx.fillRect(0, H * 0.78, W, H * 0.22);
  ctx.strokeStyle = '#00e8a8';
  ctx.shadowColor = '#00e8a8';
  ctx.shadowBlur = 6;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, H * 0.78); ctx.lineTo(W, H * 0.78);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawMakoOrbs() {
  makoOrbs.forEach((orb, i) => {
    orb.x += orb.vx;
    orb.y += orb.vy;
    if (orb.y < -10) {
      orb.y = canvas.height * 0.95;
      orb.x = Math.random() * canvas.width;
    }
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 232, 168, ${orb.alpha})`;
    ctx.shadowColor = '#00e8a8';
    ctx.shadowBlur = orb.r * 2;
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function drawCloud(W, H) {
  // Cloud Strife — simple pixel silhouette (left side)
  const cx = W * 0.18;
  const cy = H * 0.75;
  const scale = Math.max(3, Math.floor(H * 0.008));

  // Sword (Buster Sword) — diagonal
  ctx.strokeStyle = '#c0c0d8';
  ctx.shadowColor = '#8888cc';
  ctx.shadowBlur = 4;
  ctx.lineWidth = scale * 1.2;
  ctx.beginPath();
  ctx.moveTo(cx + scale * 2, cy - scale * 8);
  ctx.lineTo(cx + scale * 8, cy + scale * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Body
  ctx.fillStyle = '#4060a0';
  ctx.fillRect(Math.round(cx - scale), Math.round(cy - scale * 6), scale * 2, scale * 4);

  // Head
  ctx.fillStyle = '#d4a880';
  ctx.fillRect(Math.round(cx - scale), Math.round(cy - scale * 8), scale * 2, scale * 2);

  // Spiky hair
  ctx.fillStyle = '#c8b040';
  for (let s = 0; s < 4; s++) {
    ctx.fillRect(
      Math.round(cx - scale * 2 + s * scale * 1.2),
      Math.round(cy - scale * 10 - s * scale * 0.5),
      Math.round(scale * 0.8), Math.round(scale * 1.5 + s * 0.5)
    );
  }

  // Legs
  ctx.fillStyle = '#283858';
  ctx.fillRect(Math.round(cx - scale), Math.round(cy - scale * 2), Math.round(scale * 0.8), scale * 2);
  ctx.fillRect(Math.round(cx + scale * 0.2), Math.round(cy - scale * 2), Math.round(scale * 0.8), scale * 2);
}

function drawSephiroth(W, H) {
  // Sephiroth — right side, taller, menacing
  const cx = W * 0.78;
  const cy = H * 0.73;
  const scale = Math.max(3, Math.floor(H * 0.009));
  const hpPct = Math.max(0, enemyHP / maxEnemyHP);

  // Long silver hair — flowing
  const t = performance.now() / 1000;
  ctx.strokeStyle = `rgba(220, 220, 240, ${0.6 + hpPct * 0.3})`;
  ctx.lineWidth = scale * 0.8;
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 3;
  for (let h = 0; h < 5; h++) {
    ctx.beginPath();
    ctx.moveTo(cx - scale * (h * 0.5), cy - scale * 10);
    ctx.quadraticCurveTo(
      cx - scale * (3 + h * 1.2),
      cy + scale * (2 + h * 0.5),
      cx - scale * (4 + h * 1.5) + Math.sin(t + h) * scale,
      cy + scale * 6
    );
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // Body — long black coat
  const bodyAlpha = 0.4 + hpPct * 0.6;
  ctx.fillStyle = `rgba(10, 10, 20, ${bodyAlpha})`;
  ctx.fillRect(Math.round(cx - scale * 1.5), Math.round(cy - scale * 9), scale * 3, scale * 7);

  // Head
  ctx.fillStyle = `rgba(200, 180, 180, ${bodyAlpha})`;
  ctx.fillRect(Math.round(cx - scale), Math.round(cy - scale * 11), scale * 2, scale * 2);

  // Masamune — very long sword
  ctx.strokeStyle = `rgba(180, 220, 255, ${bodyAlpha})`;
  ctx.shadowColor = '#aaccff';
  ctx.shadowBlur = 6;
  ctx.lineWidth = scale * 0.8;
  ctx.beginPath();
  ctx.moveTo(cx, cy - scale * 11);
  ctx.lineTo(cx - scale * 6, cy - scale * 22);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Mako eyes glow
  ctx.fillStyle = `rgba(0, 232, 168, ${bodyAlpha})`;
  ctx.shadowColor = '#00e8a8';
  ctx.shadowBlur = 4;
  ctx.fillRect(Math.round(cx - scale * 0.5), Math.round(cy - scale * 10.5), Math.round(scale * 0.4), Math.round(scale * 0.4));
  ctx.fillRect(Math.round(cx + scale * 0.1), Math.round(cy - scale * 10.5), Math.round(scale * 0.4), Math.round(scale * 0.4));
  ctx.shadowBlur = 0;
}

function drawHPBars(W, H) {
  const barH = 10;
  const barW = Math.round(W * 0.22);
  const by = Math.round(H * 0.82);

  // Enemy HP bar (Sephiroth)
  const hpPct = Math.max(0, enemyHP / maxEnemyHP);
  const hpColor = hpPct > 0.5 ? '#00e040' : hpPct > 0.25 ? '#e0b000' : '#e04000';

  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#e0e0e0';
  ctx.fillText('SEPHIROTH', Math.round(W * 0.56), by - 4);

  ctx.fillStyle = '#0a1010';
  ctx.fillRect(Math.round(W * 0.56), by, barW, barH);
  ctx.fillStyle = hpColor;
  ctx.shadowColor = hpColor;
  ctx.shadowBlur = 4;
  ctx.fillRect(Math.round(W * 0.56), by, Math.round(barW * hpPct), barH);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#1a3030';
  ctx.lineWidth = 1;
  ctx.strokeRect(Math.round(W * 0.56) + 0.5, by + 0.5, barW - 1, barH - 1);

  ctx.font = '6px "Press Start 2P", monospace';
  ctx.fillStyle = '#e0e0e0';
  ctx.fillText(enemyHP + ' / ' + maxEnemyHP, Math.round(W * 0.56), by + barH + 10);

  // HITS counter
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#00e8a8';
  ctx.shadowColor = '#00e8a8';
  ctx.shadowBlur = 4;
  ctx.fillText(`HITS ${hits}/${WIN_HITS}`, Math.round(W * 0.02), 14);
  ctx.shadowBlur = 0;

  // ATB gauge
  const atbW = Math.round(W * 0.14);
  ctx.fillStyle = '#0a1010';
  ctx.fillRect(Math.round(W * 0.02), by, atbW, 6);
  ctx.fillStyle = '#00aaff';
  ctx.shadowColor = '#00aaff';
  ctx.shadowBlur = 3;
  ctx.fillRect(Math.round(W * 0.02), by, Math.round(atbW * Math.min(1, atbFill)), 6);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#002030';
  ctx.lineWidth = 1;
  ctx.strokeRect(Math.round(W * 0.02) + 0.5, by + 0.5, atbW - 1, 5);

  ctx.font = '5px "Press Start 2P", monospace';
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText('ATB', Math.round(W * 0.02), by - 4);
}

function updateDamageNumbers() {
  for (let i = damageNumbers.length - 1; i >= 0; i--) {
    const d = damageNumbers[i];
    d.y -= 1.5;
    d.life -= 0.025;
    if (d.life <= 0) { damageNumbers.splice(i, 1); continue; }

    ctx.globalAlpha = d.life;
    ctx.font = `bold ${d.size}px "Press Start 2P", monospace`;
    ctx.fillStyle = d.col;
    ctx.shadowColor = d.col;
    ctx.shadowBlur = 6;
    ctx.fillText(d.text, d.x, d.y);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

function updateFlashes() {
  for (let i = flashes.length - 1; i >= 0; i--) {
    const f = flashes[i];
    f.life -= 0.1;
    if (f.life <= 0) { flashes.splice(i, 1); continue; }
    ctx.globalAlpha = f.life * 0.7;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }
}

function render() {
  if (!active) return;
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  drawBackground(W, H);
  drawMakoOrbs();
  drawCloud(W, H);
  drawSephiroth(W, H);
  updateFlashes();
  updateDamageNumbers();
  drawHPBars(W, H);

  // ATB fills over time
  atbFill = Math.min(1, atbFill + 0.003);

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
  hits++;
  const dmg = 20 + Math.floor(Math.random() * 30);
  enemyHP = Math.max(0, enemyHP - dmg);

  const W = canvas.width, H = canvas.height;
  const col = atbFill >= 1 ? '#ffff00' : '#00e8a8';
  damageNumbers.push({
    x: W * 0.68 + (Math.random() - 0.5) * 40,
    y: H * 0.55,
    text: dmg.toString(),
    size: 12 + Math.floor(Math.random() * 6),
    life: 1,
    col,
  });

  flashes.push({ life: 0.3 });
  atbFill = 0;
  spawnMakoOrb();
}

export function miss() {
  if (!active) return;
  const W = canvas.width, H = canvas.height;
  damageNumbers.push({
    x: W * 0.55 + (Math.random() - 0.5) * 30,
    y: H * 0.65,
    text: 'MISS',
    size: 8,
    life: 0.8,
    col: '#666688',
  });
}

export function patternComplete() {
  return hits >= WIN_HITS;
}

export function victory() {
  if (!active) return;
  enemyHP = 0;
  flashes.push({ life: 1 });
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
