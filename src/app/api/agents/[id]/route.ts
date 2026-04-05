import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  model: z.enum(["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"]).optional(),
  system_prompt: z.string().max(8000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().min(1).max(32000).optional(),
  status: z.enum(["active", "idle"]).optional(),
});

async function getOrgAgent(supabase: any, agentId: string, userId: string) {
  const member = await supabase.from("org_members").select("org_id").eq("user_id", userId).single();
  if (!member.data) return null;
  const agent = await supabase.from("agents").select("*").eq("id", agentId).eq("org_id", member.data.org_id).neq("status", "deleted").single();
  return agent.data;
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agent = await getOrgAgent(supabase, params.id, user.id);
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: executions } = await supabase
    .from("agent_executions")
    .select("*")
    .eq("agent_id", params.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ data: { ...agent, executions } });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agent = await getOrgAgent(supabase, params.id, user.id);
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = UpdateAgentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await supabase.from("agents").update(parsed.data).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agent = await getOrgAgent(supabase, params.id, user.id);
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await supabase.from("agents").update({ status: "deleted" }).eq("id", params.id);
  await supabase.from("audit_log").insert({
    org_id: agent.org_id, user_id: user.id, action: "agent.deleted",
    resource_type: "agent", resource_id: params.id, metadata: { name: agent.name },
  });

  return new NextResponse(null, { status: 204 });
}