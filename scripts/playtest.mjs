#!/usr/bin/env node
// Keystroke Kingdom — playtest.mjs
// ─────────────────────────────────────────────────────────────────────────────
// Open the real game in a real browser, drive it to a named state through the
// REAL player route, and leave the browser open so a human can look at it.
//
//   node scripts/playtest.mjs --list
//   node scripts/playtest.mjs --at=level:7
//   node scripts/playtest.mjs --at=complete:7 --laps=2
//   node scripts/playtest.mjs --at=cinematic:mystery
//   node scripts/playtest.mjs --at=speedway:monaco-gp --laps=2
//   node scripts/playtest.mjs --at=coda:25 --shot=/tmp/kk-coda
//
// WHY THIS EXISTS (.claude/rules/playtest.md, codified 2026-09-13): every lane
// must PLAY what it changed before reporting it complete. Trevor found seven
// issues in one sitting that five build lanes, the test lane and the security
// lane all missed — three of them visible only on a SECOND run. A rule that is
// expensive to follow gets skipped, so this makes "go look at it" a one-liner
// and makes the second run the easy case (`--laps=2`).
//
// HOW IT REACHES A STATE — and what it refuses to do
//   · It navigates and TYPES, exactly like a player. Winning a level is always
//     done by reading the expected token out of the DOM and pressing it — never
//     by poking engine state. A console-poked state can render perfectly while
//     the real path renders nothing (journal L36), and a tool that synthesizes
//     success is worse than no tool (journal F24).
//   · Seeding localStorage to REACH a state fast is legitimate and is used for
//     exactly one target (`slots`, which by definition needs saved games to
//     exist at boot) — .claude/rules/testing.md rule 6 permits this explicitly.
//     Nothing that is being LOOKED AT is ever seeded.
//   · Every wait has a deadline. If a state cannot be reached the tool exits
//     non-zero and says which state and why. It never silently lands elsewhere.
//
// Navigation boilerplate is NOT re-copied here: title → name → ready → select →
// level lives once in scripts/kk-playwright.js and is imported.
//
// Security: child processes are never spawned; every page.evaluate below takes a
// STATIC function plus parameterized args, never a concatenated code string
// (.claude/rules/security.md rules 13–15).

import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(HERE, '..');
const kk = require(path.join(HERE, 'kk-playwright.js'));
const { launchPage, resolveBaseUrl, goToSelect, goToLevel, playwright } = kk;

// ── targets ──────────────────────────────────────────────────────────────────
// Each entry: { arg, defaultLaps, laps (what a lap MEANS here), blurb, run }.
const TARGETS = [
  {
    name: 'title', arg: null, defaultLaps: 1, laps: 'n/a',
    blurb: 'the attract screen, cold (magic words, Konami, INSERT COIN)',
  },
  {
    name: 'select', arg: null, defaultLaps: 1, laps: 'n/a',
    blurb: 'the arcade / level-select screen, every cabinet unlocked (WOPR)',
  },
  {
    name: 'slots', arg: null, defaultLaps: 1, laps: 'n/a',
    blurb: 'the returning-player "CHOOSE YOUR GAME" picker (3 seeded games)',
  },
  {
    name: 'level', arg: '<1-25>', defaultLaps: 1, laps: 'plays and REPLAYS the level; stops at run N\'s first prompt',
    blurb: 'in the level, at the first prompt, ready to type',
  },
  {
    name: 'victory', arg: '<1-25>', defaultLaps: 1, laps: 'wins the level N times; the celebration of the last win',
    blurb: 'the theme\'s victory() celebration animation, mid-play (a frame BURST is always captured — the window is 1.2-6s and then gone)',
  },
  {
    name: 'complete', arg: '<1-25>', defaultLaps: 1, laps: 'wins the level N times (run 2+ shows the NEXT history card in the rotation)',
    blurb: 'the LEVEL COMPLETE overlay + the history card, after a real typed win',
  },
  {
    name: 'cinematic', arg: '<mystery|basement|commandcenter|fullcircle>', defaultLaps: 1,
    laps: 'wins the gating level N times before entering the cinematic',
    blurb: 'an act transition, PLAYING, reached the real way (by winning level 5/10/15/20)',
  },
  {
    name: 'coda', arg: '25', defaultLaps: 1, laps: 'reaches the coda N times (run 2+ is a DIFFERENT story — the rotation)',
    blurb: 'Level 25\'s "MY STORY" coda, at its first coda prompt',
  },
  {
    name: 'freeplay', arg: '<1-25>', defaultLaps: 2,
    laps: 'plays N Free Play sessions on that cabinet; run 2+ shows the NEXT act card in the rotation',
    blurb: 'FREE PLAY on one cabinet — full keyboard, real sentences, and the ACT card that only reveals here. DEFAULTS TO 2 SESSIONS',
  },
  {
    name: 'hardware', arg: '<station-id>', defaultLaps: 2,
    laps: 'visits the station N times; run 2+ shows the card AGAIN (a one-card pool does not rotate)',
    blurb: 'THE HARDWARE — a machine booted the real way, then the card it hands you on the way out. DEFAULTS TO 2 VISITS',
  },
  {
    name: 'speedway', arg: '<track-id>', defaultLaps: 2,
    laps: 'races N laps; lap 2+ has the ghost of the previous lap on track',
    blurb: 'Act 7 — a track, mid-race. DEFAULTS TO 2 LAPS, because a first lap has no ghost to look at',
  },
];

// ── args ─────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const opts = {
    at: null, laps: null, fresh: false, shot: null, url: null,
    headless: false, list: false, help: false, slow: 0,
  };
  for (const raw of argv) {
    const [key, ...rest] = raw.split('=');
    const val = rest.join('=');
    switch (key) {
      case '--at': opts.at = val; break;
      case '--laps': case '--runs': opts.laps = parseInt(val, 10); break;
      case '--fresh': opts.fresh = true; break;
      // `--shot` with no value goes to a temp dir, never into docs/ — the
      // screenshot tree is a curated reference set, not a scratch pad.
      case '--shot': opts.shot = val || fs.mkdtempSync(path.join(os.tmpdir(), 'kk-playtest-')); break;
      case '--url': opts.url = val; break;
      case '--headless': opts.headless = true; break;
      case '--slow': opts.slow = parseInt(val, 10) || 0; break;
      case '--list': opts.list = true; break;
      case '--help': case '-h': opts.help = true; break;
      default: die(`unknown flag: ${raw}\nrun --help`);
    }
  }
  if (opts.laps != null && (!Number.isFinite(opts.laps) || opts.laps < 1 || opts.laps > 12)) {
    die(`--laps must be 1..12 (got "${opts.laps}")`);
  }
  return opts;
}

function die(msg) {
  console.error('\nplaytest: ' + msg + '\n');
  process.exit(2);
}

