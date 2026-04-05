import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  endpoint_url: z.string().url().optional().or(z.literal('')),
  metadata: z.record(z.unknown()).optional(),
});

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase.from('members').select('org_id').eq('user_id', user.id).single();
  if (!member) return NextResponse.json({ error: 'No organization' }, { status: 403 });

  const { data, error } = await supabase.from('agents').select('*').eq('org_id', member.org_id).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { success } = await checkRateLimit(user.id);
  if (!success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const { data: member } = await supabase.from('members').select('org_id, role').eq('user_id', user.id).single();
  if (!member) return NextResponse.json({ error: 'No organization' }, { status: 403 });
  if (!['owner', 'admin'].includes(member.role)) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });

  const body = await request.json();
  const parsed = createAgentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { data, error } = await supabase.from('agents').insert({
    ...parsed.data,
    org_id: member.org_id,
    metadata: parsed.data.metadata ?? {},
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}