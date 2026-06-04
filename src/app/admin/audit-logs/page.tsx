import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminAuditLogsPage() {
  const { profile } = await requireRole("admin");
  const supabase = createAdminClient();
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id,actor_user_id,target_user_id,action,entity_type,entity_id,metadata,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <AppShell profile={profile}>
      <h1 className="text-3xl font-black">Auditoría</h1>
      <p className="mt-2 text-sm text-ink/65">Últimos eventos de seguridad y administración.</p>
      <div className="mt-6 overflow-hidden rounded-md border border-ink/10 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink text-white">
            <tr>
              <th className="p-3">Fecha</th>
              <th className="p-3">Acción</th>
              <th className="p-3">Entidad</th>
              <th className="p-3">Metadata</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map((log) => (
              <tr key={log.id} className="border-t border-ink/10 align-top">
                <td className="p-3 text-ink/65">{new Date(log.created_at).toLocaleString("es-AR")}</td>
                <td className="p-3 font-semibold">{log.action}</td>
                <td className="p-3 text-ink/70">
                  {log.entity_type || "-"} {log.entity_id ? `(${log.entity_id.slice(0, 8)})` : ""}
                </td>
                <td className="p-3 text-ink/65">{log.metadata ? <code>{JSON.stringify(log.metadata)}</code> : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
