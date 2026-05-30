import type { Transaction } from "./types";
import { EXPENSE_CATEGORIES } from "./types";
import { formatCurrency, formatMonthKey } from "./format";
import {
  sortedMonthKeys,
  summarizeMonth,
  categoryTotal,
  descTotal,
  pctChange,
} from "./analytics";

export type InsightTone = "alert" | "good" | "tip" | "info";

export interface Insight {
  id: string;
  tone: InsightTone;
  title: string;
  detail: string;
}

/**
 * Pure, deterministic pattern detection. Compares the most recent month with the
 * previous one and produces human-readable findings. This runs entirely locally
 * and is also the fallback when no OpenAI key is configured.
 */
export function detectInsights(transactions: Transaction[]): Insight[] {
  const months = sortedMonthKeys(transactions);
  if (months.length === 0) return [];

  const currKey = months[months.length - 1];
  const prevKey = months.length > 1 ? months[months.length - 2] : null;
  const insights: Insight[] = [];

  const curr = summarizeMonth(transactions, currKey);

  // Savings rate (always useful context)
  if (curr.income > 0) {
    const rate = curr.savingsRate;
    if (rate >= 20) {
      insights.push({
        id: "savings-good",
        tone: "good",
        title: `Ahorraste ${rate.toFixed(0)}% de tus ingresos`,
        detail: `Este mes guardaste ${formatCurrency(curr.balance)}. Vas por buen camino.`,
      });
    } else if (rate < 0) {
      insights.push({
        id: "savings-negative",
        tone: "alert",
        title: "Gastaste más de lo que ingresaste",
        detail: `Tu balance de ${formatMonthKey(currKey)} es ${formatCurrency(curr.balance)}.`,
      });
    } else {
      insights.push({
        id: "savings-low",
        tone: "tip",
        title: `Tu tasa de ahorro fue ${rate.toFixed(0)}%`,
        detail: `Apuntá a un 20% para construir un colchón. Te faltan ${formatCurrency(
          curr.income * 0.2 - curr.balance
        )}.`,
      });
    }
  }

  if (!prevKey) {
    insights.push({
      id: "need-history",
      tone: "info",
      title: "Cargá más meses para detectar tendencias",
      detail: "Con al menos dos meses de datos puedo comparar y encontrar patrones.",
    });
    return insights;
  }

  const prev = summarizeMonth(transactions, prevKey);

  // Per-category month-over-month changes
  const changes = EXPENSE_CATEGORIES.map((cat) => {
    const c = categoryTotal(transactions, cat, currKey);
    const p = categoryTotal(transactions, cat, prevKey);
    return { cat, c, p, pct: pctChange(c, p) };
  })
    .filter((x) => x.pct !== null && Math.abs(x.pct!) >= 15 && x.c >= 1000)
    .sort((a, b) => Math.abs(b.pct!) - Math.abs(a.pct!));

  for (const { cat, c, p, pct } of changes.slice(0, 3)) {
    const up = pct! > 0;
    insights.push({
      id: `cat-${cat}`,
      tone: up ? "alert" : "good",
      title: `Tus gastos en ${cat} ${up ? "subieron" : "bajaron"} ${Math.abs(
        pct!
      ).toFixed(0)}% este mes`,
      detail: `Pasaste de ${formatCurrency(p)} a ${formatCurrency(c)}.`,
    });
  }

  // Delivery-specific signal (the classic "gastaste 35% más en delivery")
  const deliveryCurr = descTotal(transactions, "delivery", currKey);
  const deliveryPrev = descTotal(transactions, "delivery", prevKey);
  const deliveryPct = pctChange(deliveryCurr, deliveryPrev);
  if (deliveryPct !== null && deliveryPct >= 20 && deliveryCurr >= 1000) {
    insights.push({
      id: "delivery-spike",
      tone: "alert",
      title: `Gastaste ${deliveryPct.toFixed(0)}% más en delivery este mes`,
      detail: `${formatCurrency(deliveryCurr)} en pedidos vs ${formatCurrency(
        deliveryPrev
      )} el mes pasado.`,
    });
  }

  // Actionable tip: reduce the biggest discretionary category by 20%
  const topCat = EXPENSE_CATEGORIES.map((cat) => ({
    cat,
    amount: categoryTotal(transactions, cat, currKey),
  }))
    .filter((x) => ["Transporte", "Comida", "Gaming", "Suscripciones"].includes(x.cat))
    .sort((a, b) => b.amount - a.amount)[0];

  if (topCat && topCat.amount >= 5000) {
    const saving = topCat.amount * 0.2;
    insights.push({
      id: "tip-reduce",
      tone: "tip",
      title: `Si reducís ${topCat.cat} un 20%, ahorrás ${formatCurrency(saving)}`,
      detail: `Equivale a ${formatCurrency(saving * 12)} al año si lo sostenés.`,
    });
  }

  return insights;
}

/** Compact numeric snapshot we hand to the LLM so it can reason with real data. */
export function buildInsightContext(transactions: Transaction[]) {
  const months = sortedMonthKeys(transactions);
  const recent = months.slice(-3);
  return recent.map((key) => {
    const s = summarizeMonth(transactions, key);
    return {
      month: key,
      income: Math.round(s.income),
      expense: Math.round(s.expense),
      balance: Math.round(s.balance),
      savingsRate: Math.round(s.savingsRate),
      byCategory: Object.fromEntries(
        Object.entries(s.byCategory).map(([k, v]) => [k, Math.round(v)])
      ),
    };
  });
}
