// Enforces: INV-23, INV-59, INV-60, INV-61 — js/slots.js's own header comment
// ("any number of independent saved games... a whole family on one machine, a
// separate game and a separate collection to complete for each of them" — Trevor,
// 2026-07-19: "a family may have more than 3 members — there is no reason to
// limit"), product.md §History Cards, CLAUDE.md §Returning-player persistence,
// security.md rule 4 ("localStorage is untrusted input... tolerate garbage") and
// rule 8 (the PII floor — the only extra datum a game stores beyond curriculum
// progress is the display name).
//
// Unit layer only: public ES-module exports of js/slots.js + the localStorage stub
// from tests/helpers/stubs.mjs. slots.js has no module-level cache (every function
// reads/writes localStorage fresh on each call), so a single top-level import is
// safe — isolation between test cases comes entirely from installLocalStorageStub/
// resetStubs giving each test its own in-memory store.
//
// slots.js is a DYNAMIC, uncapped list of games (no fixed slot count, no null
// padding) — `createSlot(name)` APPENDS and returns the new game's index;
// `listSlots()` is a dense array with one entry per EXISTING game only. This suite
// is deliberately count-agnostic: it never assumes a maximum, and always derives
// "how many games exist" from `listSlots().length` / the returned index, never a
// hardcoded number.

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { installLocalStorageStub, resetStubs } from '../helpers/stubs.mjs';
import * as Slots from '../../js/slots.js';
import { legacyLevelToCardId } from '../../js/history-cards.js';

beforeEach(() => installLocalStorageStub());
afterEach(() => resetStubs());

describe('slots.js — module shape', () => {
  test('exports the documented lifecycle, progress, and card-collection surface, with NO fixed slot-count constant', () => {
    assert.equal(Slots.SLOT_COUNT, undefined, 'there is deliberately no fixed cap on the number of games');
    for (const fn of [
      'ensureMigrated', 'anySlotExists', 'listSlots',
      'getActive', 'setActive', 'createSlot', 'eraseSlot', 'eraseActiveSlot',
      'setActiveName', 'activeName', 'getProgress', 'saveProgress',
      'collectedIds', 'collectedCount', 'collectCardId', 'slotCards',
      'getCardRotation', 'bumpCardRotation',
    ]) {
      assert.equal(typeof Slots[fn], 'function', `Slots.${fn} must be exported as a function`);
    }
  });
});

