import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await supabase.from("org_members").select("org_id, role").eq("user_id", user.id).single();
  if (!member.data || !["owner", "admin"].includes(member.data.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = InviteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const orgId = member.data.org_id;
  const serviceClient = await createServiceClient();

  // Check if user already exists
  const { data: existingUsers } = await serviceClient.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find((u) => u.email === parsed.data.email);

  if (existingUser) {
    const { error } = await serviceClient.from("org_members").upsert({
      org_id: orgId, user_id: existingUser.id, role: parsed.data.role,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: { status: "added", user_id: existingUser.id } });
  }

  // New user: send invite email
  const { data: invited, error } = await serviceClient.auth.admin.inviteUserByEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    data: { invited_to_org: orgId, role: parsed.data.role },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await serviceClient.from("org_members").insert({
    org_id: orgId, user_id: invited.user.id, role: parsed.data.role,
  });

  return NextResponse.json({ data: { status: "invited", user_id: invited.user.id } }, { status: 201 });
}