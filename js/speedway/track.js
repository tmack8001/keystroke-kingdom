// ─── Act 7 · THE SPEEDWAY — the shared race engine ──────────────────────────
//
// ONE racing session. Every track in the wing shares this file; a track module only
// supplies its era's DRAWING (`drawScene`) and its data row. All of the act's rules —
// and all of its sacred contracts — live here, exactly once.
//
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  THE SACRED WRONG-KEYPRESS CONTRACT — re-implemented here ON PURPOSE      ║
// ╚══════════════════════════════════════════════════════════════════════════╝
// Act 7 does NOT route through js/main.js's pattern engine (`handleGameKey`), which
// means it does NOT inherit the wrong-keypress contract for free. This is the single
// most important thing in the lane, and it is copied here clause-for-clause from
// CLAUDE.md §"Wrong Keypress Behavior" / product.md §3, with the same token rules as
// `handleGameKey`:
//
//   1. Wrong key  → gentle nudge sound (Audio.wrong), never harsh.
//   2. The letter STAYS ON SCREEN AND WAITS. The prompt never advances.
//   3. The mistake is logged QUIETLY to that letter's own counter. Nothing alarming
//      is displayed — the counter exists only so a future stats surface can use it.
//   4. The correct key then advances NORMALLY, with NO DOUBLE PENALTY (a single
//      `wrongOnCurrent` latch means repeated wrong keys on one letter cost one
//      attempt, not one each — byte-identical to main.js).
//   5. Pure modifier/navigation/function keydowns are IGNORED ENTIRELY and are never
//      a mistake. Tab and Escape are ignored without preventDefault, exactly as the
//      engine ignores them.
//
// And Act 7's own addition (INV-77): a wrong key never reduces CHARGE, never reduces
// speed below the floor, never moves the vehicle backwards, never decrements lap
// progress, the odometer, the lap count or the clean-run best. NOTHING IS EVER TAKEN.
// There is deliberately no on-screen streak counter in this act to "reset".
//
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  THE THROTTLE — a floor that cannot move, and a ceiling that only adds    ║
// ╚══════════════════════════════════════════════════════════════════════════╝
// (a) THE FLOOR. Every correct keystroke advances the vehicle by exactly 1/lapChars
//     of the lap. Not modulated by rate, accuracy, charge, ghost, EXPERIENCE, word
//     length, or track (INV-78). The road is made of your keystrokes and every
//     keystroke is worth the same road it was always worth — which is precisely why
//     every track is finishable by anyone at any rate.
//
// (b) THE CEILING — CHARGE. A meter that rises with correct keystrokes and decays
//     exponentially with time. It is the vehicle's SPEEDOMETER, not a second source
//     of distance: distance is produced by typing and only by typing (INV-76/78), so
//     charge drives how fast the world is rendered as moving, the gauge, the speed
//     lines and the engine note. Typing faster genuinely IS driving faster — you
//     cover the same fixed distance per key, more times per second — and the meter
//     is the honest readout of that. Because charge adds no distance, it can never
//     make a lap shorter for a fast player or longer for a slow one.
//
//     A WRONG KEY COSTS EXACTLY ZERO CHARGE. While the letter waits, the meter is
//     simply not being ADDED to, and it decays at exactly the rate it decays during
//     flawless play. An inaccurate run is slower purely because it EARNED less, never
//     because anything was TAKEN. That is the literal reading of "even in Survival,
//     wrong keys cost nothing" and it is the only reading that survives contact with
//     a real child.
//
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  NO CLOCK CAN EVER END A RUN                                             ║
// ╚══════════════════════════════════════════════════════════════════════════╝
// The lap is N CHARACTERS long, never N seconds (INV-76). The finish line arrives
// when the last character is typed, at whatever hour that happens to be. The elapsed
// time is a MEASUREMENT, never a budget. And it is measured as time-on-task: once the
// player has been idle past IDLE_GRACE_MS the race simply WAITS for them — the clock,
// the ghost and the field all hold. That can only ever make a lap time better or
// equal, never worse (and it keeps an unattended tab from advancing anything —
// journal L20). Escape always exits; the player is never trapped.

import * as Audio from '../audio.js';
import { getWinRatio } from '../settings.js';
import { computeWPM } from '../ui/hud.js';
import { buildLapWords } from './words.js';
import * as Ghost from './ghost.js';

