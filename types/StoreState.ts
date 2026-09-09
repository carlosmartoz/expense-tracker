import type { Category } from "@/types/Category";
import type { Transaction } from "@/types/Transaction";

// What the reducer owns.
export interface StoreState {
  transactions: Transaction[];
  categories: Category[];
  // False until the stored data has been read.
  hydrated: boolean;
}
