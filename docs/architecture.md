# AgentDesk Architecture

## Overview

AgentDesk is a Next.js 14 App Router application using Supabase for auth and database, Stripe for billing, and OpenAI for AI-powered analysis.

## Directory Structure

```
src/
  app/                    # Next.js App Router
    (auth)/               # Auth pages (login, signup, reset)
    (dashboard)/          # Protected dashboard pages
    api/                  # API route handlers
  components/             # React components
  lib/                    # Utility libraries
    supabase/             # Supabase clients (browser + server)
    stripe/               # Stripe client + plan config
    openai/               # GPT-4o integrations
  types/                  # TypeScript type definitions
supabase/
  migrations/             # SQL migration files
```

## Data Flow

1. Agent SDKs call `POST /api/runs` with trace data
2. Run data stored in Supabase `agent_runs` table
3. Cost tracked against org/agent budgets
4. If budget threshold exceeded: webhooks triggered
5. Failed runs can be analyzed with GPT-4o via `POST /api/runs/:id?action=analyze`
6. Analytics aggregated on-demand from raw run data

## Multi-Tenancy

- Every resource is scoped to an `org_id`
- Supabase RLS policies enforce org isolation at the database level
- API routes verify org membership before any data access

## Authentication

- Supabase Auth (email/password + magic links)
- JWT stored in HTTP-only cookies (via `@supabase/ssr`)
- Next.js middleware validates session on every protected route

## Rate Limiting

- Upstash Redis sliding window: 100 req/min per user (standard)
- Strict limiter: 10 req/min for sensitive operations