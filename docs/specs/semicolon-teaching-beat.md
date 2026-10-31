# THE KEY HAS A NAME — the Level 13 semicolon beat, and the symbol-card mechanism it founds

## Product spec / ADR — a one-time teaching beat, a fourth card bank, and an amended INV-29

*Written 2026-10-31 by the product-manager agent. Revised the same day with Trevor's decisions,
relayed by the orchestrator: every Phase 1 open question was answered, and one new direction was
added — **the name is taught at Level 13, and the programming meaning waits for the Level 20
terminal.** No question blocks Phase 1. §11 lists only what is still open for Phase 2.*

**Fact source:** **`research/wiki/tech/semicolon.md`** (arcade-historian, 2026-10-31). Every
player-facing sentence below is quoted or honestly shortened from it, and each one cites the
section it comes from. Three rules come from that page and bind this spec:
- **"first printed"**, never "invented";
- **never 1494** (the sourced print date is February 1496);
- for code, **"many", not "every"**, and **"instruction", not "line"**. The old confession line,
  "PROGRAMMERS END EVERY LINE WITH IT;", is false.

---

## 1. Recommendation

**Build Phase 1 now: the mechanism, with the semicolon only.**

**At Level 13.** The first time a saved game plays Level 13, the word **`semicolon`** is served as
one guaranteed pattern **at intro index 4**, just after both of the level's new keys (C and comma)
have each appeared once. The child types it like any word; the wrong-key contract is untouched.
When the last letter lands, three things happen and none of them pauses play:
- a non-modal caption of **exactly two literacy lines** appears in the gap band:
  `ITS NAME IS SEMICOLON.` / `IT CAN JOIN TWO SENTENCES.`
- the `;` key glows on the keyboard guide;
- a **keyboard card** is credited at once.

The card is also revealed on that play's LEVEL COMPLETE panel. **No code meaning appears anywhere
at Level 13.**

**At Level 20.** The code meaning lands when the player meets the terminal. The existing one-time
eighth-key confession becomes two variants:
- variant A, for a save that met the name at Level 13:
  `YOU MET ITS NAME AT LEVEL 13.` / `MANY CODERS END AN INSTRUCTION WITH IT;`
- variant B, for a save that never met it: the same second line under the existing anonymous
  first line, `THE EIGHTH KEY HAS A NAME.`

**The Level 20 reveal is the couplet only, with no upgraded card state.** The gallery today shows a
card's word and title, never its fact (`js/ui/screens.js:349–356`), so an "upgraded card" would
need a card-detail view that does not exist. The record carries the `code` line and `codeLevel`,
so that view can render it later, derived from `completed[codeLevel]`, with zero storage.

**Bank, latch and counts.**
- The card lives in a **new fourth bank, `KEY_CARDS`** (Trevor, Q1), so `TOTAL_CARDS` stays 75.
- The **collected card id is the latch** (Q2), which needs no new storage.
- On the beat play the keyboard card **takes that play's one card slot**, and the Level 13
  rotation counter does not advance (Q4).

**INV-29** narrows to: "the word lives in one data module, and renders only on the beat, the
keyboard card, and an owned gallery tile, never before Level 13".

**The Survival defect.** A suspected existing defect (a Survival timeout can destroy a guaranteed
word, after which the level can never end) goes to test-engineer as a `TF` first. Per Trevor, it is
then fixed by **re-queueing the word and keeping the clock**. The beat itself is clock-exempt.

## 2. The problem

- **The eighth key is typed from Level 4 onward and never named.** The `;` glyph shows everywhere
  (INV-140) and the word is withheld (INV-29).
- **The only disclosure is false.** The Level 20 confession (`js/main.js:54`,
  `EIGHTH_KEY_CONFESSION`) says `PROGRAMMERS END EVERY LINE WITH IT;`. The research shows
  otherwise (semicolon.md §4): Python needs one only to put two statements on one line;
  JavaScript and Go insert it for you; and in C, `{`, `}`, `if (…)` and blank lines carry none.
  The house rule is that an egg asserting something false is worse than no egg (easter-eggs.md).
- **Children do not know what most symbol keys are called.** Trevor's examples: parentheses,
  curly braces, slash and backslash. Each symbol has a literacy lesson (its name, and what it does
  in writing) and a code lesson. The game currently teaches only the reach.
- **The backlog's "`;` card needs a ruling" is resolved by this spec.** The ROADMAP §2
  math-vs-code row puts `;` at Level 4. Trevor's ruling: the name and the writing role are taught
  at Level 13, and the code role at Level 20.

