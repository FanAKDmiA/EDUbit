import { changeOwnPassword, updateOwnProfile } from "@/app/account/actions";
import { PasswordSubmitFields } from "@/components/auth/password-submit-fields";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { StatusMessage } from "@/components/ui/status-message";
import { requireUser } from "@/lib/auth/require-user";
import { profileStatusLabel, roleLabel } from "@/types/roles";
import { redirect } from "next/navigation";

const passwordErrors: Record<string, string> = {
  "invalid-password": "La contraseña debe cumplir todas las condiciones y coincidir con la confirmación."
};

export default async function AccountProfilePage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; updated?: string; password_error?: string; password_updated?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireUser();

  if (!profile) {
    redirect("/account/incomplete-profile");
  }

  const passwordError = params.password_error
    ? passwordErrors[params.password_error] || params.password_error
    : undefined;

  return (
    <AppShell profile={profile}>
      <div className="grid max-w-2xl gap-5">
        <section className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
          <h1 className="text-3xl font-black">Mi perfil</h1>
          <form action={updateOwnProfile} className="mt-6 grid gap-4">
            <StatusMessage
              error={params.error}
              success={params.updated ? "Perfil actualizado correctamente." : undefined}
            />
            <Field label="Nombre y apellido">
              <Input name="full_name" defaultValue={profile.full_name} required />
            </Field>
            <Field label="Email">
              <Input value={profile.email} readOnly />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Rol">
                <Input value={roleLabel[profile.role]} readOnly />
              </Field>
              <Field label="Estado">
                <Input value={profileStatusLabel[profile.status]} readOnly />
              </Field>
            </div>
            <Button type="submit">Guardar perfil</Button>
          </form>
        </section>

        <section className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black">Seguridad</h2>
          <p className="mt-2 text-sm text-ink/65">Cambiá tu contraseña sin guardar secretos en EDUbit.</p>
          <form action={changeOwnPassword} className="mt-6 grid gap-4">
            <StatusMessage
              error={passwordError}
              success={params.password_updated ? "Contraseña actualizada correctamente." : undefined}
            />
            <PasswordSubmitFields submitLabel="Actualizar contraseña" />
          </form>
        </section>
      </div>
    </AppShell>
  );
}
