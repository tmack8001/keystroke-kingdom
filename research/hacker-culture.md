# Hacker Culture Reference
## Research behind the game's hidden layer

*Compiled 2026-07-10/11 while designing the easter-egg system. The in-game catalog and
design rules live in `.claude/rules/easter-eggs.md`; this file is the background research —
what each reference IS, why it matters, and why it earned a place (or didn't).*

The framing insight: the game's deepest theme is that typing unlocks computing. Hacker
culture is that theme's native folklore. Every egg rewards the exact instinct the game
exists to create — *poke at the machine and see what it says back.* Opening the browser
console is a child's (or parent's) first genuine hacker act, which is why the console
carries the only hints.

### How to verify

Citations added in this pass (2026-07-11) follow this standard: every URL below actually
appeared in a live web search or was independently fetched and read during the citation
pass — nothing is typed from memory or inferred. Source quality, in preference order:
(1) institutional/primary — museums (Smithsonian/NMAH, Computer History Museum), standards
bodies, official man pages, the primary work itself (e.g. xkcd.com, Internet Archive
artifacts); (2) established journalism (Wired, IEEE Spectrum, Forbes, Mental Floss);
(3) Wikipedia, used as one of several references, never the sole source for a claim.
Each reference below is marked **[fetched]** if its content was directly retrieved and
read this session, or **(search result only, not fetched)** if it appeared in search
results but wasn't independently loaded — treat the latter with slightly less confidence.
No URL in this file was invented; where a solid source couldn't be found, that's stated
plainly instead of papering over the gap.

---

## References used in the game

| Reference | Year | What it is | In-game use |
|---|---|---|---|
| WOPR / "Shall we play a game?" | 1983 | WarGames' NORAD computer; the film that taught a generation that terminals talk back | The original secret: `wopr`/`wargames`/`shallweplayagame` → level-select screen styled as the WOPR terminal ("GREETINGS PROFESSOR FALKEN") |
| XYZZY | 1976–77 | Colossal Cave Adventure's magic word; the canonical response elsewhere is "Nothing happens." | Title screen: typing it → `NOTHING HAPPENS.` — the joke IS the accuracy |
| Warren Robinett / Adventure | 1979 (hidden)/1980 (released) | The first widely-cited video game easter egg — Robinett hid his name in a secret room because Atari didn't credit developers. He wrote it in 1979, the same year our arcade is set; the game itself shipped March 1980 | `adventure` → `WARREN ROBINETT WAS HERE. 1979.` — correct, since it names the year he hid it, not the ship date. The most thematically perfect egg in the game |
| IDDQD | 1993 | Doom's god-mode cheat (distinct from IDKFA, the weapons/keys/ammo cheat) | Refused, on principle: `GOD MODE DENIED. THIS GAME NEVER TAKES LIVES.` — the no-punishment rule as a punchline |
| ELIZA | 1966 | Joseph Weizenbaum's early chatbot (MIT); Rogerian therapist script built from pattern-matching | `eliza` → `HOW DOES TYPING MAKE YOU FEEL?` Also whispers on the L20 terminal |
| Konami Code | 1986 | ↑↑↓↓←→←→BA — Kazuhisa Hashimoto's test cheat for the NES port of Gradius; later famous for granting 30 lives in Contra (1988), not Gradius itself | 30 extra *stars* (we grant light, not lives) |
| 2600 Hz | ~1960s–70s | The phone-phreak tone (Captain Crunch whistle) that could seize AT&T long-distance trunk lines; namesake of 2600 Magazine. The Atari 2600 connection is folklore/wordplay, not documented history | Terminal whisper `> 2600 HZ` |
| The Mark II moth | 1947 | The literal first logged "bug" — a moth taped into the Harvard Mark II logbook: "First actual case of bug being found." Grace Hopper did not write the entry herself, but she was present on the team and spent decades popularizing the anecdote and the "debugging" term | Terminal whisper `> MOTH: 1947`; full story on the Level 13 history card; a hide-and-seek moth is proposed egg #1 |
| 42 | 1978 (radio)/1979 (novel) | Deep Thought's Answer — from Douglas Adams' Hitchhiker's Guide to the Galaxy, first the 1978 BBC radio series, then the 1979 novel | Terminal whisper `> 42` |
| HELLO / binary | — | `01001000…` = HELLO in ASCII binary; bookends the game (Mystery Cabinet says it; Level 20 decodes it) | `hello` typed on the title → the Mystery Cabinet's own greeting echoed back; binary HTML comment decodes to SHALL WE PLAY |
| View source / console culture | — | "Curious people read the page source" is a foundational piece of self-taught web/hacker culture — View Source and, later, the JS console are widely credited as the on-ramp for a generation of self-taught developers | Console banner (WOPR-styled, hints at title eggs); binary comment atop index.html |

### References

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

---

## Researched, proposed, not yet built (menu in easter-eggs.md)

- **sudo** (Unix, + xkcd 149 "sudo make me a sandwich") → softened into kid empowerment:
  "PERMISSION GRANTED. YOU ALWAYS HAD IT."
- **The white rabbit** (The Matrix, 1999 — Command Center era-correct)
- **Rubber duck debugging** (popularized by The Pragmatic Programmer, 1999)
- **Dial-up modem handshake** (BBS era — Computer Wing door sound)
- **Y2K** (a monitor frozen at 12/31/99 23:59)
- **All your base are belong to us** (Zero Wing — 1989 Japanese arcade original; the
  mistranslated English version is from the 1991 European Mega Drive port, Basement era) →
  inverted: "ALL YOUR KEYS ARE BELONG TO YOU."
- **hello world** (popularized by K&R, 1978; the example itself traces to Kernighan's 1972
  Bell Labs "B" tutorial) — awaits the Level 25 free-type mode
- **The eighth-key confession** — the semicolon's identity revealed only after Level 20,
  as a programmer's rite: "PROGRAMMERS END EVERY LINE WITH IT;"
- **Themed 404** ("LEVEL NOT FOUND. INSERT COIN TO CONTINUE.")
- **Hopper's moth** as a rare clickable on the select screen

### References

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

## Rejected categories (and why)
- Anything requiring URLs/logins/networks — kids retype what they see
- "Haunted game" creepypasta tropes — wrong emotional register for this game
- References younger than the act they'd inhabit — breaks the era-authenticity rule
- Leetspeak identity jokes — dated in the wrong way, no history lesson inside

## Design rules distilled (enforced in easter-eggs.md)
1. Summoned by name only — never interrupts play
2. Kid-safe on discovery, parent-delightful on recognition
3. Era-authentic, ideally act-matched
4. Cheat codes for lives get refused — the no-punishment rule extends to eggs
5. The console is the only breadcrumb; deeper eggs stay unhinted

---

## Corrections from citation pass

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

## Claims not independently sourced

- **"Why HELLO specifically is a good binary-teaching example"** — the ASCII encoding
  mechanism itself is well-sourced (see ASCII references above), but no dedicated source was
  found for the specific pedagogical claim that "HELLO" is a canonical or especially
  meaningful choice beyond being a short, recognizable word. Treated as self-evident design
  choice, not a historical claim requiring citation.