function printList() {
  console.log('\nplaytest.mjs — every reachable state\n');
  for (const t of TARGETS) {
    const label = '--at=' + t.name + (t.arg ? ':' + t.arg : '');
    if (label.length > 50) console.log('  ' + label + '\n' + ''.padEnd(54) + t.blurb);
    else console.log('  ' + label.padEnd(52) + t.blurb);
    if (t.defaultLaps !== 1 || t.laps !== 'n/a') {
      console.log(''.padEnd(54) + `--laps: ${t.laps} (default ${t.defaultLaps})`);
    }
  }
  console.log(`
  flags
    --laps=N        do it N times. THE SECOND RUN IS A DIFFERENT PROGRAM — see
                    .claude/rules/playtest.md §The Second Run. Anything that
                    persists, accumulates, rotates or unlocks is invisible on run 1.
    --fresh         wipe localStorage before EVERY run (the fresh-eyes run).
                    Default keeps state between runs so accumulation is visible.
    --shot=<dir>    screenshot every phase into <dir>, then exit. Exit code is
                    non-zero if any console error happened. Implies --headless.
    --headless      do not open a visible window (for CI / agents).
    --url=<url>     base URL. Default: $DEV_URL, else .dev-url. ALWAYS pass your
                    own static server; .dev-url can serve a stale embedded build.
    --slow=<ms>     slow every keypress down by N ms (watch it type).
    --list          this list.

  examples
    node scripts/playtest.mjs --at=level:7
    node scripts/playtest.mjs --at=complete:7 --laps=2
    node scripts/playtest.mjs --at=cinematic:mystery
    node scripts/playtest.mjs --at=speedway:monaco-gp --laps=2
    node scripts/playtest.mjs --at=hardware:apple-iie --laps=2
    node scripts/playtest.mjs --at=freeplay:3 --laps=2
    DEV_URL=http://127.0.0.1:8834 node scripts/playtest.mjs --at=coda:25 --shot=/tmp/kk
`);
}

// ── the browser ──────────────────────────────────────────────────────────────
// Headless runs reuse kk-playwright's launchPage() verbatim (it also filters the
// /api/wordgen + /api/keyboard-story probe 404s, which 404 BY DESIGN on a static
// host — without that filter every --shot run would fail on a false positive).
// A HEADED run needs `headless:false`, which launchPage() does not expose, so the
// launch option is bridged for the duration of the call rather than duplicating
// launchPage's console-error filtering here (duplicating it is how --shot starts
// lying). The bridge is then verified: a headed Chromium's UA has no
// "HeadlessChrome", so if the bridge ever stops working this fails loudly instead
// of silently opening nothing for a human who asked to look.
// → see report: `launchPage({ headless })` would remove this bridge entirely.
async function openBrowser(headless) {
  if (headless) return launchPage();
  const chromium = playwright.chromium;
  const originalLaunch = chromium.launch;
  chromium.launch = function patched(options = {}) {
    return originalLaunch.call(this, { ...options, headless: false });
  };
  let opened;
  try {
    opened = await launchPage();
  } finally {
    chromium.launch = originalLaunch;
  }
  const ua = await opened.page.evaluate(() => navigator.userAgent);
  if (/HeadlessChrome/i.test(ua)) {
    await opened.browser.close();
    throw new Error(
      'asked for a visible browser but Chromium came up headless — the launch bridge in ' +
      'openBrowser() no longer works (kk-playwright launchPage() probably stopped calling ' +
      'chromium.launch). Re-run with --headless --shot=<dir> and look at the PNGs instead.');
  }
  return opened;
}

// ── the run context ──────────────────────────────────────────────────────────
// Wait for finite CSS entry animations to land before capturing.
//
// 2026-09-13: this tool existed so you could "go look at it", and it was showing
// frames the player never sees. Every waitFor* predicate below fires the instant
// a `hidden` class comes off — so a phase screenshot caught .complete-overlay
// mid-`fadeIn` and .history-card mid-`cardDrop` (both 0.4s). At ~30% opacity over
// a theme mid-victory-bloom, a perfectly good history card photographs as
// unreadable garbage buried under the celebration, and the reviewer goes hunting
// for a z-index bug that does not exist. Same class as journal F24: the evidence
// synthesised a failure instead of a success, but it is the same lie.
//
// Only FINITE animations are awaited. The arcade is full of deliberate infinite
// ones (readyPulse, the blinking INSERT COIN, cursor blinks); awaiting those
// would hang forever, so `iterations === Infinity` is skipped by construction.
// Capped, and failures are swallowed — a screenshot must never be the thing that
// breaks a playtest run.
async function settleAnimations(page, capMs = 1200) {
  try {
    await page.evaluate(async (cap) => {
      if (typeof document.getAnimations !== 'function') return;
      const finite = document.getAnimations().filter((a) => {
        if (a.playState !== 'running') return false;
        const t = a.effect && a.effect.getTiming ? a.effect.getTiming() : null;
        return t ? t.iterations !== Infinity : false;
      });
      if (!finite.length) return;
      await Promise.race([
        Promise.all(finite.map((a) => a.finished.catch(() => {}))),
        new Promise((r) => setTimeout(r, cap)),
      ]);
    }, capMs);
  } catch { /* page navigated or closed mid-settle — the shot still happens */ }
}

class Run {
  constructor(page, opts, baseUrl) {
    this.page = page;
    this.opts = opts;
    this.baseUrl = baseUrl;
    this.phases = [];
    this.shots = [];
    this.step = 0;
  }

  log(msg) { console.log('  ' + msg); }

  // Mark a phase. Screenshots when --shot is on, so the phase list and the
  // frame list are the same list — you look at what the tool claims it reached.
  async phase(name, note) {
    this.step += 1;
    const label = String(this.step).padStart(2, '0') + '-' + name;
    this.phases.push(label);
    console.log(`  ▸ ${label}${note ? '  — ' + note : ''}`);
    if (this.opts.shot) await this.shot(label);
  }

  async shot(label) {
    const dir = this.opts.shot;
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, label.replace(/[^a-z0-9.-]+/gi, '-') + '.png');
    await settleAnimations(this.page);
    await this.page.screenshot({ path: file });
    this.shots.push(file);
    return file;
  }
}

// ── DOM / canvas observation ─────────────────────────────────────────────────
// Which screen is up, plus the expected token, read straight out of the DOM the
// same way scripts/record-playthrough.js does (reversing hud.js's promptDisplay
// glyph map — '?' is the eighth key, '␣' space, '⌫' Backspace, '⇧' Shift; case
// is preserved, so 'A' means Shift+a).
const SNAPSHOT = () => {
  const vis = (id) => {
    const el = document.getElementById(id);
    return !!el && !el.classList.contains('hidden');
  };
  const el = document.querySelector('#prompt-sequence .prompt-letter.active');
  let token = null;
  if (el) {
    const t = el.textContent || '';
    token = t === '?' ? ';' : t === '␣' ? ' ' : t === '⌫' ? 'Backspace' : t === '⇧' ? 'Shift' : t;
  }
  const seqEls = Array.from(document.querySelectorAll('#prompt-sequence .prompt-letter'));
  const sequence = seqEls.map((n) => {
    const t = n.textContent || '';
    return t === '?' ? ';' : t === '␣' ? ' ' : t === '⌫' ? '⌫' : t === '⇧' ? '⇧' : t;
  }).join('');
  const ga = document.querySelector('#game-screen .game-area');
  const badge = (document.getElementById('level-badge-text') || {}).textContent || '';
  const m = badge.match(/LEVEL\s+(\d+)/i);
  const anyScreen = Array.from(document.querySelectorAll('.screen'))
    .filter((s) => !s.classList.contains('hidden')).map((s) => s.id);
  // The active saved game's Level-25 story-rotation counter. js/slots.js
  // bumpStoryRotation(25) writes this the instant main.js startCoda() runs, so it
  // is a precise, OBSERVED signal that the coda has begun — no engine poking, and
  // no guessing from prompt text (Level 25's normal pool has multi-word phrases
  // like "hello world" and "keep going", which a text heuristic mistakes for the
  // coda; this one cannot be fooled). Untrusted-read discipline, security.md rule 4.
  let storyRotation25 = null;
  try {
    const st = JSON.parse(localStorage.getItem('kk-slots'));
    if (st && Array.isArray(st.slots) && Number.isInteger(st.active) && st.slots[st.active]) {
      const r = (st.slots[st.active].storyRotation || {})['25'];
      storyRotation25 = Number.isFinite(r) ? r : 0;
    }
  } catch (e) { storyRotation25 = null; }
  return {
    storyRotation25,
    token, sequence,
    levelNum: m ? parseInt(m[1], 10) : null,
    gameScreen: vis('game-screen'),
    gameAreaHidden: !!(ga && ga.classList.contains('hidden')),
    complete: vis('complete-overlay'),
    completeTitle: (document.querySelector('.complete-title') || {}).textContent || '',
    cardTitle: (document.getElementById('history-card-title') || {}).textContent || '',
    // ⚠️ The OVERLAY must be up, not merely the card element. `#history-card` lives
    // INSIDE `#complete-overlay` and keeps its own `hidden` state, so reading the card
    // alone happily reports last screen's card long after the overlay was dismissed.
    // That stale read cost a debugging detour: a run reported "the card revealed" and
    // "the session never completed" at the same time — a contradiction that could only
    // be the instrument (journal F28).
    cardShown: vis('complete-overlay') && vis('history-card'),
    visibleScreens: anyScreen,
    ready: vis('ready-screen'),
    select: vis('select-screen'),
    slots: vis('slots-screen'),
    title: vis('title-screen'),
  };
};

