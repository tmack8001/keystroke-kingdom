// The collection gallery's SHELVES — one per card bank.
//
// Enforces: INV-101 (proposed) — "every collectable card is displayable": no card
// exists in any bank that the gallery cannot show on some shelf. That is the general
// form of the defect this file was written for — the gallery rendered `allCards()`
// (the arcade bank only) while `Slots.collectCardId` happily stored wing and act card
// ids, so eight cards were collectable, counted by the slot picker's ★, and shown on
// no screen in the game, ever.
//
// Design sources: .claude/rules/product.md §History Cards (a browsable gallery with
// `???` silhouettes to tease replay); docs/specs/hardware-wing.md §5.4.4 and
// docs/specs/act-exclusive-cards.md §5.4 (scoped denominators, a shelf per bank, and
// "a shelf appears only once its cards are reachable"); INV-100 (never a blended
// numerator over a single-bank denominator).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import '../helpers/stubs.mjs';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const cards = await import('../../js/history-cards.js');
const { collectionShelves } = await import('../../js/ui/screens.js');

const ALL_BANK_CARDS = [...cards.HISTORY_CARDS, ...cards.WING_CARDS, ...cards.ACT_CARDS];
const everyId = ALL_BANK_CARDS.map(c => c.id);

// The most-progressed save the game can produce: finished the whole curriculum and
// holding every card there is.
const maxed = () => collectionShelves({ furthestLevel: 25, collectedIds: everyId });

describe('INV-101 — every collectable card is displayable somewhere in the gallery', () => {
  test('a completed save sees every id in some shelf', () => {
    const shown = new Set(maxed().flatMap(s => s.cards.map(c => c.id)));
    const missing = everyId.filter(id => !shown.has(id));
    assert.deepEqual(
      missing, [],
      'these ids can be COLLECTED but never BROWSED — add a shelf for their bank/wing/act'
    );
  });

  test('a card the player HOLDS is shown even if its shelf is not yet reachable', () => {
    // A player can hold a wing/act card and then... well, they cannot un-progress; but a
    // hand-edited or migrated save can. Hiding an earned card is the exact bug being fixed.
    for (const card of [...cards.WING_CARDS, ...cards.ACT_CARDS]) {
      const shelves = collectionShelves({ furthestLevel: 1, collectedIds: [card.id] });
      const shown = shelves.flatMap(s => s.cards.map(c => c.id));
      assert.ok(shown.includes(card.id), `held card ${card.id} was hidden from its owner`);
    }
  });

  test('no card appears on two shelves — one card, one home', () => {
    const shown = maxed().flatMap(s => s.cards.map(c => c.id));
    assert.equal(new Set(shown).size, shown.length, 'a card is double-shelved');
  });
});

describe('shelf counts are scoped to their own shelf — never a blended number (INV-100)', () => {
  test('THE CABINETS shelf agrees with bankProgress("arcade") exactly', () => {
    const held = [...cards.HISTORY_CARDS.slice(0, 5), ...cards.WING_CARDS, ...cards.ACT_CARDS]
      .map(c => c.id);
    const arcade = collectionShelves({ furthestLevel: 25, collectedIds: held })
      .find(s => s.id === 'arcade');
    const prog = cards.bankProgress('arcade', held);
    assert.deepEqual({ found: arcade.found, total: arcade.total }, prog,
      'the arcade shelf must read exactly what bankProgress says — no other bank may leak in');
    assert.equal(arcade.total, cards.HISTORY_CARDS.length);
    assert.equal(arcade.found, 5, 'wing/act ids must not inflate the arcade numerator');
  });

  test('every shelf`s found is counted over that shelf`s OWN cards only', () => {
    const held = everyId;
    for (const shelf of collectionShelves({ furthestLevel: 25, collectedIds: held })) {
      assert.equal(shelf.total, shelf.cards.length, `${shelf.id} total is not its own card count`);
      assert.equal(shelf.found, shelf.cards.length, `${shelf.id} found must reach its own total`);
    }
  });

  test('an id the game no longer knows never inflates any count', () => {
    for (const shelf of collectionShelves({ furthestLevel: 25, collectedIds: ['not-a-real-card'] })) {
      assert.equal(shelf.found, 0, `${shelf.id} counted a stale id`);
    }
  });
});

