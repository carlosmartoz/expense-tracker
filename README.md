# Expense Tracker

A place to write down what you earn and what you spend, and see where the month
went. It runs entirely in your browser — there is no account, no server and
nothing leaves your machine.

**Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Recharts 3**

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and serve |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Re-run tests as you edit |
| `npm run lint` | ESLint |

The app starts empty. To see it with data in it, use **Import** in the sidebar
and pick [`sample-data.json`](sample-data.json) — five months of made-up
transactions.

## Your data lives in this browser only

Everything is kept in `localStorage`. That means it is private, it works
offline, and it is **gone if you clear your site data** — no copy exists
anywhere else.

So export a backup now and then. The sidebar has both:

- **Export backup** writes a JSON file that restores everything exactly,
  categories included. It is also the format to keep: a backup taken by an
  older version of the app still imports, because it goes through the same
  migration chain as stored data.
- **Export CSV** writes the transactions for a spreadsheet, with category names
  rather than internal ids.

**Import** accepts either. It replaces what is currently in the browser, so it
asks first and tells you what the file holds. A CSV that names a category you
don't have creates it.

## The three screens

- **Dashboard** — pick any month and see the balance, income, expenses and
  savings rate, the split by category, the trend across months, and how the
  month compares with the one before it.
- **Transactions** — add, edit and delete, with filters by month, category,
  type and free text.
- **Categories** — one list covering both sides. Rename, recolour or remove any
  of them.

## How it fits together

```
app/
  globals.css      Tailwind v4 and the dark theme (tokens in @theme)
  layout.tsx       Fonts and the global provider
  page.tsx         Shell and navigation
components/
  Dashboard, MovementsView, CategoriesView       the three screens
  TransactionForm, TransactionList, Filters      the ledger
  DataMenu, EmptyState                           import/export and first run
  Select, DatePicker, ConfirmDialog, CountUp     dark-theme building blocks
  charts/          CategoryPie, MonthlyTrend, MonthComparison, SavingsGauge
lib/
  config.ts        app name, locale, currency — start here to re-skin
  types.ts         the whole data model: Transaction and Category
  storage.ts       reading and writing localStorage, and the migration chain
  backup.ts        export and import, JSON and CSV
  store.tsx        state and the operations on it (Context)
  analytics.ts     monthly summaries and per-category totals
  format.ts        money, dates and percentages
  colors.ts        resolving theme tokens for Recharts
  motion.ts        shared animation variants
```

### Things worth knowing before you change anything

**Everything configurable is in `lib/config.ts`.** The interface reads in
English while amounts are grouped the Argentine way (`$ 1.234,56`). Those are
two separate settings on purpose: `LOCALE` governs text and dates,
`CURRENCY.locale` governs how numbers are grouped.

**Colours come from `@theme` tokens in `app/globals.css`**, never from hex
literals in components. Charts resolve them at runtime through `resolveColor()`
in `lib/colors.ts`, because SVG presentation attributes don't understand
`var()`. Some `--color-cat-*` tokens name categories the app no longer ships —
they stay because a browser somewhere still has data pointing at them.

**Stored data is versioned.** `lib/storage.ts` keeps one key with a version
stamp and a chain of migrations; each entry moves a snapshot forward one step.
When you change the shape of stored data, append a step rather than editing an
old one, and add a test — this is the only place a mistake destroys something
that can't be recovered.

**Categories belong to the user.** `DEFAULT_CATEGORIES` only seeds a browser
that has never held data. After that the list is theirs, and a migration should
type or clean it, never curate it.

**Native form controls are avoided** so the dark theme holds together: there is
a custom `Select` and a custom `DatePicker`, both keyboard accessible.

**Animation is subtle and lives in `lib/motion.ts`.** The whole app is wrapped
in `MotionConfig reducedMotion="user"`, so it respects
`prefers-reduced-motion`. The dashboard intro plays once per page load, not
every time you return to the tab.

**Dark theme only.** There is no light mode, by choice.

## Tests

```bash
npm test
```

86 tests over `lib/`, which is where a mistake is silent: the migration chain,
the backup round-trip in both formats, the monthly maths, and the money and
date formatting. The UI isn't covered — it's checked by using it.
