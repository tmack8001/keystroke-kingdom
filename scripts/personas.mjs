// Keystroke Kingdom — personas.mjs
// ─────────────────────────────────────────────────────────────────────────────
// The playtest harness's GAMER PERSONAS, as data. One source of truth.
//
//   node scripts/playtest.mjs --persona=list
//   node scripts/playtest.mjs --at=level:8 --persona=struggling-beginner
//   node scripts/playtest.mjs --at=level:4 --persona=speedrunner:survival --seed=7
//
// WHY THIS EXISTS. Five persona testers were run as PROSE briefs ("you are a first-
// timer, pause 2-5 s before each key, get a quarter of them wrong…"). Every run had to
// re-invent its settings, its typing behaviour, its seeded save and its focus list from
// that prose — so two runs of "the struggling beginner" were two different testers, and
// a finding could not be re-played to check a fix. A persona is now a named, versioned,
// reproducible thing: the same id + the same --seed configures the same settings, the
// same seeded save, and the same sequence of typing DECISIONS on every run.
//
// WHAT A PERSONA IS NOT. It is never a claim about a real child, and it never reaches
// the game as data about one. `who` is prose for the human reading a report; nothing
// here is written to storage except (a) `settings` — values from js/settings.js's own
// option lists — and (b) `seed` — the kk-slots shape js/slots.js already accepts, whose
// only personal datum is a display name (security.md rule 8: no ages, no surnames, no
// location). EXPERIENCE is "to a player's typing experience (never age)" (product.md
// §Toggleable Settings), so a persona's settings are chosen by typing experience too.
// The same holds for its NAME: a persona id or label never carries an age (the explorer
// was once `explorer-8yo`; renamed 2026-10-30, Trevor — security.md rule 8 in spirit).
// tests/unit/personas.test.mjs fails on any age-shaped token in an id or label.
//
// REPRODUCIBILITY — what is and is not fixed by --seed. The persona's DECISIONS are a
// pure function of (persona id, variant, seed): how long it pauses, whether this press
// is wrong, how many times it repeats the wrong key, which neighbour of the key it hits,
// when it mashes, idles, blurs or presses Escape. The decision stream NEVER branches on
// what is on screen, so it is identical run to run even though the game's own pattern
// pool is unseeded (Math.random in js/main.js — deliberately left alone; seeding it
// would be changing the product to satisfy the harness, testing.md / journal L8). The
// literal CORRECT letters therefore differ between runs; the decision trace does not.
//
// Zero dependencies, ES module, no DOM — imported by scripts/playtest.mjs and by
// tests/unit/personas.test.mjs.

// ── seeded RNG ───────────────────────────────────────────────────────────────
// mulberry32: tiny, fast, good enough for test choreography, and — the only property
// that matters here — exactly reproducible from a 32-bit seed on every JS engine.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// FNV-1a, so each persona gets its own stream from the same --seed (two personas run
// with --seed=1 should not make the same mistakes on the same presses).
export function hashString(s) {
  let h = 0x811C9DC5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export const DEFAULT_SEED = 1979; // the year the arcade lives in

// ── keyboard neighbours (for "adjacent wrong key") ──────────────────────────
// A child's wrong key is usually the key NEXT to the right one, not a random one.
// US ANSI letter rows only; derived from the physical rows, not from hud.js (this is
// the persona's hand, not the game's keyboard guide, and must not import game code).
const ROWS = ['qwertyuiop', 'asdfghjkl;', 'zxcvbnm,./'];
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

// Neighbours of a key that are LOWERCASE LETTERS — the safest possible wrong keys:
// js/main.js handleGameKey treats any of them as a plain mistake on the game screen,
// and none of them is a command there (Escape/Tab are the only game-screen commands;
// `q` only quits while PAUSED, and the persona always un-pauses before typing on).
export function neighboursOf(token) {
  const t = typeof token === 'string' && token.length === 1 ? token.toLowerCase() : '';
  const out = [];
  for (let r = 0; r < ROWS.length; r += 1) {
    const c = ROWS[r].indexOf(t);
    if (c === -1) continue;
    for (const [dr, dc] of [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, -1], [1, 0]]) {
      const row = ROWS[r + dr];
      const ch = row && row[c + dc];
      if (ch && LETTERS.includes(ch) && ch !== t) out.push(ch);
    }
  }
  // Space, Backspace, digits, symbols with no letter neighbour: any letter that is not
  // the token. Kept in a FIXED order so the index the RNG drew maps reproducibly.
  return out.length ? [...new Set(out)] : LETTERS.split('').filter((ch) => ch !== t);
}

