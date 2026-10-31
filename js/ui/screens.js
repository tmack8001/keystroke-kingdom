import { displayKey } from './hud.js';
import {
  HISTORY_CARDS, WING_CARDS, bankProgress, cardsForAct, actCardsUnlocked,
} from '../history-cards.js';

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
// is Slots.listSlots() (an array of { name, furthestLevel, cardsFound } | null),
// optionally augmented by main.js with `arcade: { found, total }`.
// Each filled slot shows its name, level, and a Skulltula-style cards-found
// count. Rows are built with createElement so the player-chosen NAME goes in via
// textContent only (security.md rule 1 — never innerHTML for user text).
export function renderSlotsScreen(state, slots) {
  const list = $('slots-list');
  list.innerHTML = '';
  // ROW ORDER IS CREATION ORDER, AND THAT IS A DECISION, NOT AN ACCIDENT
  // (Trevor, 2026-09-17). `Slots.listSlots()` maps the stored array straight
  // through and nothing here sorts it, so a game stays on the row it was made
  // on, forever, and its number never changes.
  //
  // The obvious "improvement" is most-recently-played first, and it is wrong for
  // this picker. This is not a file list, it is a FAMILY — one row per person.
  // Order by last played and a five-year-old's row moves every time a sibling or
  // a parent plays: the position she learned to aim for, and the number key she
  // learned to press, both shift under her while she was not even at the
  // machine. A returning player should be able to walk up and press the same key
  // she pressed yesterday. Stability is a kindness at five.
  //
  // ⚠️ It matters MORE here than it would elsewhere, because the cursor does not
  // compensate: `showSlotsScreen` opens on row 1, not on the active game. With
  // creation order that is a fixed, learnable starting point; under a
  // last-played sort the highlighted row would be a different person each visit.
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
      // ★ found / total, scoped to the ARCADE bank (levels/onboarding.md shows
      // "★ 14 / 76"). main.js supplies `slot.arcade` = bankProgress('arcade', ids);
      // `cardsFound` counts EVERY bank, so printing it over TOTAL_CARDS would be the
      // CARD 63 OF 60 defect (INV-100) on the front door. Without `arcade` (an older
      // caller) fall back to the bare count rather than invent a denominator.
      cards.textContent = slot.arcade
        ? `★ ${slot.arcade.found} / ${slot.arcade.total}`
        : '★ ' + slot.cardsFound;
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

  // Name the game that Y would erase — on a shared family machine "ERASE THIS
  // GAME?" alone did not say WHOSE. textContent only: the name is player-typed
  // (security.md rule 1).
  const target = confirming ? slots[state.slotsSelected] : null;
  $('slots-erase-name').textContent = target
    ? `${target.name} · LV ${target.furthestLevel}`
    : '';

  // Offer only the keys that do something HERE. R/C/X act on a highlighted game,
  // so on the NEW GAME row — and on a machine with no games at all — they are
  // left out rather than promised and then ignored. Fixed literals only.
  const onGame = state.slotsSelected < slots.length && !!slots[state.slotsSelected];
  $('slots-hint').textContent = onGame
    ? 'SPACE PLAY · N NEW · R RENAME · C CARDS · X ERASE'
    : 'SPACE START A NEW GAME';
}

// ─── The card collection gallery — SHELVES, one per bank ────────────────────
//
// The game has THREE card banks (js/history-cards.js): the 75-card arcade
// curriculum bank, WING_CARDS (bonus wings, keyed {wing, station}), and
// ACT_CARDS (the room's own cards, keyed {act}). Until 2026-09-16 this screen
// rendered `allCards()` — the arcade bank ONLY — so the eight wing/act cards a
// player could already collect were counted by the slot picker's ★ and then
// shown on no screen in the game, ever. Trevor's ruling: "give each wing its
// own shelf."
//
// THE RULE THAT SHAPES EVERYTHING BELOW: a shelf's count is scoped to its own
// cards and nothing else. No blended numerator, no shared denominator — that
// is the CARD 63 OF 60 defect (INV-100) one layer up, and it is why there is no
// headline total on this screen any more.
//
// ⚠️ TWO TABLES HERE RESTATE FACTS THAT LIVE IN js/ui/cabinet-art.js, because
// neither BACK_WALL_DOORS nor ACTS is exported from it (journal L41: where a
// contract is unavoidably written twice, point each side at the other and pin
// agreement with a test). tests/unit/collection-shelves.test.mjs reads
// cabinet-art.js and fails if either drifts. If you export those tables one
// day, delete these and import them instead.

// A bonus wing's shelf. `unlockLevel` MUST match that wing's door in
// BACK_WALL_DOORS (js/ui/cabinet-art.js) — THE HARDWARE opens at Level 20.
//
// ⚠️ THE GLYPHS ARE CHOSEN, NOT DECORATIVE (journal O11 — glyph coverage is a
// silent failure). Press Start 2P is monospace: a character it actually owns
// measures exactly one em, anything else is drawn by a fallback font at another
// advance. Measured in the real page: ★ ☆ ▢ ◼ ♦ ♢ ▲ ◀ are covered; ▣ and ◆ — the
// two glyphs the specs asked for — are NOT, and at 9px they rendered as a smudge
// and a single dot respectively. ◼ and ♦ are the covered stand-ins. Screenshot
// any glyph you change here.
const WING_SHELVES = [
  { wing: 'hardware', heading: 'THE HARDWARE', glyph: '◼', unlockLevel: 20 },
];

