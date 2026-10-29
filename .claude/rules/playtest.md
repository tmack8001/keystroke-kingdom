# Playtest Rule
## Keystroke Kingdom — you do not report gameplay work complete until you have played it

*Codified 2026-09-13, after Trevor play-tested the freshly-built Act 7 wing and found
**seven** issues in a single sitting — every one of them findable by playing, and none of
them found by the five lanes that built it, the test lane that covered it, the security
lane that audited it, or the orchestrator that verified its claims. His words:*

> *"all of these findings you could have found by playing yourself and not waiting for me."*

*He was right. This rule exists so that failure is structural, not a matter of diligence.*

---

## The rule

**Any change to something a player experiences is not complete until someone has PLAYED
it and looked at the result.** Not driven it with a script that asserts a DOM value.
Not screenshotted frame zero. Played it, the way a child would, and looked.

"Played" means, at minimum:
- Reached the feature through the **real route a player takes** — not a seeded state, not
  a console poke, not a direct call into the module.
- Exercised it **more than once**, because a startling share of bugs only exist on the
  second run (see §Second Run below).
- **Looked at the frames.** Reading the code is not looking. `make test-fast` passing is
  not looking.

If you cannot play it, say so plainly in your report and name what is therefore unverified.
An honest "I could not play this" is worth more than an implied "it works."

## Why the existing gates did not catch any of it

They were all doing their jobs. Each one's job just excluded this:

| Gate | What it proves | What it cannot see |
|---|---|---|
| `make test-fast` | data, logic, invariants, security greps | anything visual or felt |
| `make test-integration` | observable state through real key events | whether the result reads well |
| `static-host-check` | every file is reachable when published | whether the page is any good |
| screenshots | frame zero of a scene | motion, sequence, second runs, state that survives |
| `/security-review` | the code cannot be made to misbehave | the code behaving exactly as written, badly |

**A green suite is a claim about correctness, never about quality.** The seven findings
split almost evenly between *bugs a test could have caught if anyone had written it* and
*judgments no test can ever make* — and the second kind is the reason this rule is about
playing rather than about more assertions.

## The Second Run

**Three of the seven were only visible on the second play.** The start-line card still
read "FIRST LAP — YOU SET THE PACE" after a lap had been completed; the odometer showed
this round's letters rather than the running total; the ghost only exists at all once a
previous lap has been recorded.

