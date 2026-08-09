-- #668 Reliable interactive Terminal history.
--
-- One app-issued UUID identifies a Terminal run independently of provider
-- session ids. The RPC atomically inserts both the attempt row and its
-- code_attempted evidence, and a concurrent retry returns already_recorded.

alter table public.code_lab_attempts
  add column if not exists terminal_attempt_id uuid;

create unique index if not exists code_lab_attempts_user_terminal_attempt_uidx
  on public.code_lab_attempts (user_id, terminal_attempt_id)
  where terminal_attempt_id is not null;

comment on column public.code_lab_attempts.terminal_attempt_id is
  'Stable app-issued idempotency identity for one interactive Terminal run; NULL for non-Terminal attempts.';

create or replace function public.record_terminal_code_attempt(
  p_terminal_attempt_id uuid,
  p_learning_item_id text,
  p_content_version_id uuid,
  p_milestone_index integer,
  p_source_code text,
  p_run_status text,
  p_compile_output text,
  p_stdout text,
  p_stderr text,
  p_skill_ids text[],
  p_event_metadata jsonb
)
returns table (status text, attempt_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_attempt_id uuid;
  v_event_learning_item_id text;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if p_terminal_attempt_id is null or coalesce(p_learning_item_id, '') = '' then
    raise exception 'invalid terminal attempt' using errcode = '22023';
  end if;

  if p_run_status not in (
    'terminal_exited',
    'terminal_stopped',
    'terminal_compile_error',
    'terminal_runtime_error',
    'terminal_timeout',
    'terminal_error'
  ) then
    raise exception 'invalid terminal status' using errcode = '22023';
  end if;

  insert into public.code_lab_attempts (
    user_id,
    terminal_attempt_id,
    learning_item_id,
    content_version_id,
    milestone_index,
    source_code,
    language,
    run_status,
    compile_output,
    stdout,
    stderr,
    tests_passed,
    tests_total,
    ai_review_requested
  ) values (
    v_user,
    p_terminal_attempt_id,
    p_learning_item_id,
    p_content_version_id,
    p_milestone_index,
    p_source_code,
    'cpp',
    p_run_status,
    p_compile_output,
    p_stdout,
    p_stderr,
    null,
    null,
    false
  )
  on conflict (user_id, terminal_attempt_id)
    where terminal_attempt_id is not null
  do nothing
  returning id into v_attempt_id;

  if v_attempt_id is null then
    select a.id
      into v_attempt_id
      from public.code_lab_attempts a
      where a.user_id = v_user
        and a.terminal_attempt_id = p_terminal_attempt_id;

    return query select 'already_recorded'::text, v_attempt_id;
    return;
  end if;

  select li.id
    into v_event_learning_item_id
    from public.learning_items li
    where li.id = p_learning_item_id;

  insert into public.skill_events (
    user_id,
    skill_id,
    learning_item_id,
    event_type,
    metadata
  )
  select
    v_user,
    skills.id,
    v_event_learning_item_id,
    'code_attempted',
    coalesce(p_event_metadata, '{}'::jsonb)
      || jsonb_build_object(
        'itemId', p_learning_item_id,
        'terminalAttemptId', p_terminal_attempt_id,
        'source', 'terminal'
      )
  from unnest(coalesce(p_skill_ids, array[]::text[])) as requested(skill_id)
  join public.skills skills on skills.id = requested.skill_id;

  return query select 'recorded'::text, v_attempt_id;
end;
$$;

revoke all on function public.record_terminal_code_attempt(
  uuid, text, uuid, integer, text, text, text, text, text, text[], jsonb
) from public;

grant execute on function public.record_terminal_code_attempt(
  uuid, text, uuid, integer, text, text, text, text, text, text[], jsonb
) to authenticated;
