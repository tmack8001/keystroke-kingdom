---
feature: easter-eggs
code: [js/themes/terminal.js]
rules: [.claude/rules/easter-eggs.md]
screenshots: docs/screenshots/easter-eggs/
capture: node docs/screenshots/capture-eggs.js
verified: 2026-09-11
---

# Easter Eggs (The Hidden Layer)

The full design catalog — rules, kid-safe boundaries, and each egg's *cited* history
(the moth's withheld attribution, the modem handshake's non-claims) — lives in
`.claude/rules/easter-eggs.md`. This page documents only what's implemented and exactly
how: where the code lives, what latches it, and what it can never do.

**As of 2026-09-11 the design doc's "Proposed" menu is empty** — the nine remaining
proposals all landed in one wave, which spread the hidden layer across six more files.
Only `js/themes/terminal.js` is owned by this page in the source graph; every other egg
below lives in a file another page owns, and is cross-referenced from here so the
catalog stays in one place:

| Surface | Code | Owning page |
|---|---|---|
| Magic words, Konami, console banner, eighth-key confession, duck hint line | `js/main.js` | [[engine-flow]] |
| Binary header | `index.html` | [[engine-flow]] |
| Terminal whispers, white rabbit, Y2K clock | `js/themes/terminal.js` | **this page** |
| `hello world` line | `js/themes/wordprocessor.js` | [[level-themes]] |
| The moth, the rubber duck (cabinet art) | `js/ui/cabinet-art.js` | [[select-screen]] |
| Dial-up handshake | `js/audio.js` + `js/mystery.js` | [[audio]] / [[cinematics]] |
| Themed 404 | `main.go` | [[wordgen]] (the page that owns `main.go`) |

## Title-screen magic words

`EGGS` object, active only while `!state.coinInserted` (before name entry):

| Phrase | Response |
|---|---|
| `xyzzy` | NOTHING HAPPENS. |
| `iddqd` | GOD MODE DENIED. THIS GAME NEVER TAKES LIVES. |
| `adventure` | WARREN ROBINETT WAS HERE. 1979. |
| `eliza` | HOW DOES TYPING MAKE YOU FEEL? |
| `hello` | HELLO. YOU FOUND ME. COME IN. |
| `sudo` | PERMISSION GRANTED. YOU ALWAYS HAD IT. |
| `allyourbase` | ALL YOUR KEYS ARE BELONG TO YOU. |

`sudo` and `allyourbase` were added 2026-09-11 as ordinary `EGGS` entries — no new
mechanism, no new listener, no change to the matching logic. Reference frames:
`docs/screenshots/easter-eggs/title-sudo.png`, `title-allyourbase.png`.

Keys typed build a lowercase `secretBuffer`, echoed live into `#wopr-text`; exact
match against `EGGS[secretBuffer]` triggers `showEggResponse(text)` — sets
`#wopr-text` via `.textContent`, plays `Audio.coin()`, clears after 5000ms (only if
the text hasn't already changed, so a fast successive egg isn't stomped). `Backspace`
trims the buffer live.

## WOPR select-screen bypass

`SECRET_PHRASES = ['shallweplayagame', 'wopr', 'wargames', 'joshua']` (`joshua` added
2026-07-19 alongside the history-cards rebuild), checked in **two** separate listeners:
the title screen (pre-coin, buffer echoed to `#wopr-text`) and the ready screen (buffer
not echoed anywhere, with an extra prefix-reset optimization the title listener lacks).
Exact match on any phrase sets `state.selectBypass = true`, `state.selectedLevel = 1`,
renders and shows the select screen — every cabinet becomes selectable regardless of
progress — **and** calls `Slots.collectCardId('wargames-joshua')`, awarding the secret
WarGames history card (`WARGAMES_CARD_ID`) to the active save slot (harmless no-op if no
slot is active yet). See [[select-screen]] and [[history-cards]].

## Konami code

`['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']`,
title screen only, pre-coin. A simple index state-machine (`trackKonami`) that resets
to `1` (not `0`) when the key at least matches the sequence's first key, allowing
immediate re-attempt. On match: spawns 30 `.star.bright` divs at random positions
appended to `document.body`, then shows "30 STARS. NO EXTRA LIVES NEEDED — YOU NEVER
LOSE ANY." — the classic code grants 30 lives; this game has none to grant.

