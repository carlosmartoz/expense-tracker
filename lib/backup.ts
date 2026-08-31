import { migrate, VERSION, type Snapshot } from "./storage";
import { APP_NAME } from "./config";

// One format, JSON: a backup is always a whole ledger, never a partial one.

export class BackupError extends Error {}

export function toJSON(snapshot: Omit<Snapshot, "version">): string {
  return JSON.stringify({ version: VERSION, ...snapshot }, null, 2);
}

function isTransactionish(v: unknown): boolean {
  if (!v || typeof v !== "object") return false;
  const t = v as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    (t.type === "income" || t.type === "expense") &&
    typeof t.amount === "number" &&
    typeof t.date === "string"
  );
}

/** Reads a backup, migrating an older file the same way stored data is. */
export function parseJSON(text: string): Snapshot {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new BackupError("That file isn't valid JSON.");
  }
  if (!raw || typeof raw !== "object") {
    throw new BackupError(`That file isn't an ${APP_NAME} backup.`);
  }
  const obj = raw as Partial<Snapshot>;
  if (!Array.isArray(obj.transactions) || !Array.isArray(obj.categories)) {
    throw new BackupError(
      `That file isn't an ${APP_NAME} backup — it has no transactions and categories.`
    );
  }
  if (obj.transactions.length && !obj.transactions.every(isTransactionish)) {
    throw new BackupError("Some transactions in that file are missing fields.");
  }
  return migrate({
    version: typeof obj.version === "number" ? obj.version : 1,
    transactions: obj.transactions,
    categories: obj.categories,
  });
}

/** e.g. "expense-tracker-2026-08-30.json" */
export function backupFilename(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${APP_NAME.toLowerCase().replace(/\s+/g, "-")}-${today}.json`;
}

export function download(filename: string, content: string): void {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
