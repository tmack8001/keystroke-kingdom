// Enforces: INV-143 — a typo in a riddle never counts as correct.
// Sources: js/textworld/riddles.js `isNearMiss` header (2026-10-30 explorer
// playtest): "NEVER accepted as right — `answerMatches` stays exact, so no wrong
// word can ever solve a riddle. It only changes what the game SAYS"; the One
// Rule (product.md §3 — being told you are wrong when you were right is the
// flow-stopping punishment the game forbids) balanced against the riddles being
// BONUS content whose correctness is real; act5.md Level 25 "Backspace isn't
// failure… it's making it right".
//
// Unit layer: riddles.js is a pure module. Fixtures are the game's OWN authored
// riddles (Green Dragon + both tile worlds), never invented answers, so a
// content edit moves the expectations with it.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { answerMatches, isNearMiss, buildPool } from '../../js/textworld/riddles.js';
import { GreenDragon } from '../../js/textworld/greendragon.js';
import { GlimmerDeep, Whisperwood } from '../../js/textworld/tile-worlds.js';

// Every authored riddle in the wing, as the pooled shape both engines consume.
function allRiddles() {
  const out = [];
  for (const room of Object.values(GreenDragon.rooms)) {
    for (const cmd of room.commands) if (cmd.ask) for (const r of buildPool(cmd.ask)) out.push(r);
  }
  for (const w of [GlimmerDeep, Whisperwood]) {
    for (const npc of w.npcs || []) for (const r of buildPool(npc)) out.push(r);
  }
  return out;
}

// All one-letter edits of a word (substitute, drop, add) over a-z.
function oneEditNeighbours(word) {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const out = new Set();
  for (let i = 0; i < word.length; i++) {
    out.add(word.slice(0, i) + word.slice(i + 1));                       // drop
    for (const c of letters) {
      out.add(word.slice(0, i) + c + word.slice(i + 1));                 // substitute
      out.add(word.slice(0, i) + c + word.slice(i));                     // add before
    }
  }
  for (const c of letters) out.add(word + c);                            // add after
  out.delete(word);
  return [...out];
}

describe('INV-143 — a typo is never accepted as correct', () => {
  const riddles = allRiddles();

  test('the fixture is real: the wing authors a healthy number of riddles with answers', () => {
    assert.ok(riddles.length >= 20, `found ${riddles.length} riddles`);
    for (const r of riddles) assert.ok(r.answers.length > 0, 'every riddle has an accepted answer');
  });

  test('every authored answer is accepted exactly (case and padding aside)', () => {
    for (const r of riddles) {
      for (const a of r.answers) {
        assert.equal(answerMatches(r, a), true, `"${a}" solves its own riddle`);
        assert.equal(answerMatches(r, `  ${a.toUpperCase()} `), true, 'case/padding are forgiven');
      }
    }
  });

  test('a one-letter typo of an answer is NEVER a match — exhaustively, for every answer of every riddle', () => {
    let probed = 0;
    for (const r of riddles) {
      for (const a of r.answers) {
        for (const typo of oneEditNeighbours(a.toLowerCase())) {
          if (r.answers.map((x) => x.toLowerCase()).includes(typo)) continue; // another accepted word
          assert.equal(answerMatches(r, typo), false, `"${typo}" (a typo of "${a}") must not solve the riddle`);
          probed++;
        }
      }
    }
    assert.ok(probed > 1000, 'the exhaustive probe actually ran');
  });

  test('a near miss is never reported for a word that actually solves the riddle', () => {
    for (const r of riddles) for (const a of r.answers) {
      assert.equal(isNearMiss(r, a), false, `"${a}" is correct, not a near miss`);
    }
  });
});

describe('INV-143 — the game recognises a typo so it can say "so close" instead of "wrong"', () => {
  const riddles = allRiddles();

  test('a one-letter slip on an answer of 3+ letters is a near miss (the case that wiped a child\'s right answer)', () => {
    let checked = 0;
    for (const r of riddles) {
      for (const a of r.answers) {
        const ans = a.toLowerCase();
        if (ans.length < 3) continue;
        // one dropped letter, one wrong letter, one extra letter — each a real typo
        const typos = [ans.slice(1), ans[0] + (ans[1] === 'x' ? 'y' : 'x') + ans.slice(2), ans + 'q'];
        for (const t of typos) {
          if (r.answers.map((x) => x.toLowerCase()).includes(t)) continue;
          // a typo might coincidentally sit one edit from ANOTHER accepted answer — still a near miss then
          assert.equal(isNearMiss(r, t), true, `"${t}" is one edit from "${ans}"`);
          checked++;
        }
      }
    }
    assert.ok(checked > 40);
  });

  test('the playtest\'s own case: `oxne` for `one`', () => {
    const r = { riddle: 'x', answers: ['one'], hint: '', reward: '' };
    assert.equal(isNearMiss(r, 'oxne'), true);
    assert.equal(answerMatches(r, 'oxne'), false, 'but it is not accepted');
  });

  test('a genuinely different word is a plain wrong answer, not a near miss', () => {
    const r = { riddle: 'x', answers: ['egg', 'eggs'], hint: '', reward: '' };
    for (const w of ['table', 'moon', 'zebra', 'hello']) {
      assert.equal(isNearMiss(r, w), false, w);
      assert.equal(answerMatches(r, w), false, w);
    }
  });

  test('two letters off is not a near miss', () => {
    const r = { riddle: 'x', answers: ['wind'], hint: '', reward: '' };
    assert.equal(isNearMiss(r, 'wnxd'), false);
  });

  test('a short answer never reports a near miss (it would quietly say "the answer is one letter")', () => {
    const r = { riddle: 'x', answers: ['m'], hint: '', reward: '' };
    for (const guess of ['a', 'q', 'mm', 'am', 'mx', '']) {
      assert.equal(isNearMiss(r, guess), false, `"${guess}"`);
    }
    const two = { riddle: 'x', answers: ['hi'], hint: '', reward: '' };
    assert.equal(isNearMiss(two, 'ho'), false, 'answers under 3 letters never leak');
  });

  test('empty, one-letter and non-string guesses are safe and never a near miss', () => {
    const r = { riddle: 'x', answers: ['book'], hint: '', reward: '' };
    for (const g of ['', ' ', 'b', null, undefined]) {
      assert.doesNotThrow(() => isNearMiss(r, g));
      assert.equal(isNearMiss(r, g), false);
      assert.equal(answerMatches(r, g), false);
    }
  });

  test('a malformed riddle object is tolerated', () => {
    for (const bad of [null, undefined, {}, { answers: 'book' }]) {
      assert.doesNotThrow(() => isNearMiss(bad, 'boook'));
      assert.equal(isNearMiss(bad, 'boook'), false);
      assert.equal(answerMatches(bad, 'book'), false);
    }
  });
});
