import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_MAP: Record<string, string> = {
  [process.env.STRIPE_STARTER_PRICE_ID ?? '']: 'starter',
  [process.env.STRIPE_PRO_PRICE_ID ?? '']: 'pro',
  [process.env.STRIPE_ENTERPRISE_PRICE_ID ?? '']: 'enterprise',
};

const RUN_LIMITS: Record<string, number> = {
  starter: 10000,
  pro: 100000,
  enterprise: 999999999,
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const sub = event.data.object as Stripe.Subscription;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orgId = session.metadata?.org_id;
    const plan = session.metadata?.plan ?? 'starter';
    if (orgId) {
      await supabaseAdmin.from('organizations').update({
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        plan,
        monthly_run_limit: RUN_LIMITS[plan],
        updated_at: new Date().toISOString(),
      }).eq('id', orgId);
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const priceId = sub.items.data[0]?.price.id;
    const plan = PLAN_MAP[priceId] ?? 'starter';
    const active = event.type !== 'customer.subscription.deleted';
    await supabaseAdmin.from('organizations').update({
      plan: active ? plan : 'starter',
      stripe_subscription_id: active ? sub.id : null,
      monthly_run_limit: RUN_LIMITS[active ? plan : 'starter'],
      updated_at: new Date().toISOString(),
    }).eq('stripe_customer_id', sub.customer as string);
  }

  return NextResponse.json({ received: true });
}