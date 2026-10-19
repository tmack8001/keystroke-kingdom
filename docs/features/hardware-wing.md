---
feature: hardware-wing
code: [js/hardware/hub.js, js/hardware/stations.js, js/hardware/]
rules: [docs/specs/hardware-wing.md, .claude/rules/theme-authoring.md, .claude/rules/security.md]
screenshots: docs/screenshots/hardware/
capture: DEV_URL=<url> node scripts/playtest.mjs --at=hardware:apple-iie --laps=2 --shot=docs/screenshots/hardware && DEV_URL=<url> node scripts/playtest.mjs --at=hardware:msdos-pc --laps=2 --shot=docs/screenshots/hardware
verified: 2026-09-15
---

# Act 8 — THE HARDWARE

The **third bonus wing**, behind the third back-wall door on the select screen (after
[[text-worlds]] and [[speedway]]) — `js/ui/cabinet-art.js` `BACK_WALL_DOORS` registers it
as `{ id: 'hardware', num: 8, name: 'THE HARDWARE', unlockLevel: 20 }`, door hint
`HOW IT ALL WORKS`. **This page did not exist before 2026-09-15** — `js/hardware/hub.js`
had no page in this vault and no entry in `scripts/feature-map.json` even though the wing
shipped Phase 1 on 2026-09-14; that hole is closed by this page.

⚠️ **Naming/location note:** `docs/specs/hardware-wing.md` §5.0 sketches the module under
`js/computerroom/` with the wing named **"THE DEN"**. The code that actually shipped lives
in `js/hardware/` and the wing is named **"THE HARDWARE"** everywhere in-game (select
screen door label, hub.js's own banner comment, `docs/ROADMAP.md`). The spec section
predates that naming decision and was never updated — this is a spec-vs-code drift to flag,
not a bug: the game is unambiguous about its own name.

Unlike [[text-worlds]] (a door with no cabinets) and [[speedway]] (a wall of racetrack
cabinets), THE HARDWARE's wall renders **MACHINES**, not cabinets — `cabinet-art.js` draws
this door's roster from `machines: ['apple-iie', 'msdos-pc']` via a dedicated machine-shell
renderer rather than the shared cabinet shell, because (per the spec) "a home computer is a
low thing you SIT at" and looked wrong standing next to an arcade cabinet.

## The verb is the boot line

You walk up to a machine and type what its owner would have typed — `CATALOG`, `DIR`,
`RUN STICKYBEAR` — and the machine executes it, one line at a time, echoing what a real
terminal of that era would have shown. There is no separate "gameplay" beyond typing the
boot sequence correctly; the reward is watching the machine respond and then reading a card
about it. This is a parallel input path (own `handleKey`, its own render loop over the
shared `#invaders-canvas`), structurally identical to [[text-worlds]]'s and [[speedway]]'s
hubs — the 25-level pattern engine (`buildPatterns`/`handleGameKey`) is never involved and
no survival timer is ever started.

**The sacred wrong-keypress contract is re-implemented here too** (as it must be — see the
warning at the top of `js/speedway/track.js`): a wrong key gets `Audio.wrong()` + a 20-frame
visual "nudge" flash, the expected character **stays and waits**, and nothing is lost or
skipped. Matching is **case-insensitive** ("these machines were, and a child holding Shift
for an Apple II command prompt is a hurdle this wing has no reason to add"). Backspace is
always allowed and free. Escape always walks out — from a station back to the wall, from the
wall back to the arcade select screen.

## Phase 1 roster — two stations (`js/hardware/stations.js`)

| Station id | Room | Year | Machine | Running | Boot lines |
|---|---|---|---|---|---|
| `apple-iie` | THE DEN | 1983 | Apple IIe | Stickybear Typing (1985) | `CATALOG` → `RUN STICKYBEAR` |
| `msdos-pc` | THE DEN | 1993 | MS-DOS PC ("the beige tower") | Gizmos & Gadgets! (1993) | `DIR` → `GIZMOS` |

Both stations currently share the room label THE DEN — the spec's full 7-station roster
(living room → den → home office → bedroom → pocket) is not yet built; only the two whose
art is sourced from actual photographs shipped (`research/wiki/tech/console-hardware-
silhouettes.md`), per the project's "DRAW A REAL THING" rule (`theme-authoring.md`). Each
station's `boot` array is `{ type: <the line to type>, says: [<lines the machine prints
back>] }`; the prompt character (`]` for the Apple II, `C:\>` for DOS) is drawn per-station.
Typing the machine's actual command language is the whole point — `RUN STICKYBEAR` and
`GIZMOS` are what a family would really have typed to launch those programs.

## Entry, exit, and the lazy import (`js/main.js`)

`DOOR_ENTRY.hardware = enterHardware` (alongside `textworld`/`speedway`). Like the other two
wings, the module is **lazily imported** (`import('./hardware/hub.js')`) — a missing/broken
module on a static host shows a "still being built" card rather than aborting the whole
`main.js` module graph (the same reasoning as [[speedway]]'s entry section). `focusStation(id)`
lets the player land at a specific machine rather than the wall's menu when they picked one
directly off the select screen wall; an unknown id is a silent no-op.

`returnToArcadeFromHardware()` calls `Hardware.stop()`, restores select-screen door focus to
`hardware` (remembering which station was last visited via `pendingStationId`), and re-renders
the select screen.

## The card reveal — built 2026-09-14/15, closing a real gap

**Before 2026-09-15, `wakeUp()` wrote a card id into the save and the player never saw what
they got** — a card earned with no reveal. `drawCard()` now shows it: when the machine wakes
and the player presses Space to leave the station, the hub switches to a `'card'` render mode
that draws — **on canvas**, never as a DOM sink (security.md rule 1) — an echo of the arcade's
own `#history-card` panel: cream card stock, the same double border, the same ~0.4s drop-in
and slight tilt (`cardDrop` keyframes, matched exactly so the two reveals feel like the same
object). The one deliberate difference is the header: **`FOUND BESIDE THE MACHINE`**, not the
arcade's `FOUND ON THE ARCADE FLOOR` — these cards are found standing at the machine, not
picked up off a floor.

