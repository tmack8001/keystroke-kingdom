# Keystroke Kingdom

A love letter to 70s–90s arcade culture and the kids discovering keyboards for the first
time. Adaptive, pressure-free typing practice that grows with early readers. Built by a
dad and his daughter, Oona.

A child walks into a 1979 arcade. Every cabinet is a typing level; every level teaches two
keys and one chapter of gaming history. The graphics grow from 1976 black-and-white blocks
to modern particle light as the keyboard unlocks — because typing unlocks the world.

## ▶ Play it

**<https://tmack8001.github.io/keystroke-kingdom/>**

Free, in your browser, nothing to install. No account, no ads, no cost — to you or to us.
Open it, press Space, and type.

Best on a real keyboard at a desktop-sized window (the game is built around ten fingers on
home row; touch keyboards and small screens aren't supported yet). Sound is on by default —
click once if your browser is holding audio back, or turn it off in Settings (**Tab**).

> **It is the whole game, not a demo.** All 25 levels, all the cinematics, Free Play, the
> history cards, the save slots, Act 6's text worlds, and Level 25's "MY STORY" finale all
> run on the published build. See [What the published build does differently](#what-the-published-build-does-differently)
> for the optional extras a local server adds.

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
- **History cards** — 55 computing-history moments (Ada Lovelace to `hello world`, plus a
  1970s–90s hacker-culture layer and one secret card): 54 hidden across the levels and
  picked up off the arcade floor as you type their names, 1 findable only by knowing the
  magic word. Each play guarantees one — a collect-them-all loop with a browsable gallery
- **Save slots** — a separate saved game (and name, and card collection) per player, as
  many as your family needs
- **Act 6 — Text Worlds** — a hidden bonus wing: typed-command adventures, ASCII tile
  worlds with riddle creatures, a world-maker, and a friend to talk to
- **Settings** (press Tab) — Adventure vs Survival, difficulty and word-length levers that
  let the game age with the player, hints, sound, CRT effect, and more
- **A hidden hacker-culture layer** — the title screen listens for old magic. Try the
  browser console.

## Run it yourself

Two ways to run your own copy. Both serve the same game; the local ones add a small Go
backend (see below).

```bash
go build -o keystroke-kingdom . && ./keystroke-kingdom
```
Serves the game on a local port (a browser tab opens automatically when you run it from a
real terminal). The binary embeds all assets — **rebuild after any js/css change**, or the
server keeps serving the old code.

Pure browser tech: ES modules + Canvas + WebAudio, no frameworks, no build step beyond Go.
Because there's no build step, the repo root *is* the deployable site: GitHub Pages serves
this branch directly, so every push to `main` publishes.

### What the published build does differently

There are three ways this game runs, and only the third has no backend:

| Environment | Serves from | Backend | Notes |
|---|---|---|---|
| Go binary (`./keystroke-kingdom`) | site root `/` | yes (`/api/*`) | the dev/contributor path |
| Docker (`docker compose --profile game…`) | site root `/` | yes (`/api/*`) | portable server, optional Ollama sidecar |
| **GitHub Pages / any static host** | sub-path `/keystroke-kingdom/` | **none** | what players get; every push to `main` deploys |

On a static host the two optional, LLM-backed extras quietly step aside:

- **Word generation** falls back to the curated static word pools. Those pools are the
  winnability floor by design — generation only ever *augments* them, so nothing about a
  level changes except that you may see a repeated word sooner.
- **Level 25's "MY STORY" coda** uses its mandatory static story bank (six stories that
  each use all 26 letters), so the finale — the typo→Backspace beat and the Hacker
  Manifesto capstone — plays in full.
- **Act 6's "A Friend to Talk To"** naps: the friend answers in its scripted offline mode,
  the child can keep typing, and the transcript still persists.

No errors, no loading pause, no dead ends. This degradation is verified on every push by
`node scripts/static-host-check.mjs` (see `.claude/rules/visual-validation.md` and
`.github/workflows/static-host-check.yml`), which asserts every asset and ES module the
page needs returns 200 under the project-page sub-path and treats missing `/api/*`
endpoints as expected.

*Honest limits:* the published build is verified headless, which cannot hear. Audio, the
Act 2→3 and Act 3→4 cinematics, the natural level-by-level unlock ladder (test runs use the
`wopr` shortcut), and mobile/small-viewport layouts are **not** covered by the automated
gate — a human should spot-check those on the live site.

## Dev loop
A `Makefile` wraps the everyday commands (run `make` or `make help` to list them):

| Target | Does |
|---|---|
| `make setup` | `brew bundle` (see `Brewfile`) + `ollama pull` the word-gen model |
| `make build` | regenerate the wordgen manifest, then compile the Go server |
| `make run` | (re)start the local dev server (`scripts/dev.sh`) |
| `make lint` | `node --check` all JS, validate `settings.json`, `bash -n` hooks, wiki lint |
| `make test-fast` | the quick gate — lint + static + unit + `go test ./...`, no browser |
| `make test-integration` | behavior tests in a real headless browser (self-served) |
| `make test` | everything — quick gate + integration + a single-level recorder smoke |
| `make screenshots` / `make film` | regenerate captures / re-record the playthrough |
| `make wordgen-check` | curl + pretty-print the `/api/wordgen` endpoints |

Before publishing, also run the static-host gate against a prefix-simulated server (CI runs
it for you on every push and PR):

```bash
python3 -m http.server 8809 --directory /path/holding/a/keystroke-kingdom/symlink
node scripts/static-host-check.mjs --url=http://127.0.0.1:8809/keystroke-kingdom/
```

**Optional: local-LLM word generation.** If [Ollama](https://ollama.com) is running on
the machine serving the game (`ollama pull llama3.2`, override with `OLLAMA_MODEL`), the
Go server generates fresh, level-appropriate early-reader words to *augment* the static
pools — so repeated play trains muscle memory, not memorization. Every generated word
passes a server-side validation chain (charset limited to the level's unlocked keys,
length/lowercase caps, a profanity/unsafe blocklist, dedup) before it's ever shown, and
the request carries only level/length constraints — never the player's name. **This is
purely additive: on any static host with no Ollama, the game silently plays its static
pools with zero behavior change, zero errors, and no loading pause** (feature-detected via
`api/wordgen/health`; client falls back in `js/wordgen.js`). Generated batches also
pass a variability filter (suffix/rhyme caps, length spread) so words vary in shape
instead of clustering around one ending.

### Docker (portable server)
The whole game is one static binary with every asset embedded, so the image is tiny and
fully portable — build once, run anywhere:

```bash
make docker-build        # multi-stage build → distroless image
make docker-run          # http://localhost:8080, wired to the host's Ollama
```

Or with compose profiles:

```bash
docker compose --profile game up           # game only (static word pools)
docker compose --profile game-ollama up    # game + an Ollama sidecar
# one-time model pull into the ollama volume:
docker compose --profile game-ollama exec ollama ollama pull llama3.2
```

Inside a container the server needs `PORT` (fixed port, set by the Dockerfile) and —
only if you want word generation — `OLLAMA_HOST` (`host.docker.internal:11434` on Docker
Desktop to reach the host's Ollama; `ollama:11434` service-to-service in compose). No
Ollama reachable → the same silent static fallback as everywhere else.

## Project map
| Where | What |
|---|---|
| `js/levels.js` | The curriculum — keys, drills, word banks per level |
| `js/main.js` | Engine: input contract, screens, survival wrapper |
| `js/themes/` | One canvas mini-scene per level (era-faithful) |
| `js/ui/` | HUD, ANSI keyboard guide, preview, cabinet art, screens |
| `AGENTS.md` | Entry point for coding agents (points at the rules below) |
| `.claude/rules/` | The design bible — product, tech, levels, transitions, easter eggs |
| `docs/ROADMAP.md` | Living backlog — where we're going |
| `docs/features/` | Per-surface reference pages for the code as built |
| `docs/specs/` | Product specs / ADRs for proposed work |
| `research/` | Background research: pedagogy, hacker culture, game history |
| `docs/screenshots/` | Canonical per-level captures (`node docs/screenshots/capture-all.js`) |
| `docs/a11y/` | Reusable contrast audit + baselines |
| `scripts/static-host-check.mjs` | The published-site gate (assets + module graph, no browser) |

*This is a living project. Built with love by a dad and his daughter.*