// ─── Tuning ─────────────────────────────────────────────────────────────────
const CHARGE_PER_KEY = 0.16;     // added per CORRECT keystroke (never per wrong one)
const CHARGE_TAU_MS = 1400;      // exponential decay constant; equilibrium ≈ rate·k·τ
const IDLE_GRACE_MS = 5000;      // after this the race waits for the player
const DEFAULT_LAP_CHARS = 120;   // when a track module forgets to declare lapChars
const FIELD_SIZE = 6;            // bounded pool — allocated once in startTrack()
const FINISH_FANFARE_MS = 700;   // checkered flash before the pit board settles in

// THE ONE BAND THE ENGINE OWNS, as a fraction of canvas height. Everything the
// engine draws during a lap lives inside it; everything else on the canvas belongs to
// the track's renderer. It is handed to every renderer as `s.reserved` so a track can
// compose around it — the same idea as the DOM UI's reserved centre in
// visual-validation.md ("the UI owns the centre; the theme owns the frame"), applied
// to a wing that has no DOM UI at all.
//
// A track should keep its title plate, era gauge and ghost label OUTSIDE
// promptTop..promptBottom; the engine's panel is opaque and will cover anything drawn
// underneath it.
const RESERVED = Object.freeze({ promptTop: 0.70, promptBottom: 0.94 });

const PAL = {
  bg: '#04060c',
  fg: '#ffe9b8',
  dim: '#6d7b95',
  accent: '#ffd23f',
  done: '#5ad17a',
  wrong: '#ff7a6b',
  ghost: '#8fd6ff',
};

// ─── Session state ──────────────────────────────────────────────────────────
let canvas = null;
let ctx = null;
let animId = null;
let active = false;
let onFinish = null;
let track = null;

let phase = 'grid';              // 'grid' | 'racing' | 'finish' | 'pit'
let words = [];
let wordIndex = 0;
let charIndex = 0;
let lapChars = 0;                // the lap's REAL length: the sum of its words
let charsTyped = 0;

let totalCorrect = 0;
let totalAttempts = 0;
let wrongOnCurrent = false;
let mistakes = {};               // per-letter, quiet, never displayed alarmingly
let cleanRun = 0;                // current consecutive-correct run (for cleanBest)
let cleanRunBest = 0;

let charge = 0;
let lapMs = 0;                   // ACTIVE elapsed time (see the idle note above)
let lastFrameMs = 0;
let msSinceKey = 0;
let wrongFlashMs = 0;
let finishFlashMs = 0;

let recorder = null;
let ghostLap = null;             // the ghost we are racing: our own LAST run
let record = null;               // the TrackRecord as it stood when the lap started
let result = null;               // commitLap()'s return, for the pit board

let field = [];

// ─── Lifecycle ──────────────────────────────────────────────────────────────

export function isActive() { return active; }

export function startTrack(cvs, trackModule, opts = {}) {
  canvas = cvs || document.getElementById('invaders-canvas');
  ctx = canvas ? canvas.getContext('2d') : null;
  track = trackModule || {};
  onFinish = typeof opts.onFinish === 'function' ? opts.onFinish : null;

  // EXPERIENCE scales the ROAD, never the demand (INV-88). A higher tier is a longer
  // lap — more play — and never a required speed, accuracy or threshold. At the
  // default tier this is byte-identical to the track's own declared length.
  const declared = Number(track.lapChars) > 0 ? Number(track.lapChars) : DEFAULT_LAP_CHARS;
  const target = Math.max(8, Math.ceil(declared * getWinRatio()));

  words = buildLapWords(track, target);
  lapChars = words.reduce((sum, w) => sum + w.length, 0) || 1;

  wordIndex = 0;
  charIndex = 0;
  charsTyped = 0;
  totalCorrect = 0;
  totalAttempts = 0;
  wrongOnCurrent = false;
  mistakes = {};
  cleanRun = 0;
  cleanRunBest = 0;
  charge = 0;
  lapMs = 0;
  msSinceKey = 0;
  wrongFlashMs = 0;
  finishFlashMs = 0;
  result = null;

  record = Ghost.readRecord(track.id);
  ghostLap = record.last;                 // LAST run, never best (§5.5)
  recorder = Ghost.newRecorder();
  recorder.sample(0, 0);

  buildField();

  phase = 'grid';
  active = true;
  lastFrameMs = now();
  if (animId) cancelAnimationFrame(animId);
  animId = requestAnimationFrame(frame);
}

