# Computing History Moments
## Research behind the 17 history cards

*Compiled 2026-07-11 for the "picked up off the arcade floor" feature. Implementation:
`js/history-cards.js`; mechanics in `.claude/rules/*` and docs/ROADMAP.md (album pending).
This file records the research: the moment, why it matters, and the typeability constraint
that assigned it to its level.*

**The core constraint that shaped everything:** each card's word must be typeable using
ONLY the keys unlocked at its level. This turned out to be a design gift — the curriculum
itself decides when history becomes speakable, and some assignments landed poetically.

| Lvl | Word | Moment | Why this level (typeability + poetry) |
|---|---|---|---|
| 4 | `ada` | Ada Lovelace writes the first program (1843), a century before hardware | The FIRST real-word level completion (home row done) can spell the FIRST programmer |
| 5 | `hal` | HAL 9000, *2001: A Space Odyssey* (1968) | g/h just unlocked; the most famous fictional computer arrives with the reach keys |
| 8 | `hedy` | Hedy Lamarr patents frequency hopping (1942) → ancestor of Wi-Fi/Bluetooth | Needs y (L8). A movie star inventing wireless — the "inventors come from anywhere" card, chosen deliberately for a daughter learning tech |
| 9 | `www` | Tim Berners-Lee's World Wide Web (1989), given away free | w unlocks at 9; three of the same brand-new letter |
| 10 | `floppy` | The floppy disk (IBM, 1971) | p unlocks at 10 |
| 11 | `mouse` | Engelbart's wooden mouse + the Mother of All Demos (1968) | m unlocks at 11 |
| 12 | `turing` | Alan Turing — Bombe codebreaking; "Computing Machinery and Intelligence" (1950) | n unlocks at 12 (kid-safe framing: codes + "can machines think?") |
| 13 | `grace` | Grace Hopper's team tapes the first actual bug — a moth — into the log (1947-09-09) | c unlocks at 13; pairs with the level's "pause and read" Myst mood |
| 14 | `pixel` | "Picture element" coinage era (1965) | x unlocks at 14; meta-card — the kid has been reading pixels all game |
| 15 | `eliza` | ELIZA, the first chatbot (1966) | z unlocks at 15 — the alphabet's last letter releases the first machine you could talk to |
| 17 | `c64` | Commodore 64 (1982) — best-selling computer ever | 4 unlocks at 17 |
| 18 | `386` | Intel 80386 (1985) — 32-bit era begins | 3 and 8 ARE level 18's new keys |
| 19 | `y2k` | The Y2K remediation (1999) — "the world checked its math," and the fixes worked | 2 unlocks at 19; framed as a triumph of care, not a scare |
| 20 | `1969` | ARPANET's first message: LOGIN crashed after two letters — the internet's first word was "LO" (1969-10-29) | 1 and 9 complete the digits; THE typing story of all typing stories |
| 22 | `\o/` | ASCII standardized (1963) — drawing with characters | \ unlocks at 22; the cheering text-person is already in the level's pool |
| 24 | `Eniac` | ENIAC (1946), programmed by six women mathematicians | Shift unlocks at 24 — the first capital-letter card |
| 25 | `hello world` | K&R's first program (1978 tradition) | Space unlocks at 25; the game's final card is every programmer's first sentence |

**Levels without cards** (1-3, 6, 7, 16, 21, 23): either too few letters for a worthy word
or no strong era fit. Deliberate — "not every floor tile hides one; that's what makes
finding them special."

## Fact-checking notes
- Hopper didn't find the moth personally (her team did); card says "Grace Hopper's team." ✓
- "First programmer" for Lovelace is the standard framing (Note G, Analytical Engine). ✓
- ENIAC's six: Bartik, Holberton, Teitelbaum, Meltzer, Bilas, Lichterman — card says
  "six women mathematicians" without naming (space constraints). ✓
- ARPANET: UCLA→SRI, Kleinrock's lab, crashed mid-LOGIN. "LO" story is well-documented. ✓
- `hello world` traces to Kernighan's 1972 B tutorial; popularized by K&R 1978 — card
  uses 1978. ✓
- Pixel: term traceable to 1965 JPL usage (Fred Billingsley). ✓

## Mechanics decisions (why they're this way)
- **Card at level-complete, not mid-play** — product.md's law: celebrations at natural
  pause points; mid-flow feedback stays ambient (the gold glint).
- **Guaranteed, not lucky** — QA found the original injection (70% into the pattern list)
  was routinely unreachable before the level's win condition. Now: injected immediately
  after intro drills AND the completion gate waits for the word. A card can never be missed.
- **Business-card fiction** — cream card, slight rotation, "FOUND ON THE ARCADE FLOOR",
  NEW! tag, CARD n OF 17 counter. Collection persists (localStorage `kk-cards`);
  the album UI is Stats Cabinet work (docs/ROADMAP.md).
