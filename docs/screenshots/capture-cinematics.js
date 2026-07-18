// Captures representative phase frames for the three act-transition
// cinematics that are NOT the Full Circle finale (see capture-fullcircle.js
// for that one, which has its own script because Phase 1 needs extra
// per-vignette frames). Covers:
//   Mystery       (js/mystery.js)        — Act 1 -> 2, after Level 5
//   Basement      (js/basement.js)       — Act 2 -> 3, after Level 10
//   CommandCenter (js/commandcenter.js)  — Act 3 -> 4, after Level 15
//
// Same trigger technique as capture-fullcircle.js: hide every .screen
// element (matching what main.js does at the real trigger point), then call
// the module's start(callback). All three modules expose the same
// start/confirm/stop API and are self-defensive about hiding title DOM
// (verified by reading each file directly, 2026-07-12).
//
// Usage:
//   python3 -m http.server 8190 --directory /Users/trevormack/dev/keystroke-kingdom
//   DEV_URL=http://127.0.0.1:8190 node docs/screenshots/capture-cinematics.js
//   DEV_URL=http://127.0.0.1:8190 node docs/screenshots/capture-cinematics.js mystery,basement
//
// Writes docs/screenshots/cinematics/{mystery,basement,commandcenter}/phaseN-name.png
// plus, for mystery only, approach.gif and secret-door.gif (see MYSTERY_GIFS below —
// the Approach dolly-blur and the Secret Door hinge-slide are animated reveals a
// static PNG can't fully validate (the true door swing is horizontal
// foreshortening about a vertical hinge — a PNG can't prove verticals stay
// vertical through the whole open); requires /usr/local/bin/ffmpeg, same as
// capture-milestones.js's gif siblings).

const fs = require('fs');
const path = require('path');
const { launchPage, resolveBaseUrl, goToSelect, captureGif } = require('../../scripts/kk-playwright');

const OUT_ROOT = path.join(__dirname, 'cinematics');

// GIF siblings (png/gif rule — see docs/screenshots/README.md "milestones/"):
// a static PNG can only prove an animated phase's END state holds, not that
// the animation actually resolves correctly along the way (blur tracking
// dolly scale smoothly; the hinge-slide clearing the doorway without
// clipping). Only mystery's Phase 4 (Approach) and Phase 5 (Secret Door)
// need this treatment today — basement/commandcenter's progressive
// cascade/wave gifs already live in capture-milestones.js.
//
// captureGif()'s recordVideo starts at context-creation time; setup(page)
// drives the page all the way to the target phase's start (Mod.start() then
// wait the phase's start-ms) BEFORE the durationMs recording window — the
// navigation/wait time is trimmed back out via ffmpeg -sseof afterward, so
// only the phase itself ends up in the gif.
const MYSTERY_GIFS = [
  {
    name: 'approach',
    // P.TERMINAL 13000-25000 (12000ms) — the full dolly, fuzzy far -> crisp.
    // fps/width stepped down from the milestones/ default (12fps/640px,
    // which produced 3.87MB here) to 10fps/520px (2.37MB) — this scene's
    // per-frame cost is higher than the milestone cascades because of
    // drawTerminalLines' dithered multi-pass phosphor-blur smear.
    waitMs: 13000,
    durationMs: 12000,
    fps: 10,
    width: 520,
  },
  {
    name: 'secret-door',
    // P.DOOR 25000-33000 (8000ms) — the full hinge-aside.
    waitMs: 25000,
    durationMs: 8000,
    fps: 12,
    width: 640,
  },
];

