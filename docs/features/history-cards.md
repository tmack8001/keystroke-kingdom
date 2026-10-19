---
feature: history-cards
code: [js/history-cards.js]
rules: [research/computing-history-moments.md, research/hacker-culture.md, research/educational-software.md, docs/specs/act-exclusive-cards.md, docs/specs/hardware-wing.md]
screenshots: docs/screenshots/history-cards/
capture: node docs/screenshots/capture-cards.js
verified: 2026-09-15
---

# History Cards

Computing/gaming-history moments hidden in the curriculum, guaranteed to appear during
normal play and never missable. `js/history-cards.js` is pure data + helpers (no DOM,
no state) — the injection, detection, and gating logic live in `js/main.js`; the
collection **persistence** lives in `js/slots.js` (see [[save-slots]]).

## THREE banks, as of 2026-09-14/15 — not one

`js/history-cards.js` now exports **three separate card arrays**, each with its own
denominator, never merged:

| Bank | Export | Attaches to | Current size | Where it's shown |
|---|---|---|---|---|
| Arcade (the original) | `HISTORY_CARDS` | a curriculum level (1-25) | **61** (`TOTAL_CARDS`) | Level-complete overlay, [[free-play]] |
| The wing | `WING_CARDS` | a bonus-wing station (`wing`+`station`) | **4** | [[hardware-wing]]'s own canvas-drawn card reveal |
| The act | `ACT_CARDS` | a whole act (1-5), gated at Level 15 | **4** (Act 1 only) | [[free-play]]'s complete panel only |

**Why three arrays and not one filtered list (`docs/specs/hardware-wing.md` §5.4.1,
`docs/specs/act-exclusive-cards.md`):** `TOTAL_CARDS` is the denominator a player reads
on the slot picker and the level-complete card ("CARD n OF 61"). Appending wing or act
cards to `HISTORY_CARDS` would silently make **every existing save less complete** the
moment a new bonus layer shipped — a number the child already earned getting worse
because the game grew a room they haven't opened yet. Keeping the banks separate means
each keeps its own total and no existing save's "CARD n OF N" line ever regresses.

`bankOf(id)` reports which bank an id belongs to (`'arcade' | 'wing' | 'act' | null`),
and `bankProgress(bank, collectedIds)` returns `{found, total}` **scoped to that one
bank** — both exist because of a real bug (below). `cardById(id)` searches all three
banks (arcade first) so a single lookup always works regardless of which bank an id
came from.

### The bug this prevents: "CARD 63 OF 60"

`Slots.collectedCount()` counts every id in a save's flat `cards` array, across all
three banks at once (correct — storage is deliberately one flat list). But the
level-complete panel used to compare that combined count against `TOTAL_CARDS`, which
is the ARCADE bank's size *alone*. The instant `WING_CARDS` or `ACT_CARDS` stopped
being empty, a save with any bonus-bank card would read **`CARD 63 OF 60`** — a
denominator smaller than the numerator, which reads as broken math to a five-year-old
who is very proud of their number. `bankOf`/`bankProgress` fix this by scoping the
displayed count to the bank the *revealed* card belongs to — which is also strictly
the better feature, since it now tells the player which collection they just advanced.
Verified live 2026-09-15 (`js/main.js` `showLevelComplete()`, using
`bankOf(card.id) || 'arcade'`; [[hardware-wing]]'s own canvas reveal does the
equivalent with `bankProgress('wing', …)`): a Level 1 win reads `CARD 2 OF 61`
(arcade); a hardware-station visit reads `CARD 1 OF 4` / `CARD 2 OF 4` (wing); a Free
Play act-card reveal reads `CARD 1 OF 4` (act) — never a cross-bank number.

## Bank 1 — the arcade — a flat list, a pool per level, a completionist loop

**Rebuilt 2026-07-19** from a one-card-per-level object into a **flat list**,
`HISTORY_CARDS` (`TOTAL_CARDS = HISTORY_CARDS.length`). Each entry: `{ id, level,
word, title, year, fact, legacyLevel?, secret? }`.

