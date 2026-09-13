package main

import (
	"encoding/json"
	"strings"
	"testing"
)

// Enforces: .claude/rules/security.md rule 7 — "the kid-safety word blocklist is
// defined in ONE file, js/word-blocklist.json, read by BOTH languages … No
// hard-coded copy exists in either language" — and journal L41 (where a contract is
// implemented twice, pin agreement with a test asserting identical output).
//
// WHY THIS FILE EXISTS: on 2026-09-11 a review found main.go carrying a SECOND,
// hard-coded blocklist literal that was the ONLY safety gate on the /api/wordgen
// generated-word path. It had drifted from the JSON floor: bitch, booze, liquor,
// murder, suicide, vodka and whiskey passed isBlocked entirely and were spellable
// from Level 9 (whiskey) onward, so a generated word could reach a child as a
// typing prompt. The drift survived because nothing asserted the relationship.
// These tests are that assertion.

// readBlocklistFloor parses the embedded single-source-of-truth file the same way
// the client's js/word-blocklist.js does. Intentionally re-parses rather than
// reading chatWordBlocklist, so a bug in the loader cannot hide itself.
func readBlocklistFloor(t *testing.T) []string {
	t.Helper()
	var parsed struct {
		Words []string `json:"words"`
	}
	if err := json.Unmarshal(blocklistJSON, &parsed); err != nil {
		t.Fatalf("js/word-blocklist.json does not parse: %v", err)
	}
	out := []string{}
	for _, w := range parsed.Words {
		if w = strings.ToLower(strings.TrimSpace(w)); w != "" {
			out = append(out, w)
		}
	}
	if len(out) == 0 {
		t.Fatal("js/word-blocklist.json parsed to an EMPTY floor — the safety list is the floor, not a suggestion")
	}
	return out
}

// The regression gate for the drift itself: EVERY word in the shared floor must be
// rejected on the wordgen path, not just on the chat path.
func TestIsBlockedCoversEntireSharedFloor(t *testing.T) {
	missed := []string{}
	for _, w := range readBlocklistFloor(t) {
		if !isBlocked(w) {
			missed = append(missed, w)
		}
	}
	if len(missed) > 0 {
		t.Errorf("isBlocked (the /api/wordgen safety gate) lets %d floor word(s) through to a child: %s\n"+
			"The floor in js/word-blocklist.json is the single source of truth (security.md rule 7) — "+
			"isBlocked must consult chatWordBlocklist, not only its substring extras.",
			len(missed), strings.Join(missed, ", "))
	}
}

// The chat/coda path must cover the same floor. Same contract, other consumer —
// asserted here too so a future change to either gate cannot quietly diverge.
func TestChatOutputOKRejectsEntireSharedFloor(t *testing.T) {
	for _, w := range readBlocklistFloor(t) {
		if chatOutputOK("the " + w + " is here") {
			t.Errorf("chatOutputOK allowed shared-floor word %q through", w)
		}
	}
}

// The floor must additionally survive being embedded inside a compound token — a
// generated word like "zig-vodka" is one wordgen "word" but two letter-tokens.
func TestIsBlockedCatchesFloorWordInsideCompound(t *testing.T) {
	for _, w := range []string{"vodka", "whiskey", "murder"} {
		if !isBlocked("zig-" + w) {
			t.Errorf("isBlocked missed floor word %q inside a compound token", w)
		}
	}
}

// The additive substring layer must not be lost while unioning in the floor: these
// are words the Go literal uniquely catches (they are not in the JSON floor), plus
// the inflection behavior that is the whole reason a substring layer exists here.
func TestIsBlockedKeepsSubstringExtras(t *testing.T) {
	uniqueToExtras := []string{
		"ass", "arse", "crap", "butt", "fart", "poop", "pee", "died",
		"hate", "war", "piss", "cock", "boob", "tit", "slut", "whore",
	}
	for _, w := range uniqueToExtras {
		if !isBlocked(w) {
			t.Errorf("isBlocked lost substring-extra coverage for %q", w)
		}
	}
	// Inflections: exact-word matching alone would miss these.
	for _, w := range []string{"killing", "guns", "deadly", "warlike"} {
		if !isBlocked(w) {
			t.Errorf("isBlocked lost inflection coverage for %q (substring layer)", w)
		}
	}
}

// Fail closed, never open. A parseable-but-gutted blocklist file must stop the
// server serving ANY generated content rather than serving it unfiltered.
func TestSafetyFloorFailsClosedWhenBlocklistIsGutted(t *testing.T) {
	if !safetyFloorReady() {
		t.Fatal("precondition: the shipped js/word-blocklist.json should load a sane floor")
	}

	origJSON := blocklistJSON
	origMap := chatWordBlocklist
	origLoaded := safetyFloorLoaded
	t.Cleanup(func() {
		blocklistJSON = origJSON
		chatWordBlocklist = origMap
		safetyFloorLoaded = origLoaded
	})

	for _, gutted := range []string{`{"words":[]}`, `{"words":["sex"]}`, `{ not json at all`} {
		blocklistJSON = []byte(gutted)
		chatWordBlocklist = map[string]bool{}
		safetyFloorLoaded = false
		loadChatWordBlocklist()

		if safetyFloorReady() {
			t.Errorf("safetyFloorReady() true for a gutted blocklist %q — that fails OPEN", gutted)
			continue
		}
		if got := validateWords([]string{"dad", "sad", "lad"}, wordgenParams{}); len(got) != 0 {
			t.Errorf("validateWords served %v with no safety floor (%q) — must serve nothing", got, gutted)
		}
		if chatOutputOK("a perfectly nice sentence") {
			t.Errorf("chatOutputOK passed model text with no safety floor (%q) — must fail closed", gutted)
		}
	}
}

// A sane floor must still actually be installed after the gutted cases above
// restore it — i.e. loadChatWordBlocklist is idempotent and recovers.
func TestSafetyFloorReloadsCleanly(t *testing.T) {
	loadChatWordBlocklist()
	if !safetyFloorReady() {
		t.Fatal("the shipped blocklist did not reload into a sane floor")
	}
	if !isBlocked("whiskey") {
		t.Error("regression: 'whiskey' (a floor word) is not blocked on the wordgen path")
	}
}
