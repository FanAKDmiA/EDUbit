"use server";

import { logAuditEvent } from "@/lib/audit/log-audit-event";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { createClient } from "@/lib/supabase/server";
import { isValidPassword } from "@/lib/validation";
import { redirect } from "next/navigation";

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");

  if (!isValidPassword(password) || password !== confirmPassword) {
    redirect("/reset-password?error=invalid-password");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect("/reset-password?error=invalid-token");
  }

  const { user } = await getUserProfile();
  if (user) {
    await logAuditEvent({
      actorUserId: user.id,
      targetUserId: user.id,
      action: "password_changed",
      entityType: "profile",
      entityId: user.id
    });
  }

  redirect("/reset-password?updated=1");
}
