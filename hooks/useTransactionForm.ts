"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  MAX_AMOUNT_INTEGER_DIGITS,
  type Category,
  type Transaction,
  type TransactionType,
} from "@/lib/types";
import {
  formatAmount,
  formatAmountInput,
  formatMoney,
  MAX_AMOUNT,
  parseAmount,
} from "@/lib/format";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Counts the digits typed before the comma, ignoring leading zeros. */
function integerDigits(raw: string): number {
  return raw
    .replace(/[^\d,]/g, "")
    .split(",")[0]
    .replace(/^0+(?=\d)/, "").length;
}

export interface TransactionFormState {
  type: TransactionType;
  amount: string;
  description: string;
  date: string;
  /** The category actually in effect, which may differ from the last pick. */
  categoryId: string;
  /** Categories on the chosen side of the book. */
  available: Category[];
  atLimit: boolean;
  error: string | null;
  isEditing: boolean;
  setType: (next: TransactionType) => void;
  setAmount: (raw: string) => void;
  setCategoryId: (id: string) => void;
  setDescription: (text: string) => void;
  setDate: (iso: string) => void;
  /** Re-formats the amount once the field loses focus. */
  normaliseAmount: () => void;
  submit: (e: React.FormEvent) => void;
}

/** Everything the new/edit transaction form does, minus how it looks. */
export function useTransactionForm(
  initial?: Transaction,
  onDone?: () => void
): TransactionFormState {
  const { addTransaction, updateTransaction, categories } = useStore();

  const [type, setTypeRaw] = useState<TransactionType>(
    initial?.type ?? "expense"
  );
  const [amount, setAmountRaw] = useState(
    initial ? formatAmount(initial.amount) : ""
  );
  const [pickedCategory, setPickedCategory] = useState(initial?.categoryId ?? "");
  const [description, setDescriptionRaw] = useState(initial?.description ?? "");
  const [date, setDateRaw] = useState(initial?.date ?? todayISO());
  const [error, setError] = useState<string | null>(null);
  const [atLimit, setAtLimit] = useState(false);

  const available = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );
  // Falls back to the first available after the type toggle flips.
  const categoryId = available.some((c) => c.id === pickedCategory)
    ? pickedCategory
    : (available[0]?.id ?? "");

  /** An edit makes the last attempt's message stale. Guarded to avoid churn. */
  function clearError() {
    if (error) setError(null);
  }

  function setType(next: TransactionType) {
    clearError();
    setTypeRaw(next);
    const stillValid = categories.some(
      (c) => c.id === pickedCategory && c.type === next
    );
    if (!stillValid) setPickedCategory("");
  }

  function setAmount(raw: string) {
    clearError();
    // Digits past the cap are dropped, so say so.
    setAtLimit(integerDigits(raw) > MAX_AMOUNT_INTEGER_DIGITS);
    setAmountRaw(formatAmountInput(raw));
  }

  function normaliseAmount() {
    if (!amount) return;
    const value = parseAmount(amount);
    if (Number.isFinite(value)) setAmountRaw(formatAmount(value));
  }

  function withClear<T>(set: (v: T) => void) {
    return (v: T) => {
      clearError();
      set(v);
    };
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseAmount(amount);
    if (!value || value <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }
    // An imported amount can be over the cap and reach here via the edit form.
    if (value > MAX_AMOUNT) {
      setError(`Maximum is ${formatMoney(MAX_AMOUNT)}.`);
      return;
    }
    if (!categoryId) {
      setError(`Create an ${type} category first.`);
      return;
    }

    const name = categories.find((c) => c.id === categoryId)?.name ?? "";
    const payload = {
      type,
      amount: value,
      categoryId,
      description: description.trim() || name,
      date,
    };

    if (initial) {
      updateTransaction(initial.id, payload);
    } else {
      addTransaction(payload);
      setAmountRaw("");
      setDescriptionRaw("");
    }
    setAtLimit(false);
    setError(null);
    onDone?.();
  }

  return {
    type,
    amount,
    description,
    date,
    categoryId,
    available,
    atLimit,
    error,
    isEditing: Boolean(initial),
    setType,
    setAmount,
    setCategoryId: withClear(setPickedCategory),
    setDescription: withClear(setDescriptionRaw),
    setDate: withClear(setDateRaw),
    normaliseAmount,
    submit,
  };
}
