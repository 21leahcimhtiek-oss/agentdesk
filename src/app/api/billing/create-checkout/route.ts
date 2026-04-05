import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PLANS } from "@/lib/stripe/client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await supabase.from("org_members").select("org_id, role, orgs(stripe_customer_id, name)").eq("user_id", user.id).single();
  if (!member.data || !["owner", "admin"].includes(member.data.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { planId } = await request.json();
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const orgId = member.data.org_id;
  const org = member.data.orgs as any;
  let customerId = org?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { org_id: orgId, user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from("orgs").update({ stripe_customer_id: customerId }).eq("id", orgId);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: plan.price_id, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?cancelled=true`,
    metadata: { org_id: orgId, plan_id: planId },
    subscription_data: { metadata: { org_id: orgId, plan_id: planId } },
  });

  return NextResponse.json({ url: session.url });
}