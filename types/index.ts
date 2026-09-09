// Every shared type in the app, re-exported so a consumer writes one import.
// Each type keeps its own file next to this one; nothing is declared here.

export type { Category } from "@/types/Category";
export type { CategoryDraft } from "@/types/CategoryDraft";
export type { CategoryGroup } from "@/types/CategoryGroup";
export type { CurrencyCode } from "@/types/CurrencyCode";
export type { Filters } from "@/types/Filters";
export type { Segment } from "@/types/Segment";
export type { SelectOption } from "@/types/SelectOption";
export type { Snapshot } from "@/types/Snapshot";
export type { SnapshotProblem } from "@/types/SnapshotProblem";
export type { StoreAction } from "@/types/StoreAction";
export type { StoreActions } from "@/types/StoreActions";
export type { StoreData } from "@/types/StoreData";
export type { StoreState } from "@/types/StoreState";
export type { Swatch } from "@/types/Swatch";
export type { Totals } from "@/types/Totals";
export type { Transaction } from "@/types/Transaction";
export type { TransactionDraft } from "@/types/TransactionDraft";
export type { TransactionType } from "@/types/TransactionType";
