"use client";

import { useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  BackupError,
  backupFilename,
  download,
  parseCSV,
  parseJSON,
  toCSV,
  toJSON,
} from "@/lib/backup";
import ConfirmDialog from "./ConfirmDialog";

interface Pending {
  transactions: number;
  categories: number;
  apply: () => void;
}

/**
 * Export, import and clear. Rendered twice — labelled in the sidebar and as
 * icons in the mobile bar — so the same actions are reachable either way.
 */
export default function DataMenu({ compact = false }: { compact?: boolean }) {
  const { transactions, categories, clearAll, replaceAll } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const isEmpty = transactions.length === 0;

  function exportJSON() {
    download(
      backupFilename("json"),
      "application/json",
      toJSON({ transactions, categories })
    );
    flash("Backup downloaded.");
  }

  function exportCSV() {
    download(backupFilename("csv"), "text/csv", toCSV(transactions, categories));
    flash("CSV downloaded.");
  }

  function flash(message: string) {
    setError(null);
    setNote(message);
    setTimeout(() => setNote(null), 3000);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Clear it straight away so picking the same file twice still fires.
    e.target.value = "";
    if (!file) return;
    setError(null);
    setNote(null);

    try {
      const text = await file.text();
      const next = file.name.toLowerCase().endsWith(".csv")
        ? parseCSV(text, categories)
        : parseJSON(text);
      setPending({
        transactions: next.transactions.length,
        categories: next.categories.length,
        apply: () =>
          replaceAll({
            transactions: next.transactions,
            categories: next.categories,
          }),
      });
    } catch (err) {
      setError(
        err instanceof BackupError
          ? err.message
          : "That file couldn't be read."
      );
    }
  }

  const buttonClass = compact
    ? "cursor-pointer rounded-lg px-2.5 py-1.5 text-text-subtle transition hover:bg-dark--700 hover:text-text-primary"
    : "btn-ghost w-full justify-start text-xs";

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".json,.csv,application/json,text/csv"
        onChange={onFile}
        className="hidden"
      />

      <div className={compact ? "flex items-center" : "space-y-2"}>
        <button
          onClick={exportJSON}
          disabled={isEmpty}
          className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-40`}
          aria-label="Export backup"
          title={isEmpty ? "Nothing to export yet" : "Export a JSON backup"}
        >
          <Download className={compact ? "h-[18px] w-[18px]" : "h-4 w-4"} />
          {!compact && "Export backup"}
        </button>

        {!compact && (
          <button
            onClick={exportCSV}
            disabled={isEmpty}
            className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-40`}
            title={isEmpty ? "Nothing to export yet" : "Export a CSV for spreadsheets"}
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        )}

        <button
          onClick={() => fileRef.current?.click()}
          className={buttonClass}
          aria-label="Import"
          title="Import a JSON backup or a CSV"
        >
          <Upload className={compact ? "h-[18px] w-[18px]" : "h-4 w-4"} />
          {!compact && "Import"}
        </button>

        <button
          onClick={() => setConfirmClear(true)}
          disabled={isEmpty}
          className={
            compact
              ? "cursor-pointer rounded-lg px-2.5 py-1.5 text-text-subtle transition hover:bg-coral/10 hover:text-coral disabled:cursor-not-allowed disabled:opacity-40"
              : "btn-ghost w-full justify-start text-xs text-coral hover:bg-coral/5 disabled:cursor-not-allowed disabled:opacity-40"
          }
          aria-label="Clear all"
          title="Delete every transaction"
        >
          <Trash2 className={compact ? "h-[18px] w-[18px]" : "h-4 w-4"} />
          {!compact && "Clear all"}
        </button>
      </div>

      {!compact && error && (
        <p className="mt-2 text-xs leading-snug text-coral">{error}</p>
      )}
      {!compact && note && (
        <p className="mt-2 text-xs leading-snug text-mint">{note}</p>
      )}

      <ConfirmDialog
        open={pending !== null}
        variant="default"
        title="Replace your data?"
        message={
          pending ? (
            <>
              This file holds{" "}
              <span className="text-text-primary">
                {pending.transactions} transaction
                {pending.transactions === 1 ? "" : "s"}
              </span>{" "}
              and {pending.categories} categories. Importing replaces
              everything currently in this browser.
            </>
          ) : null
        }
        confirmLabel="Import"
        onConfirm={() => {
          pending?.apply();
          const count = pending?.transactions ?? 0;
          setPending(null);
          flash(`Imported ${count} transactions.`);
        }}
        onCancel={() => setPending(null)}
      />

      <ConfirmDialog
        open={confirmClear}
        title="Clear all transactions"
        message="This permanently removes every transaction. Your categories stay. Export a backup first if you're not sure."
        confirmLabel="Clear all"
        onConfirm={() => {
          clearAll();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </>
  );
}
