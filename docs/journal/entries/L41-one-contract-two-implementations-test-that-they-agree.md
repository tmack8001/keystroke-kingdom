---
id: L41
kind: learning
title: One validation contract implemented twice — test that the two copies agree
found: 2026-07-14
session: 2026-07-14 Act 6 Text Worlds — the IM-friend (world 5)
status: adopted
importance: medium
category: engine
refs: [L39, O18]
---

**L41 — When the same validation contract is enforced in two languages/layers, the copies
drift silently; a unit test that pins their agreement is what catches it.** The IM-friend's
persona free-text fields (name / what-it-loves) are charset-allowlisted in TWO places by
design (defense in depth + client-preview parity): the client `personas.sanitizeField`
(`.replace(/[^a-zA-Z ]+/g, ' ')` → collapse → cap) and the server `main.go
sanitizeChatField`. I wrote the Go copy to *drop* disallowed runes; the JS copy *replaced*
them with a space. Both "allowlist to letters+spaces" — but `"Rex.Dog"` became `"RexDog"`
server-side and `"Rex Dog"` client-side. Harmless here (the make-a-friend flow's live input
only accepts letters/spaces, so punctuation only reaches the field via tampered
localStorage, which the server re-sanitizes anyway) — but it's exactly the class of drift
that becomes a real bug the day a second caller feeds the field raw. It surfaced only
because a Go unit table-test asserted the *exact* output string, not just "no bad chars
survive". Rules that generalize: (1) if a contract is implemented more than once, write a
test that pins the SHARED behavior to the same expected value on each side — assert the
output, not just the invariant, so the two implementations can't diverge unnoticed. (2)
Prefer stating the contract once where practical; when you can't (client JS + server Go
here, a genuine boundary), make the duplication explicit in comments on BOTH copies and
point each at the other. (3) The security posture didn't depend on the copies matching — the
server is authoritative and re-sanitizes — but *consistency between preview and server*
did, and consistency bugs hide precisely where each copy looks locally correct. Same shape
as O18 (documented intent drifts until something executes it): a second implementation is
just documentation in another language, and drifts the same way until a test executes both.
(→ L39, O18)
