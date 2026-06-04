import { AccountStatePage } from "@/components/account/account-state-page";

export default function IncompleteProfilePage() {
  return (
    <AccountStatePage
      eyebrow="Perfil incompleto"
      title="No encontramos tu perfil funcional"
      body="Tu usuario existe en autenticación, pero falta el perfil de EDUbit. Administración debe completarlo."
    />
  );
}
