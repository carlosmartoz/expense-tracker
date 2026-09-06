import { CURRENCIES } from "@/lib/config";
import { DEFAULT_CATEGORIES } from "@/lib/types";
import { Snapshot } from "@/types/storage";

// Reads and writes the stored data.
const KEY = "expense-tracker";

// True when the value has every field a transaction needs.
export function isTransaction(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;

  const t = value as Record<string, unknown>;

  return (
    typeof t.id === "string" &&
    (t.type === "income" || t.type === "expense") &&
    typeof t.amount === "number" &&
    typeof t.currency === "string" &&
    t.currency in CURRENCIES &&
    typeof t.categoryId === "string" &&
    typeof t.description === "string" &&
    typeof t.date === "string"
  );
}

// True when the value has every field a category needs.
export function isCategory(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;

  const c = value as Record<string, unknown>;

  return (
    typeof c.id === "string" &&
    typeof c.name === "string" &&
    typeof c.color === "string" &&
    typeof c.icon === "string" &&
    (c.type === "income" || c.type === "expense")
  );
}

// True when the value holds transactions and categories in the current shape.
function isSnapshot(value: unknown): value is Snapshot {
  if (!value || typeof value !== "object") return false;

  const s = value as Partial<Snapshot>;

  return (
    Array.isArray(s.transactions) &&
    Array.isArray(s.categories) &&
    s.transactions.every(isTransaction) &&
    s.categories.every(isCategory)
  );
}

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
export function save(snapshot: Snapshot): void {
  if (typeof window === "undefined") return;

  if (isUntouched(snapshot)) return clear();

  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {}
}
