---
title: 12-Hour vs 24-Hour Clocks on 1990s Screens
type: concept
tags: [computing-history, era-accuracy, ui, easter-egg]
level: 20
sources: 10
verified: 2026-09-18
---

**Was `11:59 PM` or `23:59` what a US screen actually showed at the end of 1999?** The
answer, from the platform documentation itself, is that **the clock format was never a
property of the screen — it was a property of the LOCALE**, on every platform, and the
US locale is a 12-hour AM/PM locale. MS-DOS and the Windows command prompt had **no
24-hour convention of their own**: Microsoft's own `time` documentation says the display
*"depend[s] on the Country/Region selected."* The one genuine 24-hour convention in this
era belongs somewhere else — to **Unix and its logs**, where RFC 3164's syslog timestamp
is specified *"in a 24-hour format. Valid entries are between 00 and 23."* So a green
screen on a US consumer PC read `11:59 PM`; a green screen tailing a Unix server's
messages read `23:59`. **Both are era-correct. They are correct about different machines.**

## In this game

The Level 20 terminal's status corner is permanently frozen at **`12/31/99 11:59 PM`**
(`js/themes/terminal.js` `Y2K_CLOCK`; built 2026-09-11, `.claude/rules/easter-eggs.md`
§The Y2K clock). [[y2k-bug]] — the same moment told out loud as the Level 19 `y2k` card —
renders it **`12/31/99 23:59`**.

**Neither rendering had a source behind it until this page.** The easter-eggs rule called
the 12-hour form *"era-correct for a US late-90s monitor"* — a sentence written by the
builder that shipped the egg, ratifying its own choice; the wiki's `23:59` had no stated
justification at all and appears to be an incidental rendering choice. Trevor asked for
grounding before settling it (2026-09-17).

**Recommendation: keep `12/31/99 11:59 PM`.** Reasoning in §The recommendation below. The
strongest argument is not nostalgia — it is that **the date half of the string is already
US-formatted**, and 12-hour/24-hour and MM/DD/YY come from the *same* locale record on
every platform documented here, so `12/31/99 23:59` is the one combination that is
internally inconsistent.

Related: [[y2k-bug]], [[unix-epoch-1970]], [[unix]].

## The facts

### 1. The format follows the locale — this is the load-bearing fact

- **Microsoft, `time` command reference:** *"You can change the **time** format by
  changing the setting in **Date and Time** in Control Panel. For just the MS-DOS
  subsystem, change the **country** setting in your Config.nt file. **Depending on the
  Country/Region selected, time is displayed in the 12-hour format or the 24-hour
  format.** If you are setting the time in the 12-hour format, specify **P** for hours
  after noon."*
- **MS-DOS 6.22's own help text** for `TIME` says the same thing in the era's words:
  *"Depending on the country code, MS-DOS will display the time in the 12-hour format or
  the 24-hour format."*
- The command itself accepts a 12-hour form: the `{A|P}` parameter *"Specifies A.M or
  P.M. for the 12-hour time format,"* and Microsoft's worked example is
  *"To set your computer clock to 1:36 P.M., type either of the following commands:
  `time 13:36` / `time 1:36P`."*

**⚠️ This directly answers the "do terminals use 24-hour?" question for the
DOS/Windows family: no. The command line inherited the OS locale like everything else.**
There was no console convention overriding it.

### 2. The Windows locale model spells 12-hour out by name

