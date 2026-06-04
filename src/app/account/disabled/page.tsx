import { AccountStatePage } from "@/components/account/account-state-page";

export default function DisabledAccountPage() {
  return (
    <AccountStatePage
      eyebrow="Cuenta deshabilitada"
      title="Tu cuenta no está activa"
      body="Esta cuenta fue dada de baja lógicamente. Si creés que es un error, contactá a administración."
    />
  );
}
