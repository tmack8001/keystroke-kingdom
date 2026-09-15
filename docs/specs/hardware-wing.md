# THE HARDWARE — the wing that teaches what a machine is made of
*(named 2026-09-14. Working names, both retired: "The Computer Room", then "THE DEN".)*


> **⚠️ INV NUMBERS RE-BASED 2026-09-14.** This spec proposed `INV-100…` while it was being
> written; `docs/testing/STRATEGY.md` landed INV-94..99 in the meantime and a sibling spec
> claimed the same block, so two unbuilt specs were proposing different meanings for the same
> numbers. Candidates here are now **INV-110..115**, a reserved block. The rule that prevents a
> third collision: **STRATEGY.md §5 is the only authority for a LANDED number, and an unbuilt
> spec reserves a block far above it rather than taking the next free integer** — because
> "next free" is a race between every spec in flight.


## Product spec / ADR — the bonus wing whose cabinets ARE the subject

> **⚠️ RE-FRAMED 2026-09-14, and the re-frame is load-bearing — read §0 before anything else.**
> This wing was specced as a ROOM (THE DEN) and is now specced as a SUBJECT (THE HARDWARE).
> Sections written before that date may still argue from the room premise; §0 overrides them.

*Written 2026-09-13 by the `product-manager` lane. Inputs: `docs/ROADMAP.md` §2 "THE COMPUTER
ROOM (working name)" (Trevor's direction, verbatim), `.claude/rules/product.md` §Content Rating
(new, written from his ruling), `research/educational-software.md` §5 (the placement options and
their trade-offs), `research/wiki/tech/console-hardware-silhouettes.md` (the drawing reference +
its media vault), the shipped Act 6 wing (`js/textworld/hub.js`) and the specced Act 7 wing
(`docs/specs/act7-speed-racing.md`, `js/speedway/*`) as the two structural precedents, and the
live code: `js/history-cards.js`, `js/slots.js`, `js/ui/cabinet-art.js`, `js/ui/screens.js`.*

**Trevor's direction is input, not an open question:**

> *"The idea of this wing/act with has stickybear and gizmo and gadgets is that we will be going
> through computer hardware history — **history cards discovered here will be all about computer
> hardware through the ages**."*
>
> *"And of course we need to have computer pinball, tycoon, sims, age of empires / Warcraft, and
> other iconic favorites eventually leading to say an mmorpg like EverQuest or World of Warcraft."*
>
> *"This is getting into teen/mature content which is fine at this point it is a separate act, but
> **still shouldn't get into gore, sex or other adult themes**."*

---

---

## 0. The 2026-09-14 decisions — twelve answers, and one re-frame that changed the wing

*Trevor worked the open questions interactively. Ten were answers; two changed what the wing IS.
Recorded here verbatim-sourced, because §§1–10 below predate them.*

### 0.1 The re-frame: a SUBJECT, not a room

The spec had been hunting for the right room name — Computer Room, then Den, with Attic and
Office as live alternatives. Trevor killed the premise:

> *"the den analogy isn't working for some of these games which would have been on a PC which
> likely wasn't in a den but a home office (or wherever computers were in that era — my childhood
> we had a home office once dial up internet came about)"*
>
> *"Maybe we scrap the den and go with The Hardware and use that to teach what hardware means —
> so all the history cards are about specific hardware and can be related to the game or system
> at play perhaps."*

**The room name kept failing because the room genuinely kept changing.** No single room ever held
forty years of home machines: the C64 lived in the LIVING ROOM because it plugged into the
television; the Apple IIe sat in a den; the beige tower moved to a HOME OFFICE the moment dial-up
arrived and the machine needed the phone line; then it became a bedroom machine, then a pocket.
Picking one room meant lying about four decades.

Naming the wing for its **subject** dissolves that, and buys something better: **the wing now has
something to teach.** A five-year-old does not arrive knowing what "hardware" means. This wing is
where they learn it — not as a definition, but by being handed one touchable part at a time.

**Precedent, so this is not a special case:** Act 6 (TEXT WORLDS) and Act 7 (SPEEDWAY) are both
already named for what they contain rather than where they sit. A wing named for its subject is
the house style, not an exception.

**On the name itself** (Trevor, choosing between THE HARDWARE / THE WORKBENCH / THE MACHINES):

> *"The HARDWARE — And we can still have a workbench with computer parts all over it and open
> machines — just workbench wouldn't be a good name for kids"*

So: **the wing is THE HARDWARE; the workbench is furniture inside it.** Lids off, boards showing,
parts on the bench — the set dressing that makes "the parts you can touch" literal, without
making a nine-letter Amiga-OS pun the door hint a child has to read. Door hint: `HOW IT ALL WORKS`.

**Name collision check — Act 2 is THE COMPUTER WING**, and the two must be distinguishable at the
back wall. They are, and the hint lines carry it:

| Wing | Hint line | Subject |
|---|---|---|
| Act 2 — THE COMPUTER WING | *(existing)* | the games you played |
| **THE HARDWARE** | `HOW IT ALL WORKS` | **the machines you played them on** |

### 0.2 The spine: order by the room the machine moved into

> *Q: "The machine kept MOVING rooms — living room, den, home office, bedroom, pocket. Is that
> the wing's spine?"* → **"Yes — order by room."**

The wall walks the house in the order the machine actually migrated through it. This is true, it
is a story a child can feel, and — the useful part — **it turns the failed room name into
content.** The reason no room name fit is now the thing the wing is about: the machine came
closer to you every decade, and ends up in your hand.

### 0.3 The card model: PAIRED — a machine card and a component card

> *Q: "What is a hardware card ABOUT?"* → **"Both, paired."**

Every station yields **two** cards: the machine, and the one part of it that mattered.

| Station | Machine card | Component card — *the part you could hold* |
|---|---|---|
| C64 on the family TV | COMMODORE 64 | **THE RF MODULATOR** — how a computer borrowed the television |
| Apple IIe + Disk II | APPLE IIe | **THE FLOPPY DISK** — the games lived on it |
| Beige PC, VGA + CD | THE BEIGE TOWER | **THE CD-ROM** — 400 floppies in one disc |
| Multimedia PC | THE MULTIMEDIA PC | **THE SOUND CARD** — the year computers stopped beeping |
| Two PCs, one cable | *(the pair itself)* | **THE NETWORK CARD + BNC COAX** — two machines, one game *(⚠️ corrected 2026-09-14: this said THE NULL-MODEM CABLE. Two independent research lanes found that wrong for a mid-90s PC — the sourced method is **10BASE2 thinnet**, coax between BNC T-connectors, documented as "ideal for a small network of two or three machines, perhaps in a home". A null-modem cable is serial, 1980s–early-90s, and its sourced gaming use is the Amiga. See [[console-hardware-silhouettes]] and [[null-modem-cable]].)* |
| 56k tower | THE HOME-OFFICE PC | **THE MODEM** — why nobody could phone you |
| Broadband tower + LCD | THE BROADBAND PC | **THE LCD PANEL** — the desk got its space back |

The machine card is the museum label; **the component card is the lesson.** One is abstract, one
you could have held in your hand — and holding it is what the word "hardware" means.

*Consequence for §5.4:* the wing's card count roughly doubles from the earlier estimate, and the
denominator work in §5.7 must be redone against the paired model before Phase 1 ships.

### 0.4 Existing hardware cards STAY — and are cross-referenced

> *Q: "The dozen hardware cards already in the core 25 — do they stay?"* → **"Stay, but
> cross-referenced."**

`floppy`, `c64`, `386`, `486`, `altair`, `disk`, `intel`, `apple` and the rest **stay exactly
where they are in the curriculum.** Moving them would take cards away from a child mid-save and
shrink a number they had already earned — the argument §5.4 makes and this confirms.

**New requirement from the "cross-referenced" half:** the wing's gallery ALSO shows them — greyed,
tagged *found in the arcade* — so the hardware story reads whole in one place without any card
changing owner. A card found once is found; the wing shows it, the arcade keeps it. This is a
gallery-rendering change, **not** a data-model change, and INV-56 is untouched.

### 0.5 Roster changes

