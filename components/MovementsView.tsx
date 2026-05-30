"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { sortedMonthKeys } from "@/lib/analytics";
import { monthKeyOf, formatAmount } from "@/lib/format";
import type { Filters } from "@/lib/types";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import FiltersBar from "./Filters";

const DEFAULT_FILTERS: Filters = {
  category: "all",
  type: "all",
  month: "all",
  search: "",
};

export default function MovementsView() {
  const { transactions } = useStore();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const months = useMemo(
    () => sortedMonthKeys(transactions).reverse(),
    [transactions]
  );

  const filtered = useMemo(() => {
    const needle = filters.search.trim().toLowerCase();
    return transactions
      .filter((t) => {
        if (filters.category !== "all" && t.category !== filters.category) return false;
        if (filters.type !== "all" && t.type !== filters.type) return false;
        if (filters.month !== "all" && monthKeyOf(t.date) !== filters.month) return false;
        if (needle && !t.description.toLowerCase().includes(needle)) return false;
        return true;
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, filters]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of filtered) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    return { income, expense, count: filtered.length };
  }, [filtered]);

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      {/* Add form */}
      <div className="card h-fit p-5 lg:sticky lg:top-6">
        <h2 className="mb-4 text-lg font-bold">New transaction</h2>
        <TransactionForm />
      </div>

      {/* List + filters */}
      <div className="space-y-4">
        <div className="card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">History</h2>
            <p className="text-sm text-slate-500">
              {totals.count} transactions · balance{" "}
              <span
                className={
                  totals.income - totals.expense >= 0 ? "text-mint" : "text-coral"
                }
              >
                {formatAmount(totals.income - totals.expense)}
              </span>
            </p>
          </div>
          <FiltersBar filters={filters} months={months} onChange={setFilters} />
          <div className="mt-3">
            <TransactionList transactions={filtered} />
          </div>
        </div>
      </div>
    </div>
  );
}
