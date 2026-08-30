"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { monthKeyOf, formatMoney, sortedMonthKeys } from "@/lib/format";
import type { Filters } from "@/lib/types";
import EmptyState from "./EmptyState";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import FiltersBar from "./Filters";

const DEFAULT_FILTERS: Filters = {
  categoryId: "all",
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
        if (filters.categoryId !== "all" && t.categoryId !== filters.categoryId) return false;
        if (filters.type !== "all" && t.type !== filters.type) return false;
        if (filters.month !== "all" && monthKeyOf(t.date) !== filters.month) return false;
        if (needle && !t.description.toLowerCase().includes(needle)) return false;
        return true;
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, filters]);

  // Totals for whatever the filters are currently showing.
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of filtered) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    return { income, expense, balance: income - expense };
  }, [filtered]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
      {/* Add form */}
      <div className="card h-fit min-w-0 p-5 lg:sticky lg:top-6">
        <h2 className="mb-4 text-lg font-bold">New transaction</h2>
        <TransactionForm />
      </div>

      {/* List + filters */}
      <div className="min-w-0 space-y-4">
        {transactions.length === 0 ? (
          <EmptyState />
        ) : (
        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">History</h2>
            <p className="text-sm text-text-subtle">
              {filtered.length} transactions
            </p>
          </div>

          {/* Prominent balance */}
          <div className="mt-3 mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 rounded-2xl bg-surface-raised/40 p-4">
            <div>
              <p className="stat-label">Balance</p>
              <p
                className="text-3xl font-bold tracking-tight text-text-primary"
              >
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

          <FiltersBar
            filters={filters}
            months={months}
            onChange={setFilters}
            onClear={() => setFilters(DEFAULT_FILTERS)}
          />
          <div className="mt-3">
            <TransactionList transactions={filtered} />
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
