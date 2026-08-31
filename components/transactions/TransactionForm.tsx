"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  categoryIcon,
  MAX_AMOUNT_INTEGER_DIGITS,
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
import Select, { type SelectOption } from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function TransactionForm({
  onDone,
  initial,
}: {
  onDone?: () => void;
  /** When provided, the form edits this transaction instead of creating one. */
  initial?: Transaction;
}) {
  const { addTransaction, updateTransaction, categories } = useStore();
  const isEditing = Boolean(initial);
  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense");
  const [amount, setAmount] = useState(
    initial ? formatAmount(initial.amount) : ""
  ); // formatted display string, e.g. "2.672.371,00"
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [error, setError] = useState<string | null>(null);
  const [atLimit, setAtLimit] = useState(false);

  // Only the categories on the chosen side of the book are offered.
  const available = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );
  // Falls back to the first available after the type toggle flips.
  const selected =
    available.some((c) => c.id === categoryId) ? categoryId : available[0]?.id ?? "";

  /** An edit makes the last attempt's message stale. Guarded to avoid churn. */
  function clearError() {
    if (error) setError(null);
  }

  function onTypeChange(next: TransactionType) {
    clearError();
    setType(next);
    const stillValid = categories.some(
      (c) => c.id === categoryId && c.type === next
    );
    if (!stillValid) setCategoryId("");
  }

  function onAmountChange(raw: string) {
    clearError();
    // Digits past the cap are dropped, so say so.
    const typed = raw.replace(/[^\d,]/g, "").split(",")[0].replace(/^0+(?=\d)/, "");
    setAtLimit(typed.length > MAX_AMOUNT_INTEGER_DIGITS);
    setAmount(formatAmountInput(raw));
  }

  function onAmountBlur() {
    if (!amount) return;
    const value = parseAmount(amount);
    if (Number.isFinite(value)) setAmount(formatAmount(value));
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
    if (!selected) {
      setError(`Create an ${type} category first.`);
      return;
    }
    const categoryName = categories.find((c) => c.id === selected)?.name ?? "";
    const payload = {
      type,
      amount: value,
      categoryId: selected,
      description: description.trim() || categoryName,
      date,
    };
    if (initial) {
      updateTransaction(initial.id, payload);
    } else {
      addTransaction(payload);
      // Reset the form for the next entry (only when creating).
      setAmount("");
      setDescription("");
    }
    setAtLimit(false);
    setError(null);
    onDone?.();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Type toggle */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-raised p-1">
        {(["expense", "income"] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTypeChange(t)}
            className={`cursor-pointer rounded-lg py-2 text-sm font-semibold transition ${
              type === t
                ? "bg-accent text-accent-text shadow"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {t === "expense" ? "Expense" : "Income"}
          </button>
        ))}
      </div>

      <div>
        <label className="stat-label">Amount</label>
        <input
          inputMode="decimal"
          className="input mt-1"
          placeholder="0,00"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          onBlur={onAmountBlur}
          aria-describedby={atLimit ? "amount-limit" : undefined}
        />
        {/* Always in the layout so hitting the cap doesn't shift the panel. */}
        <p
          id="amount-limit"
          aria-hidden={!atLimit}
          className={`mt-1 text-xs text-text-secondary ${
            atLimit ? "" : "invisible"
          }`}
        >
          {formatMoney(MAX_AMOUNT)} is the most you can enter.
        </p>
      </div>

      <div>
        <label className="stat-label">Category</label>
        <Select
          className="mt-1"
          ariaLabel="Category"
          value={selected}
          placeholder="No categories yet"
          onChange={(v) => {
            clearError();
            setCategoryId(v);
          }}
          options={available.map((c) => ({
            value: c.id,
            label: c.name,
            icon: categoryIcon(c.icon),
            iconColor: c.color,
          }))}
        />
      </div>

      <div>
        <label className="stat-label">Description</label>
        <input
          className="input mt-1"
          placeholder={
            type === "income" ? "e.g. May salary…" : "e.g. Delivery, Uber…"
          }
          value={description}
          onChange={(e) => {
            clearError();
            setDescription(e.target.value);
          }}
        />
      </div>

      <div>
        <label className="stat-label">Date</label>
        <DatePicker
          className="mt-1"
          ariaLabel="Date"
          value={date}
          onChange={(v) => {
            clearError();
            setDate(v);
          }}
        />
      </div>

      {/* Grouped with its button so the form's spacing doesn't pay twice. */}
      {/* min-h-5 is text-sm's line-height: the slot holds a line either way. */}
      <div className="space-y-1">
        <p role="alert" className="min-h-5 text-sm text-danger">
          {error}
        </p>
        <button type="submit" className="btn-primary w-full">
          {isEditing
            ? "Save changes"
            : `Add ${type === "expense" ? "expense" : "income"}`}
        </button>
      </div>
    </form>
  );
}
