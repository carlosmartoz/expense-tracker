import type { Transaction, Category, TransactionType } from "./types";
import { CATEGORY_COLOR_VALUES, DEFAULT_CATEGORIES } from "./types";

/**
 * Reading and writing the browser's copy of your data. This module owns the
 * storage format — nothing else should touch localStorage directly.
 */

const KEY = "expense-tracker";

/** Bumped whenever the stored shape changes. See MIGRATIONS below. */
export const VERSION = 10;

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

  // 4 -> 5, then 5 -> 6: the palette went neutral and category colours were
  // flattened to greys; colour then came back, for the icon only. Both steps
  // do the same thing — walk the list and hand each category the next entry in
  // the current palette. Position keeps it stable for a given list and stops
  // neighbours landing on the same value.
  //
  // Nobody loses a choice they made: v5 offered greys and nothing else, so
  // there was no picked colour to preserve by the time this runs.
  (snapshot) => recolour(snapshot),
  (snapshot) => recolour(snapshot),

  // 6 -> 7: the palette shrank to one colour per default, so the by-position
  // handout above no longer lands anywhere sensible. Every category the app
  // ships with is put back on its own colour and icon; anything the reader
  // made themselves is left exactly as it is.
  (snapshot) => restoreDefaults(snapshot),

  // 7 -> 8: the palette was picked by hand rather than borrowed, so the
  // shipped categories move again.
  (snapshot) => restoreDefaults(snapshot),

  // 8 -> 9: Services swaps its spanner for a wifi mark. Same step again —
  // now that a default can't be edited, code is the only source for its
  // colour and icon, and a stored copy that disagrees has to be corrected.
  (snapshot) => restoreDefaults(snapshot),

  // 9 -> 10: Debts ships as a default again. A ledger old enough to still
  // carry the original one matches that id, so it stops being an ordinary
  // category and takes the shipped colour and icon like any other default.
  (snapshot) => restoreDefaults(snapshot),
];

/**
 * Puts every category the app ships with back on its own colour and icon, and
 * leaves anything the reader made — or any default since retired — untouched.
 */
function restoreDefaults(snapshot: Snapshot): Snapshot {
  const canonical = new Map(DEFAULT_CATEGORIES.map((c) => [c.id, c]));
  return {
    ...snapshot,
    categories: snapshot.categories.map((c) => {
      const def = canonical.get(c.id);
      return def ? { ...c, color: def.color, icon: def.icon } : c;
    }),
  };
}

function recolour(snapshot: Snapshot): Snapshot {
  return {
    ...snapshot,
    categories: snapshot.categories.map((c, i) => ({
      ...c,
      color: CATEGORY_COLOR_VALUES[i % CATEGORY_COLOR_VALUES.length],
    })),
  };
}

/**
 * Brings a snapshot up to VERSION. Exported so an exported backup file — which
 * may have been written by an older version of the app — can be imported
 * through exactly the same path as data read from the browser.
 */
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
