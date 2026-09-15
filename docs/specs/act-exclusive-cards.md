# THE ROOM'S OWN CARDS — an act-exclusive card layer that opens when the keyboard does

## Product spec / ADR — a third card bank, unlocked by the full keyboard, played in Free Play

*Written 2026-09-14 by the `product-manager` lane. **Revised the same day** after Trevor inverted
the spec's central constraint — see §0, which overrides anything below it that still argues from the
first draft. Inputs: the live code (`js/history-cards.js`, `js/slots.js`, `js/main.js`,
`js/freeplay.js`, `js/ui/screens.js`, `js/ui/cabinet-art.js`), `docs/specs/hardware-wing.md`
§0.3/§0.4/§5.4 (the sibling bank), `docs/testing/STRATEGY.md` §5 (INV-20/21/22/56/57/58, INV-94..100),
`.claude/rules/easter-eggs.md`, `.claude/rules/product.md` §History Cards / §Word Bank Principle /
§Content Rating, `.claude/rules/levels.md` §Milestones. Every distribution number below was
**measured from the bank, not recalled**.*

**Trevor's direction, verbatim:**

> *"I like the idea there are exclusive cards in each act/wing to collect. This drives replay
> behavior to each set of games instead of just to the game in general. Love that"*
>
> *"Let's also run some to add act exclusive cards to uncover and discover in the other acts that
> would encourage additional play behind a single play."*
>
> **(the revision)** *"Guess we could just introduce act/wing/phase cards after the entire keyboard
> is unlocked instead of going back to all the prior ones so it stays next to typing the card
> title."*

---

## 0. The inversion — what changed, and why the discarded design's measurement must outlive it

The first draft of this spec accepted one concession and flagged it as its single biggest risk:
**act cards would not be typed.** The reasoning was forced, and it is worth stating so the reversal
is legible:

> Levels 1–3 cannot spell anything — J F D K S L has no vowel, and `product.md`'s Word Bank
> Principle makes those levels deliberately wordless. A card is discovered by typing its word.
> Therefore a card at Level 1 is structurally impossible. To reach the three cabinets a beginner
> replays most, the draft **freed act cards from the typing ritual** and awarded them on a replay
> win instead, with a `FOUND IN THE ARCADE` label doing the work of explaining a card nobody typed.

**Trevor inverted the constraint rather than paying that price:** don't reach back into the early
levels at all — **open the whole act-card layer once the keyboard is complete.** At that point every
key exists, every act card's word is typeable, and the discovery stays exactly what it has always
been: *you type the word, you get the story.*

**This is better than either proposal, and for four reasons that are not merely "it is simpler":**

1. **It removes the risk instead of mitigating it.** The draft's mitigation was framing — a label
   explaining away a ritual that had been broken. There is now no ritual to explain away.
2. **It makes the full keyboard a REWARD, which is the game's entire thesis.** *"Typing unlocks the
   world"* (`product.md` §5). A child genuinely could not read Act 1's story while she was in Act 1
   — she did not have the letters. Now she does, and the history opens up. That is the same beat as
   the Mystery Cabinet and Level 20's binary→`HELLO`, told once more, at the exact moment the
   keyboard completes.
3. **It kills the hardest part of the build.** No second guaranteed-card slot, no already-won replay
   latch, no non-typed award path, no `FOUND IN THE ARCADE` framing. Levels 1–3 are not touched at
   all, which retires the Word Bank Principle risk entirely rather than arguing around it.
4. **It dissolves the era-mismatch finding as a side effect** — see below, because that finding is
   the most valuable thing the discarded draft produced and it must not be thrown out with it.

### 0.1 The measurement that motivated everything, and still does

The reason an act axis is not merely a relabelling of the level axis — a Level 8 card is already
Act-2-exclusive by transitivity — is this, measured from the bank:

```
cards per level  L1..L25:  0 0 0 2 2 | 3 2 6 4 2 | 5 6 7 2 2 | 1 2 2 1 3 | 1 1 1 2 2
cards per act:            Act 1 = 4 · Act 2 = 17 · Act 3 = 22 · Act 4 = 9 · Act 5 = 7
card year inside its act's own era:   Act1 0/4 · Act2 3/17 · Act3 0/22 · Act4 2/9 · Act5 2/7
                                      → 7 of 59 overall
```

**Only 7 of 59 level-attached cards fall inside their own act's era. Act 1 scores 0/4; Act 3 scores
0/22.** The 1979 arcade holds no card about arcades; the 1991–96 basement holds cards dated 1947,
1966, 1969, 1976 and 1977. This is not an authoring failure — it is what INV-56 *does*: it
distributes cards by **spelling**, not by subject or era. `phrack` (a 1985 hacker zine) sits on the
Myst cabinet because its letters happen to close at Level 13.

**Trevor's gate solves this more cleanly than the discarded design did.** The draft escaped the
spelling constraint by abandoning typing. The gate escapes it by **abolishing the constraint**:
once every letter is unlocked, spelling stops selecting *which act a card lands in*, so an act card
can simply be about the act it belongs to. Same outcome, ritual intact.

### 0.2 What the inversion costs, stated honestly

One thing genuinely goes away and does not come back: **a beginner at Levels 1–3 still gets no
card.** The draft's best consequence was that the second play of Breakout paid something. It
doesn't now. What a beginner gets instead is the promise — the layer is announced at the milestone
that unlocks it — and the game's existing answer for the early levels remains what it always was:
the cabinets themselves, the celebrations, and the first real word at Level 4.

