# Expense Tracker

A place to write down what you earn and what you spend, and see where the month
went. It runs entirely in your browser — there is no account, no server and
nothing leaves your machine.

**Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4**

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

So export a backup now and then. **Export backup** writes a `.json` file that
restores everything exactly, categories included — and one taken by an older
version of the app still imports, because it goes through the same migration
chain as stored data.

**Import** reads that file back. It replaces what is currently in the browser,
so it asks first and tells you what the file holds.

There is deliberately one format. A backup is either complete or it isn't
worth having.

## The two screens

- **Transactions** — the ledger. Add, edit and delete, with the running balance
  for whatever the filters are showing, and filters by month, category, type
  and free text.
- **Categories** — one list covering both sides of the book. Rename, retone or
  remove any of them.

## How it fits together

```
app/
  globals.css      Tailwind v4 and the dark theme (tokens in @theme)
  layout.tsx       Fonts and the global provider
  page.tsx         Shell and navigation
components/
  MovementsView, CategoriesView              the two screens
  TransactionForm, TransactionList, Filters  the ledger
  DataMenu, EmptyState                       import/export and first run
  Select, DatePicker, ConfirmDialog, Portal  dark-theme building blocks
lib/
  config.ts        app name, locale, currency — start here to re-skin
  types.ts         the whole data model: Transaction and Category
  storage.ts       reading and writing localStorage, and the migration chain
  backup.ts        the JSON backup, out and back in
  store.tsx        state and the operations on it (Context)
  format.ts        money, dates and the months a ledger covers
  motion.ts        shared animation variants
```

### Things worth knowing before you change anything

**Everything configurable is in `lib/config.ts`.** The interface reads in
English while amounts are grouped the Argentine way (`$ 1.234,56`). Those are
two separate settings on purpose: `LOCALE` governs text and dates,
`CURRENCY.locale` governs how numbers are grouped.

**The palette is neutral on purpose.** Meaning is carried by position, weight,
an icon or a `+`/`−` sign, rather than by colour. Every value lives as an
`@theme` token in `app/globals.css`, and components reference tokens rather
than hex literals.

There is exactly one hue in the whole app, `--color-danger`, and it belongs to
error messages — the only thing that has to interrupt. Spending it anywhere
else is what would make it stop working, so destructive buttons stay neutral;
the confirm dialog is what guards those.

Category tones are the other thing to know: `Category.color` is stored per
category and holds one of the six steps in `CATEGORY_TONES`. A tone is a
nudge — the icon and the name are what tell two categories apart.

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

**Overlays go through `Portal`.** The sidebar and the new-transaction card are
both `position: sticky`, which makes each one a stacking context, so a `fixed`
dialog rendered inside either is trapped there and later siblings paint over
it. Rendering into `<body>` is the fix; raising the z-index is not.

**Animation is subtle and lives in `lib/motion.ts`.** Reach for a shared
variant rather than writing a one-off. The whole app is wrapped in
`MotionConfig reducedMotion="user"`, so it respects `prefers-reduced-motion`.

**Dark theme only.** There is no light mode, by choice.

## Tests

```bash
npm test
```

68 tests, mostly over `lib/`, which is where a mistake is silent: the
migration chain step by step, the backup round-trip, the ceiling on an amount,
and the money and date formatting. `components/Portal.test.tsx` is the
exception — it pins down that overlays render into `<body>`, which is
structural and can't be eyeballed. The rest of the UI isn't covered; it's
checked by using it.
