"use client";

import { categoryIcon } from "@/lib/types";
import type { useCategories } from "@/hooks/useCategories";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Select from "@/components/ui/Select";

type Removal = ReturnType<typeof useCategories>["removal"];

export default function DeleteCategoryDialog({
  removal,
  used,
}: {
  removal: Removal;
  used: number;
}) {
  const target = removal.target;

  return (
    <ConfirmDialog
      open={target !== null}
      title={target ? `Delete “${target.name}”` : "Delete category"}
      message={
        target ? (
          <div className="space-y-3">
            <p>
              {used === 0
                ? "Nothing is using it, so nothing moves."
                : `Its ${used} transaction${used === 1 ? "" : "s"} will move to:`}
            </p>
            {used > 0 && (
              <Select
                ariaLabel="Move transactions to"
                value={removal.moveTo}
                onChange={removal.setMoveTo}
                options={removal.moveOptions.map((c) => ({
                  value: c.id,
                  label: c.name,
                  icon: categoryIcon(c.icon),
                  iconColor: c.color,
                }))}
              />
            )}
          </div>
        ) : null
      }
      confirmLabel="Delete"
      onConfirm={removal.confirm}
      onCancel={removal.cancel}
    />
  );
}