This is not a coincidence, it is a category. Anything that **persists, accumulates,
rotates, or unlocks** is invisible on a first run by construction:
per-slot progress, history-card rotation, the L25 story rotation, the name moment,
first-time latches (the dial-up chirp, the eighth-key confession, the moth's found-state),
ghosts, odometers, "best" records.

**So: play it twice. Then erase the save and play it once more.** First run, second run,
and fresh-eyes run are three different programs.

## What only a human (or a human-paced play) can judge

These came from Trevor and could not have come from an assertion:

- **"It was really hard to determine which car was mine."** Every test passed; the frame
  was legible to a machine and confusing to a person.
- **"The winning celebratory moment needs to be a bit more exciting."** `victory()`
  returned a duration and the test was satisfied. `theme-authoring.md` already warned
  that a `victory()` without a real animation is *"4 seconds of dead air — a product
  violation"*, and it shipped anyway.
- **"They render as a single act and show up as cabinets next to each other."** The
  navigation worked perfectly. It just did not look like the rest of the game.

When you are building something a child will look at, **budget time to look at it.**

## The cheap version — do this every time

**The fastest path is `scripts/playtest.mjs`** — it drives the real game to a named state
and leaves the browser open for you to look at. Full target list and both workflows:
**`scripts/README-playtest.md`**, or `node scripts/playtest.mjs --list`.

```bash
node scripts/playtest.mjs --at=complete:13 --laps=3   # the card rotation, on screen
node scripts/playtest.mjs --at=cinematic:mystery      # reached by WINNING Level 5
node scripts/playtest.mjs --at=speedway:monaco-gp     # defaults to 2 laps: lap 2 has the ghost
node scripts/playtest.mjs --at=coda:25 --laps=2       # a different story each run
node scripts/playtest.mjs --at=victory:3              # the celebration window, mid-play
# add --fresh for the third program (a brand-new machine), --shot=<dir> to capture and exit
```

It defaults `speedway` to **two** laps on purpose: a first lap has no ghost, so a one-lap
visit cannot show the thing worth looking at.

**A capture waits for the animation to FINISH, never merely to appear** *(added 2026-09-13,
journal F28)*. Every `waitFor*` predicate fires the instant a `hidden` class comes off, but
`.complete-overlay` fades in over 0.4s and `.history-card` drops in over 0.4s — so a shot taken
on visibility photographs a **30%-opacity** card over a theme mid-victory-bloom, and a perfectly
good feature looks broken. `shot()` now awaits `settleAnimations()` first (finite animations
only — the arcade's deliberate infinite ones would hang it). If you write a new capture script,
do the same: **wait for done, not for present.** A screenshot is a claim about a moment, and the
moment has to be chosen.

```bash
make run                      # or your own static server on your assigned port
# then, through the real route, as a player:
#   1. reach it the way a player reaches it
#   2. do the thing
#   3. do it AGAIN
#   4. erase the save; do it once more
#   5. screenshot each phase and OPEN the images
```

For a wing or a level, prefer `scripts/record-playthrough.js` (human-paced, seeded) and
watch the video. The **`game-player` agent** (`.claude/agents/game-player.md`) exists
precisely for this and is under-used — dispatch it rather than deciding you will eyeball
it later. *This is the correction: the agent existed, and nobody sent it.*

## Personas — play as somebody, the same somebody every time

*Added 2026-10-29.* Five persona testers were run in one session as PROSE briefs ("you are a
first-timer, pause 2–5 s, get a quarter of the keys wrong…"). Every brief had to re-invent its
settings, its typing, its seeded save and its focus list, so two runs of "the struggling
beginner" were two different testers and a finding could not be re-played against a fix.
**A persona is now a named, reproducible thing** — `scripts/personas.mjs`, one source of truth:

```bash
node scripts/playtest.mjs --persona=list
node scripts/playtest.mjs --at=level:8 --persona=struggling-beginner --seed=7
```

The same id and the same `--seed` give the same settings, the same seeded save and **the same
sequence of typing decisions** on every run. The game's own pattern pool is unseeded and stays
that way, so the *letters* differ between runs; the persona's behaviour does not. Two things the
persona does that a prose brief never did:

- **It checks the One Rule on every key that is not the right one.** Every wrong key, mash key,
  lone modifier, held key, Escape, Tab and idle gap is bracketed by a read of the prompt. If the
  prompt moved, that is a violation and the run exits 1. A green persona run is evidence, not an
  impression, that the letter waited.
- **It verifies the game is actually running its settings**, by asking the live
  `js/settings.js`, and fails if any value was coerced.

**Which persona for which change:**

| You changed… | Run |
|---|---|
| anything a brand-new player meets (cold open, Levels 1–5, the first finger guide, the mystery cinematic) | `first-timer` — Level 1 uses the real first-time route, no WOPR |
| feedback, wrong-key handling, hints, pause, a level's win gate, anything "mid-level" | `struggling-beginner` — the One Rule under 55% wrong keys, mashing, holds, idling, Escape/Tab |
| save slots, cards, rotation, the gallery, act cards, a bonus wing's card | `family-parent` — three seeded games on one machine, HOTSHOT, length 4–8 |
| EXPERIENCE scaling, word length, Survival, a race, the L25 coda length | `speedrunner` (WIZARD 3.5×, length 6–24) and `speedrunner:survival` (EXPERT, 1 quarter) |
| a wing, an `/api/*` call, anything that must degrade on the published site | `explorer-8yo` — refuses to run anywhere but the `/keystroke-kingdom/` prefix shape |

**What a persona cannot do — say so when it matters.** On the canvas wings (Speedway, Hardware)
it types at the persona's cadence but **injects no wrong keys**: there is no DOM prompt to check
the One Rule against, and a boot line takes typed characters literally. `--pace` below 1
compresses its waits, so the game sees a faster typist, and an "idle" lasts a fraction of its
real length. **Judge acceptance at `--pace=1`.** Use `--pace` only to reach a state.

**A persona report names the persona and the seed** (`struggling-beginner seed 7`), and quotes
the PERSONA REPORT block, which includes the decision-trace hash. Without the seed, nobody can
re-play the run that found it.

## Report honestly

Every report on player-facing work states:
- **what you actually played** — route, how many runs, which phases, and **the persona and
  `--seed`** if you played as one;
- **what you looked at** — the frame paths, and that you opened them;
- **what you could not play, and why** — the honest limits, named rather than implied.

"Verified" with no play behind it is the claim this rule exists to stop.

## Related

- `.claude/rules/visual-validation.md` — the per-frame checks and the layout contract.
  That rule tells you **what a good frame looks like**; this one tells you **that you
  must go and get one.**
- `.claude/rules/theme-authoring.md` §"Victory must celebrate" — verify with differing
  frames from an actually-won run, never by reading the code (journal L36).
- `docs/testing/STRATEGY.md` — what the suite covers, and therefore what it does not.
- Journal **F28** (this tool photographed frames the player never sees — a working history
  card looked buried, and the hunt was for a z-index bug that did not exist. **When the
  evidence says something is broken, check the instrument first**),
  **F24** (the recorder synthesized success while stalled for two hours),
  **L36** (code that looks animated can render identical frames), **F23** (Level 8
  shipped unwinnable — nothing had ever tried to win it), **F26** (the published build
  shipped broken — nothing had ever tried to load it). This rule is the same lesson a
  fourth time: *a capability nobody exercises is a capability nobody has verified.*
