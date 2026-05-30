"use client";

import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

export default function SavingsGauge({ rate }: { rate: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(rate)));
  const color = clamped >= 20 ? "#34d399" : clamped >= 1 ? "#fbbf24" : "#fb7185";
  const data = [{ name: "savings", value: clamped, fill: color }];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <RadialBarChart
          innerRadius="72%"
          outerRadius="100%"
          data={data}
          startAngle={220}
          endAngle={-40}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background={{ fill: "#19223a" }} dataKey="value" cornerRadius={20} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight" style={{ color }}>
          {clamped}%
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Ahorro
        </span>
      </div>
    </div>
  );
}
