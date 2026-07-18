package main

import (
	"encoding/json"
	"net/http/httptest"
	"reflect"
	"strconv"
	"strings"
	"testing"
	"time"
)

// paramsFor builds the wordgenParams a request declaring exactly the manifest's
// own key set would produce — the common case, used by the validation-chain tests.
func paramsFor(lm levelManifest) wordgenParams {
	declared := map[rune]bool{}
	for _, k := range lm.Keys {
		for _, r := range strings.ToLower(k) {
			declared[r] = true
		}
	}
	return wordgenParams{level: "test", allowed: declared, sortedSet: sortedRuneSet(declared), lm: lm}
}

// withManifest swaps the package-level manifest for a test and restores it.
func withManifest(t *testing.T, m map[string]levelManifest) {
	t.Helper()
	old := manifest
	manifest = m
	t.Cleanup(func() { manifest = old })
}

// The validation chain is the security-critical gate: whatever the model returns,
// only words passing charset + length + blocklist + dedup ever reach a child.
func TestValidateWords(t *testing.T) {
	lm := levelManifest{
		Keys:   []string{"a", "s", "d", "f", "j", "k", "l", ";"}, // Level 4 key set (full home row)
		Sample: []string{"lads", "falls"},                        // static pool words to dedup against
	}

	cases := []struct {
		name string
		raw  []string
		want []string
	}{
		{
			name: "keeps in-charset early-reader words",
			raw:  []string{"dad", "flask", "sad"},
			want: []string{"dad", "flask", "sad"},
		},
		{
			name: "drops words with out-of-charset letters",
			raw:  []string{"dog", "sad", "cat"}, // o,g,c,t not unlocked at L4
			want: []string{"sad"},
		},
		{
			name: "enforces the length floor and the raised 24 ceiling",
			// 1 too short; 24 in-charset letters is AT the raised ceiling and
			// survives; 25 is one past it and is dropped.
			raw:  []string{"a", "ad", strings.Repeat("a", 24), strings.Repeat("a", 25)},
			want: []string{"ad", strings.Repeat("a", 24)},
		},
		{
			name: "lowercases before validating",
			raw:  []string{"SAD", "Flask"},
			want: []string{"sad", "flask"},
		},
		{
			name: "dedups within batch",
			raw:  []string{"sad", "sad", "fads"},
			want: []string{"sad", "fads"},
		},
		{
			name: "dedups against the static pool sample",
			raw:  []string{"lads", "falls", "salsa"},
			want: []string{"salsa"},
		},
		{
			name: "empty input yields empty (not nil-crash)",
			raw:  nil,
			want: []string{},
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := validateWords(tc.raw, paramsFor(lm))
			if !reflect.DeepEqual(got, tc.want) {
				t.Errorf("validateWords(%v) = %v, want %v", tc.raw, got, tc.want)
			}
		})
	}
}

func TestBlocklist(t *testing.T) {
	// Use a permissive key set so charset never masks the blocklist under test.
	lm := levelManifest{Keys: strings.Split("abcdefghijklmnopqrstuvwxyz", "")}

	blocked := []string{"hell", "kill", "gun", "shell"} // "shell" contains "hell"
	got := validateWords(blocked, paramsFor(lm))
	if len(got) != 0 {
		t.Errorf("expected all blocked, got %v", got)
	}

	// Innocent words with the same permissive charset must pass.
	ok := validateWords([]string{"apple", "table", "happy"}, paramsFor(lm))
	want := []string{"apple", "table", "happy"}
	if !reflect.DeepEqual(ok, want) {
		t.Errorf("innocent words: got %v, want %v", ok, want)
	}
}

func TestCap(t *testing.T) {
	lm := levelManifest{Keys: strings.Split("abcdefghijklmnopqrstuvwxyz", "")}
	raw := make([]string, 0, 40)
	// 40 distinct 2-letter words
	for a := 'a'; a <= 't'; a++ {
		raw = append(raw, string(a)+"x", string(a)+"y")
	}
	got := validateWords(raw, paramsFor(lm))
	if len(got) > maxWordsPerBatch {
		t.Errorf("batch not capped: got %d, want <= %d", len(got), maxWordsPerBatch)
	}
}

func TestCharsetOK(t *testing.T) {
	allowed := map[rune]bool{'a': true, 'b': true}
	if !charsetOK("ab", allowed) {
		t.Error("ab should be allowed")
	}
	if charsetOK("abc", allowed) {
		t.Error("abc should be rejected (c not allowed)")
	}
}

