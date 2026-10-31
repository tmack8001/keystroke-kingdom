// Enforces: INV-130, INV-131, INV-132, INV-139 — STRATEGY.md §5 "The 2026-10-30
// sign-off wave".
//
// Design sources (all written into the docs by the engine lane BEFORE the code
// moved, with Trevor's sign-off, 2026-10-30):
//   - .claude/rules/levels/onboarding.md §"The arcade from READY, and why name
//     entry no longer appears for a saved game": Escape on READY goes to the
//     arcade select screen with the unlock gates honoured; choosing a cabinet goes
//     straight to READY; Space on the attract title, when saved games exist, opens
//     the picker; name entry is only for a NEW game and the labelled R RENAME.
//   - §Returning Player Flow `R`: "opens the name field labelled RENAME THIS GAME,
//     pre-filled with that game's current name; Return saves…, Escape backs out
//     with the name unchanged; both return to the picker. This is the ONLY way a
//     saved game's name ever changes. Renaming never changes which game is active."
//   - §"Which game is playing": "Escape from the picker makes the highlighted game
//     active… (On the ＋ NEW GAME row, the active game is left as it was.) The READY
//     screen and the in-game HUD always show the ACTIVE game's name."
//   - §Returning Player Flow `★ found / total`: "counts the arcade card bank only…
//     Wing and act cards… never inflate this line" (INV-100/106 at the front door).
//   - §Design Rules: "A saved game is never renamed by accident."
//
// The defect these exist for: a parent typed `wopr` into what they took for a
// menu and silently renamed DAD to WOPR (Escape on READY used to drop into name
// entry, and any typing + Return renamed the active saved game). A Level 11 win
// was once credited to the wrong family member.
//
// Interaction is REAL key events through the real screens. Seeding `kk-slots` to
// reach a state fast is fine (testing.md rule 6); every behaviour under test goes
// through the keyboard. Observables: the visible screen id, the DOM the player
// reads (#ready-name, #hud-name, picker rows, #name-label), and the persisted
// `kk-slots` — never a game internal.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  startGame, readScreen, readSlotsList, slotsSeed, press, winLevel, isLevelCompleteVisible,
} from '../helpers/game-driver.mjs';
import { HISTORY_CARDS, WING_CARDS, ACT_CARDS, TOTAL_CARDS } from '../../js/history-cards.js';
import { LEVELS } from '../../js/levels.js';

const SETTLE = 450;
const T = 120_000;

const GAMES = () => ([
  { name: 'OONA', furthestLevel: 3 },
  { name: 'DAD', furthestLevel: 3 },
  { name: 'GRAM', furthestLevel: 3 },
]);

async function boot(opts = {}) {
  const g = await startGame({
    localStorage: { 'kk-slots': slotsSeed({ games: opts.games || GAMES(), active: opts.active ?? 0 }) },
  });
  await g.page.goto(g.baseUrl);
  await g.page.waitForTimeout(SETTLE + 300);
  await g.page.click('body');
  return g;
}

const raw = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('kk-slots')));
async function names(page) { return (await raw(page)).slots.map((s) => s.name); }
async function active(page) { return (await raw(page)).active; }
async function tap(page, key, ms = 250) { await page.keyboard.press(key); await page.waitForTimeout(ms); }
const read = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  return el ? el.textContent : null;
}, sel);
const visible = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  if (!el) return false;
  for (let n = el; n; n = n.parentElement) if (n.classList && n.classList.contains('hidden')) return false;
  return true;
}, sel);

async function toNewGameRow(page) {
  for (let i = 0; i < 12; i++) {
    if (await page.evaluate(() => !!document.querySelector('#slots-list .slot-new.selected'))) return;
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
  }
  throw new Error('could not reach the NEW GAME row');
}

async function selectedLevel(page) {
  return page.evaluate(() => {
    const el = document.querySelector('#select-cabinets .select-cabinet.selected[data-level]');
    return el ? Number(el.dataset.level) : null;
  });
}
async function cabinetStates(page) {
  return page.evaluate(() => [...document.querySelectorAll('#select-cabinets .select-cabinet[data-level]')]
    .map((el) => ({ level: Number(el.dataset.level), locked: el.classList.contains('locked') })));
}

