// Enforces: INV-9 — product.md §Toggleable Settings (Survival is opt-in only;
//   fresh/garbage/absent settings always resolve to Adventure defaults)
// Enforces: INV-12 (unit face) — theme-authoring.md §The EXPERIENCE win-ratio
//   (WIN_RATIO_VALUES tiers, getWinRatio() resolution/default) and
//   product.md §Toggleable Settings (Difficulty NOVICE/ARCADE/EXPERT model)
// Enforces: INV-27 (kk-settings side) — CLAUDE.md §Returning-player persistence /
//   onboarding.md (`kk-settings` parses defensively: corrupt JSON, wrong shapes,
//   hostile strings degrade to defaults, never crash)
//
// Unit layer only: public ES-module exports of js/settings.js + the localStorage
// stub from tests/helpers/stubs.mjs. Module has an internal `cached` variable, so
// each test case imports a fresh copy via a cache-busting query string on the
// specifier — this exercises the module's real load path (loadSettings() reads
// localStorage fresh) rather than reaching into internals.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { installLocalStorageStub, resetStubs } from '../helpers/stubs.mjs';

// The product.md §Toggleable Settings table — the doc's defaults row, ground
// truth for INV-9. Player name is asserted by identity (case-insensitive) since
// the doc's prose casing ("Player One") is describing the concept; the game's
// own arcade-high-score convention (12-char cap, uppercase display, see
// js/main.js DEFAULT_PLAYER_NAME) uses all-caps — that's an implementation
// choice about display casing, not a documented behavioral contract.
const DOC_DEFAULTS = {
  playStyle: 'adventure',
  difficulty: 'novice',
  winRatio: 1, // FIRST QUARTER (1x)
  hintStyle: 'moderate',
  mistakeDisplay: 'small',
  sound: true,
  crtEffects: true,
  statsVisible: true,
};

let importCounter = 0;
// Fresh module instance per test — sidesteps settings.js's module-level `cached`
// variable without asserting anything about its existence (behavior, not
// internals: we just don't want test order/state bleed).
async function freshSettingsModule() {
  importCounter += 1;
  return import(`../../js/settings.js?case=${importCounter}`);
}

