import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types/database";
import { roleLabel } from "@/types/roles";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "../ui/button";

const navByRole = {
  admin: [
    { href: "/admin", label: "Inicio" },
    { href: "/admin/users", label: "Usuarios" },
    { href: "/admin/courses", label: "Cursos" },
    { href: "/admin/access-requests", label: "Solicitudes" },
    { href: "/admin/audit-logs", label: "Auditoría" }
  ],
  teacher: [
    { href: "/teacher", label: "Inicio" },
    { href: "/teacher/courses", label: "Cursos" }
  ],
  student: [
    { href: "/student", label: "Inicio" },
    { href: "/student/courses", label: "Cursos" }
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
          <nav className="flex flex-wrap items-center gap-2">
            {navByRole[profile.role].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-ink/75 hover:bg-ink/5 hover:text-ink"
              >
                {item.label}
                {item.href === "/admin/access-requests" && hasPendingAccessRequests ? (
                  <span
                    aria-label="Hay solicitudes pendientes"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-black leading-none text-white"
                  >
                    !
                  </span>
                ) : null}
              </Link>
            ))}
            <Link
              href="/account/profile"
              className="rounded-md px-3 py-2 text-sm font-semibold text-ink/75 hover:bg-ink/5 hover:text-ink"
            >
              Mi perfil
            </Link>
            <Link
              href="/account/security"
              className="rounded-md px-3 py-2 text-sm font-semibold text-ink/75 hover:bg-ink/5 hover:text-ink"
            >
              Seguridad
            </Link>
          </nav>
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
