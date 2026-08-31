import type { Category, Transaction } from "./types";
import { migrate, VERSION, type Snapshot } from "./storage";
import { APP_NAME } from "./config";

/**
 * Getting your data out of the browser and back in.
 *
 * JSON is the backup, and the only thing that comes back in: it round-trips
 * exactly, categories included, and can be read even if it was written by an
 * older version of the app.
 *
 * CSV goes one way only, to a spreadsheet. It carries transactions with
 * category *names* rather than ids, because that is what's readable in a
 * column — and what a name can't carry is the rest of a category, which is why
 * it isn't a backup and isn't accepted back.
 */

export class BackupError extends Error {}

/* =========================================================================
   Export
   ========================================================================= */

export function toJSON(snapshot: Omit<Snapshot, "version">): string {
  return JSON.stringify({ version: VERSION, ...snapshot }, null, 2);
}

const CSV_HEADER = ["date", "type", "category", "amount", "description"];

function csvCell(value: string): string {
  // One transaction, one line: line breaks become spaces so a row can never
  // span two lines. Descriptions come from a single-line input, so this only
  // ever fires on a hand-edited backup.
  const flat = value.replace(/\s*[\r\n]+\s*/g, " ").trim();
  // Quote whenever the value could otherwise break the row apart.
  return /[",]/.test(flat) ? `"${flat.replace(/"/g, '""')}"` : flat;
}

export function toCSV(
  transactions: Transaction[],
  categories: Category[]
): string {
  const nameOf = new Map(categories.map((c) => [c.id, c.name]));
  const rows = transactions.map((t) =>
    [
      t.date,
      t.type,
      csvCell(nameOf.get(t.categoryId) ?? t.categoryId),
      // Plain dot-decimal, so a spreadsheet reads it as a number.
      String(t.amount),
      csvCell(t.description),
    ].join(",")
  );
  return [CSV_HEADER.join(","), ...rows].join("\n") + "\n";
}

/* =========================================================================
   Import
   ========================================================================= */

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

/**
 * Reads a JSON backup. Older files are run through the same migration chain
 * as stored data, so a backup taken months ago still imports cleanly.
 */
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

/* =========================================================================
   Browser plumbing
   ========================================================================= */

/** e.g. "expense-tracker-2026-08-30.json" */
export function backupFilename(extension: "json" | "csv"): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${APP_NAME.toLowerCase().replace(/\s+/g, "-")}-${today}.${extension}`;
}

export function download(filename: string, mime: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
