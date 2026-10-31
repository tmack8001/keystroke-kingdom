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
| `sudo` | PERMISSION GRANTED. YOU ALWAYS HAD IT. | Unix `sudo` + xkcd 149, softened into the game's core message for kids *(built 2026-09-11)* |
| `allyourbase` | ALL YOUR KEYS ARE BELONG TO YOU. | Zero Wing, 1991 — the mistranslation inverted into the game's promise; era-matched to the Basement *(built 2026-09-11)* |

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

### `hello world` in the Word Processor *(Level 25, js/themes/wordprocessor.js — built 2026-07-28)*
When the Level 25 "MY STORY" document ever accumulates the words **hello world**
(case-insensitive, real space), the theme prints once — gently, in warm gold in the
desk's bottom strip, fading in and out over ~5s:
`★  EVERY PROGRAMMER'S FIRST WORDS. WELCOME TO THE CLUB.  ★`
*(The origin of "hello world" — every coder's first program. Every kid who reaches
Level 25 gets there, because the guaranteed `hello world` history card (`hello-world`,
js/history-cards.js) types the phrase in real play.)* A latch fires it at most once per
play; it's a fixed-literal `fillText` (never a DOM sink — security.md rule 1), and it
never pauses, gates, or interrupts flow (the One Rule) — the player keeps typing right
through it. Independent of the card's own gold-glint and the manifesto finale.

---

### Grace Hopper's moth *(js/ui/cabinet-art.js — built 2026-09-11)*
Leave the select screen completely untouched. After ~12s of stillness there is a small
chance each second that a tiny pixel moth flutters in and settles on one of the **lit**
cabinet screens — never a dark, unearned one, because moths go to light. Click it:
`"FIRST ACTUAL CASE OF BUG BEING FOUND."` / `HARVARD MARK II LOGBOOK · SEPTEMBER 9, 1947`,
fading in low on the screen for 7s.
*(The Mark II moth, 9 Sept 1947 — the literal insect taped into the operations logbook.
`research/wiki/moments/mark-ii-moth-1947.md`.)*
**It deliberately does NOT credit Grace Hopper** — the Smithsonian record is clear she
neither found nor logged it — and it does NOT claim the moth coined "bug," which predates
1947. It quotes the logbook's exact caption and nothing more. (This is the F7 lesson: an
overstated attribution once shipped on a child-facing card.)
It can only arrive when nothing is happening; any keypress or navigation sends it away;
missing it costs nothing and it can return. Clicking it never moves the cabinet cursor.

### The rubber duck *(js/ui/cabinet-art.js + js/main.js — built 2026-09-11)*
A tiny yellow duck sits on the Level 20 terminal cabinet's control panel — the Command
Center's actual machine, the one you'd be debugging at. Always there once the cabinet is
earned, dark while it is still a locked silhouette. Never announced, never interactive.
From Level 22 on, the FIRST post-wrong-keypress finger hint gets `STUCK? TELL THE DUCK.`
**appended beneath it** in a quieter grey — never replacing the hint (it bails out entirely
if no hint is on screen), never unprompted (it rides on a hint, and hints only follow a
miss — the opening finger guide stays the one sanctioned exception), once only.
*(Rubber duck debugging — explaining the problem out loud to something that never says a
word. `research/wiki/culture/rubber-duck-debugging.md`.)*

### The white rabbit *(Act 4, Levels 16–20 — built 2026-09-11)*
A small white pixel rabbit very rarely hops across the bottom strip between patterns, then
is gone. No text, no sound, no reward, nothing to click or collect — it follows nothing and
explains nothing. *(The Matrix, 1999 — era-correct for the late-90s Command Center.)*
It belongs to the ROOM, not one cabinet: implemented once in `js/themes/terminal.js` and
imported by `simcity.js` / `goldeneye.js` / `ageofempires.js` / `ff7.js`. Rolled at 1-in-150
**only at a pattern boundary** (never mid-word), at most once per level play, never on the
winning boundary; drawn at 0.89–0.95H, well clear of the keyboard guide at 0.823H. Purely
cosmetic — it never touches the win gate.

### The Y2K clock *(Level 20, js/themes/terminal.js — built 2026-09-11)*
The Command Center's terminal always reads `12/31/99 11:59 PM` in its bottom-right status
corner. Frozen — it never ticks, never animates, is never explained, and nothing in the game
ever mentions it. For the parents who remember.
*(`research/wiki/moments/y2k-bug.md`; the L19 `y2k` history card is the same moment told out
loud.)*

⚠️ **The 12-hour form is now the SOURCED one — do not "fix" it to `23:59`** *(researched
2026-09-18; the wiki was corrected to match, not the other way round)*. The note that used to sit
here — *"era-correct for a US late-90s monitor"* — was written by the builder who shipped the egg,
ratifying its own choice. The evidence says the same thing for a better reason:

**The clock cycle was a property of the LOCALE, never of the screen.** Microsoft's own `time`
reference: *"Depending on the Country/Region selected, time is displayed in the 12-hour format or
the 24-hour format."* So the DOS/Windows command line had **no 24-hour convention of its own** — it
inherited the OS locale like everything else. Windows names the 12-hour case explicitly
(`LOCALE_ITIME` `0` = *"AM/PM 12-hour format"*), and Unicode CLDR places the US in the 12-hour
(`preferred="h"`) group.

**The argument that actually settles it is internal consistency:** `12/31/99` is already a US-format
date, and **date order and clock cycle live in ONE locale record** on both platforms — Microsoft's
single `country` setting, Apple's `'itl0'` struct holding `dateOrder` and `timeCycle` together. So
`12/31/99 23:59` is the one combination a machine of that era would never produce by default.

