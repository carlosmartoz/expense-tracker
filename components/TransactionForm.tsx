"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  categoryIcon,
  type Transaction,
  type TransactionType,
} from "@/lib/types";
import { formatAmount, formatAmountInput, parseAmount } from "@/lib/format";
import Select, { type SelectOption } from "./Select";
import DatePicker from "./DatePicker";

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

  // Only the categories on the chosen side of the book are offered.
  const available = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );
  // Falls back to the first available whenever the current pick doesn't belong
  // to this side — which happens right after flipping the type toggle.
  const selected =
    available.some((c) => c.id === categoryId) ? categoryId : available[0]?.id ?? "";

  function onTypeChange(next: TransactionType) {
    setType(next);
    const stillValid = categories.some(
      (c) => c.id === categoryId && c.type === next
    );
    if (!stillValid) setCategoryId("");
  }

  function onAmountChange(raw: string) {
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
        />
      </div>

      <div>
        <label className="stat-label">Category</label>
        <Select
          className="mt-1"
          ariaLabel="Category"
          value={selected}
          placeholder="No categories yet"
          onChange={setCategoryId}
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
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="stat-label">Date</label>
        <DatePicker
          className="mt-1"
          ariaLabel="Date"
          value={date}
          onChange={setDate}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-border-strong bg-surface-raised px-3 py-2 text-sm font-medium text-text-primary">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full">
        {isEditing
          ? "Save changes"
          : `Add ${type === "expense" ? "expense" : "income"}`}
      </button>
    </form>
  );
}
