---
title: Stickybear Typing
type: entity
tags: [typing-pedagogy, educational-software, edutainment, product, history-card]
sources: 7
verified: 2026-09-13
---

Stickybear Typing (Optimum Resource, 1985) is a typing tutor for children built around
[[stickybear|the Stickybear character]], written by Richard Hefter and Susan Dubicki for
the Apple II. It is the closest historical ancestor Keystroke Kingdom has that nobody in
this project had noticed: it teaches home keys first and reaches outward to "the full
keyboard with shifts and numbers," it lets the learner **choose their own difficulty**, it
**saves progress to the disk**, and its third mode is not a drill at all — it is typing
**jokes, riddles, and stories**. Four design decisions Keystroke Kingdom arrived at
independently were all shipping on a 48K floppy in 1985.

## In this game

This page is the missing ancestor in [[touch-typing-pedagogy]]'s canon list. Placed beside
[[mario-teaches-typing]] (1992), [[mavis-beacon]] (1987) and [[slam-dunk-typing]] (1997),
Stickybear Typing is both the **earliest** of the childhood tutors this project compares
itself to and the one whose *shape* matches Keystroke Kingdom most closely:

- **Keypress** = the curriculum. "Home key position" first, then outward to shifts and
  numbers — the same physiological ordering documented in [[touch-typing-pedagogy]] and
  followed by `.claude/rules/levels.md`. Our Levels 1–4 (home row) → 24 (Shift) → 16–20
  (numbers) is Keypress's arc, re-cut.
- **Thump** = the arcade skin. A fast-action game where typing keeps Stickybear from being
  bumped by blocks — i.e. the drill wearing a game costume, which is the whole premise of
  our cabinet-per-level design.
- **Stories** = the part almost every later tutor dropped, and the part we rebuilt twice
  without knowing it existed. Our **Level 25 "MY STORY" coda** (the player types a readable
  all-26-letter story) and **Act 6's riddle creatures** (`js/textworld/riddles.js`) are both
  "Stickybear Stories" — typing something worth reading rather than something worth scoring.
- **"Choose your own levels of difficulty"** is the 1985 ancestor of our EXPERIENCE and
  MIN/MAX WORD LENGTH settings (product.md §Word Length, "the game ages with the player").
- **"Store your efforts on the disk to track your progress"** is the ancestor of
  `js/slots.js` — a saved game per player, on the family's one machine.

What we do NOT know is how it handled a wrong keypress. No source found this session
documents its error behaviour, so this page must never be cited as a precedent for the One
Rule — see [[error-feedback-pedagogy]] for what actually grounds that.

## The facts

- **Author credits: Richard Hefter and Susan Dubicki.** Two independent Internet Archive
  preservation records (4am/san inc disk-image writeups for rev. 2 and rev. 3) both state:
  "1985 educational program by Richard Hefter and Susan Dubicki," distributed by Optimum
  Resource, Inc.
- **Publisher:** Optimum Resource, Inc. See [[stickybear]] for the Weekly Reader / Xerox
  Education Publications relationship.
- **Platform:** Apple II. The woz-a-day preservation of the original disk notes it "Runs on
  any Apple II with 48K."
- **Date is genuinely ambiguous — do not state a single year with false precision.** The
  Internet Archive's photographed retail-copy record reports *three different dates on one
  product*: **1986 on the disk label, 1985 on the title screen, 1984 on the case.** Archive
  metadata elsewhere files it as `Stickybear Typing (1985)(Optimum Resource)`. **1985** is
  the best single answer (title screen + both 4am writeups agree), but the 1984–1986 spread
  is real and should be acknowledged rather than smoothed over.
- **Three programs in one package**, per the box/manual text captured in the photographed
  retail record:
  - *Stickybear Keypress* — "Practice everything from the simplest drills in home key
    position to complex exercises that require the full keyboard with shifts and numbers."
  - *Stickybear Thump* — "A fast-action game": "Save Stickybear from being bumped by the
    blocks the robot is tossing."
  - *Stickybear Stories* — "Type away with" "jokes, riddles, and stories from the Adventures
    of Stickybear."
  A separate Archive record for a cracked Apple II copy independently lists the same three
  game names: "Keypress, Thump, and Stories."
- **Learner-set difficulty and saved progress:** the same retail record quotes the package
  as letting the user "Choose your own levels of difficulty" and "store your efforts on the
  disk to track your progress."
- **Physical contents** of the retail box, as archived: disk, case, **keyboard reference
  guide**, user's manual, stickers, and a family poster. (The paper guide turns out to be the
  *lesser* ancestor of `js/ui/hud.js` — the program draws one on screen too; see below.)
- **It kept shipping for over a decade.** A 1988 re-release was distributed on 3.5-inch
  (800K) disk; a 1997 CD-ROM school edition is catalogued as *"Stickybear Typing: A Typing
  Instructor for Everyone! School Version with Lesson Plans."*
- **Unverified this session:** how it responded to a wrong key; its word/lesson bank; sales
  figures; whether "Keypress" used a specific published curriculum. Not asserted anywhere
  above.

## What the screens actually show (added 2026-09-13, image pass)

The two archived **boot videos** — the original release and rev. 3, independent recordings —
were downloaded and stepped through frame by frame. They are the first direct look anyone on
this project has had at the program running, and what they show is closer to Keystroke Kingdom
than the packaging text suggested.

