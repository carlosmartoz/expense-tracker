"use client";

import { useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  BackupError,
  backupFilename,
  download,
  parseJSON,
  toJSON,
} from "@/lib/backup";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface Pending {
  transactions: number;
  categories: number;
  apply: () => void;
}

/** Export, import and start over. Labelled in the sidebar, icons in the header. */
export default function DataMenu({ compact = false }: { compact?: boolean }) {
  const { transactions, categories, clearAll, replaceAll } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const isEmpty = transactions.length === 0;

  function exportBackup() {
    download(backupFilename(), toJSON({ transactions, categories }));
    flash("Backup downloaded.");
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

    if (!file.name.toLowerCase().endsWith(".json")) {
      setError("Pick a .json backup — the one Export backup writes.");
      return;
    }

    try {
      const text = await file.text();
      const next = parseJSON(text);
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
    ? "cursor-pointer rounded-lg px-2.5 py-1.5 text-text-subtle transition hover:bg-surface-raised hover:text-text-primary"
    : "btn-ghost w-full justify-start text-xs";

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={onFile}
        className="hidden"
      />

      <div className={compact ? "flex items-center" : "space-y-2"}>
        <button
          onClick={exportBackup}
          disabled={isEmpty}
          className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-40`}
          aria-label="Export backup"
          title={isEmpty ? "Nothing to export yet" : "Download a backup"}
        >
          <Download className={compact ? "h-4.5 w-4.5" : "h-4 w-4"} />
          {!compact && "Export backup"}
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className={buttonClass}
          aria-label="Import"
          title="Import a JSON backup"
        >
          <Upload className={compact ? "h-4.5 w-4.5" : "h-4 w-4"} />
          {!compact && "Import"}
        </button>

        <button
          onClick={() => setConfirmClear(true)}
          disabled={isEmpty}
          className={
            compact
              ? "cursor-pointer rounded-lg px-2.5 py-1.5 text-text-subtle transition hover:bg-surface-raised hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
              : "btn-ghost w-full justify-start text-xs disabled:cursor-not-allowed disabled:opacity-40"
          }
          aria-label="Clear all"
          title="Delete everything and start over"
        >
          <Trash2 className={compact ? "h-4.5 w-4.5" : "h-4 w-4"} />
          {!compact && "Clear all"}
        </button>
      </div>

      {!compact && error && (
        <p className="mt-2 text-xs leading-snug text-danger">{error}</p>
      )}
      {!compact && note && (
        <p className="mt-2 text-xs leading-snug text-text-secondary">{note}</p>
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
        title="Start over"
        message="This wipes every transaction and returns the categories to the ones the app ships with. Nothing is kept. Export a backup first if you're not sure."
        confirmLabel="Erase everything"
        onConfirm={() => {
          clearAll();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </>
  );
}
