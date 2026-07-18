# Hand Balance & Word-Pool Variability — Validation Report

**Date:** 2026-07-12 · **Branch:** act5-full-circle
**Trigger:** Trevor's Q\*bert (Level 22) play session.
**Status of proposals below:** **PROPOSALS FOR TREVOR'S REVIEW — `js/levels.js` is UNTOUCHED.**

---

## 1. Trevor's intent

After actually playing Level 22 (Q\*bert), Trevor observed:

> His round repeated the same sequences (`[go]`, `[play]`) with little variability,
> and was very right-hand-heavy with little left↔right alternation.

He asked for three things, and this report addresses each:

1. **Transcripts should track hand balance** — done (see §2; `scripts/record-playthrough.js`
   now emits `hand_balance` events + a table in every `.transcript.md`).
2. **Word pools should engage BOTH hands** on new AND old letters, aiming balanced —
   *while understanding* that levels introducing only right- or left-hand keys will lean
   that way, and that numbers / right-hand symbols make balance inherently lopsided.
3. **Later word/phrase levels are expected to run 90–160 seconds of typing** — that is
   intended, not a slog (see §6 calibration note).

**The headline finding:** the game as a whole is *well balanced* — across the definitive
full-game playthrough the total keystrokes came out **537 left : 549 right (0.51
right-share)**. The imbalance Trevor felt is **concentrated in specific levels**, and it is
worst exactly where he found it — Level 22 played **28 left : 105 right (82% right)**. This
report separates "the pool leans harder than its own key set forces" (fixable) from "the
level's newly-taught keys are all one-sided" (expected).

---

## 2. Metrics implementation

### 2a. Hand classification — single source of truth

Every metric derives hand-per-key from **`FINGER_MAP` in `js/levels.js`** (label starts
with `LEFT` → left, `RIGHT` → right). No layout table is hand-rolled anywhere. The three
neutral keys are documented and excluded from L/R balance:

- `' '` (space) — labelled `THUMB — THE BIG KEY`; belongs to no hand → **neutral**.
- `Backspace` — labelled `RIGHT PINKY` but is an *editing action*, never inside a real
  word (only L25 correction drills) → **neutral** for word-hand analysis.
- `Shift` — a modifier chord, not a balance keystroke; uppercase letters (L24) inherit
  their **base letter's** hand (`S` → left, same as `s`).

### 2b. Transcript instrumentation (`scripts/record-playthrough.js`)

Every recording now writes, in addition to the existing timeline, a `hand_balance` event
per level plus a run summary — in both the `.transcript.jsonl` (machine) and a **Hand
balance (played reality)** table in the `.transcript.md` (human). Per level it reports:

| field | meaning |
|---|---|
| `keystroke {left,right,neutral,ratioLR,rightShare}` | **actual keystrokes** the hands pressed (accepted + injected-wrong presses) |
| `keySetRightShare` | the level's **unlocked key set's** own right-share — the EXPECTED-lean baseline |
| `leanDelta` | played right-share − key-set right-share (**+ = leaned MORE right than the keys force**; the fixable part) |
| `alternationPlayed` | avg within-word fraction of consecutive keystroke pairs that switch hands |
| `singleHand {words,rightOnly,leftOnly,share, …lists}` | single-hand words (≥2 non-neutral tokens), ignoring 1-char drills |
| `variability {served,distinctServed,repeatRate}` | distinct served patterns vs total (`repeatRate = 1 − distinct/served`) |

Validated on two scoped single-level runs (both exit 0, 0 rejected presses, 0 fatal
errors): **L22** reported played `20:91` (rightShare 0.82, leanΔ +0.26, 41% single-hand
words all right-only, 29% repeats) — the right-lean is unmistakable in the numbers; **L9**
reported played `18:13` (balanced key set, leanΔ −0.08, no lean flag) as a control.

### 2c. Static + post-processing analyzer (`scripts/analyze-hand-balance.mjs`)

No browser. Imports `js/levels.js` directly. Two modes computing the **same** metrics:

- **(default) STATIC** — POOL POTENTIAL: what balance/variety a level's declared pool
  *could* deliver. Also `--json`, `--level=N`.
