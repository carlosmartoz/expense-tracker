"use client";

export interface Segment<T extends string> {
  value: T;
  label: string;
}

/** Two or three mutually exclusive choices as a pill. The picked one is light. */
export default function SegmentedToggle<T extends string>({
  segments,
  value,
  onChange,
  disabled = false,
  ariaLabel,
}: {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (next: T) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid gap-2 rounded-xl bg-surface-raised p-1"
      style={{ gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))` }}
    >
      {segments.map((s) => (
        <button
          key={s.value}
          type="button"
          role="radio"
          aria-checked={value === s.value}
          disabled={disabled}
          onClick={() => onChange(s.value)}
          className={`cursor-pointer rounded-lg py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
            value === s.value
              ? "bg-accent text-accent-text shadow"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
