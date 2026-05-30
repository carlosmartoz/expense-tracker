"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { CategorySlice } from "@/lib/analytics";
import { CATEGORY_META } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export default function CategoryPie({ data }: { data: CategorySlice[] }) {
  if (data.length === 0) {
    return (
      <div className="grid h-[280px] place-items-center text-sm text-slate-400">
        Sin gastos en este período.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          innerRadius={62}
          outerRadius={96}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((slice) => (
            <Cell
              key={slice.category}
              fill={CATEGORY_META[slice.category as keyof typeof CATEGORY_META]?.color ?? "#94a3b8"}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [formatCurrency(value), name]}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            fontSize: 13,
          }}
        />
        <Legend
          iconType="circle"
          iconSize={9}
          formatter={(value: string) => (
            <span className="text-xs text-slate-600">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
