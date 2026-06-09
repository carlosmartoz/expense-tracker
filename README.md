# Fintrack — Expense Tracker

A personal finance app with a modern-banking feel and an edge-to-edge **dark
theme**: log income and expenses and visualize your money with charts.

Stack: **Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Recharts 3**.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

For a production build:

```bash
npm run build && npm start
```

## Structure

```
app/
  globals.css           # Tailwind v4 + dark theme (tokens in @theme)
  layout.tsx            # Global provider + fonts
  page.tsx              # Shell with navigation (Dashboard / Transactions)
components/
  Dashboard.tsx, MovementsView.tsx
  TransactionForm.tsx, TransactionList.tsx, Filters.tsx, StatCard.tsx
  Select.tsx            # Custom dropdown (styled for the dark theme)
  charts/               # CategoryPie, MonthlyTrend, MonthComparison, SavingsGauge
lib/
  types.ts              # Models and categories
  store.tsx             # Global state (Context + localStorage)
  seed.ts               # Demo data (5 months, with spikes in categories)
  analytics.ts          # Monthly summary calculations
  format.ts             # Currency/date formatting (es-AR)
```

</content>
</invoke>
