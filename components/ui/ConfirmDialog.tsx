"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Portal from "@/components/ui/Portal";

interface Props {
  open: boolean;
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  // "danger" paints the confirm button red (destructive actions).
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

// Replaces window.confirm(). Closes on Escape, backdrop click or Cancel.
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onCancel}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="card w-full max-w-sm p-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-3">
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-raised ${
                variant === "danger" ? "text-text-primary" : "text-text-secondary"
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-text-primary">{title}</h2>
              {message && (
                <div className="mt-1 text-sm text-text-secondary">{message}</div>
              )}
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="btn-ghost">
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={variant === "danger" ? "btn-danger" : "btn-primary"}
              autoFocus
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