## Console banner

Runs unconditionally at module load. A `%c`-styled `console.log` WarGames "GREETINGS
PROFESSOR FALKEN" banner that hints at (never names) **four** of the seven title-screen
phrases — `xyzzy`, `iddqd`, `adventure`, `eliza` — plus the Konami sequence. `hello`,
`sudo`, and `allyourbase` are deliberately unhinted; the banner text was not changed by
the 2026-09-11 batch, keeping the design rule that the console hints at title-screen
eggs only and deeper eggs stay unhinted.

## Binary header

`index.html`, first lines — an HTML comment in binary immediately after `<!DOCTYPE
html>`, decoding byte-by-byte to `SHALL WE PLAY` (three words: SHALL, WE, PLAY).

## Terminal whispers (Level 20, `js/themes/terminal.js`)

No separate probability system — these are plain entries mixed into the existing
`POOL_FRAGMENTS` array (20 entries total; the last 5 are the hacker-history whispers:
`> XYZZY`, `> 2600 HZ`, `> ELIZA: HI`, `> MOTH: 1947`, `> 42`). Selection in
`keystroke(key)` is **deterministic, not random**: every 3rd keystroke
(`chars % 3 === 0`) pushes `POOL_FRAGMENTS[chars % POOL_FRAGMENTS.length]` — cycling
through all 20 fragments in a fixed order every 60 keystrokes.

## The white rabbit (Act 4, Levels 16-20 — built 2026-09-11)

Implemented **once** in `js/themes/terminal.js` and imported by the other four Command
Center themes (`simcity.js`, `goldeneye.js`, `ageofempires.js`, `ff7.js`) — the act
shares one rabbit rather than five copies. Only one theme is ever active at a time, so
the single module-level state is correct. Three exported functions, wired identically
in all five themes:

- `resetWhiteRabbit()` — called from each theme's `start()`; a fresh play gets a fresh
  chance (`rabbit = null`, `rabbitSeen = false`, boundary counter zeroed).