## 3. Option space

### 3.1 Vehicle

| Option | Reach | Cost to player | Risk | Effort | Reversible |
|---|---|---|---|---|---|
| Status quo (L20 couplet only) | every L20 clearer | none | name never taught; couplet false | 0 | — |
| Word in the L13 pool | probabilistic | none | not guaranteed | XS | yes |
| Arcade history card at L13 | 1 play in N (L13 already rotates `grace`, `pacman`, `cave`) | none | TOTAL_CARDS rises; lesson arrives on a random visit | S | yes |
| **Dedicated beat + keyboard card ✅** | first L13 play, guaranteed | ~9 keystrokes, no pause | collisions designed out (§5.2, §5.7) | M | yes: an empty `KEY_CARDS` makes it inert |
| Modal "did you know" | guaranteed | **stops flow** | One Rule violation (product.md §2) | S | — |

### 3.2 Where the code meaning lands (Trevor: not at L13)

| Option | Storage | UI | Teaches when |
|---|---|---|---|
| **Couplet only (A/B variants) ✅** | none | none new (the existing confession element) | first L20 clear |
| Couplet + upgraded card state (code line appears on the card) | none (derived from `completed['20']`) | **a gallery card-detail view, which does not exist**; the gallery shows word + title only | whenever the child opens the gallery |
| Code line in the L20 terminal theme's scrolling output | none | a `js/themes/terminal.js` change | during L20 play, possibly mid-flow |

The couplet already exists, already fires once, and already sits at the moment the computer is
earned. The upgrade is deferred to the gallery/topics follow-on spec, where the detail view
belongs. The record fields are reserved now (§5.1), so that later spec adds no new data.

### 3.3 Latch (decided: the collected card id)

| Option | New storage | Legacy save past L13 | Quit before the beat | WOPR to L13 |
|---|---|---|---|---|
| `completed['13']` | none | never sees the beat | beat again | fires |
| **Collected id `key-semicolon` ✅** | none (`kk-slots` `cards` is a string-id list, `js/slots.js:181`) | sees it on the next L13 replay | beat again | fires |
| A new progress field | **schema change, needs `/security-review`** | — | — | — |

## 4. Per-surface verdict

| Surface | Verdict |
|---|---|
| L13 curriculum play, card not collected | ✅ The beat: two literacy lines, glow, credit. **No code line.** |
| L13 LEVEL COMPLETE on the beat play | ✅ The keyboard card, **literacy fact only**, even on a save that has already cleared L20 (WOPR order) |
| L13 replay after collection | ⏸️ No beat. The arcade rotation is untouched. No recurrence (Q8 accepted). |
| Free Play | ❌ Never. |
| Survival | ✅ The beat pattern is clock-exempt (§5.7). |
| Collection gallery | ✅ A new KEYBOARD shelf. Locked tile = glyph + `???`; owned = `SEMICOLON` + title |
| Slot-picker `★` | ⚠️ LEAVE IT on the arcade bank |
| L20 first clear | ✅ The **code reveal**: couplet variant A or B (§5.8) |
| Card upgrade after L20 | ⏸️ Deferred to the topics/gallery-detail spec (fields reserved) |
| Level 4 / easter eggs / title / console | ❌ No change. The word must not leak through the hidden layer. |
| Phase 2 symbols | ✅ Same mechanism. Each one gated on its own historian pass. Shift symbols ✋ deferred (Q9 accepted). |
| `=` | ❌ No card. `1=1` / `1==1` already teach it. |

## 5. Design

### 5.0 What it reuses

All of these exist and are reused as they are:
- `wordToTokens`, `patternMatchesCard`, and the `cardPending` win gate (`js/main.js:981`);
- `Slots.collectCardId` / `collectedIds`;
- `bankOf` / `bankProgress` / `cardById` (`js/history-cards.js`);
- the LEVEL COMPLETE card reveal (`js/main.js:1244–1270`);
- the confession renderer `renderEighthKeyConfession` (`js/main.js:1147`);
- the gallery shelves (`js/ui/screens.js`).

Five pieces are new:
- the splice index;
- the caption;
- the key glow;
- the beat's clock exemption;
- the couplet's variant selection.

### 5.1 The per-symbol record (new module `js/key-cards.js`)

