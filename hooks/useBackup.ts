"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import {
  BackupError,
  backupFilename,
  download,
  parseJSON,
  toJSON,
} from "@/lib/backup";

// How long a "Backup downloaded." style note stays up.
const NOTE_MS = 3000;

interface Pending {
  transactions: number;
  categories: number;
  apply: () => void;
}

// Exporting, importing and clearing the data.
export function useBackup() {
  const { transactions, categories, clearAll, replaceAll } = useStore();
  const [pending, setPending] = useState<Pending | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drops the pending timer on unmount, so it can't fire into a gone component.
  useEffect(
    () => () => {
      if (noteTimer.current) clearTimeout(noteTimer.current);
    },
    []
  );

  // Shows a note for a moment. A second note replaces the first rather than
  // inheriting the time left on it.
  function flash(message: string) {
    setError(null);
    setNote(message);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(null), NOTE_MS);
  }

  function exportBackup() {
    download(backupFilename(), toJSON({ transactions, categories }));
    flash("Backup downloaded.");
  }

  // Reads a picked backup file.
  async function importFile(file: File) {
    setError(null);
    setNote(null);

    if (!file.name.toLowerCase().endsWith(".json")) {
      setError("Pick a .json backup — the one Export backup writes.");
      return;
    }

    try {
      const next = parseJSON(await file.text());
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
        err instanceof BackupError ? err.message : "That file couldn't be read."
      );
    }
  }

  return {
    isEmpty: transactions.length === 0,
    error,
    note,
    exportBackup,
    importFile,
    pending,
    confirmImport: () => {
      const count = pending?.transactions ?? 0;
      pending?.apply();
      setPending(null);
      flash(`Imported ${count} transactions.`);
    },
    cancelImport: () => setPending(null),
    confirmClear,
    askClear: () => setConfirmClear(true),
    cancelClear: () => setConfirmClear(false),
    startOver: () => {
      clearAll();
      setConfirmClear(false);
    },
  };
}
