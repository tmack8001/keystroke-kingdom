---
id: L36
kind: learning
title: Narrow animation windows die under rAF throttling
found: 2026-07-13
session: 2026-07-13 victory-celebration wave (Mario flagpole debug)
status: adopted
importance: high
category: graphics
refs: [L35, F24, F1]
---

**L36 — Narrow animation windows die under rAF throttling.** The Mario flagpole
victory worked perfectly in an unthrottled headless run and rendered NOTHING in the
real recorded win: the recorder (like any loaded tab) throttles requestAnimationFrame,
and the sequence's 250ms "grab the pole" beat fell entirely between two frames — Mario
teleported past his own animation; a co-location bug then hid him inside the flag
sprite for the slide. Rules that generalize: (1) scripted animation beats must be
WIDE enough to survive frame gaps (≥400ms), and every position must be derived from
CLAMPED elapsed time so any single rendered frame lands at a coherent moment (the
same property the Mystery dolly-in was built on — distance as a function, not a
timer); (2) never draw two sprites at identical coordinates and call them both
visible — give co-moving elements a fixed offset; (3) VERIFICATION must run the same
pipeline as reality: the first agent "proved" the animation with frames from a
console-triggered victory in an idle page and reported success (F24's pattern in a
new costume) — only frames extracted from the recorder's own video of an
engine-driven win count. The playbook §3 preamble now mandates video-derived proof
and per-agent scratch subdirs (a concurrent lane clobbering the shared frames dir is
what let the false proof stand). (→ L35, F24, F1)
