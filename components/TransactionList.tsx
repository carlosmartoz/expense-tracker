"use client";

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
      <div className="grid place-items-center rounded-2xl border border-dashed border-ink-600 py-12 text-center text-sm text-slate-500">
        No transactions match your filters.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-white/[0.06]">
      {transactions.map((t) => {
        const meta = CATEGORY_META[t.category];
        const isIncome = t.type === "income";
        return (
          <li
            key={t.id}
            className="group flex items-center gap-3 py-3"
          >
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
              style={{ backgroundColor: `${meta.color}1a` }}
            >
              {meta.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-100">
                {t.description}
              </p>
              <p className="text-xs text-slate-400">
                {t.category} · {formatDate(t.date)}
              </p>
            </div>
            <span
              className={`shrink-0 text-sm font-semibold ${
                isIncome ? "text-mint" : "text-slate-100"
              }`}
            >
              {isIncome ? "+" : "−"}
              {formatAmount(t.amount)}
            </span>
            <button
              onClick={() => deleteTransaction(t.id)}
              className="shrink-0 rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-coral/10 hover:text-coral group-hover:opacity-100"
              aria-label="Delete"
              title="Delete"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              </svg>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
