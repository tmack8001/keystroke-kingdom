// Captures Act 6 — Text Worlds (the back-wall door on the select screen):
// the door itself, the hub chooser, and a representative state from each of
// the wing's 5 worlds. Mirrors capture-freeplay.js's structure (subset filter,
// fail-soft per capture, console-error summary).
//
// Usage:
//   python3 -m http.server 8210 --directory /Users/trevormack/dev/keystroke-kingdom
//   DEV_URL=http://127.0.0.1:8210 node docs/screenshots/capture-textworlds.js
//   DEV_URL=http://127.0.0.1:8210 node docs/screenshots/capture-textworlds.js glimmerdeep,glimmerdeep-reveal
//
// Subset names: door, hub, greendragon, greendragon-finale, glimmerdeep,
// glimmerdeep-reveal, whisperwood, whisperwood-reveal, maker-built,
// maker-alive, friend-picker, friend-chat, friend-make
//
// Writes docs/screenshots/textworlds/*.png. This script does NOT renumber the
// existing 01-11 reference set (captured ad hoc while the wing was built) —
// new captures land under their own descriptive names so nothing is clobbered.

const fs = require('fs');
const path = require('path');
const { launchPage, resolveBaseUrl, goToSelect } = require('../../scripts/kk-playwright');

const OUT_DIR = path.join(__dirname, 'textworlds');
fs.mkdirSync(OUT_DIR, { recursive: true });

// goToSelect() already lands with state.selectBypass = true (the wopr egg),
// which is what door.js's doorUnlocked() checks — so the door is always lit
// for capture regardless of real progress.
async function goToDoor(page) {
  for (let i = 0; i < 5; i++) {           // past act5 (4 rows) + 1 more reveals the door
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(180);
  }
}

async function enterDoor(page) {
  await page.keyboard.press(' ');          // door sub-view -> enterTextWorld() -> hub menu
  await page.waitForTimeout(400);
}

// worldIdx: 0 greendragon, 1 glimmerdeep(cave), 2 whisperwood(forest), 3 maker, 4 imfriend
async function enterWorld(page, worldIdx) {
  for (let i = 0; i < worldIdx; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(150);
  }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
}