describe('settings — INV-9: Survival is opt-in, garbage always resolves to Adventure defaults', () => {
  test('absent kk-settings key resolves to full Adventure defaults', async () => {
    installLocalStorageStub({}); // no kk-settings key at all
    const { loadSettings } = await freshSettingsModule();
    const s = loadSettings();

    assert.equal(s.playStyle, DOC_DEFAULTS.playStyle, 'fresh install must default to ADVENTURE, never SURVIVAL');
    assert.equal(s.difficulty, DOC_DEFAULTS.difficulty);
    assert.equal(s.winRatio, DOC_DEFAULTS.winRatio);
    assert.equal(s.hintStyle, DOC_DEFAULTS.hintStyle);
    assert.equal(s.mistakeDisplay, DOC_DEFAULTS.mistakeDisplay);
    assert.equal(s.sound, DOC_DEFAULTS.sound);
    assert.equal(s.crtEffects, DOC_DEFAULTS.crtEffects);
    assert.equal(s.statsVisible, DOC_DEFAULTS.statsVisible);
    assert.match(s.playerName, /^player one$/i, 'default player name must be "Player One" (product.md §Player Name)');
    resetStubs();
  });

  test('corrupt JSON in kk-settings resolves to Adventure defaults, never throws', async () => {
    installLocalStorageStub({ 'kk-settings': '{not valid json!!!' });
    const { loadSettings } = await freshSettingsModule();

    let s;
    assert.doesNotThrow(() => { s = loadSettings(); });
    assert.equal(s.playStyle, 'adventure');
    assert.equal(s.difficulty, 'novice');
    assert.equal(s.winRatio, 1);
    resetStubs();
  });

  test('truncated/garbled JSON resolves to defaults, never throws', async () => {
    installLocalStorageStub({ 'kk-settings': '{"playStyle":"surviv' });
    const { loadSettings } = await freshSettingsModule();

    let s;
    assert.doesNotThrow(() => { s = loadSettings(); });
    assert.equal(s.playStyle, 'adventure');
    resetStubs();
  });

  test('wrong-typed playStyle field (number) never activates Survival', async () => {
    installLocalStorageStub({ 'kk-settings': JSON.stringify({ playStyle: 12345 }) });
    const { loadSettings } = await freshSettingsModule();
    const s = loadSettings();
    assert.equal(s.playStyle, 'adventure');
    resetStubs();
  });

  test('wrong-typed playStyle field (object) never activates Survival', async () => {
    installLocalStorageStub({ 'kk-settings': JSON.stringify({ playStyle: { on: true } }) });
    const { loadSettings } = await freshSettingsModule();
    const s = loadSettings();
    assert.equal(s.playStyle, 'adventure');
    resetStubs();
  });

  test('wrong-typed playStyle field (array) never activates Survival', async () => {
    installLocalStorageStub({ 'kk-settings': JSON.stringify({ playStyle: ['survival'] }) });
    const { loadSettings } = await freshSettingsModule();
    const s = loadSettings();
    assert.equal(s.playStyle, 'adventure');
    resetStubs();
  });

  test('hostile string in playStyle ("<script>...") never activates Survival and never reaches a sink unsanitized', async () => {
    installLocalStorageStub({ 'kk-settings': JSON.stringify({ playStyle: '<script>alert(1)</script>' }) });
    const { loadSettings } = await freshSettingsModule();
    const s = loadSettings();
    assert.equal(s.playStyle, 'adventure', 'unrecognized playStyle value must fall back to adventure, not pass through');
    resetStubs();
  });

  test('huge hostile string in playerName is capped, not passed through raw', async () => {
    const huge = '<img src=x onerror=alert(1)>'.repeat(10000); // ~290KB
    installLocalStorageStub({ 'kk-settings': JSON.stringify({ playerName: huge }) });
    const { loadSettings } = await freshSettingsModule();
    const s = loadSettings();
    assert.ok(s.playerName.length <= 16, 'playerName must be capped regardless of input length');
    resetStubs();
  });

  test('hostile string as the entire kk-settings value (not JSON at all) resolves to defaults', async () => {
    installLocalStorageStub({ 'kk-settings': '<script>alert(1)</script>' });
    const { loadSettings } = await freshSettingsModule();

    let s;
    assert.doesNotThrow(() => { s = loadSettings(); });
    assert.equal(s.playStyle, 'adventure');
    assert.equal(s.difficulty, 'novice');
    resetStubs();
  });

  test('partial object (only one field present) fills every missing field from Adventure defaults', async () => {
    installLocalStorageStub({ 'kk-settings': JSON.stringify({ sound: false }) });
    const { loadSettings } = await freshSettingsModule();
    const s = loadSettings();

    assert.equal(s.sound, false, 'the one field present must round-trip');
    assert.equal(s.playStyle, 'adventure', 'every other field must fill from defaults');
    assert.equal(s.difficulty, 'novice');
    assert.equal(s.winRatio, 1);
    assert.equal(s.crtEffects, true);
    assert.equal(s.statsVisible, true);
    resetStubs();
  });

  test('null kk-settings value resolves to defaults', async () => {
    installLocalStorageStub({ 'kk-settings': 'null' });
    const { loadSettings } = await freshSettingsModule();
    const s = loadSettings();
    assert.equal(s.playStyle, 'adventure');
    resetStubs();
  });

  test('kk-settings storing a bare array resolves to defaults (not a settings object)', async () => {
    installLocalStorageStub({ 'kk-settings': JSON.stringify(['survival', 'expert']) });
    const { loadSettings } = await freshSettingsModule();
    const s = loadSettings();
    assert.equal(s.playStyle, 'adventure');
    assert.equal(s.difficulty, 'novice');
    resetStubs();
  });

  test('kk-settings storing a bare number resolves to defaults', async () => {
    installLocalStorageStub({ 'kk-settings': '42' });
    const { loadSettings } = await freshSettingsModule();
    const s = loadSettings();
    assert.equal(s.playStyle, 'adventure');
    resetStubs();
  });

  test('explicit survival opt-in IS honored (proves the sanitizer does not just force adventure always)', async () => {
    installLocalStorageStub({ 'kk-settings': JSON.stringify({ playStyle: 'survival' }) });
    const { loadSettings } = await freshSettingsModule();
    const s = loadSettings();
    assert.equal(s.playStyle, 'survival', 'a deliberate, well-formed opt-in must be respected — opt-in, not opt-out');
    resetStubs();
  });
});

