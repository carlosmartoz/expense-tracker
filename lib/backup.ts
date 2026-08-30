import type { Category, Transaction, TransactionType } from "./types";
import { CATEGORY_COLORS } from "./types";
import { migrate, VERSION, type Snapshot } from "./storage";
import { APP_NAME } from "./config";

/**
 * Getting your data out of the browser and back in.
 *
 * Two formats, for two jobs:
 *  - JSON is the backup. It round-trips exactly, categories included, and can
 *    be read back even if it was written by an older version of the app.
 *  - CSV is for spreadsheets. It carries transactions only, with category
 *    *names* rather than ids, because that's what's readable in a column.
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

/** Splits one CSV line, honouring quoted fields and doubled quotes. */
function splitCSVLine(line: string): string[] {
  const out: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      out.push(cell);
      cell = "";
    } else {
      cell += ch;
    }
  }
  out.push(cell);
  return out;
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Reads a CSV of transactions against the categories you already have.
 * A row naming a category that doesn't exist on its side creates one, so a
 * file exported from somewhere else lands complete rather than half-empty.
 */
export function parseCSV(
  text: string,
  existing: Category[]
): { transactions: Transaction[]; categories: Category[] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) throw new BackupError("That file is empty.");

  const header = splitCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
  const missing = CSV_HEADER.filter((h) => !header.includes(h));
  if (missing.length) {
    throw new BackupError(
      `That CSV is missing the ${missing.join(", ")} column${
        missing.length > 1 ? "s" : ""
      }.`
    );
  }
  const col = (name: string) => header.indexOf(name);

  const categories = [...existing];
  const transactions: Transaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCSVLine(lines[i]);
    const rowNo = i + 1;

    const date = cells[col("date")]?.trim() ?? "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BackupError(`Row ${rowNo}: "${date}" isn't a YYYY-MM-DD date.`);
    }

    const rawType = cells[col("type")]?.trim().toLowerCase();
    if (rawType !== "income" && rawType !== "expense") {
      throw new BackupError(
        `Row ${rowNo}: type must be income or expense, not "${rawType}".`
      );
    }
    const type = rawType as TransactionType;

    const amount = Number(cells[col("amount")]?.trim());
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BackupError(
        `Row ${rowNo}: amount must be a number greater than 0.`
      );
    }

    const categoryName = cells[col("category")]?.trim() || "Other";
    let category = categories.find(
      (c) => c.type === type && c.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (!category) {
      category = {
        id: uid(),
        name: categoryName,
        color: CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length],
        icon: "Tag",
        type,
      };
      categories.push(category);
    }

    transactions.push({
      id: uid(),
      type,
      amount,
      categoryId: category.id,
      description: cells[col("description")]?.trim() || categoryName,
      date,
    });
  }

  if (transactions.length === 0) {
    throw new BackupError("That CSV has a header but no rows.");
  }
  return { transactions, categories };
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
