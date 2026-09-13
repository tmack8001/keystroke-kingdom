---
title: Rhythm on a Keyboard
type: concept
tags: [video-game-history, rhythm-game, typing-pedagogy, input-mapping, theme-authoring, concept]
sources: 24
verified: 2026-09-13
---

Every canonical rhythm game is played with feet, a plastic guitar, a mat, a drum or a voice, so a
music cabinet in Keystroke Kingdom has to answer a question nobody in the genre answered — and
across 2026-09-13 Trevor answered it twice, so **this page is about evidence for his two moves,
not about whether they are possible.** Move one: a note highway is **spectacle**, because
`.claude/rules/theme-authoring.md` §"Mechanics fidelity" asks that the **SCENE** show the
signature mechanic operating, not that the player's hands perform it — so the notes scroll and the
player types, exactly as `js/themes/tetris.js` already runs continuous gravity over untimed
typing. Move two, now doctrine in `.claude/rules/product.md` §"EXPERIENCE also buys FIDELITY":
**the timing window degrades the MUSIC instead of gating the player** — fall behind and the band
drifts out of time or pitch; it sounds wrong, it takes nothing away, you still finish.

**The headline research finding of this pass: that mechanic is not an invention — it is the rhythm
genre's own norm, and one shipped title already decoupled it from punishment exactly as Trevor
proposes.** Wikipedia's *Taiko no Tatsujin* article says so from the outside: *"Unlike other rhythm
games such as Guitar Hero, the drumming in Taiko no Tatsujin serves as an accompaniment rather
than replacing an instrument in the music. Missing a note does not result in off-key sounds or
interruptions to the background track."* In Guitar Hero-class games **the player IS an instrument
in the mix**, so bad play sounds bad — and [[rocksmith]] (2011) kept that audible truth while
removing every consequence: *"it is impossible for the player to fail a song."* Details in §0.
Separately and sceptically, this page also records what the sources support about rhythm as
*pedagogy*, where the honest answer is **thin precedent and one clean negative finding**.

## In this game

### The compositional problem is real, measured, and already solved by the layout contract

A note highway conventionally runs **down (or up) the middle of the screen to a receptor line**.
In this game the middle of the screen is spoken for. `.claude/rules/visual-validation.md`'s
Theme Layout Contract gives measured fractions (1280×800):

- **RESERVED:** prompt panel ~**0.40–0.60W × 0.19–0.43H**; keyboard guide ~**0.22–0.78W ×
  0.49–0.81H**; HUD corners top-left and top-right.
- **THE STAGE:** left margin **0–0.22W (full height)**; right margin **0.78–1.0W (full height)**;
  top band 0–0.19H; the gap band ~0.43–0.49H; bottom strip **0.81–1.0H (full width)**.

