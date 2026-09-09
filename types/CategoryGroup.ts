import type { Category } from "@/types/Category";
import type { TransactionType } from "@/types/TransactionType";

// One block of the categories screen: a type, its heading and its rows.
export interface CategoryGroup {
  type: TransactionType;
  label: string;
  items: Category[];
}
