# Spec — A touch-device mode that adds to the game instead of diluting it

*Product-manager lane, 2026-09-12. Brief (Trevor): "touch typing we can layer in under a new
style of game play — maybe send a product manager and researcher off on how mobile/touch typing
could be introduced **without sacrificing the entirety of the game**."*

*Companion research: **`research/mobile-touch-typing.md`** (+ `research/wiki/pedagogy/*`), landed
2026-09-12. **Revised against it the same day** — §3.1, §5.2, §7, §8, §9, §10, §11 and §12 now
cite it; the `[needs evidence]` markers this spec shipped with are resolved and the changes are
noted inline as **[revised 2026-09-12]**. Supersedes-in-part: `docs/ROADMAP.md` §2b.*

---

## 0. The disambiguation, before anything else

Two different things are called "touch typing" in this conversation and they are near-opposites.
Every claim below states which it means.

| Term used here | Means | Input device |
|---|---|---|
| **touch typing** | typing *without looking* — home row anchoring, fixed finger-to-key assignment, ten fingers, muscle memory built on the F/J bumps | a **physical** keyboard |
| **touch-screen typing** ("glass typing") | thumbs or an index finger aiming at rendered keys, eyes on the keys | a touchscreen |

Keystroke Kingdom teaches **touch typing**. `FINGER_MAP` and `KEY_REACH` (`js/levels.js`), the
fog-of-war keyboard guide (`KEY_LAYOUT`/`getKeyGeometry()` in `js/ui/hud.js`), and the whole
curriculum order (`.claude/rules/levels.md` §"Why This Order") are finger-assignment data. None
of it means anything on glass.

Trevor's phrase "touch typing we can layer in" is therefore **ambiguous on its face** and the
ambiguity is load-bearing: layering in *touch typing* is already done (it is the game), and
layering in *touch-screen typing* is the thing this spec evaluates. This spec assumes he means
the latter — a touch-device experience — and flags it as decision 1 in §11.

---

## 1. Recommendation

