"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  EXPENSE_CATEGORIES,
  CATEGORY_META,
  type Category,
  type TransactionType,
} from "@/lib/types";
import { formatAmount, formatAmountInput, parseAmount } from "@/lib/format";
import Select from "./Select";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function TransactionForm({ onDone }: { onDone?: () => void }) {
  const { addTransaction } = useStore();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState(""); // formatted display string, e.g. "2.672.371,00"
  const [category, setCategory] = useState<Category>("Food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISO());
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
    addTransaction({
      type,
      amount: value,
      category: type === "income" ? "Income" : category,
      description:
        description.trim() || (type === "income" ? "Income" : category),
      date,
    });
    setAmount("");
    setDescription("");
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
            options={EXPENSE_CATEGORIES.map((c) => ({
              value: c,
              label: c,
              icon: CATEGORY_META[c].icon,
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
        <input
          type="date"
          className="input mt-1"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-coral">{error}</p>}

      <button type="submit" className="btn-primary w-full">
        Add {type === "expense" ? "expense" : "income"}
      </button>
    </form>
  );
}