// ── INV-130 ────────────────────────────────────────────────────────────────
describe('INV-130 — Escape on READY reaches the arcade for a saved game; the gates hold; the name is untouched', () => {
  let g;
  before(async () => { g = await boot(); });
  after(async () => { await g.stop(); });

  test('a saved game boots on the picker; Space resumes it onto READY showing ITS name', { timeout: T }, async () => {
    assert.equal(await readScreen(g.page), 'slots-screen');
    await tap(g.page, '2');                     // highlight DAD
    await tap(g.page, ' ');
    assert.equal(await readScreen(g.page), 'ready-screen');
    assert.equal(await read(g.page, '#ready-name'), 'DAD');
  });

  test('Escape on READY goes to the arcade select screen — NOT to name entry', { timeout: T }, async () => {
    await tap(g.page, 'Escape', SETTLE);
    assert.equal(await readScreen(g.page), 'select-screen');
    assert.equal(await visible(g.page, '#name-setup'), false, 'no name field is live');
  });

  test('"the unlock gates honoured": cabinets beyond the game\'s furthest level are locked and cannot be walked onto', { timeout: T }, async () => {
    const furthest = 3;
    const states = await cabinetStates(g.page);
    assert.ok(states.length >= 5, 'the act page shows its cabinets');
    for (const { level, locked } of states) {
      assert.equal(locked, level > furthest, `cabinet ${level}: locked iff beyond the game's furthest level (${furthest})`);
    }
    // Walking ALONG the act can never land on a locked cabinet, however hard the player pushes.
    for (const key of ['ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowLeft', 'ArrowRight']) {
      await tap(g.page, key, 120);
      const sel = await selectedLevel(g.page);
      assert.ok(sel === null || sel <= furthest, `after ${key} the cursor is on cabinet ${sel}`);
    }
  });

  test('a wholly-locked act can be looked at but never entered: Enter on a locked cabinet does nothing', { timeout: T }, async () => {
    // cabinet-art.js navigateAct: "If the whole act is locked, this parks on its
    // first cabinet, which stays unselectable at Enter time."
    await tap(g.page, 'ArrowDown', 200);
    const sel = await selectedLevel(g.page);
    if (sel !== null && sel > 3) {
      const states = await cabinetStates(g.page);
      assert.equal(states.find((s) => s.level === sel).locked, true, 'it is drawn locked');
      await tap(g.page, 'Enter', SETTLE);
      assert.equal(await readScreen(g.page), 'select-screen', 'a locked cabinet is not enterable');
    }
    await tap(g.page, 'ArrowUp', 200);
    const back = await selectedLevel(g.page);
    assert.ok(back !== null && back <= 3, `back on an unlocked cabinet (${back})`);
  });

  test('a locked bonus wing stays dark: walking down the arcade never reaches a back-wall door', { timeout: T }, async () => {
    for (let i = 0; i < 10; i++) await tap(g.page, 'ArrowDown', 100);
    const doors = await g.page.evaluate(() => document.querySelectorAll('#select-cabinets .select-door').length);
    assert.equal(doors, 0, 'Level 3 has not earned any wing');
    const label = await read(g.page, '#select-act-label');
    assert.ok(!/ACT\s+[678]\b/.test(label || ''), `act label "${label}" must not show a bonus act`);
    for (let i = 0; i < 10; i++) await tap(g.page, 'ArrowUp', 100);
    const back = await selectedLevel(g.page);
    assert.ok(back !== null && back <= 3, `back among the unlocked cabinets (${back})`);
  });

  test('choosing a cabinet goes STRAIGHT to READY (no name entry), and the name is unchanged by the whole trip', { timeout: T }, async () => {
    await tap(g.page, 'Enter', SETTLE);
    assert.equal(await readScreen(g.page), 'ready-screen', 'straight to READY');
    assert.equal(await read(g.page, '#ready-name'), 'DAD');
    assert.deepEqual(await names(g.page), ['OONA', 'DAD', 'GRAM']);
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });

  test('from the arcade, Escape returns to the picker (the ordinary route is a loop, not a trap)', { timeout: T }, async () => {
    await tap(g.page, 'Escape', SETTLE);       // READY -> arcade
    assert.equal(await readScreen(g.page), 'select-screen');
    await tap(g.page, 'Escape', SETTLE);       // arcade -> picker
    assert.equal(await readScreen(g.page), 'slots-screen');
  });

  test('only the WOPR bypass lifts the gates: typed on READY it unlocks every cabinet', { timeout: T }, async () => {
    await tap(g.page, ' ');                     // resume (cursor game)
    assert.equal(await readScreen(g.page), 'ready-screen');
    await g.page.keyboard.type('wopr', { delay: 40 });
    await g.page.waitForTimeout(SETTLE);
    assert.equal(await readScreen(g.page), 'select-screen');
    const states = await cabinetStates(g.page);
    assert.ok(states.every((s) => !s.locked), 'WOPR lifts every lock');
  });
});

