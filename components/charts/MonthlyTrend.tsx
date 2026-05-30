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

export default function MonthlyTrend({ data }: { data: MonthSummary[] }) {
  const chartData = data.map((m) => ({
    month: formatMonthKey(m.monthKey).replace(/\s\d{4}$/, ""),
    Expenses: Math.round(m.expense),
    Income: Math.round(m.income),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#1c2336" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#94a3b8" }}
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
        <Bar dataKey="Expenses" fill="#fb7185" radius={[6, 6, 0, 0]} maxBarSize={38} />
        <Line
          dataKey="Income"
          stroke="#34d399"
          strokeWidth={3}
          dot={{ r: 4, fill: "#34d399" }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
