// Level 5: Joust (Williams, 1982)

let canvas, ctx;
let vultures = [], eggs = [], trail = [];
let platforms = [], flames = [];
let LAVA_Y = 0;
let frame = 0, animId = null, active = false, victoryMode = false;
let wavesCleared = 0, respawnTimer = -1, score = 0;
let homingTarget = null, homingFrames = 0;
let playerAttackTimer = 0;  // collision only active after a keystroke

// ─── Victory celebration ("the victory lap") ────────────────────────────────────
const VICTORY_MS = 3500;
let victoryStartMs = 0;
let bursts = [];        // score-flourish egg-bursts ("+500")
let sparks = [];        // additive spark particles (L35)
let landPose = false;   // knight has landed proud
let lastBurstAt = 0;

// Pterodactyl
const P_INACTIVE = 0, P_FLYING = 1, P_DYING = 2;
let pteroState = P_INACTIVE, ptero = null, pteroCount = 0, pteroTimer = -1;

// Lava troll
const T_HIDDEN = 0, T_RISING = 1, T_VISIBLE = 2, T_SINKING = 3;
let trollState = T_HIDDEN, trollX = 0, trollY = 0;
let trollRise = 0, trollVisTimer = 0, trollCount = 0, trollTimer = -1;

const WAVES_TO_WIN = 3, VULTURES_PER_WAVE = 4;
const VPX = 4, VULT_W = 5*VPX, VULT_H = 5*VPX;
const PKX = 4, PKW = 7*PKX, PKH = 7*PKX;
const PPX = 3, PTERO_W = 9*PPX, PTERO_H = 5*PPX;
const TPX = 5, TROLL_W = 5*TPX, TROLL_H = 8*TPX;
const LANCE_LEN = 44, LANCE_Y_OFF = 4;
const BODY_R_FLY = 24, BODY_R_PERCH = 32, TIP_R_FLY = 22, TIP_R_PERCH = 30;
const PTERO_HIT_R = 26;
const MAX_TROLL = 2, MAX_PTERO = 2;
const WAVE_COLORS = ['#33cc33', '#4499ff', '#cc8833'];
const FLYING = 'flying', LANDING = 'landing', PERCHED = 'perched';

let player = {
  x:0, y:0, vx:0, vy:0,
  wingFrame:0, wingTimer:8, boostTimer:0,
  facingLeft:false, target:null, grounded:false,
};

// ─── Sprites ──────────────────────────────────────────────────────────────────

