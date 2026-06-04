import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { StatusMessage } from "@/components/ui/status-message";
import Image from "next/image";
import Link from "next/link";
import { requestPasswordReset } from "./actions";

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8f5] px-5 py-8 text-ink">
      <section className="w-full max-w-lg rounded-md border border-ink/10 bg-white p-6 shadow-sm md:p-8">
        <Image src="/logo-edubit.png" alt="EDUbit" width={112} height={112} className="mx-auto h-28 w-28 object-contain" />
        <p className="mt-5 text-center text-sm font-bold uppercase tracking-[0.18em] text-mint">Recuperación de acceso</p>
        <h1 className="mt-3 text-center text-3xl font-black">Olvidé mi contraseña</h1>
        <p className="mt-3 text-center text-sm leading-6 text-ink/65">
          Ingresá tu email. Si corresponde a una cuenta registrada, recibirás instrucciones para recuperar el acceso.
        </p>
        <form action={requestPasswordReset} className="mt-6 grid gap-4">
          <StatusMessage
            success={
              params.sent
                ? "Si el correo corresponde a una cuenta registrada, recibirás instrucciones para recuperar el acceso."
                : undefined
            }
          />
          <Field label="Email">
            <Input name="email" type="email" autoComplete="email" required />
          </Field>
          <Button type="submit">Enviar instrucciones</Button>
        </form>
        <Link href="/login" className="mt-6 inline-flex text-sm font-semibold text-ink hover:text-mint">
          Volver al login
        </Link>
      </section>
    </main>
  );
}
