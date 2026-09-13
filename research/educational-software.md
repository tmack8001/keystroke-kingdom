# Educational Software — This Game's Own Lineage
## Stickybear, Gizmos & Gadgets, and the floppy-disk era that invented what we're doing

*Written 2026-09-13, prompted by Trevor: "Other childhood favorites I want to include
somewhere / somehow: **sticky bear**, **gizmo and gadgets**. As I feel these were iconic
classics in the floppy disk and early computer gaming days." — and, clarifying: "Of course
not in the raceway."*

*The knowledge graph had ~210 citation-verified pages on arcade cabinets, consoles, hacker
culture and racing games, and **nothing** on educational software. That is a strange gap for
a game built to teach a child to read and type. This hub closes it. The two titles Trevor
named are the way in; the lineage is the point.*

**How to verify:** every claim below is carried on an atomic `research/wiki/` page with 2–4
references adjacent to it, per `.claude/agents/arcade-historian.md`. No URL here or on those
pages came from model memory — each appeared in a live fetch this session, and every
reference is labelled **[fetched]** or marked as unfetched. Fetch-failed sources were dropped
and are listed at the end. **Session constraint, disclosed:** the WebSearch budget was
exhausted before this lane began, so discovery ran through fetched search *endpoints*
(Wikipedia's search API, Internet Archive's advanced-search JSON, ERIC, the Computer History
Museum's site search) rather than a general web search. Every URL cited was fetched and read.
Consequences are noted honestly in "Unsourceable / weakly-sourced" below.

**Wiki pages this hub indexes:** [[stickybear]] · [[stickybear-typing]] ·
[[gizmos-and-gadgets]] · [[the-learning-company]] · [[rockys-boots]] · [[reader-rabbit]] ·
[[mecc]] · [[oregon-trail]] · [[carmen-sandiego]] · [[number-munchers]] ·
[[edutainment-era]]

---

## 1. The headline: we have an ancestor nobody knew about

**Stickybear Typing (Optimum Resource, 1985)** is not a fun coincidence. It is the closest
structural ancestor Keystroke Kingdom has, and it predates every tutor in our existing canon
list ([[mavis-beacon]] 1987, [[mario-teaches-typing]] 1992, [[slam-dunk-typing]] 1997).

From the photographed retail package in the Internet Archive, here is what shipped on that
48K Apple II floppy, beside what this project built forty years later:

| Stickybear Typing, 1985 | Keystroke Kingdom, 2026 |
|---|---|
| **Keypress** — "the simplest drills in home key position" out to "the full keyboard with shifts and numbers" | Levels 1–4 home row → 24 Shift → 16–20 numbers (`.claude/rules/levels.md`) |
| **Thump** — a fast-action game where typing saves Stickybear from thrown blocks | One arcade cabinet per level; the drill wearing a game costume |
| **Stories** — type "jokes, riddles, and stories from the Adventures of Stickybear" | L25's "MY STORY" coda; Act 6's riddle creatures (`js/textworld/riddles.js`) |
| "**Choose your own levels of difficulty**" | EXPERIENCE + MIN/MAX WORD LENGTH (`product.md` §Word Length) |
| "**store your efforts on the disk to track your progress**" | `js/slots.js` — a saved game per player on the family machine |
| A paper **keyboard reference guide** in the box | The in-game ANSI keyboard guide (`js/ui/hud.js`) |

Six independent design decisions, arrived at here from first principles, all shipping in
1985. That is worth knowing — not because it diminishes anything, but because it means the
instincts driving this project are the instincts that produced the software people still
remember with affection.

**The one thing we do not know is the most important one:** no source found this session
documents how Stickybear Typing handled a *wrong key*. So it cannot be cited as a precedent
for the One Rule. [[error-feedback-pedagogy]] remains the only grounding for that.

Full detail: [[stickybear-typing]], [[stickybear]].

---

## 2. The other headline: Warren Robinett is already in this game

`.claude/rules/easter-eggs.md` calls `adventure` → `WARREN ROBINETT WAS HERE. 1979.` "the
most thematically perfect egg in the game." This research pass found out why it is even more
perfect than anyone knew.

**On May 8, 1980, Warren Robinett co-founded The Learning Company** — with Ann McCormick,
Leslie Grimm and Teri Perl, on a National Science Foundation grant. The programmer who hid
the first video game easter egg then spent the 1980s making educational software. In **1982**
he and Grimm shipped **[[rockys-boots]]**, in which a seven-year-old wires AND, OR and NOT
gates into a circuit that drives a boot. It won Software of the Year and a Parents' Choice
award. It is described as "one of the first educational software products for personal
computers to successfully use an interactive graphical simulation as a learning environment."

Leslie Grimm, his co-designer on that logic game, also created **[[reader-rabbit]]** (1984) —
the era's landmark *learn to read* program. One designer, early reading and Boolean logic.
That is Keystroke Kingdom's own arc, from Level 1 to Level 20's binary reveal, walked by
someone in 1984.

And **The Learning Company is also the publisher of Gizmos & Gadgets** — so both of Trevor's
named favourites sit inside a single lineage that runs back through Robinett to the Atari
2600 cartridge our title screen already salutes.

Full detail: [[the-learning-company]], [[rockys-boots]], [[warren-robinett]].

---

## 3. Gizmos & Gadgets — and the raceway problem, honestly

**Super Solvers: Gizmos & Gadgets!** (The Learning Company, 1993, MS-DOS/Mac, ages 7–12):
solve physics puzzles in warehouse mazes to win vehicle parts, **build a vehicle**, race it
against Morty Maxwell. Fifteen races, three categories (automotive, alternative energy,
aircraft). It taught simple machines, magnets, basic electronics and forms of energy — and
taught them by consequence, e.g. that "a rounded nose on a car is more aerodynamic and faster
than a flat nose."

**Trevor said "of course not in the raceway," and that instinct is right — for a reason worth
stating.** Gizmos & Gadgets *is* filed as a racing game, and its win condition is fifteen
races. But the child never gets better at *racing*; they get better at *building*. The race
is a test bench. Act 7's thesis is that typing speed is the throttle — a genuinely different
idea. Putting Gizmos & Gadgets in the Speedway would import its costume and discard its
lesson.

Its real sibling in this wiki is [[rockys-boots]]: build a machine, watch it succeed or fail
on its own terms, go back and build a better one. **Losing a race hands the loss back as a
reason to return to the warehouse** — the same emotional contract as our wrong-keypress rule,
in a different medium. (Stated as design reading, not as a sourced claim about the game's
feedback behaviour — see the caveat on [[gizmos-and-gadgets]].)

Full detail: [[gizmos-and-gadgets]].

---

## 4. The era, and what the good ones got right

The full account is on [[edutainment-era]]; the spine:

- **"Edutainment"** attached to software games in **1983** (Chris Harvey, Telford ITEC,
  Oric-1/Spectrum, UK), as the post-crash pivot to titles that "would not only satisfy
  children's entertainment but would please parents and educators."
- **The houses:** [[mecc|MECC]] (1973, created by the Minnesota Legislature — *state-funded*),
  [[the-learning-company|The Learning Company]] (1980, NSF-seeded), Brøderbund (1980, the
  Carlston siblings), Davidson & Associates (1982, founded "to publish Jan's educational
  Software" — a teacher's own material), Optimum Resource / Weekly Reader Software.
  **Two of the five were publicly funded and one was founded to publish one teacher's
  work.** This was not, at the start, a venture-scale consumer industry.
- **The landmarks:** [[oregon-trail]] (1971 teleprinter → 1975 MECC network → 1980 Apple II;
  65M+ copies; World Video Game Hall of Fame 2016), [[rockys-boots]] (1982),
  [[reader-rabbit]] (1984), [[stickybear-typing]] (1985), [[carmen-sandiego]] (April 23,
  1985), [[number-munchers]] (1986), [[gizmos-and-gadgets]] (1993), Math Blaster! (1983 —
  "the best-selling piece of math software in history").
- **How it ended:** SoftKey's $606M hostile takeover of TLC (Dec 1995), MECC ($370M, Oct
  1995), Brøderbund ($420M, June 1998, 42% of staff cut), Mattel (Aug 1999), MECC shut down
  Oct 1999. Nearly every landmark here ended inside one company, and then the company ended.

### Was the era actually full of punishing drill? Yes — honestly.

The brief asked for an honest answer, so: **the commercial centre of gravity was drill.**
Math Blaster, the best-selling math software in history, is a shooting gallery over an
arithmetic worksheet. Number Munchers is an evaluate-the-rule drill with pursuers.
Stickybear Typing's own headline mode is explicitly "drills." Douglas Clements (ERIC
ED436231) reports that classroom computers were used "mostly for drill-and-practice," and
Cynthia Char's 1990 report treats exploratory, open-ended software as a *development* rather
than the baseline.

