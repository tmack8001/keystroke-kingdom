let canvas, ctx;
let animId = null;
let active = false;
let victoryMode = false;

const TILE = 24;
let cols, rows;
let maze = [];
let dots = [];
let pellets = [];        // cosmetic corridor pellets (never the win gate)
let completions = 0;     // pattern completions — every 4th is a power-pellet moment
let pac = { x: 0, y: 0, dir: 0, mouthOpen: true, mouthFrame: 0, moving: false, speed: 2 };
let ghosts = [];
let cherries = [];
let particles = [];
let blueTimer = 0;
let lastKeystroke = 0;
let typingSpeed = 2;
let centerZone = { x1: 0, y1: 0, x2: 0, y2: 0 };
let tunnels = [];

const DIRS = [
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: -1 }
];

const GHOST_COLORS = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852', '#ff6600', '#66ff66', '#ff66ff', '#aaaaff'];

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
  cols = Math.floor(c.width / TILE);
  rows = Math.floor(c.height / TILE);
  generateMaze();
}

function isCenter(r, c) {
  return c >= centerZone.x1 && c <= centerZone.x2 && r >= centerZone.y1 && r <= centerZone.y2;
}

function generateMaze() {
  maze = [];
  dots = [];
  cherries = [];
  tunnels = [];

  const marginX = Math.floor(cols * 0.25);
  const marginY = Math.floor(rows * 0.2);
  centerZone = {
    x1: marginX,
    x2: cols - marginX - 1,
    y1: marginY,
    y2: rows - marginY - 1
  };

  for (let r = 0; r < rows; r++) {
    maze[r] = [];
    for (let c = 0; c < cols; c++) {
      if (isCenter(r, c)) {
        maze[r][c] = 2;
      } else if (r === 0 || r === rows-1 || c === 0 || c === cols-1) {
        maze[r][c] = 1;
      } else {
        maze[r][c] = 0;
      }
    }
  }

  for (let r = 2; r < rows - 2; r++) {
    for (let c = 2; c < cols - 2; c++) {
      if (maze[r][c] !== 0) continue;
      if (r % 3 === 0 && c % 4 !== 0 && Math.random() > 0.45) {
        maze[r][c] = 1;
      } else if (c % 4 === 2 && r % 3 !== 0 && Math.random() > 0.55) {
        maze[r][c] = 1;
      }
    }
  }

  for (let r = 2; r < rows - 2; r += 3) {
    for (let c = 1; c < cols - 1; c++) {
      if (maze[r][c] === 0 || maze[r][c] === 1) maze[r][c] = 0;
    }
  }
  for (let c = 2; c < cols - 2; c += 4) {
    for (let r = 1; r < rows - 1; r++) {
      if (maze[r][c] === 0 || maze[r][c] === 1) maze[r][c] = 0;
    }
  }

  for (let r = centerZone.y1 - 1; r <= centerZone.y2 + 1; r++) {
    if (r >= 0 && r < rows) {
      if (centerZone.x1 - 1 >= 0) maze[r][centerZone.x1 - 1] = 0;
      if (centerZone.x2 + 1 < cols) maze[r][centerZone.x2 + 1] = 0;
    }
  }
  for (let c = centerZone.x1 - 1; c <= centerZone.x2 + 1; c++) {
    if (c >= 0 && c < cols) {
      if (centerZone.y1 - 1 >= 0) maze[centerZone.y1 - 1][c] = 0;
      if (centerZone.y2 + 1 < rows) maze[centerZone.y2 + 1][c] = 0;
    }
  }

  const midRow = Math.floor(rows / 2);
  const midCol = Math.floor(cols / 2);
  tunnels.push(
    { fromC: centerZone.x1 - 1, fromR: midRow, toC: centerZone.x2 + 1, toR: midRow },
    { fromC: centerZone.x2 + 1, fromR: midRow, toC: centerZone.x1 - 1, toR: midRow },
    { fromC: midCol, fromR: centerZone.y1 - 1, toC: midCol, toR: centerZone.y2 + 1 },
    { fromC: midCol, fromR: centerZone.y2 + 1, toC: midCol, toR: centerZone.y1 - 1 }
  );
  tunnels.forEach(t => {
    if (t.fromR >= 0 && t.fromR < rows && t.fromC >= 0 && t.fromC < cols) maze[t.fromR][t.fromC] = 0;
    if (t.toR >= 0 && t.toR < rows && t.toC >= 0 && t.toC < cols) maze[t.toR][t.toC] = 0;
  });

  const candidates = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (maze[r][c] === 0) candidates.push({ x: c, y: r });
    }
  }
  const targetDots = 20;
  const shuffled = candidates.sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(targetDots, shuffled.length); i++) {
    dots.push({ x: shuffled[i].x, y: shuffled[i].y, eaten: false });
  }
  spawnPellets();
}

