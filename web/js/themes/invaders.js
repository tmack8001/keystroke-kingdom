let canvas, ctx;
let aliens = [];
let lasers = [];
let explosions = [];
let ship = { x: 0, y: 0, targetX: 0 };
let animId = null;
let active = false;
let victoryMode = false;
let victoryShip = { x: 0, y: 0, angle: 0, speed: 0, trail: [] };

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

function spawnAliens() {
  aliens = [];
  const cols = 11;
  const rows = 5;
  const px = 3;
  const alienW = 11 * px;
  const alienH = 8 * px;
  const gapX = 12;
  const gapY = 10;
  const totalW = cols * (alienW + gapX) - gapX;
  const startX = (canvas.width - totalW) / 2;
  const startY = 35;

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

function drawExplosion(exp) {
  const progress = exp.frame / exp.maxFrames;
  const alpha = 1 - progress;
  ctx.globalAlpha = alpha;
  const size = 4 + progress * 24;
  const numParticles = 8;
  for (let i = 0; i < numParticles; i++) {
    const angle = (i / numParticles) * Math.PI * 2;
    const dist = progress * 35;
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

  let leftMost = canvas.width, rightMost = 0;
  aliveAliens.forEach(a => {
    const w = a.shape[0].length * a.px;
    if (a.x < leftMost) leftMost = a.x;
    if (a.x + w > rightMost) rightMost = a.x + w;
  });

  if (rightMost >= canvas.width - 20 && marchDir === 1) {
    marchDir = -1;
    dropAmount += 8;
  } else if (leftMost <= 20 && marchDir === -1) {
    marchDir = 1;
    dropAmount += 8;
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
        explosions.push({
          x: l.targetX, y: l.targetY,
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
}

export function miss() {}

window.addEventListener('resize', () => {
  if (active) {
    resize();
    if (!victoryMode) spawnAliens();
  }
});
