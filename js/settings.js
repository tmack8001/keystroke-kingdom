// Settings — the documented "Toggleable Settings" table (product.md) finally
// gets a screen. Persisted to localStorage. Defaults reproduce the exact
// pre-feature behavior — a player who never opens settings sees zero change.
//
// The Golden Rule stays absolute even here: SURVIVAL is opt-in only, and
// wrong keypresses NEVER cost anything, in any mode. Settings only ever
// adjusts pacing/cosmetics on top of the untouched base engine.

const STORAGE_KEY = 'kk-settings';

const DEFAULTS = {
  playStyle: 'adventure',        // 'adventure' | 'survival'
  lives: 3,                      // 1-5, survival only
  difficulty: 'novice',          // 'novice' | 'arcade' | 'expert', survival only
  hintStyle: 'moderate',         // 'subtle' | 'moderate' | 'obvious'
  mistakeDisplay: 'small',       // 'hidden' | 'small' | 'prominent'
  sound: true,
  crtEffects: true,
  statsVisible: true,
  winRatio: 1,                   // 1 | 1.5 | 2.25 | 3.5 — typing-confidence scaler
  minWordLen: 0,                 // 0 (ANY / no floor) | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  maxWordLen: 0,                 // 0 (ANY / no cap) | 4 | 5 | 6 | 7 | 8 | 10 | 12 | 16 | 24
  playerName: 'PLAYER ONE',
};

// Word-length range — a player-set DIFFICULTY lever on which real words the game
// draws. Shorter words = easier (younger/newer); longer words = harder
// (older/keyboard-savvy). This is the word-content sibling of EXPERIENCE
// (win-ratio) — part of the family of settings that let the game AGE WITH THE
// PLAYER, arcade-style (arcades were always for adults and kids alike).
//
// 0 means ANY (no bound). DEFAULT is ANY/ANY, so an untouched Settings screen
// changes nothing — the filter never fires. It is BEST-EFFORT, never a wall:
// the engine ALWAYS falls back to a level's own words rather than let a range
// empty a pool (winnability is the One Rule floor, never traded for a setting),
// and guaranteed content (intro drills, history-card words, the player's name)
// is never filtered. Levels 1–3 have no real words, so it is a no-op there. The
// harder (longer) end has real headroom — MAX climbs in single steps past the
// early-reader ceiling of 8 all the way to a WIZARD-equivalent 24 (the aspirational
// top, mirroring EXPERIENCE's WIZARD) — so a savvy player can crank genuine
// difficulty; naturally, high MIN/MAX only "bite" at levels whose unlocked keys
// can spell words/sentences that long (early levels quietly fall back). The
// wordgen GENERATION ceiling is raised to match (24, main.go maxPlayWordLen);
// how usefully the model fills the long end is validated EMPIRICALLY, never
// assumed. Value lists are the source of truth for the settings rows below.
export const MIN_WORD_LEN_VALUES = [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const MAX_WORD_LEN_VALUES = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 0];

// EXPERIENCE (win-ratio) — a multiplier on how much typing a level requires
// before it can be won, so the game scales to a player's typing EXPERIENCE
// (never their age). Higher = MORE play, never a penalty. Default MUST be 1x
// (the One Rule house law: settings are toggles, not defaults). Trevor's tier
// values. Consumed by the engine minimum-patterns gate AND by themes that wire
// getWinRatio() into their internal win targets.
export const WIN_RATIO_VALUES = [1, 1.5, 2.25, 3.5];

// Aspirational, kid-safe, arcade-voiced labels — about earned experience, never
// age, never judgmental. Every tier is a badge of pride.
export const WIN_RATIO_LABEL = {
  1: 'FIRST QUARTER',
  1.5: 'REGULAR',
  2.25: 'HOTSHOT',
  3.5: 'WIZARD',
};

export const WIN_RATIO_DESCRIPTOR = {
  1: 'JUST RIGHT FOR A NEW HAND',
  1.5: 'YOU KNOW THIS ROOM NOW',
  2.25: 'FAST FINGERS WANT MORE',
  3.5: 'GO THE DISTANCE',
};

// The single source of truth for the live multiplier. Themes import THIS
// (never the settings object) to scale their internal win targets. Reads the
// cached settings, tolerates garbage, and always returns a valid tier value.
export function getWinRatio() {
  const s = getSettings();
  return WIN_RATIO_VALUES.includes(s.winRatio) ? s.winRatio : 1;
}

