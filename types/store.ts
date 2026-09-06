import type { Transaction, Category } from "@/lib/types";
import { type CategoryDraft, type TransactionDraft } from "@/lib/storeReducer";

// The data the store holds.
export interface StoreData {
  transactions: Transaction[];
  categories: Category[];
  // id -> category, for quick lookups in render.
  categoryMap: Record<string, Category>;
  hydrated: boolean;
}

// The actions the store exposes.
export interface StoreActions {
  addTransaction: (t: TransactionDraft) => void;
  updateTransaction: (id: string, patch: TransactionDraft) => void;
  deleteTransaction: (id: string) => void;
  // Removes all transactions and restores the default categories.
  clearAll: () => void;
  // Replaces all transactions and categories with an imported backup.
  replaceAll: (next: {
    transactions: Transaction[];
    categories: Category[];
  }) => void;
  addCategory: (c: CategoryDraft) => void;
  // Renames or recolours a category. Does nothing on a default.
  updateCategory: (
    id: string,
    patch: { name?: string; color?: string },
  ) => void;
  // Adds any category from DEFAULT_CATEGORIES the data doesn't have yet.
  addMissingDefaults: () => void;
  // Deletes a category and moves its transactions to `moveToId`.
  deleteCategory: (id: string, moveToId: string) => void;
}
