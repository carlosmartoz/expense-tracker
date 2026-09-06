"use client";

import {
  useMemo,
  useEffect,
  useContext,
  useReducer,
  createContext,
  type ReactNode,
} from "react";
import { uid } from "@/lib/uid";
import { load, save } from "@/lib/storage";
import { StoreActions, StoreData } from "@/types/store";
import { initialState, reducer, type StoreState } from "@/lib/storeReducer";

// One context for the data, one for the actions.
const DataContext = createContext<StoreData | null>(null);
const ActionsContext = createContext<StoreActions | null>(null);

// Holds the data and keeps it in sync with localStorage.
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Reads the stored data once, after mount.
  useEffect(() => {
    dispatch({ type: "hydrated", snapshot: load() });
  }, []);

  // Saves the data on every change, once it has been read.
  useEffect(() => {
    if (!state.hydrated) return;

    save({ transactions: state.transactions, categories: state.categories });
  }, [state.transactions, state.categories, state.hydrated]);

  const categoryMap = useMemo(
    () => Object.fromEntries(state.categories.map((c) => [c.id, c])),
    [state.categories],
  );

  // The data half of the store.
  const data = useMemo<StoreData>(
    () => ({
      transactions: state.transactions,
      categories: state.categories,
      categoryMap,
      hydrated: state.hydrated,
    }),

    [state.transactions, state.categories, state.hydrated, categoryMap],
  );

  // The actions half of the store.
  const actions = useMemo<StoreActions>(
    () => ({
      addTransaction: (draft) =>
        dispatch({ type: "transaction/add", id: uid(), draft }),
      updateTransaction: (id, patch) =>
        dispatch({ type: "transaction/update", id, patch }),
      deleteTransaction: (id) => dispatch({ type: "transaction/delete", id }),
      clearAll: () => dispatch({ type: "clearAll" }),
      replaceAll: ({ transactions, categories }) =>
        dispatch({ type: "replaceAll", transactions, categories }),
      addCategory: (draft) =>
        dispatch({ type: "category/add", id: uid(), draft }),
      updateCategory: (id, patch) =>
        dispatch({ type: "category/update", id, patch }),
      addMissingDefaults: () =>
        dispatch({ type: "category/addMissingDefaults" }),
      deleteCategory: (id, moveToId) =>
        dispatch({ type: "category/delete", id, moveToId }),
    }),
    [],
  );

  return (
    <ActionsContext.Provider value={actions}>
      <DataContext.Provider value={data}>{children}</DataContext.Provider>
    </ActionsContext.Provider>
  );
}

// The store's actions.
export function useStoreActions(): StoreActions {
  const ctx = useContext(ActionsContext);

  if (!ctx)
    throw new Error("useStoreActions must be used within StoreProvider");

  return ctx;
}

// The store's data.
export function useStoreData(): StoreData {
  const ctx = useContext(DataContext);

  if (!ctx) throw new Error("useStoreData must be used within StoreProvider");

  return ctx;
}

// The store's data and actions together.
export function useStore(): StoreData & StoreActions {
  const data = useStoreData();

  const actions = useStoreActions();

  return useMemo(() => ({ ...data, ...actions }), [data, actions]);
}

export type { StoreState, StoreActions, StoreData };