describe('INV-130 — Space on the attract title opens the picker when saved games exist', () => {
  let g;
  before(async () => { g = await boot(); });
  after(async () => { await g.stop(); });

  for (const key of [' ', 'Enter']) {
    test(`Escape from the picker lands on the attract title; ${key === ' ' ? 'Space' : 'Enter'} there opens CHOOSE YOUR GAME, never name entry`, { timeout: T }, async () => {
      if ((await readScreen(g.page)) !== 'slots-screen') {
        // return to the picker from wherever the previous case left us
        await tap(g.page, 'Escape'); await tap(g.page, 'Escape');
      }
      await tap(g.page, 'Escape', SETTLE);
      assert.equal(await readScreen(g.page), 'title-screen');
      assert.equal(await visible(g.page, '#name-setup'), false, 'the attract title has no live name field');
      await tap(g.page, key, SETTLE);
      assert.equal(await readScreen(g.page), 'slots-screen');
      assert.equal(await visible(g.page, '#name-setup'), false);
      assert.deepEqual(await names(g.page), ['OONA', 'DAD', 'GRAM'], 'no name changed');
    });
  }
});

// ── INV-131 ────────────────────────────────────────────────────────────────
describe('INV-131 — R RENAME is the only way a saved game\'s name changes', () => {
  let g;
  before(async () => { g = await boot({ active: 0 }); });
  after(async () => { await g.stop(); });

  test('the picker offers R RENAME in its hint line', async () => {
    const hint = await read(g.page, '#slots-hint');
    assert.match(hint, /R\s+RENAME/);
  });

  test('R opens the name field labelled RENAME THIS GAME, pre-filled with the HIGHLIGHTED game\'s current name', { timeout: T }, async () => {
    await tap(g.page, '2');                       // highlight DAD (the active game is OONA)
    await tap(g.page, 'r', SETTLE);
    assert.equal(await readScreen(g.page), 'title-screen');
    assert.equal(await visible(g.page, '#name-setup'), true);
    assert.match(await read(g.page, '#name-label'), /RENAME THIS GAME/);
    assert.equal(await g.page.$eval('#player-name-input', (el) => el.value), 'DAD');
  });

  test('Return saves the new name for THAT game only; back on the picker; the active game is unchanged', { timeout: T }, async () => {
    await g.page.keyboard.type('POP', { delay: 40 });   // the pre-filled name is selected: typing replaces it
    assert.equal(await g.page.$eval('#player-name-input', (el) => el.value), 'POP');
    await tap(g.page, 'Enter', SETTLE);
    assert.equal(await readScreen(g.page), 'slots-screen', 'both rename exits return to the picker');
    assert.deepEqual(await names(g.page), ['OONA', 'POP', 'GRAM']);
    assert.equal(await active(g.page), 0, 'renaming never changes which game is active');
    const rows = await readSlotsList(g.page);
    assert.deepEqual(rows.map((r) => r.name), ['OONA', 'POP', 'GRAM']);
    assert.equal(rows.findIndex((r) => r.selected), 1, 'the renamed game stays highlighted');
  });

  test('Escape backs out with the name unchanged — and also returns to the picker', { timeout: T }, async () => {
    await tap(g.page, '3');                       // GRAM
    await tap(g.page, 'r', SETTLE);
    assert.match(await read(g.page, '#name-label'), /RENAME/);
    await g.page.keyboard.type('ZZZ', { delay: 40 });
    await tap(g.page, 'Escape', SETTLE);
    assert.equal(await readScreen(g.page), 'slots-screen');
    assert.deepEqual(await names(g.page), ['OONA', 'POP', 'GRAM']);
    assert.equal(await active(g.page), 0);
  });

  test('R on the ＋ NEW GAME row does nothing (there is no game to rename)', { timeout: T }, async () => {
    await toNewGameRow(g.page);
    await tap(g.page, 'r', SETTLE);
    assert.equal(await readScreen(g.page), 'slots-screen');
    assert.equal(await visible(g.page, '#name-setup'), false);
  });

  test('renaming a game and then renaming it back works (the rename path is repeatable, not one-shot)', { timeout: T }, async () => {
    await tap(g.page, '2');
    await tap(g.page, 'r', SETTLE);
    await g.page.keyboard.type('DAD', { delay: 40 });
    await tap(g.page, 'Enter', SETTLE);
    assert.deepEqual(await names(g.page), ['OONA', 'DAD', 'GRAM']);
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });
});