// Act names, mirroring ACTS in js/ui/cabinet-art.js.
const ACT_NAMES = ['THE ARCADE', 'THE COMPUTER WING', 'THE BASEMENT', 'THE COMMAND CENTER', 'FULL CIRCLE'];

// The first cabinet of act N (five levels per act) — an act is "reachable" once
// its first cabinet is unlocked, the same test the select screen applies
// (isLevelLocked: levelNum > maxUnlockedLevel).
const firstLevelOfAct = (act) => (act - 1) * 5 + 1;

function countFound(cards, ids) {
  let found = 0;
  for (const c of cards) if (ids.has(c.id)) found += 1;
  return { found, total: cards.length };
}

/**
 * The shelves this save may see, in display order. Pure — no DOM, no storage.
 *
 * Eligibility, and why each clause is here:
 *  • THE ARCADE always shows. It is the collection the game has always had.
 *  • A wing/act shelf shows only when the player can actually REACH its cards.
 *    A counted `???` with no route is an obligation, and product.md §1 refuses
 *    to make a child feel less capable for standing still. (hardware-wing.md
 *    §5.4.4 and act-exclusive-cards.md §5.4 both adopted this independently.)
 *  • ...but a shelf is never hidden while the player HOLDS one of its cards.
 *    Hiding an earned card is the very bug this screen is being fixed for.
 *  • An EMPTY bank gets no shelf. Acts 2–5 have no cards written yet; four
 *    headings reading ♦ 0 / 0 would be clutter that promises nothing.
 *
 * SHELF SHAPE FOR ACT_CARDS — decided here, deliberately: ONE SHELF PER ACT,
 * not one "THE ROOMS" shelf for the whole bank. docs/specs/act-exclusive-cards.md
 * §5.5 specifies four cards per act, twenty total, and states the target
 * explicitly — "every shelf reads ◆ n / 4". A single bank-wide shelf would print
 * one n / 20 and destroy the per-act target that is the layer's entire replay
 * driver ("play THIS act's cabinets"). Rendering five per-act shelves of which
 * four are empty is the other failure, so emptiness — not the act count —
 * decides: today exactly one act shelf exists (ACT 1), and Acts 2–5 appear on
 * their own as their cards are authored, with no code change.
 *
 * @param {{furthestLevel:number, collectedIds:string[], bypass?:boolean}} opts
 * @returns {Array<{id:string, heading:string, glyph:string, cards:object[], found:number, total:number}>}
 */
export function collectionShelves(opts) {
  const { furthestLevel, collectedIds, bypass = false } = (opts && typeof opts === 'object') ? opts : {};
  const ids = new Set(Array.isArray(collectedIds) ? collectedIds : []);
  const lvl = Number.isFinite(Number(furthestLevel)) ? Number(furthestLevel) : 1;
  const reached = (need) => bypass || lvl >= need;
  const holdsAny = (cards) => cards.some(c => ids.has(c.id));
  const shelves = [];

  // 1. THE ARCADE — the whole arcade bank, so its count comes from
  // bankProgress(), the one function that owns "how many of this bank has this
  // save found" (it also drops ids the game no longer knows, so a stale save can
  // never read as more complete than the bank). The wing/act shelves below are
  // SUB-sets of their banks, which bankProgress cannot express, so they count
  // over their own list with the identical rule; the unit test pins the two
  // against each other so they can never mean different things.
  const arcade = bankProgress('arcade', collectedIds);
  // ⚠️ Heading is THE CABINETS, not "THE ARCADE" — a deliberate divergence from
  // hardware-wing.md §5.4.4's literal string, decided 2026-09-16 after looking at the
  // rendered screen. Act 1's own room is called THE ARCADE (levels.md), so once act
  // shelves existed the gallery printed "THE ARCADE" twice, meaning two different
  // things: the whole 75-card curriculum bank, and Act 1's four room cards. THE
  // CABINETS is also simply more accurate — every card in this bank is earned at one
  // of the 25 cabinets. The spec predates act shelves and could not have foreseen the
  // collision; act-exclusive-cards.md §5.4's "ACT n · <room>" string is untouched.
  shelves.push({
    id: 'arcade', heading: 'THE CABINETS', glyph: '★',
    cards: HISTORY_CARDS, found: arcade.found, total: arcade.total,
  });

  // 2. The bonus wings.
  for (const w of WING_SHELVES) {
    const cards = WING_CARDS.filter(c => c.wing === w.wing);
    if (!cards.length) continue;
    if (!reached(w.unlockLevel) && !holdsAny(cards)) continue;
    shelves.push({ id: 'wing:' + w.wing, heading: w.heading, glyph: w.glyph, cards, ...countFound(cards, ids) });
  }

  // 3. The rooms — one shelf per act that has cards.
  const actLayerOpen = actCardsUnlocked(lvl) || bypass;
  for (let act = 1; act <= ACT_NAMES.length; act++) {
    const cards = cardsForAct(act);
    if (!cards.length) continue;
    const reachable = actLayerOpen && reached(firstLevelOfAct(act));
    if (!reachable && !holdsAny(cards)) continue;
    shelves.push({
      id: 'act:' + act,
      heading: 'ACT ' + act + ' · ' + ACT_NAMES[act - 1],
      glyph: '♦', cards, ...countFound(cards, ids),
    });
  }
  return shelves;
}

