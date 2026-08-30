"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  categoryIcon,
  INCOME_CATEGORY_ID,
  type Category,
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
  const expenseCategories = categories.filter(
    (c) => c.id !== INCOME_CATEGORY_ID
  );
  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense");
  const [amount, setAmount] = useState(
    initial ? formatAmount(initial.amount) : ""
  ); // formatted display string, e.g. "2.672.371,00"
  const [category, setCategory] = useState<Category>(
    initial && initial.type === "expense" ? initial.category : "Food"
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [error, setError] = useState<string | null>(null);

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
    const categoryName =
      categories.find((c) => c.id === category)?.name ?? category;
    const payload = {
      type,
      amount: value,
      category: type === "income" ? INCOME_CATEGORY_ID : category,
      description: description.trim() || (type === "income" ? "Income" : categoryName),
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
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-dark--700 p-1">
        {(["expense", "income"] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`cursor-pointer rounded-lg py-2 text-sm font-semibold transition ${
              type === t
                ? t === "expense"
                  ? "bg-coral text-white shadow"
                  : "bg-mint text-white shadow"
                : "text-text-secondary hover:text-slate-200"
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

      {type === "expense" && (
        <div>
          <label className="stat-label">Category</label>
          <Select
            className="mt-1"
            ariaLabel="Category"
            value={category}
            onChange={(v) => setCategory(v as Category)}
            options={expenseCategories.map((c) => ({
              value: c.id,
              label: c.name,
              icon: categoryIcon(c.icon),
              iconColor: c.color,
            }))}
          />
        </div>
      )}

      <div>
        <label className="stat-label">Description</label>
        <input
          className="input mt-1"
          placeholder={
            type === "income" ? "Salary, freelance…" : "e.g. Delivery, Uber…"
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

      {error && <p className="text-sm text-coral">{error}</p>}

      <button type="submit" className="btn-primary w-full">
        {isEditing
          ? "Save changes"
          : `Add ${type === "expense" ? "expense" : "income"}`}
      </button>
    </form>
  );
}
