"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function AuthConfirmPage() {
  const [message, setMessage] = useState("Validando enlace de acceso...");

  useEffect(() => {
    async function confirmSession() {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const searchParams = new URLSearchParams(window.location.search);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const next = searchParams.get("next") || "/onboarding";

      if (!accessToken || !refreshToken) {
        setMessage("El enlace es inválido o expiró. Solicitá una nueva invitación.");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) {
        setMessage("No pudimos validar el enlace. Solicitá una nueva invitación.");
        return;
      }

      window.location.replace(next);
    }

    void confirmSession();
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8f5] px-5 py-8 text-ink">
      <section className="w-full max-w-lg rounded-md border border-ink/10 bg-white p-6 text-center shadow-sm md:p-8">
        <Image src="/logo-edubit.png" alt="EDUbit" width={112} height={112} className="mx-auto h-28 w-28 object-contain" />
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-mint">Acceso EDUbit</p>
        <h1 className="mt-3 text-3xl font-black">Confirmando enlace</h1>
        <p className="mt-3 text-sm leading-6 text-ink/65">{message}</p>
      </section>
    </main>
  );
}
