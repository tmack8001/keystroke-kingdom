// Keystroke Kingdom — shared integration test driver
//
// The foundation every L2 (behavioral integration) test builds on. It boots the
// REAL game in a REAL headless Chromium, serving the repo itself over a Node
// static file server on an EPHEMERAL port (listen on 0 — never python, never a
// fixed port, never `.dev-url`; journal L9/L32). Tests drive the game through
// real key events and read only player-observable DOM state — never game
// internals — so a pure refactor that preserves behavior keeps them green
// (STRATEGY.md §2, the prime directive).
//
// It deliberately REUSES scripts/kk-playwright.js (the single source of truth for
// the chromium module path, launch + console-error wiring, and the
// title→name→ready→select→level navigation flow) via module.createRequire, rather
// than re-copying any of it.
//
// Usage:
//   import { startGame } from './helpers/game-driver.mjs';
//   const g = await startGame();               // boots to a served, blank page
//   try {
//     await g.toLevel(1);                       // fully into level 1's game screen
//     const { activeToken } = await readPrompt(g.page);
//     await press(g.page, activeToken);
//     await winLevel(g.page);
//     assert.equal(g.consoleErrors.length, 0);
//   } finally {
//     await g.stop();
//   }
//
// Every export is JSDoc'd because Wave 2 lanes build directly from these
// signatures.

import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize, extname } from 'node:path';

// Bridge to the CJS helper — reuse its chromium path + launch/console wiring +
// navigation flows. Requiring a CJS module from ESM is explicitly fine here.
const require = createRequire(import.meta.url);
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const kk = require(join(REPO_ROOT, 'scripts', 'kk-playwright.js'));

// ── Static file server (ephemeral port) ─────────────────────────────────────
// Minimal, dependency-free static server rooted at the repo. Serves the exact
// bytes the embedded Go build would, with correct Content-Type so ES modules
// load (browsers reject `application/octet-stream` for <script type=module>).
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.mov': 'video/quicktime',
};

/**
 * Start a Node static file server rooted at the repo, listening on an ephemeral
 * port (0). Resolves once listening with the concrete base URL and a close fn.
 * @param {string} [root=REPO_ROOT] directory to serve
 * @returns {Promise<{ baseUrl: string, close: () => Promise<void> }>}
 */
async function startStaticServer(root = REPO_ROOT) {
  const server = createServer(async (req, res) => {
    try {
      // Strip query/hash, decode, normalize; refuse path traversal out of root.
      let urlPath = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);

      // Mirror the real Go server's wordgen API when its optional Ollama backend
      // is unavailable: a clean 200 `{available:false}` (main.go handleHealth),
      // NOT a 404. This keeps the game on its designed static-fallback path with
      // ZERO console noise — a 404 here would be an inauthentic network error the
      // game never sees against its own server, polluting consoleErrors.
      if (urlPath === '/api/wordgen/health') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
          .end(JSON.stringify({ available: false, reason: 'ollama-unreachable' }));
        return;
      }
      if (urlPath === '/api/wordgen') {
        // wordgen disabled → empty word list, the client's fallback trigger.
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
          .end(JSON.stringify({ words: [] }));
        return;
      }
      if (urlPath === '/api/keyboard-story') {
        // L25 coda story generator with no Ollama → an empty batch (main.go
        // handleKeyboardStory), the client's fallback to the STATIC story bank.
        // A clean 200 (not a 404) keeps consoleErrors empty, just like the real
        // Go server behaves on a static host.
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
          .end(JSON.stringify({ stories: [] }));
        return;
      }

      if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
      const filePath = normalize(join(root, urlPath));
      if (!filePath.startsWith(root)) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      const body = await readFile(filePath);
      const type = CONTENT_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type }).end(body);
    } catch (err) {
      const code = err && err.code === 'ENOENT' ? 404 : 500;
      res.writeHead(code).end(code === 404 ? 'Not Found' : 'Server Error');
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const close = () => new Promise((resolve) => server.close(() => resolve()));
  return { baseUrl, close };
}

// ── Boot ────────────────────────────────────────────────────────────────────