// ── Lifecycle: create / list / setActive / erase (dynamic, unbounded list) ──
describe('slot lifecycle — create, list, setActive, erase (any number of games)', () => {
  test('a brand-new store has no games, no active pointer, and an empty list', () => {
    assert.equal(Slots.anySlotExists(), false);
    assert.equal(Slots.getActive(), null);
    assert.deepEqual(Slots.listSlots(), []);
  });

  test('createSlot appends a new game, returns its index, and makes it active', () => {
    const i = Slots.createSlot('ALICE');
    assert.equal(i, 0, 'the first game created gets index 0');
    assert.equal(Slots.anySlotExists(), true);
    assert.equal(Slots.getActive(), 0);
    const listed = Slots.listSlots();
    assert.equal(listed.length, 1);
    assert.deepEqual(listed[0], { name: 'ALICE', furthestLevel: 1, cardsFound: 0 });
    assert.deepEqual(Slots.getProgress(), { furthestLevel: 1, completed: {}, nameMoment: null, textWorlds: {} });
  });

  test('there is no cap: many games can be created, each appended and returned an increasing index', () => {
    const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G']; // deliberately more than the old 3-slot cap
    const indices = names.map((n) => Slots.createSlot(n));
    assert.deepEqual(indices, names.map((_, i) => i), 'each createSlot call appends at the next index');
    assert.equal(Slots.listSlots().length, names.length);
    assert.deepEqual(Slots.listSlots().map((s) => s.name), names);
  });

  test('count() tracks the number of existing games exactly, growing and shrinking with create/erase', () => {
    assert.equal(Slots.count(), 0);
    for (const n of ['A', 'B', 'C', 'D', 'E']) Slots.createSlot(n);
    assert.equal(Slots.count(), 5, 'five games created — a family of five, well past the old 3-slot cap');
    Slots.eraseSlot(2);
    assert.equal(Slots.count(), 4);
    assert.equal(Slots.count(), Slots.listSlots().length, 'count() always agrees with listSlots().length');
  });

  test('creating a second game activates IT, but leaves the first game\'s data completely intact', () => {
    Slots.createSlot('ALICE');
    Slots.saveProgress({ furthestLevel: 6, completed: { 1: true, 2: true } });
    const bobIndex = Slots.createSlot('BOB');
    assert.equal(Slots.getActive(), bobIndex, 'the newly created game becomes active');
    const listed = Slots.listSlots();
    assert.equal(listed[0].name, 'ALICE');
    assert.equal(listed[0].furthestLevel, 6, 'game 0\'s progress is untouched by creating game 1');
    assert.equal(listed[bobIndex].name, 'BOB');
    assert.equal(listed[bobIndex].furthestLevel, 1);
  });

  test('an empty/blank name falls back to PLAYER ONE; a name is capped at 16 characters', () => {
    Slots.createSlot('   ');
    assert.equal(Slots.listSlots()[0].name, 'PLAYER ONE');
    Slots.createSlot('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    assert.equal(Slots.listSlots()[1].name.length, 16);
    assert.equal(Slots.listSlots()[1].name, 'ABCDEFGHIJKLMNOP');
  });

  test('setActive only accepts a real, in-range game index — out-of-range targets are a no-op', () => {
    Slots.createSlot('ALICE');
    const bobIndex = Slots.createSlot('BOB');
    Slots.setActive(0);
    assert.equal(Slots.getActive(), 0);
    Slots.setActive(99); // out of range
    assert.equal(Slots.getActive(), 0, 'an out-of-range index does not move the active pointer');
    Slots.setActive(-1);
    assert.equal(Slots.getActive(), 0, 'a negative index does not move the active pointer');
    Slots.setActive(bobIndex);
    assert.equal(Slots.getActive(), bobIndex);
  });

  test('eraseSlot on a NON-active game clears only that game, compacts the list, and leaves the active pointer on the SAME game', () => {
    Slots.createSlot('ALICE'); // index 0
    Slots.createSlot('BOB');   // index 1
    Slots.createSlot('CARL');  // index 2
    Slots.setActive(2); // CARL is active

    Slots.eraseSlot(0); // erase ALICE, who sits BEFORE the active game
    const listed = Slots.listSlots();
    assert.equal(listed.length, 2);
    assert.deepEqual(listed.map((s) => s.name), ['BOB', 'CARL']);
    assert.equal(Slots.getActive(), 1, 'the active pointer shifts down to keep pointing at CARL after an earlier game is removed');
    assert.equal(Slots.activeName(), 'CARL');
  });

  test('eraseSlot on the ACTIVE game clears it AND drops the active pointer', () => {
    const i = Slots.createSlot('ALICE');
    assert.equal(Slots.getActive(), i);
    Slots.eraseSlot(i);
    assert.equal(Slots.listSlots().length, 0);
    assert.equal(Slots.getActive(), null, 'erasing the active game returns the player to the picker');
  });

  test('eraseSlot on a game AFTER the active one leaves the active pointer\'s index untouched', () => {
    Slots.createSlot('ALICE'); // 0 — active
    Slots.createSlot('BOB');   // 1
    Slots.setActive(0);
    Slots.eraseSlot(1); // erase BOB, who sits after the active game
    assert.equal(Slots.getActive(), 0, 'nothing before or at the active index changed');
    assert.equal(Slots.activeName(), 'ALICE');
  });

  test('eraseActiveSlot erases whatever is active, and is a safe no-op with no active game', () => {
    assert.doesNotThrow(() => Slots.eraseActiveSlot());
    assert.equal(Slots.anySlotExists(), false);

    Slots.createSlot('ALICE');
    Slots.createSlot('BOB'); // active is now BOB
    Slots.eraseActiveSlot();
    assert.deepEqual(Slots.listSlots().map((s) => s.name), ['ALICE'], 'only the active game (BOB) was erased');
    assert.equal(Slots.getActive(), null);
  });

  test('setActiveName / activeName round-trip on the active game only; both are safe no-ops with no active game', () => {
    assert.doesNotThrow(() => Slots.setActiveName('NOBODY'));
    assert.equal(Slots.activeName(), null);

    Slots.createSlot('ALICE');
    Slots.createSlot('BOB'); // active -> BOB
    Slots.setActiveName('BOBBY');
    assert.equal(Slots.activeName(), 'BOBBY');
    assert.equal(Slots.listSlots()[0].name, 'ALICE', 'renaming the active game never touches an inactive one');
  });
});

// ── INV-23 / INV-59 — active-game-scoped progress round-trip + isolation ────
describe('getProgress / saveProgress — active-game scoping', () => {
  test('with no active game, getProgress returns a fresh default and saveProgress is a silent no-op', () => {
    const before = Slots.getProgress();
    assert.deepEqual(before, { furthestLevel: 1, completed: {}, nameMoment: null, textWorlds: {} });
    assert.doesNotThrow(() => Slots.saveProgress({ furthestLevel: 20, completed: { 1: true } }));
    assert.equal(Slots.anySlotExists(), false, 'saveProgress with no active game never creates one');
    assert.deepEqual(Slots.getProgress(), before, 'progress is unchanged — the write never happened');
  });

  test('saveProgress persists to the active game, and a fresh getProgress() call reflects it', () => {
    Slots.createSlot('ALICE');
    Slots.saveProgress({
      furthestLevel: 9,
      completed: { 1: true, 2: true },
      nameMoment: { name: 'alice' },
      textWorlds: { cave: { completed: true } },
    });
    assert.deepEqual(Slots.getProgress(), {
      furthestLevel: 9,
      completed: { 1: true, 2: true },
      nameMoment: { name: 'alice' },
      textWorlds: { cave: { completed: true } },
    });
  });

  test('saveProgress clamps furthestLevel into [1,25]', () => {
    Slots.createSlot('ALICE');
    Slots.saveProgress({ furthestLevel: 999 });
    assert.equal(Slots.getProgress().furthestLevel, 25);
    Slots.saveProgress({ furthestLevel: -5 });
    assert.equal(Slots.getProgress().furthestLevel, 1);
  });

  test('a partial saveProgress call only overwrites the fields it provides — others survive', () => {
    Slots.createSlot('ALICE');
    Slots.saveProgress({ furthestLevel: 5, completed: { 1: true }, nameMoment: { name: 'alice' }, textWorlds: { cave: { completed: true } } });
    Slots.saveProgress({ furthestLevel: 6 }); // no completed/nameMoment/textWorlds this time
    const p = Slots.getProgress();
    assert.equal(p.furthestLevel, 6);
    assert.deepEqual(p.completed, { 1: true }, 'completed is preserved when a later save omits it');
    assert.deepEqual(p.nameMoment, { name: 'alice' }, 'nameMoment is preserved when a later save omits it');
    assert.deepEqual(p.textWorlds, { cave: { completed: true } }, 'textWorlds is preserved when a later save omits it');
  });

  test('INV-59: progress written to one game never leaks into or mutates another, across several games', () => {
    Slots.createSlot('ALICE');
    Slots.saveProgress({ furthestLevel: 4, completed: { 1: true } });
    const bob = Slots.createSlot('BOB');
    Slots.saveProgress({ furthestLevel: 12, completed: { 1: true, 2: true, 3: true } });
    const carl = Slots.createSlot('CARL');
    Slots.saveProgress({ furthestLevel: 20, completed: {} });

    Slots.setActive(0);
    assert.deepEqual(Slots.getProgress().completed, { 1: true }, 'ALICE\'s own progress, untouched by BOB/CARL\'s writes');
    assert.equal(Slots.getProgress().furthestLevel, 4);

    Slots.setActive(bob);
    assert.equal(Slots.getProgress().furthestLevel, 12);

    Slots.setActive(carl);
    assert.equal(Slots.getProgress().furthestLevel, 20);
  });
});

// ── INV-23 / INV-59 — card collection: idempotency + per-game isolation ─────
describe('collectCardId / collectedIds / collectedCount / slotCards — per-game card collection', () => {
  test('with no active game, collectCardId reads as a "discovery" (true) but persists nothing', () => {
    assert.equal(Slots.collectCardId('ada-lovelace'), true);
    assert.equal(Slots.anySlotExists(), false, 'no game was created as a side effect');
    assert.deepEqual(Slots.collectedIds(), []);
  });

  test('collectCardId is idempotent: true the first time, false thereafter; collectedCount reflects it', () => {
    Slots.createSlot('ALICE');
    assert.equal(Slots.collectedCount(), 0);
    assert.equal(Slots.collectCardId('ada-lovelace'), true, 'first collection returns true (drives the NEW! tag)');
    assert.equal(Slots.collectedCount(), 1);
    assert.equal(Slots.collectCardId('ada-lovelace'), false, 'collecting the same id again is idempotent');
    assert.equal(Slots.collectedCount(), 1, 'idempotent collection does not double-count');
    assert.deepEqual(Slots.collectedIds(), ['ada-lovelace']);
  });

  test('collectedCount accumulates across multiple distinct ids', () => {
    Slots.createSlot('ALICE');
    Slots.collectCardId('ada-lovelace');
    Slots.collectCardId('hal-9000');
    Slots.collectCardId('hedy-lamarr');
    assert.equal(Slots.collectedCount(), 3);
  });

  test('INV-59: card collection is per-game — collecting in one game never appears in another\'s collection', () => {
    Slots.createSlot('ALICE');
    Slots.collectCardId('ada-lovelace');
    const bob = Slots.createSlot('BOB'); // active -> BOB
    Slots.collectCardId('hal-9000');

    assert.deepEqual(Slots.slotCards(0), ['ada-lovelace']);
    assert.deepEqual(Slots.slotCards(bob), ['hal-9000']);

    Slots.setActive(0);
    assert.deepEqual(Slots.collectedIds(), ['ada-lovelace'], 'switching active back to ALICE shows only HER cards');
  });

  test('slotCards() can read ANY game\'s collection without switching the active pointer', () => {
    Slots.createSlot('ALICE');
    Slots.collectCardId('ada-lovelace');
    const bob = Slots.createSlot('BOB');
    Slots.collectCardId('hal-9000');
    Slots.setActive(0); // active is now ALICE
    assert.deepEqual(Slots.slotCards(bob), ['hal-9000'], 'slotCards(bob) reads BOB even while ALICE is active');
    assert.equal(Slots.getActive(), 0, 'peeking at another game\'s cards never changes the active pointer');
  });

  test('erasing a game erases its card collection too, and compacts indices for the rest', () => {
    Slots.createSlot('ALICE');
    Slots.collectCardId('ada-lovelace');
    const bob = Slots.createSlot('BOB');
    Slots.collectCardId('hal-9000');
    Slots.eraseSlot(0); // erase ALICE
    assert.deepEqual(Slots.slotCards(0), ['hal-9000'], 'BOB shifted down to index 0 and kept HIS OWN cards');
  });
});

// ── Per-level card rotation ──────────────────────────────────────────────────
describe('getCardRotation / bumpCardRotation', () => {
  test('with no active game, rotation reads as 0 and bump is a safe no-op', () => {
    assert.equal(Slots.getCardRotation(4), 0);
    assert.doesNotThrow(() => Slots.bumpCardRotation(4));
    assert.equal(Slots.anySlotExists(), false);
  });

  test('bumpCardRotation increments that level\'s counter; getCardRotation reflects it', () => {
    Slots.createSlot('ALICE');
    assert.equal(Slots.getCardRotation(4), 0);
    Slots.bumpCardRotation(4);
    assert.equal(Slots.getCardRotation(4), 1);
    Slots.bumpCardRotation(4);
    Slots.bumpCardRotation(4);
    assert.equal(Slots.getCardRotation(4), 3);
  });

  test('rotation is tracked independently per level', () => {
    Slots.createSlot('ALICE');
    Slots.bumpCardRotation(4);
    Slots.bumpCardRotation(4);
    Slots.bumpCardRotation(8);
    assert.equal(Slots.getCardRotation(4), 2);
    assert.equal(Slots.getCardRotation(8), 1);
    assert.equal(Slots.getCardRotation(12), 0, 'a level never bumped stays at 0');
  });

  test('INV-59: rotation is tracked independently per GAME for the same level', () => {
    Slots.createSlot('ALICE');
    Slots.bumpCardRotation(4);
    Slots.bumpCardRotation(4);
    Slots.createSlot('BOB'); // active -> BOB
    assert.equal(Slots.getCardRotation(4), 0, 'a fresh game starts its own rotation at 0, unaffected by ALICE\'s bumps');
    Slots.bumpCardRotation(4);
    Slots.setActive(0);
    assert.equal(Slots.getCardRotation(4), 2, 'ALICE\'s rotation survived BOB\'s own bump untouched');
  });
});

// ── INV-60 — legacy → first-game migration ───────────────────────────────────
describe('ensureMigrated — legacy kk-progress + kk-cards folding into the first game', () => {
  test('a genuine first-timer (no legacy progress, no legacy cards) leaves kk-slots entirely absent', () => {
    Slots.ensureMigrated('PLAYER ONE');
    assert.equal(localStorage.getItem('kk-slots'), null, 'no kk-slots key is written for a true first-timer');
    assert.equal(Slots.anySlotExists(), false);
  });

  test('legacy progress with furthestLevel === 1 and no completed levels is NOT "real progress" — no migration occurs', () => {
    localStorage.setItem('kk-progress', JSON.stringify({ furthestLevel: 1, completed: {}, nameMoment: null, textWorlds: {} }));
    Slots.ensureMigrated('PLAYER ONE');
    assert.equal(localStorage.getItem('kk-slots'), null);
  });

  test('real legacy progress (furthestLevel > 1) migrates into the first game, NOT auto-activated', () => {
    localStorage.setItem('kk-progress', JSON.stringify({
      furthestLevel: 6, completed: { 1: true, 2: true, 3: true, 4: true, 5: true }, nameMoment: { name: 'oona' }, textWorlds: { cave: { completed: true } },
    }));
    Slots.ensureMigrated('OONA');

    assert.equal(Slots.anySlotExists(), true);
    assert.equal(Slots.getActive(), null, 'a migrated game is never auto-activated — the picker is the front door');
    const listed = Slots.listSlots();
    assert.equal(listed.length, 1);
    assert.equal(listed[0].name, 'OONA');
    assert.equal(listed[0].furthestLevel, 6);

    Slots.setActive(0);
    assert.deepEqual(Slots.getProgress().completed, { 1: true, 2: true, 3: true, 4: true, 5: true });
    assert.deepEqual(Slots.getProgress().nameMoment, { name: 'oona' });
    assert.deepEqual(Slots.getProgress().textWorlds, { cave: { completed: true } });
  });

  test('legacy progress with completed levels but furthestLevel still 1 counts as real progress too', () => {
    localStorage.setItem('kk-progress', JSON.stringify({ furthestLevel: 1, completed: { 1: true } }));
    Slots.ensureMigrated('PLAYER ONE');
    assert.equal(Slots.anySlotExists(), true);
  });

  test('legacy kk-cards (level numbers) map to stable ids via legacyLevelToCardId; unmapped levels are dropped', () => {
    // Level 4's original legacy card is 'ada-lovelace' (per history-cards.js's own
    // legacyLevel tags) — use the real mapping so this never hardcodes an id that
    // could drift from the data file (STRATEGY.md §2).
    const mappedId = legacyLevelToCardId(4);
    assert.ok(mappedId, 'fixture sanity: level 4 has a legacy card id to migrate');

    localStorage.setItem('kk-progress', JSON.stringify({ furthestLevel: 6, completed: { 1: true } }));
    localStorage.setItem('kk-cards', JSON.stringify([4, 999])); // 999 is not a real legacy level
    Slots.ensureMigrated('PLAYER ONE');

    Slots.setActive(0);
    assert.deepEqual(Slots.collectedIds(), [mappedId], 'only the real, mapped legacy card id survives migration');
  });

  test('kk-progress and kk-cards are removed from localStorage once folded into a game', () => {
    localStorage.setItem('kk-progress', JSON.stringify({ furthestLevel: 10, completed: { 1: true } }));
    localStorage.setItem('kk-cards', JSON.stringify([4]));
    Slots.ensureMigrated('PLAYER ONE');
    assert.equal(localStorage.getItem('kk-progress'), null);
    assert.equal(localStorage.getItem('kk-cards'), null);
  });

  test('idempotent: once kk-slots exists, a second ensureMigrated call is a total no-op', () => {
    localStorage.setItem('kk-progress', JSON.stringify({ furthestLevel: 6, completed: { 1: true } }));
    Slots.ensureMigrated('FIRST');
    Slots.setActive(0);
    Slots.collectCardId('ada-lovelace'); // real, post-migration activity

    // Simulate a stray leftover legacy key somehow reappearing (should never
    // happen in practice, but proves the idempotency guard checks kk-slots
    // presence, not the legacy keys' absence).
    localStorage.setItem('kk-progress', JSON.stringify({ furthestLevel: 20, completed: {} }));
    Slots.ensureMigrated('SECOND');

    assert.deepEqual(Slots.collectedIds(), ['ada-lovelace'], 'the already-migrated game is untouched by a repeat call');
    assert.equal(Slots.listSlots()[0].name, 'FIRST', 'the game\'s name is not re-migrated from the second legacyName');
    assert.equal(Slots.listSlots().length, 1, 'no second game was appended by the repeat call');
  });
});

// ── Garbage tolerance (security.md rule 4) ───────────────────────────────────
describe('garbage tolerance — corrupt/malformed kk-slots never crashes, never bricks the picker', () => {
  test('corrupt JSON in kk-slots is tolerated: reads as empty, no throw', () => {
    localStorage.setItem('kk-slots', '{not valid json!!!');
    assert.doesNotThrow(() => Slots.anySlotExists());
    assert.equal(Slots.anySlotExists(), false);
    assert.deepEqual(Slots.listSlots(), []);
    assert.deepEqual(Slots.getProgress(), { furthestLevel: 1, completed: {}, nameMoment: null, textWorlds: {} });
  });

  test('a non-object / wrong-shape kk-slots value (array, number, missing .slots) is tolerated', () => {
    for (const bad of ['[1,2,3]', '42', '"hello"', JSON.stringify({ v: 1, active: 0 })]) {
      localStorage.setItem('kk-slots', bad);
      assert.doesNotThrow(() => Slots.anySlotExists(), `bad value should not throw: ${bad}`);
      assert.equal(Slots.anySlotExists(), false, `bad value should read as empty: ${bad}`);
    }
  });

  test('a garbage entry inside slots[] is dropped from the list, not just defaulted — surviving real games keep their own index', () => {
    localStorage.setItem('kk-slots', JSON.stringify({
      v: 1,
      active: 1,
      slots: [
        { name: 'ALICE', furthestLevel: 3, completed: {}, nameMoment: null, textWorlds: {}, cards: [], cardRotation: {} },
        'this-is-garbage-not-an-object',
        42,
        null,
      ],
    }));
    const listed = Slots.listSlots();
    assert.equal(listed.length, 1, 'only the one real game survives — garbage entries are dropped, not defaulted in place');
    assert.equal(listed[0].name, 'ALICE');
  });

  test('a malformed individual game entry (wrong field types) normalizes to safe defaults, never crashes', () => {
    localStorage.setItem('kk-slots', JSON.stringify({
      v: 1,
      active: 0,
      slots: [
        { name: 12345, furthestLevel: 'ninety-nine', completed: 'not-an-object', nameMoment: 'not-an-object', textWorlds: 42, cards: 'not-an-array', cardRotation: 'not-an-object' },
      ],
    }));
    assert.doesNotThrow(() => Slots.getProgress());
    const p = Slots.getProgress();
    assert.equal(p.furthestLevel, 1, 'a non-finite furthestLevel falls back to 1');
    assert.deepEqual(p.completed, {});
    assert.equal(p.nameMoment, null);
    assert.deepEqual(p.textWorlds, {});
    assert.deepEqual(Slots.collectedIds(), [], 'a non-array cards field falls back to an empty collection');
    assert.equal(Slots.listSlots()[0].name, 'PLAYER ONE', 'a non-string name falls back to PLAYER ONE');
    assert.equal(Slots.getCardRotation(4), 0);
  });

  test('an out-of-range stored active pointer (points past the end of the list) is treated as no active game', () => {
    localStorage.setItem('kk-slots', JSON.stringify({ v: 1, active: 5, slots: [{ name: 'ALICE', furthestLevel: 3, completed: {}, nameMoment: null, textWorlds: {}, cards: [], cardRotation: {} }] }));
    assert.equal(Slots.getActive(), null, 'an out-of-range active pointer degrades to null, never a crash');
    assert.deepEqual(Slots.getProgress(), { furthestLevel: 1, completed: {}, nameMoment: null, textWorlds: {} }, 'getProgress falls back to a fresh default when the active pointer is invalid');
  });

  test('a throwing localStorage (private-mode style) degrades every function gracefully — never throws', () => {
    globalThis.localStorage = {
      getItem() { throw new Error('SecurityError: storage disabled'); },
      setItem() { throw new Error('SecurityError: storage disabled'); },
      removeItem() { throw new Error('SecurityError: storage disabled'); },
      clear() { throw new Error('SecurityError: storage disabled'); },
      key() { throw new Error('SecurityError: storage disabled'); },
      get length() { throw new Error('SecurityError: storage disabled'); },
    };
    assert.doesNotThrow(() => Slots.anySlotExists());
    assert.equal(Slots.anySlotExists(), false);
    assert.doesNotThrow(() => Slots.createSlot('ALICE'));
    assert.doesNotThrow(() => Slots.getProgress());
    assert.doesNotThrow(() => Slots.saveProgress({ furthestLevel: 5 }));
    assert.doesNotThrow(() => Slots.collectCardId('ada-lovelace'));
    assert.doesNotThrow(() => Slots.collectedCount());
    assert.doesNotThrow(() => Slots.eraseActiveSlot());
  });

  // TF-S1 (RESOLVED 2026-07-19) — see docs/testing/FINDINGS.md. ensureMigrated's
  // first `localStorage.getItem` was the one unguarded read in the module and
  // threw under a throwing localStorage — and boot() calls it at startup, so the
  // game would fail to initialize in private-browsing mode. Now guarded in a
  // try/catch (slots.js): storage unavailable → nothing to migrate, never throws.
  test('TF-S1: ensureMigrated tolerates a throwing localStorage — boot never breaks in private mode', () => {
    globalThis.localStorage = {
      getItem() { throw new Error('SecurityError: storage disabled'); },
      setItem() { throw new Error('SecurityError: storage disabled'); },
      removeItem() { throw new Error('SecurityError: storage disabled'); },
      clear() { throw new Error('SecurityError: storage disabled'); },
      key() { throw new Error('SecurityError: storage disabled'); },
      get length() { throw new Error('SecurityError: storage disabled'); },
    };
    assert.doesNotThrow(() => Slots.ensureMigrated('OONA'));
  });
});
