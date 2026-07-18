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

## Dev loop
A `Makefile` wraps the everyday commands (run `make` or `make help` to list them):

| Target | Does |
|---|---|
| `make setup` | `brew bundle` (see `Brewfile`) + `ollama pull` the word-gen model |
| `make build` | regenerate the wordgen manifest, then compile the Go server |
| `make run` | (re)start the local dev server (`scripts/dev.sh`) |
| `make lint` | `node --check` all JS, validate `settings.json`, `bash -n` hooks, wiki lint |
| `make test` | lint + `go test ./...` (wordgen validation chain) + a fast recorder smoke |
| `make screenshots` / `make film` | regenerate captures / re-record the playthrough |
| `make wordgen-check` | curl + pretty-print the `/api/wordgen` endpoints |

**Optional: local-LLM word generation.** If [Ollama](https://ollama.com) is running on
the machine serving the game (`ollama pull llama3.2`, override with `OLLAMA_MODEL`), the
Go server generates fresh, level-appropriate early-reader words to *augment* the static
pools — so repeated play trains muscle memory, not memorization. Every generated word
passes a server-side validation chain (charset limited to the level's unlocked keys,
length/lowercase caps, a profanity/unsafe blocklist, dedup) before it's ever shown, and
the request carries only a level number — never the player's name. **This is purely
additive: on any static host with no Ollama, the game silently plays its static pools
with zero behavior change, zero errors, and no loading pause** (feature-detected via
`/api/wordgen/health`; client falls back in `js/wordgen.js`). Generated batches also
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
| `.claude/rules/` | The design bible — product, tech, levels, transitions, easter eggs |
| `docs/ROADMAP.md` | Living backlog — where we're going |
| `research/` | Background research: pedagogy, hacker culture, game history |
| `docs/screenshots/` | Canonical per-level captures (`node docs/screenshots/capture-all.js`) |
| `docs/a11y/` | Reusable contrast audit + baselines |

*This is a living project. Built with love by a dad and his daughter.*
