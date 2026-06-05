import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types/database";
import { roleLabel } from "@/types/roles";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppNav } from "./app-nav";
import { Button } from "../ui/button";

const navByRole = {
  admin: [
    { href: "/admin", label: "Inicio" },
    { href: "/admin/users", label: "Usuarios" },
    { href: "/admin/courses", label: "Cursos" },
    { href: "/admin/access-requests", label: "Solicitudes" },
    { href: "/admin/audit-logs", label: "Auditoría" },
    { href: "/account/profile", label: "Mi perfil" }
  ],
  teacher: [
    { href: "/teacher", label: "Inicio" },
    { href: "/teacher/courses", label: "Cursos" },
    { href: "/account/profile", label: "Mi perfil" }
  ],
  student: [
    { href: "/student", label: "Inicio" },
    { href: "/student/courses", label: "Cursos" },
    { href: "/account/profile", label: "Mi perfil" }
  ]
};

export async function AppShell({ profile, children }: { profile: Profile; children: ReactNode }) {
  let hasPendingAccessRequests = false;

  if (profile.role === "admin") {
    const supabase = createAdminClient();
    const { count } = await supabase
      .from("access_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    hasPendingAccessRequests = Boolean(count && count > 0);
  }

  return (
    <div className="min-h-screen bg-[#f7f4ee]">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="text-xl font-black tracking-normal text-ink">
            EDUbit
          </Link>
          <AppNav items={navByRole[profile.role]} hasPendingAccessRequests={hasPendingAccessRequests} />
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <p className="font-semibold">{profile.full_name}</p>
              <p className="text-ink/60">{roleLabel[profile.role]}</p>
            </div>
            <form action="/logout" method="post">
              <Button variant="ghost" type="submit">
                Salir
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
