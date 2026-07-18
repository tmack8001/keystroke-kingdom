// Captures the four row-unlock milestone moments in the curriculum — the
// canonical "every key in this row is lit" reference frame for each. This
// set exists purely as a flaw-detection reference: Trevor caught
// cinematics/basement/phase0-milestone.png showing I/O/P dark under "TOP ROW
// UNLOCKED" because the capture fired mid-cascade instead of at the held,
// fully-lit frame. A milestone screenshot that isn't the canonical complete
// state defeats its own purpose — a real bug (a key that never lights) would
// be indistinguishable from a capture-timing artifact. These four images are
// the "this is what correct looks like" baseline.
//
//   01-home-row.png     — Level 4 completion's #complete-overlay
//                          (.complete-title = "HOME ROW COMPLETE", js/main.js)
//   02-top-row.png       — Basement cinematic (js/basement.js) phase 0,
//                          the held-full frame — all 10 of QWERTYUIOP lit
//                          (same frame as cinematics/basement/phase0-milestone.png,
//                          duplicated here so this set is complete standalone)
//   03-full-keyboard.png — Command Center cinematic (js/commandcenter.js)
//                          phase 0, the held-full frame — all 26 letter keys lit
//                          (same frame as cinematics/commandcenter/phase0-milestone.png)
//   04-number-row.png    — Level 20 completion's #complete-overlay
//                          (.complete-title = "NUMBERS UNLOCKED", js/main.js)
//
// 01/04 are captured via a REAL playthrough (same technique as
// capture-cards.js: drive the actual keydown listener until #complete-overlay
// unhides) — not a state-injection shortcut, so what's captured is exactly
// what a player sees. 02/03 reuse the retimed capture-cinematics.js ms values
// (see that file's comments for the frame-timing math).
//
// Usage:
//   python3 -m http.server 8220 --directory /Users/trevormack/dev/keystroke-kingdom
//   DEV_URL=http://127.0.0.1:8220 node docs/screenshots/capture-milestones.js
//   DEV_URL=http://127.0.0.1:8220 node docs/screenshots/capture-milestones.js home-row,top-row

const fs = require('fs');
const path = require('path');
const {
  launchPage,
  resolveBaseUrl,
  goToSelect,
  ALL_LEVELS,
  captureGif,
} = require('../../scripts/kk-playwright');

const OUT_DIR = path.join(__dirname, 'milestones');
fs.mkdirSync(OUT_DIR, { recursive: true });

// Same safety caps + stall-detection philosophy as capture-cards.js — see
// that file's comments for why these specific numbers were chosen.
const MAX_KEYS_BUDGET = 120 * 40;
const STALL_TIMEOUT_MS = 8000;
const PER_LEVEL_TIMEOUT_MS = 240_000;

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

// Identical loop to capture-cards.js's playLevelToCompletion: types whatever
// the DOM currently shows as the active/expected prompt letter until the
// real #complete-overlay unhides. Deliberately dumb — never reads
// js/levels.js pattern data, only reacts to the DOM the way a player would.
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
    const pressKey = token === ' ' ? 'Space' : token;
    await page.keyboard.press(pressKey, { delay: 5 });
    keysTyped++;
    if (keysTyped > MAX_KEYS_BUDGET) {
      return { ok: false, reason: `exceeded overall key budget (${keysTyped} keys, level ${levelNum}) without completing` };
    }
    await page.waitForTimeout(40);
  }
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

// Milestone definitions. `kind: 'playthrough'` drives a real level to
// completion; `kind: 'cinematic'` starts a transition module directly and
// waits for the frame-timing math computed in capture-cinematics.js.
//
// `gifPhaseMs`, when present, means this milestone's animation is itself the
// thing worth validating (a progressive key-lighting cascade/wave) — a
// static PNG can only prove the HELD end-state, not that every key actually
// lit in sequence along the way. Per Trevor's design addition (2026-07-12):
// "animated surfaces get a .gif sibling; the png shows the held/canonical
// state, the gif proves the animation." gifPhaseMs is the full duration of
// the cinematic's MILESTONE phase (0 -> phase-end in the module's own `P`
// const) so the gif covers dark start -> cascading -> held-full in one clip.
// 01/04 have no gifPhaseMs: their banners (.complete-title in js/main.js)
// only carry a decorative infinite pulse (readyPulse, css/screens.css:613)
// with no progressive reveal — there is no "did every key light in
// sequence" question to answer for a static overlay, so a gif would add
// motion-noise without validating anything a static compare can't already.
const MILESTONES = [
  {
    name: '01-home-row',
    kind: 'playthrough',
    level: 4,
    expectedTitle: 'HOME ROW COMPLETE',
  },
  {
    name: '02-top-row',
    kind: 'cinematic',
    modulePath: '/js/basement.js',
    // Same ms as capture-cinematics.js basement/phase0-milestone (see that
    // file's comment for the t=0.88 held-full-lit derivation).
    ms: 4400,
    // basement.js P.MILESTONE: { s: 0, e: 5000 } — the full phase 0 window.
    gifPhaseMs: 5000,
  },
  {
    name: '03-full-keyboard',
    kind: 'cinematic',
    modulePath: '/js/commandcenter.js',
    // Same ms as capture-cinematics.js commandcenter/phase0-milestone (see
    // that file's comment for the t=0.85 held-full-lit derivation).
    ms: 6800,
    // commandcenter.js P.MILESTONE: { s: 0, e: 8000 } — the full phase 0 window.
    gifPhaseMs: 8000,
  },
  {
    name: '04-number-row',
    kind: 'playthrough',
    level: 20,
    expectedTitle: 'NUMBERS UNLOCKED',
  },
];

