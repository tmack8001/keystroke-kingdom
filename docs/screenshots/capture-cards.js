// Capture every history card ("picked up off the arcade floor") exactly as
// the player sees it: the REAL level-complete overlay DOM, in that level's
// real visual theme, reached by actually playing the level to completion.
//
// Why full playthrough and not a state-injection shortcut: js/main.js is
// loaded as an ES module with zero `window` exposure (no globals for
// `state`, `showLevelComplete`, `applyLevelTheme`, `activeTheme`, etc.). The
// only way to reach the ACTUAL showLevelComplete() render (not a hand-rolled
// DOM reconstruction) is to drive the real keydown listener the same way a
// player's keyboard does. This also matches the project's QA philosophy
// (journal L4/F20: guaranteed beats probabilistic, silent absence ships) —
// every card is captured via the exact code path a real session takes.
//
// ── THE MODEL THIS SCRIPT NOW TARGETS (rebuilt 2026-07-19) ────────────────
// history-cards.js is no longer a one-card-per-level OBJECT. It is a FLAT
// ARRAY (js/history-cards.js `HISTORY_CARDS`): 60 entries = 59 POOLED cards
// (each carrying its EARLIEST-typeable `level`) + 1 SECRET card (`joshua`,
// `level: null`, `secret: true`). A single level now hides a POOL of several
// cards, and each play surfaces exactly ONE guaranteed card, chosen by the
// DETERMINISTIC picker:
//
//   pickGuaranteedCard(level, collectedIds, rotation)
//     pool       = cardsForLevel(level)
//     uncollected= pool.filter(c => !collectedIds.includes(c.id))
//     candidates = uncollected.length ? uncollected : pool
//     return candidates[rotation % candidates.length]
//
// To surface a SPECIFIC target card at its level, we seed the active save
// slot (kk-slots, js/slots.js) so that EVERY other card in that level's pool
// is already collected and ONLY the target is uncollected. Then
// `uncollected === [target]`, `candidates === [target]`, and the picker
// returns the target regardless of rotation. buildPatterns() (js/main.js)
// reads `Slots.collectedIds()` / `Slots.getCardRotation()` fresh from
// localStorage at game start, so writing kk-slots just before the final
// "start the game" keypress is sufficient — no game code is touched.
//
// GUARANTEED, NOT PROBABILISTIC (journal L4): every one of the 59 POOLED
// cards MUST produce a screenshot of ITS OWN card, or the script exits
// non-zero. The expected set is derived from the live data
// (`HISTORY_CARDS.filter(c => !c.secret)`), never a stale literal.
//
// ⚠️ READ THIS BEFORE REPORTING THIS SCRIPT AS BROKEN. The sentence below
// describes a bug that was FIXED on 2026-07-28. It is history, not a
// description of the code you are looking at. Two separate doc-audit passes
// (2026-09-11 and 2026-09-13) have now read it as a present-tense defect and
// reported this script as broken; both times it was verified WORKING by
// actually running it (`node docs/screenshots/capture-cards.js L13` →
// exit 0, 6/6 cards, zero console errors). If you believe it is broken, RUN
// IT FIRST — a comment describing a past failure is not evidence of a
// current one.
//
//   HISTORICAL: before 2026-07-28 this script used a stale `CARD_LEVELS`
//   literal and `Object.keys()` over what became an array at the 2026-07-19
//   model rebuild, which is what broke it then. Neither is in the code now.
//
// THE SECRET CARD (`joshua`, level: null) is NOT reachable via any
// level-complete overlay — it is collected by typing a magic word (wopr /
// joshua / ...) and only ever appears in the collection gallery. It is
// therefore EXCLUDED from the guaranteed per-level loop and captured
// separately, best-effort, from its collection-gallery cell; a failure there
// is logged but NEVER causes a non-zero exit (it is not part of the
// per-level-overlay contract).
//
// Usage:
//   python3 -m http.server 8801 --directory /Users/trevormack/dev/keystroke-kingdom
//   DEV_URL=http://127.0.0.1:8801 node docs/screenshots/capture-cards.js
//   # optional filter — capture only specific card ids or levels:
//   DEV_URL=http://127.0.0.1:8801 node docs/screenshots/capture-cards.js ada-lovelace,pixel
//   DEV_URL=http://127.0.0.1:8801 node docs/screenshots/capture-cards.js L13

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

