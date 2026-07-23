-- #669 Authoritative user-lab milestone evidence and versioned completion.

alter table public.user_lab_milestone_progress
  add constraint user_lab_milestone_progress_hash_format
  check (
    code_snapshot_hash is null
    or code_snapshot_hash ~ '^[0-9a-f]{64}$'
  ) not valid;

alter table public.user_lab_milestone_progress
  validate constraint user_lab_milestone_progress_hash_format;

alter table public.project_lab_progress
  add column if not exists content_version_id uuid;

create index if not exists project_lab_progress_user_item_version_idx
  on public.project_lab_progress (user_id, project_id, content_version_id);

comment on column public.project_lab_progress.content_version_id is
  'Immutable published version completed for a user-created lab; NULL for native/legacy project labs.';

create or replace function public.complete_user_lab_version(
  p_project_id text,
  p_content_version_id uuid,
  p_skill_id text,
  p_metadata jsonb
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_written_id public.project_lab_progress.id%type;
  v_valid_skill_id text;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if coalesce(p_project_id, '') = '' or p_content_version_id is null then
    raise exception 'invalid lab completion' using errcode = '22023';
  end if;

  insert into public.project_lab_progress (
    user_id,
    project_id,
    content_version_id,
    status,
    completed_at,
    updated_at
  ) values (
    v_user,
    p_project_id,
    p_content_version_id,
    'completed',
    now(),
    now()
  )
  on conflict (user_id, project_id) do update set
    content_version_id = excluded.content_version_id,
    status = 'completed',
    completed_at = excluded.completed_at,
    updated_at = excluded.updated_at
  where public.project_lab_progress.status is distinct from 'completed'
     or public.project_lab_progress.content_version_id is distinct from excluded.content_version_id
  returning public.project_lab_progress.id into v_written_id;

  if v_written_id is null then
    return 'already_completed';
  end if;

  select s.id
    into v_valid_skill_id
    from public.skills s
    where s.id = p_skill_id;

  insert into public.skill_events (
    user_id,
    skill_id,
    event_type,
    metadata
  ) values (
    v_user,
    v_valid_skill_id,
    'completion_submitted',
    coalesce(p_metadata, '{}'::jsonb)
      || jsonb_build_object(
        'project_id', p_project_id,
        'contentVersionId', p_content_version_id,
        'source', 'user_lab',
        'scope', 'project'
      )
  );

  return 'completed';
end;
$$;

revoke all on function public.complete_user_lab_version(text, uuid, text, jsonb)
  from public;
grant execute on function public.complete_user_lab_version(text, uuid, text, jsonb)
  to authenticated;