// ── the personas ─────────────────────────────────────────────────────────────
// `settings` — kk-settings keys and values, each one a value js/settings.js accepts
//   UNCHANGED (tests/unit/personas.test.mjs pushes every persona through the real
//   sanitizer and fails if a single value is coerced). Defaults are written out
//   explicitly so a persona's run never inherits anything.
// `behavior` — how it types. Every *Ms range is [min, max] in real milliseconds.
//   cadenceMs           pause before each intended keypress
//   wrongKeyRate        chance a press is preceded by a wrong key
//   wrongStyle          'adjacent' (a neighbour of the right key) | 'random'
//   repeatWrongRun      how many times the SAME wrong key is pressed, [min,max]
//   beatAfterWrongMs    the pause between the wrong key and the right one
//   mashBurst           false | { chance, keys:[min,max], perSecond }
//   modifierPresses     chance of a lone Shift/Control/Alt/Meta (must be ignored)
//   holdChance/holdRepeats  chance of holding a wrong key down (auto-repeat events)
//   idleChance/idleMs   chance of walking away, and for how long
//   blurChance/blurMs   chance the tab loses focus (blur + visibilitychange)
//   disruptChance/disruptKeys  Escape (pause), Tab, Space pressed mid-level
// `seed` — { kind:'fresh' } or { kind:'slots', resume, slots:[…kk-slots games] }.
// `route` — 'wopr' (the harness's normal select-screen bypass) or 'first-time' (the
//   real cold open: title → name → ready → keyboard preview, no bypass; Level 1 only).
// `host` — 'root' | 'prefix' (the GitHub Pages /keystroke-kingdom/ shape, no backend).
// `focus` — what this persona is FOR: --at targets and what to judge there.
// `acceptance` — what a run must show. `wrongKeyNeverAdvances` is the One Rule's
//   sacred wrong-keypress contract (CLAUDE.md §Wrong Keypress Behavior); a violation
//   fails the run. `maxLevelMinutes` is persona-paced time per level, REPORTED.

const ADVENTURE_DEFAULTS = Object.freeze({
  playStyle: 'adventure',
  winRatio: 1,
  minWordLen: 0,
  maxWordLen: 0,
  hintStyle: 'moderate',
  mistakeDisplay: 'small',
});

const QUIET = Object.freeze({
  mashBurst: false,
  modifierPresses: 0,
  holdChance: 0,
  holdRepeats: [0, 0],
  idleChance: 0,
  idleMs: [0, 0],
  blurChance: 0,
  blurMs: [0, 0],
  disruptChance: 0,
  disruptKeys: [],
});

