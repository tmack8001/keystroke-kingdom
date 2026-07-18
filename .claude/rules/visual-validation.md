# Visual Validation Rule
## Keystroke Kingdom — Required Check After Adding New Levels or Themes

---

## The Rule

After adding any new level, theme file, or UI change that affects the game screen, you MUST take a Playwright screenshot of that level and visually confirm:

1. **The letter prompt is visible** — "TYPE THE LETTER" label and the active letter appear in the center of the screen
2. **The keyboard guide is visible** — the row of key boxes appears at the bottom of the game area
3. **The theme background is showing** — canvas background renders behind the UI (not on top of it)
4. **No JS console errors** — no red errors or uncaught exceptions

This check exists because the canvas z-index bug (discovered June 2026) silently broke levels 6–15. The letter prompt and keyboard guide were completely hidden behind the canvas background for all of Act 2 and Act 3. The bug was live for an entire build session before it was caught.

---

## The Theme Layout Contract — "the UI owns the center; the theme owns the frame"

*Added 2026-07-11 after Trevor's screenshot review found ten themes composing their
focal art at canvas center — where it sat buried behind the prompt panel and keyboard
guide, leaving only empty margins visible.*

The fixed DOM UI permanently reserves the center of the game screen. Measured at
1280×800 (re-verify via `getBoundingClientRect` if the UI changes):

- **RESERVED — never place focal art here:** prompt panel ~0.40–0.60W × 0.19–0.43H;
  keyboard guide ~0.22–0.78W × 0.49–0.81H; HUD badge top-left ~0.02–0.11W × 0.02–0.07H;
  HUD stats top-right ~0.86–0.99W × 0.02–0.12H.
- **THE STAGE — compose the scene here:** left margin 0–0.22W (full height); right
  margin 0.78–1.0W (full height); top band 0–0.19H between the HUD corners; the gap
  band ~0.43–0.49H; bottom strip 0.81–1.0H (full width).

Ambient fill (sky, walls, water, starfields) may continue behind the panels so the
scene feels continuous — but nothing the player needs to SEE may live there. A theme's
screenshot must read as a complete, alive picture **with the panels present**.

Related hard-won rules: position in canvas space, never DOM space (journal L16); never
put theme geometry at horizontal center (L17); set `ctx.textAlign`/`textBaseline`
explicitly in every draw function — canvas state leaks between screens (L28).

Add screenshot check **5. The theme's scene is composed in the stage regions** — focal
elements visible around the UI, not peeking out from behind it.

---

## How to Run It

The Playwright module is installed at:
```
/Users/trevormack/.npm/_npx/705bc6b22212b352/node_modules/playwright
```
Chromium headless shell is at:
```
/Users/trevormack/Library/Caches/ms-playwright/chromium_headless_shell-1228/
```

The dev server URL is in `.dev-url` at the repo root.

### Shared navigation helper

All the browser-launch boilerplate and the title → name entry → ready →
select-screen → level navigation flow lives in one place:
**`scripts/kk-playwright.js`**. It's used by `docs/screenshots/capture-all.js`,
`docs/a11y/audit.js`, and should be used by any new ad-hoc validation script
too — don't re-copy the navigation steps inline again.

It exports:
- `launchPage(viewport?)` — headless Chromium + one page at 1280×800, with
  console-error and page-error collection wired up (`consoleErrors` array)
- `resolveBaseUrl(explicit?)` — BASE_URL resolution: explicit arg > `DEV_URL`
  env var > `.dev-url` file at the repo root (lets you point at your own
  static server without editing any script)
- `goToSelect(page, baseUrl)` — fresh load → title → name entry → ready →
  select-screen (via the `wopr` easter egg)
- `goToLevel(page, baseUrl, targetLevel)` — fresh load all the way into a
  level's game screen, `targetLevel` 1-indexed across all acts (1–25)
- `goToLevelByPosition(page, baseUrl, actIdx, posIdx)` — same, keyed by
  0-based act/position instead of a global level number
- `ACTS_CONFIG`, `ALL_LEVELS` — the act/level slug table, flat-string form

### Standard screenshot script

```javascript
const { launchPage, resolveBaseUrl, goToLevel } = require('../../scripts/kk-playwright');
// adjust the relative path to scripts/kk-playwright.js from wherever your script lives

(async () => {
  const BASE_URL = resolveBaseUrl(); // DEV_URL env var, else .dev-url
  const { browser, page, consoleErrors } = await launchPage();

  await goToLevel(page, BASE_URL, 7); // change to the level you want
  await page.screenshot({ path: '/tmp/kk-level7.png' });

  if (consoleErrors.length) console.log('ERRORS:', consoleErrors.join('\n'));
  await browser.close();
})();
```

Run it with:
```bash
node your-script.js
# or, to point at your own static server instead of the shared .dev-url:
DEV_URL=http://127.0.0.1:PORT node your-script.js
```

### Bulk screenshot script
To regenerate the level + act-page sets (30 screenshots: 5 act pages + 25 gameplay;
other feature sets have their own capture scripts — see `docs/screenshots/README.md`):
```bash
node docs/screenshots/capture-all.js
# or against your own server:
DEV_URL=http://127.0.0.1:PORT node docs/screenshots/capture-all.js
```

---

## When to Run It

Run the check **before reporting a level as complete** whenever you:

- Add a new theme file (`js/themes/*.js`)
- Add new level data to `js/levels.js`
- Change `css/base.css`, `css/screens.css`, or `css/levels.css`
- Add new keys to the regex in `main.js`
- Modify `js/ui/hud.js`, `js/ui/keyboard-preview.js`, or `js/ui/screens.js`
- Rebuild the Go binary (new embed files require a rebuild — verify the theme loads)

---

## What a Passing Screenshot Looks Like

- Center of screen: `TYPE THE LETTER` label and a large glowing letter
- Bottom of screen: a row of small key boxes (the keyboard guide)
- Background: the level's canvas animation visible behind the prompt
- No all-black or all-colored screen that buries the UI elements

If the canvas is rendering *on top of* the screen content, the fix is:
```css
/* css/base.css */
.screen {
  position: relative;
  z-index: 2; /* above canvas (z-index: 1); transparent bg lets canvas show through */
}
```

---

## Go Build Reminder

The Go server uses `embed.FS` — new JS files are baked at compile time. After adding any new theme file:

```bash
go build -o keystroke-kingdom . && ./keystroke-kingdom &
```

Without a rebuild, the new theme files return 404 and the level silently falls back to no theme (or crashes).