| Decision | Ruling |
|---|---|
| **The verb** | ✅ **Boot line.** You type `CATALOG` and the machine wakes. The wing is a typing room, not a museum |
| **The RTS** | ✅ **Warcraft II** — the null-modem cable is a genuine *hardware* beat, and it is the same world as the WoW station that now closes the wall |
| **The MMOs** | ✅ **BOTH here** — EverQuest *and* World of Warcraft, no reservation *(reverses §5.7's one-per-wing recommendation — see §0.6)* |
| **Pinball (computer)** | ✅ **3D Pinball / Space Cadet stays** — it came *with* the machine, which is a hardware story |
| **Pinball Construction Set** | ➡️ **moved to Act 6's maker world.** Trevor: *"could go in the Act 6 maker world"* — software that makes software, sitting beside YOUR OWN WORLD. Better home than this wing |
| **Epic Pinball / Pinball Fantasies** | ➡️ **reserved for the Server Room arc.** Shareware, BBS and cover-disc distribution is a story about how software *travelled* — that arc's subject, not this one's |
| **Physical pinball** | ➡️ **its own alley in the arcade.** Trevor chose a real pinball row off the main floor with PHYSICAL tables. A table and a screen are not the same machine, so they do not share a room. Separate proposal — see ROADMAP |
| **The Sims, RollerCoaster Tycoon** | ➡️ **moved out to the proposed builder room** — see §0.6 |
| **Server Room terminus** | ⏸️ *"Decide when it's specced."* Recorded only: both MMOs are claimed, so that spec must not plan around them |

### 0.6 Two proposals this spawned (neither blocks Phase 1)

**(a) The world-builder room.** Trevor, on being offered Warcraft II / StarCraft / C&C:

> *"I do like all of these options — maybe since these are all world builder games which is a
> genre in and of itself a whole room could be devoted to this?"*

He is diagnosing real drift: as specced, this wing had accumulated Warcraft II + RollerCoaster
Tycoon + The Sims — a **genre cluster inside a hardware wing**, telling two stories at once. The
builders move out; the network machines stay, because a cable and a modem are hardware.

Candidate roster, **none of which are in the core 25, so nothing is taken from anybody**:
Populous (1989), Civilization (1991), Theme Park (1994), SimTower/SimAnt, RollerCoaster Tycoon
(1999), The Sims (2000). ⚠️ **SimCity 2000 (L16) and Age of Empires (L18) STAY in the arcade** —
the room may *reference* them, never reclaim them.

**(b) Physical pinball alley** (§0.5). Arcades really did have a row of tables down one wall,
apart from the video cabinets; the knocker solenoid already appears in `research/wiki/games/q-bert.md`.

### 0.7 Still open after this pass

1. **Act number.** Taking `num: 8` as the default and not blocking — it is one registry field.
   The broader "are running integers right for four parallel wings?" question stays open in
   ROADMAP §2, and now has two more candidate wings pushing on it (§0.6).
2. **Fidelity of the late stations** (old Q10) — unchanged: this spec still declines bespoke
   playable recreations. If one is ever wanted, it becomes its own phase with its own spec.

---

## 1. Recommendation

**Build it — and build the card model FIRST, before a single station is drawn, because the card
model is the only part of this wing that can damage something already shipped.** Everything else
here is additive and reversible; a second attachment axis on `js/history-cards.js` touches the
one system that already has five invariants (INV-56..60), a per-slot collection, a gallery and a
counter on the returning-player front door. Get that wrong and a child who has never opened the
wing watches her `★ 14 / 60` silently become `★ 14 / 78` — a number that got *worse* for a
reason she cannot see. Get it right and the wing is a pure addition that nobody who ignores it
can even detect.

Three decisions carry the rest of the spec:

- **The wing is not a gallery, and it is not eight mini-games. It is ONE typed loop, re-skinned
  per machine — and the verb is the machine's own boot incantation.** You walk up to a dark Apple
  IIe, you type `CATALOG`, the drive chatters and Stickybear comes up. That is the single most
  honest verb this wing could have: it is what you actually did, it is typing, it costs one
  shared module, and it makes the hardware the thing you interact with rather than the thing you
  read a plaque about. The plaque still exists — it is what the machine shows you *after* it
  boots. See §5.2.
- **Station cards attach to a `(wing, station)` pair, never to a level, and the arcade's card
  counter does not move.** `level: null` + `wing` + `station`, `cardsForStation()` alongside
  `cardsForLevel()`, one generalized `pickFromPool()` serving both, and **scoped denominators** so
  the wing gets its own `▣ 3 / 16` rather than inflating `★ n / 60`. INV-56 is **amended in
  scope, not weakened**: earliest-typeable still binds every card that has a numeric level. §5.4.
- **The door opens at Level 20, not Level 25** — and the stations light up one by one as the keys
  their content needs are unlocked, exactly the grammar the select screen already uses for
  cabinets. Level 20 is the game's own *"the computer is the point"* beat (binary → `HELLO`), the
  museum teaches no keys and demands none it hasn't taught, and by Level 25 the whole wall is lit
  anyway. **⚠️ This contradicts a documented assumption and needs Trevor's sign-off before it is
  built**, not after — `docs/ROADMAP.md` §2 currently states *"Acts 6+ all sit AFTER the full
  keyboard is learned, so they may use any key."* The doc moves first (`.claude/rules/testing.md`
  rule 1), then the feature. §5.5, Q3.

One thing I recommend **against**, and it is the wing's biggest temptation: **do not build a
bespoke renderer per title.** Eight stations × a faithful recreation of Warcraft II, RollerCoaster
Tycoon, The Sims and World of Warcraft is a larger build than Act 7's eleven tracks, for software
whose signature mechanics are *mouse-driven* — RTS click-drag selection, a tycoon's drag-a-path
tool, a life sim's queued click actions. `theme-authoring.md` requires the SCENE to show the
signature mechanic operating; for these titles the honest scene is *the machine running it*, with
the mechanic visible as a working simulation the player does not drive with a mouse. That is
cheap, faithful, and exactly what "the cabinets are the subject" already asks for.

If only one thing ships, ship **Phase 1: the card model + three stations (Apple IIe /
Stickybear Typing, beige MS-DOS PC / Gizmos & Gadgets, Windows PC / 3D Pinball)** — the two
machines that are *already drawn and committed* in `HOME_MACHINES`, plus one more, and the wing's
whole card system working end to end.

---

## 2. The problem

Three separate problems collapse into one room, which is why this wing is worth building at all.

**(a) Two machines are drawn, grounded, committed — and homeless.** `HOME_MACHINES` in
`js/ui/cabinet-art.js` holds a photograph-grounded Apple IIe and a period beige PC, with their
reference photos in the vault (`research/wiki/media/console-hardware-silhouettes/`). They were
stood at the head of Act 2's and Act 3's cabinet walls and Trevor rejected the placement on
sight: *"on the cabinet selection they look out of place next to traditional cabinets."* The code
comment now says so itself — *"They are kept here, drawn and grounded, ready for it."* Dead art
in a shipped file is a debt, and INV-92 was already retired over it.

**(b) The one thing this game is about has no room.** The Mystery Cabinet's entire promise is
*"it's not just a game, it's a computer."* Act 2 is called The Computer Wing. Level 20 resolves
binary into `HELLO`. And yet the actual machines — the Apple II a generation learned to type on,
the beige box with a CD-ROM drive, the tower with an always-on line — appear nowhere as subjects.
Twenty-five cabinets tell the history of *games*; nothing tells the history of *the machine the
child is typing on right now*.

**(c) `research/educational-software.md` delivered a lineage and then had nowhere to put it.**
Its §5 ranked five placements and recommended cards + set dressing, because the two options that
would actually let a child *visit* these machines (Option 4, an Edutainment Wing) were judged too
large against Act 6's overlap. Trevor's direction resolves that: the wing's subject is **hardware**,
not edutainment, which is a genuinely different thesis from Act 6's *typing as thought* and Act
7's *typing as velocity*. Here typing is **the incantation that makes a machine work** — which is
the literal, historical reason anybody learned to type on one.

Concretely, today: a child finishes Level 25 having been told a dozen times that typing unlocks
the computer, and there is no computer to walk up to.

---

## 3. Option space

Every real alternative for "a hardware-history wing," including doing nothing.

