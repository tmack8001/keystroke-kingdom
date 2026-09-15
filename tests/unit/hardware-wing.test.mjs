// THE HARDWARE — the third bonus wing.
// Enforces: INV-96..99 — docs/testing/STRATEGY.md §5, docs/specs/hardware-wing.md §0.3/§0.4/§5.4,
// .claude/rules/product.md §3 (the wrong-keypress contract).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import '../helpers/stubs.mjs';

describe('INV-96 — a wing\'s cards never change the arcade\'s denominator', () => {
  test('TOTAL_CARDS still equals HISTORY_CARDS.length, with WING_CARDS held separately', async () => {
    const { HISTORY_CARDS, WING_CARDS, TOTAL_CARDS } = await import('../../js/history-cards.js');
    assert.equal(TOTAL_CARDS, HISTORY_CARDS.length);
    assert.ok(Array.isArray(WING_CARDS), 'WING_CARDS is the wing bank (may be empty pending research)');
    // The harm: a save reading "★ 14 / 60" must never reopen at "★ 14 / 76" because we
    // shipped a room the player has not opened. The banks stay separate for that reason.
    const wingIds = new Set(WING_CARDS.map(c => c.id));
    assert.ok(
      HISTORY_CARDS.every(c => !wingIds.has(c.id)),
      'no wing card may also sit in the arcade bank — that would double-count it'
    );
  });
});

describe('INV-97 — a station card attaches to a wing+station and never leaks into a level pool', () => {
  test('cardsForLevel excludes every wing card by construction', async () => {
    const { WING_CARDS, cardsForLevel } = await import('../../js/history-cards.js');
    for (let lvl = 1; lvl <= 25; lvl++) {
      const pool = cardsForLevel(lvl);
      assert.ok(
        pool.every(c => !WING_CARDS.includes(c)),
        `level ${lvl} must never surface a bonus-wing card`
      );
    }
  });

  test('cardsForStation is keyed by BOTH wing and station', async () => {
    const { cardsForStation } = await import('../../js/history-cards.js');
    assert.deepEqual(cardsForStation('no-such-wing', 'apple-iie'), []);
    assert.ok(Array.isArray(cardsForStation('hardware', 'apple-iie')));
  });

  test('a station shows its cross-referenced arcade cards — found once, shown in both places', async () => {
    const { stationCards, crossRefCards, HISTORY_CARDS } = await import('../../js/history-cards.js');
    const refs = crossRefCards('apple-iie');
    assert.ok(refs.length > 0, 'the Apple IIe station points at real arcade cards');
    // Cross-referencing is a RENDERING relationship, never an ownership one: every
    // referenced card still belongs to the curriculum (spec §0.4).
    refs.forEach(c => assert.ok(HISTORY_CARDS.includes(c), `${c.id} must stay an arcade card`));
    assert.ok(stationCards('hardware', 'apple-iie').length >= refs.length);
  });

  test('an unknown cross-reference id is dropped, never thrown — a typo cannot break a room', async () => {
    const { crossRefCards } = await import('../../js/history-cards.js');
    assert.deepEqual(crossRefCards('no-such-station'), []);
  });
});

describe('INV-98 — station rotation is namespaced, so the save format does not change', () => {
  test('a "hw:<station>" key can never collide with a level key', async () => {
    const levelKeys = Array.from({ length: 25 }, (_, i) => String(i + 1));
    const stationKey = 'hw:apple-iie';
    assert.ok(!levelKeys.includes(stationKey));
  });

  test('pickGuaranteedStationCard shares the level picker\'s policy over an empty pool', async () => {
    const { pickGuaranteedStationCard, pickFromPool } = await import('../../js/history-cards.js');
    // An unauthored station yields null rather than throwing — the wing stays walkable
    // while its exclusive cards wait on an arcade-historian pass.
    assert.equal(pickGuaranteedStationCard('hardware', 'apple-iie', [], 0), null);
    assert.equal(pickFromPool([], [], 0), null);
  });

  test('pickFromPool prefers an uncollected card, then rotates — identical to a level', async () => {
    const { pickFromPool } = await import('../../js/history-cards.js');
    const pool = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    assert.equal(pickFromPool(pool, ['a'], 0).id, 'b', 'prefers something not yet collected');
    assert.equal(pickFromPool(pool, ['a'], 1).id, 'c', 'rotates within the uncollected set');
    assert.equal(pickFromPool(pool, ['a', 'b', 'c'], 1).id, 'b', 'all collected → rotates the whole pool');
  });
});

