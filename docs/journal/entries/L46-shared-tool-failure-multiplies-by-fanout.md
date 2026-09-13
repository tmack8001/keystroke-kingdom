---
id: L46
kind: lesson
title: A shared helper's rotted tool path is a single point of failure multiplied by the fan-out width
found: 2026-09-11
session: 2026-09-11 static-hosting + browser-LLM PM + roadmap swarm
status: adopted
importance: high
category: agent-process
refs: [L9, F24, F26, O13]
---

**`scripts/kk-playwright.js` — the file `.claude/rules/visual-validation.md` *requires*
every validation script to use — pinned an absolute path into the npx content-hash cache.
That pin resolved to Playwright 1.61.1, whose bundled browser revision 1228 was no longer
installed; only 1234 (1.62.1) remained. Every `launchPage()` died inside `launch()` with an
error naming a path, not a cause.**

Three properties made it expensive out of proportion to the one-line fix:

- **Shared.** One file, every browser-driven lane. Five of eight lanes this wave needed it.
- **Latent.** The module imports fine. It only fails at `launch()`, far from the cause, so
  the error reads as "something is wrong with my script."
- **Duplicated.** The same stale pin also sat in `scripts/wordgen-static-check.mjs`,
  `scripts/record-playthrough.js` (the playthrough recorder!),
  `tests/integration/persistence-onboarding.test.mjs` — where it silently *cancelled* an
  entire 3-test suite, which reads as "cancelled," not "failed" — and in the design rules
  document that tells everyone to use the helper.

The first lane to hit it burned time, invented a private workaround, and correctly reported
it as out-of-scope. Two more were about to rediscover it independently. **In a fan-out, a
shared dependency's failure is multiplied by the fan-out width, and each lane will pay
separately to rediscover it and then diverge in how it routes around it** — which is worse
than the original bug, because those divergent workarounds silently violate the very
"always use the shared helper" rule the project has.

Two practices adopted:

1. **Preflight what is shared.** Before fanning out, smoke-test every shared helper through
   its *real entry point* — not "does the file exist," but "does `launchPage()` return a
   page." One orchestrator-run check costs seconds; N lanes discovering it costs N detours.
2. **Fix it centrally and push the correction to the running lanes.** The orchestrator fixed
   the helper mid-wave and messaged the three in-flight browser lanes to drop their
   workarounds. Letting each solve it locally produces divergence, not resilience.

The fix itself generalizes: **never hard-code a path into a content-addressed or
version-managed cache** — such a path encodes a version that nothing keeps true. Resolve
dynamically instead, and validate the resolution rather than assuming it: an explicit env
override (`PLAYWRIGHT_DIR`), then a plain `require`, then cache entries newest-version-first
— accepting a candidate only if its browser binary actually exists on disk, so the failure
surfaces at import with an actionable message instead of at launch with a path.
