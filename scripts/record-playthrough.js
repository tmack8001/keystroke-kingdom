#!/usr/bin/env node
/*
 * =============================================================================
 * Keystroke Kingdom — Deterministic, Human-Paced Playthrough Recorder
 * =============================================================================
 *
 * PURPOSE
 *   Records a genuine, human-paced playthrough of Keystroke Kingdom to a .mov,
 *   so docs/keystroke_kingdoms.mov can be regenerated on demand and reviewed
 *   like a real play session. All player-input TIMING is seeded, so the same
 *   seed reproduces the same input track (see DETERMINISM below).
 *
 * QUICK START
 *   # serve the repo somewhere (this recorder never reads .dev-url):
 *   python3 -m http.server 8130 --directory /Users/trevormack/dev/keystroke-kingdom
 *   # then record:
 *   DEV_URL=http://127.0.0.1:8130 node scripts/record-playthrough.js \
 *       --levels=1-3 --profile=kid --out=/tmp/kk.mov
 *
 * THREE RECORDING MODES
 *   full (default)     --levels=<spec> plays min..max linearly. If min > 1 the
 *                      recorder WOPR-jumps straight to that level first.
 *   per-level          --single-level=N records exactly one level.
 *   per-act            --act=N records one act (act1=1-5 ... act5=21-25),
 *                      INCLUDING the closing transition cinematic its last
 *                      level triggers (cinematic-ownership convention below).
 *
 * CLI FLAGS
 *   --out=<path>       output .mov. DEFAULT docs/keystroke_kingdoms.mov for
 *                      full mode; kk-level-NN.mov / kk-act-N.mov next to that
 *                      directory for the other modes. (During testing ALWAYS
 *                      pass a scratchpad path — never clobber the tracked
 *                      reference video with the default.)
 *   --levels=<spec>    "1-25" (range), "1-3", or "1,3,5". DEFAULT 1-25.
 *   --single-level=N   record EXACTLY one level (1-25). See PARALLEL RECIPE.
 *   --act=N            record one act (1-5). See CINEMATIC OWNERSHIP.
 *   --fresh-open       (--act=1 only) instead of the uniform WOPR entry,
 *                      clear storage and record the genuine first-time opening
 *                      (title -> name entry -> READY -> level 1), so a
 *                      stitched film can use act 1 as its true beginning.
 *   --profile=<name>   "kid" (default, ~1.5-3 keys/sec, slow on new keys,
 *                      think-pauses) or "steady" (~4 keys/sec adult pace).
 *   --seed=<int>       PRNG seed. DEFAULT 1979. Same seed => same input track.
 *   --name=<str>       player name typed at name entry. DEFAULT "OONA".
 *   --url=<url>        base URL override. Else DEV_URL env. Else hard error.
 *                      (We NEVER read .dev-url — other agents own that file.)
 *   --headed           run with a visible browser window (debugging only).
 *   --keep-webm        keep the intermediate .webm next to the .mov.
 *
 * EXIT CODES
 *   0 = completed the requested run.  2 = bad usage.
 *   3 = STALL WATCHDOG fired (no observed game progress for 90s) — the run is
 *       marked failed:true in the summary; the video is STILL finalized so the
 *       stall can be inspected on film.  1 = unexpected fatal error.
 *
 * CINEMATIC OWNERSHIP (per-act segments, for later stitching)
 *   Each act segment INCLUDES the transition cinematic its last level
 *   triggers: mystery after L5 (act1), basement after L10 (act2),
 *   commandcenter after L15 (act3), fullcircle after L20 (act4).
 *   - Acts 1-3: the cinematic plays fully; the segment ends right after the
 *     Space press at the next act's title card lands.
 *   - Act 4: fullcircle has NO title card — it lands directly in Level 21's
 *     flow. The segment ends the moment Level 21's state is reached; the
 *     summary notes overlapsIntoLevel:21 so a stitcher knows to trim.
 *   - Act 5: ends on Level 25's completion overlay; no trailing cinematic.
 *
 * PARALLEL RECIPES
 *   Every invocation is fully self-contained: its own Chromium instance, its
 *   own browser context (= its own localStorage), its own temp video dir. So
 *   N invocations can run concurrently against ONE static server. All modes
 *   share resolution (1280x800), codec (libx264 yuv420p) and container flags,
 *   so a later `ffmpeg -f concat` stitch is possible — stitching itself is
 *   deliberately NOT this script's job.
 *
 *   # 25-way per-level:
 *     python3 -m http.server 8130 --directory <repo>
 *     for n in $(seq 1 25); do
 *       DEV_URL=http://127.0.0.1:8130 node scripts/record-playthrough.js \
 *         --single-level=$n --profile=kid \
 *         --out=/path/segments/kk-level-$(printf %02d $n).mov \
 *         > /path/segments/level-$n.summary.json 2>/path/segments/level-$n.log &
 *     done; wait
 *
 *   # 5-way per-act (act 1 with the true opening):
 *     for a in 1 2 3 4 5; do
 *       extra=""; [ "$a" = 1 ] && extra="--fresh-open"
 *       DEV_URL=http://127.0.0.1:8130 node scripts/record-playthrough.js \
 *         --act=$a $extra --profile=kid \
 *         --out=/path/segments/kk-act-$a.mov \
 *         > /path/segments/act-$a.summary.json 2>/path/segments/act-$a.log &
 *     done; wait
 *
 *   NOTE: jump entries use the WOPR select bypass, which unlocks every
 *   cabinet regardless of kk-progress (js/ui/cabinet-art.js isLevelLocked
 *   returns false when state.selectBypass is set) — verified 2026-07-12, so
 *   NO localStorage seeding is needed for un-earned levels.
 *
 * =============================================================================
 * GAME-FLOW KNOWLEDGE (learned by reading js/main.js, js/ui/screens.js,
 * js/ui/hud.js, js/levels.js, js/mystery.js, js/fullcircle.js — and by the
 * 2026-07-12 level-8 stall post-mortem).
 * =============================================================================
 *
 * SCREEN STATE MACHINE (main.js `state.screen`, one global keydown listener):
 *   title -> (Space/Enter inserts coin) -> title+name-setup ->
 *   (Enter confirms name) -> ready -> (Space) -> keyboard-preview ->
 *   (Space) -> game -> (level complete) -> victory -> (any key/4s) ->
 *   complete -> (Space) -> next ready  (or a cinematic at L5/10/15/20)
 *
 *   `state` is a CLOSURE inside main.js — NOT on window. So we detect the
 *   current screen from the DOM instead (see detectScreen below):
 *     - Exactly one `.screen` element lacks `.hidden` => that's the screen
 *       (id is "<name>-screen").
 *     - During a CINEMATIC (mystery/basement/commandcenter/fullcircle) main.js
 *       hides ALL `.screen` elements and draws on #invaders-canvas. So
 *       "zero visible .screen elements" == a cinematic is playing.
 *     - Name entry is title-screen with #name-setup un-hidden.
 *
 * WHICH LEVEL IS THIS? — OBSERVED, NEVER ASSUMED (2026-07-12 lesson)
 *   The old recorder assumed level numbers from its own loop counter; when a
 *   level stalled, the labels silently drifted from reality (the "levels
 *   16-25 at uniform ~528s intervals" summary was fiction — guard-loop
 *   expiries, not observations). Also, --levels never actually skipped: the
 *   game always started at level 1 while the recorder labeled it min(spec).
 *   The ONLY trustworthy source is the HUD badge: #level-badge-text renders
 *   the level's name, always "LEVEL <n>" (js/levels.js). We parse it whenever
 *   the game screen is active and record a level start ONLY when the observed
 *   badge number changes.
 *
 * THE STALE-PROMPT WINDOW (root cause of the 2026-07-12 level-8 stall)
 *   main.js handleGameKey defers DOM updates after a correct press:
 *     - mid-word: the next letter's `.active` class is added in a
 *       setTimeout(150) (main.js ~513);
 *     - on pattern completion: getNextPattern() + renderPrompt() run in a
 *       setTimeout(300) (main.js ~506-511).
 *   So there are windows where the DOM prompt does not reflect the engine.
 *   Additionally, once a level's initial pattern list is exhausted before the
 *   theme's win gate fires, main.js getNextPattern() returns
 *   drawRandomPattern() — A FRESH INDEPENDENT RANDOM DRAW PER CALL — so the
 *   rendered prompt and the pattern the engine validates against become
 *   DIFFERENT random words (game-side finding, documented in the post-mortem;
 *   not something a recorder can fix).
 *   RECORDER RULES derived from this:
 *     1. Re-read the expected token from the DOM immediately before EVERY
 *        press. Never press a cached token.
 *     2. "No .active prompt letter" == transition in progress: wait ~100ms
 *        and re-read; it is never a token.
 *     3. VERIFY every press: the HUD streak counter (#hud-streak) is updated
 *        synchronously by handleGameKey — a correct press sets it to
 *        previous+1, a wrong press resets it to 0. An intended-correct press
 *        that doesn't register is counted as a rejectedPress (should be ~0;
 *        a burst of them means prompt/engine desync).
 *     4. A STALL WATCHDOG aborts the run (exit 3, video still finalized)
 *        after 90s with no observed progress, instead of looping forever.
 *
 * PER-LEVEL FLOW (game screen):
 *   The current prompt is a sequence of "prompt-letter" divs in
 *   #prompt-sequence. The ACTIVE one has class `.active` and `data-index=i`.
 *   We read the expected key from the active letter's textContent and reverse
 *   the display mapping (promptDisplay in hud.js):
 *       '?' -> ';'   (the eighth key)     '␣' -> ' '  (space)
 *       '⌫' -> 'Backspace'                 '⇧' -> Shift (display only)
 *       anything else -> the char as-is. textContent preserves case even
 *       though css text-transform:uppercase makes everything LOOK uppercase
 *       on screen — so textContent 'A' really means Shift+a, and a lowercase
 *       'a' arrives as 'a' no matter how it renders.
 *   The #kk-prompt-caption element (small-glyph captions, hud.js 2026-07-11)
 *   is a SIBLING inserted after #prompt-sequence, so it never pollutes the
 *   .prompt-letter textContent reads.
 *   ENGINE INPUT CONTRACT (main.js handleGameKey):
 *     - lowercase letters/digits/symbols: press the key directly.
 *     - uppercase A-Z token: the engine exact-matches e.key === 'A'. In
 *       Playwright, press the UPPERCASE descriptor ('A'); down('Shift') +
 *       press('a') dispatches e.key='a' and is silently rejected (this was
 *       a latent bug that made Level 24 untypeable — fixed 2026-07-12).
 *     - ' ': Space. 'Backspace': Backspace.
 *     - Pure modifier keydowns are ignored entirely (never a mistake) — safe.
 *   WRONG-KEY CONTRACT (the heart of the product, shown deliberately on camera):
 *     - Wrong key -> gentle nudge, the letter WAITS (does not advance), mistake
 *       logged to that letter, streak resets. Correct key then advances
 *       normally, NO double penalty. => Our injected wrong keys are harmless.
 *       We only inject a real single character different from the expected
 *       token, then immediately re-read and type the correct one.
 *
 *   LEVEL-END DETECTION: when the level completes, main.js hides .game-area
 *   and moves to `victory` (4s) then `complete` (#complete-overlay loses
 *   .hidden). We watch for either; we never keypress during victory (it
 *   would cut the theme's victory beat short).
 *
 * SETTINGS: we never touch them. Default = ADVENTURE mode, sound ON, CRT ON.
 *   Survival is never enabled. (Recording keeps the canonical experience.)
 *
 * =============================================================================
 * DETERMINISM
 * =============================================================================
 *   ALL player-input timing flows from a single seeded mulberry32 PRNG. Given
 *   the same --seed, the sequence of think-pauses, per-key jitter, and
 *   wrong-key injections is identical run to run. The INPUT track is therefore
 *   reproducible; game-side visuals/word order are not (buildPatterns and the
 *   themes use unseeded Math.random()) — we read every expected key live from
 *   the DOM, so the recorder stays correct regardless.
 * =============================================================================
 * TRANSCRIPT ARTIFACTS (emitted on EVERY run, as siblings of --out)
 * =============================================================================
 *   <base>.transcript.jsonl  — machine-readable event stream; one JSON object
 *     per line, each carrying tSec (video-relative seconds). Event types:
 *       pattern_shown    {text, index, source}   full visible letter sequence
 *                        when a prompt renders/advances; source = initial-pool
 *                        (still inside the curriculum intro+shuffle list) or
 *                        past-pool (drawn randomly after the list is exhausted)
 *       press            {expected, pressed, outcome, streakAfter}
 *                        outcome = accepted | rejected | injected_wrong
 *       pattern_complete {text, sequencesCompleted}
 *       card_word_shown  {word}    when the visible pattern IS the level's
 *                        history-card moment word (js/history-cards.js)
 *       level_start / level_end   {level}
 *       cinematic        {name, afterLevel}
 *       win              {sequencesCompleted, totalPresses, rejectedPresses}
 *       hand_balance     {scope:'level'|'run', level?, keystroke:{left,right,
 *                        neutral,ratioLR,rightShare}, keySetRightShare,
 *                        leanDelta, alternationPlayed, singleHand:{words,
 *                        rightOnly,leftOnly,share,rightOnlyList,leftOnlyList},
 *                        variability:{served,distinctServed,repeatRate}}
 *                        — hand classification derives from FINGER_MAP in
 *                        js/levels.js (space/Backspace/Shift = neutral). One per
 *                        level plus one run-level summary, emitted at finalize.
 *                        These are Trevor's Q*bert metrics: L:R keystroke
 *                        balance, hand-alternation rate, single-hand words, and
 *                        distinct-vs-repeated served patterns. The static pool
 *                        counterpart is scripts/analyze-hand-balance.mjs, which
 *                        also post-processes these same transcripts
 *                        (--transcript <file.jsonl>).
 *   <base>.transcript.md   — human timeline rendered from the jsonl: a
 *     (time | visible sequence | typed | outcome) table with pattern
 *     boundaries, wrong-key moments bolded, the win row, and a header summary.
 *     THIS is the per-level success-validation artifact (video = what it looked
 *     like; transcript = proof of what happened).
 *
 *   The transcript instruments the SAME observation machinery already used to
 *   drive input (the gameSnapshot DOM reads + the #hud-streak oracle). We read
 *   the full visible sequence from #prompt-sequence's .prompt-letter divs,
 *   reverse-mapping each display glyph exactly as the expected-token read does
 *   ('?'->';' '␣'->' ' '⌫'->Backspace, case preserved for Shift tokens).
 * =============================================================================
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { execFileSync, spawnSync } = require('child_process');

// Playwright comes from the shared resolver in kk-playwright.js — never a hard-coded
// npx cache path, which rots as soon as the cache is rebuilt or the package upgrades.
const { playwright: PLAYWRIGHT_MODULE } = require('./kk-playwright');
const FFMPEG = '/usr/local/bin/ffmpeg';
const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_OUT = path.join(REPO_ROOT, 'docs', 'keystroke_kingdoms.mov');

// No observed game progress for this long => the run is declared stalled,
// aborted, and the video finalized for inspection. Cinematics (~50s dwell,
// fed per-second while playing) and kid think-pauses (~2s) are all well
// under this.
const WATCHDOG_MS = 90000;

const { chromium } = PLAYWRIGHT_MODULE;

// Curriculum newKeys per level — mirrors js/levels.js / CLAUDE.md level table.
// Used only for PACING (slower on newly-introduced keys).
const NEW_KEYS = {
  1: ['f', 'j'], 2: ['d', 'k'], 3: ['s', 'l'], 4: ['a', ';'], 5: ['g', 'h'],
  6: ['e', 'i'], 7: ['r', 'u'], 8: ['t', 'y'], 9: ['w', 'o'], 10: ['q', 'p'],
  11: ['v', 'm'], 12: ['b', 'n'], 13: ['c', ','], 14: ['x', '.'], 15: ['z', '/'],
  16: ['5', '6'], 17: ['4', '7'], 18: ['3', '8'], 19: ['2', '9'], 20: ['1', '0'],
  21: ['-', '='], 22: ['[', ']', '\\'], 23: ['`', "'"], 24: ['Shift'],
  25: [' ', 'Backspace'],
};

const CINEMATIC_NAMES = { 5: 'mystery', 10: 'basement', 15: 'commandcenter', 20: 'fullcircle' };

// History-card "moment word" per level — MIRRORS js/history-cards.js HISTORY_CARDS.
// Used ONLY for transcript instrumentation (card_word_shown events + the
// "card shown" validation column). Keep in sync if history-cards.js changes.
const CARD_WORDS = {
  4: 'ada', 5: 'hal', 8: 'hedy', 9: 'www', 10: 'floppy', 11: 'mouse',
  12: 'turing', 13: 'grace', 14: 'pixel', 15: 'eliza', 17: 'c64', 18: '386',
  19: 'y2k', 20: '1969', 22: '\\o/', 24: 'Eniac', 25: 'hello world',
};
// The card word's token string, in the SAME reversed form readVisibleSequence
// emits (display glyphs mapped back to real chars). wordToTokens is split(''),
// so a card's reversed sequence text is just the word itself.
function cardSequenceText(level) {
  return CARD_WORDS[level] != null ? CARD_WORDS[level] : null;
}

// ─── CLI parsing ────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = {
    out: null,               // resolved after parsing (mode-dependent default)
    levels: '1-25',
    singleLevel: null,
    act: null,
    freshOpen: false,
    profile: 'kid',
    seed: 1979,
    name: 'OONA',
    url: null,
    headed: false,
    keepWebm: false,
  };
  for (const a of argv.slice(2)) {
    if (a === '--headed') args.headed = true;
    else if (a === '--keep-webm') args.keepWebm = true;
    else if (a === '--fresh-open') args.freshOpen = true;
    else if (a.startsWith('--out=')) args.out = a.slice(6);
    else if (a.startsWith('--levels=')) args.levels = a.slice(9);
    else if (a.startsWith('--single-level=')) args.singleLevel = parseInt(a.slice(15), 10);
    else if (a.startsWith('--act=')) args.act = parseInt(a.slice(6), 10);
    else if (a.startsWith('--profile=')) args.profile = a.slice(10);
    else if (a.startsWith('--seed=')) args.seed = parseInt(a.slice(7), 10);
    else if (a.startsWith('--name=')) args.name = a.slice(7);
    else if (a.startsWith('--url=')) args.url = a.slice(6);
    else { console.error(`Unknown flag: ${a}`); process.exit(2); }
  }
  if (args.singleLevel != null && args.act != null) {
    console.error('Pass --single-level OR --act, not both.'); process.exit(2);
  }
  if (args.singleLevel != null &&
      (!Number.isFinite(args.singleLevel) || args.singleLevel < 1 || args.singleLevel > 25)) {
    console.error('Bad --single-level: must be 1-25'); process.exit(2);
  }
  if (args.act != null && (!Number.isFinite(args.act) || args.act < 1 || args.act > 5)) {
    console.error('Bad --act: must be 1-5'); process.exit(2);
  }
  if (args.freshOpen && args.act !== 1) {
    console.error('--fresh-open is only valid with --act=1'); process.exit(2);
  }
  args.mode = args.singleLevel != null ? 'single' : args.act != null ? 'act' : 'full';
  if (args.out == null) {
    if (args.mode === 'single') {
      args.out = path.join(path.dirname(DEFAULT_OUT),
        `kk-level-${String(args.singleLevel).padStart(2, '0')}.mov`);
    } else if (args.mode === 'act') {
      args.out = path.join(path.dirname(DEFAULT_OUT), `kk-act-${args.act}.mov`);
    } else {
      args.out = DEFAULT_OUT;
    }
  }
  return args;
}

// Parse "1-25" | "1-3" | "1,3,5" -> {start, stop} (min/max bound the linear run).
function parseLevels(spec) {
  let nums = [];
  if (spec.includes('-') && !spec.includes(',')) {
    const [a, b] = spec.split('-').map(n => parseInt(n, 10));
    nums = [a, b];
  } else {
    nums = spec.split(',').map(n => parseInt(n.trim(), 10));
  }
  nums = nums.filter(n => Number.isFinite(n) && n >= 1 && n <= 25);
  if (!nums.length) { console.error(`Bad --levels spec: ${spec}`); process.exit(2); }
  return { start: Math.min(...nums), stop: Math.max(...nums) };
}

// ─── Seeded PRNG (mulberry32) ───────────────────────────────────────────────
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Pacing profiles ────────────────────────────────────────────────────────
// All values are milliseconds; the PRNG picks within [min,max].
const PROFILES = {
  kid: {
    label: 'kid',
    keyDelay: [330, 660],        // ~1.5-3 keys/sec normal
    newKeyDelay: [500, 900],     // noticeably slower on newly-introduced keys
    wordPause: [800, 2000],      // think-pause between words/patterns
    screenPause: [2000, 3000],   // longer pause when a new screen appears
    wrongKeyEvery: [25, 40],     // inject a wrong key ~1 in this many keys
    wrongKeyRecover: [500, 750], // pause after the wrong key before correcting
  },
  steady: {
    label: 'steady',
    keyDelay: [200, 300],        // ~4 keys/sec
    newKeyDelay: [280, 420],
    wordPause: [400, 900],
    screenPause: [1000, 1600],
    wrongKeyEvery: [30, 45],
    wrongKeyRecover: [450, 650],
  },
};

// Thrown by the watchdog; caught by the top level so the video still finalizes.
class StallError extends Error {
  constructor(msg) { super(msg); this.name = 'StallError'; }
}

// ─── Transcript timeline renderer (Part A) ──────────────────────────────────
// Pure: turns the jsonl event array into the human review-and-validate view.
// Per level: a header line, then a (time | visible sequence | typed | outcome)
// table with pattern boundaries and bolded wrong-key moments, then the win row.
function renderTimelineMarkdown(events, hdr) {
  const fmt = (s) => `${s.toFixed ? s.toFixed(1) : s}s`;
  const esc = (t) => String(t == null ? '' : t)
    .replace(/\|/g, '\\|').replace(/`/g, '\\`') || '·';
  const lines = [];
  lines.push(`# Playthrough Transcript — Timeline`);
  lines.push('');
  lines.push(`- **out:** \`${hdr.out}\``);
  lines.push(`- **mode:** ${hdr.mode}  ·  **profile:** ${hdr.profile}  ·  ` +
    `**seed:** ${hdr.seed}  ·  **levels:** ${hdr.levels}  ·  **name:** ${hdr.name}`);
  const wins = events.filter(e => e.type === 'win');
  const cinemas = events.filter(e => e.type === 'cinematic');
  lines.push(`- **result:** ${hdr.failed ? '❌ FAILED — ' + (hdr.failReason || '') : '✅ completed'}`);
  lines.push(`- **levels won:** ${wins.length}  ·  ` +
    `**cinematics:** ${cinemas.map(c => c.name).join(', ') || 'none'}`);
  lines.push('');

  // ── Hand-balance summary (Trevor's Q*bert metrics) ──────────────────────────
  // Hand classification derives from FINGER_MAP in js/levels.js
  // (space/Backspace/Shift = neutral). "played L:R" = actual accepted+injected
  // keystrokes; "leanΔ" = played right-share − the level's key-set right-share
  // (positive means the run leaned MORE right than the keys themselves force —
  // the fixable part). "alt" = within-word hand-alternation. "1hand%" = share of
  // served words using one hand only. "rpt%" = repeated served patterns.
  const hb = (hdr.handBalance || []);
  if (hb.length) {
    const run = hb.find(h => h.scope === 'run');
    const levs = hb.filter(h => h.scope === 'level');
    lines.push('## Hand balance (played reality)');
    lines.push('');
    lines.push('_Hand source of truth: FINGER_MAP in js/levels.js (space/Backspace/Shift = neutral). ' +
      'Static pool counterpart + transcript post-processing: `scripts/analyze-hand-balance.mjs`._');
    lines.push('');
    if (run) {
      lines.push(`**Run total:** played L:R **${run.keystroke.left}:${run.keystroke.right}**` +
        (run.keystroke.neutral ? ` (+${run.keystroke.neutral} neutral)` : '') +
        `  ·  ratio ${run.keystroke.ratioLR}  ·  alternation ${run.alternationPlayed ?? '—'}  ·  ` +
        `single-hand words ${Math.round((run.singleHand.share ?? 0) * 100)}%  ·  ` +
        `repeated served patterns ${run.variability.repeatRate != null ? Math.round(run.variability.repeatRate * 100) + '%' : '—'}`);
      lines.push('');
    }
    lines.push('| Lv | keySet R-share | played L:R | leanΔ | alt | 1hand% | R-only | L-only | served | distinct | rpt% | flags |');
    lines.push('|---|---|---|---|---|---|---|---|---|---|---|---|');
    for (const h of levs) {
      const flags = [];
      if (h.leanDelta != null && Math.abs(h.leanDelta) >= 0.12) flags.push(h.leanDelta > 0 ? 'PLAYED→R' : 'PLAYED→L');
      if (h.alternationPlayed != null && h.alternationPlayed < 0.5) flags.push('LOW-ALT');
      if ((h.singleHand.share ?? 0) >= 0.25) flags.push('1HAND');
      if (h.variability.repeatRate != null && h.variability.repeatRate >= 0.15) flags.push('REPEAT');
      lines.push(`| ${h.level} | ${h.keySetRightShare ?? '—'} | ` +
        `${h.keystroke.left}:${h.keystroke.right}${h.keystroke.neutral ? `(+${h.keystroke.neutral}n)` : ''} | ` +
        `${h.leanDelta == null ? '—' : (h.leanDelta > 0 ? '+' : '') + h.leanDelta} | ` +
        `${h.alternationPlayed ?? '—'} | ${Math.round((h.singleHand.share ?? 0) * 100)}% | ` +
        `${h.singleHand.rightOnly} | ${h.singleHand.leftOnly} | ` +
        `${h.variability.served} | ${h.variability.distinctServed} | ` +
        `${h.variability.repeatRate != null ? Math.round(h.variability.repeatRate * 100) : '—'} | ${flags.join(' ')} |`);
    }
    lines.push('');
    lines.push('_Flags: PLAYED→R/→L keystrokes leaned ≥0.12 right-share beyond the key-set baseline · ' +
      'LOW-ALT within-word alternation <0.50 · 1HAND ≥25% single-hand served words · REPEAT ≥15% repeated served patterns. ' +
      'Levels whose NEW keys are all one-sided (numbers 16–20, right-symbol 21–23) lean right by their key set — expected, not a flaw._');
    lines.push('');
  }

  // Group events by level (level_start .. level_end). Events between belong to
  // that level. Cinematics/others go into a trailing global section.
  let curLevel = null;
  const byLevel = new Map();
  const global = [];
  for (const e of events) {
    if (e.type === 'level_start') { curLevel = e.level; if (!byLevel.has(curLevel)) byLevel.set(curLevel, []); continue; }
    if (e.type === 'level_end') { curLevel = null; continue; }
    if (curLevel != null && byLevel.has(curLevel)) byLevel.get(curLevel).push(e);
    else global.push(e);
  }

  for (const [lvl, evs] of byLevel) {
    const win = evs.find(e => e.type === 'win') ||
      wins.find(w => w.level === lvl) || {};
    const cardShown = evs.some(e => e.type === 'card_word_shown');
    const shown = evs.filter(e => e.type === 'pattern_shown');
    lines.push(`## Level ${lvl}`);
    lines.push('');
    lines.push(`sequences at win: **${win.sequencesCompleted != null ? win.sequencesCompleted : '?'}**  ·  ` +
      `presses: ${win.totalPresses != null ? win.totalPresses : '?'}  ·  ` +
      `rejects: ${win.rejectedPresses != null ? win.rejectedPresses : '?'}  ·  ` +
      `patterns shown: ${shown.length}  ·  ` +
      `card word: ${cardShown ? '✅ shown' : '—'}`);
    lines.push('');
    lines.push('| time | visible sequence | typed | outcome |');
    lines.push('|---|---|---|---|');
    for (const e of evs) {
      if (e.type === 'pattern_shown') {
        const src = e.source === 'past-pool' ? ' _(past-pool)_' : '';
        lines.push(`| ${fmt(e.tSec)} | **▸ \`${esc(e.text)}\`**${src} | | _pattern shown_ |`);
      } else if (e.type === 'card_word_shown') {
        lines.push(`| ${fmt(e.tSec)} | 🃏 \`${esc(e.word)}\` | | _CARD WORD_ |`);
      } else if (e.type === 'press') {
        if (e.outcome === 'injected_wrong') {
          lines.push(`| ${fmt(e.tSec)} | (wanted \`${esc(e.expected)}\`) | **\`${esc(e.pressed)}\`** | **⚠ wrong-key (letter waits)** |`);
        } else if (e.outcome === 'rejected') {
          lines.push(`| ${fmt(e.tSec)} | \`${esc(e.expected)}\` | \`${esc(e.pressed)}\` | **❌ REJECTED** |`);
        } else {
          lines.push(`| ${fmt(e.tSec)} | \`${esc(e.expected)}\` | \`${esc(e.pressed)}\` | ✓ |`);
        }
      } else if (e.type === 'pattern_complete') {
        lines.push(`| ${fmt(e.tSec)} | \`${esc(e.text)}\` | | ── complete (#${e.sequencesCompleted}) ── |`);
      } else if (e.type === 'win') {
        lines.push(`| ${fmt(e.tSec)} | | | 🏆 **WIN** — ${e.sequencesCompleted} sequences, ${e.totalPresses} presses, ${e.rejectedPresses} rejects |`);
      }
    }
    lines.push('');
  }

  if (global.length) {
    lines.push(`## Other events`);
    lines.push('');
    for (const e of global) {
      if (e.type === 'cinematic') lines.push(`- ${fmt(e.tSec)} — 🎬 cinematic **${e.name}** (after level ${e.afterLevel})`);
      else lines.push(`- ${fmt(e.tSec)} — ${e.type} ${JSON.stringify(e)}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

// ─── Main ───────────────────────────────────────────────────────────────────
(async () => {
  const args = parseArgs(process.argv);
  const url = args.url || process.env.DEV_URL;
  if (!url) {
    console.error('ERROR: no URL. Pass --url=<http://...> or set DEV_URL. ' +
      '(This recorder never reads .dev-url.)');
    process.exit(2);
  }
  const profile = PROFILES[args.profile];
  if (!profile) { console.error(`Unknown profile: ${args.profile}`); process.exit(2); }

  let startLevel, stopLevel;
  if (args.mode === 'single') {
    startLevel = stopLevel = args.singleLevel;
  } else if (args.mode === 'act') {
    startLevel = (args.act - 1) * 5 + 1;
    stopLevel = args.act * 5;
  } else {
    const range = parseLevels(args.levels);
    startLevel = range.start; stopLevel = range.stop;
  }
  // Which cinematic (if any) this run owns at its end.
  const ownsCinematic = (args.mode === 'act' || args.mode === 'full' || args.mode === 'single')
    ? (CINEMATIC_NAMES[stopLevel] || null)
    : null;

  // Parse per-level intro/pool array lengths from the SERVED js/levels.js so we
  // can (a) know the win-gate minimum (minPatterns = intro.length, mirroring
  // main.js) and (b) classify a shown pattern's source as initial-pool vs
  // past-pool (initial list = intro + pool + injected card/name; once
  // sequencesCompleted exceeds that, getNextPattern draws randomly). This read
  // is best-effort — if it fails, source falls back to 'initial-pool' and the
  // win-gate check is skipped gracefully (never blocks a run).
  const levelMeta = {}; // level -> { introLen, poolLen }
  // FINGER_MAP-derived hand classification (source of truth: js/levels.js). We
  // parse the served FINGER_MAP so the recorder's hand calls always match the
  // static analyzer (scripts/analyze-hand-balance.mjs) and never hand-roll a
  // keyboard layout. handMap: char -> 'left' | 'right'. Neutral keys (space,
  // Backspace, Shift) are NOT added — handOf() returns 'neutral' for them.
  const handMap = {}; // 'f' -> 'left', 'j' -> 'right', ...
  const levelKeys = {}; // level -> [keys] for the key-set (expected-lean) baseline
  try {
    const res = await fetch(url.replace(/\/$/, '') + '/js/levels.js');
    const src = await res.text();
    // FINGER_MAP entries: 'k': 'LABEL',  — label's first word LEFT/RIGHT is the
    // hand. THUMB (space) has no hand => left out => classified neutral.
    const fmMatch = src.match(/FINGER_MAP\s*=\s*{([\s\S]*?)\n};/);
    if (fmMatch) {
      const body = fmMatch[1];
      const entryRe = /(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")\s*:\s*'([^']*)'/g;
      let em;
      while ((em = entryRe.exec(body)) !== null) {
        let key = em[1] != null ? em[1] : em[2];
        key = key.replace(/\\\\/g, '\\').replace(/\\'/g, "'"); // unescape \\ and \'
        const label = em[3];
        if (label.startsWith('LEFT')) handMap[key] = 'left';
        else if (label.startsWith('RIGHT')) handMap[key] = 'right';
        // THUMB / others: leave unmapped => neutral.
      }
    }
    // Find each "  N: {" level block and count top-level array entries in its
    // intro:[ ... ] and pool:[ ... ] sections by bracket depth.
    const countEntries = (body) => {
      // body is the text inside the outer [ ]; count commas at depth 0 that
      // separate the inner [...] entries. Simpler: count depth-transitions from
      // 0->1 on '[' which begin each entry.
      let depth = 0, entries = 0;
      for (const ch of body) {
        if (ch === '[') { if (depth === 0) entries++; depth++; }
        else if (ch === ']') depth--;
      }
      return entries;
    };
    const sliceSection = (block, key) => {
      const at = block.indexOf(key + ':');
      if (at < 0) return null;
      const open = block.indexOf('[', at);
      if (open < 0) return null;
      let depth = 0, i = open;
      for (; i < block.length; i++) {
        if (block[i] === '[') depth++;
        else if (block[i] === ']') { depth--; if (depth === 0) break; }
      }
      return block.slice(open + 1, i);
    };
    for (let lvl = 1; lvl <= 25; lvl++) {
      const re = new RegExp('\\n  ' + lvl + ':\\s*{');
      const m = re.exec(src);
      if (!m) continue;
      const start = m.index;
      const nextRe = new RegExp('\\n  ' + (lvl + 1) + ':\\s*{');
      const nm = nextRe.exec(src);
      const block = src.slice(start, nm ? nm.index : undefined);
      const introBody = sliceSection(block, 'intro');
      const poolBody = sliceSection(block, 'pool');
      levelMeta[lvl] = {
        introLen: introBody != null ? countEntries(introBody) : null,
        poolLen: poolBody != null ? countEntries(poolBody) : null,
      };
      // Parse the level's `keys: [...]` array for the key-set (expected-lean)
      // baseline. Entries are quoted single tokens; extract each.
      const keysBody = sliceSection(block, 'keys');
      if (keysBody != null) {
        const keys = [];
        const kre = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g;
        let km;
        while ((km = kre.exec(keysBody)) !== null) {
          let k = km[1] != null ? km[1] : km[2];
          k = k.replace(/\\\\/g, '\\').replace(/\\'/g, "'");
          keys.push(k);
        }
        levelKeys[lvl] = keys;
      }
    }
  } catch (e) {
    console.error(`[rec] levels.js parse for win-gate/hand meta failed (non-fatal): ${e.message}`);
  }

  // ── Hand-balance helpers (FINGER_MAP-derived; mirror analyze-hand-balance.mjs) ──
  // Neutral: space, Backspace, Shift, and any unmapped char. Uppercase letters
  // (Shift+letter, L24) inherit their base letter's hand.
  const NEUTRAL_KEYS = new Set([' ', 'Backspace', 'Shift']);
  const handOf = (ch) => {
    if (NEUTRAL_KEYS.has(ch)) return 'neutral';
    const base = /^[A-Z]$/.test(ch) ? ch.toLowerCase() : ch;
    return handMap[base] || 'neutral';
  };
  // Split a transcript pattern `text` (reversed glyphs: ⌫=Backspace, ⇧=Shift,
  // ' '=space) into tokens for word-level hand analysis.
  const textToTokens = (text) => {
    const out = [];
    for (const ch of (text || '')) {
      if (ch === '⌫') out.push('Backspace');
      else if (ch === '⇧') out.push('Shift');
      else out.push(ch);
    }
    return out;
  };
  const isWordTokens = (toks) => toks.filter(t => handOf(t) !== 'neutral').length >= 2;
  const wordAlternation = (toks) => {
    const hands = toks.map(handOf).filter(h => h !== 'neutral');
    if (hands.length < 2) return null;
    let sw = 0, pr = 0;
    for (let i = 1; i < hands.length; i++) { pr++; if (hands[i] !== hands[i - 1]) sw++; }
    return pr ? sw / pr : null;
  };
  const singleHandTokens = (toks) => {
    const hands = new Set(toks.map(handOf).filter(h => h !== 'neutral'));
    return hands.size === 1 ? [...hands][0] : null;
  };
  const ratioLR = (l, r) => {
    if (l === 0 && r === 0) return '0:0';
    if (r === 0) return `${l}:0`;
    if (l === 0) return `0:${r}`;
    const rnd = (x) => Math.round(x * 100) / 100;
    return l >= r ? `${rnd(l / r)}:1` : `1:${rnd(r / l)}`;
  };
  const keySetRightShare = (lvl) => {
    const keys = levelKeys[lvl] || [];
    let l = 0, r = 0;
    for (const k of keys) { const h = handOf(k); if (h === 'left') l++; else if (h === 'right') r++; }
    return l + r ? r / (l + r) : 0.5;
  };

  // Compute per-level and per-run hand-balance metrics from the transcript event
  // stream. Uses the SAME sources as the static analyzer's transcript mode:
  //  - real keystroke L/R from accepted + injected_wrong `press` events (the
  //    physical keys the hands pressed);
  //  - served words from `pattern_complete` texts (alternation, single-hand,
  //    variety). Returns an array of hand_balance events (level scope + one run
  //    scope) ready to append to the transcript and render in the .md header.
  const rnd2 = (x) => x == null ? null : Math.round(x * 100) / 100;
  function computeHandBalance(events) {
    const byLevel = new Map();
    const ensure = (lvl) => {
      if (!byLevel.has(lvl)) byLevel.set(lvl, { served: [], presses: [] });
      return byLevel.get(lvl);
    };
    for (const e of events) {
      if (e.type === 'pattern_complete' && e.level != null && typeof e.text === 'string') {
        ensure(e.level).served.push(textToTokens(e.text));
      } else if (e.type === 'press' && e.level != null &&
                 (e.outcome === 'accepted' || e.outcome === 'injected_wrong') &&
                 typeof e.pressed === 'string') {
        ensure(e.level).presses.push(e.pressed);
      }
    }
    const summarize = (served, presses, lvl) => {
      let kl = 0, kr = 0, kn = 0;
      for (const p of presses) { const h = handOf(p); if (h === 'left') kl++; else if (h === 'right') kr++; else kn++; }
      const kRightShare = kl + kr ? kr / (kl + kr) : 0.5;
      const altRates = [];
      for (const toks of served) { const r = wordAlternation(toks); if (r != null) altRates.push(r); }
      const alternationPlayed = altRates.length ? altRates.reduce((a, b) => a + b, 0) / altRates.length : null;
      const words = served.filter(isWordTokens);
      let rightOnly = 0, leftOnly = 0; const rightOnlyList = [], leftOnlyList = [];
      for (const toks of words) {
        const s = singleHandTokens(toks);
        const txt = toks.map(t => t === ' ' ? ' ' : t === 'Backspace' ? '⌫' : t === 'Shift' ? '⇧' : t).join('');
        if (s === 'right') { rightOnly++; rightOnlyList.push(txt); }
        else if (s === 'left') { leftOnly++; leftOnlyList.push(txt); }
      }
      const share = words.length ? (rightOnly + leftOnly) / words.length : 0;
      const distinct = new Set(served.map(toks =>
        toks.map(t => t === ' ' ? ' ' : t === 'Backspace' ? '⌫' : t === 'Shift' ? '⇧' : t).join(''))).size;
      const ksRight = lvl != null ? keySetRightShare(lvl) : null;
      return {
        keystroke: { left: kl, right: kr, neutral: kn, ratioLR: ratioLR(kl, kr), rightShare: rnd2(kRightShare) },
        keySetRightShare: rnd2(ksRight),
        leanDelta: ksRight != null ? rnd2(kRightShare - ksRight) : null,
        alternationPlayed: rnd2(alternationPlayed),
        singleHand: { words: words.length, rightOnly, leftOnly, share: rnd2(share), rightOnlyList, leftOnlyList },
        variability: { served: served.length, distinctServed: distinct,
          repeatRate: served.length ? rnd2(1 - distinct / served.length) : null },
      };
    };
    const out = [];
    const allServed = [], allPresses = [];
    for (const [lvl, d] of [...byLevel.entries()].sort((a, b) => a[0] - b[0])) {
      out.push(Object.assign({ scope: 'level', level: lvl }, summarize(d.served, d.presses, lvl)));
      allServed.push(...d.served); allPresses.push(...d.presses);
    }
    out.push(Object.assign({ scope: 'run' }, summarize(allServed, allPresses, null)));
    return out;
  }

  const rng = mulberry32(args.seed);
  const rint = (min, max) => Math.floor(min + rng() * (max - min + 1));
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];

  // Wrong-key injection cadence persists ACROSS levels so short curriculum
  // levels don't starve it.
  let sinceWrong = 0;
  let wrongBudget = rint(profile.wrongKeyEvery[0], profile.wrongKeyEvery[1]);

  // ── Metrics. Everything level-related is OBSERVED from the HUD badge. ──
  const metrics = {
    keysTyped: 0,            // presses we intended as correct
    correctPresses: 0,       // presses VERIFIED accepted by the engine
    rejectedPresses: 0,      // intended-correct presses the engine rejected (should be ~0)
    rejectedTimestamps: [],  // seconds (capped at 200 entries)
    wrongInjections: 0,      // seeded intentional wrong keys
    wrongTimestamps: [],
    levelStarts: {},         // OBSERVED "LEVEL n" badge -> seconds first seen
    levelEnds: {},           // OBSERVED level -> seconds its completion observed
    cinematics: [],          // OBSERVED {name, afterLevel, atSec}
    overlapsIntoLevel: null, // act-4 segments end inside L21's flow (stitch note)
    typingMs: 0,
    started: Date.now(),
  };
  const elapsedSec = () => +((Date.now() - metrics.started) / 1000).toFixed(1);

  // ── Transcript event stream (Part A). Every event carries tSec (video-
  // relative seconds, using the same clock as elapsedSec). Written to
  // <base>.transcript.jsonl and rendered to <base>.transcript.md at the end.
  const transcript = [];
  function logEvent(type, data) {
    transcript.push(Object.assign({ tSec: elapsedSec(), type }, data || {}));
  }
  // pattern_shown/pattern_complete boundaries are tracked per-level inside
  // playLevel (patternOpen/expectNewPattern), not by a global text dedup — this
  // is what keeps consecutive identical single-letter patterns from collapsing.

  // ── Watchdog ──
  let lastProgressAt = Date.now();
  const feedWatchdog = () => { lastProgressAt = Date.now(); };
  const checkWatchdog = (where) => {
    if (Date.now() - lastProgressAt > WATCHDOG_MS) {
      throw new StallError(`no observed game progress for ${WATCHDOG_MS / 1000}s (${where})`);
    }
  };

  const videoDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'kk-rec-'));
  const browser = await chromium.launch({ headless: !args.headed });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: videoDir, size: { width: 1280, height: 800 } },
  });
  const page = await context.newPage();
  // Anchor the transcript clock to the moment video capture begins (right after
  // the page/context exist), NOT to recorder startup — browser launch +
  // levels.js fetch add ~1-2s that would otherwise skew every tSec ahead of the
  // video timeline. After this reset, elapsedSec() ≈ video-relative seconds
  // (verified by spot-checking events against extracted frames, 2026-07-12).
  metrics.started = Date.now();

  const fatalErrors = [];
  page.on('pageerror', (e) => fatalErrors.push(String(e.message || e)));
  page.on('console', (m) => { if (m.type() === 'error') fatalErrors.push('[console] ' + m.text()); });

  // A retry wrapper: transient errors can come from concurrently-edited files.
  async function withRetry(fn, label) {
    try { return await fn(); }
    catch (e) {
      if (e instanceof StallError) throw e;
      console.error(`[retry] ${label} failed once: ${e.message}; retrying...`);
      await page.waitForTimeout(1000);
      return await fn();
    }
  }

  const sleep = (ms) => page.waitForTimeout(ms);
  const think = (range) => sleep(rint(range[0], range[1]));

  // ── DOM introspection (each helper is ONE evaluate => one atomic snapshot) ──

  async function detectScreen() {
    return withRetry(() => page.evaluate(() => {
      const screens = Array.from(document.querySelectorAll('.screen'));
      const visible = screens.filter(s => !s.classList.contains('hidden'));
      if (visible.length === 0) return 'cinematic';
      const id = visible[visible.length - 1].id || '';
      return id.replace(/-screen$/, '');
    }), 'detectScreen');
  }

  async function nameEntryVisible() {
    return page.evaluate(() => {
      const ns = document.getElementById('name-setup');
      return !!ns && !ns.classList.contains('hidden');
    });
  }

  // One atomic game-state snapshot: expected token (reversing hud.js
  // promptDisplay), observed level number, streak, and end flags.
  async function gameSnapshot() {
    return withRetry(() => page.evaluate(() => {
      const out = {};
      const el = document.querySelector('#prompt-sequence .prompt-letter.active');
      if (!el) { out.token = null; out.activeIdx = null; }
      else {
        const t = (el.textContent || '');
        out.token = t === '?' ? ';'
          : t === '␣' ? ' '
          : t === '⌫' ? 'Backspace'
          : t === '⇧' ? 'Shift'
          : t; // case preserved: 'A' means Shift+a
        out.activeIdx = el.getAttribute('data-index');
      }
      const badge = (document.getElementById('level-badge-text') || {}).textContent || '';
      const m = badge.match(/LEVEL\s+(\d+)/i);
      out.levelNum = m ? parseInt(m[1], 10) : null;
      out.streak = parseInt((document.getElementById('hud-streak') || {}).textContent || '-1', 10);
      const ga = document.querySelector('#game-screen .game-area');
      const co = document.getElementById('complete-overlay');
      out.ended = !!((ga && ga.classList.contains('hidden')) ||
                     (co && !co.classList.contains('hidden')));
      out.completeShown = !!(co && !co.classList.contains('hidden'));
      return out;
    }), 'gameSnapshot');
  }

  // Read the FULL visible letter sequence from #prompt-sequence, reversing the
  // display-glyph map exactly as gameSnapshot does for the active letter, plus
  // whether the pattern is still inside the curriculum list (initial-pool) or a
  // random post-exhaustion draw (past-pool). We approximate source from the
  // engine's own state exposure if present; otherwise heuristically: the recorder
  // cannot see main.js's closure `state`, so we mark source 'unknown' when we
  // can't tell. In practice we can tell via a global the game does NOT expose —
  // so we treat every sequence read as 'initial-pool' unless the desync detector
  // has flagged past-pool chaos (tracked by the caller). This helper returns the
  // sequence text + active index; the caller supplies source.
  async function readVisibleSequence() {
    return withRetry(() => page.evaluate(() => {
      const letters = Array.from(
        document.querySelectorAll('#prompt-sequence .prompt-letter'));
      const rev = (t) => t === '?' ? ';'
        : t === '␣' ? ' '
        : t === '⌫' ? 'Backspace'
        : t === '⇧' ? 'Shift'
        : t;
      // Multi-char tokens (Backspace/Shift) would corrupt a plain join, but
      // curriculum prompts render one glyph per token; Backspace only appears on
      // L25 where the token is the ONLY glyph in its own pattern. Join raw
      // single-glyph reads; represent named tokens with their glyph so the
      // sequence text stays human-readable and stable.
      const glyphs = letters.map(el => (el.textContent || ''));
      const text = glyphs.map(rev).map(t =>
        t === ' ' ? ' ' : t === 'Backspace' ? '⌫' : t === 'Shift' ? '⇧' : t
      ).join('');
      let activeIdx = null;
      const active = document.querySelector('#prompt-sequence .prompt-letter.active');
      if (active) activeIdx = active.getAttribute('data-index');
      return { text, len: letters.length, activeIdx };
    }), 'readVisibleSequence');
  }

  // Press a single game token per the engine input contract.
  async function pressToken(token) {
    if (token === ' ') { await page.keyboard.press('Space'); return; }
    if (token === 'Backspace') { await page.keyboard.press('Backspace'); return; }
    if (token === 'Shift') { await page.keyboard.press('Shift'); return; }
    if (/^[A-Z]$/.test(token)) {
      // MUST press the UPPERCASE character descriptor: Playwright's
      // down('Shift') + press('a') dispatches e.key='a' (shiftKey=true),
      // which the engine rejects — it matches e.key against 'A' exactly.
      // press('A') dispatches e.key='A'. We still hold Shift around it so
      // the film shows a genuine shift-chord (verified 2026-07-12).
      await page.keyboard.down('Shift');
      await page.keyboard.press(token);
      await page.keyboard.up('Shift');
      return;
    }
    await page.keyboard.press(mapToPlaywrightKey(token));
  }

  function mapToPlaywrightKey(ch) {
    const named = {
      ';': 'Semicolon', ',': 'Comma', '.': 'Period', '/': 'Slash',
      '-': 'Minus', '=': 'Equal', '[': 'BracketLeft', ']': 'BracketRight',
      '\\': 'Backslash', "'": 'Quote', '`': 'Backquote',
    };
    return named[ch] || ch;
  }

  // Choose a harmless wrong key: a real single char different from `expected`.
  function chooseWrongKey(expected) {
    const pool = 'asdfghjkl'.split('');
    return pick(pool.filter(c => c !== (expected || '').toLowerCase()));
  }

  // ── High-level flow ───────────────────────────────────────────────────────

  console.error(`[rec] URL=${url} mode=${args.mode} profile=${profile.label} ` +
    `seed=${args.seed} levels=${startLevel}-${stopLevel} name=${args.name}`);

  let runFailed = false;
  let failReason = null;

  try {
    // 1) Load fresh: clear storage so the first-time flow plays (no continue
    //    screen) and each invocation is isolated for parallel runs.
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(700);
    await page.click('body').catch(() => {});
    await think(profile.screenPause);

    // 2) Insert coin (Space) -> name entry appears.
    await page.keyboard.press('Space');
    await sleep(500);
    for (let i = 0; i < 20 && !(await nameEntryVisible()); i++) await sleep(150);
    await think(profile.wordPause);

    // 3) Type the player name at human pace, then Enter. Clear the prefilled
    //    input explicitly so the film shows the name typed cleanly from empty.
    await page.click('#player-name-input').catch(() => {});
    await page.evaluate(() => {
      const inp = document.getElementById('player-name-input');
      if (inp) { inp.value = ''; inp.focus(); }
    });
    await sleep(200);
    for (const ch of args.name) {
      await page.keyboard.press(ch);
      await sleep(rint(profile.newKeyDelay[0], profile.newKeyDelay[1]));
    }
    await think(profile.wordPause);
    await page.keyboard.press('Enter');
    await sleep(500);
    feedWatchdog();

    // 3b) Jump entry (single-level, act without --fresh-open, or a full run
    //     starting past level 1): WOPR select bypass from the ready screen.
    const needJump = (args.mode === 'single')
      || (args.mode === 'act' && !(args.act === 1 && args.freshOpen))
      || (args.mode === 'full' && startLevel > 1);
    if (needJump && startLevel >= 1) {
      await woprJumpTo(startLevel);
    }

    // 4) ready -> Space -> keyboard-preview -> Space -> game.
    await advanceToGame();

    // ── Play observed levels until stopLevel completes ────────────────────
    for (let played = 0; played < 30; played++) {
      const snap = await gameSnapshot();
      const lvl = snap.levelNum;
      if (lvl == null) throw new Error('game screen has no parseable LEVEL badge');
      if (!(lvl in metrics.levelStarts)) {
        metrics.levelStarts[lvl] = elapsedSec();
        console.error(`[rec] OBSERVED level ${lvl} begins @ ${elapsedSec()}s`);
        logEvent('level_start', { level: lvl });
      }
      feedWatchdog();

      const t0 = Date.now();
      const lvlStats = await playLevel(lvl, NEW_KEYS[lvl] || []);
      metrics.typingMs += Date.now() - t0;
      metrics.levelEnds[lvl] = elapsedSec();
      console.error(`[rec] OBSERVED level ${lvl} complete @ ${elapsedSec()}s`);
      // win + level_end events. sequencesCompleted is the observed
      // patterns-at-win (accepted pattern_complete events for this level).
      logEvent('win', {
        level: lvl,
        sequencesCompleted: lvlStats.sequencesCompleted,
        totalPresses: lvlStats.totalPresses,
        rejectedPresses: lvlStats.rejectedPresses,
      });
      logEvent('level_end', { level: lvl });
      feedWatchdog();

      // Let victory (4s) play out, dwell on the completion/history card.
      await waitForCompleteOverlay();
      await think(profile.screenPause);

      if (lvl >= stopLevel) {
        if (ownsCinematic) {
          // This run owns the closing cinematic: advance past complete and
          // let it play fully. dwellCinematic presses Space at the title
          // card; for fullcircle (no title card) the sequence exits into
          // Level 21's flow on its own.
          await page.keyboard.press('Space');
          await sleep(900);
          if ((await detectScreen()) === 'cinematic') {
            console.error(`[rec] OBSERVED cinematic '${ownsCinematic}' after level ${lvl} @ ${elapsedSec()}s`);
            metrics.cinematics.push({ name: ownsCinematic, afterLevel: lvl, atSec: elapsedSec() });
            logEvent('cinematic', { name: ownsCinematic, afterLevel: lvl });
            await dwellCinematic();
            if (ownsCinematic === 'fullcircle') {
              // Segment ends inside Level 21's flow — note for stitchers.
              metrics.overlapsIntoLevel = 21;
              console.error(`[rec] segment overlaps into level 21 @ ${elapsedSec()}s (fullcircle has no title card)`);
            }
            await sleep(1500); // hold the post-cinematic frame briefly
          }
        }
        // else: end on the completion overlay — the right final frame for
        // L25 ("YOU BUILT THIS") and for plain mid-run stop levels.
        break;
      }

      await advancePastComplete(lvl);
      await advanceToGame();
    }

    console.error(`[rec] playthrough finished @ ${elapsedSec()}s; closing...`);
    await sleep(1200);
  } catch (e) {
    runFailed = true;
    failReason = `${e.name || 'Error'}: ${e.message}`;
    console.error(`[rec] RUN FAILED: ${failReason}`);
    // fall through — the video is still finalized below for inspection.
  }

  // ── Finalize video (always — a stalled run's film is the evidence) ───────
  const video = page.video();
  await context.close(); // flushes the webm
  await browser.close();

  const webmPath = await video.path();
  const outPath = path.resolve(args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  console.error(`[rec] transcoding ${webmPath} -> ${outPath}`);
  execFileSync(FFMPEG, [
    '-y', '-i', webmPath,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-crf', '20', '-preset', 'medium',
    '-movflags', '+faststart',
    outPath,
  ], { stdio: 'inherit' });

  if (!args.keepWebm) { try { fs.rmSync(videoDir, { recursive: true, force: true }); } catch (e) {} }
  else { console.error(`[rec] webm kept in ${videoDir}`); }

  // ── Transcript artifacts (Part A) ───────────────────────────────────────────
  // Emitted on EVERY run as siblings of the .mov: <base>.transcript.jsonl (the
  // machine-readable event stream) and <base>.transcript.md (the human timeline).
  const outBase = outPath.replace(/\.[^.]+$/, '');
  const jsonlPath = outBase + '.transcript.jsonl';
  const mdPath = outBase + '.transcript.md';
  // Compute hand-balance metrics from the played transcript and append them as
  // hand_balance events (one per level + a run summary). Best-effort: never
  // block the transcript write if hand-map parsing failed.
  let handBalance = [];
  try { handBalance = computeHandBalance(transcript); } catch (e) {
    console.error(`[rec] hand-balance compute failed (non-fatal): ${e.message}`);
  }
  for (const hb of handBalance) logEvent('hand_balance', hb);
  try {
    fs.writeFileSync(jsonlPath,
      transcript.map(e => JSON.stringify(e)).join('\n') + (transcript.length ? '\n' : ''));
    fs.writeFileSync(mdPath, renderTimelineMarkdown(transcript, {
      out: outPath, mode: args.mode, profile: profile.label, seed: args.seed,
      levels: `${startLevel}-${stopLevel}`, name: args.name,
      failed: runFailed, failReason, handBalance,
    }));
    console.error(`[rec] transcript -> ${jsonlPath}`);
    console.error(`[rec] timeline   -> ${mdPath}`);
  } catch (e) {
    console.error(`[rec] transcript write failed: ${e.message}`);
  }

  // ── Report ────────────────────────────────────────────────────────────────
  const durProbe = spawnSync('ffprobe', ['-v', 'error', '-show_entries',
    'format=duration', '-of', 'default=nw=1:nk=1', outPath], { encoding: 'utf8' });
  const duration = parseFloat((durProbe.stdout || '0').trim());
  const totalSec = (Date.now() - metrics.started) / 1000;
  const typingSec = metrics.typingMs / 1000;

  const report = {
    out: outPath,
    transcriptJsonl: jsonlPath,
    transcriptMd: mdPath,
    transcriptEvents: transcript.length,
    mode: args.mode,
    act: args.act,
    singleLevel: args.singleLevel,
    includesCinematic: metrics.cinematics.length
      ? metrics.cinematics[metrics.cinematics.length - 1].name : null,
    overlapsIntoLevel: metrics.overlapsIntoLevel,
    failed: runFailed,
    failReason,
    videoDurationSec: duration,
    wallClockSec: +totalSec.toFixed(1),
    profile: profile.label,
    seed: args.seed,
    levels: `${startLevel}-${stopLevel}`,
    keysTyped: metrics.keysTyped,
    correctPresses: metrics.correctPresses,
    achievedKeysPerSec_overall: +(metrics.correctPresses / totalSec).toFixed(2),
    achievedKeysPerSec_typing: +(typingSec > 0 ? metrics.correctPresses / typingSec : 0).toFixed(2),
    // Seeded, intentional wrong keys (the on-camera "gentle nudge" demos):
    wrongInjections: metrics.wrongInjections,
    wrongTimestampsSec: metrics.wrongTimestamps,
    // Intended-correct presses the engine rejected — should be ~0. A burst
    // here means the DOM prompt and the engine desynced (see header).
    rejectedPresses: metrics.rejectedPresses,
    rejectedTimestampsSec: metrics.rejectedTimestamps,
    // OBSERVED from the HUD level badge — never from a schedule:
    levelStartsSec: metrics.levelStarts,
    levelEndsSec: metrics.levelEnds,
    cinematics: metrics.cinematics,
    fatalErrors,
  };
  console.log('\n=== RECORDING REPORT ===');
  console.log(JSON.stringify(report, null, 2));
  if (fatalErrors.length) {
    console.error(`\n[rec] ${fatalErrors.length} error(s) captured (see report).`);
  }
  if (runFailed) process.exit(3);
  return;

  // ── Nested flow helpers (closures over page/metrics/rng; hoisted) ─────────

  // From the ready screen, type 'wopr' -> select screen, arrow to the target
  // cabinet, Enter -> name confirm -> ready screen for that level. Mirrors
  // scripts/kk-playwright.js goToLevel (kept inline because this recorder
  // paces its keys and records video; keep the two in sync if the select
  // screen's navigation changes). WOPR sets state.selectBypass, so every
  // cabinet is selectable regardless of kk-progress — no storage seeding.
  async function woprJumpTo(level) {
    for (let i = 0; i < 10 && (await detectScreen()) !== 'ready'; i++) await sleep(300);
    await page.keyboard.type('wopr', { delay: 160 });
    await sleep(600);
    if ((await detectScreen()) !== 'select') {
      throw new Error('WOPR jump: select screen did not appear');
    }
    const actNum = Math.ceil(level / 5);
    for (let i = 1; i < actNum; i++) { await page.keyboard.press('ArrowDown'); await sleep(250); }
    const pos = ((level - 1) % 5) + 1;
    for (let i = 1; i < pos; i++) { await page.keyboard.press('ArrowRight'); await sleep(200); }
    await sleep(400);
    await page.keyboard.press('Enter');   // select cabinet -> title/name entry (prefilled)
    await sleep(500);
    await page.keyboard.press('Enter');   // confirm name -> ready screen
    await sleep(500);
    feedWatchdog();
  }

  async function advanceToGame() {
    for (let i = 0; i < 20; i++) {
      checkWatchdog('advanceToGame');
      const scr = await detectScreen();
      if (scr === 'game') {
        for (let j = 0; j < 40; j++) {
          const snap = await gameSnapshot();
          if (snap.token != null) { feedWatchdog(); return; }
          await sleep(150);
        }
        return;
      }
      if (scr === 'ready' || scr === 'keyboard-preview') {
        await think(profile.screenPause);
        await page.keyboard.press('Space');
        await sleep(500);
        feedWatchdog();
      } else if (scr === 'cinematic') {
        await dwellCinematic();
      } else {
        await sleep(400);
        await page.keyboard.press('Space');
        await sleep(500);
      }
    }
  }

  // Returns { sequencesCompleted, totalPresses, rejectedPresses } for the win
  // event. Also emits the per-level transcript events (pattern_shown,
  // card_word_shown, press, pattern_complete) as it plays.
  async function playLevel(lvl, newKeys) {
    let guard = 0;
    const MAX_KEYS = 4000; // hard cap; the watchdog fires long before this
    let sawWordEnd = false;
    // Desync detector: a healthy run has ~0 rejected presses, so a sustained
    // high reject ratio means the DOM prompt and the engine have desynced
    // (the pattern-list-exhaustion chaos mode — see header). Lucky accepts
    // can keep feeding the 90s watchdog forever in that state, so this
    // fails fast with a precise reason instead.
    let lvlAccepted = 0, lvlRejected = 0;

    // Per-level transcript bookkeeping.
    const meta = levelMeta[lvl] || {};
    const introLen = meta.introLen; // == main.js minPatterns for the win gate
    // Initial-pool size (before getNextPattern draws randomly) = intro + pool +
    // injected patterns (card word always; level-24 name twice). We approximate
    // injected count: card always contributes 1; L24 name adds 2 more.
    let injected = (CARD_WORDS[lvl] != null ? 1 : 0) + (lvl === 24 ? 2 : 0);
    const initialListLen = (introLen != null && meta.poolLen != null)
      ? introLen + meta.poolLen + injected : null;
    const cardText = cardSequenceText(lvl); // reversed-form card word or null
    let sequencesCompleted = 0;              // observed patterns completed
    let totalPresses = 0;                    // accepted + rejected + injected
    let cardShownLogged = false;
    let curPatternText = null;               // text of the pattern being typed now
    // patternOpen: a pattern has been logged as shown and is being typed.
    // expectNewPattern: the current pattern completed and the NEXT index-0
    // render should open a fresh pattern_shown. Together these let two
    // CONSECUTIVE IDENTICAL single-letter patterns (e.g. the intro's `r`, `r`)
    // each get their own shown/complete pair instead of being collapsed by a
    // text-based dedup. (That collapse was the 2026-07-12 counting artifact that
    // made L7/L16 look like they won one pattern under the intro minimum — the
    // game was fine; the instrument under-counted.)
    let patternOpen = false;
    let expectNewPattern = true; // the first render opens the first pattern
    let curPatternLen = 0;       // letter count of the open pattern
    let curPatternAccepted = 0;  // accepted presses within the open pattern

    // Open a pattern_shown for the current index-0 render (and card_word_shown
    // if it's the moment word). Fires exactly once per rendered pattern.
    async function logNewPattern() {
      const vs = await readVisibleSequence();
      if (!vs || !vs.text) return false;
      const atStart = vs.activeIdx == null || vs.activeIdx === '0';
      if (!atStart) return false;
      curPatternText = vs.text;
      curPatternLen = vs.len;   // authoritative letter count for this pattern
      curPatternAccepted = 0;   // accepted presses so far within this pattern
      patternOpen = true;
      expectNewPattern = false;
      const source = (initialListLen != null && sequencesCompleted >= initialListLen)
        ? 'past-pool' : 'initial-pool';
      logEvent('pattern_shown', { level: lvl, text: vs.text, index: vs.len, source });
      if (cardText != null && vs.text === cardText && !cardShownLogged) {
        cardShownLogged = true;
        logEvent('card_word_shown', { level: lvl, word: cardText });
        console.error(`[rec]   CARD WORD '${cardText}' shown @ ${elapsedSec()}s (L${lvl})`);
      }
      return true;
    }

    // Emit pattern_complete for the currently-open pattern (idempotent), and arm
    // expectNewPattern so the next render opens a fresh one.
    function markComplete() {
      if (!patternOpen) return;
      sequencesCompleted++;
      logEvent('pattern_complete', { level: lvl,
        text: curPatternText, sequencesCompleted });
      patternOpen = false;
      expectNewPattern = true;
    }

    while (guard++ < MAX_KEYS) {
      checkWatchdog(`playLevel L${lvl}`);

      // RULE 1: one fresh atomic snapshot immediately before every press.
      const snap = await gameSnapshot();
      if (snap.ended) break;
      if (snap.token == null) {
        // RULE 2: transition in progress (renderPrompt runs in a setTimeout;
        // the next .active appears within ~300ms). Never press a cached token.
        if (sawWordEnd) { await think(profile.wordPause); sawWordEnd = false; }
        await sleep(100);
        continue;
      }
      // Open a new pattern_shown when a fresh prompt renders at index 0 and we
      // are expecting one (first pattern, or the previous one just completed).
      // Keying on expectNewPattern (not on text) is what correctly separates
      // consecutive identical single-letter patterns.
      if ((expectNewPattern || !patternOpen) &&
          (snap.activeIdx === '0' || snap.activeIdx === 0)) {
        await logNewPattern();
      }
      const token = snap.token;

      // Pace: slower on newly-introduced keys.
      const isNew = newKeys.includes(token.toLowerCase()) || newKeys.includes(token);
      const delayRange = isNew ? profile.newKeyDelay : profile.keyDelay;

      // Seeded wrong-key injection (harmless: letter waits, nothing lost).
      sinceWrong++;
      if (sinceWrong >= wrongBudget && token !== ' ' && token !== 'Backspace' && token !== 'Shift') {
        const wrong = chooseWrongKey(token);
        await page.keyboard.press(mapToPlaywrightKey(wrong));
        metrics.wrongInjections++;
        metrics.wrongTimestamps.push(elapsedSec());
        totalPresses++;
        logEvent('press', { level: lvl, expected: token, pressed: wrong,
          outcome: 'injected_wrong', streakAfter: 0 });
        console.error(`[rec]   wrong-key '${wrong}' (wanted '${token}') @ ${elapsedSec()}s`);
        await sleep(rint(profile.wrongKeyRecover[0], profile.wrongKeyRecover[1]));
        sinceWrong = 0;
        wrongBudget = rint(profile.wrongKeyEvery[0], profile.wrongKeyEvery[1]);
        // RE-READ before correcting — the prompt may have been mid-transition
        // when we sampled it. The loop's next iteration presses fresh. The
        // SACRED contract check: the next accepted press MUST be this same
        // expected token (letter waits). The transcript records both, so the
        // analysis can verify expected(injected)==expected(next accepted).
        continue;
      }

      // Intended-correct press. Streak BEFORE the press is our oracle:
      // handleGameKey updates #hud-streak synchronously — correct => s0+1,
      // wrong => 0. (Exception: the press that ENDS the level returns before
      // updateHUD, so `ended` also counts as accepted.)
      const s0 = snap.streak;
      await pressToken(token);
      metrics.keysTyped++;
      totalPresses++;
      await sleep(rint(delayRange[0], delayRange[1]));

      let after = await gameSnapshot();
      let accepted = after.ended || after.streak > s0;
      if (!accepted) {
        // Not visibly accepted yet — but the press that ENDS the level skips
        // updateHUD and `ended` only flips in a setTimeout(400) (main.js
        // showLevelComplete). Re-check once before declaring a reject.
        await sleep(450);
        const confirm = await gameSnapshot();
        if (confirm.ended || confirm.streak > s0) { accepted = true; after = confirm; }
      }
      if (accepted) {
        metrics.correctPresses++;
        lvlAccepted++;
        feedWatchdog();
        logEvent('press', { level: lvl, expected: token, pressed: token,
          outcome: 'accepted', streakAfter: after.ended ? s0 + 1 : after.streak });
        // Pattern completion is AUTHORITATIVELY counted by accepted presses vs
        // the pattern's known letter count — robust even when the fast
        // transition has already rendered the next (possibly identical) pattern.
        if (patternOpen) curPatternAccepted++;
        const patternDone = after.ended ||
          (curPatternLen > 0 && curPatternAccepted >= curPatternLen) ||
          after.token == null;
        if (patternDone) markComplete();
        if (after.token == null && !after.ended) sawWordEnd = true;
        if (after.ended) break;
        // Drain the mid-word stale window: the engine advanced, but the next
        // letter's `.active` class lands in a setTimeout(150) — if we re-read
        // before it fires we'd double-press the letter we just typed and log
        // a spurious reject. Poll briefly until the DOM reflects the advance.
        if (after.token != null && after.activeIdx === snap.activeIdx) {
          for (let d = 0; d < 12; d++) {
            await sleep(50);
            const drained = await gameSnapshot();
            if (drained.ended || drained.token == null ||
                drained.activeIdx !== snap.activeIdx) break;
          }
        }
      } else {
        // RULE 3: the engine rejected what the DOM told us was expected.
        metrics.rejectedPresses++;
        lvlRejected++;
        logEvent('press', { level: lvl, expected: token, pressed: token,
          outcome: 'rejected', streakAfter: after.streak });
        if (metrics.rejectedTimestamps.length < 200) metrics.rejectedTimestamps.push(elapsedSec());
        if (metrics.rejectedPresses <= 5 || metrics.rejectedPresses % 25 === 0) {
          console.error(`[rec]   REJECTED press '${token}' (streak ${s0} -> ${after.streak}) @ ${elapsedSec()}s`);
        }
        if (lvlRejected >= 40 && lvlRejected / (lvlAccepted + lvlRejected) > 0.4) {
          throw new StallError(`prompt/engine desync on level ${lvl}: ` +
            `${lvlRejected} rejected vs ${lvlAccepted} accepted presses ` +
            `(pattern-list exhaustion chaos mode — game-side, see header)`);
        }
        // Loop re-reads fresh — never retry the cached token.
      }
    }
    // Safety net: if the loop broke on `ended` before markComplete fired (fast
    // transition), close the last open pattern so shown/complete counts match.
    if (patternOpen) markComplete();
    return {
      sequencesCompleted,
      totalPresses,
      rejectedPresses: lvlRejected,
      cardShown: cardShownLogged,
      minPatterns: introLen,
    };
  }

  // The victory screen auto-advances to the complete overlay after 4s; we
  // never keypress during victory (it would cut the theme's victory beat).
  async function waitForCompleteOverlay() {
    for (let i = 0; i < 60; i++) {
      const snap = await gameSnapshot();
      if (snap.completeShown) { feedWatchdog(); return; }
      await sleep(200);
    }
  }

  async function advancePastComplete(lvl) {
    await page.keyboard.press('Space');
    await sleep(900);
    if ((await detectScreen()) === 'cinematic') {
      const name = CINEMATIC_NAMES[lvl] || 'cinematic';
      console.error(`[rec] OBSERVED cinematic '${name}' after level ${lvl} @ ${elapsedSec()}s`);
      metrics.cinematics.push({ name, afterLevel: lvl, atSec: elapsedSec() });
      logEvent('cinematic', { name, afterLevel: lvl });
      await dwellCinematic();
    }
  }

  // Let a cinematic play FULLY, then press Space to advance from its title
  // card. We do NOT press during the sequence (that would skip it).
  async function dwellCinematic() {
    const DWELL_MS = 48000;
    const step = 1000;
    for (let waited = 0; waited < DWELL_MS; waited += step) {
      await sleep(step);
      feedWatchdog(); // a playing cinematic IS progress
      if ((await detectScreen()) !== 'cinematic') return;
    }
    for (let i = 0; i < 8; i++) {
      if ((await detectScreen()) !== 'cinematic') return;
      await page.keyboard.press('Space');
      await sleep(1500);
      feedWatchdog();
    }
    if ((await detectScreen()) === 'cinematic') {
      throw new StallError('cinematic never ended after full dwell + 8 advance presses');
    }
  }
})().catch(async (e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
