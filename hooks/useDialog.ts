"use client";

import { useEffect, useId } from "react";

// What both overlays do the same way: Escape closes them, and the page
// behind stops scrolling for as long as one is open.
// Nesting is safe — each dialog restores the value it found on the way in.
export function useDialog(open: boolean, onClose: () => void) {
  // Ties the panel to its own heading for screen readers.
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return { titleId };
}
