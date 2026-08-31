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

**Start over** wipes everything — transactions and any category you added —
and leaves no key in `localStorage` at all. An untouched ledger stores nothing,
so a browser after a reset looks exactly like one that was never used.

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
- **Categories** — one list covering both sides of the book. Rename, recolour
  or remove any of them.

## How it fits together

```
app/
  globals.css      Tailwind v4 and the dark theme (tokens in @theme)
  layout.tsx       Fonts and the global provider
  page.tsx         Shell and navigation
components/
  transactions/  TransactionsView and the ledger: form, list, filters, empty state
  categories/    CategoriesView
  ui/            Select, DatePicker, ConfirmDialog, Portal — generic pieces
  DataMenu, MotionProvider                   app shell
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

**The interface is neutral on purpose.** Surfaces, text, buttons and states are
greyscale; meaning is carried by position, weight, an icon or a `+`/`−` sign.
Every value lives as an `@theme` token in `app/globals.css`, and components
reference tokens rather than hex literals.

Colour is rationed to two jobs, and both earn it:

- `--color-danger` is the only hue in the stylesheet, and it belongs to error
  messages — the one thing that has to interrupt. Spending it elsewhere is what
  would stop it working, so destructive buttons stay neutral; the confirm
  dialog is what guards those.
- **Category icons**, and nothing else about a category. `Category.color` holds
  one of `CATEGORY_COLORS` and is applied as an inline style on the icon, never
  to a row, a label or a background. It is stored per category, which is why
  the palette is hex literals rather than theme tokens: a token could be
  renamed out from under saved data.

  The palette is exactly as long as the defaults need — one colour each, so no
  two of them collide, plus white shared by the two "Other" buckets, which are
  the same idea on opposite sides of the book. A category you create has to
  reuse one of those eleven; that is the trade for a list short enough to pick
  from. `lib/types.test.ts` holds the invariant.

A useful check when changing any of this: build, then grep the compiled
stylesheet for hex values whose R, G and B are more than a few points apart.
`--color-danger` should be the only hit — category colours live in the data,
not the stylesheet.

**Stored data is versioned.** `lib/storage.ts` keeps one key with a version
stamp and a chain of migrations; each entry moves a snapshot forward one step.
When you change the shape of stored data, append a step rather than editing an
old one, and add a test — this is the only place a mistake destroys something
that can't be recovered.

**Defaults are fixed; everything else belongs to the user.** A category in
`DEFAULT_CATEGORIES` can't be renamed, recoloured or deleted — it is the app's
own vocabulary, and a ledger always needs somewhere to put a transaction, with
the "Other" buckets as the floor the delete dialog falls back to. A default
carries no edit or delete button at all rather than disabled ones. Everything
the reader creates stays fully theirs.

Membership is decided by id against that list rather than a stored flag, so
there's no second copy of the truth to drift — and a category retired from the
defaults stops being protected, which is correct.

Because a default can't be edited, code is the only source for its colour and
icon, and a stored copy that disagrees is stale. That is what `restoreDefaults`
in the migration chain is for: change a default in `lib/types.ts` and append a
step that calls it.

A migration should type or clean the list, never curate it — a category
someone deleted shouldn't reappear because the app shipped an update.

The cost of that rule is that a ledger started before a category existed never
sees it, so the Categories screen offers the gap explicitly: when the defaults
contain something the list doesn't, a button appears to add it. Adding a
default is then the reader's decision rather than something that happened to
them.

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

92 tests, mostly over `lib/`, which is where a mistake is silent: the
migration chain step by step, the backup round-trip, the ceiling on an amount,
and the money and date formatting. `components/Portal.test.tsx` is the
exception — it pins down that overlays render into `<body>`, which is
structural and can't be eyeballed. The rest of the UI isn't covered; it's
checked by using it.
