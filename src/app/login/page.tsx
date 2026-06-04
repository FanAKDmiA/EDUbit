import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { StatusMessage } from "@/components/ui/status-message";
import { signIn } from "./actions";
import Link from "next/link";

const messages: Record<string, string> = {
  "missing-fields": "Ingresá email y contraseña.",
  "invalid-credentials": "Las credenciales no son válidas."
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const error = params.error ? messages[params.error] || params.error : undefined;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f4ee] px-5">
      <section className="w-full max-w-md rounded-md border border-ink/10 bg-white p-6 shadow-sm">
        <Link href="/" className="text-xl font-black">
          EDUbit
        </Link>
        <h1 className="mt-6 text-2xl font-black">Iniciar sesión</h1>
        <p className="mt-2 text-sm leading-6 text-ink/65">Accedé con tu email y contraseña de Supabase Auth.</p>
        <form action={signIn} className="mt-6 grid gap-4">
          <StatusMessage error={error} />
          <Field label="Email">
            <Input name="email" type="email" autoComplete="email" required />
          </Field>
          <Field label="Contraseña">
            <Input name="password" type="password" autoComplete="current-password" required />
          </Field>
          <Button type="submit">Entrar</Button>
        </form>
      </section>
    </main>
  );
}
