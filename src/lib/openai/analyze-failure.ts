import OpenAI from 'openai';
import type { AgentRun } from '@/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface FailureAnalysis {
  root_cause: string;
  category: 'tool_error' | 'timeout' | 'token_limit' | 'logic_error' | 'external_api' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestions: string[];
  similar_patterns: string[];
}

export async function analyzeFailure(run: AgentRun): Promise<FailureAnalysis> {
  const prompt = `You are an AI agent debugging expert. Analyze this failed agent run and provide root cause analysis.

Run ID: ${run.id}
Status: ${run.status}
Error: ${run.error_message ?? 'none'}
Tool Calls: ${JSON.stringify(run.tool_calls, null, 2)}
Tokens Used: ${run.tokens_used}
Latency: ${run.latency_ms}ms

Return JSON with: root_cause, category (tool_error|timeout|token_limit|logic_error|external_api|unknown), severity (low|medium|high|critical), suggestions (array), similar_patterns (array)`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');
  return JSON.parse(content) as FailureAnalysis;
}