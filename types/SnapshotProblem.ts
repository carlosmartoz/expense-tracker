// Why a value isn't a snapshot. Callers turn these into their own wording.
export type SnapshotProblem =
  | "not-an-object"
  | "missing-lists"
  | "bad-transaction"
  | "bad-category";
