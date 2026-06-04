import { PasswordSubmitFields } from "@/components/auth/password-submit-fields";
import { StatusMessage } from "@/components/ui/status-message";
import Image from "next/image";
import Link from "next/link";
import { updatePassword } from "./actions";

const errors: Record<string, string> = {
  "invalid-password": "La contraseña debe cumplir todas las condiciones y coincidir con la confirmación.",
  "invalid-token": "El enlace de recuperación es inválido o expiró. Solicitá uno nuevo."
};

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? errors[params.error] || params.error : undefined;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8f5] px-5 py-8 text-ink">
      <section className="w-full max-w-lg rounded-md border border-ink/10 bg-white p-6 shadow-sm md:p-8">
        <Image src="/logo-edubit.png" alt="EDUbit" width={112} height={112} className="mx-auto h-28 w-28 object-contain" />
        <p className="mt-5 text-center text-sm font-bold uppercase tracking-[0.18em] text-mint">Nueva contraseña</p>
        <h1 className="mt-3 text-center text-3xl font-black">Restablecer acceso</h1>
        <form action={updatePassword} className="mt-6 grid gap-4">
          <StatusMessage error={error} success={params.updated ? "Contraseña actualizada correctamente." : undefined} />
          <PasswordSubmitFields submitLabel="Actualizar contraseña" />
        </form>
        <Link href="/login" className="mt-6 inline-flex text-sm font-semibold text-ink hover:text-mint">
          Volver al login
        </Link>
      </section>
    </main>
  );
}
