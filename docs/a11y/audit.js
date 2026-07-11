// Keystroke Kingdom — Accessibility Contrast Audit
//
// Measures WCAG contrast ratios for key UI text against the *actual rendered
// pixels* behind it (screenshot-sampled), across every screen/level of the
// game. Read-only: does not modify any game source, does not rebuild.
//
// Usage:
//   node docs/a11y/audit.js
//
// Requires the dev server already running; URL is read from .dev-url at
// the repo root. Playwright module path is hard-coded per project convention
// (see .claude/rules/visual-validation.md).
//
// Output: docs/a11y/audit-before.json (or --out=<path>.json to override)

const { chromium } = require('/Users/trevormack/.npm/_npx/705bc6b22212b352/node_modules/playwright');
const fs   = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..', '..');
const DEV_URL = fs.readFileSync(path.join(REPO_ROOT, '.dev-url'), 'utf8').trim();

const OUT_JSON = process.argv.find(a => a.startsWith('--out='))
  ? process.argv.find(a => a.startsWith('--out=')).slice('--out='.length)
  : path.join(__dirname, 'audit-before.json');

const VIEWPORT = { width: 1280, height: 800 };

// ── Level / act config (mirrors docs/screenshots/capture-all.js) ───────────
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
    ALL_LEVELS.push({ levelNum: n, actIdx, posIdx, actSlug: act.slug, levelSlug: slug });
  });
});

// ── WCAG contrast math ──────────────────────────────────────────────────────
function srgbToLin(c) {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function relLuminance({ r, g, b }) {
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}
function contrastRatio(rgbA, rgbB) {
  const lA = relLuminance(rgbA);
  const lB = relLuminance(rgbB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}
function verdict(ratio) {
  if (ratio < 3.0) return 'FAIL';
  if (ratio < 4.5) return 'WARN';
  return 'PASS';
}
function rgbStr({ r, g, b }) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// ── In-page helpers ──────────────────────────────────────────────────────
// Parse a CSS rgb()/rgba() string into {r,g,b,a}
function parseCssColor(str) {
  if (!str) return null;
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(',').map(s => parseFloat(s.trim()));
  return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
}

// Given a full-page screenshot already loaded into an in-page <img>/canvas,
// sample the average background color within a DOMRect using a grid, via
// page.evaluate. We pass the rect + grid size in.
async function sampleRectAvg(page, rect, gridSize = 10) {
  return page.evaluate(({ rect, gridSize }) => {
    const canvas = window.__auditCanvas;
    const ctx = canvas.getContext('2d');
    const dpr = window.__auditDpr;
    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    let minLum = 255, maxLum = 0;
    const x0 = Math.max(0, rect.x);
    const y0 = Math.max(0, rect.y);
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const px = Math.floor((x0 + (w * (i + 0.5)) / gridSize) * dpr);
        const py = Math.floor((y0 + (h * (j + 0.5)) / gridSize) * dpr);
        if (px < 0 || py < 0 || px >= canvas.width || py >= canvas.height) continue;
        const d = ctx.getImageData(px, py, 1, 1).data;
        rSum += d[0]; gSum += d[1]; bSum += d[2];
        const lum = 0.2126 * d[0] + 0.7152 * d[1] + 0.0722 * d[2];
        if (lum < minLum) minLum = lum;
        if (lum > maxLum) maxLum = lum;
        count++;
      }
    }
    if (count === 0) return null;
    return {
      r: rSum / count, g: gSum / count, b: bSum / count,
      minLum, maxLum, samples: count,
    };
  }, { rect, gridSize });
}

// Load the current full-page screenshot (PNG buffer) into an offscreen
// in-page canvas so subsequent sampleRectAvg calls can read pixels.
async function loadScreenshotIntoPageCanvas(page, pngBuffer) {
  const b64 = pngBuffer.toString('base64');
  await page.evaluate(async (b64) => {
    const img = new Image();
    const loaded = new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    img.src = 'data:image/png;base64,' + b64;
    await loaded;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    window.__auditCanvas = canvas;
    // screenshot natural size vs CSS viewport size gives us the DPR baked
    // into the PNG (Playwright screenshots at device pixel resolution).
    window.__auditDpr = img.naturalWidth / window.innerWidth;
  }, b64);
}

async function getElementColor(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return cs.color;
  }, selector);
}