```js
export const KEY_CARDS = [
  { id: 'key-semicolon',
    topic: 'keyboard',      // RESERVED. See the note below the code block.
    glyph: ';',             // what the guide glows; what a locked gallery tile shows
    keys: [';'],            // engine tokens producing the glyph (Phase 2b: ['Shift','9'] …)
    word: 'semicolon',      // the beat word = the card's moment word
    level: 13,              // card level = max(L_key, L_name). Derived and pinned by INV-153
    title: 'THE SEMICOLON',
    year: '1496',           // first PRINTED, Venice, Feb 1496 (semicolon.md §2). NEVER 1494.
    literacy: ['ITS NAME IS SEMICOLON.', 'IT CAN JOIN TWO SENTENCES.'], // caption, exactly 2 lines
    literacyFact: "Its name is semicolon. Semi means half. A semicolon can join two sentences that belong together. It was first printed in 1496, in Venice.",
    codeLevel: 20,          // where the CODE lesson lands (the terminal). See the rule below.
    code: 'MANY CODERS END AN INSTRUCTION WITH IT;', // delivered by the L20 couplet in Phase 1
    codeFact: 'In many programming languages, a semicolon marks the end of an instruction.', // reserved for the future card-detail view
    source: 'research/wiki/tech/semicolon.md' },
];
```

**The `topic` field.** It is reserved now and nothing reads it in Phase 1. Trevor wants every card
in every bank to carry a topic later (math / programming / hacking / tech culture / the
keyboard…) so the gallery can group by topic. That is a **separate follow-on spec**. It touches:
- `HISTORY_CARDS`, `WING_CARDS` and `ACT_CARDS` in `js/history-cards.js`, plus `KEY_CARDS` here;
- the shelf builder in `js/ui/screens.js`.

The same follow-on spec is the natural home for the card-detail view that would show `codeFact`.

**Where each sentence comes from:**

| Sentence | Source (semicolon.md) | Honest shortening |
|---|---|---|
| `ITS NAME IS SEMICOLON.` (22 chars) | §1 name | — |
| `IT CAN JOIN TWO SENTENCES.` (26) | §3, Purdue OWL "link two independent clauses" | drops "that belong together" for the 34-char line limit. The card fact restores it. Still true, because of "can". |
| "Semi means half." | §1, "Safe: semi means half." | on the card only. Adding it would make caption line 1 39 chars. |
| "first printed in 1496, in Venice" | §2, De Aetna, Feb 1496 | "first printed" is the sourced verb |
| `MANY CODERS END AN INSTRUCTION WITH IT;` (39) | §4, "What this licenses" | Trevor's wording; "many" and "instruction" are kept |
| codeFact | §4, the page's "Safe:" sentence, verbatim | — |

**What the page rules out:**
- **No pronunciation respelling.** The page sources no pronunciation, so Q12 resolves to none.
- **Never describe `;` as ending a sentence** (§5); a period does that. That is why "join" is the
  writing verb and "end" is kept for code.
- **No Greek-question-mark trivia in game.**

**Attachment rules (generalising INV-56):**
- `level = max(L_key, L_name)`:
  - `L_key` is the first level whose unlocked keys include every token in `keys`. Shift is the
    level whose `newKeys` contains `'Shift'`, which is L24.
  - `L_name` is the first level at which `word` is spellable.
  - For the semicolon: `;` arrives at L4; the name's letters at s/l L3, e/i L6, o L9, m L11,
    n L12, **c L13**. So the card level is **13**, verified against `js/levels.js`.
- `codeLevel = level ≥ 20 ? level : 20`. The **terminal** is Level 20 (act4.md); in the data it is
  the level whose `newKeys` are `['1','0']`.
  - A symbol unlocked **before** the terminal gets its literacy lesson at its card level and its
    code lesson at L20.
  - A symbol unlocked **at or after** the terminal gets both together at its own level. Its caption
    is then `literacy[0]` plus `code`.

### 5.2 Trigger, latch, position, credit (`js/main.js` `startGame` / pattern-complete)

**Arming.** Inside the existing `!state.freePlay` card block: if
`keyCardForLevel(state.level, Slots.collectedIds())` returns a record (the first uncollected one
in array order):
- set `state.currentCard = record` and `state.keyBeat = record`;
- **skip `pickGuaranteedCard` and skip `bumpCardRotation(level)`**;
- allow at most **one beat per play**.

**Splice.** The beat goes at index `p = 1 + max over level.newKeys of (first intro index containing
that key)`, clamped to `[1, intro.length]`.
- For L13 (`c` first at 0, `,` first at 3), that gives **p = 4**.
- The generic card splice at `intro.length` is skipped for a beat. Use the `actCardSpliced` flag
  pattern (`js/main.js:1656`) so the word is never spliced twice.
