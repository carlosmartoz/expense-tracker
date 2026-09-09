import { describe, expect, it } from "vitest";
import { BackupError, backupFilename, parseJSON, toJSON } from "@/lib/backup";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import type { Transaction } from "@/types";

// Data with both transaction types and both currencies.
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

  it("writes nothing but transactions and categories", () => {
    const out = JSON.parse(toJSON({ transactions: TX, categories: CATS }));
    expect(Object.keys(out).sort()).toEqual(["categories", "transactions"]);
  });

  it("brings each amount back in the currency it left in", () => {
    const out = parseJSON(toJSON({ transactions: TX, categories: CATS }));
    expect(out.transactions.map((t) => t.currency)).toEqual([
      "ARS", "ARS", "USD", "USD",
    ]);
  });

  it("refuses a file written in an older format", () => {
    const old = JSON.stringify({
      version: 1,
      transactions: [
        { id: "a", type: "expense", amount: 6500, category: "Food",
          description: "Delivery", date: "2026-08-12", tags: ["Credit card"] },
      ],
      categories: [
        { id: "Food", name: "Food", color: "#f59e0b", icon: "UtensilsCrossed", isDefault: true },
      ],
    });
    expect(() => parseJSON(old)).toThrow(BackupError);
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
    [
      "categories missing fields",
      '{"transactions":[],"categories":[{"id":"Food"}]}',
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
