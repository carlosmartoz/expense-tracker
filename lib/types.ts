import type { LucideIcon } from "lucide-react";
import {
  UtensilsCrossed,
  ShoppingCart,
  Car,
  Wrench,
  HeartPulse,
  Clapperboard,
  ShoppingBag,
  Gamepad2,
  Receipt,
  Wallet,
  Briefcase,
  PiggyBank,
  House,
  Tv,
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
  /** One of CATEGORY_COLORS. Applied to the category's icon and nothing else. */
  color: string;
  /** Key into ICON_MAP. Categories created by hand fall back to "Tag". */
  icon: string;
  /** Which side of the book this category belongs to. Fixed once created. */
  type: TransactionType;
}

/**
 * Lucide icons referenced by name so a category can be serialized to storage.
 * The last three back categories that shipped with older versions; they stay
 * so data saved back then still draws its icon.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  ShoppingCart,
  Car,
  Wrench,
  HeartPulse,
  Clapperboard,
  Gamepad2,
  ShoppingBag,
  Receipt,
  Wallet,
  Briefcase,
  PiggyBank,
  Tag,
  House,
  Tv,
  Landmark,
};

export function categoryIcon(icon: string | undefined): LucideIcon {
  return (icon && ICON_MAP[icon]) || Tag;
}

/**
 * The colours a category can take — the one place hue is allowed outside an
 * error message, and it reaches no further than the icon. Distinct enough to
 * pick a category out of a list at a glance, and each one legible against the
 * dark surfaces. Stored per category, so these are literals rather than theme
 * tokens: a token name could be renamed out from under saved data.
 */
export const CATEGORY_COLORS = [
  "#f59e0b", // amber
  "#f97316", // orange
  "#ef4444", // red
  "#ec4899", // pink
  "#d946ef", // fuchsia
  "#a855f7", // purple
  "#8b5cf6", // violet
  "#6366f1", // indigo
  "#0ea5e9", // sky
  "#06b6d4", // cyan
  "#14b8a6", // teal
  "#22c55e", // green
  "#84cc16", // lime
  "#eab308", // yellow
  "#94a3b8", // slate
] as const;

export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses. Food and Supermarket are deliberately separate: eating out and
  // stocking the kitchen are different habits and worth watching apart.
  { id: "Food", name: "Food", color: "#f59e0b", icon: "UtensilsCrossed", type: "expense" },
  { id: "Supermarket", name: "Supermarket", color: "#84cc16", icon: "ShoppingCart", type: "expense" },
  { id: "Transport", name: "Transport", color: "#8b5cf6", icon: "Car", type: "expense" },
  { id: "Services", name: "Services", color: "#14b8a6", icon: "Wrench", type: "expense" },
  { id: "Health", name: "Health", color: "#0ea5e9", icon: "HeartPulse", type: "expense" },
  { id: "Entertainment", name: "Entertainment", color: "#d946ef", icon: "Clapperboard", type: "expense" },
  { id: "Gaming", name: "Gaming", color: "#06b6d4", icon: "Gamepad2", type: "expense" },
  { id: "Shopping", name: "Shopping", color: "#f97316", icon: "ShoppingBag", type: "expense" },
  { id: "Other", name: "Other", color: "#94a3b8", icon: "Receipt", type: "expense" },
  // Income
  { id: "Salary", name: "Salary", color: "#ec4899", icon: "Wallet", type: "income" },
  { id: "Freelance", name: "Freelance", color: "#22c55e", icon: "Briefcase", type: "income" },
  { id: "OtherIncome", name: "Other", color: "#a855f7", icon: "PiggyBank", type: "income" },
];

/** Max characters for a category name. */
export const MAX_CATEGORY_NAME_LENGTH = 24;

/**
 * How many digits an amount may have before the decimal comma. Seven covers
 * anything up to 9.999.999,99, which is roomy for a personal ledger and short
 * enough that a slipped keypress can't turn 30.000 into 30.000.000. Decimals
 * are always the two after the comma. Raise it here and nowhere else.
 */
export const MAX_AMOUNT_INTEGER_DIGITS = 7;

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
