// Keystroke Kingdom — shared Playwright helper
//
// Single source of truth for the browser-launch boilerplate and the
// title → name entry → ready → select-screen → level navigation flow used
// by docs/screenshots/capture-all.js, docs/a11y/audit.js, and any ad-hoc
// visual-validation script (see .claude/rules/visual-validation.md).
//
// Usage:
//   const { launchPage, resolveBaseUrl, ACTS_CONFIG, ALL_LEVELS,
//           goToSelect, goToLevel } = require('../../scripts/kk-playwright');
//
//   const BASE_URL = resolveBaseUrl();
//   const { browser, page, consoleErrors } = await launchPage();
//   await goToLevel(page, BASE_URL, 7);
//   await page.screenshot({ path: '/tmp/kk-level7.png' });
//   await browser.close();
//
// BASE_URL resolution order: explicit arg > DEV_URL env var > .dev-url file
// at the repo root. This lets each agent/session point at its own static
// server (e.g. `DEV_URL=http://127.0.0.1:8105 node docs/screenshots/capture-all.js`)
// without editing the script or colliding with the shared embedded build.

const { chromium } = require('/Users/trevormack/.npm/_npx/705bc6b22212b352/node_modules/playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const FFMPEG_BIN = '/usr/local/bin/ffmpeg';

// ── Level / act config — the single source of truth for both scripts ──────
// slug: directory/filename fragment (screenshots) and level-select label
// (audit). Kept as plain strings here; capture-all.js maps to {slug} objects
// where it needs per-level extensibility.
const ACTS_CONFIG = [
  { slug: 'act1-arcade',          levels: ['breakout', 'space-invaders', 'pac-man', 'galaga', 'joust'] },
  { slug: 'act2-computer-wing',   levels: ['donkey-kong', 'dragons-lair', 'tetris', 'super-mario-bros', 'legend-of-zelda'] },
  { slug: 'act3-basement',        levels: ['sonic', 'street-fighter-ii', 'myst', 'donkey-kong-country', 'pokemon'] },
  { slug: 'act4-command-center',  levels: ['simcity-2000', 'goldeneye-007', 'age-of-empires', 'final-fantasy-vii', 'terminal'] },
  { slug: 'act5-full-circle',     levels: ['out-run', 'qbert', 'missile-command', 'high-score-entry', 'word-processor'] },
];

let n = 0;
const ALL_LEVELS = [];
ACTS_CONFIG.forEach((act, actIdx) => {
  act.levels.forEach((slug, posIdx) => {
    n++;
    ALL_LEVELS.push({
      levelNum: n,
      actIdx,
      posIdx,
      actSlug: act.slug,
      levelSlug: slug,
      filename: String(n).padStart(2, '0') + '-' + slug,
    });
  });
});

// ── BASE_URL resolution ────────────────────────────────────────────────────
// Priority: explicit arg > DEV_URL env var > .dev-url file at repo root.
function resolveBaseUrl(explicit) {
  if (explicit) return explicit.trim();
  if (process.env.DEV_URL) return process.env.DEV_URL.trim();
  return fs.readFileSync(path.join(REPO_ROOT, '.dev-url'), 'utf8').trim();
}

// ── Browser/page boilerplate ───────────────────────────────────────────────
// Launches headless Chromium, opens one page at the standard 1280x800
// viewport, and wires up console-error + page-error collection into a
// shared array (deduped access via the returned `consoleErrors`).
// The game feature-detects local word generation by probing its OWN /api/wordgen
// endpoints. On a static file host (no Go backend) those probes 404 BY DESIGN and the
// game falls back to its static dictionary — js/wordgen.js announces this via a clear
// console.info. Chromium still logs the raw 404 as a console ERROR, which would
// otherwise fail every screenshot/nav tool with a false positive. Drop ONLY that
// expected probe 404 (matched by the failing resource URL — the console text omits it)
// and surface one clear line instead. A real 404 on any other resource still surfaces;
// against the actual Go server these never 404, so this is a no-op there.
function isExpectedWordgenProbe404(msg) {
  try {
    if (msg.type() !== 'error') return false;
    if (!/status of 404/i.test(msg.text())) return false;
    const url = (msg.location && msg.location().url) || '';
    // Both optional local-LLM backends 404 BY DESIGN on a static host: /api/wordgen
    // (word augmentation) and /api/keyboard-story (the L25 coda story generator).
    // Both fall back silently to static content, so their probe 404s are expected.
    return /\/api\/(wordgen(\/health)?|keyboard-story)(\?|$)/.test(url);
  } catch (_) {
    return false;
  }
}

// Wire console-error + page-error capture into `sink`, filtering the expected wordgen
// probe 404 (announcing it once via `notify`, default console.log). Shared by
// launchPage and captureGif so both treat the static-host fallback identically.
function wireConsoleCapture(page, sink, notify = console.log) {
  let wordgenNoted = false;
  page.on('console', m => {
    if (m.type() !== 'error') return;
    if (isExpectedWordgenProbe404(m)) {
      if (!wordgenNoted) {
        wordgenNoted = true;
        notify('  ℹ wordgen: /api/wordgen probe returned 404 on this host — ' +
          'server-driven word generation unavailable, the game uses its static dictionary ' +
          '(expected on a static file server; not a failure).');
      }
      return;
    }
    sink.push(m.text());
  });
  page.on('pageerror', e => sink.push('pageerror: ' + e.message));
}

async function launchPage(viewport = { width: 1280, height: 800 }) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize(viewport);

  const consoleErrors = [];
  wireConsoleCapture(page, consoleErrors);

  return { browser, page, consoleErrors };
}

