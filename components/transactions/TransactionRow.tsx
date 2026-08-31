"use client";

import { Pencil, Trash2 } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/format";
import type { Category, Transaction } from "@/lib/types";
import CategoryIcon from "@/components/ui/CategoryIcon";
import IconButton from "@/components/ui/IconButton";

export default function TransactionRow({
  transaction: t,
  category,
  onEdit,
  onDelete,
}: {
  transaction: Transaction;
  category?: Category;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isIncome = t.type === "income";

  return (
    <li className="group flex items-start gap-3 py-3">
      <CategoryIcon
        icon={category?.icon}
        color={category?.color}
        className="mt-0.5 h-5 w-5 sm:h-6 sm:w-6"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {t.description}
        </p>
        <p className="mt-0.5 truncate text-xs text-text-secondary">
          {category?.name ?? "Uncategorised"} · {formatDate(t.date)}
        </p>
      </div>

      <span
        className={`mt-0.5 shrink-0 text-sm font-semibold ${
          isIncome ? "text-positive" : "text-negative"
        }`}
      >
        {isIncome ? "+" : "−"}
        {formatMoney(t.amount)}
      </span>

      {/* Always visible on touch, hover-reveal on desktop. */}
      <div className="mt-0.5 flex shrink-0 items-center gap-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
        <IconButton icon={Pencil} label="Edit" onClick={onEdit} />
        <IconButton icon={Trash2} label="Delete" onClick={onDelete} />
      </div>
    </li>
  );
}
