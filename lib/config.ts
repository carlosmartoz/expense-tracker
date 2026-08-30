/**
 * Everything you'd want to change about *this* installation, in one place.
 * Nothing here depends on the rest of the app, so it's safe to import anywhere.
 */

/** Shown in the browser tab and the sidebar. */
export const APP_NAME = "Expense Tracker";

/**
 * The app speaks English: UI copy, month names and dates all come from here.
 */
export const LOCALE = "en-US";

/**
 * Money is Argentine. `locale` is deliberately *not* LOCALE: the interface is
 * in English but amounts are grouped the way they're written here — dot for
 * thousands, comma for the decimal ("$ 1.234,56"). Two separate settings
 * because they answer two different questions.
 */
export const CURRENCY = {
  code: "ARS",
  symbol: "$",
  locale: "es-AR",
} as const;
