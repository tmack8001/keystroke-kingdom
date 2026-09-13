# Act 7 — "The Speedway" (Speed / Racing)
## Product spec / ADR — the bonus wing where typing becomes velocity

*Written 2026-09-12 by the `product-manager` lane. Inputs: `research/racing-games-by-era.md`
(the generational spine + §12 punishment ledger), `research/automotive-vocabulary.md` (175 vetted
words), `docs/ROADMAP.md` §2 "Act 7 — Trevor's decisions, 2026-09-12 (LOCKED)", and the shipped
Act 6 wing (`js/textworld/hub.js`, `docs/features/text-worlds.md`) as the structural precedent.*

**Trevor's six locked decisions are inputs, not open questions:** (1) open on Monaco GP
(Sega, Nov 1979); (2) the polygon step is TWO tracks — Virtua Racing 1992 flat-shaded AND
Daytona USA 1994 texture-filtered; (3) **graphics must climb with the era** — the act
recapitulates the whole graphic-quality arc inside one wing; (4) the curriculum justification is
**speed and accuracy as the throttle**; (5) **not just cars — but GROUND vehicles only**
(narrowed 2026-09-12: *"maybe the flight sims could be pulled out into a new act in and of
themselves as I'm sure there are a bunch of those and that might be mixing the theme of this new
act anyways"* — flight is its own bonus act, §5.6c); (6) **you race a stored ghost of your own
previous run** — "the race is really about did you improve from the last time you ran the track,"
with AI opponents present purely to make the world feel alive; (7) **a new graphics rendering
library is acceptable if the era arc needs one** — *"the increasing graphics climbing may require
a new graphics rendering library and that should be ok"* (§5.6d).

**⚠️ Decision 7 relaxes a founding tenet and the design doc must move FIRST.**
`.claude/rules/tech.md` ("Game Engine | Bespoke (deliberate — no framework) | Low-level control,
agent-friendly") and `CLAUDE.md` §Stack have said *no framework* since the project began. Trevor
has relaxed that **for graphics specifically**. Per `.claude/rules/testing.md` rule 1's doctrine —
the design doc changes first, with sign-off, then the feature, in that order — **no vendored
graphics byte should land until `tech.md` and `CLAUDE.md` carry the narrowed exemption in
Trevor's name.** This spec does not edit those files; it flags the edit as a gate (§11 Q9).

---

## 1. Recommendation

**Build it, in four phases, and build the ghost first.** Trevor's decision #6 is not a feature —
it is the solution to the act's only genuinely hard design problem, and it should be treated as
the act's core loop rather than a mode inside it. Speed-as-throttle is dangerous exactly because
"faster" implies someone slower; racing *the ghost of your own last run* removes the other person
from the measured question entirely. A child who improves by one keystroke wins, every time,
against the only thing being measured. The AI field stays on screen because a race needs a race
around it, and the delicious inversion is that **the opponents crash and spin and the player's
vehicle never can** — the world is lively and fallible, and the child is the one thing in it
that never fails (the Missile Command precedent, `.claude/rules/levels/act5.md` Level 23, applied
to a genre that punishes for a living).

Two things I am recommending *against*, both with reasons:

- **No word generation in Act 7 v1.** `/api/wordgen` cannot emit the act's single most on-theme
  word — `speed` is blocked by the substring `pee` in `main.go`'s `wordgenSubstringExtras`,
  along with `passing`, `cockpit`, `diesel`, `chassis`, `warm`, `forward`
  (`research/automotive-vocabulary.md` §2, verified in-package). The blocklist is right and
  should not move. The published game at `tmack8001.github.io/keystroke-kingdom/` has no backend
  anyway, so generation would be dead code for most players. A curated static bank is the floor,
  the ceiling, and the whole thing for v1.
- **No brand names, no logos, no recognizable vehicle trade dress in v1.** Concepts (`battery`,
  `motor`, `regen`, `apex`, `downforce`) never go out of business, never need a trademark
  conversation, and teach more. Within four years Fisker, Canoo, Nikola, Lordstown, Proterra,
  Arrival and Lion Electric all went bankrupt and Ford discontinued the F-150 Lightning
  (`research/automotive-vocabulary.md` §7). A word bank full of dead companies is a worse product
  *and* a legal conversation nobody needs.

And one thing I am recommending *for*, narrowly: **use decision 7's new permission as sparingly as
it can be used.** Nine of the eleven tracks must NOT be modern by construction — the era-scoped
render kit forbids a 1979 track a gradient — and two more are *better* in Canvas 2D, because
per-triangle affine texture mapping there produces exactly the texture wobble that is era-authentic
for 1993–1999. The genuine gap is two tracks. **Recommendation: raw WebGL2, no framework, behind
the render kit, composited from an offscreen canvas, with a Canvas-2D fallback** — zero download
bytes for the child, zero licence surface, and the conservative choice for a technique the deferred
25-level fidelity audit will inherit. Full option table and the non-negotiables if a library is
vendored anyway: §5.6d.

**Flight simulation is out of this act** (Trevor, 2026-09-12) and that is the right call: Act 7's
thesis is *the throttle* (typing produces velocity) and a flight act's is *the cockpit* (typing
operates a machine). Act 7 is ground vehicles — cars, two motorcycles, one anti-grav craft — and
the vehicle-scope question is closed. §5.6c records the argument; it does not design the sibling act.

If only one thing ships, ship **Phase 1: three tracks — Monaco GP (1979) → F-Zero (1990) →
modern F1 sim (present)** — the three maximally-distant rendering techniques. That is a complete
arc in one sitting and it proves decision #3 with the fewest renderers.

---

## 2. The problem

A player who finishes Level 25 has the whole keyboard and nowhere left to grow inside the
curriculum. `product.md` §Word Length already names this: *"the fixed curriculum 'grows with the
child' … but that arc ends at Level 25."* Act 6 (Text Worlds) answered it on the **cognition**
axis — typing as thought, deliberately with no speed pressure. The other axis is untouched, and
it is untouched *on purpose*: the 25-level engine never pressures speed or accuracy, because
pressure is what the One Rule forbids.

So today, concretely: a graduated child types well and slowly, and the game has no way to tell
her she is getting faster, no reason for her to try, and no place where going faster is the
point. Meanwhile every commercial answer to this — TypeRacer (2008), Nitro Type (2011), The
Typing of the Dead (1999) — is built on the thing this game cannot do: *beat the other person or
the clock reaches you*.

The design question is therefore not "how do we make a racing game." It is: **how do you make
speed the reward without making slowness the punishment?**

---

## 3. Option space

Every real alternative for "an act about typing speed," including doing nothing.

| Option | Reach | Cost to the player | Risk | Effort | Reversible? |
|---|---|---|---|---|---|
| **A. Do nothing.** Speed stays unmeasured outside Free Play's informational WPM (`computeWPM`, hud.js — "displayed, never enforced") | every player, zero change | none | none | zero | n/a |
| **B. Add a WPM target / personal-best badge to the existing 25 levels** | every player | **high** — puts a number to beat inside the curriculum the One Rule protects; a slow day becomes a visible regression mid-lesson | high: contaminates the pedagogy core | small | yes, but the emotional damage isn't |
| **C. Race against AI opponents** (the genre standard) | opt-in wing | **high** — produces a placement; "you came 8th" exists the moment scoring exists | high: §12's ledger is mostly *this* mechanic | large | yes |
| **D. Race a clock / time trial vs a fixed target time** | opt-in wing | medium-high — a target you can miss is a fail state with a friendly face | medium | medium | yes |
| **E. Race the ghost of your own previous run** (Trevor, decision #6) | opt-in wing | **near zero** — the opponent is you, last time; improvement is the only measured axis, and improvement for a learner is the common case | low | large (ghost + tracks) | yes — ghost is one per-slot field |
| **F. E, plus a non-scored AI field for atmosphere** (Trevor's actual ask) | opt-in wing | near zero | low, *provided* the field is never scored | large | yes |
| **G. Speed as pure spectacle — go fast, no comparison at all** | opt-in wing | zero | zero, but also no growth signal; nothing to come back for | medium | yes |

**Verdict: F.** E alone (G's cousin) is safe but lonely — Trevor is right that an empty track
reads as an empty track. C and D are the genre's defaults and both manufacture a losable
comparison. B is disqualified on sight: it changes the default experience, which `product.md` §1
and the Survival precedent forbid.

Two mechanics are imported wholesale because they were already One-Rule-shaped thirty years ago
(`research/racing-games-by-era.md` §12, "Two mechanics worth *stealing*"):

- **Super Mario Kart's coins (1992)** — a resource buffer that absorbs a mistake without ever
  taking away control. Imported **strictly one-directional**: see §5.2.
- **Daytona USA's adaptive AI (1994)** — helps weaker players, challenges stronger ones. Imported
  as the **atmosphere field's** speed band (§5.4), never as difficulty.

---

## 4. Per-surface verdict

Act 7 spans surfaces with very different risk profiles. They get separate verdicts.

| Surface | Verdict | Why |
|---|---|---|
| **The ghost + track engine** | **BUILD FIRST** | It is the act's thesis; every other surface is decoration on it |
| **Non-scored AI field** | **BUILD**, with a hard "never scored, never ranked" contract | Trevor's explicit ask; risk is entirely in whether anyone is ever tempted to score it |
| **Per-track era renderers** | **BUILD INCREMENTALLY**, gated by the era-scoped render kit (§5.6) | 11 renderers is the bulk of the cost; each is independently shippable |
| **Word banks** | **BUILD from the curated static bank only** | `research/automotive-vocabulary.md` is done; generation is blocked and pointless here (§1) |
| **Brand names / logos** | **DO NOT BUILD (v1)** | Volatility + trademark + concepts teach more (§1) |
| **History cards inside Act 7** | **DO NOT BUILD (v1)** | Would inflate the "★ found / total" denominator with cards unreachable until L25 + the door, making a mid-curriculum child's counter read worse for no reason. See §5.7 |
| **The 7 researched automotive cards in the EXISTING level pools** | **BUILD — and it is worth doing whether or not Act 7 ships** | `flag` L5, `volt` L11, `regen`/`brake` L12, `bertha` L12, `seatbelt` L12, `record` L13, `zoox` L15 are already earliest-typeable-computed and citation-verified. They also pre-seed Act 7: a child meets `regen` at L12 and then drives it |
| **`/api/wordgen` in Act 7** | **NO** | §1 |
| **Any network surface, leaderboard, sync** | **PERMANENT NON-GOAL** | security.md rules 6/8; the published build has no backend |
| **Free-text input (naming your car, etc.)** | **NOT IN v1** | Would be a new free-text surface requiring the `buildPlayerNamePattern` allowlist chain + `/security-review`. Deliberately deferred so v1 introduces no new input class |

---

## 5. Design

### 5.0 Shape and attachment — copy Act 6, don't invent

Act 7 is a **second back-wall door** on the select screen, a parallel screen on the shared
canvas, with its own hub. The pattern engine (`handleGameKey` in `js/main.js`) is never involved
— exactly as `docs/features/text-worlds.md` describes for Act 6.

```
js/speedway/
  hub.js          # the chooser — mirrors textworld/hub.js exactly (start/stop/handleKey,
                  # ↑↓ + Space, Escape → arcade, credits a track on ANY exit if won)
  track.js        # THE shared race engine: prompt → keystroke → distance → ghost compare.
                  # Every track shares it. This is where the sacred contracts are re-honored.
  stations.js     # data only: one row per track (era, year, render descriptor, word pool ref,
                  # track length, signature-mechanic flags)
  ghost.js        # ghost record read/write/normalize (per-slot, bounded, tolerant)
  words.js        # the curated Act 7 static banks, tiered EASY/MEDIUM/HARD
  render/kit.js   # the ERA-SCOPED drawing kit (§5.6) — the graphics-climb enforcement
  render/<id>.js  # one renderer per track, constructed with kit.for(station)
```

`js/main.js` gains a `'speedway'` screen case that is a byte-for-byte analogue of the existing
`'textworld'` case (`TextWorldHub.handleKey(e)` → `Speedway.handleKey(e)`), plus
`enterSpeedway()` / `returnToArcadeFromSpeedway()` mirroring `enterTextWorld()` /
`returnToArcadeFromTextWorld()` (main.js ~line 1825).

**The select-screen door needs one small generalization, and it should be done properly rather
than by adding a second boolean.** Today `js/ui/cabinet-art.js` hard-codes a single door:
`state.doorFocused` is a boolean, `renderDoorView()` writes the literal label
`'THE GREEN DRAGON · a text world'`, and `navigateAct()` returns early at the door because "it's
the last thing here." Replace with a `BACK_WALL_DOORS` registry (id, label, tagline, unlock
predicate, art fn, enter fn) and `state.doorIndex` (`null | 0..N-1`); ↓ past Act 5 lands on door
0, ↓ again on door 1, ↑ walks back up. Keep `doorFocused` as a derived boolean if that shortens
the diff. **This is a prerequisite** — ROADMAP already flags Acts 8 and 9 as likely wings, and
the third door must be a data row, not another edit.

**Unlock:** the same `DOOR_UNLOCK_LEVEL = 25` + `state.selectBypass` (WOPR) predicate Act 6 uses.
Both bonus wings sit after the full keyboard is earned; Act 7 teaches no keys and needs none.

**Wing name:** **THE SPEEDWAY** on the door and hub title (Act 6's door says THE GREEN DRAGON;
the hub says THE TEXT WORLDS). Internally "Act 7"; see §11 Q5 on numbering.

### 5.1 The core loop — one lap, and you always finish it

1. Pick a track from the hub. A start-line card names the era and the vehicle; **Space** begins.
   (Space, not Return: it is the house quick-advance key everywhere but name entry
   (`levels/onboarding.md`), and using it sidesteps the canvas-`ENTER`-label problem entirely —
   see §6.)
2. A word from the track's static pool appears. The player types it. Correct keystroke →
   the vehicle advances a **fixed distance** and the world scrolls. Wrong keystroke → the sacred
   contract, verbatim (§5.3). Word completes → next word, immediately, no pause, no gate.
3. The lap is **N characters long**, not N seconds long. **Distance is produced by typing, never
   consumed by time.** There is no clock that can end a run. The finish line arrives when the
   last character is typed, at whatever hour that happens to be.
4. Crossing the line: the **pit board** (§5.5). Then back to the hub. `Escape` at any moment →
   hub → arcade (the Act 6 anti-trap chain, INV-46's shape).

`N` scales with the **EXPERIENCE** setting (`getWinRatio()`, `js/settings.js`) — a higher tier is
a *longer road*, per `theme-authoring.md`'s rule to scale targets and never spectacle constants.
It never scales required speed or accuracy, because there is no required speed or accuracy.

### 5.2 Speed and accuracy as throttle — the mechanism

The throttle has exactly two parts, and the shape of the pair is the whole design:

**(a) The floor — invariant, untouchable.** Every correct keystroke advances the vehicle by a
fixed distance `D`. `D` is not modulated by rate, accuracy, boost, ghost, settings or anything
else. This is why the lap is always finishable by anyone: the road is made of your keystrokes,
and every keystroke is worth the same road it was always worth.

**(b) The ceiling — CHARGE, additive only.** Above the floor sits a boost meter (in-fiction
**CHARGE** — the EV framing from `research/automotive-vocabulary.md` §6: your typing charges the
battery, regen gives it back). Rules:

- Consecutive correct keystrokes **add** charge, at a rate that rises with how quickly they
  arrive. Fast + accurate → the meter fills → the vehicle visibly accelerates (wider speed lines,
  a flare, higher scroll rate, the engine note climbing).
- Charge **decays continuously** with time. It is a top-up, never a bank. This matters: during
  perfect play the meter is *also* draining, so decay cannot be read as a penalty — it is the
  ambient condition.
- **A wrong keypress does not drain it, reset it, or deduct anything.** While the letter waits,
  the meter simply is not being *added to* — and it is being drained at exactly the same rate it
  is drained during flawless typing. **Nothing is ever taken.** That is the literal reading of
  the house rule that "even in Survival, wrong keys cost nothing," and it is the only reading
  that survives contact with a real child.
- The meter has a floor of zero and cannot make the vehicle slower than the floor speed. Empty
  charge is not "slow" — it is *normal*.

This is Super Mario Kart's coins with the hit removed: the coins raise your top speed, and
**here, being hit costs zero coins, because here you are never hit.** An inaccurate run is slower
purely because it earned fewer charge-seconds, never because any were confiscated. A child cannot
lose something she never had taken.

**Per-track skins for the same variable.** The one meter is re-rendered as each era's own gauge —
Excitebike's **temperature gauge** (§5.8), F-Zero's power bar, Daytona's tachometer, the F1 sim's
ERS deployment bar. It is the same number every time. That is how the act keeps signature-mechanic
fidelity (`theme-authoring.md`) without eleven mechanics to balance.

### 5.3 The sacred contract, re-honored (this is a trap, name it loudly)

Act 7 does **not** route through `js/main.js`'s pattern engine, which means it does **not**
inherit the wrong-keypress contract for free. `js/speedway/track.js` must re-implement it exactly,
and its tests must cite INV-1..INV-5 directly, not Act 7's own invariants:

1. Wrong key → gentle nudge sound (`audio.js`), never harsh.
2. The letter **stays on screen and waits.** The prompt does not advance.
3. The mistake is logged quietly to that letter's counter. No alarming display.
4. The correct key then advances normally, **no double penalty**.
5. Pure modifier keydowns are ignored entirely — never a mistake.

And Act 7's own addition: **the vehicle never moves backwards, never stops, never spins, never
crashes, and never loses a metre of progress for any reason.** The odometer is monotonic.

### 5.4 The field — atmosphere, never competition

AI vehicles populate the track because a race needs a race around it. Their contract:

- **They are never scored.** No placement, no position number, no lap-count comparison, no
  "P7/12", no finish order, anywhere in the act, in any string, ever.
- **They crash. You cannot.** They spin, they overshoot a corner, they trail smoke and recover,
  they wobble comically. The player's vehicle has no crash state. This is the Missile Command
  inversion: the world is fallible and the child is not.
- **Their speed derives from the player's own rolling keystroke rate**, clamped to a band around
  it, so a slow player is never left alone on an empty track and a fast player is never driving
  through parked cars. This is Daytona USA's 1994 adaptive AI, and because the field is never
  scored, it is adaptivity with nothing at stake — the pure form of `tech.md` §Adaptive Pacing.
- They overtake and are overtaken constantly and without consequence. Being passed is scenery.

**On the engine's shipped adaptive pacing (`data-pace`, INV-70/71):** Act 7 does **not** consume
it. That multiplier modulates the pattern engine's cosmetic pauses, and Act 7 has no cosmetic
pauses to modulate — nothing in Act 7 is on a clock the player does not drive. Act 7 inherits the
*principle* (derived from the player, only ever gentler) via the field's speed band. `computeWPM`
from `js/ui/hud.js` **is** reused, verbatim, on the pit board — informational only, never
enforced, exactly as Free Play uses it today.

### 5.5 The ghost — what is stored, and what a slower run feels like

**You race your previous run.** Not your best run. This is deliberate and it is the difference
between the act working and the act souring: racing your all-time best means a child who had one
great day loses to herself forever. Racing last time means a learner beats it most sessions,
which is the truth of learning to type. **Best is a keepsake, never an opponent.**

**Storage format — recommendation: a split table.** Store, per track per save slot, the *time at
each progress milestone*:

```js
// kk-slots[i].speedway = { "<trackId>": TrackRecord }
TrackRecord = {
  v: 1,
  last:  Ghost | null,   // the ghost you race
  best:  Ghost | null,   // keepsake: the fastest completed run
  laps:  <int>,          // only ever increments
  chars: <int>,          // lifetime odometer, in characters typed on this track
  cleanBest: <int>       // longest run of consecutive correct keystrokes ever, on this track
}
Ghost = {
  ms:     <int>,            // total elapsed for the lap
  splits: [<int> × 64],     // ms at which progress first reached i/63 of the lap; non-decreasing
  keys:   <int>,            // correct keystrokes
  acc:    <int>,            // accuracy percent, 0..100
  at:     <int>             // local epoch ms of the run (for "last raced"); not PII
}
```

Why a normalized split table rather than the two obvious alternatives:

- **vs. sampled positions:** same size, but splits are already normalized to *fraction of lap*,
  so they survive a word-bank edit that changes the lap's character count. A position track does
  not.
- **vs. replaying stored keystroke timings through the speed function:** smaller and exactly
  reproducible *only while the speed function never changes*. The first time anyone tunes the
  charge curve, every stored ghost silently changes meaning and a child's saved lap "gets slower"
  overnight for no reason she can see. Splits store the **observed result**, which is what
  actually happened and stays true across physics tuning. (This is the same hazard class as
  journal O20 — a stored derivation standing in for a measurement.)
- 64 ints + 4 scalars ≈ ~400 bytes per ghost; two ghosts per track; **11 tracks ⇒ under ~10 KB
  per save slot, bounded by construction.** A hard cap of 2 ghosts/track and 64 splits is
  enforced on write, so `kk-slots` cannot grow without limit.

Replay is interpolation: at wall-clock `t`, binary-search the split table for the ghost's
progress, lerp between the two bracketing milestones, draw the ghost vehicle at that fraction of
the lap. That is the only ghost maths in the act.

**First run — there is no ghost, and it must feel like a win.** The start-line card reads
**"FIRST LAP — YOU SET THE PACE."** The field is present, so the track is never empty. The lap
runs with no ghost vehicle and the pit board says the truth: you drove the whole track, here is
your time, and **this lap is now your pace car**. A ghost is created (and `best` seeded) from
every completed lap.

**A slower run — the mechanism, not the aspiration.** Four things do the work, and none of them
is tone of voice:

1. **The ghost is visibly YOU.** Same vehicle silhouette, translucent, labelled `YOU · LAST TIME`
   — never `RIVAL`, never `OPPONENT`, never a name. A translucent copy of yourself pulling ahead
   reads as *your friend from last time is having a good day*, because it is literally that.
2. **The ghost does not finish and leave.** When it reaches the line it **stops and waits there,
   cheering**, until the player arrives. There is no moment where the player is alone on a track
   someone else has already left. This single rule kills the "I lost" reading more effectively
   than any wording.
3. **The run never ends early and never ends badly.** There is no elimination, no DNF, no "the
   ghost won" state. The lap ends when the player types the last character. Always.
4. **The pit board only ever shows facts that are true and counters that only rise** (§5.5.1).

#### 5.5.1 The pit board (end of lap)

Shows, always: **YOUR TIME** · **YOUR BEST** · letters typed · **LONGEST CLEAN RUN this lap** ·
lifetime **LAPS** · lifetime **ODOMETER** · WPM (informational).

Rules, enforceable:

- **No negative number and no minus sign is ever displayed.** If the lap was faster than last
  time, a warm line appears: `FASTER THAN LAST TIME BY 4.2 SECONDS` (plus `NEW BEST` when true,
  with a celebration on the scale of a level-complete). If it was not, **that line is simply
  absent** — the board shows YOUR TIME and YOUR BEST side by side, two true facts with no verdict
  attached. Nothing is editorialized in either direction.
- **No placement, no position, no ranking, no comparison to the field.** The field does not
  appear on the pit board at all.
- **LAPS, ODOMETER and CLEAN BEST only ever go up.** This is iRacing's incident-point ledger
  inverted: instead of a permanent record of your mistakes, a permanent record of your driving
  (`research/racing-games-by-era.md` §12, final row). It is also the reason a slow, messy lap
  still ends with something that grew.

**GHOST: ON / OFF** is an additive-direction setting (a new Settings row, default ON). Turning it
off removes the act's only comparative surface, making play strictly gentler; the act remains
fully playable and every track completable with it off, so no floor is removed
(`product.md` settings doctrine: a setting may make play safer, never remove a floor).

### 5.6 Making "graphics climb with the era" enforceable

Decision #3 is a hard constraint, so it needs a mechanism, not a paragraph in a doc. Three layers,
in decreasing strength:

**(1) Architectural — the era-scoped render kit.** `render/kit.js` exposes `kit.for(station)`,
which returns **only the drawing primitives that station's era possesses**:

| Tier | Era | Primitives the kit exposes |
|---|---|---|
| `ttl` | 1974–1980 | `rect`, `hline`, `blit1bit`; **one** ink colour + background; no gradient, no alpha, no curve |
| `scaler` | 1982–1988 | + `scaleSprite`, `horizonShift`, a fixed 8/16-colour palette |
| `8bit` | 1983–1986 | console lineage, not the arcade one: + `tileLayer`, `spriteSheet`, NES-palette clamp |
| `mode7` | 1990–1993 | + `affinePlane`, `billboard` |
| `flatpoly` | 1988–1992 | + `flatPoly`, `painterSort`; **`texturedPoly` and every filter are absent** |
| `texpoly` | 1993–1996 | + `texturedPoly`, `gouraud`, `bilinear` |
| `ps1` | 1997–2000 | + `modelledMesh`, affine-wobble UV |
| `modern` | 2008– | + gradients, bloom, particles, telemetry overlays — **the only tier permitted a WebGL backend** (§5.6d), always with a Canvas-2D fallback |

A 1979 renderer **cannot** draw a gradient, because the 1979 kit has no gradient. A Virtua Racing
renderer **cannot** accidentally texture a polygon, because `flatpoly` does not expose
`texturedPoly` — which is exactly the compression Trevor forbade between stations 7 and 8. This
is the strongest available enforcement and it needs no pixel inspection.

**(2) Static — the era ladder.** `stations.js` rows each declare
`{ year, renderTier, variant, eraRank, maxInks, antialias, scanlines }`. A static test asserts:

- every track declares a `renderTier` from the enum;
- **`eraRank` is non-decreasing when tracks are ordered by `year`** (`eraRank` is authored, not
  derived from tier, because the ladder is not single-file — Excitebike's 1984 console 8-bit sits
  chronologically between two arcade sprite-scalers and is not a *regression* from either);
- **no two tracks share an identical `(renderTier, variant)` pair** — F-Zero and Super Mario Kart
  are both `mode7`, so they must declare distinct variants (`raster-plane` vs
  `raster-plane+split-screen`), and Pole Position and Hang-On are both `scaler` (`sprite-scaling`
  vs `super-scaler`);
- the locked pair carries its locked tiers: **Virtua Racing `flatpoly`, Daytona USA `texpoly`**;
- the act's first track (by year) is `ttl` and its last is `modern` — the arc spans the full
  range by construction.

Pure data, no pixels, no implementation coupling.

**(3) Human — the existing screenshot gate.** Every track ships a reference screenshot in
`docs/screenshots/speedway/` and passes the five `visual-validation.md` checks including the
stage-composition check, plus `theme-authoring.md`'s STRONG mechanics-fidelity bar judged against
the wiki (`research/wiki/games/*`), never model memory.

**Rejected, and why it matters that it is rejected:** an automated **distinct-colour histogram**
over each track's canvas (assert Monaco GP ≤ 4 inks, assert Daytona materially exceeds Virtua)
would be the most direct proof of "graphics climb." It is rejected because
`.claude/rules/testing.md` rule 4 forbids canvas pixel assertions outright. I am not
reinterpreting that rule to fit a feature. If Trevor wants pixel-level enforcement, the rule moves
first, with his sign-off, and then the test — in that order (§11 Q7).

### 5.6b The track list

Eleven tracks, in era order. "Signature mechanic" is what `theme-authoring.md` requires to be
visibly operating; "reframe" is what §12's ledger says must change first.

| # | Track | Year | Tier · variant | Signature mechanic, as shipped here | Phase |
|---|---|---|---|---|---|
| 1 | Monaco GP (Sega) | 1979 | `ttl` · discrete-logic | Overhead scrolling road; the road **narrows** and the surface changes as the lap progresses — kept purely as visual escalation, no clock, no destruction | 1 |
| 2 | Pole Position (Namco) | 1982 | `scaler` · sprite-scaling | Rear-view road with a **swaying vanishing point**; Fuji, the first real circuit. The qualifying lap becomes an unfailable warm-up | 3 |
| 3 | Excitebike (Nintendo) | 1984 | `8bit` · console side-scroll | **Temperature gauge** = the CHARGE meter re-skinned, with cooling **arrow tiles**. No lockout, ever (§5.8) | 4 |
| 4 | Hang-On (Sega) | 1985 | `scaler` · super-scaler | The **first Super Scaler** game — sprite scaling at speed, leaning bike. Checkpoints become gifts ("more road"), never deadlines. *Substituted for Out Run, which is Level 21* | 3 |
| 5 | F-Zero (Nintendo) | 1990 | `mode7` · raster-plane | A rotated/scaled ground plane, no polygons; anti-grav craft. Power meter → CHARGE; no lives, no retirement | 1 |
| 6 | Super Mario Kart (Nintendo) | 1992 | `mode7` · raster-plane + split-screen | **Coins raise top speed** — donated wholesale to CHARGE (§5.2), with the "being hit costs coins" half deleted because nothing ever hits you | 3 |
| 7 | **Virtua Racing (Sega AM2)** | 1992 | **`flatpoly`** · untextured facets | **Flat-shaded polygons, no textures — that is the point.** The V.R. four-camera view system as a cosmetic toggle | 2 |
| 8 | **Daytona USA (Sega AM2)** | 1994 | **`texpoly`** · texture-filtered | **Texture-filtered polygons, visibly a generation past #7**; carries the 1994 NASCAR beat; its **adaptive AI** becomes the field's speed band (§5.4) | 2 |
| 9 | Gran Turismo (Sony/Polys) | 1997 | `ps1` · modelled meshes | The **licence test** as an unfailable warm-up drill — take the curriculum, delete the grade (§5.8) | 4 |
| 10 | Modern open road — Midnight Club (E) *or* NFS: Underground (E) | 2000 / 2003 | `modern` · open-road | "Driving games stopped having a finish line and started having a city." Police pursuit cut entirely. **Not GTA** (ESRB M + FTC consent order), **not Forza Horizon** (ESRB T) | 4 |
| 11 | Modern F1 sim | present | `modern` · telemetry | Shaders, particles, a **telemetry-trace aesthetic** (data channels, sector lines) rather than chased photorealism. ESRB E — the most age-appropriate track in the arc | 1 |

**Decision #5 ("not just cars") is already satisfied by this list and needs no additions.** Three
of the eleven are not cars: Excitebike is **motocross**, Hang-On is a **motorcycle**, F-Zero is an
**anti-gravity craft**. Act 7 is *ground vehicles* — that is the whole vehicle scope, and it is a
closed question.

`[awaiting research]` — a small **bike/kart vocabulary layer** (`handlebar`, `lean`, `visor`,
`sprocket`, `moto`) is still pending; `research/automotive-vocabulary.md` is car-shaped today.
This is a content top-up, not a structural dependency: every track above ships from the existing
175-word pool without it.

### 5.6c Why flight simulation is a DIFFERENT act, not a station here

Recorded because it is a real design argument, not just a scope cut. **The two acts have different
theses, and mixing them would have blurred the one Act 7 is built on.**

- **Act 7's thesis is the throttle:** faster, more accurate typing makes the vehicle go faster.
  Speed is the measured axis; the words are fuel.
- **A flight act's thesis is the cockpit:** the keyboard *is* the instrument panel. Flaps, gear,
  trim, throttle, mixture, lights, autopilot, radios — a joystick moves the stick and **almost
  everything else an aircraft does is bound to a letter or a number**, which is why publishers
  shipped printed keyboard reference cards in the box
  (`research/wiki/tech/keyboard-as-cockpit.md`). Typing there is *operating a machine*, not
  producing velocity — it is structurally much closer to Act 6's Green Dragon (read the situation,
  type the command) than to a race.

Bolting a flight sim into a racing wing would have put a station in it where going faster is not
the point, which is precisely the blur Trevor spotted. **Flight is therefore a sibling bonus act.**
Research already exists for it and is not this spec's to design:
`research/vehicle-games-beyond-cars.md`, `research/wiki/tech/keyboard-as-cockpit.md`,
`research/wiki/tech/flight-sim-rendering-eras.md`. **This spec does not design that act**; it only
records why it is separate, and notes that the ghost/throttle machinery here is *deliberately* not
the right loop for it.

### 5.6d The rendering backend — recommendation: **mixed wing, Canvas 2D by default, raw WebGL2 only at the top of the arc**

Decision 7 permits a library. My recommendation is to use that permission **as narrowly as
possible**, and specifically **not** to adopt a scene-graph framework.

**First, the finding that shrinks the problem: nine of eleven tracks must NOT be modern by
construction.** The era-scoped kit (§5.6) *forbids* a 1979 track a gradient and forbids Virtua
Racing a texture. Canvas 2D is not a compromise for those tracks — it is the correct instrument,
and it is what the rest of the game already speaks. Two further tracks are better in Canvas 2D
than in WebGL for a reason worth stating: **per-triangle affine texture mapping in Canvas 2D
produces exactly the texture "swim"/wobble that is era-authentic for 1993–1999 hardware**
(`racing-games-by-era.md` §13: *"affine wobble is era-correct for PS1-adjacent looks"*). A
correctly perspective-corrected GPU pipeline would render Daytona and Gran Turismo *wrong*.

So the gap is narrow: **stations 10–11 only** — the modern open road and the modern F1 sim, where
"modern shaders, particle systems, full resolution" (`product.md` §5, Act 5 tier) is the literal
brief and hand-rolled Canvas 2D genuinely runs out of road.

| Option | Vendored payload | Licence surface | Fit for stations 10–11 | Risk | Verdict |
|---|---|---|---|---|---|
| **Canvas 2D everywhere (status quo)** | 0 KB | none | weak at the very top of the arc | decision 3 under-delivers exactly where it is most visible | **keep for tracks 1–9** |
| **Raw WebGL2 + a tiny helper** (e.g. twgl-class, MIT, ~10 KB ESM) | ~0–10 KB | one MIT file | good — shaders, particles, bloom are what WebGL is *for* | must hand-write GLSL; project has no WebGL history | **✅ RECOMMENDED for tracks 10–11** |
| **regl** (MIT, ~30 KB) | ~30 KB | one MIT package | good; functional wrapper, still your own shaders | a dependency for little more than the helper above | acceptable second choice |
| **pixi.js** (MIT, ~400 KB) | ~400 KB | large | good for 2D particles/filters | large payload for two tracks; another renderer's opinions about the canvas | no |
| **three.js** (MIT, ~600 KB–1.2 MB ESM) | very large | large | overkill — its value is a scene graph, loaders, materials, none of which a stylised telemetry aesthetic needs | biggest payload + biggest new surface for the smallest slice of the act | **no** |

**Recommendation: raw WebGL2, no framework, with a vendored micro-helper only if it demonstrably
shortens the code.** Reasons, in order: (a) it costs a child **zero download bytes** — WebGL is a
browser API, and the browser-LLM spec already established the house principle that we do not ship
megabytes to players; (b) zero licence surface and zero supply chain; (c) it is the **conservative**
choice, which matters more than usual because Trevor has said the deferred 25-level
graphics-fidelity audit will reuse whatever technique Act 7 establishes — adopting a scene-graph
framework here would quietly commit the entire game to it; (d) the render kit already isolates it
— WebGL appears in exactly one place, `kit.for(station)` at tier `modern`.

**The architectural constraint nobody should discover at implementation time: a canvas element can
only ever have ONE context type.** The whole game shares `#invaders-canvas` with a 2D context. A
WebGL track therefore renders to its **own offscreen canvas** and is composited into the shared 2D
canvas with a single `ctx.drawImage(glCanvas, …)` per frame. That keeps `index.html`, the screen
plumbing, the layout contract (`visual-validation.md` — the UI owns the centre) and the theme
module contract (`start/stop/keystroke/miss/patternComplete/victory`, `patternComplete()` monotonic,
`victory()` returns its duration) **completely unchanged**. The backend never leaks into the engine.

**If a library is ever vendored anyway**, the non-negotiables (all checkable):
- **Committed to the repo as ES modules under `js/vendor/<name>/`** — GitHub Pages serves the repo
  root of `main` with **no build step**, so nothing may be installed, bundled or transpiled at
  deploy time.
- **No CDN, ever**, and no root-absolute paths (security.md rule 6; the favicon lesson, journal F26).
- It joins the ES-module import graph `scripts/static-host-check.mjs` crawls — `make
  static-host-check` must stay green with every vendored file returning 200.
- **`LICENSE` committed beside it** and the licence recorded in the ROADMAP row.
- Payload measured and stated in the PR. This is a free game a child loads over whatever connection
  she has.

**And the floor, which is not negotiable:** WebGL is **optional**. If a context cannot be created,
is lost, or the machine is too slow, the track falls back to its Canvas-2D rendering and stays
completable. No track is ever blank, broken, or unplayable for a rendering reason (INV-90).

### 5.7 Word content

Source: `research/automotive-vocabulary.md`, 175 vetted words already tiered EASY / MEDIUM / HARD
against the MIN/MAX WORD LENGTH levers, each with a child-true definition. `js/speedway/words.js`
holds one curated pool per track, chosen for era flavour:

- **Monaco GP (1979)** — EASY, 3–5 letters, the plainest driving words: `car`, `lap`, `road`,
  `turn`, `fast`, `horn`, `gas`, `wheel`.
- **F-Zero (1990) / Mario Kart (1992)** — EASY→MEDIUM motion verbs: `boost`, `drift`, `coast`,
  `launch`, `spin`, `grip`.
- **Virtua Racing / Daytona (1992–94)** — MEDIUM race vocabulary: `apex`, `draft`, `slick`,
  `podium`, `circuit`, `hairpin`.
- **Gran Turismo (1997) / modern F1 (present)** — HARD Latinate, the MAX-WORD-LENGTH payload:
  `telemetry`, `downforce`, `slipstream`, `traction`, `differential`, `aerodynamics`,
  `regenerative`.

Rules:

- **MIN/MAX WORD LENGTH** (`getWordLengthRange()`) is honoured as a **best-effort filter with the
  same winnability fallback the engine already uses**: if a range empties a track's pool, the
  track falls back to its own words. A track can never become unfinishable for a settings reason.
- **`speed`, `passing`, `cockpit`, `diesel`, `chassis`, `warm`, `forward` live here and only
  here.** They are unreachable from `/api/wordgen` by design and the blocklist does not move
  (§1).
- **Never-words, absolutely excluded from every Act 7 pool and every line of Act 7 prose:**
  `crash`, `wreck`, `collision`, `burnout`, `spin out`, `DNF`, and `dead`/`die`/`kill`
  (`research/automotive-vocabulary.md` §2 tone flags — the last three are floor blocklist words
  besides). A racing act that never crashes is the same choice as Missile Command's cities that
  can never be hit.
- **Authoring lint (static test):** no word in any Act 7 pool matches `js/word-blocklist.json`'s
  `BASE_WORDS` (exact) or the never-word list (substring).

**History cards.** Act 7 awards none in v1 (§4). The seven researched automotive cards belong in
the **existing level pools** at their computed earliest-typeable levels, which enriches the
curriculum and pre-seeds Act 7's vocabulary. If Act 7 should ever award something collectible, the
right shape is a **SECRET card** (`level: null`, like the WarGames `joshua` card) — secret cards
already count toward the total without being level-bound, so they hollow nothing out. Phase 3+,
and Trevor's call (§11 Q4).

### 5.8 Era fidelity vs the One Rule — the two real collisions

**Excitebike's overheat gauge (1984).** `theme-authoring.md` requires the original's signature
mechanic to be visibly operating at STRONG fidelity; the signature mechanic is an **enforced
input lockout**, which is a flow-stop and therefore forbidden. Resolution: **the gauge IS the
CHARGE meter** (§5.2), re-skinned. It visibly rises with sustained fast typing and visibly cools;
the track carries Excitebike's **arrow tiles**, which cool it instantly when driven over. At
maximum it does not lock input and does not stop the bike — the boost simply fades back to the
baseline while the needle cools. Every visible element of the mechanic operates; the single
deleted element is the lockout. `theme-authoring.md`'s own "Nothing punishing, ever" clause
outranks its fidelity clause, and this is the documented precedent for the next such collision.

**Gran Turismo's licence tests (1997).** The closest thing in the genre's history to what this
game already does — a graded curriculum that teaches braking points and racing lines — and it
grades gold/silver/bronze/**FAIL**, withholding content on failure. Resolution, per §12: **take
the curriculum, delete the grade.** The GT track opens with a short, unfailable **warm-up drill**
(three short words, no ghost, no timing) framed as "let's feel the car" — the shape of a licence
test with no pass mark and nothing gated behind it.

---

## 6. Safety & privacy

**What Act 7 v1 introduces:** exactly one thing — a new field in an existing localStorage schema.
Everything else reuses chains that already exist.

| Concern | Chain that must run | Where it exists today | Missing? |
|---|---|---|---|
| **`kk-slots` schema change** (`speedway` field) | security.md rule 4: parse in try/catch, validate field-by-field, garbage → default, never throw, writes never throw | `normalizeSlot()` in `js/slots.js` is the reference implementation | **`normalizeSlot` must gain a `speedway` branch**, and `ghost.js` must validate each ghost: `splits` is an array of exactly 64 finite non-decreasing ints ≥ 0, `ms`/`keys`/`acc`/`at` finite and clamped, ≤ 2 ghosts per track, unknown track ids dropped. A malformed ghost reads as **no ghost** and the track plays normally |
| **Erase semantics** | Erasing a game must erase its ghosts; `Slots.eraseAll()` must too | Both already wipe the whole slot object | nothing, provided `speedway` lives *inside* the slot and not in a new namespace |
| **DOM sinks** | security.md rule 1 — user-influenced strings via `textContent` only | Act 7 draws entirely on canvas with `fillText`; all labels are literals | nothing new. The door label added to `cabinet-art.js` is a literal |
| **Free text** | security.md rule 3 allowlist at the boundary | n/a — Act 7 v1 has **no free-text input** | nothing. If a "name your car" feature is ever added it inherits `buildPlayerNamePattern`'s `[a-zA-Z]` allowlist **and** re-triggers `/security-review` |
| **Network** | security.md rule 6 — no external calls | Act 7 makes **zero** fetches. Works identically on the static host, the Go binary and docker | nothing. Local-only ghosts are what Trevor asked for and are also the only correct answer |
| **PII** | security.md rule 8 — one display name per save, nothing more | Ghosts store lap times, split times, keystroke counts, accuracy and a local timestamp — **gameplay data, not a new PII class**, same status as `kk-stories` | nothing, and nothing about the child leaves the machine because nothing leaves the machine |
| **Word safety** | The single-source floor blocklist | `js/word-blocklist.json` / `BASE_WORDS` | **Add the authoring lint** (§5.7) so a curated pool can never smuggle a floor word past the fact that curated pools are not generation-filtered |

**⚠️ `/security-review` is REQUIRED before Act 7 ships** — a localStorage schema change is on
security.md's explicit trigger list ("any localStorage schema change"). It is a small review: one
new validated field, no sinks, no network, no free text.

**Platform key label:** Act 7 confirms with **Space** everywhere, never Return/Enter, so no
canvas string ever has to say "ENTER" — which also steers clear of the open TF-3 finding (the
canvas keyboard guide showing ENTER on Macs). If any Act 7 surface ever must name that key, it
resolves the platform label through the same detection `main.js` uses; it is never hard-coded.

**Historical claims:** nothing in this spec's player-facing text may be written from model memory.
Track flavour text, the pit board's era lines, and any card copy go through the **arcade-historian**
agent. Specifically flagged: **the ghost-car / time-trial lineage has no research page yet** —
`research/racing-games-by-era.md` does not cover it. If Act 7 wants to tell the player where
ghost cars came from, that is an arcade-historian pass, not a paragraph anyone writes here.

---

## 7. Non-goals

Act 7 explicitly does **not**:

- Teach any new key. Every key is taught by Level 25; Act 7 teaches speed and accuracy.
- Change anything about Levels 1–25, or any default. A player who never opens the door sees a
  byte-identical game.
- Contain a clock, a countdown, a qualifying gate, a lives counter, a placement, a finish order,
  a fail state, a DNF, an elimination, or any state in which the player's vehicle stops, crashes,
  spins, or loses progress.
- Score, rank, or compare the player against the AI field, or against any other player, ever.
- Talk to any network. No leaderboard, no sync, no sharing, no `/api/*`, not even optionally.
- Use `/api/wordgen` or any generated content (v1).
- Show brand names, logos, trade dress, or a recognizable manufacturer's vehicle design (v1).
- Award history cards or change the "★ found / total" denominator (v1).
- Accept free text from the player (v1).
- Replace the Stats Cabinet (ROADMAP §1.3). Act 7's pit board is per-track and local to the act;
  the Stats Cabinet remains a separate, whole-game surface.
- Support touch/mobile. Act 7 is a typing-speed act on a physical keyboard, as the rest of the
  game is (`ROADMAP` §2b).
- **Contain a flight simulator, or any aircraft.** Flight is a sibling bonus act with a different
  thesis (§5.6c). Act 7 is ground vehicles, and that scope is closed.
- **Introduce a build step, a bundler, a package install, or a CDN fetch.** Decision 7 permits a
  *vendored* graphics library, committed as ES modules and served from the repo root like
  everything else. It permits nothing about how the game is built or delivered.
- **Adopt a rendering framework across the game.** Any WebGL lives behind `kit.for(station)` at
  tier `modern` and is invisible to the engine and to the theme module contract.

---

## 8. Risks & residual risk

| Risk | Severity | Mitigation | Residual |
|---|---|---|---|
| **The sacred wrong-keypress contract is re-implemented in `track.js` and could drift from the engine's** | high | Act 7's tests cite INV-1..5 **directly** and exercise them through the track engine; the same trap existed for Act 6 | Real. Two implementations of one contract is the structural cost of a parallel input path, and it is the single thing most worth reviewing |
| **11 renderers is the largest build in the project's history** | high | Four phases, each independently shippable; the hub lists whatever is registered | Act 7 may live at 3 or 5 tracks for a long time. That is fine — 3 already shows the arc |
| **"Did you improve?" for an erratic young typist can be noisy** — a five-year-old's lap times vary a lot day to day | medium | Race *last* run not *best*; no negative deltas; monotonic counters; the ghost waits at the line | A child may still notice the ghost is ahead. The mitigation is emotional framing, which is real but not mechanical. Worth watching in Oona's first session specifically |
| **Someone later "improves" the field by scoring it** | medium | INV-82 written so a placement string fails a test | Low once the invariant exists |
| **Ghost format versioning** | medium | Splits store observed results, not derivations (§5.5); `v` field; unknown version → no ghost | An old ghost after a track-length change is still *approximately* right because splits are normalized |
| **`kk-slots` growth** | low | Hard caps: 2 ghosts/track, 64 splits, unknown ids dropped | ~10 KB/slot worst case |
| **Era fidelity judged from model memory instead of the wiki** | medium | `theme-authoring.md` STRONG rubric + wiki ground truth + historian for all prose | Standing project risk, unchanged |
| **Decision 7 relaxes tech.md's "no framework" tenet** and the docs still say the opposite | medium | The doc edit is a **gate** before any vendored byte (testing.md rule 1 ordering); §11 Q9 | If the feature lands first, the codebase and its constitution disagree — the exact failure the rule exists to prevent |
| **WebGL adds a whole new failure class** (context creation refused, context lost, low-end GPU, headless CI) | medium | WebGL is optional by construction: Canvas-2D fallback per track, shipped in the same change (INV-90); the integration driver is headless, so the fallback path is what CI actually exercises | A visual regression on the WebGL path could pass CI unseen — covered only by the screenshot gate and a human look |
| **A vendored library rots or bloats** | low | Raw WebGL2 recommended precisely to avoid this; if vendored anyway: committed ESM, LICENSE beside it, size stated, static-host-check green (§5.6d) | Standing, small |
| **Act numbering** (four bonus wings on a five-act spine) | low | Flagged in ROADMAP already; §11 Q5 | Cosmetic, but cheaper to decide before the third door |

---

## 9. Phased rollout

Each phase is independently shippable and revertible; a track is a data row plus a renderer
module, and the hub renders whatever is registered.

**Phase 0 — the door and the frame (no tracks).** Generalize the select-screen door registry
(§5.0), add the `'speedway'` screen case, build `hub.js` with one placeholder track, verify the
anti-trap chain and that a player who never opens the door sees no change. *Revert = delete the
registry row.*

**Phase 1 — the spine (3 tracks) + the ghost.** `track.js`, `ghost.js`, `words.js`,
`render/kit.js`, and **Monaco GP (1979, `ttl`) → F-Zero (1990, `mode7`) → modern F1 sim (present,
`modern`)**. Three maximally-distant rendering tiers prove decision #3 immediately. Ghost, pit
board, non-scored field, CHARGE meter, GHOST ON/OFF setting. **`/security-review` runs here** (the
schema change lands here). This is the smallest complete Act 7.

**Phase 2 — the polygon step (2 tracks).** **Virtua Racing (`flatpoly`) + Daytona USA (`texpoly`)
ship together, never separately** — the flat-shaded → texture-filtered step *is* the content of
those two tracks (locked decision #2), and shipping one alone would teach the wrong thing.

**Phase 3 — the sprite-scaling and Mode 7 companions (3 tracks).** Pole Position (1982, `scaler`),
Hang-On (1985, `scaler`, the *first* Super Scaler game — substituted for Out Run, which is Level
21 and a hard cabinet collision), Super Mario Kart (1992, `mode7` + split-screen framing).
Optional here: the Act 7 SECRET history card, if Trevor wants one.

**Phase 4 — the rest, and the vehicles that are not cars (3+ tracks).** Excitebike (1984, `8bit`
side-scroll + the temperature gauge + the track-editor rhyme with Act 6's "YOUR OWN WORLD"
maker), Gran Turismo (1997, `ps1`, the unfailable licence drill), a modern open-road track
(Midnight Club: Street Racing 2000 **ESRB E** or Need for Speed: Underground 2003 **ESRB E** —
*not* GTA, *not* Forza Horizon which is ESRB T). **Nothing in this phase is blocked on outside
research** — flight is a sibling act (§5.6c), and the vehicle scope is closed: two of the locked
tracks are bikes and one is anti-grav. The only outstanding content top-up is a small bike/kart
vocabulary layer, which no track depends on.

**Phase 2b (parallel, optional) — the WebGL path.** Stations 10–11 are the only two that need a
backend beyond Canvas 2D (§5.6d). That work is independently schedulable, lands behind
`kit.for(station)` at tier `modern`, composites through an offscreen canvas, and must ship with
its Canvas-2D fallback in the same change. *Revert = delete the `modern` backend branch; the
tracks keep rendering.*

---

## 10. Acceptance criteria — candidate invariants

Written for `test-engineer` to implement directly. Next free ID is **INV-76** (INV-75 is the
rubber duck). Each cites its design source, per `.claude/rules/testing.md`.

- **INV-76** (L2) **Distance is produced by typing, never consumed by time.** An Act 7 lap
  completes when the last character of the lap is typed correctly, and by no other means. No
  clock, timer, countdown, checkpoint, or elapsed-time threshold can end, shorten, fail, or
  interrupt a lap; a lap left idle for an arbitrary period is still exactly where it was, and
  still finishable. (`product.md` §1 "No timers running out. No forced failure states."; CLAUDE.md
  §The One Rule; `racing-games-by-era.md` §12 — the arcade coin contract, inverted.)
- **INV-77** (L2) **The wrong-keypress contract holds verbatim in Act 7, and nothing is ever
  taken.** A wrong key in a track produces a gentle nudge, the letter stays and waits, the
  mistake is logged quietly, and the correct key then advances with no double penalty. In
  addition, a wrong key never reduces charge/boost, never reduces speed below the floor, never
  moves the vehicle backwards, never resets a streak counter, and never decrements the lap
  progress, the odometer, the lap count, or the clean-run best. (CLAUDE.md §Wrong Keypress
  Behavior; `product.md` §3; Survival's "wrong keys cost nothing".)
- **INV-78** (L2) **The advance floor is invariant.** Every correct keystroke advances the
  vehicle by the same fixed distance, independent of typing rate, accuracy, charge level, ghost
  presence, EXPERIENCE tier, word-length settings, or track. Therefore every track is finishable
  at any typing rate by any player. (Locked decision #4; `product.md` §1 "Adaptive, Not
  Competitive"; §5.2 of this spec.)
- **INV-79** (L2) **Charge is additive-only and decays uniformly.** The boost meter is increased
  only by correct keystrokes, is decreased only by continuous time-decay applied identically
  during flawless and error-laden play, is never zeroed or deducted by a mistake, and can never
  make the vehicle slower than the INV-78 floor. (Super Mario Kart's coin buffer with the hit
  removed — `racing-games-by-era.md` §12 "mechanics worth stealing"; §5.2.)
- **INV-80** (L2) **The ghost is yourself, and it is never an opponent.** The ghost is rendered
  from the player's own previous completed lap on that track, is labelled as the player's own
  previous run, and on reaching the finish line **remains on screen** until the player finishes.
  No placement, position number, finish order, ranking, elimination, or defeat string exists
  anywhere in Act 7. (Trevor's locked decision #6; `product.md` §1; memory `act7-speed-racing`:
  "a race you can never lose".)
- **INV-81** (L2) **The first lap has no ghost and still completes warmly.** With no stored
  record for a track, the lap runs with no ghost vehicle, is framed as setting the pace, and on
  completion creates the record. No Act 7 surface requires a ghost to exist. (§5.5;
  `product.md` "A child should leave every session feeling capable".)
- **INV-82** (L2) **The field is atmosphere, never competition, and the player never fails.** AI
  vehicles are never scored or compared against the player in any surface or stored value; their
  speed is derived from the player's own rolling keystroke rate and clamped to a band around it;
  and the player's vehicle has no crash, spin, stall, or stop state under any input whatsoever.
  (Trevor's locked decision #6 — "visually interesting"; Daytona USA's adaptive AI via
  `tech.md` §Adaptive Pacing; the Missile Command precedent, `levels/act5.md` Level 23.)
- **INV-83** (L2) **Act 7's counters only ever go up, and no negative number is ever displayed.**
  Lap count, odometer and clean-run best are monotonically non-decreasing across every run,
  including slower and error-heavy runs; the pit board never renders a minus sign, a negative
  delta, or a "slower by" comparison — a slower lap simply omits the improvement line and shows
  time and best as two unannotated facts. (iRacing's incident ledger inverted —
  `racing-games-by-era.md` §12 final row; `product.md` §6 "Stats Are Present But Never Looming".)
- **INV-84** (L0/L1) **Ghost storage is per-slot, bounded, and garbage-tolerant.** Ghost records
  live inside the active save slot (`kk-slots[i].speedway`), are normalized field-by-field on
  read inside try/catch, cap at 2 ghosts per track and 64 splits per ghost with non-decreasing
  integer splits, drop unknown track ids, never throw on any malformed input, and degrade to "no
  ghost" rather than breaking the track. Erasing a saved game erases its ghosts; no ghost datum
  is ever transmitted anywhere. (security.md rules 4, 6 and 8; `js/slots.js` `normalizeSlot` as
  the reference implementation.)
- **INV-85** (L1/L2) **The era ladder is declared and mechanically enforced.** Every registered
  track declares a `renderTier` from the enum plus a `variant` and an authored `eraRank`;
  `eraRank` is non-decreasing when tracks are ordered by year; **no two tracks share an identical
  `(renderTier, variant)` pair** (so F-Zero and Super Mario Kart, both `mode7`, are declared
  distinct, as are Pole Position and Hang-On, both `scaler`); the earliest track is `ttl` and the
  latest is `modern`; **Virtua Racing declares `flatpoly` and Daytona USA declares `texpoly`**;
  and each track's renderer is constructed with `kit.for(station)`, which exposes only that
  tier's primitives (a `ttl` renderer has no gradient available; a `flatpoly` renderer has no
  `texturedPoly` available). (Trevor's locked decision #3; `product.md` §5 "Graphic Quality Grows
  With the Player".)
- **INV-86** (L2) **Anti-trap: Escape always makes progress toward the arcade.** From every state
  in Act 7 — start line, mid-lap, pit board, hub — Escape alone reaches track → hub → arcade, and
  there is no state from which it fails. (`product.md` One Rule extended to "never trapped";
  mirrors Act 6's INV-46.)
- **INV-87** (L1/L2) **Act 7's content floor is static, kid-safe, and network-free.** Every
  track's word pool is a curated static bank containing no `BASE_WORDS` floor word and none of the
  never-words (`crash`, `wreck`, `collision`, `burnout`, `dnf`, `dead`, `die`, `kill`); no Act 7
  code path issues any network request; and MIN/MAX WORD LENGTH is applied best-effort with a
  fallback to the track's own words, so no settings combination can make a track unfinishable.
  (security.md rules 6 & 7; `product.md` §Word Length "winnability is never traded for it";
  `automotive-vocabulary.md` §2.)
- **INV-88** (L2) **EXPERIENCE scales the road, never the demand.** A higher EXPERIENCE tier
  increases a track's character length only; it never increases a required speed, a required
  accuracy, or any threshold the player must meet, and every tier remains finishable at any
  typing rate. At the default tier, behaviour is identical to an unscaled track.
  (`theme-authoring.md` §The EXPERIENCE win-ratio: "a higher ratio is always MORE play, never a
  penalty".)
- **INV-89** (L1/L2) **The rendering backend is invisible above the render kit.** Whatever a track
  draws with, it exposes the unchanged module contract (`start`/`stop`/`keystroke`/`miss`/
  `patternComplete`/`victory`, with `patternComplete()` monotonic and never un-winning, and
  `victory()` returning its duration in ms), it draws inside the stage regions with the UI's
  centre reserved, and no engine or screen code branches on which backend a track uses. A WebGL
  track composites through its own offscreen canvas into the shared 2D canvas — the shared canvas
  never changes context type. (`theme-authoring.md` §The module contract + §The win-gate
  accumulator pitfall; `visual-validation.md` §The Theme Layout Contract; Trevor's decision 7.)
- **INV-90** (L2) **WebGL is optional; no track is ever blank.** If a WebGL context cannot be
  created or is lost, the track renders through its Canvas-2D fallback and remains fully
  completable with the ghost, the field, and the pit board intact. No rendering condition can make
  a track unplayable, unwinnable, or empty. (`product.md` One Rule — winnability is the floor;
  INV-64/INV-67's shape: generated/accelerated content is always additive to a static floor.)
- **INV-91** (L0) **Any vendored graphics library is committed, local, licensed and crawlable.**
  It lives under `js/vendor/<name>/` as ES modules committed to the repo, is imported only by
  repo-relative path (never a CDN, never root-absolute), carries its `LICENSE` file beside it,
  requires no build step, and appears in the module graph `scripts/static-host-check.mjs` crawls
  with every file returning 200 in both the `/` and `/keystroke-kingdom/` host shapes. (security.md
  rule 6 — no external network calls; journal F26 — a green local suite shipped a broken published
  site; Trevor's decision 7 as constrained in §5.6d.)

---

## 11. Open questions for Trevor

1. **Which ghost do you race — last run or personal best?** *My recommendation: last run,
   firmly.* It is your own wording ("did you improve from the last time you ran the track"), and
   racing an all-time best means a child who has one great day loses to herself forever. Best
   becomes a keepsake on the pit board, celebrated when beaten, never an opponent on track.
2. **Confirm Phase 1's three-track spine: Monaco GP (1979) → F-Zero (1990) → modern F1 sim.**
   Eleven tracks is the biggest build this project has attempted. These three are the maximally
   distant rendering tiers, so the "graphics climb" thesis is visible in one sitting. Would you
   rather Phase 1 carried Virtua Racing + Daytona (your locked pair) instead of F-Zero, accepting
   a longer Phase 1?
3. **Brands: I recommend none, anywhere in Act 7.** Concepts over logos — cheaper, safer, and it
   teaches more. Do you want a small brand set anyway (in which case: century-old names only,
   parent-facing history-card copy only, and a lawyer's five minutes before any public push)?
4. **The seven automotive history cards** (`flag` L5, `volt` L11, `regen`/`brake` L12, `bertha`
   L12, `seatbelt` L12, `record` L13, `zoox` L15) — add them to the **existing level pools** now,
   independently of Act 7? And should Act 7 later award a **secret** card (`level: null`, like
   `joshua`), which counts toward the total without distorting any level's pool?
5. **The wing's name and the act numbering.** I propose **THE SPEEDWAY** on the door and hub. The
   numbering question ROADMAP already raises is now live: four parallel bonus wings on a
   five-act spine is not a linear progression, and the third door is the moment to decide whether
   they keep integers.
6. **The GHOST: ON/OFF settings row** — a global Settings row (my recommendation, default ON), a
   per-track choice at the start line, or not offered at all?
7. **Pixel-level graphics enforcement.** The most direct proof that Daytona out-renders Virtua
   would be an automated distinct-colour histogram of each track's canvas. `testing.md` rule 4
   forbids canvas pixel assertions, so I have **not** specified it. Leave the rule alone (my
   recommendation — the era-scoped kit is stronger enforcement anyway), or amend the rule first
   with your sign-off and then add the test?
8. **The modern open-road track (Phase 4): Midnight Club: Street Racing (2000, ESRB E) or Need
   for Speed: Underground (2003, ESRB E)?** NFS keeps your original anchor; Midnight Club is the
   era-correct open-city night racer. Both are rating-clean; GTA is out (regulator-sourced) and
   Forza Horizon is ESRB T, not a safe substitute.
9. **Decision 7 needs a doc edit before it needs any code.** `.claude/rules/tech.md` and
   `CLAUDE.md` both still say the engine is *"Bespoke (deliberate — no framework)."* Sign off on a
   narrowed exemption — *graphics rendering only, vendored ES modules only, no build step, no
   CDN* — and I (or whoever you prefer) will edit those two files **before** a single vendored byte
   lands. Doc first, then feature, per `testing.md` rule 1.
10. **Rendering backend: confirm raw WebGL2, no framework** (my recommendation), used at tracks
    10–11 only, behind the render kit, with a Canvas-2D fallback. The alternative worth a moment
    is **regl** (MIT, ~30 KB) if hand-written GLSL proves slow going. **three.js is a no** at
    ~600 KB–1.2 MB for two tracks in a free game a child downloads — and remember the deferred
    25-level fidelity audit will inherit whichever technique Act 7 establishes, which is the
    strongest argument for choosing the smallest thing that works.

---

*Related: `research/racing-games-by-era.md` · `research/automotive-vocabulary.md` ·
`research/vehicle-games-beyond-cars.md` + `research/wiki/tech/keyboard-as-cockpit.md` +
`research/wiki/tech/flight-sim-rendering-eras.md` (the **sibling flight act** — §5.6c, not
designed here) · `docs/features/text-worlds.md` (the
structural precedent) · `docs/ROADMAP.md` §2 · `.claude/rules/product.md` ·
`.claude/rules/theme-authoring.md` · `.claude/rules/security.md` · `docs/testing/STRATEGY.md` §5.*