export function stopTrack() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  onFinish = null;
  track = null;
  recorder = null;
  ghostLap = null;
  result = null;
  field = [];
}

// The act's OBSERVABLE-STATE accessor. Act 7 draws entirely on canvas, so there is no
// DOM for a behavior test (or a QA screenshot script) to assert against — this is the
// one sanctioned window onto what the player can currently SEE. It is read-only and
// returns a copy; nothing in the act ever branches on it.
export function inspect() {
  const word = words[wordIndex] || '';
  return {
    phase,
    word,
    charIndex,
    expected: word[charIndex] || null,
    chars: charsTyped,
    lapChars,
    progress: lapChars > 0 ? charsTyped / lapChars : 0,
    charge,
    lapMs: Math.round(lapMs),
    totalCorrect,
    totalAttempts,
    mistakes: { ...mistakes },
    cleanRun,
    cleanRunBest,
    hasGhost: !!ghostLap,
    result: result ? { ...result } : null,
  };
}

// Has the lap been completed? (The hub credits a finished track however the player
// leaves it — the same shape as the text worlds' hasWon.)
export function hasWon() { return phase === 'pit' || phase === 'finish'; }

function now() {
  return (typeof performance !== 'undefined' && performance.now)
    ? performance.now()
    : Date.now();
}

// ─── Input ──────────────────────────────────────────────────────────────────

export function handleKey(e) {
  if (!active) return false;

  // Tab and Escape are ignored entirely — no preventDefault, never a mistake.
  // (The hub intercepts Escape first; this is belt and braces.)
  if (e.key === 'Tab' || e.key === 'Escape') return false;

  if (phase === 'grid') {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); beginRacing(); return true; }
    return false;
  }
  if (phase === 'finish') {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); settleToPit(); return true; }
    return false;
  }
  if (phase === 'pit') {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (onFinish) onFinish();
      return true;
    }
    return false;
  }
  return handleRaceKey(e);
}

function beginRacing() {
  phase = 'racing';
  lapMs = 0;
  msSinceKey = 0;
  lastFrameMs = now();
  recorder.sample(0, 0);
  Audio.start();
}