// The variability pass runs AFTER the safety chain and only ever drops words —
// it exists to stop batches dominated by one suffix or rhyme family.
func TestApplyVariability(t *testing.T) {
	cases := []struct {
		name   string
		words  []string
		sample []string
		want   []string
	}{
		{
			name:  "suffix cap: four -er words, first two survive",
			words: []string{"dryer", "tryer", "flyer", "crier", "dust"},
			want:  []string{"dryer", "tryer", "dust"},
		},
		{
			name: "rhyme-family cap: fry/dry/try share tail -ry, two survive",
			// sty rhymes too but has tail "ty" — the last-2-chars proxy keeps it,
			// which is the accepted precision of this simple mechanism.
			words: []string{"fry", "dry", "try", "sty", "dust", "toad"},
			want:  []string{"fry", "dry", "sty", "dust", "toad"},
		},
		{
			name:   "static-pool suffixes count against the cap",
			words:  []string{"fry", "dry", "dust"},
			sample: []string{"try", "sty"}, // pool already -ry/-ty heavy... tail "ry"+"ty"
			// sample seeds: ry=1 (try), ty=1 (sty) → fry brings ry to 2, dry over cap.
			want: []string{"fry", "dust"},
		},
		{
			name:  "length spread: 7 words all 3-4 letters trims to 6",
			words: []string{"cat", "dogs", "sun", "bird", "hat", "cow", "pig"},
			// tails all distinct → suffix cap keeps all 7; lengths 3-4 only → trim to 6.
			want: []string{"cat", "dogs", "sun", "bird", "hat", "cow"},
		},
		{
			name:  "length spread satisfied: 7 words with real spread all survive",
			words: []string{"cat", "dogs", "sun", "bird", "hat", "cow", "playing"},
			want:  []string{"cat", "dogs", "sun", "bird", "hat", "cow", "playing"},
		},
		{
			name:  "small uniform batch untouched",
			words: []string{"cat", "sun", "hat"}, // distinct tails, <=6 words
			want:  []string{"cat", "sun", "hat"},
		},
		{
			name:  "empty in, empty out",
			words: []string{},
			want:  []string{},
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := applyVariability(tc.words, levelManifest{Sample: tc.sample})
			if !reflect.DeepEqual(got, tc.want) {
				t.Errorf("applyVariability(%v) = %v, want %v", tc.words, got, tc.want)
			}
		})
	}
}

// ─── The /api/wordgen request contract (act + level + characters) ─────────

func TestParseWordgenParams(t *testing.T) {
	withManifest(t, map[string]levelManifest{
		"4": {Keys: []string{"a", "s", "d", "f", "j", "k", "l", ";"}, Sample: []string{"lads"}},
	})

	cases := []struct {
		name    string
		query   string
		wantTag string
	}{
		{"missing characters", "level=4", "bad-characters"},
		{"empty characters", "level=4&characters=", "bad-characters"},
		{"oversized characters", "level=4&characters=" + strings.Repeat("a", 41), "bad-characters"},
		{"out-of-superset rune", "level=4&characters=asd!", "bad-characters"},
		{"uppercase not in superset", "level=4&characters=ASDF", "bad-characters"},
		{"missing level", "characters=asdf", "bad-level"},
		{"unknown level", "level=99&characters=asdf", "bad-level"},
		{"act zero", "level=4&characters=asdf&act=0", "bad-act"},
		{"act six", "level=4&characters=asdf&act=6", "bad-act"},
		{"act non-numeric", "level=4&characters=asdf&act=x", "bad-act"},
		{"valid without act", "level=4&characters=asdf", ""},
		{"valid with act", "level=4&characters=asdf&act=1", ""},
		{"maxWordLength non-numeric", "level=4&characters=asdf&maxWordLength=x", "bad-maxwordlength"},
		{"maxWordLength zero", "level=4&characters=asdf&maxWordLength=0", "bad-maxwordlength"},
		{"maxWordLength negative", "level=4&characters=asdf&maxWordLength=-3", "bad-maxwordlength"},
		{"maxWordLength whitespace not trimmed", "level=4&characters=asdf&maxWordLength=%205%20", "bad-maxwordlength"},
		{"valid with maxWordLength in range", "level=4&characters=asdf&maxWordLength=5", ""},
		{"valid with maxWordLength above ceiling (clamped, not rejected)", "level=4&characters=asdf&maxWordLength=99", ""},
		{"valid with maxWordLength below floor (clamped, not rejected)", "level=4&characters=asdf&maxWordLength=1", ""},
		{"minWordLength non-numeric", "level=4&characters=asdf&minWordLength=x", "bad-minwordlength"},
		{"minWordLength zero", "level=4&characters=asdf&minWordLength=0", "bad-minwordlength"},
		{"minWordLength negative", "level=4&characters=asdf&minWordLength=-3", "bad-minwordlength"},
		{"minWordLength whitespace not trimmed", "level=4&characters=asdf&minWordLength=%205%20", "bad-minwordlength"},
		{"valid with minWordLength in range", "level=4&characters=asdf&minWordLength=4", ""},
		{"valid with minWordLength above ceiling (clamped, not rejected)", "level=4&characters=asdf&minWordLength=99", ""},
		{"valid with minWordLength below floor (clamped, not rejected)", "level=4&characters=asdf&minWordLength=1", ""},
		{"valid with both min and max declared", "level=4&characters=asdf&minWordLength=4&maxWordLength=10", ""},
		{"min>max is coerced (not rejected)", "level=4&characters=asdf&minWordLength=10&maxWordLength=4", ""},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			r := httptest.NewRequest("GET", "/api/wordgen?"+tc.query, nil)
			_, tag := parseWordgenParams(r)
			if tag != tc.wantTag {
				t.Errorf("query %q: tag = %q, want %q", tc.query, tag, tc.wantTag)
			}
		})
	}
}

