"use client";

import { Check } from "lucide-react";

export interface Swatch {
  value: string;
  name: string;
}

/** Swatches that name themselves on hover and on keyboard focus. */
export default function ColorPicker({
  colors,
  value,
  onChange,
}: {
  colors: readonly Swatch[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {colors.map((c) => {
        const selected = c.value === value;
        return (
          <div key={c.value} className="group relative">
            <button
              type="button"
              onClick={() => onChange(c.value)}
              aria-label={c.name}
              aria-pressed={selected}
              style={{ backgroundColor: c.value }}
              className={`grid h-8 w-8 cursor-pointer place-items-center rounded-full ${
                selected
                  ? "ring-2 ring-text-primary ring-offset-2 ring-offset-surface-panel"
                  : ""
              }`}
            >
              {selected && (
                <Check className="h-4 w-4 text-surface-base" strokeWidth={3} />
              )}
            </button>
            {/* Out of the layout so it can't nudge the grid. */}
            <span
              role="tooltip"
              className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2
                whitespace-nowrap rounded-md border border-border bg-surface-raised px-2
                py-0.5 text-xs text-text-primary opacity-0 transition-opacity
                group-hover:opacity-100 group-focus-within:opacity-100"
            >
              {c.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
