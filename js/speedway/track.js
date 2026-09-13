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
const FIELD_SIZE = 8;            // bounded pool — allocated once in startTrack()
                                 // (kit.js keeps exactly 8 normalised field slots)

// ── THE FIELD'S POSITION BAND (Trevor's play-test, 2026-09-13) ─────────────
// "the opponents within f-zero are only visible towards the end … and not
// reachable/passable." The cause was that the field's SPEED was given a band around
// the player (`mult`) but its POSITION never was: cars were seeded at a random
// ABSOLUTE lap fraction and then ran at roughly the player's pace, so whoever
// happened to start outside the camera's narrow window stayed outside it for the
// whole lap. Position now gets the same treatment as speed — every car holds a
// signed offset FROM the player and is recycled, off camera, when it leaves the
// band. There is always somebody just up the road.
//
// The band is a superset of both cameras' visible windows (Monaco's overhead strip
// reaches ≈ -0.16..+0.24 of a lap; F-Zero's Mode 7 plane ≈ -0.02..+0.26), so a
// recycle always happens out of sight.
const FIELD_BAND_AHEAD = 0.34;   // lap fractions of road visible/held in front
const FIELD_BAND_BEHIND = 0.22;  // …and behind

// A word completed is the act's one moment of spectacle-per-keystroke. It is PURE
// SPEED-FEEL: it adds charge-flavoured shine, never distance (INV-78 — progress is
// `charsTyped / lapChars` and nothing else writes to it).
const BOOST_MS = 900;
const BOOST_CHARGE = 0.10;       // still only ever ADDED (INV-79)

// The celebration window. theme-authoring.md: victory() IS the celebration, and a
// theme without one is dead air — a product violation. A track may declare its own
// `celebrationMs`; it is clamped to the same 1200–6000 ms band every level theme is.
const CELEBRATION_MIN_MS = 1200;
const CELEBRATION_MAX_MS = 6000;
const CELEBRATION_DEFAULT_MS = 2600;

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

// A monotonic DECORATION clock. `lapMs` is the lap's measurement and deliberately
// stops when the race waits for the player — but every renderer drove its idle
// animation (wheel spin, rotor flicker, hover bob, marshal wave) off it, so the
// start line rendered a BYTE-IDENTICAL frozen frame: the car did not even sit there
// running. `animMs` always advances so a track can be ALIVE while standing still.
// It is decoration only — nothing consequential is derived from it (journal L20:
// an unattended tab still advances no game state, because no game state reads this).
let animMs = 0;

let boostMs = 0;                 // word-completion kick (spectacle only)
let wordsDone = 0;
let celebrateMs = 0;             // counts DOWN through the celebration window
let celebrateTotalMs = CELEBRATION_DEFAULT_MS;

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
  animMs = 0;
  boostMs = 0;
  wordsDone = 0;
  celebrateMs = 0;
  celebrateTotalMs = celebrationWindowFor(track);
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
  boostMs = 0;
  celebrateMs = 0;
}

// A track's own celebration length, clamped into the same window every level theme
// returns from victory() (theme-authoring.md). A track that declares nothing gets a
// real celebration anyway — never dead air.
function celebrationWindowFor(t) {
  const declared = Number(t && t.celebrationMs);
  if (!Number.isFinite(declared)) return CELEBRATION_DEFAULT_MS;
  return Math.min(CELEBRATION_MAX_MS, Math.max(CELEBRATION_MIN_MS, Math.round(declared)));
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
    wordsDone,
    boost: boostLevel(),
    celebrate: celebrationProgress(),
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
    completeWord();
  }

  if (charsTyped >= lapChars || wordIndex >= words.length) crossTheLine();
}