// Hostile/edge-case query params — security.md rule 7's "symmetric" clause:
// inbound query params get the same structural scrutiny as the Ollama response.
func TestParseWordgenParamsHostileInputs(t *testing.T) {
	withManifest(t, map[string]levelManifest{
		"4": {Keys: []string{"a", "s", "d", "f", "j", "k", "l", ";"}},
	})

	t.Run("NUL byte in characters is rejected (outside typeable superset)", func(t *testing.T) {
		r := httptest.NewRequest("GET", "/api/wordgen?level=4&characters=%00asdf", nil)
		_, tag := parseWordgenParams(r)
		if tag != "bad-characters" {
			t.Errorf("tag = %q, want bad-characters", tag)
		}
	})

	t.Run("duplicate characters param: net/url takes the first occurrence", func(t *testing.T) {
		// Documents Go's own query-parsing contract (url.Values.Get returns the
		// first value) as the behavior this handler inherits — a duplicate
		// param can never smuggle a wider charset past the first declaration.
		r := httptest.NewRequest("GET", "/api/wordgen?level=4&characters=asdf&characters=jkl", nil)
		p, tag := parseWordgenParams(r)
		if tag != "" {
			t.Fatalf("unexpected error tag %q", tag)
		}
		if p.sortedSet != "adfs" {
			t.Errorf("sortedSet = %q, want %q (first occurrence only, jkl must not leak in)", p.sortedSet, "adfs")
		}
	})

	t.Run("path-traversal-shaped level value is just an unknown manifest key", func(t *testing.T) {
		r := httptest.NewRequest("GET", "/api/wordgen?level=../../etc/passwd&characters=asdf", nil)
		_, tag := parseWordgenParams(r)
		if tag != "bad-level" {
			t.Errorf("tag = %q, want bad-level", tag)
		}
	})

	t.Run("level as a huge string is rejected via manifest miss, not size-crash", func(t *testing.T) {
		r := httptest.NewRequest("GET", "/api/wordgen?level="+strings.Repeat("9", 10000)+"&characters=asdf", nil)
		_, tag := parseWordgenParams(r)
		if tag != "bad-level" {
			t.Errorf("tag = %q, want bad-level", tag)
		}
	})

	t.Run("act with leading/trailing whitespace is rejected, not silently trimmed", func(t *testing.T) {
		r := httptest.NewRequest("GET", "/api/wordgen?level=4&characters=asdf&act=%201%20", nil)
		_, tag := parseWordgenParams(r)
		if tag != "bad-act" {
			t.Errorf("tag = %q, want bad-act (strconv.Atoi does not tolerate whitespace)", tag)
		}
	})

	t.Run("characters containing only whitespace is within the typeable superset but empty of letters", func(t *testing.T) {
		// Space IS a legitimate taught key (Level 25), so a lone space is
		// structurally valid — the manifest intersection (below) is what
		// actually neuters it for levels that don't teach Space.
		r := httptest.NewRequest("GET", "/api/wordgen?level=4&characters=%20", nil)
		p, tag := parseWordgenParams(r)
		if tag != "" {
			t.Fatalf("unexpected error tag %q for a bare space character", tag)
		}
		if len(p.allowed) != 0 {
			t.Errorf("Level 4's manifest doesn't teach Space; effective allowlist should be empty, got %v", p.allowed)
		}
	})

	t.Run("extraneous unknown query params are ignored, not rejected", func(t *testing.T) {
		r := httptest.NewRequest("GET", "/api/wordgen?level=4&characters=asdf&foo=bar&debug=1", nil)
		_, tag := parseWordgenParams(r)
		if tag != "" {
			t.Errorf("unexpected params should be silently ignored, got tag %q", tag)
		}
	})
}

func TestParseWordgenParamsIntersection(t *testing.T) {
	withManifest(t, map[string]levelManifest{
		"4": {Keys: []string{"a", "s", "d", "f"}},
	})
	// Client declares a WIDER set than the manifest — effective allowlist must be
	// the intersection: a stale client can't widen the charset past the manifest.
	r := httptest.NewRequest("GET", "/api/wordgen?level=4&characters=asdfjkl", nil)
	p, tag := parseWordgenParams(r)
	if tag != "" {
		t.Fatalf("unexpected error tag %q", tag)
	}
	if p.sortedSet != "adfs" {
		t.Errorf("sortedSet = %q, want %q (characters ∩ manifest)", p.sortedSet, "adfs")
	}
	for _, ru := range "jkl" {
		if p.allowed[ru] {
			t.Errorf("rune %q leaked past the manifest intersection", string(ru))
		}
	}
	// And the mirror: a NARROWER declaration must narrow the allowlist.
	r = httptest.NewRequest("GET", "/api/wordgen?level=4&characters=ad", nil)
	p, _ = parseWordgenParams(r)
	if p.sortedSet != "ad" {
		t.Errorf("narrow declaration: sortedSet = %q, want %q", p.sortedSet, "ad")
	}
}

