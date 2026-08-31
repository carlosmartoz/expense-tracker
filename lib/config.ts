/** Shown in the browser tab and the sidebar. */
export const APP_NAME = "Expense Tracker";

/** Governs UI copy and dates. Money has its own, below. */
export const LOCALE = "en-US";

/** English interface, Argentine money: `locale` groups amounts as $ 1.234,56. */
export const CURRENCY = {
  code: "ARS",
  symbol: "$",
  locale: "es-AR",
} as const;