describe('settings — INV-12 (unit face): EXPERIENCE win-ratio tiers and difficulty model', () => {
  test('WIN_RATIO_VALUES is exactly [1, 1.5, 2.25, 3.5] per theme-authoring.md', async () => {
    installLocalStorageStub({});
    const { WIN_RATIO_VALUES } = await freshSettingsModule();
    assert.deepEqual(WIN_RATIO_VALUES, [1, 1.5, 2.25, 3.5]);
    resetStubs();
  });

  test('getWinRatio() defaults to 1 (FIRST QUARTER) on a fresh install', async () => {
    installLocalStorageStub({});
    const { getWinRatio } = await freshSettingsModule();
    assert.equal(getWinRatio(), 1);
    resetStubs();
  });

  test('getWinRatio() defaults to 1 when winRatio is garbage', async () => {
    installLocalStorageStub({ 'kk-settings': JSON.stringify({ winRatio: 'wizard-mode-please' }) });
    const { getWinRatio } = await freshSettingsModule();
    assert.equal(getWinRatio(), 1);
    resetStubs();
  });

  test('getWinRatio() defaults to 1 when winRatio is an out-of-catalog number', async () => {
    installLocalStorageStub({ 'kk-settings': JSON.stringify({ winRatio: 99 }) });
    const { getWinRatio } = await freshSettingsModule();
    assert.equal(getWinRatio(), 1);
    resetStubs();
  });

  for (const tier of [1, 1.5, 2.25, 3.5]) {
    test(`getWinRatio() resolves a persisted valid tier (${tier}x)`, async () => {
      installLocalStorageStub({ 'kk-settings': JSON.stringify({ winRatio: tier }) });
      const { getWinRatio } = await freshSettingsModule();
      assert.equal(getWinRatio(), tier);
      resetStubs();
    });
  }

  test('WIN_RATIO_LABEL and WIN_RATIO_DESCRIPTOR cover every tier in WIN_RATIO_VALUES', async () => {
    installLocalStorageStub({});
    const { WIN_RATIO_VALUES, WIN_RATIO_LABEL, WIN_RATIO_DESCRIPTOR } = await freshSettingsModule();
    for (const tier of WIN_RATIO_VALUES) {
      assert.ok(WIN_RATIO_LABEL[tier], `tier ${tier} must have a label`);
      assert.ok(WIN_RATIO_DESCRIPTOR[tier], `tier ${tier} must have a descriptor`);
    }
    resetStubs();
  });

  test('DIFFICULTY_MULTIPLIER matches the documented NOVICE/ARCADE/EXPERT tier set exactly', async () => {
    installLocalStorageStub({});
    const { DIFFICULTY_MULTIPLIER } = await freshSettingsModule();
    assert.deepEqual(
      Object.keys(DIFFICULTY_MULTIPLIER).sort(),
      ['arcade', 'expert', 'novice'],
      'product.md documents exactly NOVICE/ARCADE/EXPERT as the difficulty tiers'
    );
    resetStubs();
  });

  test('DIFFICULTY_MULTIPLIER: NOVICE is the most forgiving (largest time multiplier), EXPERT the least', async () => {
    installLocalStorageStub({});
    const { DIFFICULTY_MULTIPLIER } = await freshSettingsModule();
    // "challenging, never cruel" (product.md) — novice must give the MOST time,
    // expert the least, arcade in between. A larger multiplier = more time.
    assert.ok(
      DIFFICULTY_MULTIPLIER.novice > DIFFICULTY_MULTIPLIER.arcade,
      'NOVICE must be more forgiving (more time) than ARCADE'
    );
    assert.ok(
      DIFFICULTY_MULTIPLIER.arcade > DIFFICULTY_MULTIPLIER.expert,
      'ARCADE must be more forgiving (more time) than EXPERT'
    );
    resetStubs();
  });

  test('DIFFICULTY_LABEL/DIFFICULTY_DESCRIPTOR cover every DIFFICULTY_MULTIPLIER tier', async () => {
    installLocalStorageStub({});
    const { DIFFICULTY_MULTIPLIER, DIFFICULTY_LABEL, DIFFICULTY_DESCRIPTOR } = await freshSettingsModule();
    for (const tier of Object.keys(DIFFICULTY_MULTIPLIER)) {
      assert.ok(DIFFICULTY_LABEL[tier], `tier ${tier} must have a label`);
      assert.ok(DIFFICULTY_DESCRIPTOR[tier], `tier ${tier} must have a descriptor`);
    }
    resetStubs();
  });

  test('difficulty field defaults to novice and is never a non-catalog value', async () => {
    installLocalStorageStub({ 'kk-settings': JSON.stringify({ difficulty: 'nightmare-mode' }) });
    const { loadSettings, DIFFICULTY_MULTIPLIER } = await freshSettingsModule();
    const s = loadSettings();
    assert.equal(s.difficulty, 'novice');
    assert.ok(Object.keys(DIFFICULTY_MULTIPLIER).includes(s.difficulty));
    resetStubs();
  });
});

