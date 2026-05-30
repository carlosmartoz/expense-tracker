export type TransactionType = "income" | "expense";

export const CATEGORIES = [
  "Comida",
  "Transporte",
  "Suscripciones",
  "Gaming",
  "Hogar",
  "Ingreso",
  "Otros",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Categories that apply to expenses (income uses the "Ingreso" bucket). */
export const EXPENSE_CATEGORIES: Category[] = [
  "Comida",
  "Transporte",
  "Suscripciones",
  "Gaming",
  "Hogar",
  "Otros",
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
  Comida: { color: "#fb7185", icon: "🍔" },
  Transporte: { color: "#5b7cfa", icon: "🚗" },
  Suscripciones: { color: "#a78bfa", icon: "📺" },
  Gaming: { color: "#34d399", icon: "🎮" },
  Hogar: { color: "#fbbf24", icon: "🏠" },
  Ingreso: { color: "#22d3ee", icon: "💰" },
  Otros: { color: "#94a3b8", icon: "🧾" },
};
