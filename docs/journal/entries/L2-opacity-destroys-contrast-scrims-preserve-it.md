---
id: L2
kind: learning
title: Element opacity destroys contrast by design; scrims preserve it
found: 2026-07-11
session: 2026-07-10 → 2026-07-11 mega-build (prepopulated)
status: adopted
importance: high
category: a11y
refs: [F3]
---

**L2 — Element opacity destroys contrast by design; scrims preserve it.** The HUD's
`opacity: 0.5` halved every contrast ratio. The fix that took measured element-contrast
FAIL from 72.7% → 2.6%: translucent dark scrim panels + full-opacity muted colors.
"Dim, never looming" is a color choice, not an alpha choice. (→ F3)
