import { changeOwnPassword } from "@/app/account/actions";
import { PasswordSubmitFields } from "@/components/auth/password-submit-fields";
import { AppShell } from "@/components/layout/app-shell";
import { StatusMessage } from "@/components/ui/status-message";
import { requireUser } from "@/lib/auth/require-user";
import { redirect } from "next/navigation";

const errors: Record<string, string> = {
  "invalid-password": "La contraseña debe cumplir todas las condiciones y coincidir con la confirmación."
};

export default async function AccountSecurityPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireUser();

  if (!profile) {
    redirect("/account/incomplete-profile");
  }

  const error = params.error ? errors[params.error] || params.error : undefined;

  return (
    <AppShell profile={profile}>
      <section className="max-w-2xl rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-black">Seguridad</h1>
        <p className="mt-2 text-sm text-ink/65">Cambiá tu contraseña sin guardar secretos en EDUbit.</p>
        <form action={changeOwnPassword} className="mt-6 grid gap-4">
          <StatusMessage error={error} success={params.updated ? "Contraseña actualizada correctamente." : undefined} />
          <PasswordSubmitFields submitLabel="Actualizar contraseña" />
        </form>
      </section>
    </AppShell>
  );
}
