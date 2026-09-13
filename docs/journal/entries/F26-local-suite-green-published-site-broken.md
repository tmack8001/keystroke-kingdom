---
id: F26
kind: failure
title: Every gate was green and the published game was 404ing — nothing validated the environment players use
found: 2026-09-11
session: 2026-09-11 static-hosting + browser-LLM PM + roadmap swarm
status: addressed
importance: high
category: tooling
addressed-by: "index.html favicon refs made relative; the three /api/* client constants (js/wordgen.js, js/chat.js, js/keyboard-story-gen.js) made relative so requests stay inside the project-page prefix; .nojekyll added; new scripts/static-host-check.mjs crawls index.html asset refs AND the whole ES-module import graph asserting 200 on each, fails any root-absolute path, reports /api/* 404s as expected INFO; make static-host-check wraps it in a prefix-simulated server; .github/workflows/static-host-check.yml runs both the / and /keystroke-kingdom/ shapes on push+PR; .claude/rules/visual-validation.md gained 'The Three Environments' with the forbidden-root-absolute-path rule and the no-backend rule; security.md rule 6 gained the path-prefix clause; tests/unit/wordgen-client.test.mjs now asserts the design clause (no scheme, no host, no leading slash) instead of a literal spelling."
addressed-date: 2026-09-11
refs: [F23, O18, L46]
---

**The game is published free at `tmack8001.github.io/keystroke-kingdom/`, and it had
been shipping 404s to every player while 327 unit tests, 8 static invariants, the Go
suite, the a11y audit, the screenshot set and the visual-validation rule all passed.**
`index.html` asked for `/favicon.ico`, `/favicon.svg`, `/apple-touch-icon.png`. GitHub
Pages serves a *project* page under a `/keystroke-kingdom/` prefix, so each of those
resolved to the domain root and 404'd. It took under two minutes to find — because
somebody finally looked at the deployed site instead of a local one.

The bug is not interesting. **The reason it was invisible is.** Every gate this project
owns — a genuinely strong suite — runs against a locally served build. The Go binary and
docker-compose both serve from `/` and both have an `/api/*` backend. The published site
has neither. Those two differences are the *entire* space of static-host-only bugs, and
they were the one dimension no test exercised. A suite proves the software works in the
environment the suite runs in; every way the shipping environment differs is an untested
surface, and bugs there are systematically invisible to a green run.

This is F23's shape one level up. F23 was "Level 8 shipped unwinnable — nothing had ever
tried to win it." This is "the published build shipped broken — nothing had ever tried to
load it." Same failure: a capability nobody executed. The fix has the same shape too —
make something actually do the thing, on a schedule, rather than reasoning that it works.

Two smaller findings fell out of the same look, both invisible for the same reason:

- The three `/api/*` client constants were root-absolute, so on a project page they left
  our prefix and hit the **domain root**. Harmless in isolation (it 404s either way, and
  the fallback is identical), but `user.github.io` is a *shared* origin: any sibling
  project of the owner's serving `/api/*` would have been talked to by the game. "Same
  origin" is not sufficient when the origin is shared — a lesson worth carrying beyond
  this repo.
- A unit test named *"privacy: health probe is same-origin relative, no external host"*
  asserted `url.startsWith('/api/wordgen/health')` — i.e. it asserted a **root-absolute**
  path while its own name claimed to be checking for a relative one. It passed for both
  the right and wrong reasons and would have blocked the correct fix. Tests that encode a
  literal spelling instead of the design clause they name will defend the bug.

What made the whole thing findable was cheap and generalizable: **crawl the ES-module
import graph from the entry point and assert every resolved specifier returns 200.** That
catches "new file added, never committed, dead on the published host" without a browser,
in about a second — and the published host is the only place that failure class exists at
all, since local dev reads the file straight off disk.
