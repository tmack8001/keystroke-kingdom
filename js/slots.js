// Save slots — any number of independent saved games ("CHOOSE YOUR GAME").
//
// A "saved game" used to be a single global thing spread across three
// localStorage keys (kk-progress + kk-cards + settings.playerName). That made a
// shared family machine hold exactly one child's game at a time. This module is
// the single source of truth for MANY games: each slot bundles its own name,
// curriculum progress, Act-6 text-world progress, the once-ever name moment,
// and — the reason this exists at all — its OWN collected history-card set and
// per-level card rotation. A whole family on one machine, a separate game and a
// separate collection to complete for each of them.
//
// There is NO fixed cap on the number of games (Trevor, 2026-07-19: "a family
// may have more than 3 members — there is no reason to limit"). `slots` is a
// plain, growable array of games; the picker lists them all plus a "new game"
// affordance and scrolls if it gets long.
//
// SECURITY POSTURE (security.md rule 4): kk-slots is untrusted input. Every read
// parses inside try/catch, validates shape field-by-field, and drops garbage (a
// malformed game is simply omitted from the list, never crashes the picker).
// Writes never throw — localStorage being unavailable (private mode) degrades to
// an in-session-only game, exactly like the old single-save did. The only
// personal datum stored is the display name (already the PII floor; no new class
// of data — security.md rule 8), one per game.

import { legacyLevelToCardId } from './history-cards.js';

const SLOTS_KEY = 'kk-slots';
const SCHEMA_VERSION = 1;
const NAME_MAX = 16; // arcade high-score convention (transitions.md §Name Entry)

// A brand-new game's progress, matching the shape main.js's getProgress()
// has always returned. Kept in one place so createSlot and the read path agree.
function freshProgress() {
  return { furthestLevel: 1, completed: {}, nameMoment: null, textWorlds: {} };
}

// ── Validation ────────────────────────────────────────────────────────────
// A game normalizes to a full object or null (dropped). Anything malformed
// becomes null so a corrupted store can never brick the picker.
function normalizeSlot(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const name = (typeof raw.name === 'string' && raw.name.trim())
    ? raw.name.slice(0, NAME_MAX)
    : 'PLAYER ONE';
  const furthestLevel = Number.isFinite(raw.furthestLevel)
    ? Math.max(1, Math.min(25, Math.round(raw.furthestLevel)))
    : 1;
  const completed = (raw.completed && typeof raw.completed === 'object') ? raw.completed : {};
  const nameMoment = (raw.nameMoment && typeof raw.nameMoment === 'object'
    && typeof raw.nameMoment.name === 'string') ? { name: raw.nameMoment.name } : null;
  const textWorlds = (raw.textWorlds && typeof raw.textWorlds === 'object') ? raw.textWorlds : {};
  // Collected history-card IDs — strings only (ids are stable slugs, never level
  // numbers anymore). Drop anything that isn't a string; dedupe defensively.
  const cards = Array.isArray(raw.cards)
    ? [...new Set(raw.cards.filter(id => typeof id === 'string'))]
    : [];
  // Per-level rotation counter: { "<level>": <int> }. Drives "a different card
  // each replay" (mirrors the Act-6 riddle `_ri` pattern). Tolerate garbage.
  const cardRotation = (raw.cardRotation && typeof raw.cardRotation === 'object')
    ? raw.cardRotation : {};
  return { name, furthestLevel, completed, nameMoment, textWorlds, cards, cardRotation };
}

// ── Low-level persistence ───────────────────────────────────────────────────
function readState() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(SLOTS_KEY)); } catch (e) { raw = null; }
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.slots)) return null;
  // Compact to a dense array of valid games (garbage/nulls dropped).
  const slots = raw.slots.map(normalizeSlot).filter(Boolean);
  let active = Number.isInteger(raw.active) ? raw.active : null;
  // An active pointer is only valid if it names a real game in range.
  if (active === null || active < 0 || active >= slots.length) active = null;
  return { v: SCHEMA_VERSION, active, slots };
}

// Returns the current state, or a fresh empty state (no games) so callers never
// have to null-check. Empty state is NOT written — absence of kk-slots is what
// keeps a genuine first-timer on the untouched cold-open path.
function state() {
  return readState() || { v: SCHEMA_VERSION, active: null, slots: [] };
}

