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
