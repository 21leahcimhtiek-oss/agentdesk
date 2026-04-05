import OpenAI from "openai";
import type { AgentExecution } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ExecutionAnalysis {
  anomalies: string[];
  patterns: string[];
  summary: string;
  recommendations: string[];
}

export async function analyzeExecution(
  execution: AgentExecution
): Promise<ExecutionAnalysis> {
  const prompt = `Analyze this AI agent execution result:
Input: ${execution.input}
Output: ${execution.output ?? "(no output)"}
Status: ${execution.status}
Tokens used: ${execution.tokens_used}
Duration: ${execution.duration_ms}ms

Identify any anomalies, summarize the result, and suggest improvements.
Respond in JSON: { "anomalies": [], "patterns": [], "summary": "", "recommendations": [] }`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 512,
    response_format: { type: "json_object" },
  });

  try {
    return JSON.parse(completion.choices[0]?.message?.content ?? "{}") as ExecutionAnalysis;
  } catch {
    return { anomalies: [], patterns: [], summary: "Analysis unavailable", recommendations: [] };
  }
}

export async function analyzeExecutionBatch(
  executions: AgentExecution[]
): Promise<ExecutionAnalysis> {
  const stats = {
    total: executions.length,
    success: executions.filter((e) => e.status === "success").length,
    failed: executions.filter((e) => e.status === "failed").length,
    avg_tokens: executions.reduce((s, e) => s + e.tokens_used, 0) / (executions.length || 1),
    avg_duration: executions.reduce((s, e) => s + (e.duration_ms ?? 0), 0) / (executions.length || 1),
    total_cost: executions.reduce((s, e) => s + Number(e.cost_usd), 0),
  };

  const prompt = `Analyze these ${stats.total} agent executions:
Success rate: ${((stats.success / stats.total) * 100).toFixed(1)}%
Avg tokens: ${stats.avg_tokens.toFixed(0)}
Avg duration: ${stats.avg_duration.toFixed(0)}ms
Total cost: $${stats.total_cost.toFixed(4)}

Respond in JSON: { "anomalies": [], "patterns": [], "summary": "", "recommendations": [] }`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 512,
    response_format: { type: "json_object" },
  });

  try {
    return JSON.parse(completion.choices[0]?.message?.content ?? "{}") as ExecutionAnalysis;
  } catch {
    return { anomalies: [], patterns: [], summary: "Batch analysis unavailable", recommendations: [] };
  }
}