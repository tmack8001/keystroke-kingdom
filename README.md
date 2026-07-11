# Keystroke Kingdom

A love letter to 70s–90s arcade culture and the kids discovering keyboards for the first
time. Adaptive, pressure-free typing practice that grows with early readers. Built by a
dad and his daughter, Oona.

A child walks into a 1979 arcade. Every cabinet is a typing level; every level teaches two
keys and one chapter of gaming history. The graphics grow from 1976 black-and-white blocks
to modern particle light as the keyboard unlocks — because typing unlocks the world.

## The one rule
> "The game should only ever stop a player's flow with joy, never with punishment."

No lives. No timers. A wrong key means the letter gently waits. (An opt-in SURVIVAL mode
with classic NOVICE/ARCADE/EXPERT tiers exists for those who want 1979 rules — even there,
wrong keys cost nothing.)

## What's in the game
- **25 levels** across 5 acts — Arcade → Computer Wing → Basement → Command Center →
  Full Circle — each an era-faithful recreation of a classic game (Breakout 1976 …
  Pokémon, GoldenEye, FF7 … a word processor)
- **Act-transition cinematics** — the Mystery Cabinet reveal, the Basement trapdoor,
  the Command Center staircase, Full Circle
- **Free Play** — any cabinet, full keyboard, real sentences, live WPM
- **History cards** — 17 computing-history moments (Ada Lovelace to `hello world`)
  picked up off the arcade floor as you type their names
- **Settings** (press Tab) — Adventure vs Survival, hints, sound, CRT effect, and more
- **A hidden hacker-culture layer** — the title screen listens for old magic. Try the
  browser console.

## Run it
```bash
go build -o keystroke-kingdom . && ./keystroke-kingdom
```
Opens a browser at a local port (URL also written to `.dev-url`). The binary embeds all
assets — **rebuild after any js/css change**.

Pure browser tech: ES modules + Canvas + WebAudio, no frameworks, no build step beyond Go.

## Project map
| Where | What |
|---|---|
| `js/levels.js` | The curriculum — keys, drills, word banks per level |
| `js/main.js` | Engine: input contract, screens, survival wrapper |
| `js/themes/` | One canvas mini-scene per level (era-faithful) |
| `js/ui/` | HUD, ANSI keyboard guide, preview, cabinet art, screens |
| `.claude/rules/` | The design bible — product, tech, levels, transitions, easter eggs |
| `docs/ROADMAP.md` | Living backlog — where we're going |
| `research/` | Background research: pedagogy, hacker culture, game history |
| `docs/screenshots/` | Canonical per-level captures (`node docs/screenshots/capture-all.js`) |
| `docs/a11y/` | Reusable contrast audit + baselines |

*This is a living project. Built with love by a dad and his daughter.*