⚠️ **The honest counter-case, recorded rather than buried:** a real *Unix* console tailing logs would
read `23:59` — RFC 3164 documents syslog's hour as *"a 24-hour format… between 00 and 23."* The
24-hour convention belongs to Unix, not to "terminals" generally. **If Level 20's terminal is ever
re-framed as a Unix box rather than the room's PC-lineage console, this recommendation flips.**
Evidence and limits: `research/wiki/tech/time-display-conventions-1990s.md`.

### The dial-up handshake *(js/audio.js `modemChirp` + js/mystery.js — built 2026-09-11)*
The first time the Mystery Cabinet swings aside and the Computer Wing is revealed, half a
second of modem rides *under* the door — a two-tone answer pair, a warble, and a band-passed
carrier hiss, mixed at roughly a third of the hinge slide and gone before the chord peaks.
*(The dial-up handshake: two modems testing the line and negotiating speed and
error-correction. Hayes' built-in speaker made that negotiation audible and everyone copied
it, which is why the sound is a generation's shared memory of getting online; CBBS, the first
public dial-up BBS, ran from 1978. `research/wiki/culture/dialup-modem.md`.)*
Frequencies are chosen by ear for texture — **no frequency, protocol, or standard is asserted
anywhere in the code or its comments.** Sine/triangle through a bandpass, never sawtooth:
nostalgic, never a klaxon. First time only, latched off `completed['6']` (the first cabinet
inside the wing), so no new storage was added. Respects the sound toggle; never gates the
cinematic.

### The themed 404 *(main.go — built 2026-09-11)*
Any URL the server does not have returns a CRT screen instead of Go's plain
"404 page not found": **LEVEL NOT FOUND** in phosphor green over scanlines, a blinking amber
**INSERT COIN TO CONTINUE** (inert, like every other coin slot here), a **BACK TO THE ARCADE**
link home, and a quiet **ERROR 404** footer. *(Web culture meets arcade.)*
The page is a fixed Go literal — **the requested path is never reflected into it**, which
would be a textbook reflected-XSS sink. It uses a system monospace stack rather than Press
Start 2P, so the one page most likely to be hit offline never blocks on a webfont.
**`/api/*` is excluded** and keeps its bare `text/plain` 404: those are a machine signal the
local-LLM clients feature-detect on (`js/wordgen.js` branches on `status === 404`).

### The eighth-key confession *(js/main.js — built 2026-09-11)*
The first time a saved game finishes **Level 20** — the terminal, once the computer is truly
earned — the level-complete card carries a two-line couplet revealing that the eighth key has
a name, and ends with the character **without ever naming it** (the word is taught earlier, at
Level 13 — product.md §The Key Names — but this couplet itself never says it). One time per saved game; the
latch is derived from `!getProgress().completed['20']`, read before the level is recorded, so
no storage field was added and a replay never re-fires it.
*(The semicolon secret: the NAME is taught at Level 13, the code meaning withheld until the machine is earned. **What is withheld is the
WORD, never the glyph** (Trevor, 2026-10-30): the `;` glyph is on the prompt and the keyboard
guide from Level 4 on, like any other key — the child has typed it hundreds of times by
Level 20. The secret this couplet keeps is that the mark has a NAME; it ends on the glyph
they already know and still does not say the word. INV-29 — the "never say semicolon"
static check — checks the WORD in an allowlisted set of surfaces, never the `;` character, and
stays green.)*

**The couplet was rewritten 2026-10-31 (Trevor; spec `docs/specs/semicolon-teaching-beat.md` §5.8).**
The old second line, `PROGRAMMERS END EVERY LINE WITH IT;`, was **false** — only some lines of
some languages end in `;` (Python needs one only to put two statements on a line; JavaScript and
Go insert it for you; in C, `{`, `}` and `if (…)` carry none) — and the egg research had taken it
from the design bible rather than a source (`research/wiki/tech/semicolon.md` §Corrections).
It is now the **code reveal**, with line 2 `MANY CODERS END AN INSTRUCTION WITH IT;` (read from
the keyboard-card record's `code` field, one source) and two line-1 variants:
- **A**, the save collected the Level 13 keyboard card: `YOU MET ITS NAME AT LEVEL 13.`
- **B**, it did not (WOPR jump, or a save that cleared Level 13 before the beat existed):
  `THE EIGHTH KEY HAS A NAME.`

Both end on the glyph and **neither contains the word** — the confession still never names the
key, so `js/main.js` stays off the INV-29 allowlist. "EVERY LINE" is gone; do not restore it.
Latch unchanged (first Level 20 clear per save).

## Proposed — the menu is EMPTY

*All ten proposals from the original menu are now built (the last nine landed 2026-09-11;
`hello world` landed 2026-07-28 as a document-content trigger rather than the originally-
imagined free-type mode). See "Implemented" above.*

When adding the next one, the design rules at the top of this file are the bar — and note
what the 2026-09-11 batch got right and is worth copying: **every historical claim came from
`research/`, not model memory** (`node scripts/wiki-search.mjs "<topic>"` first), one egg
quoted an institutional artifact verbatim rather than a paraphrase, and one deliberately
withheld an attribution the sources did not support. An egg that asserts something false is
worse than no egg.

Open question worth deciding before the next batch: **the moth is mouse-only** (the spec said
"clicking it"), which sits oddly in a keyboard-first game for a child learning to type. A
keyboard path would be a different egg, not this one.

### Deliberately rejected
- Anything requiring a URL, login, or real network reference (kids retype things)
- Creepypasta-adjacent "haunted game" tropes — wrong emotional register
- References younger than the acts they'd live in (era rule)

---

*Add new eggs to the Implemented table as they're built. The console banner
should hint at title-screen eggs only — deeper eggs stay unhinted.*
