import * as Audio from './audio.js';
import { LEVELS, FINGER_MAP } from './levels.js';
import { updateHUD, showFingerHint, displayKey, renderKeyboard, renderPrompt } from './ui/hud.js';
import { showScreen, applyLevelTheme, renderReadyScreen, createStars } from './ui/screens.js';
import { renderSelectScreen, updateSelectHighlight } from './ui/cabinet-art.js';
import { Themes, activeTheme, stopAll } from './themes/index.js';

const $ = (id) => document.getElementById(id);

const SECRET_PHRASES = ['shallweplayagame', 'wopr', 'wargames'];
let secretBuffer = '';

const state = {
  screen: 'title',
  playerName: 'PLAYER ONE',
  coinInserted: false,
  level: 1,
  selectedLevel: 1,
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
  patterns: []
};

function getLevelData() {
  return LEVELS[state.level];
}

function buildPatterns(level) {
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

function handleGameKey(e) {
  if (state.screen !== 'game') return;
  const key = e.key.toLowerCase();

  if (key === 'tab' || key === 'escape') return;
  e.preventDefault();

  if (!key.match(/^[a-z;]$/)) return;

  const level = getLevelData();
  const pattern = getNextPattern();
  const expected = pattern[state.currentIndex];

  if (key === expected) {
    state.totalCorrect++;
    state.totalAttempts++;
    state.streak++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;
    state.wrongOnCurrent = false;

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
      state.currentPattern++;
      state.patternsCompleted++;
      state.currentIndex = 0;

      const pTheme = activeTheme(state.level);
      let themeComplete = false;
      if (pTheme && pTheme.patternComplete) {
        themeComplete = pTheme.patternComplete();
      }

      // Level ends when theme game is won AND intro patterns completed
      const minPatterns = level.intro.length;
      if (themeComplete && state.patternsCompleted >= minPatterns) {
        setTimeout(showLevelComplete, 400);
        return;
      }

      setTimeout(() => renderPrompt(state, level, getNextPattern()), 300);
    } else {
      setTimeout(() => {
        const nextEl = document.querySelector(`.prompt-letter[data-index="${state.currentIndex}"]`);
        if (nextEl) nextEl.classList.add('active');
        renderKeyboard(level, pattern[state.currentIndex], null, state);
      }, 150);
    }

    updateHUD(state);
  } else {
    if (!state.wrongOnCurrent) {
      state.totalAttempts++;
      state.wrongOnCurrent = true;
    }
    state.mistakes[expected] = (state.mistakes[expected] || 0) + 1;
    state.streak = 0;

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
    showFingerHint(expected);
    updateHUD(state);

    setTimeout(() => {
      if (el) el.classList.remove('wrong');
      renderKeyboard(level, expected, null, state);
    }, 300);
  }
}

function showLevelComplete() {
  const elapsed = Date.now() - state.startTime;
  const acc = state.totalAttempts > 0
    ? Math.round((state.totalCorrect / state.totalAttempts) * 100)
    : 100;
  const level = getLevelData();

  $('final-time').textContent = formatTime(elapsed);
  $('final-accuracy').textContent = acc + '%';
  $('final-streak').textContent = state.bestStreak;
  $('final-keys').textContent = level.keys.map(k => displayKey(k)).join(' ');

  if (state.level === 4) {
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

function startGame() {
  const level = getLevelData();
  state.currentPattern = 0;
  state.currentIndex = 0;
  state.patternsCompleted = 0;
  state.patterns = buildPatterns(level);
  state.totalCorrect = 0;
  state.totalAttempts = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.mistakes = {};
  level.keys.forEach(k => state.mistakes[k] = 0);
  state.wrongOnCurrent = false;
  state.startTime = Date.now();

  applyLevelTheme(state.level);
  $('level-badge-text').textContent = level.name;
  $('hud-name').textContent = state.playerName;
  updateHUD(state);
  showScreen('game', state);
  $('game-screen').querySelector('.game-area').classList.remove('hidden');
  $('game-screen').querySelector('.hud').classList.remove('hidden');
  renderPrompt(state, level, getNextPattern());

  stopAll();
  const theme = activeTheme(state.level);
  if (theme) theme.start();
}

document.addEventListener('keydown', (e) => {
  switch (state.screen) {
    case 'title':
      if (!state.coinInserted) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          state.coinInserted = true;
          secretBuffer = '';
          $('wopr-text').textContent = '';
          Audio.coin();
          $('insert-coin').classList.add('hidden');
          $('reboot-hint').classList.add('hidden');
          $('name-setup').classList.remove('hidden');
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
          }
        }
      } else {
        if (e.key === 'Enter') {
          e.preventDefault();
          const input = $('player-name-input').value.trim().toUpperCase();
          state.playerName = input || 'PLAYER ONE';
          $('ready-name').textContent = state.playerName;
          renderReadyScreen(state, getLevelData());
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
        }
      }
      break;

    case 'ready':
      if (e.key === ' ') {
        e.preventDefault();
        Audio.start();
        startGame();
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

    case 'game':
      if (state.paused) {
        e.preventDefault();
        if (e.key === 'Escape') {
          state.paused = false;
          $('pause-overlay').classList.add('hidden');
        } else if (e.key === 'q' || e.key === 'Q') {
          state.paused = false;
          $('pause-overlay').classList.add('hidden');
          stopAll();
          applyLevelTheme(1);
          state.level = 1;
          state.coinInserted = false;
          showScreen('title', state);
          $('insert-coin').classList.remove('hidden');
          $('reboot-hint').classList.remove('hidden');
          $('name-setup').classList.add('hidden');
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        state.paused = true;
        $('pause-overlay').classList.remove('hidden');
      } else {
        handleGameKey(e);
      }
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
        if (LEVELS[state.level + 1]) {
          state.level++;
          renderReadyScreen(state, getLevelData());
          applyLevelTheme(state.level);
          showScreen('ready', state);
        } else {
          applyLevelTheme(1);
          state.level = 1;
          state.coinInserted = false;
          showScreen('title', state);
          $('insert-coin').classList.remove('hidden');
          $('reboot-hint').classList.remove('hidden');
          $('name-setup').classList.add('hidden');
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        $('complete-overlay').classList.add('hidden');
        stopAll();
        renderReadyScreen(state, getLevelData());
        showScreen('ready', state);
      }
      break;

    case 'select':
      e.preventDefault();
      if (e.key >= '1' && e.key <= '4') {
        state.selectedLevel = parseInt(e.key);
        updateSelectHighlight(state);
      } else if (e.key === 'ArrowLeft') {
        state.selectedLevel = Math.max(1, state.selectedLevel - 1);
        updateSelectHighlight(state);
      } else if (e.key === 'ArrowRight') {
        state.selectedLevel = Math.min(4, state.selectedLevel + 1);
        updateSelectHighlight(state);
      } else if (e.key === 'Enter' || e.key === ' ') {
        state.level = state.selectedLevel;
        state.coinInserted = true;
        showScreen('title', state);
        $('insert-coin').classList.add('hidden');
        $('name-setup').classList.remove('hidden');
        setTimeout(() => $('player-name-input').focus(), 0);
      } else if (e.key === 'Escape') {
        showScreen('title', state);
      }
      break;
  }
});

createStars();
