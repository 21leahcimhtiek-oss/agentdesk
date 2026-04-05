import OpenAI from 'openai';
import type { AnalyticsData } from '@/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AnomalyDetectionResult {
  detected: boolean;
  anomalies: Array<{
    type: 'cost_spike' | 'latency_spike' | 'error_rate' | 'token_spike' | 'run_volume';
    description: string;
    severity: 'low' | 'medium' | 'high';
    affected_date: string;
    expected_value: number;
    actual_value: number;
  }>;
  summary: string;
}

export async function detectAnomalies(data: AnalyticsData[]): Promise<AnomalyDetectionResult> {
  if (data.length < 3) {
    return { detected: false, anomalies: [], summary: 'Insufficient data for anomaly detection' };
  }

  const prompt = `You are an AI observability expert. Detect statistical anomalies (Z-score > 2.5 or trend breaks) in this agent platform time-series data:

${JSON.stringify(data, null, 2)}

Return JSON with: detected (bool), anomalies (array with type, description, severity, affected_date, expected_value, actual_value), summary (string).
Types: cost_spike, latency_spike, error_rate, token_spike, run_volume`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');
  return JSON.parse(content) as AnomalyDetectionResult;
}