// Cosmetic corridor pellets: Pac-Man visibly munches these as he travels (the
// signature waka-chomp the audit found missing). They are NOT the win gate — the
// 20 `dots` eaten via patternComplete() remain the sole win meter, untouched.
// Bounded (~70) and quietly replenished so the maze never runs dry.
const MAX_PELLETS = 70;
function spawnPellets() {
  pellets = [];
  const taken = new Set(dots.map(d => d.x + ',' + d.y));
  for (let y = 1; y < rows - 1 && pellets.length < MAX_PELLETS; y++) {
    for (let x = 1; x < cols - 1 && pellets.length < MAX_PELLETS; x++) {
      if (maze[y][x] === 0 && !isCenter(y, x) && !taken.has(x + ',' + y)) {
        pellets.push({ x, y, eaten: false, eatenAt: 0 });
      }
    }
  }
}

function spawnGhosts() {
  ghosts = [];
  for (let i = 0; i < 4; i++) {
    const cell = findOpenCell();
    ghosts.push({
      x: cell.x * TILE + TILE/2,
      y: cell.y * TILE + TILE/2,
      dir: Math.floor(Math.random() * 4),
      color: GHOST_COLORS[i],
      blue: false,
      eaten: false,
      respawnTimer: 0,
      flinch: 0        // brief wrong-key "flinch" frames (miss() ambient response)
    });
  }
}

function findOpenCell() {
  let x, y, attempts = 0;
  do {
    x = Math.floor(Math.random() * (cols - 2)) + 1;
    y = Math.floor(Math.random() * (rows - 2)) + 1;
    attempts++;
  } while ((maze[y][x] !== 0 || isCenter(y, x)) && attempts < 500);
  return { x, y };
}

function isWalkable(px, py) {
  const c = Math.floor(px / TILE);
  const r = Math.floor(py / TILE);
  if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
  return maze[r][c] === 0;
}

function canMove(px, py, dir) {
  const d = DIRS[dir];
  const nx = px + d.dx * TILE;
  const ny = py + d.dy * TILE;
  return isWalkable(nx, ny);
}

function pickNewDir(px, py, currentDir) {
  const options = [];
  for (let i = 0; i < 4; i++) {
    if (i !== (currentDir + 2) % 4) {
      const tileX = Math.round(px / TILE);
      const tileY = Math.round(py / TILE);
      if (canMove(tileX * TILE, tileY * TILE, i)) {
        options.push(i);
      }
    }
  }
  if (options.length === 0) return (currentDir + 2) % 4;
  return options[Math.floor(Math.random() * options.length)];
}

function pickDirToward(px, py, targetX, targetY, currentDir) {
  const options = [];
  for (let i = 0; i < 4; i++) {
    if (i !== (currentDir + 2) % 4) {
      const tileX = Math.round(px / TILE);
      const tileY = Math.round(py / TILE);
      if (canMove(tileX * TILE, tileY * TILE, i)) {
        options.push(i);
      }
    }
  }
  if (options.length === 0) return (currentDir + 2) % 4;

  const scored = options.map(dir => {
    const d = DIRS[dir];
    const nx = px + d.dx * TILE;
    const ny = py + d.dy * TILE;
    const dist = Math.abs(nx - targetX) + Math.abs(ny - targetY);
    return { dir, dist };
  });
  scored.sort((a, b) => a.dist - b.dist);

  // 60% chance to pick the best direction, otherwise random
  if (Math.random() < 0.6) return scored[0].dir;
  return options[Math.floor(Math.random() * options.length)];
}