/**
 * Boot the game: start an ephemeral-port static server for the repo, launch
 * headless chromium (reusing kk-playwright's module path + console-error
 * wiring), and — if any localStorage seed is given — install it via
 * `page.addInitScript` so it exists BEFORE any game script runs. The returned
 * page has NOT navigated to the game yet; call a navigation helper (`toTitle`,
 * `toLevel`, `coldOpenToTitle`, …). `consoleErrors` accumulates console errors
 * and uncaught page errors for the life of the page.
 *
 * @param {Object} [opts]
 * @param {Object<string,any>} [opts.localStorage] raw key→value seeds (values
 *   JSON-stringified if not already strings) applied before first script runs.
 * @param {Object} [opts.settings] sugar: seeded as JSON under 'kk-settings'.
 * @param {Object} [opts.progress] sugar: seeded as JSON under 'kk-progress'.
 * @param {{width:number,height:number}} [opts.viewport] default 1280×800.
 * @returns {Promise<{ page: import('playwright').Page,
 *                     browser: import('playwright').Browser,
 *                     baseUrl: string, consoleErrors: string[],
 *                     stop: () => Promise<void> }>}
 */
export async function startGame(opts = {}) {
  const { baseUrl, close: closeServer } = await startStaticServer();
  const { browser, page, consoleErrors } = await kk.launchPage(opts.viewport);

  // Assemble the localStorage seed. Sugar keys win nothing over an explicit
  // localStorage entry of the same name; explicit raw seeds take precedence.
  const seed = {};
  if (opts.settings !== undefined) seed['kk-settings'] = opts.settings;
  if (opts.progress !== undefined) seed['kk-progress'] = opts.progress;
  Object.assign(seed, opts.localStorage || {});

  const entries = Object.entries(seed).map(([k, v]) => [
    k,
    typeof v === 'string' ? v : JSON.stringify(v),
  ]);
  if (entries.length) {
    // addInitScript runs on every navigation BEFORE page scripts — so the seed
    // is present the instant js/main.js reads localStorage.
    await page.addInitScript((pairs) => {
      for (const [k, v] of pairs) window.localStorage.setItem(k, v);
    }, entries);
  }

  const stop = async () => {
    try { await browser.close(); } finally { await closeServer(); }
  };

  return { page, browser, baseUrl, consoleErrors, stop };
}

// ── Navigation ───────────────────────────────────────────────────────────────

const SETTLE_MS = 400; // scar tissue: idle a beat after nav; frame-0 errors hide

/**
 * Navigate to the game's title/attract screen from a fresh load (clears
 * localStorage first, so this is the "no saved progress" title). For a seeded
 * continue-screen boot, navigate to baseUrl directly instead of calling this.
 * @param {import('playwright').Page} page
 * @param {string} baseUrl
 */
export async function toTitle(page, baseUrl) {
  await page.goto(baseUrl);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(SETTLE_MS + 200);
  await page.click('body'); // focus the page for keyboard events
}

/**
 * Navigate to the WarGames level-select screen via the documented `wopr`
 * bypass (fast path reused from kk-playwright). Use this to reach a level
 * quickly; use the raw onboarding helpers when the name/continue flow itself is
 * under test.
 * @param {import('playwright').Page} page
 * @param {string} baseUrl
 */
export async function toSelect(page, baseUrl) {
  await kk.goToSelect(page, baseUrl);
  await page.waitForTimeout(SETTLE_MS);
}

/**
 * Navigate from the WarGames level-select screen (via the `wopr` bypass, which
 * also sets state.selectBypass — the same flag that unlocks the Act 6 back-wall
 * door regardless of curriculum progress, per cabinet-art.js `doorUnlocked`) all
 * the way to the door's focused sub-state, ready for Space to enter the text
 * world. Walks ArrowDown until the TEXT WORLDS wall is on screen (see
 * {@link walkToWingDoor}) instead of counting presses blind — a blind count
 * silently lands on the wrong wall when an act is added.
 * @param {import('playwright').Page} page
 * @param {string} baseUrl
 */
export async function toTextWorldDoor(page, baseUrl) {
  await toSelect(page, baseUrl);
  await walkToWingDoor(page, 'textworld');
}

