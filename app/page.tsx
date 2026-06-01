"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Tags,
  Wallet,
  RotateCcw,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useStore } from "@/lib/store";
import Dashboard from "@/components/Dashboard";
import MovementsView from "@/components/MovementsView";
import CategoriesView from "@/components/CategoriesView";
import ConfirmDialog from "@/components/ConfirmDialog";

type Tab = "dashboard" | "movements" | "categories";

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "movements", label: "Transactions", icon: ArrowRightLeft },
  { id: "categories", label: "Categories", icon: Tags },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [confirmClear, setConfirmClear] = useState(false);
  const { resetToSeed, clearAll } = useStore();

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-dark--600 bg-dark--800 p-5 lg:flex lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="mb-8 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-text-primary">
            <Wallet className="h-5 w-5" />
          </span>

          <span className="text-lg font-bold tracking-tight text-text-primary">
            Expense Tracker
          </span>
        </div>

        <nav className="space-y-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  tab === t.id
                    ? "bg-brand-500/10 text-brand-400"
                    : "text-text-secondary hover:bg-dark--700 hover:text-slate-200"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {t.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto space-y-2 pt-6">
          <button
            onClick={resetToSeed}
            className="btn-ghost w-full justify-start text-xs"
          >
            <RotateCcw className="h-4 w-4" /> Restore demo
          </button>
          <button
            onClick={() => setConfirmClear(true)}
            className="btn-ghost w-full justify-start text-xs text-coral hover:bg-coral/5"
          >
            <Trash2 className="h-4 w-4" /> Clear all
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="sticky top-0 z-10 flex items-center gap-1 border-b border-dark--600 bg-dark--900/90 px-4 py-2 backdrop-blur lg:hidden">
        <span className="mr-auto flex min-w-0 items-center gap-2 font-bold">
          <Wallet className="h-5 w-5 shrink-0 text-brand-400" />
          <span className="truncate">Expense Tracker</span>
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
        <button
          onClick={resetToSeed}
          aria-label="Restore demo"
          title="Restore demo"
          className="cursor-pointer rounded-lg px-2.5 py-1.5 text-text-subtle transition hover:bg-dark--700 hover:text-text-primary"
        >
          <RotateCcw className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={() => setConfirmClear(true)}
          aria-label="Clear all"
          title="Clear all"
          className="cursor-pointer rounded-lg px-2.5 py-1.5 text-text-subtle transition hover:bg-coral/10 hover:text-coral"
        >
          <Trash2 className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          {tab === "dashboard" && <Dashboard />}
          {tab === "movements" && <MovementsView />}
          {tab === "categories" && <CategoriesView />}
        </div>
      </main>

      <ConfirmDialog
        open={confirmClear}
        title="Clear all transactions"
        message="This permanently removes every transaction. This can't be undone."
        confirmLabel="Clear all"
        onConfirm={() => {
          clearAll();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
