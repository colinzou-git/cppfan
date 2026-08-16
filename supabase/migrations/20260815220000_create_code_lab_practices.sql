-- #674 Explicit, named Code Lab practices attached to lesson Code Labs.
--
-- Practices are intentionally separate from:
--   * code_lab_drafts   (automatic working/resume state)
--   * code_lab_attempts (execution/test history and learning evidence)
--
-- The canonical cppFan sample is snapshotted at INSERT time. Creation identity
-- is immutable so an old practice always retains the exact standard code it was
-- created against even after the lesson changes.

create table if not exists public.code_lab_practices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  learning_item_id text not null,
  name text not null,
  source_code text not null,
  language text not null default 'cpp',
  skill_ids text[] not null default '{}',
  content_version_id uuid,
  lesson_source_version text not null,
  standard_source_code_snapshot text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint code_lab_practices_name_nonempty check (char_length(trim(name)) between 1 and 100),
  constraint code_lab_practices_cpp_only check (language = 'cpp')
);

create index if not exists code_lab_practices_user_item_updated_idx
  on public.code_lab_practices (user_id, learning_item_id, updated_at desc);

create index if not exists code_lab_practices_user_id_idx
  on public.code_lab_practices (user_id, id);

alter table public.code_lab_practices enable row level security;

drop policy if exists "learners read own code lab practices" on public.code_lab_practices;
create policy "learners read own code lab practices"
  on public.code_lab_practices for select
  using (auth.uid() = user_id);

drop policy if exists "learners insert own code lab practices" on public.code_lab_practices;
create policy "learners insert own code lab practices"
  on public.code_lab_practices for insert
  with check (auth.uid() = user_id);

drop policy if exists "learners update own code lab practices" on public.code_lab_practices;
create policy "learners update own code lab practices"
  on public.code_lab_practices for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "learners delete own code lab practices" on public.code_lab_practices;
create policy "learners delete own code lab practices"
  on public.code_lab_practices for delete
  using (auth.uid() = user_id);

-- Preserve the creation-time lesson/sample association even for direct
-- authenticated PostgREST writes. Application PATCH also updates only name and
-- source, but this trigger makes the historical invariant database-authoritative.
create or replace function public.protect_code_lab_practice_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.user_id is distinct from old.user_id
     or new.learning_item_id is distinct from old.learning_item_id
     or new.language is distinct from old.language
     or new.skill_ids is distinct from old.skill_ids
     or new.content_version_id is distinct from old.content_version_id
     or new.lesson_source_version is distinct from old.lesson_source_version
     or new.standard_source_code_snapshot is distinct from old.standard_source_code_snapshot
     or new.created_at is distinct from old.created_at then
    raise exception 'code_lab_practice creation identity is immutable';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_code_lab_practice_identity_trigger on public.code_lab_practices;
create trigger protect_code_lab_practice_identity_trigger
before update on public.code_lab_practices
for each row execute function public.protect_code_lab_practice_identity();

revoke all on table public.code_lab_practices from anon;
grant select, insert, update, delete on table public.code_lab_practices to authenticated;
grant select, insert, update, delete on table public.code_lab_practices to service_role;

comment on table public.code_lab_practices is
  'Explicit named learner Code Lab practices (#674), separate from drafts and attempts; historical cppFan sample is immutable.';
comment on column public.code_lab_practices.standard_source_code_snapshot is
  'Exact canonical cppFan starter/sample source at practice creation; immutable historical reference (#674).';