/**
 * Press ArrowDown on the select screen until the named bonus-act wall is
 * showing (a `.select-door[data-door="<id>"]` machine is on screen), instead of
 * counting presses blind. A blind count silently lands on the wrong wall the
 * moment an act is added or a wing's unlock level moves; this reads the one
 * thing the player reads — which wall is on screen — and gives up loudly.
 * @param {import('playwright').Page} page
 * @param {string} doorId 'textworld' | 'speedway' | 'hardware'
 * @param {number} [maxPresses=12]
 */
export async function walkToWingDoor(page, doorId, maxPresses = 12) {
  const present = () => page.evaluate(
    (id) => !!document.querySelector(`#select-cabinets .select-door[data-door="${id}"]`), doorId);
  for (let i = 0; i < maxPresses; i++) {
    if (await present()) return;
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(150);
  }
  if (!(await present())) throw new Error(`walkToWingDoor: the ${doorId} wall never appeared after ${maxPresses} ArrowDown presses`);
}

/**
 * Boot a fresh load all the way into a level's game screen (1–25), using the
 * wopr bypass. Equivalent to `toGameFresh`. Idles a beat after arrival so
 * animation-time console errors surface.
 * @param {import('playwright').Page} page
 * @param {string} baseUrl
 * @param {number} n 1-indexed level across all acts (1–25)
 */
export async function toLevel(page, baseUrl, n) {
  await kk.goToLevel(page, baseUrl, n);
  await page.waitForTimeout(SETTLE_MS);
}

/**
 * Alias of {@link toLevel} — boot fresh into level `n`'s game screen. Named to
 * match TEST-PLAN.md's `toGameFresh(n)`.
 * @param {import('playwright').Page} page
 * @param {string} baseUrl
 * @param {number} n 1-indexed level (1–25)
 */
export async function toGameFresh(page, baseUrl, n) {
  return toLevel(page, baseUrl, n);
}

/**
 * RAW first-time onboarding: drive the real cold-open → title flow WITHOUT the
 * wopr bypass, landing on the title/attract screen ready for name entry. This
 * is the flow onboarding tests (INV-24) exercise. Clears localStorage so the
 * cold open (first-time) path is taken.
 * @param {import('playwright').Page} page
 * @param {string} baseUrl
 */
export async function coldOpenToTitle(page, baseUrl) {
  await page.goto(baseUrl);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(SETTLE_MS + 200);
  await page.click('body');
}

/**
 * RAW name entry: from the title/attract screen, drive the REAL name-entry
 * screen (NOT the wopr bypass). Presses Enter to reveal name entry, optionally
 * types a name (any key clears the pre-filled default per onboarding.md), then
 * confirms with Enter — landing on the ready screen. Passing `name` as null/
 * undefined confirms the default (keeps PLAYER ONE).
 * @param {import('playwright').Page} page
 * @param {string} [name] name to type; omit to keep the PLAYER ONE default
 */
export async function enterName(page, name) {
  await page.keyboard.press('Enter'); // reveal name entry (still title screen)
  await page.waitForTimeout(SETTLE_MS);
  if (name != null && name !== '') {
    // Any keypress clears the dimmed default; type the real characters.
    await page.keyboard.type(name, { delay: 30 });
    await page.waitForTimeout(120);
  }
  await page.keyboard.press('Enter'); // confirm -> ready screen
  await page.waitForTimeout(SETTLE_MS);
}

// ── Interaction ──────────────────────────────────────────────────────────────

/**
 * Press a single game token via a REAL keyboard event, honoring CLAUDE.md's
 * Engine input contract exactly:
 *  - an uppercase A–Z token is a Shift+letter chord (Shift held down);
 *  - `' '` (space) presses Space;
 *  - `'Backspace'` presses Backspace;
 *  - everything else (lowercase letters, digits, symbols like `;` `,` `-`)
 *    presses the literal key.
 * Pure modifier presses are the caller's business (see {@link press} with
 * 'Shift'); this maps a *pattern token* to keystrokes.
 * @param {import('playwright').Page} page
 * @param {string} token a pattern token or a raw key name ('Shift', 'Control', …)
 */