- **`LOCALE_ITIME`** (Microsoft's NLS documentation): value **`0` = "AM/PM 12-hour
  format"**, value **`1` = "24-hour format."**
- **`LOCALE_ITIMEMARKPOSN`**: *"Specifier indicating whether the time marker string
  (**AM or PM**) precedes or follows the time string."*
- In the registry (`HKEY_CURRENT_USER\Control Panel\International`) the 12-hour long-time
  string is **`sTimeFormat = h:mm:ss tt`**, with **`s1159 = AM`** and **`s2359 = PM`** —
  `tt` being the AM/PM marker and lowercase `h` the 12-hour cycle.

### 3. The US region is a 12-hour region, per the standards data

- **Unicode CLDR / LDML Part 4 (Dates)** carries per-region time-cycle preferences in its
  `timeData` element, and the United States sits in the 12-hour group:
  `hours preferred="h" allowed="H h" regions="AE AG AL … US … ZW"`. The spec's own rule:
  *"If the preferred hour symbol is 'h' or 'K' then the format is 12 hour; otherwise it is
  24 hour. Formats with 'h' or 'K' must also include a field with one of the day period
  pattern characters: 'a', 'b', or 'B'"* — i.e. a US time format is 12-hour **and carries
  AM/PM**.
- ⚠️ **CLDR is modern data** (the project began in the 2000s) describing a durable
  cultural convention, not a snapshot of 1999 defaults. It is cited here as evidence of
  *what the US locale is*, alongside the Microsoft documentation that shows *how a 1990s
  machine consumed a locale*.

### 4. The US date half comes from the same locale record

- Wikipedia's *Date format by country* table marks the United States **MDY: Yes / DMY: No
  / YMD: No** — month-day-year, which is what `12/31/99` is.
- Microsoft's `time` reference (above) points at a **single** `country` setting in
  `Config.nt` / a single Control Panel pane governing the format. **Date order and clock
  cycle are two fields of one locale record, not independent choices.** Apple's structure
  is the same: the classic Mac OS `'itl0'` resource holds `dateOrder`, `shrtDateFmt`,
  `timeCycle`, `mornStr` and `eveStr` in **one** record (below).

### 5. Apple's side: the mechanism is confirmed, the default is not

- **Inside Macintosh: Text**, the numeric-format (`'itl0'`) resource — Apple's own
  developer documentation — defines `timeCycle: Byte {time cycle:0-23, 0-11, or 12-11}`
  with constants **`timeCycle24 = 0`** (*"Use 24-hour format"*), **`timeCycleZero = 1`**
  and **`timeCycle12 = 255`** (*"Use A.M./P.M. format"*), plus **`mornStr`** — *"A string
  of up to 4 bytes to follow the time to indicate morning (for example, `" AM"`)"* — and
  **`eveStr`** for `" PM"`. Same model as Windows: a per-locale switch with AM/PM strings
  hanging off it.
- **⚠️ NOT ESTABLISHED: what a US-locale Mac OS 8/9 menu-bar clock showed out of the
  box.** Apple's developer documentation describes the mechanism but states no US default,
  and no fetchable Apple manual or archived screenshot for Mac OS 8/9 was obtained this
  session (O'Reilly's *Mac OS 9: The Missing Manual* chapter and Apple's legacy-doc mirror
  both returned HTTP 403). The Date & Time control panel with a Menubar Clock option
  existed from System 7.5 through Mac OS 9.2.2, and it exposed time-format options — that
  much is corroborated but weakly sourced. **Treat "the Mac defaulted to AM/PM" as
  plausible and unverified.**

### 6. The genuine 24-hour convention: Unix, and logs

- **RFC 3164, *The BSD syslog Protocol*** (August 2001; explicitly *documenting observed
  existing practice*, not proposing something new): the `TIMESTAMP` field is
  *"the local time and is in the format of `Mmm dd hh:mm:ss`"*, and **"The hour (hh) is
  represented in a 24-hour format. Valid entries are between 00 and 23, inclusive."**
- This is the one place in the era where a screen full of green text genuinely does not
  care what country you are in. A Unix console, a syslog tail, an ISO-8601 stamp — 24-hour,
  by specification. **A late-90s server room is exactly where you would see it.**

### 7. Contemporaneous how-tos point the same direction — but only by implication

- A Windows 98 walkthrough instructs: *"To change the display of the clock on the taskbar
  to 24-hour format: … Select the **Time** tab … In the **Time style** section select
  **HH:mm:ss**."* It gives no instruction for the reverse.
- A Windows 98 training module: *"You need to have `t` or `tt` at the end of your time
  style for these symbols to appear in the clock on the taskbar"* — i.e. AM/PM is a
  property of the format string, present by default in `h:mm:ss tt`.
- **⚠️ INFERENCE, FLAGGED AS SUCH: neither page states the default.** They document
  changing *to* 24-hour and never *from* it, which is what you would expect if 12-hour
  were the shipped state — but that is reading the silence. The **sourced** chain is
  §1 + §2 + §3: the format follows the locale, the locale model names 12-hour AM/PM, and
  the US is a 12-hour region.

## The recommendation

**Keep `12/31/99 11:59 PM` in `js/themes/terminal.js`, and change
[[y2k-bug]]'s `23:59` to match.** Four reasons, strongest first:

1. **Internal consistency beats platform trivia.** `12/31/99` is a US-locale date, and on
   every platform documented here the date order and the clock cycle live in **one**
   locale record (§4). `12/31/99 23:59` is a US date wearing a non-US clock — a mismatch
   no single machine of the era would have produced by default. This is the argument that
   actually settles it, and it is sourced.
2. **The command line is not evidence for 24-hour on a DOS/Windows machine** (§1). The
   old justification ("era-correct for a US late-90s monitor") was unsourced but has
   turned out to be **defensible on the DOS/Windows side** for a reason its author did not
   give: Microsoft's own documentation says the console follows the Country/Region
   setting.
3. **The egg's audience is a US parent remembering a taskbar, not an admin remembering a
   syslog.** `.claude/rules/easter-eggs.md` states its purpose plainly: *"For the parents
   who remember."* What that generation watched tick over at midnight was a consumer
   clock.
4. **`11:59 PM` is legible to a five-year-old; `23:59` requires 24-hour arithmetic the
   game has not taught.** Act 4 is the numbers act, but nothing in the curriculum
   introduces a 24-hour clock, and the One Rule's spirit (never make the child feel
   behind) argues for the form they can read.