// ── Navigation steps ────────────────────────────────────────────────────────
// Title screen -> name entry -> ready screen -> select screen (via the
// 'wopr' WOPR-select easter egg, which is the fastest reliable path to the
// level-select screen for automated navigation).
async function goToSelect(page, baseUrl) {
  await page.goto(baseUrl);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(600);
  await page.click('body');             // focus the page
  await page.keyboard.press('Enter');   // reveal name entry (still title-screen)
  await page.waitForTimeout(350);
  await page.keyboard.press('Enter');   // confirm name -> ready-screen
  await page.waitForTimeout(450);
  await page.keyboard.type('wopr');     // -> select-screen
  await page.waitForTimeout(500);
}

// Navigate from a fresh load all the way into a level's game screen.
// targetLevel is 1-indexed across all acts (1-25).
async function goToLevel(page, baseUrl, targetLevel) {
  await goToSelect(page, baseUrl);

  const actNum = Math.ceil(targetLevel / 5);
  for (let i = 1; i < actNum; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
  }
  const pos = ((targetLevel - 1) % 5) + 1;
  for (let i = 1; i < pos; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);
  }

  await goFromSelectIntoGame(page);
}

// Given the page already sitting on the select screen with the desired
// cabinet highlighted, drive it through to the game screen. Split out so
// callers that navigate the select screen themselves (e.g. capture-all.js's
// per-act screenshot loop) can reuse the tail end of the flow.
async function goFromSelectIntoGame(page) {
  await page.keyboard.press('Enter');   // select level -> title/name entry
  await page.waitForTimeout(350);
  await page.keyboard.press('Enter');   // confirm name -> ready-screen
  await page.waitForTimeout(350);
  await page.keyboard.press('Space');   // ready -> keyboard-preview-screen
  await page.waitForTimeout(350);
  await page.keyboard.press('Space');   // keyboard-preview -> game-screen
  await page.waitForTimeout(600);
}

// Navigate directly to a level (by ACTS_CONFIG-style {actIdx, posIdx})
// starting from a fresh load. Equivalent to goToLevel but takes the
// act/position pair directly instead of a global level number — useful when
// a caller already has an ALL_LEVELS entry.
async function goToLevelByPosition(page, baseUrl, actIdx, posIdx) {
  await goToSelect(page, baseUrl);
  for (let i = 0; i < actIdx; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(180);
  }
  for (let i = 0; i < posIdx; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(130);
  }
  await goFromSelectIntoGame(page);
}