// Generous per-level safety cap. getNextPattern() falls back to
// drawRandomPattern() forever once the intro/pool list is exhausted, so the
// play loop is otherwise unbounded.
const MAX_PATTERNS_PER_LEVEL = 120;
const MAX_KEYS_PER_PATTERN = 40;
// Tetris (L8) is the one theme whose patternComplete() gate is a real
// placement simulation (LINES_TO_WIN actual line clears), taking anywhere
// from ~200 to 800+ keystrokes run to run — legitimately much longer than the
// ~15-20s other levels finish in. 240s gives generous headroom.
const PER_LEVEL_TIMEOUT_MS = 240_000;
const STALL_TIMEOUT_MS = 8000;

// ── DOM helpers (unchanged from the pre-rebuild script — this logic is the
// correct real-player-visible signal path and is deliberately preserved) ────

// Reverse of js/ui/hud.js promptDisplay(): the DOM shows a friendlier glyph
// for a few tokens than the literal character the engine's keydown handler
// expects. Typing the glyph itself would never match `expected`.
function displayGlyphToToken(display) {
  if (display === '?' || display === ';') return ';'; // old glyph '?' OR the shown ';'
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
// letter, over and over, until the real level-complete overlay unhides (or
// the safety caps trip). Deliberately dumb: it only ever acts on what a human
// player would see on screen (real overlay, not a reconstruction). Failure is
// judged on a GLOBAL wall-clock stall, not a per-pattern budget — some
// patterns legitimately take longer to transition.
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
      if (Date.now() - lastProgressAt > STALL_TIMEOUT_MS) {
        return { ok: false, reason: `no .prompt-letter.active or overlay for ${STALL_TIMEOUT_MS}ms straight (level ${levelNum}, ${keysTyped} keys typed)` };
      }
      await page.waitForTimeout(100);
      continue;
    }

    lastProgressAt = Date.now();
    const token = displayGlyphToToken(display);
    // press() (not type()) so 'Backspace'/'Space' fire one named keydown each,
    // and single characters (letters, digits, symbols, exact-case Shift-token
    // letters) fire the correct e.key uniformly.
    const pressKey = token === ' ' ? 'Space' : token;
    await page.keyboard.press(pressKey, { delay: 5 });
    keysTyped++;
    if (keysTyped > MAX_KEYS_PER_PATTERN * MAX_PATTERNS_PER_LEVEL) {
      return { ok: false, reason: `exceeded overall key budget (${keysTyped} keys, level ${levelNum}) without completing` };
    }
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

    const factEl = $('history-card-fact');
    let overflow = false;
    if (factEl) overflow = factEl.scrollHeight > factEl.clientHeight + 2;

    return {
      overlayVisible: true, cardVisible: true,
      word, title, year, fact, count, isNew, overflow,
      bodyClass: document.body.className,
    };
  });
}

// ── Live data pull: the flat array is the single source of truth ────────────
// Imports js/history-cards.js in-page and returns the whole card list. Every
// downstream decision (which cards to capture, the expected count, the total
// for the "CARD n OF N" check) derives from THIS, never a literal in this
// file — which is the whole point of the fix.
async function fetchLiveCards(page) {
  return page.evaluate(async () => {
    const mod = await import('/js/history-cards.js');
    if (!Array.isArray(mod.HISTORY_CARDS)) {
      return { isArray: false };
    }
    return {
      isArray: true,
      total: mod.TOTAL_CARDS,
      cards: mod.HISTORY_CARDS.map(c => ({
        id: c.id,
        level: c.level,
        secret: !!c.secret,
        word: c.word,
        title: c.title,
        year: c.year,
      })),
    };
  });
}

