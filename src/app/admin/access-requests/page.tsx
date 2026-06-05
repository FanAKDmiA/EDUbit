import {
  approveAccessRequest,
  deleteUserAdmin,
  generateInvitationLink,
  rejectAccessRequest,
  resendInvitation
} from "@/app/admin/actions";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Textarea } from "@/components/ui/field";
import { StatusMessage } from "@/components/ui/status-message";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { roleLabel } from "@/types/roles";

export default async function AdminAccessRequestsPage({
  searchParams
}: {
  searchParams: Promise<{
    error?: string;
    approved?: string;
    rejected?: string;
    resent?: string;
    deleted?: string;
    invite_link?: string;
  }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole("admin");
  const supabase = createAdminClient();
  const { data: requests } = await supabase
    .from("access_requests")
    .select("*, created_user:profiles!access_requests_created_user_id_fkey(id,email,full_name,role,status)")
    .order("created_at", { ascending: false });

  const visibleRequests = (requests ?? []).filter((request) => {
    const createdUser = Array.isArray(request.created_user) ? request.created_user[0] : request.created_user;
    return request.status !== "approved" || createdUser?.status !== "active";
  });

  return (
    <AppShell profile={profile}>
      <h1 className="text-3xl font-black">Solicitudes de acceso</h1>
      <div className="mt-4">
        <StatusMessage
          error={params.error}
          success={
            params.approved
              ? "Solicitud aprobada e invitación enviada."
              : params.rejected
                ? "Solicitud rechazada correctamente."
                : params.resent
                  ? "Email de acceso reenviado correctamente."
                    : params.deleted
                      ? "Invitado eliminado correctamente."
                      : undefined
          }
        />
      </div>
      {params.invite_link ? (
        <div className="mt-4 rounded-md border border-mint/40 bg-mint/10 p-4">
          <p className="text-sm font-semibold text-[#12604f]">Link de invitación generado</p>
          <input className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-xs" readOnly value={params.invite_link} />
          <p className="mt-2 text-xs text-ink/60">
            Copiá este link y envialo por un canal privado. El link permite completar el onboarding.
          </p>
        </div>
      ) : null}
      <div className="mt-6 grid gap-4">
        {visibleRequests.length === 0 ? (
          <EmptyState title="Sin solicitudes" body="Cuando alguien solicite acceso, aparecerá en esta vista." />
        ) : (
          visibleRequests.map((request) => {
            const createdUser = Array.isArray(request.created_user)
              ? request.created_user[0]
              : request.created_user;

            return (
              <article key={request.id} className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black">{request.full_name}</h2>
                    <p className="text-sm text-ink/65">{request.email}</p>
                    <p className="mt-2 text-sm">
                      Rol solicitado:{" "}
                      <span className="font-semibold">
                        {roleLabel[request.requested_role as keyof typeof roleLabel]}
                      </span>
                    </p>
                    <p className="text-sm text-ink/65">Estado: {request.status}</p>
                    {createdUser ? <p className="text-sm text-ink/65">Usuario: {createdUser.status}</p> : null}
                    {request.institution ? (
                      <p className="text-sm text-ink/65">Institución: {request.institution}</p>
                    ) : null}
                    {request.course_reference ? (
                      <p className="text-sm text-ink/65">Curso: {request.course_reference}</p>
                    ) : null}
                    {request.message ? <p className="mt-3 text-sm leading-6 text-ink/75">{request.message}</p> : null}
                  </div>
                </div>
                {request.status === "pending" ? (
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <form action={approveAccessRequest} className="grid gap-3 rounded-md bg-[#f7f4ee] p-3">
                      <input type="hidden" name="request_id" value={request.id} />
                      <Field label="Notas de aprobación">
                        <Textarea name="review_notes" />
                      </Field>
                      <Button type="submit">Aprobar e invitar</Button>
                    </form>
                    <form action={rejectAccessRequest} className="grid gap-3 rounded-md bg-[#f7f4ee] p-3">
                      <input type="hidden" name="request_id" value={request.id} />
                      <Field label="Motivo de rechazo">
                        <Textarea name="review_notes" />
                      </Field>
                      <Button type="submit" variant="ghost">
                        Rechazar
                      </Button>
                    </form>
                  </div>
                ) : null}
                {request.status === "approved" && createdUser ? (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <form action={resendInvitation}>
                      <input type="hidden" name="user_id" value={createdUser.id} />
                      <input type="hidden" name="email" value={createdUser.email} />
                      <input type="hidden" name="full_name" value={createdUser.full_name} />
                      <input type="hidden" name="role" value={createdUser.role} />
                      <input type="hidden" name="return_to" value="/admin/access-requests" />
                      <Button type="submit" variant="secondary">
                        Reenviar acceso
                      </Button>
                    </form>
                    <form action={generateInvitationLink}>
                      <input type="hidden" name="user_id" value={createdUser.id} />
                      <input type="hidden" name="email" value={createdUser.email} />
                      <input type="hidden" name="full_name" value={createdUser.full_name} />
                      <input type="hidden" name="role" value={createdUser.role} />
                      <input type="hidden" name="return_to" value="/admin/access-requests" />
                      <Button type="submit" variant="ghost">
                        Generar link de acceso
                      </Button>
                    </form>
                    <form action={deleteUserAdmin}>
                        <input type="hidden" name="user_id" value={createdUser.id} />
                        <input type="hidden" name="return_to" value="/admin/access-requests" />
                        <ConfirmSubmitButton
                          type="submit"
                          variant="ghost"
                          message={`Vas a eliminar fisicamente a ${createdUser.email}, su usuario, su solicitud y sus registros asociados. Esta accion no se puede deshacer. ¿Continuar?`}
                        >
                          Eliminar usuario
                        </ConfirmSubmitButton>
                      </form>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