const snapshot = (page) => page.evaluate(SNAPSHOT);

// Act 6/7 draw on the shared canvas with no DOM at all, so the only honest way to
// read them is to record what the game actually DRAWS. Same technique as
// docs/screenshots/capture-speedway.js and tests/integration/speedway.test.mjs
// (surface (c), docs/testing/STRATEGY.md): text content only — never a pixel,
// position or colour assertion (.claude/rules/testing.md rule 4).
async function installDrawRecorder(page) {
  await page.addInitScript(() => {
    const C = window.CanvasRenderingContext2D;
    if (!C || C.prototype.__kkDrawPatched) return;
    window.__kkDraw = [];
    const wrap = (name) => {
      const orig = C.prototype[name];
      if (typeof orig !== 'function') return;
      C.prototype[name] = function (text, ...rest) {
        try { if (window.__kkDraw.length < 20000) window.__kkDraw.push(String(text)); } catch (e) { /* never break a frame */ }
        return orig.call(this, text, ...rest);
      };
    };
    wrap('fillText');
    wrap('strokeText');
    C.prototype.__kkDrawPatched = true;
  });
}

async function drawnText(page, frames = 3) {
  await page.evaluate(() => { window.__kkDraw = []; });
  await page.evaluate((n) => new Promise((resolve) => {
    let i = 0;
    const step = () => { i += 1; if (i >= n) resolve(); else requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), frames);
  return page.evaluate(() => (window.__kkDraw || []).slice());
}

const drawnHas = (drawn, needle) => drawn.some((s) => s.toUpperCase().includes(needle.toUpperCase()));

// The longest contiguous run of single-character draws in one frame IS the word
// on screen (the canvas wings draw prompts one glyph at a time).
function wordFromDrawn(drawn) {
  let best = [];
  let run = [];
  for (const s of drawn) {
    if (/^[A-Za-z'-]$/.test(s)) run.push(s);
    else { if (run.length > best.length) best = run; run = []; }
  }
  if (run.length > best.length) best = run;
  return best.length >= 2 ? best.join('').toLowerCase() : null;
}

// ── typing ───────────────────────────────────────────────────────────────────
const NAMED_KEY = {
  ';': 'Semicolon', ',': 'Comma', '.': 'Period', '/': 'Slash',
  '-': 'Minus', '=': 'Equal', '[': 'BracketLeft', ']': 'BracketRight',
  '\\': 'Backslash', "'": 'Quote', '`': 'Backquote',
};

async function pressToken(page, token, slow = 0) {
  if (token === ' ') await page.keyboard.press('Space');
  else if (token === 'Backspace') await page.keyboard.press('Backspace');
  else if (token === 'Shift') await page.keyboard.press('Shift');
  else if (/^[A-Z]$/.test(token)) {
    // press('A') dispatches e.key='A'; down('Shift')+press('a') dispatches 'a'
    // and the engine (which matches uppercase exactly) rejects it. Shift is still
    // held so a watching human sees a genuine chord.
    await page.keyboard.down('Shift');
    await page.keyboard.press(token);
    await page.keyboard.up('Shift');
  } else await page.keyboard.press(NAMED_KEY[token] || token);
  if (slow) await page.waitForTimeout(slow);
}

// ── waiting (every wait has a deadline and a reason) ─────────────────────────
async function waitFor(page, what, predicate, timeoutMs = 20000, pollMs = 120) {
  const deadline = Date.now() + timeoutMs;
  let last = null;
  for (;;) {
    last = await snapshot(page);
    if (predicate(last)) return last;
    if (Date.now() > deadline) {
      throw new Error(
        `timed out after ${Math.round(timeoutMs / 1000)}s waiting for ${what}. ` +
        `Visible screens: [${last.visibleScreens.join(', ')}]; level badge: ${last.levelNum}; ` +
        `prompt: ${JSON.stringify(last.sequence)}`);
    }
    await page.waitForTimeout(pollMs);
  }
}

async function waitForDrawn(page, what, needle, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const drawn = await drawnText(page, 2);
    if (drawnHas(drawn, needle)) return drawn;
    if (Date.now() > deadline) {
      throw new Error(`timed out after ${Math.round(timeoutMs / 1000)}s waiting for ${what} ` +
        `(no canvas text containing ${JSON.stringify(needle)})`);
    }
    await page.waitForTimeout(180);
  }
}

// ── playing a level, by typing ───────────────────────────────────────────────
// Types the real expected token, re-read from the DOM before EVERY press (the
// pattern pool is unseeded, so the prompt can only be known one key at a time).
// `stopWhen(snap)` ends the loop early — that is how the coda target stops at
// the coda's first prompt instead of typing the whole level.
async function typeUntil(page, { stopWhen, what, maxPresses = 4000, slow = 0 }) {
  let presses = 0;
  let idle = 0;
  for (;;) {
    const snap = await snapshot(page);
    if (stopWhen(snap)) return { presses, snap };
    if (presses >= maxPresses) throw new Error(`gave up after ${maxPresses} keypresses waiting for ${what}`);
    if (snap.token == null) {
      idle += 1;
      if (idle > 120) {
        throw new Error(`no prompt letter on screen for ~15s and ${what} never happened. ` +
          `Visible screens: [${snap.visibleScreens.join(', ')}]`);
      }
      await page.waitForTimeout(125);
      continue;
    }
    idle = 0;
    await pressToken(page, snap.token, slow);
    presses += 1;
  }
}

const isWon = (s) => s.gameAreaHidden || s.complete;

// Win the level that is currently on screen, by typing it.
async function winCurrentLevel(page, slow) {
  return typeUntil(page, {
    what: 'the level to be won',
    stopWhen: isWon,
    slow,
  });
}

// Wait out the theme's victory() celebration and land on the LEVEL COMPLETE card.
async function waitForCompleteOverlay(page) {
  return waitFor(page, 'the LEVEL COMPLETE overlay', (s) => s.complete, 15000);
}

// ── navigation ───────────────────────────────────────────────────────────────
// Re-entering a level the way a player does at the natural pause point: R on the
// complete overlay is the game's own REPLAY affordance (js/main.js 'complete').
async function replayFromComplete(page) {
  await page.keyboard.press('r');
  await waitFor(page, 'the replayed level\'s first prompt', (s) => s.gameScreen && s.token != null, 20000);
}

async function wipeStorage(page, baseUrl) {
  await page.goto(baseUrl);
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* private mode */ } });
  // Reload AFTER clearing: the first load already rendered whatever was in
  // storage (the slot picker), and the game reads it at boot, not per-frame.
  await page.reload();
  await page.waitForTimeout(700);
}

