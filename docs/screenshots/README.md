# Keystroke Kingdom — Screenshot Reference Sets

Screenshots here are **validating reference artifacts**, not a photo album. Every
directory is a complete, regenerable set for one game surface, captured by its own
script. When you change a feature, regenerate the set that covers it — a stale
screenshot next to fresh code is worse than no screenshot.

**Directories are named by what they show, never by who captured them or which
process produced them.** ("qa/" — named for the QA agent that happened to take the
shots — was retired for exactly this reason; see below.)

## Taxonomy

| Directory | What it shows | Regenerate with |
|---|---|---|
| `levels/` | One gameplay screen per level (25), grouped by act | `node docs/screenshots/capture-all.js` |
| `acts/` | The level-select screen, one page per act (5) | `node docs/screenshots/capture-all.js` |
| `history-cards/` | The 17 guaranteed computing-history moment cards, captured via real playthrough | `node docs/screenshots/capture-cards.js` |
| `milestones/` | The four row-unlock moments (home row, top row, full keyboard, number row) — flaw-detection references for "every key in this row is lit" | `node docs/screenshots/capture-milestones.js` |
| `cinematics/fullcircle/` | The Act 4→5 finale cinematic (Level 20→21), phase-by-phase | `node docs/screenshots/capture-fullcircle.js` |
| `cinematics/mystery/` | The Act 1→2 Mystery Cabinet reveal (after Level 5) — 7 pngs + `approach.gif`/`secret-door.gif` (revised 2026-07-12: Phase 4 is now a dolly-in "Approach" with distance-blurred terminal text, Phase 5 is the cabinet itself hinging aside as a "Secret Door" — see below) | `node docs/screenshots/capture-cinematics.js mystery` |
| `cinematics/basement/` | The Act 2→3 Basement-opens transition (after Level 10) | `node docs/screenshots/capture-cinematics.js basement` |
| `cinematics/commandcenter/` | The Act 3→4 Command Center transition (after Level 15) | `node docs/screenshots/capture-cinematics.js commandcenter` |
| `easter-eggs/` | The hidden hacker-culture layer: title-screen magic words (7 as of 2026-09-11), Konami stars, WOPR select | `node docs/screenshots/capture-eggs.js` |
| `freeplay/` | Free Play HUD (sentence + WPM), and Free Play layered under Survival | `node docs/screenshots/capture-freeplay.js` |
| `screens/` | Game chrome: title, name entry, READY reveal, keyboard-preview, the slot picker + its erase-confirm, the card collection gallery, settings (default + Survival), level-complete, survival game-over | `node docs/screenshots/capture-screens.js` (slots/collection captured ad-hoc as of 2026-07-19 — see note below; not yet wired into the script) |
| `textworlds/` | The Act 6 "Text Worlds" bonus wing (behind the select-screen door): the door, the hub chooser, and each of the 5 worlds — Green Dragon (prose), Glimmer Deep + Whisperwood (ASCII tile), Your Own World (the maker), and the IM-friend (local-LLM chat) — with reveal/standalone variants. Act 6 is its own surface here, NOT in `levels/`/`acts/` (which are the 25 curriculum levels + 5 curriculum act pages) | `node docs/screenshots/capture-textworlds.js` |

Regenerate everything:
```bash
node docs/screenshots/capture-all.js        # levels/ + acts/
node docs/screenshots/capture-cards.js      # history-cards/
node docs/screenshots/capture-milestones.js # milestones/
node docs/screenshots/capture-fullcircle.js # cinematics/fullcircle/
node docs/screenshots/capture-cinematics.js # cinematics/{mystery,basement,commandcenter}/
node docs/screenshots/capture-eggs.js       # easter-eggs/
node docs/screenshots/capture-freeplay.js   # freeplay/
node docs/screenshots/capture-screens.js    # screens/
node docs/screenshots/capture-textworlds.js # textworlds/ (Act 6 wing)
```

Every script:
- resolves its server via `DEV_URL` env var, falling back to `.dev-url` at the repo
  root (see `scripts/kk-playwright.js`) — point it at your own static server with
  `DEV_URL=http://127.0.0.1:<port> node docs/screenshots/capture-X.js`
- accepts an optional CLI filter to re-run a subset (e.g.
  `node docs/screenshots/capture-eggs.js xyzzy,konami`,
  `node docs/screenshots/capture-cinematics.js basement`). `capture-all.js` also takes
  `--acts-only` / `--levels-only` (added 2026-09-11) so an act slug doesn't drag its
  five gameplay frames along: `capture-all.js act4-command-center --acts-only`
  regenerates exactly `acts/act4-command-center.png`, which is what a
  `js/ui/cabinet-art.js` change actually needs