**A centre highway is therefore impossible and the side margins are the two places a highway
naturally fits — and they are full-height vertical columns, which is exactly the shape a note
highway is.** That gives the composition its own idea for free: **two highways, one per margin,
left hand and right hand**, with receptors low in the bottom strip. Which is not a decoration —
it is `.claude/rules/product.md` Level 3's promise made visible: *"Call-and-response melody —
left hand (S,D,F) answered by right hand (L,K,J)"* (quoted verbatim; confirmed on disk
2026-09-13 — see [[call-and-response]]), and it is aligned with the one motor-control finding
this pass verified twice over: **cross-hand keystrokes are faster than same-hand ones**
(Schmuckler & Bosman 1997; Cerni, Longcamp & Job 2016 — *"manual alternation is performed faster
than manual repetition"*).

### The shipped precedent: how this game already runs a clock without a deadline

`js/themes/tetris.js` is the answer key, and its own header comment states the design
(Trevor playtest note, 2026-07-12):

> *"the piece is no longer a frozen glyph that only teleports on a keystroke. It RELEASES from
> the top and FALLS CONTINUOUSLY… Typing is the only input the theme sees (themes never read raw
> keys): a correct keystroke nudges the fall, and completing a letter SEQUENCE fast-drops the
> piece… **A slow typist's piece just lands organically where gravity takes it — no punishment.**
> The ENGAGEMENT GATE (journal L20) means a NEW piece releases only if a keystroke happened in
> the last ~10s."*

Its constants make the shape concrete: `FALL_MS_PER_CELL = 650` (spectacle on a wall clock),
`NUDGE_FALL_MS = 90` (typing accelerates the spectacle), `ENGAGEMENT_MS = 10000` (no new
spectacle in an unattended tab). **Substitute "note" for "tetromino" and that is a note highway
that cannot punish anybody.** Notes arrive on their own clock, passing one costs nothing, typing
drives them home, and nothing new spawns if the child walked away. *(The engagement gate is not
optional flavour — `theme-authoring.md` requires it: "background simulation must not progress the
game state in an unattended tab.")*

### What still does not cross over

The punishment ledger ([[rhythm-games-by-era]] §7) is untouched by the re-framing. **Timing
windows, groove/rock/energy gauges, letter grades, per-note judgement words, combo multipliers,
booing, muting and mid-song ejection stay out** — not because they are un-drawable, but because
they attach *consequence* to the clock. The one shipped precedent worth stealing outright is
[[taiko-no-tatsujin]]'s: *missing a note never interrupts the backing track.* Draw the highway;
never let it grade.

⚠️ **One display trap worth naming.** The falling-note display exists, in its native genre,
precisely to make a deadline legible **in advance**. If our highway draws a hard receptor line
and a judgement flash, it is *promising* a deadline the engine will never enforce — and a child
will read the promise before they read the manual. The open compositional question, stated
honestly: **what does a receptor look like when nothing is being judged?** Candidate answers with
some grounding: notes that **dissolve gently past the line** rather than flashing MISS (Taiko's
decoupling); notes that **light up when the matching letter is typed, whenever that happens**
(the [[mavis-beacon]] lyric-screen idea, The facts §7); or a receptor that is the **keyboard guide itself**,
already on screen at 0.22–0.78W × 0.49–0.81H. **Not resolved here — this is a design decision,
not a research finding.**

## The mapping question — how does a note highway address ~40 keys?

*Trevor, 2026-09-13: "unlike guitar hero there are more than 5 or 6 'strings' cause we have an
entire keyboard… let's assume all keys and that the letter shows up in the string for what is
intended to be typed to the rhythm — single or even multiple letters to keep to the beat — you
should do some exploratory research on how this might work best."*

**Settled and not re-opened here:** WIZARD + SURVIVAL are the two opt-in switches that turn the
gentle cabinet into the real one; a key-subset setting is **deferred** ("something to do later");
assume the full keyboard; the letter appears **in** the lane; a beat may carry one letter or
several. **Everything below is options with trade-offs, not a decision.**

### A. What lane count did the genre settle on, and why

| Game | Inputs / lanes | Why that number |
|---|---|---|
| [[taiko-no-tatsujin]] (2001) | **2** — drum face (don) / rim (ka) | The physical instrument has two surfaces. Two hands, two sounds |
| [[dance-dance-revolution]] (1998) | **4** — *"four pads arranged and pointing in the orthogonal directions (left, up, down and right)"* | Two feet, four directions. The body's own geometry |
| [[beatmania]] (1997) | **5 keys + turntable** — *"buttons similar to those of a musical keyboard, and a rubber pad that emulates a vinyl record"* | A DJ deck abstracted |
| [[guitarfreaks]] (1999) | **3** neck buttons + pick lever | A guitar neck abstracted down to what one hand can hold |
| [[guitar-hero]] (2005) | **5** frets + strum bar | Five fingers, one per fret |
| *Guitar Hero Live* (2015) | **6**, in **two rows of three** | Realism: *"more realistic simulations of chords"* — and see the finding below |
| [[rock-band]] (2007) | guitar 5 · **drums 4 pads + pedal** · one mic | Per-instrument, each kept small |

**The genre's answer is two to six, and it never went higher — except once, and that once is the
most useful data point in this table.** *Guitar Hero Live*'s designers moved to six buttons in two
rows, and their stated reason for the three-across sub-layout is a **usability finding about
beginners**: the layout *"avoids the need to use one's pinkie finger, a difficulty they recognized
new players had on the traditional five-button controller."* **Five lanes was already too many for
a new player's weakest finger — by the franchise's own admission.** Reviewers then split: one
called it the most challenging fake guitar playing he had seen and a "delight," while others found
*"the buttons themselves were too small and tight on the neck of the controller, and the new
challenge may cause more casual players to forgo attempt to learn the new system."* Activision
*"reported that sales for Guitar Hero Live missed their expectations,"* laid off ~50 FreeStyleGames
staff in March 2016, sold the studio in 2017 and shut the GHTV service on 1 December 2018.
**The one time the genre raised complexity for fidelity, it lost the casual player and the
franchise ended.** That is not proof that more lanes are unreadable; it is a well-documented
commercial warning that sits exactly where this act is standing. *(And note it argues FOR Trevor's
architecture, not against it: the extra fidelity belongs behind an opt-in switch, which is
precisely what WIZARD is — Guitar Hero Live shipped its extra fidelity as the only option.)*

### B. Is there a cognitive ceiling? — yes, around four, with two important qualifications

- **Tracking moving objects:** *"most individuals can track only approximately four objects
  simultaneously"* (Drew & Vogel, *Journal of Neuroscience*, 2008). Corroborated from the
  enumeration side: *"a performance limit of four elements in typical adults is thought to reflect
  individuation capacity"* (O'Hearn et al., *JEP: Human Perception & Performance*, 2013).
- **⚠️ Qualification 1 — the child is not an adult.** Koldewyn, Weigelt, Kanwisher & Jiang (2013)
  report that **"MOT performance improved from 5 to 10 years"** in typically developing children.
  **The ~4 ceiling is the grown-up ceiling; a five-year-old's is lower and still growing.** For
  this project that is the operative number, and it is the strongest single argument in this
  section: **design the default for well under four moving things.**
- **⚠️ Qualification 2 — and this one cuts the other way, so state it honestly.** The tracking
  literature measures *simultaneously moving targets*. **Typing is monophonic**: the engine's
  pattern stream serves one expected token at a time (`CLAUDE.md`, Engine input contract). A
  highway carrying one live note plus lookahead is a **tracking load of one**, whatever the lane
  count. What many lanes actually cost is **visual search** — *where will the next one appear?* —
  which is a different and cheaper bill. **So the honest form of the ceiling is: few lanes if
  notes overlap; lane count matters much less if they never do.** No source found this pass
  measures visual search across a note highway specifically. **[unverified] — flagged, not
  asserted.**

### C. The candidate mappings, assessed

*Ranked by how well the evidence and the existing codebase support them. The game already owns the
data every one of these needs: `KEY_REACH` in `js/levels.js` gives each key a
`{ hand: 'left'|'right', finger: 0–3, reach: true|false }`, and `FINGER_MAP` gives the
human-readable name ("LEFT INDEX — REACH UP").*

**1. Lane = FINGER, mirrored — 4 lanes per side, hand shown by side of screen.** *(The synthesis
this pass recommends investigating first.)*
- `KEY_REACH.finger` is already **0 = pinky, 1 = ring, 2 = middle, 3 = index**, identically on both
  hands, and `.hand` is already left/right. **The mapping needs no new data — it is a two-field
  read of a file that has shipped for months.**
- It lands on **four lanes per column**, which is the documented adult ceiling, and — because the
  `visual-validation.md` layout contract reserves the centre and leaves **0–0.22W and 0.78–1.0W
  free full-height** — the two columns are *already where a highway has to go*. **The composition
  constraint and the curriculum agree on the same picture:** left-hand notes fall on the left,
  right-hand notes on the right, four finger lanes each.
- **It teaches the thing the game teaches, every frame.** The curriculum is finger assignment;
  a finger-lane highway is `FINGER_MAP` rendered as scenery. Nothing else on this list does that.
- `.reach` (home vs reach) is the natural **sub-cue** — lane depth, brightness or a small arrow —
  rather than a ninth and tenth lane.
- **Trade-offs, stated:** eight lanes total is above the ceiling *if notes ever overlap* (§B); the
  index lanes are by far the busiest (index fingers own g/h/t/y/r/u/b/n/v/m/f/j and four digits),
  so lane traffic is lopsided; and a five-year-old who does not yet reliably know which finger owns
  which key is being asked to read the answer off the screen — **which may be a feature (it is a
  hint) or a crutch (it replaces recall). That is a pedagogy question this pass cannot settle.**

**2. Lane = HAND — 2 lanes.**
- The direct analogue of [[taiko-no-tatsujin]]'s don/ka, the genre's smallest and gentlest
  interface, and the exact shape of `product.md` Level 3's *"left hand (S,D,F) answered by right
  hand (L,K,J)."* Backed by the one motor finding verified twice here: cross-hand keystrokes are
  faster than same-hand ones (Schmuckler & Bosman 1997; Cerni et al. 2016).
- **Comfortably under every ceiling in §B**, works from Level 1 (J and F *are* two hands), and
  needs one field (`KEY_REACH.hand`).
- **Trade-off:** two lanes carry ~47 characters, so the lane tells you almost nothing — the
  *letter* does all the work. It is a beautiful default and a weak WIZARD tier.

**3. Lane = keyboard ROW — 3–4 lanes (top / home / bottom, + number row).**
- Matches the act structure (Act 1 home, Act 2 top, Act 3 bottom, Act 4 numbers) and sits at the
  ceiling, not over it. Rows are also the one grouping a child can *see on the physical keyboard*
  in front of them, which no other option can claim.
- **Trade-off:** it fights the curriculum rather than reinforcing it. The game teaches *fingers*,
  not rows; `KEY_REACH` has no row field (it would have to be derived from `KEY_LAYOUT` in
  `js/ui/hud.js`, the single source of truth for keyboard geometry — **do not define a second
  layout**, per `CLAUDE.md`). And within one act, nearly every note lands in the same lane.

**4. ONE lane, letters in sequence — the karaoke form.**
- This is [[rhythm-games-by-era]] §9's conclusion arriving from a different direction, and it is
  **the best-evidenced display in the entire project**: syllable-synchronised highlighting, with an
  institutional research tradition behind it (Same Language Subtitling) and a 1924 ancestor.
- **And it has a property none of the others do, which may be the most important sentence in this
  section: in karaoke the TEXT STAYS STILL and the HIGHLIGHT moves.** A note highway moves the
  text. For a child whose job is *reading the letter*, those are materially different tasks (§D).
- **Trade-off:** it is barely a highway. As the WIZARD tier it under-delivers; as the FIRST QUARTER
  default it is excellent and needs almost nothing built.

**5. Lane = KEY (~40 lanes).** Recorded only to rule it out: eight to ten times the documented
ceiling, no precedent at any scale, and unreadable at speed. **Reject.**

**The shape that falls out of the four survivors is a progression, not a choice** — one lane
(karaoke highlight) at FIRST QUARTER → two lanes (hands) → four/eight (fingers) at WIZARD, with
[[call-and-response]] as the untimed floor beneath all of them. That is the same "ages with the
player" architecture the game already uses for word length and EXPERIENCE, and it means no
mapping has to be chosen forever.

### D. ⚠️ The reading load — the risk worth naming, and the evidence is thinner than either side wants

The current prompt is **static**: the letter sits still and waits. A highway makes the target
**move**. The act's value proposition is reading *and* typing, so this is a first-order question.

- **What the literature does NOT say:** that moving text is simply worse. Two studies of
  horizontally scrolling single-line text found the opposite in part — *"significantly lower error
  rates… for dynamic text than for static text"* with comparable speed and ~95% comprehension
  (Walker et al., *Ophthalmic & Physiological Optics*, 2016), and *"literal comprehension can be
  reasonably well maintained with scrolling text"* (Harvey & Walker, *Quarterly Journal of
  Experimental Psychology*, 2018).
- **What it DOES say, and this is the usable finding:** in Harvey & Walker, performance *"declined
  at faster scroll speeds,"* inference-level comprehension suffered more than literal
  comprehension, and **working memory capacity and display speed significantly influenced the
  effects.** **Speed is the variable, not movement.** A slow highway is a very different object
  from a fast one — which is a direct argument for scroll speed being tied to the EXPERIENCE tier
  alongside everything else.
- **⚠️ The limits of that evidence, stated plainly:** both studies are **adults** (the first,
  adults with central visual field loss), reading **prose for comprehension**, not children reading
  **single letters for production**. **They are adjacent, not on point.** An ERIC search for
  *"moving text" reading beginning readers* returned **zero results**.
- **The one children's study located is a near-miss that must not be over-read.** Krenca, Taylor &
  Deacon (2024), *Journal of Research in Reading* — 75 children in Grades 3–5 — found
  *"performance was similar between the clicking and scrolling conditions,"* with **scrolling
  having no negative impacts** (hyperlinks did). **But that is reader-controlled page scrolling at
  the reader's own pace, not text moving past the reader on a clock.** ⚠️ **It does not transfer,
  and citing it as though it did would be exactly the adjacent-fact error this project keeps
  catching.** Recorded because someone will otherwise find it and mis-use it.
- **Honest verdict:** *no direct evidence exists either way for beginning readers and clock-driven
  moving text.* The defensible position is the cautious one, and it happens to match the
  architecture already chosen: **keep the static prompt as the default reading surface; let the
  highway be spectacle beside it at low tiers and the reading surface only at WIZARD, where the
  player has opted in.** If the highway ever becomes the only place the letter appears, that is the
  moment this question stops being academic.

### E. Multi-letter beats — what the genre's "chord" actually maps to

Guitar Hero's multi-note event is a **chord** (several frets at once, one strum). Trevor's
"single or even multiple letters to keep to the beat" needs an analogue, and three candidates
differ in kind:

1. **A digraph on one beat (`th`, `ch`, `sh`, `ing`).** **Best-supported.** Cerni, Longcamp & Job
   (2016) found **"bigram frequency was correlated with IKIs per bigrams"** — inter-keystroke
   intervals track *which letter pair* is being typed, in both touch- and mobile-typing. **Letter
   pairs behave like motor units in real typists**, which is precisely what a chord is. A digraph
   beat is the closest honest translation, and it is also a *reading* unit, which doubles its value
   here.
2. **A whole short word on one beat.** **The best engineering fit and the weakest evidence fit.**
   The engine's pattern stream is already word-shaped, guaranteed content (intro drills, moment
   words, the player's name) is word-shaped, and the word banks exist — so "one word per bar" costs
   almost nothing to build. But a word is not a chord; it is a *run*, and no source found treats a
   multi-keystroke run as a single rhythmic event.
3. **A run of letters across consecutive beats** — i.e. the word spread over a bar, one letter per
   sub-beat. **This is what typing actually is**, and it is the only option where the music's pulse
   and the hands' pulse are the same pulse. It is also the one that makes cadence audible, which
   feeds §0's degradation mechanic directly.
- **⚠️ True chords — two keys at literally the same instant — should be ruled out.** The engine's
  input contract is one expected token at a time, and the only simultaneous-press gesture in the
  whole curriculum is **Level 24's Shift**. A chord mechanic would be a new input contract, not a
  new theme. *(Shift+letter is, however, a genuinely chord-shaped beat, and Level 24 is where it
  would belong if anyone wants one.)*
- **Does any typing product do this?** **Nothing found.** [[typing-as-racing]] documents the
  speed-typing lineage and [[frets-on-fire]] the keyboard-as-controller one; neither issues
  multi-letter rhythmic events. **[unverified] — open.**

### F. What SURVIVAL already provides, and what it would need

`product.md`'s Settings table: **SURVIVAL** is opt-in, never default — *"quarters on the line —
1979 rules"* — with **NOVICE / ARCADE / EXPERT** tiers, 1–5 quarters, **a quarter back at a
15-streak**, and a warm game over. Crucially it already draws the line this act needs: **"time
pressure only — wrong keys NEVER cost anything."**

- **So SURVIVAL is already the right shape.** A rhythm cabinet under SURVIVAL inherits an
  established, opt-in, mercy-bearing time-pressure frame rather than inventing one.
- **What it would need:** a decision about what a "quarter" costs *in a song*. The genre's own
  answer (eject the player mid-song) is forbidden by `product.md`'s *"fidelity may never import a
  failure state,"* and *Beat Saber* is the named trap ([[rhythm-games-by-era]] §7; plain text —
  no `beat-saber` wiki page exists yet) — a no-fail mode that lowers your rank is still a
  punishment. **The natural reading: SURVIVAL supplies the clock, WIZARD supplies the
  fidelity and the degradation, and neither supplies a loss.** ⚠️ **Product decision, flagged.**
