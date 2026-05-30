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
import { formatAmount } from "@/lib/format";

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
      </PieChart>
    </ResponsiveContainer>
  );
}
