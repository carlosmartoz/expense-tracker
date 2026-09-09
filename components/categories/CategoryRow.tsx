"use client";

import { Pencil, Trash2 } from "lucide-react";
import { isDefaultCategory } from "@/lib/categories";
import type { Category } from "@/types";
import CategoryIcon from "@/components/ui/CategoryIcon";
import IconButton from "@/components/ui/IconButton";

export default function CategoryRow({
  category,
  used,
  editing,
  onEdit,
  onDelete,
}: {
  category: Category;
  used: number;
  editing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const fixed = isDefaultCategory(category.id);

  return (
    <li
      className={`flex items-center gap-3 rounded-xl border p-3 transition ${
        editing
          ? "border-border-strong bg-surface-raised"
          : "border-border bg-surface-raised/40"
      }`}
    >
      <CategoryIcon icon={category.icon} color={category.color} />

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-text-primary">
          {category.name}
        </p>
        <p className="text-xs text-text-subtle">
          {used === 0 ? "Unused" : `${used} transaction${used === 1 ? "" : "s"}`}
        </p>
      </div>

      {/* Defaults carry no buttons. */}
      {!fixed && (
        <>
          <IconButton
            icon={Pencil}
            label={`Edit ${category.name}`}
            onClick={onEdit}
          />
          <IconButton
            icon={Trash2}
            label={`Delete ${category.name}`}
            onClick={onDelete}
          />
        </>
      )}
    </li>
  );
}
