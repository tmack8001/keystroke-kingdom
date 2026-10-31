// Enforces: INV-156 (Free Play), INV-158 (levers), INV-159 (Survival), INV-162 (withheld before Level 13,
// the gallery shelf), INV-166 (the Level 20 eighth-key confession, two variants) — docs/specs/
// semicolon-teaching-beat.md §5.5–§5.8, §10; product.md §"The Key Names", §Word Length ("guaranteed
// content is never filtered"), §EXPERIENCE; easter-eggs.md §The eighth-key confession; CLAUDE.md One Rule.
//
// Every scenario is the player's route (real key events); expected strings come from the keyboard
// card record (the design's single source for the sentences), never re-typed here.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  startGame, toLevel, toSelect, readPrompt, readHUD, press, readScreen, isLevelCompleteVisible,
} from '../helpers/game-driver.mjs';
import {
  BEAT, BEAT_ID, BEAT_WORD, seed, startAt, walk, waitComplete, bodyText, slotNow,
} from '../helpers/key-beat.mjs';

const T = 400_000;
const WORD_RE = new RegExp(BEAT_WORD, 'i');
const tap = async (page, key, ms = 450) => { await page.keyboard.press(key); await page.waitForTimeout(ms); };

// ── INV-158 ───────────────────────────────────────────────────────────────────
describe('INV-158 — the beat is guaranteed under every difficulty lever', () => {
  for (const [label, settings] of [
    ['MIN WORD LENGTH 12 / MAX 4 (a range nothing in the level fits)', { minWordLen: 12, maxWordLen: 4 }],
    ['WIZARD (EXPERIENCE 3.5x)', { winRatio: 3.5 }],
  ]) {
    test(`${label}: served exactly once, and the level is won`, { timeout: T }, async () => {
      const g = await startAt(13, { furthestLevel: 13, settings });
      try {
        const run = await walk(g.page, { maxPresses: 4000 });
        assert.equal(run.won, true, 'the level is winnable');
        assert.equal(run.words.filter((w) => w === BEAT_WORD).length, 1, `beat once: ${run.words.join(' ')}`);
        assert.ok((await slotNow(g.page)).cards.includes(BEAT_ID));
      } finally { await g.stop(); }
    });
  }
});

// ── INV-159 ───────────────────────────────────────────────────────────────────
describe('INV-159 — Survival never clocks the lesson', () => {
  test('no timer bar and no lost quarter on the beat, however long the child idles; the clock is back on the next pattern', { timeout: T }, async () => {
    const g = await startGame({
      settings: { playStyle: 'survival', lives: 5, difficulty: 'expert' },
      localStorage: seed({ furthestLevel: 13 }),
    });
    await g.page.addInitScript(() => {
      const real = Date.now.bind(Date);
      window.__skew = 0;
      Date.now = () => real() + window.__skew;
    });
    try {
      await toLevel(g.page, g.baseUrl, 13);
      const trackHidden = () => g.page.evaluate(() => {
        const t = document.getElementById('survival-timer-track');
        return !t || t.classList.contains('hidden');
      });
      let probe = null; let nextPatternTrackHidden = null; let beatDone = false; let quartersAtEnd = null;
      const q0 = (await readHUD(g.page)).quarters;
      const run = await walk(g.page, {
        before: async ({ word, index }) => {
          if (word === BEAT_WORD && index === 4 && !probe) {
            const quartersBefore = (await readHUD(g.page)).quarters;
            const promptBefore = (await readPrompt(g.page)).tokens.join('');
            const hiddenBefore = await trackHidden();
            await g.page.evaluate(() => { window.__skew += 600_000; });   // far past any pattern duration
            await g.page.waitForTimeout(1500);
            const p = await readPrompt(g.page);
            probe = { quartersBefore, quartersAfter: (await readHUD(g.page)).quarters, hiddenBefore,
              hiddenAfter: await trackHidden(), promptBefore, promptAfter: p.tokens.join(''), indexAfter: p.activeIndex };
          }
          if (beatDone && nextPatternTrackHidden === null && index === 0 && word !== BEAT_WORD) {
            nextPatternTrackHidden = await trackHidden();
          }
        },
        after: async ({ word }) => {
          if (word === BEAT_WORD) beatDone = true;
          quartersAtEnd = (await readHUD(g.page)).quarters;   // the purse is hidden once LEVEL COMPLETE shows
        },
      });
      assert.ok(probe, 'reached the middle of the beat word');
      assert.equal(probe.hiddenBefore, true, 'no timer bar while the beat is the current pattern');
      assert.equal(probe.hiddenAfter, true);
      assert.equal(probe.quartersAfter, probe.quartersBefore, 'idling past the duration loses no quarter on a lesson');
      assert.equal(probe.promptAfter, probe.promptBefore, 'the lesson word is not replaced');
      assert.equal(probe.indexAfter, 4, 'the child is still on the same letter');
      assert.equal(nextPatternTrackHidden, false, 'the clock is back on the next pattern');
      assert.equal(run.won, true, 'the level is won');
      assert.ok(Number.isInteger(quartersAtEnd) && quartersAtEnd >= 1, `a quarter is still in the purse: ${quartersAtEnd} (started ${q0})`);
      assert.ok((await slotNow(g.page)).cards.includes(BEAT_ID));
    } finally { await g.stop(); }
  });
});

