# Deploying AgentDesk to Vercel

## Prerequisites

- Vercel account
- Supabase project (with schema from `supabase/migrations/001_initial_schema.sql`)
- Stripe account with 3 products created
- OpenAI API key
- Upstash Redis database
- Sentry project

## Step 1: Database Setup

1. Go to your Supabase project → SQL Editor
2. Run `supabase/migrations/001_initial_schema.sql`
3. Copy `Project URL` and `anon public` key from Project Settings → API

## Step 2: Stripe Setup

1. Create 3 products in Stripe Dashboard:
   - AgentDesk Starter ($149/mo recurring)
   - AgentDesk Pro ($399/mo recurring)
   - AgentDesk Enterprise ($899/mo recurring)
2. Copy each product's Price ID
3. Enable Customer Portal in Stripe Dashboard → Settings → Billing

## Step 3: Deploy to Vercel

```bash
npx vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Step 4: Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_STARTER_PRICE_ID` | Starter plan price ID |
| `STRIPE_PRO_PRICE_ID` | Pro plan price ID |
| `STRIPE_ENTERPRISE_PRICE_ID` | Enterprise plan price ID |
| `OPENAI_API_KEY` | OpenAI API key |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `SENTRY_DSN` | Sentry DSN |
| `NEXT_PUBLIC_SENTRY_DSN` | Same Sentry DSN |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL |

## Step 5: Stripe Webhook

1. In Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://your-vercel-url.vercel.app/api/billing/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret
5. Add as `STRIPE_WEBHOOK_SECRET` in Vercel

## Step 6: Verify

Visit your deployment URL. You should see the AgentDesk landing page.
Create an account, set up an org, and run your first agent!