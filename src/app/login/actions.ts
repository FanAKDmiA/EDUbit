"use server";

import { createClient } from "@/lib/supabase/server";
import { roleHome } from "@/types/roles";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
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
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user?.id).single();

  if (!profile?.role || !(profile.role in roleHome)) {
    redirect("/access-denied");
  }

  redirect(roleHome[profile.role as keyof typeof roleHome]);
}
