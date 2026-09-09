import type { CurrencyCode } from "@/types/CurrencyCode";

// One balance per currency. The three figures always come from the same set
// of transactions, so balance is income minus expense and nothing else.
export interface Totals {
  currency: CurrencyCode;
  income: number;
  expense: number;
  balance: number;
}