- Why not the Name Moment slot: at 1× the post-intro slot is effectively the last pattern. Myst's
  gate (`PAGES_TO_WIN = 22` correct keys) is long met by the 38 intro keystrokes, so the caption
  would only ever show over the victory animation.

**Gate and winnability.** The existing `cardPending` holds the level open until the word is typed.
Three facts make that always reachable:
- p is less than `intro.length`;
- `getNextPattern` refills infinitely;
- Myst's `pagesRead` counts every correct key and only ever grows, so the theme-authoring.md
  accumulator pitfall cannot arise.

**Credit.** On completing the beat pattern, call `Slots.collectCardId(state.keyBeat.id)`
immediately and store the returned `isNew` in `state.keyBeatNew` (the TF-T1 / `wakeUp()` lesson):
- Escape after the beat keeps the card.
- Quitting before the beat means it comes back on the next L13 play.

**Overlay.** The existing reveal is used with four changes:
- the body text is `literacyFact`, **never `codeFact`**;
- `isNew` comes from `state.keyBeatNew`;
- the count line reads `KEYBOARD CARD n OF m` from `bankProgress('keyboard')` (Q11 accepted), so
  Phase 1 shows `KEYBOARD CARD 1 OF 1`;
- the word shown is `SEMICOLON`.

**Name Moment at L13** (e.g. `chloe`). Its slot (`intro.length + (card ? 1 : 0)`) lands after p, so
the two guaranteed injections are never adjacent (INV-164).

### 5.3 What the player sees

1. The word is just the next prompt, letter by letter. **Wrong-key contract unchanged:** nudge, the
   letter waits, the mistake is logged, and the correct key advances.
2. On the last letter:
   - a key-name flourish on the prompt letters: its own class, not the Name Moment's personal gold,
     never `--nudge-red`; `spawnSparkles` may be reused;
   - the `;` key glows on the guide for the caption's lifetime;
   - an optional gentle chime that nothing depends on.
3. **The caption** (a new, empty `#key-name-caption` element, filled with `textContent`):
   - **Content:** exactly two lines, both literacy: line 1 at completion, line 2 about 1.5 s later.
   - **Placement:** the **gap band, ~0.43–0.49H, centred within 0.22–0.78W**, directly above the
     glowing key. If Myst's composition claims that band, fall back to the top band (0–0.19H
     between the HUD corners). Screenshot both.
   - **Lifetime:** it stays until **both** ≥10 s have passed **and** 3 more patterns are done
     (Q7 accepted), then fades. The fade is cosmetic.
   - **It never** takes focus, blocks a key, or delays the next prompt. It is removed on level end,
     pause, Escape and screen change.
4. At LEVEL COMPLETE: the keyboard card, which carries the fuller literacy lesson at the child's own
   reading pace.

**A non-reader** still gets three things:
- they *type* the word (the prompt shows the letters);
- they *see* `;` glow at the moment the word completes, which ties the word to the key;
- they keep a card.

The caption is short enough for a parent to read aloud. **There is no audio dependency** (it works
muted, headless, and for deaf players).

### 5.4 Gallery (`js/ui/screens.js`)

- The KEYBOARD shelf is visible once `furthestLevel ≥ min(KEY_CARDS.level)`, or under bypass.
- An owned tile shows `card.word.toUpperCase()` + `title`.
- A locked tile shows **glyph + `???`**. The glyph is always allowed (INV-140); the word never is.

### 5.5 Settings

- **EXPERIENCE:** one beat at every tier.
- **MIN/MAX word length:** the beat is spliced guaranteed content, never drawn from
  `drawablePool`, so it is never filtered (product.md §Word Length).
- **Hints / Mistakes shown:** unchanged.

### 5.6 Free Play, WOPR, replays, erase

- **Free Play:** guarded out.
- **WOPR into L13:** the beat fires.
- **Replays after collection:** no beat.
- **Erasing a game:** clears that slot's `cards`, so the beat returns for the new player.

### 5.7 Survival (decided: Trevor, Q5)

- **The beat:** `startSurvivalPatternTimer` starts no clock and hides `#survival-timer-track` while
  the current pattern is the armed beat. `handleSurvivalTimeout` therefore cannot replace it, and
  no quarter is lost on a lesson. The clock resumes on the next pattern.
