// Regenerates all docs/screenshots/ — one act page (select screen, one
// screenshot per act) + one gameplay screen per level. To add new acts or
// levels, edit ACTS_CONFIG only.
//
// Usage: node docs/screenshots/capture-all.js [filter]
//   Server must already be running.
//   BASE_URL resolution: DEV_URL env var > .dev-url at the repo root.
//   (e.g. DEV_URL=http://127.0.0.1:8105 node docs/screenshots/capture-all.js)
//
//   Optional CLI filter for minimal-blast-radius reruns (content-librarian
//   rule: regenerate only what changed). Comma-separated list of global level
//   numbers (1-25) and/or act slugs, e.g.:
//     node docs/screenshots/capture-all.js 8            # levels/act2-computer-wing/08-tetris.png only
//     node docs/screenshots/capture-all.js 8,10         # two level shots, no act pages
//     node docs/screenshots/capture-all.js act1-arcade   # that act's page + its 5 level shots
//     node docs/screenshots/capture-all.js 25           # the L25 coda shot only
//     node docs/screenshots/capture-all.js act4-command-center --acts-only
//                                                       # that act PAGE only, no level shots
//     node docs/screenshots/capture-all.js act1-arcade --levels-only
//                                                       # that act's 5 level shots, no act page
//   No filter = full regeneration (30 screenshots), same as before this flag existed.
//
//   Level 25 is captured DIFFERENTLY from every other level — see the
//   "Level 25 MY STORY coda" section below. Optional env knob:
//     CODA_WIN_RATIO=3.5 node docs/screenshots/capture-all.js 25
//   captures the coda at that EXPERIENCE tier instead of the default 1x (the
//   reference PNG is the 1x tier — only override it for verification runs).
//
// Navigation boilerplate lives in scripts/kk-playwright.js — shared with
// docs/a11y/audit.js and .claude/rules/visual-validation.md.

const fs   = require('fs');
const path = require('path');
const {
  launchPage,
  resolveBaseUrl,
  goToSelect,
  goFromSelectIntoGame,
} = require('../../scripts/kk-playwright');

// ── Source of truth ────────────────────────────────────────────────────────────
// Each act lists its levels in play order.  Adding Act 6 = one new entry here.
// 'slug' becomes the directory / filename fragment; keep it lowercase-hyphenated.
// (Kept local to this file, rather than scripts/kk-playwright.js's flat-string
// ACTS_CONFIG, because screenshot filenames need the {slug} object shape.)

const ACTS_CONFIG = [
  {
    slug: 'act1-arcade',
    levels: [
      { slug: 'breakout' },
      { slug: 'space-invaders' },
      { slug: 'pac-man' },
      { slug: 'galaga' },
      { slug: 'joust' },
    ],
  },
  {
    slug: 'act2-computer-wing',
    levels: [
      { slug: 'donkey-kong' },
      { slug: 'dragons-lair' },
      { slug: 'tetris' },
      { slug: 'super-mario-bros' },
      { slug: 'legend-of-zelda' },
    ],
  },
  {
    slug: 'act3-basement',
    levels: [
      { slug: 'sonic' },
      { slug: 'street-fighter-ii' },
      { slug: 'myst' },
      { slug: 'donkey-kong-country' },
      { slug: 'pokemon' },
    ],
  },
  {
    slug: 'act4-command-center',
    levels: [
      { slug: 'simcity-2000' },
      { slug: 'goldeneye-007' },
      { slug: 'age-of-empires' },
      { slug: 'final-fantasy-vii' },
      { slug: 'terminal' },
    ],
  },
  {
    slug: 'act5-full-circle',
    levels: [
      { slug: 'out-run' },
      { slug: 'qbert' },
      { slug: 'missile-command' },
      { slug: 'high-score-entry' },
      { slug: 'word-processor', coda: true },   // captured via the coda path, not the chrome shot
    ],
  },
];

// ── Derive flat level list (act index, position, global level number) ──────

let globalLevelNum = 0;
const ALL_LEVELS = [];

