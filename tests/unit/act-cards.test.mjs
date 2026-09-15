// THE ACT CARDS — the third bank, unlocked by the keyboard itself.
// Enforces: INV-120..127 — docs/specs/act-exclusive-cards.md,
// .claude/rules/product.md (the One Rule), docs/testing/STRATEGY.md §5.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import '../helpers/stubs.mjs';

describe('the gate is Level 15, and the key set is DERIVED, never assumed', () => {
  test('Level 15 closure really is 26 letters + ; , . / — read from js/levels.js', async () => {
    const { LEVELS } = await import('../../js/levels.js');
    const { ACT_CARD_UNLOCK_LEVEL } = await import('../../js/history-cards.js');
    const acc = new Set();
    for (let n = 1; n <= ACT_CARD_UNLOCK_LEVEL; n++) {
      const lv = Array.isArray(LEVELS) ? LEVELS[n - 1] : LEVELS[n];
      (lv && lv.keys || []).forEach(k => acc.add(k));
    }
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    assert.ok(letters.every(l => acc.has(l)), 'all 26 letters are taught by the gate level');
    // If the curriculum ever moves a key, this fails LOUDLY here rather than
    // silently letting an act card ask for a key the player does not have.
    const extras = [...acc].filter(k => !letters.includes(k)).sort();
    assert.deepEqual(extras, [',', '.', '/', ';']);
    assert.equal(acc.size, 30);
  });

  test('a save below the gate has not earned the layer', async () => {
    const { actCardsUnlocked, ACT_CARD_UNLOCK_LEVEL } = await import('../../js/history-cards.js');
    assert.equal(actCardsUnlocked(ACT_CARD_UNLOCK_LEVEL - 1), false);
    assert.equal(actCardsUnlocked(ACT_CARD_UNLOCK_LEVEL), true);
    for (const junk of [null, undefined, NaN, 'fifteen', {}]) {
      assert.equal(actCardsUnlocked(junk), false, 'garbage never unlocks the layer');
    }
  });

  test('actOfLevel maps five acts of five levels, and refuses nonsense', async () => {
    const { actOfLevel } = await import('../../js/history-cards.js');
    assert.deepEqual([1, 5, 6, 10, 11, 15, 16, 20, 21, 25].map(actOfLevel),
                     [1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
    for (const junk of [0, 26, -1, null, 'x']) assert.equal(actOfLevel(junk), null);
  });
});

describe('⚠️ THE ONE RULE — an act card can never hang a session', () => {
  test('EVERY act-card word is typeable from the gate\'s key set', async () => {
    const { ACT_CARDS, actWordIsTypeable } = await import('../../js/history-cards.js');
    // THIS TEST IS THE HANG GUARD, and it is the reason the content rule exists.
    // An act card arms a win gate: the session cannot end until its word is
    // typed. A word containing a key the player does not have at the gate level
    // could therefore NEVER be typed — the level would not end, which is a One
    // Rule violation ("the game should only ever stop a player's flow with joy").
    // So the failure mode is not a cosmetic one, and it is caught here rather
    // than by a child who cannot finish.
    for (const c of ACT_CARDS) {
      assert.ok(actWordIsTypeable(c.word),
        `act card "${c.id}" has word "${c.word}" — not typeable from a-z ; , . / at the gate level`);
    }
  });

  test('the content rule accepts legal act words and rejects every illegal shape', async () => {
    const { actWordIsTypeable } = await import('../../js/history-cards.js');
    for (const ok of ['quarter', 'marquee', 'attract', 'coin', 'joystick']) {
      assert.ok(actWordIsTypeable(ok), `${ok} must be legal`);
    }
    for (const bad of ['wi-fi', 'IBM', 'two words', '2600', "don't", '', null, 42]) {
      assert.equal(actWordIsTypeable(bad), false, `${JSON.stringify(bad)} must be rejected`);
    }
  });

  test('an empty act bank arms NOTHING — the layer is inert until content lands', async () => {
    const { pickGuaranteedActCard, cardsForAct, ACT_CARDS } = await import('../../js/history-cards.js');
    if (ACT_CARDS.length === 0) {
      for (let a = 1; a <= 5; a++) {
        assert.deepEqual(cardsForAct(a), []);
        assert.equal(pickGuaranteedActCard(a, [], 0), null,
          'no card chosen means no win gate armed means no possible hang');
      }
    }
  });
});

describe('INV-96 still holds with a THIRD bank present', () => {
  test('act cards are not in HISTORY_CARDS, and TOTAL_CARDS is untouched', async () => {
    const { HISTORY_CARDS, WING_CARDS, ACT_CARDS, TOTAL_CARDS } = await import('../../js/history-cards.js');
    assert.equal(TOTAL_CARDS, HISTORY_CARDS.length);
    const arcadeIds = new Set(HISTORY_CARDS.map(c => c.id));
    const wingIds = new Set(WING_CARDS.map(c => c.id));
    for (const c of ACT_CARDS) {
      assert.ok(!arcadeIds.has(c.id), `${c.id} must not also be an arcade card`);
      assert.ok(!wingIds.has(c.id), `${c.id} must not also be a wing card`);
    }
  });

  test('an act card never leaks into a level pool', async () => {
    const { ACT_CARDS, cardsForLevel } = await import('../../js/history-cards.js');
    for (let lvl = 1; lvl <= 25; lvl++) {
      assert.ok(cardsForLevel(lvl).every(c => !ACT_CARDS.includes(c)),
        `level ${lvl} must never surface an act card`);
    }
  });

  test('bankOf and bankProgress know all three banks and never over-count', async () => {
    const { bankOf, bankProgress, HISTORY_CARDS, ACT_CARDS } = await import('../../js/history-cards.js');
    assert.equal(bankOf(HISTORY_CARDS[0].id), 'arcade');
    if (ACT_CARDS.length) assert.equal(bankOf(ACT_CARDS[0].id), 'act');
    const p = bankProgress('act', HISTORY_CARDS.map(c => c.id).concat(['act:bogus']));
    assert.equal(p.found, 0, 'arcade ids never count toward the act bank');
    assert.ok(p.found <= p.total);
  });
});
