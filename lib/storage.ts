import type { Transaction, Category, TransactionType } from "./types";
import { CATEGORY_COLOR_VALUES, DEFAULT_CATEGORIES } from "./types";
import { CURRENCIES, DEFAULT_CURRENCY } from "./config";

// This module owns the storage format; nothing else touches localStorage.

const KEY = "expense-tracker";
const LEGACY_TRANSACTIONS_KEY = "expense-tracker:transactions:v2";
const LEGACY_CATEGORIES_KEY = "expense-tracker:categories:v1";

/** Bumped whenever the stored shape changes. One MIGRATIONS entry per step. */
export const VERSION = 11;

export interface Snapshot {
  version: number;
  transactions: Transaction[];
  categories: Category[];
}

type Step = (snapshot: Snapshot) => Snapshot;

/** Drops the per-transaction currency; amounts keep their face value. */
// A free-form string, not the `currency` v11 adds back. Between the two steps
// a transaction carries none, which is why the result is asserted, not inferred.
const dropCurrency: Step = (snapshot) => ({
  ...snapshot,
  transactions: snapshot.transactions.map((t) => {
    const { currency, ...rest } = t as Transaction & { currency?: string };
    void currency;
    return rest as Transaction;
  }),
});

/** Drops tags, which categories replaced. */
const dropTags: Step = (snapshot) => ({
  ...snapshot,
  transactions: snapshot.transactions.map((t) => {
    const { tags, ...rest } = t as Transaction & { tags?: string[] };
    void tags;
    return rest;
  }),
});

/** Renames `category` to `categoryId` and gives every category a side. */
const flattenCategories: Step = (snapshot) => {
  const legacy = snapshot.categories as (Category & {
    isDefault?: boolean;
    type?: TransactionType;
  })[];
  return {
    ...snapshot,
    categories: legacy.map(({ isDefault, ...rest }) => {
      void isDefault;
      return {
        ...rest,
        type: rest.type ?? (rest.id === "Income" ? "income" : "expense"),
      };
    }),
    transactions: snapshot.transactions.map((t) => {
      const { category, ...rest } = t as Transaction & { category?: string };
      return { ...rest, categoryId: rest.categoryId ?? category ?? "" };
    }),
  };
};

/** Hands each category the next palette entry, by position. */
const recolour: Step = (snapshot) => ({
  ...snapshot,
  categories: snapshot.categories.map((c, i) => ({
    ...c,
    color: CATEGORY_COLOR_VALUES[i % CATEGORY_COLOR_VALUES.length],
  })),
});

/** Gives every transaction a currency. Everything written before there was
    more than one to choose was in the default, so that is what it was. */
const stampCurrency: Step = (snapshot) => ({
  ...snapshot,
  transactions: snapshot.transactions.map((t) => ({
    ...t,
    currency: t.currency in CURRENCIES ? t.currency : DEFAULT_CURRENCY,
  })),
});

/** Puts shipped categories back on their colour and icon; leaves the rest. */
const restoreDefaults: Step = (snapshot) => {
  const canonical = new Map(DEFAULT_CATEGORIES.map((c) => [c.id, c]));
  return {
    ...snapshot,
    categories: snapshot.categories.map((c) => {
      const def = canonical.get(c.id);
      return def ? { ...c, color: def.color, icon: def.icon } : c;
    }),
  };
};

// One entry per version, oldest first. A default's colour or icon is only in
// code, so changing one means appending another restoreDefaults.
const MIGRATIONS: Step[] = [
  dropCurrency, //     1 -> 2
  dropTags, //         2 -> 3
  flattenCategories, // 3 -> 4
  recolour, //         4 -> 5, the palette went neutral
  recolour, //         5 -> 6, and colour came back
  restoreDefaults, //  6 -> 7, one colour per default
  restoreDefaults, //  7 -> 8, the palette was picked by hand
  restoreDefaults, //  8 -> 9, Services took a wifi mark
  restoreDefaults, //  9 -> 10, Debts shipped again
  stampCurrency, //   10 -> 11, amounts learned which currency they are in
];

/** Climbs a snapshot to VERSION. Also used on an imported backup file. */
export function migrate(snapshot: Snapshot): Snapshot {
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
    return null; // unparseable or unavailable; treat as absent
  }
}

/** Data from before the two old keys were merged into one. */
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

/** What's stored, or null if this browser has never held any data. */
export function load(): Snapshot | null {
  if (typeof window === "undefined") return null;

  const current = readJSON<Snapshot>(KEY);
  if (current && Array.isArray(current.transactions)) {
    // A snapshot written before versions were stamped counts as v1.
    return migrate({ ...current, version: current.version ?? 1 });
  }

  const legacy = readLegacy();
  if (!legacy) return null;

  // Confirm the new key before dropping the old ones, so a failure mid-way
  // can't lose the only copy.
  save(legacy);
  if (readJSON<Snapshot>(KEY)) {
    remove(LEGACY_TRANSACTIONS_KEY, LEGACY_CATEGORIES_KEY);
  }
  return migrate(legacy);
}

/** True for a ledger indistinguishable from one that was never touched. */
function isPristine(snapshot: Omit<Snapshot, "version">): boolean {
  return (
    snapshot.transactions.length === 0 &&
    snapshot.categories.length === DEFAULT_CATEGORIES.length &&
    snapshot.categories.every((c, i) => c.id === DEFAULT_CATEGORIES[i].id)
  );
}

function remove(...keys: string[]): void {
  try {
    for (const key of keys) localStorage.removeItem(key);
  } catch {
    /* nothing to do if storage is unavailable */
  }
}

/** Removes every key this app has ever written. */
function clear(): void {
  remove(KEY, LEGACY_TRANSACTIONS_KEY, LEGACY_CATEGORIES_KEY);
}

/** A pristine ledger stores nothing, so starting over leaves no key behind. */
export function save(snapshot: Omit<Snapshot, "version">): void {
  if (typeof window === "undefined") return;
  if (isPristine(snapshot)) return clear();
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...snapshot, version: VERSION }));
  } catch {
    /* storage may be full or unavailable (private mode) */
  }
}
