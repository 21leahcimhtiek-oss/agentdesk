import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createHash, randomBytes } from "crypto";
import { z } from "zod";

const CreateKeySchema = z.object({ name: z.string().min(1).max(100) });

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  if (!member.data) return NextResponse.json({ error: "No org" }, { status: 403 });

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, last_used_at, created_at")
    .eq("org_id", member.data.org_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
  const parsed = CreateKeySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const rawKey = `agd_${randomBytes(32).toString("hex")}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 12);

  const { data, error } = await supabase
    .from("api_keys")
    .insert({ org_id: member.data.org_id, name: parsed.data.name, key_hash: keyHash, key_prefix: keyPrefix, created_by: user.id })
    .select("id, name, key_prefix, created_at").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Return full key ONCE — never stored in plaintext
  return NextResponse.json({ data: { ...data, key: rawKey } }, { status: 201 });
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
  const keyId = searchParams.get("id");
  if (!keyId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase.from("api_keys").delete().eq("id", keyId).eq("org_id", member.data.org_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return new NextResponse(null, { status: 204 });
}