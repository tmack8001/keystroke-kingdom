// Level 24: High Score Entry (Present day) — the player types their own name.
//
// LAYOUT CONTRACT ("the UI owns the center; the theme owns the frame"):
// The fixed DOM UI permanently occupies the center of the screen — the prompt
// panel (~0.40-0.60W x 0.19-0.43H), the keyboard guide (~0.22-0.78W x
// 0.49-0.81H) and the HUD corners. So the high-score table is composed
// ENTIRELY in the stage regions the player can actually see:
//   • ranks + names run down the LEFT margin   (0 .. 0.20W)
//   • scores run down the RIGHT margin          (0.80 .. 1.0W)
//   • dotted leader lines connect each pair across the middle — they pass
//     BEHIND the panels (purely ambient, nothing to read there)
//   • the #1 slot is conspicuously EMPTY and blinking, awaiting the player
//   • "ENTER YOUR NAME" blinks in the GAP BAND between prompt and keyboard
//     (~0.43-0.49H) — fully visible, never behind a panel
//   • HIGH SCORES title sits in the TOP BAND (~0.10H)
// The #1 slot in the left margin holds ONLY the player's name: a blinking
// placeholder through the warm-up drills, the name assembling letter by letter
// as it is typed, then the name held there for the rest of the level. No other
// word (drill, card word, pool word) is ever shown in it — see slotName().
//
// Modern-fidelity finale polish: a swinging spotlight beam, drifting golden
// motes, a reflective floor sheen, and per-keystroke golden bursts.

import { LEVELS } from '../levels.js';
import { cardsForLevel } from '../history-cards.js';

let canvas, ctx, animId;
let active = false, victoryMode = false;
let totalTyped = 0;    // cumulative correct keys — drives the win gate
let flashTimer = 0;    // extra flash when an uppercase (shift) char lands
let flashPeak = 6;
let bannerT = 0;       // victory: "NEW HIGH SCORE" banner fade-in (0..1), from time
let victoryStartMs = 0;
let fireworksFired = 0;
let lettersLanded = 0; // victory: centre-stage letters that have landed (one burst each)
let gildsBurst = 0;    // victory: slot letters that have gilded (one burst each)
let sparkle = 0;
let frame = 0;

let particles = [];    // per-keystroke golden bursts
let motes = [];        // ambient drifting golden dust
let entryPulse = 0;    // eased "just landed a char" scale pulse on the #1 slot

// ── WHICH WORD WAS THE NAME ─────────────────────────────────────────────────
// The victory used to gild whatever word happened to be typed LAST — usually the
// history-card word, so a child who had just typed their own name watched
// "Eniac" go up on the board under a card reading "YOU TYPED YOUR NAME" (persona
// playtest, 2026-10-29). The theme must show what the player ACTUALLY typed.
//
// It may not read the player's name itself (theme-authoring.md §Security: text a
// user typed arrives only through the engine's pattern stream). It does not need
// to: js/main.js splices the capitalized name at index `intro.length` — "the very
// first pattern after the warm-up drills" — so the name is the word completed at
// that position. That position is validated before it is believed:
//   • letters only, capital first — the shape main.js buildPlayerNamePattern()
//     produces after stripping to [a-zA-Z] (security.md rule 3); a Free Play
//     sentence (spaces, punctuation) can never pass;
//   • when NO name was spliced (a name with no letters), the card word slides
//     into that slot instead — so a Level-24 card word there is believed only if
//     the same word comes round again two slots later, where the card sits when a
//     name WAS spliced.
// When nothing passes, the board shows "YOU" — never a claim that a name was typed.
const INTRO_LEN = (LEVELS[24] && Array.isArray(LEVELS[24].intro)) ? LEVELS[24].intro.length : 7;
const CARD_WORDS = new Set(cardsForLevel(24).map(c => c && c.word).filter(Boolean));
const NAME_SHAPE = /^[A-Z][A-Za-z]{0,23}$/;
const MAX_WORDS_KEPT = 16;
let wordChars = [];    // the word being typed (display goes through slotName())
let typedWords = [];   // completed words in order, bounded
let championName = ''; // what the victory puts on the board ('' = no name typed)

const WIN_CHARS = 24;
const ENTRY_MAX = 16;   // the name field's own cap (onboarding.md) — never truncate a name
const MAX_PARTICLES = 260;

