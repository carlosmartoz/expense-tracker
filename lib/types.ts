import type { LucideIcon } from "lucide-react";
import {
  UtensilsCrossed,
  Car,
  House,
  Wrench,
  HeartPulse,
  Clapperboard,
  ShoppingBag,
  Receipt,
  Wallet,
  Briefcase,
  PiggyBank,
  Tv,
  Gamepad2,
  Landmark,
  Tag,
} from "lucide-react";

export type TransactionType = "income" | "expense";

/* =========================================================================
   CATEGORIES

   A category is referenced by a stable `id` and lives on one side of the
   book: income or expense. The list below only seeds a browser that has
   never held any data — from then on the categories are the user's own, to
   rename, recolour or delete.
   ========================================================================= */

export interface Category {
  id: string;
  name: string;
  /** CSS color: a hex value or a var(--…) theme token. */
  color: string;
  /** Key into ICON_MAP. Categories created by hand fall back to "Tag". */
  icon: string;
  /** Which side of the book this category belongs to. Fixed once created. */
  type: TransactionType;
}

/**
 * Lucide icons referenced by name so a category can be serialized to storage.
 * The bottom three back categories that shipped with older versions; they stay
 * so data saved back then still draws its icon.
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Car,
  House,
  Wrench,
  HeartPulse,
  Clapperboard,
  ShoppingBag,
  Receipt,
  Wallet,
  Briefcase,
  PiggyBank,
  Tag,
  Tv,
  Gamepad2,
  Landmark,
};

export function categoryIcon(icon: string | undefined): LucideIcon {
  return (icon && ICON_MAP[icon]) || Tag;
}

export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses
  { id: "Food", name: "Food", color: "var(--color-cat-food)", icon: "UtensilsCrossed", type: "expense" },
  { id: "Transport", name: "Transport", color: "var(--color-cat-transport)", icon: "Car", type: "expense" },
  { id: "Home", name: "Home", color: "var(--color-cat-home)", icon: "House", type: "expense" },
  { id: "Services", name: "Services", color: "var(--color-cat-services)", icon: "Wrench", type: "expense" },
  { id: "Health", name: "Health", color: "var(--color-cat-health)", icon: "HeartPulse", type: "expense" },
  { id: "Entertainment", name: "Entertainment", color: "var(--color-cat-entertainment)", icon: "Clapperboard", type: "expense" },
  { id: "Shopping", name: "Shopping", color: "var(--color-cat-shopping)", icon: "ShoppingBag", type: "expense" },
  { id: "Other", name: "Other", color: "var(--color-cat-other)", icon: "Receipt", type: "expense" },
  // Income
  { id: "Salary", name: "Salary", color: "var(--color-cat-salary)", icon: "Wallet", type: "income" },
  { id: "Freelance", name: "Freelance", color: "var(--color-cat-freelance)", icon: "Briefcase", type: "income" },
  { id: "OtherIncome", name: "Other", color: "var(--color-cat-other-income)", icon: "PiggyBank", type: "income" },
];

/**
 * Palette offered when creating/editing a category: distinct hues, none
 * repeated, none equal to the brand color (#6b8aff).
 */
export const CATEGORY_COLORS = [
  "#f59e0b", // amber
  "#f97316", // orange
  "#ef4444", // red
  "#ec4899", // pink
  "#d946ef", // fuchsia
  "#a855f7", // purple
  "#8b5cf6", // violet
  "#0ea5e9", // sky
  "#06b6d4", // cyan
  "#14b8a6", // teal
  "#22c55e", // green
  "#84cc16", // lime
  "#eab308", // yellow
  "#94a3b8", // slate
];

/** Max characters for a category name. */
export const MAX_CATEGORY_NAME_LENGTH = 24;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // always positive; sign is derived from `type`
  categoryId: string;
  description: string;
  date: string; // ISO date string (YYYY-MM-DD)
}

export interface Filters {
  /** Category id or "all" */
  categoryId: string;
  type: TransactionType | "all";
  /** YYYY-MM (month key) or "all" */
  month: string;
  search: string;
}
