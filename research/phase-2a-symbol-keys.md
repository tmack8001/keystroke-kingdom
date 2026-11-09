# Phase 2a Symbol Keys — one card per key: NAME, WRITING, CODE

*Research layer for the Phase 2 keyboard cards (spec: `docs/specs/semicolon-teaching-beat.md` §5.9;
model beat: [[semicolon]]; design: `.claude/rules/product.md` §The Key Names). Written 2026-11-04 by
the arcade-historian. Scope: `,` `.` `/` `-` `[ ]` `\` `` ` `` `'`. Out of scope by instruction: `=`
(the `1=1` / `1==1` cards cover it) and the Shift symbols.*

**How to verify.** The arcade-historian citation standard applies: 2–4 trusted references per
claim; no URL from memory (every link was surfaced by a live search or fetched this session);
**[fetched]** vs *(search result only, not fetched)* labels on each page; unusable URLs are named,
not cited. Each fact lives on its atomic page — [[comma]], [[period]], [[slash]], [[hyphen]],
[[brackets]], [[backslash]], [[backtick]], [[apostrophe]] — and this hub only carries the
**proposals** built from them. Three habits carried over from the semicolon pass: *first
printed/credited, never invented*; *the first citation of a word is not the birth of the mark*;
*"many," not "every," and "instruction," not "line."*

## 1. The summary table

Caption lines are the two-line L-beat format of `KEY_CARDS` (`literacy`, each ≤ 34 chars; ALL
CAPS; counted by hand). Post-terminal keys (L21+) deliver literacy and code together, so their
`code` line is a third line. `year` follows the `jf`/`o'reilly` precedent where nothing dates the
mark: `UNKNOWN`.

| Key | Card level / code level | Beat word | **NAME line** | **WRITING line** | **CODE line** | `year` | Confidence |
|---|---|---|---|---|---|---|---|
| `,` | 13 / 20 | `comma` | ITS NAME IS COMMA. | IT SEPARATES ITEMS IN A LIST. | MANY CODERS SEPARATE ITEMS WITH IT, | UNKNOWN | **High** (name, writing, code); medium on Aldus credit |
| `.` | 14 / 20 | `period` | ITS NAME IS PERIOD. | IT CAN END A SENTENCE. | WEB ADDRESSES USE IT BETWEEN PARTS. | UNKNOWN | **High** |
| `/` | 15 / 20 | `slash` | ITS NAME IS SLASH. | IT CAN MEAN "OR", LIKE YES/NO. | COMPUTERS USE IT BETWEEN FOLDER NAMES. | UNKNOWN | **High** |
| `-` | 21 / 21 | `hyphen` | ITS NAME IS HYPHEN. | IT JOINS WORDS, LIKE ZIG-ZAG. | MANY CODERS USE IT AS A MINUS SIGN. | UNKNOWN | **High** |
| `[` `]` | 22 / 22 | `bracket` | THEIR NAME IS BRACKETS. | THEY ADD A NOTE INSIDE A QUOTE. | MANY CODERS USE THEM TO MAKE LISTS. | UNKNOWN | **Medium** (UK/US name ambiguity; no origin) |
| `\` | 22 / 22 | `backslash` | ITS NAME IS BACKSLASH. | IT LEANS THE OTHER WAY FROM SLASH. *(no sourced writing role — shape only)* | WINDOWS USES IT BETWEEN FOLDER NAMES. | 1961 *(added to ASCII — never "invented")* | **Medium** (Bemer history solid; Windows "why" contested) |
| `` ` `` | 23 / 23 | `backtick` | ITS NAME IS BACKTICK. | IT IS ALSO AN ACCENT MARK. | MANY CODERS WRAP SPECIAL TEXT IN IT. | UNKNOWN | **Medium** (name "backtick" has no sourced origin) |
| `'` | 23 / 23 | `apostrophe` | ITS NAME IS APOSTROPHE. | IT SHOWS MISSING LETTERS: DON'T. | MANY CODERS WRAP TEXT IN A PAIR. | THE 1500s *(entered English)* | **Medium-high** (birth disputed; hedged) |

Longer **card-fact** drafts (the LEVEL COMPLETE body; each sentence is on its page):

- **COMMA** — "Its name is comma. It comes from a Greek word meaning a piece cut off. A comma separates
  items in a list, like red, blue, green." *(code, later: "Many coders separate items in a list with a comma.")*
- **PERIOD** — "Its name is period. A period can end a sentence. Computers call it dot, like in
  a web address." *(Do not say Aristophanes "invented" it.)*
- **SLASH** — "Its name is slash. It often means or, like yes/no. It grew from a very old mark, the
  same one the comma grew from." *(hedged on purpose: the medieval virgule is attested, but no
  fetched source dates it to a century — don't print a number.)*
- **HYPHEN** — "Its name is hyphen. A hyphen joins words, like zig-zag. Coders use the same key as a
  minus sign."
