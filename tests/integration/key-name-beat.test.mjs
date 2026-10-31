// Enforces: INV-155, INV-156, INV-157, INV-160, INV-161, INV-164 — docs/specs/semicolon-teaching-beat.md
// §5.2/§5.3/§10 (the keyboard card's header reads FOUND ON THE KEYBOARD per the lane brief of 2026-10-31;
// arcade cards keep FOUND ON THE ARCADE FLOOR); product.md §"The Key Names" (Trevor 2026-10-31: the name is taught at Level 13, the
// programming meaning waits for the Level 20 terminal); CLAUDE.md §Wrong Keypress; levels/act3.md L13.
//
// The player's route: boot a seeded save, play Level 13 with real key events, look only at the
// rendered prompt, caption, guide, HUD, LEVEL COMPLETE card and the persisted save.
//
// NOT asserted here, by design (testing.md rule 4 — no pixels/geometry): the caption's placement in
// the gap band / non-overlap with the prompt panel and keyboard guide (INV-160 clause 2), the glow's
// tint, and how the flourish looks. Those are PERSONA-PLAY ONLY: `node scripts/playtest.mjs --at=level:13
// --persona=family-parent` (and a fresh-machine run), looked at with eyes.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readPrompt, press, readHUD, isLevelCompleteVisible } from '../helpers/game-driver.mjs';
import {
  BEAT, BEAT_ID, BEAT_WORD, derivedSpliceIndex, startAt, walk, waitComplete, bodyText, slotNow,
  captionLines, guideKeyClasses,
} from '../helpers/key-beat.mjs';

const T = 300_000;
const CODE_MEANING = /CODER|PROGRAMM|INSTRUCTION/i;

// The worst case for INV-161: a save that has ALREADY cleared the Level 20 terminal (WOPR order),
// so any leakage of the code meaning "because they are past it" would show here.
const CLEARED_L20 = { '20': true };

