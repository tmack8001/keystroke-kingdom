---
id: L35
kind: learning
title: Test the promise, not the code shape — behavior-first suite with a findings ledger
found: 2026-07-12
session: 2026-07-12 testing-strategy wave
status: adopted
importance: high
category: engine
refs: [F23, F24, L30]
---

**L35 — Tests are executable design documents; failures against current code are
findings, not obstacles.** When we finally built a real test suite (Trevor's ask:
future changes must satisfy the tests, but never test implementation details), two
architectural moves made intent-testing tractable in a bespoke, DOM-wired engine:

1. **The engine is tested only at the player boundary.** `js/main.js` is a deliberate
   monolith wired to the DOM at import time. Instead of refactoring the game to be
   unit-testable (changing the product to satisfy the tests — backwards), the sacred
   contracts (wrong-key-waits, modifier-ignore, survival-costs-nothing) are asserted
   through a real headless browser via real keydown events and visible state. Pure
   data modules (levels, settings, cards, freeplay, wordgen) unit-test directly via
   their ES exports with ~40 lines of hand-rolled stubs — no jsdom, no npm, Node's
   built-in runner. The litmus test for every assertion: *would it survive a pure
   refactor that preserves player-visible behavior?*

2. **The findings ledger decouples "gate green" from "issues visible".** A test that
   reveals the game violating documented intent does NOT get weakened, and the agent
   does NOT fix the game: it becomes a numbered TF entry in docs/testing/FINDINGS.md
   plus `t.todo('TF-NN')` — the suite still gates, the disagreement stays loudly
   visible for Trevor's triage (FIXED → un-todo; BY-DESIGN → update the design doc
   FIRST, then the test). Without this, a behavior-first suite bootstrapped onto an
   existing game either blocks all work on day one or silently absorbs every bug as
   "expected". This is the same lesson as F23/F24 from the other side: things nobody
   ever *tried* stay broken — so the suite's job is to try the promises, and its
   first harvest is expected to be disagreements.

Doctrine + invariant catalog: docs/testing/STRATEGY.md; working contract:
.claude/rules/testing.md; the standard builder: .claude/agents/test-engineer.md.
