---
title: Three-Letter High-Score Initials
type: concept
tags: [arcade-history, arcade-culture, act-card, proposed-content]
sources: 4
verified: 2026-09-14
---

Entering three letters beside your score is the most durable ritual arcades ever produced
— and the "why only three" is **much less well documented than the ritual itself**. What
*is* sourceable: Exidy's **Star Fire** (December 1978) is credited as the first arcade
game to let a top scorer enter initials in a high-score table; Atari's **Asteroids**
(November 1979) is what made it the industry standard, and The Strong's museum record
carefully says *"one of the first,"* not the first. The three-character limit was a strong
convention, **not a rule** — Nichibutsu's *Moon Cresta* allowed up to ten. The only
explanation for "three" located this session is a single quote from one Atari employee,
with untraced provenance, and it is flagged below rather than promoted.

## In this game

**Not yet built.** Written for the **ACT 1 act-card** shelf
(`docs/specs/act-exclusive-cards.md` §5.5). It is also the act card that touches the game
most directly: Level 24's cabinet **is** a High Score Entry screen (`js/themes/highscore.js`,
`.claude/rules/levels/act5.md`), where the player types their own name in capitals. This
card is the history of that exact screen.

**Candidate moment words** (Level 15 closure: lowercase `a–z` plus `;` `,` `.` `/`):

| Word | Legal? | Why |
|---|---|---|
| `initials` | ✅ lowercase letters only | the subject itself; 8 letters, real vocabulary, good at L15+ |
| `aaa` | ✅ lowercase letters only | the placeholder every high-score table started on. ⚠️ **the "everyone started at AAA" convention is NOT sourced here** — use only as a word, never as a fact |
| `letters` | ✅ lowercase letters only | plainest fallback |

None collides with the 60 spent card words (`docs/specs/hardware-wing.md` §5.4.6).
Related: [[attract-mode]] (where the initials were displayed, all day, to strangers),
[[asteroids]], [[space-invaders]], [[arcade-coin-door]].

## The facts

- **First to display a high score at all: Taito's *Space Invaders* (1978)** — *"generally
  regarded as the first arcade game to display the highest score"*, but with **no initial
  entry**. (The Arcade Blogger.)
- **First to let you enter initials: Exidy's *Star Fire*.** Wikipedia's article states it
  was *"the first to allow a highest scoring player to enter their initials in a high
  score table"*, released *"as Star Fire in December 1978"*, and repeats it in the Legacy
  section: *"Star Fire is remembered as the first game to allow players to enter their
  initials next to their high scores."* Both statements are footnoted to the **Killer
  List of Videogames (arcade-museum.com)** — an institutional arcade database, **but that
  page returned HTTP 403 on direct fetch this session and was therefore NOT read.** The
  claim is carried here by Wikipedia plus The Arcade Blogger's independent mention of
  *Star Fire* preceding *Asteroids*; treat the exact "first" as well-supported-but-not-
  primary-verified.
- **What made it universal: *Asteroids*, November 1979.** The Strong National Museum of
  Play's object record: *"Asteroids was one of the first coin-operated video games to
  allow players to add their three letter initials to a list of high scores."* And, on
  why it mattered: the game's *"unique combination of challenging gameplay; glowing
  graphics; intensifying, heartbeat-like sound effects; and the drive to add one's
  initials to the high score list made the game a massive hit."* **Note the hedge in the
  museum's own wording — "one of the first." A card must not upgrade that to "the
  first."** (This is the [[asteroids]] page's cabinet; November 1979 matches it.)
- **Three was a convention, not a limit of the medium.** The Arcade Blogger's survey
  records **Nichibutsu's *Moon Cresta*** letting players *"enter up to 10 characters"*,
  and Atari's *Quantum* using a trackball for initial entry. So the three-character box
  was a choice repeated across the industry, not a technical ceiling.
- **⚠️ The one located explanation for "three," and why it is not promoted here.** The
  Arcade Blogger quotes **Atari's Steve Calfee**: *"Back then we restricted high score
  initials to 3 letters as a way to limit obscenities in our game attract mode."* This is
  **singly sourced**: the article gives no original publication, interview, or date for
  the quote, and a targeted search for the quote's origin returned only the same article
  and pages repeating it. It is a *lovely* explanation — and note the loop it closes with
  [[attract-mode]], since the initials were about to be shown to a whole room, all day —
  but it is one unattributed sentence from one person at one company.
  **Recommendation: do not put this on a child-facing card unless a second, independent
  source is found.** If it is ever used, it must be attributed in the card text itself
  ("an Atari designer later said…"), never stated as the reason.