- **The two switches are orthogonal and should stay that way:** WIZARD without SURVIVAL = a
  faithful, unhurried Guitar Hero scene; SURVIVAL without WIZARD = the gentle cabinet with a
  1979 quarter on it; both = the real thing.

### G. `frets-on-fire`'s mapping, read closely — and the one precedent that would beat it

[[frets-on-fire]]'s own documentation: **"F1–F5"** are **"frets one through five"**; **"Enter"** is
**"Pick"**; you *"press and hold the approriate [sic] frets when notes appear and tap the pick
button when the notes hit the row of keys at the bottom,"* holding through sustained notes, with
everything rebindable.

- **The layout is the interesting part: five adjacent keys in a straight horizontal row.** F1–F5
  are laid out left-to-right, so **the lane order on screen matches the key order under the hand
  one-to-one.** That spatial congruence is almost certainly why it worked well enough to be
  downloaded 14 million times — and it is **directly reusable**: whatever lanes this act picks,
  **their left-to-right order on screen should match the left-to-right order of the keys under the
  hands.** A finger-lane highway does this naturally (pinky outermost, index innermost), which is
  another point in mapping 1's favour.
- **The gesture does not transfer** (hold-and-strum is chorded, not typed) and **the letters mean
  nothing** there — F1–F5 are buttons. We would be the first to make them letters.
- ⚠️ **The precedent that would beat it is still unread.** [[dance-mat-typing]] — a BBC children's
  typing tutor whose *name* invokes DDR — is the closest possible prior art for "rhythm-game visual
  language over a real keyboard, for kids." **`bbc.co.uk` is unfetchable by this project's tooling,
  now three times over (2026-07-11; the hub pass 2026-09-13; this pass 2026-09-13).** Whether it
  uses lanes at all is **[unverified]** and must not be asserted. **This is the single highest-value
  manual click anyone could make for this act** — five minutes of a human's browser resolves it.

## The facts

### 0. ⚠️ Did a real game make the MUSIC degrade instead of failing you? — **Yes. It was the genre norm, and Rocksmith shipped the decoupled version.**

*This is the section the act should cite. `product.md` §"EXPERIENCE also buys FIDELITY" states the
mechanic; here is its evidence.*

