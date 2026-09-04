import { CURRENCY_CODES, DEFAULT_CURRENCY, type CurrencyCode } from "./config";
import type { Transaction } from "./types";

// Currencies are never added together. What comes out is one sum per currency,
// never a single figure — that would need an exchange rate, and a rate that
// changes rewrites the past every time it is touched.

export interface Totals {
  currency: CurrencyCode;
  income: number;
  expense: number;
  balance: number;
}

/** Unknown codes sort last rather than first, which -1 would give. */
function rank(currency: CurrencyCode): number {
  const i = CURRENCY_CODES.indexOf(currency);
  return i === -1 ? CURRENCY_CODES.length : i;
}

/**
 * One entry per currency actually present, in the order CURRENCIES declares.
 * An empty list still totals the default, so the summary always has a figure.
 */
export function sumByCurrency(transactions: Transaction[]): Totals[] {
  const totals = new Map<CurrencyCode, Totals>();

  for (const t of transactions) {
    const currency = t.currency ?? DEFAULT_CURRENCY;
    let row = totals.get(currency);
    if (!row) {
      row = { currency, income: 0, expense: 0, balance: 0 };
      totals.set(currency, row);
    }
    if (t.type === "income") row.income += t.amount;
    else row.expense += t.amount;
  }

  if (totals.size === 0) {
    return [{ currency: DEFAULT_CURRENCY, income: 0, expense: 0, balance: 0 }];
  }

  return [...totals.values()]
    .map((row) => ({ ...row, balance: row.income - row.expense }))
    .sort((a, b) => rank(a.currency) - rank(b.currency));
}

/** Every currency a ledger holds, oldest-declared first. */
export function currenciesUsed(transactions: Transaction[]): CurrencyCode[] {
  return sumByCurrency(transactions).map((t) => t.currency);
}
