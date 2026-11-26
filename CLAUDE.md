# Keystroke Kingdom

A retro 1979 arcade typing game for kids learning to read and type together. Built by a dad and his daughter, Oona.

## Project Documents

**Always loaded:** this file + `.claude/rules/product.md` (the design bible — the One Rule lives there).

**Path-scoped rules** (`paths:` frontmatter in each file — they load automatically when you read or edit a matching file, not at session start; if you are about to work in an area without having touched its files yet, read the rule first):
- `.claude/rules/theme-authoring.md` — `js/themes/**` (**required before writing/editing any theme**)
- `.claude/rules/visual-validation.md` — themes, `js/ui/**`, `css/**`, `index.html`, static-host gate (the three environments)
- `.claude/rules/security.md` — `js/**`, `main.go`, `scripts/**` (**required before adding DOM sinks, hooks, child processes, or free-text input**)
- `.claude/rules/tech.md` — `js/**`, `main.go`, `css/**`, `Makefile`
- `.claude/rules/testing.md` — `tests/**` (**required before writing tests or changing behavior a test covers**; doctrine: `docs/testing/STRATEGY.md`)
- `.claude/rules/playtest.md` — playtest scripts and the wings (**required before reporting ANY player-facing work complete — you must have PLAYED it, twice**)
- `.claude/rules/swarm-playbook.md` — `.claude/agents/**`, ROADMAP files (**required before any multi-agent wave**)
- `.claude/rules/transitions.md` (cinematics), `.claude/rules/easter-eggs.md` (hidden layer)
- `.claude/rules/levels.md` (summary tables) + `levels/act<N>.md` / `levels/onboarding.md` (per-act / entry-flow detail) — scoped to the matching theme/cinematic files

**Read on demand:** `docs/ROADMAP.md` (**the LIVE backlog — open work only, present tense; check at session start**), `docs/roadmap-history.md` (**append-only record, past tense — never a statement about today**; two-file contract at the top of each, established 2026-09-16), `docs/features/QUICK-MAP.md` (built-features inventory), `docs/specs/*.md` (specs/ADRs for proposed work), `research/*.md` (pedagogy, hacker culture, game history).

## Quick Reference

### What This Is
A browser-based typing game where a child walks through a 1979 arcade, dropping quarters into cabinets that teach the keyboard home row one level at a time. The game grows with the child across both typing skill and early reading vocabulary.

### Before You Report Player-Facing Work Complete
> **You do not report gameplay work complete until you have PLAYED it.** Not scripted a DOM
> assertion — played it, through the real player route, **at least twice** (a startling share of
> bugs exist only on the second run: ghosts, odometers, rotations, first-time latches), and then
> LOOKED at the frames. A green suite is a claim about correctness, never about quality.
> Dispatch the `game-player` agent rather than deciding to eyeball it later.
> Full rule and the reasoning: `.claude/rules/playtest.md`.

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
- Browser-first (HTML/CSS/JS) — **no longer a prototype**: this IS the game (declared 2026-07-12)
- Bespoke engine, no framework — deliberate (low-level control, agent-friendly).
  **Narrowed 2026-09-12 (Trevor): a VENDORED graphics renderer is permitted for modern-era
  tiers only** — graphics rendering only, never the engine; vendored ESM under `js/vendor/`,
  no build step, no CDN, licence recorded, always additive to a Canvas-2D fallback.
  See `.claude/rules/tech.md` Stack table and `docs/specs/act7-speed-racing.md` §5.6d.
- Pixel/retro arcade aesthetic — Press Start 2P font, CRT scanline effects
- Google Lyria for music (one original track per level)
- Godot only if we ever ship beyond the browser

### Where It Runs — three environments, and only two have a backend
1. **Go binary** — `go build -o keystroke-kingdom . && ./keystroke-kingdom`; serves from `/`, has `/api/*`
2. **Docker** — `docker compose --profile game up` (`--profile game-ollama` adds the LLM sidecar); serves from `/`
3. **Static host — the PUBLISHED game**: <https://tmack8001.github.io/keystroke-kingdom/>. Pages serves the repo ROOT of `main` directly (`build_type: legacy`, no build step) — **every push to `main` is a deploy.** It serves from the sub-path `/keystroke-kingdom/` and has **no backend at all**, so (a) any root-absolute path (`/favicon.ico`, `/api/x`) escapes the site and 404s, and (b) `/api/wordgen|chat|keyboard-story` simply do not exist and MUST degrade silently to their static fallbacks.

