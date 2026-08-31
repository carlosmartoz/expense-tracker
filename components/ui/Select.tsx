"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Check, type LucideIcon } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  /** Optional leading icon shown in the trigger and list. */
  icon?: LucideIcon;
  /** Optional color for the leading icon (any CSS color, e.g. a var() token). */
  iconColor?: string;
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

/** Dropdown that matches the dark UI; a native <select> popup can't be styled. */
// Keyboard: arrows / Home / End to move, Enter or Space to pick, Escape to close.
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

  /** Highlights the current value. Here, not in an effect, so it lands in one render. */
  function openList() {
    const idx = options.findIndex((o) => o.value === value);
    setHighlight(idx >= 0 ? idx : 0);
    setOpen(true);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openList();
        else setHighlight((h) => Math.min(h + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openList();
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
        else openList();
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
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-border
          bg-surface-raised px-3 py-2 text-left text-sm text-text-primary outline-none transition
          hover:border-border/80 focus:border-border-strong focus:ring-2 focus:ring-text-subtle/40"
      >
        {SelectedIcon && (
          <SelectedIcon
            className="h-4 w-4 shrink-0 text-text-secondary"
            style={selected?.iconColor ? { color: selected.iconColor } : undefined}
          />
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
            border-white/10 bg-surface-panel p-1 shadow-card"
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
                  ${isActive ? "bg-surface-raised text-text-primary" : "text-text-secondary"}`}
              >
                {OptionIcon && (
                  <OptionIcon
                    className="h-4 w-4 shrink-0 text-text-secondary"
                    style={opt.iconColor ? { color: opt.iconColor } : undefined}
                  />
                )}
                <span className="flex-1 truncate">{opt.label}</span>
                {isSelected && (
                  <Check className="h-4 w-4 shrink-0 text-text-primary" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
