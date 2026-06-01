"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Check, type LucideIcon } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  /** Optional leading icon shown in the trigger and list. */
  icon?: LucideIcon;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  /** Accessible label when there's no visible <label>. */
  ariaLabel?: string;
  className?: string;
}

/**
 * Custom dropdown that fully matches the app's dark UI (native <select> popups
 * can't be styled). Keyboard-accessible: Arrow keys / Home / End to move,
 * Enter or Space to open/select, Escape to close.
 */
export default function Select({
  value,
  options,
  onChange,
  placeholder = "Select…",
  ariaLabel,
  className = "",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value) ?? null;
  const SelectedIcon = selected?.icon;

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

  // When opening, highlight the current selection and scroll it into view.
  useEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.value === value);
      setHighlight(idx >= 0 ? idx : 0);
    }
  }, [open, value, options]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[highlight] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [open, highlight]);

  function commit(idx: number) {
    const opt = options[idx];
    if (opt) onChange(opt.value);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        else setHighlight((h) => Math.min(h + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) setOpen(true);
        else setHighlight((h) => Math.max(h - 1, 0));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setHighlight(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setHighlight(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) commit(highlight);
        else setOpen(true);
        break;
      case "Escape":
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-dark--600
          bg-dark--700 px-3 py-2 text-left text-sm text-text-primary outline-none transition
          hover:border-dark--600/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
      >
        {SelectedIcon && (
          <SelectedIcon className="h-4 w-4 shrink-0 text-slate-300" />
        )}
        <span className={`flex-1 truncate ${selected ? "" : "text-text-subtle"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-text-secondary transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          className="absolute z-20 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border
            border-white/10 bg-dark--800 p-1 shadow-card"
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isActive = idx === highlight;
            const OptionIcon = opt.icon;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlight(idx)}
                onClick={() => commit(idx)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition
                  ${isActive ? "bg-dark--700 text-text-primary" : "text-slate-300"}`}
              >
                {OptionIcon && (
                  <OptionIcon className="h-4 w-4 shrink-0 text-slate-300" />
                )}
                <span className="flex-1 truncate">{opt.label}</span>
                {isSelected && (
                  <Check className="h-4 w-4 shrink-0 text-brand-400" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
