import { isCategory, isTransaction, type Snapshot } from "@/lib/storage";
import { APP_NAME } from "@/lib/config";

// Reads and writes the JSON backup file.
export class BackupError extends Error {}

export function toJSON(snapshot: Snapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

// Reads a backup file.
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
      `That file isn't an ${APP_NAME} backup — it has no transactions and categories.`,
    );
  }
  if (!obj.transactions.every(isTransaction)) {
    throw new BackupError("Some transactions in that file are missing fields.");
  }
  if (!obj.categories.every(isCategory)) {
    throw new BackupError("Some categories in that file are missing fields.");
  }
  return { transactions: obj.transactions, categories: obj.categories };
}

// e.g. "expense-tracker-2026-08-30.json"
export function backupFilename(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${APP_NAME.toLowerCase().replace(/\s+/g, "-")}-${today}.json`;
}

export function download(filename: string, content: string): void {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
