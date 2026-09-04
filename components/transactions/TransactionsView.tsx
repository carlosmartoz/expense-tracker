"use client";

import { useTransactionFilters } from "@/hooks/useTransactionFilters";
import BalanceSummary from "@/components/transactions/BalanceSummary";
import EmptyState from "@/components/transactions/EmptyState";
import FiltersBar from "@/components/transactions/Filters";
import TransactionForm from "@/components/transactions/TransactionForm";
import TransactionList from "@/components/transactions/TransactionList";

export default function TransactionsView() {
  const {
    filters,
    setFilters,
    clearFilters,
    months,
    currencies,
    filtered,
    totals,
    isEmpty,
  } = useTransactionFilters();

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
      <div className="card h-fit min-w-0 p-5 lg:sticky lg:top-6">
        <h2 className="mb-4 text-lg font-bold">New transaction</h2>
        <TransactionForm />
      </div>

      <div className="min-w-0 space-y-4">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold">History</h2>
              <p className="text-sm text-text-subtle">
                {filtered.length} transactions
              </p>
            </div>

            <div className="mt-3 mb-4">
              <BalanceSummary totals={totals} />
            </div>

            <FiltersBar
              filters={filters}
              months={months}
              currencies={currencies}
              onChange={setFilters}
              onClear={clearFilters}
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