export async function press(page, token) {
  if (token === ' ') {
    await page.keyboard.press('Space');
    return;
  }
  if (token === 'Backspace') {
    await page.keyboard.press('Backspace');
    return;
  }
  if (/^[A-Z]$/.test(token)) {
    // Shift+letter exact-case chord.
    await pressChord(page, ['Shift'], token);
    return;
  }
  // Lowercase letter, digit, symbol, or a raw modifier/key name — press as-is.
  await page.keyboard.press(token);
}

/**
 * Press a chord: hold each modifier down, tap `key`, release the modifiers in
 * reverse. Modifier names are Playwright key names ('Shift', 'Control', 'Alt',
 * 'Meta'). `key` for a Shift'd letter should be the UPPERCASE letter so the
 * emitted `event.key` is exact-case (e.g. pressChord(page, ['Shift'], 'A')).
 * @param {import('playwright').Page} page
 * @param {string[]} mods modifier key names to hold
 * @param {string} key the key to tap while modifiers are held
 */
export async function pressChord(page, mods, key) {
  for (const m of mods) await page.keyboard.down(m);
  try {
    await page.keyboard.press(key);
  } finally {
    for (const m of [...mods].reverse()) await page.keyboard.up(m);
  }
}

/**
 * Type a string as a sequence of individual token presses through {@link press}
 * (so uppercase letters become Shift chords, and each char is a discrete game
 * keypress rather than a paste). For multi-char tokens like Space/Backspace,
 * call {@link press} directly per token instead.
 * @param {import('playwright').Page} page
 * @param {string} str characters to press one at a time
 */
export async function typeSequence(page, str) {
  for (const ch of str) await press(page, ch);
}

// ── Observable-state readers (DOM text only) ────────────────────────────────

// Displayed prompt glyphs that differ from the engine token (' '→'␣',
// Backspace→'⌫'); this reverses them so readPrompt reports the token the engine
// expects, not the on-screen glyph. Kept in sync with hud.js promptDisplay().
//
// The eighth key is DISPLAYED AS ITS OWN GLYPH `;` since 2026-10-30 (CLAUDE.md
// footnote, levels/act1.md Level 4; INV-140) — it used to be masked as `?`, and
// this map used to translate `?`→`;`. The `?`→`;` entry is deliberately KEPT so
// the driver accepts BOTH spellings and an old/new game can still be driven; it
// is NOT how INV-140 is asserted — that test reads the raw rendered text with
// `readPromptGlyphs`, which does no translation, so a regression that stands a
// `?` back in cannot hide behind this map.
const GLYPH_TO_TOKEN = { '?': ';', '␣': ' ', '⌫': 'Backspace' };

/**
 * Read the current prompt sequence from the `#prompt-sequence` DOM — the
 * player-visible surface hud.js renders. Returns the raw pattern tokens (glyphs
 * mapped back), the active index (the `.active` letter), and the active token.
 * Reading the rendered output, not any engine internal, keeps this refactor-safe.
 * @param {import('playwright').Page} page
 * @returns {Promise<{ tokens: string[], activeIndex: number,
 *                     activeToken: (string|null) }>}
 */
export async function readPrompt(page) {
  const raw = await page.evaluate(() => {
    const seq = document.getElementById('prompt-sequence');
    if (!seq) return null;
    const letters = [...seq.querySelectorAll('.prompt-letter')];
    return {
      displays: letters.map((el) => el.textContent),
      activeIndex: letters.findIndex((el) => el.classList.contains('active')),
    };
  });
  if (!raw) return { tokens: [], activeIndex: -1, activeToken: null };
  const tokens = raw.displays.map((d) => (d in GLYPH_TO_TOKEN ? GLYPH_TO_TOKEN[d] : d));
  const activeToken =
    raw.activeIndex >= 0 && raw.activeIndex < tokens.length ? tokens[raw.activeIndex] : null;
  return { tokens, activeIndex: raw.activeIndex, activeToken };
}

/**
 * The prompt letters EXACTLY as rendered (no glyph→token translation): what a
 * child actually sees on screen. Use this — not {@link readPrompt} — to assert
 * on the displayed mark for a key (INV-140: the eighth key shows `;`).
 * @param {import('playwright').Page} page
 * @returns {Promise<string[]>}
 */