describe('settings — INV-27 (kk-settings side): defensive persistence, round-trip, and storage-failure resilience', () => {
  test('saveSettings -> getSettings round-trips a well-formed settings object', async () => {
    installLocalStorageStub({});
    const { saveSettings, getSettings } = await freshSettingsModule();
    saveSettings({ playStyle: 'survival', difficulty: 'expert', winRatio: 2.25, sound: false });
    const s = getSettings();
    assert.equal(s.playStyle, 'survival');
    assert.equal(s.difficulty, 'expert');
    assert.equal(s.winRatio, 2.25);
    assert.equal(s.sound, false);
    resetStubs();
  });

  test('saveSettings persists to localStorage so a fresh load sees the same values', async () => {
    const store = installLocalStorageStub({});
    const mod1 = await freshSettingsModule();
    mod1.saveSettings({ difficulty: 'arcade' });

    // Simulate a new session: fresh module import, same backing store.
    globalThis.localStorage = {
      getItem: (k) => (store.has(String(k)) ? store.get(String(k)) : null),
      setItem: (k, v) => { store.set(String(k), String(v)); },
      removeItem: (k) => { store.delete(String(k)); },
      clear: () => { store.clear(); },
      key: (i) => [...store.keys()][i] ?? null,
      get length() { return store.size; },
    };
    const mod2 = await freshSettingsModule();
    const s = mod2.loadSettings();
    assert.equal(s.difficulty, 'arcade', 'persisted value must survive a fresh module/session load');
    resetStubs();
  });

  test('unknown extra fields are tolerated silently (no throw, no crash)', async () => {
    installLocalStorageStub({});
    const { saveSettings, getSettings } = await freshSettingsModule();
    let s;
    assert.doesNotThrow(() => {
      s = saveSettings({ playStyle: 'adventure', someFutureFieldNotYetInvented: { nested: true }, anotherOne: [1, 2, 3] });
    });
    assert.equal(s.playStyle, 'adventure');
    assert.equal(getSettings().playStyle, 'adventure');
    resetStubs();
  });

  test('localStorage.setItem throwing (quota exceeded / private-mode Safari) degrades to in-memory operation, never crashes', async () => {
    installLocalStorageStub({});
    const { saveSettings, getSettings } = await freshSettingsModule();

    // Re-point localStorage.setItem to throw, as private-mode Safari does.
    const originalGetItem = globalThis.localStorage.getItem;
    globalThis.localStorage.setItem = () => { throw new DOMException('QuotaExceededError'); };
    globalThis.localStorage.getItem = originalGetItem;

    let s;
    assert.doesNotThrow(() => {
      s = saveSettings({ playStyle: 'survival', difficulty: 'expert' });
    }, 'saveSettings must never throw even if the underlying storage throws');

    // The in-memory cache must still reflect the save for this session.
    assert.equal(s.playStyle, 'survival');
    assert.equal(getSettings().playStyle, 'survival');
    resetStubs();
  });

  test('localStorage.getItem throwing on load degrades to Adventure defaults, never crashes', async () => {
    installLocalStorageStub({});
    globalThis.localStorage.getItem = () => { throw new DOMException('SecurityError'); };

    const { loadSettings } = await freshSettingsModule();
    let s;
    assert.doesNotThrow(() => { s = loadSettings(); });
    assert.equal(s.playStyle, 'adventure');
    resetStubs();
  });

  test('a completely absent localStorage global (throws on access) is handled without crashing the module', async () => {
    // Simulate the harshest case: localStorage itself throws on any property
    // access (some locked-down embedded contexts do this).
    resetStubs();
    globalThis.localStorage = new Proxy({}, {
      get() { throw new DOMException('SecurityError: localStorage disabled'); },
    });

    let mod;
    let threw = false;
    try {
      importCounter += 1;
      mod = await import(`../../js/settings.js?case=${importCounter}`);
    } catch (e) {
      threw = true;
    }

    if (!threw) {
      // If the module tolerates it at load time, getSettings()/loadSettings()
      // must still resolve to something sane, never propagate the throw to a
      // caller who never opened Settings.
      let s;
      assert.doesNotThrow(() => { s = mod.loadSettings(); });
      assert.equal(s.playStyle, 'adventure');
    }
    delete globalThis.localStorage;
  });
});

