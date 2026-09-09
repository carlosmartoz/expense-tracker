import type { TransactionType } from "@/types";

// The rules the transaction side of the book runs on.

// The two transaction types, in the order every list shows them.
export const TRANSACTION_TYPES = [
  { value: "expense", label: "Expenses" },
  { value: "income", label: "Income" },
] as const satisfies readonly { value: TransactionType; label: string }[];

// Digits allowed before the comma.
export const MAX_AMOUNT_INTEGER_DIGITS = 7;
