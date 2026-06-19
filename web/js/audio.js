let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function play(freq, duration, type, vol) {
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
