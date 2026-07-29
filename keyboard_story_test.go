package main

import (
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"
)

// Mirrors the wordgen validation tests: the /api/keyboard-story generator validates
// every generated coda sentence (charset allowlist, all-26 coverage on the base,
// safety word blocklist, length/word caps) before returning it, and never 500s. The
// client (js/keyboard-story.js) re-validates — this is the server end of INV-66.

func TestValidateStorySentenceGo(t *testing.T) {
	ok := []string{
		"The quick brown fox jumps over the lazy dog.",
		"They play in the park all day.",
		"It's a happy day, don't you think.",
		"A wave of joy - and off they go.",
	}
	for _, s := range ok {
		if got := validateStorySentenceGo(s); got == "" {
			t.Errorf("expected %q to validate, got rejected", s)
		}
	}

	bad := map[string]string{
		"exclamation not typeable": "Hooray! We win!",
		"question not typeable":    "Are you ready?",
		"digits not allowed":       "Type 10 words now.",
		"other symbol":             "Go @ the sign.",
		"blocked word (exact)":     "the gun is loud",
		"alcohol pangram blocked":  "pack my box with five dozen liquor jugs.",
		"empty":                    "   ",
		"over length":              strings.Repeat("a", maxStorySentenceLen+1),
		"word too wide":            "supercalifragilisticexpialidocious word",
	}
	for name, s := range bad {
		if got := validateStorySentenceGo(s); got != "" {
			t.Errorf("%s: expected %q rejected, got %q", name, s, got)
		}
	}
}

// The kid-safety FLOOR is loaded (at init) from the single-source js/word-blocklist.json
// — the SAME file the client imports as BASE_WORDS. This asserts the Go side loaded it
// non-empty and that the file drives the filter (add-a-word-here-adds-it-everywhere).
func TestChatWordBlocklistLoaded(t *testing.T) {
	if len(chatWordBlocklist) < 25 {
		t.Fatalf("blocklist floor failed to load from js/word-blocklist.json (got %d words)", len(chatWordBlocklist))
	}
	for _, w := range []string{"hell", "gun", "liquor", "death"} {
		if !chatWordBlocklist[w] {
			t.Errorf("expected floor word %q to be loaded from the JSON", w)
		}
	}
	// exact-word, never substring — "hello" must NOT be blocked by "hell".
	if !chatOutputOK("say hello to the happy dog") {
		t.Error("chatOutputOK over-blocked an innocent word (substring leak)")
	}
	if chatOutputOK("the gun is loud") {
		t.Error("chatOutputOK failed to block an exact floor word")
	}
}

func TestStoryCoversAllLetters(t *testing.T) {
	if !storyCoversAllLetters("The quick brown fox jumps over the lazy dog.") {
		t.Error("classic pangram should cover all 26 letters")
	}
	if storyCoversAllLetters("the cat sat on a mat") {
		t.Error("non-pangram should not cover all 26 letters")
	}
	// Case-insensitive.
	if !storyCoversAllLetters("THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG") {
		t.Error("uppercase pangram should still cover all 26 letters")
	}
}

func TestParseAndValidateStories(t *testing.T) {
	// Two blocks: one valid (pangram base + 3 extras), one invalid (non-pangram base).
	text := "The quick brown fox jumps over the lazy dog.\n" +
		"They play in the park all day.\n" +
		"The sun is warm today.\n" +
		"It is a happy day to run.\n" +
		"\n" +
		"The cat sat on the mat.\n" + // base is NOT a pangram → whole block dropped
		"It was a lazy day.\n" +
		"The dog ran fast.\n" +
		"They all went home.\n"
	got := parseAndValidateStories(text)
	if len(got) != 1 {
		t.Fatalf("expected exactly 1 valid story, got %d: %+v", len(got), got)
	}
	if !storyCoversAllLetters(got[0].Base) {
		t.Errorf("returned base is not a pangram: %q", got[0].Base)
	}
	if len(got[0].Extra) < minStoryExtra {
		t.Errorf("returned story has too few extras: %d", len(got[0].Extra))
	}
}

// REGRESSION (the ~7%→ measured yield collapse): llama3.2 inserts a STRAY BLANK LINE
// between its valid pangram opener and its continuation sentences. The old "\n\n" block
// split fragmented this into a 1-line block (dropped: < min lines) + a headless block
// (dropped: no pangram) — losing BOTH. The robust parser must recover one valid story.
func TestParseAndValidateStoriesHandlesBlankLineDrift(t *testing.T) {
	text := "The quick brown fox jumps over the lazy dog.\n" +
		"\n" + // <-- the drift: stray blank line inside one story
		"They play in the park all day.\n" +
		"The sun is warm today.\n" +
		"It is a happy day to run.\n"
	got := parseAndValidateStories(text)
	if len(got) != 1 {
		t.Fatalf("drift: expected 1 recovered story, got %d: %+v", len(got), got)
	}
	if !storyCoversAllLetters(got[0].Base) {
		t.Errorf("recovered base is not a pangram: %q", got[0].Base)
	}
	if len(got[0].Extra) < minStoryExtra {
		t.Errorf("recovered story has too few extras: %d", len(got[0].Extra))
	}
}

