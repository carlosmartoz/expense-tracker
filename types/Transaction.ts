import type { CurrencyCode } from "@/types/CurrencyCode";
import type { TransactionType } from "@/types/TransactionType";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // always positive; sign is derived from `type`
  // Which currency the amount is in. Never converted.
  currency: CurrencyCode;
  categoryId: string;
  description: string;
  date: string; // ISO date string (YYYY-MM-DD)
}
