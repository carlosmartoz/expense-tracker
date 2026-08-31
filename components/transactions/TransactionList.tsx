"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Transaction } from "@/lib/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import TransactionForm from "@/components/transactions/TransactionForm";
import TransactionRow from "@/components/transactions/TransactionRow";

export default function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const { deleteTransaction, categoryMap } = useStore();
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

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
        {transactions.map((t) => (
          <TransactionRow
            key={t.id}
            transaction={t}
            category={categoryMap[t.categoryId]}
            onEdit={() => setEditing(t)}
            onDelete={() => setDeleting(t)}
          />
        ))}
      </ul>

      <Modal
        open={editing !== null}
        title="Edit transaction"
        onClose={() => setEditing(null)}
      >
        {editing && (
          <TransactionForm initial={editing} onDone={() => setEditing(null)} />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete transaction"
        message={
          deleting ? (
            <>
              Delete “
              <span className="text-text-primary">{deleting.description}</span>”?
              This can&apos;t be undone.
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