**Build a touch surface, but build the reading half of the game — never the typing half.**
Keystroke Kingdom is explicitly a dual game ("young children who are simultaneously learning to
type **and** read", `product.md` §Vision). The typing half is keyboard-bound and porting it to
glass would teach the opposite skill. The reading half is not keyboard-bound, and **we already
ship two surfaces whose entire meaning lives in that half**: the history-card collection gallery
(55 authored cards, pure reading) and Act 6's **"YOUR OWN WORLD"** maker (`js/textworld/maker.js`),
whose loop is *a word is a thing you can summon* — not *your fingers know where F is*. Those two
port honestly; nothing else does.

Concretely, and in this order:

- **Phase 0 — Tier A layout tuning. Do it now, independent of everything else.** Tablet + real
  keyboard already works; only the 1280×800-measured layout fractions need verifying at tablet
  aspect ratios. Highest value per unit effort in this whole document and it compromises nothing.
- **Phase 1 — "read your cards" on glass**, reachable from the existing touch-device notice, shown
  **only when this device already holds a saved game with ≥1 found card**. Zero learning claim,
  zero new input surface, zero evidence dependency.
- **Phase 2 — the maker on glass** (word-tiles instead of typed words). This is the "new style of
  gameplay" the brief asks for. **Its evidence gate is now MET [revised 2026-09-12]:** Mayer et
  al. (*Frontiers in Psychology* 2020) trained ~145 kindergarteners (mean 5y10m) for 7 weeks and
  found the **tablet group that SELECTED letters matched pencil-and-paper and beat stylus on word
  reading and word writing** — while the tablet condition that imitated *handwriting* did worse.
  Selection-based word building on glass produces real word-level literacy gains. It is justified
  **on reading and spelling alone, and never as preparation for a keyboard** (§10).
- **Never — a rendered QWERTY keyboard on glass, in any form.** Rejected below on an argument
  stronger than "it teaches the wrong skill": it is the only input surface in the game that
  **cannot fade**, and fading the hints is how this game works.
- **Never — the 25-level curriculum, or history-card *collection*, on glass.** That is the
  "sacrificing the entirety of the game" line, and it is drawn as a testable invariant (INV-TM1).

"Do nothing" is a respectable answer here and remains correct for the curriculum. It is **not**
correct for the whole device: today a child with an iPad and no keyboard is told, warmly, to go
away, while two things we already built would work fine in their hands.

---

## 2. The problem, concretely

**What a player experiences today.** A child opens the game on an iPad with no keyboard. The
title screen shows the touch-device notice under INSERT COIN (built 2026-09-12, `js/main.js`
`initKeyboardNotice`): this cabinet wants a keyboard. It informs, never gates — and then there is
nothing. Nothing to press, nothing to read, nothing to do. The notice is well-built and correct;
the dead end behind it is the problem.

**What a parent experiences.** The most common household device for a five-year-old is the one
with no keyboard. The game's entire content library — 55 citation-verified history cards, five
text worlds, a whole arcade — is invisible on it.

**What the prior analysis said, and where it went wrong.** `docs/ROADMAP.md` §2b splits mobile
into Tier A (tablet + keyboard: "recommended, do this one") and Tier B (touch-only: two blockers,
the second "disqualifying"). Tier A is right and unchanged. Tier B's analysis has one structural
flaw: **it gives one blanket verdict to a set of unlike surfaces.** "Touch-only" is not one thing
— the 25-level curriculum, Free Play, the Act 6 prose worlds, the maker, the IM-friend and the
collection gallery have wildly different dependencies on a physical keyboard, and three of them
have none at all. §4 gives them separate verdicts.

---

## 3. Option space

Facts cited inline; fetch dates in §12.

| # | Option | Reach | What it honestly teaches | Cost to the player (dilution) | Effort | Reversible? | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | **Status quo** — notice only, decline warmly | n/a | nothing new | none | 0 | n/a | **Keep as the floor.** Every phase below degrades to it. |
| 2 | **Tier A** — tablet/Chromebook + physical keyboard; tune layout | every iPad-with-case, Chromebook, touchscreen laptop | **real touch typing**, full curriculum, unchanged | none | S | trivially | **DO IT FIRST.** Upholds §2b. |
| 3 | **OS soft keyboard + relayout** (the naive port) | phones/tablets | glass typing | high | M | yes | **Reject.** The OSK "can shrink the visual viewport without affecting the layout viewport" (MDN); the prompt, the keyboard guide and the theme scene all live exactly where it lands. Measurable via `VisualViewport`, but there is no arrangement where the thing the child must READ survives the thing they must TYPE ON. |
| 4 | **Bespoke canvas QWERTY** drawn by us | phones/tablets | glass typing | **highest** | L | yes | **Reject — see §3.1.** Three independent grounds: it cannot fade, it does not physically fit at child target sizes (≥20 cm needed vs an 11-inch iPad's 179.5 mm), and ten-finger skill buys nothing on glass (37,370-user Aalto study). *[strengthened 2026-09-12]* |
| 5 | **Tap-to-select letter tiles** (tap letters to spell a word) | phones/tablets | letter recognition + spelling | moderate — *looks* like typing | M | yes | **Defer behind option 6 — verdict softened [revised 2026-09-12].** My first draft rejected this; the research overturns the evidential half of that. Letter-tile composition IS the Montessori movable alphabet and is what **six of six** established literacy apps do (Endless Alphabet drags letters into outlines). It stays deferred for three non-evidential reasons: the tablet evidence is strongest at **word** level, not letter level; **letter** learning is precisely where pencil-and-paper beats a screen (Mayer 2020, Kiefer 2015), so it is the weakest place to spend a screen; and option 6 reuses existing code while this is new content. If it ever ships it must never be reachable from a level, and §10's copy rules bind it. |
| 6 | **Word-tile maker** — "YOUR OWN WORLD" on glass | any touch device, **no save needed** | sight-word recognition, word→meaning | low, with guardrails | M | yes | **BUILD (Phase 2).** The one existing mode whose meaning survives the device change intact. |
| 7 | **Companion / second screen** — read the cards you earned | touch devices **that already hold a save** | reading comprehension, history content | **negative dilution** — it makes earning cards *more* valuable | S | yes | **BUILD (Phase 1).** |
| 8 | **Reading / phonics mode** (new content, no typing claim) | any touch device | early reading | low | L | yes | **Defer — and note the objection was never evidential [revised 2026-09-12].** The category works (+0.31 SD; Kim et al. 2021) and the reading half does advance on glass (Mayer et al. 2020). It is still a **new curriculum rather than a layer on this one**, which is a scope judgement, not a doubt. Revisit as a deliberate product decision, not as a research question. |
| 9 | **Swipe / gesture typing** | phones | swipe typing (a third, distinct skill) | high | L | yes | **Reject.** A skill this game has no opinion about, and no path back to a keyboard. |
| 10 | **Native app / Godot mobile port** | app stores | whatever the port chooses | n/a | XL | no | **Reject now.** `tech.md` keeps Godot for "if we ever ship beyond the browser"; nothing here justifies leaving the zero-friction URL, and a store listing would force a marketing claim about what the app teaches. |

### 3.1 Why the bespoke canvas keyboard (option 4) is rejected on a stronger ground than §2b gave

§2b rejects it as "still thumbs on glass" — true, and a pedagogy claim that belongs to the
research lane. There is a second reason that is purely internal to this codebase and needs no
outside evidence:

**Every hint surface in this game is designed to fade. An input device cannot.**

- The keyboard guide is fog-of-war — it reveals only what you have learned (`js/ui/hud.js`).
- The first finger diagram is "the **only** time the finger guide appears without being asked
  for… No other level, no other prompt, ever shows it proactively" (`transitions.md` §Phase 5).
- The maker's word palette "**FADES on its own as you find your feet** — until it's just you and
  the keyboard" (`js/textworld/maker.js`, module header).
- Hints otherwise appear only *after* a wrong keypress (`onboarding.md` §Design Rules).

A rendered keyboard is a permanent, un-fadeable, always-looked-at key map, because it is
simultaneously the hint and the input device. It is structurally incapable of obeying the
game's own central teaching pattern. That is a design contradiction, not a trade-off.

**Secondarily — and this is now the decisive number [revised 2026-09-12] — it does not
physically fit.** Nielsen Norman Group recommends **≥2 cm × 2 cm touch targets for young
children**, four times the adult figure (`research/mobile-touch-typing.md` §2, §4). A soft QWERTY
has ten columns, so a child-sized one needs **≥20 cm of usable width before margins**. An 11-inch
iPad is **179.5 mm wide including bezels** — **18.0 mm per column in portrait at the absolute
device edge**, below the recommendation before the display area is even accounted for; landscape
reaches 24.9 mm per column only if the keyboard spans the entire long edge, which it will not; a
phone is not close. (My earlier CSS-pixel arithmetic — ~39 px/key on a 390 px phone against WCAG
2.2 SC 2.5.5's 44×44 — reaches the same verdict but understates it, because 44 CSS px is the
*adult* accessibility floor.) **A soft QWERTY sized for a five-year-old's fingers does not fit on
the devices we would ship it to.**

Third: **ten-finger skill does not even apply on glass.** The largest mobile-typing study ever
run — **37,370 users**, Palin, Feit, Kim, Kristensson & Oulasvirta (MobileHCI 2019) — found "no
benefit from formal training on traditional ten-finger typing systems when applied to touchscreen
typing." A rendered keyboard is not merely un-fadeable; the skill the curriculum builds buys
nothing there, in either direction.

**Withdrawn [revised 2026-09-12]: my look-down-habit hypothesis.** The first draft of this spec
speculated that a glass keyboard might *actively harm* later touch-typing acquisition. The
research pass found **no evidence of harm anywhere**, and glass→physical transfer has never been
studied in either direction (`research/mobile-touch-typing.md` §1, §7 — "the load-bearing
unknown"). The hypothesis is retracted, not merely unproven; do not repeat it. The rejection of
option 4 stands on three independent grounds that need no such claim: it cannot fade, it does not
fit, and ten-finger skill does not transfer to it.

**Also rejected as a rationale: "kids are digital natives, they already type fine on phones."**
Kirschner & De Bruyckere (2017): the information-skilled digital native "does not exist," and
designing on that assumption "hinders rather than helps learning." Self-taught glass typing
converges at ~36 WPM, >74% two-thumb, ~25% slower than a physical keyboard — acquired informally
and badly, which is exactly what a curriculum shortcuts.

---

## 4. Per-surface verdict

The failure in §2b was one verdict over unlike surfaces. Here they are, separately.

| Surface | Keyboard dependency | On glass? |
|---|---|---|
| **Levels 1–25 (the curriculum)** | Total — it *is* finger assignment | **NEVER.** Hard line; INV-TM1/TM3. |
| **Free Play** (`js/freeplay.js`) | Total — full keyboard + WPM | **NEVER.** It is the curriculum with the training wheels off; WPM on glass would be a speed claim about the wrong skill. |
| **Act 6 — Green Dragon (prose)** | High — free-form typed commands | **No.** The typed reply *is* the pedagogy ("a reply is always typed, never selected — learn-to-type first", CLAUDE.md). Turning it into menu taps reverts it to the LORD letter-menus we deliberately rejected. |
| **Act 6 — tile worlds** (Glimmer Deep, Whisperwood) | High — typed movement + typed riddle answers | **No**, same reason. A d-pad would be a different game. |
| **Act 6 — the maker ("YOUR OWN WORLD")** | **None in meaning.** Input is a **fixed 12-word allowlist** with prefix matching; the scene renderer is pure canvas and does not care where the word came from | **YES — Phase 2.** See §5.2. |
| **Act 6 — the IM-friend** | Free text | **PERMANENT NON-GOAL.** Free-text + LLM; its safety rests on `main.go chatBaseSafety` + server-side `chatOutputOK` with no client equivalent (`security.md` rule 8; `docs/specs/browser-llm.md` reaches the same verdict for the same reason). A touch build changes none of that and adds a keyboard the child would have to glass-type into. |
| **Collection gallery** (`renderCollectionScreen`, `js/ui/screens.js`) | **None.** Read-only, authored literals + a slot name | **YES — Phase 1.** See §5.1. |
| **Settings** | None | **Read-only at most.** Never editable on glass — the BLOCKED WORDS editor is a parent-facing free-text input that already owes `/security-review`; do not open a second door to it. |
| **L25 "MY STORY" coda** | Total (it is the full-keyboard payoff, all 26 letters) | **NEVER.** Its entire point is that every letter gets typed. |
| **Title / attract / easter eggs** | Typed magic words | **No change.** The notice already handles this screen. |
| **Speech input (ASR) as a glass substitute for typing** | n/a — a different modality entirely | **RULED OUT [added 2026-09-12].** Duolingo ABC makes speech a first-class input, so it is the obvious next request. ASR on children's speech is several times worse than on adults' — **13.93% WER for grades 3–5 vs 3.05% for adults** (21.31% on scripted child speech; `research/mobile-touch-typing.md` §3). In a game whose One Rule is "never punish," a microphone that mishears a five-year-old and marks her wrong is a direct One Rule violation with no mitigation. It would also be the game's first hardware-permission prompt and first audio-capture surface. |

---

## 5. Design

### 5.0 Where it lives, and what it is called

**Not a new Act.** Acts 6+ are post-graduation bonus wings for a player who has finished the
keyboard (`docs/ROADMAP.md` §2 numbering note). This is the opposite: a surface for someone who
*cannot reach* the keyboard game. Keeping it out of the act numbering also stops it from
inheriting "you finished the game" semantics it must never have.

**Same URL, same build, one door.** The entry point already exists and is already correct:
`initKeyboardNotice()` in `js/main.js`, with capability detection (`isTouchPrimaryDevice()`:
`pointer: coarse` + `hover: none`, never UA sniffing) and — the crucial property — **self-dismissal
on the first real `keydown`, because a keypress proves a keyboard is attached**. Reuse it verbatim.
A tablet-with-keyboard player therefore never gets routed to the touch surface, with no allowlist
to maintain. The notice gains exactly **one** tappable line beneath its existing copy.

**Name.** The fiction should be a place in the arcade, not "mobile mode". Recommended:
**THE FLYER RACK** — the stack of paper by the arcade door you could take home and read. Fallback
if that artifact does not check out: **THE LOBBY**. *The arcade-flyer framing is a historical claim
and must be verified by the `arcade-historian` agent before it reaches player-facing copy — do not
ship it on a model's say-so (CLAUDE.md §Research).*

### 5.1 Phase 1 — the gallery on glass

Reuses `Slots.listSlots()`, `Slots.slotCards(i)`, `allCards()`/`cardById()` (`js/history-cards.js`)
and the existing `collection` screen's data path. All read-only, all already implemented.

- Shown **only if this device holds ≥1 saved game with ≥1 collected card.** Otherwise the door
  does not appear and the notice is exactly what it is today. This matters: localStorage is
  per-device and there is no sync (`security.md` rule 6 — the game never phones home), so a phone
  that has never been played on has nothing to show. The natural audience is the detachable
  tablet: play with the keyboard clipped on, pop it off, read your cards on the couch.
- More than one saved game → a read-only slot list first (name + ★ found/total), reusing the
  picker's existing data shape.
- Found cards read at a comfortable size; unfound stay `???` silhouettes — the completionist
  tease is preserved exactly, and **there is no path to reveal one** (INV-TM2).
- Tap/swipe to page; one always-visible exit.

**Why this is additive, not dilutive:** a card becomes more valuable because it is readable
anywhere, which makes earning it at the keyboard *more* motivating. The asymmetry is the point —
**you earn on the keyboard, you read on the glass.**

### 5.2 Phase 2 — the maker on glass

**The idea is a century old and every serious product in this category already uses it
[revised 2026-09-12].** The research pass looked at six established children's literacy apps —
Endless Alphabet, Duolingo ABC, Teach Your Monster to Read, Khan Academy Kids, Writing Wizard,
Osmo Words — and found **zero soft QWERTY keyboards**. All six are one idea in six coats: the
**Montessori movable alphabet**, a box of loose letters that lets a child *compose words before
her hand can write them*, used with 3–6-year-olds for about a century and explicitly designed to
**strip the motor task out of the language task** (`research/mobile-touch-typing.md` §3;
`research/wiki/pedagogy/movable-alphabet.md`). Osmo Words goes furthest and puts *physical* tiles
on the table with the iPad only watching.

That is the design spine here, not a footnote. Keystroke Kingdom's keyboard game deliberately
*keeps* the motor task — that is the whole point of it. The glass mode deliberately *removes* it,
which is why the two are complements rather than a game and its watered-down port. It is also
already this game's soul on the other device: Bookworm's mechanic, cited in
`research/typing-pedagogy.md` as sharing the "typing a real word you can read is a double win"
instinct.

**Category efficacy, stated honestly:** Kim, Gilbert, Yu & Gale (*AERA Open* 2021; 36 studies,
285 effect sizes) found **+0.31 SD** for this class of app — real, modest, larger for preschoolers
and for constrained skills (letter knowledge, phonological awareness) than for comprehension, and
**larger on researcher-designed measures than standardized ones**. That last clause is the reason
this game should never cite an effect size of its own.

Read `js/textworld/maker.js` before building. The port is small because the module is already
shaped for it:

- `VOCAB` is a **fixed 12-word allowlist** with `zone`/`cap`/`tier`/`draw(x,y,size,t,phase,alive)`.
  The module header already states there is "**NO free-text/untrusted-input surface here**".
- `offered()` already computes exactly the set of currently-available words — **that is the tile
  strip**, with no new data model.
- `place()`, `wake()`, `spawnPos()`, `drawThings()`, the tier unlock, the "alive" state and every
  `draw*` function are input-agnostic and reused unchanged.
- The only new code is hit-testing a tile row against pointer coordinates and calling the existing
  `fire(word)`. `handleKey` stays for the keyboard path, untouched.

Player-facing loop on glass: the word **`flower`** is printed on a tile; the child reads it, taps
it, and a flower grows in the scene. Tier 0 → tier 1 unlocks more words at 5 placements, as today.
At 3+ placements the **`wake`** tile appears and the world comes alive. That is sight-word
recognition with an immediate, delightful referent — and it is the same moment the keyboard child
gets, reached by a different road.

**Word tiles, not letter tiles.** The maker's palette is whole words (`flower`, `mountain`,
`wake`), which is the movable alphabet one level up: the child reads a word and gets a referent,
rather than assembling one. Mayer et al.'s tablet group gained on **word reading and word
writing** specifically, so this is the level the evidence actually supports. Letter-by-letter tile
spelling (option 5) is a different, more contested mechanic and stays a non-goal.

**Persists nothing.** No new localStorage namespace, no write to `textWorlds` (see §5.3). A glass
session is a session. (If "save your world" is ever wanted, that is a storage-schema change and
triggers `/security-review` — §6.)

### 5.3 The one-way membrane (the core guardrail)

The touch surface **reads** `kk-slots` and **never writes it.** Not `furthestLevel`, not
`completed`, not `nameMoment`, not `textWorlds`, not `cards`, not `cardRotation`, not
`storyRotation`. A byte-comparison of `kk-slots` across any touch session is identical (INV-TM1).

This single rule discharges the brief's sharpest risk in one line: **it is structurally impossible
to advance the 25-level curriculum, complete an Act 6 world, or collect a history card without a
physical keyboard.** It also keeps the ★ found/total counter honest as "things I earned at the
keyboard," which is the number the kids actually care about.

### 5.4 Phase 0 — Tier A (do this first, it is not really this project)

Unchanged from §2b, restated because it outranks everything above:
- Verify/tune the reserved-vs-stage fractions of `visual-validation.md`'s theme layout contract at
  tablet aspect ratios — **portrait especially**; the zones were measured at 1280×800.
- Confirm the prompt panel and keyboard guide stay legible at ~820 px wide.
- Verify (do not assume) that an iPadOS Magic Keyboard trackpad reports `pointer: fine` — which
  would be *correct*, and simply means the notice and the touch door never appear.
- Add tablet viewports to the screenshot harness (`docs/screenshots/capture-all.js` via
  `launchPage(viewport)`), since `visual-validation.md` currently excludes small viewports
  "entirely" and README says the same.
- Fix the cosmetic ~390 px "PRESS R TO REBOOT CABINET" wrap noted in §2b.

---

## 6. Safety & privacy

**The chain that must run, and who already does the work:**

| Concern | Existing code that already handles it | Missing |
|---|---|---|
| Untrusted localStorage | `js/slots.js` `normalizeSlot()` — field-by-field, malformed → dropped, never throws (`security.md` rule 4, the reference implementation) | nothing — reuse the same read path |
| Player name → DOM | slot rows built with `createElement` + `textContent`; canvas via `fillText` (rule 1) | nothing, **provided** the touch gallery uses the same construction and never `innerHTML` |
| Free-text input | **There is none.** Maker input is a fixed allowlist; gallery is read-only | nothing — and this must stay true (INV-TM8) |
| Network | No fetch anywhere in these paths (rule 6) | nothing |
| PII floor | One display name per save, read-only here (rule 8) | nothing — **no new PII class** |
| Dynamic code | None (rule 5) | nothing |

**`/security-review` gating — precise:**
- **Phase 0 and Phase 1: not required on the documented triggers** (no DOM sink fed by a new
  variable, no schema change, no free-text input, no child process). Still worth a look because
  they add a new screen-routing path; call it discretionary, not a gate.
- **Phase 2 as specified (persists nothing): not required** on the same reading.
- **REQUIRED** the moment any of these appear: a saved-worlds namespace (`kk-touch`/`kk-worlds`),
  any free-text field on glass, any editable setting on glass, or any card-collection write.

**Do not open on glass:** the settings BLOCKED WORDS editor (free text, already owes
`/security-review` per §3 of the ROADMAP) and the IM-friend (§4).

---

## 7. Non-goals

Written to protect the builder from scope, and to protect the game from the touch surface.

1. **Not a port of Levels 1–25.** No level is reachable on glass, ever.
2. **No rendered QWERTY keyboard**, canvas or DOM, anywhere in the touch surface.
3. **No tap-to-spell letter tiles** in Phase 1–2 (option 5) — the "it's basically typing" creep.
4. **No progress writes.** Nothing advances `furthestLevel` or `completed`.
5. **No card collection on glass.** Reading only.
6. **No Free Play, no WPM, no speed metric of any kind** on glass.
7. **No IM-friend, no chat, no LLM surface** on glass (permanent).
8. **No editable settings** on glass.
9. **No new localStorage namespace, no network call, no account, no sync.**
10. **No app-store build, no Godot port.**
11. **No typing claim** in any copy, page title, meta description, README line, or share text —
    **and specifically no readiness claim**: never "builds toward keyboard typing", never "gets
    them ready for a real keyboard" (§10). *[added 2026-09-12 — the research lane calls this "the
    most tempting sentence in the whole space" and it is entirely unevidenced.]*
12. **No speech recognition / microphone input.** *[added 2026-09-12 — §4: child ASR error rates
    make it a One Rule hazard.]*
13. **Not an Act.** It does not get a number and it does not appear in the act progression.

---

## 8. Risks & residual risk

- **Dilution by substitution (the real one, only partly mitigable).** A parent hands over the iPad
  instead of sitting the child at the keyboard. Design mitigations: the honest-claim copy (§10),
  and deliberately keeping the glass surface *smaller* than the keyboard game so it reads as a
  companion, not a destination. **Residual: real.** A device we do not control is being used by a
  household we do not observe. The only true mitigation is honest copy, and we should accept that.
- **Scope creep toward tap-to-spell.** The most likely future request, and the one that would
  quietly turn this into the thing we rejected. Guarded only by a written non-goal and INV-TM3.
- **Second layout/input path to maintain**, in a codebase whose validation rule currently excludes
  small viewports outright. Cost lands on the screenshot harness and on every future theme change.
- **Phase 1's audience is narrower than it looks** — no cross-device sync means it only lights up
  on a device that has actually been played on. Stated honestly in §5.1 rather than papered over.
- **~~Evidence risk~~ — RESOLVED [2026-09-12].** Phase 2's gate is met: selection-based word
  building on a tablet produced word-reading and word-writing gains equal to pencil-and-paper in
  ~145 kindergarteners over 7 weeks (Mayer et al. 2020). Phase 1 remains evidence-independent.
- **The counterweight, stated fairly [added 2026-09-12].** Kiefer et al. (2015) found handwriting
  superior to typing in preschoolers for word writing, and Mayer found pencil beat the keyboard
  condition on **letter recognition** with better retention. The consistent picture: **pencil and
  paper is the best tool for learning individual letters.** The glass mode must never be presented
  as a substitute for a pencil — only as a different thing (§10).
- **The grown-up matters more than the medium [added 2026-09-12].** Furenes, Kucirkova & Bus
  (*Review of Educational Research* 2021; 39 studies, 1,812 children aged 1–8): naive digitisation
  *lowers* comprehension, story-congruent enhancement makes digital beat paper, and **an adult
  reading a print book with a child beats a child alone with an enhanced digital book.** This
  sharpens risk 1 above with evidence: the dilution risk is not "tablet instead of keyboard", it
  is "child alone with a screen instead of a dad sitting next to her." The honest design response
  is to keep the glass surface short, small and companion-shaped — which is already the plan.
- **Glass→physical transfer is the load-bearing unknown [added 2026-09-12].** No study exists in
  either direction for children. This is not a risk to the build; it is a permanent ban on one
  sentence of marketing (§10), and it is why Phase 2 is justified on reading alone.
- **Copy risk.** "Reading practice, not typing practice" must survive future rewrites. It is
  written as an invariant (INV-TM6) for exactly that reason.
- **The `[unverified]` Apple HIG number.** The 44×44 pt iOS guidance could not be fetched
  (§12); the WCAG 2.5.5 44×44 CSS px figure is cited instead and is sufficient for the argument.

---

## 9. Phased rollout

Each phase is independently shippable and independently revertible. Every phase degrades to
Option 1 (the notice as it stands today).

| Phase | Ships | Depends on | Revert |
|---|---|---|---|
| **0 — Tier A layout** | tablet/Chromebook layout verified + tuned; tablet viewports in the screenshot harness; the 390 px wrap fixed | nothing | revert CSS |
| **1 — The door + the gallery** | the notice gains one tappable line; read-only card gallery, conditional on a local save; the honest-claim screen; the one-way membrane | Phase 0 | remove the line; notice returns to today's behavior |
| **2 — The maker on glass** | word-tile input over the existing maker scene; session-only | Phase 1. **Evidence gate MET** *(Mayer et al. 2020 — [revised 2026-09-12]; the prior "research lane sign-off" dependency is discharged)* | remove the tile path; `handleKey` untouched |
| **3 — A reading mode** (option 8) | *still not recommended now* | explicit new decision from Trevor. Evidence for the category now exists (**+0.31 SD**, Kim et al. 2021) but it is a new curriculum, not a layer on this one — the objection was never evidential | n/a |

---

## 10. The honest claim — exact parent-facing wording

This is the integrity deliverable. A parent must never come away thinking glass is building
touch-typing muscle memory. Ship these strings, not paraphrases of them.

**On the way in (shown once per session, before the touch surface, unskippable-by-setting):**

> **NO KEYBOARD? THIS PART IS FOR YOU.**
>
> Keystroke Kingdom teaches touch typing — home row, ten fingers, no looking down.
> That needs a real keyboard, so the 25 cabinets stay dark on a touchscreen.
>
> What's in here instead is the **reading** half of the game: the words, the worlds,
> and every history card you've found.
>
> **This is reading practice, not typing practice.**
> Plug in a keyboard and the whole arcade lights up.

**Persistent one-liner (footer of the touch surface, and the README's device line):**

> **TOUCH MODE — reading and word play.** It does not teach typing and does not advance your
> levels. Typing is learned at a real keyboard, on purpose.

**What we MAY truthfully claim** *(grounded in `research/mobile-touch-typing.md` §6 —
[added 2026-09-12])*: that it practises **word reading**; that it practises **word building and
spelling** with the same word banks the main game uses; that it practises **letter recognition**
and letter–sound correspondence; and that typing a real word you can read is a double win, which
is unchanged from the keyboard game. All of these are supported by Mayer et al. (2020) for
selection-based input at exactly our ages.

**What we may NOT say anywhere**, including store/meta/share/README copy:

| Forbidden | Why |
|---|---|
| "typing practice on your phone" / "learn to type anywhere" / "typing games for tablets" — any phrasing where *typing* and *touchscreen* name the same activity | glass has no home row and no F/J anchor; the Aalto 37,370-user study found ten-finger training buys nothing on glass |
| **"builds toward keyboard typing" / "gets them ready for a real keyboard" / "a head start on typing"** | **the single most tempting sentence in this space, and entirely unevidenced — glass→physical transfer has never been studied in either direction** *[added 2026-09-12]* |
| "as good as writing letters by hand" | two controlled studies say pencil wins for letter learning (Kiefer 2015; Mayer 2020 on letter recognition) |
| any framing implying this is the same curriculum, or that finishing it finishes anything | it is a different game sharing a world (§5.3, INV-TM1) |
| any effect size or outcome number of our own | Kim et al. 2021: effects are systematically larger on researcher-designed measures than standardized ones — including, inevitably, ours |

**Naming is a truthfulness decision, not a marketing one.** The research pass flags that any
store listing, README line or in-game label with "typing" in the name of a tablet mode will be
read as the typing claim regardless of the fine print. This is why the surface is called THE
FLYER RACK / THE LOBBY (§5.0) and not "Keystroke Kingdom Mobile."

**And one thing we may not say to the child, either:** nothing on the glass surface may imply
she is behind, or that this is the practice version. Per NN/g's motor bands, formal keyboarding
is a **grade-4** expectation (US Common Core W.4.6, ~ages 9–10) — *older than every child this
game targets*. A four-year-old on an iPad is not failing at anything.

**A note on the existing notice's tone.** It currently tells a touch visitor, warmly, that this
cabinet wants a keyboard. After Phase 1 it should say the same thing and then offer something —
"…and here's something for you" — never "you're locked out." Device capability is not a failure
state; the One Rule covers this too.

---

## 11. Acceptance criteria — candidate invariants

Written for `test-engineer` to implement directly (`docs/testing/STRATEGY.md` §5 format; L0–L3 =
layer). IDs are provisional — assign real INV numbers on adoption.

- **INV-TM1** (L1/L2) **The membrane is one-way: touch mode never writes a save.** Across any
  touch-surface session — entering the door, browsing every card, placing every word, waking the
  world, leaving — the serialized `kk-slots` value is byte-identical before and after. No write
  to `furthestLevel`, `completed`, `nameMoment`, `textWorlds`, `cards`, `cardRotation` or
  `storyRotation` occurs by any path. *(This spec §5.3; `js/slots.js`; CLAUDE.md §Save slots.)*
- **INV-TM2** (L1/L2) **No history card is ever collected on glass.** `Slots.collectedIds()` is
  unchanged by every touch interaction; the glass gallery renders found cards revealed and
  unfound as `???`, and exposes no interaction that reveals an uncollected card. *(§5.1;
  product.md §History Cards — the collect-them-all loop is a keyboard achievement.)*
- **INV-TM3** (L2) **No level and no Free Play session is reachable on glass.** From the touch
  surface there is no route to the `game` screen, to `handleGameKey`, or to `js/freeplay.js`; the
  25 cabinets are not enterable and no pattern stream is ever started. *(§4; §7.1/§7.6.)*
- **INV-TM4** (L2) **The touch door appears only on a touch-primary device and yields instantly
  to a keyboard.** Entry is gated by the existing `isTouchPrimaryDevice()` (`pointer: coarse` +
  `hover: none`, **never** UA sniffing), and the first real `keydown` dismisses the door for the
  rest of the session — a keypress proves a keyboard is attached. *(`js/main.js`
  `initKeyboardNotice`; docs/ROADMAP.md §2b.)*
- **INV-TM5** (L2) **Desktop is byte-identical.** With `pointer: fine`, no touch-mode code path
  executes and the DOM, screen flow and key handling match the pre-feature build exactly.
  *(Same shape as the notice's existing desktop guarantee.)*
- **INV-TM6** (L0/L2) **The honest claim is present and unremovable.** The words "This is reading
  practice, not typing practice" (or the §10-approved wording) appear on the way in to the touch
  surface, and **no setting can suppress them** — settings are additive-only and may never remove
  a floor. A static scan additionally asserts that no shipped string (a) pairs "typing" with
  "touchscreen/phone/tablet" as a claim, or (b) **contains a readiness claim — "ready for",
  "builds toward", "head start", "prepares" within N words of "keyboard"/"typing"**
  *[strengthened 2026-09-12: glass→physical transfer is unstudied, so this sentence can never
  become true by accident]*. *(§10; `research/mobile-touch-typing.md` §6; CLAUDE.md §Settings are
  additive-only; security.md §unremovable safety prompt precedent.)*
- **INV-TM7** (L2) **No punishment on glass.** The touch surface runs no timer, keeps no score,
  has no fail state and no lockout; an unavailable tile responds with a gentle nudge and remains
  on screen (the wrong-keypress contract's shape, one device over); an exit affordance is visible
  at all times. *(product.md §1/§3; CLAUDE.md §The One Rule.)*
- **INV-TM8** (L1/L2) **No new input, storage, or network surface.** Touch mode introduces no
  free-text field (maker input stays a fixed `VOCAB` allowlist), no new localStorage namespace,
  and no `fetch`/XHR; every rendered string is either an authored literal or a slot display name
  reaching the DOM via `textContent` / canvas `fillText`. *(security.md rules 1, 4, 5, 6, 8;
  `js/textworld/maker.js` module header.)*
- **INV-TM9** (L3) **Every touch target clears the CHILD target-size floor.** Interactive
  elements in the touch surface are **≥2 cm × 2 cm in physical size** (NN/g's young-child
  recommendation, four times the adult figure) — not merely ≥44×44 CSS px (WCAG 2.2 SC 2.5.5's
  adult AAA bar), verified at the smallest supported viewport. *[revised 2026-09-12 — the child
  figure is the relevant one, and it is also the number that makes a 10-column soft QWERTY
  physically impossible: ≥20 cm of width vs an 11-inch iPad's 179.5 mm. `research/mobile-touch-typing.md`
  §2/§4.]* A corollary the suite should assert directly: **no interactive row in the touch surface
  has more than a small number of columns** — a ten-column grid cannot satisfy this at any
  shipping viewport, which is INV-TM3's rejection of a rendered keyboard expressed as geometry.
- **INV-TM10** (L3, Phase 0) **Tablet layout keeps the prompt and the guide visible.** At the
  added tablet viewports (portrait and landscape), the prompt panel and the keyboard guide are
  fully visible and non-overlapping, and the theme's focal art stays in the stage regions.
  *(`visual-validation.md` §Theme Layout Contract; checks 1–5.)*

---

## 12. Sources

Live-fetched this session; recall was not used for any technology claim.

- MDN — **VisualViewport API** [fetched 2026-09-12]: "User-interface features like the on-screen
  keyboard (OSK) can shrink the visual viewport without affecting the layout viewport."
  Baseline "widely available… since August 2021."
  https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport
- MDN — **`@media (pointer)`** [fetched 2026-09-12]: `coarse` = "The primary input mechanism
  includes a pointing device of limited accuracy, such as a finger on a touchscreen."
  https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer
- W3C — **Understanding WCAG 2.2 SC 2.5.5 Target Size (Enhanced)** [fetched 2026-09-12]: "The
  size of the target for pointer inputs is at least 44 by 44 CSS pixels."
  https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html
- W3C — **Understanding WCAG 2.2 SC 2.5.8 Target Size (Minimum)** [fetched 2026-09-12]: "at
  least 24 by 24 CSS pixels" (AA).
  https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Apple Human Interface Guidelines, 44×44 pt minimum hit target — **still `[unverified]`**: the
  Layout page returned title-only on fetch. WCAG 2.5.5 is cited in its place, and NN/g's ≥2 cm
  child figure supersedes both for our audience. Do not quote Apple without a successful fetch.

### Pedagogy and product evidence — `research/mobile-touch-typing.md` (landed 2026-09-12)

All pedagogy claims in this spec route through the research lane's doc and its
`research/wiki/pedagogy/*` pages; none are asserted from model memory. Load-bearing findings:

| Finding | Source (via the research doc) | What it decides here |
|---|---|---|
| Tablet group that **selected** letters matched pencil and beat stylus on **word reading + word writing**; ~145 children, mean 5y10m, 16 letters, 7 weeks / 28 sessions | Mayer, Wallner, Budde-Spengler, Braunert, Arndt & Kiefer, *Frontiers in Psychology* 10:3054 (2020) | **Phase 2's gate is met** (§1, §5.2, §9). Note the shape: the tablet condition that imitated *handwriting* did worse; the one that let children **select** did fine. |
| Pencil beat keyboard on **letter recognition**, with better retention; handwriting superior to typing for preschoolers' word writing | Mayer et al. 2020; Kiefer et al. 2015 | The counterweight (§8). Never sell glass as better than a pencil for letters. |
| **No benefit from ten-finger touch-typing training** when typing on glass; 37,370 users | Palin, Feit, Kim, Kristensson & Oulasvirta, MobileHCI 2019 | Third independent ground for rejecting a rendered keyboard (§3.1). Also kills "our curriculum future-proofs them for phones." |
| **Glass → physical transfer has never been studied**, in either direction, in children or adults | research doc §1, §7 ("the load-bearing unknown") | My look-down-harm hypothesis is **withdrawn** (§3.1); "gets them ready for a real keyboard" is **permanently forbidden copy** (§10). |
| First measurable keyboarding standard is **W.4.6, grade 4 (~ages 9–10)** | US Common Core, verified against the California DOE standards browser | Our players are *younger than the standard*. A four-year-old on an iPad is not behind (§10). |
| Motor bands: 3–5 "very limited fine motor" (masters tap/swipe/drag); 6–8 "simple keyboard use" | Nielsen Norman Group | Tap/drag is the age-appropriate verb; the maker's tile tap is exactly it (§5.2). |
| **≥2 cm × 2 cm** touch targets for young children — 4× the adult figure | Nielsen Norman Group | INV-TM9, and the arithmetic that makes a child-sized soft QWERTY physically impossible (§3.1). |
| **Six of six** established children's literacy apps use **zero soft keyboards**; all are variants of the **Montessori movable alphabet** | research doc §3; `research/wiki/pedagogy/movable-alphabet.md`, `childrens-literacy-apps.md` | The design spine of §5.2 — and direct market validation that the word-tile direction is the category norm, not a compromise. |
| Category efficacy **+0.31 SD**; 36 studies, 285 effect sizes; larger on researcher-designed than standardized measures | Kim, Gilbert, Yu & Gale, *AERA Open* 2021 | Modest-but-real (§5.2), and the reason we never cite a number of our own (§10). |
| Child ASR error rates **13.93% WER (grades 3–5) vs 3.05% adults**; 21.31% scripted | research doc §3 | Speech input ruled out as a One Rule hazard (§4, non-goal 12). |
| Naive digitisation lowers comprehension; **an adult reading a print book with a child beats a child alone with an enhanced digital book**; 39 studies, 1,812 children aged 1–8 | Furenes, Kucirkova & Bus, *Review of Educational Research* 2021 | Sharpens the dilution risk (§8): the hazard is the child *alone*, not the device. |
| The information-skilled "digital native" **does not exist**; designing on that assumption "hinders rather than helps learning" | Kirschner & De Bruyckere (2017) | Rejects "kids already type fine on phones" as a rationale (§3.1). |
| Self-taught glass typing converges ~36 WPM, >74% two-thumb, ~25% slower than physical | research doc §1/§3 | Informal acquisition is slow and bad — what a curriculum shortcuts (§3.1). |

Competitor behaviour on touchscreens is now sourced through the research doc's §3 table rather
than the third-party aggregators my own search surfaced; none of those blogs are cited.

### Evidence gaps — status after the research pass [revised 2026-09-12]

**RESOLVED:**
1. ~~Does word recognition on glass advance the reading half?~~ **Yes** (Mayer et al. 2020).
   Dosage in the study was 7 weeks / 28 sessions; we make no dosage claim of our own.
2. ~~Does a glass keyboard actively harm later touch typing?~~ **No evidence of harm.** Hypothesis
   **withdrawn** (§3.1).
3. ~~Age/readiness — might a glass surface be a *bridge* to the keyboard, revising this spec
   upward?~~ **No — this revised the recommendation DOWNWARD on that axis.** Glass→physical
   transfer is unstudied, so the bridge argument is unavailable and Phase 2 is justified on
   reading and spelling alone. *The temptation to argue otherwise is precisely what §10 forbids.*
4. ~~What do children's literacy apps actually do?~~ **Zero soft keyboards in six of six**; all
   movable-alphabet variants. This strengthened §5.2 from a hunch into the category norm.

**STILL OPEN (not blocking any recommended phase):**
5. Whether a *purpose-built* touchscreen typing curriculum could work — Oulasvirta names this as
   an open question and no glass typing trainer has been evaluated. Interesting; not our problem.
6. Whether tile/tracing modes build anything that helps later keyboarding — plausible via the
   spelling layer (Cerni et al. 2016: spelling and letter-sequencing knowledge appear shared,
   the finger-to-key map does not), demonstrated nowhere.
7. **How the One Rule's feedback model behaves on glass.** Our wrong-keypress contract is about
   *keypresses*; touch misses are a different error class (holdovers, fat-finger, drift) and need
   their own design thinking before Phase 2 ships. **This is now the one genuine open design
   question for the builder** — INV-TM7 states the requirement, not the mechanism.
8. "THE FLYER RACK" remains historically ungrounded — `arcade-historian` pass required before it
   reaches player-facing copy; THE LOBBY is the safe fallback (§5.0).

---

## 13. Decisions for Trevor

1. **Did you mean touch-screen typing?** This spec reads "touch typing we can layer in" as *a
   touch-device experience*, since touch typing proper is already the game. If you meant
   something else — e.g. a new *keyboard* game mode about no-look typing — say so and this spec
   is the wrong document.
2. **Approve the hard line?** The curriculum, Free Play, card *collection* and the L25 coda are
   permanently keyboard-only, enforced as a one-way membrane (INV-TM1). This is the "don't
   sacrifice the entirety of the game" guardrail and everything else depends on it.
3. **Phase 0 (Tier A) now?** Small, real, unlocks every iPad-with-a-case in the house, and it is
   independent of the rest of this document.
4. **Phase 1 (read your cards on glass)?** Small and evidence-independent — but only lights up on
   a device that already holds a save. Worth it, or too narrow?
5. **Phase 2 (the maker on glass)?** This is the actual "new style of gameplay," and its
   **evidence gate is now met** — selection-based word building on a tablet matched
   pencil-and-paper on word reading and word writing in ~145 five-year-olds (Mayer et al. 2020),
   and six of six established literacy apps already use the movable-alphabet pattern. Justified
   on **reading and spelling only** — never as preparation for a keyboard. Go?
5b. **One genuine open design question before it ships:** our never-punish feedback contract is
   written for *keypresses*. Touch misses are a different error class (holdovers, fat-finger,
   drift) and nobody has designed our response to them. Worth your eye rather than a builder's
   default — it is the One Rule on new hardware.
6. **The name — and note it is a truthfulness decision, not a marketing one.** The research lane
   warns that anything with "typing" in the name of a tablet mode reads as the typing claim no
   matter what the fine print says. THE FLYER RACK (pending `arcade-historian` verification of the
   artifact) vs THE LOBBY vs something of yours.
7. **Public promise.** §2b asked whether touch-only should be "never, on purpose" rather than
   "not yet." This spec's answer: **the 25-level curriculum is never, on purpose; the device is
   not.** That is a more precise promise than either, and it should replace the README line.
8. **Cross-doc correction.** ROADMAP §2's browser-LLM row currently reasons from "**the game is
   not playable on mobile anyway** … mobile users are not addressable players." If any phase here
   ships, that sentence stops being true as written and should become "the 25-level curriculum is
   not playable on touch-only." Flagging it because it is load-bearing for a different decision.