// maxWordLength is request-DECLARED but SUPERSET-BOUNDED: the effective per-word
// length cap is min(requested, maxPlayWordLen), floored at minPlayWordLen. Absent
// ⇒ default = maxPlayWordLen (current behavior). A stale/hostile client can never
// widen words past the play-logic ceiling.
func TestParseWordgenParamsMaxWordLength(t *testing.T) {
	withManifest(t, map[string]levelManifest{
		"4": {Keys: []string{"a", "s", "d", "f", "j", "k", "l", ";"}},
	})

	cases := []struct {
		name  string
		query string
		want  int
	}{
		{"absent ⇒ default is the play-logic ceiling", "level=4&characters=asdf", maxPlayWordLen},
		{"in-range value is honored verbatim", "level=4&characters=asdf&maxWordLength=5", 5},
		{"the old 12 ceiling is now an ordinary in-range value", "level=4&characters=asdf&maxWordLength=12", 12},
		{"the old 8 ceiling is now an ordinary in-range value", "level=4&characters=asdf&maxWordLength=8", 8},
		{"the new headroom value 10 is honored verbatim", "level=4&characters=asdf&maxWordLength=10", 10},
		{"at the raised WIZARD-equivalent ceiling (24) is honored", "level=4&characters=asdf&maxWordLength=24", maxPlayWordLen},
		{"above the raised ceiling is clamped DOWN (superset bound)", "level=4&characters=asdf&maxWordLength=99", maxPlayWordLen},
		{"below the floor is clamped UP to the floor", "level=4&characters=asdf&maxWordLength=1", minPlayWordLen},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			r := httptest.NewRequest("GET", "/api/wordgen?"+tc.query, nil)
			p, tag := parseWordgenParams(r)
			if tag != "" {
				t.Fatalf("unexpected error tag %q", tag)
			}
			if p.maxLen != tc.want {
				t.Errorf("effective maxLen = %d, want %d", p.maxLen, tc.want)
			}
		})
	}
}

// minWordLength is the SYMMETRIC floor sibling of maxWordLength (Trevor,
// 2026-07-13): request-DECLARED, superset-bounded into [minPlayWordLen,
// maxPlayWordLen]. Absent ⇒ default = minPlayWordLen (current behavior). A
// stale/hostile client can never push the floor outside the play-logic window.
func TestParseWordgenParamsMinWordLength(t *testing.T) {
	withManifest(t, map[string]levelManifest{
		"4": {Keys: []string{"a", "s", "d", "f", "j", "k", "l", ";"}},
	})

	cases := []struct {
		name  string
		query string
		want  int
	}{
		{"absent ⇒ default is the play-logic floor", "level=4&characters=asdf", minPlayWordLen},
		{"in-range value is honored verbatim", "level=4&characters=asdf&minWordLength=5", 5},
		{"at the floor is honored", "level=4&characters=asdf&minWordLength=2", minPlayWordLen},
		{"below the floor is clamped UP to the floor", "level=4&characters=asdf&minWordLength=1", minPlayWordLen},
		{"above the ceiling is clamped DOWN to the ceiling", "level=4&characters=asdf&minWordLength=99", maxPlayWordLen},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			r := httptest.NewRequest("GET", "/api/wordgen?"+tc.query, nil)
			p, tag := parseWordgenParams(r)
			if tag != "" {
				t.Fatalf("unexpected error tag %q", tag)
			}
			if p.minLen != tc.want {
				t.Errorf("effective minLen = %d, want %d", p.minLen, tc.want)
			}
		})
	}
}

// An inverted window (declared min > declared max, each independently clamped)
// must never empty every batch — the One Rule's winnability floor forbids it.
// The handler coerces the floor DOWN to the cap so the window is always
// non-empty (min == max at worst), never rejects the request.
func TestParseWordgenParamsMinExceedsMaxIsCoerced(t *testing.T) {
	withManifest(t, map[string]levelManifest{
		"4": {Keys: []string{"a", "s", "d", "f", "j", "k", "l", ";"}},
	})
	r := httptest.NewRequest("GET", "/api/wordgen?level=4&characters=asdf&minWordLength=10&maxWordLength=4", nil)
	p, tag := parseWordgenParams(r)
	if tag != "" {
		t.Fatalf("min>max must be coerced, not rejected; got tag %q", tag)
	}
	if p.maxLen != 4 {
		t.Errorf("maxLen = %d, want 4 (honored as declared)", p.maxLen)
	}
	if p.minLen != 4 {
		t.Errorf("minLen = %d, want 4 (coerced down to the cap so min<=max)", p.minLen)
	}
	// The effective window is [4,4] — non-empty, exactly-4-letter words only.
	if effectiveMinLen(p) > effectiveMaxLen(p) {
		t.Errorf("effective window inverted: [%d,%d]", effectiveMinLen(p), effectiveMaxLen(p))
	}
}

// The effective cap must reach BOTH the model prompt (adherence at the source)
// and validateWords (belt-and-braces enforcement — the model is never trusted).
func TestGeneratePromptIncludesEffectiveMaxLen(t *testing.T) {
	lm := levelManifest{Keys: []string{"a", "s", "d", "f"}, Sample: []string{"sad"}}
	p := wordgenParams{level: "4", allowed: map[rune]bool{'a': true, 's': true, 'd': true, 'f': true}, sortedSet: "adfs", lm: lm, maxLen: 5}
	prompt := buildGenPrompt(p)
	if !strings.Contains(prompt, "2 to 5 letters") {
		t.Errorf("prompt must tell the model the effective window (2 to 5 letters); got:\n%s", prompt)
	}
	if strings.Contains(prompt, "2 to 24 letters") {
		t.Errorf("prompt must NOT hardcode the ceiling when a smaller cap was declared")
	}

	// BOTH bounds reach the prompt window: a declared floor AND cap render as
	// "<min> to <max> letters" (adherence at the source for both ends).
	pBoth := wordgenParams{level: "4", allowed: p.allowed, sortedSet: "adfs", lm: lm, minLen: 4, maxLen: 10}
	if got := buildGenPrompt(pBoth); !strings.Contains(got, "4 to 10 letters") {
		t.Errorf("prompt must reflect BOTH declared bounds (4 to 10 letters); got:\n%s", got)
	}

	// A zero-value maxLen (direct callers / never through the HTTP path) falls
	// back to the raised play-logic ceiling (24) rather than emitting
	// "2 to 0 letters".
	p0 := wordgenParams{level: "4", allowed: p.allowed, sortedSet: "adfs", lm: lm}
	if got := buildGenPrompt(p0); !strings.Contains(got, "2 to 24 letters") {
		t.Errorf("zero-value maxLen must fall back to the raised ceiling (24) in the prompt; got:\n%s", got)
	}
}

