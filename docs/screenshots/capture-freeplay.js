// Captures Free Play (js/freeplay.js — press F on the select screen): the
// full-keyboard sentence-typing HUD with live WPM, and Free Play layered
// under SURVIVAL mode (quarters + WPM + timer bar all coexisting at once —
// js/main.js:751-767 toggles #hud-quarters-line off state.survival.active
// and #hud-wpm-line off state.freePlay independently, so both can be visible
// together, which is exactly what this second capture verifies).
//
// Usage:
//   python3 -m http.server 8190 --directory /Users/trevormack/dev/keystroke-kingdom
//   DEV_URL=http://127.0.0.1:8190 node docs/screenshots/capture-freeplay.js
//   DEV_URL=http://127.0.0.1:8190 node docs/screenshots/capture-freeplay.js adventure
//
// Writes docs/screenshots/freeplay/*.png

const fs = require('fs');
const path = require('path');
const { launchPage, resolveBaseUrl, goToSelect } = require('../../scripts/kk-playwright');

const OUT_DIR = path.join(__dirname, 'freeplay');
fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const baseUrl = resolveBaseUrl();
  const { browser, page, consoleErrors } = await launchPage();

  const filterArg = process.argv[2];
  const runSet = filterArg ? new Set(filterArg.split(',').map(s => s.trim())) : null;
  const shouldRun = (name) => !runSet || runSet.has(name);

  const results = [];
  const fail = (name, reason) => {
    results.push({ name, ok: false, reason });
    console.error(`  FAILED ${name}: ${reason}`);
  };
  const shot = async (name) => {
    const outPath = path.join(OUT_DIR, `${name}.png`);
    await page.screenshot({ path: outPath });
    results.push({ name, ok: true, file: outPath });
    console.log(`  OK -> ${name}.png`);
  };

  // ── 1. Free Play, ADVENTURE (default): sentence + live WPM ──────────────
  if (shouldRun('adventure')) {
    try {
      await goToSelect(page, baseUrl);
      await page.keyboard.press('f'); // toggle Free Play on select screen
      await page.waitForTimeout(250);
      await page.keyboard.press('Enter'); // select cabinet -> title/name entry
      await page.waitForTimeout(350);
      await page.keyboard.press('Enter'); // confirm name -> ready
      await page.waitForTimeout(350);
      await page.keyboard.press('Space'); // ready -> keyboard-preview
      await page.waitForTimeout(350);
      await page.keyboard.press('Space'); // keyboard-preview -> game
      await page.waitForTimeout(500);

      // Type a few correct keys so live WPM has a non-placeholder value.
      for (let i = 0; i < 4; i++) {
        const display = await page.evaluate(() => {
          const el = document.querySelector('.prompt-letter.active');
          return el ? el.textContent : null;
        });
        if (!display) break;
        const token = display === '␣' ? 'Space' : (display === '⌫' ? 'Backspace' : (display === '?' ? ';' : display));
        await page.keyboard.press(token, { delay: 5 });
        await page.waitForTimeout(120);
      }
      await page.waitForTimeout(300);

      const freePlayOn = await page.evaluate(() => {
        const el = document.getElementById('hud-wpm-line');
        return !!el && !el.classList.contains('hidden');
      });
      if (!freePlayOn) {
        fail('freeplay-adventure', 'hud-wpm-line stayed hidden — Free Play toggle did not take effect');
      } else {
        await shot('freeplay-adventure-hud');
      }
    } catch (e) { fail('freeplay-adventure', e.message); }
  }

  // ── 2. Free Play, SURVIVAL: quarters + WPM + timer coexisting ───────────
  if (shouldRun('survival')) {
    try {
      // Same settings-seeding technique as capture-screens.js's game-over
      // capture: goToSelect() clears localStorage internally, so kk-settings
      // must be seeded AFTER it returns, then the page reloaded (main.js
      // reads `settings` once at module top-level, js/main.js:146), then the
      // title -> wopr -> select tail redone by hand (without re-clearing).
      await goToSelect(page, baseUrl);
      await page.evaluate(() => {
        localStorage.setItem('kk-settings', JSON.stringify({
          playStyle: 'survival',
          lives: 3,
          difficulty: 'novice',
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
      await page.keyboard.type('wopr');
      await page.waitForTimeout(500);

      await page.keyboard.press('f'); // toggle Free Play on select screen
      await page.waitForTimeout(250);
      await page.keyboard.press('Enter'); // select cabinet -> title/name entry
      await page.waitForTimeout(350);
      await page.keyboard.press('Enter'); // confirm name -> ready
      await page.waitForTimeout(350);
      await page.keyboard.press('Space'); // ready -> keyboard-preview
      await page.waitForTimeout(350);
      await page.keyboard.press('Space'); // keyboard-preview -> game
      await page.waitForTimeout(500);

      for (let i = 0; i < 3; i++) {
        const display = await page.evaluate(() => {
          const el = document.querySelector('.prompt-letter.active');
          return el ? el.textContent : null;
        });
        if (!display) break;
        const token = display === '␣' ? 'Space' : (display === '⌫' ? 'Backspace' : (display === '?' ? ';' : display));
        await page.keyboard.press(token, { delay: 5 });
        await page.waitForTimeout(120);
      }
      await page.waitForTimeout(300);

      const state = await page.evaluate(() => ({
        wpmVisible: !document.getElementById('hud-wpm-line').classList.contains('hidden'),
        quartersVisible: !document.getElementById('hud-quarters-line').classList.contains('hidden'),
        timerVisible: !document.getElementById('survival-timer-track').classList.contains('hidden'),
      }));
      if (!state.wpmVisible || !state.quartersVisible || !state.timerVisible) {
        fail('freeplay-survival', `expected all three HUD elements visible, got ${JSON.stringify(state)}`);
      } else {
        await shot('freeplay-survival-hud');
      }
    } catch (e) { fail('freeplay-survival', e.message); }
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
