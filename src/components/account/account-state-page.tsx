import { Button } from "@/components/ui/button";
import Image from "next/image";

export function AccountStatePage({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8f5] px-5 py-8 text-ink">
      <section className="w-full max-w-lg rounded-md border border-ink/10 bg-white p-6 text-center shadow-sm md:p-8">
        <Image src="/logo-edubit.png" alt="EDUbit" width={112} height={112} className="mx-auto h-28 w-28 object-contain" />
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-coral">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-ink/65">{body}</p>
        <form action="/logout" method="post" className="mt-6">
          <Button type="submit" variant="ghost">
            Cerrar sesión
          </Button>
        </form>
      </section>
    </main>
  );
}
