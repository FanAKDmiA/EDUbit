import { createManagedUser } from "@/app/admin/actions";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { StatusMessage } from "@/components/ui/status-message";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { roleLabel } from "@/types/roles";

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole("admin");
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,created_at")
    .order("created_at", { ascending: false });

  return (
    <AppShell profile={profile}>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <section className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-black">Crear usuario</h1>
          <form action={createManagedUser} className="mt-5 grid gap-4">
            <StatusMessage
              error={params.error}
              success={params.created ? "Usuario creado correctamente." : undefined}
            />
            <Field label="Nombre completo">
              <Input name="full_name" required />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" required />
            </Field>
            <Field label="Contraseña inicial">
              <Input name="password" type="password" minLength={6} required />
            </Field>
            <Field label="Rol">
              <Select name="role" defaultValue="student">
                <option value="student">Alumno</option>
                <option value="teacher">Docente</option>
              </Select>
            </Field>
            <Button type="submit">Crear usuario</Button>
          </form>
        </section>

        <section>
          <h2 className="text-2xl font-black">Usuarios</h2>
          <div className="mt-4 overflow-hidden rounded-md border border-ink/10 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink text-white">
                <tr>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Rol</th>
                </tr>
              </thead>
              <tbody>
                {(users ?? []).map((user) => (
                  <tr key={user.id} className="border-t border-ink/10">
                    <td className="p-3 font-semibold">{user.full_name}</td>
                    <td className="p-3 text-ink/70">{user.email}</td>
                    <td className="p-3">{roleLabel[user.role as keyof typeof roleLabel]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