// A finished WORD gets a kick — Trevor, 2026-09-13: the car should "get a boost /
// go a bit faster with word completions". It is entirely SPEED-FEEL:
//
//   · it adds a little CHARGE (additive only, INV-79 — the same meter a keystroke
//     feeds, never drained by anything),
//   · it raises `boost`, a decaying 0..1 the renderers spend on flare, streaks and
//     a shove of the vehicle's own sprite,
//   · and it advances NOTHING. `charsTyped` was incremented by the keystroke that
//     finished the word and is untouched here, so lap progress stays exactly
//     `charsTyped / lapChars` (INV-78). A boosted word covers not one pixel more
//     road than an unboosted one.
//
// No pause, no modal, no gate — the next word is already on screen (product.md §2).
function completeWord() {
  wordsDone++;
  boostMs = BOOST_MS;
  charge = Math.min(1, charge + BOOST_CHARGE);
  Audio.bonusQuarter();
  if (track && typeof track.wordComplete === 'function') {
    try { track.wordComplete(); } catch { /* a renderer must never break the lap */ }
  }
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
  // THE CELEBRATION WINDOW. The pit board deliberately does NOT appear yet: for
  // this whole window the track owns the screen and plays its own era-faithful
  // finish (theme-authoring.md — "victory() IS the celebration"). The engine keeps
  // to its one band with a small checkered ribbon. Space/Enter skips straight to the
  // board at any moment; the window can never trap anyone (the One Rule).
  celebrateTotalMs = celebrationWindowFor(track);
  celebrateMs = celebrateTotalMs;
  boostMs = BOOST_MS;
  Audio.levelComplete();
}

function settleToPit() {
  phase = 'pit';
  celebrateMs = 0;
}

// 0..1 while a word-completion kick is alive; eased so it lands hard and fades.
function boostLevel() {
  if (boostMs <= 0) return 0;
  const t = Math.min(1, Math.max(0, boostMs / BOOST_MS));
  return t * t;
}

// 0..1 through the celebration window; stays at 1 once the board has settled, so a
// track can hold its finished pose (flag planted, fireworks drifting down) behind
// the pit board instead of snapping back to a racing scene.
function celebrationProgress() {
  if (phase === 'pit') return 1;
  if (phase !== 'finish') return 0;
  if (celebrateTotalMs <= 0) return 1;
  return Math.min(1, Math.max(0, 1 - celebrateMs / celebrateTotalMs));
}

// ─── Simulation ─────────────────────────────────────────────────────────────

function buildField() {
  // Bounded pool, allocated exactly once — no per-frame allocation in the draw path.
  field = [];
  const span = FIELD_BAND_AHEAD + FIELD_BAND_BEHIND;
  for (let i = 0; i < FIELD_SIZE; i++) {
    const c = {
      lane: -0.8 + (1.6 * i) / Math.max(1, FIELD_SIZE - 1) + (Math.random() - 0.5) * 0.12,
      // ONE name per concept. `t`/`crashed` were kept in lockstep with
      // `progress`/`spin` during the build wave while two lanes used different
      // spellings; both were retired 2026-09-13 once the renderers confirmed which
      // set they read. Two spellings for one quantity is how the blocklist copy and
      // the ghost validator both nearly drifted in this project — a third renderer
      // must not inherit an ambiguity.
      //
      // `rel` is the one a RENDERER reads: a signed lap-fraction offset from the
      // player. `progress` is the same car expressed as an absolute lap fraction and
      // is kept only so an older renderer still draws something sane — it WRAPS, so
      // `car.progress - playerProgress` is not a safe distance. Use `rel`.
      rel: 0,
      progress: 0,
      spin: 0,                             // 0..1 spin intensity, for the renderer
      speed: 1,                            // relative to the player's own pace
      mult: 0.86 + Math.random() * 0.28,   // a band AROUND the player, never a target
      drift: 0,                            // relative velocity, in player-paces
      wobble: Math.random() * Math.PI * 2,
      spinMs: 0,
    };
    // Seeded EVENLY across the band (plus jitter) rather than at a random absolute
    // lap fraction, so the road is populated from the very first frame instead of
    // filling in by luck somewhere around the last corner.
    c.rel = -FIELD_BAND_BEHIND + span * ((i + 0.5) / FIELD_SIZE)
      + (Math.random() - 0.5) * (span / FIELD_SIZE) * 0.7;
    rollDrift(c);
    field.push(c);
  }
}

