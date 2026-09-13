// Captures Act 7 — THE SPEEDWAY (the SECOND back-wall door on the select screen):
// the door, the track chooser, and each registered era track at its start line,
// mid-lap and pit board — including a SECOND lap so the ghost ("YOU · LAST TIME")
// is actually on screen in a reference frame.
//
// Usage:
//   python3 -m http.server 8827 --directory /Users/trevormack/dev/keystroke-kingdom
//   DEV_URL=http://127.0.0.1:8827 node docs/screenshots/capture-speedway.js
//   DEV_URL=http://127.0.0.1:8827 node docs/screenshots/capture-speedway.js monaco-racing
//
// Subset names: door, hub, monaco-start, monaco-racing, monaco-lap (drives a whole
// lap → pit board → a second lap with the ghost), fzero-start, fzero-racing
//
// WHY THIS SCRIPT LOOKS DIFFERENT FROM THE OTHERS: Act 7 draws entirely on the
// shared canvas — there is no DOM prompt to read, so a capture that needs the game
// to be MID-LAP has to type the real word. It reconstructs the prompt the same way
// tests/integration/speedway.test.mjs does (surface (c) in docs/testing/STRATEGY.md):
// a fillText recorder, then the longest contiguous run of single-character draws on
// one frame IS the word on screen. That is text content only — never a pixel,
// position or colour assertion (.claude/rules/testing.md rule 4).
//
// Determinism note: the SPEEDWAY writes ghosts into `kk-slots[i].speedway`. Every
// capture starts from a fresh page (goToSelect reloads), and the slot the WOPR
// bypass path creates is per-page-load, so a first lap is genuinely a first lap and
// the "FIRST LAP — YOU SET THE PACE" frame is reproducible. The `monaco-lap` block
// is the ONE place a second lap exists, and it creates its own ghost in-session.
//
// Writes docs/screenshots/speedway/*.png.

const fs = require('fs');
const path = require('path');
const { launchPage, resolveBaseUrl, goToSelect } = require('../../scripts/kk-playwright');

const OUT_DIR = path.join(__dirname, 'speedway');
fs.mkdirSync(OUT_DIR, { recursive: true });

// The back wall's door order comes from BACK_WALL_DOORS (js/ui/cabinet-art.js):
// 0 = THE GREEN DRAGON (Act 6), 1 = THE SPEEDWAY (Act 7).
const SPEEDWAY_DOOR_INDEX = 1;
// The hub's track order comes from js/speedway/tracks/index.js (eraRank order).
const TRACK_ROW = { 'monaco-gp': 0, 'f-zero': 1 };

// ── the drawn-text recorder (the only window onto a canvas-only wing) ───────
async function installDrawRecorder(page) {
  await page.addInitScript(() => {
    const C = window.CanvasRenderingContext2D;
    if (!C || C.prototype.__kkDrawPatched) return;
    window.__kkDraw = [];
    const wrap = (name) => {
      const orig = C.prototype[name];
      if (typeof orig !== 'function') return;
      C.prototype[name] = function (text, ...rest) {
        try { if (window.__kkDraw.length < 20000) window.__kkDraw.push(String(text)); } catch (e) { /* never break a frame */ }
        return orig.call(this, text, ...rest);
      };
    };
    wrap('fillText');
    wrap('strokeText');
    C.prototype.__kkDrawPatched = true;
  });
}

