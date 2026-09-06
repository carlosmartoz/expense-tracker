"use client";

import { useTransactionForm } from "@/hooks/useTransactionForm";
import { categoryIcon, type Transaction } from "@/lib/types";
import { formatMoney, MAX_AMOUNT } from "@/lib/format";
import { CURRENCY_CODES } from "@/lib/config";
import DatePicker from "@/components/ui/DatePicker";
import ErrorText from "@/components/ui/ErrorText";
import Field from "@/components/ui/Field";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import Select from "@/components/ui/Select";

// Singular labels, for the one transaction being written.
const TYPE_SEGMENTS = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
] as const;

// The code, not the symbol.
const CURRENCIES = CURRENCY_CODES.map((code) => ({ value: code, label: code }));

export default function TransactionForm({
  onDone,
  initial,
}: {
  onDone?: () => void;
  // When provided, the form edits this transaction.
  initial?: Transaction;
}) {
  const form = useTransactionForm(initial, onDone);

  return (
    <form onSubmit={form.submit} className="space-y-4">
      <SegmentedToggle
        ariaLabel="Type"
        segments={TYPE_SEGMENTS}
        value={form.type}
        onChange={form.setType}
      />

      <Field
        label="Amount"
        hint={
          // Always in the layout, invisible until the cap is hit.
          <p
            id="amount-limit"
            aria-hidden={!form.atLimit}
            className={`mt-1 text-xs text-text-secondary ${
              form.atLimit ? "" : "invisible"
            }`}
          >
            {formatMoney(MAX_AMOUNT, form.currency)} is the most you can enter.
          </p>
        }
      >
        {/* The amount field and the currency picker. */}
        <div className="flex gap-2">
          <input
            inputMode="decimal"
            className="input min-w-0 flex-1"
            placeholder="0,00"
            value={form.amount}
            onChange={(e) => form.setAmount(e.target.value)}
            onBlur={form.normaliseAmount}
            aria-describedby={form.atLimit ? "amount-limit" : undefined}
          />
          <div className="w-30 shrink-0">
            <SegmentedToggle
              ariaLabel="Currency"
              segments={CURRENCIES}
              value={form.currency}
              onChange={form.setCurrency}
            />
          </div>
        </div>
      </Field>

      <Field label="Category">
        <Select
          ariaLabel="Category"
          value={form.categoryId}
          placeholder="No categories yet"
          onChange={form.setCategoryId}
          options={form.available.map((c) => ({
            value: c.id,
            label: c.name,
            icon: categoryIcon(c.icon),
            iconColor: c.color,
          }))}
        />
      </Field>

      <Field label="Description">
        <input
          className="input"
          placeholder={
            form.type === "income" ? "e.g. May salary…" : "e.g. Delivery, Uber…"
          }
          value={form.description}
          onChange={(e) => form.setDescription(e.target.value)}
        />
      </Field>

      <Field label="Date">
        <DatePicker
          ariaLabel="Date"
          value={form.date}
          onChange={form.setDate}
        />
      </Field>

      {/* The date field and the submit button. */}
      <div className="space-y-1">
        <ErrorText>{form.error}</ErrorText>
        <button type="submit" className="btn-primary w-full">
          {form.isEditing ? "Save changes" : `Add ${form.type}`}
        </button>
      </div>
    </form>
  );
}
