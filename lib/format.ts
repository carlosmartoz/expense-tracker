export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMonthKey(monthKey: string): string {
  // monthKey: "YYYY-MM"
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

export function monthKeyOf(isoDate: string): string {
  return isoDate.slice(0, 7); // YYYY-MM
}

export function formatDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatPercent(value: number, digits = 0): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}