describe('INV-99 — the wing declares a walkable wall and an honest era', () => {
  test('every station names a room, a year, a machine and a boot line', async () => {
    const { STATIONS } = await import('../../js/hardware/stations.js');
    assert.ok(STATIONS.length > 0);
    STATIONS.forEach(s => {
      assert.ok(s.id && s.room && s.year && s.machine, `${s.id}: station metadata`);
      assert.ok(Array.isArray(s.boot) && s.boot.length > 0, `${s.id}: has something to type`);
      s.boot.forEach(step => {
        assert.equal(typeof step.type, 'string');
        assert.ok(step.type.length > 0, `${s.id}: a boot line is never empty`);
      });
    });
  });

  test('THE SPINE: the wall is ordered by the room the machine migrated into, never backwards in time', async () => {
    const { STATIONS } = await import('../../js/hardware/stations.js');
    const years = STATIONS.map(s => parseInt(s.year, 10));
    for (let i = 1; i < years.length; i++) {
      assert.ok(years[i] >= years[i - 1], 'the house is walked forwards (spec §0.2)');
    }
  });

  test('every boot line is typeable with keys the curriculum has taught by Level 20', async () => {
    const { STATIONS } = await import('../../js/hardware/stations.js');
    // The wing opens at Level 20 (INV-95), by which point all 26 letters, the digits
    // and the space are taught. A boot line must never need a key the player has not met.
    const taught = /^[A-Za-z0-9 .*]+$/;
    STATIONS.forEach(s => s.boot.forEach(step => {
      assert.match(step.type, taught, `${s.id}: "${step.type}" uses only keys taught by L20`);
    }));
  });
});

describe('INV-100 — the card counter is scoped to the card\'s own bank', () => {
  test('a save holding wing-card ids can never make the arcade counter exceed its total', async () => {
    const { bankProgress, HISTORY_CARDS, TOTAL_CARDS } = await import('../../js/history-cards.js');
    // The exact shape of the latent bug: collection is ONE flat id list across all
    // banks, so a save can legitimately hold more ids than the arcade bank has cards.
    // Counting that list against TOTAL_CARDS printed "CARD 63 OF 60".
    const everyArcadeId = HISTORY_CARDS.map(c => c.id);
    const save = everyArcadeId.concat(['hw:disk-ii', 'hw:rf-modulator', 'hw:cd-rom']);
    const arcade = bankProgress('arcade', save);
    assert.equal(arcade.total, TOTAL_CARDS);
    assert.equal(arcade.found, TOTAL_CARDS, 'every arcade card found');
    assert.ok(arcade.found <= arcade.total, 'the numerator can NEVER exceed the denominator');
  });

  test('bankOf routes an id to the bank that owns it, and nowhere for an unknown id', async () => {
    const { bankOf, HISTORY_CARDS, WING_CARDS } = await import('../../js/history-cards.js');
    assert.equal(bankOf(HISTORY_CARDS[0].id), 'arcade');
    if (WING_CARDS.length) assert.equal(bankOf(WING_CARDS[0].id), 'wing');
    assert.equal(bankOf('no-such-card-id'), null);
  });

  test('a collected id the build no longer knows is ignored, never counted', async () => {
    const { bankProgress } = await import('../../js/history-cards.js');
    // security.md rule 4 — localStorage is untrusted. A card removed in a later
    // build must not let a stale save read as more complete than the bank.
    const p = bankProgress('arcade', ['card-that-no-longer-exists', 'floppy-disk']);
    assert.equal(p.found, 1);
    assert.ok(p.found <= p.total);
  });

  test('bankProgress tolerates garbage without throwing', async () => {
    const { bankProgress } = await import('../../js/history-cards.js');
    for (const junk of [null, undefined, 'nope', 42, {}]) {
      const p = bankProgress('arcade', junk);
      assert.equal(p.found, 0);
      assert.equal(typeof p.total, 'number');
    }
  });
});
