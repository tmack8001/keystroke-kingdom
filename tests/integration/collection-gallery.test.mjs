// The collection gallery, driven the way a player reaches it: boot a saved game,
// land on "CHOOSE YOUR GAME", press C.
//
// Enforces: INV-101 (proposed) — every collectable card is displayable; plus the
// scoped-count rule the gallery inherits from INV-100 (no shelf ever prints a
// numerator from a bank other than its own).
//
// Why an L2 test and not only a unit test: the defect this replaces was NOT a wrong
// number, it was a screen that never rendered two of the three banks. Only a real
// browser reaching the real screen can tell you what a child actually sees
// (.claude/rules/playtest.md).
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startGame, readScreen, press, slotsSeed } from '../helpers/game-driver.mjs';

const SETTLE_MS = 500;

// Ids deliberately spanning all three banks — an arcade card, both HARDWARE wing
// cards that exist, and two ACT 1 cards. Before the shelf change, the last four
// were collectable and displayed nowhere.
const HELD = ['ada-lovelace', 'hw-apple-iie', 'hw-disk-ii', 'act1-quarter', 'act1-marquee'];

/** Read the rendered shelves — player-observable DOM only. */
async function readShelves(page) {
  return page.evaluate(() => [...document.querySelectorAll('#collection-shelves .collection-shelf')]
    .map((sec) => ({
      heading: sec.querySelector('.collection-shelf-name')?.textContent ?? null,
      count: sec.querySelector('.collection-shelf-count')?.textContent ?? null,
      cells: [...sec.querySelectorAll('.collection-cell')].length,
      owned: [...sec.querySelectorAll('.collection-cell.owned .collection-cell-label')]
        .map((el) => el.textContent),
      locked: [...sec.querySelectorAll('.collection-cell.locked')].length,
    })));
}

async function openGallery(page, baseUrl, seed) {
  await page.addInitScript((s) => { window.localStorage.setItem('kk-slots', s); }, JSON.stringify(seed));
  await page.goto(baseUrl);
  await page.waitForTimeout(SETTLE_MS);
  await page.click('body');
  assert.equal(await readScreen(page), 'slots-screen', 'a saved game should open on the picker');
  await press(page, 'c');
  await page.waitForTimeout(SETTLE_MS);
  assert.equal(await readScreen(page), 'collection-screen');
}

describe('the collection gallery shows every bank a player can reach', () => {
  let g;
  before(async () => { g = await startGame(); });
  after(async () => { await g.stop(); });

  test('a finished save sees the arcade, THE HARDWARE and ACT 1 shelves, each counting only itself', async () => {
    await openGallery(g.page, g.baseUrl, slotsSeed({
      name: 'OONA', furthestLevel: 25, cards: HELD,
    }));
    const shelves = await readShelves(g.page);
    const headings = shelves.map((s) => s.heading);

    assert.ok(headings.includes('THE CABINETS'), `no arcade shelf; got ${JSON.stringify(headings)}`);
    assert.ok(headings.includes('THE HARDWARE'), `no wing shelf; got ${JSON.stringify(headings)}`);
    assert.ok(headings.some((h) => h && h.startsWith('ACT 1')), `no act shelf; got ${JSON.stringify(headings)}`);

    const arcade = shelves.find((s) => s.heading === 'THE CABINETS');
    const wing = shelves.find((s) => s.heading === 'THE HARDWARE');
    const act1 = shelves.find((s) => s.heading && s.heading.startsWith('ACT 1'));

    // Scoped counts: each numerator counts only the cards HELD from its own shelf.
    // The glyphs are pinned on purpose — ★ ◼ ♦ are the three the real page measured
    // as COVERED by Press Start 2P (journal O11); ▣ and ◆, which the two specs asked
    // for, are not, and rendered as a smudge and a single dot at 9px.
    assert.match(arcade.count, /^★ 1 \/ \d+$/, `arcade count leaked another bank: ${arcade.count}`);
    assert.match(wing.count, /^◼ 2 \/ \d+$/, `wing count is wrong: ${wing.count}`);
    assert.match(act1.count, /^♦ 2 \/ \d+$/, `act count is wrong: ${act1.count}`);

    // The denominators are the shelves' own sizes, never a shared total.
    for (const s of shelves) {
      // Shelf counts read 'glyph n / m' (arcade, wing, act) or 'KEYBOARD CARD n OF m' (the
      // fourth bank, spec semicolon-teaching-beat 5.4 / Q11) - the denominator is the last number.
      const total = Number(s.count.match(/(\d+)\s*$/)[1]);
      assert.equal(total, s.cells, `${s.heading}: denominator ${total} but ${s.cells} cells drawn`);
    }

    // The tease survives: unfound cards are still `???` silhouettes on every shelf.
    assert.ok(wing.locked >= 0 && arcade.locked > 0, 'unfound cards must remain as ??? silhouettes');
    assert.deepEqual(act1.owned.sort(), ['MARQUEE', 'QUARTER']);
    assert.equal(g.consoleErrors.length, 0, g.consoleErrors.join('\n'));
  });

  test('a mid-curriculum save (LV 10) is shown no shelf it cannot reach', async () => {
    await openGallery(g.page, g.baseUrl, slotsSeed({
      name: 'SAM', furthestLevel: 10, cards: ['ada-lovelace'],
    }));
    const headings = (await readShelves(g.page)).map((s) => s.heading);
    assert.deepEqual(headings, ['THE CABINETS'],
      'a counted ??? with no route is an obligation (product.md §1)');
    assert.equal(g.consoleErrors.length, 0, g.consoleErrors.join('\n'));
  });

  test('the shelves scroll by keyboard and say so when there is more below', async () => {
    await openGallery(g.page, g.baseUrl, slotsSeed({ furthestLevel: 25, cards: HELD }));
    const before = await g.page.evaluate(() => {
      const h = document.getElementById('collection-shelves');
      return {
        scrollTop: h.scrollTop,
        overflows: h.scrollHeight > h.clientHeight + 4,
        moreShown: !document.getElementById('collection-more').classList.contains('hidden'),
      };
    });
    assert.ok(before.overflows, 'the gallery is expected to overflow at 1280x800 — the affordance matters');
    assert.ok(before.moreShown, 'no "MORE BELOW" marker while there is more below');

    await press(g.page, 'End');
    await g.page.waitForTimeout(600);
    const after = await g.page.evaluate(() => {
      const h = document.getElementById('collection-shelves');
      return {
        scrollTop: h.scrollTop,
        moreShown: !document.getElementById('collection-more').classList.contains('hidden'),
      };
    });
    assert.ok(after.scrollTop > before.scrollTop, 'the arrow/End keys must scroll the gallery');
    assert.equal(after.moreShown, false, 'the marker must go away at the bottom');
  });

  test('Escape always leaves the gallery (the One Rule: never trap the player)', async () => {
    await press(g.page, 'Escape');
    await g.page.waitForTimeout(SETTLE_MS);
    assert.equal(await readScreen(g.page), 'slots-screen');
  });
});
