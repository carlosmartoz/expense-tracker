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
  Landmark,
} from "lucide-react";
import type { Category } from "@/types";

// The category data: which icons and colours exist, and what the app ships with.

// Icons by name.
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
};

export function categoryIcon(icon: string | undefined): LucideIcon {
  return (icon && ICON_MAP[icon]) || Tag;
}

// One per default plus the white both "Other" categories share.
// Literal hex values, not theme tokens.
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

// The hex values on their own.
export const CATEGORY_COLOR_VALUES: readonly string[] = CATEGORY_COLORS.map(
  (c) => c.value
);

// The categories every user starts with. Never renamed or deleted.
// The only source for a default's colour and icon.
export const DEFAULT_CATEGORIES: Category[] = [
  // Food is eating out; Supermarket is stocking up.
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

// True when the id is one of the default categories.
export function isDefaultCategory(id: string): boolean {
  return DEFAULT_IDS.has(id);
}

// Max characters for a category name.
export const MAX_CATEGORY_NAME_LENGTH = 24;
