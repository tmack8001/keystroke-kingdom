// Shared unit-test stubs — the ONLY globals unit tests may install.
// If a test needs more DOM than this, it is an integration test (see
// docs/testing/STRATEGY.md §4 and tests/helpers/game-driver.mjs).

// In-memory localStorage honoring the Web Storage API surface the game uses.
export function installLocalStorageStub(initial = {}) {
  const store = new Map(Object.entries(initial));
  globalThis.localStorage = {
    getItem: (k) => (store.has(String(k)) ? store.get(String(k)) : null),
    setItem: (k, v) => { store.set(String(k), String(v)); },
    removeItem: (k) => { store.delete(String(k)); },
    clear: () => { store.clear(); },
    key: (i) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
  };
  return store; // tests may inspect/seed the backing map directly
}

// Scriptable fetch: handler receives (url, options) and returns either a
// Response-like object ({ ok, status, json(), text() }) or throws to simulate
// network failure. Pass plain data via respondJson() for the common case.
export function installFetchStub(handler) {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return handler(String(url), options);
  };
  return calls; // recorded calls, for asserting what the game requested
}

export function respondJson(data, { status = 200 } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

export function resetStubs() {
  delete globalThis.localStorage;
  delete globalThis.fetch;
}
