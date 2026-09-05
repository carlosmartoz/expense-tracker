import { describe, expect, it } from "vitest";
import { initialState, reducer, type StoreState } from "@/lib/storeReducer";
import { DEFAULT_CATEGORIES } from "@/lib/types";
import type { Category, Transaction } from "@/lib/types";

// The rules used to live inside the provider, where only a browser could reach
// them. As a plain function they are checkable one rule at a time.

function tx(over: Partial<Transaction> = {}): Transaction {
  return {
    id: "t1",
    type: "expense",
    amount: 1000,
    currency: "USD",
    categoryId: "Food",
    description: "Lunch",
    date: "2026-08-10",
    ...over,
  };
}

const CUSTOM: Category = {
  id: "custom-1",
  name: "Dentist",
  color: "#14b8a6",
  icon: "Tag",
  type: "expense",
};

function stateWith(over: Partial<StoreState> = {}): StoreState {
  return { ...initialState, hydrated: true, ...over };
}

describe("hydration", () => {
  it("falls back to the shipped categories when nothing is stored", () => {
    const next = reducer(initialState, { type: "hydrated", snapshot: null });
    expect(next.transactions).toEqual([]);
    expect(next.categories).toEqual(DEFAULT_CATEGORIES);
    expect(next.hydrated).toBe(true);
  });

  it("treats an empty stored category list as no list at all", () => {
    const next = reducer(initialState, {
      type: "hydrated",
      snapshot: { transactions: [tx()], categories: [] },
    });
    expect(next.categories).toEqual(DEFAULT_CATEGORIES);
    expect(next.transactions).toHaveLength(1);
  });
});

describe("transactions", () => {
  it("stamps the given id and keeps the ledger newest-first", () => {
    let s = stateWith();
    s = reducer(s, {
      type: "transaction/add",
      id: "a",
      draft: tx({ date: "2026-01-01" }),
    });
    s = reducer(s, {
      type: "transaction/add",
      id: "b",
      draft: tx({ date: "2026-09-01" }),
    });
    s = reducer(s, {
      type: "transaction/add",
      id: "c",
      draft: tx({ date: "2026-05-01" }),
    });
    expect(s.transactions.map((t) => t.id)).toEqual(["b", "c", "a"]);
  });

  it("re-sorts when an edit moves a transaction's date", () => {
    let s = stateWith({
      transactions: [
        tx({ id: "a", date: "2026-09-01" }),
        tx({ id: "b", date: "2026-01-01" }),
      ],
    });
    s = reducer(s, {
      type: "transaction/update",
      id: "a",
      patch: tx({ date: "2025-01-01" }),
    });
    expect(s.transactions.map((t) => t.id)).toEqual(["b", "a"]);
  });

  it("deletes by id and leaves the rest alone", () => {
    const s = reducer(
      stateWith({ transactions: [tx({ id: "a" }), tx({ id: "b" })] }),
      { type: "transaction/delete", id: "a" }
    );
    expect(s.transactions.map((t) => t.id)).toEqual(["b"]);
  });
});

describe("adding a category", () => {
  it("trims the name and files it under the Tag icon", () => {
    const s = reducer(stateWith(), {
      type: "category/add",
      id: "new",
      draft: { name: "  Books  ", color: "#fff", type: "expense" },
    });
    expect(s.categories.find((c) => c.id === "new")).toMatchObject({
      name: "Books",
      icon: "Tag",
      type: "expense",
    });
  });

  it("refuses a blank name", () => {
    const before = stateWith();
    const after = reducer(before, {
      type: "category/add",
      id: "new",
      draft: { name: "   ", color: "#fff", type: "expense" },
    });
    expect(after).toBe(before);
  });

  it("refuses a name already taken on the same side, ignoring case", () => {
    const before = stateWith();
    const after = reducer(before, {
      type: "category/add",
      id: "new",
      draft: { name: "food", color: "#fff", type: "expense" },
    });
    expect(after).toBe(before);
  });

  it("allows the same name on the other side of the book", () => {
    const s = reducer(stateWith(), {
      type: "category/add",
      id: "new",
      draft: { name: "Food", color: "#fff", type: "income" },
    });
    expect(s.categories.some((c) => c.id === "new")).toBe(true);
  });
});

