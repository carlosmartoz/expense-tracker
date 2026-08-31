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
import { DEFAULT_CATEGORIES, isDefaultCategory } from "./types";
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
  clearAll: () => void;
  /** Swaps in an imported backup, replacing everything currently held. */
  replaceAll: (next: { transactions: Transaction[]; categories: Category[] }) => void;
  addCategory: (c: { name: string; color: string; type: TransactionType }) => void;
  updateCategory: (id: string, patch: { name?: string; color?: string }) => void;
  /** Adds any category from DEFAULT_CATEGORIES this ledger doesn't have yet. */
  addMissingDefaults: () => void;
  /**
   * Removes a category, moving every transaction that used it to `moveToId`.
   * Refuses on a default: those are the floor the ledger stands on.
   */
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
  // starts empty — with the default categories ready, but no transactions:
  // this is your ledger, not a demo.
  //
  // This is the one place setState in an effect is the right tool: localStorage
  // doesn't exist while the page is rendered on the server, so the first paint
  // has to be the empty state and the stored data can only arrive afterwards.
  useEffect(() => {
    const stored = load();
    /* eslint-disable react-hooks/set-state-in-effect */
    setTransactions(stored ? stored.transactions : []);
    setCategories(
      stored && stored.categories.length ? stored.categories : DEFAULT_CATEGORIES
    );
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
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
      clearAll: () => setTransactions([]),
      replaceAll: ({ transactions: nextTx, categories: nextCats }) => {
        setTransactions(
          [...nextTx].sort((a, b) => (a.date < b.date ? 1 : -1))
        );
        if (nextCats.length) setCategories(nextCats);
      },
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
      addMissingDefaults: () =>
        setCategories((prev) => {
          const missing = DEFAULT_CATEGORIES.filter(
            (d) => !prev.some((c) => c.id === d.id)
          );
          return missing.length ? [...prev, ...missing] : prev;
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
        if (isDefaultCategory(id)) return;
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
