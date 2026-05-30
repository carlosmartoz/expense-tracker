import { NextResponse } from "next/server";
import type { Transaction } from "@/lib/types";
import { detectInsights, buildInsightContext, type Insight } from "@/lib/insights";

export const runtime = "nodejs";

interface Body {
  transactions: Transaction[];
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const transactions = Array.isArray(body.transactions) ? body.transactions : [];
  // Local detection is always computed: it's the fallback and grounds the LLM.
  const local = detectInsights(transactions);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ source: "local", insights: local });
  }

  try {
    const enriched = await callOpenAI(apiKey, transactions, local);
    return NextResponse.json({ source: "openai", insights: enriched });
  } catch (err) {
    console.error("OpenAI insights failed, falling back to local:", err);
    return NextResponse.json({ source: "local", insights: local });
  }
}

async function callOpenAI(
  apiKey: string,
  transactions: Transaction[],
  local: Insight[]
): Promise<Insight[]> {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const context = buildInsightContext(transactions);

  const system =
    "Sos un asistente financiero personal. Analizás un resumen mensual de gastos " +
    "e ingresos (en pesos argentinos) y devolvés observaciones accionables, " +
    "concretas y motivadoras en español rioplatense. Cada observación debe citar " +
    "números reales del contexto. No inventes datos.";

  const user = `Datos de los últimos meses (montos en ARS):
${JSON.stringify(context, null, 2)}

Patrones que detectó el sistema local (usalos como referencia, podés reformular o ampliar):
${local.map((i) => `- ${i.title}: ${i.detail}`).join("\n")}

Devolvé entre 3 y 5 observaciones en JSON con esta forma exacta:
{"insights":[{"id":"string","tone":"alert|good|tip|info","title":"string corto","detail":"una frase"}]}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Respuesta vacía de OpenAI");

  const parsed = JSON.parse(content);
  const insights = parsed.insights;
  if (!Array.isArray(insights) || insights.length === 0) {
    throw new Error("Formato inesperado");
  }

  // Sanitize into our shape.
  return insights.slice(0, 6).map((i: Partial<Insight>, idx: number) => ({
    id: typeof i.id === "string" ? i.id : `ai-${idx}`,
    tone: ["alert", "good", "tip", "info"].includes(i.tone as string)
      ? (i.tone as Insight["tone"])
      : "info",
    title: String(i.title ?? "Observación"),
    detail: String(i.detail ?? ""),
  }));
}
