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
  /** Optional short labels for extra context, e.g. "Credit card", "Work". */
  tags?: string[];
}

/** Max number of tags allowed per transaction (keeps the row UI from breaking). */
export const MAX_TAGS = 3;
/** Max characters per tag. */
export const MAX_TAG_LENGTH = 16;

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