function writeState(st) {
  try {
    localStorage.setItem(SLOTS_KEY, JSON.stringify(st));
  } catch (e) {
    // localStorage unavailable — the game stays playable for the session;
    // it just won't persist. Never throw, never block play.
  }
}

// ── Migration ───────────────────────────────────────────────────────────────
// One-time, idempotent: fold a pre-slots player's single global save into the
// first game so a returning child never loses her game. Legacy layout:
//   kk-progress = { furthestLevel, completed, nameMoment, textWorlds }
//   kk-cards    = [<level number>, ...]   (one card per level → level == id)
//   name        = settings.playerName (passed in; it lives in kk-settings)
// Runs before the boot decision. If kk-slots already exists, this is a no-op.
export function ensureMigrated(legacyName) {
  // Guard the very first read too — a throwing localStorage (private mode) must
  // NOT break boot(), which calls this at startup. If we can't read storage at
  // all, there's nothing to migrate; the game runs in-session (never throws).
  let existing = null;
  try { existing = localStorage.getItem(SLOTS_KEY); } catch (e) { return; }
  if (existing !== null) return; // already slotted

  let legacyProgress = null;
  try { legacyProgress = JSON.parse(localStorage.getItem('kk-progress')); } catch (e) { legacyProgress = null; }
  let legacyCardLevels = [];
  try {
    const arr = JSON.parse(localStorage.getItem('kk-cards'));
    if (Array.isArray(arr)) legacyCardLevels = arr;
  } catch (e) { legacyCardLevels = []; }

  const prog = normalizeSlot(legacyProgress ? { ...legacyProgress, name: legacyName } : null);
  const hadRealProgress = !!prog && (prog.furthestLevel > 1 || Object.keys(prog.completed).length > 0);
  const hadCards = legacyCardLevels.length > 0;
  if (!hadRealProgress && !hadCards) return; // genuine first-timer — leave cold open intact

  const slot = prog || normalizeSlot({ name: legacyName });
  slot.name = (typeof legacyName === 'string' && legacyName.trim()) ? legacyName.slice(0, NAME_MAX) : 'PLAYER ONE';
  // Map each legacy level-number to that level's original card ID (the flat/id
  // model assigns every original card a stable id tagged with its legacyLevel).
  slot.cards = [...new Set(
    legacyCardLevels
      .map(lvl => legacyLevelToCardId(lvl))
      .filter(Boolean)
  )];

  // Migrated game lands as the first game, and we deliberately DON'T auto-activate
  // it — the slot picker is the front door; the player chooses her game.
  writeState({ v: SCHEMA_VERSION, active: null, slots: [slot] });

  // Retire the legacy keys now that they live inside the slot (no dead duplicate
  // that a later stale read could resurrect). Never throw.
  try { localStorage.removeItem('kk-progress'); } catch (e) { /* ignore */ }
  try { localStorage.removeItem('kk-cards'); } catch (e) { /* ignore */ }
}

// ── Game lifecycle ────────────────────────────────────────────────────────
export function count() {
  return state().slots.length;
}

export function anySlotExists() {
  return state().slots.length > 0;
}

// Lightweight view for the picker UI: one entry per existing game (dense array).
export function listSlots() {
  return state().slots.map((s) => ({
    name: s.name,
    furthestLevel: s.furthestLevel,
    cardsFound: s.cards.length,
  }));
}

export function getActive() {
  return state().active;
}

export function setActive(i) {
  const st = state();
  if (i >= 0 && i < st.slots.length) {
    st.active = i;
    writeState(st);
  }
}

// Create a brand-new game, APPEND it, make it active, and return its index.
// No cap — a family can have as many games as it likes.
export function createSlot(name) {
  const st = state();
  const clean = (typeof name === 'string' && name.trim()) ? name.slice(0, NAME_MAX) : 'PLAYER ONE';
  st.slots.push({ name: clean, ...freshProgress(), cards: [], cardRotation: {} });
  st.active = st.slots.length - 1;
  writeState(st);
  return st.active;
}

