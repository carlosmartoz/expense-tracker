"use client";

import { useRef } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { useBackup } from "@/hooks/useBackup";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

// Export, import and start over.
export default function DataMenu({ compact = false }: { compact?: boolean }) {
  const b = useBackup();
  const fileRef = useRef<HTMLInputElement>(null);

  const buttonClass = compact
    ? "cursor-pointer rounded-lg px-2.5 py-1.5 text-text-subtle transition hover:bg-surface-raised hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
    : "btn-ghost w-full justify-start text-xs disabled:cursor-not-allowed disabled:opacity-40";
  const iconClass = compact ? "h-4.5 w-4.5" : "h-4 w-4";

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Cleared so the same file can be picked again.
          e.target.value = "";
          if (file) b.importFile(file);
        }}
        className="hidden"
      />

      <div className={compact ? "flex items-center" : "space-y-2"}>
        <button
          onClick={b.exportBackup}
          disabled={b.isEmpty}
          className={buttonClass}
          aria-label="Export backup"
          title={b.isEmpty ? "Nothing to export yet" : "Download a backup"}
        >
          <Download className={iconClass} />
          {!compact && "Export backup"}
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className={buttonClass}
          aria-label="Import"
          title="Import a JSON backup"
        >
          <Upload className={iconClass} />
          {!compact && "Import"}
        </button>

        <button
          onClick={b.askClear}
          disabled={b.isEmpty}
          className={buttonClass}
          aria-label="Start over"
          title="Delete everything and start over"
        >
          <Trash2 className={iconClass} />
          {!compact && "Start over"}
        </button>
      </div>

      {/* Always two lines tall (2 x text-xs/leading-snug = 2.0625rem), so a
          message appearing never shifts the buttons above it. */}
      {!compact && (
        <p
          aria-live="polite"
          className={`mt-2 line-clamp-2 min-h-[2.0625rem] text-xs leading-snug ${
            b.error ? "text-danger" : "text-text-secondary"
          }`}
        >
          {b.error ?? b.note}
        </p>
      )}

      <ConfirmDialog
        open={b.pending !== null}
        variant="default"
        title="Replace your data?"
        message={
          b.pending ? (
            <>
              This file holds{" "}
              <span className="text-text-primary">
                {b.pending.transactions} transaction
                {b.pending.transactions === 1 ? "" : "s"}
              </span>{" "}
              and {b.pending.categories} categories. Importing replaces
              everything currently in this browser.
            </>
          ) : null
        }
        confirmLabel="Import"
        onConfirm={b.confirmImport}
        onCancel={b.cancelImport}
      />

      <ConfirmDialog
        open={b.confirmClear}
        title="Start over"
        message="This wipes every transaction and returns the categories to the ones the app ships with. Nothing is kept. Export a backup first if you're not sure."
        confirmLabel="Erase everything"
        onConfirm={b.startOver}
        onCancel={b.cancelClear}
      />
    </>
  );
}
