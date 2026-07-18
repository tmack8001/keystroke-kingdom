// Capture every history card ("picked up off the arcade floor") exactly as
// the player sees it: the REAL level-complete overlay DOM, in that level's
// real visual theme, reached by actually playing the level to completion.
//
// Why full playthrough and not a state-injection shortcut: js/main.js is
// loaded as an ES module with zero `window` exposure (no globals for
// `state`, `showLevelComplete`, `applyLevelTheme`, `activeTheme`, etc. —
// confirmed by reading the file directly, 2026-07-12). The only way to reach
// the ACTUAL showLevelComplete() render (not a hand-rolled DOM reconstruction)
// is to drive the real keydown listener the same way a player's keyboard
// does. This also matches the project's QA philosophy (journal L4/F20:
// guaranteed beats probabilistic, silent absence ships) — every card is
// captured via the exact code path a real session takes.
//
// Approach per level:
//   1. Navigate select -> ready -> keyboard-preview -> game (shared helper).
//   2. Loop: read the DOM's currently-`active` `.prompt-letter`, translate
//      its *display* glyph back to the real token the engine expects
//      (';' displays as '?', ' ' as '␣', 'Backspace' as '⌫' — see
//      js/ui/hud.js promptDisplay()), and press it with page.keyboard.press()
//      (named keys 'Backspace'/'Space' for those two, the literal character
//      otherwise — Playwright synthesizes correct e.key/shift state for both
//      letters and symbols, matching the engine's keydown-based input
//      contract in CLAUDE.md; .type() was tried first but silently mistypes
//      'Backspace' as eight literal letter keys instead of one keydown).
//      Repeat until '#complete-overlay' loses the 'hidden' class (the true
//      "fully rendered, real player-visible" signal).
//   3. Verify '#history-card' is present + unhidden + populated, screenshot
//      it, and log any legibility red flags (clipping, overflow, empty
//      fields) for the report — never touch game files.
//
// Every one of the 17 HISTORY_CARDS entries (js/history-cards.js) MUST
// produce a screenshot or the script exits non-zero — guaranteed, not
// probabilistic (journal L4).
//
// Usage:
//   python3 -m http.server 8151 --directory /Users/trevormack/dev/keystroke-kingdom
//   DEV_URL=http://127.0.0.1:8151 node docs/screenshots/capture-cards.js

const fs = require('fs');
const path = require('path');
const {
  launchPage,
  resolveBaseUrl,
  goToSelect,
  ALL_LEVELS,
} = require('../../scripts/kk-playwright');

const OUT_DIR = path.join(__dirname, 'history-cards');
fs.mkdirSync(OUT_DIR, { recursive: true });

// Source of truth for which levels carry a card — mirrors js/history-cards.js
// HISTORY_CARDS keys exactly (verified 1:1 against that file, 17 entries).
// Kept as a literal list here (not imported) because this is a Node/CJS
// script and history-cards.js is an ES module meant for the browser: the
// live in-page `import()` inside page.evaluate (see verifyCardCount below)
// is the actual cross-check that guarantees this list hasn't drifted.
const CARD_LEVELS = [4, 5, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 22, 24, 25];

// Generous per-level safety cap: the largest theme win-condition pool we
// found (Pac-Man, 20 dots; Breakout, 18 bricks) still completes well under
// this. getNextPattern() falls back to drawRandomPattern() forever once the
// intro/pool list is exhausted, so the loop is otherwise unbounded.
const MAX_PATTERNS_PER_LEVEL = 120;
const MAX_KEYS_PER_PATTERN = 40;
// Themes whose patternComplete() gate is a real physics/placement simulation
// rather than "one enemy per pattern" (Tetris needs LINES_TO_WIN=3 actual
// line clears, which can take many piece-locks and therefore many keystrokes
// to accumulate, and the RNG on piece shape + column targeting makes the
// keystroke count needed genuinely variable run to run — observed anywhere
// from ~200 to 800+ keystrokes across repeated captures) legitimately need
// much longer than the ~15-20s other levels finish in. 240s gives generous
// headroom above the worst observed run.
const PER_LEVEL_TIMEOUT_MS = 240_000;

