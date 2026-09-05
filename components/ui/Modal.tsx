"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import Portal from "@/components/ui/Portal";

/** A titled panel over a dimmed page. Closes on Escape, backdrop or the X. */
export default function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="card my-6 w-full max-w-md p-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">{title}</h2>
            <IconButton label="Close" onClick={onClose} icon={X} size="lg" />
          </div>
          {children}
        </div>
      </div>
    </Portal>
  );
}
