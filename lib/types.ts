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
  /** One of CATEGORY_TONES, or a var(--…) theme token. */
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
const ICON_MAP: Record<string, LucideIcon> = {
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

/**
 * The tones a category can take. The palette is neutral, so a tone is a nudge
 * rather than an identity — what actually tells two categories apart is the
 * icon and the name. Six steps is as many as stay distinguishable.
 */
export const CATEGORY_TONES = [
  "#fafafa",
  "#dcdcdc",
  "#bdbdbd",
  "#9e9e9e",
  "#808080",
  "#666666",
] as const;

export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses
  { id: "Food", name: "Food", color: CATEGORY_TONES[0], icon: "UtensilsCrossed", type: "expense" },
  { id: "Transport", name: "Transport", color: CATEGORY_TONES[1], icon: "Car", type: "expense" },
  { id: "Home", name: "Home", color: CATEGORY_TONES[2], icon: "House", type: "expense" },
  { id: "Services", name: "Services", color: CATEGORY_TONES[3], icon: "Wrench", type: "expense" },
  { id: "Health", name: "Health", color: CATEGORY_TONES[4], icon: "HeartPulse", type: "expense" },
  { id: "Entertainment", name: "Entertainment", color: CATEGORY_TONES[1], icon: "Clapperboard", type: "expense" },
  { id: "Shopping", name: "Shopping", color: CATEGORY_TONES[2], icon: "ShoppingBag", type: "expense" },
  { id: "Other", name: "Other", color: CATEGORY_TONES[5], icon: "Receipt", type: "expense" },
  // Income
  { id: "Salary", name: "Salary", color: CATEGORY_TONES[0], icon: "Wallet", type: "income" },
  { id: "Freelance", name: "Freelance", color: CATEGORY_TONES[2], icon: "Briefcase", type: "income" },
  { id: "OtherIncome", name: "Other", color: CATEGORY_TONES[5], icon: "PiggyBank", type: "income" },
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
