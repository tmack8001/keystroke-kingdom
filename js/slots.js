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
//
// Act 7 note: a slot also carries `speedway` — per-track ghost records (lap times,
// split tables, keystroke counts, accuracy, a local timestamp). That is GAMEPLAY
// data, NOT a new PII class (security.md rule 8): no age, surname, location, or
// contact info is ever stored, nothing about it is ever transmitted (rule 6), and
// it is bounded by construction (see SPEEDWAY_* caps below).

import { legacyLevelToCardId } from './history-cards.js';

const SLOTS_KEY = 'kk-slots';
const SCHEMA_VERSION = 1;
const NAME_MAX = 16; // arcade high-score convention (transitions.md §Name Entry)

// ── Act 7 "THE SPEEDWAY" ghost-storage bounds ───────────────────────────────
// kk-slots must never grow without limit, so every dimension of the ghost store
// is capped here and enforced on BOTH read and write (spec: docs/specs/
// act7-speed-racing.md §5 storage, INV-84).
const SPEEDWAY_RECORD_VERSION = 1;
const SPEEDWAY_MAX_TRACKS = 14;   // 11 designed tracks + headroom; least-recent evicted
const SPLIT_COUNT = 64;           // exactly 64 milestones: i/63 of the lap
const MAX_MS = 2400000;           // 40 min.
// RAISED from 999,999 (~16.7 min) on 2026-09-13. The old value carried the comment
// "a lap can never plausibly exceed this" — an assumption about how fast a CHILD
// types, baked into a storage constant. It is wrong for exactly the player this game
// is for: Act 7's lap clock is time-on-task, and at WIZARD (3.5x) a 120-char track is
// 420 characters, so the old ceiling was breached at ~2.4 s/character — about 5 WPM,
// squarely inside a five-year-old's range. A lap that cannot be stored is a ghost that
// silently never appears, so the slowest typist in the game would have been the one
// player who never got to race themselves. Byte cost of the extra digit is ~64 B per
// ghost; the worst case stays well inside the 10 KB per-slot budget.
const MAX_KEYS = 1000000;         // lifetime-proof keystroke ceiling
const MAX_COUNTER = 1000000000;   // laps / chars / cleanBest odometer ceiling
const MAX_AT = 4102444800000;     // 2100-01-01 — keeps timestamps digit-bounded
// Track ids come from the code's own station table (never user input); this is a
// belt-and-braces allowlist so a tampered store can't inject an unbounded key.
// The leading-alphanumeric requirement also rules out "__proto__" as a key.
const TRACK_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$/;

// A brand-new game's progress, matching the shape main.js's getProgress()
// has always returned. Kept in one place so createSlot and the read path agree.
function freshProgress() {
  return { furthestLevel: 1, completed: {}, nameMoment: null, textWorlds: {} };
}

// ── Speedway (Act 7) ghost validation ───────────────────────────────────────
// security.md rule 4: this whole store is untrusted input. EVERY value below is
// validated field-by-field; anything malformed degrades to "no ghost" (null) so
// the track still plays — it simply has nothing to race against. Nothing here
// ever throws.

// A display-only odometer value: garbage or out-of-range is CLAMPED into range
// (a wrong lap count is cosmetic and must never cost a player her record).
function clampInt(value, lo, hi) {
  if (!Number.isFinite(value)) return null;
  return Math.max(lo, Math.min(hi, Math.round(value)));
}

// A value the ghost REPLAY depends on: out-of-range is REJECTED, not clamped.
// Clamping a nonsense lap time would produce a nonsense ghost (an instant or
// eternal lap); "no ghost" is the honest, playable degradation.
function strictInt(value, lo, hi) {
  if (!Number.isFinite(value)) return null;
  const n = Math.round(value);
  return (n < lo || n > hi) ? null : n;
}

// Same, for a field that may legitimately be absent: missing reads as 0, but a
// PRESENT-yet-invalid value still rejects (null) — absence is not corruption.
function optInt(value, lo, hi) {
  if (value === undefined || value === null) return 0;
  return strictInt(value, lo, hi);
}