// Phase boundaries copied from each module's own `P` const (read directly,
// 2026-07-12) — pick a time comfortably inside each phase's steady state.
const CINEMATICS = {
  // Revised 2026-07-12 per transitions.md "Mystery Beat": Phase 4 (js/mystery.js
  // `P.TERMINAL`, still ms 13000-25000) is now THE APPROACH — a 12s dolly-in
  // where the cabinet scales 1 -> DOLLY.MAX_SCALE (2.5) via
  // dollyScale(u) = 1 + 1.5*smoothstep(u), u = elapsed/12000, and the terminal
  // text's blur is a FUNCTION OF THAT SCALE (blurForScale), never a separate
  // timer: blur = clamp01((crispScale - scale) / (crispScale - 1)).
  // crispScale is itself derived from the terminal copy: the last character of
  // the last line ("COME IN.", delay 9500 + 7*130 = 10410ms) is where blur must
  // hit exactly 0. Re-derived here (node, 2026-07-12) to pick 3 approach
  // moments that read unambiguously as far/mid/crisp:
  //   elapsed 2000ms  -> u=0.167 -> scale=1.111 -> blur=0.922  (far / fuzzy smear)
  //   elapsed 6000ms  -> u=0.500 -> scale=1.750 -> blur=0.475  (mid / resolving)
  //   elapsed 10410ms -> u=0.868 -> scale=2.428 -> blur=0.000  (crisp arrives exactly here)
  // Capture ms = P.TERMINAL.s (13000) + elapsed, with the crisp shot given a
  // +90ms margin (10500 instead of 10410) purely so the screenshot lands a
  // hair past the exact zero-crossing rather than riding the boundary frame.
  // Phase 5 (js/mystery.js `P.DOOR`, ms 25000-33000) is THE SECRET DOOR: the
  // cabinet hinges/slides aside at MAX_SCALE revealing the doorway that was
  // always behind it (no more separate back-wall door) — capture mid-ease so
  // both the ajar machine and the lit passage are visibly composed together.
  mystery: {
    modulePath: '/js/mystery.js',
    // P: SILENCE 0-3000 · PULL 3000-9000 · CURTAIN 9000-13000 ·
    //    TERMINAL(APPROACH) 13000-25000 · DOOR(SECRET DOOR) 25000-33000 · TITLECARD 33000+
    captures: [
      { name: 'phase1-pull',            ms: 6000  },  // amber pulse, caution tape falling
      { name: 'phase2-curtain',         ms: 11500 },  // curtain drops, boot beeps
      { name: 'phase3-approach-far',    ms: 15000 },  // APPROACH elapsed 2000ms: scale 1.11, blur 0.92 — fuzzy phosphor smear
      { name: 'phase3-approach-mid',    ms: 19000 },  // APPROACH elapsed 6000ms: scale 1.75, blur 0.48 — resolving
      { name: 'phase3-approach-crisp',  ms: 23500 },  // APPROACH elapsed 10500ms: scale 2.44, blur 0.00 — arrived, COME IN. complete, fully crisp
      { name: 'phase4-secret-door',     ms: 31000 },  // SECRET DOOR t=0.75 (elapsed 6000ms of 8000): ease=smoothstep((t-0.05)/0.65)≈1.0 — cabinet fully hinged aside (74° foreshorten about its vertical left-edge hinge, verticals preserved), hidden room revealed (machines at 3 depth ranks, glowing screens, lit floor), terminal still readable on the ajar face
      { name: 'phase5-titlecard',       ms: 35000 },  // ACT 2 / THE COMPUTER WING
    ],
  },
  basement: {
    modulePath: '/js/basement.js',
    // P: MILESTONE 0-5000 · SEAM 5000-11000 · DROP 11000-18000 · TITLECARD 18000+
    captures: [
      // phase0: cascade lights key i at t=0.12+i*0.075, ramping to full over +0.06;
      // last key (i=9, Q..P) is fully lit at t=0.855 (ms=4275). Text ("TOP ROW
      // UNLOCKED") starts fading at t=0.8 over the remaining 0.2. ms:4400 (t=0.88)
      // sits inside the held-full window (all 10 keys lit, text alpha ~0.6) —
      // NOT mid-cascade like the old ms:2500 (t=0.5), which only had ~5 of 10 keys lit.
      { name: 'phase0-milestone', ms: 4400  },  // TOP ROW UNLOCKED, all 10 keys held lit
      { name: 'phase1-seam',      ms: 8000  },  // crack appears, light bleeds
      { name: 'phase2-drop',      ms: 14500 },  // trapdoor opens, FM bloom
      { name: 'phase3-titlecard', ms: 20000 },  // ACT 3 / THE BASEMENT
    ],
  },
  commandcenter: {
    modulePath: '/js/commandcenter.js',
    // P: MILESTONE 0-8000 · TEXT 8000-14000 · STAIRCASE 14000-24000 · TITLECARD 24000+
    captures: [
      // phase0: rolling wave over WAVE_ORDER (26 keys), lightAt = 0.05 +
      // (globalIdx/26)*0.7, ramping to full over +0.08; last key (globalIdx=25,
      // M) is fully lit at t=0.8031 (ms=6425). Text ("FULL KEYBOARD UNLOCKED")
      // starts fading at t=0.7 over the remaining 0.3. ms:6800 (t=0.85) sits past
      // the last key's full-light point (comfortable margin) with text alpha
      // ~0.5 (still legible) — NOT mid-wave like the old ms:4000 (t=0.5), which
      // only had ~18 of 26 keys lit.
      { name: 'phase0-milestone', ms: 6800  },  // rolling letter-key wave, all 26 keys held lit
      { name: 'phase1-text',      ms: 10500 },  // "YOU KNOW EVERY WORD..."
      { name: 'phase2-staircase', ms: 18000 },  // staircase rises through ceiling
      { name: 'phase3-titlecard', ms: 26000 },  // ACT 4 / THE COMMAND CENTER
    ],
  },
};

