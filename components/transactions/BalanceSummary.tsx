"use client";

import { formatMoney } from "@/lib/format";
import type { Totals } from "@/lib/totals";

// The totals for the current filters, one row per currency.
export default function BalanceSummary({ totals }: { totals: Totals[] }) {
  return (
    <div className="space-y-2">
      {totals.map((t) => (
        <div
          key={t.currency}
          className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 rounded-2xl bg-surface-raised/40 p-4"
        >
          <div>
            <p className="stat-label">Balance · {t.currency}</p>
            <p className="text-3xl font-bold tracking-tight text-text-primary">
              {formatMoney(t.balance, t.currency)}
            </p>
          </div>
          <div className="flex gap-5 text-right">
            <div>
              <p className="stat-label">Income</p>
              <p className="text-sm font-semibold text-positive">
                {formatMoney(t.income, t.currency)}
              </p>
            </div>
            <div>
              <p className="stat-label">Expenses</p>
              <p className="text-sm font-semibold text-negative">
                {formatMoney(t.expense, t.currency)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
