# Hacker Culture Reference
## Research behind the game's hidden layer and the underground history-card batch

*Compiled 2026-07-10/11 while designing the easter-egg system; extended 2026-07-27
with a second research pass grounding a new batch of history cards; consolidated
into one hub 2026-07-28 (Trevor: the two docs were redundant, since the
citation-bearing facts already live in the atomic `research/wiki/culture/*.md` pages
either way — this file was previously two separate hub docs, `research/hacker-culture.md`
and `research/hacker-underground-culture.md`, now merged). **Part 1** grounds the
in-game hidden easter-egg layer (catalog + design rules: `.claude/rules/easter-eggs.md`).
**Part 2** grounds a 2026-07-27 research pass for a new batch of history cards
(`js/history-cards.js`, not yet wired in as of this writing) covering 1970s–90s
underground computing/phreak culture. Two game features, one hacker-culture research
hub.*

The framing insight both parts share: the game's deepest theme is that typing unlocks
computing. Hacker culture is that theme's native folklore. Every reference below —
whether it became an easter egg (Part 1) or a proposed history card (Part 2) — rewards
the exact instinct the game exists to create — *poke at the machine and see what it
says back.* Opening the browser console is a child's (or parent's) first genuine
hacker act, which is why the console carries the only hints (Part 1's own design
rule). Part 2 extends the same instinct one era-window deeper into real underground
history, which needs the same editorial move for a 5–9-year-old audience: keep the
curiosity, soften or omit the crime.

### How to verify

