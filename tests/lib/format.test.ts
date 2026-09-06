import { describe, expect, it } from "vitest";
import {
  formatAmount,
  formatAmountInput,
  formatDate,
  formatMoney,
  formatMonthKey,
  MAX_AMOUNT,
  monthKeyOf,
  parseAmount,
  sortedMonthKeys,
} from "@/lib/format";
import { MAX_AMOUNT_INTEGER_DIGITS } from "@/lib/types";
import { DEFAULT_CURRENCY } from "@/lib/config";

// English text, Argentine money.

describe("money", () => {
  it.each([
    [0, "$ 0,00"],
    [1234.5, "$ 1.234,50"],
    [2672371, "$ 2.672.371,00"],
    [950000, "$ 950.000,00"],
  ])("formats %d as %s", (input, expected) => {
    expect(formatMoney(input)).toBe(expected);
  });

  it("puts the minus sign ahead of the symbol", () => {
    expect(formatMoney(-38000)).toBe("-$ 38.000,00");
  });

  it("falls back to zero rather than printing NaN", () => {
    expect(formatMoney(Number.NaN)).toBe("$ 0,00");
    expect(formatAmount(Number.POSITIVE_INFINITY)).toBe("0,00");
  });
});

// Two currencies, one grouping; only the symbol differs.
describe("which currency an amount is in", () => {
  it("defaults to the one everything was written in before there was a choice", () => {
    expect(formatMoney(1234.5)).toBe(formatMoney(1234.5, DEFAULT_CURRENCY));
    expect(DEFAULT_CURRENCY).toBe("ARS");
  });

  it.each([
    ["ARS", "$ 1.234,50"],
    ["USD", "US$ 1.234,50"],
  ] as const)("marks %s as %s", (currency, expected) => {
    expect(formatMoney(1234.5, currency)).toBe(expected);
  });

  it("groups both the same way, so only the symbol differs", () => {
    const [ars, usd] = [formatMoney(2672371, "ARS"), formatMoney(2672371, "USD")];
    expect(ars.replace("$ ", "")).toBe(usd.replace("US$ ", ""));
  });

  it("keeps the minus ahead of the symbol", () => {
    expect(formatMoney(-150, "USD")).toBe("-US$ 150,00");
  });

  it("falls back rather than printing nothing for a code it doesn't know", () => {
    const unknown = "XYZ" as unknown as typeof DEFAULT_CURRENCY;
    expect(formatMoney(150, unknown)).toBe(formatMoney(150, DEFAULT_CURRENCY));
  });
});

describe("reading what was typed", () => {
  it.each([
    ["2.672.371,00", 2672371],
    ["1.234,50", 1234.5],
    ["950000", 950000],
  ])("parses %s", (input, expected) => {
    expect(parseAmount(input)).toBe(expected);
  });

  it("round-trips through the display format", () => {
    for (const value of [0.5, 12, 1234.56, 2672371]) {
      expect(parseAmount(formatAmount(value))).toBeCloseTo(value, 2);
    }
  });

  it("returns NaN for an empty field", () => {
    expect(parseAmount("")).toBeNaN();
  });

  it.each([
    ["2672371", "2.672.371"],
    ["2672371,5", "2.672.371,5"],
    ["0012", "12"],
    ["1,239", "1,23"],
    ["12,3,4", "12,34"],
    ["abc", ""],
  ])("groups %s into %s as it is typed", (raw, expected) => {
    expect(formatAmountInput(raw)).toBe(expected);
  });
});

describe("the ceiling on an amount", () => {
  it("is nine nines with two decimals", () => {
    expect(MAX_AMOUNT).toBe(9999999.99);
    expect(formatMoney(MAX_AMOUNT)).toBe("$ 9.999.999,99");
  });

  it("comfortably clears a seven-figure amount", () => {
    expect(formatAmountInput("3000000")).toBe("3.000.000");
    expect(parseAmount("3.000.000,00")).toBeLessThan(MAX_AMOUNT);
  });

  it.each([
    ["30000000", "3.000.000"],
    ["999999999999", "9.999.999"],
    ["12345678,999", "1.234.567,99"],
    ["99999999,99", "9.999.999,99"],
  ])("refuses the digits past the cap: %s becomes %s", (raw, expected) => {
    expect(formatAmountInput(raw)).toBe(expected);
  });

  it("never lets the field exceed the ceiling, whatever is typed", () => {
    for (const raw of ["9".repeat(20), "9".repeat(20) + ",99", "123456789012345,67"]) {
      expect(parseAmount(formatAmountInput(raw))).toBeLessThanOrEqual(MAX_AMOUNT);
    }
  });

  it("counts only the digits before the comma", () => {
    const digits = formatAmountInput("9".repeat(20) + ",99")
      .split(",")[0]
      .replace(/\./g, "").length;
    expect(digits).toBe(MAX_AMOUNT_INTEGER_DIGITS);
  });

  it("leaves short amounts completely alone", () => {
    expect(formatAmountInput("6500")).toBe("6.500");
    expect(formatAmountInput("12,5")).toBe("12,5");
  });
});

describe("dates", () => {
  it("labels a month in English", () => {
    expect(formatMonthKey("2026-08")).toBe("August 2026");
  });

  it("writes a date in English", () => {
    expect(formatDate("2026-08-30")).toBe("Aug 30, 2026");
  });

  it("reads the month key off an ISO date", () => {
    expect(monthKeyOf("2026-08-30")).toBe("2026-08");
  });

  it("doesn't slip to the previous day across time zones", () => {
    // Parsing "2026-01-01" as UTC would render as Dec 31 west of Greenwich.
    expect(formatDate("2026-01-01")).toBe("Jan 01, 2026");
  });
});

describe("the months the data covers", () => {
  const rows = [
    { date: "2026-08-30" },
    { date: "2026-04-02" },
    { date: "2026-08-01" },
    { date: "2026-06-15" },
  ] as Parameters<typeof sortedMonthKeys>[0];

  it("lists each month once, oldest first", () => {
    expect(sortedMonthKeys(rows)).toEqual(["2026-04", "2026-06", "2026-08"]);
  });

  it("returns nothing when there are no transactions", () => {
    expect(sortedMonthKeys([])).toEqual([]);
  });
});