function checkTunnel(entity) {
  const tileC = Math.round(entity.x / TILE);
  const tileR = Math.round(entity.y / TILE);
  for (const t of tunnels) {
    if (tileC === t.fromC && tileR === t.fromR) {
      const d = DIRS[entity.dir];
      const nextC = tileC + d.dx;
      const nextR = tileR + d.dy;
      if (isCenter(nextR, nextC) || nextC < 0 || nextC >= cols || nextR < 0 || nextR >= rows) {
        entity.x = t.toC * TILE;
        entity.y = t.toR * TILE;
        return true;
      }
    }
  }
  return false;
}

export function keystroke() {
  if (!active) return;
  const now = Date.now();
  if (lastKeystroke > 0) {
    const delta = now - lastKeystroke;
    typingSpeed = Math.min(7, Math.max(2, 900 / delta));
  }
  lastKeystroke = now;
  pac.speed = typingSpeed;
  pac.moving = true;
}

// Wrong-key ambient response. Grounded in the Pac-Man wiki's documented iconic
// mechanic — "Power Pellets reversing the chase dynamic" (research/wiki/games/pac-man.md):
// a single nearby ghost gives a comic little double-take, flipping around the way every
// ghost does the instant a power pellet is eaten, with a brief frightened-blue flinch.
// Gentle, harmless, tiny: it touches ONE ghost, never the win gate, never the letter,
// and settles in a few frames so rapid mistakes can't stack into chaos.
export function miss() {
  if (!active || victoryMode) return;
  // Nearest non-eaten ghost to Pac-Man does the double-take.
  let target = null, best = Infinity;
  const pcx = pac.x + TILE / 2, pcy = pac.y + TILE / 2;
  ghosts.forEach(g => {
    if (g.eaten) return;
    const dist = Math.abs(g.x - pcx) + Math.abs(g.y - pcy);
    if (dist < best) { best = dist; target = g; }
  });
  if (!target) return;
  target.dir = (target.dir + 2) % 4;   // reverse — the power-pellet flip
  target.flinch = Math.min(24, target.flinch + 24);  // clamped; can't accumulate
}

export function patternComplete() {
  if (!active) return false;

  // Power-pellet moment every 4th completion only — the audit found ghosts blue
  // near-constantly (early patterns are 1-2 keys, so per-completion frightening
  // erased the classic red/pink/cyan/orange identities the wiki documents).
  completions++;
  if (completions % 4 === 0) {
    blueTimer = 200;
    ghosts.forEach(g => { if (!g.eaten) g.blue = true; });
  }

  const d = DIRS[pac.dir];
  let cherryX = Math.round(pac.x / TILE) + d.dx * 2;
  let cherryY = Math.round(pac.y / TILE) + d.dy * 2;
  if (cherryX < 1) cherryX = 1;
  if (cherryX >= cols - 1) cherryX = cols - 2;
  if (cherryY < 1) cherryY = 1;
  if (cherryY >= rows - 1) cherryY = rows - 2;
  if (maze[cherryY] && maze[cherryY][cherryX] === 0) {
    cherries.push({ x: cherryX, y: cherryY, eaten: false, spawnTime: Date.now() });
  }

  let nearestDot = null;
  let nearestDist = Infinity;
  const pacTileX = Math.round(pac.x / TILE);
  const pacTileY = Math.round(pac.y / TILE);
  dots.forEach(d => {
    if (d.eaten) return;
    const dist = Math.abs(d.x - pacTileX) + Math.abs(d.y - pacTileY);
    if (dist < nearestDist) { nearestDist = dist; nearestDot = d; }
  });
  if (nearestDot) {
    nearestDot.eaten = true;
    particles.push({ x: nearestDot.x * TILE + TILE/2, y: nearestDot.y * TILE + TILE/2, frame: 0, maxFrames: 15, color: '#6cf' });
  }

  if (Math.random() > 0.3) {
    pac.dir = pickNewDir(pac.x, pac.y, pac.dir);
  }

  return dots.every(d => d.eaten);
}

