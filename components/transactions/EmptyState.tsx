"use client";

import { Wallet } from "lucide-react";

// Shown in place of the history when there are no transactions.
export default function EmptyState() {
  return (
    <div className="card flex flex-col items-center gap-4 p-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-raised text-text-secondary">
        <Wallet className="h-7 w-7" />
      </span>

      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-text-primary">
          Nothing here yet
        </h2>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-text-secondary">
          Use the form to write down what you earned or spent. Your balance and
          the full history show up here as soon as there is something to show.
        </p>
      </div>

      <p className="text-xs text-text-subtle">
        Already have a backup? Use{" "}
        <span className="text-text-secondary">Import</span> in the sidebar.
      </p>
    </div>
  );
}