ACTS_CONFIG.forEach((act, actIdx) => {
  act.levels.forEach((lvl, posIdx) => {
    globalLevelNum++;
    ALL_LEVELS.push({
      levelNum:  globalLevelNum,
      actIdx:    actIdx,          // 0-based
      posIdx:    posIdx,          // 0-based within act
      actSlug:   act.slug,
      levelSlug: lvl.slug,
      filename:  String(globalLevelNum).padStart(2, '0') + '-' + lvl.slug,
      coda:      !!lvl.coda,      // Level 25 only — see the coda section below
    });
  });
});

// ── Set up directories ─────────────────────────────────────────────────────────

const SHOTS = __dirname;

fs.mkdirSync(path.join(SHOTS, 'acts'), { recursive: true });
ACTS_CONFIG.forEach(act => {
  fs.mkdirSync(path.join(SHOTS, 'levels', act.slug), { recursive: true });
});

// ── Navigation helper (local wrapper around the shared act/position walk) ──

async function navigateToLevel(page, baseUrl, lvl) {
  await goToSelect(page, baseUrl);

  for (let i = 0; i < lvl.actIdx; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(180);
  }
  for (let i = 0; i < lvl.posIdx; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(130);
  }

  await goFromSelectIntoGame(page);
}

// ── Level 25 "MY STORY" coda capture ──────────────────────────────────────────
//
// Every other level's reference shot is the level's opening chrome: navigate in,
// screenshot, done. Level 25 is different — its defining moment is the CODA
// (js/keyboard-story.js), which only exists AFTER the level's normal win target
// has already been met, at which point the level rolls PAST it into the
// walk-the-keyboard pangram story, the scripted typo→Backspace→correct beat, and
// the EXPERIENCE-tier manifesto capstone. A chrome shot of L25 shows none of it,
// which is why the reference PNG used to be captured by an ad-hoc script
// (docs/ROADMAP.md §3). This is that capture path, folded back in.
//
// How it works, and why it is built this way:
//
//  • WE PLAY THE LEVEL FOR REAL. The typist below reads the expected token out
//    of the live prompt DOM and presses it, over and over, exactly as a player's
//    keyboard would. Nothing pokes game state into the coda: a console-triggered
//    render can look perfect while the real engine path renders nothing (journal
//    L36), so the ONLY thing this script drives is the keyboard.
//
//  • IT FOLLOWS THE PROMPT, NEVER A DICTIONARY. The coda deliberately serves
//    mistyped tokens ("we cna") followed by 'Backspace' tokens and the correction
//    — scripted content, never a real penalty. A typist that knew the "right"
//    words would fight it; a typist that types whatever the prompt asks sails
//    through.
//
//  • THE CAPTURE IS DETERMINISTIC. The story is chosen by pickKeyboardStory()
//    from a per-slot rotation counter, so we pin that counter (kk-slots
//    `storyRotation['25']`) the same way capture-cards.js pins the history-card
//    picker, and clear the generated-story cache (kk-stories) so the pool is the
//    STATIC bank — the shipping offline default on a plain static server, and the
//    same bank the live reference frame was shot on. CODA_ROTATION = 0 therefore
//    pins STATIC_STORIES[0] (the "quick brown fox" pangram) + TYPO_BEATS[0]
//    ("we cna" → "we can do it"). Same inputs → same frame, every run.
//
//  • WE PREDICT THE CODA AND VERIFY THE ENGINE SERVED IT. keyboard-story.js is
//    pure data + pure helpers (no DOM, no state), so we import it in-page and
//    compute the exact token lines the engine must serve. The typist then matches
//    each served pattern against that prediction in order. A mismatch means the
//    seeding no longer steers the picker — we fail loudly rather than quietly
//    screenshot the wrong story.
//
//  • THE CAPTURE POINT is the first line of the manifesto capstone: by then the
//    document holds the whole pangram plus the RESOLVED typo beat, and the prompt
//    panel is on the manifesto — the frame that actually shows what the coda is.
//
//  • WE KEEP TYPING TO LEVEL COMPLETE. The screenshot is not the end of the run:
//    the typist plays the coda out to the real completion overlay. A coda the
//    player could get stuck in would be a One Rule violation, so "the capture
//    succeeded" and "the level is winnable" are the same check here.