- fails loudly (non-zero exit + a FAILED list) if an expected capture is missing —
  silent partial success is not an option (journal L4/F20: guaranteed beats
  probabilistic)
- overwrites cleanly on rerun (idempotent — safe to regenerate after any change)
- reports console errors collected during the run

## levels/25-word-processor.png — the one capture that plays the game (2026-09-11)

Level 25's defining moment is the "MY STORY" coda, which only exists *after* the level's
normal win target is met — so a chrome shot of L25 shows none of it, and this frame used
to be captured by an ad-hoc script (with a note in `docs/features/level-themes.md`
warning that a full rebuild would silently revert it). `capture-all.js` now carries the
coda path itself, and that warning is retired:

```bash
node docs/screenshots/capture-all.js 25                      # the reference frame (1x tier)
CODA_WIN_RATIO=3.5 node docs/screenshots/capture-all.js 25    # verification run at WIZARD
```

It plays the level **through the keyboard** (reading the expected token out of the live
prompt DOM — never poking game state, journal L36), pins `storyRotation['25']` and
clears `kk-stories` so the static story bank and typo beat are deterministic, predicts
the coda by importing the shipping `js/keyboard-story.js` and verifies the engine served
exactly that, screenshots at the first manifesto line, and then keeps typing to the real
LEVEL COMPLETE overlay — so "the capture succeeded" and "the coda is winnable" are the
same check. It fails loudly rather than falling back to a chrome shot.

## The rule

**Screenshots are validating reference artifacts — regenerate the affected set after
changing its feature. Name directories by game surface, never by process or agent.**

## screens/ — continue screen retired, save slots + collection gallery added (2026-07-19)

The single-save continue screen (`continue-screen.png`, `continue-erase-confirm.png`)
no longer exists — `js/slots.js` replaced the single `kk-progress`/`kk-cards` save with
an unlimited list of independent per-family-member saved games, and the returning-player
front door is now the "CHOOSE YOUR GAME" slot picker (`state.screen === 'slots'`; see
`docs/features/save-slots.md` + `docs/features/onboarding-continue.md`). Both retired
PNGs are deleted, and `capture-screens.js`'s old `kk-progress` "continue" section is gone.

`capture-screens.js` now captures these three via built-in, filter-selectable blocks
(**FIXED 2026-07-28** — no longer ad-hoc): `node capture-screens.js slots,collection`
(the `slots` filter shoots the first two, `collection` the third). It seeds `kk-slots`
from the live `js/slots.js` shape with card ids pulled live from `js/history-cards.js`
(so `★ found / total` counts never drift against a literal). The three:
`slots-picker.png` (seeded saved games + the trailing "+ NEW GAME" row, demonstrating the
picker has no fixed cap), `slots-erase-confirm.png` (the picker's per-game `X` → Y/N erase
confirmation), `collection-gallery.png` (the `C`-key card gallery — `★ found / total`
header, owned cards revealed, unfound cards `???`, the secret WarGames card shown in
green). Seed shape for reproducing these:
```js
localStorage.setItem('kk-slots', JSON.stringify({
  v: 1, active: null,
  slots: [ { name, furthestLevel, completed: {}, nameMoment: null, textWorlds: {},
             cards: [<card id>, ...], cardRotation: {} }, ... ],
}));
```

## milestones/ — why it exists (2026-07-12)

Row-unlock moments (a keyboard diagram where every key in a row lights up together —
Level 4's HOME ROW COMPLETE, the Basement cinematic's TOP ROW UNLOCKED cascade, the
Command Center cinematic's FULL KEYBOARD UNLOCKED wave, Level 20's NUMBERS UNLOCKED)
are exactly the kind of screen where a partial-render bug and a normal frame look
similar unless you know the canonical fully-lit state. This set exists because that
exact confusion happened: `cinematics/basement/phase0-milestone.png` was captured
mid-cascade (I/O/P still dark) and read as a broken level, when the actual bug was the
screenshot firing too early — the game was correct. `milestones/` is the "this is what
correct looks like" baseline so the next time a row-unlock screen looks wrong, there's
something to diff against.

**The png/gif rule: animated surfaces get a .gif sibling; the png shows the
held/canonical state, the gif proves the animation.** A static PNG can only prove the
end state holds — it can't prove every key actually lit *in sequence* along the way,
which is exactly the failure mode this set was built to catch. `02-top-row` and
`03-full-keyboard` are driven by a progressive cascade/wave (`js/basement.js`,
`js/commandcenter.js`) and therefore each has a `.gif` sibling covering the full
MILESTONE phase (dark start → cascading → held-full) alongside the `.png`. `01-home-row`
and `04-number-row` are the `#complete-overlay` banners in `js/main.js` — their only
animation is a decorative infinite pulse (`readyPulse`, no progressive reveal), so
there's no "did it cascade correctly" question to answer and they stay png-only.

