// Final Fantasy VII — Square, 1997 — Level 19
// Classic ATB battle screen with early-PS1 depth cues: a layered mako-glow
// parallax field with true perspective recession, polygon-shard hit sparks
// (angular triangle fragments instead of round particles — PS1 poly aesthetic),
// and a battle-camera push-in on big hits.

let canvas, ctx, animId;
let active = false;
let hits = 0;
let enemyHP = 999;
let maxEnemyHP = 999;
let atbFill = 0;
let flashes = [];
let damageNumbers = [];
let makoOrbs = [];
let shards = [];
let camPush = 0; // battle-camera push-in kick on hit
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
  shards = [];
  camPush = 0;

  // Three depth layers of ambient Mako orbs — near/mid/far — for true parallax
  for (let i = 0; i < 5; i++) spawnMakoOrb(0.3 + Math.random() * 0.2); // far
  for (let i = 0; i < 6; i++) spawnMakoOrb(0.55 + Math.random() * 0.2); // mid
  for (let i = 0; i < 5; i++) spawnMakoOrb(0.85 + Math.random() * 0.3); // near
}

function spawnMakoOrb(depth) {
  const W = canvas.width, H = canvas.height;
  makoOrbs.push({
    x: Math.random() * W,
    y: H * 0.15 + Math.random() * H * 0.65,
    depth, // 0 = far/small/dim, 1 = near/large/bright — drives parallax speed + size
    r: (2 + depth * 6) * (0.6 + Math.random() * 0.6),
    vx: (Math.random() - 0.5) * 0.3 * depth,
    vy: (-0.15 - Math.random() * 0.35) * (0.4 + depth),
    alpha: (0.15 + depth * 0.35) * (0.7 + Math.random() * 0.3),
  });
}