function updatePac() {
  if (!pac.moving) return;

  const timeSinceKey = Date.now() - lastKeystroke;
  if (timeSinceKey > 1500) {
    pac.speed = Math.max(0.5, pac.speed - 0.02);
    if (pac.speed <= 0.5) pac.moving = false;
  }

  const d = DIRS[pac.dir];
  const nx = pac.x + d.dx * pac.speed;
  const ny = pac.y + d.dy * pac.speed;

  const checkX = nx + d.dx * (TILE * 0.6);
  const checkY = ny + d.dy * (TILE * 0.6);
  if (isWalkable(checkX, checkY)) {
    pac.x = nx;
    pac.y = ny;
  } else {
    pac.x = Math.round(pac.x / TILE) * TILE;
    pac.y = Math.round(pac.y / TILE) * TILE;
    if (!checkTunnel(pac)) {
      pac.dir = pickNewDir(pac.x, pac.y, pac.dir);
    }
  }

  if (pac.x < 0) pac.x = (cols-2) * TILE;
  if (pac.x > (cols-1) * TILE) pac.x = TILE;
  if (pac.y < 0) pac.y = (rows-2) * TILE;
  if (pac.y > (rows-1) * TILE) pac.y = TILE;

  checkTunnel(pac);

  // Munch corridor pellets on contact — the visible waka-chomp. Eaten pellets
  // quietly respawn after ~12s so the maze never runs dry (cosmetic only).
  pellets.forEach(p => {
    if (p.eaten) {
      if (Date.now() - p.eatenAt > 12000) p.eaten = false;
      return;
    }
    const dist = Math.abs(p.x * TILE - pac.x) + Math.abs(p.y * TILE - pac.y);
    if (dist < TILE * 0.7) {
      p.eaten = true;
      p.eatenAt = Date.now();
      particles.push({ x: p.x * TILE + TILE/2, y: p.y * TILE + TILE/2, frame: 0, maxFrames: 12, color: '#ffd9a8' });
    }
  });

  for (let i = cherries.length - 1; i >= 0; i--) {
    const ch = cherries[i];
    if (ch.eaten) continue;
    const dist = Math.abs(ch.x * TILE - pac.x) + Math.abs(ch.y * TILE - pac.y);
    if (dist < TILE) {
      ch.eaten = true;
      particles.push({ x: ch.x * TILE + TILE/2, y: ch.y * TILE + TILE/2, frame: 0, maxFrames: 20, color: '#ff0000' });
    }
  }
  cherries = cherries.filter(ch => !ch.eaten || Date.now() - ch.spawnTime < 8000);

  ghosts.forEach(g => {
    if (g.eaten || !g.blue) return;
    const dist = Math.sqrt((g.x - pac.x - TILE/2)**2 + (g.y - pac.y - TILE/2)**2);
    if (dist < TILE * 1.6) {
      g.eaten = true;
      g.respawnTimer = 300;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        particles.push({
          x: g.x + Math.cos(angle) * 4,
          y: g.y + Math.sin(angle) * 4,
          frame: 0, maxFrames: 25,
          color: i % 2 === 0 ? g.color : '#ffffff'
        });
      }
    }
  });

  pac.mouthFrame++;
  if (pac.mouthFrame > 5) {
    pac.mouthFrame = 0;
    pac.mouthOpen = !pac.mouthOpen;
  }
}

