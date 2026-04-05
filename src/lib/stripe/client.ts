import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 49,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    runs: 10000,
    agents: 5,
    retention: 30,
    features: ['10,000 runs/month', '5 agents', '30-day retention', 'Email alerts'],
  },
  pro: {
    name: 'Pro',
    price: 149,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    runs: 100000,
    agents: 25,
    retention: 90,
    features: ['100,000 runs/month', '25 agents', '90-day retention', 'Slack + email alerts', 'GPT-4o failure analysis'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 499,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    runs: -1,
    agents: -1,
    retention: 365,
    features: ['Unlimited runs', 'Unlimited agents', '1-year retention', 'Priority support', 'SSO', 'Anomaly detection'],
  },
};