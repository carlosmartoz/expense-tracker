"use client";

import type { ReactNode } from "react";

// A labelled control.
export default function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <span className="stat-label">{label}</span>
      <div className="mt-1">{children}</div>
      {hint}
    </div>
  );
}
