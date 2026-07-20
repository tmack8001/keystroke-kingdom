import * as Audio from './audio.js';
import { LEVELS, FINGER_MAP } from './levels.js';
import { updateHUD, showFingerHint, displayKey, renderKeyboard, renderPrompt, computeWPM, renderQuarters, flashBonusQuarter } from './ui/hud.js';
import { showScreen, applyLevelTheme, renderReadyScreen, renderSlotsScreen, renderCollectionScreen, createStars } from './ui/screens.js';
import { renderSelectScreen, updateSelectHighlight, navigateAct, navigateWithinAct, selectByPosition, isLevelLocked } from './ui/cabinet-art.js';
import { Themes, activeTheme, stopAll } from './themes/index.js';
import * as KeyboardPreview from './ui/keyboard-preview.js';
import * as Mystery from './mystery.js';
import * as Basement from './basement.js';
import * as CommandCenter from './commandcenter.js';
import * as FullCircle from './fullcircle.js';
import { FREEPLAY_KEYS, buildFreePlayPatterns } from './freeplay.js';
import { TOTAL_CARDS, wordToTokens, patternMatchesCard, cardsForLevel, cardById, allCards, pickGuaranteedCard } from './history-cards.js';
import * as Slots from './slots.js';
import { getSettings, saveSettings, getRows, applyRowChange, DIFFICULTY_MULTIPLIER, getWinRatio, getWordLengthRange } from './settings.js';
import { initWordgen, prefetch as wordgenPrefetch, takeWords as wordgenTakeWords } from './wordgen.js';
import * as TextWorldHub from './textworld/hub.js';

const $ = (id) => document.getElementById(id);

// The WarGames (1983) magic words that open the cabinet-select bypass. JOSHUA
// is the WOPR's backdoor password and the machine's own name — the film's whole
// "SHALL WE PLAY A GAME?" thread. Typing any of them ALSO collects the hidden
// WarGames history card into the active game's collection (a secret Skulltula —
// findable only by the curious who know the words). See easter-eggs.md.
const SECRET_PHRASES = ['shallweplayagame', 'wopr', 'wargames', 'joshua'];
const WARGAMES_CARD_ID = 'wargames-joshua';
let secretBuffer = '';

// ─── Hidden hacker-culture responses (title screen) ─────────────────────────
// See .claude/rules/easter-eggs.md for the full catalog and design rules.
// These never interrupt play — they only answer when summoned by name.
const EGGS = {
  'xyzzy':     'NOTHING HAPPENS.',                                // Colossal Cave Adventure, 1976
  'iddqd':     'GOD MODE DENIED. THIS GAME NEVER TAKES LIVES.',   // Doom, 1993 — and our one rule
  'adventure': 'WARREN ROBINETT WAS HERE. 1979.',                 // the first video game easter egg
  'eliza':     'HOW DOES TYPING MAKE YOU FEEL?',                  // ELIZA, 1966
  'hello':     'HELLO. YOU FOUND ME. COME IN.',                   // what the Mystery Cabinet says
};
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIdx = 0;
let eggTimer = null;

function showEggResponse(text) {
  secretBuffer = '';
  const el = $('wopr-text');
  el.textContent = text;
  Audio.coin();
  clearTimeout(eggTimer);
  eggTimer = setTimeout(() => { if (el.textContent === text) el.textContent = ''; }, 5000);
}

function trackKonami(key) {
  konamiIdx = key === KONAMI[konamiIdx] ? konamiIdx + 1 : (key === KONAMI[0] ? 1 : 0);
  if (konamiIdx < KONAMI.length) return false;
  konamiIdx = 0;
  // The classic grants 30 lives; we never take lives away,
  // so the sky gets brighter instead.
  for (let i = 0; i < 30; i++) {
    const star = document.createElement('div');
    star.className = 'star bright';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    document.body.appendChild(star);
  }
  showEggResponse('30 STARS. NO EXTRA LIVES NEEDED — YOU NEVER LOSE ANY.');
  return true;
}

// ─── Returning-player persistence ────────────────────────────────────────
// Progress now lives inside a SAVE SLOT (js/slots.js) — up to three independent
// saved games, each with its own name, curriculum progress, Act-6 text-world
// progress, name-moment record, and collected history-card set. These thin
// wrappers keep the SAME shape main.js has always used
// ({ furthestLevel, completed, nameMoment, textWorlds }) but read/write the
// ACTIVE slot, so every existing call site below is unchanged. With no active
// slot (WOPR dev bypass before a game is picked) reads return a fresh default
// and writes are no-ops — the dev path just doesn't persist.
function getProgress() {
  return Slots.getProgress();
}

function saveProgress(p) {
  Slots.saveProgress(p);
}

// Called at the level-complete moment: mark this level done and unlock the
// next. Never regresses furthestLevel (replaying an early level can't lock
// later ones). Free play never records progress — it's cabinet-hopping.
function recordLevelComplete(levelNum) {
  const p = getProgress();
  p.completed[String(levelNum)] = true;
  const nextUnlocked = Math.min(25, levelNum + 1);
  if (nextUnlocked > p.furthestLevel) p.furthestLevel = nextUnlocked;
  saveProgress(p);
}

// Act 6: mark a text world (e.g. 'greendragon') as visited/completed in its own
// namespace. Never throws, never blocks play (same posture as recordLevelComplete).
function recordTextWorldComplete(id) {
  const p = getProgress();
  if (!p.textWorlds || typeof p.textWorlds !== 'object') p.textWorlds = {};
  p.textWorlds[String(id)] = { completed: true };
  saveProgress(p);
}

// The Settings-screen "ERASE ALL PROGRESS / ERASE EVERYTHING?" path — a true
// factory reset that wipes EVERY saved game (kk-slots), matching its label,
// while KEEPING kk-settings (name + global preferences). Reloading afterward
// cold-opens as a brand-new machine. This is distinct from the slot picker's
// per-game erase (X → Y/N), which removes just one game. Per-letter mistakes
// live only in state.mistakes (in-memory), so a fresh startGame() resets them.
export function eraseProgress() {
  Slots.eraseAll();
}

const settings = getSettings();
Audio.setEnabled(settings.sound);
document.documentElement.classList.toggle('no-crt', !settings.crtEffects);

const state = {
  screen: 'title',
  playerName: settings.playerName || 'PLAYER ONE',
  coinInserted: false,
  level: 1,
  selectedLevel: 1,
  freePlay: false,
  currentPattern: 0,
  currentIndex: 0,
  patternsCompleted: 0,
  totalCorrect: 0,
  totalAttempts: 0,
  streak: 0,
  bestStreak: 0,
  mistakes: {},
  wrongOnCurrent: false,
  paused: false,
  startTime: null,
  patterns: [],
  cardWordTyped: false,
  // The single guaranteed history card chosen for THIS play of the level (or
  // null if the level hides none). Rotates across replays (pickGuaranteedCard),
  // preferring a card not yet collected in the active slot. Everything about the
  // card gate — sparkle detect, win-gate, reveal — keys off this one object.
  currentCard: null,

  // Name Moment (see nameWordForLevel etc.): the lowercase name-word that
  // earns this level's guaranteed golden injection, or null. nameMomentDone
  // guards the once-per-game flourish so replaying the same run can't re-fire
  // it mid-session; nameMomentFired() (persisted) guards it across sessions.
  nameMomentWord: null,
  nameMomentDone: false,

  // Slot picker ("CHOOSE YOUR GAME") — the returning-player front door. Games
  // are an unlimited, growable list; the picker shows one row per game plus a
  // trailing "＋ NEW GAME" row, so slotsSelected ranges over [0 .. count].
  slotsSelected: 0,          // 0-based highlighted row (count == the NEW GAME row)
  slotsEraseConfirm: false,  // X → Y/N erase confirmation sub-state
  pendingNewGame: false,     // a new-game name entry is in progress (append on confirm)
  collectionForSlot: 0,      // which game the collection gallery is showing

  // Select-screen gating: the highest level the player may enter. Cabinets
  // beyond this render dark/locked and can't be selected — EXCEPT the WOPR
  // bypass sets selectBypass=true, unlocking every cabinet for dev/parents.
  maxUnlockedLevel: 1,
  selectBypass: false,
  // Sub-state of the 'select' screen: the back-wall door to Act 6 (Text Worlds)
  // is focused. Only ever true while on the select screen; any Escape clears it.
  doorFocused: false,

  // Settings screen navigation
  settingsReturn: 'title',   // 'title' | 'pause'
  settingsSelectedRow: 0,
  settingsEraseConfirm: false,

  // SURVIVAL wrapper state — always additive on top of the base engine.
  // Never read/written unless settings.playStyle === 'survival'.
  survival: {
    active: false,
    quartersRemaining: 0,
    quartersTotal: 0,
    survivalStreak: 0,
    patternDeadline: null,   // timestamp the current pattern must finish by
    patternDuration: 0,      // ms allotted to the current pattern
    remainingAtPause: null,  // ms left when paused, so pause doesn't cost time
    rafId: null,
    lettersTyped: 0,
  },
};