// ── target implementations ───────────────────────────────────────────────────
const IMPL = {};

IMPL.title = async (run) => {
  const { page, baseUrl } = run;
  await page.goto(baseUrl);
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload();
  await page.waitForTimeout(900);
  await page.click('body');
  await waitFor(page, 'the attract/title screen', (s) => s.title, 10000);
  await run.phase('title-screen', 'magic words: wopr / xyzzy / iddqd / adventure / eliza / hello');
};

IMPL.select = async (run) => {
  const { page, baseUrl } = run;
  await goToSelect(page, baseUrl);
  await waitFor(page, 'the level-select screen', (s) => s.select, 10000);
  await run.phase('select-screen', 'every cabinet unlocked via the WOPR bypass');
};

// The ONLY seeded target: the returning-player front door needs saved games to
// exist at boot, and they cannot be created without playing a whole game.
// testing.md rule 6 permits seeding to reach a state fast; nothing here is a
// claim about gameplay, only about what the picker looks like with games in it.
IMPL.slots = async (run) => {
  const { page, baseUrl } = run;
  const seed = {
    v: 1,
    active: 0,
    slots: [
      { name: 'OONA', furthestLevel: 12, completed: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true, 10: true, 11: true }, nameMoment: 12, textWorlds: {}, cards: ['ada-lovelace', 'hal-9000', 'hedy-lamarr', 'the-web'], cardRotation: {}, storyRotation: {}, speedway: {} },
      { name: 'DAD', furthestLevel: 20, completed: { 1: true, 2: true, 3: true }, nameMoment: null, textWorlds: {}, cards: ['floppy-disk', 'the-mouse'], cardRotation: {}, storyRotation: {}, speedway: {} },
      { name: 'GRAM', furthestLevel: 4, completed: { 1: true, 2: true, 3: true }, nameMoment: null, textWorlds: {}, cards: [], cardRotation: {}, storyRotation: {}, speedway: {} },
    ],
  };
  await page.goto(baseUrl);
  await page.evaluate((json) => {
    try { localStorage.clear(); localStorage.setItem('kk-slots', json); } catch (e) {}
  }, JSON.stringify(seed));
  await page.reload();
  await page.waitForTimeout(900);
  await page.click('body');
  await waitFor(page, 'the "CHOOSE YOUR GAME" slot picker', (s) => s.slots, 12000);
  await run.phase('slot-picker', '3 seeded games + ＋NEW GAME · SPACE play · N new · C cards · X erase');
};

function parseLevelArg(arg, name) {
  const n = parseInt(arg, 10);
  if (!Number.isFinite(n) || n < 1 || n > 25) {
    die(`--at=${name}:<1-25> — "${arg}" is not a level number`);
  }
  return n;
}

IMPL.level = async (run, arg, lap, laps) => {
  const level = parseLevelArg(arg, 'level');
  if (isFreshEntry(run, lap)) {
    await goToLevel(run.page, run.baseUrl, level);
    await waitFor(run.page, `Level ${level}'s first prompt`, (s) => s.gameScreen && s.token != null, 25000);
  } else {
    // Run 2+ of a LEVEL means: finish run N-1 and re-enter through the game's
    // own REPLAY, so the pattern pool, card rotation and name-moment latch are
    // all in their genuine second-run state.
    const { presses } = await winCurrentLevel(run.page, run.opts.slow);
    run.log(`won run ${lap - 1} in ${presses} keypresses`);
    await waitForCompleteOverlay(run.page);
    await replayFromComplete(run.page);
  }
  const s = await snapshot(run.page);
  assertLevel(s, level);
  await run.phase(`level-${level}-run-${lap}`, `prompt: ${JSON.stringify(s.sequence)}`);
};

function assertLevel(snap, level) {
  if (snap.levelNum !== level) {
    throw new Error(`expected to be in Level ${level} but the badge reads LEVEL ${snap.levelNum}`);
  }
}

IMPL.victory = async (run, arg, lap, laps) => {
  const level = parseLevelArg(arg, 'victory');
  await enterLevelForRun(run, level, lap);
  const { presses } = await winCurrentLevel(run.page, run.opts.slow);
  run.log(`won Level ${level} in ${presses} keypresses — celebration is running NOW`);
  if (lap === laps) {
    // The celebration is 1.2-6s and then it is gone, so the frames are captured
    // unconditionally: theme-authoring.md requires DIFFERING frames from an
    // actually-won run, and that evidence cannot be gathered by looking later.
    const dir = run.opts.shot || fs.mkdtempSync(path.join(os.tmpdir(), 'kk-playtest-victory-'));
    fs.mkdirSync(dir, { recursive: true });
    const frames = [];
    for (let i = 0; i < 8; i += 1) {
      const file = path.join(dir, `victory-L${level}-frame${String(i).padStart(2, '0')}.png`);
      await run.page.screenshot({ path: file });
      frames.push(file);
      run.shots.push(file);
      await run.page.waitForTimeout(320);
    }
    run.log('celebration frames (OPEN THEM — identical frames mean nothing animated):');
    frames.forEach((f) => run.log('    ' + f));
    await run.phase(`victory-L${level}`, 'the celebration window, or the card if it already landed');
  }
  await waitForCompleteOverlay(run.page);
};

IMPL.complete = async (run, arg, lap, laps) => {
  const level = parseLevelArg(arg, 'complete');
  await enterLevelForRun(run, level, lap);
  const { presses } = await winCurrentLevel(run.page, run.opts.slow);
  run.log(`won Level ${level} in ${presses} keypresses`);
  const s = await waitForCompleteOverlay(run.page);
  await run.phase(`complete-L${level}-run-${lap}`,
    `${s.completeTitle}${s.cardShown ? ' · card: ' + s.cardTitle : ' · no card shown'}`);
};

const CINEMATICS = {
  mystery: { level: 5, blurb: 'Act 1→2 — the curtain drops, it is a computer' },
  basement: { level: 10, blurb: 'Act 2→3 — the trapdoor, 16-bit light from below' },
  commandcenter: { level: 15, blurb: 'Act 3→4 — every letter key lights, the staircase' },
  fullcircle: { level: 20, blurb: 'Act 4→5 — HELLO, the montage, the arcade fully lit' },
};

