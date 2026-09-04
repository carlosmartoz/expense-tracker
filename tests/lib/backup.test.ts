import { describe, expect, it } from "vitest";
import { BackupError, backupFilename, parseJSON, toJSON } from "@/lib/backup";
import { VERSION } from "@/lib/storage";
import { DEFAULT_CATEGORIES, type Transaction } from "@/lib/types";

// A ledger with both sides of the book and both currencies in it: enough shape
// that a round-trip has something to lose.
const CATS = DEFAULT_CATEGORIES;
const TX: Transaction[] = [
  { id: "a", type: "expense", amount: 9500, currency: "ARS",
    categoryId: "Supermarket", description: "Supermarket", date: "2026-08-26" },
  { id: "b", type: "income", amount: 950000, currency: "ARS",
    categoryId: "Salary", description: "Salary", date: "2026-08-03" },
  { id: "c", type: "expense", amount: 59.99, currency: "USD",
    categoryId: "Gaming", description: "Steam", date: "2026-08-14" },
  { id: "d", type: "income", amount: 1200, currency: "USD",
    categoryId: "OtherIncome", description: "Freelance", date: "2026-08-20" },
];

describe("JSON round-trip", () => {
  it("returns exactly what went in", () => {
    const out = parseJSON(toJSON({ transactions: TX, categories: CATS }));
    expect(out.transactions).toEqual(TX);
    expect(out.categories).toEqual(CATS);
  });

  it("stamps the current version on the way out", () => {
    expect(JSON.parse(toJSON({ transactions: TX, categories: CATS })).version)
      .toBe(VERSION);
  });

  it("brings each amount back in the currency it left in", () => {
    const out = parseJSON(toJSON({ transactions: TX, categories: CATS }));
    expect(out.transactions.map((t) => t.currency)).toEqual([
      "ARS", "ARS", "USD", "USD",
    ]);
  });

  it("reads a backup written before these changes", () => {
    const old = JSON.stringify({
      version: 1,
      transactions: [
        { id: "a", type: "expense", amount: 6500, category: "Food", currency: "ARS",
          description: "Delivery", date: "2026-08-12", tags: ["Credit card"] },
      ],
      categories: [
        { id: "Food", name: "Food", color: "#f59e0b", icon: "UtensilsCrossed", isDefault: true },
      ],
    });
    const out = parseJSON(old);
    expect(out.version).toBe(VERSION);
    expect(out.transactions[0].categoryId).toBe("Food");
    expect(out.transactions[0]).not.toHaveProperty("tags");
    // A file from before the choice existed comes back in the default.
    expect(out.transactions[0].currency).toBe("ARS");
  });

  it.each([
    ["not JSON at all", "{nope", "valid JSON"],
    ["JSON that isn't a backup", '{"hello":1}', "backup"],
    ["transactions missing fields", '{"transactions":[{"id":"a"}],"categories":[]}', "missing fields"],
    [
      "a currency that isn't one",
      '{"transactions":[{"id":"a","type":"expense","amount":1,"date":"2026-01-01","currency":"XYZ"}],"categories":[]}',
      "missing fields",
    ],
  ])("refuses %s with a readable message", (_label, input, fragment) => {
    expect(() => parseJSON(input)).toThrow(BackupError);
    expect(() => parseJSON(input)).toThrow(new RegExp(fragment));
  });
});

describe("the backup filename", () => {
  it("names the app and dates the file", () => {
    expect(backupFilename()).toMatch(
      /^expense-tracker-\d{4}-\d{2}-\d{2}\.json$/
    );
  });
});
