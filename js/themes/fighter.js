let canvas, ctx;
let animId = null;
let active = false;
let victoryMode = false;

let fighter1 = { x: 0, y: 0, action: 'idle', frame: 0, hits: 0 };
let fighter2 = { x: 0, y: 0, action: 'idle', frame: 0, hits: 0 };
let effects = [];
let combo = 0;
let comboTimer = 0;
let lastSide = null;

const LEFT_KEYS = ['a', 's', 'd', 'f'];
const RIGHT_KEYS = ['j', 'k', 'l', ';'];

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
  const groundY = c.height - 80;
  fighter1.x = c.width * 0.25;
  fighter1.y = groundY;
  fighter2.x = c.width * 0.75;
  fighter2.y = groundY;
}

export function keystroke(key) {
  if (!active) return;
  const isLeft = LEFT_KEYS.includes(key);
  const isRight = RIGHT_KEYS.includes(key);
  if (!isLeft && !isRight) return;

  const attacker = isLeft ? fighter1 : fighter2;
  const defender = isLeft ? fighter2 : fighter1;
  const side = isLeft ? 'left' : 'right';

  if (side === lastSide) combo++;
  else combo = 1;
  lastSide = side;
  comboTimer = 90;

  const attacks = ['punch', 'kick', 'uppercut', 'sweep'];
  const attackIdx = (isLeft ? LEFT_KEYS : RIGHT_KEYS).indexOf(key);
  attacker.action = attacks[attackIdx] || 'punch';
  attacker.frame = 12;

  defender.action = 'hit';
  defender.frame = 8;
  defender.hits++;

  const midX = (attacker.x + defender.x) / 2;
  const midY = attacker.y - 30;
  const colors = ['#f0f', '#ff0', '#0ff', '#f60', '#fff'];
  for (let i = 0; i < 5 + combo; i++) {
    effects.push({
      x: midX + (Math.random() - 0.5) * 60,
      y: midY + (Math.random() - 0.5) * 40,
      dx: (Math.random() - 0.5) * 8,
      dy: (Math.random() - 0.5) * 8,
      life: 20 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 3 + Math.random() * 4
    });
  }

  if (combo >= 3) {
    effects.push({
      x: midX, y: midY - 20,
      dx: 0, dy: -0.5,
      life: 40,
      color: '#fff',
      size: 0,
      text: combo + ' HIT COMBO!'
    });
  }
}

export function patternComplete() {
  if (!active) return false;
  const attacker = lastSide === 'left' ? fighter1 : fighter2;
  const defender = lastSide === 'left' ? fighter2 : fighter1;

  attacker.action = 'special';
  attacker.frame = 25;

  const midX = (attacker.x + defender.x) / 2;
  const midY = attacker.y - 40;
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    effects.push({
      x: midX,
      y: midY,
      dx: Math.cos(angle) * 6,
      dy: Math.sin(angle) * 6,
      life: 35,
      color: i % 2 === 0 ? '#f0f' : '#60f',
      size: 5
    });
  }

  combo = 0;
  lastSide = null;

  return fighter1.hits >= 20 || fighter2.hits >= 20;
}

function drawFighter(f, facing) {
  const x = f.x;
  const y = f.y;
  const isLeft = facing === 1;
  const color1 = isLeft ? '#ff6600' : '#0088ff';
  const color2 = isLeft ? '#cc4400' : '#0055cc';

  ctx.fillStyle = color1;
  ctx.fillRect(x - 10, y - 40, 20, 30);
  ctx.fillStyle = '#ffcc88';
  ctx.beginPath();
  ctx.arc(x, y - 50, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color2;
  ctx.fillRect(x - 8, y - 10, 7, 18);
  ctx.fillRect(x + 1, y - 10, 7, 18);

  if (f.action === 'punch' && f.frame > 0) {
    ctx.fillStyle = '#ffcc88';
    ctx.fillRect(x + facing * 10, y - 35, 20 * facing, 6);
  } else if (f.action === 'kick' && f.frame > 0) {
    ctx.fillStyle = color2;
    ctx.fillRect(x + facing * 5, y - 10, 25 * facing, 6);
  } else if (f.action === 'uppercut' && f.frame > 0) {
    ctx.fillStyle = '#ffcc88';
    const lift = Math.min(f.frame, 6) * 3;
    ctx.fillRect(x + facing * 8, y - 40 - lift, 6 * facing, 20);
  } else if (f.action === 'sweep' && f.frame > 0) {
    ctx.fillStyle = color2;
    ctx.fillRect(x - 15, y + 2, 30, 5);
  } else if (f.action === 'special' && f.frame > 0) {
    ctx.fillStyle = '#f0f';
    // The victory pose holds f.frame at a very large value (see victory()),
    // so clamp the animation frame into its intended 0–25 range before it
    // drives alpha/radius — otherwise the aura radius goes negative and the
    // canvas throws IndexSizeError on arc().
    const auraFrame = Math.max(0, Math.min(25, f.frame));
    ctx.globalAlpha = auraFrame / 25;
    ctx.beginPath();
    ctx.arc(x + facing * 30, y - 30, 15 + (25 - auraFrame), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  } else if (f.action === 'hit' && f.frame > 0) {
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x - 12, y - 45, 24, 40);
    ctx.globalAlpha = 1;
  }
}

function drawHealthBar(f, x, align) {
  const barW = 120;
  const barH = 8;
  const bx = align === 'left' ? x : x - barW;
  const by = 30;
  const hpRatio = Math.max(0, 1 - f.hits * 0.05);

  ctx.fillStyle = '#333';
  ctx.fillRect(bx, by, barW, barH);
  ctx.fillStyle = hpRatio > 0.3 ? '#00ff00' : '#ff0000';
  ctx.fillRect(bx, by, barW * hpRatio, barH);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx, by, barW, barH);
}

