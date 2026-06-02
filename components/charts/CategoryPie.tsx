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
import { formatAmount } from "@/lib/format";
import { resolveColor, chartColors } from "@/lib/colors";
import { useStore } from "@/lib/store";

export default function CategoryPie({
  data,
  animate = false,
}: {
  data: CategorySlice[];
  animate?: boolean;
}) {
  const c = chartColors();
  const { categoryMap } = useStore();
  const nameOf = (id: string) => categoryMap[id]?.name ?? id;
  if (data.length === 0) {
    return (
      <div className="grid h-[280px] place-items-center text-sm text-text-secondary">
        No expenses in this period.
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
          isAnimationActive={animate}
          animationDuration={900}
        >
          {data.map((slice) => (
            <Cell
              key={slice.category}
              fill={resolveColor(
                categoryMap[slice.category]?.color ?? "var(--color-cat-other)"
              )}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [formatAmount(Number(value)), nameOf(String(name))]}
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
            <span className="text-xs text-text-secondary">{nameOf(value)}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
