import { createAdminClient } from "@/lib/supabase/admin";

type AuditInput = {
  actorUserId?: string | null;
  targetUserId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function logAuditEvent(input: AuditInput) {
  const supabase = createAdminClient();

  await supabase.from("audit_logs").insert({
    actor_user_id: input.actorUserId ?? null,
    target_user_id: input.targetUserId ?? null,
    action: input.action,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? null
  });
}
