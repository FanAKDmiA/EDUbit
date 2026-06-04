import { AccountStatePage } from "@/components/account/account-state-page";

export default function BlockedAccountPage() {
  return (
    <AccountStatePage
      eyebrow="Cuenta bloqueada"
      title="Tu acceso está bloqueado"
      body="Por seguridad, esta cuenta no puede acceder a los paneles. Contactá a administración para revisar la situación."
    />
  );
}
