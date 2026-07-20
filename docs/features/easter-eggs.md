---
feature: easter-eggs
code: [js/themes/terminal.js]
rules: [.claude/rules/easter-eggs.md]
screenshots: docs/screenshots/easter-eggs/
capture: node docs/screenshots/capture-eggs.js
verified: 2026-07-19
---

# Easter Eggs (The Hidden Layer)

The full design catalog (rules, kid-safe boundaries, proposed-but-unbuilt eggs) lives
in `.claude/rules/easter-eggs.md` — this page documents only what's implemented and
exactly how. Most of it (title-screen phrases, WOPR bypass, Konami, console banner,
binary header) lives inside `js/main.js`/`index.html`, whose primary surface is
[[engine-flow]] — that page owns those files in the source graph; this page is the
easter-egg-specific cross-reference into them plus the one file it solely owns,
`js/themes/terminal.js` (whose whisper fragments are otherwise invisible to
[[level-themes]]'s per-theme documentation).

## Title-screen magic words

`EGGS` object, active only while `!state.coinInserted` (before name entry):

| Phrase | Response |
|---|---|
| `xyzzy` | NOTHING HAPPENS. |
| `iddqd` | GOD MODE DENIED. THIS GAME NEVER TAKES LIVES. |
| `adventure` | WARREN ROBINETT WAS HERE. 1979. |
| `eliza` | HOW DOES TYPING MAKE YOU FEEL? |
| `hello` | HELLO. YOU FOUND ME. COME IN. |

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
PROFESSOR FALKEN" banner that hints at (never names) the 5 title-screen phrases and
the Konami sequence.

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

## Related

[[select-screen]] (WOPR bypass consumer) · [[level-themes]] (terminal.js is Level 20's
theme) · [[visual-styling]] (console banner styling) · [[history-cards]] (the secret
`wargames-joshua` card the WOPR bypass now also awards) · [[save-slots]] (the slot the
secret card is written into)