function drawBackground(W, H) {
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#000a08');
  bgGrad.addColorStop(0.4, '#001a14');
  bgGrad.addColorStop(0.8, '#002018');
  bgGrad.addColorStop(1, '#000a08');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Reactor pipes converging toward a vanishing point above the floor line —
  // true perspective recession rather than flat vertical bars, so the reactor
  // reads as a 3D interior, not a wallpaper pattern.
  const vpX = W / 2, vpY = H * 0.05;
  const pipeXs = [];
  for (let x = W * 0.04; x < W * 0.96; x += W * 0.11) pipeXs.push(x);
  pipeXs.forEach(x => {
    const bottomX = vpX + (x - vpX) * 1.7; // splays out toward camera at floor level
    const topX = vpX + (x - vpX) * 0.12;
    ctx.strokeStyle = 'rgba(0, 120, 84, 0.5)';
    ctx.shadowColor = '#00a878';
    ctx.shadowBlur = 3;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(topX, vpY);
    ctx.lineTo(bottomX, H * 0.78);
    ctx.stroke();
    ctx.shadowBlur = 0;
  });

  // Floor perspective grid — panel seams converging on the same vanishing
  // point as the pipes, reinforcing a real 3D room rather than a painted flat.
  ctx.strokeStyle = 'rgba(0, 160, 112, 0.14)';
  ctx.lineWidth = 1;
  const floorSpread = 14;
  for (let i = -floorSpread; i <= floorSpread; i++) {
    const baseX = W / 2 + i * (W / (floorSpread * 1.1));
    ctx.beginPath();
    ctx.moveTo(baseX, H);
    ctx.lineTo(vpX, H * 0.7);
    ctx.stroke();
  }
  // Fixed iteration count (not a while-loop on an asymptotic value, which
  // can run effectively forever due to floating point) — cross-lines compress
  // toward the horizon using the same 1/(1+depth) falloff.
  const floorLineCount = 14;
  for (let depthLine = 1; depthLine <= floorLineCount; depthLine++) {
    const ly = H - (H - H * 0.78) * (1 - 1 / (1 + depthLine * 0.4));
    if (ly <= H * 0.78) break;
    ctx.beginPath();
    ctx.moveTo(0, ly);
    ctx.lineTo(W, ly);
    ctx.stroke();
  }

  // Mako glow from floor
  const floorGlow = ctx.createRadialGradient(W / 2, H * 0.85, 0, W / 2, H * 0.85, W * 0.5);
  floorGlow.addColorStop(0, 'rgba(0, 232, 168, 0.12)');
  floorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = floorGlow;
  ctx.fillRect(0, H * 0.5, W, H * 0.5);

  // Floor platform — dithered banding toward the horizon (era-authentic gradient fake)
  ctx.fillStyle = '#001810';
  ctx.fillRect(0, H * 0.78, W, H * 0.22);
  for (let i = 0; i < 6; i++) {
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#00e8a8';
    ctx.fillRect(0, H * 0.78 + i * 3, W, 1);
  }
  ctx.globalAlpha = 1;

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
  // Draw far-to-near so nearer orbs occlude farther ones (depth sort)
  const sorted = [...makoOrbs].sort((a, b) => a.depth - b.depth);
  sorted.forEach(orb => {
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
  const cx = W * 0.18;
  const cy = H * 0.75;
  const scale = Math.max(3, Math.floor(H * 0.008));

  ctx.strokeStyle = '#c0c0d8';
  ctx.shadowColor = '#8888cc';
  ctx.shadowBlur = 4;
  ctx.lineWidth = scale * 1.2;
  ctx.beginPath();
  ctx.moveTo(cx + scale * 2, cy - scale * 8);
  ctx.lineTo(cx + scale * 8, cy + scale * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#4060a0';
  ctx.fillRect(Math.round(cx - scale), Math.round(cy - scale * 6), scale * 2, scale * 4);

  ctx.fillStyle = '#d4a880';
  ctx.fillRect(Math.round(cx - scale), Math.round(cy - scale * 8), scale * 2, scale * 2);

  ctx.fillStyle = '#c8b040';
  for (let s = 0; s < 4; s++) {
    ctx.fillRect(
      Math.round(cx - scale * 2 + s * scale * 1.2),
      Math.round(cy - scale * 10 - s * scale * 0.5),
      Math.round(scale * 0.8), Math.round(scale * 1.5 + s * 0.5)
    );
  }

  ctx.fillStyle = '#283858';
  ctx.fillRect(Math.round(cx - scale), Math.round(cy - scale * 2), Math.round(scale * 0.8), scale * 2);
  ctx.fillRect(Math.round(cx + scale * 0.2), Math.round(cy - scale * 2), Math.round(scale * 0.8), scale * 2);
}

function drawSephiroth(W, H) {
  const cx = W * 0.78;
  const cy = H * 0.73;
  const scale = Math.max(3, Math.floor(H * 0.009));
  const hpPct = Math.max(0, enemyHP / maxEnemyHP);

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

  const bodyAlpha = 0.4 + hpPct * 0.6;
  ctx.fillStyle = `rgba(10, 10, 20, ${bodyAlpha})`;
  ctx.fillRect(Math.round(cx - scale * 1.5), Math.round(cy - scale * 9), scale * 3, scale * 7);

  ctx.fillStyle = `rgba(200, 180, 180, ${bodyAlpha})`;
  ctx.fillRect(Math.round(cx - scale), Math.round(cy - scale * 11), scale * 2, scale * 2);

  ctx.strokeStyle = `rgba(180, 220, 255, ${bodyAlpha})`;
  ctx.shadowColor = '#aaccff';
  ctx.shadowBlur = 6;
  ctx.lineWidth = scale * 0.8;
  ctx.beginPath();
  ctx.moveTo(cx, cy - scale * 11);
  ctx.lineTo(cx - scale * 6, cy - scale * 22);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = `rgba(0, 232, 168, ${bodyAlpha})`;
  ctx.shadowColor = '#00e8a8';
  ctx.shadowBlur = 4;
  ctx.fillRect(Math.round(cx - scale * 0.5), Math.round(cy - scale * 10.5), Math.round(scale * 0.4), Math.round(scale * 0.4));
  ctx.fillRect(Math.round(cx + scale * 0.1), Math.round(cy - scale * 10.5), Math.round(scale * 0.4), Math.round(scale * 0.4));
  ctx.shadowBlur = 0;
}

// Polygon-shard hit sparks — angular triangles that tumble and shrink, the
// PS1-era substitute for a soft particle burst (no round glow, hard poly edges).
function spawnShards(x, y, col) {
  const count = 10;
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const speed = 2 + Math.random() * 3.5;
    shards.push({
      x, y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed - 1,
      size: 4 + Math.random() * 5,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.5,
      life: 1,
      col,
    });
  }
}

function updateShards() {
  for (let i = shards.length - 1; i >= 0; i--) {
    const s = shards[i];
    s.x += s.vx;
    s.y += s.vy;
    s.vy += 0.15;
    s.rot += s.vrot;
    s.life -= 0.028;
    if (s.life <= 0) { shards.splice(i, 1); continue; }

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.globalAlpha = s.life;
    ctx.fillStyle = s.col;
    ctx.shadowColor = s.col;
    ctx.shadowBlur = 4;
    const sz = s.size * s.life;
    ctx.beginPath();
    ctx.moveTo(0, -sz);
    ctx.lineTo(sz * 0.8, sz * 0.6);
    ctx.lineTo(-sz * 0.8, sz * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

function drawHPBars(W, H) {
  const barH = 10;
  const barW = Math.round(W * 0.22);
  const by = Math.round(H * 0.82);

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

  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#00e8a8';
  ctx.shadowColor = '#00e8a8';
  ctx.shadowBlur = 4;
  ctx.fillText(`HITS ${hits}/${WIN_HITS}`, Math.round(W * 0.02), 14);
  ctx.shadowBlur = 0;

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

  // Battle-camera push-in kick on hit — subtle scale pulse from screen center,
  // the dramatic camera-depth cue the spec calls for (decays each frame).
  if (camPush > 0) camPush -= 0.04;
  const pushScale = 1 + Math.max(0, camPush) * 0.02;

  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(pushScale, pushScale);
  ctx.translate(-W / 2, -H / 2);

  drawBackground(W, H);
  drawMakoOrbs();
  drawCloud(W, H);
  drawSephiroth(W, H);
  updateShards();
  updateFlashes();
  updateDamageNumbers();

  ctx.restore();

  drawHPBars(W, H);

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
  camPush = 1;
  spawnShards(W * 0.72, H * 0.6, col);
  atbFill = 0;
  spawnMakoOrb(0.7 + Math.random() * 0.3);
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
  camPush = 2.5;
  spawnShards(canvas.width * 0.78, canvas.height * 0.6, '#ffffff');
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
