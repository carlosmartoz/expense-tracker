"use client";

import { Trash2 } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { formatAmount, formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const { deleteTransaction } = useStore();

  if (transactions.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-dark--600 py-12 text-center text-sm text-text-subtle">
        No transactions match your filters.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-white/[0.06]">
      {transactions.map((t) => {
        const meta = CATEGORY_META[t.category];
        const Icon = meta.icon;
        const isIncome = t.type === "income";
        return (
          <li key={t.id} className="group flex items-center gap-3 py-3">
            <span className="shrink-0" style={{ color: meta.color }}>
              <Icon className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {t.description}
              </p>
              <p className="text-xs text-text-secondary">
                {t.category} · {formatDate(t.date)}
              </p>
            </div>
            <span
              className={`shrink-0 text-sm font-semibold ${
                isIncome ? "text-mint" : "text-text-primary"
              }`}
            >
              {isIncome ? "+" : "−"}
              {formatAmount(t.amount)}
            </span>
            <button
              onClick={() => deleteTransaction(t.id)}
              className="shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-coral/10 hover:text-coral group-hover:opacity-100"
              aria-label="Delete"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
