import type { LucideIcon } from "lucide-react";
import {
  UtensilsCrossed,
  ShoppingCart,
  Car,
  Wifi,
  HeartPulse,
  Clapperboard,
  ShoppingBag,
  Gamepad2,
  CircleEllipsis,
  Wallet,
  PiggyBank,
  Tag,
  Wrench,
  Briefcase,
  Receipt,
  House,
  Tv,
  Landmark,
} from "lucide-react";

export type TransactionType = "income" | "expense";

/* =========================================================================
   CATEGORIES

   A category is referenced by a stable `id` and lives on one side of the
   book: income or expense. The ones the app ships with are fixed; anything
   the reader adds is theirs to rename, recolour and delete.
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
  HeartPulse,
  Wifi,
  Clapperboard,
  Gamepad2,
  ShoppingBag,
  CircleEllipsis,
  Landmark,
  Wallet,
  PiggyBank,
  Tag,
  // Behind categories that shipped with older versions.
  Wrench,
  Briefcase,
  Receipt,
  House,
  Tv,
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
 * offering. lib/types.test.ts holds that invariant.
 */
export const CATEGORY_COLORS = [
  { value: "#ffffff", name: "White" },
  { value: "#ef4444", name: "Red" },
  { value: "#f97316", name: "Orange" },
  { value: "#eab308", name: "Yellow" },
  { value: "#84cc16", name: "Lime" },
  { value: "#22c55e", name: "Green" },
  { value: "#06b6d4", name: "Cyan" },
  { value: "#3b82f6", name: "Blue" },
  { value: "#8b5cf6", name: "Violet" },
  { value: "#d946ef", name: "Fuchsia" },
  { value: "#ec4899", name: "Pink" },
] as const;

/** The hex values on their own, for anything that only needs to check one. */
export const CATEGORY_COLOR_VALUES: readonly string[] = CATEGORY_COLORS.map(
  (c) => c.value
);

/**
 * The categories the app ships with. They are fixed — not renamed, not
 * recoloured, not deleted. A ledger always has somewhere to put a transaction,
 * and the two "Other" buckets in particular are the floor the delete dialog
 * falls back to.
 *
 * Membership is decided by id against this list rather than a stored flag, so
 * there is no second copy of the truth to drift. Because of that, this file is
 * the only source for a default's colour and icon: change one here and append
 * a `restoreDefaults` step to the migration chain so stored copies follow.
 */
export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses. Food and Supermarket are deliberately separate: eating out and
  // stocking the kitchen are different habits and worth watching apart.
  { id: "Food", name: "Food", color: "#ef4444", icon: "UtensilsCrossed", type: "expense" },
  { id: "Supermarket", name: "Supermarket", color: "#eab308", icon: "ShoppingCart", type: "expense" },
  { id: "Transport", name: "Transport", color: "#06b6d4", icon: "Car", type: "expense" },
  { id: "Services", name: "Services", color: "#ec4899", icon: "Wifi", type: "expense" },
  { id: "Health", name: "Health", color: "#22c55e", icon: "HeartPulse", type: "expense" },
  { id: "Entertainment", name: "Entertainment", color: "#d946ef", icon: "Clapperboard", type: "expense" },
  { id: "Gaming", name: "Gaming", color: "#8b5cf6", icon: "Gamepad2", type: "expense" },
  { id: "Shopping", name: "Shopping", color: "#3b82f6", icon: "ShoppingBag", type: "expense" },
  { id: "Debts", name: "Debts", color: "#84cc16", icon: "Landmark", type: "expense" },
  { id: "Other", name: "Other", color: "#ffffff", icon: "CircleEllipsis", type: "expense" },
  // Income
  { id: "Salary", name: "Salary", color: "#f97316", icon: "Wallet", type: "income" },
  // Same colour and icon as its expense twin: it is the same idea, on the
  // other side of the book.
  { id: "OtherIncome", name: "Other", color: "#ffffff", icon: "CircleEllipsis", type: "income" },
];

const DEFAULT_IDS = new Set(DEFAULT_CATEGORIES.map((c) => c.id));

/** Defaults are fixed: the app's own vocabulary, not a starting point. */
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