IMPL.cinematic = async (run, arg, lap, laps) => {
  const spec = CINEMATICS[arg];
  if (!spec) die(`--at=cinematic:<${Object.keys(CINEMATICS).join('|')}> — "${arg}" is not one of them`);
  await enterLevelForRun(run, spec.level, lap);
  const { presses } = await winCurrentLevel(run.page, run.opts.slow);
  run.log(`won Level ${spec.level} in ${presses} keypresses (the cinematic's real gate)`);
  await waitForCompleteOverlay(run.page);
  if (lap < laps) return;
  await run.phase(`complete-L${spec.level}`, 'the overlay the cinematic starts from');
  // Space at the complete overlay is what actually fires the cinematic
  // (js/main.js 'complete' case) — the real route, not Mystery.start().
  await run.page.keyboard.press('Space');
  await run.page.waitForTimeout(1200);
  const gone = await run.page.evaluate(() =>
    Array.from(document.querySelectorAll('.screen')).every((s) => s.classList.contains('hidden')));
  if (!gone) {
    throw new Error(`pressing Space at Level ${spec.level} COMPLETE did not start the ` +
      `'${arg}' cinematic (a .screen is still visible, so the DOM was never hidden)`);
  }
  run.log(`'${arg}' cinematic is PLAYING — ${spec.blurb}`);
  if (run.opts.shot) {
    // A cinematic is a SEQUENCE; one frame of it proves nothing (journal L36 —
    // code that looks animated can render identical frames). Sample it across
    // its phases. Offsets are from the moment Space fired it, and the last one
    // sits past the longest cinematic's title card (~45s for fullcircle).
    let elapsed = 1200; // already waited above
    for (const at of [2000, 6000, 10000, 15000, 21000, 27000, 34000, 42000]) {
      const delta = at - elapsed;
      if (delta > 0) await run.page.waitForTimeout(delta);
      elapsed = at;
      await run.shot(`cinematic-${arg}-t${at}ms`);
    }
  }
  await run.phase(`cinematic-${arg}`, 'playing — press Space at the title card to continue');
};

IMPL.coda = async (run, arg, lap, laps) => {
  const level = parseLevelArg(arg || '25', 'coda');
  if (level !== 25) die('--at=coda:25 — the "MY STORY" coda only exists on Level 25');
  await enterLevelForRun(run, 25, lap);
  // The coda begins the instant L25's traditional win target is met: main.js
  // startCoda() replaces the un-reached pattern tail with the story and bumps the
  // saved game's story rotation. That bump is persisted immediately, so waiting on
  // it is an exact observation of "the coda started" — not a guess from the prompt
  // text. (A text heuristic DOES get this wrong: L25's normal pool contains
  // "hello world" and "keep going", and an earlier build of this tool proudly
  // reported the history-card word as the coda. Hence journal F24's rule — a tool
  // that lands somewhere else and says it succeeded is worse than no tool.)
  const before = await snapshot(run.page);
  if (before.storyRotation25 === null) {
    throw new Error('cannot detect the coda: no active saved game in kk-slots to read ' +
      'the story rotation from (js/slots.js getStoryRotation)');
  }
  const baseline = before.storyRotation25;
  const { presses, snap } = await typeUntil(run.page, {
    what: 'the "MY STORY" coda to begin',
    slow: run.opts.slow,
    stopWhen: (s) => isWon(s) || (s.storyRotation25 !== null && s.storyRotation25 > baseline),
  });
  if (isWon(snap)) {
    throw new Error('Level 25 ended without the coda ever starting — startCoda() never ran ' +
      '(see js/main.js startCoda / js/keyboard-story.js)');
  }
  // startCoda() runs while the pattern that TRIGGERED it is still the rendered
  // prompt, so the coda's first line is the next prompt to appear. Wait for the
  // prompt to actually turn over before claiming to be standing in the coda.
  const triggerSeq = snap.sequence;
  const codaSnap = await waitFor(run.page, "the coda's first line to become the prompt",
    (x) => x.token != null && x.sequence && x.sequence !== triggerSeq, 15000);
  run.log(`reached the coda after ${presses} keypresses ` +
    `(the last normal pattern was ${JSON.stringify(triggerSeq)})`);
  await run.phase(`coda-run-${lap}`, `first coda line: ${JSON.stringify(codaSnap.sequence)}`);
  if (lap < laps) {
    // Finish the whole coda so the NEXT run rotates to a different story.
    await winCurrentLevel(run.page, run.opts.slow);
    await waitForCompleteOverlay(run.page);
  }
};

// Shared entry for the win-based targets: run 1 navigates in; run 2+ replays
// through the game's own R-at-complete affordance so accumulation is real.
// True when this run must navigate in from scratch: the first run always, and
// EVERY run under --fresh (which wipes storage and reloads, so there is no
// complete-overlay left to press R on).
const isFreshEntry = (run, lap) => lap === 1 || run.opts.fresh;

async function enterLevelForRun(run, level, lap) {
  if (isFreshEntry(run, lap)) {
    await goToLevel(run.page, run.baseUrl, level);
    const s = await waitFor(run.page, `Level ${level}'s first prompt`,
      (x) => x.gameScreen && x.token != null, 25000);
    assertLevel(s, level);
  } else {
    await replayFromComplete(run.page);
  }
}

