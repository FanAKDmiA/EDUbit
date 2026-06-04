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
    .select("id,email,full_name,role,status,created_at,updated_at,last_login_at,created_by,updated_by")
    .eq("id", user.id)
    .single<Profile>();

  if (error) {
    return { user, profile: null };
  }

  return { user, profile };
}
