import { beforeEach, describe, expect, it } from "vitest";
import { clear, load, save } from "@/lib/storage";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import type { Category, Snapshot, Transaction } from "@/types";

// The one place a mistake silently eats data, so it gets the closest look.

const KEY = "expense-tracker";

const CUSTOM: Category = {
  id: "custom-1",
  name: "Dentist",
  color: "#14b8a6",
  icon: "Tag",
  type: "expense",
};

const TX: Transaction[] = [
  {
    id: "a",
    type: "expense",
    amount: 9500,
    currency: "ARS",
    categoryId: "Supermarket",
    description: "Supermarket",
    date: "2026-08-26",
  },
  {
    id: "b",
    type: "income",
    amount: 950000,
    currency: "USD",
    categoryId: "Salary",
    description: "Salary",
    date: "2026-08-03",
  },
];

function stored(): unknown {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
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

  it("survives a payload that isn't an object", () => {
    localStorage.setItem(KEY, '"hello"');
    expect(load()).toBeNull();
  });
});

describe("a round-trip", () => {
  const snapshot: Snapshot = {
    transactions: TX,
    categories: [...DEFAULT_CATEGORIES, CUSTOM],
  };

  it("brings back exactly what went in", () => {
    save(snapshot);
    expect(load()).toEqual(snapshot);
  });

  it("keeps every transaction on its own currency", () => {
    save(snapshot);
    expect(load()?.transactions.map((t) => t.currency)).toEqual(["ARS", "USD"]);
  });

  it("writes nothing but transactions and categories", () => {
    save(snapshot);
    expect(Object.keys(stored() as object).sort()).toEqual([
      "categories",
      "transactions",
    ]);
  });
});

describe("data that isn't in the current shape", () => {
  it("is refused when a transaction is missing fields", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ transactions: [{ id: "a" }], categories: [] }),
    );
    expect(load()).toBeNull();
  });

  it("is refused when a transaction has no currency", () => {
    const { currency, ...rest } = TX[0];
    void currency;
    localStorage.setItem(
      KEY,
      JSON.stringify({ transactions: [rest], categories: DEFAULT_CATEGORIES }),
    );
    expect(load()).toBeNull();
  });

  it("is refused when a currency isn't one the app knows", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        transactions: [{ ...TX[0], currency: "XYZ" }],
        categories: DEFAULT_CATEGORIES,
      }),
    );
    expect(load()).toBeNull();
  });

  it("is refused when a category is missing fields", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ transactions: [], categories: [{ id: "Food" }] }),
    );
    expect(load()).toBeNull();
  });

  it("is refused when transactions and categories aren't arrays", () => {
    localStorage.setItem(KEY, JSON.stringify({ transactions: 1, categories: 2 }));
    expect(load()).toBeNull();
  });
});

describe("starting over", () => {
  it("leaves no key behind", () => {
    save({ transactions: TX, categories: DEFAULT_CATEGORIES });
    save({ transactions: [], categories: DEFAULT_CATEGORIES });
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(load()).toBeNull();
  });

  it("keeps storing once a category has been added", () => {
    save({ transactions: [], categories: [...DEFAULT_CATEGORIES, CUSTOM] });
    expect(load()?.categories).toHaveLength(DEFAULT_CATEGORIES.length + 1);
  });

  it("keeps storing once a default has been removed", () => {
    save({ transactions: [], categories: DEFAULT_CATEGORIES.slice(1) });
    expect(load()?.categories).toHaveLength(DEFAULT_CATEGORIES.length - 1);
  });

  it("clear removes the key on its own", () => {
    save({ transactions: TX, categories: DEFAULT_CATEGORIES });
    clear();
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