// ── FREE PLAY — the one surface where an ACT card reveals ────────────────────
//
// Why this target exists at all: after Level 15 the curriculum cabinets STILL hand
// out their own restricted key sets — Level 1 is `{j, f}` forever — so an Act 1
// word can never be typed at Act 1's curriculum cabinet. Free Play is the only
// place in the game where an Act 1 cabinet and a complete keyboard exist at once,
// which makes it the only place the act-card layer is visible at all.
//
// TWO THINGS THAT ARE EASY TO GET WRONG HERE, both of which produced a confident
// wrong answer the first time (journal F28 — check the instrument first):
//   1. `F` TOGGLES Free Play on the select screen. It does not start anything.
//   2. Picking a cabinet does not go straight into play — it goes to the title
//      screen's NAME-CONFIRM step, then the ready screen, then the keyboard
//      preview. Four more keypresses, and they are the real player's route.
//
// Default of TWO sessions, same reasoning as speedway and hardware: session 1 can
// only ever show you A card. Only session 2 can tell you the act pool ROTATES.
IMPL.freeplay = async (run, arg, lap, laps) => {
  const { page } = run;
  const level = parseLevelArg(arg, 'freeplay');
  const actNum = Math.ceil(level / 5);

  if (isFreshEntry(run, lap)) {
    await goToSelect(page, run.baseUrl);
    await waitFor(page, 'the level-select screen', (s) => s.select, 12000);

    // ⚠️ UNLOCK THE ACT LAYER *AFTER* goToSelect, NEVER BEFORE IT.
    // `goToSelect` opens with `localStorage.clear()` — it always boots a brand-new
    // machine — so anything seeded beforehand is gone before the first keypress.
    // The first version of this target seeded up front and then reported "no act
    // card" on an act that has four, which is the instrument, not the game.
    //
    // The act layer is gated on `furthestLevel >= 15` and there is no way to reach
    // that except by playing fifteen levels, so it is patched in place here.
    // Seeding to reach a state fast is permitted (testing.md rule 6); the claim
    // under test is what Free Play DOES, not how the save got there. Patched live
    // rather than via an init script on purpose: the game writes its act-card
    // rotation back into this same object, and a re-applying seed would wipe that
    // between sessions — which would silently make the rotation look broken.
    const unlocked = await page.evaluate(() => {
      try {
        const st = JSON.parse(localStorage.getItem('kk-slots'));
        if (!st || !Array.isArray(st.slots) || !st.slots[st.active]) return false;
        st.slots[st.active].furthestLevel = 25;
        localStorage.setItem('kk-slots', JSON.stringify(st));
        return true;
      } catch (e) { return false; }
    });
    if (!unlocked) {
      throw new Error('could not raise furthestLevel to 25 in kk-slots — the act-card layer ' +
        'is gated at Level 15 (ACT_CARD_UNLOCK_LEVEL) and would stay inert, which reads as ' +
        '"this act has no cards" rather than as a failure.');
    }

    // Walk to the cabinet: ArrowDown between acts, ArrowRight within one — the same
    // walk goToLevel does, but stopping ON the select screen, because Free Play has
    // to be toggled before a cabinet is picked.
    for (let i = 1; i < actNum; i += 1) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(160); }
    const pos = ((level - 1) % 5) + 1;
    for (let i = 1; i < pos; i += 1) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(140); }

    await page.keyboard.press('f');
    await page.waitForTimeout(250);
    // Confirm the toggle took, BY NAME. A press that silently did nothing would hand
    // back an ordinary curriculum run wearing a free-play label, and every assertion
    // below would still pass.
    const label = await page.evaluate(() =>
      (document.getElementById('select-act-label') || {}).textContent || '');
    if (!/FREE PLAY/i.test(label)) {
      throw new Error(`FREE PLAY did not toggle on (act label reads: ${JSON.stringify(label)}). ` +
        "`f` is ignored while the cursor sits on a bonus-act door — js/main.js case 'select'.");
    }
    await run.phase(`freeplay-select-L${level}`, `FREE PLAY armed — ${label.trim()}`);

    // ⚠️ Picking a cabinet does NOT go straight into play. It goes to the title
    // screen's NAME-CONFIRM step, then the ready screen, then the keyboard preview.
    // Four more keypresses, and they are the real player's route.
    await page.keyboard.press('Enter');  await page.waitForTimeout(350);   // cabinet -> name entry
    await page.keyboard.press('Enter');  await page.waitForTimeout(350);   // confirm name -> ready
    await page.keyboard.press('Space');  await page.waitForTimeout(350);   // ready -> keyboard preview
    await page.keyboard.press('Space');  await page.waitForTimeout(700);   // preview -> the game
    await waitFor(page, `Free Play's first prompt on cabinet ${level}`, (s) => s.gameScreen && s.token != null, 20000);
  } else {
    // Session 2+ uses the game's OWN replay affordance (R on the complete overlay).
    // It calls startGame() with state.freePlay untouched, so it is a genuine second
    // Free Play session on the same cabinet — and, critically, it neither navigates
    // nor clears storage, so the act-card rotation written by session 1 survives.
    // Re-walking through goToSelect would wipe it and the pool could never rotate.
    await replayFromComplete(page);
  }

  const { presses } = await winCurrentLevel(page, run.opts.slow);
  await waitForCompleteOverlay(page);
  const s = await snapshot(page);
  run.log(`session ${lap} won in ${presses} keypresses`);

  const card = s.cardShown ? s.cardTitle : null;
  const seen = seenActCards[level] || (seenActCards[level] = []);
  const repeated = card && seen.includes(card);
  if (card) seen.push(card);

  await run.phase(`freeplay-L${level}-complete-session${lap}`,
    card ? `${s.completeTitle.trim()} · act card: ${card}` : `${s.completeTitle.trim()} · no act card`);

  if (!card) {
    run.log(`no act card revealed on the Act ${actNum} cabinet — ACT_CARDS holds none for that ` +
      'act yet (js/history-cards.js). An act with no content is inert by construction, never broken.');
  } else if (lap > 1) {
    run.log(repeated
      ? `session ${lap} repeated the SAME act card (${card}) — expected only if this act has a pool of one.`
      : `session ${lap} rotated to a DIFFERENT act card (${card}) — the act pool is doing its job.`);
  }
};

// Act card titles seen per cabinet, across the sessions of one invocation.
const seenActCards = {};

// ── THE HARDWARE — a machine, booted, and the card on the way out ────────────
// Reached the real way: the wing's own stretch of the back wall. THE HARDWARE
// renders MACHINES rather than cabinets (BACK_WALL_DOORS `machines:`), so every
// machine is its own selectable row carrying data-door="hardware" and
// data-entry="<station-id>" — which is what this walks to, by NAME. Never by
// blind arrow-counting: the speedway lane learned that the hard way when a wrapped
// cursor put lap 2 on the wrong track and it read as a missing-ghost bug.
//
// Why the default is TWO visits: the card is the point, and a second visit is the
// only way to see whether the station's pool ROTATES. With one card authored per
// station it does not, and this tool says so out loud rather than letting a
// one-card pool look like variety.
IMPL.hardware = async (run, arg, lap, laps) => {
  const { page } = run;
  if (!arg) die('--at=hardware:<station-id> — e.g. apple-iie, msdos-pc (see js/hardware/stations.js)');

  if (isFreshEntry(run, lap)) {
    await goToSelect(page, run.baseUrl);
    // Walk the back wall to THE HARDWARE, then along its machines to the one asked
    // for. ArrowDown steps between wings; ArrowRight steps along a wing's wall.
    let focused = null;
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(120);
      focused = await page.evaluate(() => {
        const el = document.querySelector('.select-door.selected');
        return el ? el.dataset.door : null;
      });
      if (focused === 'hardware') break;
    }
    if (focused !== 'hardware') {
      throw new Error(`could not reach THE HARDWARE on the back wall (focused: ${focused}). ` +
        'It opens at Level 20 — BACK_WALL_DOORS unlockLevel in js/ui/cabinet-art.js.');
    }
    let entry = null;
    for (let i = 0; i < 8; i += 1) {
      entry = await page.evaluate(() => {
        const el = document.querySelector('.select-door.selected');
        return el ? el.dataset.entry : null;
      });
      if (entry === arg) break;
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(120);
    }
    if (entry !== arg) {
      throw new Error(`THE HARDWARE wall has no machine "${arg}" (cursor stopped on: ${entry}). ` +
        'The wall is BACK_WALL_DOORS `machines:` + js/hardware/stations.js.');
    }
    await run.phase(`hardware-wall-${arg}`, `the back wall — THE HARDWARE, standing at ${arg}`);
    await page.keyboard.press(' ');
    await waitForDrawn(page, 'THE HARDWARE hub', 'THE HARDWARE', 25000);
  } else {
    // Run 2+: we were left on the card. Space puts it down and lands on the wall
    // of machines, which is where a second visit starts.
    await page.keyboard.press(' ');
    await page.waitForTimeout(400);
    await waitForDrawn(page, 'THE HARDWARE hub', 'THE HARDWARE', 10000);
  }

  // The hub opens standing at the machine picked on the wall (focusStation), so
  // Space enters it. Confirm by the machine's own prompt appearing.
  const station = HARDWARE_STATIONS[arg];
  if (!station) die(`--at=hardware:<station-id> — "${arg}" is not one of: ${Object.keys(HARDWARE_STATIONS).join(', ')}`);
  await run.phase(`hardware-hub-visit${lap}`, 'the wall of machines — SPACE walks up to one');
  await page.keyboard.press(' ');
  await waitForDrawn(page, `${arg}'s prompt`, station.firstLine[0], 15000);

  // TYPE WHAT IT IS WAITING FOR. This is the wing's whole verb, so the tool types
  // it a character at a time through real key events, exactly as a child would.
  //
  // ⚠️ NO TRAILING Enter. A boot line COMMITS ON ITS LAST CHARACTER —
  // handleBootKey() calls commitLine() the moment `typed.length` reaches the
  // line's length — so Return is never needed and, after the final line, is
  // actively harmful: the machine is already awake by then, and the awake
  // handler reads Enter as "walk out", which skipped straight past the
  // celebration to the card. The first run of this tool did exactly that and
  // reported "no card revealed" about a card that was on screen.
  for (const line of station.boot) {
    for (const ch of line) {
      await page.keyboard.press(ch === ' ' ? ' ' : ch);
      await page.waitForTimeout(run.opts.slow || 18);
    }
    await page.waitForTimeout(260);
  }

  // The machine wakes. This is the wing's celebration and it is STAGED (flash →
  // title → year → why → exit line), so wait for the last beat, not the first —
  // a shot on visibility photographs a half-finished animation (journal F28).
  // ⚠️ Wait on the RUNNING TITLE, not on "BACK TO THE WALL" — the card screen
  // carries that same exit line, so it cannot tell the two screens apart and a
  // shot taken on it photographed the card while calling it the celebration.
  await waitForDrawn(page, `${arg} running its program`, station.running, 15000);
  await page.waitForTimeout(1300);   // let the staged wake finish: flash -> title -> year -> why
  await run.phase(`hardware-${arg}-awake-visit${lap}`, 'the machine is running the thing it was bought for');

  // …and on the way out, the card.
  await page.keyboard.press(' ');
  await page.waitForTimeout(700);
  const drawn = await drawnText(page, 3);
  const gotCard = drawnHas(drawn, 'FOUND BESIDE THE MACHINE');
  if (!gotCard) {
    run.log(`no card revealed at ${arg} — this station has no cards in WING_CARDS yet ` +
      '(js/history-cards.js), so the wing walks straight back to the wall.');
    return;
  }
  const isNew = drawnHas(drawn, 'NEW!');
  // WHICH card, not just whether one appeared. A station with a pool of one hands over
  // the same card forever ("rotation" that never rotates); a station with a real pool
  // should hand over a DIFFERENT one next visit. Only the title tells them apart, so the
  // title is what gets remembered across visits.
  const title = (drawnHas(drawn, 'FOUND BESIDE THE MACHINE') ? drawn : [])
    .map(d => (typeof d === 'string' ? d : d && d.text) || '')
    .find(txt => /^THE .+· ?\d|^THE .+·/.test(txt)) || '(title not readable)';
  const seen = seenStationCards[arg] || (seenStationCards[arg] = []);
  const repeated = seen.includes(title);
  seen.push(title);

  await run.phase(`hardware-${arg}-card-visit${lap}`,
    `${isNew ? 'NEW! — ' : 'already collected — '}${title}`);

  if (lap > 1) {
    if (repeated) {
      run.log(`visit ${lap} handed over the SAME card again (${title}). Expected only if this ` +
        "station has a pool of one — a second card is what makes the rotation rotate.");
      if (isNew) {
        run.log('⚠️ …and it is STILL marked NEW!, which means visit 1 never reached the save.');
      }
    } else {
      run.log(`visit ${lap} rotated to a DIFFERENT card (${title}) — the pool is doing its job.`);
    }
  }
};

