"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/format";
import { LOCALE } from "@/lib/config";

interface DatePickerProps {
  /** ISO date string, YYYY-MM-DD. */
  value: string;
  onChange: (iso: string) => void;
  ariaLabel?: string;
  className?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function parseISO(v: string): { y: number; m: number; d: number } | null {
  const parts = v.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  const [y, m, d] = parts;
  return { y, m: m - 1, d };
}

/**
 * Custom calendar popover that matches the app's dark UI (native date pickers
 * can't be styled). Keyboard: Enter/Space/ArrowDown opens, Escape closes.
 */
export default function DatePicker({
  value,
  onChange,
  ariaLabel,
  className = "",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => parseISO(value), [value]);
  const [view, setView] = useState(() => {
    const base = selected ?? parseISO(new Date().toISOString().slice(0, 10))!;
    return { y: base.y, m: base.m };
  });

  /** Opening jumps the calendar to the selected month, in the same render. */
  function openCalendar() {
    if (selected) setView({ y: selected.y, m: selected.m });
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

  const todayISO = new Date().toISOString().slice(0, 10);

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
    onChange(toISO(view.y, view.m, day));
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
        className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-dark--600
          bg-dark--700 px-3 py-2 text-left text-sm text-text-primary outline-none transition
          hover:border-dark--600/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-text-secondary" />
        <span className={`flex-1 truncate ${selected ? "" : "text-text-subtle"}`}>
          {selected ? formatDate(value) : "Select date"}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute z-30 mt-1.5 w-[17rem] rounded-xl border border-white/10
            bg-dark--800 p-3 shadow-card"
        >
          {/* Header */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-text-secondary transition hover:bg-dark--700 hover:text-text-primary"
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
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-text-secondary transition hover:bg-dark--700 hover:text-text-primary"
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
              const iso = toISO(view.y, view.m, day);
              const isSelected = iso === value;
              const isToday = iso === todayISO;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => pick(day)}
                  className={`grid h-8 cursor-pointer place-items-center rounded-lg text-sm transition ${
                    isSelected
                      ? "bg-brand-600 font-semibold text-white"
                      : isToday
                        ? "text-brand-400 ring-1 ring-brand-500/50 hover:bg-dark--700"
                        : "text-text-primary hover:bg-dark--700"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-2 flex justify-end border-t border-dark--600 pt-2">
            <button
              type="button"
              onClick={() => {
                onChange(todayISO);
                setOpen(false);
              }}
              className="cursor-pointer rounded-lg px-2 py-1 text-xs font-medium text-brand-400 transition hover:bg-dark--700"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
