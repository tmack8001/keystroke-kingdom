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
`docs/ROADMAP.md` (**the LIVE backlog — open work only, present tense; check at session start**) and `docs/roadmap-history.md` (**append-only record, past tense — never a statement about today**; the two-file contract is at the top of each, established 2026-09-16), `docs/specs/*.md`
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

### Built Features Quick Map (as of 2026-09-15, branch `static-hosting-2026-09`)

> ⚠️ **`act5-full-circle` is fully merged into `main`** (verified 2026-09-15). Live work is on
> `static-hosting-2026-09`, **60 commits ahead of `main`** — and since Pages deploys `main` on every
> push, none of it is live for players yet. See docs/ROADMAP.md §1.1.
- **All 25 levels** playable + 4 act cinematics (`js/mystery.js`, `basement.js`, `commandcenter.js`, `fullcircle.js`)
- **Free Play** — `F` on the select screen; full keyboard + sentences + WPM (`js/freeplay.js`)
- **History cards** *(expanded to a completionist system 2026-07-19; hacker-culture batch 2026-07-27; edutainment batch 2026-09-13)* — 74 citation-verified computing/gaming-history moments (+1 SECRET WarGames card = **75 total**), **every level carded**, now **multiple per level** as a rotating POOL: each play guarantees exactly ONE card (`pickGuaranteedCard`, prefers an uncollected one, rotates via a per-slot counter — a Skulltula-style collect-them-all loop that rewards replay), revealed at level complete, never missable. The 2026-07-27 batch adds a 1970s–90s hacker/phreak/underground layer (war dialing, trashing, Legion of Doom/Masters of Deception, phone phreaking, the Hacker Ethic, spam's origin, the first BBS, the Hacker Manifesto, Phrack, cyberpunk, the acoustic coupler, 2600 magazine) — "curiosity, not crime" framing throughout; research: research/hacker-culture.md (+ research/wiki/culture|people|moments/*). Flat/id data model in `js/history-cards.js` (`{id,level,word,title,year,fact}`; `level` = EARLIEST level whose keys spell the word; `cardsForLevel`/`cardById`/`allCards`/`pickGuaranteedCard`); collection is PER-SLOT (`js/slots.js`), keyed by card id. Browsable **collection gallery** (`collection` screen) + per-game "★ found/total" counter. The 2026-09-13 batch adds the EDUTAINMENT lineage this game descends from — Reader Rabbit, Gizmos & Gadgets, The Oregon Trail, Rocky's Boots, and Stickybear Typing, the 1985 Apple II tutor that drew a keyboard along the bottom of the screen and lit the next key (research/educational-software.md + research/wiki/pedagogy|games/*). Research: research/computing-history-moments.md

  **THREE BANKS, not one** *(2026-09-14/15)* — `HISTORY_CARDS` (the arcade bank, **75**, the only one `TOTAL_CARDS` counts), `WING_CARDS` (bonus wings, keyed by wing+station) and `ACT_CARDS` (keyed by act, gated at Level 15, surfacing in Free Play). They are separate arrays so a new bank can never make an existing save read as LESS complete, and `bankOf`/`bankProgress` scope the "CARD n OF m" line to the card's OWN bank — an unscoped count printed `CARD 63 OF 60` (INV-96/100/103/104).

  **Levels 1–3 used to have NO cards at all** — a card is found by TYPING its word and `J F D K S L` has no vowel, so the collect loop did not exist exactly where a beginner spends most of their time. **Level 1 now carries `jf`** (THE BUMPS ON F AND J), a PATTERN token rather than a real word, so the Word Bank Principle is untouched. Its year is `UNKNOWN` and that is the **sourced** answer — the patent usually credited does not claim the bumps, and no standard could be confirmed to mention them (research/wiki/tech/home-row-bumps.md). **Levels 2 and 3 were carded the same day** — `jdk` (JAVA) and `ls` (LIST), both vowel-free tokens. The replay-payout sweep also gave a SECOND card to the five late levels that held only one (L16 `555`, L19 `win95`, L21 `1=1`, L22 `\n`, L23 `o'reilly`), so **every level now hides a card and every level from 4 up rotates on replay**. Levels 1–3 stay at one for a structural reason — their whole alphabets are `fj`, `fjdk`, `fjdksl` — and a ratchet test pins that allowlist so it can only shrink. ⚠️ A card lands at level L only if its word CONTAINS one of L's new keys (INV-56 attaches by earliest spelling), which is why those levels were sparse: `6502` looks like a Level 16 word but `0` and `2` arrive at Levels 20 and 19.

  **The 2026-09-15 MATH-vs-CODE batch — Trevor: *"Maybe each card could help decipher these differences — as we have each one discoverable."*** Because a card is found one at a time, each one decodes a single idea and the collection teaches the differences cumulatively. First pair, both live at Level 21 and rotating against each other: **`1=1`** (THE EQUALS SIGN — Recorde, 1557, math equality) and **`1==1`** (EQUALS, TWICE — 1972, code's assignment/comparison split, sourced to Thompson's *Users' Reference to B* and Ritchie's HOPL-II paper, which calls the choice *"controversial… a matter of taste"*, **not** a regret). Verified in play: three laps gave WI-FI → `1==1` → `1=1`, so the pair lands back to back. ⚠️ Neither card carries both meanings — the collection does, and `1=1` is deliberately unchanged.
  Plus six discrete-math concept cards spread by spelling: `edge` L6, `odd` L9, `graph` L10 (Euler's Seven Bridges — **1735**, not the commonly-cited 1736, which is the proceedings volume year), `prime` L11, `modulo` L11, `boolean` L12. **The find that justifies the whole sub-theme predates computing by 171 years:** in 1801 Gauss introduced `≡` because Legendre was using plain `=` for congruence — *"to prevent any ambiguity."* Same collision, same fix. Research: `research/discrete-math-and-code-notation.md`. The rest of the symbol map (`;` at L4, `,` L13, `.` L14, `//` L15, Shift-gated `* ^ % ! < >` at L24) is proposed in docs/ROADMAP.md and **not built** — the `;` card needs a ruling, since it would put the eighth key's code meaning at L4 while easter-eggs.md withholds its name until L20.
- **Save slots** *(built 2026-07-19)* — **any number of independent saved games** (no cap — Trevor: "a family may have more than 3 members, no reason to limit"; the "CHOOSE YOUR GAME" slot picker is the returning-player front door and replaces the old single continue screen). `js/slots.js` owns localStorage `kk-slots` (`{v, active, slots:[…]}` — a growable dense array; each game bundles name + furthestLevel/completed/nameMoment/textWorlds + collected cards + card rotation). Player NAME is now per-game. main.js progress/card helpers delegate to the active game; legacy single-save auto-migrates into the first game (idempotent, never loses a returning player's game). Picker: one row per game + a "＋ NEW GAME" row; Space resume / N new game / X erase (Y/N) / C collection (`js/main.js`, `js/ui/screens.js`)
- **Settings** — `Tab` from title/pause; ADVENTURE (default) vs SURVIVAL with NOVICE/ARCADE/EXPERT + mercy quarters (`js/settings.js`)
- **Difficulty levers (the game ages with the player)** — EXPERIENCE (win-ratio) and MIN/MAX WORD LENGTH (both default ANY; shorter=easier, longer=harder; MIN climbs ANY→3…12, MAX single-steps to a WIZARD-equivalent 24; wordgen generation ceiling matches at 24 and its prompt is length-aware — a long-word request drops the early-reader framing (measured: the fixed early-reader prompt suppressed long words). Word-length is a best-effort suggestion — winnability is never traded for it (a level falls back to its own words; guaranteed content is never filtered). `getWordLengthRange()` in `js/settings.js` is the contract; the engine filters the drawable pool in `buildPatterns`/`drawRandomPattern` (`js/main.js`); wordgen carries the setting-derived `[2,24]` window. Design tenet: `.claude/rules/product.md` §Word Length
- **Easter eggs** — title-screen magic words, Konami, console banner (`.claude/rules/easter-eggs.md`)
- **Era-progressive graphics** — Acts 2–4 + finale upgraded; Acts 1 & 21–23 deliberately primitive
- **Level 25 "MY STORY" coda** *(built 2026-07-28)* — L25 plays its normal pool to the traditional win target, then extends PAST it into an earned finale: the player types a readable **"walk the keyboard" story** engineered so **every letter A–Z is typed** (the true full-keyboard payoff), including a scripted **typo→Backspace→correct** gag (exercising L25's new Backspace; fully choreographed, never a real penalty), capped by the **EXPERIENCE-tier Hacker Manifesto** excerpt as its final line. The story **rotates through a pool** (different each replay, per-slot `storyRotation` in `js/slots.js`) and **grows longer at higher tiers**. LLM-generated (local-Ollama `/api/keyboard-story`) with a **mandatory static bank** (6 all-26-letter stories, the offline floor); dual server+client validation, no PII (security.md rule 7). Data/assembly: `js/keyboard-story.js` (+ `keyboard-story-gen.js`); engine coda flow (`startCoda`/`codaPending`) in `js/main.js`; manifesto capstone reuses `js/finale-quote.js`. INV-62..66
- **Act 6 — Text Worlds** (hidden bonus wing behind the select-screen door; COMPLETE 2026-07-14) — a parallel screen/input path (never touches the 25-level pattern engine), coordinated by `js/textworld/hub.js`; 5 worlds sharing a `start/stop/handleKey/isActive/hasWon` shape: **Green Dragon** (prose typed-command, `engine.js`+`greendragon.js`), **Glimmer Deep** + **Whisperwood** (ASCII tile, `tileworld.js`+`tile-worlds.js`), **Your Own World** (the maker, `maker.js`), **A Friend to Talk To** (the IM-friend — local-Ollama chat via `imfriend.js`+`personas.js`+`js/chat.js`+`main.go` POST `/api/chat`: KK-aware teacher-companion personas, curated PIXEL/SPROUT + make-your-own, `kk-friends` transcript memory that resumes across launches, "forget" valve, graceful offline nap; server-composed unremovable safety prompt + allowlisted persona fields — security.md PII-floor exception). **Riddle creatures — all 3 story worlds, one pattern (2026-07-18):** shared `js/textworld/riddles.js` (`buildPool`/`answerMatches`, letters-only answers, hint→reveal escalation) drives both engines; every creature carries a **rotating riddle POOL** (flat primary + `more:[…]`, `_ri` advances per open → "different each time"); riddles are logic/word-play (not "what am I"), citation-verified in `research/act6-riddle-bank.md`. Casts expanded (Glimmer Deep 6, Whisperwood 7); **the Green Dragon gained a TYPED riddle sub-mode** (a reply is always typed, never selected — learn-to-type first) with Fern/badger/Astra-unicorn(new glade)/Quill-raven/the Dragon. Riddles are always BONUS (BFS/derivation floors intact — INV-42/45/55 green). Progress in `kk-progress.textWorlds`. One Rule holds throughout (no timers/loss; Escape always → hub → arcade)
- **THE HARDWARE — the wing that teaches what a machine is made of** *(ACT 8; Phase 1 built 2026-09-14)* — the third bonus wing, and the first named for a SUBJECT rather than a room. *(Trevor killed the room premise: the C64 lived in the living room because it plugged into the TV, the tower moved to a home office the moment dial-up needed the phone line — no single room holds forty years. So the wall is ordered by **the room the machine migrated into** — living room → den → home office → bedroom → pocket — and the failed room name becomes the content: the machine came closer to you every decade.)* **The verb is the BOOT LINE**: you walk up to an Apple IIe, type `CATALOG`, and the disk tells you what is on it; then the program takes the screen. Opens at **Level 20** (a wing you READ and EXPLORE may open earlier; a wing where you MAKE something waits for the full keyboard — INV-95). Machines render as MACHINES via a `machines:` wall in `BACK_WALL_DOORS`, never as cabinets. Phase 1: Apple IIe → Stickybear Typing, MS-DOS PC → Gizmos & Gadgets (`js/hardware/hub.js` + `stations.js`). **Cards are a SECOND AXIS** (`WING_CARDS`/`cardsForStation`/`pickGuaranteedStationCard`, rotation key `hw:<station>`) held in their OWN array so `TOTAL_CARDS` never grows and no existing save is ever made less complete (INV-96..99). **The card is REVEALED on the way out** *(2026-09-15)* — `wakeUp()` credits it to the save immediately (Act 6's TF-T1 lesson: leaving must never drop what the player did) and `drawCard()` in `hub.js` shows it when they press Space to leave, echoing the DOM `.history-card`'s own palette, tilt and drop-in on canvas. Before this the wing banked the id silently and the child never saw what they earned. **`WING_CARDS` holds 4 of a planned 14** (spec §0.3 pairs a MACHINE card with a COMPONENT card at each of 7 stations): `hw-disk-ii` and `hw-cd-rom`, written from the seven `research/wiki/tech/` component pages the 2026-09-14 wave landed. Two rules for the next row, both enforced by comment in `js/history-cards.js`: **only card a BUILT station** (a card for an unbuilt one raises the denominator with a `???` that has no route), and **never retell a cross-referenced card's story** (the arcade's `floppy-disk` is the 1971 IBM *medium*; the wing's card is the 1978 Apple *drive*). ✅ *The MACHINE half landed the same day* — `hw-apple-iie` (THE APPLE IIe, 1983) and `hw-mpc-badge` (THE MPC BADGE, 1993), from the new `research/wiki/tech/apple-iie.md` and `multimedia-pc-standard.md`. Both built stations now hold a PAIR and both rotations rotate, verified by playing each twice. Playtest it: `node scripts/playtest.mjs --at=hardware:apple-iie --laps=2`. Spec: `docs/specs/hardware-wing.md`
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
- **Start of session:** skim `docs/ROADMAP.md` (the LIVE backlog) for outstanding work. **End of session:** reconcile it — ⚠️ **an item lives in exactly ONE file**: DELETE finished work from `ROADMAP.md` and append a dated past-tense record to `docs/roadmap-history.md`. **Do not tick it in place — a ✅ in the live backlog is a bug.** Striking-in-place is what produced the stale entries the 2026-09-16 audit found. A hook will remind you
- **Research anything historical via the `arcade-historian` agent** (`.claude/agents/arcade-historian.md`): pass it a topic (or an existing research doc for a citation pass) and it produces `research/*.md` with 2-4 live-verified references per claim, no URLs from memory, and downstream-impact flags for player-facing text. Never write research prose from model knowledge and trust it uncited.