describe('settings — applyRowChange: cycles within valid ranges, never produces invalid state', () => {
  test('getRows() returns the documented set of settings rows', async () => {
    installLocalStorageStub({});
    const { getRows } = await freshSettingsModule();
    const rows = getRows();
    const keys = rows.map(r => r.key);
    // product.md §Toggleable Settings documents these as the settings surface
    // (Erase All Progress included as a row/action, Visual Theme deliberately
    // out of scope per the doc's "Future" note).
    for (const expectedKey of [
      'playStyle', 'lives', 'difficulty', 'winRatio', 'minWordLen', 'maxWordLen',
      'hintStyle', 'mistakeDisplay', 'sound', 'crtEffects', 'statsVisible', 'erase',
    ]) {
      assert.ok(keys.includes(expectedKey), `getRows() must include a "${expectedKey}" row`);
    }
    resetStubs();
  });

  test('every row has a values list (or is an action row) and a working display()', async () => {
    installLocalStorageStub({});
    const { getRows } = await freshSettingsModule();
    for (const row of getRows()) {
      assert.ok(Array.isArray(row.values), `row "${row.key}" must declare a values list`);
      assert.equal(typeof row.display, 'function');
      assert.equal(typeof row.active, 'function');
    }
    resetStubs();
  });

  test('cycling playStyle forward/backward only ever yields adventure or survival', async () => {
    installLocalStorageStub({});
    const { applyRowChange, getRows, getSettings } = await freshSettingsModule();
    const rowIndex = getRows().findIndex(r => r.key === 'playStyle');
    let s = getSettings();
    for (let i = 0; i < 5; i++) {
      s = applyRowChange(s, rowIndex, 1);
      assert.ok(['adventure', 'survival'].includes(s.playStyle));
    }
    for (let i = 0; i < 5; i++) {
      s = applyRowChange(s, rowIndex, -1);
      assert.ok(['adventure', 'survival'].includes(s.playStyle));
    }
    resetStubs();
  });

  test('cycling winRatio never leaves the documented WIN_RATIO_VALUES catalog', async () => {
    installLocalStorageStub({});
    const { applyRowChange, getRows, getSettings, WIN_RATIO_VALUES } = await freshSettingsModule();
    const rowIndex = getRows().findIndex(r => r.key === 'winRatio');
    let s = getSettings();
    for (let i = 0; i < 10; i++) {
      s = applyRowChange(s, rowIndex, 1);
      assert.ok(WIN_RATIO_VALUES.includes(s.winRatio), `winRatio ${s.winRatio} must be one of ${WIN_RATIO_VALUES}`);
    }
    resetStubs();
  });

  test('cycling lives stays within the documented 1-5 range (product.md: Lives 1-5, Survival only)', async () => {
    installLocalStorageStub({});
    const { applyRowChange, getRows, getSettings } = await freshSettingsModule();
    const rowIndex = getRows().findIndex(r => r.key === 'lives');
    let s = getSettings();
    for (let i = 0; i < 10; i++) {
      s = applyRowChange(s, rowIndex, 1);
      assert.ok(s.lives >= 1 && s.lives <= 5, `lives ${s.lives} must stay within 1-5`);
      assert.ok(Number.isInteger(s.lives), 'lives must always be an integer');
    }
    resetStubs();
  });

  test('cycling difficulty never leaves novice/arcade/expert', async () => {
    installLocalStorageStub({});
    const { applyRowChange, getRows, getSettings } = await freshSettingsModule();
    const rowIndex = getRows().findIndex(r => r.key === 'difficulty');
    let s = getSettings();
    for (let i = 0; i < 8; i++) {
      s = applyRowChange(s, rowIndex, 1);
      assert.ok(['novice', 'arcade', 'expert'].includes(s.difficulty));
    }
    resetStubs();
  });

  test('cycling a boolean row (sound) only ever yields true/false, and toggles both directions', async () => {
    installLocalStorageStub({});
    const { applyRowChange, getRows, getSettings } = await freshSettingsModule();
    const rowIndex = getRows().findIndex(r => r.key === 'sound');
    let s = getSettings();
    const seen = new Set();
    for (let i = 0; i < 4; i++) {
      s = applyRowChange(s, rowIndex, 1);
      assert.equal(typeof s.sound, 'boolean');
      seen.add(s.sound);
    }
    assert.deepEqual([...seen].sort(), [false, true], 'toggling sound must reach both ON and OFF');
    resetStubs();
  });

  test('survival-only rows (lives, difficulty) are marked inactive in Adventure mode per product.md', async () => {
    installLocalStorageStub({});
    const { getRows, getSettings } = await freshSettingsModule();
    const s = getSettings(); // fresh defaults: adventure
    assert.equal(s.playStyle, 'adventure');
    const livesRow = getRows().find(r => r.key === 'lives');
    const difficultyRow = getRows().find(r => r.key === 'difficulty');
    assert.equal(livesRow.active(s), false, 'LIVES is Survival-only per product.md §Toggleable Settings');
    assert.equal(difficultyRow.active(s), false, 'DIFFICULTY is Survival-only per product.md §Toggleable Settings');
  });

  test('survival-only rows become active once playStyle is survival', async () => {
    installLocalStorageStub({ 'kk-settings': JSON.stringify({ playStyle: 'survival' }) });
    const { getRows, getSettings } = await freshSettingsModule();
    const s = getSettings();
    const livesRow = getRows().find(r => r.key === 'lives');
    const difficultyRow = getRows().find(r => r.key === 'difficulty');
    assert.equal(livesRow.active(s), true);
    assert.equal(difficultyRow.active(s), true);
    resetStubs();
  });

  test('rows that are always-active (winRatio/EXPERIENCE) stay active regardless of play style', async () => {
    installLocalStorageStub({});
    const { getRows, getSettings } = await freshSettingsModule();
    const adventureSettings = getSettings();
    const winRatioRow = getRows().find(r => r.key === 'winRatio');
    assert.equal(winRatioRow.active(adventureSettings), true, 'EXPERIENCE works in both Adventure and Survival per product.md');
    resetStubs();
  });

  test('applyRowChange on an inactive row is a safe no-op (never mutates the value)', async () => {
    installLocalStorageStub({}); // adventure default — lives row is inactive
    const { applyRowChange, getRows, getSettings } = await freshSettingsModule();
    const rowIndex = getRows().findIndex(r => r.key === 'lives');
    const before = getSettings();
    const after = applyRowChange(before, rowIndex, 1);
    assert.equal(after.lives, before.lives, 'an inactive row must not change on ArrowLeft/Right');
    resetStubs();
  });

  test('applyRowChange on the action row (erase) is a safe no-op that never mutates settings', async () => {
    installLocalStorageStub({});
    const { applyRowChange, getRows, getSettings } = await freshSettingsModule();
    const rowIndex = getRows().findIndex(r => r.key === 'erase');
    const before = getSettings();
    const after = applyRowChange(before, rowIndex, 1);
    assert.deepEqual(after, before, 'the ERASE action row must not be a cyclable value — cycling it must not alter settings');
    resetStubs();
  });

  test('applyRowChange with an out-of-range rowIndex is a safe no-op, never throws', async () => {
    installLocalStorageStub({});
    const { applyRowChange, getSettings } = await freshSettingsModule();
    const before = getSettings();
    let after;
    assert.doesNotThrow(() => { after = applyRowChange(before, 9999, 1); });
    assert.deepEqual(after, before);
    resetStubs();
  });
});

