# Topical Card Collections + the Card-Detail View

*Product spec / ADR. Written 2026-11-04 by the product-manager agent. Status: **PROPOSED, nothing
built.** Parent ideas: Trevor, 2026-10-31 ("every card in every bank carries a topic — math /
programming / hacking / tech culture / the keyboard — so the gallery can group by topic"), and the
deferral in `docs/specs/semicolon-teaching-beat.md` §3.2/§4 ("the card upgrade is deferred to the
gallery/topics follow-on spec, where the detail view belongs").*

---

## 1. Recommendation

**Build it in three small phases, after the §1.1 merge. The detail view is the part with real value
for the child; the topic grouping is mostly for the parent and the older player.** Today a card's
story is shown **exactly once**, on that play's LEVEL COMPLETE panel. After that the gallery shows
only its WORD and TITLE, so there is no way in the game to re-read a fact you earned. Phase 1 adds a
single `topic` string to all 85 records. It is data only, invisible, needs no save migration, and
never touches any count. Phase 2 adds a **BY TOPIC** view to the existing gallery, switched with
`T`. The default view stays **BY PLACE**, which is today's bank shelves, unchanged. Phase 3 adds a
keyboard cursor to the gallery and a **card-detail panel** that opens on an owned card. It shows the
full fact and, for a keyboard card on a save that has cleared Level 20, the reserved `codeFact`.
Each card gets **one** primary topic from a fixed vocabulary of ten. No count the player already
reads ever changes: `TOTAL_CARDS`, the picker ★, `bankProgress` and the `CARD n OF m` line stay
bank-scoped. Topic counts are a separate, view-local number. Nothing new is stored. The vocabulary
and four other calls are Trevor's (§11). The rest is decided here.

## 2. The problem

- **A card's story can be read once and then never again.** `renderCollectionScreen`
  (`js/ui/screens.js:346`) draws an owned tile as `word.toUpperCase()` + `title`, nothing more. The
  `fact` appears only in the LEVEL COMPLETE overlay (`js/main.js` ~1360) on the play that earned it.
  So a child who collects `ODD AND EVEN` and wants to show Dad the button trick has no way to bring
  the card back up.
- **The gallery is grouped by WHERE a card was found, not WHAT it is about.** `HISTORY_CARDS`
  attaches by spelling (INV-56). The two halves of the deliberate MATH-vs-CODE pair (`1=1` and
  `1==1`) sit somewhere among 76 tiles on THE CABINETS shelf, next to `PHRACK` and `PAC-MAN'S PIZZA`.
  The batch was written so the *collection* would teach the difference, and the collection never
  shows the cards side by side.
- **A promise is waiting on this spec.** `KEY_CARDS[0]` carries a reserved `topic: 'keyboard'` and a
  reserved `codeFact` that nothing reads (`js/key-cards.js:43,72`). The semicolon spec deferred the
  "card upgrade after L20" here (§4, "⏸️ Deferred to the topics/gallery-detail spec").
- **The gallery has no cursor at all.** Arrows only scroll (`scrollCollection`, `screens.js:447`).
  Space, Enter and Escape all leave (`main.js` ~2961). No tile can be selected, so a detail view needs
  selection built first.

## 3. Option space

### 3.1 How many topics per card

| Option | Counts stay honest? | Gallery | Curator effort | Reversible |
|---|---|---|---|---|
| Status quo, no topics | yes | bank shelves only | 0 | — |
| **One primary `topic` (string) ✅** | **yes: topic shelves partition the cards, so the sum of topic counts equals the sum of bank counts** | each card on exactly one topic shelf | one call per card | yes: data only |
| Several tags (`topics: []`) | **no**: a card on two shelves is counted twice, and the topic numerators sum past the cards owned. That is the `CARD 63 OF 60` class (INV-100) in a new place | the same tile appears twice, which reads to a child as owning two cards | ~2–3 calls per card | yes |
| Primary + unrendered secondary `also: []` | yes (only the primary is counted) | as primary | more | yes, but it is data nothing reads, which is the reserved-field debt this spec is paying off |

Several tags would put the `1==1` card on both CODE and NUMBERS. The *pair* already does that job,
and better: `1=1` sits on NUMBERS and `1==1` on CODE. Seeing them on two different shelves is the
lesson.

### 3.2 Who assigns, and where the vocabulary lives

| Option | Verdict |
|---|---|
| Free-text topic per card | ❌ It drifts, and you get "math" vs "maths". |
| **A fixed `CARD_TOPICS` list in `js/history-cards.js`; every record's `topic` must be one of its ids, enforced by a test ✅** | One definition (journal L41). A new topic id is a design change (this spec, then Trevor). Assigning an existing topic to a new card is the card author's call, reviewed in the PR. |
| The arcade-historian assigns | ❌ A topic is a shelf label, not a historical claim, so this needs no citation. The historian is still the gate for every *fact* (Non-goals). |

**This spec drafts all 85 assignments (Appendix A).** Trevor ratifies or edits the draft, and the
builder only transcribes it.

### 3.3 How the gallery groups

| Option | Existing player's gallery | Reachability rule (INV-106) | Risk | Effort |
|---|---|---|---|---|
| Status quo, by bank | unchanged | holds | none | 0 |
| Replace bank shelves with topic shelves | **changes under them**; the bank-scoped counts (THE HARDWARE ◼ n/4, ACT 1 ♦ n/4, `KEYBOARD CARD n OF m`) disappear | must be re-proved | the act layer's whole replay driver ("every shelf reads ◆ n / 4", act-exclusive-cards.md §5.5) is lost | M |
| Sub-group by topic inside each bank shelf | unchanged count heads | holds | **does not deliver the ask**: a topic would never gather the arcade's `floppy-disk` with the wing's Disk II. Cross-bank grouping is the point | M |
| **Toggle: BY PLACE (default, today) ↔ BY TOPIC (`T`) ✅** | unchanged by default | **holds by construction**: topic view regroups exactly the cards on the shelves BY PLACE would show | small: one key, one pure function | S–M |

### 3.4 What a topic shelf counts

| Option | Verdict |
|---|---|
| **Scoped `♢ n / m`, over the cards on that topic shelf (i.e. only reachable shelves) ✅ recommended, but Trevor's call (Q3)** | Honest, and in the same format as every bank shelf. The catch: `m` can grow when a new bank shelf becomes reachable. At Level 13 KEYS AND TYPING gains the keyboard card; at Level 20 MACHINES gains the four wing cards. `n` never drops. |
| Found-only (`♢ 9 FOUND`) | No denominator to grow. But the `???` tiles still show what is missing, and the collect-them-all target is weaker. |
| Whole topic, including unreachable banks | ❌ That is a counted `???` with no route. `product.md` §1 and INV-106 refuse it. |
| No count | Loses the completionist hook that is the reason the cards exist. |

**Topic counts never feed anything else.** `TOTAL_CARDS`, `bankProgress`, the picker ★ and the
LEVEL COMPLETE line do not read them. The keyboard topic's count is **not** `KEYBOARD CARD n OF m`:
that string means the keyboard *bank*, and the KEYS AND TYPING topic also holds three arcade cards
(`jf`, `asdf`, `\n`).

### 3.5 Where the detail view opens

| Option | One Rule | Verdict |
|---|---|---|
| Status quo, fact only at LEVEL COMPLETE | ✅ | The failing behaviour in §2. |
| **A panel inside the gallery: cursor onto an owned tile, Space/Enter opens it ✅** | ✅ The gallery is reachable only from the slot picker (`C`), never during play | Decided. |
| A "read more" key on the LEVEL COMPLETE overlay | ⚠️ It is a natural pause point, but it adds a branch to the level-end flow every play passes through | ❌ Non-goal. That overlay stays as it is. |
| A modal during play | ❌ It stops flow (`product.md` §2) | Rejected by construction. |

### 3.6 Storage for the view mode / cursor

| Option | Verdict |
|---|---|
| **None: the view mode and cursor live in `state`, the gallery opens BY PLACE each time ✅** | No schema change, no migration, no `/security-review` trigger. |
| Remember the view in `kk-settings` or `kk-slots` | It is a storage-schema change (security.md "When to re-run"), bought to save one keypress. Not worth it (Q5). |

## 4. Per-surface verdict

| Surface | Verdict |
|---|---|
| Card records, all four banks | ✅ Phase 1: one `topic` string each, from `CARD_TOPICS`. |
| `TOTAL_CARDS`, `bankProgress`, picker ★, LEVEL COMPLETE `CARD n OF m` / `KEYBOARD CARD n OF m` | ❌ **No change, by rule.** Topics never touch them (INV-96/100/104/106). |
| Save data (`kk-slots`) | ❌ No change. Saves hold card ids; topics are static data on the record. |
| Gallery BY PLACE view | ✅ Unchanged shelves and counts. Phase 3 adds the cursor only. |
| Gallery BY TOPIC view | ✅ Phase 2: `T` toggles. Topic shelves in `CARD_TOPICS` order; an empty topic gets no shelf. |
| Locked tiles, both views | ✅ `???`. A **keyboard-bank** card also shows its glyph (INV-140), and never its word (INV-29). The rule moves from per-shelf to per-card (§5.3). |
| Detail panel, owned card | ✅ Phase 3. The full fact; for a keyboard card, `codeFact` only once the browsed save has `completed[codeLevel]`. |
| Detail panel, locked or secret-locked card | ❌ Does not open. No hint of where to find it (Q4). |
| LEVEL COMPLETE overlay, L13 beat card | ❌ No change. INV-161 still holds: no code meaning on it, even after L20. |
| Hardware wing canvas card reveal | ❌ No change. |
| Free Play, levels, cinematics | ❌ No change. Nothing here runs during play. |

## 5. Design

### 5.1 Data (Phase 1) — `js/history-cards.js`, `js/key-cards.js`

- Add `export const CARD_TOPICS`: an ordered array of `{ id, heading }`. Order is display order.
  Draft vocabulary (Q1):

  | id | heading | draft count |
  |---|---|---|
  | `keyboard` | KEYS AND TYPING | 4 |
  | `math` | NUMBERS | 7 |
  | `code` | CODE | 12 |
  | `machines` | MACHINES | 17 |
  | `network` | THE NETWORK | 9 |
  | `ai` | THINKING COMPUTERS | 5 |
  | `hacking` | HACKERS | 11 |
  | `games` | GAMES | 8 |
  | `learning` | LEARNING GAMES | 5 |
  | `culture` | TECH CULTURE | 7 |
  | | **total** | **85** |

  Trevor's five named topics map to `math`, `code` (his "programming"), `hacking`, `culture` and
  `keyboard`. His two "likely more" map to `learning` (pedagogy) and `machines` (hardware). This
  draft adds three: `network`, `ai` and `games`. Without them, nine internet cards and five
  thinking-machine cards would be forced onto a shelf they do not fit.
  **Headings are deliberately not bank headings.** The topic is KEYS AND TYPING, not THE KEYBOARD,
  which is already a bank shelf. The gallery once printed "THE ARCADE" twice with two meanings
  (`screens.js:278`), and this avoids repeating that.
- Add `topic: '<id>'` to every record in `HISTORY_CARDS`, `WING_CARDS` and `ACT_CARDS` (Appendix A).
  `KEY_CARDS[0].topic` stays `'keyboard'`; delete its "RESERVED, nothing reads it" comment in the same
  phase that first reads it (Phase 2).
- Add pure helpers beside `bankOf`: `topicOf(card)` returns the `CARD_TOPICS` entry or `null`;
  `groupByTopic(cards, topics = CARD_TOPICS)` returns an ordered `[{ topic, cards }]`, skips empty
  topics, and puts any card whose topic is unknown on a trailing `{ id:'more', heading:'MORE CARDS' }`
  shelf. **Never drop a card** (INV-103: a card earned is a card seen). CI fails on that case
  (INV-200), so in practice the defensive path ships empty.
- Also add a pure `cardPlace(card)` → the place line: `FOUND ON THE ARCADE FLOOR` (arcade/act),
  `FOUND BESIDE THE MACHINE` (wing), `FOUND UNDER THE KEYBOARD` (keyboard). These strings are
  currently literals in `js/main.js:1376` and `js/hardware/hub.js:552`. The detail view must not
  become a third copy, so `main.js` and `hub.js` switch to importing the helper in the same phase
  that adds it (Phase 3).

### 5.2 BY TOPIC view (Phase 2) — `js/ui/screens.js`, `js/main.js`

- `collectionShelves(opts)` is unchanged; it stays the BY PLACE view and the single owner of
  reachability. Add `collectionTopicShelves(opts)`. It calls `collectionShelves(opts)`, flattens the
  cards of every shelf it returned, and regroups them with `groupByTopic`. Each topic shelf is
  `{ id:'topic:<id>', heading, glyph:'♢', cards, found, total }`, counted with the existing
  `countFound`. **Reachability is inherited, never recomputed**, which is why this cannot show an
  unreachable `???` (INV-203).
- Within a topic shelf, cards appear in BY PLACE order: arcade, keyboard, wing, then act, and array
  order within each. That is stable and deterministic. In practice `1=1` and `1==1` land on
  different shelves, NUMBERS and CODE, which is intended.
- `♢` is in the Press Start 2P covered set measured in `screens.js:213`. Use the one glyph for every
  topic shelf rather than ten new ones, each of which would need its own coverage check (journal O11).
  Screenshot it anyway.
- `state.collectionView`: `'place' | 'topic'`. It is set to `'place'` every time
  `showCollectionScreen` runs. `T`/`t` toggles, re-renders, and calls `revealCollection()` (scroll to
  top).
- The `.collection-title` reads `COLLECTION · BY PLACE` / `COLLECTION · BY TOPIC`. The hint line
  (`index.html:106`) gains `T TOPICS` / `T PLACES`. Both are fixed strings set with `textContent`.
- **Per-card locked rendering.** `renderCollectionScreen` currently decides the glyph tile with
  `shelf.keyboard` (`screens.js:381`). Change it to `bankOf(card.id) === 'keyboard'`, so a locked
  semicolon tile on the KEYS AND TYPING topic shelf still shows `;` and `???`. The word is read on
  the owned branch only, as today. **No locked tile may carry the word in any attribute** (`title`,
  `aria-label`, `data-*`). That is the easy way to leak it (INV-206).

### 5.3 Cursor + detail panel (Phase 3)

**Cursor.** `state.collectionCursor` is an index into the flat list of rendered cells, in the
current view. It resets to 0 on every open and on every `T` toggle.
- ←/→ move one cell, crossing shelf boundaries in reading order. ↑/↓ move one *visual row*, using
  the column count measured from the rendered grid at key time. Do not hard-code it; the grid
  reflows. At a shelf edge, ↑/↓ go to the nearest cell in the neighbouring shelf. Home/End go to the
  first/last cell. PageUp/PageDown keep scrolling a page and move the cursor to the first fully
  visible cell. Every move calls `scrollIntoView({ block: 'nearest' })` and then
  `updateCollectionScrollHint()`.
- The highlighted cell gets a `.cursor` class, styled with the same glow as the selected slot-picker
  row. Owned and locked cells can both be selected, because a child pointing at a `???` should still
  see the cursor land on it.

**Keys, gallery level** *(a key-contract change: record it in `levels/onboarding.md` §Returning
Player Flow first; Q2)*:

| Key | Today | After Phase 3 |
|---|---|---|
| Escape | back to picker | back to picker (unchanged) |
| Space / Enter | back to picker | **open the detail panel on an owned card**; on a locked card, nothing (no sound: the nudge sound means "wrong key", and this is not a mistake) |
| arrows | scroll | move the cursor (scrolling follows) |
| PageUp/PageDown/Home/End | scroll | as above |
| `T` | — | toggle view (Phase 2) |

This follows `onboarding.md`'s own rule, *"Space confirms/advances everywhere"*: Space on a tile now
advances into it.

**Detail panel.** A `#collection-detail` element inside `#collection-screen`, hidden by default.
It is **not a modal over play**: it can exist only on a screen reached from the picker. Rendered with
`createElement` + `textContent` only. It reuses the `.history-card` palette, tilt and type sizes from
the LEVEL COMPLETE card, so a re-read card looks like the card that was picked up. Body text is never
smaller than that card's fact text: the L13 caption at ~9px was judged unreadable for a 5-year-old
(ROADMAP §3).

| Line | Source | Notes |
|---|---|---|
| place | `cardPlace(card)`; arcade adds `· LEVEL n`; a secret card reads `A SECRET CARD`; an act card adds `· ACT n` | never the player name |
| title · year | `card.title`, `card.year` | `year` is shown as stored (`UNKNOWN`, `c. 300 BC`, `MID-1980s` are sourced values) |
| the word | `card.word`, **exactly as typed** (`Eniac`, `1==1`, `o'reilly`, `\o/`) | the gallery tile upper-cases it; the detail shows the truth of what was typed |
| fact | `card.fact`; for a keyboard card, `card.literacyFact` | |
| code (keyboard cards only) | `card.codeFact`, under the label `IN CODE` | **only if the BROWSED slot's `completed[card.codeLevel]` is truthy.** Otherwise the line is absent: no lock, no tease. The L20 couplet is the reveal, and this panel just quietly has more in it afterwards |
| topic | `topicOf(card).heading` | |
| hint | `← → MORE CARDS · ESC BACK` | fixed string |

- In the panel, ←/→ step to the previous/next **owned** card in the current view's order, skipping
  locked ones and stopping at the ends without wrapping. The gallery cursor follows. Escape, Space or
  Enter close the panel, leaving the cursor on the card last shown.
- The browsed slot's progress: `showCollectionScreen(slotIndex)` already browses a slot that may not
  be the active one. Add a read-only `Slots.slotCompleted(i)` returning that slot's normalised
  `completed` map. It is a pure read of an existing field, not a schema change. **Never use
  `getProgress()`, which reads the ACTIVE slot.** That is the same class of bug as the Level 11 win
  credited to the wrong family member (onboarding.md §Which game is playing).
- `selectBypass` (WOPR) does not unlock `codeFact`. Only that slot's real `completed[20]` does,
  matching the couplet's latch.

### 5.4 What stays the floor

Bank shelves, bank counts, the picker ★, the LEVEL COMPLETE overlay, the semicolon beat, and every
card's text. Delete Phases 2–3 and the game is today's game. Delete Phase 1 and the only loss is an
unread field.

## 6. Safety & privacy

- **DOM.** Every new element is built with `createElement` + `textContent` (security.md rules 1–2).
  The values are fixed literals from the card modules, looked up **by id from code**. An id string
  read from `kk-slots` is never itself rendered; an unknown id is dropped, as `bankProgress` already
  does. *Check:* the new detail/topic code in `js/ui/screens.js` adds no `innerHTML`, and `grep -n
  "innerHTML" js/ui/screens.js` stays at the one existing `host.innerHTML = ''` clear.
- **localStorage.** Nothing new is written. `Slots.slotCompleted(i)` reads through the existing
  normaliser (`slots.js:175`), so garbage reads as `{}` and `codeFact` stays hidden (rule 4).
  *Check:* INV-207 snapshots `localStorage` before and after a full gallery session.
- **PII.** No new datum. The detail panel never shows the player name.
- **INV-29.** The word reaches the screen only through records imported from `js/key-cards.js`,
  never restated in `screens.js`, and only on owned tiles and an owned card's detail. Both are
  surfaces the semicolon spec already allows (owned gallery tile, §5.4). No allowlist change.
- **`/security-review`.** Not triggered by the letter of security.md "When to re-run": there is no
  variable-fed sink, no schema change and no free text. **Recommended as a light pass before Phase 3
  merges**, because it adds the second screen that renders the allowlisted word. **Required** if
  Trevor picks Q5's "remember the view" option, which is a schema change.
- **Missing today, needed:** the per-card locked-glyph rule (§5.2), and `docs/a11y/audit.js` does
  not walk the collection screen (ROADMAP §3). Phase 3 must at least screenshot the detail panel per
  bank and measure its contrast by hand.

## 7. Non-goals

- **No new card prose.** The detail view shows existing fields only. A longer story or a second fact
  for arcade cards would be new player text and must go through the arcade-historian, in a separate
  spec.
- No `codeFact` for any card except keyboard cards. No arcade card gets a code line here.
- No change to how cards are earned, picked, rotated or counted (`pickFromPool`, INV-56, rotation).
- No topic count on the picker, the LEVEL COMPLETE overlay or the hardware wing.
- No several-topic tags; no `also` field.
- No mouse/touch interaction. The cursor is keyboard-only. A click handler is not forbidden, but it
  is not specified and not tested.
- No read-aloud / TTS, no screen-reader pass (worth its own item).
- No "where to find this" hints on locked cards (Q4).
- No Phase-2 keyboard cards (`, . /`). When they land they set `topic: 'keyboard'` and inherit all of
  this for free. The Q-P2a "how do their code lessons reach L20" decision stays in the semicolon spec.

## 8. Risks & residual risk

- **Topic calls are judgement.** Hedy Lamarr is placed on THE NETWORK, Windows 95 on TECH CULTURE,
  `ascii` on CODE. Someone will disagree. This is cheap to fix: data only, no save impact, one line
  per card.
- **Thin shelves.** Five topics hold 4–7 cards. That is fine for a collect-them-all wall, but
  NUMBERS at 7 vs MACHINES at 17 looks lopsided. Accepted; growth will come from future cards.
- **The topic denominator grows on unlock** (§3.4). At Level 20 MACHINES jumps from `n/13` to
  `n/17`. `n` never drops, the jump comes with a room the player has just opened, and the bank shelves
  keep their own unmoved counts. It is still the closest this design comes to "a number getting
  worse", which is why it is Q3 and not decided here.
- **Muscle memory.** Space no longer leaves the gallery. A child who learned "Space goes back" now
  opens a card instead, which is harmless, and Escape still leaves. The integration tests that leave
  via Space must change *with* the onboarding.md edit, in that order (testing.md rule 1).
- **Cursor geometry is the fragile part.** Row-wise ↑/↓ over a reflowing grid that crosses shelves.
  Integration tests must assert reachability (every cell reachable) and never pixel positions
  (testing.md rule 4). Play it twice (playtest.md).
- **Locked-word leak through an attribute** (§5.2). It is the one way this feature could break
  INV-29, so INV-206 tests it explicitly.
- **Residual, unmitigated:** a 4–5-year-old cannot read HACKERS or THINKING COMPUTERS. The topic view
  serves the parent and the older player, and that is a real limit, not a defect. The child's win is
  the detail view, re-reading a card with a grown-up.

## 9. Phased rollout

| Phase | Ships | Visible? | Revert |
|---|---|---|---|
| **1 — Topics as data** | `CARD_TOPICS`, `topic` on all 85 records, `topicOf`/`groupByTopic`, INV-200/201/202/214 | no | delete the field + helpers |
| **2 — BY TOPIC view** | `collectionTopicShelves`, `T` toggle, title/hint strings, per-card locked-glyph rule, INV-203–207 | yes (opt-in key) | remove the `T` branch; BY PLACE is untouched |
| **3 — Cursor + detail** | cursor, Space/Enter → panel, `cardPlace` (main.js + hub.js adopt it), `Slots.slotCompleted`, `codeFact` gating; onboarding.md edited FIRST; INV-208–213 | yes | remove the panel + cursor; restore Space → picker |

Phases 2 and 3 are independent of each other. Either can ship first after Phase 1. Close-out for 2
and 3: `game-player` plays the gallery twice on a seeded save, then erases and plays fresh
(playtest.md §The Second Run). Run the `family-parent` persona (three slots, so browsing a
non-active slot's `codeFact` is exercised). Capture both views and the detail panel for each bank;
the content-librarian then refreshes `docs/features/history-cards.md`.

## 10. Acceptance criteria — candidate invariants

**Reserved block: INV-200..219**, far above the current high-water mark (INV-170), per STRATEGY.md
§"Reserving INV numbers while a spec is unbuilt". Re-base into §5 when built. Expected values are
derived from the card modules and this spec, never copied from engine code.

- **INV-200** (L0/L1) **Every card has exactly one known topic.** For every record in
  `HISTORY_CARDS ∪ WING_CARDS ∪ ACT_CARDS ∪ KEY_CARDS`, `typeof topic === 'string'` and it is an `id`
  in `CARD_TOPICS`. *Source:* this spec §3.1/§5.1; product.md §History Cards (the reserved `topic`).
- **INV-201** (L1) **The vocabulary is clean.** `CARD_TOPICS` ids are unique; headings are
  uppercase `[A-Z ]`, ≤ 18 characters, and equal to no bank shelf heading (`THE CABINETS`,
  `THE KEYBOARD`, `THE HARDWARE`, `ACT n · …`). *Source:* §5.1; `screens.js:278` (the duplicate-heading
  defect).
- **INV-202** (L1) **Topics never move a bank count.** `TOTAL_CARDS === HISTORY_CARDS.length`. For
  a set of seeded saves, `bankProgress(bank, ids)` for all four banks and every `collectionShelves()`
  count are identical with and without `topic` fields present (compare against topic-stripped copies
  of the records). *Source:* INV-96/100/104/106; §4.
- **INV-203** (L1) **BY TOPIC is a partition of BY PLACE.** For every (`furthestLevel` ∈ {1, 12, 13,
  15, 19, 20, 25}, `collectedIds`, `bypass`), the card ids across `collectionTopicShelves()` equal the
  ids across `collectionShelves()`, each exactly once. No topic shelf is empty, and shelves follow
  `CARD_TOPICS` order. *Source:* §3.3, INV-106 (reachability).
- **INV-204** (L1) **Topic counts are scoped.** Each topic shelf's `found` = owned ∩ its cards and
  `total` = its cell count. Σ topic `found` = Σ BY PLACE `found`. Topic counts are never formatted as
  `KEYBOARD CARD n OF m`. *Source:* §3.4; INV-100.
- **INV-205** (L1) **A numerator never drops.** For save B ⊇ save A (superset of ids, `furthestLevel`
  ≥), every topic shelf present in A has `found` in B ≥ its `found` in A. *Source:* §3.4; product.md
  §History Cards ("never makes an existing save read as less complete").
- **INV-206** (L2) **Locked tiles keep their secret in both views.** On a slot at `furthestLevel` 13
  without `key-semicolon`, in BOTH views: the locked semicolon tile's text is `;` + `???`; no
  element in `#collection-screen` has text or any attribute matching `/semicolon/i`; every other
  locked tile reads `???` only. *Source:* INV-29, INV-140; §5.2.
- **INV-207** (L2) **The gallery opens the same way every time, and stores nothing.** Opening from
  the picker lands BY PLACE, scrolled to the top, with the cursor on the first cell. This holds on a
  re-open after toggling to BY TOPIC, opening a detail and leaving. `T` toggles both ways. A full
  session (toggle, move, open, close, leave) leaves `localStorage` byte-identical. *Source:* §3.6;
  playtest.md §The Second Run.
- **INV-208** (L2) **Keyboard-only and read-only.** From the first cell, arrow keys alone reach every
  cell in both views. Escape returns to the picker. The active slot is unchanged after browsing a
  non-active slot. *Source:* §5.3; onboarding.md (C opens the gallery; it never changes the active
  game).
- **INV-209** (L2) **The detail opens only on an owned card.** Space/Enter on an owned cell shows
  `#collection-detail`; on a locked cell (secret included) the screen, scroll position and panel are
  unchanged and no sound plays. *Source:* §5.3, §4.
- **INV-210** (L1/L2) **The detail shows the card's own fields.** For one card from each bank plus
  the secret card: the panel shows `cardPlace(card)`, `title`, `year`, `word` exactly as stored,
  `fact` (`literacyFact` for keyboard), and `topicOf(card).heading`. It never shows the slot's player
  name. *Source:* §5.3. *(Static half:* the panel code contains no `innerHTML`.)
- **INV-211** (L2) **`codeFact` is earned per save.** With two slots, A (`completed['20']` true) and B
  (false), and the picker cursor on A while B is browsed: B's semicolon detail has no `IN CODE` line;
  A's has exactly `codeFact`. WOPR `selectBypass` does not change B's answer. Regression: on A, the L13
  beat's LEVEL COMPLETE card still matches neither `code`/`codeFact` nor
  `/CODER|PROGRAMM|INSTRUCTION/i` (INV-161 unchanged). *Source:* semicolon spec §3.2/§4; §5.3.
- **INV-212** (L2) **Never during play.** Across the game, pause, LEVEL COMPLETE, victory and
  cinematic screens, no key sequence shows `#collection-screen` or `#collection-detail`. The gallery
  is reachable only from the slot picker. *Source:* product.md One Rule / §2; §3.5.
- **INV-213** (L2) **Detail navigation.** In the panel, ←/→ visit only owned cards in view order and
  stop (no wrap) at the ends. Escape/Space/Enter close it with the gallery cursor on the last card
  shown. *Source:* §5.3.
- **INV-214** (L1) **No card is ever dropped by grouping.** `groupByTopic` given a synthetic card
  with an unknown topic returns it on a trailing `MORE CARDS` shelf, never omits it. *Source:* INV-103;
  §5.1.

## 11. Open questions for Trevor

1. **Q1 — The vocabulary.** Ten topics (§5.1 table), or fold some? *Recommendation: keep ten.* If you
   want fewer, fold `ai` into `code` and `learning` into `games` (eight topics). Also check the
   headings, especially **HACKERS** (does it carry "curiosity, not crime", or should it be CURIOUS
   HACKERS?). Then skim Appendix A for any card you would place differently.
2. **Q2 — Space opens a card in the gallery.** Today Space leaves the gallery. *Recommendation: yes,
   Space/Enter open the highlighted owned card and only Escape leaves,* following onboarding.md's
   "Space advances" rule. It is a key-contract change, so it needs your sign-off before onboarding.md
   is edited.
3. **Q3 — Topic shelf counts.** `♢ n / m` (the denominator can grow when a new room's cards join the
   topic, as MACHINES does at Level 20), or found-only? *Recommendation: `n / m`.* The numerator never
   drops, the bank shelves keep their counts, and a growing total next to a newly opened room reads
   as "more to find", not "less done".
4. **Q4 — Locked cards in the detail view.** Open nothing (recommended; it matches the "locked
   cabinets give no unlocks-at hint" ruling), or show a gentle `HIDDEN IN A CABINET · KEEP PLAYING`
   (never for the secret card)?
5. **Q5 — Remember the chosen view?** *Recommendation: no.* It opens BY PLACE every time, and
   remembering would be a storage-schema change (and a `/security-review`) to save one keypress.
6. **Q6 — Ship order.** After the §1.1 merge, and before or after the Stats Cabinet (§1.2)? Both
   touch "look back at what you did". *Recommendation:* Phase 1 any time (it is invisible), then
   Phase 3 (detail) before Phase 2 (topics), because re-reading a card is the child's win.

---

## Appendix A — Draft topic assignment (85 cards; curator draft, Trevor ratifies)

Card ids from `js/history-cards.js` and `js/key-cards.js` as of 2026-11-04 (76 arcade, 4 wing, 4 act,
1 keyboard). One line each in the code; the builder transcribes, never re-decides.

| Topic | Cards |
|---|---|
| **keyboard** (4) | `home-row-bumps`, `qwerty-keyboard`, `newline-crlf`, `key-semicolon` |
| **math** (7) | `equals-sign`, `eulers-polyhedron-formula`, `odd-and-even`, `seven-bridges`, `prime-numbers`, `modular-arithmetic`, `george-boole` |
| **code** (12) | `java-jdk`, `ls-command`, `ada-lovelace`, `grace-hopper`, `y2k-bug`, `ascii`, `hello-world`, `word-software`, `unix`, `unix-epoch`, `rubber-duck`, `equality-vs-assignment` |
| **machines** (17) | `floppy-disk`, `the-mouse`, `the-pixel`, `commodore-64`, `intel-386`, `eniac`, `flash-memory`, `first-hard-disk`, `first-gui`, `altair-8800`, `intel-486`, `ne555-timer`, `mark-ii-moth`, `hw-disk-ii`, `hw-cd-rom`, `hw-apple-iie`, `hw-mpc-badge` |
| **network** (9) | `hedy-lamarr`, `the-web`, `arpanet`, `first-email`, `56k-modem`, `ipv4`, `wi-fi`, `first-bbs`, `acoustic-coupler` |
| **ai** (5) | `hal-9000`, `alan-turing`, `eliza`, `artificial-intelligence`, `wargames-joshua` |
| **hacking** (11) | `brain-virus`, `hack-word`, `war-dialing`, `trashing`, `legion-of-doom`, `phone-phreaking`, `masters-of-deception`, `hacker-ethic`, `hacker-manifesto`, `phrack`, `2600-magazine` |
| **games** (8) | `atari-founded`, `pacman-pizza`, `colossal-cave`, `zork`, `act1-quarter`, `act1-marquee`, `act1-attract`, `act1-initials` |
| **learning** (5) | `reader-rabbit`, `gizmos-gadgets`, `oregon-trail`, `rockys-boots`, `stickybear-typing` |
| **culture** (7) | `apple-founded`, `intel-founded`, `ibm`, `spam-origin`, `cyberpunk`, `windows-95`, `oreilly-animals` |

The judgement calls, so they can be challenged quickly:
- `1=1` → math and `1==1` → code. The pair is split on purpose (§3.1).
- `george-boole` → math, not code. The card is about true/false as *math*.
- `grace-hopper` → code (the bug story). `mark-ii-moth` → machines (the relay it jammed). That
  matches the cards' own person/artifact split.
- `hedy-lamarr` → network (frequency hopping → Wi-Fi); `acoustic-coupler` → network (computers
  talking over a phone).
- `alan-turing` → ai. The card's question is "can a machine think?"
- `wargames-joshua` → ai (a computer that learns), not games.
- `stickybear-typing` → learning, not keyboard. `hw-apple-iie` (lowercase) → machines, not keyboard.
  Both were close.
- `windows-95` → culture (the Start button as a shared memory), not machines.
- The four `act1-*` cards → games. They are about the arcade *machine as a place to play*.
