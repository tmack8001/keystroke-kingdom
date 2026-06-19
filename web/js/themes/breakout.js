const BRICK_ROWS = 3;
const BRICK_COLS = 6;
const BRICK_COLORS = ['#39ff14', '#2ecc40', '#01ff70', '#7fff00'];

let canvas, ctx;
let bricks = [];
let ball = { x: 0, y: 0, dx: 14, dy: -14, radius: 8 };
let paddle = { x: 0, y: 0, w: 90, h: 10 };
let particles = [];
let baseSpeed = 14;
let typingSpeed = 14;
let lastKeystroke = 0;
let drifting = false;
let driftDir = 0;
let animId = null;
let active = false;
let victoryMode = false;

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
  paddle.y = c.height - 60;
  paddle.x = c.width / 2 - paddle.w / 2;
  generateBricks();
  ball.x = c.width / 2;
  ball.y = paddle.y - 20;
}

function generateBricks() {
  bricks = [];
  const brickW = Math.floor((canvas.width - 80) / BRICK_COLS);
  const brickH = 32;
  const offsetX = (canvas.width - BRICK_COLS * brickW) / 2;
  const offsetY = 40;
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: offsetX + c * brickW,
        y: offsetY + r * (brickH + 4),
        w: brickW - 4,
        h: brickH,
        alive: true,
        color: BRICK_COLORS[r % BRICK_COLORS.length]
      });
    }
  }
}

function predictBallX() {
  if (ball.dy < 0) return ball.x;
  let simX = ball.x, simY = ball.y, simDx = ball.dx, simDy = ball.dy;
  let steps = 0;
  while (simY < paddle.y && steps < 200) {
    simX += simDx;
    simY += simDy;
    if (simX - ball.radius < 0 || simX + ball.radius > canvas.width) simDx *= -1;
    steps++;
  }
  return simX;
}

function update() {
  if (victoryMode) {
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].x += particles[i].dx;
      particles[i].y += particles[i].dy;
      particles[i].life--;
      if (particles[i].life <= 0) particles.splice(i, 1);
    }
    return;
  }

  if (drifting) {
    paddle.x += driftDir * 3;
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, paddle.x));
  } else {
    const target = predictBallX() - paddle.w / 2;
    const clamped = Math.max(0, Math.min(canvas.width - paddle.w, target));
    const diff = clamped - paddle.x;
    paddle.x += diff * 0.12;
  }

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) ball.dx *= -1;
  if (ball.y - ball.radius < 0) ball.dy *= -1;

  if (ball.y + ball.radius >= paddle.y && ball.y + ball.radius <= paddle.y + paddle.h) {
    if (ball.x >= paddle.x && ball.x <= paddle.x + paddle.w) {
      ball.dy = -Math.abs(ball.dy);
      const hitPos = (ball.x - paddle.x) / paddle.w - 0.5;
      ball.dx += hitPos * 3;
    }
  }

  if (ball.y > canvas.height + 20) {
    ball.x = canvas.width / 2;
    ball.y = paddle.y - 40;
    ball.dy = -Math.abs(ball.dy);
  }

  bricks.forEach(b => {
    if (!b.alive) return;
    if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + b.w &&
        ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + b.h) {
      b.alive = false;
      ball.dy *= -1;
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: b.x + b.w/2, y: b.y + b.h/2,
          dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4,
          life: 20, color: b.color
        });
      }
    }
  });

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].x += particles[i].dx;
    particles[i].y += particles[i].dy;
    particles[i].life--;
    if (particles[i].life <= 0) particles.splice(i, 1);
  }

  // Ball gradually decelerates when not typing
  const timeSinceKey = Date.now() - lastKeystroke;
  if (timeSinceKey > 2000) {
    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    const minSpeed = 8;
    if (speed > minSpeed) {
      const decay = 0.998;
      ball.dx *= decay;
      ball.dy *= decay;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (victoryMode) {
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 15;
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.shadowBlur = 0;

    particles.forEach(p => {
      ctx.globalAlpha = p.life / 30;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
    });
    ctx.globalAlpha = 1;
    return;
  }

  bricks.forEach(b => {
    if (!b.alive) return;
    ctx.fillStyle = b.color;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
  });
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#39ff14';
  ctx.shadowColor = '#39ff14';
  ctx.shadowBlur = 8;
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#39ff14';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  particles.forEach(p => {
    ctx.globalAlpha = p.life / 30;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  });
  ctx.globalAlpha = 1;
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
  lastKeystroke = Date.now();
  typingSpeed = baseSpeed;
  drifting = false;
  driftDir = 0;
  particles = [];
  ball.dx = baseSpeed * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = -baseSpeed;
  ball.x = canvas.width / 2;
  ball.y = paddle.y - 40;
  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function keystroke() {
  if (!active) return;
  drifting = false;

  const now = Date.now();
  if (lastKeystroke > 0) {
    const delta = now - lastKeystroke;
    typingSpeed = Math.min(24, Math.max(baseSpeed, 2000 / delta));
  }
  lastKeystroke = now;

  const speed = typingSpeed;
  const angle = Math.atan2(ball.dy, ball.dx);
  ball.dx = Math.cos(angle) * speed;
  ball.dy = Math.sin(angle) * speed;
}

export function miss() {
  if (!active) return;
  drifting = true;
  const predicted = predictBallX();
  driftDir = paddle.x + paddle.w / 2 < canvas.width / 2 ? -1 : 1;
  if (Math.abs(predicted - (paddle.x + paddle.w / 2)) < paddle.w) {
    driftDir = predicted > canvas.width / 2 ? -1 : 1;
  }
}

export function patternComplete() {
  if (!active) return false;
  const aliveB = bricks.filter(b => b.alive);
  if (aliveB.length > 0) {
    const target = aliveB[Math.floor(Math.random() * aliveB.length)];
    target.alive = false;
    for (let i = 0; i < 6; i++) {
      particles.push({
        x: target.x + target.w / 2,
        y: target.y + target.h / 2,
        dx: (Math.random() - 0.5) * 6,
        dy: (Math.random() - 0.5) * 6,
        life: 30,
        color: target.color
      });
    }
  }
  return bricks.every(b => !b.alive);
}

export function victory() {
  victoryMode = true;
  ball.dx = 0;
  ball.dy = 0;
  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      life: 60 + Math.random() * 40,
      color: BRICK_COLORS[i % BRICK_COLORS.length]
    });
  }
}

window.addEventListener('resize', () => {
  if (active) resize();
});
