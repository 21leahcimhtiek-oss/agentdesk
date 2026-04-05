import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const CreateTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(["customer-support", "data-analysis", "content", "coding", "general"]),
  system_prompt: z.string().min(1).max(8000),
  model: z.enum(["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"]).default("gpt-4o-mini"),
  temperature: z.number().min(0).max(2).default(0.7),
  is_public: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let query = supabase.from("agent_templates").select("*").eq("is_public", true).order("name");
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  if (!member.data) return NextResponse.json({ error: "No org" }, { status: 403 });

  const body = await request.json();
  const parsed = CreateTemplateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await supabase
    .from("agent_templates")
    .insert({ ...parsed.data, org_id: member.data.org_id, is_public: false })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}