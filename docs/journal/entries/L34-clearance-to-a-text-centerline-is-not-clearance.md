---
id: L34
kind: learning
title: Clearance to a text centerline is not clearance
found: 2026-07-12
session: 2026-07-12 wordgen/API session (Trevor's preview-screen report)
status: adopted
importance: medium
category: graphics
refs: [L28, L17]
---

**L34 — Clearance to a text centerline is not clearance.** The KNOW YOUR KEYS
screen's anti-collision guard reserved vertical space so the canvas reach-hint label
would clear the DOM header — but it budgeted to `labelY`, which is the label's
CENTER (`textBaseline: 'middle'`), not its top edge. Result: the label's top half
plus its 8–11px pulsing glow overlapped the legend row on EVERY level, and it shipped
because the two lines still *read* as two lines in a quick glance — only Trevor's
slower human look caught the collision. The rule: when reserving space against
canvas text, budget to the glyph BOX, not the anchor point — half the font size on
each side of a `'middle'` baseline (the full size below an `'alphabetic'` one) PLUS
any shadowBlur/glow, which renders outside the glyph box entirely. Same family as
L28 (text state is never what you assume) — the anchor semantics of `fillText` are
part of the geometry, not a styling detail. Fix: `labelPad = ceil(fontSize/2) + 12`
added to the reserved band in js/ui/keyboard-preview.js. (→ L28, L17)