// THE SACRED CONTRACT. Read the banner at the top of this file before changing a
// single line here; the semantics below are deliberately identical to
// `handleGameKey` in js/main.js.
function handleRaceKey(e) {
  // 1. Modifier / navigation / function keys are ignored ENTIRELY — never a mistake.
  //    (Backspace and space are the only multi-character e.key values the engine
  //    handles at all; Act 7 words contain neither, so both fall through to the
  //    token test below and are simply rejected as out-of-alphabet.)
  if (e.key.length > 1 && e.key !== 'Backspace' && e.key !== ' ') return false;

  // 2. Everything else on a game surface must never scroll or navigate the page.
  e.preventDefault();

  // 3. Token normalization — the engine's exact allowed set.
  let key;
  if (e.key === 'Backspace') key = 'Backspace';
  else if (e.key === ' ') key = ' ';
  else if (/^[a-zA-Z;,./0-9\-=\[\]\\'`]$/.test(e.key)) key = e.key;
  else return false;

  const word = words[wordIndex] || '';
  const expected = word[charIndex];
  if (expected === undefined) return false;

  // 4. Case rule: an uppercase expected token requires an exact (shift-held) match;
  //    everything else compares lowercase, so CapsLock never matters. Act 7's pools
  //    are lowercase, so in practice this only means SHIFT-typing still works.
  const expectsUpper = /^[A-Z]$/.test(expected);
  if (!expectsUpper && key.length === 1 && key !== ' ') key = key.toLowerCase();

  if (key === expected) {
    onCorrect(expected);
  } else {
    onWrong(expected);
  }
  return true;
}

function onCorrect() {
  totalCorrect++;
  totalAttempts++;
  wrongOnCurrent = false;          // the correct key advances normally — no double penalty
  cleanRun++;
  if (cleanRun > cleanRunBest) cleanRunBest = cleanRun;

  // THE FLOOR: one keystroke, one fixed unit of road. Nothing modulates this.
  charsTyped++;
  // THE CEILING: charge is only ever ADDED to, here and nowhere else.
  charge = Math.min(1, charge + CHARGE_PER_KEY);
  msSinceKey = 0;

  Audio.correct();
  if (track && typeof track.keystroke === 'function') track.keystroke();

  recorder.sample(charsTyped / lapChars, lapMs);

  charIndex++;
  if (charIndex >= (words[wordIndex] || '').length) {
    // Word complete → the next word appears IMMEDIATELY. No pause, no gate, no
    // celebration interruption (product.md §2 "Flow Over Celebration Interruption").
    charIndex = 0;
    wordIndex++;
  }

  if (charsTyped >= lapChars || wordIndex >= words.length) crossTheLine();
}

function onWrong(expected) {
  // One attempt per LETTER, not per wrong press — repeated wrong keys on the same
  // letter are never a compounding penalty (identical to main.js's wrongOnCurrent).
  if (!wrongOnCurrent) {
    totalAttempts++;
    wrongOnCurrent = true;
  }
  // Logged quietly, per letter. Never displayed alarmingly.
  mistakes[expected] = (mistakes[expected] || 0) + 1;

  // The current clean RUN ends here, because that is what "clean" means — but
  // cleanRunBest is a maximum and can only ever rise (INV-77/83). There is no
  // on-screen streak counter in this act to reset, and nothing else changes:
  // charge, charsTyped, progress, the odometer and the lap count are untouched.
  cleanRun = 0;

  Audio.wrong();                    // gentle nudge, never harsh
  wrongFlashMs = 260;               // the letter pulses and STAYS — it does not advance
  if (track && typeof track.miss === 'function') track.miss();
}

function crossTheLine() {
  const acc = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 100;
  const ghost = recorder.finish(lapMs, totalCorrect, acc);
  result = Ghost.commitLap(track.id, ghost, { chars: totalCorrect, cleanRun: cleanRunBest });
  result.ms = Math.round(lapMs);
  result.acc = acc;
  result.wpm = computeWPM({ startTime: Date.now() - lapMs, totalCorrect });
  phase = 'finish';
  finishFlashMs = FINISH_FANFARE_MS;
  Audio.levelComplete();
}

function settleToPit() { phase = 'pit'; }

// ─── Simulation ─────────────────────────────────────────────────────────────

function buildField() {
  // Bounded pool, allocated exactly once — no per-frame allocation in the draw path.
  field = [];
  for (let i = 0; i < FIELD_SIZE; i++) {
    field.push({
      lane: -0.8 + (1.6 * i) / Math.max(1, FIELD_SIZE - 1) + (Math.random() - 0.5) * 0.12,
      // ONE name per concept. `t`/`crashed` were kept in lockstep with
      // `progress`/`spin` during the build wave while two lanes used different
      // spellings; both were retired 2026-09-13 once the renderers confirmed which
      // set they read. Two spellings for one quantity is how the blocklist copy and
      // the ghost validator both nearly drifted in this project — a third renderer
      // must not inherit an ambiguity.
      progress: 0,
      spin: 0,                             // 0..1 spin intensity, for the renderer
      speed: 1,                            // relative to the player's own pace
      mult: 0.86 + Math.random() * 0.28,   // a band AROUND the player, never a target
      wobble: Math.random() * Math.PI * 2,
      spinMs: 0,
    });
    field[i].progress = Math.random();
  }
}

// The field is ATMOSPHERE, never competition (INV-82). It is never scored, never
// ranked, never compared to the player, and nothing about it is ever stored. Its
// speed derives from the player's own rolling pace and is clamped to a band around
// it, so a slow player is never alone on an empty track and a fast player is never
// driving through parked cars. They crash comically; the player never can.
function updateField(dt) {
  const seconds = Math.max(0.001, dt / 1000);
  const activeSec = lapMs / 1000;
  const paceLapsPerSec = activeSec > 1.5
    ? Math.min(0.2, Math.max(0.004, (charsTyped / lapChars) / activeSec))
    : 0.02;
  for (let i = 0; i < field.length; i++) {
    const c = field[i];
    c.wobble += seconds * 0.8;
    if (c.spinMs > 0) {
      c.spinMs = Math.max(0, c.spinMs - dt);
      // (recovering — spin decays below)
    } else if (Math.random() < 0.0012 * (dt / 16.7)) {
      // A comic spin — they wobble, trail smoke and recover. Gated on the player
      // being engaged (journal L20) so an unattended tab never simulates anything.
      c.spinMs = 900 + Math.random() * 700;
    }
    c.spin = Math.min(1, Math.max(0, c.spinMs / 1600));
    const rel = c.mult * (c.spinMs > 0 ? 0.35 : 1) * (1 + 0.08 * Math.sin(c.wobble));
    c.speed = Math.min(4, Math.max(0, rel));
    c.progress += paceLapsPerSec * rel * seconds;
    while (c.progress >= 1) c.progress -= 1;   // they run their own laps; being passed is scenery
    c.lane += Math.sin(c.wobble * 0.6) * seconds * 0.05;
    c.lane = Math.min(1, Math.max(-1, c.lane));
  }
}

function frame() {
  if (!active) return;
  const t = now();
  let dt = t - lastFrameMs;
  lastFrameMs = t;
  // Clamp every frame-driven value. A backgrounded tab hands back a multi-second dt
  // and a sentinel frame value into geometry is how journal F1 crashed every Level 4
  // victory for weeks.
  if (!Number.isFinite(dt) || dt < 0) dt = 0;
  dt = Math.min(dt, 100);

  if (phase === 'racing') {
    msSinceKey += dt;
    // THE RACE WAITS FOR YOU. Past the grace window nothing advances: not the clock,
    // not the ghost, not the field. This can only ever make a lap time better or
    // equal — it never takes anything, and it keeps an idle tab inert (L20).
    const waiting = msSinceKey > IDLE_GRACE_MS;
    if (!waiting) {
      lapMs += dt;
      // Charge decays continuously with the race's own time, at exactly the same
      // rate during flawless play and during a mistake. It is the ambient condition,
      // never a penalty. It is floored at 0 and can never go negative.
      charge = Math.max(0, Math.min(1, charge * Math.exp(-dt / CHARGE_TAU_MS)));
      updateField(dt);
      recorder.sample(charsTyped / lapChars, lapMs);
    }
  }
  if (wrongFlashMs > 0) wrongFlashMs = Math.max(0, wrongFlashMs - dt);
  if (finishFlashMs > 0) {
    finishFlashMs = Math.max(0, finishFlashMs - dt);
    if (finishFlashMs === 0 && phase === 'finish') settleToPit();
  }

  draw();
  animId = requestAnimationFrame(frame);
}

// ─── Drawing ────────────────────────────────────────────────────────────────

function sizeCanvas() {
  if (!canvas) return;
  if (canvas.width !== window.innerWidth) canvas.width = window.innerWidth;
  if (canvas.height !== window.innerHeight) canvas.height = window.innerHeight;
}

// The state handed to a track's own renderer. The first six fields are the fixed
// contract; everything after is additive convenience a renderer may ignore.
function sceneState() {
  const progress = Math.min(1, Math.max(0, charsTyped / lapChars));
  const gp = phase === 'grid' ? null : Ghost.ghostProgressAt(ghostLap, lapMs);
  return {
    progress,
    ghostProgress: gp,
    charge,
    chars: charsTyped,
    ms: Math.round(lapMs),
    field,
    // — additive —
    speed: 0.3 + 0.7 * charge,      // a ready-made scroll multiplier, 0.3..1
    idle: msSinceKey > IDLE_GRACE_MS && phase === 'racing',
    phase,
    lapChars,
    ghostFinished: gp !== null && gp >= 1,
    reserved: RESERVED,
  };
}

function draw() {
  if (!ctx || !canvas) return;
  sizeCanvas();
  const W = canvas.width;
  const H = canvas.height;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowBlur = 0;
  ctx.fillStyle = PAL.bg;
  ctx.fillRect(0, 0, W, H);

  const s = sceneState();
  if (track && typeof track.drawScene === 'function') {
    ctx.save();
    try { track.drawScene(ctx, W, H, s); } catch { /* a renderer must never break the lap */ }
    ctx.restore();
  } else {
    drawPlaceholderRoad(W, H, s);
  }

  // Reset every piece of inherited 2D state the track may have left behind —
  // canvas state leaks between screens and between draw functions (journal L28).
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1;

  if (!track || typeof track.drawScene !== 'function') drawFallbackNameplate(W, H);
  if (phase === 'grid') drawStartLineCard(W, H);
  else if (phase === 'racing') drawPrompt(W, H);
  else drawPitBoard(W, H);

  drawScanlines(W, H);
}

// A plain, era-neutral road, drawn only when a track module has no renderer yet.
// The wing is never blank (INV-90's shape): a missing renderer costs the scenery,
// never the lap.
function drawPlaceholderRoad(W, H, s) {
  const horizon = H * 0.34;
  ctx.fillStyle = '#0a1020';
  ctx.fillRect(0, horizon, W, H * RESERVED.promptTop - horizon);
  ctx.strokeStyle = '#233350';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.5 - W * 0.06, horizon);
  ctx.lineTo(W * 0.04, H * RESERVED.promptTop);
  ctx.moveTo(W * 0.5 + W * 0.06, horizon);
  ctx.lineTo(W * 0.96, H * RESERVED.promptTop);
  ctx.stroke();
  const y = horizon + (H * RESERVED.promptTop - horizon) * (0.15 + 0.8 * s.progress);
  ctx.fillStyle = PAL.accent;
  ctx.fillRect(W * 0.5 - 10, y - 6, 20, 12);
  if (s.ghostProgress !== null) {
    const gy = horizon + (H * RESERVED.promptTop - horizon) * (0.15 + 0.8 * s.ghostProgress);
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = PAL.ghost;
    ctx.fillRect(W * 0.5 - 10, gy - 6, 20, 12);
    ctx.globalAlpha = 1;
  }
}

// THE LAYOUT DIVISION (docs/specs §5.6 / visual-validation.md's contract, applied to
// a wing with no DOM UI): the ENGINE owns exactly one band — the prompt panel strip,
// RESERVED.promptTop..promptBottom — and draws everything of its own INSIDE it. The
// TRACK owns the whole rest of the canvas: scenery, vehicles, the era gauge, its own
// title plate. That is why there is no engine top band any more: a renderer's title,
// course board and gauge were colliding with duplicated engine chrome.
//
// The one exception is a track with no renderer at all, which gets a plain nameplate
// so the screen is never anonymous.
function drawFallbackNameplate(W, H) {
  const title = String((track && track.title) || 'THE SPEEDWAY');
  const year = track && track.year ? String(track.year) : '';
  const px = Math.max(9, Math.floor(W * 0.011));
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `${px}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.dim;
  ctx.fillText(title.toUpperCase(), Math.round(W * 0.03), Math.round(H * 0.045));
  if (year) {
    ctx.fillStyle = 'rgba(109,123,149,0.75)';
    ctx.fillText(year, Math.round(W * 0.03), Math.round(H * 0.045) + px * 1.9);
  }
}

// A scrim panel — full-opacity muted colours over a darkened plate, never element
// opacity (journal L2/F3: opacity halves every contrast ratio).
function scrim(x, y, w, h) {
  // OPAQUE on purpose: this plate is the boundary between the track's picture and
  // the engine's HUD. A translucent plate let a renderer's own gauge bleed through
  // the typing prompt (found in the Lane B/C integration smoke). Dimming is a scrim
  // panel plus full-opacity muted colours, never element opacity (journal L2/F3).
  ctx.fillStyle = PAL.bg;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255,210,63,0.28)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
}

function drawStartLineCard(W, H) {
  const w = W * 0.56;
  const h = H * 0.3;
  const x = W * 0.5 - w / 2;
  const y = H * 0.34;
  scrim(x, y, w, h);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const big = Math.max(14, Math.floor(W * 0.02));
  const small = Math.max(9, Math.floor(W * 0.011));

  ctx.font = `${big}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.fg;
  ctx.fillText(String((track && track.title) || 'THE SPEEDWAY').toUpperCase(), W / 2, y + h * 0.26);

  ctx.font = `${small}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.dim;
  if (track && track.year) ctx.fillText(String(track.year), W / 2, y + h * 0.45);

  ctx.fillStyle = ghostLap ? PAL.ghost : PAL.accent;
  ctx.fillText(
    ghostLap ? 'YOUR LAST LAP IS OUT THERE WITH YOU' : 'FIRST LAP — YOU SET THE PACE',
    W / 2, y + h * 0.63,
  );

  ctx.fillStyle = PAL.dim;
  ctx.fillText('SPACE TO GO    ·    ESC: BACK TO THE PITS', W / 2, y + h * 0.83);
}

// Everything the engine guarantees the player can see lives in this one panel:
//   row A — the ghost's identity line + the lap PROGRESS bar (a readout that only
//           ever fills; never a timer, never a countdown)
//   row B — the word being typed, letter by letter
//   row C — the CHARGE meter (a track's era gauge is a richer re-skin of this same
//           number, drawn by the track; this plain bar is the always-present floor)
function drawPrompt(W, H) {
  const word = words[wordIndex] || '';
  const top = H * RESERVED.promptTop;
  const h = H * (RESERVED.promptBottom - RESERVED.promptTop);
  const w = W * 0.72;
  const x = W * 0.5 - w / 2;
  scrim(x, top, w, h);

  const small = Math.max(9, Math.floor(W * 0.010));
  ctx.font = `${small}px "Press Start 2P", monospace`;
  ctx.textBaseline = 'middle';

  // ── row A ────────────────────────────────────────────────────────────────
  const rowA = top + h * 0.17;
  // The ghost's identity line. It is YOU, last time — never RIVAL, never OPPONENT,
  // never a name, and never a position (INV-80). It is present on every frame of
  // every lap, whether or not a track chooses to label its own ghost car.
  ctx.textAlign = 'left';
  if (ghostLap) {
    ctx.fillStyle = PAL.ghost;
    ctx.fillText('GHOST · YOU · LAST TIME', x + w * 0.045, rowA);
  } else {
    ctx.fillStyle = PAL.dim;
    ctx.fillText('FIRST LAP · YOU SET THE PACE', x + w * 0.045, rowA);
  }

  const barW = w * 0.34;
  const barX = x + w - w * 0.045 - barW;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(barX, rowA - 4, barW, 8);
  const p = Math.min(1, Math.max(0, charsTyped / lapChars));
  ctx.fillStyle = PAL.accent;
  ctx.fillRect(barX, rowA - 4, barW * p, 8);
  const gp = Ghost.ghostProgressAt(ghostLap, lapMs);
  if (gp !== null) {
    ctx.fillStyle = PAL.ghost;
    ctx.fillRect(barX + barW * Math.min(1, gp) - 2, rowA - 9, 4, 18);
  }

  // ── row B — the word ─────────────────────────────────────────────────────
  const px = Math.max(16, Math.min(Math.floor(W * 0.026),
    Math.floor((w * 0.86) / Math.max(1, word.length) / 1.35)));
  ctx.font = `${px}px "Press Start 2P", monospace`;
  const spacing = px * 1.35;
  const totalW = word.length * spacing;
  let cx = W / 2 - totalW / 2 + spacing / 2;
  const cy = top + h * 0.52;
  const flash = wrongFlashMs > 0;

  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    let color;
    if (i < charIndex) color = PAL.done;
    else if (i === charIndex) color = flash ? PAL.wrong : PAL.accent;
    else color = PAL.fg;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = i === charIndex ? 14 : 0;
    ctx.textAlign = 'center';
    ctx.fillText(ch.toUpperCase(), cx, cy);
    ctx.shadowBlur = 0;
    if (i === charIndex) {
      // The active letter sits on a lit plate so it reads as "this one, waiting".
      ctx.fillStyle = flash ? 'rgba(255,122,107,0.85)' : 'rgba(255,210,63,0.85)';
      ctx.fillRect(cx - spacing * 0.36, cy + px * 0.72, spacing * 0.72, 3);
    }
    cx += spacing;
  }

  // ── row C — CHARGE ───────────────────────────────────────────────────────
  const rowC = top + h * 0.84;
  ctx.font = `${small}px "Press Start 2P", monospace`;
  ctx.textAlign = 'left';
  ctx.fillStyle = PAL.dim;
  ctx.fillText('CHARGE', x + w * 0.045, rowC);
  const gw = w * 0.6;
  const gx = x + w * 0.20;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(gx, rowC - 6, gw, 12);
  ctx.fillStyle = charge > 0.75 ? PAL.accent : PAL.done;
  ctx.fillRect(gx, rowC - 6, gw * Math.min(1, Math.max(0, charge)), 12);

  if (msSinceKey > IDLE_GRACE_MS) {
    ctx.textAlign = 'right';
    ctx.fillStyle = PAL.ghost;
    ctx.fillText('THE RACE IS WAITING FOR YOU', x + w - w * 0.045, rowC);
  }
  ctx.textAlign = 'left';
}

// ─── The pit board ──────────────────────────────────────────────────────────
//
// NO NEGATIVE NUMBER AND NO MINUS SIGN IS EVER DISPLAYED (INV-83). Structurally, not
// by convention: `fmtTime` clamps its input at zero before formatting, so it cannot
// emit a '-'; the improvement line is built ONLY inside `if (improvedMs > 0)`; and
// there is no "slower by" branch anywhere in this file to reach. A slower lap simply
// OMITS the line and shows YOUR TIME and YOUR BEST as two unannotated facts with no
// verdict attached. LAPS, ODOMETER and LONGEST CLEAN RUN only ever rise — iRacing's
// permanent record of your mistakes, inverted into a permanent record of your driving.
//
// There is no placement, no position, no finish order and no defeat string, here or
// anywhere else in the act. The field does not appear on this board at all.

export function formatLapTime(ms) {
  const t = Math.max(0, Math.round(Number(ms) || 0));   // can never format a minus
  const tenths = Math.floor(t / 100) % 10;
  const totalSec = Math.floor(t / 1000);
  const m = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${m}:${String(sec).padStart(2, '0')}.${tenths}`;
}

function fmtSeconds(ms) {
  const t = Math.max(0, Number(ms) || 0);
  return (Math.round(t / 100) / 10).toFixed(1);
}

function drawPitBoard(W, H) {
  const r = result || {};
  const rec = r.record || Ghost.emptyRecord();
  const w = W * 0.62;
  const h = H * 0.62;
  const x = W * 0.5 - w / 2;
  const y = H * 0.18;
  scrim(x, y, w, h);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const big = Math.max(14, Math.floor(W * 0.019));
  const row = Math.max(9, Math.floor(W * 0.011));

  ctx.font = `${big}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.accent;
  ctx.shadowColor = PAL.accent;
  ctx.shadowBlur = phase === 'finish' ? 18 : 8;
  ctx.fillText('LAP COMPLETE', W / 2, y + h * 0.11);
  ctx.shadowBlur = 0;

  // The two warm lines. Each appears only when it is TRUE; neither has an opposite.
  // A slower lap simply has no line here — and the facts below move UP to fill the
  // space, so its absence never reads as a blank where something should have been.
  const hasWarmLine = r.firstLap || r.improvedMs > 0;
  ctx.font = `${row}px "Press Start 2P", monospace`;
  let ly = y + h * 0.22;
  if (r.firstLap) {
    ctx.fillStyle = PAL.ghost;
    ctx.fillText('FIRST LAP — YOU SET THE PACE', W / 2, ly);
    ly += row * 2.2;
    ctx.fillStyle = PAL.dim;
    ctx.fillText('THIS LAP IS NOW YOUR PACE CAR', W / 2, ly);
  } else if (r.improvedMs > 0) {
    ctx.fillStyle = PAL.done;
    ctx.fillText(`FASTER THAN LAST TIME BY ${fmtSeconds(r.improvedMs)} SECONDS`, W / 2, ly);
    if (r.isBest) {
      ly += row * 2.2;
      ctx.fillStyle = PAL.accent;
      ctx.shadowColor = PAL.accent;
      ctx.shadowBlur = 12;
      ctx.fillText('NEW BEST', W / 2, ly);
      ctx.shadowBlur = 0;
    }
  }

  // Facts. Two columns, no verdicts.
  const rows = [
    ['YOUR TIME', formatLapTime(r.ms)],
    ['YOUR BEST', rec.best ? formatLapTime(rec.best.ms) : formatLapTime(r.ms)],
    ['LETTERS TYPED', String(Math.max(0, totalCorrect))],
    ['LONGEST CLEAN RUN', String(Math.max(0, cleanRunBest))],
    ['LAPS', String(Math.max(0, rec.laps))],
    ['ODOMETER', String(Math.max(0, rec.chars))],
  ];
  if (r.wpm !== null && r.wpm !== undefined) rows.push(['WPM', String(Math.max(0, r.wpm))]);

  const startY = y + h * (hasWarmLine ? 0.40 : 0.28);
  const step = h * 0.085;
  rows.forEach((pair, i) => {
    const ry = startY + i * step;
    ctx.textAlign = 'left';
    ctx.fillStyle = PAL.dim;
    ctx.fillText(pair[0], x + w * 0.12, ry);
    ctx.textAlign = 'right';
    ctx.fillStyle = PAL.fg;
    ctx.fillText(pair[1], x + w * 0.88, ry);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = PAL.dim;
  ctx.fillText('SPACE — BACK TO THE PITS', W / 2, y + h * 0.94);
  ctx.textAlign = 'left';
}

function drawScanlines(W, H) {
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
}
