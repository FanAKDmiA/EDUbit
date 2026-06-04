import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth/require-role";
import { one } from "@/lib/supabase/relations";
import { createClient } from "@/lib/supabase/server";

export default async function StudentCoursesPage() {
  const { profile } = await requireRole("student");
  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("course_memberships")
    .select("id,course:courses(id,name,description,teacher:profiles!courses_teacher_id_fkey(id,full_name,email))")
    .eq("student_id", profile.id);

  return (
    <AppShell profile={profile}>
      <h1 className="text-3xl font-black">Mis cursos</h1>
      <div className="mt-6 grid gap-4">
        {(memberships ?? []).length === 0 ? (
          <EmptyState title="Sin cursos" body="Cuando administración te inscriba en un curso, aparecerá en esta vista." />
        ) : (
          (memberships ?? []).map((membership) => {
            const course = one<{
              name: string;
              description: string | null;
              teacher: { full_name: string } | { full_name: string }[] | null;
            }>(membership.course);
            const teacher = one<{ full_name: string }>(course?.teacher);

            return (
              <article key={membership.id} className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-black">{course?.name}</h2>
                <p className="mt-1 text-sm text-ink/65">{course?.description || "Sin descripción"}</p>
                <p className="mt-3 text-sm">
                  Docente: <span className="font-semibold">{teacher?.full_name || "Sin asignar"}</span>
                </p>
              </article>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