**That gap is real and it is separately fixable.** Levels 1–3 can hold a card whose moment word is a
**pattern** rather than a word — Level 1's own documented content is *"j, f, jf, fj"*, and the bank
already contains non-word card words (`\o/`, `386`, `56k`, `1969`). A card attached to the token
`jf`, about the two raised bumps under her index fingers, asks her to type exactly what Level 1
already asks her to type. **It is out of scope here** (it is a level card on the existing axis, not
an act card) and is listed as a ROADMAP follow-up in §8, not as part of this feature.

---

## 1. Recommendation

**Build a third card bank, `ACT_CARDS`, with four cards per act; unlock the whole layer at Level 15
— the game's own FULL KEYBOARD UNLOCKED milestone; and make Free Play the surface where those cards
are typed and found.** Everything else in the design follows from those three choices, and the third
one is not a preference — it is the only solution the existing game admits.

**The gate: Level 15, flat, for the whole layer.** `.claude/rules/levels.md` names two candidate
milestones and the wording decides it: Level 15 is *"FULL KEYBOARD UNLOCKED"* (all 26 letters + core
punctuation, every letter key lighting at once); Level 25 is *"Full keyboard **mastered**."* Trevor
said *"after the entire keyboard is **unlocked**."* Beyond the wording, L15 is the better gate on
merit: a layer whose whole purpose is to **drive replay** needs game left to live in, and at L15
there are ten cabinets and three fully-unlocked acts of Free Play ahead, whereas a reward that
arrives at L25 arrives when the game is over. L15 is also an act boundary and the moment the
staircase rises — the game is already saying *the world just got bigger* right there.

**I considered and rejected a per-card gate** (a card unlocks when its own word becomes typeable —
"INV-56 applied honestly"). It is elegant on paper and buys nothing here: Free Play hands out the
**full keyboard regardless of progress** (`FREEPLAY_KEYS`, `js/freeplay.js`), so a per-card rule
would gate nothing a player could actually feel, while adding per-card machinery and a second
unlock concept. **One flat gate plus one content rule is strictly better:** every act card's word
must be typeable with Level 15's cumulative closure — **lowercase letters plus `;` `,` `.` `/`, and
nothing else.** No digits, no capitals, no space, no hyphen or apostrophe (those are Levels 21–25).
That is an authoring constraint on twenty brand-new cards, it costs the historian essentially
nothing, and it makes the gate exceptionless and testable (INV-123). Note what it excludes: a word
like `wi-fi` could not be an act card. `quarter`, `marquee`, `shareware`, `cursor` all can.

**The surface: Free Play, at the cabinet whose act owns the card.** Trevor's *"instead of going back
to all the prior ones"* rules out replaying Act 1's curriculum levels — and it turns out that
**replaying them would not work anyway.** After Level 15, the curriculum cabinets still hand you
their own restricted key sets: Level 1 is still `{j, f}`. So an Act 1 card can never be typed at
Act 1's curriculum cabinet, at any point in the game, ever. **Free Play is the only place in
Keystroke Kingdom where an Act 1 cabinet and a complete keyboard exist at the same time.** Trevor's
two constraints — *typeable word* and *don't go back* — have exactly one solution in the game as
built, and it is already shipped: press `F` on the select screen, pick the cabinet, play it with the
whole keyboard. That is not going back; it is the victory lap.

**And it fixes a real gap while it is there.** Free Play today awards **no cards at all** — the card
path is switched off by `!state.freePlay` guards in `js/main.js` (the reveal at ~1041, the
`cardPending` win gate at ~862). It is the game's one built-in replay surface and it pays nothing.
This gives it the reward it has never had, and the act scope falls out for free, because **the
cabinet you choose is the act.**

**One requirement that is not optional: the layer must announce itself once.** Free Play is a toggle
behind `F` on the select screen; a layer that lives only there could go unseen forever. At the
FULL KEYBOARD UNLOCKED milestone, the completion card carries one extra line telling the player a
new set of cards has opened and where to find them — once per save, latched exactly like the
eighth-key confession (`!getProgress().completed['15']`, read before this play is recorded). A
reward announcement at a celebration point, never a nag, never mid-flow (§6.4).

**Still recommended against, unchanged from the first draft:** do not hide act cards behind secrets
(§5.6). A counted `???` a child cannot reach is an obligation, not a delight; the hidden layer is
excellent *because* nothing counts it.

---

## 2. The problem

**What a player experiences today, concretely.**

A player finishes Level 15. Every letter key lights at once — the game's biggest milestone short of
the ending. Then Act 4 begins and nothing about the preceding fifteen cabinets is any different than
it was. The full keyboard, in practice, buys numbers.

She goes back to Breakout out of affection. Level 1 gives her `{j, f}` and no card — it never had
one. She toggles Free Play and plays Breakout with the whole keyboard, typing real sentences, which
is genuinely lovely — and receives nothing for it, because Free Play is excluded from the collection
by design.

Meanwhile the collection she is being invited to complete is shaped like this: Act 1 holds **4**
cards across five cabinets; Act 3 holds **22**, seven of them on Level 13 alone. And of the 59
level-attached cards, **7** are about the era of the room they were found in (§0.1). The 1979 arcade
— the game's own setting, its cover art, the thing the whole first act is *about* — has never been
the subject of a single card, because none of its vocabulary can be spelled early enough to qualify.