const CODA_LEVEL = 25;
// Pins STATIC_STORIES[0] ("The quick brown fox jumps over the lazy dog.") and
// TYPO_BEATS[0] ("we cna" → "we can do it"). Story 0 is the pangram every reader
// already knows, which makes the reference frame legible at a glance — and it is
// what the existing reference PNG was shot on, so this run is a true diff of it.
const CODA_ROTATION = 0;
// Generous caps. L25's normal win target is ~5 patterns at 1x but ~18 at 3.5x,
// and the WIZARD manifesto is many sub-lines longer, so the budget is sized for
// the top tier, not the default one.
const CODA_TIMEOUT_MS = 300_000;
const CODA_STALL_MS = 10_000;
const CODA_MAX_KEYS = 6000;

// Reverse of js/ui/hud.js promptDisplay(): the DOM shows a friendlier glyph for a
// few tokens than the literal character the engine's keydown handler expects, so
// typing the glyph itself would never match. (Same mapping capture-cards.js uses.)
function displayGlyphToToken(display) {
  if (display === '?') return ';';
  if (display === '␣') return ' ';
  if (display === '⌫') return 'Backspace';
  return display;
}

// Everything the typist needs from the live DOM in one round trip: the full token
// line the prompt is showing, which index is active, and whether the level-complete
// overlay has taken over. textContent (never rendered text) — the prompt panel
// upper-cases visually via CSS, and typing the DISPLAYED case would break the
// exact-case Shift contract.
async function readPromptState(page) {
  return page.evaluate(() => {
    const overlay = document.getElementById('complete-overlay');
    const overlayVisible = !!overlay && !overlay.classList.contains('hidden');
    const els = Array.from(document.querySelectorAll('#prompt-sequence .prompt-letter'));
    let activeIndex = -1;
    els.forEach((el, i) => { if (el.classList.contains('active')) activeIndex = i; });
    return { overlayVisible, display: els.map(el => el.textContent), activeIndex };
  });
}

// Pin the story rotation into the ACTIVE save slot and drop any cached generated
// stories, so the coda pool is the static bank and the picker is deterministic.
// Must run after an active slot exists (goToSelect's name-confirm creates slot 0)
// and before the game starts (startCoda reads kk-slots fresh).
async function seedCodaDeterminism(page, rotation) {
  return page.evaluate(({ rotation }) => {
    // kk-stories only ever ADDS generated variety on top of the static floor;
    // clearing it pins the pool to the static bank (js/keyboard-story.js).
    try { localStorage.removeItem('kk-stories'); } catch (e) { /* nothing to clear */ }
    let st = null;
    try { st = JSON.parse(localStorage.getItem('kk-slots')); } catch (e) { st = null; }
    if (!st || !Array.isArray(st.slots) || !Number.isInteger(st.active) || !st.slots[st.active]) {
      return { ok: false, reason: 'no active slot to seed' };
    }
    const s = st.slots[st.active];
    s.storyRotation = (s.storyRotation && typeof s.storyRotation === 'object') ? s.storyRotation : {};
    s.storyRotation['25'] = rotation;
    localStorage.setItem('kk-slots', JSON.stringify(st));
    return { ok: true, active: st.active };
  }, { rotation });
}

// Set the EXPERIENCE tier through settings.js's OWN public API — the same call the
// Settings screen makes, so the change is live for the next level start exactly as
// theme-authoring.md documents. Used only to capture the coda at a non-default tier.
async function setWinRatio(page, ratio) {
  return page.evaluate(async ({ ratio }) => {
    const S = await import('/js/settings.js');
    S.saveSettings({ ...S.getSettings(), winRatio: ratio });
    return S.getWinRatio();
  }, { ratio });
}

