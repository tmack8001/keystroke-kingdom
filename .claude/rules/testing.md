# Testing Rules
## Keystroke Kingdom — load before writing tests or changing tested behavior

*The architecture, doctrine, and INV-nn invariant catalog live in
`docs/testing/STRATEGY.md`; the per-file build spec in `docs/testing/TEST-PLAN.md`;
surfaced issues in `docs/testing/FINDINGS.md`. This file is the working contract.*

## The doctrine in one line

**Tests enforce documented intent, never implementation shape.** Every test cites a
design source (`// Enforces: INV-nn — product.md §…`). No source → no test.

## Hard rules

1. **A failing test is a conversation, not an obstacle.** If your change breaks a
   test: the test encodes a design clause — either your change violates the design
   (fix the change) or the design itself moved (get Trevor's sign-off, update the
   design doc FIRST, then the test, in that order). Never silently edit a test to
   make your change pass.
2. **Tests never touch game code, game code changes never quietly touch tests** —
   one PR/report must call out both sides whenever both move.
3. **Findings protocol:** a test that reveals the game violating documented intent
   becomes a `TF-NN` entry in `docs/testing/FINDINGS.md` + `t.todo('TF-NN: …')`.
   The suite gates green; the issue stays visible.
4. **No implementation coupling:** no private-state assertions, no call-order mocks,
   no canvas pixel/geometry asserts, no millisecond-exact timing, no constants copied
   out of engine code as expected values (derive from data files or design docs).
5. **Unit tests** import public ES-module exports with `tests/helpers/stubs.mjs`
   globals only. If a test needs more DOM than a localStorage/fetch stub, it is an
   integration test — write it against the real browser via
   `tests/helpers/game-driver.mjs`.
6. **Integration tests** interact like the player (real key events) and assert
   observable state (prompt, HUD, visible screen). Seeding localStorage to reach a
   state fast is fine; the behavior under test goes through the keyboard.
7. **Never** read `.dev-url`, share a port, or `go build` from a test — the driver
   self-serves on an ephemeral port.

## When to run what

`make test-fast` (lint + static + unit + go) after any js/ or main.go change;
`make test-integration` after engine/UI/theme behavior changes; full `make test`
before reporting work complete. New behavior ⇒ new/updated tests in the same wave —
a feature without its invariant test is unfinished.

## Adding tests

New invariant → add it to STRATEGY.md §5 catalog first (next INV number, cite the
design doc), then the test. Test placement per TEST-PLAN.md layout. The
`test-engineer` agent (`.claude/agents/test-engineer.md`) is the standard builder —
dispatch it rather than hand-rolling conventions from memory.
