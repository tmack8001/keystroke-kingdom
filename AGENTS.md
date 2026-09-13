# AGENTS.md — start here if you are a coding agent

This file is a **pointer, not a second copy of the rules**. The authoritative
instructions live in [`CLAUDE.md`](CLAUDE.md) and [`.claude/rules/`](.claude/rules/);
read them rather than trusting a summary (including this one) that may have drifted.

## What this project is

**Keystroke Kingdom** — a browser typing game for kids learning to read and type,
built by a dad and his daughter. A child walks through a 1979 arcade; each of 25
cabinets teaches two keys and one chapter of computing/gaming history, and the
graphics grow era by era as the keyboard unlocks. Bespoke engine: ES modules +
Canvas + WebAudio, no framework, served by a small Go binary that embeds the assets.

Published and playable, free, at <https://tmack8001.github.io/keystroke-kingdom/>.

## The One Rule

> "The game should only ever stop a player's flow with joy, never with punishment."

Everything below is downstream of that sentence. If a change would add a fail state,
a countdown, or a penalty, it is wrong even if it is well-implemented.

## Non-negotiables (do not violate these, ever)

1. **The wrong-keypress behavior is sacred.** Wrong key → gentle nudge sound; the
   letter **stays on screen and waits**; the mistake is logged quietly; when the
   correct key lands, advance normally with no extra penalty. The game never skips
   ahead after a wrong key. This is grounded in watching a real child learn — do not
   "fix" it. Ask before changing any feedback or input behavior.
2. **Survival mode is opt-in, never the default.** Settings are additive: a setting may
   make play safer or longer, never less safe. Even in Survival, wrong keys cost
   nothing (time pressure only).
3. **Never call the eighth key "semicolon."** It is "the mystery key," "the final key,"
   "the eighth key," or "the key to the right of L."
4. **Never hard-code "ENTER" in a display string.** Wrap it as
   `<span data-enter-key>ENTER</span>` (or `<kbd data-enter-key>`); `js/main.js` swaps
   it to "RETURN" on Mac at load time. The handler stays `e.key === 'Enter'` everywhere.
5. **Do not break the engine input contract.** Pattern tokens are lowercase
   chars/digits/symbols, uppercase A–Z (= Shift+letter, exact-case matched), `' '`, and
   `'Backspace'`. Pure modifier keydowns are ignored entirely — never a mistake.
   Case-sensitivity applies ONLY when the expected token is uppercase.
6. **Never write historical prose from model memory.** Every history card, cabinet
   fact, and research claim is citation-verified. Search the knowledge graph
   (`node scripts/wiki-search.mjs "<topic>"` → `research/wiki/**`) or dispatch the
   `arcade-historian` agent (`.claude/agents/arcade-historian.md`). Uncited history
   does not ship.
7. **A failing test is a design conversation, not an obstacle.** Never silently edit a
   test to make a change pass — see `.claude/rules/testing.md`.
8. **Security conventions are requirements**, not suggestions: `textContent` for
   anything user-influenced, no dynamic code, localStorage is untrusted input, no
   external network calls from game code, and the display name is the only personal
   datum stored. Full rules: `.claude/rules/security.md`.

## The three runtime environments

Changes must work in all three. Only the first two have a backend.

| Environment | Command | Serves from | `/api/*` |
|---|---|---|---|
| Go binary | `go build -o keystroke-kingdom . && ./keystroke-kingdom` | `/` | yes |
| Docker | `docker compose --profile game up` (or `--profile game-ollama`) | `/` | yes (with the sidecar) |
| **Static host (GitHub Pages)** | none — every push to `main` deploys the repo root | **`/keystroke-kingdom/`** | **none** |

The static host is where players actually play, and it differs in exactly two ways:
a **path prefix** (so any root-absolute path like `/favicon.ico` escapes the site) and
**no backend at all** (`/api/wordgen`, `/api/chat`, `/api/keyboard-story` simply 404).
Anything that calls an endpoint must degrade silently to its static fallback, and that
no-backend path must be verified before the feature is done. Gate:

```bash
node scripts/static-host-check.mjs --url=http://127.0.0.1:8809/keystroke-kingdom/
```

See `.claude/rules/visual-validation.md` → "The Three Environments" for the full rule.

## Build gotcha

The Go binary embeds `index.html`, `css/`, and `js/` **at compile time**. After ANY
asset change: `go build -o keystroke-kingdom .` and restart, or the server serves stale
code. (During a multi-agent wave, do not run `go build` yourself — the binary is shared;
run your own static server instead: `python3 -m http.server <port> --directory <repo>`.)

## Tests

```bash
make test-fast          # lint + static + unit + go — after any js/ or main.go change
make test-integration   # real headless browser — after engine/UI/theme behavior changes
make test               # everything — before reporting work complete
```

New behavior needs its invariant test in the same change. Doctrine and the INV catalog:
`docs/testing/STRATEGY.md`.

## Where to read next

- [`CLAUDE.md`](CLAUDE.md) — the quick reference: level table, built-features map,
  input contract, working agreements. Read this first.
- `.claude/rules/product.md` — the emotional design bible (why the One Rule exists).
- `.claude/rules/tech.md` — stack, architecture, engine principles.
- `.claude/rules/levels.md` + `.claude/rules/levels/act<N>.md` — the curriculum
  (load only the act you are working on).
- `.claude/rules/theme-authoring.md` — **required** before writing/editing any
  `js/themes/*` file.
- `.claude/rules/visual-validation.md` — **required** screenshot + static-host checks.
- `.claude/rules/testing.md`, `security.md`, `transitions.md`, `easter-eggs.md`,
  `swarm-playbook.md` — load when relevant.
- `docs/ROADMAP.md` — the living backlog; skim at session start, reconcile at session end.
- `docs/features/` — per-surface reference pages for the code as built.
- `docs/specs/` — product specs / ADRs for proposed work.
- `.claude/agents/` — the specialist agents (historian, test engineer, librarian,
  game player, product manager, game developer).