function updateGhosts() {
  if (blueTimer > 0) {
    blueTimer--;
    if (blueTimer === 0) {
      ghosts.forEach(g => g.blue = false);
    }
  }

  ghosts.forEach(g => {
    if (g.flinch > 0) g.flinch--;
    if (g.eaten) {
      g.respawnTimer--;
      if (g.respawnTimer <= 0) {
        g.eaten = false;
        g.blue = false;
        const cell = findOpenCell();
        g.x = cell.x * TILE + TILE/2;
        g.y = cell.y * TILE + TILE/2;
      }
      return;
    }

    const speed = g.blue ? 1.8 : 1.5;
    const d = DIRS[g.dir];
    const nx = g.x + d.dx * speed;
    const ny = g.y + d.dy * speed;

    const checkX = nx + d.dx * (TILE * 0.6);
    const checkY = ny + d.dy * (TILE * 0.6);
    if (isWalkable(checkX, checkY)) {
      g.x = nx;
      g.y = ny;
    } else {
      g.x = Math.round(g.x / TILE) * TILE + TILE/2;
      g.y = Math.round(g.y / TILE) * TILE + TILE/2;
      if (!checkTunnel(g)) {
        if (g.blue) {
          g.dir = pickDirToward(g.x, g.y, pac.x + TILE/2, pac.y + TILE/2, g.dir);
        } else {
          g.dir = pickNewDir(g.x, g.y, g.dir);
        }
      }
    }

    checkTunnel(g);

    if (g.blue) {
      if (Math.random() < 0.04) {
        g.dir = pickDirToward(g.x, g.y, pac.x + TILE/2, pac.y + TILE/2, g.dir);
      }
    } else if (Math.random() < 0.015) {
      g.dir = pickNewDir(g.x, g.y, g.dir);
    }
  });
}

