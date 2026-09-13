// ─── Act 7 · THE SPEEDWAY — the curated word banks ──────────────────────────
//
// The whole content floor for the racing wing. Every word here is hand-picked from
// research/automotive-vocabulary.md (175 vetted entries, each with a child-true
// definition) and tiered EASY / MEDIUM / HARD the way that document tiers them.
//
// WHY A STATIC BANK (and not /api/wordgen):
//   The published game lives at a static host with no backend at all, so generation
//   would be dead code for most players (docs/specs/act7-speed-racing.md §1/§4). A
//   curated bank is the floor, the ceiling and the whole thing for v1. It is also the
//   only way the act can ever show `speed` — see the note on the substring layer below.
//
// TWO SAFETY LAYERS, both enforced at authoring time (docs/specs §5.7, security.md §7):
//   1. FLOOR BLOCKLIST — js/word-blocklist.json `BASE_WORDS`, exact-word. No automotive
//      word collides with it; `isSafeWord()` below re-checks anyway so a future edit to
//      either list can never smuggle one through.
//   2. NEVER-WORDS — a tone judgement, not a safety filter: `crash`, `wreck`,
//      `collision`, `burnout`, `spin out`, `dnf`, plus dead/die/kill. A racing act that
//      never crashes is the same choice as Missile Command's cities that can never be
//      hit (.claude/rules/levels/act5.md L23). Matched as a SUBSTRING, deliberately
//      over-blocking, so `diesel` (contains "die") never sneaks in either.
//
// CORRECTED 2026-09-13. An earlier draft of this header claimed `speed`, `chassis`,
// `passing`, `cockpit`, `warm` and `forward` were blocked by main.go's substring layer
// and therefore had to live here. That was true when this file was written and is
// FALSE now: substring matching was removed the same day (Trevor — "'altitude' isn't
// 'tit' and it shouldn't be caught"), so all six generate fine and
// blocklist_sync_test.go asserts exactly that. The stale note is left visible rather
// than silently deleted because believing it would lead a future author to design
// around a constraint that no longer exists — the L41 failure class.
//
// The CURRENT reasons this bank is static are both still good: the published build has
// no backend at all (GitHub Pages — see .claude/rules/visual-validation.md "The Three
// Environments"), so generation is unavailable to most players by construction; and a
// curated, era-appropriate racing vocabulary is better content than anything a general
// model returns. Every word here is still checked against the shared floor.

import { isBlockedWord } from '../word-blocklist.js';
import { getWordLengthRange } from '../settings.js';

// Substring-matched tone exclusions. Lowercase; see header.
export const NEVER_WORDS = Object.freeze([
  'crash', 'wreck', 'collision', 'burnout', 'spinout', 'dnf', 'dead', 'die', 'kill',
]);

// ─── The three tiers ────────────────────────────────────────────────────────
// EASY — 2-5 letters, decodable, the plainest driving words a new reader can read.
const EASY = Object.freeze([
  'go', 'car', 'lap', 'gas', 'rim', 'van', 'cab', 'key', 'pit', 'win', 'rev', 'tow',
  'fix', 'amp',
  'tire', 'hood', 'horn', 'door', 'seat', 'roof', 'tank', 'gear', 'belt', 'vent',
  'hose', 'pipe', 'plug', 'wire', 'lamp', 'fast', 'race', 'flag', 'grid', 'pole',
  'lane', 'crew', 'team', 'grip', 'turn', 'ride', 'park', 'spin', 'roll', 'slow',
  'zoom', 'honk', 'haul', 'skid', 'stop', 'volt', 'watt', 'cord', 'road', 'bend',
  'track', 'start', 'wheel', 'brake', 'pedal', 'motor', 'frame', 'trunk', 'glass',
  'truck', 'drive', 'steer', 'shift', 'coast', 'climb', 'carry', 'speed', 'timer',
]);

// MEDIUM — 4-7 letters, the race and EV vocabulary a confident reader grows into.
const MEDIUM = Object.freeze([
  'apex', 'axle', 'idle', 'tune',
  'slick', 'rally', 'stage', 'draft', 'tread', 'valve', 'rotor', 'wiper', 'turbo',
  'light', 'range', 'quiet', 'solar', 'regen', 'cable', 'drift', 'torque',
  'podium', 'helmet', 'driver', 'finish', 'sprint', 'charge', 'corner', 'signal',
  'launch', 'refuel', 'steady', 'engine', 'mirror', 'bumper', 'fender', 'piston',
  'airbag', 'hubcap', 'filter', 'gasket', 'grille', 'clutch', 'hybrid', 'outlet',
  'battery', 'charger', 'starter', 'circuit', 'chicane', 'hairpin', 'qualify',
]);

// HARD — 7+ letters, the Latinate payload that makes a high MAX WORD LENGTH mean
// something (product.md §Word Length — the lever that ages with the player).
const HARD = Object.freeze([
  'spoiler', 'muffler', 'gearbox', 'exhaust', 'chassis', 'bearing', 'coolant',
  'antenna', 'lithium', 'formula', 'reverse',
  'cylinder', 'ignition', 'seatbelt', 'camshaft', 'radiator', 'odometer', 'traction',
  'straight', 'overtake', 'recharge', 'electric', 'kilowatt', 'emission', 'robotaxi',
  'headlight', 'dashboard', 'downforce', 'telemetry', 'stopwatch', 'checkered',
  'generator', 'one-pedal',
  'alternator', 'windshield', 'suspension', 'driveshaft', 'accelerate', 'decelerate',
  'efficiency', 'autonomous', 'slipstream',
  'crankshaft', 'speedometer', 'transmission', 'differential', 'aerodynamics',
  'regenerative', 'kilowatt-hour',
]);

