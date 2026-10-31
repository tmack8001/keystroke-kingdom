// Captures the game's chrome screens — everything that isn't gameplay itself
// (levels/), the act pages (acts/), history cards (history-cards/), the
// cinematics (cinematics/), the hidden layer (easter-eggs/), or Free Play
// (freeplay/). This is the "furniture of the game" set: title/attract, name
// entry, the READY reveal, keyboard-preview, the returning-player slot picker
// ("CHOOSE YOUR GAME" — slots-picker + its X erase-confirm), the card
// collection gallery (C from the picker), settings (default + Survival-active),
// and the two level-ending overlays (win / survival game-over).
//
// The slot picker + collection replaced the RETIRED single-save "continue"
// screen (kk-progress) when save slots landed (2026-07-19); those three
// screens are seeded straight into kk-slots (js/slots.js shape) and reached by
// reloading — boot() auto-shows the picker whenever any slot exists.
//
// Usage:
//   python3 -m http.server 8190 --directory /Users/trevormack/dev/keystroke-kingdom
//   DEV_URL=http://127.0.0.1:8190 node docs/screenshots/capture-screens.js
//   DEV_URL=http://127.0.0.1:8190 node docs/screenshots/capture-screens.js title,settings-survival
//   DEV_URL=http://127.0.0.1:8190 node docs/screenshots/capture-screens.js slots,collection
//
// Writes docs/screenshots/screens/*.png
//
// NOTE (2026-07-12): a concurrent agent is adding a replay option to the
// level-complete / game-over screens while this script was written. Capture
// reflects whatever state those screens are in at run time — the important
// property is that this script is fully rerunnable, not that any one run's
// pixels are pinned to a particular in-flight DOM.

const fs = require('fs');
const path = require('path');
const {
  launchPage,
  resolveBaseUrl,
  goToSelect,
  goFromSelectIntoGame,
} = require('../../scripts/kk-playwright');

const OUT_DIR = path.join(__dirname, 'screens');
fs.mkdirSync(OUT_DIR, { recursive: true });

async function freshLoad(page, baseUrl, seedFn) {
  await page.goto(baseUrl);
  await page.evaluate(() => localStorage.clear());
  if (seedFn) await page.evaluate(seedFn);
  await page.reload();
  await page.waitForTimeout(600);
  await page.click('body');
}

async function readActiveToken(page) {
  return page.evaluate(() => {
    const el = document.querySelector('.prompt-letter.active');
    return el ? el.textContent : null;
  });
}
function displayGlyphToToken(display) {
  if (display === '?' || display === ';') return ';'; // old glyph '?' OR the shown ';'
  if (display === '␣') return ' ';
  if (display === '⌫') return 'Backspace';
  return display;
}
async function isOverlayVisible(page, id) {
  return page.evaluate((elId) => {
    const el = document.getElementById(elId);
    return !!el && !el.classList.contains('hidden');
  }, id);
}

// Pull the live history-card ids + total straight from js/history-cards.js so
// the slot/collection seeds never go stale against a literal in this file
// (same technique capture-cards.js uses). Requires the app already loaded.
async function fetchCardIds(page, baseUrl) {
  await page.goto(baseUrl);
  return page.evaluate(async () => {
    const mod = await import('/js/history-cards.js');
    return {
      total: mod.TOTAL_CARDS,
      ids: mod.HISTORY_CARDS.map(c => c.id),
      // The two OTHER banks (bonus-wing + act cards). Separate arrays on purpose —
      // TOTAL_CARDS counts only the arcade bank — so the gallery renders them as
      // their own shelves. Seeding them is the only way a capture shows a shelf
      // holding an EARNED card rather than a row of ??? (2026-10-30).
      wingIds: (mod.WING_CARDS || []).map(c => c.id),
      actIds: (mod.ACT_CARDS || []).map(c => c.id),
    };
  });
}

// Write a kk-slots store (js/slots.js shape: { v, active, slots:[…] }) into
// localStorage on a clean load, then reload — boot() auto-shows the slot picker
// whenever any slot exists (js/main.js boot()). Same "seed into localStorage,
// reload, read from it" pattern as capture-cards.js.
async function seedSlotsAndReload(page, baseUrl, slotsStore) {
  await page.goto(baseUrl);
  await page.evaluate((store) => {
    localStorage.clear();
    localStorage.setItem('kk-slots', JSON.stringify(store));
  }, slotsStore);
  await page.reload();
  await page.waitForTimeout(700);
  await page.click('body');
}