- **Every other guaranteed word: suspected existing defect, confirm first.**
  - `handleSurvivalTimeout` (`js/main.js:741–756`) overwrites the current pattern with
    `drawRandomPattern()`.
  - If that pattern was a history-card word, a Name Moment word or the L24 name, it is not in the
    pool and never returns.
  - `cardPending` / `namePending` / `l24NamePending` then stay true, so **the level can never be
    won.**
  - No test covers this. **Order:**
    1. test-engineer writes `TF-nn` + `t.todo` and reproduces it;
    2. the Engine lane fixes it by **re-queueing the guaranteed pattern**: re-splice the same
       tokens at `currentPattern + 1`, after the fresh replacement, **and keep the clock** (Trevor:
       guaranteed words are NOT clock-exempt — only the beat is);
    3. INV-167 turns green.
  - This fix is its own PR and does not block Phase 1. The beat is already protected by its
    exemption.

### 5.8 The Level 20 code reveal (`EIGHTH_KEY_CONFESSION`)

The latch is unchanged: the first L20 clear per save, `!getProgress().completed['20']`, read before
`recordLevelComplete`.

| Variant | Condition | Line 1 | Line 2 |
|---|---|---|---|
| **A: builds on L13** | `key-semicolon` is in `Slots.collectedIds()` | `YOU MET ITS NAME AT LEVEL 13.` | `MANY CODERS END AN INSTRUCTION WITH IT;` |
| **B: anonymous** | not collected (WOPR jump to L20, or a save that cleared L13 before this shipped and never replayed it) | `THE EIGHTH KEY HAS A NAME.` | `MANY CODERS END AN INSTRUCTION WITH IT;` |

- **Line 2 is read from the record's `code` field** (imported from `js/key-cards.js`), so the code
  sentence has one source. `js/main.js` holds only the two line-1 literals.
- Both variants end with the `;` glyph. **Neither contains the word "semicolon"**, so `js/main.js`
  stays off the INV-29 allowlist.
- "EVERY LINE" is gone.
- Each line must render on **one** line of the confession element at 1280×800. Line 2 is 39 chars
  against the old 35, so the builder screenshots it. If it wraps, reduce the letter-spacing; never
  rewrite the sentence.
- Variant B is still true for a save that never met the name: the key does have a name, and line 2
  is a true statement about it.

### 5.9 Phase 2: the symbol table (verified against `js/levels.js`)

| Glyph | Name word | L_key | L_name | **Card level** | **codeLevel** | Must not retell |
|---|---|---|---|---|---|---|
| `;` | semicolon | 4 | 13 | **13** | **20** | — (Phase 1) |
| `,` | comma | 13 | 13 | **13** | **20** | — ⚠️ shares L13 with `;`, so it waits one play |
| `.` | period | 14 | 10 | **14** | **20** | — |
| `/` | slash | 15 | 5 | **15** | **20** | the planned math-vs-code `//` card; whichever ships first owns "comments" |
| `-` | hyphen | 21 | 12 | **21** | 21 | `wi-fi` |
| `=` | — | 21 | — | **no card** | — | `1=1`, `1==1` |
| `[ ]` | bracket | 22 | 13 | **22** | 22 | — |
| `\` | backslash | 22 | 13 | **22** | 22 | `\n`, `\o/` (never retell the escape) |
| `` ` `` | backtick | 23 | 13 | **23** | 23 | `` `hack` `` |
| `'` | apostrophe | 23 | 10 | **23** | 23 | L23's contraction drills |
| `( )` | parentheses | 24 | 12 | **24** | 24 | ✋ input contract (Q9: deferred) |
| `{ }` | braces | 24 | 13 | **24** | 24 | ✋ |
| `:` | colon | 24 | 13 | **24** | 24 | ✋; must not retell `;` |

- **Pre-terminal symbols** (`; , . /`): literacy at their card level, code at L20. The `;` code
  lesson is the couplet. How the other three deliver theirs at L20 is the one remaining Phase 2
  question (Q-P2a).
- **Post-terminal symbols:** the caption is `literacy[0]` + `code`, and the card fact is
  `literacyFact + ' ' + codeFact`.
- **The L21–24 cluster:** one beat per play, never adjacent to another guaranteed injection.
  - L22 and L23 hold two symbols each, so each needs two plays.
  - L24's beat (once unblocked) sits at p, and the capitalised name at `intro.length`.
- **Math-vs-code reconciliation:** its `;`-at-L4 entry is **superseded**. Its other entries remain
  *arcade history* cards (a moment in time); keyboard cards cover what a key is called and does.
  The last column keeps the two from retelling each other.

## 6. Safety & privacy