const PERSONAS = [
  {
    id: 'first-timer',
    label: 'A — the first-timer',
    who: 'Brand new to keyboards and to reading. Slow, deliberate, often hits the key next to the right one, then finds it.',
    settings: { ...ADVENTURE_DEFAULTS },
    behavior: {
      ...QUIET,
      cadenceMs: [2000, 5000],
      wrongKeyRate: 0.25,
      wrongStyle: 'adjacent',
      repeatWrongRun: [1, 1],
      beatAfterWrongMs: [600, 1500],
    },
    seed: { kind: 'fresh' },
    route: 'first-time',
    playerName: 'OONA',
    host: 'root',
    focus: [
      { at: 'level:1', laps: 2, judge: 'the one-time finger guide is there on run 1 and GONE on run 2 (onboarding.md §Design Rules)' },
      { at: 'complete:1', laps: 2, judge: 'Levels 1-5 one at a time: does a slow, mistaken run still feel like progress?' },
      { at: 'cinematic:mystery', laps: 1, judge: 'the curtain drop, reached by actually winning Level 5' },
      { at: 'level:1', laps: 1, fresh: true, judge: 'erase the save — the third program, fresh eyes' },
      { at: 'level:8', laps: 1, judge: 'Tetris at a first-timer\'s pace: winnable, never cruel (journal F23)' },
    ],
    acceptance: { wrongKeyNeverAdvances: true, idleNeverPunishes: true, maxLevelMinutes: 15 },
  },
  {
    id: 'struggling-beginner',
    label: 'B — the struggling beginner',
    who: 'Gets more keys wrong than right, sticks on the same wrong key, mashes, holds keys down, wanders off, presses Escape.',
    settings: { ...ADVENTURE_DEFAULTS },
    behavior: {
      cadenceMs: [1200, 3500],
      wrongKeyRate: 0.55,
      wrongStyle: 'adjacent',
      repeatWrongRun: [3, 6],
      beatAfterWrongMs: [400, 1200],
      mashBurst: { chance: 0.05, keys: [8, 10], perSecond: 9 },
      modifierPresses: 0.05,
      holdChance: 0.03,
      holdRepeats: [6, 14],
      idleChance: 0.015,
      idleMs: [30000, 90000],
      blurChance: 0.015,
      blurMs: [2000, 6000],
      disruptChance: 0.025,
      disruptKeys: ['Escape', 'Tab', 'Space'],
    },
    seed: { kind: 'fresh' },
    route: 'wopr',
    host: 'root',
    focus: [
      { at: 'level:4', laps: 2, judge: 'first real words under a storm of wrong keys — the letter waits every time' },
      { at: 'level:8', laps: 1, judge: 'Tetris: the win gate still closes (F23)' },
      { at: 'level:17', laps: 1, judge: 'GoldenEye arena: mistakes are ambient, never alarming' },
      { at: 'level:19', laps: 1, judge: 'FF7: no HP-loss reading of a wrong key' },
      { at: 'level:20', laps: 1, judge: 'the terminal: idle never advances background state (journal L20)' },
      { at: 'level:24', laps: 1, judge: 'Shift: lone modifiers are never mistakes (INV input contract)' },
      { at: 'coda:25', laps: 1, judge: 'Space/Backspace mid-mash never skip the story' },
    ],
    acceptance: { wrongKeyNeverAdvances: true, idleNeverPunishes: true, maxLevelMinutes: 30 },
  },
  {
    id: 'family-parent',
    label: 'C — the family parent',
    who: 'A grown-up on the shared family machine: three saved games, steady typing, curious about the cards.',
    settings: {
      playStyle: 'adventure',
      winRatio: 2.25,
      minWordLen: 4,
      maxWordLen: 8,
      hintStyle: 'subtle',
      mistakeDisplay: 'small',
    },
    behavior: {
      ...QUIET,
      cadenceMs: [800, 1200],
      wrongKeyRate: 0.04,
      wrongStyle: 'adjacent',
      repeatWrongRun: [1, 1],
      beatAfterWrongMs: [200, 500],
    },
    // The shared machine. Card ids are real ids from js/history-cards.js (the unit test
    // checks every one). DAD (index 1) is resumed: furthest Level 20 with 20 itself not
    // yet completed, so the eighth-key confession is still ahead of him, the act-card
    // layer (gated at 15) is live, and so is THE HARDWARE (opens at 20).
    seed: {
      kind: 'slots',
      resume: 1,
      slots: [
        { name: 'OONA', furthestLevel: 12, completed: range(1, 11), nameMoment: null, textWorlds: {},
          cards: ['ada-lovelace', 'hal-9000', 'hedy-lamarr', 'the-web'], cardRotation: {}, storyRotation: {}, speedway: {} },
        { name: 'DAD', furthestLevel: 20, completed: range(1, 19), nameMoment: null, textWorlds: {},
          cards: ['floppy-disk', 'the-mouse', 'alan-turing', 'grace-hopper', 'eliza'], cardRotation: {}, storyRotation: {}, speedway: {} },
        { name: 'GRAM', furthestLevel: 4, completed: range(1, 3), nameMoment: null, textWorlds: {},
          cards: [], cardRotation: {}, storyRotation: {}, speedway: {} },
      ],
    },
    route: 'wopr',
    host: 'root',
    focus: [
      { at: 'slots', laps: 1, judge: 'three games, three names, three ★ counts — readable at a glance' },
      { at: 'complete:13', laps: 3, judge: 'card rotation: three wins, three different cards' },
      { at: 'freeplay:3', laps: 2, judge: 'act cards (gated at L15) rotate in Free Play' },
      { at: 'hardware:apple-iie', laps: 2, judge: 'the wing card on the way out, twice' },
      { at: 'complete:20', laps: 1, judge: 'the eighth-key confession fires once for DAD, never on a replay' },
    ],
    acceptance: { wrongKeyNeverAdvances: true, idleNeverPunishes: true, maxLevelMinutes: 12 },
  },
  {
    id: 'speedrunner',
    label: 'D — the speedrunner',
    who: 'A keyboard-savvy teen or adult at ~90 WPM who turns every difficulty lever up and wants the long road.',
    settings: {
      playStyle: 'adventure',
      winRatio: 3.5,
      minWordLen: 6,
      maxWordLen: 24,
      hintStyle: 'subtle',
      mistakeDisplay: 'small',
    },
    behavior: {
      ...QUIET,
      cadenceMs: [100, 130],
      wrongKeyRate: 0.01,
      wrongStyle: 'adjacent',
      repeatWrongRun: [1, 1],
      beatAfterWrongMs: [80, 160],
    },
    // Config 2 — the ONLY place in this file Survival appears. Survival is opt-in
    // (product.md §Core Principles 1); a persona opts in by being asked for by name:
    // --persona=speedrunner:survival. Settings here REPLACE the base config's.
    variants: {
      survival: {
        label: 'D2 — the speedrunner, SURVIVAL',
        settings: {
          playStyle: 'survival',
          difficulty: 'expert',
          lives: 1,
        },
        acceptance: { wrongKeyNeverAdvances: true, idleNeverPunishes: false, maxLevelMinutes: 5 },
      },
    },
    seed: { kind: 'fresh' },
    route: 'wopr',
    host: 'root',
    focus: [
      { at: 'complete:8', laps: 1, judge: 'WIZARD 3.5x: Tetris still winnable (theme-authoring.md §EXPERIENCE)' },
      { at: 'complete:22', laps: 1, judge: 'Q*bert\'s scaled extra-sequence floor is reachable at 3.5x' },
      { at: 'complete:4', laps: 1, variant: 'survival', judge: 'Survival EXPERT, 1 quarter: time pressure only, wrong keys cost nothing' },
      { at: 'speedway:monaco-gp', laps: 2, judge: 'a 90-WPM lap, then its ghost' },
      { at: 'coda:25', laps: 2, judge: 'coda length grows at the top tier; a different story on run 2' },
    ],
    acceptance: { wrongKeyNeverAdvances: true, idleNeverPunishes: true, maxLevelMinutes: 8 },
  },
  {
    id: 'explorer',
    label: 'E — the explorer',
    who: 'A steady early typist (~10 WPM) who wants to open every door, on the PUBLISHED static host with no backend.',
    settings: { ...ADVENTURE_DEFAULTS },
    behavior: {
      ...QUIET,
      cadenceMs: [900, 1500],
      wrongKeyRate: 0.15,
      wrongStyle: 'adjacent',
      repeatWrongRun: [1, 2],
      beatAfterWrongMs: [400, 900],
    },
    seed: { kind: 'fresh' },
    route: 'wopr',
    host: 'prefix',
    focus: [
      { at: 'select', laps: 1, judge: 'the back wall: which wings are lit, and at which level each one opens' },
      { at: 'hardware:apple-iie', laps: 2, judge: 'THE HARDWARE with no backend' },
      { at: 'speedway:monaco-gp', laps: 2, judge: 'THE SPEEDWAY with no backend' },
      { at: 'coda:25', laps: 1, judge: '/api/keyboard-story 404s → the static story bank, silently' },
      { at: 'level:9', laps: 1, judge: '/api/wordgen 404s → static words, no stall; also run scripts/static-host-check.mjs' },
    ],
    acceptance: { wrongKeyNeverAdvances: true, idleNeverPunishes: true, maxLevelMinutes: 15 },
  },
];

