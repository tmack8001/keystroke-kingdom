# Mobile & Touch-Screen Typing — the evidence base
## What the research actually supports about kids, glass, keyboards, and reading

*Compiled 2026-09-12 in response to Trevor's direction: "touch typing we can layer in under a
new style of game play — maybe send a product manager and researcher off on how mobile/touch
typing could be introduced without sacrificing the entirety of the game." This document is the
**research half** of that pair. It makes no product recommendation; it reports what the
literature and the market actually show, including where the evidence is thin.*

*How to verify: this doc follows the project's citation standard
(`.claude/agents/arcade-historian.md`) — 2–4 references per claim, every URL from a live search
result or a page fetched in-session, each reference labelled **[fetched]** or
*(search result only, not fetched)*. Where a source could not be read (paywall, CAPTCHA, bot
wall, unparseable PDF) it is marked and the claim is downgraded rather than dressed up. The
atomic pages are `research/wiki/pedagogy/`: [[touchscreen-text-entry]], [[keyboarding-readiness]],
[[movable-alphabet]], [[childrens-literacy-apps]], [[handwriting-vs-typing]],
[[digital-native-myth]].*

---

## 0. First: the two things called "touch typing" are not the same thing

This whole decision turns on a word, so it gets its own section.

| Term | What it means | Motor skill | Who does it |
|---|---|---|---|
| **Touch typing** *(the term of art)* | Typing **without looking at your hands**. Ten fingers anchored on a home row, each key owned by a specific finger, position held by proprioception and the tactile bumps on F and J. | Ten-finger, eyes-free, taught | What Keystroke Kingdom teaches today |
| **Touch-screen typing** | Thumbs (usually two) on glass. No resting position, no tactile landmarks, eyes on the keys, heavy reliance on autocorrect. | Two-thumb, eyes-on, self-taught | What a phone/tablet user does |

Trevor's request is about the **second** — typing on a touch device, introduced as *a new style
of gameplay*, not a port of the 25-level curriculum. That reading is what this document
investigates. The confusion is not pedantic: "we're adding touch typing to the mobile version"
is a sentence that, read either way, means something completely different — and one of those
readings is a claim we cannot support.

**On the earlier internal analysis** (that touch-only was "near-disqualifying" because glass
teaches thumb typing while the curriculum teaches touch typing): the evidence **supports that
objection as stated — against a port** — and **does not support extending it to a new mode**. A
tablet mode that makes a reading/spelling claim rather than a typing claim clears the objection
entirely, because the objection was always about the *typing* claim. See §5 and §6.

---

## 1. Transfer: does typing on glass help, hinder, or do nothing for physical typing?

**Short answer: the only direct evidence runs the other direction, and it says "no help." The
direction we actually care about has not been studied. Nothing suggests harm.**

- The largest mobile-typing study ever run — **37,370 volunteers**, Aalto University with
  Cambridge and ETH Zürich (Palin, Feit, Kim, Kristensson & Oulasvirta, MobileHCI 2019) — found
  **"no benefit from formal training on traditional ten-finger typing systems when applied to
  touchscreen typing."** Physical-keyboard skill does not buy you speed on a phone.
- Prof. Oulasvirta's own framing: *"This is a type of motor skill that people learn on their own
  with no formal training,"* followed by the open question *"what could be achieved with a
  careful training program for touchscreens."* **Nobody has answered that question.** It is a
  genuine gap — which makes a well-designed glass mode *interesting*, and makes any claim about
  its effectiveness *unevidenced*.
- **The reverse direction (glass practice → physical keyboard) has, as far as this pass could
  find, no study at all.** Report it as unknown. Do not assume symmetry.
- **What does appear to cross over is not the fingers — it's the language.** Cerni, Longcamp &
  Job (*Acta Psychologica* 167, 2016) found that skilled touch typists typing with **two thumbs**
  showed the same hand-alternation advantage and the same bigram-frequency effect on
  inter-keystroke timing as they did on a physical keyboard; one-finger mobile typing showed
  neither. The plausible reading — and it is a reading, not a demonstrated transfer — is that
  **spelling knowledge, letter sequencing and word-level fluency are shared; the finger-to-key
  map is not.**
