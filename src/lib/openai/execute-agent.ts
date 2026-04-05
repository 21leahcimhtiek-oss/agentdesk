import OpenAI from "openai";
import type { AgentModel } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Cost per 1k tokens (blended input/output estimate)
const COST_PER_1K: Record<AgentModel, number> = {
  "gpt-4o": 0.005,
  "gpt-4o-mini": 0.00015,
  "gpt-3.5-turbo": 0.002,
};

export interface ExecutionResult {
  output: string;
  tokens_used: number;
  cost_usd: number;
  duration_ms: number;
}

async function attemptExecution(
  model: AgentModel,
  systemPrompt: string,
  input: string,
  temperature: number,
  maxTokens: number
): Promise<ExecutionResult> {
  const start = Date.now();

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: input },
    ],
    temperature,
    max_tokens: maxTokens,
  });

  const duration_ms = Date.now() - start;
  const tokens_used = completion.usage?.total_tokens ?? 0;
  const cost_usd = (tokens_used / 1000) * (COST_PER_1K[model] ?? 0.002);
  const output = completion.choices[0]?.message?.content ?? "";

  return { output, tokens_used, cost_usd, duration_ms };
}

export async function executeAgent(params: {
  model: AgentModel;
  systemPrompt: string;
  input: string;
  temperature: number;
  maxTokens: number;
  maxRetries?: number;
}): Promise<ExecutionResult> {
  const { model, systemPrompt, input, temperature, maxTokens, maxRetries = 3 } = params;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await attemptExecution(model, systemPrompt, input, temperature, maxTokens);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError ?? new Error("Agent execution failed after retries");
}