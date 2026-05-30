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
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
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
    "You are a personal finance assistant. You analyze a monthly summary of " +
    "expenses and income and return concrete, actionable, motivating insights in " +
    "English. Every insight must cite real numbers from the context. Do not make " +
    "up data. Amounts use a dot for thousands and a comma for decimals.";

  const user = `Data for the last months (amounts):
${JSON.stringify(context, null, 2)}

Patterns the local system detected (use them as reference; you may rephrase or expand):
${local.map((i) => `- ${i.title}: ${i.detail}`).join("\n")}

Return between 3 and 5 insights as JSON with this exact shape:
{"insights":[{"id":"string","tone":"alert|good|tip|info","title":"short string","detail":"one sentence"}]}`;

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
  if (!content) throw new Error("Empty response from OpenAI");

  const parsed = JSON.parse(content);
  const insights = parsed.insights;
  if (!Array.isArray(insights) || insights.length === 0) {
    throw new Error("Unexpected format");
  }

  // Sanitize into our shape.
  return insights.slice(0, 6).map((i: Partial<Insight>, idx: number) => ({
    id: typeof i.id === "string" ? i.id : `ai-${idx}`,
    tone: ["alert", "good", "tip", "info"].includes(i.tone as string)
      ? (i.tone as Insight["tone"])
      : "info",
    title: String(i.title ?? "Insight"),
    detail: String(i.detail ?? ""),
  }));
}