- **`--transcript <file.jsonl>`** — PLAYED REALITY: post-processes *any* transcript
  (including historical ones that predate the record-time `hand_balance` events), so old
  films stay analyzable. This is what turns Trevor's "the balance could be calculated from
  the jsonl transcript" into a one-command check.

The comparison of the two — **pool potential vs. what a real run actually served** — is the
core evidence in §3–§4.

---

## 3. The 25-level table

### 3a. STATIC pool potential (from `js/levels.js`)

```
Lv New     keySet L:R  pool L:R      leanΔ   alt  1hand%  R-only  L-only  pool distinct  min  flags
1  fj      1:1         31:31             0  0.65      0%       0       0    16       16    8
2  dk      2:2         35:35             0  0.65      0%       0       0    16       16   10
3  sl      3:3         42:42             0  0.55      0%       0       0    16       16   10
4  a;      4:4         57:27         -0.18  0.36     28%       0       5    18       18   10  POOL→L LOW-ALT 1HAND
5  gh      5:5         44:44             0  0.46     13%       1       1    16       16   11  LOW-ALT
6  ei      6:6         74:54         -0.08  0.54      9%       1       2    32       32   13
7  ru      7:7         83:50         -0.12   0.6      6%       0       2    32       32   13  POOL→L
8  ty      8:8         101:54        -0.15  0.57      8%       0       3    36       36   13  POOL→L
9  wo      9:9         89:82         -0.02  0.58      3%       1       0    39       39   13
10 qp      10:10       69:102         +0.1  0.48      3%       1       0    40       40   13  LOW-ALT
11 vm      11:11       110:66        -0.12  0.55      5%       0       2    39       39   13  POOL→L
12 bn      12:12       104:79        -0.07   0.6      2%       0       1    43       43   13
13 c,      13:13       120:73        -0.12  0.51     10%       0       4    41       41   12  POOL→L
14 x.      14:14       74:39         -0.15  0.48     25%       0       7    28       28   12  POOL→L LOW-ALT 1HAND
15 z/      15:15       96:39         -0.21   0.4     24%       1       6    29       29   15  POOL→L LOW-ALT
16 56      16:16       59:54         -0.02  0.65      0%       0       0    24       24   13
17 47      17:17       63:63             0  0.62      0%       0       0    24       24   13
18 38      18:18       71:66         -0.02  0.56      0%       0       0    24       24   13
19 29      19:19       71:60         -0.04  0.55      0%       0       0    24       24   13
20 10      20:20       60:62         +0.01  0.67      0%       0       0    24       24   13
21 -=      20:22       44:75         +0.11  0.61      6%       1       0    18       18   10
22 []\     20:25       14:49         +0.22  0.44     25%       3       0    12       12   11  POOL→R LOW-ALT 1HAND REPEAT
23 `'      21:26       34:29         -0.09   0.6      8%       1       0    13       13    8  REPEAT
24 Shift   21:26(+1n)  26:19         -0.13  0.35     43%       2       4    14       14    7  POOL→L LOW-ALT 1HAND
25 ␣⌫      21:26(+3n)  34:37(+20n)   -0.03  0.69      0%       0       0    10       10    5  REPEAT
```
*(flags: POOL→R/→L pool leans ≥0.12 right-share beyond key-set baseline · LOW-ALT within-word
alternation <0.50 · 1HAND ≥25% single-hand words · REPEAT distinct pool <14)*

### 3b. PLAYED REALITY (definitive full-game transcript, `docs/keystroke_kingdoms.transcript.jsonl`)

24.6-minute kid-profile playthrough, all 25 levels, all four cinematics, 0 fatal errors.

```
Lv New     keySet L:R  played L:R     leanΔ   alt  1hand%  R-only  L-only  served distinct  rpt%  flags
1  fj      1:1         10:12          +0.05  0.48     29%       1       1      11        9    18  LOW-ALT 1HAND REPEAT
2  dk      2:2         33:32          -0.01  0.55     24%       2       2      21       19    10
3  sl      3:3         35:36          +0.01   0.4     25%       2       2      20       18    10  LOW-ALT 1HAND
4  a;      4:4         44:24          -0.15  0.37     44%       2       5      20       18    10  PLAYED→L LOW-ALT 1HAND
5  gh      5:5         14:21           +0.1  0.39     50%       3       2      14       12    14  LOW-ALT 1HAND
6  ei      6:6         19:14          -0.08   0.4     40%       2       2      14       12    14  LOW-ALT 1HAND
7  ru      7:7         15:14          -0.02  0.52     44%       2       2      13       11    15  1HAND REPEAT
8  ty      8:8         21:16          -0.07  0.42     36%       2       2      15       13    13  LOW-ALT 1HAND
9  wo      9:9         19:13          -0.09   0.4     50%       2       3      14       12    14  LOW-ALT 1HAND
10 qp      10:10       15:20          +0.07  0.39     40%       2       2      14       12    14  LOW-ALT 1HAND
11 vm      11:11       20:17          -0.04  0.49     20%       1       1      14       12    14  LOW-ALT
12 bn      12:12       22:20          -0.02  0.51     20%       1       1      14       12    14
13 c,      13:13       33:11          -0.25  0.48     33%       0       3      13       11    15  PLAYED→L LOW-ALT 1HAND REPEAT
14 x.      14:14       23:16          -0.09  0.42     22%       0       2      13       11    15  LOW-ALT REPEAT
15 z/      15:15       43:19          -0.19   0.4     33%       1       3      16       14    13  PLAYED→L LOW-ALT 1HAND
16 56      16:16       17:16          -0.02  0.47     44%       2       2      13       11    15  LOW-ALT 1HAND REPEAT
17 47      17:17       18:19          +0.01   0.5     40%       2       2      14       12    14  1HAND
18 38      18:18       18:19          +0.01  0.38     40%       2       2      14       12    14  LOW-ALT 1HAND
19 29      19:19       22:18          -0.05  0.48     40%       2       2      14       12    14  LOW-ALT 1HAND
20 10      20:20       19:20          +0.01  0.64     20%       1       1      14       12    14
21 -=      20:22       7:25           +0.26  0.22     67%       6       0      13       10    23  PLAYED→R LOW-ALT 1HAND REPEAT
22 []\     20:25       28:105         +0.23  0.38     36%      10       0      34       20    41  PLAYED→R LOW-ALT 1HAND REPEAT
23 `'      21:26       15:14          -0.07  0.54     29%       1       1      11        9    18  1HAND REPEAT
24 Shift   21:26(+1n)  15:12          -0.11  0.19     50%       1       2      11       10     9  LOW-ALT 1HAND
25 ␣⌫      21:26(+3n)  12:16(+9n)     +0.02  0.73      0%       0       0       7        7     0
```

