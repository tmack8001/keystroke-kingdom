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
| `--at=hardware:<station-id>` | THE HARDWARE — boot a machine, then the card it hands you on the way out (`apple-iie`, `msdos-pc`; ids come from `js/hardware/stations.js`) |
| `--at=freeplay:<1-25>` | FREE PLAY on one cabinet — full keyboard, real sentences, and the **ACT card**, which reveals nowhere else |

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
- `freeplay:<1-25>` — plays N Free Play sessions on that cabinet. **Defaults to 2**, because
  session 1 can only show you *a* card; only session 2 tells you the act pool ROTATES.
  It reports the act card by name each session and says explicitly whether it repeated.

  Two things this target has to do that are easy to get wrong, both of which produced a
  confident wrong answer the first time:
  - **The act layer is unlocked AFTER `goToSelect`, never before.** `goToSelect` opens with
    `localStorage.clear()` — it always boots a brand-new machine — so a seed applied first is
    gone before the first keypress. The first version seeded up front and then reported "no act
    card" on an act that has four.
  - **Session 2 uses the game's own `R` (replay), not a fresh navigation.** Re-walking through
    `goToSelect` would clear storage and take the act-card rotation with it, so the pool could
    never rotate and a working feature would look broken. `R` calls `startGame()` with
    `state.freePlay` untouched — a genuine second session, same cabinet, storage intact.

  ⚠️ An act with no cards yet (Acts 2–5 today) reports "no act card" and that is **correct, not
  a failure** — an empty act is inert by construction.

- `hardware:<id>` — visits a station N times. **Defaults to 2**, for the same reason the
  speedway does: visit 1 shows the card marked **NEW!**, and only visit 2 can tell you
  whether the station's pool actually ROTATES. With one card authored per station it does
  not, and the run says so out loud rather than letting a pool of one look like variety.

  ⚠️ **Do not press Return after a boot line.** A line commits on its LAST CHARACTER
  (`handleBootKey` calls `commitLine()` the moment `typed.length` reaches the line length),
  so Return is never needed — and after the final line the machine is already awake, where
  the handler reads Return as *walk out*. The first version of this target did exactly that:
  it skipped the celebration, landed on the card, and then reported **"no card revealed"**
  about a card that was on screen. Journal **F28** again — when the evidence says something
  is broken, check the instrument first.

Then add `--fresh` for the third program: a brand-new machine every run.

---

## Personas — `--persona=<id>`

A persona is a gamer, defined once in **`scripts/personas.mjs`** and replayable exactly:
its **settings** (written to `kk-settings`, then verified against the live game), its
**seeded save**, its **route** in, the **host shape** it insists on, and its **typing** —
cadence, wrong keys, repeated wrong keys, mash bursts, lone modifiers, held keys, idle gaps,
tab blur, Escape/Tab/Space mid-level. `.claude/rules/playtest.md` §Personas says which one to
run for which kind of change.

| id | who | settings | types | seed / route / host |
|---|---|---|---|---|
| `first-timer` | brand new to keys and to reading | defaults (ADVENTURE, 1×, ANY/ANY, hints moderate) | 2–5 s a key, 25% wrong, the **neighbouring** key first | fresh · **real first-time route** for Level 1 (types `OONA` at name entry) · root |
| `struggling-beginner` | more wrong than right | defaults | 1.2–3.5 s, 55% wrong, the same wrong key 3–6×, 9/s mash bursts, lone modifiers, held keys, 30–90 s idles, tab blur, Escape/Tab/Space | fresh · WOPR · root |
| `family-parent` | a grown-up on the shared machine | HOTSHOT 2.25×, length 4–8, hints subtle | ~1 s, 4% wrong | **3 games** (OONA L12, DAD L20, GRAM L4), resumes DAD · WOPR · root |
| `speedrunner` | ~90 WPM, every lever up | WIZARD 3.5×, length 6–24, hints subtle | 100–130 ms, 1% wrong | fresh · WOPR · root |
| `speedrunner:survival` | the same hands, opted into Survival | SURVIVAL, EXPERT, 1 quarter | as above | fresh · WOPR · root |
| `explorer-8yo` | a steady early typist who opens every door | defaults | ~10 WPM, 15% wrong | fresh · WOPR · **prefix** (refuses the root shape) |

