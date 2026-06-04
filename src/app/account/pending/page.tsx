import { AccountStatePage } from "@/components/account/account-state-page";

export default function PendingAccountPage() {
  return (
    <AccountStatePage
      eyebrow="Cuenta pendiente"
      title="Tu acceso está en revisión"
      body="Administración debe activar tu perfil antes de que puedas ingresar al panel correspondiente."
    />
  );
}
