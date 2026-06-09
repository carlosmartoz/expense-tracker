# Fintrack — Expense Tracker

A personal finance app with a modern-banking feel and an edge-to-edge **dark
theme**: log income and expenses and visualize your money with charts.

Stack: **Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Recharts 3**.

## Features

### 1. Expense management
- Add income and expenses with categories (Food, Transport, Subscriptions, Gaming, Home, Other).
- Monthly balance (income − expenses) and savings rate.
- Full history with filters by **date (month)**, **category**, **type**, and text search.
- Local persistence in the browser (`localStorage`) — your data stays on your device.

### 2. Visual dashboard
- **Pie chart** of expenses by category.
- **Expenses by month** (expense bars + income line).
- **Month-over-month comparison** by category.
- **Savings rate** in a radial gauge.
- Cards with month-over-month percentage change.

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

## Notes
- **Dark theme only** (no light mode). The palette is defined as CSS tokens in
  the `@theme` block of `app/globals.css` — change the base colors there.
- The theme uses Tailwind **v4** (no `tailwind.config.js`): the configuration
  lives in CSS. `next.config.mjs` sets `turbopack.root` so the dev PostCSS worker
  resolves the plugin correctly.
- The `<select>` elements use a custom `Select` component (`components/Select.tsx`)
  so the dropdown matches the rest of the UI (native popups can't be styled). It's
  keyboard accessible (arrows / Enter / Esc).
- The currency is ARS (`es-AR`); change it in `lib/format.ts`.
- Demo data is generated in `lib/seed.ts` with an intentional spike in delivery and
  subscriptions in the current month so the charts have something interesting to show.
- I used **Recharts** for all charts (it's React-native). If you prefer Chart.js for
  a specific chart, it can be added without touching the data logic.
</content>
</invoke>
