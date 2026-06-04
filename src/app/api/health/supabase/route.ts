import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!hasUrl || !hasAnonKey || !hasServiceKey) {
    return NextResponse.json(
      {
        ok: false,
        env: { hasUrl, hasAnonKey, hasServiceKey },
        error: "Faltan variables de entorno."
      },
      { status: 500 }
    );
  }

  try {
    const supabase = createAdminClient();
    const { error, count } = await supabase.from("profiles").select("*", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          env: { hasUrl, hasAnonKey, hasServiceKey },
          error: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      env: { hasUrl, hasAnonKey, hasServiceKey },
      profilesCount: count ?? 0
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        env: { hasUrl, hasAnonKey, hasServiceKey },
        error: error instanceof Error ? error.message : "Error desconocido."
      },
      { status: 500 }
    );
  }
}
