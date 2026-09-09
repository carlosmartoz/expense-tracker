"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, isoDate, parseISODate, todayISO } from "@/lib/format";
import { LOCALE } from "@/lib/config";

interface DatePickerProps {
  // ISO date string, YYYY-MM-DD.
  value: string;
  onChange: (iso: string) => void;
  ariaLabel?: string;
  className?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// A calendar popover for picking a date.
// Keyboard: Enter, Space or ArrowDown opens, Escape closes.
export default function DatePicker({
  value,
  onChange,
  ariaLabel,
  className = "",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => parseISODate(value), [value]);
  const [view, setView] = useState(() => {
    const now = new Date();
    return selected
      ? { y: selected.year, m: selected.month }
      : { y: now.getFullYear(), m: now.getMonth() };
  });

  // Jumps the calendar to the selected month.
  function openCalendar() {
    if (selected) setView({ y: selected.year, m: selected.month });
    setOpen(true);
  }

  // Close on click outside.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const today = todayISO();

  const firstWeekday = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const monthLabel = new Date(view.y, view.m, 1).toLocaleDateString(LOCALE, {
    month: "long",
    year: "numeric",
  });

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function shiftMonth(delta: number) {
    setView((v) => {
      const next = new Date(v.y, v.m + delta, 1);
      return { y: next.getFullYear(), m: next.getMonth() };
    });
  }

  function pick(day: number) {
    onChange(isoDate(view.y, view.m, day));
    setOpen(false);
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openCalendar();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openCalendar())}
        onKeyDown={onTriggerKeyDown}
        className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-border
          bg-surface-raised px-3 py-2 text-left text-sm text-text-primary outline-none transition
          hover:border-border/80 focus:border-border-strong focus:ring-2 focus:ring-text-subtle/40"
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-text-secondary" />
        <span className={`flex-1 truncate ${selected ? "" : "text-text-subtle"}`}>
          {selected ? formatDate(value) : "Select date"}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute z-30 mt-1.5 w-68 rounded-xl border border-border
            bg-surface-panel p-3 shadow-card"
        >
          {/* Header */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-text-secondary transition hover:bg-surface-raised hover:text-text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-text-primary">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-text-secondary transition hover:bg-surface-raised hover:text-text-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday row */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="grid h-7 place-items-center text-xs font-medium text-text-subtle"
              >
                {w}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`e${idx}`} className="h-8" />;
              const iso = isoDate(view.y, view.m, day);
              const isSelected = iso === value;
              const isToday = iso === today;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => pick(day)}
                  className={`grid h-8 cursor-pointer place-items-center rounded-lg text-sm transition ${
                    isSelected
                      ? "bg-accent font-semibold text-accent-text"
                      : isToday
                        ? "text-text-primary ring-1 ring-border-strong hover:bg-surface-raised"
                        : "text-text-primary hover:bg-surface-raised"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-2 flex justify-end border-t border-border pt-2">
            <button
              type="button"
              onClick={() => {
                onChange(today);
                setOpen(false);
              }}
              className="cursor-pointer rounded-lg px-2 py-1 text-xs font-medium text-text-primary transition hover:bg-surface-raised"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