// How fast this car moves RELATIVE to the player, as a multiple of the player's own
// pace. Never zero: a car pinned exactly at your speed is scenery you can look at but
// never reach. The bias is deliberately toward slower-than-you, so the common event
// is the good one — you catching and passing somebody. Nothing counts it (INV-82).
function rollDrift(c) {
  const slower = Math.random() < 0.62;
  c.drift = (slower ? -1 : 1) * (0.22 + Math.random() * 0.78);
}

// Put a car back at the far end of the band, off camera, with a fresh lane and pace.
function recycleCar(c, toFront) {
  c.rel = toFront
    ? FIELD_BAND_AHEAD - Math.random() * 0.02
    : -FIELD_BAND_BEHIND + Math.random() * 0.02;
  c.lane = -0.85 + Math.random() * 1.7;
  c.spinMs = 0;
  c.spin = 0;
  c.mult = 0.86 + Math.random() * 0.28;
  rollDrift(c);
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
  const playerProgress = lapChars > 0 ? Math.min(1, Math.max(0, charsTyped / lapChars)) : 0;
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
    const spinning = c.spinMs > 0;
    const rel = c.mult * (spinning ? 0.35 : 1) * (1 + 0.08 * Math.sin(c.wobble));
    c.speed = Math.min(4, Math.max(0, rel));

    // POSITION gets the same band treatment SPEED always had. A spinning car drops
    // back through the field and you drive right past it — the whole point.
    const relVel = (c.drift - (spinning ? 0.85 : 0)) * paceLapsPerSec;
    c.rel += relVel * seconds;
    if (c.rel > FIELD_BAND_AHEAD) recycleCar(c, false);
    else if (c.rel < -FIELD_BAND_BEHIND) recycleCar(c, true);

    c.lane += Math.sin(c.wobble * 0.6) * seconds * 0.05;
    c.lane = Math.min(1, Math.max(-1, c.lane));
    // Legacy absolute view of the same car (wraps). Renderers read `rel`.
    c.progress = ((playerProgress + c.rel) % 1 + 1) % 1;
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

  // The decoration clock. It advances in EVERY phase — that is what makes the car
  // idle at the start line instead of sitting there as a frozen photograph — and it
  // is read by nothing that decides anything. Wrapped well inside float precision.
  animMs = (animMs + dt) % 3600000;

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
  if (boostMs > 0) boostMs = Math.max(0, boostMs - dt);
  if (phase === 'finish') {
    celebrateMs = Math.max(0, celebrateMs - dt);
    if (celebrateMs === 0) settleToPit();
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
    // — the animation contract (2026-09-13) —
    // `ms` is the LAP's measurement and stops when the race waits. `animMs` is the
    // decoration clock and never stops: drive idle/attract motion off it.
    animMs: Math.round(animMs),
    // Standing on the grid with the engine running. The scene must be ALIVE here.
    idling: phase === 'grid',
    // 0..1, decaying: a word was just finished. Spectacle only — it moves nothing.
    boost: boostLevel(),
    wordsDone,
    // 0..1 through the track's own finish celebration; 1 once the board has settled.
    celebrate: celebrationProgress(),
    celebrating: phase === 'finish' || phase === 'pit',
    // THE RUNNING TOTALS, live. Monaco GP's real celebration lived on the CABINET,
    // not the screen — the manual (Gremlin/Sega 420-0358) describes a front panel of
    // LEDs showing the score and the machine's history. A renderer that wants to
    // build that needs the same cumulative numbers the pit board prints, so they are
    // part of the scene contract rather than something a track digs out of storage.
    // Both are cumulative and only ever rise (INV-83).
    // ── N5: THE PHASE OVERLAY ───────────────────────────────────────────
    // "The engine owns exactly one band" used to be true only while RACING. In
    // the grid and pit phases the engine drops a full card over the middle of the
    // canvas, and a track composing independently had no way to know — so Monaco
    // GP's CHARGE rail caption, and later its LAPS row, were sliced in half by it.
    //
    // The card's rect is now part of the scene contract, in canvas fractions. A
    // renderer keeps its readable furniture out of it (or simply skips what would
    // be hidden: there is nothing to read behind an opaque card). During racing and
    // the finish celebration the engine draws ONLY inside `reserved`, so there is
    // no overlay at all.
    overlay: cardRect(),
    odometer: (result && result.record)
      ? Math.max(0, result.record.chars || 0)
      : Math.max(0, (record && record.chars) || 0) + charsTyped,
    laps: (result && result.record)
      ? Math.max(0, result.record.laps || 0)
      : Math.max(0, (record && record.laps) || 0),
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
  else if (phase === 'finish') drawFinishRibbon(W, H);   // the track owns the screen
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
// ── PER-PHASE, because "one band" used to be true in only one phase ────────
// (Trevor's 1979-cabinet furniture was being covered; found 2026-09-13.)
//
//   racing  — the engine draws ONLY inside RESERVED. (Always was.)
//   finish  — same: a compact checkered ribbon inside RESERVED, nothing else, so the
//             track's celebration has the whole screen it was built for.
//   grid /  — ONE centred card. It sits outside RESERVED on purpose (there is nothing
//   pit      to read behind it in those phases) but it is now kept inside
//            CARD_SAFE_X…1-CARD_SAFE_X horizontally, so BOTH side margins — where the
//            era renderers put their course boards, charge rails and gauges — stay
//            visible. Monaco GP's CHARGE rail caption used to be sliced in half by the
//            start-line card; that is what this constant exists to prevent.
//
// The one exception is a track with no renderer at all, which gets a plain nameplate
// so the screen is never anonymous.
//
// Keep every card inside this horizontal safe area. The renderers' margin furniture
// lives outside 0.24…0.76W; a card that grows past it will cover a track's gauge.
const CARD_SAFE_X = 0.245;

// The two full cards, as canvas fractions, in ONE place — so `cardRect()` (what the
// renderers are told) and the drawing code can never disagree.
// The start-line card sits HIGH on purpose: both era renderers park the player's
// vehicle just above the engine's band (≈0.60–0.66H), and a card centred on the
// canvas covered it — which hid the one thing the grid is now for, the vehicle
// sitting there with its engine running. Raised, the card clears every vehicle and
// still leaves the top band to the track's own title plate.
const START_CARD = Object.freeze({ left: CARD_SAFE_X, right: 1 - CARD_SAFE_X, top: 0.20, bottom: 0.50 });
const PIT_CARD = Object.freeze({ left: CARD_SAFE_X, right: 1 - CARD_SAFE_X, top: 0.18, bottom: 0.80 });

// What the engine is covering RIGHT NOW, beyond its own reserved band. Null while
// racing or celebrating: in those phases the engine keeps to `RESERVED` and the
// whole rest of the canvas is the track's.
function cardRect() {
  if (phase === 'grid') return START_CARD;
  if (phase === 'pit') return PIT_CARD;
  return null;
}
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
  const w = W * (START_CARD.right - START_CARD.left);
  const h = H * (START_CARD.bottom - START_CARD.top);
  const x = W * START_CARD.left;
  const y = H * START_CARD.top;
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

// ── The finish ribbon: the engine's whole contribution to the celebration ──
//
// theme-authoring.md is explicit that victory() IS the celebration and that a theme
// without one is four seconds of dead air — a product violation. Act 7 used to slam
// the full pit board over a frozen scene 700 ms after the flag, which covered the
// player's own vehicle at the exact moment it crossed the line. Now the board waits:
// for the whole celebration window the TRACK owns the screen, and the engine keeps to
// its one band with this ribbon. Space/Enter skips to the board whenever the player
// likes — a celebration is never something you have to sit through (the One Rule).
function drawFinishRibbon(W, H) {
  const top = H * RESERVED.promptTop;
  const h = H * (RESERVED.promptBottom - RESERVED.promptTop);
  const w = W * 0.72;
  const x = W * 0.5 - w / 2;
  scrim(x, top, w, h);

  // A checkered band across the ribbon — the engine's own era-neutral flag.
  const cell = Math.max(6, Math.round(h * 0.11));
  const rows = 2;
  const bandY = top + h * 0.12;
  for (let r = 0; r < rows; r++) {
    for (let cx = x + 6; cx < x + w - 6; cx += cell) {
      const on = ((Math.round((cx - x) / cell) + r) % 2) === 0;
      ctx.fillStyle = on ? '#ffffff' : 'rgba(255,255,255,0.06)';
      ctx.fillRect(cx, bandY + r * cell, Math.min(cell, x + w - 6 - cx), cell);
    }
  }

  const big = Math.max(14, Math.floor(W * 0.019));
  const small = Math.max(9, Math.floor(W * 0.011));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${big}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.accent;
  ctx.shadowColor = PAL.accent;
  ctx.shadowBlur = 16;
  ctx.fillText('LAP COMPLETE', W / 2, top + h * 0.58);
  ctx.shadowBlur = 0;
  ctx.font = `${small}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.dim;
  ctx.fillText('SPACE — THE PIT BOARD', W / 2, top + h * 0.85);
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
  const w = W * (PIT_CARD.right - PIT_CARD.left);
  const h = H * (PIT_CARD.bottom - PIT_CARD.top);
  const x = W * PIT_CARD.left;
  const y = H * PIT_CARD.top;
  scrim(x, y, w, h);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const big = Math.max(14, Math.floor(W * 0.019));
  const row = Math.max(9, Math.floor(W * 0.011));

  ctx.font = `${big}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.accent;
  ctx.shadowColor = PAL.accent;
  ctx.shadowBlur = 8;
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
  // Two kinds of fact, and they must not be confused for each other (Trevor,
  // 2026-09-13: "the odometer should be a growing number … the sum from prior
  // games"). THIS LAP reports the lap just driven; LAPS / ODOMETER / LONGEST CLEAN
  // RUN are the track's RUNNING TOTALS out of the record — they only ever rise
  // (INV-83), across every lap the player has ever driven here.
  //
  // LONGEST CLEAN RUN used to print this lap's own best run while sitting under a
  // lifetime heading — the same per-round/cumulative mix-up as the odometer. It now
  // reads the record (which is a Math.max over every lap, this one included).
  //
  // ── WHY THERE IS NO "YOUR BEST" ROW ANY MORE ─────────────────────────────
  // The board scrupulously refuses to print "slower by", a minus sign or a verdict
  // — and then printed `THIS LAP 3:39.7` immediately above `YOUR BEST 0:32.5`,
  // which after a rough lap does exactly the job those words were forbidden from
  // doing (play-test finding, 2026-09-13). Satisfying a guardrail literally while
  // defeating the feeling it protects is still a violation. The best time is a
  // KEEPSAKE, so it lives where a keepsake belongs: on the hub's track row, read
  // calmly on the way in, never stacked under the lap you just drove. A new best is
  // still announced — by the NEW BEST line above, which is a celebration rather
  // than a comparison. Everything left on this board either describes this lap or
  // GREW because of it.
  const rows = [
    ['THIS LAP', formatLapTime(r.ms)],
    ['LETTERS THIS LAP', String(Math.max(0, totalCorrect))],
    ['LONGEST CLEAN RUN', String(Math.max(0, Math.max(rec.cleanBest || 0, cleanRunBest)))],
    ['LAPS', String(Math.max(0, rec.laps))],
    ['ODOMETER', String(Math.max(0, rec.chars))],
  ];
  if (r.wpm !== null && r.wpm !== undefined) rows.push(['WPM', String(Math.max(0, r.wpm))]);

  // ── THE ROWS FIT, AT EVERY ROW COUNT ─────────────────────────────────────
  // The old fixed 0.085h step overflowed precisely when the player did WELL: a warm
  // line pushed the block down to 0.40h, and with WPM present the seventh row
  // printed straight through `SPACE — BACK TO THE PITS` at 0.94h. A layout that
  // breaks only on the happy path is the worst possible layout. The step is now
  // MEASURED — derived from the space actually left between the block's top and the
  // footer, with a full line of clearance reserved — so it cannot collide however
  // many rows there are or which warm lines are showing.
  const footerY = y + h * 0.94;
  const startY = y + h * (hasWarmLine ? 0.40 : 0.28);
  const available = footerY - startY - row * 2.4;
  const step = Math.max(row * 1.3,
    Math.min(h * 0.085, available / Math.max(1, rows.length - 1)));
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
  ctx.fillText('SPACE — BACK TO THE PITS', W / 2, footerY);
  ctx.textAlign = 'left';
}

function drawScanlines(W, H) {
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
}