// The prompt FRAMING ages with the player: WORD LENGTH is a difficulty lever, and
// the fixed "early-reader / a 5-year-old would recognize" framing was measured to
// SUPPRESS long words (the model obeyed the audience over the length rule). So a
// request whose floor forces long words must drop the early-reader framing and ask
// for harder vocabulary, while a default/short request keeps it. Safety and the
// charset rule are enforced downstream and must survive at every tier.
func TestGeneratePromptFramingAgesWithLength(t *testing.T) {
	lm := levelManifest{Keys: strings.Split("abcdefghijklmnopqrstuvwxyz", ""), Sample: []string{"cat"}}

	// Default/short floor → early-reader framing.
	young := paramsFor(lm)
	young.minLen, young.maxLen = 2, 8
	yp := buildGenPrompt(young)
	if !strings.Contains(yp, "young child learning to read") {
		t.Errorf("a short-floor request must keep the early-reader framing; got:\n%s", yp)
	}

	// High floor (only long words) → skilled framing, NO early-reader/5-year-old.
	hard := paramsFor(lm)
	hard.minLen, hard.maxLen = 12, 24
	hp := buildGenPrompt(hard)
	if strings.Contains(hp, "young child") || strings.Contains(hp, "5-year-old") || strings.Contains(hp, "early-reader") {
		t.Errorf("a long-floor request must DROP the early-reader framing (it suppresses long words); got:\n%s", hp)
	}
	if !strings.Contains(hp, "skilled") {
		t.Errorf("a long-floor request must ask for a harder/skilled challenge; got:\n%s", hp)
	}
	// Safety and the charset rule survive at every tier.
	for _, prompt := range []string{yp, hp} {
		if !strings.Contains(prompt, "nothing rude or scary") || !strings.Contains(prompt, "ONLY these letters") {
			t.Errorf("safety + charset rules must hold at every framing tier; got:\n%s", prompt)
		}
	}
}

// validateWords honors the effective cap: a word longer than the declared cap is
// dropped even when it is within the play-logic ceiling.
func TestValidateWordsHonorsEffectiveMaxLen(t *testing.T) {
	lm := levelManifest{Keys: strings.Split("abcdefghijklmnopqrstuvwxyz", "")}

	// Cap at 4: "flask" (5) is within the play-logic ceiling (8) but past the
	// declared cap and must be dropped; "dad" (3) survives.
	p := paramsFor(lm)
	p.maxLen = 4
	got := validateWords([]string{"dad", "flask", "table"}, p)
	if !reflect.DeepEqual(got, []string{"dad"}) {
		t.Errorf("maxLen=4: got %v, want [dad] (flask/table exceed the declared cap)", got)
	}

	// A zero-value maxLen (direct caller) falls back to the raised ceiling (24),
	// so a 24-letter word survives and a 25-letter one is dropped. "extraordinary"
	// (13, once past the old 12 ceiling) now clears it.
	p2 := paramsFor(lm)
	got2 := validateWords([]string{"flask", "extraordinary", strings.Repeat("a", 24), strings.Repeat("a", 25)}, p2)
	if !reflect.DeepEqual(got2, []string{"flask", "extraordinary", strings.Repeat("a", 24)}) {
		t.Errorf("default cap (24): got %v, want [flask extraordinary a*24] (a*25 exceeds the raised ceiling)", got2)
	}
}

// validateWords honors the effective FLOOR too: a word shorter than the declared
// minLen is dropped even when it clears the play-logic floor (2). The floor and
// cap together form the [min,max] window the harder-difficulty setting drives.
func TestValidateWordsHonorsEffectiveMinLen(t *testing.T) {
	lm := levelManifest{Keys: strings.Split("abcdefghijklmnopqrstuvwxyz", "")}

	// Floor at 5: "dad" (3) and "flask" (5) — dad is below the floor and dropped;
	// flask (exactly at the floor) survives; a longer word also survives.
	p := paramsFor(lm)
	p.minLen = 5
	got := validateWords([]string{"dad", "flask", "sandwich"}, p)
	if !reflect.DeepEqual(got, []string{"flask", "sandwich"}) {
		t.Errorf("minLen=5: got %v, want [flask sandwich] (dad is below the floor)", got)
	}

	// A full window [4,6]: only 4-6 letter words survive.
	p2 := paramsFor(lm)
	p2.minLen = 4
	p2.maxLen = 6
	got2 := validateWords([]string{"cat", "desk", "planet", "keyboards"}, p2)
	if !reflect.DeepEqual(got2, []string{"desk", "planet"}) {
		t.Errorf("window [4,6]: got %v, want [desk planet] (cat=3 short, keyboards=9 long)", got2)
	}

	// A zero-value minLen (direct caller) falls back to the play-logic floor (2),
	// so a 2-letter word survives — byte-identical to pre-minWordLength behavior.
	p3 := paramsFor(lm)
	got3 := validateWords([]string{"a", "ad", "sad"}, p3)
	if !reflect.DeepEqual(got3, []string{"ad", "sad"}) {
		t.Errorf("default floor: got %v, want [ad sad] (single-letter 'a' is below floor 2)", got3)
	}
}

