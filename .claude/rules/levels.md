# Level Scaffolding Reference
## Keystroke Kingdom — Full Curriculum Arc

*High-level cross-act view. Each act's full per-level detail (setting, keys, game/cabinet,
era, graphic quality, palette, Lyria music prompt, word content, special/narrative beats,
milestone) lives in its own file — load ONLY the act you're working on:*

- **[Onboarding](levels/onboarding.md)** — first-time + returning-player entry flows, name entry, opening design rules (not an act — read before Act 1)
- **[Act 1 — The Arcade](levels/act1.md)** — Levels 1–5 (home row) + Mystery Beat
- **[Act 2 — The Computer Wing](levels/act2.md)** — Levels 6–10 (top row)
- **[Act 3 — The Basement](levels/act3.md)** — Levels 11–15 (bottom row / full letters)
- **[Act 4 — The Command Center](levels/act4.md)** — Levels 16–20 (number row)
- **[Act 5 — Full Circle](levels/act5.md)** — Levels 21–25 (symbols, Shift, Space/Backspace)

*Cinematic transitions and the opening flow's phase-by-phase detail live in
[`transitions.md`](transitions.md) (a separate concern). The tables below span all five
acts and stay here.*

---

## Why This Order

Every major typing program (Mario Teaches Typing, Mavis Beacon, Dance Mat Typing, TypingClub) teaches keys in the same sequence for the same physiological reasons:

1. **Home row first** — fingers rest here. Muscle memory is free.
2. **E and I next** — the two most-used vowels in English, sitting directly above D and K (middle fingers reach straight up). Also unlocks hundreds of real words immediately.
3. **R and U** — index fingers reach up and in. Common letters; opens "her," "sir," "fur," "rule."
4. **T and Y** — the deepest index finger reaches. T is the #2 most common letter. Y finally means real sentences are possible.
5. **W and O** — ring fingers up. O unlocks "word," "world," "flow," "know."
6. **Q and P** — pinky fingers up. Q is among the rarest letters (only Z is rarer); P completes the top row. Milestone: full top row done.
7. **Bottom row in finger pairs** — V/M (index), B/N (index center), C/comma (middle), X/period (ring), Z/slash (pinky).
8. **Numbers** — different conceptual layer. Index fingers inward from 5/6 outward.
9. **Shift** — two-hand coordination. The last new mechanical concept.

---

## Progressive Graphic Quality — Core Design Principle

**The game's visual fidelity increases with every act, mirroring what was actually happening in the real world.**

When Oona is learning her first two keys, the game looks like 1976 — one color, blocky rectangles, no sprites. By the time she's forming full sentences, the world surrounding her words is stunning. The gameplay teaches her keyboard history at the same time it teaches her the keyboard itself.

This is not just an aesthetic choice. It's a narrative one: the more she knows, the more beautiful the world becomes.

| Act | Levels | Era | Graphic Quality |
|---|---|---|---|
| [1 — The Arcade](levels/act1.md) | 1–5 | 1976–1982 | 1–8 color pixel art, no anti-aliasing, rectangular sprites |
| [2 — The Computer Wing](levels/act2.md) | 6–10 | 1981–1986 | 16-color NES palette, scrolling backgrounds, character animation |
| [3 — The Basement](levels/act3.md) | 11–15 | 1991–1996 | 16-bit SNES/Genesis, parallax, pre-rendered sprites |
| [4 — The Command Center](levels/act4.md) | 16–20 | 1997–2000 | Early 3D, PS1/N64-era polygon rendering |
| [5 — Full Circle](levels/act5.md) | 21–25 | 1980–Present | Levels 21–23: 1–8 color arcade pixel art (The Corner Cabinets). Levels 24–25: modern shaders, particle systems, full resolution |

Within the game's own typing UI, quality scales in parallel:
- **Letter animations** evolve from a simple flash → colored glow → particle burst → full 3D effect
- **Background environments** grow from a plain black screen → a scene → a world
- **The keyboard diagram** evolves from a flat pixel outline → a lit-key graphic → a photorealistic 3D render
- **Word completion effects** grow from a simple line clear → a flourish → a cinematic beat

---

## Act Structure