async function getElementRect(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return null;
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }, selector);
}

// Measure one element: computed text color vs sampled background average.
async function measureElement(page, label, selector) {
  const rect = await getElementRect(page, selector);
  if (!rect) return { label, selector, present: false };
  const colorStr = await getElementColor(page, selector);
  const color = parseCssColor(colorStr);
  const bg = await sampleRectAvg(page, rect, 10);
  if (!color || !bg) return { label, selector, present: true, error: 'could not resolve color/bg' };
  const ratio = contrastRatio(color, bg);
  return {
    label,
    selector,
    present: true,
    rect,
    textColor: rgbStr(color),
    textColorRaw: color,
    sampledBg: rgbStr(bg),
    sampledBgRaw: { r: bg.r, g: bg.g, b: bg.b },
    bgLumSpread: +(bg.maxLum - bg.minLum).toFixed(1), // proxy for "text glyphs visible in sample" noise
    contrastRatio: +ratio.toFixed(2),
    verdict: verdict(ratio),
  };
}

// Sample multiple elements matching a selector (e.g. several key-boxes).
async function measureElementsAll(page, labelPrefix, selector, maxCount = 5) {
  const handles = await page.$$(selector);
  if (handles.length === 0) return [];
  const idxs = [];
  if (handles.length <= maxCount) {
    for (let i = 0; i < handles.length; i++) idxs.push(i);
  } else {
    for (let i = 0; i < maxCount; i++) {
      idxs.push(Math.round((i * (handles.length - 1)) / (maxCount - 1)));
    }
  }
  const uniqueIdxs = [...new Set(idxs)];
  const results = [];
  for (const idx of uniqueIdxs) {
    const nthSelector = `:nth-match(${selector}, ${idx + 1})`; // not standard CSS; use JS instead
    const rect = await page.evaluate(({ sel, i }) => {
      const els = document.querySelectorAll(sel);
      const el = els[i];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return null;
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }, { sel: selector, i: idx });
    if (!rect) continue;
    const colorStr = await page.evaluate(({ sel, i }) => {
      const el = document.querySelectorAll(sel)[i];
      return el ? getComputedStyle(el).color : null;
    }, { sel: selector, i: idx });
    const isActive = await page.evaluate(({ sel, i }) => {
      const el = document.querySelectorAll(sel)[i];
      return el ? el.classList.contains('active-key') : false;
    }, { sel: selector, i: idx });
    const keyText = await page.evaluate(({ sel, i }) => {
      const el = document.querySelectorAll(sel)[i];
      return el ? el.textContent.trim() : '';
    }, { sel: selector, i: idx });
    const color = parseCssColor(colorStr);
    const bg = await sampleRectAvg(page, rect, 8);
    if (!color || !bg) continue;
    const ratio = contrastRatio(color, bg);
    results.push({
      label: `${labelPrefix}[${idx}]="${keyText}"${isActive ? ' (active-key)' : ''}`,
      selector: `${selector} (index ${idx})`,
      present: true,
      rect,
      textColor: rgbStr(color),
      sampledBg: rgbStr(bg),
      bgLumSpread: +(bg.maxLum - bg.minLum).toFixed(1),
      contrastRatio: +ratio.toFixed(2),
      verdict: verdict(ratio),
      isActiveKey: isActive,
    });
  }
  return results;
}

// Sample a fixed screen region (canvas-drawn HUD text) and report luminance
// spread as a proxy for "is there visible text contrast in this strip".
async function sampleRegionLumSpread(page, rectPx, gridSize = 24) {
  const bg = await sampleRectAvg(page, rectPx, gridSize);
  return bg ? { minLum: +bg.minLum.toFixed(1), maxLum: +bg.maxLum.toFixed(1), spread: +(bg.maxLum - bg.minLum).toFixed(1) } : null;
}

async function refreshScreenshotBuffer(page) {
  const buf = await page.screenshot({ fullPage: false });
  await loadScreenshotIntoPageCanvas(page, buf);
}

async function getCssVar(page, varName) {
  return page.evaluate((v) => getComputedStyle(document.body).getPropertyValue(v).trim(), varName);
}

