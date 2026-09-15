# THE ROOM'S OWN CARDS — act-exclusive collection, and the reward Levels 1–3 have never had


> **⚠️ INV NUMBERS RE-BASED 2026-09-14.** This spec proposed `INV-100…` while it was being
> written; `docs/testing/STRATEGY.md` landed INV-94..99 in the meantime and a sibling spec
> claimed the same block, so two unbuilt specs were proposing different meanings for the same
> numbers. Candidates here are now **INV-120..127**, a reserved block. The rule that prevents a
> third collision: **STRATEGY.md §5 is the only authority for a LANDED number, and an unbuilt
> spec reserves a block far above it rather than taking the next free integer** — because
> "next free" is a race between every spec in flight.


## Product spec / ADR — a second, act-scoped card bank on the existing collection loop

*Written 2026-09-14 by the `product-manager` lane. Inputs: Trevor's direction (below), the live
code (`js/history-cards.js`, `js/slots.js`, `js/main.js`, `js/ui/screens.js`, `js/ui/cabinet-art.js`),
`docs/specs/hardware-wing.md` §0.3/§0.4/§5.4 (the wing card model Trevor is responding to),
`docs/testing/STRATEGY.md` §5 (INV-20/21/22/56/57/58, and the freshly-landed INV-94..99),
`.claude/rules/easter-eggs.md` (the hidden layer and its design rules),
`.claude/rules/product.md` §History Cards + §Word Bank Principle. Every distribution number below
was **measured from the bank, not recalled** — the commands are quoted so they can be re-run.*

**Trevor's direction, verbatim:**

> *"I like the idea there are exclusive cards in each act/wing to collect. This drives replay
> behavior to each set of games instead of just to the game in general. Love that"*
>
> *"Let's also run some to add act exclusive cards to uncover and discover in the other acts that
> would encourage additional play behind a single play."*

---

## 1. Recommendation

**Build it — and build it as a second, act-scoped card bank that is awarded for REPLAYING a level
you have already won, never for typing a word.** That one constraint is what makes this more than
a relabelling, and it is the whole design. I was asked to be sceptical about whether an "act axis"
merely renames the level axis, and for most of what an act card could be, it does. But three
measurements say there is a real, structural hole underneath the request, and an act-scoped bank
is the only thing shaped to fill it:

- **Levels 1, 2 and 3 hold zero cards and always will.** A card is discovered by typing its word;
  J F D K S L has no vowel; the Word Bank Principle says those levels are deliberately wordless.
  So the collect-them-all loop Trevor loves **does not exist for a brand-new player until their
  fourth cabinet** — at exactly the three cabinets a five-year-old will replay more than any other.
- **The reward is inverted relative to where a beginner spends time.** Act 1 has **4** cards across
  five levels; Act 3 has **22**. The fluent player is swimming; the beginner is dry.
- **The card bank is era-scrambled relative to its own rooms, by construction. Only 7 of 59
  level-attached cards fall inside their act's era — Act 1 scores 0/4 and Act 3 scores 0/22.**
  The 1979 arcade holds no card about arcades; the 1991–96 basement holds cards dated 1947, 1966,
  1969, 1976 and 1977. This is not an authoring failure, it is what INV-56 *does*: it distributes
  cards by **spelling**, not by subject or era. `phrack` (a 1985 hacker zine) sits on the Myst
  cabinet because its letters happen to close at Level 13.

An act-scoped card is not bound by INV-56, so it can be **about the room it is found in** and can
be awarded **where no word can be spelled**. Those are two things the level axis structurally
cannot do, and together they are the feature.

**The mechanism, in one sentence:** when you win a level *you have already won before*, and that
level's own card pool holds nothing new for this save, the level-complete overlay hands you one
of that **act's** exclusive cards instead of the duplicate it hands you today.

That sentence is doing four jobs at once, and each one is deliberate:
- It is **literally "beyond a single play"** — the trigger is the replay itself.
- It **costs nothing from the one-guaranteed-card-per-play budget.** Today, replaying an exhausted
  level pays you a card you already own. This replaces a wasted reward with a new one. The number
  of NEW cards per play stays exactly ≤ 1 and INV-22/INV-58 are untouched.
- It **needs no typed word**, so Levels 1–3 become the *fastest* door into Act 1's set. The second
  play of Breakout pays a card. That single consequence justifies the feature.
- It **needs no save-schema change at all** — the "have I won this before" latch is
  `getProgress().completed[level]` read at level start, and rotation reuses the existing
  string-keyed `cardRotation` map under `"act:1"` (the same zero-migration trick INV-98 blesses).

**Do this first, and separately: also commission the three or four cards the level axis is simply
missing.** Levels 1–3 and the five one-card levels (16, 19, 21, 22, 23) are content gaps, not
architecture gaps, and §4 gives them their own verdict. A Level 1 card whose moment word is the
*pattern* `jf` — the two little raised bumps your index fingers are resting on right now — is true,
era-perfect, costs no new mechanism, and does not smuggle a word into a wordless level. It is
worth doing on its own merits, and it does **not** substitute for this spec: one card is a card,
not a loop.

