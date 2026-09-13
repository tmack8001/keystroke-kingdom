// ─── Act 7 · THE SPEEDWAY — the curated word banks ──────────────────────────
//
// The whole content floor for the racing wing. Every word here is hand-picked from
// research/automotive-vocabulary.md (175 vetted entries) and, for the two tracks that
// are not cars, research/vehicle-games-beyond-cars.md §4a (17 bike/motorcycle entries)
// — each already carrying a letter count, a decodability judgement, an EASY / MEDIUM /
// HARD tier mapped to the MIN/MAX WORD LENGTH levers, and a child-true definition.
//
// WHY A STATIC BANK (and not /api/wordgen):
//   The published game lives at a static host with no backend at all, so generation
//   would be dead code for most players (docs/specs/act7-speed-racing.md §1/§4). A
//   curated bank is the floor, the ceiling and the whole thing for v1.
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
//
// TWO SAFETY LAYERS, both enforced at authoring time (docs/specs §5.7, security.md §7):
//   1. FLOOR BLOCKLIST — js/word-blocklist.json `BASE_WORDS`, exact-word (53 words as
//      of 2026-09-13). No racing word collides with it; `isSafeWord()` below re-checks
//      anyway so a future edit to either list can never smuggle one through, and it
//      also honours a parent's ADDITIVE blocked-words layer.
//   2. NEVER-WORDS — a tone judgement, not a safety filter: `crash`, `wreck`,
//      `collision`, `burnout`, `spin out`, `dnf`, plus dead/die/kill. A racing act that
//      never crashes is the same choice as Missile Command's cities that can never be
//      hit (.claude/rules/levels/act5.md L23). Matched as a SUBSTRING, deliberately
//      over-blocking, so `diesel` (contains "die") never sneaks in either — which is
//      why spec §5.7's list of "lives here and only here" words ships six of its seven
//      (`speed`, `passing`, `cockpit`, `chassis`, `warm`, `forward`) and never `diesel`.
//
// ─── REPETITION: what Trevor found on 2026-09-13, and the two fixes ─────────
//
//   *"playing this 5 times, a few each cabinet the words get repetitative quickly
//    specifically having the same words show up in the same 1min game play multiple
//    times as I was typing ~40 wpm"*
//
// Measured, not guessed. The old `buildLapWords` drew WITH REPLACEMENT, avoiding only
// the immediately previous word — so a 120-char Monaco lap (~25 words) out of a 72-word
// pool produced ~3.5 duplicate words EVERY LAP by the birthday problem. No amount of
// new vocabulary fixes a with-replacement draw, so both halves were needed:
//
//   FIX 1 — A LAP IS A SAMPLE, NOT A SEQUENCE OF INDEPENDENT DRAWS. Words come out of a
//   shuffled BAG (`nextFromBag` below) that PERSISTS ACROSS LAPS per track. A word can
//   never appear twice in one lap while an unused word remains, and consecutive laps
//   keep drawing from the same shuffle — so at Monaco's pool/lap ratio you get roughly
//   FOUR laps in a row with no repeated word at all. When the bag runs dry it is
//   reshuffled (never tail-repeated), with the current lap's already-used words pushed
//   to the back so the in-lap guarantee survives a mid-lap refill.
//
//   FIX 2 — BIGGER, MORE DISTINCT POOLS (below). The automotive research was already
//   fully consumed by the first draft, so growth came from the bike/motorcycle layer,
//   the words research §2 lists in its collision table rather than its tier tables, and
//   — the big one — from giving each track a pool composed of GROUPS instead of handing
//   every track the same EASY band. See "Per-track identity".
//
// ─── HOW THE POOLS ARE BUILT (read this before adding track 3 of 11) ────────
//
// Vocabulary lives in small tier-tagged GROUPS by subject, never in one flat list. A
// track's pool is a union of the groups that are TRUE OF THAT VEHICLE IN THAT ERA:
//
//   CORE_*      every racing vehicle in every era owns these
//   WHEEL_*     it rolls on wheels            (every track except the anti-grav one)
//   BODY_*      a car's coachwork and cabin   (cars only — a dirt bike has no roof)
//   ENGINE_*    combustion drivetrain         (cars, karts, motorbikes — NOT F-Zero)
//   RACE_*      race craft: the day, the line, the rulebook
//   AERO_HARD   modern aero + data vocabulary — the telemetry era
//   ELEC_*      electricity and EVs           (F-Zero's craft, and the modern tracks)
//   BIKE_*      two wheels                    (Excitebike's motocross, Hang-On)
//
// Adding a track = adding one line to TRACK_POOLS naming its groups. Nothing else.
// A word may be listed in two groups where it genuinely belongs to both (`plug` is a
// spark plug AND a charging plug, exactly as the research dual-lists it); `pool()`
// unions and dedups, so a track can never draw the same word twice from one build.
//
// ─── PER-TRACK IDENTITY ─────────────────────────────────────────────────────
//
// Monaco GP (1979) and F-Zero (1990) must not feel like one word list, and the split
// is a fidelity statement rather than a shuffle: Monaco GP is a COMBUSTION car — its
// pool is the plainest short words plus a car's body and its engine, with no Latinate
// telemetry and no electricity. F-Zero's machine HOVERS and runs on electricity — it
// gets no wheels, no bodywork, no engine parts at all, and instead owns the entire
// electric/energy vocabulary plus the telemetry band. The words they share are the
// ones any race shares (the road, the lap, the flag, the corner).
//
// The same logic pre-answers the other nine: Excitebike and Hang-On get BIKE_* and
// lose the bodywork; Virtua Racing and Daytona sit in the telemetry era; Gran Turismo
// is the everything-track; the modern pair carry electricity and aero.