**Scope discipline:** those ERIC sources describe classroom *use* and early-childhood trends,
not a census of the catalogue. The supportable statement is: *drill-and-practice was the
dominant mode; exploratory titles were a distinct and newer category; and the titles people
remember with love are disproportionately the exploratory ones.*

### The inheritance the One Rule actually has

`product.md`'s One Rule — *"the game should only ever stop a player's flow with joy, never
with punishment"* — is a position in an argument this era was already having. Clements states
it as well as anyone: *"Educational technology can change the way children think, what they
learn, and how they interact with peers and adults, or technology can teach the 'same old
stuff in the same old way.'"*

Six things the good ones did, each drawn from a sourced record:

1. **The child makes something, and it runs.** The boot kicks or it doesn't; the vehicle wins
   or it doesn't. Feedback is the artifact behaving — *not a score*.
2. **Failure returns you to the workshop, not to the start.**
3. **The reward is the next thing to do** — the next river, the next country. Not a point
   total.
4. **They sent the child out of the game.** Carmen Sandiego shipped with a real printed
   almanac you had to open.
5. **The learner set the difficulty** ("Choose your own levels of difficulty," 1985).
6. **Practitioners were in the room.** Reader Rabbit was "developed with input from educators,
   parents, children, and reading specialists."

Keystroke Kingdom already does 2, 3, 5 and 6. **1 and 4 are the unclaimed inheritance** — and
they are what the placement options below are really about.