// Free Play uses the selected cabinet's theme/art/era but swaps in the full
// keyboard and full-sentence pool. We never mutate LEVELS — this builds a
// shallow effective-level view, cached per session so the pool/pattern list
// stays stable across repeated getLevelData() calls within one game.
let freePlayLevelCache = null;
let freePlayLevelCacheFor = null;

function buildFreePlayLevel(level) {
  if (freePlayLevelCache && freePlayLevelCacheFor === state.level) {
    return freePlayLevelCache;
  }
  freePlayLevelCache = {
    ...level,
    keys: FREEPLAY_KEYS,
    newKeys: [],
    intro: [],
    pool: buildFreePlayPatterns(state.level),
  };
  freePlayLevelCacheFor = state.level;
  return freePlayLevelCache;
}

function getLevelData() {
  const level = LEVELS[state.level];
  return state.freePlay ? buildFreePlayLevel(level) : level;
}

// Wraps ui/screens.js's renderReadyScreen to also show/hide the SURVIVAL
// MODE tag — kept here (not in screens.js, which this feature doesn't own)
// so the ready screen still reflects the current opt-in play style.
function renderReadyScreenWithSurvivalTag() {
  renderReadyScreen(state, getLevelData());
  const tag = $('survival-tag');
  if (tag) tag.classList.toggle('hidden', settings.playStyle !== 'survival');
}

// The DRAWABLE real-word pool for a level, after the player-set WORD-LENGTH
// DIFFICULTY lever (settings.js getWordLengthRange) is applied — best-effort,
// with a HARD winnability floor. Word length = token count (patterns are arrays
// of single-char tokens). This filter is the word-content sibling of EXPERIENCE:
// it lets the game AGE WITH THE PLAYER (shorter=younger/easier, longer=older/
// harder) WITHOUT ever trading away the One Rule floor — a range that would
// empty a level's pool silently falls back to that level's UNFILTERED pool, so
// no (min,max) the settings UI allows can hang a level. Resolved per call so a
// mid-session settings change takes effect on the next level build / next draw
// (mirrors how getWinRatio is consumed — never cached at module load).
//
// EXEMPT content (intro drills, history-card word, name-moment word, the L24
// player-name pattern) is added elsewhere (level.intro here, splices in
// startGame) and is deliberately NOT routed through this function — filtering it
// would break the win-gate or the pedagogy.
function drawablePool(level) {
  const pool = level.pool;
  if (!pool || pool.length === 0) return pool || [];
  const { min, max } = getWordLengthRange();
  // No-op fast path (default ANY/ANY → min:1,max:Infinity): return the pool
  // unchanged so behavior is byte-identical when the setting is untouched.
  if (min <= 1 && max === Infinity) return pool;
  const filtered = pool.filter(p => p.length >= min && p.length <= max);
  // WINNABILITY FALLBACK (the One Rule floor): an emptied pool would make the
  // level unwinnable — fall back to the full unfiltered pool for this level.
  // A non-empty filtered pool is safe even if tiny: the engine refills its
  // pattern list by redrawing from this same (non-empty) set infinitely.
  return filtered.length ? filtered : pool;
}

function buildPatterns(level) {
  if (state.freePlay) {
    // Already shuffled (themed first, then shared) by buildFreePlayPatterns.
    // Free Play is the unconstrained sandbox — the word-length lever is EXEMPT.
    return [...level.pool];
  }
  // Locally-generated words (wordgen.js: same-origin Ollama, security.md rules
  // 6-7) AUGMENT the static pool — never replace it. takeWords returns [] when
  // wordgen is inactive or no validated batch is ready, so the static-fallback
  // path is byte-identical. Generated words join the shuffle only; intro
  // drills, card-word and name-moment injections below are untouched.
  // The player-set WORD-LENGTH difficulty lever applies to the drawable
  // real-word POOL only (drawablePool: filtered, with unfiltered fallback so a
  // range can never empty it). generated words are already length-bounded
  // server-side, so they join the shuffle as-is. wrapSample is sampled from the
  // full pool (a structural sample for wordgen, not player-facing content).
  const pool = drawablePool(level);
  const generated = wordgenTakeWords(state.level, {
    keys: level.keys,
    wrapSample: level.pool.find(p => p.some(t => t.length === 1 && !/[a-z0-9]/i.test(t))),
  });
  const shuffled = [...pool, ...generated].sort(() => Math.random() - 0.5);
  const patterns = [...level.intro, ...shuffled];

  // "Familiar visitor": from a name-word's first spellable level ONWARD (but
  // NOT on the guaranteed-moment level itself — nameMomentWord is set there and
  // the name is already injected up front), the name may drop in once per run
  // as an occasional low-frequency pattern (~35% of runs). It's spliced a few
  // slots into the intro-drill zone — always reached before the win-gate can
  // fire, but not at the very front, so it reads as an occasional familiar
  // face, not a drill. Completing it gets the normal word celebration — never
  // the golden first-time flourish (that only fires when nameMomentWord is
  // set, which it isn't here). At most one appearance per run.
  if (!state.nameMomentWord) {
    const words = spellableNameWords(state.playerName, state.level);
    if (words.length && Math.random() < 0.35) {
      const word = words[Math.floor(Math.random() * words.length)];
      // Land it in the early guaranteed-reached zone (a few slots into the
      // intro drills), so a fast player still meets the familiar face before
      // the win-gate can fire — but not at the very front, so it reads as an
      // occasional visitor, not a drill. Never at the moment-level (guarded
      // above by nameMomentWord).
      const at = Math.min(patterns.length, Math.floor(level.intro.length * 0.5) + 1);
      patterns.splice(at, 0, word.split(''));
    }
  }
  return patterns;
}

// A single fresh random draw from the current level's pool. Used both when
// the initial pattern list is exhausted (getNextPattern below) and when a
// survival timeout needs to replace the current prompt.
function drawRandomPattern() {
  const level = getLevelData();
  // Draw from the SAME filtered-or-fallback set buildPatterns uses, so redraws
  // past the initial pattern list keep honoring the word-length lever (and the
  // fallback keeps them winnable). Free Play is the exempt sandbox — draw from
  // its own unfiltered pool. Guard the empty case: an empty set here would yield
  // `undefined` and hang/crash the engine downstream (this guard is the fix for
  // the pre-existing unguarded empty-pool draw, now reachable via filtering —
  // though drawablePool's fallback already keeps any level's set non-empty).
  const pool = state.freePlay ? level.pool : drawablePool(level);
  if (!pool || pool.length === 0) return level.intro[level.intro.length - 1] || [];
  return pool[Math.floor(Math.random() * pool.length)];
}

function getNextPattern() {
  if (state.currentPattern < state.patterns.length) {
    return state.patterns[state.currentPattern];
  }
  // Past the initial sequence — draw randomly from the pool, but PERSIST the
  // draw at its index so every later read of this same position agrees. The
  // engine calls getNextPattern() more than once per position (once to render
  // the prompt, again on each keystroke to validate) — without persistence a
  // fresh random draw each call would make the displayed word and the expected
  // word diverge, and the level would become impossible to advance reliably.
  // This surfaced on Level 8, whose Tetris win-gate can outlast the initial
  // list, but it applies to any level that runs past its pattern list.
  while (state.patterns.length <= state.currentPattern) {
    state.patterns.push(drawRandomPattern());
  }
  return state.patterns[state.currentPattern];
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min + ':' + String(sec).padStart(2, '0');
}

// ─── SURVIVAL wrapper ───────────────────────────────────────────────────
// tech.md: "Survival Mode ... implemented as a wrapper/modifier on top of
// base engine. Base engine never has survival logic — it's always
// additive." Everything below is pure addition: it never intercepts or
// changes the wrong-key contract in handleGameKey. It only ever (a) starts
// a per-pattern clock, (b) re-rolls the CURRENT pattern on timeout without
// advancing patternsCompleted, and (c) hands back a quarter on a 15-streak.

function survivalPatternDuration(pattern) {
  const mult = DIFFICULTY_MULTIPLIER[settings.difficulty] || DIFFICULTY_MULTIPLIER.novice;
  const base = 5000 + 1400 * pattern.length;
  return Math.round(base * mult);
}

function stopSurvivalTimer() {
  if (state.survival.rafId) {
    cancelAnimationFrame(state.survival.rafId);
    state.survival.rafId = null;
  }
}

function updateSurvivalBar() {
  const bar = $('survival-timer-bar');
  if (!bar || !state.survival.active) return;
  const remaining = Math.max(0, state.survival.patternDeadline - Date.now());
  const pct = state.survival.patternDuration > 0
    ? (remaining / state.survival.patternDuration) * 100
    : 0;
  bar.style.width = pct + '%';
  bar.classList.toggle('low', pct < 25);
}

