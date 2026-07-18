import { displayKey } from './hud.js';

const $ = (id) => document.getElementById(id);

export function showScreen(name, state) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  $(name + '-screen').classList.remove('hidden');
  state.screen = name;
}

export function applyLevelTheme(level) {
  document.body.className = '';
  if (level > 1) {
    document.body.classList.add('level-' + level);
  }
  updateArcadeDots(level);
}

function updateArcadeDots(level) {
  const container = $('arcade-dots');
  container.innerHTML = '';
  if (level === 3) {
    for (let i = 0; i < 30; i++) {
      const dot = document.createElement('div');
      const isPower = Math.random() > 0.85;
      dot.className = 'arcade-dot' + (isPower ? ' power' : '');
      dot.style.left = Math.random() * 100 + '%';
      dot.style.top = Math.random() * 100 + '%';
      dot.style.animationDelay = Math.random() * 2 + 's';
      container.appendChild(dot);
    }
  }
}

export function renderReadyScreen(state, level) {
  const intro = $('level-intro');

  if (state.freePlay) {
    intro.innerHTML = `
      <div>${level.name}</div>
      <div style="margin-top: 8px; font-size: 7px; color: #444;">${level.era}</div>
      <div style="margin-top: 12px;">FREE PLAY</div>
      <div style="margin-top: 8px;">EVERY KEY. FULL SENTENCES. HOW FAST CAN YOU GO?</div>
    `;
    return;
  }

  const newKeysHtml = level.newKeys.map(k => {
    let label;
    if (k === ';') label = 'THE EIGHTH KEY';
    else if (k === 'Shift') label = 'SHIFT';
    else if (k === ' ') label = 'SPACE';
    else if (k === 'Backspace') label = 'BACKSPACE';
    else if (/^[A-Z]$/.test(k)) label = k;
    else label = k.toUpperCase();
    return `<span class="new-keys">${label}</span>`;
  }).join(' AND ');
  const allKeysHtml = level.keys.map(k => {
    const isNew = level.newKeys.includes(k);
    return `<span class="${isNew ? 'new-keys' : 'keys'}">${displayKey(k)}</span>`;
  }).join(' ');

  intro.innerHTML = `
    <div>${level.name}</div>
    <div style="margin-top: 8px; font-size: 7px; color: #444;">${level.era}</div>
    <div style="margin-top: 12px;">${state.level === 1 ? 'HOME ROW KEYS' : 'NEW KEYS'}: ${newKeysHtml}</div>
    <div style="margin-top: 8px; font-size: 7px;">ALL KEYS: ${allKeysHtml}</div>
    <div style="margin-top: 8px;">${level.hint}</div>
  `;
}

// Returning-player continue screen. `level` is the level object to resume at
// (LEVELS[resumeLevel]); `learnedKeys` is the array of keys mastered before it.
// Matches the levels.md "Returning Player Flow" spec:
//   READY [NAME]! / LEVEL n — <keys> / KEYS LEARNED: <learned keys>
export function renderContinueScreen(state, level, learnedKeys) {
  $('continue-name').textContent = state.playerName;

  // "LEVEL n — <keys>": the new keys this level teaches, in the game's own
  // label vocabulary (the eighth key is never "semicolon").
  const newKeyLabels = level.newKeys.map(k => {
    if (k === ';') return 'THE EIGHTH KEY';
    if (k === 'Shift') return 'SHIFT';
    if (k === ' ') return 'SPACE';
    if (k === 'Backspace') return 'BACKSPACE';
    if (/^[A-Z]$/.test(k)) return k;
    return displayKey(k).toUpperCase();
  });
  $('continue-level').textContent = `${level.name} — ${newKeyLabels.join(' & ')}`;

  if (learnedKeys && learnedKeys.length) {
    const keysHtml = learnedKeys.map(k => displayKey(k)).join(' ');
    $('continue-learned').innerHTML = `KEYS LEARNED: <span class="learned-keys">${keysHtml}</span>`;
  } else {
    $('continue-learned').innerHTML = '';
  }

  // Reset the erase-confirm sub-panel every time the screen is shown fresh.
  $('continue-erase').classList.add('hidden');
  $('continue-restart').classList.remove('hidden');
  $('continue-prompt').classList.remove('hidden');
}

// Toggle the "ERASE ALL PROGRESS?" confirmation sub-panel. When shown, the
// normal continue/restart prompts hide so the child isn't offered two
// conflicting instructions at once.
export function showContinueEraseConfirm(show) {
  $('continue-erase').classList.toggle('hidden', !show);
  $('continue-restart').classList.toggle('hidden', show);
  $('continue-prompt').classList.toggle('hidden', show);
}

export function createStars() {
  for (let i = 0; i < 40; i++) {
    const star = document.createElement('div');
    star.className = 'star' + (Math.random() > 0.7 ? ' bright' : '');
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    document.body.appendChild(star);
  }
}
