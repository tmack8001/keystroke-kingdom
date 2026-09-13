# `scripts/playtest.mjs` — go look at it, in one line

Opens the **real game** in a **real browser**, drives it to a named state through the
**real player route**, and **leaves the browser open for you to look at**.

It exists because `.claude/rules/playtest.md` says you may not report player-facing work
complete until you have played it — and a rule that is expensive to follow gets skipped.
Some states used to cost a full playthrough to reach (the act cinematics need levels
5/10/15/20 won; a speedway ghost needs a completed lap; the L25 coda needs a whole level).
Now each is one flag.

```bash
# your own server — never .dev-url, which can serve a stale embedded build
python3 -m http.server 8834 --directory /Users/trevormack/dev/keystroke-kingdom

DEV_URL=http://127.0.0.1:8834 node scripts/playtest.mjs --at=level:7
```

---

## Every `--at` target

| target | where it puts you |
|---|---|
| `--at=title` | the attract screen, cold (magic words, Konami, INSERT COIN) |
| `--at=select` | the arcade / level-select screen, every cabinet unlocked |
| `--at=slots` | the returning-player **CHOOSE YOUR GAME** picker, with 3 seeded games |
| `--at=level:<1-25>` | in the level, at the first prompt, ready to type |
| `--at=victory:<1-25>` | the theme's `victory()` **celebration**, mid-play — always captures a burst of 8 frames, because the window is 1.2–6 s and then gone |
| `--at=complete:<1-25>` | the **LEVEL COMPLETE** overlay + history card, after a real typed win |
| `--at=cinematic:mystery` | Act 1→2, **playing** — reached by actually winning Level 5 |
| `--at=cinematic:basement` | Act 2→3, after winning Level 10 |
| `--at=cinematic:commandcenter` | Act 3→4, after winning Level 15 |
| `--at=cinematic:fullcircle` | Act 4→5, after winning Level 20 |
| `--at=coda:25` | Level 25's **MY STORY** coda, at its first coda line |
| `--at=speedway:<track-id>` | Act 7 — a track, mid-race (`monaco-gp`, `f-zero`; ids come from `js/speedway/tracks/index.js`) |

`node scripts/playtest.mjs --list` prints the same list with the flags.

## Flags

| flag | what it does |
|---|---|
| `--laps=N` | **do it N times.** See below — this is the point of the tool. |
| `--fresh` | wipe localStorage before **every** run (the fresh-eyes run). Default keeps state between runs so accumulation is visible. |
| `--shot=<dir>` | screenshot every phase into `<dir>` and exit. Implies `--headless`. |
| `--headless` | no visible window (agents / CI). |
| `--url=<url>` | base URL. Default `$DEV_URL`, else `.dev-url`. |
| `--slow=<ms>` | slow every keypress by N ms, so you can watch it type. |

Exit codes: **0** reached it, no console errors · **1** could not reach it, **or** any
console error · **2** you asked for something that does not exist.

## `--laps=N` — the second run is a different program

Three of the seven issues that created this rule existed **only on the second run**
(`.claude/rules/playtest.md` §The Second Run). Anything that persists, accumulates,
rotates or unlocks is invisible on run 1 by construction. What a "lap" means per target:

- `level:N` — plays the level and re-enters it through the game's own **R = REPLAY**, so
  run 2 has the real second-run pool/latch state.
- `complete:N` / `victory:N` / `cinematic:*` — wins the level N times. On a level with
  several history cards you watch the **rotation** happen:
  `--at=complete:13 --laps=3` → GRACE HOPPER, then THE FIRST TEXT ADVENTURE, then
  THE WORD "CYBERPUNK".
- `coda:25` — reaches the coda N times; run 2 is a **different story**
  (`The quick brown…` then `The jay, pig,…`).
- `speedway:<id>` — races N laps. **Defaults to 2**, because a first lap has no ghost to
  look at; lap 2 asserts the ghost is really there ("YOUR LAST LAP IS OUT THERE WITH YOU"
  at the line, `GHOST · YOU · LAST TIME` on the HUD) and fails if it is not.

Then add `--fresh` for the third program: a brand-new machine every run.

---

## The two workflows

### 1. "I changed something, let me look at it"

```bash
python3 -m http.server 8834 --directory /Users/trevormack/dev/keystroke-kingdom

DEV_URL=http://127.0.0.1:8834 node scripts/playtest.mjs --at=level:9          # look
DEV_URL=http://127.0.0.1:8834 node scripts/playtest.mjs --at=level:9 --laps=2 # look again
```

The browser stays open. Type in it. Play it. Close the window when you are done.

### 2. "I am about to report complete"

```bash
S=/tmp/kk-proof
DEV_URL=http://127.0.0.1:8834 node scripts/playtest.mjs --at=complete:9 --laps=2 --shot=$S
DEV_URL=http://127.0.0.1:8834 node scripts/playtest.mjs --at=victory:9        --shot=$S
DEV_URL=http://127.0.0.1:8834 node scripts/playtest.mjs --at=complete:9 --fresh --shot=$S
open $S            # ← the step that is the whole point
```

Then put in your report **what you played, how many runs, and the frame paths** — and
say plainly what you could *not* play. A non-zero exit means the state was never reached;
paste the reason, do not paste "verified".

> `--shot` writes PNGs and says "OPEN THEM". It cannot make you open them, and an
> unopened screenshot has verified nothing. `victory:*` frames are the sharp case:
> eight files that are byte-identical mean the celebration does not animate
> (journal L36), and only your eyes or `md5` will tell you.

---

## How it reaches things (and what it refuses to do)

- **It types.** Winning a level is always done by reading the expected token out of the
  DOM before *every* keypress and pressing it, exactly like `scripts/record-playthrough.js`.
  No engine state is ever poked: a console-poked state can render perfectly while the real
  path renders nothing (journal **L36**), and a tool that synthesizes success is worse than
  no tool (journal **F24**).
- **One seeded target.** `--at=slots` seeds `kk-slots`, because the returning-player front
  door by definition needs saved games to already exist. `.claude/rules/testing.md` rule 6
  permits seeding to reach a state fast. Nothing that is being *looked at* is seeded.
- **It fails loudly.** Every wait has a deadline and a reason; unreachable states exit
  non-zero naming the state and why, plus a `FAILED-*.png` under `--shot`. It also refuses
  to accept a *plausible* arrival: the speedway confirms the start line is the track you
  asked for, and the coda waits on the saved game's story-rotation counter rather than
  guessing from prompt text (an earlier build proudly reported the `hello world` history
  card as the coda).
- **Navigation is not re-copied.** title → name → ready → select → level lives once, in
  `scripts/kk-playwright.js`.

## Related

- `.claude/rules/playtest.md` — the rule this serves, including what only a human can judge.
- `.claude/rules/visual-validation.md` — what a good frame looks like once you have one.
- `scripts/record-playthrough.js` — human-paced film of a whole run; use it (or the
  `game-player` agent) for a wing, and this for a single state.
- `docs/screenshots/capture-*.js` — the curated reference sets. This tool is the scratch
  pad; those are the committed artifacts.
