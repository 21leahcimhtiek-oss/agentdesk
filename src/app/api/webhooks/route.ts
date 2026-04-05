import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { hashApiKey } from '@/lib/utils';

const VALID_EVENTS = ['run.failed', 'run.success', 'budget.exceeded', 'budget.alert', 'anomaly.detected'];

const createWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase.from('members').select('org_id').eq('user_id', user.id).single();
  if (!member) return NextResponse.json({ error: 'No organization' }, { status: 403 });

  const { data, error } = await supabase.from('webhooks').select('id, url, events, active, created_at, updated_at').eq('org_id', member.org_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase.from('members').select('org_id, role').eq('user_id', user.id).single();
  if (!member || !['owner', 'admin'].includes(member.role)) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });

  const body = await request.json();
  const parsed = createWebhookSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const invalidEvents = parsed.data.events.filter(e => !VALID_EVENTS.includes(e));
  if (invalidEvents.length > 0) return NextResponse.json({ error: `Invalid events: ${invalidEvents.join(', ')}` }, { status: 400 });

  let secret_hash: string | undefined;
  if (parsed.data.secret) {
    secret_hash = await hashApiKey(parsed.data.secret);
  }

  const { data, error } = await supabase.from('webhooks').insert({
    url: parsed.data.url,
    events: parsed.data.events,
    secret_hash,
    org_id: member.org_id,
  }).select('id, url, events, active, created_at').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}