async function captureCinematic(page, milestone) {
  await page.evaluate(() => {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  });

  await page.evaluate(async (modulePath) => {
    const Mod = await import(modulePath);
    if (Mod.stop) Mod.stop();
    Mod.start(() => {});
  }, milestone.modulePath);

  await page.waitForTimeout(milestone.ms + 400);

  const outPath = path.join(OUT_DIR, `${milestone.name}.png`);
  await page.screenshot({ path: outPath });

  await page.evaluate(async (modulePath) => {
    const Mod = await import(modulePath);
    if (Mod.stop) Mod.stop();
  }, milestone.modulePath);
  await page.waitForTimeout(200);

  return outPath;
}

async function capturePlaythrough(page, baseUrl, milestone) {
  const levelEntry = ALL_LEVELS.find(l => l.levelNum === milestone.level);
  if (!levelEntry) throw new Error(`no ALL_LEVELS entry for level ${milestone.level}`);

  await navigateToLevelViaSelect(page, baseUrl, levelEntry);

  const playResult = await playLevelToCompletion(page, milestone.level);
  if (!playResult.ok) throw new Error(playResult.reason);

  // showLevelComplete() populates the overlay synchronously before unhiding
  // it (confirmed by reading js/main.js directly), but state.victoryTimer
  // holds the overlay hidden behind the 'victory' screen for 4000ms after
  // the win — isOverlayVisible() above already waited that out. Give the
  // modalPop CSS animation a moment to settle for a clean screenshot.
  await page.waitForTimeout(500);

  const title = await page.evaluate(() => {
    const el = document.querySelector('.complete-title');
    return el ? el.textContent : null;
  });
  if (title !== milestone.expectedTitle) {
    throw new Error(`.complete-title was "${title}", expected "${milestone.expectedTitle}"`);
  }

  const outPath = path.join(OUT_DIR, `${milestone.name}.png`);
  await page.screenshot({ path: outPath });
  return { outPath, keysTyped: playResult.keysTyped, title };
}

// Records the full cinematic MILESTONE phase (dark start -> cascading ->
// held-full) as a .gif sibling to the milestone's .png. Uses captureGif()
// (scripts/kk-playwright.js), which opens its OWN browser context — the
// shared `page` from launchPage() can't be reused because Playwright's
// recordVideo option can only be set at context-creation time.
async function captureMilestoneGif(baseUrl, milestone) {
  const outPath = path.join(OUT_DIR, `${milestone.name}.gif`);
  const result = await captureGif({
    baseUrl,
    setup: async (page, url) => {
      await goToSelect(page, url);
      await page.evaluate(() => {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
      });
      await page.evaluate(async (modulePath) => {
        const Mod = await import(modulePath);
        if (Mod.stop) Mod.stop();
        Mod.start(() => {});
      }, milestone.modulePath);
    },
    durationMs: milestone.gifPhaseMs,
    fps: 12,
    width: 640,
    outPath,
  });
  return result;
}

