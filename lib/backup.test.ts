import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  BackupError,
  backupFilename,
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

describe("the CSV export", () => {
  const csv = toCSV(TX, CATS);
  const lines = csv.trim().split("\n");

  it("writes a header and one line per transaction", () => {
    expect(lines[0]).toBe("date,type,category,amount,description");
    expect(lines).toHaveLength(TX.length + 1);
  });

  it("writes category names, not ids", () => {
    expect(csv).toContain(",Salary,");
  });

  it("writes amounts a spreadsheet can add up", () => {
    const total = lines
      .slice(1)
      .reduce((sum, line) => sum + Number(line.split(",")[3]), 0);
    expect(total).toBe(TX.reduce((s, t) => s + t.amount, 0));
  });

  it("escapes commas and quotes, and keeps each row on one line", () => {
    const tricky: Transaction[] = [
      {
        id: "x",
        type: "expense",
        amount: 1500,
        categoryId: "Food",
        description: 'Lunch, "the good one"\nwith a line break',
        date: "2026-08-01",
      },
    ];
    const out = toCSV(tricky, CATS);
    expect(out.trim().split(/\r?\n/)).toHaveLength(2);
    expect(out).toContain('"Lunch, ""the good one"" with a line break"');
  });
});

describe("backup filenames", () => {
  it.each(["json", "csv"] as const)("dates the %s file", (ext) => {
    expect(backupFilename(ext)).toMatch(
      new RegExp(`^expense-tracker-\\d{4}-\\d{2}-\\d{2}\\.${ext}$`)
    );
  });
});
