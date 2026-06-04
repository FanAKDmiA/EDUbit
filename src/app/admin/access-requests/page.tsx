import { approveAccessRequest, rejectAccessRequest } from "@/app/admin/actions";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Textarea } from "@/components/ui/field";
import { StatusMessage } from "@/components/ui/status-message";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { roleLabel } from "@/types/roles";

export default async function AdminAccessRequestsPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; approved?: string; rejected?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole("admin");
  const supabase = createAdminClient();
  const { data: requests } = await supabase
    .from("access_requests")
    .select("*")
    .order("created_at", { ascending: false });

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
                : undefined
          }
        />
      </div>
      <div className="mt-6 grid gap-4">
        {(requests ?? []).length === 0 ? (
          <EmptyState title="Sin solicitudes" body="Cuando alguien solicite acceso, aparecerá en esta vista." />
        ) : (
          (requests ?? []).map((request) => (
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
            </article>
          ))
        )}
      </div>
    </AppShell>
  );
}