// A full ghost: the lap you race against. `splits[i]` is the ms at which progress
// first reached i/63 of the lap — a table of EXACTLY SPLIT_COUNT non-decreasing
// integers. Any other length is rejected outright (a short/long table would make
// the replay interpolation meaningless).
function normalizeGhost(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (!Array.isArray(raw.splits) || raw.splits.length !== SPLIT_COUNT) return null;
  const splits = [];
  let prev = 0;
  for (let i = 0; i < SPLIT_COUNT; i++) {
    const v = strictInt(raw.splits[i], 0, MAX_MS);
    if (v === null) return null;          // a bad split ⇒ no ghost at all
    splits.push(Math.max(prev, v));       // splits are non-decreasing by contract
    prev = splits[i];
  }
  const ms = strictInt(raw.ms, 0, MAX_MS);          // mandatory
  const keys = optInt(raw.keys, 0, MAX_KEYS);
  const acc = optInt(raw.acc, 0, 100);
  const at = optInt(raw.at, 0, MAX_AT);
  if (ms === null || keys === null || acc === null || at === null) return null;
  return { ms, splits, keys, acc, at };
}

// The keepsake best: a time and when it happened, never raced on track — so it
// deliberately carries NO split table (that is what keeps "2 ghosts per track"
// cheap). A full ghost handed in here is normalized DOWN to { ms, at }.
function normalizeBest(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const ms = strictInt(raw.ms, 0, MAX_MS);          // mandatory
  const at = optInt(raw.at, 0, MAX_AT);
  if (ms === null || at === null) return null;
  return { ms, at };
}

function normalizeTrackRecord(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  // An unknown future schema version is dropped rather than half-trusted.
  if (raw.v !== undefined && raw.v !== SPEEDWAY_RECORD_VERSION) return null;
  const laps = clampInt(raw.laps, 0, MAX_COUNTER);
  const chars = clampInt(raw.chars, 0, MAX_COUNTER);
  const cleanBest = clampInt(raw.cleanBest, 0, MAX_COUNTER);
  return {
    v: SPEEDWAY_RECORD_VERSION,
    last: normalizeGhost(raw.last),
    best: normalizeBest(raw.best),
    laps: laps === null ? 0 : laps,
    chars: chars === null ? 0 : chars,
    cleanBest: cleanBest === null ? 0 : cleanBest,
  };
}

