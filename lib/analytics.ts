import type { Transaction, Category } from "./types";
import { monthKeyOf } from "./format";

export interface MonthSummary {
  monthKey: string; // YYYY-MM
  income: number;
  expense: number;
  balance: number;
  savingsRate: number; // 0-100
  byCategory: Record<string, number>; // expenses only
}

export function sortedMonthKeys(transactions: Transaction[]): string[] {
  const set = new Set(transactions.map((t) => monthKeyOf(t.date)));
  return Array.from(set).sort();
}

export function summarizeMonth(
  transactions: Transaction[],
  monthKey: string
): MonthSummary {
  const inMonth = transactions.filter((t) => monthKeyOf(t.date) === monthKey);
  let income = 0;
  let expense = 0;
  const byCategory: Record<string, number> = {};

  for (const t of inMonth) {
    if (t.type === "income") {
      income += t.amount;
    } else {
      expense += t.amount;
      byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
    }
  }

  const balance = income - expense;
  const savingsRate = income > 0 ? (balance / income) * 100 : 0;

  return { monthKey, income, expense, balance, savingsRate, byCategory };
}

export function summarizeAllMonths(transactions: Transaction[]): MonthSummary[] {
  return sortedMonthKeys(transactions).map((k) => summarizeMonth(transactions, k));
}

export interface CategorySlice {
  category: string;
  amount: number;
  percent: number;
}

export function expenseByCategory(
  transactions: Transaction[],
  monthKey?: string
): CategorySlice[] {
  const filtered = monthKey
    ? transactions.filter((t) => monthKeyOf(t.date) === monthKey)
    : transactions;
  const totals: Record<string, number> = {};
  let total = 0;
  for (const t of filtered) {
    if (t.type !== "expense") continue;
    totals[t.category] = (totals[t.category] ?? 0) + t.amount;
    total += t.amount;
  }
  return Object.entries(totals)
    .map(([category, amount]) => ({
      category,
      amount,
      percent: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/** Percentage change from `prev` to `curr`. Returns null when prev is 0. */
export function pctChange(curr: number, prev: number): number | null {
  if (prev === 0) return curr === 0 ? 0 : null;
  return ((curr - prev) / prev) * 100;
}

export function categoryTotal(
  transactions: Transaction[],
  category: Category,
  monthKey: string
): number {
  return transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.category === category &&
        monthKeyOf(t.date) === monthKey
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Sum of expenses matching a description substring (case-insensitive). */
export function descTotal(
  transactions: Transaction[],
  needle: string,
  monthKey: string
): number {
  const n = needle.toLowerCase();
  return transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        monthKeyOf(t.date) === monthKey &&
        t.description.toLowerCase().includes(n)
    )
    .reduce((sum, t) => sum + t.amount, 0);
}
