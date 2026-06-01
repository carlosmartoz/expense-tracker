/**
 * Resolve a CSS custom property reference (e.g. "var(--color-positive)") to its
 * computed value at runtime.
 *
 * Recharts sets colors as SVG *presentation attributes* (fill="…", stroke="…"),
 * and SVG presentation attributes do NOT support `var()` — only real CSS
 * properties do. So we read the value from :root and hand Recharts a concrete
 * color. This keeps app/globals.css (@theme) as the single source of truth.
 *
 * Returns the input untouched when it isn't a var() reference or when running on
 * the server (Recharts only draws on the client, after mount).
 */
export function resolveColor(value: string): string {
  if (typeof document === "undefined") return value;
  const match = /^var\((--[^),]+)\)$/.exec(value.trim());
  if (!match) return value;
  const resolved = getComputedStyle(document.documentElement)
    .getPropertyValue(match[1])
    .trim();
  return resolved || value;
}

/**
 * Shared dark-theme colors for Recharts chrome (tooltip, axes, grid). Pulls from
 * the same @theme tokens as the rest of the app so there are no hardcoded hexes.
 */
export function chartColors() {
  return {
    text: resolveColor("var(--color-text-primary)"),
    textMuted: resolveColor("var(--color-text-secondary)"),
    card: resolveColor("var(--color-dark--800)"),
    border: resolveColor("var(--color-dark--600)"),
    grid: resolveColor("var(--color-dark--700)"),
  };
}
