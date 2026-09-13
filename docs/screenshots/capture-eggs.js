// Captures the kid-safe hidden layer: title-screen magic words (js/main.js
// EGGS), the Konami-code star field, and the WOPR level-select screen.
// See .claude/rules/easter-eggs.md for the full catalog and design rules —
// this script only captures what's already Implemented there.
//
// All eggs answer on the TITLE screen before "INSERT COIN" is pressed
// (state.coinInserted === false — confirmed by reading js/main.js directly,
// 2026-07-12): each letter typed accumulates into secretBuffer, and a match
// against EGGS prints the response into #wopr-text for 5s. This script types
// the fresh phrase from a fresh title load per egg (so the 5s timer window is
// always caught) rather than reusing one page across every phrase.
//
// Usage:
//   python3 -m http.server 8190 --directory /Users/trevormack/dev/keystroke-kingdom
//   DEV_URL=http://127.0.0.1:8190 node docs/screenshots/capture-eggs.js
//   DEV_URL=http://127.0.0.1:8190 node docs/screenshots/capture-eggs.js xyzzy,konami
//   DEV_URL=http://127.0.0.1:8190 node docs/screenshots/capture-eggs.js sudo,allyourbase
//
// NOTE: the wire-check below is FATAL on drift by design — when js/main.js's EGGS
// table gains a phrase, add it to EGG_PHRASES here and capture just the new one(s)
// with the filter argument; the unchanged title shots never need re-shooting.
// This script captures TITLE-screen eggs only. The 2026-09-11 batch added eggs that
// live on other surfaces (the moth + rubber duck on the select screen, the white
// rabbit + Y2K clock in Act 4, the eighth-key confession on the level-complete card,
// the themed 404 served by the Go binary, the dial-up chirp in the mystery
// cinematic) — none of those have a capture path here yet. See
// docs/features/easter-eggs.md "Reference frames" for what is and isn't covered.
//
// Writes docs/screenshots/easter-eggs/*.png

const fs = require('fs');
const path = require('path');
const { launchPage, resolveBaseUrl } = require('../../scripts/kk-playwright');

const OUT_DIR = __dirname + '/easter-eggs';
fs.mkdirSync(OUT_DIR, { recursive: true });

// Mirrors js/main.js EGGS exactly (verified 1:1 against that file). Kept as a
// literal list here (CJS script, EGGS lives inside an ES module meant for the
// browser) — the live in-page check below cross-verifies it hasn't drifted.
const EGG_PHRASES = ['xyzzy', 'iddqd', 'adventure', 'eliza', 'hello',
                     'sudo', 'allyourbase'];   // sudo + allyourbase added 2026-09-11

async function freshTitleLoad(page, baseUrl) {
  await page.goto(baseUrl);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(600);
  await page.click('body');
}

async function verifyEggsMatch(page) {
  const liveKeys = await page.evaluate(async () => {
    // main.js keeps EGGS module-private (no window export) — read the
    // source text instead of importing, since importing js/main.js directly
    // would re-run its top-level side effects (event listeners etc.) a
    // second time on top of the already-booted page.
    const res = await fetch('/js/main.js');
    const text = await res.text();
    const match = text.match(/const EGGS = \{([\s\S]*?)\n\};/);
    if (!match) return null;
    const keys = [...match[1].matchAll(/'([a-z]+)':/g)].map(m => m[1]);
    return keys;
  });
  return liveKeys;
}