export async function readPromptGlyphs(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('#prompt-sequence .prompt-letter')].map((el) => el.textContent));
}

/**
 * Read the HUD from the `#hud-*` elements. Each field is null when its line is
 * hidden/absent (Adventure hides accuracy/misses/wpm/quarters by default), so a
 * null value is itself an observable assertion ("no quarters line in Adventure").
 * `streak` is always present. Numeric fields are parsed to numbers; unparseable
 * → null.
 * @param {import('playwright').Page} page
 * @returns {Promise<{ streak:(number|null), accuracy:(number|null),
 *                     mistakes:(number|null), quarters:(number|null),
 *                     wpm:(number|null) }>}
 */
export async function readHUD(page) {
  return page.evaluate(() => {
    // A line counts as "shown" only if neither it nor an ancestor is .hidden.
    const shown = (el) => {
      for (let n = el; n; n = n.parentElement) {
        if (n.classList && n.classList.contains('hidden')) return false;
      }
      return true;
    };
    const num = (id, transform) => {
      const el = document.getElementById(id);
      if (!el) return null;
      // Walk to the enclosing .hud-line to honor line-level .hidden toggles.
      const line = el.closest('.hud-line') || el;
      if (!shown(line)) return null;
      const v = transform ? transform(el.textContent) : parseInt(el.textContent, 10);
      return Number.isNaN(v) ? null : v;
    };
    return {
      streak: num('hud-streak'),
      accuracy: num('hud-accuracy', (t) => parseInt(t, 10)), // "94%" -> 94
      mistakes: num('hud-mistakes'),
      // quarters value is "● ● ●" — count the filled dots.
      quarters: (() => {
        const el = document.getElementById('hud-quarters');
        if (!el) return null;
        const line = el.closest('.hud-line') || el;
        for (let n = line; n; n = n.parentElement) {
          if (n.classList && n.classList.contains('hidden')) return null;
        }
        const filled = (el.textContent.match(/●/g) || []).length;
        return filled;
      })(),
      wpm: num('hud-wpm', (t) => (t.trim() === '--' ? NaN : parseInt(t, 10))),
    };
  });
}

/**
 * Return the id of the currently visible `.screen` (the one without `.hidden`),
 * e.g. 'game-screen', 'title-screen', 'select-screen', 'ready-screen'. Returns
 * null if none is visible.
 * @param {import('playwright').Page} page
 * @returns {Promise<string|null>}
 */
export async function readScreen(page) {
  return page.evaluate(() => {
    const s = [...document.querySelectorAll('.screen')].find(
      (el) => !el.classList.contains('hidden'),
    );
    return s ? s.id : null;
  });
}

// ── Save slots (js/slots.js `kk-slots`) — seeding + reading ────────────────
// The single-global-save model was rebuilt 2026-07-19 into an unbounded, dynamic
// list of independent saved games ("CHOOSE YOUR GAME"). `kk-progress` is now
// ONLY a one-time legacy-migration input (js/slots.js `ensureMigrated`) — the
// game itself reads/writes exclusively through `kk-slots`, scoped to whichever
// game is ACTIVE. These helpers seed/read that real persisted shape directly
// (documented in js/slots.js's own header + STRATEGY.md INV-59/60/61) rather
// than reconstructing it from private module internals.

/**
 * Build a raw `kk-slots` localStorage seed value: an array of full game objects
 * (each `{ name, furthestLevel, completed, nameMoment, textWorlds, cards,
 * cardRotation }`, all fields optional — missing ones take the same fresh
 * defaults js/slots.js's own `createSlot` would) plus which index (if any) is
 * active. Pass to `startGame({ localStorage: { 'kk-slots': slotsSeed(...) } })`.
 * Sugar: `slotsSeed({ name, furthestLevel, completed, ... })` (no `games`) seeds
 * exactly ONE active game — the common case for most persistence tests.
 * @param {Object} [opts]
 * @param {Array<Object>} [opts.games] full list of game objects; overrides the
 *   single-game sugar fields below when provided.
 * @param {number|null} [opts.active] which index is active (default: 0 if any
 *   games exist, else null). Pass null explicitly for "no active game" (e.g. the
 *   WOPR dev-bypass-before-a-game-is-chosen scenario).
 * @param {string} [opts.name='PLAYER ONE']
 * @param {number} [opts.furthestLevel=1]
 * @param {Object} [opts.completed={}]
 * @param {Object|null} [opts.nameMoment=null]
 * @param {Object|any} [opts.textWorlds={}] (accepts a deliberately garbage value
 *   for tolerance tests — normalization happens inside the game, not here)
 * @param {string[]} [opts.cards=[]]
 * @param {Object} [opts.cardRotation={}]
 * @returns {{v:number, active:(number|null), slots:Array<Object>}}
 */
