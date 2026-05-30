import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  hint?: ReactNode;
  accent?: "brand" | "mint" | "coral" | "amber";
  icon?: ReactNode;
}

const accentBg: Record<NonNullable<StatCardProps["accent"]>, string> = {
  brand: "bg-brand-500/10 text-brand-600",
  mint: "bg-mint/10 text-mint",
  coral: "bg-coral/10 text-coral",
  amber: "bg-amber/10 text-amber",
};

export default function StatCard({
  label,
  value,
  hint,
  accent = "brand",
  icon,
}: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <span className="stat-label">{label}</span>
        {icon && (
          <span
            className={`grid h-9 w-9 place-items-center rounded-xl text-lg ${accentBg[accent]}`}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
      {hint && <div className="mt-1 text-sm text-slate-500">{hint}</div>}
    </div>
  );
}
