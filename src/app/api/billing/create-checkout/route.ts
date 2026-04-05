import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, PLANS } from '@/lib/stripe/client';
import { z } from 'zod';

const schema = z.object({ plan: z.enum(['starter', 'pro', 'enterprise']) });

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  const { data: member } = await supabase
    .from('members')
    .select('org_id, organizations(stripe_customer_id, slug)')
    .eq('user_id', user.id)
    .single();

  const org = member?.organizations as { stripe_customer_id?: string; slug: string } | null;
  const plan = PLANS[parsed.data.plan];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${appUrl}/billing?success=true`,
    cancel_url: `${appUrl}/billing`,
    customer: org?.stripe_customer_id,
    customer_email: org?.stripe_customer_id ? undefined : user.email,
    metadata: { org_id: member?.org_id ?? '', plan: parsed.data.plan },
  });

  return NextResponse.json({ url: session.url });
}