| Option | Reach | Cost to the player | Risk | Effort | Reversible? |
|---|---|---|---|---|---|
| **A. Do nothing.** Delete `HOME_MACHINES`, keep the hardware story in the existing level cards (`floppy`, `c64`, `386`, `486`, `altair`, `disk`, `intel`, `apple` are all already carded) | every player | none | none | negative (removes code) | n/a |
| **B. Set dressing only** — put the machines back into Acts 2/3 as background art, restyled so they don't clash | every player | none | **medium-high — Trevor already rejected this exact thing**, and the clash is structural (a box you stand at vs a thing you sit at), not cosmetic | small | yes |
| **C. Cards only** — author the hardware cards into existing level pools by earliest-typeable, no wing | every player | none | low | small | yes |
| **D. A gallery wing** — walk up, the machine powers on and tells you what it was, take a card. No typing. | opt-in wing | none | **medium — a typing game whose newest room has no typing.** Nothing to come back for; a plaque is not a visit (`educational-software.md` §5 Option 1's own criticism) | medium | yes |
| **E. A wing of bespoke per-title recreations** (the Act 7 track model) | opt-in wing | none | **high — the signature mechanics of an RTS/tycoon/life-sim/MMO are mouse-driven**; recreating them as typing is either a lie about the game or a huge build | very large | yes, expensively |
| **F. ONE typed loop re-skinned per machine — the boot prompt + the plaque + an optional typed vignette** | opt-in wing | none | low | medium, and incremental by data row | yes — a station is a data row |
| **G. F, plus the hardware cards from C seeded into level pools too** | every player + opt-in wing | none | low | medium+small | yes |

**Verdict: F, and C's cheap half is already done.** A and B are disqualified by Trevor's explicit
direction and his explicit rejection respectively. C alone is what the game already does — and
note the finding in §5.4.4 that **the curriculum bank has already spent most of the obvious
hardware vocabulary** (`floppy`, `disk`, `apple`, `altair`, `intel`, `386`, `486`, `c64`, `gui`,
`software`, `ai`, `flash`, `atari`, `ibm`, `56k`, `dial`, `coupler`, `mouse`, `pixel` are all
taken), which is a real argument that the *deep* hardware set needs its own home rather than more
crowding of levels that already hold several cards each. D is the shape Trevor's own words imply
and it is 80% right — F is D **with a verb in front of it**, at almost the same cost. E is the
trap.

---

## 4. Per-surface verdict

This wing spans surfaces with very different risk profiles. They get separate verdicts.

| Surface | Verdict | Why |
|---|---|---|
| **The card data model** (`wing`/`station` axis, scoped denominators) | **BUILD FIRST, alone, before any station** | It is the only change that touches shipped, invariant-covered, per-slot player data. It is independently testable with zero new art |
| **The shared station loop** (`station.js` — boot prompt → plaque → optional vignette) | **BUILD** | One module, every station. Where the sacred contracts get re-honored (§5.3) |
| **The Apple IIe / Stickybear Typing station** | **BUILD FIRST of the stations** | Art already drawn and committed; photo in the vault; wiki page + a contact sheet of its next-key highlight; and it is the game's own ancestor, which is the best single moment available in this wing |
| **The beige MS-DOS PC / Gizmos & Gadgets station** | **BUILD** | Same: art committed, photo in vault, wiki page. Trevor named it |
| **Per-station lit/dark gating by key closure** | **BUILD**, but only if the L20 unlock is approved | If the wing stays gated at 25, every station is lit on arrival and this mechanism is unnecessary. It exists *because* of the early unlock, not independently (§5.5) |
| **The RTS station (Warcraft II)** | **BUILD, Phase 2** | Needs an arcade-historian pass first; needs a photograph; content-rating check is genuine, not a formality (§5.6) |
| **The tycoon / life-sim stations (RollerCoaster Tycoon, The Sims)** | **BUILD, Phase 3** | No grounding at all in the wiki today. Cheap to draw (a tower and a monitor), expensive to get *right* |
| **The MMO terminus (World of Warcraft)** | **BUILD LAST, and design it as a SOCIAL scene, never a combat one** | It is the wing's payoff and its single biggest content-rating and security surface. "Other players" are scripted, never networked — the Act 6 move (§5.7) |
| **Bespoke per-title playable recreations** | **DO NOT BUILD** | §3 option E. The scene shows the machine running the software; the player types at the machine |
| **Any network surface** (a real MMO, a real LAN, a shared board) | **PERMANENT NON-GOAL** | security.md rule 6; the published build has no backend at all |
| **`/api/*` generated content in this wing** | **NO** | Nothing here needs generation, and a generated *historical claim* is exactly what the historian rule forbids |
| **Free-text input** (naming a character, a save file, a city) | **NOT IN v1** | A new free-text class would require the `buildPlayerNamePattern` allowlist chain **and** `/security-review`. Deliberately deferred so v1 introduces no new input class |
| **Seeding more hardware cards into existing level pools** | **YES, independently of this wing** | It is cheap, it is already how the game teaches hardware, and it costs nothing if the wing slips |

---

## 5. Design

### 5.0 Shape and attachment — the registry already exists; add one row

This is now the cheapest part of the whole wing, because Act 7's build generalized the back wall.
`js/ui/cabinet-art.js` already carries a `BACK_WALL_DOORS` **registry** (`{ id, num, name, era,
door, cabinets, unlock }`), a `WING_CABINETS` table of machines drawn with the shared cabinet
shell, `state.wingIndex` / `state.wingEntry` sub-states, `renderWingAct()` that renders any
registry row, and a `DOOR_ENTRY` map in `js/main.js`. Its own header states the contract:

> *"Adding a fourth wing is ONE DATA ROW here plus its entry function in main.js's `DOOR_ENTRY`
> map — never another edit to `renderWingAct()` or `navigateAct()`."*

So:

```
js/computerroom/
  hub.js          # the station chooser — sibling of speedway/hub.js + textworld/hub.js
  station.js      # THE shared loop: boot prompt → plaque → optional vignette → card.
                  # Every station shares it. The sacred contracts are re-honored HERE.
  stations/
    index.js      # the registry: one row per machine (data + drawScreen + drawScene)
    <id>.js       # one module per station
  words.js        # curated static word pools, one per station
  cards.js        # (optional) the wing's card ids, if not held in js/history-cards.js
```

`js/main.js` gains a `'computerroom'` screen case that is a byte-for-byte analogue of the
`'speedway'` case, including the **lazy `import()`** — that pattern is not optional and its
reasoning is already written down in `docs/features/speedway.md`: on a static host a missing
`js/computerroom/*` in a *static* import would abort `main.js`'s module graph and brick all 25
levels. Loaded on demand, a failure costs one warm "still being built" card that any key walks out
of. The import specifiers stay static strings so `scripts/static-host-check.mjs` still crawls the
subtree.

**The two homeless machines move house, they are not redrawn.** `HOME_MACHINES`'s `drawAppleIIe`
and `drawBeigePC` become `WING_CABINETS` rows keyed by station id. `HOME_MACHINES` itself is
deleted in the same change — leaving it behind is how dead art accumulates a second time.

**Wing name — recommendation: THE DEN.** "THE COMPUTER ROOM" is the working name and it has one
real defect: **Act 2 is already called THE COMPUTER WING**, and a player walking the back wall
would see `ACT 2 · THE COMPUTER WING` and `ACT 8 · THE COMPUTER ROOM` in the same navigation
strip. That is a confusing pair for a child reading act names off a screen. **THE DEN** is where
the family computer actually lived, it is warm, it is one syllable, it does not collide with THE
COMPUTER WING, THE BASEMENT or THE COMMAND CENTER, and the door label can carry the subject:
`THE DEN` / hint `HOME COMPUTERS`. Trevor's call — Q1.

**Act number: 8.** The number is free: ROADMAP §2's "Act 8(?) — The Guild Hall" is marked
**SUPERSEDED** and folded into this wing, which vacated it. The broader numbering question
(`docs/ROADMAP.md` §2, *"four bonus wings hanging off a 5-act spine may want a different
organizing idea than a running integer"*) is real and is **not blocked by this wing** — the
registry stores `num` as data, so a later re-labelling is one edit per row. Q2.

### 5.1 The roster — seven stations, ordered by the room the machine moved into

> **⚠️ REPLACED 2026-09-14 (§0.2/§0.5).** The previous table was era-ordered and included The Sims
> and RollerCoaster Tycoon. The spine is now the machine's **migration through the house**, and the
> two builders moved out to the proposed builder room.

The wall walks the house. Each station is a *machine* first and a *title running on it* second —
and each carries **two** cards (§0.3): the machine, and the part of it you could have held.

| # | Room | Year | The machine (the subject) | Running on it | Boot line | Keys it needs | Phase |
|---|---|---|---|---|---|---|---|
| 1 | **THE LIVING ROOM** | 1982 | **Commodore 64 + 1541 drive**, plugged into the family TV | BASIC itself | `LOAD"*",8,1` | Shift `"` `*` `,` digits → **L24** | 2 |
| 2 | **THE DEN** | 1983 | **Apple IIe + Disk II** | **Stickybear Typing** (1985) | `CATALOG` then `RUN` | letters → **L15** | **1** |
| 3 | **THE DEN** | 1993 | **Beige PC, VGA + CD-ROM** | **Gizmos & Gadgets!** (1993) | `DIR` then `GIZMOS` | letters → **L15** | **1** |
| 4 | **THE HOME OFFICE** | 1995 | **Multimedia PC, sound card + CD** | **3D Pinball** (it came with the machine) | `WIN` | letters → **L15** | **1** |
| 5 | **THE HOME OFFICE** | 1995 | **Two PCs joined by a cable** | **Warcraft II: Tides of Darkness** | `WAR2` | letters + `2` → **L19** | 2 |
| 6 | **THE HOME OFFICE** | 1999 | **A 56k tower, tying up the phone line** | **EverQuest** | `EQ` | letters → **L15** | 3 |
| 7 | **THE BEDROOM** | 2004 | **A broadband tower + LCD panel** | **World of Warcraft** — the terminus | `WOW` | letters → **L15** | 3 |

**Why the rooms are the right order, and what the last row is for.** Stations 2→4 are the same
family of machine moving one room over *because of a cable*: the moment the computer needed the
phone line, it moved to where the phone was. Stations 6→7 are the same story again, told by the
modem — dial-up ties up the household's phone, broadband does not, and the machine stops being a
shared appliance and becomes **yours**, in your room. That migration is the wing's whole argument:
**the machine came closer to you every decade.** A future station ends it in a pocket.

*Station 1's boot line is the famous fiddly one and that is the point* — `LOAD"*",8,1` is why it
sits in Phase 2 and lights at L24 despite being the wall's earliest machine. The wall is ordered
by the house; the **lighting** order is by key closure, and the two deliberately disagree. Honest
history: the oldest machine had the hardest incantation.

**Arcade-cabinet-rule audit — every title checked against `.claude/rules/levels.md` §"Complete
Game Assignment Table" (all 25), Act 6's five worlds, and Act 7's registered + planned tracks:**

| Candidate | Status | Resolution |
|---|---|---|
| **Age of Empires** | ❌ **TAKEN — Level 18** (Act 4, Command Center) | **Not used.** AoE stays at L18; the wing takes a different RTS. Nothing is swapped, per ROADMAP's answered swap question |
| **SimCity 2000** | ❌ **TAKEN — Level 16** | **Not used.** And I decline plain *SimCity* (1989) too, even though the cabinet rule would permit it as a distinct title: two SimCit*ies* in one game invites exactly the argument the rule exists to avoid. **The Sims** is a different game, a bigger cultural moment, and unambiguous |
| **Myst** | ❌ **TAKEN — Level 13** | Not used |
| **Tetris / Zelda / Mario / Pokémon / DKC / Sonic / SFII / FF7 / GoldenEye** | ❌ taken (L8–L19) | Not used; none were candidates |
| **Out Run** | ❌ taken (L21) — *and* already substituted around once, in Act 7 | Not used |
| **Warcraft II: Tides of Darkness (1995)** | ✅ **free** — not in the 25, not Act 6, not Act 7 | **CHOSEN as the RTS.** Reasons beyond availability: it is Trevor's own word ("Warcraft"), it is the modem/LAN-era RTS so the *hardware* beat (two machines and a cable) is real, and it rhymes with the terminus — the same world, ten years apart, the second time with other people in it |
| **StarCraft (1998)** | ✅ free | **Declined.** One RTS per wall; 1998 crowds Warcraft II for no new hardware beat; and its subject needs a content-rating read this spec cannot do from memory |
| **Command & Conquer (1995)** | ✅ free | **Declined.** Same slot as Warcraft II, and its presentation style is the one candidate most likely to collide with §5.6's absolute exclusions. If it is ever wanted, it needs an explicit historian + rating pass first |
| **Civilization** | ✅ free | **Declined for v1** — a fine wing candidate later, but it adds no hardware beat the wall doesn't already have |
| **RollerCoaster Tycoon (1999)** | ✅ free | ➡️ **MOVED OUT 2026-09-14** to the proposed builder room (§0.6) — a builder, not a hardware beat |
| **The Sims (2000)** | ✅ free | ➡️ **MOVED OUT 2026-09-14** to the proposed builder room (§0.6) — a builder, not a hardware beat |
| **3D Pinball (the Windows one)** | ✅ free — no pinball anywhere in the 25 | **CHOSEN as the pinball.** Deliberately picked over the DOS pinball titles because *the game that came bundled with the computer* is a **hardware** story, which is this wing's subject. ⚠️ Its exact title, publisher and lineage must come from an arcade-historian pass — see §Wiki gaps. Do not write it from memory |
| **EverQuest (1999)** | ✅ free | ⚠️ **REVERSED 2026-09-14 — NOW CHOSEN** (§0.5). Trevor took both MMOs. The original reasoning is kept below because the reversal has a *better* reason than the one it replaces, and it is worth not losing: ~~**Declined here, deliberately reserved.** ROADMAP §2's "THE SERVER ROOM ARC" is a live, separate proposal about everything going online and names EverQuest as one of its anchors. Taking both MMOs into one wing would strand that arc. **One MMO per wing: WoW here, EverQuest unclaimed**~~ — **the flaw:** that argued from spec tidiness, not from the subject. On the *hardware* thesis the two MMOs are a PAIR — EverQuest is the 56k modem and the tied-up phone line, WoW is the always-on broadband machine. Splitting them cut the dial-up→broadband story in half, which is precisely the hardware story this wing exists to tell |
| **World of Warcraft (2004)** | ✅ free | **CHOSEN as the terminus** (§5.7) |
| **Stickybear Typing (1985)** | ✅ free | **CHOSEN.** Already wiki-grounded (`research/wiki/pedagogy/stickybear-typing.md`) with media in the vault |
| **Super Solvers: Gizmos & Gadgets! (1993)** | ✅ free | **CHOSEN.** Already wiki-grounded (`research/wiki/games/gizmos-and-gadgets.md`) |

**Two notes the builder needs.**

*Rocky's Boots (1982) is deliberately NOT here* even though it is free and wiki-grounded:
`research/educational-software.md` §5 Option 3 reserves it as the historical anchor of the
proposed learn-to-program wing, where it is a much better fit. Taking it here would strand that
act the way taking EverQuest would strand the Server Room arc. It already has a level card
(`boots`, L12).

*Station 1's boot line is the famous fiddly one and that is the point* — `LOAD"*",8,1` is why it
sits in Phase 2 and lights at L24 despite being the wall's earliest machine. The wall is ordered
by era; the **lighting** order is by key closure, and the two deliberately disagree. That is
honest history: the oldest machine had the hardest incantation.

### 5.2 The loop — one module, every station, and the verb is the boot line

`js/computerroom/station.js` runs four phases. A station supplies only a data row, a
`drawMachine()` and a `drawScreen()`.

**Phase A — BOOT (typed).** The machine is dark: no power LED, a single `▮`. The boot line
appears as a prompt, and the player types it. Each correct character lights one more character on
the machine's screen in the machine's own palette. On the last character the machine *comes on* —
screen warms, drive chatters (audio.js), the software's title comes up.

This is the wing's whole design in one interaction. It is typing (this is a typing game), it is
short (3–11 characters), it is historically exactly what happened, and it makes the hardware the
thing you *operate* rather than the thing you read about. It is also the reason a 1982 machine can
be on the same wall as a 2004 one without the wall feeling repetitive: **the incantations are the
history.** `LOAD"*",8,1` and `WOW` are twenty-two years apart and you can feel it in your fingers.

**Phase B — THE PLAQUE (not typed).** The machine tells you what it was: three or four lines, in
its own screen font and palette, in the machine's voice. Space continues. This is precisely the
"walk up, and the machine tells you what it was" Trevor described, and it is where the *hardware*
teaching happens. **Every line of it comes from the arcade-historian, never from a model.**

**Phase C — THE VIGNETTE (typed; optional per station, added over time).** A short typed session
in the software's idiom, with the machine's scene running behind it: the RTS's units moving on a
minimap, the tycoon's coaster train climbing, the pinball table's flippers, the MMO's group
standing around a fire. The player types from the station's curated pool — and for the stations
that have one, the pool is *that software's own vocabulary* (`peon`, `lumber`, `rally`;
`coaster`, `queue`, `track`; `party`, `guild`, `group`).

A station with no Phase C is complete without one. **Phase 1 ships zero vignettes.** This matters:
it means the first shippable version of the wing is genuinely small, and every vignette after that
is a data row plus a scene.

**Phase D — THE CARD.** The station's guaranteed hardware card is awarded exactly as a level's is:
the moment word earns a gold glint when typed, and the card itself is revealed when the player
leaves the station. Where the moment word lives depends on the station: with no Phase C it *is*
part of the boot line or a short follow-on line; with a Phase C it is guaranteed inside the pool,
identically to `pickGuaranteedCard`'s contract at a level.

**Exit.** Escape from a station → the hub; Escape from the hub → the arcade, landing the cursor
back on the machine you came through (`focusDoor(state, 'computerroom', stationId)`, which already
exists). Crediting follows Act 6's TF-T1 lesson: **leaving must never silently drop something the
player actually did** — if the moment word was typed, the card is awarded on the way out.

**A trap worth naming: this wing's typed content includes characters outside the 25-level token
contract.** `CLAUDE.md` §Engine input contract covers lowercase characters, uppercase A–Z (=
Shift+letter), space and Backspace — it does **not** describe shifted symbols like `"` or `*`.
Station 1 needs both. The wing does not route through `handleGameKey` (it is a parallel screen,
like Acts 6 and 7), so `station.js` matches on the literal `e.key` character. **Do not "fix" this
by widening the engine's token contract** — that contract is load-bearing for 25 levels and this
wing has no business touching it.

### 5.3 The sacred contracts, re-honored (this is a trap — name it loudly)

Identical to Act 7 §5.3, and for the identical reason: **a parallel input path does not inherit
the wrong-keypress contract for free.** `station.js` re-implements it, and its tests cite
INV-1..INV-5 directly rather than this wing's own numbers:

1. Wrong key → gentle nudge (`audio.js`), never harsh.
2. The character **stays and waits.** The boot line does not advance.
3. The mistake is logged quietly. No alarming display.
4. The correct key then advances normally, **no double penalty**.
5. Pure modifier keydowns are ignored entirely — never a mistake. *(Station 1's `LOAD"*",8,1`
   requires holding Shift, so this clause is load-bearing here in a way it is not in Act 7.)*

And this wing's own addition: **nothing in the room can be broken, lost, switched off, or
un-booted.** A machine that has been booted stays booted for the visit. There is no state in which
the player's progress through a boot line goes backwards.

### 5.4 THE CARD MODEL — the part that must be right

This is the most consequential decision in the spec, so it gets the most space.

#### 5.4.1 Why the current model cannot absorb these cards

`js/history-cards.js` attaches every card to a **level**, defined as *the earliest level whose
cumulative unlocked-key closure can spell its word* — a genuinely elegant rule, enforced by
**INV-56** in `tests/unit/history-cards.test.mjs`. A bonus wing breaks it in two directions at
once:

- **A wing has no levels.** There is no number to put in the field.
- **"Earliest typeable" degenerates.** Every key is unlocked by the time a wing opens, so the rule
  computes a level *inside the curriculum* for every wing word — putting a hardware card about a
  2004 broadband tower into, say, Level 10's pool. That is not where Trevor asked for it
  (*"history cards discovered HERE"*), and it would also dilute levels that already hold several
  cards each.

#### 5.4.2 The shape — a second attachment axis, not a second card system

```js
// js/history-cards.js — the SAME flat list, one new optional axis.
// Curriculum card (unchanged, still governed by INV-56):
{ id: 'floppy-disk', level: 10, word: 'floppy', title: 'FLOPPY DISK', year: '1971', fact: '…' }

// Secret card (unchanged, governed by INV-57):
{ id: 'wargames-joshua', level: null, secret: true, word: 'joshua', … }

// NEW — a station card:
{ id: 'the-1541-drive', level: null,
  wing: 'computerroom', station: 'commodore-64',
  word: 'drive', title: 'THE DISK DRIVE', year: '1982', fact: '…' }
```

Three properties make this the right shape rather than a parallel system:

1. **`cardsForLevel()` needs no change at all.** It filters `c.level === level`; `null` never
   equals a number, so station cards are excluded from every level pool by construction — the
   same mechanism that already excludes secret cards. Nothing in the curriculum can accidentally
   surface one.
2. **The collection needs no change.** `js/slots.js` stores collected **card ids**
   (`collectCardId`, `collectedIds`), not levels. A station card collects, persists, migrates and
   erases exactly like every other card, per slot, with zero schema change.
3. **The rotation store needs no change either.** `cardRotation` is already a **string-keyed map**
   (`{ "<level>": int }`, `bumpCardRotation(level)` writing `String(level)`). Station rotation
   keys are simply namespaced strings — `"cr:apple-iie"` — which cannot collide with `"13"`.
   `normalizeSlot` already accepts any object there. **This is the single biggest reason to
   prefer this model: the persisted save format does not change at all**, so there is no
   migration, no version bump, and no way for an old save to be damaged.

#### 5.4.3 The functions

```js
export function cardsForStation(wingId, stationId)   // mirror of cardsForLevel
export function pickFromPool(pool, collectedIds, rotation)   // the existing picker, generalized
export function pickGuaranteedCard(level, collected, rot)    // = pickFromPool(cardsForLevel(level), …)
export function pickGuaranteedStationCard(wing, station, collected, rot)
                                                             // = pickFromPool(cardsForStation(wing, station), …)
export const ARCADE_CARDS   // cards with a numeric level, plus secret cards  — today's 60
export function wingCards(wingId)                            // this wing's set
```

`pickGuaranteedCard` is **refactored, not duplicated**: extracting `pickFromPool` keeps INV-58's
guarantees (exactly one per call, prefers uncollected, deterministic rotation, no `Math.random`)
true for both callers by construction rather than by a second implementation that can drift. Two
copies of a guarantee is how guarantees rot.

#### 5.4.4 The denominator — the thing that must not regress

Act 7's spec declined to award any cards in v1 for exactly one reason, and it is the right
reason:

> *"Would inflate the '★ found / total' denominator with cards unreachable until L25 + the door,
> making a mid-curriculum child's counter read worse for no reason."*

Today `TOTAL_CARDS = HISTORY_CARDS.length` and the gallery renders `'★ ' + found + ' / ' +
cards.length` over `allCards()`. Adding ~16 station cards flat would take every existing save from
`★ 14 / 60` to `★ 14 / 76` overnight — a number that got worse while the player did nothing.

**Decision: denominators become SCOPED. There is never one blended number again.**

- **The slot picker** keeps its current counter, computed over `ARCADE_CARDS` (numeric-level cards
  + secret cards) — **byte-identical to today** for every player. Once a save has opened the wing,
  a *second* counter appears on that row: `▣ 3 / 16`. A player who never opens the door never sees
  it and never sees their first number change.
- **The gallery** (`renderCollectionScreen`) grows shelves: `THE ARCADE — ★ 14 / 60` and, below
  it, `THE DEN — ▣ 3 / 16`, each with its own count over its own set. Unfound cards stay `???`
  silhouettes within their shelf, preserving the existing tease.
- **The wing's shelf appears only once the wing has been opened in that save.** A locked shelf
  advertising 16 cards a child cannot reach is the same emotional bug as the inflated denominator,
  one step removed.
- **`TOTAL_CARDS` stops being exported as a single truth.** The level-complete overlay's
  `CARD n OF ${TOTAL_CARDS}` (`js/main.js:1048`) reads `ARCADE_CARDS.length`; a station's card
  overlay reads the wing's.

This is stated as a hard, testable property in INV-96, because it is the one thing that could
quietly damage an existing player.

#### 5.4.5 What happens to INV-56 — amended in scope, never weakened

**INV-56 is not deleted and its rule does not change.** It is re-stated to bind the cards it was
written for:

> **INV-56 (amended)** — every card **with a numeric `level`** has a `level` equal to the minimum
> level whose cumulative unlocked-key closure can spell its `word`. Cards without a numeric level
> (secret cards; station cards) are outside its scope and are governed by INV-57 and INV-94/95.

**INV-57 is generalized in the same edit** — from *"secret cards never enter a level pool"* to
*"no card without a numeric `level` is ever returned by `cardsForLevel()` for any level 1–25"* —
which covers both kinds with one assertion and cannot be out-of-date when a third kind arrives.

Both edits are **design-doc-first changes** to `docs/testing/STRATEGY.md` §5, made in the same
change as the code, with the test moving after the catalog (`.claude/rules/testing.md` rule 1).

#### 5.4.6 The card slate — subjects, not prose

**I am not writing these cards.** Every one is a historical claim about hardware and belongs to
the **arcade-historian** agent (`CLAUDE.md`: *"Never write research prose from model memory"*).
What this spec fixes is the *shape*: roughly two cards per station, sixteen total, each a hardware
moment belonging to the machine you are standing at.

**⚠️ A finding the historian needs up front: the curriculum bank has already spent most of the
obvious hardware vocabulary.** These 60 words are taken — `ada hal hedy www floppy mouse turing
grace pixel eliza c64 386 y2k 1969 \o/ Eniac hello world asdf flash ai disk gui atari altair
software apple email brain intel pacman cave unix zork 56k ipv4 486 1970 wi-fi` `` `hack` `` `IBM
rubber duck dial trash lod whistle mod levy spam bbs mentor phrack cyberpunk coupler 2600 reader
gadget trail boots stickybear joshua`. Card words are currently **unique across the whole bank**
(verified), and INV-97 makes that a rule — because a duplicated word would glint ambiguously
against two different cards. So the wing's words must come from the *unspent* hardware
vocabulary: things like `drive`, `chip`, `ram`, `tape`, `modem`, `cursor`, `monitor`, `cable`,
`sound`, `boot`, `bios`, `port`, `beige`, `tower`, `lan`, `guild`, `party`.

Candidate subjects per station, with the grounding that already exists:

| Station | Candidate card subjects | Grounding today |
|---|---|---|
| Commodore 64 | the disk drive; the sound chip | [[commodore-64]] ✓ (note: the `c64` card at L17 already tells the "best-selling computer" story — **the wing's cards must not repeat it**) |
| Apple IIe | the machine a generation learned to type on; the keyboard-on-screen idea Stickybear used and this game reuses | [[apple-computer]] ✓, [[stickybear-typing]] ✓, media ✓ (incl. a next-key-highlight contact sheet) |
| Beige PC 1993 | the CD-ROM; VGA colour | [[intel-486]] ✓, [[console-hardware-silhouettes]] ✓ + photo; CD-ROM **needs a historian pass** |
| Multimedia PC 1995 | the sound card; the game that shipped with the machine | **needs a historian pass** |
| Two PCs + a cable | the null-modem/LAN cable; the first time two machines played one game | **needs a historian pass** (adjacent: [[dialup-modem]] ✓, [[56k-modem]] ✓) |
| Late-90s tower | the 3D accelerator card; megahertz | [[early-3d-era]] ✓ (partial) |
| Turn-of-century desktop | the CD burner; USB | **needs a historian pass** |
| Broadband tower | always-on; the machine that never gets switched off | [[56k-modem]] ✓ as the contrast; broadband **needs a historian pass** |

### 5.5 Unlock — open at Level 20, and let the stations light up

**Acts 6 and 7 both gate on `DOOR_UNLOCK_LEVEL = 25`.** The question the ROADMAP asks is whether a
*museum* should. My answer is no, and the argument has four parts:

1. **This wing teaches no keys and, unlike its siblings, need not demand any it hasn't taught.**
   Act 7's tracks and Act 6's worlds use free prose and arbitrary words — they genuinely require
   the whole keyboard. This wing's typed content is *authored per station*, so a station's key
   requirement is a property we choose. Four of the eight stations need nothing beyond the letters,
   complete at **Level 15**.
2. **Level 20 is the game's own doorway to this subject.** The binary → `HELLO` beat is the moment
   the curriculum stops being about games and becomes about the machine. `levels/act4.md`: *"The
   whole game has been building here. Letters are numbers. Numbers are electricity."* A door to a
   room full of computers opening at exactly that beat is the strongest narrative placement
   available, and it is wasted at 25.
3. **The game already hands hardware history to a child at Level 4.** Cards teach `floppy` at L10,
   `c64` at L17, `386` at L18. Reading about the machines is demonstrably not an endgame activity.
4. **It is a Skulltula multiplier at the right moment.** L20 is exactly where a completionist
   player's curriculum is running out of new cabinets.

**The mechanism: stations light by key closure, not by hand-authored gates.** Each station's row
declares its typed content; `needsLevel` is **derived** from it using the same cumulative
unlocked-key closure construction INV-16/INV-20/INV-56 already use. A station whose content is not
yet spellable renders exactly as an unearned cabinet does today — a dark silhouette, label `???`,
`onPick: null`. This is the select screen's existing grammar (`renderSelectScreen`'s `locked`
branch), applied one level down. It costs one derived field and one `locked` branch in
`renderWingAct()`.

The pay-off is that **the museum fills in as you finish the keyboard**, which is both a true
statement about the history (the old machines had the hardest incantations) and a reason to come
back — without a single hand-tuned gate to maintain.

**⚠️ This requires a documented assumption to move first.** `docs/ROADMAP.md` §2 states: *"Acts 6+
all sit AFTER the full keyboard is learned, so they may use any key."* That sentence is a design
assumption, not a tenet, and this wing contradicts its first half while *honouring* the reason
behind its second half. **Per `.claude/rules/testing.md` rule 1 the doc changes first, with
Trevor's sign-off, and then the feature.** This spec does not edit that file (another lane owns
it). Q3.