// Card titles handed over per station, across the visits of one invocation.
const seenStationCards = {};

// The boot lines, mirrored from js/hardware/stations.js. Deliberately a COPY and
// deliberately small: the tool drives the real page, so if these ever drift the
// waitForDrawn on the machine's prompt fails loudly rather than typing nonsense.
const HARDWARE_STATIONS = {
  'apple-iie': { firstLine: ['CATALOG'], boot: ['CATALOG', 'RUN STICKYBEAR'], running: 'STICKYBEAR TYPING' },
  'msdos-pc':  { firstLine: ['DIR'],     boot: ['DIR', 'GIZMOS'],             running: 'GIZMOS' },
};

// ── Act 7 — The Speedway ─────────────────────────────────────────────────────
// Reached the real way: the SECOND back-wall door on the select screen.
// (The door order is BACK_WALL_DOORS in js/ui/cabinet-art.js: 0 = THE GREEN
// DRAGON, 1 = THE SPEEDWAY — the same constant docs/screenshots/capture-speedway.js
// reads. Confirmed here at runtime by the focused door's dataset, so a re-ordered
// wall fails loudly instead of racing the wrong wing.)
IMPL.speedway = async (run, arg, lap, laps) => {
  const { page } = run;
  if (!arg) die('--at=speedway:<track-id> — e.g. monaco-gp, f-zero (see js/speedway/tracks/index.js)');
  let trackTitle = null;
  const ghostExpected = lap > 1 && !run.opts.fresh;
  if (run.opts.fresh && lap > 1) {
    run.log('--fresh wiped the saved game, so this lap has NO ghost to race — ' +
      'drop --fresh to watch laps accumulate.');
  }
  if (isFreshEntry(run, lap)) {
    await goToSelect(page, run.baseUrl);
    let focused = null;
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(120);
      focused = await page.evaluate(() => {
        const el = document.querySelector('.select-door.selected');
        return el ? el.dataset.door : null;
      });
      if (focused === 'speedway') break;
    }
    if (focused !== 'speedway') {
      throw new Error(`could not reach the SPEEDWAY door on the back wall (focused: ${focused}). ` +
        'The door registry is BACK_WALL_DOORS in js/ui/cabinet-art.js.');
    }
    await run.phase('speedway-door', 'the back wall — THE SPEEDWAY');
    await page.keyboard.press(' ');
    await waitForDrawn(page, 'the SPEEDWAY hub', 'THE SPEEDWAY', 25000);
    await waitForDrawn(page, 'the SPEEDWAY hub chooser', 'CHOOSE', 10000);
    await run.phase('speedway-hub', 'the track chooser');
    trackTitle = await selectHubTrack(run, arg);
    await page.keyboard.press(' ');
  } else {
    // Back to the hub, then straight onto the same track again.
    // NOTE: a finished lap has TWO boards, not one — js/speedway/track.js
    // handleKey(): phase 'finish' (the checkered LAP COMPLETE card) --Space-->
    // settleToPit() --> phase 'pit' --Space--> onFinish() --> the hub. A single
    // Space leaves you sitting on the second board, which is exactly how this
    // tool failed the first time it was run. Press through until the hub is up.
    await returnToHub(run);
    trackTitle = await selectHubTrack(run, arg);
    await page.keyboard.press(' ');
  }

  const startDrawn = await waitForDrawn(page, `${arg}'s start line`, 'SPACE TO GO', 20000);
  // Never take "a start line" for "the right start line". The hub cursor WRAPS,
  // and it does not reset between visits — blind ArrowDown counting put lap 2 of
  // an --at=speedway:f-zero run on the MONACO GP grid, which then read as "no
  // ghost" and looked like an Act 7 bug. Confirm the track by name.
  if (trackTitle && !drawnHas(startDrawn, trackTitle)) {
    throw new Error(`asked for "${arg}" but the start line on screen is not ${trackTitle} — ` +
      'the hub cursor landed on a different track');
  }
  const ghostAtLine = drawnHas(startDrawn, 'YOUR LAST LAP IS OUT THERE') || drawnHas(startDrawn, 'GHOST');
  await run.phase(`speedway-${arg}-lap${lap}-start-line`,
    ghostAtLine ? 'GHOST PRESENT — "YOUR LAST LAP IS OUT THERE WITH YOU"' : 'first lap — no ghost yet');
  if (ghostExpected && !ghostAtLine) {
    throw new Error(`lap ${lap} start line still reads as a first lap — no ghost was recorded ` +
      `by lap ${lap - 1} (js/speedway/ghost.js writes it into kk-slots[i].speedway)`);
  }

  await page.keyboard.press(' ');
  await page.waitForTimeout(350);

  if (lap === laps) {
    // Stop mid-lap: the race in motion is the thing to look at.
    await raceChars(page, 28, run.opts.slow);
    await page.waitForTimeout(250);
    const racingDrawn = await drawnText(page, 3);
    const ghostOnTrack = drawnHas(racingDrawn, 'GHOST');
    await run.phase(`speedway-${arg}-lap${lap}-racing`,
      ghostOnTrack ? 'racing the GHOST (HUD shows "GHOST · YOU · LAST TIME")' : 'racing — no ghost this lap');
    if (ghostExpected && !ghostOnTrack) {
      throw new Error(`lap ${lap} is racing without a ghost on the HUD — the previous lap's ghost is missing`);
    }
    return;
  }

  await driveWholeLap(page, run.opts.slow);
  await page.waitForTimeout(900);
  await run.phase(`speedway-${arg}-lap${lap}-pit-board`, 'lap complete — this is what records the ghost');
};