(async () => {
  const baseUrl = resolveBaseUrl();
  const { browser, page, consoleErrors } = await launchPage();

  const filterArg = process.argv[2];
  const namesToRun = filterArg
    ? filterArg.split(',').map(s => s.trim()).filter(n => CINEMATICS[n])
    : Object.keys(CINEMATICS);

  if (filterArg && namesToRun.length === 0) {
    console.error(`FATAL: no valid cinematic names in filter "${filterArg}" (valid: ${Object.keys(CINEMATICS).join(', ')})`);
    await browser.close();
    process.exit(1);
  }

  await goToSelect(page, baseUrl);

  const results = []; // { cinematic, name, ok, file, reason }

  for (const cinName of namesToRun) {
    const cin = CINEMATICS[cinName];
    const outDir = path.join(OUT_ROOT, cinName);
    fs.mkdirSync(outDir, { recursive: true });
    console.log(`\n${cinName} (${cin.captures.length} phases):`);

    for (const capture of cin.captures) {
      try {
        await page.evaluate(() => {
          document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        });

        const startedFrom = await page.evaluate(async (modulePath) => {
          const Mod = await import(modulePath);
          if (Mod.stop) Mod.stop();
          Mod.start(() => {});
          const title = document.getElementById('title-screen');
          return { titleHidden: title ? title.classList.contains('hidden') : null };
        }, cin.modulePath);

        if (startedFrom.titleHidden === false) {
          console.warn(`  WARN: title-screen NOT hidden by ${cinName}.start() for ${capture.name}`);
        }

        await page.waitForTimeout(capture.ms + 400);

        const outPath = path.join(outDir, `${capture.name}.png`);
        await page.screenshot({ path: outPath });
        console.log(`  OK -> ${cinName}/${capture.name}.png`);
        results.push({ cinematic: cinName, name: capture.name, ok: true, file: outPath });

        await page.evaluate(async (modulePath) => {
          const Mod = await import(modulePath);
          if (Mod.stop) Mod.stop();
        }, cin.modulePath);
        await page.waitForTimeout(200);
      } catch (err) {
        console.error(`  FAILED ${cinName}/${capture.name}: ${err.message}`);
        results.push({ cinematic: cinName, name: capture.name, ok: false, reason: err.message });
      }
    }

    // GIF siblings — mystery only today (see MYSTERY_GIFS comment above).
    if (cinName === 'mystery') {
      for (const gif of MYSTERY_GIFS) {
        const outPath = path.join(outDir, `${gif.name}.gif`);
        try {
          console.log(`  recording ${cinName}/${gif.name}.gif (${gif.durationMs}ms window at +${gif.waitMs}ms)...`);
          const result = await captureGif({
            baseUrl,
            setup: async (p, url) => {
              await goToSelect(p, url);
              await p.evaluate(() => {
                document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
              });
              await p.evaluate(async (modulePath) => {
                const Mod = await import(modulePath);
                if (Mod.stop) Mod.stop();
                Mod.start(() => {});
              }, cin.modulePath);
              await p.waitForTimeout(gif.waitMs);
            },
            durationMs: gif.durationMs,
            fps: gif.fps,
            width: gif.width,
            outPath,
          });
          const mb = (result.bytes / (1024 * 1024)).toFixed(2);
          console.log(`  OK -> ${cinName}/${gif.name}.gif (${mb} MB)`);
          if (result.bytes > 3 * 1024 * 1024) {
            console.warn(`  WARN: ${cinName}/${gif.name}.gif is ${mb} MB, over the 3MB target`);
          }
          results.push({ cinematic: cinName, name: `${gif.name}.gif`, ok: true, file: outPath });
        } catch (err) {
          console.error(`  FAILED ${cinName}/${gif.name}.gif: ${err.message}`);
          results.push({ cinematic: cinName, name: `${gif.name}.gif`, ok: false, reason: err.message });
        }
      }
    }
  }

  console.log('\n=== SUMMARY ===');
  const failed = results.filter(r => !r.ok);
  console.log(`${results.length - failed.length}/${results.length} phase captures succeeded.`);

  if (consoleErrors.length) {
    console.log('\nCONSOLE ERRORS:');
    consoleErrors.forEach(e => console.log('  ' + e));
  } else {
    console.log('\nNo console errors.');
  }

  await browser.close();

  if (failed.length) {
    console.error('\nFAILED CAPTURES:');
    failed.forEach(f => console.error(`  ${f.cinematic}/${f.name}: ${f.reason}`));
    process.exit(1);
  }
  process.exit(0);
})();