**If Trevor prefers 25 for consistency**, the wing still works unchanged — every station is simply
lit on arrival and the per-station lighting mechanism is not built. That is the cheaper build, and
it is a legitimate answer; it just spends the Level 20 beat on nothing.

### 5.6 The content rating, operationally

`.claude/rules/product.md` §Content Rating was written from Trevor's ruling and governs this wing.
Restated as build-time constraints a reviewer can check:

**The line, concretely. Absolutely excluded from every string, word pool, card, plaque, scene and
piece of art in this wing:**

- **Gore.** No blood, no wounds, no corpses, no death animation, no "you have died," no bodies on
  a battlefield. Warcraft II's and WoW's scenes are **units moving, buildings rising, a group
  standing together** — never a fight resolving into a casualty.
- **Sexual content.** Absent, not softened. This includes the incidental: no suggestive art on a
  station's screen, no innuendo in a plaque.
- **Other adult themes.** No addiction framing, no gambling (this rules out several obvious
  "tycoon" directions and it also means **the pinball station is a pinball TABLE, never a wager**),
  no substance references, no real-world atrocity used as set dressing.

**War is allowed only as history, never as spectacle.** That is the §Content Rating allowance —
*"strategy and war as history"* — and the operational reading is: an RTS station may say what the
genre *was* (real-time strategy, resource gathering, two players on one cable) and show units and
buildings; it may not stage a battle for entertainment. The same clause that gave Missile Command
its cities that can never be hit (`levels/act5.md` L23) applies here.