import { isBlockedWord } from '../word-blocklist.js';
import { getWordLengthRange } from '../settings.js';

// Substring-matched tone exclusions. Lowercase; see header.
export // 'timer' was removed 2026-09-13: it is not blocked by anything, but this is an act
// whose founding law is that NO TIMER EVER RUNS OUT — laps are N characters, never N
// seconds — and putting the word in a child's mouth teaches the opposite of the
// mechanic. Spotted by the lane fixing the celebration, not by a filter; a word can be
// perfectly safe and still be wrong for the game it is in.
const NEVER_WORDS = Object.freeze([
  'crash', 'wreck', 'collision', 'burnout', 'spinout', 'dnf', 'dead', 'die', 'kill',
]);

// ─── The vocabulary groups ──────────────────────────────────────────────────
// Tiers are the research's own: EASY 2–5 letters and decodable · MEDIUM 4–7, or one
// irregular element · HARD 7+, usually Latinate — the payload that makes a high MAX
// WORD LENGTH mean something (product.md §Word Length, the lever that ages with the
// player). Tier is about READING difficulty; the length levers do the filtering.

// CORE — the road, the lap, the controls. True of every racing vehicle ever built.
// `boost` is the one word here that is not from a research table: it comes from spec
// §5.7's own example list ("EASY->MEDIUM motion verbs: boost, drift, coast, launch,
// spin, grip") and it is what the act's CHARGE meter IS, so the player reads the word
// on screen while typing it. Everything else in this file traces to a research row.
const CORE_EASY = Object.freeze([
  'go', 'lap', 'pit', 'win', 'fast', 'race', 'road', 'lane', 'bend', 'turn', 'ride',
  'roll', 'spin', 'stop', 'slow', 'zoom', 'skid', 'park', 'fix', 'seat', 'grip',
  'flag', 'crew', 'team', 'drive', 'steer', 'track', 'start', 'speed', 'lane',
]);
const CORE_MEDIUM = Object.freeze([
  'brake', 'pedal', 'frame', 'light', 'drift', 'boost', 'coast', 'climb', 'carry',
  'signal', 'corner', 'driver', 'finish', 'helmet', 'steady', 'launch',
]);

// WHEEL — it rolls. (The one thing an anti-gravity machine does not do.)
const WHEEL_EASY = Object.freeze(['tire', 'wheel', 'rim']);
const WHEEL_MEDIUM = Object.freeze(['tread', 'rotor', 'hubcap', 'axle']);

