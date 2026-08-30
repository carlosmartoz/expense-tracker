"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Tags,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { viewTransition } from "@/lib/motion";
import { APP_NAME } from "@/lib/config";
import Dashboard from "@/components/Dashboard";
import MovementsView from "@/components/MovementsView";
import CategoriesView from "@/components/CategoriesView";
import DataMenu from "@/components/DataMenu";

type Tab = "dashboard" | "movements" | "categories";

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "movements", label: "Transactions", icon: ArrowRightLeft },
  { id: "categories", label: "Categories", icon: Tags },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-dark--600 bg-dark--800 p-5 lg:flex lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="mb-8 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-text-primary">
            <Wallet className="h-5 w-5" />
          </span>

          <span className="text-lg font-bold tracking-tight text-text-primary">
            {APP_NAME}
          </span>
        </div>

        <nav className="space-y-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "text-brand-400"
                    : "text-text-secondary hover:bg-dark--700 hover:text-slate-200"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 -z-10 rounded-xl bg-brand-500/10"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon className="h-[18px] w-[18px]" />
                {t.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto pt-6">
          <p className="stat-label mb-2">Your data</p>
          <DataMenu />
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="sticky top-0 z-10 flex items-center gap-1 border-b border-dark--600 bg-dark--900/90 px-4 py-2 backdrop-blur lg:hidden">
        <span className="mr-auto flex min-w-0 items-center gap-2 font-bold">
          <Wallet className="h-5 w-5 shrink-0 text-brand-400" />
          <span className="truncate">{APP_NAME}</span>
        </span>
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-label={t.label}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium ${
                tab === t.id
                  ? "bg-brand-500/10 text-brand-400"
                  : "text-text-subtle"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
            </button>
          );
        })}

        {/* Always-reachable data actions */}
        <span className="mx-1 h-5 w-px bg-dark--600" />
        <DataMenu compact />
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              variants={viewTransition}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {tab === "dashboard" && (
                <Dashboard onAddFirst={() => setTab("movements")} />
              )}
              {tab === "movements" && <MovementsView />}
              {tab === "categories" && <CategoriesView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
