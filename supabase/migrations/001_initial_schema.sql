-- AgentDesk Initial Schema
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── ORGS ───────────────────────────────────────────────────────────────────
create table orgs (
  id                    uuid primary key default uuid_generate_v4(),
  name                  text not null,
  slug                  text unique not null,
  plan                  text not null default 'free' check (plan in ('free','starter','pro','enterprise')),
  stripe_customer_id    text unique,
  stripe_subscription_id text unique,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ─── ORG MEMBERS ────────────────────────────────────────────────────────────
create table org_members (
  org_id     uuid not null references orgs(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'member' check (role in ('owner','admin','member','viewer')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- ─── AGENTS ─────────────────────────────────────────────────────────────────
create table agents (
  id            uuid primary key default uuid_generate_v4(),
  org_id        uuid not null references orgs(id) on delete cascade,
  name          text not null,
  description   text,
  model         text not null default 'gpt-4o-mini',
  system_prompt text not null default '',
  temperature   numeric(3,2) not null default 0.7 check (temperature >= 0 and temperature <= 2),
  max_tokens    integer not null default 1024 check (max_tokens > 0 and max_tokens <= 32000),
  status        text not null default 'idle' check (status in ('active','idle','error','deleted')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_agents_org_status on agents(org_id, status);

-- ─── AGENT EXECUTIONS ───────────────────────────────────────────────────────
create table agent_executions (
  id           uuid primary key default uuid_generate_v4(),
  agent_id     uuid not null references agents(id) on delete cascade,
  org_id       uuid not null references orgs(id) on delete cascade,
  input        text not null,
  output       text,
  status       text not null default 'running' check (status in ('running','success','failed')),
  tokens_used  integer default 0,
  cost_usd     numeric(10,6) default 0,
  duration_ms  integer,
  error        text,
  created_at   timestamptz not null default now()
);

create index idx_executions_org_created on agent_executions(org_id, created_at desc);
create index idx_executions_agent_id on agent_executions(agent_id, created_at desc);

-- ─── AGENT TEMPLATES ────────────────────────────────────────────────────────
create table agent_templates (
  id            uuid primary key default uuid_generate_v4(),
  org_id        uuid references orgs(id) on delete cascade,
  name          text not null,
  description   text,
  category      text not null check (category in ('customer-support','data-analysis','content','coding','general')),
  system_prompt text not null,
  model         text not null default 'gpt-4o-mini',
  temperature   numeric(3,2) not null default 0.7,
  is_public     boolean not null default false,
  created_at    timestamptz not null default now()
);

create index idx_templates_public on agent_templates(is_public, category);

-- ─── API KEYS ────────────────────────────────────────────────────────────────
create table api_keys (
  id           uuid primary key default uuid_generate_v4(),
  org_id       uuid not null references orgs(id) on delete cascade,
  name         text not null,
  key_hash     text not null unique,
  key_prefix   text not null,
  last_used_at timestamptz,
  created_by   uuid references auth.users(id),
  created_at   timestamptz not null default now()
);

create index idx_api_keys_org on api_keys(org_id);
create index idx_api_keys_hash on api_keys(key_hash);

-- ─── WEBHOOKS ────────────────────────────────────────────────────────────────
create table webhooks (
  id         uuid primary key default uuid_generate_v4(),
  org_id     uuid not null references orgs(id) on delete cascade,
  url        text not null,
  events     text[] not null default array['execution.complete'],
  secret     text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_webhooks_org on webhooks(org_id, is_active);

-- ─── USAGE RECORDS ──────────────────────────────────────────────────────────
create table usage_records (
  id                 uuid primary key default uuid_generate_v4(),
  org_id             uuid not null references orgs(id) on delete cascade,
  period_start       date not null,
  period_end         date not null,
  total_executions   integer not null default 0,
  total_tokens       bigint not null default 0,
  total_cost_usd     numeric(12,4) not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique(org_id, period_start)
);

create index idx_usage_org_period on usage_records(org_id, period_start desc);

-- ─── AUDIT LOG ──────────────────────────────────────────────────────────────
create table audit_log (
  id            uuid primary key default uuid_generate_v4(),
  org_id        uuid not null references orgs(id) on delete cascade,
  user_id       uuid references auth.users(id),
  action        text not null,
  resource_type text not null,
  resource_id   uuid,
  metadata      jsonb default '{}',
  created_at    timestamptz not null default now()
);

create index idx_audit_org_created on audit_log(org_id, created_at desc);

-- ─── UPDATED_AT TRIGGER ─────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_orgs_updated_at before update on orgs
  for each row execute function set_updated_at();
create trigger trg_agents_updated_at before update on agents
  for each row execute function set_updated_at();
create trigger trg_usage_updated_at before update on usage_records
  for each row execute function set_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
alter table orgs enable row level security;
alter table org_members enable row level security;
alter table agents enable row level security;
alter table agent_executions enable row level security;
alter table agent_templates enable row level security;
alter table api_keys enable row level security;
alter table webhooks enable row level security;
alter table usage_records enable row level security;
alter table audit_log enable row level security;

-- Helper function: get org IDs the current user belongs to
create or replace function auth_user_org_ids()
returns setof uuid
language sql security definer stable
as $$
  select org_id from org_members where user_id = auth.uid();
$$;

-- orgs: members can see their own org
create policy "orgs_select" on orgs for select
  using (id in (select auth_user_org_ids()));

create policy "orgs_update" on orgs for update
  using (id in (
    select org_id from org_members
    where user_id = auth.uid() and role in ('owner','admin')
  ));

-- org_members: members see all members of their org
create policy "org_members_select" on org_members for select
  using (org_id in (select auth_user_org_ids()));

create policy "org_members_insert" on org_members for insert
  with check (org_id in (
    select org_id from org_members
    where user_id = auth.uid() and role in ('owner','admin')
  ));

create policy "org_members_delete" on org_members for delete
  using (org_id in (
    select org_id from org_members
    where user_id = auth.uid() and role in ('owner','admin')
  ));

-- agents
create policy "agents_select" on agents for select
  using (org_id in (select auth_user_org_ids()));
create policy "agents_insert" on agents for insert
  with check (org_id in (select auth_user_org_ids()));
create policy "agents_update" on agents for update
  using (org_id in (select auth_user_org_ids()));
create policy "agents_delete" on agents for delete
  using (org_id in (select auth_user_org_ids()));

-- agent_executions
create policy "executions_select" on agent_executions for select
  using (org_id in (select auth_user_org_ids()));
create policy "executions_insert" on agent_executions for insert
  with check (org_id in (select auth_user_org_ids()));

-- agent_templates: public + org-private
create policy "templates_select" on agent_templates for select
  using (is_public = true or org_id in (select auth_user_org_ids()));
create policy "templates_insert" on agent_templates for insert
  with check (org_id in (select auth_user_org_ids()));

-- api_keys
create policy "api_keys_select" on api_keys for select
  using (org_id in (select auth_user_org_ids()));
create policy "api_keys_insert" on api_keys for insert
  with check (org_id in (select auth_user_org_ids()));
create policy "api_keys_delete" on api_keys for delete
  using (org_id in (select auth_user_org_ids()));

-- webhooks
create policy "webhooks_select" on webhooks for select
  using (org_id in (select auth_user_org_ids()));
create policy "webhooks_insert" on webhooks for insert
  with check (org_id in (select auth_user_org_ids()));
create policy "webhooks_update" on webhooks for update
  using (org_id in (select auth_user_org_ids()));
create policy "webhooks_delete" on webhooks for delete
  using (org_id in (select auth_user_org_ids()));

-- usage_records
create policy "usage_select" on usage_records for select
  using (org_id in (select auth_user_org_ids()));

-- audit_log: select only (append via service role)
create policy "audit_select" on audit_log for select
  using (org_id in (select auth_user_org_ids()));

-- ─── SEED: Agent Templates ───────────────────────────────────────────────────
insert into agent_templates (name, description, category, system_prompt, model, temperature, is_public) values
(
  'Customer Support Agent',
  'Handles customer inquiries with empathy and accuracy. Escalates complex issues.',
  'customer-support',
  'You are a helpful customer support agent. Be empathetic, concise, and accurate. If you cannot resolve an issue, clearly explain escalation steps. Always end with asking if there is anything else you can help with.',
  'gpt-4o-mini',
  0.5,
  true
),
(
  'Data Analysis Assistant',
  'Analyzes datasets, identifies patterns, and generates actionable insights.',
  'data-analysis',
  'You are a data analysis expert. When given data (CSV, JSON, or descriptive), identify key patterns, anomalies, and actionable insights. Structure your response with: Summary, Key Findings, Recommendations.',
  'gpt-4o',
  0.3,
  true
),
(
  'Content Generator',
  'Generates SEO-optimized blog posts, social media content, and marketing copy.',
  'content',
  'You are a professional content writer specializing in B2B SaaS. Write clear, engaging, SEO-optimized content. Match the brand voice: professional yet approachable. Always include a compelling CTA.',
  'gpt-4o',
  0.8,
  true
),
(
  'Code Review Assistant',
  'Reviews code for bugs, security issues, performance, and best practices.',
  'coding',
  'You are a senior software engineer performing code reviews. Analyze the provided code for: bugs, security vulnerabilities, performance issues, and best practices. Format your response with sections: Critical Issues, Warnings, Suggestions, Summary.',
  'gpt-4o',
  0.2,
  true
);