import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  BackupError,
  backupFilename,
  parseCSV,
  parseJSON,
  toCSV,
  toJSON,
} from "./backup";
import { VERSION } from "./storage";
import type { Category, Transaction } from "./types";

/** The demo file the repo ships, used as a realistic fixture. */
const SAMPLE = JSON.parse(
  readFileSync("sample-data.json", "utf8")
) as { transactions: Transaction[]; categories: Category[] };

const { transactions: TX, categories: CATS } = SAMPLE;

describe("the sample file the repo ships", () => {
  it("imports as a valid backup", () => {
    const out = parseJSON(JSON.stringify(SAMPLE));
    expect(out.transactions.length).toBeGreaterThan(0);
  });

  it("has no transaction pointing at a category that isn't there", () => {
    const ids = new Set(CATS.map((c) => c.id));
    expect(TX.every((t) => ids.has(t.categoryId))).toBe(true);
  });
});

describe("JSON round-trip", () => {
  it("returns exactly what went in", () => {
    const out = parseJSON(toJSON({ transactions: TX, categories: CATS }));
    expect(out.transactions).toEqual(TX);
    expect(out.categories).toEqual(CATS);
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
    expect(out.transactions[0]).not.toHaveProperty("currency");
    expect(out.transactions[0]).not.toHaveProperty("tags");
  });

  it.each([
    ["not JSON at all", "{nope", "valid JSON"],
    ["JSON that isn't a backup", '{"hello":1}', "backup"],
    ["transactions missing fields", '{"transactions":[{"id":"a"}],"categories":[]}', "missing fields"],
  ])("refuses %s with a readable message", (_label, input, fragment) => {
    expect(() => parseJSON(input)).toThrow(BackupError);
    expect(() => parseJSON(input)).toThrow(new RegExp(fragment));
  });
});

describe("CSV round-trip", () => {
  const csv = toCSV(TX, CATS);

  it("writes a header and one line per transaction", () => {
    const lines = csv.trim().split("\n");
    expect(lines[0]).toBe("date,type,category,amount,description");
    expect(lines).toHaveLength(TX.length + 1);
  });

  it("writes category names, not ids", () => {
    expect(csv).toContain(",Salary,");
  });

  it("comes back with the same transactions and the same totals", () => {
    const out = parseCSV(csv, CATS);
    expect(out.transactions).toHaveLength(TX.length);
    expect(out.transactions.reduce((s, t) => s + t.amount, 0)).toBe(
      TX.reduce((s, t) => s + t.amount, 0)
    );
    expect(out.categories).toHaveLength(CATS.length);
  });

  // "Other" exists on both sides, so matching by name alone would merge them.
  it("keeps the two categories named Other apart", () => {
    const expense = CATS.find((c) => c.name === "Other" && c.type === "expense")!;
    const income = CATS.find((c) => c.name === "Other" && c.type === "income")!;
    expect(expense && income).toBeTruthy();

    const out = parseCSV(
      "date,type,category,amount,description\n" +
        "2026-08-01,expense,Other,100,spent\n" +
        "2026-08-02,income,Other,200,earned\n",
      CATS
    );
    expect(out.transactions[0].categoryId).toBe(expense.id);
    expect(out.transactions[1].categoryId).toBe(income.id);
    expect(out.categories).toHaveLength(CATS.length);
  });

  it("escapes commas and quotes, and keeps each row on one line", () => {
    const tricky: Transaction[] = [
      { id: "x", type: "expense", amount: 1500, categoryId: "Food",
        description: 'Lunch, "the good one"\nwith a line break', date: "2026-08-01" },
    ];
    const out = toCSV(tricky, CATS);
    expect(out.trim().split(/\r?\n/)).toHaveLength(2);
    expect(parseCSV(out, CATS).transactions[0].description).toBe(
      'Lunch, "the good one" with a line break'
    );
  });

  it("reads columns by name, in any order", () => {
    const out = parseCSV(
      "description,amount,category,type,date\nDinner,900,Food,expense,2026-08-04\n",
      CATS
    );
    expect(out.transactions[0]).toMatchObject({
      amount: 900,
      description: "Dinner",
      date: "2026-08-04",
      type: "expense",
    });
  });

  it("creates a category a foreign file names but we don't have", () => {
    const out = parseCSV(
      "date,type,category,amount,description\n2026-08-01,expense,Pets,4200,Vet\n",
      CATS
    );
    const pets = out.categories.find((c) => c.name === "Pets");
    expect(pets?.type).toBe("expense");
    expect(out.transactions[0].categoryId).toBe(pets!.id);
  });

  it.each([
    ["a missing column", "date,type,category,description\n", "amount"],
    ["a date that isn't a date", "date,type,category,amount,description\nyesterday,expense,Food,10,x\n", "YYYY-MM-DD"],
    ["an unknown type", "date,type,category,amount,description\n2026-08-01,spent,Food,10,x\n", "income or expense"],
    ["a negative amount", "date,type,category,amount,description\n2026-08-01,expense,Food,-10,x\n", "greater than 0"],
    ["a header with no rows", "date,type,category,amount,description\n", "no rows"],
    ["an empty file", "", "empty"],
  ])("refuses %s", (_label, input, fragment) => {
    expect(() => parseCSV(input, CATS)).toThrow(BackupError);
    expect(() => parseCSV(input, CATS)).toThrow(new RegExp(fragment));
  });

  it("names the offending row so it can be found", () => {
    expect(() =>
      parseCSV(
        "date,type,category,amount,description\n" +
          "2026-08-01,expense,Food,10,fine\n" +
          "2026-08-02,expense,Food,nope,broken\n",
        CATS
      )
    ).toThrow(/Row 3/);
  });
});

describe("backup filenames", () => {
  it.each(["json", "csv"] as const)("dates the %s file", (ext) => {
    expect(backupFilename(ext)).toMatch(
      new RegExp(`^expense-tracker-\\d{4}-\\d{2}-\\d{2}\\.${ext}$`)
    );
  });
});