Three problems, one shape: **the game's best subject matter is locked out by an orthographic rule,
and its one replay surface pays nothing.**

---

## 3. Option space

The mechanism is now settled by Trevor's inversion. The live decisions are **the gate** and **the
surface**, so the option space is over those. Row A is retained because "do nothing" is always a
real option.

### 3.1 The gate

| # | Option | Reach | Cost to the player | Risk | Effort | Reversible? |
|---|---|---|---|---|---|---|
| **A** | **Do nothing.** One bank, one axis | every player | the three gaps in §2 persist | none | none | n/a |
| **G1** | **★ Flat gate at Level 15** — FULL KEYBOARD UNLOCKED *(recommended)* | everyone who finishes Act 3 | none | low | one constant + one milestone line | delete `ACT_CARDS` contents |
| **G2** | Flat gate at Level 25 | only players who finish | arrives when the game is over — a replay layer with nothing left to replay into | low | same | yes |
| **G3** | Per-card gate (a card unlocks when its own word is typeable) | varies per card | none | medium — two unlock concepts, and it gates nothing in practice because Free Play always grants the full keyboard | per-card closure machinery | yes |
| **G4** | Gate on the bonus-wing constant (`DOOR_UNLOCK_LEVEL = 25`) | as G2 | as G2 | low | none | yes |

**G1 wins.** Trevor's word was *"unlocked"*, which is L15's own milestone name (L25's is
*"mastered"*); a replay layer needs runway, and L15 leaves ten cabinets and three fully-unlocked
acts of it; and one flat number plus one content rule (letters + `; , . /`) is exceptionless and
testable, where G3 is per-card machinery buying a distinction Free Play erases anyway.

### 3.2 The surface — where an act card is typed

| # | Option | Reach | Cost to the player | Risk | Effort | Reversible? |
|---|---|---|---|---|---|---|
| **S1** | **★ Free Play, at a cabinet in that act** *(recommended)* | anyone who presses `F` | none | medium — the layer is invisible unless announced (mitigated, §6.4) | ~1.5 days | yes |
| **S2** | The curriculum level itself, after L15 | — | **impossible.** Level 1 still hands you `{j, f}` after L15; an Act 1 word can never be typed there | — | — | — |
| **S3** | Any level you happen to be playing, once the layer is open | every player | the act becomes a label on a card rather than a place — back to the relabelling the whole spec exists to avoid | low | ~1 day | yes |
| **S4** | Level 25 / the endgame only | finishers | every act card comes from one cabinet, which destroys *"drives replay to each set of games"* | low | ~1 day | yes |
| **S5** | A new dedicated room or a playable gallery | everyone | a whole new surface, new art, new navigation — the opposite of "kills the hardest part of the build" | high | ~1 week+ | costly |

**S1 wins, and S2's impossibility is the argument.** Trevor's two constraints intersect in exactly
one existing surface. S3 and S4 both survive the constraints and both destroy the point: S3 makes
the act a label, S4 makes it a single cabinet. S1 preserves *"replay behavior to each set of
games"* literally — to finish Act 1's shelf you play Act 1's cabinets.

---

## 4. Per-surface verdict

Different surfaces, different risk profiles; one blanket answer over them would be a failure.

### 4.1 Acts 1–5 (the curriculum) — ✅ BUILD, four cards each, Act 1 first

**Verdict: four act-exclusive cards per act, twenty total; Act 1 ships first; then Acts 2 and 3;
then Acts 4 and 5.**

**The phase order changed from the first draft because the gate changed it.** The draft shipped Act
1 then Act 5. Under the L15 gate, a player who has just unlocked the layer has Acts 1, 2 and 3
fully unlocked and Free-Playable, and **cannot reach Act 4 or Act 5's cabinets at all** — those
cards would be `???` on a shelf for another ten levels. So the immediately-playable acts go first.

Act 1 still leads, and the reasons are stronger under the new gate than the old one: it is the act
whose subject is the game's own setting, it is the act that measures **0/4** on era-match, and it is
the act with the fewest cards of the five. It is also the most emotionally correct place for this
layer to begin — the first room, re-read with a grown-up keyboard.

### 4.2 Levels 1–3 — ⏸️ OUT OF SCOPE, and the gap is named rather than hidden

**Verdict: not addressed by this feature, by design (§0.2).** The `jf` pattern-token card remains a
good, cheap, separate idea on the **level** axis. It is a ROADMAP follow-up (§8), not part of this
spec, and it is not a substitute for anything here.

### 4.3 The one-card levels (16, 19, 21, 22, 23) — ✅ AUTHOR MORE LEVEL CARDS, separately

**Verdict: a content gap on the existing axis.** A pool of one means `pickFromPool` returns the same
card on every later visit forever. Two more each restores the rotation the rest of the game has.
Ordinary historian work, no spec needed. Listed so it is not forgotten.

### 4.4 Free Play — ✅ THIS IS THE SURFACE, and it gains a reward it never had

**Verdict: extend Free Play with a card path, and nothing else about it changes.** WPM stays
displayed and never enforced (INV-37); no failure state is introduced; the session stays
completable at any pace. The card is guaranteed within the session exactly as it is in a curriculum
level, so it can never be missed (§6.3).

### 4.5 Act 6 · Act 7 · THE HARDWARE — ⏸️ / ✋ unchanged from the first draft

- **Act 6 (TEXT WORLDS) — defer.** It already has this loop: every riddle creature carries a
  rotating pool (`js/textworld/riddles.js`, `_ri` advances per open) and the IM-friend remembers
  you across launches. If it ever gets cards they attach on the **wing/world** axis.