// BODY — a car's coachwork and cabin. A motocross bike has none of this.
const BODY_EASY = Object.freeze([
  'car', 'hood', 'door', 'roof', 'horn', 'honk', 'lamp', 'key', 'van', 'cab',
  'truck', 'glass',
]);
const BODY_MEDIUM = Object.freeze([
  'trunk', 'bumper', 'fender', 'grille', 'wiper', 'mirror', 'airbag', 'seatbelt',
]);
const BODY_HARD = Object.freeze([
  'antenna', 'headlight', 'dashboard', 'windshield', 'odometer', 'speedometer',
]);

// ENGINE — the combustion drivetrain. Shared by cars, karts and motorbikes.
const ENGINE_EASY = Object.freeze([
  'gas', 'tank', 'belt', 'vent', 'hose', 'pipe', 'plug', 'wire', 'gear', 'rev',
  'tow', 'haul',
]);
const ENGINE_MEDIUM = Object.freeze([
  'motor', 'engine', 'piston', 'valve', 'filter', 'gasket', 'clutch', 'starter',
  'turbo', 'shift', 'idle', 'tune', 'refuel',
]);
const ENGINE_HARD = Object.freeze([
  'muffler', 'gearbox', 'exhaust', 'chassis', 'bearing', 'coolant', 'cylinder',
  'ignition', 'camshaft', 'radiator', 'reverse', 'cockpit', 'titanium',
  'alternator', 'suspension', 'driveshaft', 'crankshaft', 'transmission',
  'differential',
]);

// RACE — the day, the line, the rulebook. `warm` is the warm-up lap; `award` and
// `podium` are the only outcome words in the act, and both are gifts (spec §5.4:
// no placement, no finish order, ever).
const RACE_EASY = Object.freeze(['grid', 'pole', 'warm', 'award']);
const RACE_MEDIUM = Object.freeze([
  'apex', 'slick', 'rally', 'stage', 'draft', 'sprint', 'podium', 'assist',
  'passing', 'forward',
]);
const RACE_HARD = Object.freeze([
  'circuit', 'chicane', 'hairpin', 'qualify', 'formula', 'straight', 'overtake',
  'speedway', 'stopwatch', 'checkered',
]);

// AERO — the telemetry era: air, grip and data. The MAX-WORD-LENGTH payload.
const AERO_HARD = Object.freeze([
  'spoiler', 'traction', 'downforce', 'telemetry', 'slipstream', 'efficiency',
  'accelerate', 'decelerate', 'aerodynamics',
]);

// ELEC — electricity and EVs. research/automotive-vocabulary.md §6, whose four
// teachable ideas (regen, one-pedal, kW vs kWh, charging) are the reason the HARD
// band here is worth a child's time rather than just being long.
const ELEC_EASY = Object.freeze(['amp', 'volt', 'watt', 'plug', 'cord']);
const ELEC_MEDIUM = Object.freeze([
  'cable', 'range', 'quiet', 'solar', 'regen', 'hybrid', 'torque', 'charge',
  'outlet', 'charger', 'battery', 'electric',
]);
const ELEC_HARD = Object.freeze([
  'lithium', 'recharge', 'kilowatt', 'emission', 'robotaxi', 'one-pedal',
  'generator', 'autonomous', 'regenerative', 'kilowatt-hour',
]);

// BIKE — two wheels. research/vehicle-games-beyond-cars.md §4a, added because three
// of the eleven tracks are not cars: Excitebike is motocross, Hang-On is a
// motorcycle. (§4b boats and §4c trains are deliberately NOT here — Act 7's vehicle
// scope is ground racing and is a closed question, spec §5.6; a `regatta` in a
// motocross lap would be vocabulary for a cabinet that does not exist.)
const BIKE_EASY = Object.freeze(['bike', 'fork', 'ramp', 'dirt']);
const BIKE_MEDIUM = Object.freeze([
  'crank', 'chain', 'spoke', 'visor', 'moped', 'saddle', 'tandem', 'wheelie',
  'scooter',
]);
const BIKE_HARD = Object.freeze([
  'kickstand', 'handlebar', 'motocross', 'derailleur',
]);

