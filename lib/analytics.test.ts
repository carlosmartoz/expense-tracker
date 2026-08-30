import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  expenseByCategory,
  pctChange,
  sortedMonthKeys,
  summarizeAllMonths,
  summarizeMonth,
} from "./analytics";
import type { Transaction } from "./types";

const SAMPLE = JSON.parse(
  readFileSync("sample-data.json", "utf8")
) as { transactions: Transaction[] };

const TX = SAMPLE.transactions;
const MONTHS = summarizeAllMonths(TX);

/** Sums a month straight from the rows, independently of the code under test. */
function sumMonth(monthKey: string) {
  const rows = TX.filter((t) => t.date.startsWith(monthKey));
  const income = rows
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expense = rows
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense };
}

describe("monthly summaries", () => {
  it("finds the months in order, without repeats", () => {
    const keys = sortedMonthKeys(TX);
    expect(keys).toEqual([...keys].sort());
    expect(new Set(keys).size).toBe(keys.length);
  });

  it.each(MONTHS.map((m) => m.monthKey))(
    "matches an independent sum for %s",
    (monthKey) => {
      const expected = sumMonth(monthKey);
      const got = summarizeMonth(TX, monthKey);
      expect(got.income).toBe(expected.income);
      expect(got.expense).toBe(expected.expense);
      expect(got.balance).toBe(expected.balance);
    }
  );

  it("adds up to the whole file", () => {
    expect(MONTHS.reduce((s, m) => s + m.income, 0)).toBe(
      TX.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
    );
    expect(MONTHS.reduce((s, m) => s + m.expense, 0)).toBe(
      TX.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
    );
  });

  it("counts only expenses in the per-category breakdown", () => {
    const m = MONTHS[MONTHS.length - 1];
    const total = Object.values(m.byCategory).reduce((s, v) => s + v, 0);
    expect(total).toBe(m.expense);
  });

  it("reports a zero savings rate rather than dividing by zero", () => {
    const noIncome = summarizeMonth(
      [{ id: "a", type: "expense", amount: 100, categoryId: "Food", description: "x", date: "2030-01-05" }],
      "2030-01"
    );
    expect(noIncome.income).toBe(0);
    expect(noIncome.savingsRate).toBe(0);
  });

  it("returns an empty month for a key with nothing in it", () => {
    const empty = summarizeMonth(TX, "1999-01");
    expect(empty).toMatchObject({ income: 0, expense: 0, balance: 0, savingsRate: 0 });
  });
});

describe("expenses by category", () => {
  const slices = expenseByCategory(TX, MONTHS[MONTHS.length - 1].monthKey);

  it("sums to that month's expenses", () => {
    expect(slices.reduce((s, x) => s + x.amount, 0)).toBe(
      MONTHS[MONTHS.length - 1].expense
    );
  });

  it("reaches 100 per cent", () => {
    expect(slices.reduce((s, x) => s + x.percent, 0)).toBeCloseTo(100, 9);
  });

  it("comes back biggest first", () => {
    const amounts = slices.map((s) => s.amount);
    expect(amounts).toEqual([...amounts].sort((a, b) => b - a));
  });

  it("leaves income out of it", () => {
    const incomeIds = new Set(
      TX.filter((t) => t.type === "income").map((t) => t.categoryId)
    );
    expect(slices.every((s) => !incomeIds.has(s.categoryId))).toBe(true);
  });

  it("covers every month when no month is given", () => {
    expect(expenseByCategory(TX).reduce((s, x) => s + x.amount, 0)).toBe(
      TX.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
    );
  });
});

describe("percentage change", () => {
  it("measures the move from the earlier figure", () => {
    expect(pctChange(150, 100)).toBeCloseTo(50);
    expect(pctChange(50, 100)).toBeCloseTo(-50);
  });

  it("returns null instead of Infinity when there is no baseline", () => {
    expect(pctChange(100, 0)).toBeNull();
  });

  it("calls nothing-to-nothing flat", () => {
    expect(pctChange(0, 0)).toBe(0);
  });
});
