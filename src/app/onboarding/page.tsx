import { completeOnboarding } from "@/app/account/actions";
import { PasswordSubmitFields } from "@/components/auth/password-submit-fields";
import { Field, Input } from "@/components/ui/field";
import { StatusMessage } from "@/components/ui/status-message";
import { requireUser } from "@/lib/auth/require-user";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function OnboardingPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireUser();

  if (!profile) {
    redirect("/account/incomplete-profile");
  }

  if (profile.status !== "invited") {
    redirect(profile.role === "admin" ? "/admin" : profile.role === "teacher" ? "/teacher" : "/student");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8f5] px-5 py-8 text-ink">
      <section className="w-full max-w-lg rounded-md border border-ink/10 bg-white p-6 shadow-sm md:p-8">
        <Image src="/logo-edubit.png" alt="EDUbit" width={112} height={112} className="mx-auto h-28 w-28 object-contain" />
        <h1 className="mt-5 text-center text-3xl font-black">Bienvenida/o a EDUbit</h1>
        <form action={completeOnboarding} className="mt-6 grid gap-4">
          <StatusMessage
            error={
              params.error
                ? "Completá nombre, contraseña válida, confirmación y aceptación de condiciones."
                : undefined
            }
          />
          <Field label="Nombre y apellido">
            <Input name="full_name" defaultValue={profile.full_name} required />
          </Field>
          <PasswordSubmitFields submitLabel="Completar onboarding" includeTerms />
        </form>
      </section>
    </main>
  );
}
