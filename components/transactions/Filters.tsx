"use client";

import { FilterX } from "lucide-react";
import { categoryIcon, SIDES, type Filters } from "@/lib/types";
import { formatMonthKey } from "@/lib/format";
import { type CurrencyCode } from "@/lib/config";
import { useStore } from "@/lib/store";
import Select, { type SelectOption } from "@/components/ui/Select";

interface Props {
  filters: Filters;
  months: string[];
  /** Every currency the ledger holds, which decides whether to offer the filter. */
  currencies: CurrencyCode[];
  onChange: (next: Filters) => void;
  onClear: () => void;
}

export default function FiltersBar({
  filters,
  months,
  currencies,
  onChange,
  onClear,
}: Props) {
  const { categories } = useStore();

  function patch(part: Partial<Filters>) {
    onChange({ ...filters, ...part });
  }

  const hasActiveFilters =
    filters.categoryId !== "all" ||
    filters.type !== "all" ||
    filters.currency !== "all" ||
    filters.month !== "all" ||
    filters.search.trim() !== "";

  const monthOptions: SelectOption[] = [
    { value: "all", label: "All months" },
    ...months.map((m) => ({ value: m, label: formatMonthKey(m) })),
  ];

  // When a type is selected, only that side's categories are worth offering.
  const categoryOptions: SelectOption[] = [
    { value: "all", label: "All categories" },
    ...categories
      .filter((c) => filters.type === "all" || c.type === filters.type)
      .map((c) => ({
        value: c.id,
        label: c.name,
        icon: categoryIcon(c.icon),
        iconColor: c.color,
      })),
  ];

  // A ledger in one currency has nothing to choose between, so it gets no
  // control — but one already set has to stay reachable to be cleared.
  const showCurrency = currencies.length > 1 || filters.currency !== "all";

  // The chosen one stays listed even if the last of it was just deleted, so
  // the control never sits there showing a blank.
  const currencyChoices = [
    ...new Set(
      filters.currency === "all"
        ? currencies
        : [...currencies, filters.currency]
    ),
  ];

  const currencyOptions: SelectOption[] = [
    { value: "all", label: "All currencies" },
    ...currencyChoices.map((c) => ({ value: c, label: c })),
  ];

  const typeOptions: SelectOption[] = [{ value: "all", label: "All" }, ...SIDES];

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
      <input
        className="input col-span-2 sm:w-45 sm:flex-none"
        placeholder="Search…"
        value={filters.search}
        onChange={(e) => patch({ search: e.target.value })}
      />

      <Select
        className="w-full sm:w-40"
        ariaLabel="Filter by month"
        value={filters.month}
        options={monthOptions}
        onChange={(v) => patch({ month: v })}
      />

      <Select
        className="w-full sm:w-47.5"
        ariaLabel="Filter by category"
        value={filters.categoryId}
        options={categoryOptions}
        onChange={(v) => patch({ categoryId: v })}
      />

      {showCurrency && (
        <Select
          className="w-full sm:w-37.5"
          ariaLabel="Filter by currency"
          value={filters.currency}
          options={currencyOptions}
          onChange={(v) => patch({ currency: v as Filters["currency"] })}
        />
      )}

      <Select
        className="w-full sm:w-32.5"
        ariaLabel="Filter by type"
        value={filters.type}
        options={typeOptions}
        onChange={(v) => {
          const next = v as Filters["type"];
          // Drop the category filter if it belongs to the other side now.
          const chosen = categories.find((c) => c.id === filters.categoryId);
          const orphaned = next !== "all" && chosen && chosen.type !== next;
          patch({ type: next, ...(orphaned ? { categoryId: "all" } : {}) });
        }}
      />

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="btn-ghost col-span-2 justify-center sm:col-span-1 sm:w-auto"
        >
          <FilterX className="h-4 w-4" /> Clear filters
        </button>
      )}
    </div>
  );
}
