# Keystroke Kingdom — dev loop
# Portable macOS make; no exotic features. `make` (or `make help`) lists targets.

OLLAMA_MODEL ?= llama3.2
BINARY       := keystroke-kingdom
SMOKE_PORT   := 8137
SMOKE_URL    := http://127.0.0.1:$(SMOKE_PORT)

.DEFAULT_GOAL := help

## help: list available targets
help:
	@echo "Keystroke Kingdom — make targets:"
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/^## /  /'

## gen: regenerate the embedded wordgen levels manifest from js/levels.js
gen:
	node scripts/gen-wordgen-manifest.mjs

## build: compile the Go dev server (embeds index.html, css/, js/ at build time)
build: gen
	go build -o $(BINARY) .

## run: build and (re)start the local dev server (scripts/dev.sh)
run: gen
	scripts/dev.sh

## lint: syntax-check all JS, validate settings.json, bash -n hooks, wiki lint
lint:
	@echo "→ node --check on js + scripts"
	@find js -name '*.js' -print0 | xargs -0 -n1 node --check
	@find scripts -name '*.js' -print0 | xargs -0 -n1 node --check
	@find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
	@echo "→ jq validate .claude/settings.json"
	@jq empty .claude/settings.json
	@echo "→ bash -n on hook scripts"
	@for f in scripts/*.sh; do bash -n "$$f"; done
	@echo "→ wiki-search --lint"
	@node scripts/wiki-search.mjs --lint
	@echo "lint OK"

## test-static: L0 invariant tests — security greps, language rules, theme contract
test-static:
	@echo "→ node --test tests/static (L0 invariants)"
	@node --test "tests/static/*.test.mjs"

## test-unit: L0 + L1 — static invariants + data/logic unit tests
test-unit: test-static
	@echo "→ node --test tests/unit (L1 data & logic)"
	@node --test "tests/unit/*.test.mjs"

## test-go: L3 — Go server tests (wordgen validation chain)
test-go:
	@echo "→ go test ./... (wordgen validation chain)"
	@go test ./...

## test-integration: L2 — behavioral tests in a real headless browser (self-served)
# Serial on purpose: 3 concurrent chromiums starve renders past the driver's grace
# windows (4 flaky fails on 2026-07-12; green serially). Re-parallelize only after
# the driver-hardening follow-ups in docs/testing/FINDINGS.md land.
test-integration:
	@echo "→ node --test tests/integration (L2 behavior, serial — see comment)"
	@node --test --test-concurrency=1 "tests/integration/*.test.mjs"

## test-fast: the quick gate — lint + static + unit + go (no browser)
test-fast: lint test-unit test-go

## test: everything — quick gate + integration + a single-level recorder smoke
test: test-fast test-integration
	@echo "→ recorder smoke: single-level=1 steady against a static server"
	@python3 -m http.server $(SMOKE_PORT) --directory . >/dev/null 2>&1 & \
		SRV=$$!; \
		sleep 1; \
		DEV_URL=$(SMOKE_URL) node scripts/record-playthrough.js \
			--single-level=1 --profile=steady --out=/tmp/kk-smoke.mov; \
		RC=$$?; \
		kill $$SRV 2>/dev/null; \
		if [ $$RC -ne 0 ]; then echo "recorder smoke FAILED (exit $$RC)"; exit $$RC; fi; \
		echo "recorder smoke OK"

## screenshots: regenerate all docs/screenshots (needs a running server / DEV_URL)
screenshots:
	node docs/screenshots/capture-all.js

## film: re-record the full kid-profile playthrough film
# WARNING: record only from a SETTLED tree (see swarm-playbook §6). Needs a
# running dev server; pass DEV_URL or start `make run` first.
film:
	node scripts/record-playthrough.js --profile=kid --out=docs/keystroke_kingdoms.mov

## wordgen-check: curl + pretty-print the two /api/wordgen endpoints (needs `make run`)
wordgen-check:
	@URL=$$(cat .dev-url 2>/dev/null); \
		if [ -z "$$URL" ]; then echo "No .dev-url — run 'make run' first."; exit 1; fi; \
		echo "→ $$URL/api/wordgen/health"; \
		curl -s "$$URL/api/wordgen/health" | jq .; \
		echo "→ $$URL/api/wordgen?level=3&prefetch=1 (warms cache)"; \
		curl -s "$$URL/api/wordgen?level=3&prefetch=1" | jq .; \
		echo "→ $$URL/api/wordgen?level=3 (reads cache — may be empty until model finishes)"; \
		curl -s "$$URL/api/wordgen?level=3" | jq .

## wordgen-static-check: prove a static-hosted page boots with wordgen silent
wordgen-static-check:
	node scripts/wordgen-static-check.mjs

## setup: install brew deps and pull the Ollama model ($(OLLAMA_MODEL))
setup:
	brew bundle
	ollama pull $(OLLAMA_MODEL)

## docker-build: build the portable server image (multi-stage, distroless runtime)
docker-build:
	docker build -t keystroke-kingdom .

## docker-run: run the image port-mapped, wired to the HOST machine's Ollama
docker-run:
	docker run --rm -p 8080:8080 -e OLLAMA_HOST=host.docker.internal:11434 keystroke-kingdom

## docker-compose-up: game-only profile (PROFILE=game-ollama for the LLM stack)
docker-compose-up:
	docker compose --profile $(or $(PROFILE),game) up --build

.PHONY: help gen build run lint test test-static test-unit test-go test-integration test-fast \
	screenshots film wordgen-check wordgen-static-check setup \
	docker-build docker-run docker-compose-up
