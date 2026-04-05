# Changelog

All notable changes to AgentDesk will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### Added
- Multi-agent workspace management (create, configure, deploy)
- Real-time execution logs with token and cost tracking
- Agent template library (customer support, data analysis, content, coding)
- Team collaboration with RBAC (owner/admin/member/viewer)
- Webhook integrations with signed payloads
- API key management with SHA-256 hashing
- Usage metering and per-agent cost tracking
- Stripe subscription billing (Starter/Pro/Enterprise)
- Stripe customer portal for self-serve plan management
- Dashboard with analytics (recharts)
- Supabase Auth with secure session handling
- Row-Level Security on all 9 database tables
- Upstash rate limiting (100 req/min general, 10/min executions)
- Sentry error tracking (client + server + edge)
- OpenAI agent execution with retry logic and exponential backoff
- Docker multi-stage build
- CI/CD with GitHub Actions (lint → typecheck → test → build → e2e)
- Playwright E2E test suite
- Jest unit tests for API routes and lib functions