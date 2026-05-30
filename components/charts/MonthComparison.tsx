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
import { formatAmount, formatMonthKey } from "@/lib/format";

interface Props {
  current: MonthSummary;
  previous: MonthSummary;
}

export default function MonthComparison({ current, previous }: Props) {
  const prevLabel = formatMonthKey(previous.monthKey).replace(/\s\d{4}$/, "");
  const currLabel = formatMonthKey(current.monthKey).replace(/\s\d{4}$/, "");

  const data = EXPENSE_CATEGORIES.map((cat) => ({
    category: cat,
    [prevLabel]: Math.round(previous.byCategory[cat] ?? 0),
    [currLabel]: Math.round(current.byCategory[cat] ?? 0),
  })).filter((d) => (d[prevLabel] as number) > 0 || (d[currLabel] as number) > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#1c2336" />
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
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          formatter={(value, name) => [formatAmount(Number(value)), name]}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #28324d",
            background: "#0f1626",
            color: "#f1f5f9",
            fontSize: 13,
          }}
          itemStyle={{ color: "#f1f5f9" }}
          labelStyle={{ color: "#94a3b8" }}
        />
        <Legend
          iconType="circle"
          iconSize={9}
          formatter={(value: string) => (
            <span className="text-xs text-slate-400">{value}</span>
          )}
        />
        <Bar dataKey={prevLabel} fill="#3b475f" radius={[6, 6, 0, 0]} maxBarSize={26} />
        <Bar dataKey={currLabel} fill="#5b7cfa" radius={[6, 6, 0, 0]} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}
