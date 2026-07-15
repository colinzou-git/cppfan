-- #488 Phase 2: owner-owned flat exercise groups. A user-created exercise may be
-- assigned (via its payload groupId) to a native exercise group or one of these
-- custom flat groups. No nesting. Owner-only RLS. On delete, an exercise whose
-- payload still references the group is treated as ungrouped at read time (the
-- payload is an immutable version snapshot and is never mutated here).

create table if not exists public.user_exercise_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_exercise_groups_user_idx
  on public.user_exercise_groups(user_id, order_index);

alter table public.user_exercise_groups enable row level security;

drop policy if exists "owners read own exercise groups" on public.user_exercise_groups;
create policy "owners read own exercise groups"
  on public.user_exercise_groups for select using (auth.uid() = user_id);
drop policy if exists "owners insert own exercise groups" on public.user_exercise_groups;
create policy "owners insert own exercise groups"
  on public.user_exercise_groups for insert with check (auth.uid() = user_id);
drop policy if exists "owners update own exercise groups" on public.user_exercise_groups;
create policy "owners update own exercise groups"
  on public.user_exercise_groups for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "owners delete own exercise groups" on public.user_exercise_groups;
create policy "owners delete own exercise groups"
  on public.user_exercise_groups for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.user_exercise_groups to authenticated;

comment on table public.user_exercise_groups is
  'Owner-owned flat groups for user-created exercises (#488). No nesting; owner-only RLS.';