---

## 5. Placement — options for Trevor, ranked, with trade-offs

*Proposing only. Nothing outside `research/` was touched.*

### The hard constraint, restated
The **arcade-cabinet rule** (`CLAUDE.md`): one game per cabinet, no reuse — and all 25 level
cabinets are assigned. Neither title can take a level slot without displacing something.
New space exists only in the bonus wings (Act 6 Text Worlds, Act 7 Speedway) and the proposed
acts in `docs/ROADMAP.md` §2.

---

### Option 1 — **History cards. Do this first.** (recommended)
Lowest friction, zero cabinet cost, and the system is already a proven completionist hook
(55 cards, per-level pools, per-slot collection). A card is how this game says "this mattered"
without needing a room for it.

**Trade-off:** a card is eight seconds of reading. It satisfies "somewhere / somehow"
genuinely but shallowly, and it will not feel like *playing* Stickybear. If Trevor's wish is
to have his daughter experience these games, a card is a plaque, not a visit.

**Card candidates** in the established `js/history-cards.js` format. `level` = the EARLIEST
level whose unlocked keys can spell the word, computed against the unlock table in
`CLAUDE.md`/`js/levels.js`. **All five words checked against `js/word-blocklist.json`
(exact-word matching; `js/word-blocklist.js` confirms there is no substring layer) — all
clear.**

| id | level | word | why that level | title / year |
|---|---|---|---|---|
| `stickybear-typing` | **13** | `stickybear` | `c` unlocks at L13 (last needed letter) | STICKYBEAR TYPING / 1985 |
| `gizmos-gadgets` | **8** | `gadget` | `t` unlocks at L8 | GIZMOS & GADGETS / 1993 |
| `oregon-trail` | **8** | `trail` | `t` unlocks at L8 | THE OREGON TRAIL / 1971 |
| `rockys-boots` | **13** | `logic` | `c` unlocks at L13 | ROCKY'S BOOTS / 1982 |
| `reader-rabbit` | **12** | `rabbit` | `b` unlocks at L12 | READER RABBIT / 1984 |

Draft copy, in the warm ≤160-char house tone:

- **`stickybear` / STICKYBEAR TYPING / 1985** —
  "A big friendly bear taught kids to type off a floppy disk: home keys first, then jokes and
  riddles to type for fun. Sound familiar?" *(134 chars)*
