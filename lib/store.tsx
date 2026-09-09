"use client";

import {
  useMemo,
  useEffect,
  useContext,
  useReducer,
  createContext,
  type Context,
  type ReactNode,
} from "react";
import { uid } from "@/lib/uid";
import { load, save } from "@/lib/storage";
import { initialState, reducer } from "@/lib/storeReducer";
import type { StoreActions, StoreData } from "@/types";

// One context for the data, one for the actions: a component that only
// dispatches reads the actions without re-rendering on every change.
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

  const data = useMemo<StoreData>(
    () => ({
      transactions: state.transactions,
      categories: state.categories,
      categoryMap,
      hydrated: state.hydrated,
    }),
    [state.transactions, state.categories, state.hydrated, categoryMap],
  );

  // `dispatch` is stable, so these are built once and never change identity.
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

// Reading a store context outside the provider is a wiring mistake, not a
// state the UI should try to render around.
function useRequiredContext<T>(ctx: Context<T | null>, hook: string): T {
  const value = useContext(ctx);
  if (!value) throw new Error(`${hook} must be used within StoreProvider`);
  return value;
}

// The store's actions.
export function useStoreActions(): StoreActions {
  return useRequiredContext(ActionsContext, "useStoreActions");
}

// The store's data.
export function useStoreData(): StoreData {
  return useRequiredContext(DataContext, "useStoreData");
}

// The store's data and actions together.
export function useStore(): StoreData & StoreActions {
  const data = useStoreData();
  const actions = useStoreActions();

  return useMemo(() => ({ ...data, ...actions }), [data, actions]);
}
