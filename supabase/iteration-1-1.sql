do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'status'
  ) then
    alter table public.profiles
      add column status text not null default 'pending' check (status in ('active', 'invited', 'pending', 'blocked', 'disabled'));

    update public.profiles set status = 'active';
  end if;
end $$;

alter table public.profiles
  add column if not exists updated_at timestamptz default now(),
  add column if not exists last_login_at timestamptz,
  add column if not exists created_by uuid references public.profiles(id),
  add column if not exists updated_by uuid references public.profiles(id);

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  requested_role text not null check (requested_role in ('teacher', 'student')),
  institution text,
  course_reference text,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  review_notes text,
  created_user_id uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists access_requests_one_pending_email_idx
  on public.access_requests (lower(email))
  where status = 'pending';

create index if not exists access_requests_status_idx on public.access_requests(status);
create index if not exists access_requests_created_at_idx on public.access_requests(created_at);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id),
  target_user_id uuid references public.profiles(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists audit_logs_actor_user_id_idx on public.audit_logs(actor_user_id);
create index if not exists audit_logs_target_user_id_idx on public.audit_logs(target_user_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at);

alter table public.access_requests enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists access_requests_touch_updated_at on public.access_requests;
create trigger access_requests_touch_updated_at
before update on public.access_requests
for each row execute function public.touch_updated_at();

drop policy if exists "profiles_select_by_role" on public.profiles;
create policy "profiles_select_by_role"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
  or public.teacher_has_student(profiles.id)
);

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "profiles_update_self_basic" on public.profiles;

drop policy if exists "access_requests_insert_public" on public.access_requests;
create policy "access_requests_insert_public"
on public.access_requests
for insert
to anon, authenticated
with check (status = 'pending' and reviewed_by is null and reviewed_at is null and created_user_id is null);

drop policy if exists "access_requests_select_admin" on public.access_requests;
create policy "access_requests_select_admin"
on public.access_requests
for select
to authenticated
using (public.is_admin());

drop policy if exists "access_requests_update_admin" on public.access_requests;
create policy "access_requests_update_admin"
on public.access_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "audit_logs_select_admin" on public.audit_logs;
create policy "audit_logs_select_admin"
on public.audit_logs
for select
to authenticated
using (public.is_admin());

-- No insert/update/delete policies for audit_logs: writes are performed server-side with service role.

-- Existing Iteration 1 users are marked active only when the status column is created.
-- New profiles default to pending unless server-side flows explicitly set active/invited.
