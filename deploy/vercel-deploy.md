# Deploying AgentDesk on Vercel

## Prerequisites

- Vercel account
- Supabase project
- Stripe account
- Upstash Redis instance

## One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/21leahcimhtiek-oss/agentdesk)

## Manual Deployment

### 1. Clone and install
```bash
git clone https://github.com/21leahcimhtiek-oss/agentdesk
cd agentdesk
npm install
```

### 2. Set up Supabase
1. Create a new Supabase project
2. Run the migration: paste `supabase/migrations/001_initial_schema.sql` in the SQL editor
3. Copy your project URL and anon key

### 3. Set up Stripe
1. Create products in Stripe Dashboard
2. Note the price IDs for Starter, Pro, Enterprise plans
3. Set up a webhook endpoint pointing to `/api/billing/webhook`

### 4. Configure environment variables in Vercel

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_STARTER_PRICE_ID=
STRIPE_PRO_PRICE_ID=
STRIPE_ENTERPRISE_PRICE_ID=
OPENAI_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 5. Deploy
```bash
npx vercel --prod
```