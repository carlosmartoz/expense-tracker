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
import { formatCurrency, formatMonthKey } from "@/lib/format";

export default function MonthlyTrend({ data }: { data: MonthSummary[] }) {
  const chartData = data.map((m) => ({
    month: formatMonthKey(m.monthKey).replace(/ de \d+/, ""),
    Gastos: Math.round(m.expense),
    Ingresos: Math.round(m.income),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#eef2f7" />
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
        <Bar dataKey="Gastos" fill="#fb7185" radius={[6, 6, 0, 0]} maxBarSize={38} />
        <Line
          dataKey="Ingresos"
          stroke="#34d399"
          strokeWidth={3}
          dot={{ r: 4, fill: "#34d399" }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
