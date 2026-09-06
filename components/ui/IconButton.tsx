"use client";

import type { LucideIcon } from "lucide-react";

// An icon button. The label is its tooltip and accessible name.
export default function IconButton({
  icon: Icon,
  label,
  onClick,
  size = "md",
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  size?: "md" | "lg";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="shrink-0 cursor-pointer rounded-lg p-1.5 text-text-secondary transition hover:bg-surface-raised hover:text-text-primary"
    >
      <Icon className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
    </button>
  );
}