Gifs are captured via `captureGif()` in `scripts/kk-playwright.js` (records a fresh
Playwright browser context with `recordVideo`, trims to the requested window via
ffmpeg `-sseof`, then a two-pass palette-optimized encode — `/usr/local/bin/ffmpeg`
required). Regenerate the whole set, verify frame-by-frame extraction under
`milestones/.verify-frames/` (scratch, not a deliverable — safe to delete/regenerate):
```bash
node docs/screenshots/capture-milestones.js
node docs/screenshots/capture-milestones.js home-row,top-row   # filtered re-run
```

## cinematics/mystery/ — Approach + Secret Door revision (2026-07-12)

`js/mystery.js` Phases 4-5 were redesigned per `.claude/rules/transitions.md`
"Mystery Beat": Phase 4 (`P.TERMINAL`, ms 13000-25000) is now **The Approach** — a
12-second dolly-in where the cabinet scales from corner-of-the-room size up to
frame-dominant (`DOLLY.MAX_SCALE`) while its green phosphor terminal text resolves
from an out-of-focus smear to fully crisp; blur is a pure function of dolly scale
(`blurForScale`), landing at exactly 0 the instant "COME IN." finishes typing. Phase 5
(`P.DOOR`, ms 25000-33000) is now **The Secret Door** — the cabinet itself hinges/slides
aside to reveal the doorway that was always behind it, rather than a separate back-wall
door appearing. The old `phase3-terminal.png`/`phase4-door.png` captures (and their
back-wall-door composition) are gone; regenerating this set now produces 7 PNGs:

| File | What it proves |
|---|---|
| `phase1-pull.png` | Amber pulse, caution tape falling |
| `phase2-curtain.png` | Velvet curtain mostly dropped, boot beeps |
| `phase3-approach-far.png` | Approach start (scale~1.11, blur~0.92) — fuzzy phosphor smear, barely legible |
| `phase3-approach-mid.png` | Approach midpoint (scale 1.75, blur~0.48) — resolving, softly glowing edges |
| `phase3-approach-crisp.png` | Approach end (blur 0, right after "COME IN." completes) — all three lines fully crisp and inside the screen |
| `phase4-secret-door.png` | Cabinet substantially ajar (ease~0.97) — the machine's crisp terminal AND the lit doorway both composed together |
| `phase5-titlecard.png` | ACT 2 / THE COMPUTER WING |

Per the png/gif rule (see `milestones/` above), the Approach and Secret Door are
animated reveals a static PNG can't fully validate — a paused frame can't prove blur
actually resolves smoothly with scale, or that the hinge-slide clears the doorway
without clipping. Two `.gif` siblings cover them, captured via the same `captureGif()`
helper (`scripts/kk-playwright.js`):

- `approach.gif` — the full 12s dolly (fuzzy far → crisp arrived), 520px/10fps (2.37 MB;
  the milestones/ default of 640px/12fps produced 3.87 MB here — this scene's per-frame
  cost is higher than the milestone cascades because of `drawTerminalLines`' dithered
  multi-pass phosphor-blur smear, so width/fps were stepped down to land under budget)
- `secret-door.gif` — the full 8s hinge-aside (cabinet home → ajar, doorway revealed),
  640px/12fps (2.78 MB)

Regenerate (script now produces both the 7 pngs and the 2 gif siblings in one run):
```bash
node docs/screenshots/capture-cinematics.js mystery
```

## qa/ retirement (2026-07-12)

The old `qa/` directory held 4 screenshots named for the QA agent that took them, not
for what they showed. It has been deleted; every subject is now covered by a
feature-named set:

| Old file | Superseded by |
|---|---|
| `qa/card.png` (level-complete overlay + history card) | `history-cards/*.png` (17 real cards via full playthrough) + `screens/level-complete-overlay.png` (the plain complete overlay, no card) |
| `qa/gameover.png` (survival game-over) | `screens/survival-game-over.png` |
| `qa/settings.png` (settings screen) | `screens/settings-adventure-default.png` + `screens/settings-survival-active.png` |
| `qa/survival-game.png` (survival gameplay HUD) | `freeplay/freeplay-survival-hud.png` (quarters + WPM + timer bar together) + `screens/settings-survival-active.png` |

## Other notes

- `acts/` was renamed from `select/` (2026-07-12) — the five images are the act pages
  of the level-select screen; "acts" names what they show.
- `cinematics/fullcircle/` was moved from four loose `fullcircle-phase*.png` files at
  the `docs/screenshots/` root (2026-07-12) into its own feature directory alongside
  the other three act transitions.
