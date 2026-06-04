import { getUserProfile } from "@/lib/auth/get-user-profile";
import { roleHome } from "@/types/roles";
import Link from "next/link";

export default async function HomePage() {
  const { profile } = await getUserProfile();

  return (
    <main className="min-h-screen bg-[#f7f4ee]">
      <section className="mx-auto grid min-h-screen max-w-6xl content-center gap-10 px-5 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-coral">Plataforma educativa</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight tracking-normal text-ink md:text-7xl">
            EDUbit
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/72">
            Una base pública para enseñar economía digital y conceptos de blockchain con roles, cursos y datos persistentes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {profile ? (
              <Link
                href={roleHome[profile.role]}
                className="inline-flex min-h-11 items-center rounded-md bg-ink px-5 text-sm font-semibold text-white hover:bg-black"
              >
                Ir a mi panel
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center rounded-md bg-ink px-5 text-sm font-semibold text-white hover:bg-black"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
        <div className="grid gap-4">
          {[
            ["Admin", "Usuarios, cursos, docentes e inscripciones."],
            ["Docente", "Cursos propios y alumnos inscriptos."],
            ["Alumno", "Cursos propios y saldo EDUbit inicial."]
          ].map(([title, body]) => (
            <div key={title} className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-ink/65">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
