"use client";

import { RotateCcw } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import CategoriesGroup from "@/components/categories/CategoryGroup";
import CategoryForm from "@/components/categories/CategoryForm";
import DeleteCategoryDialog from "@/components/categories/DeleteCategoryDialog";

export default function CategoriesView() {
  const {
    groups,
    usage,
    missingDefaults,
    addMissingDefaults,
    form,
    startEdit,
    askRemove,
    removal,
  } = useCategories();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-text-subtle">
            One list for income and expenses. The ones the app comes with are
            fixed; the rest are yours.
          </p>
        </div>
        {missingDefaults > 0 && (
          <button
            type="button"
            onClick={addMissingDefaults}
            className="btn-ghost text-xs"
            title="Categories that ship with the app but aren't in your list"
          >
            <RotateCcw className="h-4 w-4" />
            Add {missingDefaults} missing default
            {missingDefaults === 1 ? "" : "s"}
          </button>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <CategoryForm form={form} />

        <div className="min-w-0 space-y-4">
          {groups.map((group) => (
            <CategoriesGroup
              key={group.type}
              group={group}
              usage={usage}
              editingId={form.editing?.id}
              onEdit={startEdit}
              onDelete={askRemove}
            />
          ))}
        </div>
      </div>

      <DeleteCategoryDialog
        removal={removal}
        used={removal.target ? (usage[removal.target.id] ?? 0) : 0}
      />
    </div>
  );
}
