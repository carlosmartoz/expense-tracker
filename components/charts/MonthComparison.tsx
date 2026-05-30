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
import { EXPENSE_CATEGORIES } from "@/lib/types";
import { formatCurrency, formatMonthKey } from "@/lib/format";

interface Props {
  current: MonthSummary;
  previous: MonthSummary;
}

export default function MonthComparison({ current, previous }: Props) {
  const prevLabel = formatMonthKey(previous.monthKey).replace(/ de \d+/, "");
  const currLabel = formatMonthKey(current.monthKey).replace(/ de \d+/, "");

  const data = EXPENSE_CATEGORIES.map((cat) => ({
    category: cat,
    [prevLabel]: Math.round(previous.byCategory[cat] ?? 0),
    [currLabel]: Math.round(current.byCategory[cat] ?? 0),
  })).filter((d) => (d[prevLabel] as number) > 0 || (d[currLabel] as number) > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#eef2f7" />
        <XAxis
          dataKey="category"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={70}
          tickFormatter={(v) => `${Math.round(v / 1000)}k`}
        />
        <Tooltip
          formatter={(value: number, name: string) => [formatCurrency(value), name]}
          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
        />
        <Legend
          iconType="circle"
          iconSize={9}
          formatter={(value: string) => (
            <span className="text-xs text-slate-600">{value}</span>
          )}
        />
        <Bar dataKey={prevLabel} fill="#cbd5e1" radius={[6, 6, 0, 0]} maxBarSize={26} />
        <Bar dataKey={currLabel} fill="#5b7cfa" radius={[6, 6, 0, 0]} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}
