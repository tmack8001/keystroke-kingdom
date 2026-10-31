// Enforces: INV-140 (behavioural face), INV-29 (clarified) — CLAUDE.md §Levels
// footnote: "The eighth key… is a MYSTERY key the game teaches — the WORD
// 'semicolon' is withheld… The `;` GLYPH itself is shown — on the prompt and the
// keyboard guide, like every other key (clarified by Trevor, 2026-10-30; the prompt
// used to stand a `?` in for it). INV-29 checks the WORD, never the glyph."
// Also levels/act1.md Level 4, easter-eggs.md (the Level 20 confession withholds
// the NAME, never the mark), and the reason: a five-year-old looking down at her
// own keyboard hunted for a `?` that is not on the right-pinky key.
//
// Surfaces the child can see the mark on: the prompt, the in-game keyboard guide,
// the KNOW YOUR KEYS preview (canvas), and the one-time home-row finger diagram
// (canvas). Canvas text is read with the drawn-strings recorder (words on screen —
// never a pixel or a coordinate). The engine TOKEN stays `;` throughout: pressing
// the real `;` key must advance the prompt.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  startGame, toLevel, toSelect, readPrompt, readPromptGlyphs, readHUD, press, readScreen,
} from '../helpers/game-driver.mjs';
import { installDrawRecorder, captureDrawn, drawnIncludes } from '../helpers/draw-recorder.mjs';

const T = 180_000;
const exact = (drawn, s) => drawn.some((d) => d === s);

describe('INV-140 — Level 4: the prompt and the keyboard guide show `;`, the engine token is `;`', () => {
  let g;
  before(async () => {
    g = await startGame({ settings: { mistakeDisplay: 'prominent' } });
    await toLevel(g.page, g.baseUrl, 4);
  });
  after(async () => { await g.stop(); });

  async function untilPromptHas(glyph, cap = 80) {
    for (let i = 0; i < cap; i++) {
      let glyphs = await readPromptGlyphs(g.page);
      for (let w = 0; w < 30 && glyphs.length === 0; w++) { await g.page.waitForTimeout(60); glyphs = await readPromptGlyphs(g.page); }
      if (glyphs.includes(glyph)) return true;
      const p = await readPrompt(g.page);
      if (p.activeToken == null) { await g.page.waitForTimeout(100); continue; }
      await press(g.page, p.activeToken);
      await g.page.waitForTimeout(60);
    }
    return false;
  }

  test('a prompt containing the eighth key comes up, and it is drawn as `;` — never `?`', { timeout: T }, async () => {
    assert.equal(await untilPromptHas(';'), true, 'the eighth key appears in a Level 4 prompt');
    const glyphs = await readPromptGlyphs(g.page);
    assert.ok(glyphs.includes(';'));
    assert.ok(!glyphs.includes('?'), `no stand-in: ${JSON.stringify(glyphs)}`);
  });

  test('the on-screen keyboard guide labels the eighth key `;` and has no `?` key', { timeout: T }, async () => {
    const labels = await g.page.evaluate(() =>
      [...document.querySelectorAll('#keyboard-guide .key-box')].map((el) => el.textContent.trim()).filter(Boolean));
    assert.ok(labels.includes(';'), `guide labels: ${labels.join(' ')}`);
    assert.ok(!labels.includes('?'), 'a `?` key would send a child hunting for a key that is not there');
  });

  test('the prompt\'s quiet caption never names the key (the WORD stays withheld)', async () => {
    const caption = await g.page.evaluate(() => (document.getElementById('kk-prompt-caption') || {}).textContent || '');
    assert.ok(!/semicolon/i.test(caption), `caption "${caption}"`);
    const body = await g.page.evaluate(() => document.body.innerText || '');
    assert.ok(!/semicolon/i.test(body), 'the word appears nowhere on the page');
  });

  test('pressing the real `;` key advances the prompt: the engine token is still `;`', { timeout: T }, async () => {
    // get the eighth key to be the ACTIVE letter
    let p = await readPrompt(g.page);
    for (let i = 0; i < 80 && p.activeToken !== ';'; i++) {
      if (p.activeToken != null) await press(g.page, p.activeToken);
      await g.page.waitForTimeout(80);
      p = await readPrompt(g.page);
    }
    assert.equal(p.activeToken, ';', 'the eighth key became the active letter');
    const glyphs = await readPromptGlyphs(g.page);
    assert.equal(glyphs[p.activeIndex], ';', 'and it is displayed as `;`');
    const mistakes = (await readHUD(g.page)).mistakes;
    await g.page.keyboard.press(';');
    const completed = await g.page.evaluate(() => document.querySelectorAll('#prompt-sequence .prompt-letter.completed').length);
    assert.equal(completed, p.activeIndex + 1, 'the real `;` keystroke was accepted');
    await g.page.waitForTimeout(500);
    assert.equal((await readHUD(g.page)).mistakes, mistakes, 'and it cost nothing');
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });

  test('a `?` keystroke is NOT the eighth key (the sacred wrong-key contract is unchanged)', { timeout: T }, async () => {
    let p = await readPrompt(g.page);
    for (let i = 0; i < 80 && p.activeToken !== ';'; i++) {
      if (p.activeToken != null) await press(g.page, p.activeToken);
      await g.page.waitForTimeout(80);
      p = await readPrompt(g.page);
    }
    assert.equal(p.activeToken, ';');
    const before = (await readHUD(g.page)).mistakes;
    await g.page.keyboard.press('Shift+/');          // types "?"
    await g.page.waitForTimeout(400);
    const after = await readPrompt(g.page);
    assert.equal(after.activeToken, ';', 'the eighth key still waits');
    assert.ok((await readHUD(g.page)).mistakes >= before, 'at worst a quiet mistake — never an advance');
  });
});

