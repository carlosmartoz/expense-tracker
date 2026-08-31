"use client";

import { useState } from "react";
import { ArrowRightLeft, Tags, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { viewTransition } from "@/lib/motion";
import { APP_NAME } from "@/lib/config";
import TransactionsView from "@/components/transactions/TransactionsView";
import CategoriesView from "@/components/categories/CategoriesView";
import DataMenu from "@/components/shell/DataMenu";

type Tab = "movements" | "categories";

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "movements", label: "Transactions", icon: ArrowRightLeft },
  { id: "categories", label: "Categories", icon: Tags },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("movements");

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface-panel p-5 xl:flex xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto">
        <div className="mb-8">
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
                    ? "text-text-primary"
                    : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 -z-10 rounded-xl bg-surface-raised"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon className="h-4.5 w-4.5" />
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

      {/* Header, below xl — where there is no room for the sidebar */}
      <div className="sticky top-0 z-10 flex items-center gap-1 border-b border-border bg-surface-base/90 px-4 py-2 backdrop-blur xl:hidden">
        <span className="mr-auto min-w-0 truncate font-bold">{APP_NAME}</span>
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-label={t.label}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                tab === t.id
                  ? "bg-surface-raised text-text-primary"
                  : "text-text-subtle hover:text-text-secondary"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {/* Room for the word on anything but a phone. */}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}

        {/* Always-reachable data actions */}
        <span className="mx-1 h-5 w-px bg-border" />
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
              {tab === "movements" && <TransactionsView />}
              {tab === "categories" && <CategoriesView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