(async () => {
  const baseUrl = resolveBaseUrl();
  const { browser, page, consoleErrors } = await launchPage();

  const filterArg = process.argv[2];
  const runSet = filterArg ? new Set(filterArg.split(',').map((s) => s.trim())) : null;
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

  // ── door + hub ───────────────────────────────────────────────────────────
  if (shouldRun('door')) {
    try {
      await goToSelect(page, baseUrl);
      await goToDoor(page);
      await shot('door-standalone');
    } catch (e) { fail('door', e.message); }
  }

  if (shouldRun('hub')) {
    try {
      await goToSelect(page, baseUrl);
      await goToDoor(page);
      await enterDoor(page);
      await shot('hub-standalone');
    } catch (e) { fail('hub', e.message); }
  }

  // ── THE GREEN DRAGON (prose) ────────────────────────────────────────────
  if (shouldRun('greendragon')) {
    try {
      await goToSelect(page, baseUrl);
      await goToDoor(page);
      await enterDoor(page);
      await enterWorld(page, 0);
      await shot('greendragon-standalone');
    } catch (e) { fail('greendragon', e.message); }
  }

  if (shouldRun('greendragon-finale')) {
    try {
      await goToSelect(page, baseUrl);
      await goToDoor(page);
      await enterDoor(page);
      await enterWorld(page, 0);
      // clearing: take lamp, go north
      for (const cmd of ['take lamp', 'go north']) {
        for (const ch of cmd) await page.keyboard.press(ch === ' ' ? ' ' : ch, { delay: 5 });
        await page.waitForTimeout(150);
      }
      // brook: talk badger, go north
      for (const cmd of ['talk badger', 'go north']) {
        for (const ch of cmd) await page.keyboard.press(ch === ' ' ? ' ' : ch, { delay: 5 });
        await page.waitForTimeout(150);
      }
      // cavemouth: light lamp, go in
      for (const cmd of ['light lamp', 'go in']) {
        for (const ch of cmd) await page.keyboard.press(ch === ' ' ? ' ' : ch, { delay: 5 });
        await page.waitForTimeout(150);
      }
      // hall: greet dragon
      for (const ch of 'greet dragon') await page.keyboard.press(ch === ' ' ? ' ' : ch, { delay: 5 });
      await page.waitForTimeout(1500); // let the gold win-flourish land
      await shot('greendragon-finale-standalone');
    } catch (e) { fail('greendragon-finale', e.message); }
  }

  // ── THE GLIMMER DEEP (tile world 1 — cave) ──────────────────────────────
  if (shouldRun('glimmerdeep')) {
    try {
      await goToSelect(page, baseUrl);
      await goToDoor(page);
      await enterDoor(page);
      await enterWorld(page, 1);
      await shot('glimmerdeep-standalone');
    } catch (e) { fail('glimmerdeep', e.message); }
  }

  if (shouldRun('glimmerdeep-reveal')) {
    try {
      await goToSelect(page, baseUrl);
      await goToDoor(page);
      await enterDoor(page);
      await enterWorld(page, 1);
      // "south then east" — the always-open route (map: left column + bottom row)
      for (let i = 0; i < 6; i++) { await page.keyboard.press('s', { delay: 5 }); await page.waitForTimeout(80); }
      for (let i = 0; i < 12; i++) { await page.keyboard.press('e', { delay: 5 }); await page.waitForTimeout(80); }
      await page.waitForTimeout(1200); // let the crystal-cavern reveal bloom in
      await shot('glimmerdeep-reveal-standalone');
    } catch (e) { fail('glimmerdeep-reveal', e.message); }
  }

  // ── THE WHISPERWOOD (tile world 2 — forest) ─────────────────────────────
  if (shouldRun('whisperwood')) {
    try {
      await goToSelect(page, baseUrl);
      await goToDoor(page);
      await enterDoor(page);
      await enterWorld(page, 2);
      await shot('whisperwood-standalone');
    } catch (e) { fail('whisperwood', e.message); }
  }

  if (shouldRun('whisperwood-reveal')) {
    try {
      await goToSelect(page, baseUrl);
      await goToDoor(page);
      await enterDoor(page);
      await enterWorld(page, 2);
      for (let i = 0; i < 6; i++) { await page.keyboard.press('s', { delay: 5 }); await page.waitForTimeout(80); }
      for (let i = 0; i < 12; i++) { await page.keyboard.press('e', { delay: 5 }); await page.waitForTimeout(80); }
      await page.waitForTimeout(1200);
      await shot('whisperwood-reveal-standalone');
    } catch (e) { fail('whisperwood-reveal', e.message); }
  }

  // ── YOUR OWN WORLD (the maker) ───────────────────────────────────────────
  if (shouldRun('maker-built')) {
    try {
      await goToSelect(page, baseUrl);
      await goToDoor(page);
      await enterDoor(page);
      await enterWorld(page, 3);
      for (const w of ['sun', 'tree', 'house', 'flower', 'bird']) {
        for (const ch of w) await page.keyboard.press(ch, { delay: 5 });
        await page.waitForTimeout(150);
      }
      await shot('maker-built-standalone');
    } catch (e) { fail('maker-built', e.message); }
  }

  if (shouldRun('maker-alive')) {
    try {
      await goToSelect(page, baseUrl);
      await goToDoor(page);
      await enterDoor(page);
      await enterWorld(page, 3);
      for (const w of ['sun', 'tree', 'house', 'flower', 'bird', 'cloud']) {
        for (const ch of w) await page.keyboard.press(ch, { delay: 5 });
        await page.waitForTimeout(150);
      }
      for (const ch of 'wake') await page.keyboard.press(ch, { delay: 5 });
      await page.waitForTimeout(600);
      await shot('maker-alive-standalone');
    } catch (e) { fail('maker-alive', e.message); }
  }

  // ── A FRIEND TO TALK TO (the IM-friend) ─────────────────────────────────
  if (shouldRun('friend-picker')) {
    try {
      await goToSelect(page, baseUrl);
      await goToDoor(page);
      await enterDoor(page);
      await enterWorld(page, 4);
      await shot('friend-picker-standalone');
    } catch (e) { fail('friend-picker', e.message); }
  }

  if (shouldRun('friend-chat')) {
    try {
      await goToSelect(page, baseUrl);
      await goToDoor(page);
      await enterDoor(page);
      await enterWorld(page, 4);
      await page.keyboard.press('Enter'); // open PIXEL (picker cursor starts at 0)
      await page.waitForTimeout(400);
      for (const ch of 'hi pixel') await page.keyboard.press(ch === ' ' ? ' ' : ch, { delay: 5 });
      await page.keyboard.press('Enter');
      // A cold local model can take a while past the client's own 25s timeout
      // budget on its very first reply; give it real headroom before shooting
      // rather than guessing a short duration (falls through to whatever's on
      // screen — a real reply or the graceful nap fallback — either is a valid
      // capture of the documented behavior).
      await page.waitForTimeout(16000);
      await shot('friend-chat-standalone');
    } catch (e) { fail('friend-chat', e.message); }
  }

  if (shouldRun('friend-make')) {
    try {
      await goToSelect(page, baseUrl);
      await goToDoor(page);
      await enterDoor(page);
      await enterWorld(page, 4);
      await page.keyboard.press('ArrowDown'); // PIXEL
      await page.keyboard.press('ArrowDown'); // SPROUT
      await page.keyboard.press('Enter');     // MAKE A NEW FRIEND
      await page.waitForTimeout(300);
      for (const ch of 'Rex') await page.keyboard.press(ch, { delay: 5 });
      await shot('friend-make-standalone');
    } catch (e) { fail('friend-make', e.message); }
  }

  console.log('\n=== SUMMARY ===');
  const failed = results.filter((r) => !r.ok);
  console.log(`${results.length - failed.length}/${results.length} captures succeeded.`);

  if (consoleErrors.length) {
    console.log('\nCONSOLE ERRORS:');
    consoleErrors.forEach((e) => console.log('  ' + e));
  } else {
    console.log('\nNo console errors.');
  }

  await browser.close();

  if (failed.length) {
    console.error('\nFAILED CAPTURES:');
    failed.forEach((f) => console.error(`  ${f.name}: ${f.reason}`));
    process.exit(1);
  }
  process.exit(0);
})();
