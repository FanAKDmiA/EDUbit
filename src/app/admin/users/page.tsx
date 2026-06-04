import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { profileStatusLabel, roleLabel } from "@/types/roles";
import Link from "next/link";

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; role?: string; status?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole("admin");
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id,email,full_name,role,status,created_at,last_login_at")
    .order("created_at", { ascending: false });

  if (params.role && params.role !== "all") {
    query = query.eq("role", params.role);
  }

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  if (params.q) {
    query = query.or(`full_name.ilike.%${params.q}%,email.ilike.%${params.q}%`);
  }

  const { data: users } = await query;

  return (
    <AppShell profile={profile}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Usuarios</h1>
          <p className="mt-1 text-sm text-ink/65">Gestioná roles, estados e invitaciones.</p>
        </div>
        <Link className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" href="/admin/users/invite">
          Invitar usuario
        </Link>
      </div>

      <form className="mt-6 grid gap-3 rounded-md border border-ink/10 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_180px_auto]">
        <Field label="Buscar">
          <Input name="q" defaultValue={params.q ?? ""} placeholder="Nombre o email" />
        </Field>
        <Field label="Rol">
          <Select name="role" defaultValue={params.role ?? "all"}>
            <option value="all">Todos</option>
            <option value="admin">Administrador</option>
            <option value="teacher">Docente</option>
            <option value="student">Alumno</option>
          </Select>
        </Field>
        <Field label="Estado">
          <Select name="status" defaultValue={params.status ?? "all"}>
            <option value="all">Todos</option>
            {Object.entries(profileStatusLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" className="self-end">
          Filtrar
        </Button>
      </form>

      <div className="mt-6 overflow-hidden rounded-md border border-ink/10 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink text-white">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Email</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((user) => (
              <tr key={user.id} className="border-t border-ink/10">
                <td className="p-3 font-semibold">{user.full_name}</td>
                <td className="p-3 text-ink/70">{user.email}</td>
                <td className="p-3">{roleLabel[user.role as keyof typeof roleLabel]}</td>
                <td className="p-3">{profileStatusLabel[user.status as keyof typeof profileStatusLabel]}</td>
                <td className="p-3">
                  <Link className="font-semibold text-ink hover:text-mint" href={`/admin/users/${user.id}`}>
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