// Remove a game from the list. Keeps `active` pointing at the SAME game it did
// before (shifting the index down when an earlier game is removed); if the
// active game itself is erased, the pointer drops (back to the picker).
export function eraseSlot(i) {
  const st = state();
  if (i < 0 || i >= st.slots.length) return;
  st.slots.splice(i, 1);
  if (st.active === i) st.active = null;
  else if (st.active !== null && st.active > i) st.active -= 1;
  writeState(st);
}

// Erase whatever game is active (used by the picker's per-game erase path).
export function eraseActiveSlot() {
  const st = state();
  if (st.active !== null) eraseSlot(st.active);
}

// Factory reset — wipe EVERY saved game (the Settings-screen "ERASE ALL
// PROGRESS / ERASE EVERYTHING?" path). Removes kk-slots entirely so a reload
// cold-opens as a brand-new machine; kk-settings (name + prefs) is untouched.
export function eraseAll() {
  try { localStorage.removeItem(SLOTS_KEY); } catch (e) { /* never throw */ }
}

export function setActiveName(name) {
  const st = state();
  if (st.active === null || !st.slots[st.active]) return;
  st.slots[st.active].name = (typeof name === 'string' && name.trim()) ? name.slice(0, NAME_MAX) : 'PLAYER ONE';
  writeState(st);
}

export function activeName() {
  const st = state();
  return st.active !== null && st.slots[st.active] ? st.slots[st.active].name : null;
}

// ── Active-game-scoped progress (mirrors main.js's historical getProgress shape
// exactly, so every existing call site is unchanged). With no active game (e.g.
// the WOPR dev bypass before one is chosen) this returns a safe default and saves
// become no-ops — the dev path just doesn't persist. ─────────────────────────
export function getProgress() {
  const st = state();
  const s = st.active !== null ? st.slots[st.active] : null;
  if (!s) return freshProgress();
  return {
    furthestLevel: s.furthestLevel,
    completed: s.completed,
    nameMoment: s.nameMoment,
    textWorlds: s.textWorlds,
  };
}

export function saveProgress(p) {
  const st = state();
  if (st.active === null || !st.slots[st.active]) return; // no game to write to
  const s = st.slots[st.active];
  s.furthestLevel = Number.isFinite(p.furthestLevel) ? Math.max(1, Math.min(25, Math.round(p.furthestLevel))) : s.furthestLevel;
  if (p.completed && typeof p.completed === 'object') s.completed = p.completed;
  s.nameMoment = (p.nameMoment && typeof p.nameMoment.name === 'string') ? { name: p.nameMoment.name } : s.nameMoment;
  if (p.textWorlds && typeof p.textWorlds === 'object') s.textWorlds = p.textWorlds;
  writeState(st);
}

// ── Active-game-scoped card collection (replaces history-cards.js's old kk-cards
// ownership). Keyed by stable card ID now, not level number. ─────────────────
export function collectedIds() {
  const st = state();
  const s = st.active !== null ? st.slots[st.active] : null;
  return s ? [...s.cards] : [];
}

export function collectedCount() {
  return collectedIds().length;
}

// Idempotent. Returns true only the first time this id is collected in the
// active game (drives the "NEW!" tag). No active game → returns true (so the
// dev-bypass overlay still reads as a discovery) but persists nothing.
export function collectCardId(id) {
  const st = state();
  if (st.active === null || !st.slots[st.active]) return true;
  const s = st.slots[st.active];
  if (s.cards.includes(id)) return false;
  s.cards.push(id);
  writeState(st);
  return true;
}

// The collected set of ANY game (the picker's collection view can peek at a
// highlighted-but-not-active game without switching the active pointer).
export function slotCards(i) {
  const st = state();
  return (i >= 0 && i < st.slots.length) ? [...st.slots[i].cards] : [];
}

// ── Per-level card rotation (drives "a different card each replay") ─────────
export function getCardRotation(level) {
  const st = state();
  const s = st.active !== null ? st.slots[st.active] : null;
  const r = s && s.cardRotation ? s.cardRotation[String(level)] : 0;
  return Number.isFinite(r) ? r : 0;
}

export function bumpCardRotation(level) {
  const st = state();
  if (st.active === null || !st.slots[st.active]) return;
  const s = st.slots[st.active];
  const cur = Number.isFinite(s.cardRotation[String(level)]) ? s.cardRotation[String(level)] : 0;
  s.cardRotation[String(level)] = cur + 1;
  writeState(st);
}