**What I recommend against**, plainly, because it is the most tempting reading of "uncover and
discover": **do not make act cards hidden.** A card that is counted on a shelf and hidden behind a
secret is not a delight, it is an obligation — the child can see a `???` she has no way to reach.
The hidden layer (`easter-eggs.md`) is excellent *because* nothing counts it. Keep counted cards
findable by playing, and keep secrets uncounted. §4 argues this at length and names the real,
separate gap the orchestrator correctly identified (there is no **keyboard-reachable** discovery
egg — the moth is mouse-only) as a follow-on egg proposal, not as this feature.

---

## 2. The problem

**What a player experiences today, concretely.**

A five-year-old opens Level 1. She types `j`, `f`, `jf`, `fj`. She wins. The overlay says LEVEL
COMPLETE and shows her time, accuracy, streak and keys. There is no card. She plays it again,
because it is the cabinet she can actually do. There is no card. She plays it eleven more times
across a fortnight. There is never a card. She has watched her dad get cards; the slot picker
shows a `★` next to his game and nothing next to hers.

At Level 4 she finally gets one (`ada`, 1843). At Level 5 another (`hal`, 1968). Then Act 1 is out
of cards forever: it holds four, and two of them are about a countess and a film.

Meanwhile a fluent player at Level 13 has **seven** cards waiting on one cabinet, and Level 13
alone holds more cards than the entire first act.

And a third thing, quieter but structural: **the arcade the game is set in is the one subject the
cards never cover.** There is no card about the coin slot, the marquee, attract mode, or why a high
score only gets three letters — because none of those words can be spelled early, and by the time
they can, the cabinets are somewhere else.

Three sentences, three measurements:

```
$ node -e "import('./js/history-cards.js').then(m=>{…})"
cards per level  L1..L25:  0 0 0 2 2 | 3 2 6 4 2 | 5 6 7 2 2 | 1 2 2 1 3 | 1 1 1 2 2
cards per act:            Act 1 = 4 · Act 2 = 17 · Act 3 = 22 · Act 4 = 9 · Act 5 = 7
card year inside its act's era:  Act1 0/4 · Act2 3/17 · Act3 0/22 · Act4 2/9 · Act5 2/7  (7/59 overall)
```

---

## 3. Option space

Every real alternative, including doing nothing. "Effort" is builder-days for the mechanism only;
card content is a separate `arcade-historian` cost in every row that needs it.

| # | Option | Reach | Cost to the player | Risk | Effort | Reversible? |
|---|---|---|---|---|---|---|
| **A** | **Do nothing.** Keep one bank, one axis | every player | the three gaps above persist | none | none | n/a |
| **B** | **Author more LEVEL cards** into the thin levels (16/19/21/22/23) and pattern-token cards into 1–3 | every player | none | low — but the era-scramble stays, and L1's `{j,f}` ceiling caps it at ~1 card | 0 mechanism + historian | trivially |
| **C** | **Per-act SHELVES in the gallery over the existing 60** — no new cards, just scoped counters | anyone who opens the gallery | none | none | ~0.5 day | trivially |
| **D** | **★ ACT-EXCLUSIVE BANK, awarded on a replay win** *(recommended)* | anyone who replays any level | none | low — additive array, no schema change | ~1.5 days + historian | delete the array contents → byte-identical |
| **E** | Act bank, awarded in a **second** guaranteed card slot (two cards per play) | every player | dilutes "picked up off the arcade floor"; doubles global collection rate; touches the win gate | **high** — INV-22/58 are the invariants every winability proof rests on | ~3 days | hard |
| **F** | Act bank, awarded only once a level's **own** pool is exhausted, **typed** like a normal card | mid/late players | Act 1's ceiling is A S D F G H J K L ; — the act that needs it most gets the worst vocabulary | medium — re-imports the exact orthography-over-subject defect it exists to fix | ~2 days + hard historian | yes |
| **G** | Act bank as **hidden secrets** (magic word / a glinting object per act) | only the curious | a counted `???` with no path is an obligation; the moth precedent is mouse-only | medium | ~2 days | yes |
| **H** | Act bank collected from a **glinting object on the act's row of the select screen** | anyone who looks | none | medium — `navigateWithinAct` walks `act.levels` by level number; a non-level focus target is a real refactor | ~3 days | yes |
| **I** | **Act CAPSTONE**: one card per act, awarded for collecting that act's whole level pool | completionists | genuine completionist pressure; 5 cards total; unreachable in Act 3 (22 cards) for most children | medium | ~1 day | yes |

