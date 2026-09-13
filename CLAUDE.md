# Keystroke Kingdom

A retro 1979 arcade typing game for kids learning to read and type together. Built by a dad and his daughter, Oona.

## Project Documents

@.claude/rules/product.md
@.claude/rules/tech.md
@.claude/rules/visual-validation.md

Also load when relevant (not auto-included): `.claude/rules/levels.md` (summary tables + links),
`.claude/rules/levels/act<N>.md` + `levels/onboarding.md` (per-act / entry-flow detail — load ONLY what you're working on),
`.claude/rules/theme-authoring.md` (**required before writing/editing any js/themes/* file**),
`.claude/rules/swarm-playbook.md` (**required before any multi-agent wave**),
`.claude/rules/testing.md` (**required before writing tests or changing behavior a test covers** — doctrine: docs/testing/STRATEGY.md),
`.claude/rules/playtest.md` (**required before reporting ANY player-facing work complete — you must have PLAYED it, twice**),
`.claude/rules/security.md` (**required before adding DOM sinks, hooks, child processes, or free-text input**),
`.claude/rules/transitions.md` (cinematics), `.claude/rules/easter-eggs.md` (hidden layer),
`docs/ROADMAP.md` (living backlog — **check this at session start**), `docs/specs/*.md`
(product specs / ADRs for proposed work), `research/*.md`
(pedagogy, hacker culture, game history background).

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

※ The eighth key (right of L, right pinky) is never called "semicolon" in-game — it's "the mystery key," "the final key," or "the eighth key." Lyria cannot pronounce it.

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

### Built Features Quick Map (as of 2026-07-11, branch act5-full-circle)
- **All 25 levels** playable + 4 act cinematics (`js/mystery.js`, `basement.js`, `commandcenter.js`, `fullcircle.js`)
- **Free Play** — `F` on the select screen; full keyboard + sentences + WPM (`js/freeplay.js`)
- **History cards** *(expanded to a completionist system 2026-07-19; hacker-culture batch 2026-07-27)* — 54 citation-verified computing/gaming-history moments (+1 SECRET WarGames card = 55 total), **every level carded**, now **multiple per level** as a rotating POOL: each play guarantees exactly ONE card (`pickGuaranteedCard`, prefers an uncollected one, rotates via a per-slot counter — a Skulltula-style collect-them-all loop that rewards replay), revealed at level complete, never missable. The 2026-07-27 batch adds a 1970s–90s hacker/phreak/underground layer (war dialing, trashing, Legion of Doom/Masters of Deception, phone phreaking, the Hacker Ethic, spam's origin, the first BBS, the Hacker Manifesto, Phrack, cyberpunk, the acoustic coupler, 2600 magazine) — "curiosity, not crime" framing throughout; research: research/hacker-culture.md (+ research/wiki/culture|people|moments/*). Flat/id data model in `js/history-cards.js` (`{id,level,word,title,year,fact}`; `level` = EARLIEST level whose keys spell the word; `cardsForLevel`/`cardById`/`allCards`/`pickGuaranteedCard`); collection is PER-SLOT (`js/slots.js`), keyed by card id. Browsable **collection gallery** (`collection` screen) + per-game "★ found/total" counter. Research: research/computing-history-moments.md
- **Save slots** *(built 2026-07-19)* — **any number of independent saved games** (no cap — Trevor: "a family may have more than 3 members, no reason to limit"; the "CHOOSE YOUR GAME" slot picker is the returning-player front door and replaces the old single continue screen). `js/slots.js` owns localStorage `kk-slots` (`{v, active, slots:[…]}` — a growable dense array; each game bundles name + furthestLevel/completed/nameMoment/textWorlds + collected cards + card rotation). Player NAME is now per-game. main.js progress/card helpers delegate to the active game; legacy single-save auto-migrates into the first game (idempotent, never loses a returning player's game). Picker: one row per game + a "＋ NEW GAME" row; Space resume / N new game / X erase (Y/N) / C collection (`js/main.js`, `js/ui/screens.js`)
- **Settings** — `Tab` from title/pause; ADVENTURE (default) vs SURVIVAL with NOVICE/ARCADE/EXPERT + mercy quarters (`js/settings.js`)
- **Difficulty levers (the game ages with the player)** — EXPERIENCE (win-ratio) and MIN/MAX WORD LENGTH (both default ANY; shorter=easier, longer=harder; MIN climbs ANY→3…12, MAX single-steps to a WIZARD-equivalent 24; wordgen generation ceiling matches at 24 and its prompt is length-aware — a long-word request drops the early-reader framing (measured: the fixed early-reader prompt suppressed long words). Word-length is a best-effort suggestion — winnability is never traded for it (a level falls back to its own words; guaranteed content is never filtered). `getWordLengthRange()` in `js/settings.js` is the contract; the engine filters the drawable pool in `buildPatterns`/`drawRandomPattern` (`js/main.js`); wordgen carries the setting-derived `[2,24]` window. Design tenet: `.claude/rules/product.md` §Word Length
- **Easter eggs** — title-screen magic words, Konami, console banner (`.claude/rules/easter-eggs.md`)
- **Era-progressive graphics** — Acts 2–4 + finale upgraded; Acts 1 & 21–23 deliberately primitive
- **Level 25 "MY STORY" coda** *(built 2026-07-28)* — L25 plays its normal pool to the traditional win target, then extends PAST it into an earned finale: the player types a readable **"walk the keyboard" story** engineered so **every letter A–Z is typed** (the true full-keyboard payoff), including a scripted **typo→Backspace→correct** gag (exercising L25's new Backspace; fully choreographed, never a real penalty), capped by the **EXPERIENCE-tier Hacker Manifesto** excerpt as its final line. The story **rotates through a pool** (different each replay, per-slot `storyRotation` in `js/slots.js`) and **grows longer at higher tiers**. LLM-generated (local-Ollama `/api/keyboard-story`) with a **mandatory static bank** (6 all-26-letter stories, the offline floor); dual server+client validation, no PII (security.md rule 7). Data/assembly: `js/keyboard-story.js` (+ `keyboard-story-gen.js`); engine coda flow (`startCoda`/`codaPending`) in `js/main.js`; manifesto capstone reuses `js/finale-quote.js`. INV-62..66
- **Act 6 — Text Worlds** (hidden bonus wing behind the select-screen door; COMPLETE 2026-07-14) — a parallel screen/input path (never touches the 25-level pattern engine), coordinated by `js/textworld/hub.js`; 5 worlds sharing a `start/stop/handleKey/isActive/hasWon` shape: **Green Dragon** (prose typed-command, `engine.js`+`greendragon.js`), **Glimmer Deep** + **Whisperwood** (ASCII tile, `tileworld.js`+`tile-worlds.js`), **Your Own World** (the maker, `maker.js`), **A Friend to Talk To** (the IM-friend — local-Ollama chat via `imfriend.js`+`personas.js`+`js/chat.js`+`main.go` POST `/api/chat`: KK-aware teacher-companion personas, curated PIXEL/SPROUT + make-your-own, `kk-friends` transcript memory that resumes across launches, "forget" valve, graceful offline nap; server-composed unremovable safety prompt + allowlisted persona fields — security.md PII-floor exception). **Riddle creatures — all 3 story worlds, one pattern (2026-07-18):** shared `js/textworld/riddles.js` (`buildPool`/`answerMatches`, letters-only answers, hint→reveal escalation) drives both engines; every creature carries a **rotating riddle POOL** (flat primary + `more:[…]`, `_ri` advances per open → "different each time"); riddles are logic/word-play (not "what am I"), citation-verified in `research/act6-riddle-bank.md`. Casts expanded (Glimmer Deep 6, Whisperwood 7); **the Green Dragon gained a TYPED riddle sub-mode** (a reply is always typed, never selected — learn-to-type first) with Fern/badger/Astra-unicorn(new glade)/Quill-raven/the Dragon. Riddles are always BONUS (BFS/derivation floors intact — INV-42/45/55 green). Progress in `kk-progress.textWorlds`. One Rule holds throughout (no timers/loss; Escape always → hub → arcade)
- **In-game keyboard guide** — true ANSI silhouette with fog-of-war; keyboard geometry has ONE source of truth: `KEY_LAYOUT`/`getKeyGeometry()` in `js/ui/hud.js` (keyboard-preview.js derives from it — never redefine a layout)
- **Returning-player persistence** — now via **save slots** (`js/slots.js`, `kk-slots`; see Save slots above). Boot migrates any legacy `kk-progress`/`kk-cards` into Slot 1, then shows the "CHOOSE YOUR GAME" slot picker (`slots` screen) when any slot exists; a brand-new machine cold-opens and creates Slot 1 on first name confirm. Select screen lights only earned cabinets; WOPR (+`joshua`) bypasses (`js/main.js`, `js/ui/screens.js`, `js/ui/cabinet-art.js`)
- **Tooling** — screenshots: `node docs/screenshots/capture-all.js`; contrast audit: `node docs/a11y/audit.js`; shared Playwright nav helper: `scripts/kk-playwright.js` (`DEV_URL` override supported); human-paced playthrough film: `node scripts/record-playthrough.js` → `docs/keystroke_kingdoms.mov` (see `.claude/agents/game-player.md`)
- **Behavior-first test suite** (built 2026-07-12) — 323 test cases enforcing documented intent, never implementation: `make test-fast` (lint+static+unit+go, no browser) after any js/main.go change; `make test-integration` after engine/UI behavior changes; full `make test` before reporting work complete. Doctrine + INV catalog: `docs/testing/STRATEGY.md`; open game-vs-doc findings: `docs/testing/FINDINGS.md`; builder agent: `.claude/agents/test-engineer.md`. A failing test = a design conversation — never silently edit a test to make a change pass (`.claude/rules/testing.md`)

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