const PLAYER_WINGS_UP = [
  [0,0,1,1,1,0,0],
  [0,0,1,1,1,0,0],
  [1,1,1,1,1,1,1],
  [0,0,1,1,1,0,0],
  [0,0,0,1,0,0,0],
  [0,1,1,1,0,0,0],
  [0,1,0,1,0,0,0],
];
const PLAYER_WINGS_DOWN = [
  [0,0,1,1,1,0,0],
  [0,0,1,1,1,0,0],
  [0,1,1,1,1,1,0],
  [1,0,1,1,1,0,1],
  [0,0,0,1,0,0,0],
  [0,1,1,1,0,0,0],
  [0,1,0,1,0,0,0],
];
// Proud landed pose — ostrich rearing, wings thrown wide (victory)
const PLAYER_WINGS_SPREAD = [
  [1,0,0,1,0,0,1],
  [0,1,1,1,1,1,0],
  [1,1,1,1,1,1,1],
  [0,0,1,1,1,0,0],
  [0,0,0,1,0,0,0],
  [0,1,1,1,0,0,0],
  [0,1,0,1,1,0,0],
];
const VULT_UP = [
  [0,1,0,1,0],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0],[0,1,0,1,0],
];
const VULT_DOWN = [
  [1,0,1,0,1],[0,1,1,1,0],[0,1,1,1,0],[0,0,1,0,0],[1,0,0,0,1],
];
// Pterodactyl 9x5 — beak on right side (flip when flying left)
const PTERO_UP = [
  [1,0,0,0,0,0,0,0,1],
  [1,1,0,0,0,0,0,1,1],
  [0,1,1,1,1,1,1,1,0],
  [0,0,0,1,1,1,0,0,0],
  [0,0,0,0,0,1,1,0,0],
];
const PTERO_DOWN = [
  [0,0,0,0,0,0,0,0,0],
  [1,0,1,0,0,0,1,0,1],
  [1,1,1,1,1,1,1,1,1],
  [0,0,0,1,1,1,0,0,0],
  [0,0,0,0,0,1,1,0,0],
];
// Lava troll 5x8
const TROLL_SP = [
  [0,1,1,1,0],
  [1,1,1,1,1],
  [0,1,0,1,0],
  [0,0,1,0,0],
  [1,1,1,1,1],
  [1,0,1,0,1],
  [0,1,1,1,0],
  [1,0,1,0,1],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLanceTip() {
  const y = player.y + LANCE_Y_OFF + 2;
  return player.facingLeft
    ? { x: player.x - LANCE_LEN - 6, y }
    : { x: player.x + PKW + LANCE_LEN + 6, y };
}

function getCanvas() {
  if (!canvas) { canvas = document.getElementById('invaders-canvas'); ctx = canvas.getContext('2d'); }
  return canvas;
}

function resize() {
  const c = getCanvas();
  c.width = window.innerWidth; c.height = window.innerHeight;
  // Lava at bottom — sits below the keyboard guide UI overlay (same as other themes)
  LAVA_Y = Math.floor(c.height * 0.82);
  const W = c.width;
  // 7 platforms — spread across the visible play area
  // Edge platforms — don't conflict with centered typing UI
  // Two wide cross-screen platforms above/below the UI (like authentic Joust layout)
  const topPlatY  = Math.floor(c.height * 0.11);   // above "TYPE THE LETTER" — leave space at top
  const botPlatY  = LAVA_Y - 28;                   // just above lava, below keyboard guide
  platforms = [
    // Wide spanning platforms (real Joust style) — narrow enough to leave clear gaps at sides
    { x: Math.floor(W * 0.225), y: topPlatY,   w: Math.floor(W * 0.55) },  // top-wide
    { x: Math.floor(W * 0.21),  y: botPlatY,   w: Math.floor(W * 0.58) },  // bottom-wide (lava bank)
    // Edge side platforms
    { x: 0,       y: LAVA_Y - 55,  w: 175 },  // left shelf
    { x: W - 175, y: LAVA_Y - 55,  w: 175 },  // right shelf
    { x: 30,      y: LAVA_Y - 205, w: 170 },  // left-mid  ← player start
    { x: W - 200, y: LAVA_Y - 225, w: 170 },  // right-mid
    { x: 55,      y: LAVA_Y - 395, w: 150 },  // left-high
    { x: W - 205, y: LAVA_Y - 415, w: 150 },  // right-high
  ];
  flames = [];
  const n = Math.floor(W / 28);
  for (let i = 0; i < n; i++)
    flames.push({ x: (i + 0.5) * (W / n), phase: Math.random() * Math.PI * 2 });
  // Start on left-mid (platforms[2]) — visibly above the keyboard guide
  const shelf = platforms[2];
  player.x = shelf.x + 40; player.y = shelf.y - PKH;
  player.vx = 0; player.vy = 0; player.grounded = true;
  player.facingLeft = false; player.target = null;
  trail = []; homingTarget = null; homingFrames = 0;
  trollY = LAVA_Y;
}

// ─── Spawning ─────────────────────────────────────────────────────────────────

function spawnVultures() {
  vultures = []; eggs = [];
  homingTarget = null; homingFrames = 0;
  const col = WAVE_COLORS[wavesCleared % WAVE_COLORS.length];
  const pool = [...platforms];
  for (let i = 0; i < VULTURES_PER_WAVE; i++) {
    if (i < 3 && pool.length) {
      const pi = Math.floor(Math.random() * pool.length);
      const p  = pool.splice(pi, 1)[0];
      vultures.push({
        x: p.x + 20 + Math.random() * Math.max(0, p.w - 40 - VULT_W),
        y: p.y - VULT_H, vx: 0, vy: 0,
        state: PERCHED, targetPlatform: p,
        perchTimer: 120 + Math.floor(Math.random() * 150), flyTimer: 0,
        wingFrame: i%2, wingTimer: 22, alive: true, color: col,
      });
    } else {
      const spd = 0.5 + Math.random() * 0.5, W = canvas.width;
      vultures.push({
        x: W*0.35 + Math.random() * W*0.5,
        y: 60 + Math.random() * LAVA_Y * 0.4,
        vx: (Math.random()-0.5) * spd * 2, vy: (Math.random()-0.5) * spd,
        state: FLYING, targetPlatform: null, perchTimer: 0,
        flyTimer: 90 + Math.floor(Math.random() * 80),
        wingFrame: i%2, wingTimer: 8, alive: true, color: col,
      });
    }
  }
}

function spawnPterodactyl() {
  if (pteroState !== P_INACTIVE || pteroCount >= MAX_PTERO) return;
  const goRight = Math.random() < 0.5, W = canvas.width;
  ptero = {
    x: goRight ? -PTERO_W - 8 : W + 8,
    baseY: 60 + Math.random() * LAVA_Y * 0.42,
    y: 0, vy: 0,
    vx: goRight ? 3.8 : -3.8,
    phase: 0, wingFrame: 0, wingTimer: 8,
    facingLeft: !goRight,
  };
  ptero.y = ptero.baseY;
  pteroState = P_FLYING;
  pteroCount++;
}

// ─── AI ───────────────────────────────────────────────────────────────────────

function updateVultures() {
  const maxSpd = 1.2 + wavesCleared * 0.1;
  vultures.forEach(v => {
    if (!v.alive) return;
    if (v.state === FLYING) {
      v.x += v.vx; v.y += v.vy;
      if (v.x < -VULT_W)        v.x += canvas.width + VULT_W;
      if (v.x > canvas.width)    v.x -= canvas.width + VULT_W;
      if (v.y < 18)              { v.y = 18; v.vy = Math.abs(v.vy); }
      if (v.y+VULT_H > LAVA_Y-8){ v.y = LAVA_Y-8-VULT_H; v.vy = -Math.abs(v.vy); }
      const spd = Math.hypot(v.vx, v.vy);
      if (spd > maxSpd) { v.vx = v.vx/spd*maxSpd; v.vy = v.vy/spd*maxSpd; }
      if (--v.wingTimer <= 0) { v.wingFrame ^= 1; v.wingTimer = 7 + (Math.random()*5|0); }
      if (--v.flyTimer <= 0) {
        // Pick a platform below the vulture, but never the one the player is standing on
        const playerPlatY = player.grounded ? (player.y + PKH) : -9999;
        const below = platforms.filter(p =>
          p.y > v.y + 5 && Math.abs(p.y - playerPlatY) > 12
        );
        if (below.length) {
          v.targetPlatform = below[Math.floor(Math.random() * below.length)];
          v.state = LANDING; v.vy = 1.5;
          v.vx = (v.targetPlatform.x + v.targetPlatform.w/2 - VULT_W/2 - v.x) / 40;
        }
        v.flyTimer = 90 + (Math.random()*80|0);
      }
    } else if (v.state === LANDING) {
      v.x += v.vx; v.y += v.vy;
      if (v.x < -VULT_W)    v.x += canvas.width + VULT_W;
      if (v.x > canvas.width) v.x -= canvas.width + VULT_W;
      if (--v.wingTimer <= 0) { v.wingFrame ^= 1; v.wingTimer = 12; }
      if (v.targetPlatform && v.y+VULT_H >= v.targetPlatform.y) {
        v.y = v.targetPlatform.y - VULT_H; v.vx = 0; v.vy = 0;
        v.state = PERCHED; v.perchTimer = 160 + (Math.random()*180|0);
      }
      // Missed the platform before reaching lava — go back to flying, never perch in mid-air
      if (v.y+VULT_H > LAVA_Y-5) {
        v.y = LAVA_Y-8-VULT_H; v.state = FLYING;
        v.vy = -(0.8 + Math.random()); v.vx = (Math.random()-0.5)*1.4;
        v.flyTimer = 60 + (Math.random()*60|0);
      }
    } else {
      if (--v.wingTimer <= 0) { v.wingFrame ^= 1; v.wingTimer = 26; }
      if (--v.perchTimer <= 0) {
        v.state = FLYING; v.vy = -(0.8 + Math.random()); v.vx = (Math.random()-0.5)*1.4;
        v.flyTimer = 90 + (Math.random()*80|0);
      }
    }
  });
}

function updatePterodactyl() {
  if (pteroTimer > 0 && frame >= pteroTimer && pteroState === P_INACTIVE)
    spawnPterodactyl();
  if (!ptero) return;
  if (pteroState === P_FLYING) {
    ptero.x += ptero.vx; ptero.phase += 0.038;
    ptero.y = ptero.baseY + Math.sin(ptero.phase) * 55;
    if (--ptero.wingTimer <= 0) { ptero.wingFrame ^= 1; ptero.wingTimer = 7; }
    const W = canvas.width;
    if ((ptero.vx > 0 && ptero.x > W+10) || (ptero.vx < 0 && ptero.x < -PTERO_W-10)) {
      pteroState = P_INACTIVE; ptero = null;
      if (pteroCount < MAX_PTERO) pteroTimer = frame + 300 + (Math.random()*200|0);
    }
  } else if (pteroState === P_DYING) {
    ptero.y += ptero.vy; ptero.vy += 0.4; ptero.x += ptero.vx * 0.6;
    if (ptero.y > LAVA_Y) {
      pteroState = P_INACTIVE; ptero = null;
      if (pteroCount < MAX_PTERO) pteroTimer = frame + 360 + (Math.random()*240|0);
    }
  }
}

function playerNearTroll() {
  if (trollState === T_HIDDEN) return false;
  return Math.abs(player.x + PKW/2 - (trollX + TROLL_W/2)) < 160
    || player.y > LAVA_Y - 150;
}

function updateLavaTroll() {
  const RISE = 0.9, SINK = 1.5;
  if (trollTimer > 0 && frame >= trollTimer && trollState === T_HIDDEN && trollCount < MAX_TROLL) {
    if (player.y < LAVA_Y - 220) {
      const W = canvas.width;
      let tx = TROLL_W + Math.random() * (W - TROLL_W*2);
      for (let a = 0; a < 6; a++) {
        const t2 = TROLL_W + Math.random() * (W - TROLL_W*2);
        if (Math.abs(t2 - (player.x + PKW/2)) > 240) { tx = t2; break; }
      }
      trollX = tx - TROLL_W/2; trollRise = 0; trollY = LAVA_Y;
      trollState = T_RISING; trollCount++;
    } else {
      trollTimer = frame + 120;
    }
  }
  switch (trollState) {
    case T_RISING:
      trollRise = Math.min(trollRise + RISE, TROLL_H);
      trollY = LAVA_Y - trollRise;
      if (trollRise >= TROLL_H) { trollState = T_VISIBLE; trollVisTimer = 300; }
      if (playerNearTroll()) trollState = T_SINKING;
      break;
    case T_VISIBLE:
      if (playerNearTroll() || --trollVisTimer <= 0) trollState = T_SINKING;
      break;
    case T_SINKING:
      trollRise = Math.max(trollRise - SINK, 0);
      trollY = LAVA_Y - trollRise;
      if (trollRise <= 0) {
        trollState = T_HIDDEN;
        if (trollCount < MAX_TROLL) trollTimer = frame + 420 + (Math.random()*360|0);
      }
      break;
  }
}

function updatePlayer() {
  if (homingFrames > 0 && homingTarget && homingTarget.alive) {
    const dx = (homingTarget.x+VULT_W/2)-(player.x+PKW/2);
    const dy = (homingTarget.y+VULT_H/2)-(player.y+PKH/2);
    const d  = Math.hypot(dx, dy) || 1;
    player.vx += (dx/d)*(homingFrames/60)*1.3;
    player.vy += (dy/d)*(homingFrames/60)*1.3;
    homingFrames--;
  }
  if (!player.grounded) player.vy += 0.10;
  player.vx *= player.grounded ? 0.82 : 0.94;
  player.vy *= 0.94;
  const spd = Math.hypot(player.vx, player.vy);
  if (spd > 16) { player.vx /= spd/16; player.vy /= spd/16; }

  const prevY = player.y;
  player.x += player.vx; player.y += player.vy;

  player.grounded = false;
  for (const p of platforms) {
    if (player.x+PKW-6 > p.x && player.x+6 < p.x+p.w)
      if ((prevY+PKH) <= p.y+2 && (player.y+PKH) >= p.y && player.vy >= 0) {
        player.y = p.y-PKH; player.vy = 0; player.grounded = true; break;
      }
  }
  if (player.x < -PKW)         player.x += canvas.width + PKW;
  if (player.x > canvas.width) player.x -= canvas.width + PKW;
  if (player.y < 8) { player.y = 8; player.vy = Math.abs(player.vy)*0.4; }
  if (!player.grounded && player.y+PKH > LAVA_Y-4) {
    player.y = LAVA_Y-4-PKH; player.vy = -Math.abs(player.vy)*0.5; player.vx *= 0.8;
  }

  if (Math.abs(player.vx) > 0.4) player.facingLeft = player.vx < 0;
  const flapRate = player.grounded ? 22 : (player.boostTimer > 0 ? 4 : 12);
  if (--player.wingTimer <= 0) { player.wingFrame ^= 1; player.wingTimer = flapRate; }
  if (player.boostTimer > 0) player.boostTimer--;

  if (!player.grounded && spd > 4) {
    trail.push({ x: player.x+PKW/2, y: player.y+PKH/2, age: 0 });
    if (trail.length > 12) trail.shift();
  }
  trail.forEach(t => t.age++);
  trail = trail.filter(t => t.age < 12);

  // Auto-target nearest (prefer perched)
  if (!player.target || !player.target.alive) {
    const alive = vultures.filter(v => v.alive);
    if (alive.length) {
      const pool = (alive.filter(v => v.state===PERCHED).length
        ? alive.filter(v => v.state===PERCHED) : alive);
      player.target = pool.reduce((b,v) => {
        const da = Math.hypot((v.x+VULT_W/2)-(player.x+PKW/2),(v.y+VULT_H/2)-(player.y+PKH/2));
        const db = Math.hypot((b.x+VULT_W/2)-(player.x+PKW/2),(b.y+VULT_H/2)-(player.y+PKH/2));
        return da<db?v:b;
      });
    } else player.target = null;
  }

  if (playerAttackTimer > 0) playerAttackTimer--;

  // Collision only when player is actively attacking (recently typed a key)
  if (playerAttackTimer > 0) {
    const pcx = player.x+PKW/2, pcy = player.y+PKH/2, tip = getLanceTip();
    for (const v of vultures) {
      if (!v.alive) continue;
      const vcx = v.x+VULT_W/2, vcy = v.y+VULT_H/2;
      const bR = v.state===PERCHED ? BODY_R_PERCH : BODY_R_FLY;
      const tR = v.state===PERCHED ? TIP_R_PERCH  : TIP_R_FLY;
      if (Math.hypot(pcx-vcx,pcy-vcy)<bR || Math.hypot(tip.x-vcx,tip.y-vcy)<tR) {
        v.alive = false;
        score += v.state===PERCHED ? 200 : 350;
        eggs.push({ x: vcx-4, y: v.y, vy: -1.5, landAge: -1 });
        const dx=pcx-vcx, dy=pcy-vcy, mag=Math.hypot(dx,dy)||1;
        player.vx=(dx/mag)*3.5; player.vy=Math.min((dy/mag)*3.5,-2);
        player.grounded=false; player.target=null;
        homingTarget=null; homingFrames=0;
        break;
      }
    }
    // Collision vs pterodactyl
    if (ptero && pteroState===P_FLYING) {
      const pcx2 = player.x+PKW/2, pcy2 = player.y+PKH/2, tip2 = getLanceTip();
      const px=ptero.x+PTERO_W/2, py=ptero.y+PTERO_H/2;
      if (Math.hypot(pcx2-px,pcy2-py)<PTERO_HIT_R || Math.hypot(tip2.x-px,tip2.y-py)<PTERO_HIT_R) {
        pteroState=P_DYING; ptero.vy=-4; score+=500;
      }
    }
  }
}

function updateEggs() {
  for (let i=eggs.length-1; i>=0; i--) {
    const e=eggs[i];
    if (e.landAge>=0) { if (++e.landAge>70) { eggs.splice(i,1); score+=50; } continue; }
    e.vy+=0.3; e.y+=e.vy;
    let hit=false;
    for (const p of platforms)
      if (e.y+8>=p.y&&e.y<p.y+10&&e.x+4>p.x&&e.x<p.x+p.w&&e.vy>0)
        { e.y=p.y-8; e.vy=0; e.landAge=0; hit=true; break; }
    if (!hit && e.y>LAVA_Y) { eggs.splice(i,1); score+=50; }
  }
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function drawPx(shape, x, y, size, col, flip=false) {
  ctx.fillStyle = col;
  const w = shape[0].length;
  shape.forEach((row,r) => row.forEach((c,cc) => {
    if (c) ctx.fillRect(x+(flip?w-1-cc:cc)*size, y+r*size, size, size);
  }));
}

function drawLavaBackground() {
  const g = ctx.createLinearGradient(0,LAVA_Y,0,canvas.height);
  g.addColorStop(0,'#dd1100'); g.addColorStop(0.3,'#ff2200');
  g.addColorStop(0.8,'#ff5500'); g.addColorStop(1,'#ff7700');
  ctx.fillStyle=g; ctx.fillRect(0,LAVA_Y,canvas.width,canvas.height-LAVA_Y);
}

function drawTroll() {
  if (trollState===T_HIDDEN || trollRise<=0) return;
  ctx.save();
  ctx.beginPath(); ctx.rect(0,0,canvas.width,LAVA_Y+1); ctx.clip();
  ctx.globalAlpha = Math.min(1, trollRise/TROLL_H*1.3);
  ctx.shadowColor='#ff4400'; ctx.shadowBlur=20;
  drawPx(TROLL_SP, trollX, trollY, TPX, '#cc2200');
  ctx.shadowBlur=0;
  ctx.fillStyle='#ffff44';
  ctx.fillRect(trollX+TPX,   trollY+2*TPX, TPX, TPX);
  ctx.fillRect(trollX+3*TPX, trollY+2*TPX, TPX, TPX);
  ctx.globalAlpha=1; ctx.restore();
}

function drawLavaSurface() {
  ctx.fillStyle='#ff8800'; ctx.fillRect(0,LAVA_Y,canvas.width,2);
  flames.forEach(f => {
    f.phase += 0.055 + Math.random()*0.025;
    const h=14+Math.sin(f.phase)*8, pulse=(Math.sin(f.phase)+1)/2;
    ctx.fillStyle=`rgba(255,${60+pulse*60|0},0,0.85)`; ctx.fillRect(f.x-4,LAVA_Y-h,8,h);
    ctx.fillStyle=`rgba(255,${160+pulse*80|0},0,0.9)`; ctx.fillRect(f.x-2,LAVA_Y-h*0.6,4,h*0.6);
    ctx.fillStyle='rgba(255,240,180,0.7)'; ctx.fillRect(f.x-1,LAVA_Y-h,2,4);
  });
  ctx.fillStyle='#ffdd00'; ctx.font='11px "Press Start 2P",monospace'; ctx.textAlign='center';
  ctx.fillText(String(score).padStart(6,'0'), canvas.width/2, LAVA_Y+24);
  ctx.textAlign='left';
}

function drawPlatform(p) {
  ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(p.x+4,p.y+6,p.w,8);
  ctx.fillStyle='#7a4a10'; ctx.fillRect(p.x,p.y,p.w,10);
  ctx.fillStyle='#c07830'; ctx.fillRect(p.x,p.y,p.w,3);
  ctx.fillStyle='#5a3208';
  for (let t=0,n=Math.floor(p.w/22); t<n; t++) {
    const tx=p.x+8+t*22; ctx.fillRect(tx,p.y+10,8,5); ctx.fillRect(tx+2,p.y+14,4,4);
  }
}

function drawLance() {
  const ly=Math.round(player.y+LANCE_Y_OFF);
  const sx=player.facingLeft ? player.x-LANCE_LEN : player.x+PKW;
  ctx.fillStyle='#7a4810'; ctx.fillRect(sx,ly+1,LANCE_LEN,4);
  ctx.fillStyle='#a06020'; ctx.fillRect(sx,ly+1,LANCE_LEN,1);
  const tx=player.facingLeft ? sx-10 : sx+LANCE_LEN;
  ctx.shadowColor='#ffee44'; ctx.shadowBlur=6;
  ctx.fillStyle='#ffdd00'; ctx.fillRect(tx,ly-1,10,7);
  ctx.fillStyle='#ffffff'; ctx.fillRect(player.facingLeft?tx:tx+8,ly+1,2,2);
  ctx.shadowBlur=0;
}

function drawPlayer() {
  trail.forEach(t => {
    ctx.globalAlpha=Math.max(0,(1-t.age/12)*0.22);
    const s=2+(1-t.age/12)*5;
    ctx.fillStyle='#ffcc00'; ctx.fillRect(t.x-s/2,t.y-s/2,s,s);
  });
  ctx.globalAlpha=1;
  drawLance();
  ctx.shadowColor='#ffcc00'; ctx.shadowBlur=player.grounded?7:14;
  drawPx(player.wingFrame===0?PLAYER_WINGS_UP:PLAYER_WINGS_DOWN,player.x,player.y,PKX,'#ffdd44',player.facingLeft);
  ctx.shadowBlur=0;
}

function drawVultures() {
  vultures.forEach(v => {
    if (!v.alive) return;
    drawPx(v.wingFrame===0?VULT_UP:VULT_DOWN,v.x,v.y,VPX,v.color);
  });
}

function drawPterodactyl() {
  if (!ptero||pteroState===P_INACTIVE) return;
  const col=pteroState===P_DYING?'#ff6600':'#cc44ff';
  ctx.shadowColor=col; ctx.shadowBlur=9;
  drawPx(ptero.wingFrame===0?PTERO_UP:PTERO_DOWN,ptero.x,ptero.y,PPX,col,ptero.facingLeft);
  ctx.shadowBlur=0;
}

function drawEggs() {
  eggs.forEach(e => {
    ctx.globalAlpha=e.landAge>=0?Math.max(0,1-e.landAge/70):1;
    ctx.fillStyle='#ffe8a0';
    ctx.fillRect(e.x+2,e.y,5,1); ctx.fillRect(e.x,e.y+1,9,6); ctx.fillRect(e.x+2,e.y+7,5,1);
    ctx.fillStyle='#ffffd0'; ctx.fillRect(e.x+1,e.y+1,2,2);
  });
  ctx.globalAlpha=1;
}

function drawTargetIndicator() {
  if (!player.target||!player.target.alive||victoryMode||frame%16>=9) return;
  const t=player.target, pad=t.state===PERCHED?9:5;
  const x=t.x-pad,y=t.y-pad,w=VULT_W+pad*2,h=VULT_H+pad*2;
  ctx.fillStyle=t.state===PERCHED?'rgba(255,255,100,0.85)':'rgba(255,200,60,0.65)';
  ctx.fillRect(x,y,5,1);     ctx.fillRect(x,y,1,5);
  ctx.fillRect(x+w-5,y,5,1); ctx.fillRect(x+w-1,y,1,5);
  ctx.fillRect(x,y+h-1,5,1); ctx.fillRect(x,y+h-5,1,5);
  ctx.fillRect(x+w-5,y+h-1,5,1); ctx.fillRect(x+w-1,y+h-5,1,5);
}

function drawHUD() {
  for (let i=0; i<WAVES_TO_WIN; i++) {
    const done=i<wavesCleared||(wavesCleared>=WAVES_TO_WIN-1&&vultures.every(v=>!v.alive));
    ctx.fillStyle=done?'#ff6600':'#2a1000';
    ctx.shadowColor=done?'#ff6600':'transparent'; ctx.shadowBlur=done?7:0;
    ctx.fillRect(canvas.width-22-i*14,14,9,9);
  }
  if (pteroCount>0||pteroState!==P_INACTIVE) {
    const c=pteroState===P_INACTIVE?'#884499':'#cc44ff';
    ctx.fillStyle=c; ctx.shadowColor=c; ctx.shadowBlur=5;
    ctx.fillRect(canvas.width-22-WAVES_TO_WIN*14-10,14,7,7);
  }
  ctx.shadowBlur=0;
  if (trollState!==T_HIDDEN) {
    ctx.fillStyle=`rgba(255,60,0,${0.15+Math.sin(frame*0.1)*0.05})`;
    ctx.fillRect(0,LAVA_Y-6,canvas.width,6);
  }
}

// ─── Victory celebration ────────────────────────────────────────────────────────

// Spawn a burst of additive sparks + a floating "+500" score flourish at (x,y)
function spawnBurst(x, y, label) {
  const W = canvas.width || 1280, H = canvas.height || 800;
  x = Math.max(20, Math.min(W - 20, x));
  y = Math.max(20, Math.min(H - 20, y));
  if (bursts.length < 12) bursts.push({ x, y, label, age: 0, life: 90 });
  const n = 10;
  for (let i = 0; i < n && sparks.length < 160; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
    const spd = 1.6 + Math.random() * 2.6;
    sparks.push({
      x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 1.2,
      age: 0, life: 34 + (Math.random() * 20 | 0),
      col: ['#ffdd44', '#ffffff', '#ff8822', '#ffee99'][i % 4],
    });
  }
  score += 500;
}

function updateVictory() {
  const now = performance.now();
  const t = Math.max(0, Math.min(1, (now - victoryStartMs) / VICTORY_MS)); // clamped 0..1 (F1)
  const W = canvas.width || 1280, H = canvas.height || 800;

  // Wing-flap cycle keeps flapping through the whole lap (vigorous)
  if (--player.wingTimer <= 0) { player.wingFrame ^= 1; player.wingTimer = landPose ? 30 : 5; }

  // Flames keep bubbling; lava surge is drawn additively in drawVictory.
  flames.forEach(f => { f.phase += 0.06; });

  // Two-pass victory lap: t in [0, 0.72] flies, then banks in and lands center-stage.
  if (t < 0.72) {
    landPose = false;
    // Sine ease across the arena, sweeping left→right then right→left (2 passes).
    const passT = t / 0.72;                 // 0..1 across the lap phase
    const sweep = (1 - Math.cos(passT * Math.PI * 2)) / 2; // 0→1→0 (there and back)
    const marginX = W * 0.14, spanX = W * 0.72;
    player.x = marginX + sweep * spanX;
    // Gentle bank up/down as it crosses, staying in the upper arena (above the UI center is fine — knight is focal)
    const cruiseY = H * 0.20 + Math.sin(passT * Math.PI * 4) * (H * 0.10);
    player.y = Math.max(H * 0.06, Math.min(LAVA_Y - PKH - 10, cruiseY));
    // Face direction of travel (derivative of the sweep)
    player.facingLeft = Math.sin(passT * Math.PI * 2) < 0;
    // Bank turns at the edges throw off egg-bursts ("defeated rivals" pop into points)
    if (now - lastBurstAt > 320) {
      lastBurstAt = now;
      spawnBurst(player.x + (player.facingLeft ? -30 : PKW + 30),
                 player.y + PKH / 2 + (Math.random() - 0.5) * 40, '+500');
    }
  } else {
    // Land center-stage on the wide bottom platform, proud wing-spread pose.
    const landT = (t - 0.72) / 0.28;
    const bp = platforms[1] || { x: W * 0.21, y: LAVA_Y - 28, w: W * 0.58 };
    const targetX = bp.x + bp.w / 2 - PKW / 2;
    const targetY = bp.y - PKH;
    if (!landPose) {
      // ease into landing position
      player.x += (targetX - player.x) * Math.min(1, landT * 2.2);
      player.y += (targetY - player.y) * Math.min(1, landT * 2.2);
      player.facingLeft = false;
      if (landT > 0.45) {
        landPose = true;
        // triumphant final flourish around the landed knight
        spawnBurst(targetX + PKW / 2, targetY + PKH / 2, '+500');
        spawnBurst(targetX - 20, targetY, '');
        spawnBurst(targetX + PKW + 20, targetY, '');
      }
    } else {
      player.x = targetX; player.y = targetY;
    }
  }

  // Advance particles (bounded pools, clamped ages)
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x += s.vx; s.y += s.vy; s.vy += 0.12; s.vx *= 0.97;
    if (++s.age >= s.life) sparks.splice(i, 1);
  }
  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i];
    b.y -= 0.6;
    if (++b.age >= b.life) bursts.splice(i, 1);
  }
  frame++;
}