- **Act 7 (THE SPEEDWAY) — defer, but note the blocker is gone.** `docs/specs/act7-speed-racing.md`
  §5.7 refused cards *solely* because they *"would inflate the '★ found / total' denominator."*
  Scoped denominators (now INV-96/INV-100) dissolve that. Speedway also already has a replay loop —
  the ghost car and the lap record.
- **THE HARDWARE — do not touch.** `WING_CARDS` + `(wing, station)` + paired machine/component
  cards is already ruled and already built. `ACT_CARDS` is a **third sibling** of it and
  `HISTORY_CARDS`, built the same way for the same reason, and must never merge with either.

### 4.6 The hidden layer (easter eggs) — ❌ DO NOT PUT ACT CARDS THERE

**Verdict unchanged, and the reason survives the inversion intact.** A `???` in the gallery is a
safe invitation because there is always a path — play that act's cabinet in Free Play. The moment a
**counted** card is reachable only by knowing a secret, the `???` becomes something the child can
see and cannot get, and the gallery stops being a tease and becomes a scoreboard of her ignorance.
That is completionist pressure, which `product.md` §1 forbids.

The one precedent pointing the other way should not be extended: the WarGames `joshua` card *is*
counted and *is* secret. One unreachable-by-play card in sixty is a curiosity; five — one per act —
would leave **every act shelf permanently incomplete** for a child who does not read a wiki.

**The real gap the orchestrator named is real and is a different feature.** `easter-eggs.md` records
it: *"the moth is mouse-only, which sits oddly in a keyboard-first game."* A keyboard-reachable
discovery egg is worth building — as an **uncounted egg**, in that layer, with its own proposal.

### 4.7 The slot picker's `★` counter — ⚠️ LEAVE IT

The picker renders `'★ ' + slot.cardsFound` with **no denominator** (`js/ui/screens.js:108`,
`js/slots.js:291`), so it cannot regress — the number only grows. The docs describe it as
`★ 14 / 60`; the code does not. Unchanged here.

---

## 5. Design

### 5.0 Where it slots in

Four files, one new array, no new module, no new screen, no new key, **no save-schema change**.

| File | Change |
|---|---|
| `js/history-cards.js` | new exported `ACT_CARDS` + `cardsForAct(act)` + `pickGuaranteedActCard(act, collected, rot)` (delegating to the existing `pickFromPool`) + `actCardIds()` for scoped counting |
| `js/main.js` | in a Free Play session, choose and inject the act card beside the existing card block (~1402/1414); extend the `cardPending` gate (~862) and the reveal (~1041) to the Free Play case; the one-time L15 announcement (~1019, beside the eighth-key confession) |
| `js/ui/screens.js` | `renderCollectionScreen` grows per-act shelves below the existing grid |
| `js/freeplay.js` | unchanged — the act card is injected by the engine, exactly as a curriculum card is |

### 5.1 The data shape — a third sibling, not a third system

```js
// js/history-cards.js — a THIRD bank, parallel to HISTORY_CARDS and WING_CARDS,
// separate for exactly the reason WING_CARDS is separate (INV-96): TOTAL_CARDS is
// a number the player has already earned, and it may never move under a save.
export const ACT_CARDS = [
  { id: 'attract-mode', act: 1, word: 'attract', title: '…', year: '…', fact: '…' },
  …
];
```

`act` is an integer 1–5 matching `ACTS[].num` in `js/ui/cabinet-art.js`. There is **no `level`
field**, so `cardsForLevel()` — which filters `c.level === level` over `HISTORY_CARDS` only —
cannot return one, by two independent mechanisms. **INV-56 is neither applied to act cards nor
amended for them**; INV-57's generalized form ("no card without a numeric level enters a level
pool") already covers them.

`word` is a real, typed moment word, subject to the L15 closure rule in §5.2, and must be unique
across all three banks so no typed pattern can ever glint against two cards (INV-122).

### 5.2 The gate and the content rule

**The layer is available to a save once Level 15 is recorded complete** (`getProgress().completed['15']`),
with the WOPR/`selectBypass` escape hatch making it available as it does everything else. Before
that: `pickGuaranteedActCard` is never called, no act card is injected, revealed or counted, and no
act shelf renders.

**Every act card's word must be typeable with Level 15's cumulative key closure** — lowercase
letters `a–z` plus `;` `,` `.` `/`. No digits, no capitals, no space, no hyphen, no apostrophe, no
backtick. Derived by the same closure construction as INV-20/INV-56, never a hardcoded character
list (INV-123). This is what makes one flat gate exceptionless.

### 5.3 The loop — a Free Play session at a cabinet in that act

Free Play keeps `state.level` (the chosen cabinet) and swaps in a full-keyboard level object
(`buildFreePlayLevel`, `js/main.js` ~296). The act follows from the cabinet:
`act = ACTS.find(a => a.levels.includes(state.level)).num`.

At session start, in the same block that resolves `state.currentCard`:

```
state.actCard = (state.freePlay && actLayerUnlocked())
  ? pickGuaranteedActCard(actOf(state.level), Slots.collectedIds(),
                          Slots.getCardRotation('act:' + actOf(state.level)))
  : null
```

