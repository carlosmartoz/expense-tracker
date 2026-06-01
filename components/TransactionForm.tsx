"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  categoryIcon,
  CURRENCY_LIST,
  DEFAULT_CURRENCY,
  INCOME_CATEGORY_ID,
  MAX_TAGS,
  MAX_TAG_LENGTH,
  type Category,
  type CurrencyCode,
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
  const currencyOptions: SelectOption[] = CURRENCY_LIST.map((c) => ({
    value: c.code,
    label: `${c.symbol} ${c.code}`,
  }));
  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense");
  const [amount, setAmount] = useState(
    initial ? formatAmount(initial.amount) : ""
  ); // formatted display string, e.g. "2.672.371,00"
  const [currency, setCurrency] = useState<CurrencyCode>(
    initial?.currency ?? DEFAULT_CURRENCY
  );
  const [category, setCategory] = useState<Category>(
    initial && initial.type === "expense" ? initial.category : "Food"
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onAmountChange(raw: string) {
    setAmount(formatAmountInput(raw));
  }

  function onCurrencyChange(next: CurrencyCode) {
    setCurrency(next);
    // Switching currency clears the amount so values aren't mixed up.
    setAmount("");
  }

  function onAmountBlur() {
    if (!amount) return;
    const value = parseAmount(amount);
    if (Number.isFinite(value)) setAmount(formatAmount(value));
  }

  function addTag(raw: string) {
    const v = raw.trim().slice(0, MAX_TAG_LENGTH);
    setTagInput("");
    if (!v) return;
    setTags((prev) => {
      if (prev.length >= MAX_TAGS) return prev;
      if (prev.some((t) => t.toLowerCase() === v.toLowerCase())) return prev;
      return [...prev, v];
    });
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function onTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseAmount(amount);
    if (!value || value <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }
    // Fold any tag still sitting in the input that wasn't committed with Enter.
    const pending = tagInput.trim().slice(0, MAX_TAG_LENGTH);
    const finalTags = [...tags];
    if (
      pending &&
      finalTags.length < MAX_TAGS &&
      !finalTags.some((t) => t.toLowerCase() === pending.toLowerCase())
    ) {
      finalTags.push(pending);
    }
    const categoryName =
      categories.find((c) => c.id === category)?.name ?? category;
    const payload = {
      type,
      amount: value,
      currency,
      category: type === "income" ? INCOME_CATEGORY_ID : category,
      description: description.trim() || (type === "income" ? "Income" : categoryName),
      date,
      tags: finalTags.length ? finalTags : undefined,
    };
    if (initial) {
      updateTransaction(initial.id, payload);
    } else {
      addTransaction(payload);
      // Reset the form for the next entry (only when creating).
      setAmount("");
      setDescription("");
      setTags([]);
    }
    setTagInput("");
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
        <div className="mt-1 grid grid-cols-[1fr_7rem] gap-2">
          <input
            inputMode="decimal"
            className="input"
            placeholder="0,00"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            onBlur={onAmountBlur}
          />
          <Select
            ariaLabel="Currency"
            value={currency}
            options={currencyOptions}
            onChange={(v) => onCurrencyChange(v as CurrencyCode)}
          />
        </div>
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
        <label className="stat-label">
          Tags <span className="normal-case text-text-subtle">· optional</span>
        </label>
        <div
          className="mt-1 flex flex-wrap items-center gap-1.5 rounded-xl border border-dark--600
            bg-dark--700 px-2.5 py-2 transition focus-within:border-brand-500
            focus-within:ring-2 focus-within:ring-brand-500/30"
        >
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md bg-dark--600 px-2 py-0.5 text-xs font-medium text-text-secondary"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                className="cursor-pointer text-text-subtle transition hover:text-coral"
              >
                <X className="h-3 w-3" strokeWidth={3} />
              </button>
            </span>
          ))}
          {tags.length < MAX_TAGS && (
            <input
              className="min-w-[8ch] flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-subtle"
              placeholder={tags.length ? "Add another…" : "e.g. Credit card, Work…"}
              value={tagInput}
              maxLength={MAX_TAG_LENGTH}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={onTagKeyDown}
              onBlur={() => addTag(tagInput)}
            />
          )}
        </div>
        <p className="mt-1 text-xs text-text-subtle">
          Press Enter to add · up to {MAX_TAGS} tags
        </p>
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