- **Ten-finger typing on flat glass is a research problem, not a product.** Findlater, Wobbrock &
  Wigdor's CHI 2011 best paper put 20 expert typists on a flat surface and found key-press
  distributions are spatially consistent *within an individual* — so eyes-free glass typing is
  conceivable with a per-user adaptive keyboard — while **hand drift** (hands wandering with no
  tactile anchor) remains unsolved. This is a decade-old research direction that has not become
  a shipping consumer capability.

Detail and citations: [[touchscreen-text-entry]].

---

## 2. Age and readiness: our player is 4–8

- **Formal keyboarding expectations arrive at grade 4** in the US Common Core: **W.4.6** is the
  first standard to require students to "demonstrate sufficient command of keyboarding skills to
  type a minimum of **one page in a single sitting**" (W.3.6 mentions keyboarding with no
  quantity; W.5.6 raises it to two pages). Grade 4 is roughly ages 9–10 — *older than every child
  Keystroke Kingdom is designed for.*
- **Motor development bands** (Nielsen Norman Group, synthesising child-development research for
  interface design): 3–5-year-olds have "very limited fine motor skills" and master *tapping,
  swiping, dragging*; **6–8-year-olds** have limited-but-developing fine motor and manage *"simple
  keyboard use"*; 9–12-year-olds manage complex keyboard/mouse coordination.
- **Touch precision:** NN/g recommends **at least 2 cm × 2 cm** touch targets for young children —
  **four times** the 1 cm × 1 cm adult recommendation. For adults the accessibility floor is WCAG
  2.2's 24 × 24 CSS px. Lisa Anthony's five-year MTAGIC synthesis (116 children, ages 5–17) finds
  children miss targets more than adults, with the youngest worst, plus systematic "holdover"
  unintended touches.
- **Children left to themselves acquire typing badly.** Pinet, Zielinski, Alario & Longcamp
  (*Reading and Writing*, 2025/26) surveyed 131 children in grades 4–9 and found the
  **self-reported number of fingers used rises with grade** — informal acquisition converges
  slowly toward more fingers, which is precisely what a curriculum shortcuts.
- **Touchscreen use itself is not implicated as a fine-motor hazard.** The Birkbeck TABLET
  project (715 UK families, toddlers 6–36 months) found earlier *scrolling* associated with
  **earlier** fine-motor milestones, no association for passive video — and said plainly that the
  direction of causality is unknown. Reported once, factually, and not moralised about further.

Detail and citations: [[keyboarding-readiness]].

---

## 3. What existing products actually do (the richest vein)

**The headline: the established children's reading apps do not put a QWERTY soft keyboard in
front of a five-year-old.** Six products, six interaction models, zero soft keyboards:

| Product | What the child physically does | Notes |
|---|---|---|
| **Endless Alphabet** (Originator, 3+) | **Drags scattered letters back into shadowed outlines**; each letter animates and speaks its sound as it's dragged | Letter tiles. No keyboard anywhere. |
| **Duolingo ABC** (free, ~3–8) | **Tap, drag, trace, and speak aloud** — plus ASR when reading letter sounds/words | 127 sequential units; speech recognition is a first-class input |
| **Teach Your Monster to Read** (free on desktop) | **Matches letters to sounds**, then blends/segments CVC words, then reads sentences | Built with Roehampton English-education academics; aligned to systematic synthetic phonics |
| **Khan Academy Kids** (free, nonprofit, 2–8) | Sound/rhyme play, phonics lessons, read-to-me with word highlighting, **tracing + word building** | The "free and ad-free" benchmark |
| **Writing Wizard** (L'Escapadou) | **Guided-stroke tracing** with enforced stroke order; stylus/Pencil; printable worksheets | The handwriting lane |
| **Osmo Words** (5–10) | **Lays out physical letter tiles on the table**; a reflector over the iPad camera reads them | Screen for feedback, hands on real objects |

All of it is one old idea wearing six coats: the **[[movable-alphabet|Montessori movable
alphabet]]** — a box of loose letters that lets a child *compose words before their hand can write
them*, used with 3–6-year-olds for about a century, explicitly designed to strip the motor task
out of the language task. That is the pattern to borrow if we build anything here. It is also,
not coincidentally, [[bookworm-game|Bookworm]]'s mechanic — already cited in
`research/typing-pedagogy.md` as sharing this game's "typing a real word you can read is a double
win" soul.

**The efficacy of the category, honestly stated:** Kim, Gilbert, Yu & Gale's meta-analysis (*AERA
Open* 2021; **36 studies, 285 effect sizes**) found **+0.31 SD** overall — real, modest, and
larger for preschoolers and for *constrained* skills (letter knowledge, phonological awareness)
than for comprehension. It was also **larger on researcher-designed measures than on standardized
ones**, which is the single best reason to distrust any vendor's cited number, including ours if
we ever cite one.

**One caution on speech input:** ASR on children's speech is several times worse than on adults'
(one 2023 evaluation: **13.93% WER for children grades 3–5 vs 3.05% for adults**; 21.31% on
scripted child speech). In a game whose One Rule is "never punish," a microphone that mishears a
five-year-old and marks them wrong is a direct design hazard.

Detail and citations: [[childrens-literacy-apps]].

---

## 4. The ergonomics constraint, with the arithmetic

A soft QWERTY has **ten columns**. NN/g's young-child recommendation is **≥ 2 cm per touch
target**. Ten columns × 2 cm = **≥ 20 cm of usable width**, before any margins.

An 11-inch iPad (A16) is **179.5 mm wide × 248.6 mm tall**, *including bezels*. So:

- **Portrait:** 18.0 mm per column at the absolute device edge — **below the recommendation
  before the display area is even accounted for.**
- **Landscape:** 24.9 mm per column only if the keyboard spans the entire long edge of the
  device, edge to edge. Realistically it does not.
- **Phone:** not close.

This is our own arithmetic from two cited numbers, not a cited finding — but the inputs are
solid, and it says something blunt: *a soft QWERTY sized for a five-year-old's fingers does not
fit on the devices we would ship it to.* Add the other three constraints and the picture is
consistent:

1. **Occlusion** — the soft keyboard eats roughly the bottom half of the viewport, exactly where
   Keystroke Kingdom's keyboard guide and theme "stage" live (`.claude/rules/visual-validation.md`
   reserves 0.49–0.81H for the guide).
2. **No tactile landmarks** — the F and J homing bumps are the physical anchor the whole home-row
   curriculum rests on. Glass has none, and fingers cannot rest on a soft key without firing it.
   The entire concept of a "home row" is unavailable.
3. **Targeting error** — children miss targets more than adults and the youngest miss most; the
   never-punish rule means every miss must be absorbed gracefully, and a dense 10-column grid
   generates a lot of them.

**The one path with no compromises at all:** an iPad or Android tablet **with a Bluetooth
keyboard** runs the existing browser game unchanged. Apple documents Bluetooth accessory pairing
for iPad as standard. That is not a new mode — it's a support note and a hardware recommendation,
and it is worth writing down because it is the only option that delivers the *actual* game on a
tablet.

---

## 5. The reading half: what survives on glass

Keystroke Kingdom promises two things: learning to **read** and learning to **type**. The typing
promise does not cross to glass. **The reading promise substantially does.**

- **Direct evidence with the right ages and the right device.** Mayer et al. (*Frontiers in
  Psychology*, 2020) trained ~145 children aged 4–6 for **seven weeks** on 16 letters, in three
  conditions: pencil on paper, stylus on a tablet, or **typing on a virtual keyboard on a
  tablet**. Outcomes: pencil beat keyboard on **letter recognition** (and retained better); no
  group difference on letter writing; the **keyboard group matched pencil and beat stylus on word
  reading and word writing**. Selecting letters on glass produced real word-level literacy gains.