// Pre-filled all-time board (ranks 2-6). Rank #1 is intentionally left OPEN
// for the player. Scores are shown down the right margin.
const BOARD = [
  { name: 'ACE', score: 98200 },
  { name: 'ZED', score: 87650 },
  { name: 'MAX', score: 76300 },
  { name: 'JAX', score: 65100 },
  { name: 'REX', score: 54800 },
];

// ─── Easing ─────────────────────────────────────────────────────────────────
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function init() {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  totalTyped = 0;
  flashTimer = 0;
  flashPeak = 6;
  bannerT = 0;
  lettersLanded = 0;
  gildsBurst = 0;
  sparkle = 0;
  frame = 0;
  entryPulse = 0;
  victoryMode = false;
  wordChars = [];
  typedWords = [];
  championName = '';
  victoryStartMs = 0;
  fireworksFired = 0;
  particles = [];
  motes = buildMotes();
}

function buildMotes() {
  const list = [];
  for (let i = 0; i < 44; i++) {
    list.push({
      seed: Math.random() * 1000,
      speed: 0.06 + Math.random() * 0.18,
      driftAmp: 8 + Math.random() * 22,
      size: 0.6 + Math.random() * 1.7,
      baseX: Math.random(),
      phase: Math.random() * Math.PI * 2,
    });
  }
  return list;
}

// ─── Particles ──────────────────────────────────────────────────────────────

