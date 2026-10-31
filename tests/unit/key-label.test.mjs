// Enforces: INV-133 — CLAUDE.md §Platform Key Label (Return vs Enter): "Mac
// keyboards say Return; Windows/Linux say Enter. Oona was confused when the UI
// said 'ENTER' and her keyboard said 'RETURN.'" Extends INV-28 (the DOM
// [data-enter-key] swap) to the bonus wings' CANVAS strings, which have no
// element to swap and so ask js/key-label.js `enterLabel()` instead.
//
// Unit layer: the module's public exports only. `navigator` is a Node global in
// Node 21+, so each case installs and removes its own scripted value via
// Object.defineProperty (no jsdom).

import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';

const { enterLabel, isMacKeyboard } = await import('../../js/key-label.js');

const original = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
function setNavigator(value) {
  Object.defineProperty(globalThis, 'navigator', { value, configurable: true, writable: true });
}
function removeNavigator() {
  // `delete` is enough when navigator is an own configurable property; fall back
  // to shadowing with undefined if the runtime defines it as an accessor.
  try { delete globalThis.navigator; } catch { /* ignore */ }
  if ('navigator' in globalThis && globalThis.navigator !== undefined) setNavigator(undefined);
}
afterEach(() => {
  if (original) Object.defineProperty(globalThis, 'navigator', original);
  else removeNavigator();
});

describe('INV-133 — enterLabel() names the key the way the player\'s keyboard does', () => {
  test('a Mac keyboard reads RETURN', () => {
    setNavigator({ platform: 'MacIntel', userAgent: '' });
    assert.equal(enterLabel(), 'RETURN');
    assert.equal(isMacKeyboard(), true);
  });

  test('Windows and Linux keyboards read ENTER', () => {
    for (const platform of ['Win32', 'Linux x86_64', 'Linux armv8l']) {
      setNavigator({ platform, userAgent: '' });
      assert.equal(enterLabel(), 'ENTER', `${platform} says ENTER`);
    }
  });

  test('a Mac that only reveals itself in the userAgent still reads RETURN', () => {
    setNavigator({ platform: '', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' });
    assert.equal(enterLabel(), 'RETURN');
  });

  test('is safe with no navigator at all (node unit tests import modules that import it) — falls back to ENTER', () => {
    removeNavigator();
    assert.doesNotThrow(() => enterLabel());
    assert.equal(enterLabel(), 'ENTER');
  });

  test('is safe with a hostile/garbage navigator — never throws, falls back to ENTER', () => {
    setNavigator({ get platform() { throw new Error('boom'); } });
    assert.doesNotThrow(() => enterLabel());
    assert.equal(enterLabel(), 'ENTER');
  });

  test('upper case, because every wing draws its key names in capitals', () => {
    for (const nav of [{ platform: 'MacIntel' }, { platform: 'Win32' }]) {
      setNavigator(nav);
      const label = enterLabel();
      assert.equal(label, label.toUpperCase());
    }
  });
});
