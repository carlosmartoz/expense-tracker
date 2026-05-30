"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Transaction } from "./types";
import { buildSeedData } from "./seed";

const STORAGE_KEY = "expense-tracker:transactions:v1";

interface StoreValue {
  transactions: Transaction[];
  hydrated: boolean;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  resetToSeed: () => void;
  clearAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once on mount; seed on first run.
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
    } finally {
      setHydrated(true);
    }
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

  const value = useMemo<StoreValue>(
    () => ({
      transactions,
      hydrated,
      addTransaction: (t) =>
        setTransactions((prev) =>
          [...prev, { ...t, id: uid() }].sort((a, b) =>
            a.date < b.date ? 1 : -1
          )
        ),
      deleteTransaction: (id) =>
        setTransactions((prev) => prev.filter((t) => t.id !== id)),
      resetToSeed: () => setTransactions(buildSeedData()),
      clearAll: () => setTransactions([]),
    }),
    [transactions, hydrated]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
