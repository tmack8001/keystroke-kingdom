---
id: L29
kind: learning
title: "Theme layout contract: the UI owns the center; the theme owns the frame"
found: 2026-07-11
session: 2026-07-11 theme-space rework wave (Trevor's screenshot review)
status: adopted
importance: high
category: game-design
refs: [L17, L16, O5, O10]
---

**L29 — Theme layout contract: the UI owns the center; the theme owns the frame.**
Trevor's screenshot review found ten themes (9, 10, 13, 15, 16, 17, 22, 23, 24, 25)
composing focal art at canvas center — buried behind the prompt panel and keyboard
guide, leaving only empty margins visible ("these look so very strange... use of space
around the keyboard"). L17 ("never center") was necessary but not sufficient: the real
contract is positive, not just prohibitive — the stage IS the frame around the UI
(side margins, top band, the prompt/keyboard gap, bottom strip), and a theme must read
as a complete picture WITH the panels present. Ambient fill may pass behind panels;
focal content never. Codified with measured safe-zone fractions in
`.claude/rules/visual-validation.md` (screenshot check #5). Bonus: the constraint
produced better designs, not compromises — GoldenEye's empty corridor became Trevor's
4-player split-screen idea, whose quadrants land content exactly in the four visible
corners; Zelda's dungeon walls became the screen frame itself. (→ L16, L17, O5, O10)