// `hue` set = a victory FIREWORK: bigger, faster, longer-lived and drawn additively
// with a white-hot core — on a dark scene a normal-alpha burst reads as specks
// (journal L35: dark scenes need 'lighter', saturated colour, ~3-4x the size).
function spawnBurst(x, y, big, hue = null) {
  const fw = hue != null;
  const n = fw ? 40 : big ? 26 : 12;
  for (let i = 0; i < n; i++) {
    if (particles.length >= MAX_PARTICLES) particles.shift();
    const ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
    const speed = fw ? 2.6 + Math.random() * 4.2
      : (big ? 1.6 : 1.0) + Math.random() * (big ? 2.6 : 1.6);
    particles.push({
      x, y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed - (big ? 0.8 : 0.3),
      life: 0,
      maxLife: fw ? 58 + Math.random() * 20 : (big ? 46 : 30) + Math.random() * 14,
      size: fw ? 3.5 + Math.random() * 3.5 : (big ? 2.2 : 1.4) + Math.random() * (big ? 2.2 : 1.4),
      gold: Math.random() > 0.25,
      hue,
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life++;
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.045;
    p.vx *= 0.985;
    if (p.life >= p.maxLife) particles.splice(i, 1);
  }
}

function drawParticles() {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const p of particles) {
    if (p.hue == null) continue;
    const t = p.life / p.maxLife;
    const alpha = 1 - easeOutCubic(t);
    const size = p.size * (1 - t * 0.3);
    ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${alpha})`;
    ctx.fillRect(p.x - size, p.y - size, size * 2, size * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;          // white-hot core
    ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
  }
  ctx.restore();
  for (const p of particles) {
    if (p.hue != null) continue;
    const t = p.life / p.maxLife;
    const alpha = 1 - easeOutCubic(t);
    const size = p.size * (1 - t * 0.4);
    ctx.fillStyle = p.gold
      ? `rgba(255, 210, 80, ${alpha})`
      : `rgba(255, 245, 200, ${alpha})`;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 6 * alpha;
    ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
  }
  ctx.shadowBlur = 0;
}

// ─── Background / atmosphere ────────────────────────────────────────────────

function drawBackground(W, H) {
  ctx.fillStyle = '#050300';
  ctx.fillRect(0, 0, W, H);
  const vign = ctx.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, Math.max(W, H) * 0.7);
  vign.addColorStop(0, 'rgba(0,0,0,0)');
  vign.addColorStop(1, 'rgba(40,20,0,0.55)');
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, W, H);
}

// A swinging spotlight beam that sweeps across the empty #1 slot in the left
// margin — the "you're on stage now" moment, modern dynamic lighting without
// anachronistic 3D. The beam origin is top-center; the pool lands on the left
// margin where the champion row lives.
function drawSpotlight(W, H) {
  const swing = Math.sin(frame * 0.012);
  const originX = W * 0.5, originY = -H * 0.05;
  // Aim toward the left-margin champion row, gently swinging.
  const aimX = W * (0.10 + swing * 0.05);
  const aimY = H * 0.30;
  const ang = Math.atan2(aimY - originY, aimX - originX);
  const spread = 0.16;
  const len = H * 1.4;

  ctx.save();
  ctx.translate(originX, originY);
  ctx.rotate(ang);
  const grad = ctx.createLinearGradient(0, 0, len, 0);
  grad.addColorStop(0, 'rgba(255, 225, 150, 0.16)');
  grad.addColorStop(0.5, 'rgba(255, 205, 110, 0.06)');
  grad.addColorStop(1, 'rgba(255, 205, 110, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(len, -len * spread);
  ctx.lineTo(len, len * spread);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // A soft warm pool where the beam lands (behind the champion row)
  const pool = ctx.createRadialGradient(aimX, aimY, 0, aimX, aimY, H * 0.28);
  pool.addColorStop(0, 'rgba(255, 220, 130, 0.14)');
  pool.addColorStop(1, 'rgba(255, 220, 130, 0)');
  ctx.fillStyle = pool;
  ctx.fillRect(0, 0, W, H);
}

function drawMotes(W, H) {
  const t = performance.now() / 1000;
  for (const m of motes) {
    const fall = ((t * m.speed + m.seed) % 1);
    const y = fall * H;
    const x = m.baseX * W + Math.sin(t * 0.5 + m.phase) * m.driftAmp;
    // Fade motes that drift over the reserved center so they never read as
    // content the player must see; they still add life in the margins.
    const inCenter = x > W * 0.34 && x < W * 0.66 && y > H * 0.18 && y < H * 0.82;
    const base = 0.20 + 0.30 * (0.5 + 0.5 * Math.sin(t * 1.2 + m.phase));
    const alpha = base * (inCenter ? 0.35 : 1);
    ctx.fillStyle = `rgba(255, 232, 175, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(x, y, m.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFloorSheen(W, H) {
  const floorY = H * 0.88;
  const sheen = ctx.createLinearGradient(0, floorY, 0, H);
  sheen.addColorStop(0, 'rgba(255, 200, 90, 0.10)');
  sheen.addColorStop(0.4, 'rgba(255, 180, 60, 0.035)');
  sheen.addColorStop(1, 'rgba(255, 180, 60, 0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, floorY, W, H - floorY);
}

function drawCRTLines(W, H) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
}

// ─── The board ──────────────────────────────────────────────────────────────

function drawTitle(W, H) {
  const fontSize = Math.max(14, Math.floor(W * 0.024));
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700';
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 14 + Math.sin(frame * 0.05) * 3;
  // TOP BAND (< 0.188H), clear of both HUD corners.
  ctx.fillText('HIGH SCORES', W / 2, Math.round(H * 0.10));

  // VICTORY banner — the thing an arcade actually says when your name goes up.
  // Lives in the TOP BAND between the HUD corners (visual-validation.md), never
  // over the prompt panel, and fades in only after the row has begun to settle.
  if (victoryMode && bannerT > 0) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const pop = 1 + 0.10 * (1 - bannerT);
    ctx.translate(W / 2, Math.round(H * 0.145));
    ctx.scale(pop, pop);
    ctx.font = `${Math.max(10, Math.floor(W * 0.013))}px "Press Start 2P", monospace`;
    ctx.fillStyle = `rgba(255,251,224,${bannerT})`;
    ctx.shadowColor = '#ffd84a';
    ctx.shadowBlur = 18 * bannerT;
    ctx.fillText('NEW HIGH SCORE', 0, 0);
    ctx.restore();
    ctx.shadowBlur = 0;
  }
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
}

function entryName() {
  if (victoryMode) return championName || 'YOU';
  return slotName();
}

// What the #1 slot shows MID-LEVEL ('' = the blinking placeholder).
// Persona playtest 2026-10-30: the slot used to echo every word typed and, once
// the theme's own char gate was met, stopped clearing — so the board read
// "EniacRiverBla_" (card + pool words run together) while a child was waiting to
// see their own name. It now follows the WHICH WORD WAS THE NAME rule above:
//   • during the warm-up drills (word index < INTRO_LEN): placeholder;
//   • while the name-position word is being typed: its letters, live — unless
//     it is plainly turning into a Level-24 card word (the letterless-name case,
//     where the card slides into that slot). Only prefixes of 3+ letters are
//     hidden, so a real name sharing a card word's first letter or two (Emma,
//     Isla vs Eniac, IBM) still lands from its very first keystroke;
//   • after that: the resolved name, held — or the placeholder if none resolves.
// Canvas text only (security.md rule 1); the letters arrive via keystroke().
const CARD_PREFIX_HIDE = 3;
function slotName() {
  const idx = typedWords.length;            // completed words so far
  if (idx < INTRO_LEN) return '';
  if (idx === INTRO_LEN) {
    const partial = wordChars.join('').slice(0, ENTRY_MAX);
    if (!partial || !/^[A-Z][A-Za-z]*$/.test(partial)) return '';
    for (const w of CARD_WORDS) {
      if (partial.length >= CARD_PREFIX_HIDE && w.startsWith(partial)) return '';
    }
    return partial;
  }
  return resolveChampionName().slice(0, ENTRY_MAX);
}
function slotIsLive() {
  return !victoryMode && typedWords.length === INTRO_LEN;
}

// The name the player typed, if this play can prove one was typed (see WHICH WORD
// WAS THE NAME above). Returns '' when it cannot.
function resolveChampionName() {
  const cand = typedWords[INTRO_LEN];
  if (typeof cand !== 'string' || !NAME_SHAPE.test(cand)) return '';
  if (CARD_WORDS.has(cand) && typedWords[INTRO_LEN + 2] !== cand) return '';
  return cand;
}

// Six rows: #1 (the player, top) + the five pre-filled board entries.
// Rows are spread down the full height. Names/ranks live in the LEFT margin,
// scores in the RIGHT margin, dotted leaders connect them across the center.
function boardRows() {
  return [
    { rank: 1, name: null, score: null, champion: true },
    ...BOARD.map((b, i) => ({ rank: i + 2, name: b.name, score: b.score })),
  ];
}

function drawBoard(W, H) {
  const rows = boardRows();
  const nRows = rows.length;
  const fontSize = Math.max(11, Math.floor(W * 0.015));
  const top = H * 0.20;
  const bottom = H * 0.86;
  const step = (bottom - top) / (nRows - 1);

  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textBaseline = 'middle';

  const leftRank = Math.round(W * 0.03);   // rank number, far left
  const leftName = Math.round(W * 0.07);   // name, left margin
  const rightX   = Math.round(W * 0.97);   // score, right margin (right-aligned)
  const blinkOn  = Math.floor(performance.now() / 450) % 2 === 0;

  rows.forEach((row, i) => {
    const y = top + i * step;
    const champ = row.champion;
    const gold = champ ? '#fff2a8' : '#e8c040';

    // Dotted leader line across the center (ambient — passes behind panels)
    ctx.save();
    ctx.strokeStyle = champ ? 'rgba(255,242,168,0.28)' : 'rgba(232,192,64,0.16)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 8]);
    ctx.beginPath();
    ctx.moveTo(leftName + W * 0.11, y);
    ctx.lineTo(rightX - W * 0.09, y);
    ctx.stroke();
    ctx.restore();

    // Rank number
    ctx.textAlign = 'left';
    ctx.fillStyle = gold;
    ctx.shadowColor = gold;
    ctx.shadowBlur = champ ? 10 : 3;
    ctx.fillText(`${row.rank}`, leftRank, y);

    // Name (left margin)
    if (champ) {
      drawChampionName(leftName, y, fontSize, blinkOn);
    } else {
      ctx.fillStyle = gold;
      ctx.shadowBlur = 3;
      ctx.fillText(row.name, leftName, y);
    }
    ctx.shadowBlur = 0;

    // Score (right margin, right-aligned)
    ctx.textAlign = 'right';
    if (champ) {
      const scoreTxt = victoryMode ? rolledScore()
        : slotName() ? '99999' : (blinkOn ? '?????' : '     ');
      ctx.fillStyle = gold;
      ctx.shadowColor = gold;
      ctx.shadowBlur = 10;
      ctx.fillText(scoreTxt, rightX, y);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = gold;
      ctx.shadowColor = gold;
      ctx.shadowBlur = 3;
      ctx.fillText(String(row.score).padStart(5, '0'), rightX, y);
      ctx.shadowBlur = 0;
    }
  });

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// The #1 slot: empty and blinking until the player types; then the typed
// letters assemble here — your name entering the all-time list.
function drawChampionName(x, y, fontSize, blinkOn) {
  ctx.save();
  const nm = entryName();
  const showName = victoryMode || nm.length > 0;
  const pulseScale = 1 + 0.16 * easeOutBack(entryPulse);
  const glow = 12 + (flashTimer > 0 ? flashPeak * 1.3 : 0);

  ctx.translate(x, y);
  ctx.scale(pulseScale, pulseScale);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff2a8';
  ctx.shadowColor = '#ffe066';
  ctx.shadowBlur = glow;

  if (showName) {
    const cursor = blinkOn && slotIsLive() ? '_' : '';
    if (!victoryMode) {
      ctx.fillText(nm + cursor, 0, 0);
    } else {
      // VICTORY: once the name has flown in from centre stage (drawNameStage), it
      // sits in the #1 slot and gilds one letter at a time — the arcade's "your
      // initials going up on the board", stretched to a whole name.
      const e = victoryElapsed();
      if (e >= T_LAND) {
        const lit = Math.floor((e - T_LAND) / Math.max(60, GILD_MS / nm.length));
        let cx = 0;
        for (let i = 0; i < nm.length; i++) {
          const on = i < lit;
          ctx.fillStyle   = on ? '#fffbe0' : '#e8cf80';
          ctx.shadowColor = on ? '#ffd84a' : '#7a6420';
          ctx.shadowBlur  = on ? 20 : 6;
          ctx.fillText(nm[i], cx, 0);
          cx += ctx.measureText(nm[i]).width;
        }
      }
    }
  } else {
    // Empty champion slot: blinking placeholder inviting the player in.
    ctx.fillStyle = blinkOn ? '#fff2a8' : 'rgba(255,242,168,0.25)';
    ctx.fillText('_ _ _', 0, 0);
  }
  ctx.restore();
}

// "ENTER YOUR NAME" in the GAP BAND between the prompt panel and the keyboard
// guide (~0.43-0.49H). Fully visible — never behind a panel.
function drawCallToAction(W, H) {
  if (victoryMode) return;
  // Once the name is up on the board the invitation has been answered — keep
  // blinking it and the child is told to enter a name they already entered.
  if (typedWords.length > INTRO_LEN && slotName()) return;
  const blinkOn = Math.floor(performance.now() / 500) % 2 === 0;
  if (!blinkOn) return;
  const fontSize = Math.max(9, Math.floor(W * 0.012));
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700';
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 8;
  ctx.fillText('ENTER YOUR NAME', W / 2, Math.round(H * 0.462));
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
}

function drawProgress(W, H) {
  const pct = Math.min(1, totalTyped / WIN_CHARS);
  const barW = Math.round(W * 0.14);
  const bx = Math.round(W * 0.02);
  const by = Math.round(H * 0.94);

  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#ffd700';
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 4;
  ctx.fillText(`ENTRY ${Math.min(totalTyped, WIN_CHARS)}/${WIN_CHARS}`, bx, by);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#2a1a00';
  ctx.fillRect(bx, by + 5, barW, 8);
  ctx.fillStyle = '#ffd700';
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 3;
  ctx.fillRect(bx, by + 5, Math.round(barW * pct), 8);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#7a5a00';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx + 0.5, by + 5.5, barW - 1, 7);
}

function drawSparkles(W, H) {
  if (sparkle <= 0) return;
  const n = 30;
  for (let i = 0; i < n; i++) {
    const seed = (frame * 3 + i * 97) % 997;
    const sx = (seed * 53) % W;
    const sy = (seed * 91) % H;
    const tw = (Math.sin(frame * 0.2 + i) + 1) / 2;
    ctx.fillStyle = `rgba(255, 230, 120, ${0.3 + tw * 0.6})`;
    ctx.fillRect(sx, sy, 2, 2);
  }
}

function render() {
  if (!active) return;
  frame++;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  drawBackground(W, H);
  drawSpotlight(W, H);
  drawMotes(W, H);
  drawFloorSheen(W, H);
  drawTitle(W, H);
  drawBoard(W, H);
  drawCallToAction(W, H);
  if (victoryMode) drawNameStage(W, H);
  updateParticles();
  drawParticles();
  if (sparkle > 0) { drawSparkles(W, H); sparkle--; }
  drawProgress(W, H);
  drawCRTLines(W, H);

  if (flashTimer > 0) flashTimer--;
  if (entryPulse < 1) entryPulse = Math.min(1, entryPulse + 0.09);
  if (victoryMode) stepVictory(W, H);

  animId = requestAnimationFrame(render);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function start() {
  init();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  active = true;
  animId = requestAnimationFrame(render);
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function keystroke(key) {
  if (!active || victoryMode) return;
  if (!(key && key.length === 1)) return;

  totalTyped++;
  if (wordChars.length < 32) wordChars.push(key);
  entryPulse = 0; // restart the eased landing pulse

  const W = canvas ? canvas.width : 0;
  const H = canvas ? canvas.height : 0;
  // Burst lands ON the champion (#1) slot in the left margin — visible stage
  // real-estate, never behind a panel.
  const rows = boardRows();
  const top = H * 0.20, bottom = H * 0.86;
  const step = (bottom - top) / (rows.length - 1);
  const champX = Math.round(W * 0.10);
  const champY = top; // row 0

  if (/[A-Z]/.test(key)) {
    flashTimer = 14;
    flashPeak = 14;
    spawnBurst(champX, champY, true);
  } else {
    flashTimer = 6;
    flashPeak = 6;
    spawnBurst(champX, champY, false);
  }
}

export function miss() {}

// Word boundary: record the finished word (what slotName() reads to decide what
// the #1 slot shows). The win gate is the separate cumulative totalTyped, so
// nothing here can ever move it backwards (theme-authoring.md §win-gate).
export function patternComplete() {
  if (!victoryMode && typedWords.length < MAX_WORDS_KEPT) typedWords.push(wordChars.join(''));
  wordChars = [];
  return totalTyped >= WIN_CHARS;
}

// THE RITUAL THIS LEVEL IS ABOUT. Level 24 is the one where a child types their
// OWN NAME in capitals, and the arcade's answer to that has one correct shape:
// the name locks into the #1 slot and the board celebrates it.
//
// What was here before: victoryMode flipped the score to 99999, the cursor hid,
// ONE sparkle burst fired in a corner, and `slideT` ramped 0->1 while NOTHING
// read it. An audit scored the window as differing "only in ambient star-twinkle
// and a slow glow-pulse" — technically not dead air, but well under the bar
// theme-authoring.md sets ("a distinct, era-faithful celebration... styled on the
// real game's own win moment"), and far below its own neighbours: L21's car
// drives off, L22's 28 cubes rainbow-cycle, L23 blooms fireworks.
//
// It also returned nothing, so the engine fell back to a fixed 4000ms hold and
// the card landed whenever it landed. It now declares its length, so the LEVEL
// COMPLETE card arrives exactly as the name finishes gilding.
//
// 2026-10-30 (persona playtest): the gilding was right but it was the whole show,
// and it gilded the wrong word (see WHICH WORD WAS THE NAME). It is now a staged
// sequence on clamped elapsed time (journal L36), using the centre while the
// engine has the DOM panels down for the celebration:
//
//      0-1400  YOUR NAME takes the stage — big gold letters drop in one at a
//              time at centre, each landing with a burst
//   1400-2400  it shines: a highlight sweeps across it, fireworks in the margins
//   2400-3200  it flies up and left into the #1 slot, shrinking to row size,
//              while the #1 score rolls up to 99999 and NEW HIGH SCORE pops
//   3200-end   it gilds letter by letter in the slot; more fireworks
//
// Level 24 is "modern" fidelity (act5.md: particle systems, full resolution), so
// the fireworks are additive multi-colour particle bursts.
const VICTORY_MS = 4800;
const T_SHINE = 1400, T_FLY = 2400, T_LAND = 3200, GILD_MS = 1000;
const FIREWORK_TIMES = [1500, 1850, 2200, 3400, 3800, 4200];

function victoryElapsed() {
  return Math.min(VICTORY_MS, Math.max(0, performance.now() - victoryStartMs));
}
function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

function rolledScore() {
  const e = victoryElapsed();
  const k = Math.min(1, Math.max(0, (e - T_FLY) / (T_LAND - T_FLY + 300)));
  return String(Math.round(99999 * easeOutCubic(k))).padStart(5, '0');
}

// Geometry of the #1 slot (must match drawBoard's row 0).
function slotGeom(W, H) {
  return { x: Math.round(W * 0.07), y: H * 0.20, fs: Math.max(11, Math.floor(W * 0.015)) };
}
function stageFont(W, len) {
  return Math.max(16, Math.floor(Math.min(W * 0.055, (W * 0.78) / Math.max(1, len))));
}

function drawNameStage(W, H) {
  const e = victoryElapsed();
  if (e >= T_LAND) return;              // it lives in the slot now
  const nm = entryName();
  const big = stageFont(W, nm.length);
  const slot = slotGeom(W, H);

  // Flight: centre -> #1 slot, scaling big -> row font.
  const fk = easeInOut(Math.min(1, Math.max(0, (e - T_FLY) / (T_LAND - T_FLY))));
  const fs = big + (slot.fs - big) * fk;
  ctx.save();
  ctx.font = `${Math.round(fs)}px "Press Start 2P", monospace`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const totalW = ctx.measureText(nm).width;
  const sx = W / 2 - totalW / 2, sy = H * 0.44;
  const x0 = sx + (slot.x - sx) * fk;
  const y0 = sy + (slot.y - sy) * fk;

  // A warm pool of light under the name while it holds the stage.
  if (fk < 1) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(W / 2, sy, 0, W / 2, sy, W * 0.32);
    g.addColorStop(0, `rgba(255,200,90,${0.22 * (1 - fk)})`);
    g.addColorStop(1, 'rgba(255,200,90,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, sy - W * 0.32, W, W * 0.64);
    ctx.restore();
  }

  let cx = x0;
  const per = 1100 / Math.max(1, nm.length);
  const sweep = (e - T_SHINE) / 700;                 // shine highlight position
  for (let i = 0; i < nm.length; i++) {
    const land = 150 + i * per;
    const cw = ctx.measureText(nm[i]).width;
    if (e >= land) {
      const a = Math.min(1, (e - land) / 260);
      const drop = (1 - easeOutBack(a)) * -H * 0.12;
      const near = Math.abs(sweep * (nm.length + 4) - 2 - i) < 1.2;
      ctx.fillStyle = near ? '#ffffff' : '#ffe27a';
      ctx.shadowColor = '#ffb020';
      ctx.shadowBlur = near ? 34 : 18;
      ctx.fillText(nm[i], cx, y0 + drop * (1 - fk));
    }
    cx += cw;
  }
  ctx.restore();
  ctx.shadowBlur = 0;
}

function spawnFirework(W, H, n) {
  // Margins and the top band only — never where the name is on stage.
  const spots = [[0.12, 0.30], [0.88, 0.30], [0.30, 0.13], [0.70, 0.13], [0.12, 0.66], [0.88, 0.66]];
  const [fx, fy] = spots[n % spots.length];
  const hue = (n * 67 + 30) % 360;
  for (let r = 0; r < 2; r++) spawnBurst(Math.round(W * fx), Math.round(H * fy), true, (hue + r * 40) % 360);
}

function stepVictory(W, H) {
  const e = victoryElapsed();
  bannerT = Math.min(1, Math.max(0, (e - (T_FLY + 200)) / 500));
  const nm = entryName();
  const per = 1100 / Math.max(1, nm.length);
  // One burst per centre-stage letter as it lands.
  const big = stageFont(W, nm.length);
  while (lettersLanded < nm.length && e >= 150 + lettersLanded * per + 200) {
    ctx.save();
    ctx.font = `${big}px "Press Start 2P", monospace`;
    const totalW = ctx.measureText(nm).width;
    const lx = W / 2 - totalW / 2 + ctx.measureText(nm.slice(0, lettersLanded)).width + big / 2;
    ctx.restore();
    spawnBurst(Math.round(lx), Math.round(H * 0.44), false);
    lettersLanded++;
  }
  // One burst per slot letter as it gilds.
  if (e >= T_LAND) {
    const slot = slotGeom(W, H);
    const lit = Math.floor((e - T_LAND) / Math.max(60, GILD_MS / nm.length));
    while (gildsBurst < Math.min(nm.length, lit)) {
      spawnBurst(Math.round(slot.x + (gildsBurst + 0.5) * slot.fs), Math.round(slot.y), true);
      gildsBurst++;
    }
  }
  while (fireworksFired < FIREWORK_TIMES.length && e >= FIREWORK_TIMES[fireworksFired]) {
    spawnFirework(W, H, fireworksFired);
    fireworksFired++;
  }
}

export function victory() {
  // Resolve the name ONCE, from what was typed, before anything is drawn.
  championName = resolveChampionName();
  victoryMode = true;
  victoryStartMs = performance.now();
  sparkle = 150;
  bannerT = 0;
  lettersLanded = 0;
  gildsBurst = 0;
  fireworksFired = 0;
  return VICTORY_MS;
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
