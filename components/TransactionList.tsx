"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { backdrop, modalPanel } from "@/lib/motion";
import Portal from "./Portal";
import type { Transaction } from "@/lib/types";
import { categoryIcon } from "@/lib/types";
import { formatMoney, formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import TransactionForm from "./TransactionForm";
import ConfirmDialog from "./ConfirmDialog";

export default function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const { deleteTransaction, categoryMap } = useStore();
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  // Close the edit modal with Escape.
  useEffect(() => {
    if (!editing) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setEditing(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [editing]);

  if (transactions.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-border py-12 text-center text-sm text-text-subtle">
        No transactions match your filters.
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-white/6">
        {transactions.map((t) => {
          const meta = categoryMap[t.categoryId];
          const Icon = categoryIcon(meta?.icon);
          const isIncome = t.type === "income";
          return (
            <li key={t.id} className="group flex items-start gap-3 py-3">
              <span className="mt-0.5 shrink-0" style={{ color: meta?.color }}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">
                  {t.description}
                </p>
                <p className="mt-0.5 truncate text-xs text-text-secondary">
                  {meta?.name ?? "Uncategorised"} · {formatDate(t.date)}
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
              {/* Actions: always visible on touch, hover-reveal on desktop. */}
              <div className="mt-0.5 flex shrink-0 items-center gap-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                <button
                  onClick={() => setEditing(t)}
                  className="cursor-pointer rounded-lg p-1.5 text-text-secondary transition hover:bg-surface-raised hover:text-text-primary"
                  aria-label="Edit"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleting(t)}
                  className="cursor-pointer rounded-lg p-1.5 text-text-secondary transition hover:bg-surface-raised hover:text-text-primary"
                  aria-label="Delete"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <Portal>
        <AnimatePresence>
          {editing && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setEditing(null)}
          role="dialog"
          aria-modal="true"
          variants={backdrop}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          <motion.div
            className="card my-6 w-full max-w-md p-5"
            onClick={(e) => e.stopPropagation()}
            variants={modalPanel}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Edit transaction</h2>
              <button
                onClick={() => setEditing(null)}
                aria-label="Close"
                className="cursor-pointer rounded-lg p-1.5 text-text-secondary transition hover:bg-surface-raised hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <TransactionForm initial={editing} onDone={() => setEditing(null)} />
          </motion.div>
        </motion.div>
          )}
        </AnimatePresence>
      </Portal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete transaction"
        message={
          deleting ? (
            <>
              Delete “<span className="text-text-primary">{deleting.description}</span>
              ”? This can&apos;t be undone.
            </>
          ) : null
        }
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleting) deleteTransaction(deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