**The safety floor does not move, in either direction.** `js/word-blocklist.json` is the single
definition every path enforces (security.md rule 7), the wing enforces it, and **a wing may never
lower it.** Note the direction that matters for authoring: the floor blocks `war` as an exact word
plus its inflections and enumerated compounds (`warzone`, `warfare`, `warhead`). So **a station's
word pool cannot contain `war`** — which is fine, because `WAR2` is a *boot line*, not a word-bank
entry, and the blocklist governs the words a child is asked to type as content. This distinction
must be written into the wing's authoring lint explicitly, or someone will later "fix" the
blocklist to accommodate a boot line. **It is the boot line that bends, never the floor.** If that
reads as too fine a distinction to trust, the fallback is trivial: the station's boot line becomes
`WC2`.

**A wing-specific never-word list**, in the shape Act 7 established: `kill`, `dead`, `die`,
`blood`, `corpse`, `slay`, `raid`, `loot`, `boss` — excluded from every pool and every line of
prose, whether or not the floor also catches them.

### 5.7 The MMO terminus — local by construction

The wing ends at a machine with an always-on connection, and the room it shows is full of other
people. **None of them are real, and none of them ever will be** — security.md rule 6 forbids
external network calls outright, the published build has no backend at all, and this is a
children's game. This is not a limitation to work around; it is the third time this project has
faced it and the answer is already proven twice:

- **Act 6** made its companions scripted personas and its "friend" a local model, with a
  server-composed safety prompt (`docs/features/text-worlds.md` World 5).
- **Act 7** made the opponent *your own previous lap* — the ghost.

Here the move is: **the other players are the scene.** A group stands around a fire; names float
above them; the chat log scrolls with authored lines; `/commands` do what they did. What the
player types is **the social layer** — `hello`, `party`, `follow`, `thanks`, `ready` — which is
the ROADMAP's own strongest argument for an MMO act: *"in an MMO, typing IS the game's social
layer."* That is a genuinely different typing motivation from accuracy (Acts 1–5), thought (Act 6)
and speed (Act 7), and it is reachable with zero networking.

**The punishment economy is stripped entirely**, per the ROADMAP's own constraint list: no corpse
runs, no XP loss, no gear loss, no PvP, no griefing surface, no waiting for a group, no queue.
Grouping is the mechanic; competition never is.

**Do not build this station until the arcade-historian has done the era pass.** The existing wiki
covers the *pre-*WoW lineage well ([[neverwinter-nights-1991]], [[early-graphical-mmorpgs-1990s]],
[[mud]], [[island-of-kesmai]], [[meridian-59]], [[mangband]]) and covers World of Warcraft not at
all.

### 5.8 Art — DRAW A REAL THING, and get the photograph first

`.claude/rules/theme-authoring.md` is unambiguous, and journal **F29** is the scar: *text-only
descriptions produced three wrong control panels in one afternoon.* For this wing the rule is
sharper than usual, because **the machine is the subject** — a wrong machine is not a detail, it
is the whole card being wrong.