// The single source of truth for the live word-length range. The engine imports
// THIS (never the raw settings object) to filter a level's drawable word pool.
// Returns { min, max } as plain numbers: ANY-floor → 1, ANY-cap → Infinity, so a
// pattern of character-length L is in range when `L >= min && L <= max`. A
// nonsensical min>max (should be coerced away in sanitize) degrades to the
// no-filter range — the filter never becomes a trap. Default (ANY/ANY) →
// { min: 1, max: Infinity }, i.e. everything passes (today's behavior).
export function getWordLengthRange() {
  const s = getSettings();
  const rawMin = MIN_WORD_LEN_VALUES.includes(s.minWordLen) ? s.minWordLen : 0;
  const rawMax = MAX_WORD_LEN_VALUES.includes(s.maxWordLen) ? s.maxWordLen : 0;
  const min = rawMin === 0 ? 1 : rawMin;
  const max = rawMax === 0 ? Infinity : rawMax;
  if (min > max) return { min: 1, max: Infinity };
  return { min, max };
}

let cached = null;

function sanitize(raw) {
  const s = { ...DEFAULTS, ...(raw && typeof raw === 'object' ? raw : {}) };
  if (s.playStyle !== 'adventure' && s.playStyle !== 'survival') s.playStyle = DEFAULTS.playStyle;
  s.lives = Math.max(1, Math.min(5, Number.isFinite(s.lives) ? Math.round(s.lives) : DEFAULTS.lives));
  if (!['novice', 'arcade', 'expert'].includes(s.difficulty)) s.difficulty = DEFAULTS.difficulty;
  if (!['subtle', 'moderate', 'obvious'].includes(s.hintStyle)) s.hintStyle = DEFAULTS.hintStyle;
  if (!['hidden', 'small', 'prominent'].includes(s.mistakeDisplay)) s.mistakeDisplay = DEFAULTS.mistakeDisplay;
  s.sound = !!s.sound;
  s.crtEffects = !!s.crtEffects;
  s.statsVisible = !!s.statsVisible;
  if (![1, 1.5, 2.25, 3.5].includes(s.winRatio)) s.winRatio = DEFAULTS.winRatio;
  if (!MIN_WORD_LEN_VALUES.includes(s.minWordLen)) s.minWordLen = DEFAULTS.minWordLen;
  if (!MAX_WORD_LEN_VALUES.includes(s.maxWordLen)) s.maxWordLen = DEFAULTS.maxWordLen;
  // Coerce a bounded min above a bounded max into a sane range (swap). ANY (0)
  // on either side is not a bound, so it never triggers coercion.
  if (s.minWordLen !== 0 && s.maxWordLen !== 0 && s.minWordLen > s.maxWordLen) {
    const t = s.minWordLen; s.minWordLen = s.maxWordLen; s.maxWordLen = t;
  }
  s.playerName = (typeof s.playerName === 'string' && s.playerName.trim()) ? s.playerName.slice(0, 16) : DEFAULTS.playerName;
  return s;
}

export function loadSettings() {
  let raw = null;
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    raw = null;
  }
  cached = sanitize(raw);
  return cached;
}

export function saveSettings(s) {
  cached = sanitize(s);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  } catch (e) {
    // localStorage unavailable (private mode etc) — settings stay in-memory
    // for this session only. Never throw; never block play.
  }
  return cached;
}

export function getSettings() {
  if (!cached) return loadSettings();
  return cached;
}

// Survival tuning knobs — kept here so the "challenging, never cruel" law
// lives next to the rest of the settings model.
export const DIFFICULTY_MULTIPLIER = {
  novice: 1.6,
  arcade: 1.1,
  expert: 0.85,
};

export const DIFFICULTY_LABEL = {
  novice: 'NOVICE',
  arcade: 'ARCADE',
  expert: 'EXPERT',
};

export const DIFFICULTY_DESCRIPTOR = {
  novice: 'PLENTY OF TIME',
  arcade: 'THE CLASSIC PACE',
  expert: 'FOR SHOWOFFS',
};

// ─── Settings screen rows ────────────────────────────────────────────────
// Declarative row model: each row knows its label, how to read/cycle its
// value, how to render its display string, and whether it's active given
// the current settings (inactive rows render dimmed and ArrowLeft/Right
// still no-ops safely).

