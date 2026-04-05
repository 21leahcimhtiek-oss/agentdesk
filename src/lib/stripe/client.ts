import Stripe from "stripe";
import type { BillingPlan, BillingPlanConfig, PlanLimits } from "@/types";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const PLAN_LIMITS: Record<BillingPlan, PlanLimits> = {
  free: { agents: 1, executions_per_month: 100, team_members: 1 },
  starter: { agents: 5, executions_per_month: 10000, team_members: 1 },
  pro: { agents: 25, executions_per_month: 100000, team_members: 10 },
  enterprise: { agents: -1, executions_per_month: 1000000, team_members: -1 },
};

export const PLANS: BillingPlanConfig[] = [
  {
    id: "starter",
    name: "Starter",
    price_monthly: 149,
    price_id: process.env.STRIPE_STARTER_PRICE_ID!,
    limits: PLAN_LIMITS.starter,
  },
  {
    id: "pro",
    name: "Pro",
    price_monthly: 399,
    price_id: process.env.STRIPE_PRO_PRICE_ID!,
    limits: PLAN_LIMITS.pro,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price_monthly: 899,
    price_id: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    limits: PLAN_LIMITS.enterprise,
  },
];

export function getPlanConfig(plan: BillingPlan): BillingPlanConfig | undefined {
  return PLANS.find((p) => p.id === plan);
}

export function isWithinLimit(limit: number, current: number): boolean {
  if (limit === -1) return true; // unlimited
  return current < limit;
}