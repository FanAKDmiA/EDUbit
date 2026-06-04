"use server";

import { logAuditEvent } from "@/lib/audit/log-audit-event";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { roleHome } from "@/types/roles";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect("/login?error=missing-fields");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/login?error=invalid-credentials");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", user?.id).single();

  if (!user || !profile?.role) {
    redirect("/account/incomplete-profile");
  }

  if (profile.status === "pending") {
    redirect("/account/pending");
  }

  if (profile.status === "invited") {
    redirect("/onboarding");
  }

  if (profile.status === "blocked") {
    await logAuditEvent({
      actorUserId: user.id,
      targetUserId: user.id,
      action: "login_blocked_by_status",
      entityType: "profile",
      entityId: user.id,
      metadata: { status: profile.status }
    });
    redirect("/account/blocked");
  }

  if (profile.status === "disabled") {
    await logAuditEvent({
      actorUserId: user.id,
      targetUserId: user.id,
      action: "login_blocked_by_status",
      entityType: "profile",
      entityId: user.id,
      metadata: { status: profile.status }
    });
    redirect("/account/disabled");
  }

  if (profile.status !== "active" || !(profile.role in roleHome)) {
    redirect("/access-denied");
  }

  const admin = createAdminClient();
  await admin.from("profiles").update({ last_login_at: new Date().toISOString() }).eq("id", user.id);

  redirect(roleHome[profile.role as keyof typeof roleHome]);
}
