export type Plan = 'starter' | 'pro' | 'enterprise';
export type RunStatus = 'pending' | 'running' | 'success' | 'failed';
export type MemberRole = 'owner' | 'admin' | 'member';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  monthly_run_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  org_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
}

export interface Agent {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  description?: string;
  endpoint_url?: string;
  api_key_hash?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  output?: unknown;
  latency_ms?: number;
  error?: string;
}

export interface AgentRun {
  id: string;
  agent_id: string;
  org_id: string;
  status: RunStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  tool_calls: ToolCall[];
  tokens_used: number;
  cost_usd: number;
  latency_ms: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  created_at: string;
}

export interface Budget {
  id: string;
  org_id: string;
  agent_id?: string;
  monthly_limit_usd: number;
  alert_threshold: number;
  current_spend_usd: number;
  period_start: string;
  created_at: string;
  updated_at: string;
}

export interface Webhook {
  id: string;
  org_id: string;
  url: string;
  events: string[];
  secret_hash?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsData {
  date: string;
  runs: number;
  success_rate: number;
  avg_latency_ms: number;
  total_cost_usd: number;
  tokens_used: number;
}

export const PLAN_LIMITS: Record<Plan, { runs: number; agents: number; retention_days: number }> = {
  starter: { runs: 10000, agents: 5, retention_days: 30 },
  pro: { runs: 100000, agents: 25, retention_days: 90 },
  enterprise: { runs: -1, agents: -1, retention_days: 365 },
};

export const PLAN_PRICES: Record<Plan, number> = {
  starter: 49,
  pro: 149,
  enterprise: 499,
};