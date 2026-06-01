import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  hint?: ReactNode;
  accent?: "brand" | "mint" | "coral" | "neutral";
  icon?: LucideIcon;
}

const accentColor: Record<NonNullable<StatCardProps["accent"]>, string> = {
  brand: "text-brand-400",
  mint: "text-mint",
  coral: "text-coral",
  neutral: "text-neutral",
};

export default function StatCard({
  label,
  value,
  hint,
  accent = "brand",
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <span className="stat-label">{label}</span>
        {Icon && (
          <span className={accentColor[accent]}>
            <Icon className="h-6 w-6" />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
      {hint && <div className="mt-1 text-sm text-text-subtle">{hint}</div>}
    </div>
  );
}
