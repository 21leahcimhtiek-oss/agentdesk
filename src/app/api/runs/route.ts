import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

const createRunSchema = z.object({
  agent_id: z.string().uuid(),
  status: z.enum(['pending', 'running', 'success', 'failed']).default('pending'),
  input: z.record(z.unknown()).default({}),
  output: z.record(z.unknown()).optional(),
  tool_calls: z.array(z.object({
    name: z.string(),
    input: z.record(z.unknown()),
    output: z.unknown().optional(),
    latency_ms: z.number().optional(),
    error: z.string().optional(),
  })).default([]),
  tokens_used: z.number().int().min(0).default(0),
  cost_usd: z.number().min(0).default(0),
  latency_ms: z.number().int().min(0).default(0),
  error_message: z.string().optional(),
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase.from('members').select('org_id').eq('user_id', user.id).single();
  if (!member) return NextResponse.json({ error: 'No organization' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agent_id');
  const status = searchParams.get('status');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200);

  let query = supabase.from('agent_runs').select('*, agents(name)').eq('org_id', member.org_id).order('started_at', { ascending: false }).limit(limit);
  if (agentId) query = query.eq('agent_id', agentId);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { success } = await checkRateLimit(user.id);
  if (!success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const { data: member } = await supabase.from('members').select('org_id').eq('user_id', user.id).single();
  if (!member) return NextResponse.json({ error: 'No organization' }, { status: 403 });

  const body = await request.json();
  const parsed = createRunSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { data: agent } = await supabase.from('agents').select('id').eq('id', parsed.data.agent_id).eq('org_id', member.org_id).single();
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

  const { data, error } = await supabase.from('agent_runs').insert({
    ...parsed.data,
    org_id: member.org_id,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (data.cost_usd > 0) {
    await supabase.rpc('increment_budget_spend', { p_org_id: member.org_id, p_agent_id: parsed.data.agent_id, p_amount: data.cost_usd });
  }

  return NextResponse.json(data, { status: 201 });
}