and, when non-null, its word is spliced into `state.patterns` exactly as a curriculum card word is —
early enough to precede the earliest possible win — with the **Free Play win gate extended to wait
for it**, the direct analogue of `cardPending`. Typing it glints gold mid-play through the existing
`patternMatchesCard` path; the card is revealed on the FREE PLAY COMPLETE overlay in the existing
`#history-card` element; award is `Slots.collectCardId(card.id)` (idempotent, drives the NEW! tag)
plus `Slots.bumpCardRotation('act:' + act)`.

**Four properties fall out, each deliberate:**

1. **The curriculum path is untouched.** Every `!state.freePlay` guard that exists today still
   guards the same thing. A curriculum level behaves byte-identically.
2. **Exactly one card per session survives.** A Free Play session awards at most one card, from one
   bank; there is no second slot and no blending (INV-126).
3. **Rotation reuses the existing string-keyed map.** `"act:1"` cannot collide with a level key
   (`"13"`) or a station key (`"hw:apple-iie"`) — the property INV-98 already blesses, and the
   reason this is a zero-migration change.
4. **Acts 4 and 5 come online by themselves.** Free Play can only be started at an **unlocked**
   cabinet (`isLevelLocked` already prevents the cursor landing on a dark one), so Act 4's and Act
   5's shelves fill as the player earns those cabinets — the existing grammar, no new rule.

### 5.4 The denominator — the hard constraint, and exactly how it holds

**`HISTORY_CARDS` is not touched, so nothing a player has ever seen can shrink.**

| Surface | Today | After |
|---|---|---|
| Slot picker | `★ 14` (no denominator) | **unchanged** |
| Gallery header | `★ 14 / 60` over `allCards()` | **unchanged** — still `HISTORY_CARDS` only |
| Level-complete, level card | `CARD 14 OF 60`, bank-scoped per INV-100 | **unchanged** |
| Free Play complete, act card | *(no card at all today)* | `ACT 1 CARD 2 OF 4` |
| Gallery, act shelves | *(did not exist)* | `ACT 1 · THE ARCADE   ◆ 2 / 4` |

Three glyphs, three scopes, and **no blended number is ever printed**: `★` sums to
`HISTORY_CARDS.length`, `◆` to `ACT_CARDS.length`, `▣` is the wing's. A save that has not completed
Level 15 renders an identical UI to one built with `ACT_CARDS` emptied — INV-120, which is also the
revert plan.

**An act's shelf appears once the layer is unlocked AND at least one cabinet in that act is
unlocked**, so a player is never shown four `???` at a wall she cannot reach yet — the same rule
`hardware-wing.md` §5.4.4 adopted for the same reason.

*(The `CARD 63 OF 60` defect the first draft found — `Slots.collectedCount()` counting across all
banks while the overlay printed it against `TOTAL_CARDS` — is **fixed and landed as INV-100**. This
spec depends on that fix and adds no new counting path of its own.)*

### 5.5 How many, and what they are ABOUT

**Four per act, uniform, twenty total.** Uniformity is a feature: every shelf reads `◆ n / 4`, the
same size everywhere, small enough to finish in an afternoon of Free Play and small enough to be a
real research ask.

**Each act's theme is the ERA OF ITS OWN ROOM — the thing the level axis measurably cannot do
(7/59).** Each is distinct from the level bank's existing themes (people and inventions; 1970s–80s
phreak/hacker culture; the edutainment lineage). ⚠️ Every candidate word below must satisfy §5.2's
closure rule — letters plus `; , . /` only.

| Act | Room / era | **Theme** | Candidate subjects | Grounding today |
|---|---|---|---|---|
| **1** | THE ARCADE, 1976–82 | **The machine and the room — not the games.** The things a child standing in a 1979 arcade could touch | the quarter and the coin door · the marquee · attract mode (why a cabinet plays by itself when nobody is there) · three-letter high-score initials (why only three) · the curved glass of a CRT · the plywood-and-laminate cabinet body | `wiki/tech/arcade-control-panels.md` (partial), `research/arcade-cabinets-by-era.md` — **mostly needs a pass** |
| **2** | THE COMPUTER WING, 1981–86 | **How software got into a home machine before you could buy it in a shop** | type-in program listings in magazines · loading from cassette tape · the user group · the BASIC prompt · the arcade port that came home | `wiki/tech/commodore-64.md` ✓, `nes-hardware.md` ✓ — type-ins and user groups **need a pass** |
| **3** | THE BASEMENT, 1991–96 | **How a game travelled in the 90s, hand to hand** | shareware and the free first episode · the magazine cover disc · the demoscene · the LAN party | `wiki/culture/bbs-door-games.md` ✓, `warez-scene.md` ✓, `wiki/tech/sixteen-bit-era.md` ✓ |
| **4** | THE COMMAND CENTER, 1993–2000 | **The network becoming the internet** | the domain name · the search engine · view-source · the hyperlink · the handle you picked for yourself | `wiki/tech/world-wide-web.md` ✓, `wiki/culture/view-source-culture.md` ✓, `ipv4.md` ✓, `localhost.md` ✓ — **best-covered act** |
| **5** | FULL CIRCLE, 1980–now | **The keys themselves, and where writing came from** | Shift, which once physically shifted the carriage · Return, which once returned one · the cursor · Backspace and the correcting ribbon · the word processor | `wiki/tech/qwerty-keyboard.md` ✓, `wiki/culture/the-eighth-key.md` ✓ — the rest **need a pass** |

