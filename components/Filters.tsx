"use client";

import { FilterX } from "lucide-react";
import { categoryIcon, INCOME_CATEGORY_ID, type Filters } from "@/lib/types";
import { formatMonthKey } from "@/lib/format";
import { useStore } from "@/lib/store";
import Select, { type SelectOption } from "./Select";

interface Props {
  filters: Filters;
  months: string[];
  tags: string[];
  onChange: (next: Filters) => void;
  onClear: () => void;
}

export default function FiltersBar({
  filters,
  months,
  tags,
  onChange,
  onClear,
}: Props) {
  const { categories } = useStore();

  function patch(part: Partial<Filters>) {
    onChange({ ...filters, ...part });
  }

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.type !== "all" ||
    filters.month !== "all" ||
    filters.tag !== "all" ||
    filters.search.trim() !== "";

  const monthOptions: SelectOption[] = [
    { value: "all", label: "All months" },
    ...months.map((m) => ({ value: m, label: formatMonthKey(m) })),
  ];

  // Income transactions only ever use the "Income" category, so when filtering
  // by expenses we drop it from the category options.
  const categoryOptions: SelectOption[] = [
    { value: "all", label: "All categories" },
    ...categories
      .filter(
        (c) => filters.type !== "expense" || c.id !== INCOME_CATEGORY_ID
      )
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

  const tagOptions: SelectOption[] = [
    { value: "all", label: "All tags" },
    ...tags.map((t) => ({ value: t, label: t })),
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

      {filters.type !== "income" && (
        <Select
          className="w-full sm:w-[190px]"
          ariaLabel="Filter by category"
          value={filters.category}
          options={categoryOptions}
          onChange={(v) => patch({ category: v })}
        />
      )}

      <Select
        className="w-full sm:w-[130px]"
        ariaLabel="Filter by type"
        value={filters.type}
        options={typeOptions}
        onChange={(v) => {
          const next = v as Filters["type"];
          // Keep the category filter coherent with the chosen type.
          const resetCategory =
            next === "income" ||
            (next === "expense" && filters.category === INCOME_CATEGORY_ID);
          patch({ type: next, ...(resetCategory ? { category: "all" } : {}) });
        }}
      />

      {tags.length > 0 && (
        <Select
          className="w-full sm:w-[150px]"
          ariaLabel="Filter by tag"
          value={filters.tag}
          options={tagOptions}
          onChange={(v) => patch({ tag: v })}
        />
      )}

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
