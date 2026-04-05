# AgentDesk

> Centralized AI agent management platform for engineering teams

AgentDesk gives you full visibility into your AI agent runs, tool calls, costs, and failures across all deployed agents.

## Features

- **Agent Registry** — Register and configure your deployed AI agents
- **Run Trace Viewer** — Full trace of every agent run: tool calls, latency, tokens used
- **Cost Tracking** — Per-agent, per-team, per-project cost dashboards with budget alerts
- **Failure Analysis** — GPT-4o powered root cause analysis for failed runs
- **Anomaly Detection** — Automatic detection of unusual patterns in agent behavior
- **Webhooks** — Slack/email alerts for errors, budget overruns, and anomalies
- **Multi-tenant** — Organizations, team members, and API key management

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts
- **Backend**: Supabase (Auth + PostgreSQL), Drizzle ORM
- **Billing**: Stripe (Starter $49/mo, Pro $149/mo, Enterprise $499/mo)
- **AI**: OpenAI GPT-4o for failure analysis and anomaly detection
- **Monitoring**: Sentry, Upstash Redis (rate limiting)
- **Testing**: Jest, Playwright

## Quick Start

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your credentials
3. Run `npm install`
4. Run `npm run dev`
5. Apply database migrations: `npm run db:migrate`

## Pricing

| Plan | Price | Runs/month | Agents | Retention |
|------|-------|-----------|--------|-----------|
| Starter | $49/mo | 10,000 | 5 | 30 days |
| Pro | $149/mo | 100,000 | 25 | 90 days |
| Enterprise | $499/mo | Unlimited | Unlimited | 1 year |

## API

See [docs/api.md](docs/api.md) for the full API reference.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).