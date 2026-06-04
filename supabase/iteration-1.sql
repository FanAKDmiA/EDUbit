create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null check (role in ('admin', 'teacher', 'student')),
  created_at timestamptz default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  teacher_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.course_memberships (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (course_id, student_id)
);

create index if not exists courses_teacher_id_idx on public.courses(teacher_id);
create index if not exists course_memberships_course_id_idx on public.course_memberships(course_id);
create index if not exists course_memberships_student_id_idx on public.course_memberships(student_id);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_memberships enable row level security;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false)
$$;

create or replace function public.teacher_has_student(student_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.course_memberships cm
    join public.courses c on c.id = cm.course_id
    where c.teacher_id = auth.uid()
      and cm.student_id = student_profile_id
  )
$$;

create or replace function public.student_has_course(course_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.course_memberships cm
    where cm.course_id = course_profile_id
      and cm.student_id = auth.uid()
  )
$$;

create or replace function public.teacher_has_course(course_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.courses c
    where c.id = course_profile_id
      and c.teacher_id = auth.uid()
  )
$$;

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

drop policy if exists "profiles_insert_admin" on public.profiles;
create policy "profiles_insert_admin"
on public.profiles
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "courses_select_by_role" on public.courses;
create policy "courses_select_by_role"
on public.courses
for select
to authenticated
using (
  public.is_admin()
  or teacher_id = auth.uid()
  or public.student_has_course(courses.id)
);

drop policy if exists "courses_insert_admin" on public.courses;
create policy "courses_insert_admin"
on public.courses
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "courses_update_admin" on public.courses;
create policy "courses_update_admin"
on public.courses
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "courses_delete_admin" on public.courses;
create policy "courses_delete_admin"
on public.courses
for delete
to authenticated
using (public.is_admin());

drop policy if exists "memberships_select_by_role" on public.course_memberships;
create policy "memberships_select_by_role"
on public.course_memberships
for select
to authenticated
using (
  public.is_admin()
  or student_id = auth.uid()
  or public.teacher_has_course(course_memberships.course_id)
);

drop policy if exists "memberships_insert_admin" on public.course_memberships;
create policy "memberships_insert_admin"
on public.course_memberships
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "memberships_update_admin" on public.course_memberships;
create policy "memberships_update_admin"
on public.course_memberships
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "memberships_delete_admin" on public.course_memberships;
create policy "memberships_delete_admin"
on public.course_memberships
for delete
to authenticated
using (public.is_admin());

-- Primer administrador:
-- 1. Crear un usuario en Supabase Auth desde el dashboard.
-- 2. Copiar su UUID y ejecutar:
-- insert into public.profiles (id, email, full_name, role)
-- values ('UUID_DEL_USUARIO', 'admin@edubit.local', 'Administrador EDUbit', 'admin');