// Reverse of js/ui/hud.js promptDisplay(): the DOM shows a friendlier glyph
// for a few tokens than the literal character the engine's keydown handler
// expects. Typing the glyph itself would never match `expected`.
function displayGlyphToToken(display) {
  if (display === '?') return ';';
  if (display === '␣') return ' ';
  if (display === '⌫') return 'Backspace';
  return display;
}

async function readActiveToken(page) {
  return page.evaluate(() => {
    const el = document.querySelector('.prompt-letter.active');
    return el ? el.textContent : null;
  });
}

async function isOverlayVisible(page) {
  return page.evaluate(() => {
    const el = document.getElementById('complete-overlay');
    return !!el && !el.classList.contains('hidden');
  });
}

// Types whatever the DOM currently shows as the active/expected prompt
// letter, over and over, until the real level-complete overlay unhides
// (or the safety caps trip). This is deliberately dumb: it never consults
// js/levels.js pattern data — it only ever acts on what a human player
// would see on screen, which is the whole point (real overlay, not a
// reconstruction).
//
// Failure is judged on a GLOBAL wall-clock stall (no .active element AND no
// visible overlay for STALL_TIMEOUT_MS straight), not a per-pattern
// iteration budget — some patterns legitimately take longer to transition
// (e.g. the card-word pattern's card-glint flourish, or a theme's own
// win-condition animation), and a per-pattern cap treated that normal
// variance as failure even though the run would have recovered fine.
const STALL_TIMEOUT_MS = 8000;

async function playLevelToCompletion(page, levelNum) {
  const deadline = Date.now() + PER_LEVEL_TIMEOUT_MS;
  let keysTyped = 0;
  let lastProgressAt = Date.now();

  while (true) {
    if (Date.now() > deadline) {
      return { ok: false, reason: `timeout after ${PER_LEVEL_TIMEOUT_MS}ms (level ${levelNum}, ${keysTyped} keys typed)` };
    }
    if (await isOverlayVisible(page)) return { ok: true, keysTyped };

    const display = await readActiveToken(page);
    if (display === null) {
      // Between-pattern transition window (150-300ms per main.js) or a
      // longer theme-driven animation — no .active element exists right
      // now. Wait and retry; only a sustained stall is a real failure.
      if (Date.now() - lastProgressAt > STALL_TIMEOUT_MS) {
        return { ok: false, reason: `no .prompt-letter.active or overlay for ${STALL_TIMEOUT_MS}ms straight (level ${levelNum}, ${keysTyped} keys typed)` };
      }
      await page.waitForTimeout(100);
      continue;
    }

    lastProgressAt = Date.now();
    const token = displayGlyphToToken(display);
    // page.keyboard.press() (not .type()) for every token: .type() treats
    // its argument as literal text to be typed character-by-character, so
    // the string 'Backspace' would be typed as eight separate letter
    // keydowns (B,a,c,k,...) instead of firing one real Backspace keydown —
    // this silently stalled Level 25 (word-processor intro pattern
    // ['j','Backspace']) during the first capture run. press() accepts
    // Playwright's named keys ('Backspace', ' '/'Space') and single
    // characters (letters, digits, symbols, exact-case letters for the
    // Shift-token contract) uniformly and fires the correct e.key either way.
    const pressKey = token === ' ' ? 'Space' : token;
    await page.keyboard.press(pressKey, { delay: 5 });
    keysTyped++;
    if (keysTyped > MAX_KEYS_PER_PATTERN * MAX_PATTERNS_PER_LEVEL) {
      return { ok: false, reason: `exceeded overall key budget (${keysTyped} keys, level ${levelNum}) without completing` };
    }
    // Small settle so the DOM's .active class has updated before the next read.
    await page.waitForTimeout(40);
  }
}

