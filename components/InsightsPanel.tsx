"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { detectInsights, type Insight, type InsightTone } from "@/lib/insights";

const toneStyles: Record<InsightTone, { wrap: string; badge: string; label: string }> = {
  alert: { wrap: "border-coral/30 bg-coral/5", badge: "bg-coral/15 text-coral", label: "Heads up" },
  good: { wrap: "border-mint/30 bg-mint/5", badge: "bg-mint/15 text-mint", label: "Good" },
  tip: { wrap: "border-brand-500/30 bg-brand-500/5", badge: "bg-brand-500/15 text-brand-400", label: "Tip" },
  info: { wrap: "border-white/10 bg-white/[0.03]", badge: "bg-white/10 text-slate-300", label: "Info" },
};

export default function InsightsPanel() {
  const { transactions, hydrated } = useStore();
  // Start with the deterministic local insights so there's instant content.
  const [insights, setInsights] = useState<Insight[]>([]);
  const [source, setSource] = useState<"local" | "openai">("local");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated) setInsights(detectInsights(transactions));
  }, [hydrated, transactions]);

  const analyze = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions }),
      });
      const data = await res.json();
      if (Array.isArray(data.insights)) {
        setInsights(data.insights);
        setSource(data.source === "openai" ? "openai" : "local");
      }
    } catch {
      setInsights(detectInsights(transactions));
      setSource("local");
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <span className="text-xl">✨</span> AI-detected patterns
          </h2>
          <p className="text-sm text-slate-500">
            {source === "openai"
              ? "Analysis enriched with OpenAI."
              : "Local pattern detection. Set OPENAI_API_KEY for a richer analysis."}
          </p>
        </div>
        <button onClick={analyze} disabled={loading} className="btn-primary">
          {loading ? "Analyzing…" : "Analyze with AI"}
        </button>
      </div>

      {insights.length === 0 ? (
        <div className="card grid place-items-center p-10 text-sm text-slate-400">
          Add transactions to discover patterns.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {insights.map((i) => {
            const s = toneStyles[i.tone];
            return (
              <div key={i.id} className={`rounded-2xl border p-4 ${s.wrap}`}>
                <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.badge}`}>
                  {s.label}
                </span>
                <h3 className="mt-2 text-sm font-bold text-slate-100">{i.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{i.detail}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
