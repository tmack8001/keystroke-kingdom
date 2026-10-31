let canvas, ctx;
let aliens = [];
let lasers = [];
let explosions = [];
let ship = { x: 0, y: 0, targetX: 0 };
let animId = null;
let active = false;
let victoryMode = false;
let victoryShip = { x: 0, y: 0, angle: 0, speed: 0, trail: [] };
const VICTORY_MS = 1700;

let marchDir = 1;
let marchSpeed = 0.3;
let marchFrame = 0;
let dropAmount = 0;

const ALIEN_COLORS = ['#ffff00', '#ffcc00', '#ff9900', '#ffee55', '#aaff00', '#ff6600', '#66ffcc', '#ff66aa'];

const ALIEN_SHAPES = [
  [
    [0,0,1,0,0,0,0,0,1,0,0],
    [0,0,0,1,0,0,0,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,0,0],
    [0,1,1,0,1,1,1,0,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,1],
    [0,0,0,1,1,0,1,1,0,0,0],
  ],
  [
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,0,0],
    [0,1,1,0,1,1,0,1,1,0],
    [0,1,1,1,1,1,1,1,1,0],
    [0,0,0,1,0,0,1,0,0,0],
    [0,0,1,0,1,1,0,1,0,0],
    [0,1,0,1,0,0,1,0,1,0],
  ],
  [
    [0,0,1,0,0,0,0,0,1,0,0],
    [1,0,0,1,0,0,0,1,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1],
    [1,1,1,0,1,1,1,0,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,0,0,0,0,0,1,0,0],
    [0,1,0,0,0,0,0,0,0,1,0],
  ],
  [
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,0,0],
    [0,1,1,0,0,0,0,1,1,0],
    [1,1,0,1,0,0,1,0,1,1],
    [1,1,1,1,1,1,1,1,1,1],
    [0,0,1,0,1,1,0,1,0,0],
    [0,1,0,1,0,0,1,0,1,0],
    [1,0,0,0,0,0,0,0,0,1],
  ],
  [
    [0,1,0,0,0,0,0,0,1,0],
    [0,0,1,0,0,0,0,1,0,0],
    [0,1,1,1,1,1,1,1,1,0],
    [1,1,0,1,1,1,1,0,1,1],
    [1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1],
    [0,1,0,1,0,0,1,0,1,0],
    [0,0,1,0,0,0,0,1,0,0],
  ]
];

function getCanvas() {
  if (!canvas) {
    canvas = document.getElementById('invaders-canvas');
    ctx = canvas.getContext('2d');
  }
  return canvas;
}

function resize() {
  const c = getCanvas();
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  ship.x = c.width / 2;
  ship.targetX = ship.x;
  ship.y = c.height - 60;
}

// ─── Layout — "the UI owns the center; the theme owns the frame" ────────────
// The 11x5 rack lives in the TOP BAND between the HUD corners. It used to be a
// fixed 3px sprite starting at y=35, which ran to y~195 — straight through
// "TYPE THE LETTER" (persona playtest, 2026-10-29; journal F30's class). The
// prompt panel's border MEASURES 0.177H at 1280x800, so the band ends at 0.160H.
// The sprite pixel is sized from that band (a per-theme const — F30), leaving
// room under the rack for the classic step-down, which is capped at FORM_BOTTOM:
// the invaders march and creep exactly as the cabinet's did, but they can never
// walk down into the panel however long a child takes over a level.
const FORM_TOP = 0.015;
const FORM_BOTTOM = 0.160;
const MARCH_LEFT = 0.115;     // just right of the HUD badge (~0.02–0.105W)
const MARCH_RIGHT = 0.855;    // just left of the HUD stats (~0.866–0.98W)
const ROWS = 5;
let floorY = 0;               // the lowest a rack's bottom edge may creep to (px)

function spawnAliens() {
  aliens = [];
  const cols = 11;
  const rows = ROWS;
  const H = canvas.height;
  const bandH = (FORM_BOTTOM - FORM_TOP) * H;
  // 5 ranks x 8 sprite-px + 4 gaps x 2 sprite-px, using ~85% of the band so the
  // rest is step-down room. Integer pixels; 2 is the legibility floor.
  const px = Math.max(2, Math.floor((bandH * 0.85) / (rows * 8 + (rows - 1) * 2)));
  const alienW = 11 * px;
  const alienH = 8 * px;
  const gapX = Math.round(alienW * 0.36);
  const gapY = 2 * px;
  const totalW = cols * (alienW + gapX) - gapX;
  const startX = (canvas.width - totalW) / 2;
  const startY = H * FORM_TOP;
  floorY = H * FORM_BOTTOM;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const shapeIdx = (row + col) % ALIEN_SHAPES.length;
      const colorIdx = (row * cols + col) % ALIEN_COLORS.length;
      aliens.push({
        x: startX + col * (alienW + gapX),
        y: startY + row * (alienH + gapY),
        baseX: startX + col * (alienW + gapX),
        baseY: startY + row * (alienH + gapY),
        shape: ALIEN_SHAPES[shapeIdx],
        color: ALIEN_COLORS[colorIdx],
        alive: true,
        px: px,
        flash: 0
      });
    }
  }
  marchDir = 1;
  marchSpeed = 0.3;
  dropAmount = 0;
}

