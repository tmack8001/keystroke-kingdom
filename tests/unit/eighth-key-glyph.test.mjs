// Enforces: INV-140 (unit face) — CLAUDE.md §Levels footnote ("the WORD
// 'semicolon' is withheld… The `;` GLYPH itself is shown — on the prompt and the
// keyboard guide, like every other key"), .claude/rules/levels/act1.md Level 4
// ("the `;` GLYPH is shown on the prompt and keyboard guide like any other key;
// the prompt used to stand a `?` in for it. INV-29 checks the word, never the
// glyph"), easter-eggs.md (the Level 20 confession: "What is withheld is the
// WORD, never the glyph").
// Enforces: INV-29 (clarified 2026-10-30) — the WORD never appears in player text.
//
// Unit layer: hud.js exports `displayKey` (the keyboard guide's label function)
// and imports cleanly in Node (its DOM access is inside functions).

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { displayKey } from '../../js/ui/hud.js';
import { LEVELS } from '../../js/levels.js';

describe('INV-140 — the eighth key shows its own mark', () => {
  test('displayKey(";") is the semicolon glyph itself — never a stand-in', () => {
    assert.equal(displayKey(';'), ';');
    assert.notEqual(displayKey(';'), '?');
  });

  test('the other keys are untouched (letters upper-case, structural keys keep their glyphs)', () => {
    assert.equal(displayKey('a'), 'A');
    assert.equal(displayKey('j'), 'J');
    assert.equal(displayKey(' '), '␣');
    assert.equal(displayKey('Backspace'), '⌫');
    assert.equal(displayKey('Shift'), '⇧');
  });

  test('Level 4 is where the eighth key arrives, and the curriculum declares it by its glyph', () => {
    assert.ok(LEVELS[4].newKeys.includes(';'), 'Level 4 teaches the eighth key');
    assert.ok(LEVELS[4].keys.includes(';'));
    assert.ok(!LEVELS[4].keys.includes('?'), 'and the curriculum never uses a `?` for it');
  });

  test('the level hint text never names the key (the WORD stays withheld) — INV-29 still holds in the data', () => {
    for (const [n, lvl] of Object.entries(LEVELS)) {
      for (const field of ['hint', 'name', 'era']) {
        assert.ok(!/semicolon/i.test(String(lvl[field] || '')), `LEVELS[${n}].${field}`);
      }
    }
  });
});
