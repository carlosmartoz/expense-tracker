import { APP_NAME } from "@/lib/config";
import { todayISO } from "@/lib/format";
import { snapshotProblem } from "@/lib/validate";
import type { Snapshot, SnapshotProblem } from "@/types";

// Reads and writes the JSON backup file.
export class BackupError extends Error {}

// What each rejection reads like to someone who just picked the wrong file.
const MESSAGES: Record<SnapshotProblem, string> = {
  "not-an-object": `That file isn't an ${APP_NAME} backup.`,
  "missing-lists": `That file isn't an ${APP_NAME} backup — it has no transactions and categories.`,
  "bad-transaction": "Some transactions in that file are missing fields.",
  "bad-category": "Some categories in that file are missing fields.",
};

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

  const problem = snapshotProblem(raw);
  if (problem) throw new BackupError(MESSAGES[problem]);

  const { transactions, categories } = raw as Snapshot;
  return { transactions, categories };
}

// e.g. "expense-tracker-2026-08-30.json"
export function backupFilename(): string {
  return `${APP_NAME.toLowerCase().replace(/\s+/g, "-")}-${todayISO()}.json`;
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
