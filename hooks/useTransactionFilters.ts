"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { monthKeyOf, sortedMonthKeys } from "@/lib/format";
import { currenciesUsed, sumByCurrency } from "@/lib/totals";
import type { Filters, Transaction } from "@/lib/types";

const NO_FILTERS: Filters = {
  categoryId: "all",
  type: "all",
  currency: "all",
  month: "all",
  search: "",
};

/** Filters the ledger and sums whatever is left showing. */
export function useTransactionFilters() {
  const { transactions } = useStore();
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);

  const months = useMemo(
    () => sortedMonthKeys(transactions).reverse(),
    [transactions]
  );

  /** Drives whether the currency filter is worth showing at all. */
  const currencies = useMemo(() => currenciesUsed(transactions), [transactions]);

  const filtered = useMemo(() => {
    const needle = filters.search.trim().toLowerCase();
    const matches = (t: Transaction) =>
      (filters.categoryId === "all" || t.categoryId === filters.categoryId) &&
      (filters.type === "all" || t.type === filters.type) &&
      (filters.currency === "all" || t.currency === filters.currency) &&
      (filters.month === "all" || monthKeyOf(t.date) === filters.month) &&
      (!needle || t.description.toLowerCase().includes(needle));

    return transactions
      .filter(matches)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, filters]);

  const totals = useMemo(() => sumByCurrency(filtered), [filtered]);

  return {
    filters,
    setFilters,
    clearFilters: () => setFilters(NO_FILTERS),
    months,
    currencies,
    filtered,
    totals,
    isEmpty: transactions.length === 0,
  };
}