// Compute, in-page, the exact coda the engine is about to build. keyboard-story.js
// is pure data + pure helpers, so this is a real prediction from the shipping
// module — not a copy of its contents into this script (which would rot).
async function predictCoda(page, rotation) {
  return page.evaluate(async ({ rotation }) => {
    const KS = await import('/js/keyboard-story.js');
    const FQ = await import('/js/finale-quote.js');
    const S  = await import('/js/settings.js');
    const winRatio = S.getWinRatio();
    const pool = KS.buildStoryPool([]);          // [] generated → the static bank
    const story = KS.pickKeyboardStory(pool, rotation);
    const lines = KS.assembleCoda(story, winRatio, rotation);
    return {
      winRatio,
      storyId: story.id,
      storyBase: story.base,
      lines,
      manifestoLines: FQ.finaleLinesForRatio(winRatio).length,
      rendered: KS.renderCodaText(lines),
      coversAllLetters: KS.coversAllLetters(KS.renderCodaText(lines)),
    };
  }, { rotation });
}

// Play Level 25 from its first prompt all the way to the level-complete overlay,
// screenshotting the moment the coda reaches `captureLineIdx`. Returns a summary;
// throws on anything that would make the capture a lie.
async function playCodaAndCapture(page, predicted, captureLineIdx, outPath) {
  const deadline = Date.now() + CODA_TIMEOUT_MS;
  const expected = predicted.lines;
  let codaIdx = -1;          // which coda line the engine is currently serving
  let lastLineKey = null;    // dedupes repeated reads of the same rendered line
  let captured = false;
  let keysTyped = 0;
  let normalPatterns = 0;
  let lastProgressAt = Date.now();

  while (true) {
    if (Date.now() > deadline) {
      throw new Error(`L25 coda: timed out after ${CODA_TIMEOUT_MS}ms (${keysTyped} keys, codaIdx ${codaIdx}/${expected.length - 1})`);
    }

    const st = await readPromptState(page);
    if (st.overlayVisible) {
      if (!captured) throw new Error('L25 coda: level completed before the capture point was reached');
      if (codaIdx < expected.length - 1) {
        throw new Error(`L25 coda: level completed after only ${codaIdx + 1}/${expected.length} coda lines`);
      }
      return { keysTyped, normalPatterns, codaLines: expected.length };
    }
    if (st.activeIndex < 0) {
      // Between patterns (the engine's paced gap) — nothing to type yet.
      if (Date.now() - lastProgressAt > CODA_STALL_MS) {
        throw new Error(`L25 coda: no active prompt and no overlay for ${CODA_STALL_MS}ms (${keysTyped} keys typed)`);
      }
      await page.waitForTimeout(100);
      continue;
    }
    lastProgressAt = Date.now();

    const tokens = st.display.map(displayGlyphToToken);
    const lineKey = JSON.stringify(tokens);

    // Track the coda as an ORDERED sequence: the first line must match
    // expected[0], and every line after it must match the next one. Anything else
    // once the coda has started means the seeding stopped steering the picker.
    if (lineKey !== lastLineKey) {
      lastLineKey = lineKey;
      if (codaIdx === -1) {
        if (lineKey === JSON.stringify(expected[0])) {
          codaIdx = 0;
          console.log(`    coda begins (story "${predicted.storyId}", ${expected.length} lines) after ${normalPatterns} normal patterns`);
        } else {
          normalPatterns++;
        }
      } else if (codaIdx + 1 < expected.length && lineKey === JSON.stringify(expected[codaIdx + 1])) {
        codaIdx++;
      } else {
        throw new Error(
          `L25 coda: engine served an unexpected line at coda index ${codaIdx + 1}. ` +
          `Got ${lineKey}, expected ${JSON.stringify(expected[codaIdx + 1])}. ` +
          'The rotation seeding no longer steers pickKeyboardStory — do NOT trust this frame.'
        );
      }
    }

    // The capture point: standing at the very start of the manifesto capstone,
    // with the pangram and the resolved typo beat already in the document.
    if (!captured && codaIdx === captureLineIdx && st.activeIndex === 0) {
      await page.waitForTimeout(500);   // let the ink/cursor settle for a clean frame
      await page.screenshot({ path: outPath });
      captured = true;
      console.log(`    captured coda frame at line ${codaIdx + 1}/${expected.length} (manifesto capstone begins)`);
    }

    const token = tokens[st.activeIndex];
    // press() (not type()) so 'Backspace'/'Space' fire one named keydown each and a
    // single character fires the correct e.key — including exact-case Shift tokens.
    await page.keyboard.press(token === ' ' ? 'Space' : token, { delay: 5 });
    keysTyped++;
    if (keysTyped > CODA_MAX_KEYS) {
      throw new Error(`L25 coda: exceeded the ${CODA_MAX_KEYS}-key budget without completing`);
    }
    await page.waitForTimeout(25);
  }
}