**Reading the two together:** short played runs naturally show higher single-hand% (a
14-word round has more chance to hand a couple of short one-hand words), so the *static
pool* column is the truer signal of a design problem; the *played* column confirms what a
real child actually experiences. Where BOTH agree — L4, L14, L15 (left) and L21, L22
(right) — the lean is real and pool-driven.

---

## 4. Flagged levels

A level is flagged for a **proposal** only when its imbalance is *pool-driven* (the pool
leans materially beyond what its key set forces), or its pool is small enough to repeat
quickly. Levels that lean because their **newly-taught keys are one-sided** are
acknowledged as **expected** and NOT proposed for change.

### 4a. Expected leans — acknowledged, NOT flagged for change

- **Levels 16–20 (numbers 5/6, 4/7, 3/8, 2/9, 1/0):** every level adds one left + one
  right digit, so the key set stays 1:1 and the pools sit near balanced (leanΔ ≈ 0). The
  played single-hand% is high only because the intro drills (`5 6`, `4 7`, …) are literal
  one-key-per-hand pairs — this is the curriculum, not a flaw.
- **Levels 21 & 23 intro drills:** the `-`/`=` and `` ` ``/`'` reach keys are right-pinky
  (and one left-pinky) reaches; the played right-only words on L21 (`--`, `==`, `-=`, …)
  are the *new-key drills themselves*. Expected.
