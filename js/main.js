import * as Audio from './audio.js';
import { LEVELS, FINGER_MAP } from './levels.js';
import { updateHUD, showFingerHint, showHomeRowDiagram, displayKey, renderKeyboard, renderPrompt, computeWPM, renderQuarters, flashBonusQuarter } from './ui/hud.js';
import { showScreen, applyLevelTheme, renderReadyScreen, renderSlotsScreen, renderCollectionScreen, collectionShelves, scrollCollection, revealCollection, createStars } from './ui/screens.js';
import { renderSelectScreen, updateSelectHighlight, navigateAct, navigateWithinAct, selectByPosition, isLevelLocked, focusedDoor, focusedWingEntry, focusDoor, clearDoorFocus } from './ui/cabinet-art.js';
import { Themes, activeTheme, stopAll } from './themes/index.js';
import * as KeyboardPreview from './ui/keyboard-preview.js';
import * as Mystery from './mystery.js';
import * as Basement from './basement.js';
import * as CommandCenter from './commandcenter.js';
import * as FullCircle from './fullcircle.js';
import { FREEPLAY_KEYS, buildFreePlayPatterns } from './freeplay.js';
import { TOTAL_CARDS, ACT_CARD_UNLOCK_LEVEL, bankOf, bankProgress, actOfLevel, actCardsUnlocked, pickGuaranteedActCard, wordToTokens, patternMatchesCard, cardsForLevel, cardById, pickGuaranteedCard } from './history-cards.js';
import { assembleCoda, pickKeyboardStory, buildStoryPool } from './keyboard-story.js';
import { prefetchKeyboardStories, takeKeyboardStories } from './keyboard-story-gen.js';
import { addGeneratedStories } from './keyboard-story-cache.js';
import * as Slots from './slots.js';
import { getSettings, saveSettings, getRows, previewRowChange, DIFFICULTY_MULTIPLIER, getWinRatio, getWordLengthRange } from './settings.js';
import { initWordgen, prefetch as wordgenPrefetch, takeWords as wordgenTakeWords } from './wordgen.js';
import * as TextWorldHub from './textworld/hub.js';
import { isBlockedWord } from './word-blocklist.js';

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
  'sudo':      'PERMISSION GRANTED. YOU ALWAYS HAD IT.',         // Unix + xkcd 149, softened for kids
  'allyourbase': 'ALL YOUR KEYS ARE BELONG TO YOU.',             // Zero Wing, 1991 — inverted into our promise
};
// ─── The eighth-key confession (easter-eggs.md proposal #8) ────────────────
// The one hidden line that is NOT summoned by a magic word — it is a REVEAL,
// shown exactly once ever, on the level-complete card the FIRST time this saved
// game finishes Level 20 (the terminal: the level where the computer is finally
// earned). The joke is that the line ENDS with the character without ever naming
// it — the eighth key keeps its in-game anonymity (CLAUDE.md) while the player is
// let in on what programmers call it. It never interrupts flow: the complete
// overlay is a natural pause point, and this is pure decoration on it.
const EIGHTH_KEY_CONFESSION = 'THE EIGHTH KEY HAS A NAME.\nPROGRAMMERS END EVERY LINE WITH IT;';

// ─── The rubber duck (easter-eggs.md proposal #4) ──────────────────────────
// The duck itself is set dressing on the Level 20 terminal cabinet (drawn in
// js/ui/cabinet-art.js). This is its second half: ONCE, from Level 22 onward,
// the first hint the player earns after a wrong keypress carries a quiet extra
// line beneath it. Rubber-duck debugging, handed to someone far enough into the
// arcade to have been genuinely stuck on something.
//
// Two hard constraints, both from easter-eggs.md's design rules:
//   • it never REPLACES the finger hint — the hint is the help, this is only the
//     wink, appended underneath it and never shown on its own;
//   • it never appears UNPROMPTED — it rides on a hint, and hints only ever
//     follow a wrong keypress. The opening finger guide at the very first prompt
//     stays the game's one sanctioned unprompted hint (onboarding.md); this does
//     not become a second exception.
// Once, then never again. The latch is per page load: a per-saved-game latch
// would read better but the only field-validated progress store is js/slots.js,
// which this module doesn't own (see the ENGINE lane report).
const DUCK_HINT = 'STUCK? TELL THE DUCK.';
let duckHintShown = false;

