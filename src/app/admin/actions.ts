"use server";

import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/types/roles";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function field(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function createManagedUser(formData: FormData) {
  await requireRole("admin");

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
    role
  });

  if (profileError) {
    redirect(`/admin/users?error=${encodeURIComponent(profileError.message)}`);
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?created=1");
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
