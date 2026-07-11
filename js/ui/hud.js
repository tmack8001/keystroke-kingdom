import { FINGER_MAP } from '../levels.js';

const $ = (id) => document.getElementById(id);

// WPM is informational only — never enforced, never a failure condition.
// Standard convention: one "word" = 5 correct keystrokes. Returns null until
// 10 seconds have elapsed (not enough signal yet to show a meaningful rate).
export function computeWPM(state) {
  const elapsedMin = state.startTime ? (Date.now() - state.startTime) / 60000 : 0;
  if (elapsedMin < 10 / 60) return null;
  return Math.round((state.totalCorrect / 5) / elapsedMin);
}

function totalMistakeCount(state) {
  return Object.values(state.mistakes || {}).reduce((sum, n) => sum + n, 0);
}

// mistakeDisplay setting: 'hidden' removes the accuracy line entirely,
// 'small' is the original shipped behavior, 'prominent' brightens the line
// and adds a running mistake-count line. Never alarming — see product.md
// "Stats Are Present But Never Looming."
export function updateHUD(state, settings) {
  const mistakeDisplay = settings ? settings.mistakeDisplay : 'small';
  const statsVisible = settings ? settings.statsVisible : true;

  const acc = state.totalAttempts > 0
    ? Math.round((state.totalCorrect / state.totalAttempts) * 100)
    : 100;

  const accLine = $('hud-accuracy-line');
  const missLine = $('hud-mistakes-line');
  if (accLine) {
    accLine.classList.toggle('hidden', !statsVisible || mistakeDisplay === 'hidden');
    accLine.classList.toggle('mistakes-prominent', mistakeDisplay === 'prominent');
  }
  if (missLine) {
    missLine.classList.toggle('hidden', !statsVisible || mistakeDisplay !== 'prominent');
  }
  $('hud-accuracy').textContent = acc + '%';
  $('hud-mistakes').textContent = String(totalMistakeCount(state));
  $('hud-streak').textContent = state.streak;

  if (state.freePlay) {
    const wpm = computeWPM(state);
    $('hud-wpm').textContent = wpm === null ? '--' : String(wpm);
  }
}

// SURVIVAL ONLY. Renders the quarters (lives) line as filled/empty dots —
// same "small corner scoreboard" HUD language as everything else. Never a
// lives-lost punishment display; it only appears when the player opted in.
export function renderQuarters(remaining, total) {
  const line = $('hud-quarters-line');
  if (!line) return;
  const dots = [];
  for (let i = 0; i < total; i++) {
    dots.push(i < remaining ? '●' : '○');
  }
  $('hud-quarters').textContent = dots.join(' ');
}

export function flashBonusQuarter() {
  const el = $('hud-bonus');
  if (!el) return;
  el.classList.remove('hidden');
  void el.offsetWidth;
  el.classList.remove('hidden');
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
  setTimeout(() => el.classList.add('hidden'), 1500);
}

// hintStyle setting adjusts WHEN a hint appears, not what it says:
//  - 'obvious'  : main.js also calls this proactively when a new pattern
//                 renders (handled in main.js, not here)
//  - 'moderate' : original shipped behavior — hint on every wrong key
//  - 'subtle'   : main.js only calls this after 2+ mistakes on the same
//                 expected letter (the counting lives in main.js, since it
//                 already tracks state.mistakes)
// This function only ever renders; main.js decides whether to call it.
export function showFingerHint(expectedKey) {
  const hint = $('finger-hint');
  const label = /^[A-Z]$/.test(expectedKey)
    ? 'HOLD SHIFT, THEN THE LETTER'
    : (FINGER_MAP[expectedKey] || 'TRY AGAIN');
  hint.innerHTML = `<div class="finger-hint-text">${label}</div>`;
}

export function displayKey(k) {
  if (k === ';') return '?';
  if (k === 'Shift') return '⇧';
  if (k === ' ') return '␣';
  if (k === 'Backspace') return '⌫';
  if (k === ',') return ',';
  if (k === '.') return '.';
  if (k === '/') return '/';
  if (/^[A-Z]$/.test(k)) return k;
  return k.toUpperCase();
}

// A key-box (or prompt-letter) display label counts as a "glyph" if it's a
// multi-character label (e.g. wide key names) or one of the special symbol
// glyphs — these get a smaller font-size class so they fit their box.
function isGlyphLabel(label) {
  return label.length > 1 || label === '⇧' || label === '␣' || label === '⌫';
}

