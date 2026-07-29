---
title: The Hacker Manifesto
type: moment
tags: [hacker-culture, phreaking, essay, history-card]
sources: 6
verified: 2026-07-27
---

"The Conscience of a Hacker," now universally known as "The Hacker Manifesto," is a
short essay written January 8, 1986, by Loyd Blankenship — handle "The Mentor," a
member of the [[legion-of-doom|Legion of Doom]] — shortly after his own arrest. First
published later that year in [[phrack-magazine|Phrack]] (Volume 1, Issue 7, Phile 3),
it argues that hackers are driven by curiosity and a hunger to learn, not malice, and
became one of the most reprinted texts in hacker culture — quoted in films, printed
on merchandise, and cited even in Edward Snowden's memoir.

## In this game

**Proposed history card (not yet built)** — part of the 2026-07-27 hacker/phreak
research batch, see `research/hacker-culture.md` ("Part 2 — The 1970s–90s Underground")
for the full set and kid-safety framing (this one needs the MOST editorial care of the whole batch — see
below). Suggested moment word **`mentor`** (letters m-e-n-t-o-r; earliest level where
all six are unlocked is **Level 12**, gated by `n`) — ties directly to Blankenship's
own handle. Cross-links: [[legion-of-doom]], [[phrack-magazine]].

## The facts

- **Written January 8, 1986** by Loyd Blankenship, using the handle "The Mentor."
- **First published in Phrack, Volume 1, Issue 7, Phile 3, later in 1986** — Phrack's
  own numbering identifies it as article/phile 3 of 10 in that issue.
- **Motivation:** Blankenship wrote it during what he called "hacking withdrawal"
  after his own arrest, partly to counter the public image of hackers shaped by the
  film *WarGames* (which had portrayed them as potential instigators of nuclear war)
  by explaining, in his words, "the essence of what we were doing and why."
- **Core argument:** hacking is driven by intellectual curiosity and a hunger for
  knowledge, not a desire to cause harm; technology "should be used to expand our
  horizons and try to keep the world free."
- **Enduring cultural reach:** the essay is considered a cornerstone of hacker
  culture's self-image, has been quoted in films and printed on merchandise across
  four decades, and is referenced in Edward Snowden's memoir.

## Verbatim excerpts (for the Level 25 finale)