**(a) In the genre's biggest franchise, the player is literally an instrument in the mix.** The
clearest statement of it comes from the outside, in [[taiko-no-tatsujin]]'s own article explaining
why Taiko is *different*:

> *"Unlike other rhythm games such as Guitar Hero, the drumming in Taiko no Tatsujin serves as an
> accompaniment rather than **replacing an instrument in the music**. Missing a note does not
> result in off-key sounds or interruptions to the background track, and players are free to
> strike the drum at any time, provided it does not interfere with nearby notes that could trigger
> a penalty."*

Read the negation forwards and it is a positive statement about the rest of the genre: **in
[[guitar-hero]]-class games your input replaces a real instrument, so missing a note produces
off-key sounds and interruptions to the track.** Trevor's "have the band fall out of rhythm or out
of pitch so it sounds wrong" is a description of how Guitar Hero already worked in 2005.

**(b) [[rock-band]] (2007) escalated it to the whole band, and named the sound of failure.**
*"If a player does not play well enough and falls to the bottom of the Band Meter, they will fail
out of the song and **their instrument will be muted from the audio mix**."* The band audibly
loses a member. Its mercy is also audio-shaped: *"any active player can activate their Overdrive
to bring failed players back into the song, 'saving' the band member. However, a band member can
only be saved twice; after the third failure, they cannot be brought back for that song."*
⚠️ **But note what is coupled to what:** in Rock Band the degradation is the *consequence of a
failure state*, not an alternative to one. Muting follows falling out. That coupling is the part
Trevor's design cuts.

**(c) [[rocksmith]] (2011) is the precedent that already cut it — and it is the one to cite.**
Two facts from the same article, and their combination is the whole argument:
- **"It is impossible for the player to fail a song."**
- The player hears **their own electric guitar**, through *"a custom sound bank referred to as an
  'authentic tone' designed to make the player's guitar sound as close to the original guitar tone
  of the song as possible,"* captured by the Real Tone cable.

**So a beginner playing badly in Rocksmith sounds bad — through their own amp, in the mix, in
front of everyone — and the game takes nothing from them whatsoever.** That is Trevor's mechanic,
commercially shipped, fourteen years before he proposed it. It also adapts *density* rather than
deadline: *"each song is split into a number of phases, and depending on how accurate the player
is during a phase, a subsequent phase may provide more difficult note patterns"* — which is the
EXPERIENCE lever's own logic, per-phrase.

**(d) Harmonix's *Amplitude*-era design points the same way, but is not fully sourced here.**
*(Plain text — no `amplitude` wiki page exists; do not link it until one does.)*
*Amplitude* (2003): *"each color-coded track corresponds to a different aspect of the song, such
as percussion, synth, bass, or vocals"*, and when a track is *"captured"* that *"section will play
automatically for a number of bars, freeing the player to capture another section."* The obvious
implication — that an *un*captured track is not sounding, so the song is audibly assembled from
what you hit — **is an inference the article does not state.** ⚠️ **[unverified]; do not cite
Amplitude as a degradation precedent without a better source.** Its documented failure mechanic is
conventional: *"if the player continually misses notes, an energy meter empties until the game is
over."*

**(e) The keysound question could not be resolved.** The strongest theoretical precedent would be
*beatmania*-style **keysounds** (every note tied to its own sample, so a missed note leaves a
literal hole in the song). **Neither the [[beatmania]] nor the *beatmania IIDX* article mentions
keysounds or the audio consequence of a miss** — both describe only the groove gauge. ⚠️
**[unverified]. Not claimed.** *(`arcade-museum.com` 403 and the exhausted search budget made
further pursuit impossible this session; this is the single best follow-up for a future pass.)*

**(f) What this means for the act, stated plainly.**
- **The degradation mechanic has real precedent and does not need defending as an invention.**
  Guitar Hero/Rock Band shipped audible degradation; Rocksmith shipped it **without** a failure
  state; Taiko is documented as the deliberate opposite.
- **The novel part is narrower and honest:** making degradation the *only* consequence, arriving
  *only* at an opt-in higher EXPERIENCE tier, on a **typing** input. Nothing found this pass
  combines all three. That is a real gap, and a small one.
- **The real-world analogue Trevor gives is the stronger argument anyway** — a beginner on an
  instrument sounds bad and nobody stops them — and it needs no game to have done it first.
- ⚠️ **Two binding constraints from `product.md` that this evidence must not be used to erode:**
  fidelity *"may never import a failure state"* (so Rock Band's mute-on-fail crosses over only as
  *sound*, never as *fail*), and *"winnability is untouched at every tier."* [[rock-band]]'s
  two-save cap and [[guitar-hero]]'s Rock Meter stay in 2007.
- ⚠️ **And one thing the degradation mechanic collides with, which is a product decision and not a
  research finding:** `Settings → Sound: OFF` is a shipped accessibility option
  ([[rhythm-games-by-era]] §10). **An audible-only consequence is invisible with sound off.** If
  degradation is the WIZARD-tier feedback, it needs a visual twin (the band visibly drifting,
  the scene desaturating) or the tier needs a warm explanation. **Flagged for Trevor, not
  decided.**

### 1. What keyboard rhythm games actually did — now read as DISPLAY evidence

- **[[frets-on-fire]]** (Unreal Voodoo, 2006, GPL) is the literal precedent for Guitar Hero on a
  computer keyboard. Its own documentation gives the mapping: **"F1–F5" are "frets one through
  five"** and **"Enter"** is **"Pick"**; the instruction is to *"press and hold the approriate
  [sic] frets when notes appear and tap the pick button when the notes hit the row of keys at the
  bottom,"* holding frets for the full duration of sustained notes, with the keys rebindable from
  the settings menu.
  - **What transfers is the second half of that sentence:** *"when the notes hit the row of keys
    at the bottom."* Frets on Fire proved that a **Guitar Hero note highway is legible on a
    computer screen above a keyboard** — 14 million SourceForge downloads' worth of legible. That
    is display evidence, and it is good.
  - **What does not transfer is its input gesture:** hold-one-thing-while-triggering-another is
    chorded, not typed. The only place that gesture exists in this curriculum is **Level 24's
    Shift**.
  - The same page documents the score *"multipliers resetting upon mistakes"* — present even in
    the hobbyist keyboard build, and still out of bounds here.
- **[[stepmania]]** (2001, MIT) advertises **"keyboard and 'dance pad' support"** on its own front
  page, plus **"an editor for creating your own steps,"** and notes arrows *scrolling upward to
  meet a stationary set of target arrows*. A quarter-century of officially-supported keyboard
  rhythm play — and a reminder that **every track needs a chart**, which is separate labour from
  composing it ([[rhythm-games-by-era]] §10).
- **Still true, and still the gap:** in both cases the keys are **buttons**, not **letters**.
  Nothing found this pass treats letters as the notes. Under the corrected framing that matters
  less than it did — the letters are the *input*, the highway is the *scene* — but it does mean
  there is no existing chart convention to borrow for letter-driven notes.

### 2. ⚠️ The Dance Mat Typing question — still unanswerable, third recorded failure

The intuition that the BBC's [[dance-mat-typing]] "borrowed DDR's visual language for a keyboard"
would be the single best display precedent this project could have — a children's typing tutor
wearing a rhythm game's clothes. **It remains undocumented.** `bbc.co.uk` refused this project's
tooling again on 2026-09-13, a third failure after 2026-07-11 and the hub pass earlier the same
day. The existing page corroborates only that it is a BBC child-facing, home-row-first tutor, via
two third-party institutional references. **[unverified] — do not write the DDR claim into a doc,
a card, or a cabinet description.** It is the exact shape of the invented-justification errors
this project keeps catching ([[pinball-difficulty-settings]] is the canonical one). **One manual
human click resolves it.**