Citations in Part 1 were added in the 2026-07-11 citation pass; Part 2's citations
were added in the 2026-07-27 research pass. Both follow the identical standard: every
URL below actually appeared in a live web search or was independently fetched and read
during its respective session — nothing is typed from memory or inferred. Source
quality, in preference order: (1) institutional/primary — museums (Smithsonian/NMAH,
Computer History Museum), standards bodies, official man pages, the primary work
itself (e.g. xkcd.com, Internet Archive artifacts, Phrack's own hosted archive); (2)
established journalism (Wired, IEEE Spectrum, Forbes, Mental Floss); (3) Wikipedia,
used as one of several references, never the sole source for a claim. Each reference
is marked **[fetched]** if its content was directly retrieved and read, or **(search
result only, not fetched)** if it appeared in search results but wasn't independently
loaded — treat the latter with slightly less confidence. No URL in this file was
invented; where a solid source couldn't be found, that's stated plainly instead of
papering over the gap. Part 2's atomic per-topic references live on each topic's own
`research/wiki/*.md` page (linked throughout Part 2) rather than being re-printed
there — Part 2 summarizes and cross-references rather than duplicating every citation
inline the way Part 1 does. Roughly half of Part 2's URLs were directly fetched.

---

## Part 1 — The Easter-Egg Hidden Layer

*Grounds `.claude/rules/easter-eggs.md` — the in-game hidden easter-egg catalog and
design rules. Compiled 2026-07-10/11 — what each reference IS, why it matters, and
why it earned a place (or didn't).*

### References used in the game

| Reference | Year | What it is | In-game use |
|---|---|---|---|
| [[wopr-wargames|WOPR / "Shall we play a game?"]] | 1983 | WarGames' NORAD computer; the film that taught a generation that terminals talk back | The original secret: `wopr`/`wargames`/`shallweplayagame` → level-select screen styled as the WOPR terminal ("GREETINGS PROFESSOR FALKEN") |
| [[xyzzy|XYZZY]] | 1976–77 | [[colossal-cave-adventure|Colossal Cave Adventure]]'s magic word; the canonical response elsewhere is "Nothing happens." | Title screen: typing it → `NOTHING HAPPENS.` — the joke IS the accuracy |
| [[warren-robinett|Warren Robinett]] / [[atari-adventure|Adventure]] | 1979 (hidden)/1980 (released) | The first widely-cited video game easter egg — Robinett hid his name in a secret room because Atari didn't credit developers. He wrote it in 1979, the same year our arcade is set; the game itself shipped March 1980 | `adventure` → `WARREN ROBINETT WAS HERE. 1979.` — correct, since it names the year he hid it, not the ship date. The most thematically perfect egg in the game |
| [[iddqd-doom|IDDQD]] | 1993 | Doom's god-mode cheat (distinct from IDKFA, the weapons/keys/ammo cheat) | Refused, on principle: `GOD MODE DENIED. THIS GAME NEVER TAKES LIVES.` — the no-punishment rule as a punchline |
| [[eliza|ELIZA]] | 1966 | Joseph Weizenbaum's early chatbot (MIT); Rogerian therapist script built from pattern-matching | `eliza` → `HOW DOES TYPING MAKE YOU FEEL?` Also whispers on the L20 terminal |
| [[konami-code|Konami Code]] | 1986 | ↑↑↓↓←→←→BA — Kazuhisa Hashimoto's test cheat for the NES port of Gradius; later famous for granting 30 lives in Contra (1988), not Gradius itself | 30 extra *stars* (we grant light, not lives) |
| [[phone-phreaking-2600hz|2600 Hz]] | ~1960s–70s | The phone-phreak tone (Captain Crunch whistle) that could seize AT&T long-distance trunk lines; namesake of 2600 Magazine. The Atari 2600 connection is folklore/wordplay, not documented history | Terminal whisper `> 2600 HZ` |
| [[mark-ii-moth-1947|The Mark II moth]] | 1947 | The literal first logged "bug" — a moth taped into the Harvard Mark II logbook: "First actual case of bug being found." Grace Hopper did not write the entry herself, but she was present on the team and spent decades popularizing the anecdote and the "debugging" term | Terminal whisper `> MOTH: 1947`; full story on the Level 13 history card; a hide-and-seek moth is proposed egg #1 |
| [[forty-two|42]] | 1978 (radio)/1979 (novel) | Deep Thought's Answer — from Douglas Adams' Hitchhiker's Guide to the Galaxy, first the 1978 BBC radio series, then the 1979 novel | Terminal whisper `> 42` |
| HELLO / binary | — | `01001000…` = HELLO in [[ascii|ASCII]] binary; bookends the game (Mystery Cabinet says it; Level 20 decodes it) | `hello` typed on the title → the Mystery Cabinet's own greeting echoed back; binary HTML comment decodes to SHALL WE PLAY |
| [[view-source-culture|View source / console culture]] | — | "Curious people read the page source" is a foundational piece of self-taught web/hacker culture — View Source and, later, the JS console are widely credited as the on-ramp for a generation of self-taught developers | Console banner (WOPR-styled, hints at title eggs); binary comment atop index.html |

#### References

**WOPR / WarGames**
1. [WarGames — Wikipedia](https://en.wikipedia.org/wiki/WarGames) — 1983 release, WOPR ("War Operation Plan Response"), and the film's role in prompting the first-ever presidential directive on computer security. **[fetched]**
2. [WarGames — Wikiquote](https://en.wikiquote.org/wiki/WarGames) — verbatim confirmation of "Shall we play a game?" and "Greetings, Professor Falken," both spoken by the WOPR/Joshua computer. **[fetched]**
3. [15 Surprising Facts About WarGames — Mental Floss](https://www.mentalfloss.com/article/545667/facts-about-wargames) — June 3, 1983 release date and the Reagan Camp David screening that led to NSDD-145. **[fetched]**

**XYZZY**
1. [Colossal Cave Adventure — Wikipedia](https://en.wikipedia.org/wiki/Colossal_Cave_Adventure) — Will Crowther's original c. 1975–76 version and Don Woods' 1977 expansion. **[fetched]**
2. [Xyzzy (computing) — Wikipedia](https://en.wikipedia.org/wiki/Xyzzy_(computing)) — dedicated article confirming XYZZY as Crowther's invented word, the canonical "Nothing happens" response, and its spread as an easter-egg convention into later software (Data General AOS, Windows Minesweeper, and more). **[fetched]**
3. [1976: Adventure — 50 Years of Text Games (Aaron A. Reed)](https://if50.substack.com/p/1976-adventure) — independent retrospective corroborating the 1976 origin / 1977 expansion timeline. **[fetched]**

Note: sources give the original game's creation date as "1975," "1975–76," or "c. 1976" depending on source; the file uses "1976–77" to reflect Crowther's original work through Woods' expansion, the most common framing.

**Warren Robinett / Adventure (Atari 2600)**
1. [Adventure (1980 video game) — Wikipedia](https://en.wikipedia.org/wiki/Adventure_(1980_video_game)) — confirms Robinett submitted the source code, with the hidden room, to Atari management in **June 1979**; the game itself released in **March 1980**. Confirms the hidden-room motivation: Atari stripped developer credit to stop competitors from poaching programmers and to deny them negotiating leverage. **[fetched]**
2. [The True Story Behind The Original Video Game 'Easter Egg' That Inspired 'Ready Player One' — Forbes](https://www.forbes.com/sites/sethporges/2017/12/20/the-true-story-behind-the-original-video-game-easter-egg-that-inspired-ready-player-one/) — Robinett's own account of Atari's no-credit, no-royalty policy despite the game's commercial success. **[fetched]**

**IDDQD / Doom**
1. [Doom cheat codes — DoomWiki.org](https://doomwiki.org/wiki/Doom_cheat_codes) — the community-canonical Doom reference; confirms IDDQD = god mode (invulnerability), explicitly distinct from IDKFA (full weapons/keys/ammo). **[fetched]**
2. [IDDQD — Know Your Meme](https://knowyourmeme.com/memes/iddqd) — corroborates god-mode meaning and Doom's December 1993 release. (search result only, not independently fetched)

**ELIZA**
1. [ELIZA — Wikipedia](https://en.wikipedia.org/wiki/ELIZA) — Joseph Weizenbaum (MIT), developed 1964–67 with 1966 as the landmark publication year; DOCTOR script "simulated a psychotherapist of the Rogerian school" via pattern matching. **[fetched]**
2. [Joseph Weizenbaum's original ELIZA paper (UMBC-hosted mirror)](https://www.csee.umbc.edu/courses/331/papers/eliza.html) — full text of the 1966 *Communications of the ACM* paper. (search result only, not independently fetched)
3. [ELIZA — a computer program for the study of natural language communication — ACM Digital Library](https://dl.acm.org/doi/10.1145/365153.365168) — primary bibliographic record: *Communications of the ACM*, Vol. 9, Issue 1, January 1966. (search result only; direct fetch returned HTTP 403/paywall, but the citation details are corroborated by the UMBC mirror above)

**Konami Code**
1. [Konami Code — Wikipedia](https://en.wikipedia.org/wiki/Konami_Code) — confirms first appearance in the **NES port of Gradius (1986)**, created by Kazuhisa Hashimoto as a testing aid because he found the arcade original too hard to test; meant to be removed before shipping but left in by accident. Confirms the "30 Lives"/"Contra Code" nickname comes specifically from **Contra (1988)**, a later, separate use of the same code — not Gradius. **[fetched]**
2. [The Origins of the Konami Code Revealed — Nintendo Life](https://www.nintendolife.com/news/2012/01/the_origins_of_the_konami_code_revealed) — carries a translated direct quote from Hashimoto describing why he added the code during the Gradius NES port. (search result only, not independently fetched)
3. [Kazuhisa Hashimoto — Wikipedia](https://en.wikipedia.org/wiki/Kazuhisa_Hashimoto) — corroborates creator identity and the Gradius/NES 1986 origin. (search result only, not independently fetched)

**2600 Hz**
1. [John Draper — Wikipedia](https://en.wikipedia.org/wiki/John_Draper) — confirms 2600 Hz as AT&T's idle-trunk signaling tone, the Cap'n Crunch cereal-box whistle that produced it, and that 2600: The Hacker Quarterly (founded 1984) is named after the tone. (search result only, not independently fetched)
2. [Cap'n Crunch Whistle and Secrets of the Little Blue Box — Telephone Museum](https://telephone-museum.org/telephone-collections/capn-crunch-bosun-whistle/) — independent corroboration of the whistle/tone/trunk-line mechanism. (search result only, not independently fetched)
3. [What Is 2600? — Computer Hope](https://www.computerhope.com/jargon/num/2600.htm) — explicitly hedges ("allegedly") on any connection between the tone and the Atari 2600's name, supporting the "wordplay, not documented fact" framing used in this file. (search result only, not independently fetched)

No source found in this pass documents an actual intentional link between the 2600 Hz tone and Atari's naming of the 2600 console — the file's phrasing has been kept hedged ("punningly") rather than stated as fact.

**The Mark II moth (often called "Grace Hopper's moth")**
1. [Log Book With Computer Bug — Smithsonian National Museum of American History](https://americanhistory.si.edu/collections/object/nmah_334663) — the institutional holder of the actual 1947 logbook page. Direct fetch attempts returned HTTP 403 (bot-blocked); its content is independently corroborated by the JSTOR Daily piece below, which quotes the museum's own catalog language. (search result only, content corroborated via #2)
2. [The Bug in the Computer Bug Story — JSTOR Daily](https://daily.jstor.org/the-bug-in-the-computer-bug-story/) — confirms the September 9, 1947 date, Harvard Mark II, and directly quotes the Smithsonian's own assessment that the logbook "was probably not Hopper's" — i.e., the museum itself does not credit her with physically taping in the moth or writing the caption. Confirms she helped popularize the anecdote and "debugging" terminology over her career, but did not originate the log entry. **[fetched]**
3. [September 9: First Instance of Actual Computer Bug Being Found — Computer History Museum](https://www.computerhistory.org/tdih/september/9/) — institutional corroboration of the date, the exact logbook wording, and notes Hopper was present on the Mark II team and later popularized the story; also notes "bug" as a term for technical faults predates 1947. **[fetched]**

See "Corrections from citation pass" below — the file's table entry has been reworded to reflect that Hopper is associated with popularizing, not authoring, the log entry.

**42 / The Hitchhiker's Guide to the Galaxy**
1. [The Hitchhiker's Guide to the Galaxy (radio series) — Wikipedia](https://en.wikipedia.org/wiki/The_Hitchhiker's_Guide_to_the_Galaxy_(radio_series)) — confirms first BBC Radio 4 broadcast March 8, 1978, and that the "42"/Deep Thought/Ultimate Question material originates here. **[fetched]**
2. [The Hitchhiker's Guide to the Galaxy (novel) — Wikipedia](https://en.wikipedia.org/wiki/The_Hitchhiker's_Guide_to_the_Galaxy_(novel)) — confirms novel publication October 12, 1979 (Pan Books, UK), adapted from the radio series. **[fetched]**
3. [For Math Fans: A Hitchhiker's Guide to the Number 42 — Scientific American](https://www.scientificamerican.com/article/for-math-fans-a-hitchhikers-guide-to-the-number-42/) — explicitly distinguishes the 1978 radio origin from the 1979 novel, and quotes Douglas Adams' own explanation for choosing 42 ("It was a joke... I chose that one"). **[fetched]**

**HELLO / binary (ASCII)**
1. [ASCII — Wikipedia](https://en.wikipedia.org/wiki/ASCII) — general reference for how binary maps to ASCII characters (the mechanism behind `01001000` = `H`, etc.). **[fetched — see also ASCII 1963 entry below]**

No dedicated historical source was found for "why HELLO specifically is a common teaching example" beyond the ASCII standard itself — that appears to be a self-evident pedagogical convention rather than a documented historical claim, so no further citation is asserted for it.

**View source / console culture**
1. [A History of Debugging on the Web — The History of the Web (Jay Hoffmann)](https://thehistoryoftheweb.com/checking-under-the-hood-of-code/) — directly supports the claim: "If not for that simple tool, many developers would have had no way to break into web development themselves... web developers were able to get their start simply by hopping from page to page and taking a look at the code directly." Also covers the JavaScript console (created by Brendan Eich) as a parallel foundational tool. **[fetched]** — *The History of the Web* is a well-regarded, citation-quality web-history project, also published as a book (*The History of the Web, Volume I*).

This single source substantially supports the claim as written; no second corroborating source was found despite targeted searches (Wired, Ars Technica, BBC, and MDN all came up empty on this specific angle), so it stands as the anchor citation rather than being padded with a weaker second reference.

### Riddle-bank reuse (2026-07-18)

Several references catalogued here (the [[mark-ii-moth-1947|Mark II moth]], [[forty-two|42]],
[[xyzzy|XYZZY]], the [[konami-code|Konami Code]], [[eliza|ELIZA]], [[hello-world|hello
world]], [[wopr-wargames|WOPR]], [[ascii|ASCII]], and rubber-duck debugging from
[[proposed-egg-references]]) were reused — cited, not re-derived — as the "tech/hacker
culture" flavor source for [[act6-riddle-bank|the Act 6 riddle bank]]
(`research/act6-riddle-bank.md`), which asks a riddle *about* each fact rather than
repeating this catalog's exact egg wording, so a player who's already found a
title-screen egg gets a satisfying "oh, I know this" rather than a duplicate.

### Researched, proposed, not yet built (menu in easter-eggs.md)

*Full menu synthesized at [[proposed-egg-references]].*

- **sudo** (Unix, + xkcd 149 "sudo make me a sandwich") → softened into kid empowerment:
  "PERMISSION GRANTED. YOU ALWAYS HAD IT."
- **The white rabbit** (The Matrix, 1999 — Command Center era-correct)
- **Rubber duck debugging** (popularized by The Pragmatic Programmer, 1999)
- **Dial-up modem handshake** (BBS era — Computer Wing door sound)
- **Y2K** (a monitor frozen at 12/31/99 23:59) — see [[y2k-bug]] for the sourced event
- **All your base are belong to us** ([[zero-wing|Zero Wing]] — 1989 Japanese arcade original; the
  mistranslated English version is from the 1991 European Mega Drive port, Basement era) →
  inverted: "ALL YOUR KEYS ARE BELONG TO YOU."
- **hello world** (popularized by K&R, 1978; the example itself traces to Kernighan's 1972
  Bell Labs "B" tutorial) — awaits the Level 25 free-type mode; see [[hello-world]] for the
  already-built history-card version of this same research
- **The eighth-key confession** — the semicolon's code meaning revealed at Level 20,
  as a programmer's rite: "MANY CODERS END AN INSTRUCTION WITH IT;" *(corrected 2026-10-31 from the
  false original, "PROGRAMMERS END EVERY LINE WITH IT;" — see [[semicolon]])*
- **Themed 404** ("LEVEL NOT FOUND. INSERT COIN TO CONTINUE.")
- **Hopper's moth** as a rare clickable on the select screen

#### References

**sudo / xkcd 149**
1. [xkcd: Sandwich](https://xkcd.com/149/) — the primary source; comic #149, "Sandwich," confirms the "sudo make me a sandwich" punchline verbatim. **[fetched]**
2. [149: Sandwich — explain xkcd](https://www.explainxkcd.com/wiki/index.php/149:_Sandwich) — annotation confirming publish date (Aug 28, 2006) and joke mechanics. **[fetched]**
3. [sudo(8) — Linux manual page](https://man7.org/linux/man-pages/man8/sudo.8.html) — official man page defining what `sudo` actually does (execute as superuser/another user per policy). **[fetched]**

**The white rabbit / The Matrix**
1. [The Matrix — Wikipedia](https://en.wikipedia.org/wiki/The_Matrix) — confirms US theatrical release, March 31, 1999. **[fetched]**
2. [The Matrix (1999) — Transcript, Matrix Fans](https://www.matrixfans.net/movies/the-matrix/transcript/) — confirms the literal on-screen computer message "Follow the white rabbit," sent to Neo early in the film. **[fetched]**

**Rubber duck debugging**
1. [Rubber duck debugging — Wikipedia](https://en.wikipedia.org/wiki/Rubber_duck_debugging) — confirms the name/anecdote (a researcher, Greg Pugh, who carried a literal rubber duck) is popularized by *The Pragmatic Programmer* (Hunt & Thomas, 1999) — the article frames the book as the source of the naming and anecdote, not proof the underlying practice (talking through a problem to an inanimate listener) was invented there. **[fetched]**
2. [The Art of Rubber Ducking — Scott Hanselman's Blog](https://www.hanselman.com/blog/the-art-of-rubber-ducking-or-rubber-duck-debugging) — notably does *not* confidently attribute the term to the book in its own text (only a reader comment speculates this), reinforcing that "popularized by," not "invented by," is the accurate framing. **[fetched]**

The file has been worded as "popularized by," matching what the sources actually support — see Corrections below.

**Dial-up modem handshake / BBS era**
1. [How A Dial-up Modem Handshake Works — Hackaday](https://hackaday.com/2013/01/31/how-a-dial-up-modem-handshake-works/) — explains the technical mechanism behind the screeching handshake sound (echo suppression disabling, tone/phase signaling). **[fetched]**
2. [The Bulletin Board System: Social Media's Dial-up Roots — IEEE Spectrum](https://spectrum.ieee.org/bulletin-board-system-bbs-history) — institutional/journalistic source confirming the first public dial-up BBS (CBBS, Chicago, 1978, Ward Christensen & Randy Suess) and BBS culture's role as a social-media precursor. **[fetched]**

**Y2K**
1. [Year 2000 problem — Wikipedia](https://en.wikipedia.org/wiki/Year_2000_problem) — confirms the two-digit-year storage cause and that the actual rollover was largely anticlimactic, with only scattered minor incidents. **[fetched]**
2. [Y2K bug — National Geographic Education](https://education.nationalgeographic.org/resource/Y2K-bug/) — corroborates the cause and the largely-averted outcome. **[fetched]**

**All your base are belong to us / Zero Wing**
1. [Zero Wing — Wikipedia](https://en.wikipedia.org/wiki/Zero_Wing) — confirms the arcade original released in Japan in **October 1989**, and the mistranslated Sega Mega Drive version released in Europe in **July 1991** (sourced to a contemporaneous *Computer and Video Games* magazine review, August 1991 issue — a stronger citation trail than the "1992" figure that circulates on some fan sites). **[fetched]**
2. [All your base are belong to us — Wikipedia](https://en.wikipedia.org/wiki/All_your_base_are_belong_to_us) — covers the mistranslation and the meme's viral spread starting around 2000–2001. **[fetched]**
3. [All Your Base Are Belong to Us — Know Your Meme](https://knowyourmeme.com/memes/all-your-base-are-belong-to-us) — meme-history timeline (circulated in gaming-quote compilations by 1998–99, went viral via SomethingAwful in Nov. 2000 and a Newgrounds Flash animation in Feb. 2001). (search result only, not independently fetched)
4. [ALL YOUR BASE ARE BELONG TO US (Newgrounds Version) — Internet Archive](https://archive.org/details/ayb_1_) — preserved copy of the actual viral Flash file, credited to Bad-CRC, dated February 16, 2001. (search result only, not independently fetched)

See Corrections below — the file previously said "Zero Wing 1991" without qualifying arcade vs. port; this has been clarified.

**hello world / K&R**
1. ["Hello, World!" program — Wikipedia](https://en.wikipedia.org/wiki/%22Hello,_World!%22_program) — confirms the earliest documented version appears in Brian Kernighan's 1972 internal Bell Labs tutorial "A Tutorial Introduction to the Language B," predating Kernighan & Ritchie's 1978 book *The C Programming Language* by six years — the 1978 book is the popularizer of the now-canonical example, not its origin. **[fetched]**

See Corrections below — the file's "K&R, 1978" line has been annotated to note the earlier 1972 origin.

**ASCII (1963)** *(referenced by the HELLO/binary entry above)*
1. [ASCII — Wikipedia](https://en.wikipedia.org/wiki/ASCII) — confirms first standardized as ASA X3.4-1963, published June 17, 1963, with revisions in 1967 and 1968. **[fetched]**
2. [The History of ASCII 1963 — ascii-code.com](https://www.ascii-code.com/articles/ASCII-1963) — corroborates the 1963 ANSI/ASA designation X3.4-1963. **[fetched]**

### Rejected categories (and why)

*Internal design judgment — no external citations applicable.*
- Anything requiring URLs/logins/networks — kids retype what they see
- "Haunted game" creepypasta tropes — wrong emotional register for this game
- References younger than the act they'd inhabit — breaks the era-authenticity rule
- Leetspeak identity jokes — dated in the wrong way, no history lesson inside

### Design rules distilled (enforced in easter-eggs.md)

*Internal design rules — the project's own law (CLAUDE.md), not external claims.*
1. Summoned by name only — never interrupts play
2. Kid-safe on discovery, parent-delightful on recognition
3. Era-authentic, ideally act-matched
4. Cheat codes for lives get refused — the no-punishment rule extends to eggs
5. The console is the only breadcrumb; deeper eggs stay unhinted

### Corrections from citation pass (Part 1 — easter-egg references)

Fact-checking during this citation pass surfaced several corrections to the original text:

1. **Warren Robinett / Adventure — release year clarified.** The original table listed only
   "1979." Robinett hid the easter egg and submitted the code to Atari management in June
   1979, but the game itself wasn't released until March 1980. The table now reads
   "1979 (hidden)/1980 (released)." The in-game egg text itself (`WARREN ROBINETT WAS HERE.
   1979.`) is still correct as-is, since it refers to the year he hid the message, not the
   ship date.

2. **Grace Hopper's moth — attribution softened.** The original entry credited the log
   entry to "Grace Hopper's moth." The Smithsonian's own catalog record states the logbook
   "was probably not Hopper's" — she was present on the Harvard Mark II team but is not
   documented as the person who taped in the moth or wrote the "First actual case of bug
   being found" caption. Her real, well-documented role is popularizing the anecdote and
   "debugging" terminology over decades of talks. The reference table entry has been
   reworded from "Grace Hopper's moth" to "The Mark II moth (often called 'Grace Hopper's
   moth')" to reflect this.

3. **Konami Code — verified as originally stated, no change needed.** The original text
   ("Kazuhisa Hashimoto's test cheat, left in Gradius; 30 lives in Contra") checks out
   exactly against Wikipedia and a translated Hashimoto interview (Nintendo Life) — the code
   was created for the 1986 NES port of Gradius as a testing aid, and the "30 lives"
   association is specifically from Contra (1988), a later, separate use of the same input
   sequence. Kept as-is.

4. **42 / Hitchhiker's Guide — dual date added.** The original said "1979" only. The concept
   of 42-as-the-answer actually originates in the 1978 BBC radio series; the novel followed
   in 1979. The table now reads "1978 (radio)/1979 (novel)."

5. **XYZZY — year range widened.** The original said "1976" flatly. Sources place Will
   Crowther's original version at "c. 1975–76" and Don Woods' well-known expansion
   (with the canonical "Nothing happens" wording) at 1977. Changed to "1976–77."

6. **Rubber duck debugging — "popularized by," not "originated by."** The proposed-eggs
   list previously said the technique was from "The Pragmatic Programmer, 1999" without
   qualification. Sources (including the book's own Wikipedia summary) support that the
   book popularized and named this specific rubber-duck anecdote, not that it invented the
   underlying practice of talking through a problem to an inanimate listener. Reworded to
   "popularized by."

7. **Zero Wing — arcade vs. port year disambiguated, and corrected from 1991 as originally
   written (which was actually right, but unqualified).** The original list entry said
   "Zero Wing 1991" with no context. The arcade original is Japanese, 1989; the mistranslated
   English text — the actual source of the meme — is from the European Sega Mega Drive port,
   which Wikipedia dates to July 1991 (backed by a contemporaneous magazine review, a
   stronger source than the "1992" figure that appears on some fan wikis). The entry now
   spells out both dates so "1991" isn't ambiguous between arcade and port.

8. **hello world / K&R — earlier origin noted.** The proposed-eggs entry credited "K&R, 1978"
   without qualification. The example is documented as originating in Kernighan's 1972
   internal Bell Labs tutorial for the "B" language, six years before K&R's *The C
   Programming Language* popularized it. Annotated accordingly.

9. **2600 Hz / Atari 2600 — no change to file text, but flagging that the "punningly"
   hedge is doing real work.** No source found during this pass documents an actual,
   intentional naming connection between the 2600 Hz phreaking tone and Atari's naming of
   the Atari 2600 console; one source (Computer Hope) explicitly frames it as "allegedly."
   The file already hedged this as a pun rather than asserting it as fact, so no wording
   change was needed — noting it here since it's the kind of claim that's easy to
   accidentally overstate.

### Claims not independently sourced (Part 1)

- **"Why HELLO specifically is a good binary-teaching example"** — the ASCII encoding
  mechanism itself is well-sourced (see ASCII references above), but no dedicated source was
  found for the specific pedagogical claim that "HELLO" is a canonical or especially
  meaningful choice beyond being a short, recognizable word. Treated as self-evident design
  choice, not a historical claim requiring citation.

---

## Part 2 — The 1970s–90s Underground (history-card batch)

*A second, deeper research pass (2026-07-27), commissioned for a new batch of
computing-history cards (the existing bank lives in `research/computing-history-moments.md`;
the card data model is `js/history-cards.js`). This part does NOT write final card
copy — it hands off verified facts, a kid-appropriateness note, and a suggested
moment word per topic for Trevor to build cards from. Atomic pages for every topic
substantial enough to stand alone live under `research/wiki/culture/`,
`research/wiki/people/`, and `research/wiki/moments/`, cross-linked both directions
per `research/WIKI.md`.*

Keystroke Kingdom's hidden hacker-culture layer already exists (`.claude/rules/easter-eggs.md`,
Part 1 above) around one insight: *typing unlocks computing, and the game's easter
eggs reward the exact instinct that created hacker culture in the first place — "poke
at the machine and see what it says back."* Every topic below is real underground
history from that same decade-plus window (roughly 1971–1999), and every one needs the
same editorial move for a 5–9-year-old audience: **keep the curiosity, soften or omit
the crime.** None of what follows should read as a how-to; several topics (Legion of
Doom/MOD, warez) involve activity that was, or became, illegal, and the notes below
flag exactly how much to soften and where.

### 1. Phrack

**Verified facts:** First issue distributed over a BBS on **November 17, 1985**,
founded by teenagers **Taran King** and **Knight Lightning** (real name **Craig
Neidorf**). Its articles are called "philes." In **February 1989** (issue 24), Phrack
published an internal BellSouth document about the Enhanced 911 system; a 1990
federal prosecution of Neidorf on ten felony counts collapsed at trial (charges
dropped **July 27, 1990**) after the Electronic Frontier Foundation showed the
document was worth about $13 commercially, not the ~$80,000 prosecutors claimed — a
case widely credited as a catalyst for EFF's founding. **Still published today**
(issue #72, a 40th-anniversary edition, in 2025, ~15,000 print copies distributed at
hacker conferences).

**Citations:** 4 (2 fetched: Wikipedia, phreak.fm) — full list on
[[phrack-magazine]].

**Kid-appropriateness note:** Very safe as "a homemade newsletter written by
teenagers who loved computers." The E911 prosecution should be softened to "one
story they published caused a big misunderstanding with a phone company — and it
helped grown-ups create fairer rules about computers" (the EFF-founding angle is
genuinely uplifting and true). Emphasize it's STILL published 40 years later.

**Suggested moment word:** `phrack` (p-h-r-a-c-k) — earliest spellable at **Level 13**
(gated by `c`).

### 2. Legion of Doom (LOD) & Masters of Deception (MOD)

**Verified facts:** LOD founded **May 1984** by "Lex Luthor" (named after Superman's
villain team) after he split from an earlier group, Knights of Shadow; invitation-only,
skill-based; published its own "Legion of Doom Technical Journals"; considered the
most capable hacking group in the world during its peak, 1984–1991. Its rivalry with
the New York-based **Masters of Deception** (formed late 1980s, name a deliberate dig
— "M" is one letter past "L") escalated into the so-called "**Great Hacker War**."
Both groups suffered real prosecutions: LOD members faced federal sentencing in
December 1990 (*US v. Grant, Darden and Riggs*); five MOD members were indicted in
1992 and all pleaded guilty in 1993 (probation or prison).

**Citations:** 3 for LOD, 2 for MOD (Wikipedia fetched for both) — full lists on
[[legion-of-doom]] and [[masters-of-deception]].

**Kid-appropriateness note:** Frame as two rival clubs of very curious teenagers
competing to understand the phone system best — like rival chess clubs — rather than
a crime story. It's fine and honest to note some members got in real legal trouble;
just don't dwell on specifics (toll fraud, credit fraud). This is a good pairing for
the game's own "curiosity vs. actually breaking things" distinction.

**Suggested moment words:** `lod` (earliest **Level 9**, gated by `o`) and `mod`
(earliest **Level 11**, gated by `m`) — could be a two-card rival pair if Trevor wants
that structure (matches the existing "several cards per level" pool model).

### 3. Trashing / Dumpster Diving

**Verified facts:** Phone phreaks and hackers called searching through phone-company
trash for discarded manuals "**garbology**" or "**trashing**," practiced from the
mid-1970s through the 1980s. Best-documented example: **Jerry Neil Schneider**, who in
the early 1970s found discarded Pacific Bell equipment-ordering manuals and used them
to fraudulently order real telephone gear (recounted in A.J. Weberman's 1980 book *My
Life in Garbology*). The specific term "dumpster diving" first appears in print in
1983 (OED).

**Citations:** 2 (Wikipedia fetched) — full list on [[trashing-dumpster-diving]].

**Kid-appropriateness note:** Frame as **detective work** — "looking at what a company
threw away to figure out how its machines worked" — never as a how-to, and note in
the card text (or its supporting design note) that this isn't something to actually
try today. The curiosity is the wholesome part; the trespassing/fraud outcome (in
Schneider's specific case) is not.

**Suggested moment word:** `trash` (t-r-a-s-h) — earliest spellable at **Level 8**
(gated by `t`).

### 4. War Dialing

**Verified facts:** Automatically dialing every phone number in a range to find
modems/computers/BBSes. Predates its name — phreaks called it "hammer dialing" or
"demon dialing" — but took the name "**war dialing**" after the **1983 film
*WarGames*** showed its hero's computer doing exactly this across Sunnyvale,
California. Commercial wardialing software for Commodore appeared by 1985; the
practice became common on BBSes through the 1980s–90s; some US states later passed
laws against automated dialing without intent to communicate.

**Citations:** 2 (Wikipedia fetched) — full list on [[wardialing]].

**Kid-appropriateness note:** Very safe and directly on-theme — "the computer wasn't
calling to talk to people, it was calling to find OTHER COMPUTERS to say hello to,"
which is exactly the game's existing "poke at the machine and see what it says back"
ethos, and connects directly to the same film the game already winks at via the
WOPR/`joshua` secret (`js/main.js` `SECRET_PHRASES`, `.claude/rules/easter-eggs.md`).

**Suggested moment word:** `dial` (d-i-a-l) — earliest spellable at **Level 6**
(gated by `i`), a nicely early one.

### 5. 2600: The Hacker Quarterly

**Verified facts:** Founded **January 1984** by **Eric Corley** (pen name **Emmanuel
Goldstein**, borrowed from Orwell's *1984*) and **David Ruderman** (who gave the
magazine its name and left after ~3 years); began as a three-sheet, 25-copy
newsletter, partly in response to Corley's own 1983 arrest (charges later dropped).
Named after the same 2600 Hz tone already documented in [[phone-phreaking-2600hz]].
**Still published quarterly today.**

**Citations:** 2 (Wikipedia fetched) — full list on [[2600-magazine]]. Builds on,
does not duplicate, the existing [[phone-phreaking-2600hz]] concept page.

**Kid-appropriateness note:** Very safe — "a magazine started by a guy who picked a
secret code name from a famous book, named after a musical note that could talk to
phones." The "still published 40+ years later" beat is a great durability hook for
kids.

**Suggested moment word:** `2600` — the digits are already unlocked at **Level 20**,
matching the EXISTING Level 20 terminal whisper `> 2600 HZ` (`js/themes/terminal.js`)
— this card would be a perfect companion explaining what that whisper already
references.

### 6. Captain Crunch / John Draper

**Verified facts:** Born **March 11, 1943**. Discovered — via fellow phreaker Denny
Teresi — that the free toy bosun's whistle in Cap'n Crunch cereal boxes produced
exactly the 2600 Hz tone needed to seize AT&T long-distance trunk lines for free.
Built "blue box" tone-generator devices; became a minor celebrity after a 1971 Esquire
article; connected with a young Steve Jobs and Steve Wozniak; wrote **EasyWriter
(1979)**, one of the first word processors for the Apple II, while in a work-release
program. Faced several prosecutions across the 1970s–80s, including federal prison
time.

**Citations:** 2 (Wikipedia fetched) — full list on new page [[john-draper]], which
expands the existing [[phone-phreaking-2600hz]] concept page (that page covers the
tone; this one covers the person).

**Kid-appropriateness note:** Soften the legal record heavily — "he got in real
trouble with the phone company for using his whistle trick, and eventually had to
stop" is plenty; skip conviction specifics. The fun hook: cereal-box whistle →
knowing young Steve Jobs → writing one of the first-ever word processors. Inventive
curiosity paying forward is the throughline.

**Suggested moment word:** `whistle` (w-h-i-s-t-l-e) — earliest spellable at **Level
9** (gated by `w`); evokes the story directly. (`draper` is also viable, earliest
Level 10, gated by `p`.)

### 7. CBBS — The First Bulletin Board System (1978)

**Verified facts:** **February 16, 1978** — Ward Christensen and Randy Suess bring
CBBS online in Chicago, the world's first public dial-up bulletin board system, built
during downtime forced by the Great Blizzard of 1978, which stranded them (both
members of CACHE, a Chicago computer-hobbyist club). Christensen wrote the software;
Suess assembled the S-100 hardware. Documented in a November 1978 *Byte* magazine
article. Chicago's mayor proclaimed February 16, 2003 "BBS Day" for the 25th
anniversary.

**Citations:** 2 (Wikipedia fetched) — full list on new dedicated fact node
[[cbbs-first-bbs-1978]], complementing (not duplicating) the existing
[[bbs-door-games]] and [[dialup-modem]] concept pages, which already state the
CBBS/1978 fact in passing but don't carry it as its own citation-first node.

**Kid-appropriateness note:** Fully kid-safe as-is — a genuinely charming "a huge
snowstorm gave two friends the free time to build something new" origin story.
Minimal softening needed; recommend leaning into the snow-day framing.

**Suggested moment word:** `bbs` (earliest **Level 12**, gated by `b`) or the more
evocative `snow` (earliest **Level 12**, gated by `n`), which ties the card straight
to its origin story.

### 8. The Hacker Manifesto ("The Conscience of a Hacker")

**Verified facts:** Written **January 8, 1986** by **Loyd Blankenship** ("The
Mentor," a Legion of Doom member) shortly after his own arrest; first published in
**Phrack, Volume 1, Issue 7, Phile 3**, later in 1986. Argues hackers are driven by
curiosity and a hunger to learn, not malice; written partly to counter the public
image of hackers shaped by *WarGames*. Became one of the most reprinted texts in
hacker culture — quoted in films, printed on merchandise, cited even in Edward
Snowden's memoir. *(Follow-up 2026-07-27: verbatim excerpts of this text — now the
basis for a Level 25 typing finale — were verified against Phrack's own hosted copy
and added to [[hacker-manifesto]] directly; see that page's "Verbatim excerpts"
section rather than duplicating the excerpts here.)*

**Citations:** 2 (Wikipedia fetched, phreak.fm fetched); [[hacker-manifesto]]'s own
page has grown to 6 references across both research passes — full list there.

**Kid-appropriateness note — the most delicate topic in this whole batch.** The
manifesto's own prose is teenage and melodramatic ("the crime is that of curiosity")
— nothing unsafe, but too dramatic to quote directly for a 5–9-year-old **history
card**. **Paraphrase the sentiment there, never quote the manifesto's actual dramatic
lines.** Something like: "a hacker once wrote a famous essay explaining that computer
explorers were curious, not bad — just people who loved learning how things work."
This maps directly onto the game's own stated ethos, which makes it one of the
richest cards in the batch if handled with a light touch. (The calculus is different
for the Level 25 typing finale, where verbatim IS the point — see
[[hacker-manifesto]]'s dedicated section for the difficulty-tier-gating
recommendation there.)

**Suggested moment word:** `mentor` (m-e-n-t-o-r) — earliest spellable at **Level 12**
(gated by `n`); ties directly to Blankenship's own handle.

### 9. Warez / the Software-Cracking Scene

**Verified facts:** "Warez" (from "wares," short for software) names the underground
subculture of trading commercial software with copy protection removed ("cracking,"
called "breaking" in the 1980s). Coalesced in the 1980s, most visibly around the
Commodore 64 in West Germany and the Netherlands from roughly 1983; organized through
BBSes and mailed floppy disks (reportedly reaching computer users behind the Iron
Curtain who otherwise had no access). Crackers attached small animated
self-promotional screens ("crack intros"/"cracktros") to their releases — a
visual-branding practice that is the direct ancestor of the **demoscene**, a digital
art movement broadly recognized as legitimate and distinct from the piracy that
spawned it.

**Citations:** 2 (Wikipedia fetched) — full list on [[warez-scene]].

**Kid-appropriateness note — flagging clearly rather than recommending a
straightforward card.** The core subject is organized copyright infringement; **do
not build a card that centers software piracy.** If this becomes a card at all, center
it *entirely* on the demoscene/cracktro art angle: "some computer fans in the 1980s
got so good at programming that they added colorful animated signatures to their
disks — a hobby that grew into a whole art form, the demoscene, people still make
today." That's well-documented, positive, and sidesteps the piracy question
completely. **Recommend Trevor make the final call on whether to build this one at
all** — it's the one topic in this batch I'd flag as genuinely optional.

**Suggested moment word (if used):** `demo` (d-e-m-o) — earliest spellable at **Level
11** (gated by `m`) — deliberately NOT "warez" itself.

### 10. Extra topics (well-sourced, kid-appropriate)

#### 10a. Cyberpunk (the word)

**Verified facts:** Coined by **Bruce Bethke**, who began writing a short story in
spring 1980 and combined "cyber-" (cybernetics) with "punk" (rebellious slang) for its
title; published in *Amazing Stories* magazine in **1983**. The term became a genre
label after William Gibson's *Neuromancer* (1984) popularized the aesthetic the
following year.

**Citations:** 2 (Wikipedia fetched) — full list on [[cyberpunk-etymology]].

**Kid-appropriateness note:** Totally safe — a fun word-building lesson, matching the
tone of the existing "software"/"artificial intelligence" etymology cards.

**Suggested moment word:** `cyberpunk` itself — earliest spellable at **Level 13**
(gated by `c`) — or the simpler `bethke`, earliest Level 12 (gated by `b`).

#### 10b. Acoustic Coupler

**Verified facts:** A rubber-cupped cradle that clamped around an ordinary telephone
handset, letting a computer "talk" to another computer over any phone line as audio
tones. Invented in the early-to-mid 1960s; significantly refined and patented by SRI
International in 1966, whose improvements included letting deaf users communicate by
teletype over ordinary phone lines. The bridge technology that let dial-up work
anywhere a phone existed, before direct-connect modems replaced it.

**Citations:** 2 — full list on [[acoustic-coupler]].

**Kid-appropriateness note:** Fully safe, very visual — "before computers plugged
straight into the wall, they whispered to each other through an actual phone handset
held in rubber cups." Ties naturally to the existing [[dialup-modem]] and
[[56k-modem]] cards.

**Suggested moment word:** `coupler` (c-o-u-p-l-e-r) — earliest spellable at **Level
13** (gated by `c`).

#### 10c. Steven Levy's *Hackers* (1984) and "the Hacker Ethic"

**Verified facts:** Steven Levy's 1984 book *Hackers: Heroes of the Computer
Revolution* is the foundational history of hacker culture (MIT's Tech Model Railroad
Club through home-computer hobbyists), most credited with naming/popularizing "the
hacker ethic": information should be open and accessible, and existing knowledge
should be used to build more. Same MIT railroad-club lineage as the existing `hack`
history card ([[hack-etymology]]).

**Citations:** 2 (Wikipedia fetched) — full list on [[hacker-ethic-steven-levy]].

**Kid-appropriateness note:** Completely safe, and a natural PAIR with the existing
Level 23 `hack` card — one card for where the word came from, one for why that kind
of curiosity is a good thing.

**Suggested moment word:** `levy` (l-e-v-y) — earliest spellable at **Level 11**
(gated by `v`).

#### 10d. The origin of "spam"

**Verified facts:** Traces to a Monty Python's Flying Circus sketch first broadcast
**December 15, 1970** — Vikings in a café drown out conversation chanting
"Spam, Spam, Spam..." Early online communities (MUDs, chat, Usenet) borrowed the
chant literally for someone flooding a channel with junk text; the word generalized
to unsolicited bulk email between roughly 1990–1994. Separately (and often
conflated): the very first mass unsolicited email predates the *name* by over a
decade — Gary Thuerk sent one to ~600 ARPANET addresses in 1978.

**Citations:** 3 (2 fetched: Wikipedia ×2) — full list on [[spam-etymology]].

**Kid-appropriateness note:** Completely safe and genuinely funny — canned meat,
singing Vikings, a silly word that stuck. Just keep the 1978 first-email-event and
the (much later) naming as two distinct beats in any final copy, not one date.

**Suggested moment word:** `spam` (s-p-a-m) — earliest spellable at **Level 11**
(gated by `m`).

### Corrections from citation pass (Part 2 — underground batch)

No prior game content on this topic existed to correct — this is new-ground research.
One internal correction made during this pass: the initial search-summary claim that
Taran King's real name is "Travis Campbell" comes from a single non-institutional
source (phreak.fm) corroborated only by an AI-search-summary snippet, not by any
primary/institutional record — flagged as unconfirmed on [[phrack-magazine]] and NOT
recommended for direct use in card copy (unlike Knight Lightning/Craig Neidorf, whose
identity is independently documented via his own federal prosecution and a dedicated
Wikipedia article).

### Unsourceable / weakly-sourced items (Part 2)

- **Taran King's real name** ("Travis Campbell") — one weak source only; see above.
- **Bruce Bethke / historyofinformation.com page** — returned no readable body text on
  fetch attempt; the claim itself is still solidly sourced via the Cyberpunk (short
  story) Wikipedia article, so this URL is listed on [[cyberpunk-etymology]] only as
  an index pointer, not relied on for any fact.
- **The Hacker Manifesto's exact 1986 publication month** — sources disagree slightly
  (mid-1986 vs. a specific September 1986 date); the January 8, 1986 *writing* date is
  consistent and is what's used across all copy.

### Downstream flags (Part 2)

None yet — no card copy has been written from this research (per the original brief,
this part hands off facts only). When cards are built from this batch,
`js/history-cards.js` will need new entries; flag the **Hacker Manifesto** and
**Warez/cracking scene** entries for a second editorial look given the framing notes
above before they ship to players. *(Update 2026-07-27: the Hacker Manifesto entry
has since grown a second, more consequential downstream flag of its own — verbatim
excerpts destined for a hard-coded Level 25 typing finale, difficulty-tier-gating
recommendation included — see [[hacker-manifesto]].)*

### Summary table (Part 2)

| # | Topic | Wiki page(s) | Cites | Moment word | Earliest level |
|---|---|---|---|---|---|
| 1 | Phrack | [[phrack-magazine]] | 4 | `phrack` | 13 |
| 2 | Legion of Doom | [[legion-of-doom]] | 3 | `lod` | 9 |
| 2 | Masters of Deception | [[masters-of-deception]] | 2 | `mod` | 11 |
| 3 | Trashing / dumpster diving | [[trashing-dumpster-diving]] | 2 | `trash` | 8 |
| 4 | War dialing | [[wardialing]] | 2 | `dial` | 6 |
| 5 | 2600 magazine | [[2600-magazine]] | 2 | `2600` | 20 |
| 6 | Captain Crunch / John Draper | [[john-draper]] | 2 | `whistle` | 9 |
| 7 | CBBS / first BBS (1978) | [[cbbs-first-bbs-1978]] | 2 | `bbs` / `snow` | 12 |
| 8 | Hacker Manifesto | [[hacker-manifesto]] | 6 (grew from 2) | `mentor` | 12 |
| 9 | Warez / cracking scene | [[warez-scene]] | 2 | `demo` (not "warez") | 11 |
| 10a | Cyberpunk etymology | [[cyberpunk-etymology]] | 2 | `cyberpunk` | 13 |
| 10b | Acoustic coupler | [[acoustic-coupler]] | 2 | `coupler` | 13 |
| 10c | Levy's *Hackers* / Hacker Ethic | [[hacker-ethic-steven-levy]] | 2 | `levy` | 11 |
| 10d | Spam etymology | [[spam-etymology]] | 3 | `spam` | 11 |

Related docs: Part 1 above (the easter-egg layer this batch's framing insight
extends), [[phone-phreaking-2600hz]] (the 2600 Hz tone itself), [[bbs-door-games]],
[[dialup-modem]], [[hack-etymology]], `.claude/rules/easter-eggs.md`,
`js/history-cards.js`, `research/computing-history-moments.md`.
