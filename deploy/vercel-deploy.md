# Deploying AgentDesk to Vercel

## Prerequisites
- Vercel account
- Supabase project
- Stripe account
- Upstash Redis instance
- Sentry project

## Steps

### 1. Fork and connect
Fork this repo and connect it to Vercel.

### 2. Set environment variables
In Vercel dashboard -> Settings -> Environment Variables, add all vars from `.env.example`.

### 3. Configure Supabase
- Enable Email auth in Supabase Auth settings
- Run migrations: `npm run db:migrate` with your service role key
- Set redirect URLs in Supabase: `https://your-domain.vercel.app/**`

### 4. Configure Stripe
- Create products and prices for Starter ($49), Pro ($149), Enterprise ($499)
- Set up webhook: `https://your-domain.vercel.app/api/billing/webhook`
- Subscribe to: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Add webhook signing secret as `STRIPE_WEBHOOK_SECRET`

### 5. Deploy
```bash
vercel --prod
```

### 6. Verify
- Visit your domain and sign up
- Create a test agent
- Push a test run via the API
- Verify it appears in the dashboard