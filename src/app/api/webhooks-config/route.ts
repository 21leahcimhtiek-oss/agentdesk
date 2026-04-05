import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";
import { z } from "zod";

const CreateWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1).default(["execution.complete"]),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  if (!member.data) return NextResponse.json({ error: "No org" }, { status: 403 });

  const { data } = await supabase.from("webhooks").select("id, url, events, is_active, created_at").eq("org_id", member.data.org_id).order("created_at", { ascending: false });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await supabase.from("org_members").select("org_id, role").eq("user_id", user.id).single();
  if (!member.data || !["owner", "admin"].includes(member.data.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = CreateWebhookSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const secret = `whsec_${randomBytes(24).toString("hex")}`;
  const { data, error } = await supabase
    .from("webhooks")
    .insert({ org_id: member.data.org_id, ...parsed.data, secret })
    .select("id, url, events, is_active, created_at").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { ...data, secret } }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await supabase.from("org_members").select("org_id, role").eq("user_id", user.id).single();
  if (!member.data || !["owner", "admin"].includes(member.data.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const webhookId = searchParams.get("id");
  if (!webhookId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await supabase.from("webhooks").delete().eq("id", webhookId).eq("org_id", member.data.org_id);
  return new NextResponse(null, { status: 204 });
}