(async () => {
  const baseUrl = resolveBaseUrl();
  const { browser, page, consoleErrors } = await launchPage();

  // Wire-check against the live source so a drift is caught loudly.
  await page.goto(baseUrl);
  const liveKeys = await verifyEggsMatch(page);
  if (!liveKeys) {
    console.error('FATAL: could not parse EGGS out of js/main.js — regex drifted from the source shape.');
    await browser.close();
    process.exit(1);
  }
  const expected = [...EGG_PHRASES].sort();
  const live = [...liveKeys].sort();
  const same = expected.length === live.length && expected.every((v, i) => v === live[i]);
  if (!same) {
    console.error('FATAL: EGG_PHRASES in this script does not match EGGS in js/main.js');
    console.error('  script :', expected.join(','));
    console.error('  live   :', live.join(','));
    await browser.close();
    process.exit(1);
  }
  console.log(`Wire-check OK: ${live.length} egg phrases match js/main.js exactly.\n`);

  const filterArg = process.argv[2];
  const runSet = filterArg ? new Set(filterArg.split(',').map(s => s.trim())) : null;
  const shouldRun = (name) => !runSet || runSet.has(name);

  const results = []; // { name, ok, file, reason }

  // ── Magic-word responses ──────────────────────────────────────────────
  for (const phrase of EGG_PHRASES) {
    if (!shouldRun(phrase)) continue;
    try {
      await freshTitleLoad(page, baseUrl);
      await page.keyboard.type(phrase, { delay: 20 });
      await page.waitForTimeout(300);
      const responseText = await page.evaluate(() => document.getElementById('wopr-text').textContent);
      if (!responseText || !responseText.trim()) {
        results.push({ name: phrase, ok: false, reason: 'wopr-text empty after typing phrase' });
        console.error(`  FAILED ${phrase}: wopr-text empty`);
        continue;
      }
      const outPath = path.join(OUT_DIR, `title-${phrase}.png`);
      await page.screenshot({ path: outPath });
      results.push({ name: phrase, ok: true, file: outPath, responseText });
      console.log(`  OK -> title-${phrase}.png  ["${responseText}"]`);
    } catch (err) {
      results.push({ name: phrase, ok: false, reason: `exception: ${err.message}` });
      console.error(`  EXCEPTION ${phrase}: ${err.message}`);
    }
  }

  // ── Konami code star field ────────────────────────────────────────────
  if (shouldRun('konami')) {
    try {
      await freshTitleLoad(page, baseUrl);
      const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
      for (const key of KONAMI) {
        await page.keyboard.press(key);
        await page.waitForTimeout(60);
      }
      await page.waitForTimeout(300);
      const responseText = await page.evaluate(() => document.getElementById('wopr-text').textContent);
      const starCount = await page.evaluate(() => document.querySelectorAll('.star.bright').length);
      if (starCount === 0) {
        results.push({ name: 'konami', ok: false, reason: 'no .star.bright elements found after Konami sequence' });
        console.error('  FAILED konami: no bright stars appeared');
      } else {
        const outPath = path.join(OUT_DIR, 'title-konami.png');
        await page.screenshot({ path: outPath });
        results.push({ name: 'konami', ok: true, file: outPath, responseText, starCount });
        console.log(`  OK -> title-konami.png  [${starCount} bright stars, "${responseText}"]`);
      }
    } catch (err) {
      results.push({ name: 'konami', ok: false, reason: `exception: ${err.message}` });
      console.error(`  EXCEPTION konami: ${err.message}`);
    }
  }

  // ── WOPR select screen ─────────────────────────────────────────────────
  if (shouldRun('wopr-select')) {
    try {
      await freshTitleLoad(page, baseUrl);
      await page.keyboard.type('wopr', { delay: 20 });
      await page.waitForTimeout(500);
      const onSelect = await page.evaluate(() => {
        const el = document.getElementById('select-screen');
        return !!el && !el.classList.contains('hidden');
      });
      if (!onSelect) {
        results.push({ name: 'wopr-select', ok: false, reason: 'select-screen not visible after typing wopr' });
        console.error('  FAILED wopr-select: select-screen never appeared');
      } else {
        const outPath = path.join(OUT_DIR, 'wopr-select-screen.png');
        await page.screenshot({ path: outPath });
        results.push({ name: 'wopr-select', ok: true, file: outPath });
        console.log('  OK -> wopr-select-screen.png');
      }
    } catch (err) {
      results.push({ name: 'wopr-select', ok: false, reason: `exception: ${err.message}` });
      console.error(`  EXCEPTION wopr-select: ${err.message}`);
    }
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