async function readCardOverlayState(page) {
  return page.evaluate(() => {
    const $ = (id) => document.getElementById(id);
    const historyCard = $('history-card');
    const overlay = $('complete-overlay');
    if (!overlay || overlay.classList.contains('hidden')) {
      return { overlayVisible: false };
    }
    if (!historyCard || historyCard.classList.contains('hidden')) {
      return { overlayVisible: true, cardVisible: false };
    }
    const word = $('history-card-word') ? $('history-card-word').textContent : null;
    const title = $('history-card-title') ? $('history-card-title').textContent : null;
    const year = $('history-card-year') ? $('history-card-year').textContent : null;
    const fact = $('history-card-fact') ? $('history-card-fact').textContent : null;
    const count = $('history-card-count') ? $('history-card-count').textContent : null;
    const isNew = $('history-card-new') && !$('history-card-new').classList.contains('hidden');

    // Legibility checks a screenshot alone won't flag reliably: does the
    // fact text's rendered scrollHeight exceed its box (overflow/clipping)?
    const factEl = $('history-card-fact');
    let overflow = false;
    if (factEl) {
      overflow = factEl.scrollHeight > factEl.clientHeight + 2;
    }

    return {
      overlayVisible: true,
      cardVisible: true,
      word, title, year, fact, count, isNew, overflow,
      bodyClass: document.body.className,
    };
  });
}

// Cross-check CARD_LEVELS against the live HISTORY_CARDS export via a real
// in-page module import, so a drift between this script's literal list and
// js/history-cards.js is caught loudly rather than silently under-capturing.
async function verifyCardLevelsMatch(page, baseUrl) {
  const liveKeys = await page.evaluate(async () => {
    const mod = await import('/js/history-cards.js');
    return Object.keys(mod.HISTORY_CARDS).map(Number).sort((a, b) => a - b);
  });
  const expected = [...CARD_LEVELS].sort((a, b) => a - b);
  const same = liveKeys.length === expected.length && liveKeys.every((v, i) => v === expected[i]);
  return { same, liveKeys, expected };
}

async function navigateToLevelViaSelect(page, baseUrl, levelEntry) {
  await goToSelect(page, baseUrl);
  for (let i = 0; i < levelEntry.actIdx; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(180);
  }
  for (let i = 0; i < levelEntry.posIdx; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(130);
  }
  await page.keyboard.press('Enter');   // select level -> title/name entry
  await page.waitForTimeout(350);
  await page.keyboard.press('Enter');   // confirm name -> ready-screen
  await page.waitForTimeout(350);
  await page.keyboard.press('Space');   // ready -> keyboard-preview-screen
  await page.waitForTimeout(350);
  await page.keyboard.press('Space');   // keyboard-preview -> game-screen
  await page.waitForTimeout(600);
}