- **`gadget` / GIZMOS & GADGETS / 1993** —
  "A game where you BUILT a machine, then raced it. If it lost, you went back and built a
  better one. Losing was just the next turn." *(128)*
- **`trail` / THE OREGON TRAIL / 1971** —
  "Three student teachers wrote it in two weeks on a computer that printed onto paper. Kids
  played it in school for forty years." *(124)*
- **`logic` / ROCKY'S BOOTS / 1982** —
  "The man who hid the first secret in a video game made this one, where kids wired up real
  computer logic. A boot kicked the answer." *(131)*
- **`rabbit` / READER RABBIT / 1984** —
  "Made by Leslie Grimm to help little kids read. She also made a game teaching computer
  logic. Reading and machines, from one person." *(133)*

**Note the `logic` card is a hidden crossover** with the `adventure` easter egg — a parent who
knows the egg gets a small jolt. It never names Robinett, so it does not spoil the egg.

**Kid-safety flag on the Oregon Trail card:** the game's most famous line is a death message,
and `died` / `death` / `dead` are floor entries in `js/word-blocklist.json`. The copy above
deliberately celebrates the teleprinter origin and longevity instead. Any future Oregon Trail
copy must hold that line.

---

### Option 2 — **Set dressing in Acts 2 and 3** (recommended alongside Option 1)
`.claude/rules/levels/act2.md` already describes the Computer Wing as a room where
"computers and consoles from different eras line the walls, each one running a classic game,"
and Act 2 has shipped exactly this kind of object before (a gold-cartridge NES beside a wooden
TV at L10; a Game Boy Pocket on a backlit stand at L15). **The eras line up without any
stretching:**

- **Stickybear → Act 2 (1981–1986).** Its artifacts are dated 1983–1988 on the Apple II. An
  Apple II on a wing shelf with a floppy in the drive is era-correct and costs no cabinet.
- **Gizmos & Gadgets → Act 3, The Basement (1991–1996).** It is a 1993 DOS/Mac game; a beige
  PC in the corner of the Basement is exactly right.

This is also the **direction Trevor already gave on 2026-09-13** in ROADMAP §2 — *"In the back
of the arcade there can be computer terminals and game systems which wouldn't be gimmicky at
all and would stay on brand"* — with its stated principle **DRAW A REAL THING**. An Apple II
is a real thing. An invented Stickybear coin-op would violate it.

**Trade-off:** background art is easy to miss entirely, and a child who never played these
games gets nothing from it. It is a gift for the parent, not the kid. It also requires theme
work in `js/themes/` owned by other lanes.

---

### Option 3 — **Rocky's Boots as the anchor of the learn-to-program act** (the strongest
structural fit — but the anchor is not the title Trevor named)
ROADMAP §2's **Act 9(?) "Make the Machine Do It"** explicitly says *"Do NOT invent the CS
history from memory — route era/attribution claims (Logo, Scratch, `hello world`'s origin,
the Hacker Ethic) through `arcade-historian`/the wiki."* [[rockys-boots]] is that research,
delivered — and it is a better anchor than Logo for this specific game, because **its author
already lives in our easter-egg layer.**

**Honest assessment of Gizmos & Gadgets in that act: a good conceptual fit, a stretch
mechanically.** The hypothesise → build → test → revise loop is exactly the act's shape. But
its test is a *race*, which Trevor has ruled out, and its subject is physical mechanics, not
computation. Use it as a **design reference** for the act's build-and-test loop; use Rocky's
Boots as the **historical anchor**. Do not try to make Gizmos & Gadgets the act.

**Trade-off:** this act is unspecced and far out. It answers "somehow" beautifully and
"somewhere" not for a long time.

---

### Option 4 — **An "Edutainment Wing" bonus act** (the big swing)
A wing of floppy-era educational software: an Apple II you sit down at, a disk you choose.
It is the only option that lets Oona actually *play something that feels like Stickybear*, and
it is the only one that claims inheritances 1 and 4 above (make something that runs; send the
child out of the game).

**Trade-offs, and they are real:** (a) it substantially overlaps Act 6's Text Worlds, which
already is "a parallel wing of typed, non-arcade experiences"; (b) the honest finding of
section 4 is that much of this era was drill — a wing that faithfully recreates it risks
recreating worksheets; (c) it is the largest build on this list by a wide margin. **Recommend
only if Trevor's answer to "somewhere/somehow" is genuinely "I want her to play these."**

