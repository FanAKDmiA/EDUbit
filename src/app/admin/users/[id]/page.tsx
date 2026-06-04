import { forcePasswordReset, updateUserAdmin } from "@/app/admin/actions";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { StatusMessage } from "@/components/ui/status-message";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { profileStatusLabel } from "@/types/roles";
import { notFound } from "next/navigation";

export default async function AdminUserDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; updated?: string; reset?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { profile } = await requireRole("admin");
  const supabase = await createClient();
  const { data: user } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,status,created_at,updated_at,last_login_at")
    .eq("id", id)
    .single();

  if (!user) {
    notFound();
  }

  return (
    <AppShell profile={profile}>
      <section className="max-w-2xl rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-black">Detalle de usuario</h1>
        <form action={updateUserAdmin} className="mt-6 grid gap-4">
          <StatusMessage
            error={query.error}
            success={
              query.updated ? "Usuario actualizado correctamente." : query.reset ? "Reset de contraseña solicitado." : undefined
            }
          />
          <input type="hidden" name="user_id" value={user.id} />
          <Field label="Nombre completo">
            <Input name="full_name" defaultValue={user.full_name} required />
          </Field>
          <Field label="Email">
            <Input value={user.email} readOnly />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Rol">
              <Select name="role" defaultValue={user.role}>
                <option value="admin">Administrador</option>
                <option value="teacher">Docente</option>
                <option value="student">Alumno</option>
              </Select>
            </Field>
            <Field label="Estado">
              <Select name="status" defaultValue={user.status}>
                {Object.entries(profileStatusLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button type="submit">Guardar cambios</Button>
        </form>
        <form action={forcePasswordReset} className="mt-4">
          <input type="hidden" name="user_id" value={user.id} />
          <input type="hidden" name="email" value={user.email} />
          <Button type="submit" variant="ghost">
            Forzar reset de contraseña
          </Button>
        </form>
      </section>
    </AppShell>
  );
}
