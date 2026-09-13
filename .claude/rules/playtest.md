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

## Report honestly

Every report on player-facing work states:
- **what you actually played** — route, how many runs, which phases;
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
- Journal **F24** (the recorder synthesized success while stalled for two hours),
  **L36** (code that looks animated can render identical frames), **F23** (Level 8
  shipped unwinnable — nothing had ever tried to win it), **F26** (the published build
  shipped broken — nothing had ever tried to load it). This rule is the same lesson a
  fourth time: *a capability nobody exercises is a capability nobody has verified.*
