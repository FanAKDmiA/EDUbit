"use server";

import { createClient } from "@/lib/supabase/server";
import { formValue, isValidEmail, normalizeEmail } from "@/lib/validation";
import { redirect } from "next/navigation";

export async function submitAccessRequest(formData: FormData) {
  const fullName = formValue(formData, "full_name");
  const email = normalizeEmail(formValue(formData, "email"));
  const requestedRole = formValue(formData, "requested_role");
  const institution = formValue(formData, "institution");
  const courseReference = formValue(formData, "course_reference");
  const message = formValue(formData, "message");

  if (!fullName || !isValidEmail(email) || !["teacher", "student"].includes(requestedRole)) {
    redirect("/request-access?error=invalid-request");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("access_requests").insert({
    full_name: fullName,
    email,
    requested_role: requestedRole,
    institution: institution || null,
    course_reference: courseReference || null,
    message: message || null
  });

  if (error?.code === "23505") {
    redirect("/request-access?error=duplicate-request");
  }

  if (error) {
    redirect("/request-access?error=request-failed");
  }

  redirect("/request-access?sent=1");
}
