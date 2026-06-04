import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({
      authenticated: false,
      error: userError?.message ?? "No hay sesión activa."
    });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,created_at")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email
    },
    profile,
    profileError: profileError
      ? {
          message: profileError.message,
          code: profileError.code
        }
      : null
  });
}
