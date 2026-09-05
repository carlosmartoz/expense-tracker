import { describe, expect, it } from "vitest";
import { currenciesUsed, sumByCurrency, sumEveryCurrency } from "@/lib/totals";
import type { Transaction } from "@/lib/types";
import type { CurrencyCode } from "@/lib/config";

// The rule the whole feature rests on: currencies are counted apart, never
// added together. A single figure would need a rate, and this app has none.

let n = 0;
function tx(
  type: Transaction["type"],
  amount: number,
  currency: CurrencyCode = "ARS"
): Transaction {
  return {
    id: `t${n++}`,
    type,
    amount,
    currency,
    categoryId: "Other",
    description: "x",
    date: "2026-08-01",
  };
}

describe("totalling a ledger", () => {
  it("balances income against expenses", () => {
    const out = sumByCurrency([tx("income", 1000), tx("expense", 250)]);
    expect(out).toEqual([
      { currency: "ARS", income: 1000, expense: 250, balance: 750 },
    ]);
  });

  it("goes negative when more went out than came in", () => {
    const out = sumByCurrency([tx("income", 100), tx("expense", 400)]);
    expect(out[0].balance).toBe(-300);
  });

  it("still gives a figure for an empty ledger", () => {
    expect(sumByCurrency([])).toEqual([
      { currency: "ARS", income: 0, expense: 0, balance: 0 },
    ]);
  });
});

describe("two currencies in one ledger", () => {
  const mixed = [
    tx("income", 950000, "ARS"),
    tx("expense", 6500, "ARS"),
    tx("income", 1200, "USD"),
    tx("expense", 59.99, "USD"),
  ];

  it("keeps them apart", () => {
    expect(sumByCurrency(mixed)).toEqual([
      { currency: "ARS", income: 950000, expense: 6500, balance: 943500 },
      { currency: "USD", income: 1200, expense: 59.99, balance: 1140.01 },
    ]);
  });

  it("never adds one into the other", () => {
    const totals = sumByCurrency(mixed);
    const everything = 950000 - 6500 + 1200 - 59.99;
    expect(totals.some((t) => t.balance === everything)).toBe(false);
  });

  it("reports only the currencies actually present", () => {
    expect(currenciesUsed([tx("expense", 10, "USD")])).toEqual(["USD"]);
    expect(currenciesUsed(mixed)).toEqual(["ARS", "USD"]);
  });

  it("orders them the way the config declares them, not by first seen", () => {
    const usdFirst = [tx("expense", 10, "USD"), tx("expense", 10, "ARS")];
    expect(sumByCurrency(usdFirst).map((t) => t.currency)).toEqual(["ARS", "USD"]);
  });
});

describe("data that shouldn't exist but might", () => {
  it("counts a transaction with no currency as the default", () => {
    const orphan = { ...tx("expense", 10), currency: undefined };
    const out = sumByCurrency([orphan as unknown as Transaction]);
    expect(out).toEqual([
      { currency: "ARS", income: 0, expense: 10, balance: -10 },
    ]);
  });

  it("sorts a code it doesn't know last rather than first", () => {
    const odd = { ...tx("expense", 10), currency: "XYZ" };
    const out = sumByCurrency([odd as unknown as Transaction, tx("expense", 5)]);
    expect(out.map((t) => t.currency)).toEqual(["ARS", "XYZ"]);
  });
});

// The summary reads off this one, so its shape has to be the same every render:
// a row appearing mid-session would shove the history down the page.
describe("the summary's fixed set of rows", () => {
  it("gives every declared currency a row, in declaration order", () => {
    expect(sumEveryCurrency([]).map((t) => t.currency)).toEqual(["ARS", "USD"]);
  });

  it("zeroes the ones the ledger doesn't use", () => {
    const out = sumEveryCurrency([tx("income", 500)]);
    expect(out).toEqual([
      { currency: "ARS", income: 500, expense: 0, balance: 500 },
      { currency: "USD", income: 0, expense: 0, balance: 0 },
    ]);
  });

  it("keeps the row set identical whichever currency is in use", () => {
    const onlyArs = sumEveryCurrency([tx("expense", 10)]);
    const onlyUsd = sumEveryCurrency([tx("expense", 10, "USD")]);
    expect(onlyUsd.map((t) => t.currency)).toEqual(onlyArs.map((t) => t.currency));
  });

  it("totals the used ones exactly as sumByCurrency does", () => {
    const mixed = [tx("income", 1000), tx("expense", 250, "USD")];
    for (const row of sumByCurrency(mixed)) {
      expect(sumEveryCurrency(mixed)).toContainEqual(row);
    }
  });

  it("still shows a code the config doesn't declare, and shows it last", () => {
    const odd = { ...tx("income", 7), currency: "BRL" };
    const out = sumEveryCurrency([odd as unknown as Transaction]);
    expect(out.map((t) => t.currency)).toEqual(["ARS", "USD", "BRL"]);
    expect(out.at(-1)).toMatchObject({ income: 7, balance: 7 });
  });
});
