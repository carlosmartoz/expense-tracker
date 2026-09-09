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

## Running it

```
npm install
npm run dev        # http://localhost:3000
npm run check      # lint, typecheck and tests — what CI would run
```

`npm run dev` binds every interface, so another device on the same Wi-Fi can
open it. Next only accepts a foreign origin it was told about: put yours in a
gitignored `.env.local` as `DEV_ORIGINS=192.168.0.124` (comma-separated for
more than one).

## How it fits together

```
app/
  layout.tsx        fonts, metadata and the store provider
  page.tsx          navigation between the two screens
components/         JSX only; the logic lives in hooks/
  shell/            DataMenu — export, import and start over
  transactions/     TransactionsView, and the ledger it is made of
  categories/       CategoriesView, and the pieces it is made of
  ui/               Select, DatePicker, Modal, ConfirmDialog, Portal,
                    SegmentedToggle, ColorPicker, Field, ErrorText,
                    IconButton, CategoryIcon — no app knowledge
hooks/              a screen's behaviour, testable without rendering it
  useTransactionForm, useTransactionFilters, useCategories, useBackup
  useFormError      one error per form, cleared by the next edit
  useDialog         Escape to close, and the page behind stops scrolling
lib/                behaviour and data; no type declarations live here
  config.ts         app name, locale, currencies — start here to re-skin
  categories.ts     the icons, the colour palette and the shipped defaults
  transactions.ts   the two sides of the book, and the amount cap
  validate.ts       the shape checks stored data and backups share
  storage.ts        localStorage, in and out
  backup.ts         the JSON backup, out and back in
  store.tsx         the Context: data in one half, actions in the other
  storeReducer.ts   every rule the data obeys, as a pure function
  format.ts         money, ISO dates and the months a ledger covers
  totals.ts         one balance per currency, never a single figure
  uid.ts            ids for new transactions and categories
types/              one file per type, named after the type it declares
  Transaction.ts    Category.ts, TransactionType.ts, CurrencyCode.ts,
                    Snapshot.ts, Filters.ts — the data model
  StoreData.ts      StoreActions.ts, StoreState.ts, StoreAction.ts,
                    TransactionDraft.ts, CategoryDraft.ts — the store
  Totals.ts         CategoryGroup.ts, SnapshotProblem.ts — derived shapes
  SelectOption.ts   Swatch.ts, Segment.ts — what the ui/ components take
  index.ts          re-exports all of them; import from "@/types"
public/
  icon.svg          the tab icon, declared in the layout's metadata
styles/
  globals.css       Tailwind v4 and the dark theme (tokens in @theme)
tests/              mirrors the tree above
  setup.ts          an in-memory localStorage the suite controls
  lib/              storage, backup, format, totals, categories, storeReducer
  components/ui/    Portal
```

Every shared type or interface gets its own file in `types/`, named after it,
and is imported through the barrel: `import type { Transaction } from "@/types"`.
Props an individual component never shares stay in that component.

Every colour is a token in `@theme`; nothing in a component hardcodes one.
Dates are handled in the browser's own timezone — never `toISOString()`, which
would read as tomorrow through the last hours of an evening west of Greenwich.