**Crediting happens at `wakeUp()`, not at the reveal** — the card is written to the save the
instant the machine wakes, so walking out with Escape before the reveal renders still keeps
the card (the same lesson Act 6's TF-T1 finding taught: a save must never depend on the player
sitting through a presentation).

Verified live (`scripts/playtest.mjs --at=hardware:<station> --laps=2`, screenshots in
`docs/screenshots/hardware/`): visit 1 to `apple-iie` reveals **THE DISK II DRIVE** (`CARD 1 OF
4`); visit 2 (a fresh replay) rotates to a different card, **THE APPLE IIe** (`CARD 2 OF 4`) —
the guaranteed-card rotation is working exactly as the arcade's does. Same for `msdos-pc`:
visit 1 → **THE CD-ROM**, visit 2 → **THE MPC BADGE**.

## The card model — a THIRD bank, deliberately separate from the arcade's 60

See [[history-cards]] for the full three-bank model (`HISTORY_CARDS` / `WING_CARDS` /
`ACT_CARDS`, all in `js/history-cards.js`). The load-bearing facts specific to this wing:

- **`WING_CARDS`** (currently 4 entries, all `wing: 'hardware'`) is its own array, never
  appended to `HISTORY_CARDS` — appending would have silently made every existing save LESS
  complete the moment this wing shipped, worsening a number the child already earned. Its own
  denominator (`bankProgress('wing', …)`) is what the card reveal and the level-complete panel
  both read once a station card is involved.
- **Paired per station, by design (Trevor, 2026-09-14):** every built station yields a MACHINE
  card and a COMPONENT card — "the part you could have held." `apple-iie` → `hw-disk-ii`
  (the Disk II drive, 1978) + `hw-apple-iie` (the machine itself, keyed to its lowercase
  typing — the one fact that belongs on a *typing game's* Apple IIe card). `msdos-pc` →
  `hw-cd-rom` (the CD-ROM, 1984) + `hw-mpc-badge` (the MPC multimedia-PC standard, 1993 — a
  deliberate substitute for an uncardable generic "beige tower," since a category has nothing
  fetchable to say about it).
- **`STATION_CROSS_REFS`** points each station at arcade cards that tell an adjacent part of
  the same story (`apple-iie` → `floppy-disk`, `apple-founded`, `stickybear-typing`; `msdos-pc`
  → `intel-486`, `gizmos-gadgets`, `first-gui`) — a rendering relationship for the station's
  own gallery (`stationCards()`), not a data one: no card changes owner, no count moves.
- **`bankOf(id)` / `bankProgress(bank, ids)`** exist specifically to prevent a counted-total
  bug: `Slots.collectedCount()` counts every id across all banks (correct, since storage is
  one flat id list), but the level-complete panel used to compare that flat count against
  `TOTAL_CARDS` — the ARCADE bank's size alone — so a save with any wing card would read
  **"CARD 63 OF 60."** `bankOf`/`bankProgress` scope the displayed count to the SAME bank as
  the card being revealed. Confirmed live in the captures above (`CARD 1 OF 4`, never `OF 60`
  or `OF 61`).
- **Two stations built ⇒ a pool of one MACHINE and one COMPONENT card per station ⇒ two
  visits fully collect a station's own pool** (the rotation "rotates" between exactly two).
  The remaining five stations the spec names (§5.1) are not yet built and have no cards.

## Unlock — Level 20, not the full keyboard

`unlockLevel: 20` on the `BACK_WALL_DOORS` row. Per `docs/specs/hardware-wing.md` and
`docs/ROADMAP.md`: a wing you READ and EXPLORE may open before the keyboard is complete; a
wing where you MAKE something (a future phase) waits for it. Level 20 is the curriculum's own
"the computer is the point" beat (the binary→HELLO terminal), which is this wing's subject.

## Related

[[history-cards]] (the three-bank card model this wing's cards belong to) ·
[[select-screen]] (the back-wall door registry, machine-shell rendering vs. cabinet shell) ·
[[text-worlds]] and [[speedway]] (the two sibling bonus-wing hubs this one structurally
mirrors) · `docs/specs/hardware-wing.md` (design source — note the naming drift above) ·
`docs/ROADMAP.md` §2 (remaining roster, numbering-scheme question).
