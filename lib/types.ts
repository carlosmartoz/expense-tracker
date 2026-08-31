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

// A category has a stable id and lives on one side of the book.

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

/** Referenced by name so a category can be serialized. */
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
  // Retired, kept so older data still draws its icon.
  Wrench,
  Briefcase,
  Receipt,
  House,
  Tv,
};

export function categoryIcon(icon: string | undefined): LucideIcon {
  return (icon && ICON_MAP[icon]) || Tag;
}

/** One per default plus the white both "Other" buckets share. */
// Literals, not theme tokens: a token could be renamed out from under saved data.
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

/** Fixed: never renamed, recoloured or deleted. The floor a ledger stands on. */
// The only source for a default's colour and icon; see the migration chain.
export const DEFAULT_CATEGORIES: Category[] = [
  // Food and Supermarket stay apart: eating out and stocking up differ.
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
  // Same colour and icon as its expense twin.
  { id: "OtherIncome", name: "Other", color: "#ffffff", icon: "CircleEllipsis", type: "income" },
];

const DEFAULT_IDS = new Set(DEFAULT_CATEGORIES.map((c) => c.id));

/** Defaults are fixed: the app's own vocabulary, not a starting point. */
export function isDefaultCategory(id: string): boolean {
  return DEFAULT_IDS.has(id);
}

/** Max characters for a category name. */
export const MAX_CATEGORY_NAME_LENGTH = 24;

/** Digits before the comma. Seven allows up to 9.999.999,99. */
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
