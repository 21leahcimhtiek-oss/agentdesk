# AgentDesk

> Zero-touch AI agent orchestration for enterprise teams

[![CI](https://github.com/21leahcimhtiek-oss/agentdesk/actions/workflows/ci.yml/badge.svg)](https://github.com/21leahcimhtiek-oss/agentdesk/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Overview

AgentDesk is a production-ready SaaS platform that lets engineering and operations teams deploy, monitor, and orchestrate AI agents at scale — without touching infrastructure. Connect your OpenAI models, define system prompts, and let AgentDesk handle execution, retries, cost tracking, and team collaboration.

**Pricing:** $149/mo Starter · $399/mo Pro · $899/mo Enterprise

## Features

- **Multi-agent workspaces** — Create, configure, and deploy unlimited AI agents per plan
- **Real-time monitoring** — Live execution logs with token usage and cost tracking  
- **Template library** — Pre-built agents for customer support, data analysis, content generation, and coding
- **Team collaboration** — Role-based access control (Owner / Admin / Member / Viewer)
- **Webhook integrations** — Event-driven automation with signed payloads
- **API key management** — Scoped API keys with usage analytics
- **Usage metering** — Per-agent cost tracking, monthly roll-ups, Stripe billing
- **Audit logs** — Full audit trail for compliance

## Architecture

```
Next.js 14 (App Router)
├── /app/(auth)         — Login, signup, password reset
├── /app/(dashboard)    — Protected SaaS UI
├── /app/api            — REST API routes
└── /app/page.tsx       — Public landing page

External Services
├── Supabase            — Postgres database + Auth + RLS
├── Stripe              — Subscription billing
├── OpenAI              — Agent execution
├── Upstash Redis       — Rate limiting
└── Sentry              — Error tracking
```

## Quick Start

### Prerequisites
- Node.js 20+
- A Supabase project
- A Stripe account
- An OpenAI API key

### Installation

```bash
git clone https://github.com/21leahcimhtiek-oss/agentdesk
cd agentdesk
npm install
cp .env.example .env.local
```

### Database Setup

```bash
# Run the migration in your Supabase SQL editor or CLI
psql $DATABASE_URL < supabase/migrations/001_initial_schema.sql
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `OPENAI_API_KEY` | OpenAI API key |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `SENTRY_DSN` | Sentry DSN for error tracking |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

See [deploy/vercel-deploy.md](deploy/vercel-deploy.md) for full Vercel deployment instructions.

### Docker

```bash
docker build -t agentdesk .
docker run -p 3000:3000 --env-file .env.local agentdesk
```

## Stripe Integration

AgentDesk uses Stripe Subscriptions. To configure:

1. Create three products in Stripe Dashboard: Starter ($149), Pro ($399), Enterprise ($899)
2. Copy the Price IDs to your `.env.local`
3. Set up a webhook endpoint pointing to `/api/billing/webhook`
4. Add the `STRIPE_WEBHOOK_SECRET` from the Stripe Dashboard

Events handled:
- `checkout.session.completed` — activates subscription
- `customer.subscription.updated` — plan changes
- `customer.subscription.deleted` — downgrades to free

## API Reference

See [docs/api.md](docs/api.md) for full API documentation.

### Authentication

All API routes require a valid Supabase session cookie, or an `Authorization: Bearer <api-key>` header for programmatic access.

### Key Endpoints

```
GET  /api/agents               — List agents
POST /api/agents               — Create agent
POST /api/agents/:id/execute   — Execute agent
GET  /api/executions           — Execution history
GET  /api/analytics            — Usage analytics
POST /api/billing/create-checkout — Start Stripe checkout
```

## Testing

```bash
npm test                # Unit tests (Jest)
npm run test:e2e        # E2E tests (Playwright)
npm run test:coverage   # Coverage report
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — See [LICENSE](LICENSE). Built by [Aurora Rayes LLC](https://aurora-rayes.com).