// Multiple valid pangram lines seed multiple stories (each pangram starts a new one,
// its following non-pangram lines become its extras), regardless of blank-line noise.
func TestParseAndValidateStoriesMultiplePangrams(t *testing.T) {
	text := "The quick brown fox jumps over the lazy dog.\n" +
		"They play all day.\nThe sun is warm.\nA happy day to run.\n" +
		"\n\n" + // extra blank noise between stories — ignored
		"Jackdaws love my big sphinx of quartz.\n" +
		"The birds fly home.\nThey sing a soft tune.\nStars come out to play.\n"
	got := parseAndValidateStories(text)
	if len(got) != 2 {
		t.Fatalf("expected 2 stories from 2 pangrams, got %d: %+v", len(got), got)
	}
	for _, s := range got {
		if !storyCoversAllLetters(s.Base) {
			t.Errorf("a base is not a pangram: %q", s.Base)
		}
	}
}

// Junk / non-story reply still yields nothing (the safety floor is unchanged — the ONLY
// behavior change is block-splitting robustness, never what content is deemed safe).
func TestParseAndValidateStoriesJunkYieldsNone(t *testing.T) {
	for _, junk := range []string{
		"",
		"   \n\n  \n",
		"Here are some stories for you!\nHooray!\nType 10 words now.", // no valid pangram
		"the cat sat on the mat\nit was a lazy day\nthe dog ran fast\nthey went home", // no pangram base
	} {
		if got := parseAndValidateStories(junk); len(got) != 0 {
			t.Errorf("junk %q: expected 0 stories, got %d: %+v", junk, len(got), got)
		}
	}
}

// The inbound anti-dup `avoid` values are validated structurally, symmetric to the
// outbound content (security.md rule 7): charset allowlist + length/word caps + safety
// blocklist, and the count is capped at maxAvoid. Malformed values are dropped.
func TestSanitizeAvoidList(t *testing.T) {
	in := []string{
		"The quick brown fox jumps over the lazy dog.", // ok (game content)
		"Type 10 things!",                              // digits/'!' → dropped
		"the gun is loud",                              // blocked word → dropped
		"   ",                                          // empty → dropped
		"Jackdaws love my big sphinx of quartz.",       // ok
	}
	got := sanitizeAvoidList(in)
	if len(got) != 2 {
		t.Fatalf("expected 2 valid avoid entries, got %d: %+v", len(got), got)
	}
	// The count is capped even if many valid values arrive.
	many := make([]string, maxAvoid+5)
	for i := range many {
		many[i] = "The quick brown fox jumps over the lazy dog."
	}
	if got := sanitizeAvoidList(many); len(got) > maxAvoid {
		t.Errorf("avoid count not capped: got %d > %d", len(got), maxAvoid)
	}
}

// buildStoryPrompt embeds a concrete one-shot example and, when given avoid context,
// an explicit "make something different" instruction carrying ONLY story text.
func TestBuildStoryPromptShape(t *testing.T) {
	p := buildStoryPrompt(3, []string{"The quick brown fox jumps over the lazy dog."})
	if !strings.Contains(p, "How quickly daft jumping zebras vex.") {
		t.Error("prompt is missing the one-shot format example")
	}
	if !strings.Contains(p, "pick a DIFFERENT pangram") {
		t.Error("prompt is missing the anti-dup instruction when avoid context is given")
	}
	if !strings.Contains(p, "The quick brown fox jumps over the lazy dog.") {
		t.Error("prompt should include the avoid base to steer away from it")
	}
	// With no avoid context, no anti-dup block appears.
	if strings.Contains(buildStoryPrompt(3, nil), "pick a DIFFERENT pangram") {
		t.Error("prompt should not include the anti-dup block without avoid context")
	}
}

func TestParseAndValidateStoriesDropsTooFewExtras(t *testing.T) {
	// Pangram base but only 1 extra → not enough for tier scaling → dropped.
	text := "The quick brown fox jumps over the lazy dog.\n" +
		"Only one extra here.\n"
	if got := parseAndValidateStories(text); len(got) != 0 {
		t.Errorf("expected 0 stories (too few extras), got %d", len(got))
	}
}

func TestParseAndValidateStoriesDropsUnsafeSentence(t *testing.T) {
	// An unsafe extra is dropped individually; if that leaves < minStoryExtra, the
	// whole story is dropped (here 3 safe extras remain, so the story survives with
	// the unsafe one removed).
	text := "The quick brown fox jumps over the lazy dog.\n" +
		"They play in the park.\n" +
		"the gun goes bang.\n" + // unsafe word → this sentence dropped
		"The sun is warm.\n" +
		"It is a happy day.\n" +
		"They run and jump.\n"
	got := parseAndValidateStories(text)
	if len(got) != 1 {
		t.Fatalf("expected 1 story, got %d", len(got))
	}
	for _, e := range got[0].Extra {
		if strings.Contains(strings.ToLower(e), "gun") {
			t.Errorf("unsafe sentence survived: %q", e)
		}
	}
}

// The endpoint must never 500 and always return a JSON {stories:[...]} shape, even
// when the model is unavailable (the static-host shipping default). Point OLLAMA_HOST
// at a dead port to force unavailability (the documented kill-switch test hook).
func TestHandleKeyboardStoryModelUnavailableIsEmpty(t *testing.T) {
	t.Setenv("OLLAMA_HOST", "127.0.0.1:1") // nothing listens here
	modelReachable.Store(false)

	rec := httptest.NewRecorder()
	handleKeyboardStory(rec, httptest.NewRequest("GET", "/api/keyboard-story?tier=1&count=3", nil))

	if rec.Code >= 500 {
		t.Fatalf("endpoint must never 5xx, got %d", rec.Code)
	}
	var body struct {
		Stories []storyOut `json:"stories"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("response is not valid JSON: %v (%s)", err, rec.Body.String())
	}
	if len(body.Stories) != 0 {
		t.Errorf("model unavailable should yield an empty batch, got %d", len(body.Stories))
	}
}
