import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { StatusMessage } from "@/components/ui/status-message";
import Image from "next/image";
import Link from "next/link";
import { submitAccessRequest } from "./actions";

const errors: Record<string, string> = {
  "invalid-request": "Completá nombre, email válido y rol solicitado.",
  "duplicate-request": "Ya existe una solicitud pendiente para ese email.",
  "request-failed": "No pudimos registrar la solicitud. Intentá nuevamente."
};

export default async function RequestAccessPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? errors[params.error] || params.error : undefined;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8f5] px-5 py-8 text-ink">
      <section className="w-full max-w-2xl rounded-md border border-ink/10 bg-white p-6 shadow-sm md:p-8">
        <Image src="/logo-edubit.png" alt="EDUbit" width={112} height={112} className="mx-auto h-28 w-28 object-contain" />
        <p className="mt-5 text-center text-sm font-bold uppercase tracking-[0.18em] text-coral">Solicitud de alta</p>
        <h1 className="mt-3 text-center text-3xl font-black">Solicitar acceso</h1>
        <p className="mt-3 text-center text-sm leading-6 text-ink/65">
          Tu solicitud quedará pendiente hasta que una persona administradora la revise.
        </p>
        <form action={submitAccessRequest} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <StatusMessage
              error={error}
              success={params.sent ? "Solicitud enviada. Administración revisará tu pedido." : undefined}
            />
          </div>
          <Field label="Nombre y apellido">
            <Input name="full_name" required />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" autoComplete="email" required />
          </Field>
          <Field label="Rol solicitado">
            <Select name="requested_role" defaultValue="student">
              <option value="student">Alumno</option>
              <option value="teacher">Docente</option>
            </Select>
          </Field>
          <Field label="Escuela / institución">
            <Input name="institution" />
          </Field>
          <Field label="Curso o división">
            <Input name="course_reference" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Motivo o comentario">
              <Textarea name="message" />
            </Field>
          </div>
          <Button type="submit" className="md:col-span-2">
            Enviar solicitud
          </Button>
        </form>
        <Link href="/login" className="mt-6 inline-flex text-sm font-semibold text-ink hover:text-mint">
          Volver al login
        </Link>
      </section>
    </main>
  );
}
