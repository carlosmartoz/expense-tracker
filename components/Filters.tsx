"use client";

import { CATEGORIES, type Filters } from "@/lib/types";
import { formatMonthKey } from "@/lib/format";

interface Props {
  filters: Filters;
  months: string[];
  onChange: (next: Filters) => void;
}

export default function FiltersBar({ filters, months, onChange }: Props) {
  function patch(part: Partial<Filters>) {
    onChange({ ...filters, ...part });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        className="input max-w-[180px]"
        placeholder="Buscar…"
        value={filters.search}
        onChange={(e) => patch({ search: e.target.value })}
      />

      <select
        className="input max-w-[150px]"
        value={filters.month}
        onChange={(e) => patch({ month: e.target.value })}
      >
        <option value="all">Todos los meses</option>
        {months.map((m) => (
          <option key={m} value={m}>
            {formatMonthKey(m)}
          </option>
        ))}
      </select>

      <select
        className="input max-w-[150px]"
        value={filters.category}
        onChange={(e) => patch({ category: e.target.value as Filters["category"] })}
      >
        <option value="all">Todas las categorías</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        className="input max-w-[130px]"
        value={filters.type}
        onChange={(e) => patch({ type: e.target.value as Filters["type"] })}
      >
        <option value="all">Todo</option>
        <option value="expense">Gastos</option>
        <option value="income">Ingresos</option>
      </select>
    </div>
  );
}