// True ANSI keyboard geometry — the guide is a real keyboard silhouette.
// Every key sits at its actual physical position with authentic row
// staggers and key widths (Tab 1.5u, Caps 1.75u, Shift 2.25u, ...).
// `w` is the key's width in units. Keys the game never teaches (Tab,
// Caps, Enter) render as permanent fog shapes — they complete the
// silhouette so learned keys sit exactly where real fingers find them.
// Each row's unit-widths sum to 15, so all rows align to the same frame.
const KEY_LAYOUT = [
  [
    { k: '`' }, { k: '1' }, { k: '2' }, { k: '3' }, { k: '4' }, { k: '5' },
    { k: '6' }, { k: '7' }, { k: '8' }, { k: '9' }, { k: '0' }, { k: '-' },
    { k: '=' }, { k: 'Backspace', w: 2 },
  ],
  [
    { k: 'Tab', w: 1.5, never: true },
    { k: 'q' }, { k: 'w' }, { k: 'e' }, { k: 'r' }, { k: 't' }, { k: 'y' },
    { k: 'u' }, { k: 'i' }, { k: 'o' }, { k: 'p' }, { k: '[' }, { k: ']' },
    { k: '\\', w: 1.5 },
  ],
  [
    { k: 'Caps', w: 1.75, never: true },
    { k: 'a' }, { k: 's' }, { k: 'd' }, { k: 'f' }, { k: 'g' }, { k: 'h' },
    { k: 'j' }, { k: 'k' }, { k: 'l' }, { k: ';' }, { k: "'" },
    { k: 'Enter', w: 2.25, never: true },
  ],
  [
    { k: 'Shift', w: 2.25 },
    { k: 'z' }, { k: 'x' }, { k: 'c' }, { k: 'v' }, { k: 'b' }, { k: 'n' },
    { k: 'm' }, { k: ',' }, { k: '.' }, { k: '/' },
    { k: 'Shift', w: 2.75 },
  ],
  [
    { k: null, w: 3.75 },           // spacer where Ctrl/Alt/Cmd live
    { k: ' ', w: 6.25 },
    { k: null, w: 5 },
  ],
];

export function renderKeyboard(level, activeKey, wrongKey, state) {
  const guide = $('keyboard-guide');

  const GAP = 4;
  const available = Math.min((window.innerWidth || 1280) - 96, 820);
  // 15 units per row; a multi-unit key spans (unit*w + GAP*(w-1)) so all
  // row widths stay equal and columns line up across rows.
  const unit = Math.max(22, Math.min(42, Math.floor((available - GAP * 14) / 15)));
  const px = (w) => Math.round(unit * w + GAP * (w - 1));
  guide.style.setProperty('--key-size', unit + 'px');
  guide.style.setProperty('--key-gap', GAP + 'px');

  const isUpperActive = /^[A-Z]$/.test(activeKey || '');

  const keyBox = ({ k, w = 1, never = false }) => {
    if (k === null) {
      return `<div class="key-spacer" style="width:${px(w)}px"></div>`;
    }
    const learned = !never && level.keys.includes(k);
    const isShiftBox = k === 'Shift';
    // When the active key is an uppercase letter, highlight BOTH Shift boxes
    // and the lowercase letter box (activeKey 'A' should light the 'a' box).
    const matchesActive = activeKey === k
      || (isUpperActive && isShiftBox)
      || (isUpperActive && activeKey.toLowerCase() === k);

    let cls = 'key-box';
    let label = '';
    if (wrongKey === k) { cls += ' wrong-key'; label = displayKey(k); }
    else if (matchesActive) { cls += ' active-key'; label = displayKey(k); }
    else if (!learned) { cls += ' fog'; }  // shape only — key not learned yet
    else if (k === ';' && state.level === 4) { cls += ' mystery'; label = displayKey(k); }
    else { cls += ' highlight'; label = displayKey(k); }

    if (label && isGlyphLabel(label)) cls += ' key-box-glyph';
    return `<div class="${cls}" style="width:${px(w)}px">${label}</div>`;
  };

  guide.innerHTML = KEY_LAYOUT
    .map(row => `<div class="key-row">${row.map(keyBox).join('')}</div>`)
    .join('');
}

// Shared token -> prompt display mapping. Preserves letter case (lowercase
// letters render lowercase, uppercase A-Z stay uppercase) unlike displayKey,
// which always uppercases plain letters for the keyboard guide.
function promptDisplay(token) {
  if (token === ';') return '?';
  if (token === ' ') return '␣';
  if (token === 'Backspace') return '⌫';
  return token;
}

export function renderPrompt(state, level, pattern) {
  const seq = $('prompt-sequence');
  seq.innerHTML = pattern.map((letter, i) => {
    let cls = 'prompt-letter';
    if (i < state.currentIndex) cls += ' completed';
    else if (i === state.currentIndex) cls += ' active';
    const display = promptDisplay(letter);
    if (display === '␣' || display === '⌫' || display === '⇧') cls += ' glyph';
    return `<div class="${cls}" data-index="${i}">${display}</div>`;
  }).join('');

  renderKeyboard(level, pattern[state.currentIndex], null, state);
  $('finger-hint').innerHTML = '';


}
