// Enforces: INV-147 — onboarding.md §Returning Player Flow `R` (2026-10-30): "Renaming never
// changes which game is active — including when no game is active: it must not make the
// renamed game the active one (Return on a rename with `active: null` had set `active` to
// that game)." Also INV-131 (a rename touches only the named game).
//
// Unit layer: public exports of js/slots.js + the localStorage stub only.

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { installLocalStorageStub, resetStubs } from '../helpers/stubs.mjs';
import * as Slots from '../../js/slots.js';

beforeEach(() => installLocalStorageStub());
afterEach(() => resetStubs());

function seedGames(names, active) {
  localStorage.setItem('kk-slots', JSON.stringify({
    v: 1, active,
    slots: names.map((name) => ({ name, furthestLevel: 3, completed: {}, nameMoment: null, textWorlds: {}, cards: [], cardRotation: {}, storyRotation: {} })),
  }));
}
const names = () => Slots.listSlots().map((s) => s.name);

describe('INV-147 — renameSlot is a label change, never a "which game is playing" change', () => {
  test('with NO active game, renaming leaves active null', () => {
    seedGames(['OONA', 'DAD'], null);
    assert.equal(Slots.getActive(), null, 'fixture: nothing is active');
    Slots.renameSlot(1, 'DADDY');
    assert.deepEqual(names(), ['OONA', 'DADDY']);
    assert.equal(Slots.getActive(), null, 'the renamed game must not become the active one');
  });

  test('renaming a game that is not the active one leaves the active game alone', () => {
    seedGames(['OONA', 'DAD', 'GRAM'], 0);
    Slots.renameSlot(2, 'GRANDMA');
    assert.deepEqual(names(), ['OONA', 'DAD', 'GRANDMA']);
    assert.equal(Slots.getActive(), 0);
  });

  test('renaming the ACTIVE game changes the name the game reports for itself', () => {
    seedGames(['OONA', 'DAD'], 1);
    Slots.renameSlot(1, 'ZOE');
    assert.equal(Slots.activeName(), 'ZOE');
    assert.equal(Slots.getActive(), 1);
  });

  test('an out-of-range index renames nothing and throws nothing', () => {
    seedGames(['OONA'], 0);
    Slots.renameSlot(5, 'X');
    Slots.renameSlot(-1, 'X');
    assert.deepEqual(names(), ['OONA']);
  });
});
