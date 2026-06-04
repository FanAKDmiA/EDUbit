import { inviteUser } from "@/app/admin/actions";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { StatusMessage } from "@/components/ui/status-message";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export default async function InviteUserPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; invited?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole("admin");
  const supabase = await createClient();
  const { data: courses } = await supabase.from("courses").select("id,name").order("name");

  return (
    <AppShell profile={profile}>
      <section className="max-w-2xl rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-black">Invitar usuario</h1>
        <p className="mt-2 text-sm text-ink/65">Se enviará un email de invitación y el perfil quedará como invitado.</p>
        <form action={inviteUser} className="mt-6 grid gap-4">
          <StatusMessage error={params.error} success={params.invited ? "Invitación enviada correctamente." : undefined} />
          <Field label="Nombre completo">
            <Input name="full_name" required />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" required />
          </Field>
          <Field label="Rol">
            <Select name="role" defaultValue="student">
              <option value="student">Alumno</option>
              <option value="teacher">Docente</option>
            </Select>
          </Field>
          <Field label="Curso opcional">
            <Select name="course_id" defaultValue="">
              <option value="">Sin curso</option>
              {(courses ?? []).map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </Select>
          </Field>
          <Button type="submit">Enviar invitación</Button>
        </form>
      </section>
    </AppShell>
  );
}
