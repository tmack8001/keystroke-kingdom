// Enforces: INV-147, INV-148, INV-149 — STRATEGY.md §5 "The 2026-10-30 sign-off wave".
//
// Design sources (written into the docs BEFORE the code moved, Trevor 2026-10-30):
//   - levels/onboarding.md §Returning Player Flow `R`: "The pre-filled name is a default,
//     not a draft: exactly like first-time name entry, the first thing typed REPLACES it
//     (GRAM + typing GRANDMA used to give GRANDMAGRAM). The first Backspace clears it whole;
//     ←/→/Home/End mean 'edit this name' and keep it; Space still types a space." "Return
//     saves the new name, Escape backs out with the name unchanged… Renaming never changes
//     which game is active — including when no game is active."
//   - levels/transitions.md §Phase 3 Name Entry: "Any key press clears the default and
//     starts typing fresh." (first-time name entry shares the behaviour)
//   - onboarding.md `X`: "The confirm names the game — ERASE THIS GAME? then GRAM · LV 4".
//     Settings → ERASE ALL PROGRESS "says how much it destroys: ERASE ALL 3 SAVED GAMES?
//     (ERASE 1 SAVED GAME? for one), with YOUR SETTINGS STAY beneath — a count, never a name."
//   - onboarding.md "The hint line offers only keys that do something there": on a game row
//     the full line; on the ＋ NEW GAME row — and on a picker with no games left — just
//     SPACE START A NEW GAME.
//   - security.md rule 1: a player-typed name reaches the DOM via textContent only.
//
// Interaction is REAL key events. Seeding kk-slots to reach a state fast is fine
// (testing.md rule 6). Observables are what the player reads: the visible screen, the name
// field, the picker rows/hint, the erase prompts, and persisted kk-slots/kk-settings.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  startGame, readScreen, readSlotsList, slotsSeed,
} from '../helpers/game-driver.mjs';

const SETTLE = 350;
const T = 90_000;

async function boot({ games, active = 0, settings, fresh = false } = {}) {
  const g = await startGame();
  // Seed ONCE per tab (sessionStorage marker), not on every navigation: the game's own
  // erase reloads the page, and a re-seed would resurrect what the player just erased.
  const seed = {};
  if (!fresh) seed['kk-slots'] = JSON.stringify(slotsSeed({ games, active }));
  if (settings) seed['kk-settings'] = JSON.stringify(settings);
  await g.page.addInitScript((pairs) => {
    if (sessionStorage.getItem('__kkSeeded')) return;
    sessionStorage.setItem('__kkSeeded', '1');
    for (const [k, v] of Object.entries(pairs)) localStorage.setItem(k, v);
  }, seed);
  await g.page.goto(g.baseUrl);
  await g.page.waitForTimeout(SETTLE + 400);
  await g.page.click('body');
  return g;
}
const GAMES = () => ([
  { name: 'OONA', furthestLevel: 3 },
  { name: 'DAD', furthestLevel: 3 },
  { name: 'GRAM', furthestLevel: 4 },
]);
const tap = async (page, key, ms = SETTLE) => { await page.keyboard.press(key); await page.waitForTimeout(ms); };
const text = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent : null; }, sel);
const fieldValue = (page) => page.evaluate(() => document.getElementById('player-name-input').value);
const shown = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  if (!el) return false;
  for (let n = el; n; n = n.parentElement) if (n.classList && n.classList.contains('hidden')) return false;
  return true;
}, sel);
const rawSlots = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('kk-slots')));
// Number keys point straight at the first nine games (onboarding.md), whatever row was lit before.
async function pointAt(page, index) { await tap(page, String(index + 1), 150); }
// Open RENAME on the game at `index` (the picker is the boot screen for a saved machine).
async function openRename(page, index) {
  assert.equal(await readScreen(page), 'slots-screen', 'a saved machine boots on the picker');
  await pointAt(page, index);
  await tap(page, 'r');
  assert.equal(await text(page, '#name-label'), 'RENAME THIS GAME', 'the field is labelled RENAME THIS GAME');
}