`node scripts/playtest.mjs --persona=list` prints the same, plus each persona's **focus list**:
the `--at` targets it exists for and what to judge at each.

| flag | what it does |
|---|---|
| `--persona=<id>` | play as that persona. `--persona=list` lists them. |
| `--seed=<int>` | the persona's decision stream (default `1979`). **Same id + same seed = the same decisions.** |
| `--pace=<0.01–1>` | scale the persona's waits (default `1`, real time). Below 1 the game sees a faster typist and an idle is shorter; judge acceptance at `1`. |
| `--plan=<n>` | print the first *n* decisions and exit. No browser, no server: the cheapest reproducibility check there is. |

What changes under a persona:

- **`level:N` PLAYS the level to a win**, then shows LEVEL COMPLETE (with `--laps`, it replays
  through **R**). Without a persona, `level:N` still stops at the first prompt.
- **Every key that is not the right one is checked.** The prompt is read before and after it;
  if it moved, the PERSONA REPORT prints `✗ ONE RULE VIOLATION` and the run **exits 1**. A lone
  modifier is also checked for logging a mistake (the input contract says it must not).
- **The first time each kind of moment happens, it is screenshotted**: `persona-first-wrong-key`,
  `-mash`, `-hold`, `-idle`, `-blur`, `-pause`, `-tab`, `-gameover`, `-slot-picker`.
- **It types ahead the way a fluent typist does.** The expected letter is the first one not yet
  completed, so the persona does not wait for the engine's `paced(150)` highlight. Without this
  a 90-WPM persona was capped at about 30.
- **On the canvas wings (`speedway`, `hardware`) it types at its cadence only.** There is no DOM
  prompt to check a wrong key against, so none is injected, and the report says
  `NOT EXERCISED` instead of claiming a pass.

The run ends with a **PERSONA REPORT**: settings (and whether they were verified in the live
game), levels reached, prompt turnovers, correct vs injected keys by kind, wall time, persona
time (the uncompressed estimate under `--pace`), per-level time against the persona's budget,
effective WPM, the One Rule verdict, observations, console errors, and the **decision-trace
hashes**. Under `--shot`, `persona-trace.json` holds the full trace.

**The reproducibility proof:** run it twice with the same seed and compare the `first-50 hash`
(or diff the two `persona-trace.json` `decisions` arrays). The decisions match. The *typed letters*
match only as far as the game's intro drills, because the pattern pool after them is unseeded
by design.

```bash
python3 -m http.server 8834 --directory /Users/trevormack/dev/keystroke-kingdom
U=--url=http://127.0.0.1:8834/
node scripts/playtest.mjs $U --at=level:1 --laps=2 --persona=first-timer           # guide on run 1, gone on run 2
node scripts/playtest.mjs $U --at=level:8 --persona=struggling-beginner --seed=7   # the One Rule under fire
node scripts/playtest.mjs $U --at=complete:13 --laps=3 --persona=family-parent     # rotation on DAD's save
node scripts/playtest.mjs $U --at=complete:22 --persona=speedrunner                # 3.5x is still winnable
node scripts/playtest.mjs $U --at=level:4 --persona=speedrunner:survival
node scripts/playtest.mjs --persona=struggling-beginner --plan=20 --seed=7         # no browser at all

# the explorer refuses the root shape — serve the published one:
mkdir -p /tmp/pagesroot && ln -sfn "$PWD" /tmp/pagesroot/keystroke-kingdom
python3 -m http.server 8809 --directory /tmp/pagesroot
node scripts/playtest.mjs --url=http://127.0.0.1:8809/keystroke-kingdom/ --at=coda:25 --persona=explorer-8yo
```

**Adding or changing a persona** is an edit to `scripts/personas.mjs` alone.
`tests/unit/personas.test.mjs` then pushes every persona's settings through the real
`js/settings.js` sanitizer (a value it would coerce fails the test), reads every seeded save
back through `js/slots.js`, checks every seeded card id is real, and pins that Survival appears
only in `speedrunner:survival` and that nothing a persona writes carries an age or other
personal field (security.md rule 8).

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
  A persona with a `slots` seed (`family-parent`) seeds `kk-slots` the same way, prints exactly
  what it seeded in the banner, and then enters through the returning player's own route
  (picker → resume → ready).
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