/**
 * Draw the shelves. `shelves` is collectionShelves(); `collectedSet` is a Set of
 * collected card ids. Found cards reveal their word + title; unfound ones show a
 * "???" silhouette — the documented completionist tease (product.md §History
 * Cards), and it applies on every shelf, not just the arcade one.
 *
 * All card text is fixed literal data committed in js/history-cards.js, never
 * user input — but rows are still built with createElement + textContent and
 * never innerHTML (security.md rules 1–2), the same idiom as the slot picker.
 */
export function renderCollectionScreen(state, shelves, collectedSet) {
  const host = $('collection-shelves');
  host.innerHTML = '';

  shelves.forEach(shelf => {
    const section = document.createElement('div');
    section.className = 'collection-shelf';

    const head = document.createElement('div');
    head.className = 'collection-shelf-head';
    const name = document.createElement('span');
    name.className = 'collection-shelf-name';
    name.textContent = shelf.heading;
    const count = document.createElement('span');
    count.className = 'collection-shelf-count';
    count.textContent = shelf.glyph + ' ' + shelf.found + ' / ' + shelf.total;
    head.append(name, count);
    section.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'collection-grid';
    shelf.cards.forEach(card => {
      const owned = collectedSet.has(card.id);
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
    section.appendChild(grid);
    host.appendChild(section);
  });

  // Scroll affordance. Assigned (not addEventListener) so re-opening the gallery
  // can never stack handlers.
  //
  // ⚠️ The measurement is deferred on purpose. render runs while #collection-screen
  // is still `hidden` (display:none), where scrollHeight and clientHeight are both
  // 0 — so measuring here would always conclude "nothing below" and the marker
  // would never appear. main.js calls revealCollection() after showScreen(); the
  // rAF here covers the webfont reflow that follows a cold load.
  host.onscroll = updateCollectionScrollHint;
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(updateCollectionScrollHint);
}

// Called by main.js the instant the screen is actually visible. Both halves of
// this MUST happen after showScreen(), not during render:
//   • scrollTop cannot be written on a display:none element, so resetting it in
//     render silently did nothing — found by re-opening the gallery in a
//     playtest, which came back still scrolled 269px down from the last visit
//     (.claude/rules/playtest.md §The Second Run, exactly).
//   • the "more below" measurement needs a laid-out box (see above).
export function revealCollection() {
  const host = $('collection-shelves');
  if (host) host.scrollTo({ top: 0, behavior: 'auto' }); // 'auto': never animate the reset
  updateCollectionScrollHint();
}

// The two edge markers ("▲ MORE ABOVE" / "▼ MORE BELOW") and their fades, each
// shown only while there is more to see in that direction. The grid overflows at
// 1280×800 (about seven of the arcade bank's eight rows fit), so without these a
// row is sliced at the container edge and simply reads as the end of the
// collection. MEASURED, not assumed: `offsetWidth - clientWidth` is 0 on this
// scroller — the platform scrollbar is an overlay and contributes no affordance
// at all, so these markers carry it.
export function updateCollectionScrollHint() {
  const host = $('collection-shelves');
  const more = $('collection-more');
  const up = $('collection-more-up');
  if (!host || !more || !up) return;
  const remaining = host.scrollHeight - host.clientHeight - host.scrollTop;
  more.classList.toggle('hidden', remaining <= 4);
  up.classList.toggle('hidden', host.scrollTop <= 4);
}

// Keyboard scrolling for the gallery — this is a keyboard-first game and the
// gallery is the one screen with more content than fits. Returns true if the key
// was a scroll key (so the caller knows it was handled).
export function scrollCollection(key) {
  const host = $('collection-shelves');
  if (!host) return false;
  const STEP = 90;                       // a little more than one cell row (74 + 10 gap)
  const PAGE = Math.max(120, host.clientHeight - 60);
  switch (key) {
    case 'ArrowDown': host.scrollTop += STEP; return true;
    case 'ArrowUp': host.scrollTop -= STEP; return true;
    case 'PageDown': host.scrollTop += PAGE; return true;
    case 'PageUp': host.scrollTop -= PAGE; return true;
    case 'Home': host.scrollTop = 0; return true;
    case 'End': host.scrollTop = host.scrollHeight; return true;
    default: return false;
  }
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