// The reading-difficulty view of the same vocabulary, for anyone who wants the bank
// by tier rather than by subject.
export const TIERS = Object.freeze({
  EASY: Object.freeze(union(CORE_EASY, WHEEL_EASY, BODY_EASY, ENGINE_EASY, RACE_EASY, ELEC_EASY, BIKE_EASY)),
  MEDIUM: Object.freeze(union(CORE_MEDIUM, WHEEL_MEDIUM, BODY_MEDIUM, ENGINE_MEDIUM, RACE_MEDIUM, ELEC_MEDIUM, BIKE_MEDIUM)),
  HARD: Object.freeze(union(BODY_HARD, ENGINE_HARD, RACE_HARD, AERO_HARD, ELEC_HARD, BIKE_HARD)),
});

// ─── Per-track pools (docs/specs/act7-speed-racing.md §5.7) ─────────────────
// One line per track: the groups that are true of that vehicle in that era. The
// eleven-track table is spec §5.6; the eight not yet built are pre-composed here so
// building one is a renderer job and never a vocabulary job.
function union(...groups) {
  const seen = new Set();
  for (const g of groups) for (const w of g) seen.add(w);
  return Array.from(seen);
}
function pool(...groups) { return Object.freeze(union(...groups)); }

const EVERYDAY = [CORE_EASY, CORE_MEDIUM, WHEEL_EASY, WHEEL_MEDIUM];

const TRACK_POOLS = Object.freeze({
  // 1979 · TTL · the plainest pool in the act: a combustion car and a race day.
  // DEVIATION from spec §5.7's prose ("EASY, 3-5 letters"), deliberate and measured:
  // a 3-5-letter-only pool tops out near 70 words, and a 120-char lap eats ~28 of
  // them, which is precisely the ratio that made Trevor's laps repeat. Monaco is
  // still by far the plainest pool in the act (mean 4.7 letters vs F-Zero's 5.9, no
  // HARD band at all, no Latinate telemetry, no electricity); a parent who wants the
  // literal 3-5 window has MAX WORD LENGTH, which still leaves Monaco 60+ words.
  'monaco-gp':        pool(...EVERYDAY, BODY_EASY, BODY_MEDIUM, ENGINE_EASY, ENGINE_MEDIUM, RACE_EASY, RACE_MEDIUM),
  // 1982 · sprite-scaling · Fuji, and the first qualifying lap in the arc.
  'pole-position':    pool(...EVERYDAY, BODY_EASY, BODY_MEDIUM, ENGINE_EASY, ENGINE_MEDIUM, RACE_EASY, RACE_MEDIUM, RACE_HARD),
  // 1984 · console 8-bit · MOTOCROSS. No bodywork; dirt, ramps and a hot engine.
  'excitebike':       pool(...EVERYDAY, BIKE_EASY, BIKE_MEDIUM, ENGINE_EASY, ENGINE_MEDIUM, RACE_EASY, RACE_MEDIUM),
  // 1985 · super-scaler · a MOTORCYCLE at speed, leaning through open road.
  'hang-on':          pool(...EVERYDAY, BIKE_EASY, BIKE_MEDIUM, BIKE_HARD, ENGINE_EASY, ENGINE_MEDIUM, RACE_EASY, RACE_MEDIUM),
  // 1990 · Mode 7 · ANTI-GRAVITY and electric: no wheels, no bodywork, no engine.
  'f-zero':           pool(CORE_EASY, CORE_MEDIUM, ELEC_EASY, ELEC_MEDIUM, ELEC_HARD, RACE_EASY, RACE_MEDIUM, RACE_HARD, AERO_HARD),
  // 1992 · Mode 7 + split screen · karts: small, plain, cheerful.
  'super-mario-kart': pool(...EVERYDAY, BODY_EASY, ENGINE_EASY, ENGINE_MEDIUM, RACE_EASY, RACE_MEDIUM, ELEC_EASY),
  // 1992 · flat-shaded polygons · the first telemetry-era cabinet.
  'virtua-racing':    pool(...EVERYDAY, BODY_MEDIUM, ENGINE_MEDIUM, ENGINE_HARD, RACE_MEDIUM, RACE_HARD, AERO_HARD),
  // 1994 · texture-filtered polygons · stock cars, a generation past #7.
  'daytona-usa':      pool(...EVERYDAY, BODY_EASY, BODY_MEDIUM, BODY_HARD, ENGINE_EASY, ENGINE_MEDIUM, ENGINE_HARD, RACE_MEDIUM, RACE_HARD, AERO_HARD),
  // 1997 · PS1 meshes · the licence-test track: the whole car, end to end.
  'gran-turismo':     pool(...EVERYDAY, BODY_EASY, BODY_MEDIUM, BODY_HARD, ENGINE_EASY, ENGINE_MEDIUM, ENGINE_HARD, RACE_EASY, RACE_MEDIUM, RACE_HARD, AERO_HARD),
  // 2000 · modern open road · a city at night, and the cars people actually drive.
  'midnight-club':    pool(...EVERYDAY, BODY_EASY, BODY_MEDIUM, BODY_HARD, ENGINE_EASY, ENGINE_MEDIUM, ENGINE_HARD, ELEC_EASY, ELEC_MEDIUM, RACE_EASY, RACE_MEDIUM),
  // present · telemetry aesthetic · the Latinate ceiling of the act.
  'modern-f1':        pool(CORE_EASY, CORE_MEDIUM, WHEEL_EASY, WHEEL_MEDIUM, ENGINE_HARD, BODY_HARD, RACE_MEDIUM, RACE_HARD, AERO_HARD, ELEC_MEDIUM, ELEC_HARD),
});

