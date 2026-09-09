import type { Category } from "@/types/Category";
import type { CategoryDraft } from "@/types/CategoryDraft";
import type { Transaction } from "@/types/Transaction";
import type { TransactionDraft } from "@/types/TransactionDraft";

// The actions half of the store. Stable for the life of the provider.
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
  updateCategory: (id: string, patch: { name?: string; color?: string }) => void;
  // Adds any category from DEFAULT_CATEGORIES the data doesn't have yet.
  addMissingDefaults: () => void;
  // Deletes a category and moves its transactions to `moveToId`.
  deleteCategory: (id: string, moveToId: string) => void;
}
