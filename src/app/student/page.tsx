import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function StudentPage() {
  const { profile } = await requireRole("student");
  const supabase = await createClient();
  const { count } = await supabase
    .from("course_memberships")
    .select("*", { count: "exact", head: true })
    .eq("student_id", profile.id);

  return (
    <AppShell profile={profile}>
      <h1 className="text-3xl font-black">Panel alumno</h1>
      <p className="mt-2 text-ink/65">Consultá tus cursos y tu estado inicial en EDUbit.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-ink/60">Cursos inscriptos</p>
          <p className="mt-2 text-4xl font-black">{count ?? 0}</p>
        </div>
        <div className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-ink/60">Saldo EDUbit</p>
          <p className="mt-2 text-4xl font-black">0</p>
        </div>
      </div>
      <div className="mt-6 rounded-md border border-dashed border-coral/35 bg-white/70 p-5">
        <h2 className="font-bold">Historial EDUbit</h2>
        <p className="mt-1 text-sm leading-6 text-ink/65">
          Placeholder para el futuro historial de transacciones educativas.
        </p>
      </div>
      <Link className="mt-6 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" href="/student/courses">
        Ver cursos
      </Link>
    </AppShell>
  );
}
