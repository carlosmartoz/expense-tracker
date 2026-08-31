import { beforeEach, describe, expect, it } from "vitest";
import { load, save, migrate, VERSION, type Snapshot } from "@/lib/storage";
import { CATEGORY_COLOR_VALUES, DEFAULT_CATEGORIES } from "@/lib/types";
import type { Category, Transaction } from "@/lib/types";

// The one place a mistake silently eats data, so it gets the closest look.

const KEY = "expense-tracker";
const OLD_TX = "expense-tracker:transactions:v2";
const OLD_CAT = "expense-tracker:categories:v1";

// A realistic old install: two keys, no version stamp.
const OLD_TRANSACTIONS = [
  { id: "a", type: "expense", amount: 6500, category: "Food", currency: "ARS",
    description: "Delivery", date: "2026-08-12", tags: ["Credit card"] },
  { id: "b", type: "expense", amount: 4990, category: "Subscriptions",
    description: "Netflix", date: "2026-08-05" },
  { id: "c", type: "income", amount: 950000, category: "Income",
    description: "Salary", date: "2026-08-03", tags: ["Bank transfer"] },
  { id: "d", type: "expense", amount: 8000, category: "custom-1",
    description: "Dentist", date: "2026-08-20" },
];

const OLD_CATEGORIES = [
  { id: "Food", name: "Food", color: "var(--color-cat-food)", icon: "UtensilsCrossed", isDefault: true },
  { id: "Subscriptions", name: "Subscriptions", color: "var(--color-cat-subscriptions)", icon: "Tv", isDefault: true },
  { id: "Debts", name: "Debts", color: "#ef4444", icon: "Landmark", isDefault: true },
  { id: "Income", name: "Income", color: "var(--color-cat-income)", icon: "Wallet", isDefault: true },
  { id: "custom-1", name: "Health", color: "#14b8a6", icon: "Tag", isDefault: false },
];

function seedLegacyKeys() {
  localStorage.setItem(OLD_TX, JSON.stringify(OLD_TRANSACTIONS));
  localStorage.setItem(OLD_CAT, JSON.stringify(OLD_CATEGORIES));
}

function asSnapshot(version: number): Snapshot {
  return {
    version,
    transactions: OLD_TRANSACTIONS as unknown as Transaction[],
    categories: OLD_CATEGORIES as unknown as Category[],
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("a browser with nothing in it", () => {
  it("reports no data rather than an empty snapshot", () => {
    expect(load()).toBeNull();
  });

  it("survives a corrupted payload", () => {
    localStorage.setItem(KEY, "{not json");
    expect(load()).toBeNull();
  });
});

describe("adopting the two old keys", () => {
  it("brings every transaction and category across", () => {
    seedLegacyKeys();
    const out = load();
    expect(out?.transactions).toHaveLength(4);
    expect(out?.categories).toHaveLength(5);
  });

  it("removes the old keys once the new one is written", () => {
    seedLegacyKeys();
    load();
    expect(localStorage.getItem(KEY)).not.toBeNull();
    expect(localStorage.getItem(OLD_TX)).toBeNull();
    expect(localStorage.getItem(OLD_CAT)).toBeNull();
  });

  it("copes when only one of the two keys exists", () => {
    localStorage.setItem(OLD_TX, JSON.stringify(OLD_TRANSACTIONS));
    const out = load();
    expect(out?.transactions).toHaveLength(4);
    expect(out?.categories).toEqual([]);
  });

  it("treats a snapshot written without a version stamp as the first one", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ transactions: OLD_TRANSACTIONS, categories: OLD_CATEGORIES })
    );
    expect(load()?.version).toBe(VERSION);
  });
});

