"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import Dashboard from "@/components/Dashboard";
import MovementsView from "@/components/MovementsView";
import InsightsPanel from "@/components/InsightsPanel";

type Tab = "dashboard" | "movements" | "ai";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "movements", label: "Transactions", icon: "💸" },
  { id: "ai", label: "AI", icon: "✨" },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const { resetToSeed, clearAll } = useStore();

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/[0.06] bg-ink-800 p-5 lg:flex">
        <div className="mb-8 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
            💰
          </span>
          <span className="text-lg font-bold tracking-tight">Fintrack</span>
        </div>
        <nav className="space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                tab === t.id
                  ? "bg-brand-500/10 text-brand-600"
                  : "text-slate-400 hover:bg-ink-700 hover:text-slate-200"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-2 pt-6">
          <button onClick={resetToSeed} className="btn-ghost w-full justify-start text-xs">
            ↺ Restore demo
          </button>
          <button
            onClick={() => {
              if (confirm("Delete all transactions?")) clearAll();
            }}
            className="btn-ghost w-full justify-start text-xs text-coral hover:bg-coral/5"
          >
            🗑 Clear all
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="sticky top-0 z-10 flex items-center gap-1 border-b border-white/[0.06] bg-ink-900/90 px-4 py-2 backdrop-blur lg:hidden">
        <span className="mr-auto flex items-center gap-2 font-bold">
          <span>💰</span> Fintrack
        </span>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === t.id ? "bg-brand-500/10 text-brand-600" : "text-slate-500"
            }`}
          >
            {t.icon}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          {tab === "dashboard" && <Dashboard />}
          {tab === "movements" && <MovementsView />}
          {tab === "ai" && <InsightsPanel />}
        </div>
      </main>
    </div>
  );
}
