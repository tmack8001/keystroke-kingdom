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

// Slot picker ("CHOOSE YOUR GAME") — the returning-player front door. `slots`
// is Slots.listSlots(): an array of { name, furthestLevel, cardsFound } | null.
// Each filled slot shows its name, level, and a Skulltula-style cards-found
// count. Rows are built with createElement so the player-chosen NAME goes in via
// textContent only (security.md rule 1 — never innerHTML for user text).
export function renderSlotsScreen(state, slots) {
  const list = $('slots-list');
  list.innerHTML = '';
  slots.forEach((slot, i) => {
    const row = document.createElement('div');
    row.className = 'slot-row'
      + (i === state.slotsSelected ? ' selected' : '')
      + (slot ? '' : ' empty');

    const cursor = document.createElement('span');
    cursor.className = 'slot-cursor';
    cursor.textContent = i === state.slotsSelected ? '▶' : ' ';

    const num = document.createElement('span');
    num.className = 'slot-num';
    num.textContent = String(i + 1);

    const name = document.createElement('span');
    name.className = 'slot-name';
    name.textContent = slot ? slot.name : '— EMPTY —';

    row.appendChild(cursor);
    row.appendChild(num);
    row.appendChild(name);

    if (slot) {
      const lvl = document.createElement('span');
      lvl.className = 'slot-level';
      lvl.textContent = 'LV ' + slot.furthestLevel;
      const cards = document.createElement('span');
      cards.className = 'slot-cards';
      cards.textContent = '★ ' + slot.cardsFound;
      row.appendChild(lvl);
      row.appendChild(cards);
    }
    list.appendChild(row);
  });

  // ...plus an always-present "NEW GAME" row (index == slots.length), so a
  // family can always add another player — the list of games is unlimited.
  const newRow = document.createElement('div');
  newRow.className = 'slot-row slot-new' + (slots.length === state.slotsSelected ? ' selected' : '');
  const nc = document.createElement('span');
  nc.className = 'slot-cursor';
  nc.textContent = slots.length === state.slotsSelected ? '▶' : ' ';
  const nl = document.createElement('span');
  nl.className = 'slot-name slot-new-label';
  nl.textContent = '+ NEW GAME';
  newRow.append(nc, nl);
  list.appendChild(newRow);

  // Erase-confirm sub-panel: when shown, hide the action hint so the child isn't
  // offered two conflicting instructions at once (mirrors the old continue flow).
  const confirming = !!state.slotsEraseConfirm;
  $('slots-erase').classList.toggle('hidden', !confirming);
  $('slots-hint').classList.toggle('hidden', confirming);
}

// Card collection gallery for one slot. `cards` is allCards(); `collectedSet` is
// a Set of collected card ids. Found cards reveal their word + title; unfound
// ones show a "???" silhouette to tease replay. All card text is fixed literal
// data (never user input), so textContent is used purely for consistency.
export function renderCollectionScreen(state, cards, collectedSet) {
  const grid = $('collection-grid');
  grid.innerHTML = '';
  let found = 0;
  cards.forEach(card => {
    const owned = collectedSet.has(card.id);
    if (owned) found++;
    const cell = document.createElement('div');
    cell.className = 'collection-cell'
      + (owned ? ' owned' : ' locked')
      + (card.secret ? ' secret' : '');

    const label = document.createElement('span');
    label.className = 'collection-cell-label';
    label.textContent = owned ? card.word.toUpperCase() : '???';
    cell.appendChild(label);

    if (owned) {
      const title = document.createElement('span');
      title.className = 'collection-cell-title';
      title.textContent = card.title;
      cell.appendChild(title);
    }
    grid.appendChild(cell);
  });
  $('collection-count').textContent = '★ ' + found + ' / ' + cards.length;
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