function survivalTick() {
  if (!state.survival.active || state.paused || state.screen !== 'game') {
    state.survival.rafId = null;
    return;
  }
  updateSurvivalBar();
  if (Date.now() >= state.survival.patternDeadline) {
    handleSurvivalTimeout();
    return;
  }
  state.survival.rafId = requestAnimationFrame(survivalTick);
}

function startSurvivalPatternTimer(pattern) {
  if (!state.survival.active) return;
  const duration = survivalPatternDuration(pattern);
  state.survival.patternDuration = duration;
  state.survival.patternDeadline = Date.now() + duration;
  const track = $('survival-timer-track');
  if (track) track.classList.remove('hidden');
  updateSurvivalBar();
  stopSurvivalTimer();
  state.survival.rafId = requestAnimationFrame(survivalTick);
}

function pauseSurvivalTimer() {
  if (!state.survival.active || state.survival.patternDeadline == null) return;
  state.survival.remainingAtPause = Math.max(0, state.survival.patternDeadline - Date.now());
  stopSurvivalTimer();
}

function resumeSurvivalTimer() {
  if (!state.survival.active || state.survival.remainingAtPause == null) return;
  state.survival.patternDeadline = Date.now() + state.survival.remainingAtPause;
  state.survival.remainingAtPause = null;
  stopSurvivalTimer();
  state.survival.rafId = requestAnimationFrame(survivalTick);
}

// MERCY MECHANIC: every 15-streak of correct keys earns a quarter back, up
// to the starting count. "Skill always offers a way back."
function maybeAwardMercyQuarter() {
  if (!state.survival.active) return;
  state.survival.survivalStreak++;
  if (state.survival.survivalStreak > 0 && state.survival.survivalStreak % 15 === 0
      && state.survival.quartersRemaining < state.survival.quartersTotal) {
    state.survival.quartersRemaining++;
    renderQuarters(state.survival.quartersRemaining, state.survival.quartersTotal);
    flashBonusQuarter();
    Audio.bonusQuarter();
  }
}

function handleSurvivalTimeout() {
  stopSurvivalTimer();
  state.survival.survivalStreak = 0;
  state.survival.quartersRemaining--;
  renderQuarters(Math.max(0, state.survival.quartersRemaining), state.survival.quartersTotal);
  Audio.timeout();

  if (state.survival.quartersRemaining <= 0) {
    showGameOver();
    return;
  }

  // Timeout replaces the CURRENT pattern with a fresh one — never skips
  // ahead, never counts toward patternsCompleted. Level progress is
  // otherwise untouched.
  const level = getLevelData();
  state.currentIndex = 0;
  const fresh = drawRandomPattern();
  // Only write back into the live pattern list when currentPattern actually
  // indexes into it. In Free Play (and any run) the initial list can be
  // exhausted, at which point currentPattern has advanced PAST patterns.length
  // and getNextPattern() draws randomly instead of reading the array. Writing
  // to patterns[currentPattern] there would create a sparse out-of-bounds
  // slot — the QA-found bug. When we're past the list we just render `fresh`
  // directly and leave the array untouched.
  if (state.currentPattern < state.patterns.length) {
    state.patterns[state.currentPattern] = fresh;
  }
  renderPrompt(state, level, fresh);
  startSurvivalPatternTimer(fresh);
}

function showGameOver() {
  stopSurvivalTimer();
  const track = $('survival-timer-track');
  if (track) track.classList.add('hidden');
  $('game-screen').querySelector('.game-area').classList.add('hidden');
  $('game-screen').querySelector('.hud').classList.add('hidden');
  $('gameover-count').textContent = String(state.survival.lettersTyped);
  $('gameover-overlay').classList.remove('hidden');
  state.screen = 'gameover';
  Audio.gameOver();
}

