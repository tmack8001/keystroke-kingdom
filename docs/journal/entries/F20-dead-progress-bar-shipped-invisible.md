---
id: F20
kind: failure
title: A dead progress bar shipped and sat invisible for a whole session
found: 2026-06-25
session: 2026-07-11 transcript recon over past sessions (2026-06-22 → 2026-06-25)
status: addressed
importance: medium
category: tooling
addressed-by: Removed from HTML/CSS/hud.js; verified removed from current code during this recon
addressed-date: 2026-06-25
refs: [F5]
---

**F20 — A dead progress bar shipped and sat invisible for a whole session** — wired in
HTML/CSS/hud.js, permanently 0% width, spotted only when Trevor asked "what is this
grey line?" (Verified removed from current code during this recon.) Visual validation
checks presence, not absence-of-function. (→ F5's cousin)
