import { assignTeacher, createCourse, enrollStudent } from "@/app/admin/actions";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { StatusMessage } from "@/components/ui/status-message";
import { requireRole } from "@/lib/auth/require-role";
import { one } from "@/lib/supabase/relations";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCoursesPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; created?: string; assigned?: string; enrolled?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole("admin");
  const supabase = await createClient();

  const [{ data: courses }, { data: teachers }, { data: students }, { data: memberships }] = await Promise.all([
    supabase
      .from("courses")
      .select("id,name,description,teacher_id,created_at,teacher:profiles!courses_teacher_id_fkey(id,full_name,email)")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id,full_name,email").eq("role", "teacher").order("full_name"),
    supabase.from("profiles").select("id,full_name,email").eq("role", "student").order("full_name"),
    supabase
      .from("course_memberships")
      .select("id,course_id,student_id,student:profiles!course_memberships_student_id_fkey(id,full_name,email)")
  ]);

  const success = params.created
    ? "Curso creado correctamente."
    : params.assigned
      ? "Docente asignado correctamente."
      : params.enrolled
        ? "Alumno inscripto correctamente."
        : undefined;

  return (
    <AppShell profile={profile}>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="grid gap-5">
          <section className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
            <h1 className="text-2xl font-black">Crear curso</h1>
            <form action={createCourse} className="mt-5 grid gap-4">
              <StatusMessage error={params.error} success={success} />
              <Field label="Nombre">
                <Input name="name" required />
              </Field>
              <Field label="Descripción">
                <Textarea name="description" />
              </Field>
              <Field label="Docente">
                <Select name="teacher_id" defaultValue="">
                  <option value="">Sin asignar</option>
                  {(teachers ?? []).map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Button type="submit">Crear curso</Button>
            </form>
          </section>

          <section className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Inscribir alumno</h2>
            <form action={enrollStudent} className="mt-4 grid gap-4">
              <Field label="Curso">
                <Select name="course_id" required>
                  {(courses ?? []).map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Alumno">
                <Select name="student_id" required>
                  {(students ?? []).map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Button type="submit" variant="secondary">
                Inscribir
              </Button>
            </form>
          </section>
        </div>

        <section>
          <h2 className="text-2xl font-black">Cursos</h2>
          <div className="mt-4 grid gap-4">
            {(courses ?? []).length === 0 ? (
              <EmptyState title="Sin cursos" body="Creá el primer curso para empezar a asignar docentes y alumnos." />
            ) : (
              (courses ?? []).map((course) => {
                const courseStudents = (memberships ?? []).filter((membership) => membership.course_id === course.id);

                return (
                  <article key={course.id} className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-black">{course.name}</h3>
                        <p className="mt-1 text-sm text-ink/65">{course.description || "Sin descripción"}</p>
                        <p className="mt-2 text-sm">
                          Docente:{" "}
                          <span className="font-semibold">
                            {one<{ full_name: string }>(course.teacher)?.full_name || "Sin asignar"}
                          </span>
                        </p>
                      </div>
                      <form action={assignTeacher} className="flex min-w-64 flex-wrap items-end gap-2">
                        <input type="hidden" name="course_id" value={course.id} />
                        <Select name="teacher_id" defaultValue={course.teacher_id ?? ""}>
                          <option value="">Sin asignar</option>
                          {(teachers ?? []).map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.full_name}
                            </option>
                          ))}
                        </Select>
                        <Button type="submit" variant="ghost">
                          Asignar
                        </Button>
                      </form>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-semibold">Alumnos inscriptos</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {courseStudents.length === 0 ? (
                          <span className="text-sm text-ink/60">Sin alumnos todavía.</span>
                        ) : (
                          courseStudents.map((membership) => (
                            <span key={membership.id} className="rounded-md bg-gold/20 px-2.5 py-1 text-sm">
                              {one<{ full_name: string }>(membership.student)?.full_name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
