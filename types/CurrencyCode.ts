import type { CURRENCIES } from "@/lib/config";

// The currencies a transaction can be in, derived from the one place they
// are declared. Adding a currency to CURRENCIES widens this automatically.
export type CurrencyCode = keyof typeof CURRENCIES;