- **BRACKETS** — "These are square brackets. They come in pairs. Writers use them to add a note
  inside someone else's quote. Many coders use them to make lists."
- **BACKSLASH** — "Its name is backslash. It leans the other way from slash. In 1961 an IBM
  engineer named Bob Bemer got it added to the computer alphabet called ASCII. Windows uses it
  between folder names." *(verb: "got it added" — Teletype used it earlier.)*
- **BACKTICK** — "Its name is backtick. It started on typewriters as an accent mark. Many coders
  wrap special text in a pair of them."
- **APOSTROPHE** — "Its name is apostrophe. It shows missing letters, like don't, and belonging,
  like Oona's. It came into English from French printing in the 1500s."

## 2. Beat words — spellability and blocklist

Cumulative keys from `js/levels.js` `newKeys`. *Spellable from* = the first level where every
letter is unlocked. A beat word is **safe** when *spellable from ≤ card level* (it always is here).
Blocklist = `js/word-blocklist.json` (exact-word floor, 53 words) plus the hard-core substring
tier (`fuck shit cunt porn nazi slut whore piss bitch`) from `security.md` rule 7.

| Word | Letters needing the latest key | Spellable from | Card level | Blocklist | Verdict |
|---|---|---|---|---|---|
| comma | c (L13) | **L13** | 13 | clear | OK — exactly the card level |
| period | p (L10) | L10 | 14 | clear | OK |
| slash | h (L5) | L5 | 15 | clear | OK |
| hyphen | n (L12) | L12 | 21 | clear | OK |
| bracket | c (L13) | L13 | 22 | clear | OK (singular; `brackets` also clear) |
| backslash | c (L13) | L13 | 22 | clear | OK |
| backtick | c (L13) | L13 | 23 | clear | OK |
| apostrophe | p (L10) | L10 | 23 | clear | OK |

**No beat word needs a key the card's level has not unlocked.** Two non-obvious notes:
`square brackets` (two words) contains a **space** — Space unlocks at **L25** — so it cannot be
the L22 beat word (use `bracket`, or say "SQUARE BRACKETS" only on the card text, which is
display, not typed); and the backslash's *letters* are all available at L13 but its **key** is not
until L22, which is why the card level is 22, not 13. Alternate names (for tooltips/captions, not
beats): `dash`, `dot` (L8), `backquote` (L10), `grave` (L11). None is blocked.

**Co-location (spec §5.9):** L13 → `;` then `,` (two plays; array order decides). L22 → `[ ]`
and `\` (two plays). L23 → `` ` `` and `'` (two plays; `hack` and `o'reilly` already live
there as arcade cards and must not be retold).

## 3. Downstream-impact flags

None of this was edited; each is for the orchestrator/Trevor.

1. **`js/ui/hud.js:34`** — current text: `'`': 'TICK MARK',` (the small caption under the prompt at
   L23 for the backtick). **Collides with the beat** that would teach `BACKTICK`. "Tick mark" is
   **unsourced as a name for this key**; sources give *backtick, backquote, grave, grave accent*
   (Wikipedia *Backtick*, POSIX Issue 8, Unicode). Proposed: `'`': 'BACKTICK'`. Also
   `js/levels.js:1449` hint `PINKIES FIND THE TICK MARKS` and `js/freeplay.js:198` *"The tick marks
   find your pinkies."* — these use the plural for both L23 keys and are arguably a harmless
   nickname; **judgment call, not an error.** (Player-facing: **highest priority** only if the
   backtick beat ships; otherwise a naming-consistency note.) Source: [[backtick]].
2. **`js/ui/hud.js:36–38`** — `',': 'COMMA'`, `'.': 'PERIOD'`, `"'": 'APOSTROPHE'` are already shown
   as captions. **Not errors** — they establish that these three names are *not* withheld today, which
   bears on Question 1 below.