// ── Animated-surface capture (GIF) ─────────────────────────────────────────
// For surfaces where the MOTION is the thing being validated (a key-lighting
// cascade, a wave animation) a single PNG can't prove the animation actually
// completes — the whole reason this helper exists is a mistimed static
// capture (mid-cascade) reading as a bug (docs/screenshots/capture-cinematics.js,
// 2026-07-12). captureGif() opens its OWN browser + context (recordVideo
// needs to be set at context-creation time, so it can't reuse a page from
// launchPage()), drives the page via a caller-supplied async `setup(page)`
// callback, records for `durationMs`, then converts the resulting webm to a
// palette-optimized GIF via ffmpeg (palettegen/paletteuse — far smaller and
// cleaner than a naive single-pass GIF encode).
//
// Params (all in one options object):
//   baseUrl    - passed through to setup() for convenience (not auto-navigated)
//   setup(page)- async callback that drives the page to the moment recording
//                should start (navigation, keystrokes, etc.). Playwright's
//                recordVideo captures from context-creation time, so
//                whatever setup() does (page.goto, menu navigation) is
//                ALSO in the raw recording — this is trimmed back out below
//                via ffmpeg -sseof so the output GIF contains only the
//                `durationMs` window AFTER setup() resolves, not the
//                navigation overhead before it.
//   durationMs - how long to keep, counted backward from the moment
//                recording stops (i.e. the window right after setup()
//                resolves) (default 5000)
//   fps        - output GIF frame rate (default 12)
//   width      - output GIF width in px, height auto-scaled (default 640)
//   outPath    - destination .gif path (directory created if missing)
//   viewport   - recording viewport (default 1280x800, matches launchPage())
//
// Returns { outPath, bytes, durationMs } on success. Throws on any ffmpeg or
// Playwright failure — callers should catch and report, matching the
// fail-loud convention of every capture-*.js script.
//
// Requires ffmpeg at /usr/local/bin/ffmpeg (verified present 2026-07-12,
// version 8.1). Uses execFileSync with array args throughout — never a
// string-built shell command (security.md rule 12).
async function captureGif({ baseUrl, setup, durationMs = 5000, fps = 12, width = 640, outPath, viewport = { width: 1280, height: 800 } }) {
  if (!outPath) throw new Error('captureGif: outPath is required');
  if (typeof setup !== 'function') throw new Error('captureGif: setup(page) callback is required');

  const outDir = path.dirname(outPath);
  fs.mkdirSync(outDir, { recursive: true });

  const videoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kk-gif-'));
  const browser = await chromium.launch({ headless: true });
  let webmPath;
  try {
    const context = await browser.newContext({
      viewport,
      recordVideo: { dir: videoDir, size: viewport },
    });
    const page = await context.newPage();
    const consoleErrors = [];
    // Route the fallback note through console.warn to match captureGif's own
    // warning stream (it already warns on console errors during recording).
    wireConsoleCapture(page, consoleErrors, console.warn);

    await setup(page, baseUrl);
    // Recording stops `durationMs` after setup() resolves — this window is
    // exactly what -sseof trims to below, so setup()'s own navigation time
    // (which recordVideo captured but we don't want in the gif) is discarded.
    await page.waitForTimeout(durationMs);

    const video = page.video();
    await page.close(); // flushes the video file to disk
    webmPath = video ? await video.path() : null;
    await context.close();

    if (!webmPath || !fs.existsSync(webmPath)) {
      throw new Error('captureGif: no video was recorded (page.video() returned nothing)');
    }
    if (consoleErrors.length) {
      // Not fatal — the caller may still want the gif — but surface it since
      // a silent console error during an animated capture is easy to miss.
      console.warn(`  captureGif: ${consoleErrors.length} console error(s) during recording:`);
      consoleErrors.forEach(e => console.warn('    ' + e));
    }
  } finally {
    await browser.close();
  }

  // Trim to the last `durationMs` of the recording via -sseof (seek from end
  // of file) BEFORE the palette pass — this is what discards setup()'s
  // navigation time and keeps only the window the caller actually asked for.
  // Must re-encode here (no `-c copy`): stream-copy seeking on VP8/VP9-in-webm
  // is keyframe-bound and silently no-ops with -sseof (verified 2026-07-12 —
  // `-c copy` produced a trimmed file with the SAME duration as the input;
  // dropping it to a re-encode gave the exact requested duration).
  const trimmedPath = path.join(videoDir, 'trimmed.webm');
  const sseofSeconds = (durationMs / 1000).toFixed(3);
  execFileSync(FFMPEG_BIN, [
    '-y', '-sseof', `-${sseofSeconds}`, '-i', webmPath,
    trimmedPath,
  ], { stdio: 'pipe' });

  // Two-pass palette-optimized GIF encode (palettegen -> paletteuse). Far
  // smaller/cleaner than ffmpeg's default single-pass GIF palette.
  const paletteFile = path.join(videoDir, 'palette.png');
  const scaleFilter = `scale=${width}:-1:flags=lanczos`;

  execFileSync(FFMPEG_BIN, [
    '-y', '-i', trimmedPath,
    '-vf', `fps=${fps},${scaleFilter},palettegen=stats_mode=diff`,
    paletteFile,
  ], { stdio: 'pipe' });

  execFileSync(FFMPEG_BIN, [
    '-y', '-i', trimmedPath, '-i', paletteFile,
    '-lavfi', `fps=${fps},${scaleFilter}[x];[x][1:v]paletteuse=dither=bayer`,
    outPath,
  ], { stdio: 'pipe' });

  fs.rmSync(videoDir, { recursive: true, force: true });

  const bytes = fs.statSync(outPath).size;
  return { outPath, bytes, durationMs };
}

module.exports = {
  REPO_ROOT,
  ACTS_CONFIG,
  ALL_LEVELS,
  resolveBaseUrl,
  launchPage,
  goToSelect,
  goToLevel,
  goToLevelByPosition,
  goFromSelectIntoGame,
  captureGif,
};