function range(lo, hi) {
  const out = {};
  for (let i = lo; i <= hi; i += 1) out[i] = true;
  return out;
}

function deepFreeze(o) {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) {
    Object.freeze(o);
    for (const v of Object.values(o)) deepFreeze(v);
  }
  return o;
}
PERSONAS.forEach(deepFreeze);

export function listPersonas() {
  return PERSONAS.slice();
}

export function personaIds() {
  return PERSONAS.map((p) => p.id);
}

// "speedrunner" or "speedrunner:survival". Returns the resolved persona (variant
// settings REPLACE the base settings — a variant is a different configuration, not a
// tweak) or throws with the list of valid names.
export function resolvePersona(spec) {
  const [id, variant = null, ...extra] = String(spec || '').split(':');
  const base = PERSONAS.find((p) => p.id === id);
  if (!base || extra.length) {
    throw new Error(`no persona "${spec}". Known: ${allPersonaSpecs().join(', ')}`);
  }
  if (variant === null) return { ...base, variant: null, spec: base.id };
  const v = base.variants && base.variants[variant];
  if (!v) throw new Error(`persona "${id}" has no variant "${variant}". Known: ${allPersonaSpecs().join(', ')}`);
  return {
    ...base,
    variant,
    spec: `${id}:${variant}`,
    label: v.label || base.label,
    settings: v.settings || base.settings,
    behavior: v.behavior || base.behavior,
    acceptance: v.acceptance || base.acceptance,
  };
}

export function allPersonaSpecs() {
  const out = [];
  for (const p of PERSONAS) {
    out.push(p.id);
    for (const v of Object.keys(p.variants || {})) out.push(`${p.id}:${v}`);
  }
  return out;
}

