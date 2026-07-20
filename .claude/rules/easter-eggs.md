# Hacker Culture Easter Eggs
## Keystroke Kingdom — The Hidden Layer

The game's deepest theme is that typing unlocks computing. The easter eggs are
that theme made literal: a hidden layer of real hacker history, findable only
by the curious. Every egg rewards the instinct this game exists to create —
*poke at the machine and see what it says back.*

---

## Design Rules (non-negotiable)

1. **Never interrupt flow.** Eggs only answer when summoned by name. Nothing
   pops up unprompted during play. (Same law as everything else in the game.)
2. **Kid-safe, parent-winking.** Every reference must be harmless to a child
   who stumbles on it and delightful to an adult who recognizes it.
3. **Era-authentic.** Each egg belongs to real computing history, ideally
   matched to the act where it lives.
4. **The no-punishment rule extends to eggs.** Cheat codes for lives get the
   canonical reply: this game has no lives to grant.
5. **Eggs are for finding, not telling.** The game never advertises them.
   The only breadcrumb is the browser console — because opening the console
   IS the first hacker act.

---

## Implemented

### The WOPR select screen *(pre-existing — the original gem; `joshua` + secret card added 2026-07-19)*
Type `wopr`, `wargames`, `shallweplayagame`, or `joshua` on the title or ready screen →
"GREETINGS PROFESSOR FALKEN / SHALL WE PLAY A GAME?" level select.
*(WarGames, 1983 — `joshua` is the WOPR's backdoor password and the machine's own name.)*
Typing any of these four also **collects the hidden WarGames history card** (`joshua` /
"W.O.P.R. — WARGAMES") into the active game's collection — a **secret card** (`level: null`
in `js/history-cards.js`, never in a level's pool) findable only by knowing the words, but
counting toward the collection total. A hidden Skulltula for the curious.

### Title-screen magic words *(js/main.js `EGGS`)*
Typed blind on the attract screen; answer appears in the WOPR text line for 5s:
| Phrase | Response | Reference |
|---|---|---|
| `xyzzy` | NOTHING HAPPENS. | Colossal Cave Adventure, 1976 — the canonical non-response |
| `iddqd` | GOD MODE DENIED. THIS GAME NEVER TAKES LIVES. | Doom, 1993 — refused because of our one rule |
| `adventure` | WARREN ROBINETT WAS HERE. 1979. | The first video game easter egg — Robinett hid his name in 1979 (the year our arcade lives in); the game shipped March 1980 |
| `eliza` | HOW DOES TYPING MAKE YOU FEEL? | ELIZA, 1966 — the first chatbot |
| `hello` | HELLO. YOU FOUND ME. COME IN. | The Mystery Cabinet's own greeting, echoed back |

### Konami code *(title screen)*
`↑ ↑ ↓ ↓ ← → ← → B A` → thirty extra stars appear in the sky +
"30 STARS. NO EXTRA LIVES NEEDED — YOU NEVER LOSE ANY."
*(Konami, 1986. The classic grants 30 lives; we grant light.)*

### The console greeting *(js/main.js, bottom)*
Opening browser DevTools prints a WOPR-styled banner with cryptic hints to the
title-screen eggs. Inspecting the page is rewarded, never spoiled outright.

### The binary header *(index.html, first lines)*
An HTML comment in binary. Decodes to `SHALL WE PLAY`. For view-source people.

### Terminal whispers *(Level 20, js/themes/terminal.js)*
The scrolling terminal occasionally prints: `> XYZZY`, `> 2600 HZ` (the phone
phreaks' tone), `> ELIZA: HI`, `> MOTH: 1947` (Grace Hopper's first actual bug),
`> 42` (Deep Thought's answer).

---

## Proposed (unbuilt — the menu)

Ordered roughly by bang-for-effort. Each stays within the design rules.

1. **Grace Hopper's moth** — very rarely, a tiny pixel moth lands on an idle
   cabinet screen (select screen). Clicking it: "FIRST ACTUAL CASE OF BUG
   FOUND. — SEPT 9, 1947." The origin of "debugging," as a hide-and-seek moment.
2. **`sudo` empowerment** — typing `sudo` on the title screen →
   "PERMISSION GRANTED. YOU ALWAYS HAD IT." (Unix + xkcd 149, softened into
   the game's core message for kids.)
3. **The white rabbit** — in Act 4 (late-90s Command Center), a small white
   pixel rabbit very rarely hops across the bottom of the screen between
   patterns. Follows nothing. Explains nothing. *(The Matrix, 1999.)*
4. **Rubber duck** — a tiny yellow duck sits on the Command Center server rack
   in the select-screen cabinet art. Level 22+ hint text once says: "STUCK?
   TELL THE DUCK." *(Rubber duck debugging.)*
5. **Dial-up handshake** — entering the Computer Wing for the first time, a
   half-second of modem chirp under the door-opening sound. *(BBS era.)*
6. **`hello world` in Level 25** — if the player's free-typed word-processor
   text ever equals "hello world", the page prints: "EVERY PROGRAMMER'S FIRST
   WORDS. WELCOME TO THE CLUB." (Requires L25 free-type mode.)
7. **Y2K clock** — one monitor in the Command Center background always reads
   `12/31/99 11:59 PM`. Never explained. *(For the parents who remember.)*
8. **Themed 404** — the Go server's 404 page: a CRT screen reading
   "LEVEL NOT FOUND. INSERT COIN TO CONTINUE." *(Web culture meets arcade.)*
9. **The eighth key confession** — after Level 20 (the terminal), a one-time
   line: "THE EIGHTH KEY HAS A NAME. PROGRAMMERS END EVERY LINE WITH IT;"
   — the semicolon secret, revealed only after the computer is earned.
10. **`all your base`** — Basement-era (1991) title egg: typing
    `allyourbase` → "ALL YOUR KEYS ARE BELONG TO YOU." *(Zero Wing, inverted
    into the game's promise.)*

### Deliberately rejected
- Anything requiring a URL, login, or real network reference (kids retype things)
- Creepypasta-adjacent "haunted game" tropes — wrong emotional register
- References younger than the acts they'd live in (era rule)

---

*Add new eggs to the Implemented table as they're built. The console banner
should hint at title-screen eggs only — deeper eggs stay unhinted.*
