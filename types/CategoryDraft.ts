import type { TransactionType } from "@/types/TransactionType";

// A new category, before the store gives it an id. Its icon isn't chosen
// here: anything made by hand gets "Tag".
export interface CategoryDraft {
  name: string;
  color: string;
  type: TransactionType;
}
