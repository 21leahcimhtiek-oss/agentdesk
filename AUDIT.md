# AgentDesk Security Audit Checklist

## Authentication & Authorization
- [x] Supabase Auth with email/password and magic links
- [x] Row Level Security (RLS) on all tables
- [x] API key hashing (SHA-256) — keys never stored in plaintext
- [x] JWT validation on all API routes
- [x] Rate limiting via Upstash Redis

## Data Security
- [x] All secrets in environment variables
- [x] Webhook secrets hashed before storage
- [x] Input validation with Zod on all API endpoints
- [x] SQL injection prevention via parameterized queries

## Infrastructure
- [x] HTTPS enforced
- [x] Sentry error monitoring
- [x] No PII logged in error traces
- [x] Stripe webhooks verified with signature

## Compliance
- [ ] SOC 2 Type II (planned Q2 2025)
- [ ] GDPR data deletion endpoints
- [x] Data retention policies configurable per org