- **Level 24 (Shift):** single-hand% 43–50% because half the pool is short capitalized
  names (`Sun`, `Sam`, `Ada`) — the level's whole point is one-hand-holds-Shift. Expected.
- **Level 25 (Space/Backspace):** neutral-key heavy by design; balanced 0.51 anyway.

### 4b. Genuinely flagged (pool-driven — proposals in §5)

| Lv | Game | Static leanΔ | Played leanΔ | Why flagged | Primary fix |
|---|---|---|---|---|---|
| **22** | Q\*bert | **+0.22** | **+0.23** | Trevor's case. Pool is all right-heavy bracketed words (`[`, `]`, `o`, `p`, `y` all right); only 12 patterns → played **41% repeat** (`[run]`×4, `[play]`×3, `[go]`×2). | Add mixed/left-inner bracketed words + alternating `\` drills; grow pool 12→22 |
| **21** | Out Run | +0.11 | **+0.26** | Right-pinky `-`/`=` + digit equations skew right; only 18 patterns, played 67% single-hand. | Add hyphenated compound words that engage the left hand + a few left-leaning equations |
| **4** | Galaga | −0.18 | −0.15 | `a s d f` (all left) dominate the home-row word bank; `j k l` rarely start words → left-heavy, low alternation. | Add right-engaging home-row words/drills (`all`, `ask`, `fall`, `asks`, `lass`) |
| **14** | DKC | −0.15 | −0.09 | `x`+`.` add two more left keys; pool is `x`-words (`mix fix six fox box wax`) — left-heavy, 25% single-hand. | Add `x`-words that pull right (`oxen`, `exit`, `boxy`, `toxin`, `expo`) |
| **15** | Pokémon | −0.21 | −0.19 | Worst static left-lean: `z`-words (`zero zone jazz buzz`) are left-heavy; `/` barely used. | Add `z`-words engaging the right hand (`zoo`, `zonk`, `zippy`, `fizzy`, `dozy`, `pizza`) |
| **13** | Myst | −0.12 | **−0.25** | Pool `c`-words lean left; played run came out very left (33:11). Borderline static, clear in play. | Add `c`-words with more right content (`clock`, `comic`, `couch`, `cliff`, `court`) |

*(L7, L8, L11 carry a static POOL→L flag but their pools are large/varied and the lean is
mild/inherent to the new key — left as acknowledged, low-priority.)*

---

## 5. Concrete proposed pool changes

**Every proposed word below was verified programmatically to use ONLY that level's unlocked
keys** (checked against `LEVELS[n].keys` from `js/levels.js`; the checker rejected e.g.
`gash`/`dash` for L4 because `g`/`h` aren't unlocked until L5). All are **additions** —
nothing is removed, so no existing content is lost. Before→after numbers are the pool's
computed metrics.

### Level 22 — Q\*bert (the priority fix)

Preserve the bracket/backslash wrappers (required for the symbol level). Add bracketed
early-reader words whose *inner* word engages the left hand, and backslash drills that
alternate hands:

```
ADD (bracketed):  [read]  [safe]  [fast]  [wave]  [star]  [best]
ADD (backslash):  c\d   west\best   star\bar   fast\safe
```
**Before:** pool L:R `14:49` (rightShare **0.78**), single-hand 25%, distinct **12**, leanΔ **+0.22**
**After:**  pool L:R `63:65` (rightShare **0.51** ≈ key-set 0.56), single-hand 14%, distinct **22**, leanΔ **≈0**
→ Balance lands right on the key-set baseline; pool nearly doubles (12→22), directly
answering both the right-lean and the `[go]`/`[play]` repetition. All 10 words legal ✓.

### Level 21 — Out Run

```
ADD (compound):  day-care  sea-star  far-away  stay-safe
ADD (equations): 3-2=1  4-2=2  7-5=2
```
**Before:** pool L:R `44:75` (rightShare 0.63), 18 patterns, leanΔ +0.11
**After:**  pool L:R `78:89` (rightShare **0.53**), **25** patterns, leanΔ ≈0. All legal ✓.
(Hyphenated compounds are already the level's content type per `act5-full-circle.md`;
these just pull the left hand in.)

### Level 4 — Galaga (home row)

```
ADD (words):  all  ask  fall  asks  lass
ADD (drills, optional): dall  kall  jak  lall   ← nonsense right-engaging drills, in the
                        spirit of the level's pattern content; keep only if desired
```
**Before:** pool L:R `57:27` (rightShare 0.32), single-hand 28%, leanΔ −0.18
**After (words only):** rightShare rises toward 0.38, single-hand drops to ~0.19. All legal ✓.
*Note:* L4's leftward pull is partly inherent (English words on `asdf`+`jkl` skew left —
`j`/`k` rarely start words). The real words above are the safe, early-reader-appropriate
lift; the nonsense drills are optional and marked as such.