**The honest counter-argument, recorded rather than buried:** the scene is a **server
room** (`.claude/rules/levels/act4.md`), and a real late-90s server console tailing logs
would show 24-hour by specification (§6). If the terminal is ever re-framed as a Unix
machine rather than the room's own PC-lineage console, `23:59` becomes the better answer
and this recommendation should flip. **The evidence does not make one form "wrong" — it
makes each form a statement about which machine you are looking at.** The choice is
therefore a design decision with a factual floor, which is exactly what Trevor asked for.

**Do NOT "fix" this by showing `23:59 PM` or `11:59` without a marker.** CLDR's rule (§3)
is that a 12-hour format must carry a day-period marker, and a 24-hour format must not.

## References

1. [Time — Microsoft Learn (Windows command reference, archived)](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-xp/bb491015(v=technet.10)) —
   PRIMARY vendor documentation. The `{A|P}` 12-hour parameter, the `time 1:36P` example,
   and the decisive sentence *"Depending on the Country/Region selected, time is displayed
   in the 12-hour format or the 24-hour format."* **[fetched]**
2. [MS-DOS 6.22 Help: TIME](https://www.infania.net/misc/dos622help/time.html) —
   the era's own help text, mirrored: *"Depending on the country code, MS-DOS will display
   the time in the 12-hour format or the 24-hour format."* A mirror of Microsoft's shipped
   help, not Microsoft's own host — corroborating, not primary. **[fetched]**
3. [LOCALE_ITIME — MicrosoftDocs/win32 (source of learn.microsoft.com)](https://raw.githubusercontent.com/MicrosoftDocs/win32/docs/desktop-src/Intl/locale-itime.md) —
   PRIMARY. **`0` = "AM/PM 12-hour format", `1` = "24-hour format."** **[fetched]**
4. [LOCALE_ITIMEMARKPOSN — Microsoft Learn (Win32 NLS)](https://learn.microsoft.com/en-us/windows/win32/intl/locale-itimemarkposn) —
   PRIMARY. *"the time marker string (AM or PM)"* — confirms AM/PM as the Windows time
   markers and that the 12-hour form is a first-class locale concept. **[fetched]**
5. [HKEY_CURRENT_USER\Control Panel\International — renenyffenegger.ch](https://renenyffenegger.ch/notes/Windows/registry/tree/HKEY_CURRENT_USER/Control-Panel/International/index) —
   community reference: `sTimeFormat = h:mm:ss tt`, `s1159 = AM`, `s2359 = PM`, and that
   `tt` *"changes hour to 12-format."* ⚠️ **Explicitly does NOT state en-US defaults** —
   cited for the shape of the settings, never for the default. **[fetched]**
6. [Unicode Locale Data Markup Language (LDML) Part 4: Dates — unicode.org / CLDR](https://unicode-org.github.io/cldr/ldml/tr35-dates.html) —
   standards document. The `timeData` region list placing **US** under
   `preferred="h"` (12-hour), and the rule that an `h`/`K` format must carry a day-period
   marker. ⚠️ Modern data describing a durable convention, not a 1999 snapshot.
   **[fetched]**
7. [RFC 3164 — The BSD syslog Protocol (IETF)](https://www.rfc-editor.org/rfc/rfc3164.txt) —
   PRIMARY standards document, August 2001, documenting long-standing practice.
   `TIMESTAMP` = `Mmm dd hh:mm:ss`; *"The hour (hh) is represented in a 24-hour format.
   Valid entries are between 00 and 23, inclusive."* The source for the genuine 24-hour
   convention, and for why it belongs to Unix rather than to "terminals." **[fetched]**
8. [Inside Macintosh: Text — The Intl0Rec Data Type (`'itl0'`), Apple developer documentation (archive mirror)](https://developer.apple.com/library/archive/documentation/mac/Text/Text-543.html) —
   PRIMARY (Apple). The full `Intl0Rec` record: `timeCycle` with `timeCycle24 = 0` /
   `timeCycleZero = 1` / `timeCycle12 = 255`, and `mornStr` / `eveStr` (*"for example,
   `" AM"`"* / `" PM"`), alongside `dateOrder` and `shrtDateFmt` **in the same record** —
   the source for §4's "one locale record" point. **[fetched]**
9. [Windows 98, Getting Started: Set the System Time, Date and Time Zone — HelpWithWindows.com](https://www.helpwithwindows.com/windows98/start-04.html) —
   contemporaneous-style walkthrough: *"To change the display of the clock on the taskbar
   to 24-hour format … In the **Time style** section select **HH:mm:ss**."* ⚠️ Cited only
   as the INFERENCE in §7 — it does not state the default. **[fetched]**
10. [Date format by country — Wikipedia](https://en.wikipedia.org/wiki/Date_format_by_country) —
    the United States marked **MDY: Yes, DMY: No, YMD: No**, supporting that `12/31/99` is
    a US-locale date string. One of several, never alone. **[fetched]**

## See also

[[y2k-bug]] — the moment itself, the Level 19 card, and the page whose `23:59` this one
recommends changing.
[[unix-epoch-1970]] — the other "how machines keep time" page; the counting convention
underneath every clock above.
[[windows-95-launch-1995]] — the consumer machine whose taskbar clock this page is
ultimately describing.

## Corrections from citation pass (2026-09-18)

- **`.claude/rules/easter-eggs.md`'s "era-correct for a US late-90s monitor" was
  unsourced** — written by the builder that shipped the egg. It survives this pass, but
  for a reason it never gave: Microsoft's `time` documentation states the console format
  follows the Country/Region setting, and the US locale is a 12-hour locale. **Flagged
  downstream: the sentence should cite this page rather than assert on its own authority.**
- **[[y2k-bug]]'s `12/31/99 23:59` has no justification and should change to
  `12/31/99 11:59 PM`** — see §The recommendation. Flagged there too.
- **"Terminals used 24-hour" is half true and was worth checking.** It is true of Unix and
  of syslog by specification (§6) and **false of the DOS/Windows command line**, which had
  no convention of its own (§1). A blanket statement either way would have been wrong.

## Unsourceable / weakly-sourced items

- **The out-of-the-box Windows 95/98 US-locale taskbar clock format.** Inferred from the
  locale model + CLDR region data + how-tos that only document changing *to* 24-hour. No
  Microsoft page fetched this session states the en-US default string literally. **Strong
  inference, not a quotation.**
- **The out-of-the-box Mac OS 8/9 US menu-bar clock format.** Mechanism confirmed from
  Apple's own docs; the default is **not confirmed** (§5). O'Reilly's *Mac OS 9: The
  Missing Manual* Date & Time chapter and `developer.apple.com`'s Text-542 page both 403'd
  or returned no usable body.
- **MS-DOS country code 001 (United States) time-format table row.** Search summaries
  consistently report `mm-dd-yy` and a 12-hour `5:35:00.00p` example for country 001, but
  every page carrying the table failed to fetch (techhelpmanual.com had a TLS
  certificate-name mismatch; computerhope.com 403'd; the FreeDOS `country.sys` page's
  table carries **codepages only**, no formats — verified by fetch). **Not asserted.** The
  §1 sources establish the mechanism without needing the table.
- **BIOS setup-screen clock conventions.** Not researched; no source found or sought. BIOS
  setup utilities were vendor-specific and are not evidence for anything on this page.
