export type BillingPlan = "free" | "starter" | "pro" | "enterprise";

export interface Org {
  id: string;
  name: string;
  slug: string;
  plan: BillingPlan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export type OrgRole = "owner" | "admin" | "member" | "viewer";

export interface OrgMember {
  org_id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
  user?: {
    id: string;
    email: string;
    user_metadata?: { full_name?: string; avatar_url?: string };
  };
}

export type AgentStatus = "active" | "idle" | "error" | "deleted";
export type AgentModel = "gpt-4o" | "gpt-4o-mini" | "gpt-3.5-turbo";

export interface Agent {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  model: AgentModel;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  status: AgentStatus;
  created_at: string;
  updated_at: string;
  execution_count?: number;
  last_execution_at?: string | null;
}

export type ExecutionStatus = "running" | "success" | "failed";

export interface AgentExecution {
  id: string;
  agent_id: string;
  org_id: string;
  input: string;
  output: string | null;
  status: ExecutionStatus;
  tokens_used: number;
  cost_usd: number;
  duration_ms: number | null;
  error: string | null;
  created_at: string;
  agent?: Pick<Agent, "id" | "name" | "model">;
}

export type TemplateCategory =
  | "customer-support"
  | "data-analysis"
  | "content"
  | "coding"
  | "general";

export interface AgentTemplate {
  id: string;
  org_id: string | null;
  name: string;
  description: string | null;
  category: TemplateCategory;
  system_prompt: string;
  model: AgentModel;
  temperature: number;
  is_public: boolean;
  created_at: string;
}

export interface ApiKey {
  id: string;
  org_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  last_used_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Webhook {
  id: string;
  org_id: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  created_at: string;
}

export interface UsageRecord {
  id: string;
  org_id: string;
  period_start: string;
  period_end: string;
  total_executions: number;
  total_tokens: number;
  total_cost_usd: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  org_id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PlanLimits {
  agents: number;
  executions_per_month: number;
  team_members: number;
}

export interface BillingPlanConfig {
  id: BillingPlan;
  name: string;
  price_monthly: number;
  price_id: string;
  limits: PlanLimits;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}