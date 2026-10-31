// Shared helpers for the Level 13 key-name beat tests (INV-153..166).
// Player-route only: real key events, observable DOM. No engine internals.
import { startGame, toLevel, readPrompt, press, isLevelCompleteVisible, slotsSeed } from './game-driver.mjs';
import { LEVELS } from '../../js/levels.js';
import { KEY_CARDS } from '../../js/key-cards.js';

export const BEAT = KEY_CARDS.find((c) => c.id === 'key-semicolon');
export const BEAT_ID = BEAT.id;
export const BEAT_WORD = BEAT.word;

/** The pattern index the design says the beat lands at: one past the first intro drill
 *  that introduces the LAST of the level's new keys (spec §5.2). Derived from js/levels.js. */
export function derivedSpliceIndex(level = BEAT.level) {
  const intro = LEVELS[level].intro;
  let last = 0;
  for (const k of LEVELS[level].newKeys) {
    const i = intro.findIndex((p) => p.includes(k));
    if (i > last) last = i;
  }
  return Math.max(1, Math.min(intro.length, last + 1));
}

/** A one-game `kk-slots` seed. */
export function seed({ name = 'PLAYER ONE', furthestLevel = 13, cards = [], completed = {}, cardRotation = {} } = {}) {
  return { 'kk-slots': JSON.stringify(slotsSeed({ name, furthestLevel, cards, completed, cardRotation })) };
}

/** Boot straight into `level`'s game screen with a seeded save. */
export async function startAt(level, opts = {}) {
  const { settings, ...saveOpts } = opts;
  const g = await startGame({ settings, localStorage: seed({ furthestLevel: Math.max(level, 13), ...saveOpts }) });
  await toLevel(g.page, g.baseUrl, level);
  return g;
}

export const bodyText = (page) => page.evaluate(() => document.body.innerText);
export const slotNow = (page) => page.evaluate(() => {
  const raw = JSON.parse(localStorage.getItem('kk-slots'));
  return raw.slots[raw.active];
});
export const captionLines = (page) => page.evaluate(() => {
  const el = document.getElementById('key-name-caption');
  if (!el || el.classList.contains('hidden')) return [];
  return el.innerText.split('\n').map((s) => s.trim()).filter(Boolean);
});
/** Classes the guide's key box showing `glyph` has beyond a plain learned key. */
export const guideKeyClasses = (page, glyph) => page.evaluate((gl) => {
  const boxes = [...document.querySelectorAll('#keyboard-guide .key-box, #keyboard-guide > div')];
  const box = boxes.find((b) => b.textContent.trim() === gl);
  return box ? [...box.classList] : null;
}, glyph);

/**
 * Walk the level by typing the active token each step. Hooks (all optional, async):
 *   before({word, index, token, patternNo, words}) -> 'stop' to return
 *   after({word, patternNo, words})                -> 'stop' to return (called after a pattern's last key)
 * `loose` records each pattern the first time it is read at ANY letter (for long sentences).
 * Returns { words (each pattern as served, in order), won, presses }.
 */
export async function walk(page, { before, after, maxPresses = 1500, loose = false } = {}) {
  const words = [];
  let patternNo = 0; let presses = 0; let lastStarted = -1;
  while (presses < maxPresses) {
    if (await isLevelCompleteVisible(page)) return { words, won: true, presses };
    const p = await readPrompt(page);
    if (p.activeToken == null) { await page.waitForTimeout(70); continue; }
    const word = p.tokens.join('');
    if ((loose || p.activeIndex === 0) && lastStarted !== patternNo) { words.push(word); lastStarted = patternNo; }
    if (before && (await before({ word, index: p.activeIndex, token: p.activeToken, patternNo, words })) === 'stop') {
      return { words, won: false, presses };
    }
    await press(page, p.activeToken);
    presses++;
    await page.waitForTimeout(35);
    if (p.activeIndex === p.tokens.length - 1) {
      patternNo++;
      if (after && (await after({ word, patternNo, words })) === 'stop') return { words, won: false, presses };
    }
  }
  return { words, won: await isLevelCompleteVisible(page), presses };
}

export async function waitComplete(page, ms = 9000) {
  const end = Date.now() + ms;
  while (Date.now() < end) { if (await isLevelCompleteVisible(page)) return true; await page.waitForTimeout(100); }
  return false;
}