describe('INV-131 — the original bug ("typing wopr then Return… renamed DAD to WOPR") cannot happen', () => {
  let g;
  before(async () => { g = await boot({ games: [{ name: 'DAD', furthestLevel: 3 }], active: 0 }); });
  after(async () => { await g.stop(); });

  test('READY -> Escape -> type wopr -> Return: the game is still DAD and no WOPR game exists', { timeout: T }, async () => {
    await tap(g.page, ' ');                                  // resume DAD onto READY
    assert.equal(await readScreen(g.page), 'ready-screen');
    await tap(g.page, 'Escape', SETTLE);                     // the route that used to open a name field
    await g.page.keyboard.type('wopr', { delay: 40 });
    await tap(g.page, 'Enter', SETTLE);
    assert.deepEqual(await names(g.page), ['DAD'], 'the saved game kept its name and nothing else was created');
  });

  test('the same typing on the attract title (the magic word) opens the arcade and renames nothing', { timeout: T }, async () => {
    // back to the attract title
    for (let i = 0; i < 4; i++) {
      const s = await readScreen(g.page);
      if (s === 'title-screen') break;
      await tap(g.page, 'Escape', SETTLE);
    }
    assert.equal(await readScreen(g.page), 'title-screen');
    await g.page.keyboard.type('wopr', { delay: 40 });
    await g.page.waitForTimeout(SETTLE);
    assert.equal(await readScreen(g.page), 'select-screen');
    await tap(g.page, 'Enter', SETTLE);                      // pick a cabinet
    assert.equal(await readScreen(g.page), 'ready-screen');
    assert.equal(await read(g.page, '#ready-name'), 'DAD');
    assert.deepEqual(await names(g.page), ['DAD']);
  });
});

describe('INV-131 — Escape out of new-game name entry creates nothing', () => {
  let g;
  before(async () => { g = await boot(); });
  after(async () => { await g.stop(); });

  test('N opens name entry labelled for a NEW game (not RENAME)', { timeout: T }, async () => {
    await tap(g.page, 'n', SETTLE);
    assert.equal(await readScreen(g.page), 'title-screen');
    assert.equal(await visible(g.page, '#name-setup'), true);
    const label = await read(g.page, '#name-label');
    assert.match(label, /ENTER YOUR NAME/);
    assert.ok(!/RENAME/.test(label), 'the two jobs are labelled apart — that label is the fix');
  });

  test('typing a name then Escape returns to the picker with no new game and no changed names', { timeout: T }, async () => {
    await g.page.keyboard.type('ZED', { delay: 40 });
    await tap(g.page, 'Escape', SETTLE);
    assert.equal(await readScreen(g.page), 'slots-screen');
    assert.deepEqual(await names(g.page), ['OONA', 'DAD', 'GRAM']);
    assert.equal((await readSlotsList(g.page)).length, 3);
  });

  test('contrast: the same flow confirmed with Return DOES create the game (so the Escape case above is not vacuous)', { timeout: T }, async () => {
    await tap(g.page, 'n', SETTLE);
    await g.page.keyboard.type('ZED', { delay: 40 });
    await tap(g.page, 'Enter', SETTLE);
    assert.deepEqual(await names(g.page), ['OONA', 'DAD', 'GRAM', 'ZED']);
    assert.equal(await readScreen(g.page), 'ready-screen');
    assert.equal(await read(g.page, '#ready-name'), 'ZED');
  });
});