// The whole per-slot map. Unknown-shaped ids and malformed records are dropped;
// a slot that has never raced (or a legacy save from before Act 7) reads as {}.
function normalizeSpeedway(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out = {};
  let kept = 0;
  for (const id of Object.keys(raw)) {
    if (!TRACK_ID_RE.test(id)) continue;
    const rec = normalizeTrackRecord(raw[id]);
    if (!rec) continue;
    out[id] = rec;
    if (++kept >= SPEEDWAY_MAX_TRACKS) break;
  }
  return out;
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
  // Per-level rotation counter for the Level 25 "MY STORY" coda — drives "a
  // different walk-the-keyboard story each replay" (mirrors cardRotation exactly;
  // keyed by level for symmetry though only level 25 uses it). Tolerate garbage.
  const storyRotation = (raw.storyRotation && typeof raw.storyRotation === 'object')
    ? raw.storyRotation : {};
  // Act 7 ghosts, bounded + garbage-tolerant. A save written before Act 7 simply
  // has no `speedway` field and reads as {} — exactly like textWorlds above, so
  // migration is invisible and no returning player loses a game.
  const speedway = normalizeSpeedway(raw.speedway);
  return { name, furthestLevel, completed, nameMoment, textWorlds, cards, cardRotation, storyRotation, speedway };
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
  st.slots.push({ name: clean, ...freshProgress(), cards: [], cardRotation: {}, storyRotation: {}, speedway: {} });
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

// ── Per-level story rotation (drives "a different L25 coda story each replay") ──
// Mirrors the card rotation above exactly. Only level 25 uses it today.
export function getStoryRotation(level) {
  const st = state();
  const s = st.active !== null ? st.slots[st.active] : null;
  const r = s && s.storyRotation ? s.storyRotation[String(level)] : 0;
  return Number.isFinite(r) ? r : 0;
}

export function bumpStoryRotation(level) {
  const st = state();
  if (st.active === null || !st.slots[st.active]) return;
  const s = st.slots[st.active];
  if (!s.storyRotation || typeof s.storyRotation !== 'object') s.storyRotation = {};
  const cur = Number.isFinite(s.storyRotation[String(level)]) ? s.storyRotation[String(level)] : 0;
  s.storyRotation[String(level)] = cur + 1;
  writeState(st);
}

// ── Act 7 "THE SPEEDWAY": per-track ghost records ───────────────────────────
// Scoped to the ACTIVE saved game, stored INSIDE the slot (kk-slots[i].speedway)
// — deliberately not a new localStorage namespace, which is what makes both
// erase paths cover ghosts for free: eraseSlot/eraseActiveSlot remove the whole
// slot object, eraseAll removes kk-slots entirely.
//
//   kk-slots[i].speedway = {
//     "<trackId>": { v:1, last:{ms,splits[64],keys,acc,at}|null,
//                          best:{ms,at}|null, laps, chars, cleanBest }
//   }
//
// Gameplay data only — no PII (security.md rule 8) — and it never leaves the
// machine (rule 6).

// Read one track's record for the active game. Returns null when there is no
// active game, no record, or the stored record is malformed in any way: the
// caller's contract is simply "no ghost", never an exception.
export function readSpeedway(trackId) {
  if (typeof trackId !== 'string' || !TRACK_ID_RE.test(trackId)) return null;
  const st = state();
  const s = st.active !== null ? st.slots[st.active] : null;
  if (!s || !s.speedway) return null;
  return Object.prototype.hasOwnProperty.call(s.speedway, trackId) ? s.speedway[trackId] : null;
}

// Merge fields into one track's record for the active game and persist. Fields
// absent from `rec` keep their stored value; an explicit `null` for last/best
// clears that ghost. Every incoming value is re-validated (the caller is just as
// untrusted as storage). Never throws: an invalid id, no active game, or an
// unavailable localStorage is a silent no-op — the race still runs, it just
// doesn't persist.
export function writeSpeedway(trackId, rec) {
  try {
    if (typeof trackId !== 'string' || !TRACK_ID_RE.test(trackId)) return;
    if (!rec || typeof rec !== 'object' || Array.isArray(rec)) return;
    const st = state();
    if (st.active === null || !st.slots[st.active]) return;
    const s = st.slots[st.active];
    if (!s.speedway || typeof s.speedway !== 'object') s.speedway = {};
    const prev = s.speedway[trackId] || normalizeTrackRecord({});
    const merged = normalizeTrackRecord({
      v: SPEEDWAY_RECORD_VERSION,
      last: rec.last !== undefined ? rec.last : prev.last,
      best: rec.best !== undefined ? rec.best : prev.best,
      laps: rec.laps !== undefined ? rec.laps : prev.laps,
      chars: rec.chars !== undefined ? rec.chars : prev.chars,
      cleanBest: rec.cleanBest !== undefined ? rec.cleanBest : prev.cleanBest,
    });
    if (!merged) return;
    s.speedway[trackId] = merged;
    // Bound the map: when a new track pushes past the cap, evict the least
    // recently raced OTHER track (never the one just written).
    const ids = Object.keys(s.speedway);
    if (ids.length > SPEEDWAY_MAX_TRACKS) {
      const recency = (id) => {
        const r = s.speedway[id];
        return Math.max((r.last && r.last.at) || 0, (r.best && r.best.at) || 0);
      };
      ids.filter(id => id !== trackId)
        .sort((a, b) => recency(a) - recency(b))
        .slice(0, ids.length - SPEEDWAY_MAX_TRACKS)
        .forEach(id => { delete s.speedway[id]; });
    }
    writeState(st);
  } catch (e) {
    // Never throw — a ghost that can't be saved must never interrupt play.
  }
}