// ── INV-147 ────────────────────────────────────────────────────────────────
describe('INV-147 — the pre-filled name is a default, not a draft (rename field)', () => {
  let g;
  before(async () => { g = await boot({ games: GAMES() }); });
  after(async () => { await g.stop(); });

  test('R pre-fills the highlighted game\'s name; the first typed character REPLACES it (GRAM + GRANDMA is GRANDMA)', { timeout: T }, async () => {
    await openRename(g.page, 2);
    assert.equal(await fieldValue(g.page), 'GRAM');
    await g.page.keyboard.type('GRANDMA', { delay: 25 });
    assert.equal(await fieldValue(g.page), 'GRANDMA', 'never GRANDMAGRAM');
    await tap(g.page, 'Escape');                                // leave: name untouched
    assert.deepEqual((await rawSlots(g.page)).slots.map((s) => s.name), ['OONA', 'DAD', 'GRAM']);
  });

  test('Escape leaves the name alone and returns to the picker, active game unchanged', { timeout: T }, async () => {
    assert.equal(await readScreen(g.page), 'slots-screen');
    const before = (await rawSlots(g.page)).active;
    await openRename(g.page, 1);
    await g.page.keyboard.type('ZZZ', { delay: 20 });
    await tap(g.page, 'Escape');
    assert.equal(await readScreen(g.page), 'slots-screen');
    const after = await rawSlots(g.page);
    assert.equal(after.slots[1].name, 'DAD');
    assert.equal(after.active, before, 'renaming/abandoning never changes which game is active');
  });

  test('a key typed within a few ms of pressing R is not lost', { timeout: T }, async () => {
    assert.equal(await readScreen(g.page), 'slots-screen');
    await g.page.keyboard.press('r');
    await g.page.keyboard.press('Q');                           // no wait between them
    await g.page.waitForTimeout(SETTLE);
    assert.equal(await fieldValue(g.page), 'Q', 'the fast key replaced the default and survived');
    await tap(g.page, 'Escape');
  });

  test('the first Backspace clears the default whole', { timeout: T }, async () => {
    await openRename(g.page, 0);
    await tap(g.page, 'Backspace', 150);
    assert.equal(await fieldValue(g.page), '');
    await g.page.keyboard.type('AB', { delay: 20 });
    assert.equal(await fieldValue(g.page), 'AB');
    await tap(g.page, 'Escape');
  });

  test('a PASTED value also replaces the default', { timeout: T }, async () => {
    await openRename(g.page, 1);
    await g.page.keyboard.insertText('PASTED');
    await g.page.waitForTimeout(150);
    assert.equal(await fieldValue(g.page), 'PASTED');
    await tap(g.page, 'Escape');
  });

  test('←/→/Home/End mean "edit this name" and keep it', { timeout: T }, async () => {
    for (const [nav, expectStartsOrEnds] of [['ArrowLeft', 'X'], ['Home', 'X'], ['ArrowRight', 'X'], ['End', 'X']]) {
      await openRename(g.page, 2);
      await tap(g.page, nav, 100);
      await g.page.keyboard.type(expectStartsOrEnds, { delay: 20 });
      const v = await fieldValue(g.page);
      assert.ok(v.includes('GRAM') && v.length === 5, `${nav} then typing edits GRAM in place, got ${JSON.stringify(v)}`);
      await tap(g.page, 'Escape');
    }
  });

  test('Space still types a space', { timeout: T }, async () => {
    await openRename(g.page, 0);
    await g.page.keyboard.type('A', { delay: 20 });
    await g.page.keyboard.press('Space');
    await g.page.keyboard.type('B', { delay: 20 });
    assert.equal(await fieldValue(g.page), 'A B');
    await tap(g.page, 'Escape');
  });

  test('Return saves the new name for THAT game only, and returns to the picker', { timeout: T }, async () => {
    await openRename(g.page, 2);
    await g.page.keyboard.type('GRANDMA', { delay: 20 });
    await tap(g.page, 'Enter');
    assert.equal(await readScreen(g.page), 'slots-screen');
    assert.deepEqual((await readSlotsList(g.page)).map((r) => r.name), ['OONA', 'DAD', 'GRANDMA']);
    assert.deepEqual((await rawSlots(g.page)).slots.map((s) => s.name), ['OONA', 'DAD', 'GRANDMA']);
  });
});

describe('INV-147 — renaming the ACTIVE game updates the name shown everywhere', () => {
  let g;
  before(async () => { g = await boot({ games: GAMES(), active: 0 }); });
  after(async () => { await g.stop(); });

  test('after R + Return on the active game, READY and the HUD print the new name', { timeout: T }, async () => {
    await openRename(g.page, 0);
    await g.page.keyboard.type('ZOE', { delay: 20 });
    await tap(g.page, 'Enter');
    assert.equal(await readScreen(g.page), 'slots-screen');
    await tap(g.page, ' ');                                     // resume the highlighted (renamed) game
    assert.equal(await readScreen(g.page), 'ready-screen');
    assert.equal(await text(g.page, '#ready-name'), 'ZOE');
    await tap(g.page, ' ');                                     // KNOW YOUR KEYS
    await tap(g.page, ' ', 800);                                // the game
    assert.equal(await readScreen(g.page), 'game-screen');
    assert.equal(await text(g.page, '#hud-name'), 'ZOE');
  });
});

