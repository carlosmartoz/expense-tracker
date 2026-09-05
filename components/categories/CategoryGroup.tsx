"use client";

import type { CategoryGroup as Group } from "@/hooks/useCategories";
import type { Category } from "@/lib/types";
import CategoryRow from "@/components/categories/CategoryRow";

export default function CategoryGroup({
  group,
  usage,
  editingId,
  onEdit,
  onDelete,
}: {
  group: Group;
  usage: Record<string, number>;
  editingId?: string;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}) {
  return (
    <div className="card min-w-0 p-5">
      <h2 className="mb-3 flex items-baseline gap-2 text-lg font-bold">
        <span>{group.label}</span>
        <span className="text-sm font-normal text-text-subtle">
          {group.items.length}
        </span>
      </h2>

      {group.items.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border py-10 text-center text-sm text-text-subtle">
          No {group.label.toLowerCase()} categories yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {group.items.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              used={usage[cat.id] ?? 0}
              editing={editingId === cat.id}
              onEdit={() => onEdit(cat)}
              onDelete={() => onDelete(cat)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
