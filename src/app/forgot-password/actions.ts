"use server";

import { getSiteUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail, normalizeEmail } from "@/lib/validation";
import { redirect } from "next/navigation";

export async function requestPasswordReset(formData: FormData) {
  const email = normalizeEmail(String(formData.get("email") || ""));

  if (email && isValidEmail(email)) {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/auth/callback?next=/reset-password`
    });
  }

  redirect("/forgot-password?sent=1");
}
