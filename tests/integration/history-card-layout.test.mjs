// Enforces: INV-141 — product.md §History Cards ("a little business card is
// 'picked up off the arcade floor' with the story" — a card a child cannot read is
// not a card), css/screens.css `.history-card-*` (2026-10-30 note: "Verified by
// rendering all 84 cards (arcade + wing + act) into this element and checking
// per-line boxes: 10 collided before, 0 after"), and playtest.md ("the frame was
// legible to a machine and confusing to a person").
//
// WHAT IS ASSERTED, in the doc's terms: for EVERY card in all three banks
// (HISTORY_CARDS ∪ WING_CARDS ∪ ACT_CARDS), once the card has settled, the title
// and year lines never overlap the big word header — measured as the vertical
// bounding boxes of the card's rendered text lines, which is layout the player
// sees, not canvas art. Why every card and not a sample: collisions came from
// particular titles/years that wrap to a second line, so only the whole bank can
// prove it.
//
// HOW: the real page, the real stylesheet, the real card element. The overlay is
// shown directly and each card's own data is poured into the card's own text
// elements — the same fields `showLevelComplete` fills — because reaching 84 cards
// through play would take hours. The real route is covered separately below: a won
// Level 1 shows the card and the next-level cue, and that one is driven by keys.
// Animations are awaited to FINISH (journal F28 — never photograph a card mid-drop).

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startGame, toLevel, winLevel, isLevelCompleteVisible } from '../helpers/game-driver.mjs';
import { HISTORY_CARDS, WING_CARDS, ACT_CARDS } from '../../js/history-cards.js';

const T = 300_000;
const INK_CLEARANCE_PX = 2;   // lines whose ink touches (gap 0) already read as colliding

describe('INV-141 — every history card is legible: title and year never overlap the word header', () => {
  let g;
  before(async () => {
    g = await startGame();
    await g.page.goto(g.baseUrl);
    await g.page.evaluate(() => document.fonts.ready);
    await g.page.waitForTimeout(500);
  });
  after(async () => { await g.stop(); });

  test('the fixture covers all three banks', () => {
    assert.ok(HISTORY_CARDS.length > 50 && WING_CARDS.length >= 1 && ACT_CARDS.length >= 1);
  });

  test('for every card in every bank, no two text lines of the card touch or overlap vertically (word header vs title+year in particular)', { timeout: T }, async () => {
    const cards = [
      ...HISTORY_CARDS.map((c) => ({ ...c, bank: 'arcade' })),
      ...WING_CARDS.map((c) => ({ ...c, bank: 'wing' })),
      ...ACT_CARDS.map((c) => ({ ...c, bank: 'act' })),
    ];
    const results = await g.page.evaluate(async ({ cards, INK_CLEARANCE_PX }) => {
      const $ = (id) => document.getElementById(id);
      document.querySelectorAll('.screen').forEach((s) => s.classList.add('hidden'));
      $('complete-overlay').classList.remove('hidden');
      const out = [];
      for (const c of cards) {
        $('history-card-word').textContent = String(c.word).toUpperCase();
        $('history-card-title').textContent = c.title;
        $('history-card-year').textContent = c.year;
        $('history-card-fact').textContent = c.fact;
        $('history-card-count').textContent = 'CARD 76 OF 76';
        $('history-card-new').classList.remove('hidden');
        const card = $('history-card');
        card.classList.add('hidden'); void card.offsetWidth; card.classList.remove('hidden');
        // wait for the drop-in (finite animations) to FINISH
        await Promise.all(document.getAnimations().filter((a) => {
          const t = a.effect && a.effect.getTiming && a.effect.getTiming();
          return t && Number.isFinite(t.iterations) && t.iterations !== Infinity;
        }).map((a) => a.finished.catch(() => {})));
        // measure un-rotated: the card's tilt skews every client rect
        card.style.transform = 'none';
        const blocks = ['.history-card-header', '.history-card-word', '.history-card-meta', '.history-card-fact', '.history-card-count'];
        const lines = [];
        for (const sel of blocks) {
          const el = card.querySelector(sel);
          if (!el) continue;
          const rects = [];
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          for (let n; (n = walker.nextNode());) {
            const r = document.createRange(); r.selectNodeContents(n);
            for (const q of r.getClientRects()) if (q.width > 0) rects.push(q);
          }
          rects.sort((a, b) => a.top - b.top);
          const merged = [];
          for (const q of rects) {
            const last = merged[merged.length - 1];
            if (last && Math.abs(last.top - q.top) < 3) last.bottom = Math.max(last.bottom, q.bottom);
            else merged.push({ top: q.top, bottom: q.bottom });
          }
          const fs = parseFloat(getComputedStyle(el).fontSize);
          for (const m of merged) {
            // Press Start 2P's ink fills about the whole em: take an em-high box centred on the line.
            const mid = (m.top + m.bottom) / 2;
            lines.push({ sel, top: mid - fs / 2, bottom: mid + fs / 2 });
          }
        }
        // Press Start 2P's glyphs fill their whole em box, so two lines whose em boxes TOUCH
        // (gap 0) already have their pixel rows running into each other — that is what a
        // child sees as "the title is on top of the word". Require a hair of clear air
        // (INK_CLEARANCE_PX); the shipped fix leaves >= ~4px everywhere, the bug left 0.
        const overlaps = [];
        for (let i = 0; i + 1 < lines.length; i++) {
          const gap = lines[i + 1].top - lines[i].bottom;
          if (gap < INK_CLEARANCE_PX) overlaps.push(`${lines[i].sel} -> ${lines[i + 1].sel} gap ${gap.toFixed(1)}px`);
        }
        const word = lines.filter((l) => l.sel === '.history-card-word');
        const meta = lines.filter((l) => l.sel === '.history-card-meta');
        const wordBottom = word.length ? Math.max(...word.map((l) => l.bottom)) : -Infinity;
        const metaTop = meta.length ? Math.min(...meta.map((l) => l.top)) : Infinity;
        out.push({
          id: c.id, bank: c.bank, overlaps,
          metaClearsWord: metaTop - wordBottom >= INK_CLEARANCE_PX,
          lineCount: lines.length,
        });
        card.style.transform = '';
      }
      return out;
    }, { cards, INK_CLEARANCE_PX });

    assert.equal(results.length, cards.length);
    const bad = results.filter((r) => r.overlaps.length || !r.metaClearsWord);
    assert.deepEqual(
      bad.map((r) => `${r.bank}:${r.id} ${r.overlaps.join('; ') || 'title/year starts above the word header\'s bottom'}`),
      [],
      `${bad.length}/${results.length} cards have colliding text lines`,
    );
    for (const r of results) assert.ok(r.lineCount >= 4, `${r.id}: the card actually rendered its lines`);
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });
});

