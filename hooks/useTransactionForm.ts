"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { useFormError } from "@/hooks/useFormError";
import { MAX_AMOUNT_INTEGER_DIGITS } from "@/lib/transactions";
import type {
  Category,
  CurrencyCode,
  Transaction,
  TransactionType,
} from "@/types";
import {
  formatAmount,
  formatAmountInput,
  formatMoney,
  MAX_AMOUNT,
  parseAmount,
  todayISO,
} from "@/lib/format";
import { DEFAULT_CURRENCY } from "@/lib/config";

// Counts the digits typed before the comma, ignoring leading zeros.
function integerDigits(raw: string): number {
  return raw
    .replace(/[^\d,]/g, "")
    .split(",")[0]
    .replace(/^0+(?=\d)/, "").length;
}

// What the form exposes.
interface TransactionFormState {
  type: TransactionType;
  amount: string;
  currency: CurrencyCode;
  description: string;
  date: string;
  // The category actually in effect.
  categoryId: string;
  // Categories of the chosen type.
  available: Category[];
  atLimit: boolean;
  error: string | null;
  isEditing: boolean;
  setType: (next: TransactionType) => void;
  setAmount: (raw: string) => void;
  setCurrency: (next: CurrencyCode) => void;
  setCategoryId: (id: string) => void;
  setDescription: (text: string) => void;
  setDate: (iso: string) => void;
  // Re-formats the amount once the field loses focus.
  normaliseAmount: () => void;
  submit: (e: React.FormEvent) => void;
}

// The state and handlers for the new/edit transaction form.
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
  const [currency, setCurrencyRaw] = useState<CurrencyCode>(
    initial?.currency ?? DEFAULT_CURRENCY
  );
  const [pickedCategory, setPickedCategory] = useState(initial?.categoryId ?? "");
  const [description, setDescriptionRaw] = useState(initial?.description ?? "");
  const [date, setDateRaw] = useState(initial?.date ?? todayISO());
  const [atLimit, setAtLimit] = useState(false);
  const { error, setError, clearError, withClear } = useFormError();

  const available = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );
  // Falls back to the first available category.
  const categoryId = available.some((c) => c.id === pickedCategory)
    ? pickedCategory
    : (available[0]?.id ?? "");

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
    // Flags that digits past the cap were dropped.
    setAtLimit(integerDigits(raw) > MAX_AMOUNT_INTEGER_DIGITS);
    setAmountRaw(formatAmountInput(raw));
  }

  function normaliseAmount() {
    if (!amount) return;
    const value = parseAmount(amount);
    if (Number.isFinite(value)) setAmountRaw(formatAmount(value));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseAmount(amount);
    if (!value || value <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }
    // An imported amount can be over the cap.
    if (value > MAX_AMOUNT) {
      setError(`Maximum is ${formatMoney(MAX_AMOUNT, currency)}.`);
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
      currency,
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
    currency,
    description,
    date,
    categoryId,
    available,
    atLimit,
    error,
    isEditing: Boolean(initial),
    setType,
    setAmount,
    setCurrency: withClear(setCurrencyRaw),
    setCategoryId: withClear(setPickedCategory),
    setDescription: withClear(setDescriptionRaw),
    setDate: withClear(setDateRaw),
    normaliseAmount,
    submit,
  };
}