describe('INV-155/157/160/161/164 — the Level 13 beat, played start to finish (save already past Level 20)', () => {
  test('the word is served at the derived index, is a guaranteed once-only gate, credited at once, with a two-line non-modal caption and no code meaning', { timeout: T }, async () => {
    const g = await startAt(13, { furthestLevel: 25, completed: CLEARED_L20, cardRotation: {}, settings: { mistakeDisplay: 'prominent' } });
    try {
      const idx = derivedSpliceIndex();
      let beatSeen = 0; let sampledWrong = false; let wrongOk = null;
      let preBeatCollected = null; let bodyHits = [];
      let postBeat = null; let capturedGlowBefore = null;
      const scan = async (where) => {
        const t = await bodyText(g.page);
        if (CODE_MEANING.test(t) || t.includes(BEAT.code) || t.includes(BEAT.codeFact)) bodyHits.push(where);
      };
      capturedGlowBefore = await guideKeyClasses(g.page, ';');

      const run = await walk(g.page, {
        before: async ({ word, index, token, patternNo }) => {
          if (word === BEAT_WORD && index === 0) {
            beatSeen++;
            assert.equal(patternNo, idx, `the beat is the pattern at the derived index (${idx})`);
            preBeatCollected = (await slotNow(g.page)).cards.includes(BEAT_ID);
          }
          // INV-157: a wrong key mid-word leaves the prompt put; the right key advances one letter.
          if (word === BEAT_WORD && index === 3 && !sampledWrong) {
            sampledWrong = true;
            const hudBefore = await readHUD(g.page);
            const wrong = token === 'q' ? 'z' : 'q';
            await press(g.page, wrong);
            await g.page.waitForTimeout(150);
            const after = await readPrompt(g.page);
            const hudAfter = await readHUD(g.page);
            wrongOk = after.activeIndex === 3 && after.tokens.join('') === BEAT_WORD
              && (hudBefore.mistakes === null || hudAfter.mistakes === hudBefore.mistakes + 1);
          }
          if (index === 0) await scan(`pattern ${patternNo} ${word}`);
        },
        after: async ({ word }) => {
          if (word !== BEAT_WORD || postBeat) return;
          // Credited the moment the last letter lands — LEVEL COMPLETE is nowhere near.
          await g.page.waitForTimeout(250);
          const lines1 = await captionLines(g.page);
          await g.page.waitForTimeout(1900);
          const lines2 = await captionLines(g.page);
          postBeat = {
            collected: (await slotNow(g.page)).cards.includes(BEAT_ID),
            levelDone: await isLevelCompleteVisible(g.page),
            lines1, lines2,
            glowClasses: await guideKeyClasses(g.page, ';'),
          };
          await scan('right after the beat');
        },
      });

      assert.equal(beatSeen, 1, 'INV-164: exactly one beat per play');
      assert.equal(run.words.filter((w) => w === BEAT_WORD).length, 1, 'the word is served once in the whole play');
      assert.equal(run.won, true, 'the level is winnable with the beat armed');
      assert.equal(preBeatCollected, false, 'not credited before it is typed');

      assert.equal(wrongOk, true, 'INV-157: wrong key -> the letter waits (and the mistake is logged quietly)');

      assert.ok(postBeat, 'the beat completed');
      assert.equal(postBeat.collected, true, 'INV-155: collected the moment the word completes');
      assert.equal(postBeat.levelDone, false, 'INV-155: credited BEFORE level complete');
      assert.ok(postBeat.lines1.length >= 1 && postBeat.lines1[0] === BEAT.literacy[0], `line 1 first: ${JSON.stringify(postBeat.lines1)}`);
      assert.deepEqual(postBeat.lines2, BEAT.literacy, 'INV-160: exactly the record`s two literacy lines, line 2 after line 1');
      // The guide key glows: it gains a class it did not have, and that class says so.
      const gained = (postBeat.glowClasses || []).filter((c) => !(capturedGlowBefore || []).includes(c));
      assert.ok(gained.some((c) => /glow/i.test(c)), `the ; key gains a glow class: before ${JSON.stringify(capturedGlowBefore)} after ${JSON.stringify(postBeat.glowClasses)}`);

      assert.deepEqual(bodyHits, [], 'INV-161: no code meaning on any sampled frame of Level 13');

      // LEVEL COMPLETE: caption gone, the card is the keyboard card with the literacy fact only.
      assert.deepEqual(await captionLines(g.page), [], 'the caption is gone by LEVEL COMPLETE');
      await g.page.waitForTimeout(300);
      const card = await g.page.evaluate(() => ({
        header: document.querySelector('.history-card-header').textContent,
        word: document.getElementById('history-card-word').textContent,
        title: document.getElementById('history-card-title').textContent,
        year: document.getElementById('history-card-year').textContent,
        fact: document.getElementById('history-card-fact').textContent,
        count: document.getElementById('history-card-count').textContent,
        overlay: document.getElementById('complete-overlay').innerText,
      }));
      assert.equal(card.header, 'FOUND ON THE KEYBOARD', 'a keyboard card was not found on the arcade floor');
      assert.equal(card.word, BEAT_WORD.toUpperCase());
      assert.equal(card.fact, BEAT.literacyFact, 'INV-161: the card body is the literacy lesson');
      assert.equal(card.title, BEAT.title);
      assert.match(card.count, /^KEYBOARD CARD 1 OF 1$/, 'scoped to its own bank');
      assert.ok(!CODE_MEANING.test(card.overlay) && !card.overlay.includes(BEAT.code), 'INV-161: LEVEL COMPLETE has no code meaning');
      // It is the keyboard card, not an arcade card too: still exactly one card on this play.
      const slot = await slotNow(g.page);
      assert.equal(slot.cards.filter((id) => id === BEAT_ID).length, 1);
      // INV-156: the beat play did not advance the level's arcade card rotation.
      assert.ok(!slot.cardRotation || !slot.cardRotation['13'], `rotation untouched by the beat play: ${JSON.stringify(slot.cardRotation)}`);
      assert.deepEqual(g.consoleErrors, []);
    } finally { await g.stop(); }
  });

  test('the caption outlives fast play (>= 10 s AND >= 3 patterns) and then retires with its glow; the next pattern takes keys at once', { timeout: T }, async () => {
    const g = await startAt(13, { furthestLevel: 13 });
    try {
      let beatAt = null; let pending = null; let firstPressAdvanced = null; let afterThree = null;
      await walk(g.page, {
        before: async ({ word, index }) => {
          // The pattern right after the beat: its first key must advance the prompt at once.
          if (pending) { firstPressAdvanced = index === 1 || word !== pending; pending = null; }
          else if (beatAt && firstPressAdvanced === null && index === 0) pending = word;
        },
        after: async ({ word, patternNo }) => {
          if (!beatAt) { if (word === BEAT_WORD) beatAt = { t: Date.now(), n: patternNo }; return; }
          if (patternNo === beatAt.n + 3) {
            afterThree = { lines: await captionLines(g.page), glow: await guideKeyClasses(g.page, ';'), ms: Date.now() - beatAt.t };
            return 'stop';
          }
        },
      });
      assert.equal(firstPressAdvanced, true, 'the next pattern accepted a correct key immediately');
      assert.ok(afterThree, 'reached three further patterns');
      assert.ok(afterThree.ms < 9000, `machine-speed play clears three patterns inside the 10 s window (took ${afterThree.ms} ms)`);
      assert.deepEqual(afterThree.lines, BEAT.literacy, 'three patterns alone do not retire it before ~10 s');
      assert.ok((afterThree.glow || []).some((c) => /glow/i.test(c)), 'the key still glows with the caption');
      await g.page.waitForTimeout(Math.max(0, 10_800 - afterThree.ms));
      assert.deepEqual(await captionLines(g.page), [], 'retired once BOTH >= 10 s and >= 3 patterns have passed');
      const after = await guideKeyClasses(g.page, ';');
      assert.ok(!(after || []).some((c) => /glow/i.test(c)), 'the glow retires with the caption');
    } finally { await g.stop(); }
  });

  test('Escape (pause) takes the caption away at once and the card is already kept; quitting from there keeps it', { timeout: T }, async () => {
    const g = await startAt(13, { furthestLevel: 13 });
    try {
      await walk(g.page, { after: async ({ word }) => (word === BEAT_WORD ? 'stop' : undefined) });
      await g.page.waitForTimeout(500);
      assert.ok((await captionLines(g.page)).length >= 1, 'caption is up');
      await g.page.keyboard.press('Escape');
      await g.page.waitForTimeout(300);
      assert.deepEqual(await captionLines(g.page), [], 'the caption never sits on the pause menu');
      assert.ok((await slotNow(g.page)).cards.includes(BEAT_ID), 'Escape straight after the word keeps the card');
      await g.page.keyboard.press('q');
      await g.page.waitForTimeout(500);
      assert.ok((await slotNow(g.page)).cards.includes(BEAT_ID), 'leaving the level keeps the card');
    } finally { await g.stop(); }
  });
});

