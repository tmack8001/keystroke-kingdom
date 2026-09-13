let ctx = null;
let enabled = true;

// settings.js owns the persisted value; this is just the runtime gate every
// play function below consults. Muting never touches gameplay logic — the
// wrong-key contract and survival timers run identically with sound off.
export function setEnabled(v) {
  enabled = !!v;
}

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function play(freq, duration, type, vol) {
  if (!enabled) return;
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type || 'square';
  osc.frequency.setValueAtTime(freq, c.currentTime);
  gain.gain.setValueAtTime(vol || 0.08, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export function correct() {
  play(880, 0.08, 'square', 0.06);
  setTimeout(() => play(1320, 0.1, 'square', 0.04), 60);
}

export function wrong() {
  play(150, 0.15, 'sawtooth', 0.05);
}

export function coin() {
  play(988, 0.08, 'square', 0.06);
  setTimeout(() => play(1319, 0.12, 'square', 0.06), 80);
}

export function levelComplete() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((n, i) => {
    setTimeout(() => play(n, 0.2, 'square', 0.06), i * 120);
  });
}

export function start() {
  play(440, 0.1, 'square', 0.05);
  setTimeout(() => play(660, 0.1, 'square', 0.05), 100);
  setTimeout(() => play(880, 0.15, 'square', 0.05), 200);
}

// SURVIVAL ONLY. Fires when a pattern's timer runs out — gentle but dramatic,
// never harsh. This is not the wrong-key sound's job: wrong keys never cost
// anything, even in survival. This sting only ever follows a clock, not a
// keypress.
export function timeout() {
  wrong();
  setTimeout(() => wrong(), 140);
}

// SURVIVAL ONLY. The mercy-mechanic chime — a quarter earned back on a
// 15-streak. Bright and small, an arcade "bonus life" wink.
export function bonusQuarter() {
  play(1046, 0.09, 'square', 0.05);
  setTimeout(() => play(1568, 0.14, 'square', 0.05), 90);
}

// SURVIVAL ONLY. Warm, not mean — this is the game's only failure state and
// it must never mock the player.
export function gameOver() {
  const notes = [392, 330, 262];
  notes.forEach((n, i) => {
    setTimeout(() => play(n, 0.3, 'triangle', 0.05), i * 180);
  });
}

// ─── The dial-up handshake chirp (easter egg) ────────────────────────────────
//
// Half a second of modem, played ONCE, underneath the door-opening chord when the
// Mystery Cabinet swings aside and the Computer Wing is revealed for the first
// time (js/mystery.js phase 5; .claude/rules/easter-eggs.md Proposed #5, "BBS
// era"). It is TEXTURE, not a performance: it sits under the sustained chord that
// transitions.md specifies for that beat and is gone before the chord peaks.
//
// HISTORY (research/wiki/culture/dialup-modem.md, verified 2026-07-13 — the
// arcade-historian's page, not model memory): the "handshake" was the audible
// process of two modems testing the phone line and negotiating transmission speed
// and compression/error-correction protocol before any data moved. Hayes pioneered
// the built-in speaker that let a person HEAR that negotiation, and competitors
// copied it, which is why the screech/warble became a near-universal shared
// experience of getting online through the 1980s-90s. That era-matches the Computer
// Wing exactly (Act 2, 1981-1986): the first public dial-up BBS, CBBS, was already
// running in Chicago from February 1978.
//
// DELIBERATELY NOT CLAIMED: the wiki page documents the handshake's PURPOSE and its
// cultural footprint, not its spectrum. The frequencies below were chosen by ear for
// a warm, recognizable, kid-safe texture — they are NOT transcribed from any
// signalling standard, and nothing here should be read as asserting one.
//
// TONE (the One Rule): a modem chirp is nostalgia, never a klaxon. Everything is
// band-limited, softly enveloped, and mixed well under the chord — no harsh
// sawtooth, no full-volume screech, nothing that could startle a child. And it is
// purely decorative: it never gates, delays, or blocks the cinematic, and if audio
// is off or the context refuses to start, the sequence plays identically.
// `delay` (seconds) lets the caller slide the chirp under a sound that starts a
// beat later — mystery.js hands it ~0.45s so the chirp runs beneath the hinge
// slide rather than in front of it.
export function modemChirp(delay = 0) {
  if (!enabled) return;
  let c;
  try {
    c = getCtx();
  } catch (_) {
    return; // no WebAudio (or blocked) — the cinematic is unaffected
  }
  const d = Number.isFinite(delay) ? Math.max(0, Math.min(5, delay)) : 0;
  const t0 = c.currentTime + d;

  // Shared bus so the whole chirp mixes at one low level, well under the beat it
  // rides: mystery.js's chord voices peak ~0.018 (x4, summed) and its hinge slide
  // ~0.032 + a 0.02 sub. This trim puts the chirp's loudest moment around 0.011 —
  // clearly there, never the thing you notice first. Texture, not performance.
  const bus = c.createGain();
  bus.gain.setValueAtTime(0.009, t0);
  bus.connect(c.destination);

  // 1) The answer-tone pair (~0-0.22s): two steady sines, the "beeee-oooo" that
  //    opens the negotiation. Sine, not square — round, never piercing.
  [1100, 1640].forEach((freq, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    const s = t0 + i * 0.1;
    g.gain.setValueAtTime(0.0001, s);
    g.gain.linearRampToValueAtTime(0.9, s + 0.02);
    g.gain.setValueAtTime(0.9, s + 0.09);
    g.gain.linearRampToValueAtTime(0.0001, s + 0.14);
    osc.connect(g);
    g.connect(bus);
    osc.start(s);
    osc.stop(s + 0.16);
  });

  // 2) The warble (~0.18-0.42s): one voice sliding through a few pitches — the
  //    "negotiating" wobble. Triangle keeps the harmonics soft.
  const warble = c.createOscillator();
  const wGain = c.createGain();
  warble.type = 'triangle';
  warble.frequency.setValueAtTime(1850, t0 + 0.18);
  warble.frequency.linearRampToValueAtTime(900, t0 + 0.27);
  warble.frequency.linearRampToValueAtTime(1500, t0 + 0.34);
  warble.frequency.linearRampToValueAtTime(1050, t0 + 0.42);
  wGain.gain.setValueAtTime(0.0001, t0 + 0.18);
  wGain.gain.linearRampToValueAtTime(0.7, t0 + 0.22);
  wGain.gain.linearRampToValueAtTime(0.0001, t0 + 0.44);
  warble.connect(wGain);
  wGain.connect(bus);
  warble.start(t0 + 0.18);
  warble.stop(t0 + 0.46);

  // 3) The carrier hiss tail (~0.3-0.55s): a short band-passed noise burst — the
  //    scrambled-data "shhhh" the handshake settles into before the line goes
  //    quiet. Band-passed so it reads as a distant phone line, not static.
  const frames = Math.max(1, Math.floor(c.sampleRate * 0.25));
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const band = c.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.setValueAtTime(1250, t0 + 0.3);
  band.Q.setValueAtTime(1.2, t0 + 0.3);
  const nGain = c.createGain();
  nGain.gain.setValueAtTime(0.0001, t0 + 0.3);
  nGain.gain.linearRampToValueAtTime(0.55, t0 + 0.35);
  nGain.gain.linearRampToValueAtTime(0.0001, t0 + 0.55);
  noise.connect(band);
  band.connect(nGain);
  nGain.connect(bus);
  noise.start(t0 + 0.3);
  noise.stop(t0 + 0.56);
}