- **2026-07-19 rebuild:** 17 → 41 curriculum cards + 1 secret (42 total).
- **2026-07-27 expansion:** +13 more curriculum cards — a 1970s–90s hacker/phreak/
  underground-culture batch (war dialing, trashing/dumpster-diving, Legion of Doom,
  phone phreaking, Masters of Deception, the Hacker Ethic, the origin of "spam," the
  first BBS, the Hacker Manifesto, Phrack, the word "cyberpunk," the acoustic
  coupler, and *2600: The Hacker Quarterly*) — citation-verified by the
  arcade-historian in `research/hacker-culture.md` +
  `research/wiki/culture/*`, `research/wiki/people/*`, `research/wiki/moments/*`.
  Same "curiosity, not crime" editorial framing as the rest of the bank — these
  are stories about relentless curiosity toward machines, told the way the game's
  own ethos already frames the mystery cabinet and the console banner easter eggs.
  New cards land on levels 6, 8, 9 (×2), 11 (×3), 12 (×2), 13 (×3), and 20 —
  each at its earliest-typeable level (INV-56), so an already-carded level's pool
  simply grows (e.g. level 11's pool went from one card to four).
- **2026-09-13 expansion:** +5 more curriculum cards — the **edutainment lineage this
  game is itself descended from**, closing the graph's strangest gap (it held ~210
  verified pages on arcades, consoles and hacker culture and **zero** on educational
  software, its own genre): `reader` (Reader Rabbit, 1984, L7), `gadget` (Gizmos &
  Gadgets, 1993, L8), `trail` (The Oregon Trail, 1971, L8), `boots` (Rocky's Boots,
  1982, L12) and `stickybear` (Stickybear Typing, 1985, L13). Citation-verified in
  `research/educational-software.md` + `research/wiki/pedagogy/*` and
  `research/wiki/games/*`.
  **Two editorial constraints are load-bearing here.** (a) **No Oregon Trail card may
  quote its famous death line** — `died`/`dead` are word-blocklist floor entries and the
  moment is wrong for a five-year-old regardless; the card is about a game that printed
  onto paper because it had no screen. (b) The Rocky's Boots card alludes to Warren
  Robinett hiding his name in a game three years earlier **without naming the
  `adventure` easter egg**, per `easter-eggs.md` rule 5 (*"eggs are for finding, not
  telling"*) — a player who already found it gets a private nod; nobody else is spoiled.
  The Stickybear card describes the 1985 tutor's blue on-screen keyboard that **lit up
  the next key to press** — verified by extracting and viewing frames from two archived
  boot videos, not from model memory (journal F28's sibling finding).
- **2026-09-15 expansion:** +1 curriculum card, and the first one that Levels 1-3 have
  ever had — `home-row-bumps` (word `jf`, **Level 1**, year **UNKNOWN**). Measured
  2026-09-14: Levels 1-3 had zero cards between them, because a card is found by
  *typing* its word and `J F D K S L` has no vowel (Word Bank Principle), so nothing
  was spellable before Level 4 — yet a five-year-old replays Levels 1-3 more than
  anywhere else in the game. The fix is a moment word that is a **pattern token**
  rather than a real word (`jf` is already Level 1's own drill), the same precedent
  the bank already had (`\o/`, `386`, `56k`, `1969`). The **year is deliberately
  `'UNKNOWN'`, not a placeholder** — two sources describe the F/J home-row bumps with
  no origin, the patent usually cited claims something else and its own prior-art
  section describes the bumps as already existing, and ISO/IEC 9995 could not be
  confirmed to mention them; saying `UNKNOWN` is the honest card, and the bank already
  has non-numeric years (`'1970s'`, `'LATE 1980s'`) as precedent for the shape.
  Research: `research/wiki/tech/home-row-bumps.md`.
- **Current total: 60 curriculum cards + 1 secret card = 61** (`TOTAL_CARDS === 61`).
  Levels 2 and 3 remain the only levels with zero cards.

Field shape per entry:
- **`id`** — a stable slug (`'ada-lovelace'`, `'qwerty-keyboard'`, …), the collection key
  going forward (levels are no longer the key — a level can hide several cards now).
- **`level`** — the **earliest** curriculum level whose unlocked keys can spell the
  card's word. Multiple cards can share a level (a *pool*): e.g. level 4 carries both
  `ada-lovelace` and `qwerty-keyboard`; level 8 carries `hedy-lamarr`, `atari-founded`,
  and `altair-8800`. **Levels 2 and 3 carry no card** (no vowel is spellable there, and
  no non-word pattern-token precedent has been carded for them yet); **Level 1** got its
  first card on 2026-09-15 (`home-row-bumps`, word `jf` — a pattern token, not a real
  word — see above).
- **`legacyLevel`** — set only on the original 17 cards, tagging which level they used
  to live at under the old one-per-level model. Purely a migration aid (below); has no
  effect on gameplay.
- **`secret: true`, `level: null`** — never injected into any level's pool; found only
  by typing a magic word. Currently one: `wargames-joshua` (see Easter Eggs, below).
  Still counts toward `TOTAL_CARDS` — a complete collection includes it.

Pure helpers: `allCards()`, `cardsForLevel(level)`, `cardById(id)`,
`legacyLevelToCardId(level)` (migration), `wordToTokens(word)`, `patternMatchesCard`.

## The guaranteed mechanic — exactly one card per play, chosen from the level's pool

`pickGuaranteedCard(level, collectedIds, rotation)` is deterministic (no `Math.random`)
and picks the **one** card a given play of a level will guarantee:
1. Filter `cardsForLevel(level)` to cards **not yet collected** in the active slot; if
   that leaves nothing (the level's pool is already fully collected), fall back to the
   full pool so a level always has a guaranteed card to show.
2. Index into that candidate set with the slot's **per-level rotation counter**
   (`Slots.getCardRotation(level)`, an int starting at 0) so repeat visits — even to an
   already-fully-collected level — cycle through the pool for variety, mirroring Act
   6's riddle-rotation pattern (`js/textworld/riddles.js`'s `_ri`).

In `startGame()` (`main.js`), for curriculum levels the chosen card is stashed as
`state.currentCard` and its word tokenized and **spliced directly into
`state.patterns`** right after the intro drills:
```js
state.patterns.splice(level.intro.length, 0, cardTokens);
```
`Slots.bumpCardRotation(state.level)` advances the counter immediately so the *next*
visit surfaces a different candidate. The level-completion gate in `handleGameKey`
enforces the guarantee:
```js
const cardPending = !state.freePlay && state.currentCard && !state.cardWordTyped;
if (themeComplete && state.patternsCompleted >= minPatterns && !cardPending && !namePending) { /* end level */ }
```
Even if the theme's win condition and pattern-count minimum are satisfied, the level
cannot end while `cardPending` is true. Level 24 is special: both the player's-name
pattern (Shift capitals) and the card word (from level 24's pool, e.g. `'IBM'`) are
injected without colliding — the name lands near front/middle, the card word lands
later.

A level with N cards in its pool takes roughly N visits (replays) to collect them all —
a Skulltula-style completionist loop that rewards replaying a level, not just
progressing past it.

## Mid-play detection ("gold glint")

When a completed pattern's tokens array-match `state.currentCard`'s
`wordToTokens(card.word)` (via `patternMatchesCard`), `state.cardWordTyped = true` and a
`card-glint` CSS class is force-retriggered on `.prompt-area`. Purely ambient — no text,
no sound, never pauses input. Flow is never interrupted per the One Rule.

## Level-complete pickup

`showLevelComplete()` populates the `#history-card` panel via `textContent`: word
(uppercased), title, year, fact, and `"CARD {found} OF {total}"` **scoped to the
revealed card's own bank** (`bankProgress(bankOf(card.id) || 'arcade', …)` — see "THREE
banks" above), plus a "NEW!" tag when `Slots.collectCardId(card.id)` reports the card
wasn't previously owned **in the active save slot**.

**Arcade cards (`HISTORY_CARDS`) never reveal in Free Play** — deliberately: they are
earned by the curriculum level that teaches their keys, and handing them out in Free
Play would cheapen that. **⚠️ Amended 2026-09-14: ACT cards are the one exception.**
Free Play is the *only* surface `ACT_CARDS` ever reveals on
(`card = state.freePlay ? (bankOf(state.currentCard.id) === 'act' ? state.currentCard :
null) : state.currentCard` — js/main.js), so a Free Play session on a save with
`furthestLevel >= 15` shows a `FREE PLAY COMPLETE` panel carrying the same `#history-
card` element as a curriculum win, title-barred `"CARD n OF 4"` (the act bank). See
[[free-play]] and the act-card section below.

## Persistence — per save slot

Collection used to be one global `kk-cards` localStorage array of level numbers. It is
now owned by `js/slots.js` (see [[save-slots]]): each save slot carries its own
`cards: [<id>, ...]` array (collected card ids, deduped) and its own
`cardRotation: { "<level>": <int> }` map. `Slots.collectCardId(id)` is idempotent;
`Slots.collectedIds()` / `Slots.collectedCount()` read the **active** slot;
`Slots.slotCards(i)` reads any slot by index (used by the read-only collection gallery
without switching the active game). Two children on one machine now keep two entirely
separate collections.

**Migration**: `legacyLevelToCardId(level)` maps a pre-slots `kk-cards` level number to
that level's original card id via the `legacyLevel` tag, so `Slots.ensureMigrated()` can
fold an old single-save collection into the new Slot 1 without losing it.

Erasing a slot (Settings' "ERASE ALL PROGRESS" row, or the slot picker's per-slot X→Y/N)
clears that slot's cards along with its curriculum progress — see [[save-slots]].

## Collection gallery

A read-only grid (`collection` screen, reached with `C` from the slot picker) over
`allCards()`: an owned card reveals its word (uppercase) + title; an unfound card shows
a `???` silhouette. Secret cards render in green when owned. Header shows
`★ {found} / {total}`. See [[save-slots]] for the screen's key handling and screenshots.

**Verified against all 55 cards (2026-07-27):** a fully-collected gallery screenshot
(`docs/screenshots/screens/collection-gallery.png`) shows `★ 55 / 55`, all 13 new
hacker-culture cards render with no clipping, and the secret `JOSHUA` card still
renders in green.

**Multi-word label truncation — fixed 2026-07-28.** The prior finding (the two-word
card WORDS `rubber duck` and `hello world` truncating with an ellipsis, `RUBBER DU…` /
`HELLO WOR…`, since `.collection-cell-label` had no wrap rule) is resolved:
`css/screens.css`'s `.collection-cell-label` now wraps a multi-word label to a
centered second line (`white-space: normal; overflow-wrap: break-word`) instead of
ellipsis-clipping; single-word labels are unaffected and cells keep their fixed size.
Owned by [[visual-styling]] (outside this page's `code:` scope) — see that page for
the rule itself. `docs/screenshots/screens/collection-gallery.png` was regenerated
(synthetic fully-collected slot, same recipe as the 2026-07-27 verification pass) and
now shows both `RUBBER DUCK` and `HELLO WORLD` in full, two-line, no clipping;
`★ 55 / 55` and zero `scrollHeight` overflow reconfirmed.

**Capture tooling — `capture-cards.js` WORKS. Do not report it as broken.**
Last verified 2026-09-15 (after the Level 1 `home-row-bumps` card landed):
`node docs/screenshots/capture-cards.js` → exit 0, **60/60 pooled cards captured**
(of 60 pooled cards; the arcade bank is 61 total including the one secret card),
secret card captured, zero console errors, zero legibility issues. The script needed
no code change to pick up the new card — it derives its expected set from the live
`HISTORY_CARDS` array, exactly as designed.

> ⚠️ **This paragraph has caused four false "capture-cards.js is broken" reports**
> (2026-09-11, 2026-09-13 x2, and again in the 2026-09-13 audit wave). Every one
> was an agent reading the PAST-TENSE history below as a present-tense defect, and
> every one was wrong. The same thing happened to a comment inside the script
> itself, which is why that comment was rewritten too (docs/ROADMAP.md §3).
> **The general lesson, now four-for-four: a description of a past failure is not
> evidence of a current one, and "I read it" is not the same claim as "I ran it."**
> If you are about to report this script broken: run it first.

*History, for context only — all of this was fixed in July 2026.* The script was
previously broken independent of any content change (its wire-check assumed the
pre-2026-07-19 object-keyed `HISTORY_CARDS` shape and an object-keyed `Object.keys()`
scan against what is now a flat array, plus a stale `CARD_LEVELS` list) — it exited
fatally on any invocation. It has since been rewritten for the flat-array/pool model
(pulls the live `HISTORY_CARDS` array in-page, derives its expected set and the
"CARD n OF N" check from that data rather than a literal) and re-run in full:
`docs/screenshots/history-cards/` now holds all **59 pooled cards** (+1 secret = 60 files) as
`<level>-<id>.png` (e.g. `13-colossal-cave.png`, `25-hello-world.png`,
`25-rubber-duck.png`) plus the one secret card as `secret-wargames-joshua.png` — 60
files total (verified 2026-09-13, including the five 2026-09-13 edutainment-lineage
cards), zero console errors, zero guaranteed-capture failures.

## Bank 2 — the wing (`WING_CARDS`) — paired, per station

`docs/specs/hardware-wing.md` §5.4. A bonus wing has no levels, so INV-56's "earliest
level whose keys spell the word" rule has no number to compute (every key is already
unlocked by the time a wing opens) — station cards instead attach to `{wing, station}`.

- **Paired by design (Trevor, 2026-09-14):** every built station yields a MACHINE card
  and a COMPONENT card — "the part you could have held." Currently 4 cards across the
  wing's 2 built stations (`apple-iie`: `hw-disk-ii` + `hw-apple-iie`; `msdos-pc`:
  `hw-cd-rom` + `hw-mpc-badge`). The wing's other 5 planned stations have no cards yet —
  `cardsForStation()` tolerates an empty pool, so an unbuilt station stays inert rather
  than half-broken.
- **`STATION_CROSS_REFS`** points a station at arcade cards that tell an adjacent part
  of the same story (e.g. `apple-iie` → `floppy-disk`, `apple-founded`,
  `stickybear-typing`) for that station's own gallery (`stationCards()` = the station's
  own cards + its cross-refs, resolved via `cardById`, unknown ids dropped rather than
  throwing). This is a *rendering* relationship only — no card changes owner, no count
  moves.
- **`pickGuaranteedStationCard(wingId, stationId, collectedIds, rotation)`** is the same
  prefer-uncollected-then-rotate policy as `pickGuaranteedCard`, applied to the
  station's own pool — cross-referenced cards are never "earned" this way (they either
  already belong to the player or haven't been reached honestly).
- **Reveal mechanism** lives in [[hardware-wing]] — canvas-drawn, not the DOM
  `#history-card` panel, since the wing has no `.complete-modal` to nest it in. See that
  page for the full reveal + verified screenshots.

## Bank 3 — the act (`ACT_CARDS`) — unlocked by the whole keyboard, shown only in Free Play

`docs/specs/act-exclusive-cards.md`. **The problem this solves, measured rather than
assumed:** only 7 of the arcade bank's (pre-2026-09-15) 59 cards land in their own act's
era, because INV-56 attaches a card to the *earliest spellable* level — e.g. `phrack`
(1985) sits on the Myst cabinet (Level 13) because that's where its letters close, not
because Myst has anything to do with 1985 hacker zines. An act-themed card layer needs a
way to escape that spelling constraint.

**The gate is Level 15, not Level 25 or a "look back" mechanism.** An earlier draft
made act cards non-typed to dodge the spelling constraint entirely, which bought a
Level 1-era card at the cost of the ritual the whole system rests on (type the word,
get the story). Trevor's inversion: *"introduce act/wing/phase cards after the entire
keyboard is unlocked… so it stays next to typing the card title."* Level 15 is exactly
where the curriculum calls FULL KEYBOARD UNLOCKED (26 letters + `; , . /` — verified
against `js/levels.js`, not assumed) — so every act word is guaranteed typeable and the
spelling constraint is *abolished*, not evaded. `ACT_CARD_UNLOCK_LEVEL = 15`;
`actCardsUnlocked(furthestLevel)` is the gate (`furthestLevel >= 15`, derived from
existing progress — no new save field).

- **Content rule:** every act-card word must be spellable from the Level-15 key set —
  lowercase letters plus `; , . /` only. No digits, capitals, spaces, hyphens or
  apostrophes (`actWordIsTypeable()` enforces this; `ACT_WORD_KEYS` is the authoritative
  set, derived from the curriculum rather than copied, so a future curriculum change
  that moves a key fails the check loudly instead of silently).
- **`actOfLevel(level)`** maps any of the 25 levels to its act (1-5, five levels each) —
  the one place this mapping is written down for the card layer.
- **Current content: Act 1 only, 4 cards** (`act1-quarter`, `act1-marquee`,
  `act1-attract`, `act1-initials` — the coin door, the marquee, attract mode, and
  three-letter high-score initials), all sourced to Atari's own service manuals for
  the exact machine THIS game's Level 1 depicts (Breakout). Acts 2-5 are unwritten —
  the spec wants 4 per act (20 total, so every shelf reads "n / 4" uniformly) and
  `cardsForAct()` tolerates an empty act, so the layer stays inert rather than
  half-broken where it hasn't been authored yet. Tracked in `docs/ROADMAP.md`.
- **Where an act card is chosen and injected:** `startGame()` in `js/main.js`, gated
  on `state.freePlay && actCardsUnlocked(getProgress().furthestLevel)`. The chosen
  act's card is spliced into the Free Play sentence pool near the front
  (`Math.min(2, state.patterns.length)`), and a flag (`actCardSpliced`) suppresses the
  *generic* curriculum card-injection block further down so the same word is never
  spliced twice into one session (a real bug caught while authoring the first act card
  — see `docs/ROADMAP.md`/journal). The moment-word win-gate and reveal behave exactly
  like a curriculum card (see "Level-complete pickup" and the `cardPending` note in
  [[engine-flow]]) — including the Free-Play-unwinnable bug this uncovered, **TF-A1**
  (`docs/testing/FINDINGS.md`), now fixed.
- **Never shown at curriculum level-complete** — only Free Play reveals an act card
  (see "Level-complete pickup" above). The rotation key is namespaced `act:<n>` so it
  can't collide with a level-number key or a wing's `hw:<station>` key in the same
  string-keyed rotation map.

## Easter egg — the secret WarGames card

Typing `joshua` (added 2026-07-19 alongside the existing `shallweplayagame` / `wopr` /
`wargames` WOPR phrases — see [[easter-eggs]]) both triggers the WOPR select-screen
bypass **and** calls `Slots.collectCardId('wargames-joshua')`, awarding the secret card
to whichever slot is currently active (a no-op, harmlessly, if no slot is active yet —
the pre-name-entry dev-bypass path).

## Related

[[curriculum-data]] (the `level.intro` length this splices after) · [[engine-flow]]
(owns all injection/detection/gating logic, including the `cardPending` win-gate and
its 2026-09-15 Free Play fix — TF-A1) · [[save-slots]] (collection persistence, the
slot picker, and the collection gallery screen — arcade bank only) · [[easter-eggs]]
(`joshua` + the secret card) · [[free-play]] (the act-card reveal now lives here, the
arcade bank is deliberately excluded) · [[hardware-wing]] (the wing-card reveal and
Phase-1 station roster the second bank attaches to)
