"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { MonthSummary } from "@/lib/analytics";
import { formatMoney, formatMonthKey } from "@/lib/format";
import { resolveColor, chartColors } from "@/lib/colors";
import { useStore } from "@/lib/store";

interface Props {
  current: MonthSummary;
  previous: MonthSummary;
  animate?: boolean;
}

export default function MonthComparison({
  current,
  previous,
  animate = false,
}: Props) {
  const c = chartColors();
  const { categoryMap } = useStore();
  const prevLabel = formatMonthKey(previous.monthKey).replace(/\s\d{4}$/, "");
  const currLabel = formatMonthKey(current.monthKey).replace(/\s\d{4}$/, "");

  // Every category that appears in either month (keeps custom categories too).
  const categoryIds = Array.from(
    new Set([
      ...Object.keys(previous.byCategory),
      ...Object.keys(current.byCategory),
    ])
  );

  const data = categoryIds
    .map((cat) => ({
      category: categoryMap[cat]?.name ?? cat,
      [prevLabel]: Math.round(previous.byCategory[cat] ?? 0),
      [currLabel]: Math.round(current.byCategory[cat] ?? 0),
    }))
    .filter((d) => (d[prevLabel] as number) > 0 || (d[currLabel] as number) > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={c.grid} />
        <XAxis
          dataKey="category"
          tick={{ fontSize: 11, fill: c.textMuted }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: c.textMuted }}
          axisLine={false}
          tickLine={false}
          width={70}
          tickFormatter={(v) => `${Math.round(v / 1000)}k`}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          formatter={(value, name) => [formatMoney(Number(value)), name]}
          contentStyle={{
            borderRadius: 12,
            border: `1px solid ${c.border}`,
            background: c.card,
            color: c.text,
            fontSize: 13,
          }}
          itemStyle={{ color: c.text }}
          labelStyle={{ color: c.textMuted }}
        />
        <Legend
          iconType="circle"
          iconSize={9}
          formatter={(value: string) => (
            <span className="text-xs text-text-secondary">{value}</span>
          )}
        />
        <Bar
          dataKey={prevLabel}
          fill={resolveColor("var(--color-dark--600)")}
          radius={[6, 6, 0, 0]}
          maxBarSize={26}
          isAnimationActive={animate}
          animationDuration={900}
        />
        <Bar
          dataKey={currLabel}
          fill={resolveColor("var(--color-brand-500)")}
          radius={[6, 6, 0, 0]}
          maxBarSize={26}
          isAnimationActive={animate}
          animationDuration={900}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
