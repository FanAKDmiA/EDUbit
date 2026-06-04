import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminPage() {
  const { profile } = await requireRole("admin");
  const supabase = await createClient();

  const [{ count: usersCount }, { count: coursesCount }, { count: enrollmentsCount }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("course_memberships").select("*", { count: "exact", head: true })
  ]);

  return (
    <AppShell profile={profile}>
      <h1 className="text-3xl font-black">Panel administrador</h1>
      <p className="mt-2 text-ink/65">Gestioná usuarios, cursos, docentes e inscripciones.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ["Usuarios", usersCount ?? 0],
          ["Cursos", coursesCount ?? 0],
          ["Inscripciones", enrollmentsCount ?? 0]
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-ink/60">{label}</p>
            <p className="mt-2 text-4xl font-black">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" href="/admin/users">
          Gestionar usuarios
        </Link>
        <Link className="rounded-md bg-mint px-4 py-2 text-sm font-semibold text-ink" href="/admin/courses">
          Gestionar cursos
        </Link>
      </div>
    </AppShell>
  );
}
