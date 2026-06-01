import type { LucideIcon } from "lucide-react";
import {
  UtensilsCrossed,
  Car,
  Tv,
  Gamepad2,
  House,
  Wallet,
  Receipt,
  Wrench,
  Landmark,
  Tag,
} from "lucide-react";

export type TransactionType = "income" | "expense";

/* =========================================================================
   CURRENCIES
   ========================================================================= */

export const CURRENCIES = {
  ARS: { code: "ARS", symbol: "$", label: "Peso argentino" },
  USD: { code: "USD", symbol: "US$", label: "Dólar" },
  EUR: { code: "EUR", symbol: "€", label: "Euro" },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;
export const CURRENCY_LIST = Object.values(CURRENCIES);
export const DEFAULT_CURRENCY: CurrencyCode = "ARS";

/* =========================================================================
   CATEGORIES

   A category is referenced by a stable `id`. Default categories use their
   English name as id so existing/seed data keeps working; custom categories
   get a generated id, which means they can be renamed without orphaning the
   transactions that point at them.
   ========================================================================= */

/** A category id (string). Kept as a named alias for readability. */
export type Category = string;

export interface CategoryDef {
  id: string;
  name: string;
  /** CSS color: a hex value or a var(--…) theme token. */
  color: string;
  /** Key into ICON_MAP. Custom categories fall back to "Tag". */
  icon: string;
  /** Default categories ship with the app and can't be deleted. */
  isDefault: boolean;
}

/** Lucide icons referenced by name so a category can be serialized to storage. */
export const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Car,
  Tv,
  Gamepad2,
  House,
  Wallet,
  Receipt,
  Wrench,
  Landmark,
  Tag,
};

export function categoryIcon(icon: string | undefined): LucideIcon {
  return (icon && ICON_MAP[icon]) || Tag;
}

/** The income bucket has special handling and can't be removed. */
export const INCOME_CATEGORY_ID = "Income";
/** Fallback bucket transactions are reassigned to when a category is deleted. */
export const FALLBACK_CATEGORY_ID = "Other";

export const DEFAULT_CATEGORIES: CategoryDef[] = [
  { id: "Food", name: "Food", color: "var(--color-cat-food)", icon: "UtensilsCrossed", isDefault: true },
  { id: "Transport", name: "Transport", color: "var(--color-cat-transport)", icon: "Car", isDefault: true },
  { id: "Subscriptions", name: "Subscriptions", color: "var(--color-cat-subscriptions)", icon: "Tv", isDefault: true },
  { id: "Gaming", name: "Gaming", color: "var(--color-cat-gaming)", icon: "Gamepad2", isDefault: true },
  { id: "Home", name: "Home", color: "var(--color-cat-home)", icon: "House", isDefault: true },
  { id: "Servicios", name: "Services", color: "#14b8a6", icon: "Wrench", isDefault: true },
  { id: "Deudas", name: "Debts", color: "#ef4444", icon: "Landmark", isDefault: true },
  { id: INCOME_CATEGORY_ID, name: "Income", color: "var(--color-cat-income)", icon: "Wallet", isDefault: true },
  { id: FALLBACK_CATEGORY_ID, name: "Other", color: "var(--color-cat-other)", icon: "Receipt", isDefault: true },
];

/**
 * Palette offered when creating/editing a custom category: distinct hues, none
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

/** Max number of tags allowed per transaction (keeps the row UI from breaking). */
export const MAX_TAGS = 3;
/** Max characters per tag. */
export const MAX_TAG_LENGTH = 16;
/** Max characters for a category name. */
export const MAX_CATEGORY_NAME_LENGTH = 24;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // always positive; sign is derived from `type`
  category: Category; // category id
  /** Currency of this transaction. Missing ⇒ DEFAULT_CURRENCY (legacy data). */
  currency?: CurrencyCode;
  description: string;
  date: string; // ISO date string (YYYY-MM-DD)
  /** Optional short labels for extra context, e.g. "Credit card", "Work". */
  tags?: string[];
}

export interface Filters {
  /** Category id or "all" */
  category: string;
  type: TransactionType | "all";
  /** YYYY-MM (month key) or "all" */
  month: string;
  /** A specific tag name, or "all" */
  tag: string;
  search: string;
}
