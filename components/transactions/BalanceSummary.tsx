"use client";

import { formatMoney } from "@/lib/format";
import type { Totals } from "@/hooks/useTransactionFilters";

/** What the filters currently add up to. */
export default function BalanceSummary({ totals }: { totals: Totals }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 rounded-2xl bg-surface-raised/40 p-4">
      <div>
        <p className="stat-label">Balance</p>
        <p className="text-3xl font-bold tracking-tight text-text-primary">
          {formatMoney(totals.balance)}
        </p>
      </div>
      <div className="flex gap-5 text-right">
        <div>
          <p className="stat-label">Income</p>
          <p className="text-sm font-semibold text-positive">
            {formatMoney(totals.income)}
          </p>
        </div>
        <div>
          <p className="stat-label">Expenses</p>
          <p className="text-sm font-semibold text-negative">
            {formatMoney(totals.expense)}
          </p>
        </div>
      </div>
    </div>
  );
}
