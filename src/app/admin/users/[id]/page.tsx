import {
  deleteUserAdmin,
  forcePasswordReset,
  generateInvitationLink,
  resendInvitation,
  updateUserAdmin
} from "@/app/admin/actions";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { Field, Input, Select } from "@/components/ui/field";
import { StatusMessage } from "@/components/ui/status-message";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { profileStatusLabel } from "@/types/roles";
import { notFound } from "next/navigation";

export default async function AdminUserDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    updated?: string;
    reset?: string;
    resent?: string;
    deleted?: string;
    invite_link?: string;
  }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { profile } = await requireRole("admin");
  const supabase = createAdminClient();
  const { data: user } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,status,created_at,updated_at,last_login_at")
    .eq("id", id)
    .single();

  if (!user) {
    notFound();
  }

  const success = query.updated
    ? "Usuario actualizado correctamente."
    : query.reset
      ? "Reset de contraseña solicitado."
      : query.resent
        ? "Email de acceso reenviado correctamente."
        : query.deleted
          ? "Usuario eliminado correctamente."
          : undefined;

  return (
    <AppShell profile={profile}>
      <section className="max-w-2xl rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-black">Detalle de usuario</h1>
        {query.invite_link ? (
          <div className="mt-5 rounded-md border border-mint/40 bg-mint/10 p-4">
            <p className="text-sm font-semibold text-[#12604f]">Link de invitación generado</p>
            <input className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-xs" readOnly value={query.invite_link} />
            <p className="mt-2 text-xs text-ink/60">
              Copiá este link y envialo por un canal privado. El link permite completar el onboarding.
            </p>
          </div>
        ) : null}
        <form action={updateUserAdmin} className="mt-6 grid gap-4">
          <StatusMessage error={query.error} success={success} />
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

        <div className="mt-4 flex flex-wrap gap-3">
          <form action={forcePasswordReset}>
            <input type="hidden" name="user_id" value={user.id} />
            <input type="hidden" name="email" value={user.email} />
            <Button type="submit" variant="ghost">
              Forzar reset de contraseña
            </Button>
          </form>
          <form action={resendInvitation}>
            <input type="hidden" name="user_id" value={user.id} />
            <input type="hidden" name="email" value={user.email} />
            <input type="hidden" name="full_name" value={user.full_name} />
            <input type="hidden" name="role" value={user.role} />
            <input type="hidden" name="return_to" value={`/admin/users/${user.id}`} />
            <Button type="submit" variant="secondary">
              Reenviar acceso
            </Button>
          </form>
          <form action={generateInvitationLink}>
            <input type="hidden" name="user_id" value={user.id} />
            <input type="hidden" name="email" value={user.email} />
            <input type="hidden" name="full_name" value={user.full_name} />
            <input type="hidden" name="role" value={user.role} />
            <input type="hidden" name="return_to" value={`/admin/users/${user.id}`} />
            <Button type="submit" variant="ghost">
              Generar link de acceso
            </Button>
          </form>
        </div>

        <div className="mt-8 rounded-md border border-red-300 bg-red-50 p-4">
          <h2 className="text-lg font-black text-red-900">Zona crítica</h2>
          <p className="mt-1 text-sm leading-6 text-red-900/75">
            Eliminar usuario borra físicamente la cuenta, su perfil, solicitudes asociadas y referencias internas. Esta acción no se puede deshacer.
          </p>
          {profile.id === user.id ? (
            <p className="mt-4 text-sm font-semibold text-red-900">No podés eliminar tu propio usuario mientras estás logueado.</p>
          ) : (
            <form action={deleteUserAdmin} className="mt-4">
              <input type="hidden" name="user_id" value={user.id} />
              <input type="hidden" name="return_to" value="/admin/users" />
              <ConfirmSubmitButton
                type="submit"
                variant="ghost"
                className="border-red-700 bg-red-700 text-white hover:bg-red-800"
                message={`Vas a eliminar físicamente a ${user.email}, su usuario, su solicitud y sus registros asociados. Esta acción no se puede deshacer. ¿Continuar?`}
              >
                Eliminar usuario definitivamente
              </ConfirmSubmitButton>
            </form>
          )}
        </div>
      </section>
    </AppShell>
  );
}