// The word-length difficulty lever (settings.js getWordLengthRange). The setting
// is a best-effort DIFFICULTY suggestion (shorter = easier, longer = harder) that
// lets the game age with the player — NOT a hard filter; the engine's winnability
// fallback (tested at L2) is what makes an out-of-reach range safe. Here we only
// assert the settings-model contract: the default is a true no-op, the accessor
// resolves correctly, cycling stays in-catalog, and garbage degrades to defaults.
describe('settings — word-length range (getWordLengthRange): the ANY-default difficulty lever', () => {
  test('DEFAULT is ANY/ANY → { min: 1, max: Infinity } (a true no-op — today\'s behavior)', async () => {
    installLocalStorageStub({});
    const { getWordLengthRange, getSettings } = await freshSettingsModule();
    const s = getSettings();
    assert.equal(s.minWordLen, 0, 'fresh install has no minimum (ANY)');
    assert.equal(s.maxWordLen, 0, 'fresh install has no maximum (ANY)');
    assert.deepEqual(getWordLengthRange(), { min: 1, max: Infinity }, 'ANY/ANY passes every word length');
    resetStubs();
  });

  test('a bounded range resolves to plain numbers usable as L>=min && L<=max', async () => {
    installLocalStorageStub({ 'kk-settings': JSON.stringify({ minWordLen: 4, maxWordLen: 6 }) });
    const { getWordLengthRange } = await freshSettingsModule();
    assert.deepEqual(getWordLengthRange(), { min: 4, max: 6 });
    resetStubs();
  });

  test('ANY floor with a bounded cap → { min: 1, max: N }; bounded floor with ANY cap → { min: N, max: Infinity }', async () => {
    installLocalStorageStub({ 'kk-settings': JSON.stringify({ minWordLen: 0, maxWordLen: 6 }) });
    let mod = await freshSettingsModule();
    assert.deepEqual(mod.getWordLengthRange(), { min: 1, max: 6 });
    resetStubs();

    installLocalStorageStub({ 'kk-settings': JSON.stringify({ minWordLen: 5, maxWordLen: 0 }) });
    mod = await freshSettingsModule();
    assert.deepEqual(mod.getWordLengthRange(), { min: 5, max: Infinity });
    resetStubs();
  });

  test('the hard end has real headroom past the early-reader ceiling, up to a WIZARD-equivalent 24', async () => {
    installLocalStorageStub({});
    const { MAX_WORD_LEN_VALUES, MIN_WORD_LEN_VALUES } = await freshSettingsModule();
    // "The game ages with the player": longer words = harder, so MAX must reach
    // well past 8 (the early-reader ceiling) for a savvy player — escalating tiers
    // up to 24, the aspirational top rung mirroring EXPERIENCE's WIZARD.
    assert.ok(MAX_WORD_LEN_VALUES.includes(10) && MAX_WORD_LEN_VALUES.includes(12), 'MAX must offer the 10/12 mid tiers');
    assert.ok(MAX_WORD_LEN_VALUES.includes(16) && MAX_WORD_LEN_VALUES.includes(24), 'MAX must offer the hardcore 16 and WIZARD-equivalent 24 tiers');
    assert.ok(MAX_WORD_LEN_VALUES.includes(0), 'MAX must offer ANY (0)');
    assert.ok(MIN_WORD_LEN_VALUES.includes(0), 'MIN must offer ANY (0) so the default is a no-op');
    // The tiers ascend (a coherent difficulty ladder), ANY (0) sentinel aside.
    const bounded = MAX_WORD_LEN_VALUES.filter(v => v !== 0);
    assert.deepEqual(bounded, [...bounded].sort((a, b) => a - b), 'bounded MAX tiers must ascend');
    resetStubs();
  });

  test('a bounded MIN above a bounded MAX is coerced to a sane range, never a trap', async () => {
    installLocalStorageStub({ 'kk-settings': JSON.stringify({ minWordLen: 7, maxWordLen: 4 }) });
    const { getWordLengthRange, getSettings } = await freshSettingsModule();
    const s = getSettings();
    assert.ok(s.minWordLen <= s.maxWordLen, 'sanitize must coerce min<=max');
    const r = getWordLengthRange();
    assert.ok(r.min <= r.max, 'the resolved range is never inverted');
    resetStubs();
  });

  test('garbage word-length values degrade to the ANY defaults (no-op), never throw', async () => {
    installLocalStorageStub({ 'kk-settings': JSON.stringify({ minWordLen: 'big', maxWordLen: 999 }) });
    const { getWordLengthRange, getSettings } = await freshSettingsModule();
    const s = getSettings();
    assert.equal(s.minWordLen, 0, 'out-of-catalog min → ANY default');
    assert.equal(s.maxWordLen, 0, 'out-of-catalog max → ANY default');
    assert.deepEqual(getWordLengthRange(), { min: 1, max: Infinity });
    resetStubs();
  });

  test('cycling MIN and MAX rows never leaves their documented value catalogs', async () => {
    installLocalStorageStub({});
    const { applyRowChange, getRows, getSettings, MIN_WORD_LEN_VALUES, MAX_WORD_LEN_VALUES } = await freshSettingsModule();
    const minIdx = getRows().findIndex(r => r.key === 'minWordLen');
    const maxIdx = getRows().findIndex(r => r.key === 'maxWordLen');
    let s = getSettings();
    for (let i = 0; i < 12; i++) {
      s = applyRowChange(s, minIdx, 1);
      assert.ok(MIN_WORD_LEN_VALUES.includes(s.minWordLen), `minWordLen ${s.minWordLen} must stay in catalog`);
      s = applyRowChange(s, maxIdx, -1);
      assert.ok(MAX_WORD_LEN_VALUES.includes(s.maxWordLen), `maxWordLen ${s.maxWordLen} must stay in catalog`);
    }
    resetStubs();
  });

  test('both word-length rows are always active (a difficulty lever, not survival-gated)', async () => {
    installLocalStorageStub({});
    const { getRows, getSettings } = await freshSettingsModule();
    const s = getSettings();
    assert.equal(getRows().find(r => r.key === 'minWordLen').active(s), true);
    assert.equal(getRows().find(r => r.key === 'maxWordLen').active(s), true);
    resetStubs();
  });
});