### Level 14 — Donkey Kong Country

```
ADD:  oxen  exit  boxy  toxin  expo   (and optionally: onyx, index)
```
**Before:** pool L:R `74:39` (rightShare 0.35), single-hand 25%, leanΔ −0.15
**After:**  rightShare 0.38, single-hand 0.20. All legal ✓. (`boxy`=alt 1.0, `oxen`/`exit`=0.67 —
these also raise the alternation the level is short on.)

### Level 15 — Pokémon

```
ADD:  zoo  zonk  zippy  fizzy  dozy  pizza   (optionally: jinx)
```
**Before:** pool L:R `96:39` (rightShare 0.29 — worst static left-lean), single-hand 24%
**After:**  rightShare 0.34, single-hand 0.19. All legal ✓. `dozy`=alt 1.0, `fizzy`=0.75
add alternation; all are recognizable to a Pokémon-era early reader.

### Level 13 — Myst

```
ADD:  clock  comic  couch  cliff  court
```
**Before:** pool L:R `120:73` (rightShare 0.38), single-hand 10%
**After:**  rightShare 0.41, alternation 0.51→0.53. All legal ✓. (`clock`/`click`/`crack`
already in the pool, so these fit the established `c`-word register.)

> **All of §5 is a proposal set. `js/levels.js` has NOT been edited.** Re-run
> `node scripts/analyze-hand-balance.mjs` after any accepted change to confirm the
> before→after numbers land as stated.

---

## 6. Calibration context — later-level typing duration (90–160 s)

Per Trevor: the later word/phrase levels are **expected** to run **90–160 seconds of
typing**, and that is intended, not a slog. For reference, the definitive full-game
transcript's per-level typing spans are consistent with this (Act 3–5 word/phrase levels
sit in the tens-of-seconds-to-minutes range at kid pace with think-pauses). This matters
for the variability proposals: a longer round shows MORE patterns, so a small pool
(L21/L22/L23 at 12–18 patterns) repeats sooner over a 90–160 s round — which is precisely
why growing L22's pool (12→22) is the highest-value change. Duration expectation and pool
size are linked: **the longer we intend a level to run, the larger its distinct pool
should be to avoid the repetition Trevor felt.**

---

## 7. Validation summary

- `scripts/analyze-hand-balance.mjs` — runs clean in both modes; static table = 25 levels,
  transcript mode post-processes the full-game jsonl = 25 levels. Q\*bert's right-lean
  falls out of both (static leanΔ +0.22; played 28:105 / +0.23 / 41% repeats).
- `scripts/record-playthrough.js` — `node -c` syntax OK; two scoped runs (L22, L9) exit 0
  with 0 rejected presses, 0 fatal errors; `hand_balance` events present in the jsonl and
  the **Hand balance (played reality)** table renders in the `.transcript.md`. L22 read
  `20:91`/leanΔ+0.26/41% single-hand (right-lean visible); L9 read `18:13`/leanΔ−0.08 (no
  lean flag) as a balanced control.
- `.claude/agents/game-player.md` — transcript documentation updated for the `hand_balance`
  event, the new `.md` table, and the analyzer's static + `--transcript` modes.
- All proposed words verified to use only their level's unlocked keys before inclusion.

*Report generated from: static analysis of `js/levels.js` + the full-game transcript
`docs/keystroke_kingdoms.transcript.jsonl`. Proposals are for review; no game code changed.*