function drawVictory() {
  const now = performance.now();
  const pulse = (Math.sin(now * 0.012) + 1) / 2;

  // Warm celebratory lava surge — additive so it doesn't vanish into the dark scene (L35)
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, LAVA_Y - 40, 0, canvas.height);
  g.addColorStop(0, `rgba(255,120,0,${0.10 + pulse * 0.14})`);
  g.addColorStop(0.5, `rgba(255,80,0,${0.22 + pulse * 0.18})`);
  g.addColorStop(1, `rgba(255,180,40,${0.30 + pulse * 0.20})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, LAVA_Y - 40, canvas.width, canvas.height - LAVA_Y + 40);
  ctx.restore();

  // The knight on its ostrich — the star of the lap
  drawLance();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 18;
  const wings = landPose ? PLAYER_WINGS_SPREAD
    : (player.wingFrame === 0 ? PLAYER_WINGS_UP : PLAYER_WINGS_DOWN);
  drawPx(wings, player.x, player.y, PKX, '#ffee66', player.facingLeft);
  // second lighter pass for a white-hot core
  ctx.shadowBlur = 0;
  drawPx(wings, player.x, player.y, PKX, 'rgba(255,255,255,0.35)', player.facingLeft);
  ctx.restore();

  // Additive sparks
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  sparks.forEach(s => {
    const life = Math.max(0, 1 - s.age / s.life);
    const sz = 2 + life * 4;
    ctx.fillStyle = s.col;
    ctx.fillRect(s.x - sz / 2, s.y - sz / 2, sz, sz);
  });
  ctx.restore();

  // "+500" score flourishes — plain text over the additive layer (legible)
  ctx.font = '13px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  bursts.forEach(b => {
    if (!b.label) return;
    const life = Math.max(0, 1 - b.age / b.life);
    ctx.globalAlpha = Math.min(1, life * 1.6);
    ctx.fillStyle = '#ffee88';
    ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 6;
    ctx.fillText(b.label, b.x, b.y);
  });
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// ─── Loop ─────────────────────────────────────────────────────────────────────

function update() {
  if (victoryMode) { updateVictory(); return; }
  updatePlayer(); updateVultures(); updateEggs();
  updatePterodactyl(); updateLavaTroll();

  const alive=vultures.filter(v=>v.alive);
  if (alive.length===0 && wavesCleared<WAVES_TO_WIN-1) {
    if (respawnTimer<0) {
      respawnTimer=frame+50;
      if (pteroCount<MAX_PTERO && pteroState===P_INACTIVE)
        pteroTimer=frame+140+(Math.random()*120|0);
      if (wavesCleared===0 && trollCount===0)
        trollTimer=frame+180+(Math.random()*150|0);
    }
    if (frame>=respawnTimer) { wavesCleared++; spawnVultures(); respawnTimer=-1; }
  }
  frame++;
}

function render() {
  if (!active) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawLavaBackground();
  drawTroll();
  drawLavaSurface();
  platforms.forEach(drawPlatform);
  drawHUD();
  if (victoryMode) {
    drawVictory();
  } else {
    drawTargetIndicator();
    drawVultures();
    drawEggs();
    drawPterodactyl();
    drawPlayer();
  }
  update();
  animId=requestAnimationFrame(render);
}

// ─── API ──────────────────────────────────────────────────────────────────────

export function start() {
  getCanvas(); resize();
  active=true; victoryMode=false;
  bursts=[]; sparks=[]; landPose=false; lastBurstAt=0; victoryStartMs=0;
  wavesCleared=0; respawnTimer=-1; score=0; frame=0;
  pteroState=P_INACTIVE; ptero=null; pteroCount=0; pteroTimer=-1;
  trollState=T_HIDDEN; trollCount=0; trollTimer=-1; trollRise=0; trollY=LAVA_Y;
  spawnVultures(); render();
}

export function stop() {
  active=false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0,0,canvas.width,canvas.height);
  vultures=[]; eggs=[]; trail=[];
  homingTarget=null; homingFrames=0; respawnTimer=-1; playerAttackTimer=0;
  pteroState=P_INACTIVE; ptero=null; trollState=T_HIDDEN;
  victoryMode=false; bursts=[]; sparks=[]; landPose=false;
}

export function keystroke() {
  if (!active||victoryMode) return;
  const alive=vultures.filter(v=>v.alive);
  if (!alive.length) return;
  const pool=(alive.filter(v=>v.state===PERCHED).length
    ? alive.filter(v=>v.state===PERCHED) : alive);
  homingTarget=pool.reduce((b,v)=>{
    const da=Math.hypot((v.x+VULT_W/2)-(player.x+PKW/2),(v.y+VULT_H/2)-(player.y+PKH/2));
    const db=Math.hypot((b.x+VULT_W/2)-(player.x+PKW/2),(b.y+VULT_H/2)-(player.y+PKH/2));
    return da<db?v:b;
  });
  player.target=homingTarget; homingFrames=60;
  playerAttackTimer=150;  // collision active for ~2.5s after each keypress
  const dx=(homingTarget.x+VULT_W/2)-(player.x+PKW/2);
  const dy=(homingTarget.y+VULT_H/2)-(player.y+PKH/2);
  const d=Math.hypot(dx,dy)||1, df=Math.min(1,d/250), bm=10+df*6;
  if (player.grounded) {
    player.vy=-(5+df*3); player.vx+=(dx/d)*bm*0.7; player.grounded=false;
  } else { player.vx+=(dx/d)*bm; player.vy+=(dy/d)*bm; }
  player.boostTimer=8;
}

export function miss() {}

export function patternComplete() {
  if (!active) return false;
  return wavesCleared>=WAVES_TO_WIN-1 && vultures.every(v=>!v.alive);
}

export function victory() {
  victoryMode = true;
  victoryStartMs = performance.now();
  homingFrames = 0; homingTarget = null;
  playerAttackTimer = 0; player.target = null;
  player.vx = 0; player.vy = 0; player.grounded = false;
  landPose = false; lastBurstAt = 0;
  bursts = []; sparks = [];
  // Clear the arena so the lone knight's victory lap owns the stage.
  vultures = []; eggs = []; trail = [];
  pteroState = P_INACTIVE; ptero = null; trollState = T_HIDDEN; trollRise = 0;
  // Opening flourish as the lap begins.
  const W = canvas.width || 1280, H = canvas.height || 800;
  spawnBurst(W * 0.5, H * 0.22, '');
  return VICTORY_MS;
}

window.addEventListener('resize',()=>{ if(active){resize();if(!victoryMode)spawnVultures();} });
