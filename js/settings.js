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
  playerName: 'PLAYER ONE',
};

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
