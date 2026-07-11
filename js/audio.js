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