- **The counterweight, stated fairly.** Kiefer et al. (2015) found handwriting superior to typing
  for preschoolers in word writing and, as a tendency, word reading. The consistent picture across
  both studies: **pencil-and-paper is the best tool for learning individual letters**, and a
  screen mode should never be sold as better than a pencil for that.
- **Reading *on* screen vs paper.** Furenes, Kucirkova & Bus (*Review of Educational Research*
  2021; 39 studies, 1,812 children aged 1–8): naive digitisation lowers comprehension;
  **story-congruent enhancements make digital beat paper**; an embedded dictionary helps vocabulary
  but not comprehension; and **an adult reading a print book with a child beats a child alone with
  an enhanced digital book.** Design quality and the grown-up in the room dominate the medium —
  which is a rather on-brand finding for a game built by a dad sitting next to his daughter.

So: **a tablet mode that teaches letters, sounds, spelling and word-building is supported by
evidence. A tablet mode that claims to teach typing is not.**

Detail and citations: [[handwriting-vs-typing]], [[movable-alphabet]].

---

## 6. What a mobile mode could and could not truthfully claim

The house rule is that the game never misleads a parent. Against the evidence above:

**Can truthfully claim**
- Practises **letter recognition** and letter–sound correspondence.
- Practises **spelling and word building** with the same word banks the main game uses
  ([[decodable-word-lists]]).
- Practises **reading** the words the child builds — the "double win" moment, unchanged.
- Practises **finding a letter on a QWERTY layout** (visual/spatial keyboard knowledge, which is
  a genuinely separate thing from motor skill — Findlater's work and the Pinet finger-count data
  both imply layout knowledge and finger mapping are separable). State it exactly that narrowly.
- Practises **thumb typing itself**, if we build that, as its own skill — with the honest note
  that this is the skill the whole world self-taught, not the one schools teach.

**Cannot truthfully claim**
- ❌ "Teaches touch typing." Glass has no home row and no F/J anchor; the Aalto data show
  ten-finger training doesn't even help on glass.
- ❌ "Builds toward keyboard typing" / "gets them ready for a real keyboard." **No study tested
  glass → physical transfer in either children or adults.** This is the most tempting sentence
  in the whole space and it is unevidenced.
- ❌ "As good as writing letters by hand." Two controlled studies say pencil wins on letter
  learning.
- ❌ Anything implying the mobile mode is the same curriculum. It isn't; it would be a different
  game sharing a world.

**Flagged as a parent-honesty risk:** any store listing, README line, or in-game copy that puts
"typing" in the name of a tablet mode will be read as the typing claim regardless of the fine
print. If a mode ships, the naming is a truthfulness decision, not a marketing one.

---

## 7. What this pass did *not* settle

- **Glass → physical transfer in children.** No study found. This is the load-bearing unknown.
- **Whether a purpose-built touchscreen typing curriculum works.** Oulasvirta explicitly names
  this as an open question; no evaluation of any glass typing trainer (TapTyping et al.) was found.
- **Whether tile/tracing modes build anything that helps later keyboarding.** Plausible via the
  spelling/language layer (Cerni et al.), demonstrated nowhere.
- **Anything about our specific One-Rule feedback model on glass.** The
  [[error-feedback-pedagogy]] work in this wiki is about keypresses; touch misses are a different
  error class (holdovers, fat-finger, drift) and would need their own thinking.

---

## Corrections from citation pass (2026-09-12)

1. **"Common Core requires third-graders to type a page in one sitting."** Widely repeated,
   wrong. **W.3.6** only says "using keyboarding skills" with no quantity; the **one page in a
   single sitting** requirement is **W.4.6** (grade 4), and two pages is W.5.6. Verified against
   the California Department of Education's standards browser. (Classic created-vs-shipped-shaped
   error: the right fact, the wrong year.)
