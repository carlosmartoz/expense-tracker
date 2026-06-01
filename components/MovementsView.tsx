"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { sortedMonthKeys } from "@/lib/analytics";
import { monthKeyOf, formatMoney } from "@/lib/format";
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  type CurrencyCode,
  type Filters,
} from "@/lib/types";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import FiltersBar from "./Filters";

const DEFAULT_FILTERS: Filters = {
  category: "all",
  type: "all",
  month: "all",
  tag: "all",
  search: "",
};

interface CurrencyBalance {
  currency: CurrencyCode;
  income: number;
  expense: number;
  balance: number;
}

export default function MovementsView() {
  const { transactions } = useStore();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const months = useMemo(
    () => sortedMonthKeys(transactions).reverse(),
    [transactions]
  );

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const t of transactions) t.tags?.forEach((tag) => set.add(tag));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [transactions]);

  const filtered = useMemo(() => {
    const needle = filters.search.trim().toLowerCase();
    return transactions
      .filter((t) => {
        if (filters.category !== "all" && t.category !== filters.category) return false;
        if (filters.type !== "all" && t.type !== filters.type) return false;
        if (filters.month !== "all" && monthKeyOf(t.date) !== filters.month) return false;
        if (filters.tag !== "all" && !t.tags?.includes(filters.tag)) return false;
        if (needle && !t.description.toLowerCase().includes(needle)) return false;
        return true;
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, filters]);

  // Balances are grouped by currency so amounts in different currencies are
  // never summed together.
  const balances = useMemo<CurrencyBalance[]>(() => {
    const byCurrency = new Map<CurrencyCode, { income: number; expense: number }>();
    for (const t of filtered) {
      const cur = t.currency ?? DEFAULT_CURRENCY;
      const entry = byCurrency.get(cur) ?? { income: 0, expense: 0 };
      if (t.type === "income") entry.income += t.amount;
      else entry.expense += t.amount;
      byCurrency.set(cur, entry);
    }
    const order = Object.keys(CURRENCIES) as CurrencyCode[];
    return Array.from(byCurrency.entries())
      .map(([currency, v]) => ({
        currency,
        income: v.income,
        expense: v.expense,
        balance: v.income - v.expense,
      }))
      .sort((a, b) => order.indexOf(a.currency) - order.indexOf(b.currency));
  }, [filtered]);

  const shownBalances: CurrencyBalance[] =
    balances.length > 0
      ? balances
      : [{ currency: DEFAULT_CURRENCY, income: 0, expense: 0, balance: 0 }];
  const multiCurrency = shownBalances.length > 1;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
      {/* Add form */}
      <div className="card h-fit min-w-0 p-5 lg:sticky lg:top-6">
        <h2 className="mb-4 text-lg font-bold">New transaction</h2>
        <TransactionForm />
      </div>

      {/* List + filters */}
      <div className="min-w-0 space-y-4">
        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">History</h2>
            <p className="text-sm text-text-subtle">
              {filtered.length} transactions
            </p>
          </div>

          {/* Prominent balance, per currency */}
          <div className="mt-3 mb-4 space-y-3 rounded-2xl bg-dark--700/40 p-4">
            {shownBalances.map((b, i) => (
              <div
                key={b.currency}
                className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 ${
                  i > 0 ? "border-t border-dark--600 pt-3" : ""
                }`}
              >
                <div>
                  <p className="stat-label">
                    Balance{multiCurrency ? ` · ${CURRENCIES[b.currency].code}` : ""}
                  </p>
                  <p
                    className={`text-3xl font-bold tracking-tight ${
                      b.balance >= 0 ? "text-mint" : "text-coral"
                    }`}
                  >
                    {formatMoney(b.balance, b.currency)}
                  </p>
                </div>
                <div className="flex gap-5 text-right">
                  <div>
                    <p className="stat-label">Income</p>
                    <p className="text-sm font-semibold text-mint">
                      {formatMoney(b.income, b.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="stat-label">Expenses</p>
                    <p className="text-sm font-semibold text-coral">
                      {formatMoney(b.expense, b.currency)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <FiltersBar
            filters={filters}
            months={months}
            tags={tags}
            onChange={setFilters}
            onClear={() => setFilters(DEFAULT_FILTERS)}
          />
          <div className="mt-3">
            <TransactionList transactions={filtered} />
          </div>
        </div>
      </div>
    </div>
  );
}