const ROWS = [
  {
    key: 'playStyle',
    label: 'PLAY STYLE',
    values: ['adventure', 'survival'],
    display: (v) => v.toUpperCase(),
    descriptor: (v) => v === 'survival'
      ? 'QUARTERS ON THE LINE. TIME PRESSURE. 1979 RULES.'
      : 'NO TIMERS. NO LIVES. JUST YOU AND THE KEYS.',
    active: () => true,
  },
  {
    key: 'lives',
    label: 'LIVES',
    values: [1, 2, 3, 4, 5],
    display: (v) => `${v} QUARTER${v === 1 ? '' : 'S'}`,
    descriptor: () => '',
    active: (s) => s.playStyle === 'survival',
  },
  {
    key: 'difficulty',
    label: 'DIFFICULTY',
    values: ['novice', 'arcade', 'expert'],
    display: (v) => DIFFICULTY_LABEL[v],
    descriptor: (v) => DIFFICULTY_DESCRIPTOR[v],
    active: (s) => s.playStyle === 'survival',
  },
  {
    key: 'winRatio',
    label: 'EXPERIENCE',
    values: WIN_RATIO_VALUES,
    display: (v) => WIN_RATIO_LABEL[v] || WIN_RATIO_LABEL[1],
    descriptor: (v) => WIN_RATIO_DESCRIPTOR[v] || WIN_RATIO_DESCRIPTOR[1],
    active: () => true,
  },
  {
    key: 'minWordLen',
    label: 'MIN WORD LENGTH',
    values: MIN_WORD_LEN_VALUES,
    display: (v) => v === 0 ? 'ANY' : `${v} LETTERS`,
    descriptor: (v) => v === 0
      ? 'NO MINIMUM — SHORT WORDS OK'
      : `ONLY WORDS ${v}+ LETTERS — TOUGHER`,
    active: () => true,
  },
  {
    key: 'maxWordLen',
    label: 'MAX WORD LENGTH',
    values: MAX_WORD_LEN_VALUES,
    display: (v) => v === 0 ? 'ANY' : `${v} LETTERS`,
    descriptor: (v) => v === 0
      ? 'NO LIMIT — LONGEST WORDS TOO'
      : `NOTHING OVER ${v} LETTERS — EASIER`,
    active: () => true,
  },
  {
    key: 'hintStyle',
    label: 'HINTS',
    values: ['subtle', 'moderate', 'obvious'],
    display: (v) => v.toUpperCase(),
    descriptor: () => '',
    active: () => true,
  },
  {
    key: 'mistakeDisplay',
    label: 'MISTAKES SHOWN',
    values: ['hidden', 'small', 'prominent'],
    display: (v) => v.toUpperCase(),
    descriptor: () => '',
    active: () => true,
  },
  {
    key: 'sound',
    label: 'SOUND',
    values: [true, false],
    display: (v) => v ? 'ON' : 'OFF',
    descriptor: () => '',
    active: () => true,
  },
  {
    key: 'crtEffects',
    label: 'CRT EFFECT',
    values: [true, false],
    display: (v) => v ? 'ON' : 'OFF',
    descriptor: () => '',
    active: () => true,
  },
  {
    key: 'statsVisible',
    label: 'STATS DISPLAY',
    values: [true, false],
    display: (v) => v ? 'ON' : 'OFF',
    descriptor: () => '',
    active: () => true,
  },
  {
    key: 'erase',
    label: 'ERASE ALL PROGRESS',
    values: [null],
    display: () => '',
    descriptor: () => 'THIS CANNOT BE UNDONE',
    active: () => true,
    action: true,
  },
];

export function getRows() {
  return ROWS;
}

function cycleValue(row, current, dir) {
  const idx = row.values.indexOf(current);
  const from = idx === -1 ? 0 : idx;
  const next = (from + dir + row.values.length) % row.values.length;
  return row.values[next];
}

// Pure state-transition helpers used by the settings screen controller in
// main.js — keep DOM rendering out of this file so it stays testable and
// side-effect-free about anything except localStorage persistence.
export function applyRowChange(settings, rowIndex, dir) {
  const row = ROWS[rowIndex];
  if (!row || row.action || !row.active(settings)) return settings;
  const next = { ...settings, [row.key]: cycleValue(row, settings[row.key], dir) };
  return saveSettings(next);
}
