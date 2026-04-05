import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

const PLAN_BY_PRICE: Record<string, string> = {
  [process.env.STRIPE_STARTER_PRICE_ID!]: "starter",
  [process.env.STRIPE_PRO_PRICE_ID!]: "pro",
  [process.env.STRIPE_ENTERPRISE_PRICE_ID!]: "enterprise",
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature verification failed` }, { status: 400 });
  }

  const supabase = await createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.org_id;
      const planId = session.metadata?.plan_id ?? "starter";
      if (orgId) {
        await supabase.from("orgs").update({
          plan: planId,
          stripe_subscription_id: session.subscription as string,
        }).eq("id", orgId);
      }
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.org_id;
      const priceId = sub.items.data[0]?.price.id;
      const plan = priceId ? (PLAN_BY_PRICE[priceId] ?? "starter") : "starter";
      if (orgId) {
        await supabase.from("orgs").update({ plan, stripe_subscription_id: sub.id }).eq("id", orgId);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.org_id;
      if (orgId) {
        await supabase.from("orgs").update({ plan: "free", stripe_subscription_id: null }).eq("id", orgId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}