**A blue on-screen keyboard occupying the lower third of the screen**, a full ANSI layout drawn
as white keys on bright blue, present continuously during drills — not a help screen you summon.

**It highlights the next key to press, with a box around it, and the highlight leads the
typing.** Stepped at 2 fps through the opening drill: the box sits on **J** while the text pane
is still empty → `j` appears → the box moves to the **spacebar** → `jj ` appears → back to
**J** → `jj jj` appears → the box moves to **F**, and only then does an `f` get typed. **The
spacebar is treated as a key worth showing**, which is the same judgement call `KEY_LAYOUT` in
`js/ui/hud.js` makes.

**The opening drill is `j`, then `jj jj`, then `jj jj ff ff`.** J and F, in that order, as the
first two keys a child ever types. Keystroke Kingdom's Level 1 is J & F with content
*"j, f, jf, fj"* (`.claude/rules/levels/act1.md`), arrived at independently from the same
physiological reasoning documented in [[touch-typing-pedagogy]]. Starting at level 4 (rev. 3's
recording) yields `jjff k` — K enters fourth, as it does here.

**Four screens have near-identical counterparts in this game:**

| Stickybear Typing, 1985 | Keystroke Kingdom, 2026 |
|---|---|
| `STICKYBEAR TYPING MAIN MENU` / **`CHOOSE YOUR GAME:`** / 1 Keypress · 2 Thump · 3 Stories | The save-slot picker's own header is **`CHOOSE YOUR GAME`** (`js/ui/screens.js`) — the same two words, independently chosen |
| `PLEASE TYPE YOUR NAME:` | The name-entry screen (`levels/onboarding.md`) |
| `ENTER STARTING LEVEL (1-30):` | The level-select screen; our curriculum runs 1–25 |
| `SELECT: 1. TYPEWRITER MODE  2. WORD PROCESSOR MODE` | Level 25's cabinet is a word processor (`js/themes/wordprocessor.js`) |

**Do not over-read this.** These are convergences, not influences — nobody on this project had
seen the program. They are recorded because they are good evidence that the design constraints
(a child, a keyboard, one screen, home keys first) push independent designers to the same
answers forty years apart, and because [[touch-typing-pedagogy]] is stronger for having a dated
1985 instance of each pattern rather than a 2026 assertion.

**What the videos do NOT show: *Thump*.** Both recordings boot into Keypress and run typewriter
drills. Thump is menu option 2 and is the only mode where the player controls Stickybear — so
its screen, its colours, and critically **its wrong-key behaviour** remain unverified. The
caution in §In this game stands: this page is still not a precedent for the One Rule.


## References

1. [Stickybear Typing (Optimum Resource, 1986, Apple II) — Internet Archive](https://archive.org/details/optimum-resource-stickybear-typing-a2-ph) — photographed retail copy; source of the three program descriptions (Keypress / Thump / Stories), the "Choose your own levels of difficulty" and "store your efforts on the disk" quotes, the box contents, and the 1986-label / 1985-title-screen / 1984-case date discrepancy. **[fetched]**
2. [Stickybear Typing (4am and san inc crack) — Internet Archive](https://archive.org/details/StickybearTyping4amCrack) — preservation record stating "1985 educational program by Richard Hefter and Susan Dubicki... distributed by Optimum Resource, Inc." **[fetched]**
3. [Internet Archive advanced-search results for `title:(stickybear typing)`](https://archive.org/advancedsearch.php?q=title%3A%28stickybear+typing%29&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=year&fl%5B%5D=description&rows=20&output=json) — corroborates the 1985 Optimum Resource attribution across multiple independent items, the rev. 2 "Hefter and Susan Dubicki" credit, the "Keypress, Thump, and Stories" listing, the 48K Apple II requirement, the 1988 800K re-release, and the 1997 CD-ROM school edition. **[fetched]**
4. [Stickybear — Wikipedia](https://en.wikipedia.org/wiki/Stickybear) — lists *Stickybear Typing* among the series' software titles and establishes the Optimum Resource / Weekly Reader Software publishing relationship. **[fetched]**
5. [Stickybear Typing boot video — Internet Archive](https://archive.org/details/A2Video_Stickybear_Typing) — MP4 downloaded (63.5 s), frames extracted at 1/6 fps and at 2 fps and viewed. Source of the blue on-screen keyboard, the next-key highlight including the spacebar, the `CHOOSE YOUR GAME` menu, `PLEASE TYPE YOUR NAME:`, `ENTER STARTING LEVEL(1-30)`, `TYPEWRITER MODE / WORD PROCESSOR MODE`, and the `j` → `jj jj` → `jj jj ff ff` opening drill. **[video frames viewed]**
6. [Stickybear Typing rev. 3 boot video — Internet Archive](https://archive.org/details/A2Video_Stickybear_Typing_rev_3) — second, independent recording (71 s); corroborates every screen above and adds the level-4 drill `jjff k`. **[video frames viewed]**
7. [Stickybear Typing (4am and san inc crack) — `00playable_screenshot.png`](https://archive.org/details/StickybearTyping4amCrack) — the 1985 title screen with the blue keyboard beneath it; also the source of the "Richard Hefter and Susan Dubicki / Optimum Resource, Inc. / Norfolk, Connecticut" title-screen credit. **[image viewed]**
