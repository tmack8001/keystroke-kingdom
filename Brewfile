# Keystroke Kingdom — dev dependencies (macOS / Homebrew)
# Install everything with:  brew bundle   (or `make setup`)

brew "go"        # builds and runs the embed+serve dev server (main.go); `go test` runs the L3 wordgen validation-chain tests (`make test-go`)
brew "node"      # ES-module tooling: manifest gen, wiki-search lint, Playwright checks, the playthrough recorder — AND the whole
                 # behavior-first test suite (docs/testing/STRATEGY.md): built-in `node --test` runs tests/{static,unit,integration}
                 # with zero extra packages (`make test-unit` / `make test-integration`)
brew "python@3"  # `python3 -m http.server` — the static server used for lint-clean local serving and the recorder smoke in `make test`
brew "jq"        # JSON: pretty-prints the /api/wordgen endpoints (`make wordgen-check`) and validates .claude/settings.json in `make lint`
brew "ffmpeg"    # video muxing for the playthrough recorder (`make film`, and the fast recorder smoke in `make test`)
brew "ollama"    # OPTIONAL: local LLM for fresh word generation. Absent → the game silently uses its static word pools (zero behavior change).