- **No free text or user input** reaches any new surface. Caption, card and couplet are fixed
  literals from a code module, written with `textContent` (security.md rules 1–2).
- `index.html` gains only an **empty** `#key-name-caption` element.
- **No schema change.** One more string id joins the per-slot `cards` array. No new PII (rule 8).
- **A tampered save** (rule 4) holding `key-semicolon` only flips the couplet to variant A and names
  the tile on that save. It is harmless, and no code path changes.
- **Static host:** `js/key-cards.js` is a new ES module and must pass
  `node scripts/static-host-check.mjs` in both host shapes. No `/api/*` call is involved.
- **`/security-review` is not triggered.** None of security.md's triggers are present: no
  variable-fed HTML sink, no hook, no child process, no schema change, no free-text input.

## 7. Non-goals

- No code meaning at Level 13, on any surface.
- No upgraded-card state or gallery card-detail view in Phase 1.
- No `topic` grouping: the field is reserved, and the feature is a separate spec.
- No audio, text-to-speech or pronunciation respelling.
- No change to Level 4 or to the eighth key's voice before Level 13.
- No modal, no pause, no quiz.
- No beat in Free Play, the wings, Act 6 or the L25 coda.
- No change to `★` or `TOTAL_CARDS`.
- No engine input-contract change.
- No new arcade cards.
- The general Survival re-queue fix is its own PR.

## 8. Risks & residual risk

- **The caption goes unread.** The card repeats the lesson at a pause point; the residual risk is a
  child who also skips the overlay.
- **The shortened role line.** Losing "that belong together" means the caption alone could be read
  as "any two sentences". The card restores the full sourced sentence.
- **Myst art in the gap band.** Verify by screenshot; the top band is the fallback.
- **The code lesson arrives only at L20.** A child who stops before L20 learns the name but never
  the code role, which is by Trevor's design.
- **Couplet line 2 is 39 chars.** It may wrap; §5.8 says how to handle that.
- **INV-100-class counter bugs** in a fourth bank. INV-154 guards against them.
- **The Survival hang** is pre-existing. This spec neither causes nor worsens it, and the beat is
  protected.
- **Unmitigable:** a child may hear "colon" as the body part. Only a person in the room fixes that.

## 9. Phased rollout

| Phase | Ships | Revert |
|---|---|---|
| **0: docs first** | §9.1 edits; the research page has already landed | git revert |
| **1: mechanism + `;`** | `js/key-cards.js` (1 record); bank plumbing; beat, caption, glow, credit, beat clock-exemption; L20 couplet A/B; gallery shelf; INV-29 amended; INV-153..166; played twice + fresh | An empty `KEY_CARDS` leaves every path inert (no beat, shelf hidden, couplet variant B) |
| **1-fix: Survival re-queue** (independent PR) | TF confirmed → re-queue fix → INV-167 | revert the PR |
| **2a: `, . / - [ ] \ ` '`** | one record per symbol, **each after its own historian pass**; Q-P2a decided first for `, . /` | remove the record |
| **2b: `( ) { } :`** | after an input-contract decision (Q9 deferred) | remove the records |
| **Follow-on spec: topics + card detail** | `topic` on every bank; gallery grouping; detail view rendering `codeFact` once `completed[codeLevel]` | separate spec |

### 9.1 Docs that change FIRST (testing.md rule 1)

- **`.claude/rules/product.md`**
  - §Level 4: "Never referred to as 'semicolon'" becomes "…until Level 13 teaches its name; its
    code meaning waits for the Level 20 terminal."
  - Add **§The Key Names** beside §The Name Moment, covering §5.1–5.8.
  - History Cards: add the fourth bank and the reserved `topic`.
- **`.claude/rules/levels/act3.md`, L13:** add a teaching-beat bullet covering the name and the
  writing role only.
- **`.claude/rules/levels/act4.md`, L20:** add the code reveal (couplet A/B).
- **`.claude/rules/levels/act1.md`, L4:** amend the "never semicolon" bullet.
- **`.claude/rules/levels.md`**, word-bank table, L13 row: add `semicolon (beat)`.
- **`.claude/rules/easter-eggs.md`**, §eighth-key confession: the new couplet, its two variants,
  "EVERY LINE" recorded as corrected, and "never names the key" still true.
- **`CLAUDE.md`**
  - The ※ footnote gains "until Level 13".
  - "THREE BANKS" becomes four.
  - The "`;` card needs a ruling" sentence is replaced with the ruling.
  - Add a quick-map line.