export function slotsSeed(opts = {}) {
  const {
    games,
    active,
    name = 'PLAYER ONE',
    furthestLevel = 1,
    completed = {},
    nameMoment = null,
    textWorlds = {},
    cards = [],
    cardRotation = {},
  } = opts;
  const slots = games || [{ name, furthestLevel, completed, nameMoment, textWorlds, cards, cardRotation }];
  const resolvedActive = active !== undefined ? active : (slots.length ? 0 : null);
  return { v: 1, active: resolvedActive, slots };
}

/**
 * Read the ACTIVE game's progress directly from `kk-slots` in localStorage —
 * the shape `Slots.getProgress()` returns (`{ furthestLevel, completed,
 * nameMoment, textWorlds }`). Returns null if there is no active game (absent/
 * corrupt `kk-slots`, or an active pointer that doesn't resolve to a real game —
 * both are the documented "no active slot" no-persistence path, js/slots.js's
 * own header comment) — mirrors `Slots.getProgress()`'s no-active-game default
 * shape being indistinguishable from "nothing was ever written" at this layer,
 * so callers polling for a specific completion should treat null the same as
 * "not yet".
 * @param {import('playwright').Page} page
 * @returns {Promise<{furthestLevel:number, completed:Object, nameMoment:(Object|null), textWorlds:Object}|null>}
 */
export async function readActiveSlotProgress(page) {
  return page.evaluate(() => {
    let raw;
    try { raw = JSON.parse(localStorage.getItem('kk-slots')); } catch (e) { return null; }
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.slots)) return null;
    const i = raw.active;
    const s = (Number.isInteger(i) && i >= 0 && i < raw.slots.length) ? raw.slots[i] : null;
    if (!s || typeof s !== 'object') return null;
    return {
      furthestLevel: s.furthestLevel,
      completed: s.completed,
      nameMoment: s.nameMoment,
      textWorlds: s.textWorlds,
    };
  });
}

/**
 * Read the slot picker's ("CHOOSE YOUR GAME") rendered game rows from
 * `#slots-list` — one entry per EXISTING game (the trailing "+ NEW GAME" row,
 * `.slot-new`, is excluded). Player-observable DOM only (js/ui/screens.js
 * `renderSlotsScreen`), never a game internal.
 * @param {import('playwright').Page} page
 * @returns {Promise<Array<{name:string, level:string, cards:string, selected:boolean}>>}
 */
export async function readSlotsList(page) {
  return page.evaluate(() => {
    const rows = [...document.querySelectorAll('#slots-list .slot-row:not(.slot-new)')];
    return rows.map((row) => ({
      name: row.querySelector('.slot-name')?.textContent ?? null,
      level: row.querySelector('.slot-level')?.textContent ?? null,
      cards: row.querySelector('.slot-cards')?.textContent ?? null,
      selected: row.classList.contains('selected'),
    }));
  });
}

/**
 * True when the slot picker's "+ NEW GAME" trailing row (`.slot-new`) is
 * currently the highlighted/selected row.
 * @param {import('playwright').Page} page
 * @returns {Promise<boolean>}
 */
export async function isNewGameRowSelected(page) {
  return page.evaluate(() => {
    const row = document.querySelector('#slots-list .slot-new');
    return !!row && row.classList.contains('selected');
  });
}