---

### Option 5 — **An easter egg** (cheap, and the menu just emptied)
`.claude/rules/easter-eggs.md`'s "Proposed (unbuilt)" list is empty for the first time. Two
candidates that satisfy its strict rules (never interrupt flow, kid-safe, era-authentic,
findable not advertised):

- **A Level 20 terminal whisper: `> AND OR NOT`.** The terminal already whispers `> XYZZY`,
  `> 2600 HZ`, `> MOTH: 1947`. Three logic gates is era-perfect, invisible to anyone who
  doesn't know, and rhymes with the binary→HELLO reveal. Grounded in [[rockys-boots]].
- **A title-screen magic word: `stickybear`.** Fits the `EGGS` pattern exactly.
  Suggested response: `HOME KEYS FIRST. THEN THE JOKES. 1985.` — a nod only a parent decodes,
  sourced directly from the 1985 package copy.

**Trade-off:** if `stickybear` also becomes a history-card word (Option 1), having it be both
a card word and a magic word may confuse the two systems. **Pick one** — or make the egg
`hefter` instead, which cannot collide with typed level content.

---

### Recommendation
**Options 1 + 2 now** (cards + era-correct set dressing: they are cheap, they respect the
cabinet rule, and together they cover both audiences — the kid gets a card, the parent gets a
glimpse of an Apple II). **Option 3 when the learn-to-program act is specced** — and note
that [[rockys-boots]] has already done that act's first research task. **Option 5 as a
one-line bonus.** Option 4 only if the real wish is a visit rather than a plaque.

---

## 6. Downstream flags

*Research-only lane. Nothing outside `research/` was edited. These are proposals and
warnings for the owners of those files.*

1. **`js/history-cards.js`** — five proposed new cards, with ids, levels, words and ≤160-char
   copy, in §5 Option 1 above. Blocklist-checked. **Not added by this lane.**
2. **`js/history-cards.js` — kid-safety constraint for any Oregon Trail card:** never
   reference the game's famous death message. `died`/`death`/`dead` are floor entries in
   `js/word-blocklist.json`. Proposed copy already complies.
3. **`.claude/rules/easter-eggs.md`** — the "Proposed (unbuilt)" menu is currently empty; two
   sourced candidates offered in §5 Option 5, with the `stickybear` collision warning.
4. **`.claude/rules/levels/act2.md` / `act3.md`** — no correction, but a note: the Computer
   Wing's own text ("computers and consoles from different eras line the walls") already
   authorises Option 2 with no rule change, and Trevor's 2026-09-13 "DRAW A REAL THING"
   direction constrains it usefully. An invented Stickybear or Gizmos & Gadgets *arcade
   cabinet* would violate both that direction and the arcade-cabinet rule.
5. **`research/typing-pedagogy.md`** *(owned by another lane — not edited)* — its "canon
   comparison" section lists Mario Teaches Typing, Mavis Beacon, Dance Mat, TypingClub and
   Slam Dunk Typing. **It is now incomplete: [[stickybear-typing]] (1985) predates all of
   them and matches our structure more closely than any.** Recommend a paragraph be added
   there by that file's owner.
6. **Bidirectional wikilinks not added.** This lane owns only new pages, so existing pages
   ([[warren-robinett]], [[mario-teaches-typing]], [[touch-typing-pedagogy]],
   [[error-feedback-pedagogy]], [[myst]], [[apple-computer]]) link *to* nothing here yet.
   All eleven new pages link outward and to each other. A follow-up backlink pass is
   recommended.

---

## 7. Corrections from citation pass (2026-09-13)

This was new research rather than a re-verification of existing prose, so the corrections are
to *the request's own framing* and to claims that would have been easy to write fluently and
wrongly:

- **"Sticky bear" is one word — Stickybear** — and it is a *character and product line*, not
  a single program. The relevant program is **Stickybear Typing**, which nobody had
  identified as existing before this pass.
- **"Gizmo and Gadgets" → *Super Solvers: Gizmos & Gadgets!*** — plural, ampersand, exclamation
  mark, and part of The Learning Company's **Super Solvers** series.