describe('INV-140 — KNOW YOUR KEYS (canvas) shows `;` for the eighth key', () => {
  test('the Level 4 preview labels the key `;` and uses no `?` stand-in anywhere', { timeout: T }, async () => {
    const g = await startGame();
    try {
      await installDrawRecorder(g.page);
      await toSelect(g.page, g.baseUrl);
      for (let i = 0; i < 3; i++) { await g.page.keyboard.press('ArrowRight'); await g.page.waitForTimeout(150); } // cabinet 4
      await g.page.keyboard.press('Enter'); await g.page.waitForTimeout(500);       // -> READY
      assert.equal(await readScreen(g.page), 'ready-screen');
      await g.page.keyboard.press(' '); await g.page.waitForTimeout(300);           // -> KNOW YOUR KEYS
      assert.equal(await readScreen(g.page), 'keyboard-preview-screen');
      // let the preview animate, then read what it drew
      const drawn = await captureDrawn(g.page, 30);
      assert.ok(exact(drawn, ';'), `the preview labels the eighth key ";" — drew ${JSON.stringify([...new Set(drawn)].slice(0, 40))}`);
      assert.ok(!exact(drawn, '?'), 'no `?` key label');
      assert.ok(!drawn.some((s) => /\?/.test(s)), 'no drawn string on the preview contains a `?` stand-in');
      assert.ok(!drawnIncludes(drawn, 'SEMICOLON'), 'and never the word');
      assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
    } finally { await g.stop(); }
  });
});

describe('INV-140 — the one-time home-row finger diagram (Level 1) shows `;` on the right pinky', () => {
  test('the diagram\'s key labels include `;` and no `?`', { timeout: T }, async () => {
    const g = await startGame();
    try {
      await installDrawRecorder(g.page);
      await toLevel(g.page, g.baseUrl, 1);
      const everything = await g.page.evaluate(() => (window.__kkDraw || []).slice());
      for (const k of ['A', 'S', 'D', 'F', 'J', 'K', 'L']) assert.ok(exact(everything, k), `home-row key ${k} is drawn`);
      assert.ok(exact(everything, ';'), 'the eighth key is drawn as ";"');
      assert.ok(!exact(everything, '?'), 'and never as "?"');
    } finally { await g.stop(); }
  });
});
