import { FINGER_MAP } from '../levels.js';

const $ = (id) => document.getElementById(id);

export function updateHUD(state) {
  const acc = state.totalAttempts > 0
    ? Math.round((state.totalCorrect / state.totalAttempts) * 100)
    : 100;
  $('hud-accuracy').textContent = acc + '%';
  $('hud-streak').textContent = state.streak;
}

export function showFingerHint(expectedKey) {
  const hint = $('finger-hint');
  const label = FINGER_MAP[expectedKey] || 'TRY AGAIN';
  hint.innerHTML = `<div class="finger-hint-text">${label}</div>`;
}

export function displayKey(k) {
  if (k === ';') return '?';
  return k.toUpperCase();
}

export function renderKeyboard(level, activeKey, wrongKey, state) {
  const guide = $('keyboard-guide');
  guide.innerHTML = level.keys.map(k => {
    let cls = 'key-box';
    if (wrongKey === k) cls += ' wrong-key';
    else if (activeKey === k) cls += ' active-key';
    else if (k === ';' && state.level === 4) cls += ' mystery';
    else cls += ' highlight';
    const display = k === ';' ? '?' : k;
    return `<div class="${cls}">${display}</div>`;
  }).join('');
}

export function renderPrompt(state, level, pattern) {
  const seq = $('prompt-sequence');
  seq.innerHTML = pattern.map((letter, i) => {
    let cls = 'prompt-letter';
    if (i < state.currentIndex) cls += ' completed';
    else if (i === state.currentIndex) cls += ' active';
    const display = letter === ';' ? '?' : letter;
    return `<div class="${cls}" data-index="${i}">${display}</div>`;
  }).join('');

  renderKeyboard(level, pattern[state.currentIndex], null, state);
  $('finger-hint').innerHTML = '';

  $('progress-fill').style.width = '0%';
}