// ── INV-156: Free Play ────────────────────────────────────────────────────────
describe('INV-156 — Free Play never serves the beat', () => {
  test('Free Play on the Level 13 cabinet types real sentences and never the lesson word', { timeout: T }, async () => {
    const g = await startGame({ localStorage: seed({ furthestLevel: 25 }) });
    try {
      await toSelect(g.page, g.baseUrl);
      await tap(g.page, 'f', 250);                         // FREE PLAY on
      for (let i = 0; i < 2; i++) await tap(g.page, 'ArrowDown', 200);   // Act 3
      for (let i = 0; i < 2; i++) await tap(g.page, 'ArrowRight', 160);   // third cabinet: Level 13
      await tap(g.page, 'Enter', 350);                     // pick cabinet
      await tap(g.page, 'Enter', 350);                     // confirm name
      const ready = await bodyText(g.page);
      assert.match(ready, /13/, 'the Level 13 cabinet was the one picked');
      await tap(g.page, ' ', 350);
      await tap(g.page, ' ', 900);
      assert.equal(await readScreen(g.page), 'game-screen');
      const run = await walk(g.page, { maxPresses: 1200, loose: true });
      // A Free Play session is a handful of sentences — more than the beat's splice index (4) — played to its end.
      assert.equal(run.won, true, 'the Free Play session completes');
      assert.ok(run.words.length >= 5 && run.words.some((w) => w.includes(' ')), `played real patterns: ${run.words.join(' | ')}`);
      assert.ok(!run.words.includes(BEAT_WORD), 'the lesson is a curriculum beat, never Free Play');
      assert.ok(!(await slotNow(g.page)).cards.includes(BEAT_ID), 'nothing credited');
    } finally { await g.stop(); }
  });
});

// ── INV-162 ───────────────────────────────────────────────────────────────────
async function resumeIntoGame(g, level) {
  await g.page.goto(g.baseUrl);
  await g.page.waitForTimeout(800);
  await g.page.click('body');
  assert.equal(await readScreen(g.page), 'slots-screen');
  return level;
}