- `maybeWhiteRabbit(won)` — called from each theme's `patternComplete()`, passing that
  theme's own win state. Rolls `RABBIT_CHANCE` (**1/150**) and spawns at most once per
  play (`rabbitSeen`), never before `RABBIT_MIN_BOUNDARIES` (2) boundaries, and **never
  on the winning boundary** (so it can't collide with the celebration). Because it only
  runs at a pattern boundary, a rabbit can never appear mid-word.
- `drawWhiteRabbit(c, W, H)` — called late in each theme's render loop, taking the
  context explicitly and leaving no canvas state behind (journal L28). Two 13×9 pixel
  frames (leap / land) alternate off the hop phase; the crossing runs `RABBIT_MS`
  (2800ms) fully off-canvas at both ends, in a randomly chosen direction, mirrored for a
  right-to-left run. Position derives from **clamped** elapsed time, never a raw frame
  counter (journal F1). Feet ride at `0.95H` with a hop apex near `0.89H` — the bottom
  strip, clear of the keyboard guide's measured `0.823H` bottom edge and far from the
  prompt panel. A dark backing pass is drawn under the white sprite so it reads over a
  bright scene (SimCity's skyline) as well as a dark one.

Placement notes per theme: `ff7.js` and `simcity.js` draw it OUTSIDE their camera
transforms (battle push-in / camera bob), so the rabbit crosses the real screen rather
than the wobbling stage; `terminal.js` draws it under the barrel-glass pass so it sits
behind the CRT curvature like everything else on that screen.

Cosmetic only: no text, no sound, no reward, nothing clickable or collectible, and
`maybeWhiteRabbit`'s return value is discarded — the win gate is untouched.

## The Y2K clock (Level 20, `js/themes/terminal.js` — built 2026-09-11)

`Y2K_CLOCK = '12/31/99 11:59 PM'`, a fixed code literal drawn by `drawY2KClock(W, H)`
on **every** frame of the terminal scene — it never ticks, never animates, is never
referenced by any other code, and nothing in the game mentions it. Rendered right-
aligned at `(0.962W, 0.888H)` — the bottom-right stage corner per the theme layout
contract — in phosphor green at `globalAlpha` 0.72 with a small shadow blur, with
`textAlign`/`textBaseline` set explicitly (journal L28) and restored. `fillText` only,
never a DOM sink. Visible in the reference frame
`docs/screenshots/levels/act4-command-center/20-terminal.png` (regenerated 2026-09-11).

## The rubber duck (built 2026-09-11)

Two halves, in two files:

1. **The duck itself** — set dressing on the Level 20 terminal cabinet's control panel
   in the select screen, via `CABINET_DATA[20].drawExtras` → `drawRubberDuck`. Full
   detail (and the `drawExtras` hook it introduced) at [[select-screen]]; visible in
   `docs/screenshots/acts/act4-command-center.png`.
2. **The hint line** — `DUCK_HINT = 'STUCK? TELL THE DUCK.'` in `js/main.js`.
   `maybeShowDuckHint()` is called from the wrong-keypress branch of `handleGameKey`,
   *immediately after* `showFingerHint(expected)`, and:
   - returns early unless `state.level >= 22` and the once-per-page-load latch
     (`duckHintShown`) is unset;
   - **bails out entirely if `#finger-hint` has no `firstChild`** — i.e. if no hint is
     actually on screen. It can therefore never stand in for a hint, only ride under
     one, which keeps the real help primary;
   - never appears unprompted: hints only follow a wrong keypress, so the opening
     finger guide at the very first prompt stays the game's single sanctioned
     unprompted hint (onboarding.md), and this does not become a second exception;
   - appends a `createElement('div')` with `textContent` (fixed literal, security.md
     rules 1-2), styled inline at a quieter full-opacity grey (`#8a8a8a`) rather than
     element opacity (journal L2/F3).

   The latch is per page load rather than per saved game — deliberate, because the only
   field-validated progress store is `js/slots.js`, which `main.js` does not own.
   Invariant: **INV-75**.

## The eighth-key confession (Level 20 complete, `js/main.js` — built 2026-09-11)

The one hidden line that is a REVEAL rather than a summons — nothing is typed to get
it. `EIGHTH_KEY_CONFESSION` is a two-line couplet stating that the eighth key has a name
and that programmers end every line with it, **ending with the character without ever
naming it** — so the in-game anonymity rule (CLAUDE.md; static check INV-29) stays
green while the player is let in on the joke.

- **Trigger**: `showLevelComplete()` computes
  `eighthKeyReveal = !state.freePlay && state.level === 20 && !getProgress().completed['20']`
  — read *before* `recordLevelComplete` writes that flag, so the latch is derived from
  existing progress with **no new persisted field**, and is naturally per saved game: a
  replay never re-fires it, and another family member's game gets its own reveal.
- **Render**: `renderEighthKeyConfession(show)` removes any prior node, then inserts a
  `#eighth-key-confession` div before `#complete-prompt` inside `.complete-modal`.
  `textContent` from a fixed literal, `white-space:pre-line` so the couplet breaks on
  its own newline rather than the modal width, and a full-opacity muted green
  (`#35c94a`, ~9:1 on the modal's black) instead of element opacity (journal L2/F3).
- **It never gates anything** — the complete overlay is already a natural pause point;
  this is decoration on it. Invariant: **INV-73**.

**No reference frame**: `docs/screenshots/screens/level-complete-overlay.png` is
captured at Level 1 (the fastest level, no history card), and no capture script drives a
first-ever Level 20 completion. Flagged rather than left silently unvalidated.

## The dial-up handshake (built 2026-09-11)

`Audio.modemChirp(0.45)` fired once from `js/mystery.js`'s Phase 5 `!chordStarted`
block, gated on `isFirstEntryToComputerWing()` — a latch derived from
`Slots.getProgress().completed['6']` with no new storage. Synthesis: [[audio]].
Trigger, latch rationale, and defensive-read behavior: [[cinematics]].

## The themed 404 (`main.go` — built 2026-09-11)

`themedNotFound(next http.Handler)` wraps the static file handler; `notFoundWriter`
watches for a 404 status, rewrites the headers for an HTML body
(`Content-Type: text/html`, `X-Content-Type-Options: nosniff`, `Content-Length`
dropped), swallows Go's plain-text body, and `themedNotFound` writes `notFoundPage` —
a CRT screen reading **LEVEL NOT FOUND** over scanlines with a blinking (never
invisible: 1 → 0.45 opacity, and disabled under `prefers-reduced-motion`) amber INSERT
COIN TO CONTINUE, a BACK TO THE ARCADE link, and an ERROR 404 footer. Every other
status passes through untouched, so normal asset serving, content-type sniffing, and
directory redirects are unaffected; HEAD requests still get headers only.

Three implementation facts worth keeping true:

- **`notFoundPage` is a fixed literal.** The requested path, query string, and headers
  are deliberately absent from it — reflecting a URL into an HTML body is the textbook
  reflected-XSS sink. It must never grow a format verb (security.md threat model).
- **No webfont.** It uses a system monospace stack rather than the Google-hosted Press
  Start 2P, so the page most likely to be hit offline never blocks on a third-party
  request (also keeping the 404 free of external network calls — security.md rule 6).
- **`/api/*` is excluded** and keeps its bare `text/plain` 404. Those 404s are a machine
  signal the local-LLM clients feature-detect on (`js/wordgen.js` branches on
  `status === 404`), not a page a human reads — see [[wordgen]].

This egg exists **only in the Go binary / Docker**. The published GitHub Pages build
serves GitHub's own 404 (see `.claude/rules/visual-validation.md` §The Three
Environments). No reference frame — `capture-eggs.js` drives the title screen on a
plain static server and has no path to the Go server's 404.

## `hello world` in the Word Processor (Level 25, `js/themes/wordprocessor.js` — built 2026-07-28)

Former proposal #6 in `.claude/rules/easter-eggs.md`, now Implemented. Owned in the
source graph by [[level-themes]] (this page's `code:` is `js/themes/terminal.js`
only) — documented there in full ("Word Processor (Level 25) — finale sub-line
spacing + the `hello world` egg"); cross-referenced here for the catalog. Summary:
when the Level 25 "MY STORY" document's accumulated text first contains **hello
world** (case-insensitive — typed in real play via the guaranteed `hello-world`
history card, see [[history-cards]]), the theme fades in a one-time warm-gold line,
`★ EVERY PROGRAMMER'S FIRST WORDS. WELCOME TO THE CLUB. ★`, in the desk's bottom
strip (~5s, latched to once per play). Fixed literal `fillText` only (security.md
rule 1); never gates, pauses, or interrupts flow.

## Related

[[select-screen]] (WOPR bypass consumer; owns the moth and the rubber duck's cabinet
art) · [[level-themes]] (terminal.js is Level 20's theme; also owns the `hello world`
Word Processor egg above, and documents the white rabbit's per-theme wiring) ·
[[engine-flow]] (owns `js/main.js`/`index.html`: the magic words, Konami, console
banner, binary header, eighth-key confession, and the duck's hint line) ·
[[visual-styling]] (console banner styling) · [[audio]] + [[cinematics]] (the dial-up
handshake) · [[wordgen]] (owns `main.go`, where the themed 404 lives, and the `/api/*`
404 signal it deliberately leaves alone) · [[history-cards]] (the secret
`wargames-joshua` card the WOPR bypass now also awards; the guaranteed `hello-world`
card word the Word Processor egg detects) · [[save-slots]] (the slot the secret card is
written into)

## Reference frames

`docs/screenshots/easter-eggs/` — one per magic word
(`title-{xyzzy,iddqd,adventure,eliza,hello,sudo,allyourbase}.png`) plus
`title-konami.png`, `wopr-select-screen.png`. Regenerate a single egg with
`node docs/screenshots/capture-eggs.js <name>` (e.g. `sudo,allyourbase`, captured
2026-09-11); the script's wire-check against `js/main.js`'s live `EGGS` table is FATAL
on drift by design, so a new phrase must be added to its `EGG_PHRASES` list before any
capture will run.

**Coverage gap, flagged not hidden.** `capture-eggs.js` covers title-screen eggs only.
Six built eggs have no capture path at all — the moth (needs 12s of stillness + a 3%
roll), the white rabbit (1-in-150 at a pattern boundary), the eighth-key confession
(needs a first-ever Level 20 completion), the themed 404 (needs the Go binary), the
dial-up chirp (audio — headless cannot hear), and the duck's hint line (needs a wrong
keypress at Level 22+). Two are incidentally covered by other pages' sets: the Y2K
clock in `levels/act4-command-center/20-terminal.png` and the rubber duck in
`acts/act4-command-center.png` (both regenerated 2026-09-11).
