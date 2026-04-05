import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await apiRateLimit.limit(ip);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  if (!member.data) return NextResponse.json({ error: "No org" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = Math.min(parseInt(searchParams.get("per_page") ?? "50"), 100);
  const status = searchParams.get("status");
  const agentId = searchParams.get("agent_id");
  const from = (page - 1) * perPage;

  let query = supabase
    .from("agent_executions")
    .select("*, agents(name, model)", { count: "exact" })
    .eq("org_id", member.data.org_id)
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (status) query = query.eq("status", status);
  if (agentId) query = query.eq("agent_id", agentId);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data, total: count ?? 0, page, per_page: perPage,
    has_more: (count ?? 0) > from + perPage,
  });
}