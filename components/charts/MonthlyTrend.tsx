"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { MonthSummary } from "@/lib/analytics";
import { formatAmount, formatMonthKey } from "@/lib/format";
import { resolveColor, chartColors } from "@/lib/colors";

export default function MonthlyTrend({ data }: { data: MonthSummary[] }) {
  const c = chartColors();
  const chartData = data.map((m) => ({
    month: formatMonthKey(m.monthKey).replace(/\s\d{4}$/, ""),
    Expenses: Math.round(m.expense),
    Income: Math.round(m.income),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={c.grid} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: c.textMuted }}
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
          formatter={(value, name) => [formatAmount(Number(value)), name]}
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
          dataKey="Expenses"
          fill={resolveColor("var(--color-negative)")}
          radius={[6, 6, 0, 0]}
          maxBarSize={38}
          isAnimationActive={false}
        />
        <Line
          dataKey="Income"
          stroke={resolveColor("var(--color-positive)")}
          strokeWidth={3}
          dot={{ r: 4, fill: resolveColor("var(--color-positive)") }}
          activeDot={{ r: 6 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