// Write the active slot's collected-card set (and reset that level's rotation)
// directly into kk-slots so the deterministic picker will surface `targetId`.
// Called AFTER an active slot exists (goToSelect's name-confirm creates slot 0)
// and BEFORE the game starts (buildPatterns reads kk-slots fresh at start).
async function seedCollectedForTarget(page, level, collectedIds) {
  return page.evaluate(({ level, collectedIds }) => {
    let st = null;
    try { st = JSON.parse(localStorage.getItem('kk-slots')); } catch (e) { st = null; }
    if (!st || !Array.isArray(st.slots) || !Number.isInteger(st.active) || !st.slots[st.active]) {
      return { ok: false, reason: 'no active slot to seed' };
    }
    const s = st.slots[st.active];
    s.cards = Array.isArray(collectedIds) ? collectedIds.slice() : [];
    s.cardRotation = s.cardRotation && typeof s.cardRotation === 'object' ? s.cardRotation : {};
    s.cardRotation[String(level)] = 0; // rotation irrelevant once only the target is uncollected
    localStorage.setItem('kk-slots', JSON.stringify(st));
    return { ok: true, active: st.active, collectedCount: s.cards.length };
  }, { level, collectedIds });
}

// Navigate select -> ready -> keyboard-preview, seed the target card into the
// active slot, then Space into the game (which runs buildPatterns -> picker).
async function navigateToLevelAndSeed(page, baseUrl, levelEntry, level, collectedIds) {
  await goToSelect(page, baseUrl);            // creates + activates slot 0, WOPR select
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
  await page.keyboard.press('Enter');   // confirm name -> ready (setActiveName on slot 0)
  await page.waitForTimeout(350);
  await page.keyboard.press('Space');   // ready -> keyboard-preview
  await page.waitForTimeout(350);

  const seed = await seedCollectedForTarget(page, level, collectedIds);   // just-in-time
  if (!seed.ok) throw new Error(`seed failed: ${seed.reason}`);

  await page.keyboard.press('Space');   // keyboard-preview -> game (buildPatterns picks target)
  await page.waitForTimeout(600);
  return seed;
}

// ── Best-effort secret-card capture (collection gallery) ────────────────────
// The secret card is not reachable via a level-complete overlay. Typing a WOPR
// phrase collects it; the slot picker's "C" opens the collection gallery where
// its cell renders. Screenshot that single cell. NEVER affects the exit code.
async function captureSecretCard(page, baseUrl, secretCard) {
  try {
    // goToSelect creates+activates slot 0 and types 'wopr', which calls
    // collectCardId(WARGAMES_CARD_ID) on the active slot — the secret card is
    // now owned and persisted in kk-slots.
    await goToSelect(page, baseUrl);
    await page.reload();                       // a slot now exists -> boots to the slot picker
    await page.waitForTimeout(700);
    await page.keyboard.press('c');            // picker: open the highlighted game's collection
    await page.waitForTimeout(500);

    const cell = page.locator('.collection-cell.secret');
    const n = await cell.count();
    if (n === 0) return { ok: false, reason: 'no .collection-cell.secret found in gallery' };

    const owned = await cell.first().evaluate(el => el.classList.contains('owned'));
    const outPath = path.join(OUT_DIR, 'secret-' + secretCard.id + '.png');
    await cell.first().screenshot({ path: outPath });
    return { ok: true, file: outPath, owned };
  } catch (err) {
    return { ok: false, reason: 'exception: ' + err.message };
  }
}

