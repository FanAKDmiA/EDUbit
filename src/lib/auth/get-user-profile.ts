import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function getUserProfile() {
  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return { user: null, profile: null };
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,created_at")
    .eq("id", user.id)
    .single<Profile>();

  if (error) {
    return { user, profile: null };
  }

  return { user, profile };
}