// Render-tier → word band, for a track that hasn't been given an explicit pool yet.
// The ladder mirrors the graphics ladder: primitive era, plain words.
const TIER_BAND = Object.freeze({
  ttl:      pool(...EVERYDAY, BODY_EASY, ENGINE_EASY, RACE_EASY, RACE_MEDIUM),
  scaler:   pool(...EVERYDAY, BODY_EASY, BODY_MEDIUM, ENGINE_EASY, ENGINE_MEDIUM, RACE_EASY, RACE_MEDIUM),
  '8bit':   pool(...EVERYDAY, BIKE_EASY, BIKE_MEDIUM, ENGINE_EASY, ENGINE_MEDIUM, RACE_EASY, RACE_MEDIUM),
  mode7:    pool(...EVERYDAY, BODY_EASY, ENGINE_EASY, ENGINE_MEDIUM, ELEC_EASY, ELEC_MEDIUM, RACE_EASY, RACE_MEDIUM),
  flatpoly: pool(...EVERYDAY, BODY_MEDIUM, ENGINE_MEDIUM, ENGINE_HARD, RACE_MEDIUM, RACE_HARD, AERO_HARD),
  texpoly:  pool(...EVERYDAY, BODY_MEDIUM, BODY_HARD, ENGINE_MEDIUM, ENGINE_HARD, RACE_MEDIUM, RACE_HARD, AERO_HARD),
  ps1:      pool(...EVERYDAY, BODY_MEDIUM, BODY_HARD, ENGINE_MEDIUM, ENGINE_HARD, RACE_MEDIUM, RACE_HARD, AERO_HARD, ELEC_MEDIUM),
  modern:   pool(...EVERYDAY, BODY_HARD, ENGINE_HARD, RACE_MEDIUM, RACE_HARD, AERO_HARD, ELEC_MEDIUM, ELEC_HARD),
});

const DEFAULT_POOL = TIER_BAND.mode7;

// ─── Safety + the authoring lint ────────────────────────────────────────────

// True when a word is safe to put in front of a child: not a floor blocklist word
// (exact, and including a parent's additive layer) and not carrying a never-word
// (substring). Exported so a static test can assert the whole bank passes without
// re-declaring either list.
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
  Object.values(TIERS).forEach((tier) => tier.forEach((w) => seen.add(w)));
  Object.values(TRACK_POOLS).forEach((p) => p.forEach((w) => seen.add(w)));
  Object.values(TIER_BAND).forEach((p) => p.forEach((w) => seen.add(w)));
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

