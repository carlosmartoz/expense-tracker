export type TransactionType = "income" | "expense";

export const CATEGORIES = [
  "Food",
  "Transport",
  "Subscriptions",
  "Gaming",
  "Home",
  "Income",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Categories that apply to expenses (income uses the "Income" bucket). */
export const EXPENSE_CATEGORIES: Category[] = [
  "Food",
  "Transport",
  "Subscriptions",
  "Gaming",
  "Home",
  "Other",
];

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // always positive; sign is derived from `type`
  category: Category;
  description: string;
  date: string; // ISO date string (YYYY-MM-DD)
}

export interface Filters {
  category: Category | "all";
  type: TransactionType | "all";
  /** YYYY-MM (month key) or "all" */
  month: string;
  search: string;
}

export const CATEGORY_META: Record<Category, { color: string; icon: string }> = {
  Food: { color: "#fb7185", icon: "🍔" },
  Transport: { color: "#5b7cfa", icon: "🚗" },
  Subscriptions: { color: "#a78bfa", icon: "📺" },
  Gaming: { color: "#34d399", icon: "🎮" },
  Home: { color: "#fbbf24", icon: "🏠" },
  Income: { color: "#22d3ee", icon: "💰" },
  Other: { color: "#94a3b8", icon: "🧾" },
};
