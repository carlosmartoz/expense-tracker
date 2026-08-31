import { CURRENCY, LOCALE } from "./config";
import type { Transaction } from "./types";
import { MAX_AMOUNT_INTEGER_DIGITS } from "./types";

// Amounts follow the currency's own convention — for ARS that's "2.672.371,00":
// dot for thousands, comma for the decimal, always two decimals.
const amountFormatter = new Intl.NumberFormat(CURRENCY.locale, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatAmount(value: number): string {
  return amountFormatter.format(Number.isFinite(value) ? value : 0);
}

/**
 * Like formatAmount but prefixed with the currency symbol, e.g. "$ 1.200,00".
 * A negative value keeps its sign ahead of the symbol ("-$ 1.200,00"), which is
 * how a balance in the red is normally written.
 */
export function formatMoney(value: number): string {
  const n = Number.isFinite(value) ? value : 0;
  const sign = n < 0 ? "-" : "";
  return `${sign}${CURRENCY.symbol} ${formatAmount(Math.abs(n))}`;
}

/** Parse a display string like "2.672.371,00" back into a number. */
export function parseAmount(input: string): number {
  if (!input) return NaN;
  const normalized = input
    .replace(/\./g, "") // drop thousand separators
    .replace(",", ".") // decimal comma -> dot
    .replace(/[^\d.-]/g, "");
  return Number(normalized);
}

/** The largest amount the form accepts, e.g. 9999999.99. */
export const MAX_AMOUNT = Number(`${"9".repeat(MAX_AMOUNT_INTEGER_DIGITS)}.99`);

/**
 * Live-format what the user types into the amount field: group the integer
 * part with dots, allow at most two decimals after a comma, and refuse digits
 * past MAX_AMOUNT_INTEGER_DIGITS so the field can't run away.
 * e.g. "2672371" -> "2.672.371", "2672371,5" -> "2.672.371,5".
 */
export function formatAmountInput(raw: string): string {
  let cleaned = raw.replace(/[^\d,]/g, "");
  // keep only the first comma
  const firstComma = cleaned.indexOf(",");
  if (firstComma !== -1) {
    cleaned =
      cleaned.slice(0, firstComma + 1) +
      cleaned.slice(firstComma + 1).replace(/,/g, "");
  }
  let [intPart, decPart] = cleaned.split(",");
  intPart = intPart.replace(/^0+(?=\d)/, ""); // strip leading zeros
  intPart = intPart.slice(0, MAX_AMOUNT_INTEGER_DIGITS); // and cap the length
  if (intPart === "") intPart = decPart !== undefined ? "0" : "";
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (decPart !== undefined) return `${grouped},${decPart.slice(0, 2)}`;
  return grouped;
}

export function formatMonthKey(monthKey: string): string {
  // monthKey: "YYYY-MM"
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString(LOCALE, { month: "long", year: "numeric" });
}

export function monthKeyOf(isoDate: string): string {
  return isoDate.slice(0, 7); // YYYY-MM
}

/** Every month that has at least one transaction, oldest first. */
export function sortedMonthKeys(transactions: Transaction[]): string[] {
  return Array.from(new Set(transactions.map((t) => monthKeyOf(t.date)))).sort();
}

export function formatDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
