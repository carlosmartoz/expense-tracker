"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { monthKeyOf, sortedMonthKeys } from "@/lib/format";
import { LOCALE } from "@/lib/config";
import { currenciesUsed, sumEveryCurrency } from "@/lib/totals";
import type { Filters, Transaction } from "@/types";

const NO_FILTERS: Filters = {
  categoryId: "all",
  type: "all",
  currency: "all",
  month: "all",
  search: "",
};

// Filters the transactions and sums whatever is left showing.
export function useTransactionFilters() {
  const { transactions, categoryMap } = useStore();
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);

  const months = useMemo(
    () => sortedMonthKeys(transactions).reverse(),
    [transactions]
  );

  // Every currency in use.
  const currencies = useMemo(() => currenciesUsed(transactions), [transactions]);

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const matches = (t: Transaction) =>
      (filters.categoryId === "all" || t.categoryId === filters.categoryId) &&
      (filters.type === "all" || t.type === filters.type) &&
      (filters.currency === "all" || t.currency === filters.currency) &&
      (filters.month === "all" || monthKeyOf(t.date) === filters.month) &&
      (!query || t.description.toLowerCase().includes(query));

    // Newest date first, and within one date every category stays together.
    return transactions
      .filter(matches)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        const nameA = categoryMap[a.categoryId]?.name ?? "";
        const nameB = categoryMap[b.categoryId]?.name ?? "";
        if (nameA !== nameB) return nameA.localeCompare(nameB, LOCALE);
        // Same name, different category: keep the order stable anyway.
        return a.categoryId < b.categoryId ? -1 : a.categoryId > b.categoryId ? 1 : 0;
      });
  }, [transactions, filters, categoryMap]);

  const totals = useMemo(() => sumEveryCurrency(filtered), [filtered]);

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