2. **"Young people aged 10–19 type about 10 times faster than people in their 40s."** This appears
   in a French-government (Labo) English summary of the Aalto study. Aalto's own release says
   **about 10 words per minute faster**. Ten WPM, not ten times. A near-miss superlative of exactly
   the class this project keeps catching.
3. **"Kids these days are digital natives — they already type fine on phones."** Rejected by the
   literature. Kirschner & De Bruyckere (2017): the information-skilled digital native "does not
   exist," and designing instruction on that assumption "hinders rather than helps learning."
   Corroborating: self-taught mobile typing averages ~36 WPM with thumbs, and informally-acquired
   typing uses *fewer fingers* the younger the child. See [[digital-native-myth]].
4. **"Touch typing transfers to phones, so the curriculum is future-proof."** The Aalto 37k study
   found **no benefit** from ten-finger training on touchscreens. Our curriculum is worth teaching
   on its own merits; it is not a head start on thumbs.
5. **Sample-size drift, logged for honesty.** Mayer et al. (2020) is rendered as N = 147 in one
   PMC passage and **145** in the Frontiers full text for the final analysed sample. We cite ~145
   per the journal's own full text.
6. **Tool/pipeline conflation caught mid-pass.** A search summary attributed "19 WPM after 30
   minutes of training" to Findlater et al.'s flat-glass study; that figure belongs to a different
   paper (TOAST, Shi et al.). It has been dropped rather than repeated — no WPM figure is
   attributed to Findlater in this document.

---

## Unsourceable / weakly-sourced items

- **The history of the F/J homing bumps** (who added them, when) is covered only by popular-press
  articles with conflicting accounts. ISO/IEC 9995-2 is the relevant standard family but is
  paywalled and was not read. This doc therefore asserts only the *functional* fact (physical
  keyboards have tactile home-key landmarks; glass does not), never a date or an inventor.
- **"Children aged 7–10 miss 7 mm targets ~30% of the time"** — reported in secondary literature
  citing Anthony et al. (2013); the primary PDF was not machine-readable by our tooling. Used as
  directional, flagged at one remove. The *qualitative* claim (children miss more, youngest worst)
  is verified from the UF INIT lab's own publication record.
- **Cerni, Longcamp & Job (2016)** — abstract-level only; ScienceDirect returns 403 and PubMed
  served a cookie wall. Citation details are corroborated across two records.
- **Pinet et al. (2025/26)** — abstract-level only; Springer redirects to login and the HAL mirror
  is bot-walled.
- **"At what age should a child start typing?"** — the open web is dominated by typing-product
  marketing pages (Ratatype, TypeOlymp, All The Right Type) making confident age claims with no
  cited research. **None of them are cited here.** The age picture in §2 is built from standards
  documents and child-development-based design research instead. If a firmer developmental answer
  is ever needed, it will take an occupational-therapy / ERIC literature pass, not another web search.
- **Efficacy of any specific glass typing trainer** — no peer-reviewed evaluation found for
  TapTyping or comparable products. Product existence is cited; effectiveness is not.

---

## URLs dropped as unverifiable

None fabricated; several fetch-failed and are either labelled *(not fetched)* in the pages above
or dropped entirely: `dblp.org` (bot wall), `hal.science` / `amu.hal.science` (bot wall),
`files.eric.ed.gov` PDF and `mintviz.usv.ro` PDF and `lisa-anthony.com` PDF (binary, not
machine-readable), `s.typingclub.com` docs (403), `readingrockets.org` app page (403),
`thecorestandards.org` (403), `corestandards.org/ELA-Literacy/W/3/` (404 — the live host is
`thecorestandards.org`).

---

*Related: `research/typing-pedagogy.md` (the canon key-order research this mode would NOT be
using), `.claude/rules/product.md` §Word Length (the "game ages with the player" tenet a new mode
must respect), `.claude/rules/visual-validation.md` (the reserved-center layout contract a soft
keyboard would collide with), `docs/ROADMAP.md`.*