func TestHandleWordgenBadRequestIs400(t *testing.T) {
	withManifest(t, map[string]levelManifest{"4": {Keys: []string{"a"}}})
	w := httptest.NewRecorder()
	handleWordgen(w, httptest.NewRequest("GET", "/api/wordgen?level=4", nil))
	if w.Code != 400 {
		t.Errorf("missing characters: status = %d, want 400", w.Code)
	}
	if !strings.Contains(w.Body.String(), "bad-characters") {
		t.Errorf("body = %q, want error tag bad-characters", w.Body.String())
	}
}

// The prefetch contract (js/wordgen.js's design comments): "?prefetch=1 warms
// the cache... returns {words:[]} immediately" — a prefetch request must NEVER
// hand back a ready batch, even if one is already cached, because the client
// treats prefetch responses as fire-and-forget and never reads their body for
// words (it does a follow-up plain GET to actually consume).
func TestHandleWordgenPrefetchNeverReturnsCachedWords(t *testing.T) {
	withManifest(t, map[string]levelManifest{
		"4": {Keys: []string{"a", "s", "d", "f"}},
	})
	ck := cacheKey("4", "adfs", minPlayWordLen, maxPlayWordLen)
	cacheSet(ck, []string{"dad", "sad"})
	t.Cleanup(func() { cacheClear(ck) })

	w := httptest.NewRecorder()
	handleWordgen(w, httptest.NewRequest("GET", "/api/wordgen?level=4&characters=asdf&prefetch=1", nil))

	var body struct {
		Words []string `json:"words"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("response not valid JSON: %v (%s)", err, w.Body.String())
	}
	if len(body.Words) != 0 {
		t.Errorf("prefetch=1 must always return words:[] regardless of cache state, got %v", body.Words)
	}
	// The cache must remain intact — prefetch warms/consults, never clears.
	if got := cacheGet(ck); len(got) != 2 {
		t.Errorf("prefetch must not clear the cache it found warm, got %v", got)
	}
}

// The consume contract: a plain GET (no prefetch param) that finds a ready
// batch returns it AND clears the cache entry (so the same batch is never
// served twice), then kicks a background refill.
func TestHandleWordgenConsumeClearsCache(t *testing.T) {
	withManifest(t, map[string]levelManifest{
		"4": {Keys: []string{"a", "s", "d", "f"}, Sample: []string{"sad"}},
	})
	ck := cacheKey("4", "adfs", minPlayWordLen, maxPlayWordLen)
	cacheSet(ck, []string{"dad", "fads"})
	t.Cleanup(func() { cacheClear(ck) })

	w := httptest.NewRecorder()
	handleWordgen(w, httptest.NewRequest("GET", "/api/wordgen?level=4&characters=asdf", nil))

	var body struct {
		Words []string `json:"words"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("response not valid JSON: %v (%s)", err, w.Body.String())
	}
	if !reflect.DeepEqual(body.Words, []string{"dad", "fads"}) {
		t.Errorf("expected the cached batch to be served once, got %v", body.Words)
	}

	// A second identical consume must NOT see the same batch again (cache was
	// cleared) — it may see a background refill's result or nothing, but
	// never the exact same words replayed, since ensureFill re-populates
	// asynchronously and the assertion window here is effectively immediate.
	cacheClear(ck) // remove any same-tick refill race for a deterministic check
	w2 := httptest.NewRecorder()
	handleWordgen(w2, httptest.NewRequest("GET", "/api/wordgen?level=4&characters=asdf", nil))
	var body2 struct {
		Words []string `json:"words"`
	}
	if err := json.Unmarshal(w2.Body.Bytes(), &body2); err != nil {
		t.Fatalf("response not valid JSON: %v (%s)", err, w2.Body.String())
	}
	if len(body2.Words) != 0 {
		t.Errorf("a cleared cache must serve an empty batch, not stale words, got %v", body2.Words)
	}
}

func TestCacheIsolationByCharset(t *testing.T) {
	withManifest(t, map[string]levelManifest{
		"4": {Keys: []string{"a", "s", "d", "f", "j", "k", "l"}},
	})
	// A batch generated for charset "adfs" must never serve a request declaring
	// a different charset — the cache key carries the sorted effective set.
	cacheSet(cacheKey("4", "adfs", minPlayWordLen, maxPlayWordLen), []string{"dad", "sad"})
	t.Cleanup(func() { cacheClear(cacheKey("4", "adfs", minPlayWordLen, maxPlayWordLen)) })

	w := httptest.NewRecorder()
	handleWordgen(w, httptest.NewRequest("GET", "/api/wordgen?level=4&characters=jkl", nil))
	if strings.Contains(w.Body.String(), "dad") {
		t.Errorf("cross-charset cache hit: %s", w.Body.String())
	}

	w = httptest.NewRecorder()
	handleWordgen(w, httptest.NewRequest("GET", "/api/wordgen?level=4&characters=asdf", nil))
	if !strings.Contains(w.Body.String(), "dad") {
		t.Errorf("matching charset should serve the batch, got %s", w.Body.String())
	}
}