The static host is a required validation target, not a nice-to-have: `node scripts/static-host-check.mjs [--url=…]` gates the asset + ES-module graph and runs in CI on every push/PR (`.github/workflows/static-host-check.yml`). Full rule: `.claude/rules/visual-validation.md` §The Three Environments.

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

※ The eighth key (right of L, right pinky) is a MYSTERY key the game teaches — **the WORD "semicolon" is withheld until Level 13** (no in-game string names it before the Level 13 teaching beat, which gives the name and its writing role; the programming meaning waits for the Level 20 terminal); it's "the mystery key," "the final key," or "the eighth key." **The `;` GLYPH itself is shown** — on the prompt and the keyboard guide, like every other key *(clarified by Trevor, 2026-10-30; the prompt used to stand a `?` in for it)*. INV-29 checks the WORD, never the glyph. The Level 13 beat teaches the name; the Level 20 eighth-key confession (easter-eggs.md) is the code reveal and never says the word. See product.md §The Key Names. Lyria cannot pronounce it.

### Arcade Cabinet Rule (one game per level, no reuse)
Each arcade cabinet gets **exactly one** game. A specific game or franchise cannot be assigned to more than one level. Clearly distinct games in the same franchise count as different cabinets (Pac-Man vs Ms. Pac-Man). Same title or near-identical reskins do not — they're the same cabinet.

Full assignment table (all 25 levels): see `.claude/rules/levels.md`

### Word Bank Principle
No real words until Level 4 — Level 3's key set (J F D K S L) has no vowel, so it's pattern drills only, same as Levels 1–2. From Level 4 onward (once A unlocks), words are chosen to match early reader vocabulary — short, phonetic, recognizable. Typing a real word they can read is a double win. Never interrupt that moment.

### Player Name
Default: **Player One**. Customizable. Opening screen reads "READY [NAME]!" — a nod to both real 1979 arcade culture and the Spielberg film.

### Platform Key Label (Return vs Enter)
Mac keyboards say **Return**; Windows/Linux say **Enter**. Oona was confused when the UI said "ENTER" and her keyboard said "RETURN."

Rules:
- Never hard-code the word "ENTER" as a key-press instruction in any display string
- Always wrap it in `<span data-enter-key>ENTER</span>` (or `<kbd data-enter-key>`) so `main.js` can swap it at load time
- `navigator.platform` detection in `main.js` replaces all `[data-enter-key]` elements with "RETURN" on Mac, "ENTER" elsewhere
- The event handler stays `e.key === 'Enter'` on all platforms — only the display label changes

### Built Features Quick Map

**Moved to `docs/features/QUICK-MAP.md`** (verbatim, 2026-11-24) — load it when you need the per-feature inventory, counts or history. Per-feature pages live in `docs/features/`; the live backlog is `docs/ROADMAP.md`.

### Engine input contract (do not break)
Pattern tokens: lowercase chars/digits/symbols, uppercase A–Z (= Shift+letter, exact-case matched), `' '`, `'Backspace'`. Pure modifier keydowns are ignored entirely — never a mistake. Case-sensitivity applies ONLY when the expected token is uppercase.

## Working With This Codebase

- Ask before changing any feedback/input behavior — it's grounded in specific observations of a real child learning
- Settings are toggles, not defaults — never make survival mechanics the default experience
- When in doubt, refer to the emotional design bible in product.md
- Oona may add new visual themes later — keep theming modular and extensible
- The Go binary embeds js/css at compile time — `go build -o keystroke-kingdom .` and restart after ANY asset change, or the server serves stale code
- **Start of session:** skim `docs/ROADMAP.md` (the LIVE backlog) for outstanding work. **End of session:** reconcile it — ⚠️ **an item lives in exactly ONE file**: DELETE finished work from `ROADMAP.md` and append a dated past-tense record to `docs/roadmap-history.md`. **Do not tick it in place — a ✅ in the live backlog is a bug.** Striking-in-place is what produced the stale entries the 2026-09-16 audit found. A hook will remind you
- **Research anything historical via the `arcade-historian` agent** (`.claude/agents/arcade-historian.md`): pass it a topic (or an existing research doc for a citation pass) and it produces `research/*.md` with 2-4 live-verified references per claim, no URLs from memory, and downstream-impact flags for player-facing text. Never write research prose from model knowledge and trust it uncited.