// ─── The shuffled bag — why a lap never repeats itself ──────────────────────
//
// The ONLY module state in this file, and it is the whole repetition fix (see the
// header). One bag per track id, holding a shuffled copy of that track's pool and a
// cursor into it. Words are handed out in shuffle order, so within any window of
// `pool.length` consecutive draws — ACROSS LAPS, not just inside one — every word
// appears exactly once. The bag is rebuilt whenever the pool it was made from changes
// (a different track, or the player moving MIN/MAX WORD LENGTH mid-session), which is
// what `key` compares.

const bags = new Map();

// Fisher–Yates on a copy. Never mutates a frozen group.
function shuffled(words) {
  const out = words.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = out[i]; out[i] = out[j]; out[j] = t;
  }
  return out;
}

function bagFor(track, wordPool) {
  const id = (track && track.id) || '(fallback)';
  const key = wordPool.join(' ');
  let bag = bags.get(id);
  if (!bag || bag.key !== key) {
    bag = { key, order: shuffled(wordPool), next: 0, last: null };
    bags.set(id, bag);
  }
  return bag;
}

// Hand out the next word. The refill is where the guarantee is actually earned: the
// bag is reshuffled (never tail-repeated) and then ordered so the current lap gets the
// freshest words first —
//   1. words NOT yet used in this lap, shuffled — so "no duplicate while unused words
//      remain" survives a bag boundary that lands mid-lap;
//   2. then the used ones OLDEST-FIRST, in two shuffled halves. A lap can outrun its
//      pool (EXPERIENCE 3.5x asks F-Zero for ~131 words from ~106), and when it does
//      this is what decides whether the unavoidable second use lands twelve words
//      later or half a pool later. Sorting by last-use pushes it as far away as the
//      pool allows; shuffling within each half stops the second cycle from replaying
//      the first one in order, which would read as a loop.
// `usedThisLap` is a Map of word → the index it was last handed out at this lap.
function nextFromBag(bag, usedThisLap) {
  if (bag.next >= bag.order.length) {
    const shuffledPool = shuffled(bag.order);
    let order = shuffledPool;
    if (usedThisLap && usedThisLap.size > 0) {
      const fresh = [];
      const used = [];
      for (const w of shuffledPool) (usedThisLap.has(w) ? used : fresh).push(w);
      used.sort((a, b) => usedThisLap.get(a) - usedThisLap.get(b));
      const half = Math.ceil(used.length / 2);
      order = fresh.concat(shuffled(used.slice(0, half)), shuffled(used.slice(half)));
    }
    if (order.length > 1 && order[0] === bag.last) {
      const j = 1 + Math.floor(Math.random() * (order.length - 1));
      const t = order[0]; order[0] = order[j]; order[j] = t;
    }
    bag.order = order;
    bag.next = 0;
  }
  const word = bag.order[bag.next++];
  bag.last = word;
  return word;
}

// Forget every bag — the next lap starts from a fresh shuffle. Nothing in the game
// needs this (leaving the arcade drops the module anyway); tests use it to make a
// measurement independent of whatever ran before it.
export function resetWordBags() { bags.clear(); }

// Build the whole lap's word list up front, so the lap ALWAYS ends on a completed
// word rather than mid-word. `targetChars` is a target, not a cap: we keep drawing
// until the total reaches it, and the lap's real length is whatever that sum is.
// (This is why track.js measures progress against the returned list's own total.)
export function buildLapWords(track, targetChars) {
  const wordPool = poolForTrack(track);
  if (wordPool.length === 0) return ['go'];          // never return nothing
  const target = Math.max(1, Math.floor(Number(targetChars) || 1));
  const bag = bagFor(track, wordPool);
  const usedThisLap = new Map();   // word → the index it was last handed out at
  const words = [];
  let total = 0;
  let guard = 0;
  while (total < target && guard++ < 4000) {
    const w = nextFromBag(bag, usedThisLap);
    usedThisLap.set(w, words.length);
    words.push(w);
    total += w.length;
  }
  if (words.length === 0) words.push(nextFromBag(bag, usedThisLap));
  return words;
}