function drawAlien(alien) {
  if (!alien.alive) return;
  const color = alien.flash > 0 ? '#ffffff' : alien.color;
  ctx.fillStyle = color;
  const shape = alien.shape;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        ctx.fillRect(alien.x + c * alien.px, alien.y + r * alien.px, alien.px, alien.px);
      }
    }
  }
  if (alien.flash > 0) alien.flash--;
}

function drawLaser(laser) {
  ctx.fillStyle = '#ffff00';
  ctx.shadowColor = '#ffff00';
  ctx.shadowBlur = 6;
  ctx.fillRect(laser.x - 1, laser.y, 3, 14);
  ctx.shadowBlur = 0;
}

// drawExplosion's furthest spark: dist (35) + half its largest square (28/4).
const EXPLOSION_REACH = 42;

function drawExplosion(exp) {
  const progress = exp.frame / exp.maxFrames;
  const alpha = 1 - progress;
  ctx.globalAlpha = alpha;
  const k = exp.scale || 1;
  const size = (4 + progress * 24) * k;
  const numParticles = 8;
  for (let i = 0; i < numParticles; i++) {
    const angle = (i / numParticles) * Math.PI * 2;
    const dist = progress * 35 * k;
    const px = exp.x + Math.cos(angle) * dist;
    const py = exp.y + Math.sin(angle) * dist;
    ctx.fillStyle = i % 2 === 0 ? (exp.color || '#ffff00') : '#ffffff';
    ctx.fillRect(px - size/4, py - size/4, size/2, size/2);
  }
  ctx.globalAlpha = 1;
}

function shoot() {
  if (!active || victoryMode) return;
  const aliveAliens = aliens.filter(a => a.alive);
  if (aliveAliens.length === 0) return;

  const target = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
  const shape = target.shape;
  const targetX = target.x + (shape[0].length * target.px) / 2;
  const targetY = target.y + (shape.length * target.px) / 2;

  lasers.push({
    x: ship.x,
    y: ship.y - 10,
    targetX: targetX,
    targetY: targetY,
    target: target,
    speed: 20
  });

  ship.targetX = targetX;
}

function updateAliens() {
  marchFrame++;
  const aliveAliens = aliens.filter(a => a.alive);
  if (aliveAliens.length === 0) return;

  let leftMost = canvas.width, rightMost = 0, bottomMost = 0;
  aliveAliens.forEach(a => {
    const w = a.shape[0].length * a.px;
    if (a.x < leftMost) leftMost = a.x;
    if (a.x + w > rightMost) rightMost = a.x + w;
    const b = a.y + a.shape.length * a.px;
    if (b > bottomMost) bottomMost = b;
  });

  // March between the HUD corners; step down at each wall, but only while the
  // rack's bottom edge still has room above floorY (see the layout note above).
  const stepRoom = Math.max(0, floorY - bottomMost);
  if (rightMost >= canvas.width * MARCH_RIGHT && marchDir === 1) {
    marchDir = -1;
    dropAmount += Math.min(8, stepRoom);
  } else if (leftMost <= canvas.width * MARCH_LEFT && marchDir === -1) {
    marchDir = 1;
    dropAmount += Math.min(8, stepRoom);
  }

  const killed = aliens.length - aliveAliens.length;
  const speedBoost = 1 + killed * 0.008;

  aliens.forEach(a => {
    if (!a.alive) return;
    a.x += marchDir * marchSpeed * speedBoost;
    if (dropAmount > 0) {
      a.y += 0.5;
    }
  });

  if (dropAmount > 0) dropAmount = Math.max(0, dropAmount - 0.5);
}

function updateShip() {
  const diff = ship.targetX - ship.x;
  ship.x += diff * 0.06;
  ship.x = Math.max(20, Math.min(canvas.width - 20, ship.x));
}