Each act's setting, per-level breakdown, and milestone narrative live in its own file (linked).

| Act | Levels | Setting | Keys | Milestone |
|---|---|---|---|---|
| [1 — The Arcade](levels/act1.md) | 1–5 + Mystery | 1979 arcade floor | A S D F G H J K L ; | Full home row |
| [2 — The Computer Wing](levels/act2.md) | 6–10 | Back room revealed by Mystery Cabinet | E I R U T Y W O Q P | Full top row |
| [3 — The Basement](levels/act3.md) | 11–15 | Underground club / LAN den | V M B N C , X . Z / | Full letter keyboard |
| [4 — The Command Center](levels/act4.md) | 16–20 | Late-90s server room | 1 2 3 4 5 6 7 8 9 0 | Full number row |
| [5 — Full Circle](levels/act5.md) | 21–25 | The arcade's corner cabinets, then back to the arcade | - = [ ] \ ` ' Shift Space Backspace | Full keyboard |

**Opening Screen & Onboarding** (first-time flow, returning-player flow, the arcade at Level 1, design rules for the opening): see **[Onboarding](levels/onboarding.md)**.

---

## Complete Game Assignment Table

Per-level detail lives in each act file (last column links to it).

| Level | Act | New Keys | Game | Developer | Year | Detail |
|---|---|---|---|---|---|---|
| 1 | The Arcade | J, F | Breakout | Atari | 1976 | [act1.md](levels/act1.md) |
| 2 | The Arcade | D, K | Space Invaders | Taito | 1978 | [act1.md](levels/act1.md) |
| 3 | The Arcade | S, L | Pac-Man | Namco | 1980 | [act1.md](levels/act1.md) |
| 4 | The Arcade | A, the eighth key | Galaga | Namco | 1981 | [act1.md](levels/act1.md) |
| 5 | The Arcade | G, H | Joust | Williams | 1982 | [act1.md](levels/act1.md) |
| 6 | Computer Wing | E, I | Donkey Kong | Nintendo | 1981 | [act2.md](levels/act2.md) |
| 7 | Computer Wing | R, U | Dragon's Lair | Cinematronics | 1983 | [act2.md](levels/act2.md) |
| 8 | Computer Wing | T, Y | Tetris | Alexey Pajitnov (Nintendo Game Boy version, 1989) | 1984 | [act2.md](levels/act2.md) |
| 9 | Computer Wing | W, O | Super Mario Bros | Nintendo | 1985 | [act2.md](levels/act2.md) |
| 10 | Computer Wing | Q, P | The Legend of Zelda | Nintendo | 1986 | [act2.md](levels/act2.md) |
| 11 | The Basement | V, M | Sonic the Hedgehog | Sega | 1991 | [act3.md](levels/act3.md) |
| 12 | The Basement | B, N | Street Fighter II | Capcom | 1991 | [act3.md](levels/act3.md) |
| 13 | The Basement | C, comma | Myst | Cyan | 1993 | [act3.md](levels/act3.md) |
| 14 | The Basement | X, period | Donkey Kong Country | Rare / Nintendo | 1994 | [act3.md](levels/act3.md) |
| 15 | The Basement | Z, slash | Pokémon Red/Blue | Game Freak / Nintendo | 1996 | [act3.md](levels/act3.md) |
| 16 | Command Center | 5, 6 | SimCity 2000 | Maxis | 1993 | [act4.md](levels/act4.md) |
| 17 | Command Center | 4, 7 | GoldenEye 007 | Rare | 1997 | [act4.md](levels/act4.md) |
| 18 | Command Center | 3, 8 | Age of Empires | Ensemble | 1997 | [act4.md](levels/act4.md) |
| 19 | Command Center | 2, 9 | Final Fantasy VII | Square | 1997 | [act4.md](levels/act4.md) |
| 20 | Command Center | 1, 0 | Terminal / Command Line | — | 1960s–∞ | [act4.md](levels/act4.md) |
| 21 | Full Circle | -, = | Out Run | Sega | 1986 | [act5.md](levels/act5.md) |
| 22 | Full Circle | [, ], \ | Q*bert | Gottlieb | 1982 | [act5.md](levels/act5.md) |
| 23 | Full Circle | `, ' | Missile Command | Atari | 1980 | [act5.md](levels/act5.md) |
| 24 | Full Circle | Shift | High Score Entry (player's own name) | — | — | [act5.md](levels/act5.md) |
| 25 | Full Circle | Space, Backspace | Word Processor (first sentences) | — | — | [act5.md](levels/act5.md) |

---

## Word Bank Expansion by Act

| Stage | Keys Available | Prompt Type | Representative Words |
|---|---|---|---|
| Act 1, L1–2 | J F D K | Patterns only | jf, dk, jfdk |
| Act 1, L3 | + S L | Patterns only (no vowel yet) | sl, ls, sdfjkl, dksl |
| Act 1, L4 | + A ; | First words | dad, sad, fad, lad, ads, lads, lass, flask, falls |
| Act 1, L5 | + G H | Words | shag, slag, dash, gash, glad, half, lash |
| Act 2, L6 | + E I | Words | idea, side, hide, said, file, skill, feel, deal |
| Act 2, L7 | + R U | Words | rule, fire, lure, dusk, rust, rush, girl |
| Act 2, L8 | + T Y | Words | try, stay, style, dusty, today, story, glory |
| Act 2, L9 | + W O | Words | word, world, flow, glow, wolf, sword, follow |
| Act 2, L10 | + Q P | Words | stop, drop, trip, spell, sport, quick |
| Act 3, L11 | + V M | Words | move, arm, farm, warm, firm, storm, brave |
| Act 3, L12 | + B N | Words | bone, burn, kind, mind, brain, train, town |
| Act 3, L13 | + C , | Words + comma phrases | cool, care, face, nice, slice — "word, word" |
| Act 3, L14 | + X . | Words + full sentences | mix, fix, next, text, extra — "Skill is built." |
| Act 3, L15 | + Z / | Words + sentences | zero, buzz, jazz, blaze, prize |
| Act 4 | + 0–9 | Equations, dates | Type your age. Type 10 + 5. |
| Act 5, L21 | + - = | Compound words, equations | zig-zag, flip-flop, ping-pong — 2-1=1, 10-5=5 |
| Act 5, L22 | + [ ] \ | Bracketed words, path-style drills | [go] [run] [play] — a\b, fun\run, \o/ |
| Act 5, L23 | + ` ' | Contractions, code-tick words | don't, it's, we're — \`run\`, \`play\` |
| Act 5, L24 | + Shift | Capitalized names | Sun, Moon, Star, King — (player's own name) |
| Act 5, L25 | + Space, Backspace | Phrases, full sentences | the end, i can type — "I can type." "The end." |

---

## Milestones and Narrative Beats

| Milestone | Trigger | What Happens |
|---|---|---|
| Home row complete | Level 4 finish | Mystery Cabinet begins to glow |
| Reach keys complete | Level 5 finish | Mystery Cabinet curtain drops — it's a computer |
| Computer Wing opens | Mystery beat | The back door appears. Act 2 begins. |
| Top row complete | Level 10 finish | TOP ROW UNLOCKED — keyboard diagram top bar fully lights |
| Basement opens | Level 10 finish | Trapdoor in the floor. Basement glows from below. |
| Full letter keyboard | Level 15 finish | Every letter key lights simultaneously. |
| Command Center opens | Level 15 finish | A staircase rises. Numbers floor revealed. |
| Number row complete | Level 20 finish | Binary → HELLO. The first program. |
| Full circle | Level 20 finish | Back to the arcade. Every cabinet glowing. Level 21 begins immediately. |
| Corner cabinets cleared | Level 23 finish | All three forgotten cabinets lit. Symbol keys complete. |
| Player types their name | Level 24 finish | High score entry. The player's own name, in caps, on screen. |
| Full keyboard mastered | Level 25 finish | The player types their own first sentence. "You built this." |

---

*All 25 levels are built and playable. This document is the curriculum reference — update it whenever a level's design changes. Per-act detail (and its own milestone) lives in `levels/act1.md`…`act5.md`; this file holds the cross-act tables. Cinematic transitions live in `transitions.md`.*
