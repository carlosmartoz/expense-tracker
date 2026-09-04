/** Shown in the browser tab and the sidebar. */
export const APP_NAME = "Expense Tracker";

/** Governs UI copy and dates. Money has its own, below. */
export const LOCALE = "en-US";

/** The currencies a transaction can be in. Grouping is shared; the symbol
    is what tells them apart, the Argentine way: `$ 1.234,56` vs `US$ 150,00`. */
export const CURRENCIES = {
  ARS: { code: "ARS", symbol: "$", locale: "es-AR" },
  USD: { code: "USD", symbol: "US$", locale: "es-AR" },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

/** Declaration order, for anything that lists them. */
export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

/** What a new transaction starts in, and what older data is read as. */
export const DEFAULT_CURRENCY: CurrencyCode = "ARS";
