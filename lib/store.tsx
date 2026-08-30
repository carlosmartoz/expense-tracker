"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Transaction, Category, TransactionType } from "./types";
import { DEFAULT_CATEGORIES } from "./types";
import { buildSeedData } from "./seed";
import { load, save } from "./storage";

interface StoreValue {
  transactions: Transaction[];
  categories: Category[];
  /** id -> category, for quick lookups in render. */
  categoryMap: Record<string, Category>;
  hydrated: boolean;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, patch: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  resetToSeed: () => void;
  clearAll: () => void;
  addCategory: (c: { name: string; color: string; type: TransactionType }) => void;
  updateCategory: (id: string, patch: { name?: string; color?: string }) => void;
  /** Removes a category, moving every transaction that used it to `moveToId`. */
  deleteCategory: (id: string, moveToId: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [hydrated, setHydrated] = useState(false);

  // Read the stored copy once on mount. A browser that has never held any data
  // is seeded — with the default categories, and for now with demo
  // transactions too (phase 5 replaces those with an empty start).
  useEffect(() => {
    const stored = load();
    setTransactions(stored ? stored.transactions : buildSeedData());
    setCategories(
      stored && stored.categories.length ? stored.categories : DEFAULT_CATEGORIES
    );
    setHydrated(true);
  }, []);

  // Persist on every change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    save({ transactions, categories });
  }, [transactions, categories, hydrated]);

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
      addCategory: ({ name, color, type }) =>
        setCategories((prev) => {
          const trimmed = name.trim();
          if (!trimmed) return prev;
          // Names only have to be unique within their own side of the book.
          const clash = prev.some(
            (c) =>
              c.type === type && c.name.toLowerCase() === trimmed.toLowerCase()
          );
          if (clash) return prev;
          return [
            ...prev,
            { id: uid(), name: trimmed, color, icon: "Tag", type },
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
      deleteCategory: (id, moveToId) => {
        const target = categories.find((c) => c.id === id);
        const destination = categories.find((c) => c.id === moveToId);
        if (!target || !destination || destination.id === target.id) return;
        // Never leave a side of the book without a category to pick.
        const remaining = categories.filter(
          (c) => c.type === target.type && c.id !== id
        );
        if (remaining.length === 0) return;
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setTransactions((prev) =>
          prev.map((t) => (t.categoryId === id ? { ...t, categoryId: moveToId } : t))
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
