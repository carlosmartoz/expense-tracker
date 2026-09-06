import { beforeEach } from "vitest";

// An in-memory localStorage for the tests.
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

// storage.ts needs a window to exist.
if (!("window" in globalThis)) {
  Object.defineProperty(globalThis, "window", {
    value: { localStorage: memoryStorage },
    configurable: true,
    writable: true,
  });
}

beforeEach(() => store.clear());
