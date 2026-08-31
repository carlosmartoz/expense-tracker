"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { backdrop, modalPanel } from "@/lib/motion";
import Portal from "./Portal";

interface Props {
  open: boolean;
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" paints the confirm button red (destructive actions). */
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Dark-themed confirmation dialog used in place of the native window.confirm().
 * Closes on Escape, on backdrop click, or via the Cancel button.
 */
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
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <Portal>
      <AnimatePresence>
        {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onCancel}
          role="dialog"
          aria-modal="true"
          variants={backdrop}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          <motion.div
            className="card w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
            variants={modalPanel}
          >
        <div className="flex items-start gap-3">
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
              variant === "danger"
                ? "bg-surface-raised text-text-primary"
                : "bg-surface-raised text-text-secondary"
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
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
