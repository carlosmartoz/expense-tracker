# 💰 Fintrack — Gestión de gastos

App de finanzas personales estilo banco moderno, con **tema oscuro** de punta a
punta: cargá ingresos y gastos y visualizá tu dinero con gráficos.

Stack: **Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Recharts 3**.

## Funcionalidades

### 1. Gestión de gastos
- Agregar ingresos y gastos con categorías (Comida, Transporte, Suscripciones, Gaming, Hogar, Otros).
- Balance mensual (ingresos − gastos) y tasa de ahorro.
- Historial completo con filtros por **fecha (mes)**, **categoría**, **tipo** y búsqueda por texto.
- Persistencia local en el navegador (`localStorage`) — los datos quedan en tu equipo.

### 2. Dashboard visual
- **Gráfico de torta** de gastos por categoría.
- **Gastos por mes** (barras de gastos + línea de ingresos).
- **Comparativa entre meses** por categoría.
- **Porcentaje de ahorro** en un medidor radial.
- Tarjetas con variación porcentual mes contra mes.

## Cómo correrlo

```bash
npm install
npm run dev      # http://localhost:3000
```

Para build de producción:

```bash
npm run build && npm start
```

## Estructura

```
app/
  globals.css           # Tailwind v4 + tema oscuro (tokens en @theme)
  layout.tsx            # Provider global + fuentes
  page.tsx              # Shell con navegación (Dashboard / Movimientos)
components/
  Dashboard.tsx, MovementsView.tsx
  TransactionForm.tsx, TransactionList.tsx, Filters.tsx, StatCard.tsx
  Select.tsx            # Dropdown custom (estilado para el tema oscuro)
  charts/               # CategoryPie, MonthlyTrend, MonthComparison, SavingsGauge
lib/
  types.ts              # Modelos y categorías
  store.tsx             # Estado global (Context + localStorage)
  seed.ts               # Datos demo (5 meses, con picos en categorías)
  analytics.ts          # Cálculos de resúmenes mensuales
  format.ts             # Formato de moneda/fechas (es-AR)
```

## Notas
- **Tema oscuro único** (sin modo claro). La paleta se define como tokens CSS en
  el bloque `@theme` de `app/globals.css` — cambiá ahí los colores base.
- El tema usa Tailwind **v4** (sin `tailwind.config.js`): la configuración vive en
  el CSS. `next.config.mjs` fija `turbopack.root` para que el worker de PostCSS de
  dev resuelva el plugin correctamente.
- Los `<select>` usan un componente `Select` propio (`components/Select.tsx`) para
  que el desplegable matchee el resto de la UI (los popups nativos no se pueden
  estilar). Es accesible por teclado (flechas / Enter / Esc).
- La moneda está en ARS (`es-AR`); cambiala en `lib/format.ts`.
- Los datos demo se generan en `lib/seed.ts` con un pico intencional en delivery y
  suscripciones en el mes actual para que los gráficos tengan algo interesante que mostrar.
- Usé **Recharts** para todos los gráficos (es nativo de React). Si preferís Chart.js
  en algún gráfico puntual, se puede sumar sin tocar la lógica de datos.