3. **`js/freeplay.js:140`** — `'A comma is a breath.'` and `.claude/rules/levels/act3.md` ("A comma is
   a breath"). Not false — the ancient dots were reading-aloud aids (Wikipedia *Punctuation*) — but a
   university handout (UNLV, search-result only) says pause-as-rule "is not a reliable rule." If a
   card says anything on the same theme, frame it as *old* reading-aloud history. Proposed copy
   stays; nuance only. Source: [[comma]] §3.
4. **`.claude/rules/levels/act5.md`** — "Level 21 — Dash & Equals", "the dash and equals". The key
   makes a **hyphen-minus**; a true dash is a different, longer character (Wikipedia *Hyphen-minus*,
   Chicago *Shop Talk*). Docs-only (no `js/` string found by grep); proposed: "Hyphen & Equals."
   Source: [[hyphen]].
5. **`.claude/rules/levels/act5.md` / `levels.md`** word lists contain bracket and backslash drills —
   no change needed; flagged only because the card must not teach `\` as an *escape* (the `\n` card
   owns that).
6. **`docs/specs/semicolon-teaching-beat.md` §5.9** — table row for `.` says "L_name 10", correct;
   row for `-` says L_name 12, correct (`hyphen`, n); row for `/` L_name 5 correct. All eight rows
   check out against `js/levels.js`. No correction needed.

## 4. Questions for Trevor (not decided here)

1. **Withhold the names?** `semicolon` is withheld before L13; these words carry **no such ruling**.
   Fact on the ground: `COMMA`, `PERIOD`, `APOSTROPHE` already print under their prompts and
   `Every bracket has a partner.` is a Free Play line; `slash`, `hyphen`, `backslash`, `bracket(s)`,
   and `backtick` appear in **no** player-facing string today. If the beats aren't meant to be
   "reveals," the cards teach *role and origin* for the first three and *name + role* for the rest.
2. **The backslash has no writing job.** Its WRITING line is a name-and-shape line ("leans the other
   way"), not a punctuation rule. Alternative: skip a writing line for it and let the caption be
   name + code.
3. **TICK MARK vs BACKTICK** (flag 1) — keep the nickname as a second name, or replace?
4. **"Square brackets" has a space** (Space = L25), and "bracket" means `( )` in British English.
   Keep the singular beat word `bracket`? Show "SQUARE BRACKETS" on the card face?
5. **Q-P2a (spec §11):** how do `, . /` deliver their code lines at L20? These proposals assume
   the default (one quiet extra line, read in the card-detail view).
6. **`year` strings:** several marks have no dated origin; `UNKNOWN` follows the `jf` card
   precedent. Alternatives (e.g. "ANCIENT GREECE" for the comma's name) are sourced only
   loosely — I'd keep `UNKNOWN`.
7. **Glyph coverage:** the backtick line wants an accented example (à); Press Start 2P coverage
   unverified — the proposal avoids printing it.

## Corrections from citation pass (2026-11-04)

*(Nothing in an existing doc was wrong in a way that reaches a card; these are traps the research
found before they shipped, and they are logged so the diff between belief and evidence is visible.)*

- **"Bob Bemer invented the backslash"** → Teletype's manual (1937, "may be") predates him; Bemer
  **proposed it for ASCII in September 1961** (adopted November 1961). [[backslash]]
- **"Apostrophe is first recorded in 1588"** → the first OED citation of the *word* for the mark;
  the mark entered English in the **1500s**; Tory's 1529 French credit is *disputed*. [[apostrophe]]
- **"The low dot became the period"** → in Aristophanes' scheme the **high** dot ended a
  sentence; scribes later wrote it low (from the 9th century). [[period]]
- **"Berners-Lee called the double slash a mistake"** → his own W3C words: *"now I regret that the
  syntax is so clumsy"*; "mistake/unnecessary" is press paraphrase. [[slash]]
- **"The - key is a dash"** → hyphen-minus; dashes are different characters. [[hyphen]]
- **"Aldus invented the comma"** → *credited with lowering the virgule*; one fetched page plus a
  19th-century manual. [[comma]]
- **"Tick mark"** (in-game) → not an attested name; see flag 1.

## Unsourceable / weakly-sourced items

- **Marks with no sourced first-drawn date:** comma shape (late 1400s only by Wikipedia/MacKellar),
  period, slash, hyphen, square brackets, backtick — hence `UNKNOWN` years.
- **Name origin of "backtick":** none found. **"Bracket" word history** (codpiece → 1750) appeared only as a
  search-result summary of etymonline (403) — not for a child card regardless.
- **Why Windows chose `\`:** contested (IBM compromise vs Model F ergonomics; OS/2 Museum itself says
  not fully documented) — card says *that* Windows uses it, not *why*.
- **Unusable URLs (named, never cited as read):** etymonline.com (comma, bracket — 403); merriam-webster.com
  apostrophe history (403); britannica.com Geoffroy Tory (failed); shadycharacters.co.uk backslash
  post (403); info.computer.org Bemer profile (SSL handshake error); the Purdue OWL archived
  apostrophe page (empty body); the Python 3.8 tutorial mirror on grok.dragonflybsd.org (404);
  codepoints.net/U+0060 (timeout).
- **Tooling gap:** this agent had no shell this session, so `node scripts/wiki-search.mjs
  --index`/`--lint` were **not run** and `research/index.md` is **not** updated; the orchestrator
  must run both. The log line is appended.
- **Per-item source counts** (fetched / total): comma 5/6, period 3/4, slash 3/4, hyphen 3/4,
  brackets 4/5, backslash 4/5, backtick 4/5, apostrophe 5/6.

## References

All claims are referenced on the eight pages above. Hub-level pointers:
[[semicolon]] (model page), [[the-eighth-key]], [[equals-sign]] (`=` stays out of scope),
`docs/specs/semicolon-teaching-beat.md` §5.9 and §11, `.claude/rules/product.md` §The Key Names.