- **Stickybear Typing's year is genuinely ambiguous and must not be stated flatly.** One
  archived retail copy carries **three** dates: 1986 on the disk label, 1985 on the title
  screen, 1984 on the case. **1985** is the best single answer; the spread is real.
- **The line's "1982 first title" is unsourced.** Widely repeated online; the earliest dated
  artifact found this session is 1983 (*Stickybear Basketbounce*). Recorded as "early 1980s."
- **"Weekly Reader Software" vs "Weekly Reader Family Software"** — both appear on real
  artifacts. Neither is asserted as the only correct form.
- **Gizmos & Gadgets IS a racing game** — classified Platform/Puzzle/Racing, fifteen races.
  Trevor's "not in the raceway" is still correct, but for the reason given in §3, not because
  the game has nothing to do with racing. Worth stating plainly so nobody later "discovers"
  the contradiction.
- **Carmen Sandiego "was not intended as an educational game at release."** The most famous
  educational game of the 1980s was an accident. Guard against the fluent inversion.
- **Oregon Trail has three defensible "first" years** — 1971 (written), 1975 (MECC network),
  1980 (Apple II). The created-vs-shipped trap from the historian brief, in its purest form.
- **"The Learning Company" names two different companies.** After SoftKey's December 1995
  takeover, SoftKey *used the name*. A 1997–99 TLC-badged product is not necessarily from the
  1980-founded house — which matters for [[slam-dunk-typing]]'s 1999 All-Star Typing reissue,
  already in this wiki.
- **Not claimed: that Stickybear Typing was non-punitive.** No source documents its
  wrong-key behaviour. It is our closest structural ancestor and *not* a precedent for the
  One Rule.

## 8. Unsourceable / weakly-sourced items

- **Richard Hefter's biography.** Wikipedia "provides no biographical details about Richard
  Hefter beyond identifying him as the character's creator." Open Library confirms only that
  he authored Stickybear books published by Optimum Resource in 1983–84. The common
  description of him as a children's-book author/illustrator is *consistent* with that, but
  no biographical source was verified. **Not asserted.**
- **Stickybear's Apple II hi-res graphics reputation.** A frequent nostalgic claim; no source
  found. **Not asserted.**
- **Sales figures** for Stickybear, Gizmos & Gadgets, Number Munchers and Reader Rabbit.
- **Gizmos & Gadgets: critical reception, designer credits, and whether it had any timed
  failure state.** The "losing is information" reading in §3 is design interpretation, and is
  labelled as such on the page.
- **Robot Odyssey's release year and its reputation for punishing difficulty.** Repeated
  widely; unsourced here. The tonal warning on [[rockys-boots]] is flagged as project
  judgement.
- **"Edutainment" coinage.** Only the 1983 *software-games* sense is cited. Broader 1970s
  coinage claims exist and were not verified.
- **Jan Davidson as a teacher.** Wikipedia says Davidson & Associates was founded "to publish
  Jan's educational Software" and the Math Blaster article calls her an educator; her teaching
  career itself was not separately verified.

### URLs dropped as unverifiable this session
- `https://stickybear.com/` — resolved but returned an **empty body**. Would have been the
  publisher's own primary source. Dropped, not cited.
- `https://www.warrenrobinett.com/` — **TLS handshake failure**. Would have been Robinett's
  own account of his educational-design work. Dropped, not cited.
- `https://files.eric.ed.gov/fulltext/ED436231.pdf` — resolved but returned **unparseable
  binary** (JBIG2-compressed scan). The ERIC *record* page was fetched and cited instead;
  the PDF is explicitly marked unused on [[edutainment-era]].
- `https://en.wikipedia.org/wiki/Super_Solvers` — **404**, no such article. The
  `Gizmos & Gadgets!` article was used instead.
- `https://www.mojeek.com/search?...` — **403**. `duckduckgo.com/html` — **CAPTCHA wall**.
  Both were discovery attempts, never citations.
- MobyGames, arcade-museum.com (KLOV) and Fandom were not attempted — the dispatch brief
  reported them returning 403/402 all session.

---

*Related: [[edutainment-era]] (the historical spine) · `research/typing-pedagogy.md` (the
tutor canon this extends) · `.claude/rules/easter-eggs.md` (Option 5) · `docs/ROADMAP.md` §2
(Options 3 and 4) · `.claude/rules/product.md` (the One Rule this lineage argues about).*
