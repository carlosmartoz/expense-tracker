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
  CircleEllipsis,
  Wallet,
  Briefcase,
  PiggyBank,
  Tag,
  Receipt,
  House,
  Tv,
  Landmark,
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
 * The ones below the line back categories that shipped with older versions;
 * they stay so data saved back then still draws its icon.
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
  CircleEllipsis,
  Wallet,
  Briefcase,
  PiggyBank,
  Tag,
  // Behind categories that shipped with older versions.
  Receipt,
  House,
  Tv,
  Landmark,
};

export function categoryIcon(icon: string | undefined): LucideIcon {
  return (icon && ICON_MAP[icon]) || Tag;
}

/**
 * The colours a category can take — the one place hue is allowed outside an
 * error message, and it reaches no further than the icon. Stored per category,
 * so these are literals rather than theme tokens: a token name could be
 * renamed out from under saved data.
 *
 * There are exactly as many as the defaults need: one per default, so no two
 * of them collide, plus white — which the two "Other" buckets share, because
 * they are the same idea on opposite sides of the book. A short list is the
 * point; picking from thirty near-identical hues is not a decision worth
 * offering. `defaultColoursAreUnique` in the tests holds the invariant.
 */
export const CATEGORY_COLORS = [
  "#ffffff", // white — the catch-all, on both sides
  "#f59e0b", // amber
  "#f97316", // orange
  "#ec4899", // pink
  "#d946ef", // fuchsia
  "#8b5cf6", // violet
  "#0ea5e9", // sky
  "#06b6d4", // cyan
  "#14b8a6", // teal
  "#22c55e", // green
  "#84cc16", // lime
] as const;

/**
 * The categories the app ships with. They can be renamed and recoloured like
 * any other, but never deleted — a ledger always has somewhere to put a
 * transaction, and the two "Other" buckets in particular are the floor the
 * delete dialog falls back to.
 *
 * Membership is decided by id against this list rather than a stored flag, so
 * there is no second copy of the truth to drift.
 */
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
  { id: "Other", name: "Other", color: "#ffffff", icon: "CircleEllipsis", type: "expense" },
  // Income
  { id: "Salary", name: "Salary", color: "#ec4899", icon: "Wallet", type: "income" },
  { id: "Freelance", name: "Freelance", color: "#22c55e", icon: "Briefcase", type: "income" },
  // Same colour and icon as its expense twin: it is the same idea, on the
  // other side of the book.
  { id: "OtherIncome", name: "Other", color: "#ffffff", icon: "CircleEllipsis", type: "income" },
];

const DEFAULT_IDS = new Set(DEFAULT_CATEGORIES.map((c) => c.id));

/** Defaults can be renamed and recoloured, but never removed. */
export function isDefaultCategory(id: string): boolean {
  return DEFAULT_IDS.has(id);
}

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