// The 2026-07-13 window-keying fix: a batch generated under one length window must
// never serve a request declaring a DIFFERENT window. A short-word batch left in
// the buffer under [2,24] must not answer a long-word [8,24] request.
func TestCacheIsolationByLengthWindow(t *testing.T) {
	withManifest(t, map[string]levelManifest{
		"4": {Keys: []string{"a", "s", "d", "f"}},
	})
	// A batch buffered under the default window [2,24].
	cacheSet(cacheKey("4", "adfs", minPlayWordLen, maxPlayWordLen), []string{"dad", "sad"})
	t.Cleanup(func() { cacheClear(cacheKey("4", "adfs", minPlayWordLen, maxPlayWordLen)) })
	// Ensure the model looks unavailable so the reservoir (empty here) can't mask
	// a buffer miss with fallback words.
	modelReachable.Store(false)

	// A request declaring a different window [8,24] must NOT get the [2,24] batch.
	w := httptest.NewRecorder()
	handleWordgen(w, httptest.NewRequest("GET", "/api/wordgen?level=4&characters=asdf&minWordLength=8&maxWordLength=24", nil))
	if strings.Contains(w.Body.String(), "dad") {
		t.Errorf("cross-window cache hit: a [8,24] request got a [2,24] batch: %s", w.Body.String())
	}

	// The matching window still serves the batch.
	w = httptest.NewRecorder()
	handleWordgen(w, httptest.NewRequest("GET", "/api/wordgen?level=4&characters=asdf&minWordLength=2&maxWordLength=24", nil))
	if !strings.Contains(w.Body.String(), "dad") {
		t.Errorf("matching window should serve the batch, got %s", w.Body.String())
	}
}

// The fallback reservoir is TIER 2: previously-generated words served ONLY when
// the model is unreachable. When the model is healthy, a buffer miss returns empty
// (fresh generation stays the primary path) — the reservoir is never read.
func TestReservoirServedOnlyWhenModelUnavailable(t *testing.T) {
	withManifest(t, map[string]levelManifest{
		"4": {Keys: []string{"a", "s", "d", "f"}},
	})
	rk := reservoirKey("4", "adfs")
	cacheMu.Lock()
	resPool[rk] = []string{"dad", "sad", "fads"}
	cacheMu.Unlock()
	t.Cleanup(func() {
		cacheMu.Lock()
		delete(resPool, rk)
		cacheMu.Unlock()
		cacheClear(cacheKey("4", "adfs", minPlayWordLen, maxPlayWordLen))
	})

	// Model UP: a buffer miss must return empty, NOT reservoir words.
	modelReachable.Store(true)
	w := httptest.NewRecorder()
	handleWordgen(w, httptest.NewRequest("GET", "/api/wordgen?level=4&characters=asdf", nil))
	var up struct {
		Words []string `json:"words"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &up); err != nil {
		t.Fatalf("response not valid JSON: %v (%s)", err, w.Body.String())
	}
	if len(up.Words) != 0 {
		t.Errorf("model available: buffer miss must serve empty (fresh is primary), got reservoir words %v", up.Words)
	}

	// Model DOWN: the same buffer miss now serves reservoir words.
	modelReachable.Store(false)
	cacheClear(cacheKey("4", "adfs", minPlayWordLen, maxPlayWordLen)) // ensure a clean miss
	w = httptest.NewRecorder()
	handleWordgen(w, httptest.NewRequest("GET", "/api/wordgen?level=4&characters=asdf", nil))
	var down struct {
		Words []string `json:"words"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &down); err != nil {
		t.Fatalf("response not valid JSON: %v (%s)", err, w.Body.String())
	}
	if len(down.Words) == 0 {
		t.Errorf("model unavailable: buffer miss must fall back to the reservoir, got empty")
	}
	for _, got := range down.Words {
		if got != "dad" && got != "sad" && got != "fads" {
			t.Errorf("reservoir served a word not in the pool: %q", got)
		}
	}

	// Restore for other tests.
	modelReachable.Store(false)
}

// reservoirTake filters the fallback pool to the request's length window.
func TestReservoirRespectsLengthWindow(t *testing.T) {
	p := wordgenParams{level: "X", sortedSet: "adfs", minLen: 4, maxLen: 5}
	rk := reservoirKey("X", "adfs")
	cacheMu.Lock()
	resPool[rk] = []string{"ad", "dad", "fads", "salad", "flasks"} // lens 2,3,4,5,6
	cacheMu.Unlock()
	t.Cleanup(func() {
		cacheMu.Lock()
		delete(resPool, rk)
		cacheMu.Unlock()
	})

	got := reservoirTake(p)
	for _, w := range got {
		if n := len(w); n < 4 || n > 5 {
			t.Errorf("word %q (len %d) outside declared window [4,5]", w, n)
		}
	}
	// The two in-window words (fads, salad) must both be reachable.
	seen := map[string]bool{}
	for _, w := range got {
		seen[w] = true
	}
	if !seen["fads"] || !seen["salad"] {
		t.Errorf("in-window words missing from reservoir take: got %v", got)
	}
}

