# Keystroke Kingdom

A retro 1979 arcade typing game for kids learning to read and type together. Built by a dad and his daughter, Oona.

## Project Documents

@.claude/rules/product.md
@.claude/rules/tech.md
@.claude/rules/visual-validation.md

Also load when relevant (not auto-included): `.claude/rules/levels.md` (full curriculum),
`.claude/rules/transitions.md` (cinematics), `.claude/rules/easter-eggs.md` (hidden layer),
`docs/ROADMAP.md` (living backlog — **check this at session start**), `research/*.md`
(pedagogy, hacker culture, game history background).

## Quick Reference

### What This Is
A browser-based typing game where a child walks through a 1979 arcade, dropping quarters into cabinets that teach the keyboard home row one level at a time. The game grows with the child across both typing skill and early reading vocabulary.

### The One Rule That Overrides Everything
> "The game should only ever stop a player's flow with joy, never with punishment."

No timers running out. No lives lost. No skipping ahead after a wrong keypress. Survival mode is opt-in only (Settings → PLAY STYLE), never the default — and even in Survival, wrong keys cost nothing (time pressure only).

### Wrong Keypress Behavior (critical, never change without discussion)
1. Wrong key pressed → gentle nudge sound
2. Letter **stays on screen and waits** — do NOT advance
3. Log mistake quietly to that letter's counter
4. Player hits correct key → advance normally, no double penalty
This is intentional pedagogical design based on watching Oona learn. Do not "fix" it.

### Stack
- Browser-first (HTML/CSS/JS or React)
- No game engine in prototype phase
- Pixel/retro arcade aesthetic — Press Start 2P font, CRT scanline effects
- Google Lyria for music (one original track per level)
- Godot if/when we decide to ship for real

### Levels
| Level | Keys | Game | Era |
|---|---|---|---|
| 1 | J, F | Breakout | Atari 1976 |
| 2 | D, K | Space Invaders | Arcade 1978 |
| 3 | S, L | Pac-Man | Arcade 1980 |
| 4 | A, ※ | Galaga | Arcade 1981 |
| 5 | G, H | Joust | Arcade 1982 |
| — | *Mystery beat* | *The computer is revealed* | — |
| 6 | E, I | Donkey Kong | Arcade 1981 |
| 7 | R, U | Dragon's Lair | Arcade 1983 |
| 8 | T, Y | Tetris | Home computer 1984 |
| 9 | W, O | Super Mario Bros | NES 1985 |
| 10 | Q, P | The Legend of Zelda | NES 1986 |
| 11 | V, M | Sonic the Hedgehog | Genesis 1991 |
| 12 | B, N | Street Fighter II | Arcade/SNES 1991 |
| 13 | C, , | Myst | CD-ROM 1993 |
| 14 | X, . | Donkey Kong Country | SNES 1994 |
| 15 | Z, / | Pokémon Red/Blue | Game Boy 1996 |
| 16 | 5, 6 | SimCity 2000 | PC 1993 |
| 17 | 4, 7 | GoldenEye 007 | N64 1997 |
| 18 | 3, 8 | Age of Empires | PC 1997 |
| 19 | 2, 9 | Final Fantasy VII | PS1 1997 |
| 20 | 1, 0 | *Terminal / binary reveal* | 1960s–∞ |
| 21 | -, = | Out Run | Arcade 1986 |
| 22 | [, ], \ | Q*bert | Arcade 1982 |
| 23 | `, ' | Missile Command | Arcade 1980 |
| 24 | Shift | *Player types their own name* | Present |
| 25 | Space, Backspace | *First paragraph* | Present |

※ The eighth key (right of L, right pinky) is never called "semicolon" in-game — it's "the mystery key," "the final key," or "the eighth key." Lyria cannot pronounce it.

### Arcade Cabinet Rule (one game per level, no reuse)
Each arcade cabinet gets **exactly one** game. A specific game or franchise cannot be assigned to more than one level. Clearly distinct games in the same franchise count as different cabinets (Pac-Man vs Ms. Pac-Man). Same title or near-identical reskins do not — they're the same cabinet.

Full assignment table (all 25 levels): see `.claude/rules/levels.md`

### Word Bank Principle
No real words until Level 3. From Level 3 onward, words are chosen to match early reader vocabulary — short, phonetic, recognizable. Typing a real word they can read is a double win. Never interrupt that moment.

### Player Name
Default: **Player One**. Customizable. Opening screen reads "READY [NAME]!" — a nod to both real 1979 arcade culture and the Spielberg film.

### Platform Key Label (Return vs Enter)
Mac keyboards say **Return**; Windows/Linux say **Enter**. Oona was confused when the UI said "ENTER" and her keyboard said "RETURN."

Rules:
- Never hard-code the word "ENTER" as a key-press instruction in any display string
- Always wrap it in `<span data-enter-key>ENTER</span>` (or `<kbd data-enter-key>`) so `main.js` can swap it at load time
- `navigator.platform` detection in `main.js` replaces all `[data-enter-key]` elements with "RETURN" on Mac, "ENTER" elsewhere
- The event handler stays `e.key === 'Enter'` on all platforms — only the display label changes

### Built Features Quick Map (as of 2026-07-11, branch act5-full-circle)
- **All 25 levels** playable + 4 act cinematics (`js/mystery.js`, `basement.js`, `commandcenter.js`, `fullcircle.js`)
- **Free Play** — `F` on the select screen; full keyboard + sentences + WPM (`js/freeplay.js`)
- **History cards** — 17 typeable computing-history moments, revealed at level complete, never missable (`js/history-cards.js`; research/computing-history-moments.md)
- **Settings** — `Tab` from title/pause; ADVENTURE (default) vs SURVIVAL with NOVICE/ARCADE/EXPERT + mercy quarters (`js/settings.js`)
- **Easter eggs** — title-screen magic words, Konami, console banner (`.claude/rules/easter-eggs.md`)
- **Era-progressive graphics** — Acts 2–4 + finale upgraded; Acts 1 & 21–23 deliberately primitive
- **In-game keyboard guide** — true ANSI silhouette with fog-of-war (`KEY_LAYOUT` in `js/ui/hud.js`)
- **Tooling** — screenshots: `node docs/screenshots/capture-all.js`; contrast audit: `node docs/a11y/audit.js`

### Engine input contract (do not break)
Pattern tokens: lowercase chars/digits/symbols, uppercase A–Z (= Shift+letter, exact-case matched), `' '`, `'Backspace'`. Pure modifier keydowns are ignored entirely — never a mistake. Case-sensitivity applies ONLY when the expected token is uppercase.

## Working With This Codebase

- Ask before changing any feedback/input behavior — it's grounded in specific observations of a real child learning
- Settings are toggles, not defaults — never make survival mechanics the default experience
- When in doubt, refer to the emotional design bible in product.md
- Oona may add new visual themes later — keep theming modular and extensible
- The Go binary embeds js/css at compile time — `go build -o keystroke-kingdom .` and restart after ANY asset change, or the server serves stale code
- **Start of session:** skim `docs/ROADMAP.md` for outstanding work. **End of session:** update `docs/ROADMAP.md` (and any touched design docs) to reflect what changed — a hook will remind you
- **Research anything historical via the `arcade-historian` agent** (`.claude/agents/arcade-historian.md`): pass it a topic (or an existing research doc for a citation pass) and it produces `research/*.md` with 2-4 live-verified references per claim, no URLs from memory, and downstream-impact flags for player-facing text. Never write research prose from model knowledge and trust it uncited.
