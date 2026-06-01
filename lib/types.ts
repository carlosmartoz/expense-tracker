import type { LucideIcon } from "lucide-react";
import {
  UtensilsCrossed,
  Car,
  Tv,
  Gamepad2,
  House,
  Wallet,
  Receipt,
} from "lucide-react";

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

// Colors reference the CSS variables defined in app/globals.css (@theme), so the
// whole palette can be changed from one place.
export const CATEGORY_META: Record<Category, { color: string; icon: LucideIcon }> = {
  Food: { color: "var(--color-cat-food)", icon: UtensilsCrossed },
  Transport: { color: "var(--color-cat-transport)", icon: Car },
  Subscriptions: { color: "var(--color-cat-subscriptions)", icon: Tv },
  Gaming: { color: "var(--color-cat-gaming)", icon: Gamepad2 },
  Home: { color: "var(--color-cat-home)", icon: House },
  Income: { color: "var(--color-cat-income)", icon: Wallet },
  Other: { color: "var(--color-cat-other)", icon: Receipt },
};
