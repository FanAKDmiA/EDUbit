"use server";

import { requireRole } from "@/lib/auth/require-role";
import { logAuditEvent } from "@/lib/audit/log-audit-event";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/supabase/env";
import { formValue, isValidEmail, normalizeEmail } from "@/lib/validation";
import type { ProfileStatus, Role } from "@/types/roles";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function field(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function createManagedUser(formData: FormData) {
  const { profile: actor } = await requireRole("admin");

  const fullName = field(formData, "full_name");
  const email = field(formData, "email").toLowerCase();
  const password = String(formData.get("password") || "");
  const role = field(formData, "role") as Role;

  if (!fullName || !email || password.length < 6 || !["teacher", "student"].includes(role)) {
    redirect("/admin/users?error=invalid-user");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role }
  });

  if (error || !data.user) {
    redirect(`/admin/users?error=${encodeURIComponent(error?.message || "user-create-failed")}`);
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    email,
    full_name: fullName,
    role,
    status: "active",
    created_by: actor.id,
    updated_by: actor.id
  });

  if (profileError) {
    redirect(`/admin/users?error=${encodeURIComponent(profileError.message)}`);
  }

  await logAuditEvent({
    actorUserId: actor.id,
    targetUserId: data.user.id,
    action: "user_created",
    entityType: "profile",
    entityId: data.user.id,
    metadata: { role }
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?created=1");
}

export async function inviteUser(formData: FormData) {
  const { profile: actor } = await requireRole("admin");

  const fullName = formValue(formData, "full_name");
  const email = normalizeEmail(formValue(formData, "email"));
  const role = formValue(formData, "role") as Role;
  const courseId = formValue(formData, "course_id");

  if (!fullName || !isValidEmail(email) || !["teacher", "student"].includes(role)) {
    redirect("/admin/users/invite?error=invalid-invite");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role },
    redirectTo: `${getSiteUrl()}/auth/confirm?next=/onboarding`
  });

  if (error || !data.user) {
    redirect(`/admin/users/invite?error=${encodeURIComponent(error?.message || "invite-failed")}`);
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: data.user.id,
    email,
    full_name: fullName,
    role,
    status: "invited",
    created_by: actor.id,
    updated_by: actor.id
  });

  if (profileError) {
    redirect(`/admin/users/invite?error=${encodeURIComponent(profileError.message)}`);
  }

  if (courseId && role === "student") {
    await supabase
      .from("course_memberships")
      .upsert({ course_id: courseId, student_id: data.user.id }, { onConflict: "course_id,student_id" });
  }

  if (courseId && role === "teacher") {
    await supabase.from("courses").update({ teacher_id: data.user.id }).eq("id", courseId);
  }

  await logAuditEvent({
    actorUserId: actor.id,
    targetUserId: data.user.id,
    action: "user_invited",
    entityType: "profile",
    entityId: data.user.id,
    metadata: { role, course_id: courseId || null }
  });

  revalidatePath("/admin/users");
  redirect("/admin/users/invite?invited=1");
}

export async function updateUserAdmin(formData: FormData) {
  const { profile: actor } = await requireRole("admin");

  const userId = formValue(formData, "user_id");
  const fullName = formValue(formData, "full_name");
  const role = formValue(formData, "role") as Role;
  const status = formValue(formData, "status") as ProfileStatus;

  if (!userId || !fullName || !["admin", "teacher", "student"].includes(role) || !["active", "invited", "pending", "blocked", "disabled"].includes(status)) {
    redirect(`/admin/users/${userId || ""}?error=invalid-user-update`);
  }

  const supabase = createAdminClient();
  const { data: before } = await supabase.from("profiles").select("role,status").eq("id", userId).single();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, role, status, updated_by: actor.id })
    .eq("id", userId);

  if (error) {
    redirect(`/admin/users/${userId}?error=${encodeURIComponent(error.message)}`);
  }

  if (before?.role !== role) {
    await logAuditEvent({
      actorUserId: actor.id,
      targetUserId: userId,
      action: "role_changed",
      entityType: "profile",
      entityId: userId,
      metadata: { from: before?.role, to: role }
    });
  }

  if (before?.status !== status) {
    await logAuditEvent({
      actorUserId: actor.id,
      targetUserId: userId,
      action: status === "blocked" ? "user_blocked" : status === "disabled" ? "user_disabled" : "user_status_changed",
      entityType: "profile",
      entityId: userId,
      metadata: { from: before?.status, to: status }
    });
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect(`/admin/users/${userId}?updated=1`);
}

