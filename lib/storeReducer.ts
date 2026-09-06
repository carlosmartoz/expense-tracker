import type { Transaction, Category, TransactionType } from "@/lib/types";
import { DEFAULT_CATEGORIES, isDefaultCategory } from "@/lib/types";

// Every rule the data obeys, as a pure function of state and action.

export interface StoreState {
  transactions: Transaction[];
  categories: Category[];
  // False until the stored data has been read.
  hydrated: boolean;
}

export const initialState: StoreState = {
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  hydrated: false,
};

// A new transaction, before it gets an id.
export type TransactionDraft = Omit<Transaction, "id">;

// A new category, before it gets an id.
export interface CategoryDraft {
  name: string;
  color: string;
  type: TransactionType;
}

// Every action that creates something carries the new id.
export type StoreAction =
  | {
      type: "hydrated";
      snapshot: { transactions: Transaction[]; categories: Category[] } | null;
    }
  | { type: "transaction/add"; id: string; draft: TransactionDraft }
  | { type: "transaction/update"; id: string; patch: TransactionDraft }
  | { type: "transaction/delete"; id: string }
  | { type: "clearAll" }
  | { type: "replaceAll"; transactions: Transaction[]; categories: Category[] }
  | { type: "category/add"; id: string; draft: CategoryDraft }
  | {
      type: "category/update";
      id: string;
      patch: { name?: string; color?: string };
    }
  | { type: "category/addMissingDefaults" }
  | { type: "category/delete"; id: string; moveToId: string };

// Sorts transactions newest first.
function sortByDate(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function reducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case "hydrated": {
      const stored = action.snapshot;
      return {
        transactions: stored ? stored.transactions : [],
        // An empty category list is treated as no list at all.
        categories:
          stored && stored.categories.length
            ? stored.categories
            : DEFAULT_CATEGORIES,
        hydrated: true,
      };
    }

    case "transaction/add":
      return {
        ...state,
        transactions: sortByDate([
          ...state.transactions,
          { ...action.draft, id: action.id },
        ]),
      };

    case "transaction/update":
      return {
        ...state,
        transactions: sortByDate(
          state.transactions.map((t) =>
            t.id === action.id ? { ...action.patch, id: action.id } : t
          )
        ),
      };

    case "transaction/delete":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.id),
      };

    case "clearAll":
      return {
        ...state,
        transactions: [],
        categories: DEFAULT_CATEGORIES,
      };

    case "replaceAll":
      return {
        ...state,
        transactions: sortByDate(action.transactions),
        // An empty import keeps the current categories.
        categories: action.categories.length
          ? action.categories
          : state.categories,
      };

    case "category/add": {
      const name = action.draft.name.trim();
      if (!name) return state;
      // Names only have to be unique within their own type.
      const clash = state.categories.some(
        (c) =>
          c.type === action.draft.type &&
          c.name.toLowerCase() === name.toLowerCase()
      );
      if (clash) return state;
      return {
        ...state,
        categories: [
          ...state.categories,
          {
            id: action.id,
            name,
            color: action.draft.color,
            icon: "Tag",
            type: action.draft.type,
          },
        ],
      };
    }

    case "category/update": {
      if (isDefaultCategory(action.id)) return state;
      return {
        ...state,
        categories: state.categories.map((c) => {
          if (c.id !== action.id) return c;
          const name = action.patch.name?.trim();
          return {
            ...c,
            ...(name ? { name } : {}),
            ...(action.patch.color ? { color: action.patch.color } : {}),
          };
        }),
      };
    }

    case "category/addMissingDefaults": {
      const missing = DEFAULT_CATEGORIES.filter(
        (d) => !state.categories.some((c) => c.id === d.id)
      );
      if (!missing.length) return state;
      return { ...state, categories: [...state.categories, ...missing] };
    }

    case "category/delete": {
      if (isDefaultCategory(action.id)) return state;
      const target = state.categories.find((c) => c.id === action.id);
      const destination = state.categories.find((c) => c.id === action.moveToId);
      if (!target || !destination || destination.id === target.id) return state;
      // Never leave income or expense without a category to pick.
      const remaining = state.categories.filter(
        (c) => c.type === target.type && c.id !== action.id
      );
      if (remaining.length === 0) return state;
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.id),
        transactions: state.transactions.map((t) =>
          t.categoryId === action.id ? { ...t, categoryId: action.moveToId } : t
        ),
      };
    }
  }
}
