"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import {
  summarizeAllMonths,
  expenseByCategory,
  pctChange,
} from "@/lib/analytics";
import { formatCurrency, formatMonthKey, formatPercent } from "@/lib/format";
import StatCard from "./StatCard";
import CategoryPie from "./charts/CategoryPie";
import MonthlyTrend from "./charts/MonthlyTrend";
import MonthComparison from "./charts/MonthComparison";
import SavingsGauge from "./charts/SavingsGauge";

export default function Dashboard() {
  const { transactions, hydrated } = useStore();

  const months = useMemo(() => summarizeAllMonths(transactions), [transactions]);
  const current = months[months.length - 1];
  const previous = months.length > 1 ? months[months.length - 2] : null;

  const pie = useMemo(
    () => (current ? expenseByCategory(transactions, current.monthKey) : []),
    [transactions, current]
  );

  if (!hydrated) {
    return <div className="py-20 text-center text-slate-400">Cargando…</div>;
  }

  if (!current) {
    return (
      <div className="card grid place-items-center p-12 text-center text-slate-400">
        Todavía no hay datos. Agregá tu primer movimiento.
      </div>
    );
  }

  const expenseChange = previous ? pctChange(current.expense, previous.expense) : null;
  const balanceChange = previous ? pctChange(current.balance, previous.balance) : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Hola 👋 Este es tu resumen
        </h1>
        <p className="text-sm text-slate-500">{formatMonthKey(current.monthKey)}</p>
      </div>

      {/* Top stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Balance del mes"
          value={formatCurrency(current.balance)}
          accent={current.balance >= 0 ? "mint" : "coral"}
          icon="💎"
          hint={
            balanceChange !== null && (
              <span className={balanceChange >= 0 ? "text-mint" : "text-coral"}>
                {formatPercent(balanceChange)} vs mes anterior
              </span>
            )
          }
        />
        <StatCard
          label="Ingresos"
          value={formatCurrency(current.income)}
          accent="brand"
          icon="📈"
        />
        <StatCard
          label="Gastos"
          value={formatCurrency(current.expense)}
          accent="coral"
          icon="💳"
          hint={
            expenseChange !== null && (
              <span className={expenseChange <= 0 ? "text-mint" : "text-coral"}>
                {formatPercent(expenseChange)} vs mes anterior
              </span>
            )
          }
        />
        <StatCard
          label="Tasa de ahorro"
          value={`${Math.round(current.savingsRate)}%`}
          accent="amber"
          icon="🐷"
        />
      </div>

      {/* Charts grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-1 text-sm font-bold text-ink-900">
            Ingresos vs Gastos por mes
          </h2>
          <p className="mb-3 text-xs text-slate-400">Últimos meses</p>
          <MonthlyTrend data={months} />
        </div>
        <div className="card p-5">
          <h2 className="mb-1 text-sm font-bold text-ink-900">Ahorro del mes</h2>
          <p className="mb-3 text-xs text-slate-400">% de tus ingresos guardado</p>
          <SavingsGauge rate={current.savingsRate} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="mb-1 text-sm font-bold text-ink-900">Gastos por categoría</h2>
          <p className="mb-3 text-xs text-slate-400">{formatMonthKey(current.monthKey)}</p>
          <CategoryPie data={pie} />
        </div>
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-1 text-sm font-bold text-ink-900">
            Comparativa entre meses
          </h2>
          <p className="mb-3 text-xs text-slate-400">
            {previous
              ? `${formatMonthKey(previous.monthKey)} vs ${formatMonthKey(current.monthKey)}`
              : "Necesitás al menos dos meses"}
          </p>
          {previous ? (
            <MonthComparison current={current} previous={previous} />
          ) : (
            <div className="grid h-[300px] place-items-center text-sm text-slate-400">
              Cargá movimientos de otro mes para comparar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