// Append the duck line UNDER a finger hint that is already on screen. Bails out
// entirely if no hint is showing, so it can never stand in for one.
function maybeShowDuckHint() {
  if (duckHintShown || state.level < 22) return;
  const host = $('finger-hint');
  if (!host || !host.firstChild) return;
  duckHintShown = true;
  const el = document.createElement('div');
  // Fixed code literal via textContent — never innerHTML, never user-influenced
  // (security.md rules 1-2).
  el.textContent = DUCK_HINT;
  // Full-opacity muted grey rather than element opacity (journal L2/F3), and a
  // step quieter than the hint above it so the help keeps primacy.
  el.style.cssText = 'margin-top:10px;font-size:7px;letter-spacing:2px;color:#8a8a8a';
  host.appendChild(el);
}

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
  // ADAPTIVE PACING (tech.md §Adaptive Pacing). A rolling window of the recent
  // intervals between CORRECT keypresses, and the gentleness multiplier derived
  // from it. See the "Adaptive pacing" section below — paceScale is never a
  // timer and never a deadline; it only ever stretches the engine's cosmetic
  // between-prompt pauses (and, in opt-in Survival, LENGTHENS the allowance).
  paceSamples: [],
  paceScale: 1,
  lastCorrectAt: null,
  paused: false,
  startTime: null,
  patterns: [],
  cardWordTyped: false,
  // The single guaranteed history card chosen for THIS play of the level (or
  // null if the level hides none). Rotates across replays (pickGuaranteedCard),
  // preferring a card not yet collected in the active slot. Everything about the
  // card gate — sparkle detect, win-gate, reveal — keys off this one object.
  currentCard: null,
  // Whether the LEVEL COMPLETE panel that is currently being assembled carries a
  // history card. Set by showLevelComplete, read by showCompleteOverlay — which
  // runs later, when the panel is finally displayed — so the pick-up-off-the-
  // floor sound only ever plays over a card the player can actually see.
  completeCardShown: false,

  // Name Moment (see nameWordForLevel etc.): the lowercase name-word that
  // earns this level's guaranteed golden injection, or null. nameMomentDone
  // guards the once-per-game flourish so replaying the same run can't re-fire
  // it mid-session; nameMomentFired() (persisted) guards it across sessions.
  nameMomentWord: null,
  nameMomentDone: false,

  // Level 24 ("the player types their own name", act5.md). The capitalized name
  // pattern injected as guaranteed content for this play, and whether it has
  // been completed yet. Like a history card, the level cannot end until it has
  // (see l24NamePending in handleGameKey) — Level 24's whole narrative point is
  // never left to the arithmetic of where the win gate happens to land.
  l24NameWord: null,
  l24NameTyped: false,

  // Level 25 "MY STORY" coda (js/keyboard-story.js). The manifesto is no longer
  // spliced up front — instead, once the level's TRADITIONAL win target is first
  // met, the level rolls PAST it into an earned coda: a readable walk-the-keyboard
  // STORY (covering every letter a–z) whose FINAL line(s) are the EXPERIENCE-tier
  // manifesto excerpt as its capstone, plus ≥1 choreographed typo→Backspace→correct
  // beat. codaLines holds the ordered token-array tail (built once at startCoda);
  // codaSubLens is its per-line non-Backspace token counts (handed to the theme for
  // the display-only sub-line boundary spaces). codaActive flips true the moment the
  // target is reached; codaTyped counts coda lines completed; the level ends only
  // once codaTyped reaches the whole coda (codaPending in handleGameKey) — the coda
  // is guaranteed, never missable, and always winnable at EVERY tier. Empty/false on
  // every non-25 / free-play run (a no-op).
  codaLines: [],
  codaSubLens: [],
  codaActive: false,
  codaTyped: 0,
  // One-shot: fires the wordprocessor theme's beginFinale(subLens) render signal the
  // moment the first coda line becomes the active prompt (see maybeSignalCoda).
  codaSignaled: false,

  // Slot picker ("CHOOSE YOUR GAME") — the returning-player front door. Games
  // are an unlimited, growable list; the picker shows one row per game plus a
  // trailing "＋ NEW GAME" row, so slotsSelected ranges over [0 .. count].
  slotsSelected: 0,          // 0-based highlighted row (count == the NEW GAME row)
  slotsEraseConfirm: false,  // X → Y/N erase confirmation sub-state
  pendingNewGame: false,     // a new-game name entry is in progress (append on confirm)
  // The picker's labelled R RENAME action: the index of the game whose name the
  // name field is editing, or null. The ONLY path that renames a saved game
  // (levels/onboarding.md §The arcade from READY, Trevor 2026-10-30).
  renameSlot: null,
  collectionForSlot: 0,      // which game the collection gallery is showing

  // Select-screen gating: the highest level the player may enter. Cabinets
  // beyond this render dark/locked and can't be selected — EXCEPT the WOPR
  // bypass sets selectBypass=true, unlocking every cabinet for dev/parents.
  maxUnlockedLevel: 1,
  selectBypass: false,
  // Sub-state of the 'select' screen: which BONUS ACT the cursor is walking
  // (null = none, still among the 25 cabinets), and which machine on that act's
  // wall it is standing at. wingIndex indexes cabinet-art.js's BACK_WALL_DOORS
  // registry (one row per bonus act) and wingEntry names a machine inside it —
  // read both through focusedDoor(state)/focusedWingEntry(state), never
  // directly. Any Escape clears them.
  wingIndex: null,
  wingEntry: null,

  // Settings screen navigation
  settingsReturn: 'title',   // 'title' | 'pause'
  settingsSelectedRow: 0,
  settingsEraseConfirm: false,
  // A settings move to a HARDER value awaiting Y/N (product.md §Choosing a harder
  // rule asks once). Held ONLY here, never in `settings` and never in kk-settings,
  // until the player presses Y.
  settingsPending: null,
  // Blocked-words editor: which parent-added chip is highlighted for removal.
  blockWordsSelected: 0,

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
    spareAwarded: false,     // the 1-quarter run's one-time spare (see maybeAwardMercyQuarter)
  },

  // Pattern-boundary guards (product.md §Reinforce — "the letter the player sees is
  // the letter being judged", 2026-10-30). Between one pattern finishing and the next
  // being drawn there is a paced ~300ms beat; `pendingPromptRender` holds the draw
  // so a key pressed inside the beat can flush it first. `levelEnding` is set once
  // the win is decided, so keys pressed while the win is being shown are ignored
  // rather than judged against a pattern that will never be drawn.
  pendingPromptRender: null,
  pendingPromptTimer: null,
  levelEnding: false,
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
  // Level 24 is excluded: it is the capitals ceremony ("You already know every
  // letter. Now make them BIG." — act5.md) and it already injects the name in
  // TITLE CASE as guaranteed content. A lowercase copy landing among the drills
  // a few patterns earlier both crowded the level and undercut its one lesson.
  if (!state.nameMomentWord && state.level !== 24) {
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

// Level 25 only: begin the "MY STORY" coda the moment the level's TRADITIONAL win
// target is first reached. The manifesto/story is NOT spliced up front (that made
// it the whole level); instead the coda is built HERE, once, as the deterministic
// tail from the current position onward: we build the ordered token lines, TRUNCATE
// the remaining (un-reached) normal patterns, and APPEND the coda so the very next
// prompt is the coda's first line. The engine then serves them in order via its
// existing index mechanism (getNextPattern). Winnability holds at every tier: the
// coda is finite, fully typeable at L25, and sits ahead of any pool draw.
//
// The story POOL = validated-generated stories (if the local-LLM prefetch landed) +
// the static bank (the offline floor). pickKeyboardStory rotates deterministically
// by this slot's per-level story counter (a different story each replay, mirroring
// the history-card rotation); assembleCoda appends the EXPERIENCE-tier manifesto as
// the capstone and includes ≥1 typo→Backspace→correct beat. Static-only guarantees a
// non-empty, all-26-letter coda even with no server — so the coda is never empty.
function startCoda() {
  const rotation = Slots.getStoryRotation(25);
  // Fold any fresh generated batch into the accumulating quality-cache (dedup against
  // static + existing cache, capped, defensive) and build the rotation pool from the
  // MERGED cache. If generation never landed, the cache is empty, or everything deduped
  // away, buildStoryPool still appends the static bank — the coda is never empty and
  // winnability never depends on the cache (security.md rule 4; static floor intact).
  const merged = addGeneratedStories(takeKeyboardStories());
  const pool = buildStoryPool(merged);
  const story = pickKeyboardStory(pool, rotation);
  const coda = assembleCoda(story, getWinRatio(), rotation);
  Slots.bumpStoryRotation(25);
  state.codaLines = coda;
  // Non-Backspace token count per line — a Backspace never adds a character to the
  // document, and the theme's boundary-space counter only counts forward keystrokes.
  state.codaSubLens = coda.map(line => line.filter(t => t !== 'Backspace').length);
  state.codaActive = true;
  state.codaTyped = 0;
  state.codaSignaled = false;
  // Make the coda the tail from the current (next-to-serve) position onward: drop any
  // un-reached normal patterns, then append the coda lines in order.
  if (state.currentPattern < state.patterns.length) {
    state.patterns.length = state.currentPattern;
  }
  state.patterns.push(...coda.map(l => l.slice()));
}

// Fire the wordprocessor theme's beginFinale(subLens) render signal the first time a
// coda line becomes the active prompt (fresh paragraph + top-band clamp; the theme
// only responds to the hook — themes never gate input, theme-authoring.md).
function maybeSignalCoda() {
  if (state.codaSignaled || state.freePlay || state.level !== 25 || !state.codaActive) return;
  state.codaSignaled = true;
  const theme = activeTheme(state.level);
  if (theme && theme.beginFinale) theme.beginFinale(state.codaSubLens);
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

// ─── Adaptive pacing ────────────────────────────────────────────────────
// tech.md §Adaptive Pacing: "Track average time between correct keypresses.
// Use rolling average to set prompt display speed. Player slows down → game
// slows down with them. ... No hard timer — pace is always derived from the
// player."
//
// WHAT "PROMPT DISPLAY SPEED" IS IN THIS ENGINE. There is exactly one place the
// engine decides how fast the game moves on: the two cosmetic pauses in
// handleGameKey — the beat before the NEXT PATTERN renders (historically a flat
// 300ms) and the beat before the next letter inside a pattern lights up
// (historically 150ms). Nothing else in the base engine is time-driven at all.
// Those two pauses ARE the prompt display speed, so those are what adapt.
//
// WHY THIS CAN NEVER BECOME PRESSURE (the One Rule):
//   • The multiplier is clamped to [1, PACE_MAX_SCALE]. It can only ever make a
//     pause LONGER — never shorter than the hand-tuned baseline. A fast player
//     gets byte-identical behavior; a slow player gets more room to breathe.
//     (tech.md's "player speeds up → game can OPTIONALLY increase pace" is the
//     half we deliberately decline: speeding up for a fast child is the one
//     direction that could ever feel like being chased.)
//   • It gates nothing. No prompt is ever withdrawn, no input window closes, no
//     state advances on a clock. The letter still stays and waits forever.
//   • Intervals that span a MISTAKE are never sampled, so neither the miss nor a
//     slow self-correction can move the pace in either direction — the
//     wrong-keypress contract stays completely outside this system.
//   • A single long think is capped (PACE_SAMPLE_CAP_MS) and the window is short,
//     so walking away and coming back can't distort the feel of the next word.
// The derived value is published on the game screen as `data-pace` — an
// observable, non-visual surface (never a HUD readout: product.md §6, stats are
// never looming, and a visible "speed" would be exactly the pressure we refuse).

// The per-keystroke interval the engine's historical 300/150ms pauses were tuned
// for (~400ms ≈ a comfortable early-reader cadence). At or below this, pacing is
// a complete no-op.
const PACE_BASELINE_MS = 400;
// One long pause (looking at the keyboard, a parent talking) is capped so it
// can't dominate the average.
const PACE_SAMPLE_CAP_MS = 4000;
// How many recent intervals the rolling average covers.
const PACE_WINDOW = 8;
// The gentlest the game will ever get: pauses at most double. Bounded so the
// adaptation stays a feel, never a stall.
const PACE_MAX_SCALE = 2;

// Publish the derived pace on the game screen (observable state for tests and
// for any future theme that wants to breathe with the player). Never rendered
// as text to the player.
function publishPace() {
  const el = $('game-screen');
  if (el) el.dataset.pace = state.paceScale.toFixed(2);
}

function resetPace() {
  state.paceSamples = [];
  state.paceScale = 1;
  state.lastCorrectAt = null;
  publishPace();
}

// Fold one correct keypress into the rolling average. `sampleable` is false for
// the first key of a pattern (that interval includes the render pause and
// reading the new word, not typing) and for any keypress whose letter had a
// mistake logged against it (the wrong-key contract stays out of pacing).
function recordPaceSample(now, sampleable) {
  if (sampleable && state.lastCorrectAt !== null) {
    const dt = now - state.lastCorrectAt;
    if (dt > 0) {
      state.paceSamples.push(Math.min(dt, PACE_SAMPLE_CAP_MS));
      if (state.paceSamples.length > PACE_WINDOW) state.paceSamples.shift();
    }
  }
  state.lastCorrectAt = now;
  if (state.paceSamples.length) {
    const avg = state.paceSamples.reduce((a, b) => a + b, 0) / state.paceSamples.length;
    state.paceScale = Math.min(PACE_MAX_SCALE, Math.max(1, avg / PACE_BASELINE_MS));
  } else {
    state.paceScale = 1;
  }
  publishPace();
}

// A baseline delay, stretched to the player's own measured pace. Always >= base.
function paced(baseMs) {
  return Math.round(baseMs * state.paceScale);
}

// ─── SURVIVAL wrapper ───────────────────────────────────────────────────
// tech.md: "Survival Mode ... implemented as a wrapper/modifier on top of
// base engine. Base engine never has survival logic — it's always
// additive." Everything below is pure addition: it never intercepts or
// changes the wrong-key contract in handleGameKey. It only ever (a) starts
// a per-pattern clock, (b) re-rolls the CURRENT pattern on timeout without
// advancing patternsCompleted, and (c) hands back a quarter on a 15-streak.

// No prompt is ever given less than this (product.md §Survival is challenging, never
// cruel — Trevor 2026-10-30). The formula below scales with length, which left a
// ONE-letter prompt ~5.4s at EXPERT: a child glancing
// away briefly lost a quarter on the shortest, easiest prompt on screen. The floor
// makes a short prompt never harsher than a long one. The clock is NOT otherwise
// retuned (challenging fast typists is a deferred, separate decision).
const SURVIVAL_MIN_PATTERN_MS = 10000;

function survivalPatternDuration(pattern) {
  const mult = DIFFICULTY_MULTIPLIER[settings.difficulty] || DIFFICULTY_MULTIPLIER.novice;
  const base = 5000 + 1400 * pattern.length;
  // ADAPTIVE PACING applies here too, in the only direction it ever can: the
  // allowance is multiplied by the player's own measured pace (>= 1), so a
  // slower typist gets MORE time, never less. "The game adapts to the player's
  // pace — if they're slow, the game slows with them" (product.md §1) is most
  // load-bearing in the one opt-in mode where a clock exists at all. At the
  // baseline pace this is byte-identical to the historical formula (above the floor).
  return Math.max(SURVIVAL_MIN_PATTERN_MS, Math.round(base * mult * state.paceScale));
}

// The purse as drawn: one dot per quarter the player could hold. Normally that is the
// starting count; the 1-quarter spare (below) is the one time it can be one more.
function renderPurse() {
  const sv = state.survival;
  renderQuarters(Math.max(0, sv.quartersRemaining), Math.max(sv.quartersTotal, sv.quartersRemaining));
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
//
// At ONE quarter there is never a quarter to hand back — a lost quarter ends the run —
// so the mercy used to be structurally unreachable on exactly the setting where it
// matters most. product.md §Survival is challenging, never cruel (Trevor 2026-10-30):
// at 1 quarter, the FIRST 15-streak of the run earns one SPARE quarter (a second coin
// in the purse), once per run. Spent, the run is back to the rule the player chose.
function maybeAwardMercyQuarter() {
  if (!state.survival.active) return;
  const sv = state.survival;
  sv.survivalStreak++;
  if (!(sv.survivalStreak > 0 && sv.survivalStreak % 15 === 0)) return;
  let award = false;
  if (sv.quartersRemaining < sv.quartersTotal) {
    award = true;
  } else if (sv.quartersTotal === 1 && !sv.spareAwarded) {
    sv.spareAwarded = true;
    award = true;
  }
  if (award) {
    sv.quartersRemaining++;
    renderPurse();
    flashBonusQuarter();
    Audio.bonusQuarter();
  }
}

function handleSurvivalTimeout() {
  stopSurvivalTimer();
  state.survival.survivalStreak = 0;
  state.survival.quartersRemaining--;
  renderPurse();
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

// The beat between patterns (see state.pendingPromptRender). One pending draw at a
// time; a newer schedule replaces an older one, and a flush runs it at once.
function schedulePromptRender(fn, ms) {
  clearPendingPromptRender();
  state.pendingPromptRender = fn;
  state.pendingPromptTimer = setTimeout(flushPendingPromptRender, ms);
}

function flushPendingPromptRender() {
  const fn = state.pendingPromptRender;
  clearPendingPromptRender();
  if (fn && state.screen === 'game') fn();
}

function clearPendingPromptRender() {
  if (state.pendingPromptTimer) clearTimeout(state.pendingPromptTimer);
  state.pendingPromptTimer = null;
  state.pendingPromptRender = null;
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

  // 3b. A held key is ONE press (product.md §Reinforce, Trevor 2026-10-30). The OS
  //     auto-repeat fires keydown again and again with e.repeat = true; judged as
  //     presses, one hold of a WRONG key logged +8..+13 mistakes and one hold of a
  //     RIGHT key on a doubled letter (`jj`) typed both. Applies to every typed
  //     token, Space and Backspace included: each Backspace in the L25 typo gag is
  //     its own token, so a held Backspace would otherwise either skip past the
  //     scripted beat or log a mistake per repeat against the letter after it.
  //     A first (non-repeat) keydown is untouched — the wrong-key contract below
  //     runs byte-for-byte as before.
  if (e.repeat) return;

  // 3c. The win is decided and being shown: nothing left to judge.
  if (state.levelEnding) return;

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

  // 3d. A key pressed in the beat between patterns: draw the next pattern FIRST, so
  //     the key is judged against the letter now on screen — never against a pattern
  //     the player cannot see (product.md §Reinforce, Trevor 2026-10-30).
  if (state.pendingPromptRender) flushPendingPromptRender();

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
    // ADAPTIVE PACING: fold this keystroke into the rolling average BEFORE
    // wrongOnCurrent is cleared — an interval that spans a mistake (and a slow
    // self-correction) is never sampled, so the wrong-keypress contract can
    // never move the pace in either direction. The first key of a pattern is
    // also skipped: that interval is render-pause + reading, not typing.
    recordPaceSample(Date.now(), state.currentIndex > 0 && !state.wrongOnCurrent);
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
      //
      // ⚠️ THE `!state.freePlay` GUARD THAT USED TO BE HERE MADE FREE PLAY
      // UNWINNABLE, and it is worth saying exactly how, because it is the One Rule
      // failing by omission rather than by intent.
      //
      // The guard was correct for years: only curriculum levels had cards, so Free
      // Play could not have a moment word to latch. The act-card layer (2026-09-14)
      // then made Free Play the ONE surface that serves a card — and the win gate
      // below (`cardPending`, ~line 869) has no free-play exclusion. So the moment
      // ACT_CARDS stopped being empty: `currentCard` was set, this latch could never
      // fire, `cardPending` stayed true forever, and **the session could never end.**
      // No timer, no failure, no message — just a child typing sentences until
      // somebody closed the tab. That is INV-102's named hazard and the purest form
      // of "the game should only ever stop a player's flow with joy."
      //
      // `currentCard` is only ever set in Free Play when an act card was chosen
      // (the curriculum picker below is itself `!state.freePlay`-guarded), so the
      // card identity is sufficient here and the surface check is not needed.
      // Caught by PLAYING a Free Play session to 600 patterns, not by any gate:
      // every suite was green, because an empty bank arms nothing.
      if (!state.cardWordTyped) {
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

      // Level 24's own name gate: note the moment the capitalized name pattern
      // is actually completed. Purely a record — the celebration here is the
      // high-score theme's normal word celebration (the once-ever golden
      // flourish belongs to the pre-Shift Name Moment, not to level 24).
      if (!state.freePlay && state.l24NameWord && !state.l24NameTyped
          && patternsEqual(pattern, state.l24NameWord)) {
        state.l24NameTyped = true;
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

      // Level 25 coda: once active, every completed pattern is a coda line served as
      // the tail (startCoda) — count them toward the coda's completion gate.
      if (state.codaActive) state.codaTyped++;

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
      // An act card is guaranteed on the same terms as a level card: the session
      // cannot end until its word has been typed. ⚠️ This is the one change in
      // the feature that could HANG a session, which would be a One Rule
      // violation — so the gate is only ever armed when a card was actually
      // chosen AND its word was actually spliced into the pattern stream, and
      // getNextPattern() refills the pool infinitely so the word always comes
      // round again. An empty ACT_CARDS bank arms nothing at all.
      const cardPending = state.currentCard && !state.cardWordTyped;
      // Likewise, if this is the level where the player's name first becomes
      // spellable, the level can't end until they've completed their name —
      // the golden Name Moment is guaranteed, never missable (same guarantee
      // shape as the card, but a fully independent gate).
      const namePending = !state.freePlay
        && state.nameMomentWord
        && !state.nameMomentDone;
      // Level 24 is "the player types their own name" (act5.md). Like a card,
      // that moment is GUARANTEED: the level cannot end until the capitalized
      // name has actually been typed. Before this gate it was reached only
      // because the arithmetic happened to work out (the intro drills plus a
      // short card word stayed under the theme's character gate) — a longer card
      // word would have silently let the name level be won without the name.
      // Always satisfiable: the name is spliced right after the intro drills, so
      // it is served long before any win is possible.
      const l24NamePending = !state.freePlay
        && state.l24NameWord
        && !state.l24NameTyped;
      // The traditional win target: theme game won AND enough patterns typed AND
      // the guaranteed card + name moment done. On a normal level, this ENDS the
      // level. On Level 25 it does NOT — it rolls into the "MY STORY" coda instead.
      const normalTargetMet = themeComplete
        && state.patternsCompleted >= minPatterns
        && !cardPending && !namePending && !l24NamePending;

      // Level 25 coda (js/keyboard-story.js): the manifesto + walk-the-keyboard
      // story is a post-target TAIL, not an up-front block. When the traditional
      // target is FIRST met, begin the coda (startCoda) instead of ending; the level
      // ends only once the WHOLE coda has been typed — guaranteed, never missable,
      // and winnable at every tier (the coda is finite and fully typeable at L25).
      if (state.level === 25 && !state.freePlay) {
        if (normalTargetMet && !state.codaActive) {
          startCoda(); // static fallback guarantees a non-empty, all-26-letter coda
        }
        if (state.codaActive && state.codaTyped >= state.codaLines.length) {
          state.levelEnding = true;
          setTimeout(showLevelComplete, 400);
          return;
        }
        // else: still in normal play, or mid-coda — fall through to the next prompt
        // (getNextPattern serves the next coda line once the coda is active).
      } else if (normalTargetMet) {
        state.levelEnding = true;
        setTimeout(showLevelComplete, 400);
        return;
      }

      schedulePromptRender(() => {
        const nextPattern = getNextPattern();
        maybeSignalCoda();
        renderPrompt(state, level, nextPattern);
        if (settings.hintStyle === 'obvious') showFingerHint(nextPattern[0]);
        startSurvivalPatternTimer(nextPattern);
      }, paced(300));
    } else {
      // Re-light the next letter after a short beat. Capture WHICH letter at schedule
      // time: this used to read state.currentIndex when the timer FIRED, so a fast
      // typist who finished the pattern inside the beat had index 0 by then and the
      // timer re-highlighted the already-completed first letter. If the player has
      // moved on (typed the next letter, finished the pattern, a Survival re-roll),
      // a newer render already owns the highlight and this one stands down.
      const atPattern = state.currentPattern;
      const atIndex = state.currentIndex;
      setTimeout(() => {
        if (state.screen !== 'game' || state.currentPattern !== atPattern
            || state.currentIndex !== atIndex || state.patterns[atPattern] !== pattern) return;
        const nextEl = document.querySelector(`.prompt-letter[data-index="${atIndex}"]`);
        if (nextEl) nextEl.classList.add('active');
        renderKeyboard(level, pattern[atIndex], null, state);
      }, paced(150));
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
      // ...and, once ever from Level 22 on, the duck rides along underneath it.
      maybeShowDuckHint();
    }
    updateHUD(state, settings);

    setTimeout(() => {
      if (el) el.classList.remove('wrong');
      renderKeyboard(level, expected, null, state);
    }, 300);
  }
}

// Render (or clear) the eighth-key confession line on the level-complete card.
// Security: a fixed code literal set via textContent — never innerHTML, never a
// user-influenced string (security.md rules 1-2). Styled inline because this is
// an engine-owned one-off, and with a full-opacity muted colour rather than
// element opacity (journal L2/F3 — opacity halves every contrast ratio).
// The act-card layer, announced exactly once at the milestone that grants it.
//
// The design lane called this non-negotiable and it is right: the layer lives
// behind Free Play's `F` toggle, so without a single line here a player can own
// a whole collection and never learn it exists. A hidden layer nobody finds
// rewards nobody — and unlike the magic words and the moth (which are free to
// miss because nothing counts them), this one has a COUNTER, and a counted
// `???` with no path to it is an obligation rather than a delight (product.md §1).
//
// Text, not a modal, not a pause: it rides the LEVEL COMPLETE card the player is
// already reading, and the level flow is untouched.
const ACT_LAYER_REVEAL = 'EVERY LETTER IS YOURS NOW.\nSOME STORIES WERE WAITING FOR ALL OF THEM.\nPRESS F AT THE ARCADE.';

function renderActLayerReveal(show) {
  const existing = $('act-layer-reveal');
  if (existing) existing.remove();
  if (!show) return;
  const modal = document.querySelector('.complete-modal');
  const prompt = $('complete-prompt');
  if (!modal || !prompt) return;
  const el = document.createElement('div');
  el.id = 'act-layer-reveal';
  // Fixed literal, set as text — never a DOM sink, and nothing here is
  // user-influenced (security.md rules 1–2).
  el.textContent = ACT_LAYER_REVEAL;
  el.style.cssText = [
    'margin:22px auto 24px',
    'white-space:pre-line',
    'font-size:8px',
    'line-height:2.2',
    'letter-spacing:1px',
    // Warm gold — the collection's own colour (the card glint), not the green
    // the eighth-key confession uses, so the two one-time reveals never read as
    // the same voice. Full-opacity colour, never element opacity (journal L2/F3).
    'color:#f2c14e',
    'text-shadow:0 0 6px rgba(242,193,78,0.45)',
  ].join(';');
  modal.insertBefore(el, prompt);
}

function renderEighthKeyConfession(show) {
  const existing = $('eighth-key-confession');
  if (existing) existing.remove();
  if (!show) return;
  const modal = document.querySelector('.complete-modal');
  const prompt = $('complete-prompt');
  if (!modal || !prompt) return;
  const el = document.createElement('div');
  el.id = 'eighth-key-confession';
  el.textContent = EIGHTH_KEY_CONFESSION;
  el.style.cssText = [
    'margin:26px auto 28px',
    // The couplet breaks on its own newline (pre-line) rather than on whatever
    // the modal width happens to be — two deliberate terminal lines, never a
    // ragged three-line wrap.
    'white-space:pre-line',
    'font-size:8px',
    'line-height:2.2',
    'letter-spacing:1px',
    // A full-opacity muted green, NOT element opacity (journal L2/F3) — quieter
    // than the blinking accent prompt, still ~9:1 against the modal's black.
    'color:#35c94a',
    'text-shadow:0 0 6px rgba(53,201,74,0.5)',
  ].join(';');
  modal.insertBefore(el, prompt);
}

// The single moment the LEVEL COMPLETE panel — and the history card on it —
// actually becomes visible. There are two ways to get here: the victory timer
// expiring, and a keypress skipping the celebration window (engine behaviour a
// theme must never fight). Both are a genuine first sight of the card, so both
// go through here rather than each poking the class list; before this existed,
// only one of them would have had a voice.
function showCompleteOverlay() {
  state.screen = 'complete';
  $('complete-overlay').classList.remove('hidden');
  // The card gets picked up off the floor. Fired AFTER the reveal, never before
  // it, so sound can neither delay nor gate the beat (the One Rule) — and only
  // when a card is actually on the panel, because a level-complete without one
  // must sound exactly as it always has. `Audio.historyCard()` is written
  // against `.history-card`'s 0.4s `cardDrop` keyframe, and that keyframe starts
  // on the line above: the overlay was display:none until now, so the animation
  // and the sound begin together rather than one chasing the other.
  if (state.completeCardShown) Audio.historyCard();
}

function showLevelComplete() {
  stopSurvivalTimer();
  const elapsed = Date.now() - state.startTime;
  const acc = state.totalAttempts > 0
    ? Math.round((state.totalCorrect / state.totalAttempts) * 100)
    : 100;
  const level = getLevelData();

  // The eighth-key confession (easter-eggs.md #8): the FIRST time this saved
  // game ever finishes Level 20 — the terminal, where the computer is earned.
  // The one-time latch is DERIVED from progress that already exists (this
  // level's completed flag, read before recordLevelComplete writes it below),
  // so it needs no new persisted field and is naturally per-saved-game: a
  // replay never re-fires it, and another family member's game gets its own.
  // The act layer lives behind Free Play's `F` toggle, so a player could own it
  // and never know. It announces itself exactly once, at the milestone that
  // grants it. Latch DERIVED from progress read before recordLevelComplete
  // writes it — no new field, per-saved-game, never re-fires on a replay
  // (the eighth-key confession pattern).
  const actLayerReveal = !state.freePlay
    && state.level === ACT_CARD_UNLOCK_LEVEL
    && !getProgress().completed[String(ACT_CARD_UNLOCK_LEVEL)];
  renderActLayerReveal(actLayerReveal);

  const eighthKeyReveal = !state.freePlay
    && state.level === 20
    && !getProgress().completed['20'];
  renderEighthKeyConfession(eighthKeyReveal);

  // Is this the FIRST time this saved game has cleared this level? The act
  // cinematics after Levels 5/10/15/20 cannot be skipped on their first viewing
  // and can be (Space/Escape) on a replay — transitions.md "Skippable after first
  // completion". Same derived latch as the eighth-key confession above: read
  // BEFORE recordLevelComplete writes the flag, so no new storage field.
  state.firstClear = !state.freePlay && !getProgress().completed[String(state.level)];

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
  // In Free Play only an ACT card reveals — the curriculum's own cards stay a
  // curriculum-only reward, exactly as before (they are earned by the level that
  // teaches their keys, and handing them out in Free Play would cheapen that).
  const card = state.freePlay
    ? (state.currentCard && bankOf(state.currentCard.id) === 'act' ? state.currentCard : null)
    : state.currentCard;
  if (card && state.cardWordTyped) {
    const isNew = Slots.collectCardId(card.id);
    $('history-card-word').textContent = card.word.toUpperCase();
    $('history-card-title').textContent = card.title;
    $('history-card-year').textContent = card.year;
    $('history-card-fact').textContent = card.fact;
    // Scoped to the card's OWN bank — see bankOf/bankProgress in history-cards.js.
    // An unscoped count against the arcade total reads "CARD 63 OF 60" as soon as
    // any bonus-wing card exists.
    // ⚠️ `bankOf` returns 'arcade' | 'wing' | 'act'. This used to test only for
    // 'wing', so an ACT card — which DOES reveal here, in Free Play — was counted
    // against the arcade bank and would read its total, not its own. Same class
    // of bug as INV-100, one bank later; caught before act cards had any content.
    const prog = bankProgress(bankOf(card.id) || 'arcade', Slots.collectedIds());
    $('history-card-count').textContent = `CARD ${prog.found} OF ${prog.total}`;
    $('history-card-new').classList.toggle('hidden', !isNew);
    historyCard.classList.remove('hidden');
  } else {
    historyCard.classList.add('hidden');
  }
  // Does this level-complete carry a card? The sound cannot fire here: the card
  // is only UNHIDDEN now, and its parent `.complete-overlay` stays display:none
  // for the whole victory window — so nothing is on screen yet and its 0.4s
  // `cardDrop` animation has not started. The flag rides on state because there
  // are TWO ways the overlay appears (the victory timer, and a keypress skipping
  // the celebration) and both are a genuine first sight of the card.
  state.completeCardShown = !historyCard.classList.contains('hidden');

  if (state.freePlay) {
    document.querySelector('.complete-title').textContent = 'FREE PLAY COMPLETE';
    $('complete-prompt').textContent = 'PRESS SPACE FOR THE ARCADE';
  } else if (state.level === 25) {
    document.querySelector('.complete-title').textContent = 'FULL KEYBOARD MASTERED';
    // Every card says what Space does. Here Space ends the game's last level and
    // returns to the attract title (the `LEVELS[state.level + 1]` miss below), so
    // that is what the cue promises.
    $('complete-prompt').textContent = 'YOU BUILT THIS · PRESS SPACE FOR THE TITLE SCREEN';
  } else if (state.level === 24) {
    // Only claim a typed name when one was (Level 24's board shows YOU otherwise).
    document.querySelector('.complete-title').textContent =
      state.l24NameTyped ? 'YOU TYPED YOUR NAME' : 'SHIFT MASTERED';
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
    // Space goes on to Level 5 (the Mystery cinematic follows Level 5, not 4),
    // so the cue says NEXT LEVEL and the flavour line rides in front of it.
    $('complete-prompt').textContent = 'THE MYSTERY CABINET AWAITS · PRESS SPACE FOR NEXT LEVEL';
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
    if (state.screen === 'victory') showCompleteOverlay();
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

// Exact token-array equality — used for the Level 24 capitalized name pattern,
// whose tokens include uppercase (Shift'd) letters and so can't go through
// patternMatchesName's lowercase-word comparison.
function patternsEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
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
  // The name this game is played and credited under is the ACTIVE saved game's
  // own name, read at the moment play starts (levels/onboarding.md §Which game is
  // playing). Done first: the Name Moment and Level 24 both read state.playerName.
  syncActiveIdentity();
  // Force a fresh shuffle for each new free-play session, even on a level
  // the player has already played free-play on.
  freePlayLevelCache = null;
  freePlayLevelCacheFor = null;
  const level = getLevelData();
  state.currentPattern = 0;
  state.currentIndex = 0;
  state.patternsCompleted = 0;
  clearPendingPromptRender();
  state.levelEnding = false;

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

  // ── Level 24: the player's own name, in capitals ──
  // This is the level's entire narrative point ("The player types their name:
  // OONA. It appears as a high score entry. Personal, irreplaceable." —
  // act5.md), so the name is GUARANTEED content: the very first pattern after
  // the warm-up drills, and win-gated below (l24NamePending) exactly like a
  // history card, so it can never be missed.
  //
  // It used to be injected TWICE — here and again at the pattern list's
  // MIDPOINT — which is the "Level 24 pattern crowding" item in ROADMAP §3. Two
  // problems, both of proportion and ordering, neither of removal:
  //   1. the midpoint slot (~index 17 of ~35) sits PAST where the level actually
  //      ends at three of the four EXPERIENCE tiers (Level 24's win is driven by
  //      the high-score theme's character gate, reached around pattern 11), so
  //      the second copy was unreachable dead weight at the default settings;
  //   2. the surviving copy landed at the index immediately after the history
  //      card word, so the level's marquee moment was sandwiched between ENIAC
  //      and the first word the level actually teaches.
  // Now: ONE guaranteed copy up front, the card word moved two slots later so
  // the two guaranteed injections are never adjacent (the card gate makes its
  // position free — the level cannot end before the card word is typed wherever
  // it sits), and the name additionally joins the level's own shuffled word pool
  // as one more capitalized word — a familiar face competing on equal terms with
  // Sun/Moon/Star rather than a second scripted injection.
  state.l24NameWord = null;
  state.l24NameTyped = false;
  if (state.level === 24 && !state.freePlay) {
    const namePattern = buildPlayerNamePattern(state.playerName);
    if (namePattern.length) {
      state.l24NameWord = namePattern;
      // Pool member first (higher index), so the guaranteed splice below can't
      // shift it out from under this calculation.
      const poolStart = level.intro.length + 3;
      if (state.patterns.length > poolStart) {
        const at = poolStart + Math.floor(Math.random() * (state.patterns.length - poolStart));
        state.patterns.splice(at, 0, namePattern.slice());
      }
      state.patterns.splice(level.intro.length, 0, namePattern.slice());
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
  // ── ACT CARDS (docs/specs/act-exclusive-cards.md) ────────────────────────
  // The act layer lives in FREE PLAY, and that is forced rather than chosen:
  // after Level 15 the curriculum cabinets STILL hand out their own restricted
  // key sets — Level 1 is `{j, f}` forever — so an Act 1 word can never be typed
  // at Act 1's curriculum cabinet. Free Play is the only place in the game where
  // an Act 1 cabinet and a complete keyboard exist at the same time, which is
  // exactly what Trevor's "after the entire keyboard is unlocked" requires. It
  // also pays the one replay surface that currently pays nothing.
  //
  // The cabinet you picked IS the act, so no new selection concept is needed.
  //
  // ⚠️ `actCardSpliced` exists because this branch does its OWN injection, at a
  // Free-Play-appropriate position (index <=2 into a sentence pool) rather than at
  // `level.intro.length`, which is a curriculum concept. The generic card-injection
  // block further down also acts on `state.currentCard` — so without this flag the act
  // card's word is spliced TWICE and the player types `quarter` twice in one session.
  // Latent since the layer shipped (2026-09-14) only because ACT_CARDS was empty;
  // found by authoring the first act card and reading the two splices together.
  let actCardSpliced = false;
  if (state.freePlay && actCardsUnlocked(getProgress().furthestLevel)) {
    const act = actOfLevel(state.level);
    const key = `act:${act}`;
    const chosenAct = act
      ? pickGuaranteedActCard(act, Slots.collectedIds(), Slots.getCardRotation(key))
      : null;
    if (chosenAct) {
      state.currentCard = chosenAct;
      Slots.bumpCardRotation(key);
      const pattern = wordToTokens(chosenAct.word);
      state.patterns.splice(Math.min(2, state.patterns.length), 0, pattern);
      actCardSpliced = true;
    }
  }
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
  if (card && !actCardSpliced) {
    // Inject right after the intro drills — before the earliest possible
    // level-win — so the moment word is always reached in real play. The
    // completion gate also waits for it (cards are earned, never missable).
    const cardTokens = wordToTokens(card.word);
    // Normally the first slot after the intro drills. At Level 24 the guaranteed
    // name already occupies that slot, so the card lands two further along —
    // with one of the level's own words between them — so the player never meets
    // two guaranteed injections back to back. Safe by construction: cardPending
    // holds the level open until the moment word is typed, wherever it sits.
    const cardAt = level.intro.length + (state.l24NameWord ? 2 : 0);
    state.patterns.splice(cardAt, 0, cardTokens);
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

  // ── Level 25 "MY STORY" coda (js/keyboard-story.js) ──
  // NOT spliced up front anymore (that made the manifesto the whole level). The
  // coda is the game's last typed moment, built LATER (startCoda) the instant the
  // traditional win target is reached, and served as the tail from there. Here we
  // only (a) reset the coda state and (b) fire a fire-and-forget local-LLM prefetch
  // for a fresh walk-the-keyboard story, so a validated batch can be READY by the
  // time the coda is assembled a few seconds later. The prefetch never blocks and
  // never gates play; if it hasn't landed (the common static-host case), the coda
  // falls back to the built-in static story bank immediately (the offline floor).
  state.codaLines = [];
  state.codaSubLens = [];
  state.codaActive = false;
  state.codaTyped = 0;
  state.codaSignaled = false;
  if (state.level === 25 && !state.freePlay) {
    prefetchKeyboardStories(getWinRatio());
  }

  state.totalCorrect = 0;
  state.totalAttempts = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.mistakes = {};
  level.keys.forEach(k => state.mistakes[k] = 0);
  state.wrongOnCurrent = false;
  // Every game starts at the baseline pace and re-derives it from THIS session's
  // typing — a level played months later never inherits a stale rhythm.
  resetPace();
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
  state.survival.spareAwarded = false;
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

  // THE ONE UNPROMPTED HINT IN THE WHOLE GAME (transitions.md Phase 5,
  // levels/onboarding.md §Design Rules). It is shown exactly once — at Level 1,
  // on a game that has never completed Level 1 — because "the player has zero
  // context yet". Every other hint in this game answers a mistake; this one
  // arrives before the child can make one.
  //
  // The latch needs NO new storage, matching the eighth-key confession's trick
  // (js/main.js) of deriving a first-time flag from progress that is already
  // recorded: once Level 1 has ever been completed on this save, the diagram
  // never appears again — including on a replay, which is correct, because a
  // player replaying Level 1 is by definition no longer contextless.
  if (!state.freePlay && state.level === 1) {
    let firstEver = false;
    try { firstEver = !getProgress().completed['1']; } catch { firstEver = false; }
    if (firstEver) showHomeRowDiagram();
  }

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
  state.renameSlot = null;
  state.pendingNewGame = false;
  if (typeof state.slotsSelected !== 'number') state.slotsSelected = 0;
  applyLevelTheme(1); // arcade-era chrome, like the title
  renderSlotsScreen(state, pickerSlots());
  showScreen('slots', state);
}

// The picker's rows: Slots.listSlots() plus each game's ARCADE-bank progress, so the
// row can print "★ found / total" (levels/onboarding.md). `cardsFound` counts every
// bank and must never be printed over TOTAL_CARDS (INV-100).
function pickerSlots() {
  return Slots.listSlots().map((s, i) => (s
    ? { ...s, arcade: bankProgress('arcade', Slots.slotCards(i)) }
    : s));
}

// Bring the live identity (the name the READY screen and HUD print, and the
// select-screen gate) in line with the ACTIVE saved game. Called whenever the
// active game may have changed, and at every game start, so the name on screen is
// always the game being credited (levels/onboarding.md §Which game is playing).
function syncActiveIdentity() {
  const name = Slots.activeName();
  if (name && name !== state.playerName) {
    state.playerName = name;
    Object.assign(settings, saveSettings({ ...settings, playerName: name }));
  }
  if (!state.selectBypass) state.maxUnlockedLevel = getProgress().furthestLevel;
}

// The name field, shown for one of its two jobs: a NEW game (or a brand-new
// machine's first name) or the picker's labelled RENAME. The label says which, so
// a player can always tell "who are you?" from "rename this game" — the absence of
// that label is how DAD became WOPR (Trevor, 2026-10-30).
const NAME_LABEL_NEW = 'ENTER YOUR NAME';
const NAME_LABEL_RENAME = 'RENAME THIS GAME';
function showNameEntry(label, value) {
  showScreen('title', state);
  state.coinInserted = true;
  $('insert-coin').classList.add('hidden');
  $('reboot-hint').classList.add('hidden');
  $('settings-hint').classList.add('hidden');
  $('wopr-text').textContent = '';
  $('name-label').textContent = label;
  $('name-confirm-verb').textContent = label === NAME_LABEL_RENAME ? 'TO SAVE' : 'TO START';
  $('name-setup').classList.remove('hidden');
  prefillNameField(value);
}

// The pre-filled name is a DEFAULT, not a draft: the first thing typed replaces
// it (onboarding.md §Name Entry — "any key press clears the default and starts
// typing fresh"; the rename field behaves the same). Native select-all alone was
// not enough — a click into the field, or keys typed before the old deferred
// select() ran, left the caret inside the old name and the typing was inserted
// into it ("GRAM" + GRANDMA → "GRANDMAGRAM"). So the field remembers that it is
// still pristine and the FIRST edit of any kind (typing, paste, Backspace)
// clears the default before it lands. Arrow/Home/End keys mean "I want to edit
// this name", so they end the pristine state without clearing. Focus is taken
// synchronously: the key that opened the field (Space/Return/R) has already had
// its default prevented, so it can never be typed into it.
let nameFieldPristine = false;
function prefillNameField(value) {
  const input = $('player-name-input');
  input.value = value;
  nameFieldPristine = value !== '';
  input.focus();
  input.select();
}

function initNameField() {
  const input = $('player-name-input');
  if (!input) return;
  input.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
      nameFieldPristine = false;
    }
  });
  input.addEventListener('beforeinput', (e) => {
    if (!nameFieldPristine) return;
    nameFieldPristine = false;
    // Deleting the selected default clears it whole — the same thing Backspace
    // does to a selection. Anything inserted starts from an empty field.
    input.value = '';
    if (e.inputType && e.inputType.startsWith('delete')) e.preventDefault();
  });
}

// R on the picker: rename the highlighted game, and nothing else. Never changes
// which game is active; Escape backs out unchanged; both return to the picker.
function startRenameFlow(slotIndex) {
  const info = Slots.listSlots()[slotIndex];
  if (!info) return;
  state.renameSlot = slotIndex;
  state.pendingNewGame = false;
  applyLevelTheme(1);
  showNameEntry(NAME_LABEL_RENAME, info.name);
}

// Index comparison kept apart from the null check (INV-94's shape: index 0 is falsy).
function activeSlotIs(idx) {
  const a = Slots.getActive() !== null ? Slots.getActive() : -1;
  return a === idx;
}

function finishRename(name) {
  const idx = state.renameSlot;
  state.renameSlot = null;
  $('name-label').textContent = NAME_LABEL_NEW;
  $('name-confirm-verb').textContent = 'TO START';
  if (name !== null && Slots.listSlots()[idx]) {
    // (compared to null: index 0 is falsy — INV-94). Renaming never changes which
    // game is active — including when NONE is (it used to set active to idx).
    Slots.renameSlot(idx, name);
    if (Slots.getActive() !== null && activeSlotIs(idx)) syncActiveIdentity(); // renamed the game being played: show it
  }
  state.slotsSelected = idx;
  showSlotsScreen();
}

// The attract title, clean: INSERT COIN showing, no name field live. Used wherever
// the game falls back to the title so a stale name field can never be left open.
function showAttractTitle() {
  applyLevelTheme(1);
  state.coinInserted = false;
  showScreen('title', state);
  $('insert-coin').classList.remove('hidden');
  $('reboot-hint').classList.remove('hidden');
  $('settings-hint').classList.remove('hidden');
  $('name-setup').classList.add('hidden');
  $('name-label').textContent = NAME_LABEL_NEW;
  $('name-confirm-verb').textContent = 'TO START';
  $('wopr-text').textContent = '';
}

// The select screen's heading. "GREETINGS PROFESSOR FALKEN / SHALL WE PLAY A GAME?"
// is the WarGames easter egg's answer (easter-eggs.md — "eggs are for finding, not
// telling"); now that a saved game reaches the arcade from READY on the ordinary
// route, the ordinary route gets a plain heading and the egg keeps its line.
function syncSelectHeading() {
  const t = document.querySelector('#select-screen .select-title');
  const st = document.querySelector('#select-screen .select-subtitle');
  if (!t || !st) return;
  if (state.selectBypass) {
    t.textContent = 'GREETINGS PROFESSOR FALKEN';
    st.textContent = 'SHALL WE PLAY A GAME?';
  } else {
    t.textContent = 'THE ARCADE';
    st.textContent = 'PICK A CABINET';
  }
}

function showSelect() {
  syncSelectHeading();
  renderSelectScreen(state);
  showScreen('select', state);
}

// Escape on READY with a saved game: the arcade, gates honoured
// (levels/onboarding.md §The arcade from READY, Trevor 2026-10-30). It used to
// drop into name entry, where any typing + Return silently renamed the game.
// The gate comes from the active game's own progress; only the WOPR bypass (a
// flag this never sets) lifts it, so locked cabinets and wings show honestly.
function showArcadeFromReady() {
  syncActiveIdentity();
  clearDoorFocus(state);
  const max = state.selectBypass ? 25 : (state.maxUnlockedLevel || 1);
  state.selectedLevel = Math.max(1, Math.min(state.level || 1, max));
  showSelect();
}

// Choosing a cabinet for a saved game goes straight to READY — no name entry.
function showReadyForActiveGame() {
  syncActiveIdentity();
  $('ready-name').textContent = state.playerName;
  renderReadyScreenWithSurvivalTag();
  applyLevelTheme(state.level);
  Audio.start();
  showScreen('ready', state);
}

// Route into name entry to CREATE a brand-new game. The name-entry confirm
// handler appends the new game (state.pendingNewGame). No slot index — games are
// an unlimited, growable list (Trevor: no reason to cap a family's members).
function startNewGameFlow() {
  state.pendingNewGame = true;
  state.renameSlot = null;
  state.level = 1;
  state.selectBypass = false;
  state.freePlay = false;
  applyLevelTheme(1);
  showNameEntry(NAME_LABEL_NEW, ''); // a fresh name for a fresh game, past INSERT COIN
  Audio.coin();
}

// The collection gallery for a given slot — found cards revealed, still-locked
// cards shown as "???" silhouettes to tease replay. Read-only; opening it never
// changes which game is active.
function showCollectionScreen(slotIndex) {
  state.collectionForSlot = slotIndex;
  const collected = Slots.slotCards(slotIndex);
  // SHELVED, one per card bank (js/ui/screens.js collectionShelves). The gallery
  // used to render allCards() — the arcade bank only — which meant every wing and
  // act card a player earned was counted by the picker's ★ and then displayable on
  // no screen in the game. Which shelves this save may SEE depends on how far THIS
  // game has got, so the level comes from the slot being browsed, not from the
  // active game (the picker can peek at any game without switching to it).
  const info = Slots.listSlots()[slotIndex];
  const shelves = collectionShelves({
    furthestLevel: info ? info.furthestLevel : 1,
    collectedIds: collected,
    bypass: !!state.selectBypass,
  });
  renderCollectionScreen(state, shelves, new Set(collected));
  showScreen('collection', state);
  // Only now is the screen laid out (it was display:none during render), so this
  // is the first moment the shelves can be scrolled back to the top and the
  // "MORE BELOW" marker measured honestly.
  revealCollection();
}

// ─── Settings screen ────────────────────────────────────────────────────

// `view` is what to DRAW: normally the live settings, but while a harder value is
// awaiting its Y/N it is the pending (unsaved) settings, so the player sees what
// they are being asked to keep.
function renderSettingsScreen(view = settings) {
  const rows = getRows();
  const container = $('settings-rows');
  container.innerHTML = rows.map((row, i) => {
    const active = row.active(view);
    const selected = i === state.settingsSelectedRow;
    const descriptor = row.action ? row.descriptor() : row.descriptor(view[row.key]);
    // Value cell: rows with a `summary` (e.g. BLOCKED WORDS) always show their
    // summary text; other action rows show PRESS RETURN/ENTER when selected;
    // ordinary rows show their cycled value. Everything here is fixed-code text
    // or a count derived from sanitized settings — never a user-typed word
    // (those are rendered only in the editor via textContent).
    // The key label is `enterLabel` (RETURN on a Mac, ENTER elsewhere) — never a
    // hard-coded word (CLAUDE.md §Platform Key Label): the boot-time
    // [data-enter-key] swap cannot reach HTML rendered later, like this.
    let valueCell;
    if (typeof row.summary === 'function') valueCell = row.summary(view);
    else if (row.action) valueCell = selected ? `PRESS ${enterLabel}` : '';
    else valueCell = row.display(view[row.key]);
    const cls = ['settings-row', selected ? 'selected' : '', active ? '' : 'inactive'].filter(Boolean).join(' ');
    return `
      <div class="${cls}">
        <span class="settings-row-cursor">&gt;</span>
        <span class="settings-row-label">${row.label}</span>
        <span class="settings-row-value">${valueCell}</span>
        ${descriptor ? `<span class="settings-row-descriptor">${descriptor}</span>` : ''}
      </div>`;
  }).join('');
}

function openSettings(returnTo) {
  state.settingsReturn = returnTo;
  state.settingsSelectedRow = 0;
  state.settingsEraseConfirm = false;
  state.settingsPending = null;
  $('settings-erase-confirm').classList.add('hidden');
  $('settings-harder-confirm').classList.add('hidden');
  renderSettingsScreen();
  showScreen('settings', state);
}

// Save + apply a settings change (the one place a value lands in kk-settings from
// the settings screen).
function applySettingsChange(next) {
  Object.assign(settings, saveSettings(next));
  Audio.setEnabled(settings.sound);
  document.documentElement.classList.toggle('no-crt', !settings.crtEffects);
  renderSettingsScreen();
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

  // A HARDER value is waiting for its Y/N (product.md §Choosing a harder rule asks
  // once, Trevor 2026-10-30). Only Y keeps it — and only then is it saved. Every
  // other key (N, Escape, Tab, an arrow, anything) keeps the easier value already in
  // `settings` and is consumed by the question, the same never-trap, never-act-on-
  // ambiguity shape as the erase confirm above. Nothing was written to kk-settings
  // while the question was up, so closing the tab here keeps the easier value too.
  if (state.settingsPending) {
    const pending = state.settingsPending;
    state.settingsPending = null;
    $('settings-harder-confirm').classList.add('hidden');
    if (e.key === 'y' || e.key === 'Y') applySettingsChange(pending);
    else renderSettingsScreen();
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
    const { next, confirm } = previewRowChange(settings, state.settingsSelectedRow, dir);
    if (confirm) {
      // Show the harder value and ask; do NOT save it, do NOT apply it.
      state.settingsPending = next;
      $('settings-harder-text').textContent = confirm; // fixed literal from settings.js ROWS
      $('settings-harder-confirm').classList.remove('hidden');
      renderSettingsScreen(next);
      return;
    }
    applySettingsChange(next);
  } else if (e.key === 'Enter' || e.key === ' ') {
    const row = rows[state.settingsSelectedRow];
    if (row.action && row.key === 'erase') {
      state.settingsEraseConfirm = true;
      // Name what Y destroys — on a shared family machine "ERASE EVERYTHING?" did
      // not say whose games go. A count only (never a name), fixed-literal words.
      const n = Slots.count();
      $('settings-erase-text').textContent = n === 0
        ? 'NO SAVED GAMES TO ERASE. RESET ANYWAY?'
        : n === 1 ? 'ERASE 1 SAVED GAME?' : `ERASE ALL ${n} SAVED GAMES?`;
      $('settings-erase-confirm').classList.remove('hidden');
    } else if (row.action && row.editor === 'blockwords') {
      // Save the current settings first (cheap, keeps kk-settings consistent),
      // then open the dedicated free-text editor. Escape there returns here.
      saveSettings(settings);
      openBlockWords();
    }
  } else if (e.key === 'Escape' || e.key === 'Tab') {
    saveSettings(settings);
    closeSettings();
  }
}

// ─── Blocked-words editor (parent-facing free-text safety control) ──────────
// A parent can ADD words the game must never show (additive to the built-in
// kid-safety FLOOR in word-blocklist.js) and REMOVE their own additions. The
// floor is NEVER shown here and NEVER removable — the only list this screen
// touches is settings.blockedWords (the additive parent layer). Typed words are
// UNTRUSTED free text (security.md rule 7): every add is sanitized at the
// boundary (lowercased, stripped to [a-z], length 2–20, deduped, capped at 40 —
// via saveSettings → sanitizeBlockedWords) and every word is rendered with
// textContent only (rule 1), never innerHTML. One Rule: this can only make play
// SAFER; Escape always exits cleanly to Settings.

function setBlockStatus(msg) {
  const el = $('blockword-status');
  if (el) el.textContent = msg || '';   // textContent — never a DOM sink
}

function renderBlockWordsList() {
  const list = $('blockword-list');
  if (!list) return;
  list.textContent = '';   // clear without innerHTML
  const words = Array.isArray(settings.blockedWords) ? settings.blockedWords : [];
  if (words.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'blockwords-empty';
    empty.textContent = 'NO EXTRA WORDS YET';
    list.appendChild(empty);
    return;
  }
  if (state.blockWordsSelected >= words.length) state.blockWordsSelected = words.length - 1;
  if (state.blockWordsSelected < 0) state.blockWordsSelected = 0;
  words.forEach((w, i) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'blockword-chip' + (i === state.blockWordsSelected ? ' selected' : '');
    const label = document.createElement('span');
    label.className = 'blockword-chip-text';
    label.textContent = w;             // parent-typed word — textContent ONLY
    const x = document.createElement('span');
    x.className = 'blockword-chip-x';
    x.textContent = 'X';
    chip.appendChild(label);
    chip.appendChild(x);
    // Mouse path for a parent: click a chip to remove that (parent-added) word.
    chip.addEventListener('click', () => { removeBlockWord(i); });
    list.appendChild(chip);
  });
}

function addBlockWord() {
  const inputEl = $('blockword-input');
  if (!inputEl) return;
  // Sanitize at the boundary — allowlist [a-z], length 2–20.
  const clean = String(inputEl.value || '').toLowerCase().replace(/[^a-z]/g, '');
  inputEl.value = '';
  if (clean.length < 2 || clean.length > 20) {
    setBlockStatus(clean.length ? 'USE 2-20 LETTERS' : '');
    return;
  }
  // Already covered by the built-in floor OR already added → don't add a
  // duplicate/floor chip. (This is how the floor stays invisible + immutable
  // here: a floor word is "already blocked", never a removable parent chip.)
  if (isBlockedWord(clean)) {
    setBlockStatus('ALREADY BLOCKED');
    const idx = (settings.blockedWords || []).indexOf(clean);
    if (idx >= 0) { state.blockWordsSelected = idx; renderBlockWordsList(); }
    return;
  }
  if ((settings.blockedWords || []).length >= 40) {
    setBlockStatus('LIST FULL (40)');
    return;
  }
  const nextList = [...(settings.blockedWords || []), clean];
  // saveSettings sanitizes + persists + re-installs the live filter
  // (setUserBlockedWords), so the new word takes effect immediately.
  Object.assign(settings, saveSettings({ ...settings, blockedWords: nextList }));
  const idx = settings.blockedWords.indexOf(clean);
  state.blockWordsSelected = idx >= 0 ? idx : Math.max(0, settings.blockedWords.length - 1);
  setBlockStatus(`ADDED "${clean.toUpperCase()}"`);
  renderBlockWordsList();
}

function removeBlockWord(i) {
  // Removes ONLY from the additive parent layer (settings.blockedWords). There
  // is no path here to a floor word — floor words are never in this list, and
  // isBlockedWord() keeps them blocked regardless. Additive-only guaranteed.
  const words = (settings.blockedWords || []).slice();
  if (i < 0 || i >= words.length) return;
  const removed = words.splice(i, 1)[0];
  Object.assign(settings, saveSettings({ ...settings, blockedWords: words }));
  if (state.blockWordsSelected >= words.length) {
    state.blockWordsSelected = Math.max(0, words.length - 1);
  }
  setBlockStatus(removed ? `REMOVED "${removed.toUpperCase()}"` : '');
  renderBlockWordsList();
  const inputEl = $('blockword-input');
  if (inputEl) inputEl.focus();
}

function openBlockWords() {
  state.blockWordsSelected = 0;
  showScreen('blockwords', state);      // sets state.screen = 'blockwords'
  const inputEl = $('blockword-input');
  if (inputEl) inputEl.value = '';
  setBlockStatus('');
  renderBlockWordsList();
  // Focus after the screen is visible so the caret lands in the add box.
  requestAnimationFrame(() => { if (inputEl) inputEl.focus(); });
}

function closeBlockWords() {
  const inputEl = $('blockword-input');
  if (inputEl) inputEl.blur();
  // Persist (belt-and-suspenders; every op already saved) and refresh the
  // Settings screen so the BLOCKED WORDS count summary is current.
  saveSettings(settings);
  renderSettingsScreen();
  showScreen('settings', state);
}

function handleBlockWordsKey(e) {
  const inputEl = $('blockword-input');
  if (e.key === 'Escape') {
    e.preventDefault();
    closeBlockWords();
    return;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    addBlockWord();
    return;
  }
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    const words = settings.blockedWords || [];
    if (words.length === 0) return;
    const dir = e.key === 'ArrowDown' ? 1 : -1;
    state.blockWordsSelected = (state.blockWordsSelected + dir + words.length) % words.length;
    renderBlockWordsList();
    return;
  }
  if (e.key === 'Backspace' && inputEl && inputEl.value === '') {
    // Empty box + Backspace removes the highlighted parent word (tag-input
    // idiom). Never touches the floor (those words aren't in this list).
    e.preventDefault();
    const words = settings.blockedWords || [];
    if (words.length > 0) removeBlockWord(state.blockWordsSelected);
    return;
  }
  // All other keys (letters, and Backspace while the box has text) flow to the
  // native input untouched — this is a parent-facing text field, not the kid's
  // typing mechanic (mirrors the name-entry field).
}

// ─── Act 6 — Text Worlds: the bonus act's entry/exit ────────────────────────
// Entered from the select screen's bonus-act sub-state (state.wingIndex). Runs as a
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
  focusDoor(state, 'textworld');   // land back on the act page we came through
  syncSelectHeading();
  showScreen('select', state);
  renderSelectScreen(state);
}

// ─── Act 7 — The Speedway: the second bonus act ─────────────────────────────
// The exact analogue of enterTextWorld above: a parallel screen ('speedway') on
// the shared canvas with its own hub, entered from that act's wall of cabinets.
// The 25-level pattern engine (handleGameKey/buildPatterns) is never involved, and no
// survival timer is ever started here — the wing inherits zero time pressure.
//
// The hub is imported LAZILY rather than statically, for one reason: this wing
// is a bonus room, and a bonus room must never be able to take the whole game
// down with it. On static hosting (tmack8001.github.io) a missing or 404'ing
// js/speedway/* would abort main.js's module graph at load and brick all 25
// levels; loaded on demand, a failure costs exactly one warm "still under
// construction" card and the player walks straight back into the arcade. Same
// silent-static-fallback posture as wordgen (security.md rule 6).
let Speedway = null;          // the js/speedway/hub.js namespace, once loaded
let speedwayLoading = false;  // a second Space while it loads must not re-enter

// `trackId` is the cabinet the player walked up to on Act 7's wall (a track id
// from js/speedway/tracks/*, or null when the act was entered through its door).
// The hub is the wing's own chooser — this asks it, best-effort, to open standing
// at the same machine; a hub build without that courtesy simply opens on its own
// cursor, which is never a failure (feature-detected, silent fallback).
let pendingTrackId = null;

function enterSpeedway(trackId) {
  if (speedwayLoading) return;
  pendingTrackId = trackId || null;
  stopAll();
  if (Speedway) { startSpeedwayHub(); return; }
  speedwayLoading = true;
  showSpeedwayCard('speedway-loading');
  // Load the hub AND the track registry together. The hub keeps its injected-registry
  // shape (it falls back to a built-in TEST OVAL so the door never opens on an empty
  // room), but a player must actually reach the real era tracks — without this the
  // placeholder is the whole wing. Both are STATIC specifiers inside the dynamic
  // import, so scripts/static-host-check.mjs crawls the subtree and a missing track
  // file is caught by the gate rather than shipping as a live 404 (journal F26).
  Promise.all([import('./speedway/hub.js'), import('./speedway/tracks/index.js')])
    .then(([mod, tracksMod]) => {
      speedwayLoading = false;
      Speedway = mod;
      try {
        if (typeof mod.setTracks === 'function' && Array.isArray(tracksMod.TRACKS)) {
          mod.setTracks(tracksMod.TRACKS);
        }
      } catch { /* a bad registry falls back to the hub's own placeholder, never a trap */ }
      if (state.screen !== 'speedway') return;   // the player already walked out
      startSpeedwayHub();
    })
    .catch(() => {
      speedwayLoading = false;
      if (state.screen !== 'speedway') return;
      showSpeedwayCard('speedway-unbuilt');
    });
}

function startSpeedwayHub() {
  try {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    state.screen = 'speedway';
    if (typeof Speedway.focusTrack === 'function' && pendingTrackId) {
      try { Speedway.focusTrack(pendingTrackId); } catch { /* never a trap */ }
    }
    Speedway.start($('invaders-canvas'), {
      onExit: returnToArcadeFromSpeedway,   // ESC from the hub → back to its cabinet
    });
  } catch (err) {
    // A wing that can't start is a disappointment, never a trap (the One Rule).
    Speedway = null;
    showSpeedwayCard('speedway-unbuilt');
  }
}

// The two states the hub can't draw because it isn't up: warming up, and not
// built on this build. Both live on #speedway-screen and both walk back out.
function showSpeedwayCard(id) {
  showScreen('speedway', state);
  $('speedway-loading').classList.toggle('hidden', id !== 'speedway-loading');
  $('speedway-unbuilt').classList.toggle('hidden', id !== 'speedway-unbuilt');
}

function returnToArcadeFromSpeedway() {
  if (Speedway) Speedway.stop();
  focusDoor(state, 'speedway', pendingTrackId);   // land back at the cabinet we came through
  syncSelectHeading();
  showScreen('select', state);
  renderSelectScreen(state);
}

// ─── THE HARDWARE — the third bonus wing ────────────────────────────────────
// Same shape as Act 6 and Act 7, and lazily imported for the same reason: a
// bonus room must never be able to take the whole game down with it. On static
// hosting a missing js/hardware/* would abort main.js's module graph at load and
// brick all 25 levels; loaded on demand, a failure costs one warm card and the
// player walks back into the arcade (journal F26, security.md rule 6).
let Hardware = null;
let hardwareLoading = false;
let pendingStationId = null;

function enterHardware(stationId) {
  if (hardwareLoading) return;
  pendingStationId = stationId || null;
  stopAll();
  if (Hardware) { startHardwareHub(); return; }
  hardwareLoading = true;
  showHardwareCard('hardware-loading');
  import('./hardware/hub.js')
    .then((mod) => {
      hardwareLoading = false;
      Hardware = mod;
      if (state.screen !== 'hardware') return;   // the player already walked out
      startHardwareHub();
    })
    .catch(() => {
      hardwareLoading = false;
      if (state.screen !== 'hardware') return;
      showHardwareCard('hardware-unbuilt');
    });
}

function startHardwareHub() {
  try {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    state.screen = 'hardware';
    if (typeof Hardware.focusStation === 'function' && pendingStationId) {
      try { Hardware.focusStation(pendingStationId); } catch { /* never a trap */ }
    }
    Hardware.start($('invaders-canvas'), {
      onExit: returnToArcadeFromHardware,
      onCard: collectStationCard,
    });
  } catch (err) {
    Hardware = null;
    showHardwareCard('hardware-unbuilt');
  }
}

// A station hands over its guaranteed card the moment the machine wakes. The
// rotation key is NAMESPACED ("hw:<station>") so it cannot collide with a level
// key ("13") in the same string-keyed map — which is why this needed no save
// schema change at all (docs/specs/hardware-wing.md §5.4.2).
// Returns the REVEAL PAYLOAD the wing draws on the way out ({card,isNew,found,
// total}), or null when this station has no cards of its own — in which case the
// wing walks straight back to the wall, exactly as it did before cards existed.
// Crediting still happens HERE, at wake, not at the reveal: the save must not
// depend on the player sitting through a presentation (Act 6's TF-T1 lesson).
function collectStationCard(stationId) {
  if (!Hardware || typeof Hardware.guaranteedCardFor !== 'function') return null;
  const key = `hw:${stationId}`;
  let card = null;
  try {
    card = Hardware.guaranteedCardFor(stationId, Slots.collectedIds(), Slots.getCardRotation(key));
  } catch { card = null; }
  if (!card) return null;     // no station cards authored yet — never an error
  let isNew = false;
  try {
    isNew = Slots.collectCardId(card.id);
    Slots.bumpCardRotation(key);
  } catch { /* a card that can't be saved is never a trap */ }
  let prog = { found: 0, total: 0 };
  try { prog = bankProgress('wing', Slots.collectedIds()); } catch { /* count is cosmetic */ }
  return { card, isNew, found: prog.found, total: prog.total };
}

function showHardwareCard(id) {
  showScreen('hardware', state);
  $('hardware-loading').classList.toggle('hidden', id !== 'hardware-loading');
  $('hardware-unbuilt').classList.toggle('hidden', id !== 'hardware-unbuilt');
}

function returnToArcadeFromHardware() {
  if (Hardware) Hardware.stop();
  focusDoor(state, 'hardware', pendingStationId);
  syncSelectHeading();
  showScreen('select', state);
  renderSelectScreen(state);
}

// The bonus acts → their wings, keyed by the registry row's id and called with
// the id of the machine the player picked on that act's wall (null when the act
// is entered through its door). A third wing is a data row in cabinet-art.js's
// BACK_WALL_DOORS plus one entry here.
const DOOR_ENTRY = {
  textworld: enterTextWorld,
  speedway: enterSpeedway,
  hardware: enterHardware,
};

// ─── Touch-device notice: this cabinet needs a keyboard ───────────────────
//
// Keystroke Kingdom teaches TOUCH TYPING on a physical keyboard. On a phone the
// on-screen keyboard covers roughly half the viewport and hides the very thing
// the player is meant to read, so the game is not playable there today (see
// docs/ROADMAP.md §"Mobile & tablet support" for what a real port would take).
//
// This notice INFORMS, it never GATES — the One Rule holds even here: a player is
// stopped only with joy, never punishment. Two deliberate properties:
//   1. Detection is capability-based (`pointer: coarse` + `hover: none`), never UA
//      sniffing — UA strings lie and every sniff list rots.
//   2. It self-dismisses on the first real keydown, because a keypress PROVES a
//      keyboard is attached. An iPad with a keyboard case, a Chromebook, or a
//      touchscreen laptop therefore sees it for one keystroke and never again —
//      no allowlist to maintain, and we never wrongly lock out a device that works.
function isTouchPrimaryDevice() {
  if (typeof window.matchMedia !== 'function') return false;
  try {
    return (
      window.matchMedia('(pointer: coarse)').matches &&
      window.matchMedia('(hover: none)').matches
    );
  } catch {
    return false; // a browser without these queries gets the normal experience
  }
}

let keyboardNoticeDismissed = false;

function dismissKeyboardNotice() {
  if (keyboardNoticeDismissed) return;
  keyboardNoticeDismissed = true;
  const el = document.getElementById('keyboard-notice');
  if (el) el.classList.add('hidden');
}

function initKeyboardNotice() {
  if (!isTouchPrimaryDevice()) return; // desktop path is byte-identical to before
  const el = document.getElementById('keyboard-notice');
  if (!el) return;
  el.classList.remove('hidden');
  // A real physical keypress is the proof we want; capture so it fires before any
  // screen handler can stopPropagation, and once so it costs nothing afterwards.
  document.addEventListener('keydown', dismissKeyboardNotice, { capture: true, once: true });
}

// The WOPR/joshua bypass is no longer only a dev shortcut — it is the ONLY way to
// reach Act 6 and Act 7 before Level 25, so real play happens behind it. But typing it
// on the TITLE screen skips name entry, so no saved game exists, and everything that
// persists then commits to nothing: the secret WarGames card never lands, and Act 7's
// ghost, odometer and lap count all evaporate (the wing said "never driven" after three
// laps). docs/ROADMAP.md had filed this as "fine as a dev path, revisit only if it
// becomes a real player path" — it became one.
//
// So: entering the bypass guarantees a game to write into. If one already exists we use
// it untouched; otherwise we create one under the default name, exactly as a first-time
// player's first name-confirm would. Nothing is overwritten, and a player who later
// names themselves renames this game rather than getting a second one.
function ensureGameForBypass() {
  try {
    // `getActive()` returns the active slot's INDEX, and **index 0 is falsy**.
    // Written as `if (Slots.getActive()) return`, this guard failed for slot 0 —
    // which is every family's FIRST save, i.e. the single most common case in the
    // game. Confirmed by a playtest lane, 2026-09-13, from a real cold open: name
    // yourself, then type the documented `joshua` easter egg the game itself
    // rewards you for finding, and you silently get a SECOND slot with the same
    // name. On reload the picker shows two identical rows and the cursor defaults
    // to the empty orphan, so Space resumes the wrong one and the collected card
    // is gone. Not a punishment in the One Rule sense, but a silent progress fork
    // a family could neither explain nor undo. Compare against null explicitly.
    if (Slots.getActive() !== null) return;
    Slots.createSlot(settings.playerName || 'Player One');
  } catch { /* storage refused — the bypass still works, it just won't persist */ }
}

document.addEventListener('keydown', (e) => {
  switch (state.screen) {
    case 'slots': {
      // Slot picker ("CHOOSE YOUR GAME") — the returning-player front door.
      // Rows = one per saved game + a trailing "＋ NEW GAME" row (index == count).
      // Navigate ↑/↓ (or number keys for the first nine games); Space/Enter
      // resumes a game or, on the NEW GAME row, starts one; N = new game; X =
      // erase highlighted game (Y/N confirm); C = browse its cards; R = rename it
      // (the only rename path); Escape → attract, adopting the highlighted game.
      e.preventDefault();
      const slots = pickerSlots();
      const rows = slots.length + 1;          // +1 for the NEW GAME row
      const newRow = slots.length;            // index of the NEW GAME row
      let sel = state.slotsSelected;
      if (sel >= rows) sel = state.slotsSelected = rows - 1; // clamp after an erase

      if (state.slotsEraseConfirm) {
        // Only Y erases; N or ANY other key backs out — never trap the child.
        if ((e.key === 'y' || e.key === 'Y') && sel < slots.length) Slots.eraseSlot(sel);
        state.slotsEraseConfirm = false;
        const after = pickerSlots();
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
      } else if (e.key === 'r' || e.key === 'R') {
        if (sel < slots.length) startRenameFlow(sel);
      } else if (e.key === 'Escape') {
        // Back to the attract title (settings via Tab, WOPR phrases, etc.).
        // The HIGHLIGHTED game becomes the active one, so whatever is played next —
        // the WOPR shortcut included — is credited to the game the player last
        // pointed at (levels/onboarding.md §Which game is playing). A Level 11 win
        // was once credited to the previously-resumed game this way. On the NEW
        // GAME row the active game is left as it was.
        if (sel < slots.length) {
          Slots.setActive(sel);
          syncActiveIdentity();
        }
        showAttractTitle();
      }
      break;
    }

    case 'collection':
      // Read-only card gallery. Any of Escape/Space/Enter returns to the picker;
      // the arrow/page/home/end keys scroll the shelves, because the shelves are
      // taller than the screen and this is a keyboard-first game — a child should
      // never need a mouse to see the bottom of her own collection.
      e.preventDefault();
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        showSlotsScreen();
      } else {
        scrollCollection(e.key);
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
        if ((e.key === ' ' || e.key === 'Enter') && Slots.anySlotExists()) {
          // Saved games exist: the picker is the front door, never name entry —
          // which would rename whichever game is active (levels/onboarding.md
          // §The arcade from READY). Name entry stays for a brand-new machine.
          e.preventDefault();
          secretBuffer = '';
          Audio.coin();
          showSlotsScreen();
        } else if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          state.coinInserted = true;
          secretBuffer = '';
          $('wopr-text').textContent = '';
          Audio.coin();
          $('insert-coin').classList.add('hidden');
          $('reboot-hint').classList.add('hidden');
          $('settings-hint').classList.add('hidden');
          $('name-label').textContent = NAME_LABEL_NEW;
          $('name-confirm-verb').textContent = 'TO START';
          $('name-setup').classList.remove('hidden');
          // Prefill from settings.playerName, then select it so the first
          // typed character natively overwrites the whole default (dimmed
          // "ready to be overwritten" behavior — onboarding.md §Name Entry).
          // Backspace clears the selection normally; an empty confirm keeps it.
          prefillNameField(settings.playerName || '');
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
            ensureGameForBypass();   // so the card — and Act 7's ghosts — have somewhere to land
            Slots.collectCardId(WARGAMES_CARD_ID);
            // WOPR is the dev/parent bypass: every cabinet is selectable,
            // regardless of saved progress.
            state.selectBypass = true;
            state.selectedLevel = 1;
            syncActiveIdentity();
            showSelect();
          } else if (EGGS[secretBuffer]) {
            e.preventDefault();
            showEggResponse(EGGS[secretBuffer]);
          }
        }
      } else {
        if (e.key === 'Enter') {
          e.preventDefault();
          const input = $('player-name-input').value.trim().toUpperCase();
          let name = input || 'PLAYER ONE';
          // The picker's labelled RENAME: the ONLY path that changes a saved
          // game's name. It returns to the picker, not into play.
          if (state.renameSlot !== null) {
            finishRename(name);
            break;
          }
          // Resolve which save this name belongs to:
          //   • a pending NEW GAME (from the slot picker) → append a new game,
          //   • genuine first-time player (no games yet) → create the first game,
          //   • otherwise an ACTIVE game exists and this is NOT a rename: the name
          //     field must never rename it silently (that is how DAD became WOPR,
          //     2026-10-30). Every route from a saved game now skips name entry, so
          //     this is defensive — keep the game's own name and write nothing.
          //   • WOPR dev bypass into an existing machine with no active game →
          //     ephemeral: set the name only, persist nothing.
          if (state.pendingNewGame) {
            Slots.createSlot(name);
            state.pendingNewGame = false;
          } else if (Slots.getActive() !== null) {
            name = Slots.activeName() || name;
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
        } else if (e.key === 'Escape' && state.renameSlot !== null) {
          // Backing out of RENAME: name unchanged, back to the picker.
          e.preventDefault();
          finishRename(null);
        } else if (e.key === 'Escape' && state.pendingNewGame && Slots.anySlotExists()) {
          // Backing out of NEW GAME: nothing created, back where it was started.
          e.preventDefault();
          $('name-label').textContent = NAME_LABEL_NEW;
          $('name-confirm-verb').textContent = 'TO START';
          showSlotsScreen();
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
        secretBuffer = '';
        if (Slots.getActive() !== null) {
          // A saved game: Escape reaches the arcade (levels/onboarding.md §The
          // arcade from READY). It used to re-open name entry, where typing +
          // Return silently renamed this game — renaming is now the picker's R.
          showArcadeFromReady();
        } else {
          // No saved game to protect (storage refused, or the ephemeral WOPR
          // bypass): the old path back to the name field.
          applyLevelTheme(1);
          showNameEntry(NAME_LABEL_NEW, settings.playerName || '');
        }
      } else if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
        secretBuffer += e.key.toLowerCase();
        if (SECRET_PHRASES.includes(secretBuffer)) {
          e.preventDefault();
          secretBuffer = '';
          Audio.start();
          ensureGameForBypass();   // so the card — and Act 7's ghosts — have somewhere to land
          Slots.collectCardId(WARGAMES_CARD_ID); // secret WarGames card
          state.selectBypass = true; // WOPR dev/parent bypass — unlock all cabinets
          state.selectedLevel = 1;
          showSelect();
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
        showSelect();
      }
      break;

    case 'settings':
      handleSettingsKey(e);
      break;

    case 'blockwords':
      handleBlockWordsKey(e);
      break;

    case 'victory':
      e.preventDefault();
      clearTimeout(state.victoryTimer);
      showCompleteOverlay();
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
          showSelect();
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
          }, { skippable: state.firstClear === false });
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
          }, { skippable: state.firstClear === false });
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
          }, { skippable: state.firstClear === false });
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
          }, { skippable: state.firstClear === false });
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

    // The act cinematics. Each module decides what a key means (first viewing:
    // no skipping; replay: Space/Escape skip; title card: Space only) — main.js
    // just hands it the key. A HELD key's auto-repeat is never a decision.
    case 'mystery':
      e.preventDefault();
      if (!e.repeat) Mystery.confirm(e.key);
      break;

    case 'basement':
      e.preventDefault();
      if (!e.repeat) Basement.confirm(e.key);
      break;

    case 'commandcenter':
      e.preventDefault();
      if (!e.repeat) CommandCenter.confirm(e.key);
      break;

    case 'fullcircle':
      e.preventDefault();
      if (!e.repeat) FullCircle.confirm(e.key);
      break;

    case 'textworld':
      // Act 6 Text Worlds. The hub owns Escape internally (world → chooser →
      // arcade); every other key is world input.
      e.preventDefault();
      TextWorldHub.handleKey(e);
      break;

    case 'speedway':
      // Act 7 The Speedway. Same shape as Act 6: the hub owns Escape internally
      // (track → chooser → arcade); every other key is the wing's input.
      e.preventDefault();
      if (Speedway && Speedway.isActive()) { Speedway.handleKey(e); break; }
      // The hub isn't up — either still loading, or not built on this build. On
      // the "still building it" card ANY key walks back out to the arcade; while
      // it's still loading, Escape does. Never a dead end (the One Rule).
      if (!speedwayLoading || e.key === 'Escape') returnToArcadeFromSpeedway();
      break;

    case 'hardware':
      // THE HARDWARE. Same shape as Acts 6 and 7: the hub owns Escape internally
      // (station → wall → arcade); every other key is the wing's input.
      e.preventDefault();
      if (Hardware && Hardware.isActive()) { Hardware.handleKey(e); break; }
      if (!hardwareLoading || e.key === 'Escape') returnToArcadeFromHardware();
      break;

    case 'select':
      e.preventDefault();
      if (e.key === 'f' || e.key === 'F') {
        if (focusedDoor(state)) break; // free play doesn't apply in a bonus act
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
        const picked = focusedWingEntry(state);
        if (picked) {
          const enterWing = DOOR_ENTRY[picked.wing.id];
          if (enterWing) enterWing(picked.entry && picked.entry.id);
          break;
        }
        // Guard: never enter a locked cabinet (belt-and-suspenders — the
        // cursor can't normally land on one, but the WOPR bypass or a stale
        // selection shouldn't slip a locked level through).
        if (isLevelLocked(state, state.selectedLevel)) break;
        state.level = state.selectedLevel;
        if (Slots.getActive() !== null) {
          // A saved game: straight to READY, never through name entry (which
          // would rename it — levels/onboarding.md §The arcade from READY).
          showReadyForActiveGame();
        } else {
          applyLevelTheme(1);
          showNameEntry(NAME_LABEL_NEW, settings.playerName || '');
        }
      } else if (e.key === 'Escape') {
        state.freePlay = false;
        clearDoorFocus(state);       // leaving the select screen clears the bonus-act sub-state
        // The ordinary route (a saved game, no WOPR) came from the picker side of
        // the house, so it goes back there; the WOPR route goes back to a CLEAN
        // attract title (it used to reveal a still-live name field).
        if (!state.selectBypass && Slots.anySlotExists()) showSlotsScreen();
        else showAttractTitle();
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
  // Tell a touch-only visitor this cabinet wants a keyboard — informational only,
  // never a gate, and gone the moment a real key proves one is attached.
  initKeyboardNotice();
  initNameField();
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
