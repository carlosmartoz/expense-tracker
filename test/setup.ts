import { beforeEach } from "vitest";

/**
 * A localStorage the tests fully control.
 *
 * Node ships its own global these days, and it warns and misbehaves without a
 * backing file, so rather than depending on whichever implementation happens to
 * win, the suite installs a plain in-memory one. lib/storage.ts only ever calls
 * these four methods.
 */
const store = new Map<string, string>();

const memoryStorage = {
  getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
  setItem: (key: string, value: string) => void store.set(key, String(value)),
  removeItem: (key: string) => void store.delete(key),
  clear: () => store.clear(),
  key: (i: number) => [...store.keys()][i] ?? null,
  get length() {
    return store.size;
  },
};

Object.defineProperty(globalThis, "localStorage", {
  value: memoryStorage,
  configurable: true,
  writable: true,
});

// lib/storage.ts bails out when there's no window, so give it one.
if (!("window" in globalThis)) {
  Object.defineProperty(globalThis, "window", {
    value: { localStorage: memoryStorage },
    configurable: true,
    writable: true,
  });
}

beforeEach(() => store.clear());
