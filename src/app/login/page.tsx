import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { StatusMessage } from "@/components/ui/status-message";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "./actions";

const messages: Record<string, string> = {
  "missing-fields": "Ingresá email y contraseña.",
  "invalid-credentials": "Las credenciales no son válidas."
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const error = params.error ? messages[params.error] || params.error : undefined;

  return (
    <main className="min-h-screen bg-[#f6f8f5] text-ink">
      <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-5 py-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex min-h-[520px] flex-col justify-between rounded-md border border-ink/10 bg-white px-6 py-7 shadow-sm md:px-10 md:py-9">
          <Link href="/" className="inline-flex w-fit items-center gap-3 text-sm font-bold text-ink/70 hover:text-ink">
            <Image src="/logo-edubit.png" alt="EDUbit" width={52} height={52} className="h-12 w-12 object-contain" priority />
            <span>EDUbit</span>
          </Link>

          <div className="py-10">
            <Image
              src="/logo-edubit.png"
              alt="Logo de EDUbit"
              width={260}
              height={260}
              className="mx-auto h-48 w-48 object-contain md:h-64 md:w-64"
              priority
            />
            <div className="mx-auto mt-8 max-w-xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-mint">Identidad digital educativa</p>
              <h1 className="mt-3 text-4xl font-black tracking-normal md:text-5xl">EDUbit</h1>
              <p className="mt-4 text-base leading-7 text-ink/65">
                Plataforma para administrar cursos, roles y experiencias pedagógicas inspiradas en blockchain.
              </p>
            </div>
          </div>

          <div className="grid gap-3 border-t border-ink/10 pt-5 text-sm text-ink/65 md:grid-cols-3">
            <span>Acceso administrado</span>
            <span>Supabase Auth</span>
            <span>Roles protegidos</span>
          </div>
        </div>

        <section className="rounded-md border border-ink/10 bg-white p-6 shadow-sm md:p-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-coral">Ingresar al campus</p>
            <h2 className="mt-3 text-3xl font-black">Iniciar sesión</h2>
            <p className="mt-2 text-sm leading-6 text-ink/65">
              Usá las credenciales creadas por administración para acceder a tu panel.
            </p>
          </div>

          <form action={signIn} className="mt-7 grid gap-4">
            <StatusMessage error={error} />
            <Field label="Email">
              <Input name="email" type="email" autoComplete="email" required />
            </Field>
            <Field label="Contraseña">
              <Input name="password" type="password" autoComplete="current-password" required />
            </Field>
            <Button type="submit" className="mt-2 w-full">
              Entrar
            </Button>
          </form>

          <div className="mt-6 grid gap-3 rounded-md border border-dashed border-ink/15 bg-[#f7f4ee] p-4 text-sm text-ink/70">
            <Link href="/forgot-password" className="font-semibold text-ink hover:text-mint">
              Olvidé mi contraseña
            </Link>
            <Link href="/request-access" className="font-semibold text-ink hover:text-mint">
              Solicitar alta a administración
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