(async () => {
  const baseUrl = resolveBaseUrl();
  console.log('Base URL:', baseUrl);
  const { browser, page, consoleErrors } = await launchPage();

  // ── Wire-check: confirm our level list matches the live game data ──────
  await page.goto(baseUrl);
  const check = await verifyCardLevelsMatch(page, baseUrl);
  if (!check.same) {
    console.error('FATAL: CARD_LEVELS in this script does not match HISTORY_CARDS in js/history-cards.js');
    console.error('  script :', check.expected.join(','));
    console.error('  live   :', check.liveKeys.join(','));
    await browser.close();
    process.exit(1);
  }
  console.log(`Wire-check OK: ${check.liveKeys.length} cards match js/history-cards.js exactly.\n`);

  // Optional CLI filter for re-running just a subset after a partial failure
  // (e.g. `node capture-cards.js 8,10,25`) — the wire-check above still runs
  // against the full HISTORY_CARDS set regardless, so a typo'd filter can
  // never silently narrow what's being validated for completeness.
  const filterArg = process.argv[2];
  const levelsToRun = filterArg
    ? filterArg.split(',').map(s => Number(s.trim())).filter(n => CARD_LEVELS.includes(n))
    : CARD_LEVELS;
  if (filterArg) {
    console.log(`Filtered run: ${levelsToRun.join(', ')} (of ${CARD_LEVELS.length} total cards)\n`);
  }

  const results = [];   // { level, ok, file, issues[] }
  const issues = [];    // flat list of legibility/content concerns for the report

  for (const levelNum of levelsToRun) {
    const levelEntry = ALL_LEVELS.find(l => l.levelNum === levelNum);
    if (!levelEntry) {
      results.push({ level: levelNum, ok: false, reason: 'no ALL_LEVELS entry' });
      continue;
    }

    console.log(`Level ${levelNum} (${levelEntry.filename}) — navigating + playing to completion...`);
    const errorsBefore = consoleErrors.length;

    try {
      await navigateToLevelViaSelect(page, baseUrl, levelEntry);

      const playResult = await playLevelToCompletion(page, levelNum);
      if (!playResult.ok) {
        results.push({ level: levelNum, ok: false, reason: playResult.reason });
        console.error(`  FAILED: ${playResult.reason}`);
        continue;
      }

      // showLevelComplete() populates all fields synchronously before
      // unhiding #complete-overlay (confirmed by reading main.js directly),
      // so no further wait is needed once isOverlayVisible() is true — but
      // give the cardDrop CSS animation (0.4s) a moment to settle for a
      // clean screenshot.
      await page.waitForTimeout(500);

      const cardState = await readCardOverlayState(page);
      if (!cardState.overlayVisible) {
        results.push({ level: levelNum, ok: false, reason: 'complete-overlay never became visible' });
        console.error('  FAILED: complete-overlay never became visible');
        continue;
      }
      if (!cardState.cardVisible) {
        results.push({ level: levelNum, ok: false, reason: 'history-card stayed hidden (cardWordTyped likely never set)' });
        console.error('  FAILED: history-card stayed hidden');
        continue;
      }

      // Content sanity checks (report-only, never auto-fixed).
      if (!cardState.word || !cardState.word.trim()) issues.push(`L${levelNum}: empty card word`);
      if (!cardState.title || !cardState.title.trim()) issues.push(`L${levelNum}: empty card title`);
      if (!cardState.fact || !cardState.fact.trim()) issues.push(`L${levelNum}: empty card fact`);
      if (cardState.overflow) issues.push(`L${levelNum} (${cardState.title}): fact text overflows its box (scrollHeight > clientHeight) — likely clipped for the player`);
      if (cardState.count && !new RegExp(`OF ${check.liveKeys.length}$`).test(cardState.count)) {
        issues.push(`L${levelNum}: card count "${cardState.count}" doesn't end in "OF ${check.liveKeys.length}" — TOTAL_CARDS mismatch?`);
      }

      const filename = String(levelNum).padStart(2, '0') + '-' + levelEntry.levelSlug + '.png';
      const outPath = path.join(OUT_DIR, filename);
      await page.screenshot({ path: outPath });

      const newErrors = consoleErrors.slice(errorsBefore);
      if (newErrors.length) {
        issues.push(`L${levelNum}: console errors during capture: ${newErrors.join(' | ')}`);
      }

      results.push({
        level: levelNum,
        ok: true,
        file: outPath,
        word: cardState.word,
        title: cardState.title,
        year: cardState.year,
        count: cardState.count,
        isNew: cardState.isNew,
        bodyClass: cardState.bodyClass,
        keysTyped: playResult.keysTyped,
      });
      console.log(`  OK -> ${filename}  [${cardState.title} / ${cardState.year}]  ${cardState.count}  theme=${cardState.bodyClass}`);
    } catch (err) {
      results.push({ level: levelNum, ok: false, reason: `exception: ${err.message}` });
      console.error(`  EXCEPTION: ${err.message}`);
    }
  }

  await browser.close();

  // ── Final report ────────────────────────────────────────────────────────
  console.log('\n=== SUMMARY ===');
  const failed = results.filter(r => !r.ok);
  const succeeded = results.filter(r => r.ok);
  console.log(`${succeeded.length}/${levelsToRun.length} cards captured${filterArg ? ' (filtered run — ' + CARD_LEVELS.length + ' total exist)' : ''}.`);

  if (issues.length) {
    console.log('\nCONTENT/LEGIBILITY ISSUES FOUND:');
    issues.forEach(i => console.log('  - ' + i));
  } else {
    console.log('\nNo legibility/content issues detected.');
  }

  if (consoleErrors.length) {
    console.log('\nALL CONSOLE ERRORS SEEN THIS RUN:');
    consoleErrors.forEach(e => console.log('  ' + e));
  } else {
    console.log('\nZero console errors for the entire run.');
  }

  if (failed.length) {
    console.error('\nFAILED LEVELS (guaranteed-capture contract violated — journal L4/F20):');
    failed.forEach(f => console.error(`  Level ${f.level}: ${f.reason}`));
    process.exit(1);
  }

  console.log(filterArg
    ? `\nAll ${levelsToRun.length} requested cards captured successfully.`
    : '\nAll 17 history cards captured successfully.');
  process.exit(0);
})();
