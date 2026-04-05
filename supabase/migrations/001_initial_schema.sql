-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    monthly_run_limit INT NOT NULL DEFAULT 10000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Members
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

-- Agents
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    endpoint_url TEXT,
    api_key_hash TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, slug)
);

-- Agent Runs
CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed')),
    input JSONB DEFAULT '{}',
    output JSONB,
    tool_calls JSONB DEFAULT '[]',
    tokens_used INT DEFAULT 0,
    cost_usd NUMERIC(10,6) DEFAULT 0,
    latency_ms INT DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    monthly_limit_usd NUMERIC(10,2) NOT NULL,
    alert_threshold NUMERIC(3,2) NOT NULL DEFAULT 0.80,
    current_spend_usd NUMERIC(10,6) DEFAULT 0,
    period_start TIMESTAMPTZ NOT NULL DEFAULT DATE_TRUNC('month', NOW()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL DEFAULT '{}',
    secret_hash TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agents_org_id ON agents(org_id);
CREATE INDEX idx_agent_runs_agent_id ON agent_runs(agent_id);
CREATE INDEX idx_agent_runs_org_id ON agent_runs(org_id);
CREATE INDEX idx_agent_runs_status ON agent_runs(status);
CREATE INDEX idx_agent_runs_started_at ON agent_runs(started_at DESC);
CREATE INDEX idx_budgets_org_id ON budgets(org_id);
CREATE INDEX idx_webhooks_org_id ON webhooks(org_id);

-- Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org" ON organizations
    FOR SELECT USING (id IN (SELECT org_id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Members can view org members" ON members
    FOR SELECT USING (org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Members can view org agents" ON agents
    FOR SELECT USING (org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage agents" ON agents
    FOR ALL USING (org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Members can view runs" ON agent_runs
    FOR SELECT USING (org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Members can view budgets" ON budgets
    FOR SELECT USING (org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage budgets" ON budgets
    FOR ALL USING (org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Members can view webhooks" ON webhooks
    FOR SELECT USING (org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage webhooks" ON webhooks
    FOR ALL USING (org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));