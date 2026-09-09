import type { Transaction } from "@/types/Transaction";

// A new transaction, before the store gives it an id.
export type TransactionDraft = Omit<Transaction, "id">;
