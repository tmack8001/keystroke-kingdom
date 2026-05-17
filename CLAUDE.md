# Keystroke Kingdom

A retro 1979 arcade typing game for kids learning to read and type together. Built by a dad and his daughter, Oona.

## Project Documents

@.claude/rules/product.md
@.claude/rules/tech.md

## Quick Reference

### What This Is
A browser-based typing game where a child walks through a 1979 arcade, dropping quarters into cabinets that teach the keyboard home row one level at a time. The game grows with the child across both typing skill and early reading vocabulary.

### The One Rule That Overrides Everything
> "The game should only ever stop a player's flow with joy, never with punishment."

No timers running out. No lives lost. No skipping ahead after a wrong keypress. Survival mode is opt-in only, never the default.

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
| Level | Keys | Era |
|---|---|---|
| 1 | J, F | Atari 1977 |
| 2 | D, K | Arcade 1980 |
| 3 | S, L | NES 1985 |
| 4 | A, ※ | SNES 1991 |
| Mystery | Full home row | The future |

※ The eighth key (right of L, right pinky) is never called "semicolon" in-game — it's "the mystery key," "the final key," or "the eighth key." Lyria cannot pronounce it.

### Word Bank Principle
No real words until Level 3. From Level 3 onward, words are chosen to match early reader vocabulary — short, phonetic, recognizable. Typing a real word they can read is a double win. Never interrupt that moment.

### Player Name
Default: **Player One**. Customizable. Opening screen reads "READY [NAME]!" — a nod to both real 1979 arcade culture and the Spielberg film.

## Working With This Codebase

- Ask before changing any feedback/input behavior — it's grounded in specific observations of a real child learning
- Settings are toggles, not defaults — never make survival mechanics the default experience
- When in doubt, refer to the emotional design bible in product.md
- Oona may add new visual themes later — keep theming modular and extensible