⚠️ **Collision guard: the RF modulator, the floppy/Disk II, the CD-ROM, the sound card and the
null-modem cable belong to THE HARDWARE wing** (`hardware-wing.md` §0.3). Acts 2 and 3 take the
*software-and-culture* side of their eras precisely so the two banks never tell the same story
twice.

**I am not writing these cards.** Every one is a historical claim on a card a child reads, so every
one goes to the **`arcade-historian`** agent (CLAUDE.md: *"Never write research prose from model
memory"*; journal F7, F29). A subject that cannot be sourced is **dropped, never invented** — a
shelf of three is fine.

**Reading level — a constraint the gate retired.** The first draft required Act 1's cards to be
≤ 120 characters because a beginner would read them at Level 1. Under the L15 gate **nobody reads an
act card before completing Act 3**, so all twenty may use the existing bank's norm (measured:
105–211 characters, median 163). One more cost the inversion removed.

### 5.6 The announcement — once, at the milestone, never a nag

At the FULL KEYBOARD UNLOCKED completion (Level 15), the completion card carries one extra line
naming the new layer and where it lives. Once per save, latched off `!getProgress().completed['15']`
read **before** this play is recorded — the exact pattern the eighth-key confession already uses
(`js/main.js` ~1019), so no storage field is added and a replay never re-fires it.

It arrives **at a celebration, not during play** (`product.md` §2: big moments at natural pause
points), it is a reward announcement rather than a task, and missing it costs nothing — the gallery
shelves are there regardless.

---

## 6. Safety & privacy

**`/security-review` is NOT required for this change as specced.** The chain it inherits, and why
nothing new is introduced:

- **No free-text input.** Act card content is fixed literal data committed in `js/history-cards.js`,
  authored by the historian, reviewed in the diff. It never passes through a user, a model, or the
  network.
- **No new DOM sink.** The reveal reuses `#history-card`'s existing elements via `textContent`
  (security.md rules 1–2: *"`innerHTML` is for fixed data only"*). Gallery cells are already built
  with `createElement` + `textContent` and stay that way.
- **No storage-schema change.** `Slots.collectCardId` stores an id in the existing per-slot `cards`
  array; `bumpCardRotation('act:1')` writes into the existing string-keyed `cardRotation` map, which
  `normalizeSlot` already accepts as any object (rule 4 — localStorage is untrusted and normalized
  field-by-field; unchanged).
- **The pattern-stream boundary is unchanged** (rule 3). An act card's word is fixed literal data
  tokenized by the existing `wordToTokens`, exactly as every curriculum card word is. No free text
  reaches the engine.
- **No LLM surface, no network call** (rule 6). Act cards behave identically on the published static
  host; nothing here depends on `/api/*`.
- **PII floor untouched** (rule 8). Act cards store card **ids** — gameplay data.

**What WOULD trigger a review**, written down before someone reaches for it: any new input path
(e.g. a select-screen pickup target), or any act-card text becoming generated rather than authored.

**Content rating.** `product.md` §Content Rating binds: Acts 1–5 are core curriculum and stay
early-reader in tone. Act 3's shareware/warez subject uses the bank's existing **"curiosity, not
crime"** editorial move — and the legal half of that story (shareware, the free first episode, the
cover disc, the demoscene) is both the safer and the better one. Every act-card `word` and `fact` is
checked against `js/word-blocklist.json`'s floor (exact word plus generated inflections, rule 7).
The floor is never lowered by anything here.

---

## 7. Non-goals

This spec explicitly does **not**:

1. **Change `HISTORY_CARDS`, `TOTAL_CARDS`, INV-21, INV-56, or the earliest-typeable rule.** Not one
   existing card moves; no existing number changes.
2. **Award a non-typed card.** Superseded by §0. Every act card is typed, glinted and revealed
   exactly like a curriculum card.
3. **Award anything for replaying a curriculum level** (the discarded already-won latch).
4. **Touch Levels 1–3, the Word Bank Principle, or any curriculum level's pattern stream, win gate
   or key set.**
5. **Add a second guaranteed card to any session.** Exactly one card per session, from one bank.
6. **Build a select-screen pickup, a glinting object, or any new navigation target.**
7. **Hide any counted card behind a secret** (§4.6).
8. **Add cards to Act 6, Act 7, or THE HARDWARE wing** (§4.5).
9. **Change the slot picker, or introduce any blended denominator.**
10. **Write any card fact.** That is the historian's, not the builder's and not mine.
11. **Change anything else about Free Play** — WPM stays displayed and never enforced; no failure
    state is introduced; a session remains completable at any pace.

---

## 8. Risks & residual risk

| Risk | Severity | Mitigation | Residual |
|---|---|---|---|
| **The layer is never found, because Free Play is a toggle behind `F`** | **high — the main risk now** | the one-time announcement at the FULL KEYBOARD UNLOCKED milestone (§5.6); the act shelves in the gallery, which a player already visits | real — a playtest must confirm a player who has not read this doc finds it |
| Beginners at Levels 1–3 still get nothing | medium | named honestly (§0.2), not hidden; the `jf` pattern card is a separate ROADMAP item | accepted, by Trevor's ruling |
| A reward at L15 arrives while five acts of cards are still `???` | low | shelves appear only for acts with an unlocked cabinet (§5.4); the rest arrive as the cabinets do | small |
| The historian cannot source four era-matched subjects for Act 1 under the letters-only rule | medium | Act 1's objects are the best-documented in arcade history; an unsourceable subject is **dropped, never invented** (F29) | accepted |
| Act 3's theme drifts toward "how to pirate" | medium | "curiosity, not crime"; shareware/cover-disc/demoscene is the legal and better half | open question §10.4 |
| Free Play's win gate gains a new pending condition and could hang a session | **high if wrong** | the gate is the direct analogue of `cardPending`, whose word is injected before the earliest possible win; the engine refills its pool infinitely, so the gate is structurally reachable | must be proven by a real won session, not a unit test (INV-125) |
| "phase" turns out to mean a scope this spec does not model | low | flagged as open question §10.3 rather than guessed | open |

