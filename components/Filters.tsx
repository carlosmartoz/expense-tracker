"use client";

import { CATEGORIES, CATEGORY_META, type Filters } from "@/lib/types";
import { formatMonthKey } from "@/lib/format";
import Select, { type SelectOption } from "./Select";

interface Props {
  filters: Filters;
  months: string[];
  onChange: (next: Filters) => void;
}

export default function FiltersBar({ filters, months, onChange }: Props) {
  function patch(part: Partial<Filters>) {
    onChange({ ...filters, ...part });
  }

  const monthOptions: SelectOption[] = [
    { value: "all", label: "All months" },
    ...months.map((m) => ({ value: m, label: formatMonthKey(m) })),
  ];

  const categoryOptions: SelectOption[] = [
    { value: "all", label: "All categories" },
    ...CATEGORIES.map((c) => ({
      value: c,
      label: c,
      icon: CATEGORY_META[c].icon,
      iconColor: CATEGORY_META[c].color,
    })),
  ];

  const typeOptions: SelectOption[] = [
    { value: "all", label: "All" },
    { value: "expense", label: "Expenses" },
    { value: "income", label: "Income" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        className="input max-w-[180px]"
        placeholder="Search…"
        value={filters.search}
        onChange={(e) => patch({ search: e.target.value })}
      />

      <Select
        className="w-[160px]"
        ariaLabel="Filter by month"
        value={filters.month}
        options={monthOptions}
        onChange={(v) => patch({ month: v })}
      />

      <Select
        className="w-[190px]"
        ariaLabel="Filter by category"
        value={filters.category}
        options={categoryOptions}
        onChange={(v) => patch({ category: v as Filters["category"] })}
      />

      <Select
        className="w-[130px]"
        ariaLabel="Filter by type"
        value={filters.type}
        options={typeOptions}
        onChange={(v) => patch({ type: v as Filters["type"] })}
      />
    </div>
  );
}