export const TIERS = Object.freeze({ EASY, MEDIUM, HARD });

// ─── Per-track pools (docs/specs/act7-speed-racing.md §5.7) ─────────────────
// Era flavour: the 1979 cabinet gets the plainest words a five-year-old can read;
// the modern F1 sim gets the Latinate telemetry vocabulary. Any track id not listed
// falls back to its render tier's band (see TIER_BAND), and anything unknown falls
// back to EASY+MEDIUM — a track can never end up with an empty pool.
const TRACK_POOLS = Object.freeze({
  'monaco-gp':        EASY,
  'pole-position':    EASY,
  'excitebike':       EASY.concat(MEDIUM.slice(0, 20)),
  'hang-on':          EASY.concat(MEDIUM.slice(0, 20)),
  'f-zero':           EASY.concat(MEDIUM),
  'super-mario-kart': EASY.concat(MEDIUM),
  'virtua-racing':    MEDIUM,
  'daytona-usa':      MEDIUM,
  'gran-turismo':     MEDIUM.concat(HARD),
  'midnight-club':    MEDIUM.concat(HARD),
  'modern-f1':        HARD,
});

// Render-tier → word band, for a track that hasn't been given an explicit pool yet.
// The ladder mirrors the graphics ladder: primitive era, plain words.
const TIER_BAND = Object.freeze({
  ttl:      EASY,
  scaler:   EASY,
  '8bit':   EASY,
  mode7:    EASY.concat(MEDIUM),
  flatpoly: MEDIUM,
  texpoly:  MEDIUM,
  ps1:      MEDIUM.concat(HARD),
  modern:   HARD,
});

const DEFAULT_POOL = EASY.concat(MEDIUM);

// ─── Safety + the authoring lint ────────────────────────────────────────────

// True when a word is safe to put in front of a child: not a floor blocklist word
// (exact) and not carrying a never-word (substring). Exported so a static test can
// assert the whole bank passes without re-declaring either list.
export function isSafeWord(word) {
  const w = String(word || '').toLowerCase();
  if (!w) return false;
  if (isBlockedWord(w)) return false;
  const letters = w.replace(/[^a-z]/g, '');
  return !NEVER_WORDS.some((bad) => letters.includes(bad));
}

// Every distinct word the act can ever show. For the authoring lint.
export function allWords() {
  const seen = new Set();
  [EASY, MEDIUM, HARD].forEach((tier) => tier.forEach((w) => seen.add(w)));
  Object.values(TRACK_POOLS).forEach((pool) => pool.forEach((w) => seen.add(w)));
  return Array.from(seen);
}

// ─── The pool a track actually draws from ───────────────────────────────────

// Own-property lookups only. A track id of `constructor`/`toString`/`__proto__` would
// otherwise resolve to an inherited Object.prototype member and be returned as a word
// pool — `TRACK_POOLS['constructor']` is a function, and `.filter` on it throws, which
// a renderer's swallowed catch would turn into a silently dead track. Not reachable
// today (ids are authored), but a data-driven registry is exactly where it would be.
// Found by /security-review 2026-09-13; the same guard js/slots.js readSpeedway uses.
function basePool(track) {
  const id = track && track.id;
  if (id && Object.prototype.hasOwnProperty.call(TRACK_POOLS, id)) return TRACK_POOLS[id];
  const tier = track && track.tier;
  if (tier && Object.prototype.hasOwnProperty.call(TIER_BAND, tier)) return TIER_BAND[tier];
  return DEFAULT_POOL;
}

// THE one filtered-with-fallback helper (journal L38 / INV-38). MIN/MAX WORD LENGTH
// is a best-effort SUGGESTION, never a wall: if the player's chosen range empties a
// track's pool, the track quietly falls back to its own words. Winnability is the
// floor and is never traded for a settings preference — a track can never become
// unfinishable because of a lever. Everything that needs words routes through here,
// so the pool is provably never empty.
export function poolForTrack(track) {
  const pool = basePool(track).filter(isSafeWord);
  const { min, max } = getWordLengthRange();
  const filtered = pool.filter((w) => w.length >= min && w.length <= max);
  return filtered.length > 0 ? filtered : pool;
}

// Draw one word, avoiding an immediate repeat when the pool is big enough to afford
// it. Pure function of the pool + the previous word; no hidden state.
export function drawWord(pool, previous) {
  if (!Array.isArray(pool) || pool.length === 0) return 'car'; // never return nothing
  if (pool.length === 1) return pool[0];
  let word = pool[Math.floor(Math.random() * pool.length)];
  if (word === previous) word = pool[(pool.indexOf(word) + 1) % pool.length];
  return word;
}

// Build the whole lap's word list up front, so the lap ALWAYS ends on a completed
// word rather than mid-word. `targetChars` is a target, not a cap: we keep drawing
// until the total reaches it, and the lap's real length is whatever that sum is.
// (This is why track.js measures progress against the returned list's own total.)
export function buildLapWords(track, targetChars) {
  const pool = poolForTrack(track);
  const target = Math.max(1, Math.floor(Number(targetChars) || 1));
  const words = [];
  let total = 0;
  let guard = 0;
  let prev = null;
  while (total < target && guard++ < 4000) {
    const w = drawWord(pool, prev);
    words.push(w);
    total += w.length;
    prev = w;
  }
  if (words.length === 0) words.push(drawWord(pool, null));
  return words;
}