// Extracts first/mid/last frames from a gif via ffmpeg into a
// `.verify-frames/` sibling directory (kept separate from the canonical
// milestones/ deliverables — those are exactly {png, gif} per milestone, no
// scratch artifacts) so the dark/partial -> fully-lit progression can be
// visually re-inspected any time without re-running the whole capture.
function verifyGifProgression(gifPath, name) {
  const { execFileSync } = require('child_process');
  const verifyDir = path.join(OUT_DIR, '.verify-frames');
  fs.mkdirSync(verifyDir, { recursive: true });
  const startFrame = path.join(verifyDir, `${name}-frame-start.png`);
  const midFrame = path.join(verifyDir, `${name}-frame-mid.png`);
  const endFrame = path.join(verifyDir, `${name}-frame-end.png`);

  execFileSync('/usr/local/bin/ffmpeg', ['-y', '-i', gifPath, '-vf', "select='eq(n\\,0)'", '-vframes', '1', startFrame], { stdio: 'pipe' });
  const probe = execFileSync('/usr/local/bin/ffprobe', ['-v', 'error', '-show_entries', 'stream=nb_frames', '-of', 'default=noprint_wrappers=1:nokey=1', gifPath]).toString().trim();
  const nbFrames = parseInt(probe, 10) || 60;
  const midN = Math.floor(nbFrames / 2);
  execFileSync('/usr/local/bin/ffmpeg', ['-y', '-i', gifPath, '-vf', `select='eq(n\\,${midN})'`, '-vframes', '1', midFrame], { stdio: 'pipe' });
  execFileSync('/usr/local/bin/ffmpeg', ['-y', '-i', gifPath, '-vf', `select='eq(n\\,${nbFrames - 2})'`, '-vframes', '1', endFrame], { stdio: 'pipe' });

  return { startFrame, midFrame, endFrame, nbFrames };
}

(async () => {
  const baseUrl = resolveBaseUrl();
  console.log('Base URL:', baseUrl);
  const { browser, page, consoleErrors } = await launchPage();

  const filterArg = process.argv[2];
  const namesToRun = filterArg
    ? filterArg.split(',').map(s => s.trim())
    : MILESTONES.map(m => m.name.replace(/^\d+-/, ''));

  const runList = MILESTONES.filter(m => namesToRun.includes(m.name.replace(/^\d+-/, '')));
  if (filterArg && runList.length === 0) {
    console.error(`FATAL: no valid milestone names in filter "${filterArg}" (valid: ${MILESTONES.map(m => m.name.replace(/^\d+-/, '')).join(', ')})`);
    await browser.close();
    process.exit(1);
  }

  const results = [];

  for (const milestone of runList) {
    console.log(`\n${milestone.name} (${milestone.kind})...`);
    const errorsBefore = consoleErrors.length;
    try {
      if (milestone.kind === 'cinematic') {
        // Cinematics start from the select screen just to get real game DOM
        // loaded; the module itself takes over the canvas immediately.
        await goToSelect(page, baseUrl);
        const outPath = await captureCinematic(page, milestone);
        console.log(`  OK -> milestones/${milestone.name}.png`);
        const entry = { name: milestone.name, ok: true, file: outPath };

        if (milestone.gifPhaseMs) {
          console.log(`  recording ${milestone.name}.gif (${milestone.gifPhaseMs}ms of the MILESTONE phase)...`);
          const gifResult = await captureMilestoneGif(baseUrl, milestone);
          const mb = (gifResult.bytes / (1024 * 1024)).toFixed(2);
          console.log(`  OK -> milestones/${milestone.name}.gif  (${mb} MB)`);
          if (gifResult.bytes > 3 * 1024 * 1024) {
            console.warn(`  WARN: ${milestone.name}.gif is ${mb} MB, over the 3MB target`);
          }
          const frames = verifyGifProgression(gifResult.outPath, milestone.name);
          console.log(`  frames extracted for visual check: ${path.basename(frames.startFrame)}, ${path.basename(frames.midFrame)}, ${path.basename(frames.endFrame)} (${frames.nbFrames} total frames)`);
          entry.gif = gifResult.outPath;
          entry.gifBytes = gifResult.bytes;
          entry.gifFrames = frames;
        }

        results.push(entry);
      } else {
        const { outPath, keysTyped, title } = await capturePlaythrough(page, baseUrl, milestone);
        console.log(`  OK -> milestones/${milestone.name}.png  [.complete-title="${title}", ${keysTyped} keys typed]`);
        results.push({ name: milestone.name, ok: true, file: outPath, keysTyped, title });
      }
      const newErrors = consoleErrors.slice(errorsBefore);
      if (newErrors.length) {
        results[results.length - 1].consoleErrors = newErrors;
      }
    } catch (err) {
      console.error(`  FAILED ${milestone.name}: ${err.message}`);
      results.push({ name: milestone.name, ok: false, reason: err.message });
    }
  }

  console.log('\n=== SUMMARY ===');
  const failed = results.filter(r => !r.ok);
  console.log(`${results.length - failed.length}/${results.length} milestone captures succeeded.`);

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
  console.log('\nAll 4 milestone captures succeeded.');
  process.exit(0);
})();