- **⚠️ What is NOT sourced at all: the memory-cost explanation.** "Three letters because
  RAM was expensive" is the most commonly-reasoned answer and **no source located this
  session states it.** It is exactly the plausible-but-invented justification class this
  project has been burned by before. Do not write it.

## Card-ready facts

1. *"When you beat the top score on Asteroids in 1979, the machine let you type three
   letters beside it. Your initials sat on that screen until somebody else beat you."*
   (161 chars) — supports: The Strong National Museum of Play, Asteroids object record
   **[fetched]** (*"three letter initials to a list of high scores"*, November 1979).
2. *"Three letters was a habit, not a rule. One arcade game, Moon Cresta, let you type
   ten. Three simply fit the screen — and three is what everybody remembers."* (154
   chars) — supports: The Arcade Blogger, *Anatomy of Arcade High Score Tables*
   **[fetched]** (Moon Cresta's ten characters, against the three-character standard).
   ⚠️ *"Three simply fit the screen" is inference, not a sourced reason — soften to "three
   is what nearly every machine used" if the card must be strictly literal.*
3. *"Asteroids made it famous, but an earlier cabinet got there first: Exidy's Star Fire,
   in December 1978, was the first to let a top scorer leave their initials behind."*
   (163 chars) — supports: Wikipedia *Star Fire* **[fetched]** (twice, in lead and
   Legacy) + The Arcade Blogger **[fetched]** (Star Fire preceding Asteroids).
   ⚠️ *Wikipedia's footnote for this is KLOV, which 403'd and was not read — see facts.*
4. *"Space Invaders, 1978, was the first arcade game to show a high score on the screen.
   It did not yet ask who you were. That came a few months later."* (145 chars)
   — supports: The Arcade Blogger **[fetched]** (*"generally regarded as the first arcade
   game to display the highest score"*) + Wikipedia *Star Fire* **[fetched]** for the
   December 1978 initial-entry date that follows it. ⚠️ *"a few months later" is doing
   arithmetic across two 1978 dates whose months are not both pinned — prefer "soon
   after."*

## References

1. [Asteroids — The Strong National Museum of Play](https://www.museumofplay.org/games/asteroids/) —
   institutional object record: November 1979, *"one of the first coin-operated video
   games to allow players to add their three letter initials to a list of high scores"*,
   and the *"drive to add one's initials"* as a driver of the game's success. **[fetched]**
2. [Star Fire — Wikipedia](https://en.wikipedia.org/wiki/Star_Fire) — Exidy, December
   1978, and the twice-stated claim that it was the first to allow initial entry in a
   high-score table. Footnoted to KLOV, which this session could not read. **[fetched]**
3. [Anatomy of Arcade High Score Tables — The Arcade Blogger](https://arcadeblogger.com/2021/01/31/anatomy-of-arcade-high-score-tables/) —
   specialist arcade-history blog: *Space Invaders* as first to display a high score,
   *Star Fire* preceding *Asteroids* on initial entry, *Moon Cresta*'s ten characters,
   *Quantum*'s trackball entry, and the **singly-sourced, provenance-untraced** Steve
   Calfee quote. **[fetched]**
4. [Star Fire — Museum of the Game (KLOV / arcade-museum.com)](https://www.arcade-museum.com/Videogame/star-fire) —
   the institutional database Wikipedia footnotes for the "first initials" claim.
   **⚠️ UNUSABLE THIS SESSION — returned HTTP 403 on fetch; listed so a future pass knows
   exactly which page to try again, and explicitly NOT cited as if read.**

## See also

[[attract-mode]] — where the initials were shown: to an empty room, over and over.
[[asteroids]] — the cabinet that made the ritual universal.
[[space-invaders]] — the high score without the name.
[[arcade-coin-door]] — the other half of the loop: the score that made you spend again.

## Unsourceable / weakly-sourced items

- **Why exactly three letters.** One singly-sourced, unattributed quote (Calfee, via The
  Arcade Blogger). Not promoted to a card. See "The facts."
- **"Because memory was expensive."** No source. Explicitly not asserted.
- **The "AAA" default convention.** Widely remembered, not sourced this session. The word
  `aaa` may be used as a moment word; the *claim* may not be made.
- **KLOV/arcade-museum.com is currently unfetchable** (403). It is the reference of record
  for arcade-cabinet metadata and the footnote behind the *Star Fire* claim; a future pass
  with a working route to it should upgrade reference 2's support from
  Wikipedia-plus-blog to primary-database.
