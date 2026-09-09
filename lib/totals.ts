import { CURRENCY_CODES, DEFAULT_CURRENCY } from "@/lib/config";
import type { CurrencyCode, Totals, Transaction } from "@/types";

// Sums transactions, one total per currency.

// Sort position of a currency. Unknown codes go last.
function rank(currency: CurrencyCode): number {
  const i = CURRENCY_CODES.indexOf(currency);
  return i === -1 ? CURRENCY_CODES.length : i;
}

// One entry per currency present, in the order CURRENCIES declares.
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

// One entry per declared currency, used or not, plus any unknown code.
export function sumEveryCurrency(transactions: Transaction[]): Totals[] {
  const present = new Map(
    sumByCurrency(transactions).map((row) => [row.currency, row])
  );

  const declared = CURRENCY_CODES.map(
    (currency) =>
      present.get(currency) ?? { currency, income: 0, expense: 0, balance: 0 }
  );

  // Undeclared codes go after the declared ones.
  const undeclared = [...present.values()].filter(
    (row) => !CURRENCY_CODES.includes(row.currency)
  );

  return [...declared, ...undeclared];
}

// Every currency the data holds, oldest-declared first.
export function currenciesUsed(transactions: Transaction[]): CurrencyCode[] {
  return sumByCurrency(transactions).map((t) => t.currency);
}
