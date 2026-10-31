// Shared "drawn text" recorder for canvas-only surfaces (the bonus wings, the
// KNOW YOUR KEYS preview, the home-row finger diagram).
//
// It wraps CanvasRenderingContext2D.fillText/strokeText and keeps ONLY the
// STRINGS the game asked the canvas to draw — literally the words on screen.
// It never records a coordinate, size, colour or pixel, so it stays on the right
// side of STRATEGY.md §2 ("no pixel/geometry assertions on canvas art"): a pure
// refactor that keeps the same words on screen keeps these assertions green.
// (The same technique tests/integration/speedway.test.mjs established.)
//
// Install BEFORE the first navigation (`addInitScript`), then read windows of
// drawn text with `captureDrawn`.

/** @param {import('playwright').Page} page */
export async function installDrawRecorder(page) {
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

/**
 * Clear the buffer, let `frames` animation frames pass, and return every string
 * drawn in that window.
 * @param {import('playwright').Page} page
 * @param {number} [frames=3]
 * @returns {Promise<string[]>}
 */
export async function captureDrawn(page, frames = 3) {
  await page.evaluate(() => { window.__kkDraw = []; });
  await page.evaluate((n) => new Promise((resolve) => {
    let i = 0;
    const step = () => { i += 1; if (i >= n) resolve(); else requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), frames);
  return page.evaluate(() => (window.__kkDraw || []).slice());
}

/** Case-insensitive "was this phrase drawn" — `needle` is a string or a RegExp. */
export const drawnIncludes = (drawn, needle) => (needle instanceof RegExp
  ? drawn.some((s) => needle.test(s))
  : drawn.some((s) => s.toUpperCase().includes(String(needle).toUpperCase())));

/**
 * Poll until `needle` is drawn (or the deadline passes). Returns the last
 * captured window either way, so a failing assertion can print what WAS drawn.
 */
export async function waitForDrawn(page, needle, { timeoutMs = 15000, frames = 3 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let drawn = [];
  while (Date.now() < deadline) {
    drawn = await captureDrawn(page, frames);
    if (drawnIncludes(drawn, needle)) return { found: true, drawn };
    await page.waitForTimeout(150);
  }
  return { found: false, drawn };
}
