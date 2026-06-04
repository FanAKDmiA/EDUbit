import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth/require-role";
import { one } from "@/lib/supabase/relations";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherCoursesPage() {
  const { profile } = await requireRole("teacher");
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select(
      "id,name,description,created_at,course_memberships(id,student:profiles!course_memberships_student_id_fkey(id,full_name,email))"
    )
    .eq("teacher_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <AppShell profile={profile}>
      <h1 className="text-3xl font-black">Mis cursos</h1>
      <div className="mt-6 grid gap-4">
        {(courses ?? []).length === 0 ? (
          <EmptyState title="Sin cursos asignados" body="Cuando administración te asigne cursos, aparecerán en esta vista." />
        ) : (
          (courses ?? []).map((course) => (
            <article key={course.id} className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">{course.name}</h2>
              <p className="mt-1 text-sm text-ink/65">{course.description || "Sin descripción"}</p>
              <div className="mt-4">
                <p className="text-sm font-semibold">Alumnos</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(course.course_memberships ?? []).length === 0 ? (
                    <span className="text-sm text-ink/60">Sin alumnos inscriptos.</span>
                  ) : (
                    (course.course_memberships ?? []).map((membership) => (
                      <span key={membership.id} className="rounded-md bg-mint/20 px-2.5 py-1 text-sm">
                        {one<{ full_name: string }>(membership.student)?.full_name}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </AppShell>
  );
}
