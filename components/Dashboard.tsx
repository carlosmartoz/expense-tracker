"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  summarizeAllMonths,
  expenseByCategory,
  pctChange,
} from "@/lib/analytics";
import { Gem, TrendingUp, CreditCard, PiggyBank } from "lucide-react";
import { motion } from "motion/react";
import { stagger, cardItem } from "@/lib/motion";
import { formatMoney, formatMonthKey, formatPercent, monthKeyOf } from "@/lib/format";
import Select, { type SelectOption } from "./Select";
import StatCard from "./StatCard";
import CountUp from "./CountUp";
import EmptyState from "./EmptyState";
import CategoryPie from "./charts/CategoryPie";
import MonthlyTrend from "./charts/MonthlyTrend";
import MonthComparison from "./charts/MonthComparison";
import SavingsGauge from "./charts/SavingsGauge";

/**
 * The dashboard intro (count-up + chart draw) should play only on the first
 * load of the page, not every time the user returns to the tab. This module-
 * level flag survives tab switches (the component unmounts) and React 18's
 * StrictMode double-mount, while resetting on a full page reload.
 */
let introState: "pending" | "done" = "pending";

function useDashboardIntro(): boolean {
  // Derived purely from the module flag so SSR and the client agree, and the
  // StrictMode remount can't reset it back to false.
  const [play] = useState(() => introState === "pending");
  useEffect(() => {
    if (introState !== "pending") return;
    // Settle to "done" after the intro has comfortably finished; later mounts
    // (returning to the tab) then render the final state instantly.
    const t = setTimeout(() => {
      introState = "done";
    }, 2500);
    return () => clearTimeout(t);
  }, []);
  return play;
}

export default function Dashboard({
  onAddFirst,
}: {
  /** Sends the reader to the Transactions tab from the empty state. */
  onAddFirst: () => void;
}) {
  const { transactions, hydrated } = useStore();
  const play = useDashboardIntro();
  const [picked, setPicked] = useState<string | null>(null);

  const months = useMemo(
    () => summarizeAllMonths(transactions),
    [transactions],
  );

  // Open on this month when there's something in it, otherwise on the most
  // recent month that has anything — an empty page helps nobody.
  const defaultMonthKey = useMemo(() => {
    if (months.length === 0) return null;
    const thisMonth = monthKeyOf(new Date().toISOString().slice(0, 10));
    return months.some((m) => m.monthKey === thisMonth)
      ? thisMonth
      : months[months.length - 1].monthKey;
  }, [months]);

  // A month picked by hand wins, until the data stops having it.
  const activeKey =
    picked && months.some((m) => m.monthKey === picked) ? picked : defaultMonthKey;
  const index = months.findIndex((m) => m.monthKey === activeKey);
  const current = index >= 0 ? months[index] : undefined;
  const previous = index > 0 ? months[index - 1] : null;

  const monthOptions: SelectOption[] = useMemo(
    () =>
      [...months]
        .reverse()
        .map((m) => ({ value: m.monthKey, label: formatMonthKey(m.monthKey) })),
    [months],
  );

  const pie = useMemo(
    () => (current ? expenseByCategory(transactions, current.monthKey) : []),
    [transactions, current],
  );

  if (!hydrated) {
    return <div className="py-20 text-center text-text-secondary">Loading…</div>;
  }

  if (!current) {
    return <EmptyState onAddFirst={onAddFirst} />;
  }

  const expenseChange = previous
    ? pctChange(current.expense, previous.expense)
    : null;
  const balanceChange = previous
    ? pctChange(current.balance, previous.balance)
    : null;

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div
        className="flex flex-wrap items-end justify-between gap-3"
        variants={cardItem}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Here&apos;s your overview
          </h1>
          <p className="text-sm text-text-subtle">
            {months.length === 1
              ? "Your only month so far"
              : `${months.length} months on record`}
          </p>
        </div>
        <Select
          className="w-[190px]"
          ariaLabel="Month shown"
          value={current.monthKey}
          options={monthOptions}
          onChange={setPicked}
        />
      </motion.div>

      {/* Top stat cards */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={stagger}
      >
        <StatCard
          label="Monthly balance"
          value={
            <CountUp value={current.balance} format={formatMoney} play={play} />
          }
          accent="brand"
          icon={Gem}
          hint={
            balanceChange !== null && (
              <span className={balanceChange >= 0 ? "text-mint" : "text-coral"}>
                {formatPercent(balanceChange)} vs previous month
              </span>
            )
          }
        />
        <StatCard
          label="Income"
          value={
            <CountUp value={current.income} format={formatMoney} play={play} />
          }
          accent="mint"
          icon={TrendingUp}
        />
        <StatCard
          label="Expenses"
          value={
            <CountUp value={current.expense} format={formatMoney} play={play} />
          }
          accent="coral"
          icon={CreditCard}
          hint={
            expenseChange !== null && (
              <span className={expenseChange <= 0 ? "text-mint" : "text-coral"}>
                {formatPercent(expenseChange)} vs previous month
              </span>
            )
          }
        />
        <StatCard
          label="Savings rate"
          value={
            <CountUp
              value={current.savingsRate}
              format={(n) => `${Math.round(n)}%`}
              play={play}
            />
          }
          accent="violet"
          icon={PiggyBank}
        />
      </motion.div>

      {/* Charts grid */}
      <motion.div className="grid gap-4 lg:grid-cols-3" variants={cardItem}>
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-1 text-sm font-bold text-text-primary">
            Income vs Expenses by month
          </h2>
          <p className="mb-3 text-xs text-text-secondary">Recent months</p>
          <MonthlyTrend data={months} animate={play} />
        </div>
        <div className="card p-5">
          <h2 className="mb-1 text-sm font-bold text-text-primary">
            Monthly savings
          </h2>
          <p className="mb-3 text-xs text-text-secondary">% of income set aside</p>
          <SavingsGauge rate={current.savingsRate} animate={play} />
        </div>
      </motion.div>

      <motion.div className="grid gap-4 lg:grid-cols-3" variants={cardItem}>
        <div className="card p-5">
          <h2 className="mb-1 text-sm font-bold text-text-primary">
            Expenses by category
          </h2>
          <p className="mb-3 text-xs text-text-secondary">
            {formatMonthKey(current.monthKey)}
          </p>
          <CategoryPie data={pie} animate={play} />
        </div>
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-1 text-sm font-bold text-text-primary">
            Month-over-month comparison
          </h2>
          <p className="mb-3 text-xs text-text-secondary">
            {previous
              ? `${formatMonthKey(previous.monthKey)} vs ${formatMonthKey(current.monthKey)}`
              : "Nothing recorded before this month"}
          </p>
          {previous ? (
            <MonthComparison
              current={current}
              previous={previous}
              animate={play}
            />
          ) : (
            <div className="grid h-[300px] place-items-center px-6 text-center text-sm text-text-secondary">
              This is your earliest month, so there is nothing to compare it
              against yet.
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