function handleGameKey(e) {
  if (state.screen !== 'game') return;

  // 1. Ignore entirely — no preventDefault, never counts as wrong.
  if (e.key === 'Tab' || e.key === 'Escape') return;

  // 2. Ignore modifier/navigation/function keys entirely — never counts as wrong.
  //    (Backspace is the one multi-char e.key we DO handle.)
  if (e.key.length > 1 && e.key !== 'Backspace' && e.key !== ' ') return;

  // 3. Everything else on the game screen should never scroll/navigate the page.
  e.preventDefault();

  // 4. Determine the raw token: Backspace stays as-is, space stays ' ',
  //    single chars validated against the allowed set (case preserved for now).
  let key;
  if (e.key === 'Backspace') {
    key = 'Backspace';
  } else if (e.key === ' ') {
    key = ' ';
  } else if (/^[a-zA-Z;,./0-9\-=\[\]\\'`]$/.test(e.key)) {
    key = e.key;
  } else {
    return;
  }

  const level = getLevelData();
  const pattern = getNextPattern();
  const expected = pattern[state.currentIndex];

  // 5. Case rule: uppercase A-Z expected tokens require an exact (shift-held) match.
  //    Everything else is compared lowercase, so CapsLock doesn't affect levels 1-23.
  const expectsUpper = /^[A-Z]$/.test(expected);
  if (!expectsUpper && key.length === 1 && key !== ' ') {
    key = key.toLowerCase();
  }

  if (key === expected) {
    state.totalCorrect++;
    state.totalAttempts++;
    state.streak++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;
    state.wrongOnCurrent = false;
    state.survival.lettersTyped++;
    // Mercy mechanic: streak-based, independent of the base engine's own
    // streak/accuracy tracking above. Wrong keys never affect it directly —
    // they only reset it via state.streak = 0 in the wrong-key branch below.
    maybeAwardMercyQuarter();

    const theme = activeTheme(state.level);
    if (theme && theme.keystroke) theme.keystroke(key);
    Audio.correct();

    const el = document.querySelector(`.prompt-letter[data-index="${state.currentIndex}"]`);
    if (el) {
      el.classList.remove('active', 'wrong');
      el.classList.add('completed', 'correct');
    }

    $('finger-hint').innerHTML = '';

    state.currentIndex++;

    if (state.currentIndex >= pattern.length) {
      // History card sparkle: the word is just a normal pattern in every way
      // — this only fires an ambient shimmer, it never pauses or gates flow.
      if (!state.freePlay && !state.cardWordTyped) {
        const card = state.currentCard;
        if (card && patternMatchesCard(pattern, card)) {
          state.cardWordTyped = true;
          const promptArea = document.querySelector('.prompt-area');
          if (promptArea) {
            promptArea.classList.remove('card-glint');
            void promptArea.offsetWidth;
            promptArea.classList.add('card-glint');
          }
        }
      }

      // The Name Moment flourish — the once-ever warm golden celebration the
      // first time the player completes their own name. Fires only on the
      // guaranteed-injection level, only once per run (nameMomentDone), and
      // is persisted (markNameMomentFired) so replays and later sessions never
      // re-fire it. Just a richer completion effect — no pause, no modal, no
      // gate (One Rule). Later completions get the normal word celebration.
      if (!state.freePlay && !state.nameMomentDone && state.nameMomentWord
          && patternMatchesName(pattern, state.nameMomentWord)) {
        state.nameMomentDone = true;
        markNameMomentFired(state.playerName);
        fireNameFlourish();
      }

      state.currentPattern++;
      state.patternsCompleted++;
      state.currentIndex = 0;

      // SURVIVAL: timer stops between patterns — no clock runs during the
      // brief transition, exactly like the base engine has no penalty here.
      stopSurvivalTimer();
      const track = $('survival-timer-track');
      if (track) track.classList.add('hidden');

      const pTheme = activeTheme(state.level);
      let themeComplete = false;
      if (pTheme && pTheme.patternComplete) {
        themeComplete = pTheme.patternComplete();
      }

      // Level ends when theme game is won AND enough patterns completed —
      // free play requires at least 5 sentences; curriculum levels require
      // their intro drills, scaled by the EXPERIENCE win-ratio (1x = current
      // behavior). The ratio only ever RAISES the minimum — more play, never a
      // penalty. Free Play keeps its own fixed minimum (its own confidence gate).
      // The card guarantee (cardPending below) is unaffected — the card is still
      // guaranteed before any win, at every ratio. getNextPattern() refills the
      // pool infinitely, so a higher minimum is always structurally reachable.
      const minPatterns = state.freePlay
        ? 5
        : Math.ceil(level.intro.length * getWinRatio());
      // If this level hides a history card, the level can't end until its
      // moment word has been typed — the card is earned, never missable.
      const cardPending = !state.freePlay
        && state.currentCard
        && !state.cardWordTyped;
      // Likewise, if this is the level where the player's name first becomes
      // spellable, the level can't end until they've completed their name —
      // the golden Name Moment is guaranteed, never missable (same guarantee
      // shape as the card, but a fully independent gate).
      const namePending = !state.freePlay
        && state.nameMomentWord
        && !state.nameMomentDone;
      if (themeComplete && state.patternsCompleted >= minPatterns && !cardPending && !namePending) {
        setTimeout(showLevelComplete, 400);
        return;
      }

      setTimeout(() => {
        const nextPattern = getNextPattern();
        renderPrompt(state, level, nextPattern);
        if (settings.hintStyle === 'obvious') showFingerHint(nextPattern[0]);
        startSurvivalPatternTimer(nextPattern);
      }, 300);
    } else {
      setTimeout(() => {
        const nextEl = document.querySelector(`.prompt-letter[data-index="${state.currentIndex}"]`);
        if (nextEl) nextEl.classList.add('active');
        renderKeyboard(level, pattern[state.currentIndex], null, state);
      }, 150);
    }

    updateHUD(state, settings);
  } else {
    if (!state.wrongOnCurrent) {
      state.totalAttempts++;
      state.wrongOnCurrent = true;
    }
    state.mistakes[expected] = (state.mistakes[expected] || 0) + 1;
    state.streak = 0;
    // CRITICAL (CLAUDE.md, tech.md): wrong keypresses NEVER cost quarters or
    // time. Survival only resets the mercy-quarter streak counter here —
    // exactly like the base engine's own streak — never the clock, never a
    // quarter. The letter still just waits.
    state.survival.survivalStreak = 0;

    const theme = activeTheme(state.level);
    if (theme && theme.miss) theme.miss();

    Audio.wrong();

    const el = document.querySelector(`.prompt-letter[data-index="${state.currentIndex}"]`);
    if (el) {
      el.classList.remove('wrong');
      void el.offsetWidth;
      el.classList.add('wrong');
    }

    renderKeyboard(level, expected, level.keys.includes(key) ? key : null, state);

    // hintStyle: 'moderate' = original behavior (hint on every wrong key).
    // 'subtle' = only after 2+ mistakes on this same expected letter.
    // 'obvious' behaves like 'moderate' here (its proactive half fires when
    // a new pattern renders — see renderPrompt calls below).
    // EXCEPTION preserved: Level 1's first-prompt guide is unconditional and
    // lives in keyboard-preview.js / the ready flow, untouched by this.
    if (settings.hintStyle !== 'subtle' || state.mistakes[expected] >= 2) {
      showFingerHint(expected);
    }
    updateHUD(state, settings);

    setTimeout(() => {
      if (el) el.classList.remove('wrong');
      renderKeyboard(level, expected, null, state);
    }, 300);
  }
}

function showLevelComplete() {
  stopSurvivalTimer();
  const elapsed = Date.now() - state.startTime;
  const acc = state.totalAttempts > 0
    ? Math.round((state.totalCorrect / state.totalAttempts) * 100)
    : 100;
  const level = getLevelData();

  $('final-time').textContent = formatTime(elapsed);
  $('final-accuracy').textContent = acc + '%';
  $('final-streak').textContent = state.bestStreak;
  $('final-keys').textContent = level.keys.map(k => displayKey(k)).join(' ');

  const wpmRow = $('final-wpm-row');
  if (state.freePlay) {
    const wpm = computeWPM(state);
    $('final-wpm').textContent = wpm === null ? '--' : String(wpm);
    wpmRow.classList.remove('hidden');
  } else {
    wpmRow.classList.add('hidden');
  }

  // History card reveal — never shown in free play (curriculum-only feature).
  // Not every level hides one; that's what makes finding them special.
  const historyCard = $('history-card');
  const card = !state.freePlay ? state.currentCard : null;
  if (card && state.cardWordTyped) {
    const isNew = Slots.collectCardId(card.id);
    $('history-card-word').textContent = card.word.toUpperCase();
    $('history-card-title').textContent = card.title;
    $('history-card-year').textContent = card.year;
    $('history-card-fact').textContent = card.fact;
    $('history-card-count').textContent = `CARD ${Slots.collectedCount()} OF ${TOTAL_CARDS}`;
    $('history-card-new').classList.toggle('hidden', !isNew);
    historyCard.classList.remove('hidden');
  } else {
    historyCard.classList.add('hidden');
  }

  if (state.freePlay) {
    document.querySelector('.complete-title').textContent = 'FREE PLAY COMPLETE';
    $('complete-prompt').textContent = 'PRESS SPACE FOR THE ARCADE';
  } else if (state.level === 25) {
    document.querySelector('.complete-title').textContent = 'FULL KEYBOARD MASTERED';
    $('complete-prompt').textContent = 'YOU BUILT THIS';
  } else if (state.level === 24) {
    document.querySelector('.complete-title').textContent = 'YOU TYPED YOUR NAME';
    $('complete-prompt').textContent = 'PRESS SPACE FOR THE LAST LEVEL';
  } else if (state.level === 23) {
    document.querySelector('.complete-title').textContent = 'CORNER CABINETS CLEARED';
    $('complete-prompt').textContent = 'PRESS SPACE TO CONTINUE';
  } else if (state.level === 20) {
    document.querySelector('.complete-title').textContent = 'NUMBERS UNLOCKED';
    $('complete-prompt').textContent = 'PRESS SPACE TO CONTINUE';
  } else if (state.level === 15) {
    document.querySelector('.complete-title').textContent = 'FULL KEYBOARD UNLOCKED';
    $('complete-prompt').textContent = 'PRESS SPACE TO CONTINUE';
  } else if (state.level === 10) {
    document.querySelector('.complete-title').textContent = 'TOP ROW COMPLETE';
    $('complete-prompt').textContent = 'PRESS SPACE TO CONTINUE';
  } else if (state.level === 5) {
    document.querySelector('.complete-title').textContent = 'HOME ROW MASTERED';
    $('complete-prompt').textContent = 'PRESS SPACE FOR THE MYSTERY';
  } else if (state.level === 4) {
    document.querySelector('.complete-title').textContent = 'HOME ROW COMPLETE';
    $('complete-prompt').textContent = 'THE MYSTERY CABINET AWAITS';
  } else {
    document.querySelector('.complete-title').textContent = 'LEVEL COMPLETE';
    $('complete-prompt').textContent = 'PRESS SPACE FOR NEXT LEVEL';
  }

  // Record returning-player progress at the true level-complete moment.
  // Free play never advances the curriculum, so it never records. This runs
  // AFTER the history-card gate in handleGameKey (which is what decides the
  // level is complete at all) — the card logic itself is untouched.
  if (!state.freePlay) {
    recordLevelComplete(state.level);
    if (state.level + 1 > state.maxUnlockedLevel) {
      state.maxUnlockedLevel = Math.min(25, state.level + 1);
    }
  }

  const theme = activeTheme(state.level);
  // A theme's victory() may return its celebration duration in ms — the card
  // appears right as the animation lands instead of after a fixed dead-air
  // hold (Trevor's playtest report, 2026-07-12). No/invalid return keeps the
  // historical 4s window; clamped so a bad value can't stall or clip the beat.
  let victoryMs = 4000;
  if (theme && theme.victory) {
    const declared = theme.victory();
    if (Number.isFinite(declared)) {
      victoryMs = Math.min(6000, Math.max(1200, declared));
    }
  }

  $('game-screen').querySelector('.game-area').classList.add('hidden');
  $('game-screen').querySelector('.hud').classList.add('hidden');

  state.screen = 'victory';
  Audio.levelComplete();

  state.victoryTimer = setTimeout(() => {
    if (state.screen === 'victory') {
      state.screen = 'complete';
      $('complete-overlay').classList.remove('hidden');
    }
  }, victoryMs);
}

// Level 24: build the player's own name as a shift-typed pattern —
// title-case each word (first letter uppercase, rest lowercase), letters
// only, words joined with no separator (space hasn't been taught yet).
function buildPlayerNamePattern(playerName) {
  const words = playerName.split(' ').filter(Boolean);
  const chars = [];
  words.forEach(word => {
    const letters = word.replace(/[^a-zA-Z]/g, '');
    if (!letters) return;
    chars.push(letters[0].toUpperCase());
    for (let i = 1; i < letters.length; i++) {
      chars.push(letters[i].toLowerCase());
    }
  });
  return chars;
}

// ─── The Name Moment (pre-Shift personalization) ─────────────────────────
// The player's own name becomes typeable content the instant the unlocked
// key set can spell it — which for many names lands long before Level 24's
// capitalized ceremony (e.g. "oona" is spellable at Level 12). This is a
// warm personal beat, not a mechanic: lowercase only (capitals need Shift,
// taught at 24), never for the untouched default "PLAYER ONE", never
// coupled to the history-card gate. See .claude/rules/product.md.
//
// Sanitization mirrors buildPlayerNamePattern (security.md rule 3): strip to
// [a-zA-Z], lowercase, split multi-word names into independent words. Each
// word qualifies on its own — a "Mary Jane" spells "mary" and "jane" at
// whatever levels their letters unlock.

const DEFAULT_PLAYER_NAME = 'PLAYER ONE';

// The lowercase, letters-only words of a player-entered name. Returns [] for
// the untouched default and for names with no letters — both cases mean "no
// name moment" downstream. The default check is on the raw display name so a
// deliberate "player one" a child actually typed is treated the same as the
// reserved default (it's indistinguishable and safest to skip).
function nameWordsFor(playerName) {
  if (!playerName || playerName.trim().toUpperCase() === DEFAULT_PLAYER_NAME) return [];
  return playerName
    .split(' ')
    .map(w => w.replace(/[^a-zA-Z]/g, '').toLowerCase())
    .filter(Boolean);
}

// A lowercase word is spellable at a level when every one of its letters is
// in that level's cumulative unlocked key set (LEVELS[n].keys). Uppercase
// keys ('Shift') and non-letters in .keys are irrelevant here — we only ask
// about the letters the word needs.
function wordSpellableAtLevel(word, levelNum) {
  const level = LEVELS[levelNum];
  if (!level) return false;
  const keySet = new Set(level.keys);
  for (const ch of word) {
    if (!keySet.has(ch)) return false;
  }
  return true;
}

// The FIRST curriculum level (1..25) at which `word` becomes spellable, or
// null if it never does. Levels 24/25 are excluded as "the moment" target —
// 24 is the capitalized name ceremony and owns the name there; the pre-Shift
// personalization only means anything before it. (A word that first becomes
// spellable only at 24+ simply gets no early moment.)
function firstSpellableLevel(word) {
  for (let n = 1; n <= 23; n++) {
    if (wordSpellableAtLevel(word, n)) return n;
  }
  return null;
}

// For the current player + level: the name-word (if any) whose first
// spellable level IS this level. That's the word that earns the guaranteed
// injection + golden flourish here. If several words share a first level, the
// first-listed one wins (one moment per level is plenty). Returns null when
// none qualifies at this level.
function nameWordForLevel(playerName, levelNum) {
  for (const word of nameWordsFor(playerName)) {
    if (firstSpellableLevel(word) === levelNum) return word;
  }
  return null;
}

// Every name-word already spellable at this level (first-spellable <= level).
// These are the words eligible to appear as low-frequency "familiar visitors"
// from their first level onward.
function spellableNameWords(playerName, levelNum) {
  return nameWordsFor(playerName).filter(word => {
    const first = firstSpellableLevel(word);
    return first != null && first <= levelNum;
  });
}

// ── Name-moment persistence (once-ever golden flourish) ──
// Stored inside kk-progress alongside furthestLevel/completed, following the
// same try/catch, tolerate-garbage pattern. Shape:
//   nameMoment: { name: "oona" }   // the sanitized name the flourish fired for
// A rename earns a fresh moment: the flourish re-fires only when the current
// name doesn't match the stored one.
function nameMomentFired(playerName) {
  const p = getProgress();
  const nm = p.nameMoment;
  if (!nm || typeof nm.name !== 'string') return false;
  // "Fired" means fired for THIS exact set of sanitized words. Compare the
  // joined lowercase word list so re-ordering/whitespace can't matter.
  return nm.name === nameWordsFor(playerName).join(' ');
}

function markNameMomentFired(playerName) {
  const p = getProgress();
  p.nameMoment = { name: nameWordsFor(playerName).join(' ') };
  saveProgress(p);
}

// A just-completed pattern IS the name-moment word when its tokens spell the
// lowercase word exactly (one letter per token). Mirrors patternMatchesCard.
function patternMatchesName(pattern, word) {
  if (!word || pattern.length !== word.length) return false;
  for (let i = 0; i < word.length; i++) {
    if (pattern[i] !== word[i]) return false;
  }
  return true;
}

// The golden flourish: a warm, personal celebration clearly richer than a
// normal word completion — the whole prompt panel blooms gold and each
// letter of the name glows/sparkles. Pure CSS classes on existing DOM +
// canvas-free particle sparkles positioned over the prompt letters. NEVER a
// modal, never a pause. Security: the name reaches the DOM only as the
// prompt letters the engine already rendered (via textContent-equivalent
// pattern rendering) — this only adds CSS classes and decorative spark divs
// with no name text, so no new name-bearing DOM sink is created.
let nameFlourishTimer = null;
function fireNameFlourish() {
  Audio.coin();
  const promptArea = document.querySelector('.prompt-area');
  if (promptArea) {
    promptArea.classList.remove('name-flourish');
    void promptArea.offsetWidth;
    promptArea.classList.add('name-flourish');
  }
  // Gild each completed name letter.
  const letters = document.querySelectorAll('.prompt-letter');
  letters.forEach((el, i) => {
    el.classList.remove('name-gold');
    void el.offsetWidth;
    // Stagger so the name lights up left-to-right like a marquee.
    el.style.setProperty('--name-gold-delay', (i * 70) + 'ms');
    el.classList.add('name-gold');
    spawnSparkles(el);
  });
  clearTimeout(nameFlourishTimer);
  nameFlourishTimer = setTimeout(() => {
    if (promptArea) promptArea.classList.remove('name-flourish');
    document.querySelectorAll('.prompt-letter.name-gold').forEach(el => {
      el.classList.remove('name-gold');
      el.style.removeProperty('--name-gold-delay');
    });
  }, 1600);
}

// A small bounded burst of decorative gold sparkles over one letter. Fixed
// cap, self-removing, no name text — purely ornamental divs.
function spawnSparkles(anchorEl) {
  const seq = document.getElementById('prompt-sequence');
  if (!seq) return;
  const host = seq.parentElement || seq; // .prompt-area, positioned
  const rect = anchorEl.getBoundingClientRect();
  const hostRect = host.getBoundingClientRect();
  const cx = rect.left - hostRect.left + rect.width / 2;
  const cy = rect.top - hostRect.top + rect.height / 2;
  const COUNT = 6;
  for (let i = 0; i < COUNT; i++) {
    const s = document.createElement('div');
    s.className = 'name-spark';
    const ang = (Math.PI * 2 * i) / COUNT + Math.random() * 0.5;
    const dist = 26 + Math.random() * 26;
    s.style.left = cx + 'px';
    s.style.top = cy + 'px';
    s.style.setProperty('--sx', Math.cos(ang) * dist + 'px');
    s.style.setProperty('--sy', Math.sin(ang) * dist + 'px');
    s.style.animationDelay = (Math.random() * 120) + 'ms';
    host.appendChild(s);
    setTimeout(() => s.remove(), 1200);
  }
}

function showKeyboardPreview() {
  const level = getLevelData();
  $('kbp-title').textContent = level.name;
  $('kbp-subtitle').textContent = 'KNOW YOUR KEYS';
  applyLevelTheme(state.level);
  KeyboardPreview.start(level.keys, level.newKeys, level.hint);
  showScreen('keyboard-preview', state);
}

function startGame() {
  // Force a fresh shuffle for each new free-play session, even on a level
  // the player has already played free-play on.
  freePlayLevelCache = null;
  freePlayLevelCacheFor = null;
  const level = getLevelData();
  state.currentPattern = 0;
  state.currentIndex = 0;
  state.patternsCompleted = 0;

  // Decide the Name Moment BEFORE building patterns, so buildPatterns knows
  // whether this is the guaranteed-moment level (nameMomentWord set → it does
  // NOT also add a low-frequency visitor) or a later level (nameMomentWord
  // null → it may add one). The guaranteed word is spliced in below, after
  // the card, so both are reachable.
  state.nameMomentWord = null;
  state.nameMomentDone = false;
  if (!state.freePlay) {
    const momentWord = nameWordForLevel(state.playerName, state.level);
    // Only the once-ever golden moment guarantees an injection. If it already
    // fired (this or a past session), this level's word is treated like any
    // other already-spellable name-word: low-frequency, not guaranteed.
    if (momentWord && !nameMomentFired(state.playerName)) {
      state.nameMomentWord = momentWord;
    }
  }

  state.patterns = buildPatterns(level);

  if (state.level === 24 && !state.freePlay) {
    const namePattern = buildPlayerNamePattern(state.playerName);
    if (namePattern.length) {
      // Once as the final intro-adjacent pattern (right after the intro drills)...
      state.patterns.splice(level.intro.length, 0, namePattern);
      // ...and once again mid-list, among the shuffled pool.
      const midpoint = Math.floor(state.patterns.length / 2);
      state.patterns.splice(midpoint, 0, namePattern);
    }
  }

  // History card word: pick the ONE guaranteed card for this play (a level may
  // now hide a pool of several — pickGuaranteedCard prefers one not yet
  // collected in the active slot, rotating for variety), then splice its moment
  // word into the pattern list right after the intro drills. Guaranteeing
  // exactly one card word per play preserves the win-gate invariant every
  // winability proof rests on; which card it is just varies across replays,
  // driving the Skulltula-style collection loop.
  state.cardWordTyped = false;
  state.currentCard = null;
  if (!state.freePlay) {
    const chosen = pickGuaranteedCard(
      state.level, Slots.collectedIds(), Slots.getCardRotation(state.level));
    if (chosen) {
      state.currentCard = chosen;
      // Advance this slot's per-level rotation so the NEXT visit surfaces a
      // different card (mirrors the Act-6 riddle `_ri` "different each time").
      Slots.bumpCardRotation(state.level);
    }
  }
  const card = state.currentCard;
  if (card) {
    // Inject right after the intro drills — before the earliest possible
    // level-win — so the moment word is always reached in real play. The
    // completion gate also waits for it (cards are earned, never missable).
    const cardTokens = wordToTokens(card.word);
    state.patterns.splice(level.intro.length, 0, cardTokens);
  }

  // ── Name Moment guaranteed injection ──
  // Independent of the card gate above (decided earlier as state.nameMomentWord).
  // On the FIRST level where a name-word becomes spellable, splice that word
  // (lowercase, one token per letter) as a GUARANTEED pattern right after the
  // intro drills — AND after the card word (if any), so neither displaces the
  // other and both are always reached before the win-gate. The win-gate also
  // waits on it (namePending in handleGameKey) — the moment is earned, never
  // missable, exactly like a card. Later levels don't inject here; the name
  // instead joins the pool at low frequency inside buildPatterns above.
  if (state.nameMomentWord) {
    const insertAt = level.intro.length + (card ? 1 : 0);
    state.patterns.splice(insertAt, 0, state.nameMomentWord.split(''));
  }

  state.totalCorrect = 0;
  state.totalAttempts = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.mistakes = {};
  level.keys.forEach(k => state.mistakes[k] = 0);
  state.wrongOnCurrent = false;
  state.startTime = Date.now();

  // Wordgen: warm the NEXT level's generated batch while this one plays —
  // fire-and-forget; gameplay never waits on generation (no-op when inactive).
  // The request declares the next level's key set (act/level/characters);
  // level 25 has no next, so the prefetch is skipped silently.
  if (!state.freePlay) {
    const nextLevel = LEVELS[state.level + 1];
    if (nextLevel && Array.isArray(nextLevel.keys)) {
      wordgenPrefetch(state.level + 1, nextLevel.keys);
    }
  }

  // SURVIVAL: reset the wrapper state fresh for every game start (including
  // "TRY AGAIN" from the Game Over overlay). Free play + survival coexist —
  // the timer just runs on sentences instead of drill patterns.
  stopSurvivalTimer();
  state.survival.active = settings.playStyle === 'survival';
  state.survival.quartersTotal = settings.lives;
  state.survival.quartersRemaining = settings.lives;
  state.survival.survivalStreak = 0;
  state.survival.patternDeadline = null;
  state.survival.remainingAtPause = null;
  state.survival.lettersTyped = 0;
  $('hud-quarters-line').classList.toggle('hidden', !state.survival.active);
  $('survival-timer-track').classList.toggle('hidden', !state.survival.active);
  $('hud-bonus').classList.add('hidden');
  $('gameover-overlay').classList.add('hidden');
  if (state.survival.active) renderQuarters(state.survival.quartersRemaining, state.survival.quartersTotal);

  applyLevelTheme(state.level);
  $('level-badge-text').textContent = level.name;
  $('hud-name').textContent = state.playerName;
  $('hud-wpm-line').classList.toggle('hidden', !state.freePlay);
  updateHUD(state, settings);
  showScreen('game', state);
  $('game-screen').querySelector('.game-area').classList.remove('hidden');
  $('game-screen').querySelector('.hud').classList.remove('hidden');
  const firstPattern = getNextPattern();
  renderPrompt(state, level, firstPattern);
  startSurvivalPatternTimer(firstPattern);

  stopAll();
  const theme = activeTheme(state.level);
  if (theme) theme.start();
}

// ─── Continue screen (returning player) ──────────────────────────────────

// ─── Slot picker ("CHOOSE YOUR GAME") — the returning-player front door ────
// Replaces the old single continue screen. Each family member keeps her own
// saved game; the picker shows every slot's name, level, and cards-found count,
// and is the one place games are resumed, started, erased, or browsed.

function showSlotsScreen() {
  state.selectBypass = false;
  state.freePlay = false;
  state.slotsEraseConfirm = false;
  if (typeof state.slotsSelected !== 'number') state.slotsSelected = 0;
  applyLevelTheme(1); // arcade-era chrome, like the title
  renderSlotsScreen(state, Slots.listSlots());
  showScreen('slots', state);
}

// Route into name entry to CREATE a brand-new game. The name-entry confirm
// handler appends the new game (state.pendingNewGame). No slot index — games are
// an unlimited, growable list (Trevor: no reason to cap a family's members).
function startNewGameFlow() {
  state.pendingNewGame = true;
  state.level = 1;
  state.selectBypass = false;
  state.freePlay = false;
  state.coinInserted = true; // straight to name entry, past INSERT COIN
  applyLevelTheme(1);
  showScreen('title', state);
  $('insert-coin').classList.add('hidden');
  $('reboot-hint').classList.add('hidden');
  $('settings-hint').classList.add('hidden');
  $('name-setup').classList.remove('hidden');
  $('wopr-text').textContent = '';
  $('player-name-input').value = ''; // a fresh name for a fresh game
  Audio.coin();
  setTimeout(() => {
    $('player-name-input').focus();
    $('player-name-input').select();
  }, 0);
}

// The collection gallery for a given slot — found cards revealed, still-locked
// cards shown as "???" silhouettes to tease replay. Read-only; opening it never
// changes which game is active.
function showCollectionScreen(slotIndex) {
  state.collectionForSlot = slotIndex;
  const collected = new Set(Slots.slotCards(slotIndex));
  renderCollectionScreen(state, allCards(), collected);
  showScreen('collection', state);
}

// ─── Settings screen ────────────────────────────────────────────────────

function renderSettingsScreen() {
  const rows = getRows();
  const container = $('settings-rows');
  container.innerHTML = rows.map((row, i) => {
    const active = row.active(settings);
    const selected = i === state.settingsSelectedRow;
    const value = row.action ? '' : row.display(settings[row.key]);
    const descriptor = row.action ? row.descriptor() : row.descriptor(settings[row.key]);
    const cls = ['settings-row', selected ? 'selected' : '', active ? '' : 'inactive'].filter(Boolean).join(' ');
    return `
      <div class="${cls}">
        <span class="settings-row-cursor">&gt;</span>
        <span class="settings-row-label">${row.label}</span>
        <span class="settings-row-value">${row.action ? (selected ? 'PRESS RETURN' : '') : value}</span>
        ${descriptor ? `<span class="settings-row-descriptor">${descriptor}</span>` : ''}
      </div>`;
  }).join('');
}

function openSettings(returnTo) {
  state.settingsReturn = returnTo;
  state.settingsSelectedRow = 0;
  state.settingsEraseConfirm = false;
  $('settings-erase-confirm').classList.add('hidden');
  renderSettingsScreen();
  showScreen('settings', state);
}

function closeSettings() {
  const returnTo = state.settingsReturn;
  if (returnTo === 'pause') {
    showScreen('game', state);
    state.paused = true;
    $('pause-overlay').classList.remove('hidden');
  } else {
    showScreen('title', state);
  }
}

function handleSettingsKey(e) {
  e.preventDefault();
  const rows = getRows();

  if (state.settingsEraseConfirm) {
    if (e.key === 'y' || e.key === 'Y') {
      // Unified with the continue screen's R→Y path: erase gameplay progress
      // (kk-progress + kk-cards) but KEEP the player's name and preferences
      // (kk-settings). Reloading re-boots into the fresh title/name flow —
      // and because kk-settings survives, the name is still there.
      eraseProgress();
      location.reload();
    } else {
      // N or ANY other key is a safe no-op — never trap the player in the
      // confirmation.
      state.settingsEraseConfirm = false;
      $('settings-erase-confirm').classList.add('hidden');
    }
    return;
  }

  if (e.key === 'ArrowUp') {
    state.settingsSelectedRow = (state.settingsSelectedRow - 1 + rows.length) % rows.length;
    renderSettingsScreen();
  } else if (e.key === 'ArrowDown') {
    state.settingsSelectedRow = (state.settingsSelectedRow + 1) % rows.length;
    renderSettingsScreen();
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    const row = rows[state.settingsSelectedRow];
    if (row.action) return;
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    Object.assign(settings, applyRowChange(settings, state.settingsSelectedRow, dir));
    Audio.setEnabled(settings.sound);
    document.documentElement.classList.toggle('no-crt', !settings.crtEffects);
    renderSettingsScreen();
  } else if (e.key === 'Enter' || e.key === ' ') {
    const row = rows[state.settingsSelectedRow];
    if (row.action && row.key === 'erase') {
      state.settingsEraseConfirm = true;
      $('settings-erase-confirm').classList.remove('hidden');
    }
  } else if (e.key === 'Escape' || e.key === 'Tab') {
    saveSettings(settings);
    closeSettings();
  }
}

// ─── Act 6 — Text Worlds: the back-wall door entry/exit ─────────────────────
// Entered from the select screen's door sub-state (state.doorFocused). Runs as a
// parallel screen ('textworld') on the shared canvas, like the act cinematics —
// the pattern engine (handleGameKey) is never involved. No survival timer is ever
// started here, so the wing inherits zero time pressure (One Rule).
function enterTextWorld() {
  stopAll();
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  state.screen = 'textworld';
  TextWorldHub.start({
    onExit: returnToArcadeFromTextWorld,           // ESC from the chooser → arcade door
    onComplete: (id) => recordTextWorldComplete(id), // a world finished → persist it
  });
}

function returnToArcadeFromTextWorld() {
  TextWorldHub.stop();
  state.doorFocused = true;   // land back on the door we came through
  showScreen('select', state);
  renderSelectScreen(state);
}

document.addEventListener('keydown', (e) => {
  switch (state.screen) {
    case 'slots': {
      // Slot picker ("CHOOSE YOUR GAME") — the returning-player front door.
      // Rows = one per saved game + a trailing "＋ NEW GAME" row (index == count).
      // Navigate ↑/↓ (or number keys for the first nine games); Space/Enter
      // resumes a game or, on the NEW GAME row, starts one; N = new game; X =
      // erase highlighted game (Y/N confirm); C = browse its cards; Escape → attract.
      e.preventDefault();
      const slots = Slots.listSlots();
      const rows = slots.length + 1;          // +1 for the NEW GAME row
      const newRow = slots.length;            // index of the NEW GAME row
      let sel = state.slotsSelected;
      if (sel >= rows) sel = state.slotsSelected = rows - 1; // clamp after an erase

      if (state.slotsEraseConfirm) {
        // Only Y erases; N or ANY other key backs out — never trap the child.
        if ((e.key === 'y' || e.key === 'Y') && sel < slots.length) Slots.eraseSlot(sel);
        state.slotsEraseConfirm = false;
        const after = Slots.listSlots();
        if (state.slotsSelected > after.length) state.slotsSelected = after.length;
        renderSlotsScreen(state, after);
        break;
      }

      if (e.key === 'ArrowUp') {
        state.slotsSelected = (sel - 1 + rows) % rows;
        renderSlotsScreen(state, slots);
      } else if (e.key === 'ArrowDown') {
        state.slotsSelected = (sel + 1) % rows;
        renderSlotsScreen(state, slots);
      } else if (e.key >= '1' && e.key <= '9' && parseInt(e.key, 10) <= slots.length) {
        state.slotsSelected = parseInt(e.key, 10) - 1;
        renderSlotsScreen(state, slots);
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (sel < slots.length) {
          // Resume this saved game.
          Slots.setActive(sel);
          const p = getProgress();
          state.playerName = slots[sel].name;
          state.maxUnlockedLevel = p.furthestLevel;
          state.level = p.furthestLevel;
          Object.assign(settings, saveSettings({ ...settings, playerName: state.playerName }));
          Audio.start();
          $('ready-name').textContent = state.playerName;
          renderReadyScreenWithSurvivalTag();
          applyLevelTheme(state.level);
          showScreen('ready', state);
        } else {
          startNewGameFlow(); // the NEW GAME row
        }
      } else if (e.key === 'n' || e.key === 'N') {
        startNewGameFlow();
      } else if (e.key === 'x' || e.key === 'X') {
        if (sel < slots.length) {
          state.slotsEraseConfirm = true;
          renderSlotsScreen(state, slots);
        }
      } else if (e.key === 'c' || e.key === 'C') {
        if (sel < slots.length) showCollectionScreen(sel);
      } else if (e.key === 'Escape') {
        // Back to the attract title (settings via Tab, WOPR phrases, etc.).
        applyLevelTheme(1);
        state.coinInserted = false;
        showScreen('title', state);
        $('insert-coin').classList.remove('hidden');
        $('reboot-hint').classList.remove('hidden');
        $('settings-hint').classList.remove('hidden');
        $('name-setup').classList.add('hidden');
        $('wopr-text').textContent = '';
      }
      break;
    }

    case 'collection':
      // Read-only card gallery. Any of Escape/Space/Enter returns to the picker.
      e.preventDefault();
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        showSlotsScreen();
      }
      break;

    case 'title':
      if (e.key === 'Tab') {
        // Tab is unused elsewhere on the title screen and — unlike 's' —
        // can never collide with a secret phrase's first letter, so it's
        // safe to bind unconditionally, even mid-typed-phrase.
        e.preventDefault();
        openSettings('title');
        break;
      }
      if (!state.coinInserted) {
        if (trackKonami(e.key)) {
          e.preventDefault();
          break;
        }
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          state.coinInserted = true;
          secretBuffer = '';
          $('wopr-text').textContent = '';
          Audio.coin();
          $('insert-coin').classList.add('hidden');
          $('reboot-hint').classList.add('hidden');
          $('settings-hint').classList.add('hidden');
          $('name-setup').classList.remove('hidden');
          // Prefill from settings.playerName, then select it so the first
          // typed character natively overwrites the whole default (dimmed
          // "ready to be overwritten" behavior — onboarding.md §Name Entry).
          // Backspace clears the selection normally; an empty confirm keeps it.
          $('player-name-input').value = settings.playerName || '';
          $('player-name-input').focus();
          $('player-name-input').select();
        } else if (e.key === 'r' && secretBuffer === '') {
          e.preventDefault();
          location.reload();
        } else if (e.key === 'Backspace') {
          secretBuffer = secretBuffer.slice(0, -1);
          $('wopr-text').textContent = secretBuffer;
        } else if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
          secretBuffer += e.key.toLowerCase();
          $('wopr-text').textContent = secretBuffer;
          if (SECRET_PHRASES.includes(secretBuffer)) {
            e.preventDefault();
            secretBuffer = '';
            $('wopr-text').textContent = '';
            Audio.start();
            // Secret WarGames card into the active game's collection (no-op if
            // no game is active yet — the dev bypass before a slot is chosen).
            Slots.collectCardId(WARGAMES_CARD_ID);
            // WOPR is the dev/parent bypass: every cabinet is selectable,
            // regardless of saved progress.
            state.selectBypass = true;
            state.selectedLevel = 1;
            renderSelectScreen(state);
            showScreen('select', state);
          } else if (EGGS[secretBuffer]) {
            e.preventDefault();
            showEggResponse(EGGS[secretBuffer]);
          }
        }
      } else {
        if (e.key === 'Enter') {
          e.preventDefault();
          const input = $('player-name-input').value.trim().toUpperCase();
          const name = input || 'PLAYER ONE';
          // Resolve which save this name belongs to:
          //   • a pending NEW GAME (from the slot picker) → append a new game,
          //   • an active game being renamed (Escape-from-ready re-entry) → rename,
          //   • genuine first-time player (no games yet) → create the first game,
          //   • WOPR dev bypass into an existing machine with no active game →
          //     ephemeral: set the name only, persist nothing.
          if (state.pendingNewGame) {
            Slots.createSlot(name);
            state.pendingNewGame = false;
          } else if (Slots.getActive() !== null) {
            Slots.setActiveName(name);
          } else if (!Slots.anySlotExists()) {
            Slots.createSlot(name);
          }
          state.playerName = name;
          Object.assign(settings, saveSettings({ ...settings, playerName: name }));
          // Seed the select-screen gate from the (now) active game.
          state.maxUnlockedLevel = getProgress().furthestLevel;
          $('ready-name').textContent = state.playerName;
          renderReadyScreenWithSurvivalTag();
          applyLevelTheme(state.level);
          Audio.start();
          showScreen('ready', state);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          state.coinInserted = false;
          state.level = 1;
          $('name-setup').classList.add('hidden');
          $('insert-coin').classList.remove('hidden');
          $('reboot-hint').classList.remove('hidden');
          $('settings-hint').classList.remove('hidden');
        }
      }
      break;

    case 'ready':
      if (e.key === ' ') {
        e.preventDefault();
        Audio.start();
        if (state.freePlay) {
          startGame();
        } else {
          showKeyboardPreview();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        applyLevelTheme(1);
        showScreen('title', state);
        state.coinInserted = true;
        $('insert-coin').classList.add('hidden');
        $('name-setup').classList.remove('hidden');
        $('player-name-input').focus();
        $('player-name-input').select(); // ready to be overwritten (see title-branch)
      } else if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
        secretBuffer += e.key.toLowerCase();
        if (SECRET_PHRASES.includes(secretBuffer)) {
          e.preventDefault();
          secretBuffer = '';
          Audio.start();
          Slots.collectCardId(WARGAMES_CARD_ID); // secret WarGames card
          state.selectBypass = true; // WOPR dev/parent bypass — unlock all cabinets
          state.selectedLevel = 1;
          renderSelectScreen(state);
          showScreen('select', state);
        } else if (!SECRET_PHRASES.some(p => p.startsWith(secretBuffer))) {
          secretBuffer = '';
        }
      }
      break;

    case 'keyboard-preview':
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        KeyboardPreview.stop();
        Audio.start();
        startGame();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        KeyboardPreview.stop();
        showScreen('ready', state);
      }
      break;

    case 'game':
      if (state.paused) {
        e.preventDefault();
        if (e.key === 'Escape') {
          state.paused = false;
          $('pause-overlay').classList.add('hidden');
          resumeSurvivalTimer();
        } else if (e.key === 'Tab') {
          openSettings('pause');
        } else if (e.key === 'q' || e.key === 'Q') {
          state.paused = false;
          $('pause-overlay').classList.add('hidden');
          stopSurvivalTimer();
          stopAll();
          applyLevelTheme(1);
          state.level = 1;
          state.coinInserted = false;
          state.freePlay = false;
          showScreen('title', state);
          $('insert-coin').classList.remove('hidden');
          $('reboot-hint').classList.remove('hidden');
          $('settings-hint').classList.remove('hidden');
          $('name-setup').classList.add('hidden');
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        state.paused = true;
        pauseSurvivalTimer();
        $('pause-overlay').classList.remove('hidden');
      } else {
        handleGameKey(e);
      }
      break;

    case 'gameover':
      e.preventDefault();
      if (e.key === ' ') {
        $('gameover-overlay').classList.add('hidden');
        startGame();
      } else if (e.key === 'Escape') {
        $('gameover-overlay').classList.add('hidden');
        stopAll();
        state.selectedLevel = state.level;
        renderSelectScreen(state);
        showScreen('select', state);
      }
      break;

    case 'settings':
      handleSettingsKey(e);
      break;

    case 'victory':
      e.preventDefault();
      clearTimeout(state.victoryTimer);
      state.screen = 'complete';
      $('complete-overlay').classList.remove('hidden');
      break;

    case 'complete':
      if (e.key === 'r' || e.key === 'R') {
        // REPLAY: restart THIS level fresh — same flow as entering it from the
        // select screen. Offered only here, at the natural pause point (after
        // the history card has been presented), never interrupting flow.
        // startGame() rebuilds patterns, resets the HUD/survival state, resets
        // the card gate AND re-injects the level's moment word, so a replayed
        // level whose card was already collected is still completable (the card
        // just isn't re-awarded — collectCard is collect-once). kk-progress is
        // untouched, so replaying never regresses furthestLevel.
        e.preventDefault();
        $('complete-overlay').classList.add('hidden');
        stopAll();
        startGame();
        break;
      }
      if (e.key === ' ') {
        e.preventDefault();
        $('complete-overlay').classList.add('hidden');
        stopAll();
        if (state.freePlay) {
          // Free play never triggers act cinematics or level advancement —
          // it always returns to the arcade so the player can hop cabinets.
          state.selectedLevel = state.level;
          renderSelectScreen(state);
          showScreen('select', state);
        } else if (state.level === 5) {
          // Mystery cabinet cinematic before entering Act 2
          document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
          state.screen = 'mystery';
          applyLevelTheme(1);
          Mystery.start(() => {
            state.level = 6;
            renderReadyScreenWithSurvivalTag();
            applyLevelTheme(state.level);
            showScreen('ready', state);
          });
        } else if (state.level === 10) {
          // Basement cinematic before entering Act 3
          document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
          state.screen = 'basement';
          applyLevelTheme(10); // Computer Wing palette stays during cinematic
          Basement.start(() => {
            state.level = 11;
            renderReadyScreenWithSurvivalTag();
            applyLevelTheme(state.level);
            showScreen('ready', state);
          });
        } else if (state.level === 15) {
          // Command Center cinematic before entering Act 4
          document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
          state.screen = 'commandcenter';
          applyLevelTheme(15); // Basement palette stays during cinematic
          CommandCenter.start(() => {
            state.level = 16;
            renderReadyScreenWithSurvivalTag();
            applyLevelTheme(state.level);
            showScreen('ready', state);
          });
        } else if (state.level === 20) {
          // Full Circle cinematic before entering Act 5
          document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
          state.screen = 'fullcircle';
          applyLevelTheme(20); // Command Center palette stays during cinematic
          FullCircle.start(() => {
            state.level = 21;
            renderReadyScreenWithSurvivalTag();
            applyLevelTheme(state.level);
            showScreen('ready', state);
          });
        } else if (LEVELS[state.level + 1]) {
          state.level++;
          renderReadyScreenWithSurvivalTag();
          applyLevelTheme(state.level);
          showScreen('ready', state);
        } else {
          applyLevelTheme(1);
          state.level = 1;
          state.coinInserted = false;
          showScreen('title', state);
          $('insert-coin').classList.remove('hidden');
          $('reboot-hint').classList.remove('hidden');
          $('settings-hint').classList.remove('hidden');
          $('name-setup').classList.add('hidden');
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        $('complete-overlay').classList.add('hidden');
        stopAll();
        renderReadyScreenWithSurvivalTag();
        showScreen('ready', state);
      }
      break;

    case 'mystery':
      e.preventDefault();
      Mystery.confirm();
      break;

    case 'basement':
      e.preventDefault();
      Basement.confirm();
      break;

    case 'commandcenter':
      e.preventDefault();
      CommandCenter.confirm();
      break;

    case 'fullcircle':
      e.preventDefault();
      FullCircle.confirm();
      break;

    case 'textworld':
      // Act 6 Text Worlds. The hub owns Escape internally (world → chooser →
      // arcade); every other key is world input.
      e.preventDefault();
      TextWorldHub.handleKey(e);
      break;

    case 'select':
      e.preventDefault();
      if (e.key === 'f' || e.key === 'F') {
        if (state.doorFocused) break; // free play doesn't apply at the door
        state.freePlay = !state.freePlay;
        renderSelectScreen(state);
      } else if (e.key >= '1' && e.key <= '5') {
        selectByPosition(state, parseInt(e.key));
      } else if (e.key === 'ArrowLeft') {
        navigateWithinAct(state, -1);
      } else if (e.key === 'ArrowRight') {
        navigateWithinAct(state, 1);
      } else if (e.key === 'ArrowUp') {
        navigateAct(state, -1);
      } else if (e.key === 'ArrowDown') {
        navigateAct(state, 1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (state.doorFocused) { enterTextWorld(); break; }
        // Guard: never enter a locked cabinet (belt-and-suspenders — the
        // cursor can't normally land on one, but the WOPR bypass or a stale
        // selection shouldn't slip a locked level through).
        if (isLevelLocked(state, state.selectedLevel)) break;
        state.level = state.selectedLevel;
        state.coinInserted = true;
        showScreen('title', state);
        $('insert-coin').classList.add('hidden');
        $('name-setup').classList.remove('hidden');
        $('player-name-input').value = settings.playerName || '';
        setTimeout(() => {
          $('player-name-input').focus();
          $('player-name-input').select(); // ready to be overwritten (see title-branch)
        }, 0);
      } else if (e.key === 'Escape') {
        state.freePlay = false;
        state.doorFocused = false;   // leaving the select screen clears the door sub-state
        showScreen('title', state);
      }
      break;
  }
});