describe('INV-155/156 — quitting before the word keeps nothing, and a finished save is not taught twice', () => {
  test('leaving before the beat does not collect the card (it comes back next time)', { timeout: T }, async () => {
    const g = await startAt(13, { furthestLevel: 13 });
    try {
      const idx = derivedSpliceIndex();
      await walk(g.page, { after: async ({ patternNo }) => (patternNo >= idx - 1 ? 'stop' : undefined) });
      await g.page.keyboard.press('Escape');
      await g.page.waitForTimeout(300);
      await g.page.keyboard.press('q');
      await g.page.waitForTimeout(500);
      assert.ok(!(await slotNow(g.page)).cards.includes(BEAT_ID), 'quit before the word -> not collected');
    } finally { await g.stop(); }
  });

  test('replay with the card held: no beat, an arcade card instead, and the arcade rotation advances as usual', { timeout: T }, async () => {
    const g = await startAt(13, { furthestLevel: 13, cards: [BEAT_ID] });
    try {
      const run = await walk(g.page, {});
      assert.equal(run.won, true);
      assert.ok(!run.words.includes(BEAT_WORD), `no beat on replay; patterns: ${run.words.join(' ')}`);
      await g.page.waitForTimeout(400);
      const card = await g.page.evaluate(() => ({
        header: document.querySelector('.history-card-header').textContent,
        word: document.getElementById('history-card-word').textContent,
        count: document.getElementById('history-card-count').textContent,
        shown: !document.getElementById('history-card').classList.contains('hidden'),
      }));
      assert.equal(card.shown, true, 'an arcade card is still guaranteed on a replay');
      assert.notEqual(card.word, BEAT_WORD.toUpperCase());
      assert.equal(card.header, 'FOUND ON THE ARCADE FLOOR', 'an arcade card keeps the arcade-floor header');
      assert.match(card.count, /^CARD \d+ OF \d+$/, 'the arcade count line, not the keyboard one');
      assert.equal((await slotNow(g.page)).cardRotation['13'] >= 1, true, 'the arcade rotation moved on this ordinary play');
    } finally { await g.stop(); }
  });
});

describe('INV-164 — a Name Moment at Level 13 is never adjacent to the beat', () => {
  test('name "chloe": both guaranteed words are served, with a pattern between them', { timeout: T }, async () => {
    const g = await startAt(13, { furthestLevel: 13, name: 'chloe', settings: { playerName: 'chloe' } });
    try {
      const run = await walk(g.page, {});
      assert.equal(run.won, true);
      const b = run.words.indexOf(BEAT_WORD);
      const n = run.words.indexOf('chloe');
      assert.ok(b >= 0, `beat served: ${run.words.join(' ')}`);
      assert.ok(n >= 0, `Name Moment served: ${run.words.join(' ')}`);
      assert.ok(Math.abs(b - n) >= 2, `never adjacent; beat at ${b}, name at ${n}: ${run.words.join(' ')}`);
    } finally { await g.stop(); }
  });
});