function update() {
  if (victoryMode) {
    victoryShip.speed = Math.min(victoryShip.speed + 0.3, 22);
    victoryShip.x += Math.cos(victoryShip.angle) * victoryShip.speed;
    victoryShip.y += Math.sin(victoryShip.angle) * victoryShip.speed;

    victoryShip.trail.push({ x: victoryShip.x, y: victoryShip.y, life: 30 });

    for (let i = victoryShip.trail.length - 1; i >= 0; i--) {
      victoryShip.trail[i].life--;
      if (victoryShip.trail[i].life <= 0) victoryShip.trail.splice(i, 1);
    }

    for (let i = explosions.length - 1; i >= 0; i--) {
      explosions[i].frame++;
      if (explosions[i].frame >= explosions[i].maxFrames) explosions.splice(i, 1);
    }
    return;
  }

  updateAliens();
  updateShip();

  for (let i = lasers.length - 1; i >= 0; i--) {
    const l = lasers[i];
    const dx = l.targetX - l.x;
    const dy = l.targetY - l.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < l.speed) {
      if (l.target.alive) {
        l.target.alive = false;
        // Keep the whole burst on the canvas: an explosion reaches
        // EXPLOSION_REACH px from its centre, and the top rank sits at 0.015H,
        // so a burst on a top-rank invader used to be sliced off by y=0 (persona
        // playtest, 2026-10-30; journal L34 — budget to the full box, not the
        // anchor). The burst stays ON the invader it hit and is scaled down to
        // the room it has, never moved off it.
        const room = l.targetY - canvas.height * FORM_TOP;
        explosions.push({
          x: l.targetX, y: l.targetY,
          scale: Math.max(0.35, Math.min(1, room / EXPLOSION_REACH)),
          frame: 0, maxFrames: 20,
          color: l.target.color
        });
      }
      lasers.splice(i, 1);
    } else {
      l.x += (dx / dist) * l.speed;
      l.y += (dy / dist) * l.speed;
    }
  }

  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].frame++;
    if (explosions[i].frame >= explosions[i].maxFrames) {
      explosions.splice(i, 1);
    }
  }
}

function drawShip() {
  const x = ship.x;
  const y = ship.y;

  ctx.fillStyle = '#ffff00';
  ctx.shadowColor = '#ffff00';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(x, y - 14);
  ctx.lineTo(x - 10, y + 6);
  ctx.lineTo(x + 10, y + 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(x - 14, y + 6, 28, 5);
  ctx.fillRect(x - 2, y - 18, 4, 6);
  ctx.shadowBlur = 0;
}

function drawVictoryShip() {
  victoryShip.trail.forEach(t => {
    ctx.globalAlpha = t.life / 30;
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 2 + (t.life / 30) * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.translate(victoryShip.x, victoryShip.y);
  ctx.rotate(victoryShip.angle + Math.PI / 2);
  ctx.fillStyle = '#ffff00';
  ctx.shadowColor = '#ffff00';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(-12, 8);
  ctx.lineTo(12, 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-16, 8, 32, 6);
  ctx.fillRect(-2, -22, 4, 8);
  ctx.shadowBlur = 0;
  ctx.restore();
}

function render() {
  if (!active) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (victoryMode) {
    explosions.forEach(drawExplosion);
    drawVictoryShip();
  } else {
    aliens.forEach(drawAlien);
    lasers.forEach(drawLaser);
    explosions.forEach(drawExplosion);
    drawShip();
  }

  update();
  animId = requestAnimationFrame(render);
}

export function start() {
  getCanvas();
  resize();
  active = true;
  victoryMode = false;
  spawnAliens();
  lasers = [];
  explosions = [];
  marchFrame = 0;
  ship.targetX = ship.x;
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  aliens = [];
  lasers = [];
  explosions = [];
}

export function keystroke() {
  if (!active || victoryMode) return;
  shoot();
}

export function patternComplete() {
  if (!active) return false;
  return aliens.length > 0 && aliens.every(a => !a.alive);
}

export function victory() {
  victoryMode = true;
  lasers = [];
  victoryShip.x = ship.x;
  victoryShip.y = ship.y;
  victoryShip.angle = -Math.PI / 2;
  victoryShip.speed = 2;
  victoryShip.trail = [];

  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    explosions.push({
      x: ship.x + Math.cos(angle) * 35,
      y: ship.y + Math.sin(angle) * 25,
      frame: 0,
      maxFrames: 35,
      color: ALIEN_COLORS[i % ALIEN_COLORS.length]
    });
  }

  setTimeout(() => {
    if (victoryMode) {
      victoryShip.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
    }
  }, 600);
  // The takeoff clears the top of the screen in ~1.1s and its trail fades by
  // ~1.6s. Returning the window means the LEVEL COMPLETE card lands as the
  // animation does, instead of after the engine's legacy 4000ms silent hold.
  return VICTORY_MS;
}

export function miss() {}

window.addEventListener('resize', () => {
  if (active) {
    resize();
    if (!victoryMode) spawnAliens();
  }
});
