import type { Transaction, Category, TransactionType } from "./types";

/**
 * Reading and writing the browser's copy of your data. This module owns the
 * storage format — nothing else should touch localStorage directly.
 */

const KEY = "expense-tracker";

/** Bumped whenever the stored shape changes. See MIGRATIONS below. */
export const VERSION = 4;

/** The two keys the app wrote to before everything moved under a single one. */
const LEGACY_TRANSACTIONS_KEY = "expense-tracker:transactions:v2";
const LEGACY_CATEGORIES_KEY = "expense-tracker:categories:v1";

export interface Snapshot {
  version: number;
  transactions: Transaction[];
  categories: Category[];
}

/**
 * Each entry upgrades a snapshot one version forward: MIGRATIONS[0] takes a v1
 * snapshot to v2, MIGRATIONS[1] takes v2 to v3, and so on. Data climbs the
 * chain one step at a time, so however old a browser's copy is, it arrives at
 * VERSION without losing anything.
 */
const MIGRATIONS: ((snapshot: Snapshot) => Snapshot)[] = [
  // 1 -> 2: the app went back to a single currency, so the per-transaction
  // `currency` field is dropped. Amounts are left untouched — they were always
  // stored as plain numbers, and anything entered in another currency stays at
  // its face value for you to correct by hand.
  (snapshot) => ({
    ...snapshot,
    transactions: snapshot.transactions.map((t) => {
      const { currency, ...rest } = t as Transaction & { currency?: string };
      void currency;
      return rest;
    }),
  }),

  // 2 -> 3: tags are gone. Categories cover the same ground now that any of
  // them can be renamed, so the second way of labelling a transaction goes.
  (snapshot) => ({
    ...snapshot,
    transactions: snapshot.transactions.map((t) => {
      const { tags, ...rest } = t as Transaction & { tags?: string[] };
      void tags;
      return rest;
    }),
  }),

  // 3 -> 4: categories became one flat, fully editable list.
  //
  // `category` is renamed to `categoryId`, which is what it always held. Every
  // stored category gains a `type` and loses `isDefault`: income used to be a
  // single hard-coded bucket, so the one category with that id lands on the
  // income side and everything else on the expense side.
  //
  // The user's list is typed and cleaned, never curated: categories that no
  // longer ship as defaults (Subscriptions, Gaming, Debts) are kept, because
  // transactions point at them. New defaults aren't injected either — the list
  // belongs to whoever has been using the app.
  (snapshot) => {
    const LEGACY_INCOME_ID = "Income";
    const legacy = snapshot.categories as (Category & {
      isDefault?: boolean;
      type?: TransactionType;
    })[];

    const categories: Category[] = legacy.map((c) => {
      const { isDefault, ...rest } = c;
      void isDefault;
      return { ...rest, type: rest.type ?? (c.id === LEGACY_INCOME_ID ? "income" : "expense") };
    });

    return {
      ...snapshot,
      categories,
      transactions: snapshot.transactions.map((t) => {
        const { category, ...rest } = t as Transaction & { category?: string };
        return { ...rest, categoryId: rest.categoryId ?? category ?? "" };
      }),
    };
  },
];

function migrate(snapshot: Snapshot): Snapshot {
  let out = snapshot;
  for (let v = out.version; v < VERSION; v++) {
    const step = MIGRATIONS[v - 1];
    if (!step) break;
    out = { ...step(out), version: v + 1 };
  }
  return out;
}

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    // Unparseable or unavailable (private mode) — treat as absent.
    return null;
  }
}

/**
 * Pick up data written by the pre-VERSION app, which kept transactions and
 * categories under separate keys and stored no version at all.
 */
function readLegacy(): Snapshot | null {
  const transactions = readJSON<Transaction[]>(LEGACY_TRANSACTIONS_KEY);
  const categories = readJSON<Category[]>(LEGACY_CATEGORIES_KEY);
  if (!transactions && !categories) return null;
  return {
    version: 1,
    transactions: Array.isArray(transactions) ? transactions : [],
    categories: Array.isArray(categories) ? categories : [],
  };
}

/**
 * Returns what's stored, or null when this browser has never held any data
 * (a first visit, or storage the browser won't let us read).
 */
export function load(): Snapshot | null {
  if (typeof window === "undefined") return null;

  const current = readJSON<Snapshot>(KEY);
  if (current && Array.isArray(current.transactions)) {
    // A snapshot written before versions were stamped counts as v1.
    return migrate({ ...current, version: current.version ?? 1 });
  }

  const legacy = readLegacy();
  if (!legacy) return null;

  // Write the new key first and confirm it's really there before dropping the
  // old ones, so a storage failure mid-way can't lose the only copy.
  save(legacy);
  if (readJSON<Snapshot>(KEY)) {
    try {
      localStorage.removeItem(LEGACY_TRANSACTIONS_KEY);
      localStorage.removeItem(LEGACY_CATEGORIES_KEY);
    } catch {
      /* leaving them behind is harmless; they're ignored from now on */
    }
  }
  return migrate(legacy);
}

export function save(snapshot: Omit<Snapshot, "version">): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...snapshot, version: VERSION }));
  } catch {
    /* storage may be full or unavailable (private mode); nothing to do */
  }
}
