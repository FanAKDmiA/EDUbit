import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { roleHome } from "@/types/roles";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next");
  const next = nextParam?.startsWith("/") ? nextParam : null;

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=oauth", request.url));
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(new URL("/account/incomplete-profile", request.url));
  }

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role,status").eq("id", user.id).maybeSingle();

  if (!profile) {
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email.split("@")[0] ||
      "Usuario EDUbit";

    await admin.from("profiles").insert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      role: "student",
      status: "pending"
    });

    return NextResponse.redirect(new URL("/account/pending", request.url));
  }

  if (profile.status === "pending") {
    return NextResponse.redirect(new URL("/account/pending", request.url));
  }

  if (profile.status === "invited") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (profile.status === "blocked") {
    return NextResponse.redirect(new URL("/account/blocked", request.url));
  }

  if (profile.status === "disabled") {
    return NextResponse.redirect(new URL("/account/disabled", request.url));
  }

  if (profile.status !== "active" || !(profile.role in roleHome)) {
    return NextResponse.redirect(new URL("/access-denied", request.url));
  }

  await admin.from("profiles").update({ last_login_at: new Date().toISOString() }).eq("id", user.id);

  return NextResponse.redirect(new URL(next || roleHome[profile.role as keyof typeof roleHome], request.url));
}