### 3. Rhythm IS a named concept in typing instruction — older and better sourced than the hub thought

[[rhythm-games-by-era]] §12 correction 10 says the touch-typing canon does not document
rhythm-based instruction, having checked Wikipedia's *Touch typing* article. **ERIC tells a
richer story** (the hub's ERIC probe used karaoke/literacy terms, not typing terms):

- **Pringle, G. F. & O'Brien, M. J. (1973), "A Teaching Procedure for the Diatype Analyzer,"
  *Journal of Business Education* (ERIC EJ087362).** The Diatype Analyzer was a **motorised device
  that fastened to a typewriter's carriage** to help teachers pinpoint student difficulties more
  accurately than observation — and its named diagnostic categories include **rhythm**, alongside
  difficult strokes, concentration, carriage return and shift-key/space-bar operation.
- **So mid-century typewriting pedagogy did treat rhythm as a measurable, diagnosable property of
  a student's typing, and built hardware to measure it.** That is a real correction to the hub's
  flat "not documented." **What it is not** is evidence that rhythm *instruction* works — §4.

### 4. ⚠️ The negative finding, and it is the most important thing on this page

- **Fante, Cheryl H. (1980), "The Relationship between a Linear Combination of Intelligence,
  Musical Background, Rhythm Ability and Tapping Ability to Typewriting Speed and Accuracy"
  (ERIC ED201780; master's thesis, August 1980).** **109 high-school students** pretested with the
  **Seashore Rhythm Test** and a **Tapping Test**, post-tested after one semester of typewriting
  instruction, analysed by stepwise multiple regression.
  - **Neither rhythm ability nor musical background was a significant predictor** of typewriting
    speed or accuracy.
  - *"The motivation variable, assignments completed, was the most significant factor in
    predicting typewriting speed."*
  - *"No predictor tests used in this study were able to predict typewriting accuracy."*
- **Read plainly:** the one located study that directly tested "does being rhythmic help you learn
  to type" answered **no** — and the variable that did move speed was **how much practice the
  student actually did**. For this project that is a gift rather than a setback: the game's entire
  thesis is keeping a child practising voluntarily. **A music cabinet is justified because it
  makes a child want to do more drills — the variable that moved. It is not justified as
  rhythm-transfers-to-typing, and nobody should write that claim on a card or in a design doc.**
- **Caveats, stated because they matter:** one study, 1980, n=109, high-schoolers rather than
  early readers, a master's thesis rather than a peer-reviewed journal, and **correlational** — it
  tested pre-existing rhythm *aptitude* as a predictor, not rhythm *training* as an intervention.
  It does not prove rhythm training is useless. It does mean **there is no literature to point at**
  if someone asks for the evidence base.
- **Corroborating negative:** an ERIC query for *"keyboarding rhythm instruction"* returned
  **zero results** (2026-09-13).

### 5. Why a beginning reader's cadence is uneven by mechanism — and why that is fine

- **Scaltritti, Arfé, Torrance & Peressotti (2016), "Typing pictures: Linguistic processing
  cascades into finger movements," *Cognition* 156, 16–29.** Keystroke onset latencies were
  modulated by **lexical and semantic variables** — *"word frequency, age of acquisition, and
  naming agreement"* — while **orthographic** factors influenced *within-word keystroke intervals*,
  indicating spelling processing guides the execution phase itself; *"lexical-semantic variables
  also influenced speed of execution."*
- **Design consequence:** for a child *simultaneously learning to read*, the gaps between
  keystrokes are substantially a readout of **word retrieval and spelling**, not of motor timing.
  A cabinet that scored cadence would be scoring how well they already read. ([[error-feedback-pedagogy]]
  and the One Rule already point the same way: the letter waits because the child is thinking.)
- Cerni et al. (2016) add the same point from the skilled end: **"bigram frequency was correlated
  with IKIs per bigrams"** — even in expert adults, inter-keystroke intervals track *which letter
  pair* is being typed. **Uneven cadence is not a defect to train out; it is what typing is.**
  (See [[letter-frequency]].)
- **This is the precise reason the highway must be scene and not scoring.** The spectacle can be
  perfectly metronomic; the hands cannot, and should not be asked to be.

### 6. The idea with the best evidence-to-effort ratio: tone-per-key

Each [[simon-electronic-game]] button sounds a fixed pitch — the 1978 original an **A-major triad
in second inversion** (red A, blue E, yellow C♯, green E an octave lower; some units B♭-minor) —
so *playing correctly is itself music*. Keystroke Kingdom's curriculum teaches **50 keys** across
Levels 1–25 (counted from `.claude/rules/levels.md`'s assignment table: 26 letters, 10 digits, 11
punctuation/symbols, plus Shift, Space and Backspace) — **twelve and a half times Simon's four.**
A pitch map that turns a correctly-typed word into a pleasant phrase needs **no timing window, no
chart, no receptor and no clock**, works at every existing level rather than one new cabinet, and
is 1978 technology. *(And it is the closest thing in the genre to the letters-as-notes idea that
§1 says nobody has built.)*

### 7. The closest a canon typing tutor ever came to music

[[mavis-beacon]]'s **2011 Ultimate Mac Edition** added **iTunes integration and typing practice on
song lyrics** — *type the words of a song*, not *type on the beat*. The article describes **no
rhythm, metronome, beat or tempo feature** anywhere in the series' feature list. That is the same
place [[rhythm-games-by-era]] §9 landed from the karaoke side: **the screen transfers, the clock
does not.** Two literatures, arrived at independently.

### 8. The design ledger, re-scored under the corrected framing

| Idea | Support | Verdict |
|---|---|---|
| **Note highway as SCENE** (scrolls on its own clock, typing drives it, passing costs nothing) | `js/themes/tetris.js` shipped precedent; `theme-authoring.md` §Mechanics fidelity; [[taiko-no-tatsujin]]'s miss-decoupling | **Supported.** The corrected framing's headline route |
| **Highways in the side margins, one per hand** | `visual-validation.md` layout contract (centre reserved, 0–0.22W / 0.78–1.0W free full-height); product.md L3; Schmuckler & Bosman 1997 | **Strong** — the contract and the curriculum agree |
| **Tone-per-key** (a correct word makes a phrase) | [[simon-electronic-game]] 1978, primary-documented tones | **Strong.** Cheapest, widest, no clock |
| **Untimed echo-the-sequence** ([[touch-me-atari]] loop) | [[call-and-response]] | **Strong**, and era-true to a 1979 arcade |
| **Lyric/word screen that lights as you type** | [[mavis-beacon]] 2011; [[rhythm-games-by-era]] §9 | **Strong** — it is reading support; name it that |
| **Degrading music as the WIZARD-tier consequence** (band drifts out of time/pitch; nothing is taken away) | §0: [[guitar-hero]]/[[rock-band]] shipped audible degradation; [[rocksmith]] shipped it *without* a failure state; [[taiko-no-tatsujin]] documents the genre norm by negating it; `product.md` §EXPERIENCE-buys-FIDELITY | **Supported, with precedent.** The novel part is only the combination (degradation as the *sole* consequence, opt-in, on typing) |
| **A receptor line with judgement flashes** | Native to the genre's display grammar; nothing here supports it | **Open question** — it promises a deadline we will not enforce (§In this game). Degradation partly answers it: the receptor can *sound* wrong instead of *saying* MISS |
| **Scoring cadence / evenness** | Fante 1980 found no predictive value; Scaltritti 2016 explains why a learner's cadence is uneven | **Reject.** (Note the distinction: letting cadence *affect the sound* is §0 and is fine; letting it affect the *score* is not) |
| **Timing windows, gauges, grades, combo multipliers** | [[rhythm-games-by-era]] §7 ledger; `product.md` *"fidelity may never import a failure state"* | **Reject** — unchanged by either re-framing |
| **Muting the player out of the mix** ([[rock-band]]) | Documented, and coupled there to failing out | **Reject as shipped.** Public erasure is the wrong register for a child; the softer drift-out-of-tune carries the same information |
| **"Rhythm training improves typing" as a justification** | Fante 1980; zero ERIC instructional literature | **Reject** — say "joy and practice volume" instead |

## Corrections from citation pass *(2026-09-13)*

0. **⚠️ Framing correction from Trevor, relayed mid-lane — this page was rewritten around it.**
   [[rhythm-games-by-era]] §8 dismissed a gentled note-highway cabinet as *"a different game with
   Guitar Hero's wallpaper."* Trevor struck it: *"making guitar hero 'gentle' doesn't defeat that
   guitar hero inspired the cabinet we made into a typing game — after all we aren't byte for byte
   recreating these original games."* The struck sentence applied a fidelity standard the project
   has never used — that the *player* must perform the original's mechanic — when
   `theme-authoring.md` §"Mechanics fidelity" asks only that **the scene depict it operating**.
   Every shipped level already works that way. **This page's question changed accordingly**, from
   "can rhythm survive the strip" to "how does the highway read as spectacle over a waiting
   prompt." *(The hub file was struck by the orchestrator, not by this lane.)*
1. **Softens [[rhythm-games-by-era]] §12 correction 10.** The hub says *"the touch-typing canon
   does NOT document rhythm-based instruction"* on the strength of Wikipedia's *Touch typing*
   article. **ERIC does document rhythm as a typewriting-instruction concept** — EJ087362 (1973),
   a motorised diagnostic device whose categories include rhythm. The hub's *warning* stands and
   should be kept (never assert "typing classes always used metronomes"), but the flat "not
   documented" is too strong. **Corrected here; the hub file was not edited by this lane.**
2. **Strengthens the same correction from the other side.** Fante 1980 (ED201780) tested the
   rhythm→typing link empirically and found **no predictive relationship**, while "assignments
   completed" predicted speed. That is a better argument than "we found no sources," because it is
   a finding rather than an absence. **Whoever writes the music act's justification should cite
   this rather than hand-wave it.**
3. **[[dance-mat-typing]]'s DDR debt remains unverified — third failure**, now recorded with a
   count (§2). Under the corrected framing this is a *bigger* gap than before, because Dance Mat
   Typing is the one candidate precedent for rhythm-game **display** language over a real
   keyboard. **Worth one manual human click.**
4. **No new claim about osu!/osu!mania is made here.** [[rhythm-games-by-era]] §6a cites it from
   Wikipedia because `osu.ppy.sh` returned 403; this lane did not re-attempt it and asserts
   nothing about it.
5. **⚠️ Second framing update, same day — degradation is doctrine now, and it has precedent.**
   [[rhythm-games-by-era]] §5 calls the timing-window-versus-waiting-letter conflict structural and
   unfixable by tuning. `product.md` §"EXPERIENCE also buys FIDELITY, not just volume" (Trevor,
   2026-09-13) resolves it by changing what the window *does*: it **degrades the music instead of
   gating the player.** §0 of this page supplies the evidence the hub could not: the genre already
   made the music degrade ([[taiko-no-tatsujin]]'s article, negating the norm), and
   [[rocksmith]] already shipped degradation with **no** failure state. **§5's diagnosis was
   right; its implied conclusion — that only the call-and-response lineage survives — no longer
   follows.** *(Hub not edited by this lane.)*
5b. **⚠️ Third direction the same day — the act's mechanic was spec'd, and this page became its
   research brief.** Trevor: *"EXPERIENCE wizard and SURVIVAL mode are the two settings that could
   turn this into a real 'typing in guitar hero cabinet' style game play… we have an entire
   keyboard… the letter shows up in the string for what is intended to be typed to the rhythm —
   single or even multiple letters to keep to the beat."* The **§The mapping question** section
   above is the response. **Nothing in it is a decision**; the mapping choice is a product call and
   will get its own spec. The key-subset setting Trevor floated is **deferred by his own
   instruction** and appears here only as a future lever. **One correction the brief itself
   invites:** the assumption that "more than 5 or 6 strings" is the hard part may be backwards —
   §B argues the binding constraint is *simultaneity*, and typing is monophonic, so the lane count
   may cost far less than it first appears. That is [unverified] and should be playtested rather
   than reasoned about further.
6. **Reverses [[rhythm-games-by-era]] §12 correction 8.** The hub says *"'Guitar Hero boos you off
   stage' — the flavour is right, the wording is not sourced."* **It is sourced.** Both the
   *Guitar Hero* and *Guitar Hero (series)* articles, fetched 2026-09-13, state: *"Should the Rock
   Meter drop below the red section, the song will automatically end, with the player booed off
   the stage by the audience."* The booing may be printed as fact (it remains, obviously, a
   mechanic to reject — it is the exact emotional register this project forbids).

## Unsourceable / weakly-sourced items

- **[unverified]** What [[dance-mat-typing]] kept from or dropped of DDR's visual language.
- **[unverified]** Whether any commercial or open-source rhythm game has ever treated *letters as
  notes*. This pass found none, but "none found" is not "none exists," and with the search budget
  exhausted (below) discovery was limited to direct fetches of pages already known to the graph.
- **[unverified]** Whether many lanes cost a child anything in **visual search** across a note
  highway (§B, qualification 2). The tracking literature measures *simultaneous* moving targets;
  typing is monophonic, so the ceiling may not bind at all. No study located.
- **[unverified]** Whether [[dance-mat-typing]] uses lanes, a note highway, or any rhythm-game
  display language. **Three `bbc.co.uk` fetch failures.** §G names this the single highest-value
  manual click available for this act.
- **[unverified]** Whether any typing product has ever issued **multi-letter rhythmic events**
  (§E). Nothing found.
- **⚠️ Explicitly NOT transferable, recorded so it is not mis-used:** Krenca et al. (2024) found
  scrolling harmless to children's comprehension, but that is **reader-paced page scrolling**, not
  clock-driven moving text (§D). Do not cite it as evidence that a note highway is safe for early
  readers.
- **[unverified]** Whether *beatmania* / *beatmania IIDX* use **keysounds** (note-linked samples,
  so a missed note leaves a literal hole in the song). Neither article mentions them; this would
  be the genre's purest degradation mechanic and **is the single best follow-up for a future
  pass** (§0e).
- **[unverified]** That *Amplitude* (2003) silences uncaptured instrument tracks. The article
  describes capture and automatic playback but never states the negative case (§0d). **Do not
  cite Amplitude as a degradation precedent on this page's authority.**
- **Not a research finding — flagged as a design decision:** everything in §In this game about
  what a receptor line should look like when nothing is judged, and the `Sound: OFF` collision in
  §0f. No source supports any option; they are candidates and flags, not conclusions.
- **Existence verified, content unread — deliberately NOT cited as support:** Salthouse, T. A.
  (1986), "Perceptual, cognitive, and motoric aspects of transcription typing," *Psychological
  Bulletin* 99(3), 303–319 (PMID 3714922), and Salthouse & Saults (1987), *Journal of Applied
  Psychology* 72(2), 187–196 (PMID 3583977). The PubMed records resolved and confirm both
  citations exist; **no abstract text was retrievable**, so nothing here rests on them. They are
  the obvious next read for anyone deepening §5.
- **Dropped as unusable this session:** `www.bbc.co.uk` (blocked to this tooling, third recorded
  failure), `pubmed.ncbi.nlm.nih.gov` HTML pages (cookie wall — the NCBI **E-utilities API** was
  used instead and is what the PubMed citations below point at), `csrc.nist.gov/glossary/term/…`
  (404 — a NIST definition of "keystroke dynamics" was sought as a second anchor for *typing
  rhythm is measurable* and not found; that claim rests on the peer-reviewed IKI literature
  instead).
- **Sourcing conditions:** the session's **WebSearch budget was fully exhausted (200/200) before
  this lane began.** Every URL below was reached by **direct WebFetch of a page or of a search
  endpoint** (ERIC query URLs, NCBI E-utilities, archive.org) and read this session. Nothing here
  is "search result only" — the trade-off is coverage, not confidence.

## See also

[[call-and-response]] · [[rhythm-games-by-era]] · [[frets-on-fire]] · [[stepmania]] ·
[[taiko-no-tatsujin]] · [[rocksmith]] · [[guitar-hero]] · [[rock-band]] · [[beatmania]] ·
[[touch-me-atari]] · [[dance-mat-typing]] · [[touch-typing-pedagogy]] ·
[[error-feedback-pedagogy]] · [[letter-frequency]] · [[mavis-beacon]] · [[typing-as-racing]] ·
[[keyboard-as-cockpit]] · [[qwerty-keyboard]] · [[simon-electronic-game]] ·
`.claude/rules/theme-authoring.md` · `.claude/rules/visual-validation.md` ·
`.claude/rules/product.md` §Level 3

## References

1. [Frets on Fire — official documentation, "Playing the game"](https://fretsonfire.sourceforge.net/documentation/howto/) — primary: **F1–F5 are "frets one through five," Enter is "Pick"**; *"press and hold the approriate [sic] frets when notes appear and tap the pick button when the notes hit the row of keys at the bottom"*; sustained-note holding; rebindable defaults; and the consecutive-play score multiplier that resets on a mistake. The display precedent of §1. **[fetched]**
2. [StepMania — official site](https://www.stepmania.com/) — primary: *"a free dance and rhythm game for Windows, Mac, and Linux… **keyboard and 'dance pad' support**, and an editor for creating your own steps"*; MIT licence. Establishes keyboard rhythm play as documented, first-class and long-lived, and the step editor as evidence that every track needs a chart. **[fetched]**
3. [Pringle, G. F. & O'Brien, M. J. (1973), "A Teaching Procedure for the Diatype Analyzer," *Journal of Business Education* — ERIC EJ087362](https://eric.ed.gov/?q=%22Diatype+Analyzer%22) — the motorised carriage-mounted device for diagnosing student typewriting difficulties, with **rhythm** named among its diagnostic categories. The source behind Correction 1. **[fetched]**
4. [Fante, Cheryl H. (1980), "The Relationship between a Linear Combination of Intelligence, Musical Background, Rhythm Ability and Tapping Ability to Typewriting Speed and Accuracy" — ERIC ED201780](https://eric.ed.gov/?id=ED201780) — **the negative finding**: 109 high-school students, Seashore Rhythm Test and Tapping Test pretests, one semester of instruction, stepwise multiple regression; neither rhythm ability nor musical background predicted outcomes; *"the motivation variable, assignments completed, was the most significant factor in predicting typewriting speed"*; *"no predictor tests used in this study were able to predict typewriting accuracy."* **[fetched]**
5. [ERIC search: "keyboarding rhythm instruction" — zero results](https://eric.ed.gov/?q=keyboarding+rhythm+instruction) — the corroborating negative: no ERIC-indexed body of instructional research on rhythm in keyboarding. **[fetched]** *(Recorded as a real negative result rather than omitted.)*
6. [Schmuckler, M. A., & Bosman, E. L. (1997). "Interkey timing in piano performance and typing." *Canadian Journal of Experimental Psychology* 51(2), 99–111 — PubMed PMID 9340078](https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=9340078&retmode=text&rettype=abstract) — *"in typing, when the fingers executing two successive movements are on the same hand, the time between keystrokes is longer than when the fingers are on different hands,"* plus the paper's own refinement that the typing differences *"were limited to letter sequences requiring fore-aft and lateral finger movements."* **[fetched via NCBI E-utilities]**
7. [Cerni, T., Longcamp, M., & Job, R. (2016). "Two thumbs and one index: A comparison of manual coordination in touch-typing and mobile-typing." *Acta Psychologica* 167, 16–23 — PubMed PMID 27085840](https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=27085840,19898778&retmode=text&rettype=abstract) — independent corroboration: **"manual alternation is performed faster than manual repetition,"** mean inter-keystroke intervals falling as manual alternations within a word rise, and **bigram frequency correlating with IKIs per bigram**. **[fetched via NCBI E-utilities]** *(This URL returns two records; the second — Baker et al. 2010 on rheumatoid arthritis and keyboarding — is unrelated and is not cited.)*
8. [Scaltritti, M., Arfé, B., Torrance, M., & Peressotti, F. (2016). "Typing pictures: Linguistic processing cascades into finger movements." *Cognition* 156, 16–29 — PubMed PMID 27472035](https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=27472035&retmode=text&rettype=abstract) — keystroke onset latencies modulated by word frequency, age of acquisition and naming agreement; orthographic factors influencing *within-word* keystroke intervals; lexical-semantic variables influencing speed of execution. The mechanism behind §5. **[fetched via NCBI E-utilities]**
9. [Mavis Beacon Teaches Typing — Wikipedia](https://en.wikipedia.org/wiki/Mavis_Beacon_Teaches_Typing) — **no rhythm, metronome, beat or tempo feature appears anywhere in the canon tutor's documented feature list**; the only music-adjacent feature is the 2011 Ultimate Mac Edition's **iTunes integration and song-lyric typing practice** — words, not beats. Also the car-racing minigame documented on [[typing-as-racing]]. **[fetched]**
10. [Simon (game) — Wikipedia](https://en.wikipedia.org/wiki/Simon_(game)) — the per-button fixed pitches (A-major triad in second inversion; red A, blue E, yellow C♯, green E an octave lower, with a B♭-minor variant in some 1978 units) that make tone-per-key a sourced 1978 mechanic rather than a modern invention. **[fetched]**
11. [Taiko no Tatsujin — Wikipedia](https://en.wikipedia.org/wiki/Taiko_no_Tatsujin) — **the key citation for §0a**, verbatim: *"Unlike other rhythm games such as Guitar Hero, the drumming in Taiko no Tatsujin serves as an accompaniment rather than replacing an instrument in the music. Missing a note does not result in off-key sounds or interruptions to the background track, and players are free to strike the drum at any time, provided it does not interfere with nearby notes that could trigger a penalty."* Also the spirit-gauge clear condition. **[fetched]**
12. [Rock Band (video game) — Wikipedia](https://en.wikipedia.org/wiki/Rock_Band_(video_game)) — §0b: *"If a player does not play well enough and falls to the bottom of the Band Meter, they will fail out of the song and their instrument will be muted from the audio mix,"* and the Overdrive rescue capped at two saves per song. **[fetched]**
13. [Rocksmith — Wikipedia](https://en.wikipedia.org/wiki/Rocksmith) — §0c, the decoupled precedent: *"It is impossible for the player to fail a song"*; the per-phase adaptive note density (*"each song is split into a number of phases, and depending on how accurate the player is during a phase, a subsequent phase may provide more difficult note patterns"*); and the "authentic tone" sound bank through which the player hears their own guitar. **[fetched]**
14. [Guitar Hero — Wikipedia](https://en.wikipedia.org/wiki/Guitar_Hero) and [Guitar Hero (series) — Wikipedia](https://en.wikipedia.org/wiki/Guitar_Hero_(series)) — the Rock Meter and, verbatim in both, *"Should the Rock Meter drop below the red section, the song will automatically end, with the player booed off the stage by the audience"* (Correction 6), plus the Star Power scoring multiplier. **Negative finding recorded:** neither article describes the audio consequence of an individual missed note — the degradation claim in §0a rests on the Taiko article's characterisation, not on Guitar Hero's own. **[both fetched]**
15. [Amplitude (2003 video game) — Wikipedia](https://en.wikipedia.org/wiki/Amplitude_(2003_video_game)) — §0d: the per-instrument colour-coded tracks, the "capture" mechanic and automatic playback, and the energy meter that ends the game. Cited for what it *does* say; the silencing inference it does **not** support is flagged [unverified]. **[fetched]**
16. [beatmania — Wikipedia](https://en.wikipedia.org/wiki/Beatmania) and [beatmania IIDX — Wikipedia](https://en.wikipedia.org/wiki/Beatmania_IIDX) — cited for a **negative finding** (§0e): both describe the groove gauge and its clear/fail thresholds, and **neither mentions keysounds or any audio consequence of a missed note.** Beatmania's *"buttons similar to those of a musical keyboard, and a rubber pad that emulates a vinyl record"* (per the *Rhythm game* article, ref 18) is the lane-count entry in §A. **[both fetched]**
17. [Guitar Hero Live — Wikipedia](https://en.wikipedia.org/wiki/Guitar_Hero_Live) — **the key citation for §A**: the six-button, two-rows-of-three controller; the developers' stated rationale that *"the three-button layout avoids the need to use one's pinkie finger, a difficulty they recognized new players had on the traditional five-button controller"* and the aim of *"more realistic simulations of chords"*; the split critical reception (*"the buttons themselves were too small and tight on the neck of the controller, and the new challenge may cause more casual players to forgo attempt to learn the new system"*); and the commercial outcome — missed sales expectations, ~50 FreeStyleGames layoffs in March 2016, the 2017 sale to Ubisoft, GHTV shut down 1 December 2018. **[fetched]**
18. [Rhythm game — Wikipedia](https://en.wikipedia.org/wiki/Rhythm_game) — the genre's own term **"note highway"** (*"many rhythm games use a scrolling 'note highway' to display what notes are to be played, along with a score and a performance meter"*), the press-buttons-at-precise-times definition, and the accessibility note that *"most rhythm games also support more conventional input devices, such as control pads."* **[fetched]** *(Negative finding recorded: it gives no per-game lane counts — those come from the individual articles.)*
19. [Dance Dance Revolution — Wikipedia](https://en.wikipedia.org/wiki/Dance_Dance_Revolution) — §A's four-lane entry: *"four [acrylic glass] pads arranged and pointing in the orthogonal directions (left, up, down and right)"*; and the display convention that **arrows scroll UPWARD to stationary receptors near the TOP** (the "Step Zone"), which is the opposite of Guitar Hero's bottom receptors — relevant to the composition question in §In this game. Also the Dance Gauge failure rule. **[fetched]**
20. [Drew, T., & Vogel, E. K. (2008). "Neural measures of individual differences in selecting and tracking multiple moving objects." *The Journal of Neuroscience* 28(16), 4183–4191 — PubMed PMID 18417697](https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=22963232,18417697&retmode=text&rettype=abstract) — **"most individuals can track only approximately four objects simultaneously"** (§B). The same URL returns O'Hearn, K., Franconeri, S., Wright, C., Minshew, N., & Luna, B. (2013), *JEP: Human Perception and Performance* 39(2), 494–509 (PMID 22963232), corroborating that *"a performance limit of four elements in typical adults is thought to reflect individuation capacity."* **[fetched via NCBI E-utilities]**
21. [Koldewyn, K., Weigelt, S., Kanwisher, N., & Jiang, Y. (2013). "Multiple object tracking in autism spectrum disorders." *Journal of Autism and Developmental Disorders* 43(6), 1394–1405 — PubMed PMID 23104619](https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=23104619,25495739&retmode=text&rettype=abstract) — the developmental qualification in §B: **"MOT performance improved from 5 to 10 years"** in typically developing children as well as the ASD group — i.e. the ~4 adult ceiling is *not* a five-year-old's ceiling. **[fetched via NCBI E-utilities]** *(Cited only for the typically-developing developmental trajectory; the study's ASD findings are outside this page's scope. The same URL returns an unrelated cranial-nerve eye-tracking paper, not cited.)*
22. [Walker, R., Bryan, L., Harvey, H., Riazi, A., & Anderson, S. J. (2016). "The value of tablets as reading aids for individuals with central visual field loss: an evaluation of eccentric reading with static and scrolling text." *Ophthalmic & Physiological Optics* 36(4), 459–464 — PubMed PMID 27061397](https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=27061397,28766371&retmode=text&rettype=abstract) — §D: comparable reading speed (≥85 wpm) and ~95% comprehension between static and horizontally scrolling single-line text, with **significantly lower error rates for dynamic than static text**. The same URL returns Harvey, H., & Walker, R. (2018), *Quarterly Journal of Experimental Psychology* 71(9), 1887–1897 (PMID 28766371): *"literal comprehension can be reasonably well maintained with scrolling text,"* declining **at faster scroll speeds**, with inference questions harder and **working memory capacity and display speed** significant. **[fetched via NCBI E-utilities]** *(Both are adult studies reading prose — adjacent to, not on point for, a child reading single letters. Stated as such in §D.)*
23. [Krenca, K., Taylor, E., & Deacon, S. H. (2024). "Scrolling and hyperlinks: the effects of two prevalent digital features on children's digital reading comprehension." *Journal of Research in Reading* 47(3), 269–291 — ERIC EJ1440592](https://eric.ed.gov/?id=EJ1440592) — 75 children in Grades 3–5; *"performance was similar between the clicking and scrolling conditions,"* with **scrolling having no negative impacts** while definition hyperlinks reduced comprehension. **[fetched]** ⚠️ **Cited in §D expressly as a NEAR-MISS that does not transfer** — it measures reader-controlled page scrolling at the reader's own pace, not clock-driven moving text.
24. [ERIC search: `"moving text" reading beginning readers` — zero results](https://eric.ed.gov/?q=%22moving+text%22+reading+beginning+readers) — the negative finding behind §D's honest verdict: no ERIC-indexed study of beginning readers and moving text. **[fetched]**

*In-repo sources (not web citations, read from the working tree 2026-09-13):
`js/themes/tetris.js` header comment + gravity constants (`FALL_MS_PER_CELL`, `NUDGE_FALL_MS`,
`ENGAGEMENT_MS` — the shipped clock-without-a-deadline precedent); `js/levels.js` **`KEY_REACH`**
(`{hand, finger: 0–3, reach}` — the data every finger/hand lane mapping in §C needs, already
shipped) and **`FINGER_MAP`** (the human-readable finger names); `js/ui/hud.js` `KEY_LAYOUT` (the
single source of truth for keyboard geometry — a row mapping must derive from it, never redefine
it); `.claude/rules/visual-validation.md` Theme Layout Contract (the measured reserved/stage
fractions); `.claude/rules/theme-authoring.md` §Mechanics fidelity, §Game-feel rules (engagement
gates); `.claude/rules/product.md` §"EXPERIENCE also buys FIDELITY, not just volume", the Settings
table (SURVIVAL's opt-in tiers, mercy quarters, and "wrong keys NEVER cost anything") and Level 3;
`.claude/rules/levels.md` assignment table (the 50-key count); `CLAUDE.md` Engine input contract
(one expected token at a time — the basis for §E's rejection of true chords). No file outside
`research/` was modified by this lane.*
