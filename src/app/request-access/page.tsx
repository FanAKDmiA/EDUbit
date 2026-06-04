import Image from "next/image";
import Link from "next/link";

export default function RequestAccessPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8f5] px-5 py-8 text-ink">
      <section className="w-full max-w-lg rounded-md border border-ink/10 bg-white p-6 text-center shadow-sm md:p-8">
        <Image src="/logo-edubit.png" alt="EDUbit" width={112} height={112} className="mx-auto h-28 w-28 object-contain" />
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-coral">Solicitud de alta</p>
        <h1 className="mt-3 text-3xl font-black">Solicitar acceso</h1>
        <p className="mt-3 text-sm leading-6 text-ink/65">
          El alta de usuarios sigue siendo administrada. Pedí a una persona administradora que cree tu usuario como docente o alumno.
        </p>
        <Link href="/login" className="mt-6 inline-flex min-h-10 items-center rounded-md bg-ink px-4 text-sm font-semibold text-white hover:bg-black">
          Volver al login
        </Link>
      </section>
    </main>
  );
}
