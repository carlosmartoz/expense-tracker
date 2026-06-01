"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Transaction, CategoryDef } from "./types";
import { DEFAULT_CATEGORIES, FALLBACK_CATEGORY_ID } from "./types";
import { buildSeedData } from "./seed";

const STORAGE_KEY = "expense-tracker:transactions:v2";
const CATEGORIES_KEY = "expense-tracker:categories:v1";

interface StoreValue {
  transactions: Transaction[];
  categories: CategoryDef[];
  /** id -> category, for quick lookups in render. */
  categoryMap: Record<string, CategoryDef>;
  hydrated: boolean;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, patch: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  resetToSeed: () => void;
  clearAll: () => void;
  addCategory: (c: { name: string; color: string }) => void;
  updateCategory: (id: string, patch: { name?: string; color?: string }) => void;
  deleteCategory: (id: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Defaults are not user-editable, so they always come straight from code (this
 * keeps name/color/icon changes propagating to everyone). Only the user's custom
 * categories are read back from storage and appended.
 */
function mergeCategories(stored: CategoryDef[] | null): CategoryDef[] {
  if (!stored || !Array.isArray(stored)) return DEFAULT_CATEGORIES;
  const customs = stored
    .filter((s) => !DEFAULT_CATEGORIES.some((d) => d.id === s.id))
    .map((s) => ({ ...s, isDefault: false }));
  return [...DEFAULT_CATEGORIES, ...customs];
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryDef[]>(DEFAULT_CATEGORIES);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once on mount; seed transactions on first run.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setTransactions(JSON.parse(raw));
      } else {
        const seed = buildSeedData();
        setTransactions(seed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      }
    } catch {
      setTransactions(buildSeedData());
    }
    try {
      const rawCats = localStorage.getItem(CATEGORIES_KEY);
      setCategories(mergeCategories(rawCats ? JSON.parse(rawCats) : null));
    } catch {
      setCategories(DEFAULT_CATEGORIES);
    }
    setHydrated(true);
  }, []);

  // Persist on every change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      /* storage may be unavailable (private mode); ignore */
    }
  }, [transactions, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch {
      /* ignore */
    }
  }, [categories, hydrated]);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories]
  );

  const value = useMemo<StoreValue>(
    () => ({
      transactions,
      categories,
      categoryMap,
      hydrated,
      addTransaction: (t) =>
        setTransactions((prev) =>
          [...prev, { ...t, id: uid() }].sort((a, b) =>
            a.date < b.date ? 1 : -1
          )
        ),
      updateTransaction: (id, patch) =>
        setTransactions((prev) =>
          prev
            .map((t) => (t.id === id ? { ...patch, id } : t))
            .sort((a, b) => (a.date < b.date ? 1 : -1))
        ),
      deleteTransaction: (id) =>
        setTransactions((prev) => prev.filter((t) => t.id !== id)),
      resetToSeed: () => setTransactions(buildSeedData()),
      clearAll: () => setTransactions([]),
      addCategory: ({ name, color }) =>
        setCategories((prev) => {
          const trimmed = name.trim();
          if (!trimmed) return prev;
          if (prev.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
            return prev;
          }
          return [
            ...prev,
            { id: uid(), name: trimmed, color, icon: "Tag", isDefault: false },
          ];
        }),
      updateCategory: (id, patch) =>
        setCategories((prev) =>
          prev.map((c) => {
            if (c.id !== id) return c;
            const name = patch.name?.trim();
            return {
              ...c,
              ...(name ? { name } : {}),
              ...(patch.color ? { color: patch.color } : {}),
            };
          })
        ),
      deleteCategory: (id) => {
        const target = categories.find((c) => c.id === id);
        if (!target || target.isDefault) return;
        setCategories((prev) => prev.filter((c) => c.id !== id));
        // Reassign any transactions using the removed category to the fallback.
        setTransactions((prev) =>
          prev.map((t) =>
            t.category === id ? { ...t, category: FALLBACK_CATEGORY_ID } : t
          )
        );
      },
    }),
    [transactions, categories, categoryMap, hydrated]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
