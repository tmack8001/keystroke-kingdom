import * as Audio from './audio.js';
import { LEVELS, FINGER_MAP } from './levels.js';
import { updateHUD, showFingerHint, displayKey, renderKeyboard, renderPrompt, computeWPM, renderQuarters, flashBonusQuarter } from './ui/hud.js';
import { showScreen, applyLevelTheme, renderReadyScreen, createStars } from './ui/screens.js';
import { renderSelectScreen, updateSelectHighlight, navigateAct, navigateWithinAct, selectByPosition } from './ui/cabinet-art.js';
import { Themes, activeTheme, stopAll } from './themes/index.js';
import * as KeyboardPreview from './ui/keyboard-preview.js';
import * as Mystery from './mystery.js';
import * as Basement from './basement.js';
import * as CommandCenter from './commandcenter.js';
import * as FullCircle from './fullcircle.js';
import { FREEPLAY_KEYS, buildFreePlayPatterns } from './freeplay.js';
import { HISTORY_CARDS, TOTAL_CARDS, wordToTokens, patternMatchesCard, collectCard, collectedCount } from './history-cards.js';
import { getSettings, saveSettings, getRows, applyRowChange, DIFFICULTY_MULTIPLIER } from './settings.js';

const $ = (id) => document.getElementById(id);

const SECRET_PHRASES = ['shallweplayagame', 'wopr', 'wargames'];
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

function buildPatterns(level) {
  if (state.freePlay) {
    // Already shuffled (themed first, then shared) by buildFreePlayPatterns.
    return [...level.pool];
  }
  const shuffled = [...level.pool].sort(() => Math.random() - 0.5);
  return [...level.intro, ...shuffled];
}

function getNextPattern() {
  const level = getLevelData();
  if (state.currentPattern < state.patterns.length) {
    return state.patterns[state.currentPattern];
  }
  // Past the initial sequence — keep drawing randomly from pool
  return level.pool[Math.floor(Math.random() * level.pool.length)];
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
  state.patterns[state.currentPattern] = level.pool[Math.floor(Math.random() * level.pool.length)];
  renderPrompt(state, level, getNextPattern());
  startSurvivalPatternTimer(getNextPattern());
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
        const card = HISTORY_CARDS[state.level];
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
      // their intro drills.
      const minPatterns = state.freePlay ? 5 : level.intro.length;
      // If this level hides a history card, the level can't end until its
      // moment word has been typed — the card is earned, never missable.
      const cardPending = !state.freePlay
        && HISTORY_CARDS[state.level]
        && !state.cardWordTyped;
      if (themeComplete && state.patternsCompleted >= minPatterns && !cardPending) {
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
  const card = !state.freePlay ? HISTORY_CARDS[state.level] : null;
  if (card && state.cardWordTyped) {
    const isNew = collectCard(state.level);
    $('history-card-word').textContent = card.word.toUpperCase();
    $('history-card-title').textContent = card.title;
    $('history-card-year').textContent = card.year;
    $('history-card-fact').textContent = card.fact;
    $('history-card-count').textContent = `CARD ${collectedCount()} OF ${TOTAL_CARDS}`;
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

  const theme = activeTheme(state.level);
  if (theme && theme.victory) theme.victory();

  $('game-screen').querySelector('.game-area').classList.add('hidden');
  $('game-screen').querySelector('.hud').classList.add('hidden');

  state.screen = 'victory';
  Audio.levelComplete();

  state.victoryTimer = setTimeout(() => {
    if (state.screen === 'victory') {
      state.screen = 'complete';
      $('complete-overlay').classList.remove('hidden');
    }
  }, 4000);
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

  // History card word: splice this level's "moment word" into the pattern
  // list at a mid-to-late position, guaranteeing it gets typed — same
  // technique as the level-24 name injection above. On level 24 both
  // injections coexist: the name pattern lands near the front/middle, the
  // card word ('Eniac') lands later, so neither displaces the other.
  state.cardWordTyped = false;
  const card = !state.freePlay ? HISTORY_CARDS[state.level] : null;
  if (card) {
    // Inject right after the intro drills — before the earliest possible
    // level-win — so the moment word is always reached in real play. The
    // completion gate also waits for it (cards are earned, never missable).
    const cardTokens = wordToTokens(card.word);
    state.patterns.splice(level.intro.length, 0, cardTokens);
  }

  state.totalCorrect = 0;
  state.totalAttempts = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.mistakes = {};
  level.keys.forEach(k => state.mistakes[k] = 0);
  state.wrongOnCurrent = false;
  state.startTime = Date.now();

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
      try { localStorage.clear(); } catch (err) { /* ignore */ }
      location.reload();
    } else {
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

document.addEventListener('keydown', (e) => {
  switch (state.screen) {
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
          // Prefill from settings.playerName (dimmed placeholder behavior
          // preserved: any keypress clears it and starts typing fresh).
          $('player-name-input').value = settings.playerName || '';
          $('player-name-input').focus();
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
          state.playerName = input || 'PLAYER ONE';
          $('ready-name').textContent = state.playerName;
          Object.assign(settings, saveSettings({ ...settings, playerName: state.playerName }));
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
      } else if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
        secretBuffer += e.key.toLowerCase();
        if (SECRET_PHRASES.includes(secretBuffer)) {
          e.preventDefault();
          secretBuffer = '';
          Audio.start();
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

    case 'select':
      e.preventDefault();
      if (e.key === 'f' || e.key === 'F') {
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
        state.level = state.selectedLevel;
        state.coinInserted = true;
        showScreen('title', state);
        $('insert-coin').classList.add('hidden');
        $('name-setup').classList.remove('hidden');
        setTimeout(() => $('player-name-input').focus(), 0);
      } else if (e.key === 'Escape') {
        state.freePlay = false;
        showScreen('title', state);
      }
      break;
  }
});

// Mac keyboards label the key "Return" not "Enter"
const enterLabel = /Mac/.test(navigator.platform || navigator.userAgent) ? 'RETURN' : 'ENTER';
document.querySelectorAll('[data-enter-key]').forEach(el => { el.textContent = enterLabel; });

createStars();

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
