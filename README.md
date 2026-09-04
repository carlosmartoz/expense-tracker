# Expense Tracker

A place to write down what you earn and what you spend, and see where the month
went. It runs entirely in your browser — there is no account, no server and
nothing leaves your machine. Everything lives in `localStorage`, and a backup
is a JSON file you export and import yourself.

Two screens:

- **Transactions** — the ledger. Add, edit and delete, with the running balance
  for whatever the filters are showing, and filters by month, category, type,
  currency and free text.
- **Categories** — one list covering both sides of the book. The ones the app
  ships with are fixed; anything you add is yours to rename, recolour and
  remove.

Amounts are in pesos or dollars. The two are counted apart and never converted
into one another — that would need an exchange rate, and a rate that moves
rewrites the value of every past transaction each time it is touched.

**Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4**

## How it fits together

```
app/
  layout.tsx        fonts, metadata and the global providers
  page.tsx          navigation between the two screens
components/         JSX only; the logic lives in hooks/
  shell/            DataMenu, MotionProvider — the app frame
  transactions/     TransactionsView, and the ledger it is made of
  categories/       CategoriesView, and the pieces it is made of
  ui/               Select, DatePicker, Modal, ConfirmDialog, Portal,
                    SegmentedToggle, ColorPicker, Field, ErrorText,
                    IconButton, CategoryIcon — no app knowledge
hooks/              a screen's behaviour, testable without rendering it
  useTransactionForm, useTransactionFilters, useCategories, useBackup
lib/
  config.ts         app name, locale, currencies — start here to re-skin
  types.ts          the data model: Transaction and Category
  storage.ts        localStorage and the migration chain
  backup.ts         the JSON backup, out and back in
  store.tsx         state and the operations on it (Context)
  format.ts         money, dates and the months a ledger covers
  totals.ts         one balance per currency, never a single figure
  motion.ts         shared animation variants
public/
  icon.svg          the tab icon, declared in the layout's metadata
styles/
  globals.css       Tailwind v4 and the dark theme (tokens in @theme)
tests/              mirrors the tree above
  setup.ts          an in-memory localStorage the suite controls
  lib/              storage, backup, format, totals, types
  components/ui/    Portal
```