// Types whatever the DOM's active prompt letter is until the given overlay
// unhides. Same approach as capture-cards.js (see that file's header for
// why this is preferred over any hand-rolled DOM state injection).
async function playUntilOverlay(page, overlayId, maxKeys = 400, stallMs = 8000) {
  let keysTyped = 0;
  let lastProgressAt = Date.now();
  while (true) {
    if (await isOverlayVisible(page, overlayId)) return { ok: true, keysTyped };
    const display = await readActiveToken(page);
    if (display === null) {
      if (Date.now() - lastProgressAt > stallMs) {
        return { ok: false, reason: `no active prompt or overlay for ${stallMs}ms (${keysTyped} keys typed)` };
      }
      await page.waitForTimeout(100);
      continue;
    }
    lastProgressAt = Date.now();
    const token = displayGlyphToToken(display);
    const pressKey = token === ' ' ? 'Space' : token;
    await page.keyboard.press(pressKey, { delay: 5 });
    keysTyped++;
    if (keysTyped > maxKeys) return { ok: false, reason: `exceeded ${maxKeys} keys without completion` };
    await page.waitForTimeout(40);
  }
}

(async () => {
  const baseUrl = resolveBaseUrl();
  const { browser, page, consoleErrors } = await launchPage();

  const filterArg = process.argv[2];
  const runSet = filterArg ? new Set(filterArg.split(',').map(s => s.trim())) : null;
  const shouldRun = (name) => !runSet || runSet.has(name);

  const results = []; // { name, ok, file, reason }
  const shot = async (name) => {
    const outPath = path.join(OUT_DIR, `${name}.png`);
    await page.screenshot({ path: outPath });
    results.push({ name, ok: true, file: outPath });
    console.log(`  OK -> ${name}.png`);
  };
  const fail = (name, reason) => {
    results.push({ name, ok: false, reason });
    console.error(`  FAILED ${name}: ${reason}`);
  };

  // ── 1. Title / attract screen ───────────────────────────────────────────
  if (shouldRun('title')) {
    try {
      await freshLoad(page, baseUrl);
      await shot('title-attract');
    } catch (e) { fail('title-attract', e.message); }
  }

  // ── 2. Name entry: prefilled + mid-typing ───────────────────────────────
  if (shouldRun('name-entry')) {
    try {
      await freshLoad(page, baseUrl);
      await page.keyboard.press('Enter'); // insert coin -> name entry, prefilled "PLAYER ONE"
      await page.waitForTimeout(350);
      await shot('name-entry-prefilled');

      // Mid-typing: clear + type a fresh name (mirrors "any key clears" rule)
      await page.fill('#player-name-input', '');
      await page.keyboard.type('OONA', { delay: 60 });
      await page.waitForTimeout(200);
      await shot('name-entry-mid-typing');
    } catch (e) { fail('name-entry', e.message); }
  }

  // ── 3. READY reveal ──────────────────────────────────────────────────────
  if (shouldRun('ready')) {
    try {
      await freshLoad(page, baseUrl);
      await page.keyboard.press('Enter'); // -> name entry
      await page.waitForTimeout(350);
      await page.keyboard.press('Enter'); // confirm name -> ready screen
      await page.waitForTimeout(450);
      await shot('ready-reveal');
    } catch (e) { fail('ready-reveal', e.message); }
  }

  // ── 4. Keyboard preview: early level + number-row level ─────────────────
  if (shouldRun('keyboard-preview')) {
    try {
      // Level 1 (early: only J/F active, rest fog-of-war)
      await goToSelect(page, baseUrl);
      await page.keyboard.press('Enter');   // select level 1 -> title/name entry
      await page.waitForTimeout(350);
      await page.keyboard.press('Enter');   // confirm name -> ready
      await page.waitForTimeout(350);
      await page.keyboard.press('Space');   // ready -> keyboard-preview
      await page.waitForTimeout(400);
      await shot('keyboard-preview-level1');
    } catch (e) { fail('keyboard-preview-level1', e.message); }

    try {
      // Level 16 (act4-command-center, position 1 = SimCity 2000, 5/6 keys —
      // first number-row level) via WOPR bypass navigation.
      await goToSelect(page, baseUrl);
      await page.keyboard.press('ArrowDown'); // act2
      await page.waitForTimeout(200);
      await page.keyboard.press('ArrowDown'); // act3
      await page.waitForTimeout(200);
      await page.keyboard.press('ArrowDown'); // act4
      await page.waitForTimeout(200);
      await page.keyboard.press('Enter');     // select level 16 -> title/name entry
      await page.waitForTimeout(350);
      await page.keyboard.press('Enter');     // confirm name -> ready
      await page.waitForTimeout(350);
      await page.keyboard.press('Space');     // ready -> keyboard-preview
      await page.waitForTimeout(400);
      await shot('keyboard-preview-level16-numbers');
    } catch (e) { fail('keyboard-preview-level16-numbers', e.message); }
  }

  // ── 5. Slot picker ("CHOOSE YOUR GAME") + its X erase-confirm, and the
  //      collection gallery (C from the picker). These replaced the retired
  //      single-save "continue"/kk-progress flow (save slots, 2026-07-19). All
  //      three are seeded straight into kk-slots (js/slots.js shape) and reached
  //      by reloading — boot() auto-shows the picker whenever any slot exists.
  //      Card ids are pulled live from js/history-cards.js so ★ counts and the
  //      found/??? split never go stale.

  // ── 5a. Slot picker + erase-confirm (filter name: "slots") ──────────────
  if (shouldRun('slots')) {
    try {
      const { ids } = await fetchCardIds(page, baseUrl);
      // A few games with varied names / levels / ★ card counts, matching the
      // onboarding doc's example picker (OONA LV12 ★14, DAD LV20 ★9, GRAM LV4 ★1).
      const mkSlot = (name, furthestLevel, cardCount) => ({
        name, furthestLevel, completed: {}, nameMoment: null, textWorlds: {},
        cards: ids.slice(0, Math.min(cardCount, ids.length)), cardRotation: {},
      });
      const store = {
        v: 1,
        active: 0, // ▶ cursor lands on the first game (state.slotsSelected == 0)
        slots: [
          mkSlot('OONA', 12, 14),
          mkSlot('DAD', 20, 9),
          mkSlot('GRAM', 4, 1),
        ],
      };
      await seedSlotsAndReload(page, baseUrl, store);
      await page.waitForSelector('.slot-row', { timeout: 5000 });
      await shot('slots-picker');

      // X on the highlighted game brings up the Y/N erase confirmation.
      await page.keyboard.press('x');
      await page.waitForSelector('#slots-erase:not(.hidden)', { timeout: 3000 });
      await page.waitForTimeout(150);
      await shot('slots-erase-confirm');
    } catch (e) { fail('slots-picker', e.message); }
  }

  // ── 5b. Collection gallery (filter name: "collection") ──────────────────
  if (shouldRun('collection')) {
    try {
      const { ids, wingIds, actIds } = await fetchCardIds(page, baseUrl);
      // A MIX of collected ids so found cards render AND some ??? locked cells
      // show. Every other id + rubber-duck/hello-world (their now-wrapping
      // labels are worth exercising).
      const mix = ids.filter((_, i) => i % 2 === 0);
      for (const must of ['rubber-duck', 'hello-world']) {
        if (ids.includes(must) && !mix.includes(must)) mix.push(must);
      }
      // ...plus the SAME found/??? split on the wing and act shelves (every other
      // id, at least one each), so THE HARDWARE and ACT 1 shelves render with an
      // earned card on them. Ids come from js/history-cards.js, never literals.
      const half = (list) => list.filter((_, i) => i % 2 === 0);
      for (const id of [...half(wingIds), ...half(actIds)]) if (!mix.includes(id)) mix.push(id);
      const store = {
        v: 1,
        active: 0,
        slots: [{
          name: 'OONA', furthestLevel: 25, completed: {}, nameMoment: null,
          textWorlds: {}, cards: mix, cardRotation: {},
        }],
      };
      await seedSlotsAndReload(page, baseUrl, store);
      await page.waitForSelector('.slot-row', { timeout: 5000 });

      // C on the highlighted game opens its card collection gallery.
      await page.keyboard.press('c');
      await page.waitForSelector('.collection-cell.owned', { timeout: 3000 });
      await page.waitForTimeout(200);
      await shot('collection-gallery');

      // The wing/act shelves sit BELOW the arcade bank's cells, so the first frame
      // may not reach them. Scroll the last shelf into view for its own frame.
      const shelfCount = await page.locator('.collection-shelf').count();
      if (shelfCount > 1) {
        await page.locator('.collection-shelf').last().scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await shot('collection-gallery-shelves');
      } else {
        fail('collection-gallery-shelves', `expected wing/act shelves, found ${shelfCount} shelf`);
      }
    } catch (e) { fail('collection-gallery', e.message); }
  }

  // ── 6. Settings: ADVENTURE default + SURVIVAL active ─────────────────────
  if (shouldRun('settings')) {
    try {
      await freshLoad(page, baseUrl);
      await page.keyboard.press('Tab'); // title -> settings
      await page.waitForTimeout(300);
      await shot('settings-adventure-default');

      // First row is PLAY STYLE by default (state.settingsSelectedRow = 0) —
      // ArrowRight cycles adventure -> survival, which then activates the
      // LIVES and DIFFICULTY rows underneath it.
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(200);
      await shot('settings-survival-active');
    } catch (e) { fail('settings', e.message); }
  }

  // ── 7. Level-complete overlay (Level 1 — fastest level, no history card) ─
  if (shouldRun('level-complete')) {
    try {
      await goToSelect(page, baseUrl);
      await goFromSelectIntoGame(page); // lands on level 1 (default selection)
      const result = await playUntilOverlay(page, 'complete-overlay');
      if (!result.ok) {
        fail('level-complete', result.reason);
      } else {
        await page.waitForTimeout(400); // settle cardDrop/complete animation
        await shot('level-complete-overlay');
      }
    } catch (e) { fail('level-complete', e.message); }
  }

  // ── 8. Survival game-over (seed survival + expert + 1 life, let a timer
  //      expire on the fastest low-tier level) ──────────────────────────────
  if (shouldRun('game-over')) {
    try {
      // goToSelect() itself does localStorage.clear() + reload internally, so
      // settings must be seeded AFTER it returns, then re-loaded via an
      // explicit reload — main.js reads `settings` once at module top-level
      // (js/main.js:146 `const settings = getSettings()`), so the survival
      // wrapper only sees a seeded kk-settings value across a fresh page load.
      await goToSelect(page, baseUrl);
      await page.evaluate(() => {
        localStorage.setItem('kk-settings', JSON.stringify({
          playStyle: 'survival',
          lives: 1,
          difficulty: 'expert',
          hintStyle: 'moderate',
          mistakeDisplay: 'small',
          sound: true,
          crtEffects: true,
          statsVisible: true,
          playerName: 'PLAYER ONE',
        }));
      });
      await page.reload();
      await page.waitForTimeout(600);
      await page.click('body');
      // Reimplement the title -> wopr -> select tail of goToSelect() by hand
      // (rather than calling it again) since it always clears localStorage
      // first and the settings seed must survive into the select/game screens.
      await page.keyboard.type('wopr');
      await page.waitForTimeout(500);
      await goFromSelectIntoGame(page); // level 1, survival active, 1 life
      // Never type — let the pattern's timer expire on its own so the ONE
      // life is lost and the real gameover-overlay flow fires, exactly as a
      // player who freezes up would trigger it.
      const gameOverAppeared = await page.waitForFunction(() => {
        const el = document.getElementById('gameover-overlay');
        return el && !el.classList.contains('hidden');
      }, { timeout: 20000 }).then(() => true).catch(() => false);
      if (!gameOverAppeared) {
        fail('game-over', 'gameover-overlay never appeared within 20s of idling on Level 1 (EXPERT, 1 life)');
      } else {
        await page.waitForTimeout(300);
        await shot('survival-game-over');
      }
    } catch (e) { fail('game-over', e.message); }
  }

  console.log('\n=== SUMMARY ===');
  const failed = results.filter(r => !r.ok);
  console.log(`${results.length - failed.length}/${results.length} captures succeeded.`);

  if (consoleErrors.length) {
    console.log('\nCONSOLE ERRORS:');
    consoleErrors.forEach(e => console.log('  ' + e));
  } else {
    console.log('\nNo console errors.');
  }

  await browser.close();

  if (failed.length) {
    console.error('\nFAILED CAPTURES:');
    failed.forEach(f => console.error(`  ${f.name}: ${f.reason}`));
    process.exit(1);
  }
  process.exit(0);
})();