// Press through every post-lap board until the hub chooser is actually on screen.
async function returnToHub(run) {
  const { page } = run;
  for (let i = 0; i < 5; i += 1) {
    await page.keyboard.press(' ');
    await page.waitForTimeout(650);
    const drawn = await drawnText(page, 3);
    if (drawnHas(drawn, 'CHOOSE')) return;
    if (i === 0) await run.phase('speedway-pit-board', 'the board after the checkered flag');
  }
  throw new Error('could not get back to the SPEEDWAY hub from the post-lap boards ' +
    '(js/speedway/track.js phases finish -> pit -> onFinish)');
}

// Steer the hub cursor onto a track BY NAME. The hub draws its selected row as
// '▸  <TITLE>   <YEAR>' (js/speedway/hub.js), so the cursor's position is directly
// observable — which beats counting ArrowDowns, because the cursor wraps and it
// remembers where it was on the previous visit. Returns the track's title.
async function selectHubTrack(run, trackId) {
  const { page } = run;
  // Ask the page for the registry rather than hard-coding an order a sibling lane
  // may be reshuffling right now.
  const tracks = await page.evaluate(async () => {
    try {
      const mod = await import('./js/speedway/tracks/index.js');
      const list = mod.allTracks ? mod.allTracks() : mod.TRACKS;
      return list.map((t) => ({ id: t.id, title: String(t.title).toUpperCase() }));
    } catch (e) { return null; }
  });
  if (!tracks) throw new Error('could not read js/speedway/tracks/index.js from the page to list the tracks');
  const want = tracks.find((t) => t.id === trackId);
  if (!want) {
    throw new Error(`no such track "${trackId}". Registered tracks: ${tracks.map((t) => t.id).join(', ')}`);
  }
  for (let i = 0; i <= tracks.length + 2; i += 1) {
    const drawn = await drawnText(page, 3);
    const selected = drawn.find((t) => t.startsWith('▸'));
    if (selected && selected.toUpperCase().includes(want.title)) return want.title;
    if (!selected) throw new Error('the SPEEDWAY hub is not showing a selected row (no "▸" drawn)');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(150);
  }
  throw new Error(`could not put the hub cursor on "${want.title}" after walking the whole list`);
}

const atFinish = async (page) => drawnHas(await drawnText(page, 2), 'LAP COMPLETE');

async function raceChars(page, atLeast, slow) {
  let typed = 0;
  for (let i = 0; i < 400 && typed < atLeast; i += 1) {
    if (await atFinish(page)) return typed;
    const word = wordFromDrawn(await drawnText(page, 3));
    if (!word) return typed;
    for (const ch of word) await pressToken(page, ch, slow);
    typed += word.length;
  }
  return typed;
}

async function driveWholeLap(page, slow) {
  for (let i = 0; i < 600; i += 1) {
    if (await atFinish(page)) return;
    const word = wordFromDrawn(await drawnText(page, 3));
    if (!word) throw new Error('no prompt word is on the track and the lap has not finished');
    for (const ch of word) await pressToken(page, ch, slow);
  }
  throw new Error('the lap did not finish within 600 words');
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || (!opts.at && !opts.list)) { printList(); process.exit(opts.help ? 0 : 2); }
  if (opts.list) { printList(); process.exit(0); }
  if (opts.shot) opts.headless = true;

  const [name, ...argRest] = opts.at.split(':');
  const arg = argRest.join(':');
  const target = TARGETS.find((t) => t.name === name);
  if (!target) {
    die(`no such state "${opts.at}". Run --list to see every reachable state.`);
  }
  if (target.arg && !arg) die(`--at=${target.name}:${target.arg} needs its argument`);
  const laps = opts.laps || target.defaultLaps;

  let baseUrl;
  try {
    baseUrl = resolveBaseUrl(opts.url);
  } catch (e) {
    die('no base URL. Start your own server and pass it:\n' +
      '  python3 -m http.server 8834 --directory ' + REPO_ROOT + '\n' +
      '  DEV_URL=http://127.0.0.1:8834 node scripts/playtest.mjs --at=' + opts.at);
  }

  console.log(`\nplaytest → ${opts.at}   (${target.blurb})`);
  console.log(`  url: ${baseUrl}   runs: ${laps}${opts.fresh ? '   fresh: wiping storage before every run' : ''}` +
    `${opts.shot ? '   shots: ' + opts.shot : ''}`);
  if (laps === 1 && target.laps !== 'n/a') {
    console.log('  ⚠ ONE run. Three of the seven findings that created this tool existed ONLY on');
    console.log(`    the second run. Re-run with --laps=2 (${target.laps}).`);
  }
  console.log('');

  const { browser, page, consoleErrors } = await openBrowser(opts.headless);
  const run = new Run(page, opts, baseUrl);
  await installDrawRecorder(page);

  let failure = null;
  try {
    for (let lap = 1; lap <= laps; lap += 1) {
      if (laps > 1) console.log(`  ── run ${lap} of ${laps} ──`);
      if (opts.fresh && lap > 1) {
        await wipeStorage(page, baseUrl);
        run.log('storage wiped (--fresh) — this run starts as a brand-new machine');
      }
      await IMPL[target.name](run, arg, lap, laps);
    }
  } catch (e) {
    failure = e;
  }

  console.log('');
  if (failure) {
    console.error(`  ✗ COULD NOT REACH ${opts.at}`);
    console.error(`    ${failure.message}`);
    if (run.opts.shot) {
      try {
        const f = await run.shot('FAILED-' + name);
        console.error(`    last frame: ${f}`);
      } catch (e) { /* the page may be gone */ }
    }
  }
  if (consoleErrors.length) {
    console.error(`  ✗ ${consoleErrors.length} console error(s):`);
    consoleErrors.forEach((e) => console.error('      ' + e));
  } else {
    console.log('  ✓ no console errors');
  }
  if (run.shots.length) {
    console.log(`  ${run.shots.length} frame(s) written — OPEN THEM, reading the code is not looking:`);
    run.shots.forEach((s) => console.log('      ' + s));
  }

  // A console error is a failure everywhere, not only under --shot: the whole
  // point is that nobody has to remember to look for one.
  const bad = !!failure || consoleErrors.length > 0;

  if (opts.headless) {
    await browser.close();
    process.exit(bad ? 1 : 0);
  }

  if (failure) {
    await browser.close();
    process.exit(1);
  }

  console.log(`\n  ▶ the browser is open at "${opts.at}". LOOK AT IT.`);
  console.log('    Close the window (or Ctrl-C) when you are done.\n');
  await new Promise((resolve) => browser.on('disconnected', resolve));
  process.exit(consoleErrors.length ? 1 : 0);
}

main().catch((e) => {
  console.error('\nplaytest: unexpected failure — ' + (e && e.stack ? e.stack : e) + '\n');
  process.exit(1);
});