- **`.claude/rules/tech.md`:** add `js/key-cards.js` to the tree.
- **`docs/testing/STRATEGY.md`:** amend INV-29, cross-reference INV-140, and add INV-153..167.
- **No change needed:** onboarding.md, security.md.
- **Downstream copies of the false line** (semicolon.md §Corrections lists them) are corrected in
  the same Phase 0 pass:
  - `research/wiki/culture/proposed-egg-references.md`
  - `research/hacker-culture.md`
  - `docs/features/easter-eggs.md` (via the content-librarian)

### 9.2 Build lanes (disjoint file ownership)

| Lane | Owns ONLY | Tier | Depends on |
|---|---|---|---|
| A: data | `js/key-cards.js` (new); `js/history-cards.js` (`bankOf` → `'keyboard'`, `bankProgress('keyboard')`, `cardById`, new `keyCardForLevel(level, collectedIds)`) | Sonnet | — (the strings are final in §5.1) |
| B: engine | `js/main.js` only: arming, splice index, immediate credit, caption + glow calls, beat clock-exemption, overlay `literacyFact`/`isNew`/`KEYBOARD CARD n OF m`, **the L20 couplet A/B** (`EIGHTH_KEY_CONFESSION` → two line-1 literals + `KEY_CARDS` code line) | Opus | A's exports; C's function names |
| B2: engine fix (later, separate PR) | `js/main.js` `handleSurvivalTimeout` re-queue | Opus | D's TF confirmed |
| C: UI | `index.html` (empty `#key-name-caption`), `js/ui/hud.js` (`showKeyNameCaption(lines)`, `hideKeyNameCaption()`, `glowGuideKey(glyph, on)` — all `textContent`), `js/ui/screens.js` (KEYBOARD shelf), `css/screens.css` (caption, glow, flourish) | Sonnet | A's exports |
| D: tests | `tests/**`, `docs/testing/STRATEGY.md`, `docs/testing/FINDINGS.md` (TF for §5.7) | test-engineer | Phase 0 docs |
| E: theme | `js/themes/myst.js`, **only if** the gap-band screenshot collides | Opus | B + C |
| P: play | read-only | game-player | all |

**Play gate.**
- `node scripts/playtest.mjs --at=level:13 --persona=struggling-beginner --seed=13`, twice: the One
  Rule on the beat, and no beat on the second run.
- `--persona=family-parent`: card, KEYBOARD shelf, and the L13 rotation unchanged.
- `--persona=speedrunner:survival` at L13: no clock on the beat.
- `--at=complete:20`, once with the card and once without (WOPR): both couplet variants, each on
  one line.
- Then erase the save and play fresh.

## 10. Acceptance criteria: candidate invariants

**INV-29 (amended).** *Source: product.md §Level 4 + §The Key Names (Trevor 2026-10-31);
INV-140.*
- The WORD "semicolon" (case-insensitive) appears **nowhere in `index.html`**.
- In `js/**` it appears in a quoted string **only in `js/key-cards.js`**.
- The `;` glyph is never restricted.

**INV-153 (L1) Attachment.** *Source: §5.1.*
- Every `KEY_CARDS` record has `level === max(L_key, L_name)` and
  `codeLevel === max(level, terminalLevel)`. Everything is derived from `js/levels.js` `newKeys`
  (terminal = the `['1','0']` level; Shift = the `'Shift'` level).
- `word` is spellable at `level`.
- `key-semicolon`: `level 13`, `codeLevel 20`.

**INV-154 (L1) Separate fourth bank.** *Source: history-cards.js header; INV-96/100/104.*
- `TOTAL_CARDS === HISTORY_CARDS.length`.
- No `KEY_CARDS` id appears in another bank.
- `bankOf` returns `'keyboard'`, and `bankProgress('keyboard')` counts `KEY_CARDS` only.

**INV-155 (L2) The beat is served, guaranteed, and credited immediately.** *Source: §5.2.*
- On a curriculum L13 play in a slot without `key-semicolon`, the pattern at index p (derived;
  4 for L13) is `semicolon`.
- The level cannot end before it is typed.
- On its completion the id is collected **before** LEVEL COMPLETE, and Escape straight afterwards
  keeps it.

**INV-156 (L2) Latch, replay, rotation, Free Play.** *Source: §5.2, §5.6; playtest.md §Second
Run.*
- The second L13 play serves no `semicolon` and serves an arcade card.
- `getCardRotation(13)` is unchanged by the beat play.
- Quitting before the beat means the next play serves it again.
- Free Play never serves it.

