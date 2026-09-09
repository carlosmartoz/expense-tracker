import type { CurrencyCode } from "@/types/CurrencyCode";

// Shown in the browser tab and the sidebar.
export const APP_NAME = "Expense Tracker";

// Locale for UI text and dates.
export const LOCALE = "en-US";

// The currencies a transaction can be in.
export const CURRENCIES = {
  ARS: { code: "ARS", symbol: "$", locale: "es-AR" },
  USD: { code: "USD", symbol: "US$", locale: "es-AR" },
} as const;

// The currency codes, in declaration order.
export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

// The currency a new transaction starts in.
export const DEFAULT_CURRENCY: CurrencyCode = "ARS";
