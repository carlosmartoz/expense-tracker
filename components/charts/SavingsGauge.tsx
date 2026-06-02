"use client";

import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { resolveColor } from "@/lib/colors";
import CountUp from "@/components/CountUp";

export default function SavingsGauge({
  rate,
  animate = false,
}: {
  rate: number;
  animate?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(rate)));
  // var() for the HTML label (same on server & client -> no hydration mismatch);
  // a resolved value for Recharts, which paints via SVG attributes.
  const colorVar =
    clamped >= 20
      ? "var(--color-positive)"
      : clamped >= 1
        ? "var(--color-neutral)"
        : "var(--color-negative)";
  const color = resolveColor(colorVar);
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
          <RadialBar
            background={{ fill: resolveColor("var(--color-dark--700)") }}
            dataKey="value"
            cornerRadius={20}
            isAnimationActive={animate}
            animationDuration={900}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold tracking-tight"
          style={{ color: colorVar }}
        >
          <CountUp
            value={clamped}
            format={(n) => `${Math.round(n)}%`}
            play={animate}
          />
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          Savings
        </span>
      </div>
    </div>
  );
}