describe('INV-147 — renaming with NO active game leaves active null', () => {
  let g;
  before(async () => { g = await boot({ games: GAMES(), active: null }); });
  after(async () => { await g.stop(); });

  test('R + new name + Return renames the game and does NOT make it the active one', { timeout: T }, async () => {
    assert.equal((await rawSlots(g.page)).active, null, 'fixture: no game is active');
    await openRename(g.page, 1);
    await g.page.keyboard.type('DADDY', { delay: 20 });
    await tap(g.page, 'Enter');
    const after = await rawSlots(g.page);
    assert.equal(after.slots[1].name, 'DADDY');
    assert.equal(after.active, null, 'renaming is a label change, never a "which game is playing" change');
  });
});

describe('INV-147 — first-time name entry shares the behaviour', () => {
  let g;
  before(async () => { g = await boot({ fresh: true }); });
  after(async () => { await g.stop(); });

  test('on a brand-new machine the first typed character replaces PLAYER ONE', { timeout: T }, async () => {
    await tap(g.page, ' ');                                     // title -> name entry
    assert.equal(await shown(g.page, '#name-setup'), true, 'name entry is showing');
    assert.equal(await fieldValue(g.page), 'PLAYER ONE');
    await g.page.keyboard.type('MIA', { delay: 25 });
    assert.equal(await fieldValue(g.page), 'MIA');
  });

  test('the first Backspace clears the default whole', { timeout: T }, async () => {
    const g2 = await boot({ fresh: true });
    try {
      await tap(g2.page, ' ');
      await tap(g2.page, 'Backspace', 150);
      assert.equal(await fieldValue(g2.page), '');
    } finally { await g2.stop(); }
  });
});

// ── INV-148 ────────────────────────────────────────────────────────────────
describe('INV-148 — the per-game erase prompt names the game, as plain text', () => {
  let g;
  before(async () => {
    g = await boot({ games: [{ name: 'OONA', furthestLevel: 3 }, { name: '<b>BOLD</b>', furthestLevel: 7 }] });
  });
  after(async () => { await g.stop(); });

  test('X shows ERASE THIS GAME? with the highlighted game\'s name and level', { timeout: T }, async () => {
    await pointAt(g.page, 1);
    await tap(g.page, 'x');
    assert.equal(await shown(g.page, '#slots-erase'), true);
    assert.match(await text(g.page, '#slots-erase'), /ERASE THIS GAME\?/);
    const named = await text(g.page, '#slots-erase-name');
    assert.ok(named.includes('<b>BOLD</b>') && named.includes('LV 7'), `names the game and level, got ${JSON.stringify(named)}`);
  });

  test('a name containing markup is shown literally — never interpreted as HTML (textContent)', { timeout: T }, async () => {
    const kids = await g.page.evaluate(() => document.getElementById('slots-erase-name').children.length);
    assert.equal(kids, 0, 'no element was created from the player-typed name');
    const rowKids = await g.page.evaluate(() => [...document.querySelectorAll('#slots-list .slot-name')].reduce((n, e) => n + e.children.length, 0));
    assert.equal(rowKids, 0);
  });

  test('N backs out and nothing is erased', { timeout: T }, async () => {
    await tap(g.page, 'n');
    assert.equal(await shown(g.page, '#slots-erase'), false);
    assert.equal((await rawSlots(g.page)).slots.length, 2);
  });
});

