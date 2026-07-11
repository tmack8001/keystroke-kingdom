# Hacker Culture Reference
## Research behind the game's hidden layer

*Compiled 2026-07-10/11 while designing the easter-egg system. The in-game catalog and
design rules live in `.claude/rules/easter-eggs.md`; this file is the background research —
what each reference IS, why it matters, and why it earned a place (or didn't).*

The framing insight: the game's deepest theme is that typing unlocks computing. Hacker
culture is that theme's native folklore. Every egg rewards the exact instinct the game
exists to create — *poke at the machine and see what it says back.* Opening the browser
console is a child's (or parent's) first genuine hacker act, which is why the console
carries the only hints.

---

## References used in the game

| Reference | Year | What it is | In-game use |
|---|---|---|---|
| WOPR / "Shall we play a game?" | 1983 | WarGames' NORAD computer; the film that taught a generation that terminals talk back | The original secret: `wopr`/`wargames`/`shallweplayagame` → level-select screen styled as the WOPR terminal ("GREETINGS PROFESSOR FALKEN") |
| XYZZY | 1976 | Colossal Cave Adventure's magic word; the canonical response elsewhere is "Nothing happens." | Title screen: typing it → `NOTHING HAPPENS.` — the joke IS the accuracy |
| Warren Robinett / Adventure | 1979 | The first video game easter egg — Robinett hid his name in a secret room because Atari didn't credit developers. 1979 = the exact year our arcade is set | `adventure` → `WARREN ROBINETT WAS HERE. 1979.` The most thematically perfect egg in the game |
| IDDQD | 1993 | Doom's god-mode cheat | Refused, on principle: `GOD MODE DENIED. THIS GAME NEVER TAKES LIVES.` — the no-punishment rule as a punchline |
| ELIZA | 1966 | Joseph Weizenbaum's first chatbot; Rogerian therapist built from pattern-matching | `eliza` → `HOW DOES TYPING MAKE YOU FEEL?` Also whispers on the L20 terminal |
| Konami Code | 1986 | ↑↑↓↓←→←→BA — Kazuhisa Hashimoto's test cheat, left in Gradius; 30 lives in Contra | 30 extra *stars* (we grant light, not lives) |
| 2600 Hz | 1971-era | The phone-phreak tone (Captain Crunch whistle) that seized trunk lines; namesake of 2600 Magazine and, punningly, the Atari 2600 | Terminal whisper `> 2600 HZ` |
| Grace Hopper's moth | 1947 | The literal first "bug" — a moth taped into the Harvard Mark II logbook: "First actual case of bug being found" | Terminal whisper `> MOTH: 1947`; full story on the Level 13 history card; a hide-and-seek moth is proposed egg #1 |
| 42 | 1979 | Deep Thought's Answer (Hitchhiker's Guide — published 1979, on-theme) | Terminal whisper `> 42` |
| HELLO / binary | — | `01001000…` = HELLO; bookends the game (Mystery Cabinet says it; Level 20 decodes it) | `hello` typed on the title → the Mystery Cabinet's own greeting echoed back; binary HTML comment decodes to SHALL WE PLAY |
| View source / console culture | — | "Curious people read the page source" is foundational web-hacker culture | Console banner (WOPR-styled, hints at title eggs); binary comment atop index.html |

## Researched, proposed, not yet built (menu in easter-eggs.md)

- **sudo** (Unix, + xkcd 149 "sudo make me a sandwich") → softened into kid empowerment:
  "PERMISSION GRANTED. YOU ALWAYS HAD IT."
- **The white rabbit** (The Matrix, 1999 — Command Center era-correct)
- **Rubber duck debugging** (The Pragmatic Programmer, 1999)
- **Dial-up modem handshake** (BBS era — Computer Wing door sound)
- **Y2K** (a monitor frozen at 12/31/99 23:59)
- **All your base are belong to us** (Zero Wing 1991, Basement era) → inverted:
  "ALL YOUR KEYS ARE BELONG TO YOU."
- **hello world** (K&R, 1978) — awaits the Level 25 free-type mode
- **The eighth-key confession** — the semicolon's identity revealed only after Level 20,
  as a programmer's rite: "PROGRAMMERS END EVERY LINE WITH IT;"
- **Themed 404** ("LEVEL NOT FOUND. INSERT COIN TO CONTINUE.")
- **Hopper's moth** as a rare clickable on the select screen

## Rejected categories (and why)
- Anything requiring URLs/logins/networks — kids retype what they see
- "Haunted game" creepypasta tropes — wrong emotional register for this game
- References younger than the act they'd inhabit — breaks the era-authenticity rule
- Leetspeak identity jokes — dated in the wrong way, no history lesson inside

## Design rules distilled (enforced in easter-eggs.md)
1. Summoned by name only — never interrupts play
2. Kid-safe on discovery, parent-delightful on recognition
3. Era-authentic, ideally act-matched
4. Cheat codes for lives get refused — the no-punishment rule extends to eggs
5. The console is the only breadcrumb; deeper eggs stay unhinted