function drawGround() {
  ctx.fillStyle = '#222';
  ctx.fillRect(0, fighter1.y + 10, canvas.width, canvas.height - fighter1.y);
  ctx.strokeStyle = '#f0f';
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, fighter1.y + 10);
  ctx.lineTo(canvas.width, fighter1.y + 10);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function update() {
  if (victoryMode) {
    for (let i = effects.length - 1; i >= 0; i--) {
      effects[i].x += effects[i].dx;
      effects[i].y += effects[i].dy;
      effects[i].life--;
      if (effects[i].life <= 0) effects.splice(i, 1);
    }
    return;
  }

  if (fighter1.frame > 0) fighter1.frame--;
  else fighter1.action = 'idle';
  if (fighter2.frame > 0) fighter2.frame--;
  else fighter2.action = 'idle';

  if (comboTimer > 0) comboTimer--;
  else combo = 0;

  for (let i = effects.length - 1; i >= 0; i--) {
    effects[i].x += effects[i].dx;
    effects[i].y += effects[i].dy;
    effects[i].life--;
    if (effects[i].life <= 0) effects.splice(i, 1);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGround();
  drawHealthBar(fighter1, 40, 'left');
  drawHealthBar(fighter2, canvas.width - 40, 'right');

  ctx.globalAlpha = 0.8;
  drawFighter(fighter1, 1);
  drawFighter(fighter2, -1);
  ctx.globalAlpha = 1;

  effects.forEach(e => {
    ctx.globalAlpha = e.life / 40;
    if (e.text) {
      ctx.fillStyle = e.color;
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(e.text, e.x, e.y);
    } else {
      ctx.fillStyle = e.color;
      ctx.fillRect(e.x - e.size/2, e.y - e.size/2, e.size, e.size);
    }
  });
  ctx.globalAlpha = 1;

  if (combo >= 2 && comboTimer > 0) {
    ctx.fillStyle = '#f0f';
    ctx.globalAlpha = comboTimer / 90;
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(combo + 'x COMBO', canvas.width / 2, 60);
    ctx.globalAlpha = 1;
  }
}

function render() {
  if (!active) return;
  update();
  draw();
  animId = requestAnimationFrame(render);
}

export function start() {
  getCanvas();
  resize();
  active = true;
  victoryMode = false;
  fighter1.hits = 0;
  fighter2.hits = 0;
  fighter1.action = 'idle';
  fighter2.action = 'idle';
  combo = 0;
  comboTimer = 0;
  lastSide = null;
  effects = [];
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function victory() {
  victoryMode = true;
  const winner = fighter1.hits >= 20 ? fighter2 : fighter1;
  const loser = fighter1.hits >= 20 ? fighter1 : fighter2;
  winner.action = 'special';
  winner.frame = 9999;
  loser.action = 'hit';
  loser.frame = 9999;

  const cx = (winner.x + loser.x) / 2;
  const cy = winner.y - 40;
  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2;
    effects.push({
      x: cx, y: cy,
      dx: Math.cos(angle) * (2 + Math.random() * 4),
      dy: Math.sin(angle) * (2 + Math.random() * 4),
      life: 50 + Math.random() * 30,
      color: i % 3 === 0 ? '#f0f' : i % 3 === 1 ? '#ff0' : '#0ff',
      size: 4 + Math.random() * 4
    });
  }
  effects.push({
    x: cx, y: cy - 30,
    dx: 0, dy: -0.3,
    life: 80,
    color: '#fff',
    size: 0,
    text: 'K.O.!'
  });
}

window.addEventListener('resize', () => {
  if (active) resize();
});