describe('a shelf is never shown for cards the player cannot reach', () => {
  test('a mid-curriculum save (level 10) sees ONLY the arcade shelf', () => {
    const shelves = collectionShelves({ furthestLevel: 10, collectedIds: [] });
    assert.deepEqual(shelves.map(s => s.id), ['arcade'],
      'below both gates (act layer L15, THE HARDWARE L20) nothing else may be advertised');
  });

  test('the act layer appears at its own declared gate, not before', () => {
    const below = collectionShelves({ furthestLevel: cards.ACT_CARD_UNLOCK_LEVEL - 1, collectedIds: [] });
    const at = collectionShelves({ furthestLevel: cards.ACT_CARD_UNLOCK_LEVEL, collectedIds: [] });
    assert.ok(!below.some(s => s.id.startsWith('act:')), 'an act shelf showed before the layer unlocked');
    if (cards.ACT_CARDS.length) {
      assert.ok(at.some(s => s.id.startsWith('act:')), 'the act layer did not open at its gate');
    }
  });

  test('THE HARDWARE shelf appears at level 20 and not at 19', () => {
    const at19 = collectionShelves({ furthestLevel: 19, collectedIds: [] });
    const at20 = collectionShelves({ furthestLevel: 20, collectedIds: [] });
    assert.ok(!at19.some(s => s.id === 'wing:hardware'));
    assert.ok(at20.some(s => s.id === 'wing:hardware'));
  });

  test('an act shelf needs its OWN first cabinet unlocked, not just the layer', () => {
    // Act 5 starts at level 21. At level 15 the layer is open but Act 5 is not.
    const at15 = collectionShelves({ furthestLevel: 15, collectedIds: [] });
    assert.ok(!at15.some(s => s.id === 'act:5'), 'act 5 advertised before its cabinets exist');
  });

  test('an act with no cards written yet gets no shelf at all', () => {
    const shelves = collectionShelves({ furthestLevel: 25, collectedIds: [] });
    for (let act = 1; act <= 5; act++) {
      const has = shelves.some(s => s.id === 'act:' + act);
      assert.equal(has, cards.cardsForAct(act).length > 0,
        `act ${act}: a shelf must exist exactly when that act has cards`);
    }
  });

  test('the WOPR select bypass opens every shelf, like every other gate in the game', () => {
    const shelves = collectionShelves({ furthestLevel: 1, collectedIds: [], bypass: true });
    assert.ok(shelves.some(s => s.id === 'wing:hardware'));
    if (cards.ACT_CARDS.length) assert.ok(shelves.some(s => s.id.startsWith('act:')));
  });
});

describe('garbage in never throws and never over-reports (security.md rule 4)', () => {
  for (const bad of [undefined, null, {}, { furthestLevel: NaN, collectedIds: 'nope' },
    { furthestLevel: '25', collectedIds: [null, 7, {}] }]) {
    test(`tolerates ${JSON.stringify(bad)}`, () => {
      const shelves = collectionShelves(bad);
      assert.ok(Array.isArray(shelves) && shelves.length >= 1, 'the arcade shelf always exists');
      for (const s of shelves) assert.ok(s.found >= 0 && s.found <= s.total);
    });
  }
});

// ── The two tables screens.js restates from cabinet-art.js (journal L41) ──────
// Neither BACK_WALL_DOORS nor ACTS is exported, so the gallery keeps its own copy
// of a wing's unlock level and the act names. That is allowed only if something
// fails loudly when they drift. This is that something.
describe('L41 — the gallery`s copies of cabinet-art facts stay in agreement', () => {
  const cabinetArt = readFileSync(join(REPO, 'js', 'ui', 'cabinet-art.js'), 'utf8');
  const screensSrc = readFileSync(join(REPO, 'js', 'ui', 'screens.js'), 'utf8');

  test('THE HARDWARE`s shelf unlock level matches its door in BACK_WALL_DOORS', () => {
    const door = /id:\s*'hardware'[\s\S]{0,1400}?unlockLevel:\s*(\d+)/.exec(cabinetArt);
    assert.ok(door, 'could not find the hardware door`s unlockLevel in cabinet-art.js');
    const shelf = /wing:\s*'hardware'[^}]*unlockLevel:\s*(\d+)/.exec(screensSrc);
    assert.ok(shelf, 'could not find the hardware shelf`s unlockLevel in screens.js');
    assert.equal(shelf[1], door[1],
      'the gallery would show (or hide) THE HARDWARE shelf at a different level than its door opens');
  });

  test('the shelf act names match ACTS', () => {
    const table = /const ACTS = \[([\s\S]*?)\n\];/.exec(cabinetArt);
    assert.ok(table, 'could not find ACTS in cabinet-art.js');
    const names = [...table[1].matchAll(/name:\s*'([^']+)'/g)].map(m => m[1]);
    assert.equal(names.length, 5);
    const shelfNames = /const ACT_NAMES = \[([^\]]*)\]/.exec(screensSrc);
    assert.ok(shelfNames, 'could not find ACT_NAMES in screens.js');
    const mine = [...shelfNames[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
    assert.deepEqual(mine, names, 'a shelf heading names an act differently than the select screen does');
  });
});
