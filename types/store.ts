import type { Transaction, Category } from "@/lib/types";
import { type CategoryDraft, type TransactionDraft } from "@/lib/storeReducer";

/** The data half. Changes whenever the ledger does. */
export interface StoreData {
  transactions: Transaction[];
  categories: Category[];
  /** id -> category, for quick lookups in render. */
  categoryMap: Record<string, Category>;
  hydrated: boolean;
}

/** The verbs. Built once and never rebuilt, so they are safe as deps. */
export interface StoreActions {
  addTransaction: (t: TransactionDraft) => void;
  updateTransaction: (id: string, patch: TransactionDraft) => void;
  deleteTransaction: (id: string) => void;
  /** Wipes everything and starts over from the shipped categories. */
  clearAll: () => void;
  /** Swaps in an imported backup, replacing everything currently held. */
  replaceAll: (next: {
    transactions: Transaction[];
    categories: Category[];
  }) => void;
  addCategory: (c: CategoryDraft) => void;
  /** Renames or recolours a category. Refuses on a default: those are fixed. */
  updateCategory: (
    id: string,
    patch: { name?: string; color?: string },
  ) => void;
  /** Adds any category from DEFAULT_CATEGORIES this ledger doesn't have yet. */
  addMissingDefaults: () => void;
  /** Moves the category's transactions to `moveToId`. Refuses on a default. */
  deleteCategory: (id: string, moveToId: string) => void;
}
