# Computing History Moments
## Research behind the 17 history cards

*Compiled 2026-07-11 for the "picked up off the arcade floor" feature. Implementation:
`js/history-cards.js`; mechanics in `.claude/rules/*` and docs/ROADMAP.md (album pending).
This file records the research: the moment, why it matters, and the typeability constraint
that assigned it to its level.*

*Citation pass added 2026-07-11: every claim below was independently re-verified via live
web search and, for at least a third of sources, a direct page fetch. Preference order used:
primary/institutional sources (museums, standards bodies, the universities/labs that built
the thing) first, established journalism second, Wikipedia at most as one of several sources
and never alone. See "Corrections from citation pass" for the one player-facing text change
this pass surfaced.*

**The core constraint that shaped everything:** each card's word must be typeable using
ONLY the keys unlocked at its level. This turned out to be a design gift — the curriculum
itself decides when history becomes speakable, and some assignments landed poetically.

| Lvl | Word | Moment | Why this level (typeability + poetry) |
|---|---|---|---|
| 4 | `ada` | [[ada-lovelace|Ada Lovelace]] writes the first program (1843), a century before hardware | The FIRST real-word level completion (home row done) can spell the FIRST programmer |
| 5 | `hal` | [[hal-9000|HAL 9000]], *2001: A Space Odyssey* (1968) | g/h just unlocked; the most famous fictional computer arrives with the reach keys |
| 8 | `hedy` | [[hedy-lamarr|Hedy Lamarr]] patents frequency hopping (1942) → ancestor of Wi-Fi/Bluetooth | Needs y (L8). A movie star inventing wireless — the "inventors come from anywhere" card, chosen deliberately for a daughter learning tech |
| 9 | `www` | Tim Berners-Lee's [[world-wide-web|World Wide Web]] (1989), given away free | w unlocks at 9; three of the same brand-new letter |
| 10 | `floppy` | The [[floppy-disk]] (IBM, 1971) | p unlocks at 10 |
| 11 | `mouse` | [[engelbart-mouse|Engelbart's wooden mouse]] + the Mother of All Demos (1968) | m unlocks at 11 |
| 12 | `turing` | [[alan-turing|Alan Turing]] — Bombe codebreaking; "Computing Machinery and Intelligence" (1950) | n unlocks at 12 (kid-safe framing: codes + "can machines think?") |
| 13 | `grace` | [[grace-hopper|Grace Hopper]]'s team tapes the first actual bug — a moth — into the log ([[mark-ii-moth-1947|1947-09-09]]) | c unlocks at 13; pairs with the level's "pause and read" Myst mood |
| 14 | `pixel` | "[[the-pixel|Pixel]]" first published (Billingsley, JPL, 1965) | x unlocks at 14; meta-card — the kid has been reading pixels all game |
| 15 | `eliza` | [[eliza|ELIZA]], the first chatbot (1966) | z unlocks at 15 — the alphabet's last letter releases the first machine you could talk to |
| 17 | `c64` | [[commodore-64|Commodore 64]] (1982) — best-selling computer ever | 4 unlocks at 17 |
| 18 | `386` | [[intel-386|Intel 80386]] (1985) — 32-bit era begins | 3 and 8 ARE level 18's new keys |
| 19 | `y2k` | The [[y2k-bug|Y2K remediation]] (1999) — "the world checked its math," and the fixes worked | 2 unlocks at 19; framed as a triumph of care, not a scare |
| 20 | `1969` | [[arpanet-first-message-1969|ARPANET's first message]]: LOGIN crashed after two letters — the internet's first word was "LO" (1969-10-29) | 1 and 9 complete the digits; THE typing story of all typing stories |
| 22 | `\o/` | [[ascii|ASCII]] standardized (1963) — drawing with characters | \ unlocks at 22; the cheering text-person is already in the level's pool |
| 24 | `Eniac` | [[eniac|ENIAC]] (1946), programmed by six women mathematicians | Shift unlocks at 24 — the first capital-letter card |
| 25 | `hello world` | K&R's first program ([[hello-world|1978 tradition]]) | Space unlocks at 25; the game's final card is every programmer's first sentence |

**Levels without cards** (1-3, 6, 7, 16, 21, 23): either too few letters for a worthy word
or no strong era fit. Deliberate — "not every floor tile hides one; that's what makes
finding them special."

## Fact-checking notes (original pass)
- Hopper didn't find the moth personally (her team did); card says "Grace Hopper's team." ✓
- "First programmer" for Lovelace is the standard framing (Note G, Analytical Engine). ✓
- ENIAC's six: Bartik, Holberton, Teitelbaum, Meltzer, Bilas, Lichterman — card says
  "six women mathematicians" without naming (space constraints). ✓
- ARPANET: UCLA→SRI, Kleinrock's lab, crashed mid-LOGIN. "LO" story is well-documented. ✓
- `hello world` traces to Kernighan's 1972 B tutorial; popularized by K&R 1978 — card
  uses 1978. ✓
- Pixel: term traceable to 1965 JPL usage (Fred Billingsley). ✓

**Note (2026-07-11 pass):** two of the six bullets above needed correction after
independent re-verification — see "Corrections from citation pass" below. The ENIAC
"six names" list actually contains a duplicate (Teitelbaum and Lichterman are the same
woman, maiden/married name), silently dropping Kay McNulty. And "Hopper's team" turns
out to undersell the actual finding: Hopper is documented as not personally taping the
moth into the log, and the Smithsonian's own object record calls the logbook itself
"probably not Hopper's" — the original note was directionally right but the in-game card
text goes further than the sources support (see below).

---

## References by moment

Sources are listed in preference order (institutional/primary → journalism → Wikipedia as
one-of-several). Every URL below was returned by a live search or directly fetched during
the 2026-07-11 citation pass — none were hand-typed from memory.

### Level 4 — Ada Lovelace (1843)
Card claim: *"Ada Lovelace wrote the very first computer program — more than 100 years
before computers existed."*

1. [Ada Lovelace | Babbage Engine | Computer History Museum](https://www.computerhistory.org/babbage/adalovelace/) — institutional; states Ada is "often referred to as 'the first programmer'" and dates her published algorithm (Note G, Bernoulli numbers) to 1843. Supports "first programmer" framing + 1843 date. *(fetched)*
2. [Ada Lovelace | Biography, Computer, Day, & Facts | Britannica](https://www.britannica.com/biography/Ada-Lovelace) — corroborates the 1843 notes and her place in computing history.
3. [What Did Ada Lovelace's Program Actually Do? — Two-Bit History](https://twobithistory.org/2018/08/18/ada-lovelace-note-g.html) — engages the "is she really first" academic debate directly and concludes the "first programmer" title is fair even though strict priority is contested. *(fetched)*

**Verdict:** accurate, standard framing used by the primary institutional source (CHM) itself. There is genuine, mild academic debate about strict priority (Babbage wrote earlier unpublished snippets), but it doesn't rise to a correction — CHM uses the same claim. No change needed.

### Level 5 — HAL 9000 (1968)
Card claim: *"The most famous movie computer ever. HAL could talk, play chess, and read lips."*

1. [HAL 9000 — Wikipedia](https://en.wikipedia.org/wiki/HAL_9000) — confirms 1968 film debut, the in-film chess game against Frank Poole, and the lip-reading plot point. *(fetched; used as one of several, not alone)*
2. [2001: A Space Odyssey — Wikipedia](https://en.wikipedia.org/wiki/2001:_A_Space_Odyssey) — confirms 1968 release, Kubrick/Clarke authorship.
3. [2001: A Chess Space Odyssey — Chess.com](https://www.chess.com/article/view/2001-a-chess-space-odyssey) — confirms the on-screen HAL/Poole chess game is a real historical game (Roesch–Schlage, Hamburg 1910) re-enacted for the film.
4. [Happy 25th Birthday, HAL! — MIT Press](https://mitpress.mit.edu/happy-25th-birthday-hal/) — institutional publisher corroboration of the 1968 release and HAL's cultural status.

**Verdict:** accurate, no correction needed. Year and both capability claims (chess, lip-reading) confirmed.

### Level 8 — Hedy Lamarr (1942)
Card claim: *"Movie star Hedy Lamarr invented frequency hopping — the trick that helps Wi-Fi work today."*

1. [Hedy Lamarr | National Inventors Hall of Fame](https://www.invent.org/inductees/hedy-lamarr) — institutional; confirms the 1942 "Secret Communication System" patent (US 2,292,387, filed as Hedy Kiesler Markey) and its original torpedo-jamming purpose. *(fetched)*
2. [IEEE SA — Actress/Inventor Hedy Lamarr and How Far Wireless Communication Has Come](https://standards.ieee.org/beyond-standards/hedy-lamarr/) — institutional (IEEE); explicitly ties her work to "modern wireless communication technologies, including Wi-Fi and Bluetooth," framed as inspiration for the 802.11 standard rather than a direct technical lineage. *(fetched)*
3. [Random Paths to Frequency Hopping — American Scientist](https://www.americanscientist.org/article/random-paths-to-frequency-hopping) — establishes the more nuanced, indirect technical lineage from her patent to modern spread-spectrum tech.
4. [Actress Hedy Lamarr Patents Basis for WiFi — Jewish Women's Archive](https://jwa.org/thisweek/aug/11/1942/actress-hedy-lamarr-patents-basis-for-wifi) — confirms August 1942 patent grant date.

**Verdict:** accurate as an institutional-style simplification — IEEE's own outreach page uses the same "helped inspire Wi-Fi/Bluetooth" framing. The connection is indirect (her specific patent expired unused in 1959; modern Wi-Fi uses different spread-spectrum schemes), but that's exactly the level of simplification IEEE itself uses for public audiences. No change needed.

### Level 9 — World Wide Web (1989)
Card claim: *"Tim Berners-Lee invented the World Wide Web and gave it away for free — to everyone, forever."*

1. [A short history of the Web — CERN](https://home.cern/science/computing/birth-web/short-history-web) — primary institutional source; confirms March 1989 proposal and the April 30, 1993 decision to make WWW source code available royalty-free. *(fetched)*
2. [30 years of a free and open Web — CERN](https://home.cern/computing/30-years-free-and-open-web) — primary institutional source directly supporting "gave it away for free": "CERN relinquishes all intellectual property rights to this code... permission is granted for anyone to use, duplicate, modify and redistribute it." *(fetched)*
3. [The original proposal of the WWW, HTMLized — W3C](https://www.w3.org/History/1989/proposal.html) — the actual original 1989 proposal document, hosted by W3C; also shows the project was initially called "Mesh." *(fetched)*
4. [CERN puts the World Wide Web in the public domain — CERN Timeline](https://timeline.web.cern.ch/cern-puts-world-wide-web-public-domain) — CERN's own timeline entry for the 1993 public-domain release.

**Verdict:** accurate but compresses two dates into one year. 1989 is correct for Berners-Lee's *written proposal* (then called "Mesh," nothing built yet); the first working browser/server came in late 1990; the "gave it away for free" act specifically happened April 1993. CERN's own materials headline 1989 as the invention date, so the card's choice is defensible, but the "gave it away for free" clause technically describes a 1993 event folded into the 1989 card. No change required — this is a reasonable simplification for a children's card, flagged here for completeness.

### Level 10 — Floppy disk (1971)
Card claim: *"Before clouds, files lived on bendy plastic squares. One floppy held less than a single photo does today."*

1. [1971: Floppy disk loads mainframe computer data — Computer History Museum, The Storage Engine](https://www.computerhistory.org/storageengine/floppy-disk-loads-mainframe-computer-data/) — institutional; confirms 1971 shipment, 80KB capacity, development under Alan Shugart with David L. Noble as lead engineer and Warren L. Dalziel as lead drive inventor.
2. [Floppy disk storage — IBM](https://www.ibm.com/history/floppy-disk) — primary corporate-history source, IBM's own account.
3. [Floppy Disks — Computer History Museum, Revolution exhibit](https://www.computerhistory.org/revolution/memory-storage/8/261) — corroborates the 80KB figure and a 1967–1971 development timeline.

**Verdict:** accurate. 1971 is correctly the shipping/commercial-introduction year (development began 1967). The 80KB-vs-modern-photo comparison holds up easily (modern phone photos commonly run 2–10MB, a 25–125x difference). No change needed.

### Level 11 — Engelbart's mouse (1968)
Card claim: *"Douglas Engelbart carved the first computer mouse from wood and showed it in 'the Mother of All Demos.'"*

1. [SRI Mouse — Computer History Museum](https://computerhistory.org/sri-mouse-mn052024/) — institutional; confirms Bill English built the first mouse from a 1964 Engelbart design, crafted from redwood by the SRI machine shop, and that it was shown at the December 1968 "Mother of All Demos."
2. [The computer mouse and interactive computing — SRI International](https://www.sri.com/hoi/computer-mouse-and-interactive-computing/) — primary institutional source (SRI is the lab where it was built).
3. [The Mother of All Demos — Smithsonian Lemelson Center](https://invention.si.edu/invention-stories/mother-all-demos) — confirms December 9, 1968, Brooks Hall, San Francisco.
4. [Milestones: Public Demonstration of Online Systems and Personal Computing, 1968 — ETHW (IEEE)](https://ethw.org/Milestones:Public_Demonstration_of_Online_Systems_and_Personal_Computing,_1968) — IEEE Milestone citation, institutional confirmation of date/location/significance.

**Verdict:** accurate as literally written — the card says Engelbart "showed it" at the 1968 demo (true), not that he built it in 1968. Sources consistently date the wooden prototype's design/build to 1964 (Engelbart conceived it, Bill English physically built it), while 1968 is correctly the famous public demo. The card doesn't name Bill English, which is a common simplification (CHM itself sometimes shorthands to "Engelbart's mouse"), not an error. No change needed; noting the 1964-vs-1968 nuance here for completeness.

### Level 12 — Alan Turing (card year: 1950)
Card claim: *"Alan Turing cracked secret codes and asked the big question: can a machine think?"*

1. [6 facts about the Bombe — Bletchley Park](https://www.bletchleypark.org.uk/our-story/6-facts-about-the-bombe/) — primary institutional source; confirms Turing as principal designer of the Bombe for breaking Naval Enigma.
2. [The Turing-Welchman Bombe — The National Museum of Computing](https://www.tnmoc.org/bombe) — institutional (TNMOC, located at Bletchley Park), corroborates Turing's role and the 1939–1940 Bombe timeline.
3. ["Computing Machinery and Intelligence" (1950) — Oxford Academic, *The Essential Turing*](https://academic.oup.com/book/42030/chapter/355746326/) — confirms the 1950 paper in *Mind* (vol. LIX, issue 236) proposing the "can machines think?" question and the Turing Test.
4. [Computing Machinery and Intelligence — Wikipedia](https://en.wikipedia.org/wiki/Computing_Machinery_and_Intelligence) — used as one of several sources, corroborates publication details.

**Verdict:** accurate but spans two eras compressed into one year field. Codebreaking dates to 1939–1945 (Bletchley Park); "can machines think?" is specifically the 1950 *Mind* paper. The card's single year (1950) technically anchors only the second half of the sentence. This is a defensible choice — 1950 is the more precisely citable date, and CS-history writing often treats it as Turing's headline "computer science begins here" moment — but it's worth knowing internally that "cracked secret codes" describes an earlier decade. No change needed to the card.

### Level 13 — Grace Hopper's moth (1947) — **correction needed**
Card claim: *"Grace Hopper's team found a real moth stuck inside their computer — the first computer 'bug.' She taped it into the logbook."*

1. [Log Book With Computer Bug — Smithsonian National Museum of American History](https://americanhistory.si.edu/collections/object/nmah_334663) — the institution holding the actual logbook; its own description states the logbook "was probably not Hopper's."
2. [The Bug in the Computer Bug Story — JSTOR Daily](https://daily.jstor.org/the-bug-in-the-computer-bug-story/) — cites the Smithsonian object record and the 1981 *Annals of the History of Computing*; states Hopper "did not personally find the moth. She said so herself, repeatedly, in later interviews," and that her role was retelling the story for decades, not discovering or logging it.
3. [Silicon Canals retrospective on the Sept 9, 1947 Harvard Mark II moth](https://siliconcanals.com/sc-h-on-september-9-1947-a-harvard-technician-named-grace-hopper-pulled-a-moth-out-of-the-mark-ii-computers-relay-panel-taped-it-into-the-logbook-and-wrote-first-actual-case-of-bug-being-found-coining/) — corroborates: a technician on Harvard's Mark II team taped the moth in; "Grace Hopper didn't find it, didn't write it, and didn't coin the term, but she told the story so well for 45 years that it became hers."
4. [September 9: First Instance of Actual Computer Bug Being Found — Computer History Museum, This Day in History](https://www.computerhistory.org/tdih/september/9/) — softer institutional framing: Hopper "was present and made the incident famous later on in her many public lectures." Does not claim she personally logged it, but doesn't emphasize the correction either — included for balance.

**Verdict: needs correction.** Date (September 9, 1947) and computer (Harvard Mark II) are correct. But the Smithsonian's own object record for the actual logbook says it "was probably not Hopper's," and Hopper herself repeatedly said in later interviews that she did not personally find or log the moth — a technician on her team did. The in-game card's second sentence, "She taped it into the logbook," is not supported by the primary institutional source and should be corrected. See "Corrections from citation pass" below for the specific text change needed in `js/history-cards.js` (not made here, per instructions — flagged for a human/separate change).

### Level 14 — The pixel (1965)
Card claim: *"Everything on this screen is made of tiny squares of light called pixels."*

1. [A Brief History of "Pixel" — Richard F. Lyon, SPIE](https://www.dicklyon.com/tech/Photography/Pixel-SPIE06-Lyon.pdf) — the authoritative etymological paper on this term; confirms Frederic C. Billingsley's two 1965 JPL papers ("Digital Video Processing at JPL," SPIE Vol. 3, April 1965; "Processing Ranger and Mariner Photography," SPIE Vol. 10, August 1965) and the earlier oral-use account from Keith E. McFarland. *(identified via search; PDF text extraction was garbled on fetch, so treat as primary-but-not-directly-quotable — the claims below are corroborated independently by items 2–3)*
2. [Pixel — Wikipedia](https://en.wikipedia.org/wiki/Pixel) — "The word pixel was first published in 1965 by Frederic C. Billingsley of JPL"; notes the older McFarland oral-use claim and even older "picture element" phrase (Wireless World, 1927). *(fetched; used as one of several, not alone)*
3. [Frederic C. Billingsley — Wikipedia](https://en.wikipedia.org/wiki/Frederic_C._Billingsley) — confirms Billingsley "published two papers in 1965 using the word pixel" at JPL and "may have been the first to publish that neologism."

**Verdict:** accurate as written. The in-game card doesn't claim Billingsley *coined* the word, just defines "pixel" and doesn't attach a name — so the McFarland-priority nuance (he may have used the word first, unpublished, before Billingsley put it in print) doesn't create an error in the player-facing text. Internal doc language should say "first published" rather than "coined" for precision — corrected in the table entry above (no in-game text change needed).

### Level 15 — ELIZA (1966)
Card claim: *"The first chatbot. ELIZA talked by turning your words into questions."*

1. [ELIZA—A Computer Program For the Study of Natural Language Communication Between Man and Machine — ACM Digital Library](https://dl.acm.org/doi/10.1145/365153.365168) — confirms original publication in *Communications of the ACM*, January 1966.
2. [Full text of Weizenbaum's 1966 ELIZA paper — UMBC](https://courses.cs.umbc.edu/331/papers/eliza.html) — directly confirms the decomposition/reassembly mechanic (reflecting statements back as questions) and the Rogerian-therapist DOCTOR script. *(fetched)*
3. [Why the Computer Scientist Behind the World's First Chatbot Dedicated His Life to Publicizing the Threat Posed by AI — Smithsonian Magazine](https://www.smithsonianmag.com/history/why-the-computer-scientist-behind-the-worlds-first-chatbot-dedicated-his-life-to-publicizing-the-threat-posed-by-ai-180987971/) — calls ELIZA "the world's first chatbot"; covers the famous secretary anecdote (the origin of the "ELIZA effect").
4. [Chatbots, Decoded — Computer History Museum](https://computerhistory.org/stories/chatbots-decoded/) — institutional; "ELIZA is now recognized as the first chatbot," holds a circa-1966 teleprinter transcript in its collection.

**Verdict:** accurate, no correction needed. "First chatbot" is the standard framing used even by the Computer History Museum itself. The question-reflection mechanic and the "people loved chatting with her" claim are both well documented (Weizenbaum's own secretary is the famous example).

### Level 17 — Commodore 64 (1982)
Card claim: *"The best-selling computer of all time."*

1. [Best-selling desktop computer — Guinness World Records](https://www.guinnessworldrecords.com/world-records/72695-most-computer-sales) — official record holder page; cites a "credible modern estimate" of 12.5 million units, while noting Commodore's own claim of 17 million and founder Jack Tramiel's claim of 22–30 million.
2. [Commodore 64 — Smithsonian National Museum of American History](https://americanhistory.si.edu/collections/object/nmah_334636) — confirms January 1982 CES introduction, $595 launch price, and states "between 17 and 30 million were sold worldwide."
3. [1982 — Computer History Museum Timeline](https://www.computerhistory.org/timeline/1982/) — states sales "totaled close to 17 million units, making it the best-selling single personal computer model of all time."

**Verdict:** accurate. "Best-selling computer of all time" matches the actual Guinness World Records title. The underlying unit count is genuinely contested across sources (12.5M–30M range) — the card sidesteps this by not citing a specific number, which is the right call. No change needed.

### Level 18 — Intel 386 (1985)
Card claim: *"The chip that made computers fast enough for real games. Thirty-two bits of pure speed, smaller than a cracker."*

1. [Raising the Bar with the 386 — Intel official timeline](https://timeline.intel.com/1985/raising-the-bar-with-the-386) — primary corporate-history source; confirms October 17, 1985 release, 275,000 transistors, 16MHz clock, simultaneous 5-city global launch.
2. [i386 — Wikipedia](https://en.wikipedia.org/wiki/I386) — confirms "first 32-bit processor in the line," used as one of several sources.
3. [CT-scanning the Intel 386 package — Ken Shirriff](https://www.righto.com/2025/08/intel-386-package-ct-scan.html) — established chip-reverse-engineering technical blog; confirms 132 gold-plated pins on a 0.1"(2.54mm) grid, used to sanity-check the physical size comparison.

**Verdict:** accurate. Release date and "first 32-bit x86 processor" claim both confirmed. The "smaller than a cracker" comparison is inferred from pin-count/pin-pitch geometry (a 132-pin PGA package of that era works out to roughly 1.3–1.7 inches per side, smaller than a ~2-inch saltine or Ritz-style cracker) rather than a directly-quoted spec-sheet dimension — reasonable, not exaggerated, but flagged as the one detail in this card that's a geometric inference rather than a directly cited number.

### Level 19 — Y2K (1999)
Card claim: *"The whole world checked its math because computers stored years with two digits. Midnight came — and the fixes worked."*

1. [Y2K — Smithsonian National Museum of American History](https://americanhistory.si.edu/collections/object-groups/y2k) — confirms the two-digit year mechanism, the "00" ambiguity risk, and ~$300–600B global remediation cost.
2. [Y2K bug — Britannica](https://www.britannica.com/technology/Y2K-bug) — confirms the fix (expanding to 4-digit years) and states the effort "was viewed as a success because few major failures occurred" — directly supports "the fixes worked."
3. [20 Years Later, the Y2K Bug Seems Like a Joke. That's Because Those Behind the Scenes Then Took It Seriously — TIME](https://time.com/5752129/y2k-bug-history/) — journalistic retrospective explicitly arguing the smooth transition was a result of remediation work.
4. [Y2K: Looking Back on the Bug That Wasn't — NPR](https://www.npr.org/2024/12/27/nx-s1-5231820/y2k-looking-back-on-the-bug-that-wasnt) — the balanced counterweight: a historian calls Y2K "both somewhat overblown and a valuable exercise" — the most apocalyptic scenarios were unlikely, but remediation prevented real smaller-scale disruptions.

**Verdict:** accurate; matches the dominant institutional narrative (Smithsonian, Britannica, TIME). There is a live "was it overblown" strand of tech journalism (NPR item above) worth knowing about if the framing is ever challenged, but it doesn't dispute that fixes were real and effective — just debates how close the world came to disaster without them. No change needed.

### Level 20 — ARPANET's first message (1969)
Card claim: *"The internet's first message was supposed to be LOGIN. The computer crashed after two letters. The internet's first word: LO."*

1. [Day the Infant Internet Uttered Its First Words — Leonard Kleinrock's own site, UCLA CS](https://www.lk.cs.ucla.edu/internet_first_words.html) — primary source, written by the professor who oversaw the transmission; confirms October 29, 1969, 22:30, UCLA Sigma 7 → SRI SDS 940, crash after "l" and "o," full login roughly an hour later.
2. [Internet50/Press — UCLA Samueli School of Engineering](https://samueli.ucla.edu/internet50-press/) — institutional (UCLA); confirms Charley Kline typing LOGIN under Kleinrock's supervision, message sent to Bill Duvall at SRI, crash after two letters.
3. [The First Message Transmission — ICANN blog (50th anniversary)](https://www.icann.org/en/blogs/details/the-first-message-transmission-29-10-2019-en) — institutional; includes Kleinrock's own quote calling "LO" a "prophetic" accidental "hello."
4. [How a Simple 'Hello' Became the First Message Sent via the Internet — PBS NewsHour](https://www.pbs.org/newshour/science/internet-got-started-simple-hello) — established journalism corroborating date, nodes, and the crash story with a direct Kleinrock quote.

**Verdict:** accurate, no correction needed. Extremely well documented — UCLA's own site (written by Kleinrock himself) confirms every detail in the card.

### Level 22 — ASCII (1963)
Card claim: *"Before pictures, people drew with letters. ASCII gave every character a number — and gave us little text people cheering."*

1. [Milestones: American Standard Code for Information Interchange ASCII, 1963 — ETHW (IEEE)](https://ethw.org/Milestones:American_Standard_Code_for_Information_Interchange_ASCII,_1963) — official IEEE Milestone designation confirming 1963 standardization.
2. [The History of ASCII 1963 — ascii-code.com](https://www.ascii-code.com/articles/ASCII-1963) — confirms ASA X3.4-1963, released June 17, 1963, as a 7-bit/128-character code; notes the original 1963 version lacked lowercase letters, added in the 1967 revision.
3. [ASCII art — Wikipedia](https://en.wikipedia.org/wiki/ASCII_art) — used as a supplementary source alongside the two above; corroborates ASCII art's lineage through typewriter art and teleprinter/TTY transmission into the computer era (Kenneth Knowlton, Bell Labs, ~1966) and BBS culture.
4. [The Surprisingly Rich History of ASCII Art — The New Stack](https://thenewstack.io/surprisingly-rich-history-ascii-art/) — established tech journalism corroborating the teleprinter-to-BBS lineage.

**Verdict:** accurate for the game's purposes. 1963 is correctly the first standardization year (ASA X3.4-1963); a minor nuance is that the original 1963 version lacked lowercase letters (added in the 1967 revision), so "gave every character a number" is true of the character set that existed in 1963, just not yet the full modern set. No change needed — this is a level of precision beyond what a children's card needs, noted here for completeness.

### Level 24 — ENIAC (1946) — **research-doc correction, not a card-text error**
Card claim: *"The first room-sized electronic computer, programmed by six women mathematicians. It weighed as much as five elephants."*

1. [ENIAC — Penn Engineering, University of Pennsylvania](https://www.engineering.upenn.edu/about/history-heritage/eniac/) — primary institutional source (Penn built ENIAC); confirms February 14, 1946 unveiling, "first general-purpose electronic computer" framing, 30-ton weight, and names all six ENIAC programmers correctly: Kathleen (Kay) McNulty, Jean Jennings Bartik, Frances "Betty" Snyder Holberton, Marlyn Wescoff Meltzer, Frances Bilas Spence, and Ruth Lichterman Teitelbaum.
2. [Penn's ENIAC, the World's First Electronic Computer, Turns 80 — Penn Today](https://penntoday.upenn.edu/news/penns-eniac-worlds-first-electronic-computer-turns-80) — confirms 1946 launch year, "world's first general-purpose, electronic, programmable computer," 30-ton weight, and lists the same six names individually.
3. [ENIAC — Computer History Museum, Revolution exhibit](https://www.computerhistory.org/revolution/birth-of-the-computer/4/78) — more cautious institutional framing: "the first large-scale computer to run at electronic speed without being slowed by any mechanical parts" — useful as the source for the "first electronic computer" caveat (see below).
4. [ENIAC Programmers Project](https://eniacprogrammers.org/) — the dedicated primary project on this exact topic; confirms the correct six names and explicitly documents that Lichterman and Teitelbaum are the same woman (maiden name / married name).

**Verdict — TWO items needed correction, both in this research doc (no in-game text change needed):**

1. **The six programmers' names.** The *original* version of this doc listed "Bartik, Holberton, Teitelbaum, Meltzer, Bilas, Lichterman" as the six programmers. This is wrong: **Ruth Teitelbaum and Ruth Lichterman are the same person** (Lichterman is her maiden name, Teitelbaum her married name). The list as written therefore names only five distinct women and silently omits **Kay McNulty** (later Kay Mauchly Antonelli). The correct six are: Kay McNulty, Jean Bartik, Betty Holberton, Marlyn Meltzer, Frances Bilas, and Ruth Teitelbaum (née Lichterman). This has been corrected in this document. The in-game card text itself only says "six women mathematicians" without naming them, so **no change to `js/history-cards.js` is needed** — the error was confined to this research file's internal notes.
2. **"First room-sized electronic computer."** Penn's own materials confidently say "first general-purpose electronic computer," while the Computer History Museum uses more cautious language ("first large-scale computer to run at electronic speed"). The historical nuance (Colossus in the UK, the Atanasoff-Berry Computer) hinges specifically on "general-purpose" and "programmable," not just "electronic" — ENIAC's claim to fame is defensible when qualified as general-purpose. The in-game card drops the word "general-purpose," which is a simplification appropriate for a children's game, not a factual error, since ENIAC genuinely was the first at *some* defensible framing of "first." No card change required; noted here for anyone tightening the copy later.

Weight check: institutional sources (Penn, Penn Today) consistently cite **30 tons**. An adult African elephant averages roughly 5.5–6.6 tons; 30 ÷ 5 = 6 tons/elephant, squarely inside that range. **"Five elephants" is accurate — no change needed.**

### Level 25 — Hello, World (card year: 1978)
Card claim: *"The first program every coder writes makes the computer say hello. You typed it by hand."*

1. ["A Tutorial Introduction to the Language B" — Bell Labs CS Technical Report 8 (1972), via Internet Archive](https://archive.org/details/OrigBtut) — the actual primary document, authored by Stephen C. Johnson and Brian W. Kernighan, dated 1972 — the earliest documented "hello, world" example. *(fetched)*
2. [The C Programming Language — Wikipedia](https://en.wikipedia.org/wiki/The_C_Programming_Language) — confirms first-edition publication date February 22, 1978, and confirms "hello, world" is the book's first example program (Section 1.1). *(fetched; used alongside non-Wikipedia sources)*
3. ["Hello, World!" program — Wikipedia](https://en.wikipedia.org/wiki/%22Hello,_World!%22_program) — corroborates the 1972 B-tutorial origin and 1978 K&R popularization, and notes an intermediate 1974 Bell Labs memo in between. *(fetched)*
4. [The History of "Hello, World" — HackerRank Blog](https://www.hackerrank.com/blog/the-history-of-hello-world/) — independent journalistic corroboration of both the 1972 origin and 1978 popularization, satisfying the "not Wikipedia alone" rule.

**Verdict:** accurate but, like the WWW card, folds an origin date and a popularization date into a single year. The earliest documented appearance is Kernighan's 1972 internal B tutorial (verified directly against the primary document); the famous, culture-defining appearance is Kernighan & Ritchie's *The C Programming Language*, 1st edition, published February 22, 1978. The in-game card uses 1978 — defensible as "the year hello world became a universal convention," but the deeper origin is 1972. No change needed to the card; noting the nuance here so a future reviewer doesn't flag "1978" as wrong.

---

## Corrections from citation pass (2026-07-11)

1. **Grace Hopper (Level 13) — in-game card text needs a change.** The current card
   (`js/history-cards.js`, level 13) reads: *"Grace Hopper's team found a real moth stuck
   inside their computer — the first computer 'bug.' She taped it into the logbook."* The
   Smithsonian's own object record for the actual 1947 Harvard Mark II logbook states it
   "was probably not Hopper's," and multiple sources (JSTOR Daily citing the Smithsonian
   and the 1981 *Annals of the History of Computing*) confirm Hopper repeatedly said in
   later interviews that she did not personally find or log the moth — a technician on her
   team did. **The specific sentence "She taped it into the logbook" is not supported by
   the sources and should be corrected or removed.**

   This document does not edit `js/history-cards.js` (per task instructions, since it's a
   copy change to game-facing text, not the research file). **Suggested replacement text
   for a human/separate change**, preserving the card's tone and word-length constraints:
   > "In 1947, a real moth got stuck inside Grace Hopper's team's computer — the first time
   > anyone taped a 'bug' into a logbook. Hopper told the story so well for decades, it
   > became hers."

   This keeps Hopper as the throughline (the card is titled "GRACE HOPPER" and she's still
   the reason this story survived), keeps the fun fact, and removes the specific
   unsupported claim that she personally taped the moth in.

2. **ENIAC six programmers' names (Level 24) — research-doc-only correction, already
   applied above.** The original "Fact-checking notes" section listed "Bartik, Holberton,
   Teitelbaum, Meltzer, Bilas, Lichterman" as the six ENIAC programmers. Teitelbaum and
   Lichterman are the same woman (Ruth Lichterman Teitelbaum — maiden/married name), so
   the original list actually named only five distinct people and omitted **Kay McNulty**.
   Corrected list, per Penn Engineering's own ENIAC page and the ENIAC Programmers
   Project: Kay McNulty, Jean Bartik, Betty Holberton, Marlyn Meltzer, Frances Bilas, Ruth
   Teitelbaum (née Lichterman). **No change to `js/history-cards.js` is needed** — the
   in-game card only says "six women mathematicians" without naming them, so the error
   never reached player-facing text. It was confined to this document's internal notes.

## Unsourceable / not independently verifiable claims
- The `\o/` glyph itself (Level 22) has no documented "origin" as a specific symbol — this
  wasn't expected to be sourceable and the card doesn't claim it does. What's sourced
  instead is the general mechanism (ASCII assigns numeric codes to characters; ASCII art
  as a genre is a well-documented downstream cultural artifact of that numbering scheme).
- The exact physical package dimensions of the Intel 386 (Level 18) were not found in a
  directly-quotable spec sheet; the "smaller than a cracker" comparison is corroborated
  instead via pin-count/pin-pitch geometry from a CT-scan teardown (Ken Shirriff), which
  supports the comparison but is an inference rather than a directly cited dimension.
- A NASA/JPL institutional history-office page crediting Fred Billingsley by name for the
  word "pixel" (Level 14) could not be found; the claim rests on Richard Lyon's SPIE
  historical paper (identified via search, though its PDF text did not extract cleanly on
  fetch) corroborated independently by two Wikipedia articles. Treated as sourced, but
  weaker than the museum-first standard used elsewhere in this document.

## Mechanics decisions (why they're this way)

*Internal design decisions — grounded in this project's own design bible (CLAUDE.md,
.claude/rules/product.md), not external history; no external citations applicable.*
- **Card at level-complete, not mid-play** — product.md's law: celebrations at natural
  pause points; mid-flow feedback stays ambient (the gold glint).
- **Guaranteed, not lucky** — QA found the original injection (70% into the pattern list)
  was routinely unreachable before the level's win condition. Now: injected immediately
  after intro drills AND the completion gate waits for the word. A card can never be missed.
- **Business-card fiction** — cream card, slight rotation, "FOUND ON THE ARCADE FLOOR",
  NEW! tag, CARD n OF 17 counter. Collection persists (localStorage `kk-cards`);
  the album UI is Stats Cabinet work (docs/ROADMAP.md).