export async function forcePasswordReset(formData: FormData) {
  const { profile: actor } = await requireRole("admin");
  const userId = formValue(formData, "user_id");
  const email = normalizeEmail(formValue(formData, "email"));

  if (!userId || !isValidEmail(email)) {
    redirect(`/admin/users/${userId || ""}?error=invalid-reset`);
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/confirm?next=/reset-password`
  });

  if (error) {
    redirect(`/admin/users/${userId}?error=${encodeURIComponent(error.message)}`);
  }

  await logAuditEvent({
    actorUserId: actor.id,
    targetUserId: userId,
    action: "password_reset_requested_by_admin",
    entityType: "profile",
    entityId: userId
  });

  redirect(`/admin/users/${userId}?reset=1`);
}

export async function resendInvitation(formData: FormData) {
  const { profile: actor } = await requireRole("admin");
  const userId = formValue(formData, "user_id");
  const email = normalizeEmail(formValue(formData, "email"));
  const fullName = formValue(formData, "full_name");
  const role = formValue(formData, "role") as Role;
  const returnTo = formValue(formData, "return_to") || "/admin/users";

  if (!userId || !fullName || !isValidEmail(email) || !["admin", "teacher", "student"].includes(role)) {
    redirect(`${returnTo}?error=invalid-resend`);
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/confirm?next=/onboarding`
  });

  if (error) {
    redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  }

  await supabase
    .from("profiles")
    .update({ status: "invited", updated_by: actor.id })
    .eq("id", userId);

  await logAuditEvent({
    actorUserId: actor.id,
    targetUserId: userId,
    action: "invitation_resent",
    entityType: "profile",
    entityId: userId,
    metadata: { email, role, email_type: "recovery_to_onboarding" }
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/access-requests");
  redirect(`${returnTo}?resent=1`);
}

export async function generateInvitationLink(formData: FormData) {
  const { profile: actor } = await requireRole("admin");
  const userId = formValue(formData, "user_id");
  const email = normalizeEmail(formValue(formData, "email"));
  const fullName = formValue(formData, "full_name");
  const role = formValue(formData, "role") as Role;
  const returnTo = formValue(formData, "return_to") || "/admin/users";

  if (!userId || !fullName || !isValidEmail(email) || !["admin", "teacher", "student"].includes(role)) {
    redirect(`${returnTo}?error=invalid-link`);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${getSiteUrl()}/auth/confirm?next=/onboarding`
    }
  });

  const actionLink = data.properties?.action_link;

  if (error || !actionLink) {
    redirect(`${returnTo}?error=${encodeURIComponent(error?.message || "invite-link-failed")}`);
  }

  await supabase
    .from("profiles")
    .update({ status: "invited", updated_by: actor.id })
    .eq("id", userId);

  await logAuditEvent({
    actorUserId: actor.id,
    targetUserId: userId,
    action: "invitation_link_generated",
    entityType: "profile",
    entityId: userId,
    metadata: { email, role, link_type: "recovery_to_onboarding" }
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/access-requests");
  redirect(`${returnTo}?invite_link=${encodeURIComponent(actionLink)}`);
}

export async function disableInvitedUser(formData: FormData) {
  const { profile: actor } = await requireRole("admin");
  const userId = formValue(formData, "user_id");
  const returnTo = formValue(formData, "return_to") || "/admin/users";

  if (!userId) {
    redirect(`${returnTo}?error=invalid-disable`);
  }

  const supabase = createAdminClient();
  const { data: target, error: targetError } = await supabase
    .from("profiles")
    .select("id,email,role,status")
    .eq("id", userId)
    .single();

  if (targetError || !target) {
    redirect(`${returnTo}?error=user-not-found`);
  }

  if (target.status !== "invited") {
    redirect(`${returnTo}?error=user-not-invited`);
  }

  const { error } = await supabase
    .from("profiles")
    .update({ status: "disabled", updated_by: actor.id })
    .eq("id", userId);

  if (error) {
    redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  }

  await supabase
    .from("access_requests")
    .update({
      status: "cancelled",
      reviewed_by: actor.id,
      reviewed_at: new Date().toISOString(),
      review_notes: "Invitación dada de baja"
    })
    .eq("created_user_id", userId)
    .eq("status", "approved");

  await logAuditEvent({
    actorUserId: actor.id,
    targetUserId: userId,
    action: "invited_user_disabled",
    entityType: "profile",
    entityId: userId,
    metadata: { email: target.email, role: target.role }
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/access-requests");
  redirect(`${returnTo}?disabled=1`);
}

export async function approveAccessRequest(formData: FormData) {
  const { profile: actor } = await requireRole("admin");
  const requestId = formValue(formData, "request_id");
  const notes = formValue(formData, "review_notes");

  if (!requestId) {
    redirect("/admin/access-requests?error=missing-request");
  }

  const supabase = createAdminClient();
  const { data: request, error: requestError } = await supabase
    .from("access_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (requestError || !request || request.status !== "pending") {
    redirect("/admin/access-requests?error=request-not-pending");
  }

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(request.email, {
    data: { full_name: request.full_name, role: request.requested_role },
    redirectTo: `${getSiteUrl()}/auth/confirm?next=/onboarding`
  });

  let invitedUserId = data.user?.id;
  const alreadyRegistered = error?.message.toLowerCase().includes("already been registered");

  if (error && !alreadyRegistered) {
    redirect(`/admin/access-requests?error=${encodeURIComponent(error.message)}`);
  }

  if (alreadyRegistered) {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id,email,full_name,role,status")
      .eq("email", request.email)
      .maybeSingle();

    if (!existingProfile) {
      redirect("/admin/access-requests?error=user-already-exists-without-profile");
    }

    invitedUserId = existingProfile.id;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(request.email, {
      redirectTo: `${getSiteUrl()}/auth/confirm?next=/onboarding`
    });

    if (resetError) {
      redirect(`/admin/access-requests?error=${encodeURIComponent(resetError.message)}`);
    }
  }

  if (!invitedUserId) {
    redirect("/admin/access-requests?error=invite-failed");
  }

  await supabase.from("profiles").upsert({
    id: invitedUserId,
    email: request.email,
    full_name: request.full_name,
    role: request.requested_role,
    status: "invited",
    created_by: actor.id,
    updated_by: actor.id
  });

  await supabase
    .from("access_requests")
    .update({
      status: "approved",
      reviewed_by: actor.id,
      reviewed_at: new Date().toISOString(),
      review_notes: notes || null,
      created_user_id: invitedUserId
    })
    .eq("id", requestId);

  await logAuditEvent({
    actorUserId: actor.id,
    targetUserId: invitedUserId,
    action: "access_request_approved",
    entityType: "access_request",
    entityId: requestId,
    metadata: { requested_role: request.requested_role, reused_existing_user: alreadyRegistered }
  });

  revalidatePath("/admin/access-requests");
  redirect("/admin/access-requests?approved=1");
}

export async function rejectAccessRequest(formData: FormData) {
  const { profile: actor } = await requireRole("admin");
  const requestId = formValue(formData, "request_id");
  const notes = formValue(formData, "review_notes");

  if (!requestId) {
    redirect("/admin/access-requests?error=missing-request");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("access_requests")
    .update({
      status: "rejected",
      reviewed_by: actor.id,
      reviewed_at: new Date().toISOString(),
      review_notes: notes || null
    })
    .eq("id", requestId);

  if (error) {
    redirect(`/admin/access-requests?error=${encodeURIComponent(error.message)}`);
  }

  await logAuditEvent({
    actorUserId: actor.id,
    action: "access_request_rejected",
    entityType: "access_request",
    entityId: requestId
  });

  revalidatePath("/admin/access-requests");
  redirect("/admin/access-requests?rejected=1");
}

export async function createCourse(formData: FormData) {
  await requireRole("admin");

  const name = field(formData, "name");
  const description = field(formData, "description");
  const teacherId = field(formData, "teacher_id") || null;

  if (!name) {
    redirect("/admin/courses?error=missing-course-name");
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("courses").insert({
    name,
    description: description || null,
    teacher_id: teacherId
  });

  if (error) {
    redirect(`/admin/courses?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/courses");
  redirect("/admin/courses?created=1");
}

export async function assignTeacher(formData: FormData) {
  await requireRole("admin");

  const courseId = field(formData, "course_id");
  const teacherId = field(formData, "teacher_id") || null;

  if (!courseId) {
    redirect("/admin/courses?error=missing-course");
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("courses").update({ teacher_id: teacherId }).eq("id", courseId);

  if (error) {
    redirect(`/admin/courses?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/courses");
  redirect("/admin/courses?assigned=1");
}

export async function enrollStudent(formData: FormData) {
  await requireRole("admin");

  const courseId = field(formData, "course_id");
  const studentId = field(formData, "student_id");

  if (!courseId || !studentId) {
    redirect("/admin/courses?error=missing-enrollment");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("course_memberships")
    .upsert({ course_id: courseId, student_id: studentId }, { onConflict: "course_id,student_id" });

  if (error) {
    redirect(`/admin/courses?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/courses");
  redirect("/admin/courses?enrolled=1");
}
