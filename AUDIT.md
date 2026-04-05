# AgentDesk — Security Audit Checklist

## Database Security (Supabase RLS)

- [x] RLS enabled on all 9 tables
- [x] `orgs` — users can only read their own org (via org_members join)
- [x] `org_members` — members can only see members of orgs they belong to
- [x] `agents` — scoped to org_id matching user's org memberships
- [x] `agent_executions` — scoped to org_id
- [x] `agent_templates` — public templates readable by all; private scoped to org
- [x] `api_keys` — scoped to org_id; key_hash stored (never plaintext)
- [x] `webhooks` — scoped to org_id
- [x] `usage_records` — scoped to org_id
- [x] `audit_log` — scoped to org_id; append-only via policy

## API Security

- [x] Stripe webhook signature verified with `stripe.webhooks.constructEvent()`
- [x] API rate limiting via Upstash: 100 req/min general, 10 req/min executions
- [x] All inputs validated with Zod schemas before DB operations
- [x] API keys hashed with SHA-256 before storage; returned plaintext once only
- [x] Webhook secrets generated with `crypto.randomBytes(32)`
- [x] Server-side auth check on every protected API route
- [x] CORS restricted to `NEXT_PUBLIC_APP_URL`

## Authentication

- [x] Supabase Auth with secure session cookies (httpOnly, sameSite=lax)
- [x] Session refresh middleware on every request
- [x] Password reset flow requires valid token
- [x] Invite flow validates email before sending

## Infrastructure

- [x] Environment variables validated at startup (no silent undefined keys)
- [x] `SUPABASE_SERVICE_ROLE_KEY` never exposed to client bundle
- [x] `STRIPE_SECRET_KEY` never exposed to client bundle
- [x] Sentry DSN separated: `NEXT_PUBLIC_SENTRY_DSN` for client, `SENTRY_DSN` for server
- [x] Docker image runs as non-root user (nextjs:nodejs)

## Error Handling

- [x] Sentry captures all unhandled exceptions (client + server + edge)
- [x] API routes return structured error responses (never stack traces)
- [x] OpenAI execution failures logged to `agent_executions` with status=failed

## Compliance

- [x] Audit log captures all mutations (create/update/delete) with user_id + metadata
- [x] No PII stored in agent inputs/outputs beyond what the org provides
- [x] Stripe handles all payment card data (PCI compliant by design)