---
id: L43
kind: learning
title: A test's discriminator-probe silently couples it to current content
found: 2026-07-18
session: 2026-07-18 Act 6 — riddle pools across all three text worlds
status: adopted
importance: medium
category: testing
refs: [L40, F24]
---

**L43 — When a test discriminates by picking a character/prefix that is UNIQUE in
today's data, that uniqueness is an invisible content-coupling; adding legitimate
content near the discriminator breaks the test even though the invariant it guards is
never violated.** INV-43 (integration/textworld.test.mjs) proves a when-gated command
stops being offered once its gate is satisfied. It probes THE GREEN DRAGON's start room
by taking the lamp (satisfying `take lamp`'s gate) and then pressing `t`, asserting the
key is rejected — guarded by a fixture-sanity line: "no OTHER start-room command begins
with 't'." That guard was true only because `take lamp` was the *lone* `t`-command.
Adding a new riddling creature to the clearing — `talk to the sprite` — introduced a
second `t`-command, so the sanity assertion flipped and the test failed. The invariant
(gated commands de-offer) was completely intact; only the probe's unstated assumption
broke. Because the invariant held, the doctrine-correct fix was to KEEP the safety test
byte-identical and adjust the new content instead — rename the command `meet the sprite`
(an `m`-verb), leaving `t` unique to the gated command again. Rules that generalize:
(1) a probe that selects a discriminating token out of *current* data (the only `t`, the
first free letter, the shortest command) carries an implicit "and nothing else collides"
contract — treat that as coupling and document it at the probe. (2) When new content
collides with such a probe and the invariant is genuinely unviolated, prefer moving the
content off the discriminator over editing the safety test (testing.md rule 1: fix the
change, not the test). (3) The more robust long-term shape is a probe that *derives* its
discriminator dynamically and skips if none is unique — but that added complexity to a
safety-critical test isn't worth it when a one-word content rename restores the premise.
Cross-cutting with L40's "content plugs into the registry; a new input model gets its own
seam": here the new *content* (a riddler command) plugged into an existing room, and the
only friction was a test that had memorized the room's old shape.
