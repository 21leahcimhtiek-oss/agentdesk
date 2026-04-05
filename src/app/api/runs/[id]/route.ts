import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeFailure } from '@/lib/openai/analyze-failure';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase.from('agent_runs').select('*, agents(name, slug)').eq('id', params.id).single();
  if (error || !data) return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('action') !== 'analyze') {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: run } = await supabase.from('agent_runs').select('*').eq('id', params.id).single();
  if (!run) return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  if (run.status !== 'failed') return NextResponse.json({ error: 'Can only analyze failed runs' }, { status: 400 });

  try {
    const analysis = await analyzeFailure(run);
    return NextResponse.json(analysis);
  } catch (e) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}