describe('INV-162 — the word is withheld before Level 13', () => {
  test('the picker, the gallery and Level 12 played to completion never show it (furthest level 12, no card)', { timeout: T }, async () => {
    const g = await startGame({ localStorage: seed({ furthestLevel: 12 }) });
    try {
      await resumeIntoGame(g, 12);
      assert.ok(!WORD_RE.test(await bodyText(g.page)), 'picker');
      await tap(g.page, 'c', 600);
      assert.equal(await readScreen(g.page), 'collection-screen');
      assert.ok(!WORD_RE.test(await bodyText(g.page)), 'gallery');
      const shelfCells = await g.page.evaluate(() => [...document.querySelectorAll('.collection-cell')]
        .filter((c) => c.textContent.includes(';')).length);
      assert.equal(shelfCells, 0, 'no KEYBOARD tile advertised below its level');
      await tap(g.page, 'Escape', 500);
      await tap(g.page, ' ', 500);                        // resume -> ready
      await tap(g.page, ' ', 500);                        // preview
      await tap(g.page, ' ', 900);                        // game
      assert.equal(await readScreen(g.page), 'game-screen');
      const leaks = [];
      const run = await walk(g.page, {
        before: async ({ index, patternNo }) => { if (index === 0 && WORD_RE.test(await bodyText(g.page))) leaks.push(patternNo); },
      });
      assert.equal(run.won, true);
      await g.page.waitForTimeout(500);
      assert.deepEqual(leaks, []);
      assert.ok(!WORD_RE.test(await bodyText(g.page)), 'LEVEL COMPLETE card');
    } finally { await g.stop(); }
  });

  test('Level 4 (where the eighth key arrives) played to completion never shows it', { timeout: T }, async () => {
    const g = await startAt(4, { furthestLevel: 4 });
    try {
      const leaks = [];
      const run = await walk(g.page, {
        before: async ({ index, patternNo }) => { if (index === 0 && WORD_RE.test(await bodyText(g.page))) leaks.push(patternNo); },
      });
      assert.equal(run.won, true);
      await g.page.waitForTimeout(500);
      assert.deepEqual(leaks, []);
      assert.ok(!WORD_RE.test(await bodyText(g.page)));
    } finally { await g.stop(); }
  });

  test('at furthest level 13 the KEYBOARD shelf shows glyph + ??? and never the word until the card is owned', { timeout: T }, async () => {
    for (const owned of [false, true]) {
      const g = await startGame({ localStorage: seed({ furthestLevel: 13, cards: owned ? [BEAT_ID] : [] }) });
      try {
        await resumeIntoGame(g, 13);
        await tap(g.page, 'c', 600);
        assert.equal(await readScreen(g.page), 'collection-screen');
        const cell = await g.page.evaluate((glyph) => {
          const cells = [...document.querySelectorAll('.collection-cell')];
          const c = cells.find((x) => x.textContent.includes(glyph) || /SEMICOLON/i.test(x.textContent));
          return c ? { text: c.innerText.replace(/\s+/g, ' ').trim(), locked: c.classList.contains('locked') } : null;
        }, BEAT.glyph);
        assert.ok(cell, `a KEYBOARD tile is shelved (owned=${owned})`);
        if (!owned) {
          assert.equal(cell.locked, true);
          assert.ok(cell.text.includes(BEAT.glyph) && cell.text.includes('???'), `glyph + ???: "${cell.text}"`);
          assert.ok(!WORD_RE.test(await bodyText(g.page)), 'the word is not on the gallery screen');
        } else {
          assert.ok(cell.text.includes(BEAT_WORD.toUpperCase()), `owned tile names it: "${cell.text}"`);
        }
      } finally { await g.stop(); }
    }
  });
});

// ── INV-166 ───────────────────────────────────────────────────────────────────
const MET = 'YOU MET ITS NAME AT LEVEL 13.';
const ANON = 'THE EIGHTH KEY HAS A NAME.';

async function winLevel20(opts) {
  const g = await startAt(20, { furthestLevel: 20, ...opts });
  try {
    const run = await walk(g.page, { maxPresses: 4000 });
    assert.equal(run.won, true, 'Level 20 is won');
    await g.page.waitForTimeout(500);
    const conf = await g.page.evaluate(() => {
      const el = document.getElementById('eighth-key-confession');
      return el ? { text: el.textContent, visible: !!el.offsetParent } : null;
    });
    return { conf, errors: g.consoleErrors };
  } finally { await g.stop(); }
}

describe('INV-166 — the Level 20 eighth-key confession has two true variants', () => {
  for (const [label, cards, line1] of [
    ['A (the name was met at Level 13)', [BEAT_ID], MET],
    ['B (the name was never met — a WOPR jump)', [], ANON],
  ]) {
    test(`variant ${label}: two lines, line 2 is the record's code sentence, ends with ';', never the word`, { timeout: T }, async () => {
      const { conf, errors } = await winLevel20({ cards });
      assert.ok(conf && conf.visible, 'the confession shows on the first Level 20 clear');
      const lines = conf.text.split('\n');
      assert.deepEqual(lines, [line1, BEAT.code]);
      assert.ok(conf.text.trimEnd().endsWith(BEAT.glyph));
      assert.ok(!WORD_RE.test(conf.text), 'never names the key');
      assert.ok(!/\bEVERY\b/i.test(conf.text));
      assert.deepEqual(errors, []);
    });
  }

  test('once per save: a save that already cleared Level 20 sees neither variant', { timeout: T }, async () => {
    const { conf } = await winLevel20({ cards: [BEAT_ID], completed: { '20': true } });
    assert.equal(conf, null, 'a replay shows no confession');
  });
});