// ── Navigation (mirrors docs/screenshots/capture-all.js, the documented flow) ──
async function goToSelect(page) {
  await page.goto(DEV_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(600);
  await page.click('body');
  await page.keyboard.press('Enter');   // reveal name entry
  await page.waitForTimeout(350);
  await page.keyboard.press('Enter');   // confirm -> ready-screen
  await page.waitForTimeout(450);
  await page.keyboard.type('wopr');     // -> select-screen
  await page.waitForTimeout(500);
}

async function navigateToLevelGameScreen(page, lvl) {
  await goToSelect(page);
  for (let i = 0; i < lvl.actIdx; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(180);
  }
  for (let i = 0; i < lvl.posIdx; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(130);
  }
  await page.keyboard.press('Enter');   // select level -> title/name
  await page.waitForTimeout(350);
  await page.keyboard.press('Enter');   // confirm name -> ready-screen
  await page.waitForTimeout(350);
  await page.keyboard.press('Space');   // ready -> keyboard-preview
  await page.waitForTimeout(350);
  await page.keyboard.press('Space');   // keyboard-preview -> game
  await page.waitForTimeout(600);
}

// ── Main ─────────────────────────────────────────────────────────────────
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize(VIEWPORT);

  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

  const results = {
    generatedAt: new Date().toISOString(),
    devUrl: DEV_URL,
    viewport: VIEWPORT,
    method: 'Text color = computed CSS color of the element. Background = average of a ' +
      '~8-10x10 pixel grid sampled from a full-page screenshot within the element\'s ' +
      'bounding rect. Because glyphs are thin relative to their box, this approximates ' +
      'the background BEHIND the text but is pulled slightly toward the glyph color ' +
      'itself (a conservative bias -- true bg-only contrast is usually >= reported here). ' +
      'bgLumSpread reports max-min luminance in the sampled grid: near 0 means a flat/' +
      'uniform sampled region (little text detected in-box or a very flat background).',
    thresholds: { fail: '< 3.0', warn: '3.0 - 4.5', pass: '>= 4.5 (WCAG AA large-text min is 3:1; ' +
      'this project targets higher for a 5-year-old reader)' },
    consoleErrors: [],
    screens: {},
  };

  // ── Title screen + name entry ──────────────────────────────────────────
  console.log('Title screen...');
  await page.goto(DEV_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(600);
  await refreshScreenshotBuffer(page);
  results.screens.title = {
    elements: await Promise.all([
      measureElement(page, 'title h1 (KEYSTROKE)', '.title-marquee h1'),
      measureElement(page, 'title .kingdom (KINGDOM)', '.title-marquee .kingdom'),
      measureElement(page, 'INSERT COIN', '.insert-coin'),
      measureElement(page, 'coin-hint (PRESS SPACE OR ENTER)', '.coin-hint'),
    ]),
  };

  console.log('Name entry...');
  await page.click('body');
  await page.keyboard.press('Enter'); // reveal name entry
  await page.waitForTimeout(400);
  await refreshScreenshotBuffer(page);
  results.screens.nameEntry = {
    elements: await Promise.all([
      measureElement(page, 'name-label (ENTER YOUR NAME)', '.name-label'),
      measureElement(page, 'name-input', '.name-input'),
      measureElement(page, 'ready-text (PRESS ENTER TO START)', '.ready-text'),
    ]),
  };

  console.log('Ready screen...');
  await page.keyboard.press('Enter'); // confirm name -> ready screen
  await page.waitForTimeout(450);
  await refreshScreenshotBuffer(page);
  results.screens.ready = {
    elements: await Promise.all([
      measureElement(page, 'READY', '.ready-player'),
      measureElement(page, 'player name', '.ready-name'),
      measureElement(page, 'level-intro', '.level-intro'),
      measureElement(page, 'start-prompt (PRESS SPACE TO BEGIN)', '.start-prompt'),
    ]),
  };

  // ── Select screen (one snapshot per act) ───────────────────────────────
  console.log('Select screen (all acts)...');
  await page.keyboard.type('wopr');
  await page.waitForTimeout(500);
  results.screens.select = { byAct: [] };
  for (let i = 0; i < ACTS_CONFIG.length; i++) {
    await refreshScreenshotBuffer(page);
    const elements = await Promise.all([
      measureElement(page, 'select-title', '.select-title'),
      measureElement(page, 'select-subtitle', '.select-subtitle'),
      measureElement(page, 'select-act-label', '.select-act-label'),
      measureElement(page, 'select-prompt', '.select-prompt'),
      measureElement(page, 'select-hint', '.select-hint'),
    ]);
    const cabinetLabels = await measureElementsAll(page, 'cabinet-label', '.cabinet-label', 5);
    results.screens.select.byAct.push({ actSlug: ACTS_CONFIG[i].slug, elements, cabinetLabels });
    if (i < ACTS_CONFIG.length - 1) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(300);
    }
  }

  // ── Per-level: keyboard-preview + game screen + complete overlay + pause ──
  results.screens.keyboardPreview = { byLevel: [] };
  results.screens.game = { byLevel: [] };
  results.screens.completeOverlay = { byLevel: [] };
  results.screens.pause = { byLevel: [] };
  results.screens.canvasHud = { byLevel: [] };

  for (const lvl of ALL_LEVELS) {
    console.log(`Level ${lvl.levelNum} (${lvl.actSlug}/${lvl.levelSlug})...`);
    await goToSelect(page);
    for (let i = 0; i < lvl.actIdx; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(180); }
    for (let i = 0; i < lvl.posIdx; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(130); }
    await page.keyboard.press('Enter');  // select level -> title/name
    await page.waitForTimeout(350);
    await page.keyboard.press('Enter');  // confirm name -> ready-screen
    await page.waitForTimeout(350);
    await page.keyboard.press('Space');  // ready -> keyboard-preview
    await page.waitForTimeout(400);

    // Keyboard preview screen (canvas-drawn keyboard rows + CSS header text)
    await refreshScreenshotBuffer(page);
    const accentColors = await page.evaluate(() => {
      const cs = getComputedStyle(document.body);
      return {
        levelAccent: cs.getPropertyValue('--level-accent').trim(),
        levelAccentDim: cs.getPropertyValue('--level-accent-dim').trim(),
      };
    });
    // Sample the canvas region where keyboard rows are drawn (below header,
    // spans most of the screen) to get an average bg for accent comparison.
    const kbCanvasBg = await sampleRectAvg(page, { x: 100, y: 250, width: 1080, height: 400 }, 12);
    const kbpElements = await Promise.all([
      measureElement(page, 'kbp-title (LEVEL N)', '.kbp-title'),
      measureElement(page, 'kbp-subtitle', '.kbp-subtitle'),
    ]);
    let accentVsCanvasBg = null;
    if (kbCanvasBg) {
      const parseHex = (hex) => {
        const h = hex.replace('#', '');
        const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
        const num = parseInt(full, 16);
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
      };
      try {
        const accentRgb = parseHex(accentColors.levelAccent);
        const accentDimRgb = parseHex(accentColors.levelAccentDim);
        accentVsCanvasBg = {
          canvasBg: rgbStr(kbCanvasBg),
          levelAccentHex: accentColors.levelAccent,
          levelAccentDimHex: accentColors.levelAccentDim,
          accentVsBgRatio: +contrastRatio(accentRgb, kbCanvasBg).toFixed(2),
          accentDimVsBgRatio: +contrastRatio(accentDimRgb, kbCanvasBg).toFixed(2),
        };
        accentVsCanvasBg.accentVerdict = verdict(accentVsCanvasBg.accentVsBgRatio);
        accentVsCanvasBg.accentDimVerdict = verdict(accentVsCanvasBg.accentDimVsBgRatio);
      } catch (e) { /* non-hex color format, skip */ }
    }
    results.screens.keyboardPreview.byLevel.push({
      levelNum: lvl.levelNum, actSlug: lvl.actSlug, levelSlug: lvl.levelSlug,
      elements: kbpElements, accentVsCanvasBg,
    });

    await page.keyboard.press('Space');  // keyboard-preview -> game
    await page.waitForTimeout(700);

    // Game screen
    await refreshScreenshotBuffer(page);
    // NOTE: .hud-line elements mix a dim label ("ACCURACY") with a brighter
    // .hud-value child ("100%") in the same line box. Measuring the whole
    // line's bounding rect against the parent's computed color conflates
    // two different text colors' worth of background bleed. We measure the
    // .hud-value spans directly (unambiguous single-color text) and the
    // whole line only as a secondary/contextual data point.
    const gameElements = await Promise.all([
      measureElement(page, 'prompt-label (TYPE THE LETTER)', '.prompt-label'),
      measureElement(page, 'prompt-letter.active', '.prompt-letter.active'),
      measureElement(page, 'hud-value #hud-name', '#hud-name'),
      measureElement(page, 'hud-value #hud-accuracy', '#hud-accuracy'),
      measureElement(page, 'hud-value #hud-streak', '#hud-streak'),
      measureElement(page, 'hud-line label text (ACCURACY, mixed-color line, contextual only)', '.hud-line:nth-child(2)'),
      measureElement(page, 'level-badge-text', '.level-badge-text'),
    ]);
    const keyBoxElements = await measureElementsAll(page, 'key-box', '.key-box', 5);
    // Force-include the active key if the sampler above didn't catch it
    const activeKeyDirect = await measureElement(page, 'key-box.active-key (direct)', '.key-box.active-key');
    results.screens.game.byLevel.push({
      levelNum: lvl.levelNum, actSlug: lvl.actSlug, levelSlug: lvl.levelSlug,
      elements: gameElements, keyBoxSamples: keyBoxElements, activeKeyDirect,
    });

    // Canvas HUD strip (top-left in-canvas text like "DISTANCE 0/30")
    const hudStrip = await sampleRegionLumSpread(page, { x: 10, y: 5, width: 290, height: 35 }, 20);
    results.screens.canvasHud.byLevel.push({
      levelNum: lvl.levelNum, actSlug: lvl.actSlug, levelSlug: lvl.levelSlug,
      region: { x: 10, y: 5, width: 290, height: 35 },
      ...hudStrip,
      flagLowContrast: hudStrip ? hudStrip.spread < 25 : null, // heuristic: little/no visible text edges
    });

    // Pause overlay (Escape key while on game screen)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const pauseVisible = await page.evaluate(() => !document.getElementById('pause-overlay').classList.contains('hidden'));
    if (pauseVisible) {
      await refreshScreenshotBuffer(page);
      const pauseElements = await Promise.all([
        measureElement(page, 'pause-title (PAUSED)', '.pause-title'),
        measureElement(page, 'pause-option (ESC)', '.pause-option:nth-child(2)'),
        measureElement(page, 'pause-option (Q)', '.pause-option:nth-child(3)'),
      ]);
      results.screens.pause.byLevel.push({ levelNum: lvl.levelNum, actSlug: lvl.actSlug, levelSlug: lvl.levelSlug, elements: pauseElements });
      await page.keyboard.press('Escape'); // unpause
      await page.waitForTimeout(200);
    } else {
      results.screens.pause.byLevel.push({ levelNum: lvl.levelNum, actSlug: lvl.actSlug, levelSlug: lvl.levelSlug, error: 'pause overlay did not appear' });
    }

    // Level-complete overlay: force-show via class removal (documented technique)
    await page.evaluate(() => document.getElementById('complete-overlay').classList.remove('hidden'));
    await page.waitForTimeout(200);
    await refreshScreenshotBuffer(page);
    const completeElements = await Promise.all([
      measureElement(page, 'complete-title (LEVEL COMPLETE)', '.complete-title'),
      measureElement(page, 'complete-stat TIME', '.complete-stat:nth-child(1)'),
      measureElement(page, 'complete-stat ACCURACY', '.complete-stat:nth-child(2)'),
      measureElement(page, 'complete-stat BEST STREAK', '.complete-stat:nth-child(3)'),
      measureElement(page, 'complete-stat KEYS MASTERED', '.complete-stat:nth-child(4)'),
      measureElement(page, 'complete-prompt', '.complete-prompt'),
    ]);
    results.screens.completeOverlay.byLevel.push({
      levelNum: lvl.levelNum, actSlug: lvl.actSlug, levelSlug: lvl.levelSlug, elements: completeElements,
    });
    await page.evaluate(() => document.getElementById('complete-overlay').classList.add('hidden'));
  }

  results.consoleErrors = [...new Set(consoleErrors)];

  fs.writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
  console.log(`\nWrote ${OUT_JSON}`);
  if (results.consoleErrors.length) {
    console.log('\nCONSOLE/PAGE ERRORS DETECTED:');
    results.consoleErrors.forEach(e => console.log('  ' + e));
  } else {
    console.log('No console errors.');
  }

  await browser.close();
})().catch(e => {
  console.error('AUDIT FAILED:', e);
  process.exit(1);
});
