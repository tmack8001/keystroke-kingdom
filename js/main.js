import * as Audio from './audio.js';
import { LEVELS, FINGER_MAP } from './levels.js';
import { updateHUD, showFingerHint, displayKey, renderKeyboard, renderPrompt } from './ui/hud.js';
import { showScreen, applyLevelTheme, renderReadyScreen, createStars } from './ui/screens.js';
import { renderSelectScreen, updateSelectHighlight, navigateAct, navigateWithinAct, selectByPosition } from './ui/cabinet-art.js';
import { Themes, activeTheme, stopAll } from './themes/index.js';
import * as KeyboardPreview from './ui/keyboard-preview.js';
import * as Mystery from './mystery.js';
import * as Basement from './basement.js';
import * as CommandCenter from './commandcenter.js';
import * as FullCircle from './fullcircle.js';

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

  if (state.level === 25) {
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
  const level = getLevelData();
  state.currentPattern = 0;
  state.currentIndex = 0;
  state.patternsCompleted = 0;
  state.patterns = buildPatterns(level);

  if (state.level === 24) {
    const namePattern = buildPlayerNamePattern(state.playerName);
    if (namePattern.length) {
      // Once as the final intro-adjacent pattern (right after the intro drills)...
      state.patterns.splice(level.intro.length, 0, namePattern);
      // ...and once again mid-list, among the shuffled pool.
      const midpoint = Math.floor(state.patterns.length / 2);
      state.patterns.splice(midpoint, 0, namePattern);
    }
  }

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
        showKeyboardPreview();
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
        if (state.level === 5) {
          // Mystery cabinet cinematic before entering Act 2
          document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
          state.screen = 'mystery';
          applyLevelTheme(1);
          Mystery.start(() => {
            state.level = 6;
            renderReadyScreen(state, getLevelData());
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
            renderReadyScreen(state, getLevelData());
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
            renderReadyScreen(state, getLevelData());
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
            renderReadyScreen(state, getLevelData());
            applyLevelTheme(state.level);
            showScreen('ready', state);
          });
        } else if (LEVELS[state.level + 1]) {
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
      if (e.key >= '1' && e.key <= '5') {
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