// Mac keyboards label the key "Return" not "Enter"
const enterLabel = /Mac/.test(navigator.platform || navigator.userAgent) ? 'RETURN' : 'ENTER';
document.querySelectorAll('[data-enter-key]').forEach(el => { el.textContent = enterLabel; });

createStars();

// ─── Boot: returning player vs first-time player ─────────────────────────
// First fold any pre-slots single save into Slot 1 (idempotent migration), so a
// returning child never loses her game. Then: if ANY saved game exists, the
// slot picker ("CHOOSE YOUR GAME") is the front door. A brand-new machine (no
// slots) falls through to the untouched cold-open title/name flow, which creates
// Slot 1 on the first name confirm.
(function boot() {
  Slots.ensureMigrated(settings.playerName);
  // One-time wordgen health probe — fire-and-forget, never awaited; on static
  // hosting this fails fast once and wordgen stays silently dormant.
  initWordgen();
  if (Slots.anySlotExists()) {
    showSlotsScreen();
  }
})();

// For the curious human who just opened the console:
// that instinct — looking under the hood — is the whole point of this game.
console.log(
  '%cGREETINGS PROFESSOR FALKEN.\n\n' +
  'SHALL WE PLAY A GAME?\n\n' +
  '> THE TITLE SCREEN LISTENS FOR OLD MAGIC:\n' +
  '>   A CAVE WORD FROM 1976.\n' +
  '>   A DOOM CHEAT THAT WON\'T WORK (WE DON\'T DO LIVES).\n' +
  '>   THE 1979 GAME THAT HID THE FIRST EASTER EGG.\n' +
  '>   THE FIRST CHATBOT, BY NAME.\n' +
  '>   AND: UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A\n',
  'color:#39ff14;background:#000;font-family:monospace;font-size:12px;line-height:1.7;padding:12px;'
);
