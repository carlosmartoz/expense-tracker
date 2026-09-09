import type { Category } from "@/types/Category";
import type { Transaction } from "@/types/Transaction";

// The data half of the store.
export interface StoreData {
  transactions: Transaction[];
  categories: Category[];
  // id -> category, for quick lookups in render.
  categoryMap: Record<string, Category>;
  hydrated: boolean;
}
