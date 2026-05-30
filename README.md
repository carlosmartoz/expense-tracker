# 💰 Fintrack — Gestión de gastos con IA

App de finanzas personales estilo banco moderno: cargá ingresos y gastos,
visualizá tu dinero con gráficos y descubrí patrones con IA.

Stack: **Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Recharts · OpenAI API**.

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

### 3. Sección IA
Detección de patrones del tipo:
- *"Gastaste 35% más en delivery este mes"*
- *"Tus suscripciones aumentaron un X%"*
- *"Si reducís Transporte un 20%, ahorrás $X"*

La detección base es **local y determinista** (no requiere clave). Si configurás
`OPENAI_API_KEY`, el endpoint `/api/insights` enriquece las observaciones con OpenAI,
usando los números reales como contexto. Si OpenAI falla, cae automáticamente al
análisis local.

## Cómo correrlo

```bash
npm install
npm run dev      # http://localhost:3000
```

Para build de producción:

```bash
npm run build && npm start
```

## IA con OpenAI (opcional)

Copiá `.env.example` a `.env.local` y completá tu clave:

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Sin la clave, la app funciona igual con la detección de patrones local.

## Estructura

```
app/
  layout.tsx            # Provider global + fuentes
  page.tsx              # Shell con navegación (Dashboard / Movimientos / IA)
  api/insights/route.ts # Endpoint IA (OpenAI + fallback local)
components/
  Dashboard.tsx, MovementsView.tsx, InsightsPanel.tsx
  TransactionForm.tsx, TransactionList.tsx, Filters.tsx, StatCard.tsx
  charts/               # CategoryPie, MonthlyTrend, MonthComparison, SavingsGauge
lib/
  types.ts              # Modelos y categorías
  store.tsx             # Estado global (Context + localStorage)
  seed.ts               # Datos demo (5 meses, con picos para la IA)
  analytics.ts          # Cálculos de resúmenes mensuales
  insights.ts           # Motor de detección de patrones
  format.ts             # Formato de moneda/fechas (es-AR)
```

## Notas
- La moneda está en ARS (`es-AR`); cambiala en `lib/format.ts`.
- Los datos demo se generan en `lib/seed.ts` con un pico intencional en delivery y
  suscripciones en el mes actual para que la IA tenga algo que detectar.
- Usé **Recharts** para todos los gráficos (es nativo de React). Si preferís Chart.js
  en algún gráfico puntual, se puede sumar sin tocar la lógica de datos.