// ── INV-132 ────────────────────────────────────────────────────────────────
describe('INV-132 — the active game is unambiguous whenever a game starts', () => {
  let g;
  before(async () => {
    g = await boot({
      games: [{ name: 'OONA', furthestLevel: 12 }, { name: 'DAD', furthestLevel: 2 }],
      active: 0,
    });
  });
  after(async () => { await g.stop(); });

  test('Escape from the picker with a row highlighted makes THAT game active', { timeout: T }, async () => {
    assert.equal(await active(g.page), 0);
    await tap(g.page, 'ArrowDown');            // highlight DAD (do NOT resume it)
    await tap(g.page, 'Escape', SETTLE);
    assert.equal(await readScreen(g.page), 'title-screen');
    assert.equal(await active(g.page), 1, 'the highlighted game became the active one');
  });

  test('Escape on the ＋ NEW GAME row leaves the active game as it was', { timeout: T }, async () => {
    await tap(g.page, ' ', SETTLE);            // title -> picker
    assert.equal(await readScreen(g.page), 'slots-screen');
    await toNewGameRow(g.page);
    assert.equal(await g.page.evaluate(() => !!document.querySelector('#slots-list .slot-new.selected')), true);
    const before = await active(g.page);
    await tap(g.page, 'Escape', SETTLE);
    assert.equal(await active(g.page), before);
  });

  test('a level won through the WOPR shortcut is credited to the game the player last pointed at — and READY + HUD show its name', { timeout: 300_000 }, async () => {
    await tap(g.page, ' ', SETTLE);            // attract title -> picker
    assert.equal(await readScreen(g.page), 'slots-screen');
    await tap(g.page, '2', 150);               // point at DAD
    await tap(g.page, 'Escape', SETTLE);       // -> attract title, DAD adopted
    await g.page.keyboard.type('wopr', { delay: 40 });
    await g.page.waitForTimeout(SETTLE);
    assert.equal(await readScreen(g.page), 'select-screen');
    await tap(g.page, 'Enter', SETTLE);        // Level 1
    assert.equal(await readScreen(g.page), 'ready-screen');
    assert.equal(await read(g.page, '#ready-name'), 'DAD', 'READY shows the ACTIVE game\'s name');
    await tap(g.page, ' ', SETTLE);            // -> KNOW YOUR KEYS
    await tap(g.page, ' ', 700);               // -> the game
    assert.equal(await readScreen(g.page), 'game-screen');
    assert.equal(await read(g.page, '#hud-name'), 'DAD', 'the HUD shows the ACTIVE game\'s name');

    await winLevel(g.page);
    const slots = (await raw(g.page)).slots;
    assert.ok(slots[1].completed && slots[1].completed['1'], 'DAD (the game pointed at) is credited the win');
    assert.ok(!(slots[0].completed && slots[0].completed['1']), 'OONA (the game resumed earlier) is NOT credited');
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });
});

// ── INV-139 ────────────────────────────────────────────────────────────────
describe('INV-139 — the picker\'s ★ found / total counts the ARCADE bank only', () => {
  const arcadeIds = HISTORY_CARDS.filter((c) => !c.secret && c.level != null).map((c) => c.id);
  const wingIds = WING_CARDS.map((c) => c.id);
  const actIds = ACT_CARDS.map((c) => c.id);

  async function pickerCards(cards) {
    const g = await boot({ games: [{ name: 'OONA', furthestLevel: 25, cards }], active: 0 });
    try {
      assert.equal(await readScreen(g.page), 'slots-screen');
      return (await readSlotsList(g.page))[0].cards;
    } finally { await g.stop(); }
  }
  const norm = (s) => String(s).replace(/\s+/g, ' ').trim();

  test('the fixture is real: all three banks exist and are disjoint', () => {
    assert.ok(arcadeIds.length >= 10 && wingIds.length >= 1 && actIds.length >= 1);
    const all = [...HISTORY_CARDS, ...WING_CARDS, ...ACT_CARDS].map((c) => c.id);
    assert.equal(new Set(all).size, all.length, 'no id in two banks');
  });

  test('three arcade cards read "★ 3 / <TOTAL_CARDS>" — the denominator comes from the arcade bank, not a copied constant', { timeout: T }, async () => {
    assert.equal(norm(await pickerCards(arcadeIds.slice(0, 3))), `★ 3 / ${TOTAL_CARDS}`);
  });

  test('wing and act cards NEVER inflate the count: a save holding only those reads "★ 0 / <TOTAL_CARDS>"', { timeout: T }, async () => {
    assert.equal(norm(await pickerCards([...wingIds, ...actIds])), `★ 0 / ${TOTAL_CARDS}`);
  });

  test('mixing them in changes nothing: arcade 2 + every wing + every act card still reads 2', { timeout: T }, async () => {
    assert.equal(norm(await pickerCards([...arcadeIds.slice(0, 2), ...wingIds, ...actIds])), `★ 2 / ${TOTAL_CARDS}`);
  });

  test('a save holding every card of every bank can never read more than the arcade total', { timeout: T }, async () => {
    const everything = [...HISTORY_CARDS, ...WING_CARDS, ...ACT_CARDS].map((c) => c.id);
    const text = norm(await pickerCards(everything));
    const m = /★ (\d+) \/ (\d+)/.exec(text);
    assert.ok(m, `row text "${text}"`);
    assert.ok(Number(m[1]) <= Number(m[2]), `"${text}" — found must never exceed total (the CARD 63 OF 60 defect)`);
    assert.equal(Number(m[2]), TOTAL_CARDS);
  });

  test('a stale/unknown card id in a save is ignored, never counted', { timeout: T }, async () => {
    assert.equal(norm(await pickerCards(['no-such-card', arcadeIds[0]])), `★ 1 / ${TOTAL_CARDS}`);
  });
});
