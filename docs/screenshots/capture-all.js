// Regenerates all docs/screenshots/ — one act page (select screen, one
// screenshot per act) + one gameplay screen per level. To add new acts or
// levels, edit ACTS_CONFIG only.
//
// Usage: node docs/screenshots/capture-all.js [filter]
//   Server must already be running.
//   BASE_URL resolution: DEV_URL env var > .dev-url at the repo root.
//   (e.g. DEV_URL=http://127.0.0.1:8105 node docs/screenshots/capture-all.js)
//
//   Optional CLI filter for minimal-blast-radius reruns (content-librarian
//   rule: regenerate only what changed). Comma-separated list of global level
//   numbers (1-25) and/or act slugs, e.g.:
//     node docs/screenshots/capture-all.js 8            # levels/act2-computer-wing/08-tetris.png only
//     node docs/screenshots/capture-all.js 8,10         # two level shots, no act pages
//     node docs/screenshots/capture-all.js act1-arcade   # that act's page + its 5 level shots
//   No filter = full regeneration (30 screenshots), same as before this flag existed.
//
// Navigation boilerplate lives in scripts/kk-playwright.js — shared with
// docs/a11y/audit.js and .claude/rules/visual-validation.md.

const fs   = require('fs');
const path = require('path');
const {
  launchPage,
  resolveBaseUrl,
  goToSelect,
  goFromSelectIntoGame,
} = require('../../scripts/kk-playwright');

// ── Source of truth ────────────────────────────────────────────────────────────
// Each act lists its levels in play order.  Adding Act 6 = one new entry here.
// 'slug' becomes the directory / filename fragment; keep it lowercase-hyphenated.
// (Kept local to this file, rather than scripts/kk-playwright.js's flat-string
// ACTS_CONFIG, because screenshot filenames need the {slug} object shape.)

const ACTS_CONFIG = [
  {
    slug: 'act1-arcade',
    levels: [
      { slug: 'breakout' },
      { slug: 'space-invaders' },
      { slug: 'pac-man' },
      { slug: 'galaga' },
      { slug: 'joust' },
    ],
  },
  {
    slug: 'act2-computer-wing',
    levels: [
      { slug: 'donkey-kong' },
      { slug: 'dragons-lair' },
      { slug: 'tetris' },
      { slug: 'super-mario-bros' },
      { slug: 'legend-of-zelda' },
    ],
  },
  {
    slug: 'act3-basement',
    levels: [
      { slug: 'sonic' },
      { slug: 'street-fighter-ii' },
      { slug: 'myst' },
      { slug: 'donkey-kong-country' },
      { slug: 'pokemon' },
    ],
  },
  {
    slug: 'act4-command-center',
    levels: [
      { slug: 'simcity-2000' },
      { slug: 'goldeneye-007' },
      { slug: 'age-of-empires' },
      { slug: 'final-fantasy-vii' },
      { slug: 'terminal' },
    ],
  },
  {
    slug: 'act5-full-circle',
    levels: [
      { slug: 'out-run' },
      { slug: 'qbert' },
      { slug: 'missile-command' },
      { slug: 'high-score-entry' },
      { slug: 'word-processor' },
    ],
  },
];

// ── Derive flat level list (act index, position, global level number) ──────

let globalLevelNum = 0;
const ALL_LEVELS = [];

ACTS_CONFIG.forEach((act, actIdx) => {
  act.levels.forEach((lvl, posIdx) => {
    globalLevelNum++;
    ALL_LEVELS.push({
      levelNum:  globalLevelNum,
      actIdx:    actIdx,          // 0-based
      posIdx:    posIdx,          // 0-based within act
      actSlug:   act.slug,
      levelSlug: lvl.slug,
      filename:  String(globalLevelNum).padStart(2, '0') + '-' + lvl.slug,
    });
  });
});

// ── Set up directories ─────────────────────────────────────────────────────────

const SHOTS = __dirname;

fs.mkdirSync(path.join(SHOTS, 'acts'), { recursive: true });
ACTS_CONFIG.forEach(act => {
  fs.mkdirSync(path.join(SHOTS, 'levels', act.slug), { recursive: true });
});

// ── Navigation helper (local wrapper around the shared act/position walk) ──

async function navigateToLevel(page, baseUrl, lvl) {
  await goToSelect(page, baseUrl);

  for (let i = 0; i < lvl.actIdx; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(180);
  }
  for (let i = 0; i < lvl.posIdx; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(130);
  }

  await goFromSelectIntoGame(page);
}

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  // Filter: comma-separated level numbers and/or act slugs. Empty = everything.
  const filterArg = process.argv[2];
  const filterTokens = filterArg ? filterArg.split(',').map(s => s.trim()).filter(Boolean) : null;
  const filterLevelNums = filterTokens ? new Set(filterTokens.filter(t => /^\d+$/.test(t)).map(Number)) : null;
  const filterActSlugs = filterTokens ? new Set(filterTokens.filter(t => !/^\d+$/.test(t))) : null;
  if (filterTokens) {
    const validLevels = new Set(ALL_LEVELS.map(l => l.levelNum));
    const validActs = new Set(ACTS_CONFIG.map(a => a.slug));
    const bad = filterTokens.filter(t => /^\d+$/.test(t) ? !validLevels.has(Number(t)) : !validActs.has(t));
    if (bad.length) {
      console.error(`FATAL: unknown filter token(s): ${bad.join(', ')} (valid levels: 1-25, valid acts: ${[...validActs].join(', ')})`);
      process.exit(1);
    }
  }
  const actsToRun = filterTokens
    ? ACTS_CONFIG.filter(a => filterActSlugs.has(a.slug))
    : ACTS_CONFIG;
  const levelsToRun = filterTokens
    ? ALL_LEVELS.filter(l => filterLevelNums.has(l.levelNum) || filterActSlugs.has(l.actSlug))
    : ALL_LEVELS;

  const BASE_URL = resolveBaseUrl();
  const { browser, page, consoleErrors: errors } = await launchPage();

  // Act pages: navigate between acts within a single session (the select
  // screen shows one act's cabinets at a time — one screenshot per act).
  if (actsToRun.length) {
    console.log('Act pages (' + actsToRun.length + (filterTokens ? ' of ' + ACTS_CONFIG.length : '') + ' acts):');
    await goToSelect(page, BASE_URL);
    let actIdx = 0;
    for (const act of ACTS_CONFIG) {
      if (actsToRun.includes(act)) {
        const out = path.join(SHOTS, 'acts', act.slug + '.png');
        await page.screenshot({ path: out });
        console.log('  acts/' + act.slug + '.png');
      }
      if (actIdx < ACTS_CONFIG.length - 1) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(300);
      }
      actIdx++;
    }
  }

  // Gameplay screens: one per level
  if (levelsToRun.length) {
    console.log('\nGameplay (' + levelsToRun.length + (filterTokens ? ' of ' + ALL_LEVELS.length : '') + ' levels):');
    for (const lvl of levelsToRun) {
      await navigateToLevel(page, BASE_URL, lvl);
      const out = path.join(SHOTS, 'levels', lvl.actSlug, lvl.filename + '.png');
      await page.screenshot({ path: out });
      console.log('  levels/' + lvl.actSlug + '/' + lvl.filename + '.png');
    }
  }

  const total = actsToRun.length + levelsToRun.length;
  if (errors.length) {
    console.error('\nJS ERRORS:');
    errors.forEach(e => console.error(' ', e));
    process.exit(1);
  } else {
    console.log('\nDone. ' + total + ' screenshots captured. No JS errors.');
  }

  await browser.close();
})();