async function captureDrawn(page, frames = 3) {
  await page.evaluate(() => { window.__kkDraw = []; });
  await page.evaluate((n) => new Promise((resolve) => {
    let i = 0;
    const step = () => { i += 1; if (i >= n) resolve(); else requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), frames);
  return page.evaluate(() => (window.__kkDraw || []).slice());
}

const drawnIncludes = (drawn, needle) => drawn.some((s) => s.toUpperCase().includes(needle));

function wordFromDrawn(drawn) {
  let best = [];
  let run = [];
  for (const s of drawn) {
    if (/^[A-Z'-]$/.test(s)) run.push(s);
    else { if (run.length > best.length) best = run; run = []; }
  }
  if (run.length > best.length) best = run;
  return best.length >= 2 ? best.join('').toLowerCase() : null;
}

async function currentWord(page) { return wordFromDrawn(await captureDrawn(page)); }

// ── navigation (the real player path, never a state poke) ──────────────────
async function goToSpeedwayDoor(page, baseUrl) {
  await goToSelect(page, baseUrl);   // lands with selectBypass set (the wopr egg)
  // ↓ past the last act lands on the FIRST back-wall door; each further ↓ walks
  // along the wall and stops at the last one.
  for (let i = 0; i < 5 + SPEEDWAY_DOOR_INDEX; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(120);
  }
  const door = await page.evaluate(() => {
    const el = document.querySelector('.select-door.selected');
    return el ? el.dataset.door : null;
  });
  if (door !== 'speedway') throw new Error(`expected the SPEEDWAY door, focused: ${door}`);
}

async function enterHub(page) {
  await page.keyboard.press(' ');    // door → enterSpeedway() → lazy import → hub
  const deadline = Date.now() + 20000;
  for (;;) {
    const drawn = await captureDrawn(page, 2);
    if (drawnIncludes(drawn, 'THE SPEEDWAY') && drawnIncludes(drawn, 'CHOOSE')) return;
    if (Date.now() > deadline) throw new Error('the SPEEDWAY hub never came up');
    await page.waitForTimeout(200);
  }
}

// Move the hub cursor to a track row and enter it, landing on the start line.
async function toStartLine(page, trackId) {
  for (let i = 0; i < (TRACK_ROW[trackId] || 0); i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(120);
  }
  await page.keyboard.press(' ');
  const deadline = Date.now() + 15000;
  for (;;) {
    const drawn = await captureDrawn(page, 2);
    if (drawnIncludes(drawn, 'SPACE TO GO')) return;
    if (Date.now() > deadline) throw new Error(`never reached ${trackId}'s start line`);
    await page.waitForTimeout(150);
  }
}

async function startRacing(page) {
  await page.keyboard.press(' ');
  await page.waitForTimeout(300);
}

async function atFinish(page) { return drawnIncludes(await captureDrawn(page, 2), 'LAP COMPLETE'); }

async function typeWord(page, word) {
  for (const ch of word) await page.keyboard.press(ch === '-' ? 'Minus' : ch);
}

// Type `atLeast` correct characters of the current lap (or stop at the finish).
async function typeChars(page, atLeast) {
  let typed = 0;
  for (let i = 0; i < 400 && typed < atLeast; i++) {
    if (await atFinish(page)) return typed;
    const word = await currentWord(page);
    if (!word) return typed;
    await typeWord(page, word);
    typed += word.length;
  }
  return typed;
}

// Drive the whole lap to the checkered flag, cleanly, like an accurate player.
async function driveLap(page) {
  for (let i = 0; i < 500; i++) {
    if (await atFinish(page)) return true;
    const word = await currentWord(page);
    if (!word) throw new Error('no prompt word on screen and the lap has not finished');
    await typeWord(page, word);
  }
  throw new Error('lap did not finish within 500 words');
}

(async () => {
  const baseUrl = resolveBaseUrl();
  const { browser, page, consoleErrors } = await launchPage();
  await installDrawRecorder(page);

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

  // ── the door ─────────────────────────────────────────────────────────────
  if (shouldRun('door')) {
    try {
      await goToSpeedwayDoor(page, baseUrl);
      await shot('00-the-speedway-door');
    } catch (e) { fail('door', e.message); }
  }

  // ── the hub chooser ──────────────────────────────────────────────────────
  if (shouldRun('hub')) {
    try {
      await goToSpeedwayDoor(page, baseUrl);
      await enterHub(page);
      await shot('01-the-hub');
    } catch (e) { fail('hub', e.message); }
  }

  // ── Monaco GP (1979 · ttl) ───────────────────────────────────────────────
  if (shouldRun('monaco-start')) {
    try {
      await goToSpeedwayDoor(page, baseUrl);
      await enterHub(page);
      await toStartLine(page, 'monaco-gp');
      await shot('02-monaco-gp-start-line');
    } catch (e) { fail('monaco-start', e.message); }
  }

  if (shouldRun('monaco-racing')) {
    try {
      await goToSpeedwayDoor(page, baseUrl);
      await enterHub(page);
      await toStartLine(page, 'monaco-gp');
      await startRacing(page);
      await typeChars(page, 30);   // far enough in that the road has scrolled
      await page.waitForTimeout(250);
      await shot('03-monaco-gp-racing');
    } catch (e) { fail('monaco-racing', e.message); }
  }

  // One chained block: a whole clean lap → the pit board → a SECOND lap, which
  // is the only way to photograph the ghost actually on track.
  if (shouldRun('monaco-lap')) {
    try {
      await goToSpeedwayDoor(page, baseUrl);
      await enterHub(page);
      await toStartLine(page, 'monaco-gp');
      await startRacing(page);
      await driveLap(page);
      await page.waitForTimeout(1000);          // let the checkered fanfare settle
      await shot('04-monaco-gp-pit-board');

      await page.keyboard.press(' ');            // pit board → the hub menu
      await page.waitForTimeout(600);
      await toStartLine(page, 'monaco-gp');
      await shot('05-monaco-gp-ghost-start-line');
      await startRacing(page);
      await typeChars(page, 24);
      await page.waitForTimeout(250);
      await shot('06-monaco-gp-racing-the-ghost');
    } catch (e) { fail('monaco-lap', e.message); }
  }

  // ── F-Zero (1990 · mode7) ────────────────────────────────────────────────
  if (shouldRun('fzero-start')) {
    try {
      await goToSpeedwayDoor(page, baseUrl);
      await enterHub(page);
      await toStartLine(page, 'f-zero');
      await shot('07-f-zero-start-line');
    } catch (e) { fail('fzero-start', e.message); }
  }

  if (shouldRun('fzero-racing')) {
    try {
      await goToSpeedwayDoor(page, baseUrl);
      await enterHub(page);
      await toStartLine(page, 'f-zero');
      await startRacing(page);
      await typeChars(page, 40);
      await page.waitForTimeout(250);
      await shot('08-f-zero-racing');
    } catch (e) { fail('fzero-racing', e.message); }
  }

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length} captured, ${failed.length} failed`);
  if (consoleErrors.length) {
    console.log('\nCONSOLE ERRORS:');
    console.log(consoleErrors.join('\n'));
  }
  if (failed.length) {
    console.error('\nFAILED:');
    failed.forEach((r) => console.error(`  ${r.name}: ${r.reason}`));
    process.exit(1);
  }
  // A capture run of a canvas-only wing is also an error smoke test: a renderer
  // that throws inside drawScene is swallowed by the engine so the lap survives,
  // but it still surfaces here as a console error.
  if (consoleErrors.length) process.exit(1);
})();