// reservoirAdd de-duplicates and trims to reservoirCap, keeping the newest words.
func TestReservoirAddDedupAndCap(t *testing.T) {
	p := wordgenParams{level: "Y", sortedSet: "adfs"}
	rk := reservoirKey("Y", "adfs")
	t.Cleanup(func() {
		cacheMu.Lock()
		delete(resPool, rk)
		cacheMu.Unlock()
	})

	reservoirAdd(p, []string{"dad", "sad"})
	reservoirAdd(p, []string{"sad", "fad"}) // "sad" duplicate must not double-store
	cacheMu.Lock()
	pool := append([]string(nil), resPool[rk]...)
	cacheMu.Unlock()
	if len(pool) != 3 {
		t.Fatalf("expected 3 deduped words, got %d (%v)", len(pool), pool)
	}

	// Overflow the cap and confirm it trims to reservoirCap, newest retained.
	big := make([]string, reservoirCap+10)
	for i := range big {
		big[i] = "w" + strconv.Itoa(i)
	}
	reservoirAdd(p, big)
	cacheMu.Lock()
	pool = append([]string(nil), resPool[rk]...)
	cacheMu.Unlock()
	if len(pool) != reservoirCap {
		t.Errorf("expected reservoir trimmed to cap %d, got %d", reservoirCap, len(pool))
	}
	if pool[len(pool)-1] != "w"+strconv.Itoa(reservoirCap+9) {
		t.Errorf("cap trim must keep newest word, tail is %q", pool[len(pool)-1])
	}
}

// Warmup is best-effort and must never panic or block when Ollama is absent.
func TestMaybeWarmSafeWhenModelAbsent(t *testing.T) {
	t.Setenv("OLLAMA_HOST", "127.0.0.1:1") // dead port → fast connection refusal
	lastWarmNano.Store(0)                  // clear cooldown so this call actually runs
	done := make(chan struct{})
	go func() { maybeWarm(); close(done) }()
	select {
	case <-done:
	case <-time.After(10 * time.Second):
		t.Fatal("maybeWarm blocked with Ollama absent")
	}
}

// ─── Structure validation of the Ollama reply (failure class B) ───────────
// Wrong-charset words are filtered PER WORD (class A, covered above); a reply
// that is structurally bad is ignored WHOLE — nil, never a partial batch.

func TestParseGenResponse(t *testing.T) {
	cases := []struct {
		name string
		body string
		want []string // nil = structural failure
	}{
		{"undecodable garbage", "not json at all", nil},
		{"wrong field type", `{"response": 123}`, nil},
		{"empty response field", `{"response": ""}`, nil},
		{"whitespace-only response", `{"response": "  \n "}`, nil},
		{"valid lines", `{"response": "dad\nsad\n"}`, []string{"dad", "sad"}},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := parseGenResponse(strings.NewReader(tc.body))
			if !reflect.DeepEqual(got, tc.want) {
				t.Errorf("parseGenResponse(%q) = %v, want %v", tc.body, got, tc.want)
			}
		})
	}

	t.Run("line cap bounds a hostile reply", func(t *testing.T) {
		huge := `{"response": "` + strings.Repeat(`word\n`, 500) + `"}`
		got := parseGenResponse(strings.NewReader(huge))
		if len(got) > maxParsedLines {
			t.Errorf("parsed %d lines, want <= %d", len(got), maxParsedLines)
		}
	})

	// TF-E1 (FIXED, Trevor 2026-07-13; see docs/testing/FINDINGS.md): the
	// structure layer now caps BYTE size, not just line count. A single
	// newline-free line longer than a real word plus its list decoration
	// (maxParsedLineLen) is a class-A per-item failure — that line is dropped;
	// the rest of the batch survives. This closes the gap the finding named:
	// the giant "word" no longer reaches downstream processing at all.
	t.Run("TF-E1 fixed: a single unbounded line is size-capped at the structure layer (class A, per-item)", func(t *testing.T) {
		hugeWord := strings.Repeat("a", 200000)
		body := `{"response": "` + hugeWord + `"}`
		got := parseGenResponse(strings.NewReader(body))
		if got != nil {
			t.Errorf("the oversized line must be dropped, leaving nothing; got %d entries", len(got))
		}
	})

	t.Run("TF-E1 fixed: an oversized line is dropped but valid siblings survive (class A)", func(t *testing.T) {
		big := strings.Repeat("b", maxParsedLineLen+1)
		body := `{"response": "dad\n` + big + `\nsad\n"}`
		got := parseGenResponse(strings.NewReader(body))
		if !reflect.DeepEqual(got, []string{"dad", "sad"}) {
			t.Errorf("valid lines must survive an oversized sibling; got %v, want [dad sad]", got)
		}
	})

	t.Run("TF-E1 fixed: a line exactly at the cap survives", func(t *testing.T) {
		atCap := strings.Repeat("c", maxParsedLineLen)
		body := `{"response": "` + atCap + `\n"}`
		got := parseGenResponse(strings.NewReader(body))
		if !reflect.DeepEqual(got, []string{atCap}) {
			t.Errorf("a line at the cap length must survive; got %v", got)
		}
	})

	t.Run("TF-E1 fixed: a grotesquely oversized whole response is rejected WHOLE (class B)", func(t *testing.T) {
		// Many short newline-free-per-line lines whose TOTAL blows past the
		// whole-body ceiling — the entire reply is a class-B structural
		// failure (nil), never a partial batch.
		giant := strings.Repeat("ab\n", maxResponseBytes) // total >> maxResponseBytes
		body := `{"response": "` + giant + `"}`
		got := parseGenResponse(strings.NewReader(body))
		if got != nil {
			t.Errorf("a whole response past maxResponseBytes must be rejected whole (nil); got %d entries", len(got))
		}
	})
}
