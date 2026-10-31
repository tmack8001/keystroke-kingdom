// ─── The platform key label for canvas text ─────────────────────────────────
//
// CLAUDE.md §Platform Key Label: Mac keyboards say RETURN, everyone else says
// ENTER, and Oona was confused when the screen said one word and her keyboard
// said the other. The DOM handles this with `<span data-enter-key>` swapped at
// load by main.js — but the bonus wings draw on the shared CANVAS, where there is
// no element to swap. So every canvas string that names the key asks here.
//
// The detection is the SAME test main.js uses for `[data-enter-key]` (main.js,
// `const enterLabel = /Mac/.test(navigator.platform || navigator.userAgent)`),
// so a DOM label and a canvas label on one machine can never disagree. If you
// change one, change the other.
//
// Only the LABEL changes. Every handler still reads `e.key === 'Enter'`, which
// the browser fires for both keys on every platform.
//
// Safe without a browser (node unit tests import modules that import this):
// a missing `navigator` reads as "not a Mac" and the label is ENTER.

export function isMacKeyboard() {
  try {
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    if (!nav) return false;
    return /Mac/.test(String(nav.platform || nav.userAgent || ''));
  } catch {
    return false;
  }
}

// 'RETURN' on a Mac, 'ENTER' everywhere else. Upper case, because every wing
// draws its key names in capitals.
export function enterLabel() { return isMacKeyboard() ? 'RETURN' : 'ENTER'; }
