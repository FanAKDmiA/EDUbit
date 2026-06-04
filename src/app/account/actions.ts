"use server";

import { logAuditEvent } from "@/lib/audit/log-audit-event";
import { requireUser } from "@/lib/auth/require-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { formValue, isValidPassword } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateOwnProfile(formData: FormData) {
  const { user } = await requireUser();
  const fullName = formValue(formData, "full_name");

  if (!fullName) {
    redirect("/account/profile?error=missing-name");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, updated_by: user.id })
    .eq("id", user.id);

  if (error) {
    redirect(`/account/profile?error=${encodeURIComponent(error.message)}`);
  }

  await logAuditEvent({
    actorUserId: user.id,
    targetUserId: user.id,
    action: "profile_updated",
    entityType: "profile",
    entityId: user.id
  });

  revalidatePath("/account/profile");
  redirect("/account/profile?updated=1");
}

export async function changeOwnPassword(formData: FormData) {
  const { user } = await requireUser();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");

  if (!isValidPassword(password) || password !== confirmPassword) {
    redirect("/account/security?error=invalid-password");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/account/security?error=${encodeURIComponent(error.message)}`);
  }

  await logAuditEvent({
    actorUserId: user.id,
    targetUserId: user.id,
    action: "password_changed",
    entityType: "profile",
    entityId: user.id
  });

  redirect("/account/security?updated=1");
}

export async function completeOnboarding(formData: FormData) {
  const { user, profile } = await requireUser();
  const fullName = formValue(formData, "full_name");
  const acceptedTerms = formData.get("accepted_terms") === "on";

  if (!profile || profile.status !== "invited") {
    redirect("/login");
  }

  if (!fullName || !acceptedTerms) {
    redirect("/onboarding?error=invalid-onboarding");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, status: "active", updated_by: user.id })
    .eq("id", user.id);

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  }

  await logAuditEvent({
    actorUserId: user.id,
    targetUserId: user.id,
    action: "user_activated",
    entityType: "profile",
    entityId: user.id
  });

  redirect(profile.role === "admin" ? "/admin" : profile.role === "teacher" ? "/teacher" : "/student");
}
