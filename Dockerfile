# Keystroke Kingdom — portable server image
#
# Multi-stage: the Go builder compiles the single static binary (index.html,
# css/, js/ are embedded at compile time via go:embed), so the runtime stage
# needs ONLY the binary. The server talks plain HTTP to Ollama (no TLS), so
# distroless/static suffices — no libc, no certs required for our own calls.
#
#   docker build -t keystroke-kingdom .
#   docker run --rm -p 8080:8080 keystroke-kingdom
#   # with the host machine's Ollama (Docker Desktop):
#   docker run --rm -p 8080:8080 -e OLLAMA_HOST=host.docker.internal:11434 keystroke-kingdom

# ── Build stage ───────────────────────────────────────────────────────────
# go.mod pins go 1.26.2; the golang:1.26-alpine tag tracks the latest 1.26.x
# patch (Go's toolchain auto-download covers any gap during the build).
#
# Alpine (musl, ~250MB) over the Debian golang image (~1GB): with CGO_ENABLED=0
# the compiler emits a fully static binary and never links the builder's libc,
# so the smaller base changes the download, not the output. No .git is copied
# (see .dockerignore), so no git/VCS-stamping toolchain is needed in the builder.
FROM golang:1.26-alpine AS build
WORKDIR /src

# Only what the build needs: module file, source, and the embedded asset dirs
# (see the go:embed directives in main.go: index.html, all:css, all:js —
# js/ includes the generated wordgen-manifest.json, which is committed).
COPY go.mod ./
COPY main.go index.html ./
COPY css/ css/
COPY js/ js/

# Static binary: no cgo → runs on distroless/static (no libc).
ENV CGO_ENABLED=0
RUN go build -o /keystroke-kingdom .

# ── Runtime stage ─────────────────────────────────────────────────────────
FROM gcr.io/distroless/static-debian12:nonroot

COPY --from=build /keystroke-kingdom /keystroke-kingdom

# PORT switches the server to container mode: fixed port, binds all interfaces,
# skips the .dev-url write and browser-open (both dev-machine-only behaviors —
# nothing is ever written to the container filesystem, so read-only rootfs and
# the nonroot user both work).
ENV PORT=8080
EXPOSE 8080

USER nonroot
ENTRYPOINT ["/keystroke-kingdom"]
