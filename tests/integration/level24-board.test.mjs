// Enforces: INV-150 — STRATEGY.md §5 "The 2026-10-30 sign-off wave". Sibling of
// level24-name.test.mjs (INV-74), which pins what the PROMPT stream contains; this pins what
// the high-score BOARD says.
//
// Design sources:
//   - levels/act5.md §Level 24: "this is the 'type your own name in all caps' level… The
//     player types their name… It appears as a high score entry. Personal, irreplaceable."
//   - js/themes/highscore.js header + `slotName()`: "The #1 slot in the left margin holds ONLY
//     the player's name: a blinking placeholder through the warm-up drills, the name assembling
//     letter by letter as it is typed, then the name held there for the rest of the level. No
//     other word (drill, card word, pool word) is ever shown in it." "Only prefixes of 3+
//     letters are hidden" so a real name sharing a first letter or two with a card word still
//     lands from its very first keystroke.
//   - The level-complete card must not claim "YOU TYPED YOUR NAME" when no name was typed
//     (main.js: SHIFT MASTERED otherwise) — a card that claims something false to a child.
//
// OBSERVABLE: the board is canvas-only, so (as Act 7/Act 6 tests do) the observable is the
// WORDS the theme asks the canvas to draw (tests/helpers/draw-recorder.mjs — strings only,
// never a coordinate or pixel).

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  startGame, toLevel, readPrompt, press, isLevelCompleteVisible,
} from '../helpers/game-driver.mjs';
import { installDrawRecorder, captureDrawn } from '../helpers/draw-recorder.mjs';
import { cardsForLevel } from '../../js/history-cards.js';
import { LEVELS } from '../../js/levels.js';

const T = 240_000;
const DRILLS = new Set(LEVELS[24].intro.map((p) => p.join('')));
const CARD_WORDS = cardsForLevel(24).map((c) => c.word);
const PLACEHOLDER = /^_ _ _$/;

const seed = (name) => ({
  'kk-slots': JSON.stringify({
    v: 1, active: 0,
    slots: [{ name, furthestLevel: 25, completed: {}, nameMoment: null, textWorlds: {}, cards: [], cardRotation: {}, storyRotation: {} }],
  }),
  'kk-settings': JSON.stringify({ playerName: name }),
});

// Play Level 24, sampling the words the board draws after every key.
async function playSampling(page) {
  const samples = [];   // { word, typed, index, drawn }
  let guard = 0;
  while (guard++ < 600 && !(await isLevelCompleteVisible(page))) {
    const { tokens, activeIndex } = await readPrompt(page);
    if (activeIndex < 0 || tokens.length === 0) { await page.waitForTimeout(100); continue; }
    const word = tokens.join('');
    for (let i = activeIndex; i < tokens.length; i++) {
      await press(page, tokens[i]);
      const drawn = await captureDrawn(page, 2);
      samples.push({ word, typed: tokens.slice(0, i + 1).join(''), index: i, drawn });
    }
    await page.waitForTimeout(150);
  }
  for (let i = 0; i < 60 && !(await isLevelCompleteVisible(page)); i++) await page.waitForTimeout(120);
  return samples;
}

describe('INV-150 — Level 24\'s #1 slot: placeholder, then the typed name live, then held', () => {
  let g; let samples;
  before(async () => {
    g = await startGame({ localStorage: seed('OONA') });
    await installDrawRecorder(g.page);
    await toLevel(g.page, g.baseUrl, 24);
    await g.page.waitForTimeout(600);
    samples = await playSampling(g.page);
  });
  after(async () => { await g.stop(); });

  test('the level completes', { timeout: T }, async () => {
    assert.ok(await isLevelCompleteVisible(g.page));
  });

  test('during the warm-up drills the slot shows a placeholder, never a drill word', { timeout: T }, async () => {
    const drillSamples = samples.filter((s) => DRILLS.has(s.word));
    assert.ok(drillSamples.length > 0, 'fixture: the drills were played');
    assert.ok(drillSamples.some((s) => s.drawn.some((d) => PLACEHOLDER.test(d))), 'the invitation placeholder is drawn while the drills play');
    for (const s of drillSamples) {
      for (const d of s.drawn) {
        assert.ok(!(DRILLS.has(d) && d.length > 1), `a drill word ("${d}") must not be drawn as the name`);
      }
    }
  });

  test('as the name is typed it assembles live, letter by letter, in the slot', { timeout: T }, async () => {
    const nameSamples = samples.filter((s) => s.word === 'Oona');
    assert.equal(nameSamples.length, 4, `the guaranteed name was typed (INV-74); words: ${samples.map((s) => s.word).join(' ')}`);
    for (const s of nameSamples.slice(0, 3)) {
      assert.ok(
        s.drawn.some((d) => d.startsWith(s.typed) && d.length <= s.typed.length + 1),
        `after typing "${s.typed}" the slot shows it (optionally with a cursor); drawn: ${JSON.stringify([...new Set(s.drawn)])}`,
      );
    }
  });

  test('once typed, the name is HELD in the slot for the rest of the level (never overwritten by later words)', { timeout: T }, async () => {
    const lastName = samples.map((s) => s.word).lastIndexOf('Oona');
    const later = samples.slice(lastName + 1).filter((s) => s.index === s.word.length - 1);
    assert.ok(later.length >= 2, 'words were typed after the name');
    for (const s of later) {
      assert.ok(s.drawn.some((d) => d === 'Oona'), `after "${s.word}" the slot still says Oona; drawn: ${JSON.stringify([...new Set(s.drawn)])}`);
    }
  });

  test('the complete card claims YOU TYPED YOUR NAME only because a name was typed', { timeout: T }, async () => {
    assert.match(await g.page.evaluate(() => document.querySelector('.complete-title').textContent), /YOU TYPED YOUR NAME/);
  });
});

describe('INV-150 — a history-card word is never shown as the name', () => {
  let g; let samples;
  before(async () => {
    // A name with no letters leaves nothing to splice, so the level's card word lands in the
    // name position — the exact case highscore.js `slotName` hides from 3 letters on.
    g = await startGame({ localStorage: seed('123') });
    await installDrawRecorder(g.page);
    await toLevel(g.page, g.baseUrl, 24);
    await g.page.waitForTimeout(600);
    samples = await playSampling(g.page);
  });
  after(async () => { await g.stop(); });

  test('typing a card word (Eniac/IBM) never draws 3 or more of its letters in the slot', { timeout: T }, async () => {
    const cardSamples = samples.filter((s) => CARD_WORDS.includes(s.word));
    assert.ok(cardSamples.length > 0, `fixture: a card word was played (${samples.map((s) => s.word).join(' ')})`);
    for (const s of cardSamples) {
      if (s.typed.length < 3) continue;
      for (const d of s.drawn) {
        for (const w of CARD_WORDS) {
          assert.ok(!(d.length >= 3 && d.startsWith(w.slice(0, 3))),
            `after typing "${s.typed}" the board drew "${d}" — a card word presented as the player's name`);
        }
      }
    }
  });

  test('with no name typed the card does not claim YOU TYPED YOUR NAME', { timeout: T }, async () => {
    assert.ok(await isLevelCompleteVisible(g.page));
    const title = await g.page.evaluate(() => document.querySelector('.complete-title').textContent);
    assert.ok(!/YOU TYPED YOUR NAME/.test(title), `no name was typed, the card said: ${title}`);
  });
});
