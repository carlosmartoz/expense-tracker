import type { Category } from "@/types/Category";
import type { CategoryDraft } from "@/types/CategoryDraft";
import type { Transaction } from "@/types/Transaction";
import type { TransactionDraft } from "@/types/TransactionDraft";

// Every action that creates something carries the new id, so the reducer
// stays a pure function of state and action.
export type StoreAction =
  | {
      type: "hydrated";
      snapshot: { transactions: Transaction[]; categories: Category[] } | null;
    }
  | { type: "transaction/add"; id: string; draft: TransactionDraft }
  | { type: "transaction/update"; id: string; patch: TransactionDraft }
  | { type: "transaction/delete"; id: string }
  | { type: "clearAll" }
  | { type: "replaceAll"; transactions: Transaction[]; categories: Category[] }
  | { type: "category/add"; id: string; draft: CategoryDraft }
  | {
      type: "category/update";
      id: string;
      patch: { name?: string; color?: string };
    }
  | { type: "category/addMissingDefaults" }
  | { type: "category/delete"; id: string; moveToId: string };
