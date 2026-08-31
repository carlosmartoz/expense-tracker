"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { monthKeyOf, sortedMonthKeys } from "@/lib/format";
import type { Filters, Transaction } from "@/lib/types";

const NO_FILTERS: Filters = {
  categoryId: "all",
  type: "all",
  month: "all",
  search: "",
};

export interface Totals {
  income: number;
  expense: number;
  balance: number;
}

/** Filters the ledger and sums whatever is left showing. */
export function useTransactionFilters() {
  const { transactions } = useStore();
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);

  const months = useMemo(
    () => sortedMonthKeys(transactions).reverse(),
    [transactions]
  );

  const filtered = useMemo(() => {
    const needle = filters.search.trim().toLowerCase();
    const matches = (t: Transaction) =>
      (filters.categoryId === "all" || t.categoryId === filters.categoryId) &&
      (filters.type === "all" || t.type === filters.type) &&
      (filters.month === "all" || monthKeyOf(t.date) === filters.month) &&
      (!needle || t.description.toLowerCase().includes(needle));

    return transactions
      .filter(matches)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, filters]);

  const totals = useMemo<Totals>(() => {
    let income = 0;
    let expense = 0;
    for (const t of filtered) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    return { income, expense, balance: income - expense };
  }, [filtered]);

  return {
    filters,
    setFilters,
    clearFilters: () => setFilters(NO_FILTERS),
    months,
    filtered,
    totals,
    isEmpty: transactions.length === 0,
  };
}