// The whole L25 path: navigate in with the rotation pinned, predict the coda, play
// it, capture it, and finish the level. Returns a summary for the run log.
async function captureCodaLevel(page, baseUrl, lvl, outPath) {
  const winRatio = Number(process.env.CODA_WIN_RATIO) || 1;

  await goToSelect(page, baseUrl);

  for (let i = 0; i < lvl.actIdx; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(180);
  }
  for (let i = 0; i < lvl.posIdx; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(130);
  }
  await page.keyboard.press('Enter');   // select level -> title/name entry
  await page.waitForTimeout(350);
  await page.keyboard.press('Enter');   // confirm name -> ready
  await page.waitForTimeout(350);
  await page.keyboard.press('Space');   // ready -> keyboard preview
  await page.waitForTimeout(350);

  // EXPERIENCE must be set HERE, after the name confirm — main.js persists the
  // player name with `saveSettings({ ...settings, playerName })` off its own
  // module-level settings object, which would clobber an earlier tier change.
  // Here is still in time: the engine gate and the theme both resolve
  // getWinRatio() live when the level starts, one keypress from now.
  if (winRatio !== 1) {
    const live = await setWinRatio(page, winRatio);
    if (live !== winRatio) {
      throw new Error(`L25 coda: CODA_WIN_RATIO=${winRatio} is not a valid EXPERIENCE tier (settings kept ${live})`);
    }
  }

  const seed = await seedCodaDeterminism(page, CODA_ROTATION);
  if (!seed.ok) throw new Error(`L25 coda: ${seed.reason}`);
  const predicted = await predictCoda(page, CODA_ROTATION);
  if (!Array.isArray(predicted.lines) || !predicted.lines.length) {
    throw new Error('L25 coda: predicted coda is empty — keyboard-story.js contract changed');
  }
  if (!predicted.coversAllLetters) {
    // The coda's whole reason to exist is that the player types every letter A-Z.
    throw new Error('L25 coda: predicted coda does NOT cover all 26 letters — report this, do not ship the frame');
  }

  await page.keyboard.press('Space');   // keyboard preview -> game
  await page.waitForTimeout(600);

  // The manifesto capstone is the tail of the coda, so its first line sits
  // manifestoLines back from the end.
  const captureLineIdx = Math.max(0, predicted.lines.length - predicted.manifestoLines);
  console.log(`    tier ${predicted.winRatio}x · story "${predicted.storyId}" · ${predicted.lines.length} coda lines ` +
              `(${predicted.manifestoLines} manifesto) · capture at line ${captureLineIdx + 1}`);

  const result = await playCodaAndCapture(page, predicted, captureLineIdx, outPath);
  return { ...result, ...predicted };
}

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  // Filter: comma-separated level numbers and/or act slugs. Empty = everything.
  // Optional flags NARROW the blast radius further when an act slug would
  // otherwise drag its five level shots along (content-librarian's minimal-
  // blast-radius rule: never regenerate N images to update 1):
  //   --acts-only    capture the act SELECT-SCREEN pages only, no level shots
  //   --levels-only  capture the level shots only, no act pages
  // e.g. `capture-all.js act4-command-center --acts-only` refreshes exactly
  // docs/screenshots/acts/act4-command-center.png (a cabinet-art change) without
  // re-shooting levels 16-20. Flags may appear in any argument position.
  const argv = process.argv.slice(2);
  const actsOnly = argv.includes('--acts-only');
  const levelsOnly = argv.includes('--levels-only');
  if (actsOnly && levelsOnly) {
    console.error('FATAL: --acts-only and --levels-only are mutually exclusive.');
    process.exit(1);
  }
  const filterArg = argv.find(a => !a.startsWith('--'));
  const filterTokens = filterArg ? filterArg.split(',').map(s => s.trim()).filter(Boolean) : null;
  const filterLevelNums = filterTokens ? new Set(filterTokens.filter(t => /^\d+$/.test(t)).map(Number)) : null;
  const filterActSlugs = filterTokens ? new Set(filterTokens.filter(t => !/^\d+$/.test(t))) : null;
  if (filterTokens) {
    const validLevels = new Set(ALL_LEVELS.map(l => l.levelNum));
    const validActs = new Set(ACTS_CONFIG.map(a => a.slug));
    const bad = filterTokens.filter(t => /^\d+$/.test(t) ? !validLevels.has(Number(t)) : !validActs.has(t));
    if (bad.length) {
      console.error(`FATAL: unknown filter token(s): ${bad.join(', ')} (valid levels: 1-25, valid acts: ${[...validActs].join(', ')})`);
      process.exit(1);
    }
  }
  const actsToRun = levelsOnly
    ? []
    : (filterTokens ? ACTS_CONFIG.filter(a => filterActSlugs.has(a.slug)) : ACTS_CONFIG);
  const levelsToRun = actsOnly
    ? []
    : (filterTokens
        ? ALL_LEVELS.filter(l => filterLevelNums.has(l.levelNum) || filterActSlugs.has(l.actSlug))
        : ALL_LEVELS);

  const BASE_URL = resolveBaseUrl();
  const { browser, page, consoleErrors: errors } = await launchPage();

  // Act pages: navigate between acts within a single session (the select
  // screen shows one act's cabinets at a time — one screenshot per act).
  if (actsToRun.length) {
    console.log('Act pages (' + actsToRun.length + (filterTokens ? ' of ' + ACTS_CONFIG.length : '') + ' acts):');
    await goToSelect(page, BASE_URL);
    let actIdx = 0;
    for (const act of ACTS_CONFIG) {
      if (actsToRun.includes(act)) {
        const out = path.join(SHOTS, 'acts', act.slug + '.png');
        await page.screenshot({ path: out });
        console.log('  acts/' + act.slug + '.png');
      }
      if (actIdx < ACTS_CONFIG.length - 1) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(300);
      }
      actIdx++;
    }
  }

  // Gameplay screens: one per level
  const codaFailures = [];
  if (levelsToRun.length) {
    console.log('\nGameplay (' + levelsToRun.length + (filterTokens ? ' of ' + ALL_LEVELS.length : '') + ' levels):');
    for (const lvl of levelsToRun) {
      const out = path.join(SHOTS, 'levels', lvl.actSlug, lvl.filename + '.png');
      if (lvl.coda) {
        // Level 25: play the level into the "MY STORY" coda and capture THAT,
        // not the pre-game chrome. A failure here is loud on purpose — before
        // this path existed the reference frame had to be shot by hand, and a
        // silent fallback to the chrome shot is exactly the regression that
        // note in docs/features/level-themes.md was guarding against.
        console.log('  levels/' + lvl.actSlug + '/' + lvl.filename + '.png  (coda path — playing L' + lvl.levelNum + ' for real)');
        try {
          const r = await captureCodaLevel(page, BASE_URL, lvl, out);
          console.log(`    LEVEL COMPLETE reached — ${r.keysTyped} keys, ${r.normalPatterns} normal patterns, ${r.codaLines} coda lines, all 26 letters typed.`);
        } catch (err) {
          codaFailures.push(err.message);
          console.error('    CODA CAPTURE FAILED: ' + err.message);
        }
        continue;
      }
      await navigateToLevel(page, BASE_URL, lvl);
      await page.screenshot({ path: out });
      console.log('  levels/' + lvl.actSlug + '/' + lvl.filename + '.png');
    }
  }

  const total = actsToRun.length + levelsToRun.length;
  if (errors.length) {
    console.error('\nJS ERRORS:');
    errors.forEach(e => console.error(' ', e));
    await browser.close();
    process.exit(1);
  }
  if (codaFailures.length) {
    console.error('\nL25 CODA CAPTURE FAILED — the reference frame was NOT regenerated:');
    codaFailures.forEach(e => console.error(' ', e));
    await browser.close();
    process.exit(1);
  }
  console.log('\nDone. ' + total + ' screenshots captured. No JS errors.');

  await browser.close();
})();
