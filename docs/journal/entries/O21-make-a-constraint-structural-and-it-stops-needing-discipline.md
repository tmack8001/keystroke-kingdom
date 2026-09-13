---
id: O21
kind: observation
title: Make a constraint structural and it stops needing discipline — the era render kit
found: 2026-09-13
session: 2026-09-13 Act 7 build
status: adopted
importance: high
category: graphics
refs: [O20, L36, F1]
---

**Trevor's constraint for Act 7 was "the graphics should progress through the eras — they
all shouldn't be 8-bit graphics."** The obvious implementation is a rule in a doc plus a
reviewer's eye. What shipped instead makes the rule impossible to break.

`kitFor(tier)` returns a pen composed **only** of that era's primitives — frozen, with a
null prototype. At `ttl` there is no `gradient`, no `withAlpha`, no `flatPoly`. At
`flatpoly` there is `flatPoly` and **no `texturedPoly`**. Measured:
`p.gradient(...)` at `ttl` throws `TypeError: p.gradient is not a function`.

That alone would still leave the raw shared 2D context reachable — `drawScene` is handed
the real canvas. So for the duration of a frame, era-forbidden members of the shared
context are replaced with **throwing tripwires** and restored in a `finally`:
`ctx.createLinearGradient` at `ttl` throws *"does not exist in the ttl era"*, and works
again the moment the frame ends. Kit primitives that legitimately need a forbidden
capability internally (a 1979 dither via `createPattern`) hold **originals captured
before the guard**, so the capability lives inside the kit and nowhere else.

The result: the compression Trevor specifically forbade — collapsing Virtua Racing
(flat-shaded, 1992) and Daytona USA (texture-filtered, 1994) into one "3D" look — is not
discouraged, it is **unavailable**. A future lane building those two tracks cannot make
the mistake, and no reviewer has to remember to catch it.

Three things generalize:

- **A constraint enforced by absence needs no discipline.** "Don't use X here" survives
  exactly as long as everyone remembers; "X is not defined here" survives forever. Prefer
  removing the capability to documenting the prohibition.
- **Close the reach-around.** The pen alone was not enough, because the raw context was
  still in scope. A constraint that can be bypassed by using a different handle to the
  same resource is a suggestion. The guard is what made it real.
- **Constraints can encode research.** The tier ladder is not aesthetic preference — it
  is `research/racing-games-by-era.md`'s per-era rendering facts turned into an API
  shape. The kit also climbs resolution (240px at `ttl` → native at `modern`) and keeps
  `imageSmoothingEnabled` false until `texpoly`, which is precisely where bilinear
  filtering enters the historical record. The era ladder is executable history.

Counterpart from the same wave, worth naming together: the era kit draws its **own 5×7
bitmap font** rather than `fillText` — both the honest way a TTL cabinet made letters,
and a complete sidestep of the Press Start 2P glyph-coverage trap (journal O11). The
era-correct choice and the robust choice were the same choice.