**Follow-ups this spec does not own** (for `docs/ROADMAP.md`): the `jf` / L2 / L3 pattern-token
level cards (§4.2); more level cards for L16, L19, L21, L22, L23 (§4.3); a keyboard-reachable
**uncounted** easter egg (§4.6); act/wing cards for Act 6 and Act 7 once someone specs their axes.

---

## 9. Phased rollout

Each phase is independently shippable and independently revertible. Every phase ends with a real
play, twice, per `.claude/rules/playtest.md` — and note that **this feature is invisible on a save
that has not completed Level 15**, so a playtest must seed or earn that state deliberately or it
will verify nothing.

**Phase 1 — mechanism + ACT 1 (4 cards) + the announcement.** `ACT_CARDS`, `cardsForAct`,
`pickGuaranteedActCard`, the L15 gate, the Free Play injection + win gate + reveal, the gallery
shelf, the milestone line. Historian pass for Act 1's four subjects **first** — the mechanism may be
built against placeholder ids, but **no placeholder card text ever reaches a build a child could
open.**
*Playtest gate:* complete Level 15 and read the announcement; toggle Free Play on a Level 1 cabinet
and win the session (the word is typed, glints, and the card reveals `ACT 1 CARD 1 OF 4`); do it
three more times to collect the shelf; open the gallery and look; then a `--fresh` save and confirm
a player below Level 15 sees nothing new anywhere.

**Phase 2 — ACTS 2 and 3 (8 cards).** Content only, zero mechanism change. These are the acts a
freshly-gated player can actually reach.

**Phase 3 — ACTS 4 and 5 (8 cards).** Content only; their shelves light as those cabinets unlock.

---

## 10. Acceptance criteria — candidate invariants

Written so `test-engineer` can implement them directly. **Claiming INV-120..127**, per the
orchestrator's re-base. Each cites its design source (`.claude/rules/testing.md`).

- **INV-120** (L1) **Act cards are invisible to a save that has not unlocked the layer, and no
  existing number moves.** With `ACT_CARDS` populated, a save that has not completed Level 15
  renders an identical slot-picker counter, gallery header, gallery grid and level-complete
  denominator to the same save with `ACT_CARDS` emptied; no act shelf is rendered; and
  `TOTAL_CARDS === HISTORY_CARDS.length` still holds. *(product.md §1 — a child never leaves a
  session feeling less capable; INV-96/INV-100, the law that keeps `WING_CARDS` separate; §5.4.)*
- **INV-121** (L1/L2) **The act-card layer unlocks at the FULL KEYBOARD UNLOCKED milestone.** No act
  card can be picked, injected, revealed or counted, and no act shelf renders, until the save has
  recorded Level 15 complete (the `selectBypass`/WOPR hatch excepted, as for every other gate). The
  unlock level is a single declared constant, not a scatter of literals, and an act's shelf appears
  only when that act has at least one unlocked cabinet. *(Trevor, 2026-09-14: *"after the entire
  keyboard is unlocked"*; `.claude/rules/levels.md` §Milestones — Level 15 finish, *"FULL KEYBOARD
  UNLOCKED"*; §5.2.)*
- **INV-122** (L1) **A card belongs to exactly one bank; ids and words are globally unique.** No id
  appears in more than one of `HISTORY_CARDS` / `ACT_CARDS` / `WING_CARDS`; no `word` appears in more
  than one (case-insensitively, after token normalization); every `ACT_CARDS` entry has an integer
  `act` matching an `ACTS[].num`, has **no** `level`, `secret`, `wing` or `station` field, and
  carries non-empty `word`/`title`/`year`/`fact`. *(generalizes INV-97; `Slots.collectCardId` stores
  ids in ONE per-slot set and `cardById` searches multiple arrays, so a duplicate id is silent data
  corruption, and a duplicate word would glint ambiguously.)*
- **INV-123** (L1) **Every act card's word is typeable at the gate.** For every card in `ACT_CARDS`,
  every token of `wordToTokens(card.word)` lies within the cumulative unlocked-key closure at Level
  15 — lowercase letters plus `;` `,` `.` `/` — derived by the same closure construction as
  INV-20/INV-56 (an uppercase letter would require Shift at L24; a space would require Space at
  L25; a hyphen L21; an apostrophe L23), never a hardcoded character list. This is what makes one
  flat gate exceptionless. *(§5.2; the same closure machinery INV-56 already owns.)*
- **INV-124** (L1) **No act card can reach a curriculum level.** `cardsForLevel(level)` returns no
  `ACT_CARDS` entry for any level 1–25; no act card's word is injected into a non-Free-Play session;
  and `state.currentCard`, `cardPending`, the mid-play glint and the level-complete reveal behave
  byte-identically in every curriculum level to their behaviour with `ACT_CARDS` removed. INV-56 is
  neither applied to nor amended for act cards. *(INV-57 generalized — "no card without a numeric
  level enters a level pool"; §5.1, §5.3.)*
- **INV-125** (L2) **Free Play is the surface, and Free Play's One Rule floor holds.** When the
  layer is unlocked, a Free Play session at a cabinet in act *N* injects exactly one act card word
  from act *N*'s pool, the session cannot end before that word has appeared (the Free Play analogue
  of INV-22), typing it awards the card, and **the session is still winnable at every EXPERIENCE
  tier and at every word-length setting** — proven by an actually-won session, never by reading the
  code. No failure state, timer, life or score is introduced; WPM remains displayed and never
  enforced (INV-37); the wrong-keypress contract is the engine's own and is unchanged. *(CLAUDE.md
  §The One Rule; product.md §Free Play; §5.3 — a gate that can hang a session is the highest-severity
  risk in §8.)*
