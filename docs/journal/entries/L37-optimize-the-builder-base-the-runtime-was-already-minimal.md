---
id: L37
kind: learning
title: In a multi-stage build, the heavy download is the builder — not the runtime
found: 2026-07-13
session: 2026-07-13 docker-build slimming
status: adopted
importance: medium
category: tooling
refs: []
---

**L37 — In a multi-stage build, the heavy download is the builder base, not the
runtime; and "just use alpine" is only half the answer.** `make docker-build` pulled
~1GB of layers and read as a bloated image — but the final image was already 22.6MB
(a static Go binary on `gcr.io/distroless/static-debian12`, ~2MB base). The weight was
entirely the BUILD stage: `FROM golang:1.26` is the full Debian toolchain image
(~1.1GB). Fix: `FROM golang:1.26-alpine` (~250MB) — a ~4× smaller download for zero
output change. It's zero-change specifically because the build already sets
`CGO_ENABLED=0`: with cgo off the compiler emits a fully static binary and never links
the builder's libc, so musl-vs-glibc in the builder is invisible to the artifact
(also: `.dockerignore` keeps `.git` out of context, so the slim builder needs no
git/VCS-stamping toolchain either). Rules that generalize: (1) when an image "feels
huge," measure the FINAL image before optimizing — the fix is usually in a stage that
never ships; (2) a static-binary runtime should stay on `distroless/static`, not
alpine — distroless is SMALLER (~2MB vs alpine's ~5–8MB busybox+apk) AND lower attack
surface (no shell, no package manager), so the reflexive "use alpine to shrink it"
applies to the builder, while the runtime wants distroless. Verified: alpine builder
compiles, final image unchanged at 22.6MB, container serves HTTP 200 with the game
intact.