/**
 * True when the LEVEL COMPLETE overlay (`#complete-overlay`) is visible. Note
 * this appears AFTER the theme's victory animation window, not the instant the
 * last token is typed — {@link winLevel} waits for it.
 * @param {import('playwright').Page} page
 * @returns {Promise<boolean>}
 */
export async function isLevelCompleteVisible(page) {
  return page.evaluate(() => {
    const el = document.getElementById('complete-overlay');
    return !!el && !el.classList.contains('hidden');
  });
}

/**
 * True when the survival GAME OVER overlay (`#gameover-overlay`) is visible.
 * @param {import('playwright').Page} page
 * @returns {Promise<boolean>}
 */
export async function isGameOverVisible(page) {
  return page.evaluate(() => {
    const el = document.getElementById('gameover-overlay');
    return !!el && !el.classList.contains('hidden');
  });
}

// ── Winning a level at machine speed ────────────────────────────────────────

/**
 * Drive the current level to completion at machine speed: read the active
 * token, press it (honoring the token contract — uppercase ⇒ Shift chord, `' '`
 * ⇒ Space, `'Backspace'` ⇒ Backspace), and repeat until the LEVEL COMPLETE
 * overlay appears. Guarded by a hard iteration cap so a stuck/unwinnable level
 * throws rather than spinning forever (a caller catches and records a finding
 * per the findings protocol — a level that won't end is a One Rule violation).
 *
 * @param {import('playwright').Page} page
 * @param {Object} [opts]
 * @param {number} [opts.maxPresses=3000] hard cap on key presses before throwing.
 * @param {number} [opts.completeTimeoutMs=8000] how long to wait for the
 *   complete overlay after the final token (victory animation is clamped
 *   1200–6000ms).
 * @returns {Promise<{ presses: number }>} number of presses it took.
 * @throws {Error} if the cap is hit or the overlay never appears (report as a
 *   finding — do not retry blindly).
 */
export async function winLevel(page, opts = {}) {
  const maxPresses = opts.maxPresses ?? 3000;
  const completeTimeoutMs = opts.completeTimeoutMs ?? 8000;

  let presses = 0;
  while (presses < maxPresses) {
    if (await isLevelCompleteVisible(page)) return { presses };

    let { activeToken } = await readPrompt(page);
    if (activeToken == null) {
      // A null active token is AMBIGUOUS: it is briefly null during the engine's
      // between-pattern re-render (~300ms) AND during the victory animation
      // before the overlay lands. Poll a short window for a fresh token or the
      // overlay before concluding either — never treat a transient gap as a win
      // or a hang.
      const deadline = Date.now() + 2000;
      while (Date.now() < deadline) {
        await page.waitForTimeout(80);
        if (await isLevelCompleteVisible(page)) return { presses };
        ({ activeToken } = await readPrompt(page));
        if (activeToken != null) break;
      }
      if (activeToken == null) {
        // Still nothing after the grace window — the overlay is presumably in
        // its victory-animation hold (clamped 1200–6000ms). Wait it out.
        if (await waitForComplete(page, completeTimeoutMs)) return { presses };
        throw new Error(
          `winLevel: no active prompt token and LEVEL COMPLETE never appeared after ${presses} presses`,
        );
      }
    }

    await press(page, activeToken);
    presses++;
    // Small settle so the next readPrompt sees the post-press DOM, not the
    // frame mid-transition (avoids a spurious null read on every advance).
    await page.waitForTimeout(60);
  }

  // Hit the cap. Give the overlay one last chance (final press may have won).
  if (await waitForComplete(page, completeTimeoutMs)) return { presses };
  throw new Error(
    `winLevel: exceeded ${maxPresses}-press cap without reaching LEVEL COMPLETE (possible unwinnable level — record a finding)`,
  );
}

/**
 * Poll for the LEVEL COMPLETE overlay up to `timeoutMs`. Resolves true if it
 * appears, false on timeout. (Used internally by winLevel; exported for tests
 * that press their own final token then await completion.)
 * @param {import('playwright').Page} page
 * @param {number} [timeoutMs=8000]
 * @returns {Promise<boolean>}
 */
export async function waitForComplete(page, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isLevelCompleteVisible(page)) return true;
    await page.waitForTimeout(100);
  }
  return false;
}