**INV-157 (L2) Wrong-key contract on the beat.** *Source: CLAUDE.md §Wrong Keypress.*
- A wrong key leaves the prompt and `currentIndex` unchanged and increments that letter's mistake
  count.
- The next correct key advances exactly one letter.

**INV-158 (L2) Guaranteed under every lever.** *Source: product.md §Word Length, §EXPERIENCE.*
- At MIN=12/MAX=4, and separately at WIZARD 3.5×, the beat appears exactly once and the level is
  won.

**INV-159 (L2) Survival never clocks the beat.** *Source: §5.7; One Rule.*
- While the beat is current, `#survival-timer-track` is hidden.
- Idling past the pattern duration loses no quarter and does not replace the prompt.
- The level is won.

**INV-160 (L2) The caption: two literacy lines, non-modal, in the stage.** *Source: §5.3;
visual-validation.md layout contract.*
- After the beat, `#key-name-caption` holds **exactly two lines**, equal to
  `record.literacy[0]` and `[1]`.
- Its box intersects neither the prompt panel nor the keyboard guide.
- The guide's `;` key carries the glow class.
- The next pattern accepts a correct key immediately.
- The caption is gone by LEVEL COMPLETE.

**INV-161 (L2) No code meaning at Level 13.** *Source: Trevor 2026-10-31, "the programming
meaning is NOT revealed at Level 13".*
- Throughout an L13 beat play and its LEVEL COMPLETE overlay, `document.body.innerText` contains
  neither `record.code` nor `record.codeFact`, nor `/CODER|PROGRAMM|INSTRUCTION/i`.
- This must hold **on a save that has already cleared L20** (WOPR order).
- The overlay fact equals `record.literacyFact`.

**INV-162 (L2) The word is withheld before Level 13.** *Source: INV-29 amended.*
- Use a slot with `furthestLevel ≤ 12` and no card. Through the picker, the gallery, and L4 and
  L12 played to completion, `innerText` never matches `/semicolon/i`.
- The KEYBOARD shelf, if shown, shows only the glyph and `???`.

**INV-163 (L0) Research gate.** *Source: CLAUDE.md, "never write history from memory".*
- Every record's `source` exists under `research/`.
- No record contains a `⟦` placeholder.
- No record's text matches `/1494|invent/i`.
- No `code`/`codeFact` matches `/\bevery\b|\ball\b|\bline\b/i`. *Source: semicolon.md
  §Corrections.*

**INV-164 (L1/L2) One beat per play, never adjacent.** *Source: §5.2, §5.9.*
- No play arms more than one keyboard card.
- The beat is never at an index adjacent to a Name Moment or L24 name pattern.

**INV-165 (L1) Copy fits.** *Source: §5.1; theme-authoring.md glyph coverage.*
- Every `literacy` line is ≤ 34 chars, uppercase, and uses only the Press Start 2P charset.
- At 1280×800, each couplet line renders on one line (no wrap).

**INV-166 (L2) The Level 20 code reveal has two true variants.** *Source: §5.8; easter-eggs.md;
semicolon.md §4.*
- On a save's first L20 clear, the confession is variant A if `key-semicolon` is collected and B
  otherwise.
- Line 2 equals the record's `code` in both.
- Both end with `;`, and neither contains "semicolon" or "EVERY".
- A replay shows neither variant.

**INV-167 (L2) A Survival timeout never destroys a guaranteed word.** *Source: One Rule;
Trevor 2026-10-31 (re-queue, keep the clock).*
- With Survival on, letting the clock expire on a history-card word, a Name Moment word or the
  L24 name loses a quarter as normal **and** that word is served again later.
- The level stays winnable.
- Lands as `t.todo('TF-nn')` until lane B2 ships.

## 11. Open questions for Trevor

**Nothing blocks Phase 1. The build can start.** Q1–Q12 were answered or accepted on 2026-10-31.

These are still open, and they block Phase 2 only:

- **Q-P2a. How do `, . /` deliver their code lessons at L20?** Default: one quiet extra line under
  the couplet, but only when the save owns at least one such card, e.g. `YOUR KEYBOARD CARDS
  LEARNED THEIR CODE JOBS.`, with the lessons themselves read in the topics follow-on spec's
  card-detail view. The alternatives:
  - a line each, which crowds the panel;
  - code lines printed in the L20 terminal theme's scrolling output (`js/themes/terminal.js`),
    which fits "when the terminal is introduced" but could land mid-flow.
- **Q9 (accepted as "defer")** stays on the board. The Shift symbols need the engine input contract
  extended before Phase 2b.
