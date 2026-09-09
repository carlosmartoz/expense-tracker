import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { isSnapshot } from "@/lib/validate";
import type { Snapshot } from "@/types";

// Reads and writes the stored data.
const KEY = "expense-tracker";

// The stored data, or null if there is none or it isn't in the current shape.
export function load(): Snapshot | null {
  if (typeof window === "undefined") return null;

  let raw: unknown;

  try {
    const text = localStorage.getItem(KEY);

    if (!text) return null;

    raw = JSON.parse(text);
  } catch {
    return null;
  }

  if (!isSnapshot(raw)) return null;

  return { transactions: raw.transactions, categories: raw.categories };
}

// True when nothing has been added or changed.
function isUntouched(snapshot: Snapshot): boolean {
  return (
    snapshot.transactions.length === 0 &&
    snapshot.categories.length === DEFAULT_CATEGORIES.length &&
    snapshot.categories.every((c, i) => c.id === DEFAULT_CATEGORIES[i].id)
  );
}

// Removes the app's key.
export function clear(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

// Writes the data, or clears storage when nothing has been changed.
// A write that fails (private mode, quota) is swallowed: the app keeps
// working on the in-memory copy, and Export backup is still the way out.
export function save(snapshot: Snapshot): void {
  if (typeof window === "undefined") return;

  if (isUntouched(snapshot)) return clear();

  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {}
}
