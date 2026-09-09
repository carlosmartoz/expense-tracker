import type { CurrencyCode } from "@/types/CurrencyCode";
import type { TransactionType } from "@/types/TransactionType";

// What the ledger is narrowed by. "all" means the filter is off.
export interface Filters {
  // Category id or "all"
  categoryId: string;
  type: TransactionType | "all";
  currency: CurrencyCode | "all";
  // YYYY-MM (month key) or "all"
  month: string;
  search: string;
}
