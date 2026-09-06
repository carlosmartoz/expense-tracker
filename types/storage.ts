import { Category, Transaction } from "@/lib/types";

export interface Snapshot {
  categories: Category[];
  transactions: Transaction[];
}