function drawMaze() {
  ctx.strokeStyle = '#2266aa';
  ctx.lineWidth = 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (maze[r][c] !== 1) continue;
      const x = c * TILE;
      const y = r * TILE;
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 2, TILE - 4, TILE - 4, 3);
      ctx.stroke();
    }
  }

  ctx.strokeStyle = '#1144aa';
  ctx.lineWidth = 3;
  const zx = centerZone.x1 * TILE;
  const zy = centerZone.y1 * TILE;
  const zw = (centerZone.x2 - centerZone.x1 + 1) * TILE;
  const zh = (centerZone.y2 - centerZone.y1 + 1) * TILE;
  ctx.strokeRect(zx, zy, zw, zh);

  ctx.strokeStyle = '#4488cc';
  ctx.setLineDash([4, 4]);
  tunnels.forEach(t => {
    const fx = t.fromC * TILE + TILE/2;
    const fy = t.fromR * TILE + TILE/2;
    ctx.beginPath();
    ctx.arc(fx, fy, TILE/3, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.setLineDash([]);
}

function drawDots() {
  // Win-gate dots AND cosmetic corridor pellets both render as classic pale-peach
  // pellets (the wiki-cited look — dots must READ against the blue maze; the old
  // #6cf blended into the walls, which is exactly what the fidelity audit flagged).
  ctx.fillStyle = '#ffd9a8';
  dots.forEach(d => {
    if (d.eaten) return;
    ctx.beginPath();
    ctx.arc(d.x * TILE + TILE/2, d.y * TILE + TILE/2, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  pellets.forEach(p => {
    if (p.eaten) return;
    ctx.beginPath();
    ctx.arc(p.x * TILE + TILE/2, p.y * TILE + TILE/2, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawCherries() {
  cherries.forEach(ch => {
    if (ch.eaten) return;
    const cx = ch.x * TILE + TILE/2;
    const cy = ch.y * TILE + TILE/2;
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(cx - 3, cy + 3, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 3, cy + 3, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff8888';
    ctx.beginPath();
    ctx.arc(cx - 4, cy + 1, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00cc00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 1, cy - 2);
    ctx.quadraticCurveTo(cx + 1, cy - 9, cx + 5, cy - 7);
    ctx.stroke();
    ctx.fillStyle = '#00cc00';
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy - 8, 3, 2, 0.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawPac() {
  const cx = pac.x + TILE/2;
  const cy = pac.y + TILE/2;
  const radius = TILE/2;
  const mouthAngle = pac.mouthOpen ? 0.4 : 0.05;

  const angles = [0, Math.PI/2, Math.PI, Math.PI * 1.5];
  const baseAngle = angles[pac.dir] || 0;

  ctx.fillStyle = '#ffff00';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, radius, baseAngle + mouthAngle, baseAngle + Math.PI * 2 - mouthAngle);
  ctx.closePath();
  ctx.fill();

  const eyeAngle = baseAngle - 0.6;
  const eyeDist = radius * 0.4;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(cx + Math.cos(eyeAngle) * eyeDist, cy + Math.sin(eyeAngle) * eyeDist, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawGhosts() {
  ghosts.forEach(g => {
    if (g.eaten) return;
    // A brief wrong-key flinch tints the ghost toward its own frightened-blue for a
    // few frames (the power-pellet palette, softened) — never the full frighten state.
    let color;
    if (g.blue) {
      color = (blueTimer < 60 && blueTimer % 10 < 5) ? '#ffffff' : '#2222ff';
    } else if (g.flinch > 0) {
      color = (g.flinch % 8 < 4) ? '#5a6cff' : g.color;
    } else {
      color = g.color;
    }
    const x = g.x;
    const y = g.y;
    const r = TILE/2;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y - 2, r, Math.PI, 0);
    ctx.lineTo(x + r, y + r);
    const waves = 4;
    for (let i = 0; i < waves; i++) {
      const bx1 = x + r - (i * r * 2 / waves);
      const bx2 = x + r - ((i + 1) * r * 2 / waves);
      ctx.quadraticCurveTo((bx1 + bx2) / 2, y + r + 4, bx2, y + r);
    }
    ctx.closePath();
    ctx.fill();

    if (!g.blue) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x - 4, y - 3, 4, 0, Math.PI * 2);
      ctx.arc(x + 4, y - 3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#00f';
      ctx.beginPath();
      ctx.arc(x - 3, y - 3, 2, 0, Math.PI * 2);
      ctx.arc(x + 5, y - 3, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - 5, y - 4, 3, 3);
      ctx.fillRect(x + 2, y - 4, 3, 3);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 5, y + 3);
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(x - 5 + i * 3, y + (i % 2 === 0 ? 3 : 5));
      }
      ctx.stroke();
    }
  });
}

function drawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    const progress = p.frame / p.maxFrames;
    ctx.globalAlpha = 1 - progress;
    const size = 4 + progress * 14;
    for (let j = 0; j < 8; j++) {
      const angle = (j / 8) * Math.PI * 2 + progress * 3;
      const dist = progress * 20;
      ctx.fillStyle = p.color;
      ctx.fillRect(
        p.x + Math.cos(angle) * dist - size/4,
        p.y + Math.sin(angle) * dist - size/4,
        size/2, size/2
      );
    }
    ctx.globalAlpha = 1;
    p.frame++;
    if (p.frame >= p.maxFrames) particles.splice(i, 1);
  }
}

function render() {
  if (!active) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 0.5;
  drawMaze();
  ctx.globalAlpha = 0.7;
  drawDots();
  ctx.globalAlpha = 0.9;
  drawCherries();
  drawPac();
  if (!victoryMode) drawGhosts();
  ctx.globalAlpha = 1;
  drawParticles();

  if (!victoryMode) {
    updatePac();
    updateGhosts();
  }

  animId = requestAnimationFrame(render);
}

export function start() {
  getCanvas();
  resize();
  active = true;
  victoryMode = false;
  lastKeystroke = 0;
  typingSpeed = 2;
  blueTimer = 0;
  completions = 0;
  particles = [];
  cherries = [];

  const cell = findOpenCell();
  pac.x = cell.x * TILE;
  pac.y = cell.y * TILE;
  pac.dir = 0;
  pac.moving = false;
  pac.speed = 2;
  pac.mouthOpen = true;
  pac.mouthFrame = 0;

  spawnGhosts();
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function victory() {
  victoryMode = true;
  pac.moving = false;
  pac.mouthOpen = true;
  ghosts = [];
  for (let i = 0; i < 12; i++) {
    particles.push({
      x: pac.x + TILE / 2 + (Math.random() - 0.5) * 40,
      y: pac.y + TILE / 2 + (Math.random() - 0.5) * 40,
      frame: 0,
      maxFrames: 50 + Math.random() * 30,
      color: i % 3 === 0 ? '#ffff00' : i % 3 === 1 ? '#6cf' : '#ffffff'
    });
  }
}

window.addEventListener('resize', () => {
  if (active) resize();
});