*Added 2026-07-27, follow-up to the research batch above: Trevor decided to build a
Level 25 finale where the player TYPES escalating excerpts of this manifesto —
verbatim, hard-coded, never paraphrased. See `research/hacker-culture.md` ("Part 2 —
The 1970s–90s Underground") for the full batch this follow-up extends. Verified this session by directly
WebFetching the primary source (Phrack's own hosted copy, phrack.org/issues/7/3) with
targeted, short quote-verification prompts (full-document reproduction requests were
correctly refused as exceeding fair-use quoting — only short, cited excerpts are
reproduced here), cross-checked against two independent secondary reproductions.*

**1. The "our world" line:**
> This is our world now... the world of the electron and the switch, the beauty of the baud.

**2. The "we exist without..." belonging line:**
> We exist without skin color, without nationality, without religious bias... and you call us criminals.

**3. The closing "curiosity" passage** (the sentence immediately before it is included
for landing context — the excerpt itself starts at "Yes, I am a criminal."):
> You build atomic bombs, you wage wars, you murder, cheat, and lie to us and try to make us believe it's for our own good, yet we're the criminals. Yes, I am a criminal. My crime is that of curiosity. My crime is that of judging people by what they say and think, not what they look like. My crime is that of outsmarting you, something that you will never forgive me for. I am a hacker, and this is my manifesto. You may stop this individual, but you can't stop us all... after all, we're all alike.

The document's actual final line is the signature `+++The Mentor+++` — NOT
recommended as typeable content (see typeability notes below).

### Finale tier mapping (as built 2026-07-27; recast as the coda capstone 2026-07-28)

**Context (2026-07-28):** the manifesto is no longer the *whole* Level 25 finale. It is
now the **capstone final line(s) of the "MY STORY" coda** — the player first types a
readable "walk the keyboard" story (js/keyboard-story.js, `assembleCoda`), and this
manifesto excerpt caps it off. The excerpt still escalates by the **EXPERIENCE tier**
(`finaleLinesForRatio(getWinRatio())` in `js/finale-quote.js`, unchanged), adding one more
verbatim line at each of the four tiers — cumulative, following the manifesto's own text
order — so a higher tier both lengthens the story body AND the manifesto capstone:

- **FIRST QUARTER (1×)** — excerpt 1 only (`This is our world now... ...the beauty of the baud.`) — fully wholesome, the default.
- **REGULAR (1.5×)** — + the belonging line, truncated at its ellipsis to omit "and you call us criminals": `We exist without skin color, without nationality, without religious bias...`
- **HOTSHOT (2.25×)** — + `Yes, I am a criminal. My crime is that of curiosity.` (from excerpt 3).
- **WIZARD (3.5×)** — the near-**entire** closing passage (Trevor, 2026-07-28: "the wizard level could just have the entire line"). WIZARD becomes its own ordered set: excerpt 1, the **full** belonging line (excerpt 2, restoring "…and you call us criminals"), then excerpt 3 in order EXCEPT its opening violence sentence — `Yes, I am a criminal. My crime is that of curiosity.` / `My crime is that of judging people by what they say and think, not what they look like.` / `My crime is that of outsmarting you, something that you will never forgive me for.` / `I am a hacker, and this is my manifesto.` / `You may stop this individual, but you can't stop us all... after all, we're all alike.` (introduces the straight-apostrophe tokens `can't`/`we're`, typeable via the Level-23 key).

The single heavier sentence — `You build atomic bombs, you wage wars, you murder, cheat,
and lie…` — is **intentionally omitted at every tier, including WIZARD** (kid-safety, even
on the top opt-in rung). The self-declared-"criminal" content is gated to **HOTSHOT+** (a
strong opt-in tier, never a young beginner's default); WIZARD is the adult/expert rung
("ages with the player", product.md §Word Length). See [[hacker-culture]] ("Part 2 — The
1970s–90s Underground") for the batch this extends.

### Typeability notes for the game

- **Ellipses are three literal ASCII periods (`...`), not a single Unicode ellipsis
  character (`…`).** Phrack's own primary-source page, fetched directly, uses three
  periods. One secondary reproduction (Schneier on Security's blog) renders them as a
  single `…` character — that's a typographic/CMS rendering choice on a modern blog,
  not evidence about the original 1986 plain-text file, which (as a BBS-distributed
  ASCII phile) could not have contained a Unicode ellipsis character at all. **Use
  three periods.**
- **All three excerpts are fully typeable at Level 25** using only letters, spaces,
  commas, and periods, EXCEPT:
  - Excerpts 2 and 3 both start with a capitalized word ("We", "You"/"Yes") and
    contain internal capitals ("I", "My") — **Shift** (taught Level 24) is required
    throughout, same as any capitalized sentence.
  - **Excerpt 3 contains three straight apostrophes**: "it'**s**", "can'**t**", and
    "we'**re**". The apostrophe key is taught at **Level 23**, already unlocked by
    Level 25 — typeable, but flag that the game must render a **straight ASCII
    apostrophe (`'`)**, not a curly/smart quote (`'`); some modern web
    reproductions of this text auto-convert to smart quotes, but the original
    plain-text phile (and the game's own apostrophe key) only produces straight
    quotes.
  - **No em dashes, colons, semicolons, or parentheses appear in any of the three
    excerpts** — clean for a Level 25 (Space/Backspace) typing target.
  - **The `+++The Mentor+++` signature line, if ever considered, contains `+`
    characters that are NOT part of the curriculum at any level** (the closest
    taught symbol is `=` at Level 21, and Shift+`=` isn't a taught combination) —
    recommend treating the signature as decorative/display-only text, never
    player-typed.
- **Spelling variant flagged, not adopted:** one secondary source (Island in the Net)
  transcribes "skin colour" (British spelling); Phrack's own hosted primary-source
  page uses "skin **color**" (American spelling, consistent with Blankenship and
  Phrack both being American) — use "color."

### Which lines actually appear in the 1995 film *Hackers*

Confirmed via two independently-hosted sources describing the same detail (both
citing/mirroring the same underlying fact): the manifesto **is quoted several times
in the film**, read aloud during a scene — but in the film it's shown being read from
an issue of **2600 magazine**, not the historically accurate Phrack (Wikiquote's own
"Hackers (film)" page does not itself list the exact quoted film dialogue verbatim,
so the specific in-film wording/character delivering it is not independently
confirmed by this pass — treat "the manifesto is quoted in the film, misattributed to
2600 instead of Phrack" as the verified claim, not a verbatim film transcript).

## Kid-safety / framing note

**This is the most delicate topic in the batch — and doubly so now that Trevor has
decided to have the player TYPE excerpts of it verbatim for the Level 25 finale.** The
manifesto's own prose is teenage and melodramatic ("we explore… and you call us
criminals," "the crime is that of curiosity") — nothing violent or unsafe, but tonally
dramatic. For a HISTORY CARD (read-only, ~2 sentences), still recommend
**paraphrasing the sentiment, never quoting the dramatic lines directly**: something
like "a hacker once wrote a famous essay explaining that computer explorers were
curious, not bad — just people who loved learning how things work." For the
**Level 25 typing finale**, the calculus is different — the whole point is typing the
REAL text — but the excerpts should still be **difficulty-tier-gated**: excerpts 1 and
2 ("our world" / "we exist without...") are gentle and abstract enough for the default
experience; **excerpt 3 (the "criminals"/"curiosity" passage, which explicitly frames
the author as a self-declared "criminal" and references atomic bombs, war, and
murder in its lead-in sentence) should be gated to the highest opt-in difficulty tier
only** — consistent with how EXPERIENCE/difficulty tiers already gate other
harder-but-optional content (`.claude/rules/product.md` §Word Length), never the
default a young child hits by just playing normally.

## References

1. [Hacker Manifesto — Wikipedia](https://en.wikipedia.org/wiki/Hacker_Manifesto) — exact date written, author's real name and handle, LOD affiliation, first publication in Phrack Vol. 1 Issue 7, the core argument/motivation (including the direct response to *WarGames*'s public image of hackers), and confirmation that the manifesto "is quoted several times in the 1995 movie Hackers, although in the movie it is being read from an issue of the hacker magazine 2600, not the historically accurate Phrack." **[fetched]**
2. [Phrack Magazine: The Zine That Defined Hacker Writing — phreak.fm](https://phreak.fm/signals/phrack-magazine) — independently quotes the manifesto and confirms its Phrack Issue #7, Phile #3 placement, dated September 1986 in this source. **[fetched]**
3. [Hacker's Manifesto — Phrack, Issue 7, Phile 3 (phrack.org)](https://phrack.org/issues/7/3) — THE primary source; Phrack's own hosted copy of the original text, used this session to verify the exact wording/punctuation of all three excerpts above via targeted quote-verification requests. **[fetched]**
4. [1980s Hacker Manifesto — Schneier on Security](https://www.schneier.com/blog/archives/2026/01/1980s-hacker-manifesto.html) — independent corroboration of all three excerpts' wording; notably renders ellipses as a single `…` character rather than three ASCII periods — a modern typographic choice flagged above, not adopted. **[fetched]**
5. [The Hacker Manifesto – 8 January 1986 — Island in the Net](https://islandinthenet.com/hacker-manifesto/) — corroborates the "we exist without..." wording, but with a British-spelling "colour" variant not present in Phrack's own hosted text — flagged above, not adopted. **[fetched]**
6. [Hacker Manifesto — HandWiki](https://handwiki.org/wiki/Hacker_Manifesto) — independently-hosted corroboration of the film-quotation detail (mirrors Wikipedia's own text on this point). **[fetched]**

## Unsourceable / weakly-sourced items

The two founding-era sources disagree slightly on the exact 1986 publication month
(one implies mid-1986, the other states September 1986); the January 8, 1986
*writing* date is consistent across sources and is the date used in this page's
summary. The exact in-film dialogue/character delivering the manifesto reading in
*Hackers* (1995) was not independently confirmed this session (Wikiquote's own page
for the film does not list it) — only the fact that the film quotes the manifesto,
misattributed to 2600 instead of Phrack, is verified.