// ── the decision stream ─────────────────────────────────────────────────────
// `createBehavior(persona, seed)` returns `next()`, which yields the decision for the
// NEXT intended keypress. It takes no arguments on purpose: the stream must not
// depend on what is on screen (see the header). The harness turns a decision into
// keys; `wrongIndex` is resolved against neighboursOf(token) only at press time.
//
// Every call consumes the same SHAPE of draws in the same order, gated only by earlier
// draws, so a decision trace is a pure function of (persona, variant, seed).
export function createBehavior(persona, seed = DEFAULT_SEED) {
  const b = persona.behavior;
  const rng = mulberry32((hashString(persona.spec || persona.id) ^ (seed >>> 0)) >>> 0);
  const between = ([lo, hi]) => Math.round(lo + rng() * (hi - lo));
  const chance = (p) => rng() < p;
  let n = 0;
  function next() {
    n += 1;
    const d = { n, pauseMs: between(b.cadenceMs), before: [] };
    // Each draw below happens on EVERY call (the value is ignored when the behaviour
    // is off), so turning one behaviour on never shifts any other's decisions.
    const idle = chance(b.idleChance); const idleMs = between(b.idleMs);
    const blur = chance(b.blurChance); const blurMs = between(b.blurMs);
    const disrupt = chance(b.disruptChance);
    const disruptKey = b.disruptKeys.length ? b.disruptKeys[Math.floor(rng() * b.disruptKeys.length)] : null;
    const mod = chance(b.modifierPresses);
    const modKey = ['Shift', 'Control', 'Alt', 'Meta'][Math.floor(rng() * 4)];
    const mash = !!b.mashBurst && chance(b.mashBurst.chance);
    const mashN = b.mashBurst ? between(b.mashBurst.keys) : 0;
    const mashKeys = [];
    for (let i = 0; i < 10; i += 1) mashKeys.push(LETTERS[Math.floor(rng() * LETTERS.length)]);
    const hold = chance(b.holdChance); const holdN = between(b.holdRepeats); const holdIdx = rng();
    const wrong = chance(b.wrongKeyRate);
    const run = between(b.repeatWrongRun);
    const wrongIdx = rng();
    const beatMs = between(b.beatAfterWrongMs);

    if (idle) d.before.push({ type: 'idle', ms: idleMs });
    if (blur) d.before.push({ type: 'blur', ms: blurMs });
    if (disrupt && disruptKey) d.before.push({ type: 'disrupt', key: disruptKey });
    if (mod) d.before.push({ type: 'modifier', key: modKey });
    if (mash) {
      d.before.push({
        type: 'mash',
        keys: mashKeys.slice(0, Math.min(mashN, mashKeys.length)),
        gapMs: Math.round(1000 / b.mashBurst.perSecond),
      });
    }
    if (hold) d.before.push({ type: 'hold', wrongIndex: holdIdx, repeats: holdN });
    if (wrong) d.before.push({ type: 'wrong', wrongIndex: wrongIdx, run, style: b.wrongStyle, beatMs });
    return d;
  }
  return { next };
}

// The wrong key for a decision, resolved against what is on screen NOW. Never equal to
// the expected token (case-insensitively for a lowercase token; a lowercase letter is
// always wrong for an UPPERCASE token, which needs Shift).
export function wrongKeyFor(token, wrongIndex, style = 'adjacent') {
  const pool = style === 'random'
    ? LETTERS.split('').filter((ch) => ch !== String(token).toLowerCase())
    : neighboursOf(token);
  return pool[Math.min(pool.length - 1, Math.floor(wrongIndex * pool.length))];
}

// A compact, screen-independent fingerprint of a decision — what the reproducibility
// proof compares. Literal correct letters are NOT in it (they come from the game).
export function describeDecision(d) {
  const parts = [`#${d.n} ${d.pauseMs}ms`];
  for (const a of d.before) {
    if (a.type === 'wrong') parts.push(`wrong×${a.run}@${a.wrongIndex.toFixed(3)}+${a.beatMs}ms`);
    else if (a.type === 'mash') parts.push(`mash[${a.keys.join('')}]`);
    else if (a.type === 'hold') parts.push(`hold×${a.repeats}`);
    else if (a.type === 'idle' || a.type === 'blur') parts.push(`${a.type} ${a.ms}ms`);
    else parts.push(`${a.type}:${a.key}`);
  }
  return parts.join(' ');
}

// One-line summary for the PERSONA banner.
export function settingsSummary(settings) {
  return Object.entries(settings).map(([k, v]) => `${k}=${v}`).join(' ');
}
