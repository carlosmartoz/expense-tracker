import type { TransactionType } from "@/types/TransactionType";

// A category has a stable id and belongs to one type.
export interface Category {
  id: string;
  name: string;
  // One of CATEGORY_COLORS. Applied to the category's icon.
  color: string;
  // Key into the icon map in lib/categories.ts. Hand-made ones fall back to "Tag".
  icon: string;
  // Which type this category belongs to. Fixed once created.
  type: TransactionType;
}
