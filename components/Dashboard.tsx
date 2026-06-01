"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import {
  summarizeAllMonths,
  expenseByCategory,
  pctChange,
} from "@/lib/analytics";
import { Gem, TrendingUp, CreditCard, PiggyBank } from "lucide-react";
import { formatAmount, formatMonthKey, formatPercent } from "@/lib/format";
import StatCard from "./StatCard";
import CategoryPie from "./charts/CategoryPie";
import MonthlyTrend from "./charts/MonthlyTrend";
import MonthComparison from "./charts/MonthComparison";
import SavingsGauge from "./charts/SavingsGauge";

export default function Dashboard() {
  const { transactions, hydrated } = useStore();

  const months = useMemo(
    () => summarizeAllMonths(transactions),
    [transactions],
  );
  const current = months[months.length - 1];
  const previous = months.length > 1 ? months[months.length - 2] : null;

  const pie = useMemo(
    () => (current ? expenseByCategory(transactions, current.monthKey) : []),
    [transactions, current],
  );

  if (!hydrated) {
    return <div className="py-20 text-center text-text-secondary">Loading…</div>;
  }

  if (!current) {
    return (
      <div className="card grid place-items-center p-12 text-center text-text-secondary">
        No data yet. Add your first transaction.
      </div>
    );
  }

  const expenseChange = previous
    ? pctChange(current.expense, previous.expense)
    : null;
  const balanceChange = previous
    ? pctChange(current.balance, previous.balance)
    : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Here's your overview
        </h1>
        <p className="text-sm text-text-subtle">
          {formatMonthKey(current.monthKey)}
        </p>
      </div>

      {/* Top stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Monthly balance"
          value={formatAmount(current.balance)}
          accent={current.balance >= 0 ? "mint" : "coral"}
          icon={Gem}
          hint={
            balanceChange !== null && (
              <span className={balanceChange >= 0 ? "text-mint" : "text-coral"}>
                {formatPercent(balanceChange)} vs last month
              </span>
            )
          }
        />
        <StatCard
          label="Income"
          value={formatAmount(current.income)}
          accent="brand"
          icon={TrendingUp}
        />
        <StatCard
          label="Expenses"
          value={formatAmount(current.expense)}
          accent="coral"
          icon={CreditCard}
          hint={
            expenseChange !== null && (
              <span className={expenseChange <= 0 ? "text-mint" : "text-coral"}>
                {formatPercent(expenseChange)} vs last month
              </span>
            )
          }
        />
        <StatCard
          label="Savings rate"
          value={`${Math.round(current.savingsRate)}%`}
          accent="neutral"
          icon={PiggyBank}
        />
      </div>

      {/* Charts grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-1 text-sm font-bold text-text-primary">
            Income vs Expenses by month
          </h2>
          <p className="mb-3 text-xs text-text-secondary">Recent months</p>
          <MonthlyTrend data={months} />
        </div>
        <div className="card p-5">
          <h2 className="mb-1 text-sm font-bold text-text-primary">
            Monthly savings
          </h2>
          <p className="mb-3 text-xs text-text-secondary">% of income set aside</p>
          <SavingsGauge rate={current.savingsRate} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="mb-1 text-sm font-bold text-text-primary">
            Expenses by category
          </h2>
          <p className="mb-3 text-xs text-text-secondary">
            {formatMonthKey(current.monthKey)}
          </p>
          <CategoryPie data={pie} />
        </div>
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-1 text-sm font-bold text-text-primary">
            Month-over-month comparison
          </h2>
          <p className="mb-3 text-xs text-text-secondary">
            {previous
              ? `${formatMonthKey(previous.monthKey)} vs ${formatMonthKey(current.monthKey)}`
              : "Needs at least two months"}
          </p>
          {previous ? (
            <MonthComparison current={current} previous={previous} />
          ) : (
            <div className="grid h-[300px] place-items-center text-sm text-text-secondary">
              Add transactions from another month to compare.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