describe("climbing the migration chain", () => {
  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])("reaches the current version starting from v%i", (from) => {
    localStorage.setItem(KEY, JSON.stringify(asSnapshot(from)));
    expect(load()?.version).toBe(VERSION);
  });

  it("drops the per-transaction currency", () => {
    const out = migrate(asSnapshot(1));
    expect(out.transactions.every((t) => !("currency" in t))).toBe(true);
  });

  it("drops tags", () => {
    const out = migrate(asSnapshot(1));
    expect(out.transactions.every((t) => !("tags" in t))).toBe(true);
  });

  it("renames category to categoryId, keeping the value", () => {
    const out = migrate(asSnapshot(1));
    expect(out.transactions.map((t) => t.categoryId)).toEqual([
      "Food",
      "Subscriptions",
      "Income",
      "custom-1",
    ]);
    expect(out.transactions.every((t) => !("category" in t))).toBe(true);
  });

  it("puts the old Income bucket on the income side and everything else on expenses", () => {
    const byId = Object.fromEntries(
      migrate(asSnapshot(1)).categories.map((c) => [c.id, c])
    );
    expect(byId.Income.type).toBe("income");
    expect(byId.Food.type).toBe("expense");
    expect(byId["custom-1"].type).toBe("expense");
  });

  it("drops isDefault", () => {
    const out = migrate(asSnapshot(1));
    expect(out.categories.every((c) => !("isDefault" in c))).toBe(true);
  });

  it("keeps retired defaults, because transactions still point at them", () => {
    const ids = migrate(asSnapshot(1)).categories.map((c) => c.id);
    expect(ids).toContain("Subscriptions");
    expect(ids).toContain("Debts");
  });

  it("does not inject the newer default categories", () => {
    const ids = migrate(asSnapshot(1)).categories.map((c) => c.id);
    expect(ids).not.toContain("Shopping");
    expect(ids).not.toContain("Salary");
  });

  it("leaves every transaction pointing at a category that exists", () => {
    const out = migrate(asSnapshot(1));
    const ids = new Set(out.categories.map((c) => c.id));
    expect(out.transactions.every((t) => ids.has(t.categoryId))).toBe(true);
  });

  it("touches nothing else", () => {
    const out = migrate(asSnapshot(1));
    expect(out.transactions.map((t) => t.amount)).toEqual([6500, 4990, 950000, 8000]);
    expect(out.transactions.map((t) => t.description)).toEqual([
      "Delivery", "Netflix", "Salary", "Dentist",
    ]);
    expect(out.transactions.map((t) => t.date)).toEqual([
      "2026-08-12", "2026-08-05", "2026-08-03", "2026-08-20",
    ]);
  });

  it("puts every category on a colour from the current palette", () => {
    const out = migrate(asSnapshot(1));
    const palette = CATEGORY_COLOR_VALUES;
    expect(out.categories.every((c) => palette.includes(c.color))).toBe(true);
  });

  it("leaves no var() token behind, since those no longer resolve", () => {
    const out = migrate(asSnapshot(1));
    expect(out.categories.some((c) => c.color.startsWith("var("))).toBe(false);
  });

  it("puts each shipped category back on its own colour and icon", () => {
    const out = migrate(asSnapshot(1));
    for (const def of DEFAULT_CATEGORIES) {
      const got = out.categories.find((c) => c.id === def.id);
      if (!got) continue; // the fixture doesn't carry every default
      expect(got.color).toBe(def.color);
      expect(got.icon).toBe(def.icon);
    }
  });

  it("leaves a category the reader made alone", () => {
    const out = migrate(asSnapshot(1));
    const custom = out.categories.find((c) => c.id === "custom-1");
    expect(custom?.name).toBe("Health");
    // Subscriptions is retired and stays exactly as the reader left it.
    const retired = out.categories.find((c) => c.id === "Subscriptions");
    expect(retired).toBeTruthy();
  });

  // No "every category has its own colour" check on purpose: with one colour
  // per default, anything else must share. types.test.ts covers the shipped set.

  it("changes nothing when it runs again", () => {
    const once = migrate(asSnapshot(1));
    const twice = migrate(once);
    expect(twice).toEqual(once);
  });

  it("leaves a snapshot that is already current alone", () => {
    const current: Omit<Snapshot, "version"> = {
      transactions: [{ id: "z", type: "income", amount: 10, categoryId: "Salary", description: "x", date: "2026-01-01" }],
      categories: [{ id: "Salary", name: "Salary", color: "#ec4899", icon: "Wallet", type: "income" }],
    };
    save(current);
    const out = load();
    expect(out?.transactions[0].categoryId).toBe("Salary");
    expect(out?.categories[0].type).toBe("income");
  });
});

describe("what actually lands in storage", () => {
  it("carries no trace of the retired fields", () => {
    localStorage.setItem(KEY, JSON.stringify(asSnapshot(1)));
    const migrated = load()!;
    save({ transactions: migrated.transactions, categories: migrated.categories });
    const raw = localStorage.getItem(KEY)!;
    expect(raw).not.toContain('"currency"');
    expect(raw).not.toContain('"tags"');
    expect(raw).not.toContain('"isDefault"');
    expect(raw).not.toContain('"category":');
  });

  it("stamps the current version on write", () => {
    save({ transactions: [], categories: [] });
    expect(JSON.parse(localStorage.getItem(KEY)!).version).toBe(VERSION);
  });
});

describe("starting over", () => {
  it("leaves no key behind", () => {
    save({
      transactions: [
        { id: "a", type: "expense", amount: 10, categoryId: "Food", description: "x", date: "2026-01-01" },
      ],
      categories: DEFAULT_CATEGORIES,
    });
    expect(localStorage.getItem(KEY)).not.toBeNull();

    save({ transactions: [], categories: DEFAULT_CATEGORIES });
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(load()).toBeNull();
  });

  it("also drops the keys written by older versions", () => {
    localStorage.setItem(OLD_TX, "[]");
    localStorage.setItem(OLD_CAT, "[]");
    save({ transactions: [], categories: DEFAULT_CATEGORIES });
    expect(localStorage.getItem(OLD_TX)).toBeNull();
    expect(localStorage.getItem(OLD_CAT)).toBeNull();
  });

  it("keeps storing once a category has been added", () => {
    const withCustom = [
      ...DEFAULT_CATEGORIES,
      { id: "mine", name: "Pets", color: "#ef4444", icon: "Tag", type: "expense" as const },
    ];
    save({ transactions: [], categories: withCustom });
    expect(localStorage.getItem(KEY)).not.toBeNull();
    expect(load()?.categories).toHaveLength(withCustom.length);
  });
});
