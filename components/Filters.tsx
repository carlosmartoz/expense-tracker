"use client";

import { FilterX } from "lucide-react";
import { categoryIcon, type Filters } from "@/lib/types";
import { formatMonthKey } from "@/lib/format";
import { useStore } from "@/lib/store";
import Select, { type SelectOption } from "./Select";

interface Props {
  filters: Filters;
  months: string[];
  onChange: (next: Filters) => void;
  onClear: () => void;
}

export default function FiltersBar({
  filters,
  months,
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

  const typeOptions: SelectOption[] = [
    { value: "all", label: "All" },
    { value: "expense", label: "Expenses" },
    { value: "income", label: "Income" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
      <input
        className="input col-span-2 sm:w-[180px] sm:flex-none"
        placeholder="Search…"
        value={filters.search}
        onChange={(e) => patch({ search: e.target.value })}
      />

      <Select
        className="w-full sm:w-[160px]"
        ariaLabel="Filter by month"
        value={filters.month}
        options={monthOptions}
        onChange={(v) => patch({ month: v })}
      />

      <Select
        className="w-full sm:w-[190px]"
        ariaLabel="Filter by category"
        value={filters.categoryId}
        options={categoryOptions}
        onChange={(v) => patch({ categoryId: v })}
      />

      <Select
        className="w-full sm:w-[130px]"
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
