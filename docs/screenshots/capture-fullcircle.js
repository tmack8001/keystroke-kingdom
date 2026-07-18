// Capture the Act 4 → 5 "Full Circle" cinematic, one screenshot per phase.
//
// Reproduces the REAL in-game trigger path (js/main.js level-20 complete):
// hide every .screen element, then FullCircle.start(). This is the source of
// truth — if the title DOM is hidden here exactly as the game hides it, the
// screenshots reflect what a player actually sees. We additionally verify the
// module is self-defensive (start() hides the title DOM on its own).
//
// Usage:  DEV_URL=http://127.0.0.1:8125 node docs/screenshots/capture-fullcircle.js
//
// Writes docs/screenshots/cinematics/fullcircle/phase{0,1,2,3}.png (the review
// artifacts). Phase 1 (the reverse montage) also emits per-vignette frames
// phase1-{cmd,base,wing,door}.png so each memory-flash is verifiable.

const fs = require('fs');
const path = require('path');
const { launchPage, resolveBaseUrl, goToSelect } = require('../../scripts/kk-playwright');

const OUT_DIR = path.join(__dirname, 'cinematics', 'fullcircle');
fs.mkdirSync(OUT_DIR, { recursive: true });

// Phase mid-points (ms) — pick a time comfortably inside each phase so the
// screenshot captures its steady state. Must match P{} in js/fullcircle.js.
//   TERMINAL 0–12000 · RETURN 12000–24000 (4 vignettes × 3s) · ARCADE 24000–34000 · OPENING 34000+
const PHASE_TIMES = [
  { name: 'phase0',      ms: 9000  },  // TERMINAL — HELLO held + both typed lines done
  { name: 'phase1',      ms: 13600 },  // RETURN — canonical frame at the Command Center beat
  { name: 'phase1-cmd',  ms: 13600 },  // RETURN — Command Center vignette hold
  { name: 'phase1-base', ms: 16600 },  // RETURN — Basement vignette hold
  { name: 'phase1-wing', ms: 19600 },  // RETURN — Computer Wing vignette hold
  { name: 'phase1-door', ms: 22600 },  // RETURN — Arcade door vignette hold
  { name: 'phase2',      ms: 29000 },  // ARCADE — fully-lit arcade (steady state)
  { name: 'phase3',      ms: 35800 },  // OPENING — READY [NAME]! callback (prompt blink-on)
];

(async () => {
  const baseUrl = resolveBaseUrl();
  const { browser, page, consoleErrors } = await launchPage();

  // Reach the select screen through the normal flow so the app is fully
  // booted and all modules are loaded.
  await goToSelect(page, baseUrl);

  for (const phase of PHASE_TIMES) {
    // Restart the cinematic from a clean state for each phase, exactly as the
    // game does at level-20 complete: hide all screens, then start().
    await page.evaluate(() => {
      document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    });

    const startedFrom = await page.evaluate(async (targetMs) => {
      const FC = await import('/js/fullcircle.js');
      // Stop any prior run cleanly first.
      if (FC.stop) FC.stop();
      window.__fcDone = false;
      FC.start(() => { window.__fcDone = true; });
      // Report whether the title screen got hidden by start() itself
      // (self-defensiveness check, independent of the caller above).
      const title = document.getElementById('title-screen');
      return { titleHidden: title ? title.classList.contains('hidden') : null };
    }, phase.ms);

    if (startedFrom.titleHidden === false) {
      console.warn(`WARN: title-screen NOT hidden by FullCircle.start() for ${phase.name}`);
    }

    // Let the requested phase elapse in real time, then freeze one frame.
    await page.waitForTimeout(phase.ms + 400);

    await page.screenshot({ path: path.join(OUT_DIR, `${phase.name}.png`) });

    // Tear down before the next phase.
    await page.evaluate(async () => {
      const FC = await import('/js/fullcircle.js');
      if (FC.stop) FC.stop();
    });
    await page.waitForTimeout(200);
  }

  if (consoleErrors.length) {
    console.log('CONSOLE ERRORS:\n' + consoleErrors.join('\n'));
  } else {
    console.log('No console errors.');
  }

  await browser.close();
})();