describe("editing a category", () => {
  it("renames and recolours a custom one", () => {
    const s = reducer(
      stateWith({ categories: [...DEFAULT_CATEGORIES, CUSTOM] }),
      { type: "category/update", id: CUSTOM.id, patch: { name: "  Doctor ", color: "#000" } }
    );
    expect(s.categories.at(-1)).toMatchObject({ name: "Doctor", color: "#000" });
  });

  it("refuses to touch a default", () => {
    const before = stateWith();
    const after = reducer(before, {
      type: "category/update",
      id: "Food",
      patch: { name: "Groceries" },
    });
    expect(after).toBe(before);
  });

  it("keeps the old name when the patch trims to nothing", () => {
    const s = reducer(stateWith({ categories: [CUSTOM] }), {
      type: "category/update",
      id: CUSTOM.id,
      patch: { name: "   ", color: "#000" },
    });
    expect(s.categories[0]).toMatchObject({ name: "Dentist", color: "#000" });
  });
});

describe("deleting a category", () => {
  const base = stateWith({
    categories: [...DEFAULT_CATEGORIES, CUSTOM],
    transactions: [tx({ id: "a", categoryId: CUSTOM.id }), tx({ id: "b" })],
  });

  it("moves the orphaned transactions to the destination", () => {
    const s = reducer(base, {
      type: "category/delete",
      id: CUSTOM.id,
      moveToId: "Other",
    });
    expect(s.categories.some((c) => c.id === CUSTOM.id)).toBe(false);
    expect(s.transactions.find((t) => t.id === "a")?.categoryId).toBe("Other");
    expect(s.transactions.find((t) => t.id === "b")?.categoryId).toBe("Food");
  });

  it("refuses to delete a default", () => {
    const after = reducer(base, {
      type: "category/delete",
      id: "Food",
      moveToId: "Other",
    });
    expect(after).toBe(base);
  });

  it("refuses when the destination does not exist", () => {
    const after = reducer(base, {
      type: "category/delete",
      id: CUSTOM.id,
      moveToId: "nope",
    });
    expect(after).toBe(base);
  });

  it("refuses to move a category into itself", () => {
    const after = reducer(base, {
      type: "category/delete",
      id: CUSTOM.id,
      moveToId: CUSTOM.id,
    });
    expect(after).toBe(base);
  });

  it("never empties a side of the book", () => {
    const lonely = stateWith({ categories: [CUSTOM], transactions: [] });
    const after = reducer(lonely, {
      type: "category/delete",
      id: CUSTOM.id,
      moveToId: CUSTOM.id,
    });
    expect(after).toBe(lonely);
  });
});

describe("wholesale changes", () => {
  it("clearAll goes back to an empty ledger on the shipped categories", () => {
    const s = reducer(stateWith({ categories: [CUSTOM], transactions: [tx()] }), {
      type: "clearAll",
    });
    expect(s.transactions).toEqual([]);
    expect(s.categories).toEqual(DEFAULT_CATEGORIES);
  });

  it("replaceAll sorts the imported ledger", () => {
    const s = reducer(stateWith(), {
      type: "replaceAll",
      transactions: [
        tx({ id: "a", date: "2026-01-01" }),
        tx({ id: "b", date: "2026-09-01" }),
      ],
      categories: [CUSTOM],
    });
    expect(s.transactions.map((t) => t.id)).toEqual(["b", "a"]);
    expect(s.categories).toEqual([CUSTOM]);
  });

  it("replaceAll keeps the current categories when the import has none", () => {
    const s = reducer(stateWith({ categories: [CUSTOM] }), {
      type: "replaceAll",
      transactions: [],
      categories: [],
    });
    expect(s.categories).toEqual([CUSTOM]);
  });

  it("addMissingDefaults tops up an older ledger without duplicating", () => {
    const short = stateWith({ categories: [DEFAULT_CATEGORIES[0], CUSTOM] });
    const s = reducer(short, { type: "category/addMissingDefaults" });
    expect(s.categories).toHaveLength(DEFAULT_CATEGORIES.length + 1);
    const ids = s.categories.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("addMissingDefaults is a no-op when nothing is missing", () => {
    const before = stateWith();
    expect(reducer(before, { type: "category/addMissingDefaults" })).toBe(before);
  });
});
