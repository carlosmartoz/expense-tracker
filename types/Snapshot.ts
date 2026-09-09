import type { Category } from "@/types/Category";
import type { Transaction } from "@/types/Transaction";

// Everything the app stores, and everything a backup file holds.
export interface Snapshot {
  categories: Category[];
  transactions: Transaction[];
}