(async () => {
  const baseUrl = resolveBaseUrl();
  console.log('Base URL:', baseUrl);
  const { browser, page, consoleErrors } = await launchPage();

  // ── Load the live card data (flat array) ────────────────────────────────
  await page.goto(baseUrl);
  const live = await fetchLiveCards(page);
  if (!live.isArray) {
    console.error('FATAL: HISTORY_CARDS is not an array — model changed again; update this script.');
    await browser.close();
    process.exit(1);
  }
  const pooled = live.cards.filter(c => !c.secret);
  const secrets = live.cards.filter(c => c.secret);
  const TOTAL_CARDS = live.total;
  console.log(`Live data: ${live.cards.length} cards total = ${pooled.length} pooled + ${secrets.length} secret (TOTAL_CARDS=${TOTAL_CARDS}).`);

  // Map level -> the full pool of card ids at that level (for the seeding math).
  const poolIdsByLevel = new Map();
  for (const c of pooled) {
    if (!poolIdsByLevel.has(c.level)) poolIdsByLevel.set(c.level, []);
    poolIdsByLevel.get(c.level).push(c.id);
  }

  // Sanity: every pooled card must map to a real, navigable level (1-25).
  const orphans = pooled.filter(c => !ALL_LEVELS.find(l => l.levelNum === c.level));
  if (orphans.length) {
    console.error('FATAL: pooled cards reference levels with no ALL_LEVELS entry:');
    orphans.forEach(c => console.error(`  ${c.id} -> level ${c.level}`));
    await browser.close();
    process.exit(1);
  }

  // Optional CLI filter: comma-separated card ids and/or Lnn level tags. The
  // full pooled set still defines the completeness contract for a full run.
  const filterArg = process.argv[2];
  let targets = pooled;
  if (filterArg) {
    const tokens = filterArg.split(',').map(s => s.trim()).filter(Boolean);
    const idSet = new Set(tokens.filter(t => !/^L\d+$/i.test(t)));
    const levelSet = new Set(tokens.filter(t => /^L\d+$/i.test(t)).map(t => Number(t.slice(1))));
    targets = pooled.filter(c => idSet.has(c.id) || levelSet.has(c.level));
    console.log(`Filtered run: ${targets.length} card(s) [${targets.map(c => c.id).join(', ')}]\n`);
  }

  // Fresh output dir for a full run so stale (old-model) PNGs never linger.
  if (!filterArg) {
    for (const f of fs.readdirSync(OUT_DIR)) {
      if (f.endsWith('.png')) fs.rmSync(path.join(OUT_DIR, f));
    }
  }

  const results = [];   // { id, level, ok, file, ... }
  const issues = [];    // flat list of legibility/content concerns for the report

  for (const card of targets) {
    const levelEntry = ALL_LEVELS.find(l => l.levelNum === card.level);
    const poolIds = poolIdsByLevel.get(card.level) || [card.id];
    const collectedIds = poolIds.filter(id => id !== card.id); // everything BUT the target

    console.log(`[${card.id}] L${card.level} (${levelEntry.levelSlug}) — pool ${poolIds.length}, seeding ${collectedIds.length} collected...`);
    const errorsBefore = consoleErrors.length;

    try {
      await navigateToLevelAndSeed(page, baseUrl, levelEntry, card.level, collectedIds);

      const playResult = await playLevelToCompletion(page, card.level);
      if (!playResult.ok) {
        results.push({ id: card.id, level: card.level, ok: false, reason: playResult.reason });
        console.error(`  FAILED: ${playResult.reason}`);
        continue;
      }

      await page.waitForTimeout(500); // let cardDrop settle for a clean shot

      const cardState = await readCardOverlayState(page);
      if (!cardState.overlayVisible) {
        results.push({ id: card.id, level: card.level, ok: false, reason: 'complete-overlay never became visible' });
        console.error('  FAILED: complete-overlay never became visible');
        continue;
      }
      if (!cardState.cardVisible) {
        results.push({ id: card.id, level: card.level, ok: false, reason: 'history-card stayed hidden (cardWordTyped likely never set)' });
        console.error('  FAILED: history-card stayed hidden');
        continue;
      }

      // Correctness gate: the overlay MUST show the card we forced. If not, the
      // seeding didn't steer the deterministic picker and the capture is wrong.
      const wantWord = card.word.toUpperCase();
      if (cardState.title !== card.title || cardState.word !== wantWord) {
        results.push({
          id: card.id, level: card.level, ok: false,
          reason: `wrong card surfaced: got "${cardState.title}" / "${cardState.word}", wanted "${card.title}" / "${wantWord}"`,
        });
        console.error(`  FAILED: wrong card surfaced (got ${cardState.title}, wanted ${card.title})`);
        continue;
      }

      // Content sanity checks (report-only, never auto-fixed).
      if (!cardState.fact || !cardState.fact.trim()) issues.push(`${card.id}: empty card fact`);
      if (cardState.overflow) issues.push(`${card.id} (${cardState.title}): fact text overflows its box — likely clipped for the player`);
      if (cardState.count && !new RegExp(`OF ${TOTAL_CARDS}$`).test(cardState.count)) {
        issues.push(`${card.id}: card count "${cardState.count}" doesn't end in "OF ${TOTAL_CARDS}" — TOTAL_CARDS mismatch?`);
      }

      const filename = String(card.level).padStart(2, '0') + '-' + card.id + '.png';
      const outPath = path.join(OUT_DIR, filename);
      await page.screenshot({ path: outPath });

      const newErrors = consoleErrors.slice(errorsBefore);
      if (newErrors.length) issues.push(`${card.id}: console errors during capture: ${newErrors.join(' | ')}`);

      results.push({
        id: card.id, level: card.level, ok: true, file: outPath,
        word: cardState.word, title: cardState.title, year: cardState.year,
        count: cardState.count, isNew: cardState.isNew, bodyClass: cardState.bodyClass,
        keysTyped: playResult.keysTyped,
      });
      console.log(`  OK -> ${filename}  [${cardState.title} / ${cardState.year}]  ${cardState.count}  theme=${cardState.bodyClass}`);
    } catch (err) {
      results.push({ id: card.id, level: card.level, ok: false, reason: `exception: ${err.message}` });
      console.error(`  EXCEPTION: ${err.message}`);
    }
  }

  // ── Secret card — best-effort, never gates the exit code ──────────────────
  let secretResult = null;
  if (!filterArg && secrets.length) {
    const secretCard = secrets[0];
    console.log(`\n[secret] ${secretCard.id} (level:null) — not overlay-reachable; capturing from collection gallery...`);
    secretResult = await captureSecretCard(page, baseUrl, secretCard);
    if (secretResult.ok) {
      console.log(`  OK -> ${path.basename(secretResult.file)} (owned=${secretResult.owned}) — informational, not part of the per-level contract.`);
    } else {
      console.log(`  NOTE: secret card not captured (${secretResult.reason}). This does NOT fail the run — the secret card has no level-complete overlay.`);
    }
  }

  await browser.close();

  // ── Final report ──────────────────────────────────────────────────────────
  console.log('\n=== SUMMARY ===');
  const failed = results.filter(r => !r.ok);
  const succeeded = results.filter(r => r.ok);
  console.log(`${succeeded.length}/${targets.length} pooled cards captured${filterArg ? ' (filtered run — ' + pooled.length + ' pooled cards exist)' : ' (of ' + pooled.length + ' pooled cards)'}.`);
  if (secretResult) {
    console.log(`Secret card: ${secretResult.ok ? 'captured (informational)' : 'not captured (' + secretResult.reason + ')'}.`);
  }

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
    console.error('\nFAILED CARDS (guaranteed-capture contract violated — journal L4/F20):');
    failed.forEach(f => console.error(`  ${f.id} (L${f.level}): ${f.reason}`));
    process.exit(1);
  }

  console.log(filterArg
    ? `\nAll ${targets.length} requested cards captured successfully.`
    : `\nAll ${pooled.length} pooled history cards captured successfully.`);
  process.exit(0);
})();