describe('INV-141 — the way forward is visible from the moment the card appears (real win, Level 1)', () => {
  test('the next-level cue is lit on first sight and is present for most of every blink cycle', { timeout: T }, async () => {
    const g = await startGame();
    try {
      await toLevel(g.page, g.baseUrl, 1);
      await winLevel(g.page);
      assert.equal(await isLevelCompleteVisible(g.page), true);

      // First sight: the cue is not hidden, has words, and is not caught in a dark phase.
      const first = await g.page.evaluate(() => {
        const el = document.getElementById('complete-prompt');
        const cs = getComputedStyle(el);
        return { text: el.textContent.trim(), opacity: parseFloat(cs.opacity), display: cs.display, visibility: cs.visibility, hidden: el.classList.contains('hidden') };
      });
      assert.ok(first.text.length > 0, 'the cue says something');
      assert.ok(!first.hidden && first.display !== 'none' && first.visibility !== 'hidden');
      assert.ok(first.opacity > 0.5, `the cue is lit when the card appears (opacity ${first.opacity})`);

      // Over a few blink cycles it is lit most of the time (an arcade blink, never "mostly absent").
      const samples = await g.page.evaluate(() => new Promise((resolve) => {
        const el = document.getElementById('complete-prompt');
        const seen = [];
        const t = setInterval(() => seen.push(parseFloat(getComputedStyle(el).opacity)), 50);
        setTimeout(() => { clearInterval(t); resolve(seen); }, 4800);
      }));
      const lit = samples.filter((o) => o > 0.5).length / samples.length;
      assert.ok(lit >= 0.6, `the next-level cue was visible ${(lit * 100).toFixed(0)}% of the time; a 50/50 blink let a first glance see only the dim replay line`);
      assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
    } finally { await g.stop(); }
  });
});
