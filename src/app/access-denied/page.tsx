import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f4ee] px-5">
      <section className="max-w-lg rounded-md border border-ink/10 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-coral">Acceso denegado</p>
        <h1 className="mt-3 text-3xl font-black">No tenés permiso para ver esta sección.</h1>
        <p className="mt-3 text-sm leading-6 text-ink/65">
          Si tu rol cambió recientemente, cerrá sesión y volvé a entrar.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-10 items-center rounded-md bg-ink px-4 text-sm font-semibold text-white hover:bg-black"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