- **Every station ships with a photograph in the vault first**, at
  `research/wiki/media/console-hardware-silhouettes/<machine>.jpg` (or its own page's folder),
  with the required `Source` / `Licence` / `Retrieved` credit block (`research/WIKI.md` §Media).
  `node scripts/wiki-search.mjs --lint` already fails on orphan/broken/misplaced media.
- **Already in the vault, ready to use:** `apple-iie-system.jpg`,
  `beige-desktop-pc-monitor-on-top.jpg`. **Already drawn and committed:** `drawAppleIIe`,
  `drawBeigePC`. That is two of Phase 1's three stations with zero new art risk — which is most of
  why they are Phase 1.
- **Needs sourcing before drawing:** the Commodore 64 + 1541, a 1995 multimedia PC, a late-90s
  tower, a turn-of-century desktop, a broadband-era tower with an LCD. Five photographs.
- **Draw the machine it DEBUTED on** (`console-hardware-silhouettes.md` §"Which machine to draw").
  Every title on this wall debuted on a PC, so there is no arcade-conversion trap here — but there
  is the inverse trap, and it is the whole reason this wing exists: **no station in this wing may
  be drawn as an upright arcade cabinet.** These are things you sit at.
- **The PlayStation is grey.** Recorded here because it is the page's own cautionary note about a
  summariser asserting hardware colour from memory. The same class of error is available for
  every machine on this wall.

---

## 6. Safety & privacy

**What this wing introduces:** nothing new in any class, if the card model is built as specified.
That is a deliberate property, not a coincidence.

| Concern | Chain that must run | Where it exists today | Missing? |
|---|---|---|---|
| **localStorage schema** | security.md rule 4 — parse in try/catch, validate field-by-field, garbage → default, never throw | `normalizeSlot()` in `js/slots.js` | **Nothing — by design.** Station cards persist as ids in the existing `cards` array; station rotation persists as namespaced string keys in the existing `cardRotation` map. **No new field, no version bump, no migration.** If a later phase wants per-station state beyond this, it inherits `speedway`'s pattern and re-triggers `/security-review` |
| **DOM sinks** | security.md rule 1 — user-influenced strings via `textContent` only | The wing draws on the shared canvas with `fillText`; all labels are literals. `renderCollectionScreen` already builds cells with `createElement` + `textContent` | Nothing new. The gallery's new shelf headers are literals |
| **Free text** | security.md rule 3 — allowlist at the boundary | n/a — v1 has **no free-text input** | Nothing. Any later "name your city / your character" feature inherits `buildPlayerNamePattern`'s allowlist **and** re-triggers `/security-review` |
| **Network** | security.md rule 6 — no external calls; relative `/api/*` paths only | The wing makes **zero** fetches and needs none | Nothing. It behaves identically on the Go binary, docker, and the published static host |
| **PII** | security.md rule 8 — one display name per save, nothing more | Card ids and rotation counters are gameplay data | Nothing. **The MMO station must not prompt for a character name** — that would be a second display name, and the floor is one |
| **Word safety** | The single-source floor (`js/word-blocklist.json`), enforced, never lowered | `BASE_WORDS` / `hasBlockedWord` | **Add the authoring lint** (§5.6): no wing pool word matches the floor or its inflections, and none matches this wing's never-word list. Curated pools are not generation-filtered, so the lint is the only gate |
| **Historical claims** | The arcade-historian, never model memory | `research/wiki/**` + `scripts/wiki-search.mjs` | **Substantial — see §Wiki gaps.** Four of eight stations have no grounding at all today |

**`/security-review` verdict: NOT required for Phase 1 as specified**, because Phase 1 adds no
DOM sink fed by a variable, no hook, no child process, **no localStorage schema change**, and no
free-text input — the five explicit triggers in security.md. **It becomes required the moment any
of these is true:** a station stores per-station state in a new slot field; any station accepts
typed free text that is stored or displayed back; or the MMO station gains any form of name entry.
Flag it in the PR rather than deciding at the end.

**Platform key label:** every prompt in this wing confirms with **Space**, never Return — the
house quick-advance key everywhere but name entry (`levels/onboarding.md`) — so no canvas string
ever has to say "ENTER" and `[data-enter-key]` never enters the picture. If a station ever must
name that key it resolves the platform label through `main.js`'s existing detection; it is never
hard-coded.

---

## 7. Non-goals

This wing explicitly does **not**:

- Teach any new key, or change any curriculum level, cabinet, word bank or default. A player who
  never opens the door sees a byte-identical game — including their card counter (INV-96).
- **Change any card's `level`, or move any existing card.** The hardware cards already in the
  curriculum (`floppy`, `c64`, `386`, `486`, `altair`, `disk`, `intel`, `apple`, `gui`, `mouse`,
  `pixel`, `flash`) stay exactly where they are.
- Contain a timer, a countdown, a score, a life, a placement, a queue, a wait, a fail state, or
  any state in which the player's progress at a machine goes backwards.
- Contain a bespoke playable recreation of Warcraft II, RollerCoaster Tycoon, The Sims or World of
  Warcraft. The scene shows the software running; the player types at the machine.
- Talk to any network, ever — no MMO server, no leaderboard, no sync, no `/api/*`, not optionally.
- Use generated content of any kind. Nothing here needs it, and a generated historical claim is
  precisely what the historian rule forbids.
- Accept free text from the player (v1), or prompt for any second name (ever — the PII floor).
- Contain gore, sexual content, gambling, or any other adult theme (§5.6). Not toned down: absent.
- Draw any station as an upright arcade cabinet (§5.8).
- Claim EverQuest, Rocky's Boots, or any of the 25 levels' titles. One game per cabinet.
- Replace the Stats Cabinet (ROADMAP §1.3) or the collection gallery. It adds a shelf to the
  gallery; it does not become one.
- Introduce a build step, a bundler, a CDN fetch, or a vendored library. Canvas 2D throughout —
  the era ceiling here is a 2004 desktop, well inside what the game already draws.
- Support touch/mobile (ROADMAP §2b).

---

## 8. Risks & residual risk

| Risk | Severity | Mitigation | Residual |
|---|---|---|---|
| **The card-model change damages an existing save's counter** | **high** | Scoped denominators (§5.4.4) + INV-96 written as a *no-visible-change* property for a player who hasn't opened the wing; no storage schema change at all | Low once INV-96 exists. This is the one thing to review hardest |
| **INV-56's amendment is read as a weakening** and a later card lands in the wrong pool | high | Amend the *scope* clause in STRATEGY.md §5 and generalize INV-57 in the same edit; add INV-94 (exactly one attachment axis) so a mis-authored card fails a test rather than silently pooling | Low, and the invariant is cheap |
| **The sacred wrong-keypress contract is re-implemented in `station.js` and drifts** | high | Tests cite INV-1..5 directly through the station loop, as Act 6 and Act 7 both had to | **Real, and now structural**: this is the *third* implementation of one contract. Worth a standing note that a fourth wing should extract it |
| **Four of eight stations have no historical grounding whatsoever** | **high** | Historian pass is a hard gate per station; no plaque or card copy is written by a builder | Real until the pass lands. Phase 1 is chosen to be the three with the most grounding |
| **A wrong machine is drawn** (F29 again, with the machine as the subject) | high | Photograph in the vault before any drawing; INV-113 makes the media reference a *data requirement* of a station row | Low if the gate holds; catastrophic for a card's meaning if it doesn't |
| **The content line is crossed incrementally** — a battle scene that "just shows units" grows | medium | §5.6's concrete exclusions + the never-word lint + INV-112; the RTS and MMO scenes are specified as *building and grouping*, never *fighting* | Real. Art is not lint-checkable; this needs a human look, per `.claude/rules/playtest.md` |
| **The L20 unlock contradicts a documented assumption** | medium | Doc first, then feature (§5.5, Q3). The fallback (gate at 25) is a one-line registry change | None if the order is respected; a constitution/codebase disagreement if it isn't |
| **The wing reads as a repetitive row of beige boxes** | medium | The wall is ordered by *machine*, each station is a different hardware beat, and the boot lines differ by 22 years of history. Verify by **looking**, twice (`playtest.md`) | Real. The four late stations are the risk; they are Phase 3 for this reason |
| **"Walk up and read a plaque" is not enough to bring a child back** | medium | The boot verb + the guaranteed rotating card (a station with N cards takes ~N visits, the proven Skulltula loop) | Real, and the honest answer is: watch Oona's second visit specifically |
| **A boot line collides with the safety floor** (`war`) | low | The boot line bends, never the floor (§5.6); fallback `WC2` | None |
| **Act numbering** — a fourth wing on a five-act spine | low | `num` is data; already flagged in ROADMAP | Cosmetic |

---

## 9. Phased rollout

Each phase is independently shippable and revertible.

**Phase 0 — the card model, with no wing at all.** Add the `wing`/`station` axis, `cardsForStation`,
the `pickFromPool` refactor, `ARCADE_CARDS`, scoped gallery shelves and the second slot-picker
counter — with **zero station cards authored**, so every number in the game is provably unchanged.
Amend INV-56/INV-57 in `docs/testing/STRATEGY.md` §5 and add INV-94..97. *This phase ships on its
own and is worth shipping on its own: it is the only part that can break something.* *Revert =
delete the axis.*

**Phase 1 — the room and three stations.** One `BACK_WALL_DOORS` row; `hub.js`; `station.js` with
phases A, B and D (no vignettes); the Apple IIe, the beige MS-DOS PC (both already drawn — move
them out of `HOME_MACHINES` and delete it) and one Windows-era PC. Two cards per station, authored
by the historian. Per-station key-closure lighting **if** the L20 unlock is approved, otherwise a
`doorUnlocked` row like its siblings. *Revert = delete the registry row; the cards become
unreachable but harmless.*

**Phase 2 — the fiddly machine and the LAN beat.** The Commodore 64 (`LOAD"*",8,1`, lighting at
L24 — the wall's first *and* last-lit station) and the two-PCs-and-a-cable Warcraft II station,
with its first vignette. Needs two photographs and a historian pass.

**Phase 3 — the late wall and the terminus.** RollerCoaster Tycoon, The Sims, and World of
Warcraft as the social-layer vignette (§5.7). Needs three photographs and the largest historian
pass. **Ship the terminus last on purpose** — it is the wing's payoff and its biggest rating
surface, and it benefits from every lesson the earlier stations teach.

**Parallel, unblocked, and worth doing whether or not this wing ships:** seed additional hardware
cards into existing level pools at their computed earliest-typeable levels. It is the cheap half of
§3 option C, it costs nothing if the wing slips, and it pre-seeds the wing's vocabulary the way
Act 7's automotive cards pre-seed its tracks.

---

## 10. Acceptance criteria — candidate invariants

Written for `test-engineer` to implement directly. Next free ID is **INV-94** (INV-92 is retired,
INV-93 is the cabinet-year check). Each cites its design source, per `.claude/rules/testing.md`.

**Two existing invariants are AMENDED in `docs/testing/STRATEGY.md` §5 in the same change** (§5.4.5):
**INV-56** is re-scoped to cards with a numeric `level`; **INV-57** is generalized from "secret
cards" to "any card without a numeric `level`." Neither rule weakens.

- **INV-94** (L1) **A card has exactly one attachment axis.** Every card in `HISTORY_CARDS`
  satisfies exactly one of: (a) a numeric `level` in 1–25 with no `secret`, `wing` or `station`;
  (b) `level: null` + `secret: true` with no `wing`/`station`; (c) `level: null` + a `wing` id and
  a `station` id, both non-empty strings, with no `secret`. A card with two axes, or none, fails.
  Every `(wing, station)` pair names a wing in `BACK_WALL_DOORS` and a station registered on that
  wing's wall. (js/history-cards.js module header; this spec §5.4.2.)
- **INV-95** (L1) **Station pools behave exactly like level pools.** `cardsForStation(wing,
  station)` returns only cards attached to that pair; `pickGuaranteedStationCard` returns exactly
  one card for a station holding a pool and `null` for one holding none, prefers a card not in
  `collectedIds`, and cycles deterministically with the rotation counter (no `Math.random`) — so a
  station with N cards is fully collectable across ~N visits. Both pickers delegate to a single
  `pickFromPool`, so INV-58's guarantees hold for both by construction rather than by duplication.
  (product.md §History Cards, the Skulltula loop; js/history-cards.js `pickGuaranteedCard`.)
- **INV-96** (L1) **Adding wing cards changes nothing a player who has not opened the wing can
  see.** With station cards present in the bank, a save that has never entered the wing renders
  the identical slot-picker counter and the identical level-complete `CARD n OF m` denominator it
  would render with the station cards removed — i.e. the arcade denominator is computed over
  `ARCADE_CARDS` (numeric-level + secret) and never over the whole bank. The wing's own shelf and
  counter appear only for a save that has opened the wing. (product.md §1 "A child should leave
  every session feeling capable"; `docs/specs/act7-speed-racing.md` §5.7 — the denominator-inflation
  argument that kept cards out of Act 7.)
- **INV-97** (L1) **Card words are unique across the whole bank.** No two cards in `HISTORY_CARDS`
  share a `word` (case-insensitively, after token normalization), so `patternMatchesCard` can never
  match a typed pattern to two different cards and no moment word can glint ambiguously. (True
  today across all 60 cards; js/history-cards.js `patternMatchesCard`.)
- **INV-98** (L1/L2) **Nothing in the wing asks for a key the curriculum has not taught.** For
  every station, every character of every piece of typed content (boot line and word pool) lies
  within the cumulative unlocked-key closure of that station's declared `needsLevel`, and
  `needsLevel` is **derived from the content** by the same closure construction as INV-16/INV-20/
  INV-56 (an uppercase letter requires its base key AND Shift; a space requires Space). A station
  whose `needsLevel` exceeds the player's progress is rendered as an unearned silhouette and cannot
  be selected; with the WOPR bypass every station is available. (product.md §Level Structure — keys
  are taught in order; `js/ui/cabinet-art.js`'s existing `locked` branch as the grammar.)
- **INV-99** (L2) **The wrong-keypress contract holds verbatim in the wing.** A wrong key at any
  typed prompt in any station produces a gentle nudge, the character stays and waits, the mistake
  is logged quietly, and the correct key then advances with no double penalty; pure modifier
  keydowns are never a mistake (load-bearing: at least one boot line requires holding Shift); and
  no wrong key ever un-boots a machine, reverses progress through a boot line, or resets any
  counter. (CLAUDE.md §Wrong Keypress Behavior; product.md §3; the same re-implementation trap as
  INV-77.)
- **INV-110** (L2) **Nothing in the wing can be failed, timed, or lost.** No station starts a
  timer, countdown, score, life, placement, queue or wait; no station can reach a state from which
  it cannot be completed; every station completes by typing alone at any rate whatsoever; and a
  station left idle for an arbitrary period is exactly where it was. No survival wrapper is ever
  started in this wing. (CLAUDE.md §The One Rule; product.md §1.)
- **INV-111** (L2) **Anti-trap: Escape always makes progress toward the arcade.** From every state
  in the wing — a boot prompt, a plaque, a vignette, the hub — Escape alone reaches station → hub
  → arcade, landing the cursor back on the machine it came through, and there is no state from
  which it fails. A card whose moment word was typed is awarded on the way out, however the player
  leaves. (mirrors Act 6's INV-46 and Act 7's INV-86; TF-T1 — leaving must never silently drop what
  the player did.)
- **INV-112** (L1) **The wing enforces the safety floor and never lowers it, and its own
  never-words are absent.** Every word in every station pool, and every authored string in the
  wing, is checked against `js/word-blocklist.json`'s floor (exact word plus its generated
  inflections, per security.md rule 7) and against this wing's never-word list (`kill`, `dead`,
  `die`, `blood`, `corpse`, `slay`, `raid`, `loot`, `boss`); no floor entry is removed, weakened or
  bypassed by anything in the wing. (product.md §Content Rating — *"a wing may never lower it"*;
  security.md rule 7.)
- **INV-113** (L0/L1) **Every station draws a real, photograph-grounded machine — and never an
  arcade cabinet.** Each station row declares a `source` wiki page and a `media` path under
  `research/wiki/media/**`; both exist, and the media file carries the required Source/Licence/
  Retrieved credit block that `wiki-search.mjs --lint` enforces. No station's draw function renders
  the shared upright-cabinet shell. (theme-authoring.md §"Cabinet art is faithful… DRAW A REAL
  THING"; journal F29; research/WIKI.md §Media.)
- **INV-114** (L1) **The arcade-cabinet rule, mechanized.** No title appears twice across the whole
  game: the 25-level assignment table in `.claude/rules/levels.md`, Act 6's worlds, Act 7's track
  registry and this wing's station registry together contain no duplicated title, and no wing
  station's title matches any level's `label` in `CABINET_DATA`. (CLAUDE.md §Arcade Cabinet Rule —
  *"one game per cabinet, no reuse"*; this is the first time that rule has been testable rather
  than checked by hand.)
- **INV-115** (L0/L1) **The wing is lazily imported, network-free, and cannot brick the game.**
  `js/main.js` reaches `js/computerroom/*` only through a dynamic `import()` with static string
  specifiers; a failed import costs one warm "still being built" card that any key walks out of,
  and all 25 levels remain playable; every module in the subtree is reachable by
  `scripts/static-host-check.mjs` in **both** host shapes; and no code path in the wing issues any
  network request, so its behaviour on the published static host is identical to the Go binary's.
  (visual-validation.md §The Three Environments; journal F26; security.md rule 6;
  `docs/features/speedway.md` — the lazy-import reasoning.)

---

## 11. Open questions for Trevor — ✅ WORKED THROUGH 2026-09-14

**All twelve were answered interactively. The record, with reasoning, is §0.** Two of the answers
did not pick an option — they rejected the question's premise, and both were right:

- **Q on the wing's name** became *"scrap the den"*: the room analogy was the defect, not the room
  choice (§0.1).
- **Q on which RTS** became *"a whole room could be devoted to this"*: the wing was quietly
  hosting a genre cluster, and the right move was to move the builders out (§0.6).

**Still open, neither blocking Phase 1** (§0.7): the act number (`num: 8` taken as default), and
how faithful the late stations should be (unchanged — this spec still declines bespoke playable
recreations; if one is wanted it becomes its own phase with its own spec).

---

*Related: `docs/ROADMAP.md` §2 · `.claude/rules/product.md` §Content Rating · `.claude/rules/security.md`
rules 4/6/7/8 · `.claude/rules/theme-authoring.md` §"DRAW A REAL THING" · `docs/testing/STRATEGY.md` §5
(INV-56..60) · `docs/specs/act7-speed-racing.md` (the structural precedent, and §5.7's
denominator argument) · `docs/features/text-worlds.md` · `docs/features/speedway.md` ·
`docs/features/history-cards.md` · `research/educational-software.md` §5 ·
`research/wiki/tech/console-hardware-silhouettes.md` + its media vault · `research/WIKI.md` §Media.*
