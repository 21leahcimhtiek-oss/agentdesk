import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { detectAnomalies } from '@/lib/openai/detect-anomaly';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase.from('members').select('org_id').eq('user_id', user.id).single();
  if (!member) return NextResponse.json({ error: 'No organization' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') ?? '30');
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: runs } = await supabase
    .from('agent_runs')
    .select('status, cost_usd, latency_ms, tokens_used, started_at')
    .eq('org_id', member.org_id)
    .gte('started_at', since);

  const byDay: Record<string, { runs: number; failed: number; cost: number; latency: number[]; tokens: number }> = {};
  (runs ?? []).forEach(r => {
    const day = r.started_at.slice(0, 10);
    if (!byDay[day]) byDay[day] = { runs: 0, failed: 0, cost: 0, latency: [], tokens: 0 };
    byDay[day].runs++;
    byDay[day].cost += r.cost_usd ?? 0;
    byDay[day].latency.push(r.latency_ms ?? 0);
    byDay[day].tokens += r.tokens_used ?? 0;
    if (r.status === 'failed') byDay[day].failed++;
  });

  const analytics = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, d]) => ({
    date,
    runs: d.runs,
    success_rate: d.runs > 0 ? parseFloat(((d.runs - d.failed) / d.runs * 100).toFixed(1)) : 100,
    avg_latency_ms: d.latency.length > 0 ? Math.round(d.latency.reduce((a, b) => a + b, 0) / d.latency.length) : 0,
    total_cost_usd: parseFloat(d.cost.toFixed(6)),
    tokens_used: d.tokens,
  }));

  const detect = searchParams.get('detect_anomalies') === 'true';
  if (detect && analytics.length >= 3) {
    try {
      const anomalies = await detectAnomalies(analytics);
      return NextResponse.json({ analytics, anomalies });
    } catch {
      return NextResponse.json({ analytics, anomalies: null });
    }
  }

  return NextResponse.json({ analytics });
}