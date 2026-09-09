import { CURRENCIES } from "@/lib/config";
import type {
  Category,
  Snapshot,
  SnapshotProblem,
  Transaction,
} from "@/types";

// The shape checks stored data and backup files both go through, so the two
// can never disagree about what counts as valid.

// True when the value has every field a transaction needs.
export function isTransaction(value: unknown): value is Transaction {
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
export function isCategory(value: unknown): value is Category {
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

// null when the value is a snapshot in the current shape.
export function snapshotProblem(value: unknown): SnapshotProblem | null {
  if (!value || typeof value !== "object") return "not-an-object";

  const s = value as Partial<Snapshot>;

  if (!Array.isArray(s.transactions) || !Array.isArray(s.categories))
    return "missing-lists";
  if (!s.transactions.every(isTransaction)) return "bad-transaction";
  if (!s.categories.every(isCategory)) return "bad-category";

  return null;
}

export function isSnapshot(value: unknown): value is Snapshot {
  return snapshotProblem(value) === null;
}