- **INV-126** (L1) **Exactly one card per session, deterministically rotated, on a namespaced key.**
  A Free Play session awards at most one NEW card and displays at most one card.
  `pickGuaranteedActCard` delegates to the same `pickFromPool` as `pickGuaranteedCard`, so it returns
  exactly one card for a non-empty act pool and `null` for an empty one, prefers an id not in
  `collectedIds`, and cycles deterministically with the rotation counter (no `Math.random`) — a
  four-card act is fully collectable across four sessions at that act's cabinets. The counter is
  stored under `"act:<n>"` in the existing `cardRotation` map, cannot collide with a level key
  (`"13"`) or a station key (`"hw:<id>"`), survives `normalizeSlot` unchanged, and a pre-feature
  save loads with no migration, no version bump and no data loss; a corrupt or hostile value
  degrades to rotation 0 without throwing. *(INV-22/INV-58 preserved verbatim — two copies of a
  guarantee is how guarantees rot; INV-98, the same zero-schema property on a third axis;
  security.md rule 4.)*
- **INV-127** (L1) **Act-card content honours the safety floor.** Every act card's `word` and `fact`
  passes `js/word-blocklist.json`'s floor (exact word plus generated inflections, per security.md
  rule 7); no act card lowers, bypasses or re-implements that floor; and every `fact` is within the
  existing bank's length norm (≤ 211 characters, the measured maximum today). *(product.md §Content
  Rating — *"a wing may never lower it"*; §5.5–5.6.)*

---

## 11. Open questions for Trevor

1. **Level 15 or Level 25?** I chose **15** (§1, §3.1): your word was *"unlocked"*, which is L15's
   own milestone name — L25's is *"mastered"* — and a replay layer needs game left to live in. If
   you meant the literal last key (Space and Backspace at L25), say so and only the gate constant
   changes.
2. **Is Free Play the right home?** It is the only place in the game where an Act 1 cabinet and a
   complete keyboard coexist (§3.2), and it currently pays nothing for replaying it. But it is a
   toggle behind `F`, which is why the milestone announcement is not optional — **and it is the
   biggest remaining risk in the spec** (§8). Are you happy for the act-card layer to be the reason
   a player learns Free Play exists?
3. **"act/wing/phase" — what is a PHASE?** You named three scopes. Wings already have their own bank
   (`WING_CARDS`, the `(wing, station)` axis). *"Phase"* has at least three readings and I am not
   guessing: (a) a synonym for act; (b) the five-act arcs as distinct from the bonus wings; (c)
   something else entirely — a stage of the curriculum, or of a wing. **Working assumption until you
   say otherwise: act = the five curriculum acts, wing = the bonus wings (already served), phase =
   a synonym for act.** If phase is a real third scope it is a fourth bank and its own spec.
4. **Act 3's theme touches shareware, cover discs and the warez scene.** The legal half (shareware,
   the free first episode, the demoscene) is both the better story and the safer one under
   §Content Rating. Do you want the warez/BBS-distribution half in a core curriculum act at all, or
   does it belong to the Server Room arc?
5. **Four cards per act, or more?** Four is uniform and finishable in an afternoon of Free Play.
   Act 1 is the thinnest act in the game and could carry six. *(My call if you don't want to make
   it: four everywhere, grow Act 1 if a playtest says its shelf empties too fast.)*
6. **Act 6 and Act 7 get no cards in this change** (§4.5). Both already have replay loops (riddle
   rotation; the ghost car). Agreed, or do you want them carded too?
7. **The Levels 1–3 gap is now unaddressed** (§0.2). The separate `jf` pattern-token card — a card
   whose moment word is a *pattern*, not a word, so it does not break the Word Bank Principle — would
   put a card at Level 1 for the first time. Worth a ROADMAP item?

---

*Related: `docs/specs/hardware-wing.md` §0.3/§0.4/§5.4 (the sibling bank, and the argument this spec
reuses) · `docs/specs/act7-speed-racing.md` §5.7 (the denominator objection this dissolves) ·
`docs/testing/STRATEGY.md` §5 (INV-20/21/22/37/56/57/58, INV-94..100) · `.claude/rules/product.md`
§History Cards, §Free Play, §Word Bank Principle, §Content Rating · `.claude/rules/levels.md`
§Milestones (Level 15 — FULL KEYBOARD UNLOCKED) · `.claude/rules/easter-eggs.md` (the uncounted
layer, and its open keyboard-reachability question) · `.claude/rules/security.md` rules 1/2/3/4/7/8 ·
`.claude/rules/playtest.md` §The Second Run · `js/history-cards.js` · `js/freeplay.js` ·
`js/slots.js` · `js/main.js` · `js/ui/screens.js`.*