describe('INV-148 — Settings -> ERASE ALL PROGRESS says how much it destroys', () => {
  // The erase row is last; ArrowUp from the first row wraps to it.
  async function openErase(page) {
    await tap(page, 'Escape');                                  // picker -> attract title
    await tap(page, 'Tab');                                     // -> settings
    assert.equal(await readScreen(page), 'settings-screen');
    await tap(page, 'ArrowUp', 150);
    await tap(page, 'Enter', 200);
  }

  test('three saved games: ERASE ALL 3 SAVED GAMES? with YOUR SETTINGS STAY; N cancels', { timeout: T }, async () => {
    const g = await boot({ games: GAMES() });
    try {
      await openErase(g.page);
      assert.equal(await shown(g.page, '#settings-erase-confirm'), true);
      assert.equal(await text(g.page, '#settings-erase-text'), 'ERASE ALL 3 SAVED GAMES?');
      assert.match(await text(g.page, '.settings-erase-sub'), /YOUR SETTINGS STAY/);
      await tap(g.page, 'n');
      assert.equal(await shown(g.page, '#settings-erase-confirm'), false);
      assert.equal((await rawSlots(g.page)).slots.length, 3, 'N erased nothing');
    } finally { await g.stop(); }
  });

  test('one saved game is singular: ERASE 1 SAVED GAME?', { timeout: T }, async () => {
    const g = await boot({ games: [{ name: 'OONA', furthestLevel: 2 }] });
    try {
      await openErase(g.page);
      assert.equal(await text(g.page, '#settings-erase-text'), 'ERASE 1 SAVED GAME?');
    } finally { await g.stop(); }
  });

  test('Y erases the games and the settings really do stay', { timeout: T }, async () => {
    const g = await boot({ games: GAMES(), settings: { crtEffects: false, sound: false } });
    try {
      await openErase(g.page);
      await g.page.keyboard.press('y');
      await g.page.waitForTimeout(1200);                        // the game reloads itself
      const after = await g.page.evaluate(() => ({
        slots: (() => { try { return JSON.parse(localStorage.getItem('kk-slots')); } catch (e) { return null; } })(),
        settings: JSON.parse(localStorage.getItem('kk-settings') || '{}'),
      }));
      const games = after.slots && Array.isArray(after.slots.slots) ? after.slots.slots.length : 0;
      assert.equal(games, 0, 'every saved game is gone');
      assert.equal(after.settings.crtEffects, false, 'YOUR SETTINGS STAY: CRT preference kept');
      assert.equal(after.settings.sound, false, 'YOUR SETTINGS STAY: sound preference kept');
    } finally { await g.stop(); }
  });

  test('with zero saved games the prompt reads NO SAVED GAMES TO ERASE', { timeout: T }, async () => {
    const g = await boot({ fresh: true });
    try {
      await tap(g.page, 'Tab');
      assert.equal(await readScreen(g.page), 'settings-screen');
      await tap(g.page, 'ArrowUp', 150);
      await tap(g.page, 'Enter', 200);
      assert.match(await text(g.page, '#settings-erase-text'), /NO SAVED GAMES TO ERASE/);
    } finally { await g.stop(); }
  });
});

// ── INV-149 ────────────────────────────────────────────────────────────────
describe('INV-149 — the picker hint line offers only keys that do something there', () => {
  const KEYS = ['SPACE PLAY', 'N NEW', 'R RENAME', 'C CARDS', 'X ERASE'];

  test('a game row shows the full hint line; the NEW GAME row shows only the start-a-new-game hint', { timeout: T }, async () => {
    const g = await boot({ games: GAMES() });
    try {
      const onGame = await text(g.page, '#slots-hint');
      for (const k of KEYS) assert.ok(onGame.includes(k), `game row hint offers "${k}", got ${JSON.stringify(onGame)}`);
      for (let i = 0; i < GAMES().length; i++) await tap(g.page, 'ArrowDown', 120);   // down to the NEW GAME row
      assert.equal(await g.page.evaluate(() => !!document.querySelector('#slots-list .slot-new.selected')), true);
      const onNew = await text(g.page, '#slots-hint');
      assert.match(onNew, /START A NEW GAME/);
      for (const k of ['RENAME', 'CARDS', 'ERASE']) assert.ok(!onNew.includes(k), `the NEW GAME row must not promise ${k}: ${JSON.stringify(onNew)}`);
    } finally { await g.stop(); }
  });

  test('a picker with no games left shows only the start-a-new-game hint', { timeout: T }, async () => {
    const g = await boot({ games: [{ name: 'OONA', furthestLevel: 2 }] });
    try {
      await tap(g.page, 'x');
      await tap(g.page, 'y');                                   // erase the only game
      assert.equal(await readScreen(g.page), 'slots-screen', 'the picker stays, now empty');
      assert.equal((await readSlotsList(g.page)).length, 0);
      const hint = await text(g.page, '#slots-hint');
      assert.match(hint, /START A NEW GAME/);
      for (const k of ['RENAME', 'CARDS', 'ERASE']) assert.ok(!hint.includes(k), `${k} acts on a game that does not exist: ${JSON.stringify(hint)}`);
    } finally { await g.stop(); }
  });
});