**Reading of the table.** **A** leaves a measured hole. **B** and **C** are both real wins that cost
almost nothing and should ship regardless — but neither creates a *loop*: B adds a handful of
one-shot cards, C adds no cards at all. **E** is the obvious reading of "more cards" and is the one
to refuse: the exactly-one-guaranteed-card-per-play property is load-bearing for the win gate and
for the feeling that a card is special. **F** is the obvious reading of "act cards" and quietly
re-imports the defect (Act 1's whole vocabulary would be home-row words). **G** is the obvious
reading of "uncover and discover" and is the one that can actually hurt a child. **H** is the best
*version* of discovery and is the right Phase 3 if Trevor wants it — but it is twice the cost for a
smaller effect than D. **I** is charming and is the only option that can create pressure.

**D wins because it is the only option that is simultaneously: a loop, not a one-shot; free of the
per-play budget; free of the orthography ceiling; free of any schema change; and invisible to a
player who never replays anything.**

---

## 4. Per-surface verdict

These surfaces have genuinely different risk profiles. One blanket answer over them would be a
failure, so each gets its own.

### 4.1 Acts 1–5 (the curriculum) — ✅ BUILD, and Act 1 first

**Verdict: yes, four act-exclusive cards per act, twenty in total, Act 1 shipping first.**

*Was asked to argue Act-1-first both ways.* **Against:** Act 5 is the thinnest per-level (L21, L22,
L23 hold exactly one card each, so a single visit exhausts each of them and a returning player at
the end of the game gets nothing new at three consecutive cabinets); a player who has reached Act 5
has demonstrated they care about the collection, so the reward lands on a proven audience; and Act
5's subject (the keys themselves) is the best-researched of the five. **For:** Act 1 is not thin,
it is **absent** — there is a difference between a loop that runs out and a loop that has never
started, and only one of those can teach a child that cards exist at all. Act 1 is the
habit-forming act; it is where a beginner's play hours actually go; its act cards would arrive on
the **second** play of the **first** cabinet, which is the earliest any reward in this game can
possibly land; and it is the act whose subject is the game's own setting, which is the single most
on-theme body of content the card bank has never touched. **Act 1 first.** Act 5 second, for the
reasons above, which are real.

### 4.2 Levels 1–3 specifically — ✅ BUILD, and ALSO commission one pattern-token card each

**Verdict: two independent things, and they must not be confused with each other.**

The act bank is the *loop* at Levels 1–3, and it works there precisely because it needs no word.

Separately, and cheaply: **a card whose moment word is a PATTERN is not a violation of the Word
Bank Principle.** Level 1's own documented content is *"j, f, jf, fj — rhythm and repetition only"*;
a card attached to the token `jf` asks the child to type exactly what Level 1 already asks her to
type. The precedent is already in the bank — `\o/`, `386`, `56k`, `1969` and `1970` are all card
words that are not words. The obvious subject is **the two raised bumps on F and J**, which is
true, tactile, era-appropriate, and is literally under her fingers at that moment.

**But do not force it.** Commission the historian to *attempt* one pattern-token card for each of
L1 / L2 / L3 and accept that only L1 may be findable — a source's silence is not a licence to
invent (journal F29). A single card per level is a card, not a loop; it does not replace §4.1.

### 4.3 The one-card levels (16, 19, 21, 22, 23) — ✅ AUTHOR MORE LEVEL CARDS

**Verdict: a content gap, not an architecture gap. Fix it with level cards.** A pool of one means
`pickFromPool` hands back the same card on every subsequent visit forever. Two more cards each
would restore the rotation the rest of the game has. This is ordinary historian work against the
existing axis and needs no spec. (It is listed here so it is not forgotten, not because it belongs
to this feature.)

### 4.4 Act 6 — THE TEXT WORLDS — ⏸️ DEFER, and say why

**Verdict: no cards in this change.** Act 6 already has the replay loop this spec is trying to
build: every riddle creature carries a **rotating riddle pool** (`js/textworld/riddles.js`, `_ri`
advances per open — "different each time"), and the IM-friend remembers you across launches. It is
the one wing that is not short of reasons to return. If it ever gets cards they should attach on
the **wing/world** axis (`WING_CARDS`, the hardware wing's shape), not the act axis, because a
world is a place you visit rather than a level you win. Its own small spec, later.

### 4.5 Act 7 — THE SPEEDWAY — ⏸️ DEFER, but note the blocker is now gone

**Verdict: no cards in this change, and the reason it declined them no longer holds.**
`docs/specs/act7-speed-racing.md` §5.7 refused cards solely because they *"would inflate the
'★ found / total' denominator."* Scoped denominators (§5.4 here, and INV-96 as landed) dissolve
that objection. Speedway also already has a replay loop — the ghost car and the lap record. When
someone specs its cards, they attach on the wing/track axis. Not here.

### 4.6 THE HARDWARE wing — ✋ DO NOT TOUCH, it is already decided

**Verdict: out of scope, by design.** `WING_CARDS` + `(wing, station)` + paired machine/component
cards is already ruled and already built (empty pending an `arcade-historian` pass). The act bank
in this spec is a **third sibling** of `HISTORY_CARDS` and `WING_CARDS`, built the same way for the
same reason, and it must not merge with either.

### 4.7 The hidden layer (easter eggs) — ❌ DO NOT PUT ACT CARDS THERE

**Verdict: keep counted cards findable by playing, and keep secrets uncounted.** This is the
"uncover and discover" question, answered with a reason rather than a preference.

A `???` silhouette in the gallery is already a discovery invitation, and it is a *safe* one,
because there is always a path: replay the cabinet. The moment a counted card is reachable only by
knowing a secret, the `???` becomes a thing the child can see and cannot get, and the gallery stops
being a tease and starts being a scoreboard of her ignorance. That is completionist pressure, and
`product.md` §1 forbids it.

**There is one precedent pointing the other way and it should not be extended:** the WarGames
`joshua` card *is* counted, and is findable only by typing a magic word. One unreachable-by-play
card in sixty is a curiosity. Five — one per act — would make **every act shelf permanently
incomplete** for a child who does not read a wiki.

**The real gap the orchestrator named is real, and it is a different feature.** `easter-eggs.md`
records it as an open question: *"the moth is mouse-only, which sits oddly in a keyboard-first
game."* A **keyboard-reachable discovery egg** is genuinely missing and genuinely worth building —
as an **uncounted egg**, in `easter-eggs.md`'s own layer, with its own proposal. Folding it into a
counted collection would spoil both.

### 4.8 The slot picker's `★` counter — ⚠️ LEAVE IT, and note what I found

**Verdict: unchanged in this spec — but there is a live latent defect next door, reported in §8.**
The picker renders `'★ ' + slot.cardsFound` with **no denominator** (`js/ui/screens.js:108`,
`js/slots.js:291`), so it cannot regress: the number only grows. The docs describe it as
`★ 14 / 60`; the code does not. Left alone.

---

## 5. Design

### 5.0 Where it slots in

Three files, one new array, no new module, no new screen, no new key, no storage schema change.

| File | Change |
|---|---|
| `js/history-cards.js` | new exported `ACT_CARDS` array + `cardsForAct(act)` + `pickGuaranteedActCard(act, collected, rot)` (delegating to the existing `pickFromPool`) + `actCollectedCount(collectedIds)` / `ARCADE_CARD_IDS` for scoped counting |
| `js/main.js` | choose `state.actCard` beside `state.currentCard` in the same block (~line 1402); render it in the overlay's existing `#history-card` element (~line 1040) |
| `js/ui/screens.js` | `renderCollectionScreen` grows per-act shelves below the existing grid |

### 5.1 The data shape — a third sibling, not a third system

```js
// js/history-cards.js — a THIRD bank, parallel to HISTORY_CARDS and WING_CARDS,
// for exactly the reason WING_CARDS is separate (INV-96): TOTAL_CARDS is the
// number the player reads, and it may never move under a save.
export const ACT_CARDS = [
  { id: 'the-quarter', act: 1, word: 'quarter', title: '…', year: '…', fact: '…' },
  …
];
```

`act` is an integer 1–5 matching `ACTS[].num` in `js/ui/cabinet-art.js`. There is **no `level`
field**, so `cardsForLevel()` — which filters `c.level === level` over `HISTORY_CARDS` only — cannot
return one by two independent mechanisms. INV-56 does not apply and is not amended. INV-57's
generalized form ("no card without a numeric level enters a level pool") already covers it.

`word` is a **display label**, not a typed token. It is what the gallery cell prints
(`renderCollectionScreen` uses `card.word.toUpperCase()`), and it must still be unique across all
three banks so that a future reader — and INV-97 — never sees two cards claiming one word.

### 5.2 The trigger — the replay itself

At level start, in the same block that resolves `state.currentCard` (`js/main.js` ~1402):

```
isReplay   = !!getProgress().completed[String(level)]      // read BEFORE this play is recorded
levelCard  = pickGuaranteedCard(level, collectedIds, rot)  // unchanged
levelCardIsNew = levelCard && !collectedIds.includes(levelCard.id)

state.actCard = (!freePlay && isReplay && !levelCardIsNew)
  ? pickGuaranteedActCard(actOf(level), collectedIds, getCardRotation('act:' + actOf(level)))
  : null
```

Four properties fall out of that, and each is deliberate:

1. **The normal case is byte-identical to today.** A first play, or any play where the level still
   has a card you do not own, changes nothing at all.
2. **`isReplay` needs no storage.** `completed[level]` is already persisted and is read *before*
   this play is recorded — the same latch pattern as the eighth-key confession
   (`!getProgress().completed['20']`, `js/main.js` ~1020).
3. **Rotation reuses the existing string-keyed map.** `bumpCardRotation('act:1')` writes key
   `"act:1"`, which cannot collide with a level key `"13"` — the property INV-98 already blesses,
   and the reason this is a zero-migration change.
4. **Levels 1–3 qualify.** Their pool is empty, so `levelCardIsNew` is false on every play; the
   second win of Level 1 pays an Act 1 card. This is the point of the whole spec.

The act card is **chosen at level start and awarded at level complete**, and — this matters — it is
awarded **regardless of `state.cardWordTyped`**, because there is no word to type. Its award is
otherwise identical: `Slots.collectCardId(card.id)` (idempotent, drives the NEW! tag) and
`Slots.bumpCardRotation('act:' + n)`.

**No engine change.** The act card is never spliced into `state.patterns`, never gates the win
(`cardPending` is untouched), and never glints mid-play (`patternMatchesCard` runs only against
`state.currentCard`). Free Play is excluded exactly as level cards are. A survival game-over awards
nothing, exactly as today.

### 5.3 The reveal — the same element, one extra line

The overlay's existing `#history-card` block renders it, with two differences:

- a line above the title naming where it came from: **`FOUND IN THE ARCADE · ACT 1 · THE ARCADE`**
  (act name from `ACTS`), so the child is told plainly that this is the room's card and not the
  cabinet's;
- the count line reads its **own scope** — `ACT 1 CARD 2 OF 4` — never `CARD n OF 60`.

All of it is fixed literal data rendered with `textContent`, exactly as today (§6).

### 5.4 The denominator — the hard constraint, and exactly how it holds

**The rule: `HISTORY_CARDS` is not touched, so nothing a player has ever seen can shrink.**

| Surface | Today | After |
|---|---|---|
| Slot picker | `★ 14` (no denominator) | **unchanged** |
| Gallery header | `★ 14 / 60` over `allCards()` | **unchanged** — still over `HISTORY_CARDS` only |
| Level-complete, level card | `CARD 14 OF 60` | **unchanged in value**, but see the defect in §8 |
| Level-complete, act card | *(did not exist)* | `ACT 1 CARD 2 OF 4` |
| Gallery, act shelves | *(did not exist)* | `ACT 1 · THE ARCADE   ◆ 2 / 4` |

Three glyphs, three scopes, and **no blended number is ever printed**: `★` sums to
`HISTORY_CARDS.length`, `◆` sums to `ACT_CARDS.length`, `▣` is the wing's. A save that has never
replayed anything renders an identical UI to one built with `ACT_CARDS` emptied — which is INV-120,
and is also the revert plan.

**An act's shelf appears only once that save has completed at least one level in that act**
(derived from existing `completed`, no new storage), mirroring the wing-shelf rule. A child who has
never reached Act 4 is never shown four `???` she cannot explain.

### 5.5 How many, and what they are ABOUT

**Four per act, uniform, twenty total.** Uniformity is a feature: every shelf reads `◆ n / 4`, the
same size everywhere, small enough to finish in an afternoon and small enough to be a real research
ask. Four is also roughly the number of replays a child gives one cabinet before moving on.

**Each act's theme is the ERA OF ITS OWN ROOM — the thing the level axis measurably cannot do
(7/59).** Each is also distinct from the level bank's existing themes (people and inventions;
1970s–80s phreak/hacker culture; the edutainment lineage).

| Act | Room / era | **Theme** | Candidate subjects | Grounding today |
|---|---|---|---|---|
| **1** | THE ARCADE, 1976–82 | **The machine and the room — not the games.** The things a child standing in a 1979 arcade could touch | the quarter and the coin door · the marquee · attract mode (why a cabinet plays by itself when nobody is there) · three-letter high-score initials (why only three) · the curved glass of a CRT · the plywood-and-laminate cabinet body | `wiki/tech/arcade-control-panels.md` (partial), `research/arcade-cabinets-by-era.md` — **mostly needs a pass** |
| **2** | THE COMPUTER WING, 1981–86 | **How software got into a home machine before you could buy it in a shop** | type-in program listings in magazines · loading from cassette tape · the user group · the BASIC prompt · the arcade port that came home | `wiki/tech/commodore-64.md` ✓, `nes-hardware.md` ✓ — type-ins and user groups **need a pass** |
| **3** | THE BASEMENT, 1991–96 | **How a game travelled in the 90s, hand to hand** | shareware and the free first episode · the magazine cover disc · the demoscene · the LAN party | `wiki/culture/bbs-door-games.md` ✓, `warez-scene.md` ✓, `wiki/tech/sixteen-bit-era.md` ✓ |
| **4** | THE COMMAND CENTER, 1993–2000 | **The network becoming the internet** | the domain name · the search engine · view-source · the hyperlink · the handle you picked for yourself | `wiki/tech/world-wide-web.md` ✓, `wiki/culture/view-source-culture.md` ✓, `ipv4.md` ✓, `localhost.md` ✓ — **best-covered act** |
| **5** | FULL CIRCLE, 1980–now | **The keys themselves, and where writing came from** | Shift, which once physically shifted the carriage · Return, which once returned one · the cursor · Backspace and the correcting ribbon · the word processor | `wiki/tech/qwerty-keyboard.md` ✓, `wiki/culture/the-eighth-key.md` ✓ — the rest **need a pass** |

⚠️ **Collision guard: the RF modulator, the floppy/Disk II, the CD-ROM, the sound card and the
null-modem cable belong to THE HARDWARE wing** (`docs/specs/hardware-wing.md` §0.3). Act 2 and Act
3 take the *software-and-culture* side of their eras precisely so the two banks never tell the same
story twice.

**I am not writing these cards.** Every one is a historical claim on a card a child reads, so every
one goes to the **`arcade-historian`** agent (CLAUDE.md: *"Never write research prose from model
memory"*; journal F7, F29). The shopping list above is the brief.

### 5.6 Reading level — Acts 1–3 are read by, or to, a child still learning to read

Measured: existing card `fact` strings run 105–211 characters, median 163. That ceiling is fine at
Level 20 and wrong at Level 1.

- **Act 1: ≤ 120 characters**, at most two sentences, early-reader vocabulary, one idea per card.
- **Acts 2–3: ≤ 150 characters.**
- **Acts 4–5: the existing ceiling (≤ ~200).**

The card's `word` label follows the same rule: Act 1's labels should be words a beginning reader can
recognise on sight (`quarter`, `marquee` is already a stretch — prefer `coin`, `glass`, `screen`).

---

## 6. Safety & privacy

**`/security-review` is NOT required for this change as specced, and here is the chain it inherits
and why nothing new is introduced.**

- **No free-text input.** Act card content is fixed literal data committed in `js/history-cards.js`,
  authored by the historian, reviewed in the diff. It never passes through a user, a model, or the
  network.
- **No new DOM sink.** The reveal reuses `#history-card`'s existing elements via `textContent`
  (security.md rules 1–2: *"`innerHTML` is for fixed data only"*; card text is already fixed data
  and already uses `textContent`). The gallery's cells are built with `createElement` +
  `textContent` today and stay that way.
- **No storage-schema change.** `Slots.collectCardId` stores an id in the existing per-slot `cards`
  array; `bumpCardRotation('act:1')` writes into the existing string-keyed `cardRotation` map, which
  `normalizeSlot` already accepts as any object (security.md rule 4 — localStorage is untrusted and
  is normalized field-by-field; nothing about that changes).
- **No LLM surface, no network call** (security.md rule 6). Act cards exist identically on the
  published static host, with no `/api/*` dependency.
- **PII floor untouched** (rule 8). Act cards store card **ids**, which are gameplay data.

**What WOULD trigger a review**, so it is written down before someone reaches for it: adopting
Option **H** (a select-screen pickup target — new input path), or generating any act-card text.

**Content rating.** `product.md` §Content Rating binds: Acts 1–5 are core curriculum and stay
early-reader. Act 3's *warez/shareware* subject must be framed with the bank's existing
**"curiosity, not crime"** editorial move, and every act-card `word` and `fact` is checked against
`js/word-blocklist.json`'s floor (exact word plus generated inflections, security.md rule 7). The
floor is never lowered by anything here.

---

## 7. Non-goals

This spec explicitly does **not**:

1. **Change `HISTORY_CARDS`, `TOTAL_CARDS`, INV-21, INV-56, or the earliest-typeable rule.** Not
   one existing card moves, and no existing number changes.
2. **Add a second guaranteed card per play.** Exactly one card per play stays true (option E,
   refused).
3. **Put a word in Levels 1–3, or inject anything into their pattern stream.** The Word Bank
   Principle is untouched: act cards are not typed.
4. **Touch the engine, the win gate, `cardPending`, the mid-play glint, or Free Play.**
5. **Build a select-screen pickup, a glinting object, or any new navigation target** (option H,
   deferred).
6. **Hide any counted card behind a secret** (option G, refused).
7. **Add cards to Act 6, Act 7, or THE HARDWARE wing** (§4.4–4.6).
8. **Change the slot picker.**
9. **Write any card fact.** That is the historian's, not the builder's and not mine.
10. **Add an "act complete" capstone card** (option I, refused — it is the only proposal here that
    could create pressure).

---

## 8. Risks & residual risk

**A live latent defect found while writing this — report it whether or not this spec ships.**
`js/main.js:1048` prints `` `CARD ${Slots.collectedCount()} OF ${TOTAL_CARDS}` ``, and
`Slots.collectedCount()` counts **every** id in the slot's `cards` array, across all banks
(`js/slots.js:390`). `collectStationCard()` (`js/main.js` ~2016) already writes station-card ids
into that same array. So **the moment `WING_CARDS` is populated, a player who collects station
cards and then wins a level will see `CARD 63 OF 60`.** It is masked today only because
`WING_CARDS` is empty by design. This spec must fix it regardless — the level-complete line has to
count `collectedIds ∩ HISTORY_CARDS ids` — and that fix is INV-121. **It is a one-line-class bug
that would have shipped with the hardware wing's first card.**

| Risk | Severity | Mitigation | Residual |
|---|---|---|---|
| An act card feels like a lesser card because nothing was typed for it | medium | the `FOUND IN THE ARCADE · ACT n` line frames it as a *different kind of thing* (a room souvenir), not a worse one; the reveal animation is identical | real — only a playtest can settle it (§9 Phase 1 gate) |
| Two numbers (`★` and `◆`) confuse a child | low | never printed together in one line; each shelf owns one glyph | small |
| Act cards arrive too fast in Act 1 (four replays of L1 exhausts the act) | low | four is deliberately small; if it reads as too fast, grow the act pool — that is content, not mechanism | tunable |
| The historian cannot source four era-matched subjects for Act 1 | medium | Act 1's subjects are the best-documented objects in arcade history; but if a subject is unsourceable it is **dropped, never invented** (F29) — a shelf of 3 is fine | accepted |
| Act 3's warez/shareware subject drifts toward "how to pirate" | medium | "curiosity, not crime" framing; the shareware/cover-disc/demoscene angle is the *legal* half of that story and is the better one anyway | accepted |
| An INV number collision with `docs/specs/hardware-wing.md` §10 | **certain, see §10** | that spec's §10 still proposes INV-94..105 against a catalog that has already landed INV-94..99 with *different content* | must be re-based by whoever lands second |
| A replay that the player abandons still "counts" | none | the act card is awarded only on a WIN, like every other card | none |

---

## 9. Phased rollout

Each phase is independently shippable and independently revertible. Every phase ends with a real
play, twice, per `.claude/rules/playtest.md` — first run and second run are different programs, and
**this feature only exists on the second run**, which makes it the single easiest feature in the
game to "verify" without ever seeing.

**Phase 0 — the counting fix (ship on its own, today).** Scope the level-complete count line to the
arcade bank (§8). Fixes a latent `CARD 63 OF 60` that is already armed. INV-121. ~1 hour.

**Phase 1 — mechanism + ACT 1 (4 cards).** `ACT_CARDS`, `cardsForAct`, `pickGuaranteedActCard`,
the trigger, the reveal, the gallery shelf. Historian pass for Act 1's four subjects first — the
mechanism can be built against placeholder ids, but **no placeholder card text ever reaches a
build a child could open.**
*Playtest gate:* win Level 1 (no card), win it again (an Act 1 card), win it twice more, then open
the gallery and look at the shelf; then `--fresh` and confirm a brand-new save sees nothing new.

**Phase 2 — ACT 5 (4 cards).** Content only; zero mechanism change. Proves the mechanism is content
-driven, and pays the three one-card cabinets at the end of the game.

**Phase 3 — ACTS 2, 3, 4 (12 cards).** Content only, one act per historian pass.

**Phase 4 (optional, only if Trevor wants it) — the select-screen pickup** (option H), which turns
the award into an actual *discovery* rather than a reveal. Independent, later, and gated on
`/security-review` because it adds an input path.

**Not in any phase, tracked separately:** the missing level cards (§4.2, §4.3) and a
keyboard-reachable *uncounted* egg (§4.7).

---

## 10. Acceptance criteria — candidate invariants

Written so `test-engineer` can implement them directly. **I claim INV-120..107.**

> ⚠️ **Numbering conflict, flagged not resolved:** `docs/testing/STRATEGY.md` §5 already defines
> INV-94..99 (landed 2026-09-14). `docs/specs/hardware-wing.md` §10 still proposes a *different*
> INV-94..105 block written before that landed. Whichever of these two specs is implemented second
> must re-base its numbers against the catalog. This is the orchestrator's call, not mine.

- **INV-120** (L1) **Act cards are invisible to a save that has not replayed anything.** With
  `ACT_CARDS` populated, a save whose `completed` map is empty renders an identical slot-picker
  counter, an identical gallery header, an identical gallery grid and an identical level-complete
  denominator to the same save with `ACT_CARDS` emptied. `TOTAL_CARDS === HISTORY_CARDS.length`
  still holds, and no act shelf is rendered for an act in which no level has been completed.
  *(product.md §1 — a child never leaves a session feeling less capable; INV-96, the same law that
  keeps `WING_CARDS` separate; this spec §5.4.)*
- **INV-121** (L1) **Every printed card count is scoped to its own bank.** The level-complete
  denominator for a level card counts only collected ids that exist in `HISTORY_CARDS`; for an act
  card it counts only ids in that act's `ACT_CARDS` subset; the gallery header counts only
  `HISTORY_CARDS`. No printed `n OF m` can ever have `n > m`, for any combination of collected
  level, act, secret and station cards. *(§8 — `Slots.collectedCount()` counts across all banks and
  is already armed to print `CARD 63 OF 60` the moment `WING_CARDS` is non-empty.)*
- **INV-122** (L1) **A card belongs to exactly one bank, and ids and words are globally unique.**
  No id appears in more than one of `HISTORY_CARDS` / `ACT_CARDS` / `WING_CARDS`; no `word` appears
  in more than one (case-insensitively, after token normalization); every `ACT_CARDS` entry has an
  integer `act` matching an `ACTS[].num`, has **no** `level`, `secret`, `wing` or `station` field,
  and carries non-empty `word`/`title`/`year`/`fact`. *(generalizes INV-97; `Slots.collectCardId`
  stores ids in ONE per-slot set and `cardById` searches multiple arrays, so a duplicate id is
  silent data corruption.)*
- **INV-123** (L1) **No act card can ever reach a level pool or the pattern stream.**
  `cardsForLevel(level)` returns no `ACT_CARDS` entry for any level 1–25; no act card's word is
  ever spliced into `state.patterns`; `state.cardWordTyped` and the win gate (`cardPending`) are
  never influenced by an act card. INV-56 is neither applied to nor amended for act cards.
  *(INV-57 generalized — "no card without a numeric level enters a level pool"; §5.1, §5.2.)*
- **INV-124** (L1/L2) **The act card is the replay reward, and only ever replaces a duplicate.**
  An act card is offered only when all three hold: the level was already recorded complete for this
  save **before** this play, the level's own pool yields no card the save does not already own, and
  the act holds an act card this save does not own. It is never offered in Free Play, never on a
  survival game-over, and never on a level's first win. When it is not offered, every observable
  output of the play is byte-identical to the behaviour with `ACT_CARDS` removed. *(Trevor,
  2026-09-14: *"encourage additional play beyond a single play"*; §5.2.)*
- **INV-125** (L1) **Exactly one card per play survives.** For any level, any save state and any
  rotation counter, a single play awards at most one NEW card and the level-complete overlay
  displays at most one card. `pickGuaranteedActCard` delegates to the same `pickFromPool` as
  `pickGuaranteedCard`, so it returns exactly one card for a non-empty act pool and `null` for an
  empty one, prefers an id not in `collectedIds`, and cycles deterministically with the rotation
  counter (no `Math.random`) — a four-card act is fully collectable across four qualifying replays.
  *(INV-22 and INV-58, preserved verbatim; §5.2. Two copies of a guarantee is how guarantees rot.)*
- **INV-126** (L1) **Act rotation needs no save-schema change.** The act rotation counter is stored
  under the string key `"act:<n>"` in the existing `cardRotation` map, cannot collide with a level
  key (`"13"`) or a station key (`"hw:<id>"`), survives `normalizeSlot` unchanged, and a save
  written before this feature loads with no migration, no version bump and no data loss; a corrupt
  or hostile `cardRotation` value degrades to rotation 0 without throwing. *(INV-98, the same
  property, applied to a third axis; security.md rule 4.)*
- **INV-127** (L1) **Act-card content honours the floor and the reading level.** Every act card's
  `word` and `fact` passes `js/word-blocklist.json`'s floor (exact word plus generated inflections,
  per security.md rule 7); no act card lowers, bypasses or re-implements that floor; and every Act
  1 `fact` is ≤ 120 characters, every Act 2–3 `fact` ≤ 150, every Act 4–5 `fact` ≤ 200.
  *(product.md §Content Rating — *"a wing may never lower it"*; §5.6; the existing bank measures
  105–211 characters, median 163.)*

---

## 11. Open questions for Trevor

1. **Four cards per act, or more in Act 1?** Four is uniform and finishable. Act 1 is where a
   beginner lives and could carry six. *(My call if you don't want to make it: four everywhere, and
   grow Act 1 if a playtest says it empties too fast.)*
2. **Act 1 first, or Act 5 first?** I argue Act 1 (§4.1) — the loop is *absent* there, not thin —
   but Act 5's three one-card cabinets are the sharper single complaint from a player who has
   finished the game.
3. **Is a non-typed card acceptable to you?** This is the one real concession in the design. Every
   existing card is *"you typed this word, here is its story."* An act card is *"you came back,
   here is something about this room."* The alternative (Option F, typed) forces Act 1's cards to be
   spelled out of A S D F G H J K L ; — which reimports the exact defect the feature exists to fix.
   **If you would rather keep the typed ritual absolutely, say so and this becomes Option F with a
   much weaker Act 1 and nothing at all for Levels 1–3.**
4. **The Level 1 pattern card (`jf` → the raised bumps on F and J).** It is a card whose word is a
   *pattern*, not a word, so it does not break the Word Bank Principle — but it does put a card at
   Level 1 for the first time. Yes?
5. **Does "uncover and discover" mean you want the select-screen pickup (Option H)** — a glinting
   thing on the act's row that you walk the cursor onto and take — or is the reveal at level
   complete enough? H is a real discovery and roughly doubles the build. I recommend shipping
   without it and adding it only if the reveal feels flat in play.
6. **Act 3's theme touches shareware, cover discs and the warez scene.** The legal half
   (shareware, the free first episode, the demoscene) is the better story and the safer one. Do you
   want the warez/BBS-distribution half in a core curriculum act at all, or does it belong to the
   Server Room arc?
7. **Act 6 and Act 7 get no cards in this change** (§4.4–4.5). Both already have replay loops
   (riddle rotation; the ghost car). Agreed, or do you want them carded too?

---

*Related: `docs/specs/hardware-wing.md` §0.3/§0.4/§5.4 (the sibling bank, and the argument this
spec reuses) · `docs/specs/act7-speed-racing.md` §5.7 (the denominator objection this dissolves) ·
`docs/testing/STRATEGY.md` §5 (INV-20/21/22/56/57/58, INV-94..99) · `.claude/rules/product.md`
§History Cards, §Word Bank Principle, §Content Rating · `.claude/rules/easter-eggs.md` (the
uncounted layer, and its open keyboard-reachability question) · `.claude/rules/security.md` rules
1/2/4/7/8 · `.claude/rules/playtest.md` §The Second Run · `js/history-cards.js` ·
`js/slots.js` · `js/main.js` · `js/ui/screens.js`.*
