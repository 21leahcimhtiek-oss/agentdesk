import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AnomalyReport {
  hasAnomalies: boolean;
  anomalies: Array<{
    type: string;
    description: string;
    severity: "low" | "medium" | "high";
    runIds: string[];
  }>;
  summary: string;
}

export async function detectAnomalies(
  runHistory: Array<{
    id: string;
    status: string;
    tokens_used: number;
    cost_usd: number;
    latency_ms: number;
    started_at: string;
  }>
): Promise<AnomalyReport> {
  if (runHistory.length < 3) {
    return { hasAnomalies: false, anomalies: [], summary: "Insufficient data for anomaly detection." };
  }

  const prompt = `Analyze this AI agent run history for anomalies. Look for unusual patterns in latency, cost, token usage, error rates, or timing.

Run History (last ${runHistory.length} runs):
${JSON.stringify(runHistory, null, 2)}

Respond with JSON:
{
  "hasAnomalies": boolean,
  "anomalies": [{ "type": string, "description": string, "severity": "low|medium|high", "runIds": string[] }],
  "summary": string
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  return JSON.parse(response.choices[0].message.content || "{}") as AnomalyReport;
}